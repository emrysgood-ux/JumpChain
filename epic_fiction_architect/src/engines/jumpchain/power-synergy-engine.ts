/**
 * Epic Fiction Architect - Power Synergy Engine
 *
 * Tracks how powers from different universes interact, combine, and
 * potentially conflict. Critical for Jumpchain narratives where:
 * - Magic from Universe A meets tech from Universe B
 * - Powers may stack, interfere, or create unexpected combos
 * - Power scaling needs to account for accumulation across jumps
 * - Some powers may not work in certain universes
 *
 * Handles the complexity of 100+ jumps worth of accumulated abilities.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * How powers interact with each other
 */
export enum InteractionType {
  SYNERGY = 'synergy',           // Powers enhance each other
  STACK = 'stack',               // Effects add together
  MULTIPLY = 'multiply',         // Effects multiply
  OVERRIDE = 'override',         // One replaces the other
  CONFLICT = 'conflict',         // Powers interfere
  NULLIFY = 'nullify',           // One cancels the other
  TRANSFORM = 'transform',       // Combination creates new effect
  CONDITIONAL = 'conditional',   // Depends on circumstances
  UNKNOWN = 'unknown'            // Not yet determined
}

/**
 * Power source types
 */
export enum PowerSource {
  MAGIC = 'magic',               // Mystical energy
  CHI = 'chi',                   // Life energy
  PSYCHIC = 'psychic',           // Mental powers
  DIVINE = 'divine',             // God-granted
  DEMONIC = 'demonic',           // Infernal
  COSMIC = 'cosmic',             // Universal forces
  TECHNOLOGICAL = 'technological', // Tech-based
  BIOLOGICAL = 'biological',     // Body modification
  DIMENSIONAL = 'dimensional',   // Other dimensions
  CONCEPTUAL = 'conceptual',     // Abstract/meta
  HYBRID = 'hybrid',             // Multiple sources
  UNKNOWN = 'unknown'
}

/**
 * Power tier for scaling
 */
export enum PowerTier {
  MUNDANE = 0,                   // Peak human
  SUPERHUMAN = 1,                // Street level
  METAHUMAN = 2,                 // City level
  CONTINENTAL = 3,               // Large scale
  PLANETARY = 4,                 // World level
  STELLAR = 5,                   // Solar system
  GALACTIC = 6,                  // Galaxy level
  UNIVERSAL = 7,                 // Universe level
  MULTIVERSAL = 8,               // Multiple universes
  OMNIVERSAL = 9                 // All realities
}

/**
 * Context where power operates
 */
export enum PowerContext {
  COMBAT = 'combat',
  UTILITY = 'utility',
  DEFENSE = 'defense',
  TRAVEL = 'travel',
  CRAFTING = 'crafting',
  SOCIAL = 'social',
  INFORMATION = 'information',
  HEALING = 'healing',
  CREATION = 'creation',
  DESTRUCTION = 'destruction'
}

/**
 * Limitation type
 */
export enum LimitationType {
  RESOURCE_COST = 'resource_cost',     // Uses energy/mana
  COOLDOWN = 'cooldown',               // Time between uses
  CHARGE_UP = 'charge_up',             // Time to activate
  RANGE = 'range',                     // Distance limit
  DURATION = 'duration',               // Effect length
  CONCENTRATION = 'concentration',     // Requires focus
  MATERIAL = 'material',               // Needs components
  ENVIRONMENTAL = 'environmental',     // Needs conditions
  EMOTIONAL = 'emotional',             // Mood-based
  PHYSICAL = 'physical',               // Body requirement
  KNOWLEDGE = 'knowledge',             // Must know target
  LINE_OF_SIGHT = 'line_of_sight',     // Must see target
  FRIENDLY_FIRE = 'friendly_fire',     // Can hurt allies
  UNIVERSAL = 'universal'              // Doesn't work everywhere
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * A power or ability the jumper possesses
 */
export interface Power {
  id: string;
  name: string;
  description: string;

  // Source
  sourceJumpId: string;
  sourceJumpName: string;
  sourcePerkId?: string;
  sourceUniverse: string;
  powerSource: PowerSource;

  // Classification
  tier: PowerTier;
  contexts: PowerContext[];
  tags: string[];

  // Capabilities
  effects: PowerEffect[];
  limitations: PowerLimitation[];
  scalingFactors: ScalingFactor[];

  // Interactions
  synergyIds: string[];          // Powers it combos with
  conflictIds: string[];         // Powers it conflicts with
  requiresIds: string[];         // Powers needed to function
  enhancedByIds: string[];       // Powers that boost this

  // Usage
  isActive: boolean;             // Can be toggled
  isPassive: boolean;            // Always on
  activationCost?: string;       // What it costs to use
  cooldown?: string;             // Time between uses

  // Universe compatibility
  universalCompatibility: UniverseCompatibility[];

  // Tracking
  firstUsedChapter?: number;
  notableUses: Array<{
    chapter: number;
    description: string;
    effectiveness: number;       // 1-10
  }>;

  // Metadata
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * An effect a power provides
 */
export interface PowerEffect {
  id: string;
  name: string;
  description: string;
  context: PowerContext;
  magnitude: number;             // Relative strength
  scalable: boolean;             // Can grow stronger
  stackable: boolean;            // Multiple instances stack
  derivedFrom?: string;          // If based on another effect
}

/**
 * A limitation on a power
 */
export interface PowerLimitation {
  id: string;
  type: LimitationType;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  canBeOvercome: boolean;
  overcomeMethod?: string;       // How to bypass
  bypassed: boolean;             // If overcome
  bypassedByPerkId?: string;     // What overcame it
}

/**
 * How a power scales
 */
export interface ScalingFactor {
  id: string;
  factor: string;                // What causes scaling
  description: string;
  currentMultiplier: number;     // Current boost
  maxMultiplier?: number;        // Cap if any
  growthType: 'linear' | 'exponential' | 'logarithmic' | 'step';
}

/**
 * How a power works in different universes
 */
export interface UniverseCompatibility {
  universe: string;
  jumpId?: string;
  compatibility: 'full' | 'partial' | 'enhanced' | 'reduced' | 'none';
  modifiers: string[];           // How it changes
  notes: string;
}

/**
 * A discovered synergy between powers
 */
export interface PowerSynergy {
  id: string;
  name: string;
  description: string;

  // Components
  powerIds: string[];            // Powers involved
  requiredAll: boolean;          // Need all or just some

  // Effect
  interactionType: InteractionType;
  combinedEffect: string;
  effectMagnitude: number;       // How powerful
  tier: PowerTier;               // Resulting tier

  // Discovery
  discoveredChapter: number;
  discoveryContext: string;
  wasIntentional: boolean;

  // Usage
  activationMethod: string;      // How to trigger
  usageCount: number;
  notableUses: Array<{
    chapter: number;
    description: string;
    outcome: string;
  }>;

  // Metadata
  tags: string[];
  notes: string;
  createdAt: Date;
}

/**
 * A conflict between powers
 */
export interface PowerConflict {
  id: string;
  powerAId: string;
  powerBId: string;

  // Nature
  conflictType: 'interference' | 'mutual_exclusion' | 'feedback' | 'paradox';
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';

  // Effects
  effects: string[];             // What happens
  triggerConditions: string[];   // When it occurs

  // Resolution
  resolutionMethod?: string;     // How to fix
  resolved: boolean;
  resolvedByPerkId?: string;

  // Tracking
  occurrenceChapters: number[];

  notes: string;
  createdAt: Date;
}

/**
 * Power combination attempt result
 */
export interface CombinationResult {
  powerIds: string[];
  success: boolean;
  resultType: InteractionType;
  description: string;
  newEffects?: string[];
  warnings?: string[];
  suggestedSynergies?: string[];
}

/**
 * Power scaling calculation
 */
export interface ScalingCalculation {
  powerId: string;
  baseTier: PowerTier;
  currentTier: PowerTier;
  multipliers: Array<{
    source: string;
    factor: number;
    description: string;
  }>;
  totalMultiplier: number;
  effectivePower: number;        // Numerical representation
}

/**
 * Configuration
 */
export interface PowerSynergyConfig {
  enableAutoSynergyDetection: boolean;
  maxPowersInCombination: number;
  conflictResolutionMode: 'strict' | 'lenient' | 'narrative';
  defaultUniversalCompatibility: UniverseCompatibility['compatibility'];
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: PowerSynergyConfig = {
  enableAutoSynergyDetection: true,
  maxPowersInCombination: 5,
  conflictResolutionMode: 'narrative',
  defaultUniversalCompatibility: 'full'
};

// ============================================================================
// COMMON SYNERGY PATTERNS
// ============================================================================

/**
 * Pre-defined synergy patterns that are commonly discovered
 */
const COMMON_SYNERGY_PATTERNS: Array<{
  sources: PowerSource[];
  contexts: PowerContext[];
  interactionType: InteractionType;
  description: string;
}> = [
  {
    sources: [PowerSource.MAGIC, PowerSource.TECHNOLOGICAL],
    contexts: [PowerContext.CRAFTING],
    interactionType: InteractionType.SYNERGY,
    description: 'Magitech fusion - magical enhancement of technology'
  },
  {
    sources: [PowerSource.CHI, PowerSource.PSYCHIC],
    contexts: [PowerContext.COMBAT],
    interactionType: InteractionType.MULTIPLY,
    description: 'Mind-body unity amplifies both'
  },
  {
    sources: [PowerSource.DIVINE, PowerSource.DEMONIC],
    contexts: [PowerContext.COMBAT],
    interactionType: InteractionType.CONFLICT,
    description: 'Holy and unholy energies interfere'
  },
  {
    sources: [PowerSource.BIOLOGICAL, PowerSource.TECHNOLOGICAL],
    contexts: [PowerContext.COMBAT, PowerContext.UTILITY],
    interactionType: InteractionType.SYNERGY,
    description: 'Cybernetic enhancement of biological abilities'
  },
  {
    sources: [PowerSource.PSYCHIC, PowerSource.MAGIC],
    contexts: [PowerContext.INFORMATION],
    interactionType: InteractionType.MULTIPLY,
    description: 'Psychic-magical divination enhancement'
  }
];

// ============================================================================
// POWER SYNERGY ENGINE
// ============================================================================

/**
 * Power Synergy Engine
 *
 * Manages power interactions, combinations, and scaling across
 * multiple universes and power sources.
 */
export class PowerSynergyEngine {
  private config: PowerSynergyConfig;
  private powers: Map<string, Power> = new Map();
  private synergies: Map<string, PowerSynergy> = new Map();
  private conflicts: Map<string, PowerConflict> = new Map();

  // Indices
  private powersBySource: Map<PowerSource, Set<string>> = new Map();
  private powersByTier: Map<PowerTier, Set<string>> = new Map();
  private powersByJump: Map<string, Set<string>> = new Map();
  private powersByContext: Map<PowerContext, Set<string>> = new Map();

  constructor(config?: Partial<PowerSynergyConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // ==========================================================================
  // POWER MANAGEMENT
  // ==========================================================================

  /**
   * Register a power
   */
  registerPower(data: {
    name: string;
    description: string;
    sourceJumpId: string;
    sourceJumpName: string;
    sourceUniverse: string;
    powerSource: PowerSource;
    tier: PowerTier;
    contexts: PowerContext[];
    sourcePerkId?: string;
    effects?: Omit<PowerEffect, 'id'>[];
    limitations?: Omit<PowerLimitation, 'id'>[];
    isActive?: boolean;
    isPassive?: boolean;
    activationCost?: string;
    cooldown?: string;
    tags?: string[];
    notes?: string;
  }): Power {
    const id = uuidv4();
    const now = new Date();

    const power: Power = {
      id,
      name: data.name,
      description: data.description,
      sourceJumpId: data.sourceJumpId,
      sourceJumpName: data.sourceJumpName,
      sourcePerkId: data.sourcePerkId,
      sourceUniverse: data.sourceUniverse,
      powerSource: data.powerSource,
      tier: data.tier,
      contexts: data.contexts,
      tags: data.tags ?? [],
      effects: (data.effects ?? []).map(e => ({ ...e, id: uuidv4() })),
      limitations: (data.limitations ?? []).map(l => ({
        ...l,
        id: uuidv4(),
        bypassed: false
      })),
      scalingFactors: [],
      synergyIds: [],
      conflictIds: [],
      requiresIds: [],
      enhancedByIds: [],
      isActive: data.isActive ?? false,
      isPassive: data.isPassive ?? true,
      activationCost: data.activationCost,
      cooldown: data.cooldown,
      universalCompatibility: [],
      notableUses: [],
      notes: data.notes ?? '',
      createdAt: now,
      updatedAt: now
    };

    this.storePower(power);

    // Auto-detect synergies if enabled
    if (this.config.enableAutoSynergyDetection) {
      this.detectPotentialSynergies(id);
      this.detectPotentialConflicts(id);
    }

    return power;
  }

  /**
   * Store power and update indices
   */
  private storePower(power: Power): void {
    this.powers.set(power.id, power);

    // Index by source
    if (!this.powersBySource.has(power.powerSource)) {
      this.powersBySource.set(power.powerSource, new Set());
    }
    this.powersBySource.get(power.powerSource)!.add(power.id);

    // Index by tier
    if (!this.powersByTier.has(power.tier)) {
      this.powersByTier.set(power.tier, new Set());
    }
    this.powersByTier.get(power.tier)!.add(power.id);

    // Index by jump
    if (!this.powersByJump.has(power.sourceJumpId)) {
      this.powersByJump.set(power.sourceJumpId, new Set());
    }
    this.powersByJump.get(power.sourceJumpId)!.add(power.id);

    // Index by context
    for (const context of power.contexts) {
      if (!this.powersByContext.has(context)) {
        this.powersByContext.set(context, new Set());
      }
      this.powersByContext.get(context)!.add(power.id);
    }
  }

  /**
   * Get power by ID
   */
  getPower(id: string): Power | undefined {
    return this.powers.get(id);
  }

  /**
   * Get all powers
   */
  getAllPowers(): Power[] {
    return Array.from(this.powers.values());
  }

  /**
   * Update a power
   */
  updatePower(
    id: string,
    updates: Partial<Omit<Power, 'id' | 'createdAt'>>
  ): Power | undefined {
    const power = this.powers.get(id);
    if (!power) return undefined;

    Object.assign(power, updates);
    power.updatedAt = new Date();

    return power;
  }

  /**
   * Add an effect to a power
   */
  addEffect(powerId: string, effect: Omit<PowerEffect, 'id'>): PowerEffect | undefined {
    const power = this.powers.get(powerId);
    if (!power) return undefined;

    const newEffect: PowerEffect = {
      ...effect,
      id: uuidv4()
    };

    power.effects.push(newEffect);
    power.updatedAt = new Date();

    return newEffect;
  }

  /**
   * Add a limitation to a power
   */
  addLimitation(
    powerId: string,
    limitation: Omit<PowerLimitation, 'id' | 'bypassed'>
  ): PowerLimitation | undefined {
    const power = this.powers.get(powerId);
    if (!power) return undefined;

    const newLimitation: PowerLimitation = {
      ...limitation,
      id: uuidv4(),
      bypassed: false
    };

    power.limitations.push(newLimitation);
    power.updatedAt = new Date();

    return newLimitation;
  }

  /**
   * Bypass a limitation
   */
  bypassLimitation(
    powerId: string,
    limitationId: string,
    bypassPerkId?: string
  ): boolean {
    const power = this.powers.get(powerId);
    if (!power) return false;

    const limitation = power.limitations.find(l => l.id === limitationId);
    if (!limitation || !limitation.canBeOvercome) return false;

    limitation.bypassed = true;
    limitation.bypassedByPerkId = bypassPerkId;
    power.updatedAt = new Date();

    return true;
  }

  /**
   * Add scaling factor to a power
   */
  addScalingFactor(
    powerId: string,
    factor: Omit<ScalingFactor, 'id'>
  ): ScalingFactor | undefined {
    const power = this.powers.get(powerId);
    if (!power) return undefined;

    const newFactor: ScalingFactor = {
      ...factor,
      id: uuidv4()
    };

    power.scalingFactors.push(newFactor);
    power.updatedAt = new Date();

    return newFactor;
  }

  /**
   * Set universe compatibility
   */
  setUniverseCompatibility(
    powerId: string,
    compatibility: UniverseCompatibility
  ): void {
    const power = this.powers.get(powerId);
    if (!power) return;

    const existing = power.universalCompatibility.findIndex(
      c => c.universe === compatibility.universe
    );

    if (existing >= 0) {
      power.universalCompatibility[existing] = compatibility;
    } else {
      power.universalCompatibility.push(compatibility);
    }

    power.updatedAt = new Date();
  }

  /**
   * Record notable use
   */
  recordUse(
    powerId: string,
    chapter: number,
    description: string,
    effectiveness: number
  ): void {
    const power = this.powers.get(powerId);
    if (!power) return;

    if (!power.firstUsedChapter) {
      power.firstUsedChapter = chapter;
    }

    power.notableUses.push({ chapter, description, effectiveness });
    power.updatedAt = new Date();
  }

  // ==========================================================================
  // SYNERGY DETECTION & MANAGEMENT
  // ==========================================================================

  /**
   * Detect potential synergies for a new power
   */
  private detectPotentialSynergies(powerId: string): void {
    const power = this.powers.get(powerId);
    if (!power) return;

    // Check against common patterns
    for (const pattern of COMMON_SYNERGY_PATTERNS) {
      if (!pattern.sources.includes(power.powerSource)) continue;
      if (!pattern.contexts.some(c => power.contexts.includes(c))) continue;

      // Find matching powers
      for (const source of pattern.sources) {
        if (source === power.powerSource) continue;

        const matchingPowers = this.powersBySource.get(source);
        if (!matchingPowers) continue;

        for (const otherId of matchingPowers) {
          const other = this.powers.get(otherId);
          if (!other) continue;

          if (pattern.contexts.some(c => other.contexts.includes(c))) {
            // Potential synergy found
            power.synergyIds.push(otherId);
            other.synergyIds.push(powerId);
          }
        }
      }
    }
  }

  /**
   * Detect potential conflicts for a new power
   */
  private detectPotentialConflicts(powerId: string): void {
    const power = this.powers.get(powerId);
    if (!power) return;

    // Check for divine/demonic conflicts
    if (power.powerSource === PowerSource.DIVINE) {
      const demonicPowers = this.powersBySource.get(PowerSource.DEMONIC);
      if (demonicPowers) {
        for (const otherId of demonicPowers) {
          power.conflictIds.push(otherId);
          const other = this.powers.get(otherId);
          if (other) other.conflictIds.push(powerId);
        }
      }
    }

    if (power.powerSource === PowerSource.DEMONIC) {
      const divinePowers = this.powersBySource.get(PowerSource.DIVINE);
      if (divinePowers) {
        for (const otherId of divinePowers) {
          power.conflictIds.push(otherId);
          const other = this.powers.get(otherId);
          if (other) other.conflictIds.push(powerId);
        }
      }
    }
  }

  /**
   * Create a synergy between powers
   */
  createSynergy(data: {
    name: string;
    description: string;
    powerIds: string[];
    interactionType: InteractionType;
    combinedEffect: string;
    effectMagnitude: number;
    tier: PowerTier;
    discoveredChapter: number;
    discoveryContext: string;
    wasIntentional?: boolean;
    activationMethod: string;
    requiredAll?: boolean;
    tags?: string[];
    notes?: string;
  }): PowerSynergy | undefined {
    // Validate powers exist
    for (const powerId of data.powerIds) {
      if (!this.powers.has(powerId)) return undefined;
    }

    if (data.powerIds.length > this.config.maxPowersInCombination) {
      return undefined;
    }

    const id = uuidv4();
    const now = new Date();

    const synergy: PowerSynergy = {
      id,
      name: data.name,
      description: data.description,
      powerIds: data.powerIds,
      requiredAll: data.requiredAll ?? true,
      interactionType: data.interactionType,
      combinedEffect: data.combinedEffect,
      effectMagnitude: data.effectMagnitude,
      tier: data.tier,
      discoveredChapter: data.discoveredChapter,
      discoveryContext: data.discoveryContext,
      wasIntentional: data.wasIntentional ?? false,
      activationMethod: data.activationMethod,
      usageCount: 0,
      notableUses: [],
      tags: data.tags ?? [],
      notes: data.notes ?? '',
      createdAt: now
    };

    this.synergies.set(id, synergy);

    // Update power references
    for (const powerId of data.powerIds) {
      const power = this.powers.get(powerId);
      if (power) {
        for (const otherId of data.powerIds) {
          if (otherId !== powerId && !power.synergyIds.includes(otherId)) {
            power.synergyIds.push(otherId);
          }
        }
        power.updatedAt = now;
      }
    }

    return synergy;
  }

  /**
   * Get synergy by ID
   */
  getSynergy(id: string): PowerSynergy | undefined {
    return this.synergies.get(id);
  }

  /**
   * Get all synergies
   */
  getAllSynergies(): PowerSynergy[] {
    return Array.from(this.synergies.values());
  }

  /**
   * Get synergies for a power
   */
  getSynergiesForPower(powerId: string): PowerSynergy[] {
    return Array.from(this.synergies.values())
      .filter(s => s.powerIds.includes(powerId));
  }

  /**
   * Record synergy use
   */
  recordSynergyUse(
    synergyId: string,
    chapter: number,
    description: string,
    outcome: string
  ): void {
    const synergy = this.synergies.get(synergyId);
    if (!synergy) return;

    synergy.usageCount++;
    synergy.notableUses.push({ chapter, description, outcome });
  }

  // ==========================================================================
  // CONFLICT MANAGEMENT
  // ==========================================================================

  /**
   * Create a conflict between powers
   */
  createConflict(data: {
    powerAId: string;
    powerBId: string;
    conflictType: PowerConflict['conflictType'];
    description: string;
    severity: PowerConflict['severity'];
    effects: string[];
    triggerConditions: string[];
    resolutionMethod?: string;
    notes?: string;
  }): PowerConflict | undefined {
    const powerA = this.powers.get(data.powerAId);
    const powerB = this.powers.get(data.powerBId);

    if (!powerA || !powerB) return undefined;

    const id = uuidv4();
    const now = new Date();

    const conflict: PowerConflict = {
      id,
      powerAId: data.powerAId,
      powerBId: data.powerBId,
      conflictType: data.conflictType,
      description: data.description,
      severity: data.severity,
      effects: data.effects,
      triggerConditions: data.triggerConditions,
      resolutionMethod: data.resolutionMethod,
      resolved: false,
      occurrenceChapters: [],
      notes: data.notes ?? '',
      createdAt: now
    };

    this.conflicts.set(id, conflict);

    // Update power references
    if (!powerA.conflictIds.includes(data.powerBId)) {
      powerA.conflictIds.push(data.powerBId);
      powerA.updatedAt = now;
    }
    if (!powerB.conflictIds.includes(data.powerAId)) {
      powerB.conflictIds.push(data.powerAId);
      powerB.updatedAt = now;
    }

    return conflict;
  }

  /**
   * Get conflict by ID
   */
  getConflict(id: string): PowerConflict | undefined {
    return this.conflicts.get(id);
  }

  /**
   * Get all conflicts
   */
  getAllConflicts(): PowerConflict[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * Get conflicts for a power
   */
  getConflictsForPower(powerId: string): PowerConflict[] {
    return Array.from(this.conflicts.values())
      .filter(c => c.powerAId === powerId || c.powerBId === powerId);
  }

  /**
   * Resolve a conflict
   */
  resolveConflict(conflictId: string, resolvingPerkId?: string): boolean {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return false;

    conflict.resolved = true;
    conflict.resolvedByPerkId = resolvingPerkId;

    // Update power references
    const powerA = this.powers.get(conflict.powerAId);
    const powerB = this.powers.get(conflict.powerBId);

    if (powerA) {
      powerA.conflictIds = powerA.conflictIds.filter(id => id !== conflict.powerBId);
      powerA.updatedAt = new Date();
    }
    if (powerB) {
      powerB.conflictIds = powerB.conflictIds.filter(id => id !== conflict.powerAId);
      powerB.updatedAt = new Date();
    }

    return true;
  }

  /**
   * Record conflict occurrence
   */
  recordConflictOccurrence(conflictId: string, chapter: number): void {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return;

    conflict.occurrenceChapters.push(chapter);
  }

  // ==========================================================================
  // POWER COMBINATION ANALYSIS
  // ==========================================================================

  /**
   * Analyze potential combination of powers
   */
  analyzeCombination(powerIds: string[]): CombinationResult {
    const powers = powerIds
      .map(id => this.powers.get(id))
      .filter((p): p is Power => p !== undefined);

    if (powers.length !== powerIds.length) {
      return {
        powerIds,
        success: false,
        resultType: InteractionType.UNKNOWN,
        description: 'One or more powers not found',
        warnings: ['Invalid power IDs provided']
      };
    }

    // Check for conflicts
    const warnings: string[] = [];
    for (let i = 0; i < powers.length; i++) {
      for (let j = i + 1; j < powers.length; j++) {
        if (powers[i].conflictIds.includes(powers[j].id)) {
          warnings.push(
            `Conflict detected between "${powers[i].name}" and "${powers[j].name}"`
          );
        }
      }
    }

    // Check for existing synergy
    const existingSynergy = Array.from(this.synergies.values())
      .find(s =>
        s.powerIds.length === powerIds.length &&
        s.powerIds.every(id => powerIds.includes(id))
      );

    if (existingSynergy) {
      return {
        powerIds,
        success: true,
        resultType: existingSynergy.interactionType,
        description: existingSynergy.combinedEffect,
        newEffects: [existingSynergy.combinedEffect],
        warnings
      };
    }

    // Analyze based on sources and contexts
    const sources = new Set(powers.map(p => p.powerSource));
    const contexts = new Set(powers.flatMap(p => p.contexts));

    // Check patterns
    for (const pattern of COMMON_SYNERGY_PATTERNS) {
      const matchesSources = pattern.sources.every(s => sources.has(s));
      const matchesContexts = pattern.contexts.some(c => contexts.has(c));

      if (matchesSources && matchesContexts) {
        return {
          powerIds,
          success: true,
          resultType: pattern.interactionType,
          description: pattern.description,
          newEffects: [pattern.description],
          warnings,
          suggestedSynergies: [
            `Create synergy: ${powers.map(p => p.name).join(' + ')}`
          ]
        };
      }
    }

    // Default analysis
    const hasStackable = powers.some(p =>
      p.effects.some(e => e.stackable)
    );

    return {
      powerIds,
      success: true,
      resultType: hasStackable ? InteractionType.STACK : InteractionType.CONDITIONAL,
      description: `Combination of ${powers.length} powers - effects may vary`,
      warnings,
      suggestedSynergies: warnings.length === 0
        ? [`Potential ${hasStackable ? 'stacking' : 'conditional'} synergy`]
        : undefined
    };
  }

  // ==========================================================================
  // SCALING CALCULATIONS
  // ==========================================================================

  /**
   * Calculate current power scaling
   */
  calculateScaling(powerId: string): ScalingCalculation | undefined {
    const power = this.powers.get(powerId);
    if (!power) return undefined;

    const multipliers: ScalingCalculation['multipliers'] = [];
    let totalMultiplier = 1;

    // Add scaling factors
    for (const factor of power.scalingFactors) {
      multipliers.push({
        source: factor.factor,
        factor: factor.currentMultiplier,
        description: factor.description
      });
      totalMultiplier *= factor.currentMultiplier;
    }

    // Add enhancement from other powers
    for (const enhancerId of power.enhancedByIds) {
      const enhancer = this.powers.get(enhancerId);
      if (enhancer) {
        // Assume 20% boost per enhancing power
        multipliers.push({
          source: enhancer.name,
          factor: 1.2,
          description: `Enhanced by ${enhancer.name}`
        });
        totalMultiplier *= 1.2;
      }
    }

    // Add synergy bonuses
    const synergies = this.getSynergiesForPower(powerId);
    for (const synergy of synergies) {
      // Assume 10% boost per active synergy
      multipliers.push({
        source: synergy.name,
        factor: 1.1,
        description: `Synergy: ${synergy.name}`
      });
      totalMultiplier *= 1.1;
    }

    // Calculate effective tier
    const tierBoost = Math.log2(totalMultiplier);
    const effectiveTier = Math.min(
      PowerTier.OMNIVERSAL,
      power.tier + Math.floor(tierBoost)
    ) as PowerTier;

    // Numerical power representation
    const basePower = Math.pow(10, power.tier);
    const effectivePower = basePower * totalMultiplier;

    return {
      powerId,
      baseTier: power.tier,
      currentTier: effectiveTier,
      multipliers,
      totalMultiplier,
      effectivePower
    };
  }

  /**
   * Calculate total power level across all abilities
   */
  calculateTotalPowerLevel(): {
    highestTier: PowerTier;
    effectiveHighestTier: PowerTier;
    totalPowers: number;
    byTier: Record<number, number>;
    bySource: Record<string, number>;
    topPowers: Array<{ name: string; tier: PowerTier; scaling: number }>;
  } {
    const powers = Array.from(this.powers.values());

    let highestTier = PowerTier.MUNDANE;
    let effectiveHighestTier = PowerTier.MUNDANE;
    const byTier: Record<number, number> = {};
    const bySource: Record<string, number> = {};
    const scaledPowers: Array<{ name: string; tier: PowerTier; scaling: number }> = [];

    for (const power of powers) {
      highestTier = Math.max(highestTier, power.tier) as PowerTier;

      byTier[power.tier] = (byTier[power.tier] ?? 0) + 1;
      bySource[power.powerSource] = (bySource[power.powerSource] ?? 0) + 1;

      const scaling = this.calculateScaling(power.id);
      if (scaling) {
        effectiveHighestTier = Math.max(
          effectiveHighestTier,
          scaling.currentTier
        ) as PowerTier;

        scaledPowers.push({
          name: power.name,
          tier: scaling.currentTier,
          scaling: scaling.totalMultiplier
        });
      }
    }

    // Sort by tier and scaling
    const topPowers = scaledPowers
      .sort((a, b) => {
        if (a.tier !== b.tier) return b.tier - a.tier;
        return b.scaling - a.scaling;
      })
      .slice(0, 10);

    return {
      highestTier,
      effectiveHighestTier,
      totalPowers: powers.length,
      byTier,
      bySource,
      topPowers
    };
  }

  // ==========================================================================
  // QUERIES
  // ==========================================================================

  /**
   * Get powers by source
   */
  getPowersBySource(source: PowerSource): Power[] {
    const ids = this.powersBySource.get(source);
    if (!ids) return [];
    return Array.from(ids).map(id => this.powers.get(id)!).filter(Boolean);
  }

  /**
   * Get powers by tier
   */
  getPowersByTier(tier: PowerTier): Power[] {
    const ids = this.powersByTier.get(tier);
    if (!ids) return [];
    return Array.from(ids).map(id => this.powers.get(id)!).filter(Boolean);
  }

  /**
   * Get powers by jump
   */
  getPowersByJump(jumpId: string): Power[] {
    const ids = this.powersByJump.get(jumpId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.powers.get(id)!).filter(Boolean);
  }

  /**
   * Get powers by context
   */
  getPowersByContext(context: PowerContext): Power[] {
    const ids = this.powersByContext.get(context);
    if (!ids) return [];
    return Array.from(ids).map(id => this.powers.get(id)!).filter(Boolean);
  }

  /**
   * Search powers by tag
   */
  searchPowersByTag(tag: string): Power[] {
    return Array.from(this.powers.values())
      .filter(p => p.tags.includes(tag));
  }

  /**
   * Get unresolved conflicts
   */
  getUnresolvedConflicts(): PowerConflict[] {
    return Array.from(this.conflicts.values())
      .filter(c => !c.resolved);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    totalPowers: number;
    totalSynergies: number;
    totalConflicts: number;
    unresolvedConflicts: number;
    powerLevel: ReturnType<PowerSynergyEngine['calculateTotalPowerLevel']>;
    bySource: Record<string, number>;
    byContext: Record<string, number>;
    mostUsedPowers: Array<{ name: string; uses: number }>;
    mostUsedSynergies: Array<{ name: string; uses: number }>;
  } {
    const powers = Array.from(this.powers.values());
    const synergies = Array.from(this.synergies.values());

    const bySource: Record<string, number> = {};
    const byContext: Record<string, number> = {};

    for (const power of powers) {
      bySource[power.powerSource] = (bySource[power.powerSource] ?? 0) + 1;
      for (const context of power.contexts) {
        byContext[context] = (byContext[context] ?? 0) + 1;
      }
    }

    const mostUsedPowers = powers
      .map(p => ({ name: p.name, uses: p.notableUses.length }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 10);

    const mostUsedSynergies = synergies
      .map(s => ({ name: s.name, uses: s.usageCount }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 10);

    return {
      totalPowers: powers.length,
      totalSynergies: synergies.length,
      totalConflicts: this.conflicts.size,
      unresolvedConflicts: this.getUnresolvedConflicts().length,
      powerLevel: this.calculateTotalPowerLevel(),
      bySource,
      byContext,
      mostUsedPowers,
      mostUsedSynergies
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
      powers: Array.from(this.powers.values()),
      synergies: Array.from(this.synergies.values()),
      conflicts: Array.from(this.conflicts.values()),
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

    if (data.powers) {
      for (const power of data.powers) {
        power.createdAt = new Date(power.createdAt);
        power.updatedAt = new Date(power.updatedAt);
        this.storePower(power);
      }
    }

    if (data.synergies) {
      for (const synergy of data.synergies) {
        synergy.createdAt = new Date(synergy.createdAt);
        this.synergies.set(synergy.id, synergy);
      }
    }

    if (data.conflicts) {
      for (const conflict of data.conflicts) {
        conflict.createdAt = new Date(conflict.createdAt);
        this.conflicts.set(conflict.id, conflict);
      }
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.powers.clear();
    this.synergies.clear();
    this.conflicts.clear();
    this.powersBySource.clear();
    this.powersByTier.clear();
    this.powersByJump.clear();
    this.powersByContext.clear();
  }
}

// Default instance
export const powerSynergyEngine = new PowerSynergyEngine();

export default PowerSynergyEngine;
