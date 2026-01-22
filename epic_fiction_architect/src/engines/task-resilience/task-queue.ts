/**
 * Task Queue with Checkpoint Support
 *
 * Manages task execution with:
 * - Persistent storage (survives restarts)
 * - Checkpoint-based resumption
 * - Priority ordering
 * - Concurrency limits
 * - Automatic retries
 */

import { v4 as uuidv4 } from 'uuid';
import {
  TaskInstance,
  TaskStatus,
  TaskPriority,
  TaskDefinition,
  TaskExecutionContext,
  ChunkResult,
  TaskQueueConfig,
  TaskFilter,
  TaskEvent,
  TaskEventHandler,
  RetryConfig,
  DEFAULT_QUEUE_CONFIG,
  DEFAULT_RETRY_CONFIG
} from './types';
import { CircuitBreaker, CircuitBreakerRegistry } from './circuit-breaker';
import { calculateRetryDelay, shouldRetry } from './retry';

// Priority ordering (lower number = higher priority)
const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
  background: 4
};

export interface TaskQueueStorage {
  // CRUD operations
  save(task: TaskInstance): Promise<void>;
  get(id: string): Promise<TaskInstance | null>;
  delete(id: string): Promise<void>;

  // Queries
  findByStatus(statuses: TaskStatus[]): Promise<TaskInstance[]>;
  findByFilter(filter: TaskFilter): Promise<TaskInstance[]>;
  findRetryable(now: Date): Promise<TaskInstance[]>;

  // Bulk operations
  updateStatus(id: string, status: TaskStatus, updates?: Partial<TaskInstance>): Promise<void>;
  cleanup(olderThan: Date): Promise<number>;
}

/**
 * In-memory storage for development/testing
 */
export class InMemoryTaskStorage implements TaskQueueStorage {
  private tasks = new Map<string, TaskInstance>();

  async save(task: TaskInstance): Promise<void> {
    this.tasks.set(task.id, { ...task });
  }

  async get(id: string): Promise<TaskInstance | null> {
    const task = this.tasks.get(id);
    return task ? { ...task } : null;
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  async findByStatus(statuses: TaskStatus[]): Promise<TaskInstance[]> {
    return Array.from(this.tasks.values())
      .filter(t => statuses.includes(t.status))
      .sort((a, b) => {
        // Sort by priority, then by creation time
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  async findByFilter(filter: TaskFilter): Promise<TaskInstance[]> {
    return Array.from(this.tasks.values()).filter(task => {
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statuses.includes(task.status)) return false;
      }
      if (filter.type) {
        const types = Array.isArray(filter.type) ? filter.type : [filter.type];
        if (!types.includes(task.type)) return false;
      }
      if (filter.priority) {
        const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
        if (!priorities.includes(task.priority)) return false;
      }
      if (filter.projectId && task.projectId !== filter.projectId) return false;
      if (filter.tags?.length && !filter.tags.some(t => task.tags.includes(t))) return false;
      if (filter.createdAfter && task.createdAt < filter.createdAfter) return false;
      if (filter.createdBefore && task.createdAt > filter.createdBefore) return false;
      if (filter.parentTaskId !== undefined && task.parentTaskId !== filter.parentTaskId) return false;
      return true;
    });
  }

  async findRetryable(now: Date): Promise<TaskInstance[]> {
    return Array.from(this.tasks.values())
      .filter(t => t.status === 'retrying' && t.retryAt && t.retryAt <= now)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }

  async updateStatus(id: string, status: TaskStatus, updates?: Partial<TaskInstance>): Promise<void> {
    const task = this.tasks.get(id);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
      if (updates) {
        Object.assign(task, updates);
      }
    }
  }

  async cleanup(olderThan: Date): Promise<number> {
    let count = 0;
    for (const [id, task] of this.tasks) {
      if (task.completedAt && task.completedAt < olderThan) {
        this.tasks.delete(id);
        count++;
      }
    }
    return count;
  }

  // Utility for debugging
  getAll(): TaskInstance[] {
    return Array.from(this.tasks.values());
  }
}

/**
 * Main Task Queue
 */
export class TaskQueue {
  private storage: TaskQueueStorage;
  private config: TaskQueueConfig;
  private definitions = new Map<string, TaskDefinition>();
  private circuitBreakers: CircuitBreakerRegistry;
  private eventHandlers: TaskEventHandler[] = [];
  private runningTasks = new Map<string, AbortController>();
  private isRunning = false;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(
    storage: TaskQueueStorage,
    config: Partial<TaskQueueConfig> = {}
  ) {
    this.storage = storage;
    this.config = { ...DEFAULT_QUEUE_CONFIG, ...config };
    this.circuitBreakers = new CircuitBreakerRegistry(this.config.circuitBreakerConfig);
  }

  /**
   * Register a task definition
   */
  registerTask<TInput, TOutput, TCheckpoint>(
    definition: TaskDefinition<TInput, TOutput, TCheckpoint>
  ): void {
    this.definitions.set(definition.type, definition as TaskDefinition);
  }

  /**
   * Subscribe to task events
   */
  on(handler: TaskEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const idx = this.eventHandlers.indexOf(handler);
      if (idx >= 0) this.eventHandlers.splice(idx, 1);
    };
  }

  private emit(event: TaskEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (e) {
        console.error('[TaskQueue] Event handler error:', e);
      }
    }
  }

  /**
   * Create and enqueue a new task
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
    if (!this.definitions.has(type)) {
      throw new Error(`Unknown task type: ${type}`);
    }

    const task: TaskInstance = {
      id: uuidv4(),
      type,
      status: 'pending',
      priority: options.priority || 'normal',
      input: JSON.stringify(input),
      checkpoint: null,
      output: null,
      errorMessage: null,
      errorStack: null,
      attemptCount: 0,
      maxAttempts: options.maxAttempts || this.config.defaultRetryConfig.maxAttempts,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      completedAt: null,
      retryAt: null,
      progress: 0,
      statusMessage: null,
      parentTaskId: options.parentTaskId || null,
      tags: options.tags || [],
      timeoutMs: options.timeoutMs || this.config.defaultTimeoutMs,
      projectId: options.projectId || null
    };

    await this.storage.save(task);
    this.emit({ type: 'task_created', task });

    return task.id;
  }

  /**
   * Get task by ID
   */
  async getTask(id: string): Promise<TaskInstance | null> {
    return this.storage.get(id);
  }

  /**
   * Cancel a task
   */
  async cancel(id: string): Promise<boolean> {
    const task = await this.storage.get(id);
    if (!task) return false;

    // Abort if running
    const controller = this.runningTasks.get(id);
    if (controller) {
      controller.abort();
      this.runningTasks.delete(id);
    }

    // Update status
    await this.storage.updateStatus(id, 'cancelled', {
      completedAt: new Date()
    });

    const updatedTask = await this.storage.get(id);
    if (updatedTask) {
      this.emit({ type: 'task_cancelled', task: updatedTask });
    }

    return true;
  }

  /**
   * Resume a checkpointed task
   */
  async resume(id: string): Promise<boolean> {
    const task = await this.storage.get(id);
    if (!task || task.status !== 'checkpointed') {
      return false;
    }

    await this.storage.updateStatus(id, 'pending');
    return true;
  }

  /**
   * Start processing tasks
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    this.pollInterval = setInterval(() => {
      this.processPendingTasks().catch(err => {
        console.error('[TaskQueue] Poll error:', err);
      });
    }, this.config.pollIntervalMs);

    // Also run immediately
    this.processPendingTasks().catch(console.error);
  }

  /**
   * Stop processing tasks (gracefully)
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    // Abort all running tasks
    for (const [id, controller] of this.runningTasks) {
      controller.abort();
      // Checkpoint the task so it can resume
      const task = await this.storage.get(id);
      if (task && task.status === 'in_progress') {
        await this.storage.updateStatus(id, 'checkpointed');
      }
    }
    this.runningTasks.clear();
  }

  /**
   * Process pending and retryable tasks
   */
  private async processPendingTasks(): Promise<void> {
    if (!this.isRunning) return;

    // Check how many slots we have
    const availableSlots = this.config.concurrency - this.runningTasks.size;
    if (availableSlots <= 0) return;

    // Get pending and retryable tasks
    const now = new Date();
    const pending = await this.storage.findByStatus(['pending']);
    const retryable = await this.storage.findRetryable(now);

    // Combine and sort by priority
    const candidates = [...retryable, ...pending]
      .sort((a, b) => {
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();
      })
      .slice(0, availableSlots);

    // Start executing
    for (const task of candidates) {
      // Check circuit breaker
      const breaker = this.circuitBreakers.get(task.type);
      if (!breaker.canExecute()) {
        continue;
      }

      this.executeTask(task).catch(err => {
        console.error(`[TaskQueue] Task ${task.id} execution error:`, err);
      });
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: TaskInstance): Promise<void> {
    const definition = this.definitions.get(task.type);
    if (!definition) {
      await this.storage.updateStatus(task.id, 'failed', {
        errorMessage: `Unknown task type: ${task.type}`,
        completedAt: new Date()
      });
      return;
    }

    // Set up abort controller
    const controller = new AbortController();
    this.runningTasks.set(task.id, controller);

    // Update status
    task.attemptCount++;
    task.status = 'in_progress';
    task.startedAt = new Date();
    task.updatedAt = new Date();
    await this.storage.save(task);

    this.emit({ type: 'task_started', task });

    // Parse input and checkpoint
    const input = JSON.parse(task.input);
    let checkpoint = task.checkpoint ? JSON.parse(task.checkpoint) : null;

    // Validate checkpoint if resuming
    if (checkpoint && definition.validateCheckpoint) {
      if (!definition.validateCheckpoint(checkpoint)) {
        checkpoint = null; // Invalid checkpoint, start fresh
      }
    }

    // Create execution context
    const startTime = Date.now();
    const context: TaskExecutionContext = {
      taskId: task.id,
      attemptNumber: task.attemptCount,
      timeRemaining: task.timeoutMs - (Date.now() - startTime),
      shouldAbort: () => controller.signal.aborted,
      log: (message, level = 'info') => {
        console.log(`[Task:${task.id}][${level}] ${message}`);
      },
      reportProgress: async (progress, message) => {
        task.progress = progress;
        task.statusMessage = message || null;
        task.updatedAt = new Date();
        await this.storage.save(task);
        this.emit({ type: 'task_progress', task, progress, message });
      },
      saveCheckpoint: async <T>(cp: T) => {
        task.checkpoint = JSON.stringify(cp);
        task.updatedAt = new Date();
        await this.storage.save(task);
        this.emit({ type: 'task_checkpointed', task });
      }
    };

    // Set up timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, task.timeoutMs);

    // Set up periodic checkpoint saving
    let checkpointInterval: NodeJS.Timeout | null = null;
    if (definition.chunkable) {
      checkpointInterval = setInterval(async () => {
        if (checkpoint) {
          await context.saveCheckpoint(checkpoint);
        }
      }, this.config.checkpointIntervalMs);
    }

    try {
      // Execute chunks until done
      let done = false;
      while (!done && !controller.signal.aborted) {
        context.timeRemaining = task.timeoutMs - (Date.now() - startTime);
        if (context.timeRemaining <= 0) {
          throw new Error('Task timeout');
        }

        const result: ChunkResult = await definition.executeChunk(input, checkpoint, context);

        if (result.checkpoint) {
          checkpoint = result.checkpoint;
        }

        if (result.progress !== undefined) {
          await context.reportProgress(result.progress, result.message);
        }

        if (result.done) {
          done = true;

          // Success!
          task.status = 'completed';
          task.output = JSON.stringify(result.output);
          task.completedAt = new Date();
          task.updatedAt = new Date();
          task.progress = 1;
          await this.storage.save(task);

          // Record success with circuit breaker
          this.circuitBreakers.get(task.type).recordSuccess();

          // Call success handler
          if (definition.onSuccess) {
            await definition.onSuccess(input, result.output);
          }

          this.emit({ type: 'task_completed', task, output: result.output });
        }
      }

      if (controller.signal.aborted && !done) {
        // Task was aborted, checkpoint it
        task.status = 'checkpointed';
        task.checkpoint = JSON.stringify(checkpoint);
        task.updatedAt = new Date();
        await this.storage.save(task);
        this.emit({ type: 'task_checkpointed', task });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Record failure with circuit breaker
      this.circuitBreakers.get(task.type).recordFailure(err);

      // Check if we should retry
      const retryConfig = this.config.defaultRetryConfig;
      const willRetry = shouldRetry(err, task.attemptCount, retryConfig);

      if (willRetry) {
        const delay = calculateRetryDelay(task.attemptCount, retryConfig);
        task.status = 'retrying';
        task.retryAt = new Date(Date.now() + delay);
        task.errorMessage = err.message;
        task.errorStack = err.stack || null;
        task.updatedAt = new Date();
        // Preserve checkpoint for retry
        if (checkpoint) {
          task.checkpoint = JSON.stringify(checkpoint);
        }
        await this.storage.save(task);

        this.emit({ type: 'task_retrying', task, attemptNumber: task.attemptCount, delayMs: delay });
      } else {
        // Permanent failure
        task.status = 'failed';
        task.errorMessage = err.message;
        task.errorStack = err.stack || null;
        task.completedAt = new Date();
        task.updatedAt = new Date();
        await this.storage.save(task);

        // Call failure handler
        if (definition.onFailure) {
          await definition.onFailure(input, checkpoint, err);
        }

        this.emit({ type: 'task_failed', task, error: err, willRetry: false });
      }
    } finally {
      clearTimeout(timeoutId);
      if (checkpointInterval) {
        clearInterval(checkpointInterval);
      }
      this.runningTasks.delete(task.id);
    }
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
    const [pending, inProgress, completed, failed, retrying] = await Promise.all([
      this.storage.findByStatus(['pending']),
      this.storage.findByStatus(['in_progress']),
      this.storage.findByStatus(['completed']),
      this.storage.findByStatus(['failed']),
      this.storage.findByStatus(['retrying'])
    ]);

    return {
      pending: pending.length,
      inProgress: inProgress.length,
      completed: completed.length,
      failed: failed.length,
      retrying: retrying.length,
      circuitBreakers: this.circuitBreakers.getAllStates().map(s => ({
        name: s.name,
        state: s.state
      }))
    };
  }

  /**
   * Clean up old completed tasks
   */
  async cleanup(): Promise<number> {
    const cutoff = new Date(Date.now() - this.config.cleanupAfterMs);
    return this.storage.cleanup(cutoff);
  }
}

/**
 * Helper to wait for a task to complete
 */
export async function waitForTask(
  queue: TaskQueue,
  taskId: string,
  options: {
    pollIntervalMs?: number;
    timeoutMs?: number;
    onProgress?: (progress: number, message?: string) => void;
  } = {}
): Promise<TaskInstance> {
  const pollInterval = options.pollIntervalMs || 500;
  const timeout = options.timeoutMs || 300000; // 5 minutes
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const task = await queue.getTask(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (options.onProgress && task.progress) {
      options.onProgress(task.progress, task.statusMessage || undefined);
    }

    if (['completed', 'failed', 'cancelled'].includes(task.status)) {
      return task;
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Timeout waiting for task ${taskId}`);
}
