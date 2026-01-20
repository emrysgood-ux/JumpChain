/**
 * Chapter Management System
 *
 * Manages 12,000+ chapters with comprehensive metadata tracking,
 * cross-referencing, and error prevention for massive narratives.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

export enum ChapterStatus {
  PLANNED = 'planned',
  OUTLINED = 'outlined',
  DRAFTED = 'drafted',
  REVISED = 'revised',
  EDITED = 'edited',
  FINAL = 'final',
  PUBLISHED = 'published'
}

export enum ChapterType {
  PROLOGUE = 'prologue',
  REGULAR = 'regular',
  INTERLUDE = 'interlude',
  FLASHBACK = 'flashback',
  FLASH_FORWARD = 'flash_forward',
  EPILOGUE = 'epilogue',
  BONUS = 'bonus',
  SIDE_STORY = 'side_story'
}

export enum POVType {
  FIRST_PERSON = 'first_person',
  SECOND_PERSON = 'second_person',
  THIRD_LIMITED = 'third_limited',
  THIRD_OMNISCIENT = 'third_omniscient',
  MULTIPLE = 'multiple',
  EPISTOLARY = 'epistolary',
  STREAM_OF_CONSCIOUSNESS = 'stream_of_consciousness'
}

export enum SceneType {
  ACTION = 'action',
  DIALOGUE = 'dialogue',
  EXPOSITION = 'exposition',
  DESCRIPTION = 'description',
  INTROSPECTION = 'introspection',
  FLASHBACK = 'flashback',
  DREAM = 'dream',
  TRANSITION = 'transition'
}

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  TIMELINE = 'timeline',
  CHARACTER = 'character',
  LOCATION = 'location',
  CONTINUITY = 'continuity',
  WORLD_LOGIC = 'world_logic',
  PLOT = 'plot',
  NAMING = 'naming',
  RELATIONSHIP = 'relationship',
  MAGIC_SYSTEM = 'magic_system',
  ECONOMY = 'economy',
  CULTURE = 'culture',
  REFERENCE = 'reference'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface TimelinePosition {
  year: number;
  month?: number;
  day?: number;
  hour?: number;
  era?: string;
  relative?: string;        // "3 days after Battle of X"
  approximate?: boolean;
  calendarSystem?: string;
}

export interface EntityMention {
  entityId: string;
  entityType: 'character' | 'location' | 'item' | 'organization' | 'species' | 'concept' | 'event';
  entityName: string;
  firstMention: boolean;
  context: string;          // Surrounding text snippet
  lineNumber?: number;
  significance: 'minor' | 'moderate' | 'major' | 'critical';
}

export interface CharacterState {
  characterId: string;
  name: string;
  age?: number;
  location?: string;
  status: 'alive' | 'dead' | 'unknown' | 'transformed' | 'missing';
  health?: string;
  emotionalState?: string;
  knownInformation: string[];  // What this character knows at this point
  relationships: { characterId: string; relationship: string; status: string }[];
  inventory?: string[];
  abilities?: string[];
  injuries?: string[];
  secrets?: string[];
}

export interface SceneData {
  id: string;
  sceneNumber: number;
  type: SceneType;
  location: string;
  locationId?: string;
  timePosition: TimelinePosition;
  duration?: string;        // "2 hours", "overnight"
  weather?: string;
  charactersPresent: string[];
  povCharacter?: string;
  summary: string;
  wordCount?: number;
  tension: number;          // 1-10
  pacing: 'slow' | 'moderate' | 'fast' | 'breakneck';
  tags: string[];
}

export interface PlotThread {
  id: string;
  name: string;
  description: string;
  status: 'introduced' | 'developing' | 'climax' | 'resolved' | 'abandoned';
  introducedChapter: number;
  lastMentionedChapter: number;
  resolvedChapter?: number;
  relatedCharacters: string[];
  relatedEvents: string[];
  priority: 'main' | 'major' | 'minor' | 'background';
  foreshadowing: { chapterNumber: number; description: string }[];
  payoffs: { chapterNumber: number; description: string }[];
}

export interface ChapterConnection {
  targetChapter: number;
  connectionType: 'continues_from' | 'leads_to' | 'parallel_to' | 'references' | 'foreshadows' | 'callbacks_to';
  description: string;
  strength: 'weak' | 'moderate' | 'strong' | 'critical';
}

export interface ValidationError {
  id: string;
  chapterId: string;
  chapterNumber: number;
  category: ErrorCategory;
  severity: ErrorSeverity;
  title: string;
  description: string;
  location?: string;        // Line number or scene
  suggestion?: string;
  relatedEntities?: string[];
  autoFixable: boolean;
  fixed: boolean;
  fixedAt?: Date;
  createdAt: Date;
}

export interface ChapterMetrics {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  dialoguePercentage: number;
  avgSentenceLength: number;
  readingTime: number;      // Minutes
  fleschKincaid?: number;
  uniqueWords: number;
  adverbCount: number;
  passiveVoiceCount: number;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  type: ChapterType;
  status: ChapterStatus;

  // Content
  content?: string;
  outline?: string;
  notes?: string;
  scenes: SceneData[];

  // Timeline
  timelineStart: TimelinePosition;
  timelineEnd: TimelinePosition;
  timeElapsed?: string;

  // POV
  povType: POVType;
  povCharacter?: string;
  povCharacters?: string[];  // For multiple POV

  // Entities
  entityMentions: EntityMention[];
  characterStates: CharacterState[];
  locationsVisited: string[];
  itemsUsed: string[];
  abilitiesUsed: string[];

  // Plot
  plotThreads: string[];    // PlotThread IDs active in this chapter
  plotAdvancement: { threadId: string; advancement: string }[];
  cliffhanger?: string;
  hooks: string[];          // Hooks for future chapters

  // Connections
  connections: ChapterConnection[];
  arcId?: string;           // Story arc this belongs to
  volumeId?: string;        // Volume/book this belongs to

  // Validation
  errors: ValidationError[];
  lastValidated?: Date;
  validationScore: number;  // 0-100

  // Metrics
  metrics?: ChapterMetrics;

  // Metadata
  tags: string[];
  mood: string[];
  themes: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface StoryArc {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'major' | 'minor' | 'character' | 'world';
  chapters: number[];       // Chapter numbers
  startChapter: number;
  endChapter?: number;
  status: 'planned' | 'in_progress' | 'completed';
  plotThreads: string[];
  mainCharacters: string[];
  themes: string[];
  notes?: string;
}

export interface Volume {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  chapters: number[];       // Chapter numbers
  arcs: string[];           // Arc IDs
  wordCount: number;
  synopsis?: string;
  coverNotes?: string;
  publishedAt?: Date;
}

export interface StoryState {
  currentTimeline: TimelinePosition;
  activeCharacters: Map<string, CharacterState>;
  activeLocations: Set<string>;
  activePlotThreads: Set<string>;
  worldState: Record<string, any>;
  factions: Record<string, { status: string; relations: Record<string, string> }>;
  deaths: { characterId: string; chapter: number; cause: string }[];
  births: { characterId: string; chapter: number }[];
  marriages: { characters: string[]; chapter: number }[];
  wars: { id: string; belligerents: string[]; startChapter: number; endChapter?: number }[];
}

// ============================================================================
// CHAPTER MANAGER CLASS
// ============================================================================

export class ChapterManager {
  private chapters: Map<number, Chapter> = new Map();
  private chaptersById: Map<string, Chapter> = new Map();
  private plotThreads: Map<string, PlotThread> = new Map();
  private arcs: Map<string, StoryArc> = new Map();
  private volumes: Map<string, Volume> = new Map();
  private storyState: StoryState;
  private errors: ValidationError[] = [];

  constructor() {
    this.storyState = this.initializeStoryState();
  }

  private initializeStoryState(): StoryState {
    return {
      currentTimeline: { year: 0 },
      activeCharacters: new Map(),
      activeLocations: new Set(),
      activePlotThreads: new Set(),
      worldState: {},
      factions: {},
      deaths: [],
      births: [],
      marriages: [],
      wars: []
    };
  }

  // ==========================================================================
  // CHAPTER CRUD
  // ==========================================================================

  createChapter(data: Partial<Chapter> & { number: number; title: string }): Chapter {
    if (this.chapters.has(data.number)) {
      throw new Error(`Chapter ${data.number} already exists`);
    }

    const chapter: Chapter = {
      id: uuidv4(),
      number: data.number,
      title: data.title,
      subtitle: data.subtitle,
      type: data.type || ChapterType.REGULAR,
      status: data.status || ChapterStatus.PLANNED,

      content: data.content,
      outline: data.outline,
      notes: data.notes,
      scenes: data.scenes || [],

      timelineStart: data.timelineStart || { year: 0 },
      timelineEnd: data.timelineEnd || data.timelineStart || { year: 0 },
      timeElapsed: data.timeElapsed,

      povType: data.povType || POVType.THIRD_LIMITED,
      povCharacter: data.povCharacter,
      povCharacters: data.povCharacters,

      entityMentions: data.entityMentions || [],
      characterStates: data.characterStates || [],
      locationsVisited: data.locationsVisited || [],
      itemsUsed: data.itemsUsed || [],
      abilitiesUsed: data.abilitiesUsed || [],

      plotThreads: data.plotThreads || [],
      plotAdvancement: data.plotAdvancement || [],
      cliffhanger: data.cliffhanger,
      hooks: data.hooks || [],

      connections: data.connections || [],
      arcId: data.arcId,
      volumeId: data.volumeId,

      errors: [],
      validationScore: 100,

      metrics: data.metrics,

      tags: data.tags || [],
      mood: data.mood || [],
      themes: data.themes || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.chapters.set(chapter.number, chapter);
    this.chaptersById.set(chapter.id, chapter);

    return chapter;
  }

  getChapter(number: number): Chapter | undefined {
    return this.chapters.get(number);
  }

  getChapterById(id: string): Chapter | undefined {
    return this.chaptersById.get(id);
  }

  getAllChapters(): Chapter[] {
    return Array.from(this.chapters.values()).sort((a, b) => a.number - b.number);
  }

  getChapterRange(start: number, end: number): Chapter[] {
    return this.getAllChapters().filter(c => c.number >= start && c.number <= end);
  }

  updateChapter(number: number, updates: Partial<Chapter>): Chapter | undefined {
    const chapter = this.chapters.get(number);
    if (!chapter) return undefined;

    const updated = { ...chapter, ...updates, updatedAt: new Date() };
    this.chapters.set(number, updated);
    this.chaptersById.set(updated.id, updated);

    return updated;
  }

  deleteChapter(number: number): boolean {
    const chapter = this.chapters.get(number);
    if (!chapter) return false;

    this.chaptersById.delete(chapter.id);
    return this.chapters.delete(number);
  }

  getTotalChapters(): number {
    return this.chapters.size;
  }

  // ==========================================================================
  // BULK CHAPTER CREATION
  // ==========================================================================

  createChapterBatch(count: number, startNumber: number = 1, template?: Partial<Chapter>): Chapter[] {
    const chapters: Chapter[] = [];

    for (let i = 0; i < count; i++) {
      const chapterNumber = startNumber + i;
      const chapter = this.createChapter({
        number: chapterNumber,
        title: `Chapter ${chapterNumber}`,
        ...template
      });
      chapters.push(chapter);
    }

    return chapters;
  }

  /**
   * Create all 12,008 chapters with basic structure
   */
  initializeFullStory(chapterCount: number = 12008, volumeSize: number = 100): {
    chapters: Chapter[];
    volumes: Volume[];
    arcs: StoryArc[];
  } {
    const chapters: Chapter[] = [];
    const volumes: Volume[] = [];
    const arcs: StoryArc[] = [];

    // Create volumes
    const volumeCount = Math.ceil(chapterCount / volumeSize);
    for (let v = 0; v < volumeCount; v++) {
      const volumeChapters: number[] = [];
      const startChapter = v * volumeSize + 1;
      const endChapter = Math.min((v + 1) * volumeSize, chapterCount);

      for (let c = startChapter; c <= endChapter; c++) {
        volumeChapters.push(c);
      }

      const volume = this.createVolume({
        number: v + 1,
        title: `Volume ${v + 1}`,
        chapters: volumeChapters
      });
      volumes.push(volume);
    }

    // Create chapters
    for (let i = 1; i <= chapterCount; i++) {
      const volumeNumber = Math.ceil(i / volumeSize);
      const volume = volumes[volumeNumber - 1];

      const chapter = this.createChapter({
        number: i,
        title: `Chapter ${i}`,
        volumeId: volume?.id,
        timelineStart: { year: Math.floor(i / 100) }, // Rough timeline
        status: ChapterStatus.PLANNED
      });
      chapters.push(chapter);
    }

    // Create major story arcs (every ~500 chapters)
    const arcSize = 500;
    const arcCount = Math.ceil(chapterCount / arcSize);
    for (let a = 0; a < arcCount; a++) {
      const startChapter = a * arcSize + 1;
      const endChapter = Math.min((a + 1) * arcSize, chapterCount);
      const arcChapters: number[] = [];
      for (let c = startChapter; c <= endChapter; c++) {
        arcChapters.push(c);
      }

      const arc = this.createArc({
        name: `Arc ${a + 1}`,
        description: `Major story arc ${a + 1}`,
        type: 'major',
        chapters: arcChapters,
        startChapter,
        endChapter
      });
      arcs.push(arc);
    }

    return { chapters, volumes, arcs };
  }

  // ==========================================================================
  // PLOT THREAD MANAGEMENT
  // ==========================================================================

  createPlotThread(data: Partial<PlotThread> & { name: string; introducedChapter: number }): PlotThread {
    const thread: PlotThread = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      status: 'introduced',
      introducedChapter: data.introducedChapter,
      lastMentionedChapter: data.introducedChapter,
      relatedCharacters: data.relatedCharacters || [],
      relatedEvents: data.relatedEvents || [],
      priority: data.priority || 'minor',
      foreshadowing: data.foreshadowing || [],
      payoffs: data.payoffs || []
    };

    this.plotThreads.set(thread.id, thread);
    this.storyState.activePlotThreads.add(thread.id);

    return thread;
  }

  getPlotThread(id: string): PlotThread | undefined {
    return this.plotThreads.get(id);
  }

  getAllPlotThreads(): PlotThread[] {
    return Array.from(this.plotThreads.values());
  }

  getActivePlotThreads(): PlotThread[] {
    return this.getAllPlotThreads().filter(t => t.status !== 'resolved' && t.status !== 'abandoned');
  }

  updatePlotThread(id: string, chapterNumber: number, updates: Partial<PlotThread>): PlotThread | undefined {
    const thread = this.plotThreads.get(id);
    if (!thread) return undefined;

    const updated: PlotThread = {
      ...thread,
      ...updates,
      lastMentionedChapter: chapterNumber
    };

    this.plotThreads.set(id, updated);
    return updated;
  }

  resolvePlotThread(id: string, chapterNumber: number): PlotThread | undefined {
    const thread = this.plotThreads.get(id);
    if (!thread) return undefined;

    thread.status = 'resolved';
    thread.resolvedChapter = chapterNumber;
    this.storyState.activePlotThreads.delete(id);

    return thread;
  }

  /**
   * Find plot threads that haven't been mentioned in X chapters
   */
  findNeglectedPlotThreads(currentChapter: number, threshold: number = 50): PlotThread[] {
    return this.getActivePlotThreads().filter(
      t => currentChapter - t.lastMentionedChapter > threshold
    );
  }

  /**
   * Find unresolved plot threads that should have been resolved by now
   */
  findOverduePlotThreads(currentChapter: number): PlotThread[] {
    return this.getActivePlotThreads().filter(t => {
      const age = currentChapter - t.introducedChapter;
      // Main plots should resolve within 1000 chapters
      // Major plots within 500
      // Minor plots within 200
      const maxAge = t.priority === 'main' ? 1000 :
                     t.priority === 'major' ? 500 :
                     t.priority === 'minor' ? 200 : 100;
      return age > maxAge;
    });
  }

  // ==========================================================================
  // STORY ARC MANAGEMENT
  // ==========================================================================

  createArc(data: Partial<StoryArc> & { name: string }): StoryArc {
    const arc: StoryArc = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      type: data.type || 'minor',
      chapters: data.chapters || [],
      startChapter: data.startChapter || 1,
      endChapter: data.endChapter,
      status: data.status || 'planned',
      plotThreads: data.plotThreads || [],
      mainCharacters: data.mainCharacters || [],
      themes: data.themes || [],
      notes: data.notes
    };

    this.arcs.set(arc.id, arc);
    return arc;
  }

  getArc(id: string): StoryArc | undefined {
    return this.arcs.get(id);
  }

  getAllArcs(): StoryArc[] {
    return Array.from(this.arcs.values());
  }

  // ==========================================================================
  // VOLUME MANAGEMENT
  // ==========================================================================

  createVolume(data: Partial<Volume> & { number: number; title: string }): Volume {
    const volume: Volume = {
      id: uuidv4(),
      number: data.number,
      title: data.title,
      subtitle: data.subtitle,
      chapters: data.chapters || [],
      arcs: data.arcs || [],
      wordCount: data.wordCount || 0,
      synopsis: data.synopsis,
      coverNotes: data.coverNotes
    };

    this.volumes.set(volume.id, volume);
    return volume;
  }

  getVolume(id: string): Volume | undefined {
    return this.volumes.get(id);
  }

  getAllVolumes(): Volume[] {
    return Array.from(this.volumes.values()).sort((a, b) => a.number - b.number);
  }

  // ==========================================================================
  // ENTITY TRACKING
  // ==========================================================================

  trackEntityMention(chapterNumber: number, mention: EntityMention): void {
    const chapter = this.chapters.get(chapterNumber);
    if (!chapter) return;

    chapter.entityMentions.push(mention);
    chapter.updatedAt = new Date();
  }

  getEntityMentions(entityId: string): { chapter: number; mention: EntityMention }[] {
    const mentions: { chapter: number; mention: EntityMention }[] = [];

    for (const chapter of this.chapters.values()) {
      for (const mention of chapter.entityMentions) {
        if (mention.entityId === entityId) {
          mentions.push({ chapter: chapter.number, mention });
        }
      }
    }

    return mentions.sort((a, b) => a.chapter - b.chapter);
  }

  getFirstMention(entityId: string): { chapter: number; mention: EntityMention } | undefined {
    const mentions = this.getEntityMentions(entityId);
    return mentions[0];
  }

  getLastMention(entityId: string): { chapter: number; mention: EntityMention } | undefined {
    const mentions = this.getEntityMentions(entityId);
    return mentions[mentions.length - 1];
  }

  // ==========================================================================
  // CHARACTER STATE TRACKING
  // ==========================================================================

  updateCharacterState(chapterNumber: number, characterId: string, state: Partial<CharacterState>): void {
    const chapter = this.chapters.get(chapterNumber);
    if (!chapter) return;

    const existingIndex = chapter.characterStates.findIndex(s => s.characterId === characterId);
    if (existingIndex >= 0) {
      chapter.characterStates[existingIndex] = {
        ...chapter.characterStates[existingIndex],
        ...state
      };
    } else {
      chapter.characterStates.push({
        characterId,
        name: state.name || 'Unknown',
        status: state.status || 'alive',
        knownInformation: state.knownInformation || [],
        relationships: state.relationships || [],
        ...state
      });
    }

    // Update global story state
    this.storyState.activeCharacters.set(characterId, chapter.characterStates.find(s => s.characterId === characterId)!);
  }

  getCharacterStateAt(characterId: string, chapterNumber: number): CharacterState | undefined {
    // Find the most recent state at or before the given chapter
    for (let i = chapterNumber; i >= 1; i--) {
      const chapter = this.chapters.get(i);
      if (chapter) {
        const state = chapter.characterStates.find(s => s.characterId === characterId);
        if (state) return state;
      }
    }
    return undefined;
  }

  trackDeath(characterId: string, chapterNumber: number, cause: string): void {
    this.storyState.deaths.push({ characterId, chapter: chapterNumber, cause });

    // Update character state
    this.updateCharacterState(chapterNumber, characterId, {
      characterId,
      name: this.storyState.activeCharacters.get(characterId)?.name || 'Unknown',
      status: 'dead',
      knownInformation: [],
      relationships: []
    });
  }

  isCharacterAlive(characterId: string, atChapter: number): boolean {
    const death = this.storyState.deaths.find(d => d.characterId === characterId);
    if (!death) return true;
    return death.chapter > atChapter;
  }

  // ==========================================================================
  // CONNECTION MANAGEMENT
  // ==========================================================================

  addConnection(fromChapter: number, toChapter: number, connection: Omit<ChapterConnection, 'targetChapter'>): void {
    const chapter = this.chapters.get(fromChapter);
    if (!chapter) return;

    chapter.connections.push({
      ...connection,
      targetChapter: toChapter
    });
  }

  getChapterConnections(chapterNumber: number): ChapterConnection[] {
    const chapter = this.chapters.get(chapterNumber);
    return chapter?.connections || [];
  }

  getChaptersReferencingChapter(chapterNumber: number): number[] {
    const referencingChapters: number[] = [];

    for (const chapter of this.chapters.values()) {
      if (chapter.connections.some(c => c.targetChapter === chapterNumber)) {
        referencingChapters.push(chapter.number);
      }
    }

    return referencingChapters.sort((a, b) => a - b);
  }

  // ==========================================================================
  // VALIDATION ERROR MANAGEMENT
  // ==========================================================================

  addError(chapterNumber: number, error: Omit<ValidationError, 'id' | 'chapterId' | 'chapterNumber' | 'createdAt' | 'fixed'>): ValidationError {
    const chapter = this.chapters.get(chapterNumber);
    if (!chapter) throw new Error(`Chapter ${chapterNumber} not found`);

    const validationError: ValidationError = {
      id: uuidv4(),
      chapterId: chapter.id,
      chapterNumber,
      ...error,
      fixed: false,
      createdAt: new Date()
    };

    chapter.errors.push(validationError);
    this.errors.push(validationError);

    // Update validation score
    this.updateValidationScore(chapterNumber);

    return validationError;
  }

  fixError(errorId: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (!error) return false;

    error.fixed = true;
    error.fixedAt = new Date();

    this.updateValidationScore(error.chapterNumber);
    return true;
  }

  getChapterErrors(chapterNumber: number): ValidationError[] {
    const chapter = this.chapters.get(chapterNumber);
    return chapter?.errors.filter(e => !e.fixed) || [];
  }

  getAllUnfixedErrors(): ValidationError[] {
    return this.errors.filter(e => !e.fixed);
  }

  getErrorsByCategory(category: ErrorCategory): ValidationError[] {
    return this.errors.filter(e => e.category === category && !e.fixed);
  }

  getErrorsBySeverity(severity: ErrorSeverity): ValidationError[] {
    return this.errors.filter(e => e.severity === severity && !e.fixed);
  }

  private updateValidationScore(chapterNumber: number): void {
    const chapter = this.chapters.get(chapterNumber);
    if (!chapter) return;

    const unfixedErrors = chapter.errors.filter(e => !e.fixed);
    let score = 100;

    for (const error of unfixedErrors) {
      switch (error.severity) {
        case ErrorSeverity.CRITICAL: score -= 25; break;
        case ErrorSeverity.ERROR: score -= 10; break;
        case ErrorSeverity.WARNING: score -= 3; break;
        case ErrorSeverity.INFO: score -= 1; break;
      }
    }

    chapter.validationScore = Math.max(0, score);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getStats(): {
    totalChapters: number;
    chaptersByStatus: Record<string, number>;
    totalWordCount: number;
    avgWordsPerChapter: number;
    plotThreads: { total: number; active: number; resolved: number };
    errors: { total: number; critical: number; error: number; warning: number };
    validationScoreAvg: number;
    arcs: number;
    volumes: number;
  } {
    const chapters = this.getAllChapters();

    const chaptersByStatus: Record<string, number> = {};
    let totalWordCount = 0;
    let totalValidationScore = 0;

    for (const chapter of chapters) {
      chaptersByStatus[chapter.status] = (chaptersByStatus[chapter.status] || 0) + 1;
      totalWordCount += chapter.metrics?.wordCount || 0;
      totalValidationScore += chapter.validationScore;
    }

    const unfixedErrors = this.getAllUnfixedErrors();

    return {
      totalChapters: chapters.length,
      chaptersByStatus,
      totalWordCount,
      avgWordsPerChapter: chapters.length > 0 ? Math.round(totalWordCount / chapters.length) : 0,
      plotThreads: {
        total: this.plotThreads.size,
        active: this.getActivePlotThreads().length,
        resolved: this.getAllPlotThreads().filter(t => t.status === 'resolved').length
      },
      errors: {
        total: unfixedErrors.length,
        critical: unfixedErrors.filter(e => e.severity === ErrorSeverity.CRITICAL).length,
        error: unfixedErrors.filter(e => e.severity === ErrorSeverity.ERROR).length,
        warning: unfixedErrors.filter(e => e.severity === ErrorSeverity.WARNING).length
      },
      validationScoreAvg: chapters.length > 0 ? Math.round(totalValidationScore / chapters.length) : 100,
      arcs: this.arcs.size,
      volumes: this.volumes.size
    };
  }

  // ==========================================================================
  // EXPORT / IMPORT
  // ==========================================================================

  exportToJSON(): string {
    return JSON.stringify({
      chapters: Array.from(this.chapters.values()),
      plotThreads: Array.from(this.plotThreads.values()),
      arcs: Array.from(this.arcs.values()),
      volumes: Array.from(this.volumes.values()),
      storyState: {
        ...this.storyState,
        activeCharacters: Array.from(this.storyState.activeCharacters.entries()),
        activeLocations: Array.from(this.storyState.activeLocations),
        activePlotThreads: Array.from(this.storyState.activePlotThreads)
      }
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.chapters.clear();
    this.chaptersById.clear();
    this.plotThreads.clear();
    this.arcs.clear();
    this.volumes.clear();

    if (data.chapters) {
      for (const chapter of data.chapters) {
        this.chapters.set(chapter.number, chapter);
        this.chaptersById.set(chapter.id, chapter);
      }
    }

    if (data.plotThreads) {
      for (const thread of data.plotThreads) {
        this.plotThreads.set(thread.id, thread);
      }
    }

    if (data.arcs) {
      for (const arc of data.arcs) {
        this.arcs.set(arc.id, arc);
      }
    }

    if (data.volumes) {
      for (const volume of data.volumes) {
        this.volumes.set(volume.id, volume);
      }
    }

    if (data.storyState) {
      this.storyState = {
        ...data.storyState,
        activeCharacters: new Map(data.storyState.activeCharacters),
        activeLocations: new Set(data.storyState.activeLocations),
        activePlotThreads: new Set(data.storyState.activePlotThreads)
      };
    }
  }

  // ==========================================================================
  // REPORT GENERATION
  // ==========================================================================

  generateProgressReport(): string {
    const stats = this.getStats();
    const chapters = this.getAllChapters();

    let report = `# Story Progress Report\n\n`;
    report += `## Overview\n\n`;
    report += `- **Total Chapters:** ${stats.totalChapters.toLocaleString()}\n`;
    report += `- **Total Word Count:** ${stats.totalWordCount.toLocaleString()}\n`;
    report += `- **Avg Words/Chapter:** ${stats.avgWordsPerChapter.toLocaleString()}\n`;
    report += `- **Volumes:** ${stats.volumes}\n`;
    report += `- **Story Arcs:** ${stats.arcs}\n\n`;

    report += `## Chapter Status\n\n`;
    for (const [status, count] of Object.entries(stats.chaptersByStatus)) {
      const percentage = ((count / stats.totalChapters) * 100).toFixed(1);
      report += `- ${status}: ${count.toLocaleString()} (${percentage}%)\n`;
    }

    report += `\n## Plot Threads\n\n`;
    report += `- **Total:** ${stats.plotThreads.total}\n`;
    report += `- **Active:** ${stats.plotThreads.active}\n`;
    report += `- **Resolved:** ${stats.plotThreads.resolved}\n\n`;

    report += `## Validation\n\n`;
    report += `- **Average Score:** ${stats.validationScoreAvg}/100\n`;
    report += `- **Critical Errors:** ${stats.errors.critical}\n`;
    report += `- **Errors:** ${stats.errors.error}\n`;
    report += `- **Warnings:** ${stats.errors.warning}\n`;
    report += `- **Total Unfixed Issues:** ${stats.errors.total}\n\n`;

    // Find problem chapters
    const problemChapters = chapters
      .filter(c => c.validationScore < 70)
      .sort((a, b) => a.validationScore - b.validationScore)
      .slice(0, 20);

    if (problemChapters.length > 0) {
      report += `## Chapters Needing Attention\n\n`;
      report += `| Chapter | Title | Score | Errors |\n`;
      report += `|---------|-------|-------|--------|\n`;
      for (const chapter of problemChapters) {
        const errorCount = chapter.errors.filter(e => !e.fixed).length;
        report += `| ${chapter.number} | ${chapter.title} | ${chapter.validationScore} | ${errorCount} |\n`;
      }
    }

    return report;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.chapters.clear();
    this.plotThreads.clear();
    this.volumes.clear();
    this.arcs.clear();
    this.storyState = this.initializeStoryState();
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export const chapterManager = new ChapterManager();
