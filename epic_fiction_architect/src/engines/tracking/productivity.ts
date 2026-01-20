/**
 * Epic Fiction Architect - Writing Productivity Tracker
 *
 * Comprehensive tracking for:
 * - Writing sessions with sprint/pomodoro support
 * - Word count goals (daily, weekly, monthly, project)
 * - Streaks and consistency tracking
 * - Statistical analysis and projections
 * - Progress visualization data
 */

import {DatabaseManager} from '../../db/database';
import type {
  WritingSession,
  WritingGoal,
  WritingStreak
} from '../../core/types';
import {v4 as uuidv4} from 'uuid';

// ============================================================================
// TYPES
// ============================================================================

export interface SessionStats {
  duration: number; // minutes
  wordsWritten: number;
  wordsDeleted: number;
  netWords: number;
  wordsPerMinute: number;
  scenesWorkedOn: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalWords: number;
  sessionCount: number;
  totalMinutes: number;
  goalMet: boolean;
  goalProgress: number; // 0-100
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalWords: number;
  averageDailyWords: number;
  daysWritten: number;
  totalSessions: number;
  totalMinutes: number;
  mostProductiveDay: string;
  leastProductiveDay: string;
}

export interface ProjectionResult {
  currentPace: number; // words per day
  projectedCompletion?: Date;
  daysRemaining?: number;
  onTrack: boolean;
  recommendation: string;
}

export interface SprintResult {
  sessionId: string;
  duration: number;
  targetWords?: number;
  actualWords: number;
  wordsPerMinute: number;
  targetMet: boolean;
}

// ============================================================================
// PRODUCTIVITY TRACKER
// ============================================================================

export class ProductivityTracker {
  private db: DatabaseManager;
  private activeSessions: Map<string, {
    sessionId: string;
    projectId: string;
    startTime: Date;
    startWordCounts: Map<string, number>;
  }> = new Map();

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================

  /**
   * Start a new writing session
   */
  startSession(
    projectId: string,
    type: WritingSession['sessionType'] = 'freewrite',
    sprintDuration?: number
  ): string {
    const sessionId = this.db.startWritingSession(projectId, type);

    // Track current word counts for delta calculation
    const startWordCounts = new Map<string, number>();
    const scenes = this.db.all<{id: string; word_count: number}>(
      'SELECT id, word_count FROM scenes WHERE project_id = ?',
      [projectId]
    );

    for (const scene of scenes) {
      startWordCounts.set(scene.id, scene.word_count);
    }

    // Store active session
    this.activeSessions.set(sessionId, {
      sessionId,
      projectId,
      startTime: new Date(),
      startWordCounts
    });

    // If sprint, set up duration
    if (type === 'sprint' && sprintDuration) {
      this.db.run(
        'UPDATE writing_sessions SET sprint_duration = ? WHERE id = ?',
        [sprintDuration, sessionId]
      );
    }

    return sessionId;
  }

  /**
   * End an active writing session
   */
  endSession(sessionId: string): SessionStats | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    // Calculate word changes
    let wordsWritten = 0;
    let wordsDeleted = 0;
    const sceneIds: string[] = [];

    const currentScenes = this.db.all<{id: string; word_count: number}>(
      'SELECT id, word_count FROM scenes WHERE project_id = ?',
      [session.projectId]
    );

    for (const scene of currentScenes) {
      const startCount = session.startWordCounts.get(scene.id) ?? 0;
      const diff = scene.word_count - startCount;

      if (diff > 0) {
        wordsWritten += diff;
        sceneIds.push(scene.id);
      } else if (diff < 0) {
        wordsDeleted += Math.abs(diff);
        sceneIds.push(scene.id);
      }
    }

    // End session in database
    this.db.endWritingSession(sessionId, {
      wordsWritten,
      wordsDeleted,
      sceneIds
    });

    // Calculate stats
    const endTime = new Date();
    const durationMinutes = (endTime.getTime() - session.startTime.getTime()) / 60000;
    const netWords = wordsWritten - wordsDeleted;

    // Remove from active sessions
    this.activeSessions.delete(sessionId);

    // Update streak
    this.updateStreak(session.projectId, netWords);

    return {
      duration: Math.round(durationMinutes),
      wordsWritten,
      wordsDeleted,
      netWords,
      wordsPerMinute: durationMinutes > 0 ? Math.round(netWords / durationMinutes) : 0,
      scenesWorkedOn: sceneIds.length
    };
  }

  /**
   * Get current session stats (while session is active)
   */
  getActiveSessionStats(sessionId: string): SessionStats | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    let wordsWritten = 0;
    let wordsDeleted = 0;
    let scenesWorkedOn = 0;

    const currentScenes = this.db.all<{id: string; word_count: number}>(
      'SELECT id, word_count FROM scenes WHERE project_id = ?',
      [session.projectId]
    );

    for (const scene of currentScenes) {
      const startCount = session.startWordCounts.get(scene.id) ?? 0;
      const diff = scene.word_count - startCount;

      if (diff > 0) {
        wordsWritten += diff;
        scenesWorkedOn++;
      } else if (diff < 0) {
        wordsDeleted += Math.abs(diff);
        scenesWorkedOn++;
      }
    }

    const durationMinutes = (new Date().getTime() - session.startTime.getTime()) / 60000;
    const netWords = wordsWritten - wordsDeleted;

    return {
      duration: Math.round(durationMinutes),
      wordsWritten,
      wordsDeleted,
      netWords,
      wordsPerMinute: durationMinutes > 0 ? Math.round(netWords / durationMinutes) : 0,
      scenesWorkedOn
    };
  }

  // ==========================================================================
  // SPRINT/POMODORO
  // ==========================================================================

  /**
   * Start a timed writing sprint
   */
  startSprint(
    projectId: string,
    durationMinutes: number,
    _targetWords?: number
  ): {sessionId: string; endsAt: Date} {
    const sessionId = this.startSession(projectId, 'sprint', durationMinutes);
    const endsAt = new Date(Date.now() + durationMinutes * 60000);

    return {sessionId, endsAt};
  }

  /**
   * Complete a sprint and get results
   */
  completeSprint(sessionId: string): SprintResult | null {
    const sessionData = this.db.get<{
      sprint_duration: number | null;
    }>('SELECT sprint_duration FROM writing_sessions WHERE id = ?', [sessionId]);

    const stats = this.endSession(sessionId);
    if (!stats) return null;

    const targetWords = sessionData?.sprint_duration
      ? Math.round(sessionData.sprint_duration * 20) // Default target: 20 words/minute
      : undefined;

    return {
      sessionId,
      duration: stats.duration,
      targetWords,
      actualWords: stats.netWords,
      wordsPerMinute: stats.wordsPerMinute,
      targetMet: targetWords ? stats.netWords >= targetWords : true
    };
  }

  // ==========================================================================
  // GOALS
  // ==========================================================================

  /**
   * Create a writing goal
   */
  createGoal(
    projectId: string,
    name: string,
    type: WritingGoal['type'],
    targetWords: number,
    endDate?: Date
  ): string {
    const id = uuidv4();
    const startDate = new Date();

    this.db.run(
      `INSERT INTO writing_goals (id, project_id, name, type, target_words, start_date, end_date, current_progress)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, projectId, name, type, targetWords, startDate.toISOString(), endDate?.toISOString() ?? null]
    );

    return id;
  }

  /**
   * Update goal progress
   */
  updateGoalProgress(goalId: string): void {
    const goal = this.db.get<{
      project_id: string;
      type: string;
      start_date: string;
      end_date: string | null;
    }>('SELECT project_id, type, start_date, end_date FROM writing_goals WHERE id = ?', [goalId]);

    if (!goal) return;

    // Calculate progress based on goal type
    let progress = 0;

    switch (goal.type) {
      case 'daily': {
        const today = new Date().toISOString().split('T')[0];
        const stats = this.db.getWritingStats(
          goal.project_id,
          new Date(today),
          new Date(today + 'T23:59:59')
        );
        progress = stats.totalWords;
        break;
      }

      case 'weekly': {
        const weekStart = this.getWeekStart(new Date());
        const stats = this.db.getWritingStats(
          goal.project_id,
          weekStart,
          new Date()
        );
        progress = stats.totalWords;
        break;
      }

      case 'monthly': {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const stats = this.db.getWritingStats(
          goal.project_id,
          monthStart,
          new Date()
        );
        progress = stats.totalWords;
        break;
      }

      case 'total': {
        const stats = this.db.getWritingStats(
          goal.project_id,
          new Date(goal.start_date),
          new Date()
        );
        progress = stats.totalWords;
        break;
      }

      case 'deadline': {
        if (goal.end_date) {
          const stats = this.db.getWritingStats(
            goal.project_id,
            new Date(goal.start_date),
            new Date()
          );
          progress = stats.totalWords;
        }
        break;
      }
    }

    this.db.run(
      'UPDATE writing_goals SET current_progress = ? WHERE id = ?',
      [progress, goalId]
    );
  }

  /**
   * Get all active goals for a project
   */
  getActiveGoals(projectId: string): (WritingGoal & {percentComplete: number})[] {
    const rows = this.db.all<{
      id: string;
      project_id: string;
      name: string;
      type: string;
      target_words: number;
      start_date: string;
      end_date: string | null;
      current_progress: number;
    }>(
      `SELECT * FROM writing_goals
       WHERE project_id = ?
       AND (end_date IS NULL OR end_date >= datetime('now'))`,
      [projectId]
    );

    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      type: row.type as WritingGoal['type'],
      targetWords: row.target_words,
      startDate: new Date(row.start_date),
      endDate: row.end_date ? new Date(row.end_date) : undefined,
      currentProgress: row.current_progress,
      percentComplete: Math.min(100, Math.round((row.current_progress / row.target_words) * 100))
    }));
  }

  // ==========================================================================
  // STREAKS
  // ==========================================================================

  /**
   * Get current streak info
   */
  getStreak(projectId: string): WritingStreak {
    const row = this.db.get<{
      current_streak: number;
      longest_streak: number;
      last_writing_date: string;
      streak_goal: number;
    }>(
      'SELECT * FROM writing_streaks WHERE project_id = ?',
      [projectId]
    );

    if (!row) {
      return {
        projectId,
        currentStreak: 0,
        longestStreak: 0,
        lastWritingDate: new Date(0),
        streakGoal: 500
      };
    }

    return {
      projectId,
      currentStreak: row.current_streak,
      longestStreak: row.longest_streak,
      lastWritingDate: new Date(row.last_writing_date),
      streakGoal: row.streak_goal
    };
  }

  /**
   * Update streak after writing
   */
  private updateStreak(projectId: string, wordsWritten: number): void {
    const streak = this.getStreak(projectId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWrite = new Date(streak.lastWritingDate);
    lastWrite.setHours(0, 0, 0, 0);

    const daysSinceLastWrite = Math.floor((today.getTime() - lastWrite.getTime()) / (24 * 60 * 60 * 1000));

    let newStreak = streak.currentStreak;

    // Check if goal was met today
    if (wordsWritten >= streak.streakGoal) {
      if (daysSinceLastWrite === 0) {
        // Already wrote today, streak unchanged
      } else if (daysSinceLastWrite === 1) {
        // Consecutive day - increment streak
        newStreak++;
      } else {
        // Streak broken - start fresh
        newStreak = 1;
      }
    }

    const longestStreak = Math.max(streak.longestStreak, newStreak);

    // Upsert streak record
    this.db.run(
      `INSERT INTO writing_streaks (project_id, current_streak, longest_streak, last_writing_date, streak_goal)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(project_id) DO UPDATE SET
         current_streak = ?,
         longest_streak = ?,
         last_writing_date = ?`,
      [
        projectId, newStreak, longestStreak, today.toISOString(), streak.streakGoal,
        newStreak, longestStreak, today.toISOString()
      ]
    );
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get daily statistics for a date range
   */
  getDailyStats(projectId: string, startDate: Date, endDate: Date): DailyStats[] {
    const stats: DailyStats[] = [];
    const current = new Date(startDate);

    // Get daily goal
    const dailyGoal = this.db.get<{target_words: number}>(
      `SELECT target_words FROM writing_goals WHERE project_id = ? AND type = 'daily' LIMIT 1`,
      [projectId]
    )?.target_words ?? 500;

    while (current <= endDate) {
      const dayStart = new Date(current);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(current);
      dayEnd.setHours(23, 59, 59, 999);

      const dayStats = this.db.getWritingStats(projectId, dayStart, dayEnd);
      const dateStr = current.toISOString().split('T')[0];

      stats.push({
        date: dateStr,
        totalWords: dayStats.totalWords,
        sessionCount: dayStats.totalSessions,
        totalMinutes: dayStats.totalDuration,
        goalMet: dayStats.totalWords >= dailyGoal,
        goalProgress: Math.min(100, Math.round((dayStats.totalWords / dailyGoal) * 100))
      });

      current.setDate(current.getDate() + 1);
    }

    return stats;
  }

  /**
   * Get weekly statistics
   */
  getWeeklyStats(projectId: string, weekStart: Date): WeeklyStats {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const dailyStats = this.getDailyStats(projectId, weekStart, weekEnd);

    const totalWords = dailyStats.reduce((sum, d) => sum + d.totalWords, 0);
    const daysWritten = dailyStats.filter(d => d.totalWords > 0).length;
    const totalSessions = dailyStats.reduce((sum, d) => sum + d.sessionCount, 0);
    const totalMinutes = dailyStats.reduce((sum, d) => sum + d.totalMinutes, 0);

    // Find most/least productive days
    const sortedDays = [...dailyStats].sort((a, b) => b.totalWords - a.totalWords);
    const mostProductiveDay = sortedDays[0]?.date ?? '';
    const leastProductiveDay = sortedDays.filter(d => d.totalWords > 0).pop()?.date ?? '';

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalWords,
      averageDailyWords: Math.round(totalWords / 7),
      daysWritten,
      totalSessions,
      totalMinutes,
      mostProductiveDay,
      leastProductiveDay
    };
  }

  /**
   * Project completion estimate
   */
  getProjection(projectId: string): ProjectionResult {
    const project = this.db.getProject(projectId);
    if (!project) {
      return {
        currentPace: 0,
        onTrack: false,
        recommendation: 'Project not found'
      };
    }

    // Get last 30 days of writing
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = this.db.getWritingStats(projectId, thirtyDaysAgo, new Date());
    const dailyPace = stats.totalWords / 30;

    if (!project.targetWordCount) {
      return {
        currentPace: Math.round(dailyPace),
        onTrack: true,
        recommendation: 'Set a target word count to enable completion projections'
      };
    }

    const wordsRemaining = Math.max(0, project.targetWordCount - project.currentWordCount);

    if (dailyPace <= 0) {
      return {
        currentPace: 0,
        onTrack: false,
        recommendation: 'Start writing to generate projections!'
      };
    }

    const daysRemaining = Math.ceil(wordsRemaining / dailyPace);
    const projectedCompletion = new Date();
    projectedCompletion.setDate(projectedCompletion.getDate() + daysRemaining);

    // Check if there's a deadline goal
    const deadlineGoal = this.db.get<{end_date: string}>(
      `SELECT end_date FROM writing_goals WHERE project_id = ? AND type = 'deadline' AND end_date IS NOT NULL LIMIT 1`,
      [projectId]
    );

    let onTrack = true;
    let recommendation = '';

    if (deadlineGoal) {
      const deadline = new Date(deadlineGoal.end_date);
      onTrack = projectedCompletion <= deadline;

      if (!onTrack) {
        const requiredPace = wordsRemaining / Math.max(1, Math.ceil((deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
        recommendation = `Need ${Math.round(requiredPace)} words/day to hit deadline (currently ${Math.round(dailyPace)}/day)`;
      } else {
        recommendation = `On track to finish ${Math.round((deadline.getTime() - projectedCompletion.getTime()) / (24 * 60 * 60 * 1000))} days early`;
      }
    } else {
      recommendation = `At current pace, completion in ${daysRemaining} days`;
    }

    return {
      currentPace: Math.round(dailyPace),
      projectedCompletion,
      daysRemaining,
      onTrack,
      recommendation
    };
  }

  /**
   * Get writing pace chart data
   */
  getPaceChartData(projectId: string, days: number = 30): {date: string; words: number; cumulative: number}[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyStats = this.getDailyStats(projectId, startDate, new Date());

    let cumulative = 0;
    return dailyStats.map(day => {
      cumulative += day.totalWords;
      return {
        date: day.date,
        words: day.totalWords,
        cumulative
      };
    });
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Adjust to Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}

// ============================================================================
// TIMER UTILITIES
// ============================================================================

export class WritingTimer {
  private startTime: Date | null = null;
  private pausedTime: number = 0;
  private isPaused: boolean = false;
  private pauseStartTime: Date | null = null;
  private duration: number; // Target duration in minutes
  private onTick?: (remaining: number) => void;
  private onComplete?: () => void;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(durationMinutes: number) {
    this.duration = durationMinutes;
  }

  start(onTick?: (remaining: number) => void, onComplete?: () => void): void {
    this.startTime = new Date();
    this.onTick = onTick;
    this.onComplete = onComplete;

    this.intervalId = setInterval(() => {
      const remaining = this.getRemaining();
      if (remaining <= 0) {
        this.stop();
        this.onComplete?.();
      } else {
        this.onTick?.(remaining);
      }
    }, 1000);
  }

  pause(): void {
    if (!this.isPaused) {
      this.isPaused = true;
      this.pauseStartTime = new Date();
    }
  }

  resume(): void {
    if (this.isPaused && this.pauseStartTime) {
      this.pausedTime += new Date().getTime() - this.pauseStartTime.getTime();
      this.isPaused = false;
      this.pauseStartTime = null;
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getElapsed(): number {
    if (!this.startTime) return 0;

    let elapsed = new Date().getTime() - this.startTime.getTime() - this.pausedTime;

    if (this.isPaused && this.pauseStartTime) {
      elapsed -= (new Date().getTime() - this.pauseStartTime.getTime());
    }

    return Math.floor(elapsed / 1000); // Return seconds
  }

  getRemaining(): number {
    const elapsed = this.getElapsed();
    const totalSeconds = this.duration * 60;
    return Math.max(0, totalSeconds - elapsed);
  }

  isRunning(): boolean {
    return this.startTime !== null && !this.isPaused && this.intervalId !== null;
  }
}
