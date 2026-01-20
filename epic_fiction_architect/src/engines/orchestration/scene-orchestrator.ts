/**
 * Epic Fiction Architect - Scene Orchestrator
 *
 * Manages scene and chapter planning with dependency tracking, ensuring
 * proper sequencing across a 12,000+ chapter narrative. Handles:
 * - Scene dependencies (X must happen before Y)
 * - Character availability (can't be in two scenes simultaneously)
 * - Location capacity and travel time
 * - Emotional pacing across scenes
 * - POV consistency and rotation
 *
 * Critical for ensuring narrative coherence when characters don't exist in bubbles.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Scene types for categorization
 */
export enum SceneType {
  ACTION = 'action',           // Combat, chase, physical conflict
  DIALOGUE = 'dialogue',       // Character conversations
  EXPOSITION = 'exposition',   // World/background information
  INTROSPECTION = 'introspection', // Character internal thoughts
  TRANSITION = 'transition',   // Moving between locations/times
  REVELATION = 'revelation',   // Major information revealed
  CONFRONTATION = 'confrontation', // Character conflict
  ROMANCE = 'romance',         // Romantic interactions
  HORROR = 'horror',           // Fear/tension focused
  COMEDY = 'comedy',           // Humor focused
  TRAINING = 'training',       // Skill/power development
  PLANNING = 'planning',       // Characters making plans
  FLASHBACK = 'flashback',     // Past events
  DREAM = 'dream',             // Dream sequences
  MONTAGE = 'montage',         // Time compression
  CLIMAX = 'climax',           // Peak intensity
  RESOLUTION = 'resolution',   // Conflict resolution
  SETUP = 'setup',             // Establishing future events
  PAYOFF = 'payoff'            // Delivering on setup
}

/**
 * Scene status in the planning pipeline
 */
export enum SceneStatus {
  CONCEPT = 'concept',         // Just an idea
  OUTLINED = 'outlined',       // Has basic structure
  DRAFTED = 'drafted',         // First draft complete
  REVISED = 'revised',         // Has been revised
  POLISHED = 'polished',       // Final draft
  PUBLISHED = 'published',     // Released
  CUT = 'cut',                 // Removed from narrative
  MERGED = 'merged',           // Combined with another scene
  DEFERRED = 'deferred'        // Pushed to later
}

/**
 * Dependency types between scenes
 */
export enum DependencyType {
  REQUIRES = 'requires',           // Must happen after
  ENABLES = 'enables',             // Makes possible
  REFERENCES = 'references',       // Mentions events from
  CONTRADICTS = 'contradicts',     // Cannot both happen
  PARALLEL = 'parallel',           // Happens simultaneously
  IMMEDIATELY_AFTER = 'immediately_after', // No gap allowed
  SAME_LOCATION = 'same_location', // Must share location
  SAME_POV = 'same_pov',           // Must share POV character
  EMOTIONAL_FOLLOWS = 'emotional_follows', // Emotional tone dependency
  FORESHADOWS = 'foreshadows',     // Sets up later scene
  RESOLVES = 'resolves'            // Resolves earlier scene
}

/**
 * POV (Point of View) types
 */
export enum POVType {
  FIRST_PERSON = 'first_person',
  THIRD_LIMITED = 'third_limited',
  THIRD_OMNISCIENT = 'third_omniscient',
  SECOND_PERSON = 'second_person',
  MULTIPLE = 'multiple',
  OBJECTIVE = 'objective'
}

/**
 * Emotional tone for pacing
 */
export enum EmotionalTone {
  TRIUMPHANT = 'triumphant',
  HOPEFUL = 'hopeful',
  PEACEFUL = 'peaceful',
  NEUTRAL = 'neutral',
  TENSE = 'tense',
  ANXIOUS = 'anxious',
  SORROWFUL = 'sorrowful',
  TERRIFYING = 'terrifying',
  ENRAGED = 'enraged',
  DESPAIRING = 'despairing'
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * A planned scene in the narrative
 */
export interface PlannedScene {
  id: string;
  title: string;
  type: SceneType;
  status: SceneStatus;

  // Positioning
  chapterId?: string;
  chapterNumber?: number;
  sceneOrder?: number;        // Order within chapter
  estimatedWordCount?: number;

  // Content
  summary: string;
  objectives: string[];       // What this scene accomplishes
  beats: SceneBeat[];        // Key moments in scene

  // Characters
  povCharacterId?: string;
  povType: POVType;
  presentCharacters: string[];
  mentionedCharacters: string[];

  // Location
  locationId?: string;
  locationName?: string;
  subLocation?: string;

  // Timing
  inWorldDateTime?: string;   // When it happens in story time
  duration?: string;          // How long in story time
  timeSincePrevious?: string; // Gap from previous scene

  // Emotional/Pacing
  emotionalTone: EmotionalTone;
  tensionLevel: number;       // 0-10
  pacingIntensity: number;    // 0-10 (0=slow, 10=breakneck)

  // Dependencies
  dependencies: SceneDependency[];
  blockedBy: string[];        // Scene IDs that must complete first
  blocks: string[];           // Scene IDs this blocks

  // Tracking
  plotThreads: string[];      // Which plot threads this advances
  themesExplored: string[];
  foreshadowingPlanted: string[];
  foreshadowingPaidOff: string[];

  // Metadata
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A beat within a scene
 */
export interface SceneBeat {
  id: string;
  order: number;
  description: string;
  type: 'action' | 'dialogue' | 'reaction' | 'revelation' | 'transition';
  characters: string[];
  emotionalShift?: EmotionalTone;
  importance: 'essential' | 'important' | 'optional';
}

/**
 * A dependency between scenes
 */
export interface SceneDependency {
  id: string;
  sourceSceneId: string;
  targetSceneId: string;
  type: DependencyType;
  description?: string;
  isSatisfied: boolean;
  isHard: boolean;            // Hard = must be satisfied, Soft = preferred
}

/**
 * A chapter container
 */
export interface PlannedChapter {
  id: string;
  number: number;
  title: string;
  volumeId?: string;
  volumeNumber?: number;

  // Scenes
  sceneIds: string[];

  // Summary
  summary: string;
  objectives: string[];

  // Tracking
  plotThreadsAdvanced: string[];
  majorEvents: string[];
  characterArcsProgressed: string[];

  // Stats
  targetWordCount?: number;
  actualWordCount?: number;

  // Status
  status: SceneStatus;

  // Metadata
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Character availability for scheduling
 */
export interface CharacterAvailability {
  characterId: string;
  characterName: string;
  unavailableRanges: Array<{
    startChapter: number;
    endChapter: number;
    reason: string;           // "dead", "imprisoned", "traveling", etc.
  }>;
  currentLocation?: string;
  currentStatus: string;
}

/**
 * Scheduling conflict
 */
export interface SchedulingConflict {
  id: string;
  type: 'character_overlap' | 'location_capacity' | 'dependency_violation' |
        'timeline_conflict' | 'pov_violation' | 'emotional_whiplash';
  severity: 'error' | 'warning' | 'info';
  description: string;
  involvedScenes: string[];
  involvedCharacters?: string[];
  suggestion?: string;
}

/**
 * Scene orchestrator configuration
 */
export interface OrchestratorConfig {
  maxScenesPerChapter: number;
  maxCharactersPerScene: number;
  minChapterWordCount: number;
  maxChapterWordCount: number;
  enableEmotionalPacing: boolean;
  emotionalContrastThreshold: number;  // Max tone jump between scenes
  requirePOVConsistency: boolean;
  allowSimultaneousScenes: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: OrchestratorConfig = {
  maxScenesPerChapter: 10,
  maxCharactersPerScene: 15,
  minChapterWordCount: 2000,
  maxChapterWordCount: 8000,
  enableEmotionalPacing: true,
  emotionalContrastThreshold: 5,
  requirePOVConsistency: true,
  allowSimultaneousScenes: true
};

// ============================================================================
// EMOTIONAL TONE VALUES (for pacing calculation)
// ============================================================================

const TONE_VALUES: Record<EmotionalTone, number> = {
  [EmotionalTone.TRIUMPHANT]: 10,
  [EmotionalTone.HOPEFUL]: 7,
  [EmotionalTone.PEACEFUL]: 3,
  [EmotionalTone.NEUTRAL]: 5,
  [EmotionalTone.TENSE]: 6,
  [EmotionalTone.ANXIOUS]: 7,
  [EmotionalTone.SORROWFUL]: 4,
  [EmotionalTone.TERRIFYING]: 9,
  [EmotionalTone.ENRAGED]: 8,
  [EmotionalTone.DESPAIRING]: 2
};

// ============================================================================
// SCENE ORCHESTRATOR
// ============================================================================

/**
 * Scene Orchestrator
 *
 * Plans and manages scenes across the narrative, ensuring proper
 * sequencing, character availability, and emotional pacing.
 */
export class SceneOrchestrator {
  private config: OrchestratorConfig;
  private scenes: Map<string, PlannedScene> = new Map();
  private chapters: Map<string, PlannedChapter> = new Map();
  private dependencies: Map<string, SceneDependency> = new Map();
  private characterAvailability: Map<string, CharacterAvailability> = new Map();

  // Indices
  private scenesByChapter: Map<string, string[]> = new Map();
  private scenesByCharacter: Map<string, Set<string>> = new Map();
  private scenesByLocation: Map<string, Set<string>> = new Map();
  private scenesByPlotThread: Map<string, Set<string>> = new Map();

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // ==========================================================================
  // SCENE MANAGEMENT
  // ==========================================================================

  /**
   * Create a new planned scene
   */
  createScene(data: {
    title: string;
    type: SceneType;
    summary: string;
    objectives?: string[];
    povCharacterId?: string;
    povType?: POVType;
    presentCharacters?: string[];
    locationId?: string;
    locationName?: string;
    emotionalTone?: EmotionalTone;
    tensionLevel?: number;
    pacingIntensity?: number;
    plotThreads?: string[];
    chapterNumber?: number;
    estimatedWordCount?: number;
    tags?: string[];
    notes?: string;
  }): PlannedScene {
    const id = uuidv4();
    const now = new Date();

    const scene: PlannedScene = {
      id,
      title: data.title,
      type: data.type,
      status: SceneStatus.CONCEPT,
      chapterNumber: data.chapterNumber,
      estimatedWordCount: data.estimatedWordCount,
      summary: data.summary,
      objectives: data.objectives ?? [],
      beats: [],
      povCharacterId: data.povCharacterId,
      povType: data.povType ?? POVType.THIRD_LIMITED,
      presentCharacters: data.presentCharacters ?? [],
      mentionedCharacters: [],
      locationId: data.locationId,
      locationName: data.locationName,
      emotionalTone: data.emotionalTone ?? EmotionalTone.NEUTRAL,
      tensionLevel: data.tensionLevel ?? 5,
      pacingIntensity: data.pacingIntensity ?? 5,
      dependencies: [],
      blockedBy: [],
      blocks: [],
      plotThreads: data.plotThreads ?? [],
      themesExplored: [],
      foreshadowingPlanted: [],
      foreshadowingPaidOff: [],
      notes: data.notes ?? '',
      tags: data.tags ?? [],
      createdAt: now,
      updatedAt: now
    };

    this.storeScene(scene);
    return scene;
  }

  /**
   * Store scene and update indices
   */
  private storeScene(scene: PlannedScene): void {
    this.scenes.set(scene.id, scene);

    // Index by chapter
    if (scene.chapterId) {
      if (!this.scenesByChapter.has(scene.chapterId)) {
        this.scenesByChapter.set(scene.chapterId, []);
      }
      const chapterScenes = this.scenesByChapter.get(scene.chapterId)!;
      if (!chapterScenes.includes(scene.id)) {
        chapterScenes.push(scene.id);
      }
    }

    // Index by characters
    for (const charId of scene.presentCharacters) {
      if (!this.scenesByCharacter.has(charId)) {
        this.scenesByCharacter.set(charId, new Set());
      }
      this.scenesByCharacter.get(charId)!.add(scene.id);
    }

    // Index by location
    if (scene.locationId) {
      if (!this.scenesByLocation.has(scene.locationId)) {
        this.scenesByLocation.set(scene.locationId, new Set());
      }
      this.scenesByLocation.get(scene.locationId)!.add(scene.id);
    }

    // Index by plot thread
    for (const threadId of scene.plotThreads) {
      if (!this.scenesByPlotThread.has(threadId)) {
        this.scenesByPlotThread.set(threadId, new Set());
      }
      this.scenesByPlotThread.get(threadId)!.add(scene.id);
    }
  }

  /**
   * Get scene by ID
   */
  getScene(id: string): PlannedScene | undefined {
    return this.scenes.get(id);
  }

  /**
   * Get all scenes
   */
  getAllScenes(): PlannedScene[] {
    return Array.from(this.scenes.values());
  }

  /**
   * Update a scene
   */
  updateScene(
    id: string,
    updates: Partial<Omit<PlannedScene, 'id' | 'createdAt'>>
  ): PlannedScene | undefined {
    const scene = this.scenes.get(id);
    if (!scene) return undefined;

    const updated: PlannedScene = {
      ...scene,
      ...updates,
      updatedAt: new Date()
    };

    // Re-index if key fields changed
    if (updates.presentCharacters || updates.locationId || updates.plotThreads) {
      // Remove from old indices
      if (scene.locationId) {
        this.scenesByLocation.get(scene.locationId)?.delete(id);
      }
      for (const charId of scene.presentCharacters) {
        this.scenesByCharacter.get(charId)?.delete(id);
      }
      for (const threadId of scene.plotThreads) {
        this.scenesByPlotThread.get(threadId)?.delete(id);
      }
    }

    this.storeScene(updated);
    return updated;
  }

  /**
   * Add a beat to a scene
   */
  addBeat(
    sceneId: string,
    beat: Omit<SceneBeat, 'id'>
  ): SceneBeat | undefined {
    const scene = this.scenes.get(sceneId);
    if (!scene) return undefined;

    const newBeat: SceneBeat = {
      ...beat,
      id: uuidv4()
    };

    scene.beats.push(newBeat);
    scene.beats.sort((a, b) => a.order - b.order);
    scene.updatedAt = new Date();

    return newBeat;
  }

  // ==========================================================================
  // CHAPTER MANAGEMENT
  // ==========================================================================

  /**
   * Create a new chapter
   */
  createChapter(data: {
    number: number;
    title: string;
    volumeId?: string;
    volumeNumber?: number;
    summary?: string;
    objectives?: string[];
    targetWordCount?: number;
    notes?: string;
  }): PlannedChapter {
    const id = uuidv4();
    const now = new Date();

    const chapter: PlannedChapter = {
      id,
      number: data.number,
      title: data.title,
      volumeId: data.volumeId,
      volumeNumber: data.volumeNumber,
      sceneIds: [],
      summary: data.summary ?? '',
      objectives: data.objectives ?? [],
      plotThreadsAdvanced: [],
      majorEvents: [],
      characterArcsProgressed: [],
      targetWordCount: data.targetWordCount,
      status: SceneStatus.CONCEPT,
      notes: data.notes ?? '',
      createdAt: now,
      updatedAt: now
    };

    this.chapters.set(id, chapter);
    return chapter;
  }

  /**
   * Get chapter by ID
   */
  getChapter(id: string): PlannedChapter | undefined {
    return this.chapters.get(id);
  }

  /**
   * Get chapter by number
   */
  getChapterByNumber(number: number): PlannedChapter | undefined {
    return Array.from(this.chapters.values())
      .find(c => c.number === number);
  }

  /**
   * Add scene to chapter
   */
  addSceneToChapter(sceneId: string, chapterId: string, order?: number): boolean {
    const scene = this.scenes.get(sceneId);
    const chapter = this.chapters.get(chapterId);

    if (!scene || !chapter) return false;

    // Update scene
    scene.chapterId = chapterId;
    scene.chapterNumber = chapter.number;
    scene.sceneOrder = order ?? chapter.sceneIds.length;
    scene.updatedAt = new Date();

    // Update chapter
    if (!chapter.sceneIds.includes(sceneId)) {
      chapter.sceneIds.push(sceneId);
      chapter.sceneIds.sort((a, b) => {
        const sceneA = this.scenes.get(a);
        const sceneB = this.scenes.get(b);
        return (sceneA?.sceneOrder ?? 0) - (sceneB?.sceneOrder ?? 0);
      });
    }
    chapter.updatedAt = new Date();

    // Update index
    if (!this.scenesByChapter.has(chapterId)) {
      this.scenesByChapter.set(chapterId, []);
    }
    const chapterScenes = this.scenesByChapter.get(chapterId)!;
    if (!chapterScenes.includes(sceneId)) {
      chapterScenes.push(sceneId);
    }

    return true;
  }

  /**
   * Get scenes in a chapter (ordered)
   */
  getScenesInChapter(chapterId: string): PlannedScene[] {
    const chapter = this.chapters.get(chapterId);
    if (!chapter) return [];

    return chapter.sceneIds
      .map(id => this.scenes.get(id)!)
      .filter(Boolean)
      .sort((a, b) => (a.sceneOrder ?? 0) - (b.sceneOrder ?? 0));
  }

  // ==========================================================================
  // DEPENDENCY MANAGEMENT
  // ==========================================================================

  /**
   * Create a dependency between scenes
   */
  createDependency(
    sourceSceneId: string,
    targetSceneId: string,
    type: DependencyType,
    options?: {
      description?: string;
      isHard?: boolean;
    }
  ): SceneDependency | undefined {
    const source = this.scenes.get(sourceSceneId);
    const target = this.scenes.get(targetSceneId);

    if (!source || !target) return undefined;

    const id = uuidv4();
    const dependency: SceneDependency = {
      id,
      sourceSceneId,
      targetSceneId,
      type,
      description: options?.description,
      isSatisfied: false,
      isHard: options?.isHard ?? true
    };

    this.dependencies.set(id, dependency);

    // Update scene references
    source.dependencies.push(dependency);

    if (type === DependencyType.REQUIRES ||
        type === DependencyType.IMMEDIATELY_AFTER) {
      target.blockedBy.push(sourceSceneId);
      source.blocks.push(targetSceneId);
    }

    return dependency;
  }

  /**
   * Check if all dependencies for a scene are satisfied
   */
  checkDependencies(sceneId: string): {
    satisfied: boolean;
    unsatisfied: SceneDependency[];
    violations: string[];
  } {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      return { satisfied: false, unsatisfied: [], violations: ['Scene not found'] };
    }

    const unsatisfied: SceneDependency[] = [];
    const violations: string[] = [];

    for (const dep of scene.dependencies) {
      const targetScene = this.scenes.get(dep.targetSceneId);

      if (!targetScene) {
        violations.push(`Target scene ${dep.targetSceneId} not found`);
        continue;
      }

      switch (dep.type) {
        case DependencyType.REQUIRES:
          // Target must be completed/published before source
          if (targetScene.status !== SceneStatus.PUBLISHED &&
              targetScene.status !== SceneStatus.POLISHED) {
            dep.isSatisfied = false;
            unsatisfied.push(dep);
          } else {
            dep.isSatisfied = true;
          }
          break;

        case DependencyType.CONTRADICTS:
          // Both cannot exist
          if (targetScene.status !== SceneStatus.CUT) {
            dep.isSatisfied = false;
            violations.push(
              `Scene "${scene.title}" contradicts "${targetScene.title}" - one must be cut`
            );
          }
          break;

        case DependencyType.SAME_LOCATION:
          if (scene.locationId !== targetScene.locationId) {
            dep.isSatisfied = false;
            violations.push(
              `Scenes must share location but "${scene.title}" is at ${scene.locationName} ` +
              `while "${targetScene.title}" is at ${targetScene.locationName}`
            );
          }
          break;

        case DependencyType.SAME_POV:
          if (scene.povCharacterId !== targetScene.povCharacterId) {
            dep.isSatisfied = false;
            violations.push(
              `Scenes must share POV character`
            );
          }
          break;

        default:
          dep.isSatisfied = true;
      }
    }

    return {
      satisfied: unsatisfied.length === 0 && violations.length === 0,
      unsatisfied,
      violations
    };
  }

  /**
   * Get dependency chain for a scene
   */
  getDependencyChain(sceneId: string, depth: number = 10): PlannedScene[] {
    const chain: PlannedScene[] = [];
    const visited = new Set<string>();

    const traverse = (id: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(id)) return;
      visited.add(id);

      const scene = this.scenes.get(id);
      if (!scene) return;

      chain.push(scene);

      for (const blockedId of scene.blockedBy) {
        traverse(blockedId, currentDepth + 1);
      }
    };

    traverse(sceneId, 0);
    return chain.reverse(); // Return in dependency order
  }

  // ==========================================================================
  // CHARACTER AVAILABILITY
  // ==========================================================================

  /**
   * Set character availability
   */
  setCharacterAvailability(
    characterId: string,
    characterName: string,
    availability: Partial<CharacterAvailability>
  ): void {
    const existing = this.characterAvailability.get(characterId) ?? {
      characterId,
      characterName,
      unavailableRanges: [],
      currentStatus: 'active'
    };

    this.characterAvailability.set(characterId, {
      ...existing,
      ...availability,
      characterId,
      characterName
    });
  }

  /**
   * Add unavailable range for character
   */
  addUnavailableRange(
    characterId: string,
    startChapter: number,
    endChapter: number,
    reason: string
  ): void {
    const availability = this.characterAvailability.get(characterId);
    if (!availability) return;

    availability.unavailableRanges.push({
      startChapter,
      endChapter,
      reason
    });
  }

  /**
   * Check if character is available for a chapter
   */
  isCharacterAvailable(characterId: string, chapterNumber: number): {
    available: boolean;
    reason?: string;
  } {
    const availability = this.characterAvailability.get(characterId);
    if (!availability) {
      return { available: true }; // Unknown characters assumed available
    }

    for (const range of availability.unavailableRanges) {
      if (chapterNumber >= range.startChapter && chapterNumber <= range.endChapter) {
        return { available: false, reason: range.reason };
      }
    }

    return { available: true };
  }

  // ==========================================================================
  // CONFLICT DETECTION
  // ==========================================================================

  /**
   * Detect all scheduling conflicts
   */
  detectConflicts(): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];

    // Check character overlaps
    conflicts.push(...this.detectCharacterOverlaps());

    // Check dependency violations
    conflicts.push(...this.detectDependencyViolations());

    // Check emotional whiplash
    if (this.config.enableEmotionalPacing) {
      conflicts.push(...this.detectEmotionalWhiplash());
    }

    // Check POV violations
    if (this.config.requirePOVConsistency) {
      conflicts.push(...this.detectPOVViolations());
    }

    return conflicts;
  }

  /**
   * Detect character overlap conflicts
   */
  private detectCharacterOverlaps(): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];

    // Group scenes by chapter
    const chapterScenes = new Map<number, PlannedScene[]>();
    for (const scene of this.scenes.values()) {
      if (scene.chapterNumber === undefined) continue;
      if (!chapterScenes.has(scene.chapterNumber)) {
        chapterScenes.set(scene.chapterNumber, []);
      }
      chapterScenes.get(scene.chapterNumber)!.push(scene);
    }

    // Check each chapter for character conflicts
    for (const [chapterNum, scenes] of chapterScenes) {
      // For each character, check if they're in multiple scenes
      // that happen simultaneously
      const characterScenes = new Map<string, PlannedScene[]>();

      for (const scene of scenes) {
        for (const charId of scene.presentCharacters) {
          if (!characterScenes.has(charId)) {
            characterScenes.set(charId, []);
          }
          characterScenes.get(charId)!.push(scene);
        }

        // Also check availability
        for (const charId of scene.presentCharacters) {
          const availability = this.isCharacterAvailable(charId, chapterNum);
          if (!availability.available) {
            conflicts.push({
              id: uuidv4(),
              type: 'character_overlap',
              severity: 'error',
              description: `Character "${charId}" is unavailable in chapter ${chapterNum}: ${availability.reason}`,
              involvedScenes: [scene.id],
              involvedCharacters: [charId],
              suggestion: `Remove character from scene or adjust their availability`
            });
          }
        }
      }

      // Check for simultaneous presence issues
      if (!this.config.allowSimultaneousScenes) {
        for (const [charId, charScenes] of characterScenes) {
          if (charScenes.length > 1) {
            // Check if scenes are marked as parallel or sequential
            const hasParallel = charScenes.some(s =>
              s.dependencies.some(d => d.type === DependencyType.PARALLEL)
            );

            if (!hasParallel) {
              conflicts.push({
                id: uuidv4(),
                type: 'character_overlap',
                severity: 'warning',
                description: `Character "${charId}" appears in ${charScenes.length} scenes in chapter ${chapterNum} without parallel markers`,
                involvedScenes: charScenes.map(s => s.id),
                involvedCharacters: [charId],
                suggestion: `Mark scenes as PARALLEL, IMMEDIATELY_AFTER, or reorder`
              });
            }
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect dependency violations
   */
  private detectDependencyViolations(): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];

    for (const dep of this.dependencies.values()) {
      const source = this.scenes.get(dep.sourceSceneId);
      const target = this.scenes.get(dep.targetSceneId);

      if (!source || !target) continue;

      if (dep.type === DependencyType.REQUIRES ||
          dep.type === DependencyType.IMMEDIATELY_AFTER) {
        // Target must come before source
        if (source.chapterNumber !== undefined &&
            target.chapterNumber !== undefined) {
          if (target.chapterNumber > source.chapterNumber) {
            conflicts.push({
              id: uuidv4(),
              type: 'dependency_violation',
              severity: 'error',
              description: `Scene "${source.title}" requires "${target.title}" but target is in later chapter`,
              involvedScenes: [source.id, target.id],
              suggestion: `Move "${target.title}" to chapter ${source.chapterNumber} or earlier`
            });
          } else if (target.chapterNumber === source.chapterNumber) {
            // Same chapter - check order
            if ((target.sceneOrder ?? 0) > (source.sceneOrder ?? 0)) {
              conflicts.push({
                id: uuidv4(),
                type: 'dependency_violation',
                severity: 'error',
                description: `Scene "${source.title}" requires "${target.title}" but target comes later in same chapter`,
                involvedScenes: [source.id, target.id],
                suggestion: `Reorder scenes within chapter`
              });
            }
          }
        }
      }

      if (dep.type === DependencyType.CONTRADICTS) {
        if (source.status !== SceneStatus.CUT &&
            target.status !== SceneStatus.CUT) {
          conflicts.push({
            id: uuidv4(),
            type: 'dependency_violation',
            severity: 'error',
            description: `Scenes "${source.title}" and "${target.title}" contradict each other`,
            involvedScenes: [source.id, target.id],
            suggestion: `Cut one of the contradicting scenes`
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect emotional whiplash between scenes
   */
  private detectEmotionalWhiplash(): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];

    for (const chapter of this.chapters.values()) {
      const scenes = this.getScenesInChapter(chapter.id);
      if (scenes.length < 2) continue;

      for (let i = 1; i < scenes.length; i++) {
        const prev = scenes[i - 1];
        const curr = scenes[i];

        const prevValue = TONE_VALUES[prev.emotionalTone];
        const currValue = TONE_VALUES[curr.emotionalTone];
        const diff = Math.abs(prevValue - currValue);

        if (diff > this.config.emotionalContrastThreshold) {
          conflicts.push({
            id: uuidv4(),
            type: 'emotional_whiplash',
            severity: 'warning',
            description: `Sharp emotional shift from ${prev.emotionalTone} to ${curr.emotionalTone} between scenes "${prev.title}" and "${curr.title}"`,
            involvedScenes: [prev.id, curr.id],
            suggestion: `Add transitional scene or adjust emotional tones`
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect POV violations
   */
  private detectPOVViolations(): SchedulingConflict[] {
    const conflicts: SchedulingConflict[] = [];

    for (const scene of this.scenes.values()) {
      // Check if POV character is in the scene
      if (scene.povCharacterId &&
          !scene.presentCharacters.includes(scene.povCharacterId)) {
        conflicts.push({
          id: uuidv4(),
          type: 'pov_violation',
          severity: 'error',
          description: `POV character not present in scene "${scene.title}"`,
          involvedScenes: [scene.id],
          involvedCharacters: [scene.povCharacterId],
          suggestion: `Add POV character to present characters or change POV`
        });
      }

      // Check for thoughts of non-POV characters (if third limited)
      if (scene.povType === POVType.THIRD_LIMITED) {
        // This would require text analysis - flag for manual check
        // For now, just note scenes with multiple important characters
        if (scene.presentCharacters.length > 3) {
          conflicts.push({
            id: uuidv4(),
            type: 'pov_violation',
            severity: 'info',
            description: `Scene "${scene.title}" has ${scene.presentCharacters.length} characters - verify POV stays with ${scene.povCharacterId}`,
            involvedScenes: [scene.id],
            suggestion: `Review scene to ensure thoughts only from POV character`
          });
        }
      }
    }

    return conflicts;
  }

  // ==========================================================================
  // QUERIES
  // ==========================================================================

  /**
   * Get scenes by character
   */
  getScenesByCharacter(characterId: string): PlannedScene[] {
    const ids = this.scenesByCharacter.get(characterId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.scenes.get(id)!).filter(Boolean);
  }

  /**
   * Get scenes by location
   */
  getScenesByLocation(locationId: string): PlannedScene[] {
    const ids = this.scenesByLocation.get(locationId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.scenes.get(id)!).filter(Boolean);
  }

  /**
   * Get scenes by plot thread
   */
  getScenesByPlotThread(threadId: string): PlannedScene[] {
    const ids = this.scenesByPlotThread.get(threadId);
    if (!ids) return [];
    return Array.from(ids)
      .map(id => this.scenes.get(id)!)
      .filter(Boolean)
      .sort((a, b) => (a.chapterNumber ?? 0) - (b.chapterNumber ?? 0));
  }

  /**
   * Get scenes by status
   */
  getScenesByStatus(status: SceneStatus): PlannedScene[] {
    return Array.from(this.scenes.values())
      .filter(s => s.status === status);
  }

  /**
   * Get unassigned scenes (no chapter)
   */
  getUnassignedScenes(): PlannedScene[] {
    return Array.from(this.scenes.values())
      .filter(s => !s.chapterId);
  }

  /**
   * Get scenes with unsatisfied dependencies
   */
  getBlockedScenes(): PlannedScene[] {
    return Array.from(this.scenes.values())
      .filter(s => {
        const { satisfied } = this.checkDependencies(s.id);
        return !satisfied;
      });
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    totalScenes: number;
    totalChapters: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    avgScenesPerChapter: number;
    unassignedScenes: number;
    blockedScenes: number;
    totalConflicts: number;
    avgTensionLevel: number;
    plotThreadCoverage: Record<string, number>;
  } {
    const scenes = Array.from(this.scenes.values());
    const chapters = Array.from(this.chapters.values());

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const plotThreadCoverage: Record<string, number> = {};
    let totalTension = 0;

    for (const scene of scenes) {
      byStatus[scene.status] = (byStatus[scene.status] ?? 0) + 1;
      byType[scene.type] = (byType[scene.type] ?? 0) + 1;
      totalTension += scene.tensionLevel;

      for (const thread of scene.plotThreads) {
        plotThreadCoverage[thread] = (plotThreadCoverage[thread] ?? 0) + 1;
      }
    }

    const assignedScenes = scenes.filter(s => s.chapterId).length;
    const conflicts = this.detectConflicts();

    return {
      totalScenes: scenes.length,
      totalChapters: chapters.length,
      byStatus,
      byType,
      avgScenesPerChapter: chapters.length > 0 ? assignedScenes / chapters.length : 0,
      unassignedScenes: scenes.length - assignedScenes,
      blockedScenes: this.getBlockedScenes().length,
      totalConflicts: conflicts.length,
      avgTensionLevel: scenes.length > 0 ? totalTension / scenes.length : 0,
      plotThreadCoverage
    };
  }

  // ==========================================================================
  // IMPORT/EXPORT
  // ==========================================================================

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      scenes: Array.from(this.scenes.values()),
      chapters: Array.from(this.chapters.values()),
      dependencies: Array.from(this.dependencies.values()),
      characterAvailability: Array.from(this.characterAvailability.values()),
      config: this.config,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.clear();

    if (data.config) {
      this.config = { ...defaultConfig, ...data.config };
    }

    if (data.scenes) {
      for (const scene of data.scenes) {
        scene.createdAt = new Date(scene.createdAt);
        scene.updatedAt = new Date(scene.updatedAt);
        this.storeScene(scene);
      }
    }

    if (data.chapters) {
      for (const chapter of data.chapters) {
        chapter.createdAt = new Date(chapter.createdAt);
        chapter.updatedAt = new Date(chapter.updatedAt);
        this.chapters.set(chapter.id, chapter);
      }
    }

    if (data.dependencies) {
      for (const dep of data.dependencies) {
        this.dependencies.set(dep.id, dep);
      }
    }

    if (data.characterAvailability) {
      for (const avail of data.characterAvailability) {
        this.characterAvailability.set(avail.characterId, avail);
      }
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.scenes.clear();
    this.chapters.clear();
    this.dependencies.clear();
    this.characterAvailability.clear();
    this.scenesByChapter.clear();
    this.scenesByCharacter.clear();
    this.scenesByLocation.clear();
    this.scenesByPlotThread.clear();
  }
}

// Default instance
export const sceneOrchestrator = new SceneOrchestrator();

export default SceneOrchestrator;
