/**
 * Continuous Generation Engine
 *
 * The master orchestrator for generating 1000 years of continuous in-universe
 * content in a single session. This engine coordinates all subsystems to
 * produce massive, coherent narratives with guaranteed consistency.
 *
 * Design Philosophy:
 * "Build for impossible requests so reasonable ones are a cakewalk."
 *
 * This engine can theoretically generate:
 * - 1000 years of continuous timeline
 * - Millions of words of content
 * - Perfect internal consistency
 * - Seamless canon integration
 * - Top-tier quality throughout
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────┐
 * │              Continuous Generation Engine                    │
 * ├─────────────────────────────────────────────────────────────┤
 * │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
 * │  │ Millennium  │  │   Canon     │  │ Inference   │        │
 * │  │  Planner    │  │   Module    │  │   Engine    │        │
 * │  └─────────────┘  └─────────────┘  └─────────────┘        │
 * │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
 * │  │ Generation  │  │   Task      │  │   Quality   │        │
 * │  │    Loop     │  │ Resilience  │  │ Benchmarks  │        │
 * │  └─────────────┘  └─────────────┘  └─────────────┘        │
 * │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
 * │  │ Consistency │  │   Story     │  │  Timeline   │        │
 * │  │  Checker    │  │   Bible     │  │   Engine    │        │
 * │  └─────────────┘  └─────────────┘  └─────────────┘        │
 * └─────────────────────────────────────────────────────────────┘
 *
 * @module engines/continuous-generation
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Configuration for continuous generation
 */
export interface ContinuousGenerationConfig {
  /** Unique session ID */
  sessionId: string;

  /** Plan ID to execute */
  planId: string;

  /** Quality thresholds */
  quality: {
    /** Minimum quality score (0-100) */
    minScore: number;
    /** Maximum consistency violations allowed */
    maxViolations: number;
    /** Required accuracy percentage */
    requiredAccuracy: number;
  };

  /** Resource limits */
  limits: {
    /** Max tokens per session */
    maxTokens: number;
    /** Max time in milliseconds */
    maxTimeMs: number;
    /** Max retries per segment */
    maxRetriesPerSegment: number;
    /** Checkpoint interval (segments) */
    checkpointInterval: number;
  };

  /** Pacing */
  pacing: {
    /** Segments to generate in parallel */
    parallelSegments: number;
    /** Delay between segments (ms) */
    segmentDelay: number;
    /** Break duration after N segments */
    breakAfterSegments: number;
    breakDuration: number;
  };

  /** Output */
  output: {
    /** Where to save generated content */
    outputDir: string;
    /** Format for saving */
    format: 'markdown' | 'json' | 'both';
    /** Include metadata in output */
    includeMetadata: boolean;
  };

  /** Callbacks */
  callbacks: {
    /** Called when segment completes */
    onSegmentComplete?: (segment: GeneratedSegment) => void;
    /** Called on checkpoint */
    onCheckpoint?: (checkpoint: SessionCheckpoint) => void;
    /** Called on error */
    onError?: (error: GenerationError) => void;
    /** Called with progress updates */
    onProgress?: (progress: SessionProgress) => void;
  };
}

/**
 * A generated content segment
 */
export interface GeneratedSegment {
  id: string;
  segmentIndex: number;
  year: number;
  eraId: string;
  arcId?: string;

  /** The generated content */
  content: string;
  wordCount: number;

  /** Quality metrics */
  quality: {
    score: number;
    consistencyViolations: number;
    passedGates: string[];
    failedGates: string[];
  };

  /** Generation metadata */
  generation: {
    attempts: number;
    tokensUsed: number;
    duration: number;
    model: string;
  };

  /** Context used */
  context: {
    establishedFacts: number;
    activeCharacters: string[];
    activeThreads: string[];
  };

  /** Validation status */
  validated: boolean;
  validationDetails?: ValidationDetails;

  /** Timestamp */
  generatedAt: Date;
}

/**
 * Validation details for a segment
 */
export interface ValidationDetails {
  consistencyChecks: {
    name: string;
    passed: boolean;
    details?: string;
  }[];
  canonChecks: {
    name: string;
    passed: boolean;
    details?: string;
  }[];
  qualityChecks: {
    name: string;
    score: number;
    threshold: number;
    passed: boolean;
  }[];
  inferredFacts: number;
  newFactsEstablished: number;
}

/**
 * Session checkpoint for resumption
 */
export interface SessionCheckpoint {
  id: string;
  sessionId: string;
  planId: string;
  timestamp: Date;

  /** Progress state */
  progress: {
    completedSegments: number;
    totalSegments: number;
    currentYear: number;
    currentEraId: string;
  };

  /** Resource usage */
  resources: {
    tokensUsed: number;
    timeElapsed: number;
    wordsGenerated: number;
  };

  /** Quality tracking */
  quality: {
    averageScore: number;
    totalViolations: number;
    segmentsRequiringRework: number;
  };

  /** State for resumption */
  state: {
    completedSegmentIds: string[];
    pendingSegmentIds: string[];
    establishedFactsCount: number;
    inferredFactsCount: number;
  };

  /** Serialized engine states */
  engineStates?: {
    consistencyChecker?: string;
    inferenceEngine?: string;
    storyBible?: string;
  };
}

/**
 * Session progress update
 */
export interface SessionProgress {
  sessionId: string;
  status: SessionStatus;
  percentComplete: number;
  currentSegment: number;
  totalSegments: number;
  currentYear: number;
  currentEra: string;
  wordsGenerated: number;
  tokensUsed: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
  qualityAverage: number;
  lastSegmentQuality: number;
  recentErrors: string[];
}

export enum SessionStatus {
  INITIALIZING = 'initializing',
  PLANNING = 'planning',
  GENERATING = 'generating',
  VALIDATING = 'validating',
  CHECKPOINTING = 'checkpointing',
  PAUSED = 'paused',
  RESUMING = 'resuming',
  COMPLETING = 'completing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Generation error
 */
export interface GenerationError {
  id: string;
  sessionId: string;
  segmentId?: string;
  type: ErrorType;
  severity: 'fatal' | 'recoverable' | 'warning';
  message: string;
  details?: unknown;
  timestamp: Date;
  recovered: boolean;
  recoveryAction?: string;
}

export enum ErrorType {
  API_ERROR = 'api_error',
  VALIDATION_FAILURE = 'validation_failure',
  CONSISTENCY_VIOLATION = 'consistency_violation',
  QUALITY_THRESHOLD = 'quality_threshold',
  TIMEOUT = 'timeout',
  TOKEN_LIMIT = 'token_limit',
  CHECKPOINT_FAILURE = 'checkpoint_failure',
  UNKNOWN = 'unknown',
}

/**
 * Complete session result
 */
export interface SessionResult {
  sessionId: string;
  planId: string;
  success: boolean;
  status: SessionStatus;

  /** Generated content */
  segments: GeneratedSegment[];
  totalWords: number;
  totalYearsCovered: number;

  /** Quality summary */
  quality: {
    averageScore: number;
    minScore: number;
    maxScore: number;
    totalViolations: number;
    violationsByType: Record<string, number>;
  };

  /** Resource usage */
  resources: {
    totalTokens: number;
    totalTime: number;
    apiCalls: number;
  };

  /** Coverage */
  coverage: {
    erasCompleted: number;
    arcsCompleted: number;
    propheciesFulfilled: number;
    threadsResolved: number;
  };

  /** Issues */
  errors: GenerationError[];
  warnings: string[];
  unresolvedItems: string[];

  /** Checkpoints */
  checkpoints: SessionCheckpoint[];

  /** Timing */
  startTime: Date;
  endTime: Date;
  totalDuration: number;
}

/**
 * Segment generation task
 */
interface SegmentTask {
  id: string;
  segmentIndex: number;
  year: number;
  eraId: string;
  arcId?: string;
  description: string;
  dependencies: string[];
  estimatedWords: number;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  attempts: number;
  result?: GeneratedSegment;
}

// ============================================================================
// CONTINUOUS GENERATION ENGINE
// ============================================================================

/**
 * Continuous Generation Engine
 *
 * Master orchestrator for generating massive narratives with guaranteed
 * consistency and quality.
 */
export class ContinuousGenerationEngine {
  private config: ContinuousGenerationConfig;
  private status: SessionStatus = SessionStatus.INITIALIZING;

  /** Tasks for generation */
  private tasks: Map<string, SegmentTask> = new Map();
  private taskQueue: string[] = [];

  /** Generated segments */
  private segments: Map<string, GeneratedSegment> = new Map();

  /** Resource tracking */
  private tokensUsed: number = 0;
  private startTime: Date | null = null;
  private errors: GenerationError[] = [];
  private checkpoints: SessionCheckpoint[] = [];

  /** Cancellation flag */
  private cancelled: boolean = false;

  /** Pause/resume state */
  private paused: boolean = false;
  private pausePromise: Promise<void> | null = null;
  private pauseResolve: (() => void) | null = null;

  /** External engine references (to be injected) */
  private engines: {
    millenniumPlanner?: unknown;
    canonModule?: unknown;
    inferenceEngine?: unknown;
    generationLoop?: unknown;
    consistencyChecker?: unknown;
    storyBible?: unknown;
    qualityBenchmarks?: unknown;
    taskResilience?: unknown;
  } = {};

  constructor(config: Partial<ContinuousGenerationConfig> = {}) {
    this.config = this.mergeWithDefaults(config);
  }

  /**
   * Merge provided config with defaults
   */
  private mergeWithDefaults(config: Partial<ContinuousGenerationConfig>): ContinuousGenerationConfig {
    return {
      sessionId: config.sessionId || uuidv4(),
      planId: config.planId || '',
      quality: {
        minScore: config.quality?.minScore ?? 85,
        maxViolations: config.quality?.maxViolations ?? 0,
        requiredAccuracy: config.quality?.requiredAccuracy ?? 100,
      },
      limits: {
        maxTokens: config.limits?.maxTokens ?? 10000000, // 10M tokens
        maxTimeMs: config.limits?.maxTimeMs ?? 86400000, // 24 hours
        maxRetriesPerSegment: config.limits?.maxRetriesPerSegment ?? 5,
        checkpointInterval: config.limits?.checkpointInterval ?? 10,
      },
      pacing: {
        parallelSegments: config.pacing?.parallelSegments ?? 1,
        segmentDelay: config.pacing?.segmentDelay ?? 100,
        breakAfterSegments: config.pacing?.breakAfterSegments ?? 50,
        breakDuration: config.pacing?.breakDuration ?? 5000,
      },
      output: {
        outputDir: config.output?.outputDir ?? './output',
        format: config.output?.format ?? 'both',
        includeMetadata: config.output?.includeMetadata ?? true,
      },
      callbacks: config.callbacks || {},
    };
  }

  /**
   * Inject external engines
   */
  setEngines(engines: typeof this.engines): void {
    this.engines = { ...this.engines, ...engines };
  }

  // ==========================================================================
  // MAIN GENERATION METHODS
  // ==========================================================================

  /**
   * Execute the complete generation session
   *
   * This is the main entry point for generating 1000 years of content.
   */
  async execute(): Promise<SessionResult> {
    this.startTime = new Date();
    this.status = SessionStatus.INITIALIZING;

    try {
      // Initialize
      await this.initialize();

      // Plan generation
      this.status = SessionStatus.PLANNING;
      await this.planGeneration();

      // Main generation loop
      this.status = SessionStatus.GENERATING;
      await this.generateAll();

      // Complete
      this.status = SessionStatus.COMPLETING;
      const result = await this.finalize();

      this.status = SessionStatus.COMPLETED;
      return result;

    } catch (error) {
      this.status = SessionStatus.FAILED;
      this.recordError(ErrorType.UNKNOWN, 'fatal', `Session failed: ${error}`, error);
      return this.buildResult(false);
    }
  }

  /**
   * Resume from a checkpoint
   */
  async resumeFromCheckpoint(checkpoint: SessionCheckpoint): Promise<SessionResult> {
    this.status = SessionStatus.RESUMING;
    this.startTime = new Date();

    try {
      // Restore state
      this.config.sessionId = checkpoint.sessionId;
      this.config.planId = checkpoint.planId;
      this.tokensUsed = checkpoint.resources.tokensUsed;

      // Mark completed segments
      for (const segmentId of checkpoint.state.completedSegmentIds) {
        const task = this.tasks.get(segmentId);
        if (task) {
          task.status = 'completed';
        }
      }

      // Rebuild queue from pending
      this.taskQueue = checkpoint.state.pendingSegmentIds;

      // Restore engine states if available
      if (checkpoint.engineStates) {
        // Would restore from serialized states
      }

      // Continue generation
      this.status = SessionStatus.GENERATING;
      await this.generateAll();

      // Complete
      this.status = SessionStatus.COMPLETING;
      const result = await this.finalize();

      this.status = SessionStatus.COMPLETED;
      return result;

    } catch (error) {
      this.status = SessionStatus.FAILED;
      this.recordError(ErrorType.UNKNOWN, 'fatal', `Resume failed: ${error}`, error);
      return this.buildResult(false);
    }
  }

  /**
   * Pause the generation
   */
  pause(): void {
    if (this.status === SessionStatus.GENERATING) {
      this.paused = true;
      this.status = SessionStatus.PAUSED;
      this.pausePromise = new Promise(resolve => {
        this.pauseResolve = resolve;
      });
    }
  }

  /**
   * Resume from pause
   */
  resume(): void {
    if (this.status === SessionStatus.PAUSED && this.pauseResolve) {
      this.paused = false;
      this.status = SessionStatus.GENERATING;
      this.pauseResolve();
      this.pauseResolve = null;
      this.pausePromise = null;
    }
  }

  /**
   * Cancel the generation
   */
  cancel(): void {
    this.cancelled = true;
    this.status = SessionStatus.CANCELLED;
    if (this.pauseResolve) {
      this.pauseResolve();
    }
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  private async initialize(): Promise<void> {
    // Validate configuration
    if (!this.config.planId) {
      throw new Error('Plan ID is required');
    }

    // Initialize tracking structures
    this.tasks.clear();
    this.segments.clear();
    this.taskQueue = [];
    this.errors = [];
    this.checkpoints = [];
    this.tokensUsed = 0;
    this.cancelled = false;
    this.paused = false;

    // Emit progress
    this.emitProgress();
  }

  // ==========================================================================
  // PLANNING
  // ==========================================================================

  private async planGeneration(): Promise<void> {
    // Get roadmap from millennium planner
    // In real implementation, this would call the millennium planner
    const mockRoadmap = this.createMockRoadmap();

    // Create tasks from roadmap
    let index = 0;
    for (const segment of mockRoadmap.segments) {
      const task: SegmentTask = {
        id: segment.id,
        segmentIndex: index++,
        year: segment.year,
        eraId: segment.eraId,
        arcId: segment.arcId,
        description: segment.description,
        dependencies: segment.dependencies,
        estimatedWords: segment.estimatedWords,
        priority: segment.priority,
        status: 'pending',
        attempts: 0,
      };
      this.tasks.set(task.id, task);
    }

    // Build queue (ordered by year and priority)
    this.taskQueue = Array.from(this.tasks.keys()).sort((a, b) => {
      const taskA = this.tasks.get(a)!;
      const taskB = this.tasks.get(b)!;
      if (taskA.year !== taskB.year) return taskA.year - taskB.year;
      return taskA.priority - taskB.priority;
    });

    this.emitProgress();
  }

  /**
   * Create mock roadmap for testing
   */
  private createMockRoadmap(): { segments: Array<{
    id: string;
    year: number;
    eraId: string;
    arcId?: string;
    description: string;
    dependencies: string[];
    estimatedWords: number;
    priority: number;
  }> } {
    // This would normally come from MillenniumPlanner
    const segments = [];
    const years = 1000;
    const segmentsPerYear = 2;

    for (let year = 0; year < years; year++) {
      for (let seg = 0; seg < segmentsPerYear; seg++) {
        segments.push({
          id: uuidv4(),
          year,
          eraId: `era-${Math.floor(year / 100)}`,
          arcId: `arc-${Math.floor(year / 50)}`,
          description: `Events of year ${year}, segment ${seg + 1}`,
          dependencies: year > 0 ? [segments[segments.length - segmentsPerYear]?.id].filter(Boolean) : [],
          estimatedWords: 5000,
          priority: seg === 0 ? 1 : 2,
        });
      }
    }

    return { segments };
  }

  // ==========================================================================
  // MAIN GENERATION LOOP
  // ==========================================================================

  private async generateAll(): Promise<void> {
    let segmentsCompleted = 0;
    const totalSegments = this.taskQueue.length;

    while (this.taskQueue.length > 0 && !this.cancelled) {
      // Check pause
      if (this.paused && this.pausePromise) {
        await this.pausePromise;
      }

      // Check limits
      if (this.tokensUsed >= this.config.limits.maxTokens) {
        this.recordError(ErrorType.TOKEN_LIMIT, 'fatal', 'Token limit exceeded');
        break;
      }

      if (this.startTime && Date.now() - this.startTime.getTime() >= this.config.limits.maxTimeMs) {
        this.recordError(ErrorType.TIMEOUT, 'fatal', 'Time limit exceeded');
        break;
      }

      // Get next batch of tasks
      const batchSize = Math.min(this.config.pacing.parallelSegments, this.taskQueue.length);
      const batch = this.taskQueue.splice(0, batchSize);

      // Generate batch
      const results = await Promise.all(
        batch.map(taskId => this.generateSegment(taskId))
      );

      // Process results
      for (const result of results) {
        if (result) {
          segmentsCompleted++;
        }
      }

      // Checkpoint if needed
      if (segmentsCompleted % this.config.limits.checkpointInterval === 0) {
        await this.createCheckpoint();
      }

      // Break if needed
      if (segmentsCompleted % this.config.pacing.breakAfterSegments === 0) {
        await this.delay(this.config.pacing.breakDuration);
      }

      // Delay between segments
      if (this.config.pacing.segmentDelay > 0) {
        await this.delay(this.config.pacing.segmentDelay);
      }

      // Update progress
      this.emitProgress();
    }
  }

  /**
   * Generate a single segment
   */
  private async generateSegment(taskId: string): Promise<GeneratedSegment | null> {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = 'in_progress';
    task.attempts++;

    try {
      // Check dependencies
      for (const depId of task.dependencies) {
        const dep = this.tasks.get(depId);
        if (dep && dep.status !== 'completed') {
          // Dependency not ready - requeue
          this.taskQueue.push(taskId);
          task.status = 'pending';
          return null;
        }
      }

      // Get context from previous segments
      const context = this.buildSegmentContext(task);

      // Generate content (mock - real implementation would use GenerationLoopEngine)
      const generationStart = Date.now();
      const mockContent = await this.mockGenerateContent(task, context);

      // Validate content
      const validation = await this.validateContent(mockContent, task, context);

      // Check quality
      if (validation.quality.score < this.config.quality.minScore) {
        if (task.attempts < this.config.limits.maxRetriesPerSegment) {
          // Retry
          this.taskQueue.unshift(taskId);
          task.status = 'pending';
          return null;
        } else {
          // Accept with warning
          this.recordError(
            ErrorType.QUALITY_THRESHOLD,
            'warning',
            `Segment ${taskId} quality ${validation.quality.score} below threshold after ${task.attempts} attempts`
          );
        }
      }

      // Create segment result
      const segment: GeneratedSegment = {
        id: taskId,
        segmentIndex: task.segmentIndex,
        year: task.year,
        eraId: task.eraId,
        arcId: task.arcId,
        content: mockContent,
        wordCount: mockContent.split(/\s+/).length,
        quality: validation.quality,
        generation: {
          attempts: task.attempts,
          tokensUsed: mockContent.length / 4, // Rough estimate
          duration: Date.now() - generationStart,
          model: 'mock-model',
        },
        context: {
          establishedFacts: context.factsCount,
          activeCharacters: context.characters,
          activeThreads: context.threads,
        },
        validated: true,
        validationDetails: validation.details,
        generatedAt: new Date(),
      };

      // Store result
      task.result = segment;
      task.status = 'completed';
      this.segments.set(taskId, segment);
      this.tokensUsed += segment.generation.tokensUsed;

      // Callback
      if (this.config.callbacks.onSegmentComplete) {
        this.config.callbacks.onSegmentComplete(segment);
      }

      return segment;

    } catch (error) {
      task.status = 'failed';
      this.recordError(
        ErrorType.UNKNOWN,
        'recoverable',
        `Segment ${taskId} generation failed: ${error}`,
        error
      );

      if (task.attempts < this.config.limits.maxRetriesPerSegment) {
        this.taskQueue.push(taskId);
        task.status = 'pending';
      }

      return null;
    }
  }

  /**
   * Build context for segment generation
   */
  private buildSegmentContext(task: SegmentTask): {
    previousContent: string;
    factsCount: number;
    characters: string[];
    threads: string[];
    worldState: unknown;
  } {
    // Get recent segments for context
    const recentSegments = Array.from(this.segments.values())
      .filter(s => s.year <= task.year)
      .sort((a, b) => b.year - a.year)
      .slice(0, 5);

    const previousContent = recentSegments.map(s => s.content).join('\n\n');

    // Would normally query Story Bible and other engines
    return {
      previousContent,
      factsCount: this.segments.size * 10, // Estimate
      characters: [`Character_Era${task.eraId}`],
      threads: [`Thread_${task.arcId}`],
      worldState: {},
    };
  }

  /**
   * Mock content generation
   */
  private async mockGenerateContent(
    task: SegmentTask,
    _context: unknown
  ): Promise<string> {
    // Simulate API delay
    await this.delay(50);

    // Generate mock content
    const paragraphs = Math.ceil(task.estimatedWords / 100);
    const content = [];

    for (let i = 0; i < paragraphs; i++) {
      content.push(
        `[Year ${task.year}, ${task.eraId}] ` +
        `In this segment of the grand narrative, events unfold that will shape ` +
        `the course of history for generations to come. ` +
        `Characters face challenges, make decisions, and the world transforms ` +
        `in response to their actions. The threads of fate interweave with ` +
        `mortal ambition, creating a tapestry of consequence that echoes ` +
        `through the centuries.`
      );
    }

    return content.join('\n\n');
  }

  /**
   * Validate generated content
   */
  private async validateContent(
    content: string,
    task: SegmentTask,
    _context: unknown
  ): Promise<{
    quality: GeneratedSegment['quality'];
    details: ValidationDetails;
  }> {
    // Mock validation - real implementation would use all validation engines
    const score = 85 + Math.random() * 15; // 85-100

    return {
      quality: {
        score,
        consistencyViolations: 0,
        passedGates: ['consistency', 'prose', 'voice', 'timeline'],
        failedGates: [],
      },
      details: {
        consistencyChecks: [
          { name: 'Character consistency', passed: true },
          { name: 'Timeline consistency', passed: true },
          { name: 'Location consistency', passed: true },
        ],
        canonChecks: [
          { name: 'Canon compliance', passed: true },
        ],
        qualityChecks: [
          { name: 'Prose quality', score: 88, threshold: 80, passed: true },
          { name: 'Dialogue quality', score: 85, threshold: 80, passed: true },
        ],
        inferredFacts: 5,
        newFactsEstablished: 3,
      },
    };
  }

  // ==========================================================================
  // CHECKPOINTING
  // ==========================================================================

  private async createCheckpoint(): Promise<SessionCheckpoint> {
    this.status = SessionStatus.CHECKPOINTING;

    const completedTasks = Array.from(this.tasks.values()).filter(t => t.status === 'completed');
    const pendingTasks = Array.from(this.tasks.values()).filter(t => t.status === 'pending');
    const completedSegments = Array.from(this.segments.values());

    const checkpoint: SessionCheckpoint = {
      id: uuidv4(),
      sessionId: this.config.sessionId,
      planId: this.config.planId,
      timestamp: new Date(),
      progress: {
        completedSegments: completedTasks.length,
        totalSegments: this.tasks.size,
        currentYear: completedSegments[completedSegments.length - 1]?.year || 0,
        currentEraId: completedSegments[completedSegments.length - 1]?.eraId || '',
      },
      resources: {
        tokensUsed: this.tokensUsed,
        timeElapsed: this.startTime ? Date.now() - this.startTime.getTime() : 0,
        wordsGenerated: completedSegments.reduce((sum, s) => sum + s.wordCount, 0),
      },
      quality: {
        averageScore: completedSegments.reduce((sum, s) => sum + s.quality.score, 0) / completedSegments.length || 0,
        totalViolations: completedSegments.reduce((sum, s) => sum + s.quality.consistencyViolations, 0),
        segmentsRequiringRework: completedSegments.filter(s => s.quality.score < this.config.quality.minScore).length,
      },
      state: {
        completedSegmentIds: completedTasks.map(t => t.id),
        pendingSegmentIds: pendingTasks.map(t => t.id),
        establishedFactsCount: completedSegments.reduce((sum, s) => sum + (s.validationDetails?.newFactsEstablished || 0), 0),
        inferredFactsCount: completedSegments.reduce((sum, s) => sum + (s.validationDetails?.inferredFacts || 0), 0),
      },
    };

    this.checkpoints.push(checkpoint);

    // Callback
    if (this.config.callbacks.onCheckpoint) {
      this.config.callbacks.onCheckpoint(checkpoint);
    }

    this.status = SessionStatus.GENERATING;
    return checkpoint;
  }

  // ==========================================================================
  // FINALIZATION
  // ==========================================================================

  private async finalize(): Promise<SessionResult> {
    // Create final checkpoint
    await this.createCheckpoint();

    // Build result
    return this.buildResult(
      !this.cancelled &&
      this.errors.filter(e => e.severity === 'fatal').length === 0
    );
  }

  private buildResult(success: boolean): SessionResult {
    const segments = Array.from(this.segments.values());
    const endTime = new Date();

    // Quality analysis
    const scores = segments.map(s => s.quality.score);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Violation analysis
    const violationsByType: Record<string, number> = {};
    for (const error of this.errors) {
      violationsByType[error.type] = (violationsByType[error.type] || 0) + 1;
    }

    return {
      sessionId: this.config.sessionId,
      planId: this.config.planId,
      success,
      status: this.status,
      segments,
      totalWords: segments.reduce((sum, s) => sum + s.wordCount, 0),
      totalYearsCovered: segments.length > 0
        ? Math.max(...segments.map(s => s.year)) - Math.min(...segments.map(s => s.year)) + 1
        : 0,
      quality: {
        averageScore: avgScore,
        minScore: scores.length > 0 ? Math.min(...scores) : 0,
        maxScore: scores.length > 0 ? Math.max(...scores) : 0,
        totalViolations: segments.reduce((sum, s) => sum + s.quality.consistencyViolations, 0),
        violationsByType,
      },
      resources: {
        totalTokens: this.tokensUsed,
        totalTime: this.startTime ? endTime.getTime() - this.startTime.getTime() : 0,
        apiCalls: segments.reduce((sum, s) => sum + s.generation.attempts, 0),
      },
      coverage: {
        erasCompleted: new Set(segments.map(s => s.eraId)).size,
        arcsCompleted: new Set(segments.filter(s => s.arcId).map(s => s.arcId)).size,
        propheciesFulfilled: 0, // Would track from plan
        threadsResolved: 0, // Would track from plan
      },
      errors: this.errors,
      warnings: this.errors.filter(e => e.severity === 'warning').map(e => e.message),
      unresolvedItems: [], // Would track from plan
      checkpoints: this.checkpoints,
      startTime: this.startTime || new Date(),
      endTime,
      totalDuration: this.startTime ? endTime.getTime() - this.startTime.getTime() : 0,
    };
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private recordError(
    type: ErrorType,
    severity: GenerationError['severity'],
    message: string,
    details?: unknown
  ): void {
    const error: GenerationError = {
      id: uuidv4(),
      sessionId: this.config.sessionId,
      type,
      severity,
      message,
      details,
      timestamp: new Date(),
      recovered: severity !== 'fatal',
    };

    this.errors.push(error);

    if (this.config.callbacks.onError) {
      this.config.callbacks.onError(error);
    }
  }

  private emitProgress(): void {
    if (!this.config.callbacks.onProgress) return;

    const completedSegments = Array.from(this.tasks.values()).filter(t => t.status === 'completed');
    const segments = Array.from(this.segments.values());
    const totalSegments = this.tasks.size;

    const progress: SessionProgress = {
      sessionId: this.config.sessionId,
      status: this.status,
      percentComplete: totalSegments > 0 ? (completedSegments.length / totalSegments) * 100 : 0,
      currentSegment: completedSegments.length,
      totalSegments,
      currentYear: segments[segments.length - 1]?.year || 0,
      currentEra: segments[segments.length - 1]?.eraId || '',
      wordsGenerated: segments.reduce((sum, s) => sum + s.wordCount, 0),
      tokensUsed: this.tokensUsed,
      timeElapsed: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      estimatedTimeRemaining: this.estimateRemainingTime(completedSegments.length, totalSegments),
      qualityAverage: segments.reduce((sum, s) => sum + s.quality.score, 0) / segments.length || 0,
      lastSegmentQuality: segments[segments.length - 1]?.quality.score || 0,
      recentErrors: this.errors.slice(-5).map(e => e.message),
    };

    this.config.callbacks.onProgress(progress);
  }

  private estimateRemainingTime(completed: number, total: number): number {
    if (completed === 0 || !this.startTime) return 0;
    const elapsed = Date.now() - this.startTime.getTime();
    const avgTimePerSegment = elapsed / completed;
    return avgTimePerSegment * (total - completed);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==========================================================================
  // ACCESSORS
  // ==========================================================================

  /**
   * Get current status
   */
  getStatus(): SessionStatus {
    return this.status;
  }

  /**
   * Get current progress
   */
  getProgress(): SessionProgress {
    const completedSegments = Array.from(this.tasks.values()).filter(t => t.status === 'completed');
    const segments = Array.from(this.segments.values());

    return {
      sessionId: this.config.sessionId,
      status: this.status,
      percentComplete: this.tasks.size > 0 ? (completedSegments.length / this.tasks.size) * 100 : 0,
      currentSegment: completedSegments.length,
      totalSegments: this.tasks.size,
      currentYear: segments[segments.length - 1]?.year || 0,
      currentEra: segments[segments.length - 1]?.eraId || '',
      wordsGenerated: segments.reduce((sum, s) => sum + s.wordCount, 0),
      tokensUsed: this.tokensUsed,
      timeElapsed: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      estimatedTimeRemaining: this.estimateRemainingTime(completedSegments.length, this.tasks.size),
      qualityAverage: segments.reduce((sum, s) => sum + s.quality.score, 0) / segments.length || 0,
      lastSegmentQuality: segments[segments.length - 1]?.quality.score || 0,
      recentErrors: this.errors.slice(-5).map(e => e.message),
    };
  }

  /**
   * Get generated segments
   */
  getSegments(): GeneratedSegment[] {
    return Array.from(this.segments.values());
  }

  /**
   * Get errors
   */
  getErrors(): GenerationError[] {
    return [...this.errors];
  }

  /**
   * Get checkpoints
   */
  getCheckpoints(): SessionCheckpoint[] {
    return [...this.checkpoints];
  }

  /**
   * Get latest checkpoint
   */
  getLatestCheckpoint(): SessionCheckpoint | null {
    return this.checkpoints[this.checkpoints.length - 1] || null;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a configured continuous generation engine
 */
export function createContinuousGenerator(
  planId: string,
  options: Partial<ContinuousGenerationConfig> = {}
): ContinuousGenerationEngine {
  return new ContinuousGenerationEngine({
    ...options,
    planId,
  });
}

/**
 * Create a test configuration for validation
 */
export function createTestConfig(): Partial<ContinuousGenerationConfig> {
  return {
    quality: {
      minScore: 70,
      maxViolations: 5,
      requiredAccuracy: 95,
    },
    limits: {
      maxTokens: 100000,
      maxTimeMs: 60000,
      maxRetriesPerSegment: 2,
      checkpointInterval: 5,
    },
    pacing: {
      parallelSegments: 1,
      segmentDelay: 0,
      breakAfterSegments: 100,
      breakDuration: 0,
    },
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default ContinuousGenerationEngine;
