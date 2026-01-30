/**
 * WHAT-IF Branching System Type Definitions
 *
 * Enables exploration of alternative narrative paths:
 * - Branch points: Decision moments where the story could diverge
 * - Alternatives: Different paths that could be taken
 * - Consequences: Downstream effects of each alternative
 * - Timeline comparison: Analyze differences between branches
 */

// ============================================================================
// Branch Point Types
// ============================================================================

export type BranchPointType =
  | 'character_decision'    // Character makes a choice
  | 'external_event'        // External event could go differently
  | 'revelation'            // Information could be revealed differently
  | 'relationship'          // Relationship could develop differently
  | 'plot_twist'            // Plot could twist differently
  | 'death_survival'        // Character could live or die
  | 'location_change'       // Different location choice
  | 'timeline_change';      // Temporal divergence

export interface BranchPoint {
  branchPointId: string;
  branchType: BranchPointType;

  // Positioning
  storyTime: number;
  storyTimeLabel: string;
  chapterId?: string;
  sceneId?: string;

  // Description
  title: string;
  description: string;

  // The canonical choice (what actually happened)
  canonicalAlternativeId: string;

  // All alternatives (including canonical)
  alternativeIds: string[];

  // Key entities involved
  involvedCharacterIds: string[];
  involvedLocationIds?: string[];

  // Impact assessment
  impactLevel: 'minor' | 'moderate' | 'major' | 'critical';
  narrativeWeight: number;  // 0-1, how important to the story

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  notes?: string;
}

// ============================================================================
// Alternative Types
// ============================================================================

export type AlternativeStatus =
  | 'canonical'      // The path that was taken
  | 'explored'       // Has been written/explored
  | 'outlined'       // Has an outline
  | 'proposed'       // Just proposed, not explored
  | 'rejected';      // Rejected as implausible

export interface Alternative {
  alternativeId: string;
  branchPointId: string;

  // Description
  title: string;
  description: string;
  summary: string;

  // Status
  status: AlternativeStatus;
  isCanonical: boolean;

  // The choice/event
  triggerDescription: string;  // What triggers this path

  // Requirements/conditions
  prerequisites: string[];     // What needs to be true for this path
  plausibility: number;        // 0-1, how plausible is this alternative

  // Consequences (short summaries)
  immediateConsequences: string[];
  longTermConsequences: string[];

  // Linked content
  consequenceIds: string[];
  explorationSceneIds?: string[];  // If written out

  // Character impacts
  characterImpacts: {
    characterId: string;
    characterName: string;
    impact: string;
  }[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  exploredAt?: Date;
}

// ============================================================================
// Consequence Types
// ============================================================================

export type ConsequenceType =
  | 'character_change'      // Character's path changes
  | 'relationship_change'   // Relationship changes
  | 'death'                 // Character dies
  | 'survival'              // Character survives (when they died canonically)
  | 'plot_change'           // Plot thread changes
  | 'world_change'          // World state changes
  | 'power_change'          // Power dynamics change
  | 'knowledge_change';     // Who knows what changes

export interface Consequence {
  consequenceId: string;
  alternativeId: string;
  branchPointId: string;

  // Type and description
  consequenceType: ConsequenceType;
  title: string;
  description: string;

  // Timing
  occursTiming: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  occursAtStoryTime?: number;

  // Affected entities
  affectedEntityIds: string[];
  affectedEntityType: 'character' | 'location' | 'organization' | 'plot_thread';

  // State changes
  stateChanges: {
    entityId: string;
    attribute: string;
    fromValue: unknown;
    toValue: unknown;
  }[];

  // Ripple effects (consequences of this consequence)
  rippleEffectIds: string[];

  // Severity
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic';

  // Metadata
  createdAt: Date;
}

// ============================================================================
// Timeline Comparison Types
// ============================================================================

export interface TimelineComparison {
  comparisonId: string;

  // The alternatives being compared
  baselineAlternativeId: string;     // Usually canonical
  comparedAlternativeId: string;

  // Divergence point
  branchPointId: string;
  divergenceTime: number;

  // Differences
  differences: TimelineDifference[];

  // Summary metrics
  totalDifferences: number;
  characterDifferences: number;
  plotDifferences: number;
  worldDifferences: number;

  // Similarity score (0-1, lower = more different)
  similarityScore: number;

  // Key divergences (most significant)
  keyDivergences: string[];

  createdAt: Date;
}

export interface TimelineDifference {
  differenceId: string;
  comparisonId: string;

  // What differs
  differenceType: 'character_state' | 'relationship' | 'plot_thread' | 'world_state' | 'entity_existence';

  // Entity involved
  entityId: string;
  entityName: string;

  // The difference
  inBaseline: unknown;
  inCompared: unknown;

  // When this difference manifests
  manifestsAtTime: number;

  // Significance
  significance: 'minor' | 'moderate' | 'major' | 'critical';
}

// ============================================================================
// Exploration Session Types
// ============================================================================

export interface ExplorationSession {
  sessionId: string;
  branchPointId: string;
  alternativeId: string;

  // Session info
  startedAt: Date;
  completedAt?: Date;
  status: 'in_progress' | 'completed' | 'abandoned';

  // What was explored
  scenesWritten: number;
  wordsWritten: number;
  consequencesDiscovered: number;

  // Notes
  insights: string[];
  authorNotes?: string;
}

// ============================================================================
// Configuration
// ============================================================================

export interface WhatIfConfig {
  // Branch point settings
  autoDetectBranchPoints: boolean;
  minNarrativeWeight: number;       // Minimum importance to create branch point

  // Alternative settings
  maxAlternativesPerBranch: number;
  requirePlausibilityScore: boolean;
  minPlausibility: number;

  // Exploration settings
  trackExplorations: boolean;
  maxExplorationDepth: number;      // How far to follow consequences

  // Comparison settings
  includeTrivialDifferences: boolean;
}

export const defaultWhatIfConfig: WhatIfConfig = {
  autoDetectBranchPoints: false,
  minNarrativeWeight: 0.3,

  maxAlternativesPerBranch: 5,
  requirePlausibilityScore: true,
  minPlausibility: 0.2,

  trackExplorations: true,
  maxExplorationDepth: 3,

  includeTrivialDifferences: false
};
