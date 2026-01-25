# Publishing Templates Specification

## Purpose

Provide professional-quality export capabilities for compiled manuscripts, supporting EPUB, DOCX, PDF, and web serial formats with customizable templates, series-aware formatting, and platform-specific optimizations (Royal Road, AO3, Kindle, print-on-demand).

## Supported Output Formats

| Format | Use Case | Key Features |
|--------|----------|--------------|
| EPUB 3 | E-readers, distribution | Reflowable, accessibility, multimedia |
| DOCX | Editing, submission | Track changes, comments, compatibility |
| PDF | Print, archival | Fixed layout, professional typography |
| HTML | Web serial posting | Platform-specific styling |
| Markdown | Source preservation | Clean, portable, version-control friendly |

## Template System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Publishing Template System                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   Template   │     │   Template   │     │    Output    │                │
│  │   Library    │ ──► │   Renderer   │ ──► │   Writers    │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│         │                    │                    │                         │
│         ▼                    ▼                    ▼                         │
│  - Genre templates    - Variable sub   - EPUB generator                    │
│  - Platform templates - Conditional    - DOCX generator                    │
│  - Custom templates   - Loops/filters  - PDF generator                     │
│  - Style sheets       - Includes       - HTML generator                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Template Definition

### Template Structure

```
templates/
├── epub/
│   ├── fiction-standard/
│   │   ├── template.yaml        # Template metadata
│   │   ├── content.opf.hbs      # OPF template
│   │   ├── toc.ncx.hbs          # NCX navigation
│   │   ├── nav.xhtml.hbs        # EPUB 3 navigation
│   │   ├── chapter.xhtml.hbs    # Chapter template
│   │   ├── frontmatter.xhtml.hbs
│   │   ├── styles/
│   │   │   ├── main.css
│   │   │   └── fonts.css
│   │   └── assets/
│   │       └── fonts/
│   ├── web-serial/
│   │   └── ...
│   └── light-novel/
│       └── ...
├── docx/
│   ├── manuscript-standard/
│   │   ├── template.yaml
│   │   ├── document.xml.hbs
│   │   ├── styles.xml.hbs
│   │   └── reference.docx       # Base document
│   └── submission-format/
│       └── ...
├── pdf/
│   ├── print-6x9/
│   │   ├── template.yaml
│   │   ├── main.tex.hbs         # LaTeX template
│   │   └── preamble.tex
│   └── a4-manuscript/
│       └── ...
└── html/
    ├── royal-road/
    │   ├── template.yaml
    │   ├── chapter.html.hbs
    │   └── styles.css
    ├── ao3/
    │   └── ...
    └── generic-web/
        └── ...
```

### Template Metadata

```yaml
# template.yaml
name: "Fiction Standard EPUB"
id: epub-fiction-standard
version: "1.0.0"
format: epub
description: |
  Standard EPUB 3 template for fiction with professional typography,
  chapter headers, and accessibility features.

# Compatibility
compatibility:
  epubVersion: "3.0"
  validators:
    - epubcheck
    - ace

# Required variables
variables:
  required:
    - title
    - author
    - chapters
  optional:
    - subtitle
    - series
    - seriesNumber
    - coverImage
    - description
    - isbn
    - publisher
    - publicationDate
    - language
    - rights

# Customization options
options:
  typography:
    font:
      type: select
      default: "Literata"
      choices: ["Literata", "Crimson Pro", "Libre Baskerville", "Georgia"]
    fontSize:
      type: number
      default: 16
      min: 12
      max: 24
      unit: px
    lineHeight:
      type: number
      default: 1.6
      min: 1.2
      max: 2.0

  layout:
    chapterStartPage:
      type: select
      default: "right"
      choices: ["right", "any", "left"]
    dropCaps:
      type: boolean
      default: true
    sceneBreakStyle:
      type: select
      default: "asterisks"
      choices: ["asterisks", "ornament", "blank"]

  features:
    tableOfContents:
      type: boolean
      default: true
    landmarks:
      type: boolean
      default: true
    accessibilityFeatures:
      type: boolean
      default: true

# Assets
assets:
  fonts:
    - name: Literata
      files:
        - Literata-Regular.woff2
        - Literata-Italic.woff2
        - Literata-Bold.woff2
  images:
    - scene-break-ornament.svg

# Build hooks
hooks:
  preBuild: null
  postBuild: null
  validate: epubcheck
```

## Core Interfaces

```typescript
interface PublishingEngine {
  // List available templates
  listTemplates(format?: OutputFormat): TemplateInfo[];

  // Load template
  loadTemplate(templateId: string): Promise<Template>;

  // Render manuscript
  render(
    manuscript: CompiledBook,
    template: Template,
    options: RenderOptions
  ): Promise<RenderedOutput>;

  // Export to file
  export(
    output: RenderedOutput,
    path: string
  ): Promise<ExportResult>;

  // Validate output
  validate(output: RenderedOutput): Promise<ValidationResult>;
}

interface Template {
  id: string;
  name: string;
  format: OutputFormat;
  version: string;
  description: string;

  // Template files
  files: TemplateFile[];

  // Variables
  requiredVariables: string[];
  optionalVariables: string[];

  // Options
  options: TemplateOptions;

  // Assets
  assets: TemplateAssets;

  // Render method
  render(context: RenderContext): Promise<RenderedFiles>;
}

interface RenderContext {
  // Manuscript data
  manuscript: CompiledBook;

  // Metadata
  metadata: BookMetadata;

  // Template options
  options: Record<string, any>;

  // Helper functions
  helpers: TemplateHelpers;

  // Filters
  filters: TemplateFilters;
}

interface TemplateHelpers {
  // Text processing
  smartQuotes(text: string): string;
  titleCase(text: string): string;
  sentenceCase(text: string): string;

  // Formatting
  formatDate(date: Date, format: string): string;
  formatNumber(num: number, format: string): string;
  romanNumeral(num: number): string;

  // Content
  excerpt(text: string, length: number): string;
  stripHtml(html: string): string;
  markdownToHtml(md: string): string;

  // Navigation
  chapterUrl(chapter: Chapter): string;
  assetUrl(asset: string): string;
}

interface TemplateFilters {
  escape: (text: string) => string;
  slugify: (text: string) => string;
  truncate: (text: string, length: number) => string;
  wordCount: (text: string) => number;
  readingTime: (text: string) => number;
}
```

## EPUB Generation

```typescript
interface EPUBGenerator {
  // Generate complete EPUB
  generate(
    manuscript: CompiledBook,
    template: EPUBTemplate,
    options: EPUBOptions
  ): Promise<EPUBPackage>;

  // Generate individual components
  generateOPF(context: RenderContext): string;
  generateNCX(context: RenderContext): string;
  generateNav(context: RenderContext): string;
  generateChapter(chapter: FormattedChapter, context: RenderContext): string;

  // Package EPUB
  package(files: EPUBFiles): Promise<Buffer>;

  // Validate EPUB
  validate(epub: Buffer): Promise<EPUBValidationResult>;
}

interface EPUBOptions {
  // EPUB version
  version: '2.0' | '3.0';

  // Cover
  cover?: {
    imagePath: string;
    generateTitlePage: boolean;
  };

  // Typography
  typography: {
    embedFonts: boolean;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
  };

  // Layout
  layout: {
    chapterBreaks: 'page' | 'section';
    sceneBreaks: string;
    dropCaps: boolean;
  };

  // Navigation
  navigation: {
    includeTOC: boolean;
    tocDepth: number;
    includeLandmarks: boolean;
  };

  // Accessibility
  accessibility: {
    includeAriaLabels: boolean;
    alternativeText: boolean;
    readingOrder: boolean;
  };

  // Metadata
  metadata: EPUBMetadata;
}

interface EPUBMetadata {
  title: string;
  creator: string;
  language: string;
  identifier: string;
  publisher?: string;
  date?: string;
  description?: string;
  subject?: string[];
  rights?: string;

  // Series metadata
  series?: {
    name: string;
    position: number;
  };

  // Dublin Core extensions
  contributors?: { role: string; name: string }[];
}

class EPUBGeneratorImpl implements EPUBGenerator {
  async generate(
    manuscript: CompiledBook,
    template: EPUBTemplate,
    options: EPUBOptions
  ): Promise<EPUBPackage> {
    const context = this.buildContext(manuscript, options);

    // Generate all files
    const files: EPUBFiles = {
      mimetype: 'application/epub+zip',
      'META-INF/container.xml': this.generateContainer(),
      'OEBPS/content.opf': this.generateOPF(context),
      'OEBPS/toc.ncx': options.version === '2.0' ? this.generateNCX(context) : null,
      'OEBPS/nav.xhtml': this.generateNav(context),
      'OEBPS/styles/main.css': await template.renderStyles(context),
    };

    // Generate chapter files
    for (const chapter of manuscript.chapters) {
      const filename = `OEBPS/chapter_${chapter.number.toString().padStart(3, '0')}.xhtml`;
      files[filename] = this.generateChapter(chapter.chapter, context);
    }

    // Generate front matter
    if (manuscript.frontMatter) {
      files['OEBPS/frontmatter.xhtml'] = this.generateFrontMatter(manuscript.frontMatter, context);
    }

    // Add cover if provided
    if (options.cover) {
      files['OEBPS/cover.xhtml'] = this.generateCoverPage(options.cover, context);
      files[`OEBPS/images/${path.basename(options.cover.imagePath)}`] =
        await fs.readFile(options.cover.imagePath);
    }

    // Embed fonts if requested
    if (options.typography.embedFonts) {
      const fonts = await template.getFonts();
      for (const font of fonts) {
        files[`OEBPS/fonts/${font.filename}`] = font.data;
      }
    }

    return { files, options };
  }

  generateChapter(chapter: FormattedChapter, context: RenderContext): string {
    const template = Handlebars.compile(context.chapterTemplate);

    return template({
      chapter,
      options: context.options,
      helpers: context.helpers
    });
  }

  async package(files: EPUBFiles): Promise<Buffer> {
    const archive = archiver('zip', { store: true }); // No compression for EPUB

    // mimetype must be first and uncompressed
    archive.append(files.mimetype, { name: 'mimetype', store: true });

    // Add remaining files
    for (const [path, content] of Object.entries(files)) {
      if (path === 'mimetype') continue;
      archive.append(content, { name: path });
    }

    await archive.finalize();
    return archive.toBuffer();
  }
}
```

## DOCX Generation

```typescript
interface DOCXGenerator {
  generate(
    manuscript: CompiledBook,
    template: DOCXTemplate,
    options: DOCXOptions
  ): Promise<Buffer>;
}

interface DOCXOptions {
  // Document settings
  pageSize: 'letter' | 'a4' | 'custom';
  customPageSize?: { width: number; height: number };
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  // Typography
  typography: {
    bodyFont: string;
    headingFont: string;
    fontSize: number;
    lineSpacing: number;
  };

  // Manuscript format
  manuscriptFormat: {
    doubleSpaced: boolean;
    indentParagraphs: boolean;
    pageNumbers: boolean;
    headerContent?: string;  // e.g., "Author / Title"
  };

  // Track changes (for revisions)
  trackChanges: boolean;

  // Comments
  includeComments: boolean;
}

class DOCXGeneratorImpl implements DOCXGenerator {
  async generate(
    manuscript: CompiledBook,
    template: DOCXTemplate,
    options: DOCXOptions
  ): Promise<Buffer> {
    // Use docx library
    const doc = new Document({
      sections: this.buildSections(manuscript, options),
      styles: this.buildStyles(options),
      ...this.buildDocumentProperties(manuscript.metadata)
    });

    return await Packer.toBuffer(doc);
  }

  private buildSections(manuscript: CompiledBook, options: DOCXOptions): ISection[] {
    const sections: ISection[] = [];

    // Title page
    sections.push(this.buildTitlePage(manuscript.metadata));

    // Front matter
    if (manuscript.frontMatter) {
      sections.push(this.buildFrontMatter(manuscript.frontMatter));
    }

    // Chapters
    for (const chapter of manuscript.chapters) {
      sections.push(this.buildChapterSection(chapter.chapter, options));
    }

    return sections;
  }

  private buildChapterSection(chapter: FormattedChapter, options: DOCXOptions): ISection {
    const children: (Paragraph | Table)[] = [];

    // Chapter heading
    children.push(new Paragraph({
      text: `Chapter ${chapter.number}: ${chapter.title}`,
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true
    }));

    // Chapter content
    for (const scene of chapter.scenes) {
      // Scene content paragraphs
      const paragraphs = this.parseContent(scene.content);
      children.push(...paragraphs);

      // Scene break if not last scene
      if (scene !== chapter.scenes[chapter.scenes.length - 1]) {
        children.push(new Paragraph({
          text: '* * *',
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 }
        }));
      }
    }

    return {
      properties: this.buildSectionProperties(options),
      children
    };
  }
}
```

## PDF Generation

```typescript
interface PDFGenerator {
  generate(
    manuscript: CompiledBook,
    template: PDFTemplate,
    options: PDFOptions
  ): Promise<Buffer>;
}

interface PDFOptions {
  // Page setup
  pageSize: 'letter' | 'a4' | 'a5' | '6x9' | '5x8' | 'custom';
  customPageSize?: { width: number; height: number; unit: 'in' | 'mm' };
  margins: {
    top: number;
    bottom: number;
    inner: number;  // Gutter side
    outer: number;
  };

  // Typography
  typography: {
    bodyFont: string;
    headingFont: string;
    fontSize: number;
    lineHeight: number;
  };

  // Layout
  layout: {
    twoSided: boolean;
    chapterStartsRight: boolean;
    runningHeaders: boolean;
    pageNumbers: boolean;
    pageNumberPosition: 'bottom-center' | 'bottom-outside' | 'top-outside';
  };

  // Print-ready
  printReady: {
    bleed: number;  // mm
    cropMarks: boolean;
    colorProfile: 'sRGB' | 'CMYK';
  };
}

class PDFGeneratorImpl implements PDFGenerator {
  async generate(
    manuscript: CompiledBook,
    template: PDFTemplate,
    options: PDFOptions
  ): Promise<Buffer> {
    // Option 1: Use pdf-lib directly
    // Option 2: Generate LaTeX and compile with pdflatex
    // Option 3: Generate HTML and use puppeteer

    if (options.printReady) {
      // Use LaTeX for print-quality output
      return this.generateViaLatex(manuscript, template, options);
    } else {
      // Use puppeteer for simpler output
      return this.generateViaPuppeteer(manuscript, template, options);
    }
  }

  private async generateViaLatex(
    manuscript: CompiledBook,
    template: PDFTemplate,
    options: PDFOptions
  ): Promise<Buffer> {
    // Generate LaTeX source
    const latex = await template.render({
      manuscript,
      options,
      helpers: this.latexHelpers
    });

    // Write to temp directory
    const tempDir = await fs.mkdtemp('epub-pdf-');
    const texPath = path.join(tempDir, 'manuscript.tex');
    await fs.writeFile(texPath, latex);

    // Run pdflatex (twice for TOC/references)
    await this.runPdfLatex(texPath);
    await this.runPdfLatex(texPath);

    // Read output
    const pdfPath = path.join(tempDir, 'manuscript.pdf');
    return fs.readFile(pdfPath);
  }

  private latexHelpers = {
    escapeLatex(text: string): string {
      return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/[&%$#_{}]/g, '\\$&')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
    },

    formatChapterTitle(title: string): string {
      return `\\chapter{${this.escapeLatex(title)}}`;
    }
  };
}
```

## HTML/Web Serial Generation

```typescript
interface HTMLGenerator {
  generate(
    manuscript: CompiledBook,
    template: HTMLTemplate,
    options: HTMLOptions
  ): Promise<HTMLOutput>;
}

interface HTMLOptions {
  // Output mode
  mode: 'single-page' | 'multi-page' | 'chapter-files';

  // Platform optimization
  platform?: 'royal-road' | 'ao3' | 'scribblehub' | 'generic';

  // Styling
  styling: {
    embedCSS: boolean;
    cssPath?: string;
    darkMode: boolean;
  };

  // Features
  features: {
    tableOfContents: boolean;
    chapterNavigation: boolean;
    readingProgress: boolean;
    wordCount: boolean;
  };
}

interface HTMLOutput {
  files: Map<string, string>;
  manifest: HTMLManifest;
}

class HTMLGeneratorImpl implements HTMLGenerator {
  async generate(
    manuscript: CompiledBook,
    template: HTMLTemplate,
    options: HTMLOptions
  ): Promise<HTMLOutput> {
    const files = new Map<string, string>();

    if (options.mode === 'single-page') {
      files.set('index.html', await this.generateSinglePage(manuscript, template, options));
    } else {
      // Generate index
      files.set('index.html', await this.generateIndex(manuscript, template, options));

      // Generate chapter files
      for (const chapter of manuscript.chapters) {
        const filename = `chapter-${chapter.number.toString().padStart(3, '0')}.html`;
        files.set(filename, await this.generateChapterPage(chapter, manuscript, template, options));
      }
    }

    // Platform-specific post-processing
    if (options.platform) {
      this.applyPlatformOptimizations(files, options.platform);
    }

    return {
      files,
      manifest: this.buildManifest(files, manuscript)
    };
  }

  private applyPlatformOptimizations(files: Map<string, string>, platform: string): void {
    for (const [filename, content] of files) {
      let optimized = content;

      switch (platform) {
        case 'royal-road':
          // Royal Road specific formatting
          optimized = this.optimizeForRoyalRoad(optimized);
          break;
        case 'ao3':
          // AO3 specific formatting
          optimized = this.optimizeForAO3(optimized);
          break;
        case 'scribblehub':
          optimized = this.optimizeForScribbleHub(optimized);
          break;
      }

      files.set(filename, optimized);
    }
  }

  private optimizeForRoyalRoad(html: string): string {
    // Royal Road uses specific allowed HTML tags
    // Remove disallowed elements, convert to RR-compatible format
    return html
      // Convert scene breaks to RR style
      .replace(/<hr\s*\/?>/g, '<p style="text-align: center;">* * *</p>')
      // Ensure paragraphs have proper spacing
      .replace(/<p>/g, '<p style="margin-bottom: 1em;">')
      // Convert italics/bold to allowed tags
      .replace(/<em>/g, '<i>').replace(/<\/em>/g, '</i>')
      .replace(/<strong>/g, '<b>').replace(/<\/strong>/g, '</b>');
  }

  private optimizeForAO3(html: string): string {
    // AO3 uses work skins and specific formatting
    return html
      // Use AO3's horizontal rule for scene breaks
      .replace(/<hr\s*\/?>/g, '<p class="center">***</p>')
      // Preserve text alignment with AO3 classes
      .replace(/style="text-align:\s*center;?"/g, 'class="center"');
  }
}
```

## Series-Aware Features

```typescript
interface SeriesPublisher {
  // Publish entire series
  publishSeries(
    series: SeriesMetadata,
    books: CompiledBook[],
    template: Template,
    options: SeriesOptions
  ): Promise<SeriesOutput>;

  // Generate series navigation
  generateSeriesNavigation(series: SeriesMetadata, books: CompiledBook[]): SeriesNavigation;

  // Generate combined TOC
  generateSeriesTOC(books: CompiledBook[]): TableOfContents;
}

interface SeriesMetadata {
  name: string;
  description: string;
  author: string;
  totalBooks: number;
  genres: string[];
  tags: string[];

  // Series-level branding
  branding: {
    logoPath?: string;
    colorScheme?: ColorScheme;
    fontFamily?: string;
  };
}

interface SeriesOptions {
  // Output structure
  outputStructure: 'combined' | 'individual' | 'both';

  // Cross-book features
  crossBookFeatures: {
    combinedGlossary: boolean;
    characterIndex: boolean;
    timelineOverview: boolean;
    mapCollection: boolean;
  };

  // Consistency
  consistency: {
    sharedStylesheet: boolean;
    uniformChapterNumbering: boolean;  // Continue numbers across books
    seriesBranding: boolean;
  };
}
```

## Template Customization

```typescript
interface TemplateCustomizer {
  // Create custom template from base
  createCustomTemplate(
    baseTemplateId: string,
    customizations: TemplateCustomizations
  ): Promise<Template>;

  // Preview customizations
  previewCustomization(
    baseTemplate: Template,
    customizations: TemplateCustomizations,
    sampleContent: string
  ): Promise<string>;

  // Save custom template
  saveCustomTemplate(
    template: Template,
    name: string,
    path?: string
  ): Promise<void>;
}

interface TemplateCustomizations {
  // Style overrides
  styles?: {
    css?: string;
    fonts?: FontOverride[];
    colors?: ColorOverride[];
  };

  // Layout overrides
  layout?: {
    margins?: Margins;
    pageSize?: PageSize;
    columns?: number;
  };

  // Component overrides
  components?: {
    chapterHeader?: string;  // Custom template snippet
    sceneBreak?: string;
    pageHeader?: string;
    pageFooter?: string;
  };

  // Feature toggles
  features?: Record<string, boolean>;
}
```

## Implementation Phases

### Phase 1: Core EPUB
- [ ] Basic EPUB 3 generation
- [ ] Template system foundation
- [ ] Chapter rendering
- [ ] CSS styling
- [ ] Font embedding

### Phase 2: Additional Formats
- [ ] DOCX generation
- [ ] PDF generation (via HTML/puppeteer)
- [ ] HTML web serial output

### Phase 3: Platform Optimization
- [ ] Royal Road optimization
- [ ] AO3 optimization
- [ ] Generic web serial
- [ ] Print-ready PDF (LaTeX)

### Phase 4: Advanced Features
- [ ] Series publishing
- [ ] Template customization UI
- [ ] Batch export
- [ ] Validation and quality checks
