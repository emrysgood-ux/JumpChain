/**
 * Ecology/Biome System
 *
 * Comprehensive ecosystem and biome management for epic fiction worldbuilding.
 * Handles climates, biomes, food chains, resource distribution, and environmental dynamics.
 * Integrates with Species Designer and Location Designer for coherent worldbuilding.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

export enum BiomeType {
  // Terrestrial
  TROPICAL_RAINFOREST = 'tropical_rainforest',
  TEMPERATE_RAINFOREST = 'temperate_rainforest',
  TROPICAL_SEASONAL_FOREST = 'tropical_seasonal_forest',
  TEMPERATE_DECIDUOUS_FOREST = 'temperate_deciduous_forest',
  BOREAL_FOREST = 'boreal_forest',
  WOODLAND = 'woodland',
  SAVANNA = 'savanna',
  GRASSLAND = 'grassland',
  STEPPE = 'steppe',
  SHRUBLAND = 'shrubland',
  CHAPARRAL = 'chaparral',
  DESERT_HOT = 'desert_hot',
  DESERT_COLD = 'desert_cold',
  TUNDRA = 'tundra',
  ALPINE = 'alpine',
  MONTANE = 'montane',

  // Aquatic
  OCEAN_TROPICAL = 'ocean_tropical',
  OCEAN_TEMPERATE = 'ocean_temperate',
  OCEAN_POLAR = 'ocean_polar',
  OCEAN_DEEP = 'ocean_deep',
  CORAL_REEF = 'coral_reef',
  KELP_FOREST = 'kelp_forest',
  FRESHWATER_LAKE = 'freshwater_lake',
  FRESHWATER_RIVER = 'freshwater_river',
  WETLAND = 'wetland',
  MANGROVE = 'mangrove',
  ESTUARY = 'estuary',

  // Transitional
  COASTLINE = 'coastline',
  BEACH = 'beach',
  CLIFF = 'cliff',
  CAVE = 'cave',

  // Extreme
  VOLCANIC = 'volcanic',
  GLACIER = 'glacier',
  ICE_SHEET = 'ice_sheet',
  GEOTHERMAL = 'geothermal',

  // Fantasy
  MAGICAL_FOREST = 'magical_forest',
  CORRUPTED_LAND = 'corrupted_land',
  FLOATING_ISLANDS = 'floating_islands',
  CRYSTAL_CAVES = 'crystal_caves',
  SHADOW_REALM = 'shadow_realm',
  ELEMENTAL_PLANE = 'elemental_plane',
  VOID = 'void',

  // Other
  URBAN = 'urban',
  AGRICULTURAL = 'agricultural',
  WASTELAND = 'wasteland',
  CUSTOM = 'custom'
}

export enum ClimateType {
  TROPICAL_WET = 'tropical_wet',
  TROPICAL_MONSOON = 'tropical_monsoon',
  TROPICAL_SAVANNA = 'tropical_savanna',
  ARID_DESERT = 'arid_desert',
  ARID_STEPPE = 'arid_steppe',
  TEMPERATE_MEDITERRANEAN = 'temperate_mediterranean',
  TEMPERATE_HUMID_SUBTROPICAL = 'temperate_humid_subtropical',
  TEMPERATE_OCEANIC = 'temperate_oceanic',
  TEMPERATE_CONTINENTAL = 'temperate_continental',
  COLD_CONTINENTAL = 'cold_continental',
  COLD_SUBARCTIC = 'cold_subarctic',
  POLAR_TUNDRA = 'polar_tundra',
  POLAR_ICE_CAP = 'polar_ice_cap',
  HIGHLAND = 'highland',
  MAGICAL = 'magical',
  CUSTOM = 'custom'
}

export enum PrecipitationType {
  RAIN = 'rain',
  SNOW = 'snow',
  SLEET = 'sleet',
  HAIL = 'hail',
  DRIZZLE = 'drizzle',
  MIST = 'mist',
  NONE = 'none',
  MAGICAL = 'magical'
}

export enum SeasonType {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
  WET = 'wet',
  DRY = 'dry',
  MONSOON = 'monsoon',
  POLAR_DAY = 'polar_day',
  POLAR_NIGHT = 'polar_night',
  CUSTOM = 'custom'
}

export enum TrophicLevel {
  PRODUCER = 'producer',              // Plants, algae
  PRIMARY_CONSUMER = 'primary_consumer',     // Herbivores
  SECONDARY_CONSUMER = 'secondary_consumer',  // Carnivores eating herbivores
  TERTIARY_CONSUMER = 'tertiary_consumer',   // Apex predators
  DECOMPOSER = 'decomposer',           // Fungi, bacteria
  OMNIVORE = 'omnivore',              // Multiple levels
  APEX_PREDATOR = 'apex_predator'        // Top of food chain
}

export enum EcologicalRole {
  KEYSTONE = 'keystone',        // Critical to ecosystem
  DOMINANT = 'dominant',        // Most abundant
  RARE = 'rare',           // Uncommon but present
  ENDEMIC = 'endemic',        // Only found here
  INVASIVE = 'invasive',       // Non-native, spreading
  MIGRATORY = 'migratory',      // Seasonal visitor
  SYMBIOTIC = 'symbiotic',      // Lives with another species
  PARASITIC = 'parasitic'       // Lives off another species
}

export enum ResourceType {
  // Biologicals
  TIMBER = 'timber',
  FOOD_PLANT = 'food_plant',
  FOOD_ANIMAL = 'food_animal',
  MEDICINAL = 'medicinal',
  FIBER = 'fiber',
  DYE = 'dye',
  POISON = 'poison',
  LEATHER = 'leather',
  BONE = 'bone',
  IVORY = 'ivory',

  // Minerals
  IRON = 'iron',
  COPPER = 'copper',
  TIN = 'tin',
  GOLD = 'gold',
  SILVER = 'silver',
  GEMS = 'gems',
  COAL = 'coal',
  SALT = 'salt',
  CLAY = 'clay',
  STONE = 'stone',
  MARBLE = 'marble',

  // Energy
  WOOD_FUEL = 'wood_fuel',
  PEAT = 'peat',
  OIL = 'oil',
  NATURAL_GAS = 'natural_gas',
  GEOTHERMAL = 'geothermal_energy',

  // Water
  FRESHWATER = 'freshwater',
  MINERAL_SPRING = 'mineral_spring',
  HOT_SPRING = 'hot_spring',

  // Magical
  MANA_CRYSTALS = 'mana_crystals',
  MAGICAL_PLANTS = 'magical_plants',
  MONSTER_PARTS = 'monster_parts',
  ENCHANTED_MATERIALS = 'enchanted_materials',
  ELEMENTAL_ESSENCE = 'elemental_essence',

  // Other
  LABOR = 'labor',
  STRATEGIC_LOCATION = 'strategic_location',
  CUSTOM = 'custom'
}

export enum ResourceAbundance {
  ABSENT = 'absent',
  TRACE = 'trace',
  SCARCE = 'scarce',
  MODERATE = 'moderate',
  ABUNDANT = 'abundant',
  RICH = 'rich',
  EXCEPTIONAL = 'exceptional'
}

export enum HazardType {
  // Weather
  STORM = 'storm',
  HURRICANE = 'hurricane',
  TORNADO = 'tornado',
  BLIZZARD = 'blizzard',
  FLOOD = 'flood',
  DROUGHT = 'drought',
  HEATWAVE = 'heatwave',
  COLDSNAP = 'coldsnap',
  WILDFIRE = 'wildfire',

  // Geological
  EARTHQUAKE = 'earthquake',
  VOLCANIC_ERUPTION = 'volcanic_eruption',
  LANDSLIDE = 'landslide',
  AVALANCHE = 'avalanche',
  SINKHOLE = 'sinkhole',
  TSUNAMI = 'tsunami',

  // Biological
  PLAGUE = 'plague',
  SWARM = 'swarm',
  PREDATOR_ATTACK = 'predator_attack',
  TOXIC_BLOOM = 'toxic_bloom',
  INVASIVE_SPECIES = 'invasive_species',

  // Magical
  MAGICAL_STORM = 'magical_storm',
  WILD_MAGIC_ZONE = 'wild_magic_zone',
  CORRUPTION_SPREAD = 'corruption_spread',
  DIMENSIONAL_RIFT = 'dimensional_rift',
  CURSE = 'curse',

  // Other
  RADIATION = 'radiation',
  POLLUTION = 'pollution',
  CUSTOM = 'custom'
}

export enum ConservationStatus {
  THRIVING = 'thriving',
  STABLE = 'stable',
  DECLINING = 'declining',
  THREATENED = 'threatened',
  ENDANGERED = 'endangered',
  CRITICALLY_ENDANGERED = 'critically_endangered',
  EXTINCT_IN_WILD = 'extinct_in_wild',
  EXTINCT = 'extinct'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface TemperatureRange {
  average: number;      // Celsius
  minimum: number;
  maximum: number;
  dailyVariation: number;
  seasonalVariation: number;
}

export interface PrecipitationPattern {
  annualAmount: number;  // mm per year
  type: PrecipitationType;
  seasonality: 'even' | 'seasonal' | 'monsoon' | 'dry' | 'variable';
  wetMonths?: number[];  // 1-12
  dryMonths?: number[];
  snowfall?: number;     // cm per year
}

export interface Season {
  id: string;
  name: string;
  type: SeasonType;
  startMonth: number;    // 1-12
  endMonth: number;
  temperature: TemperatureRange;
  precipitation: PrecipitationPattern;
  dayLength: number;     // hours
  characteristics: string[];
  hazards: HazardType[];
  notes?: string;
}

export interface Climate {
  id: string;
  name: string;
  type: ClimateType;
  temperature: TemperatureRange;
  precipitation: PrecipitationPattern;
  humidity: number;       // 0-100%
  windPattern: string;
  seasons: Season[];
  extremeEvents: {
    type: HazardType;
    frequency: 'rare' | 'occasional' | 'common' | 'frequent';
    severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  }[];
  description: string;
  notes?: string;
}

export interface EcosystemOrganism {
  id: string;
  speciesId?: string;    // Reference to Species Designer
  name: string;
  trophicLevel: TrophicLevel;
  role: EcologicalRole;
  population: 'abundant' | 'common' | 'uncommon' | 'rare' | 'very_rare';
  conservationStatus: ConservationStatus;
  dietaryNeeds: string[];
  predators: string[];   // Organism IDs
  prey: string[];        // Organism IDs
  competitors: string[];  // Organism IDs
  symbionts?: string[];   // Organism IDs
  habitat: string[];     // Specific niches within biome
  seasonalBehavior?: {
    season: SeasonType;
    behavior: string;
  }[];
  notes?: string;
}

export interface FoodChain {
  id: string;
  name: string;
  description: string;
  links: {
    consumer: string;    // Organism ID
    resource: string;    // Organism ID
    energyTransfer: number; // Percentage
    relationship: 'predation' | 'grazing' | 'parasitism' | 'decomposition';
  }[];
}

export interface EcosystemResource {
  id: string;
  type: ResourceType;
  name: string;
  abundance: ResourceAbundance;
  renewability: 'renewable' | 'slowly_renewable' | 'non_renewable';
  renewalRate?: number;  // Years to regenerate
  extractionDifficulty: 'easy' | 'moderate' | 'difficult' | 'very_difficult';
  quality: 'poor' | 'average' | 'good' | 'excellent' | 'exceptional';
  locations?: string[];  // Specific locations within biome
  seasonalAvailability?: SeasonType[];
  associatedSpecies?: string[];  // Organism IDs
  uses: string[];
  value: 'low' | 'moderate' | 'high' | 'very_high' | 'priceless';
  notes?: string;
}

export interface EnvironmentalHazard {
  id: string;
  type: HazardType;
  name: string;
  description: string;
  frequency: 'rare' | 'occasional' | 'seasonal' | 'common' | 'constant';
  severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  duration: string;
  affectedArea: 'localized' | 'regional' | 'biome_wide' | 'global';
  warnings?: string[];
  prevention?: string[];
  survival?: string[];
  ecologicalImpact: string;
  historicalOccurrences?: {
    date: string;
    description: string;
    casualties?: number;
    damage?: string;
  }[];
  notes?: string;
}

export interface Biome {
  id: string;
  name: string;
  type: BiomeType;
  climate: Climate;

  // Physical characteristics
  elevation: {
    minimum: number;
    maximum: number;
    average: number;
  };
  terrain: string[];
  soilTypes: string[];
  waterSources: string[];

  // Ecology
  organisms: EcosystemOrganism[];
  foodChains: FoodChain[];
  dominantVegetation: string[];
  biodiversity: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' | 'exceptional';

  // Resources
  resources: EcosystemResource[];

  // Hazards
  hazards: EnvironmentalHazard[];

  // Human interaction
  habitability: 'uninhabitable' | 'harsh' | 'challenging' | 'moderate' | 'favorable' | 'ideal';
  carryingCapacity?: number;  // Estimated population support
  culturalSignificance?: string[];
  historicalUse?: string[];

  // Connections
  adjacentBiomes: string[];  // Biome IDs
  transitionZones?: {
    toBiome: string;
    characteristics: string[];
  }[];

  // Status
  health: 'pristine' | 'healthy' | 'stressed' | 'degraded' | 'critical' | 'collapsed';
  threats: string[];
  conservationEfforts?: string[];

  // Metadata
  area?: number;         // Square kilometers
  locations?: string[];  // Specific named locations
  description: string;
  dateCreated: Date;
  lastModified: Date;
  notes?: string;
}

export interface Ecosystem {
  id: string;
  name: string;
  description: string;
  biomes: Biome[];
  globalClimate: {
    averageTemperature: number;
    temperatureTrend: 'cooling' | 'stable' | 'warming';
    seaLevel: 'falling' | 'stable' | 'rising';
    atmosphereComposition?: Record<string, number>;
  };
  magicalInfluence?: {
    level: 'none' | 'trace' | 'low' | 'moderate' | 'high' | 'saturated';
    effects: string[];
  };
  dateCreated: Date;
  lastModified: Date;
  notes?: string;
}

export interface BiomeGenerationOptions {
  type?: BiomeType;
  climateType?: ClimateType;
  latitude?: 'tropical' | 'subtropical' | 'temperate' | 'subarctic' | 'polar';
  includeFantasyElements?: boolean;
  resourceRichness?: 'poor' | 'average' | 'rich';
  biodiversityLevel?: 'low' | 'moderate' | 'high';
  hazardFrequency?: 'rare' | 'moderate' | 'common';
  seed?: number;
}

// ============================================================================
// SEEDED RANDOM
// ============================================================================

class SeededRandom {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed ?? Math.floor(Math.random() * 2147483647);
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  pickMultiple<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => this.next() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  getSeed(): number {
    return this.seed;
  }

  setSeed(seed: number): void {
    this.seed = seed;
  }
}

// ============================================================================
// BIOME DATA
// ============================================================================

const BIOME_TEMPLATES: Partial<Record<BiomeType, Partial<Biome>>> = {
  [BiomeType.TROPICAL_RAINFOREST]: {
    dominantVegetation: ['broadleaf evergreen trees', 'epiphytes', 'lianas', 'ferns', 'palms'],
    terrain: ['lowland', 'hills', 'river valleys'],
    soilTypes: ['laterite', 'oxisol', 'clay-rich'],
    biodiversity: 'exceptional',
    habitability: 'challenging',
    description: 'Dense, humid forest with incredible biodiversity and year-round warmth.'
  },
  [BiomeType.TEMPERATE_DECIDUOUS_FOREST]: {
    dominantVegetation: ['oak', 'maple', 'beech', 'hickory', 'understory shrubs'],
    terrain: ['hills', 'valleys', 'lowlands'],
    soilTypes: ['alfisol', 'brown earth', 'loam'],
    biodiversity: 'high',
    habitability: 'favorable',
    description: 'Forest with distinct seasons, trees that shed leaves in autumn.'
  },
  [BiomeType.BOREAL_FOREST]: {
    dominantVegetation: ['spruce', 'pine', 'fir', 'birch', 'moss', 'lichen'],
    terrain: ['rolling hills', 'lakes', 'bogs'],
    soilTypes: ['spodosol', 'permafrost', 'peat'],
    biodiversity: 'moderate',
    habitability: 'challenging',
    description: 'Cold northern forest dominated by conifers, long winters.'
  },
  [BiomeType.GRASSLAND]: {
    dominantVegetation: ['grasses', 'wildflowers', 'scattered trees'],
    terrain: ['plains', 'rolling hills', 'river valleys'],
    soilTypes: ['mollisol', 'chernozem', 'prairie soil'],
    biodiversity: 'moderate',
    habitability: 'favorable',
    description: 'Open plains dominated by grasses, excellent for grazing.'
  },
  [BiomeType.SAVANNA]: {
    dominantVegetation: ['grasses', 'acacia', 'baobab', 'scattered trees'],
    terrain: ['plains', 'gentle hills'],
    soilTypes: ['alfisol', 'oxisol', 'laterite'],
    biodiversity: 'high',
    habitability: 'moderate',
    description: 'Tropical grassland with scattered trees, wet and dry seasons.'
  },
  [BiomeType.DESERT_HOT]: {
    dominantVegetation: ['cacti', 'succulents', 'drought-resistant shrubs'],
    terrain: ['dunes', 'rocky outcrops', 'dry lakebeds', 'canyons'],
    soilTypes: ['aridisol', 'sand', 'rocky'],
    biodiversity: 'low',
    habitability: 'harsh',
    description: 'Hot, dry desert with extreme temperature variations.'
  },
  [BiomeType.DESERT_COLD]: {
    dominantVegetation: ['sagebrush', 'hardy grasses', 'lichens'],
    terrain: ['rocky plains', 'mountains', 'dry valleys'],
    soilTypes: ['aridisol', 'rocky', 'gravelly'],
    biodiversity: 'low',
    habitability: 'harsh',
    description: 'Cold desert with freezing winters and hot summers.'
  },
  [BiomeType.TUNDRA]: {
    dominantVegetation: ['mosses', 'lichens', 'sedges', 'dwarf shrubs'],
    terrain: ['flat plains', 'permafrost', 'polygonal ground'],
    soilTypes: ['gelisol', 'permafrost', 'peat'],
    biodiversity: 'low',
    habitability: 'harsh',
    description: 'Treeless arctic region with permafrost and brief summers.'
  },
  [BiomeType.ALPINE]: {
    dominantVegetation: ['alpine meadows', 'dwarf shrubs', 'lichens', 'mosses'],
    terrain: ['mountains', 'peaks', 'valleys', 'glaciers'],
    soilTypes: ['rocky', 'thin soil', 'scree'],
    biodiversity: 'moderate',
    habitability: 'challenging',
    description: 'High mountain environment above treeline.'
  },
  [BiomeType.WETLAND]: {
    dominantVegetation: ['reeds', 'cattails', 'water lilies', 'sedges', 'willows'],
    terrain: ['marshes', 'swamps', 'bogs', 'floodplains'],
    soilTypes: ['histosol', 'peat', 'muck', 'clay'],
    biodiversity: 'very_high',
    habitability: 'challenging',
    description: 'Waterlogged area with unique flora and fauna.'
  },
  [BiomeType.CORAL_REEF]: {
    dominantVegetation: ['coral', 'algae', 'seagrass'],
    terrain: ['reef structure', 'lagoon', 'reef flat', 'reef slope'],
    soilTypes: ['coral sand', 'limestone'],
    biodiversity: 'exceptional',
    habitability: 'moderate',
    description: 'Underwater ecosystem built by coral, extremely biodiverse.'
  },
  [BiomeType.MAGICAL_FOREST]: {
    dominantVegetation: ['ancient trees', 'glowing plants', 'moving vines', 'singing flowers'],
    terrain: ['enchanted groves', 'fairy circles', 'crystal clearings'],
    soilTypes: ['magically enriched', 'mana-infused'],
    biodiversity: 'exceptional',
    habitability: 'moderate',
    description: 'Forest suffused with magical energy, home to mystical creatures.'
  }
};

const CLIMATE_TEMPLATES: Partial<Record<ClimateType, Partial<Climate>>> = {
  [ClimateType.TROPICAL_WET]: {
    temperature: { average: 27, minimum: 20, maximum: 35, dailyVariation: 10, seasonalVariation: 5 },
    precipitation: { annualAmount: 2500, type: PrecipitationType.RAIN, seasonality: 'even' },
    humidity: 85,
    description: 'Hot and wet year-round with minimal temperature variation.'
  },
  [ClimateType.ARID_DESERT]: {
    temperature: { average: 25, minimum: -5, maximum: 50, dailyVariation: 25, seasonalVariation: 20 },
    precipitation: { annualAmount: 100, type: PrecipitationType.RAIN, seasonality: 'variable' },
    humidity: 20,
    description: 'Extremely dry with large temperature swings.'
  },
  [ClimateType.TEMPERATE_OCEANIC]: {
    temperature: { average: 12, minimum: 0, maximum: 25, dailyVariation: 8, seasonalVariation: 15 },
    precipitation: { annualAmount: 1000, type: PrecipitationType.RAIN, seasonality: 'even' },
    humidity: 70,
    description: 'Mild, wet climate moderated by ocean influence.'
  },
  [ClimateType.POLAR_TUNDRA]: {
    temperature: { average: -15, minimum: -50, maximum: 10, dailyVariation: 10, seasonalVariation: 40 },
    precipitation: { annualAmount: 250, type: PrecipitationType.SNOW, seasonality: 'seasonal' },
    humidity: 60,
    description: 'Extremely cold with brief cool summers.'
  }
};

const ORGANISM_PRESETS: Record<string, Partial<EcosystemOrganism>[]> = {
  forest: [
    { name: 'Oak Tree', trophicLevel: TrophicLevel.PRODUCER, role: EcologicalRole.DOMINANT, population: 'abundant' },
    { name: 'Deer', trophicLevel: TrophicLevel.PRIMARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'common' },
    { name: 'Wolf', trophicLevel: TrophicLevel.TERTIARY_CONSUMER, role: EcologicalRole.KEYSTONE, population: 'uncommon' },
    { name: 'Squirrel', trophicLevel: TrophicLevel.PRIMARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'abundant' },
    { name: 'Owl', trophicLevel: TrophicLevel.SECONDARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'common' },
    { name: 'Fox', trophicLevel: TrophicLevel.SECONDARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'common' },
    { name: 'Fungi', trophicLevel: TrophicLevel.DECOMPOSER, role: EcologicalRole.KEYSTONE, population: 'abundant' }
  ],
  grassland: [
    { name: 'Prairie Grass', trophicLevel: TrophicLevel.PRODUCER, role: EcologicalRole.DOMINANT, population: 'abundant' },
    { name: 'Bison', trophicLevel: TrophicLevel.PRIMARY_CONSUMER, role: EcologicalRole.KEYSTONE, population: 'common' },
    { name: 'Prairie Dog', trophicLevel: TrophicLevel.PRIMARY_CONSUMER, role: EcologicalRole.KEYSTONE, population: 'abundant' },
    { name: 'Hawk', trophicLevel: TrophicLevel.TERTIARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'common' },
    { name: 'Coyote', trophicLevel: TrophicLevel.SECONDARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'common' },
    { name: 'Snake', trophicLevel: TrophicLevel.SECONDARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'common' }
  ],
  desert: [
    { name: 'Cactus', trophicLevel: TrophicLevel.PRODUCER, role: EcologicalRole.DOMINANT, population: 'common' },
    { name: 'Kangaroo Rat', trophicLevel: TrophicLevel.PRIMARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'common' },
    { name: 'Scorpion', trophicLevel: TrophicLevel.SECONDARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'common' },
    { name: 'Rattlesnake', trophicLevel: TrophicLevel.TERTIARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'uncommon' },
    { name: 'Vulture', trophicLevel: TrophicLevel.DECOMPOSER, role: EcologicalRole.DOMINANT, population: 'common' }
  ],
  ocean: [
    { name: 'Phytoplankton', trophicLevel: TrophicLevel.PRODUCER, role: EcologicalRole.KEYSTONE, population: 'abundant' },
    { name: 'Zooplankton', trophicLevel: TrophicLevel.PRIMARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'abundant' },
    { name: 'Small Fish', trophicLevel: TrophicLevel.SECONDARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'abundant' },
    { name: 'Large Fish', trophicLevel: TrophicLevel.TERTIARY_CONSUMER, role: EcologicalRole.DOMINANT, population: 'common' },
    { name: 'Shark', trophicLevel: TrophicLevel.APEX_PREDATOR, role: EcologicalRole.KEYSTONE, population: 'rare' },
    { name: 'Whale', trophicLevel: TrophicLevel.SECONDARY_CONSUMER, role: EcologicalRole.KEYSTONE, population: 'rare' }
  ],
  magical: [
    { name: 'Worldtree', trophicLevel: TrophicLevel.PRODUCER, role: EcologicalRole.KEYSTONE, population: 'very_rare' },
    { name: 'Glowing Fern', trophicLevel: TrophicLevel.PRODUCER, role: EcologicalRole.DOMINANT, population: 'common' },
    { name: 'Fairy', trophicLevel: TrophicLevel.OMNIVORE, role: EcologicalRole.SYMBIOTIC, population: 'uncommon' },
    { name: 'Unicorn', trophicLevel: TrophicLevel.PRIMARY_CONSUMER, role: EcologicalRole.RARE, population: 'rare' },
    { name: 'Phoenix', trophicLevel: TrophicLevel.APEX_PREDATOR, role: EcologicalRole.RARE, population: 'very_rare' },
    { name: 'Treant', trophicLevel: TrophicLevel.PRODUCER, role: EcologicalRole.KEYSTONE, population: 'rare' }
  ]
};

// ============================================================================
// ECOLOGY SYSTEM CLASS
// ============================================================================

export class EcologySystem {
  private biomes: Map<string, Biome> = new Map();
  private ecosystems: Map<string, Ecosystem> = new Map();
  private random: SeededRandom;

  constructor(seed?: number) {
    this.random = new SeededRandom(seed);
  }

  // ==========================================================================
  // SEED MANAGEMENT
  // ==========================================================================

  setSeed(seed: number): void {
    this.random.setSeed(seed);
  }

  getSeed(): number {
    return this.random.getSeed();
  }

  // ==========================================================================
  // BIOME CRUD
  // ==========================================================================

  createBiome(data: Partial<Biome> & { name: string; type: BiomeType }): Biome {
    const template = BIOME_TEMPLATES[data.type] || {};

    const biome: Biome = {
      id: uuidv4(),
      name: data.name,
      type: data.type,
      climate: data.climate || this.generateDefaultClimate(data.type),

      elevation: data.elevation || { minimum: 0, maximum: 500, average: 250 },
      terrain: data.terrain || template.terrain || [],
      soilTypes: data.soilTypes || template.soilTypes || [],
      waterSources: data.waterSources || [],

      organisms: data.organisms || [],
      foodChains: data.foodChains || [],
      dominantVegetation: data.dominantVegetation || template.dominantVegetation || [],
      biodiversity: data.biodiversity || template.biodiversity || 'moderate',

      resources: data.resources || [],
      hazards: data.hazards || [],

      habitability: data.habitability || template.habitability || 'moderate',
      carryingCapacity: data.carryingCapacity,
      culturalSignificance: data.culturalSignificance,
      historicalUse: data.historicalUse,

      adjacentBiomes: data.adjacentBiomes || [],
      transitionZones: data.transitionZones,

      health: data.health || 'healthy',
      threats: data.threats || [],
      conservationEfforts: data.conservationEfforts,

      area: data.area,
      locations: data.locations,
      description: data.description || template.description || '',
      dateCreated: new Date(),
      lastModified: new Date(),
      notes: data.notes
    };

    this.biomes.set(biome.id, biome);
    return biome;
  }

  getBiome(id: string): Biome | undefined {
    return this.biomes.get(id);
  }

  getAllBiomes(): Biome[] {
    return Array.from(this.biomes.values());
  }

  updateBiome(id: string, updates: Partial<Biome>): Biome | undefined {
    const biome = this.biomes.get(id);
    if (!biome) return undefined;

    const updated = { ...biome, ...updates, lastModified: new Date() };
    this.biomes.set(id, updated);
    return updated;
  }

  deleteBiome(id: string): boolean {
    return this.biomes.delete(id);
  }

  // ==========================================================================
  // CLIMATE GENERATION
  // ==========================================================================

  private generateDefaultClimate(biomeType: BiomeType): Climate {
    const climateType = this.getDefaultClimateForBiome(biomeType);
    return this.generateClimate(climateType);
  }

  private getDefaultClimateForBiome(biomeType: BiomeType): ClimateType {
    const mapping: Partial<Record<BiomeType, ClimateType>> = {
      [BiomeType.TROPICAL_RAINFOREST]: ClimateType.TROPICAL_WET,
      [BiomeType.TEMPERATE_DECIDUOUS_FOREST]: ClimateType.TEMPERATE_OCEANIC,
      [BiomeType.BOREAL_FOREST]: ClimateType.COLD_SUBARCTIC,
      [BiomeType.DESERT_HOT]: ClimateType.ARID_DESERT,
      [BiomeType.DESERT_COLD]: ClimateType.ARID_STEPPE,
      [BiomeType.TUNDRA]: ClimateType.POLAR_TUNDRA,
      [BiomeType.GRASSLAND]: ClimateType.TEMPERATE_CONTINENTAL,
      [BiomeType.SAVANNA]: ClimateType.TROPICAL_SAVANNA
    };

    return mapping[biomeType] || ClimateType.TEMPERATE_OCEANIC;
  }

  generateClimate(type: ClimateType): Climate {
    const template = CLIMATE_TEMPLATES[type] || CLIMATE_TEMPLATES[ClimateType.TEMPERATE_OCEANIC];

    return {
      id: uuidv4(),
      name: this.getClimateName(type),
      type,
      temperature: template?.temperature || { average: 15, minimum: -10, maximum: 35, dailyVariation: 10, seasonalVariation: 20 },
      precipitation: template?.precipitation || { annualAmount: 800, type: PrecipitationType.RAIN, seasonality: 'seasonal' },
      humidity: template?.humidity || 60,
      windPattern: this.generateWindPattern(type),
      seasons: this.generateSeasons(type),
      extremeEvents: this.generateExtremeEvents(type),
      description: template?.description || 'A typical climate pattern.'
    };
  }

  private getClimateName(type: ClimateType): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private generateWindPattern(type: ClimateType): string {
    const patterns: Record<ClimateType, string[]> = {
      [ClimateType.TROPICAL_WET]: ['Trade winds', 'Easterlies', 'Light and variable'],
      [ClimateType.TROPICAL_MONSOON]: ['Monsoon winds', 'Seasonal reversal', 'Strong seasonal'],
      [ClimateType.TROPICAL_SAVANNA]: ['Trade winds', 'Harmattan', 'Seasonal shift'],
      [ClimateType.ARID_DESERT]: ['Hot desert winds', 'Sirocco', 'Haboob'],
      [ClimateType.ARID_STEPPE]: ['Cold continental', 'Chinook', 'Variable'],
      [ClimateType.TEMPERATE_MEDITERRANEAN]: ['Sea breezes', 'Mistral', 'Westerlies'],
      [ClimateType.TEMPERATE_HUMID_SUBTROPICAL]: ['Humid southerlies', 'Typhoon tracks', 'Variable'],
      [ClimateType.TEMPERATE_OCEANIC]: ['Westerlies', 'Atlantic depressions', 'Maritime'],
      [ClimateType.TEMPERATE_CONTINENTAL]: ['Variable westerlies', 'Continental', 'Seasonal extremes'],
      [ClimateType.COLD_CONTINENTAL]: ['Polar outbreaks', 'Arctic fronts', 'Severe winters'],
      [ClimateType.COLD_SUBARCTIC]: ['Polar easterlies', 'Arctic air masses', 'Extreme cold'],
      [ClimateType.POLAR_TUNDRA]: ['Polar winds', 'Katabatic', 'Persistent cold'],
      [ClimateType.POLAR_ICE_CAP]: ['Polar vortex', 'Extreme katabatic', 'Blizzard conditions'],
      [ClimateType.HIGHLAND]: ['Mountain winds', 'Valley breezes', 'Highly variable'],
      [ClimateType.MAGICAL]: ['Ethereal currents', 'Mana flows', 'Unpredictable'],
      [ClimateType.CUSTOM]: ['Variable', 'Local patterns', 'Custom']
    };

    return this.random.pick(patterns[type] || patterns[ClimateType.CUSTOM]);
  }

  private generateSeasons(type: ClimateType): Season[] {
    const seasonConfigs: Partial<Record<ClimateType, { count: number; types: SeasonType[] }>> = {
      [ClimateType.TROPICAL_WET]: { count: 2, types: [SeasonType.WET, SeasonType.DRY] },
      [ClimateType.TROPICAL_MONSOON]: { count: 2, types: [SeasonType.MONSOON, SeasonType.DRY] },
      [ClimateType.TEMPERATE_OCEANIC]: { count: 4, types: [SeasonType.SPRING, SeasonType.SUMMER, SeasonType.AUTUMN, SeasonType.WINTER] },
      [ClimateType.POLAR_TUNDRA]: { count: 2, types: [SeasonType.POLAR_DAY, SeasonType.POLAR_NIGHT] }
    };

    const config = seasonConfigs[type] || { count: 4, types: [SeasonType.SPRING, SeasonType.SUMMER, SeasonType.AUTUMN, SeasonType.WINTER] };
    const seasons: Season[] = [];
    const monthsPerSeason = Math.floor(12 / config.count);

    for (let i = 0; i < config.count; i++) {
      const seasonType = config.types[i];
      seasons.push({
        id: uuidv4(),
        name: this.getSeasonName(seasonType),
        type: seasonType,
        startMonth: (i * monthsPerSeason) + 1,
        endMonth: ((i + 1) * monthsPerSeason),
        temperature: this.getSeasonTemperature(seasonType, type),
        precipitation: this.getSeasonPrecipitation(seasonType, type),
        dayLength: this.getSeasonDayLength(seasonType, i, config.count),
        characteristics: this.getSeasonCharacteristics(seasonType),
        hazards: this.getSeasonHazards(seasonType)
      });
    }

    return seasons;
  }

  private getSeasonName(type: SeasonType): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private getSeasonTemperature(seasonType: SeasonType, climateType: ClimateType): TemperatureRange {
    // Simplified - would be more detailed in production
    const baseTemp = CLIMATE_TEMPLATES[climateType]?.temperature?.average || 15;

    switch (seasonType) {
      case SeasonType.SUMMER:
      case SeasonType.POLAR_DAY:
        return { average: baseTemp + 10, minimum: baseTemp, maximum: baseTemp + 20, dailyVariation: 10, seasonalVariation: 5 };
      case SeasonType.WINTER:
      case SeasonType.POLAR_NIGHT:
        return { average: baseTemp - 15, minimum: baseTemp - 30, maximum: baseTemp - 5, dailyVariation: 8, seasonalVariation: 5 };
      case SeasonType.WET:
      case SeasonType.MONSOON:
        return { average: baseTemp + 5, minimum: baseTemp, maximum: baseTemp + 10, dailyVariation: 5, seasonalVariation: 3 };
      default:
        return { average: baseTemp, minimum: baseTemp - 10, maximum: baseTemp + 10, dailyVariation: 10, seasonalVariation: 5 };
    }
  }

  private getSeasonPrecipitation(seasonType: SeasonType, climateType: ClimateType): PrecipitationPattern {
    const basePrecip = CLIMATE_TEMPLATES[climateType]?.precipitation?.annualAmount || 800;

    switch (seasonType) {
      case SeasonType.WET:
      case SeasonType.MONSOON:
        return { annualAmount: basePrecip * 0.7, type: PrecipitationType.RAIN, seasonality: 'seasonal' };
      case SeasonType.DRY:
        return { annualAmount: basePrecip * 0.1, type: PrecipitationType.NONE, seasonality: 'seasonal' };
      case SeasonType.WINTER:
      case SeasonType.POLAR_NIGHT:
        return { annualAmount: basePrecip * 0.2, type: PrecipitationType.SNOW, seasonality: 'seasonal' };
      default:
        return { annualAmount: basePrecip * 0.25, type: PrecipitationType.RAIN, seasonality: 'seasonal' };
    }
  }

  private getSeasonDayLength(seasonType: SeasonType, index: number, totalSeasons: number): number {
    switch (seasonType) {
      case SeasonType.POLAR_DAY: return 24;
      case SeasonType.POLAR_NIGHT: return 0;
      case SeasonType.SUMMER: return 16;
      case SeasonType.WINTER: return 8;
      default: return 12;
    }
  }

  private getSeasonCharacteristics(type: SeasonType): string[] {
    const chars: Record<SeasonType, string[]> = {
      [SeasonType.SPRING]: ['New growth', 'Warming temperatures', 'Increased rainfall', 'Animal births'],
      [SeasonType.SUMMER]: ['Peak vegetation', 'Longest days', 'Warmest temperatures', 'Active wildlife'],
      [SeasonType.AUTUMN]: ['Leaf change', 'Harvest season', 'Cooling temperatures', 'Migration'],
      [SeasonType.WINTER]: ['Dormancy', 'Shortest days', 'Coldest temperatures', 'Snow cover'],
      [SeasonType.WET]: ['Heavy rainfall', 'Flooding', 'Lush vegetation', 'Breeding season'],
      [SeasonType.DRY]: ['Water scarcity', 'Brown vegetation', 'Fire risk', 'Animal concentration at water'],
      [SeasonType.MONSOON]: ['Intense rain', 'Strong winds', 'Flooding', 'Agricultural importance'],
      [SeasonType.POLAR_DAY]: ['Constant daylight', 'Rapid growth', 'Wildlife activity', 'Ice melt'],
      [SeasonType.POLAR_NIGHT]: ['Constant darkness', 'Extreme cold', 'Aurora activity', 'Ice formation'],
      [SeasonType.CUSTOM]: ['Variable conditions', 'Local patterns']
    };

    return chars[type] || chars[SeasonType.CUSTOM];
  }

  private getSeasonHazards(type: SeasonType): HazardType[] {
    const hazards: Record<SeasonType, HazardType[]> = {
      [SeasonType.SPRING]: [HazardType.FLOOD, HazardType.STORM],
      [SeasonType.SUMMER]: [HazardType.HEATWAVE, HazardType.WILDFIRE, HazardType.DROUGHT],
      [SeasonType.AUTUMN]: [HazardType.STORM, HazardType.FLOOD],
      [SeasonType.WINTER]: [HazardType.BLIZZARD, HazardType.COLDSNAP, HazardType.AVALANCHE],
      [SeasonType.WET]: [HazardType.FLOOD, HazardType.LANDSLIDE, HazardType.STORM],
      [SeasonType.DRY]: [HazardType.DROUGHT, HazardType.WILDFIRE],
      [SeasonType.MONSOON]: [HazardType.FLOOD, HazardType.HURRICANE, HazardType.LANDSLIDE],
      [SeasonType.POLAR_DAY]: [HazardType.FLOOD],
      [SeasonType.POLAR_NIGHT]: [HazardType.BLIZZARD, HazardType.COLDSNAP],
      [SeasonType.CUSTOM]: []
    };

    return hazards[type] || [];
  }

  private generateExtremeEvents(type: ClimateType): { type: HazardType; frequency: 'rare' | 'occasional' | 'common' | 'frequent'; severity: 'minor' | 'moderate' | 'severe' | 'catastrophic' }[] {
    const events: { type: HazardType; frequency: 'rare' | 'occasional' | 'common' | 'frequent'; severity: 'minor' | 'moderate' | 'severe' | 'catastrophic' }[] = [];

    // Add climate-appropriate extreme events
    if (type === ClimateType.TROPICAL_WET || type === ClimateType.TROPICAL_MONSOON) {
      events.push({ type: HazardType.HURRICANE, frequency: 'occasional', severity: 'severe' });
    }
    if (type === ClimateType.ARID_DESERT) {
      events.push({ type: HazardType.DROUGHT, frequency: 'common', severity: 'moderate' });
    }
    if (type === ClimateType.POLAR_TUNDRA || type === ClimateType.COLD_SUBARCTIC) {
      events.push({ type: HazardType.BLIZZARD, frequency: 'common', severity: 'moderate' });
    }

    return events;
  }

  // ==========================================================================
  // ORGANISM MANAGEMENT
  // ==========================================================================

  addOrganism(biomeId: string, organism: Partial<EcosystemOrganism> & { name: string; trophicLevel: TrophicLevel }): EcosystemOrganism | undefined {
    const biome = this.biomes.get(biomeId);
    if (!biome) return undefined;

    const newOrganism: EcosystemOrganism = {
      id: uuidv4(),
      speciesId: organism.speciesId,
      name: organism.name,
      trophicLevel: organism.trophicLevel,
      role: organism.role || EcologicalRole.DOMINANT,
      population: organism.population || 'common',
      conservationStatus: organism.conservationStatus || ConservationStatus.STABLE,
      dietaryNeeds: organism.dietaryNeeds || [],
      predators: organism.predators || [],
      prey: organism.prey || [],
      competitors: organism.competitors || [],
      symbionts: organism.symbionts,
      habitat: organism.habitat || [],
      seasonalBehavior: organism.seasonalBehavior,
      notes: organism.notes
    };

    biome.organisms.push(newOrganism);
    biome.lastModified = new Date();

    return newOrganism;
  }

  generateOrganisms(biomeId: string, count: number = 10): EcosystemOrganism[] {
    const biome = this.biomes.get(biomeId);
    if (!biome) return [];

    const presetKey = this.getBiomeOrganismPreset(biome.type);
    const preset = ORGANISM_PRESETS[presetKey] || ORGANISM_PRESETS.forest;

    const organisms: EcosystemOrganism[] = [];

    // Add organisms from preset
    for (const template of preset.slice(0, count)) {
      const organism = this.addOrganism(biomeId, {
        name: template.name || 'Unknown Species',
        trophicLevel: template.trophicLevel || TrophicLevel.PRIMARY_CONSUMER,
        role: template.role,
        population: template.population,
        conservationStatus: ConservationStatus.STABLE
      });
      if (organism) organisms.push(organism);
    }

    return organisms;
  }

  private getBiomeOrganismPreset(biomeType: BiomeType): string {
    const mapping: Partial<Record<BiomeType, string>> = {
      [BiomeType.TROPICAL_RAINFOREST]: 'forest',
      [BiomeType.TEMPERATE_DECIDUOUS_FOREST]: 'forest',
      [BiomeType.BOREAL_FOREST]: 'forest',
      [BiomeType.GRASSLAND]: 'grassland',
      [BiomeType.SAVANNA]: 'grassland',
      [BiomeType.DESERT_HOT]: 'desert',
      [BiomeType.DESERT_COLD]: 'desert',
      [BiomeType.OCEAN_TROPICAL]: 'ocean',
      [BiomeType.OCEAN_TEMPERATE]: 'ocean',
      [BiomeType.CORAL_REEF]: 'ocean',
      [BiomeType.MAGICAL_FOREST]: 'magical'
    };

    return mapping[biomeType] || 'forest';
  }

  // ==========================================================================
  // FOOD CHAIN MANAGEMENT
  // ==========================================================================

  createFoodChain(biomeId: string, name: string): FoodChain | undefined {
    const biome = this.biomes.get(biomeId);
    if (!biome) return undefined;

    const foodChain: FoodChain = {
      id: uuidv4(),
      name,
      description: '',
      links: []
    };

    biome.foodChains.push(foodChain);
    biome.lastModified = new Date();

    return foodChain;
  }

  addFoodChainLink(biomeId: string, foodChainId: string, link: { consumer: string; resource: string; energyTransfer?: number; relationship?: 'predation' | 'grazing' | 'parasitism' | 'decomposition' }): boolean {
    const biome = this.biomes.get(biomeId);
    if (!biome) return false;

    const foodChain = biome.foodChains.find(fc => fc.id === foodChainId);
    if (!foodChain) return false;

    foodChain.links.push({
      consumer: link.consumer,
      resource: link.resource,
      energyTransfer: link.energyTransfer || 10,
      relationship: link.relationship || 'predation'
    });

    biome.lastModified = new Date();
    return true;
  }

  generateFoodChain(biomeId: string): FoodChain | undefined {
    const biome = this.biomes.get(biomeId);
    if (!biome || biome.organisms.length < 2) return undefined;

    const foodChain = this.createFoodChain(biomeId, `${biome.name} Primary Food Chain`);
    if (!foodChain) return undefined;

    // Sort organisms by trophic level
    const producers = biome.organisms.filter(o => o.trophicLevel === TrophicLevel.PRODUCER);
    const primaryConsumers = biome.organisms.filter(o => o.trophicLevel === TrophicLevel.PRIMARY_CONSUMER);
    const secondaryConsumers = biome.organisms.filter(o => o.trophicLevel === TrophicLevel.SECONDARY_CONSUMER);
    const tertiaryConsumers = biome.organisms.filter(o => o.trophicLevel === TrophicLevel.TERTIARY_CONSUMER || o.trophicLevel === TrophicLevel.APEX_PREDATOR);
    const decomposers = biome.organisms.filter(o => o.trophicLevel === TrophicLevel.DECOMPOSER);

    // Create links
    for (const primary of primaryConsumers) {
      if (producers.length > 0) {
        const producer = this.random.pick(producers);
        this.addFoodChainLink(biomeId, foodChain.id, {
          consumer: primary.id,
          resource: producer.id,
          energyTransfer: 10,
          relationship: 'grazing'
        });
      }
    }

    for (const secondary of secondaryConsumers) {
      if (primaryConsumers.length > 0) {
        const prey = this.random.pick(primaryConsumers);
        this.addFoodChainLink(biomeId, foodChain.id, {
          consumer: secondary.id,
          resource: prey.id,
          energyTransfer: 10,
          relationship: 'predation'
        });
      }
    }

    for (const tertiary of tertiaryConsumers) {
      if (secondaryConsumers.length > 0) {
        const prey = this.random.pick(secondaryConsumers);
        this.addFoodChainLink(biomeId, foodChain.id, {
          consumer: tertiary.id,
          resource: prey.id,
          energyTransfer: 10,
          relationship: 'predation'
        });
      }
    }

    // Decomposers connect to all levels
    for (const decomposer of decomposers) {
      const allOthers = [...producers, ...primaryConsumers, ...secondaryConsumers, ...tertiaryConsumers];
      if (allOthers.length > 0) {
        const source = this.random.pick(allOthers);
        this.addFoodChainLink(biomeId, foodChain.id, {
          consumer: decomposer.id,
          resource: source.id,
          energyTransfer: 5,
          relationship: 'decomposition'
        });
      }
    }

    foodChain.description = `Primary food chain of ${biome.name} showing ${foodChain.links.length} trophic relationships.`;
    return foodChain;
  }

  // ==========================================================================
  // RESOURCE MANAGEMENT
  // ==========================================================================

  addResource(biomeId: string, resource: Partial<EcosystemResource> & { type: ResourceType; name: string }): EcosystemResource | undefined {
    const biome = this.biomes.get(biomeId);
    if (!biome) return undefined;

    const newResource: EcosystemResource = {
      id: uuidv4(),
      type: resource.type,
      name: resource.name,
      abundance: resource.abundance || ResourceAbundance.MODERATE,
      renewability: resource.renewability || 'renewable',
      renewalRate: resource.renewalRate,
      extractionDifficulty: resource.extractionDifficulty || 'moderate',
      quality: resource.quality || 'average',
      locations: resource.locations,
      seasonalAvailability: resource.seasonalAvailability,
      associatedSpecies: resource.associatedSpecies,
      uses: resource.uses || [],
      value: resource.value || 'moderate',
      notes: resource.notes
    };

    biome.resources.push(newResource);
    biome.lastModified = new Date();

    return newResource;
  }

  generateResources(biomeId: string, richness: 'poor' | 'average' | 'rich' = 'average'): EcosystemResource[] {
    const biome = this.biomes.get(biomeId);
    if (!biome) return [];

    const resourceCount = richness === 'poor' ? 3 : richness === 'rich' ? 10 : 6;
    const resources: EcosystemResource[] = [];

    // Always include water
    resources.push(this.addResource(biomeId, {
      type: ResourceType.FRESHWATER,
      name: 'Fresh Water',
      abundance: biome.climate.precipitation.annualAmount > 500 ? ResourceAbundance.ABUNDANT : ResourceAbundance.SCARCE,
      renewability: 'renewable'
    })!);

    // Biome-specific resources
    const biomeResources = this.getBiomeSpecificResources(biome.type);
    for (const res of this.random.pickMultiple(biomeResources, resourceCount - 1)) {
      const resource = this.addResource(biomeId, res);
      if (resource) resources.push(resource);
    }

    return resources.filter(r => r !== undefined);
  }

  private getBiomeSpecificResources(biomeType: BiomeType): (Partial<EcosystemResource> & { type: ResourceType; name: string })[] {
    const common: (Partial<EcosystemResource> & { type: ResourceType; name: string })[] = [
      { type: ResourceType.STONE, name: 'Building Stone', abundance: ResourceAbundance.MODERATE },
      { type: ResourceType.CLAY, name: 'Potter\'s Clay', abundance: ResourceAbundance.MODERATE }
    ];

    const specific: Partial<Record<BiomeType, (Partial<EcosystemResource> & { type: ResourceType; name: string })[]>> = {
      [BiomeType.TROPICAL_RAINFOREST]: [
        { type: ResourceType.TIMBER, name: 'Hardwood Timber', abundance: ResourceAbundance.ABUNDANT },
        { type: ResourceType.MEDICINAL, name: 'Medicinal Plants', abundance: ResourceAbundance.ABUNDANT },
        { type: ResourceType.DYE, name: 'Natural Dyes', abundance: ResourceAbundance.MODERATE },
        { type: ResourceType.FOOD_PLANT, name: 'Tropical Fruits', abundance: ResourceAbundance.ABUNDANT }
      ],
      [BiomeType.TEMPERATE_DECIDUOUS_FOREST]: [
        { type: ResourceType.TIMBER, name: 'Oak Timber', abundance: ResourceAbundance.ABUNDANT },
        { type: ResourceType.FOOD_ANIMAL, name: 'Game', abundance: ResourceAbundance.MODERATE },
        { type: ResourceType.LEATHER, name: 'Deer Hides', abundance: ResourceAbundance.MODERATE }
      ],
      [BiomeType.GRASSLAND]: [
        { type: ResourceType.FOOD_ANIMAL, name: 'Grazing Animals', abundance: ResourceAbundance.ABUNDANT },
        { type: ResourceType.LEATHER, name: 'Buffalo Hides', abundance: ResourceAbundance.ABUNDANT },
        { type: ResourceType.FOOD_PLANT, name: 'Wild Grains', abundance: ResourceAbundance.MODERATE }
      ],
      [BiomeType.DESERT_HOT]: [
        { type: ResourceType.SALT, name: 'Desert Salt', abundance: ResourceAbundance.MODERATE },
        { type: ResourceType.GEMS, name: 'Precious Stones', abundance: ResourceAbundance.SCARCE }
      ],
      [BiomeType.ALPINE]: [
        { type: ResourceType.IRON, name: 'Mountain Iron', abundance: ResourceAbundance.MODERATE },
        { type: ResourceType.SILVER, name: 'Silver Ore', abundance: ResourceAbundance.SCARCE },
        { type: ResourceType.GEMS, name: 'Mountain Gems', abundance: ResourceAbundance.SCARCE }
      ],
      [BiomeType.MAGICAL_FOREST]: [
        { type: ResourceType.MAGICAL_PLANTS, name: 'Enchanted Flora', abundance: ResourceAbundance.MODERATE },
        { type: ResourceType.MANA_CRYSTALS, name: 'Mana Crystals', abundance: ResourceAbundance.SCARCE },
        { type: ResourceType.MONSTER_PARTS, name: 'Magical Creature Parts', abundance: ResourceAbundance.SCARCE }
      ]
    };

    return [...common, ...(specific[biomeType] || [])];
  }

  // ==========================================================================
  // HAZARD MANAGEMENT
  // ==========================================================================

  addHazard(biomeId: string, hazard: Partial<EnvironmentalHazard> & { type: HazardType; name: string }): EnvironmentalHazard | undefined {
    const biome = this.biomes.get(biomeId);
    if (!biome) return undefined;

    const newHazard: EnvironmentalHazard = {
      id: uuidv4(),
      type: hazard.type,
      name: hazard.name,
      description: hazard.description || '',
      frequency: hazard.frequency || 'occasional',
      severity: hazard.severity || 'moderate',
      duration: hazard.duration || 'Variable',
      affectedArea: hazard.affectedArea || 'localized',
      warnings: hazard.warnings,
      prevention: hazard.prevention,
      survival: hazard.survival,
      ecologicalImpact: hazard.ecologicalImpact || 'Variable ecosystem disruption',
      historicalOccurrences: hazard.historicalOccurrences,
      notes: hazard.notes
    };

    biome.hazards.push(newHazard);
    biome.lastModified = new Date();

    return newHazard;
  }

  generateHazards(biomeId: string): EnvironmentalHazard[] {
    const biome = this.biomes.get(biomeId);
    if (!biome) return [];

    const hazards: EnvironmentalHazard[] = [];

    // Add climate-based hazards
    for (const event of biome.climate.extremeEvents) {
      const hazard = this.addHazard(biomeId, {
        type: event.type,
        name: this.getHazardName(event.type),
        description: this.getHazardDescription(event.type),
        frequency: event.frequency,
        severity: event.severity,
        ecologicalImpact: `Significant impact on local ${biome.type} ecosystem.`
      });
      if (hazard) hazards.push(hazard);
    }

    // Add seasonal hazards
    for (const season of biome.climate.seasons) {
      for (const hazardType of season.hazards.slice(0, 1)) {
        const hazard = this.addHazard(biomeId, {
          type: hazardType,
          name: `${season.name} ${this.getHazardName(hazardType)}`,
          description: `Seasonal ${this.getHazardDescription(hazardType)}`,
          frequency: 'seasonal',
          severity: 'moderate'
        });
        if (hazard) hazards.push(hazard);
      }
    }

    return hazards;
  }

  private getHazardName(type: HazardType): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private getHazardDescription(type: HazardType): string {
    const descriptions: Partial<Record<HazardType, string>> = {
      [HazardType.STORM]: 'Severe weather event with high winds and heavy precipitation.',
      [HazardType.HURRICANE]: 'Massive rotating storm system with extreme winds and flooding.',
      [HazardType.TORNADO]: 'Violent rotating column of air causing localized destruction.',
      [HazardType.BLIZZARD]: 'Severe snowstorm with high winds and reduced visibility.',
      [HazardType.FLOOD]: 'Overflow of water submerging normally dry land.',
      [HazardType.DROUGHT]: 'Extended period of abnormally low precipitation.',
      [HazardType.WILDFIRE]: 'Uncontrolled fire spreading through vegetation.',
      [HazardType.EARTHQUAKE]: 'Sudden shaking of the ground from tectonic activity.',
      [HazardType.VOLCANIC_ERUPTION]: 'Explosive release of lava, ash, and gases from a volcano.'
    };

    return descriptions[type] || 'Environmental hazard requiring caution.';
  }

  // ==========================================================================
  // RANDOM BIOME GENERATION
  // ==========================================================================

  generateRandomBiome(options: BiomeGenerationOptions = {}): Biome {
    if (options.seed !== undefined) {
      this.random.setSeed(options.seed);
    }

    const type = options.type || this.random.pick(Object.values(BiomeType).filter(t =>
      !['custom', 'void', 'elemental_plane'].includes(t)
    ));

    const name = this.generateBiomeName(type);

    // Create the biome
    const biome = this.createBiome({
      name,
      type,
      elevation: {
        minimum: this.random.nextInt(0, 500),
        maximum: this.random.nextInt(500, 3000),
        average: this.random.nextInt(250, 1500)
      }
    });

    // Generate organisms
    const biodiversityCount = options.biodiversityLevel === 'low' ? 5 :
                              options.biodiversityLevel === 'high' ? 15 : 10;
    this.generateOrganisms(biome.id, biodiversityCount);

    // Generate food chain
    this.generateFoodChain(biome.id);

    // Generate resources
    this.generateResources(biome.id, options.resourceRichness);

    // Generate hazards
    this.generateHazards(biome.id);

    return biome;
  }

  private generateBiomeName(type: BiomeType): string {
    const adjectives = ['Great', 'Ancient', 'Northern', 'Southern', 'Western', 'Eastern',
                        'High', 'Low', 'Deep', 'Wild', 'Untamed', 'Sacred'];
    const typeName = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return `The ${this.random.pick(adjectives)} ${typeName}`;
  }

  // ==========================================================================
  // ECOSYSTEM MANAGEMENT
  // ==========================================================================

  createEcosystem(data: Partial<Ecosystem> & { name: string }): Ecosystem {
    const ecosystem: Ecosystem = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      biomes: data.biomes || [],
      globalClimate: data.globalClimate || {
        averageTemperature: 15,
        temperatureTrend: 'stable',
        seaLevel: 'stable'
      },
      magicalInfluence: data.magicalInfluence,
      dateCreated: new Date(),
      lastModified: new Date(),
      notes: data.notes
    };

    this.ecosystems.set(ecosystem.id, ecosystem);
    return ecosystem;
  }

  addBiomeToEcosystem(ecosystemId: string, biomeId: string): boolean {
    const ecosystem = this.ecosystems.get(ecosystemId);
    const biome = this.biomes.get(biomeId);

    if (!ecosystem || !biome) return false;

    ecosystem.biomes.push(biome);
    ecosystem.lastModified = new Date();
    return true;
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getBiomeStats(biomeId: string): Record<string, any> | undefined {
    const biome = this.biomes.get(biomeId);
    if (!biome) return undefined;

    const trophicDistribution: Record<string, number> = {};
    for (const org of biome.organisms) {
      trophicDistribution[org.trophicLevel] = (trophicDistribution[org.trophicLevel] || 0) + 1;
    }

    const resourceDistribution: Record<string, number> = {};
    for (const res of biome.resources) {
      resourceDistribution[res.type] = (resourceDistribution[res.type] || 0) + 1;
    }

    return {
      name: biome.name,
      type: biome.type,
      area: biome.area,
      climate: biome.climate.name,
      averageTemperature: biome.climate.temperature.average,
      annualPrecipitation: biome.climate.precipitation.annualAmount,
      biodiversity: biome.biodiversity,
      organismCount: biome.organisms.length,
      trophicDistribution,
      foodChainCount: biome.foodChains.length,
      resourceCount: biome.resources.length,
      resourceDistribution,
      hazardCount: biome.hazards.length,
      habitability: biome.habitability,
      health: biome.health
    };
  }

  // ==========================================================================
  // EXPORT / IMPORT
  // ==========================================================================

  exportBiome(biomeId: string): string {
    const biome = this.biomes.get(biomeId);
    if (!biome) return '';
    return JSON.stringify(biome, null, 2);
  }

  exportAllBiomes(): string {
    return JSON.stringify(Array.from(this.biomes.values()), null, 2);
  }

  importBiome(json: string): Biome | undefined {
    try {
      const data = JSON.parse(json);
      data.id = uuidv4();
      data.dateCreated = new Date();
      data.lastModified = new Date();
      this.biomes.set(data.id, data);
      return data;
    } catch {
      return undefined;
    }
  }

  // ==========================================================================
  // MARKDOWN GENERATION
  // ==========================================================================

  generateMarkdown(biomeId: string): string {
    const biome = this.biomes.get(biomeId);
    if (!biome) return '';

    let md = `# ${biome.name}\n\n`;
    md += `**Type:** ${biome.type.replace(/_/g, ' ')}\n\n`;
    md += `${biome.description}\n\n`;

    // Climate
    md += `## Climate\n\n`;
    md += `**Type:** ${biome.climate.name}\n\n`;
    md += `- **Temperature:** ${biome.climate.temperature.minimum}°C to ${biome.climate.temperature.maximum}°C (avg: ${biome.climate.temperature.average}°C)\n`;
    md += `- **Precipitation:** ${biome.climate.precipitation.annualAmount}mm/year\n`;
    md += `- **Humidity:** ${biome.climate.humidity}%\n\n`;

    // Seasons
    if (biome.climate.seasons.length > 0) {
      md += `### Seasons\n\n`;
      for (const season of biome.climate.seasons) {
        md += `**${season.name}** (Months ${season.startMonth}-${season.endMonth})\n`;
        md += `- Temperature: ${season.temperature.average}°C\n`;
        md += `- Characteristics: ${season.characteristics.join(', ')}\n\n`;
      }
    }

    // Physical
    md += `## Physical Characteristics\n\n`;
    md += `- **Elevation:** ${biome.elevation.minimum}m - ${biome.elevation.maximum}m\n`;
    md += `- **Terrain:** ${biome.terrain.join(', ') || 'Various'}\n`;
    md += `- **Soil Types:** ${biome.soilTypes.join(', ') || 'Various'}\n`;
    md += `- **Dominant Vegetation:** ${biome.dominantVegetation.join(', ') || 'Various'}\n\n`;

    // Ecology
    md += `## Ecology\n\n`;
    md += `**Biodiversity:** ${biome.biodiversity}\n\n`;

    if (biome.organisms.length > 0) {
      md += `### Species (${biome.organisms.length})\n\n`;
      md += `| Species | Trophic Level | Role | Population |\n`;
      md += `|---------|---------------|------|------------|\n`;
      for (const org of biome.organisms.slice(0, 15)) {
        md += `| ${org.name} | ${org.trophicLevel} | ${org.role} | ${org.population} |\n`;
      }
      md += `\n`;
    }

    // Resources
    if (biome.resources.length > 0) {
      md += `## Resources\n\n`;
      md += `| Resource | Type | Abundance | Value |\n`;
      md += `|----------|------|-----------|-------|\n`;
      for (const res of biome.resources) {
        md += `| ${res.name} | ${res.type} | ${res.abundance} | ${res.value} |\n`;
      }
      md += `\n`;
    }

    // Hazards
    if (biome.hazards.length > 0) {
      md += `## Environmental Hazards\n\n`;
      for (const hazard of biome.hazards) {
        md += `### ${hazard.name}\n\n`;
        md += `${hazard.description}\n\n`;
        md += `- **Frequency:** ${hazard.frequency}\n`;
        md += `- **Severity:** ${hazard.severity}\n`;
        md += `- **Affected Area:** ${hazard.affectedArea}\n\n`;
      }
    }

    // Habitability
    md += `## Human Interaction\n\n`;
    md += `- **Habitability:** ${biome.habitability}\n`;
    if (biome.carryingCapacity) {
      md += `- **Carrying Capacity:** ~${biome.carryingCapacity.toLocaleString()} people\n`;
    }
    md += `- **Ecosystem Health:** ${biome.health}\n\n`;

    if (biome.threats.length > 0) {
      md += `**Threats:** ${biome.threats.join(', ')}\n\n`;
    }

    if (biome.notes) {
      md += `## Notes\n\n${biome.notes}\n`;
    }

    return md;
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export const ecologySystem = new EcologySystem();
