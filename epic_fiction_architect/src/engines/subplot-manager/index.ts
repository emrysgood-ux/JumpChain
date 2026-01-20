/**
 * Subplot Manager - Hierarchical Subplot and Sideplot Tracking
 *
 * In 12,008 chapter narratives, managing dozens of subplots is critical.
 * This system handles:
 * - Hierarchical plot structures (main → subplot → sub-subplot)
 * - Interweaving patterns between plots
 * - Resolution deadline tracking with urgency levels
 * - Unused/orphaned subplot detection
 * - Convergence point prediction
 * - Plot thread handoff between characters
 *
 * Every thread matters - track them all.
 */

import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Plot hierarchy level
 */
export enum PlotLevel {
  MAIN = 'main',                     // Central narrative
  MAJOR_SUBPLOT = 'major_subplot',   // Significant secondary thread
  MINOR_SUBPLOT = 'minor_subplot',   // Supporting thread
  SIDE_QUEST = 'side_quest',         // Optional adventure
  MICRO_PLOT = 'micro_plot',         // Very small thread
  RUNNING_GAG = 'running_gag',       // Recurring minor element
  BACKDROP = 'backdrop'              // World event affecting story
}

/**
 * Plot status
 */
export enum PlotStatus {
  PLANNED = 'planned',               // Not yet started
  SETUP = 'setup',                   // Being established
  ACTIVE = 'active',                 // In progress
  DORMANT = 'dormant',               // Paused but not resolved
  APPROACHING_CLIMAX = 'approaching_climax',
  CLIMAX = 'climax',
  RESOLUTION = 'resolution',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',           // Dropped (should be rare)
  MERGED = 'merged'                  // Merged into another plot
}

/**
 * Plot category
 */
export enum PlotCategory {
  // Action/Adventure
  ACTION = 'action',
  ADVENTURE = 'adventure',
  QUEST = 'quest',
  HEIST = 'heist',
  WAR = 'war',
  SURVIVAL = 'survival',
  CHASE = 'chase',

  // Mystery/Investigation
  MYSTERY = 'mystery',
  INVESTIGATION = 'investigation',
  DISCOVERY = 'discovery',
  CONSPIRACY = 'conspiracy',

  // Relationships
  ROMANCE = 'romance',
  RELATIONSHIP = 'relationship',
  FAMILY = 'family',
  FRIENDSHIP = 'friendship',
  RIVALRY = 'rivalry',
  BETRAYAL = 'betrayal',

  // Internal/Personal
  INTERNAL = 'internal',             // Inner journey, self-discovery
  PERSONAL = 'personal',
  IDENTITY = 'identity',             // Who am I?
  MORAL = 'moral',                   // Ethical dilemma
  REDEMPTION = 'redemption',
  CORRUPTION = 'corruption',
  GROWTH = 'growth',                 // Character development focus

  // External/Social
  POLITICAL = 'political',
  SOCIAL = 'social',                 // Social dynamics/class
  ECONOMIC = 'economic',             // Money/business
  REVENGE = 'revenge',

  // Tone-based
  TRAGEDY = 'tragedy',
  COMEDY = 'comedy',
  HORROR = 'horror',

  // Special
  TRAINING = 'training',             // Power-up arc
  TOURNAMENT = 'tournament',         // Competition arc
  RESCUE = 'rescue',                 // Save someone
  CUSTOM = 'custom'
}

/**
 * Resolution urgency
 */
export enum ResolutionUrgency {
  FLEXIBLE = 'flexible',             // Can resolve whenever
  SCHEDULED = 'scheduled',           // Has target chapter
  SOON = 'soon',                     // Should resolve soon
  URGENT = 'urgent',                 // Must resolve very soon
  CRITICAL = 'critical',             // Must resolve NOW
  OVERDUE = 'overdue'                // Should have resolved already
}

/**
 * Interweave pattern types
 */
export enum InterweavePattern {
  PARALLEL = 'parallel',             // Plots run side by side
  CONVERGENT = 'convergent',         // Plots heading toward merger
  DIVERGENT = 'divergent',           // Plots splitting apart
  DEPENDENT = 'dependent',           // One needs another
  CONTRASTING = 'contrasting',       // Thematic opposition
  MIRRORING = 'mirroring',           // Similar situations
  ESCALATING = 'escalating',         // Building on each other
  ALTERNATING = 'alternating'        // Taking turns for focus
}

/**
 * Beat types within plots
 */
export enum PlotBeatType {
  HOOK = 'hook',                     // Establishes interest
  SETUP = 'setup',                   // Establishes elements
  COMPLICATION = 'complication',     // Makes things harder
  ESCALATION = 'escalation',         // Raises stakes
  REVELATION = 'revelation',         // New information
  REVERSAL = 'reversal',             // Expectations subverted
  DECISION = 'decision',             // Character must choose
  CONSEQUENCE = 'consequence',       // Result of decision
  CRISIS = 'crisis',                 // Low point
  CLIMAX_BEAT = 'climax_beat',       // Major confrontation
  RESOLUTION_BEAT = 'resolution_beat', // Wrapping up
  CALLBACK = 'callback',             // Reference to earlier
  FORESHADOW = 'foreshadow'          // Hints at future
}

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * A subplot/plot thread
 */
export interface Subplot {
  id: string;
  name: string;
  description: string;

  // Hierarchy
  level: PlotLevel;
  category: PlotCategory;
  customCategory?: string;
  parentPlotId?: string;
  childPlotIds: string[];

  // Status
  status: PlotStatus;
  statusHistory: StatusChange[];

  // Timeline
  startChapter: number;
  expectedEndChapter?: number;
  actualEndChapter?: number;
  deadlineChapter?: number;          // Must resolve by this chapter

  // Progress
  progressPercent: number;           // 0-100
  urgency: ResolutionUrgency;

  // Characters
  primaryCharacterIds: string[];     // Main characters in this plot
  secondaryCharacterIds: string[];   // Supporting characters
  antagonistIds: string[];

  // Story elements
  centralConflict: string;
  stakes: string;
  stakesLevel: 'personal' | 'local' | 'regional' | 'global' | 'cosmic';

  // Structure
  beats: PlotBeat[];
  currentBeatIndex: number;

  // Relationships
  relatedPlotIds: string[];
  mergedIntoId?: string;
  mergedFromIds: string[];

  // Resolution
  resolution?: PlotResolution;

  // Tracking
  chapterAppearances: number[];      // Which chapters this plot appears in
  lastActiveChapter: number;
  dormancyWarning: boolean;

  // Meta
  thematicPurpose?: string;
  narrativeFunction?: string;        // Why this plot exists

  notes: string;
}

/**
 * Status change record
 */
export interface StatusChange {
  fromStatus: PlotStatus;
  toStatus: PlotStatus;
  chapter: number;
  reason: string;
}

/**
 * A beat within a plot
 */
export interface PlotBeat {
  id: string;
  type: PlotBeatType;
  name: string;
  description: string;

  // Timeline
  plannedChapter?: number;
  actualChapter?: number;

  // Characters involved
  characterIds: string[];

  // Connections
  requiresBeatIds: string[];         // Must happen first
  enablesBeatIds: string[];          // Unlocks these

  // Status
  isCompleted: boolean;

  // Impact
  stakes: string;
  emotionalTone: string;

  sceneId?: string;
  notes: string;
}

/**
 * Plot resolution
 */
export interface PlotResolution {
  type: 'success' | 'failure' | 'partial' | 'pyrrhic' | 'unexpected' | 'open';
  description: string;
  winner?: string;                   // Who won (if applicable)
  consequences: string[];
  characterImpacts: {
    characterId: string;
    impact: string;
  }[];
  chapter: number;
  satisfactionScore: number;         // 0-100
  setupPayoffScore: number;          // How well did payoff match setup
}

/**
 * Interweave relationship between plots
 */
export interface PlotInterweave {
  id: string;
  plotIds: string[];
  pattern: InterweavePattern;
  description: string;

  // Convergence tracking
  willConverge: boolean;
  convergenceChapter?: number;
  convergenceType?: string;

  // Dependency
  primaryPlotId?: string;            // If dependent pattern
  dependencyDescription?: string;

  // Timing
  startChapter: number;
  endChapter?: number;

  notes: string;
}

/**
 * Convergence point where plots meet
 */
export interface ConvergencePoint {
  id: string;
  plotIds: string[];
  chapter: number;
  description: string;

  // Type
  type: 'collision' | 'merger' | 'resolution' | 'revelation' | 'crossover';

  // Results
  resultingPlotId?: string;          // If merged
  consequences: string[];

  // Planning
  isPlanned: boolean;
  wasSuccessful?: boolean;

  sceneId?: string;
  notes: string;
}

/**
 * Plot health analysis
 */
export interface PlotHealthAnalysis {
  plotId: string;
  plotName: string;

  // Status
  overallHealth: 'healthy' | 'warning' | 'critical';
  healthScore: number;               // 0-100

  // Issues
  issues: PlotIssue[];

  // Pacing
  chaptersActive: number;
  chaptersSinceLast: number;
  beatsRemaining: number;
  projectedEndChapter: number;

  // Urgency
  urgency: ResolutionUrgency;
  daysUntilDeadline?: number;

  // Recommendations
  recommendations: string[];
}

/**
 * Specific plot issue
 */
export interface PlotIssue {
  type: 'dormancy' | 'pacing' | 'deadline' | 'orphaned' | 'conflict' | 'resolution';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

/**
 * Plot weaving analysis
 */
export interface WeavingAnalysis {
  chapterRange: [number, number];

  // Coverage
  plotsActive: number;
  plotsIntroduced: number;
  plotsResolved: number;
  plotsDormant: number;

  // Balance
  mainPlotScreenTime: number;        // Percentage
  subplotBalance: {
    plotId: string;
    plotName: string;
    screenTime: number;
  }[];

  // Interweaving
  activeInterweaves: number;
  convergencesApproaching: ConvergencePoint[];

  // Issues
  overloadedChapters: number[];      // Too many plots at once
  barrenChapters: number[];          // Not enough plot activity

  // Recommendations
  recommendations: string[];
}

/**
 * Subplot configuration
 */
export interface SubplotConfig {
  dormancyThresholdChapters: number;
  maxActivePlotsPerChapter: number;
  minActivePlotsPerChapter: number;
  warnOnUnresolvedPast: number;      // Chapters past expected end
  trackScreenTime: boolean;
}

// =============================================================================
// SUBPLOT MANAGER CLASS
// =============================================================================

export class SubplotManager {
  // Data storage
  private plots: Map<string, Subplot> = new Map();
  private interweaves: Map<string, PlotInterweave> = new Map();
  private convergences: Map<string, ConvergencePoint> = new Map();

  // Indexes
  private plotsByLevel: Map<PlotLevel, Set<string>> = new Map();
  private plotsByStatus: Map<PlotStatus, Set<string>> = new Map();
  private plotsByCategory: Map<PlotCategory, Set<string>> = new Map();
  private plotsByCharacter: Map<string, Set<string>> = new Map();
  private childToParent: Map<string, string> = new Map();

  // Configuration
  private config: SubplotConfig = {
    dormancyThresholdChapters: 30,
    maxActivePlotsPerChapter: 5,
    minActivePlotsPerChapter: 1,
    warnOnUnresolvedPast: 20,
    trackScreenTime: true
  };

  constructor() {
    // Initialize indexes
    for (const level of Object.values(PlotLevel)) {
      this.plotsByLevel.set(level, new Set());
    }
    for (const status of Object.values(PlotStatus)) {
      this.plotsByStatus.set(status, new Set());
    }
    for (const category of Object.values(PlotCategory)) {
      this.plotsByCategory.set(category, new Set());
    }
  }

  // ===========================================================================
  // PLOT MANAGEMENT
  // ===========================================================================

  /**
   * Create a new subplot
   */
  createPlot(data: {
    name: string;
    description: string;
    level: PlotLevel;
    category: PlotCategory;
    customCategory?: string;
    parentPlotId?: string;
    startChapter: number;
    expectedEndChapter?: number;
    deadlineChapter?: number;
    primaryCharacterIds: string[];
    secondaryCharacterIds?: string[];
    antagonistIds?: string[];
    centralConflict: string;
    stakes: string;
    stakesLevel: Subplot['stakesLevel'];
    thematicPurpose?: string;
    narrativeFunction?: string;
    notes?: string;
  }): Subplot {
    const id = uuidv4();

    const plot: Subplot = {
      id,
      name: data.name,
      description: data.description,
      level: data.level,
      category: data.category,
      customCategory: data.customCategory,
      parentPlotId: data.parentPlotId,
      childPlotIds: [],
      status: PlotStatus.PLANNED,
      statusHistory: [{
        fromStatus: PlotStatus.PLANNED,
        toStatus: PlotStatus.PLANNED,
        chapter: data.startChapter,
        reason: 'Plot created'
      }],
      startChapter: data.startChapter,
      expectedEndChapter: data.expectedEndChapter,
      deadlineChapter: data.deadlineChapter,
      progressPercent: 0,
      urgency: data.deadlineChapter ? ResolutionUrgency.SCHEDULED : ResolutionUrgency.FLEXIBLE,
      primaryCharacterIds: data.primaryCharacterIds,
      secondaryCharacterIds: data.secondaryCharacterIds || [],
      antagonistIds: data.antagonistIds || [],
      centralConflict: data.centralConflict,
      stakes: data.stakes,
      stakesLevel: data.stakesLevel,
      beats: [],
      currentBeatIndex: 0,
      relatedPlotIds: [],
      mergedFromIds: [],
      chapterAppearances: [],
      lastActiveChapter: data.startChapter,
      dormancyWarning: false,
      thematicPurpose: data.thematicPurpose,
      narrativeFunction: data.narrativeFunction,
      notes: data.notes || ''
    };

    this.plots.set(id, plot);

    // Update indexes
    this.updateIndexes(plot);

    // Link to parent
    if (data.parentPlotId) {
      const parent = this.plots.get(data.parentPlotId);
      if (parent) {
        parent.childPlotIds.push(id);
        plot.relatedPlotIds.push(data.parentPlotId);
      }
      this.childToParent.set(id, data.parentPlotId);
    }

    return plot;
  }

  /**
   * Update plot indexes
   */
  private updateIndexes(plot: Subplot): void {
    // Level index
    const levelSet = this.plotsByLevel.get(plot.level) || new Set();
    levelSet.add(plot.id);
    this.plotsByLevel.set(plot.level, levelSet);

    // Status index
    const statusSet = this.plotsByStatus.get(plot.status) || new Set();
    statusSet.add(plot.id);
    this.plotsByStatus.set(plot.status, statusSet);

    // Category index
    const catSet = this.plotsByCategory.get(plot.category) || new Set();
    catSet.add(plot.id);
    this.plotsByCategory.set(plot.category, catSet);

    // Character indexes
    for (const charId of [...plot.primaryCharacterIds, ...plot.secondaryCharacterIds]) {
      const charSet = this.plotsByCharacter.get(charId) || new Set();
      charSet.add(plot.id);
      this.plotsByCharacter.set(charId, charSet);
    }
  }

  /**
   * Get plot by ID
   */
  getPlot(id: string): Subplot | undefined {
    return this.plots.get(id);
  }

  /**
   * Get plots by level
   */
  getPlotsByLevel(level: PlotLevel): Subplot[] {
    const ids = this.plotsByLevel.get(level) || new Set();
    return Array.from(ids)
      .map(id => this.plots.get(id))
      .filter((p): p is Subplot => p !== undefined);
  }

  /**
   * Get plots by status
   */
  getPlotsByStatus(status: PlotStatus): Subplot[] {
    const ids = this.plotsByStatus.get(status) || new Set();
    return Array.from(ids)
      .map(id => this.plots.get(id))
      .filter((p): p is Subplot => p !== undefined);
  }

  /**
   * Get active plots
   */
  getActivePlots(): Subplot[] {
    return [
      ...this.getPlotsByStatus(PlotStatus.ACTIVE),
      ...this.getPlotsByStatus(PlotStatus.SETUP),
      ...this.getPlotsByStatus(PlotStatus.APPROACHING_CLIMAX),
      ...this.getPlotsByStatus(PlotStatus.CLIMAX)
    ];
  }

  /**
   * Get main plot
   */
  getMainPlot(): Subplot | undefined {
    const mainPlots = this.getPlotsByLevel(PlotLevel.MAIN);
    return mainPlots.find(p => !p.resolution) || mainPlots[0];
  }

  /**
   * Get plots for a character
   */
  getCharacterPlots(characterId: string): Subplot[] {
    const ids = this.plotsByCharacter.get(characterId) || new Set();
    return Array.from(ids)
      .map(id => this.plots.get(id))
      .filter((p): p is Subplot => p !== undefined);
  }

  /**
   * Get child plots
   */
  getChildPlots(plotId: string): Subplot[] {
    const plot = this.plots.get(plotId);
    if (!plot) return [];

    return plot.childPlotIds
      .map(id => this.plots.get(id))
      .filter((p): p is Subplot => p !== undefined);
  }

  /**
   * Update plot status
   */
  updateStatus(plotId: string, newStatus: PlotStatus, chapter: number, reason: string): boolean {
    const plot = this.plots.get(plotId);
    if (!plot) return false;

    // Remove from old status index
    const oldStatusSet = this.plotsByStatus.get(plot.status);
    if (oldStatusSet) {
      oldStatusSet.delete(plotId);
    }

    // Add to new status index
    const newStatusSet = this.plotsByStatus.get(newStatus) || new Set();
    newStatusSet.add(plotId);
    this.plotsByStatus.set(newStatus, newStatusSet);

    // Record change
    plot.statusHistory.push({
      fromStatus: plot.status,
      toStatus: newStatus,
      chapter,
      reason
    });

    plot.status = newStatus;

    // Update urgency based on status
    if (newStatus === PlotStatus.APPROACHING_CLIMAX) {
      plot.urgency = ResolutionUrgency.SOON;
    } else if (newStatus === PlotStatus.CLIMAX) {
      plot.urgency = ResolutionUrgency.CRITICAL;
    }

    return true;
  }

  /**
   * Mark plot appearance in chapter
   */
  recordChapterAppearance(plotId: string, chapter: number): void {
    const plot = this.plots.get(plotId);
    if (!plot) return;

    if (!plot.chapterAppearances.includes(chapter)) {
      plot.chapterAppearances.push(chapter);
      plot.chapterAppearances.sort((a, b) => a - b);
    }
    plot.lastActiveChapter = Math.max(plot.lastActiveChapter, chapter);
    plot.dormancyWarning = false;

    // Auto-update status if needed
    if (plot.status === PlotStatus.PLANNED && chapter >= plot.startChapter) {
      this.updateStatus(plotId, PlotStatus.SETUP, chapter, 'First appearance');
    } else if (plot.status === PlotStatus.DORMANT) {
      this.updateStatus(plotId, PlotStatus.ACTIVE, chapter, 'Reactivated');
    }
  }

  // ===========================================================================
  // BEAT MANAGEMENT
  // ===========================================================================

  /**
   * Add beat to plot
   */
  addBeat(plotId: string, beat: Omit<PlotBeat, 'id' | 'isCompleted'>): PlotBeat {
    const plot = this.plots.get(plotId);
    if (!plot) throw new Error(`Plot ${plotId} not found`);

    const id = uuidv4();
    const fullBeat: PlotBeat = {
      ...beat,
      id,
      isCompleted: false
    };

    plot.beats.push(fullBeat);

    // Sort by planned chapter
    plot.beats.sort((a, b) =>
      (a.plannedChapter || Infinity) - (b.plannedChapter || Infinity)
    );

    return fullBeat;
  }

  /**
   * Complete a beat
   */
  completeBeat(plotId: string, beatId: string, chapter: number): boolean {
    const plot = this.plots.get(plotId);
    if (!plot) return false;

    const beat = plot.beats.find(b => b.id === beatId);
    if (!beat) return false;

    beat.isCompleted = true;
    beat.actualChapter = chapter;

    // Update progress
    const completedBeats = plot.beats.filter(b => b.isCompleted).length;
    plot.progressPercent = (completedBeats / plot.beats.length) * 100;

    // Update current beat index
    const beatIndex = plot.beats.findIndex(b => b.id === beatId);
    if (beatIndex >= plot.currentBeatIndex) {
      plot.currentBeatIndex = beatIndex + 1;
    }

    // Auto-update status based on beat type
    if (beat.type === PlotBeatType.CLIMAX_BEAT) {
      this.updateStatus(plotId, PlotStatus.CLIMAX, chapter, 'Climax beat reached');
    } else if (beat.type === PlotBeatType.RESOLUTION_BEAT) {
      this.updateStatus(plotId, PlotStatus.RESOLUTION, chapter, 'Resolution beat reached');
    }

    // Record chapter appearance
    this.recordChapterAppearance(plotId, chapter);

    return true;
  }

  /**
   * Get next beat for a plot
   */
  getNextBeat(plotId: string): PlotBeat | undefined {
    const plot = this.plots.get(plotId);
    if (!plot) return undefined;

    return plot.beats.find(b => !b.isCompleted);
  }

  /**
   * Get beats requiring prerequisites
   */
  getBlockedBeats(plotId: string): PlotBeat[] {
    const plot = this.plots.get(plotId);
    if (!plot) return [];

    return plot.beats.filter(beat => {
      if (beat.isCompleted) return false;
      if (beat.requiresBeatIds.length === 0) return false;

      return !beat.requiresBeatIds.every(reqId =>
        plot.beats.find(b => b.id === reqId)?.isCompleted
      );
    });
  }

  // ===========================================================================
  // INTERWEAVE MANAGEMENT
  // ===========================================================================

  /**
   * Create interweave between plots
   */
  createInterweave(data: {
    plotIds: string[];
    pattern: InterweavePattern;
    description: string;
    willConverge?: boolean;
    convergenceChapter?: number;
    convergenceType?: string;
    primaryPlotId?: string;
    dependencyDescription?: string;
    startChapter: number;
    notes?: string;
  }): PlotInterweave {
    const id = uuidv4();

    const interweave: PlotInterweave = {
      id,
      plotIds: data.plotIds,
      pattern: data.pattern,
      description: data.description,
      willConverge: data.willConverge || false,
      convergenceChapter: data.convergenceChapter,
      convergenceType: data.convergenceType,
      primaryPlotId: data.primaryPlotId,
      dependencyDescription: data.dependencyDescription,
      startChapter: data.startChapter,
      notes: data.notes || ''
    };

    this.interweaves.set(id, interweave);

    // Update plot relationships
    for (const plotId of data.plotIds) {
      const plot = this.plots.get(plotId);
      if (plot) {
        for (const otherId of data.plotIds) {
          if (otherId !== plotId && !plot.relatedPlotIds.includes(otherId)) {
            plot.relatedPlotIds.push(otherId);
          }
        }
      }
    }

    return interweave;
  }

  /**
   * Get interweaves for a plot
   */
  getPlotInterweaves(plotId: string): PlotInterweave[] {
    return Array.from(this.interweaves.values())
      .filter(i => i.plotIds.includes(plotId));
  }

  /**
   * Get active interweaves
   */
  getActiveInterweaves(): PlotInterweave[] {
    return Array.from(this.interweaves.values())
      .filter(i => !i.endChapter);
  }

  // ===========================================================================
  // CONVERGENCE MANAGEMENT
  // ===========================================================================

  /**
   * Plan a convergence point
   */
  planConvergence(data: {
    plotIds: string[];
    chapter: number;
    description: string;
    type: ConvergencePoint['type'];
    notes?: string;
  }): ConvergencePoint {
    const id = uuidv4();

    const convergence: ConvergencePoint = {
      id,
      plotIds: data.plotIds,
      chapter: data.chapter,
      description: data.description,
      type: data.type,
      consequences: [],
      isPlanned: true,
      notes: data.notes || ''
    };

    this.convergences.set(id, convergence);

    return convergence;
  }

  /**
   * Execute a convergence
   */
  executeConvergence(
    convergenceId: string,
    actualChapter: number,
    consequences: string[],
    resultingPlotId?: string,
    success: boolean = true
  ): boolean {
    const convergence = this.convergences.get(convergenceId);
    if (!convergence) return false;

    convergence.chapter = actualChapter;
    convergence.consequences = consequences;
    convergence.resultingPlotId = resultingPlotId;
    convergence.wasSuccessful = success;

    // If merger, update plots
    if (convergence.type === 'merger' && resultingPlotId) {
      const resultingPlot = this.plots.get(resultingPlotId);
      if (resultingPlot) {
        for (const plotId of convergence.plotIds) {
          if (plotId !== resultingPlotId) {
            const mergedPlot = this.plots.get(plotId);
            if (mergedPlot) {
              this.updateStatus(plotId, PlotStatus.MERGED, actualChapter, `Merged into ${resultingPlot.name}`);
              mergedPlot.mergedIntoId = resultingPlotId;
              resultingPlot.mergedFromIds.push(plotId);
            }
          }
        }
      }
    }

    return true;
  }

  /**
   * Get upcoming convergences
   */
  getUpcomingConvergences(currentChapter: number, lookAhead: number = 50): ConvergencePoint[] {
    return Array.from(this.convergences.values())
      .filter(c => c.chapter > currentChapter && c.chapter <= currentChapter + lookAhead)
      .sort((a, b) => a.chapter - b.chapter);
  }

  // ===========================================================================
  // RESOLUTION
  // ===========================================================================

  /**
   * Resolve a plot
   */
  resolvePlot(plotId: string, resolution: PlotResolution): boolean {
    const plot = this.plots.get(plotId);
    if (!plot) return false;

    plot.resolution = resolution;
    plot.actualEndChapter = resolution.chapter;
    plot.progressPercent = 100;

    this.updateStatus(plotId, PlotStatus.COMPLETED, resolution.chapter, 'Plot resolved');

    return true;
  }

  /**
   * Abandon a plot (use sparingly!)
   */
  abandonPlot(plotId: string, chapter: number, reason: string): boolean {
    const plot = this.plots.get(plotId);
    if (!plot) return false;

    this.updateStatus(plotId, PlotStatus.ABANDONED, chapter, reason);
    plot.actualEndChapter = chapter;

    return true;
  }

  // ===========================================================================
  // ANALYSIS
  // ===========================================================================

  /**
   * Analyze plot health
   */
  analyzeHealth(plotId: string, currentChapter: number): PlotHealthAnalysis {
    const plot = this.plots.get(plotId);
    if (!plot) throw new Error(`Plot ${plotId} not found`);

    const issues: PlotIssue[] = [];
    const recommendations: string[] = [];
    let healthScore = 100;

    // Check dormancy
    const chaptersSinceLast = currentChapter - plot.lastActiveChapter;
    if (chaptersSinceLast > this.config.dormancyThresholdChapters &&
        plot.status !== PlotStatus.COMPLETED && plot.status !== PlotStatus.ABANDONED) {
      issues.push({
        type: 'dormancy',
        severity: chaptersSinceLast > this.config.dormancyThresholdChapters * 2 ? 'high' : 'medium',
        description: `Plot dormant for ${chaptersSinceLast} chapters`,
        recommendation: 'Reactivate plot or mark as abandoned'
      });
      healthScore -= 20;
      plot.dormancyWarning = true;
    }

    // Check deadline
    if (plot.deadlineChapter && plot.status !== PlotStatus.COMPLETED) {
      const chaptersUntilDeadline = plot.deadlineChapter - currentChapter;
      if (chaptersUntilDeadline < 0) {
        issues.push({
          type: 'deadline',
          severity: 'critical',
          description: `Plot is ${-chaptersUntilDeadline} chapters past deadline`,
          recommendation: 'Resolve plot immediately or extend deadline'
        });
        healthScore -= 30;
        plot.urgency = ResolutionUrgency.OVERDUE;
      } else if (chaptersUntilDeadline < 10) {
        issues.push({
          type: 'deadline',
          severity: 'high',
          description: `Only ${chaptersUntilDeadline} chapters until deadline`,
          recommendation: 'Accelerate plot toward resolution'
        });
        plot.urgency = ResolutionUrgency.CRITICAL;
        healthScore -= 15;
      }
    }

    // Check pacing
    if (plot.beats.length > 0) {
      const completedBeats = plot.beats.filter(b => b.isCompleted).length;
      const expectedBeats = plot.expectedEndChapter
        ? ((currentChapter - plot.startChapter) / (plot.expectedEndChapter - plot.startChapter)) * plot.beats.length
        : completedBeats;

      if (completedBeats < expectedBeats - 2) {
        issues.push({
          type: 'pacing',
          severity: 'medium',
          description: `Plot behind schedule: ${completedBeats}/${Math.round(expectedBeats)} beats completed`,
          recommendation: 'Add more plot appearances or simplify remaining beats'
        });
        healthScore -= 10;
      }
    }

    // Check if orphaned (no recent connections)
    if (plot.relatedPlotIds.length === 0 && plot.level !== PlotLevel.MAIN) {
      issues.push({
        type: 'orphaned',
        severity: 'low',
        description: 'Plot has no connections to other plots',
        recommendation: 'Consider interweaving with main plot or other subplots'
      });
      healthScore -= 5;
    }

    // Calculate projected end
    const chaptersActive = plot.chapterAppearances.length;
    const avgChaptersPerProgress = chaptersActive > 0 && plot.progressPercent > 0
      ? chaptersActive / plot.progressPercent
      : 10;
    const projectedEndChapter = currentChapter + (100 - plot.progressPercent) * avgChaptersPerProgress;

    // Build recommendations
    if (issues.length === 0) {
      recommendations.push('Plot is healthy - continue current trajectory');
    } else {
      for (const issue of issues) {
        recommendations.push(issue.recommendation);
      }
    }

    // Determine overall health
    let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (healthScore < 60) overallHealth = 'critical';
    else if (healthScore < 80) overallHealth = 'warning';

    return {
      plotId,
      plotName: plot.name,
      overallHealth,
      healthScore: Math.max(0, healthScore),
      issues,
      chaptersActive,
      chaptersSinceLast,
      beatsRemaining: plot.beats.filter(b => !b.isCompleted).length,
      projectedEndChapter: Math.round(projectedEndChapter),
      urgency: plot.urgency,
      daysUntilDeadline: plot.deadlineChapter
        ? plot.deadlineChapter - currentChapter
        : undefined,
      recommendations
    };
  }

  /**
   * Analyze weaving patterns
   */
  analyzeWeaving(startChapter: number, endChapter: number): WeavingAnalysis {
    const activePlots: Set<string> = new Set();
    const introducedPlots: Set<string> = new Set();
    const resolvedPlots: Set<string> = new Set();
    const dormantPlots: Set<string> = new Set();
    const screenTime: Map<string, number> = new Map();
    const chapterPlotCount: Map<number, number> = new Map();

    // Analyze each plot
    for (const plot of this.plots.values()) {
      if (plot.startChapter >= startChapter && plot.startChapter <= endChapter) {
        introducedPlots.add(plot.id);
      }

      if (plot.actualEndChapter && plot.actualEndChapter >= startChapter && plot.actualEndChapter <= endChapter) {
        resolvedPlots.add(plot.id);
      }

      const appearancesInRange = plot.chapterAppearances.filter(
        c => c >= startChapter && c <= endChapter
      );

      if (appearancesInRange.length > 0) {
        activePlots.add(plot.id);
        screenTime.set(plot.id, appearancesInRange.length);

        for (const chapter of appearancesInRange) {
          chapterPlotCount.set(chapter, (chapterPlotCount.get(chapter) || 0) + 1);
        }
      }

      if (plot.status === PlotStatus.DORMANT &&
          plot.startChapter < endChapter &&
          (!plot.actualEndChapter || plot.actualEndChapter > startChapter)) {
        dormantPlots.add(plot.id);
      }
    }

    // Calculate main plot screen time
    const mainPlot = this.getMainPlot();
    const totalScreenTime = Array.from(screenTime.values()).reduce((a, b) => a + b, 0);
    const mainPlotScreenTime = mainPlot && screenTime.has(mainPlot.id)
      ? (screenTime.get(mainPlot.id)! / totalScreenTime) * 100
      : 0;

    // Build subplot balance
    const subplotBalance = Array.from(screenTime.entries())
      .map(([plotId, time]) => ({
        plotId,
        plotName: this.plots.get(plotId)?.name || 'Unknown',
        screenTime: (time / totalScreenTime) * 100
      }))
      .sort((a, b) => b.screenTime - a.screenTime);

    // Find overloaded/barren chapters
    const overloadedChapters: number[] = [];
    const barrenChapters: number[] = [];

    for (let ch = startChapter; ch <= endChapter; ch++) {
      const count = chapterPlotCount.get(ch) || 0;
      if (count > this.config.maxActivePlotsPerChapter) {
        overloadedChapters.push(ch);
      }
      if (count < this.config.minActivePlotsPerChapter) {
        barrenChapters.push(ch);
      }
    }

    // Get approaching convergences
    const convergencesApproaching = this.getUpcomingConvergences(startChapter, endChapter - startChapter);

    // Build recommendations
    const recommendations: string[] = [];

    if (overloadedChapters.length > 0) {
      recommendations.push(`${overloadedChapters.length} chapters have too many active plots - consider spacing them out`);
    }
    if (barrenChapters.length > 0) {
      recommendations.push(`${barrenChapters.length} chapters lack plot activity - add subplot appearances`);
    }
    if (dormantPlots.size > activePlots.size * 0.3) {
      recommendations.push('Many plots are dormant - consider reactivating or resolving them');
    }
    if (mainPlotScreenTime < 30) {
      recommendations.push('Main plot has low screen time - ensure it remains central');
    }

    return {
      chapterRange: [startChapter, endChapter],
      plotsActive: activePlots.size,
      plotsIntroduced: introducedPlots.size,
      plotsResolved: resolvedPlots.size,
      plotsDormant: dormantPlots.size,
      mainPlotScreenTime,
      subplotBalance,
      activeInterweaves: this.getActiveInterweaves().length,
      convergencesApproaching,
      overloadedChapters,
      barrenChapters,
      recommendations
    };
  }

  /**
   * Get dormant plots
   */
  getDormantPlots(currentChapter: number): Subplot[] {
    return Array.from(this.plots.values()).filter(plot => {
      if (plot.status === PlotStatus.COMPLETED || plot.status === PlotStatus.ABANDONED) {
        return false;
      }
      const chaptersSinceLast = currentChapter - plot.lastActiveChapter;
      return chaptersSinceLast > this.config.dormancyThresholdChapters;
    });
  }

  /**
   * Get overdue plots
   */
  getOverduePlots(currentChapter: number): Subplot[] {
    return Array.from(this.plots.values()).filter(plot => {
      if (plot.status === PlotStatus.COMPLETED || plot.status === PlotStatus.ABANDONED) {
        return false;
      }
      if (plot.expectedEndChapter && currentChapter > plot.expectedEndChapter + this.config.warnOnUnresolvedPast) {
        return true;
      }
      if (plot.deadlineChapter && currentChapter > plot.deadlineChapter) {
        return true;
      }
      return false;
    });
  }

  // ===========================================================================
  // REPORTS
  // ===========================================================================

  /**
   * Generate plot status report
   */
  generateStatusReport(currentChapter: number): string {
    let report = '# Subplot Status Report\n\n';

    // Summary
    const allPlots = Array.from(this.plots.values());
    const active = this.getActivePlots();
    const dormant = this.getDormantPlots(currentChapter);
    const overdue = this.getOverduePlots(currentChapter);

    report += '## Summary\n\n';
    report += `- **Total Plots:** ${allPlots.length}\n`;
    report += `- **Active:** ${active.length}\n`;
    report += `- **Dormant:** ${dormant.length}\n`;
    report += `- **Overdue:** ${overdue.length}\n`;
    report += `- **Completed:** ${this.getPlotsByStatus(PlotStatus.COMPLETED).length}\n\n`;

    // Main plot
    const mainPlot = this.getMainPlot();
    if (mainPlot) {
      report += '## Main Plot\n\n';
      report += `**${mainPlot.name}**\n`;
      report += `- Status: ${mainPlot.status}\n`;
      report += `- Progress: ${mainPlot.progressPercent.toFixed(0)}%\n`;
      report += `- Beats: ${mainPlot.beats.filter(b => b.isCompleted).length}/${mainPlot.beats.length}\n\n`;
    }

    // Active subplots
    const subplots = active.filter(p => p.level !== PlotLevel.MAIN);
    if (subplots.length > 0) {
      report += '## Active Subplots\n\n';
      for (const plot of subplots) {
        report += `### ${plot.name}\n`;
        report += `- Level: ${plot.level}\n`;
        report += `- Status: ${plot.status}\n`;
        report += `- Progress: ${plot.progressPercent.toFixed(0)}%\n`;
        report += `- Urgency: ${plot.urgency}\n\n`;
      }
    }

    // Issues
    if (dormant.length > 0 || overdue.length > 0) {
      report += '## Issues\n\n';

      if (dormant.length > 0) {
        report += '### Dormant Plots\n';
        for (const plot of dormant) {
          const chapters = currentChapter - plot.lastActiveChapter;
          report += `- **${plot.name}**: Inactive for ${chapters} chapters\n`;
        }
        report += '\n';
      }

      if (overdue.length > 0) {
        report += '### Overdue Plots\n';
        for (const plot of overdue) {
          report += `- **${plot.name}**: Should have resolved by chapter ${plot.expectedEndChapter || plot.deadlineChapter}\n`;
        }
        report += '\n';
      }
    }

    // Upcoming convergences
    const convergences = this.getUpcomingConvergences(currentChapter);
    if (convergences.length > 0) {
      report += '## Upcoming Convergences\n\n';
      for (const conv of convergences) {
        const plotNames = conv.plotIds
          .map(id => this.plots.get(id)?.name || 'Unknown')
          .join(' + ');
        report += `- Chapter ${conv.chapter}: ${plotNames} (${conv.type})\n`;
      }
    }

    return report;
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  /**
   * Get system statistics
   */
  getStats(): {
    totalPlots: number;
    byLevel: Record<PlotLevel, number>;
    byStatus: Record<PlotStatus, number>;
    totalBeats: number;
    completedBeats: number;
    interweaves: number;
    convergences: number;
  } {
    const byLevel: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const level of Object.values(PlotLevel)) {
      byLevel[level] = (this.plotsByLevel.get(level) || new Set()).size;
    }

    for (const status of Object.values(PlotStatus)) {
      byStatus[status] = (this.plotsByStatus.get(status) || new Set()).size;
    }

    let totalBeats = 0;
    let completedBeats = 0;
    for (const plot of this.plots.values()) {
      totalBeats += plot.beats.length;
      completedBeats += plot.beats.filter(b => b.isCompleted).length;
    }

    return {
      totalPlots: this.plots.size,
      byLevel: byLevel as Record<PlotLevel, number>,
      byStatus: byStatus as Record<PlotStatus, number>,
      totalBeats,
      completedBeats,
      interweaves: this.interweaves.size,
      convergences: this.convergences.size
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
      plots: Array.from(this.plots.entries()),
      interweaves: Array.from(this.interweaves.entries()),
      convergences: Array.from(this.convergences.entries()),
      config: this.config
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.plots) {
      this.plots.clear();
      // Clear indexes
      for (const level of Object.values(PlotLevel)) {
        this.plotsByLevel.set(level, new Set());
      }
      for (const status of Object.values(PlotStatus)) {
        this.plotsByStatus.set(status, new Set());
      }
      for (const category of Object.values(PlotCategory)) {
        this.plotsByCategory.set(category, new Set());
      }
      this.plotsByCharacter.clear();
      this.childToParent.clear();

      for (const [id, plot] of data.plots) {
        this.plots.set(id, plot);
        this.updateIndexes(plot);
        if (plot.parentPlotId) {
          this.childToParent.set(id, plot.parentPlotId);
        }
      }
    }

    if (data.interweaves) {
      this.interweaves = new Map(data.interweaves);
    }

    if (data.convergences) {
      this.convergences = new Map(data.convergences);
    }

    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.plots.clear();
    this.interweaves.clear();
    this.convergences.clear();
    this.plotsByCharacter.clear();
    this.childToParent.clear();

    for (const level of Object.values(PlotLevel)) {
      this.plotsByLevel.set(level, new Set());
    }
    for (const status of Object.values(PlotStatus)) {
      this.plotsByStatus.set(status, new Set());
    }
    for (const category of Object.values(PlotCategory)) {
      this.plotsByCategory.set(category, new Set());
    }
  }
}

// Default instance
export const subplotManager = new SubplotManager();

export default SubplotManager;
