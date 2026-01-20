/**
 * Epic Fiction Architect - Species/Creature Designer
 *
 * Comprehensive system for designing species, creatures, and life forms
 * for fictional universes. Integrates with Age Calculator for lifespan
 * management and Consistency Checker for world rule validation.
 *
 * Features:
 * - Physical/physiological design
 * - Ecological niche and food chain positioning
 * - Behavioral patterns and intelligence levels
 * - Magical/supernatural properties
 * - Cultural frameworks (for sentient species)
 * - Reproduction and life cycle management
 * - Random generation with customizable parameters
 * - Cross-species relationship tracking
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum SizeCategory {
  MICROSCOPIC = 'microscopic',    // < 1mm
  TINY = 'tiny',                  // 1mm - 15cm
  SMALL = 'small',                // 15cm - 60cm
  MEDIUM = 'medium',              // 60cm - 2m
  LARGE = 'large',                // 2m - 5m
  HUGE = 'huge',                  // 5m - 15m
  GARGANTUAN = 'gargantuan',      // 15m - 50m
  COLOSSAL = 'colossal',          // 50m - 200m
  TITANIC = 'titanic'             // > 200m
}

export enum Classification {
  SENTIENT = 'sentient',          // Self-aware, culture-capable
  SAPIENT = 'sapient',            // Intelligent but not culture-forming
  ANIMAL = 'animal',              // Complex behavior, instinct-driven
  PLANT = 'plant',                // Photosynthetic or equivalent
  FUNGUS = 'fungus',              // Decomposer organisms
  MICROBE = 'microbe',            // Single-celled or simple multicellular
  MAGICAL = 'magical',            // Primarily magical in nature
  CONSTRUCT = 'construct',        // Artificial life
  ELEMENTAL = 'elemental',        // Embodiment of natural forces
  UNDEAD = 'undead',              // Formerly living, now animated
  ABERRATION = 'aberration',      // Alien/otherworldly
  SPIRIT = 'spirit'               // Non-corporeal entities
}

export enum DietType {
  HERBIVORE = 'herbivore',
  CARNIVORE = 'carnivore',
  OMNIVORE = 'omnivore',
  INSECTIVORE = 'insectivore',
  PISCIVORE = 'piscivore',
  DETRITIVORE = 'detritivore',
  PARASITIC = 'parasitic',
  PHOTOSYNTHETIC = 'photosynthetic',
  CHEMOSYNTHETIC = 'chemosynthetic',
  MAGICAL_ABSORPTION = 'magical_absorption',
  EMOTIONAL_FEEDING = 'emotional_feeding',
  SOUL_CONSUMPTION = 'soul_consumption',
  NONE = 'none'
}

export enum EcologicalRole {
  APEX_PREDATOR = 'apex_predator',
  PREDATOR = 'predator',
  MESOPREDATOR = 'mesopredator',
  PREY = 'prey',
  GRAZER = 'grazer',
  BROWSER = 'browser',
  SCAVENGER = 'scavenger',
  DECOMPOSER = 'decomposer',
  POLLINATOR = 'pollinator',
  SEED_DISPERSER = 'seed_disperser',
  KEYSTONE = 'keystone',
  PRODUCER = 'producer',
  SYMBIONT = 'symbiont',
  PARASITE = 'parasite'
}

export enum Locomotion {
  BIPEDAL = 'bipedal',
  QUADRUPEDAL = 'quadrupedal',
  HEXAPODAL = 'hexapodal',
  OCTOPODAL = 'octopodal',
  SERPENTINE = 'serpentine',
  FLIGHT_WINGED = 'flight_winged',
  FLIGHT_MAGICAL = 'flight_magical',
  SWIMMING = 'swimming',
  BURROWING = 'burrowing',
  CLIMBING = 'climbing',
  JUMPING = 'jumping',
  TELEPORTATION = 'teleportation',
  PHASING = 'phasing',
  SESSILE = 'sessile',
  FLOATING = 'floating',
  ROLLING = 'rolling'
}

export enum SenseType {
  VISION_NORMAL = 'vision_normal',
  VISION_DARKVISION = 'vision_darkvision',
  VISION_INFRARED = 'vision_infrared',
  VISION_ULTRAVIOLET = 'vision_ultraviolet',
  VISION_MAGICAL = 'vision_magical',
  HEARING_NORMAL = 'hearing_normal',
  HEARING_ECHOLOCATION = 'hearing_echolocation',
  HEARING_SUBSONIC = 'hearing_subsonic',
  HEARING_ULTRASONIC = 'hearing_ultrasonic',
  SMELL_NORMAL = 'smell_normal',
  SMELL_TRACKING = 'smell_tracking',
  TASTE = 'taste',
  TOUCH = 'touch',
  TREMORSENSE = 'tremorsense',
  BLINDSIGHT = 'blindsight',
  TELEPATHY = 'telepathy',
  MAGICAL_SENSE = 'magical_sense',
  LIFE_SENSE = 'life_sense',
  DEATH_SENSE = 'death_sense',
  EMOTION_SENSE = 'emotion_sense',
  PRECOGNITION = 'precognition',
  ELECTRORECEPTION = 'electroreception',
  MAGNETORECEPTION = 'magnetoreception'
}

export enum ReproductionType {
  SEXUAL_VIVIPAROUS = 'sexual_viviparous',     // Live birth
  SEXUAL_OVIPAROUS = 'sexual_oviparous',       // Eggs
  SEXUAL_OVOVIVIPAROUS = 'sexual_ovoviviparous', // Eggs hatch inside
  ASEXUAL_BUDDING = 'asexual_budding',
  ASEXUAL_FISSION = 'asexual_fission',
  ASEXUAL_SPORES = 'asexual_spores',
  ASEXUAL_PARTHENOGENESIS = 'asexual_parthenogenesis',
  MAGICAL_MANIFESTATION = 'magical_manifestation',
  SPONTANEOUS_GENERATION = 'spontaneous_generation',
  TRANSFORMATION = 'transformation',
  CONSTRUCTED = 'constructed',
  NONE = 'none'
}

export enum IntelligenceLevel {
  MINDLESS = 'mindless',           // No cognitive function
  INSTINCTUAL = 'instinctual',     // Pure instinct
  TRAINABLE = 'trainable',         // Can learn simple tasks
  CLEVER = 'clever',               // Problem-solving (crows, octopi)
  SAPIENT = 'sapient',             // Self-aware, language-capable
  GENIUS = 'genius',               // Exceptional cognitive ability
  TRANSCENDENT = 'transcendent',   // Beyond mortal comprehension
  HIVE_MIND = 'hive_mind',         // Collective intelligence
  ARTIFICIAL = 'artificial'        // Programmed/constructed intelligence
}

export enum SocialStructure {
  SOLITARY = 'solitary',
  PAIR_BONDING = 'pair_bonding',
  FAMILY_GROUP = 'family_group',
  PACK = 'pack',
  HERD = 'herd',
  COLONY = 'colony',
  HIVE = 'hive',
  TRIBE = 'tribe',
  CLAN = 'clan',
  NATION = 'nation',
  EMPIRE = 'empire',
  NONE = 'none'
}

export enum Biome {
  TROPICAL_RAINFOREST = 'tropical_rainforest',
  TEMPERATE_FOREST = 'temperate_forest',
  BOREAL_FOREST = 'boreal_forest',
  GRASSLAND = 'grassland',
  SAVANNA = 'savanna',
  DESERT_HOT = 'desert_hot',
  DESERT_COLD = 'desert_cold',
  TUNDRA = 'tundra',
  ARCTIC = 'arctic',
  MOUNTAIN = 'mountain',
  WETLAND = 'wetland',
  FRESHWATER = 'freshwater',
  MARINE_COASTAL = 'marine_coastal',
  MARINE_PELAGIC = 'marine_pelagic',
  MARINE_ABYSSAL = 'marine_abyssal',
  CAVE = 'cave',
  VOLCANIC = 'volcanic',
  MAGICAL_REALM = 'magical_realm',
  ELEMENTAL_PLANE = 'elemental_plane',
  ASTRAL = 'astral',
  URBAN = 'urban',
  SUBTERRANEAN = 'subterranean'
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Physical characteristics of a species
 */
export interface Physiology {
  /** Base body form description */
  baseForm: string;

  /** Size category */
  size: SizeCategory;

  /** Typical height/length range in meters */
  heightRange: { min: number; max: number };

  /** Typical weight range in kg */
  weightRange: { min: number; max: number };

  /** Body covering (fur, scales, skin, etc.) */
  covering: string[];

  /** Coloration patterns */
  coloration: {
    primary: string[];
    secondary: string[];
    patterns: string[];
  };

  /** Number and type of limbs */
  limbs: {
    arms: number;
    legs: number;
    wings: number;
    tails: number;
    tentacles: number;
    other: { name: string; count: number }[];
  };

  /** Sensory capabilities */
  senses: SenseType[];

  /** Movement types */
  locomotion: Locomotion[];

  /** Special physical features */
  specialFeatures: string[];

  /** Natural weapons/defenses */
  naturalWeapons: string[];
  naturalDefenses: string[];

  /** Environmental tolerances */
  temperatureRange: { min: number; max: number }; // Celsius
  pressureTolerance: { min: number; max: number }; // Atmospheres
  canBreatheWater: boolean;
  canBreatheAir: boolean;
  requiresMagic: boolean;
}

/**
 * Life cycle information
 */
export interface LifeCycle {
  /** Reproduction method */
  reproductionType: ReproductionType;

  /** Gestation/incubation period in days */
  gestationPeriod: number;

  /** Number of offspring per birth */
  offspringCount: { min: number; max: number };

  /** Age stages with durations */
  stages: LifeStage[];

  /** Maximum natural lifespan in years */
  maxLifespan: number;

  /** Average lifespan in years */
  averageLifespan: number;

  /** Can this species die of old age? */
  canDieOfAge: boolean;

  /** Special life cycle notes */
  notes: string[];
}

export interface LifeStage {
  name: string;
  startAge: number;      // In years
  endAge: number;        // In years (-1 for indefinite)
  description: string;
  capabilities: string[];
  vulnerabilities: string[];
}

/**
 * Ecological information
 */
export interface Ecology {
  /** Primary habitat biomes */
  habitats: Biome[];

  /** Preferred terrain within biomes */
  preferredTerrain: string[];

  /** Diet classification */
  diet: DietType;

  /** Specific food sources */
  foodSources: string[];

  /** Ecological role */
  role: EcologicalRole;

  /** Natural predators (species IDs or names) */
  predators: string[];

  /** Natural prey (species IDs or names) */
  prey: string[];

  /** Symbiotic relationships */
  symbionts: {
    speciesId: string;
    type: 'mutualism' | 'commensalism' | 'parasitism';
    description: string;
  }[];

  /** Population density (per sq km) */
  populationDensity: { min: number; max: number };

  /** Territory size in sq km */
  territorySize: { min: number; max: number };

  /** Activity pattern */
  activityPattern: 'diurnal' | 'nocturnal' | 'crepuscular' | 'cathemeral';

  /** Seasonal behaviors */
  seasonalBehaviors: {
    season: string;
    behavior: string;
  }[];
}

/**
 * Behavioral characteristics
 */
export interface Behavior {
  /** Intelligence level */
  intelligence: IntelligenceLevel;

  /** Social structure */
  socialStructure: SocialStructure;

  /** Aggression level (0-10) */
  aggressionLevel: number;

  /** Territorial behavior (0-10) */
  territoriality: number;

  /** Curiosity/exploration drive (0-10) */
  curiosity: number;

  /** Fear response threshold (0-10, higher = braver) */
  bravery: number;

  /** Pack/herd size if social */
  groupSize: { min: number; max: number };

  /** Communication methods */
  communication: string[];

  /** Mating behaviors */
  matingBehaviors: string[];

  /** Parental care description */
  parentalCare: string;

  /** Notable behavioral traits */
  traits: string[];

  /** Instinctual behaviors */
  instincts: string[];
}

/**
 * Magical/supernatural properties
 */
export interface MagicalProperties {
  /** Is this species inherently magical? */
  isMagical: boolean;

  /** Magic affinity types */
  affinities: string[];

  /** Innate magical abilities */
  innateAbilities: Ability[];

  /** Magical resistances */
  resistances: string[];

  /** Magical vulnerabilities */
  vulnerabilities: string[];

  /** Can use learned magic? */
  canLearnMagic: boolean;

  /** Mana/energy capacity (if applicable) */
  manaCapacity?: number;

  /** Mana regeneration rate per hour */
  manaRegenRate?: number;

  /** Connection to magical sources */
  magicalSources: string[];

  /** Magical components (parts used in magic) */
  magicalComponents: {
    part: string;
    uses: string[];
    value: string;
  }[];
}

export interface Ability {
  name: string;
  description: string;
  type: 'innate' | 'learned' | 'racial';
  cost?: string;
  cooldown?: string;
  limitations: string[];
}

/**
 * Cultural information (for sentient species)
 */
export interface SpeciesCulture {
  /** Can this species form cultures? */
  canFormCultures: boolean;

  /** Typical language families */
  languageFamilies: string[];

  /** Common religions/spiritual beliefs */
  commonBeliefs: string[];

  /** Typical government types */
  governmentTypes: string[];

  /** Technology level range */
  techLevelRange: { min: string; max: string };

  /** Common occupations */
  commonOccupations: string[];

  /** Art forms */
  artForms: string[];

  /** Values and ethics */
  values: string[];

  /** Taboos */
  taboos: string[];

  /** Relations with other species */
  interspeciesRelations: {
    speciesId: string;
    attitude: 'allied' | 'friendly' | 'neutral' | 'suspicious' | 'hostile' | 'war';
    history: string;
  }[];
}

/**
 * Complete species definition
 */
export interface Species {
  id: string;
  name: string;
  pluralName: string;
  scientificName?: string;
  aliases: string[];
  description: string;

  classification: Classification;
  physiology: Physiology;
  lifeCycle: LifeCycle;
  ecology: Ecology;
  behavior: Behavior;
  magicalProperties: MagicalProperties;
  culture?: SpeciesCulture;

  /** Evolutionary/creation origin */
  origin: {
    type: 'evolved' | 'created' | 'magical' | 'divine' | 'extraplanar' | 'artificial' | 'unknown';
    description: string;
    ancestorSpecies?: string[];
    creatorEntity?: string;
  };

  /** Subspecies/variants */
  variants: SpeciesVariant[];

  /** Historical notes */
  history: string[];

  /** Tags for categorization */
  tags: string[];

  /** World-specific notes */
  worldNotes: string;

  /** Rarity in world */
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'unique' | 'extinct';

  /** Whether this is a playable/major species */
  isPlayable: boolean;

  /** Consistency rules for this species */
  consistencyRules: SpeciesRule[];

  /** Created/modified timestamps */
  createdAt: Date;
  updatedAt: Date;
}

export interface SpeciesVariant {
  id: string;
  name: string;
  description: string;
  differences: {
    field: string;
    originalValue: unknown;
    variantValue: unknown;
  }[];
  habitat?: Biome[];
  rarity: Species['rarity'];
}

export interface SpeciesRule {
  id: string;
  description: string;
  condition: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Generation options for random species
 */
export interface SpeciesGenerationOptions {
  classification?: Classification;
  biome?: Biome;
  size?: SizeCategory;
  intelligence?: IntelligenceLevel;
  isMagical?: boolean;
  diet?: DietType;
  isAquatic?: boolean;
  isFlying?: boolean;
  isSentient?: boolean;
  theme?: string;
  nameStyle?: 'latin' | 'fantasy' | 'descriptive';
}

// ============================================================================
// SPECIES DESIGNER CLASS
// ============================================================================

export class SpeciesDesigner {
  private species: Map<string, Species> = new Map();
  private seed: number = Date.now();

  constructor() {}

  /**
   * Set random seed for reproducible generation
   */
  setSeed(seed: number): void {
    this.seed = seed;
  }

  /**
   * Simple seeded random number generator
   */
  private random(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(this.random() * array.length)];
  }

  private randomChoices<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => this.random() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  // ===========================================================================
  // CRUD OPERATIONS
  // ===========================================================================

  /**
   * Create a new species
   */
  createSpecies(data: Partial<Species> & { name: string }): Species {
    const species: Species = {
      id: uuidv4(),
      name: data.name,
      pluralName: data.pluralName || data.name + 's',
      scientificName: data.scientificName,
      aliases: data.aliases || [],
      description: data.description || '',
      classification: data.classification || Classification.ANIMAL,
      physiology: data.physiology || this.generateDefaultPhysiology(),
      lifeCycle: data.lifeCycle || this.generateDefaultLifeCycle(),
      ecology: data.ecology || this.generateDefaultEcology(),
      behavior: data.behavior || this.generateDefaultBehavior(),
      magicalProperties: data.magicalProperties || this.generateDefaultMagicalProperties(),
      culture: data.culture,
      origin: data.origin || { type: 'unknown', description: '' },
      variants: data.variants || [],
      history: data.history || [],
      tags: data.tags || [],
      worldNotes: data.worldNotes || '',
      rarity: data.rarity || 'common',
      isPlayable: data.isPlayable || false,
      consistencyRules: data.consistencyRules || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.species.set(species.id, species);
    return species;
  }

  /**
   * Get species by ID
   */
  getSpecies(id: string): Species | undefined {
    return this.species.get(id);
  }

  /**
   * Get species by name
   */
  getSpeciesByName(name: string): Species | undefined {
    for (const species of this.species.values()) {
      if (species.name.toLowerCase() === name.toLowerCase() ||
          species.aliases.some(a => a.toLowerCase() === name.toLowerCase())) {
        return species;
      }
    }
    return undefined;
  }

  /**
   * Update a species
   */
  updateSpecies(id: string, updates: Partial<Species>): Species | undefined {
    const species = this.species.get(id);
    if (!species) return undefined;

    const updated = {
      ...species,
      ...updates,
      id: species.id,
      createdAt: species.createdAt,
      updatedAt: new Date()
    };

    this.species.set(id, updated);
    return updated;
  }

  /**
   * Delete a species
   */
  deleteSpecies(id: string): boolean {
    return this.species.delete(id);
  }

  /**
   * Get all species
   */
  getAllSpecies(): Species[] {
    return Array.from(this.species.values());
  }

  /**
   * Query species by criteria
   */
  querySpecies(criteria: {
    classification?: Classification;
    biome?: Biome;
    rarity?: Species['rarity'];
    isMagical?: boolean;
    isPlayable?: boolean;
    tags?: string[];
    intelligence?: IntelligenceLevel;
  }): Species[] {
    return this.getAllSpecies().filter(species => {
      if (criteria.classification && species.classification !== criteria.classification) return false;
      if (criteria.biome && !species.ecology.habitats.includes(criteria.biome)) return false;
      if (criteria.rarity && species.rarity !== criteria.rarity) return false;
      if (criteria.isMagical !== undefined && species.magicalProperties.isMagical !== criteria.isMagical) return false;
      if (criteria.isPlayable !== undefined && species.isPlayable !== criteria.isPlayable) return false;
      if (criteria.tags && !criteria.tags.every(tag => species.tags.includes(tag))) return false;
      if (criteria.intelligence && species.behavior.intelligence !== criteria.intelligence) return false;
      return true;
    });
  }

  // ===========================================================================
  // RANDOM GENERATION
  // ===========================================================================

  /**
   * Generate a random species
   */
  generateRandomSpecies(options: SpeciesGenerationOptions = {}): Species {
    const classification = options.classification || this.randomChoice(Object.values(Classification));
    const isSentient = options.isSentient ?? (classification === Classification.SENTIENT);
    const size = options.size || this.randomChoice(Object.values(SizeCategory));
    const biome = options.biome || this.randomChoice(Object.values(Biome));
    const intelligence = options.intelligence || this.generateIntelligenceForClassification(classification);
    const isMagical = options.isMagical ?? (this.random() > 0.6);

    const name = this.generateSpeciesName(options.nameStyle || 'fantasy', options.theme);

    const physiology = this.generatePhysiology(size, biome, options);
    const lifeCycle = this.generateLifeCycle(size, classification);
    const ecology = this.generateEcology(biome, size, options.diet);
    const behavior = this.generateBehavior(intelligence, classification);
    const magicalProperties = this.generateMagicalProperties(isMagical, classification);

    const species = this.createSpecies({
      name,
      pluralName: this.pluralize(name),
      description: this.generateDescription(name, classification, size, biome),
      classification,
      physiology,
      lifeCycle,
      ecology,
      behavior,
      magicalProperties,
      culture: isSentient ? this.generateCulture(intelligence) : undefined,
      origin: this.generateOrigin(classification, isMagical),
      tags: this.generateTags(classification, biome, isMagical, isSentient),
      rarity: this.randomChoice(['common', 'common', 'uncommon', 'uncommon', 'rare', 'very_rare'] as Species['rarity'][])
    });

    return species;
  }

  /**
   * Generate multiple random species for an ecosystem
   */
  generateEcosystem(biome: Biome, speciesCount: number = 10): Species[] {
    const ecosystem: Species[] = [];

    // Ensure ecological balance
    const roles: EcologicalRole[] = [
      EcologicalRole.PRODUCER,
      EcologicalRole.GRAZER,
      EcologicalRole.PREDATOR,
      EcologicalRole.APEX_PREDATOR,
      EcologicalRole.SCAVENGER,
      EcologicalRole.DECOMPOSER
    ];

    for (let i = 0; i < speciesCount; i++) {
      const role = roles[i % roles.length];
      const species = this.generateRandomSpecies({
        biome,
        diet: this.dietForRole(role),
        size: this.sizeForRole(role),
        intelligence: i === 0 && this.random() > 0.7 ? IntelligenceLevel.SAPIENT : undefined
      });

      // Set the ecological role
      species.ecology.role = role;
      this.updateSpecies(species.id, species);

      ecosystem.push(species);
    }

    // Link predator-prey relationships
    this.linkEcosystemRelationships(ecosystem);

    return ecosystem;
  }

  private linkEcosystemRelationships(ecosystem: Species[]): void {
    const predators = ecosystem.filter(s =>
      [EcologicalRole.PREDATOR, EcologicalRole.APEX_PREDATOR, EcologicalRole.MESOPREDATOR].includes(s.ecology.role)
    );
    const prey = ecosystem.filter(s =>
      [EcologicalRole.PREY, EcologicalRole.GRAZER, EcologicalRole.BROWSER].includes(s.ecology.role)
    );

    for (const predator of predators) {
      const preyCount = this.randomInt(1, 3);
      const selectedPrey = this.randomChoices(prey, preyCount);

      predator.ecology.prey = selectedPrey.map(p => p.name);
      for (const p of selectedPrey) {
        if (!p.ecology.predators.includes(predator.name)) {
          p.ecology.predators.push(predator.name);
        }
      }
    }
  }

  // ===========================================================================
  // GENERATION HELPERS
  // ===========================================================================

  private generateSpeciesName(style: 'latin' | 'fantasy' | 'descriptive', theme?: string): string {
    const prefixes = {
      latin: ['Mega', 'Micro', 'Neo', 'Paleo', 'Proto', 'Pseudo', 'Crypto', 'Xeno'],
      fantasy: ['Grim', 'Shadow', 'Storm', 'Fire', 'Ice', 'Blood', 'Iron', 'Crystal', 'Star', 'Moon'],
      descriptive: ['Great', 'Lesser', 'Common', 'Giant', 'Dwarf', 'Spotted', 'Striped']
    };

    const roots = {
      latin: ['saurus', 'don', 'raptor', 'cephalus', 'pteryx', 'felis', 'lupus', 'draco'],
      fantasy: ['wyrm', 'beast', 'stalker', 'hunter', 'spirit', 'shade', 'maw', 'claw', 'fang'],
      descriptive: ['bear', 'wolf', 'cat', 'hawk', 'serpent', 'lizard', 'fish', 'beetle']
    };

    const suffixes = {
      latin: ['us', 'is', 'um', 'oid', 'ian', 'ensis'],
      fantasy: ['kin', 'spawn', 'born', 'touched', 'walker', 'bane'],
      descriptive: ['', '-like', ' creature', ' beast']
    };

    const prefix = this.randomChoice(prefixes[style]);
    const root = this.randomChoice(roots[style]);
    const suffix = this.randomChoice(suffixes[style]);

    if (style === 'latin') {
      return prefix + root + suffix;
    } else if (style === 'fantasy') {
      return prefix + root;
    } else {
      return prefix + ' ' + root + suffix;
    }
  }

  private pluralize(name: string): string {
    if (name.endsWith('s') || name.endsWith('x') || name.endsWith('ch') || name.endsWith('sh')) {
      return name + 'es';
    } else if (name.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(name[name.length - 2])) {
      return name.slice(0, -1) + 'ies';
    } else if (name.endsWith('us')) {
      return name.slice(0, -2) + 'i';
    }
    return name + 's';
  }

  private generateIntelligenceForClassification(classification: Classification): IntelligenceLevel {
    switch (classification) {
      case Classification.SENTIENT: return IntelligenceLevel.SAPIENT;
      case Classification.SAPIENT: return this.randomChoice([IntelligenceLevel.CLEVER, IntelligenceLevel.SAPIENT]);
      case Classification.CONSTRUCT: return this.randomChoice([IntelligenceLevel.ARTIFICIAL, IntelligenceLevel.MINDLESS]);
      case Classification.SPIRIT:
      case Classification.ELEMENTAL:
        return this.randomChoice([IntelligenceLevel.SAPIENT, IntelligenceLevel.INSTINCTUAL]);
      case Classification.PLANT:
      case Classification.FUNGUS:
      case Classification.MICROBE:
        return IntelligenceLevel.MINDLESS;
      default:
        return this.randomChoice([IntelligenceLevel.INSTINCTUAL, IntelligenceLevel.TRAINABLE, IntelligenceLevel.CLEVER]);
    }
  }

  private dietForRole(role: EcologicalRole): DietType {
    switch (role) {
      case EcologicalRole.PRODUCER: return DietType.PHOTOSYNTHETIC;
      case EcologicalRole.GRAZER:
      case EcologicalRole.BROWSER: return DietType.HERBIVORE;
      case EcologicalRole.PREDATOR:
      case EcologicalRole.APEX_PREDATOR:
      case EcologicalRole.MESOPREDATOR: return DietType.CARNIVORE;
      case EcologicalRole.SCAVENGER: return DietType.OMNIVORE;
      case EcologicalRole.DECOMPOSER: return DietType.DETRITIVORE;
      default: return DietType.OMNIVORE;
    }
  }

  private sizeForRole(role: EcologicalRole): SizeCategory {
    switch (role) {
      case EcologicalRole.APEX_PREDATOR: return this.randomChoice([SizeCategory.LARGE, SizeCategory.HUGE]);
      case EcologicalRole.PREDATOR: return this.randomChoice([SizeCategory.MEDIUM, SizeCategory.LARGE]);
      case EcologicalRole.GRAZER: return this.randomChoice([SizeCategory.MEDIUM, SizeCategory.LARGE]);
      case EcologicalRole.DECOMPOSER: return this.randomChoice([SizeCategory.TINY, SizeCategory.SMALL]);
      case EcologicalRole.PRODUCER: return this.randomChoice([SizeCategory.TINY, SizeCategory.SMALL, SizeCategory.MEDIUM]);
      default: return this.randomChoice(Object.values(SizeCategory).slice(1, 6));
    }
  }

  private generatePhysiology(size: SizeCategory, biome: Biome, options: SpeciesGenerationOptions): Physiology {
    const baseforms = ['humanoid', 'quadruped', 'serpentine', 'avian', 'insectoid', 'amorphous', 'aquatic', 'plant-like'];
    const baseForm = this.randomChoice(baseforms);

    const sizeRanges: Record<SizeCategory, { height: [number, number]; weight: [number, number] }> = {
      [SizeCategory.MICROSCOPIC]: { height: [0.0001, 0.001], weight: [0.000001, 0.00001] },
      [SizeCategory.TINY]: { height: [0.001, 0.15], weight: [0.00001, 0.5] },
      [SizeCategory.SMALL]: { height: [0.15, 0.6], weight: [0.5, 10] },
      [SizeCategory.MEDIUM]: { height: [0.6, 2], weight: [10, 200] },
      [SizeCategory.LARGE]: { height: [2, 5], weight: [200, 2000] },
      [SizeCategory.HUGE]: { height: [5, 15], weight: [2000, 20000] },
      [SizeCategory.GARGANTUAN]: { height: [15, 50], weight: [20000, 200000] },
      [SizeCategory.COLOSSAL]: { height: [50, 200], weight: [200000, 2000000] },
      [SizeCategory.TITANIC]: { height: [200, 1000], weight: [2000000, 100000000] }
    };

    const range = sizeRanges[size];
    const coverings = ['fur', 'scales', 'feathers', 'chitin', 'skin', 'bark', 'slime', 'crystal', 'metal', 'flame'];
    const colors = ['black', 'white', 'brown', 'gray', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'iridescent'];

    const locomotionOptions: Locomotion[] = [];
    if (options.isAquatic) locomotionOptions.push(Locomotion.SWIMMING);
    if (options.isFlying) locomotionOptions.push(Locomotion.FLIGHT_WINGED);
    if (locomotionOptions.length === 0) {
      locomotionOptions.push(this.randomChoice([Locomotion.BIPEDAL, Locomotion.QUADRUPEDAL, Locomotion.SERPENTINE]));
    }

    return {
      baseForm,
      size,
      heightRange: { min: range.height[0], max: range.height[1] },
      weightRange: { min: range.weight[0], max: range.weight[1] },
      covering: this.randomChoices(coverings, this.randomInt(1, 2)),
      coloration: {
        primary: this.randomChoices(colors, 1),
        secondary: this.randomChoices(colors, this.randomInt(0, 2)),
        patterns: this.randomChoices(['solid', 'spotted', 'striped', 'mottled', 'gradient'], 1)
      },
      limbs: {
        arms: baseForm === 'humanoid' ? 2 : baseForm === 'insectoid' ? this.randomInt(2, 4) : 0,
        legs: baseForm === 'quadruped' ? 4 : baseForm === 'humanoid' ? 2 : baseForm === 'insectoid' ? this.randomInt(4, 8) : 0,
        wings: options.isFlying ? 2 : 0,
        tails: this.randomInt(0, 2),
        tentacles: baseForm === 'amorphous' || baseForm === 'aquatic' ? this.randomInt(0, 8) : 0,
        other: []
      },
      senses: this.randomChoices(Object.values(SenseType).slice(0, 15), this.randomInt(3, 6)),
      locomotion: locomotionOptions,
      specialFeatures: [],
      naturalWeapons: this.randomChoices(['claws', 'teeth', 'horns', 'tusks', 'stinger', 'venom', 'spines'], this.randomInt(0, 3)),
      naturalDefenses: this.randomChoices(['thick hide', 'camouflage', 'regeneration', 'shell', 'spines', 'poison'], this.randomInt(0, 2)),
      temperatureRange: { min: -20, max: 50 },
      pressureTolerance: { min: 0.5, max: 2 },
      canBreatheWater: options.isAquatic || false,
      canBreatheAir: !options.isAquatic || this.random() > 0.5,
      requiresMagic: false
    };
  }

  private generateLifeCycle(size: SizeCategory, classification: Classification): LifeCycle {
    // Larger creatures generally live longer
    const sizeLifespanMultiplier: Record<SizeCategory, number> = {
      [SizeCategory.MICROSCOPIC]: 0.001,
      [SizeCategory.TINY]: 0.1,
      [SizeCategory.SMALL]: 0.5,
      [SizeCategory.MEDIUM]: 1,
      [SizeCategory.LARGE]: 2,
      [SizeCategory.HUGE]: 5,
      [SizeCategory.GARGANTUAN]: 10,
      [SizeCategory.COLOSSAL]: 50,
      [SizeCategory.TITANIC]: 100
    };

    const baseLifespan = this.randomInt(10, 100) * sizeLifespanMultiplier[size];
    const maxLifespan = Math.round(baseLifespan * (1 + this.random()));
    const avgLifespan = Math.round(maxLifespan * 0.7);

    const reproType = classification === Classification.PLANT
      ? ReproductionType.ASEXUAL_SPORES
      : classification === Classification.CONSTRUCT
        ? ReproductionType.CONSTRUCTED
        : this.randomChoice([
            ReproductionType.SEXUAL_VIVIPAROUS,
            ReproductionType.SEXUAL_OVIPAROUS,
            ReproductionType.SEXUAL_OVOVIVIPAROUS
          ]);

    return {
      reproductionType: reproType,
      gestationPeriod: Math.round(30 + this.random() * 300),
      offspringCount: { min: 1, max: this.randomInt(1, 12) },
      stages: [
        { name: 'Infant', startAge: 0, endAge: Math.round(maxLifespan * 0.05), description: 'Newborn stage', capabilities: [], vulnerabilities: ['helpless'] },
        { name: 'Juvenile', startAge: Math.round(maxLifespan * 0.05), endAge: Math.round(maxLifespan * 0.15), description: 'Growing stage', capabilities: ['basic movement'], vulnerabilities: [] },
        { name: 'Adult', startAge: Math.round(maxLifespan * 0.15), endAge: Math.round(maxLifespan * 0.7), description: 'Mature stage', capabilities: ['full capabilities'], vulnerabilities: [] },
        { name: 'Elder', startAge: Math.round(maxLifespan * 0.7), endAge: -1, description: 'Aging stage', capabilities: ['wisdom'], vulnerabilities: ['reduced stamina'] }
      ],
      maxLifespan,
      averageLifespan: avgLifespan,
      canDieOfAge: classification !== Classification.UNDEAD && classification !== Classification.CONSTRUCT,
      notes: []
    };
  }

  private generateEcology(biome: Biome, size: SizeCategory, diet?: DietType): Ecology {
    const selectedDiet = diet || this.randomChoice(Object.values(DietType).slice(0, 6));

    return {
      habitats: [biome],
      preferredTerrain: ['varied'],
      diet: selectedDiet,
      foodSources: this.generateFoodSources(selectedDiet),
      role: this.randomChoice(Object.values(EcologicalRole)),
      predators: [],
      prey: [],
      symbionts: [],
      populationDensity: { min: 0.01, max: 100 },
      territorySize: { min: 0.1, max: 1000 },
      activityPattern: this.randomChoice(['diurnal', 'nocturnal', 'crepuscular', 'cathemeral']),
      seasonalBehaviors: []
    };
  }

  private generateFoodSources(diet: DietType): string[] {
    switch (diet) {
      case DietType.HERBIVORE: return ['grasses', 'leaves', 'fruits', 'roots'];
      case DietType.CARNIVORE: return ['small mammals', 'fish', 'birds', 'reptiles'];
      case DietType.OMNIVORE: return ['plants', 'insects', 'small animals', 'carrion'];
      case DietType.INSECTIVORE: return ['insects', 'larvae', 'arachnids'];
      case DietType.DETRITIVORE: return ['dead organic matter', 'fallen leaves', 'corpses'];
      case DietType.PHOTOSYNTHETIC: return ['sunlight', 'water', 'minerals'];
      default: return ['various'];
    }
  }

  private generateBehavior(intelligence: IntelligenceLevel, classification: Classification): Behavior {
    const isSocial = this.random() > 0.4;

    return {
      intelligence,
      socialStructure: isSocial
        ? this.randomChoice([SocialStructure.PACK, SocialStructure.HERD, SocialStructure.COLONY, SocialStructure.TRIBE])
        : SocialStructure.SOLITARY,
      aggressionLevel: this.randomInt(1, 10),
      territoriality: this.randomInt(1, 10),
      curiosity: this.randomInt(1, 10),
      bravery: this.randomInt(1, 10),
      groupSize: isSocial ? { min: 2, max: this.randomInt(5, 100) } : { min: 1, max: 1 },
      communication: this.generateCommunication(intelligence),
      matingBehaviors: ['courtship display', 'territorial competition'],
      parentalCare: this.randomChoice(['none', 'minimal', 'moderate', 'extensive', 'communal']),
      traits: [],
      instincts: ['survival', 'reproduction', 'territory']
    };
  }

  private generateCommunication(intelligence: IntelligenceLevel): string[] {
    const methods: string[] = [];

    if (intelligence === IntelligenceLevel.SAPIENT || intelligence === IntelligenceLevel.GENIUS) {
      methods.push('spoken language', 'written language');
    }
    if (intelligence !== IntelligenceLevel.MINDLESS) {
      methods.push(this.randomChoice(['vocalizations', 'body language', 'pheromones', 'bioluminescence']));
    }

    return methods;
  }

  private generateMagicalProperties(isMagical: boolean, classification: Classification): MagicalProperties {
    if (!isMagical && classification !== Classification.MAGICAL && classification !== Classification.ELEMENTAL) {
      return {
        isMagical: false,
        affinities: [],
        innateAbilities: [],
        resistances: [],
        vulnerabilities: [],
        canLearnMagic: classification === Classification.SENTIENT,
        magicalSources: [],
        magicalComponents: []
      };
    }

    const affinityTypes = ['fire', 'water', 'earth', 'air', 'light', 'darkness', 'life', 'death', 'mind', 'time', 'space'];

    return {
      isMagical: true,
      affinities: this.randomChoices(affinityTypes, this.randomInt(1, 3)),
      innateAbilities: [{
        name: this.randomChoice(['Elemental Breath', 'Natural Healing', 'Illusion', 'Telepathy', 'Phasing']),
        description: 'Innate magical ability',
        type: 'innate',
        limitations: ['limited uses per day']
      }],
      resistances: this.randomChoices(affinityTypes, this.randomInt(0, 2)),
      vulnerabilities: this.randomChoices(affinityTypes, this.randomInt(0, 1)),
      canLearnMagic: classification === Classification.SENTIENT,
      manaCapacity: this.randomInt(10, 100),
      manaRegenRate: this.randomInt(1, 10),
      magicalSources: ['innate'],
      magicalComponents: [{
        part: this.randomChoice(['blood', 'scales', 'feathers', 'bones', 'essence']),
        uses: ['potions', 'enchantments'],
        value: this.randomChoice(['common', 'uncommon', 'rare', 'very rare'])
      }]
    };
  }

  private generateCulture(intelligence: IntelligenceLevel): SpeciesCulture {
    return {
      canFormCultures: true,
      languageFamilies: ['Native tongue'],
      commonBeliefs: this.randomChoices(['animism', 'polytheism', 'monotheism', 'ancestor worship', 'nature worship'], this.randomInt(1, 2)),
      governmentTypes: this.randomChoices(['tribal', 'chiefdom', 'monarchy', 'oligarchy', 'democracy', 'theocracy'], this.randomInt(1, 2)),
      techLevelRange: { min: 'stone age', max: 'iron age' },
      commonOccupations: ['hunter', 'gatherer', 'crafter', 'warrior', 'shaman'],
      artForms: this.randomChoices(['music', 'dance', 'sculpture', 'painting', 'storytelling', 'weaving'], this.randomInt(2, 4)),
      values: this.randomChoices(['honor', 'family', 'strength', 'wisdom', 'harmony', 'freedom'], this.randomInt(2, 4)),
      taboos: this.randomChoices(['cannibalism', 'incest', 'oath-breaking', 'desecration'], this.randomInt(1, 3)),
      interspeciesRelations: []
    };
  }

  private generateOrigin(classification: Classification, isMagical: boolean): Species['origin'] {
    const types: Species['origin']['type'][] = ['evolved', 'created', 'magical', 'divine', 'extraplanar', 'artificial', 'unknown'];
    let type: Species['origin']['type'];

    if (classification === Classification.CONSTRUCT) type = 'artificial';
    else if (classification === Classification.ELEMENTAL) type = 'extraplanar';
    else if (isMagical && this.random() > 0.5) type = 'magical';
    else type = this.randomChoice(types);

    return {
      type,
      description: `${type} origin`
    };
  }

  private generateTags(classification: Classification, biome: Biome, isMagical: boolean, isSentient: boolean): string[] {
    const tags: string[] = [classification, biome];
    if (isMagical) tags.push('magical');
    if (isSentient) tags.push('sentient', 'playable');
    return tags;
  }

  private generateDescription(name: string, classification: Classification, size: SizeCategory, biome: Biome): string {
    return `The ${name} is a ${size} ${classification} creature native to ${biome.replace(/_/g, ' ')} environments.`;
  }

  private generateDefaultPhysiology(): Physiology {
    return this.generatePhysiology(SizeCategory.MEDIUM, Biome.TEMPERATE_FOREST, {});
  }

  private generateDefaultLifeCycle(): LifeCycle {
    return this.generateLifeCycle(SizeCategory.MEDIUM, Classification.ANIMAL);
  }

  private generateDefaultEcology(): Ecology {
    return this.generateEcology(Biome.TEMPERATE_FOREST, SizeCategory.MEDIUM);
  }

  private generateDefaultBehavior(): Behavior {
    return this.generateBehavior(IntelligenceLevel.INSTINCTUAL, Classification.ANIMAL);
  }

  private generateDefaultMagicalProperties(): MagicalProperties {
    return this.generateMagicalProperties(false, Classification.ANIMAL);
  }

  // ===========================================================================
  // EXPORT & IMPORT
  // ===========================================================================

  /**
   * Export all species to JSON
   */
  exportToJSON(): string {
    return JSON.stringify(Array.from(this.species.values()), null, 2);
  }

  /**
   * Import species from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json) as Species[];
    for (const species of data) {
      this.species.set(species.id, {
        ...species,
        createdAt: new Date(species.createdAt),
        updatedAt: new Date(species.updatedAt)
      });
    }
  }

  /**
   * Generate markdown documentation for a species
   */
  generateMarkdown(speciesId: string): string {
    const species = this.species.get(speciesId);
    if (!species) return '';

    let md = `# ${species.name}\n\n`;
    md += `*${species.scientificName || 'No scientific name'}*\n\n`;
    md += `${species.description}\n\n`;

    md += `## Classification\n`;
    md += `- **Type:** ${species.classification}\n`;
    md += `- **Rarity:** ${species.rarity}\n`;
    md += `- **Origin:** ${species.origin.type}\n\n`;

    md += `## Physical Characteristics\n`;
    md += `- **Size:** ${species.physiology.size}\n`;
    md += `- **Height:** ${species.physiology.heightRange.min}m - ${species.physiology.heightRange.max}m\n`;
    md += `- **Weight:** ${species.physiology.weightRange.min}kg - ${species.physiology.weightRange.max}kg\n`;
    md += `- **Covering:** ${species.physiology.covering.join(', ')}\n`;
    md += `- **Coloration:** ${species.physiology.coloration.primary.join(', ')}\n\n`;

    md += `## Life Cycle\n`;
    md += `- **Lifespan:** ${species.lifeCycle.averageLifespan} - ${species.lifeCycle.maxLifespan} years\n`;
    md += `- **Reproduction:** ${species.lifeCycle.reproductionType}\n`;
    md += `- **Offspring:** ${species.lifeCycle.offspringCount.min} - ${species.lifeCycle.offspringCount.max}\n\n`;

    md += `## Ecology\n`;
    md += `- **Habitat:** ${species.ecology.habitats.join(', ')}\n`;
    md += `- **Diet:** ${species.ecology.diet}\n`;
    md += `- **Role:** ${species.ecology.role}\n`;
    md += `- **Activity:** ${species.ecology.activityPattern}\n\n`;

    md += `## Behavior\n`;
    md += `- **Intelligence:** ${species.behavior.intelligence}\n`;
    md += `- **Social Structure:** ${species.behavior.socialStructure}\n`;
    md += `- **Aggression:** ${species.behavior.aggressionLevel}/10\n`;
    md += `- **Communication:** ${species.behavior.communication.join(', ')}\n\n`;

    if (species.magicalProperties.isMagical) {
      md += `## Magical Properties\n`;
      md += `- **Affinities:** ${species.magicalProperties.affinities.join(', ')}\n`;
      md += `- **Abilities:** ${species.magicalProperties.innateAbilities.map(a => a.name).join(', ')}\n`;
      md += `- **Resistances:** ${species.magicalProperties.resistances.join(', ')}\n\n`;
    }

    if (species.culture) {
      md += `## Culture\n`;
      md += `- **Beliefs:** ${species.culture.commonBeliefs.join(', ')}\n`;
      md += `- **Government:** ${species.culture.governmentTypes.join(', ')}\n`;
      md += `- **Values:** ${species.culture.values.join(', ')}\n\n`;
    }

    return md;
  }
}

export default SpeciesDesigner;
