/**
 * Tenchi Muyo! Comprehensive Map Data
 *
 * Compiled from research across all media:
 * - OVA Series (Ryo-Ohki) 1-5
 * - Tenchi Universe (TV)
 * - Tenchi in Tokyo
 * - Tenchi Muyo! GXP
 * - Tenchi Muyo! War on Geminar
 * - True Tenchi Muyo! Light Novels
 * - Guardians of Order RPG Books
 * - DVD Encyclopedia Materials
 *
 * Sources:
 * - Tenchi Muyo Wiki (tenchi.fandom.com)
 * - AstroNerdBoy's Tenchi FAQ
 * - Casa de Hakubi blueprints archive
 * - Guardians of Order Tenchi Muyo RPG
 * - True Tenchi Muyo! novels
 */

import {MapVisualizer} from '../engines/maps';
import type {WorldMap} from '../engines/maps';

// ============================================================================
// GALAXY-SCALE DATA
// ============================================================================

export interface GalacticEntity {
  name: string;
  type: 'planet' | 'station' | 'empire' | 'federation';
  affiliation?: string;
  description: string;
  population?: string;
  features?: string[];
  coordinates?: {x: number; y: number}; // Relative galaxy position
}

export const GALACTIC_ENTITIES: GalacticEntity[] = [
  // ========== JURAI EMPIRE ==========
  {
    name: 'Jurai',
    type: 'planet',
    affiliation: 'Jurai Empire',
    description: 'Home planet of the Jurai Empire. The largest galactic empire by territory, located near the galaxy edge. Houses the Royal Palace within the giant tree Tenju.',
    features: [
      'Tenju - Giant tree housing Royal Palace',
      'Royal Arboretum - Where Royal Trees grow',
      'Tsunami-no-ki - The original Royal Tree',
      'Imperial Palace Complex',
      'Four Noble Houses territories'
    ],
    coordinates: {x: 85, y: 50}
  },
  {
    name: 'Kanamitsu',
    type: 'planet',
    affiliation: 'Jurai Empire',
    description: 'Agricultural planet with fertile lands and fishing resources. Susceptible to pirate raids despite Juraian Royal Ship protection.',
    features: ['Farmlands', 'Fishing ports', 'Juraian defense fleet'],
    coordinates: {x: 80, y: 45}
  },
  {
    name: 'Imuim',
    type: 'planet',
    affiliation: 'Jurai Empire',
    description: 'Jurai Resource Planet No. 17. Mostly aquatic with giant tree-islands that convert salt water to fresh water. Popular vacation destination.',
    features: ['Giant tree-islands', 'Water purification trees', 'Resort facilities'],
    coordinates: {x: 82, y: 55}
  },

  // ========== SENIWA EMPIRE ==========
  {
    name: 'Seniwa',
    type: 'planet',
    affiliation: 'Seniwa Empire',
    description: 'Home planet of the Seniwa Empire, containing 943 planets total. Extreme winters. Home of the Kuramitsu Family and their nature sanctuary.',
    population: '943 planets in empire',
    features: [
      'Kuramitsu Family estate',
      'Nature sanctuary',
      'Galaxy Police Academy (primary campus)',
      'Extreme winter climate'
    ],
    coordinates: {x: 50, y: 50}
  },

  // ========== GALAXY FEDERATION ==========
  {
    name: 'Airai',
    type: 'planet',
    affiliation: 'Galaxy Federation',
    description: 'Origin planet of Airi Masaki. Former galactic power and theocracy that experienced societal collapse.',
    features: ['Former theocratic government', 'Historical ruins'],
    coordinates: {x: 60, y: 40}
  },
  {
    name: 'Melmas',
    type: 'planet',
    affiliation: 'Galaxy Federation',
    description: 'Ruled by a High Priestess with powerful psychic abilities. Controlled by a high council with theocratic government.',
    features: ['Psychic ruling class', 'High council chambers', 'Temple complexes'],
    coordinates: {x: 55, y: 60}
  },

  // ========== RENZA FEDERATION ==========
  {
    name: 'Barrium',
    type: 'planet',
    affiliation: 'Renza Federation',
    description: 'Frontier planet of magical species where science cannot function due to magic-producing plants.',
    features: ['Magic-producing flora', 'Magical species inhabitants', 'Anti-technology zones'],
    coordinates: {x: 30, y: 70}
  },
  {
    name: 'Terra',
    type: 'planet',
    affiliation: 'Renza Federation',
    description: 'Sacred planet containing 30,000-year-old advanced technology from the Great Prehistoric Civilization.',
    features: ['Ancient technology sites', 'Prehistoric civilization ruins', 'Sacred zones'],
    coordinates: {x: 35, y: 65}
  },

  // ========== PIRATE TERRITORIES ==========
  {
    name: 'Earth',
    type: 'planet',
    affiliation: 'Pirate Nation (technical leader) / Jurai Protected',
    description: 'Developing world without interstellar travel. Protected by Jurai. Won proxy war representation, now technically leads the Pirate Nation.',
    features: [
      'Masaki Village (Okayama, Japan)',
      'Masaki Shrine',
      'Galaxy Police monitoring station (covert)'
    ],
    coordinates: {x: 75, y: 35}
  },

  // ========== STATIONS ==========
  {
    name: 'Galaxy Police Headquarters',
    type: 'station',
    affiliation: 'Galaxy Federation',
    description: 'Main headquarters of the Galaxy Police. Grand Marshall Minami (Mihoshi\'s grandfather) commands from here.',
    features: ['Command center', 'Fleet docking', 'Detention facilities', 'Training areas'],
    coordinates: {x: 52, y: 52}
  },
  {
    name: 'Galaxy Police Academy',
    type: 'station',
    affiliation: 'Galaxy Federation',
    description: 'Primary training facility for Galaxy Police cadets. Chairwoman: Airi Masaki. Headmistress: Mikami Kuramitsu.',
    features: [
      'Training facilities',
      'Simulation chambers',
      'Dormitories',
      'Restaurants (where Airi practices cooking)',
      'Administrative offices'
    ],
    coordinates: {x: 51, y: 48}
  },
  {
    name: 'Jurai Royal Academy',
    type: 'station',
    affiliation: 'Jurai Empire',
    description: 'Elite academy for Juraian nobility and promising students from across the empire.',
    features: ['Academic facilities', 'Royal training grounds', 'Tree cultivation labs'],
    coordinates: {x: 83, y: 48}
  },

  // ========== ALTERNATE DIMENSIONS ==========
  {
    name: 'Geminar',
    type: 'planet',
    affiliation: 'Alternate Dimension',
    description: 'Planet in another dimension. Evolved from "Sandy Planet" to habitable world over 10,000 years. Features Sacred Mechanoid technology.',
    features: [
      'Sacred Mechanoids (giant robots)',
      'Church of the Holy Land',
      'Multiple kingdoms',
      'Seikijin piloting schools'
    ],
    coordinates: {x: 95, y: 95} // Separate dimension
  }
];

// ============================================================================
// MASAKI ESTATE - DETAILED LAYOUT
// ============================================================================

export interface MasakiEstateLocation {
  id: string;
  name: string;
  type: 'building' | 'landmark' | 'area' | 'room';
  parent?: string; // Parent location ID
  description: string;
  coordinates: {x: number; y: number};
  features?: string[];
  occupants?: string[];
}

export const MASAKI_ESTATE_LOCATIONS: MasakiEstateLocation[] = [
  // ========== MAIN AREAS ==========
  {
    id: 'estate',
    name: 'Masaki Estate',
    type: 'area',
    description: 'Large nature preserve owned by the Masaki family in rural Okayama, Japan.',
    coordinates: {x: 50, y: 50},
    features: ['Nature preserve', 'Private lake', 'Agricultural fields', 'Mountain trails']
  },

  // ========== MASAKI HOUSE ==========
  {
    id: 'house',
    name: 'Masaki House',
    type: 'building',
    parent: 'estate',
    description: 'Main residence designed by Nobuyuki Masaki. Traditional Japanese architecture with modern amenities.',
    coordinates: {x: 50, y: 55},
    features: ['2-3 stories', 'Engawa (veranda)', 'Lake view', 'Subspace portal to Washu\'s lab'],
    occupants: ['Tenchi', 'Nobuyuki', 'Ryoko', 'Ayeka', 'Sasami', 'Mihoshi', 'Washu', 'Ryo-Ohki']
  },

  // FIRST FLOOR
  {
    id: 'house-1f-living',
    name: 'Main Living Room',
    type: 'room',
    parent: 'house',
    description: 'Large tatami room where the household gathers. Site of many arguments between Ryoko and Ayeka.',
    coordinates: {x: 48, y: 54},
    features: ['Tatami flooring', 'Kotatsu table', 'TV', 'Lake view windows']
  },
  {
    id: 'house-1f-kitchen',
    name: 'Kitchen',
    type: 'room',
    parent: 'house',
    description: 'Where Sasami prepares meals for the household. Well-equipped for feeding many people.',
    coordinates: {x: 52, y: 54},
    occupants: ['Sasami (primary cook)']
  },
  {
    id: 'house-1f-dining',
    name: 'Dining Area',
    type: 'room',
    parent: 'house',
    description: 'Connected to kitchen. Large table for family meals.',
    coordinates: {x: 50, y: 53}
  },
  {
    id: 'house-1f-bath',
    name: 'Bath Area',
    type: 'room',
    parent: 'house',
    description: 'Traditional Japanese bath. In Tenchi Universe, Washu added dimensional doorway for privacy.',
    coordinates: {x: 46, y: 54}
  },
  {
    id: 'house-1f-entry',
    name: 'Entry Hall (Genkan)',
    type: 'room',
    parent: 'house',
    description: 'Traditional entry area with shoe removal space.',
    coordinates: {x: 50, y: 56}
  },
  {
    id: 'house-1f-closet',
    name: 'Broom Closet (Portal)',
    type: 'room',
    parent: 'house',
    description: 'Under-stairs closet that serves as portal to Washu\'s 5-planet subspace laboratory.',
    coordinates: {x: 47, y: 55},
    features: ['Dimensional portal', 'Leads to Washu\'s Lab']
  },
  {
    id: 'house-1f-engawa',
    name: 'Engawa (Veranda)',
    type: 'room',
    parent: 'house',
    description: 'Traditional wooden veranda overlooking the lake and garden.',
    coordinates: {x: 50, y: 58},
    features: ['Lake view', 'Garden access']
  },

  // SECOND FLOOR
  {
    id: 'house-2f-tenchi',
    name: "Tenchi's Room",
    type: 'room',
    parent: 'house',
    description: 'Tenchi Masaki\'s bedroom. Frequently invaded by Ryoko phasing through walls.',
    coordinates: {x: 46, y: 54},
    occupants: ['Tenchi Masaki']
  },
  {
    id: 'house-2f-ryoko',
    name: "Ryoko's Room",
    type: 'room',
    parent: 'house',
    description: 'Space given to Ryoko after she moved in. She often prefers Tenchi\'s room.',
    coordinates: {x: 48, y: 52},
    occupants: ['Ryoko Hakubi']
  },
  {
    id: 'house-2f-ayeka',
    name: "Ayeka's Room",
    type: 'room',
    parent: 'house',
    description: 'Princess Ayeka\'s quarters. Decorated with Juraian sensibilities.',
    coordinates: {x: 50, y: 52},
    occupants: ['Ayeka Masaki Jurai']
  },
  {
    id: 'house-2f-sasami',
    name: "Sasami's Room",
    type: 'room',
    parent: 'house',
    description: 'Princess Sasami\'s room. Often shares with Ryo-Ohki in cabbit form.',
    coordinates: {x: 52, y: 52},
    occupants: ['Sasami Masaki Jurai', 'Ryo-Ohki']
  },
  {
    id: 'house-2f-mihoshi',
    name: "Mihoshi's Room",
    type: 'room',
    parent: 'house',
    description: 'GP Detective Mihoshi\'s room. In some continuities shared with Kiyone.',
    coordinates: {x: 54, y: 52},
    occupants: ['Mihoshi Kuramitsu', 'Kiyone Makibi (some continuities)']
  },
  {
    id: 'house-2f-katsuhito',
    name: "Katsuhito's Room",
    type: 'room',
    parent: 'house',
    description: 'Reserved room for Katsuhito (Yosho) when he stays at the main house.',
    coordinates: {x: 56, y: 54},
    occupants: ['Katsuhito Masaki (occasional)']
  },

  // ========== MASAKI SHRINE ==========
  {
    id: 'shrine',
    name: 'Masaki Shrine',
    type: 'building',
    parent: 'estate',
    description: 'Shinto shrine halfway up the hill. Katsuhito (Yosho) serves as priest. Modeled after Tarojinja Shrine.',
    coordinates: {x: 55, y: 35},
    features: ['320 stone steps', 'Main worship hall (Haiden)', 'Torii gates'],
    occupants: ['Katsuhito Masaki (priest)']
  },
  {
    id: 'shrine-steps',
    name: 'Stone Steps (320)',
    type: 'landmark',
    parent: 'shrine',
    description: 'The 320 stone steps leading up to the shrine. Tenchi sweeps these daily as training.',
    coordinates: {x: 52, y: 42}
  },
  {
    id: 'shrine-torii-main',
    name: 'Main Torii Gate',
    type: 'landmark',
    parent: 'shrine',
    description: 'Main entrance torii at the base of the steps.',
    coordinates: {x: 52, y: 48}
  },
  {
    id: 'shrine-torii-upper',
    name: 'Upper Torii Gate',
    type: 'landmark',
    parent: 'shrine',
    description: 'Secondary torii near the shrine buildings.',
    coordinates: {x: 55, y: 36}
  },
  {
    id: 'shrine-haiden',
    name: 'Worship Hall (Haiden)',
    type: 'building',
    parent: 'shrine',
    description: 'Main hall for worship and ceremonies.',
    coordinates: {x: 55, y: 34}
  },

  // ========== RYOKO'S CAVE ==========
  {
    id: 'cave',
    name: "Ryoko's Cave",
    type: 'landmark',
    parent: 'estate',
    description: 'Sealed cave where Yosho imprisoned Ryoko for 700 years. Contains the entrance seal with shimenawa.',
    coordinates: {x: 58, y: 30},
    features: [
      'Shimenawa seal rope',
      'Suspended ceiling rock',
      'Originally held Tenchi-ken and 3 gems',
      'Collapsed in some areas (real-world inspiration)'
    ]
  },

  // ========== FUNAHO-KI (SACRED TREE) ==========
  {
    id: 'funaho-tree',
    name: 'Funaho-ki (Sacred Tree)',
    type: 'landmark',
    parent: 'estate',
    description: 'The rooted core of Yosho\'s 1st-generation Royal Tree-ship. Took root 700 years ago and cannot be moved.',
    coordinates: {x: 60, y: 28},
    features: [
      'Sentient - can communicate with sensitive individuals',
      'Surrounded by sacred pool',
      'Provides Yosho\'s immortality within range',
      'Named after Empress Funaho (Yosho\'s mother)'
    ]
  },
  {
    id: 'funaho-pool',
    name: 'Sacred Pool',
    type: 'landmark',
    parent: 'estate',
    description: 'Pool of water surrounding Funaho-ki. Seina crashed into this pool and heard Funaho speak.',
    coordinates: {x: 60, y: 29}
  },

  // ========== OTHER ESTATE FEATURES ==========
  {
    id: 'lake',
    name: 'Lake',
    type: 'landmark',
    parent: 'estate',
    description: 'Lake adjacent to the Masaki House. Provides scenic views from the engawa.',
    coordinates: {x: 48, y: 60}
  },
  {
    id: 'carrot-fields',
    name: 'Carrot Fields',
    type: 'area',
    parent: 'estate',
    description: 'Agricultural fields where carrots are grown. Ryo-Ohki\'s favorite place.',
    coordinates: {x: 42, y: 58},
    occupants: ['Ryo-Ohki (frequent visitor)']
  },
  {
    id: 'floating-onsen',
    name: 'Floating Onsen',
    type: 'building',
    parent: 'estate',
    description: 'Luxury hot spring created by Ryoko using Washu\'s designs. Hovers above the house, concealed by GP visual distortion field.',
    coordinates: {x: 50, y: 52},
    features: [
      'Waterfalls',
      'Section marked "Tenchi Only"',
      'Invisible to normal observers',
      'GP distortion field concealment'
    ]
  },
  {
    id: 'nature-preserve',
    name: 'Nature Preserve',
    type: 'area',
    parent: 'estate',
    description: 'Forested areas and mountain trails comprising most of the Masaki Estate.',
    coordinates: {x: 35, y: 45}
  }
];

// ============================================================================
// WASHU'S LABORATORY - 5 PLANETS
// ============================================================================

export interface WashuLabZone {
  id: string;
  name: string;
  planet: number; // 1-5
  description: string;
  features: string[];
  coordinates: {x: number; y: number}; // Within lab space
}

export const WASHU_LAB_ZONES: WashuLabZone[] = [
  // PLANET 1 - Main Lab
  {
    id: 'lab-main',
    name: 'Main Laboratory',
    planet: 1,
    description: 'Primary workspace with holographic interfaces and experiment stations.',
    features: [
      'Holographic computer terminals',
      'Experiment tables',
      'Portal entrance from Masaki House',
      'Washu\'s floating cushion workstation'
    ],
    coordinates: {x: 50, y: 50}
  },
  {
    id: 'lab-detention',
    name: 'Detention/Study Area',
    planet: 1,
    description: 'Where Washu keeps subjects for study. Kagato was once held here.',
    features: ['Containment fields', 'Observation equipment', 'Data collection systems'],
    coordinates: {x: 60, y: 50}
  },
  {
    id: 'lab-creation',
    name: 'Creation Chamber',
    planet: 1,
    description: 'Where Washu created Ryoko, Ryo-Ohki, and other artificial beings.',
    features: ['Genesis pods', 'Genetic manipulation equipment', 'Masu containment'],
    coordinates: {x: 40, y: 50}
  },

  // PLANET 2 - Storage & Archives
  {
    id: 'lab-archives',
    name: 'Universal Archives',
    planet: 2,
    description: '20,000+ years of scientific data and collected artifacts.',
    features: ['Data crystals', 'Artifact storage', 'Historical records'],
    coordinates: {x: 50, y: 30}
  },
  {
    id: 'lab-armory',
    name: 'Weapons Storage',
    planet: 2,
    description: 'Collection of weapons and defensive systems Washu has created or collected.',
    features: ['Energy weapons', 'Defensive devices', 'Experimental prototypes'],
    coordinates: {x: 60, y: 30}
  },

  // PLANET 3 - Living Quarters
  {
    id: 'lab-quarters',
    name: "Washu's Living Quarters",
    planet: 3,
    description: 'Personal living space with surprisingly cozy accommodations.',
    features: ['Bedroom', 'Kitchen', 'Bath', 'Relaxation area'],
    coordinates: {x: 50, y: 70}
  },
  {
    id: 'lab-nursery',
    name: 'Bioform Nursery',
    planet: 3,
    description: 'Where biological creations are nurtured and monitored.',
    features: ['Growth chambers', 'Monitoring systems', 'Care facilities'],
    coordinates: {x: 40, y: 70}
  },

  // PLANET 4 - Heavy Industry
  {
    id: 'lab-shipyard',
    name: 'Ship Construction Facility',
    planet: 4,
    description: 'Where Washu builds and repairs spacecraft.',
    features: ['Construction bays', 'Material synthesizers', 'Testing ranges'],
    coordinates: {x: 30, y: 50}
  },
  {
    id: 'lab-forge',
    name: 'Matter Forge',
    planet: 4,
    description: 'Industrial matter creation and manipulation facility.',
    features: ['Molecular assemblers', 'Energy converters', 'Raw material storage'],
    coordinates: {x: 20, y: 50}
  },

  // PLANET 5 - Dangerous Experiments
  {
    id: 'lab-hazard',
    name: 'Hazardous Experiments Zone',
    planet: 5,
    description: 'Isolated area for dangerous experiments. Multiple containment layers.',
    features: ['Dimensional barriers', 'Emergency protocols', 'Remote operation systems'],
    coordinates: {x: 70, y: 50}
  },
  {
    id: 'lab-dimensional',
    name: 'Dimensional Research',
    planet: 5,
    description: 'Research into parallel dimensions and Chousin-level phenomena.',
    features: ['Dimensional gates', 'Reality monitors', 'Chousin artifacts'],
    coordinates: {x: 80, y: 50}
  }
];

// ============================================================================
// JURAI ROYAL PALACE (WITHIN TENJU)
// ============================================================================

export interface JuraiPalaceLocation {
  id: string;
  name: string;
  level: 'root' | 'trunk' | 'crown' | 'branch';
  description: string;
  features: string[];
  coordinates: {x: number; y: number};
}

export const JURAI_PALACE_LOCATIONS: JuraiPalaceLocation[] = [
  // ROOT LEVEL - Foundation
  {
    id: 'jurai-roots',
    name: 'Root Chambers',
    level: 'root',
    description: 'Ancient chambers at the base of Tenju. Contains oldest Royal Tree connections.',
    features: ['Tsunami-no-ki interface', 'Ancient archives', 'Foundation systems'],
    coordinates: {x: 50, y: 80}
  },

  // TRUNK LEVEL - Main Palace
  {
    id: 'jurai-throne',
    name: 'Imperial Throne Room',
    level: 'trunk',
    description: 'Where Emperor Azusa holds court. Central to Juraian governance.',
    features: ['Imperial throne', 'Audience galleries', 'Ceremonial space'],
    coordinates: {x: 50, y: 50}
  },
  {
    id: 'jurai-council',
    name: 'Council of Lords Chamber',
    level: 'trunk',
    description: 'Where the four noble houses convene for governance.',
    features: ['Four house seats', 'Voting mechanisms', 'Record keeping'],
    coordinates: {x: 40, y: 50}
  },
  {
    id: 'jurai-royal-quarters',
    name: 'Royal Family Quarters',
    level: 'trunk',
    description: 'Living quarters for the Emperor, Empresses, and Princes/Princesses.',
    features: ['Private chambers', 'Gardens', 'Security systems'],
    coordinates: {x: 60, y: 50}
  },

  // CROWN LEVEL - Sacred Areas
  {
    id: 'jurai-arboretum',
    name: 'Royal Arboretum',
    level: 'crown',
    description: 'Where Royal Trees are grown and bonded with their partners.',
    features: ['Tree nurseries', 'Bonding chambers', 'Selection rituals area'],
    coordinates: {x: 50, y: 20}
  },
  {
    id: 'jurai-tsunami-chamber',
    name: 'Tsunami-no-ki Sanctum',
    level: 'crown',
    description: 'Sacred chamber housing the original Royal Tree, interface for Tsunami\'s Chousin powers.',
    features: ['Tsunami-no-ki', 'Prayer area', 'Divine connection point'],
    coordinates: {x: 50, y: 10}
  },

  // BRANCH LEVELS - Specialized Areas
  {
    id: 'jurai-academy',
    name: 'Royal Academy Branch',
    level: 'branch',
    description: 'Educational facilities for Juraian nobility.',
    features: ['Classrooms', 'Training areas', 'Library'],
    coordinates: {x: 30, y: 35}
  },
  {
    id: 'jurai-shipyard',
    name: 'Tree-Ship Construction',
    level: 'branch',
    description: 'Where Royal Tree-ships are designed and bonded with their trees.',
    features: ['Design studios', 'Construction facilities', 'Launch bays'],
    coordinates: {x: 70, y: 35}
  },
  {
    id: 'jurai-defense',
    name: 'Defense Command',
    level: 'branch',
    description: 'Military command center for Juraian defense forces.',
    features: ['Command center', 'Fleet coordination', 'Sensor arrays'],
    coordinates: {x: 70, y: 65}
  }
];

// ============================================================================
// JURAIAN TREE-SHIPS
// ============================================================================

export interface TreeShip {
  name: string;
  generation: 1 | 2 | 3;
  owner: string;
  treeName: string;
  description: string;
  features: string[];
  interiorSize: string; // Subspace size
}

export const JURAIAN_SHIPS: TreeShip[] = [
  {
    name: 'Funaho',
    generation: 1,
    owner: 'Yosho Masaki Jurai',
    treeName: 'Funaho-ki',
    description: 'First-generation Royal Tree-ship. Crashed on Earth 700 years ago, tree took root.',
    features: ['Light Hawk Wings capable', 'Rooted on Earth', 'Cannot fly'],
    interiorSize: 'Unknown (no longer functional as ship)'
  },
  {
    name: 'Tsunami-fune',
    generation: 1, // Special - treated as first-gen for typing purposes
    owner: 'Sasami / Tsunami',
    treeName: 'Tsunami-no-ki',
    description: 'The ultimate tree-ship, manifestation of Tsunami herself. Can merge with Sasami.',
    features: ['10 Light Hawk Wings', 'Chousin-level power', 'Dimensional travel'],
    interiorSize: 'Contains entire pocket universe'
  },
  {
    name: 'Ryu-Oh',
    generation: 2,
    owner: 'Ayeka Masaki Jurai',
    treeName: 'Ryu-Oh-ki',
    description: 'Second-generation ship capable of fighting Ryo-Ohki. Destroyed in OVA 1, rebuilt.',
    features: ['4 Light Hawk Wings', 'Regeneration capable', 'Guardian systems'],
    interiorSize: 'Several star systems'
  },
  {
    name: 'Mikagami',
    generation: 3,
    owner: 'Misaki Masaki Jurai',
    treeName: 'Mikagami-ki',
    description: 'Third-generation ship of Empress Misaki.',
    features: ['3 Light Hawk Wings', 'Diplomatic vessel'],
    interiorSize: 'Multiple planets'
  },
  {
    name: 'Karin',
    generation: 3,
    owner: 'Seto Kamiki Jurai',
    treeName: 'Karin-ki',
    description: 'Ship of the "Devil Princess of Jurai." Notable for its intimidating presence.',
    features: ['3 Light Hawk Wings', 'Spy network hub', 'Political influence'],
    interiorSize: 'Multiple planets'
  }
];

// ============================================================================
// MAP BUILDER FUNCTIONS
// ============================================================================

/**
 * Build the complete Masaki Estate map with all locations
 */
export function buildMasakiEstateMap(visualizer: MapVisualizer): WorldMap {
  // Real-world coordinates for Okayama Prefecture
  const map = visualizer.createRealWorldMap(
    'Masaki Estate - Complete Layout',
    {north: 34.72, south: 34.66, east: 133.82, west: 133.74},
    1000,
    800
  );

  // Add layers
  visualizer.addLayer(map.id, 'Terrain', 0); // Terrain layer for future use
  const buildingsLayer = visualizer.addLayer(map.id, 'Buildings', 1);
  const landmarksLayer = visualizer.addLayer(map.id, 'Landmarks', 2);
  const pathsLayer = visualizer.addLayer(map.id, 'Paths', 3);

  // Add all locations
  for (const loc of MASAKI_ESTATE_LOCATIONS) {
    const pointType = loc.type === 'building' ? 'castle' :
                      loc.type === 'landmark' ? 'landmark' :
                      loc.type === 'room' ? 'village' : 'town';

    const layerId = loc.type === 'building' ? buildingsLayer.id :
                    loc.type === 'landmark' ? landmarksLayer.id :
                    buildingsLayer.id;

    // Scale coordinates to map dimensions
    const x = (loc.coordinates.x / 100) * 1000;
    const y = (loc.coordinates.y / 100) * 800;

    visualizer.addPoint(map.id, {
      x, y,
      label: loc.name,
      type: pointType,
      metadata: {
        description: loc.description,
        features: loc.features,
        occupants: loc.occupants,
        parent: loc.parent
      }
    }, layerId);
  }

  // Add paths
  // Path: House to Shrine
  visualizer.addPath(map.id, {
    name: 'Path to Shrine',
    points: [
      {x: 500, y: 440}, // House
      {x: 520, y: 380},
      {x: 540, y: 336}, // Torii
      {x: 550, y: 280}  // Shrine
    ],
    type: 'trail'
  }, pathsLayer.id);

  // Path: Shrine to Cave/Funaho
  visualizer.addPath(map.id, {
    name: 'Path to Sacred Tree',
    points: [
      {x: 550, y: 280},
      {x: 580, y: 260},
      {x: 600, y: 232}  // Funaho-ki
    ],
    type: 'trail'
  }, pathsLayer.id);

  // Stone Steps
  visualizer.addPath(map.id, {
    name: '320 Stone Steps',
    points: [
      {x: 520, y: 384}, // Base
      {x: 530, y: 360},
      {x: 540, y: 336},
      {x: 545, y: 300},
      {x: 550, y: 280}  // Top
    ],
    type: 'road'
  }, pathsLayer.id);

  return map;
}

/**
 * Build galaxy-scale map of Tenchi Muyo universe
 */
export function buildGalaxyMap(visualizer: MapVisualizer): WorldMap {
  const map = visualizer.createMap({
    name: 'Tenchi Muyo Galaxy',
    width: 100,
    height: 100,
    scale: 1000,
    scaleUnit: 'light-years'
  });

  // Add layers
  const empiresLayer = visualizer.addLayer(map.id, 'Empires', 0);
  const planetsLayer = visualizer.addLayer(map.id, 'Planets', 1);
  const stationsLayer = visualizer.addLayer(map.id, 'Stations', 2);

  // Add empire regions
  visualizer.addRegion(map.id, {
    name: 'Jurai Empire',
    points: [
      {x: 70, y: 30}, {x: 95, y: 35}, {x: 95, y: 65},
      {x: 85, y: 70}, {x: 70, y: 60}
    ],
    type: 'kingdom',
    fill: '#4a9c5d'
  }, empiresLayer.id);

  visualizer.addRegion(map.id, {
    name: 'Seniwa Empire',
    points: [
      {x: 35, y: 35}, {x: 65, y: 35}, {x: 65, y: 65},
      {x: 35, y: 65}
    ],
    type: 'kingdom',
    fill: '#5a7fbf'
  }, empiresLayer.id);

  visualizer.addRegion(map.id, {
    name: 'Renza Federation',
    points: [
      {x: 15, y: 55}, {x: 45, y: 55}, {x: 45, y: 80},
      {x: 15, y: 80}
    ],
    type: 'kingdom',
    fill: '#bf7f5a'
  }, empiresLayer.id);

  // Add planets
  for (const entity of GALACTIC_ENTITIES) {
    if (!entity.coordinates) continue;

    const layerId = entity.type === 'station' ? stationsLayer.id : planetsLayer.id;
    const pointType = entity.type === 'planet' ? 'city' :
                      entity.type === 'station' ? 'port' : 'landmark';

    visualizer.addPoint(map.id, {
      x: entity.coordinates.x,
      y: entity.coordinates.y,
      label: entity.name,
      type: pointType,
      metadata: {
        affiliation: entity.affiliation,
        description: entity.description,
        features: entity.features
      }
    }, layerId);
  }

  // Add trade routes
  visualizer.addPath(map.id, {
    name: 'Jurai-Seniwa Trade Route',
    points: [
      {x: 85, y: 50}, // Jurai
      {x: 70, y: 50},
      {x: 52, y: 52}, // GP HQ
      {x: 50, y: 50}  // Seniwa
    ],
    type: 'trade_route'
  });

  visualizer.addPath(map.id, {
    name: 'Earth Protection Route',
    points: [
      {x: 85, y: 50}, // Jurai
      {x: 80, y: 45},
      {x: 75, y: 35}  // Earth
    ],
    type: 'trade_route'
  });

  return map;
}

/**
 * Build Washu's 5-planet laboratory map
 */
export function buildWashuLabMap(visualizer: MapVisualizer): WorldMap {
  const map = visualizer.createMap({
    name: "Washu's Subspace Laboratory",
    width: 100,
    height: 100
  });

  // Generate some terrain for visual interest
  visualizer.generateTerrain(map.id, {seed: 20000, waterLevel: 0.2});

  // Add planet layers
  for (let p = 1; p <= 5; p++) {
    const layer = visualizer.addLayer(map.id, `Planet ${p}`, p);

    const planetZones = WASHU_LAB_ZONES.filter(z => z.planet === p);
    for (const zone of planetZones) {
      visualizer.addPoint(map.id, {
        x: zone.coordinates.x,
        y: zone.coordinates.y,
        label: zone.name,
        type: 'landmark',
        metadata: {
          planet: zone.planet,
          description: zone.description,
          features: zone.features
        }
      }, layer.id);
    }
  }

  // Add portal connection
  visualizer.addPoint(map.id, {
    x: 50, y: 50,
    label: 'Portal to Masaki House',
    type: 'bridge',
    metadata: {description: 'Dimensional gateway to the broom closet'}
  });

  return map;
}

/**
 * Build Jurai Royal Palace map (within Tenju)
 */
export function buildJuraiPalaceMap(visualizer: MapVisualizer): WorldMap {
  const map = visualizer.createMap({
    name: 'Jurai Royal Palace (Tenju)',
    width: 100,
    height: 100
  });

  // Add layers by level
  const rootLayer = visualizer.addLayer(map.id, 'Root Level', 0);
  const trunkLayer = visualizer.addLayer(map.id, 'Trunk Level', 1);
  const crownLayer = visualizer.addLayer(map.id, 'Crown Level', 2);
  const branchLayer = visualizer.addLayer(map.id, 'Branch Levels', 3);

  for (const loc of JURAI_PALACE_LOCATIONS) {
    const layerId = loc.level === 'root' ? rootLayer.id :
                    loc.level === 'trunk' ? trunkLayer.id :
                    loc.level === 'crown' ? crownLayer.id :
                    branchLayer.id;

    visualizer.addPoint(map.id, {
      x: loc.coordinates.x,
      y: loc.coordinates.y,
      label: loc.name,
      type: loc.id.includes('throne') ? 'castle' :
            loc.id.includes('arboretum') ? 'landmark' :
            loc.id.includes('tsunami') ? 'temple' : 'town',
      metadata: {
        level: loc.level,
        description: loc.description,
        features: loc.features
      }
    }, layerId);
  }

  // Add tree trunk path (vertical axis)
  visualizer.addPath(map.id, {
    name: 'Tenju Central Trunk',
    points: [
      {x: 50, y: 90},
      {x: 50, y: 70},
      {x: 50, y: 50},
      {x: 50, y: 30},
      {x: 50, y: 10}
    ],
    type: 'road'
  });

  return map;
}

export default {
  GALACTIC_ENTITIES,
  MASAKI_ESTATE_LOCATIONS,
  WASHU_LAB_ZONES,
  JURAI_PALACE_LOCATIONS,
  JURAIAN_SHIPS,
  buildMasakiEstateMap,
  buildGalaxyMap,
  buildWashuLabMap,
  buildJuraiPalaceMap
};
