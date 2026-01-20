/**
 * Epic Fiction Architect - Worldbuilding Engines
 *
 * Comprehensive worldbuilding system for epic-scale fiction.
 * These engines work together to create coherent, detailed fictional worlds.
 */

// Species/Creature Designer
export {
  SpeciesDesigner,
  type Species,
  type SpeciesVariant,
  type Physiology,
  type LifeCycle,
  type LifeStage,
  type Ecology,
  type Behavior,
  type MagicalProperties,
  type Ability as SpeciesAbility,
  type SpeciesCulture,
  type SpeciesRule,
  type SpeciesGenerationOptions,
  SizeCategory,
  Classification,
  DietType,
  EcologicalRole,
  Locomotion,
  SenseType,
  ReproductionType,
  IntelligenceLevel,
  SocialStructure,
  Biome as SpeciesBiome
} from './species-designer';

// Culture/Civilization Designer
export {
  CultureDesigner,
  type Culture,
  type SocialClass,
  type Law,
  type Custom,
  type Ceremony,
  type Holiday,
  type ArtForm,
  type Cuisine,
  type Fashion,
  type NamingConvention,
  type CultureGenerationOptions,
  GovernmentType,
  TechnologyLevel,
  EconomicSystem,
  SocialMobility,
  FamilyStructure,
  GenderSystem,
  ArchitectureStyle,
  CulturalValue
} from './culture-designer';

// Religion/Pantheon Designer
export {
  ReligionDesigner,
  type Religion,
  type Pantheon,
  type Deity,
  type ReligionGenerationOptions,
  type DeityGenerationOptions,
  ReligionType,
  DeityRank,
  DivineDomain,
  Alignment,
  ClergyType,
  RitualType,
  AfterlifeType
} from './religion-designer';

// Magic/Power System Designer
export {
  MagicSystemDesigner,
  type MagicSystem,
  type MagicDiscipline,
  type Ability as MagicAbility,
  type MagicalItem,
  type MagicSystemGenerationOptions,
  MagicSource,
  MagicSchool,
  CostType,
  EffectType,
  PowerLevel,
  LearningMethod,
  MagicSystemType
} from './magic-system-designer';

// Location/Settlement Designer
export {
  LocationDesigner,
  type Location,
  type District,
  type Building,
  type PointOfInterest,
  type NotableNPC,
  type LocalFaction,
  type Coordinates,
  type LocationGenerationOptions,
  LocationType,
  SettlementSize,
  DistrictType,
  BuildingType,
  ClimateType,
  TerrainType,
  EconomicActivity,
  DefenseLevel
} from './location-designer';

// Name Generator
export {
  NameGenerator,
  type GeneratedName,
  type NamingStyle,
  type PhonemeSet,
  type SyllableRules,
  type NameGenerationOptions,
  NameCategory,
  NameStyle,
  Gender
} from './name-generator';

// Conlang/Language Engine
export {
  ConlangEngine,
  type Language,
  type Phoneme,
  type Phonotactics,
  type SoundChange,
  type Morpheme,
  type GrammarRule,
  type Word,
  type Phrase,
  type WritingSystem,
  type Dialect,
  type LanguageGenerationOptions,
  type TranslationResult,
  PhonemeType,
  ArticulationPlace,
  ArticulationManner,
  VowelHeight,
  VowelBackness,
  WordOrder,
  MorphologicalType,
  GrammaticalCase,
  GrammaticalGender,
  TenseSystem,
  AspectType,
  EvidentialityType,
  HonorificSystem,
  WritingSystemType,
  WritingDirection,
  WordCategory,
  SemanticDomain,
  LanguageFamily
} from './conlang-engine';

// History/Timeline Generator
export {
  HistoryGenerator,
  type Timeline,
  type HistoricalEra,
  type HistoricalEvent,
  type HistoricalFigure,
  type Civilization,
  type Conflict,
  type TimePoint,
  type DateRange,
  type HistoryGenerationOptions,
  EraType,
  EventType,
  EventScale,
  EventImpact,
  CivilizationStatus,
  FigureRole,
  ConflictType,
  RelationshipType
} from './history-generator';

// Ecology/Biome System
export {
  EcologySystem,
  type Biome,
  type Ecosystem,
  type Climate,
  type Season,
  type EcosystemOrganism,
  type FoodChain,
  type EcosystemResource,
  type EnvironmentalHazard,
  type BiomeGenerationOptions,
  BiomeType,
  ClimateType as EcologyClimateType,
  PrecipitationType,
  SeasonType,
  TrophicLevel,
  EcologicalRole as EcologyRole,
  ResourceType,
  ResourceAbundance,
  HazardType,
  ConservationStatus
} from './ecology-system';

// Economy/Trade System
export {
  EconomySystem,
  type Economy,
  type Currency,
  type CurrencyDenomination,
  type TradeGood,
  type Market,
  type TradeRoute,
  type Guild,
  type TaxSystem,
  type EconomyGenerationOptions,
  EconomicSystemType,
  CurrencyType,
  CurrencyMetal,
  GoodCategory,
  GoodQuality,
  TradeRouteType,
  MarketType,
  GuildType,
  TaxType,
  EconomicIndicator,
  WealthLevel
} from './economy-system';

/**
 * Unified Worldbuilding Suite
 *
 * Provides a single interface to all worldbuilding engines with
 * cross-engine integration and consistency checking.
 */
export class WorldbuildingSuite {
  // Phase 1 Engines
  public readonly species: import('./species-designer').SpeciesDesigner;
  public readonly cultures: import('./culture-designer').CultureDesigner;
  public readonly religions: import('./religion-designer').ReligionDesigner;
  public readonly magic: import('./magic-system-designer').MagicSystemDesigner;
  public readonly locations: import('./location-designer').LocationDesigner;

  // Phase 2 Engines
  public readonly names: import('./name-generator').NameGenerator;
  public readonly languages: import('./conlang-engine').ConlangEngine;
  public readonly history: import('./history-generator').HistoryGenerator;
  public readonly ecology: import('./ecology-system').EcologySystem;
  public readonly economy: import('./economy-system').EconomySystem;

  constructor() {
    // Dynamic imports to avoid circular dependencies
    const { SpeciesDesigner } = require('./species-designer');
    const { CultureDesigner } = require('./culture-designer');
    const { ReligionDesigner } = require('./religion-designer');
    const { MagicSystemDesigner } = require('./magic-system-designer');
    const { LocationDesigner } = require('./location-designer');
    const { NameGenerator } = require('./name-generator');
    const { ConlangEngine } = require('./conlang-engine');
    const { HistoryGenerator } = require('./history-generator');
    const { EcologySystem } = require('./ecology-system');
    const { EconomySystem } = require('./economy-system');

    // Phase 1
    this.species = new SpeciesDesigner();
    this.cultures = new CultureDesigner();
    this.religions = new ReligionDesigner();
    this.magic = new MagicSystemDesigner();
    this.locations = new LocationDesigner();

    // Phase 2
    this.names = new NameGenerator();
    this.languages = new ConlangEngine();
    this.history = new HistoryGenerator();
    this.ecology = new EcologySystem();
    this.economy = new EconomySystem();
  }

  /**
   * Set random seed for all engines (for reproducible generation)
   */
  setSeed(seed: number): void {
    // Phase 1
    this.species.setSeed(seed);
    this.cultures.setSeed(seed);
    this.religions.setSeed(seed);
    this.magic.setSeed(seed);
    this.locations.setSeed(seed);
    // Phase 2
    this.names.setSeed(seed);
    this.languages.setSeed(seed);
    this.history.setSeed(seed);
    this.ecology.setSeed(seed);
    this.economy.setSeed(seed);
  }

  /**
   * Export all worldbuilding data to JSON
   */
  exportAll(): string {
    return JSON.stringify({
      // Phase 1
      species: JSON.parse(this.species.exportToJSON()),
      cultures: JSON.parse(this.cultures.exportToJSON()),
      religions: JSON.parse(this.religions.exportToJSON()),
      magic: JSON.parse(this.magic.exportToJSON()),
      locations: JSON.parse(this.locations.exportToJSON()),
      // Phase 2
      languages: JSON.parse(this.languages.exportAllLanguages()),
      history: JSON.parse(this.history.exportAllTimelines()),
      ecology: JSON.parse(this.ecology.exportAllBiomes()),
      economy: JSON.parse(this.economy.exportAllEconomies())
    }, null, 2);
  }

  /**
   * Import all worldbuilding data from JSON
   */
  importAll(json: string): void {
    const data = JSON.parse(json);

    // Phase 1
    if (data.species) this.species.importFromJSON(JSON.stringify(data.species));
    if (data.cultures) this.cultures.importFromJSON(JSON.stringify(data.cultures));
    if (data.religions) this.religions.importFromJSON(JSON.stringify(data.religions));
    if (data.magic) this.magic.importFromJSON(JSON.stringify(data.magic));
    if (data.locations) this.locations.importFromJSON(JSON.stringify(data.locations));
    // Phase 2
    if (data.languages) {
      for (const lang of data.languages) {
        this.languages.importLanguage(JSON.stringify(lang));
      }
    }
    if (data.history) {
      for (const timeline of data.history) {
        this.history.importTimeline(JSON.stringify(timeline));
      }
    }
    if (data.ecology) {
      for (const biome of data.ecology) {
        this.ecology.importBiome(JSON.stringify(biome));
      }
    }
    if (data.economy) {
      for (const economy of data.economy) {
        this.economy.importEconomy(JSON.stringify(economy));
      }
    }
  }

  /**
   * Generate a complete random world with interconnected elements
   */
  generateWorld(options: {
    speciesCount?: number;
    cultureCount?: number;
    religionCount?: number;
    magicSystems?: number;
    locationCount?: number;
    seed?: number;
  } = {}): {
    species: import('./species-designer').Species[];
    cultures: import('./culture-designer').Culture[];
    religions: import('./religion-designer').Religion[];
    magicSystems: import('./magic-system-designer').MagicSystem[];
    locations: import('./location-designer').Location[];
  } {
    const {
      speciesCount = 5,
      cultureCount = 3,
      religionCount = 2,
      magicSystems = 1,
      locationCount = 5,
      seed
    } = options;

    if (seed) this.setSeed(seed);

    // Generate species
    const generatedSpecies = [];
    for (let i = 0; i < speciesCount; i++) {
      generatedSpecies.push(this.species.generateRandomSpecies({
        isSentient: i < 2 // First two species are sentient
      }));
    }

    // Generate cultures (linked to sentient species)
    const generatedCultures = [];
    for (let i = 0; i < cultureCount; i++) {
      const culture = this.cultures.generateRandomCulture({
        species: generatedSpecies[i % 2]?.name
      });
      generatedCultures.push(culture);
    }

    // Generate religions
    const generatedReligions = [];
    for (let i = 0; i < religionCount; i++) {
      generatedReligions.push(this.religions.generateRandomReligion());
    }

    // Generate magic systems
    const generatedMagicSystems = [];
    for (let i = 0; i < magicSystems; i++) {
      generatedMagicSystems.push(this.magic.generateRandomMagicSystem());
    }

    // Generate locations (linked to cultures)
    const generatedLocations = [];
    for (let i = 0; i < locationCount; i++) {
      const location = this.locations.generateRandomLocation({
        cultureId: generatedCultures[i % generatedCultures.length]?.id
      });
      generatedLocations.push(location);
    }

    return {
      species: generatedSpecies,
      cultures: generatedCultures,
      religions: generatedReligions,
      magicSystems: generatedMagicSystems,
      locations: generatedLocations
    };
  }

  /**
   * Get statistics about the current world
   */
  getWorldStats(): {
    // Phase 1
    speciesCount: number;
    cultureCount: number;
    religionCount: number;
    deityCount: number;
    magicSystemCount: number;
    disciplineCount: number;
    abilityCount: number;
    itemCount: number;
    locationCount: number;
    // Phase 2
    languageCount: number;
    timelineCount: number;
    biomeCount: number;
    economyCount: number;
    marketCount: number;
    guildCount: number;
  } {
    return {
      // Phase 1
      speciesCount: this.species.getAllSpecies().length,
      cultureCount: this.cultures.getAllCultures().length,
      religionCount: this.religions.getAllReligions().length,
      deityCount: this.religions.getAllDeities().length,
      magicSystemCount: this.magic.getAllMagicSystems().length,
      disciplineCount: this.magic.getAllDisciplines().length,
      abilityCount: this.magic.getAllAbilities().length,
      itemCount: this.magic.getAllMagicalItems().length,
      locationCount: this.locations.getAllLocations().length,
      // Phase 2
      languageCount: this.languages.getAllLanguages().length,
      timelineCount: this.history.getAllTimelines().length,
      biomeCount: this.ecology.getAllBiomes().length,
      economyCount: this.economy.getAllEconomies().length,
      marketCount: this.economy.getAllMarkets().length,
      guildCount: this.economy.getAllGuilds().length
    };
  }
}

export default WorldbuildingSuite;
