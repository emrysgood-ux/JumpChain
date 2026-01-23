/**
 * Universal Adapter - Power Translation Between Universes
 *
 * In Jumpchain, characters accumulate powers from wildly different settings.
 * What happens when a D&D wizard tries to cast spells in a sci-fi setting?
 * How does Ki work in a world without spiritual energy? This system handles:
 * - Power translation rules between different metaphysical systems
 * - Compatibility checking (can this power work here?)
 * - Fiat-backing (purchased powers guaranteed to work)
 * - Universe-specific scaling and adaptation
 * - Cross-universe power conflicts and harmonization
 *
 * Powers don't just work everywhere - they need to adapt.
 */

import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Universe metaphysics types
 */
export enum MetaphysicsType {
  // Energy Systems
  MAGIC_AMBIENT = 'magic_ambient',       // HP, Generic Fantasy
  MAGIC_INTERNAL = 'magic_internal',     // Naruto chakra, Ki
  MAGIC_RITUAL = 'magic_ritual',         // Lovecraft, ceremonial magic
  MAGIC_DIVINE = 'magic_divine',         // D&D clerics, divine intervention
  MAGIC_NONE = 'magic_none',             // Hard sci-fi, realistic

  // Science Systems
  TECH_REALISTIC = 'tech_realistic',     // Real-world physics
  TECH_SOFT = 'tech_soft',               // Star Wars, soft sci-fi
  TECH_HARD = 'tech_hard',               // The Expanse
  TECH_SUPERSCIENCE = 'tech_superscience', // Marvel/DC tech
  TECH_MAGITECH = 'tech_magitech',       // Final Fantasy

  // Special Systems
  SPIRITUAL = 'spiritual',               // Bleach, Shinto
  PSYCHIC = 'psychic',                   // Warhammer 40k, psionics
  COSMIC = 'cosmic',                     // DC/Marvel cosmic powers
  CONCEPTUAL = 'conceptual',             // Higher-dimensional, Suggsverse
  NARRATIVE = 'narrative',               // Meta, fourth-wall

  // Physics Models
  PHYSICS_REALISTIC = 'physics_realistic',
  PHYSICS_ENHANCED = 'physics_enhanced', // Peak human = superhuman
  PHYSICS_CINEMATIC = 'physics_cinematic', // Action movie physics
  PHYSICS_ANIME = 'physics_anime',       // Rule of cool
  PHYSICS_TOON = 'physics_toon',         // Looney Tunes

  // Hybrid
  HYBRID = 'hybrid',
  UNKNOWN = 'unknown'
}

/**
 * Power adaptation results
 */
export enum AdaptationResult {
  WORKS_PERFECTLY = 'works_perfectly',   // Full functionality
  WORKS_MODIFIED = 'works_modified',     // Works but changed
  WORKS_WEAKENED = 'works_weakened',     // Reduced effectiveness
  WORKS_ENHANCED = 'works_enhanced',     // Boosted in this setting
  WORKS_DIFFERENTLY = 'works_differently', // Same power, different mechanics
  REQUIRES_EFFORT = 'requires_effort',   // Needs adjustment period
  BARELY_WORKS = 'barely_works',         // Minimal functionality
  DOES_NOT_WORK = 'does_not_work',       // Incompatible
  DANGEROUS = 'dangerous',               // Works but risky
  FORBIDDEN = 'forbidden'                // Universe actively rejects it
}

/**
 * Fiat backing levels
 */
export enum FiatLevel {
  NONE = 'none',                 // Freebies, in-universe powers
  PARTIAL = 'partial',           // Some protection
  STANDARD = 'standard',         // Normal purchased perks
  STRONG = 'strong',             // Expensive purchases
  ABSOLUTE = 'absolute',         // Chain-level protection
  PLOT_ARMOR = 'plot_armor'      // Cannot be negated period
}

/**
 * Translation complexity
 */
export enum TranslationComplexity {
  SIMPLE = 'simple',             // Direct translation
  MODERATE = 'moderate',         // Some adaptation needed
  COMPLEX = 'complex',           // Significant changes
  EXTREME = 'extreme',           // Major restructuring
  IMPOSSIBLE = 'impossible'      // Cannot be translated
}

/**
 * Universe resistance to foreign powers
 */
export enum UniverseResistance {
  WELCOMING = 'welcoming',       // Powers work better
  NEUTRAL = 'neutral',           // Normal translation
  RESISTANT = 'resistant',       // Active opposition
  HOSTILE = 'hostile',           // Actively fights powers
  SEALED = 'sealed'              // No outside powers work
}

/**
 * Universe reality type - how the universe relates to real world
 */
export enum UniverseRealityType {
  // Pure fiction - no real-world connection
  PURE_FICTION = 'pure_fiction',

  // Based on reality
  ALTERNATE_HISTORY = 'alternate_history',      // History diverged at a point
  ALTERNATE_EARTH = 'alternate_earth',          // Different version of Earth

  // Hidden/parallel to reality
  URBAN_FANTASY = 'urban_fantasy',              // Magic hidden in real world
  PARALLEL_WORLD = 'parallel_world',            // Exists alongside reality
  MASQUERADE = 'masquerade',                    // Supernatural hidden from mundanes

  // Mixed reality
  AMALGAM = 'amalgam',                          // Real + fictional blended
  FICTIONALIZED_REAL = 'fictionalized_real',    // Real places made fictional

  // Multiple sources
  CROSSOVER = 'crossover',                      // Multiple fictions merged
  COMPOSITE = 'composite'                        // Elements from multiple sources
}

/**
 * Real-world location binding type
 */
export enum RealWorldBindingType {
  NONE = 'none',                    // No real-world connection
  INSPIRED = 'inspired',            // Loosely inspired by real place
  BASED_ON = 'based_on',            // Clearly based on real place
  EXACT_OVERLAY = 'exact_overlay',  // Fiction laid over exact real location
  RENAMED = 'renamed',              // Real place with fictional name
  HIDDEN_WITHIN = 'hidden_within'   // Fictional place hidden in real location
}

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Universe metaphysical profile
 */
export interface UniverseProfile {
  id: string;
  name: string;
  description: string;

  // Metaphysics
  primaryMetaphysics: MetaphysicsType[];
  secondaryMetaphysics: MetaphysicsType[];
  forbiddenMetaphysics: MetaphysicsType[];

  // Resistance
  foreignPowerResistance: UniverseResistance;
  resistanceByType: Map<MetaphysicsType, UniverseResistance>;

  // Scaling
  powerCeiling: number;          // Max power level (0-10)
  baselineHuman: number;         // Human capability level
  scalingFactor: number;         // Multiplier for translated powers

  // Special Rules
  specialRules: UniverseRule[];
  fiatOverrides: boolean;        // Can fiat override universe rules?
  crossoverFriendly: boolean;    // Designed for outside powers

  // Real-World Connection (for amalgam/urban fantasy settings)
  realityType: UniverseRealityType;
  realWorldBinding?: {
    bindingType: RealWorldBindingType;
    primaryRealLocation?: string;     // e.g., "Japan", "New York City"
    realWorldTimeframe?: string;      // e.g., "Modern day", "1920s"
    realWorldCoordinates?: {
      latitude: number;
      longitude: number;
      region?: string;
    };
    divergencePoint?: string;         // When/how reality diverged
    hiddenElements: string[];         // What's hidden from mundanes
    mundaneAwareness: 'none' | 'rumors' | 'partial' | 'full';
  };

  // Crossover Sources (for composite/amalgam worlds)
  sourceUniverses?: Array<{
    universeId: string;
    universeName: string;
    elementsIncluded: string[];
    integrationMethod: 'merge' | 'overlay' | 'adjacent' | 'nested';
  }>;

  // Reference
  sourceJumpId?: string;
  notes: string;
}

/**
 * Real-world location with fictional overlay
 */
export interface RealWorldOverlayLocation {
  id: string;
  fictionalName: string;
  realWorldName?: string;

  // Coordinates
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Binding
  bindingType: RealWorldBindingType;
  universeId: string;

  // Fictional elements at this location
  fictionalAdditions: string[];       // Things added that don't exist IRL
  fictionalModifications: string[];   // Changes to real things
  hiddenAreas: string[];              // Secret places

  // Access
  mundaneAccessible: boolean;
  accessRequirements?: string[];

  // Notes
  description: string;
}

/**
 * Universe-specific rule
 */
export interface UniverseRule {
  id: string;
  name: string;
  description: string;

  // What it affects
  affectsMetaphysics: MetaphysicsType[];
  affectsPowerTags: string[];

  // Effect
  effect: 'block' | 'modify' | 'enhance' | 'replace' | 'conditional';
  modification?: {
    scalingChange: number;
    newMechanism?: string;
    restrictions: string[];
    requirements: string[];
  };

  // Exceptions
  fiatBypassable: boolean;
  bypassConditions: string[];

  priority: number;              // Higher = applied first
}

/**
 * Power metaphysical profile
 */
export interface PowerProfile {
  id: string;
  powerId: string;               // Reference to actual power
  name: string;

  // Metaphysics
  metaphysicsType: MetaphysicsType;
  secondaryTypes: MetaphysicsType[];
  mechanism: string;             // How the power works

  // Requirements
  requiresAmbientEnergy: boolean;
  requiredEnergyType?: string;
  canGenerateOwnEnergy: boolean;

  // Flexibility
  adaptability: number;          // 0-100, how well it adapts
  mechanismFlexibility: 'rigid' | 'flexible' | 'fluid';

  // Fiat
  fiatLevel: FiatLevel;
  fiatProtections: string[];     // What fiat guarantees

  // Tags for rule matching
  tags: string[];
  sourceUniverseId: string;
}

/**
 * Translation rule between metaphysics types
 */
export interface TranslationRule {
  id: string;
  name: string;

  // Source and target
  sourceMetaphysics: MetaphysicsType;
  targetMetaphysics: MetaphysicsType;

  // Translation
  baseResult: AdaptationResult;
  complexity: TranslationComplexity;
  scalingModifier: number;       // Multiplier (1.0 = no change)

  // How translation works
  mechanismTranslation: string;
  visualTranslation: string;
  feelTranslation: string;

  // Conditions
  requiresAdaptationPeriod: boolean;
  adaptationChapters: number;
  conditions: string[];

  // Can be overridden by fiat
  fiatOverrideable: boolean;

  notes: string;
}

/**
 * Result of translating a power to a universe
 */
export interface TranslationResult {
  id: string;
  powerProfileId: string;
  universeProfileId: string;

  // Result
  result: AdaptationResult;
  overallScaling: number;
  complexity: TranslationComplexity;

  // Details
  translatedMechanism: string;
  visualChanges: string;
  functionalChanges: string[];
  lostCapabilities: string[];
  gainedCapabilities: string[];

  // Rules applied
  rulesApplied: string[];
  fiatProtectionsUsed: string[];

  // Requirements
  adaptationPeriod: number;      // Chapters to full function
  currentAdaptation: number;     // Progress (0-100)
  requiresConcentration: boolean;
  energyRequirements: string;

  // Warnings
  risks: string[];
  warnings: string[];
  narrativeNotes: string[];

  // Caching
  calculatedChapter: number;
  isStable: boolean;             // Won't change unless universe does
}

/**
 * Adaptation progress tracker
 */
export interface AdaptationProgress {
  id: string;
  translationResultId: string;
  powerProfileId: string;
  universeProfileId: string;

  // Progress
  startChapter: number;
  currentChapter: number;
  targetChapter: number;         // When fully adapted
  progressPercent: number;

  // Milestones
  milestones: {
    chapter: number;
    description: string;
    reached: boolean;
    unlocks: string[];
  }[];

  // Difficulties
  setbacks: {
    chapter: number;
    description: string;
    progressLost: number;
  }[];

  notes: string;
}

/**
 * Harmonization record for conflicting powers
 */
export interface PowerHarmonization {
  id: string;
  powerProfileIds: string[];
  universeProfileId: string;

  // Conflict
  conflictType: 'metaphysical' | 'mechanical' | 'narrative' | 'scaling';
  conflictDescription: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';

  // Resolution
  resolutionMethod: 'hierarchy' | 'blend' | 'separate' | 'toggle' | 'synergy';
  resolutionDescription: string;

  // Result
  functionalResult: string;
  powerPriority: string[];       // Order of dominance
  interactionRules: string[];

  // Stability
  isStable: boolean;
  instabilityRisks: string[];

  establishedChapter: number;
  lastUpdated: number;
}

/**
 * Configuration for the Universal Adapter
 */
export interface UniversalAdapterConfig {
  defaultFiatLevel: FiatLevel;
  autoCalculateTranslations: boolean;
  strictMetaphysicsChecking: boolean;
  allowFiatOverride: boolean;
  cacheTranslations: boolean;
}

// =============================================================================
// UNIVERSAL ADAPTER CLASS
// =============================================================================

export class UniversalAdapter {
  // Data storage
  private universeProfiles: Map<string, UniverseProfile> = new Map();
  private powerProfiles: Map<string, PowerProfile> = new Map();
  private translationRules: Map<string, TranslationRule> = new Map();
  private translationResults: Map<string, TranslationResult> = new Map();
  private adaptationProgress: Map<string, AdaptationProgress> = new Map();
  private harmonizations: Map<string, PowerHarmonization> = new Map();

  // Indexes
  private rulesBySource: Map<MetaphysicsType, Set<string>> = new Map();
  private profilesByUniverse: Map<string, Set<string>> = new Map();
  private resultsByPower: Map<string, Set<string>> = new Map();

  // Configuration
  private config: UniversalAdapterConfig = {
    defaultFiatLevel: FiatLevel.STANDARD,
    autoCalculateTranslations: true,
    strictMetaphysicsChecking: true,
    allowFiatOverride: true,
    cacheTranslations: true
  };

  constructor() {
    this.initializeDefaultRules();
  }

  // ===========================================================================
  // UNIVERSE PROFILE MANAGEMENT
  // ===========================================================================

  /**
   * Create a universe profile
   */
  createUniverseProfile(data: Omit<UniverseProfile, 'id' | 'resistanceByType'>): UniverseProfile {
    const id = uuidv4();
    const profile: UniverseProfile = {
      ...data,
      id,
      resistanceByType: new Map()
    };

    // Calculate resistance by type
    for (const meta of data.forbiddenMetaphysics) {
      profile.resistanceByType.set(meta, UniverseResistance.SEALED);
    }

    this.universeProfiles.set(id, profile);

    return profile;
  }

  /**
   * Get universe profile
   */
  getUniverseProfile(id: string): UniverseProfile | undefined {
    return this.universeProfiles.get(id);
  }

  /**
   * Find universe by name
   */
  findUniverseByName(name: string): UniverseProfile | undefined {
    return Array.from(this.universeProfiles.values())
      .find(u => u.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Update universe resistance for specific metaphysics
   */
  setUniverseResistance(
    universeId: string,
    metaphysics: MetaphysicsType,
    resistance: UniverseResistance
  ): void {
    const profile = this.universeProfiles.get(universeId);
    if (profile) {
      profile.resistanceByType.set(metaphysics, resistance);
    }
  }

  /**
   * Add rule to universe
   */
  addUniverseRule(universeId: string, rule: Omit<UniverseRule, 'id'>): UniverseRule {
    const profile = this.universeProfiles.get(universeId);
    if (!profile) {
      throw new Error(`Universe ${universeId} not found`);
    }

    const id = uuidv4();
    const fullRule: UniverseRule = { ...rule, id };
    profile.specialRules.push(fullRule);

    // Sort by priority
    profile.specialRules.sort((a, b) => b.priority - a.priority);

    return fullRule;
  }

  // ===========================================================================
  // POWER PROFILE MANAGEMENT
  // ===========================================================================

  /**
   * Create a power profile for translation
   */
  createPowerProfile(data: Omit<PowerProfile, 'id'>): PowerProfile {
    const id = uuidv4();
    const profile: PowerProfile = { ...data, id };

    this.powerProfiles.set(id, profile);

    // Update universe index
    const uniSet = this.profilesByUniverse.get(data.sourceUniverseId) || new Set();
    uniSet.add(id);
    this.profilesByUniverse.set(data.sourceUniverseId, uniSet);

    return profile;
  }

  /**
   * Get power profile
   */
  getPowerProfile(id: string): PowerProfile | undefined {
    return this.powerProfiles.get(id);
  }

  /**
   * Get all power profiles from a universe
   */
  getPowerProfilesByUniverse(universeId: string): PowerProfile[] {
    const ids = this.profilesByUniverse.get(universeId) || new Set();
    return Array.from(ids)
      .map(id => this.powerProfiles.get(id))
      .filter((p): p is PowerProfile => p !== undefined);
  }

  /**
   * Update power fiat level
   */
  updatePowerFiat(profileId: string, fiatLevel: FiatLevel, protections?: string[]): void {
    const profile = this.powerProfiles.get(profileId);
    if (profile) {
      profile.fiatLevel = fiatLevel;
      if (protections) {
        profile.fiatProtections = protections;
      }

      // Invalidate cached translations
      this.invalidateTranslationsForPower(profileId);
    }
  }

  // ===========================================================================
  // TRANSLATION RULES
  // ===========================================================================

  /**
   * Create a translation rule
   */
  createTranslationRule(data: Omit<TranslationRule, 'id'>): TranslationRule {
    const id = uuidv4();
    const rule: TranslationRule = { ...data, id };

    this.translationRules.set(id, rule);

    // Update index
    const sourceSet = this.rulesBySource.get(data.sourceMetaphysics) || new Set();
    sourceSet.add(id);
    this.rulesBySource.set(data.sourceMetaphysics, sourceSet);

    return rule;
  }

  /**
   * Find applicable translation rule
   */
  findTranslationRule(
    source: MetaphysicsType,
    target: MetaphysicsType
  ): TranslationRule | undefined {
    const sourceRules = this.rulesBySource.get(source);
    if (!sourceRules) return undefined;

    for (const ruleId of sourceRules) {
      const rule = this.translationRules.get(ruleId);
      if (rule && rule.targetMetaphysics === target) {
        return rule;
      }
    }

    return undefined;
  }

  /**
   * Initialize default translation rules
   */
  private initializeDefaultRules(): void {
    // Magic to No-Magic
    this.createTranslationRule({
      name: 'Ambient Magic to Non-Magical',
      sourceMetaphysics: MetaphysicsType.MAGIC_AMBIENT,
      targetMetaphysics: MetaphysicsType.MAGIC_NONE,
      baseResult: AdaptationResult.DOES_NOT_WORK,
      complexity: TranslationComplexity.IMPOSSIBLE,
      scalingModifier: 0,
      mechanismTranslation: 'No ambient magic to draw upon',
      visualTranslation: 'Nothing happens',
      feelTranslation: 'Empty, disconnected',
      requiresAdaptationPeriod: false,
      adaptationChapters: 0,
      conditions: ['Requires ambient magical energy'],
      fiatOverrideable: true,
      notes: 'Fiat backing creates personal magic field'
    });

    // Internal Magic to No-Magic (works better)
    this.createTranslationRule({
      name: 'Internal Magic to Non-Magical',
      sourceMetaphysics: MetaphysicsType.MAGIC_INTERNAL,
      targetMetaphysics: MetaphysicsType.MAGIC_NONE,
      baseResult: AdaptationResult.WORKS_MODIFIED,
      complexity: TranslationComplexity.MODERATE,
      scalingModifier: 0.7,
      mechanismTranslation: 'Internal energy sustains ability but no ambient boost',
      visualTranslation: 'May appear more muted or scientific',
      feelTranslation: 'Strain, like working against resistance',
      requiresAdaptationPeriod: true,
      adaptationChapters: 10,
      conditions: [],
      fiatOverrideable: true,
      notes: 'Internal energy sources work better in magic-dead worlds'
    });

    // Tech to Low-Tech
    this.createTranslationRule({
      name: 'Superscience to Realistic Tech',
      sourceMetaphysics: MetaphysicsType.TECH_SUPERSCIENCE,
      targetMetaphysics: MetaphysicsType.TECH_REALISTIC,
      baseResult: AdaptationResult.WORKS_WEAKENED,
      complexity: TranslationComplexity.COMPLEX,
      scalingModifier: 0.5,
      mechanismTranslation: 'Exotic physics may not function properly',
      visualTranslation: 'Devices may glitch or spark',
      feelTranslation: 'Equipment feels sluggish',
      requiresAdaptationPeriod: true,
      adaptationChapters: 20,
      conditions: ['Physics laws may prevent function'],
      fiatOverrideable: true,
      notes: 'Fiat ensures devices work but may need recalibration'
    });

    // Psychic to Non-Psychic
    this.createTranslationRule({
      name: 'Psychic to Mundane',
      sourceMetaphysics: MetaphysicsType.PSYCHIC,
      targetMetaphysics: MetaphysicsType.PHYSICS_REALISTIC,
      baseResult: AdaptationResult.BARELY_WORKS,
      complexity: TranslationComplexity.EXTREME,
      scalingModifier: 0.3,
      mechanismTranslation: 'Brain still produces effects but very limited',
      visualTranslation: 'Subtle, easily dismissed',
      feelTranslation: 'Massive mental strain',
      requiresAdaptationPeriod: true,
      adaptationChapters: 50,
      conditions: ['No psychic substrate'],
      fiatOverrideable: true,
      notes: 'Fiat creates minimal psychic field around user'
    });

    // Magic to Magitech (compatible)
    this.createTranslationRule({
      name: 'Ambient Magic to Magitech',
      sourceMetaphysics: MetaphysicsType.MAGIC_AMBIENT,
      targetMetaphysics: MetaphysicsType.TECH_MAGITECH,
      baseResult: AdaptationResult.WORKS_DIFFERENTLY,
      complexity: TranslationComplexity.SIMPLE,
      scalingModifier: 1.0,
      mechanismTranslation: 'Magic interfaces with magitech systems',
      visualTranslation: 'May produce more technological effects',
      feelTranslation: 'Clean, structured magical flow',
      requiresAdaptationPeriod: false,
      adaptationChapters: 0,
      conditions: [],
      fiatOverrideable: true,
      notes: 'Generally compatible systems'
    });

    // Cosmic powers (high compatibility)
    this.createTranslationRule({
      name: 'Cosmic to Anything',
      sourceMetaphysics: MetaphysicsType.COSMIC,
      targetMetaphysics: MetaphysicsType.UNKNOWN,
      baseResult: AdaptationResult.WORKS_PERFECTLY,
      complexity: TranslationComplexity.SIMPLE,
      scalingModifier: 1.0,
      mechanismTranslation: 'Cosmic powers transcend local metaphysics',
      visualTranslation: 'Unchanged',
      feelTranslation: 'Unchanged',
      requiresAdaptationPeriod: false,
      adaptationChapters: 0,
      conditions: [],
      fiatOverrideable: true,
      notes: 'Cosmic-tier powers generally work everywhere'
    });

    // Anime physics to realistic
    this.createTranslationRule({
      name: 'Anime Physics to Realistic',
      sourceMetaphysics: MetaphysicsType.PHYSICS_ANIME,
      targetMetaphysics: MetaphysicsType.PHYSICS_REALISTIC,
      baseResult: AdaptationResult.WORKS_WEAKENED,
      complexity: TranslationComplexity.COMPLEX,
      scalingModifier: 0.4,
      mechanismTranslation: 'Superhuman feats limited by physics',
      visualTranslation: 'Less flashy, no auras or effects',
      feelTranslation: 'Heavier, more constrained',
      requiresAdaptationPeriod: true,
      adaptationChapters: 30,
      conditions: ['Real physics apply'],
      fiatOverrideable: true,
      notes: 'Rule of cool does not apply'
    });
  }

  // ===========================================================================
  // TRANSLATION CALCULATION
  // ===========================================================================

  /**
   * Calculate how a power translates to a target universe
   */
  calculateTranslation(
    powerProfileId: string,
    universeProfileId: string,
    chapter: number
  ): TranslationResult {
    const powerProfile = this.powerProfiles.get(powerProfileId);
    const universeProfile = this.universeProfiles.get(universeProfileId);

    if (!powerProfile || !universeProfile) {
      throw new Error('Power or universe profile not found');
    }

    // Check cache
    const cacheKey = `${powerProfileId}-${universeProfileId}`;
    if (this.config.cacheTranslations) {
      const existing = this.translationResults.get(cacheKey);
      if (existing && existing.isStable) {
        return existing;
      }
    }

    // Start calculation
    let result: AdaptationResult = AdaptationResult.WORKS_PERFECTLY;
    let scaling = 1.0;
    let complexity = TranslationComplexity.SIMPLE;
    const rulesApplied: string[] = [];
    const fiatUsed: string[] = [];
    const functionalChanges: string[] = [];
    const lostCapabilities: string[] = [];
    const gainedCapabilities: string[] = [];
    const risks: string[] = [];
    const warnings: string[] = [];
    let translatedMechanism = powerProfile.mechanism;
    let visualChanges = 'None';
    let adaptationPeriod = 0;

    // Check if power's metaphysics is forbidden
    if (universeProfile.forbiddenMetaphysics.includes(powerProfile.metaphysicsType)) {
      if (powerProfile.fiatLevel >= FiatLevel.STRONG && this.config.allowFiatOverride) {
        fiatUsed.push('Override forbidden metaphysics');
        result = AdaptationResult.WORKS_MODIFIED;
        scaling *= 0.5;
        warnings.push('Operating against universe resistance');
      } else {
        result = AdaptationResult.FORBIDDEN;
        scaling = 0;
        translatedMechanism = 'Power actively rejected by universe';
      }
    }

    // Check universe resistance
    const resistance = universeProfile.resistanceByType.get(powerProfile.metaphysicsType)
      || universeProfile.foreignPowerResistance;

    switch (resistance) {
      case UniverseResistance.HOSTILE:
        if (powerProfile.fiatLevel >= FiatLevel.STRONG) {
          fiatUsed.push('Overcome hostile resistance');
          scaling *= 0.6;
          risks.push('Universe actively fights this power');
        } else {
          result = AdaptationResult.DANGEROUS;
          scaling *= 0.3;
          risks.push('Using this power may have severe consequences');
        }
        break;

      case UniverseResistance.RESISTANT:
        scaling *= 0.7;
        warnings.push('Universe resists this power type');
        complexity = TranslationComplexity.COMPLEX;
        break;

      case UniverseResistance.WELCOMING:
        scaling *= 1.2;
        gainedCapabilities.push('Enhanced by compatible metaphysics');
        break;

      case UniverseResistance.SEALED:
        if (powerProfile.fiatLevel >= FiatLevel.ABSOLUTE) {
          fiatUsed.push('Pierce sealed metaphysics');
          result = AdaptationResult.BARELY_WORKS;
          scaling *= 0.2;
        } else {
          result = AdaptationResult.DOES_NOT_WORK;
          scaling = 0;
        }
        break;
    }

    // Find translation rule
    for (const primaryMeta of universeProfile.primaryMetaphysics) {
      const rule = this.findTranslationRule(powerProfile.metaphysicsType, primaryMeta);
      if (rule) {
        rulesApplied.push(rule.name);
        scaling *= rule.scalingModifier;

        if (rule.baseResult !== AdaptationResult.WORKS_PERFECTLY &&
            result === AdaptationResult.WORKS_PERFECTLY) {
          result = rule.baseResult;
        }

        if (rule.complexity > complexity) {
          complexity = rule.complexity;
        }

        translatedMechanism = rule.mechanismTranslation;
        visualChanges = rule.visualTranslation;

        if (rule.requiresAdaptationPeriod) {
          adaptationPeriod = Math.max(adaptationPeriod, rule.adaptationChapters);
        }

        break; // Use first matching rule
      }
    }

    // Apply universe special rules
    for (const rule of universeProfile.specialRules) {
      const applies = rule.affectsMetaphysics.includes(powerProfile.metaphysicsType) ||
        rule.affectsPowerTags.some(tag => powerProfile.tags.includes(tag));

      if (applies) {
        rulesApplied.push(rule.name);

        switch (rule.effect) {
          case 'block':
            if (!rule.fiatBypassable || powerProfile.fiatLevel < FiatLevel.STRONG) {
              result = AdaptationResult.DOES_NOT_WORK;
              scaling = 0;
            } else {
              fiatUsed.push(`Bypass ${rule.name}`);
              scaling *= 0.5;
            }
            break;

          case 'modify':
            if (rule.modification) {
              scaling *= rule.modification.scalingChange;
              if (rule.modification.newMechanism) {
                translatedMechanism = rule.modification.newMechanism;
              }
              functionalChanges.push(...rule.modification.restrictions);
            }
            break;

          case 'enhance':
            if (rule.modification) {
              scaling *= rule.modification.scalingChange;
              gainedCapabilities.push(`Enhanced by ${rule.name}`);
            }
            break;
        }
      }
    }

    // Apply power ceiling
    if (universeProfile.powerCeiling < 10) {
      const effectiveScaling = scaling * universeProfile.scalingFactor;
      if (effectiveScaling > universeProfile.powerCeiling / 10) {
        if (powerProfile.fiatLevel >= FiatLevel.ABSOLUTE) {
          fiatUsed.push('Exceed power ceiling');
          warnings.push('Operating above local power limits');
        } else {
          scaling = (universeProfile.powerCeiling / 10) / universeProfile.scalingFactor;
          lostCapabilities.push('Power capped by universe ceiling');
        }
      }
    }

    // Check energy requirements
    let energyReqs = 'Standard';
    if (powerProfile.requiresAmbientEnergy && !powerProfile.canGenerateOwnEnergy) {
      const hasEnergySource = universeProfile.primaryMetaphysics
        .some(m => m.includes('magic') || m.includes('spiritual') || m.includes('cosmic'));

      if (!hasEnergySource) {
        if (powerProfile.fiatLevel >= FiatLevel.STANDARD) {
          fiatUsed.push('Generate ambient energy');
          energyReqs = 'Self-generated (taxing)';
          scaling *= 0.8;
        } else {
          result = AdaptationResult.DOES_NOT_WORK;
          scaling = 0;
          lostCapabilities.push('No energy source available');
        }
      }
    }

    // Build result
    const translationResult: TranslationResult = {
      id: cacheKey,
      powerProfileId,
      universeProfileId,
      result,
      overallScaling: Math.max(0, Math.min(2, scaling)), // Cap at 0-200%
      complexity,
      translatedMechanism,
      visualChanges,
      functionalChanges,
      lostCapabilities,
      gainedCapabilities,
      rulesApplied,
      fiatProtectionsUsed: fiatUsed,
      adaptationPeriod,
      currentAdaptation: adaptationPeriod > 0 ? 0 : 100,
      requiresConcentration: complexity >= TranslationComplexity.COMPLEX,
      energyRequirements: energyReqs,
      risks,
      warnings,
      narrativeNotes: this.generateNarrativeNotes(result, complexity, fiatUsed),
      calculatedChapter: chapter,
      isStable: result !== AdaptationResult.DANGEROUS
    };

    // Cache result
    this.translationResults.set(cacheKey, translationResult);

    // Update index
    const powerResultSet = this.resultsByPower.get(powerProfileId) || new Set();
    powerResultSet.add(cacheKey);
    this.resultsByPower.set(powerProfileId, powerResultSet);

    // Create adaptation progress if needed
    if (adaptationPeriod > 0) {
      this.createAdaptationProgress(translationResult, chapter);
    }

    return translationResult;
  }

  /**
   * Generate narrative notes for translation
   */
  private generateNarrativeNotes(
    result: AdaptationResult,
    complexity: TranslationComplexity,
    fiatUsed: string[]
  ): string[] {
    const notes: string[] = [];

    switch (result) {
      case AdaptationResult.WORKS_PERFECTLY:
        notes.push('The power functions as expected in this universe.');
        break;
      case AdaptationResult.WORKS_MODIFIED:
        notes.push('The power works but feels different - adapted to local rules.');
        break;
      case AdaptationResult.WORKS_WEAKENED:
        notes.push('The power is noticeably diminished in this setting.');
        break;
      case AdaptationResult.WORKS_ENHANCED:
        notes.push('Surprisingly, the power resonates with this universe!');
        break;
      case AdaptationResult.REQUIRES_EFFORT:
        notes.push('Using this power requires conscious effort and focus.');
        break;
      case AdaptationResult.BARELY_WORKS:
        notes.push('The power sputters and strains, barely functional.');
        break;
      case AdaptationResult.DOES_NOT_WORK:
        notes.push('The power simply... does nothing. Like reaching for something that isn\'t there.');
        break;
      case AdaptationResult.DANGEROUS:
        notes.push('WARNING: Using this power may have unintended consequences.');
        break;
      case AdaptationResult.FORBIDDEN:
        notes.push('This universe actively rejects this type of power.');
        break;
    }

    if (fiatUsed.length > 0) {
      notes.push(`Chain-purchased protection ensures function: ${fiatUsed.join(', ')}`);
    }

    if (complexity >= TranslationComplexity.EXTREME) {
      notes.push('The translation is so complex that the power barely resembles its original form.');
    }

    return notes;
  }

  /**
   * Create adaptation progress tracker
   */
  private createAdaptationProgress(
    result: TranslationResult,
    startChapter: number
  ): AdaptationProgress {
    const id = uuidv4();

    const progress: AdaptationProgress = {
      id,
      translationResultId: result.id,
      powerProfileId: result.powerProfileId,
      universeProfileId: result.universeProfileId,
      startChapter,
      currentChapter: startChapter,
      targetChapter: startChapter + result.adaptationPeriod,
      progressPercent: 0,
      milestones: [
        {
          chapter: startChapter + Math.floor(result.adaptationPeriod * 0.25),
          description: 'Basic functionality restored',
          reached: false,
          unlocks: ['25% power level']
        },
        {
          chapter: startChapter + Math.floor(result.adaptationPeriod * 0.5),
          description: 'Half-adapted to local rules',
          reached: false,
          unlocks: ['50% power level', 'Reduced concentration needed']
        },
        {
          chapter: startChapter + Math.floor(result.adaptationPeriod * 0.75),
          description: 'Nearly fully adapted',
          reached: false,
          unlocks: ['75% power level', 'Smooth operation']
        },
        {
          chapter: startChapter + result.adaptationPeriod,
          description: 'Fully adapted to this universe',
          reached: false,
          unlocks: ['Full power level', 'Instinctive use']
        }
      ],
      setbacks: [],
      notes: ''
    };

    this.adaptationProgress.set(id, progress);

    return progress;
  }

  /**
   * Update adaptation progress
   */
  updateAdaptationProgress(progressId: string, currentChapter: number): AdaptationProgress | null {
    const progress = this.adaptationProgress.get(progressId);
    if (!progress) return null;

    progress.currentChapter = currentChapter;

    // Calculate progress percentage
    const totalChapters = progress.targetChapter - progress.startChapter;
    const elapsed = currentChapter - progress.startChapter;
    progress.progressPercent = Math.min(100, (elapsed / totalChapters) * 100);

    // Check milestones
    for (const milestone of progress.milestones) {
      if (!milestone.reached && currentChapter >= milestone.chapter) {
        milestone.reached = true;
      }
    }

    // Update translation result
    const result = this.translationResults.get(progress.translationResultId);
    if (result) {
      result.currentAdaptation = progress.progressPercent;
    }

    return progress;
  }

  /**
   * Add setback to adaptation
   */
  addAdaptationSetback(
    progressId: string,
    chapter: number,
    description: string,
    progressLost: number
  ): void {
    const progress = this.adaptationProgress.get(progressId);
    if (!progress) return;

    progress.setbacks.push({ chapter, description, progressLost });
    progress.targetChapter += Math.ceil(progressLost / 100 *
      (progress.targetChapter - progress.startChapter));
  }

  // ===========================================================================
  // POWER HARMONIZATION
  // ===========================================================================

  /**
   * Check for and resolve conflicts between multiple powers
   */
  harmonizePowers(
    powerProfileIds: string[],
    universeProfileId: string,
    chapter: number
  ): PowerHarmonization {
    const id = uuidv4();
    const profiles = powerProfileIds
      .map(id => this.powerProfiles.get(id))
      .filter((p): p is PowerProfile => p !== undefined);

    // Detect conflict type
    let conflictType: PowerHarmonization['conflictType'] = 'metaphysical';
    let severity: PowerHarmonization['severity'] = 'minor';
    const conflictDescriptions: string[] = [];

    // Check metaphysical conflicts
    const metaphysicsTypes = new Set(profiles.map(p => p.metaphysicsType));
    if (metaphysicsTypes.has(MetaphysicsType.MAGIC_DIVINE) &&
        metaphysicsTypes.has(MetaphysicsType.MAGIC_RITUAL)) {
      conflictDescriptions.push('Divine and ritual magic may conflict');
      severity = 'moderate';
    }

    if (metaphysicsTypes.has(MetaphysicsType.TECH_HARD) &&
        metaphysicsTypes.has(MetaphysicsType.MAGIC_AMBIENT)) {
      conflictDescriptions.push('Hard tech and ambient magic have opposing philosophies');
      severity = 'moderate';
    }

    // Check for directly opposing tags
    const allTags = profiles.flatMap(p => p.tags);
    if (allTags.includes('holy') && allTags.includes('unholy')) {
      conflictDescriptions.push('Holy and unholy powers directly oppose');
      severity = 'critical';
      conflictType = 'metaphysical';
    }

    if (allTags.includes('order') && allTags.includes('chaos')) {
      conflictDescriptions.push('Order and chaos energies conflict');
      severity = 'major';
    }

    // Determine resolution method
    let resolutionMethod: PowerHarmonization['resolutionMethod'] = 'blend';
    let resolutionDescription = 'Powers blend together with minor interference';

    switch (severity) {
      case 'critical':
        resolutionMethod = 'toggle';
        resolutionDescription = 'Can only use one type at a time - switching causes feedback';
        break;
      case 'major':
        resolutionMethod = 'hierarchy';
        resolutionDescription = 'One power type takes precedence, suppressing the other';
        break;
      case 'moderate':
        resolutionMethod = 'separate';
        resolutionDescription = 'Powers operate in parallel but don\'t synergize';
        break;
    }

    // Check for potential synergy instead
    if (severity === 'minor' && profiles.length >= 2) {
      const hasComplementary = this.checkComplementaryPowers(profiles);
      if (hasComplementary) {
        resolutionMethod = 'synergy';
        resolutionDescription = 'Powers complement each other, creating new effects';
      }
    }

    const harmonization: PowerHarmonization = {
      id,
      powerProfileIds,
      universeProfileId,
      conflictType,
      conflictDescription: conflictDescriptions.join('; ') || 'No significant conflict',
      severity,
      resolutionMethod,
      resolutionDescription,
      functionalResult: this.describeFunctionalResult(resolutionMethod, profiles),
      powerPriority: this.determinePowerPriority(profiles),
      interactionRules: this.generateInteractionRules(resolutionMethod, profiles),
      isStable: severity !== 'critical',
      instabilityRisks: severity === 'critical'
        ? ['Backlash possible', 'May need to choose one']
        : [],
      establishedChapter: chapter,
      lastUpdated: chapter
    };

    this.harmonizations.set(id, harmonization);

    return harmonization;
  }

  /**
   * Check if powers are complementary
   */
  private checkComplementaryPowers(profiles: PowerProfile[]): boolean {
    const complementaryPairs = [
      ['fire', 'wind'],
      ['ice', 'water'],
      ['strength', 'speed'],
      ['offense', 'defense'],
      ['magic', 'tech']
    ];

    const allTags = profiles.flatMap(p => p.tags);

    for (const [a, b] of complementaryPairs) {
      if (allTags.includes(a) && allTags.includes(b)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determine priority order for conflicting powers
   */
  private determinePowerPriority(profiles: PowerProfile[]): string[] {
    return profiles
      .sort((a, b) => {
        // Higher fiat first
        const fiatOrder = Object.values(FiatLevel);
        const fiatDiff = fiatOrder.indexOf(b.fiatLevel) - fiatOrder.indexOf(a.fiatLevel);
        if (fiatDiff !== 0) return fiatDiff;

        // Higher adaptability second
        return b.adaptability - a.adaptability;
      })
      .map(p => p.id);
  }

  /**
   * Describe functional result of harmonization
   */
  private describeFunctionalResult(
    method: PowerHarmonization['resolutionMethod'],
    profiles: PowerProfile[]
  ): string {
    switch (method) {
      case 'synergy':
        return 'Powers enhance each other, creating combinations greater than their sum';
      case 'blend':
        return 'Powers function together with minimal interference';
      case 'hierarchy':
        return `${profiles[0]?.name || 'Primary power'} takes precedence`;
      case 'separate':
        return 'Powers operate independently without interaction';
      case 'toggle':
        return 'Only one power type can be active at a time';
      default:
        return 'Powers interact in complex ways';
    }
  }

  /**
   * Generate interaction rules
   */
  private generateInteractionRules(
    method: PowerHarmonization['resolutionMethod'],
    profiles: PowerProfile[]
  ): string[] {
    const rules: string[] = [];

    switch (method) {
      case 'synergy':
        rules.push('Combining powers may produce unexpected beneficial effects');
        rules.push('Both powers strengthen when used together');
        break;
      case 'hierarchy':
        rules.push(`${profiles[0]?.name || 'Primary'} suppresses ${profiles[1]?.name || 'secondary'} when active`);
        rules.push('Secondary power can be used when primary is dormant');
        break;
      case 'toggle':
        rules.push('Switching between power types causes 1-chapter cooldown');
        rules.push('Attempting to use both simultaneously causes backlash');
        break;
      case 'separate':
        rules.push('Powers don\'t interact - no synergy but no conflict');
        rules.push('Energy pools remain separate');
        break;
    }

    return rules;
  }

  // ===========================================================================
  // CACHE MANAGEMENT
  // ===========================================================================

  /**
   * Invalidate cached translations for a power
   */
  invalidateTranslationsForPower(powerProfileId: string): void {
    const resultIds = this.resultsByPower.get(powerProfileId);
    if (resultIds) {
      for (const id of resultIds) {
        this.translationResults.delete(id);
      }
      this.resultsByPower.delete(powerProfileId);
    }
  }

  /**
   * Get cached translation result
   */
  getCachedTranslation(powerProfileId: string, universeProfileId: string): TranslationResult | undefined {
    return this.translationResults.get(`${powerProfileId}-${universeProfileId}`);
  }

  // ===========================================================================
  // BATCH OPERATIONS
  // ===========================================================================

  /**
   * Calculate translations for all powers entering a universe
   */
  translateAllPowersToUniverse(
    powerProfileIds: string[],
    universeProfileId: string,
    chapter: number
  ): TranslationResult[] {
    return powerProfileIds.map(powerId =>
      this.calculateTranslation(powerId, universeProfileId, chapter)
    );
  }

  /**
   * Generate translation report for a jump
   */
  generateTranslationReport(
    powerProfileIds: string[],
    universeProfileId: string,
    chapter: number
  ): string {
    const universe = this.universeProfiles.get(universeProfileId);
    if (!universe) return 'Universe not found';

    let report = `# Power Translation Report: ${universe.name}\n\n`;

    // Universe overview
    report += '## Universe Metaphysics\n\n';
    report += `- **Primary:** ${universe.primaryMetaphysics.join(', ')}\n`;
    report += `- **Resistance:** ${universe.foreignPowerResistance}\n`;
    report += `- **Power Ceiling:** ${universe.powerCeiling}/10\n`;
    report += `- **Fiat Effective:** ${universe.fiatOverrides ? 'Yes' : 'Limited'}\n\n`;

    // Power translations
    report += '## Power Status\n\n';

    const results = this.translateAllPowersToUniverse(powerProfileIds, universeProfileId, chapter);

    // Group by result
    const byResult = new Map<AdaptationResult, TranslationResult[]>();
    for (const result of results) {
      const list = byResult.get(result.result) || [];
      list.push(result);
      byResult.set(result.result, list);
    }

    const resultOrder: AdaptationResult[] = [
      AdaptationResult.WORKS_ENHANCED,
      AdaptationResult.WORKS_PERFECTLY,
      AdaptationResult.WORKS_MODIFIED,
      AdaptationResult.WORKS_DIFFERENTLY,
      AdaptationResult.WORKS_WEAKENED,
      AdaptationResult.REQUIRES_EFFORT,
      AdaptationResult.BARELY_WORKS,
      AdaptationResult.DANGEROUS,
      AdaptationResult.DOES_NOT_WORK,
      AdaptationResult.FORBIDDEN
    ];

    for (const resultType of resultOrder) {
      const translations = byResult.get(resultType);
      if (!translations || translations.length === 0) continue;

      report += `### ${resultType.replace(/_/g, ' ').toUpperCase()}\n\n`;

      for (const t of translations) {
        const power = this.powerProfiles.get(t.powerProfileId);
        report += `**${power?.name || 'Unknown Power'}**\n`;
        report += `- Scaling: ${(t.overallScaling * 100).toFixed(0)}%\n`;
        if (t.adaptationPeriod > 0) {
          report += `- Adaptation: ${t.adaptationPeriod} chapters\n`;
        }
        if (t.fiatProtectionsUsed.length > 0) {
          report += `- Fiat Used: ${t.fiatProtectionsUsed.join(', ')}\n`;
        }
        if (t.lostCapabilities.length > 0) {
          report += `- Lost: ${t.lostCapabilities.join(', ')}\n`;
        }
        if (t.warnings.length > 0) {
          report += `- ⚠️ ${t.warnings.join(', ')}\n`;
        }
        report += '\n';
      }
    }

    // Harmonization check
    if (powerProfileIds.length > 1) {
      const harmonization = this.harmonizePowers(powerProfileIds, universeProfileId, chapter);
      report += '## Power Interactions\n\n';
      report += `- **Conflict Level:** ${harmonization.severity}\n`;
      report += `- **Resolution:** ${harmonization.resolutionMethod}\n`;
      report += `- **Result:** ${harmonization.functionalResult}\n`;
      if (harmonization.interactionRules.length > 0) {
        report += `- **Rules:**\n`;
        for (const rule of harmonization.interactionRules) {
          report += `  - ${rule}\n`;
        }
      }
    }

    return report;
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  /**
   * Get adapter statistics
   */
  getStats(): {
    universeProfiles: number;
    powerProfiles: number;
    translationRules: number;
    cachedTranslations: number;
    activeAdaptations: number;
    harmonizations: number;
  } {
    const activeAdaptations = Array.from(this.adaptationProgress.values())
      .filter(p => p.progressPercent < 100).length;

    return {
      universeProfiles: this.universeProfiles.size,
      powerProfiles: this.powerProfiles.size,
      translationRules: this.translationRules.size,
      cachedTranslations: this.translationResults.size,
      activeAdaptations,
      harmonizations: this.harmonizations.size
    };
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    // Convert Maps with Map values
    const universeProfilesArray: [string, UniverseProfile & { resistanceByTypeArray: [MetaphysicsType, UniverseResistance][] }][] = [];
    for (const [id, profile] of this.universeProfiles) {
      universeProfilesArray.push([id, {
        ...profile,
        resistanceByTypeArray: Array.from(profile.resistanceByType.entries())
      }]);
    }

    return JSON.stringify({
      universeProfiles: universeProfilesArray,
      powerProfiles: Array.from(this.powerProfiles.entries()),
      translationRules: Array.from(this.translationRules.entries()),
      translationResults: Array.from(this.translationResults.entries()),
      adaptationProgress: Array.from(this.adaptationProgress.entries()),
      harmonizations: Array.from(this.harmonizations.entries()),
      config: this.config
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.universeProfiles) {
      this.universeProfiles.clear();
      for (const [id, profile] of data.universeProfiles) {
        const restored: UniverseProfile = {
          ...profile,
          resistanceByType: new Map(profile.resistanceByTypeArray || [])
        };
        this.universeProfiles.set(id, restored);
      }
    }

    if (data.powerProfiles) {
      this.powerProfiles = new Map(data.powerProfiles);
      // Rebuild index
      this.profilesByUniverse.clear();
      for (const [id, profile] of this.powerProfiles) {
        const uniSet = this.profilesByUniverse.get(profile.sourceUniverseId) || new Set();
        uniSet.add(id);
        this.profilesByUniverse.set(profile.sourceUniverseId, uniSet);
      }
    }

    if (data.translationRules) {
      this.translationRules = new Map(data.translationRules);
      // Rebuild index
      this.rulesBySource.clear();
      for (const [id, rule] of this.translationRules) {
        const sourceSet = this.rulesBySource.get(rule.sourceMetaphysics) || new Set();
        sourceSet.add(id);
        this.rulesBySource.set(rule.sourceMetaphysics, sourceSet);
      }
    }

    if (data.translationResults) {
      this.translationResults = new Map(data.translationResults);
      // Rebuild index
      this.resultsByPower.clear();
      for (const [id, result] of this.translationResults) {
        const powerSet = this.resultsByPower.get(result.powerProfileId) || new Set();
        powerSet.add(id);
        this.resultsByPower.set(result.powerProfileId, powerSet);
      }
    }

    if (data.adaptationProgress) {
      this.adaptationProgress = new Map(data.adaptationProgress);
    }

    if (data.harmonizations) {
      this.harmonizations = new Map(data.harmonizations);
    }

    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.universeProfiles.clear();
    this.powerProfiles.clear();
    this.translationRules.clear();
    this.translationResults.clear();
    this.adaptationProgress.clear();
    this.harmonizations.clear();
    this.rulesBySource.clear();
    this.profilesByUniverse.clear();
    this.resultsByPower.clear();

    // Reinitialize default rules
    this.initializeDefaultRules();
  }
}

// Default instance
export const universalAdapter = new UniversalAdapter();

export default UniversalAdapter;
