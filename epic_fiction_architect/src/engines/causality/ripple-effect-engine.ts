/**
 * Epic Fiction Architect - Ripple Effect Engine
 *
 * Tracks how actions and events propagate through the story world,
 * creating cascading consequences across characters, locations, factions,
 * and the broader narrative. No character exists in a bubble - every
 * action sends ripples through the interconnected entity network.
 *
 * Designed for 12,000+ chapter stories where an action in chapter 100
 * might not fully manifest until chapter 5000.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Types of actions that can cause ripples
 */
export enum ActionType {
  // Character actions
  DECISION = 'decision',           // Character makes a choice
  SPEECH = 'speech',               // Something said publicly
  SECRET_REVEALED = 'secret_revealed',
  BETRAYAL = 'betrayal',
  ALLIANCE_FORMED = 'alliance_formed',
  ALLIANCE_BROKEN = 'alliance_broken',
  DEATH = 'death',
  BIRTH = 'birth',
  TRANSFORMATION = 'transformation', // Power gain, corruption, etc.
  ACHIEVEMENT = 'achievement',
  FAILURE = 'failure',
  DISCOVERY = 'discovery',
  INVENTION = 'invention',
  CRIME = 'crime',
  HEROIC_ACT = 'heroic_act',

  // Power actions
  POWER_USED = 'power_used',
  POWER_AWAKENED = 'power_awakened',
  POWER_LOST = 'power_lost',
  POWER_TRANSFERRED = 'power_transferred',

  // Faction actions
  WAR_DECLARED = 'war_declared',
  PEACE_MADE = 'peace_made',
  TERRITORY_CLAIMED = 'territory_claimed',
  TERRITORY_LOST = 'territory_lost',
  POLICY_CHANGE = 'policy_change',
  LEADER_CHANGE = 'leader_change',

  // World events
  NATURAL_DISASTER = 'natural_disaster',
  MAGICAL_PHENOMENON = 'magical_phenomenon',
  ECONOMIC_SHIFT = 'economic_shift',
  PLAGUE = 'plague',
  PROPHECY_FULFILLED = 'prophecy_fulfilled',
  ARTIFACT_ACTIVATED = 'artifact_activated',

  // Narrative events
  PLOT_TWIST = 'plot_twist',
  REVELATION = 'revelation',
  FORESHADOWING_PAYOFF = 'foreshadowing_payoff',

  // Generic
  CUSTOM = 'custom'
}

/**
 * Categories of ripple effects
 */
export enum RippleCategory {
  EMOTIONAL = 'emotional',         // How people feel
  POLITICAL = 'political',         // Power structures, alliances
  ECONOMIC = 'economic',           // Trade, wealth, resources
  SOCIAL = 'social',               // Relationships, reputation
  PHYSICAL = 'physical',           // Locations, items, bodies
  MAGICAL = 'magical',             // Powers, enchantments
  KNOWLEDGE = 'knowledge',         // What people know/believe
  TEMPORAL = 'temporal',           // Timeline, prophecy
  NARRATIVE = 'narrative'          // Plot, themes, arcs
}

/**
 * How quickly a ripple propagates
 */
export enum PropagationSpeed {
  INSTANT = 'instant',             // Immediate effect
  FAST = 'fast',                   // Within same chapter
  MODERATE = 'moderate',           // Within 10-50 chapters
  SLOW = 'slow',                   // 50-500 chapters
  GENERATIONAL = 'generational',   // 500+ chapters, legacy effects
  DORMANT = 'dormant'              // Delayed trigger, waiting for condition
}

/**
 * Current state of a ripple
 */
export enum RippleStatus {
  ACTIVE = 'active',               // Currently propagating
  MANIFESTED = 'manifested',       // Has created visible effects
  DORMANT = 'dormant',             // Waiting for trigger
  EXHAUSTED = 'exhausted',         // No more propagation energy
  COUNTERED = 'countered',         // Neutralized by opposing force
  TRANSFORMED = 'transformed',     // Merged into a different ripple
  AMPLIFIED = 'amplified'          // Boosted by compound effects
}

/**
 * Intensity of a ripple's effect
 */
export enum RippleIntensity {
  NEGLIGIBLE = 1,      // Barely noticeable
  MINOR = 2,           // Small effect
  MODERATE = 3,        // Notable effect
  SIGNIFICANT = 4,     // Major effect
  MAJOR = 5,           // Story-changing
  CATASTROPHIC = 6,    // World-altering
  LEGENDARY = 7        // Remembered for generations
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * The source action that creates ripples
 */
export interface CausalAction {
  id: string;
  type: ActionType;
  name: string;
  description: string;

  // Source
  actorId: string;               // Entity that performed action
  actorType: string;             // CHARACTER, FACTION, etc.
  actorName: string;

  // Location/time
  locationId?: string;
  locationName?: string;
  chapterOccurred: number;
  timestamp: Date;

  // Context
  witnesses: string[];           // Entity IDs who observed
  involvedEntities: string[];    // All entities involved
  context: {
    motivation?: string;
    circumstances?: string;
    publicKnowledge: boolean;    // Is this action publicly known?
    secretLevel?: number;        // How hidden (0 = public, 10 = deeply secret)
  };

  // Effect parameters
  initialIntensity: RippleIntensity;
  categories: RippleCategory[];
  tags: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A single ripple effect from an action
 */
export interface Ripple {
  id: string;
  sourceActionId: string;
  parentRippleId?: string;       // If this is a secondary ripple

  // Effect details
  category: RippleCategory;
  description: string;
  intensity: RippleIntensity;
  status: RippleStatus;
  propagationSpeed: PropagationSpeed;

  // Affected entity
  affectedEntityId: string;
  affectedEntityType: string;
  affectedEntityName: string;

  // Change caused
  effectType: string;            // What kind of change
  effectDescription: string;     // Human-readable effect
  effectData?: Record<string, unknown>; // Structured effect data

  // Timing
  chapterCreated: number;        // When ripple was created
  chapterManifested?: number;    // When effect became visible
  chapterExpires?: number;       // When effect ends (if temporary)

  // Propagation
  propagationDepth: number;      // How many hops from source
  remainingEnergy: number;       // 0-100, determines further propagation
  decayRate: number;             // How fast energy depletes per hop

  // Conditions
  triggerCondition?: string;     // For dormant ripples
  blockingFactors?: string[];    // What could stop this ripple

  // Compound effects
  amplifiedBy?: string[];        // Other ripple IDs that boosted this
  counteredBy?: string[];        // Other ripple IDs that weakened this

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A chain of connected ripples
 */
export interface RippleChain {
  id: string;
  sourceActionId: string;
  rippleIds: string[];
  totalDepth: number;
  totalAffectedEntities: number;
  categories: RippleCategory[];
  status: 'active' | 'complete' | 'blocked';
  startChapter: number;
  currentChapter?: number;
}

/**
 * Propagation rules for different scenarios
 */
export interface PropagationRule {
  id: string;
  name: string;
  description: string;

  // Triggers
  sourceActionTypes?: ActionType[];
  sourceCategories?: RippleCategory[];
  sourceEntityTypes?: string[];
  minIntensity?: RippleIntensity;

  // Target selection
  targetRelationTypes?: string[];  // Cross-reference types to follow
  targetEntityTypes?: string[];
  maxDistance?: number;            // Relationship hops

  // Effect generation
  effectCategory: RippleCategory;
  effectType: string;
  effectTemplate: string;          // Template with {placeholders}
  intensityModifier: number;       // Multiply source intensity
  energyConsumption: number;       // How much energy this costs

  // Conditions
  requiresConditions?: string[];
  blockedByConditions?: string[];

  // Priority
  priority: number;
  isEnabled: boolean;
}

/**
 * Snapshot of world state affected by ripples
 */
export interface WorldStateSnapshot {
  chapter: number;
  activeRipples: number;
  dormantRipples: number;
  manifestedEffects: number;
  affectedEntities: Map<string, number>; // entityId -> ripple count
  dominantCategories: RippleCategory[];
  majorChanges: string[];
  timestamp: Date;
}

/**
 * Configuration for the ripple engine
 */
export interface RippleEngineConfig {
  maxPropagationDepth: number;
  defaultDecayRate: number;
  minPropagationEnergy: number;
  enableCompoundEffects: boolean;
  enableDormantRipples: boolean;
  autoPropagate: boolean;
  snapshotInterval: number;        // Chapters between snapshots
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: RippleEngineConfig = {
  maxPropagationDepth: 10,
  defaultDecayRate: 15,            // Lose 15% energy per hop
  minPropagationEnergy: 10,        // Stop below 10%
  enableCompoundEffects: true,
  enableDormantRipples: true,
  autoPropagate: true,
  snapshotInterval: 100
};

// ============================================================================
// DEFAULT PROPAGATION RULES
// ============================================================================

const defaultPropagationRules: PropagationRule[] = [
  // Death ripples to family
  {
    id: 'death-to-family',
    name: 'Death Affects Family',
    description: 'Character death causes emotional ripples to family members',
    sourceActionTypes: [ActionType.DEATH],
    sourceCategories: [RippleCategory.PHYSICAL],
    targetRelationTypes: ['RELATED_TO'],
    targetEntityTypes: ['CHARACTER'],
    effectCategory: RippleCategory.EMOTIONAL,
    effectType: 'grief',
    effectTemplate: '{actor} death causes grief for {target}',
    intensityModifier: 0.9,
    energyConsumption: 20,
    priority: 100,
    isEnabled: true
  },
  // Death ripples to allies
  {
    id: 'death-to-allies',
    name: 'Death Affects Allies',
    description: 'Character death weakens allied factions',
    sourceActionTypes: [ActionType.DEATH],
    targetRelationTypes: ['BELONGS_TO', 'ALLIED_WITH'],
    targetEntityTypes: ['FACTION'],
    effectCategory: RippleCategory.POLITICAL,
    effectType: 'power_vacuum',
    effectTemplate: '{actor} death creates power vacuum in {target}',
    intensityModifier: 0.7,
    energyConsumption: 25,
    priority: 90,
    isEnabled: true
  },
  // Betrayal spreads distrust
  {
    id: 'betrayal-spreads-distrust',
    name: 'Betrayal Creates Distrust',
    description: 'Betrayal makes witnesses suspicious',
    sourceActionTypes: [ActionType.BETRAYAL],
    targetRelationTypes: ['KNOWS', 'ALLIED_WITH'],
    effectCategory: RippleCategory.SOCIAL,
    effectType: 'distrust',
    effectTemplate: 'Witnesses of {actor} betrayal become wary of alliances',
    intensityModifier: 0.6,
    energyConsumption: 15,
    priority: 80,
    isEnabled: true
  },
  // Power awakening inspires
  {
    id: 'power-inspires',
    name: 'Power Awakening Inspires',
    description: 'New power awakening inspires those nearby',
    sourceActionTypes: [ActionType.POWER_AWAKENED],
    targetRelationTypes: ['KNOWS', 'LOCATED_AT'],
    targetEntityTypes: ['CHARACTER'],
    effectCategory: RippleCategory.EMOTIONAL,
    effectType: 'inspiration',
    effectTemplate: '{actor} awakening inspires {target} to seek power',
    intensityModifier: 0.5,
    energyConsumption: 20,
    priority: 70,
    isEnabled: true
  },
  // War affects economy
  {
    id: 'war-economy',
    name: 'War Disrupts Economy',
    description: 'War declaration disrupts trade routes',
    sourceActionTypes: [ActionType.WAR_DECLARED],
    targetRelationTypes: ['CONNECTED_TO', 'CONTROLS'],
    targetEntityTypes: ['LOCATION'],
    effectCategory: RippleCategory.ECONOMIC,
    effectType: 'trade_disruption',
    effectTemplate: 'War between factions disrupts trade at {target}',
    intensityModifier: 0.8,
    energyConsumption: 30,
    priority: 85,
    isEnabled: true
  },
  // Secret revealed spreads
  {
    id: 'secret-spreads',
    name: 'Secrets Spread',
    description: 'Revealed secrets propagate through social networks',
    sourceActionTypes: [ActionType.SECRET_REVEALED],
    targetRelationTypes: ['KNOWS'],
    effectCategory: RippleCategory.KNOWLEDGE,
    effectType: 'information_spread',
    effectTemplate: 'Knowledge of {actor} secret reaches {target}',
    intensityModifier: 0.4,
    energyConsumption: 10,
    priority: 60,
    isEnabled: true
  },
  // Discovery spreads knowledge
  {
    id: 'discovery-knowledge',
    name: 'Discovery Spreads Knowledge',
    description: 'Discoveries spread through academic/faction networks',
    sourceActionTypes: [ActionType.DISCOVERY, ActionType.INVENTION],
    targetRelationTypes: ['BELONGS_TO', 'ALLIED_WITH'],
    effectCategory: RippleCategory.KNOWLEDGE,
    effectType: 'knowledge_gain',
    effectTemplate: '{target} learns of {actor} discovery',
    intensityModifier: 0.6,
    energyConsumption: 15,
    priority: 65,
    isEnabled: true
  },
  // Prophecy affects believers
  {
    id: 'prophecy-belief',
    name: 'Prophecy Affects Believers',
    description: 'Fulfilled prophecies strengthen or shatter faith',
    sourceActionTypes: [ActionType.PROPHECY_FULFILLED],
    targetRelationTypes: ['BELONGS_TO'],
    targetEntityTypes: ['CHARACTER'],
    effectCategory: RippleCategory.EMOTIONAL,
    effectType: 'faith_change',
    effectTemplate: 'Prophecy fulfillment changes {target} worldview',
    intensityModifier: 0.75,
    energyConsumption: 25,
    priority: 75,
    isEnabled: true
  }
];

// ============================================================================
// RIPPLE EFFECT ENGINE
// ============================================================================

/**
 * Ripple Effect Engine
 *
 * Tracks and propagates the cascading consequences of actions through
 * the interconnected entity network of the story world.
 */
export class RippleEffectEngine {
  private config: RippleEngineConfig;
  private actions: Map<string, CausalAction> = new Map();
  private ripples: Map<string, Ripple> = new Map();
  private chains: Map<string, RippleChain> = new Map();
  private rules: Map<string, PropagationRule> = new Map();
  private snapshots: WorldStateSnapshot[] = [];

  // Indices for fast lookup
  private ripplesByAction: Map<string, Set<string>> = new Map();
  private ripplesByEntity: Map<string, Set<string>> = new Map();
  private ripplesByCategory: Map<RippleCategory, Set<string>> = new Map();
  private ripplesByChapter: Map<number, Set<string>> = new Map();
  private dormantRipples: Set<string> = new Set();

  // External dependencies (set during integration)
  private entityLookup?: (id: string) => { id: string; type: string; name: string } | undefined;
  private relationshipLookup?: (entityId: string) => Array<{
    targetId: string;
    targetType: string;
    relationType: string;
  }>;

  constructor(config?: Partial<RippleEngineConfig>) {
    this.config = { ...defaultConfig, ...config };

    // Load default rules
    for (const rule of defaultPropagationRules) {
      this.rules.set(rule.id, rule);
    }
  }

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  /**
   * Set entity lookup function for integration
   */
  setEntityLookup(
    lookup: (id: string) => { id: string; type: string; name: string } | undefined
  ): void {
    this.entityLookup = lookup;
  }

  /**
   * Set relationship lookup function for integration
   */
  setRelationshipLookup(
    lookup: (entityId: string) => Array<{
      targetId: string;
      targetType: string;
      relationType: string;
    }>
  ): void {
    this.relationshipLookup = lookup;
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<RippleEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Add or update a propagation rule
   */
  addRule(rule: PropagationRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove a propagation rule
   */
  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Get all rules
   */
  getRules(): PropagationRule[] {
    return Array.from(this.rules.values());
  }

  // ==========================================================================
  // ACTION CREATION
  // ==========================================================================

  /**
   * Record a causal action that will generate ripples
   */
  recordAction(
    type: ActionType,
    data: {
      name: string;
      description: string;
      actorId: string;
      actorType: string;
      actorName: string;
      chapterOccurred: number;
      locationId?: string;
      locationName?: string;
      witnesses?: string[];
      involvedEntities?: string[];
      initialIntensity?: RippleIntensity;
      categories?: RippleCategory[];
      publicKnowledge?: boolean;
      secretLevel?: number;
      motivation?: string;
      circumstances?: string;
      tags?: string[];
    }
  ): CausalAction {
    const id = uuidv4();
    const now = new Date();

    const action: CausalAction = {
      id,
      type,
      name: data.name,
      description: data.description,
      actorId: data.actorId,
      actorType: data.actorType,
      actorName: data.actorName,
      chapterOccurred: data.chapterOccurred,
      timestamp: now,
      locationId: data.locationId,
      locationName: data.locationName,
      witnesses: data.witnesses ?? [],
      involvedEntities: data.involvedEntities ?? [],
      context: {
        motivation: data.motivation,
        circumstances: data.circumstances,
        publicKnowledge: data.publicKnowledge ?? true,
        secretLevel: data.secretLevel ?? 0
      },
      initialIntensity: data.initialIntensity ?? RippleIntensity.MODERATE,
      categories: data.categories ?? [RippleCategory.SOCIAL],
      tags: data.tags ?? [],
      createdAt: now,
      updatedAt: now
    };

    this.actions.set(id, action);
    this.ripplesByAction.set(id, new Set());

    // Auto-propagate if enabled
    if (this.config.autoPropagate) {
      this.propagateFromAction(id);
    }

    return action;
  }

  /**
   * Get an action by ID
   */
  getAction(id: string): CausalAction | undefined {
    return this.actions.get(id);
  }

  /**
   * Get all actions
   */
  getAllActions(): CausalAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Get actions by chapter range
   */
  getActionsByChapter(startChapter: number, endChapter?: number): CausalAction[] {
    return Array.from(this.actions.values()).filter(a => {
      if (endChapter !== undefined) {
        return a.chapterOccurred >= startChapter && a.chapterOccurred <= endChapter;
      }
      return a.chapterOccurred === startChapter;
    });
  }

  // ==========================================================================
  // RIPPLE CREATION
  // ==========================================================================

  /**
   * Create a ripple effect
   */
  createRipple(
    sourceActionId: string,
    data: {
      category: RippleCategory;
      description: string;
      affectedEntityId: string;
      affectedEntityType: string;
      affectedEntityName: string;
      effectType: string;
      effectDescription: string;
      chapterCreated: number;
      intensity?: RippleIntensity;
      propagationSpeed?: PropagationSpeed;
      parentRippleId?: string;
      propagationDepth?: number;
      remainingEnergy?: number;
      decayRate?: number;
      triggerCondition?: string;
      effectData?: Record<string, unknown>;
    }
  ): Ripple {
    const id = uuidv4();
    const now = new Date();

    const ripple: Ripple = {
      id,
      sourceActionId,
      parentRippleId: data.parentRippleId,
      category: data.category,
      description: data.description,
      intensity: data.intensity ?? RippleIntensity.MODERATE,
      status: data.triggerCondition ? RippleStatus.DORMANT : RippleStatus.ACTIVE,
      propagationSpeed: data.propagationSpeed ?? PropagationSpeed.MODERATE,
      affectedEntityId: data.affectedEntityId,
      affectedEntityType: data.affectedEntityType,
      affectedEntityName: data.affectedEntityName,
      effectType: data.effectType,
      effectDescription: data.effectDescription,
      effectData: data.effectData,
      chapterCreated: data.chapterCreated,
      propagationDepth: data.propagationDepth ?? 0,
      remainingEnergy: data.remainingEnergy ?? 100,
      decayRate: data.decayRate ?? this.config.defaultDecayRate,
      triggerCondition: data.triggerCondition,
      createdAt: now,
      updatedAt: now
    };

    this.storeRipple(ripple);

    return ripple;
  }

  /**
   * Store ripple and update indices
   */
  private storeRipple(ripple: Ripple): void {
    this.ripples.set(ripple.id, ripple);

    // Index by action
    if (!this.ripplesByAction.has(ripple.sourceActionId)) {
      this.ripplesByAction.set(ripple.sourceActionId, new Set());
    }
    this.ripplesByAction.get(ripple.sourceActionId)!.add(ripple.id);

    // Index by entity
    if (!this.ripplesByEntity.has(ripple.affectedEntityId)) {
      this.ripplesByEntity.set(ripple.affectedEntityId, new Set());
    }
    this.ripplesByEntity.get(ripple.affectedEntityId)!.add(ripple.id);

    // Index by category
    if (!this.ripplesByCategory.has(ripple.category)) {
      this.ripplesByCategory.set(ripple.category, new Set());
    }
    this.ripplesByCategory.get(ripple.category)!.add(ripple.id);

    // Index by chapter
    if (!this.ripplesByChapter.has(ripple.chapterCreated)) {
      this.ripplesByChapter.set(ripple.chapterCreated, new Set());
    }
    this.ripplesByChapter.get(ripple.chapterCreated)!.add(ripple.id);

    // Track dormant
    if (ripple.status === RippleStatus.DORMANT) {
      this.dormantRipples.add(ripple.id);
    }
  }

  // ==========================================================================
  // PROPAGATION
  // ==========================================================================

  /**
   * Propagate ripples from an action
   */
  propagateFromAction(actionId: string): Ripple[] {
    const action = this.actions.get(actionId);
    if (!action) {
      throw new Error(`Action ${actionId} not found`);
    }

    const newRipples: Ripple[] = [];

    // Find applicable rules
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => this.ruleApplies(rule, action))
      .sort((a, b) => b.priority - a.priority);

    // Apply each rule to generate initial ripples
    for (const rule of applicableRules) {
      const ruleRipples = this.applyRule(rule, action, null);
      newRipples.push(...ruleRipples);
    }

    // Create initial ripples for involved entities without specific rules
    for (const entityId of action.involvedEntities) {
      const existing = newRipples.find(r => r.affectedEntityId === entityId);
      if (!existing) {
        const entity = this.entityLookup?.(entityId);
        if (entity) {
          for (const category of action.categories) {
            const ripple = this.createRipple(actionId, {
              category,
              description: `Directly affected by ${action.name}`,
              affectedEntityId: entity.id,
              affectedEntityType: entity.type,
              affectedEntityName: entity.name,
              effectType: 'direct_involvement',
              effectDescription: `${entity.name} was directly involved in ${action.name}`,
              chapterCreated: action.chapterOccurred,
              intensity: action.initialIntensity,
              propagationSpeed: PropagationSpeed.INSTANT,
              remainingEnergy: 100
            });
            newRipples.push(ripple);
          }
        }
      }
    }

    return newRipples;
  }

  /**
   * Propagate a ripple to connected entities
   */
  propagateRipple(rippleId: string): Ripple[] {
    const ripple = this.ripples.get(rippleId);
    if (!ripple) {
      throw new Error(`Ripple ${rippleId} not found`);
    }

    // Check if can propagate
    if (ripple.status !== RippleStatus.ACTIVE) {
      return [];
    }

    if (ripple.propagationDepth >= this.config.maxPropagationDepth) {
      this.updateRippleStatus(rippleId, RippleStatus.EXHAUSTED);
      return [];
    }

    if (ripple.remainingEnergy < this.config.minPropagationEnergy) {
      this.updateRippleStatus(rippleId, RippleStatus.EXHAUSTED);
      return [];
    }

    const newRipples: Ripple[] = [];
    const action = this.actions.get(ripple.sourceActionId);
    if (!action) return [];

    // Get connected entities
    const connections = this.relationshipLookup?.(ripple.affectedEntityId) ?? [];

    // Find applicable rules for secondary propagation
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => this.ruleAppliesForPropagation(rule, ripple, action))
      .sort((a, b) => b.priority - a.priority);

    for (const connection of connections) {
      for (const rule of applicableRules) {
        if (rule.targetRelationTypes &&
            !rule.targetRelationTypes.includes(connection.relationType)) {
          continue;
        }

        if (rule.targetEntityTypes &&
            !rule.targetEntityTypes.includes(connection.targetType)) {
          continue;
        }

        // Calculate new energy
        const energyCost = rule.energyConsumption;
        const newEnergy = (ripple.remainingEnergy - energyCost) * (1 - ripple.decayRate / 100);

        if (newEnergy < this.config.minPropagationEnergy) {
          continue;
        }

        // Calculate new intensity
        const newIntensity = Math.max(
          1,
          Math.round(ripple.intensity * rule.intensityModifier)
        ) as RippleIntensity;

        const entity = this.entityLookup?.(connection.targetId);
        const entityName = entity?.name ?? connection.targetId;

        // Generate effect description from template
        const effectDescription = rule.effectTemplate
          .replace('{actor}', action.actorName)
          .replace('{target}', entityName)
          .replace('{action}', action.name);

        const newRipple = this.createRipple(ripple.sourceActionId, {
          category: rule.effectCategory,
          description: effectDescription,
          affectedEntityId: connection.targetId,
          affectedEntityType: connection.targetType,
          affectedEntityName: entityName,
          effectType: rule.effectType,
          effectDescription,
          chapterCreated: ripple.chapterCreated,
          intensity: newIntensity,
          propagationSpeed: ripple.propagationSpeed,
          parentRippleId: ripple.id,
          propagationDepth: ripple.propagationDepth + 1,
          remainingEnergy: newEnergy,
          decayRate: ripple.decayRate
        });

        newRipples.push(newRipple);
      }
    }

    // Mark original as manifested if it generated children
    if (newRipples.length > 0) {
      this.updateRippleStatus(rippleId, RippleStatus.MANIFESTED);
    }

    return newRipples;
  }

  /**
   * Propagate all active ripples one step
   */
  propagateAll(): {
    propagated: number;
    newRipples: Ripple[];
    exhausted: number;
  } {
    const activeRipples = Array.from(this.ripples.values())
      .filter(r => r.status === RippleStatus.ACTIVE);

    let propagated = 0;
    let exhausted = 0;
    const allNewRipples: Ripple[] = [];

    for (const ripple of activeRipples) {
      const newRipples = this.propagateRipple(ripple.id);
      if (newRipples.length > 0) {
        propagated++;
        allNewRipples.push(...newRipples);
      }

      const updated = this.ripples.get(ripple.id);
      if (updated?.status === RippleStatus.EXHAUSTED) {
        exhausted++;
      }
    }

    return { propagated, newRipples: allNewRipples, exhausted };
  }

  /**
   * Advance simulation to a specific chapter
   */
  advanceToChapter(targetChapter: number): {
    chaptersAdvanced: number;
    totalNewRipples: number;
    manifestedEffects: number;
    activatedDormant: number;
  } {
    const currentChapter = this.getCurrentChapter();
    if (targetChapter <= currentChapter) {
      return {
        chaptersAdvanced: 0,
        totalNewRipples: 0,
        manifestedEffects: 0,
        activatedDormant: 0
      };
    }

    let totalNewRipples = 0;
    let manifestedEffects = 0;
    let activatedDormant = 0;

    for (let chapter = currentChapter + 1; chapter <= targetChapter; chapter++) {
      // Check dormant ripples for activation
      const activated = this.checkDormantRipples(chapter);
      activatedDormant += activated;

      // Propagate active ripples
      const result = this.propagateAll();
      totalNewRipples += result.newRipples.length;

      // Count manifested
      manifestedEffects += Array.from(this.ripples.values())
        .filter(r => r.chapterManifested === chapter).length;

      // Take snapshot if needed
      if (chapter % this.config.snapshotInterval === 0) {
        this.takeSnapshot(chapter);
      }
    }

    return {
      chaptersAdvanced: targetChapter - currentChapter,
      totalNewRipples,
      manifestedEffects,
      activatedDormant
    };
  }

  // ==========================================================================
  // RULE MATCHING
  // ==========================================================================

  /**
   * Check if a rule applies to an action
   */
  private ruleApplies(rule: PropagationRule, action: CausalAction): boolean {
    if (!rule.isEnabled) return false;

    if (rule.sourceActionTypes &&
        !rule.sourceActionTypes.includes(action.type)) {
      return false;
    }

    if (rule.sourceCategories) {
      const hasCategory = action.categories.some(c =>
        rule.sourceCategories!.includes(c)
      );
      if (!hasCategory) return false;
    }

    if (rule.sourceEntityTypes &&
        !rule.sourceEntityTypes.includes(action.actorType)) {
      return false;
    }

    if (rule.minIntensity !== undefined &&
        action.initialIntensity < rule.minIntensity) {
      return false;
    }

    return true;
  }

  /**
   * Check if a rule applies for secondary propagation
   */
  private ruleAppliesForPropagation(
    rule: PropagationRule,
    ripple: Ripple,
    _action: CausalAction
  ): boolean {
    if (!rule.isEnabled) return false;

    // Check if rule's source categories match ripple's category
    if (rule.sourceCategories &&
        !rule.sourceCategories.includes(ripple.category)) {
      return false;
    }

    // Check intensity
    if (rule.minIntensity !== undefined &&
        ripple.intensity < rule.minIntensity) {
      return false;
    }

    // Check max distance
    if (rule.maxDistance !== undefined &&
        ripple.propagationDepth >= rule.maxDistance) {
      return false;
    }

    return true;
  }

  /**
   * Apply a rule to generate ripples
   */
  private applyRule(
    rule: PropagationRule,
    action: CausalAction,
    parentRipple: Ripple | null
  ): Ripple[] {
    const newRipples: Ripple[] = [];

    // Get target entities based on relationships
    const sourceEntityId = parentRipple?.affectedEntityId ?? action.actorId;
    const connections = this.relationshipLookup?.(sourceEntityId) ?? [];

    for (const connection of connections) {
      // Filter by relationship type
      if (rule.targetRelationTypes &&
          !rule.targetRelationTypes.includes(connection.relationType)) {
        continue;
      }

      // Filter by entity type
      if (rule.targetEntityTypes &&
          !rule.targetEntityTypes.includes(connection.targetType)) {
        continue;
      }

      const entity = this.entityLookup?.(connection.targetId);
      const entityName = entity?.name ?? connection.targetId;

      // Generate effect description
      const effectDescription = rule.effectTemplate
        .replace('{actor}', action.actorName)
        .replace('{target}', entityName)
        .replace('{action}', action.name);

      // Calculate intensity
      const baseIntensity = parentRipple?.intensity ?? action.initialIntensity;
      const newIntensity = Math.max(
        1,
        Math.round(baseIntensity * rule.intensityModifier)
      ) as RippleIntensity;

      // Calculate energy
      const baseEnergy = parentRipple?.remainingEnergy ?? 100;
      const newEnergy = baseEnergy - rule.energyConsumption;

      if (newEnergy < this.config.minPropagationEnergy) {
        continue;
      }

      const ripple = this.createRipple(action.id, {
        category: rule.effectCategory,
        description: effectDescription,
        affectedEntityId: connection.targetId,
        affectedEntityType: connection.targetType,
        affectedEntityName: entityName,
        effectType: rule.effectType,
        effectDescription,
        chapterCreated: action.chapterOccurred,
        intensity: newIntensity,
        parentRippleId: parentRipple?.id,
        propagationDepth: (parentRipple?.propagationDepth ?? -1) + 1,
        remainingEnergy: newEnergy
      });

      newRipples.push(ripple);
    }

    return newRipples;
  }

  // ==========================================================================
  // DORMANT RIPPLE HANDLING
  // ==========================================================================

  /**
   * Check dormant ripples for activation
   */
  checkDormantRipples(currentChapter: number): number {
    if (!this.config.enableDormantRipples) return 0;

    let activated = 0;

    for (const rippleId of this.dormantRipples) {
      const ripple = this.ripples.get(rippleId);
      if (!ripple) continue;

      // Simple chapter-based trigger check
      // In a full implementation, this would evaluate complex conditions
      if (ripple.triggerCondition) {
        const triggerMatch = ripple.triggerCondition.match(/chapter:(\d+)/);
        if (triggerMatch) {
          const triggerChapter = parseInt(triggerMatch[1]);
          if (currentChapter >= triggerChapter) {
            this.activateDormantRipple(rippleId, currentChapter);
            activated++;
          }
        }
      }
    }

    return activated;
  }

  /**
   * Activate a dormant ripple
   */
  activateDormantRipple(rippleId: string, chapter: number): void {
    const ripple = this.ripples.get(rippleId);
    if (!ripple || ripple.status !== RippleStatus.DORMANT) return;

    ripple.status = RippleStatus.ACTIVE;
    ripple.chapterManifested = chapter;
    ripple.updatedAt = new Date();

    this.dormantRipples.delete(rippleId);
  }

  /**
   * Create a dormant ripple that will activate later
   */
  createDormantRipple(
    sourceActionId: string,
    triggerCondition: string,
    data: Omit<Parameters<RippleEffectEngine['createRipple']>[1], 'triggerCondition'>
  ): Ripple {
    return this.createRipple(sourceActionId, {
      ...data,
      triggerCondition
    });
  }

  // ==========================================================================
  // COMPOUND EFFECTS
  // ==========================================================================

  /**
   * Check for and create compound effects
   */
  checkCompoundEffects(entityId: string): Ripple[] {
    if (!this.config.enableCompoundEffects) return [];

    const entityRipples = this.getRipplesForEntity(entityId);
    if (entityRipples.length < 2) return [];

    const newRipples: Ripple[] = [];

    // Group by category
    const byCategory = new Map<RippleCategory, Ripple[]>();
    for (const ripple of entityRipples) {
      if (ripple.status !== RippleStatus.ACTIVE &&
          ripple.status !== RippleStatus.MANIFESTED) {
        continue;
      }

      if (!byCategory.has(ripple.category)) {
        byCategory.set(ripple.category, []);
      }
      byCategory.get(ripple.category)!.push(ripple);
    }

    // Check for compound effects within each category
    for (const [category, ripples] of byCategory) {
      if (ripples.length < 2) continue;

      // Calculate combined intensity
      const totalIntensity = ripples.reduce((sum, r) => sum + r.intensity, 0);

      // If combined intensity exceeds threshold, create compound effect
      if (totalIntensity >= RippleIntensity.MAJOR) {
        const entity = this.entityLookup?.(entityId);
        const compoundRipple = this.createRipple(ripples[0].sourceActionId, {
          category,
          description: `Compound effect from ${ripples.length} converging ripples`,
          affectedEntityId: entityId,
          affectedEntityType: entity?.type ?? 'unknown',
          affectedEntityName: entity?.name ?? entityId,
          effectType: 'compound_effect',
          effectDescription: `Multiple ${category} effects combine on ${entity?.name ?? entityId}`,
          chapterCreated: Math.max(...ripples.map(r => r.chapterCreated)),
          intensity: Math.min(RippleIntensity.LEGENDARY, totalIntensity) as RippleIntensity,
          propagationSpeed: PropagationSpeed.FAST,
          remainingEnergy: Math.max(...ripples.map(r => r.remainingEnergy))
        });

        compoundRipple.amplifiedBy = ripples.map(r => r.id);
        compoundRipple.status = RippleStatus.AMPLIFIED;

        newRipples.push(compoundRipple);

        // Mark contributing ripples
        for (const ripple of ripples) {
          ripple.status = RippleStatus.TRANSFORMED;
          ripple.updatedAt = new Date();
        }
      }
    }

    return newRipples;
  }

  // ==========================================================================
  // QUERIES
  // ==========================================================================

  /**
   * Get a ripple by ID
   */
  getRipple(id: string): Ripple | undefined {
    return this.ripples.get(id);
  }

  /**
   * Get all ripples
   */
  getAllRipples(): Ripple[] {
    return Array.from(this.ripples.values());
  }

  /**
   * Get ripples for an action
   */
  getRipplesForAction(actionId: string): Ripple[] {
    const ids = this.ripplesByAction.get(actionId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.ripples.get(id)!).filter(Boolean);
  }

  /**
   * Get ripples affecting an entity
   */
  getRipplesForEntity(entityId: string): Ripple[] {
    const ids = this.ripplesByEntity.get(entityId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.ripples.get(id)!).filter(Boolean);
  }

  /**
   * Get ripples by category
   */
  getRipplesByCategory(category: RippleCategory): Ripple[] {
    const ids = this.ripplesByCategory.get(category);
    if (!ids) return [];
    return Array.from(ids).map(id => this.ripples.get(id)!).filter(Boolean);
  }

  /**
   * Get ripples by chapter
   */
  getRipplesByChapter(chapter: number): Ripple[] {
    const ids = this.ripplesByChapter.get(chapter);
    if (!ids) return [];
    return Array.from(ids).map(id => this.ripples.get(id)!).filter(Boolean);
  }

  /**
   * Get active ripples
   */
  getActiveRipples(): Ripple[] {
    return Array.from(this.ripples.values())
      .filter(r => r.status === RippleStatus.ACTIVE);
  }

  /**
   * Get dormant ripples
   */
  getDormantRipples(): Ripple[] {
    return Array.from(this.dormantRipples)
      .map(id => this.ripples.get(id)!)
      .filter(Boolean);
  }

  /**
   * Get the ripple chain from an action
   */
  getRippleChain(actionId: string): {
    action: CausalAction;
    ripples: Ripple[];
    depth: number;
    affectedEntities: Set<string>;
  } | undefined {
    const action = this.actions.get(actionId);
    if (!action) return undefined;

    const ripples = this.getRipplesForAction(actionId);
    const affectedEntities = new Set<string>();
    let maxDepth = 0;

    for (const ripple of ripples) {
      affectedEntities.add(ripple.affectedEntityId);
      maxDepth = Math.max(maxDepth, ripple.propagationDepth);
    }

    return {
      action,
      ripples,
      depth: maxDepth,
      affectedEntities
    };
  }

  /**
   * Trace ripple ancestry
   */
  traceRippleAncestry(rippleId: string): Ripple[] {
    const ancestry: Ripple[] = [];
    let current = this.ripples.get(rippleId);

    while (current) {
      ancestry.unshift(current);
      if (current.parentRippleId) {
        current = this.ripples.get(current.parentRippleId);
      } else {
        break;
      }
    }

    return ancestry;
  }

  /**
   * Get current simulation chapter
   */
  getCurrentChapter(): number {
    let maxChapter = 0;
    for (const action of this.actions.values()) {
      maxChapter = Math.max(maxChapter, action.chapterOccurred);
    }
    for (const ripple of this.ripples.values()) {
      maxChapter = Math.max(maxChapter, ripple.chapterCreated);
      if (ripple.chapterManifested) {
        maxChapter = Math.max(maxChapter, ripple.chapterManifested);
      }
    }
    return maxChapter;
  }

  // ==========================================================================
  // STATUS UPDATES
  // ==========================================================================

  /**
   * Update ripple status
   */
  updateRippleStatus(rippleId: string, status: RippleStatus): void {
    const ripple = this.ripples.get(rippleId);
    if (!ripple) return;

    ripple.status = status;
    ripple.updatedAt = new Date();

    if (status === RippleStatus.MANIFESTED && !ripple.chapterManifested) {
      ripple.chapterManifested = this.getCurrentChapter();
    }

    if (status !== RippleStatus.DORMANT) {
      this.dormantRipples.delete(rippleId);
    }
  }

  /**
   * Counter a ripple with another
   */
  counterRipple(rippleId: string, counteringRippleId: string): void {
    const ripple = this.ripples.get(rippleId);
    const countering = this.ripples.get(counteringRippleId);

    if (!ripple || !countering) return;

    if (!ripple.counteredBy) ripple.counteredBy = [];
    ripple.counteredBy.push(counteringRippleId);

    // Reduce intensity based on countering ripple
    const reduction = countering.intensity / ripple.intensity;
    if (reduction >= 1) {
      ripple.status = RippleStatus.COUNTERED;
    } else {
      ripple.intensity = Math.max(
        1,
        Math.round(ripple.intensity * (1 - reduction))
      ) as RippleIntensity;
    }

    ripple.updatedAt = new Date();
  }

  // ==========================================================================
  // SNAPSHOTS
  // ==========================================================================

  /**
   * Take a snapshot of the current world state
   */
  takeSnapshot(chapter: number): WorldStateSnapshot {
    const affectedEntities = new Map<string, number>();
    for (const [entityId, rippleIds] of this.ripplesByEntity) {
      affectedEntities.set(entityId, rippleIds.size);
    }

    // Find dominant categories
    const categoryCounts = new Map<RippleCategory, number>();
    for (const ripple of this.ripples.values()) {
      const count = categoryCounts.get(ripple.category) ?? 0;
      categoryCounts.set(ripple.category, count + 1);
    }
    const dominantCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // Collect major changes
    const majorChanges: string[] = [];
    for (const ripple of this.ripples.values()) {
      if (ripple.intensity >= RippleIntensity.MAJOR &&
          ripple.chapterManifested === chapter) {
        majorChanges.push(ripple.effectDescription);
      }
    }

    const snapshot: WorldStateSnapshot = {
      chapter,
      activeRipples: this.getActiveRipples().length,
      dormantRipples: this.dormantRipples.size,
      manifestedEffects: Array.from(this.ripples.values())
        .filter(r => r.status === RippleStatus.MANIFESTED).length,
      affectedEntities,
      dominantCategories,
      majorChanges,
      timestamp: new Date()
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): WorldStateSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Get snapshot for a specific chapter
   */
  getSnapshotForChapter(chapter: number): WorldStateSnapshot | undefined {
    return this.snapshots.find(s => s.chapter === chapter);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    totalActions: number;
    totalRipples: number;
    activeRipples: number;
    dormantRipples: number;
    manifestedRipples: number;
    exhaustedRipples: number;
    counteredRipples: number;
    affectedEntities: number;
    maxPropagationDepth: number;
    avgIntensity: number;
    byCategory: Record<string, number>;
    byActionType: Record<string, number>;
    byStatus: Record<string, number>;
  } {
    const rippleArray = Array.from(this.ripples.values());

    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalIntensity = 0;
    let maxDepth = 0;

    for (const ripple of rippleArray) {
      byCategory[ripple.category] = (byCategory[ripple.category] ?? 0) + 1;
      byStatus[ripple.status] = (byStatus[ripple.status] ?? 0) + 1;
      totalIntensity += ripple.intensity;
      maxDepth = Math.max(maxDepth, ripple.propagationDepth);
    }

    const byActionType: Record<string, number> = {};
    for (const action of this.actions.values()) {
      byActionType[action.type] = (byActionType[action.type] ?? 0) + 1;
    }

    return {
      totalActions: this.actions.size,
      totalRipples: this.ripples.size,
      activeRipples: rippleArray.filter(r => r.status === RippleStatus.ACTIVE).length,
      dormantRipples: this.dormantRipples.size,
      manifestedRipples: rippleArray.filter(r => r.status === RippleStatus.MANIFESTED).length,
      exhaustedRipples: rippleArray.filter(r => r.status === RippleStatus.EXHAUSTED).length,
      counteredRipples: rippleArray.filter(r => r.status === RippleStatus.COUNTERED).length,
      affectedEntities: this.ripplesByEntity.size,
      maxPropagationDepth: maxDepth,
      avgIntensity: rippleArray.length > 0 ? totalIntensity / rippleArray.length : 0,
      byCategory,
      byActionType,
      byStatus
    };
  }

  // ==========================================================================
  // IMPORT/EXPORT
  // ==========================================================================

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      actions: Array.from(this.actions.values()),
      ripples: Array.from(this.ripples.values()),
      rules: Array.from(this.rules.values()),
      snapshots: this.snapshots,
      config: this.config,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.clear();

    if (data.config) {
      this.config = { ...defaultConfig, ...data.config };
    }

    if (data.rules) {
      for (const rule of data.rules) {
        this.rules.set(rule.id, rule);
      }
    }

    if (data.actions) {
      for (const action of data.actions) {
        action.timestamp = new Date(action.timestamp);
        action.createdAt = new Date(action.createdAt);
        action.updatedAt = new Date(action.updatedAt);
        this.actions.set(action.id, action);
        this.ripplesByAction.set(action.id, new Set());
      }
    }

    if (data.ripples) {
      for (const ripple of data.ripples) {
        ripple.createdAt = new Date(ripple.createdAt);
        ripple.updatedAt = new Date(ripple.updatedAt);
        this.storeRipple(ripple);
      }
    }

    if (data.snapshots) {
      for (const snapshot of data.snapshots) {
        snapshot.timestamp = new Date(snapshot.timestamp);
        snapshot.affectedEntities = new Map(Object.entries(snapshot.affectedEntities));
        this.snapshots.push(snapshot);
      }
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.actions.clear();
    this.ripples.clear();
    this.chains.clear();
    this.snapshots = [];
    this.ripplesByAction.clear();
    this.ripplesByEntity.clear();
    this.ripplesByCategory.clear();
    this.ripplesByChapter.clear();
    this.dormantRipples.clear();
  }
}

// Default instance
export const rippleEffectEngine = new RippleEffectEngine();

export default RippleEffectEngine;
