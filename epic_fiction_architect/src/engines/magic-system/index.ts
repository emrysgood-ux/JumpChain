/**
 * MagicSystemDesigner - Power & Magic Rules Engine
 *
 * Comprehensive system for designing and tracking magic/power systems
 * in epic 300M+ word narratives across multiple fictional universes.
 *
 * Features:
 * - Multi-system power tracking (JumpChain universe hopping)
 * - Power acquisition, growth, and limitations
 * - Cross-system interactions and synergies
 * - Consistency validation for power usage
 * - Canon vs Original power interpretations
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Core Enums
// ============================================================================

export enum PowerOrigin {
  CANON = 'canon',                    // Exactly as in source material
  CANON_ENHANCED = 'canon_enhanced',  // Canon with reasonable extrapolation
  CANON_NERFED = 'canon_nerfed',      // Canon but deliberately limited
  ORIGINAL = 'original',              // Created for this story
  COMPOSITE = 'composite',            // Merged from multiple sources
  EVOLVED = 'evolved',                // Started canon, evolved beyond
}

export enum PowerCategory {
  MAGIC = 'magic',
  PSYCHIC = 'psychic',
  PHYSICAL = 'physical',
  TECHNOLOGICAL = 'technological',
  DIVINE = 'divine',
  COSMIC = 'cosmic',
  BIOLOGICAL = 'biological',
  DIMENSIONAL = 'dimensional',
  TEMPORAL = 'temporal',
  ELEMENTAL = 'elemental',
  SOUL = 'soul',
  HYBRID = 'hybrid',
}

export enum PowerTier {
  MUNDANE = 'mundane',           // Street level, normal human+
  ENHANCED = 'enhanced',         // Peak human, minor powers
  SUPERHUMAN = 'superhuman',     // Clearly supernatural
  CITY_LEVEL = 'city_level',     // Can affect a city
  COUNTRY_LEVEL = 'country_level',
  CONTINENTAL = 'continental',
  PLANETARY = 'planetary',
  STELLAR = 'stellar',
  GALACTIC = 'galactic',
  UNIVERSAL = 'universal',
  MULTIVERSAL = 'multiversal',
  OMNIVERSAL = 'omniversal',
}

export enum CostType {
  NONE = 'none',
  MANA = 'mana',
  STAMINA = 'stamina',
  HEALTH = 'health',
  LIFESPAN = 'lifespan',
  SANITY = 'sanity',
  MATERIAL = 'material',
  TIME = 'time',
  COOLDOWN = 'cooldown',
  EMOTIONAL = 'emotional',
  KARMA = 'karma',
  SOUL_FRAGMENT = 'soul_fragment',
  SACRIFICE = 'sacrifice',
}

export enum LimitationType {
  HARD_LIMIT = 'hard_limit',     // Cannot be exceeded ever
  SOFT_LIMIT = 'soft_limit',     // Can exceed with consequences
  SCALING = 'scaling',           // Grows with user
  CONDITIONAL = 'conditional',    // Depends on circumstances
  NARRATIVE = 'narrative',        // Plot-dependent
}

// ============================================================================
// Power System Definitions
// ============================================================================

export interface MagicSystem {
  systemId: string;
  systemName: string;

  // Source information
  sourceUniverse: string;
  canonSource?: string;
  origin: PowerOrigin;

  // Classification
  category: PowerCategory;
  tier: PowerTier;
  maxAchievableTier: PowerTier;

  // Core mechanics
  energySource: string;
  castingMethod: string[];
  learningRequirements: string[];

  // Resource system
  resourceName: string;
  resourceRegenerationRate: string;
  resourceMaximum: string;

  // Universal rules
  fundamentalRules: MagicRule[];
  limitations: PowerLimitation[];

  // Subschools/branches
  branches: MagicBranch[];

  // Interactions
  synergyWith: string[];    // Other system IDs
  conflictsWith: string[];  // Systems that interfere

  // Narrative notes
  narrativeStrengths: string[];
  narrativeWeaknesses: string[];
  plotHooks: string[];
}

export interface MagicRule {
  ruleId: string;
  ruleName: string;
  description: string;
  enforcement: 'absolute' | 'strong' | 'weak' | 'narrative';
  exceptions?: string[];
  consequences: string;
}

export interface PowerLimitation {
  limitationId: string;
  limitationName: string;
  type: LimitationType;
  description: string;

  // Quantification
  hardValue?: number;
  softValue?: number;
  scalingFormula?: string;
  condition?: string;

  // Consequences of exceeding
  exceededConsequence?: string;
}

export interface MagicBranch {
  branchId: string;
  branchName: string;
  parentSystemId: string;

  description: string;
  specialization: string;
  uniqueAbilities: string[];

  prerequisites: string[];
  incompatibleWith: string[];

  tier: PowerTier;
}

// ============================================================================
// Individual Powers
// ============================================================================

export interface Power {
  powerId: string;
  powerName: string;

  // Classification
  systemId: string;
  branchId?: string;
  category: PowerCategory;
  tier: PowerTier;
  origin: PowerOrigin;

  // Description
  description: string;
  effectType: string;
  visualDescription: string;

  // Mechanics
  activation: 'instant' | 'charge' | 'ritual' | 'passive' | 'sustained' | 'toggle';
  range: string;
  duration: string;
  areaOfEffect?: string;

  // Costs
  costs: PowerCost[];

  // Limitations
  limitations: PowerLimitation[];
  cooldown?: string;
  usesPerDay?: number;

  // Scaling
  canScale: boolean;
  scalingFactors?: string[];
  maxScaledTier?: PowerTier;
  evolutionPath?: string[];

  // Prerequisites
  prerequisites: string[];
  incompatibleWith: string[];

  // Variations
  variations?: PowerVariation[];

  // Narrative
  signatureMove: boolean;
  plotRelevance: 'minor' | 'moderate' | 'major' | 'critical';
}

export interface PowerCost {
  costType: CostType;
  amount: number | string;
  isPerSecond?: boolean;
  isPerUse?: boolean;
  canBeReduced?: boolean;
  reductionCondition?: string;
}

export interface PowerVariation {
  variationId: string;
  variationName: string;
  description: string;
  modifiedEffect: string;
  additionalCost?: PowerCost;
  additionalLimitation?: string;
}

// ============================================================================
// Character Power Tracking
// ============================================================================

export interface CharacterPowerSet {
  characterId: string;
  characterName: string;

  // Overall power level
  overallTier: PowerTier;
  peakTier: PowerTier;

  // Systems known
  knownSystems: CharacterSystemMastery[];

  // Individual powers
  powers: CharacterPowerInstance[];

  // Cross-system synergies
  discoveredSynergies: PowerSynergy[];

  // Limitations and restrictions
  personalLimitations: PowerLimitation[];
  activeRestrictions: TemporaryRestriction[];

  // Growth tracking
  powerGrowthHistory: PowerGrowthEvent[];

  // Resource pools
  resourcePools: ResourcePool[];
}

export interface CharacterSystemMastery {
  systemId: string;
  masteryLevel: 'novice' | 'apprentice' | 'journeyman' | 'expert' | 'master' | 'grandmaster' | 'legendary';
  masteryPercentage: number; // 0-100
  knownBranches: string[];
  specializations: string[];
  timeStudied: string;
  teacherLineage?: string[];

  // Progression
  currentProgress: number;
  nextMilestone: string;
  blockers?: string[];
}

export interface CharacterPowerInstance {
  instanceId: string;
  powerId: string;
  powerName: string;

  // Character-specific modifications
  personalizedName?: string;
  customization?: string;

  // Proficiency
  proficiency: number; // 0-100
  usageCount: number;
  lastUsed?: Date;

  // State
  isActive: boolean;
  isSealed: boolean;
  sealReason?: string;
  sealedUntil?: Date | string;

  // Evolution
  evolutionStage: number;
  evolutionPath?: string[];
  nextEvolution?: string;
}

export interface PowerSynergy {
  synergyId: string;
  name: string;

  involvedPowerIds: string[];
  involvedSystemIds: string[];

  synergyType: 'additive' | 'multiplicative' | 'transformative' | 'emergent';
  description: string;
  combinedEffect: string;

  discoveredInChapter: number;
  discoveryCircumstances: string;

  stabilityRating: number; // 0-100
  risks?: string[];
}

export interface TemporaryRestriction {
  restrictionId: string;
  restrictionName: string;
  reason: string;

  affectedPowers: string[];
  affectedSystems: string[];

  effect: 'disabled' | 'weakened' | 'unstable' | 'corrupted';
  weakenedPercentage?: number;

  startChapter: number;
  endChapter?: number;
  endCondition?: string;
}

export interface PowerGrowthEvent {
  eventId: string;
  chapterNumber: number;
  timestamp: Date;

  eventType: 'acquisition' | 'evolution' | 'breakthrough' | 'sealing' | 'loss' | 'recovery' | 'synergy';

  affectedPowerId?: string;
  affectedSystemId?: string;

  previousState: string;
  newState: string;

  cause: string;
  narrativeSignificance: 'minor' | 'moderate' | 'major' | 'pivotal';
}

export interface ResourcePool {
  poolId: string;
  resourceName: string;
  systemId: string;

  current: number;
  maximum: number;
  regenerationRate: number;
  regenerationUnit: 'second' | 'minute' | 'hour' | 'day' | 'rest' | 'meditation';

  modifiers: ResourceModifier[];
}

export interface ResourceModifier {
  modifierId: string;
  modifierName: string;
  source: string;
  effect: 'max_increase' | 'max_decrease' | 'regen_increase' | 'regen_decrease' | 'cost_reduction';
  value: number;
  isPercentage: boolean;
  duration?: string;
}

// ============================================================================
// Power Usage Validation
// ============================================================================

export interface PowerUsageRequest {
  characterId: string;
  powerId: string;
  targetDescription: string;
  intendedEffect: string;
  circumstances: string;
  chapterNumber: number;
}

export interface PowerUsageValidation {
  isValid: boolean;
  canProceed: boolean;

  validationChecks: {
    checkName: string;
    passed: boolean;
    message: string;
  }[];

  resourceCost: {
    resourceName: string;
    cost: number;
    available: number;
    sufficient: boolean;
  }[];

  limitationWarnings: string[];
  consistencyIssues: string[];
  suggestedAlternatives?: string[];
}

// ============================================================================
// Cross-System Interaction
// ============================================================================

export interface SystemInteraction {
  interactionId: string;

  systemAId: string;
  systemBId: string;

  interactionType: 'synergy' | 'conflict' | 'neutral' | 'unstable' | 'forbidden';

  description: string;
  mechanicalEffect: string;
  narrativeImplications: string;

  stabilityRequirements?: string[];
  dangerLevel: 'safe' | 'risky' | 'dangerous' | 'catastrophic';
}

// ============================================================================
// Main Engine
// ============================================================================

export class MagicSystemDesigner {
  private systems: Map<string, MagicSystem> = new Map();
  private powers: Map<string, Power> = new Map();
  private characterPowerSets: Map<string, CharacterPowerSet> = new Map();
  private systemInteractions: Map<string, SystemInteraction> = new Map();

  // Indexes
  private powersBySystem: Map<string, string[]> = new Map();
  private powersByCategory: Map<PowerCategory, string[]> = new Map();
  private powersByTier: Map<PowerTier, string[]> = new Map();
  private systemsByUniverse: Map<string, string[]> = new Map();

  // ============================================================================
  // Magic System Management
  // ============================================================================

  createMagicSystem(system: Omit<MagicSystem, 'systemId'>): MagicSystem {
    const systemId = uuidv4();
    const fullSystem: MagicSystem = { ...system, systemId };

    this.systems.set(systemId, fullSystem);

    // Update universe index
    if (!this.systemsByUniverse.has(system.sourceUniverse)) {
      this.systemsByUniverse.set(system.sourceUniverse, []);
    }
    this.systemsByUniverse.get(system.sourceUniverse)!.push(systemId);

    return fullSystem;
  }

  getMagicSystem(systemId: string): MagicSystem | undefined {
    return this.systems.get(systemId);
  }

  getSystemsByUniverse(universe: string): MagicSystem[] {
    const ids = this.systemsByUniverse.get(universe) || [];
    return ids
      .map(id => this.systems.get(id))
      .filter((s): s is MagicSystem => s !== undefined);
  }

  updateMagicSystem(systemId: string, updates: Partial<MagicSystem>): MagicSystem {
    const existing = this.systems.get(systemId);
    if (!existing) {
      throw new Error(`Magic system not found: ${systemId}`);
    }

    const updated = { ...existing, ...updates, systemId };
    this.systems.set(systemId, updated);
    return updated;
  }

  addRuleToSystem(systemId: string, rule: Omit<MagicRule, 'ruleId'>): MagicRule {
    const system = this.systems.get(systemId);
    if (!system) {
      throw new Error(`Magic system not found: ${systemId}`);
    }

    const fullRule: MagicRule = { ...rule, ruleId: uuidv4() };
    system.fundamentalRules.push(fullRule);
    return fullRule;
  }

  addBranchToSystem(systemId: string, branch: Omit<MagicBranch, 'branchId' | 'parentSystemId'>): MagicBranch {
    const system = this.systems.get(systemId);
    if (!system) {
      throw new Error(`Magic system not found: ${systemId}`);
    }

    const fullBranch: MagicBranch = {
      ...branch,
      branchId: uuidv4(),
      parentSystemId: systemId
    };
    system.branches.push(fullBranch);
    return fullBranch;
  }

  // ============================================================================
  // Power Management
  // ============================================================================

  createPower(power: Omit<Power, 'powerId'>): Power {
    const powerId = uuidv4();
    const fullPower: Power = { ...power, powerId };

    this.powers.set(powerId, fullPower);

    // Update indexes
    if (!this.powersBySystem.has(power.systemId)) {
      this.powersBySystem.set(power.systemId, []);
    }
    this.powersBySystem.get(power.systemId)!.push(powerId);

    if (!this.powersByCategory.has(power.category)) {
      this.powersByCategory.set(power.category, []);
    }
    this.powersByCategory.get(power.category)!.push(powerId);

    if (!this.powersByTier.has(power.tier)) {
      this.powersByTier.set(power.tier, []);
    }
    this.powersByTier.get(power.tier)!.push(powerId);

    return fullPower;
  }

  getPower(powerId: string): Power | undefined {
    return this.powers.get(powerId);
  }

  getPowersForSystem(systemId: string): Power[] {
    const ids = this.powersBySystem.get(systemId) || [];
    return ids
      .map(id => this.powers.get(id))
      .filter((p): p is Power => p !== undefined);
  }

  getPowersByCategory(category: PowerCategory): Power[] {
    const ids = this.powersByCategory.get(category) || [];
    return ids
      .map(id => this.powers.get(id))
      .filter((p): p is Power => p !== undefined);
  }

  getPowersByTier(tier: PowerTier): Power[] {
    const ids = this.powersByTier.get(tier) || [];
    return ids
      .map(id => this.powers.get(id))
      .filter((p): p is Power => p !== undefined);
  }

  addVariationToPower(powerId: string, variation: Omit<PowerVariation, 'variationId'>): PowerVariation {
    const power = this.powers.get(powerId);
    if (!power) {
      throw new Error(`Power not found: ${powerId}`);
    }

    const fullVariation: PowerVariation = { ...variation, variationId: uuidv4() };

    if (!power.variations) {
      power.variations = [];
    }
    power.variations.push(fullVariation);

    return fullVariation;
  }

  // ============================================================================
  // Character Power Set Management
  // ============================================================================

  createCharacterPowerSet(characterId: string, characterName: string): CharacterPowerSet {
    const powerSet: CharacterPowerSet = {
      characterId,
      characterName,
      overallTier: PowerTier.MUNDANE,
      peakTier: PowerTier.MUNDANE,
      knownSystems: [],
      powers: [],
      discoveredSynergies: [],
      personalLimitations: [],
      activeRestrictions: [],
      powerGrowthHistory: [],
      resourcePools: [],
    };

    this.characterPowerSets.set(characterId, powerSet);
    return powerSet;
  }

  getCharacterPowerSet(characterId: string): CharacterPowerSet | undefined {
    return this.characterPowerSets.get(characterId);
  }

  grantPowerToCharacter(
    characterId: string,
    powerId: string,
    chapterNumber: number,
    acquisitionCircumstances: string,
    initialProficiency: number = 10
  ): CharacterPowerInstance {
    const powerSet = this.characterPowerSets.get(characterId);
    if (!powerSet) {
      throw new Error(`Character power set not found: ${characterId}`);
    }

    const power = this.powers.get(powerId);
    if (!power) {
      throw new Error(`Power not found: ${powerId}`);
    }

    // Check if already has power
    if (powerSet.powers.some(p => p.powerId === powerId)) {
      throw new Error(`Character already has power: ${power.powerName}`);
    }

    const instance: CharacterPowerInstance = {
      instanceId: uuidv4(),
      powerId,
      powerName: power.powerName,
      proficiency: initialProficiency,
      usageCount: 0,
      isActive: true,
      isSealed: false,
      evolutionStage: 1,
    };

    powerSet.powers.push(instance);

    // Record growth event
    powerSet.powerGrowthHistory.push({
      eventId: uuidv4(),
      chapterNumber,
      timestamp: new Date(),
      eventType: 'acquisition',
      affectedPowerId: powerId,
      affectedSystemId: power.systemId,
      previousState: 'none',
      newState: `Acquired: ${power.powerName}`,
      cause: acquisitionCircumstances,
      narrativeSignificance: power.plotRelevance === 'critical' ? 'pivotal' :
        power.plotRelevance === 'major' ? 'major' : 'moderate',
    });

    // Ensure system mastery exists
    if (!powerSet.knownSystems.some(s => s.systemId === power.systemId)) {
      this.addSystemMastery(characterId, power.systemId, 'novice');
    }

    // Update tier calculations
    this.recalculateCharacterTier(characterId);

    // Add resource pool if needed
    const system = this.systems.get(power.systemId);
    if (system && !powerSet.resourcePools.some(p => p.systemId === power.systemId)) {
      powerSet.resourcePools.push({
        poolId: uuidv4(),
        resourceName: system.resourceName,
        systemId: power.systemId,
        current: 100,
        maximum: 100,
        regenerationRate: 1,
        regenerationUnit: 'minute',
        modifiers: [],
      });
    }

    return instance;
  }

  addSystemMastery(
    characterId: string,
    systemId: string,
    level: CharacterSystemMastery['masteryLevel']
  ): CharacterSystemMastery {
    const powerSet = this.characterPowerSets.get(characterId);
    if (!powerSet) {
      throw new Error(`Character power set not found: ${characterId}`);
    }

    const system = this.systems.get(systemId);
    if (!system) {
      throw new Error(`Magic system not found: ${systemId}`);
    }

    const masteryPercentages: Record<CharacterSystemMastery['masteryLevel'], number> = {
      'novice': 10,
      'apprentice': 25,
      'journeyman': 45,
      'expert': 65,
      'master': 85,
      'grandmaster': 95,
      'legendary': 100,
    };

    const mastery: CharacterSystemMastery = {
      systemId,
      masteryLevel: level,
      masteryPercentage: masteryPercentages[level],
      knownBranches: [],
      specializations: [],
      timeStudied: 'Recently acquired',
      currentProgress: 0,
      nextMilestone: this.getNextMilestone(level),
    };

    powerSet.knownSystems.push(mastery);
    return mastery;
  }

  private getNextMilestone(currentLevel: CharacterSystemMastery['masteryLevel']): string {
    const milestones: Record<CharacterSystemMastery['masteryLevel'], string> = {
      'novice': 'Learn basic techniques to reach Apprentice',
      'apprentice': 'Master fundamentals to reach Journeyman',
      'journeyman': 'Develop personal style to reach Expert',
      'expert': 'Achieve breakthrough insight to reach Master',
      'master': 'Transcend normal limits to reach Grandmaster',
      'grandmaster': 'Achieve legendary recognition',
      'legendary': 'Already at peak mastery',
    };
    return milestones[currentLevel];
  }

  improveProficiency(
    characterId: string,
    powerId: string,
    improvement: number,
    _cause: string
  ): void {
    const powerSet = this.characterPowerSets.get(characterId);
    if (!powerSet) {
      throw new Error(`Character power set not found: ${characterId}`);
    }

    const instance = powerSet.powers.find(p => p.powerId === powerId);
    if (!instance) {
      throw new Error(`Character does not have power: ${powerId}`);
    }

    const oldProficiency = instance.proficiency;
    instance.proficiency = Math.min(100, instance.proficiency + improvement);
    instance.usageCount++;
    instance.lastUsed = new Date();

    // Check for evolution threshold
    if (oldProficiency < 100 && instance.proficiency >= 100) {
      const power = this.powers.get(powerId);
      if (power?.canScale) {
        instance.evolutionStage++;
        if (power.evolutionPath) {
          instance.nextEvolution = power.evolutionPath[instance.evolutionStage - 1];
        }
      }
    }
  }

  sealPower(
    characterId: string,
    powerId: string,
    reason: string,
    untilCondition: string | Date,
    chapterNumber: number
  ): void {
    const powerSet = this.characterPowerSets.get(characterId);
    if (!powerSet) {
      throw new Error(`Character power set not found: ${characterId}`);
    }

    const instance = powerSet.powers.find(p => p.powerId === powerId);
    if (!instance) {
      throw new Error(`Character does not have power: ${powerId}`);
    }

    instance.isSealed = true;
    instance.sealReason = reason;
    instance.sealedUntil = untilCondition;

    powerSet.powerGrowthHistory.push({
      eventId: uuidv4(),
      chapterNumber,
      timestamp: new Date(),
      eventType: 'sealing',
      affectedPowerId: powerId,
      previousState: 'Active',
      newState: `Sealed: ${reason}`,
      cause: reason,
      narrativeSignificance: 'major',
    });
  }

  unsealPower(
    characterId: string,
    powerId: string,
    chapterNumber: number,
    circumstances: string
  ): void {
    const powerSet = this.characterPowerSets.get(characterId);
    if (!powerSet) {
      throw new Error(`Character power set not found: ${characterId}`);
    }

    const instance = powerSet.powers.find(p => p.powerId === powerId);
    if (!instance) {
      throw new Error(`Character does not have power: ${powerId}`);
    }

    instance.isSealed = false;
    instance.sealReason = undefined;
    instance.sealedUntil = undefined;

    powerSet.powerGrowthHistory.push({
      eventId: uuidv4(),
      chapterNumber,
      timestamp: new Date(),
      eventType: 'recovery',
      affectedPowerId: powerId,
      previousState: 'Sealed',
      newState: 'Unsealed and active',
      cause: circumstances,
      narrativeSignificance: 'major',
    });
  }

  // ============================================================================
  // Power Synergies
  // ============================================================================

  discoverSynergy(
    characterId: string,
    powerIds: string[],
    name: string,
    description: string,
    combinedEffect: string,
    synergyType: PowerSynergy['synergyType'],
    chapterNumber: number,
    discoveryCircumstances: string
  ): PowerSynergy {
    const powerSet = this.characterPowerSets.get(characterId);
    if (!powerSet) {
      throw new Error(`Character power set not found: ${characterId}`);
    }

    // Validate character has all powers
    for (const powerId of powerIds) {
      if (!powerSet.powers.some(p => p.powerId === powerId)) {
        throw new Error(`Character doesn't have required power: ${powerId}`);
      }
    }

    // Get involved systems
    const systemIds = new Set<string>();
    for (const powerId of powerIds) {
      const power = this.powers.get(powerId);
      if (power) {
        systemIds.add(power.systemId);
      }
    }

    const synergy: PowerSynergy = {
      synergyId: uuidv4(),
      name,
      involvedPowerIds: powerIds,
      involvedSystemIds: Array.from(systemIds),
      synergyType,
      description,
      combinedEffect,
      discoveredInChapter: chapterNumber,
      discoveryCircumstances,
      stabilityRating: 50, // Start at 50%, improves with use
    };

    powerSet.discoveredSynergies.push(synergy);

    powerSet.powerGrowthHistory.push({
      eventId: uuidv4(),
      chapterNumber,
      timestamp: new Date(),
      eventType: 'synergy',
      previousState: 'Unknown combination',
      newState: `Discovered synergy: ${name}`,
      cause: discoveryCircumstances,
      narrativeSignificance: synergyType === 'emergent' ? 'pivotal' : 'major',
    });

    return synergy;
  }

  // ============================================================================
  // System Interactions
  // ============================================================================

  defineSystemInteraction(
    systemAId: string,
    systemBId: string,
    interactionType: SystemInteraction['interactionType'],
    description: string,
    mechanicalEffect: string,
    narrativeImplications: string
  ): SystemInteraction {
    const interaction: SystemInteraction = {
      interactionId: uuidv4(),
      systemAId,
      systemBId,
      interactionType,
      description,
      mechanicalEffect,
      narrativeImplications,
      dangerLevel: interactionType === 'conflict' ? 'dangerous' :
        interactionType === 'unstable' ? 'risky' :
        interactionType === 'forbidden' ? 'catastrophic' : 'safe',
    };

    this.systemInteractions.set(interaction.interactionId, interaction);
    return interaction;
  }

  getSystemInteraction(systemAId: string, systemBId: string): SystemInteraction | undefined {
    for (const interaction of this.systemInteractions.values()) {
      if ((interaction.systemAId === systemAId && interaction.systemBId === systemBId) ||
          (interaction.systemAId === systemBId && interaction.systemBId === systemAId)) {
        return interaction;
      }
    }
    return undefined;
  }

  // ============================================================================
  // Tier Calculation
  // ============================================================================

  private recalculateCharacterTier(characterId: string): void {
    const powerSet = this.characterPowerSets.get(characterId);
    if (!powerSet) return;

    const tierOrder: PowerTier[] = [
      PowerTier.MUNDANE, PowerTier.ENHANCED, PowerTier.SUPERHUMAN,
      PowerTier.CITY_LEVEL, PowerTier.COUNTRY_LEVEL, PowerTier.CONTINENTAL,
      PowerTier.PLANETARY, PowerTier.STELLAR, PowerTier.GALACTIC,
      PowerTier.UNIVERSAL, PowerTier.MULTIVERSAL, PowerTier.OMNIVERSAL
    ];

    let maxTier = PowerTier.MUNDANE;
    let peakTier = PowerTier.MUNDANE;

    for (const instance of powerSet.powers) {
      const power = this.powers.get(instance.powerId);
      if (!power) continue;

      const tierIndex = tierOrder.indexOf(power.tier);
      const currentMaxIndex = tierOrder.indexOf(maxTier);
      const currentPeakIndex = tierOrder.indexOf(peakTier);

      // Active usable tier
      if (!instance.isSealed && tierIndex > currentMaxIndex) {
        maxTier = power.tier;
      }

      // Peak (including sealed)
      if (tierIndex > currentPeakIndex) {
        peakTier = power.tier;
      }

      // Check scaled tier
      if (power.maxScaledTier && instance.proficiency >= 100) {
        const scaledIndex = tierOrder.indexOf(power.maxScaledTier);
        if (!instance.isSealed && scaledIndex > tierOrder.indexOf(maxTier)) {
          maxTier = power.maxScaledTier;
        }
        if (scaledIndex > tierOrder.indexOf(peakTier)) {
          peakTier = power.maxScaledTier;
        }
      }
    }

    powerSet.overallTier = maxTier;
    powerSet.peakTier = peakTier;
  }

  // ============================================================================
  // Power Usage Validation
  // ============================================================================

  validatePowerUsage(request: PowerUsageRequest): PowerUsageValidation {
    const validation: PowerUsageValidation = {
      isValid: true,
      canProceed: true,
      validationChecks: [],
      resourceCost: [],
      limitationWarnings: [],
      consistencyIssues: [],
    };

    const powerSet = this.characterPowerSets.get(request.characterId);
    if (!powerSet) {
      validation.isValid = false;
      validation.canProceed = false;
      validation.validationChecks.push({
        checkName: 'Character Exists',
        passed: false,
        message: 'Character power set not found'
      });
      return validation;
    }

    const powerInstance = powerSet.powers.find(p => p.powerId === request.powerId);
    if (!powerInstance) {
      validation.isValid = false;
      validation.canProceed = false;
      validation.validationChecks.push({
        checkName: 'Power Owned',
        passed: false,
        message: 'Character does not have this power'
      });
      return validation;
    }

    const power = this.powers.get(request.powerId);
    if (!power) {
      validation.isValid = false;
      validation.canProceed = false;
      validation.validationChecks.push({
        checkName: 'Power Exists',
        passed: false,
        message: 'Power definition not found'
      });
      return validation;
    }

    // Check if sealed
    if (powerInstance.isSealed) {
      validation.isValid = false;
      validation.canProceed = false;
      validation.validationChecks.push({
        checkName: 'Power Sealed',
        passed: false,
        message: `Power is sealed: ${powerInstance.sealReason}`
      });
      return validation;
    }

    // Check if active
    validation.validationChecks.push({
      checkName: 'Power Active',
      passed: powerInstance.isActive,
      message: powerInstance.isActive ? 'Power is active' : 'Power is currently inactive'
    });

    // Check resource costs
    const system = this.systems.get(power.systemId);
    const resourcePool = powerSet.resourcePools.find(p => p.systemId === power.systemId);

    for (const cost of power.costs) {
      if (cost.costType === CostType.MANA || cost.costType === CostType.STAMINA) {
        if (resourcePool) {
          const costAmount = typeof cost.amount === 'number' ? cost.amount : 50;
          const sufficient = resourcePool.current >= costAmount;

          validation.resourceCost.push({
            resourceName: system?.resourceName || cost.costType,
            cost: costAmount,
            available: resourcePool.current,
            sufficient
          });

          if (!sufficient) {
            validation.isValid = false;
            validation.limitationWarnings.push(
              `Insufficient ${system?.resourceName || cost.costType}: need ${costAmount}, have ${resourcePool.current}`
            );
          }
        }
      }
    }

    // Check power limitations
    for (const limitation of power.limitations) {
      if (limitation.type === LimitationType.HARD_LIMIT) {
        validation.limitationWarnings.push(
          `Hard Limit: ${limitation.limitationName} - ${limitation.description}`
        );
      }
    }

    // Check system rules
    if (system) {
      for (const rule of system.fundamentalRules) {
        if (rule.enforcement === 'absolute') {
          validation.validationChecks.push({
            checkName: `Rule: ${rule.ruleName}`,
            passed: true, // Would need context analysis
            message: rule.description
          });
        }
      }
    }

    // Check active restrictions
    for (const restriction of powerSet.activeRestrictions) {
      if (restriction.affectedPowers.includes(request.powerId) ||
          restriction.affectedSystems.includes(power.systemId)) {
        validation.limitationWarnings.push(
          `Active Restriction: ${restriction.restrictionName} - ${restriction.reason}`
        );

        if (restriction.effect === 'disabled') {
          validation.isValid = false;
          validation.canProceed = false;
        }
      }
    }

    // Overall validity
    validation.canProceed = validation.isValid &&
      validation.resourceCost.every(r => r.sufficient);

    return validation;
  }

  // ============================================================================
  // Template Power Systems (Common Fiction Sources)
  // ============================================================================

  createTemplatePowerSystem(template: 'naruto_chakra' | 'harry_potter' | 'warhammer_40k' | 'dnd_magic' | 'cultivation'): MagicSystem {
    switch (template) {
      case 'naruto_chakra':
        return this.createMagicSystem({
          systemName: 'Chakra System',
          sourceUniverse: 'Naruto',
          canonSource: 'Naruto/Boruto manga and anime',
          origin: PowerOrigin.CANON,
          category: PowerCategory.HYBRID,
          tier: PowerTier.CITY_LEVEL,
          maxAchievableTier: PowerTier.CONTINENTAL,
          energySource: 'Chakra (spiritual + physical energy)',
          castingMethod: ['Hand Seals', 'Nature Transformation', 'Shape Transformation'],
          learningRequirements: ['Chakra Control Training', 'Physical Conditioning', 'Mental Focus'],
          resourceName: 'Chakra',
          resourceRegenerationRate: 'Slow natural, fast with rest',
          resourceMaximum: 'Scales with training and lineage',
          fundamentalRules: [
            {
              ruleId: uuidv4(),
              ruleName: 'Chakra Exhaustion',
              description: 'Using too much chakra causes unconsciousness or death',
              enforcement: 'absolute',
              consequences: 'Collapse, coma, or death'
            },
            {
              ruleId: uuidv4(),
              ruleName: 'Hand Seal Requirement',
              description: 'Most jutsu require specific hand seals',
              enforcement: 'strong',
              exceptions: ['Mastered techniques', 'Bloodline abilities'],
              consequences: 'Technique fails or is weakened'
            }
          ],
          limitations: [
            {
              limitationId: uuidv4(),
              limitationName: 'Chakra Pool',
              type: LimitationType.SCALING,
              description: 'Total chakra available scales with training',
              scalingFormula: 'Base × (1 + (training_years × 0.2))'
            }
          ],
          branches: [
            {
              branchId: uuidv4(),
              branchName: 'Ninjutsu',
              parentSystemId: '', // Will be set
              description: 'External chakra techniques',
              specialization: 'Offensive and utility techniques',
              uniqueAbilities: ['Elemental Transformation', 'Clone Techniques', 'Summoning'],
              prerequisites: ['Basic chakra control'],
              incompatibleWith: [],
              tier: PowerTier.CITY_LEVEL
            }
          ],
          synergyWith: [],
          conflictsWith: [],
          narrativeStrengths: ['Visual spectacle', 'Clear power scaling', 'Team dynamics'],
          narrativeWeaknesses: ['Power creep', 'Complex explanation needed'],
          plotHooks: ['Forbidden techniques', 'Bloodline revelations', 'Teacher-student bonds']
        });

      case 'harry_potter':
        return this.createMagicSystem({
          systemName: 'Wizarding Magic',
          sourceUniverse: 'Harry Potter',
          canonSource: 'Harry Potter book series',
          origin: PowerOrigin.CANON,
          category: PowerCategory.MAGIC,
          tier: PowerTier.ENHANCED,
          maxAchievableTier: PowerTier.CITY_LEVEL,
          energySource: 'Magical Core (innate)',
          castingMethod: ['Wand Movement', 'Incantation', 'Intent'],
          learningRequirements: ['Magical lineage or muggle-born', 'Wand compatibility', 'Education'],
          resourceName: 'Magical Stamina',
          resourceRegenerationRate: 'Natural rest',
          resourceMaximum: 'Based on magical core strength',
          fundamentalRules: [
            {
              ruleId: uuidv4(),
              ruleName: 'Gamp\'s Law of Elemental Transfiguration',
              description: 'Cannot create food, money, love, life, or information from nothing',
              enforcement: 'absolute',
              consequences: 'Spell fails completely'
            },
            {
              ruleId: uuidv4(),
              ruleName: 'Wand Requirement',
              description: 'Most magic requires a wand for focusing',
              enforcement: 'strong',
              exceptions: ['Accidental magic', 'House-elf magic', 'Some powerful wizards'],
              consequences: 'Unfocused, weak magic'
            }
          ],
          limitations: [],
          branches: [
            {
              branchId: uuidv4(),
              branchName: 'Transfiguration',
              parentSystemId: '',
              description: 'Changing form of objects and creatures',
              specialization: 'Transformation magic',
              uniqueAbilities: ['Animagus', 'Conjuration', 'Vanishment'],
              prerequisites: ['Basic magical education'],
              incompatibleWith: [],
              tier: PowerTier.SUPERHUMAN
            }
          ],
          synergyWith: [],
          conflictsWith: [],
          narrativeStrengths: ['Accessible worldbuilding', 'School setting', 'Mystery elements'],
          narrativeWeaknesses: ['Power ceiling issues', 'Inconsistent magic rules'],
          plotHooks: ['Unforgivable curses', 'Horcruxes', 'Prophecies']
        });

      case 'cultivation':
        return this.createMagicSystem({
          systemName: 'Cultivation (Xianxia)',
          sourceUniverse: 'Chinese Fantasy',
          canonSource: 'Various xianxia/xuanhuan novels',
          origin: PowerOrigin.COMPOSITE,
          category: PowerCategory.COSMIC,
          tier: PowerTier.SUPERHUMAN,
          maxAchievableTier: PowerTier.MULTIVERSAL,
          energySource: 'Qi / Spiritual Energy',
          castingMethod: ['Meditation', 'Martial Techniques', 'Artifact Activation'],
          learningRequirements: ['Spiritual Root', 'Cultivation Manual', 'Resources', 'Time'],
          resourceName: 'Qi',
          resourceRegenerationRate: 'Constant absorption from environment',
          resourceMaximum: 'Determined by realm/stage',
          fundamentalRules: [
            {
              ruleId: uuidv4(),
              ruleName: 'Realm Suppression',
              description: 'Higher realm cultivators suppress lower realms',
              enforcement: 'strong',
              exceptions: ['Heaven-defying talents', 'Special treasures'],
              consequences: 'Lower realm cannot defeat higher'
            },
            {
              ruleId: uuidv4(),
              ruleName: 'Tribulation Requirement',
              description: 'Must pass heavenly tribulation to advance major realms',
              enforcement: 'absolute',
              consequences: 'Death or regression if failed'
            }
          ],
          limitations: [
            {
              limitationId: uuidv4(),
              limitationName: 'Lifespan by Realm',
              type: LimitationType.HARD_LIMIT,
              description: 'Each realm has maximum lifespan',
              exceededConsequence: 'Death from old age'
            }
          ],
          branches: [],
          synergyWith: [],
          conflictsWith: [],
          narrativeStrengths: ['Clear progression', 'Power fantasy', 'Long-term story potential'],
          narrativeWeaknesses: ['Power creep', 'Can become formulaic'],
          plotHooks: ['Inheritance', 'Sect politics', 'Dao comprehension', 'Tribulations']
        });

      default:
        throw new Error(`Unknown template: ${template}`);
    }
  }

  // ============================================================================
  // Standard API Methods
  // ============================================================================

  getStats(): {
    systemCount: number;
    powerCount: number;
    characterPowerSetCount: number;
    interactionCount: number;
    universesCovered: string[];
    tierDistribution: Map<PowerTier, number>;
    categoryDistribution: Map<PowerCategory, number>;
  } {
    const tierDist = new Map<PowerTier, number>();
    const categoryDist = new Map<PowerCategory, number>();

    for (const power of this.powers.values()) {
      tierDist.set(power.tier, (tierDist.get(power.tier) || 0) + 1);
      categoryDist.set(power.category, (categoryDist.get(power.category) || 0) + 1);
    }

    return {
      systemCount: this.systems.size,
      powerCount: this.powers.size,
      characterPowerSetCount: this.characterPowerSets.size,
      interactionCount: this.systemInteractions.size,
      universesCovered: Array.from(this.systemsByUniverse.keys()),
      tierDistribution: tierDist,
      categoryDistribution: categoryDist,
    };
  }

  clear(): void {
    this.systems.clear();
    this.powers.clear();
    this.characterPowerSets.clear();
    this.systemInteractions.clear();
    this.powersBySystem.clear();
    this.powersByCategory.clear();
    this.powersByTier.clear();
    this.systemsByUniverse.clear();
  }

  exportToJSON(): string {
    return JSON.stringify({
      systems: Array.from(this.systems.entries()),
      powers: Array.from(this.powers.entries()),
      characterPowerSets: Array.from(this.characterPowerSets.entries()),
      systemInteractions: Array.from(this.systemInteractions.entries()),
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.clear();

    this.systems = new Map(data.systems);
    this.powers = new Map(data.powers);
    this.characterPowerSets = new Map(data.characterPowerSets);
    this.systemInteractions = new Map(data.systemInteractions);

    // Rebuild indexes
    for (const [powerId, power] of this.powers) {
      if (!this.powersBySystem.has(power.systemId)) {
        this.powersBySystem.set(power.systemId, []);
      }
      this.powersBySystem.get(power.systemId)!.push(powerId);

      if (!this.powersByCategory.has(power.category)) {
        this.powersByCategory.set(power.category, []);
      }
      this.powersByCategory.get(power.category)!.push(powerId);

      if (!this.powersByTier.has(power.tier)) {
        this.powersByTier.set(power.tier, []);
      }
      this.powersByTier.get(power.tier)!.push(powerId);
    }

    for (const [systemId, system] of this.systems) {
      if (!this.systemsByUniverse.has(system.sourceUniverse)) {
        this.systemsByUniverse.set(system.sourceUniverse, []);
      }
      this.systemsByUniverse.get(system.sourceUniverse)!.push(systemId);
    }
  }
}

// ============================================================================
// Export
// ============================================================================

export default MagicSystemDesigner;
