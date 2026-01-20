/**
 * Epic Fiction Architect - Magic/Power System Designer
 *
 * Comprehensive system for designing magic systems, supernatural powers,
 * and fantastical abilities. Supports both hard and soft magic systems
 * with full rule definition and consistency checking integration.
 *
 * Features:
 * - Magic source definition (mana, divine, nature, etc.)
 * - Spell/ability registry with costs and effects
 * - Power scaling and progression systems
 * - Schools/disciplines of magic
 * - Limitations and consequences
 * - Magical items and artifacts
 * - Learning and acquisition rules
 * - Consistency rule generation
 * - Random generation with themes
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum MagicSource {
  INNATE = 'innate',              // Born with it
  LEARNED = 'learned',            // Studied/practiced
  DIVINE = 'divine',              // Granted by gods
  NATURE = 'nature',              // From natural world
  ARCANE = 'arcane',              // Universal magical energy
  BLOOD = 'blood',                // Hereditary/genetic
  PACT = 'pact',                  // Contract with entity
  EMOTIONAL = 'emotional',        // Powered by feelings
  TECHNOLOGICAL = 'technological', // Magitech
  COSMIC = 'cosmic',              // From stars/universe
  SHADOW = 'shadow',              // From darkness/void
  ELEMENTAL = 'elemental',        // From elements
  SPIRITUAL = 'spiritual',        // From spirits/souls
  RUNIC = 'runic',                // Written/symbolic
  MUSICAL = 'musical',            // Sound-based
  FORBIDDEN = 'forbidden'         // Dark/taboo sources
}

export enum MagicSchool {
  // Classical Elements
  FIRE = 'fire',
  WATER = 'water',
  EARTH = 'earth',
  AIR = 'air',
  LIGHTNING = 'lightning',
  ICE = 'ice',

  // Life/Death
  HEALING = 'healing',
  NECROMANCY = 'necromancy',
  BIOMANCY = 'biomancy',
  RESTORATION = 'restoration',

  // Mental
  ILLUSION = 'illusion',
  ENCHANTMENT = 'enchantment',
  TELEPATHY = 'telepathy',
  DIVINATION = 'divination',
  PSIONICS = 'psionics',

  // Spatial/Temporal
  TELEPORTATION = 'teleportation',
  SUMMONING = 'summoning',
  CONJURATION = 'conjuration',
  CHRONOMANCY = 'chronomancy',
  SPATIAL = 'spatial',

  // Transformation
  TRANSMUTATION = 'transmutation',
  SHAPESHIFTING = 'shapeshifting',
  ALCHEMY = 'alchemy',

  // Protection/Combat
  ABJURATION = 'abjuration',
  EVOCATION = 'evocation',
  WARDING = 'warding',

  // Misc
  BINDING = 'binding',
  TRUE_NAMING = 'true_naming',
  BLOOD_MAGIC = 'blood_magic',
  VOID = 'void'
}

export enum CostType {
  MANA = 'mana',
  STAMINA = 'stamina',
  HEALTH = 'health',
  LIFESPAN = 'lifespan',
  SANITY = 'sanity',
  MATERIAL = 'material',
  TIME = 'time',
  EMOTION = 'emotion',
  MEMORY = 'memory',
  SOUL = 'soul',
  KARMA = 'karma',
  FREE = 'free'
}

export enum EffectType {
  DAMAGE = 'damage',
  HEALING = 'healing',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  SUMMON = 'summon',
  TRANSFORM = 'transform',
  TELEPORT = 'teleport',
  ILLUSION = 'illusion',
  DIVINATION = 'divination',
  WARD = 'ward',
  CONTROL = 'control',
  CREATION = 'creation',
  DESTRUCTION = 'destruction',
  UTILITY = 'utility'
}

export enum PowerLevel {
  CANTRIP = 'cantrip',        // Minor, at-will
  MINOR = 'minor',            // Basic spells
  MODERATE = 'moderate',      // Standard power
  MAJOR = 'major',            // Powerful spells
  GREATER = 'greater',        // Very powerful
  LEGENDARY = 'legendary',    // World-changing
  MYTHIC = 'mythic',          // Reality-warping
  DIVINE = 'divine'           // God-level
}

export enum LearningMethod {
  STUDY = 'study',
  PRACTICE = 'practice',
  MEDITATION = 'meditation',
  RITUAL = 'ritual',
  AWAKENING = 'awakening',
  INHERITANCE = 'inheritance',
  GIFT = 'gift',
  TRAUMA = 'trauma',
  BOND = 'bond',
  CONSUMPTION = 'consumption',
  INSCRIPTION = 'inscription'
}

export enum MagicSystemType {
  HARD = 'hard',              // Strict rules
  SOFT = 'soft',              // Vague/mysterious
  HYBRID = 'hybrid',          // Mix of both
  RATIONAL = 'rational',      // Science-like
  MYSTICAL = 'mystical'       // Spiritual/religious
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * A school or discipline of magic
 */
export interface MagicDiscipline {
  id: string;
  name: string;
  school: MagicSchool;
  description: string;

  // Characteristics
  philosophy: string;
  primaryEffects: EffectType[];
  secondaryEffects: EffectType[];

  // Requirements
  prerequisites: {
    disciplines: string[];
    abilities: string[];
    traits: string[];
    minLevel?: number;
  };

  // Learning
  learningDifficulty: 'easy' | 'moderate' | 'hard' | 'very_hard' | 'legendary';
  learningMethods: LearningMethod[];
  learningTime: string;

  // Practitioners
  practitioners: string[];
  organizations: string[];
  famousPractitioners: string[];

  // Relationships
  synergies: string[];        // Disciplines that combine well
  opposites: string[];        // Conflicting disciplines
  requiredFor: string[];      // Advanced disciplines needing this

  // Cultural
  culturalViews: {
    culture: string;
    view: 'revered' | 'accepted' | 'neutral' | 'suspicious' | 'forbidden';
  }[];

  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A spell, power, or ability
 */
export interface Ability {
  id: string;
  name: string;
  description: string;
  flavorText?: string;

  // Classification
  discipline: string;         // Discipline ID
  school: MagicSchool;
  powerLevel: PowerLevel;
  source: MagicSource;

  // Effects
  effects: {
    type: EffectType;
    description: string;
    magnitude: string;
    duration: string;
    range: string;
    area?: string;
  }[];

  // Costs
  costs: {
    type: CostType;
    amount: number | string;
    scaling?: string;
  }[];

  // Casting
  casting: {
    time: string;
    verbal: boolean;
    somatic: boolean;
    material?: string[];
    focus?: string;
    concentration: boolean;
  };

  // Requirements
  requirements: {
    minLevel?: number;
    disciplines?: string[];
    abilities?: string[];
    traits?: string[];
    conditions?: string[];
  };

  // Limitations
  limitations: {
    usesPerDay?: number;
    cooldown?: string;
    conditions: string[];
    counters: string[];
    immunities: string[];
  };

  // Advancement
  canImprove: boolean;
  improvements?: {
    name: string;
    effect: string;
    requirement: string;
  }[];

  // Meta
  isSignature: boolean;
  isRare: boolean;
  isForbidden: boolean;

  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A magical item or artifact
 */
export interface MagicalItem {
  id: string;
  name: string;
  description: string;

  // Classification
  type: 'weapon' | 'armor' | 'accessory' | 'tool' | 'consumable' | 'artifact' | 'relic';
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact' | 'unique';

  // Properties
  properties: {
    name: string;
    description: string;
    activation?: string;
    charges?: number;
  }[];

  // Abilities granted
  grantedAbilities: string[];  // Ability IDs

  // Requirements
  requirements: {
    attunement: boolean;
    attunementRequirements?: string[];
    userRequirements?: string[];
  };

  // Limitations
  limitations: {
    cursed: boolean;
    curseEffect?: string;
    sideEffects: string[];
    restrictions: string[];
  };

  // History
  history: {
    creator?: string;
    creationDate?: string;
    previousOwners?: string[];
    legendaryDeeds?: string[];
  };

  // Physical
  appearance: string;
  materials: string[];

  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A complete magic system
 */
export interface MagicSystem {
  id: string;
  name: string;
  description: string;

  // Type
  systemType: MagicSystemType;
  hardness: number;           // 1-10, how strict the rules are

  // Sources
  sources: {
    source: MagicSource;
    description: string;
    availability: 'universal' | 'common' | 'rare' | 'unique';
  }[];

  // Energy/Mana
  energySystem?: {
    name: string;
    description: string;
    baseCapacity: number;
    regeneration: {
      rate: number;
      method: string;
    };
    enhancementMethods: string[];
  };

  // Disciplines
  disciplines: string[];      // Discipline IDs

  // Fundamental laws
  laws: {
    name: string;
    description: string;
    exceptions: string[];
  }[];

  // Limitations
  limitations: {
    name: string;
    description: string;
    category: 'physical' | 'mental' | 'spiritual' | 'universal';
  }[];

  // Consequences
  consequences: {
    name: string;
    trigger: string;
    effect: string;
    severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  }[];

  // Progression
  progression: {
    system: 'levels' | 'tiers' | 'ranks' | 'freeform' | 'milestones';
    stages: {
      name: string;
      requirements: string[];
      capabilities: string[];
    }[];
  };

  // Learning
  learning: {
    methods: LearningMethod[];
    institutions: string[];
    requirements: string[];
    timeframes: {
      level: string;
      time: string;
    }[];
  };

  // Social aspects
  social: {
    practitioners: string;    // What are magic users called?
    status: 'elite' | 'respected' | 'common' | 'feared' | 'persecuted';
    organizations: string[];
    regulations: string[];
  };

  // Interaction with world
  worldInteraction: {
    visibility: 'overt' | 'subtle' | 'hidden';
    commonUses: string[];
    economicImpact: string;
    militaryUse: string;
    religiousViews: string;
  };

  // Consistency rules
  consistencyRules: {
    id: string;
    rule: string;
    enforcement: string;
  }[];

  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generation options
 */
export interface MagicSystemGenerationOptions {
  type?: MagicSystemType;
  theme?: 'elemental' | 'divine' | 'arcane' | 'nature' | 'psychic' | 'blood' | 'runic' | 'musical';
  hardness?: number;
  schoolCount?: number;
  hasEnergySystem?: boolean;
  dangerLevel?: 'safe' | 'moderate' | 'dangerous' | 'deadly';
}

// ============================================================================
// MAGIC SYSTEM DESIGNER CLASS
// ============================================================================

export class MagicSystemDesigner {
  private systems: Map<string, MagicSystem> = new Map();
  private disciplines: Map<string, MagicDiscipline> = new Map();
  private abilities: Map<string, Ability> = new Map();
  private items: Map<string, MagicalItem> = new Map();
  private seed: number = Date.now();

  constructor() {}

  setSeed(seed: number): void {
    this.seed = seed;
  }

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
  // MAGIC SYSTEM OPERATIONS
  // ===========================================================================

  createMagicSystem(data: Partial<MagicSystem> & { name: string }): MagicSystem {
    const system: MagicSystem = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      systemType: data.systemType || MagicSystemType.HYBRID,
      hardness: data.hardness || 5,
      sources: data.sources || [],
      energySystem: data.energySystem,
      disciplines: data.disciplines || [],
      laws: data.laws || [],
      limitations: data.limitations || [],
      consequences: data.consequences || [],
      progression: data.progression || {
        system: 'levels',
        stages: []
      },
      learning: data.learning || {
        methods: [],
        institutions: [],
        requirements: [],
        timeframes: []
      },
      social: data.social || {
        practitioners: 'Mages',
        status: 'respected',
        organizations: [],
        regulations: []
      },
      worldInteraction: data.worldInteraction || {
        visibility: 'overt',
        commonUses: [],
        economicImpact: '',
        militaryUse: '',
        religiousViews: ''
      },
      consistencyRules: data.consistencyRules || [],
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.systems.set(system.id, system);
    return system;
  }

  getMagicSystem(id: string): MagicSystem | undefined {
    return this.systems.get(id);
  }

  updateMagicSystem(id: string, updates: Partial<MagicSystem>): MagicSystem | undefined {
    const system = this.systems.get(id);
    if (!system) return undefined;

    const updated = { ...system, ...updates, id: system.id, createdAt: system.createdAt, updatedAt: new Date() };
    this.systems.set(id, updated);
    return updated;
  }

  deleteMagicSystem(id: string): boolean {
    return this.systems.delete(id);
  }

  getAllMagicSystems(): MagicSystem[] {
    return Array.from(this.systems.values());
  }

  generateRandomMagicSystem(options: MagicSystemGenerationOptions = {}): MagicSystem {
    const theme = options.theme || 'arcane';
    const type = options.type || MagicSystemType.HYBRID;
    const hardness = options.hardness || this.randomInt(3, 8);

    const name = this.generateMagicSystemName(theme);
    const sources = this.generateSources(theme);
    const disciplines = this.generateDisciplinesForSystem(theme, options.schoolCount || 6);
    const laws = this.generateLaws(theme, hardness);
    const limitations = this.generateLimitations(theme, options.dangerLevel);
    const consequences = this.generateConsequences(theme, options.dangerLevel);

    return this.createMagicSystem({
      name,
      description: this.generateSystemDescription(name, theme, type),
      systemType: type,
      hardness,
      sources,
      energySystem: options.hasEnergySystem !== false ? this.generateEnergySystem(theme) : undefined,
      disciplines: disciplines.map(d => d.id),
      laws,
      limitations,
      consequences,
      progression: this.generateProgression(theme),
      learning: this.generateLearning(theme),
      social: this.generateSocial(theme),
      worldInteraction: this.generateWorldInteraction(theme),
      consistencyRules: this.generateConsistencyRules(laws, limitations),
      tags: [theme, type, `hardness-${hardness}`]
    });
  }

  // ===========================================================================
  // DISCIPLINE OPERATIONS
  // ===========================================================================

  createDiscipline(data: Partial<MagicDiscipline> & { name: string }): MagicDiscipline {
    const discipline: MagicDiscipline = {
      id: uuidv4(),
      name: data.name,
      school: data.school || MagicSchool.EVOCATION,
      description: data.description || '',
      philosophy: data.philosophy || '',
      primaryEffects: data.primaryEffects || [],
      secondaryEffects: data.secondaryEffects || [],
      prerequisites: data.prerequisites || { disciplines: [], abilities: [], traits: [] },
      learningDifficulty: data.learningDifficulty || 'moderate',
      learningMethods: data.learningMethods || [],
      learningTime: data.learningTime || '1 year',
      practitioners: data.practitioners || [],
      organizations: data.organizations || [],
      famousPractitioners: data.famousPractitioners || [],
      synergies: data.synergies || [],
      opposites: data.opposites || [],
      requiredFor: data.requiredFor || [],
      culturalViews: data.culturalViews || [],
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.disciplines.set(discipline.id, discipline);
    return discipline;
  }

  getDiscipline(id: string): MagicDiscipline | undefined {
    return this.disciplines.get(id);
  }

  getAllDisciplines(): MagicDiscipline[] {
    return Array.from(this.disciplines.values());
  }

  // ===========================================================================
  // ABILITY OPERATIONS
  // ===========================================================================

  createAbility(data: Partial<Ability> & { name: string }): Ability {
    const ability: Ability = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      flavorText: data.flavorText,
      discipline: data.discipline || '',
      school: data.school || MagicSchool.EVOCATION,
      powerLevel: data.powerLevel || PowerLevel.MINOR,
      source: data.source || MagicSource.ARCANE,
      effects: data.effects || [],
      costs: data.costs || [],
      casting: data.casting || {
        time: '1 action',
        verbal: true,
        somatic: true,
        concentration: false
      },
      requirements: data.requirements || {},
      limitations: data.limitations || { conditions: [], counters: [], immunities: [] },
      canImprove: data.canImprove ?? true,
      improvements: data.improvements,
      isSignature: data.isSignature || false,
      isRare: data.isRare || false,
      isForbidden: data.isForbidden || false,
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.abilities.set(ability.id, ability);
    return ability;
  }

  getAbility(id: string): Ability | undefined {
    return this.abilities.get(id);
  }

  getAllAbilities(): Ability[] {
    return Array.from(this.abilities.values());
  }

  getAbilitiesByDiscipline(disciplineId: string): Ability[] {
    return this.getAllAbilities().filter(a => a.discipline === disciplineId);
  }

  getAbilitiesBySchool(school: MagicSchool): Ability[] {
    return this.getAllAbilities().filter(a => a.school === school);
  }

  generateRandomAbility(disciplineId: string, powerLevel?: PowerLevel): Ability {
    const discipline = this.disciplines.get(disciplineId);
    const school = discipline?.school || this.randomChoice(Object.values(MagicSchool));
    const level = powerLevel || this.randomChoice(Object.values(PowerLevel).slice(0, 5));

    const name = this.generateAbilityName(school, level);

    return this.createAbility({
      name,
      description: this.generateAbilityDescription(name, school),
      discipline: disciplineId,
      school,
      powerLevel: level,
      source: MagicSource.ARCANE,
      effects: this.generateAbilityEffects(school, level),
      costs: this.generateAbilityCosts(level),
      casting: this.generateCasting(level),
      limitations: this.generateAbilityLimitations(level),
      tags: [school, level]
    });
  }

  // ===========================================================================
  // MAGICAL ITEM OPERATIONS
  // ===========================================================================

  createMagicalItem(data: Partial<MagicalItem> & { name: string }): MagicalItem {
    const item: MagicalItem = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      type: data.type || 'accessory',
      rarity: data.rarity || 'uncommon',
      properties: data.properties || [],
      grantedAbilities: data.grantedAbilities || [],
      requirements: data.requirements || { attunement: false },
      limitations: data.limitations || { cursed: false, sideEffects: [], restrictions: [] },
      history: data.history || {},
      appearance: data.appearance || '',
      materials: data.materials || [],
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.items.set(item.id, item);
    return item;
  }

  getMagicalItem(id: string): MagicalItem | undefined {
    return this.items.get(id);
  }

  getAllMagicalItems(): MagicalItem[] {
    return Array.from(this.items.values());
  }

  generateRandomMagicalItem(rarity?: MagicalItem['rarity']): MagicalItem {
    const itemRarity = rarity || this.randomChoice(['common', 'uncommon', 'rare', 'very_rare'] as MagicalItem['rarity'][]);
    const type = this.randomChoice(['weapon', 'armor', 'accessory', 'tool'] as MagicalItem['type'][]);

    const name = this.generateItemName(type, itemRarity);

    return this.createMagicalItem({
      name,
      description: `A ${itemRarity} magical ${type}`,
      type,
      rarity: itemRarity,
      properties: this.generateItemProperties(type, itemRarity),
      requirements: {
        attunement: itemRarity !== 'common',
        attunementRequirements: itemRarity === 'rare' || itemRarity === 'very_rare' ? ['Spellcaster'] : undefined
      },
      limitations: {
        cursed: this.random() < 0.1,
        sideEffects: [],
        restrictions: []
      },
      appearance: `An ornate ${type} with magical runes`,
      materials: ['Enchanted steel', 'Magical gemstones'],
      tags: [type, itemRarity]
    });
  }

  // ===========================================================================
  // GENERATION HELPERS
  // ===========================================================================

  private generateMagicSystemName(theme: string): string {
    const prefixes: Record<string, string[]> = {
      elemental: ['Primal', 'Elemental', 'Natural', 'Primordial'],
      divine: ['Sacred', 'Holy', 'Divine', 'Celestial'],
      arcane: ['Arcane', 'Mystic', 'Ancient', 'High'],
      nature: ['Druidic', 'Sylvan', 'Wild', 'Verdant'],
      psychic: ['Psionic', 'Mental', 'Mind', 'Thought'],
      blood: ['Blood', 'Crimson', 'Sanguine', 'Vital'],
      runic: ['Runic', 'Glyph', 'Sigil', 'Written'],
      musical: ['Sonic', 'Harmonic', 'Musical', 'Song']
    };

    const suffixes = ['Weaving', 'Craft', 'Arts', 'Ways', 'Path', 'Mysteries'];

    const prefix = this.randomChoice(prefixes[theme] || prefixes.arcane);
    const suffix = this.randomChoice(suffixes);

    return `The ${prefix} ${suffix}`;
  }

  private generateSystemDescription(name: string, theme: string, type: MagicSystemType): string {
    const themeDesc: Record<string, string> = {
      elemental: 'manipulation of the classical elements',
      divine: 'channeling divine power through faith',
      arcane: 'scholarly study of mystical forces',
      nature: 'communion with natural energies',
      psychic: 'harnessing the power of the mind',
      blood: 'using life force as magical fuel',
      runic: 'inscribing power into symbols',
      musical: 'weaving magic through sound and song'
    };

    return `${name} is a ${type} magic system based on ${themeDesc[theme] || 'mysterious forces'}.`;
  }

  private generateSources(theme: string): MagicSystem['sources'] {
    const themeSources: Record<string, MagicSource[]> = {
      elemental: [MagicSource.ELEMENTAL, MagicSource.NATURE],
      divine: [MagicSource.DIVINE, MagicSource.SPIRITUAL],
      arcane: [MagicSource.ARCANE, MagicSource.LEARNED],
      nature: [MagicSource.NATURE, MagicSource.SPIRITUAL],
      psychic: [MagicSource.INNATE, MagicSource.EMOTIONAL],
      blood: [MagicSource.BLOOD, MagicSource.FORBIDDEN],
      runic: [MagicSource.RUNIC, MagicSource.LEARNED],
      musical: [MagicSource.MUSICAL, MagicSource.EMOTIONAL]
    };

    const sources = themeSources[theme] || [MagicSource.ARCANE];

    return sources.map(source => ({
      source,
      description: `Magic drawn from ${source} forces`,
      availability: source === MagicSource.FORBIDDEN ? 'rare' : 'common' as const
    }));
  }

  private generateDisciplinesForSystem(theme: string, count: number): MagicDiscipline[] {
    const themeSchools: Record<string, MagicSchool[]> = {
      elemental: [MagicSchool.FIRE, MagicSchool.WATER, MagicSchool.EARTH, MagicSchool.AIR, MagicSchool.LIGHTNING, MagicSchool.ICE],
      divine: [MagicSchool.HEALING, MagicSchool.ABJURATION, MagicSchool.EVOCATION, MagicSchool.DIVINATION],
      arcane: [MagicSchool.EVOCATION, MagicSchool.CONJURATION, MagicSchool.TRANSMUTATION, MagicSchool.ILLUSION, MagicSchool.ENCHANTMENT],
      nature: [MagicSchool.BIOMANCY, MagicSchool.SHAPESHIFTING, MagicSchool.HEALING, MagicSchool.SUMMONING],
      psychic: [MagicSchool.TELEPATHY, MagicSchool.PSIONICS, MagicSchool.ILLUSION, MagicSchool.ENCHANTMENT],
      blood: [MagicSchool.BLOOD_MAGIC, MagicSchool.NECROMANCY, MagicSchool.BIOMANCY],
      runic: [MagicSchool.WARDING, MagicSchool.BINDING, MagicSchool.ENCHANTMENT],
      musical: [MagicSchool.ENCHANTMENT, MagicSchool.ILLUSION, MagicSchool.HEALING]
    };

    const schools = themeSchools[theme] || themeSchools.arcane;
    const selectedSchools = this.randomChoices(schools, count);

    return selectedSchools.map(school => this.createDiscipline({
      name: this.generateDisciplineName(school),
      school,
      description: `The study of ${school} magic`,
      philosophy: `Mastery over ${school} forces`,
      primaryEffects: this.getEffectsForSchool(school),
      learningDifficulty: 'moderate',
      learningMethods: [LearningMethod.STUDY, LearningMethod.PRACTICE],
      learningTime: '2 years'
    }));
  }

  private generateDisciplineName(school: MagicSchool): string {
    const names: Record<string, string> = {
      [MagicSchool.FIRE]: 'Pyromancy',
      [MagicSchool.WATER]: 'Hydromancy',
      [MagicSchool.EARTH]: 'Geomancy',
      [MagicSchool.AIR]: 'Aeromancy',
      [MagicSchool.LIGHTNING]: 'Electromancy',
      [MagicSchool.ICE]: 'Cryomancy',
      [MagicSchool.HEALING]: 'Restoration Arts',
      [MagicSchool.NECROMANCY]: 'Death Magic',
      [MagicSchool.ILLUSION]: 'Phantasmal Arts',
      [MagicSchool.TELEPATHY]: 'Mind Arts',
      [MagicSchool.DIVINATION]: 'Seeing Arts',
      [MagicSchool.TRANSMUTATION]: 'Transmutation',
      [MagicSchool.SHAPESHIFTING]: 'Morphic Arts',
      [MagicSchool.SUMMONING]: 'Conjuration',
      [MagicSchool.EVOCATION]: 'Evocation',
      [MagicSchool.ABJURATION]: 'Protection Arts'
    };

    return names[school] || `${school.charAt(0).toUpperCase() + school.slice(1)} Magic`;
  }

  private getEffectsForSchool(school: MagicSchool): EffectType[] {
    const effects: Record<string, EffectType[]> = {
      [MagicSchool.FIRE]: [EffectType.DAMAGE, EffectType.DESTRUCTION],
      [MagicSchool.HEALING]: [EffectType.HEALING, EffectType.BUFF],
      [MagicSchool.ILLUSION]: [EffectType.ILLUSION, EffectType.DEBUFF],
      [MagicSchool.SUMMONING]: [EffectType.SUMMON, EffectType.CONTROL],
      [MagicSchool.TRANSMUTATION]: [EffectType.TRANSFORM, EffectType.BUFF],
      [MagicSchool.ABJURATION]: [EffectType.WARD, EffectType.BUFF],
      [MagicSchool.EVOCATION]: [EffectType.DAMAGE, EffectType.DESTRUCTION]
    };

    return effects[school] || [EffectType.UTILITY];
  }

  private generateLaws(theme: string, hardness: number): MagicSystem['laws'] {
    const laws: MagicSystem['laws'] = [];

    // Universal laws
    laws.push({
      name: 'Conservation of Energy',
      description: 'Magic requires energy to cast; nothing comes from nothing',
      exceptions: hardness < 5 ? ['Divine intervention', 'Artifacts'] : []
    });

    if (hardness >= 5) {
      laws.push({
        name: 'Equivalent Exchange',
        description: 'The effect must be proportional to the cost paid',
        exceptions: []
      });
    }

    if (hardness >= 7) {
      laws.push({
        name: 'Law of Limitation',
        description: 'Magic cannot create true life, resurrect the truly dead, or alter fundamental laws',
        exceptions: ['Legendary artifacts', 'Divine direct action']
      });
    }

    // Theme-specific laws
    if (theme === 'blood') {
      laws.push({
        name: 'Law of Blood Price',
        description: 'Blood magic always requires blood as payment',
        exceptions: []
      });
    }

    if (theme === 'runic') {
      laws.push({
        name: 'Law of Inscription',
        description: 'Runes must be properly inscribed to function',
        exceptions: ['Master runesmiths']
      });
    }

    return laws;
  }

  private generateLimitations(theme: string, dangerLevel?: string): MagicSystem['limitations'] {
    const limitations: MagicSystem['limitations'] = [];

    limitations.push({
      name: 'Mental Fatigue',
      description: 'Overuse of magic causes exhaustion',
      category: 'mental'
    });

    limitations.push({
      name: 'Range Limitation',
      description: 'Magic effectiveness decreases with distance',
      category: 'physical'
    });

    if (dangerLevel === 'dangerous' || dangerLevel === 'deadly') {
      limitations.push({
        name: 'Backlash Risk',
        description: 'Failed spells can harm the caster',
        category: 'physical'
      });
    }

    if (theme === 'divine') {
      limitations.push({
        name: 'Divine Favor',
        description: 'Magic requires maintaining the deity\'s favor',
        category: 'spiritual'
      });
    }

    return limitations;
  }

  private generateConsequences(theme: string, dangerLevel?: string): MagicSystem['consequences'] {
    const consequences: MagicSystem['consequences'] = [];

    consequences.push({
      name: 'Mana Exhaustion',
      trigger: 'Depleting magical reserves',
      effect: 'Unconsciousness and inability to cast',
      severity: 'moderate'
    });

    if (dangerLevel === 'dangerous' || dangerLevel === 'deadly') {
      consequences.push({
        name: 'Magical Corruption',
        trigger: 'Overuse of dark or forbidden magic',
        effect: 'Physical and mental degradation',
        severity: 'severe'
      });

      consequences.push({
        name: 'Wild Magic Surge',
        trigger: 'Failed high-power casting',
        effect: 'Unpredictable magical effects',
        severity: 'severe'
      });
    }

    if (theme === 'blood') {
      consequences.push({
        name: 'Blood Addiction',
        trigger: 'Frequent blood magic use',
        effect: 'Compulsion to use more blood magic',
        severity: 'severe'
      });
    }

    return consequences;
  }

  private generateEnergySystem(theme: string): MagicSystem['energySystem'] {
    const names: Record<string, string> = {
      elemental: 'Elemental Essence',
      divine: 'Divine Grace',
      arcane: 'Mana',
      nature: 'Life Force',
      psychic: 'Psi Points',
      blood: 'Vitae',
      runic: 'Runescript',
      musical: 'Harmony'
    };

    return {
      name: names[theme] || 'Mana',
      description: `The magical energy that powers ${theme} magic`,
      baseCapacity: 100,
      regeneration: {
        rate: 10,
        method: 'Rest and meditation'
      },
      enhancementMethods: ['Training', 'Artifacts', 'Rituals']
    };
  }

  private generateProgression(_theme: string): MagicSystem['progression'] {
    return {
      system: 'tiers',
      stages: [
        { name: 'Novice', requirements: ['Basic training'], capabilities: ['Cantrips only'] },
        { name: 'Apprentice', requirements: ['1 year study'], capabilities: ['Minor spells'] },
        { name: 'Journeyman', requirements: ['3 years study'], capabilities: ['Moderate spells'] },
        { name: 'Adept', requirements: ['5 years study', 'Trials passed'], capabilities: ['Major spells'] },
        { name: 'Master', requirements: ['10 years study', 'Original contribution'], capabilities: ['Greater spells'] },
        { name: 'Archmage', requirements: ['20 years mastery', 'Legendary deed'], capabilities: ['Legendary spells'] }
      ]
    };
  }

  private generateLearning(_theme: string): MagicSystem['learning'] {
    return {
      methods: [LearningMethod.STUDY, LearningMethod.PRACTICE, LearningMethod.MEDITATION],
      institutions: ['Academies', 'Guilds', 'Temples', 'Apprenticeships'],
      requirements: ['Magical aptitude', 'Intelligence', 'Dedication'],
      timeframes: [
        { level: 'Basic competency', time: '1 year' },
        { level: 'Journeyman', time: '5 years' },
        { level: 'Mastery', time: '10+ years' }
      ]
    };
  }

  private generateSocial(theme: string): MagicSystem['social'] {
    return {
      practitioners: theme === 'divine' ? 'Priests' : theme === 'nature' ? 'Druids' : 'Mages',
      status: theme === 'blood' ? 'feared' : 'respected',
      organizations: ['The Academy', 'The Circle', 'The Guild'],
      regulations: ['Registration required', 'Forbidden spells banned', 'Dueling regulated']
    };
  }

  private generateWorldInteraction(theme: string): MagicSystem['worldInteraction'] {
    return {
      visibility: 'overt',
      commonUses: ['Healing', 'Construction', 'Communication', 'Defense'],
      economicImpact: 'Magic items are valuable trade goods; mages command high fees',
      militaryUse: 'Battle mages are elite units; magical defenses protect cities',
      religiousViews: theme === 'divine' ? 'Central to worship' : 'Accepted as gift from gods'
    };
  }

  private generateConsistencyRules(laws: MagicSystem['laws'], _limitations: MagicSystem['limitations']): MagicSystem['consistencyRules'] {
    const rules: MagicSystem['consistencyRules'] = [];

    for (const law of laws) {
      rules.push({
        id: uuidv4(),
        rule: law.name,
        enforcement: `Check: ${law.description}`
      });
    }

    return rules;
  }

  private generateAbilityName(school: MagicSchool, level: PowerLevel): string {
    const schoolPrefixes: Record<string, string[]> = {
      [MagicSchool.FIRE]: ['Flame', 'Fire', 'Blaze', 'Inferno'],
      [MagicSchool.ICE]: ['Frost', 'Ice', 'Freeze', 'Glacier'],
      [MagicSchool.LIGHTNING]: ['Lightning', 'Thunder', 'Shock', 'Storm'],
      [MagicSchool.HEALING]: ['Heal', 'Restore', 'Mend', 'Cure'],
      [MagicSchool.ILLUSION]: ['Phantom', 'Shadow', 'Mirror', 'Veil'],
      [MagicSchool.EVOCATION]: ['Arcane', 'Force', 'Energy', 'Magic']
    };

    const levelSuffixes: Record<string, string[]> = {
      [PowerLevel.CANTRIP]: ['Spark', 'Touch', 'Wisp'],
      [PowerLevel.MINOR]: ['Bolt', 'Ray', 'Wave'],
      [PowerLevel.MODERATE]: ['Blast', 'Strike', 'Burst'],
      [PowerLevel.MAJOR]: ['Storm', 'Torrent', 'Nova'],
      [PowerLevel.GREATER]: ['Cataclysm', 'Apocalypse', 'Annihilation']
    };

    const prefix = this.randomChoice(schoolPrefixes[school] || ['Magic']);
    const suffix = this.randomChoice(levelSuffixes[level] || ['Spell']);

    return `${prefix} ${suffix}`;
  }

  private generateAbilityDescription(_name: string, school: MagicSchool): string {
    return `A ${school} spell that channels magical energy.`;
  }

  private generateAbilityEffects(school: MagicSchool, level: PowerLevel): Ability['effects'] {
    const magnitudes: Record<string, string> = {
      [PowerLevel.CANTRIP]: '1d4',
      [PowerLevel.MINOR]: '2d6',
      [PowerLevel.MODERATE]: '4d6',
      [PowerLevel.MAJOR]: '8d6',
      [PowerLevel.GREATER]: '12d6'
    };

    return [{
      type: this.getEffectsForSchool(school)[0],
      description: `Primary effect of the spell`,
      magnitude: magnitudes[level] || '2d6',
      duration: level === PowerLevel.CANTRIP ? 'Instant' : '1 minute',
      range: '30 feet'
    }];
  }

  private generateAbilityCosts(level: PowerLevel): Ability['costs'] {
    const costs: Record<string, number> = {
      [PowerLevel.CANTRIP]: 0,
      [PowerLevel.MINOR]: 5,
      [PowerLevel.MODERATE]: 15,
      [PowerLevel.MAJOR]: 30,
      [PowerLevel.GREATER]: 60
    };

    return [{
      type: CostType.MANA,
      amount: costs[level] || 10
    }];
  }

  private generateCasting(level: PowerLevel): Ability['casting'] {
    return {
      time: level === PowerLevel.CANTRIP ? '1 action' : level === PowerLevel.MAJOR ? '1 minute' : '1 action',
      verbal: true,
      somatic: true,
      concentration: level !== PowerLevel.CANTRIP && level !== PowerLevel.MINOR
    };
  }

  private generateAbilityLimitations(level: PowerLevel): Ability['limitations'] {
    return {
      usesPerDay: level === PowerLevel.MAJOR ? 3 : level === PowerLevel.GREATER ? 1 : undefined,
      cooldown: level === PowerLevel.GREATER ? '1 hour' : undefined,
      conditions: [],
      counters: ['Dispel Magic', 'Antimagic'],
      immunities: []
    };
  }

  private generateItemName(type: string, rarity: string): string {
    const prefixes: Record<string, string[]> = {
      common: ['Simple', 'Basic', 'Minor'],
      uncommon: ['Enchanted', 'Blessed', 'Arcane'],
      rare: ['Magnificent', 'Radiant', 'Mystical'],
      very_rare: ['Legendary', 'Ancient', 'Divine']
    };

    const typeNames: Record<string, string[]> = {
      weapon: ['Sword', 'Staff', 'Dagger', 'Bow'],
      armor: ['Shield', 'Helm', 'Breastplate', 'Gauntlets'],
      accessory: ['Ring', 'Amulet', 'Cloak', 'Bracelet'],
      tool: ['Orb', 'Wand', 'Rod', 'Tome']
    };

    const prefix = this.randomChoice(prefixes[rarity] || prefixes.uncommon);
    const name = this.randomChoice(typeNames[type] || typeNames.accessory);

    return `${prefix} ${name}`;
  }

  private generateItemProperties(_type: string, rarity: string): MagicalItem['properties'] {
    const count = rarity === 'common' ? 1 : rarity === 'uncommon' ? 2 : rarity === 'rare' ? 3 : 4;

    const possibleProperties = [
      { name: '+1 Enhancement', description: 'Grants +1 bonus' },
      { name: 'Glowing', description: 'Emits soft light' },
      { name: 'Returning', description: 'Returns to owner when thrown' },
      { name: 'Lucky', description: 'Grants luck bonus' },
      { name: 'Spell Storing', description: 'Can store a spell', charges: 3 }
    ];

    return this.randomChoices(possibleProperties, count);
  }

  // ===========================================================================
  // EXPORT & UTILITY
  // ===========================================================================

  exportToJSON(): string {
    return JSON.stringify({
      systems: Array.from(this.systems.values()),
      disciplines: Array.from(this.disciplines.values()),
      abilities: Array.from(this.abilities.values()),
      items: Array.from(this.items.values())
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.systems) {
      for (const system of data.systems) {
        this.systems.set(system.id, { ...system, createdAt: new Date(system.createdAt), updatedAt: new Date(system.updatedAt) });
      }
    }
    if (data.disciplines) {
      for (const disc of data.disciplines) {
        this.disciplines.set(disc.id, { ...disc, createdAt: new Date(disc.createdAt), updatedAt: new Date(disc.updatedAt) });
      }
    }
    if (data.abilities) {
      for (const ability of data.abilities) {
        this.abilities.set(ability.id, { ...ability, createdAt: new Date(ability.createdAt), updatedAt: new Date(ability.updatedAt) });
      }
    }
    if (data.items) {
      for (const item of data.items) {
        this.items.set(item.id, { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) });
      }
    }
  }

  generateSystemMarkdown(systemId: string): string {
    const system = this.systems.get(systemId);
    if (!system) return '';

    let md = `# ${system.name}\n\n`;
    md += `${system.description}\n\n`;

    md += `## Overview\n`;
    md += `- **Type:** ${system.systemType}\n`;
    md += `- **Hardness:** ${system.hardness}/10\n\n`;

    if (system.energySystem) {
      md += `## Energy System: ${system.energySystem.name}\n`;
      md += `${system.energySystem.description}\n`;
      md += `- **Base Capacity:** ${system.energySystem.baseCapacity}\n`;
      md += `- **Regeneration:** ${system.energySystem.regeneration.rate} per ${system.energySystem.regeneration.method}\n\n`;
    }

    md += `## Fundamental Laws\n`;
    for (const law of system.laws) {
      md += `### ${law.name}\n`;
      md += `${law.description}\n\n`;
    }

    md += `## Limitations\n`;
    for (const limit of system.limitations) {
      md += `- **${limit.name}:** ${limit.description}\n`;
    }
    md += `\n`;

    md += `## Consequences\n`;
    for (const cons of system.consequences) {
      md += `### ${cons.name}\n`;
      md += `- **Trigger:** ${cons.trigger}\n`;
      md += `- **Effect:** ${cons.effect}\n`;
      md += `- **Severity:** ${cons.severity}\n\n`;
    }

    return md;
  }
}

export default MagicSystemDesigner;
