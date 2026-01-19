/**
 * Epic Fiction Architect - Cascade Simulator (Butterfly Effect Engine)
 *
 * Based on research from:
 * - Chaos theory and the butterfly effect (Lorenz, 1963)
 * - Detroit: Become Human's consequence tracking system
 * - Systemic game design patterns
 * - Quality-based narrative systems (Alexis Kennedy)
 *
 * Implements:
 * - World state tracking with cascading updates
 * - Butterfly effect simulation (small changes → large consequences)
 * - Consequence chains with probability decay
 * - State propagation through entity relationships
 * - Sensitivity analysis for plot pivots
 */

import {v4 as uuidv4} from 'uuid';

// ============================================================================
// TYPES
// ============================================================================

/**
 * A state variable in the story world
 */
export interface WorldStateVar {
  id: string;
  name: string;
  category: StateCategory;
  entityId?: string;
  value: StateValue;
  previousValues: {value: StateValue; changedAt: number; changedBy: string}[];
  sensitivity: number; // 0-1, how likely this state affects others
  volatility: number;  // 0-1, how often this state changes
  dependencies: string[]; // Other state IDs this depends on
  dependents: string[];   // State IDs that depend on this
}

export type StateCategory =
  | 'character'      // Character attributes
  | 'relationship'   // Relationship between characters
  | 'location'       // Location attributes
  | 'object'         // Object states
  | 'faction'        // Faction standings
  | 'global'         // World-level states
  | 'plot'           // Plot thread states
  | 'secret';        // Hidden information

export type StateValue =
  | boolean
  | number
  | string
  | { min: number; max: number; current: number }  // Bounded numeric
  | string[];  // Enum/flags

/**
 * A change to world state
 */
export interface StateChange {
  id: string;
  stateId: string;
  oldValue: StateValue;
  newValue: StateValue;
  triggeredBy: string; // Event or change ID
  timestamp: number;
  magnitude: number; // 0-1, size of change
  isDirectChange: boolean; // Direct vs cascaded
}

/**
 * A cascade effect from one change to others
 */
export interface CascadeEffect {
  id: string;
  sourceChangeId: string;
  affectedStateIds: string[];
  propagationPath: string[]; // Chain of state IDs
  totalMagnitude: number;
  decayFactor: number;
  description: string;
}

/**
 * Rules for how states propagate changes
 */
export interface PropagationRule {
  id: string;
  sourceStateId: string;
  targetStateId: string;
  condition: PropagationCondition;
  effect: PropagationEffect;
  delay: number; // How many timeline units before effect occurs
  probability: number; // 0-1, chance of propagation
  description: string;
}

export interface PropagationCondition {
  type: 'threshold' | 'change_direction' | 'value_match' | 'always';
  threshold?: number;
  direction?: 'increase' | 'decrease' | 'any';
  matchValue?: StateValue;
}

export interface PropagationEffect {
  type: 'set' | 'increment' | 'decrement' | 'multiply' | 'toggle';
  value?: StateValue;
  amount?: number;
  factor?: number;
}

/**
 * Sensitivity analysis result
 */
export interface SensitivityAnalysis {
  stateId: string;
  stateName: string;
  butterflyCoefficent: number; // How much change this state causes
  reachableStates: number;
  maxCascadeDepth: number;
  criticalThresholds: number[];
  highImpactScenarios: {change: StateChange; cascadeSize: number}[];
}

/**
 * Simulation result
 */
export interface SimulationResult {
  initialStates: Map<string, StateValue>;
  finalStates: Map<string, StateValue>;
  changes: StateChange[];
  cascades: CascadeEffect[];
  timeline: {position: number; changes: StateChange[]}[];
  totalCascadeEvents: number;
  maxCascadeDepth: number;
  mostAffectedStates: {stateId: string; changeCount: number}[];
}

// ============================================================================
// CASCADE SIMULATOR ENGINE
// ============================================================================

export class CascadeSimulator {
  private states: Map<string, WorldStateVar> = new Map();
  private rules: Map<string, PropagationRule> = new Map();
  private changeHistory: StateChange[] = [];
  private cascadeHistory: CascadeEffect[] = [];

  // Configuration
  private maxCascadeDepth = 10;
  private decayRate = 0.8; // Each level reduces effect by 20%
  private minMagnitudeThreshold = 0.01; // Stop cascading below this

  constructor(config?: {
    maxCascadeDepth?: number;
    decayRate?: number;
    minMagnitudeThreshold?: number;
  }) {
    if (config) {
      this.maxCascadeDepth = config.maxCascadeDepth ?? this.maxCascadeDepth;
      this.decayRate = config.decayRate ?? this.decayRate;
      this.minMagnitudeThreshold = config.minMagnitudeThreshold ?? this.minMagnitudeThreshold;
    }
  }

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  /**
   * Register a state variable
   */
  registerState(state: Omit<WorldStateVar, 'id' | 'previousValues' | 'dependents'>): WorldStateVar {
    const id = state.name.replace(/\s+/g, '_').toLowerCase() + '_' + uuidv4().substring(0, 8);
    const fullState: WorldStateVar = {
      ...state,
      id,
      previousValues: [],
      dependents: []
    };

    this.states.set(id, fullState);

    // Update dependents of dependencies
    for (const depId of state.dependencies) {
      const dep = this.states.get(depId);
      if (dep) {
        dep.dependents.push(id);
      }
    }

    return fullState;
  }

  /**
   * Get current value of a state
   */
  getState(id: string): WorldStateVar | undefined {
    return this.states.get(id);
  }

  /**
   * Get all states for an entity
   */
  getEntityStates(entityId: string): WorldStateVar[] {
    return Array.from(this.states.values())
      .filter(s => s.entityId === entityId);
  }

  /**
   * Get all states in a category
   */
  getStatesByCategory(category: StateCategory): WorldStateVar[] {
    return Array.from(this.states.values())
      .filter(s => s.category === category);
  }

  // ==========================================================================
  // PROPAGATION RULES
  // ==========================================================================

  /**
   * Add a propagation rule
   */
  addRule(rule: Omit<PropagationRule, 'id'>): PropagationRule {
    const id = uuidv4();
    const fullRule: PropagationRule = {...rule, id};
    this.rules.set(id, fullRule);

    // Update state dependencies
    const sourceState = this.states.get(rule.sourceStateId);
    const targetState = this.states.get(rule.targetStateId);

    if (sourceState && targetState) {
      if (!targetState.dependencies.includes(rule.sourceStateId)) {
        targetState.dependencies.push(rule.sourceStateId);
      }
      if (!sourceState.dependents.includes(rule.targetStateId)) {
        sourceState.dependents.push(rule.targetStateId);
      }
    }

    return fullRule;
  }

  /**
   * Auto-generate common propagation rules
   */
  autoGenerateRules(): PropagationRule[] {
    const generated: PropagationRule[] = [];

    // Relationship symmetry: if A's relationship with B changes, B's with A may change
    const relationshipStates = this.getStatesByCategory('relationship');
    for (const state of relationshipStates) {
      // Find reciprocal relationship
      const reciprocal = relationshipStates.find(s =>
        s.id !== state.id &&
        s.name.includes('relationship') &&
        // Heuristic: same entities mentioned
        state.entityId && s.entityId &&
        state.name.includes(s.entityId)
      );

      if (reciprocal) {
        generated.push(this.addRule({
          sourceStateId: state.id,
          targetStateId: reciprocal.id,
          condition: {type: 'change_direction', direction: 'any'},
          effect: {type: 'increment', amount: 0.3},
          delay: 1,
          probability: 0.7,
          description: 'Relationship reciprocity'
        }));
      }
    }

    // Faction standing affects faction member relationships
    const factionStates = this.getStatesByCategory('faction');
    for (const factionState of factionStates) {
      const memberStates = this.getStatesByCategory('character')
        .filter(s => s.name.includes('faction_loyalty'));

      for (const memberState of memberStates) {
        generated.push(this.addRule({
          sourceStateId: factionState.id,
          targetStateId: memberState.id,
          condition: {type: 'threshold', threshold: 0.5},
          effect: {type: 'multiply', factor: 0.9},
          delay: 2,
          probability: 0.5,
          description: 'Faction standing affects member loyalty'
        }));
      }
    }

    return generated;
  }

  // ==========================================================================
  // STATE CHANGES
  // ==========================================================================

  /**
   * Apply a direct change to a state
   */
  applyChange(
    stateId: string,
    newValue: StateValue,
    triggeredBy: string,
    timestamp: number
  ): StateChange | null {
    const state = this.states.get(stateId);
    if (!state) return null;

    const oldValue = state.value;
    const magnitude = this.calculateChangeMagnitude(oldValue, newValue);

    const change: StateChange = {
      id: uuidv4(),
      stateId,
      oldValue,
      newValue,
      triggeredBy,
      timestamp,
      magnitude,
      isDirectChange: true
    };

    // Update state
    state.previousValues.push({
      value: oldValue,
      changedAt: timestamp,
      changedBy: triggeredBy
    });
    state.value = newValue;

    this.changeHistory.push(change);

    // Trigger cascade
    this.propagateCascade(change, timestamp);

    return change;
  }

  /**
   * Calculate magnitude of a state change (0-1)
   */
  private calculateChangeMagnitude(oldValue: StateValue, newValue: StateValue): number {
    if (typeof oldValue === 'boolean' && typeof newValue === 'boolean') {
      return oldValue !== newValue ? 1 : 0;
    }

    if (typeof oldValue === 'number' && typeof newValue === 'number') {
      return Math.min(1, Math.abs(newValue - oldValue) / Math.max(1, Math.abs(oldValue)));
    }

    if (typeof oldValue === 'string' && typeof newValue === 'string') {
      return oldValue !== newValue ? 0.5 : 0;
    }

    if (typeof oldValue === 'object' && typeof newValue === 'object') {
      if ('current' in oldValue && 'current' in newValue) {
        const range = (oldValue as any).max - (oldValue as any).min;
        return Math.abs((newValue as any).current - (oldValue as any).current) / range;
      }
    }

    return 0.5; // Default for unknown types
  }

  // ==========================================================================
  // CASCADE PROPAGATION
  // ==========================================================================

  /**
   * Propagate cascading effects from a change
   */
  private propagateCascade(
    sourceChange: StateChange,
    timestamp: number,
    depth: number = 0,
    path: string[] = []
  ): CascadeEffect | null {
    if (depth >= this.maxCascadeDepth) return null;

    const sourceState = this.states.get(sourceChange.stateId);
    if (!sourceState) return null;

    const currentPath = [...path, sourceChange.stateId];
    const affectedStateIds: string[] = [];
    const cascadedChanges: StateChange[] = [];

    // Find applicable rules
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => rule.sourceStateId === sourceChange.stateId);

    for (const rule of applicableRules) {
      // Check condition
      if (!this.checkCondition(rule.condition, sourceChange)) continue;

      // Check probability
      if (Math.random() > rule.probability) continue;

      // Prevent cycles
      if (currentPath.includes(rule.targetStateId)) continue;

      // Calculate decayed magnitude
      const decayedMagnitude = sourceChange.magnitude * Math.pow(this.decayRate, depth);
      if (decayedMagnitude < this.minMagnitudeThreshold) continue;

      // Apply effect
      const targetState = this.states.get(rule.targetStateId);
      if (!targetState) continue;

      const newValue = this.applyEffect(rule.effect, targetState.value, decayedMagnitude);
      if (newValue === null) continue;

      const cascadedChange: StateChange = {
        id: uuidv4(),
        stateId: rule.targetStateId,
        oldValue: targetState.value,
        newValue,
        triggeredBy: sourceChange.id,
        timestamp: timestamp + rule.delay,
        magnitude: decayedMagnitude,
        isDirectChange: false
      };

      // Update state
      targetState.previousValues.push({
        value: targetState.value,
        changedAt: timestamp + rule.delay,
        changedBy: sourceChange.id
      });
      targetState.value = newValue;

      this.changeHistory.push(cascadedChange);
      affectedStateIds.push(rule.targetStateId);
      cascadedChanges.push(cascadedChange);
    }

    // Recursively propagate from cascaded changes
    for (const cascadedChange of cascadedChanges) {
      this.propagateCascade(
        cascadedChange,
        timestamp + 1,
        depth + 1,
        currentPath
      );
    }

    if (affectedStateIds.length > 0) {
      const cascade: CascadeEffect = {
        id: uuidv4(),
        sourceChangeId: sourceChange.id,
        affectedStateIds,
        propagationPath: currentPath,
        totalMagnitude: sourceChange.magnitude * Math.pow(this.decayRate, depth),
        decayFactor: Math.pow(this.decayRate, depth),
        description: `Cascade from ${sourceState.name} affecting ${affectedStateIds.length} states`
      };

      this.cascadeHistory.push(cascade);
      return cascade;
    }

    return null;
  }

  /**
   * Check if a propagation condition is met
   */
  private checkCondition(
    condition: PropagationCondition,
    change: StateChange
  ): boolean {
    switch (condition.type) {
      case 'always':
        return true;

      case 'threshold':
        if (typeof change.newValue === 'number' && condition.threshold !== undefined) {
          return change.newValue >= condition.threshold;
        }
        return false;

      case 'change_direction':
        if (typeof change.oldValue === 'number' && typeof change.newValue === 'number') {
          const increased = change.newValue > change.oldValue;
          const decreased = change.newValue < change.oldValue;

          if (condition.direction === 'increase') return increased;
          if (condition.direction === 'decrease') return decreased;
          return increased || decreased;
        }
        return false;

      case 'value_match':
        return change.newValue === condition.matchValue;

      default:
        return false;
    }
  }

  /**
   * Apply a propagation effect
   */
  private applyEffect(
    effect: PropagationEffect,
    currentValue: StateValue,
    magnitude: number
  ): StateValue | null {
    switch (effect.type) {
      case 'set':
        return effect.value ?? null;

      case 'increment':
        if (typeof currentValue === 'number' && effect.amount !== undefined) {
          return currentValue + (effect.amount * magnitude);
        }
        return null;

      case 'decrement':
        if (typeof currentValue === 'number' && effect.amount !== undefined) {
          return currentValue - (effect.amount * magnitude);
        }
        return null;

      case 'multiply':
        if (typeof currentValue === 'number' && effect.factor !== undefined) {
          const scaledFactor = 1 + (effect.factor - 1) * magnitude;
          return currentValue * scaledFactor;
        }
        return null;

      case 'toggle':
        if (typeof currentValue === 'boolean') {
          return !currentValue;
        }
        return null;

      default:
        return null;
    }
  }

  // ==========================================================================
  // SIMULATION
  // ==========================================================================

  /**
   * Run a simulation with a sequence of changes
   */
  simulate(
    changes: {stateId: string; newValue: StateValue; timestamp: number}[],
    eventId: string = 'simulation'
  ): SimulationResult {
    // Snapshot initial states
    const initialStates = new Map<string, StateValue>();
    for (const [id, state] of this.states) {
      initialStates.set(id, JSON.parse(JSON.stringify(state.value)));
    }

    const startHistoryLength = this.changeHistory.length;
    const startCascadeLength = this.cascadeHistory.length;

    // Apply changes
    for (const change of changes) {
      this.applyChange(change.stateId, change.newValue, eventId, change.timestamp);
    }

    // Collect results
    const newChanges = this.changeHistory.slice(startHistoryLength);
    const newCascades = this.cascadeHistory.slice(startCascadeLength);

    // Build timeline
    const timelineMap = new Map<number, StateChange[]>();
    for (const change of newChanges) {
      const existing = timelineMap.get(change.timestamp) || [];
      existing.push(change);
      timelineMap.set(change.timestamp, existing);
    }

    const timeline = Array.from(timelineMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([position, changes]) => ({position, changes}));

    // Snapshot final states
    const finalStates = new Map<string, StateValue>();
    for (const [id, state] of this.states) {
      finalStates.set(id, JSON.parse(JSON.stringify(state.value)));
    }

    // Find most affected states
    const affectedCounts = new Map<string, number>();
    for (const change of newChanges) {
      const current = affectedCounts.get(change.stateId) || 0;
      affectedCounts.set(change.stateId, current + 1);
    }

    const mostAffectedStates = Array.from(affectedCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([stateId, changeCount]) => ({stateId, changeCount}));

    // Calculate max cascade depth
    let maxCascadeDepth = 0;
    for (const cascade of newCascades) {
      maxCascadeDepth = Math.max(maxCascadeDepth, cascade.propagationPath.length);
    }

    return {
      initialStates,
      finalStates,
      changes: newChanges,
      cascades: newCascades,
      timeline,
      totalCascadeEvents: newCascades.length,
      maxCascadeDepth,
      mostAffectedStates
    };
  }

  /**
   * Run a "what-if" simulation without persisting changes
   */
  simulateWhatIf(
    changes: {stateId: string; newValue: StateValue; timestamp: number}[]
  ): SimulationResult {
    // Clone current state
    const originalStates = new Map<string, WorldStateVar>();
    for (const [id, state] of this.states) {
      originalStates.set(id, JSON.parse(JSON.stringify(state)));
    }

    const originalHistory = [...this.changeHistory];
    const originalCascades = [...this.cascadeHistory];

    // Run simulation
    const result = this.simulate(changes, 'what-if');

    // Restore original state
    this.states = originalStates;
    this.changeHistory = originalHistory;
    this.cascadeHistory = originalCascades;

    return result;
  }

  // ==========================================================================
  // SENSITIVITY ANALYSIS
  // ==========================================================================

  /**
   * Analyze how sensitive the world is to changes in a specific state
   */
  analyzeSensitivity(stateId: string): SensitivityAnalysis {
    const state = this.states.get(stateId);
    if (!state) {
      throw new Error(`State ${stateId} not found`);
    }

    // Find all reachable states through propagation
    const reachable = new Set<string>();
    const queue = [stateId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (reachable.has(current)) continue;
      reachable.add(current);

      // Find rules where this is the source
      const outgoingRules = Array.from(this.rules.values())
        .filter(r => r.sourceStateId === current);

      for (const rule of outgoingRules) {
        queue.push(rule.targetStateId);
      }
    }

    // Calculate max cascade depth
    const depths = new Map<string, number>();
    depths.set(stateId, 0);

    const depthQueue = [stateId];
    while (depthQueue.length > 0) {
      const current = depthQueue.shift()!;
      const currentDepth = depths.get(current)!;

      const outgoing = Array.from(this.rules.values())
        .filter(r => r.sourceStateId === current);

      for (const rule of outgoing) {
        const existingDepth = depths.get(rule.targetStateId) ?? -1;
        if (currentDepth + 1 > existingDepth) {
          depths.set(rule.targetStateId, currentDepth + 1);
          depthQueue.push(rule.targetStateId);
        }
      }
    }

    const maxCascadeDepth = Math.max(...Array.from(depths.values()));

    // Test different change magnitudes to find critical thresholds
    const criticalThresholds: number[] = [];
    const testValues = [0.1, 0.25, 0.5, 0.75, 0.9, 1.0];

    for (const testMagnitude of testValues) {
      const testChange: StateChange = {
        id: 'test',
        stateId,
        oldValue: 0,
        newValue: 1,
        triggeredBy: 'test',
        timestamp: 0,
        magnitude: testMagnitude,
        isDirectChange: true
      };

      // Count how many cascades this would trigger
      let cascadeCount = 0;
      const checkRules = Array.from(this.rules.values())
        .filter(r => r.sourceStateId === stateId);

      for (const rule of checkRules) {
        if (this.checkCondition(rule.condition, testChange)) {
          cascadeCount++;
        }
      }

      if (cascadeCount > 0 && !criticalThresholds.includes(testMagnitude)) {
        criticalThresholds.push(testMagnitude);
      }
    }

    // Calculate butterfly coefficient (normalized influence score)
    const butterflyCoefficent =
      (reachable.size / Math.max(1, this.states.size)) *
      (maxCascadeDepth / this.maxCascadeDepth) *
      state.sensitivity;

    // Find high-impact scenarios
    const highImpactScenarios: SensitivityAnalysis['highImpactScenarios'] = [];

    if (typeof state.value === 'number') {
      // Test extreme changes
      const extremeChanges = [
        {value: 0, description: 'to minimum'},
        {value: 1, description: 'to maximum'},
        {value: state.value * 2, description: 'doubled'},
        {value: state.value * -1, description: 'inverted'}
      ];

      for (const extreme of extremeChanges) {
        const simulation = this.simulateWhatIf([
          {stateId, newValue: extreme.value, timestamp: 0}
        ]);

        if (simulation.totalCascadeEvents > 0) {
          highImpactScenarios.push({
            change: simulation.changes[0],
            cascadeSize: simulation.totalCascadeEvents
          });
        }
      }
    }

    return {
      stateId,
      stateName: state.name,
      butterflyCoefficent,
      reachableStates: reachable.size - 1, // Exclude self
      maxCascadeDepth,
      criticalThresholds,
      highImpactScenarios
    };
  }

  /**
   * Find the most sensitive states in the world
   */
  findMostSensitiveStates(topN: number = 10): SensitivityAnalysis[] {
    const analyses: SensitivityAnalysis[] = [];

    for (const [stateId] of this.states) {
      analyses.push(this.analyzeSensitivity(stateId));
    }

    return analyses
      .sort((a, b) => b.butterflyCoefficent - a.butterflyCoefficent)
      .slice(0, topN);
  }

  // ==========================================================================
  // VISUALIZATION DATA
  // ==========================================================================

  /**
   * Generate dependency graph data for visualization
   */
  getDependencyGraph(): {
    nodes: {id: string; label: string; category: StateCategory; sensitivity: number}[];
    edges: {source: string; target: string; probability: number}[];
  } {
    const nodes = Array.from(this.states.values()).map(s => ({
      id: s.id,
      label: s.name,
      category: s.category,
      sensitivity: s.sensitivity
    }));

    const edges = Array.from(this.rules.values()).map(r => ({
      source: r.sourceStateId,
      target: r.targetStateId,
      probability: r.probability
    }));

    return {nodes, edges};
  }

  /**
   * Get cascade history for a time range
   */
  getCascadeHistory(startTime: number, endTime: number): CascadeEffect[] {
    return this.cascadeHistory.filter(c => {
      const sourceChange = this.changeHistory.find(ch => ch.id === c.sourceChangeId);
      return sourceChange &&
             sourceChange.timestamp >= startTime &&
             sourceChange.timestamp <= endTime;
    });
  }

  // ==========================================================================
  // SERIALIZATION
  // ==========================================================================

  toJSON(): {
    states: WorldStateVar[];
    rules: PropagationRule[];
    changeHistory: StateChange[];
    cascadeHistory: CascadeEffect[];
    config: {maxCascadeDepth: number; decayRate: number; minMagnitudeThreshold: number};
  } {
    return {
      states: Array.from(this.states.values()),
      rules: Array.from(this.rules.values()),
      changeHistory: this.changeHistory,
      cascadeHistory: this.cascadeHistory,
      config: {
        maxCascadeDepth: this.maxCascadeDepth,
        decayRate: this.decayRate,
        minMagnitudeThreshold: this.minMagnitudeThreshold
      }
    };
  }

  static fromJSON(data: ReturnType<CascadeSimulator['toJSON']>): CascadeSimulator {
    const simulator = new CascadeSimulator(data.config);

    for (const state of data.states) {
      simulator.states.set(state.id, state);
    }
    for (const rule of data.rules) {
      simulator.rules.set(rule.id, rule);
    }
    simulator.changeHistory = data.changeHistory;
    simulator.cascadeHistory = data.cascadeHistory;

    return simulator;
  }
}

export default CascadeSimulator;
