/**
 * Epic Fiction Architect - Import Engine
 *
 * Provides import functionality for external story data sources:
 * - Plain text and Markdown files
 * - Word documents (DOCX)
 * - Scrivener projects
 * - Other Epic Fiction Architect projects
 * - Generic JSON/YAML data
 * - Character sheets and world data
 *
 * Features:
 * - Format detection and parsing
 * - Entity extraction from narrative text
 * - Scene boundary detection
 * - Character mention tracking
 * - Metadata preservation
 * - Merge strategies for existing projects
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Supported import source formats
 */
export enum ImportFormat {
  PLAIN_TEXT = 'plain_text',
  MARKDOWN = 'markdown',
  DOCX = 'docx',
  HTML = 'html',
  RTF = 'rtf',
  EPUB = 'epub',
  SCRIVENER = 'scrivener',
  EFA_PROJECT = 'efa_project',
  JSON = 'json',
  YAML = 'yaml',
  CSV = 'csv'
}

/**
 * Types of content that can be imported
 */
export enum ImportContentType {
  MANUSCRIPT = 'manuscript',
  CHARACTER_DATA = 'character_data',
  WORLD_DATA = 'world_data',
  TIMELINE = 'timeline',
  OUTLINE = 'outline',
  NOTES = 'notes',
  MIXED = 'mixed'
}

/**
 * Import merge strategies
 */
export enum MergeStrategy {
  REPLACE = 'replace',        // Overwrite existing
  APPEND = 'append',          // Add to existing
  MERGE = 'merge',            // Smart merge with conflict detection
  SKIP_EXISTING = 'skip_existing',  // Only import new items
  INTERACTIVE = 'interactive' // Ask for each conflict
}

/**
 * Import status
 */
export enum ImportStatus {
  PENDING = 'pending',
  ANALYZING = 'analyzing',
  READY = 'ready',
  IMPORTING = 'importing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Detected entity from text analysis
 */
export interface DetectedEntity {
  id: string;
  type: 'character' | 'location' | 'faction' | 'item' | 'event' | 'concept';
  name: string;
  aliases: string[];
  mentions: {
    chapterIndex: number;
    sceneIndex: number;
    position: number;
    context: string;
  }[];
  confidence: number;  // 0-100
  suggestedMergeId?: string;  // Existing entity to merge with
}

/**
 * Detected scene boundary
 */
export interface DetectedScene {
  id: string;
  title?: string;
  startPosition: number;
  endPosition: number;
  content: string;
  wordCount: number;

  // Detected elements
  povCharacter?: string;
  location?: string;
  characters: string[];
  timeMarker?: string;

  // Scene type hints
  type?: 'action' | 'dialogue' | 'introspection' | 'description' | 'transition';
}

/**
 * Detected chapter
 */
export interface DetectedChapter {
  id: string;
  number: number;
  title?: string;
  scenes: DetectedScene[];
  wordCount: number;
  startPosition: number;
  endPosition: number;
}

/**
 * Import source configuration
 */
export interface ImportSource {
  id: string;
  format: ImportFormat;
  contentType: ImportContentType;

  // Source data
  filePath?: string;
  content?: string;
  url?: string;

  // Metadata
  originalFileName?: string;
  fileSize?: number;
  encoding?: string;

  // Options
  detectScenes?: boolean;
  detectCharacters?: boolean;
  detectLocations?: boolean;
  preserveFormatting?: boolean;

  createdAt: Date;
}

/**
 * Analysis result for an import source
 */
export interface ImportAnalysis {
  id: string;
  sourceId: string;

  // Content stats
  totalWords: number;
  totalCharacters: number;
  estimatedChapters: number;
  estimatedScenes: number;

  // Detected structure
  chapters: DetectedChapter[];

  // Detected entities
  entities: DetectedEntity[];

  // Potential issues
  warnings: string[];
  errors: string[];

  // Recommendations
  suggestions: string[];

  analyzedAt: Date;
}

/**
 * Import mapping for entity resolution
 */
export interface ImportMapping {
  id: string;
  importedId: string;
  importedName: string;
  importedType: string;

  // Resolution
  resolution: 'create' | 'merge' | 'skip' | 'manual';
  targetEntityId?: string;
  targetEntityName?: string;

  // Conflict info
  hasConflict: boolean;
  conflictDetails?: string;
}

/**
 * Import job configuration
 */
export interface ImportJob {
  id: string;
  projectId: string;
  sourceId: string;
  analysisId?: string;

  // Configuration
  mergeStrategy: MergeStrategy;
  mappings: ImportMapping[];

  // Options
  importChapters: boolean;
  importScenes: boolean;
  importCharacters: boolean;
  importLocations: boolean;
  importRelationships: boolean;
  createTimeline: boolean;

  // Status
  status: ImportStatus;
  progress: number;  // 0-100
  currentStep?: string;

  // Results
  results?: ImportResult;

  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Import result
 */
export interface ImportResult {
  jobId: string;
  success: boolean;

  // Counts
  chaptersImported: number;
  scenesImported: number;
  charactersImported: number;
  charactersmerged: number;
  locationsImported: number;
  relationshipsCreated: number;

  // Issues
  errors: string[];
  warnings: string[];
  skipped: string[];

  // Created entity IDs
  createdIds: Map<string, string>;  // importedId -> newId

  completedAt: Date;
}

/**
 * Import engine configuration
 */
export interface ImportEngineConfig {
  maxFileSizeMB: number;
  enableCharacterDetection: boolean;
  enableLocationDetection: boolean;
  enableSceneDetection: boolean;
  sceneBreakPatterns: string[];
  chapterPatterns: string[];
  characterNamePatterns: string[];
  confidenceThreshold: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: ImportEngineConfig = {
  maxFileSizeMB: 100,
  enableCharacterDetection: true,
  enableLocationDetection: true,
  enableSceneDetection: true,
  sceneBreakPatterns: [
    '^\\*\\s*\\*\\s*\\*',           // * * *
    '^---+$',                        // ---
    '^#{3,}$',                       // ###
    '^~{3,}$',                       // ~~~
    '^\\[Scene Break\\]',            // [Scene Break]
    '^<scene\\s*/?>'                 // <scene> or <scene/>
  ],
  chapterPatterns: [
    '^Chapter\\s+\\d+',              // Chapter 1
    '^CHAPTER\\s+\\d+',              // CHAPTER 1
    '^Chapter\\s+[IVXLCDM]+',        // Chapter IV
    '^Part\\s+\\d+',                 // Part 1
    '^Book\\s+\\d+',                 // Book 1
    '^#\\s+.+$'                      // # Title (Markdown H1)
  ],
  characterNamePatterns: [
    '[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)+',  // Capitalized names
    '(?:Mr|Mrs|Ms|Dr|Lord|Lady|Sir|Dame)\\.?\\s+[A-Z][a-z]+'  // Titles
  ],
  confidenceThreshold: 60
};

// ============================================================================
// IMPORT ENGINE CLASS
// ============================================================================

export class ImportEngine {
  private config: ImportEngineConfig;
  private sources: Map<string, ImportSource> = new Map();
  private analyses: Map<string, ImportAnalysis> = new Map();
  private jobs: Map<string, ImportJob> = new Map();

  constructor(config?: Partial<ImportEngineConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  /**
   * Update configuration
   */
  setConfig(config: Partial<ImportEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ImportEngineConfig {
    return { ...this.config };
  }

  // ==========================================================================
  // SOURCE REGISTRATION
  // ==========================================================================

  /**
   * Register an import source from content string
   */
  registerSourceFromContent(
    content: string,
    format: ImportFormat,
    contentType: ImportContentType = ImportContentType.MANUSCRIPT,
    options?: {
      originalFileName?: string;
      detectScenes?: boolean;
      detectCharacters?: boolean;
      detectLocations?: boolean;
    }
  ): ImportSource {
    const id = uuidv4();

    const source: ImportSource = {
      id,
      format,
      contentType,
      content,
      originalFileName: options?.originalFileName,
      fileSize: content.length,
      encoding: 'utf-8',
      detectScenes: options?.detectScenes ?? this.config.enableSceneDetection,
      detectCharacters: options?.detectCharacters ?? this.config.enableCharacterDetection,
      detectLocations: options?.detectLocations ?? this.config.enableLocationDetection,
      preserveFormatting: true,
      createdAt: new Date()
    };

    this.sources.set(id, source);
    return source;
  }

  /**
   * Register an import source from file path
   */
  registerSourceFromFile(
    filePath: string,
    format?: ImportFormat,
    contentType: ImportContentType = ImportContentType.MANUSCRIPT
  ): ImportSource {
    const id = uuidv4();

    // Auto-detect format from extension if not provided
    const detectedFormat = format ?? this.detectFormatFromPath(filePath);

    const source: ImportSource = {
      id,
      format: detectedFormat,
      contentType,
      filePath,
      originalFileName: filePath.split('/').pop(),
      detectScenes: this.config.enableSceneDetection,
      detectCharacters: this.config.enableCharacterDetection,
      detectLocations: this.config.enableLocationDetection,
      preserveFormatting: true,
      createdAt: new Date()
    };

    this.sources.set(id, source);
    return source;
  }

  /**
   * Detect format from file path extension
   */
  private detectFormatFromPath(filePath: string): ImportFormat {
    const ext = filePath.split('.').pop()?.toLowerCase();

    const formatMap: Record<string, ImportFormat> = {
      'txt': ImportFormat.PLAIN_TEXT,
      'md': ImportFormat.MARKDOWN,
      'markdown': ImportFormat.MARKDOWN,
      'docx': ImportFormat.DOCX,
      'doc': ImportFormat.DOCX,
      'html': ImportFormat.HTML,
      'htm': ImportFormat.HTML,
      'rtf': ImportFormat.RTF,
      'epub': ImportFormat.EPUB,
      'json': ImportFormat.JSON,
      'yaml': ImportFormat.YAML,
      'yml': ImportFormat.YAML,
      'csv': ImportFormat.CSV
    };

    return formatMap[ext ?? ''] ?? ImportFormat.PLAIN_TEXT;
  }

  /**
   * Get a source by ID
   */
  getSource(id: string): ImportSource | undefined {
    return this.sources.get(id);
  }

  /**
   * Remove a source
   */
  removeSource(id: string): boolean {
    return this.sources.delete(id);
  }

  // ==========================================================================
  // CONTENT ANALYSIS
  // ==========================================================================

  /**
   * Analyze an import source
   */
  analyzeSource(sourceId: string): ImportAnalysis {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Source ${sourceId} not found`);
    }

    const content = this.getSourceContent(source);
    const id = uuidv4();

    // Basic stats
    const totalCharacters = content.length;
    const totalWords = this.countWords(content);

    // Detect structure
    const chapters = source.detectScenes !== false
      ? this.detectChapters(content)
      : [];

    // Detect entities
    const entities: DetectedEntity[] = [];

    if (source.detectCharacters !== false) {
      entities.push(...this.detectCharacters(content, chapters));
    }

    if (source.detectLocations !== false) {
      entities.push(...this.detectLocations(content, chapters));
    }

    // Generate warnings and suggestions
    const warnings: string[] = [];
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (totalWords < 100) {
      warnings.push('Content appears very short');
    }

    if (chapters.length === 0) {
      warnings.push('No chapter boundaries detected - content may import as single chapter');
      suggestions.push('Consider adding chapter markers (e.g., "Chapter 1") before import');
    }

    if (entities.filter(e => e.type === 'character').length === 0) {
      warnings.push('No character names detected');
    }

    const duplicateNames = this.findDuplicateEntityNames(entities);
    if (duplicateNames.length > 0) {
      suggestions.push(`Review potential duplicate entities: ${duplicateNames.join(', ')}`);
    }

    const analysis: ImportAnalysis = {
      id,
      sourceId,
      totalWords,
      totalCharacters,
      estimatedChapters: Math.max(1, chapters.length),
      estimatedScenes: chapters.reduce((sum, c) => sum + c.scenes.length, 0),
      chapters,
      entities,
      warnings,
      errors,
      suggestions,
      analyzedAt: new Date()
    };

    this.analyses.set(id, analysis);
    return analysis;
  }

  /**
   * Get source content (handles different source types)
   */
  private getSourceContent(source: ImportSource): string {
    if (source.content) {
      return source.content;
    }

    // In a real implementation, this would read from file
    // For now, return empty string for file-based sources
    // (file reading would be handled by the application layer)
    return '';
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(w => w.length > 0).length;
  }

  /**
   * Detect chapter boundaries
   */
  private detectChapters(content: string): DetectedChapter[] {
    const chapters: DetectedChapter[] = [];
    const lines = content.split('\n');

    const chapterRegexes = this.config.chapterPatterns.map(p => new RegExp(p, 'im'));
    const sceneRegexes = this.config.sceneBreakPatterns.map(p => new RegExp(p, 'im'));

    let currentChapter: DetectedChapter | null = null;
    let currentScene: DetectedScene | null = null;
    let position = 0;
    let sceneContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineStart = position;
      position += line.length + 1; // +1 for newline

      // Check for chapter start
      const isChapterStart = chapterRegexes.some(r => r.test(line));
      if (isChapterStart) {
        // Close current scene and chapter
        if (currentScene && currentChapter) {
          currentScene.endPosition = lineStart;
          currentScene.content = sceneContent.join('\n');
          currentScene.wordCount = this.countWords(currentScene.content);
        }

        if (currentChapter) {
          currentChapter.endPosition = lineStart;
          currentChapter.wordCount = currentChapter.scenes.reduce((sum, s) => sum + s.wordCount, 0);
          chapters.push(currentChapter);
        }

        // Start new chapter
        currentChapter = {
          id: uuidv4(),
          number: chapters.length + 1,
          title: this.extractChapterTitle(line),
          scenes: [],
          wordCount: 0,
          startPosition: lineStart,
          endPosition: position
        };

        // Start new scene
        currentScene = this.createNewScene(position);
        currentChapter.scenes.push(currentScene);
        sceneContent = [];
        continue;
      }

      // Check for scene break
      const isSceneBreak = sceneRegexes.some(r => r.test(line.trim()));
      if (isSceneBreak && currentChapter) {
        // Close current scene
        if (currentScene) {
          currentScene.endPosition = lineStart;
          currentScene.content = sceneContent.join('\n');
          currentScene.wordCount = this.countWords(currentScene.content);
        }

        // Start new scene
        currentScene = this.createNewScene(position);
        currentChapter.scenes.push(currentScene);
        sceneContent = [];
        continue;
      }

      // Add line to current scene
      sceneContent.push(line);
    }

    // Close final scene and chapter
    if (currentScene && currentChapter) {
      currentScene.endPosition = position;
      currentScene.content = sceneContent.join('\n');
      currentScene.wordCount = this.countWords(currentScene.content);
    }

    if (currentChapter) {
      currentChapter.endPosition = position;
      currentChapter.wordCount = currentChapter.scenes.reduce((sum, s) => sum + s.wordCount, 0);
      chapters.push(currentChapter);
    }

    // If no chapters detected, create one containing all content
    if (chapters.length === 0) {
      const singleChapter: DetectedChapter = {
        id: uuidv4(),
        number: 1,
        title: undefined,
        scenes: [{
          id: uuidv4(),
          startPosition: 0,
          endPosition: content.length,
          content: content,
          wordCount: this.countWords(content),
          characters: []
        }],
        wordCount: this.countWords(content),
        startPosition: 0,
        endPosition: content.length
      };
      chapters.push(singleChapter);
    }

    return chapters;
  }

  /**
   * Create a new scene object
   */
  private createNewScene(startPosition: number): DetectedScene {
    return {
      id: uuidv4(),
      startPosition,
      endPosition: startPosition,
      content: '',
      wordCount: 0,
      characters: []
    };
  }

  /**
   * Extract chapter title from line
   */
  private extractChapterTitle(line: string): string | undefined {
    // Remove common prefixes and return the rest
    const cleaned = line
      .replace(/^(Chapter|CHAPTER|Part|PART|Book|BOOK)\s+(\d+|[IVXLCDM]+)/i, '')
      .replace(/^#\s*/, '')
      .replace(/^[:.\-–—]\s*/, '')
      .trim();

    return cleaned.length > 0 ? cleaned : undefined;
  }

  /**
   * Detect character names in content
   */
  private detectCharacters(_content: string, chapters: DetectedChapter[]): DetectedEntity[] {
    const characters: Map<string, DetectedEntity> = new Map();
    const patterns = this.config.characterNamePatterns.map(p => new RegExp(p, 'g'));

    for (let ci = 0; ci < chapters.length; ci++) {
      const chapter = chapters[ci];
      for (let si = 0; si < chapter.scenes.length; si++) {
        const scene = chapter.scenes[si];

        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(scene.content)) !== null) {
            const name = match[0].trim();

            // Skip common false positives
            if (this.isCommonWord(name)) continue;

            const normalizedName = this.normalizeName(name);

            if (!characters.has(normalizedName)) {
              characters.set(normalizedName, {
                id: uuidv4(),
                type: 'character',
                name: normalizedName,
                aliases: [],
                mentions: [],
                confidence: 70
              });
            }

            const entity = characters.get(normalizedName)!;

            // Track alias
            if (name !== normalizedName && !entity.aliases.includes(name)) {
              entity.aliases.push(name);
            }

            // Track mention
            entity.mentions.push({
              chapterIndex: ci,
              sceneIndex: si,
              position: match.index,
              context: this.extractContext(scene.content, match.index, 50)
            });
          }
        }
      }
    }

    // Adjust confidence based on mention count
    for (const entity of characters.values()) {
      if (entity.mentions.length > 10) {
        entity.confidence = Math.min(95, entity.confidence + 15);
      } else if (entity.mentions.length < 3) {
        entity.confidence = Math.max(30, entity.confidence - 20);
      }
    }

    return Array.from(characters.values())
      .filter(e => e.confidence >= this.config.confidenceThreshold);
  }

  /**
   * Detect location names in content
   */
  private detectLocations(_content: string, chapters: DetectedChapter[]): DetectedEntity[] {
    const locations: Map<string, DetectedEntity> = new Map();

    // Location indicators
    const locationPatterns = [
      /(?:in|at|to|from|near|outside|inside|within)\s+(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /(?:city|town|village|kingdom|realm|land|forest|mountain|castle|tower|temple)\s+(?:of\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
    ];

    for (let ci = 0; ci < chapters.length; ci++) {
      const chapter = chapters[ci];
      for (let si = 0; si < chapter.scenes.length; si++) {
        const scene = chapter.scenes[si];

        for (const pattern of locationPatterns) {
          let match;
          while ((match = pattern.exec(scene.content)) !== null) {
            const name = match[1]?.trim();
            if (!name || this.isCommonWord(name)) continue;

            if (!locations.has(name)) {
              locations.set(name, {
                id: uuidv4(),
                type: 'location',
                name,
                aliases: [],
                mentions: [],
                confidence: 60
              });
            }

            const entity = locations.get(name)!;
            entity.mentions.push({
              chapterIndex: ci,
              sceneIndex: si,
              position: match.index,
              context: this.extractContext(scene.content, match.index, 50)
            });
          }
        }
      }
    }

    // Adjust confidence
    for (const entity of locations.values()) {
      if (entity.mentions.length > 5) {
        entity.confidence = Math.min(90, entity.confidence + 15);
      }
    }

    return Array.from(locations.values())
      .filter(e => e.confidence >= this.config.confidenceThreshold);
  }

  /**
   * Check if word is a common false positive
   */
  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'The', 'This', 'That', 'These', 'Those',
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
      'Mr', 'Mrs', 'Ms', 'Dr', 'Sir', 'Lord', 'Lady',
      'Chapter', 'Part', 'Book', 'Scene', 'Act'
    ]);

    return commonWords.has(word) || word.length < 2;
  }

  /**
   * Normalize character name
   */
  private normalizeName(name: string): string {
    return name
      .replace(/^(Mr|Mrs|Ms|Dr|Lord|Lady|Sir|Dame)\.?\s+/i, '')
      .trim();
  }

  /**
   * Extract context around a position
   */
  private extractContext(text: string, position: number, radius: number): string {
    const start = Math.max(0, position - radius);
    const end = Math.min(text.length, position + radius);
    return text.slice(start, end).replace(/\s+/g, ' ').trim();
  }

  /**
   * Find duplicate entity names
   */
  private findDuplicateEntityNames(entities: DetectedEntity[]): string[] {
    const nameCounts = new Map<string, number>();

    for (const entity of entities) {
      const lower = entity.name.toLowerCase();
      nameCounts.set(lower, (nameCounts.get(lower) ?? 0) + 1);
    }

    return Array.from(nameCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([name]) => name);
  }

  // ==========================================================================
  // IMPORT JOB MANAGEMENT
  // ==========================================================================

  /**
   * Create an import job
   */
  createImportJob(
    projectId: string,
    sourceId: string,
    analysisId?: string,
    options?: {
      mergeStrategy?: MergeStrategy;
      importChapters?: boolean;
      importScenes?: boolean;
      importCharacters?: boolean;
      importLocations?: boolean;
      importRelationships?: boolean;
      createTimeline?: boolean;
    }
  ): ImportJob {
    const id = uuidv4();

    // Get analysis to build initial mappings
    let mappings: ImportMapping[] = [];
    if (analysisId) {
      const analysis = this.analyses.get(analysisId);
      if (analysis) {
        mappings = analysis.entities.map(e => ({
          id: uuidv4(),
          importedId: e.id,
          importedName: e.name,
          importedType: e.type,
          resolution: 'create',
          hasConflict: false
        }));
      }
    }

    const job: ImportJob = {
      id,
      projectId,
      sourceId,
      analysisId,
      mergeStrategy: options?.mergeStrategy ?? MergeStrategy.MERGE,
      mappings,
      importChapters: options?.importChapters ?? true,
      importScenes: options?.importScenes ?? true,
      importCharacters: options?.importCharacters ?? true,
      importLocations: options?.importLocations ?? true,
      importRelationships: options?.importRelationships ?? true,
      createTimeline: options?.createTimeline ?? true,
      status: ImportStatus.PENDING,
      progress: 0,
      createdAt: new Date()
    };

    this.jobs.set(id, job);
    return job;
  }

  /**
   * Update entity mapping for an import job
   */
  updateMapping(
    jobId: string,
    mappingId: string,
    resolution: 'create' | 'merge' | 'skip' | 'manual',
    targetEntityId?: string,
    targetEntityName?: string
  ): ImportMapping | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    const mapping = job.mappings.find(m => m.id === mappingId);
    if (!mapping) return undefined;

    mapping.resolution = resolution;
    mapping.targetEntityId = targetEntityId;
    mapping.targetEntityName = targetEntityName;

    return mapping;
  }

  /**
   * Execute an import job
   * Note: This is a framework - actual entity creation would be handled by callbacks
   */
  executeImportJob(
    jobId: string,
    callbacks: {
      createChapter?: (data: DetectedChapter) => string;
      createScene?: (chapterId: string, data: DetectedScene) => string;
      createCharacter?: (data: DetectedEntity) => string;
      createLocation?: (data: DetectedEntity) => string;
      mergeEntity?: (entityId: string, data: DetectedEntity) => void;
    }
  ): ImportResult {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const source = this.sources.get(job.sourceId);
    if (!source) {
      throw new Error(`Source ${job.sourceId} not found`);
    }

    job.status = ImportStatus.IMPORTING;
    job.startedAt = new Date();

    const result: ImportResult = {
      jobId,
      success: true,
      chaptersImported: 0,
      scenesImported: 0,
      charactersImported: 0,
      charactersmerged: 0,
      locationsImported: 0,
      relationshipsCreated: 0,
      errors: [],
      warnings: [],
      skipped: [],
      createdIds: new Map(),
      completedAt: new Date()
    };

    try {
      // Get analysis
      const analysis = job.analysisId ? this.analyses.get(job.analysisId) : null;

      // Import chapters and scenes
      if (job.importChapters && analysis && callbacks.createChapter) {
        const totalChapters = analysis.chapters.length;

        for (let i = 0; i < analysis.chapters.length; i++) {
          const chapter = analysis.chapters[i];
          job.progress = Math.floor((i / totalChapters) * 50);
          job.currentStep = `Importing chapter ${i + 1}`;

          try {
            const chapterId = callbacks.createChapter(chapter);
            result.chaptersImported++;
            result.createdIds.set(chapter.id, chapterId);

            // Import scenes
            if (job.importScenes && callbacks.createScene) {
              for (const scene of chapter.scenes) {
                try {
                  const sceneId = callbacks.createScene(chapterId, scene);
                  result.scenesImported++;
                  result.createdIds.set(scene.id, sceneId);
                } catch (e) {
                  result.warnings.push(`Failed to import scene: ${(e as Error).message}`);
                }
              }
            }
          } catch (e) {
            result.errors.push(`Failed to import chapter ${i + 1}: ${(e as Error).message}`);
          }
        }
      }

      // Import entities
      if (analysis) {
        const entities = analysis.entities;
        const totalEntities = entities.length;

        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          const mapping = job.mappings.find(m => m.importedId === entity.id);
          job.progress = 50 + Math.floor((i / totalEntities) * 50);
          job.currentStep = `Processing ${entity.type}: ${entity.name}`;

          if (!mapping || mapping.resolution === 'skip') {
            result.skipped.push(`${entity.type}: ${entity.name}`);
            continue;
          }

          try {
            if (mapping.resolution === 'merge' && mapping.targetEntityId && callbacks.mergeEntity) {
              callbacks.mergeEntity(mapping.targetEntityId, entity);
              if (entity.type === 'character') {
                result.charactersmerged++;
              }
            } else if (mapping.resolution === 'create') {
              if (entity.type === 'character' && job.importCharacters && callbacks.createCharacter) {
                const id = callbacks.createCharacter(entity);
                result.charactersImported++;
                result.createdIds.set(entity.id, id);
              } else if (entity.type === 'location' && job.importLocations && callbacks.createLocation) {
                const id = callbacks.createLocation(entity);
                result.locationsImported++;
                result.createdIds.set(entity.id, id);
              }
            }
          } catch (e) {
            result.warnings.push(`Failed to process ${entity.type} ${entity.name}: ${(e as Error).message}`);
          }
        }
      }

      job.status = ImportStatus.COMPLETED;
      job.progress = 100;

    } catch (e) {
      result.success = false;
      result.errors.push(`Import failed: ${(e as Error).message}`);
      job.status = ImportStatus.FAILED;
    }

    job.completedAt = new Date();
    result.completedAt = new Date();
    job.results = result;

    return result;
  }

  /**
   * Get import job by ID
   */
  getJob(id: string): ImportJob | undefined {
    return this.jobs.get(id);
  }

  /**
   * Get analysis by ID
   */
  getAnalysis(id: string): ImportAnalysis | undefined {
    return this.analyses.get(id);
  }

  /**
   * Cancel an import job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === ImportStatus.IMPORTING) {
      job.status = ImportStatus.CANCELLED;
      return true;
    }

    return false;
  }

  // ==========================================================================
  // UTILITY
  // ==========================================================================

  /**
   * Get statistics
   */
  getStats(): {
    totalSources: number;
    totalAnalyses: number;
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
  } {
    const jobArray = Array.from(this.jobs.values());

    return {
      totalSources: this.sources.size,
      totalAnalyses: this.analyses.size,
      totalJobs: this.jobs.size,
      completedJobs: jobArray.filter(j => j.status === ImportStatus.COMPLETED).length,
      failedJobs: jobArray.filter(j => j.status === ImportStatus.FAILED).length
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.sources.clear();
    this.analyses.clear();
    this.jobs.clear();
  }
}

export default ImportEngine;
