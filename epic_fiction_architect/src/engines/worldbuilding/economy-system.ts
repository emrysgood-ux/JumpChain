/**
 * Economy/Trade System
 *
 * Comprehensive economic simulation for epic fiction worldbuilding.
 * Handles currencies, trade goods, markets, trade routes, guilds, and economic modeling.
 * Integrates with Location Designer and Ecology System for coherent worldbuilding.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

export enum EconomicSystemType {
  BARTER = 'barter',
  GIFT = 'gift',
  SUBSISTENCE = 'subsistence',
  FEUDAL = 'feudal',
  MANORIAL = 'manorial',
  MERCANTILE = 'mercantile',
  GUILD = 'guild',
  MARKET = 'market',
  CAPITALIST = 'capitalist',
  COMMAND = 'command',
  MIXED = 'mixed',
  MAGICAL = 'magical',
  CUSTOM = 'custom'
}

export enum CurrencyType {
  COMMODITY = 'commodity',       // Gold, silver, grain
  REPRESENTATIVE = 'representative', // Paper backed by commodity
  FIAT = 'fiat',            // Government-backed paper
  CREDIT = 'credit',          // Ledger-based
  MAGICAL = 'magical',         // Mana crystals, soul coins
  LABOR = 'labor',           // Work vouchers
  BARTER = 'barter',          // No currency, direct exchange
  MIXED = 'mixed'
}

export enum CurrencyMetal {
  COPPER = 'copper',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  ELECTRUM = 'electrum',
  MITHRIL = 'mithril',
  ADAMANTINE = 'adamantine',
  ORICHALCUM = 'orichalcum'
}

export enum GoodCategory {
  // Basic
  FOOD = 'food',
  DRINK = 'drink',
  CLOTHING = 'clothing',
  SHELTER = 'shelter',
  FUEL = 'fuel',

  // Raw Materials
  TIMBER = 'timber',
  METAL_ORE = 'metal_ore',
  STONE = 'stone',
  FIBER = 'fiber',
  LEATHER = 'leather',
  CLAY = 'clay',

  // Processed Materials
  METAL_INGOT = 'metal_ingot',
  CLOTH = 'cloth',
  LUMBER = 'lumber',
  PAPER = 'paper',
  GLASS = 'glass',

  // Manufactured Goods
  TOOLS = 'tools',
  WEAPONS = 'weapons',
  ARMOR = 'armor',
  FURNITURE = 'furniture',
  POTTERY = 'pottery',
  JEWELRY = 'jewelry',

  // Luxury
  SPICES = 'spices',
  SILK = 'silk',
  GEMS = 'gems',
  PERFUME = 'perfume',
  ART = 'art',
  WINE = 'wine',

  // Specialty
  BOOKS = 'books',
  MEDICINE = 'medicine',
  POISON = 'poison',
  EXOTIC_ANIMAL = 'exotic_animal',
  SLAVE = 'slave',

  // Magical
  MAGICAL_COMPONENTS = 'magical_components',
  POTIONS = 'potions',
  SCROLLS = 'scrolls',
  ENCHANTED_ITEMS = 'enchanted_items',
  MAGICAL_CREATURES = 'magical_creatures',

  // Services
  LABOR = 'labor',
  TRANSPORT = 'transport',
  LODGING = 'lodging',
  ENTERTAINMENT = 'entertainment',
  EDUCATION = 'education',
  MAGIC_SERVICES = 'magic_services',

  // Other
  CONTRABAND = 'contraband',
  INFORMATION = 'information',
  CUSTOM = 'custom'
}

export enum GoodQuality {
  SHODDY = 'shoddy',
  POOR = 'poor',
  COMMON = 'common',
  FINE = 'fine',
  SUPERIOR = 'superior',
  MASTERWORK = 'masterwork',
  LEGENDARY = 'legendary'
}

export enum TradeRouteType {
  LAND = 'land',
  RIVER = 'river',
  COASTAL = 'coastal',
  OCEAN = 'ocean',
  MOUNTAIN_PASS = 'mountain_pass',
  CARAVAN = 'caravan',
  UNDERGROUND = 'underground',
  AERIAL = 'aerial',
  MAGICAL_PORTAL = 'magical_portal',
  MIXED = 'mixed'
}

export enum MarketType {
  LOCAL = 'local',           // Village market
  REGIONAL = 'regional',        // Town market
  NATIONAL = 'national',        // City market
  INTERNATIONAL = 'international',   // Trading hub
  BLACK_MARKET = 'black_market',    // Illegal goods
  GUILD_MARKET = 'guild_market',    // Specialized trade
  MAGICAL = 'magical',         // Magical goods
  AUCTION = 'auction'          // High-value items
}

export enum GuildType {
  MERCHANT = 'merchant',
  CRAFTSMAN = 'craftsman',
  ARTISAN = 'artisan',
  PROFESSIONAL = 'professional',
  LABOR = 'labor',
  CRIMINAL = 'criminal',
  MAGICAL = 'magical',
  ADVENTURER = 'adventurer',
  RELIGIOUS = 'religious'
}

export enum TaxType {
  INCOME = 'income',
  SALES = 'sales',
  TARIFF = 'tariff',
  PROPERTY = 'property',
  TOLL = 'toll',
  TITHE = 'tithe',
  TRIBUTE = 'tribute',
  HEAD_TAX = 'head_tax',
  LUXURY = 'luxury',
  EXPORT = 'export',
  IMPORT = 'import'
}

export enum EconomicIndicator {
  GROWTH = 'growth',
  INFLATION = 'inflation',
  UNEMPLOYMENT = 'unemployment',
  TRADE_BALANCE = 'trade_balance',
  DEBT = 'debt',
  PRODUCTIVITY = 'productivity',
  INEQUALITY = 'inequality',
  PROSPERITY = 'prosperity'
}

export enum WealthLevel {
  DESTITUTE = 'destitute',
  POOR = 'poor',
  MODEST = 'modest',
  COMFORTABLE = 'comfortable',
  WEALTHY = 'wealthy',
  RICH = 'rich',
  VERY_RICH = 'very_rich',
  FABULOUSLY_WEALTHY = 'fabulously_wealthy'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface CurrencyDenomination {
  id: string;
  name: string;
  pluralName: string;
  symbol?: string;
  material?: CurrencyMetal;
  value: number;          // In base units
  weight?: number;        // In grams
  description?: string;
}

export interface Currency {
  id: string;
  name: string;
  type: CurrencyType;
  denominations: CurrencyDenomination[];
  baseUnit: string;       // ID of base denomination
  exchangeRates: Record<string, number>; // Currency ID -> rate
  issuingAuthority?: string;
  regions?: string[];     // Where accepted
  stability: 'volatile' | 'unstable' | 'stable' | 'very_stable';
  inflationRate?: number;  // Annual percentage
  history?: string;
  notes?: string;
}

export interface TradeGood {
  id: string;
  name: string;
  category: GoodCategory;
  quality: GoodQuality;
  basePrice: number;       // In base currency units
  priceUnit: string;       // e.g., "per pound", "each"
  weight?: number;         // Per unit in kg
  volume?: number;         // Per unit in liters
  perishable: boolean;
  shelfLife?: number;      // Days
  illegal?: boolean;
  magicalProperties?: string[];
  originRegions?: string[];
  productionMethod?: string;
  substitutes?: string[];   // Good IDs
  complements?: string[];   // Good IDs
  description?: string;
  notes?: string;
}

export interface PriceModifier {
  id: string;
  name: string;
  type: 'supply' | 'demand' | 'seasonal' | 'event' | 'location' | 'quality' | 'custom';
  multiplier: number;      // 1.0 = no change
  conditions?: string;
  duration?: string;
  notes?: string;
}

export interface Market {
  id: string;
  name: string;
  type: MarketType;
  locationId?: string;     // Reference to Location Designer
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'massive';

  // Goods
  availableGoods: {
    goodId: string;
    quantity: 'scarce' | 'limited' | 'moderate' | 'abundant' | 'surplus';
    localPrice: number;    // Actual price here
    priceModifiers: string[]; // PriceModifier IDs
  }[];

  // Operations
  operatingDays?: string[];
  operatingHours?: string;
  fees?: number;           // Percentage or flat
  regulations?: string[];

  // Connections
  tradeRoutes: string[];   // TradeRoute IDs
  majorTraders?: string[];

  // Status
  activity: 'dead' | 'slow' | 'moderate' | 'busy' | 'booming';
  reputation: 'disreputable' | 'poor' | 'fair' | 'good' | 'excellent';

  description?: string;
  notes?: string;
}

export interface TradeRoute {
  id: string;
  name: string;
  type: TradeRouteType;

  // Path
  origin: string;          // Location/Market ID
  destination: string;     // Location/Market ID
  waypoints?: string[];    // Location IDs
  distance: number;        // In kilometers
  travelTime: number;      // In days

  // Characteristics
  difficulty: 'easy' | 'moderate' | 'difficult' | 'dangerous' | 'deadly';
  capacity: 'low' | 'medium' | 'high' | 'very_high';
  season?: string[];       // Operating seasons

  // Goods
  primaryGoods: string[];  // TradeGood IDs
  direction: 'one_way' | 'bidirectional';
  volumePerYear?: number;  // In currency units

  // Hazards
  hazards: {
    type: 'bandits' | 'monsters' | 'weather' | 'terrain' | 'political' | 'magical' | 'other';
    severity: 'minor' | 'moderate' | 'severe' | 'extreme';
    description: string;
  }[];

  // Control
  controlledBy?: string;   // Faction/Nation ID
  tolls?: number;          // Percentage or flat
  escorts?: boolean;

  status: 'closed' | 'restricted' | 'open' | 'busy' | 'congested';
  history?: string;
  notes?: string;
}

export interface Guild {
  id: string;
  name: string;
  type: GuildType;

  // Organization
  headquarters?: string;   // Location ID
  chapters?: string[];     // Location IDs
  memberCount?: number;
  leaderTitle: string;
  currentLeader?: string;

  // Scope
  trades: string[];        // What they do
  controlledGoods?: string[]; // TradeGood IDs
  controlledServices?: string[];
  territory?: string[];    // Region/Location IDs

  // Economics
  membershipFee?: number;
  annualDues?: number;
  priceControlLevel: 'none' | 'advisory' | 'enforced' | 'monopoly';
  qualityStandards?: string[];

  // Relationships
  allies?: string[];       // Guild IDs
  rivals?: string[];       // Guild IDs
  politicalInfluence: 'none' | 'minor' | 'moderate' | 'significant' | 'dominant';

  // Benefits
  memberBenefits: string[];
  apprenticeshipDuration?: number; // Years

  status: 'forming' | 'growing' | 'established' | 'dominant' | 'declining' | 'defunct';
  history?: string;
  motto?: string;
  symbol?: string;
  notes?: string;
}

export interface TaxSystem {
  id: string;
  name: string;
  jurisdiction: string;    // Nation/Region ID

  taxes: {
    type: TaxType;
    name: string;
    rate: number;          // Percentage or flat amount
    isPercentage: boolean;
    appliesTo: string[];   // Categories or specific goods
    exemptions?: string[];
    collectors: string;
  }[];

  enforcement: 'lax' | 'moderate' | 'strict' | 'draconian';
  evasionPenalties?: string[];
  revenueUse?: string[];

  notes?: string;
}

export interface Economy {
  id: string;
  name: string;
  type: EconomicSystemType;
  region: string;          // Location/Nation ID

  // Currency
  currencies: Currency[];
  primaryCurrency?: string; // Currency ID

  // Markets
  markets: Market[];
  tradeRoutes: TradeRoute[];

  // Organizations
  guilds: Guild[];
  majorMerchants?: {
    name: string;
    specialty: string;
    wealth: WealthLevel;
    reputation: string;
  }[];

  // Taxation
  taxSystem?: TaxSystem;

  // Indicators
  indicators: {
    type: EconomicIndicator;
    value: number;
    trend: 'falling' | 'stable' | 'rising';
    description?: string;
  }[];

  // Characteristics
  gdpEquivalent?: number;  // Total economic output
  tradeBalance?: number;   // Exports - Imports
  majorExports?: string[];
  majorImports?: string[];
  naturalResources?: string[];

  // Social
  wealthDistribution: 'equal' | 'moderate_inequality' | 'unequal' | 'extremely_unequal';
  socialMobility: 'none' | 'rare' | 'possible' | 'common' | 'easy';
  povertyRate?: number;    // Percentage

  // Status
  health: 'collapsed' | 'crisis' | 'recession' | 'stagnant' | 'growing' | 'booming';
  stability: 'chaotic' | 'unstable' | 'volatile' | 'stable' | 'very_stable';

  history?: string;
  dateCreated: Date;
  lastModified: Date;
  notes?: string;
}

export interface EconomyGenerationOptions {
  type?: EconomicSystemType;
  scale?: 'village' | 'town' | 'city' | 'region' | 'nation' | 'empire';
  wealthLevel?: 'poor' | 'modest' | 'average' | 'prosperous' | 'rich';
  tradeFocus?: 'agricultural' | 'manufacturing' | 'trade' | 'mining' | 'magical' | 'mixed';
  includeGuilds?: boolean;
  includeBlackMarket?: boolean;
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

  getSeed(): number {
    return this.seed;
  }

  setSeed(seed: number): void {
    this.seed = seed;
  }
}

// ============================================================================
// PRESET DATA
// ============================================================================

const STANDARD_CURRENCY_SYSTEMS: Record<string, Partial<Currency>> = {
  medieval: {
    name: 'Standard Coin',
    type: CurrencyType.COMMODITY,
    denominations: [
      { id: 'cp', name: 'Copper Penny', pluralName: 'Copper Pennies', material: CurrencyMetal.COPPER, value: 1, weight: 5 },
      { id: 'sp', name: 'Silver Shilling', pluralName: 'Silver Shillings', material: CurrencyMetal.SILVER, value: 10, weight: 5 },
      { id: 'gp', name: 'Gold Crown', pluralName: 'Gold Crowns', material: CurrencyMetal.GOLD, value: 100, weight: 5 },
      { id: 'pp', name: 'Platinum Sovereign', pluralName: 'Platinum Sovereigns', material: CurrencyMetal.PLATINUM, value: 1000, weight: 5 }
    ],
    baseUnit: 'cp',
    stability: 'stable'
  },
  fantasy: {
    name: 'Realm Currency',
    type: CurrencyType.COMMODITY,
    denominations: [
      { id: 'bit', name: 'Copper Bit', pluralName: 'Copper Bits', material: CurrencyMetal.COPPER, value: 1, weight: 3 },
      { id: 'noble', name: 'Silver Noble', pluralName: 'Silver Nobles', material: CurrencyMetal.SILVER, value: 12, weight: 4 },
      { id: 'drake', name: 'Gold Drake', pluralName: 'Gold Drakes', material: CurrencyMetal.GOLD, value: 144, weight: 5 },
      { id: 'star', name: 'Mithril Star', pluralName: 'Mithril Stars', material: CurrencyMetal.MITHRIL, value: 1728, weight: 3 }
    ],
    baseUnit: 'bit',
    stability: 'very_stable'
  },
  barter: {
    name: 'Barter System',
    type: CurrencyType.BARTER,
    denominations: [],
    baseUnit: 'goods',
    stability: 'volatile'
  }
};

const STANDARD_GOODS: Partial<TradeGood>[] = [
  // Food
  { name: 'Wheat', category: GoodCategory.FOOD, quality: GoodQuality.COMMON, basePrice: 1, priceUnit: 'per bushel', perishable: true, shelfLife: 365 },
  { name: 'Bread', category: GoodCategory.FOOD, quality: GoodQuality.COMMON, basePrice: 0.2, priceUnit: 'per loaf', perishable: true, shelfLife: 7 },
  { name: 'Meat', category: GoodCategory.FOOD, quality: GoodQuality.COMMON, basePrice: 5, priceUnit: 'per pound', perishable: true, shelfLife: 5 },
  { name: 'Salt', category: GoodCategory.FOOD, quality: GoodQuality.COMMON, basePrice: 10, priceUnit: 'per pound', perishable: false },
  { name: 'Spices', category: GoodCategory.SPICES, quality: GoodQuality.FINE, basePrice: 100, priceUnit: 'per ounce', perishable: false },

  // Materials
  { name: 'Iron Ore', category: GoodCategory.METAL_ORE, quality: GoodQuality.COMMON, basePrice: 2, priceUnit: 'per pound', perishable: false },
  { name: 'Iron Ingot', category: GoodCategory.METAL_INGOT, quality: GoodQuality.COMMON, basePrice: 10, priceUnit: 'each', perishable: false },
  { name: 'Steel Ingot', category: GoodCategory.METAL_INGOT, quality: GoodQuality.FINE, basePrice: 50, priceUnit: 'each', perishable: false },
  { name: 'Gold Ingot', category: GoodCategory.METAL_INGOT, quality: GoodQuality.FINE, basePrice: 1000, priceUnit: 'each', perishable: false },
  { name: 'Timber', category: GoodCategory.TIMBER, quality: GoodQuality.COMMON, basePrice: 5, priceUnit: 'per board', perishable: false },
  { name: 'Stone Block', category: GoodCategory.STONE, quality: GoodQuality.COMMON, basePrice: 3, priceUnit: 'each', perishable: false },
  { name: 'Leather', category: GoodCategory.LEATHER, quality: GoodQuality.COMMON, basePrice: 15, priceUnit: 'per hide', perishable: false },
  { name: 'Wool', category: GoodCategory.FIBER, quality: GoodQuality.COMMON, basePrice: 8, priceUnit: 'per fleece', perishable: false },
  { name: 'Cloth', category: GoodCategory.CLOTH, quality: GoodQuality.COMMON, basePrice: 20, priceUnit: 'per bolt', perishable: false },
  { name: 'Silk', category: GoodCategory.SILK, quality: GoodQuality.FINE, basePrice: 200, priceUnit: 'per bolt', perishable: false },

  // Manufactured
  { name: 'Common Tools', category: GoodCategory.TOOLS, quality: GoodQuality.COMMON, basePrice: 25, priceUnit: 'per set', perishable: false },
  { name: 'Iron Sword', category: GoodCategory.WEAPONS, quality: GoodQuality.COMMON, basePrice: 100, priceUnit: 'each', perishable: false },
  { name: 'Steel Sword', category: GoodCategory.WEAPONS, quality: GoodQuality.FINE, basePrice: 500, priceUnit: 'each', perishable: false },
  { name: 'Leather Armor', category: GoodCategory.ARMOR, quality: GoodQuality.COMMON, basePrice: 150, priceUnit: 'each', perishable: false },
  { name: 'Chain Mail', category: GoodCategory.ARMOR, quality: GoodQuality.FINE, basePrice: 750, priceUnit: 'each', perishable: false },
  { name: 'Plate Armor', category: GoodCategory.ARMOR, quality: GoodQuality.SUPERIOR, basePrice: 3000, priceUnit: 'each', perishable: false },
  { name: 'Pottery', category: GoodCategory.POTTERY, quality: GoodQuality.COMMON, basePrice: 5, priceUnit: 'each', perishable: false },
  { name: 'Furniture', category: GoodCategory.FURNITURE, quality: GoodQuality.COMMON, basePrice: 50, priceUnit: 'each', perishable: false },
  { name: 'Jewelry', category: GoodCategory.JEWELRY, quality: GoodQuality.FINE, basePrice: 500, priceUnit: 'each', perishable: false },

  // Luxury
  { name: 'Wine', category: GoodCategory.WINE, quality: GoodQuality.FINE, basePrice: 50, priceUnit: 'per barrel', perishable: false },
  { name: 'Perfume', category: GoodCategory.PERFUME, quality: GoodQuality.FINE, basePrice: 300, priceUnit: 'per vial', perishable: false },
  { name: 'Gemstones', category: GoodCategory.GEMS, quality: GoodQuality.FINE, basePrice: 500, priceUnit: 'each', perishable: false },
  { name: 'Art', category: GoodCategory.ART, quality: GoodQuality.FINE, basePrice: 1000, priceUnit: 'each', perishable: false },
  { name: 'Books', category: GoodCategory.BOOKS, quality: GoodQuality.FINE, basePrice: 100, priceUnit: 'each', perishable: false },

  // Magical
  { name: 'Healing Potion', category: GoodCategory.POTIONS, quality: GoodQuality.COMMON, basePrice: 50, priceUnit: 'each', perishable: false },
  { name: 'Mana Crystals', category: GoodCategory.MAGICAL_COMPONENTS, quality: GoodQuality.FINE, basePrice: 200, priceUnit: 'each', perishable: false },
  { name: 'Spell Scroll', category: GoodCategory.SCROLLS, quality: GoodQuality.FINE, basePrice: 300, priceUnit: 'each', perishable: false },
  { name: 'Enchanted Weapon', category: GoodCategory.ENCHANTED_ITEMS, quality: GoodQuality.SUPERIOR, basePrice: 5000, priceUnit: 'each', perishable: false },

  // Services
  { name: 'Unskilled Labor', category: GoodCategory.LABOR, quality: GoodQuality.COMMON, basePrice: 1, priceUnit: 'per day', perishable: false },
  { name: 'Skilled Labor', category: GoodCategory.LABOR, quality: GoodQuality.FINE, basePrice: 5, priceUnit: 'per day', perishable: false },
  { name: 'Inn Stay', category: GoodCategory.LODGING, quality: GoodQuality.COMMON, basePrice: 2, priceUnit: 'per night', perishable: false },
  { name: 'Carriage Travel', category: GoodCategory.TRANSPORT, quality: GoodQuality.COMMON, basePrice: 3, priceUnit: 'per mile', perishable: false }
];

const GUILD_TEMPLATES: Partial<Guild>[] = [
  { name: 'Merchants Guild', type: GuildType.MERCHANT, trades: ['Trade', 'Commerce', 'Banking'], leaderTitle: 'Guildmaster' },
  { name: 'Smiths Guild', type: GuildType.CRAFTSMAN, trades: ['Blacksmithing', 'Armoring', 'Weaponsmithing'], leaderTitle: 'Master Smith' },
  { name: 'Weavers Guild', type: GuildType.CRAFTSMAN, trades: ['Weaving', 'Dyeing', 'Tailoring'], leaderTitle: 'Master Weaver' },
  { name: 'Masons Guild', type: GuildType.CRAFTSMAN, trades: ['Stonework', 'Building', 'Architecture'], leaderTitle: 'Master Mason' },
  { name: 'Jewelers Guild', type: GuildType.ARTISAN, trades: ['Jewelry', 'Gemcutting', 'Goldsmithing'], leaderTitle: 'Master Jeweler' },
  { name: 'Scribes Guild', type: GuildType.PROFESSIONAL, trades: ['Writing', 'Copying', 'Record-keeping'], leaderTitle: 'Chief Scribe' },
  { name: 'Healers Guild', type: GuildType.PROFESSIONAL, trades: ['Medicine', 'Herbalism', 'Surgery'], leaderTitle: 'Grand Healer' },
  { name: 'Mages Guild', type: GuildType.MAGICAL, trades: ['Magic', 'Enchanting', 'Alchemy'], leaderTitle: 'Archmage' },
  { name: 'Thieves Guild', type: GuildType.CRIMINAL, trades: ['Theft', 'Smuggling', 'Fencing'], leaderTitle: 'Shadowmaster' },
  { name: 'Adventurers Guild', type: GuildType.ADVENTURER, trades: ['Monster Hunting', 'Exploration', 'Mercenary Work'], leaderTitle: 'Guildmaster' }
];

// ============================================================================
// ECONOMY SYSTEM CLASS
// ============================================================================

export class EconomySystem {
  private economies: Map<string, Economy> = new Map();
  private currencies: Map<string, Currency> = new Map();
  private goods: Map<string, TradeGood> = new Map();
  private markets: Map<string, Market> = new Map();
  private tradeRoutes: Map<string, TradeRoute> = new Map();
  private guilds: Map<string, Guild> = new Map();
  private random: SeededRandom;

  constructor(seed?: number) {
    this.random = new SeededRandom(seed);
    this.initializeStandardGoods();
  }

  private initializeStandardGoods(): void {
    for (const good of STANDARD_GOODS) {
      const fullGood: TradeGood = {
        id: uuidv4(),
        name: good.name!,
        category: good.category!,
        quality: good.quality || GoodQuality.COMMON,
        basePrice: good.basePrice || 1,
        priceUnit: good.priceUnit || 'each',
        perishable: good.perishable || false,
        shelfLife: good.shelfLife,
        illegal: good.illegal,
        magicalProperties: good.magicalProperties,
        originRegions: good.originRegions
      };
      this.goods.set(fullGood.id, fullGood);
    }
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
  // CURRENCY CRUD
  // ==========================================================================

  createCurrency(data: Partial<Currency> & { name: string }): Currency {
    const currency: Currency = {
      id: uuidv4(),
      name: data.name,
      type: data.type || CurrencyType.COMMODITY,
      denominations: data.denominations || [],
      baseUnit: data.baseUnit || '',
      exchangeRates: data.exchangeRates || {},
      issuingAuthority: data.issuingAuthority,
      regions: data.regions,
      stability: data.stability || 'stable',
      inflationRate: data.inflationRate,
      history: data.history,
      notes: data.notes
    };

    // Assign IDs to denominations if not present
    for (const denom of currency.denominations) {
      if (!denom.id) denom.id = uuidv4();
    }

    if (!currency.baseUnit && currency.denominations.length > 0) {
      currency.baseUnit = currency.denominations[0].id;
    }

    this.currencies.set(currency.id, currency);
    return currency;
  }

  getCurrency(id: string): Currency | undefined {
    return this.currencies.get(id);
  }

  getAllCurrencies(): Currency[] {
    return Array.from(this.currencies.values());
  }

  createStandardCurrency(template: 'medieval' | 'fantasy' | 'barter'): Currency {
    const preset = STANDARD_CURRENCY_SYSTEMS[template];
    return this.createCurrency({
      name: preset.name || template,
      type: preset.type,
      denominations: (preset.denominations || []).map(d => ({ ...d, id: d.id || uuidv4() })),
      baseUnit: preset.baseUnit,
      stability: preset.stability
    });
  }

  // ==========================================================================
  // TRADE GOOD MANAGEMENT
  // ==========================================================================

  createGood(data: Partial<TradeGood> & { name: string; category: GoodCategory }): TradeGood {
    const good: TradeGood = {
      id: uuidv4(),
      name: data.name,
      category: data.category,
      quality: data.quality || GoodQuality.COMMON,
      basePrice: data.basePrice || 1,
      priceUnit: data.priceUnit || 'each',
      weight: data.weight,
      volume: data.volume,
      perishable: data.perishable || false,
      shelfLife: data.shelfLife,
      illegal: data.illegal,
      magicalProperties: data.magicalProperties,
      originRegions: data.originRegions,
      productionMethod: data.productionMethod,
      substitutes: data.substitutes,
      complements: data.complements,
      description: data.description,
      notes: data.notes
    };

    this.goods.set(good.id, good);
    return good;
  }

  getGood(id: string): TradeGood | undefined {
    return this.goods.get(id);
  }

  getAllGoods(): TradeGood[] {
    return Array.from(this.goods.values());
  }

  getGoodsByCategory(category: GoodCategory): TradeGood[] {
    return this.getAllGoods().filter(g => g.category === category);
  }

  findGoodByName(name: string): TradeGood | undefined {
    return this.getAllGoods().find(g => g.name.toLowerCase() === name.toLowerCase());
  }

  // ==========================================================================
  // MARKET MANAGEMENT
  // ==========================================================================

  createMarket(data: Partial<Market> & { name: string; type: MarketType }): Market {
    const market: Market = {
      id: uuidv4(),
      name: data.name,
      type: data.type,
      locationId: data.locationId,
      size: data.size || 'medium',
      availableGoods: data.availableGoods || [],
      operatingDays: data.operatingDays,
      operatingHours: data.operatingHours,
      fees: data.fees,
      regulations: data.regulations,
      tradeRoutes: data.tradeRoutes || [],
      majorTraders: data.majorTraders,
      activity: data.activity || 'moderate',
      reputation: data.reputation || 'fair',
      description: data.description,
      notes: data.notes
    };

    this.markets.set(market.id, market);
    return market;
  }

  getMarket(id: string): Market | undefined {
    return this.markets.get(id);
  }

  getAllMarkets(): Market[] {
    return Array.from(this.markets.values());
  }

  addGoodToMarket(marketId: string, goodId: string, quantity: 'scarce' | 'limited' | 'moderate' | 'abundant' | 'surplus', priceMultiplier: number = 1): boolean {
    const market = this.markets.get(marketId);
    const good = this.goods.get(goodId);

    if (!market || !good) return false;

    market.availableGoods.push({
      goodId,
      quantity,
      localPrice: good.basePrice * priceMultiplier,
      priceModifiers: []
    });

    return true;
  }

  calculatePrice(marketId: string, goodId: string): number | undefined {
    const market = this.markets.get(marketId);
    if (!market) return undefined;

    const marketGood = market.availableGoods.find(g => g.goodId === goodId);
    if (!marketGood) {
      const good = this.goods.get(goodId);
      return good?.basePrice;
    }

    return marketGood.localPrice;
  }

  // ==========================================================================
  // TRADE ROUTE MANAGEMENT
  // ==========================================================================

  createTradeRoute(data: Partial<TradeRoute> & { name: string; origin: string; destination: string }): TradeRoute {
    const route: TradeRoute = {
      id: uuidv4(),
      name: data.name,
      type: data.type || TradeRouteType.LAND,
      origin: data.origin,
      destination: data.destination,
      waypoints: data.waypoints,
      distance: data.distance || 100,
      travelTime: data.travelTime || 5,
      difficulty: data.difficulty || 'moderate',
      capacity: data.capacity || 'medium',
      season: data.season,
      primaryGoods: data.primaryGoods || [],
      direction: data.direction || 'bidirectional',
      volumePerYear: data.volumePerYear,
      hazards: data.hazards || [],
      controlledBy: data.controlledBy,
      tolls: data.tolls,
      escorts: data.escorts,
      status: data.status || 'open',
      history: data.history,
      notes: data.notes
    };

    this.tradeRoutes.set(route.id, route);
    return route;
  }

  getTradeRoute(id: string): TradeRoute | undefined {
    return this.tradeRoutes.get(id);
  }

  getAllTradeRoutes(): TradeRoute[] {
    return Array.from(this.tradeRoutes.values());
  }

  // ==========================================================================
  // GUILD MANAGEMENT
  // ==========================================================================

  createGuild(data: Partial<Guild> & { name: string; type: GuildType }): Guild {
    const guild: Guild = {
      id: uuidv4(),
      name: data.name,
      type: data.type,
      headquarters: data.headquarters,
      chapters: data.chapters,
      memberCount: data.memberCount,
      leaderTitle: data.leaderTitle || 'Guildmaster',
      currentLeader: data.currentLeader,
      trades: data.trades || [],
      controlledGoods: data.controlledGoods,
      controlledServices: data.controlledServices,
      territory: data.territory,
      membershipFee: data.membershipFee,
      annualDues: data.annualDues,
      priceControlLevel: data.priceControlLevel || 'none',
      qualityStandards: data.qualityStandards,
      allies: data.allies,
      rivals: data.rivals,
      politicalInfluence: data.politicalInfluence || 'minor',
      memberBenefits: data.memberBenefits || [],
      apprenticeshipDuration: data.apprenticeshipDuration,
      status: data.status || 'established',
      history: data.history,
      motto: data.motto,
      symbol: data.symbol,
      notes: data.notes
    };

    this.guilds.set(guild.id, guild);
    return guild;
  }

  getGuild(id: string): Guild | undefined {
    return this.guilds.get(id);
  }

  getAllGuilds(): Guild[] {
    return Array.from(this.guilds.values());
  }

  // ==========================================================================
  // ECONOMY CRUD
  // ==========================================================================

  createEconomy(data: Partial<Economy> & { name: string; region: string }): Economy {
    const economy: Economy = {
      id: uuidv4(),
      name: data.name,
      type: data.type || EconomicSystemType.MARKET,
      region: data.region,

      currencies: data.currencies || [],
      primaryCurrency: data.primaryCurrency,

      markets: data.markets || [],
      tradeRoutes: data.tradeRoutes || [],

      guilds: data.guilds || [],
      majorMerchants: data.majorMerchants,

      taxSystem: data.taxSystem,

      indicators: data.indicators || [],

      gdpEquivalent: data.gdpEquivalent,
      tradeBalance: data.tradeBalance,
      majorExports: data.majorExports,
      majorImports: data.majorImports,
      naturalResources: data.naturalResources,

      wealthDistribution: data.wealthDistribution || 'moderate_inequality',
      socialMobility: data.socialMobility || 'possible',
      povertyRate: data.povertyRate,

      health: data.health || 'growing',
      stability: data.stability || 'stable',

      history: data.history,
      dateCreated: new Date(),
      lastModified: new Date(),
      notes: data.notes
    };

    this.economies.set(economy.id, economy);
    return economy;
  }

  getEconomy(id: string): Economy | undefined {
    return this.economies.get(id);
  }

  getAllEconomies(): Economy[] {
    return Array.from(this.economies.values());
  }

  updateEconomy(id: string, updates: Partial<Economy>): Economy | undefined {
    const economy = this.economies.get(id);
    if (!economy) return undefined;

    const updated = { ...economy, ...updates, lastModified: new Date() };
    this.economies.set(id, updated);
    return updated;
  }

  // ==========================================================================
  // RANDOM GENERATION
  // ==========================================================================

  generateRandomEconomy(options: EconomyGenerationOptions = {}): Economy {
    if (options.seed !== undefined) {
      this.random.setSeed(options.seed);
    }

    const type = options.type || this.random.pick([
      EconomicSystemType.FEUDAL,
      EconomicSystemType.MERCANTILE,
      EconomicSystemType.MARKET,
      EconomicSystemType.GUILD
    ]);

    const scale = options.scale || 'city';
    const wealthLevel = options.wealthLevel || 'average';
    const tradeFocus = options.tradeFocus || 'mixed';

    // Create currency
    const currency = this.createStandardCurrency(this.random.pick(['medieval', 'fantasy']));

    // Create markets
    const marketCount = this.getMarketCount(scale);
    const markets: Market[] = [];
    for (let i = 0; i < marketCount; i++) {
      const market = this.generateRandomMarket(scale, wealthLevel);
      markets.push(market);
    }

    // Create guilds if requested
    const guilds: Guild[] = [];
    if (options.includeGuilds !== false) {
      const guildCount = this.getGuildCount(scale);
      for (let i = 0; i < guildCount; i++) {
        const guild = this.generateRandomGuild();
        guilds.push(guild);
      }
    }

    // Create trade routes
    const tradeRoutes: TradeRoute[] = [];
    if (markets.length >= 2) {
      for (let i = 0; i < Math.min(3, markets.length - 1); i++) {
        const route = this.createTradeRoute({
          name: `${markets[i].name} - ${markets[(i + 1) % markets.length].name} Route`,
          origin: markets[i].id,
          destination: markets[(i + 1) % markets.length].id,
          type: this.random.pick([TradeRouteType.LAND, TradeRouteType.RIVER, TradeRouteType.CARAVAN]),
          distance: this.random.nextInt(50, 500),
          travelTime: this.random.nextInt(2, 20),
          primaryGoods: this.getGoodsByCategory(this.random.pick([GoodCategory.FOOD, GoodCategory.CLOTH, GoodCategory.METAL_INGOT])).slice(0, 3).map(g => g.id)
        });
        tradeRoutes.push(route);
      }
    }

    // Create economy
    const economy = this.createEconomy({
      name: `${this.generateEconomyName()} Economy`,
      region: 'Generated Region',
      type,
      currencies: [currency],
      primaryCurrency: currency.id,
      markets,
      tradeRoutes,
      guilds,
      indicators: this.generateIndicators(wealthLevel),
      majorExports: this.generateExports(tradeFocus),
      majorImports: this.generateImports(tradeFocus),
      wealthDistribution: this.getWealthDistribution(type),
      socialMobility: this.getSocialMobility(type),
      health: this.getEconomicHealth(wealthLevel),
      stability: 'stable'
    });

    return economy;
  }

  private generateRandomMarket(scale: string, wealthLevel: string): Market {
    const marketType = this.getMarketTypeForScale(scale);
    const size = this.getMarketSizeForScale(scale);

    const market = this.createMarket({
      name: `${this.generateMarketName()} Market`,
      type: marketType,
      size,
      activity: this.getActivityForWealth(wealthLevel),
      reputation: this.random.pick(['poor', 'fair', 'good', 'excellent'])
    });

    // Add goods to market
    const goodCount = this.getGoodCountForSize(size);
    const allGoods = this.getAllGoods();
    const selectedGoods = this.random.pickMultiple(allGoods, goodCount);

    for (const good of selectedGoods) {
      const quantity = this.random.pick(['scarce', 'limited', 'moderate', 'abundant', 'surplus'] as const);
      const priceMultiplier = 0.7 + (this.random.next() * 0.6); // 0.7 to 1.3
      this.addGoodToMarket(market.id, good.id, quantity, priceMultiplier);
    }

    return market;
  }

  private generateRandomGuild(): Guild {
    const template = this.random.pick(GUILD_TEMPLATES);

    return this.createGuild({
      name: template.name || 'Unknown Guild',
      type: template.type || GuildType.MERCHANT,
      trades: template.trades || [],
      leaderTitle: template.leaderTitle || 'Guildmaster',
      memberCount: this.random.nextInt(50, 500),
      membershipFee: this.random.nextInt(10, 100),
      annualDues: this.random.nextInt(5, 50),
      priceControlLevel: this.random.pick(['none', 'advisory', 'enforced']),
      politicalInfluence: this.random.pick(['none', 'minor', 'moderate', 'significant']),
      memberBenefits: ['Training', 'Legal protection', 'Trade privileges', 'Networking'],
      apprenticeshipDuration: this.random.nextInt(2, 7),
      status: 'established'
    });
  }

  private getMarketCount(scale: string): number {
    const counts: Record<string, number> = {
      village: 1,
      town: 2,
      city: 4,
      region: 6,
      nation: 10,
      empire: 15
    };
    return counts[scale] || 3;
  }

  private getGuildCount(scale: string): number {
    const counts: Record<string, number> = {
      village: 0,
      town: 2,
      city: 5,
      region: 8,
      nation: 12,
      empire: 20
    };
    return counts[scale] || 3;
  }

  private getMarketTypeForScale(scale: string): MarketType {
    const types: Record<string, MarketType[]> = {
      village: [MarketType.LOCAL],
      town: [MarketType.LOCAL, MarketType.REGIONAL],
      city: [MarketType.REGIONAL, MarketType.NATIONAL],
      region: [MarketType.REGIONAL, MarketType.NATIONAL, MarketType.INTERNATIONAL],
      nation: [MarketType.NATIONAL, MarketType.INTERNATIONAL],
      empire: [MarketType.INTERNATIONAL]
    };
    return this.random.pick(types[scale] || [MarketType.REGIONAL]);
  }

  private getMarketSizeForScale(scale: string): 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'massive' {
    const sizes: Record<string, ('tiny' | 'small' | 'medium' | 'large' | 'huge' | 'massive')[]> = {
      village: ['tiny', 'small'],
      town: ['small', 'medium'],
      city: ['medium', 'large'],
      region: ['large', 'huge'],
      nation: ['huge', 'massive'],
      empire: ['massive']
    };
    return this.random.pick(sizes[scale] || ['medium']);
  }

  private getActivityForWealth(wealthLevel: string): 'dead' | 'slow' | 'moderate' | 'busy' | 'booming' {
    const activities: Record<string, ('dead' | 'slow' | 'moderate' | 'busy' | 'booming')[]> = {
      poor: ['dead', 'slow'],
      modest: ['slow', 'moderate'],
      average: ['moderate', 'busy'],
      prosperous: ['busy', 'booming'],
      rich: ['booming']
    };
    return this.random.pick(activities[wealthLevel] || ['moderate']);
  }

  private getGoodCountForSize(size: string): number {
    const counts: Record<string, number> = {
      tiny: 5,
      small: 10,
      medium: 20,
      large: 30,
      huge: 40,
      massive: 50
    };
    return counts[size] || 20;
  }

  private generateEconomyName(): string {
    const adjectives = ['Greater', 'Northern', 'Southern', 'Eastern', 'Western', 'Central', 'Unified', 'Free'];
    const nouns = ['Realm', 'Kingdom', 'Province', 'Region', 'Territory', 'Empire', 'Republic'];
    return `${this.random.pick(adjectives)} ${this.random.pick(nouns)}`;
  }

  private generateMarketName(): string {
    const prefixes = ['Grand', 'Royal', 'Old', 'New', 'Central', 'Harbor', 'River', 'Hill'];
    const suffixes = ['Square', 'Plaza', 'Commons', 'Exchange', 'Bazaar', 'Fair'];
    return `${this.random.pick(prefixes)} ${this.random.pick(suffixes)}`;
  }

  private generateIndicators(wealthLevel: string): { type: EconomicIndicator; value: number; trend: 'falling' | 'stable' | 'rising' }[] {
    const baseGrowth = wealthLevel === 'rich' ? 5 : wealthLevel === 'prosperous' ? 3 : wealthLevel === 'poor' ? -2 : 1;

    return [
      { type: EconomicIndicator.GROWTH, value: baseGrowth + (this.random.next() * 2 - 1), trend: this.random.pick(['stable', 'rising']) },
      { type: EconomicIndicator.INFLATION, value: 2 + (this.random.next() * 3), trend: 'stable' },
      { type: EconomicIndicator.UNEMPLOYMENT, value: wealthLevel === 'poor' ? 20 : 5 + (this.random.next() * 10), trend: 'stable' },
      { type: EconomicIndicator.PROSPERITY, value: wealthLevel === 'rich' ? 80 : wealthLevel === 'poor' ? 30 : 50, trend: 'stable' }
    ];
  }

  private generateExports(tradeFocus: string): string[] {
    const exports: Record<string, string[]> = {
      agricultural: ['Grain', 'Livestock', 'Wine', 'Textiles'],
      manufacturing: ['Tools', 'Weapons', 'Armor', 'Furniture'],
      trade: ['Luxury goods', 'Spices', 'Silk', 'Gems'],
      mining: ['Iron ore', 'Gold', 'Silver', 'Gems'],
      magical: ['Potions', 'Scrolls', 'Enchanted items', 'Mana crystals'],
      mixed: ['Various goods', 'Mixed commodities']
    };
    return exports[tradeFocus] || exports.mixed;
  }

  private generateImports(tradeFocus: string): string[] {
    const imports: Record<string, string[]> = {
      agricultural: ['Metal goods', 'Luxury items', 'Tools'],
      manufacturing: ['Raw materials', 'Food', 'Fuel'],
      trade: ['Everything', 'All types'],
      mining: ['Food', 'Timber', 'Cloth'],
      magical: ['Mundane goods', 'Raw materials'],
      mixed: ['Various goods']
    };
    return imports[tradeFocus] || imports.mixed;
  }

  private getWealthDistribution(type: EconomicSystemType): 'equal' | 'moderate_inequality' | 'unequal' | 'extremely_unequal' {
    const distributions: Record<EconomicSystemType, ('equal' | 'moderate_inequality' | 'unequal' | 'extremely_unequal')[]> = {
      [EconomicSystemType.BARTER]: ['moderate_inequality'],
      [EconomicSystemType.GIFT]: ['equal', 'moderate_inequality'],
      [EconomicSystemType.SUBSISTENCE]: ['equal'],
      [EconomicSystemType.FEUDAL]: ['extremely_unequal'],
      [EconomicSystemType.MANORIAL]: ['extremely_unequal'],
      [EconomicSystemType.MERCANTILE]: ['unequal'],
      [EconomicSystemType.GUILD]: ['moderate_inequality', 'unequal'],
      [EconomicSystemType.MARKET]: ['moderate_inequality', 'unequal'],
      [EconomicSystemType.CAPITALIST]: ['unequal', 'extremely_unequal'],
      [EconomicSystemType.COMMAND]: ['moderate_inequality'],
      [EconomicSystemType.MIXED]: ['moderate_inequality'],
      [EconomicSystemType.MAGICAL]: ['moderate_inequality'],
      [EconomicSystemType.CUSTOM]: ['moderate_inequality']
    };
    return this.random.pick(distributions[type] || ['moderate_inequality']);
  }

  private getSocialMobility(type: EconomicSystemType): 'none' | 'rare' | 'possible' | 'common' | 'easy' {
    const mobility: Record<EconomicSystemType, ('none' | 'rare' | 'possible' | 'common' | 'easy')[]> = {
      [EconomicSystemType.BARTER]: ['possible'],
      [EconomicSystemType.GIFT]: ['possible'],
      [EconomicSystemType.SUBSISTENCE]: ['rare'],
      [EconomicSystemType.FEUDAL]: ['none', 'rare'],
      [EconomicSystemType.MANORIAL]: ['none'],
      [EconomicSystemType.MERCANTILE]: ['possible', 'common'],
      [EconomicSystemType.GUILD]: ['possible'],
      [EconomicSystemType.MARKET]: ['common', 'easy'],
      [EconomicSystemType.CAPITALIST]: ['possible', 'common'],
      [EconomicSystemType.COMMAND]: ['rare', 'possible'],
      [EconomicSystemType.MIXED]: ['possible'],
      [EconomicSystemType.MAGICAL]: ['possible', 'common'],
      [EconomicSystemType.CUSTOM]: ['possible']
    };
    return this.random.pick(mobility[type] || ['possible']);
  }

  private getEconomicHealth(wealthLevel: string): 'collapsed' | 'crisis' | 'recession' | 'stagnant' | 'growing' | 'booming' {
    const health: Record<string, ('collapsed' | 'crisis' | 'recession' | 'stagnant' | 'growing' | 'booming')[]> = {
      poor: ['recession', 'stagnant'],
      modest: ['stagnant', 'growing'],
      average: ['growing'],
      prosperous: ['growing', 'booming'],
      rich: ['booming']
    };
    return this.random.pick(health[wealthLevel] || ['growing']);
  }

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  convertCurrency(amount: number, fromCurrencyId: string, toCurrencyId: string): number | undefined {
    const fromCurrency = this.currencies.get(fromCurrencyId);
    const toCurrency = this.currencies.get(toCurrencyId);

    if (!fromCurrency || !toCurrency) return undefined;

    const rate = fromCurrency.exchangeRates[toCurrencyId];
    if (rate) return amount * rate;

    // Try reverse rate
    const reverseRate = toCurrency.exchangeRates[fromCurrencyId];
    if (reverseRate) return amount / reverseRate;

    return undefined;
  }

  formatPrice(amount: number, currencyId: string): string {
    const currency = this.currencies.get(currencyId);
    if (!currency || currency.denominations.length === 0) {
      return `${amount} units`;
    }

    const sortedDenoms = [...currency.denominations].sort((a, b) => b.value - a.value);
    const parts: string[] = [];
    let remaining = amount;

    for (const denom of sortedDenoms) {
      if (remaining >= denom.value) {
        const count = Math.floor(remaining / denom.value);
        remaining = remaining % denom.value;
        parts.push(`${count} ${count === 1 ? denom.name : denom.pluralName}`);
      }
    }

    return parts.length > 0 ? parts.join(', ') : '0';
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getEconomyStats(economyId: string): Record<string, any> | undefined {
    const economy = this.economies.get(economyId);
    if (!economy) return undefined;

    const totalGoods = economy.markets.reduce((sum, m) => sum + m.availableGoods.length, 0);
    const avgActivity = economy.markets.length > 0
      ? economy.markets.filter(m => m.activity === 'busy' || m.activity === 'booming').length / economy.markets.length
      : 0;

    return {
      name: economy.name,
      type: economy.type,
      currencyCount: economy.currencies.length,
      marketCount: economy.markets.length,
      totalGoodsAvailable: totalGoods,
      tradeRouteCount: economy.tradeRoutes.length,
      guildCount: economy.guilds.length,
      health: economy.health,
      stability: economy.stability,
      wealthDistribution: economy.wealthDistribution,
      socialMobility: economy.socialMobility,
      averageMarketActivity: avgActivity,
      indicators: economy.indicators
    };
  }

  // ==========================================================================
  // EXPORT / IMPORT
  // ==========================================================================

  exportEconomy(economyId: string): string {
    const economy = this.economies.get(economyId);
    if (!economy) return '';
    return JSON.stringify(economy, null, 2);
  }

  exportAllEconomies(): string {
    return JSON.stringify(Array.from(this.economies.values()), null, 2);
  }

  importEconomy(json: string): Economy | undefined {
    try {
      const data = JSON.parse(json);
      data.id = uuidv4();
      data.dateCreated = new Date();
      data.lastModified = new Date();
      this.economies.set(data.id, data);
      return data;
    } catch {
      return undefined;
    }
  }

  // ==========================================================================
  // MARKDOWN GENERATION
  // ==========================================================================

  generateMarkdown(economyId: string): string {
    const economy = this.economies.get(economyId);
    if (!economy) return '';

    let md = `# ${economy.name}\n\n`;
    md += `**Type:** ${economy.type.replace(/_/g, ' ')}\n\n`;
    md += `**Health:** ${economy.health} | **Stability:** ${economy.stability}\n\n`;

    if (economy.history) {
      md += `## History\n\n${economy.history}\n\n`;
    }

    // Currency
    if (economy.currencies.length > 0) {
      md += `## Currency\n\n`;
      for (const currency of economy.currencies) {
        md += `### ${currency.name}\n\n`;
        md += `**Type:** ${currency.type} | **Stability:** ${currency.stability}\n\n`;
        if (currency.denominations.length > 0) {
          md += `| Denomination | Value | Material |\n`;
          md += `|--------------|-------|----------|\n`;
          for (const denom of currency.denominations) {
            md += `| ${denom.name} | ${denom.value} | ${denom.material || 'N/A'} |\n`;
          }
          md += `\n`;
        }
      }
    }

    // Markets
    if (economy.markets.length > 0) {
      md += `## Markets\n\n`;
      for (const market of economy.markets) {
        md += `### ${market.name}\n\n`;
        md += `**Type:** ${market.type} | **Size:** ${market.size} | **Activity:** ${market.activity}\n\n`;
        if (market.availableGoods.length > 0) {
          md += `**Available Goods:** ${market.availableGoods.length} types\n\n`;
        }
      }
    }

    // Trade Routes
    if (economy.tradeRoutes.length > 0) {
      md += `## Trade Routes\n\n`;
      md += `| Route | Type | Distance | Status |\n`;
      md += `|-------|------|----------|--------|\n`;
      for (const route of economy.tradeRoutes) {
        md += `| ${route.name} | ${route.type} | ${route.distance} km | ${route.status} |\n`;
      }
      md += `\n`;
    }

    // Guilds
    if (economy.guilds.length > 0) {
      md += `## Guilds\n\n`;
      for (const guild of economy.guilds) {
        md += `### ${guild.name}\n\n`;
        md += `**Type:** ${guild.type} | **Status:** ${guild.status}\n\n`;
        md += `**Trades:** ${guild.trades.join(', ')}\n\n`;
        if (guild.memberCount) {
          md += `**Members:** ~${guild.memberCount}\n\n`;
        }
      }
    }

    // Economic Indicators
    if (economy.indicators.length > 0) {
      md += `## Economic Indicators\n\n`;
      md += `| Indicator | Value | Trend |\n`;
      md += `|-----------|-------|-------|\n`;
      for (const ind of economy.indicators) {
        md += `| ${ind.type} | ${ind.value.toFixed(1)} | ${ind.trend} |\n`;
      }
      md += `\n`;
    }

    // Trade
    md += `## Trade\n\n`;
    if (economy.majorExports && economy.majorExports.length > 0) {
      md += `**Major Exports:** ${economy.majorExports.join(', ')}\n\n`;
    }
    if (economy.majorImports && economy.majorImports.length > 0) {
      md += `**Major Imports:** ${economy.majorImports.join(', ')}\n\n`;
    }

    // Social
    md += `## Social Factors\n\n`;
    md += `- **Wealth Distribution:** ${economy.wealthDistribution.replace(/_/g, ' ')}\n`;
    md += `- **Social Mobility:** ${economy.socialMobility}\n`;
    if (economy.povertyRate !== undefined) {
      md += `- **Poverty Rate:** ${economy.povertyRate}%\n`;
    }
    md += `\n`;

    if (economy.notes) {
      md += `## Notes\n\n${economy.notes}\n`;
    }

    return md;
  }

  generatePriceList(currencyId?: string): string {
    const goods = this.getAllGoods();
    const currency = currencyId ? this.currencies.get(currencyId) : undefined;

    let md = `# Trade Goods Price List\n\n`;

    const categories = [...new Set(goods.map(g => g.category))].sort();

    for (const category of categories) {
      const categoryGoods = goods.filter(g => g.category === category);
      if (categoryGoods.length === 0) continue;

      md += `## ${category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n\n`;
      md += `| Good | Quality | Price | Unit |\n`;
      md += `|------|---------|-------|------|\n`;

      for (const good of categoryGoods) {
        const priceStr = currency
          ? this.formatPrice(good.basePrice, currency.id)
          : `${good.basePrice}`;
        md += `| ${good.name} | ${good.quality} | ${priceStr} | ${good.priceUnit} |\n`;
      }
      md += `\n`;
    }

    return md;
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export const economySystem = new EconomySystem();
