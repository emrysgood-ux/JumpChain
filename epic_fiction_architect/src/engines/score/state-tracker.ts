/**
 * SCORE State Tracker
 *
 * Tracks entity states across narrative time:
 * - Character states (location, health, relationships, knowledge)
 * - Location states (ownership, condition, occupants)
 * - Object states (location, ownership, condition)
 * - Organization states (members, power, territory)
 *
 * Enables:
 * - Point-in-time queries ("Where was character X in chapter 5?")
 * - State change tracking ("What changed between chapters 3 and 7?")
 * - Consistency validation ("Is this state possible given prior events?")
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  EntityState,
  StateChange,
  StateViolation
} from './types';

// ============================================================================
// State Tracker
// ============================================================================

export class StateTracker {
  // Current states (latest for each entity)
  private currentStates: Map<string, EntityState> = new Map();

  // Historical states (all states for each entity, sorted by time)
  private stateHistory: Map<string, EntityState[]> = new Map();

  // All state changes
  private changes: Map<string, StateChange> = new Map();
  private changesByEntity: Map<string, string[]> = new Map();

  // Violations detected
  private violations: Map<string, StateViolation> = new Map();
  private violationsByEntity: Map<string, string[]> = new Map();

  // ============================================================================
  // State Recording
  // ============================================================================

  /**
   * Record a new entity state
   */
  recordState(state: Omit<EntityState, 'createdAt' | 'updatedAt'>): EntityState {
    const fullState: EntityState = {
      ...state,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Get previous state for change tracking
    const previousState = this.getStateAt(state.entityId, state.storyTimeNumeric - 0.001);

    // Store in history
    if (!this.stateHistory.has(state.entityId)) {
      this.stateHistory.set(state.entityId, []);
    }
    const history = this.stateHistory.get(state.entityId)!;

    // Insert in chronological order
    const insertIndex = history.findIndex(s => s.storyTimeNumeric > state.storyTimeNumeric);
    if (insertIndex === -1) {
      history.push(fullState);
    } else {
      history.splice(insertIndex, 0, fullState);
    }

    // Update current state if this is the latest
    const currentState = this.currentStates.get(state.entityId);
    if (!currentState || state.storyTimeNumeric >= currentState.storyTimeNumeric) {
      this.currentStates.set(state.entityId, fullState);
    }

    // Track changes from previous state
    if (previousState) {
      this.trackChanges(previousState, fullState);
    }

    return fullState;
  }

  /**
   * Track changes between two states
   */
  private trackChanges(previous: EntityState, current: EntityState): void {
    const entityId = current.entityId;

    // Compare status
    if (previous.status !== current.status) {
      this.recordChange(entityId, current, 'status', previous.status, current.status, 'Status changed');
    }

    // Compare location
    if (previous.currentLocation !== current.currentLocation) {
      this.recordChange(entityId, current, 'currentLocation', previous.currentLocation, current.currentLocation, 'Location changed');
    }

    // Compare attributes
    const allAttrKeys = new Set([
      ...Object.keys(previous.attributes || {}),
      ...Object.keys(current.attributes || {})
    ]);

    for (const key of allAttrKeys) {
      const prevValue = previous.attributes?.[key];
      const currValue = current.attributes?.[key];

      if (JSON.stringify(prevValue) !== JSON.stringify(currValue)) {
        this.recordChange(
          entityId,
          current,
          `attributes.${key}`,
          prevValue,
          currValue,
          `Attribute '${key}' changed`
        );
      }
    }

    // Compare known facts
    const prevFacts = new Set(previous.knownFacts || []);
    const currFacts = new Set(current.knownFacts || []);

    for (const fact of currFacts) {
      if (!prevFacts.has(fact)) {
        this.recordChange(
          entityId,
          current,
          'knownFacts',
          null,
          fact,
          `Learned new fact: ${fact}`
        );
      }
    }
  }

  /**
   * Record a state change
   */
  private recordChange(
    entityId: string,
    state: EntityState,
    attributePath: string,
    previousValue: unknown,
    newValue: unknown,
    reason: string
  ): StateChange {
    const change: StateChange = {
      changeId: uuidv4(),
      entityId,
      storyTime: state.storyTime,
      storyTimeNumeric: state.storyTimeNumeric,
      chapterId: state.chapterId,
      sceneId: state.sceneId,
      attributePath,
      previousValue,
      newValue,
      reason,
      timestamp: new Date()
    };

    this.changes.set(change.changeId, change);

    if (!this.changesByEntity.has(entityId)) {
      this.changesByEntity.set(entityId, []);
    }
    this.changesByEntity.get(entityId)!.push(change.changeId);

    return change;
  }

  // ============================================================================
  // State Queries
  // ============================================================================

  /**
   * Get current state of an entity
   */
  getCurrentState(entityId: string): EntityState | undefined {
    return this.currentStates.get(entityId);
  }

  /**
   * Get entity state at a specific point in narrative time
   */
  getStateAt(entityId: string, storyTimeNumeric: number): EntityState | undefined {
    const history = this.stateHistory.get(entityId);
    if (!history || history.length === 0) return undefined;

    // Find the latest state that's at or before the requested time
    let result: EntityState | undefined;
    for (const state of history) {
      if (state.storyTimeNumeric <= storyTimeNumeric) {
        result = state;
      } else {
        break;
      }
    }

    return result;
  }

  /**
   * Get all states for an entity within a time range
   */
  getStatesInRange(
    entityId: string,
    startTime: number,
    endTime: number
  ): EntityState[] {
    const history = this.stateHistory.get(entityId);
    if (!history) return [];

    return history.filter(
      s => s.storyTimeNumeric >= startTime && s.storyTimeNumeric <= endTime
    );
  }

  /**
   * Get state changes for an entity
   */
  getChanges(entityId: string): StateChange[] {
    const changeIds = this.changesByEntity.get(entityId) || [];
    return changeIds
      .map(id => this.changes.get(id))
      .filter((c): c is StateChange => c !== undefined)
      .sort((a, b) => a.storyTimeNumeric - b.storyTimeNumeric);
  }

  /**
   * Get changes between two points in time
   */
  getChangesBetween(
    entityId: string,
    startTime: number,
    endTime: number
  ): StateChange[] {
    return this.getChanges(entityId).filter(
      c => c.storyTimeNumeric >= startTime && c.storyTimeNumeric <= endTime
    );
  }

  /**
   * Get all entities at a location at a specific time
   */
  getEntitiesAtLocation(locationId: string, storyTimeNumeric: number): EntityState[] {
    const result: EntityState[] = [];

    for (const entityId of this.currentStates.keys()) {
      const state = this.getStateAt(entityId, storyTimeNumeric);
      if (state && state.currentLocation === locationId && state.status === 'active') {
        result.push(state);
      }
    }

    return result;
  }

  /**
   * Get entities that know a specific fact at a given time
   */
  getEntitiesWithKnowledge(fact: string, storyTimeNumeric: number): EntityState[] {
    const result: EntityState[] = [];

    for (const entityId of this.currentStates.keys()) {
      const state = this.getStateAt(entityId, storyTimeNumeric);
      if (state && state.knownFacts?.includes(fact)) {
        result.push(state);
      }
    }

    return result;
  }

  // ============================================================================
  // Validation
  // ============================================================================

  /**
   * Validate a proposed state change
   */
  validateStateChange(
    entityId: string,
    proposedState: Partial<EntityState>,
    storyTimeNumeric: number
  ): { valid: boolean; violations: StateViolation[] } {
    const violations: StateViolation[] = [];
    const currentState = this.getStateAt(entityId, storyTimeNumeric);

    if (!currentState) {
      // No current state - any state is valid for a new entity
      return { valid: true, violations: [] };
    }

    // Check for temporal violations (can't be in two places at once)
    if (proposedState.currentLocation && currentState.currentLocation) {
      // Check if there's a valid transition
      const recentStates = this.getStatesInRange(
        entityId,
        storyTimeNumeric - 0.1,
        storyTimeNumeric
      );

      const hasTransition = recentStates.some(
        s => s.currentLocation !== currentState.currentLocation
      );

      if (!hasTransition && proposedState.currentLocation !== currentState.currentLocation) {
        // Instant teleportation without transition
        const violation = this.createViolation(
          entityId,
          currentState.entityName,
          'temporal',
          'warning',
          `${currentState.entityName} appears to teleport from ${currentState.currentLocation} to ${proposedState.currentLocation} without transition`,
          currentState.currentLocation,
          proposedState.currentLocation
        );
        violations.push(violation);
      }
    }

    // Check for logical violations (dead characters can't act)
    if (currentState.status === 'deceased' && proposedState.status === 'active') {
      const violation = this.createViolation(
        entityId,
        currentState.entityName,
        'logical',
        'error',
        `${currentState.entityName} is deceased but appears active`,
        'deceased',
        'active'
      );
      violations.push(violation);
    }

    // Check for knowledge violations (can't unknow things without magic)
    if (proposedState.knownFacts && currentState.knownFacts) {
      const lostKnowledge = currentState.knownFacts.filter(
        f => !proposedState.knownFacts!.includes(f)
      );

      if (lostKnowledge.length > 0) {
        const violation = this.createViolation(
          entityId,
          currentState.entityName,
          'knowledge',
          'warning',
          `${currentState.entityName} appears to have forgotten: ${lostKnowledge.join(', ')}`,
          currentState.knownFacts,
          proposedState.knownFacts
        );
        violations.push(violation);
      }
    }

    return {
      valid: violations.filter(v => v.severity === 'error').length === 0,
      violations
    };
  }

  /**
   * Create and store a violation
   */
  private createViolation(
    entityId: string,
    entityName: string,
    violationType: StateViolation['violationType'],
    severity: StateViolation['severity'],
    description: string,
    expectedState: unknown,
    actualState: unknown
  ): StateViolation {
    const violation: StateViolation = {
      violationId: uuidv4(),
      entityId,
      entityName,
      violationType,
      severity,
      description,
      expectedState,
      actualState,
      resolved: false,
      timestamp: new Date()
    };

    this.violations.set(violation.violationId, violation);

    if (!this.violationsByEntity.has(entityId)) {
      this.violationsByEntity.set(entityId, []);
    }
    this.violationsByEntity.get(entityId)!.push(violation.violationId);

    return violation;
  }

  /**
   * Get all violations for an entity
   */
  getViolations(entityId?: string, includeResolved = false): StateViolation[] {
    let violations: StateViolation[];

    if (entityId) {
      const violationIds = this.violationsByEntity.get(entityId) || [];
      violations = violationIds
        .map(id => this.violations.get(id))
        .filter((v): v is StateViolation => v !== undefined);
    } else {
      violations = Array.from(this.violations.values());
    }

    if (!includeResolved) {
      violations = violations.filter(v => !v.resolved);
    }

    return violations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Resolve a violation
   */
  resolveViolation(violationId: string, resolution: string): void {
    const violation = this.violations.get(violationId);
    if (violation) {
      violation.resolved = true;
      violation.resolution = resolution;
    }
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  getStats(): {
    totalEntities: number;
    entitiesByType: Record<string, number>;
    totalStates: number;
    totalChanges: number;
    unresolvedViolations: number;
    violationsBySeverity: Record<string, number>;
  } {
    const entitiesByType: Record<string, number> = {};
    let totalStates = 0;

    for (const [, state] of this.currentStates) {
      entitiesByType[state.entityType] = (entitiesByType[state.entityType] || 0) + 1;
    }

    for (const [, history] of this.stateHistory) {
      totalStates += history.length;
    }

    const unresolvedViolations = this.getViolations(undefined, false);
    const violationsBySeverity: Record<string, number> = {};

    for (const v of unresolvedViolations) {
      violationsBySeverity[v.severity] = (violationsBySeverity[v.severity] || 0) + 1;
    }

    return {
      totalEntities: this.currentStates.size,
      entitiesByType,
      totalStates,
      totalChanges: this.changes.size,
      unresolvedViolations: unresolvedViolations.length,
      violationsBySeverity
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.currentStates.clear();
    this.stateHistory.clear();
    this.changes.clear();
    this.changesByEntity.clear();
    this.violations.clear();
    this.violationsByEntity.clear();
  }

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      currentStates: Array.from(this.currentStates.entries()),
      stateHistory: Array.from(this.stateHistory.entries()),
      changes: Array.from(this.changes.entries()),
      violations: Array.from(this.violations.entries())
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.currentStates = new Map(data.currentStates);
    this.stateHistory = new Map(data.stateHistory);
    this.changes = new Map(data.changes);
    this.violations = new Map(data.violations);

    // Rebuild indexes
    this.changesByEntity.clear();
    for (const [changeId, change] of this.changes) {
      if (!this.changesByEntity.has(change.entityId)) {
        this.changesByEntity.set(change.entityId, []);
      }
      this.changesByEntity.get(change.entityId)!.push(changeId);
    }

    this.violationsByEntity.clear();
    for (const [violationId, violation] of this.violations) {
      if (!this.violationsByEntity.has(violation.entityId)) {
        this.violationsByEntity.set(violation.entityId, []);
      }
      this.violationsByEntity.get(violation.entityId)!.push(violationId);
    }
  }
}

export default StateTracker;
