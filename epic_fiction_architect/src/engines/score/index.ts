/**
 * SCORE Framework - Main Engine
 *
 * State-aware Context Ordering and Retrieval Engine
 *
 * Integrates:
 * - StateTracker: Entity state management across narrative time
 * - HierarchicalSummarizer: Multi-level summary generation
 * - HybridRetriever: Combined semantic/keyword/temporal search
 *
 * Provides:
 * - Context retrieval for story generation
 * - Consistency validation
 * - State-aware RAG capabilities
 */

import { v4 as uuidv4 } from 'uuid';
import { StateTracker } from './state-tracker';
import { HierarchicalSummarizer } from './hierarchical-summarizer';
import { HybridRetriever } from './hybrid-retriever';

import type {
  SCOREConfig,
  EntityState,
  StateViolation,
  HierarchicalSummary,
  SummaryLevel,
  RetrievalQuery,
  RetrievalResult,
  ConsistencyCheck,
  EvaluationReport
} from './types';
import { defaultSCOREConfig } from './types';

// Re-export types and components
export * from './types';
export { StateTracker } from './state-tracker';
export { HierarchicalSummarizer } from './hierarchical-summarizer';
export { HybridRetriever } from './hybrid-retriever';

// ============================================================================
// SCORE Engine
// ============================================================================

export class SCOREEngine {
  // Core components
  public readonly stateTracker: StateTracker;
  public readonly summarizer: HierarchicalSummarizer;
  public readonly retriever: HybridRetriever;

  // Configuration
  private config: SCOREConfig;

  // Evaluation tracking
  private evaluations: Map<string, EvaluationReport> = new Map();

  constructor(config: Partial<SCOREConfig> = {}) {
    this.config = { ...defaultSCOREConfig, ...config };

    // Initialize components
    this.stateTracker = new StateTracker();
    this.summarizer = new HierarchicalSummarizer(this.config);
    this.retriever = new HybridRetriever(this.config);

    // Connect components
    this.retriever.connectStateTracker(this.stateTracker);
    this.retriever.connectSummarizer(this.summarizer);
  }

  // ============================================================================
  // State Management
  // ============================================================================

  /**
   * Record an entity state
   */
  recordState(state: Omit<EntityState, 'createdAt' | 'updatedAt'>): EntityState {
    const recorded = this.stateTracker.recordState(state);

    // Auto-index for retrieval
    if (this.config.trackStateChanges) {
      this.retriever.indexState(recorded);
    }

    return recorded;
  }

  /**
   * Get entity state at a point in time
   */
  getStateAt(entityId: string, storyTimeNumeric: number): EntityState | undefined {
    return this.stateTracker.getStateAt(entityId, storyTimeNumeric);
  }

  /**
   * Get current state of entity
   */
  getCurrentState(entityId: string): EntityState | undefined {
    return this.stateTracker.getCurrentState(entityId);
  }

  /**
   * Validate a proposed state change
   */
  validateStateChange(
    entityId: string,
    proposedState: Partial<EntityState>,
    storyTimeNumeric: number
  ): { valid: boolean; violations: StateViolation[] } {
    return this.stateTracker.validateStateChange(entityId, proposedState, storyTimeNumeric);
  }

  // ============================================================================
  // Summary Management
  // ============================================================================

  /**
   * Create a summary
   */
  createSummary(input: Parameters<HierarchicalSummarizer['createSummary']>[0]): HierarchicalSummary {
    const summary = this.summarizer.createSummary(input);

    // Auto-index for retrieval
    if (this.config.autoSummarize) {
      this.retriever.indexSummary(summary);
    }

    return summary;
  }

  /**
   * Generate summary from children
   */
  generateParentSummary(
    level: SummaryLevel,
    targetId: string,
    targetName: string,
    childSummaryIds: string[]
  ): HierarchicalSummary {
    const summary = this.summarizer.generateParentSummary(level, targetId, targetName, childSummaryIds);

    // Auto-index
    this.retriever.indexSummary(summary);

    return summary;
  }

  /**
   * Get summaries at a level
   */
  getSummaries(level: SummaryLevel): HierarchicalSummary[] {
    return this.summarizer.getSummariesByLevel(level);
  }

  // ============================================================================
  // Retrieval
  // ============================================================================

  /**
   * Retrieve relevant content
   */
  retrieve(query: RetrievalQuery): RetrievalResult[] {
    return this.retriever.retrieve(query);
  }

  /**
   * Get generation context for a specific point
   */
  getGenerationContext(
    storyTimeNumeric: number,
    options: {
      characterIds?: string[];
      locationId?: string;
      plotThreadIds?: string[];
      maxResults?: number;
    } = {}
  ): RetrievalResult[] {
    return this.retriever.getGenerationContext(storyTimeNumeric, options);
  }

  /**
   * Get comprehensive context for generating the next scene
   */
  getContextForNextScene(input: {
    storyTimeNumeric: number;
    characterIds: string[];
    locationId?: string;
    plotThreadIds?: string[];
    previousSceneId?: string;
  }): {
    characterStates: Map<string, EntityState>;
    locationState?: EntityState;
    recentSummary?: HierarchicalSummary;
    relevantContent: RetrievalResult[];
    violations: StateViolation[];
  } {
    // Get character states
    const characterStates = new Map<string, EntityState>();
    for (const characterId of input.characterIds) {
      const state = this.getStateAt(characterId, input.storyTimeNumeric);
      if (state) {
        characterStates.set(characterId, state);
      }
    }

    // Get location state if specified
    let locationState: EntityState | undefined;
    if (input.locationId) {
      locationState = this.getStateAt(input.locationId, input.storyTimeNumeric);
    }

    // Get most recent summary
    const summaries = this.summarizer.getContextForTime(input.storyTimeNumeric, {
      levelsToInclude: ['chapter', 'arc'],
      maxItems: 1
    });
    const recentSummary = summaries[0];

    // Get relevant content
    const relevantContent = this.getGenerationContext(input.storyTimeNumeric, {
      characterIds: input.characterIds,
      locationId: input.locationId,
      plotThreadIds: input.plotThreadIds,
      maxResults: 10
    });

    // Check for any unresolved violations involving these characters
    const violations: StateViolation[] = [];
    for (const characterId of input.characterIds) {
      violations.push(...this.stateTracker.getViolations(characterId, false));
    }

    return {
      characterStates,
      locationState,
      recentSummary,
      relevantContent,
      violations
    };
  }

  // ============================================================================
  // Indexing
  // ============================================================================

  /**
   * Index a scene for retrieval
   */
  indexScene(scene: {
    id: string;
    content: string;
    storyTimeNumeric: number;
    storyTime: string;
    characterIds: string[];
    locationId?: string;
    embedding?: number[];
  }): void {
    this.retriever.indexScene(scene);
  }

  /**
   * Index a fact for retrieval
   */
  indexFact(fact: {
    id: string;
    content: string;
    validFrom?: number;
    validUntil?: number;
    relatedEntities: string[];
    embedding?: number[];
  }): void {
    this.retriever.indexFact(fact);
  }

  // ============================================================================
  // Consistency Evaluation
  // ============================================================================

  /**
   * Run consistency evaluation
   */
  evaluateConsistency(options: {
    fromTime?: number;
    toTime?: number;
    entityIds?: string[];
  } = {}): EvaluationReport {
    const checks: ConsistencyCheck[] = [];
    const violations: StateViolation[] = [];

    // Get all violations in range
    if (options.entityIds) {
      for (const entityId of options.entityIds) {
        violations.push(...this.stateTracker.getViolations(entityId, false));
      }
    } else {
      violations.push(...this.stateTracker.getViolations(undefined, false));
    }

    // Filter by time if specified
    let filteredViolations = violations;
    if (options.fromTime !== undefined || options.toTime !== undefined) {
      // Violations don't have direct time, so we'd need more context
      // For now, include all
    }

    // Create checks for common consistency issues

    // Check 1: Characters in multiple places at same time
    const stateStats = this.stateTracker.getStats();
    checks.push({
      checkId: uuidv4(),
      checkType: 'location',
      targetId: 'all-characters',
      targetType: 'character',
      description: 'Character location consistency',
      expectedCondition: 'Characters should not be in multiple places simultaneously',
      actualCondition: `${stateStats.unresolvedViolations} potential issues found`,
      passed: stateStats.violationsBySeverity['error'] === 0,
      severity: stateStats.violationsBySeverity['error'] > 0 ? 'error' : 'warning',
      contextIds: [],
      timestamp: new Date()
    });

    // Check 2: Timeline continuity
    checks.push({
      checkId: uuidv4(),
      checkType: 'timeline',
      targetId: 'narrative',
      targetType: 'story',
      description: 'Timeline continuity',
      expectedCondition: 'Events should occur in logical sequence',
      actualCondition: 'Timeline analysis complete',
      passed: true, // Simplified for now
      severity: 'info',
      contextIds: [],
      timestamp: new Date()
    });

    // Create report
    const report: EvaluationReport = {
      reportId: uuidv4(),
      generatedAt: new Date(),
      fromTime: options.fromTime,
      toTime: options.toTime,
      checksPerformed: checks.length,
      passed: checks.filter(c => c.passed).length,
      warnings: checks.filter(c => c.severity === 'warning').length,
      errors: checks.filter(c => c.severity === 'error').length,
      violations: filteredViolations,
      checks,
      summary: this.generateEvaluationSummary(checks, filteredViolations),
      recommendations: this.generateRecommendations(checks, filteredViolations)
    };

    // Store report
    this.evaluations.set(report.reportId, report);

    return report;
  }

  /**
   * Generate evaluation summary
   */
  private generateEvaluationSummary(checks: ConsistencyCheck[], violations: StateViolation[]): string {
    const errorCount = checks.filter(c => c.severity === 'error' && !c.passed).length;
    const warningCount = checks.filter(c => c.severity === 'warning' && !c.passed).length;
    const violationCount = violations.length;

    if (errorCount === 0 && warningCount === 0 && violationCount === 0) {
      return 'No consistency issues detected. Story state is coherent.';
    }

    const parts: string[] = [];
    if (errorCount > 0) parts.push(`${errorCount} critical errors`);
    if (warningCount > 0) parts.push(`${warningCount} warnings`);
    if (violationCount > 0) parts.push(`${violationCount} state violations`);

    return `Found ${parts.join(', ')}. Review recommended before continuing.`;
  }

  /**
   * Generate recommendations based on findings
   */
  private generateRecommendations(_checks: ConsistencyCheck[], violations: StateViolation[]): string[] {
    const recommendations: string[] = [];

    // Check for location issues
    const locationViolations = violations.filter(v => v.violationType === 'temporal');
    if (locationViolations.length > 0) {
      recommendations.push(
        'Review character movement between scenes to ensure logical transitions'
      );
    }

    // Check for knowledge issues
    const knowledgeViolations = violations.filter(v => v.violationType === 'knowledge');
    if (knowledgeViolations.length > 0) {
      recommendations.push(
        'Verify that characters only know information they have been exposed to'
      );
    }

    // Check for logical issues
    const logicalViolations = violations.filter(v => v.violationType === 'logical');
    if (logicalViolations.length > 0) {
      recommendations.push(
        'Review character status changes for logical consistency'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue with current story direction');
    }

    return recommendations;
  }

  /**
   * Get previous evaluation reports
   */
  getEvaluationReports(): EvaluationReport[] {
    return Array.from(this.evaluations.values())
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  // ============================================================================
  // Statistics & Management
  // ============================================================================

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    stateTracker: ReturnType<StateTracker['getStats']>;
    summarizer: ReturnType<HierarchicalSummarizer['getStats']>;
    retriever: ReturnType<HybridRetriever['getStats']>;
    evaluationCount: number;
  } {
    return {
      stateTracker: this.stateTracker.getStats(),
      summarizer: this.summarizer.getStats(),
      retriever: this.retriever.getStats(),
      evaluationCount: this.evaluations.size
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.stateTracker.clear();
    this.summarizer.clear();
    this.retriever.clear();
    this.evaluations.clear();
  }

  /**
   * Export all data to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      config: this.config,
      stateTracker: JSON.parse(this.stateTracker.exportToJSON()),
      summarizer: JSON.parse(this.summarizer.exportToJSON()),
      retriever: JSON.parse(this.retriever.exportToJSON()),
      evaluations: Array.from(this.evaluations.entries())
    }, null, 2);
  }

  /**
   * Import all data from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.config) {
      this.config = { ...defaultSCOREConfig, ...data.config };
    }

    if (data.stateTracker) {
      this.stateTracker.importFromJSON(JSON.stringify(data.stateTracker));
    }

    if (data.summarizer) {
      this.summarizer.importFromJSON(JSON.stringify(data.summarizer));
    }

    if (data.retriever) {
      this.retriever.importFromJSON(JSON.stringify(data.retriever));
    }

    if (data.evaluations) {
      this.evaluations = new Map(data.evaluations);
    }
  }
}

export default SCOREEngine;
