/**
 * Epic Fiction Architect - Plot Thread Manager
 *
 * Tracks multiple parallel storylines (plot threads) across 12,000+ chapters.
 * Manages thread interweaving, convergence points, dormancy periods, and
 * ensures no threads are forgotten or left unresolved.
 *
 * Critical for epic narratives where dozens of subplots run simultaneously.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Types of plot threads
 */
export enum PlotThreadType {
  MAIN = 'main',               // Primary story thread
  MAJOR = 'major',             // Significant subplot
  MINOR = 'minor',             // Small subplot
  CHARACTER_ARC = 'character_arc', // Character development thread
  ROMANCE = 'romance',         // Romantic subplot
  MYSTERY = 'mystery',         // Mystery/investigation
  POLITICAL = 'political',     // Political intrigue
  ACTION = 'action',           // Combat/adventure thread
  PERSONAL = 'personal',       // Personal/emotional journey
  WORLD = 'world',             // World-changing events
  BACKSTORY = 'backstory',     // Past events being revealed
  PROPHECY = 'prophecy',       // Prophecy fulfillment
  REVENGE = 'revenge',         // Revenge arc
  REDEMPTION = 'redemption',   // Redemption arc
  RIVALRY = 'rivalry',         // Competition/rivalry
  QUEST = 'quest',             // Goal-oriented journey
  SURVIVAL = 'survival',       // Survival situation
  HIDDEN = 'hidden'            // Background thread not yet visible
}

/**
 * Thread status
 */
export enum ThreadStatus {
  PLANNED = 'planned',         // Not yet started
  ACTIVE = 'active',           // Currently progressing
  DORMANT = 'dormant',         // Paused but will resume
  CLIMAXING = 'climaxing',     // At peak intensity
  RESOLVING = 'resolving',     // Being wrapped up
  RESOLVED = 'resolved',       // Complete
  ABANDONED = 'abandoned',     // Dropped (should be rare)
  MERGED = 'merged',           // Combined with another thread
  FORKED = 'forked'            // Split into multiple threads
}

/**
 * Thread priority for attention allocation
 */
export enum ThreadPriority {
  CRITICAL = 1,                // Must advance regularly
  HIGH = 2,                    // Should advance frequently
  MEDIUM = 3,                  // Moderate advancement needed
  LOW = 4,                     // Can go dormant for extended periods
  BACKGROUND = 5               // Minimal advancement required
}

/**
 * Types of thread interactions
 */
export enum ThreadInteractionType {
  CONVERGES_WITH = 'converges_with',   // Threads meet
  DIVERGES_FROM = 'diverges_from',     // Threads separate
  BLOCKED_BY = 'blocked_by',           // One blocks another
  ENABLES = 'enables',                  // One enables another
  CONFLICTS_WITH = 'conflicts_with',   // Threads in tension
  PARALLELS = 'parallels',             // Thematic parallel
  REFERENCES = 'references',           // One mentions another
  DEPENDS_ON = 'depends_on',           // Resolution depends on another
  SPAWNS = 'spawns'                    // One creates another
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * A plot thread (storyline) in the narrative
 */
export interface PlotThread {
  id: string;
  name: string;
  type: PlotThreadType;
  status: ThreadStatus;
  priority: ThreadPriority;

  // Description
  summary: string;
  goal: string;                // What this thread aims to accomplish
  stakes: string;              // What's at risk
  question: string;            // The dramatic question posed

  // Characters
  protagonistIds: string[];    // Main characters driving this thread
  antagonistIds: string[];     // Opposing forces
  involvedCharacterIds: string[]; // All characters involved

  // Timeline
  startChapter?: number;
  estimatedEndChapter?: number;
  actualEndChapter?: number;

  // Progress
  progressPercentage: number;  // 0-100
  milestones: ThreadMilestone[];
  currentMilestoneIndex: number;

  // Activity tracking
  activeChapters: number[];    // Chapters where thread advances
  dormantRanges: Array<{ start: number; end: number }>;
  lastActiveChapter?: number;
  chaptersSinceLast?: number;

  // Connections
  parentThreadId?: string;     // If spawned from another
  childThreadIds: string[];    // Threads spawned by this
  interactions: ThreadInteraction[];

  // Resolution
  resolution?: ThreadResolution;
  foreshadowing: string[];     // Planted seeds
  payoffs: string[];           // Seeds paid off

  // Themes
  themes: string[];
  emotionalTone: string;

  // Metadata
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A milestone in a plot thread
 */
export interface ThreadMilestone {
  id: string;
  order: number;
  name: string;
  description: string;
  requiredForCompletion: boolean;
  isReached: boolean;
  reachedChapter?: number;

  // Conditions
  prerequisiteMilestones: string[]; // Must be reached first
  blockedBy?: string[];             // What prevents reaching this
}

/**
 * Interaction between threads
 */
export interface ThreadInteraction {
  id: string;
  type: ThreadInteractionType;
  otherThreadId: string;
  otherThreadName: string;
  chapter?: number;
  description: string;
  impact: 'major' | 'moderate' | 'minor';
}

/**
 * How a thread resolves
 */
export interface ThreadResolution {
  type: 'success' | 'failure' | 'partial' | 'twist' | 'open';
  description: string;
  chapter: number;
  satisfactionLevel: number;   // 1-10 how well it wrapped up
  consequences: string[];
  leadingTo?: string[];        // New threads spawned by resolution
}

/**
 * Thread health metrics
 */
export interface ThreadHealth {
  threadId: string;
  threadName: string;
  health: 'excellent' | 'good' | 'concerning' | 'critical' | 'abandoned';
  issues: string[];
  recommendations: string[];
  chaptersSinceActivity: number;
  progressRate: number;        // % per 100 chapters
  estimatedCompletion?: number;
}

/**
 * Thread weaving pattern for a chapter range
 */
export interface WeavingPattern {
  startChapter: number;
  endChapter: number;
  threadActivity: Map<string, number[]>; // threadId -> active chapters
  convergencePoints: Array<{
    chapter: number;
    threads: string[];
    description: string;
  }>;
  dormancyWarnings: Array<{
    threadId: string;
    dormantSince: number;
    duration: number;
  }>;
  balance: Record<string, number>; // threadId -> % of chapters
}

/**
 * Configuration for the thread manager
 */
export interface ThreadManagerConfig {
  maxDormancyChapters: number;         // Warning after this many chapters
  criticalDormancyChapters: number;    // Error after this many
  minActiveThreadsPerChapter: number;
  maxActiveThreadsPerChapter: number;
  requiredMainThreadFrequency: number; // Must appear every N chapters
  enableAutoBalancing: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: ThreadManagerConfig = {
  maxDormancyChapters: 50,
  criticalDormancyChapters: 200,
  minActiveThreadsPerChapter: 1,
  maxActiveThreadsPerChapter: 5,
  requiredMainThreadFrequency: 10,
  enableAutoBalancing: true
};

// ============================================================================
// PLOT THREAD MANAGER
// ============================================================================

/**
 * Plot Thread Manager
 *
 * Tracks and manages multiple parallel storylines across the narrative,
 * ensuring proper weaving, no forgotten threads, and satisfying resolutions.
 */
export class PlotThreadManager {
  private config: ThreadManagerConfig;
  private threads: Map<string, PlotThread> = new Map();

  // Indices
  private threadsByType: Map<PlotThreadType, Set<string>> = new Map();
  private threadsByStatus: Map<ThreadStatus, Set<string>> = new Map();
  private threadsByCharacter: Map<string, Set<string>> = new Map();
  private threadsByChapter: Map<number, Set<string>> = new Map();

  constructor(config?: Partial<ThreadManagerConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // ==========================================================================
  // THREAD MANAGEMENT
  // ==========================================================================

  /**
   * Create a new plot thread
   */
  createThread(data: {
    name: string;
    type: PlotThreadType;
    summary: string;
    goal: string;
    stakes: string;
    question: string;
    protagonistIds?: string[];
    antagonistIds?: string[];
    priority?: ThreadPriority;
    startChapter?: number;
    estimatedEndChapter?: number;
    themes?: string[];
    parentThreadId?: string;
    tags?: string[];
    notes?: string;
  }): PlotThread {
    const id = uuidv4();
    const now = new Date();

    const thread: PlotThread = {
      id,
      name: data.name,
      type: data.type,
      status: data.startChapter ? ThreadStatus.ACTIVE : ThreadStatus.PLANNED,
      priority: data.priority ?? ThreadPriority.MEDIUM,
      summary: data.summary,
      goal: data.goal,
      stakes: data.stakes,
      question: data.question,
      protagonistIds: data.protagonistIds ?? [],
      antagonistIds: data.antagonistIds ?? [],
      involvedCharacterIds: [
        ...(data.protagonistIds ?? []),
        ...(data.antagonistIds ?? [])
      ],
      startChapter: data.startChapter,
      estimatedEndChapter: data.estimatedEndChapter,
      progressPercentage: 0,
      milestones: [],
      currentMilestoneIndex: 0,
      activeChapters: data.startChapter ? [data.startChapter] : [],
      dormantRanges: [],
      lastActiveChapter: data.startChapter,
      parentThreadId: data.parentThreadId,
      childThreadIds: [],
      interactions: [],
      foreshadowing: [],
      payoffs: [],
      themes: data.themes ?? [],
      emotionalTone: 'neutral',
      tags: data.tags ?? [],
      notes: data.notes ?? '',
      createdAt: now,
      updatedAt: now
    };

    this.storeThread(thread);

    // Link to parent if exists
    if (data.parentThreadId) {
      const parent = this.threads.get(data.parentThreadId);
      if (parent) {
        parent.childThreadIds.push(id);
        this.addInteraction(
          data.parentThreadId,
          id,
          ThreadInteractionType.SPAWNS,
          `Spawned thread: ${data.name}`,
          data.startChapter
        );
      }
    }

    return thread;
  }

  /**
   * Store thread and update indices
   */
  private storeThread(thread: PlotThread): void {
    this.threads.set(thread.id, thread);

    // Index by type
    if (!this.threadsByType.has(thread.type)) {
      this.threadsByType.set(thread.type, new Set());
    }
    this.threadsByType.get(thread.type)!.add(thread.id);

    // Index by status
    if (!this.threadsByStatus.has(thread.status)) {
      this.threadsByStatus.set(thread.status, new Set());
    }
    this.threadsByStatus.get(thread.status)!.add(thread.id);

    // Index by characters
    for (const charId of thread.involvedCharacterIds) {
      if (!this.threadsByCharacter.has(charId)) {
        this.threadsByCharacter.set(charId, new Set());
      }
      this.threadsByCharacter.get(charId)!.add(thread.id);
    }

    // Index by chapters
    for (const chapter of thread.activeChapters) {
      if (!this.threadsByChapter.has(chapter)) {
        this.threadsByChapter.set(chapter, new Set());
      }
      this.threadsByChapter.get(chapter)!.add(thread.id);
    }
  }

  /**
   * Get thread by ID
   */
  getThread(id: string): PlotThread | undefined {
    return this.threads.get(id);
  }

  /**
   * Get all threads
   */
  getAllThreads(): PlotThread[] {
    return Array.from(this.threads.values());
  }

  /**
   * Update a thread
   */
  updateThread(
    id: string,
    updates: Partial<Omit<PlotThread, 'id' | 'createdAt'>>
  ): PlotThread | undefined {
    const thread = this.threads.get(id);
    if (!thread) return undefined;

    // Handle status change for indices
    if (updates.status && updates.status !== thread.status) {
      this.threadsByStatus.get(thread.status)?.delete(id);
      if (!this.threadsByStatus.has(updates.status)) {
        this.threadsByStatus.set(updates.status, new Set());
      }
      this.threadsByStatus.get(updates.status)!.add(id);
    }

    const updated: PlotThread = {
      ...thread,
      ...updates,
      updatedAt: new Date()
    };

    this.threads.set(id, updated);
    return updated;
  }

  // ==========================================================================
  // MILESTONE MANAGEMENT
  // ==========================================================================

  /**
   * Add milestone to thread
   */
  addMilestone(
    threadId: string,
    data: {
      name: string;
      description: string;
      requiredForCompletion?: boolean;
      prerequisiteMilestones?: string[];
    }
  ): ThreadMilestone | undefined {
    const thread = this.threads.get(threadId);
    if (!thread) return undefined;

    const milestone: ThreadMilestone = {
      id: uuidv4(),
      order: thread.milestones.length,
      name: data.name,
      description: data.description,
      requiredForCompletion: data.requiredForCompletion ?? true,
      isReached: false,
      prerequisiteMilestones: data.prerequisiteMilestones ?? []
    };

    thread.milestones.push(milestone);
    thread.updatedAt = new Date();

    return milestone;
  }

  /**
   * Mark milestone as reached
   */
  reachMilestone(
    threadId: string,
    milestoneId: string,
    chapter: number
  ): boolean {
    const thread = this.threads.get(threadId);
    if (!thread) return false;

    const milestone = thread.milestones.find(m => m.id === milestoneId);
    if (!milestone) return false;

    // Check prerequisites
    for (const prereqId of milestone.prerequisiteMilestones) {
      const prereq = thread.milestones.find(m => m.id === prereqId);
      if (prereq && !prereq.isReached) {
        return false; // Prerequisites not met
      }
    }

    milestone.isReached = true;
    milestone.reachedChapter = chapter;

    // Update progress
    const reachedCount = thread.milestones.filter(m => m.isReached).length;
    thread.progressPercentage = Math.round(
      (reachedCount / thread.milestones.length) * 100
    );

    // Update current milestone index
    const nextUnreached = thread.milestones.findIndex(m => !m.isReached);
    thread.currentMilestoneIndex = nextUnreached === -1
      ? thread.milestones.length
      : nextUnreached;

    thread.updatedAt = new Date();

    return true;
  }

  // ==========================================================================
  // ACTIVITY TRACKING
  // ==========================================================================

  /**
   * Record thread activity in a chapter
   */
  recordActivity(threadId: string, chapter: number): void {
    const thread = this.threads.get(threadId);
    if (!thread) return;

    // Check for dormancy ending
    if (thread.status === ThreadStatus.DORMANT) {
      if (thread.lastActiveChapter) {
        thread.dormantRanges.push({
          start: thread.lastActiveChapter,
          end: chapter
        });
      }
      thread.status = ThreadStatus.ACTIVE;
      this.threadsByStatus.get(ThreadStatus.DORMANT)?.delete(threadId);
      if (!this.threadsByStatus.has(ThreadStatus.ACTIVE)) {
        this.threadsByStatus.set(ThreadStatus.ACTIVE, new Set());
      }
      this.threadsByStatus.get(ThreadStatus.ACTIVE)!.add(threadId);
    }

    // Add to active chapters
    if (!thread.activeChapters.includes(chapter)) {
      thread.activeChapters.push(chapter);
      thread.activeChapters.sort((a, b) => a - b);
    }

    // Update chapter index
    if (!this.threadsByChapter.has(chapter)) {
      this.threadsByChapter.set(chapter, new Set());
    }
    this.threadsByChapter.get(chapter)!.add(threadId);

    // Update last active
    thread.lastActiveChapter = chapter;
    thread.chaptersSinceLast = 0;
    thread.updatedAt = new Date();
  }

  /**
   * Mark thread as dormant
   */
  setDormant(threadId: string, chapter: number, reason?: string): void {
    const thread = this.threads.get(threadId);
    if (!thread) return;

    thread.status = ThreadStatus.DORMANT;
    if (reason) {
      thread.notes += `\n[Ch ${chapter}] Dormant: ${reason}`;
    }

    this.threadsByStatus.get(ThreadStatus.ACTIVE)?.delete(threadId);
    if (!this.threadsByStatus.has(ThreadStatus.DORMANT)) {
      this.threadsByStatus.set(ThreadStatus.DORMANT, new Set());
    }
    this.threadsByStatus.get(ThreadStatus.DORMANT)!.add(threadId);

    thread.updatedAt = new Date();
  }

  /**
   * Update dormancy counters for all threads
   */
  updateDormancyCounters(currentChapter: number): void {
    for (const thread of this.threads.values()) {
      if (thread.status === ThreadStatus.ACTIVE ||
          thread.status === ThreadStatus.DORMANT) {
        if (thread.lastActiveChapter) {
          thread.chaptersSinceLast = currentChapter - thread.lastActiveChapter;
        }
      }
    }
  }

  // ==========================================================================
  // INTERACTIONS
  // ==========================================================================

  /**
   * Add interaction between threads
   */
  addInteraction(
    threadId: string,
    otherThreadId: string,
    type: ThreadInteractionType,
    description: string,
    chapter?: number,
    impact: 'major' | 'moderate' | 'minor' = 'moderate'
  ): ThreadInteraction | undefined {
    const thread = this.threads.get(threadId);
    const other = this.threads.get(otherThreadId);

    if (!thread || !other) return undefined;

    const interaction: ThreadInteraction = {
      id: uuidv4(),
      type,
      otherThreadId,
      otherThreadName: other.name,
      chapter,
      description,
      impact
    };

    thread.interactions.push(interaction);
    thread.updatedAt = new Date();

    // Add reverse interaction for bidirectional types
    if (type === ThreadInteractionType.CONVERGES_WITH ||
        type === ThreadInteractionType.PARALLELS ||
        type === ThreadInteractionType.CONFLICTS_WITH) {
      const reverse: ThreadInteraction = {
        id: uuidv4(),
        type,
        otherThreadId: threadId,
        otherThreadName: thread.name,
        chapter,
        description,
        impact
      };
      other.interactions.push(reverse);
      other.updatedAt = new Date();
    }

    return interaction;
  }

  /**
   * Record convergence point between threads
   */
  recordConvergence(
    threadIds: string[],
    chapter: number,
    description: string
  ): void {
    for (let i = 0; i < threadIds.length; i++) {
      for (let j = i + 1; j < threadIds.length; j++) {
        this.addInteraction(
          threadIds[i],
          threadIds[j],
          ThreadInteractionType.CONVERGES_WITH,
          description,
          chapter,
          'major'
        );
      }
      this.recordActivity(threadIds[i], chapter);
    }
  }

  // ==========================================================================
  // RESOLUTION
  // ==========================================================================

  /**
   * Resolve a thread
   */
  resolveThread(
    threadId: string,
    resolution: Omit<ThreadResolution, 'chapter'>,
    chapter: number
  ): boolean {
    const thread = this.threads.get(threadId);
    if (!thread) return false;

    thread.resolution = {
      ...resolution,
      chapter
    };
    thread.status = ThreadStatus.RESOLVED;
    thread.actualEndChapter = chapter;
    thread.progressPercentage = 100;

    // Update indices
    this.threadsByStatus.get(ThreadStatus.ACTIVE)?.delete(threadId);
    this.threadsByStatus.get(ThreadStatus.DORMANT)?.delete(threadId);
    this.threadsByStatus.get(ThreadStatus.CLIMAXING)?.delete(threadId);
    this.threadsByStatus.get(ThreadStatus.RESOLVING)?.delete(threadId);

    if (!this.threadsByStatus.has(ThreadStatus.RESOLVED)) {
      this.threadsByStatus.set(ThreadStatus.RESOLVED, new Set());
    }
    this.threadsByStatus.get(ThreadStatus.RESOLVED)!.add(threadId);

    thread.updatedAt = new Date();

    // Create child threads from consequences if specified
    if (resolution.leadingTo) {
      for (const childDesc of resolution.leadingTo) {
        thread.notes += `\nLeads to: ${childDesc}`;
      }
    }

    return true;
  }

  // ==========================================================================
  // HEALTH & ANALYSIS
  // ==========================================================================

  /**
   * Analyze thread health
   */
  analyzeThreadHealth(threadId: string, currentChapter: number): ThreadHealth {
    const thread = this.threads.get(threadId);
    if (!thread) {
      return {
        threadId,
        threadName: 'Unknown',
        health: 'abandoned',
        issues: ['Thread not found'],
        recommendations: [],
        chaptersSinceActivity: 0,
        progressRate: 0
      };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Calculate dormancy
    const chaptersSinceActivity = thread.lastActiveChapter
      ? currentChapter - thread.lastActiveChapter
      : currentChapter - (thread.startChapter ?? 0);

    // Calculate progress rate
    const totalChapters = thread.activeChapters.length > 0
      ? thread.activeChapters[thread.activeChapters.length - 1] - (thread.startChapter ?? 0)
      : 0;
    const progressRate = totalChapters > 0
      ? (thread.progressPercentage / totalChapters) * 100
      : 0;

    // Check for issues
    if (chaptersSinceActivity > this.config.criticalDormancyChapters) {
      issues.push(`No activity for ${chaptersSinceActivity} chapters (critical)`);
      recommendations.push('Consider resolving or explicitly abandoning this thread');
    } else if (chaptersSinceActivity > this.config.maxDormancyChapters) {
      issues.push(`No activity for ${chaptersSinceActivity} chapters`);
      recommendations.push('Schedule scenes to advance this thread');
    }

    if (thread.priority === ThreadPriority.CRITICAL &&
        chaptersSinceActivity > this.config.requiredMainThreadFrequency) {
      issues.push(`Critical thread inactive for ${chaptersSinceActivity} chapters`);
      recommendations.push('High priority thread needs immediate attention');
    }

    if (thread.milestones.length > 0 &&
        thread.progressPercentage < 50 &&
        thread.estimatedEndChapter &&
        currentChapter > thread.estimatedEndChapter * 0.7) {
      issues.push('Behind schedule on milestones');
      recommendations.push('Accelerate thread progress or extend timeline');
    }

    if (thread.foreshadowing.length > thread.payoffs.length * 2) {
      issues.push(`${thread.foreshadowing.length - thread.payoffs.length} foreshadowing elements unpaid`);
      recommendations.push('Ensure foreshadowing pays off before resolution');
    }

    // Determine health level
    let health: ThreadHealth['health'];
    if (thread.status === ThreadStatus.ABANDONED) {
      health = 'abandoned';
    } else if (issues.length === 0) {
      health = 'excellent';
    } else if (issues.some(i => i.includes('critical'))) {
      health = 'critical';
    } else if (issues.length >= 2) {
      health = 'concerning';
    } else {
      health = 'good';
    }

    // Estimate completion
    let estimatedCompletion: number | undefined;
    if (progressRate > 0 && thread.progressPercentage < 100) {
      const remainingProgress = 100 - thread.progressPercentage;
      const chaptersNeeded = Math.ceil(remainingProgress / progressRate * 100);
      estimatedCompletion = currentChapter + chaptersNeeded;
    }

    return {
      threadId,
      threadName: thread.name,
      health,
      issues,
      recommendations,
      chaptersSinceActivity,
      progressRate,
      estimatedCompletion
    };
  }

  /**
   * Get all thread health statuses
   */
  getAllThreadHealth(currentChapter: number): ThreadHealth[] {
    return Array.from(this.threads.keys())
      .map(id => this.analyzeThreadHealth(id, currentChapter))
      .sort((a, b) => {
        const healthOrder = ['critical', 'concerning', 'abandoned', 'good', 'excellent'];
        return healthOrder.indexOf(a.health) - healthOrder.indexOf(b.health);
      });
  }

  /**
   * Analyze weaving pattern across chapters
   */
  analyzeWeavingPattern(
    startChapter: number,
    endChapter: number
  ): WeavingPattern {
    const threadActivity = new Map<string, number[]>();
    const convergencePoints: WeavingPattern['convergencePoints'] = [];
    const dormancyWarnings: WeavingPattern['dormancyWarnings'] = [];
    const balance: Record<string, number> = {};

    const totalChapters = endChapter - startChapter + 1;

    // Collect activity data
    for (let chapter = startChapter; chapter <= endChapter; chapter++) {
      const activeThreads = this.threadsByChapter.get(chapter);
      if (activeThreads) {
        const threadIds = Array.from(activeThreads);

        // Record activity
        for (const threadId of threadIds) {
          if (!threadActivity.has(threadId)) {
            threadActivity.set(threadId, []);
          }
          threadActivity.get(threadId)!.push(chapter);
        }

        // Check for convergence (3+ threads in same chapter)
        if (threadIds.length >= 3) {
          const threads = threadIds.map(id => this.threads.get(id)?.name ?? id);
          convergencePoints.push({
            chapter,
            threads: threadIds,
            description: `Convergence: ${threads.join(', ')}`
          });
        }
      }
    }

    // Calculate balance and check dormancy
    for (const thread of this.threads.values()) {
      if (thread.status === ThreadStatus.RESOLVED ||
          thread.status === ThreadStatus.PLANNED) {
        continue;
      }

      const activity = threadActivity.get(thread.id) ?? [];
      const percentage = (activity.length / totalChapters) * 100;
      balance[thread.id] = percentage;

      // Check for dormancy in range
      if (activity.length > 0) {
        const firstActive = Math.min(...activity);
        const lastActive = Math.max(...activity);

        if (lastActive < endChapter &&
            endChapter - lastActive > this.config.maxDormancyChapters) {
          dormancyWarnings.push({
            threadId: thread.id,
            dormantSince: lastActive,
            duration: endChapter - lastActive
          });
        }

        // Check for gaps within the range
        let lastChapter = firstActive;
        for (const chapter of activity.sort((a, b) => a - b)) {
          if (chapter - lastChapter > this.config.maxDormancyChapters) {
            dormancyWarnings.push({
              threadId: thread.id,
              dormantSince: lastChapter,
              duration: chapter - lastChapter
            });
          }
          lastChapter = chapter;
        }
      }
    }

    return {
      startChapter,
      endChapter,
      threadActivity,
      convergencePoints,
      dormancyWarnings,
      balance
    };
  }

  // ==========================================================================
  // QUERIES
  // ==========================================================================

  /**
   * Get threads by type
   */
  getThreadsByType(type: PlotThreadType): PlotThread[] {
    const ids = this.threadsByType.get(type);
    if (!ids) return [];
    return Array.from(ids).map(id => this.threads.get(id)!).filter(Boolean);
  }

  /**
   * Get threads by status
   */
  getThreadsByStatus(status: ThreadStatus): PlotThread[] {
    const ids = this.threadsByStatus.get(status);
    if (!ids) return [];
    return Array.from(ids).map(id => this.threads.get(id)!).filter(Boolean);
  }

  /**
   * Get active threads
   */
  getActiveThreads(): PlotThread[] {
    return this.getThreadsByStatus(ThreadStatus.ACTIVE);
  }

  /**
   * Get threads involving a character
   */
  getThreadsByCharacter(characterId: string): PlotThread[] {
    const ids = this.threadsByCharacter.get(characterId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.threads.get(id)!).filter(Boolean);
  }

  /**
   * Get threads active in a chapter
   */
  getThreadsInChapter(chapter: number): PlotThread[] {
    const ids = this.threadsByChapter.get(chapter);
    if (!ids) return [];
    return Array.from(ids).map(id => this.threads.get(id)!).filter(Boolean);
  }

  /**
   * Get unresolved threads
   */
  getUnresolvedThreads(): PlotThread[] {
    return Array.from(this.threads.values())
      .filter(t =>
        t.status !== ThreadStatus.RESOLVED &&
        t.status !== ThreadStatus.ABANDONED &&
        t.status !== ThreadStatus.MERGED
      );
  }

  /**
   * Get threads needing attention
   */
  getThreadsNeedingAttention(currentChapter: number): PlotThread[] {
    return Array.from(this.threads.values())
      .filter(t => {
        const health = this.analyzeThreadHealth(t.id, currentChapter);
        return health.health === 'critical' || health.health === 'concerning';
      });
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    totalThreads: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    activeThreads: number;
    resolvedThreads: number;
    avgProgressPercentage: number;
    totalMilestones: number;
    milestonesReached: number;
    avgThreadLength: number;
    longestThread: { id: string; name: string; chapters: number } | null;
  } {
    const threads = Array.from(this.threads.values());

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let totalProgress = 0;
    let totalMilestones = 0;
    let milestonesReached = 0;
    let totalLength = 0;
    let longestThread: { id: string; name: string; chapters: number } | null = null;

    for (const thread of threads) {
      byType[thread.type] = (byType[thread.type] ?? 0) + 1;
      byStatus[thread.status] = (byStatus[thread.status] ?? 0) + 1;
      byPriority[thread.priority] = (byPriority[thread.priority] ?? 0) + 1;
      totalProgress += thread.progressPercentage;
      totalMilestones += thread.milestones.length;
      milestonesReached += thread.milestones.filter(m => m.isReached).length;

      const length = thread.activeChapters.length;
      totalLength += length;

      if (!longestThread || length > longestThread.chapters) {
        longestThread = { id: thread.id, name: thread.name, chapters: length };
      }
    }

    return {
      totalThreads: threads.length,
      byType,
      byStatus,
      byPriority,
      activeThreads: this.getActiveThreads().length,
      resolvedThreads: this.getThreadsByStatus(ThreadStatus.RESOLVED).length,
      avgProgressPercentage: threads.length > 0 ? totalProgress / threads.length : 0,
      totalMilestones,
      milestonesReached,
      avgThreadLength: threads.length > 0 ? totalLength / threads.length : 0,
      longestThread
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
      threads: Array.from(this.threads.values()),
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

    if (data.threads) {
      for (const thread of data.threads) {
        thread.createdAt = new Date(thread.createdAt);
        thread.updatedAt = new Date(thread.updatedAt);
        this.storeThread(thread);
      }
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.threads.clear();
    this.threadsByType.clear();
    this.threadsByStatus.clear();
    this.threadsByCharacter.clear();
    this.threadsByChapter.clear();
  }
}

// Default instance
export const plotThreadManager = new PlotThreadManager();

export default PlotThreadManager;
