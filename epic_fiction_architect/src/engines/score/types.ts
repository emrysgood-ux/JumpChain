/**
 * SCORE Framework Type Definitions
 *
 * State-aware Context Ordering and Retrieval Engine
 * - S: State tracking (entity states over narrative time)
 * - C: Context (hierarchical summarization)
 * - O: Ordering (temporal-aware retrieval)
 * - R: Retrieval (hybrid vector + keyword search)
 * - E: Evaluation (consistency validation)
 */

// ============================================================================
// Entity State Types
// ============================================================================

export interface EntityState {
  entityId: string;
  entityType: 'character' | 'location' | 'object' | 'organization' | 'relationship';
  entityName: string;

  // Temporal positioning
  storyTime: string;           // Narrative time (e.g., "Year 5, Month 3")
  storyTimeNumeric: number;    // Numeric for comparison
  chapterId?: string;
  sceneId?: string;

  // State attributes
  attributes: Record<string, unknown>;

  // Status tracking
  status: 'active' | 'inactive' | 'deceased' | 'destroyed' | 'unknown';

  // Location tracking (for characters)
  currentLocation?: string;

  // Relationship states (for characters)
  relationshipStates?: {
    targetId: string;
    targetName: string;
    relationshipType: string;
    status: string;
    intensity: number; // 0-1
  }[];

  // Knowledge states (what this entity knows)
  knownFacts?: string[];
  secrets?: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  sourceSceneId?: string;
}

export interface StateChange {
  changeId: string;
  entityId: string;

  // When the change occurs
  storyTime: string;
  storyTimeNumeric: number;
  chapterId?: string;
  sceneId?: string;

  // What changed
  attributePath: string;       // e.g., "attributes.health" or "status"
  previousValue: unknown;
  newValue: unknown;

  // Why it changed
  reason: string;
  triggerEventId?: string;

  // Metadata
  timestamp: Date;
}

export interface StateViolation {
  violationId: string;
  entityId: string;
  entityName: string;

  // Violation details
  violationType: 'temporal' | 'logical' | 'continuity' | 'knowledge';
  severity: 'error' | 'warning' | 'info';

  // What's wrong
  description: string;
  expectedState: unknown;
  actualState: unknown;

  // Where it was detected
  detectedInChapter?: string;
  detectedInScene?: string;

  // Resolution
  resolved: boolean;
  resolution?: string;

  timestamp: Date;
}

// ============================================================================
// Hierarchical Summary Types
// ============================================================================

export type SummaryLevel = 'scene' | 'chapter' | 'arc' | 'book' | 'series';

export interface HierarchicalSummary {
  summaryId: string;
  level: SummaryLevel;

  // What this summarizes
  targetId: string;          // sceneId, chapterId, arcId, etc.
  targetName: string;

  // Temporal range
  startTime: string;
  endTime: string;
  startTimeNumeric: number;
  endTimeNumeric: number;

  // Summary content
  briefSummary: string;      // 1-2 sentences
  detailedSummary: string;   // Full paragraph
  bulletPoints: string[];    // Key events

  // Entity involvement
  characters: string[];      // Character IDs
  locations: string[];       // Location IDs
  objects: string[];         // Important objects

  // State changes summarized
  majorStateChanges: {
    entityId: string;
    entityName: string;
    change: string;
  }[];

  // Plot relevance
  plotThreads: string[];     // Plot thread IDs advanced
  foreshadowing: string[];   // Foreshadowing elements
  payoffs: string[];         // Payoffs delivered

  // Child summaries (for hierarchical access)
  childSummaryIds: string[];
  parentSummaryId?: string;

  // Metadata
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SummaryQuery {
  level?: SummaryLevel;

  // Temporal filtering
  afterTime?: number;
  beforeTime?: number;

  // Entity filtering
  involvedCharacters?: string[];
  involvedLocations?: string[];

  // Content filtering
  plotThreads?: string[];
  searchTerms?: string[];

  // Limiting
  limit?: number;
}

// ============================================================================
// Hybrid Retrieval Types
// ============================================================================

export interface RetrievalQuery {
  // Semantic search
  queryText?: string;
  embedding?: number[];

  // Keyword search
  keywords?: string[];
  mustInclude?: string[];
  mustExclude?: string[];

  // Temporal constraints
  pointInTime?: number;      // Retrieve state at this moment
  afterTime?: number;
  beforeTime?: number;

  // Entity constraints
  involvedEntities?: string[];
  entityTypes?: string[];

  // Content type
  contentTypes?: ('scene' | 'summary' | 'state' | 'fact')[];

  // Result configuration
  limit?: number;
  minRelevance?: number;     // 0-1 threshold

  // Ordering
  orderBy?: 'relevance' | 'chronological' | 'reverse-chronological';
}

export interface RetrievalResult {
  resultId: string;
  contentType: 'scene' | 'summary' | 'state' | 'fact';
  sourceId: string;

  // Content
  content: string;
  preview: string;           // First 200 chars

  // Relevance scoring
  relevanceScore: number;    // 0-1
  semanticScore?: number;    // From embedding similarity
  keywordScore?: number;     // From keyword matching
  temporalScore?: number;    // From temporal proximity

  // Temporal positioning
  storyTime?: string;
  storyTimeNumeric?: number;

  // Entity involvement
  entities: string[];

  // Metadata
  sourceChapter?: string;
  sourceScene?: string;
}

// ============================================================================
// Consistency Evaluation Types
// ============================================================================

export interface ConsistencyCheck {
  checkId: string;
  checkType: 'state' | 'timeline' | 'knowledge' | 'relationship' | 'location';

  // What we're checking
  targetId: string;
  targetType: string;

  // The check
  description: string;
  expectedCondition: string;
  actualCondition: string;

  // Result
  passed: boolean;
  severity: 'error' | 'warning' | 'info';

  // Context
  contextIds: string[];      // Related scenes/summaries

  timestamp: Date;
}

export interface EvaluationReport {
  reportId: string;
  generatedAt: Date;

  // Scope
  fromTime?: number;
  toTime?: number;
  chapterIds?: string[];

  // Results
  checksPerformed: number;
  passed: number;
  warnings: number;
  errors: number;

  // Details
  violations: StateViolation[];
  checks: ConsistencyCheck[];

  // Summary
  summary: string;
  recommendations: string[];
}

// ============================================================================
// SCORE Configuration
// ============================================================================

export interface SCOREConfig {
  // State tracking
  trackStateChanges: boolean;
  stateChangeThreshold: number;  // Minimum significance to track

  // Summarization
  autoSummarize: boolean;
  summaryLevels: SummaryLevel[];
  maxSummaryLength: {
    scene: number;
    chapter: number;
    arc: number;
    book: number;
    series: number;
  };

  // Retrieval
  defaultLimit: number;
  minRelevanceThreshold: number;
  semanticWeight: number;        // 0-1
  keywordWeight: number;         // 0-1
  temporalWeight: number;        // 0-1

  // Evaluation
  autoEvaluate: boolean;
  evaluationFrequency: 'scene' | 'chapter' | 'manual';
  strictMode: boolean;           // Treat warnings as errors
}

export const defaultSCOREConfig: SCOREConfig = {
  trackStateChanges: true,
  stateChangeThreshold: 0.1,

  autoSummarize: true,
  summaryLevels: ['scene', 'chapter', 'arc'],
  maxSummaryLength: {
    scene: 100,
    chapter: 300,
    arc: 500,
    book: 1000,
    series: 2000
  },

  defaultLimit: 10,
  minRelevanceThreshold: 0.3,
  semanticWeight: 0.5,
  keywordWeight: 0.3,
  temporalWeight: 0.2,

  autoEvaluate: true,
  evaluationFrequency: 'chapter',
  strictMode: false
};
