/**
 * SCORE Hierarchical Summarizer
 *
 * Creates and manages multi-level summaries:
 * - Scene summaries: Individual scene events
 * - Chapter summaries: Aggregate scene events
 * - Arc summaries: Major plot movements
 * - Book summaries: Complete narrative threads
 * - Series summaries: Cross-book themes
 *
 * Enables efficient context retrieval at appropriate granularity.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  HierarchicalSummary,
  SummaryLevel,
  SummaryQuery,
  SCOREConfig
} from './types';
import { defaultSCOREConfig } from './types';

// ============================================================================
// Hierarchical Summarizer
// ============================================================================

export class HierarchicalSummarizer {
  // Storage by ID
  private summaries: Map<string, HierarchicalSummary> = new Map();

  // Indexes
  private summariesByLevel: Map<SummaryLevel, string[]> = new Map();
  private summariesByTarget: Map<string, string> = new Map();
  private summariesByParent: Map<string, string[]> = new Map();

  // Configuration
  private config: SCOREConfig;

  constructor(config: Partial<SCOREConfig> = {}) {
    this.config = { ...defaultSCOREConfig, ...config };

    // Initialize level indexes
    for (const level of ['scene', 'chapter', 'arc', 'book', 'series'] as SummaryLevel[]) {
      this.summariesByLevel.set(level, []);
    }
  }

  // ============================================================================
  // Summary Creation
  // ============================================================================

  /**
   * Create a new summary
   */
  createSummary(input: {
    level: SummaryLevel;
    targetId: string;
    targetName: string;
    startTime: string;
    endTime: string;
    startTimeNumeric: number;
    endTimeNumeric: number;
    briefSummary: string;
    detailedSummary: string;
    bulletPoints?: string[];
    characters?: string[];
    locations?: string[];
    objects?: string[];
    majorStateChanges?: { entityId: string; entityName: string; change: string }[];
    plotThreads?: string[];
    foreshadowing?: string[];
    payoffs?: string[];
    parentSummaryId?: string;
    wordCount?: number;
  }): HierarchicalSummary {
    const summary: HierarchicalSummary = {
      summaryId: uuidv4(),
      level: input.level,
      targetId: input.targetId,
      targetName: input.targetName,
      startTime: input.startTime,
      endTime: input.endTime,
      startTimeNumeric: input.startTimeNumeric,
      endTimeNumeric: input.endTimeNumeric,
      briefSummary: input.briefSummary,
      detailedSummary: input.detailedSummary,
      bulletPoints: input.bulletPoints || [],
      characters: input.characters || [],
      locations: input.locations || [],
      objects: input.objects || [],
      majorStateChanges: input.majorStateChanges || [],
      plotThreads: input.plotThreads || [],
      foreshadowing: input.foreshadowing || [],
      payoffs: input.payoffs || [],
      childSummaryIds: [],
      parentSummaryId: input.parentSummaryId,
      wordCount: input.wordCount || this.estimateWordCount(input.detailedSummary),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store
    this.summaries.set(summary.summaryId, summary);

    // Update indexes
    this.summariesByLevel.get(summary.level)!.push(summary.summaryId);
    this.summariesByTarget.set(summary.targetId, summary.summaryId);

    // Link to parent
    if (summary.parentSummaryId) {
      const parent = this.summaries.get(summary.parentSummaryId);
      if (parent) {
        parent.childSummaryIds.push(summary.summaryId);
        parent.updatedAt = new Date();
      }

      if (!this.summariesByParent.has(summary.parentSummaryId)) {
        this.summariesByParent.set(summary.parentSummaryId, []);
      }
      this.summariesByParent.get(summary.parentSummaryId)!.push(summary.summaryId);
    }

    return summary;
  }

  /**
   * Generate a summary from child summaries
   */
  generateParentSummary(
    level: SummaryLevel,
    targetId: string,
    targetName: string,
    childSummaryIds: string[]
  ): HierarchicalSummary {
    const children = childSummaryIds
      .map(id => this.summaries.get(id))
      .filter((s): s is HierarchicalSummary => s !== undefined)
      .sort((a, b) => a.startTimeNumeric - b.startTimeNumeric);

    if (children.length === 0) {
      throw new Error('No valid child summaries found');
    }

    // Aggregate data from children
    const allCharacters = new Set<string>();
    const allLocations = new Set<string>();
    const allObjects = new Set<string>();
    const allPlotThreads = new Set<string>();
    const allBulletPoints: string[] = [];
    const allStateChanges: { entityId: string; entityName: string; change: string }[] = [];
    const allForeshadowing: string[] = [];
    const allPayoffs: string[] = [];

    for (const child of children) {
      child.characters.forEach(c => allCharacters.add(c));
      child.locations.forEach(l => allLocations.add(l));
      child.objects.forEach(o => allObjects.add(o));
      child.plotThreads.forEach(p => allPlotThreads.add(p));
      child.bulletPoints.forEach(b => allBulletPoints.push(b));
      child.majorStateChanges.forEach(s => allStateChanges.push(s));
      child.foreshadowing.forEach(f => allForeshadowing.push(f));
      child.payoffs.forEach(p => allPayoffs.push(p));
    }

    // Generate combined summaries
    const briefSummary = this.generateCombinedBrief(children, level);
    const detailedSummary = this.generateCombinedDetailed(children, level);
    const bulletPoints = this.selectKeyBulletPoints(allBulletPoints, level);

    return this.createSummary({
      level,
      targetId,
      targetName,
      startTime: children[0].startTime,
      endTime: children[children.length - 1].endTime,
      startTimeNumeric: children[0].startTimeNumeric,
      endTimeNumeric: children[children.length - 1].endTimeNumeric,
      briefSummary,
      detailedSummary,
      bulletPoints,
      characters: Array.from(allCharacters),
      locations: Array.from(allLocations),
      objects: Array.from(allObjects),
      majorStateChanges: this.selectSignificantChanges(allStateChanges, level),
      plotThreads: Array.from(allPlotThreads),
      foreshadowing: allForeshadowing,
      payoffs: allPayoffs
    });
  }

  /**
   * Generate brief summary from children
   */
  private generateCombinedBrief(children: HierarchicalSummary[], _level: SummaryLevel): string {
    // Take the most important points from each child
    const keyPoints = children.map(c => c.briefSummary).filter(s => s.length > 0);

    if (keyPoints.length === 0) return '';
    if (keyPoints.length === 1) return keyPoints[0];

    // Combine first and last for temporal span
    return `${keyPoints[0]} ... ${keyPoints[keyPoints.length - 1]}`;
  }

  /**
   * Generate detailed summary from children
   */
  private generateCombinedDetailed(children: HierarchicalSummary[], level: SummaryLevel): string {
    const maxLength = this.config.maxSummaryLength[level];
    const parts: string[] = [];

    for (const child of children) {
      if (child.briefSummary) {
        parts.push(child.briefSummary);
      }
    }

    let combined = parts.join(' ');

    // Truncate if needed
    if (combined.length > maxLength) {
      combined = combined.substring(0, maxLength - 3) + '...';
    }

    return combined;
  }

  /**
   * Select key bullet points for higher-level summary
   */
  private selectKeyBulletPoints(allPoints: string[], level: SummaryLevel): string[] {
    // More points for higher levels
    const maxPoints = {
      scene: 3,
      chapter: 5,
      arc: 7,
      book: 10,
      series: 15
    }[level];

    // Simple selection: take evenly distributed points
    if (allPoints.length <= maxPoints) return allPoints;

    const selected: string[] = [];
    const step = Math.ceil(allPoints.length / maxPoints);

    for (let i = 0; i < allPoints.length && selected.length < maxPoints; i += step) {
      selected.push(allPoints[i]);
    }

    return selected;
  }

  /**
   * Select significant state changes for higher-level summary
   */
  private selectSignificantChanges(
    allChanges: { entityId: string; entityName: string; change: string }[],
    level: SummaryLevel
  ): { entityId: string; entityName: string; change: string }[] {
    const maxChanges = {
      scene: 5,
      chapter: 10,
      arc: 15,
      book: 25,
      series: 50
    }[level];

    // Group by entity and take most significant
    const byEntity = new Map<string, { entityId: string; entityName: string; change: string }[]>();

    for (const change of allChanges) {
      if (!byEntity.has(change.entityId)) {
        byEntity.set(change.entityId, []);
      }
      byEntity.get(change.entityId)!.push(change);
    }

    // Take first and last change per entity (bookends show transformation)
    const selected: { entityId: string; entityName: string; change: string }[] = [];

    for (const [, changes] of byEntity) {
      if (changes.length === 1) {
        selected.push(changes[0]);
      } else {
        selected.push(changes[0]);
        selected.push(changes[changes.length - 1]);
      }

      if (selected.length >= maxChanges) break;
    }

    return selected.slice(0, maxChanges);
  }

  // ============================================================================
  // Summary Queries
  // ============================================================================

  /**
   * Get summary by ID
   */
  getSummary(summaryId: string): HierarchicalSummary | undefined {
    return this.summaries.get(summaryId);
  }

  /**
   * Get summary for a target (scene, chapter, etc.)
   */
  getSummaryForTarget(targetId: string): HierarchicalSummary | undefined {
    const summaryId = this.summariesByTarget.get(targetId);
    return summaryId ? this.summaries.get(summaryId) : undefined;
  }

  /**
   * Get summaries by level
   */
  getSummariesByLevel(level: SummaryLevel): HierarchicalSummary[] {
    const ids = this.summariesByLevel.get(level) || [];
    return ids
      .map(id => this.summaries.get(id))
      .filter((s): s is HierarchicalSummary => s !== undefined)
      .sort((a, b) => a.startTimeNumeric - b.startTimeNumeric);
  }

  /**
   * Get child summaries
   */
  getChildSummaries(parentId: string): HierarchicalSummary[] {
    const childIds = this.summariesByParent.get(parentId) || [];
    return childIds
      .map(id => this.summaries.get(id))
      .filter((s): s is HierarchicalSummary => s !== undefined)
      .sort((a, b) => a.startTimeNumeric - b.startTimeNumeric);
  }

  /**
   * Query summaries with filters
   */
  querySummaries(query: SummaryQuery): HierarchicalSummary[] {
    let results = Array.from(this.summaries.values());

    // Filter by level
    if (query.level) {
      results = results.filter(s => s.level === query.level);
    }

    // Filter by time
    if (query.afterTime !== undefined) {
      results = results.filter(s => s.endTimeNumeric >= query.afterTime!);
    }
    if (query.beforeTime !== undefined) {
      results = results.filter(s => s.startTimeNumeric <= query.beforeTime!);
    }

    // Filter by characters
    if (query.involvedCharacters && query.involvedCharacters.length > 0) {
      results = results.filter(s =>
        query.involvedCharacters!.some(c => s.characters.includes(c))
      );
    }

    // Filter by locations
    if (query.involvedLocations && query.involvedLocations.length > 0) {
      results = results.filter(s =>
        query.involvedLocations!.some(l => s.locations.includes(l))
      );
    }

    // Filter by plot threads
    if (query.plotThreads && query.plotThreads.length > 0) {
      results = results.filter(s =>
        query.plotThreads!.some(p => s.plotThreads.includes(p))
      );
    }

    // Filter by search terms
    if (query.searchTerms && query.searchTerms.length > 0) {
      const lowerTerms = query.searchTerms.map(t => t.toLowerCase());
      results = results.filter(s => {
        const text = `${s.briefSummary} ${s.detailedSummary} ${s.bulletPoints.join(' ')}`.toLowerCase();
        return lowerTerms.some(term => text.includes(term));
      });
    }

    // Sort by time
    results.sort((a, b) => a.startTimeNumeric - b.startTimeNumeric);

    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Get context at appropriate level
   * Returns summaries that provide good context for a given point in time
   */
  getContextForTime(
    storyTimeNumeric: number,
    options: {
      levelsToInclude?: SummaryLevel[];
      maxItems?: number;
      lookbackRange?: number;
    } = {}
  ): HierarchicalSummary[] {
    const levels = options.levelsToInclude || ['scene', 'chapter', 'arc'];
    const maxItems = options.maxItems || 10;
    const lookbackRange = options.lookbackRange || storyTimeNumeric; // Default: all prior

    const results: HierarchicalSummary[] = [];

    // Get recent items at each level
    for (const level of levels) {
      const levelSummaries = this.querySummaries({
        level,
        afterTime: storyTimeNumeric - lookbackRange,
        beforeTime: storyTimeNumeric
      });

      // Add most recent at this level
      if (levelSummaries.length > 0) {
        // Take last few at each level
        const toTake = Math.ceil(maxItems / levels.length);
        results.push(...levelSummaries.slice(-toTake));
      }
    }

    // Sort by time and limit
    return results
      .sort((a, b) => b.startTimeNumeric - a.startTimeNumeric)
      .slice(0, maxItems);
  }

  // ============================================================================
  // Summary Updates
  // ============================================================================

  /**
   * Update a summary
   */
  updateSummary(
    summaryId: string,
    updates: Partial<Omit<HierarchicalSummary, 'summaryId' | 'level' | 'targetId' | 'createdAt'>>
  ): HierarchicalSummary | undefined {
    const summary = this.summaries.get(summaryId);
    if (!summary) return undefined;

    Object.assign(summary, updates, { updatedAt: new Date() });
    return summary;
  }

  /**
   * Delete a summary
   */
  deleteSummary(summaryId: string): boolean {
    const summary = this.summaries.get(summaryId);
    if (!summary) return false;

    // Remove from indexes
    const levelIds = this.summariesByLevel.get(summary.level);
    if (levelIds) {
      const idx = levelIds.indexOf(summaryId);
      if (idx !== -1) levelIds.splice(idx, 1);
    }

    this.summariesByTarget.delete(summary.targetId);

    // Remove from parent's children
    if (summary.parentSummaryId) {
      const parent = this.summaries.get(summary.parentSummaryId);
      if (parent) {
        const idx = parent.childSummaryIds.indexOf(summaryId);
        if (idx !== -1) parent.childSummaryIds.splice(idx, 1);
      }

      const siblings = this.summariesByParent.get(summary.parentSummaryId);
      if (siblings) {
        const idx = siblings.indexOf(summaryId);
        if (idx !== -1) siblings.splice(idx, 1);
      }
    }

    // Delete from main storage
    this.summaries.delete(summaryId);

    return true;
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  /**
   * Estimate word count from text
   */
  private estimateWordCount(text: string): number {
    return text.split(/\s+/).filter(w => w.length > 0).length;
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalSummaries: number;
    summariesByLevel: Record<SummaryLevel, number>;
    averageWordCount: Record<SummaryLevel, number>;
  } {
    const summariesByLevel: Record<SummaryLevel, number> = {
      scene: 0, chapter: 0, arc: 0, book: 0, series: 0
    };
    const wordCountByLevel: Record<SummaryLevel, number[]> = {
      scene: [], chapter: [], arc: [], book: [], series: []
    };

    for (const summary of this.summaries.values()) {
      summariesByLevel[summary.level]++;
      wordCountByLevel[summary.level].push(summary.wordCount);
    }

    const averageWordCount: Record<SummaryLevel, number> = {
      scene: 0, chapter: 0, arc: 0, book: 0, series: 0
    };

    for (const level of Object.keys(wordCountByLevel) as SummaryLevel[]) {
      const counts = wordCountByLevel[level];
      averageWordCount[level] = counts.length > 0
        ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length)
        : 0;
    }

    return {
      totalSummaries: this.summaries.size,
      summariesByLevel,
      averageWordCount
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.summaries.clear();
    for (const level of this.summariesByLevel.keys()) {
      this.summariesByLevel.set(level, []);
    }
    this.summariesByTarget.clear();
    this.summariesByParent.clear();
  }

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      summaries: Array.from(this.summaries.entries())
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);
    this.clear();

    for (const [id, summary] of data.summaries) {
      this.summaries.set(id, summary);

      // Rebuild indexes
      this.summariesByLevel.get(summary.level)!.push(id);
      this.summariesByTarget.set(summary.targetId, id);

      if (summary.parentSummaryId) {
        if (!this.summariesByParent.has(summary.parentSummaryId)) {
          this.summariesByParent.set(summary.parentSummaryId, []);
        }
        this.summariesByParent.get(summary.parentSummaryId)!.push(id);
      }
    }
  }
}

export default HierarchicalSummarizer;
