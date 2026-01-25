# Scene Compilation Pipeline Specification

## Purpose

Automate the assembly of individual markdown scene files into complete chapters, managing context injection, formatting, continuity checking, and preparation for publishing. This pipeline bridges the gap between granular scene-by-scene writing and finished manuscript production.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Scene Compilation Pipeline                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │  Scene   │ → │  Order   │ → │  Context │ → │ Format & │ → │  Output  │ │
│  │  Loader  │   │  Resolver│   │  Injector│   │  Validate│   │  Writer  │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│       │              │              │              │              │        │
│       ▼              ▼              ▼              ▼              ▼        │
│  Parse scene    Determine      Add headers,   Apply styles,  Generate     │
│  files with     sequence       transitions,   check rules,   chapter      │
│  metadata       from metadata  scene breaks   validate       files        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Scene File Format

### Directory Structure

```
Book_1/
├── chapters/
│   ├── ch001/
│   │   ├── _chapter.yaml       # Chapter metadata
│   │   ├── scene_001.md
│   │   ├── scene_002.md
│   │   └── scene_003.md
│   ├── ch002/
│   │   ├── _chapter.yaml
│   │   ├── scene_001.md
│   │   └── scene_002.md
│   └── ...
├── compiled/
│   ├── chapters/
│   │   ├── chapter_001.md
│   │   ├── chapter_002.md
│   │   └── ...
│   └── manuscript.md           # Full compiled manuscript
└── _book.yaml                  # Book-level metadata
```

### Scene File Structure

```markdown
---
# Scene Metadata (YAML frontmatter)
id: scene_ch001_001
title: "Morning at the Masaki Shrine"
chapter: 1
sequence: 1
pov: sheldon
location: masaki_shrine_grounds
timeline:
  date: "1991-04-15"
  time: "07:30"
  day_number: 1
characters:
  - sheldon
  - katsuhito
  - tenchi
wordcount_target: 2500
status: draft | revision | final
tags:
  - slice-of-life
  - morning-routine
  - character-introduction
plot_threads:
  - thread_id: sheldon_adaptation
    progression: "Sheldon observes shrine morning rituals"
  - thread_id: katsuhito_assessment
    progression: "Katsuhito subtly evaluates Sheldon"
notes: |
  This scene establishes Sheldon's outsider perspective on
  traditional Japanese customs. Keep his scientific curiosity
  prominent but respectful.
---

<!-- Scene Content -->

The shrine grounds were still shrouded in pre-dawn mist when Sheldon...

[Scene content continues...]

---
<!-- Scene-end metadata (optional) -->
transition: time_skip
next_scene_hint: "Later that morning, Tenchi's training session"
---
```

### Chapter Metadata

```yaml
# _chapter.yaml
id: chapter_001
title: "A Stranger in Paradise"
number: 1
book: 1
arc: "arrival"
pov_characters:
  - sheldon
  - tenchi
summary: |
  Sheldon arrives at the Masaki household and begins
  adapting to life in rural Japan while concealing his
  true origins.
themes:
  - fish-out-of-water
  - cultural-adaptation
  - hidden-identity
compilation:
  scene_break_style: "centered_asterisks"  # or "blank_lines", "custom"
  include_scene_headers: false
  transition_style: "smooth"  # or "abrupt", "none"
word_count_target: 8000
status: in_progress
```

## Core Interfaces

```typescript
interface SceneCompiler {
  // Compile single chapter
  compileChapter(chapterPath: string, options?: CompileOptions): Promise<CompiledChapter>;

  // Compile entire book
  compileBook(bookPath: string, options?: CompileOptions): Promise<CompiledBook>;

  // Compile specific scenes into output
  compileScenes(scenePaths: string[], options?: CompileOptions): Promise<string>;

  // Preview compilation without writing
  previewCompilation(chapterPath: string): Promise<CompilationPreview>;

  // Validate scenes before compilation
  validateScenes(scenePaths: string[]): Promise<ValidationResult[]>;
}

interface CompileOptions {
  // Output format
  outputFormat: 'markdown' | 'html' | 'docx' | 'epub';

  // Scene assembly
  sceneBreakStyle: SceneBreakStyle;
  includeSceneHeaders: boolean;
  transitionStyle: TransitionStyle;

  // Context injection
  injectContext: boolean;
  contextSections: ContextSection[];

  // Validation
  validateContinuity: boolean;
  validateWordCount: boolean;
  validateTimeline: boolean;

  // Output
  outputPath?: string;
  createBackup: boolean;
}

interface SceneBreakStyle {
  type: 'asterisks' | 'line' | 'blank_lines' | 'ornament' | 'custom';
  content?: string;  // For custom type
  spacing: {
    before: number;  // Blank lines before
    after: number;   // Blank lines after
  };
}

interface TransitionStyle {
  mode: 'smooth' | 'abrupt' | 'none';
  insertTransitions: boolean;  // Auto-generate transitions
  validateTransitions: boolean;  // Check existing transitions
}

interface ContextSection {
  type: 'chapter_header' | 'epigraph' | 'location_header' | 'time_header' | 'author_note';
  enabled: boolean;
  template?: string;
  position: 'before_content' | 'after_content';
}
```

## Scene Loader

```typescript
interface SceneLoader {
  // Load single scene
  loadScene(scenePath: string): Promise<Scene>;

  // Load all scenes in chapter
  loadChapterScenes(chapterPath: string): Promise<Scene[]>;

  // Load scenes by query
  findScenes(query: SceneQuery): Promise<Scene[]>;

  // Watch for changes
  watchScenes(paths: string[], callback: (changes: SceneChange[]) => void): void;
}

interface Scene {
  // Identifiers
  id: string;
  path: string;

  // Metadata
  metadata: SceneMetadata;

  // Content
  content: string;
  rawContent: string;  // Before any processing

  // Computed
  wordCount: number;
  characterCount: number;
  estimatedReadingTime: number;
}

interface SceneMetadata {
  id: string;
  title: string;
  chapter: number;
  sequence: number;
  pov: string;
  location: string;
  timeline: {
    date: string;
    time?: string;
    dayNumber?: number;
  };
  characters: string[];
  wordCountTarget?: number;
  status: 'draft' | 'revision' | 'final';
  tags: string[];
  plotThreads: PlotThreadProgression[];
  notes?: string;
  transition?: string;
  nextSceneHint?: string;
}

interface SceneQuery {
  chapter?: number;
  pov?: string;
  location?: string;
  dateRange?: { start: string; end: string };
  characters?: string[];
  tags?: string[];
  status?: string;
  plotThread?: string;
}

class SceneLoaderImpl implements SceneLoader {
  async loadScene(scenePath: string): Promise<Scene> {
    const raw = await fs.readFile(scenePath, 'utf-8');
    const { data: metadata, content } = matter(raw);  // gray-matter for frontmatter

    return {
      id: metadata.id || this.generateSceneId(scenePath),
      path: scenePath,
      metadata: this.validateMetadata(metadata),
      content: content.trim(),
      rawContent: raw,
      wordCount: this.countWords(content),
      characterCount: content.length,
      estimatedReadingTime: this.countWords(content) / 250  // ~250 wpm
    };
  }

  async loadChapterScenes(chapterPath: string): Promise<Scene[]> {
    const files = await glob(path.join(chapterPath, 'scene_*.md'));
    const scenes = await Promise.all(files.map(f => this.loadScene(f)));

    // Sort by sequence number
    return scenes.sort((a, b) => a.metadata.sequence - b.metadata.sequence);
  }
}
```

## Order Resolver

Handle scene ordering with explicit sequences, dependencies, and conflict resolution:

```typescript
interface OrderResolver {
  // Determine final scene order
  resolveOrder(scenes: Scene[], chapterMeta: ChapterMetadata): OrderedScene[];

  // Detect ordering conflicts
  detectConflicts(scenes: Scene[]): OrderConflict[];

  // Suggest order based on timeline
  suggestTimelineOrder(scenes: Scene[]): Scene[];
}

interface OrderedScene extends Scene {
  finalSequence: number;
  orderSource: 'explicit' | 'timeline' | 'dependency' | 'inferred';
  gapBefore: boolean;  // Missing scene detected
}

interface OrderConflict {
  type: 'duplicate_sequence' | 'timeline_mismatch' | 'dependency_cycle' | 'gap';
  scenes: string[];
  message: string;
  suggestion: string;
}

class OrderResolverImpl implements OrderResolver {
  resolveOrder(scenes: Scene[], chapterMeta: ChapterMetadata): OrderedScene[] {
    // 1. Check for explicit sequences
    const explicit = scenes.filter(s => s.metadata.sequence !== undefined);
    const implicit = scenes.filter(s => s.metadata.sequence === undefined);

    // 2. Sort explicit by sequence
    explicit.sort((a, b) => a.metadata.sequence - b.metadata.sequence);

    // 3. Place implicit scenes by timeline
    const withTimeline = implicit.filter(s => s.metadata.timeline?.date);
    const withoutTimeline = implicit.filter(s => !s.metadata.timeline?.date);

    withTimeline.sort((a, b) => {
      const dateA = new Date(`${a.metadata.timeline.date}T${a.metadata.timeline.time || '00:00'}`);
      const dateB = new Date(`${b.metadata.timeline.date}T${b.metadata.timeline.time || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });

    // 4. Merge and detect gaps
    const ordered = this.mergeOrdered(explicit, withTimeline, withoutTimeline);

    // 5. Assign final sequences
    return ordered.map((scene, index) => ({
      ...scene,
      finalSequence: index + 1,
      orderSource: scene.metadata.sequence !== undefined ? 'explicit' :
                   scene.metadata.timeline?.date ? 'timeline' : 'inferred',
      gapBefore: this.detectGap(ordered, index)
    }));
  }
}
```

## Context Injector

Add chapter headers, location context, and transitions:

```typescript
interface ContextInjector {
  // Inject all context into compiled chapter
  injectContext(scenes: OrderedScene[], options: ContextOptions): InjectedChapter;

  // Generate chapter header
  generateChapterHeader(chapter: ChapterMetadata): string;

  // Generate scene transitions
  generateTransition(fromScene: Scene, toScene: Scene): string;

  // Generate location headers
  generateLocationHeader(location: string, scene: Scene): string;
}

interface ContextOptions {
  chapterHeader: {
    enabled: boolean;
    template: string;  // Handlebars template
    includeEpigraph: boolean;
  };
  locationHeaders: {
    enabled: boolean;
    onLocationChange: boolean;
    template: string;
  };
  timeHeaders: {
    enabled: boolean;
    onTimeJump: boolean;
    threshold: number;  // Minutes before showing time header
    template: string;
  };
  transitions: {
    enabled: boolean;
    autoGenerate: boolean;
    validateExisting: boolean;
  };
}

interface InjectedChapter {
  header: string;
  scenes: InjectedScene[];
  footer?: string;
  wordCount: number;
}

interface InjectedScene {
  scene: OrderedScene;
  prefix: string;      // Location header, time header, etc.
  content: string;
  suffix: string;      // Transition hint
  sceneBreak: string;  // Break after scene
}

class ContextInjectorImpl implements ContextInjector {
  injectContext(scenes: OrderedScene[], options: ContextOptions): InjectedChapter {
    const injectedScenes: InjectedScene[] = [];
    let previousScene: OrderedScene | null = null;

    for (const scene of scenes) {
      const prefix = this.buildPrefix(scene, previousScene, options);
      const suffix = this.buildSuffix(scene, options);
      const sceneBreak = previousScene ? this.getSceneBreak(options) : '';

      injectedScenes.push({
        scene,
        prefix,
        content: scene.content,
        suffix,
        sceneBreak
      });

      previousScene = scene;
    }

    return {
      header: options.chapterHeader.enabled ?
        this.generateChapterHeader(scenes[0].metadata) : '',
      scenes: injectedScenes,
      wordCount: injectedScenes.reduce((sum, s) =>
        sum + this.countWords(s.prefix + s.content + s.suffix), 0)
    };
  }

  private buildPrefix(
    scene: OrderedScene,
    previous: OrderedScene | null,
    options: ContextOptions
  ): string {
    const parts: string[] = [];

    // Location header on change
    if (options.locationHeaders.enabled && options.locationHeaders.onLocationChange) {
      if (!previous || previous.metadata.location !== scene.metadata.location) {
        parts.push(this.generateLocationHeader(scene.metadata.location, scene));
      }
    }

    // Time header on significant jump
    if (options.timeHeaders.enabled && options.timeHeaders.onTimeJump && previous) {
      const timeDiff = this.calculateTimeDifference(previous, scene);
      if (timeDiff > options.timeHeaders.threshold) {
        parts.push(this.generateTimeHeader(scene, timeDiff));
      }
    }

    return parts.join('\n\n');
  }

  generateTransition(fromScene: Scene, toScene: Scene): string {
    // Analyze the transition type needed
    const transitionType = this.analyzeTransitionType(fromScene, toScene);

    switch (transitionType) {
      case 'time_skip':
        return this.generateTimeSkipTransition(fromScene, toScene);
      case 'location_change':
        return this.generateLocationTransition(fromScene, toScene);
      case 'pov_change':
        return this.generatePOVTransition(fromScene, toScene);
      case 'smooth':
        return ''; // No explicit transition needed
      default:
        return '';
    }
  }

  private analyzeTransitionType(from: Scene, to: Scene): string {
    if (from.metadata.pov !== to.metadata.pov) return 'pov_change';
    if (from.metadata.location !== to.metadata.location) return 'location_change';

    const timeDiff = this.calculateTimeDifference(from, to);
    if (timeDiff > 60) return 'time_skip';  // > 1 hour

    return 'smooth';
  }
}
```

## Format & Validate

```typescript
interface ChapterFormatter {
  // Apply formatting rules
  format(chapter: InjectedChapter, style: FormatStyle): FormattedChapter;

  // Validate against rules
  validate(chapter: FormattedChapter, rules: ValidationRules): ValidationResult;
}

interface FormatStyle {
  // Typography
  typography: {
    smartQuotes: boolean;
    emDashes: boolean;
    ellipsis: boolean;
    sceneSeparator: string;
  };

  // Paragraph formatting
  paragraphs: {
    indentFirst: boolean;
    indentSize: string;  // CSS value
    spacing: 'single' | 'double' | 'custom';
    customSpacing?: string;
  };

  // Chapter formatting
  chapter: {
    headerStyle: 'centered' | 'left' | 'custom';
    numberFormat: 'arabic' | 'roman' | 'word' | 'none';
    titleCase: boolean;
    dropCap: boolean;
  };

  // Scene breaks
  sceneBreaks: {
    style: 'asterisks' | 'line' | 'ornament' | 'blank' | 'custom';
    customContent?: string;
    spacing: number;
  };
}

interface ValidationRules {
  // Content rules
  content: {
    minWordCount?: number;
    maxWordCount?: number;
    forbiddenWords?: string[];
    requiredElements?: string[];  // e.g., 'dialogue', 'description'
  };

  // Continuity rules
  continuity: {
    checkCharacterPresence: boolean;
    checkLocationConsistency: boolean;
    checkTimelineOrder: boolean;
    checkPOVConsistency: boolean;
  };

  // Style rules
  style: {
    maxParagraphLength?: number;
    maxSentenceLength?: number;
    dialogueTagRules?: DialogueTagRule[];
    povViolationCheck: boolean;
  };
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: Suggestion[];
  statistics: ChapterStatistics;
}

interface ValidationError {
  type: string;
  severity: 'error' | 'warning' | 'info';
  location: {
    scene?: string;
    paragraph?: number;
    line?: number;
    character?: number;
  };
  message: string;
  fix?: string;
}

interface ChapterStatistics {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  dialoguePercentage: number;
  averageSentenceLength: number;
  readingLevel: string;  // Flesch-Kincaid or similar
  estimatedReadingTime: number;
  povBreakdowns: Record<string, number>;
  locationBreakdowns: Record<string, number>;
}
```

## Output Writer

```typescript
interface OutputWriter {
  // Write single chapter
  writeChapter(chapter: FormattedChapter, path: string, format: OutputFormat): Promise<void>;

  // Write complete manuscript
  writeManuscript(chapters: FormattedChapter[], path: string, format: OutputFormat): Promise<void>;

  // Generate table of contents
  generateTOC(chapters: FormattedChapter[]): TableOfContents;
}

interface OutputFormat {
  type: 'markdown' | 'html' | 'docx' | 'epub' | 'pdf';
  options: FormatOptions;
}

interface FormatOptions {
  // Markdown options
  markdown?: {
    flavor: 'commonmark' | 'gfm' | 'pandoc';
    includeMetadata: boolean;
    metadataFormat: 'yaml' | 'toml';
  };

  // HTML options
  html?: {
    standalone: boolean;
    cssPath?: string;
    template?: string;
  };

  // DOCX options
  docx?: {
    templatePath?: string;
    styleMap?: Record<string, string>;
  };

  // EPUB options
  epub?: {
    metadata: EPUBMetadata;
    coverImage?: string;
    stylesheet?: string;
  };
}
```

## Pipeline Orchestration

```typescript
class SceneCompilationPipeline {
  private loader: SceneLoader;
  private orderResolver: OrderResolver;
  private contextInjector: ContextInjector;
  private formatter: ChapterFormatter;
  private writer: OutputWriter;

  async compileChapter(chapterPath: string, options: CompileOptions): Promise<CompiledChapter> {
    // 1. Load chapter metadata
    const chapterMeta = await this.loadChapterMetadata(chapterPath);

    // 2. Load all scenes
    const scenes = await this.loader.loadChapterScenes(chapterPath);

    // 3. Resolve ordering
    const orderedScenes = this.orderResolver.resolveOrder(scenes, chapterMeta);

    // 4. Check for conflicts
    const conflicts = this.orderResolver.detectConflicts(orderedScenes);
    if (conflicts.length > 0) {
      throw new CompilationError('Order conflicts detected', conflicts);
    }

    // 5. Inject context
    const injectedChapter = this.contextInjector.injectContext(
      orderedScenes,
      this.buildContextOptions(options)
    );

    // 6. Format
    const formatted = this.formatter.format(injectedChapter, options.formatStyle);

    // 7. Validate
    if (options.validate) {
      const validation = this.formatter.validate(formatted, options.validationRules);
      if (!validation.valid && options.strictValidation) {
        throw new ValidationError('Chapter validation failed', validation);
      }
    }

    // 8. Write output
    if (options.outputPath) {
      await this.writer.writeChapter(formatted, options.outputPath, options.outputFormat);
    }

    return {
      chapter: formatted,
      validation: validation,
      statistics: this.calculateStatistics(formatted),
      path: options.outputPath
    };
  }

  async compileBook(bookPath: string, options: CompileOptions): Promise<CompiledBook> {
    // Load book metadata
    const bookMeta = await this.loadBookMetadata(bookPath);

    // Find all chapter directories
    const chapterDirs = await this.findChapterDirectories(bookPath);

    // Compile each chapter
    const compiledChapters: CompiledChapter[] = [];
    for (const chapterDir of chapterDirs) {
      const compiled = await this.compileChapter(chapterDir, options);
      compiledChapters.push(compiled);
    }

    // Generate front matter
    const frontMatter = await this.generateFrontMatter(bookMeta);

    // Generate back matter
    const backMatter = await this.generateBackMatter(bookMeta, compiledChapters);

    // Write complete manuscript
    if (options.outputPath) {
      await this.writer.writeManuscript(
        compiledChapters,
        options.outputPath,
        options.outputFormat
      );
    }

    return {
      metadata: bookMeta,
      chapters: compiledChapters,
      frontMatter,
      backMatter,
      statistics: this.aggregateStatistics(compiledChapters),
      toc: this.writer.generateTOC(compiledChapters.map(c => c.chapter))
    };
  }
}
```

## Watch Mode for Incremental Compilation

```typescript
class IncrementalCompiler {
  private cache: Map<string, CompiledScene> = new Map();
  private watcher: FSWatcher;

  async watchAndCompile(bookPath: string, options: CompileOptions): Promise<void> {
    // Initial full compilation
    await this.fullCompile(bookPath, options);

    // Set up file watcher
    this.watcher = chokidar.watch(
      path.join(bookPath, '**/*.md'),
      { persistent: true, ignoreInitial: true }
    );

    this.watcher.on('change', async (filePath) => {
      console.log(`Scene changed: ${filePath}`);
      await this.incrementalCompile(filePath, options);
    });

    this.watcher.on('add', async (filePath) => {
      console.log(`New scene: ${filePath}`);
      await this.incrementalCompile(filePath, options);
    });

    this.watcher.on('unlink', async (filePath) => {
      console.log(`Scene deleted: ${filePath}`);
      this.cache.delete(filePath);
      await this.recompileChapter(this.getChapterPath(filePath), options);
    });
  }

  private async incrementalCompile(scenePath: string, options: CompileOptions): Promise<void> {
    // Recompile only the affected chapter
    const chapterPath = this.getChapterPath(scenePath);
    await this.recompileChapter(chapterPath, options);
  }
}
```

## Integration with Story Bible

```typescript
interface StoryBibleIntegration {
  // Validate scene against story bible
  validateAgainstBible(scene: Scene, bible: StoryBible): ValidationResult;

  // Extract entities mentioned in scene
  extractEntities(scene: Scene): ExtractedEntities;

  // Update story bible from scene content
  updateBibleFromScene(scene: Scene, bible: StoryBible): StoryBibleUpdate[];
}

interface ExtractedEntities {
  characters: { name: string; mentions: number; context: string[] }[];
  locations: { name: string; mentions: number; context: string[] }[];
  events: { description: string; date?: string }[];
  items: { name: string; mentions: number }[];
}
```

## Implementation Phases

### Phase 1: Core Pipeline
- [ ] Scene file format specification
- [ ] Scene loader with frontmatter parsing
- [ ] Basic order resolution
- [ ] Simple markdown output

### Phase 2: Context & Formatting
- [ ] Context injection (headers, transitions)
- [ ] Typography formatting
- [ ] Scene break styles
- [ ] Chapter formatting

### Phase 3: Validation
- [ ] Word count validation
- [ ] Continuity checking
- [ ] Timeline validation
- [ ] Style rule enforcement

### Phase 4: Advanced Features
- [ ] Watch mode / incremental compilation
- [ ] Story bible integration
- [ ] Multi-format output (HTML, DOCX)
- [ ] Statistics and reporting
