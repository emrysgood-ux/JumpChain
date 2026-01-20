/**
 * Epic Fiction Architect - Culture/Civilization Designer
 *
 * Comprehensive system for designing cultures, civilizations, and societies.
 * Integrates with Calendar Engine for holidays and Species Designer for
 * species-specific cultural traits.
 *
 * Features:
 * - Social structure and hierarchy design
 * - Government and political systems
 * - Laws and justice systems
 * - Customs, traditions, and ceremonies
 * - Art, music, and expression
 * - Food, clothing, and daily life
 * - Values, ethics, and taboos
 * - Naming conventions
 * - Inter-cultural relationships
 * - Random generation with cultural themes
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum GovernmentType {
  // Autocracies
  ABSOLUTE_MONARCHY = 'absolute_monarchy',
  CONSTITUTIONAL_MONARCHY = 'constitutional_monarchy',
  DICTATORSHIP = 'dictatorship',
  TYRANNY = 'tyranny',
  DESPOTISM = 'despotism',

  // Aristocracies
  OLIGARCHY = 'oligarchy',
  PLUTOCRACY = 'plutocracy',
  ARISTOCRACY = 'aristocracy',
  MERITOCRACY = 'meritocracy',
  TECHNOCRACY = 'technocracy',
  GERONTOCRACY = 'gerontocracy',

  // Democracies
  DIRECT_DEMOCRACY = 'direct_democracy',
  REPRESENTATIVE_DEMOCRACY = 'representative_democracy',
  REPUBLIC = 'republic',

  // Theocracies
  THEOCRACY = 'theocracy',
  ECCLESIOCRACY = 'ecclesiocracy',
  KRITARCHY = 'kritarchy',

  // Collective
  TRIBAL = 'tribal',
  CHIEFDOM = 'chiefdom',
  CONFEDERATION = 'confederation',
  FEDERATION = 'federation',
  COMMUNE = 'commune',
  ANARCHY = 'anarchy',

  // Specialized
  MAGOCRACY = 'magocracy',
  STRATOCRACY = 'stratocracy',
  CORPORATOCRACY = 'corporatocracy',
  KRATOCRACY = 'kratocracy',
  NOOCRACY = 'noocracy',
  HIVE_MIND = 'hive_mind'
}

export enum TechnologyLevel {
  PREHISTORIC = 'prehistoric',
  STONE_AGE = 'stone_age',
  BRONZE_AGE = 'bronze_age',
  IRON_AGE = 'iron_age',
  CLASSICAL = 'classical',
  MEDIEVAL = 'medieval',
  RENAISSANCE = 'renaissance',
  EARLY_INDUSTRIAL = 'early_industrial',
  INDUSTRIAL = 'industrial',
  ATOMIC = 'atomic',
  INFORMATION = 'information',
  SPACEFARING = 'spacefaring',
  INTERSTELLAR = 'interstellar',
  POST_SCARCITY = 'post_scarcity',
  MAGITECH = 'magitech'
}

export enum EconomicSystem {
  SUBSISTENCE = 'subsistence',
  BARTER = 'barter',
  GIFT_ECONOMY = 'gift_economy',
  MERCANTILISM = 'mercantilism',
  CAPITALISM = 'capitalism',
  SOCIALISM = 'socialism',
  COMMUNISM = 'communism',
  FEUDALISM = 'feudalism',
  GUILD_SYSTEM = 'guild_system',
  MIXED = 'mixed',
  POST_SCARCITY = 'post_scarcity'
}

export enum SocialMobility {
  NONE = 'none',               // Caste system, no movement possible
  VERY_LOW = 'very_low',       // Extremely rare exceptions
  LOW = 'low',                 // Difficult but possible
  MODERATE = 'moderate',       // Achievable with effort
  HIGH = 'high',               // Common occurrence
  FLUID = 'fluid'              // Status constantly in flux
}

export enum FamilyStructure {
  NUCLEAR = 'nuclear',
  EXTENDED = 'extended',
  CLAN = 'clan',
  COMMUNAL = 'communal',
  POLYGAMOUS = 'polygamous',
  POLYANDROUS = 'polyandrous',
  MATRIARCHAL = 'matriarchal',
  PATRIARCHAL = 'patriarchal',
  EGALITARIAN = 'egalitarian',
  NONE = 'none'
}

export enum GenderSystem {
  BINARY_PATRIARCHAL = 'binary_patriarchal',
  BINARY_MATRIARCHAL = 'binary_matriarchal',
  BINARY_EGALITARIAN = 'binary_egalitarian',
  MULTI_GENDER = 'multi_gender',
  NON_GENDERED = 'non_gendered',
  FLUID = 'fluid',
  SPECIES_SPECIFIC = 'species_specific'
}

export enum ArchitectureStyle {
  NOMADIC = 'nomadic',
  ORGANIC = 'organic',
  MEGALITHIC = 'megalithic',
  CLASSICAL = 'classical',
  GOTHIC = 'gothic',
  BAROQUE = 'baroque',
  MODERNIST = 'modernist',
  FUTURIST = 'futurist',
  SUBTERRANEAN = 'subterranean',
  ARBOREAL = 'arboreal',
  AQUATIC = 'aquatic',
  CRYSTALLINE = 'crystalline',
  LIVING = 'living',
  MAGICAL = 'magical'
}

export enum CulturalValue {
  HONOR = 'honor',
  FAMILY = 'family',
  TRADITION = 'tradition',
  INNOVATION = 'innovation',
  FREEDOM = 'freedom',
  ORDER = 'order',
  STRENGTH = 'strength',
  WISDOM = 'wisdom',
  HARMONY = 'harmony',
  WEALTH = 'wealth',
  KNOWLEDGE = 'knowledge',
  PIETY = 'piety',
  BEAUTY = 'beauty',
  JUSTICE = 'justice',
  LOYALTY = 'loyalty',
  COURAGE = 'courage',
  HOSPITALITY = 'hospitality',
  HUMILITY = 'humility',
  AMBITION = 'ambition',
  COMMUNITY = 'community'
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Social class/caste definition
 */
export interface SocialClass {
  id: string;
  name: string;
  rank: number;           // Lower = higher status
  description: string;
  privileges: string[];
  responsibilities: string[];
  restrictions: string[];
  populationPercent: number;
  occupations: string[];
  canIntermarry: string[]; // IDs of classes they can marry into
  symbols: string[];       // Status symbols
}

/**
 * Law or legal principle
 */
export interface Law {
  id: string;
  name: string;
  category: 'criminal' | 'civil' | 'religious' | 'trade' | 'family' | 'property' | 'magical';
  description: string;
  punishment?: string;
  enforcement: string;
  exceptions: string[];
}

/**
 * Custom or tradition
 */
export interface Custom {
  id: string;
  name: string;
  category: 'greeting' | 'dining' | 'marriage' | 'birth' | 'death' | 'coming_of_age' | 'seasonal' | 'religious' | 'social' | 'other';
  description: string;
  participants: string[];
  timing: string;
  significance: 'minor' | 'moderate' | 'major' | 'sacred';
  associatedItems: string[];
  tabooViolations: string[];
}

/**
 * Ceremony or ritual
 */
export interface Ceremony {
  id: string;
  name: string;
  type: 'birth' | 'coming_of_age' | 'marriage' | 'death' | 'coronation' | 'religious' | 'seasonal' | 'victory' | 'other';
  description: string;
  duration: string;
  location: string;
  participants: {
    role: string;
    requirements: string[];
  }[];
  steps: string[];
  requiredItems: string[];
  significance: string;
}

/**
 * Holiday or celebration
 */
export interface Holiday {
  id: string;
  name: string;
  type: 'religious' | 'seasonal' | 'historical' | 'cultural';
  date: string;          // Could be calendar date or "first full moon of spring"
  duration: number;      // Days
  description: string;
  traditions: string[];
  foods: string[];
  activities: string[];
  significance: string;
}

/**
 * Art form
 */
export interface ArtForm {
  id: string;
  name: string;
  category: 'visual' | 'performing' | 'literary' | 'musical' | 'culinary' | 'crafts' | 'magical';
  description: string;
  practitioners: string[];  // Who typically practices
  materials: string[];
  themes: string[];
  significance: 'folk' | 'elite' | 'sacred' | 'universal';
  famousWorks: string[];
}

/**
 * Cuisine details
 */
export interface Cuisine {
  staples: string[];
  proteins: string[];
  vegetables: string[];
  spices: string[];
  beverages: string[];
  cookingMethods: string[];
  mealTimes: { name: string; time: string; description: string }[];
  diningCustoms: string[];
  tabooFoods: string[];
  celebratoryFoods: string[];
}

/**
 * Clothing and fashion
 */
export interface Fashion {
  everyday: {
    male: string;
    female: string;
    neutral: string;
  };
  formal: {
    male: string;
    female: string;
    neutral: string;
  };
  occupational: { occupation: string; attire: string }[];
  materials: string[];
  colors: {
    common: string[];
    restricted: { color: string; restriction: string }[];
  };
  accessories: string[];
  bodyModifications: string[];
  hairstyles: string[];
}

/**
 * Naming conventions
 */
export interface NamingConvention {
  pattern: string;        // e.g., "Given + Patronymic + Family"
  givenNames: {
    male: string[];
    female: string[];
    neutral: string[];
  };
  familyNameOrigins: string[];  // e.g., "occupation", "location", "ancestor"
  titles: { title: string; usage: string }[];
  nicknames: string;
  tabooNames: string[];
  namingCeremonies: string;
}

/**
 * Complete culture definition
 */
export interface Culture {
  id: string;
  name: string;
  demonym: string;        // What members are called
  description: string;

  // Population
  species: string[];      // Species that practice this culture
  population: number;
  territory: string[];    // Location IDs or names

  // Political
  government: GovernmentType;
  governmentDetails: {
    leaderTitle: string;
    succession: string;
    councils: { name: string; role: string }[];
    politicalParties?: { name: string; ideology: string }[];
  };

  // Social
  socialClasses: SocialClass[];
  socialMobility: SocialMobility;
  familyStructure: FamilyStructure;
  genderSystem: GenderSystem;

  // Economic
  economicSystem: EconomicSystem;
  currency?: {
    name: string;
    denominations: { name: string; value: number }[];
    material: string;
  };
  majorIndustries: string[];
  tradeGoods: { export: string[]; import: string[] };

  // Technology
  technologyLevel: TechnologyLevel;
  technologicalStrengths: string[];
  technologicalWeaknesses: string[];

  // Legal
  laws: Law[];
  justiceSystem: {
    type: 'accusatorial' | 'inquisitorial' | 'trial_by_combat' | 'trial_by_ordeal' | 'divine_judgment' | 'elder_council';
    enforcers: string[];
    courts: string[];
  };

  // Cultural
  values: CulturalValue[];
  taboos: string[];
  customs: Custom[];
  ceremonies: Ceremony[];
  holidays: Holiday[];

  // Expression
  artForms: ArtForm[];
  architecture: ArchitectureStyle;
  architectureDetails: string;
  cuisine: Cuisine;
  fashion: Fashion;

  // Language
  languages: string[];    // Language IDs or names
  namingConvention: NamingConvention;

  // Religion
  religions: string[];    // Religion IDs

  // Military
  military: {
    structure: string;
    branches: string[];
    conscription: 'none' | 'voluntary' | 'selective' | 'universal';
    warriorTraditions: string[];
  };

  // Relations
  allies: string[];       // Culture IDs
  enemies: string[];
  tradePartners: string[];
  vassals: string[];
  overlord?: string;

  // History
  foundingDate: string;
  historicalEvents: { date: string; event: string }[];
  legendaryFigures: { name: string; achievement: string }[];

  // Meta
  inspirations: string[]; // Real-world inspirations
  themes: string[];       // Narrative themes
  tags: string[];

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generation options
 */
export interface CultureGenerationOptions {
  theme?: 'warrior' | 'merchant' | 'scholarly' | 'religious' | 'artistic' | 'nature' | 'maritime' | 'nomadic' | 'industrial';
  government?: GovernmentType;
  techLevel?: TechnologyLevel;
  species?: string;
  values?: CulturalValue[];
  climate?: 'tropical' | 'temperate' | 'arctic' | 'desert' | 'maritime';
}

// ============================================================================
// CULTURE DESIGNER CLASS
// ============================================================================

export class CultureDesigner {
  private cultures: Map<string, Culture> = new Map();
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
  // CRUD OPERATIONS
  // ===========================================================================

  createCulture(data: Partial<Culture> & { name: string }): Culture {
    const culture: Culture = {
      id: uuidv4(),
      name: data.name,
      demonym: data.demonym || data.name + 'n',
      description: data.description || '',
      species: data.species || ['human'],
      population: data.population || 0,
      territory: data.territory || [],
      government: data.government || GovernmentType.TRIBAL,
      governmentDetails: data.governmentDetails || {
        leaderTitle: 'Chief',
        succession: 'Selection by elders',
        councils: []
      },
      socialClasses: data.socialClasses || [],
      socialMobility: data.socialMobility || SocialMobility.MODERATE,
      familyStructure: data.familyStructure || FamilyStructure.EXTENDED,
      genderSystem: data.genderSystem || GenderSystem.BINARY_EGALITARIAN,
      economicSystem: data.economicSystem || EconomicSystem.BARTER,
      currency: data.currency,
      majorIndustries: data.majorIndustries || [],
      tradeGoods: data.tradeGoods || { export: [], import: [] },
      technologyLevel: data.technologyLevel || TechnologyLevel.IRON_AGE,
      technologicalStrengths: data.technologicalStrengths || [],
      technologicalWeaknesses: data.technologicalWeaknesses || [],
      laws: data.laws || [],
      justiceSystem: data.justiceSystem || {
        type: 'elder_council',
        enforcers: ['warriors'],
        courts: []
      },
      values: data.values || [],
      taboos: data.taboos || [],
      customs: data.customs || [],
      ceremonies: data.ceremonies || [],
      holidays: data.holidays || [],
      artForms: data.artForms || [],
      architecture: data.architecture || ArchitectureStyle.ORGANIC,
      architectureDetails: data.architectureDetails || '',
      cuisine: data.cuisine || this.generateDefaultCuisine(),
      fashion: data.fashion || this.generateDefaultFashion(),
      languages: data.languages || [],
      namingConvention: data.namingConvention || this.generateDefaultNaming(),
      religions: data.religions || [],
      military: data.military || {
        structure: 'militia',
        branches: ['infantry'],
        conscription: 'voluntary',
        warriorTraditions: []
      },
      allies: data.allies || [],
      enemies: data.enemies || [],
      tradePartners: data.tradePartners || [],
      vassals: data.vassals || [],
      overlord: data.overlord,
      foundingDate: data.foundingDate || 'ancient times',
      historicalEvents: data.historicalEvents || [],
      legendaryFigures: data.legendaryFigures || [],
      inspirations: data.inspirations || [],
      themes: data.themes || [],
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.cultures.set(culture.id, culture);
    return culture;
  }

  getCulture(id: string): Culture | undefined {
    return this.cultures.get(id);
  }

  getCultureByName(name: string): Culture | undefined {
    for (const culture of this.cultures.values()) {
      if (culture.name.toLowerCase() === name.toLowerCase()) {
        return culture;
      }
    }
    return undefined;
  }

  updateCulture(id: string, updates: Partial<Culture>): Culture | undefined {
    const culture = this.cultures.get(id);
    if (!culture) return undefined;

    const updated = {
      ...culture,
      ...updates,
      id: culture.id,
      createdAt: culture.createdAt,
      updatedAt: new Date()
    };

    this.cultures.set(id, updated);
    return updated;
  }

  deleteCulture(id: string): boolean {
    return this.cultures.delete(id);
  }

  getAllCultures(): Culture[] {
    return Array.from(this.cultures.values());
  }

  queryCultures(criteria: {
    government?: GovernmentType;
    techLevel?: TechnologyLevel;
    values?: CulturalValue[];
    tags?: string[];
  }): Culture[] {
    return this.getAllCultures().filter(culture => {
      if (criteria.government && culture.government !== criteria.government) return false;
      if (criteria.techLevel && culture.technologyLevel !== criteria.techLevel) return false;
      if (criteria.values && !criteria.values.some(v => culture.values.includes(v))) return false;
      if (criteria.tags && !criteria.tags.every(t => culture.tags.includes(t))) return false;
      return true;
    });
  }

  // ===========================================================================
  // RANDOM GENERATION
  // ===========================================================================

  generateRandomCulture(options: CultureGenerationOptions = {}): Culture {
    const theme = options.theme || this.randomChoice([
      'warrior', 'merchant', 'scholarly', 'religious', 'artistic', 'nature', 'maritime', 'nomadic', 'industrial'
    ]);

    const name = this.generateCultureName(theme);
    const government = options.government || this.generateGovernmentForTheme(theme);
    const techLevel = options.techLevel || this.randomChoice(Object.values(TechnologyLevel).slice(0, 10));
    const values = options.values || this.generateValuesForTheme(theme);

    const culture = this.createCulture({
      name,
      demonym: this.generateDemonym(name),
      description: this.generateDescription(name, theme, government),
      species: options.species ? [options.species] : ['human'],
      government,
      governmentDetails: this.generateGovernmentDetails(government),
      socialClasses: this.generateSocialClasses(government, theme),
      socialMobility: this.generateSocialMobility(government),
      familyStructure: this.randomChoice(Object.values(FamilyStructure).slice(0, 9)),
      genderSystem: this.randomChoice(Object.values(GenderSystem)),
      economicSystem: this.generateEconomicSystem(techLevel, theme),
      currency: techLevel !== TechnologyLevel.PREHISTORIC && techLevel !== TechnologyLevel.STONE_AGE
        ? this.generateCurrency(name)
        : undefined,
      majorIndustries: this.generateIndustries(theme, techLevel),
      tradeGoods: this.generateTradeGoods(theme, options.climate),
      technologyLevel: techLevel,
      technologicalStrengths: this.generateTechStrengths(theme),
      technologicalWeaknesses: this.generateTechWeaknesses(theme),
      laws: this.generateLaws(theme, government),
      justiceSystem: this.generateJusticeSystem(government),
      values,
      taboos: this.generateTaboos(theme, values),
      customs: this.generateCustoms(theme),
      ceremonies: this.generateCeremonies(theme),
      holidays: this.generateHolidays(theme),
      artForms: this.generateArtForms(theme),
      architecture: this.generateArchitecture(theme, options.climate),
      architectureDetails: '',
      cuisine: this.generateCuisine(options.climate || 'temperate'),
      fashion: this.generateFashion(theme, options.climate || 'temperate'),
      languages: [],
      namingConvention: this.generateNamingConvention(theme),
      religions: [],
      military: this.generateMilitary(theme, techLevel),
      foundingDate: this.randomInt(100, 5000) + ' years ago',
      historicalEvents: this.generateHistoricalEvents(),
      legendaryFigures: this.generateLegendaryFigures(theme),
      inspirations: [],
      themes: [theme],
      tags: [theme, government, techLevel]
    });

    return culture;
  }

  // ===========================================================================
  // GENERATION HELPERS
  // ===========================================================================

  private generateCultureName(theme: string): string {
    const prefixes = {
      warrior: ['Iron', 'Blood', 'Storm', 'War', 'Steel', 'Thunder'],
      merchant: ['Golden', 'Silver', 'Jade', 'Pearl', 'Silk', 'Amber'],
      scholarly: ['Sage', 'Star', 'Moon', 'Light', 'Crystal', 'Azure'],
      religious: ['Sacred', 'Divine', 'Holy', 'Blessed', 'Eternal', 'Celestial'],
      artistic: ['Jade', 'Rose', 'Golden', 'Silver', 'Painted', 'Singing'],
      nature: ['Green', 'Wild', 'Forest', 'River', 'Mountain', 'Wind'],
      maritime: ['Sea', 'Wave', 'Tide', 'Storm', 'Salt', 'Coral'],
      nomadic: ['Wind', 'Sky', 'Star', 'Horse', 'Eagle', 'Free'],
      industrial: ['Iron', 'Steel', 'Forge', 'Engine', 'Gear', 'Steam']
    };

    const suffixes = ['heim', 'land', 'ia', 'an', 'or', 'eth', 'oria', 'andor', 'wyn', 'gard'];

    const prefix = this.randomChoice(prefixes[theme as keyof typeof prefixes] || prefixes.warrior);
    const suffix = this.randomChoice(suffixes);

    return prefix + suffix;
  }

  private generateDemonym(cultureName: string): string {
    if (cultureName.endsWith('ia') || cultureName.endsWith('a')) {
      return cultureName.slice(0, -1) + 'n';
    } else if (cultureName.endsWith('land')) {
      return cultureName.slice(0, -4) + 'lander';
    } else if (cultureName.endsWith('heim')) {
      return cultureName.slice(0, -4) + 'er';
    }
    return cultureName + 'ian';
  }

  private generateDescription(name: string, theme: string, government: GovernmentType): string {
    const themeDescriptions: Record<string, string> = {
      warrior: 'martial traditions and military prowess',
      merchant: 'trade networks and commercial enterprise',
      scholarly: 'pursuit of knowledge and academic traditions',
      religious: 'deep spirituality and religious devotion',
      artistic: 'creative expression and aesthetic beauty',
      nature: 'harmony with the natural world',
      maritime: 'seafaring traditions and naval expertise',
      nomadic: 'wandering lifestyle and adaptability',
      industrial: 'technological innovation and manufacturing'
    };

    return `The ${name} are a ${government.replace(/_/g, ' ')} society known for their ${themeDescriptions[theme] || 'unique traditions'}.`;
  }

  private generateGovernmentForTheme(theme: string): GovernmentType {
    const themeGovernments: Record<string, GovernmentType[]> = {
      warrior: [GovernmentType.STRATOCRACY, GovernmentType.CHIEFDOM, GovernmentType.KRATOCRACY],
      merchant: [GovernmentType.PLUTOCRACY, GovernmentType.OLIGARCHY, GovernmentType.REPUBLIC],
      scholarly: [GovernmentType.MERITOCRACY, GovernmentType.TECHNOCRACY, GovernmentType.NOOCRACY],
      religious: [GovernmentType.THEOCRACY, GovernmentType.ECCLESIOCRACY],
      artistic: [GovernmentType.ARISTOCRACY, GovernmentType.DIRECT_DEMOCRACY],
      nature: [GovernmentType.TRIBAL, GovernmentType.COMMUNE],
      maritime: [GovernmentType.REPUBLIC, GovernmentType.OLIGARCHY],
      nomadic: [GovernmentType.TRIBAL, GovernmentType.CHIEFDOM, GovernmentType.CONFEDERATION],
      industrial: [GovernmentType.CORPORATOCRACY, GovernmentType.TECHNOCRACY, GovernmentType.REPUBLIC]
    };

    return this.randomChoice(themeGovernments[theme] || [GovernmentType.TRIBAL]);
  }

  private generateValuesForTheme(theme: string): CulturalValue[] {
    const themeValues: Record<string, CulturalValue[]> = {
      warrior: [CulturalValue.HONOR, CulturalValue.STRENGTH, CulturalValue.COURAGE, CulturalValue.LOYALTY],
      merchant: [CulturalValue.WEALTH, CulturalValue.AMBITION, CulturalValue.INNOVATION],
      scholarly: [CulturalValue.KNOWLEDGE, CulturalValue.WISDOM, CulturalValue.INNOVATION],
      religious: [CulturalValue.PIETY, CulturalValue.TRADITION, CulturalValue.HUMILITY],
      artistic: [CulturalValue.BEAUTY, CulturalValue.INNOVATION, CulturalValue.FREEDOM],
      nature: [CulturalValue.HARMONY, CulturalValue.TRADITION, CulturalValue.COMMUNITY],
      maritime: [CulturalValue.FREEDOM, CulturalValue.COURAGE, CulturalValue.AMBITION],
      nomadic: [CulturalValue.FREEDOM, CulturalValue.FAMILY, CulturalValue.HOSPITALITY],
      industrial: [CulturalValue.INNOVATION, CulturalValue.AMBITION, CulturalValue.ORDER]
    };

    return this.randomChoices(themeValues[theme] || Object.values(CulturalValue), 4);
  }

  private generateGovernmentDetails(government: GovernmentType): Culture['governmentDetails'] {
    const titles: Record<string, string> = {
      [GovernmentType.ABSOLUTE_MONARCHY]: 'King/Queen',
      [GovernmentType.THEOCRACY]: 'High Priest',
      [GovernmentType.TRIBAL]: 'Chief',
      [GovernmentType.REPUBLIC]: 'Consul',
      [GovernmentType.STRATOCRACY]: 'Supreme Commander',
      [GovernmentType.MAGOCRACY]: 'Archmage'
    };

    const successions: Record<string, string> = {
      [GovernmentType.ABSOLUTE_MONARCHY]: 'Hereditary primogeniture',
      [GovernmentType.THEOCRACY]: 'Divine selection or conclave',
      [GovernmentType.TRIBAL]: 'Selection by elders',
      [GovernmentType.REPUBLIC]: 'Election',
      [GovernmentType.STRATOCRACY]: 'Military promotion',
      [GovernmentType.MERITOCRACY]: 'Examination and achievement'
    };

    return {
      leaderTitle: titles[government] || 'Leader',
      succession: successions[government] || 'Varies',
      councils: [{ name: 'Advisory Council', role: 'Advises the leader' }]
    };
  }

  private generateSocialClasses(government: GovernmentType, theme: string): SocialClass[] {
    const classes: SocialClass[] = [];

    // Ruling class
    classes.push({
      id: uuidv4(),
      name: theme === 'warrior' ? 'Warrior Nobility' : theme === 'religious' ? 'Clergy' : 'Nobility',
      rank: 1,
      description: 'The ruling elite',
      privileges: ['Political power', 'Land ownership', 'Tax exemption'],
      responsibilities: ['Governance', 'Defense', 'Justice'],
      restrictions: [],
      populationPercent: 5,
      occupations: ['Ruler', 'General', 'Judge'],
      canIntermarry: [],
      symbols: ['Crown', 'Signet ring']
    });

    // Middle class
    classes.push({
      id: uuidv4(),
      name: theme === 'merchant' ? 'Merchant Guild' : theme === 'scholarly' ? 'Scholars' : 'Freemen',
      rank: 2,
      description: 'The professional class',
      privileges: ['Own property', 'Practice trade'],
      responsibilities: ['Pay taxes', 'Militia service'],
      restrictions: ['Cannot hold high office'],
      populationPercent: 25,
      occupations: ['Merchant', 'Artisan', 'Scholar'],
      canIntermarry: [],
      symbols: ['Guild badge']
    });

    // Common class
    classes.push({
      id: uuidv4(),
      name: 'Commoners',
      rank: 3,
      description: 'The working majority',
      privileges: ['Basic rights'],
      responsibilities: ['Labor', 'Taxes', 'Military service'],
      restrictions: ['Limited mobility'],
      populationPercent: 65,
      occupations: ['Farmer', 'Laborer', 'Servant'],
      canIntermarry: [],
      symbols: []
    });

    // Lower class
    classes.push({
      id: uuidv4(),
      name: 'Underclass',
      rank: 4,
      description: 'The marginalized',
      privileges: [],
      responsibilities: ['Heavy labor'],
      restrictions: ['Many'],
      populationPercent: 5,
      occupations: ['Beggar', 'Criminal'],
      canIntermarry: [],
      symbols: []
    });

    return classes;
  }

  private generateSocialMobility(government: GovernmentType): SocialMobility {
    const mobilityMap: Partial<Record<GovernmentType, SocialMobility>> = {
      [GovernmentType.MERITOCRACY]: SocialMobility.HIGH,
      [GovernmentType.DIRECT_DEMOCRACY]: SocialMobility.HIGH,
      [GovernmentType.REPUBLIC]: SocialMobility.MODERATE,
      [GovernmentType.ABSOLUTE_MONARCHY]: SocialMobility.LOW,
      [GovernmentType.ARISTOCRACY]: SocialMobility.VERY_LOW,
      [GovernmentType.THEOCRACY]: SocialMobility.LOW
    };

    return mobilityMap[government] || SocialMobility.MODERATE;
  }

  private generateEconomicSystem(techLevel: TechnologyLevel, theme: string): EconomicSystem {
    if (techLevel === TechnologyLevel.PREHISTORIC || techLevel === TechnologyLevel.STONE_AGE) {
      return EconomicSystem.SUBSISTENCE;
    }
    if (theme === 'merchant') return EconomicSystem.CAPITALISM;
    if (theme === 'nature') return EconomicSystem.GIFT_ECONOMY;

    return this.randomChoice([EconomicSystem.FEUDALISM, EconomicSystem.GUILD_SYSTEM, EconomicSystem.MERCANTILISM]);
  }

  private generateCurrency(cultureName: string): Culture['currency'] {
    const materials = ['gold', 'silver', 'copper', 'bronze', 'electrum', 'jade', 'shells'];
    const material = this.randomChoice(materials);

    return {
      name: cultureName.slice(0, 3) + 'ar',
      denominations: [
        { name: 'penny', value: 1 },
        { name: 'shilling', value: 10 },
        { name: 'crown', value: 100 }
      ],
      material
    };
  }

  private generateIndustries(theme: string, techLevel: TechnologyLevel): string[] {
    const industries: Record<string, string[]> = {
      warrior: ['Weapons smithing', 'Armor crafting', 'Horse breeding'],
      merchant: ['Banking', 'Shipping', 'Warehousing'],
      scholarly: ['Book making', 'Instrument crafting', 'Alchemy'],
      religious: ['Temple construction', 'Religious artifacts', 'Brewing'],
      artistic: ['Pottery', 'Textiles', 'Jewelry'],
      nature: ['Herbalism', 'Woodworking', 'Hunting'],
      maritime: ['Shipbuilding', 'Fishing', 'Navigation equipment'],
      nomadic: ['Leather working', 'Animal husbandry', 'Weaving'],
      industrial: ['Manufacturing', 'Mining', 'Engineering']
    };

    return industries[theme] || ['Agriculture', 'Crafts'];
  }

  private generateTradeGoods(theme: string, climate?: string): { export: string[]; import: string[] } {
    const exports: Record<string, string[]> = {
      warrior: ['Weapons', 'Armor', 'Mercenaries'],
      merchant: ['Luxury goods', 'Spices', 'Textiles'],
      scholarly: ['Books', 'Instruments', 'Tutors'],
      religious: ['Religious artifacts', 'Incense', 'Pilgrimage guides'],
      artistic: ['Art', 'Music', 'Crafts'],
      nature: ['Herbs', 'Timber', 'Furs'],
      maritime: ['Fish', 'Salt', 'Ships'],
      nomadic: ['Horses', 'Leather', 'Wool'],
      industrial: ['Manufactured goods', 'Machinery', 'Raw materials']
    };

    return {
      export: exports[theme] || ['Raw materials'],
      import: ['Food', 'Tools', 'Luxury goods']
    };
  }

  private generateTechStrengths(theme: string): string[] {
    const strengths: Record<string, string[]> = {
      warrior: ['Metallurgy', 'Fortification', 'Military tactics'],
      merchant: ['Finance', 'Transportation', 'Communication'],
      scholarly: ['Mathematics', 'Astronomy', 'Medicine'],
      religious: ['Architecture', 'Art', 'Record keeping'],
      artistic: ['Craftsmanship', 'Aesthetics', 'Materials'],
      nature: ['Agriculture', 'Medicine', 'Conservation'],
      maritime: ['Navigation', 'Shipbuilding', 'Weather prediction'],
      nomadic: ['Animal husbandry', 'Survival', 'Mobility'],
      industrial: ['Engineering', 'Manufacturing', 'Mining']
    };

    return strengths[theme] || ['Basic crafts'];
  }

  private generateTechWeaknesses(theme: string): string[] {
    const weaknesses: Record<string, string[]> = {
      warrior: ['Agriculture', 'Arts', 'Diplomacy'],
      merchant: ['Military', 'Agriculture', 'Spirituality'],
      scholarly: ['Military', 'Physical labor', 'Practical skills'],
      religious: ['Science', 'Commerce', 'Military'],
      artistic: ['Military', 'Industry', 'Agriculture'],
      nature: ['Industry', 'Urbanization', 'Mining'],
      maritime: ['Land warfare', 'Agriculture', 'Mining'],
      nomadic: ['Architecture', 'Heavy industry', 'Administration'],
      industrial: ['Agriculture', 'Art', 'Spirituality']
    };

    return weaknesses[theme] || ['Various'];
  }

  private generateLaws(theme: string, government: GovernmentType): Law[] {
    const laws: Law[] = [];

    // Universal laws
    laws.push({
      id: uuidv4(),
      name: 'Murder prohibition',
      category: 'criminal',
      description: 'Taking another life without justification is forbidden',
      punishment: 'Death or exile',
      enforcement: 'Local authorities',
      exceptions: ['Self-defense', 'War', 'Execution']
    });

    laws.push({
      id: uuidv4(),
      name: 'Theft prohibition',
      category: 'criminal',
      description: 'Taking property without consent is forbidden',
      punishment: 'Restitution and corporal punishment',
      enforcement: 'Local authorities',
      exceptions: []
    });

    // Theme-specific laws
    if (theme === 'warrior') {
      laws.push({
        id: uuidv4(),
        name: 'Cowardice law',
        category: 'criminal',
        description: 'Fleeing from battle is a grave offense',
        punishment: 'Death or permanent dishonor',
        enforcement: 'Military command',
        exceptions: ['Strategic retreat ordered by commander']
      });
    }

    if (theme === 'religious') {
      laws.push({
        id: uuidv4(),
        name: 'Blasphemy law',
        category: 'religious',
        description: 'Speaking against the gods is forbidden',
        punishment: 'Public penance or execution',
        enforcement: 'Religious authorities',
        exceptions: []
      });
    }

    return laws;
  }

  private generateJusticeSystem(government: GovernmentType): Culture['justiceSystem'] {
    const systems: Partial<Record<GovernmentType, Culture['justiceSystem']>> = {
      [GovernmentType.THEOCRACY]: {
        type: 'divine_judgment',
        enforcers: ['Temple guards', 'Inquisitors'],
        courts: ['Religious tribunals']
      },
      [GovernmentType.TRIBAL]: {
        type: 'elder_council',
        enforcers: ['Warriors'],
        courts: ['Council of elders']
      },
      [GovernmentType.REPUBLIC]: {
        type: 'accusatorial',
        enforcers: ['City watch', 'Magistrates'],
        courts: ['Public courts', 'Senate tribunals']
      }
    };

    return systems[government] || {
      type: 'accusatorial',
      enforcers: ['Guards'],
      courts: ['Local courts']
    };
  }

  private generateTaboos(theme: string, values: CulturalValue[]): string[] {
    const taboos: string[] = ['Cannibalism', 'Incest', 'Kinslaying'];

    if (values.includes(CulturalValue.HONOR)) taboos.push('Oath-breaking');
    if (values.includes(CulturalValue.PIETY)) taboos.push('Blasphemy', 'Desecration');
    if (theme === 'nature') taboos.push('Wanton destruction of nature');
    if (theme === 'warrior') taboos.push('Cowardice', 'Attacking unarmed foes');

    return taboos;
  }

  private generateCustoms(theme: string): Custom[] {
    const customs: Custom[] = [];

    customs.push({
      id: uuidv4(),
      name: 'Greeting ritual',
      category: 'greeting',
      description: theme === 'warrior' ? 'Clasping forearms' : theme === 'religious' ? 'Blessing gesture' : 'Bow or handshake',
      participants: ['All members'],
      timing: 'Upon meeting',
      significance: 'minor',
      associatedItems: [],
      tabooViolations: ['Refusing to greet', 'Wrong gesture']
    });

    customs.push({
      id: uuidv4(),
      name: 'Hospitality custom',
      category: 'social',
      description: 'Guests must be offered food and shelter',
      participants: ['Hosts', 'Guests'],
      timing: 'When guests arrive',
      significance: 'major',
      associatedItems: ['Bread', 'Salt'],
      tabooViolations: ['Refusing hospitality', 'Harming guests']
    });

    return customs;
  }

  private generateCeremonies(theme: string): Ceremony[] {
    const ceremonies: Ceremony[] = [];

    ceremonies.push({
      id: uuidv4(),
      name: theme === 'warrior' ? 'Warrior Initiation' : 'Coming of Age',
      type: 'coming_of_age',
      description: 'Marks the transition to adulthood',
      duration: '1 day',
      location: theme === 'religious' ? 'Temple' : 'Village center',
      participants: [
        { role: 'Initiate', requirements: ['Appropriate age'] },
        { role: 'Elder', requirements: ['Respected status'] }
      ],
      steps: ['Preparation', 'Trial', 'Recognition', 'Celebration'],
      requiredItems: ['Ceremonial garments'],
      significance: 'Grants adult rights and responsibilities'
    });

    ceremonies.push({
      id: uuidv4(),
      name: 'Marriage Ceremony',
      type: 'marriage',
      description: 'Unites two individuals in partnership',
      duration: '1 day',
      location: theme === 'religious' ? 'Temple' : 'Family home',
      participants: [
        { role: 'Couple', requirements: ['Consent'] },
        { role: 'Officiant', requirements: ['Authority'] }
      ],
      steps: ['Vows', 'Exchange of tokens', 'Blessing', 'Feast'],
      requiredItems: ['Rings or equivalent', 'Ceremonial clothes'],
      significance: 'Legal and spiritual union'
    });

    return ceremonies;
  }

  private generateHolidays(theme: string): Holiday[] {
    const holidays: Holiday[] = [];

    holidays.push({
      id: uuidv4(),
      name: 'Founding Day',
      type: 'historical',
      date: 'First day of the year',
      duration: 1,
      description: 'Celebrates the founding of the culture',
      traditions: ['Parades', 'Speeches', 'Feasting'],
      foods: ['Traditional dishes'],
      activities: ['Storytelling', 'Games'],
      significance: 'National pride and unity'
    });

    holidays.push({
      id: uuidv4(),
      name: theme === 'nature' ? 'Harvest Festival' : theme === 'warrior' ? 'Victory Day' : 'Midsummer',
      type: 'seasonal',
      date: 'Summer solstice',
      duration: 3,
      description: 'Celebrates the peak of summer',
      traditions: ['Bonfires', 'Dancing', 'Competitions'],
      foods: ['Fresh produce', 'Grilled meats'],
      activities: ['Music', 'Sports', 'Courtship'],
      significance: 'Celebration of life and abundance'
    });

    return holidays;
  }

  private generateArtForms(theme: string): ArtForm[] {
    const artForms: ArtForm[] = [];

    const themeArts: Record<string, { name: string; category: ArtForm['category'] }[]> = {
      warrior: [
        { name: 'Martial poetry', category: 'literary' },
        { name: 'Weapon crafting', category: 'crafts' },
        { name: 'War drums', category: 'musical' }
      ],
      merchant: [
        { name: 'Portraiture', category: 'visual' },
        { name: 'Jewelry making', category: 'crafts' },
        { name: 'Theater', category: 'performing' }
      ],
      scholarly: [
        { name: 'Calligraphy', category: 'visual' },
        { name: 'Philosophy', category: 'literary' },
        { name: 'Astronomy charts', category: 'visual' }
      ],
      religious: [
        { name: 'Sacred music', category: 'musical' },
        { name: 'Icon painting', category: 'visual' },
        { name: 'Temple architecture', category: 'crafts' }
      ],
      artistic: [
        { name: 'Painting', category: 'visual' },
        { name: 'Sculpture', category: 'visual' },
        { name: 'Opera', category: 'performing' }
      ]
    };

    const arts = themeArts[theme] || [
      { name: 'Folk music', category: 'musical' as const },
      { name: 'Pottery', category: 'crafts' as const }
    ];

    for (const art of arts) {
      artForms.push({
        id: uuidv4(),
        name: art.name,
        category: art.category,
        description: `Traditional ${art.name.toLowerCase()}`,
        practitioners: ['Trained artists'],
        materials: ['Various'],
        themes: ['Cultural identity', 'Daily life'],
        significance: 'universal',
        famousWorks: []
      });
    }

    return artForms;
  }

  private generateArchitecture(theme: string, climate?: string): ArchitectureStyle {
    const themeArchitecture: Record<string, ArchitectureStyle[]> = {
      warrior: [ArchitectureStyle.MEGALITHIC, ArchitectureStyle.CLASSICAL],
      merchant: [ArchitectureStyle.CLASSICAL, ArchitectureStyle.BAROQUE],
      scholarly: [ArchitectureStyle.CLASSICAL, ArchitectureStyle.GOTHIC],
      religious: [ArchitectureStyle.GOTHIC, ArchitectureStyle.CLASSICAL],
      artistic: [ArchitectureStyle.BAROQUE, ArchitectureStyle.ORGANIC],
      nature: [ArchitectureStyle.ORGANIC, ArchitectureStyle.ARBOREAL],
      maritime: [ArchitectureStyle.CLASSICAL, ArchitectureStyle.ORGANIC],
      nomadic: [ArchitectureStyle.NOMADIC],
      industrial: [ArchitectureStyle.MODERNIST]
    };

    return this.randomChoice(themeArchitecture[theme] || [ArchitectureStyle.ORGANIC]);
  }

  private generateCuisine(climate: string): Cuisine {
    const climateStaples: Record<string, string[]> = {
      tropical: ['Rice', 'Yams', 'Plantains'],
      temperate: ['Wheat', 'Barley', 'Potatoes'],
      arctic: ['Fish', 'Seal', 'Berries'],
      desert: ['Dates', 'Millet', 'Legumes'],
      maritime: ['Fish', 'Seaweed', 'Rice']
    };

    return {
      staples: climateStaples[climate] || climateStaples.temperate,
      proteins: ['Beef', 'Pork', 'Fish', 'Poultry'],
      vegetables: ['Cabbage', 'Carrots', 'Onions', 'Beans'],
      spices: ['Salt', 'Pepper', 'Herbs'],
      beverages: ['Water', 'Beer', 'Wine', 'Tea'],
      cookingMethods: ['Roasting', 'Boiling', 'Baking', 'Smoking'],
      mealTimes: [
        { name: 'Breakfast', time: 'Morning', description: 'Light meal' },
        { name: 'Dinner', time: 'Midday', description: 'Main meal' },
        { name: 'Supper', time: 'Evening', description: 'Light meal' }
      ],
      diningCustoms: ['Eat with right hand', 'Elder eats first'],
      tabooFoods: [],
      celebratoryFoods: ['Roast meat', 'Sweet pastries']
    };
  }

  private generateFashion(theme: string, climate: string): Fashion {
    return {
      everyday: {
        male: 'Tunic and trousers',
        female: 'Dress or tunic and skirt',
        neutral: 'Robes'
      },
      formal: {
        male: 'Embroidered robes',
        female: 'Elaborate gown',
        neutral: 'Ceremonial vestments'
      },
      occupational: [
        { occupation: 'Warrior', attire: 'Armor and weapons' },
        { occupation: 'Priest', attire: 'Religious vestments' },
        { occupation: 'Merchant', attire: 'Fine clothes with purse' }
      ],
      materials: climate === 'arctic' ? ['Fur', 'Leather', 'Wool'] : ['Linen', 'Wool', 'Cotton'],
      colors: {
        common: ['Brown', 'Gray', 'White', 'Blue'],
        restricted: [{ color: 'Purple', restriction: 'Royalty only' }]
      },
      accessories: ['Belts', 'Jewelry', 'Hats'],
      bodyModifications: theme === 'warrior' ? ['Scarification', 'Tattoos'] : ['Piercings'],
      hairstyles: ['Long', 'Braided', 'Shaved']
    };
  }

  private generateNamingConvention(theme: string): NamingConvention {
    return {
      pattern: 'Given + Family',
      givenNames: {
        male: ['Aldric', 'Bran', 'Cedric', 'Dorian', 'Erik'],
        female: ['Aria', 'Brynn', 'Celia', 'Diana', 'Elena'],
        neutral: ['Avery', 'Blake', 'Casey', 'Drew', 'Eden']
      },
      familyNameOrigins: ['Occupation', 'Location', 'Ancestor'],
      titles: [
        { title: 'Lord/Lady', usage: 'Nobility' },
        { title: 'Master/Mistress', usage: 'Skilled craftspeople' }
      ],
      nicknames: 'Common, based on traits or deeds',
      tabooNames: ['Names of condemned criminals', 'Sacred names'],
      namingCeremonies: 'Names given at birth ceremony'
    };
  }

  private generateMilitary(theme: string, techLevel: TechnologyLevel): Culture['military'] {
    return {
      structure: theme === 'warrior' ? 'Professional army' : 'Militia with professional core',
      branches: theme === 'maritime' ? ['Navy', 'Marines'] : ['Infantry', 'Cavalry'],
      conscription: theme === 'warrior' ? 'universal' : 'selective',
      warriorTraditions: theme === 'warrior' ? ['Single combat', 'Battle chants', 'Trophy taking'] : []
    };
  }

  private generateHistoricalEvents(): { date: string; event: string }[] {
    return [
      { date: 'Ancient times', event: 'Founding of the culture' },
      { date: '500 years ago', event: 'Great war of unification' },
      { date: '200 years ago', event: 'Golden age of prosperity' },
      { date: '50 years ago', event: 'Recent major event' }
    ];
  }

  private generateLegendaryFigures(theme: string): { name: string; achievement: string }[] {
    const figures: Record<string, { name: string; achievement: string }[]> = {
      warrior: [
        { name: 'The Undefeated', achievement: 'Never lost a battle' },
        { name: 'The Founder', achievement: 'United the warring clans' }
      ],
      merchant: [
        { name: 'The Golden', achievement: 'Established the trade routes' },
        { name: 'The Fair', achievement: 'Created the merchant code' }
      ],
      scholarly: [
        { name: 'The Wise', achievement: 'Founded the great library' },
        { name: 'The Discoverer', achievement: 'Made fundamental discoveries' }
      ]
    };

    return figures[theme] || [{ name: 'The Founder', achievement: 'Established the culture' }];
  }

  private generateDefaultCuisine(): Cuisine {
    return this.generateCuisine('temperate');
  }

  private generateDefaultFashion(): Fashion {
    return this.generateFashion('warrior', 'temperate');
  }

  private generateDefaultNaming(): NamingConvention {
    return this.generateNamingConvention('warrior');
  }

  // ===========================================================================
  // EXPORT & UTILITY
  // ===========================================================================

  exportToJSON(): string {
    return JSON.stringify(Array.from(this.cultures.values()), null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json) as Culture[];
    for (const culture of data) {
      this.cultures.set(culture.id, {
        ...culture,
        createdAt: new Date(culture.createdAt),
        updatedAt: new Date(culture.updatedAt)
      });
    }
  }

  generateMarkdown(cultureId: string): string {
    const culture = this.cultures.get(cultureId);
    if (!culture) return '';

    let md = `# ${culture.name}\n\n`;
    md += `*${culture.demonym}*\n\n`;
    md += `${culture.description}\n\n`;

    md += `## Government\n`;
    md += `- **Type:** ${culture.government.replace(/_/g, ' ')}\n`;
    md += `- **Leader:** ${culture.governmentDetails.leaderTitle}\n`;
    md += `- **Succession:** ${culture.governmentDetails.succession}\n\n`;

    md += `## Society\n`;
    md += `- **Technology Level:** ${culture.technologyLevel.replace(/_/g, ' ')}\n`;
    md += `- **Economic System:** ${culture.economicSystem.replace(/_/g, ' ')}\n`;
    md += `- **Social Mobility:** ${culture.socialMobility}\n`;
    md += `- **Family Structure:** ${culture.familyStructure}\n\n`;

    md += `## Values\n`;
    for (const value of culture.values) {
      md += `- ${value}\n`;
    }
    md += `\n`;

    md += `## Social Classes\n`;
    for (const cls of culture.socialClasses) {
      md += `### ${cls.name}\n`;
      md += `${cls.description} (${cls.populationPercent}% of population)\n\n`;
    }

    if (culture.holidays.length > 0) {
      md += `## Holidays\n`;
      for (const holiday of culture.holidays) {
        md += `### ${holiday.name}\n`;
        md += `${holiday.description}\n\n`;
      }
    }

    return md;
  }
}

export default CultureDesigner;
