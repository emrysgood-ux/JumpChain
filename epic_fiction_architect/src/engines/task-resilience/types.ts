/**
 * Task Resilience System - Types & Interfaces
 *
 * Provides infrastructure for AI-assisted tasks to survive connection issues,
 * timeouts, and failures without losing progress.
 *
 * Design Philosophy:
 * - Tasks are broken into resumable "chunks"
 * - Progress is checkpointed to database after each chunk
 * - Failures trigger retries with exponential backoff
 * - Circuit breakers prevent cascade failures
 * - Graceful degradation when things go wrong
 */

// ============================================================================
// Core Task Types
// ============================================================================

export type TaskStatus =
  | 'pending'      // Queued, not started
  | 'in_progress'  // Currently executing
  | 'checkpointed' // Paused with saved state
  | 'completed'    // Successfully finished
  | 'failed'       // Permanently failed (max retries exceeded)
  | 'retrying'     // Failed, waiting for retry
  | 'cancelled';   // User/system cancelled

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low' | 'background';

export interface TaskDefinition<TInput = unknown, TOutput = unknown, TCheckpoint = unknown> {
  /** Unique task type identifier */
  type: string;

  /** Human-readable description */
  description: string;

  /** Whether this task can be broken into chunks */
  chunkable: boolean;

  /** Estimated chunks (for progress tracking) */
  estimateChunks?: (input: TInput) => number;

  /** Execute one chunk of work */
  executeChunk: (
    input: TInput,
    checkpoint: TCheckpoint | null,
    context: TaskExecutionContext
  ) => Promise<ChunkResult<TOutput, TCheckpoint>>;

  /** Validate checkpoint before resuming */
  validateCheckpoint?: (checkpoint: TCheckpoint) => boolean;

  /** Clean up on failure */
  onFailure?: (input: TInput, checkpoint: TCheckpoint | null, error: Error) => Promise<void>;

  /** Clean up on success */
  onSuccess?: (input: TInput, output: TOutput) => Promise<void>;
}

export interface ChunkResult<TOutput = unknown, TCheckpoint = unknown> {
  /** Is the task complete? */
  done: boolean;

  /** Final output (only when done=true) */
  output?: TOutput;

  /** Checkpoint for resumption (when done=false) */
  checkpoint?: TCheckpoint;

  /** Progress indicator (0-1) */
  progress?: number;

  /** Human-readable status message */
  message?: string;

  /** Chunks completed so far */
  chunksCompleted?: number;

  /** Estimated total chunks */
  chunksTotal?: number;
}

export interface TaskExecutionContext {
  /** Current task instance ID */
  taskId: string;

  /** Attempt number (1-based) */
  attemptNumber: number;

  /** Time remaining before timeout (ms) */
  timeRemaining: number;

  /** Request graceful shutdown */
  shouldAbort: () => boolean;

  /** Log progress */
  log: (message: string, level?: 'debug' | 'info' | 'warn' | 'error') => void;

  /** Report progress (0-1) */
  reportProgress: (progress: number, message?: string) => void;

  /** Save intermediate checkpoint */
  saveCheckpoint: <T>(checkpoint: T) => Promise<void>;
}

// ============================================================================
// Task Instance (persisted)
// ============================================================================

export interface TaskInstance {
  /** Unique instance ID */
  id: string;

  /** Task type (matches TaskDefinition.type) */
  type: string;

  /** Current status */
  status: TaskStatus;

  /** Priority level */
  priority: TaskPriority;

  /** Input data (JSON serialized) */
  input: string;

  /** Current checkpoint (JSON serialized) */
  checkpoint: string | null;

  /** Final output (JSON serialized, only when completed) */
  output: string | null;

  /** Error message if failed */
  errorMessage: string | null;

  /** Error stack trace */
  errorStack: string | null;

  /** Number of attempts made */
  attemptCount: number;

  /** Max allowed attempts */
  maxAttempts: number;

  /** When task was created */
  createdAt: Date;

  /** When task was last updated */
  updatedAt: Date;

  /** When task started executing */
  startedAt: Date | null;

  /** When task completed/failed */
  completedAt: Date | null;

  /** When to retry (if status=retrying) */
  retryAt: Date | null;

  /** Progress (0-1) */
  progress: number;

  /** Last status message */
  statusMessage: string | null;

  /** Parent task ID (for subtasks) */
  parentTaskId: string | null;

  /** Tags for filtering */
  tags: string[];

  /** Timeout per attempt (ms) */
  timeoutMs: number;

  /** Project context */
  projectId: string | null;
}

// ============================================================================
// Retry Configuration
// ============================================================================

export interface RetryConfig {
  /** Max retry attempts */
  maxAttempts: number;

  /** Base delay between retries (ms) */
  baseDelayMs: number;

  /** Maximum delay between retries (ms) */
  maxDelayMs: number;

  /** Exponential backoff multiplier */
  backoffMultiplier: number;

  /** Add jitter to prevent thundering herd */
  jitterFactor: number;

  /** Errors that should not trigger retry */
  nonRetryableErrors?: string[];

  /** Only retry on these errors (if specified) */
  retryableErrors?: string[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  baseDelayMs: 2000,
  maxDelayMs: 60000,
  backoffMultiplier: 2,
  jitterFactor: 0.2,
  nonRetryableErrors: [
    'INVALID_INPUT',
    'UNAUTHORIZED',
    'NOT_FOUND',
    'VALIDATION_ERROR'
  ]
};

// ============================================================================
// Circuit Breaker
// ============================================================================

export type CircuitState = 'closed' | 'open' | 'half_open';

export interface CircuitBreakerConfig {
  /** Failures before opening circuit */
  failureThreshold: number;

  /** Time to wait before trying half-open (ms) */
  resetTimeoutMs: number;

  /** Successes in half-open to close circuit */
  successThreshold: number;

  /** Sliding window for failure counting (ms) */
  windowMs: number;
}

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 30000,
  successThreshold: 2,
  windowMs: 60000
};

export interface CircuitBreakerState {
  /** Current circuit state */
  state: CircuitState;

  /** Failures in current window */
  failureCount: number;

  /** Successes in half-open state */
  halfOpenSuccesses: number;

  /** When circuit was last opened */
  lastFailureAt: Date | null;

  /** When circuit can try half-open */
  nextAttemptAt: Date | null;
}

// ============================================================================
// Task Queue Configuration
// ============================================================================

export interface TaskQueueConfig {
  /** Max concurrent tasks */
  concurrency: number;

  /** Default timeout per task (ms) */
  defaultTimeoutMs: number;

  /** Default retry configuration */
  defaultRetryConfig: RetryConfig;

  /** Circuit breaker configuration */
  circuitBreakerConfig: CircuitBreakerConfig;

  /** How often to poll for new tasks (ms) */
  pollIntervalMs: number;

  /** How often to checkpoint long-running tasks (ms) */
  checkpointIntervalMs: number;

  /** Clean up completed tasks older than (ms) */
  cleanupAfterMs: number;
}

export const DEFAULT_QUEUE_CONFIG: TaskQueueConfig = {
  concurrency: 3,
  defaultTimeoutMs: 120000, // 2 minutes
  defaultRetryConfig: DEFAULT_RETRY_CONFIG,
  circuitBreakerConfig: DEFAULT_CIRCUIT_BREAKER_CONFIG,
  pollIntervalMs: 1000,
  checkpointIntervalMs: 10000, // Checkpoint every 10 seconds
  cleanupAfterMs: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// ============================================================================
// Events
// ============================================================================

export type TaskEvent =
  | { type: 'task_created'; task: TaskInstance }
  | { type: 'task_started'; task: TaskInstance }
  | { type: 'task_progress'; task: TaskInstance; progress: number; message?: string }
  | { type: 'task_checkpointed'; task: TaskInstance }
  | { type: 'task_completed'; task: TaskInstance; output: unknown }
  | { type: 'task_failed'; task: TaskInstance; error: Error; willRetry: boolean }
  | { type: 'task_retrying'; task: TaskInstance; attemptNumber: number; delayMs: number }
  | { type: 'task_cancelled'; task: TaskInstance }
  | { type: 'circuit_opened'; taskType: string }
  | { type: 'circuit_half_open'; taskType: string }
  | { type: 'circuit_closed'; taskType: string };

export type TaskEventHandler = (event: TaskEvent) => void;

// ============================================================================
// Graceful Degradation
// ============================================================================

export interface DegradationStrategy<TInput = unknown, TOutput = unknown> {
  /** Strategy name */
  name: string;

  /** When to use this strategy (e.g., after N failures) */
  condition: (attemptCount: number, lastError?: Error) => boolean;

  /** Execute degraded version */
  execute: (input: TInput) => Promise<TOutput>;
}

// ============================================================================
// Common Checkpoint Types (for specific task types)
// ============================================================================

/** Checkpoint for text generation tasks */
export interface TextGenerationCheckpoint {
  /** Generated content so far */
  generatedText: string;

  /** Tokens used */
  tokensUsed: number;

  /** Current section/chunk index */
  currentSection: number;

  /** Total sections planned */
  totalSections: number;

  /** Outline being followed */
  outline?: string[];

  /** Last prompt sent */
  lastPrompt?: string;
}

/** Checkpoint for batch processing tasks */
export interface BatchProcessingCheckpoint {
  /** Items processed so far */
  processedCount: number;

  /** Total items to process */
  totalCount: number;

  /** IDs of processed items */
  processedIds: string[];

  /** Partial results */
  partialResults: unknown[];

  /** Current batch index */
  currentBatch: number;
}

/** Checkpoint for multi-step pipeline tasks */
export interface PipelineCheckpoint {
  /** Current step index (0-based) */
  currentStep: number;

  /** Step names for reference */
  stepNames: string[];

  /** Outputs from completed steps */
  stepOutputs: Record<string, unknown>;

  /** Any accumulated context */
  context: Record<string, unknown>;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface TaskStats {
  /** Total tasks ever created */
  totalCreated: number;

  /** Currently pending */
  pending: number;

  /** Currently in progress */
  inProgress: number;

  /** Completed successfully */
  completed: number;

  /** Failed permanently */
  failed: number;

  /** Waiting to retry */
  retrying: number;

  /** Average completion time (ms) */
  avgCompletionTimeMs: number;

  /** Success rate (0-1) */
  successRate: number;

  /** By task type */
  byType: Record<string, {
    total: number;
    succeeded: number;
    failed: number;
    avgAttempts: number;
  }>;
}

export interface TaskFilter {
  status?: TaskStatus | TaskStatus[];
  type?: string | string[];
  priority?: TaskPriority | TaskPriority[];
  projectId?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  parentTaskId?: string | null;
}
