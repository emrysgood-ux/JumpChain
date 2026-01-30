/**
 * Epic Fiction Architect - Compile/Export Engine
 *
 * Handles compilation of manuscripts to various output formats:
 * - Markdown
 * - DOCX (via docx library)
 * - PDF (via pdf-lib)
 * - EPUB (via epub-gen)
 * - HTML
 * - Plain Text
 * - Fountain (screenplay)
 * - LaTeX
 */

import {DatabaseManager} from '../../db/database';
import type {
  CompilePreset,
  CompileFormat,
  CompileFormatting,
  Container,
  Scene
} from '../../core/types';

// ============================================================================
// COMPILE OPTIONS
// ============================================================================

export interface CompileOptions {
  preset?: CompilePreset;
  format: CompileFormat;
  containerIds?: string[]; // Specific containers to compile
  sceneIds?: string[]; // Specific scenes to compile
  includeComments?: boolean;
  includeSynopses?: boolean;
  includeTitlePage?: boolean;
  includeTableOfContents?: boolean;
  customTitle?: string;
  customAuthor?: string;
}

export interface CompileResult {
  success: boolean;
  format: CompileFormat;
  content: string | Buffer;
  filename: string;
  wordCount: number;
  pageCount?: number;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// COMPILE ENGINE
// ============================================================================

export class CompileEngine {
  private db: DatabaseManager;

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  /**
   * Compile manuscript to specified format
   */
  async compile(projectId: string, options: CompileOptions): Promise<CompileResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get project
    const project = this.db.getProject(projectId);
    if (!project) {
      return {
        success: false,
        format: options.format,
        content: '',
        filename: '',
        wordCount: 0,
        errors: ['Project not found'],
        warnings: []
      };
    }

    // Get manuscript structure
    const containers = this.db.getContainerTree(projectId);

    // Filter to only compilable content
    const compilableContainers = this.filterCompilable(containers, options);

    // Flatten to ordered scenes
    const orderedScenes = this.getOrderedScenes(compilableContainers);

    if (orderedScenes.length === 0) {
      warnings.push('No scenes to compile');
    }

    // Generate content based on format
    let content: string | Buffer;
    let filename: string;

    switch (options.format) {
      case 'markdown':
        content = this.compileToMarkdown(project.name, orderedScenes, compilableContainers, options);
        filename = `${this.sanitizeFilename(options.customTitle ?? project.name)}.md`;
        break;

      case 'plain_text':
        content = this.compileToPlainText(orderedScenes, compilableContainers, options);
        filename = `${this.sanitizeFilename(options.customTitle ?? project.name)}.txt`;
        break;

      case 'html':
        content = this.compileToHtml(project.name, orderedScenes, compilableContainers, options);
        filename = `${this.sanitizeFilename(options.customTitle ?? project.name)}.html`;
        break;

      case 'docx':
        content = await this.compileToDocx(project.name, orderedScenes, compilableContainers, options);
        filename = `${this.sanitizeFilename(options.customTitle ?? project.name)}.docx`;
        break;

      case 'epub':
        content = await this.compileToEpub(project.name, orderedScenes, compilableContainers, options);
        filename = `${this.sanitizeFilename(options.customTitle ?? project.name)}.epub`;
        break;

      case 'pdf':
        content = await this.compileToPdf(project.name, orderedScenes, compilableContainers, options);
        filename = `${this.sanitizeFilename(options.customTitle ?? project.name)}.pdf`;
        break;

      case 'fountain':
        content = this.compileToFountain(orderedScenes, options);
        filename = `${this.sanitizeFilename(options.customTitle ?? project.name)}.fountain`;
        break;

      case 'latex':
        content = this.compileToLatex(project.name, orderedScenes, compilableContainers, options);
        filename = `${this.sanitizeFilename(options.customTitle ?? project.name)}.tex`;
        break;

      default:
        return {
          success: false,
          format: options.format,
          content: '',
          filename: '',
          wordCount: 0,
          errors: [`Unsupported format: ${options.format}`],
          warnings: []
        };
    }

    // Calculate word count
    const wordCount = orderedScenes.reduce((sum, scene) => sum + scene.wordCount, 0);

    return {
      success: errors.length === 0,
      format: options.format,
      content,
      filename,
      wordCount,
      errors,
      warnings
    };
  }

  /**
   * Filter containers to only those marked for compilation
   */
  private filterCompilable(containers: Container[], options: CompileOptions): Container[] {
    return containers
      .filter(c => {
        // Check if explicitly included/excluded
        if (options.containerIds && !options.containerIds.includes(c.id)) {
          return false;
        }
        return c.includeInCompile;
      })
      .map(c => ({
        ...c,
        children: c.children ? this.filterCompilable(c.children as Container[], options) : undefined
      }));
  }

  /**
   * Get all scenes in reading order
   * Bug #14 fix: Convert from recursive to iterative to prevent stack overflow
   */
  private getOrderedScenes(containers: Container[]): Scene[] {
    const scenes: Scene[] = [];

    // Bug #14 fix: Use explicit stack instead of recursion to handle deeply nested containers
    const MAX_DEPTH = 100; // Safety limit to prevent infinite loops
    const stack: Array<{container: Container; depth: number}> = [];

    // Initialize stack with root containers in reverse order (to maintain reading order)
    for (let i = containers.length - 1; i >= 0; i--) {
      stack.push({container: containers[i], depth: 0});
    }

    while (stack.length > 0) {
      const {container, depth} = stack.pop()!;

      // Safety check: prevent infinite loops from circular references
      if (depth > MAX_DEPTH) {
        console.warn(`Container nesting exceeded max depth of ${MAX_DEPTH}: ${container.id}`);
        continue;
      }

      // Get scenes in this container
      const containerScenes = this.db.all<{id: string}>(
        `SELECT id FROM scenes WHERE container_id = ? AND include_in_compile = 1 ORDER BY sort_order`,
        [container.id]
      );

      for (const {id} of containerScenes) {
        const scene = this.db.getScene(id);
        if (scene) {
          scenes.push(scene);
        }
      }

      // Add children to stack in reverse order (to maintain reading order)
      if (container.children) {
        const children = container.children as Container[];
        for (let i = children.length - 1; i >= 0; i--) {
          stack.push({container: children[i], depth: depth + 1});
        }
      }
    }

    return scenes;
  }

  /**
   * Compile to Markdown format
   */
  private compileToMarkdown(
    title: string,
    scenes: Scene[],
    containers: Container[],
    options: CompileOptions
  ): string {
    const lines: string[] = [];

    // Title page
    if (options.includeTitlePage) {
      lines.push(`# ${options.customTitle ?? title}`);
      if (options.customAuthor) {
        lines.push('');
        lines.push(`*By ${options.customAuthor}*`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Table of contents
    if (options.includeTableOfContents) {
      lines.push('## Table of Contents');
      lines.push('');
      this.generateMarkdownToc(containers, lines, 0);
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Content
    this.generateMarkdownContent(containers, scenes, lines, options);

    return lines.join('\n');
  }

  private generateMarkdownToc(containers: Container[], lines: string[], level: number): void {
    const indent = '  '.repeat(level);
    for (const container of containers) {
      if (container.type === 'chapter' || container.type === 'part') {
        lines.push(`${indent}- [${container.title}](#${this.slugify(container.title)})`);
      }
      if (container.children) {
        this.generateMarkdownToc(container.children as Container[], lines, level + 1);
      }
    }
  }

  private generateMarkdownContent(
    containers: Container[],
    allScenes: Scene[],
    lines: string[],
    options: CompileOptions
  ): void {
    for (const container of containers) {
      // Add container header
      const headerLevel = this.getHeaderLevel(container.type);
      if (headerLevel > 0) {
        lines.push(`${'#'.repeat(headerLevel)} ${container.compileAs ?? container.title}`);
        lines.push('');
      }

      // Add synopsis if requested
      if (options.includeSynopses && container.synopsis) {
        lines.push(`*${container.synopsis}*`);
        lines.push('');
      }

      // Add scenes in this container
      const containerScenes = allScenes.filter(s => s.containerId === container.id);
      for (const scene of containerScenes) {
        // Scene separator
        if (containerScenes.indexOf(scene) > 0) {
          lines.push('');
          lines.push('* * *');
          lines.push('');
        }

        // Scene content
        lines.push(scene.content);
        lines.push('');
      }

      // Recurse to children
      if (container.children) {
        this.generateMarkdownContent(container.children as Container[], allScenes, lines, options);
      }

      // Page break after chapters
      if (container.pageBreakBefore && container.type === 'chapter') {
        lines.push('');
        lines.push('<div style="page-break-after: always;"></div>');
        lines.push('');
      }
    }
  }

  /**
   * Compile to plain text format
   */
  private compileToPlainText(
    scenes: Scene[],
    containers: Container[],
    _options: CompileOptions
  ): string {
    const lines: string[] = [];

    const traverse = (items: Container[], level: number) => {
      for (const container of items) {
        // Add container title
        if (container.type === 'chapter' || container.type === 'part') {
          lines.push('');
          lines.push('='.repeat(50));
          lines.push(container.compileAs ?? container.title.toUpperCase());
          lines.push('='.repeat(50));
          lines.push('');
        }

        // Add scenes
        const containerScenes = scenes.filter(s => s.containerId === container.id);
        for (const scene of containerScenes) {
          if (containerScenes.indexOf(scene) > 0) {
            lines.push('');
            lines.push('* * *');
            lines.push('');
          }
          lines.push(this.stripMarkdown(scene.content));
          lines.push('');
        }

        // Recurse
        if (container.children) {
          traverse(container.children as Container[], level + 1);
        }
      }
    };

    traverse(containers, 0);
    return lines.join('\n');
  }

  /**
   * Compile to HTML format
   */
  private compileToHtml(
    title: string,
    scenes: Scene[],
    containers: Container[],
    options: CompileOptions
  ): string {
    const formatting = options.preset?.formatting ?? this.defaultFormatting();

    const bodyContent = this.generateHtmlBody(containers, scenes, options);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(options.customTitle ?? title)}</title>
  <style>
    body {
      font-family: ${formatting.fontFamily}, serif;
      font-size: ${formatting.fontSize}pt;
      line-height: ${formatting.lineSpacing};
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    h1 { text-align: center; margin-bottom: 2em; }
    h2 { margin-top: 3em; }
    h3 { margin-top: 2em; }
    p { text-indent: ${formatting.firstLineIndent}em; margin: 0; }
    p.first { text-indent: 0; }
    .scene-break { text-align: center; margin: 2em 0; }
    .chapter { page-break-before: always; }
    .title-page { text-align: center; margin-bottom: 4em; }
    .toc { margin: 2em 0; }
    .toc ul { list-style: none; padding-left: 1em; }
    .toc a { text-decoration: none; color: inherit; }
    .toc a:hover { text-decoration: underline; }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
  }

  private generateHtmlBody(
    containers: Container[],
    scenes: Scene[],
    options: CompileOptions
  ): string {
    const lines: string[] = [];

    // Title page
    if (options.includeTitlePage) {
      lines.push('<div class="title-page">');
      lines.push(`<h1>${this.escapeHtml(options.customTitle ?? 'Untitled')}</h1>`);
      if (options.customAuthor) {
        lines.push(`<p><em>By ${this.escapeHtml(options.customAuthor)}</em></p>`);
      }
      lines.push('</div>');
    }

    // Table of contents
    if (options.includeTableOfContents) {
      lines.push('<div class="toc">');
      lines.push('<h2>Table of Contents</h2>');
      lines.push('<ul>');
      this.generateHtmlToc(containers, lines);
      lines.push('</ul>');
      lines.push('</div>');
    }

    // Content
    this.generateHtmlContent(containers, scenes, lines, options);

    return lines.join('\n');
  }

  private generateHtmlToc(containers: Container[], lines: string[]): void {
    for (const container of containers) {
      if (container.type === 'chapter' || container.type === 'part') {
        lines.push(`<li><a href="#${this.slugify(container.title)}">${this.escapeHtml(container.title)}</a>`);
        if (container.children && container.children.length > 0) {
          lines.push('<ul>');
          this.generateHtmlToc(container.children as Container[], lines);
          lines.push('</ul>');
        }
        lines.push('</li>');
      }
    }
  }

  private generateHtmlContent(
    containers: Container[],
    allScenes: Scene[],
    lines: string[],
    options: CompileOptions
  ): void {
    for (const container of containers) {
      const headerTag = this.getHtmlHeaderTag(container.type);
      const className = container.type === 'chapter' ? 'chapter' : '';

      if (headerTag) {
        lines.push(`<${headerTag} id="${this.slugify(container.title)}" class="${className}">${this.escapeHtml(container.compileAs ?? container.title)}</${headerTag}>`);
      }

      // Scenes
      const containerScenes = allScenes.filter(s => s.containerId === container.id);
      for (let i = 0; i < containerScenes.length; i++) {
        const scene = containerScenes[i];

        if (i > 0) {
          lines.push('<div class="scene-break">* * *</div>');
        }

        // Convert content to HTML paragraphs
        const paragraphs = scene.content.split(/\n\n+/);
        for (let j = 0; j < paragraphs.length; j++) {
          const p = paragraphs[j].trim();
          if (p) {
            const cls = j === 0 ? 'first' : '';
            lines.push(`<p class="${cls}">${this.markdownToHtml(p)}</p>`);
          }
        }
      }

      // Recurse
      if (container.children) {
        this.generateHtmlContent(container.children as Container[], allScenes, lines, options);
      }
    }
  }

  /**
   * Compile to DOCX format
   * Note: In production, use the `docx` npm package
   */
  private async compileToDocx(
    title: string,
    scenes: Scene[],
    containers: Container[],
    options: CompileOptions
  ): Promise<Buffer> {
    // Placeholder - in production, use docx library
    // import { Document, Packer, Paragraph, TextRun } from 'docx';

    const markdown = this.compileToMarkdown(title, scenes, containers, options);

    // For now, return a placeholder that indicates DOCX would be generated
    const placeholder = `DOCX Export Placeholder\n\nTitle: ${title}\nWord Count: ${scenes.reduce((s, sc) => s + sc.wordCount, 0)}\n\n---\n\n${markdown}`;

    return Buffer.from(placeholder, 'utf-8');
  }

  /**
   * Compile to EPUB format
   * Note: In production, use the `epub-gen` npm package
   */
  private async compileToEpub(
    title: string,
    scenes: Scene[],
    containers: Container[],
    options: CompileOptions
  ): Promise<Buffer> {
    // Placeholder - in production, use epub-gen library
    const html = this.compileToHtml(title, scenes, containers, options);

    const placeholder = `EPUB Export Placeholder\n\nTitle: ${title}\n\n${html}`;

    return Buffer.from(placeholder, 'utf-8');
  }

  /**
   * Compile to PDF format
   * Note: In production, use pdf-lib or puppeteer
   */
  private async compileToPdf(
    title: string,
    scenes: Scene[],
    containers: Container[],
    options: CompileOptions
  ): Promise<Buffer> {
    // Placeholder - in production, use pdf-lib or puppeteer
    const html = this.compileToHtml(title, scenes, containers, options);

    const placeholder = `PDF Export Placeholder\n\nTitle: ${title}\n\n${html}`;

    return Buffer.from(placeholder, 'utf-8');
  }

  /**
   * Compile to Fountain (screenplay) format
   */
  private compileToFountain(scenes: Scene[], options: CompileOptions): string {
    const lines: string[] = [];

    // Title page
    if (options.includeTitlePage) {
      lines.push(`Title: ${options.customTitle ?? 'Untitled'}`);
      if (options.customAuthor) {
        lines.push(`Author: ${options.customAuthor}`);
      }
      lines.push('');
      lines.push('===');
      lines.push('');
    }

    // Scene content (basic conversion)
    for (const scene of scenes) {
      lines.push(`INT. ${scene.title.toUpperCase()} - DAY`);
      lines.push('');
      lines.push(scene.content);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Compile to LaTeX format
   */
  private compileToLatex(
    title: string,
    scenes: Scene[],
    containers: Container[],
    options: CompileOptions
  ): string {
    const formatting = options.preset?.formatting ?? this.defaultFormatting();

    const lines: string[] = [];

    // Preamble
    lines.push('\\documentclass[12pt]{book}');
    lines.push('\\usepackage[utf8]{inputenc}');
    lines.push('\\usepackage{geometry}');
    lines.push(`\\geometry{papersize={${formatting.pageSize === '6x9' ? '6in,9in' : 'letterpaper'}}}`);
    lines.push('');
    lines.push(`\\title{${this.escapeLatex(options.customTitle ?? title)}}`);
    if (options.customAuthor) {
      lines.push(`\\author{${this.escapeLatex(options.customAuthor)}}`);
    }
    lines.push('');
    lines.push('\\begin{document}');
    lines.push('');

    if (options.includeTitlePage) {
      lines.push('\\maketitle');
      lines.push('');
    }

    if (options.includeTableOfContents) {
      lines.push('\\tableofcontents');
      lines.push('\\newpage');
      lines.push('');
    }

    // Content
    this.generateLatexContent(containers, scenes, lines, options);

    lines.push('');
    lines.push('\\end{document}');

    return lines.join('\n');
  }

  private generateLatexContent(
    containers: Container[],
    allScenes: Scene[],
    lines: string[],
    options: CompileOptions
  ): void {
    for (const container of containers) {
      const command = this.getLatexCommand(container.type);
      if (command) {
        lines.push(`\\${command}{${this.escapeLatex(container.compileAs ?? container.title)}}`);
        lines.push('');
      }

      // Scenes
      const containerScenes = allScenes.filter(s => s.containerId === container.id);
      for (let i = 0; i < containerScenes.length; i++) {
        const scene = containerScenes[i];

        if (i > 0) {
          lines.push('');
          lines.push('\\begin{center}* * *\\end{center}');
          lines.push('');
        }

        // Convert content to LaTeX
        const paragraphs = scene.content.split(/\n\n+/);
        for (const p of paragraphs) {
          if (p.trim()) {
            lines.push(this.escapeLatex(p.trim()));
            lines.push('');
          }
        }
      }

      // Recurse
      if (container.children) {
        this.generateLatexContent(container.children as Container[], allScenes, lines, options);
      }
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private defaultFormatting(): CompileFormatting {
    return {
      fontFamily: 'Georgia',
      fontSize: 12,
      lineSpacing: 1.5,
      paragraphSpacing: 0,
      firstLineIndent: 0.5,
      pageSize: 'letter',
      margins: {top: 1, bottom: 1, left: 1, right: 1}
    };
  }

  private getHeaderLevel(containerType: Container['type']): number {
    switch (containerType) {
      case 'book':
        return 1;
      case 'part':
        return 2;
      case 'arc':
        return 2;
      case 'chapter':
        return 3;
      default:
        return 0;
    }
  }

  private getHtmlHeaderTag(containerType: Container['type']): string | null {
    switch (containerType) {
      case 'book':
        return 'h1';
      case 'part':
        return 'h2';
      case 'arc':
        return 'h2';
      case 'chapter':
        return 'h3';
      default:
        return null;
    }
  }

  private getLatexCommand(containerType: Container['type']): string | null {
    switch (containerType) {
      case 'part':
        return 'part';
      case 'chapter':
        return 'chapter';
      case 'arc':
        return 'chapter';
      default:
        return null;
    }
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-z0-9_-]/gi, '_').substring(0, 100);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private escapeLatex(text: string): string {
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[&%$#_{}]/g, '\\$&')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}');
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/^#+\s*/gm, '')
      .replace(/^[-*]\s+/gm, '• ');
  }

  /**
   * Convert markdown to HTML with proper escaping
   * Bug #15 fix: Escape HTML entities BEFORE converting markdown to prevent XSS
   */
  private markdownToHtml(text: string): string {
    // Bug #15 fix: First escape HTML to prevent injection attacks
    const escaped = this.escapeHtml(text);

    // Then convert markdown syntax to HTML
    return escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  }
}

// ============================================================================
// COMPILE PRESET TEMPLATES
// ============================================================================

export const compilePresetTemplates = {
  manuscript: {
    name: 'Standard Manuscript',
    format: 'docx' as CompileFormat,
    formatting: {
      fontFamily: 'Courier New',
      fontSize: 12,
      lineSpacing: 2,
      paragraphSpacing: 0,
      firstLineIndent: 0.5,
      pageSize: 'letter' as const,
      margins: {top: 1, bottom: 1, left: 1, right: 1}
    }
  },

  paperback: {
    name: 'Paperback (6x9)',
    format: 'pdf' as CompileFormat,
    formatting: {
      fontFamily: 'Georgia',
      fontSize: 11,
      lineSpacing: 1.3,
      paragraphSpacing: 0,
      firstLineIndent: 0.3,
      pageSize: '6x9' as const,
      margins: {top: 0.75, bottom: 0.75, left: 0.75, right: 0.75}
    }
  },

  ebook: {
    name: 'E-Book (EPUB)',
    format: 'epub' as CompileFormat,
    formatting: {
      fontFamily: 'Georgia',
      fontSize: 16,
      lineSpacing: 1.5,
      paragraphSpacing: 0.5,
      firstLineIndent: 0,
      pageSize: 'letter' as const,
      margins: {top: 0.5, bottom: 0.5, left: 0.5, right: 0.5}
    }
  },

  webSerial: {
    name: 'Web Serial (HTML)',
    format: 'html' as CompileFormat,
    formatting: {
      fontFamily: 'Georgia',
      fontSize: 18,
      lineSpacing: 1.8,
      paragraphSpacing: 1,
      firstLineIndent: 0,
      pageSize: 'letter' as const,
      margins: {top: 1, bottom: 1, left: 1, right: 1}
    }
  }
};
