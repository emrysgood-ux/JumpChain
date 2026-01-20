/**
 * Epic Fiction Architect - Location/Settlement Designer
 *
 * Comprehensive system for designing locations, settlements, and places.
 * Integrates with Map Visualizer for visual representation and Culture
 * Designer for cultural context.
 *
 * Features:
 * - Settlement design (villages to metropolises)
 * - Geographic features
 * - Building and district design
 * - Population and demographics
 * - Economy and resources
 * - Government and law
 * - Notable NPCs and factions
 * - Points of interest
 * - Random generation with themes
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum LocationType {
  // Natural
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  DESERT = 'desert',
  OCEAN = 'ocean',
  LAKE = 'lake',
  RIVER = 'river',
  SWAMP = 'swamp',
  PLAINS = 'plains',
  TUNDRA = 'tundra',
  JUNGLE = 'jungle',
  CAVE = 'cave',
  ISLAND = 'island',
  VOLCANO = 'volcano',

  // Settlements
  VILLAGE = 'village',
  TOWN = 'town',
  CITY = 'city',
  METROPOLIS = 'metropolis',
  CAPITAL = 'capital',
  OUTPOST = 'outpost',
  FORTRESS = 'fortress',
  PORT = 'port',
  NOMADIC_CAMP = 'nomadic_camp',

  // Structures
  CASTLE = 'castle',
  TEMPLE = 'temple',
  DUNGEON = 'dungeon',
  RUINS = 'ruins',
  TOWER = 'tower',
  MONASTERY = 'monastery',
  ACADEMY = 'academy',
  GUILD_HALL = 'guild_hall',
  PALACE = 'palace',
  PRISON = 'prison',
  ARENA = 'arena',

  // Special
  MAGICAL_SITE = 'magical_site',
  SACRED_GROVE = 'sacred_grove',
  PORTAL = 'portal',
  POCKET_DIMENSION = 'pocket_dimension',
  BATTLEFIELD = 'battlefield',
  GRAVEYARD = 'graveyard'
}

export enum SettlementSize {
  HAMLET = 'hamlet',              // < 100
  VILLAGE = 'village',            // 100 - 1,000
  SMALL_TOWN = 'small_town',      // 1,000 - 5,000
  LARGE_TOWN = 'large_town',      // 5,000 - 15,000
  SMALL_CITY = 'small_city',      // 15,000 - 50,000
  LARGE_CITY = 'large_city',      // 50,000 - 200,000
  METROPOLIS = 'metropolis',      // 200,000 - 1,000,000
  MEGALOPOLIS = 'megalopolis'     // > 1,000,000
}

export enum DistrictType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  NOBLE = 'noble',
  SLUMS = 'slums',
  RELIGIOUS = 'religious',
  MILITARY = 'military',
  ACADEMIC = 'academic',
  GOVERNMENT = 'government',
  ENTERTAINMENT = 'entertainment',
  DOCKS = 'docks',
  MARKET = 'market',
  ARTISAN = 'artisan',
  MAGICAL = 'magical',
  FOREIGN = 'foreign'
}

export enum BuildingType {
  // Residential
  HOUSE = 'house',
  MANSION = 'mansion',
  APARTMENT = 'apartment',
  INN = 'inn',
  TAVERN = 'tavern',

  // Commercial
  SHOP = 'shop',
  MARKET = 'market',
  WAREHOUSE = 'warehouse',
  BANK = 'bank',

  // Civic
  TOWN_HALL = 'town_hall',
  COURTHOUSE = 'courthouse',
  PRISON = 'prison',
  HOSPITAL = 'hospital',
  ORPHANAGE = 'orphanage',

  // Religious
  TEMPLE = 'temple',
  SHRINE = 'shrine',
  MONASTERY = 'monastery',
  GRAVEYARD = 'graveyard',

  // Military
  BARRACKS = 'barracks',
  ARMORY = 'armory',
  WATCHTOWER = 'watchtower',
  FORTRESS = 'fortress',

  // Academic
  SCHOOL = 'school',
  LIBRARY = 'library',
  UNIVERSITY = 'university',
  OBSERVATORY = 'observatory',

  // Entertainment
  THEATER = 'theater',
  ARENA = 'arena',
  BATHHOUSE = 'bathhouse',
  BROTHEL = 'brothel',
  GAMBLING_HALL = 'gambling_hall',

  // Production
  WORKSHOP = 'workshop',
  FORGE = 'forge',
  MILL = 'mill',
  FARM = 'farm',
  MINE = 'mine',

  // Special
  MAGE_TOWER = 'mage_tower',
  THIEVES_GUILD = 'thieves_guild',
  ALCHEMIST_LAB = 'alchemist_lab',
  PORTAL_CHAMBER = 'portal_chamber'
}

export enum ClimateType {
  TROPICAL = 'tropical',
  SUBTROPICAL = 'subtropical',
  TEMPERATE = 'temperate',
  CONTINENTAL = 'continental',
  SUBARCTIC = 'subarctic',
  ARCTIC = 'arctic',
  DESERT = 'desert',
  MEDITERRANEAN = 'mediterranean',
  OCEANIC = 'oceanic',
  MAGICAL = 'magical'
}

export enum TerrainType {
  FLAT = 'flat',
  HILLY = 'hilly',
  MOUNTAINOUS = 'mountainous',
  COASTAL = 'coastal',
  ISLAND = 'island',
  RIVER_VALLEY = 'river_valley',
  FOREST = 'forest',
  SWAMP = 'swamp',
  DESERT = 'desert',
  UNDERGROUND = 'underground',
  FLOATING = 'floating',
  UNDERWATER = 'underwater'
}

export enum EconomicActivity {
  AGRICULTURE = 'agriculture',
  MINING = 'mining',
  FISHING = 'fishing',
  LOGGING = 'logging',
  HUNTING = 'hunting',
  TRADING = 'trading',
  CRAFTING = 'crafting',
  MANUFACTURING = 'manufacturing',
  BANKING = 'banking',
  TOURISM = 'tourism',
  EDUCATION = 'education',
  MILITARY = 'military',
  MAGIC = 'magic',
  RELIGION = 'religion'
}

export enum DefenseLevel {
  NONE = 'none',
  MINIMAL = 'minimal',          // Basic militia
  LIGHT = 'light',              // Wooden palisade
  MODERATE = 'moderate',        // Stone walls
  STRONG = 'strong',            // Fortified walls, garrison
  FORTRESS = 'fortress',        // Military stronghold
  IMPREGNABLE = 'impregnable'   // Legendary defenses
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude?: number;
  longitude?: number;
  x?: number;
  y?: number;
  elevation?: number;
  regionId?: string;
}

/**
 * A district or neighborhood within a settlement
 */
export interface District {
  id: string;
  name: string;
  type: DistrictType;
  description: string;

  // Characteristics
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge';
  population: number;
  wealth: 'destitute' | 'poor' | 'modest' | 'comfortable' | 'wealthy' | 'rich';
  safety: 'dangerous' | 'rough' | 'average' | 'safe' | 'secure';

  // Buildings
  buildings: Building[];
  landmarks: string[];

  // Demographics
  demographics: {
    species: { name: string; percentage: number }[];
    classes: { name: string; percentage: number }[];
  };

  // Governance
  governance: {
    ruler?: string;
    guards: number;
    laws: string[];
  };

  // Atmosphere
  atmosphere: {
    sights: string[];
    sounds: string[];
    smells: string[];
    mood: string;
  };

  // Secrets
  secrets: string[];
  hiddenLocations: string[];
}

/**
 * A building or structure
 */
export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  description: string;

  // Physical
  stories: number;
  condition: 'ruined' | 'dilapidated' | 'worn' | 'good' | 'excellent' | 'pristine';
  style: string;
  materials: string[];

  // Ownership
  owner?: string;
  staff?: { role: string; count: number }[];

  // Function
  services: string[];
  goods: string[];
  prices: 'cheap' | 'average' | 'expensive' | 'extravagant';

  // Rooms (if detailed)
  rooms?: {
    name: string;
    description: string;
    contents: string[];
  }[];

  // Secrets
  secrets: string[];
  hiddenAreas: string[];
}

/**
 * A point of interest
 */
export interface PointOfInterest {
  id: string;
  name: string;
  type: 'landmark' | 'shop' | 'tavern' | 'temple' | 'dungeon' | 'natural' | 'historical' | 'secret';
  description: string;
  location: string;
  significance: string;
  secrets?: string[];
  relatedQuests?: string[];
}

/**
 * A notable NPC
 */
export interface NotableNPC {
  id: string;
  name: string;
  role: string;
  species: string;
  description: string;
  personality: string[];
  goals: string[];
  secrets: string[];
  relationships: { name: string; relationship: string }[];
  location: string;
}

/**
 * A faction operating in the location
 */
export interface LocalFaction {
  id: string;
  name: string;
  type: 'guild' | 'gang' | 'cult' | 'noble' | 'merchant' | 'military' | 'religious' | 'political' | 'secret';
  description: string;
  influence: 'minor' | 'moderate' | 'major' | 'dominant';
  headquarters: string;
  leader: string;
  goals: string[];
  resources: string[];
  enemies: string[];
  allies: string[];
  secrets: string[];
}

/**
 * Complete location/settlement definition
 */
export interface Location {
  id: string;
  name: string;
  aliases: string[];
  type: LocationType;
  description: string;

  // Position
  coordinates: Coordinates;
  parent?: string;            // ID of containing location
  children: string[];         // IDs of contained locations

  // Geography
  geography: {
    terrain: TerrainType;
    climate: ClimateType;
    naturalFeatures: string[];
    resources: string[];
    hazards: string[];
  };

  // Settlement data (if applicable)
  settlement?: {
    size: SettlementSize;
    population: number;
    demographics: {
      species: { name: string; percentage: number }[];
      classes: { name: string; percentage: number }[];
    };
    districts: District[];
    infrastructure: {
      roads: 'none' | 'dirt' | 'gravel' | 'paved' | 'magical';
      water: 'none' | 'wells' | 'aqueduct' | 'plumbing';
      sewage: 'none' | 'gutters' | 'sewers' | 'magical';
      lighting: 'none' | 'torches' | 'lamps' | 'magical';
    };
  };

  // Governance
  governance: {
    type: string;
    ruler?: string;
    council?: string[];
    laws: string[];
    alignment: string;
  };

  // Defense
  defense: {
    level: DefenseLevel;
    walls?: string;
    garrison: number;
    militia: number;
    fortifications: string[];
  };

  // Economy
  economy: {
    activities: EconomicActivity[];
    wealth: 'destitute' | 'poor' | 'modest' | 'prosperous' | 'wealthy' | 'rich';
    currency: string;
    exports: string[];
    imports: string[];
    tradeRoutes: string[];
    marketDays: string[];
    guilds: string[];
  };

  // Culture
  culture: {
    cultureId?: string;
    languages: string[];
    religions: string[];
    festivals: string[];
    customs: string[];
    reputation: string;
  };

  // Points of interest
  pointsOfInterest: PointOfInterest[];
  notableNPCs: NotableNPC[];
  factions: LocalFaction[];

  // History
  history: {
    founded: string;
    founder?: string;
    majorEvents: { date: string; event: string }[];
    legends: string[];
  };

  // Connections
  connections: {
    roads: { destination: string; distance: string; condition: string }[];
    waterways: { destination: string; type: string }[];
    portals?: { destination: string; requirements: string }[];
  };

  // Atmosphere
  atmosphere: {
    sights: string[];
    sounds: string[];
    smells: string[];
    mood: string;
    dangerLevel: 'safe' | 'low' | 'moderate' | 'high' | 'extreme';
  };

  // Secrets
  secrets: string[];
  hiddenLocations: Location[];

  // Meta
  tags: string[];
  plotHooks: string[];

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generation options
 */
export interface LocationGenerationOptions {
  type?: LocationType;
  size?: SettlementSize;
  terrain?: TerrainType;
  climate?: ClimateType;
  theme?: 'medieval' | 'fantasy' | 'dark' | 'prosperous' | 'frontier' | 'ancient' | 'magical' | 'military';
  cultureId?: string;
  detailLevel?: 'minimal' | 'standard' | 'detailed' | 'comprehensive';
}

// ============================================================================
// LOCATION DESIGNER CLASS
// ============================================================================

export class LocationDesigner {
  private locations: Map<string, Location> = new Map();
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

  createLocation(data: Partial<Location> & { name: string; type: LocationType }): Location {
    const location: Location = {
      id: uuidv4(),
      name: data.name,
      aliases: data.aliases || [],
      type: data.type,
      description: data.description || '',
      coordinates: data.coordinates || {},
      parent: data.parent,
      children: data.children || [],
      geography: data.geography || {
        terrain: TerrainType.FLAT,
        climate: ClimateType.TEMPERATE,
        naturalFeatures: [],
        resources: [],
        hazards: []
      },
      settlement: data.settlement,
      governance: data.governance || {
        type: 'None',
        laws: [],
        alignment: 'neutral'
      },
      defense: data.defense || {
        level: DefenseLevel.NONE,
        garrison: 0,
        militia: 0,
        fortifications: []
      },
      economy: data.economy || {
        activities: [],
        wealth: 'modest',
        currency: 'gold',
        exports: [],
        imports: [],
        tradeRoutes: [],
        marketDays: [],
        guilds: []
      },
      culture: data.culture || {
        languages: [],
        religions: [],
        festivals: [],
        customs: [],
        reputation: ''
      },
      pointsOfInterest: data.pointsOfInterest || [],
      notableNPCs: data.notableNPCs || [],
      factions: data.factions || [],
      history: data.history || {
        founded: 'Unknown',
        majorEvents: [],
        legends: []
      },
      connections: data.connections || {
        roads: [],
        waterways: []
      },
      atmosphere: data.atmosphere || {
        sights: [],
        sounds: [],
        smells: [],
        mood: '',
        dangerLevel: 'low'
      },
      secrets: data.secrets || [],
      hiddenLocations: data.hiddenLocations || [],
      tags: data.tags || [],
      plotHooks: data.plotHooks || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.locations.set(location.id, location);
    return location;
  }

  getLocation(id: string): Location | undefined {
    return this.locations.get(id);
  }

  getLocationByName(name: string): Location | undefined {
    for (const loc of this.locations.values()) {
      if (loc.name.toLowerCase() === name.toLowerCase() ||
          loc.aliases.some(a => a.toLowerCase() === name.toLowerCase())) {
        return loc;
      }
    }
    return undefined;
  }

  updateLocation(id: string, updates: Partial<Location>): Location | undefined {
    const location = this.locations.get(id);
    if (!location) return undefined;

    const updated = { ...location, ...updates, id: location.id, createdAt: location.createdAt, updatedAt: new Date() };
    this.locations.set(id, updated);
    return updated;
  }

  deleteLocation(id: string): boolean {
    return this.locations.delete(id);
  }

  getAllLocations(): Location[] {
    return Array.from(this.locations.values());
  }

  queryLocations(criteria: {
    type?: LocationType;
    terrain?: TerrainType;
    climate?: ClimateType;
    tags?: string[];
  }): Location[] {
    return this.getAllLocations().filter(loc => {
      if (criteria.type && loc.type !== criteria.type) return false;
      if (criteria.terrain && loc.geography.terrain !== criteria.terrain) return false;
      if (criteria.climate && loc.geography.climate !== criteria.climate) return false;
      if (criteria.tags && !criteria.tags.every(t => loc.tags.includes(t))) return false;
      return true;
    });
  }

  // ===========================================================================
  // RANDOM GENERATION
  // ===========================================================================

  generateRandomLocation(options: LocationGenerationOptions = {}): Location {
    const type = options.type || this.randomChoice([
      LocationType.VILLAGE, LocationType.TOWN, LocationType.CITY,
      LocationType.FOREST, LocationType.MOUNTAIN, LocationType.RUINS
    ]);

    const isSettlement = this.isSettlementType(type);
    const terrain = options.terrain || this.getTerrainForType(type);
    const climate = options.climate || this.randomChoice(Object.values(ClimateType).slice(0, 9));
    const theme = options.theme || 'medieval';
    const detailLevel = options.detailLevel || 'standard';

    const name = this.generateLocationName(type, theme);
    const size = isSettlement
      ? options.size || this.getSizeForType(type)
      : undefined;

    const location = this.createLocation({
      name,
      type,
      description: this.generateDescription(name, type, terrain, climate),
      geography: this.generateGeography(terrain, climate, type),
      settlement: isSettlement ? this.generateSettlement(size!, theme, detailLevel) : undefined,
      governance: this.generateGovernance(type, size, theme),
      defense: this.generateDefense(type, size, theme),
      economy: this.generateEconomy(type, terrain, theme),
      culture: this.generateCulture(theme, options.cultureId),
      pointsOfInterest: this.generatePointsOfInterest(type, theme, detailLevel),
      notableNPCs: detailLevel !== 'minimal' ? this.generateNotableNPCs(type, theme) : [],
      factions: detailLevel === 'detailed' || detailLevel === 'comprehensive'
        ? this.generateFactions(type, theme)
        : [],
      history: this.generateHistory(type, theme),
      atmosphere: this.generateAtmosphere(type, terrain, climate, theme),
      plotHooks: this.generatePlotHooks(type, theme),
      tags: [type, terrain, climate, theme]
    });

    return location;
  }

  generateRandomSettlement(size: SettlementSize, theme: string = 'medieval'): Location {
    const type = this.getTypeForSize(size);
    return this.generateRandomLocation({
      type,
      size,
      theme: theme as LocationGenerationOptions['theme'],
      detailLevel: 'detailed'
    });
  }

  generateRegion(_name: string, locationCount: number = 5): Location[] {
    const region: Location[] = [];

    // Create main settlement (city or town)
    const mainSettlement = this.generateRandomSettlement(
      this.randomChoice([SettlementSize.SMALL_CITY, SettlementSize.LARGE_TOWN]),
      'medieval'
    );
    region.push(mainSettlement);

    // Create surrounding locations
    for (let i = 1; i < locationCount; i++) {
      const type = this.randomChoice([
        LocationType.VILLAGE, LocationType.VILLAGE,
        LocationType.FOREST, LocationType.RUINS,
        LocationType.DUNGEON, LocationType.TEMPLE
      ]);

      const location = this.generateRandomLocation({ type, detailLevel: 'standard' });

      // Add road connection to main settlement
      location.connections.roads.push({
        destination: mainSettlement.name,
        distance: `${this.randomInt(5, 50)} miles`,
        condition: this.randomChoice(['good', 'fair', 'poor'])
      });

      region.push(location);
    }

    return region;
  }

  // ===========================================================================
  // GENERATION HELPERS
  // ===========================================================================

  private isSettlementType(type: LocationType): boolean {
    return [
      LocationType.VILLAGE, LocationType.TOWN, LocationType.CITY,
      LocationType.METROPOLIS, LocationType.CAPITAL, LocationType.OUTPOST,
      LocationType.PORT, LocationType.NOMADIC_CAMP
    ].includes(type);
  }

  private getTerrainForType(type: LocationType): TerrainType {
    const mapping: Partial<Record<LocationType, TerrainType>> = {
      [LocationType.FOREST]: TerrainType.FOREST,
      [LocationType.MOUNTAIN]: TerrainType.MOUNTAINOUS,
      [LocationType.DESERT]: TerrainType.DESERT,
      [LocationType.SWAMP]: TerrainType.SWAMP,
      [LocationType.PORT]: TerrainType.COASTAL,
      [LocationType.ISLAND]: TerrainType.ISLAND,
      [LocationType.CAVE]: TerrainType.UNDERGROUND,
      [LocationType.DUNGEON]: TerrainType.UNDERGROUND
    };

    return mapping[type] || TerrainType.FLAT;
  }

  private getSizeForType(type: LocationType): SettlementSize {
    const mapping: Partial<Record<LocationType, SettlementSize>> = {
      [LocationType.VILLAGE]: SettlementSize.VILLAGE,
      [LocationType.TOWN]: SettlementSize.SMALL_TOWN,
      [LocationType.CITY]: SettlementSize.SMALL_CITY,
      [LocationType.METROPOLIS]: SettlementSize.METROPOLIS,
      [LocationType.CAPITAL]: SettlementSize.LARGE_CITY,
      [LocationType.OUTPOST]: SettlementSize.HAMLET,
      [LocationType.PORT]: SettlementSize.LARGE_TOWN
    };

    return mapping[type] || SettlementSize.VILLAGE;
  }

  private getTypeForSize(size: SettlementSize): LocationType {
    const mapping: Record<SettlementSize, LocationType> = {
      [SettlementSize.HAMLET]: LocationType.VILLAGE,
      [SettlementSize.VILLAGE]: LocationType.VILLAGE,
      [SettlementSize.SMALL_TOWN]: LocationType.TOWN,
      [SettlementSize.LARGE_TOWN]: LocationType.TOWN,
      [SettlementSize.SMALL_CITY]: LocationType.CITY,
      [SettlementSize.LARGE_CITY]: LocationType.CITY,
      [SettlementSize.METROPOLIS]: LocationType.METROPOLIS,
      [SettlementSize.MEGALOPOLIS]: LocationType.METROPOLIS
    };

    return mapping[size];
  }

  private generateLocationName(type: LocationType, theme: string): string {
    const prefixes = {
      medieval: ['Old', 'New', 'North', 'South', 'East', 'West', 'Upper', 'Lower', 'Great', 'Little'],
      fantasy: ['Silver', 'Golden', 'Crystal', 'Shadow', 'Moon', 'Sun', 'Star', 'Dragon'],
      dark: ['Black', 'Dark', 'Dead', 'Cursed', 'Haunted', 'Grim', 'Bleak', 'Raven'],
      ancient: ['Ancient', 'Elder', 'First', 'Lost', 'Forgotten', 'Eternal', 'Sacred']
    };

    const roots = {
      settlement: ['haven', 'ford', 'wick', 'ton', 'bury', 'ham', 'dale', 'vale', 'brook', 'field'],
      nature: ['wood', 'grove', 'peak', 'cliff', 'marsh', 'lake', 'river', 'falls'],
      structure: ['hold', 'keep', 'tower', 'gate', 'bridge', 'hall', 'watch', 'guard']
    };

    const category = this.isSettlementType(type) ? 'settlement' :
                     [LocationType.FOREST, LocationType.MOUNTAIN, LocationType.LAKE].includes(type) ? 'nature' : 'structure';

    const prefix = this.randomChoice(prefixes[theme as keyof typeof prefixes] || prefixes.medieval);
    const root = this.randomChoice(roots[category]);

    // Sometimes use a format like "Thornwood" vs "North Thornwood"
    if (this.random() > 0.5) {
      return prefix + root;
    } else {
      const name = this.randomChoice(['Oak', 'Thorn', 'Stone', 'Iron', 'Raven', 'Wolf', 'Bear', 'Eagle']);
      return name + root;
    }
  }

  private generateDescription(name: string, type: LocationType, terrain: TerrainType, climate: ClimateType): string {
    const typeDesc: Partial<Record<LocationType, string>> = {
      [LocationType.VILLAGE]: 'a small rural settlement',
      [LocationType.TOWN]: 'a bustling market town',
      [LocationType.CITY]: 'a thriving walled city',
      [LocationType.FOREST]: 'a dense ancient forest',
      [LocationType.MOUNTAIN]: 'a towering mountain peak',
      [LocationType.RUINS]: 'crumbling ancient ruins',
      [LocationType.DUNGEON]: 'a dangerous underground complex'
    };

    return `${name} is ${typeDesc[type] || 'a notable location'} set in ${terrain.replace(/_/g, ' ')} terrain with a ${climate} climate.`;
  }

  private generateGeography(terrain: TerrainType, climate: ClimateType, _type: LocationType): Location['geography'] {
    const featuresByTerrain: Record<string, string[]> = {
      [TerrainType.FLAT]: ['rolling hills', 'farmland', 'meadows'],
      [TerrainType.HILLY]: ['steep hills', 'valleys', 'ridges'],
      [TerrainType.MOUNTAINOUS]: ['peaks', 'cliffs', 'mountain passes'],
      [TerrainType.COASTAL]: ['beaches', 'cliffs', 'coves', 'harbor'],
      [TerrainType.FOREST]: ['ancient trees', 'clearings', 'streams'],
      [TerrainType.SWAMP]: ['bogs', 'murky pools', 'twisted trees']
    };

    const resourcesByClimate: Record<string, string[]> = {
      [ClimateType.TEMPERATE]: ['timber', 'farmland', 'iron ore'],
      [ClimateType.TROPICAL]: ['exotic fruits', 'spices', 'rare woods'],
      [ClimateType.ARCTIC]: ['furs', 'whale oil', 'ice'],
      [ClimateType.DESERT]: ['salt', 'gems', 'rare metals']
    };

    return {
      terrain,
      climate,
      naturalFeatures: featuresByTerrain[terrain] || ['varied terrain'],
      resources: resourcesByClimate[climate] || ['basic resources'],
      hazards: this.generateHazards(terrain, climate)
    };
  }

  private generateHazards(terrain: TerrainType, climate: ClimateType): string[] {
    const hazards: string[] = [];

    if (terrain === TerrainType.MOUNTAINOUS) hazards.push('avalanches', 'rockslides');
    if (terrain === TerrainType.SWAMP) hazards.push('quicksand', 'disease');
    if (terrain === TerrainType.FOREST) hazards.push('wild beasts', 'bandits');
    if (climate === ClimateType.ARCTIC) hazards.push('blizzards', 'frostbite');
    if (climate === ClimateType.DESERT) hazards.push('sandstorms', 'dehydration');

    return hazards.length > 0 ? hazards : ['occasional wildlife'];
  }

  private generateSettlement(size: SettlementSize, theme: string, detailLevel: string): Location['settlement'] {
    const populations: Record<SettlementSize, { min: number; max: number }> = {
      [SettlementSize.HAMLET]: { min: 20, max: 100 },
      [SettlementSize.VILLAGE]: { min: 100, max: 1000 },
      [SettlementSize.SMALL_TOWN]: { min: 1000, max: 5000 },
      [SettlementSize.LARGE_TOWN]: { min: 5000, max: 15000 },
      [SettlementSize.SMALL_CITY]: { min: 15000, max: 50000 },
      [SettlementSize.LARGE_CITY]: { min: 50000, max: 200000 },
      [SettlementSize.METROPOLIS]: { min: 200000, max: 1000000 },
      [SettlementSize.MEGALOPOLIS]: { min: 1000000, max: 10000000 }
    };

    const pop = populations[size];
    const population = this.randomInt(pop.min, pop.max);

    return {
      size,
      population,
      demographics: {
        species: [
          { name: 'Human', percentage: 70 },
          { name: 'Elf', percentage: 10 },
          { name: 'Dwarf', percentage: 10 },
          { name: 'Other', percentage: 10 }
        ],
        classes: [
          { name: 'Commoner', percentage: 70 },
          { name: 'Merchant', percentage: 15 },
          { name: 'Artisan', percentage: 10 },
          { name: 'Noble', percentage: 5 }
        ]
      },
      districts: detailLevel !== 'minimal' ? this.generateDistricts(size, theme) : [],
      infrastructure: this.generateInfrastructure(size)
    };
  }

  private generateDistricts(size: SettlementSize, theme: string): District[] {
    const districts: District[] = [];

    // Determine number of districts based on size
    const districtCount: Record<SettlementSize, number> = {
      [SettlementSize.HAMLET]: 0,
      [SettlementSize.VILLAGE]: 1,
      [SettlementSize.SMALL_TOWN]: 2,
      [SettlementSize.LARGE_TOWN]: 3,
      [SettlementSize.SMALL_CITY]: 5,
      [SettlementSize.LARGE_CITY]: 7,
      [SettlementSize.METROPOLIS]: 10,
      [SettlementSize.MEGALOPOLIS]: 15
    };

    const count = districtCount[size];
    const districtTypes = [
      DistrictType.MARKET, DistrictType.RESIDENTIAL, DistrictType.ARTISAN,
      DistrictType.RELIGIOUS, DistrictType.NOBLE, DistrictType.SLUMS
    ];

    for (let i = 0; i < count; i++) {
      const type = districtTypes[i % districtTypes.length];
      districts.push(this.generateDistrict(type, theme));
    }

    return districts;
  }

  private generateDistrict(type: DistrictType, _theme: string): District {
    const names: Record<DistrictType, string[]> = {
      [DistrictType.MARKET]: ['Market Square', 'Trade District', 'Merchant Quarter'],
      [DistrictType.RESIDENTIAL]: ['Old Town', 'Commons', 'Riverside'],
      [DistrictType.NOBLE]: ['High Quarter', 'Noble Hill', 'Royal Way'],
      [DistrictType.SLUMS]: ['The Warrens', 'Lowtown', 'Beggar\'s Row'],
      [DistrictType.RELIGIOUS]: ['Temple District', 'Sacred Quarter', 'Holy Hill'],
      [DistrictType.ARTISAN]: ['Craftsman Row', 'Guild Quarter', 'Workshop Lane'],
      [DistrictType.DOCKS]: ['Harbor District', 'Dockside', 'Sailor\'s Rest'],
      [DistrictType.MILITARY]: ['Garrison', 'Soldier\'s Quarter', 'Fortress Ward'],
      [DistrictType.ACADEMIC]: ['Scholar\'s Row', 'University District', 'Library Quarter'],
      [DistrictType.ENTERTAINMENT]: ['Pleasure District', 'Festival Square', 'Theater Row'],
      [DistrictType.COMMERCIAL]: ['Trade Row', 'Commerce District', 'Merchant Mile'],
      [DistrictType.INDUSTRIAL]: ['Foundry District', 'Smoke Quarter', 'Mill Row'],
      [DistrictType.GOVERNMENT]: ['Civic Center', 'Council District', 'Administration'],
      [DistrictType.MAGICAL]: ['Arcane Quarter', 'Mage Row', 'Sorcerer\'s Lane'],
      [DistrictType.FOREIGN]: ['Foreign Quarter', 'Traveler\'s District', 'Embassy Row']
    };

    return {
      id: uuidv4(),
      name: this.randomChoice(names[type] || ['District']),
      type,
      description: `The ${type.replace(/_/g, ' ')} district`,
      size: 'medium',
      population: this.randomInt(100, 5000),
      wealth: type === DistrictType.NOBLE ? 'wealthy' : type === DistrictType.SLUMS ? 'poor' : 'modest',
      safety: type === DistrictType.SLUMS ? 'dangerous' : type === DistrictType.NOBLE ? 'secure' : 'average',
      buildings: this.generateBuildingsForDistrict(type),
      landmarks: [],
      demographics: {
        species: [{ name: 'Human', percentage: 80 }],
        classes: [{ name: 'Commoner', percentage: 70 }]
      },
      governance: {
        guards: this.randomInt(2, 20),
        laws: []
      },
      atmosphere: {
        sights: this.generateDistrictSights(type),
        sounds: this.generateDistrictSounds(type),
        smells: this.generateDistrictSmells(type),
        mood: this.generateDistrictMood(type)
      },
      secrets: [],
      hiddenLocations: []
    };
  }

  private generateBuildingsForDistrict(type: DistrictType): Building[] {
    const buildings: Building[] = [];
    const buildingCount = this.randomInt(3, 8);

    const districtBuildings: Partial<Record<DistrictType, BuildingType[]>> = {
      [DistrictType.MARKET]: [BuildingType.SHOP, BuildingType.MARKET, BuildingType.WAREHOUSE, BuildingType.TAVERN],
      [DistrictType.RESIDENTIAL]: [BuildingType.HOUSE, BuildingType.INN, BuildingType.TAVERN],
      [DistrictType.NOBLE]: [BuildingType.MANSION, BuildingType.THEATER, BuildingType.BATHHOUSE],
      [DistrictType.RELIGIOUS]: [BuildingType.TEMPLE, BuildingType.SHRINE, BuildingType.MONASTERY],
      [DistrictType.ARTISAN]: [BuildingType.WORKSHOP, BuildingType.FORGE, BuildingType.SHOP]
    };

    const types = districtBuildings[type] || [BuildingType.HOUSE, BuildingType.SHOP];

    for (let i = 0; i < buildingCount; i++) {
      buildings.push(this.generateBuilding(this.randomChoice(types)));
    }

    return buildings;
  }

  private generateBuilding(type: BuildingType): Building {
    const names: Partial<Record<BuildingType, string[]>> = {
      [BuildingType.TAVERN]: ['The Prancing Pony', 'The Golden Dragon', 'The Rusty Nail', 'The Drunken Sailor'],
      [BuildingType.INN]: ['The Weary Traveler', 'Rest Haven', 'The Comfortable Bed', 'Waypoint Inn'],
      [BuildingType.SHOP]: ['General Goods', 'Fine Wares', 'Sundries and More'],
      [BuildingType.TEMPLE]: ['Temple of Light', 'Shrine of the Divine', 'House of Worship'],
      [BuildingType.FORGE]: ['The Iron Hammer', 'Fire and Steel', 'The Master\'s Forge']
    };

    return {
      id: uuidv4(),
      name: this.randomChoice(names[type] || ['Building']),
      type,
      description: `A ${type.replace(/_/g, ' ')}`,
      stories: this.randomInt(1, 3),
      condition: this.randomChoice(['worn', 'good', 'excellent']),
      style: 'Local traditional',
      materials: ['stone', 'timber'],
      services: this.getServicesForBuilding(type),
      goods: this.getGoodsForBuilding(type),
      prices: 'average',
      secrets: [],
      hiddenAreas: []
    };
  }

  private getServicesForBuilding(type: BuildingType): string[] {
    const services: Partial<Record<BuildingType, string[]>> = {
      [BuildingType.TAVERN]: ['Food', 'Drink', 'Entertainment', 'Information'],
      [BuildingType.INN]: ['Lodging', 'Meals', 'Stabling'],
      [BuildingType.TEMPLE]: ['Worship', 'Healing', 'Blessings', 'Counsel'],
      [BuildingType.FORGE]: ['Weapon repair', 'Armor repair', 'Custom orders']
    };

    return services[type] || [];
  }

  private getGoodsForBuilding(type: BuildingType): string[] {
    const goods: Partial<Record<BuildingType, string[]>> = {
      [BuildingType.SHOP]: ['General supplies', 'Tools', 'Provisions'],
      [BuildingType.FORGE]: ['Weapons', 'Armor', 'Tools'],
      [BuildingType.MARKET]: ['Food', 'Cloth', 'Livestock', 'Crafts']
    };

    return goods[type] || [];
  }

  private generateDistrictSights(type: DistrictType): string[] {
    const sights: Partial<Record<DistrictType, string[]>> = {
      [DistrictType.MARKET]: ['Colorful merchant stalls', 'Exotic goods on display', 'Haggling crowds'],
      [DistrictType.NOBLE]: ['Ornate mansions', 'Manicured gardens', 'Gilded carriages'],
      [DistrictType.SLUMS]: ['Cramped hovels', 'Muddy streets', 'Desperate faces'],
      [DistrictType.RELIGIOUS]: ['Towering spires', 'Sacred symbols', 'Pilgrims praying']
    };

    return sights[type] || ['Various buildings', 'People going about their day'];
  }

  private generateDistrictSounds(type: DistrictType): string[] {
    const sounds: Partial<Record<DistrictType, string[]>> = {
      [DistrictType.MARKET]: ['Merchants calling their wares', 'Coins clinking', 'Lively haggling'],
      [DistrictType.ARTISAN]: ['Hammering', 'Sawing', 'Craftsmen working'],
      [DistrictType.RELIGIOUS]: ['Bells tolling', 'Chanting', 'Quiet prayers'],
      [DistrictType.SLUMS]: ['Arguments', 'Crying children', 'Barking dogs']
    };

    return sounds[type] || ['General city sounds'];
  }

  private generateDistrictSmells(type: DistrictType): string[] {
    const smells: Partial<Record<DistrictType, string[]>> = {
      [DistrictType.MARKET]: ['Spices', 'Fresh bread', 'Livestock'],
      [DistrictType.ARTISAN]: ['Hot metal', 'Sawdust', 'Leather'],
      [DistrictType.RELIGIOUS]: ['Incense', 'Candle wax', 'Flowers'],
      [DistrictType.SLUMS]: ['Refuse', 'Unwashed bodies', 'Stale air']
    };

    return smells[type] || ['General smells'];
  }

  private generateDistrictMood(type: DistrictType): string {
    const moods: Partial<Record<DistrictType, string>> = {
      [DistrictType.MARKET]: 'Bustling and energetic',
      [DistrictType.NOBLE]: 'Refined and haughty',
      [DistrictType.SLUMS]: 'Desperate and wary',
      [DistrictType.RELIGIOUS]: 'Reverent and peaceful',
      [DistrictType.ENTERTAINMENT]: 'Lively and indulgent'
    };

    return moods[type] || 'Ordinary';
  }

  private generateInfrastructure(size: SettlementSize): NonNullable<Location['settlement']>['infrastructure'] {
    const sizeLevel = Object.values(SettlementSize).indexOf(size);

    return {
      roads: sizeLevel < 2 ? 'dirt' : sizeLevel < 5 ? 'gravel' : 'paved',
      water: sizeLevel < 2 ? 'wells' : sizeLevel < 5 ? 'aqueduct' : 'plumbing',
      sewage: sizeLevel < 3 ? 'gutters' : 'sewers',
      lighting: sizeLevel < 3 ? 'torches' : 'lamps'
    };
  }

  private generateGovernance(_type: LocationType, size?: SettlementSize, _theme?: string): Location['governance'] {
    const rulers = ['Mayor', 'Lord', 'Council', 'Baron', 'Duke', 'King'];
    const ruler = size && Object.values(SettlementSize).indexOf(size) > 3
      ? this.randomChoice(rulers.slice(2))
      : this.randomChoice(rulers.slice(0, 3));

    return {
      type: size === SettlementSize.HAMLET ? 'Village Elder' : ruler,
      ruler: `${ruler} ${this.randomChoice(['Smith', 'Iron', 'Stone', 'Gold'])}`,
      laws: ['No murder', 'No theft', 'Pay your taxes', 'Respect the authority'],
      alignment: this.randomChoice(['lawful', 'neutral', 'chaotic'])
    };
  }

  private generateDefense(type: LocationType, size?: SettlementSize, _theme?: string): Location['defense'] {
    if (!this.isSettlementType(type)) {
      return { level: DefenseLevel.NONE, garrison: 0, militia: 0, fortifications: [] };
    }

    const sizeLevel = size ? Object.values(SettlementSize).indexOf(size) : 0;
    const defenseLevel = sizeLevel < 2 ? DefenseLevel.MINIMAL :
                         sizeLevel < 4 ? DefenseLevel.LIGHT :
                         sizeLevel < 6 ? DefenseLevel.MODERATE : DefenseLevel.STRONG;

    return {
      level: defenseLevel,
      walls: sizeLevel > 2 ? 'Stone walls' : sizeLevel > 0 ? 'Wooden palisade' : undefined,
      garrison: sizeLevel * 10,
      militia: sizeLevel * 50,
      fortifications: sizeLevel > 3 ? ['Gatehouse', 'Towers', 'Moat'] : []
    };
  }

  private generateEconomy(_type: LocationType, terrain: TerrainType, _theme: string): Location['economy'] {
    const activities = this.getEconomicActivities(terrain);

    return {
      activities,
      wealth: this.randomChoice(['poor', 'modest', 'modest', 'prosperous', 'wealthy']),
      currency: 'Gold coins',
      exports: this.getExportsForTerrain(terrain),
      imports: ['Luxury goods', 'Tools', 'Weapons'],
      tradeRoutes: [],
      marketDays: ['Every seventh day'],
      guilds: activities.includes(EconomicActivity.CRAFTING)
        ? ['Smiths Guild', 'Weavers Guild', 'Merchants Guild']
        : []
    };
  }

  private getEconomicActivities(terrain: TerrainType): EconomicActivity[] {
    const activities: Record<string, EconomicActivity[]> = {
      [TerrainType.FLAT]: [EconomicActivity.AGRICULTURE, EconomicActivity.TRADING],
      [TerrainType.COASTAL]: [EconomicActivity.FISHING, EconomicActivity.TRADING],
      [TerrainType.MOUNTAINOUS]: [EconomicActivity.MINING, EconomicActivity.CRAFTING],
      [TerrainType.FOREST]: [EconomicActivity.LOGGING, EconomicActivity.HUNTING]
    };

    return activities[terrain] || [EconomicActivity.AGRICULTURE];
  }

  private getExportsForTerrain(terrain: TerrainType): string[] {
    const exports: Record<string, string[]> = {
      [TerrainType.FLAT]: ['Grain', 'Livestock', 'Textiles'],
      [TerrainType.COASTAL]: ['Fish', 'Salt', 'Ships'],
      [TerrainType.MOUNTAINOUS]: ['Ore', 'Gems', 'Stone'],
      [TerrainType.FOREST]: ['Timber', 'Furs', 'Herbs']
    };

    return exports[terrain] || ['Trade goods'];
  }

  private generateCulture(_theme: string, cultureId?: string): Location['culture'] {
    return {
      cultureId,
      languages: ['Common', 'Local dialect'],
      religions: ['The Divine', 'Old Gods'],
      festivals: ['Harvest Festival', 'Midsummer Fair', 'Founder\'s Day'],
      customs: ['Hospitality to travelers', 'Respect for elders'],
      reputation: this.randomChoice(['Friendly', 'Insular', 'Welcoming', 'Suspicious of outsiders'])
    };
  }

  private generatePointsOfInterest(_type: LocationType, _theme: string, detailLevel: string): PointOfInterest[] {
    if (detailLevel === 'minimal') return [];

    const pois: PointOfInterest[] = [];
    const count = detailLevel === 'comprehensive' ? 5 : 3;

    const poiTypes: PointOfInterest['type'][] = ['landmark', 'shop', 'tavern', 'temple', 'historical'];

    for (let i = 0; i < count; i++) {
      const poiType = poiTypes[i % poiTypes.length];
      pois.push({
        id: uuidv4(),
        name: this.generatePOIName(poiType),
        type: poiType,
        description: `A notable ${poiType}`,
        location: 'Town center',
        significance: `Important local ${poiType}`
      });
    }

    return pois;
  }

  private generatePOIName(type: PointOfInterest['type']): string {
    const names: Record<string, string[]> = {
      landmark: ['The Old Oak', 'The Standing Stones', 'The Founder\'s Statue'],
      shop: ['Curious Goods', 'The Emporium', 'Adventurer\'s Supply'],
      tavern: ['The Sleeping Giant', 'The Red Dragon', 'The Merry Minstrel'],
      temple: ['Temple of the Sun', 'Shrine of the Ancestors', 'The Holy Grove'],
      historical: ['The Ancient Wall', 'Hero\'s Memorial', 'The Old Battlefield']
    };

    return this.randomChoice(names[type] || ['Notable Place']);
  }

  private generateNotableNPCs(_type: LocationType, _theme: string): NotableNPC[] {
    const npcs: NotableNPC[] = [];

    npcs.push({
      id: uuidv4(),
      name: this.randomChoice(['Aldric', 'Brynn', 'Cedric', 'Diana']) + ' ' +
            this.randomChoice(['Smith', 'Stone', 'Iron', 'Gold']),
      role: 'Local leader',
      species: 'Human',
      description: 'The person in charge',
      personality: ['Pragmatic', 'Fair'],
      goals: ['Maintain order', 'Grow prosperity'],
      secrets: ['Hidden past'],
      relationships: [],
      location: 'Town hall'
    });

    npcs.push({
      id: uuidv4(),
      name: this.randomChoice(['Old', 'Wise', 'Mad']) + ' ' +
            this.randomChoice(['Gareth', 'Moira', 'Thomas']),
      role: 'Local sage',
      species: 'Human',
      description: 'The person who knows things',
      personality: ['Knowledgeable', 'Eccentric'],
      goals: ['Uncover secrets', 'Share knowledge'],
      secrets: ['Knows ancient lore'],
      relationships: [],
      location: 'Library or home'
    });

    return npcs;
  }

  private generateFactions(_type: LocationType, theme: string): LocalFaction[] {
    const factions: LocalFaction[] = [];

    factions.push({
      id: uuidv4(),
      name: 'The Merchant Guild',
      type: 'merchant',
      description: 'Controls local trade',
      influence: 'major',
      headquarters: 'Guild Hall',
      leader: 'Guildmaster',
      goals: ['Maximize profits', 'Control trade'],
      resources: ['Gold', 'Connections'],
      enemies: [],
      allies: [],
      secrets: ['Hidden dealings']
    });

    if (theme === 'dark' || this.random() > 0.5) {
      factions.push({
        id: uuidv4(),
        name: 'The Shadow Hand',
        type: 'gang',
        description: 'Criminal underworld',
        influence: 'moderate',
        headquarters: 'Hidden',
        leader: 'The Boss',
        goals: ['Control crime', 'Accumulate power'],
        resources: ['Rogues', 'Information'],
        enemies: ['The Watch'],
        allies: [],
        secrets: ['Widespread influence']
      });
    }

    return factions;
  }

  private generateHistory(_type: LocationType, _theme: string): Location['history'] {
    return {
      founded: `${this.randomInt(100, 2000)} years ago`,
      founder: this.randomChoice(['A great hero', 'Refugees', 'A noble house', 'Ancient settlers']),
      majorEvents: [
        { date: '200 years ago', event: 'The Great Fire' },
        { date: '100 years ago', event: 'The Siege' },
        { date: '50 years ago', event: 'The Golden Era began' }
      ],
      legends: ['The founder\'s treasure', 'The ghost of the old tower', 'The dragon that once lived here']
    };
  }

  private generateAtmosphere(type: LocationType, _terrain: TerrainType, _climate: ClimateType, theme: string): Location['atmosphere'] {
    return {
      sights: this.generateSightsForType(type),
      sounds: this.generateSoundsForType(type),
      smells: this.generateSmellsForType(type),
      mood: this.generateMoodForTheme(theme),
      dangerLevel: theme === 'dark' ? 'moderate' : 'low'
    };
  }

  private generateSightsForType(type: LocationType): string[] {
    if (this.isSettlementType(type)) {
      return ['Busy streets', 'Market stalls', 'Towering buildings', 'Diverse population'];
    }
    return ['Natural beauty', 'Wildlife', 'Untamed wilderness'];
  }

  private generateSoundsForType(type: LocationType): string[] {
    if (this.isSettlementType(type)) {
      return ['Chatter of crowds', 'Merchants calling', 'Carts rolling', 'Bells ringing'];
    }
    return ['Wind through trees', 'Wildlife calls', 'Running water'];
  }

  private generateSmellsForType(type: LocationType): string[] {
    if (this.isSettlementType(type)) {
      return ['Cooking food', 'Wood smoke', 'Horses', 'Perfume and sweat'];
    }
    return ['Fresh air', 'Flowers', 'Earth', 'Rain'];
  }

  private generateMoodForTheme(theme: string): string {
    const moods: Record<string, string> = {
      medieval: 'Bustling and orderly',
      fantasy: 'Magical and wondrous',
      dark: 'Ominous and tense',
      prosperous: 'Wealthy and content',
      frontier: 'Rugged and hopeful',
      ancient: 'Timeless and mysterious'
    };

    return moods[theme] || 'Ordinary';
  }

  private generatePlotHooks(_type: LocationType, _theme: string): string[] {
    const hooks: string[] = [];

    hooks.push('Strange disappearances have been reported');
    hooks.push('A valuable item has been stolen');
    hooks.push('Tensions are rising between two factions');
    hooks.push('An ancient evil stirs beneath the surface');
    hooks.push('A mysterious stranger seeks adventurers');

    return this.randomChoices(hooks, 3);
  }

  // ===========================================================================
  // EXPORT & UTILITY
  // ===========================================================================

  exportToJSON(): string {
    return JSON.stringify(Array.from(this.locations.values()), null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json) as Location[];
    for (const location of data) {
      this.locations.set(location.id, {
        ...location,
        createdAt: new Date(location.createdAt),
        updatedAt: new Date(location.updatedAt)
      });
    }
  }

  generateMarkdown(locationId: string): string {
    const loc = this.locations.get(locationId);
    if (!loc) return '';

    let md = `# ${loc.name}\n\n`;
    md += `*${loc.type.replace(/_/g, ' ')}*\n\n`;
    md += `${loc.description}\n\n`;

    md += `## Geography\n`;
    md += `- **Terrain:** ${loc.geography.terrain}\n`;
    md += `- **Climate:** ${loc.geography.climate}\n`;
    md += `- **Features:** ${loc.geography.naturalFeatures.join(', ')}\n\n`;

    if (loc.settlement) {
      md += `## Settlement\n`;
      md += `- **Size:** ${loc.settlement.size}\n`;
      md += `- **Population:** ${loc.settlement.population.toLocaleString()}\n\n`;

      if (loc.settlement.districts.length > 0) {
        md += `### Districts\n`;
        for (const district of loc.settlement.districts) {
          md += `- **${district.name}** (${district.type}): ${district.description}\n`;
        }
        md += `\n`;
      }
    }

    md += `## Governance\n`;
    md += `- **Type:** ${loc.governance.type}\n`;
    if (loc.governance.ruler) md += `- **Ruler:** ${loc.governance.ruler}\n`;
    md += `\n`;

    md += `## Economy\n`;
    md += `- **Wealth:** ${loc.economy.wealth}\n`;
    md += `- **Activities:** ${loc.economy.activities.join(', ')}\n`;
    md += `- **Exports:** ${loc.economy.exports.join(', ')}\n\n`;

    if (loc.pointsOfInterest.length > 0) {
      md += `## Points of Interest\n`;
      for (const poi of loc.pointsOfInterest) {
        md += `### ${poi.name}\n`;
        md += `${poi.description}\n\n`;
      }
    }

    if (loc.plotHooks.length > 0) {
      md += `## Plot Hooks\n`;
      for (const hook of loc.plotHooks) {
        md += `- ${hook}\n`;
      }
    }

    return md;
  }
}

export default LocationDesigner;
