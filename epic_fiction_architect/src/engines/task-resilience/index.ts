/**
 * Task Resilience Engine
 *
 * A comprehensive system for making AI-assisted tasks survive connection issues,
 * timeouts, and failures. Designed as a "crutch" for unreliable AI operations.
 *
 * Features:
 * - Checkpoint-based task resumption
 * - Automatic retries with exponential backoff
 * - Circuit breakers to prevent cascade failures
 * - Persistent storage (survives restarts)
 * - Progress tracking and events
 * - Chunkable task patterns for long operations
 *
 * Usage:
 * ```typescript
 * import { TaskResilienceEngine } from './engines/task-resilience';
 *
 * // Create engine
 * const resilience = new TaskResilienceEngine({
 *   dbPath: './data/tasks.db',
 *   concurrency: 3
 * });
 *
 * // Register a task type
 * resilience.registerTask(createSceneWritingTask(myGenerateFn));
 *
 * // Enqueue work
 * const taskId = await resilience.enqueue('scene_writing', {
 *   sceneId: 'scene-123',
 *   outline: ['Hook', 'Rising action', 'Climax'],
 *   // ...
 * });
 *
 * // Monitor progress
 * resilience.on(event => {
 *   if (event.type === 'task_progress') {
 *     console.log(`${event.task.id}: ${event.progress * 100}%`);
 *   }
 * });
 *
 * // Start processing
 * resilience.start();
 * ```
 */

// Export types
export * from './types';

// Export utilities
export * from './retry';
export * from './circuit-breaker';

// Export queue
export * from './task-queue';

// Export storage implementations
export * from './sqlite-storage';

// Export chunkable task patterns
export * from './chunkable-tasks';

import {
  TaskQueue,
  TaskQueueStorage,
  InMemoryTaskStorage,
  waitForTask
} from './task-queue';
import { SQLiteTaskStorage, createSQLiteTaskStorage } from './sqlite-storage';
import {
  TaskDefinition,
  TaskInstance,
  TaskEvent,
  TaskEventHandler,
  TaskQueueConfig,
  TaskPriority,
  DEFAULT_QUEUE_CONFIG
} from './types';
import { CircuitBreakerRegistry } from './circuit-breaker';

/**
 * Configuration for TaskResilienceEngine
 */
export interface TaskResilienceConfig {
  /** Path to SQLite database (or ':memory:' for in-memory) */
  dbPath?: string;

  /** Use in-memory storage (for testing) */
  inMemory?: boolean;

  /** Maximum concurrent tasks */
  concurrency?: number;

  /** Default timeout per task (ms) */
  defaultTimeoutMs?: number;

  /** How often to poll for new tasks (ms) */
  pollIntervalMs?: number;

  /** Auto-start processing on creation */
  autoStart?: boolean;

  /** Recovery: mark stale tasks for retry if older than this (ms) */
  staleTaskRecoveryMs?: number;
}

/**
 * Main Task Resilience Engine
 *
 * High-level interface for task resilience. Wraps TaskQueue with
 * convenient defaults and automatic setup.
 */
export class TaskResilienceEngine {
  private storage: TaskQueueStorage;
  private queue: TaskQueue;
  private config: Required<TaskResilienceConfig>;
  private recoveryInterval: NodeJS.Timeout | null = null;

  constructor(config: TaskResilienceConfig = {}) {
    this.config = {
      dbPath: config.dbPath || './data/task-resilience.db',
      inMemory: config.inMemory || false,
      concurrency: config.concurrency || 3,
      defaultTimeoutMs: config.defaultTimeoutMs || 120000,
      pollIntervalMs: config.pollIntervalMs || 1000,
      autoStart: config.autoStart ?? false,
      staleTaskRecoveryMs: config.staleTaskRecoveryMs || 300000 // 5 minutes
    };

    // Create storage
    if (this.config.inMemory) {
      this.storage = new InMemoryTaskStorage();
    } else {
      this.storage = createSQLiteTaskStorage(this.config.dbPath);
    }

    // Create queue
    const queueConfig: Partial<TaskQueueConfig> = {
      concurrency: this.config.concurrency,
      defaultTimeoutMs: this.config.defaultTimeoutMs,
      pollIntervalMs: this.config.pollIntervalMs
    };

    this.queue = new TaskQueue(this.storage, queueConfig);

    // Auto-start if configured
    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Register a task definition
   */
  registerTask<TInput, TOutput, TCheckpoint>(
    definition: TaskDefinition<TInput, TOutput, TCheckpoint>
  ): this {
    this.queue.registerTask(definition);
    return this;
  }

  /**
   * Enqueue a new task
   */
  async enqueue<TInput>(
    type: string,
    input: TInput,
    options: {
      priority?: TaskPriority;
      tags?: string[];
      projectId?: string;
      parentTaskId?: string;
      maxAttempts?: number;
      timeoutMs?: number;
    } = {}
  ): Promise<string> {
    return this.queue.enqueue(type, input, options);
  }

  /**
   * Get a task by ID
   */
  async getTask(id: string): Promise<TaskInstance | null> {
    return this.queue.getTask(id);
  }

  /**
   * Wait for a task to complete
   */
  async waitForTask(
    taskId: string,
    options?: {
      pollIntervalMs?: number;
      timeoutMs?: number;
      onProgress?: (progress: number, message?: string) => void;
    }
  ): Promise<TaskInstance> {
    return waitForTask(this.queue, taskId, options);
  }

  /**
   * Execute a task and wait for result (convenience method)
   */
  async executeAndWait<TInput, TOutput>(
    type: string,
    input: TInput,
    options: {
      priority?: TaskPriority;
      tags?: string[];
      projectId?: string;
      timeoutMs?: number;
      onProgress?: (progress: number, message?: string) => void;
    } = {}
  ): Promise<{ success: boolean; output?: TOutput; error?: string }> {
    const taskId = await this.enqueue(type, input, options);
    const task = await this.waitForTask(taskId, {
      timeoutMs: options.timeoutMs,
      onProgress: options.onProgress
    });

    if (task.status === 'completed' && task.output) {
      return { success: true, output: JSON.parse(task.output) as TOutput };
    } else {
      return { success: false, error: task.errorMessage || 'Task failed' };
    }
  }

  /**
   * Cancel a task
   */
  async cancel(taskId: string): Promise<boolean> {
    return this.queue.cancel(taskId);
  }

  /**
   * Resume a checkpointed task
   */
  async resume(taskId: string): Promise<boolean> {
    return this.queue.resume(taskId);
  }

  /**
   * Subscribe to task events
   */
  on(handler: TaskEventHandler): () => void {
    return this.queue.on(handler);
  }

  /**
   * Start processing tasks
   */
  start(): void {
    this.queue.start();

    // Start stale task recovery
    if (this.config.staleTaskRecoveryMs > 0 && this.storage instanceof SQLiteTaskStorage) {
      this.recoveryInterval = setInterval(() => {
        const recovered = (this.storage as SQLiteTaskStorage).recoverStaleTasks(
          this.config.staleTaskRecoveryMs
        );
        if (recovered > 0) {
          console.log(`[TaskResilience] Recovered ${recovered} stale tasks`);
        }
      }, 60000); // Check every minute
    }
  }

  /**
   * Stop processing tasks
   */
  async stop(): Promise<void> {
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval);
      this.recoveryInterval = null;
    }
    await this.queue.stop();
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    retrying: number;
    circuitBreakers: Array<{ name: string; state: string }>;
  }> {
    return this.queue.getStats();
  }

  /**
   * Clean up old completed tasks
   */
  async cleanup(): Promise<number> {
    return this.queue.cleanup();
  }

  /**
   * Get detailed storage stats (if using SQLite)
   */
  getDetailedStats(): ReturnType<SQLiteTaskStorage['getStats']> | null {
    if (this.storage instanceof SQLiteTaskStorage) {
      return this.storage.getStats();
    }
    return null;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create a simple one-shot resilient execution
 *
 * For when you just want to run something with retry logic,
 * without setting up the full queue infrastructure.
 */
export async function executeWithResilience<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    onRetry?: (attempt: number, error: Error, delayMs: number) => void;
    timeoutMs?: number;
  } = {}
): Promise<{ success: boolean; result?: T; error?: Error; attempts: number }> {
  const {
    maxAttempts = 5,
    baseDelayMs = 2000,
    maxDelayMs = 30000,
    onRetry,
    timeoutMs
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Add timeout wrapper if specified
      let result: T;
      if (timeoutMs) {
        result = await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeoutMs)
          )
        ]);
      } else {
        result = await fn();
      }

      return { success: true, result, attempts: attempt };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          baseDelayMs * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4),
          maxDelayMs
        );

        if (onRetry) {
          onRetry(attempt, lastError, delay);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return { success: false, error: lastError!, attempts: maxAttempts };
}

/**
 * Wrap an async function to make it resilient
 */
export function makeResilient<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    onRetry?: (attempt: number, error: Error, args: TArgs) => void;
  } = {}
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const result = await executeWithResilience(
      () => fn(...args),
      {
        ...options,
        onRetry: options.onRetry
          ? (attempt, error) => options.onRetry!(attempt, error, args)
          : undefined
      }
    );

    if (result.success) {
      return result.result!;
    }
    throw result.error;
  };
}

/**
 * Default singleton instance for simple use cases
 */
let defaultEngine: TaskResilienceEngine | null = null;

export function getDefaultEngine(): TaskResilienceEngine {
  if (!defaultEngine) {
    defaultEngine = new TaskResilienceEngine({ inMemory: true, autoStart: true });
  }
  return defaultEngine;
}

export function setDefaultEngine(engine: TaskResilienceEngine): void {
  defaultEngine = engine;
}
