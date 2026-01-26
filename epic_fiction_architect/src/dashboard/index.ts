/**
 * ProjectDashboard - Unified Epic Fiction Project Health Monitor
 *
 * Aggregates data from all engines to provide:
 * - Overall project health score
 * - Progress tracking across all dimensions
 * - Issue detection and prioritization
 * - Production metrics and forecasting
 * - Cross-engine consistency alerts
 *
 * Designed for 300M+ word narratives with 12,008+ chapters
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Health Score Types
// ============================================================================

export enum HealthCategory {
  PLOT = 'plot',
  CHARACTER = 'character',
  WORLD = 'world',
  CONSISTENCY = 'consistency',
  PACING = 'pacing',
  PRODUCTION = 'production',
  QUALITY = 'quality',
  RELATIONSHIPS = 'relationships',
  POWER_SYSTEMS = 'power_systems',
  TIMELINE = 'timeline',
}

export enum HealthStatus {
  EXCELLENT = 'excellent',    // 90-100
  GOOD = 'good',              // 75-89
  FAIR = 'fair',              // 60-74
  WARNING = 'warning',        // 40-59
  CRITICAL = 'critical',      // 0-39
}

export enum IssueSeverity {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum IssuePriority {
  BACKLOG = 'backlog',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  BLOCKING = 'blocking',
}

// ============================================================================
// Health Score Structures
// ============================================================================

export interface HealthScore {
  score: number;          // 0-100
  status: HealthStatus;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

export interface CategoryHealth {
  category: HealthCategory;
  health: HealthScore;
  subCategories: {
    name: string;
    health: HealthScore;
    issueCount: number;
  }[];
  topIssues: DashboardIssue[];
}

export interface OverallHealth {
  projectId: string;
  projectName: string;
  overallScore: number;
  overallStatus: HealthStatus;
  calculatedAt: Date;

  categoryHealth: CategoryHealth[];

  // Key metrics
  totalChapters: number;
  completedChapters: number;
  totalWordCount: number;
  targetWordCount: number;
  totalCharacters: number;
  activeCharacters: number;

  // Progress percentages
  plotProgress: number;
  characterArcProgress: number;
  worldbuildingProgress: number;

  // Issue summary
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;

  // Trends
  healthTrend: 'improving' | 'stable' | 'declining';
  productionTrend: 'ahead' | 'on_track' | 'behind' | 'critical';
}

// ============================================================================
// Issue Tracking
// ============================================================================

export interface DashboardIssue {
  issueId: string;
  createdAt: Date;
  updatedAt: Date;

  // Classification
  category: HealthCategory;
  severity: IssueSeverity;
  priority: IssuePriority;
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix' | 'deferred';

  // Details
  title: string;
  description: string;
  affectedEntities: {
    type: 'chapter' | 'character' | 'plot' | 'location' | 'relationship' | 'power';
    id: string;
    name: string;
  }[];

  // Location
  detectedInChapter?: number;
  affectedChapterRange?: { start: number; end: number };

  // Source engine
  sourceEngine: string;
  autoDetected: boolean;

  // Resolution
  suggestedFixes: string[];
  resolvedAt?: Date;
  resolution?: string;
}

// ============================================================================
// Production Metrics
// ============================================================================

export interface ProductionMetrics {
  // Daily metrics
  dailySceneTarget: number;
  dailyScenesCompleted: number;
  dailySceneDeficit: number;

  dailyWordTarget: number;
  dailyWordsWritten: number;
  dailyWordDeficit: number;

  // Weekly metrics
  weeklySceneTarget: number;
  weeklyScenes: number;
  weeklyWords: number;

  // Monthly metrics
  monthlySceneTarget: number;
  monthlyScenes: number;
  monthlyWords: number;

  // Character-specific (per active character)
  characterMetrics: {
    characterId: string;
    characterName: string;
    dailyScenes: number;
    dailyTarget: number;
    meetsMinimum: boolean;
    consecutiveDaysBelow: number;
  }[];

  // Projections
  estimatedCompletionDate: Date | null;
  daysAhead: number;
  daysBehind: number;
  requiresRecovery: boolean;
  recoverySceneTarget: number;
}

// ============================================================================
// Progress Tracking
// ============================================================================

export interface ProgressSnapshot {
  snapshotId: string;
  takenAt: Date;

  // Chapters
  chaptersCompleted: number;
  chaptersInProgress: number;
  chaptersPending: number;

  // Words
  totalWords: number;
  wordsToday: number;
  wordsThisWeek: number;
  wordsThisMonth: number;

  // Arcs
  arcsCompleted: number;
  arcsInProgress: number;
  arcsPending: number;

  // Books
  booksCompleted: number;
  booksInProgress: number;
  booksPending: number;

  // Characters
  characterArcsCompleted: number;
  characterArcsInProgress: number;
  relationshipsEstablished: number;

  // Plot
  plotThreadsCompleted: number;
  plotThreadsActive: number;
  foreshadowingsPlanted: number;
  foreshadowingsResolved: number;

  // Quality
  averageChapterQuality: number;
  chaptersNeedingRevision: number;
}

// ============================================================================
// Alerts and Notifications
// ============================================================================

export interface DashboardAlert {
  alertId: string;
  createdAt: Date;
  expiresAt?: Date;

  alertType: 'info' | 'warning' | 'error' | 'critical';
  category: HealthCategory;

  title: string;
  message: string;
  actionRequired: boolean;
  suggestedAction?: string;

  dismissed: boolean;
  dismissedAt?: Date;

  relatedIssueId?: string;
}

// ============================================================================
// Engine Integration Interfaces
// ============================================================================

export interface EngineHealthReport {
  engineName: string;
  healthy: boolean;
  score: number;
  issueCount: number;
  lastUpdated: Date;
  metrics: Record<string, number | string>;
  issues: {
    severity: IssueSeverity;
    message: string;
    entityId?: string;
  }[];
}

export interface IntegratedEngine {
  engineId: string;
  engineName: string;
  engineType: string;
  getHealthReport: () => EngineHealthReport;
  getMetrics: () => Record<string, number | string>;
}

// ============================================================================
// Main Dashboard Class
// ============================================================================

export class ProjectDashboard {
  private projectId: string;
  private projectName: string;

  private issues: Map<string, DashboardIssue> = new Map();
  private alerts: Map<string, DashboardAlert> = new Map();
  private progressSnapshots: Map<string, ProgressSnapshot> = new Map();
  private categoryHealth: Map<HealthCategory, CategoryHealth> = new Map();

  // Registered engines
  private engines: Map<string, IntegratedEngine> = new Map();

  // Configuration
  private productionTargets = {
    dailyScenesPerCharacter: 299,
    minActiveCharacters: 5,
    dailyWordTarget: 1196000,
    weeklyWordTarget: 8372000,
    monthlyWordTarget: 35880000,
  };

  // Indexes
  private issuesByCategory: Map<HealthCategory, string[]> = new Map();
  private issuesBySeverity: Map<IssueSeverity, string[]> = new Map();
  private openIssues: Set<string> = new Set();
  private activeAlerts: Set<string> = new Set();

  // History
  private healthHistory: { date: Date; score: number }[] = [];

  constructor(projectId: string, projectName: string) {
    this.projectId = projectId;
    this.projectName = projectName;
    this.initializeCategories();
  }

  private initializeCategories(): void {
    for (const category of Object.values(HealthCategory)) {
      this.categoryHealth.set(category, {
        category,
        health: {
          score: 100,
          status: HealthStatus.EXCELLENT,
          trend: 'stable',
          lastUpdated: new Date(),
        },
        subCategories: [],
        topIssues: [],
      });
      this.issuesByCategory.set(category, []);
    }

    for (const severity of Object.values(IssueSeverity)) {
      this.issuesBySeverity.set(severity, []);
    }
  }

  // ============================================================================
  // Engine Registration
  // ============================================================================

  registerEngine(engine: IntegratedEngine): void {
    this.engines.set(engine.engineId, engine);
  }

  unregisterEngine(engineId: string): void {
    this.engines.delete(engineId);
  }

  // ============================================================================
  // Issue Management
  // ============================================================================

  createIssue(
    category: HealthCategory,
    severity: IssueSeverity,
    title: string,
    description: string,
    sourceEngine: string,
    options: Partial<{
      priority: IssuePriority;
      affectedEntities: DashboardIssue['affectedEntities'];
      detectedInChapter: number;
      affectedChapterRange: { start: number; end: number };
      suggestedFixes: string[];
      autoDetected: boolean;
    }> = {}
  ): DashboardIssue {
    const issueId = uuidv4();
    const now = new Date();

    const issue: DashboardIssue = {
      issueId,
      createdAt: now,
      updatedAt: now,
      category,
      severity,
      priority: options.priority || this.derivePriority(severity),
      status: 'open',
      title,
      description,
      affectedEntities: options.affectedEntities || [],
      detectedInChapter: options.detectedInChapter,
      affectedChapterRange: options.affectedChapterRange,
      sourceEngine,
      autoDetected: options.autoDetected ?? true,
      suggestedFixes: options.suggestedFixes || [],
    };

    this.issues.set(issueId, issue);
    this.openIssues.add(issueId);

    // Update indexes
    this.issuesByCategory.get(category)?.push(issueId);
    this.issuesBySeverity.get(severity)?.push(issueId);

    // Update category health
    this.recalculateCategoryHealth(category);

    // Generate alert for critical/high issues
    if (severity === IssueSeverity.CRITICAL || severity === IssueSeverity.HIGH) {
      this.createAlertFromIssue(issue);
    }

    return issue;
  }

  private derivePriority(severity: IssueSeverity): IssuePriority {
    const mapping: Record<IssueSeverity, IssuePriority> = {
      [IssueSeverity.CRITICAL]: IssuePriority.BLOCKING,
      [IssueSeverity.HIGH]: IssuePriority.HIGH,
      [IssueSeverity.MEDIUM]: IssuePriority.MEDIUM,
      [IssueSeverity.LOW]: IssuePriority.LOW,
      [IssueSeverity.INFO]: IssuePriority.BACKLOG,
    };
    return mapping[severity];
  }

  resolveIssue(issueId: string, resolution: string): void {
    const issue = this.issues.get(issueId);
    if (!issue) {
      throw new Error(`Issue not found: ${issueId}`);
    }

    issue.status = 'resolved';
    issue.resolvedAt = new Date();
    issue.resolution = resolution;
    issue.updatedAt = new Date();

    this.openIssues.delete(issueId);
    this.recalculateCategoryHealth(issue.category);
  }

  updateIssuePriority(issueId: string, priority: IssuePriority): void {
    const issue = this.issues.get(issueId);
    if (!issue) {
      throw new Error(`Issue not found: ${issueId}`);
    }

    issue.priority = priority;
    issue.updatedAt = new Date();
  }

  getIssue(issueId: string): DashboardIssue | undefined {
    return this.issues.get(issueId);
  }

  getOpenIssues(): DashboardIssue[] {
    return Array.from(this.openIssues)
      .map(id => this.issues.get(id))
      .filter((i): i is DashboardIssue => i !== undefined)
      .sort((a, b) => {
        const priorityOrder: Record<IssuePriority, number> = {
          [IssuePriority.BLOCKING]: 0,
          [IssuePriority.URGENT]: 1,
          [IssuePriority.HIGH]: 2,
          [IssuePriority.MEDIUM]: 3,
          [IssuePriority.LOW]: 4,
          [IssuePriority.BACKLOG]: 5,
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  getIssuesByCategory(category: HealthCategory): DashboardIssue[] {
    const ids = this.issuesByCategory.get(category) || [];
    return ids
      .map(id => this.issues.get(id))
      .filter((i): i is DashboardIssue => i !== undefined && i.status === 'open');
  }

  getIssuesBySeverity(severity: IssueSeverity): DashboardIssue[] {
    const ids = this.issuesBySeverity.get(severity) || [];
    return ids
      .map(id => this.issues.get(id))
      .filter((i): i is DashboardIssue => i !== undefined && i.status === 'open');
  }

  // ============================================================================
  // Alert Management
  // ============================================================================

  createAlert(
    alertType: DashboardAlert['alertType'],
    category: HealthCategory,
    title: string,
    message: string,
    options: Partial<{
      actionRequired: boolean;
      suggestedAction: string;
      expiresAt: Date;
      relatedIssueId: string;
    }> = {}
  ): DashboardAlert {
    const alertId = uuidv4();

    const alert: DashboardAlert = {
      alertId,
      createdAt: new Date(),
      expiresAt: options.expiresAt,
      alertType,
      category,
      title,
      message,
      actionRequired: options.actionRequired ?? (alertType === 'critical' || alertType === 'error'),
      suggestedAction: options.suggestedAction,
      dismissed: false,
      relatedIssueId: options.relatedIssueId,
    };

    this.alerts.set(alertId, alert);
    this.activeAlerts.add(alertId);

    return alert;
  }

  private createAlertFromIssue(issue: DashboardIssue): void {
    this.createAlert(
      issue.severity === IssueSeverity.CRITICAL ? 'critical' : 'error',
      issue.category,
      issue.title,
      issue.description,
      {
        actionRequired: true,
        suggestedAction: issue.suggestedFixes[0],
        relatedIssueId: issue.issueId,
      }
    );
  }

  dismissAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.dismissed = true;
      alert.dismissedAt = new Date();
      this.activeAlerts.delete(alertId);
    }
  }

  getActiveAlerts(): DashboardAlert[] {
    const now = new Date();
    return Array.from(this.activeAlerts)
      .map(id => this.alerts.get(id))
      .filter((a): a is DashboardAlert => {
        if (!a) return false;
        if (a.dismissed) return false;
        if (a.expiresAt && a.expiresAt < now) return false;
        return true;
      })
      .sort((a, b) => {
        const typeOrder = { critical: 0, error: 1, warning: 2, info: 3 };
        return typeOrder[a.alertType] - typeOrder[b.alertType];
      });
  }

  // ============================================================================
  // Health Calculation
  // ============================================================================

  private recalculateCategoryHealth(category: HealthCategory): void {
    const categoryData = this.categoryHealth.get(category);
    if (!categoryData) return;

    const openIssues = this.getIssuesByCategory(category);

    // Calculate score based on issue severity
    let deductions = 0;
    for (const issue of openIssues) {
      switch (issue.severity) {
        case IssueSeverity.CRITICAL: deductions += 25; break;
        case IssueSeverity.HIGH: deductions += 15; break;
        case IssueSeverity.MEDIUM: deductions += 8; break;
        case IssueSeverity.LOW: deductions += 3; break;
        case IssueSeverity.INFO: deductions += 1; break;
      }
    }

    const score = Math.max(0, 100 - deductions);

    categoryData.health = {
      score,
      status: this.getStatusFromScore(score),
      trend: this.calculateTrend(category, score),
      lastUpdated: new Date(),
    };

    categoryData.topIssues = openIssues.slice(0, 5);
  }

  private getStatusFromScore(score: number): HealthStatus {
    if (score >= 90) return HealthStatus.EXCELLENT;
    if (score >= 75) return HealthStatus.GOOD;
    if (score >= 60) return HealthStatus.FAIR;
    if (score >= 40) return HealthStatus.WARNING;
    return HealthStatus.CRITICAL;
  }

  private calculateTrend(
    _category: HealthCategory,
    _currentScore: number
  ): 'improving' | 'stable' | 'declining' {
    // Check recent history
    const recentHistory = this.healthHistory.slice(-10);
    if (recentHistory.length < 2) return 'stable';

    const avgRecent = recentHistory.slice(-5).reduce((sum, h) => sum + h.score, 0) / 5;
    const avgOlder = recentHistory.slice(0, 5).reduce((sum, h) => sum + h.score, 0) / 5;

    const diff = avgRecent - avgOlder;
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  calculateOverallHealth(): OverallHealth {
    // Recalculate all categories
    for (const category of Object.values(HealthCategory)) {
      this.recalculateCategoryHealth(category);
    }

    // Calculate weighted overall score
    const weights: Record<HealthCategory, number> = {
      [HealthCategory.PLOT]: 0.15,
      [HealthCategory.CHARACTER]: 0.15,
      [HealthCategory.CONSISTENCY]: 0.15,
      [HealthCategory.QUALITY]: 0.12,
      [HealthCategory.PACING]: 0.10,
      [HealthCategory.RELATIONSHIPS]: 0.08,
      [HealthCategory.WORLD]: 0.08,
      [HealthCategory.PRODUCTION]: 0.07,
      [HealthCategory.POWER_SYSTEMS]: 0.05,
      [HealthCategory.TIMELINE]: 0.05,
    };

    let overallScore = 0;
    const categoryHealthArray: CategoryHealth[] = [];

    for (const [category, data] of this.categoryHealth) {
      overallScore += data.health.score * (weights[category] || 0.1);
      categoryHealthArray.push(data);
    }

    // Record history
    this.healthHistory.push({ date: new Date(), score: overallScore });
    if (this.healthHistory.length > 100) {
      this.healthHistory.shift();
    }

    // Get issue counts
    const openIssuesList = this.getOpenIssues();
    const criticalCount = openIssuesList.filter(i => i.severity === IssueSeverity.CRITICAL).length;
    const highCount = openIssuesList.filter(i => i.severity === IssueSeverity.HIGH).length;
    const mediumCount = openIssuesList.filter(i => i.severity === IssueSeverity.MEDIUM).length;

    // Aggregate engine metrics
    let totalChapters = 0;
    let completedChapters = 0;
    let totalWordCount = 0;
    let totalCharacters = 0;
    let activeCharacters = 0;

    for (const engine of this.engines.values()) {
      try {
        const metrics = engine.getMetrics();
        totalChapters += Number(metrics.totalChapters) || 0;
        completedChapters += Number(metrics.completedChapters) || 0;
        totalWordCount += Number(metrics.totalWordCount) || 0;
        totalCharacters += Number(metrics.totalCharacters) || 0;
        activeCharacters += Number(metrics.activeCharacters) || 0;
      } catch {
        // Engine metrics not available
      }
    }

    return {
      projectId: this.projectId,
      projectName: this.projectName,
      overallScore: Math.round(overallScore),
      overallStatus: this.getStatusFromScore(overallScore),
      calculatedAt: new Date(),
      categoryHealth: categoryHealthArray,
      totalChapters,
      completedChapters,
      totalWordCount,
      targetWordCount: 300000000, // 300M words
      totalCharacters,
      activeCharacters,
      plotProgress: completedChapters > 0 ? (completedChapters / Math.max(totalChapters, 1)) * 100 : 0,
      characterArcProgress: 0, // Would be calculated from character engine
      worldbuildingProgress: 0, // Would be calculated from world engine
      totalIssues: openIssuesList.length,
      criticalIssues: criticalCount,
      highIssues: highCount,
      mediumIssues: mediumCount,
      healthTrend: this.calculateTrend(HealthCategory.PLOT, overallScore),
      productionTrend: this.calculateProductionTrend(),
    };
  }

  private calculateProductionTrend(): 'ahead' | 'on_track' | 'behind' | 'critical' {
    // This would integrate with WritingGenerationEngine
    // For now, return based on issue count
    const prodIssues = this.getIssuesByCategory(HealthCategory.PRODUCTION);
    const criticalProd = prodIssues.filter(i => i.severity === IssueSeverity.CRITICAL).length;
    const highProd = prodIssues.filter(i => i.severity === IssueSeverity.HIGH).length;

    if (criticalProd > 0) return 'critical';
    if (highProd > 2) return 'behind';
    if (highProd > 0) return 'on_track';
    return 'ahead';
  }

  // ============================================================================
  // Progress Snapshots
  // ============================================================================

  takeProgressSnapshot(): ProgressSnapshot {
    const snapshotId = uuidv4();

    // Aggregate from engines
    let chaptersCompleted = 0;
    let chaptersInProgress = 0;
    let totalWords = 0;
    let characterArcsCompleted = 0;
    let plotThreadsActive = 0;

    for (const engine of this.engines.values()) {
      try {
        const metrics = engine.getMetrics();
        chaptersCompleted += Number(metrics.chaptersCompleted) || 0;
        chaptersInProgress += Number(metrics.chaptersInProgress) || 0;
        totalWords += Number(metrics.totalWordCount) || 0;
        characterArcsCompleted += Number(metrics.characterArcsCompleted) || 0;
        plotThreadsActive += Number(metrics.activeThreads) || 0;
      } catch {
        // Engine not available
      }
    }

    const snapshot: ProgressSnapshot = {
      snapshotId,
      takenAt: new Date(),
      chaptersCompleted,
      chaptersInProgress,
      chaptersPending: Math.max(0, 12008 - chaptersCompleted - chaptersInProgress),
      totalWords,
      wordsToday: 0, // Would track from writing engine
      wordsThisWeek: 0,
      wordsThisMonth: 0,
      arcsCompleted: 0,
      arcsInProgress: 0,
      arcsPending: 0,
      booksCompleted: 0,
      booksInProgress: 0,
      booksPending: 0,
      characterArcsCompleted,
      characterArcsInProgress: 0,
      relationshipsEstablished: 0,
      plotThreadsCompleted: 0,
      plotThreadsActive,
      foreshadowingsPlanted: 0,
      foreshadowingsResolved: 0,
      averageChapterQuality: 0,
      chaptersNeedingRevision: 0,
    };

    this.progressSnapshots.set(snapshotId, snapshot);
    return snapshot;
  }

  getLatestSnapshot(): ProgressSnapshot | undefined {
    let latest: ProgressSnapshot | undefined;
    let latestDate: Date | undefined;

    for (const snapshot of this.progressSnapshots.values()) {
      if (!latestDate || snapshot.takenAt > latestDate) {
        latest = snapshot;
        latestDate = snapshot.takenAt;
      }
    }

    return latest;
  }

  getSnapshotHistory(limit: number = 30): ProgressSnapshot[] {
    return Array.from(this.progressSnapshots.values())
      .sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime())
      .slice(0, limit);
  }

  // ============================================================================
  // Production Metrics
  // ============================================================================

  getProductionMetrics(characterMetricsInput?: ProductionMetrics['characterMetrics']): ProductionMetrics {
    const { dailyScenesPerCharacter, minActiveCharacters, dailyWordTarget } = this.productionTargets;

    // Default character metrics if not provided
    const characterMetrics = characterMetricsInput || [];

    const dailyScenesCompleted = characterMetrics.reduce((sum, c) => sum + c.dailyScenes, 0);
    const dailySceneTarget = dailyScenesPerCharacter * Math.max(characterMetrics.length, minActiveCharacters);

    // Calculate words (assuming avg 800 words/scene)
    const avgWordsPerScene = 800;
    const dailyWordsWritten = dailyScenesCompleted * avgWordsPerScene;

    // Check if any characters are below target
    const requiresRecovery = characterMetrics.some(c => c.consecutiveDaysBelow >= 2);

    // Recovery target: 150% for each day behind
    const deficitScenes = characterMetrics
      .filter(c => !c.meetsMinimum)
      .reduce((sum, c) => sum + (c.dailyTarget - c.dailyScenes), 0);

    return {
      dailySceneTarget,
      dailyScenesCompleted,
      dailySceneDeficit: Math.max(0, dailySceneTarget - dailyScenesCompleted),
      dailyWordTarget,
      dailyWordsWritten,
      dailyWordDeficit: Math.max(0, dailyWordTarget - dailyWordsWritten),
      weeklySceneTarget: dailySceneTarget * 7,
      weeklyScenes: dailyScenesCompleted * 7, // Would track actual weekly
      weeklyWords: dailyWordsWritten * 7,
      monthlySceneTarget: dailySceneTarget * 30,
      monthlyScenes: dailyScenesCompleted * 30,
      monthlyWords: dailyWordsWritten * 30,
      characterMetrics,
      estimatedCompletionDate: this.estimateCompletion(dailyScenesCompleted),
      daysAhead: 0,
      daysBehind: Math.max(0, Math.floor((dailySceneTarget - dailyScenesCompleted) / dailySceneTarget)),
      requiresRecovery,
      recoverySceneTarget: Math.ceil(deficitScenes * 1.5) + dailySceneTarget,
    };
  }

  private estimateCompletion(dailyScenesCompleted: number): Date | null {
    if (dailyScenesCompleted <= 0) return null;

    // 2,401,600 total scenes for 12,008 chapters
    const totalScenesNeeded = 2401600;
    const daysRemaining = Math.ceil(totalScenesNeeded / dailyScenesCompleted);

    const completion = new Date();
    completion.setDate(completion.getDate() + daysRemaining);
    return completion;
  }

  // ============================================================================
  // Engine Health Aggregation
  // ============================================================================

  collectEngineReports(): EngineHealthReport[] {
    const reports: EngineHealthReport[] = [];

    for (const engine of this.engines.values()) {
      try {
        reports.push(engine.getHealthReport());
      } catch (error) {
        reports.push({
          engineName: engine.engineName,
          healthy: false,
          score: 0,
          issueCount: 1,
          lastUpdated: new Date(),
          metrics: {},
          issues: [{
            severity: IssueSeverity.HIGH,
            message: `Engine error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        });
      }
    }

    return reports;
  }

  syncIssuesFromEngines(): number {
    let issuesCreated = 0;

    for (const engine of this.engines.values()) {
      try {
        const report = engine.getHealthReport();

        for (const issue of report.issues) {
          // Determine category from engine type
          const category = this.mapEngineToCategory(engine.engineType);

          this.createIssue(
            category,
            issue.severity,
            `[${engine.engineName}] Issue Detected`,
            issue.message,
            engine.engineName,
            {
              autoDetected: true,
            }
          );

          issuesCreated++;
        }
      } catch {
        // Engine not available
      }
    }

    return issuesCreated;
  }

  private mapEngineToCategory(engineType: string): HealthCategory {
    const mapping: Record<string, HealthCategory> = {
      'plot': HealthCategory.PLOT,
      'narrative': HealthCategory.PLOT,
      'character': HealthCategory.CHARACTER,
      'world': HealthCategory.WORLD,
      'consistency': HealthCategory.CONSISTENCY,
      'quality': HealthCategory.QUALITY,
      'pacing': HealthCategory.PACING,
      'emotion': HealthCategory.PACING,
      'relationship': HealthCategory.RELATIONSHIPS,
      'magic': HealthCategory.POWER_SYSTEMS,
      'power': HealthCategory.POWER_SYSTEMS,
      'timeline': HealthCategory.TIMELINE,
      'series': HealthCategory.PLOT,
      'writing': HealthCategory.PRODUCTION,
      'generation': HealthCategory.PRODUCTION,
    };

    return mapping[engineType.toLowerCase()] ?? HealthCategory.CONSISTENCY;
  }

  // ============================================================================
  // Dashboard Views
  // ============================================================================

  getExecutiveSummary(): {
    health: OverallHealth;
    alerts: DashboardAlert[];
    topIssues: DashboardIssue[];
    production: ProductionMetrics;
    recommendation: string;
  } {
    const health = this.calculateOverallHealth();
    const alerts = this.getActiveAlerts();
    const topIssues = this.getOpenIssues().slice(0, 10);
    const production = this.getProductionMetrics();

    // Generate recommendation
    let recommendation = '';
    if (health.overallStatus === HealthStatus.CRITICAL) {
      recommendation = 'CRITICAL: Address blocking issues immediately. Focus on ' +
        topIssues.slice(0, 3).map(i => i.title).join(', ');
    } else if (health.overallStatus === HealthStatus.WARNING) {
      recommendation = 'WARNING: Several issues require attention. Prioritize ' +
        topIssues.slice(0, 2).map(i => i.title).join(' and ');
    } else if (production.requiresRecovery) {
      recommendation = `PRODUCTION: Behind schedule. Need ${production.recoverySceneTarget} scenes today for recovery.`;
    } else if (health.overallStatus === HealthStatus.GOOD) {
      recommendation = 'GOOD: Project is healthy. Continue current pace and address medium-priority issues.';
    } else {
      recommendation = 'EXCELLENT: Project is in great shape. Maintain momentum.';
    }

    return { health, alerts, topIssues, production, recommendation };
  }

  getCategoryDrilldown(category: HealthCategory): {
    categoryHealth: CategoryHealth | undefined;
    issues: DashboardIssue[];
    trends: { date: Date; score: number }[];
    engineReports: EngineHealthReport[];
  } {
    const categoryHealth = this.categoryHealth.get(category);
    const issues = this.getIssuesByCategory(category);

    // Filter engine reports to this category
    const engineReports = this.collectEngineReports()
      .filter(r => this.mapEngineToCategory(r.engineName) === category);

    return {
      categoryHealth,
      issues,
      trends: this.healthHistory.slice(-30),
      engineReports,
    };
  }

  // ============================================================================
  // Standard API Methods
  // ============================================================================

  getStats(): {
    projectId: string;
    projectName: string;
    totalIssues: number;
    openIssues: number;
    resolvedIssues: number;
    activeAlerts: number;
    registeredEngines: number;
    snapshotCount: number;
    lastHealthScore: number;
    healthTrend: string;
  } {
    const openCount = this.openIssues.size;
    const totalCount = this.issues.size;
    const lastHealth = this.healthHistory.length > 0
      ? this.healthHistory[this.healthHistory.length - 1].score
      : 100;

    return {
      projectId: this.projectId,
      projectName: this.projectName,
      totalIssues: totalCount,
      openIssues: openCount,
      resolvedIssues: totalCount - openCount,
      activeAlerts: this.activeAlerts.size,
      registeredEngines: this.engines.size,
      snapshotCount: this.progressSnapshots.size,
      lastHealthScore: Math.round(lastHealth),
      healthTrend: this.calculateTrend(HealthCategory.PLOT, lastHealth),
    };
  }

  clear(): void {
    this.issues.clear();
    this.alerts.clear();
    this.progressSnapshots.clear();
    this.openIssues.clear();
    this.activeAlerts.clear();
    this.healthHistory = [];
    this.initializeCategories();
    // Keep engines registered
  }

  exportToJSON(): string {
    return JSON.stringify({
      projectId: this.projectId,
      projectName: this.projectName,
      issues: Array.from(this.issues.entries()),
      alerts: Array.from(this.alerts.entries()),
      progressSnapshots: Array.from(this.progressSnapshots.entries()),
      healthHistory: this.healthHistory,
      productionTargets: this.productionTargets,
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.projectId = data.projectId;
    this.projectName = data.projectName;
    this.issues = new Map(data.issues);
    this.alerts = new Map(data.alerts);
    this.progressSnapshots = new Map(data.progressSnapshots);
    this.healthHistory = data.healthHistory;
    this.productionTargets = data.productionTargets;

    // Rebuild indexes
    this.openIssues.clear();
    this.activeAlerts.clear();
    this.initializeCategories();

    for (const [id, issue] of this.issues) {
      if (issue.status === 'open') {
        this.openIssues.add(id);
      }
      this.issuesByCategory.get(issue.category)?.push(id);
      this.issuesBySeverity.get(issue.severity)?.push(id);
    }

    for (const [id, alert] of this.alerts) {
      if (!alert.dismissed) {
        this.activeAlerts.add(id);
      }
    }
  }
}

// ============================================================================
// Export
// ============================================================================

export default ProjectDashboard;
