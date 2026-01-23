/**
 * SQLite Storage Implementation for Task Queue
 *
 * Provides persistent storage for tasks, enabling recovery after crashes,
 * restarts, or connection issues.
 */

import Database from 'better-sqlite3';
import { TaskInstance, TaskStatus, TaskFilter } from './types';
import { TaskQueueStorage } from './task-queue';

// Priority ordering is handled in SQL ORDER BY clause

/**
 * SQL Schema for task tables
 */
export const TASK_SCHEMA = `
-- Task instances table
CREATE TABLE IF NOT EXISTS task_instances (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'normal',
  input TEXT NOT NULL,
  checkpoint TEXT,
  output TEXT,
  error_message TEXT,
  error_stack TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT,
  retry_at TEXT,
  progress REAL NOT NULL DEFAULT 0,
  status_message TEXT,
  parent_task_id TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  timeout_ms INTEGER NOT NULL DEFAULT 120000,
  project_id TEXT,
  FOREIGN KEY (parent_task_id) REFERENCES task_instances(id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON task_instances(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON task_instances(type);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON task_instances(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON task_instances(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_retry_at ON task_instances(retry_at);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON task_instances(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON task_instances(parent_task_id);

-- Task execution history (for debugging and analytics)
CREATE TABLE IF NOT EXISTS task_execution_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  checkpoint_at_start TEXT,
  checkpoint_at_end TEXT,
  FOREIGN KEY (task_id) REFERENCES task_instances(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_history_task ON task_execution_history(task_id);

-- Circuit breaker state (persisted for crash recovery)
CREATE TABLE IF NOT EXISTS circuit_breaker_state (
  name TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'closed',
  failure_count INTEGER NOT NULL DEFAULT 0,
  half_open_successes INTEGER NOT NULL DEFAULT 0,
  last_failure_at TEXT,
  next_attempt_at TEXT,
  updated_at TEXT NOT NULL
);
`;

/**
 * SQLite implementation of TaskQueueStorage
 */
export class SQLiteTaskStorage implements TaskQueueStorage {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    this.initialize();
  }

  /**
   * Initialize database schema
   */
  private initialize(): void {
    this.db.exec(TASK_SCHEMA);
  }

  /**
   * Convert database row to TaskInstance
   */
  private rowToTask(row: Record<string, unknown>): TaskInstance {
    return {
      id: row.id as string,
      type: row.type as string,
      status: row.status as TaskStatus,
      priority: row.priority as TaskInstance['priority'],
      input: row.input as string,
      checkpoint: row.checkpoint as string | null,
      output: row.output as string | null,
      errorMessage: row.error_message as string | null,
      errorStack: row.error_stack as string | null,
      attemptCount: row.attempt_count as number,
      maxAttempts: row.max_attempts as number,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
      startedAt: row.started_at ? new Date(row.started_at as string) : null,
      completedAt: row.completed_at ? new Date(row.completed_at as string) : null,
      retryAt: row.retry_at ? new Date(row.retry_at as string) : null,
      progress: row.progress as number,
      statusMessage: row.status_message as string | null,
      parentTaskId: row.parent_task_id as string | null,
      tags: JSON.parse(row.tags as string),
      timeoutMs: row.timeout_ms as number,
      projectId: row.project_id as string | null
    };
  }

  /**
   * Convert TaskInstance to database parameters
   */
  private taskToParams(task: TaskInstance): Record<string, unknown> {
    return {
      id: task.id,
      type: task.type,
      status: task.status,
      priority: task.priority,
      input: task.input,
      checkpoint: task.checkpoint,
      output: task.output,
      error_message: task.errorMessage,
      error_stack: task.errorStack,
      attempt_count: task.attemptCount,
      max_attempts: task.maxAttempts,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
      started_at: task.startedAt?.toISOString() || null,
      completed_at: task.completedAt?.toISOString() || null,
      retry_at: task.retryAt?.toISOString() || null,
      progress: task.progress,
      status_message: task.statusMessage,
      parent_task_id: task.parentTaskId,
      tags: JSON.stringify(task.tags),
      timeout_ms: task.timeoutMs,
      project_id: task.projectId
    };
  }

  async save(task: TaskInstance): Promise<void> {
    const params = this.taskToParams(task);

    const stmt = this.db.prepare(`
      INSERT INTO task_instances (
        id, type, status, priority, input, checkpoint, output,
        error_message, error_stack, attempt_count, max_attempts,
        created_at, updated_at, started_at, completed_at, retry_at,
        progress, status_message, parent_task_id, tags, timeout_ms, project_id
      ) VALUES (
        @id, @type, @status, @priority, @input, @checkpoint, @output,
        @error_message, @error_stack, @attempt_count, @max_attempts,
        @created_at, @updated_at, @started_at, @completed_at, @retry_at,
        @progress, @status_message, @parent_task_id, @tags, @timeout_ms, @project_id
      )
      ON CONFLICT(id) DO UPDATE SET
        status = @status,
        priority = @priority,
        checkpoint = @checkpoint,
        output = @output,
        error_message = @error_message,
        error_stack = @error_stack,
        attempt_count = @attempt_count,
        updated_at = @updated_at,
        started_at = @started_at,
        completed_at = @completed_at,
        retry_at = @retry_at,
        progress = @progress,
        status_message = @status_message,
        tags = @tags
    `);

    stmt.run(params);
  }

  async get(id: string): Promise<TaskInstance | null> {
    const stmt = this.db.prepare('SELECT * FROM task_instances WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    return row ? this.rowToTask(row) : null;
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM task_instances WHERE id = ?');
    stmt.run(id);
  }

  async findByStatus(statuses: TaskStatus[]): Promise<TaskInstance[]> {
    const placeholders = statuses.map(() => '?').join(',');
    const stmt = this.db.prepare(`
      SELECT * FROM task_instances
      WHERE status IN (${placeholders})
      ORDER BY
        CASE priority
          WHEN 'critical' THEN 0
          WHEN 'high' THEN 1
          WHEN 'normal' THEN 2
          WHEN 'low' THEN 3
          WHEN 'background' THEN 4
        END,
        created_at ASC
    `);

    const rows = stmt.all(...statuses) as Record<string, unknown>[];
    return rows.map(row => this.rowToTask(row));
  }

  async findByFilter(filter: TaskFilter): Promise<TaskInstance[]> {
    const conditions: string[] = ['1=1'];
    const params: unknown[] = [];

    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      conditions.push(`status IN (${statuses.map(() => '?').join(',')})`);
      params.push(...statuses);
    }

    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      conditions.push(`type IN (${types.map(() => '?').join(',')})`);
      params.push(...types);
    }

    if (filter.priority) {
      const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
      conditions.push(`priority IN (${priorities.map(() => '?').join(',')})`);
      params.push(...priorities);
    }

    if (filter.projectId) {
      conditions.push('project_id = ?');
      params.push(filter.projectId);
    }

    if (filter.parentTaskId !== undefined) {
      if (filter.parentTaskId === null) {
        conditions.push('parent_task_id IS NULL');
      } else {
        conditions.push('parent_task_id = ?');
        params.push(filter.parentTaskId);
      }
    }

    if (filter.createdAfter) {
      conditions.push('created_at >= ?');
      params.push(filter.createdAfter.toISOString());
    }

    if (filter.createdBefore) {
      conditions.push('created_at <= ?');
      params.push(filter.createdBefore.toISOString());
    }

    // Tags require JSON search
    if (filter.tags?.length) {
      const tagConditions = filter.tags.map(() => "tags LIKE ?");
      conditions.push(`(${tagConditions.join(' OR ')})`);
      params.push(...filter.tags.map(t => `%"${t}"%`));
    }

    const stmt = this.db.prepare(`
      SELECT * FROM task_instances
      WHERE ${conditions.join(' AND ')}
      ORDER BY
        CASE priority
          WHEN 'critical' THEN 0
          WHEN 'high' THEN 1
          WHEN 'normal' THEN 2
          WHEN 'low' THEN 3
          WHEN 'background' THEN 4
        END,
        created_at ASC
    `);

    const rows = stmt.all(...params) as Record<string, unknown>[];
    return rows.map(row => this.rowToTask(row));
  }

  async findRetryable(now: Date): Promise<TaskInstance[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM task_instances
      WHERE status = 'retrying' AND retry_at <= ?
      ORDER BY
        CASE priority
          WHEN 'critical' THEN 0
          WHEN 'high' THEN 1
          WHEN 'normal' THEN 2
          WHEN 'low' THEN 3
          WHEN 'background' THEN 4
        END,
        created_at ASC
    `);

    const rows = stmt.all(now.toISOString()) as Record<string, unknown>[];
    return rows.map(row => this.rowToTask(row));
  }

  async updateStatus(id: string, status: TaskStatus, updates?: Partial<TaskInstance>): Promise<void> {
    const setClauses = ['status = ?', 'updated_at = ?'];
    const params: unknown[] = [status, new Date().toISOString()];

    if (updates) {
      if (updates.checkpoint !== undefined) {
        setClauses.push('checkpoint = ?');
        params.push(updates.checkpoint);
      }
      if (updates.output !== undefined) {
        setClauses.push('output = ?');
        params.push(updates.output);
      }
      if (updates.errorMessage !== undefined) {
        setClauses.push('error_message = ?');
        params.push(updates.errorMessage);
      }
      if (updates.completedAt !== undefined) {
        setClauses.push('completed_at = ?');
        params.push(updates.completedAt?.toISOString() || null);
      }
      if (updates.retryAt !== undefined) {
        setClauses.push('retry_at = ?');
        params.push(updates.retryAt?.toISOString() || null);
      }
      if (updates.progress !== undefined) {
        setClauses.push('progress = ?');
        params.push(updates.progress);
      }
    }

    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE task_instances
      SET ${setClauses.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);
  }

  async cleanup(olderThan: Date): Promise<number> {
    const stmt = this.db.prepare(`
      DELETE FROM task_instances
      WHERE completed_at IS NOT NULL
        AND completed_at < ?
        AND status IN ('completed', 'failed', 'cancelled')
    `);

    const result = stmt.run(olderThan.toISOString());
    return result.changes;
  }

  /**
   * Record an execution attempt (for debugging/analytics)
   */
  recordExecution(
    taskId: string,
    attemptNumber: number,
    status: string,
    checkpointAtStart?: string,
    checkpointAtEnd?: string,
    errorMessage?: string
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO task_execution_history (
        task_id, attempt_number, started_at, ended_at, status,
        error_message, checkpoint_at_start, checkpoint_at_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      taskId,
      attemptNumber,
      new Date().toISOString(),
      new Date().toISOString(),
      status,
      errorMessage || null,
      checkpointAtStart || null,
      checkpointAtEnd || null
    );
  }

  /**
   * Get execution history for a task
   */
  getExecutionHistory(taskId: string): Array<{
    attemptNumber: number;
    startedAt: Date;
    endedAt: Date | null;
    status: string;
    errorMessage: string | null;
  }> {
    const stmt = this.db.prepare(`
      SELECT * FROM task_execution_history
      WHERE task_id = ?
      ORDER BY attempt_number ASC
    `);

    const rows = stmt.all(taskId) as Record<string, unknown>[];
    return rows.map(row => ({
      attemptNumber: row.attempt_number as number,
      startedAt: new Date(row.started_at as string),
      endedAt: row.ended_at ? new Date(row.ended_at as string) : null,
      status: row.status as string,
      errorMessage: row.error_message as string | null
    }));
  }

  /**
   * Get task statistics
   */
  getStats(): {
    totalTasks: number;
    byStatus: Record<TaskStatus, number>;
    byType: Record<string, number>;
    avgCompletionTimeMs: number;
    successRate: number;
  } {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM task_instances').get() as { count: number };

    const statusCounts = this.db.prepare(`
      SELECT status, COUNT(*) as count FROM task_instances GROUP BY status
    `).all() as Array<{ status: TaskStatus; count: number }>;

    const typeCounts = this.db.prepare(`
      SELECT type, COUNT(*) as count FROM task_instances GROUP BY type
    `).all() as Array<{ type: string; count: number }>;

    const completionStats = this.db.prepare(`
      SELECT
        AVG(CAST((julianday(completed_at) - julianday(started_at)) * 86400000 AS INTEGER)) as avg_time,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status IN ('completed', 'failed') THEN 1 ELSE 0 END) as finished
      FROM task_instances
      WHERE completed_at IS NOT NULL
    `).get() as { avg_time: number | null; completed: number; finished: number };

    const byStatus = {} as Record<TaskStatus, number>;
    for (const row of statusCounts) {
      byStatus[row.status] = row.count;
    }

    const byType: Record<string, number> = {};
    for (const row of typeCounts) {
      byType[row.type] = row.count;
    }

    return {
      totalTasks: total.count,
      byStatus,
      byType,
      avgCompletionTimeMs: completionStats.avg_time || 0,
      successRate: completionStats.finished > 0
        ? completionStats.completed / completionStats.finished
        : 0
    };
  }

  /**
   * Find stale in-progress tasks (for recovery after crash)
   */
  findStaleTasks(staleSinceMs: number): TaskInstance[] {
    const cutoff = new Date(Date.now() - staleSinceMs).toISOString();

    const stmt = this.db.prepare(`
      SELECT * FROM task_instances
      WHERE status = 'in_progress'
        AND updated_at < ?
    `);

    const rows = stmt.all(cutoff) as Record<string, unknown>[];
    return rows.map(row => this.rowToTask(row));
  }

  /**
   * Recover stale tasks (mark for retry)
   */
  recoverStaleTasks(staleSinceMs: number): number {
    const staleTasks = this.findStaleTasks(staleSinceMs);
    let recovered = 0;

    for (const task of staleTasks) {
      if (task.attemptCount < task.maxAttempts) {
        this.updateStatus(task.id, 'retrying', {
          retryAt: new Date(Date.now() + 5000) // Retry in 5 seconds
        });
        recovered++;
      } else {
        this.updateStatus(task.id, 'failed', {
          errorMessage: 'Task stalled and exceeded max attempts',
          completedAt: new Date()
        });
      }
    }

    return recovered;
  }
}

/**
 * Helper to create SQLite storage with a database instance
 */
export function createSQLiteTaskStorage(dbPath: string): SQLiteTaskStorage {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL'); // Better concurrent access
  db.pragma('synchronous = NORMAL'); // Good balance of safety and speed
  return new SQLiteTaskStorage(db);
}
