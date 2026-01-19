/**
 * Epic Fiction Architect - Probability Mapper for Branching Narratives
 *
 * Based on research from:
 * - CHADPOD benchmark for Character Decision Points Detection (arXiv 2024)
 * - WHAT-IF branching narrative system (arXiv 2024)
 * - Detroit: Become Human flowchart system
 * - Mark Riedl's work on narrative mediation trees
 *
 * Implements:
 * - Decision point detection in narrative flow
 * - Branching probability calculation
 * - Path likelihood prediction
 * - Narrative satisfaction scoring
 * - "What-if" alternative timeline exploration
 */

import {v4 as uuidv4} from 'uuid';
import type {PlotEvent, WorldCondition, CharacterGoal} from './causal-plot-graph';

// ============================================================================
// TYPES
// ============================================================================

/**
 * A decision point where the narrative can branch
 */
export interface DecisionPoint {
  id: string;
  eventId: string;
  characterId: string;
  description: string;

  /** The choice being made */
  decision: string;

  /** Available branches from this point */
  branches: NarrativeBranch[];

  /** Factors influencing the decision */
  influencingFactors: InfluencingFactor[];

  /** Timeline position */
  position: number;

  /** How significant this decision is (1-10) */
  significance: number;

  /** Whether this decision is reversible */
  reversible: boolean;

  /** Maximum time before consequences become apparent */
  consequenceDelay: number;
}

/**
 * A possible branch from a decision point
 */
export interface NarrativeBranch {
  id: string;
  decisionPointId: string;
  label: string;
  description: string;

  /** Probability of this branch occurring (0-1) */
  baseProbability: number;

  /** Calculated probability given current conditions */
  calculatedProbability: number;

  /** Conditions that make this branch more likely */
  favoringConditions: WorldCondition[];

  /** Conditions that make this branch less likely */
  opposingConditions: WorldCondition[];

  /** Expected narrative impact */
  narrativeImpact: NarrativeImpact;

  /** Events that would follow this branch */
  subsequentEventIds: string[];

  /** Whether this branch was actually taken in the canon story */
  isCanonPath: boolean;

  /** Reader satisfaction prediction for this path (1-10) */
  satisfactionScore: number;
}

/**
 * Factor influencing a character's decision
 */
export interface InfluencingFactor {
  id: string;
  type: InfluenceType;
  description: string;
  source: string;
  weight: number; // -1 to 1 (negative opposes, positive supports)
  targetBranchId: string;
}

export type InfluenceType =
  | 'character_trait'     // Personality trait pushes toward choice
  | 'past_experience'     // Prior events influence decision
  | 'relationship'        // Relationship with another character
  | 'goal_alignment'      // Alignment with character goals
  | 'external_pressure'   // Social/environmental pressure
  | 'information'         // Knowledge the character has
  | 'emotional_state'     // Current emotional state
  | 'moral_code';         // Character's ethics/values

/**
 * Impact assessment for a narrative branch
 */
export interface NarrativeImpact {
  /** How many plot threads are affected */
  threadCount: number;

  /** How many characters are affected */
  characterCount: number;

  /** Immediate consequence severity (1-10) */
  immediateSeverity: number;

  /** Long-term consequence severity (1-10) */
  longTermSeverity: number;

  /** Whether this branch leads to an ending */
  leadsToEnding: boolean;

  /** Whether this creates new possibilities */
  opensNewPaths: boolean;

  /** Whether this closes off existing paths */
  closesExistingPaths: boolean;

  /** Estimated word count affected */
  affectedWordCount: number;
}

/**
 * A complete narrative path through decision points
 */
export interface NarrativePath {
  id: string;
  name: string;
  decisionSequence: {decisionPointId: string; branchId: string}[];
  totalProbability: number;
  cumulativeSatisfaction: number;
  endingType?: 'good' | 'bad' | 'bittersweet' | 'ambiguous' | 'tragic';
  thematicCoherence: number;
}

/**
 * What-if scenario exploration result
 */
export interface WhatIfResult {
  originalPath: NarrativePath;
  alternatePath: NarrativePath;
  divergencePoint: DecisionPoint;
  alternativeBranch: NarrativeBranch;
  consequenceChain: ConsequenceNode[];
  probabilityDifference: number;
  narrativeDifference: string;
}

/**
 * Node in a consequence chain
 */
export interface ConsequenceNode {
  id: string;
  description: string;
  probability: number;
  cumulativeProbability: number;
  affectedEntities: string[];
  triggersNextId?: string;
}

// ============================================================================
// PROBABILITY CALCULATOR
// ============================================================================

export interface ProbabilityFactors {
  characterTraits: Map<string, number>;     // trait -> strength (0-1)
  characterGoals: CharacterGoal[];
  relationships: Map<string, number>;        // characterId -> sentiment (-1 to 1)
  worldState: Map<string, WorldCondition>;
  emotionalState: number;                    // -1 to 1
  priorDecisions: {branchId: string; outcome: 'positive' | 'negative' | 'neutral'}[];
}

/**
 * Calculate probability of taking a specific branch
 */
export function calculateBranchProbability(
  branch: NarrativeBranch,
  factors: ProbabilityFactors,
  influencingFactors: InfluencingFactor[]
): number {
  let probability = branch.baseProbability;

  // Apply influencing factors
  for (const factor of influencingFactors) {
    if (factor.targetBranchId !== branch.id) continue;

    let factorWeight = factor.weight;

    switch (factor.type) {
      case 'character_trait':
        // Strengthen if character has the trait
        const traitStrength = factors.characterTraits.get(factor.source) || 0;
        factorWeight *= traitStrength;
        break;

      case 'goal_alignment':
        // Check if branch aligns with active goals
        const alignedGoals = factors.characterGoals.filter(
          g => g.status === 'active' && g.description.includes(factor.source)
        );
        factorWeight *= alignedGoals.length > 0 ? 1 : 0.5;
        break;

      case 'relationship':
        // Apply relationship sentiment
        const sentiment = factors.relationships.get(factor.source) || 0;
        factorWeight *= (1 + sentiment) / 2;
        break;

      case 'emotional_state':
        // Emotional decisions weighted by emotional intensity
        factorWeight *= Math.abs(factors.emotionalState);
        break;

      case 'past_experience':
        // Check prior decision outcomes
        const relevantPrior = factors.priorDecisions.find(
          p => p.branchId === factor.source
        );
        if (relevantPrior) {
          factorWeight *= relevantPrior.outcome === 'positive' ? 1.2 :
                          relevantPrior.outcome === 'negative' ? 0.6 : 1;
        }
        break;

      default:
        // Use weight as-is
        break;
    }

    probability += factorWeight * 0.1; // Each factor can shift by up to 10%
  }

  // Check favoring conditions
  for (const condition of branch.favoringConditions) {
    if (factors.worldState.has(condition.id)) {
      probability += 0.1;
    }
  }

  // Check opposing conditions
  for (const condition of branch.opposingConditions) {
    if (factors.worldState.has(condition.id)) {
      probability -= 0.1;
    }
  }

  // Normalize to 0-1 range
  return Math.max(0, Math.min(1, probability));
}

// ============================================================================
// PROBABILITY MAPPER ENGINE
// ============================================================================

export class ProbabilityMapper {
  private decisionPoints: Map<string, DecisionPoint> = new Map();
  private branches: Map<string, NarrativeBranch> = new Map();
  private paths: Map<string, NarrativePath> = new Map();
  private canonPath: NarrativePath | null = null;

  constructor() {}

  // ==========================================================================
  // DECISION POINT MANAGEMENT
  // ==========================================================================

  /**
   * Add a decision point to the narrative
   */
  addDecisionPoint(point: Omit<DecisionPoint, 'id'>): DecisionPoint {
    const id = uuidv4();
    const fullPoint: DecisionPoint = {...point, id};
    this.decisionPoints.set(id, fullPoint);

    // Add branches
    for (const branch of point.branches) {
      this.branches.set(branch.id, branch);
    }

    return fullPoint;
  }

  /**
   * Get all decision points in order
   */
  getDecisionPointsInOrder(): DecisionPoint[] {
    return Array.from(this.decisionPoints.values())
      .sort((a, b) => a.position - b.position);
  }

  /**
   * Detect decision points from narrative events
   */
  detectDecisionPoints(
    events: PlotEvent[],
    characterGoals: Map<string, CharacterGoal[]>
  ): DecisionPoint[] {
    const detectedPoints: DecisionPoint[] = [];

    for (const event of events) {
      if (!event.isDecisionPoint) continue;

      // Build branches from alternative outcomes
      const branches: NarrativeBranch[] = [];

      if (event.alternativeOutcomes) {
        for (const outcome of event.alternativeOutcomes) {
          branches.push({
            id: uuidv4(),
            decisionPointId: '', // Will be set after point creation
            label: outcome.description.substring(0, 50),
            description: outcome.description,
            baseProbability: outcome.probability,
            calculatedProbability: outcome.probability,
            favoringConditions: outcome.conditionsEstablished,
            opposingConditions: [],
            narrativeImpact: {
              threadCount: 1,
              characterCount: event.participantIds.length,
              immediateSeverity: outcome.narrativeImpact === 'catastrophic' ? 10 :
                                 outcome.narrativeImpact === 'major' ? 7 :
                                 outcome.narrativeImpact === 'moderate' ? 4 : 2,
              longTermSeverity: 5,
              leadsToEnding: false,
              opensNewPaths: true,
              closesExistingPaths: false,
              affectedWordCount: 0
            },
            subsequentEventIds: [],
            isCanonPath: false,
            satisfactionScore: 5
          });
        }
      }

      // Default branch for what actually happens
      branches.push({
        id: uuidv4(),
        decisionPointId: '',
        label: 'Canon path',
        description: event.description,
        baseProbability: 0.5,
        calculatedProbability: 0.5,
        favoringConditions: event.establishesConditions,
        opposingConditions: [],
        narrativeImpact: {
          threadCount: 1,
          characterCount: event.participantIds.length,
          immediateSeverity: 5,
          longTermSeverity: 5,
          leadsToEnding: false,
          opensNewPaths: false,
          closesExistingPaths: false,
          affectedWordCount: 0
        },
        subsequentEventIds: [],
        isCanonPath: true,
        satisfactionScore: 7
      });

      // Extract influencing factors from goals
      const influencingFactors: InfluencingFactor[] = [];
      for (const participantId of event.participantIds) {
        const goals = characterGoals.get(participantId) || [];
        for (const goal of goals) {
          if (goal.status === 'active') {
            influencingFactors.push({
              id: uuidv4(),
              type: 'goal_alignment',
              description: `Goal: ${goal.description}`,
              source: goal.description,
              weight: goal.priority / 10,
              targetBranchId: branches[branches.length - 1].id // Default to canon
            });
          }
        }
      }

      const point: DecisionPoint = {
        id: uuidv4(),
        eventId: event.id,
        characterId: event.participantIds[0] || '',
        description: event.description,
        decision: event.name,
        branches,
        influencingFactors,
        position: event.timelinePosition,
        significance: event.importance,
        reversible: event.importance < 7,
        consequenceDelay: 1
      };

      // Update branch decisionPointIds
      for (const branch of point.branches) {
        branch.decisionPointId = point.id;
      }

      this.addDecisionPoint(point);
      detectedPoints.push(point);
    }

    return detectedPoints;
  }

  // ==========================================================================
  // PATH ANALYSIS
  // ==========================================================================

  /**
   * Calculate all possible paths through the narrative
   */
  calculatePaths(maxDepth: number = 10): NarrativePath[] {
    const orderedPoints = this.getDecisionPointsInOrder().slice(0, maxDepth);
    const allPaths: NarrativePath[] = [];

    const generatePaths = (
      pointIndex: number,
      currentSequence: {decisionPointId: string; branchId: string}[],
      cumulativeProb: number,
      cumulativeSat: number
    ) => {
      if (pointIndex >= orderedPoints.length) {
        // Create path
        const path: NarrativePath = {
          id: uuidv4(),
          name: `Path ${allPaths.length + 1}`,
          decisionSequence: [...currentSequence],
          totalProbability: cumulativeProb,
          cumulativeSatisfaction: cumulativeSat / Math.max(1, currentSequence.length),
          thematicCoherence: this.calculateThematicCoherence(currentSequence)
        };
        allPaths.push(path);
        return;
      }

      const point = orderedPoints[pointIndex];

      for (const branch of point.branches) {
        generatePaths(
          pointIndex + 1,
          [...currentSequence, {decisionPointId: point.id, branchId: branch.id}],
          cumulativeProb * branch.calculatedProbability,
          cumulativeSat + branch.satisfactionScore
        );
      }
    };

    if (orderedPoints.length > 0) {
      generatePaths(0, [], 1, 0);
    }

    // Store paths
    for (const path of allPaths) {
      this.paths.set(path.id, path);
    }

    return allPaths.sort((a, b) => b.totalProbability - a.totalProbability);
  }

  /**
   * Calculate thematic coherence of a path
   */
  private calculateThematicCoherence(
    sequence: {decisionPointId: string; branchId: string}[]
  ): number {
    if (sequence.length < 2) return 1;

    let coherenceScore = 1;
    let previousImpact: NarrativeImpact | null = null;

    for (const step of sequence) {
      const branch = this.branches.get(step.branchId);
      if (!branch) continue;

      if (previousImpact) {
        // Check for consistency
        const impactDiff = Math.abs(
          branch.narrativeImpact.immediateSeverity - previousImpact.immediateSeverity
        );

        // Large swings in impact reduce coherence
        if (impactDiff > 5) {
          coherenceScore -= 0.1;
        }
      }

      previousImpact = branch.narrativeImpact;
    }

    return Math.max(0, coherenceScore);
  }

  /**
   * Set the canon path (what actually happens in the story)
   */
  setCanonPath(sequence: {decisionPointId: string; branchId: string}[]): void {
    // Mark all branches on this path as canon
    for (const step of sequence) {
      const branch = this.branches.get(step.branchId);
      if (branch) {
        branch.isCanonPath = true;
      }
    }

    this.canonPath = {
      id: 'canon',
      name: 'Canon Path',
      decisionSequence: sequence,
      totalProbability: this.calculatePathProbability(sequence),
      cumulativeSatisfaction: this.calculatePathSatisfaction(sequence),
      thematicCoherence: this.calculateThematicCoherence(sequence)
    };
  }

  /**
   * Calculate total probability of a path
   */
  private calculatePathProbability(
    sequence: {decisionPointId: string; branchId: string}[]
  ): number {
    let prob = 1;
    for (const step of sequence) {
      const branch = this.branches.get(step.branchId);
      if (branch) {
        prob *= branch.calculatedProbability;
      }
    }
    return prob;
  }

  /**
   * Calculate average satisfaction of a path
   */
  private calculatePathSatisfaction(
    sequence: {decisionPointId: string; branchId: string}[]
  ): number {
    let total = 0;
    for (const step of sequence) {
      const branch = this.branches.get(step.branchId);
      if (branch) {
        total += branch.satisfactionScore;
      }
    }
    return sequence.length > 0 ? total / sequence.length : 0;
  }

  // ==========================================================================
  // WHAT-IF EXPLORATION
  // ==========================================================================

  /**
   * Explore what would happen if a different choice was made
   */
  exploreWhatIf(
    decisionPointId: string,
    alternateBranchId: string
  ): WhatIfResult | null {
    const point = this.decisionPoints.get(decisionPointId);
    if (!point || !this.canonPath) return null;

    const alternateBranch = this.branches.get(alternateBranchId);
    if (!alternateBranch) return null;

    // Find the canon branch at this point
    const canonStep = this.canonPath.decisionSequence.find(
      s => s.decisionPointId === decisionPointId
    );
    if (!canonStep) return null;

    // Build alternate path
    const alternateSequence = this.canonPath.decisionSequence.map(step => {
      if (step.decisionPointId === decisionPointId) {
        return {decisionPointId, branchId: alternateBranchId};
      }
      return step;
    });

    const alternatePath: NarrativePath = {
      id: uuidv4(),
      name: 'Alternate Path',
      decisionSequence: alternateSequence,
      totalProbability: this.calculatePathProbability(alternateSequence),
      cumulativeSatisfaction: this.calculatePathSatisfaction(alternateSequence),
      thematicCoherence: this.calculateThematicCoherence(alternateSequence)
    };

    // Build consequence chain
    const consequenceChain = this.buildConsequenceChain(
      alternateBranch,
      point.position
    );

    // Calculate narrative difference
    const narrativeDifference = this.describeNarrativeDifference(
      this.branches.get(canonStep.branchId)!,
      alternateBranch
    );

    return {
      originalPath: this.canonPath,
      alternatePath,
      divergencePoint: point,
      alternativeBranch: alternateBranch,
      consequenceChain,
      probabilityDifference: alternatePath.totalProbability - this.canonPath.totalProbability,
      narrativeDifference
    };
  }

  /**
   * Build a chain of consequences from a branch
   */
  private buildConsequenceChain(
    branch: NarrativeBranch,
    startPosition: number
  ): ConsequenceNode[] {
    const chain: ConsequenceNode[] = [];
    let cumulativeProb = branch.calculatedProbability;

    // First consequence: immediate effect
    chain.push({
      id: uuidv4(),
      description: `Immediate: ${branch.description}`,
      probability: branch.calculatedProbability,
      cumulativeProbability: cumulativeProb,
      affectedEntities: [],
      triggersNextId: undefined
    });

    // Generate cascading consequences based on impact
    const impact = branch.narrativeImpact;

    if (impact.immediateSeverity >= 5) {
      const secondaryProb = 0.8;
      cumulativeProb *= secondaryProb;

      const node: ConsequenceNode = {
        id: uuidv4(),
        description: `Secondary effects on ${impact.characterCount} characters`,
        probability: secondaryProb,
        cumulativeProbability: cumulativeProb,
        affectedEntities: [],
        triggersNextId: undefined
      };

      chain[chain.length - 1].triggersNextId = node.id;
      chain.push(node);
    }

    if (impact.longTermSeverity >= 7) {
      const tertiaryProb = 0.6;
      cumulativeProb *= tertiaryProb;

      const node: ConsequenceNode = {
        id: uuidv4(),
        description: `Long-term repercussions across ${impact.threadCount} plot threads`,
        probability: tertiaryProb,
        cumulativeProbability: cumulativeProb,
        affectedEntities: [],
        triggersNextId: undefined
      };

      chain[chain.length - 1].triggersNextId = node.id;
      chain.push(node);
    }

    return chain;
  }

  /**
   * Describe the narrative difference between two branches
   */
  private describeNarrativeDifference(
    original: NarrativeBranch,
    alternate: NarrativeBranch
  ): string {
    const diffs: string[] = [];

    // Compare impacts
    const origImpact = original.narrativeImpact;
    const altImpact = alternate.narrativeImpact;

    if (altImpact.immediateSeverity > origImpact.immediateSeverity) {
      diffs.push('More immediate consequences');
    } else if (altImpact.immediateSeverity < origImpact.immediateSeverity) {
      diffs.push('Fewer immediate consequences');
    }

    if (altImpact.leadsToEnding && !origImpact.leadsToEnding) {
      diffs.push('Could lead to an ending');
    }

    if (altImpact.opensNewPaths && !origImpact.opensNewPaths) {
      diffs.push('Opens new narrative possibilities');
    }

    if (altImpact.closesExistingPaths && !origImpact.closesExistingPaths) {
      diffs.push('Closes off existing paths');
    }

    // Compare satisfaction
    if (alternate.satisfactionScore > original.satisfactionScore) {
      diffs.push('Potentially more satisfying for readers');
    } else if (alternate.satisfactionScore < original.satisfactionScore) {
      diffs.push('Potentially less satisfying for readers');
    }

    return diffs.length > 0 ? diffs.join('; ') : 'Similar narrative outcomes';
  }

  // ==========================================================================
  // PREDICTION METHODS
  // ==========================================================================

  /**
   * Predict most likely path given current world state
   */
  predictMostLikelyPath(factors: ProbabilityFactors): NarrativePath | null {
    const paths = this.calculatePaths();
    if (paths.length === 0) return null;

    // Recalculate probabilities with current factors
    for (const path of paths) {
      let newProb = 1;

      for (const step of path.decisionSequence) {
        const point = this.decisionPoints.get(step.decisionPointId);
        const branch = this.branches.get(step.branchId);

        if (point && branch) {
          const calcProb = calculateBranchProbability(
            branch,
            factors,
            point.influencingFactors
          );
          newProb *= calcProb;
        }
      }

      path.totalProbability = newProb;
    }

    // Return highest probability path
    return paths.sort((a, b) => b.totalProbability - a.totalProbability)[0];
  }

  /**
   * Get decision points that are upcoming given a position
   */
  getUpcomingDecisions(currentPosition: number, count: number = 3): DecisionPoint[] {
    return this.getDecisionPointsInOrder()
      .filter(p => p.position > currentPosition)
      .slice(0, count);
  }

  /**
   * Analyze decision significance distribution
   */
  analyzeDecisionDistribution(): {
    totalDecisions: number;
    bySignificance: Map<number, number>;
    averageSignificance: number;
    decisionDensity: number; // decisions per timeline unit
  } {
    const points = Array.from(this.decisionPoints.values());
    const bySignificance = new Map<number, number>();

    for (const point of points) {
      const current = bySignificance.get(point.significance) || 0;
      bySignificance.set(point.significance, current + 1);
    }

    const totalSignificance = points.reduce((sum, p) => sum + p.significance, 0);
    const averageSignificance = points.length > 0 ? totalSignificance / points.length : 0;

    // Calculate density (assuming positions are timeline units)
    const positions = points.map(p => p.position);
    const range = positions.length > 0
      ? Math.max(...positions) - Math.min(...positions) + 1
      : 1;

    return {
      totalDecisions: points.length,
      bySignificance,
      averageSignificance,
      decisionDensity: points.length / range
    };
  }

  // ==========================================================================
  // SERIALIZATION
  // ==========================================================================

  toJSON(): {
    decisionPoints: DecisionPoint[];
    branches: NarrativeBranch[];
    paths: NarrativePath[];
    canonPath: NarrativePath | null;
  } {
    return {
      decisionPoints: Array.from(this.decisionPoints.values()),
      branches: Array.from(this.branches.values()),
      paths: Array.from(this.paths.values()),
      canonPath: this.canonPath
    };
  }

  static fromJSON(data: ReturnType<ProbabilityMapper['toJSON']>): ProbabilityMapper {
    const mapper = new ProbabilityMapper();

    for (const point of data.decisionPoints) {
      mapper.decisionPoints.set(point.id, point);
    }
    for (const branch of data.branches) {
      mapper.branches.set(branch.id, branch);
    }
    for (const path of data.paths) {
      mapper.paths.set(path.id, path);
    }
    mapper.canonPath = data.canonPath;

    return mapper;
  }
}

export default ProbabilityMapper;
