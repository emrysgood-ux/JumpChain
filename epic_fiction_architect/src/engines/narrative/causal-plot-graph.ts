/**
 * Epic Fiction Architect - Causal Plot Graph Engine
 *
 * Based on research from:
 * - Riedl's Fabulist narrative planner (Georgia Tech)
 * - ICLR 2025 "R^2: LLM-Based Novel-to-Screenplay with Causal Plot Graphs"
 * - Li et al. "Constructing Narrative Event Evolutionary Graph" (IJCAI 2018)
 *
 * Implements:
 * - Causal links between story events (s1 →e s2 where s1 establishes condition e for s2)
 * - Character intentionality tracking
 * - Dramatic conflict detection
 * - Temporal ordering with partial order constraints
 * - Narrative gap detection
 *
 * Critical for ensuring plot coherence in 300M+ word narratives where
 * cause-effect chains span thousands of pages.
 */

import {v4 as uuidv4} from 'uuid';

// ============================================================================
// TYPES
// ============================================================================

/**
 * A plot event is any discrete occurrence in the narrative
 */
export interface PlotEvent {
  id: string;
  name: string;
  description: string;
  sceneId?: string;
  chapterId?: string;

  /** When this event occurs (for temporal ordering) */
  timelinePosition: number;

  /** Event type for categorization */
  eventType: PlotEventType;

  /** Characters involved */
  participantIds: string[];

  /** Conditions this event establishes in the world */
  establishesConditions: WorldCondition[];

  /** Conditions this event requires to occur */
  requiresConditions: WorldCondition[];

  /** Character goals this event advances or blocks */
  affectsGoals: GoalEffect[];

  /** Importance for plot (1-10) */
  importance: number;

  /** Whether this is a decision point for characters */
  isDecisionPoint: boolean;

  /** Alternative outcomes if this is a decision point */
  alternativeOutcomes?: AlternativeOutcome[];
}

export type PlotEventType =
  | 'action'           // Character takes action
  | 'reaction'         // Character reacts to stimulus
  | 'revelation'       // Information is revealed
  | 'decision'         // Character makes choice
  | 'consequence'      // Result of prior action
  | 'conflict'         // Conflict occurs
  | 'resolution'       // Conflict resolves
  | 'transformation'   // Character/world changes
  | 'foreshadowing'    // Setup for future event
  | 'payoff';          // Fulfillment of setup

/**
 * A condition in the story world
 */
export interface WorldCondition {
  id: string;
  name: string;
  category: ConditionCategory;
  value: unknown;
  affectedEntityIds: string[];
  isNegatable: boolean;
}

export type ConditionCategory =
  | 'character_state'    // Character is alive, injured, etc.
  | 'character_location' // Character is at location X
  | 'character_knowledge'// Character knows fact X
  | 'character_relationship' // Relationship state
  | 'object_state'       // Object exists, is broken, etc.
  | 'object_location'    // Object is at location X
  | 'world_state'        // Global world condition
  | 'plot_state';        // Plot thread status

/**
 * Effect on a character's goal
 */
export interface GoalEffect {
  goalId: string;
  characterId: string;
  effect: 'advances' | 'blocks' | 'completes' | 'abandons' | 'modifies';
  magnitude: number; // -1 to 1 (negative = setback, positive = progress)
}

/**
 * Alternative outcome for decision points
 */
export interface AlternativeOutcome {
  id: string;
  description: string;
  probability: number; // 0-1
  conditionsEstablished: WorldCondition[];
  goalEffects: GoalEffect[];
  narrativeImpact: 'minor' | 'moderate' | 'major' | 'catastrophic';
}

/**
 * A causal link connects two events via a condition
 * Notation: s1 →e s2 means s1 establishes condition e required by s2
 */
export interface CausalLink {
  id: string;
  sourceEventId: string;
  targetEventId: string;
  condition: WorldCondition;
  strength: 'necessary' | 'contributing' | 'enabling';
  isExplicit: boolean; // Whether the link is shown to reader
}

/**
 * Character goal tracking for intentionality
 */
export interface CharacterGoal {
  id: string;
  characterId: string;
  description: string;
  motivation: string;
  priority: number;
  status: 'active' | 'blocked' | 'achieved' | 'abandoned';
  parentGoalId?: string;
  subGoalIds: string[];
  relatedEventIds: string[];
}

/**
 * Dramatic conflict between characters or forces
 */
export interface DramaticConflict {
  id: string;
  name: string;
  conflictType: ConflictType;
  primaryParticipants: string[];
  opposingForces: [string[], string[]]; // Two sides
  stakesDescription: string;
  intensity: number; // 1-10
  status: 'latent' | 'emerging' | 'active' | 'climaxing' | 'resolved';
  resolutionEventId?: string;
}

export type ConflictType =
  | 'character_vs_character'
  | 'character_vs_self'
  | 'character_vs_nature'
  | 'character_vs_society'
  | 'character_vs_fate'
  | 'character_vs_technology'
  | 'character_vs_supernatural';

// ============================================================================
// ANALYSIS RESULTS
// ============================================================================

export interface CausalAnalysis {
  /** All events in causal order */
  orderedEvents: PlotEvent[];

  /** All causal links */
  causalLinks: CausalLink[];

  /** Events with unsatisfied preconditions (plot holes) */
  unsatisfiedEvents: {event: PlotEvent; missingConditions: WorldCondition[]}[];

  /** Orphaned events (no causal connection to main plot) */
  orphanedEvents: PlotEvent[];

  /** Circular dependencies detected */
  circularDependencies: {eventIds: string[]; description: string}[];

  /** Causal chain depth (longest cause-effect chain) */
  maxCausalDepth: number;

  /** Critical path events (removal would break plot) */
  criticalPathEvents: PlotEvent[];
}

export interface IntentionalityAnalysis {
  /** Characters and their active goals */
  characterGoals: Map<string, CharacterGoal[]>;

  /** Events that advance character goals */
  goalAdvancingEvents: Map<string, PlotEvent[]>;

  /** Characters with unclear motivations */
  unclearMotivations: {characterId: string; eventIds: string[]}[];

  /** Goal conflicts between characters */
  goalConflicts: {char1Id: string; char2Id: string; conflictingGoalIds: [string, string]}[];
}

export interface ConflictAnalysis {
  /** All dramatic conflicts */
  conflicts: DramaticConflict[];

  /** Conflict intensity timeline */
  intensityTimeline: {position: number; totalIntensity: number}[];

  /** Unresolved conflicts */
  unresolvedConflicts: DramaticConflict[];

  /** Conflict pacing analysis */
  pacingIssues: {
    type: 'too_many_simultaneous' | 'intensity_plateau' | 'no_escalation' | 'rushed_resolution';
    position: number;
    description: string;
  }[];
}

// ============================================================================
// CAUSAL PLOT GRAPH ENGINE
// ============================================================================

export class CausalPlotGraph {
  private events: Map<string, PlotEvent> = new Map();
  private causalLinks: Map<string, CausalLink> = new Map();
  private goals: Map<string, CharacterGoal> = new Map();
  private conflicts: Map<string, DramaticConflict> = new Map();
  private worldState: Map<string, WorldCondition> = new Map();

  constructor() {}

  // ==========================================================================
  // EVENT MANAGEMENT
  // ==========================================================================

  /**
   * Add a plot event to the graph
   */
  addEvent(event: Omit<PlotEvent, 'id'>): PlotEvent {
    const id = uuidv4();
    const fullEvent: PlotEvent = {...event, id};
    this.events.set(id, fullEvent);

    // Update world state with established conditions
    for (const condition of event.establishesConditions) {
      this.worldState.set(condition.id, condition);
    }

    // Auto-detect causal links from required conditions
    this.detectCausalLinks(fullEvent);

    return fullEvent;
  }

  /**
   * Get an event by ID
   */
  getEvent(id: string): PlotEvent | undefined {
    return this.events.get(id);
  }

  /**
   * Get all events in temporal order
   */
  getEventsInOrder(): PlotEvent[] {
    return Array.from(this.events.values())
      .sort((a, b) => a.timelinePosition - b.timelinePosition);
  }

  /**
   * Auto-detect causal links based on condition requirements
   */
  private detectCausalLinks(targetEvent: PlotEvent): void {
    for (const requiredCondition of targetEvent.requiresConditions) {
      // Find events that establish this condition
      for (const [_, sourceEvent] of this.events) {
        if (sourceEvent.id === targetEvent.id) continue;

        const establishes = sourceEvent.establishesConditions.find(
          c => c.id === requiredCondition.id || c.name === requiredCondition.name
        );

        if (establishes && sourceEvent.timelinePosition < targetEvent.timelinePosition) {
          this.addCausalLink({
            sourceEventId: sourceEvent.id,
            targetEventId: targetEvent.id,
            condition: requiredCondition,
            strength: 'necessary',
            isExplicit: false
          });
        }
      }
    }
  }

  // ==========================================================================
  // CAUSAL LINK MANAGEMENT
  // ==========================================================================

  /**
   * Add a causal link between events
   */
  addCausalLink(link: Omit<CausalLink, 'id'>): CausalLink {
    const id = uuidv4();
    const fullLink: CausalLink = {...link, id};

    // Validate: source must come before target
    const source = this.events.get(link.sourceEventId);
    const target = this.events.get(link.targetEventId);

    if (!source || !target) {
      throw new Error('Source or target event not found');
    }

    if (source.timelinePosition >= target.timelinePosition) {
      throw new Error('Causal link source must precede target temporally');
    }

    // Check for circular dependencies
    if (this.wouldCreateCycle(link.sourceEventId, link.targetEventId)) {
      throw new Error('Adding this link would create a circular dependency');
    }

    this.causalLinks.set(id, fullLink);
    return fullLink;
  }

  /**
   * Get all links from an event
   */
  getOutgoingLinks(eventId: string): CausalLink[] {
    return Array.from(this.causalLinks.values())
      .filter(link => link.sourceEventId === eventId);
  }

  /**
   * Get all links to an event
   */
  getIncomingLinks(eventId: string): CausalLink[] {
    return Array.from(this.causalLinks.values())
      .filter(link => link.targetEventId === eventId);
  }

  /**
   * Check if adding a link would create a cycle
   */
  private wouldCreateCycle(sourceId: string, targetId: string): boolean {
    const visited = new Set<string>();
    const stack = [targetId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === sourceId) return true;

      if (visited.has(current)) continue;
      visited.add(current);

      const outgoing = this.getOutgoingLinks(current);
      for (const link of outgoing) {
        stack.push(link.targetEventId);
      }
    }

    return false;
  }

  // ==========================================================================
  // CHARACTER GOAL MANAGEMENT
  // ==========================================================================

  /**
   * Add a character goal
   */
  addGoal(goal: Omit<CharacterGoal, 'id'>): CharacterGoal {
    const id = uuidv4();
    const fullGoal: CharacterGoal = {...goal, id};
    this.goals.set(id, fullGoal);
    return fullGoal;
  }

  /**
   * Get goals for a character
   */
  getCharacterGoals(characterId: string): CharacterGoal[] {
    return Array.from(this.goals.values())
      .filter(g => g.characterId === characterId);
  }

  /**
   * Update goal status based on event
   */
  updateGoalFromEvent(event: PlotEvent): void {
    for (const effect of event.affectsGoals) {
      const goal = this.goals.get(effect.goalId);
      if (!goal) continue;

      if (effect.effect === 'completes') {
        goal.status = 'achieved';
      } else if (effect.effect === 'abandons') {
        goal.status = 'abandoned';
      } else if (effect.effect === 'blocks' && effect.magnitude < -0.5) {
        goal.status = 'blocked';
      }

      goal.relatedEventIds.push(event.id);
    }
  }

  // ==========================================================================
  // DRAMATIC CONFLICT MANAGEMENT
  // ==========================================================================

  /**
   * Add a dramatic conflict
   */
  addConflict(conflict: Omit<DramaticConflict, 'id'>): DramaticConflict {
    const id = uuidv4();
    const fullConflict: DramaticConflict = {...conflict, id};
    this.conflicts.set(id, fullConflict);
    return fullConflict;
  }

  /**
   * Get all active conflicts
   */
  getActiveConflicts(): DramaticConflict[] {
    return Array.from(this.conflicts.values())
      .filter(c => c.status !== 'resolved');
  }

  // ==========================================================================
  // ANALYSIS METHODS
  // ==========================================================================

  /**
   * Perform full causal analysis of the plot graph
   */
  analyzeCausality(): CausalAnalysis {
    const orderedEvents = this.getEventsInOrder();
    const causalLinks = Array.from(this.causalLinks.values());

    // Find events with unsatisfied preconditions (plot holes)
    const unsatisfiedEvents: CausalAnalysis['unsatisfiedEvents'] = [];
    for (const event of orderedEvents) {
      const missingConditions: WorldCondition[] = [];

      for (const required of event.requiresConditions) {
        // Check if any prior event establishes this condition
        const hasSource = causalLinks.some(
          link => link.targetEventId === event.id &&
                  link.condition.id === required.id
        );

        if (!hasSource) {
          missingConditions.push(required);
        }
      }

      if (missingConditions.length > 0) {
        unsatisfiedEvents.push({event, missingConditions});
      }
    }

    // Find orphaned events (no connection to main plot)
    const connectedEvents = new Set<string>();
    const links = Array.from(this.causalLinks.values());

    // Start from events with highest importance
    const seedEvents = orderedEvents
      .filter(e => e.importance >= 8)
      .map(e => e.id);

    for (const seedId of seedEvents) {
      this.traverseConnections(seedId, connectedEvents, links);
    }

    const orphanedEvents = orderedEvents.filter(e => !connectedEvents.has(e.id));

    // Detect circular dependencies (should be none if we prevent them)
    const circularDependencies: CausalAnalysis['circularDependencies'] = [];

    // Calculate causal depth
    const maxCausalDepth = this.calculateMaxCausalDepth();

    // Find critical path events
    const criticalPathEvents = this.findCriticalPathEvents();

    return {
      orderedEvents,
      causalLinks,
      unsatisfiedEvents,
      orphanedEvents,
      circularDependencies,
      maxCausalDepth,
      criticalPathEvents
    };
  }

  /**
   * Traverse all connections from an event
   */
  private traverseConnections(
    eventId: string,
    visited: Set<string>,
    links: CausalLink[]
  ): void {
    if (visited.has(eventId)) return;
    visited.add(eventId);

    // Follow outgoing links
    for (const link of links) {
      if (link.sourceEventId === eventId) {
        this.traverseConnections(link.targetEventId, visited, links);
      }
      if (link.targetEventId === eventId) {
        this.traverseConnections(link.sourceEventId, visited, links);
      }
    }
  }

  /**
   * Calculate the longest causal chain
   */
  private calculateMaxCausalDepth(): number {
    const depths = new Map<string, number>();

    const orderedEvents = this.getEventsInOrder();

    for (const event of orderedEvents) {
      const incomingLinks = this.getIncomingLinks(event.id);

      if (incomingLinks.length === 0) {
        depths.set(event.id, 1);
      } else {
        const maxParentDepth = Math.max(
          ...incomingLinks.map(link => depths.get(link.sourceEventId) || 0)
        );
        depths.set(event.id, maxParentDepth + 1);
      }
    }

    return Math.max(...Array.from(depths.values()), 0);
  }

  /**
   * Find events on the critical path
   */
  private findCriticalPathEvents(): PlotEvent[] {
    const criticalEvents: PlotEvent[] = [];
    const allLinks = Array.from(this.causalLinks.values());

    for (const [_, event] of this.events) {
      // An event is critical if:
      // 1. It has high importance (>= 8)
      // 2. It's the only source for a necessary condition
      // 3. Removing it would disconnect the graph

      if (event.importance >= 8) {
        criticalEvents.push(event);
        continue;
      }

      // Check if it's the only source for any condition
      for (const condition of event.establishesConditions) {
        const otherSources = allLinks.filter(
          link => link.condition.id === condition.id &&
                  link.sourceEventId !== event.id
        );

        const dependents = allLinks.filter(
          link => link.condition.id === condition.id &&
                  link.sourceEventId === event.id
        );

        if (otherSources.length === 0 && dependents.length > 0) {
          criticalEvents.push(event);
          break;
        }
      }
    }

    return criticalEvents;
  }

  /**
   * Analyze character intentionality
   */
  analyzeIntentionality(): IntentionalityAnalysis {
    const characterGoals = new Map<string, CharacterGoal[]>();
    const goalAdvancingEvents = new Map<string, PlotEvent[]>();

    // Group goals by character
    for (const goal of this.goals.values()) {
      const existing = characterGoals.get(goal.characterId) || [];
      existing.push(goal);
      characterGoals.set(goal.characterId, existing);
    }

    // Find events that advance each goal
    for (const event of this.events.values()) {
      for (const effect of event.affectsGoals) {
        if (effect.effect === 'advances' || effect.effect === 'completes') {
          const existing = goalAdvancingEvents.get(effect.goalId) || [];
          existing.push(event);
          goalAdvancingEvents.set(effect.goalId, existing);
        }
      }
    }

    // Find characters with unclear motivations
    const unclearMotivations: IntentionalityAnalysis['unclearMotivations'] = [];
    const characterEventCounts = new Map<string, string[]>();

    for (const event of this.events.values()) {
      for (const charId of event.participantIds) {
        const existing = characterEventCounts.get(charId) || [];
        existing.push(event.id);
        characterEventCounts.set(charId, existing);
      }
    }

    for (const [charId, eventIds] of characterEventCounts) {
      const goals = characterGoals.get(charId) || [];
      const activeGoals = goals.filter(g => g.status === 'active');

      // If character participates in many events but has few/no active goals
      if (eventIds.length > 5 && activeGoals.length === 0) {
        unclearMotivations.push({characterId: charId, eventIds});
      }
    }

    // Find goal conflicts between characters
    const goalConflicts: IntentionalityAnalysis['goalConflicts'] = [];
    const characters = Array.from(characterGoals.keys());

    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        const char1Goals = characterGoals.get(characters[i]) || [];
        const char2Goals = characterGoals.get(characters[j]) || [];

        for (const g1 of char1Goals) {
          for (const g2 of char2Goals) {
            // Check if goals conflict (simplified: same affected entities with opposing effects)
            const g1Conditions = this.getGoalTargetConditions(g1);
            const g2Conditions = this.getGoalTargetConditions(g2);

            const hasConflict = g1Conditions.some(c1 =>
              g2Conditions.some(c2 =>
                c1.affectedEntityIds.some(id => c2.affectedEntityIds.includes(id)) &&
                c1.value !== c2.value
              )
            );

            if (hasConflict) {
              goalConflicts.push({
                char1Id: characters[i],
                char2Id: characters[j],
                conflictingGoalIds: [g1.id, g2.id]
              });
            }
          }
        }
      }
    }

    return {
      characterGoals,
      goalAdvancingEvents,
      unclearMotivations,
      goalConflicts
    };
  }

  private getGoalTargetConditions(goal: CharacterGoal): WorldCondition[] {
    // Get conditions from events that would complete this goal
    const conditions: WorldCondition[] = [];

    for (const event of this.events.values()) {
      const completesGoal = event.affectsGoals.some(
        e => e.goalId === goal.id && e.effect === 'completes'
      );
      if (completesGoal) {
        conditions.push(...event.establishesConditions);
      }
    }

    return conditions;
  }

  /**
   * Analyze dramatic conflict pacing
   */
  analyzeConflicts(): ConflictAnalysis {
    const conflicts = Array.from(this.conflicts.values());
    const unresolvedConflicts = conflicts.filter(c => c.status !== 'resolved');

    // Build intensity timeline
    const events = this.getEventsInOrder();
    const intensityTimeline: ConflictAnalysis['intensityTimeline'] = [];

    for (const event of events) {
      let totalIntensity = 0;

      for (const conflict of conflicts) {
        // Check if conflict is active at this event's position
        // Simplified: assume conflict is active if any participant is involved
        const isActive = conflict.primaryParticipants.some(
          p => event.participantIds.includes(p)
        );

        if (isActive) {
          totalIntensity += conflict.intensity;
        }
      }

      intensityTimeline.push({
        position: event.timelinePosition,
        totalIntensity
      });
    }

    // Detect pacing issues
    const pacingIssues: ConflictAnalysis['pacingIssues'] = [];

    // Too many simultaneous conflicts
    for (let i = 0; i < intensityTimeline.length; i++) {
      const activeCount = conflicts.filter(c =>
        c.status === 'active' || c.status === 'climaxing'
      ).length;

      if (activeCount > 4) {
        pacingIssues.push({
          type: 'too_many_simultaneous',
          position: intensityTimeline[i].position,
          description: `${activeCount} conflicts active simultaneously may overwhelm reader`
        });
      }
    }

    // Intensity plateau (no change over extended period)
    for (let i = 5; i < intensityTimeline.length; i++) {
      const recent = intensityTimeline.slice(i - 5, i);
      const allSame = recent.every(r => r.totalIntensity === recent[0].totalIntensity);

      if (allSame && recent[0].totalIntensity > 0) {
        pacingIssues.push({
          type: 'intensity_plateau',
          position: intensityTimeline[i].position,
          description: 'Conflict intensity unchanged for extended period'
        });
      }
    }

    // No escalation before climax
    const climaxingConflicts = conflicts.filter(c => c.status === 'climaxing');
    for (const conflict of climaxingConflicts) {
      // Check if intensity increased leading up to climax
      // Simplified check
      if (conflict.intensity < 8) {
        pacingIssues.push({
          type: 'no_escalation',
          position: events[events.length - 1]?.timelinePosition || 0,
          description: `Conflict "${conflict.name}" climaxing without sufficient escalation`
        });
      }
    }

    return {
      conflicts,
      intensityTimeline,
      unresolvedConflicts,
      pacingIssues
    };
  }

  // ==========================================================================
  // SERIALIZATION
  // ==========================================================================

  /**
   * Export the graph to JSON
   */
  toJSON(): {
    events: PlotEvent[];
    causalLinks: CausalLink[];
    goals: CharacterGoal[];
    conflicts: DramaticConflict[];
    worldState: WorldCondition[];
  } {
    return {
      events: Array.from(this.events.values()),
      causalLinks: Array.from(this.causalLinks.values()),
      goals: Array.from(this.goals.values()),
      conflicts: Array.from(this.conflicts.values()),
      worldState: Array.from(this.worldState.values())
    };
  }

  /**
   * Import from JSON
   */
  static fromJSON(data: ReturnType<CausalPlotGraph['toJSON']>): CausalPlotGraph {
    const graph = new CausalPlotGraph();

    for (const event of data.events) {
      graph.events.set(event.id, event);
    }
    for (const link of data.causalLinks) {
      graph.causalLinks.set(link.id, link);
    }
    for (const goal of data.goals) {
      graph.goals.set(goal.id, goal);
    }
    for (const conflict of data.conflicts) {
      graph.conflicts.set(conflict.id, conflict);
    }
    for (const condition of data.worldState) {
      graph.worldState.set(condition.id, condition);
    }

    return graph;
  }
}

export default CausalPlotGraph;
