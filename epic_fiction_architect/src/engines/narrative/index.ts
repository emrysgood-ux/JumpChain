/**
 * Epic Fiction Architect - Predictive Narrative Engine
 *
 * Unified system combining:
 * - CausalPlotGraph: Event dependency tracking with causal links
 * - ProbabilityMapper: Branching narrative prediction
 * - CascadeSimulator: Butterfly effect world state tracking
 *
 * Based on cutting-edge research from:
 * - Georgia Tech's Fabulist narrative planner (Riedl)
 * - ICLR 2025 causal plot graphs
 * - CHADPOD decision point detection
 * - Chaos theory butterfly effect models
 * - Systemic game design patterns
 *
 * Use cases:
 * - Predict narrative consequences before writing
 * - Ensure causal coherence across epic-length works
 * - Explore "what-if" scenarios
 * - Track world state consistency
 * - Identify plot holes and orphaned events
 */

import {CausalPlotGraph, PlotEvent, CharacterGoal, DramaticConflict} from './causal-plot-graph';
import {ProbabilityMapper, DecisionPoint, NarrativePath, WhatIfResult} from './probability-mapper';
import {CascadeSimulator, WorldStateVar, StateChange, StateValue, SimulationResult, SensitivityAnalysis} from './cascade-simulator';

// Re-export all types and classes
export * from './causal-plot-graph';
export * from './probability-mapper';
export * from './cascade-simulator';

// ============================================================================
// INTEGRATED NARRATIVE PREDICTOR
// ============================================================================

export interface NarrativePrediction {
  /** Most likely path through upcoming decisions */
  likelyPath: NarrativePath | null;

  /** Upcoming decision points */
  upcomingDecisions: DecisionPoint[];

  /** Predicted world state changes */
  predictedStateChanges: StateChange[];

  /** Potential plot holes detected */
  potentialPlotHoles: {
    eventId: string;
    missingConditions: string[];
    suggestion: string;
  }[];

  /** High-sensitivity states to monitor */
  criticalStates: SensitivityAnalysis[];

  /** Unfulfilled narrative promises */
  unfulfilledPromises: {
    description: string;
    plantedAt: number;
    urgency: 'low' | 'medium' | 'high';
  }[];
}

export interface NarrativeAnalysisReport {
  /** Causal structure analysis */
  causalAnalysis: ReturnType<CausalPlotGraph['analyzeCausality']>;

  /** Character intentionality analysis */
  intentionalityAnalysis: ReturnType<CausalPlotGraph['analyzeIntentionality']>;

  /** Dramatic conflict analysis */
  conflictAnalysis: ReturnType<CausalPlotGraph['analyzeConflicts']>;

  /** Decision distribution */
  decisionDistribution: ReturnType<ProbabilityMapper['analyzeDecisionDistribution']>;

  /** Most sensitive world states */
  sensitiveStates: SensitivityAnalysis[];

  /** Overall narrative health score (0-100) */
  healthScore: number;

  /** Specific issues and recommendations */
  issues: {
    severity: 'critical' | 'warning' | 'info';
    category: string;
    description: string;
    recommendation: string;
  }[];
}

/**
 * Unified Predictive Narrative Engine
 */
export class PredictiveNarrativeEngine {
  private plotGraph: CausalPlotGraph;
  private probabilityMapper: ProbabilityMapper;
  private cascadeSimulator: CascadeSimulator;

  constructor() {
    this.plotGraph = new CausalPlotGraph();
    this.probabilityMapper = new ProbabilityMapper();
    this.cascadeSimulator = new CascadeSimulator({
      maxCascadeDepth: 15,
      decayRate: 0.85,
      minMagnitudeThreshold: 0.005
    });
  }

  // ==========================================================================
  // ACCESSORS
  // ==========================================================================

  getPlotGraph(): CausalPlotGraph {
    return this.plotGraph;
  }

  getProbabilityMapper(): ProbabilityMapper {
    return this.probabilityMapper;
  }

  getCascadeSimulator(): CascadeSimulator {
    return this.cascadeSimulator;
  }

  // ==========================================================================
  // EVENT MANAGEMENT
  // ==========================================================================

  /**
   * Add a plot event and automatically update all subsystems
   */
  addPlotEvent(event: Omit<PlotEvent, 'id'>): PlotEvent {
    // Add to causal graph
    const plotEvent = this.plotGraph.addEvent(event);

    // If it's a decision point, add to probability mapper
    if (event.isDecisionPoint) {
      const characterGoals = this.plotGraph['goals'] as unknown as Map<string, CharacterGoal[]>;
      this.probabilityMapper.detectDecisionPoints([plotEvent], characterGoals);
    }

    // Update cascade simulator with established conditions
    for (const condition of event.establishesConditions) {
      this.cascadeSimulator.applyChange(
        condition.id,
        condition.value as StateValue,
        plotEvent.id,
        event.timelinePosition
      );
    }

    return plotEvent;
  }

  /**
   * Register a world state for tracking
   */
  registerWorldState(state: Parameters<CascadeSimulator['registerState']>[0]): WorldStateVar {
    return this.cascadeSimulator.registerState(state);
  }

  /**
   * Add a character goal
   */
  addCharacterGoal(goal: Omit<CharacterGoal, 'id'>): CharacterGoal {
    return this.plotGraph.addGoal(goal);
  }

  /**
   * Add a dramatic conflict
   */
  addConflict(conflict: Omit<DramaticConflict, 'id'>): DramaticConflict {
    return this.plotGraph.addConflict(conflict);
  }

  // ==========================================================================
  // PREDICTION
  // ==========================================================================

  /**
   * Predict narrative outcomes from current position
   */
  predict(
    currentPosition: number,
    factors?: Parameters<ProbabilityMapper['predictMostLikelyPath']>[0]
  ): NarrativePrediction {
    // Get likely path
    const likelyPath = factors
      ? this.probabilityMapper.predictMostLikelyPath(factors)
      : null;

    // Get upcoming decisions
    const upcomingDecisions = this.probabilityMapper.getUpcomingDecisions(
      currentPosition,
      5
    );

    // Predict state changes from likely decisions
    const predictedStateChanges: StateChange[] = [];
    if (likelyPath) {
      for (const step of likelyPath.decisionSequence) {
        const branch = this.probabilityMapper['branches'].get(step.branchId);
        if (branch) {
          for (const condition of branch.favoringConditions) {
            const state = this.cascadeSimulator.getState(condition.id);
            if (state) {
              predictedStateChanges.push({
                id: 'predicted-' + condition.id,
                stateId: condition.id,
                oldValue: state.value,
                newValue: condition.value as StateValue,
                triggeredBy: step.branchId,
                timestamp: 0,
                magnitude: 0.5,
                isDirectChange: false
              });
            }
          }
        }
      }
    }

    // Detect plot holes
    const causalAnalysis = this.plotGraph.analyzeCausality();
    const potentialPlotHoles = causalAnalysis.unsatisfiedEvents.map(({event, missingConditions}) => ({
      eventId: event.id,
      missingConditions: missingConditions.map(c => c.name),
      suggestion: `Event "${event.name}" requires conditions that haven't been established. Consider adding setup for: ${missingConditions.map(c => c.name).join(', ')}`
    }));

    // Get critical states
    const criticalStates = this.cascadeSimulator.findMostSensitiveStates(5);

    // Get unfulfilled promises (from foreshadowing events)
    const unfulfilledPromises: NarrativePrediction['unfulfilledPromises'] = [];
    const foreshadowingEvents = Array.from(this.plotGraph['events'].values())
      .filter(e => e.eventType === 'foreshadowing');

    for (const foreshadow of foreshadowingEvents) {
      // Check if there's a corresponding payoff
      const hasPayoff = Array.from(this.plotGraph['events'].values()).some(
        e => e.eventType === 'payoff' &&
             e.timelinePosition > foreshadow.timelinePosition &&
             e.requiresConditions.some(c =>
               foreshadow.establishesConditions.some(fc => fc.id === c.id)
             )
      );

      if (!hasPayoff) {
        const timeSincePlanted = currentPosition - foreshadow.timelinePosition;
        unfulfilledPromises.push({
          description: foreshadow.description,
          plantedAt: foreshadow.timelinePosition,
          urgency: timeSincePlanted > 100 ? 'high' :
                   timeSincePlanted > 50 ? 'medium' : 'low'
        });
      }
    }

    return {
      likelyPath,
      upcomingDecisions,
      predictedStateChanges,
      potentialPlotHoles,
      criticalStates,
      unfulfilledPromises
    };
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
  ): {
    narrativeResult: WhatIfResult | null;
    worldStateResult: SimulationResult | null;
  } {
    const narrativeResult = this.probabilityMapper.exploreWhatIf(
      decisionPointId,
      alternateBranchId
    );

    let worldStateResult: SimulationResult | null = null;

    // Simulate world state changes
    if (narrativeResult) {
      const stateChanges = narrativeResult.alternativeBranch.favoringConditions.map(c => ({
        stateId: c.id,
        newValue: c.value as StateValue,
        timestamp: narrativeResult.divergencePoint.position
      }));

      if (stateChanges.length > 0) {
        worldStateResult = this.cascadeSimulator.simulateWhatIf(stateChanges);
      }
    }

    return {narrativeResult, worldStateResult};
  }

  // ==========================================================================
  // ANALYSIS
  // ==========================================================================

  /**
   * Generate comprehensive narrative analysis report
   */
  analyze(): NarrativeAnalysisReport {
    const causalAnalysis = this.plotGraph.analyzeCausality();
    const intentionalityAnalysis = this.plotGraph.analyzeIntentionality();
    const conflictAnalysis = this.plotGraph.analyzeConflicts();
    const decisionDistribution = this.probabilityMapper.analyzeDecisionDistribution();
    const sensitiveStates = this.cascadeSimulator.findMostSensitiveStates(10);

    const issues: NarrativeAnalysisReport['issues'] = [];

    // Analyze causal issues
    if (causalAnalysis.unsatisfiedEvents.length > 0) {
      issues.push({
        severity: 'critical',
        category: 'Causality',
        description: `${causalAnalysis.unsatisfiedEvents.length} events have unsatisfied preconditions (plot holes)`,
        recommendation: 'Add setup scenes that establish the required conditions'
      });
    }

    if (causalAnalysis.orphanedEvents.length > 0) {
      issues.push({
        severity: 'warning',
        category: 'Causality',
        description: `${causalAnalysis.orphanedEvents.length} events are disconnected from the main plot`,
        recommendation: 'Connect these events to the main narrative or consider removing them'
      });
    }

    // Analyze intentionality issues
    if (intentionalityAnalysis.unclearMotivations.length > 0) {
      issues.push({
        severity: 'warning',
        category: 'Intentionality',
        description: `${intentionalityAnalysis.unclearMotivations.length} characters have unclear motivations`,
        recommendation: 'Define explicit goals for these characters'
      });
    }

    // Analyze conflict pacing
    for (const pacingIssue of conflictAnalysis.pacingIssues) {
      issues.push({
        severity: 'info',
        category: 'Pacing',
        description: pacingIssue.description,
        recommendation: 'Adjust conflict intensity distribution'
      });
    }

    // Analyze decision distribution
    if (decisionDistribution.averageSignificance < 4) {
      issues.push({
        severity: 'info',
        category: 'Decisions',
        description: 'Decision points have low average significance',
        recommendation: 'Consider adding more high-stakes decisions'
      });
    }

    // Calculate health score
    let healthScore = 100;

    // Deduct for issues
    healthScore -= causalAnalysis.unsatisfiedEvents.length * 10;
    healthScore -= causalAnalysis.orphanedEvents.length * 3;
    healthScore -= intentionalityAnalysis.unclearMotivations.length * 5;
    healthScore -= conflictAnalysis.pacingIssues.length * 2;
    healthScore -= conflictAnalysis.unresolvedConflicts.length * 3;

    // Bonus for good structure
    if (causalAnalysis.maxCausalDepth >= 5) healthScore += 5;
    if (intentionalityAnalysis.goalConflicts.length >= 2) healthScore += 5;
    if (decisionDistribution.averageSignificance >= 6) healthScore += 5;

    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      causalAnalysis,
      intentionalityAnalysis,
      conflictAnalysis,
      decisionDistribution,
      sensitiveStates,
      healthScore,
      issues
    };
  }

  // ==========================================================================
  // STANDARD API METHODS
  // ==========================================================================

  /**
   * Get engine statistics
   */
  getStats(): {
    plotGraphStats: {
      totalEvents: number;
      totalGoals: number;
      totalConflicts: number;
    };
    probabilityMapperStats: {
      totalDecisionPoints: number;
    };
    cascadeSimulatorStats: {
      totalStates: number;
    };
    healthScore: number;
    totalIssues: number;
  } {
    const health = this.analyze();

    // Get counts from subsystems via their toJSON
    const plotData = this.plotGraph.toJSON();
    const probData = this.probabilityMapper.toJSON();
    const cascadeData = this.cascadeSimulator.toJSON();

    return {
      plotGraphStats: {
        totalEvents: plotData.events?.length || 0,
        totalGoals: plotData.goals?.length || 0,
        totalConflicts: plotData.conflicts?.length || 0
      },
      probabilityMapperStats: {
        totalDecisionPoints: probData.decisionPoints?.length || 0
      },
      cascadeSimulatorStats: {
        totalStates: cascadeData.states?.length || 0
      },
      healthScore: health.healthScore,
      totalIssues: health.issues.length
    };
  }

  /**
   * Clear all data and reset to initial state
   */
  clear(): void {
    // Reinitialize all subsystems
    this.plotGraph = new CausalPlotGraph();
    this.probabilityMapper = new ProbabilityMapper();
    this.cascadeSimulator = new CascadeSimulator({
      maxCascadeDepth: 15,
      decayRate: 0.85,
      minMagnitudeThreshold: 0.005
    });
  }

  // ==========================================================================
  // SERIALIZATION
  // ==========================================================================

  /**
   * Export to JSON string (standard API)
   */
  exportToJSON(): string {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  /**
   * Import from JSON string (standard API)
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);
    this.plotGraph = CausalPlotGraph.fromJSON(data.plotGraph);
    this.probabilityMapper = ProbabilityMapper.fromJSON(data.probabilityMapper);
    this.cascadeSimulator = CascadeSimulator.fromJSON(data.cascadeSimulator);
  }

  /**
   * Legacy: Get raw JSON object
   * @deprecated Use exportToJSON() for string output
   */
  toJSON(): {
    plotGraph: ReturnType<CausalPlotGraph['toJSON']>;
    probabilityMapper: ReturnType<ProbabilityMapper['toJSON']>;
    cascadeSimulator: ReturnType<CascadeSimulator['toJSON']>;
  } {
    return {
      plotGraph: this.plotGraph.toJSON(),
      probabilityMapper: this.probabilityMapper.toJSON(),
      cascadeSimulator: this.cascadeSimulator.toJSON()
    };
  }

  /**
   * Legacy: Create from raw JSON object
   * @deprecated Use importFromJSON() for string input
   */
  static fromJSON(data: ReturnType<PredictiveNarrativeEngine['toJSON']>): PredictiveNarrativeEngine {
    const engine = new PredictiveNarrativeEngine();
    engine.plotGraph = CausalPlotGraph.fromJSON(data.plotGraph);
    engine.probabilityMapper = ProbabilityMapper.fromJSON(data.probabilityMapper);
    engine.cascadeSimulator = CascadeSimulator.fromJSON(data.cascadeSimulator);
    return engine;
  }
}

export default PredictiveNarrativeEngine;
