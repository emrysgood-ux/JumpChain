/**
 * WHAT-IF Branching Engine
 *
 * Enables exploration of alternative narrative paths:
 * - Create branch points at key decision moments
 * - Define alternative paths with their consequences
 * - Compare timelines to see how stories diverge
 * - Track exploration sessions for "what if" scenarios
 *
 * Useful for:
 * - Plotting: Exploring different story directions
 * - Character studies: How would they react differently?
 * - Worldbuilding: Testing consistency of world rules
 * - Reader engagement: "Choose your adventure" possibilities
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  BranchPoint,
  BranchPointType,
  Alternative,
  AlternativeStatus,
  Consequence,
  ConsequenceType,
  TimelineComparison,
  TimelineDifference,
  ExplorationSession,
  WhatIfConfig
} from './types';
import { defaultWhatIfConfig } from './types';

// Re-export types
export * from './types';

// ============================================================================
// WHAT-IF Engine
// ============================================================================

export class WhatIfEngine {
  // Storage
  private branchPoints: Map<string, BranchPoint> = new Map();
  private alternatives: Map<string, Alternative> = new Map();
  private consequences: Map<string, Consequence> = new Map();
  private comparisons: Map<string, TimelineComparison> = new Map();
  private sessions: Map<string, ExplorationSession> = new Map();

  // Indexes
  private branchPointsByTime: Map<number, string[]> = new Map();
  private alternativesByBranch: Map<string, string[]> = new Map();
  private consequencesByAlternative: Map<string, string[]> = new Map();

  // Configuration
  private config: WhatIfConfig;

  constructor(config: Partial<WhatIfConfig> = {}) {
    this.config = { ...defaultWhatIfConfig, ...config };
  }

  // ============================================================================
  // Branch Point Management
  // ============================================================================

  /**
   * Create a new branch point
   */
  createBranchPoint(input: {
    branchType: BranchPointType;
    storyTime: number;
    storyTimeLabel: string;
    title: string;
    description: string;
    involvedCharacterIds: string[];
    involvedLocationIds?: string[];
    impactLevel?: 'minor' | 'moderate' | 'major' | 'critical';
    narrativeWeight?: number;
    chapterId?: string;
    sceneId?: string;
    notes?: string;
    createdBy?: string;
  }): BranchPoint {
    const branchPoint: BranchPoint = {
      branchPointId: uuidv4(),
      branchType: input.branchType,
      storyTime: input.storyTime,
      storyTimeLabel: input.storyTimeLabel,
      title: input.title,
      description: input.description,
      canonicalAlternativeId: '', // Will be set when canonical alternative is added
      alternativeIds: [],
      involvedCharacterIds: input.involvedCharacterIds,
      involvedLocationIds: input.involvedLocationIds,
      impactLevel: input.impactLevel || 'moderate',
      narrativeWeight: input.narrativeWeight ?? 0.5,
      chapterId: input.chapterId,
      sceneId: input.sceneId,
      notes: input.notes,
      createdBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store
    this.branchPoints.set(branchPoint.branchPointId, branchPoint);

    // Index by time
    if (!this.branchPointsByTime.has(input.storyTime)) {
      this.branchPointsByTime.set(input.storyTime, []);
    }
    this.branchPointsByTime.get(input.storyTime)!.push(branchPoint.branchPointId);

    // Initialize alternatives index
    this.alternativesByBranch.set(branchPoint.branchPointId, []);

    return branchPoint;
  }

  /**
   * Get a branch point by ID
   */
  getBranchPoint(branchPointId: string): BranchPoint | undefined {
    return this.branchPoints.get(branchPointId);
  }

  /**
   * Get all branch points
   */
  getAllBranchPoints(): BranchPoint[] {
    return Array.from(this.branchPoints.values())
      .sort((a, b) => a.storyTime - b.storyTime);
  }

  /**
   * Get branch points at a specific time
   */
  getBranchPointsAtTime(storyTime: number): BranchPoint[] {
    const ids = this.branchPointsByTime.get(storyTime) || [];
    return ids
      .map(id => this.branchPoints.get(id))
      .filter((bp): bp is BranchPoint => bp !== undefined);
  }

  /**
   * Get branch points in a time range
   */
  getBranchPointsInRange(fromTime: number, toTime: number): BranchPoint[] {
    return Array.from(this.branchPoints.values())
      .filter(bp => bp.storyTime >= fromTime && bp.storyTime <= toTime)
      .sort((a, b) => a.storyTime - b.storyTime);
  }

  /**
   * Update a branch point
   */
  updateBranchPoint(
    branchPointId: string,
    updates: Partial<Omit<BranchPoint, 'branchPointId' | 'createdAt'>>
  ): BranchPoint | undefined {
    const branchPoint = this.branchPoints.get(branchPointId);
    if (!branchPoint) return undefined;

    Object.assign(branchPoint, updates, { updatedAt: new Date() });
    return branchPoint;
  }

  // ============================================================================
  // Alternative Management
  // ============================================================================

  /**
   * Add an alternative to a branch point
   */
  addAlternative(input: {
    branchPointId: string;
    title: string;
    description: string;
    summary: string;
    triggerDescription: string;
    isCanonical?: boolean;
    status?: AlternativeStatus;
    prerequisites?: string[];
    plausibility?: number;
    immediateConsequences?: string[];
    longTermConsequences?: string[];
    characterImpacts?: { characterId: string; characterName: string; impact: string }[];
  }): Alternative {
    const branchPoint = this.branchPoints.get(input.branchPointId);
    if (!branchPoint) {
      throw new Error(`Branch point not found: ${input.branchPointId}`);
    }

    // Check max alternatives
    if (branchPoint.alternativeIds.length >= this.config.maxAlternativesPerBranch) {
      throw new Error(`Maximum alternatives (${this.config.maxAlternativesPerBranch}) reached for this branch point`);
    }

    // Check plausibility
    if (this.config.requirePlausibilityScore) {
      const plausibility = input.plausibility ?? 0.5;
      if (plausibility < this.config.minPlausibility) {
        throw new Error(`Plausibility ${plausibility} is below minimum ${this.config.minPlausibility}`);
      }
    }

    const isCanonical = input.isCanonical ?? false;
    const status: AlternativeStatus = isCanonical ? 'canonical' : (input.status || 'proposed');

    const alternative: Alternative = {
      alternativeId: uuidv4(),
      branchPointId: input.branchPointId,
      title: input.title,
      description: input.description,
      summary: input.summary,
      triggerDescription: input.triggerDescription,
      isCanonical,
      status,
      prerequisites: input.prerequisites || [],
      plausibility: input.plausibility ?? 0.5,
      immediateConsequences: input.immediateConsequences || [],
      longTermConsequences: input.longTermConsequences || [],
      consequenceIds: [],
      characterImpacts: input.characterImpacts || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store
    this.alternatives.set(alternative.alternativeId, alternative);

    // Link to branch point
    branchPoint.alternativeIds.push(alternative.alternativeId);
    if (isCanonical) {
      branchPoint.canonicalAlternativeId = alternative.alternativeId;
    }
    branchPoint.updatedAt = new Date();

    // Index
    if (!this.alternativesByBranch.has(input.branchPointId)) {
      this.alternativesByBranch.set(input.branchPointId, []);
    }
    this.alternativesByBranch.get(input.branchPointId)!.push(alternative.alternativeId);

    // Initialize consequences index
    this.consequencesByAlternative.set(alternative.alternativeId, []);

    return alternative;
  }

  /**
   * Get an alternative by ID
   */
  getAlternative(alternativeId: string): Alternative | undefined {
    return this.alternatives.get(alternativeId);
  }

  /**
   * Get alternatives for a branch point
   */
  getAlternativesForBranch(branchPointId: string): Alternative[] {
    const ids = this.alternativesByBranch.get(branchPointId) || [];
    return ids
      .map(id => this.alternatives.get(id))
      .filter((a): a is Alternative => a !== undefined);
  }

  /**
   * Get the canonical alternative for a branch point
   */
  getCanonicalAlternative(branchPointId: string): Alternative | undefined {
    const branchPoint = this.branchPoints.get(branchPointId);
    if (!branchPoint || !branchPoint.canonicalAlternativeId) return undefined;
    return this.alternatives.get(branchPoint.canonicalAlternativeId);
  }

  /**
   * Update an alternative
   */
  updateAlternative(
    alternativeId: string,
    updates: Partial<Omit<Alternative, 'alternativeId' | 'branchPointId' | 'createdAt'>>
  ): Alternative | undefined {
    const alternative = this.alternatives.get(alternativeId);
    if (!alternative) return undefined;

    Object.assign(alternative, updates, { updatedAt: new Date() });

    // If making canonical, update branch point
    if (updates.isCanonical) {
      const branchPoint = this.branchPoints.get(alternative.branchPointId);
      if (branchPoint) {
        // Remove canonical status from others
        for (const altId of branchPoint.alternativeIds) {
          const alt = this.alternatives.get(altId);
          if (alt && alt.alternativeId !== alternativeId) {
            alt.isCanonical = false;
            alt.status = alt.status === 'canonical' ? 'explored' : alt.status;
          }
        }
        branchPoint.canonicalAlternativeId = alternativeId;
      }
    }

    return alternative;
  }

  // ============================================================================
  // Consequence Management
  // ============================================================================

  /**
   * Add a consequence to an alternative
   */
  addConsequence(input: {
    alternativeId: string;
    consequenceType: ConsequenceType;
    title: string;
    description: string;
    occursTiming: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
    occursAtStoryTime?: number;
    affectedEntityIds: string[];
    affectedEntityType: 'character' | 'location' | 'organization' | 'plot_thread';
    stateChanges?: { entityId: string; attribute: string; fromValue: unknown; toValue: unknown }[];
    severity?: 'minor' | 'moderate' | 'major' | 'catastrophic';
  }): Consequence {
    const alternative = this.alternatives.get(input.alternativeId);
    if (!alternative) {
      throw new Error(`Alternative not found: ${input.alternativeId}`);
    }

    const consequence: Consequence = {
      consequenceId: uuidv4(),
      alternativeId: input.alternativeId,
      branchPointId: alternative.branchPointId,
      consequenceType: input.consequenceType,
      title: input.title,
      description: input.description,
      occursTiming: input.occursTiming,
      occursAtStoryTime: input.occursAtStoryTime,
      affectedEntityIds: input.affectedEntityIds,
      affectedEntityType: input.affectedEntityType,
      stateChanges: input.stateChanges || [],
      rippleEffectIds: [],
      severity: input.severity || 'moderate',
      createdAt: new Date()
    };

    // Store
    this.consequences.set(consequence.consequenceId, consequence);

    // Link to alternative
    alternative.consequenceIds.push(consequence.consequenceId);

    // Index
    if (!this.consequencesByAlternative.has(input.alternativeId)) {
      this.consequencesByAlternative.set(input.alternativeId, []);
    }
    this.consequencesByAlternative.get(input.alternativeId)!.push(consequence.consequenceId);

    return consequence;
  }

  /**
   * Get consequences for an alternative
   */
  getConsequencesForAlternative(alternativeId: string): Consequence[] {
    const ids = this.consequencesByAlternative.get(alternativeId) || [];
    return ids
      .map(id => this.consequences.get(id))
      .filter((c): c is Consequence => c !== undefined);
  }

  /**
   * Link a consequence as a ripple effect of another
   */
  linkRippleEffect(parentConsequenceId: string, childConsequenceId: string): void {
    const parent = this.consequences.get(parentConsequenceId);
    if (parent && !parent.rippleEffectIds.includes(childConsequenceId)) {
      parent.rippleEffectIds.push(childConsequenceId);
    }
  }

  // ============================================================================
  // Timeline Comparison
  // ============================================================================

  /**
   * Compare two alternatives (usually canonical vs non-canonical)
   */
  compareAlternatives(
    baselineAlternativeId: string,
    comparedAlternativeId: string
  ): TimelineComparison {
    const baseline = this.alternatives.get(baselineAlternativeId);
    const compared = this.alternatives.get(comparedAlternativeId);

    if (!baseline) throw new Error(`Baseline alternative not found: ${baselineAlternativeId}`);
    if (!compared) throw new Error(`Compared alternative not found: ${comparedAlternativeId}`);

    if (baseline.branchPointId !== compared.branchPointId) {
      throw new Error('Can only compare alternatives from the same branch point');
    }

    const branchPoint = this.branchPoints.get(baseline.branchPointId)!;

    // Get consequences for both
    const baselineConsequences = this.getConsequencesForAlternative(baselineAlternativeId);
    const comparedConsequences = this.getConsequencesForAlternative(comparedAlternativeId);

    // Build differences
    const differences: TimelineDifference[] = [];

    // Compare character impacts
    const baselineCharacters = new Set(baseline.characterImpacts.map(c => c.characterId));

    for (const impact of baseline.characterImpacts) {
      const comparedImpact = compared.characterImpacts.find(c => c.characterId === impact.characterId);
      if (!comparedImpact || comparedImpact.impact !== impact.impact) {
        differences.push({
          differenceId: uuidv4(),
          comparisonId: '', // Will be set after comparison is created
          differenceType: 'character_state',
          entityId: impact.characterId,
          entityName: impact.characterName,
          inBaseline: impact.impact,
          inCompared: comparedImpact?.impact || 'No impact',
          manifestsAtTime: branchPoint.storyTime,
          significance: this.assessSignificance(impact.impact, comparedImpact?.impact)
        });
      }
    }

    // Characters only in compared
    for (const impact of compared.characterImpacts) {
      if (!baselineCharacters.has(impact.characterId)) {
        differences.push({
          differenceId: uuidv4(),
          comparisonId: '',
          differenceType: 'character_state',
          entityId: impact.characterId,
          entityName: impact.characterName,
          inBaseline: 'No impact',
          inCompared: impact.impact,
          manifestsAtTime: branchPoint.storyTime,
          significance: 'moderate'
        });
      }
    }

    // Compare consequences
    for (const baseC of baselineConsequences) {
      const matchingCompared = comparedConsequences.find(
        c => c.consequenceType === baseC.consequenceType &&
             c.affectedEntityIds.some(e => baseC.affectedEntityIds.includes(e))
      );

      if (!matchingCompared) {
        differences.push({
          differenceId: uuidv4(),
          comparisonId: '',
          differenceType: this.consequenceToTimeline(baseC.consequenceType),
          entityId: baseC.affectedEntityIds[0] || 'unknown',
          entityName: baseC.title,
          inBaseline: baseC.description,
          inCompared: 'Does not occur',
          manifestsAtTime: baseC.occursAtStoryTime || branchPoint.storyTime,
          significance: baseC.severity as TimelineDifference['significance']
        });
      }
    }

    // Consequences only in compared
    for (const compC of comparedConsequences) {
      const matchingBaseline = baselineConsequences.find(
        c => c.consequenceType === compC.consequenceType &&
             c.affectedEntityIds.some(e => compC.affectedEntityIds.includes(e))
      );

      if (!matchingBaseline) {
        differences.push({
          differenceId: uuidv4(),
          comparisonId: '',
          differenceType: this.consequenceToTimeline(compC.consequenceType),
          entityId: compC.affectedEntityIds[0] || 'unknown',
          entityName: compC.title,
          inBaseline: 'Does not occur',
          inCompared: compC.description,
          manifestsAtTime: compC.occursAtStoryTime || branchPoint.storyTime,
          significance: compC.severity as TimelineDifference['significance']
        });
      }
    }

    // Filter trivial differences if configured
    const filteredDifferences = this.config.includeTrivialDifferences
      ? differences
      : differences.filter(d => d.significance !== 'minor');

    // Calculate metrics
    const characterDiffs = filteredDifferences.filter(d => d.differenceType === 'character_state').length;
    const plotDiffs = filteredDifferences.filter(d => d.differenceType === 'plot_thread').length;
    const worldDiffs = filteredDifferences.filter(d => d.differenceType === 'world_state').length;

    // Calculate similarity (more differences = lower similarity)
    const maxDifferences = 20; // Arbitrary normalization factor
    const similarityScore = Math.max(0, 1 - (filteredDifferences.length / maxDifferences));

    // Identify key divergences
    const keyDivergences = filteredDifferences
      .filter(d => d.significance === 'major' || d.significance === 'critical')
      .map(d => `${d.entityName}: ${d.inBaseline} → ${d.inCompared}`)
      .slice(0, 5);

    const comparison: TimelineComparison = {
      comparisonId: uuidv4(),
      baselineAlternativeId,
      comparedAlternativeId,
      branchPointId: baseline.branchPointId,
      divergenceTime: branchPoint.storyTime,
      differences: filteredDifferences,
      totalDifferences: filteredDifferences.length,
      characterDifferences: characterDiffs,
      plotDifferences: plotDiffs,
      worldDifferences: worldDiffs,
      similarityScore,
      keyDivergences,
      createdAt: new Date()
    };

    // Update difference comparisonIds
    for (const diff of filteredDifferences) {
      diff.comparisonId = comparison.comparisonId;
    }

    // Store
    this.comparisons.set(comparison.comparisonId, comparison);

    return comparison;
  }

  /**
   * Map consequence type to timeline difference type
   */
  private consequenceToTimeline(type: ConsequenceType): TimelineDifference['differenceType'] {
    switch (type) {
      case 'character_change':
      case 'death':
      case 'survival':
        return 'character_state';
      case 'relationship_change':
        return 'relationship';
      case 'plot_change':
        return 'plot_thread';
      case 'world_change':
      case 'power_change':
      case 'knowledge_change':
        return 'world_state';
      default:
        return 'world_state';
    }
  }

  /**
   * Assess significance of a difference
   */
  private assessSignificance(
    baseline: string | undefined,
    compared: string | undefined
  ): TimelineDifference['significance'] {
    if (!baseline || !compared) return 'major';
    if (baseline === compared) return 'minor';

    // Simple heuristic based on text difference
    const baselineWords = new Set(baseline.toLowerCase().split(/\s+/));
    const comparedWords = new Set(compared.toLowerCase().split(/\s+/));

    let overlap = 0;
    for (const word of baselineWords) {
      if (comparedWords.has(word)) overlap++;
    }

    const overlapRatio = overlap / Math.max(baselineWords.size, comparedWords.size);

    if (overlapRatio > 0.8) return 'minor';
    if (overlapRatio > 0.5) return 'moderate';
    if (overlapRatio > 0.2) return 'major';
    return 'critical';
  }

  // ============================================================================
  // Exploration Sessions
  // ============================================================================

  /**
   * Start an exploration session
   */
  startExplorationSession(alternativeId: string): ExplorationSession {
    const alternative = this.alternatives.get(alternativeId);
    if (!alternative) {
      throw new Error(`Alternative not found: ${alternativeId}`);
    }

    const session: ExplorationSession = {
      sessionId: uuidv4(),
      branchPointId: alternative.branchPointId,
      alternativeId,
      startedAt: new Date(),
      status: 'in_progress',
      scenesWritten: 0,
      wordsWritten: 0,
      consequencesDiscovered: 0,
      insights: []
    };

    this.sessions.set(session.sessionId, session);

    return session;
  }

  /**
   * Update exploration session progress
   */
  updateExplorationSession(
    sessionId: string,
    updates: Partial<Omit<ExplorationSession, 'sessionId' | 'branchPointId' | 'alternativeId' | 'startedAt'>>
  ): ExplorationSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    Object.assign(session, updates);

    // If completing, mark the alternative as explored
    if (updates.status === 'completed') {
      session.completedAt = new Date();
      const alternative = this.alternatives.get(session.alternativeId);
      if (alternative && alternative.status === 'proposed') {
        alternative.status = 'explored';
        alternative.exploredAt = new Date();
      }
    }

    return session;
  }

  /**
   * Add insight to session
   */
  addInsight(sessionId: string, insight: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.insights.push(insight);
    }
  }

  /**
   * Get exploration sessions for an alternative
   */
  getSessionsForAlternative(alternativeId: string): ExplorationSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.alternativeId === alternativeId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  // ============================================================================
  // Statistics & Management
  // ============================================================================

  /**
   * Get statistics
   */
  getStats(): {
    branchPointCount: number;
    branchPointsByType: Record<string, number>;
    alternativeCount: number;
    alternativesByStatus: Record<string, number>;
    consequenceCount: number;
    comparisonCount: number;
    sessionCount: number;
    exploredAlternatives: number;
  } {
    const branchPointsByType: Record<string, number> = {};
    for (const bp of this.branchPoints.values()) {
      branchPointsByType[bp.branchType] = (branchPointsByType[bp.branchType] || 0) + 1;
    }

    const alternativesByStatus: Record<string, number> = {};
    let exploredCount = 0;
    for (const alt of this.alternatives.values()) {
      alternativesByStatus[alt.status] = (alternativesByStatus[alt.status] || 0) + 1;
      if (alt.status === 'explored' || alt.status === 'canonical') {
        exploredCount++;
      }
    }

    return {
      branchPointCount: this.branchPoints.size,
      branchPointsByType,
      alternativeCount: this.alternatives.size,
      alternativesByStatus,
      consequenceCount: this.consequences.size,
      comparisonCount: this.comparisons.size,
      sessionCount: this.sessions.size,
      exploredAlternatives: exploredCount
    };
  }

  /**
   * Get summary of a branch point with all its alternatives
   */
  getBranchPointSummary(branchPointId: string): {
    branchPoint: BranchPoint;
    alternatives: Alternative[];
    canonical: Alternative | undefined;
    totalConsequences: number;
    comparisons: TimelineComparison[];
  } | undefined {
    const branchPoint = this.branchPoints.get(branchPointId);
    if (!branchPoint) return undefined;

    const alternatives = this.getAlternativesForBranch(branchPointId);
    const canonical = this.getCanonicalAlternative(branchPointId);

    let totalConsequences = 0;
    for (const alt of alternatives) {
      totalConsequences += alt.consequenceIds.length;
    }

    const comparisons = Array.from(this.comparisons.values())
      .filter(c => c.branchPointId === branchPointId);

    return {
      branchPoint,
      alternatives,
      canonical,
      totalConsequences,
      comparisons
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.branchPoints.clear();
    this.alternatives.clear();
    this.consequences.clear();
    this.comparisons.clear();
    this.sessions.clear();
    this.branchPointsByTime.clear();
    this.alternativesByBranch.clear();
    this.consequencesByAlternative.clear();
  }

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      branchPoints: Array.from(this.branchPoints.entries()),
      alternatives: Array.from(this.alternatives.entries()),
      consequences: Array.from(this.consequences.entries()),
      comparisons: Array.from(this.comparisons.entries()),
      sessions: Array.from(this.sessions.entries())
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);
    this.clear();

    // Import branch points
    for (const [id, bp] of data.branchPoints) {
      this.branchPoints.set(id, bp);

      if (!this.branchPointsByTime.has(bp.storyTime)) {
        this.branchPointsByTime.set(bp.storyTime, []);
      }
      this.branchPointsByTime.get(bp.storyTime)!.push(id);

      this.alternativesByBranch.set(id, bp.alternativeIds);
    }

    // Import alternatives
    for (const [id, alt] of data.alternatives) {
      this.alternatives.set(id, alt);
      this.consequencesByAlternative.set(id, alt.consequenceIds);
    }

    // Import consequences
    for (const [id, cons] of data.consequences) {
      this.consequences.set(id, cons);
    }

    // Import comparisons
    for (const [id, comp] of data.comparisons) {
      this.comparisons.set(id, comp);
    }

    // Import sessions
    for (const [id, session] of data.sessions) {
      this.sessions.set(id, session);
    }
  }
}

export default WhatIfEngine;
