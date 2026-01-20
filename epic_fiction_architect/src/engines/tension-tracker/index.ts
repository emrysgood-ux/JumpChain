/**
 * Tension & Stakes Tracker - Dramatic Tension Management
 *
 * For epic narratives, maintaining appropriate tension is crucial.
 * Too little and readers lose interest; too much and they burn out.
 * This system tracks:
 * - Stakes escalation across plots
 * - Tension levels by chapter/arc
 * - Deadline/ticking clock management
 * - Rest and recovery periods
 * - Crisis point planning
 * - Reader engagement prediction
 *
 * The art of storytelling is the art of managing tension.
 */

import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Stakes level
 */
export enum StakesLevel {
  TRIVIAL = 0,                       // Minor inconvenience
  LOW = 1,                           // Personal discomfort
  MODERATE = 2,                      // Significant personal loss
  HIGH = 3,                          // Major personal/group loss
  SEVERE = 4,                        // Lives at stake
  CRITICAL = 5,                      // Many lives at stake
  CATASTROPHIC = 6,                  // Community/city level
  APOCALYPTIC = 7,                   // World/universe level
  EXISTENTIAL = 8                    // Reality/existence level
}

/**
 * Tension level
 */
export enum TensionLevel {
  RELAXED = 0,                       // Peace, recovery
  MILD = 1,                          // Slight unease
  BUILDING = 2,                      // Growing concern
  MODERATE = 3,                      // Clear danger
  HIGH = 4,                          // Urgent situation
  INTENSE = 5,                       // Critical moment
  PEAK = 6,                          // Maximum tension
  OVERWHELMING = 7                   // Beyond sustainable
}

/**
 * Deadline type
 */
export enum DeadlineType {
  ABSOLUTE = 'absolute',             // Happens at specific time
  CONDITIONAL = 'conditional',       // Happens if condition met
  ESCALATING = 'escalating',         // Stakes increase over time
  COUNTDOWN = 'countdown',           // Explicit countdown
  HIDDEN = 'hidden',                 // Characters don't know
  FLEXIBLE = 'flexible'              // Can be extended
}

/**
 * Tension source types
 */
export enum TensionSource {
  EXTERNAL_THREAT = 'external_threat',
  INTERNAL_CONFLICT = 'internal_conflict',
  RELATIONSHIP = 'relationship',
  MYSTERY = 'mystery',
  DEADLINE = 'deadline',
  MORAL_DILEMMA = 'moral_dilemma',
  PHYSICAL_DANGER = 'physical_danger',
  EMOTIONAL = 'emotional',
  ANTICIPATION = 'anticipation',
  DRAMATIC_IRONY = 'dramatic_irony',
  SECRECY = 'secrecy',
  BETRAYAL = 'betrayal',
  SURVIVAL = 'survival',
  COMPETITION = 'competition',
  HELPLESSNESS = 'helplessness'
}

/**
 * Relief type
 */
export enum ReliefType {
  VICTORY = 'victory',               // Problem solved
  RESPITE = 'respite',               // Temporary break
  HUMOR = 'humor',                   // Comic relief
  BONDING = 'bonding',               // Character connection
  REVELATION = 'revelation',         // Positive discovery
  ESCAPE = 'escape',                 // Evaded danger
  REST = 'rest',                     // Actual rest period
  CELEBRATION = 'celebration'        // Achievement recognized
}

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Stakes definition for a plot/situation
 */
export interface Stakes {
  id: string;
  name: string;
  description: string;

  // Level
  level: StakesLevel;
  previousLevel?: StakesLevel;

  // Scope
  affectedCharacterIds: string[];
  affectedGroupIds: string[];
  scope: 'personal' | 'group' | 'local' | 'regional' | 'global' | 'cosmic';

  // What's at risk
  whatAtRisk: string[];              // Specific things at stake
  worstCase: string;                 // If stakes are lost
  bestCase: string;                  // If stakes are won

  // Timeline
  startChapter: number;
  escalationHistory: StakesEscalation[];

  // Related
  plotId?: string;
  deadlineId?: string;

  // Status
  isActive: boolean;
  resolution?: StakesResolution;

  notes: string;
}

/**
 * Stakes escalation record
 */
export interface StakesEscalation {
  chapter: number;
  fromLevel: StakesLevel;
  toLevel: StakesLevel;
  reason: string;
  newThreats: string[];
}

/**
 * Stakes resolution
 */
export interface StakesResolution {
  chapter: number;
  outcome: 'won' | 'lost' | 'partial' | 'transformed';
  description: string;
  actualConsequences: string[];
  characterImpacts: string[];
}

/**
 * Deadline/ticking clock
 */
export interface Deadline {
  id: string;
  name: string;
  description: string;

  // Type
  type: DeadlineType;

  // Timeline
  startChapter: number;
  targetChapter: number;
  actualResolutionChapter?: number;

  // Stakes at deadline
  stakesId: string;
  consequenceIfMissed: string;

  // Visibility
  knownToCharacterIds: string[];
  knownToReader: boolean;
  hiddenFromCharacterIds: string[];

  // Progress
  warningChapters: number[];         // When to remind reader
  lastWarningChapter?: number;

  // Status
  isActive: boolean;
  wasMet: boolean;
  wasExtended: boolean;
  extensionHistory: {
    chapter: number;
    newTarget: number;
    reason: string;
  }[];

  notes: string;
}

/**
 * Chapter tension record
 */
export interface ChapterTension {
  chapter: number;

  // Levels
  overallTension: TensionLevel;
  peakTension: TensionLevel;
  endingTension: TensionLevel;

  // Sources
  activeSources: TensionSource[];
  sourceTensions: Map<TensionSource, TensionLevel>;

  // Stakes
  activeStakesIds: string[];
  highestStakes: StakesLevel;

  // Deadlines
  activeDeadlineIds: string[];
  approachingDeadlines: string[];    // Within 10 chapters

  // Relief
  reliefMoments: ReliefMoment[];

  // Analysis
  tensionBalance: 'too_low' | 'balanced' | 'too_high';
  readerEngagement: number;          // 0-100 predicted

  notes: string;
}

/**
 * Relief moment within chapter
 */
export interface ReliefMoment {
  id: string;
  type: ReliefType;
  description: string;
  effectiveness: number;             // 0-100 how much tension released
  characterIds: string[];
}

/**
 * Tension source instance
 */
export interface TensionSourceInstance {
  id: string;
  source: TensionSource;
  description: string;

  // Level
  currentLevel: TensionLevel;
  peakLevel: TensionLevel;

  // Timeline
  startChapter: number;
  endChapter?: number;

  // Related
  characterIds: string[];
  plotId?: string;
  stakesId?: string;

  // History
  levelHistory: {
    chapter: number;
    level: TensionLevel;
    reason: string;
  }[];

  isActive: boolean;
  notes: string;
}

/**
 * Tension arc (planned tension trajectory)
 */
export interface TensionArc {
  id: string;
  name: string;

  // Range
  startChapter: number;
  endChapter: number;

  // Planned trajectory
  plannedBeats: TensionBeat[];

  // Actual vs planned
  actualTensions: Map<number, TensionLevel>;

  // Related
  plotId?: string;
  characterIds: string[];

  notes: string;
}

/**
 * Tension beat (planned tension point)
 */
export interface TensionBeat {
  id: string;
  chapter: number;
  targetTension: TensionLevel;
  beatType: 'rise' | 'peak' | 'fall' | 'rest' | 'shock';
  description: string;
  achieved: boolean;
  actualTension?: TensionLevel;
}

/**
 * Pacing analysis
 */
export interface PacingAnalysis {
  chapterRange: [number, number];

  // Averages
  averageTension: number;
  averageStakes: number;
  tensionVariance: number;

  // Peaks and valleys
  peaks: { chapter: number; tension: TensionLevel }[];
  valleys: { chapter: number; tension: TensionLevel }[];

  // Issues
  prolongedHighTension: number[];    // Chapters with sustained high tension
  prolongedLowTension: number[];     // Chapters that might lose readers
  missingRelief: number[];           // High tension without relief

  // Balance
  tensionDistribution: Record<TensionLevel, number>;
  stakesDistribution: Record<StakesLevel, number>;

  // Engagement
  predictedEngagement: number;       // 0-100
  engagementRisks: string[];

  recommendations: string[];
}

/**
 * Tracker configuration
 */
export interface TensionConfig {
  maxSustainedHighTensionChapters: number;
  minTensionForEngagement: TensionLevel;
  reliefFrequency: number;           // Every N high-tension chapters
  warnOnTensionImbalance: boolean;
}

// =============================================================================
// TENSION TRACKER CLASS
// =============================================================================

export class TensionTracker {
  // Data storage
  private stakes: Map<string, Stakes> = new Map();
  private deadlines: Map<string, Deadline> = new Map();
  private chapterTensions: Map<number, ChapterTension> = new Map();
  private tensionSources: Map<string, TensionSourceInstance> = new Map();
  private tensionArcs: Map<string, TensionArc> = new Map();

  // Indexes
  private stakesByLevel: Map<StakesLevel, Set<string>> = new Map();
  private activeDeadlines: Set<string> = new Set();
  private sourcesByType: Map<TensionSource, Set<string>> = new Map();

  // Configuration
  private config: TensionConfig = {
    maxSustainedHighTensionChapters: 10,
    minTensionForEngagement: TensionLevel.MILD,
    reliefFrequency: 5,
    warnOnTensionImbalance: true
  };

  constructor() {
    // Initialize indexes
    for (const level of Object.values(StakesLevel).filter(v => typeof v === 'number')) {
      this.stakesByLevel.set(level as StakesLevel, new Set());
    }
    for (const source of Object.values(TensionSource)) {
      this.sourcesByType.set(source, new Set());
    }
  }

  // ===========================================================================
  // STAKES MANAGEMENT
  // ===========================================================================

  /**
   * Create stakes
   */
  createStakes(data: Omit<Stakes, 'id' | 'escalationHistory' | 'isActive'>): Stakes {
    const id = uuidv4();
    const stakes: Stakes = {
      ...data,
      id,
      escalationHistory: [],
      isActive: true
    };

    this.stakes.set(id, stakes);

    // Update index
    const levelSet = this.stakesByLevel.get(stakes.level) || new Set();
    levelSet.add(id);
    this.stakesByLevel.set(stakes.level, levelSet);

    return stakes;
  }

  /**
   * Get stakes by ID
   */
  getStakes(id: string): Stakes | undefined {
    return this.stakes.get(id);
  }

  /**
   * Get active stakes
   */
  getActiveStakes(): Stakes[] {
    return Array.from(this.stakes.values()).filter(s => s.isActive);
  }

  /**
   * Escalate stakes
   */
  escalateStakes(
    stakesId: string,
    newLevel: StakesLevel,
    chapter: number,
    reason: string,
    newThreats: string[] = []
  ): boolean {
    const stakes = this.stakes.get(stakesId);
    if (!stakes) return false;

    const oldLevel = stakes.level;

    // Update index
    const oldSet = this.stakesByLevel.get(oldLevel);
    if (oldSet) oldSet.delete(stakesId);

    const newSet = this.stakesByLevel.get(newLevel) || new Set();
    newSet.add(stakesId);
    this.stakesByLevel.set(newLevel, newSet);

    // Record escalation
    stakes.escalationHistory.push({
      chapter,
      fromLevel: oldLevel,
      toLevel: newLevel,
      reason,
      newThreats
    });

    stakes.previousLevel = oldLevel;
    stakes.level = newLevel;

    return true;
  }

  /**
   * Resolve stakes
   */
  resolveStakes(stakesId: string, resolution: StakesResolution): boolean {
    const stakes = this.stakes.get(stakesId);
    if (!stakes) return false;

    stakes.resolution = resolution;
    stakes.isActive = false;

    return true;
  }

  /**
   * Get highest active stakes level
   */
  getHighestActiveStakes(): StakesLevel {
    const active = this.getActiveStakes();
    if (active.length === 0) return StakesLevel.TRIVIAL;
    return Math.max(...active.map(s => s.level)) as StakesLevel;
  }

  // ===========================================================================
  // DEADLINE MANAGEMENT
  // ===========================================================================

  /**
   * Create deadline
   */
  createDeadline(data: Omit<Deadline, 'id' | 'isActive' | 'wasMet' | 'wasExtended' | 'extensionHistory'>): Deadline {
    const id = uuidv4();
    const deadline: Deadline = {
      ...data,
      id,
      isActive: true,
      wasMet: false,
      wasExtended: false,
      extensionHistory: []
    };

    this.deadlines.set(id, deadline);
    this.activeDeadlines.add(id);

    return deadline;
  }

  /**
   * Get deadline
   */
  getDeadline(id: string): Deadline | undefined {
    return this.deadlines.get(id);
  }

  /**
   * Get active deadlines
   */
  getActiveDeadlines(): Deadline[] {
    return Array.from(this.activeDeadlines)
      .map(id => this.deadlines.get(id))
      .filter((d): d is Deadline => d !== undefined);
  }

  /**
   * Get approaching deadlines
   */
  getApproachingDeadlines(currentChapter: number, lookAhead: number = 10): Deadline[] {
    return this.getActiveDeadlines()
      .filter(d => d.targetChapter > currentChapter && d.targetChapter <= currentChapter + lookAhead)
      .sort((a, b) => a.targetChapter - b.targetChapter);
  }

  /**
   * Extend deadline
   */
  extendDeadline(deadlineId: string, newTarget: number, chapter: number, reason: string): boolean {
    const deadline = this.deadlines.get(deadlineId);
    if (!deadline) return false;

    deadline.extensionHistory.push({
      chapter,
      newTarget,
      reason
    });

    deadline.targetChapter = newTarget;
    deadline.wasExtended = true;

    return true;
  }

  /**
   * Resolve deadline
   */
  resolveDeadline(deadlineId: string, chapter: number, wasMet: boolean): boolean {
    const deadline = this.deadlines.get(deadlineId);
    if (!deadline) return false;

    deadline.actualResolutionChapter = chapter;
    deadline.wasMet = wasMet;
    deadline.isActive = false;

    this.activeDeadlines.delete(deadlineId);

    return true;
  }

  /**
   * Record deadline warning
   */
  recordDeadlineWarning(deadlineId: string, chapter: number): void {
    const deadline = this.deadlines.get(deadlineId);
    if (deadline) {
      deadline.lastWarningChapter = chapter;
    }
  }

  // ===========================================================================
  // TENSION SOURCE MANAGEMENT
  // ===========================================================================

  /**
   * Create tension source
   */
  createTensionSource(data: Omit<TensionSourceInstance, 'id' | 'peakLevel' | 'levelHistory' | 'isActive'>): TensionSourceInstance {
    const id = uuidv4();
    const source: TensionSourceInstance = {
      ...data,
      id,
      peakLevel: data.currentLevel,
      levelHistory: [{
        chapter: data.startChapter,
        level: data.currentLevel,
        reason: 'Source created'
      }],
      isActive: true
    };

    this.tensionSources.set(id, source);

    // Update index
    const typeSet = this.sourcesByType.get(data.source) || new Set();
    typeSet.add(id);
    this.sourcesByType.set(data.source, typeSet);

    return source;
  }

  /**
   * Get active tension sources
   */
  getActiveTensionSources(): TensionSourceInstance[] {
    return Array.from(this.tensionSources.values()).filter(s => s.isActive);
  }

  /**
   * Update tension source level
   */
  updateSourceLevel(sourceId: string, newLevel: TensionLevel, chapter: number, reason: string): boolean {
    const source = this.tensionSources.get(sourceId);
    if (!source) return false;

    source.levelHistory.push({ chapter, level: newLevel, reason });
    source.currentLevel = newLevel;
    source.peakLevel = Math.max(source.peakLevel, newLevel) as TensionLevel;

    return true;
  }

  /**
   * Resolve tension source
   */
  resolveTensionSource(sourceId: string, chapter: number): boolean {
    const source = this.tensionSources.get(sourceId);
    if (!source) return false;

    source.endChapter = chapter;
    source.isActive = false;

    return true;
  }

  // ===========================================================================
  // CHAPTER TENSION
  // ===========================================================================

  /**
   * Record chapter tension
   */
  recordChapterTension(data: Omit<ChapterTension, 'tensionBalance' | 'readerEngagement'>): ChapterTension {
    // Calculate balance
    let tensionBalance: ChapterTension['tensionBalance'] = 'balanced';
    if (data.overallTension <= TensionLevel.MILD && data.highestStakes <= StakesLevel.LOW) {
      tensionBalance = 'too_low';
    } else if (data.overallTension >= TensionLevel.INTENSE && data.reliefMoments.length === 0) {
      tensionBalance = 'too_high';
    }

    // Predict engagement
    let engagement = 50;
    engagement += (data.overallTension as number) * 8;
    engagement += (data.highestStakes as number) * 5;
    engagement -= data.overallTension >= TensionLevel.OVERWHELMING ? 20 : 0;
    engagement += data.reliefMoments.length > 0 ? 10 : -5;
    engagement = Math.max(0, Math.min(100, engagement));

    const chapterTension: ChapterTension = {
      ...data,
      tensionBalance,
      readerEngagement: engagement
    };

    this.chapterTensions.set(data.chapter, chapterTension);

    return chapterTension;
  }

  /**
   * Get chapter tension
   */
  getChapterTension(chapter: number): ChapterTension | undefined {
    return this.chapterTensions.get(chapter);
  }

  /**
   * Calculate current tension level
   */
  calculateCurrentTension(_chapter: number): TensionLevel {
    const sources = this.getActiveTensionSources();
    if (sources.length === 0) return TensionLevel.RELAXED;

    // Weighted average with max having high weight
    const levels = sources.map(s => s.currentLevel as number);
    const max = Math.max(...levels);
    const avg = levels.reduce((a, b) => a + b, 0) / levels.length;

    const combined = (max * 0.6 + avg * 0.4);
    return Math.round(combined) as TensionLevel;
  }

  // ===========================================================================
  // TENSION ARC
  // ===========================================================================

  /**
   * Create tension arc
   */
  createTensionArc(data: Omit<TensionArc, 'id' | 'actualTensions'>): TensionArc {
    const id = uuidv4();
    const arc: TensionArc = {
      ...data,
      id,
      actualTensions: new Map()
    };

    this.tensionArcs.set(id, arc);

    return arc;
  }

  /**
   * Add beat to arc
   */
  addBeatToArc(arcId: string, beat: Omit<TensionBeat, 'id' | 'achieved'>): TensionBeat {
    const arc = this.tensionArcs.get(arcId);
    if (!arc) throw new Error(`Arc ${arcId} not found`);

    const id = uuidv4();
    const fullBeat: TensionBeat = {
      ...beat,
      id,
      achieved: false
    };

    arc.plannedBeats.push(fullBeat);
    arc.plannedBeats.sort((a, b) => a.chapter - b.chapter);

    return fullBeat;
  }

  /**
   * Record actual tension for arc
   */
  recordArcTension(arcId: string, chapter: number, tension: TensionLevel): void {
    const arc = this.tensionArcs.get(arcId);
    if (!arc) return;

    arc.actualTensions.set(chapter, tension);

    // Check if beat achieved
    const beat = arc.plannedBeats.find(b => b.chapter === chapter);
    if (beat) {
      beat.actualTension = tension;
      beat.achieved = Math.abs((tension as number) - (beat.targetTension as number)) <= 1;
    }
  }

  // ===========================================================================
  // ANALYSIS
  // ===========================================================================

  /**
   * Analyze pacing
   */
  analyzePacing(startChapter: number, endChapter: number): PacingAnalysis {
    const tensions: number[] = [];
    const stakes: number[] = [];
    const peaks: { chapter: number; tension: TensionLevel }[] = [];
    const valleys: { chapter: number; tension: TensionLevel }[] = [];

    let lastTension = TensionLevel.RELAXED;
    const tensionDistribution: Record<number, number> = {};
    const stakesDistribution: Record<number, number> = {};

    // Initialize distributions
    for (let i = 0; i <= 7; i++) {
      tensionDistribution[i] = 0;
      if (i <= 8) stakesDistribution[i] = 0;
    }

    // Analyze each chapter
    for (let ch = startChapter; ch <= endChapter; ch++) {
      const ct = this.chapterTensions.get(ch);
      if (!ct) continue;

      tensions.push(ct.overallTension as number);
      stakes.push(ct.highestStakes as number);

      tensionDistribution[ct.overallTension as number]++;
      stakesDistribution[ct.highestStakes as number]++;

      // Detect peaks/valleys
      const current = ct.overallTension as number;
      const last = lastTension as number;
      if (current >= TensionLevel.HIGH && current > last) {
        peaks.push({ chapter: ch, tension: ct.overallTension });
      }
      if (current <= TensionLevel.MILD && current < last) {
        valleys.push({ chapter: ch, tension: ct.overallTension });
      }
      lastTension = ct.overallTension;
    }

    // Calculate statistics
    const avgTension = tensions.length > 0
      ? tensions.reduce((a, b) => a + b, 0) / tensions.length
      : 0;
    const avgStakes = stakes.length > 0
      ? stakes.reduce((a, b) => a + b, 0) / stakes.length
      : 0;
    const variance = tensions.length > 0
      ? tensions.reduce((sum, t) => sum + Math.pow(t - avgTension, 2), 0) / tensions.length
      : 0;

    // Find issues
    const prolongedHighTension: number[] = [];
    const prolongedLowTension: number[] = [];
    const missingRelief: number[] = [];

    let highTensionStreak = 0;
    let lowTensionStreak = 0;
    let lastReliefChapter = startChapter;

    for (let ch = startChapter; ch <= endChapter; ch++) {
      const ct = this.chapterTensions.get(ch);
      if (!ct) continue;

      if (ct.overallTension >= TensionLevel.HIGH) {
        highTensionStreak++;
        if (highTensionStreak > this.config.maxSustainedHighTensionChapters) {
          prolongedHighTension.push(ch);
        }
        if (ct.reliefMoments.length === 0 && ch - lastReliefChapter > this.config.reliefFrequency) {
          missingRelief.push(ch);
        }
      } else {
        highTensionStreak = 0;
        if (ct.reliefMoments.length > 0) {
          lastReliefChapter = ch;
        }
      }

      if (ct.overallTension <= TensionLevel.MILD) {
        lowTensionStreak++;
        if (lowTensionStreak > 15) {
          prolongedLowTension.push(ch);
        }
      } else {
        lowTensionStreak = 0;
      }
    }

    // Predict engagement
    let engagement = 70;
    engagement -= prolongedLowTension.length * 2;
    engagement -= prolongedHighTension.length;
    engagement -= missingRelief.length;
    engagement += variance * 5; // Variety is good
    engagement = Math.max(0, Math.min(100, engagement));

    // Build recommendations
    const recommendations: string[] = [];
    const risks: string[] = [];

    if (prolongedLowTension.length > 0) {
      risks.push(`${prolongedLowTension.length} chapters may lose reader interest due to low tension`);
      recommendations.push('Add conflict or stakes to low-tension sections');
    }
    if (prolongedHighTension.length > 0) {
      risks.push(`${prolongedHighTension.length} chapters may cause reader fatigue from sustained high tension`);
      recommendations.push('Add rest/relief moments to break up intense sections');
    }
    if (missingRelief.length > 0) {
      risks.push(`${missingRelief.length} high-tension chapters lack relief moments`);
      recommendations.push('Add comic relief, bonding moments, or small victories');
    }
    if (peaks.length < (endChapter - startChapter) / 50) {
      recommendations.push('Story may need more tension peaks - consider adding crises');
    }
    if (variance < 1) {
      recommendations.push('Tension is too consistent - add more variation for emotional impact');
    }

    return {
      chapterRange: [startChapter, endChapter],
      averageTension: avgTension,
      averageStakes: avgStakes,
      tensionVariance: variance,
      peaks,
      valleys,
      prolongedHighTension,
      prolongedLowTension,
      missingRelief,
      tensionDistribution: tensionDistribution as Record<TensionLevel, number>,
      stakesDistribution: stakesDistribution as Record<StakesLevel, number>,
      predictedEngagement: engagement,
      engagementRisks: risks,
      recommendations
    };
  }

  /**
   * Get tension trajectory for chapters
   */
  getTensionTrajectory(startChapter: number, endChapter: number): { chapter: number; tension: TensionLevel }[] {
    const trajectory: { chapter: number; tension: TensionLevel }[] = [];

    for (let ch = startChapter; ch <= endChapter; ch++) {
      const ct = this.chapterTensions.get(ch);
      trajectory.push({
        chapter: ch,
        tension: ct?.overallTension ?? TensionLevel.RELAXED
      });
    }

    return trajectory;
  }

  // ===========================================================================
  // REPORTS
  // ===========================================================================

  /**
   * Generate tension report
   */
  generateReport(currentChapter: number): string {
    let report = '# Tension & Stakes Report\n\n';

    // Current state
    report += '## Current State\n\n';
    const currentTension = this.calculateCurrentTension(currentChapter);
    const highestStakes = this.getHighestActiveStakes();
    report += `- **Current Tension:** ${TensionLevel[currentTension]}\n`;
    report += `- **Highest Stakes:** ${StakesLevel[highestStakes]}\n`;
    report += `- **Active Stakes:** ${this.getActiveStakes().length}\n`;
    report += `- **Active Deadlines:** ${this.getActiveDeadlines().length}\n`;
    report += `- **Active Tension Sources:** ${this.getActiveTensionSources().length}\n\n`;

    // Approaching deadlines
    const approaching = this.getApproachingDeadlines(currentChapter);
    if (approaching.length > 0) {
      report += '## Approaching Deadlines\n\n';
      for (const d of approaching) {
        const chaptersLeft = d.targetChapter - currentChapter;
        report += `- **${d.name}**: ${chaptersLeft} chapters (Ch ${d.targetChapter})\n`;
        report += `  - Consequence: ${d.consequenceIfMissed}\n`;
      }
      report += '\n';
    }

    // Active stakes
    const activeStakes = this.getActiveStakes().sort((a, b) => b.level - a.level);
    if (activeStakes.length > 0) {
      report += '## Active Stakes\n\n';
      for (const s of activeStakes.slice(0, 5)) {
        report += `### ${s.name}\n`;
        report += `- Level: ${StakesLevel[s.level]}\n`;
        report += `- At Risk: ${s.whatAtRisk.join(', ')}\n`;
        report += `- Worst Case: ${s.worstCase}\n\n`;
      }
    }

    // Recent analysis
    const lookBack = 50;
    const analysis = this.analyzePacing(Math.max(1, currentChapter - lookBack), currentChapter);
    report += '## Recent Pacing Analysis\n\n';
    report += `- **Average Tension:** ${analysis.averageTension.toFixed(1)}\n`;
    report += `- **Tension Variance:** ${analysis.tensionVariance.toFixed(1)}\n`;
    report += `- **Predicted Engagement:** ${analysis.predictedEngagement}%\n\n`;

    if (analysis.recommendations.length > 0) {
      report += '### Recommendations\n\n';
      for (const rec of analysis.recommendations) {
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
    totalStakes: number;
    activeStakes: number;
    totalDeadlines: number;
    activeDeadlines: number;
    totalSources: number;
    activeSources: number;
    chaptersTracked: number;
    tensionArcs: number;
  } {
    return {
      totalStakes: this.stakes.size,
      activeStakes: this.getActiveStakes().length,
      totalDeadlines: this.deadlines.size,
      activeDeadlines: this.activeDeadlines.size,
      totalSources: this.tensionSources.size,
      activeSources: this.getActiveTensionSources().length,
      chaptersTracked: this.chapterTensions.size,
      tensionArcs: this.tensionArcs.size
    };
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    // Convert Maps with Map values
    const chapterTensionsArray = Array.from(this.chapterTensions.entries()).map(([ch, ct]) => [ch, {
      ...ct,
      sourceTensionsArray: Array.from(ct.sourceTensions.entries())
    }]);

    const tensionArcsArray = Array.from(this.tensionArcs.entries()).map(([id, arc]) => [id, {
      ...arc,
      actualTensionsArray: Array.from(arc.actualTensions.entries())
    }]);

    return JSON.stringify({
      stakes: Array.from(this.stakes.entries()),
      deadlines: Array.from(this.deadlines.entries()),
      chapterTensions: chapterTensionsArray,
      tensionSources: Array.from(this.tensionSources.entries()),
      tensionArcs: tensionArcsArray,
      config: this.config
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.stakes) {
      this.stakes = new Map(data.stakes);
      // Rebuild index
      for (const level of Object.values(StakesLevel).filter(v => typeof v === 'number')) {
        this.stakesByLevel.set(level as StakesLevel, new Set());
      }
      for (const [id, stakes] of this.stakes) {
        const levelSet = this.stakesByLevel.get(stakes.level) || new Set();
        levelSet.add(id);
        this.stakesByLevel.set(stakes.level, levelSet);
      }
    }

    if (data.deadlines) {
      this.deadlines = new Map(data.deadlines);
      this.activeDeadlines.clear();
      for (const [id, deadline] of this.deadlines) {
        if (deadline.isActive) {
          this.activeDeadlines.add(id);
        }
      }
    }

    if (data.chapterTensions) {
      this.chapterTensions.clear();
      for (const [ch, ct] of data.chapterTensions) {
        this.chapterTensions.set(ch, {
          ...ct,
          sourceTensions: new Map(ct.sourceTensionsArray || [])
        });
      }
    }

    if (data.tensionSources) {
      this.tensionSources = new Map(data.tensionSources);
      // Rebuild index
      for (const source of Object.values(TensionSource)) {
        this.sourcesByType.set(source, new Set());
      }
      for (const [id, source] of this.tensionSources) {
        const typeSet = this.sourcesByType.get(source.source) || new Set();
        typeSet.add(id);
        this.sourcesByType.set(source.source, typeSet);
      }
    }

    if (data.tensionArcs) {
      this.tensionArcs.clear();
      for (const [id, arc] of data.tensionArcs) {
        this.tensionArcs.set(id, {
          ...arc,
          actualTensions: new Map(arc.actualTensionsArray || [])
        });
      }
    }

    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.stakes.clear();
    this.deadlines.clear();
    this.chapterTensions.clear();
    this.tensionSources.clear();
    this.tensionArcs.clear();
    this.activeDeadlines.clear();

    for (const level of Object.values(StakesLevel).filter(v => typeof v === 'number')) {
      this.stakesByLevel.set(level as StakesLevel, new Set());
    }
    for (const source of Object.values(TensionSource)) {
      this.sourcesByType.set(source, new Set());
    }
  }
}

// Default instance
export const tensionTracker = new TensionTracker();

export default TensionTracker;
