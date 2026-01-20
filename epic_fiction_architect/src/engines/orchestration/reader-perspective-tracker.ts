/**
 * Epic Fiction Architect - Reader Perspective Tracker
 *
 * Tracks what the READER knows vs what characters know, enabling:
 * - Dramatic irony management (reader knows more than characters)
 * - Revelation timing (reader learns with or before characters)
 * - Information delivery verification (did reader actually see this?)
 * - Mystery management (clues vs red herrings vs solutions)
 * - Suspense tracking (what dangers reader knows characters don't)
 *
 * Critical for 12,000+ chapter narratives where tracking "what has
 * been shown to the reader" becomes impossibly complex.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Types of reader knowledge
 */
export enum ReaderKnowledgeType {
  FACT = 'fact',               // Objective truth
  CHARACTER_SECRET = 'character_secret', // Hidden character info
  PLOT_SECRET = 'plot_secret', // Hidden plot info
  RELATIONSHIP = 'relationship', // Connection between entities
  LOCATION = 'location',       // Place knowledge
  ABILITY = 'ability',         // Character abilities/powers
  MOTIVATION = 'motivation',   // Why someone does things
  HISTORY = 'history',         // Past events
  PROPHECY = 'prophecy',       // Future predictions
  IDENTITY = 'identity',       // True identity reveals
  RULE = 'rule',               // World/magic rules
  DANGER = 'danger',           // Threats to characters
  CLUE = 'clue',               // Mystery clue
  RED_HERRING = 'red_herring', // Misleading information
  SOLUTION = 'solution'        // Mystery solution
}

/**
 * How reader learned this information
 */
export enum DeliveryMethod {
  SHOWN = 'shown',             // Scene showed it happening
  TOLD_DIALOGUE = 'told_dialogue', // Character said it
  TOLD_NARRATION = 'told_narration', // Narrator stated it
  IMPLIED = 'implied',         // Heavily suggested
  FORESHADOWED = 'foreshadowed', // Hinted at
  PROLOGUE = 'prologue',       // Pre-story reveal
  FLASHBACK = 'flashback',     // Past scene
  DREAM = 'dream',             // Dream sequence
  VISION = 'vision',           // Magical/prophetic vision
  DOCUMENT = 'document',       // Letter, book, etc.
  RUMOR = 'rumor',             // Unreliable source
  POV_THOUGHT = 'pov_thought'  // POV character's thoughts
}

/**
 * Confidence level of reader knowledge
 */
export enum ReaderConfidence {
  CERTAIN = 'certain',         // Reader definitely knows
  LIKELY = 'likely',           // Reader probably caught it
  UNCERTAIN = 'uncertain',     // Subtle, might have missed
  SUSPICIOUS = 'suspicious',   // Reader should question this
  MISLEADING = 'misleading'    // Reader was deliberately misled
}

/**
 * Dramatic knowledge relationship
 */
export enum DramaticRelationship {
  READER_KNOWS_MORE = 'reader_knows_more',     // Classic dramatic irony
  CHARACTER_KNOWS_MORE = 'character_knows_more', // Reader in the dark
  BOTH_KNOW = 'both_know',                     // Shared knowledge
  NEITHER_KNOWS = 'neither_knows',             // Mystery for all
  READER_MISLED = 'reader_misled',             // Twist setup
  CHARACTER_MISLED = 'character_misled'        // Character fooled
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * A piece of knowledge the reader has
 */
export interface ReaderKnowledge {
  id: string;
  type: ReaderKnowledgeType;

  // Content
  subject: string;             // What/who it's about
  content: string;             // The actual information
  shortDescription: string;    // Brief summary

  // Delivery
  deliveryMethod: DeliveryMethod;
  deliveredChapter: number;
  deliveredSceneId?: string;
  deliveryContext: string;     // How it was revealed

  // Reliability
  confidence: ReaderConfidence;
  isTrue: boolean;             // Is this actually correct?
  trueContent?: string;        // If misleading, what's true

  // Character knowledge comparison
  knownByCharacters: string[]; // Character IDs who know this
  unknownToCharacters: string[]; // Characters specifically unaware
  dramaticRelationships: DramaticKnowledgeLink[];

  // Connections
  relatedKnowledge: string[];  // IDs of related knowledge
  contradicts?: string[];      // IDs of contradicting knowledge
  supersededBy?: string;       // If this was corrected/updated

  // Tracking
  referencedInChapters: number[];
  lastReferencedChapter?: number;
  importanceLevel: 'critical' | 'major' | 'moderate' | 'minor';

  // For mysteries
  mysteryId?: string;          // If part of a mystery
  isClueFor?: string;          // What mystery this hints at
  isRedHerringFor?: string;    // What mystery this misleads about
  isSolutionFor?: string;      // What mystery this solves

  // Metadata
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Link between reader knowledge and character knowledge
 */
export interface DramaticKnowledgeLink {
  characterId: string;
  characterName: string;
  relationship: DramaticRelationship;
  since: number;               // Chapter this relationship began
  until?: number;              // Chapter it ended (if revealed)
  narrativeEffect: string;     // Why this matters dramatically
}

/**
 * A mystery being tracked
 */
export interface TrackedMystery {
  id: string;
  name: string;
  question: string;            // The dramatic question
  status: 'open' | 'partially_solved' | 'solved' | 'abandoned';

  // Posed
  posedChapter: number;
  posedContext: string;

  // Clues and misdirection
  clueIds: string[];           // ReaderKnowledge IDs that are clues
  redHerringIds: string[];     // ReaderKnowledge IDs that mislead
  solutionId?: string;         // ReaderKnowledge ID of solution

  // Solution
  solvedChapter?: number;
  solution?: string;
  revealMethod?: DeliveryMethod;

  // Analysis
  clueDistribution: Array<{ chapter: number; clueId: string }>;
  fairPlay: boolean;           // Did reader have chance to solve?
  difficultyRating: 1 | 2 | 3 | 4 | 5;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dramatic irony situation
 */
export interface DramaticIrony {
  id: string;
  name: string;
  description: string;

  // Knowledge involved
  readerKnowledgeIds: string[];
  unawareCharacterIds: string[];

  // Timeline
  establishedChapter: number;
  resolvedChapter?: number;
  duration?: number;           // Chapters of irony

  // Effect
  tensionLevel: number;        // 1-10
  narrativePurpose: string;
  anticipatedPayoff: string;
  actualPayoff?: string;

  // Status
  status: 'active' | 'resolved' | 'subverted';

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reader knowledge at a specific chapter
 */
export interface ReaderStateSnapshot {
  chapter: number;
  knowledgeIds: string[];
  totalKnowledge: number;
  byType: Record<string, number>;
  activeDramaticIronies: string[];
  openMysteries: string[];
  recentRevelations: string[];
  timestamp: Date;
}

/**
 * Configuration
 */
export interface ReaderTrackerConfig {
  trackSubtleImplications: boolean;
  dramaticIronyThreshold: number;  // Min importance for tracking
  mysteryClueRequirement: number;  // Min clues before solution
  snapshotInterval: number;        // Chapters between snapshots
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: ReaderTrackerConfig = {
  trackSubtleImplications: true,
  dramaticIronyThreshold: 2, // moderate or higher
  mysteryClueRequirement: 3,
  snapshotInterval: 50
};

// ============================================================================
// READER PERSPECTIVE TRACKER
// ============================================================================

/**
 * Reader Perspective Tracker
 *
 * Manages what the reader knows separate from what characters know,
 * tracking dramatic irony, mystery clues, and information delivery.
 */
export class ReaderPerspectiveTracker {
  private config: ReaderTrackerConfig;
  private knowledge: Map<string, ReaderKnowledge> = new Map();
  private mysteries: Map<string, TrackedMystery> = new Map();
  private dramaticIronies: Map<string, DramaticIrony> = new Map();
  private snapshots: ReaderStateSnapshot[] = [];

  // Indices
  private knowledgeByType: Map<ReaderKnowledgeType, Set<string>> = new Map();
  private knowledgeByChapter: Map<number, Set<string>> = new Map();
  private knowledgeBySubject: Map<string, Set<string>> = new Map();
  private knowledgeByCharacter: Map<string, Set<string>> = new Map();

  constructor(config?: Partial<ReaderTrackerConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // ==========================================================================
  // KNOWLEDGE MANAGEMENT
  // ==========================================================================

  /**
   * Record knowledge delivered to reader
   */
  deliverKnowledge(data: {
    type: ReaderKnowledgeType;
    subject: string;
    content: string;
    shortDescription: string;
    deliveryMethod: DeliveryMethod;
    deliveredChapter: number;
    deliveredSceneId?: string;
    deliveryContext: string;
    confidence?: ReaderConfidence;
    isTrue?: boolean;
    trueContent?: string;
    knownByCharacters?: string[];
    unknownToCharacters?: string[];
    importanceLevel?: ReaderKnowledge['importanceLevel'];
    mysteryId?: string;
    isClueFor?: string;
    isRedHerringFor?: string;
    isSolutionFor?: string;
    tags?: string[];
    notes?: string;
  }): ReaderKnowledge {
    const id = uuidv4();
    const now = new Date();

    const knowledge: ReaderKnowledge = {
      id,
      type: data.type,
      subject: data.subject,
      content: data.content,
      shortDescription: data.shortDescription,
      deliveryMethod: data.deliveryMethod,
      deliveredChapter: data.deliveredChapter,
      deliveredSceneId: data.deliveredSceneId,
      deliveryContext: data.deliveryContext,
      confidence: data.confidence ?? ReaderConfidence.CERTAIN,
      isTrue: data.isTrue ?? true,
      trueContent: data.trueContent,
      knownByCharacters: data.knownByCharacters ?? [],
      unknownToCharacters: data.unknownToCharacters ?? [],
      dramaticRelationships: [],
      relatedKnowledge: [],
      referencedInChapters: [data.deliveredChapter],
      lastReferencedChapter: data.deliveredChapter,
      importanceLevel: data.importanceLevel ?? 'moderate',
      mysteryId: data.mysteryId,
      isClueFor: data.isClueFor,
      isRedHerringFor: data.isRedHerringFor,
      isSolutionFor: data.isSolutionFor,
      tags: data.tags ?? [],
      notes: data.notes ?? '',
      createdAt: now,
      updatedAt: now
    };

    // Create dramatic relationships
    for (const charId of data.unknownToCharacters ?? []) {
      knowledge.dramaticRelationships.push({
        characterId: charId,
        characterName: charId, // Would need external lookup
        relationship: DramaticRelationship.READER_KNOWS_MORE,
        since: data.deliveredChapter,
        narrativeEffect: `Reader knows "${data.shortDescription}" but character doesn't`
      });
    }

    this.storeKnowledge(knowledge);

    // Handle mystery connections
    if (data.isClueFor) {
      this.addClueToMystery(data.isClueFor, id);
    }
    if (data.isRedHerringFor) {
      this.addRedHerringToMystery(data.isRedHerringFor, id);
    }
    if (data.isSolutionFor) {
      this.solveMystery(data.isSolutionFor, id, data.deliveredChapter);
    }

    // Check for dramatic irony creation
    if (data.unknownToCharacters && data.unknownToCharacters.length > 0) {
      this.checkForDramaticIrony(knowledge);
    }

    return knowledge;
  }

  /**
   * Store knowledge and update indices
   */
  private storeKnowledge(knowledge: ReaderKnowledge): void {
    this.knowledge.set(knowledge.id, knowledge);

    // Index by type
    if (!this.knowledgeByType.has(knowledge.type)) {
      this.knowledgeByType.set(knowledge.type, new Set());
    }
    this.knowledgeByType.get(knowledge.type)!.add(knowledge.id);

    // Index by chapter
    if (!this.knowledgeByChapter.has(knowledge.deliveredChapter)) {
      this.knowledgeByChapter.set(knowledge.deliveredChapter, new Set());
    }
    this.knowledgeByChapter.get(knowledge.deliveredChapter)!.add(knowledge.id);

    // Index by subject
    if (!this.knowledgeBySubject.has(knowledge.subject)) {
      this.knowledgeBySubject.set(knowledge.subject, new Set());
    }
    this.knowledgeBySubject.get(knowledge.subject)!.add(knowledge.id);

    // Index by characters who know
    for (const charId of knowledge.knownByCharacters) {
      if (!this.knowledgeByCharacter.has(charId)) {
        this.knowledgeByCharacter.set(charId, new Set());
      }
      this.knowledgeByCharacter.get(charId)!.add(knowledge.id);
    }
  }

  /**
   * Get knowledge by ID
   */
  getKnowledge(id: string): ReaderKnowledge | undefined {
    return this.knowledge.get(id);
  }

  /**
   * Update knowledge (e.g., when corrected or revealed to be false)
   */
  updateKnowledge(
    id: string,
    updates: Partial<Omit<ReaderKnowledge, 'id' | 'createdAt'>>
  ): ReaderKnowledge | undefined {
    const knowledge = this.knowledge.get(id);
    if (!knowledge) return undefined;

    const updated: ReaderKnowledge = {
      ...knowledge,
      ...updates,
      updatedAt: new Date()
    };

    this.knowledge.set(id, updated);
    return updated;
  }

  /**
   * Mark knowledge as referenced in a chapter
   */
  referenceKnowledge(id: string, chapter: number): void {
    const knowledge = this.knowledge.get(id);
    if (!knowledge) return;

    if (!knowledge.referencedInChapters.includes(chapter)) {
      knowledge.referencedInChapters.push(chapter);
      knowledge.referencedInChapters.sort((a, b) => a - b);
    }
    knowledge.lastReferencedChapter = Math.max(
      knowledge.lastReferencedChapter ?? 0,
      chapter
    );
    knowledge.updatedAt = new Date();
  }

  /**
   * Reveal knowledge to character (resolves dramatic irony)
   */
  revealToCharacter(
    knowledgeId: string,
    characterId: string,
    chapter: number
  ): void {
    const knowledge = this.knowledge.get(knowledgeId);
    if (!knowledge) return;

    // Update character lists
    if (!knowledge.knownByCharacters.includes(characterId)) {
      knowledge.knownByCharacters.push(characterId);
    }
    knowledge.unknownToCharacters = knowledge.unknownToCharacters.filter(
      id => id !== characterId
    );

    // Update dramatic relationship
    const relationship = knowledge.dramaticRelationships.find(
      dr => dr.characterId === characterId
    );
    if (relationship) {
      relationship.until = chapter;
      relationship.relationship = DramaticRelationship.BOTH_KNOW;
    }

    knowledge.updatedAt = new Date();

    // Check if this resolves any dramatic irony
    this.checkDramaticIronyResolution(knowledgeId, characterId, chapter);
  }

  /**
   * Supersede knowledge with new information
   */
  supersedeKnowledge(
    oldId: string,
    newKnowledgeData: Parameters<ReaderPerspectiveTracker['deliverKnowledge']>[0]
  ): ReaderKnowledge {
    const oldKnowledge = this.knowledge.get(oldId);
    if (oldKnowledge) {
      oldKnowledge.supersededBy = 'pending';
    }

    const newKnowledge = this.deliverKnowledge({
      ...newKnowledgeData,
      notes: `Supersedes: ${oldKnowledge?.shortDescription ?? oldId}`
    });

    if (oldKnowledge) {
      oldKnowledge.supersededBy = newKnowledge.id;
      newKnowledge.relatedKnowledge.push(oldId);
    }

    return newKnowledge;
  }

  // ==========================================================================
  // MYSTERY MANAGEMENT
  // ==========================================================================

  /**
   * Create a tracked mystery
   */
  createMystery(data: {
    name: string;
    question: string;
    posedChapter: number;
    posedContext: string;
    difficultyRating?: TrackedMystery['difficultyRating'];
  }): TrackedMystery {
    const id = uuidv4();
    const now = new Date();

    const mystery: TrackedMystery = {
      id,
      name: data.name,
      question: data.question,
      status: 'open',
      posedChapter: data.posedChapter,
      posedContext: data.posedContext,
      clueIds: [],
      redHerringIds: [],
      clueDistribution: [],
      fairPlay: false,
      difficultyRating: data.difficultyRating ?? 3,
      createdAt: now,
      updatedAt: now
    };

    this.mysteries.set(id, mystery);
    return mystery;
  }

  /**
   * Get mystery by ID
   */
  getMystery(id: string): TrackedMystery | undefined {
    return this.mysteries.get(id);
  }

  /**
   * Add clue to mystery
   */
  addClueToMystery(mysteryId: string, knowledgeId: string): void {
    const mystery = this.mysteries.get(mysteryId);
    const knowledge = this.knowledge.get(knowledgeId);

    if (!mystery || !knowledge) return;

    if (!mystery.clueIds.includes(knowledgeId)) {
      mystery.clueIds.push(knowledgeId);
      mystery.clueDistribution.push({
        chapter: knowledge.deliveredChapter,
        clueId: knowledgeId
      });
      mystery.clueDistribution.sort((a, b) => a.chapter - b.chapter);

      // Check fair play
      mystery.fairPlay = mystery.clueIds.length >= this.config.mysteryClueRequirement;

      knowledge.isClueFor = mysteryId;
      knowledge.mysteryId = mysteryId;

      mystery.updatedAt = new Date();
      knowledge.updatedAt = new Date();
    }
  }

  /**
   * Add red herring to mystery
   */
  addRedHerringToMystery(mysteryId: string, knowledgeId: string): void {
    const mystery = this.mysteries.get(mysteryId);
    const knowledge = this.knowledge.get(knowledgeId);

    if (!mystery || !knowledge) return;

    if (!mystery.redHerringIds.includes(knowledgeId)) {
      mystery.redHerringIds.push(knowledgeId);

      knowledge.isRedHerringFor = mysteryId;
      knowledge.mysteryId = mysteryId;
      knowledge.confidence = ReaderConfidence.MISLEADING;

      mystery.updatedAt = new Date();
      knowledge.updatedAt = new Date();
    }
  }

  /**
   * Solve mystery
   */
  solveMystery(
    mysteryId: string,
    solutionKnowledgeId: string,
    chapter: number
  ): void {
    const mystery = this.mysteries.get(mysteryId);
    const solution = this.knowledge.get(solutionKnowledgeId);

    if (!mystery || !solution) return;

    mystery.status = 'solved';
    mystery.solvedChapter = chapter;
    mystery.solutionId = solutionKnowledgeId;
    mystery.solution = solution.content;
    mystery.revealMethod = solution.deliveryMethod;

    solution.isSolutionFor = mysteryId;
    solution.mysteryId = mysteryId;

    mystery.updatedAt = new Date();
    solution.updatedAt = new Date();
  }

  /**
   * Get open mysteries
   */
  getOpenMysteries(): TrackedMystery[] {
    return Array.from(this.mysteries.values())
      .filter(m => m.status === 'open' || m.status === 'partially_solved');
  }

  /**
   * Analyze mystery fair play
   */
  analyzeMysteryFairPlay(mysteryId: string): {
    fairPlay: boolean;
    clueCount: number;
    redHerringCount: number;
    clueChapters: number[];
    solutionChapter?: number;
    cluesBeforeSolution: number;
    verdict: string;
  } {
    const mystery = this.mysteries.get(mysteryId);
    if (!mystery) {
      return {
        fairPlay: false,
        clueCount: 0,
        redHerringCount: 0,
        clueChapters: [],
        cluesBeforeSolution: 0,
        verdict: 'Mystery not found'
      };
    }

    const clueChapters = mystery.clueDistribution.map(c => c.chapter);
    const cluesBeforeSolution = mystery.solvedChapter
      ? clueChapters.filter(c => c < mystery.solvedChapter!).length
      : mystery.clueIds.length;

    let verdict: string;
    if (cluesBeforeSolution >= this.config.mysteryClueRequirement) {
      verdict = 'Fair play: Reader had sufficient clues';
    } else if (cluesBeforeSolution >= 1) {
      verdict = 'Borderline: Some clues but may feel unfair';
    } else {
      verdict = 'Unfair: No meaningful clues before solution';
    }

    return {
      fairPlay: mystery.fairPlay,
      clueCount: mystery.clueIds.length,
      redHerringCount: mystery.redHerringIds.length,
      clueChapters,
      solutionChapter: mystery.solvedChapter,
      cluesBeforeSolution,
      verdict
    };
  }

  // ==========================================================================
  // DRAMATIC IRONY MANAGEMENT
  // ==========================================================================

  /**
   * Check if knowledge creates dramatic irony
   */
  private checkForDramaticIrony(knowledge: ReaderKnowledge): void {
    if (knowledge.unknownToCharacters.length === 0) return;
    if (knowledge.importanceLevel === 'minor') return;

    // Check importance threshold
    const importanceLevels = ['critical', 'major', 'moderate', 'minor'];
    const importanceIndex = importanceLevels.indexOf(knowledge.importanceLevel);
    if (importanceIndex > this.config.dramaticIronyThreshold) return;

    // Create dramatic irony tracking
    const irony: DramaticIrony = {
      id: uuidv4(),
      name: `Irony: ${knowledge.shortDescription}`,
      description: `Reader knows "${knowledge.shortDescription}" but characters don't`,
      readerKnowledgeIds: [knowledge.id],
      unawareCharacterIds: [...knowledge.unknownToCharacters],
      establishedChapter: knowledge.deliveredChapter,
      tensionLevel: 5 + (3 - importanceIndex), // Higher importance = higher tension
      narrativePurpose: 'Creates suspense/dramatic tension',
      anticipatedPayoff: 'Character discovers the truth',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dramaticIronies.set(irony.id, irony);
  }

  /**
   * Check if dramatic irony is resolved
   */
  private checkDramaticIronyResolution(
    knowledgeId: string,
    characterId: string,
    chapter: number
  ): void {
    for (const irony of this.dramaticIronies.values()) {
      if (irony.status !== 'active') continue;
      if (!irony.readerKnowledgeIds.includes(knowledgeId)) continue;
      if (!irony.unawareCharacterIds.includes(characterId)) continue;

      // Remove character from unaware list
      irony.unawareCharacterIds = irony.unawareCharacterIds.filter(
        id => id !== characterId
      );

      // If no unaware characters left, resolve irony
      if (irony.unawareCharacterIds.length === 0) {
        irony.status = 'resolved';
        irony.resolvedChapter = chapter;
        irony.duration = chapter - irony.establishedChapter;
        irony.actualPayoff = `Revealed to all relevant characters in chapter ${chapter}`;
      }

      irony.updatedAt = new Date();
    }
  }

  /**
   * Get active dramatic ironies
   */
  getActiveDramaticIronies(): DramaticIrony[] {
    return Array.from(this.dramaticIronies.values())
      .filter(di => di.status === 'active');
  }

  /**
   * Get dramatic ironies involving a character
   */
  getDramaticIroniesForCharacter(characterId: string): DramaticIrony[] {
    return Array.from(this.dramaticIronies.values())
      .filter(di =>
        di.status === 'active' &&
        di.unawareCharacterIds.includes(characterId)
      );
  }

  // ==========================================================================
  // QUERIES
  // ==========================================================================

  /**
   * Get all knowledge by chapter
   */
  getKnowledgeByChapter(chapter: number): ReaderKnowledge[] {
    const ids = this.knowledgeByChapter.get(chapter);
    if (!ids) return [];
    return Array.from(ids).map(id => this.knowledge.get(id)!).filter(Boolean);
  }

  /**
   * Get all knowledge about a subject
   */
  getKnowledgeAbout(subject: string): ReaderKnowledge[] {
    const ids = this.knowledgeBySubject.get(subject);
    if (!ids) return [];
    return Array.from(ids).map(id => this.knowledge.get(id)!).filter(Boolean);
  }

  /**
   * Get knowledge by type
   */
  getKnowledgeByType(type: ReaderKnowledgeType): ReaderKnowledge[] {
    const ids = this.knowledgeByType.get(type);
    if (!ids) return [];
    return Array.from(ids).map(id => this.knowledge.get(id)!).filter(Boolean);
  }

  /**
   * Get what reader knows that character doesn't
   */
  getReaderAdvantageOver(characterId: string): ReaderKnowledge[] {
    return Array.from(this.knowledge.values())
      .filter(k =>
        k.unknownToCharacters.includes(characterId) &&
        !k.supersededBy
      );
  }

  /**
   * Get what character knows that reader might not
   * (based on off-screen events)
   */
  getCharacterAdvantageOver(characterId: string): ReaderKnowledge[] {
    const characterKnowledge = this.knowledgeByCharacter.get(characterId);
    if (!characterKnowledge) return [];

    // This would need integration with character knowledge tracker
    // For now, return knowledge where character knows but delivery was uncertain
    return Array.from(characterKnowledge)
      .map(id => this.knowledge.get(id)!)
      .filter(k =>
        k &&
        (k.confidence === ReaderConfidence.UNCERTAIN ||
         k.confidence === ReaderConfidence.SUSPICIOUS)
      );
  }

  /**
   * Get reader's knowledge state at a specific chapter
   */
  getReaderStateAtChapter(chapter: number): {
    knownFacts: ReaderKnowledge[];
    activeDramaticIronies: DramaticIrony[];
    openMysteries: TrackedMystery[];
    misleadingBeliefs: ReaderKnowledge[];
  } {
    const knownFacts = Array.from(this.knowledge.values())
      .filter(k =>
        k.deliveredChapter <= chapter &&
        !k.supersededBy
      );

    const activeDramaticIronies = Array.from(this.dramaticIronies.values())
      .filter(di =>
        di.establishedChapter <= chapter &&
        (di.status === 'active' || (di.resolvedChapter && di.resolvedChapter > chapter))
      );

    const openMysteries = Array.from(this.mysteries.values())
      .filter(m =>
        m.posedChapter <= chapter &&
        (m.status === 'open' || (m.solvedChapter && m.solvedChapter > chapter))
      );

    const misleadingBeliefs = knownFacts.filter(k =>
      !k.isTrue || k.confidence === ReaderConfidence.MISLEADING
    );

    return {
      knownFacts,
      activeDramaticIronies,
      openMysteries,
      misleadingBeliefs
    };
  }

  // ==========================================================================
  // SNAPSHOTS
  // ==========================================================================

  /**
   * Take a snapshot of reader knowledge state
   */
  takeSnapshot(chapter: number): ReaderStateSnapshot {
    const state = this.getReaderStateAtChapter(chapter);
    const byType: Record<string, number> = {};

    for (const k of state.knownFacts) {
      byType[k.type] = (byType[k.type] ?? 0) + 1;
    }

    // Get recent revelations (last 10 chapters)
    const recentRevelations = state.knownFacts
      .filter(k => k.deliveredChapter > chapter - 10)
      .map(k => k.id);

    const snapshot: ReaderStateSnapshot = {
      chapter,
      knowledgeIds: state.knownFacts.map(k => k.id),
      totalKnowledge: state.knownFacts.length,
      byType,
      activeDramaticIronies: state.activeDramaticIronies.map(di => di.id),
      openMysteries: state.openMysteries.map(m => m.id),
      recentRevelations,
      timestamp: new Date()
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  /**
   * Get snapshots
   */
  getSnapshots(): ReaderStateSnapshot[] {
    return [...this.snapshots];
  }

  // ==========================================================================
  // ANALYSIS
  // ==========================================================================

  /**
   * Analyze information delivery pacing
   */
  analyzeDeliveryPacing(startChapter: number, endChapter: number): {
    totalDelivered: number;
    avgPerChapter: number;
    byMethod: Record<string, number>;
    byType: Record<string, number>;
    peakChapters: number[];
    drySpells: Array<{ start: number; end: number; length: number }>;
  } {
    const knowledge = Array.from(this.knowledge.values())
      .filter(k =>
        k.deliveredChapter >= startChapter &&
        k.deliveredChapter <= endChapter
      );

    const byMethod: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const chapterCounts: Record<number, number> = {};

    for (const k of knowledge) {
      byMethod[k.deliveryMethod] = (byMethod[k.deliveryMethod] ?? 0) + 1;
      byType[k.type] = (byType[k.type] ?? 0) + 1;
      chapterCounts[k.deliveredChapter] = (chapterCounts[k.deliveredChapter] ?? 0) + 1;
    }

    // Find peak chapters (above average)
    const avgPerChapter = knowledge.length / (endChapter - startChapter + 1);
    const peakChapters = Object.entries(chapterCounts)
      .filter(([_, count]) => count > avgPerChapter * 1.5)
      .map(([ch, _]) => parseInt(ch));

    // Find dry spells (3+ consecutive chapters with no reveals)
    const drySpells: Array<{ start: number; end: number; length: number }> = [];
    let dryStart: number | null = null;

    for (let ch = startChapter; ch <= endChapter; ch++) {
      if (!chapterCounts[ch] || chapterCounts[ch] === 0) {
        if (dryStart === null) dryStart = ch;
      } else {
        if (dryStart !== null && ch - dryStart >= 3) {
          drySpells.push({
            start: dryStart,
            end: ch - 1,
            length: ch - dryStart
          });
        }
        dryStart = null;
      }
    }

    return {
      totalDelivered: knowledge.length,
      avgPerChapter,
      byMethod,
      byType,
      peakChapters,
      drySpells
    };
  }

  /**
   * Find potential plot holes (references to unknown information)
   */
  findPotentialPlotHoles(): Array<{
    description: string;
    chapter: number;
    severity: 'error' | 'warning';
    suggestion: string;
  }> {
    const issues: Array<{
      description: string;
      chapter: number;
      severity: 'error' | 'warning';
      suggestion: string;
    }> = [];

    // Check for unresolved mysteries after long time
    for (const mystery of this.mysteries.values()) {
      if (mystery.status === 'open') {
        const clueGap = mystery.clueDistribution.length > 0
          ? Math.max(...mystery.clueDistribution.map(c => c.chapter)) - mystery.posedChapter
          : 0;

        if (clueGap > 500 && mystery.clueIds.length < 3) {
          issues.push({
            description: `Mystery "${mystery.name}" has few clues over ${clueGap} chapters`,
            chapter: mystery.posedChapter,
            severity: 'warning',
            suggestion: 'Add more clues or resolve mystery'
          });
        }
      }
    }

    // Check for superseded knowledge never corrected
    for (const knowledge of this.knowledge.values()) {
      if (!knowledge.isTrue && !knowledge.supersededBy) {
        const chaptersSince = Math.max(
          ...Array.from(this.knowledge.values()).map(k => k.deliveredChapter)
        ) - knowledge.deliveredChapter;

        if (chaptersSince > 200) {
          issues.push({
            description: `False information "${knowledge.shortDescription}" never corrected`,
            chapter: knowledge.deliveredChapter,
            severity: 'error',
            suggestion: 'Reveal the truth or this becomes a plot hole'
          });
        }
      }
    }

    // Check for dramatic ironies lasting too long
    for (const irony of this.dramaticIronies.values()) {
      if (irony.status === 'active' && irony.tensionLevel >= 8) {
        const currentChapter = Math.max(
          ...Array.from(this.knowledge.values()).map(k => k.deliveredChapter)
        );
        const duration = currentChapter - irony.establishedChapter;

        if (duration > 300) {
          issues.push({
            description: `High-tension dramatic irony "${irony.name}" unresolved for ${duration} chapters`,
            chapter: irony.establishedChapter,
            severity: 'warning',
            suggestion: 'Resolve or the tension may feel forgotten'
          });
        }
      }
    }

    return issues;
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    totalKnowledge: number;
    byType: Record<string, number>;
    byMethod: Record<string, number>;
    byConfidence: Record<string, number>;
    truthfulPercentage: number;
    totalMysteries: number;
    openMysteries: number;
    solvedMysteries: number;
    avgCluesPerMystery: number;
    activeDramaticIronies: number;
    resolvedDramaticIronies: number;
    avgIronyDuration: number;
  } {
    const knowledge = Array.from(this.knowledge.values());
    const mysteries = Array.from(this.mysteries.values());
    const ironies = Array.from(this.dramaticIronies.values());

    const byType: Record<string, number> = {};
    const byMethod: Record<string, number> = {};
    const byConfidence: Record<string, number> = {};
    let truthful = 0;

    for (const k of knowledge) {
      byType[k.type] = (byType[k.type] ?? 0) + 1;
      byMethod[k.deliveryMethod] = (byMethod[k.deliveryMethod] ?? 0) + 1;
      byConfidence[k.confidence] = (byConfidence[k.confidence] ?? 0) + 1;
      if (k.isTrue) truthful++;
    }

    const totalClues = mysteries.reduce((sum, m) => sum + m.clueIds.length, 0);
    const resolvedIronies = ironies.filter(i => i.status === 'resolved');
    const totalDuration = resolvedIronies.reduce(
      (sum, i) => sum + (i.duration ?? 0), 0
    );

    return {
      totalKnowledge: knowledge.length,
      byType,
      byMethod,
      byConfidence,
      truthfulPercentage: knowledge.length > 0 ? (truthful / knowledge.length) * 100 : 100,
      totalMysteries: mysteries.length,
      openMysteries: mysteries.filter(m => m.status === 'open').length,
      solvedMysteries: mysteries.filter(m => m.status === 'solved').length,
      avgCluesPerMystery: mysteries.length > 0 ? totalClues / mysteries.length : 0,
      activeDramaticIronies: ironies.filter(i => i.status === 'active').length,
      resolvedDramaticIronies: resolvedIronies.length,
      avgIronyDuration: resolvedIronies.length > 0 ? totalDuration / resolvedIronies.length : 0
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
      knowledge: Array.from(this.knowledge.values()),
      mysteries: Array.from(this.mysteries.values()),
      dramaticIronies: Array.from(this.dramaticIronies.values()),
      snapshots: this.snapshots,
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

    if (data.knowledge) {
      for (const k of data.knowledge) {
        k.createdAt = new Date(k.createdAt);
        k.updatedAt = new Date(k.updatedAt);
        this.storeKnowledge(k);
      }
    }

    if (data.mysteries) {
      for (const m of data.mysteries) {
        m.createdAt = new Date(m.createdAt);
        m.updatedAt = new Date(m.updatedAt);
        this.mysteries.set(m.id, m);
      }
    }

    if (data.dramaticIronies) {
      for (const di of data.dramaticIronies) {
        di.createdAt = new Date(di.createdAt);
        di.updatedAt = new Date(di.updatedAt);
        this.dramaticIronies.set(di.id, di);
      }
    }

    if (data.snapshots) {
      this.snapshots = data.snapshots.map((s: ReaderStateSnapshot) => ({
        ...s,
        timestamp: new Date(s.timestamp)
      }));
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.knowledge.clear();
    this.mysteries.clear();
    this.dramaticIronies.clear();
    this.snapshots = [];
    this.knowledgeByType.clear();
    this.knowledgeByChapter.clear();
    this.knowledgeBySubject.clear();
    this.knowledgeByCharacter.clear();
  }
}

// Default instance
export const readerPerspectiveTracker = new ReaderPerspectiveTracker();

export default ReaderPerspectiveTracker;
