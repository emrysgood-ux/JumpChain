/**
 * Epic Fiction Architect - Religion/Pantheon Designer
 *
 * Comprehensive system for designing religions, pantheons, and belief systems.
 * Integrates with Calendar Engine for religious holidays and Culture Designer
 * for cultural religious practices.
 *
 * Features:
 * - Deity creation and pantheon structure
 * - Creation myths and cosmology
 * - Religious hierarchy and clergy
 * - Sacred texts and teachings
 * - Rituals and practices
 * - Holy sites and temples
 * - Schisms and denominations
 * - Afterlife beliefs
 * - Divine intervention rules
 * - Random generation with theological themes
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum ReligionType {
  MONOTHEISM = 'monotheism',
  POLYTHEISM = 'polytheism',
  HENOTHEISM = 'henotheism',      // One god supreme, others exist
  DUALISM = 'dualism',            // Two opposing forces
  ANIMISM = 'animism',
  ANCESTOR_WORSHIP = 'ancestor_worship',
  TOTEMISM = 'totemism',
  SHAMANISM = 'shamanism',
  PANTHEISM = 'pantheism',        // Divine in everything
  DEISM = 'deism',                // Creator who doesn't intervene
  ATHEISTIC = 'atheistic',        // Philosophy without gods
  MYSTERY_CULT = 'mystery_cult'
}

export enum DeityRank {
  SUPREME = 'supreme',            // Creator/ruler of all
  GREATER = 'greater',            // Major gods
  INTERMEDIATE = 'intermediate',  // Mid-tier gods
  LESSER = 'lesser',              // Minor gods
  DEMIGOD = 'demigod',            // Half-divine
  SPIRIT = 'spirit',              // Nature spirits, etc.
  SAINT = 'saint',                // Elevated mortals
  AVATAR = 'avatar'               // Divine incarnation
}

export enum DivineDomain {
  // Natural
  SUN = 'sun',
  MOON = 'moon',
  SKY = 'sky',
  EARTH = 'earth',
  SEA = 'sea',
  STORMS = 'storms',
  FIRE = 'fire',
  NATURE = 'nature',
  ANIMALS = 'animals',
  HARVEST = 'harvest',

  // Life & Death
  LIFE = 'life',
  DEATH = 'death',
  HEALING = 'healing',
  DISEASE = 'disease',
  FERTILITY = 'fertility',

  // Civilization
  WAR = 'war',
  PEACE = 'peace',
  JUSTICE = 'justice',
  KNOWLEDGE = 'knowledge',
  WISDOM = 'wisdom',
  CRAFT = 'craft',
  COMMERCE = 'commerce',
  HEARTH = 'hearth',
  TRAVEL = 'travel',

  // Abstract
  LOVE = 'love',
  BEAUTY = 'beauty',
  FATE = 'fate',
  TIME = 'time',
  LUCK = 'luck',
  CHAOS = 'chaos',
  ORDER = 'order',
  MAGIC = 'magic',
  DREAMS = 'dreams',
  TRUTH = 'truth',
  TRICKERY = 'trickery',

  // Dark
  DARKNESS = 'darkness',
  DESTRUCTION = 'destruction',
  VENGEANCE = 'vengeance',
  UNDEATH = 'undeath'
}

export enum Alignment {
  GOOD = 'good',
  NEUTRAL = 'neutral',
  EVIL = 'evil',
  LAWFUL = 'lawful',
  CHAOTIC = 'chaotic',
  LAWFUL_GOOD = 'lawful_good',
  LAWFUL_NEUTRAL = 'lawful_neutral',
  LAWFUL_EVIL = 'lawful_evil',
  NEUTRAL_GOOD = 'neutral_good',
  TRUE_NEUTRAL = 'true_neutral',
  NEUTRAL_EVIL = 'neutral_evil',
  CHAOTIC_GOOD = 'chaotic_good',
  CHAOTIC_NEUTRAL = 'chaotic_neutral',
  CHAOTIC_EVIL = 'chaotic_evil'
}

export enum ClergyType {
  PRIEST = 'priest',
  PRIESTESS = 'priestess',
  SHAMAN = 'shaman',
  DRUID = 'druid',
  MONK = 'monk',
  NUN = 'nun',
  ORACLE = 'oracle',
  PROPHET = 'prophet',
  PALADIN = 'paladin',
  INQUISITOR = 'inquisitor',
  MYSTIC = 'mystic',
  HERMIT = 'hermit'
}

export enum RitualType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SEASONAL = 'seasonal',
  ANNUAL = 'annual',
  LIFE_EVENT = 'life_event',
  CRISIS = 'crisis',
  INITIATION = 'initiation'
}

export enum AfterlifeType {
  PARADISE = 'paradise',
  HELL = 'hell',
  PURGATORY = 'purgatory',
  REINCARNATION = 'reincarnation',
  SPIRIT_WORLD = 'spirit_world',
  ANCESTOR_REALM = 'ancestor_realm',
  OBLIVION = 'oblivion',
  MERGER_WITH_DIVINE = 'merger_with_divine',
  JUDGMENT = 'judgment',
  MULTIPLE_REALMS = 'multiple_realms'
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * A deity or divine being
 */
export interface Deity {
  id: string;
  name: string;
  titles: string[];
  epithets: string[];
  rank: DeityRank;
  domains: DivineDomain[];
  alignment: Alignment;

  // Appearance
  appearance: {
    description: string;
    humanoid: boolean;
    forms: string[];
    sacredAnimals: string[];
    sacredPlants: string[];
  };

  // Symbols
  symbols: {
    primary: string;
    secondary: string[];
    colors: string[];
    numbers: number[];
  };

  // Personality
  personality: {
    traits: string[];
    virtues: string[];
    vices: string[];
    temperament: string;
  };

  // Relationships
  relationships: {
    parents: string[];      // Deity IDs
    children: string[];
    consorts: string[];
    siblings: string[];
    allies: string[];
    enemies: string[];
  };

  // Power
  powers: string[];
  artifacts: {
    name: string;
    description: string;
    powers: string[];
  }[];
  servitors: string[];    // Angels, demons, etc.

  // Worship
  worship: {
    primaryWorshippers: string[];
    favoritedGroups: string[];
    taboos: string[];
    offerings: string[];
    prayerTimes: string[];
    holyDays: string[];
  };

  // Mythology
  mythology: {
    origin: string;
    majorMyths: string[];
    prophesies: string[];
  };

  // Game mechanics (optional)
  clericDomains?: string[];
  grantedPowers?: string[];

  // Status
  isActive: boolean;      // Still worshipped?
  isReal: boolean;        // Actually exists in world?

  createdAt: Date;
  updatedAt: Date;
}

/**
 * A pantheon of deities
 */
export interface Pantheon {
  id: string;
  name: string;
  description: string;

  // Structure
  type: ReligionType;
  deities: string[];      // Deity IDs
  hierarchy: {
    deityId: string;
    rank: DeityRank;
    role: string;
  }[];

  // Cosmology
  cosmology: {
    creationMyth: string;
    worldStructure: string;
    planes: {
      name: string;
      description: string;
      ruler?: string;
    }[];
  };

  // Relationships between gods
  divineRelationships: {
    deity1Id: string;
    deity2Id: string;
    relationship: 'parent' | 'child' | 'sibling' | 'consort' | 'ally' | 'rival' | 'enemy';
  }[];

  // Common elements
  commonSymbols: string[];
  sacredLanguage?: string;
  creatorDeity?: string;

  // History
  origin: string;
  majorEvents: { event: string; result: string }[];

  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A complete religion
 */
export interface Religion {
  id: string;
  name: string;
  description: string;

  // Type and beliefs
  type: ReligionType;
  pantheonId?: string;
  monotheisticDeityId?: string;

  // Core beliefs
  beliefs: {
    coreTenets: string[];
    creationMyth: string;
    purpose: string;        // What is the meaning of existence?
    morality: string;       // Basis for right and wrong
    salvation: string;      // How to achieve ultimate good
  };

  // Afterlife
  afterlife: {
    type: AfterlifeType;
    heavens: { name: string; description: string; requirements: string }[];
    hells: { name: string; description: string; sins: string }[];
    judgmentProcess: string;
    reincarnationRules?: string;
  };

  // Sacred texts
  sacredTexts: {
    name: string;
    description: string;
    contents: string;
    authority: 'divine' | 'inspired' | 'traditional' | 'philosophical';
    languages: string[];
  }[];

  // Clergy
  clergy: {
    title: ClergyType;
    requirements: string[];
    duties: string[];
    privileges: string[];
    restrictions: string[];
    hierarchy: string[];
  }[];

  // Religious practices
  practices: {
    dailyPractices: string[];
    weeklyPractices: string[];
    prohibitions: string[];
    dietaryLaws: string[];
    dressCode: string[];
  };

  // Rituals
  rituals: {
    id: string;
    name: string;
    type: RitualType;
    description: string;
    timing: string;
    participants: string[];
    requirements: string[];
    steps: string[];
    significance: string;
  }[];

  // Holy sites
  holySites: {
    id: string;
    name: string;
    type: 'temple' | 'shrine' | 'natural' | 'historical' | 'pilgrimage';
    location: string;
    description: string;
    significance: string;
    pilgrimageInfo?: string;
  }[];

  // Organization
  organization: {
    structure: 'hierarchical' | 'decentralized' | 'monastic' | 'congregational';
    headquarters?: string;
    leaderTitle?: string;
    councils: { name: string; role: string }[];
    orders: { name: string; focus: string }[];
  };

  // Demographics
  demographics: {
    followers: number;
    distribution: string[];   // Where practiced
    majorCultures: string[];  // Culture IDs
    growthTrend: 'growing' | 'stable' | 'declining' | 'persecuted';
  };

  // Schisms and denominations
  denominations: {
    id: string;
    name: string;
    description: string;
    differences: string[];
    founded: string;
    adherents: number;
  }[];

  // Relations with others
  relations: {
    religionId: string;
    attitude: 'allied' | 'tolerant' | 'neutral' | 'suspicious' | 'hostile' | 'warring';
    history: string;
  }[];

  // Divine intervention
  divineIntervention: {
    frequency: 'never' | 'rare' | 'occasional' | 'common' | 'constant';
    types: string[];
    conditions: string[];
    miracles: string[];
  };

  // History
  history: {
    founding: string;
    founder?: string;
    majorEvents: { date: string; event: string }[];
    persecutions: string[];
    reformations: string[];
  };

  // Symbols and aesthetics
  symbols: {
    primary: string;
    secondary: string[];
    colors: string[];
    architecture: string;
    music: string;
    art: string;
  };

  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generation options
 */
export interface ReligionGenerationOptions {
  type?: ReligionType;
  theme?: 'light' | 'dark' | 'nature' | 'war' | 'knowledge' | 'mystery' | 'ancestor' | 'elemental';
  deityCount?: number;
  hasAfterlife?: boolean;
  divineIntervention?: 'active' | 'passive' | 'none';
  alignment?: Alignment;
}

export interface DeityGenerationOptions {
  rank?: DeityRank;
  domains?: DivineDomain[];
  alignment?: Alignment;
  theme?: string;
}

// ============================================================================
// RELIGION DESIGNER CLASS
// ============================================================================

export class ReligionDesigner {
  private religions: Map<string, Religion> = new Map();
  private pantheons: Map<string, Pantheon> = new Map();
  private deities: Map<string, Deity> = new Map();
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
  // DEITY OPERATIONS
  // ===========================================================================

  createDeity(data: Partial<Deity> & { name: string }): Deity {
    const deity: Deity = {
      id: uuidv4(),
      name: data.name,
      titles: data.titles || [],
      epithets: data.epithets || [],
      rank: data.rank || DeityRank.INTERMEDIATE,
      domains: data.domains || [],
      alignment: data.alignment || Alignment.TRUE_NEUTRAL,
      appearance: data.appearance || {
        description: '',
        humanoid: true,
        forms: [],
        sacredAnimals: [],
        sacredPlants: []
      },
      symbols: data.symbols || {
        primary: '',
        secondary: [],
        colors: [],
        numbers: []
      },
      personality: data.personality || {
        traits: [],
        virtues: [],
        vices: [],
        temperament: ''
      },
      relationships: data.relationships || {
        parents: [],
        children: [],
        consorts: [],
        siblings: [],
        allies: [],
        enemies: []
      },
      powers: data.powers || [],
      artifacts: data.artifacts || [],
      servitors: data.servitors || [],
      worship: data.worship || {
        primaryWorshippers: [],
        favoritedGroups: [],
        taboos: [],
        offerings: [],
        prayerTimes: [],
        holyDays: []
      },
      mythology: data.mythology || {
        origin: '',
        majorMyths: [],
        prophesies: []
      },
      clericDomains: data.clericDomains,
      grantedPowers: data.grantedPowers,
      isActive: data.isActive ?? true,
      isReal: data.isReal ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.deities.set(deity.id, deity);
    return deity;
  }

  getDeity(id: string): Deity | undefined {
    return this.deities.get(id);
  }

  getDeityByName(name: string): Deity | undefined {
    for (const deity of this.deities.values()) {
      if (deity.name.toLowerCase() === name.toLowerCase()) {
        return deity;
      }
    }
    return undefined;
  }

  updateDeity(id: string, updates: Partial<Deity>): Deity | undefined {
    const deity = this.deities.get(id);
    if (!deity) return undefined;

    const updated = { ...deity, ...updates, id: deity.id, createdAt: deity.createdAt, updatedAt: new Date() };
    this.deities.set(id, updated);
    return updated;
  }

  deleteDeity(id: string): boolean {
    return this.deities.delete(id);
  }

  getAllDeities(): Deity[] {
    return Array.from(this.deities.values());
  }

  generateRandomDeity(options: DeityGenerationOptions = {}): Deity {
    const rank = options.rank || this.randomChoice(Object.values(DeityRank).slice(0, 5));
    const domains = options.domains || this.randomChoices(Object.values(DivineDomain), this.randomInt(1, 3));
    const alignment = options.alignment || this.randomChoice(Object.values(Alignment));

    const name = this.generateDeityName(domains[0]);
    const titles = this.generateDeityTitles(domains, rank);

    return this.createDeity({
      name,
      titles,
      epithets: this.generateEpithets(domains),
      rank,
      domains,
      alignment,
      appearance: this.generateDeityAppearance(domains, alignment),
      symbols: this.generateDeitySymbols(domains),
      personality: this.generateDeityPersonality(domains, alignment),
      powers: this.generateDeityPowers(domains),
      worship: this.generateDeityWorship(domains),
      mythology: {
        origin: this.generateDeityOrigin(rank),
        majorMyths: ['The Great Deed', 'The Divine Contest'],
        prophesies: []
      }
    });
  }

  // ===========================================================================
  // PANTHEON OPERATIONS
  // ===========================================================================

  createPantheon(data: Partial<Pantheon> & { name: string }): Pantheon {
    const pantheon: Pantheon = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      type: data.type || ReligionType.POLYTHEISM,
      deities: data.deities || [],
      hierarchy: data.hierarchy || [],
      cosmology: data.cosmology || {
        creationMyth: '',
        worldStructure: '',
        planes: []
      },
      divineRelationships: data.divineRelationships || [],
      commonSymbols: data.commonSymbols || [],
      sacredLanguage: data.sacredLanguage,
      creatorDeity: data.creatorDeity,
      origin: data.origin || '',
      majorEvents: data.majorEvents || [],
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.pantheons.set(pantheon.id, pantheon);
    return pantheon;
  }

  getPantheon(id: string): Pantheon | undefined {
    return this.pantheons.get(id);
  }

  updatePantheon(id: string, updates: Partial<Pantheon>): Pantheon | undefined {
    const pantheon = this.pantheons.get(id);
    if (!pantheon) return undefined;

    const updated = { ...pantheon, ...updates, id: pantheon.id, createdAt: pantheon.createdAt, updatedAt: new Date() };
    this.pantheons.set(id, updated);
    return updated;
  }

  generateRandomPantheon(deityCount: number = 7, theme?: string): Pantheon {
    const name = this.generatePantheonName();
    const deities: Deity[] = [];

    // Generate supreme deity
    deities.push(this.generateRandomDeity({
      rank: DeityRank.SUPREME,
      domains: [DivineDomain.SKY, DivineDomain.ORDER]
    }));

    // Generate major deities for key domains
    const majorDomains = [DivineDomain.WAR, DivineDomain.LOVE, DivineDomain.DEATH,
                         DivineDomain.SEA, DivineDomain.WISDOM, DivineDomain.HARVEST];

    for (let i = 0; i < Math.min(deityCount - 1, majorDomains.length); i++) {
      deities.push(this.generateRandomDeity({
        rank: DeityRank.GREATER,
        domains: [majorDomains[i]]
      }));
    }

    const pantheon = this.createPantheon({
      name,
      description: `The ${name} pantheon consists of ${deities.length} major deities`,
      type: ReligionType.POLYTHEISM,
      deities: deities.map(d => d.id),
      hierarchy: deities.map(d => ({
        deityId: d.id,
        rank: d.rank,
        role: d.domains[0]
      })),
      cosmology: this.generateCosmology(name, deities[0].id),
      creatorDeity: deities[0].id,
      origin: 'Time immemorial'
    });

    return pantheon;
  }

  // ===========================================================================
  // RELIGION OPERATIONS
  // ===========================================================================

  createReligion(data: Partial<Religion> & { name: string }): Religion {
    const religion: Religion = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      type: data.type || ReligionType.POLYTHEISM,
      pantheonId: data.pantheonId,
      monotheisticDeityId: data.monotheisticDeityId,
      beliefs: data.beliefs || {
        coreTenets: [],
        creationMyth: '',
        purpose: '',
        morality: '',
        salvation: ''
      },
      afterlife: data.afterlife || {
        type: AfterlifeType.JUDGMENT,
        heavens: [],
        hells: [],
        judgmentProcess: ''
      },
      sacredTexts: data.sacredTexts || [],
      clergy: data.clergy || [],
      practices: data.practices || {
        dailyPractices: [],
        weeklyPractices: [],
        prohibitions: [],
        dietaryLaws: [],
        dressCode: []
      },
      rituals: data.rituals || [],
      holySites: data.holySites || [],
      organization: data.organization || {
        structure: 'hierarchical',
        councils: [],
        orders: []
      },
      demographics: data.demographics || {
        followers: 0,
        distribution: [],
        majorCultures: [],
        growthTrend: 'stable'
      },
      denominations: data.denominations || [],
      relations: data.relations || [],
      divineIntervention: data.divineIntervention || {
        frequency: 'rare',
        types: [],
        conditions: [],
        miracles: []
      },
      history: data.history || {
        founding: '',
        majorEvents: [],
        persecutions: [],
        reformations: []
      },
      symbols: data.symbols || {
        primary: '',
        secondary: [],
        colors: [],
        architecture: '',
        music: '',
        art: ''
      },
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.religions.set(religion.id, religion);
    return religion;
  }

  getReligion(id: string): Religion | undefined {
    return this.religions.get(id);
  }

  updateReligion(id: string, updates: Partial<Religion>): Religion | undefined {
    const religion = this.religions.get(id);
    if (!religion) return undefined;

    const updated = { ...religion, ...updates, id: religion.id, createdAt: religion.createdAt, updatedAt: new Date() };
    this.religions.set(id, updated);
    return updated;
  }

  deleteReligion(id: string): boolean {
    return this.religions.delete(id);
  }

  getAllReligions(): Religion[] {
    return Array.from(this.religions.values());
  }

  generateRandomReligion(options: ReligionGenerationOptions = {}): Religion {
    const type = options.type || this.randomChoice(Object.values(ReligionType).slice(0, 8));
    const theme = options.theme || 'light';

    let pantheonId: string | undefined;
    let monotheisticDeityId: string | undefined;

    if (type === ReligionType.POLYTHEISM) {
      const pantheon = this.generateRandomPantheon(options.deityCount || 7);
      pantheonId = pantheon.id;
    } else if (type === ReligionType.MONOTHEISM) {
      const deity = this.generateRandomDeity({ rank: DeityRank.SUPREME });
      monotheisticDeityId = deity.id;
    }

    const name = this.generateReligionName(type);

    return this.createReligion({
      name,
      description: this.generateReligionDescription(name, type),
      type,
      pantheonId,
      monotheisticDeityId,
      beliefs: this.generateBeliefs(type, theme),
      afterlife: this.generateAfterlife(theme),
      sacredTexts: this.generateSacredTexts(name),
      clergy: this.generateClergy(type),
      practices: this.generatePractices(theme),
      rituals: this.generateRituals(type),
      holySites: this.generateHolySites(name),
      organization: this.generateOrganization(type),
      demographics: {
        followers: this.randomInt(10000, 10000000),
        distribution: ['Major cities', 'Rural areas'],
        majorCultures: [],
        growthTrend: this.randomChoice(['growing', 'stable', 'declining'])
      },
      divineIntervention: this.generateDivineIntervention(options.divineIntervention),
      history: this.generateReligionHistory(name),
      symbols: this.generateReligionSymbols(theme),
      tags: [type, theme]
    });
  }

  // ===========================================================================
  // GENERATION HELPERS
  // ===========================================================================

  private generateDeityName(domain: DivineDomain): string {
    const prefixes: Record<string, string[]> = {
      [DivineDomain.SUN]: ['Sol', 'Hel', 'Ra', 'Aten'],
      [DivineDomain.MOON]: ['Lun', 'Sel', 'Mani', 'Tsuki'],
      [DivineDomain.WAR]: ['Ares', 'Tyr', 'Mar', 'Bel'],
      [DivineDomain.LOVE]: ['Aphro', 'Freya', 'Ven', 'Ishi'],
      [DivineDomain.DEATH]: ['Mor', 'Hel', 'Than', 'Anu'],
      [DivineDomain.SEA]: ['Pos', 'Aeg', 'Nep', 'Teth'],
      [DivineDomain.WISDOM]: ['Ath', 'Oden', 'Thot', 'Gan'],
      [DivineDomain.HARVEST]: ['Dem', 'Ceres', 'Frey', 'Pak']
    };

    const suffixes = ['us', 'is', 'a', 'or', 'yn', 'iel', 'eth', 'ara', 'ion', 'oth'];

    const prefix = this.randomChoice(prefixes[domain] || ['Div', 'Sac', 'Ael']);
    const suffix = this.randomChoice(suffixes);

    return prefix + suffix;
  }

  private generateDeityTitles(domains: DivineDomain[], rank: DeityRank): string[] {
    const titles: string[] = [];

    if (rank === DeityRank.SUPREME) {
      titles.push('The Almighty', 'Creator of All', 'The Eternal One');
    }

    for (const domain of domains) {
      const domainTitles: Record<string, string[]> = {
        [DivineDomain.SUN]: ['The Radiant', 'Light-Bringer', 'The Golden One'],
        [DivineDomain.WAR]: ['The Victorious', 'Battle-Lord', 'The Unyielding'],
        [DivineDomain.LOVE]: ['The Beautiful', 'Heart-Stirrer', 'The Beloved'],
        [DivineDomain.DEATH]: ['The Inevitable', 'Soul-Keeper', 'The Final Judge'],
        [DivineDomain.WISDOM]: ['The All-Knowing', 'Mind-Opener', 'The Sage']
      };

      if (domainTitles[domain]) {
        titles.push(this.randomChoice(domainTitles[domain]));
      }
    }

    return titles;
  }

  private generateEpithets(domains: DivineDomain[]): string[] {
    const epithets: string[] = [];

    for (const domain of domains) {
      epithets.push(`${domain.charAt(0).toUpperCase() + domain.slice(1)}-Bringer`);
    }

    return epithets;
  }

  private generateDeityAppearance(domains: DivineDomain[], alignment: Alignment): Deity['appearance'] {
    const animals: Record<string, string[]> = {
      [DivineDomain.SUN]: ['Eagle', 'Lion', 'Phoenix'],
      [DivineDomain.MOON]: ['Owl', 'Wolf', 'Cat'],
      [DivineDomain.WAR]: ['Wolf', 'Bear', 'Boar'],
      [DivineDomain.LOVE]: ['Dove', 'Swan', 'Sparrow'],
      [DivineDomain.DEATH]: ['Raven', 'Jackal', 'Vulture'],
      [DivineDomain.SEA]: ['Dolphin', 'Whale', 'Seahorse'],
      [DivineDomain.WISDOM]: ['Owl', 'Serpent', 'Raven']
    };

    const plants: Record<string, string[]> = {
      [DivineDomain.LOVE]: ['Rose', 'Myrtle', 'Apple'],
      [DivineDomain.DEATH]: ['Cypress', 'Yew', 'Asphodel'],
      [DivineDomain.HARVEST]: ['Wheat', 'Corn', 'Grape'],
      [DivineDomain.NATURE]: ['Oak', 'Holly', 'Mistletoe']
    };

    return {
      description: 'A majestic divine being',
      humanoid: true,
      forms: ['Human', 'Divine radiance', 'Animal form'],
      sacredAnimals: animals[domains[0]] || ['Eagle'],
      sacredPlants: plants[domains[0]] || ['Oak']
    };
  }

  private generateDeitySymbols(domains: DivineDomain[]): Deity['symbols'] {
    const symbols: Record<string, string> = {
      [DivineDomain.SUN]: 'Sun disc',
      [DivineDomain.MOON]: 'Crescent moon',
      [DivineDomain.WAR]: 'Sword',
      [DivineDomain.LOVE]: 'Heart',
      [DivineDomain.DEATH]: 'Skull',
      [DivineDomain.SEA]: 'Trident',
      [DivineDomain.WISDOM]: 'Book',
      [DivineDomain.HARVEST]: 'Wheat sheaf',
      [DivineDomain.JUSTICE]: 'Scales',
      [DivineDomain.MAGIC]: 'Staff'
    };

    const colors: Record<string, string[]> = {
      [DivineDomain.SUN]: ['Gold', 'Yellow', 'Orange'],
      [DivineDomain.MOON]: ['Silver', 'White', 'Blue'],
      [DivineDomain.WAR]: ['Red', 'Black', 'Iron'],
      [DivineDomain.LOVE]: ['Pink', 'Red', 'Rose'],
      [DivineDomain.DEATH]: ['Black', 'Gray', 'Purple'],
      [DivineDomain.SEA]: ['Blue', 'Green', 'White']
    };

    return {
      primary: symbols[domains[0]] || 'Divine symbol',
      secondary: domains.slice(1).map(d => symbols[d] || 'Star'),
      colors: colors[domains[0]] || ['Gold', 'White'],
      numbers: [this.randomInt(1, 12)]
    };
  }

  private generateDeityPersonality(domains: DivineDomain[], alignment: Alignment): Deity['personality'] {
    const domainTraits: Record<string, string[]> = {
      [DivineDomain.WAR]: ['Fierce', 'Strategic', 'Honorable'],
      [DivineDomain.LOVE]: ['Passionate', 'Jealous', 'Generous'],
      [DivineDomain.WISDOM]: ['Patient', 'Curious', 'Reserved'],
      [DivineDomain.DEATH]: ['Impartial', 'Stern', 'Just'],
      [DivineDomain.TRICKERY]: ['Cunning', 'Playful', 'Unpredictable']
    };

    return {
      traits: domainTraits[domains[0]] || ['Mysterious', 'Powerful'],
      virtues: ['Justice', 'Mercy', 'Wisdom'],
      vices: alignment.includes('evil') ? ['Pride', 'Wrath'] : ['Pride'],
      temperament: alignment.includes('lawful') ? 'Stern but fair' : 'Unpredictable'
    };
  }

  private generateDeityPowers(domains: DivineDomain[]): string[] {
    const powers: string[] = ['Immortality', 'Divine strength', 'Omniscience within domain'];

    for (const domain of domains) {
      powers.push(`Control over ${domain}`);
    }

    return powers;
  }

  private generateDeityWorship(domains: DivineDomain[]): Deity['worship'] {
    const offerings: Record<string, string[]> = {
      [DivineDomain.WAR]: ['Weapons', 'Victory trophies', 'Blood'],
      [DivineDomain.LOVE]: ['Flowers', 'Perfume', 'Jewelry'],
      [DivineDomain.HARVEST]: ['First fruits', 'Grain', 'Wine'],
      [DivineDomain.DEATH]: ['Coins', 'Grave goods', 'Prayers']
    };

    return {
      primaryWorshippers: ['Clergy', 'Devout laity'],
      favoritedGroups: domains.includes(DivineDomain.WAR) ? ['Warriors', 'Soldiers'] :
                       domains.includes(DivineDomain.WISDOM) ? ['Scholars', 'Mages'] : ['All'],
      taboos: ['Blasphemy', 'Desecration of temples'],
      offerings: offerings[domains[0]] || ['Incense', 'Prayers', 'Candles'],
      prayerTimes: ['Dawn', 'Dusk'],
      holyDays: ['Sacred festival']
    };
  }

  private generateDeityOrigin(rank: DeityRank): string {
    if (rank === DeityRank.SUPREME) {
      return 'Existed before creation, shaped the universe from primordial chaos';
    } else if (rank === DeityRank.GREATER || rank === DeityRank.INTERMEDIATE) {
      return 'Born from the union of elder deities';
    } else {
      return 'Emerged from natural forces or mortal ascension';
    }
  }

  private generatePantheonName(): string {
    const prefixes = ['Olymp', 'Asgard', 'Celest', 'Divin', 'Ether', 'Empyr'];
    const suffixes = ['ian', 'ean', 'ic', 'al'];

    return this.randomChoice(prefixes) + this.randomChoice(suffixes) + ' Pantheon';
  }

  private generateCosmology(pantheonName: string, creatorId: string): Pantheon['cosmology'] {
    return {
      creationMyth: `In the beginning, the ${pantheonName} creator shaped the world from primordial chaos`,
      worldStructure: 'Three realms: Heaven above, Earth in the middle, Underworld below',
      planes: [
        { name: 'The Divine Realm', description: 'Home of the gods', ruler: creatorId },
        { name: 'The Mortal World', description: 'Where mortals dwell' },
        { name: 'The Underworld', description: 'Realm of the dead' }
      ]
    };
  }

  private generateReligionName(type: ReligionType): string {
    const suffixes = ['ism', 'ity', 'anism', 'ology'];
    const roots = {
      [ReligionType.MONOTHEISM]: ['Unithe', 'Monolatr', 'Divine'],
      [ReligionType.POLYTHEISM]: ['Panthe', 'Multithe', 'Divinesyn'],
      [ReligionType.ANIMISM]: ['Spirit', 'Animat', 'Natural'],
      [ReligionType.ANCESTOR_WORSHIP]: ['Ancestor', 'Forebear', 'Elder']
    };

    const root = this.randomChoice(roots[type] || ['Sacred', 'Holy']);
    return root + this.randomChoice(suffixes);
  }

  private generateReligionDescription(name: string, type: ReligionType): string {
    return `${name} is a ${type.replace(/_/g, ' ')} tradition emphasizing devotion and moral living.`;
  }

  private generateBeliefs(type: ReligionType, theme: string): Religion['beliefs'] {
    const tenets = {
      light: ['Seek the light', 'Help the innocent', 'Fight darkness', 'Speak truth'],
      dark: ['Power is virtue', 'The strong survive', 'Fear is respect', 'Embrace darkness'],
      nature: ['Honor the natural cycle', 'Protect the wild', 'Live in harmony', 'Respect all life'],
      knowledge: ['Seek wisdom', 'Preserve knowledge', 'Question everything', 'Teach freely']
    };

    return {
      coreTenets: tenets[theme as keyof typeof tenets] || tenets.light,
      creationMyth: 'The divine created the world from chaos',
      purpose: 'To live virtuously and achieve spiritual fulfillment',
      morality: 'Based on divine commandments and natural law',
      salvation: 'Through faith, good works, and devotion'
    };
  }

  private generateAfterlife(theme: string): Religion['afterlife'] {
    return {
      type: theme === 'dark' ? AfterlifeType.MULTIPLE_REALMS : AfterlifeType.JUDGMENT,
      heavens: [{
        name: 'Paradise',
        description: 'Eternal bliss in the divine presence',
        requirements: 'Virtuous life and true faith'
      }],
      hells: [{
        name: 'The Abyss',
        description: 'Punishment for the wicked',
        sins: 'Murder, blasphemy, betrayal'
      }],
      judgmentProcess: 'Souls are weighed and judged by divine tribunal'
    };
  }

  private generateSacredTexts(religionName: string): Religion['sacredTexts'] {
    return [{
      name: `The Book of ${religionName.slice(0, -3)}`,
      description: 'The primary scripture',
      contents: 'Creation myths, laws, prophecies, and wisdom',
      authority: 'divine',
      languages: ['Sacred tongue', 'Common translations']
    }];
  }

  private generateClergy(type: ReligionType): Religion['clergy'] {
    return [{
      title: ClergyType.PRIEST,
      requirements: ['Ordination', 'Education', 'Vows'],
      duties: ['Conduct services', 'Counsel faithful', 'Teach doctrine'],
      privileges: ['Access to sacred spaces', 'Community respect'],
      restrictions: ['Celibacy (optional)', 'No commerce'],
      hierarchy: ['Novice', 'Priest', 'High Priest', 'Hierarch']
    }];
  }

  private generatePractices(theme: string): Religion['practices'] {
    return {
      dailyPractices: ['Morning prayers', 'Evening meditation'],
      weeklyPractices: ['Sabbath observance', 'Community gathering'],
      prohibitions: ['Murder', 'Theft', 'Blasphemy'],
      dietaryLaws: theme === 'nature' ? ['Vegetarianism encouraged'] : ['Avoid unclean foods'],
      dressCode: ['Modest dress', 'Sacred symbols worn']
    };
  }

  private generateRituals(type: ReligionType): Religion['rituals'] {
    return [
      {
        id: uuidv4(),
        name: 'Weekly Service',
        type: RitualType.WEEKLY,
        description: 'Communal worship gathering',
        timing: 'Sabbath day',
        participants: ['Clergy', 'Congregation'],
        requirements: ['Clean clothes', 'Peaceful mind'],
        steps: ['Opening prayers', 'Readings', 'Sermon', 'Closing blessing'],
        significance: 'Strengthens community and faith'
      },
      {
        id: uuidv4(),
        name: 'Naming Ceremony',
        type: RitualType.LIFE_EVENT,
        description: 'Welcomes newborn into faith',
        timing: 'First month after birth',
        participants: ['Parents', 'Priest', 'Godparents'],
        requirements: ['Sacred water', 'White garment'],
        steps: ['Blessing', 'Naming', 'Anointing', 'Welcoming'],
        significance: 'Initiates child into religious community'
      }
    ];
  }

  private generateHolySites(religionName: string): Religion['holySites'] {
    return [
      {
        id: uuidv4(),
        name: `The Great Temple of ${religionName.slice(0, -3)}`,
        type: 'temple',
        location: 'Capital city',
        description: 'The holiest temple in the faith',
        significance: 'Center of worship and pilgrimage',
        pilgrimageInfo: 'Pilgrims visit during high holy days'
      }
    ];
  }

  private generateOrganization(type: ReligionType): Religion['organization'] {
    return {
      structure: type === ReligionType.SHAMANISM ? 'decentralized' : 'hierarchical',
      headquarters: 'The Sacred City',
      leaderTitle: type === ReligionType.THEOCRACY ? 'Divine Ruler' : 'High Hierarch',
      councils: [{ name: 'Council of Elders', role: 'Theological guidance' }],
      orders: [{ name: 'Order of the Sacred', focus: 'Preservation of texts' }]
    };
  }

  private generateDivineIntervention(level?: string): Religion['divineIntervention'] {
    const frequency = level === 'active' ? 'common' : level === 'none' ? 'never' : 'rare';

    return {
      frequency: frequency as Religion['divineIntervention']['frequency'],
      types: ['Visions', 'Miracles', 'Divine messengers'],
      conditions: ['Great faith', 'Dire need', 'Sacred location'],
      miracles: ['Healing', 'Protection', 'Guidance']
    };
  }

  private generateReligionHistory(religionName: string): Religion['history'] {
    return {
      founding: 'Thousands of years ago through divine revelation',
      founder: 'The First Prophet',
      majorEvents: [
        { date: 'Year 1', event: 'Divine revelation to the founder' },
        { date: 'Year 100', event: 'First great temple constructed' },
        { date: 'Year 500', event: 'The Great Schism' }
      ],
      persecutions: ['Era of suppression under foreign rule'],
      reformations: ['The Renewal Movement']
    };
  }

  private generateReligionSymbols(theme: string): Religion['symbols'] {
    const themeSymbols: Record<string, { primary: string; colors: string[] }> = {
      light: { primary: 'Radiant sun', colors: ['Gold', 'White', 'Yellow'] },
      dark: { primary: 'Black moon', colors: ['Black', 'Purple', 'Red'] },
      nature: { primary: 'Tree of life', colors: ['Green', 'Brown', 'Gold'] },
      knowledge: { primary: 'Open book', colors: ['Blue', 'Silver', 'White'] }
    };

    const symbols = themeSymbols[theme] || themeSymbols.light;

    return {
      primary: symbols.primary,
      secondary: ['Sacred flame', 'Divine eye'],
      colors: symbols.colors,
      architecture: 'Soaring spires reaching toward heaven',
      music: 'Choral hymns and sacred chants',
      art: 'Icons and illuminated manuscripts'
    };
  }

  // ===========================================================================
  // EXPORT & UTILITY
  // ===========================================================================

  exportToJSON(): string {
    return JSON.stringify({
      religions: Array.from(this.religions.values()),
      pantheons: Array.from(this.pantheons.values()),
      deities: Array.from(this.deities.values())
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.religions) {
      for (const religion of data.religions) {
        this.religions.set(religion.id, {
          ...religion,
          createdAt: new Date(religion.createdAt),
          updatedAt: new Date(religion.updatedAt)
        });
      }
    }

    if (data.pantheons) {
      for (const pantheon of data.pantheons) {
        this.pantheons.set(pantheon.id, {
          ...pantheon,
          createdAt: new Date(pantheon.createdAt),
          updatedAt: new Date(pantheon.updatedAt)
        });
      }
    }

    if (data.deities) {
      for (const deity of data.deities) {
        this.deities.set(deity.id, {
          ...deity,
          createdAt: new Date(deity.createdAt),
          updatedAt: new Date(deity.updatedAt)
        });
      }
    }
  }

  generateDeityMarkdown(deityId: string): string {
    const deity = this.deities.get(deityId);
    if (!deity) return '';

    let md = `# ${deity.name}\n\n`;
    md += `*${deity.titles.join(', ')}*\n\n`;

    md += `## Overview\n`;
    md += `- **Rank:** ${deity.rank}\n`;
    md += `- **Domains:** ${deity.domains.join(', ')}\n`;
    md += `- **Alignment:** ${deity.alignment}\n\n`;

    md += `## Symbols\n`;
    md += `- **Primary:** ${deity.symbols.primary}\n`;
    md += `- **Colors:** ${deity.symbols.colors.join(', ')}\n`;
    md += `- **Sacred Animals:** ${deity.appearance.sacredAnimals.join(', ')}\n\n`;

    md += `## Worship\n`;
    md += `- **Offerings:** ${deity.worship.offerings.join(', ')}\n`;
    md += `- **Prayer Times:** ${deity.worship.prayerTimes.join(', ')}\n`;
    md += `- **Holy Days:** ${deity.worship.holyDays.join(', ')}\n\n`;

    return md;
  }

  generateReligionMarkdown(religionId: string): string {
    const religion = this.religions.get(religionId);
    if (!religion) return '';

    let md = `# ${religion.name}\n\n`;
    md += `${religion.description}\n\n`;

    md += `## Type\n`;
    md += `${religion.type.replace(/_/g, ' ')}\n\n`;

    md += `## Core Tenets\n`;
    for (const tenet of religion.beliefs.coreTenets) {
      md += `- ${tenet}\n`;
    }
    md += `\n`;

    md += `## Afterlife\n`;
    md += `**Type:** ${religion.afterlife.type}\n\n`;

    if (religion.sacredTexts.length > 0) {
      md += `## Sacred Texts\n`;
      for (const text of religion.sacredTexts) {
        md += `### ${text.name}\n`;
        md += `${text.description}\n\n`;
      }
    }

    return md;
  }
}

export default ReligionDesigner;
