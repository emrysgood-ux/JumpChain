/**
 * SCORE Hybrid Retriever
 *
 * Combines multiple retrieval strategies:
 * - Semantic search (embedding similarity)
 * - Keyword search (exact and fuzzy matching)
 * - Temporal filtering (point-in-time, range queries)
 * - Entity-based filtering (character, location involvement)
 *
 * Produces ranked results combining all signals.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  RetrievalQuery,
  RetrievalResult,
  HierarchicalSummary,
  EntityState,
  SCOREConfig
} from './types';
import { defaultSCOREConfig } from './types';
import type { StateTracker } from './state-tracker';
import type { HierarchicalSummarizer } from './hierarchical-summarizer';

// ============================================================================
// Content Source Interface
// ============================================================================

export interface ContentSource {
  id: string;
  type: 'scene' | 'summary' | 'state' | 'fact';
  content: string;
  embedding?: number[];
  storyTimeNumeric?: number;
  storyTime?: string;
  entities: string[];
  metadata: Record<string, unknown>;
}

// ============================================================================
// Hybrid Retriever
// ============================================================================

export class HybridRetriever {
  // Content index
  private contentIndex: Map<string, ContentSource> = new Map();

  // Indexes for efficient lookup
  private contentByType: Map<string, string[]> = new Map();
  private contentByEntity: Map<string, string[]> = new Map();

  // Connected components
  private stateTracker?: StateTracker;
  private summarizer?: HierarchicalSummarizer;

  // Configuration
  private config: SCOREConfig;

  constructor(config: Partial<SCOREConfig> = {}) {
    this.config = { ...defaultSCOREConfig, ...config };

    // Initialize type indexes
    for (const type of ['scene', 'summary', 'state', 'fact']) {
      this.contentByType.set(type, []);
    }
  }

  /**
   * Connect to state tracker for state-aware retrieval
   */
  connectStateTracker(tracker: StateTracker): void {
    this.stateTracker = tracker;
  }

  /**
   * Connect to summarizer for hierarchical retrieval
   */
  connectSummarizer(summarizer: HierarchicalSummarizer): void {
    this.summarizer = summarizer;
  }

  // ============================================================================
  // Content Indexing
  // ============================================================================

  /**
   * Index content for retrieval
   */
  indexContent(source: ContentSource): void {
    this.contentIndex.set(source.id, source);

    // Update type index
    if (!this.contentByType.has(source.type)) {
      this.contentByType.set(source.type, []);
    }
    this.contentByType.get(source.type)!.push(source.id);

    // Update entity index
    for (const entityId of source.entities) {
      if (!this.contentByEntity.has(entityId)) {
        this.contentByEntity.set(entityId, []);
      }
      this.contentByEntity.get(entityId)!.push(source.id);
    }
  }

  /**
   * Index a scene
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
    const entities = [...scene.characterIds];
    if (scene.locationId) entities.push(scene.locationId);

    this.indexContent({
      id: scene.id,
      type: 'scene',
      content: scene.content,
      embedding: scene.embedding,
      storyTimeNumeric: scene.storyTimeNumeric,
      storyTime: scene.storyTime,
      entities,
      metadata: { locationId: scene.locationId }
    });
  }

  /**
   * Index a summary
   */
  indexSummary(summary: HierarchicalSummary, embedding?: number[]): void {
    this.indexContent({
      id: summary.summaryId,
      type: 'summary',
      content: `${summary.briefSummary} ${summary.detailedSummary}`,
      embedding,
      storyTimeNumeric: summary.startTimeNumeric,
      storyTime: summary.startTime,
      entities: [...summary.characters, ...summary.locations],
      metadata: {
        level: summary.level,
        endTimeNumeric: summary.endTimeNumeric
      }
    });
  }

  /**
   * Index an entity state
   */
  indexState(state: EntityState, embedding?: number[]): void {
    const content = JSON.stringify(state.attributes) + ' ' +
      (state.knownFacts?.join(' ') || '') + ' ' +
      (state.currentLocation || '');

    this.indexContent({
      id: `state-${state.entityId}-${state.storyTimeNumeric}`,
      type: 'state',
      content,
      embedding,
      storyTimeNumeric: state.storyTimeNumeric,
      storyTime: state.storyTime,
      entities: [state.entityId],
      metadata: { status: state.status, entityType: state.entityType }
    });
  }

  /**
   * Index a fact
   */
  indexFact(fact: {
    id: string;
    content: string;
    validFrom?: number;
    validUntil?: number;
    relatedEntities: string[];
    embedding?: number[];
  }): void {
    this.indexContent({
      id: fact.id,
      type: 'fact',
      content: fact.content,
      embedding: fact.embedding,
      storyTimeNumeric: fact.validFrom,
      entities: fact.relatedEntities,
      metadata: { validUntil: fact.validUntil }
    });
  }

  // ============================================================================
  // Retrieval
  // ============================================================================

  /**
   * Perform hybrid retrieval
   */
  retrieve(query: RetrievalQuery): RetrievalResult[] {
    // Get candidate content
    let candidates = this.getCandidates(query);

    // Score each candidate
    const scored = candidates.map(source => ({
      source,
      score: this.scoreContent(source, query)
    }));

    // Filter by minimum relevance
    const minRelevance = query.minRelevance ?? this.config.minRelevanceThreshold;
    const filtered = scored.filter(s => s.score.total >= minRelevance);

    // Sort by relevance or time
    if (query.orderBy === 'chronological') {
      filtered.sort((a, b) =>
        (a.source.storyTimeNumeric || 0) - (b.source.storyTimeNumeric || 0)
      );
    } else if (query.orderBy === 'reverse-chronological') {
      filtered.sort((a, b) =>
        (b.source.storyTimeNumeric || 0) - (a.source.storyTimeNumeric || 0)
      );
    } else {
      filtered.sort((a, b) => b.score.total - a.score.total);
    }

    // Apply limit
    const limit = query.limit ?? this.config.defaultLimit;
    const limited = filtered.slice(0, limit);

    // Convert to results
    return limited.map(item => this.toRetrievalResult(item.source, item.score));
  }

  /**
   * Get candidate content based on query constraints
   */
  private getCandidates(query: RetrievalQuery): ContentSource[] {
    let candidates: ContentSource[] = [];

    // Start with type-filtered candidates or all
    if (query.contentTypes && query.contentTypes.length > 0) {
      for (const type of query.contentTypes) {
        const typeIds = this.contentByType.get(type) || [];
        for (const id of typeIds) {
          const source = this.contentIndex.get(id);
          if (source) candidates.push(source);
        }
      }
    } else {
      candidates = Array.from(this.contentIndex.values());
    }

    // Filter by entities if specified
    if (query.involvedEntities && query.involvedEntities.length > 0) {
      candidates = candidates.filter(source =>
        query.involvedEntities!.some(e => source.entities.includes(e))
      );
    }

    // Filter by entity types if specified
    if (query.entityTypes && query.entityTypes.length > 0 && this.stateTracker) {
      candidates = candidates.filter(source => {
        return source.entities.some(entityId => {
          const state = this.stateTracker!.getCurrentState(entityId);
          return state && query.entityTypes!.includes(state.entityType);
        });
      });
    }

    // Filter by temporal constraints
    if (query.pointInTime !== undefined) {
      candidates = candidates.filter(source => {
        if (source.storyTimeNumeric === undefined) return true;
        const endTime = source.metadata?.endTimeNumeric as number | undefined;
        return source.storyTimeNumeric <= query.pointInTime! &&
          (!endTime || endTime >= query.pointInTime!);
      });
    }

    if (query.afterTime !== undefined) {
      candidates = candidates.filter(source =>
        source.storyTimeNumeric === undefined ||
        source.storyTimeNumeric >= query.afterTime!
      );
    }

    if (query.beforeTime !== undefined) {
      candidates = candidates.filter(source =>
        source.storyTimeNumeric === undefined ||
        source.storyTimeNumeric <= query.beforeTime!
      );
    }

    // Filter by must include keywords
    if (query.mustInclude && query.mustInclude.length > 0) {
      candidates = candidates.filter(source => {
        const lowerContent = source.content.toLowerCase();
        return query.mustInclude!.every(kw => lowerContent.includes(kw.toLowerCase()));
      });
    }

    // Filter by must exclude keywords
    if (query.mustExclude && query.mustExclude.length > 0) {
      candidates = candidates.filter(source => {
        const lowerContent = source.content.toLowerCase();
        return !query.mustExclude!.some(kw => lowerContent.includes(kw.toLowerCase()));
      });
    }

    return candidates;
  }

  /**
   * Score content against query
   */
  private scoreContent(
    source: ContentSource,
    query: RetrievalQuery
  ): { total: number; semantic: number; keyword: number; temporal: number } {
    const semanticScore = this.computeSemanticScore(source, query);
    const keywordScore = this.computeKeywordScore(source, query);
    const temporalScore = this.computeTemporalScore(source, query);

    const total =
      semanticScore * this.config.semanticWeight +
      keywordScore * this.config.keywordWeight +
      temporalScore * this.config.temporalWeight;

    return { total, semantic: semanticScore, keyword: keywordScore, temporal: temporalScore };
  }

  /**
   * Compute semantic similarity score
   */
  private computeSemanticScore(source: ContentSource, query: RetrievalQuery): number {
    if (!query.embedding || !source.embedding) return 0;

    return this.cosineSimilarity(query.embedding, source.embedding);
  }

  /**
   * Compute keyword matching score
   */
  private computeKeywordScore(source: ContentSource, query: RetrievalQuery): number {
    if (!query.keywords || query.keywords.length === 0) {
      // If no keywords specified but query text exists, extract keywords
      if (query.queryText) {
        const keywords = query.queryText.toLowerCase().split(/\s+/);
        const lowerContent = source.content.toLowerCase();
        const matches = keywords.filter(kw => kw.length > 2 && lowerContent.includes(kw));
        return matches.length / keywords.length;
      }
      return 0;
    }

    const lowerContent = source.content.toLowerCase();
    const matches = query.keywords.filter(kw => lowerContent.includes(kw.toLowerCase()));

    return matches.length / query.keywords.length;
  }

  /**
   * Compute temporal proximity score
   */
  private computeTemporalScore(source: ContentSource, query: RetrievalQuery): number {
    if (source.storyTimeNumeric === undefined) return 0.5; // Neutral for timeless content

    const targetTime = query.pointInTime ??
      (query.beforeTime !== undefined ? query.beforeTime :
        (query.afterTime !== undefined ? query.afterTime : undefined));

    if (targetTime === undefined) return 0.5; // Neutral if no temporal constraint

    // Compute distance-based score (closer = higher score)
    const distance = Math.abs(source.storyTimeNumeric - targetTime);

    // Use exponential decay with a reasonable scale
    // Assuming time units are years, 1 year distance = 0.5 score
    const decay = Math.exp(-distance / 1);

    return Math.max(0, Math.min(1, decay));
  }

  /**
   * Compute cosine similarity between embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Convert scored content to retrieval result
   */
  private toRetrievalResult(
    source: ContentSource,
    score: { total: number; semantic: number; keyword: number; temporal: number }
  ): RetrievalResult {
    return {
      resultId: uuidv4(),
      contentType: source.type,
      sourceId: source.id,
      content: source.content,
      preview: source.content.substring(0, 200) + (source.content.length > 200 ? '...' : ''),
      relevanceScore: score.total,
      semanticScore: score.semantic,
      keywordScore: score.keyword,
      temporalScore: score.temporal,
      storyTime: source.storyTime,
      storyTimeNumeric: source.storyTimeNumeric,
      entities: source.entities
    };
  }

  // ============================================================================
  // Specialized Queries
  // ============================================================================

  /**
   * Get context for generating content at a specific point
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
    const results: RetrievalResult[] = [];

    // Get relevant summaries from summarizer
    if (this.summarizer) {
      const summaries = this.summarizer.getContextForTime(storyTimeNumeric, {
        maxItems: Math.ceil((options.maxResults || 10) / 2)
      });

      for (const summary of summaries) {
        results.push({
          resultId: uuidv4(),
          contentType: 'summary',
          sourceId: summary.summaryId,
          content: summary.detailedSummary,
          preview: summary.briefSummary,
          relevanceScore: 1.0,
          storyTime: summary.startTime,
          storyTimeNumeric: summary.startTimeNumeric,
          entities: [...summary.characters, ...summary.locations]
        });
      }
    }

    // Get relevant states from state tracker
    if (this.stateTracker && options.characterIds) {
      for (const characterId of options.characterIds) {
        const state = this.stateTracker.getStateAt(characterId, storyTimeNumeric);
        if (state) {
          results.push({
            resultId: uuidv4(),
            contentType: 'state',
            sourceId: `state-${state.entityId}`,
            content: JSON.stringify(state.attributes),
            preview: `${state.entityName}: ${state.status} at ${state.currentLocation || 'unknown location'}`,
            relevanceScore: 1.0,
            storyTime: state.storyTime,
            storyTimeNumeric: state.storyTimeNumeric,
            entities: [state.entityId]
          });
        }
      }
    }

    // Add from main index
    const indexResults = this.retrieve({
      pointInTime: storyTimeNumeric,
      involvedEntities: options.characterIds,
      contentTypes: ['scene', 'fact'],
      limit: options.maxResults ? Math.ceil(options.maxResults / 2) : 5,
      orderBy: 'reverse-chronological'
    });

    results.push(...indexResults);

    // Deduplicate and limit
    const seen = new Set<string>();
    const unique = results.filter(r => {
      if (seen.has(r.sourceId)) return false;
      seen.add(r.sourceId);
      return true;
    });

    return unique.slice(0, options.maxResults || 10);
  }

  /**
   * Find content related to a character at a specific time
   */
  getCharacterContext(
    characterId: string,
    storyTimeNumeric: number
  ): {
    currentState: EntityState | undefined;
    recentChanges: { change: string; time: number }[];
    relatedContent: RetrievalResult[];
  } {
    let currentState: EntityState | undefined;
    let recentChanges: { change: string; time: number }[] = [];

    if (this.stateTracker) {
      currentState = this.stateTracker.getStateAt(characterId, storyTimeNumeric);

      const changes = this.stateTracker.getChangesBetween(
        characterId,
        storyTimeNumeric - 1, // Look back 1 time unit
        storyTimeNumeric
      );

      recentChanges = changes.map(c => ({
        change: c.reason,
        time: c.storyTimeNumeric
      }));
    }

    const relatedContent = this.retrieve({
      involvedEntities: [characterId],
      beforeTime: storyTimeNumeric,
      limit: 5,
      orderBy: 'reverse-chronological'
    });

    return { currentState, recentChanges, relatedContent };
  }

  // ============================================================================
  // Statistics & Management
  // ============================================================================

  /**
   * Get retriever statistics
   */
  getStats(): {
    totalIndexed: number;
    byType: Record<string, number>;
    entitiesCovered: number;
  } {
    const byType: Record<string, number> = {};

    for (const [type, ids] of this.contentByType) {
      byType[type] = ids.length;
    }

    return {
      totalIndexed: this.contentIndex.size,
      byType,
      entitiesCovered: this.contentByEntity.size
    };
  }

  /**
   * Clear all indexed content
   */
  clear(): void {
    this.contentIndex.clear();

    for (const type of this.contentByType.keys()) {
      this.contentByType.set(type, []);
    }

    this.contentByEntity.clear();
  }

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      content: Array.from(this.contentIndex.entries())
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);
    this.clear();

    for (const [, source] of data.content) {
      this.indexContent(source);
    }
  }
}

export default HybridRetriever;
