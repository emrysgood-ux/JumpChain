/**
 * History/Timeline Generator
 *
 * Comprehensive historical timeline system for epic fiction worldbuilding.
 * Generates eras, events, civilizations, historical figures, and cause-effect chains.
 * Supports random generation of coherent world histories spanning millennia.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

export enum EraType {
  PRIMORDIAL = 'primordial',
  MYTHIC = 'mythic',
  ANCIENT = 'ancient',
  CLASSICAL = 'classical',
  MEDIEVAL = 'medieval',
  RENAISSANCE = 'renaissance',
  INDUSTRIAL = 'industrial',
  MODERN = 'modern',
  FUTURE = 'future',
  APOCALYPTIC = 'apocalyptic',
  POST_APOCALYPTIC = 'post_apocalyptic',
  CUSTOM = 'custom'
}

export enum EventType {
  // Political
  FOUNDING = 'founding',
  CONQUEST = 'conquest',
  CIVIL_WAR = 'civil_war',
  REVOLUTION = 'revolution',
  UNIFICATION = 'unification',
  SECESSION = 'secession',
  TREATY = 'treaty',
  ALLIANCE = 'alliance',
  CORONATION = 'coronation',
  ASSASSINATION = 'assassination',
  COUP = 'coup',
  EXILE = 'exile',

  // Military
  WAR = 'war',
  BATTLE = 'battle',
  SIEGE = 'siege',
  INVASION = 'invasion',
  REBELLION = 'rebellion',
  GENOCIDE = 'genocide',

  // Natural
  NATURAL_DISASTER = 'natural_disaster',
  PLAGUE = 'plague',
  FAMINE = 'famine',
  CLIMATE_CHANGE = 'climate_change',
  EXTINCTION = 'extinction',

  // Supernatural
  DIVINE_INTERVENTION = 'divine_intervention',
  MAGICAL_CATASTROPHE = 'magical_catastrophe',
  PROPHECY = 'prophecy',
  AWAKENING = 'awakening',
  SUMMONING = 'summoning',

  // Cultural
  CULTURAL_RENAISSANCE = 'cultural_renaissance',
  RELIGIOUS_REFORMATION = 'religious_reformation',
  GREAT_MIGRATION = 'great_migration',
  GOLDEN_AGE = 'golden_age',
  DARK_AGE = 'dark_age',

  // Scientific/Technological
  DISCOVERY = 'discovery',
  INVENTION = 'invention',
  EXPLORATION = 'exploration',
  FIRST_CONTACT = 'first_contact',

  // Economic
  ECONOMIC_COLLAPSE = 'economic_collapse',
  TRADE_ROUTE_ESTABLISHED = 'trade_route_established',
  RESOURCE_DISCOVERY = 'resource_discovery',

  // Personal/Notable
  BIRTH = 'birth',
  DEATH = 'death',
  MARRIAGE = 'marriage',
  LEGENDARY_DEED = 'legendary_deed',

  // Other
  MYSTERY = 'mystery',
  OTHER = 'other'
}

export enum EventScale {
  LOCAL = 'local',           // Single city/town
  REGIONAL = 'regional',     // Multiple cities, single region
  NATIONAL = 'national',     // Entire nation/kingdom
  CONTINENTAL = 'continental', // Multiple nations
  GLOBAL = 'global',         // Entire world
  COSMIC = 'cosmic'          // Multiple worlds/planes
}

export enum EventImpact {
  MINOR = 'minor',           // Small lasting effect
  MODERATE = 'moderate',     // Notable historical event
  MAJOR = 'major',           // Changed the course of history
  CATASTROPHIC = 'catastrophic', // Defined an era
  WORLD_ALTERING = 'world_altering' // Changed fundamental nature of world
}

export enum CivilizationStatus {
  NASCENT = 'nascent',       // Just forming
  RISING = 'rising',         // Gaining power
  PEAK = 'peak',             // At height of power
  DECLINING = 'declining',   // Losing power
  FALLEN = 'fallen',         // Collapsed
  EXTINCT = 'extinct',       // No longer exists
  MYTHICAL = 'mythical',     // May or may not have existed
  TRANSFORMED = 'transformed' // Changed into something else
}

export enum FigureRole {
  RULER = 'ruler',
  CONQUEROR = 'conqueror',
  PROPHET = 'prophet',
  SAGE = 'sage',
  INVENTOR = 'inventor',
  EXPLORER = 'explorer',
  REVOLUTIONARY = 'revolutionary',
  ARTIST = 'artist',
  VILLAIN = 'villain',
  HERO = 'hero',
  MARTYR = 'martyr',
  FOUNDER = 'founder',
  DESTROYER = 'destroyer',
  REFORMER = 'reformer',
  TRAITOR = 'traitor',
  SAVIOR = 'savior'
}

export enum ConflictType {
  TERRITORIAL = 'territorial',
  RELIGIOUS = 'religious',
  ECONOMIC = 'economic',
  SUCCESSION = 'succession',
  IDEOLOGICAL = 'ideological',
  RACIAL = 'racial',
  MAGICAL = 'magical',
  EXISTENTIAL = 'existential'
}

export enum RelationshipType {
  CAUSED_BY = 'caused_by',
  LED_TO = 'led_to',
  OCCURRED_DURING = 'occurred_during',
  ENDED_BY = 'ended_by',
  RELATED_TO = 'related_to',
  CONTRADICTS = 'contradicts',
  FULFILLS = 'fulfills'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface TimePoint {
  year: number;
  month?: number;
  day?: number;
  era?: string;           // Custom era name
  approximate?: boolean;  // Is date uncertain?
  notes?: string;
}

export interface DateRange {
  start: TimePoint;
  end?: TimePoint;
  duration?: number;      // In years
  ongoing?: boolean;
}

export interface HistoricalEra {
  id: string;
  name: string;
  type: EraType;
  dateRange: DateRange;
  description: string;
  characteristics: string[];
  dominantPowers: string[];     // Civilization IDs
  majorEvents: string[];        // Event IDs
  technologicalLevel: string;
  magicalLevel?: string;
  culturalThemes: string[];
  endingEvent?: string;         // Event ID that ended this era
  succeedingEra?: string;       // Era ID
  precedingEra?: string;        // Era ID
  notes?: string;
}

export interface HistoricalEvent {
  id: string;
  name: string;
  type: EventType;
  dateRange: DateRange;
  scale: EventScale;
  impact: EventImpact;
  description: string;
  detailedDescription?: string;

  // Participants
  primaryActors: string[];      // Figure IDs
  secondaryActors: string[];    // Figure IDs
  involvedCivilizations: string[]; // Civilization IDs
  involvedLocations: string[];  // Location names/IDs

  // Causality
  causes: { eventId: string; relationship: RelationshipType; description: string }[];
  consequences: { eventId: string; relationship: RelationshipType; description: string }[];

  // Details
  casualties?: number;
  economicImpact?: string;
  culturalImpact?: string;
  magicalImpact?: string;
  politicalImpact?: string;

  // Sources
  historicalAccuracy: 'verified' | 'likely' | 'disputed' | 'legendary' | 'mythical';
  sources?: string[];
  alternateInterpretations?: string[];

  tags: string[];
  notes?: string;
}

export interface HistoricalFigure {
  id: string;
  name: string;
  titles: string[];
  epithet?: string;           // "the Great", "the Terrible", etc.
  roles: FigureRole[];
  lifespan: DateRange;

  // Background
  birthPlace?: string;
  deathPlace?: string;
  species?: string;
  civilization?: string;      // Civilization ID
  dynasty?: string;

  // Relationships
  parents?: string[];         // Figure IDs
  children?: string[];        // Figure IDs
  spouses?: string[];         // Figure IDs
  allies?: string[];          // Figure IDs
  enemies?: string[];         // Figure IDs
  mentors?: string[];         // Figure IDs
  students?: string[];        // Figure IDs

  // Achievements
  majorDeeds: string[];
  participatedEvents: string[]; // Event IDs
  foundedInstitutions?: string[];
  discoveries?: string[];
  conquests?: string[];

  // Legacy
  legacy: string;
  historicalAccuracy: 'historical' | 'semi-legendary' | 'legendary' | 'mythical';
  worshipped?: boolean;
  remembered_as: 'hero' | 'villain' | 'neutral' | 'controversial' | 'forgotten';

  description: string;
  quotes?: string[];
  notes?: string;
}

export interface Civilization {
  id: string;
  name: string;
  alternateNames?: string[];
  status: CivilizationStatus;
  existence: DateRange;

  // Geography
  originLocation: string;
  territoryAtPeak?: string[];
  capital?: string;

  // Culture
  cultureId?: string;         // Reference to Culture engine
  languageId?: string;        // Reference to Conlang engine
  religionId?: string;        // Reference to Religion engine
  governmentType: string;

  // Development
  achievements: string[];
  technologies: string[];
  magicalTraditions?: string[];

  // History
  founders?: string[];        // Figure IDs
  rulers: { figureId: string; period: DateRange }[];
  majorEvents: string[];      // Event IDs
  wars: string[];             // Event IDs
  alliances: string[];        // Civilization IDs
  enemies: string[];          // Civilization IDs
  vassals?: string[];         // Civilization IDs
  overlord?: string;          // Civilization ID

  // Collapse (if applicable)
  peakPeriod?: DateRange;
  declineReasons?: string[];
  successorStates?: string[]; // Civilization IDs

  description: string;
  notes?: string;
}

export interface Conflict {
  id: string;
  name: string;
  type: ConflictType;
  dateRange: DateRange;
  scale: EventScale;

  // Belligerents
  sides: {
    name: string;
    members: string[];        // Civilization IDs
    leader?: string;          // Figure ID
    goals: string[];
    strength?: string;
  }[];

  // Progress
  majorBattles: string[];     // Event IDs
  turningPoints: string[];    // Event IDs
  casualties: {
    side: string;
    military?: number;
    civilian?: number;
  }[];

  // Resolution
  outcome: 'decisive_victory' | 'pyrrhic_victory' | 'stalemate' | 'ongoing' | 'inconclusive';
  victor?: string;            // Side name
  treatyEvent?: string;       // Event ID
  consequences: string[];
  territorialChanges?: string[];

  description: string;
  notes?: string;
}

export interface Timeline {
  id: string;
  name: string;
  description: string;

  // Content
  eras: HistoricalEra[];
  events: HistoricalEvent[];
  figures: HistoricalFigure[];
  civilizations: Civilization[];
  conflicts: Conflict[];

  // Configuration
  startYear: number;
  currentYear: number;
  yearZeroEvent?: string;     // What defines year 0
  calendarSystem: string;

  // Metadata
  dateCreated: Date;
  lastModified: Date;
  notes?: string;
}

export interface HistoryGenerationOptions {
  startYear?: number;
  endYear?: number;
  eraCount?: number;
  eventDensity?: 'sparse' | 'moderate' | 'dense';
  civilizationCount?: number;
  includeMyths?: boolean;
  includeSupernaturalEvents?: boolean;
  theme?: 'rise_and_fall' | 'cycles' | 'progress' | 'decline' | 'conflict' | 'random';
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

  weightedPick<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = this.next() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  getSeed(): number {
    return this.seed;
  }

  setSeed(seed: number): void {
    this.seed = seed;
  }
}

// ============================================================================
// EVENT TEMPLATES
// ============================================================================

const EVENT_TEMPLATES: Record<EventType, { names: string[]; descriptions: string[] }> = {
  [EventType.FOUNDING]: {
    names: ['Founding of {place}', 'Establishment of {civilization}', 'Birth of {nation}'],
    descriptions: ['A new settlement was established', 'The first stones were laid', 'A new civilization emerged']
  },
  [EventType.CONQUEST]: {
    names: ['Conquest of {place}', '{civilization} Conquest', 'Fall of {place}'],
    descriptions: ['Forces swept through the land', 'The city fell after a prolonged siege', 'The old order was swept away']
  },
  [EventType.CIVIL_WAR]: {
    names: ['War of the {adjective} {noun}', '{civilization} Civil War', 'Brother Against Brother'],
    descriptions: ['Internal strife tore the nation apart', 'Factions vied for control', 'The realm was split asunder']
  },
  [EventType.REVOLUTION]: {
    names: ['The {adjective} Revolution', 'Uprising of {year}', 'Fall of the {noun}'],
    descriptions: ['The old order was overthrown', 'The people rose against their rulers', 'A new age dawned']
  },
  [EventType.UNIFICATION]: {
    names: ['Unification of {place}', 'The Great Joining', 'Union of {civilizations}'],
    descriptions: ['Separate peoples became one', 'Old rivalries were set aside', 'A new unified state emerged']
  },
  [EventType.SECESSION]: {
    names: ['Secession of {place}', 'Breaking of {civilization}', 'Declaration of Independence'],
    descriptions: ['A region declared independence', 'The union fractured', 'New borders were drawn']
  },
  [EventType.TREATY]: {
    names: ['Treaty of {place}', 'Peace of {year}', 'The {adjective} Accord'],
    descriptions: ['A historic agreement was reached', 'Peace was formally declared', 'New terms were established']
  },
  [EventType.ALLIANCE]: {
    names: ['{adjective} Alliance', 'Pact of {place}', 'Union of {number}'],
    descriptions: ['Powers joined forces', 'A defensive pact was signed', 'Former rivals became allies']
  },
  [EventType.CORONATION]: {
    names: ['Coronation of {figure}', 'Ascension of {figure}', 'Dawn of a New Reign'],
    descriptions: ['A new ruler took the throne', 'The crown passed to a new head', 'A new era of leadership began']
  },
  [EventType.ASSASSINATION]: {
    names: ['Assassination of {figure}', 'Death of {figure}', 'The {adjective} Murder'],
    descriptions: ['A leader was struck down', 'Treachery claimed a life', 'The world was shocked']
  },
  [EventType.COUP]: {
    names: ['Coup of {year}', '{figure}\'s Seizure', 'Overthrow of {figure}'],
    descriptions: ['Power was seized by force', 'The government fell overnight', 'New rulers emerged from the chaos']
  },
  [EventType.EXILE]: {
    names: ['Exile of {figure}', 'The Great Expulsion', 'Banishment of {group}'],
    descriptions: ['Forced to leave their homeland', 'Cast out into the wilderness', 'A people scattered to the winds']
  },
  [EventType.WAR]: {
    names: ['War of {noun}', 'The {adjective} War', '{number}-Year War'],
    descriptions: ['Armies clashed across the land', 'Nations were locked in deadly struggle', 'The fires of war swept the realm']
  },
  [EventType.BATTLE]: {
    names: ['Battle of {place}', 'Siege of {place}', 'The {adjective} Stand'],
    descriptions: ['Forces met in decisive combat', 'Blood soaked the battlefield', 'The fate of nations hung in the balance']
  },
  [EventType.SIEGE]: {
    names: ['Siege of {place}', 'Fall of {place}', 'The {adjective} Siege'],
    descriptions: ['Walls were surrounded', 'The city endured months of hardship', 'Defenders held against all odds']
  },
  [EventType.INVASION]: {
    names: ['Invasion of {place}', 'The {adjective} Invasion', '{civilization} Incursion'],
    descriptions: ['Foreign forces crossed the border', 'The land was overrun', 'Defenders scrambled to respond']
  },
  [EventType.REBELLION]: {
    names: ['{adjective} Rebellion', 'Revolt of {year}', 'The {noun} Uprising'],
    descriptions: ['The oppressed rose up', 'Authority was challenged', 'Open defiance erupted']
  },
  [EventType.GENOCIDE]: {
    names: ['The {adjective} Purge', 'Destruction of {group}', 'The Dark Times'],
    descriptions: ['Unspeakable horrors were committed', 'A people faced annihilation', 'History\'s darkest chapter']
  },
  [EventType.NATURAL_DISASTER]: {
    names: ['The Great {disaster}', '{disaster} of {year}', 'The {adjective} Catastrophe'],
    descriptions: ['Nature unleashed its fury', 'The land was forever changed', 'Countless lives were lost']
  },
  [EventType.PLAGUE]: {
    names: ['The {adjective} Plague', 'The {color} Death', 'Pestilence of {year}'],
    descriptions: ['Disease swept through the population', 'Cities were emptied', 'The dead outnumbered the living']
  },
  [EventType.FAMINE]: {
    names: ['The Great Famine', 'Starvation of {year}', 'The Hungry Years'],
    descriptions: ['Crops failed across the land', 'People starved in the streets', 'Desperation drove many to extremes']
  },
  [EventType.CLIMATE_CHANGE]: {
    names: ['The Long {season}', 'Climate Shift of {era}', 'The Changing World'],
    descriptions: ['Weather patterns shifted dramatically', 'The world grew colder/warmer', 'Ecosystems collapsed']
  },
  [EventType.EXTINCTION]: {
    names: ['Extinction of {species}', 'The Last {creature}', 'End of {era}'],
    descriptions: ['A species vanished forever', 'The last of their kind perished', 'The world grew emptier']
  },
  [EventType.DIVINE_INTERVENTION]: {
    names: ['Divine Wrath', 'Blessing of {deity}', 'The {adjective} Miracle'],
    descriptions: ['The gods made their will known', 'Divine power reshaped reality', 'Mortals witnessed the impossible']
  },
  [EventType.MAGICAL_CATASTROPHE]: {
    names: ['The Sundering', 'Magical Cataclysm', 'The {adjective} Breach'],
    descriptions: ['Magic went terribly wrong', 'Reality itself was torn', 'The consequences were devastating']
  },
  [EventType.PROPHECY]: {
    names: ['The {adjective} Prophecy', 'Words of {figure}', 'Foretelling of {event}'],
    descriptions: ['A vision of the future was revealed', 'Ancient words gained new meaning', 'Fate was set in motion']
  },
  [EventType.AWAKENING]: {
    names: ['The Awakening', 'Rise of {entity}', 'Return of {creature}'],
    descriptions: ['Something ancient stirred', 'Long-dormant powers arose', 'The world trembled']
  },
  [EventType.SUMMONING]: {
    names: ['Summoning of {entity}', 'The {adjective} Calling', 'Breach of {plane}'],
    descriptions: ['Something was called forth', 'The barriers between worlds weakened', 'A presence made itself known']
  },
  [EventType.CULTURAL_RENAISSANCE]: {
    names: ['{adjective} Renaissance', 'Golden Age of {art}', 'Flowering of {civilization}'],
    descriptions: ['Art and culture flourished', 'New ideas transformed society', 'Beauty and learning thrived']
  },
  [EventType.RELIGIOUS_REFORMATION]: {
    names: ['The {adjective} Reformation', 'Schism of {religion}', 'New Faith Movement'],
    descriptions: ['Religious practices were transformed', 'Old beliefs were challenged', 'New sects emerged']
  },
  [EventType.GREAT_MIGRATION]: {
    names: ['The Great Migration', 'Exodus of {people}', 'Journey of {civilization}'],
    descriptions: ['Entire peoples relocated', 'New lands were settled', 'The map was redrawn']
  },
  [EventType.GOLDEN_AGE]: {
    names: ['Golden Age of {civilization}', 'The {adjective} Era', 'Height of {empire}'],
    descriptions: ['Civilization reached its peak', 'Prosperity and peace reigned', 'Achievements defined an age']
  },
  [EventType.DARK_AGE]: {
    names: ['The Dark Age', 'Age of {noun}', 'The Lost Years'],
    descriptions: ['Knowledge was lost', 'Civilization crumbled', 'Hard times befell the land']
  },
  [EventType.DISCOVERY]: {
    names: ['Discovery of {thing}', 'Revelation of {secret}', 'Uncovering of {mystery}'],
    descriptions: ['New knowledge changed everything', 'Ancient secrets were revealed', 'Understanding expanded']
  },
  [EventType.INVENTION]: {
    names: ['Invention of {thing}', 'Birth of {technology}', 'The {adjective} Innovation'],
    descriptions: ['A new tool transformed society', 'Technology advanced', 'The impossible became possible']
  },
  [EventType.EXPLORATION]: {
    names: ['Exploration of {place}', 'First Voyage to {destination}', 'Mapping of {region}'],
    descriptions: ['Unknown lands were discovered', 'Brave souls ventured into the unknown', 'The world grew larger']
  },
  [EventType.FIRST_CONTACT]: {
    names: ['First Contact', 'Meeting of {peoples}', 'Discovery of {others}'],
    descriptions: ['Two peoples met for the first time', 'The world changed forever', 'New possibilities emerged']
  },
  [EventType.ECONOMIC_COLLAPSE]: {
    names: ['Great Depression of {year}', 'Economic Crisis', 'The {adjective} Collapse'],
    descriptions: ['Markets crashed', 'Wealth evaporated overnight', 'Hard times befell all']
  },
  [EventType.TRADE_ROUTE_ESTABLISHED]: {
    names: ['{adjective} Road', 'Trade Route to {place}', 'Opening of {route}'],
    descriptions: ['Commerce flowed along new paths', 'Merchants found new markets', 'Wealth began to flow']
  },
  [EventType.RESOURCE_DISCOVERY]: {
    names: ['Discovery of {resource}', '{resource} Rush', 'The {adjective} Find'],
    descriptions: ['Valuable resources were found', 'Fortune seekers flooded in', 'The economy transformed']
  },
  [EventType.BIRTH]: {
    names: ['Birth of {figure}', 'Coming of {figure}', 'A Child is Born'],
    descriptions: ['A future legend entered the world', 'Destiny began its course', 'None knew what the child would become']
  },
  [EventType.DEATH]: {
    names: ['Death of {figure}', 'Passing of {figure}', 'End of an Era'],
    descriptions: ['A great figure passed on', 'The world mourned', 'An era came to a close']
  },
  [EventType.MARRIAGE]: {
    names: ['Marriage of {figure} and {figure}', 'The Royal Wedding', 'Union of Houses'],
    descriptions: ['Two houses were joined', 'A political marriage sealed an alliance', 'Love or duty brought them together']
  },
  [EventType.LEGENDARY_DEED]: {
    names: ['{figure}\'s {deed}', 'The {adjective} Feat', 'Legend of {figure}'],
    descriptions: ['A deed for the ages was accomplished', 'Songs would be sung for generations', 'The impossible was achieved']
  },
  [EventType.MYSTERY]: {
    names: ['The {adjective} Mystery', 'Disappearance of {thing}', 'The Unexplained'],
    descriptions: ['Something inexplicable occurred', 'No one knows what truly happened', 'Theories abound to this day']
  },
  [EventType.OTHER]: {
    names: ['Events of {year}', 'The {adjective} Occurrence', 'Notable Happening'],
    descriptions: ['Something significant occurred', 'History was made', 'The world took note']
  }
};

// ============================================================================
// WORD BANKS FOR GENERATION
// ============================================================================

const WORD_BANKS = {
  adjectives: ['Great', 'Bloody', 'Golden', 'Dark', 'Final', 'First', 'Last', 'Eternal', 'Crimson', 'Silver',
               'Shattered', 'Burning', 'Frozen', 'Silent', 'Screaming', 'Holy', 'Unholy', 'Ancient', 'Lost'],
  nouns: ['Crowns', 'Roses', 'Swords', 'Flames', 'Shadows', 'Stars', 'Thrones', 'Dragons', 'Lions', 'Eagles',
          'Wolves', 'Serpents', 'Towers', 'Gates', 'Storms', 'Seas', 'Mountains', 'Rivers', 'Kingdoms'],
  disasters: ['Earthquake', 'Flood', 'Eruption', 'Storm', 'Wildfire', 'Tsunami', 'Drought', 'Meteor'],
  colors: ['Red', 'Black', 'White', 'Blue', 'Green', 'Golden', 'Silver', 'Crimson', 'Azure', 'Emerald'],
  seasons: ['Winter', 'Summer', 'Spring', 'Autumn', 'Night', 'Darkness', 'Light'],
  deeds: ['Victory', 'Sacrifice', 'Journey', 'Quest', 'Trial', 'Triumph', 'Fall', 'Rise', 'Stand']
};

// ============================================================================
// HISTORY GENERATOR CLASS
// ============================================================================

export class HistoryGenerator {
  private timelines: Map<string, Timeline> = new Map();
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
  // TIMELINE CRUD
  // ==========================================================================

  createTimeline(data: Partial<Timeline> & { name: string }): Timeline {
    const timeline: Timeline = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',

      eras: data.eras || [],
      events: data.events || [],
      figures: data.figures || [],
      civilizations: data.civilizations || [],
      conflicts: data.conflicts || [],

      startYear: data.startYear ?? -10000,
      currentYear: data.currentYear ?? 0,
      yearZeroEvent: data.yearZeroEvent,
      calendarSystem: data.calendarSystem || 'Common Era',

      dateCreated: new Date(),
      lastModified: new Date(),
      notes: data.notes
    };

    this.timelines.set(timeline.id, timeline);
    return timeline;
  }

  getTimeline(id: string): Timeline | undefined {
    return this.timelines.get(id);
  }

  getAllTimelines(): Timeline[] {
    return Array.from(this.timelines.values());
  }

  updateTimeline(id: string, updates: Partial<Timeline>): Timeline | undefined {
    const timeline = this.timelines.get(id);
    if (!timeline) return undefined;

    const updated = { ...timeline, ...updates, lastModified: new Date() };
    this.timelines.set(id, updated);
    return updated;
  }

  deleteTimeline(id: string): boolean {
    return this.timelines.delete(id);
  }

  // ==========================================================================
  // ERA MANAGEMENT
  // ==========================================================================

  addEra(timelineId: string, era: Partial<HistoricalEra> & { name: string; dateRange: DateRange }): HistoricalEra | undefined {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return undefined;

    const newEra: HistoricalEra = {
      id: uuidv4(),
      name: era.name,
      type: era.type || EraType.CUSTOM,
      dateRange: era.dateRange,
      description: era.description || '',
      characteristics: era.characteristics || [],
      dominantPowers: era.dominantPowers || [],
      majorEvents: era.majorEvents || [],
      technologicalLevel: era.technologicalLevel || 'Unknown',
      magicalLevel: era.magicalLevel,
      culturalThemes: era.culturalThemes || [],
      endingEvent: era.endingEvent,
      succeedingEra: era.succeedingEra,
      precedingEra: era.precedingEra,
      notes: era.notes
    };

    timeline.eras.push(newEra);
    timeline.eras.sort((a, b) => a.dateRange.start.year - b.dateRange.start.year);
    timeline.lastModified = new Date();

    return newEra;
  }

  // ==========================================================================
  // EVENT MANAGEMENT
  // ==========================================================================

  addEvent(timelineId: string, event: Partial<HistoricalEvent> & { name: string; type: EventType; dateRange: DateRange }): HistoricalEvent | undefined {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return undefined;

    const newEvent: HistoricalEvent = {
      id: uuidv4(),
      name: event.name,
      type: event.type,
      dateRange: event.dateRange,
      scale: event.scale || EventScale.REGIONAL,
      impact: event.impact || EventImpact.MODERATE,
      description: event.description || '',
      detailedDescription: event.detailedDescription,

      primaryActors: event.primaryActors || [],
      secondaryActors: event.secondaryActors || [],
      involvedCivilizations: event.involvedCivilizations || [],
      involvedLocations: event.involvedLocations || [],

      causes: event.causes || [],
      consequences: event.consequences || [],

      casualties: event.casualties,
      economicImpact: event.economicImpact,
      culturalImpact: event.culturalImpact,
      magicalImpact: event.magicalImpact,
      politicalImpact: event.politicalImpact,

      historicalAccuracy: event.historicalAccuracy || 'verified',
      sources: event.sources,
      alternateInterpretations: event.alternateInterpretations,

      tags: event.tags || [],
      notes: event.notes
    };

    timeline.events.push(newEvent);
    timeline.events.sort((a, b) => a.dateRange.start.year - b.dateRange.start.year);
    timeline.lastModified = new Date();

    return newEvent;
  }

  linkEvents(timelineId: string, causeEventId: string, effectEventId: string, relationship: RelationshipType = RelationshipType.LED_TO, description: string = ''): boolean {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return false;

    const causeEvent = timeline.events.find(e => e.id === causeEventId);
    const effectEvent = timeline.events.find(e => e.id === effectEventId);

    if (!causeEvent || !effectEvent) return false;

    causeEvent.consequences.push({ eventId: effectEventId, relationship, description });
    effectEvent.causes.push({ eventId: causeEventId, relationship, description });

    timeline.lastModified = new Date();
    return true;
  }

  // ==========================================================================
  // FIGURE MANAGEMENT
  // ==========================================================================

  addFigure(timelineId: string, figure: Partial<HistoricalFigure> & { name: string; lifespan: DateRange }): HistoricalFigure | undefined {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return undefined;

    const newFigure: HistoricalFigure = {
      id: uuidv4(),
      name: figure.name,
      titles: figure.titles || [],
      epithet: figure.epithet,
      roles: figure.roles || [],
      lifespan: figure.lifespan,

      birthPlace: figure.birthPlace,
      deathPlace: figure.deathPlace,
      species: figure.species,
      civilization: figure.civilization,
      dynasty: figure.dynasty,

      parents: figure.parents,
      children: figure.children,
      spouses: figure.spouses,
      allies: figure.allies,
      enemies: figure.enemies,
      mentors: figure.mentors,
      students: figure.students,

      majorDeeds: figure.majorDeeds || [],
      participatedEvents: figure.participatedEvents || [],
      foundedInstitutions: figure.foundedInstitutions,
      discoveries: figure.discoveries,
      conquests: figure.conquests,

      legacy: figure.legacy || '',
      historicalAccuracy: figure.historicalAccuracy || 'historical',
      worshipped: figure.worshipped,
      remembered_as: figure.remembered_as || 'neutral',

      description: figure.description || '',
      quotes: figure.quotes,
      notes: figure.notes
    };

    timeline.figures.push(newFigure);
    timeline.lastModified = new Date();

    return newFigure;
  }

  // ==========================================================================
  // CIVILIZATION MANAGEMENT
  // ==========================================================================

  addCivilization(timelineId: string, civ: Partial<Civilization> & { name: string; existence: DateRange }): Civilization | undefined {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return undefined;

    const newCiv: Civilization = {
      id: uuidv4(),
      name: civ.name,
      alternateNames: civ.alternateNames,
      status: civ.status || CivilizationStatus.NASCENT,
      existence: civ.existence,

      originLocation: civ.originLocation || 'Unknown',
      territoryAtPeak: civ.territoryAtPeak,
      capital: civ.capital,

      cultureId: civ.cultureId,
      languageId: civ.languageId,
      religionId: civ.religionId,
      governmentType: civ.governmentType || 'Unknown',

      achievements: civ.achievements || [],
      technologies: civ.technologies || [],
      magicalTraditions: civ.magicalTraditions,

      founders: civ.founders,
      rulers: civ.rulers || [],
      majorEvents: civ.majorEvents || [],
      wars: civ.wars || [],
      alliances: civ.alliances || [],
      enemies: civ.enemies || [],
      vassals: civ.vassals,
      overlord: civ.overlord,

      peakPeriod: civ.peakPeriod,
      declineReasons: civ.declineReasons,
      successorStates: civ.successorStates,

      description: civ.description || '',
      notes: civ.notes
    };

    timeline.civilizations.push(newCiv);
    timeline.lastModified = new Date();

    return newCiv;
  }

  // ==========================================================================
  // CONFLICT MANAGEMENT
  // ==========================================================================

  addConflict(timelineId: string, conflict: Partial<Conflict> & { name: string; type: ConflictType; dateRange: DateRange }): Conflict | undefined {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return undefined;

    const newConflict: Conflict = {
      id: uuidv4(),
      name: conflict.name,
      type: conflict.type,
      dateRange: conflict.dateRange,
      scale: conflict.scale || EventScale.REGIONAL,

      sides: conflict.sides || [],
      majorBattles: conflict.majorBattles || [],
      turningPoints: conflict.turningPoints || [],
      casualties: conflict.casualties || [],

      outcome: conflict.outcome || 'ongoing',
      victor: conflict.victor,
      treatyEvent: conflict.treatyEvent,
      consequences: conflict.consequences || [],
      territorialChanges: conflict.territorialChanges,

      description: conflict.description || '',
      notes: conflict.notes
    };

    timeline.conflicts.push(newConflict);
    timeline.lastModified = new Date();

    return newConflict;
  }

  // ==========================================================================
  // RANDOM GENERATION
  // ==========================================================================

  generateRandomHistory(options: HistoryGenerationOptions = {}): Timeline {
    if (options.seed !== undefined) {
      this.random.setSeed(options.seed);
    }

    const startYear = options.startYear ?? -5000;
    const endYear = options.endYear ?? 1000;
    const timeSpan = endYear - startYear;
    const eraCount = options.eraCount ?? Math.max(3, Math.floor(timeSpan / 1000));
    const civCount = options.civilizationCount ?? this.random.nextInt(3, 8);
    const includeMyths = options.includeMyths !== false;
    const includeSupernatural = options.includeSupernaturalEvents !== false;
    const theme = options.theme || 'random';

    // Create timeline
    const timeline = this.createTimeline({
      name: `History of the ${this.random.pick(WORD_BANKS.adjectives)} ${this.random.pick(WORD_BANKS.nouns)}`,
      startYear,
      currentYear: endYear,
      calendarSystem: 'Standard Reckoning'
    });

    // Generate eras
    this.generateEras(timeline.id, startYear, endYear, eraCount, includeMyths);

    // Generate civilizations
    const civilizations = this.generateCivilizations(timeline.id, civCount, startYear, endYear, theme);

    // Generate events based on density
    const eventCount = this.getEventCount(options.eventDensity, timeSpan);
    this.generateEvents(timeline.id, startYear, endYear, eventCount, includeSupernatural, civilizations);

    // Generate historical figures
    this.generateFigures(timeline.id, Math.floor(eventCount / 3), startYear, endYear, civilizations);

    // Generate conflicts
    this.generateConflicts(timeline.id, civilizations, startYear, endYear);

    // Link events causally
    this.generateCausalLinks(timeline.id);

    return timeline;
  }

  private generateEras(timelineId: string, startYear: number, endYear: number, count: number, includeMyths: boolean): void {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return;

    const eraTypes: EraType[] = includeMyths
      ? [EraType.MYTHIC, EraType.ANCIENT, EraType.CLASSICAL, EraType.MEDIEVAL, EraType.RENAISSANCE]
      : [EraType.ANCIENT, EraType.CLASSICAL, EraType.MEDIEVAL, EraType.RENAISSANCE];

    const timeSpan = endYear - startYear;
    const avgDuration = timeSpan / count;

    let currentYear = startYear;
    let prevEraId: string | undefined;

    for (let i = 0; i < count; i++) {
      const duration = Math.floor(avgDuration * (0.5 + this.random.next()));
      const eraEnd = Math.min(currentYear + duration, endYear);
      const eraType = eraTypes[Math.min(i, eraTypes.length - 1)];

      const era = this.addEra(timelineId, {
        name: this.generateEraName(eraType),
        type: eraType,
        dateRange: {
          start: { year: currentYear },
          end: { year: eraEnd }
        },
        description: this.generateEraDescription(eraType),
        characteristics: this.generateEraCharacteristics(eraType),
        technologicalLevel: this.getTechLevel(eraType),
        culturalThemes: this.random.pickMultiple(WORD_BANKS.adjectives, 3),
        precedingEra: prevEraId
      });

      if (era && prevEraId) {
        const prevEra = timeline.eras.find(e => e.id === prevEraId);
        if (prevEra) prevEra.succeedingEra = era.id;
      }

      prevEraId = era?.id;
      currentYear = eraEnd;
    }
  }

  private generateEraName(type: EraType): string {
    const prefixes: Record<EraType, string[]> = {
      [EraType.PRIMORDIAL]: ['Dawn of', 'Age of Creation', 'The Formless'],
      [EraType.MYTHIC]: ['Age of Gods', 'Time of Legends', 'The Heroic Age'],
      [EraType.ANCIENT]: ['Age of Empires', 'The Old Kingdom', 'Ancient Times'],
      [EraType.CLASSICAL]: ['Classical Era', 'Age of Reason', 'The Enlightened Age'],
      [EraType.MEDIEVAL]: ['Age of Crowns', 'The Middle Era', 'Age of Swords'],
      [EraType.RENAISSANCE]: ['Age of Discovery', 'The Rebirth', 'New Dawn'],
      [EraType.INDUSTRIAL]: ['Age of Steel', 'The Machine Age', 'Industrial Era'],
      [EraType.MODERN]: ['Modern Era', 'The Current Age', 'Present Times'],
      [EraType.FUTURE]: ['Age to Come', 'The Next Era', 'Tomorrow'],
      [EraType.APOCALYPTIC]: ['The End Times', 'Age of Ruin', 'The Collapse'],
      [EraType.POST_APOCALYPTIC]: ['After the Fall', 'The Rebuilding', 'New Beginning'],
      [EraType.CUSTOM]: ['The Era', 'Age of', 'Time of']
    };

    return this.random.pick(prefixes[type] || prefixes[EraType.CUSTOM]);
  }

  private generateEraDescription(type: EraType): string {
    const descriptions: Record<EraType, string[]> = {
      [EraType.PRIMORDIAL]: ['The world was new and formless', 'Before the first civilizations rose'],
      [EraType.MYTHIC]: ['Gods walked among mortals', 'Heroes performed legendary deeds'],
      [EraType.ANCIENT]: ['Great empires rose and fell', 'The foundations of civilization were laid'],
      [EraType.CLASSICAL]: ['Philosophy and art flourished', 'Great thinkers shaped the world'],
      [EraType.MEDIEVAL]: ['Kingdoms vied for power', 'Knights and lords ruled the land'],
      [EraType.RENAISSANCE]: ['Learning and culture bloomed anew', 'Old knowledge was rediscovered'],
      [EraType.INDUSTRIAL]: ['Machines transformed society', 'Progress accelerated'],
      [EraType.MODERN]: ['The world entered a new age', 'Technology advanced rapidly'],
      [EraType.FUTURE]: ['What lies ahead remains unknown', 'The future awaits'],
      [EraType.APOCALYPTIC]: ['The world teetered on the brink', 'Destruction loomed'],
      [EraType.POST_APOCALYPTIC]: ['From the ashes, survivors emerged', 'Civilization slowly rebuilt'],
      [EraType.CUSTOM]: ['A unique period in history', 'Notable events shaped this time']
    };

    return this.random.pick(descriptions[type] || descriptions[EraType.CUSTOM]);
  }

  private generateEraCharacteristics(type: EraType): string[] {
    const chars: Record<EraType, string[][]> = {
      [EraType.PRIMORDIAL]: [['primordial chaos', 'elemental forces', 'the first beings']],
      [EraType.MYTHIC]: [['divine intervention', 'legendary heroes', 'mythical creatures', 'epic quests']],
      [EraType.ANCIENT]: [['early empires', 'monumental architecture', 'early writing', 'bronze/iron working']],
      [EraType.CLASSICAL]: [['philosophy', 'democracy', 'republics', 'great libraries', 'expansion']],
      [EraType.MEDIEVAL]: [['feudalism', 'chivalry', 'religious authority', 'castles', 'crusades']],
      [EraType.RENAISSANCE]: [['humanism', 'artistic flourishing', 'scientific inquiry', 'exploration']],
      [EraType.INDUSTRIAL]: [['mechanization', 'urbanization', 'mass production', 'railways']],
      [EraType.MODERN]: [['globalization', 'rapid change', 'technology', 'communication']],
      [EraType.FUTURE]: [['unknown developments', 'potential', 'possibility']],
      [EraType.APOCALYPTIC]: [['collapse', 'catastrophe', 'desperation', 'survival']],
      [EraType.POST_APOCALYPTIC]: [['rebuilding', 'scavenging', 'new societies', 'lost knowledge']],
      [EraType.CUSTOM]: [['unique features', 'distinctive events', 'notable figures']]
    };

    return this.random.pickMultiple(chars[type]?.[0] || chars[EraType.CUSTOM][0], 4);
  }

  private getTechLevel(type: EraType): string {
    const levels: Record<EraType, string> = {
      [EraType.PRIMORDIAL]: 'None',
      [EraType.MYTHIC]: 'Primitive/Magical',
      [EraType.ANCIENT]: 'Bronze/Iron Age',
      [EraType.CLASSICAL]: 'Classical',
      [EraType.MEDIEVAL]: 'Medieval',
      [EraType.RENAISSANCE]: 'Early Modern',
      [EraType.INDUSTRIAL]: 'Industrial',
      [EraType.MODERN]: 'Modern',
      [EraType.FUTURE]: 'Advanced',
      [EraType.APOCALYPTIC]: 'Variable',
      [EraType.POST_APOCALYPTIC]: 'Regressed',
      [EraType.CUSTOM]: 'Variable'
    };

    return levels[type] || 'Unknown';
  }

  private generateCivilizations(timelineId: string, count: number, startYear: number, endYear: number, _theme: string): Civilization[] {
    const civilizations: Civilization[] = [];
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return civilizations;

    for (let i = 0; i < count; i++) {
      const birthYear = startYear + this.random.nextInt(0, Math.floor((endYear - startYear) * 0.6));
      const lifespan = this.random.nextInt(200, 2000);
      const deathYear = Math.min(birthYear + lifespan, endYear);

      const status = deathYear < endYear
        ? this.random.pick([CivilizationStatus.FALLEN, CivilizationStatus.EXTINCT, CivilizationStatus.TRANSFORMED])
        : this.random.pick([CivilizationStatus.PEAK, CivilizationStatus.DECLINING, CivilizationStatus.RISING]);

      const civ = this.addCivilization(timelineId, {
        name: this.generateCivilizationName(),
        existence: {
          start: { year: birthYear },
          end: deathYear < endYear ? { year: deathYear } : undefined,
          ongoing: deathYear >= endYear
        },
        status,
        originLocation: `Region ${i + 1}`,
        governmentType: this.random.pick(['Monarchy', 'Republic', 'Empire', 'Theocracy', 'Oligarchy', 'Tribal', 'Federation']),
        achievements: this.random.pickMultiple(['Architecture', 'Writing', 'Mathematics', 'Astronomy', 'Medicine', 'Philosophy', 'Art', 'Music', 'Navigation', 'Metallurgy'], this.random.nextInt(2, 5)),
        technologies: this.random.pickMultiple(['Iron working', 'Bronze casting', 'Wheel', 'Writing', 'Sailing', 'Agriculture', 'Irrigation', 'Road building'], this.random.nextInt(2, 4)),
        description: `A ${this.random.pick(['mighty', 'ancient', 'mysterious', 'warlike', 'peaceful', 'prosperous'])} civilization.`
      });

      if (civ) civilizations.push(civ);
    }

    return civilizations;
  }

  private generateCivilizationName(): string {
    const prefixes = ['Ar', 'El', 'Kar', 'Val', 'Nor', 'Sul', 'Mor', 'Tar', 'Zan', 'Vor', 'Ash', 'Bel', 'Cor', 'Dar'];
    const middles = ['a', 'i', 'o', 'u', 'an', 'en', 'in', 'or', 'ar', 'el', 'al'];
    const suffixes = ['ia', 'ium', 'and', 'or', 'eth', 'oth', 'an', 'is', 'us', 'on', 'en'];

    return this.random.pick(prefixes) + this.random.pick(middles) + this.random.pick(suffixes);
  }

  private getEventCount(density: 'sparse' | 'moderate' | 'dense' | undefined, timeSpan: number): number {
    const base = timeSpan / 100;
    switch (density) {
      case 'sparse': return Math.floor(base * 0.5);
      case 'dense': return Math.floor(base * 2);
      default: return Math.floor(base);
    }
  }

  private generateEvents(timelineId: string, startYear: number, endYear: number, count: number, includeSupernatural: boolean, civilizations: Civilization[]): void {
    const eventTypes = Object.values(EventType).filter(t => {
      if (!includeSupernatural) {
        return ![EventType.DIVINE_INTERVENTION, EventType.MAGICAL_CATASTROPHE, EventType.PROPHECY, EventType.AWAKENING, EventType.SUMMONING].includes(t);
      }
      return true;
    });

    for (let i = 0; i < count; i++) {
      const type = this.random.pick(eventTypes);
      const year = this.random.nextInt(startYear, endYear);

      const civ = civilizations.length > 0 ? this.random.pick(civilizations) : undefined;
      const civActive = civ && year >= civ.existence.start.year && (!civ.existence.end || year <= civ.existence.end.year);

      this.addEvent(timelineId, {
        name: this.generateEventName(type, year, civ?.name),
        type,
        dateRange: {
          start: { year },
          duration: this.getTypicalDuration(type)
        },
        scale: this.random.pick(Object.values(EventScale)),
        impact: this.random.pick(Object.values(EventImpact)),
        description: this.generateEventDescription(type),
        involvedCivilizations: civActive && civ ? [civ.id] : [],
        historicalAccuracy: this.random.pick(['verified', 'likely', 'disputed', 'legendary']),
        tags: [type]
      });
    }
  }

  private generateEventName(type: EventType, year: number, civName?: string): string {
    const templates = EVENT_TEMPLATES[type] || EVENT_TEMPLATES[EventType.OTHER];
    let name = this.random.pick(templates.names);

    name = name.replace('{place}', civName || this.generatePlaceName());
    name = name.replace('{civilization}', civName || this.generateCivilizationName());
    name = name.replace('{year}', year.toString());
    name = name.replace('{adjective}', this.random.pick(WORD_BANKS.adjectives));
    name = name.replace('{noun}', this.random.pick(WORD_BANKS.nouns));
    name = name.replace('{disaster}', this.random.pick(WORD_BANKS.disasters));
    name = name.replace('{color}', this.random.pick(WORD_BANKS.colors));
    name = name.replace('{season}', this.random.pick(WORD_BANKS.seasons));
    name = name.replace('{number}', this.random.nextInt(2, 100).toString());

    return name;
  }

  private generateEventDescription(type: EventType): string {
    const templates = EVENT_TEMPLATES[type] || EVENT_TEMPLATES[EventType.OTHER];
    return this.random.pick(templates.descriptions);
  }

  private generatePlaceName(): string {
    const prefixes = ['North', 'South', 'East', 'West', 'Old', 'New', 'High', 'Low', 'Great', 'Lesser'];
    const roots = ['haven', 'holm', 'ford', 'burg', 'ton', 'dale', 'vale', 'mount', 'port', 'bridge'];

    return this.random.pick(prefixes) + this.random.pick(roots);
  }

  private getTypicalDuration(type: EventType): number {
    switch (type) {
      case EventType.BATTLE:
      case EventType.ASSASSINATION:
      case EventType.CORONATION:
        return 0; // Single day/moment
      case EventType.SIEGE:
        return this.random.nextInt(0, 2);
      case EventType.WAR:
      case EventType.CIVIL_WAR:
      case EventType.REBELLION:
        return this.random.nextInt(1, 20);
      case EventType.GOLDEN_AGE:
      case EventType.DARK_AGE:
        return this.random.nextInt(50, 300);
      case EventType.PLAGUE:
      case EventType.FAMINE:
        return this.random.nextInt(1, 10);
      default:
        return this.random.nextInt(0, 5);
    }
  }

  private generateFigures(timelineId: string, count: number, startYear: number, endYear: number, civilizations: Civilization[]): void {
    for (let i = 0; i < count; i++) {
      const birthYear = this.random.nextInt(startYear, endYear - 20);
      const lifespan = this.random.nextInt(30, 100);
      const deathYear = Math.min(birthYear + lifespan, endYear);

      const civ = civilizations.length > 0 ? this.random.pick(civilizations) : undefined;
      const civActive = civ && birthYear >= civ.existence.start.year && (!civ.existence.end || birthYear <= civ.existence.end.year);

      this.addFigure(timelineId, {
        name: this.generateFigureName(),
        titles: this.random.pickMultiple(['King', 'Queen', 'Lord', 'Lady', 'High Priest', 'General', 'Admiral', 'Duke', 'Count', 'Baron'], this.random.nextInt(0, 2)),
        epithet: this.random.next() > 0.5 ? `the ${this.random.pick(WORD_BANKS.adjectives)}` : undefined,
        roles: this.random.pickMultiple(Object.values(FigureRole), this.random.nextInt(1, 3)),
        lifespan: {
          start: { year: birthYear },
          end: { year: deathYear }
        },
        civilization: civActive && civ ? civ.id : undefined,
        majorDeeds: this.random.pickMultiple(WORD_BANKS.deeds, this.random.nextInt(1, 3)),
        legacy: `Remembered for their ${this.random.pick(['wisdom', 'cruelty', 'bravery', 'cunning', 'achievements', 'failures'])}`,
        historicalAccuracy: this.random.pick(['historical', 'semi-legendary', 'legendary']),
        remembered_as: this.random.pick(['hero', 'villain', 'neutral', 'controversial']),
        description: `A notable figure of their time.`
      });
    }
  }

  private generateFigureName(): string {
    const firstNames = ['Aldric', 'Brynn', 'Caspian', 'Daria', 'Erwin', 'Freya', 'Gideon', 'Helena', 'Ivar', 'Jasper',
                        'Kira', 'Leif', 'Mira', 'Nolan', 'Ophelia', 'Percival', 'Quinn', 'Roland', 'Selene', 'Theron',
                        'Una', 'Victor', 'Wren', 'Xander', 'Yara', 'Zephyr'];
    const lastNames = ['Blackwood', 'Stoneheart', 'Ironforge', 'Silverwind', 'Nightshade', 'Brightblade', 'Stormborn',
                       'Shadowmere', 'Goldcrest', 'Ravenclaw', 'Thornwood', 'Winterfall', 'Sunfire', 'Duskwalker'];

    return `${this.random.pick(firstNames)} ${this.random.pick(lastNames)}`;
  }

  private generateConflicts(timelineId: string, civilizations: Civilization[], startYear: number, endYear: number): void {
    if (civilizations.length < 2) return;

    const conflictCount = Math.floor(civilizations.length * 1.5);

    for (let i = 0; i < conflictCount; i++) {
      const year = this.random.nextInt(startYear, endYear - 10);
      const duration = this.random.nextInt(1, 30);

      // Pick two active civilizations
      const activeCivs = civilizations.filter(c =>
        year >= c.existence.start.year && (!c.existence.end || year <= c.existence.end.year)
      );

      if (activeCivs.length < 2) continue;

      const [side1, side2] = this.random.pickMultiple(activeCivs, 2);

      this.addConflict(timelineId, {
        name: `${this.random.pick(WORD_BANKS.adjectives)} War`,
        type: this.random.pick(Object.values(ConflictType)),
        dateRange: {
          start: { year },
          end: { year: year + duration }
        },
        scale: this.random.pick([EventScale.REGIONAL, EventScale.NATIONAL, EventScale.CONTINENTAL]),
        sides: [
          {
            name: side1.name,
            members: [side1.id],
            goals: ['Expansion', 'Defense', 'Resources']
          },
          {
            name: side2.name,
            members: [side2.id],
            goals: ['Expansion', 'Defense', 'Resources']
          }
        ],
        outcome: this.random.pick(['decisive_victory', 'pyrrhic_victory', 'stalemate', 'inconclusive']),
        victor: this.random.next() > 0.3 ? this.random.pick([side1.name, side2.name]) : undefined,
        consequences: ['Territorial changes', 'Economic impact', 'Cultural exchange'],
        description: `A major conflict between ${side1.name} and ${side2.name}.`
      });
    }
  }

  private generateCausalLinks(timelineId: string): void {
    const timeline = this.timelines.get(timelineId);
    if (!timeline || timeline.events.length < 2) return;

    // Sort events by date
    const sortedEvents = [...timeline.events].sort((a, b) =>
      a.dateRange.start.year - b.dateRange.start.year
    );

    // Create some causal links between sequential events
    for (let i = 1; i < sortedEvents.length; i++) {
      if (this.random.next() > 0.7) continue; // Only link ~30% of events

      const prev = sortedEvents[i - 1];
      const curr = sortedEvents[i];

      // Only link events that are relatively close in time
      if (curr.dateRange.start.year - prev.dateRange.start.year > 50) continue;

      this.linkEvents(
        timelineId,
        prev.id,
        curr.id,
        RelationshipType.LED_TO,
        'Sequential historical development'
      );
    }
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  getEventsInRange(timelineId: string, startYear: number, endYear: number): HistoricalEvent[] {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return [];

    return timeline.events.filter(e =>
      e.dateRange.start.year >= startYear &&
      e.dateRange.start.year <= endYear
    );
  }

  getEraAtYear(timelineId: string, year: number): HistoricalEra | undefined {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return undefined;

    return timeline.eras.find(e =>
      year >= e.dateRange.start.year &&
      (!e.dateRange.end || year <= e.dateRange.end.year)
    );
  }

  getActiveCivilizations(timelineId: string, year: number): Civilization[] {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return [];

    return timeline.civilizations.filter(c =>
      year >= c.existence.start.year &&
      (!c.existence.end || year <= c.existence.end.year)
    );
  }

  getLivingFigures(timelineId: string, year: number): HistoricalFigure[] {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return [];

    return timeline.figures.filter(f =>
      year >= f.lifespan.start.year &&
      (!f.lifespan.end || year <= f.lifespan.end.year)
    );
  }

  getEventCauses(timelineId: string, eventId: string, depth: number = 3): HistoricalEvent[] {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return [];

    const event = timeline.events.find(e => e.id === eventId);
    if (!event) return [];

    const causes: HistoricalEvent[] = [];
    const visited = new Set<string>();

    const findCauses = (evt: HistoricalEvent, currentDepth: number) => {
      if (currentDepth <= 0 || visited.has(evt.id)) return;
      visited.add(evt.id);

      for (const cause of evt.causes) {
        const causeEvent = timeline.events.find(e => e.id === cause.eventId);
        if (causeEvent && !visited.has(causeEvent.id)) {
          causes.push(causeEvent);
          findCauses(causeEvent, currentDepth - 1);
        }
      }
    };

    findCauses(event, depth);
    return causes;
  }

  getEventConsequences(timelineId: string, eventId: string, depth: number = 3): HistoricalEvent[] {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return [];

    const event = timeline.events.find(e => e.id === eventId);
    if (!event) return [];

    const consequences: HistoricalEvent[] = [];
    const visited = new Set<string>();

    const findConsequences = (evt: HistoricalEvent, currentDepth: number) => {
      if (currentDepth <= 0 || visited.has(evt.id)) return;
      visited.add(evt.id);

      for (const consequence of evt.consequences) {
        const consequenceEvent = timeline.events.find(e => e.id === consequence.eventId);
        if (consequenceEvent && !visited.has(consequenceEvent.id)) {
          consequences.push(consequenceEvent);
          findConsequences(consequenceEvent, currentDepth - 1);
        }
      }
    };

    findConsequences(event, depth);
    return consequences;
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getTimelineStats(timelineId: string): Record<string, any> | undefined {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return undefined;

    const eventsByType: Record<string, number> = {};
    for (const event of timeline.events) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    }

    const eventsByImpact: Record<string, number> = {};
    for (const event of timeline.events) {
      eventsByImpact[event.impact] = (eventsByImpact[event.impact] || 0) + 1;
    }

    const figuresByRole: Record<string, number> = {};
    for (const figure of timeline.figures) {
      for (const role of figure.roles) {
        figuresByRole[role] = (figuresByRole[role] || 0) + 1;
      }
    }

    const civsByStatus: Record<string, number> = {};
    for (const civ of timeline.civilizations) {
      civsByStatus[civ.status] = (civsByStatus[civ.status] || 0) + 1;
    }

    return {
      name: timeline.name,
      timeSpan: timeline.currentYear - timeline.startYear,
      eraCount: timeline.eras.length,
      eventCount: timeline.events.length,
      figureCount: timeline.figures.length,
      civilizationCount: timeline.civilizations.length,
      conflictCount: timeline.conflicts.length,
      eventsByType,
      eventsByImpact,
      figuresByRole,
      civilizationsByStatus: civsByStatus
    };
  }

  // ==========================================================================
  // EXPORT / IMPORT
  // ==========================================================================

  exportTimeline(timelineId: string): string {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return '';
    return JSON.stringify(timeline, null, 2);
  }

  exportAllTimelines(): string {
    return JSON.stringify(Array.from(this.timelines.values()), null, 2);
  }

  importTimeline(json: string): Timeline | undefined {
    try {
      const data = JSON.parse(json);
      data.id = uuidv4();
      data.dateCreated = new Date();
      data.lastModified = new Date();
      this.timelines.set(data.id, data);
      return data;
    } catch {
      return undefined;
    }
  }

  // ==========================================================================
  // MARKDOWN GENERATION
  // ==========================================================================

  generateMarkdown(timelineId: string): string {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return '';

    let md = `# ${timeline.name}\n\n`;

    if (timeline.description) {
      md += `${timeline.description}\n\n`;
    }

    md += `**Time Span:** ${timeline.startYear} to ${timeline.currentYear} (${timeline.currentYear - timeline.startYear} years)\n\n`;

    // Eras
    if (timeline.eras.length > 0) {
      md += `## Eras\n\n`;
      for (const era of timeline.eras) {
        const endYear = era.dateRange.end?.year || 'present';
        md += `### ${era.name} (${era.dateRange.start.year} - ${endYear})\n\n`;
        md += `${era.description}\n\n`;
        md += `**Type:** ${era.type} | **Tech Level:** ${era.technologicalLevel}\n\n`;
        if (era.characteristics.length > 0) {
          md += `**Characteristics:** ${era.characteristics.join(', ')}\n\n`;
        }
      }
    }

    // Civilizations
    if (timeline.civilizations.length > 0) {
      md += `## Civilizations\n\n`;
      for (const civ of timeline.civilizations) {
        const endYear = civ.existence.end?.year || 'present';
        md += `### ${civ.name}\n\n`;
        md += `**Existence:** ${civ.existence.start.year} - ${endYear} | **Status:** ${civ.status}\n\n`;
        md += `${civ.description}\n\n`;
        if (civ.achievements.length > 0) {
          md += `**Achievements:** ${civ.achievements.join(', ')}\n\n`;
        }
      }
    }

    // Major Events (top 20)
    if (timeline.events.length > 0) {
      md += `## Major Events\n\n`;
      const majorEvents = timeline.events
        .filter(e => e.impact === EventImpact.MAJOR || e.impact === EventImpact.CATASTROPHIC || e.impact === EventImpact.WORLD_ALTERING)
        .slice(0, 20);

      md += `| Year | Event | Type | Impact |\n`;
      md += `|------|-------|------|--------|\n`;
      for (const event of majorEvents) {
        md += `| ${event.dateRange.start.year} | ${event.name} | ${event.type} | ${event.impact} |\n`;
      }
      md += `\n*Total events: ${timeline.events.length}*\n\n`;
    }

    // Notable Figures (top 10)
    if (timeline.figures.length > 0) {
      md += `## Notable Figures\n\n`;
      const notableFigures = timeline.figures.slice(0, 10);

      for (const figure of notableFigures) {
        const title = figure.epithet ? `${figure.name} ${figure.epithet}` : figure.name;
        const endYear = figure.lifespan.end?.year || 'present';
        md += `### ${title}\n\n`;
        md += `**Lived:** ${figure.lifespan.start.year} - ${endYear}\n\n`;
        md += `**Roles:** ${figure.roles.join(', ')}\n\n`;
        md += `${figure.description}\n\n`;
      }
      md += `*Total figures: ${timeline.figures.length}*\n\n`;
    }

    // Conflicts
    if (timeline.conflicts.length > 0) {
      md += `## Major Conflicts\n\n`;
      for (const conflict of timeline.conflicts.slice(0, 10)) {
        const endYear = conflict.dateRange.end?.year || 'ongoing';
        md += `### ${conflict.name} (${conflict.dateRange.start.year} - ${endYear})\n\n`;
        md += `**Type:** ${conflict.type} | **Scale:** ${conflict.scale} | **Outcome:** ${conflict.outcome}\n\n`;
        md += `${conflict.description}\n\n`;
      }
    }

    if (timeline.notes) {
      md += `## Notes\n\n${timeline.notes}\n`;
    }

    return md;
  }

  generateTimelineVisualization(timelineId: string, startYear?: number, endYear?: number): string {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return '';

    const start = startYear ?? timeline.startYear;
    const end = endYear ?? timeline.currentYear;

    let vis = `# ${timeline.name} - Timeline Visualization\n\n`;
    vis += `\`\`\`\n`;

    // Create ASCII timeline
    const width = 80;
    const timeSpan = end - start;
    const scale = width / timeSpan;

    // Header
    vis += `Year: ${start}${' '.repeat(width - 20)}${end}\n`;
    vis += `${'═'.repeat(width)}\n`;

    // Eras
    for (const era of timeline.eras) {
      const eraStart = Math.max(era.dateRange.start.year, start);
      const eraEnd = Math.min(era.dateRange.end?.year || end, end);

      if (eraEnd < start || eraStart > end) continue;

      const startPos = Math.floor((eraStart - start) * scale);
      const endPos = Math.floor((eraEnd - start) * scale);
      const width = Math.max(1, endPos - startPos);

      const line = ' '.repeat(startPos) + '█'.repeat(width);
      vis += `${line} ${era.name}\n`;
    }

    vis += `${'─'.repeat(width)}\n`;

    // Major events as markers
    const majorEvents = timeline.events
      .filter(e => e.impact !== EventImpact.MINOR && e.dateRange.start.year >= start && e.dateRange.start.year <= end)
      .slice(0, 20);

    let eventLine = ' '.repeat(width);
    for (const event of majorEvents) {
      const pos = Math.floor((event.dateRange.start.year - start) * scale);
      if (pos >= 0 && pos < width) {
        eventLine = eventLine.substring(0, pos) + '▼' + eventLine.substring(pos + 1);
      }
    }
    vis += `${eventLine}\n`;

    vis += `\`\`\`\n\n`;

    // Event legend
    vis += `### Events\n\n`;
    for (const event of majorEvents) {
      vis += `- ${event.dateRange.start.year}: ${event.name}\n`;
    }

    return vis;
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export const historyGenerator = new HistoryGenerator();
