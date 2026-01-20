/**
 * Foreshadowing Inventory - Setup and Payoff Management
 *
 * In 12,008 chapters, tracking every setup that needs a payoff is essential.
 * This system manages:
 * - Foreshadowing setups and their planned payoffs
 * - Chekhov's guns (introduced elements that must fire)
 * - Promises to readers (genre expectations, character setups)
 * - Red herrings and misdirection
 * - Prophecies and their fulfillment
 *
 * Every promise must be kept - or deliberately subverted.
 */

import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Foreshadowing types
 */
export enum ForeshadowingType {
  SETUP = 'setup',                   // Element introduced for later use
  HINT = 'hint',                     // Subtle clue
  PROPHECY = 'prophecy',             // Explicit prediction
  PROMISE = 'promise',               // Reader expectation set
  CHEKHOVS_GUN = 'chekhovs_gun',     // Element that must fire
  CALLBACK = 'callback',             // Reference to earlier event
  RED_HERRING = 'red_herring',       // Intentional misdirection
  THEMATIC = 'thematic',             // Theme establishment
  CHARACTER_SEED = 'character_seed', // Future character development
  WORLD_SEED = 'world_seed'          // Future world revelation
}

/**
 * Setup subtlety level
 */
export enum SubtletyLevel {
  EXPLICIT = 0,                      // Clearly stated
  OBVIOUS = 1,                       // Easy to notice
  MODERATE = 2,                      // Requires attention
  SUBTLE = 3,                        // Easy to miss
  HIDDEN = 4,                        // Very obscure
  SUBLIMINAL = 5                     // Almost invisible
}

/**
 * Payoff satisfaction level
 */
export enum PayoffSatisfaction {
  PERFECT = 'perfect',               // Exactly what was promised
  EXCEEDED = 'exceeded',             // Better than expected
  SATISFACTORY = 'satisfactory',     // Good enough
  UNDERWHELMING = 'underwhelming',   // Disappointing
  MISSED = 'missed',                 // Didn't deliver
  SUBVERTED = 'subverted'            // Deliberately different
}

/**
 * Promise status
 */
export enum PromiseStatus {
  PENDING = 'pending',               // Awaiting payoff
  PARTIALLY_PAID = 'partially_paid', // Some payoff delivered
  PAID = 'paid',                     // Fully resolved
  ABANDONED = 'abandoned',           // Dropped (bad)
  SUBVERTED = 'subverted'            // Intentionally broken
}

/**
 * Urgency of payoff
 */
export enum PayoffUrgency {
  FLEXIBLE = 'flexible',             // No time pressure
  MODERATE = 'moderate',             // Should happen eventually
  SOON = 'soon',                     // Readers expecting it
  URGENT = 'urgent',                 // Overdue
  CRITICAL = 'critical'              // Readers frustrated
}

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * A foreshadowing setup
 */
export interface ForeshadowingSetup {
  id: string;
  type: ForeshadowingType;
  name: string;
  description: string;

  // Setup details
  setupChapter: number;
  setupSceneId?: string;
  setupMethod: string;               // How it was introduced
  subtlety: SubtletyLevel;

  // What's foreshadowed
  foreshadowedElement: string;
  expectedPayoff: string;
  plannedPayoffChapter?: number;
  maxChapterDistance?: number;       // Must pay off within N chapters

  // Status
  status: PromiseStatus;
  urgency: PayoffUrgency;

  // Payoffs
  payoffs: Payoff[];
  isPaidOff: boolean;

  // Connections
  relatedSetupIds: string[];         // Connected foreshadowing
  characterIds: string[];
  plotIds: string[];

  // For misdirection
  isRedHerring: boolean;
  actualMeaning?: string;            // What it really means (for red herrings)

  // Tracking
  readerAwareness: 'likely_noticed' | 'possibly_noticed' | 'probably_missed';
  reminderChapters: number[];        // Chapters where it was reinforced

  notes: string;
}

/**
 * A payoff delivery
 */
export interface Payoff {
  id: string;
  setupId: string;
  chapter: number;
  sceneId?: string;

  // Details
  description: string;
  method: string;                    // How payoff was delivered
  satisfaction: PayoffSatisfaction;

  // Metrics
  distanceFromSetup: number;         // Chapters between setup and payoff
  wasReminded: boolean;              // Was setup reminded before payoff?
  lastReminderChapter?: number;

  // Reader experience
  clarityScore: number;              // 0-100: How clear was the connection?
  impactScore: number;               // 0-100: Emotional impact

  // If subverted
  subversionReason?: string;

  notes: string;
}

/**
 * Chekhov's Gun - specific element that must fire
 */
export interface ChekhovsGun {
  id: string;
  name: string;
  description: string;

  // What it is
  elementType: 'object' | 'skill' | 'character' | 'location' | 'information' | 'relationship';
  specificElement: string;

  // Introduction
  introductionChapter: number;
  introductionContext: string;

  // Firing
  mustFireBy?: number;               // Chapter deadline
  hasFired: boolean;
  firingChapter?: number;
  firingContext?: string;

  // Related
  characterIds: string[];
  setupId?: string;                  // Link to foreshadowing setup

  notes: string;
}

/**
 * Prophecy tracking
 */
export interface Prophecy {
  id: string;
  name: string;
  fullText: string;                  // The prophecy text

  // Source
  sourceCharacter?: string;
  sourceChapter: number;
  isReliable: boolean;               // Can this source be trusted?

  // Components
  components: ProphecyComponent[];

  // Interpretation
  obviousInterpretation: string;
  hiddenInterpretation?: string;
  actualInterpretation?: string;     // What it really meant

  // Fulfillment
  status: 'pending' | 'partially_fulfilled' | 'fulfilled' | 'broken' | 'inverted';
  fulfillmentChapter?: number;

  // Reader knowledge
  knownToCharacterIds: string[];
  characterInterpretations: {
    characterId: string;
    interpretation: string;
    chapter: number;
  }[];

  notes: string;
}

/**
 * Part of a prophecy
 */
export interface ProphecyComponent {
  id: string;
  text: string;
  obviousMeaning: string;
  hiddenMeaning?: string;
  actualMeaning?: string;
  isFulfilled: boolean;
  fulfillmentChapter?: number;
  fulfillmentDescription?: string;
}

/**
 * Reader promise (genre/narrative expectations)
 */
export interface ReaderPromise {
  id: string;
  promise: string;
  type: 'genre' | 'character' | 'relationship' | 'plot' | 'tone' | 'mystery' | 'custom';

  // When established
  establishedChapter: number;
  establishedBy: string;             // What established this expectation

  // Fulfillment
  status: PromiseStatus;
  fulfillmentChapter?: number;
  fulfillmentDescription?: string;

  // If broken
  wasIntentional: boolean;
  breakageJustification?: string;

  // Impact
  readerImportance: 'critical' | 'important' | 'moderate' | 'minor';

  notes: string;
}

/**
 * Fairness analysis for mystery/twist
 */
export interface FairPlayAnalysis {
  setupId: string;

  // Clues provided
  cluesGiven: {
    chapter: number;
    clue: string;
    subtlety: SubtletyLevel;
  }[];

  // Evaluation
  totalClues: number;
  obviousClues: number;
  hiddenClues: number;

  // Fairness scores
  clueAvailabilityScore: number;     // Were clues actually available?
  clueVisibilityScore: number;       // Could readers reasonably find them?
  solutionDeducibilityScore: number; // Could readers figure it out?
  overallFairnessScore: number;      // Composite

  // Verdict
  isFairPlay: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Foreshadowing health report
 */
export interface ForeshadowingHealth {
  // Counts
  totalSetups: number;
  pendingSetups: number;
  paidSetups: number;
  overdueSetups: number;

  // By type
  byType: Record<ForeshadowingType, { total: number; pending: number; paid: number }>;

  // Issues
  urgentPayoffs: ForeshadowingSetup[];
  forgottenSetups: ForeshadowingSetup[];
  orphanedGuns: ChekhovsGun[];
  unfulfilledProphecies: Prophecy[];

  // Metrics
  averagePayoffDistance: number;
  longestPendingSetup: ForeshadowingSetup | null;

  // Recommendations
  recommendations: string[];
}

/**
 * System configuration
 */
export interface ForeshadowingConfig {
  defaultMaxDistance: number;        // Default max chapters to payoff
  urgentThresholdChapters: number;   // When to mark as urgent
  reminderFrequency: number;         // Suggest reminders every N chapters
  warnOnAbandonedSetups: boolean;
}

// =============================================================================
// FORESHADOWING SYSTEM CLASS
// =============================================================================

export class ForeshadowingSystem {
  // Data storage
  private setups: Map<string, ForeshadowingSetup> = new Map();
  private payoffs: Map<string, Payoff> = new Map();
  private guns: Map<string, ChekhovsGun> = new Map();
  private prophecies: Map<string, Prophecy> = new Map();
  private promises: Map<string, ReaderPromise> = new Map();

  // Indexes
  private setupsByType: Map<ForeshadowingType, Set<string>> = new Map();
  private setupsByStatus: Map<PromiseStatus, Set<string>> = new Map();
  private setupsByCharacter: Map<string, Set<string>> = new Map();
  private payoffsBySetup: Map<string, Set<string>> = new Map();

  // Configuration
  private config: ForeshadowingConfig = {
    defaultMaxDistance: 500,
    urgentThresholdChapters: 100,
    reminderFrequency: 50,
    warnOnAbandonedSetups: true
  };

  constructor() {
    // Initialize indexes
    for (const type of Object.values(ForeshadowingType)) {
      this.setupsByType.set(type, new Set());
    }
    for (const status of Object.values(PromiseStatus)) {
      this.setupsByStatus.set(status, new Set());
    }
  }

  // ===========================================================================
  // SETUP MANAGEMENT
  // ===========================================================================

  /**
   * Create a foreshadowing setup
   */
  createSetup(data: Omit<ForeshadowingSetup, 'id' | 'status' | 'urgency' | 'payoffs' | 'isPaidOff' | 'reminderChapters'>): ForeshadowingSetup {
    const id = uuidv4();
    const setup: ForeshadowingSetup = {
      ...data,
      id,
      status: PromiseStatus.PENDING,
      urgency: PayoffUrgency.FLEXIBLE,
      payoffs: [],
      isPaidOff: false,
      reminderChapters: []
    };

    this.setups.set(id, setup);

    // Update indexes
    const typeSet = this.setupsByType.get(setup.type) || new Set();
    typeSet.add(id);
    this.setupsByType.set(setup.type, typeSet);

    const statusSet = this.setupsByStatus.get(PromiseStatus.PENDING) || new Set();
    statusSet.add(id);
    this.setupsByStatus.set(PromiseStatus.PENDING, statusSet);

    for (const charId of setup.characterIds) {
      const charSet = this.setupsByCharacter.get(charId) || new Set();
      charSet.add(id);
      this.setupsByCharacter.set(charId, charSet);
    }

    this.payoffsBySetup.set(id, new Set());

    return setup;
  }

  /**
   * Get setup by ID
   */
  getSetup(id: string): ForeshadowingSetup | undefined {
    return this.setups.get(id);
  }

  /**
   * Get setups by type
   */
  getSetupsByType(type: ForeshadowingType): ForeshadowingSetup[] {
    const ids = this.setupsByType.get(type) || new Set();
    return Array.from(ids)
      .map(id => this.setups.get(id))
      .filter((s): s is ForeshadowingSetup => s !== undefined);
  }

  /**
   * Get pending setups
   */
  getPendingSetups(): ForeshadowingSetup[] {
    return Array.from(this.setups.values())
      .filter(s => s.status === PromiseStatus.PENDING || s.status === PromiseStatus.PARTIALLY_PAID);
  }

  /**
   * Get overdue setups
   */
  getOverdueSetups(currentChapter: number): ForeshadowingSetup[] {
    return this.getPendingSetups().filter(s => {
      if (s.plannedPayoffChapter && currentChapter > s.plannedPayoffChapter + 50) {
        return true;
      }
      if (s.maxChapterDistance && currentChapter > s.setupChapter + s.maxChapterDistance) {
        return true;
      }
      return false;
    });
  }

  /**
   * Add reminder for setup
   */
  addReminder(setupId: string, chapter: number): void {
    const setup = this.setups.get(setupId);
    if (setup && !setup.reminderChapters.includes(chapter)) {
      setup.reminderChapters.push(chapter);
      setup.reminderChapters.sort((a, b) => a - b);
    }
  }

  /**
   * Update urgency based on current chapter
   */
  updateUrgency(setupId: string, currentChapter: number): PayoffUrgency {
    const setup = this.setups.get(setupId);
    if (!setup || setup.isPaidOff) return PayoffUrgency.FLEXIBLE;

    const distance = currentChapter - setup.setupChapter;
    const maxDistance = setup.maxChapterDistance || this.config.defaultMaxDistance;

    if (distance > maxDistance) {
      setup.urgency = PayoffUrgency.CRITICAL;
    } else if (distance > maxDistance * 0.8) {
      setup.urgency = PayoffUrgency.URGENT;
    } else if (distance > maxDistance * 0.6) {
      setup.urgency = PayoffUrgency.SOON;
    } else if (distance > maxDistance * 0.3) {
      setup.urgency = PayoffUrgency.MODERATE;
    } else {
      setup.urgency = PayoffUrgency.FLEXIBLE;
    }

    return setup.urgency;
  }

  // ===========================================================================
  // PAYOFF MANAGEMENT
  // ===========================================================================

  /**
   * Record a payoff
   */
  recordPayoff(data: Omit<Payoff, 'id' | 'distanceFromSetup'>): Payoff {
    const setup = this.setups.get(data.setupId);
    if (!setup) throw new Error(`Setup ${data.setupId} not found`);

    const id = uuidv4();
    const payoff: Payoff = {
      ...data,
      id,
      distanceFromSetup: data.chapter - setup.setupChapter,
      wasReminded: setup.reminderChapters.length > 0 &&
        setup.reminderChapters.some(r => r < data.chapter && r > setup.setupChapter),
      lastReminderChapter: setup.reminderChapters.filter(r => r < data.chapter).pop()
    };

    this.payoffs.set(id, payoff);
    setup.payoffs.push(payoff);

    // Update indexes
    const payoffSet = this.payoffsBySetup.get(data.setupId) || new Set();
    payoffSet.add(id);
    this.payoffsBySetup.set(data.setupId, payoffSet);

    // Update setup status
    if (payoff.satisfaction === PayoffSatisfaction.PERFECT ||
        payoff.satisfaction === PayoffSatisfaction.EXCEEDED ||
        payoff.satisfaction === PayoffSatisfaction.SATISFACTORY) {
      this.updateSetupStatus(data.setupId, PromiseStatus.PAID);
      setup.isPaidOff = true;
    } else if (payoff.satisfaction === PayoffSatisfaction.SUBVERTED) {
      this.updateSetupStatus(data.setupId, PromiseStatus.SUBVERTED);
      setup.isPaidOff = true;
    } else {
      this.updateSetupStatus(data.setupId, PromiseStatus.PARTIALLY_PAID);
    }

    return payoff;
  }

  /**
   * Update setup status
   */
  private updateSetupStatus(setupId: string, newStatus: PromiseStatus): void {
    const setup = this.setups.get(setupId);
    if (!setup) return;

    // Remove from old status index
    const oldSet = this.setupsByStatus.get(setup.status);
    if (oldSet) oldSet.delete(setupId);

    // Add to new status index
    const newSet = this.setupsByStatus.get(newStatus) || new Set();
    newSet.add(setupId);
    this.setupsByStatus.set(newStatus, newSet);

    setup.status = newStatus;
  }

  /**
   * Get payoffs for a setup
   */
  getPayoffsForSetup(setupId: string): Payoff[] {
    const ids = this.payoffsBySetup.get(setupId) || new Set();
    return Array.from(ids)
      .map(id => this.payoffs.get(id))
      .filter((p): p is Payoff => p !== undefined);
  }

  // ===========================================================================
  // CHEKHOV'S GUNS
  // ===========================================================================

  /**
   * Register a Chekhov's Gun
   */
  registerGun(data: Omit<ChekhovsGun, 'id' | 'hasFired'>): ChekhovsGun {
    const id = uuidv4();
    const gun: ChekhovsGun = {
      ...data,
      id,
      hasFired: false
    };

    this.guns.set(id, gun);

    return gun;
  }

  /**
   * Fire a Chekhov's Gun
   */
  fireGun(gunId: string, chapter: number, context: string): boolean {
    const gun = this.guns.get(gunId);
    if (!gun) return false;

    gun.hasFired = true;
    gun.firingChapter = chapter;
    gun.firingContext = context;

    return true;
  }

  /**
   * Get unfired guns
   */
  getUnfiredGuns(): ChekhovsGun[] {
    return Array.from(this.guns.values()).filter(g => !g.hasFired);
  }

  /**
   * Get overdue guns
   */
  getOverdueGuns(currentChapter: number): ChekhovsGun[] {
    return this.getUnfiredGuns().filter(g => g.mustFireBy && currentChapter > g.mustFireBy);
  }

  // ===========================================================================
  // PROPHECY MANAGEMENT
  // ===========================================================================

  /**
   * Create a prophecy
   */
  createProphecy(data: Omit<Prophecy, 'id' | 'components' | 'status' | 'characterInterpretations'>): Prophecy {
    const id = uuidv4();
    const prophecy: Prophecy = {
      ...data,
      id,
      components: [],
      status: 'pending',
      characterInterpretations: []
    };

    this.prophecies.set(id, prophecy);

    return prophecy;
  }

  /**
   * Add component to prophecy
   */
  addProphecyComponent(prophecyId: string, component: Omit<ProphecyComponent, 'id' | 'isFulfilled'>): ProphecyComponent {
    const prophecy = this.prophecies.get(prophecyId);
    if (!prophecy) throw new Error(`Prophecy ${prophecyId} not found`);

    const id = uuidv4();
    const fullComponent: ProphecyComponent = {
      ...component,
      id,
      isFulfilled: false
    };

    prophecy.components.push(fullComponent);

    return fullComponent;
  }

  /**
   * Fulfill prophecy component
   */
  fulfillComponent(prophecyId: string, componentId: string, chapter: number, description: string): boolean {
    const prophecy = this.prophecies.get(prophecyId);
    if (!prophecy) return false;

    const component = prophecy.components.find(c => c.id === componentId);
    if (!component) return false;

    component.isFulfilled = true;
    component.fulfillmentChapter = chapter;
    component.fulfillmentDescription = description;

    // Check if all components fulfilled
    const allFulfilled = prophecy.components.every(c => c.isFulfilled);
    if (allFulfilled) {
      prophecy.status = 'fulfilled';
      prophecy.fulfillmentChapter = chapter;
    } else if (prophecy.components.some(c => c.isFulfilled)) {
      prophecy.status = 'partially_fulfilled';
    }

    return true;
  }

  /**
   * Get active prophecies
   */
  getActiveProphecies(): Prophecy[] {
    return Array.from(this.prophecies.values())
      .filter(p => p.status === 'pending' || p.status === 'partially_fulfilled');
  }

  // ===========================================================================
  // READER PROMISES
  // ===========================================================================

  /**
   * Register a reader promise
   */
  registerPromise(data: Omit<ReaderPromise, 'id' | 'status'>): ReaderPromise {
    const id = uuidv4();
    const promise: ReaderPromise = {
      ...data,
      id,
      status: PromiseStatus.PENDING
    };

    this.promises.set(id, promise);

    return promise;
  }

  /**
   * Fulfill a promise
   */
  fulfillPromise(promiseId: string, chapter: number, description: string): boolean {
    const promise = this.promises.get(promiseId);
    if (!promise) return false;

    promise.status = PromiseStatus.PAID;
    promise.fulfillmentChapter = chapter;
    promise.fulfillmentDescription = description;

    return true;
  }

  /**
   * Break a promise (intentionally or not)
   */
  breakPromise(promiseId: string, wasIntentional: boolean, justification?: string): boolean {
    const promise = this.promises.get(promiseId);
    if (!promise) return false;

    promise.status = wasIntentional ? PromiseStatus.SUBVERTED : PromiseStatus.ABANDONED;
    promise.wasIntentional = wasIntentional;
    promise.breakageJustification = justification;

    return true;
  }

  /**
   * Get unfulfilled promises
   */
  getUnfulfilledPromises(): ReaderPromise[] {
    return Array.from(this.promises.values())
      .filter(p => p.status === PromiseStatus.PENDING);
  }

  // ===========================================================================
  // ANALYSIS
  // ===========================================================================

  /**
   * Analyze fair play for a mystery/twist
   */
  analyzeFairPlay(setupId: string): FairPlayAnalysis {
    const setup = this.setups.get(setupId);
    if (!setup) throw new Error(`Setup ${setupId} not found`);

    const cluesGiven: FairPlayAnalysis['cluesGiven'] = [];

    // Add the setup itself as a clue
    cluesGiven.push({
      chapter: setup.setupChapter,
      clue: setup.description,
      subtlety: setup.subtlety
    });

    // Add reminders as clues
    for (const reminderCh of setup.reminderChapters) {
      cluesGiven.push({
        chapter: reminderCh,
        clue: `Reminder of ${setup.name}`,
        subtlety: Math.min(setup.subtlety + 1, SubtletyLevel.SUBLIMINAL) as SubtletyLevel
      });
    }

    // Calculate scores
    const obviousClues = cluesGiven.filter(c => c.subtlety <= SubtletyLevel.OBVIOUS).length;
    const hiddenClues = cluesGiven.filter(c => c.subtlety >= SubtletyLevel.SUBTLE).length;

    const clueAvailabilityScore = Math.min(100, cluesGiven.length * 20);
    const clueVisibilityScore = Math.min(100, (obviousClues * 30) + ((cluesGiven.length - hiddenClues) * 10));

    // Deducibility based on subtlety distribution
    let solutionDeducibilityScore = 50;
    if (obviousClues >= 1) solutionDeducibilityScore += 30;
    if (cluesGiven.length >= 3) solutionDeducibilityScore += 20;
    if (setup.subtlety <= SubtletyLevel.MODERATE) solutionDeducibilityScore += 10;
    solutionDeducibilityScore = Math.min(100, solutionDeducibilityScore);

    const overallFairnessScore = Math.round(
      (clueAvailabilityScore + clueVisibilityScore + solutionDeducibilityScore) / 3
    );

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (cluesGiven.length < 3) {
      issues.push('Too few clues provided');
      recommendations.push('Add more reminders or hints before payoff');
    }
    if (obviousClues === 0) {
      issues.push('No obvious clues - readers may feel cheated');
      recommendations.push('Add at least one clear hint');
    }
    if (setup.subtlety >= SubtletyLevel.HIDDEN && setup.reminderChapters.length === 0) {
      issues.push('Hidden setup with no reminders');
      recommendations.push('Add reminders before payoff to reinforce the setup');
    }

    return {
      setupId,
      cluesGiven,
      totalClues: cluesGiven.length,
      obviousClues,
      hiddenClues,
      clueAvailabilityScore,
      clueVisibilityScore,
      solutionDeducibilityScore,
      overallFairnessScore,
      isFairPlay: overallFairnessScore >= 60,
      issues,
      recommendations
    };
  }

  /**
   * Get foreshadowing health report
   */
  getHealthReport(currentChapter: number): ForeshadowingHealth {
    const allSetups = Array.from(this.setups.values());
    const pending = this.getPendingSetups();
    const overdue = this.getOverdueSetups(currentChapter);

    // By type
    const byType: ForeshadowingHealth['byType'] = {} as any;
    for (const type of Object.values(ForeshadowingType)) {
      const typeSetups = this.getSetupsByType(type);
      byType[type] = {
        total: typeSetups.length,
        pending: typeSetups.filter(s => !s.isPaidOff).length,
        paid: typeSetups.filter(s => s.isPaidOff).length
      };
    }

    // Urgent payoffs
    const urgent = pending.filter(s =>
      s.urgency === PayoffUrgency.URGENT || s.urgency === PayoffUrgency.CRITICAL
    );

    // Forgotten (no reminder in long time, not paid)
    const forgotten = pending.filter(s => {
      const lastActivity = Math.max(
        s.setupChapter,
        ...s.reminderChapters,
        ...s.payoffs.map(p => p.chapter)
      );
      return currentChapter - lastActivity > this.config.reminderFrequency * 2;
    });

    // Orphaned guns
    const orphanedGuns = this.getOverdueGuns(currentChapter);

    // Unfulfilled prophecies that are old
    const unfulfilledProphecies = this.getActiveProphecies()
      .filter(p => currentChapter - p.sourceChapter > 200);

    // Average payoff distance
    const paidSetups = allSetups.filter(s => s.isPaidOff);
    const distances = paidSetups.flatMap(s => s.payoffs.map(p => p.distanceFromSetup));
    const avgDistance = distances.length > 0
      ? distances.reduce((a, b) => a + b, 0) / distances.length
      : 0;

    // Longest pending
    const longestPending = pending.length > 0
      ? pending.reduce((prev, curr) =>
          (currentChapter - curr.setupChapter) > (currentChapter - prev.setupChapter) ? curr : prev
        )
      : null;

    // Recommendations
    const recommendations: string[] = [];

    if (urgent.length > 0) {
      recommendations.push(`${urgent.length} setups need urgent payoff`);
    }
    if (forgotten.length > 0) {
      recommendations.push(`${forgotten.length} setups may be forgotten - add reminders`);
    }
    if (orphanedGuns.length > 0) {
      recommendations.push(`${orphanedGuns.length} Chekhov's guns past their deadline`);
    }
    if (longestPending && currentChapter - longestPending.setupChapter > 300) {
      recommendations.push(`"${longestPending.name}" has been pending for ${currentChapter - longestPending.setupChapter} chapters`);
    }

    return {
      totalSetups: allSetups.length,
      pendingSetups: pending.length,
      paidSetups: paidSetups.length,
      overdueSetups: overdue.length,
      byType,
      urgentPayoffs: urgent,
      forgottenSetups: forgotten,
      orphanedGuns,
      unfulfilledProphecies,
      averagePayoffDistance: Math.round(avgDistance),
      longestPendingSetup: longestPending,
      recommendations
    };
  }

  /**
   * Get setups needing reminders
   */
  getSetupsNeedingReminders(currentChapter: number): ForeshadowingSetup[] {
    return this.getPendingSetups().filter(s => {
      const lastReminder = s.reminderChapters.length > 0
        ? Math.max(...s.reminderChapters)
        : s.setupChapter;

      return currentChapter - lastReminder >= this.config.reminderFrequency;
    });
  }

  // ===========================================================================
  // REPORTS
  // ===========================================================================

  /**
   * Generate foreshadowing report
   */
  generateReport(currentChapter: number): string {
    const health = this.getHealthReport(currentChapter);

    let report = '# Foreshadowing & Payoff Report\n\n';

    // Summary
    report += '## Summary\n\n';
    report += `- **Total Setups:** ${health.totalSetups}\n`;
    report += `- **Pending:** ${health.pendingSetups}\n`;
    report += `- **Paid Off:** ${health.paidSetups}\n`;
    report += `- **Overdue:** ${health.overdueSetups}\n`;
    report += `- **Average Payoff Distance:** ${health.averagePayoffDistance} chapters\n\n`;

    // Urgent items
    if (health.urgentPayoffs.length > 0) {
      report += '## ⚠️ Urgent Payoffs Needed\n\n';
      for (const setup of health.urgentPayoffs) {
        const age = currentChapter - setup.setupChapter;
        report += `- **${setup.name}** (${age} chapters old, ${setup.urgency})\n`;
        report += `  - Expected: ${setup.expectedPayoff}\n`;
      }
      report += '\n';
    }

    // Chekhov's Guns
    const unfiredGuns = this.getUnfiredGuns();
    if (unfiredGuns.length > 0) {
      report += '## 🔫 Unfired Chekhov\'s Guns\n\n';
      for (const gun of unfiredGuns) {
        const status = gun.mustFireBy && currentChapter > gun.mustFireBy ? '⚠️ OVERDUE' : '';
        report += `- **${gun.name}** (${gun.elementType}) ${status}\n`;
      }
      report += '\n';
    }

    // Prophecies
    const activeProphecies = this.getActiveProphecies();
    if (activeProphecies.length > 0) {
      report += '## 🔮 Active Prophecies\n\n';
      for (const p of activeProphecies) {
        const fulfilled = p.components.filter(c => c.isFulfilled).length;
        report += `- **${p.name}**: ${fulfilled}/${p.components.length} components fulfilled\n`;
      }
      report += '\n';
    }

    // Recommendations
    if (health.recommendations.length > 0) {
      report += '## Recommendations\n\n';
      for (const rec of health.recommendations) {
        report += `- ${rec}\n`;
      }
    }

    return report;
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  /**
   * Get statistics
   */
  getStats(): {
    totalSetups: number;
    pendingSetups: number;
    paidSetups: number;
    totalGuns: number;
    unfiredGuns: number;
    totalProphecies: number;
    fulfilledProphecies: number;
    totalPromises: number;
    fulfilledPromises: number;
  } {
    return {
      totalSetups: this.setups.size,
      pendingSetups: this.getPendingSetups().length,
      paidSetups: Array.from(this.setups.values()).filter(s => s.isPaidOff).length,
      totalGuns: this.guns.size,
      unfiredGuns: this.getUnfiredGuns().length,
      totalProphecies: this.prophecies.size,
      fulfilledProphecies: Array.from(this.prophecies.values())
        .filter(p => p.status === 'fulfilled').length,
      totalPromises: this.promises.size,
      fulfilledPromises: Array.from(this.promises.values())
        .filter(p => p.status === PromiseStatus.PAID).length
    };
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      setups: Array.from(this.setups.entries()),
      payoffs: Array.from(this.payoffs.entries()),
      guns: Array.from(this.guns.entries()),
      prophecies: Array.from(this.prophecies.entries()),
      promises: Array.from(this.promises.entries()),
      config: this.config
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.setups) {
      this.setups = new Map(data.setups);
      // Rebuild indexes
      for (const type of Object.values(ForeshadowingType)) {
        this.setupsByType.set(type, new Set());
      }
      for (const status of Object.values(PromiseStatus)) {
        this.setupsByStatus.set(status, new Set());
      }
      this.setupsByCharacter.clear();
      this.payoffsBySetup.clear();

      for (const [id, setup] of this.setups) {
        const typeSet = this.setupsByType.get(setup.type) || new Set();
        typeSet.add(id);

        const statusSet = this.setupsByStatus.get(setup.status) || new Set();
        statusSet.add(id);

        for (const charId of setup.characterIds) {
          const charSet = this.setupsByCharacter.get(charId) || new Set();
          charSet.add(id);
          this.setupsByCharacter.set(charId, charSet);
        }

        this.payoffsBySetup.set(id, new Set(setup.payoffs.map(p => p.id)));
      }
    }

    if (data.payoffs) {
      this.payoffs = new Map(data.payoffs);
    }

    if (data.guns) {
      this.guns = new Map(data.guns);
    }

    if (data.prophecies) {
      this.prophecies = new Map(data.prophecies);
    }

    if (data.promises) {
      this.promises = new Map(data.promises);
    }

    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.setups.clear();
    this.payoffs.clear();
    this.guns.clear();
    this.prophecies.clear();
    this.promises.clear();

    for (const type of Object.values(ForeshadowingType)) {
      this.setupsByType.set(type, new Set());
    }
    for (const status of Object.values(PromiseStatus)) {
      this.setupsByStatus.set(status, new Set());
    }
    this.setupsByCharacter.clear();
    this.payoffsBySetup.clear();
  }
}

// Default instance
export const foreshadowingSystem = new ForeshadowingSystem();

export default ForeshadowingSystem;
