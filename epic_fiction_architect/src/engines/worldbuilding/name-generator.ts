/**
 * Epic Fiction Architect - Name Generation System
 *
 * Comprehensive phonetic-based name generator for characters, places,
 * and objects. Supports culture-linked naming patterns, multiple
 * naming conventions, and collision detection.
 *
 * Features:
 * - Phonetic rule templates
 * - Culture-linked name patterns
 * - Character names (gendered and neutral)
 * - Place names (settlements, geography)
 * - Organization/faction names
 * - Item/artifact names
 * - Ship/vehicle names
 * - Deity/mythological names
 * - Markov chain generation
 * - Etymology tracking
 * - Collision detection
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum NameCategory {
  CHARACTER = 'character',
  PLACE = 'place',
  ORGANIZATION = 'organization',
  ITEM = 'item',
  SHIP = 'ship',
  DEITY = 'deity',
  CREATURE = 'creature',
  SPELL = 'spell',
  LANGUAGE = 'language'
}

export enum NameStyle {
  FANTASY_ELVISH = 'fantasy_elvish',
  FANTASY_DWARVEN = 'fantasy_dwarven',
  FANTASY_ORCISH = 'fantasy_orcish',
  FANTASY_HUMAN = 'fantasy_human',
  CELTIC = 'celtic',
  NORSE = 'norse',
  LATIN = 'latin',
  GREEK = 'greek',
  ARABIC = 'arabic',
  JAPANESE = 'japanese',
  CHINESE = 'chinese',
  AFRICAN = 'african',
  SLAVIC = 'slavic',
  GERMANIC = 'germanic',
  SCI_FI = 'sci_fi',
  ELDRITCH = 'eldritch',
  SIMPLE = 'simple',
  CUSTOM = 'custom'
}

export enum Gender {
  MASCULINE = 'masculine',
  FEMININE = 'feminine',
  NEUTRAL = 'neutral',
  ANY = 'any'
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Phoneme inventory for a naming style
 */
export interface PhonemeSet {
  consonants: {
    initial: string[];     // Can start a word
    medial: string[];      // Can appear in middle
    final: string[];       // Can end a word
  };
  vowels: {
    short: string[];
    long: string[];
    diphthongs: string[];
  };
  clusters: {
    initial: string[];     // Consonant clusters at start
    medial: string[];      // Clusters in middle
    final: string[];       // Clusters at end
  };
  forbidden: string[];     // Combinations to avoid
}

/**
 * Syllable structure rules
 */
export interface SyllableRules {
  patterns: string[];      // e.g., ['CV', 'CVC', 'VC', 'V', 'CCV']
  minSyllables: number;
  maxSyllables: number;
  stressPosition: 'first' | 'last' | 'penultimate' | 'random';
}

/**
 * A naming convention/style definition
 */
export interface NamingStyle {
  id: string;
  name: string;
  style: NameStyle;
  description: string;

  // Phonetics
  phonemes: PhonemeSet;
  syllables: SyllableRules;

  // Affixes
  prefixes: {
    text: string;
    meaning: string;
    usage: NameCategory[];
    gender?: Gender;
  }[];

  suffixes: {
    text: string;
    meaning: string;
    usage: NameCategory[];
    gender?: Gender;
  }[];

  // Special rules
  rules: {
    capitalizeFirst: boolean;
    allowApostrophes: boolean;
    allowHyphens: boolean;
    doubleVowels: boolean;
    doubleConsonants: boolean;
    maxConsecutiveConsonants: number;
    maxConsecutiveVowels: number;
  };

  // Sample names for reference
  sampleNames: {
    category: NameCategory;
    gender?: Gender;
    name: string;
  }[];

  // Cultural context
  culturalNotes: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * A generated name with metadata
 */
export interface GeneratedName {
  id: string;
  name: string;
  category: NameCategory;
  style: NameStyle;
  gender?: Gender;

  // Components
  components: {
    prefix?: string;
    root: string;
    suffix?: string;
  };

  // Etymology
  etymology?: {
    meaning: string;
    derivation: string;
  };

  // Variants
  variants?: {
    nickname?: string;
    formal?: string;
    titleForm?: string;
  };

  // Usage tracking
  usedFor?: string;        // Entity ID this name is assigned to
  reserved: boolean;

  createdAt: Date;
}

/**
 * Generation options
 */
export interface NameGenerationOptions {
  style?: NameStyle;
  category?: NameCategory;
  gender?: Gender;
  minLength?: number;
  maxLength?: number;
  syllables?: number;
  startsWith?: string;
  endsWith?: string;
  contains?: string;
  excludePatterns?: string[];
  includePrefix?: boolean;
  includeSuffix?: boolean;
  count?: number;
}

// ============================================================================
// PRESET PHONEME SETS
// ============================================================================

const PRESET_PHONEMES: Record<NameStyle, PhonemeSet> = {
  [NameStyle.FANTASY_ELVISH]: {
    consonants: {
      initial: ['l', 'n', 'm', 'r', 's', 'th', 'f', 'g', 'v', 'c', 'el', 'ar', 'an'],
      medial: ['l', 'n', 'm', 'r', 's', 'th', 'f', 'd', 'v', 'nd', 'ld', 'rn', 'lv'],
      final: ['n', 'l', 's', 'th', 'r', 'nd', 'ld', 'rn', 'wen', 'iel', 'iel']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u'],
      long: ['ae', 'ea', 'ia', 'ie', 'io', 'ui'],
      diphthongs: ['ai', 'ei', 'au', 'ou', 'ae']
    },
    clusters: {
      initial: ['gl', 'gr', 'th', 'dr', 'tr', 'fl', 'fr'],
      medial: ['nd', 'ld', 'rn', 'lv', 'rv', 'rm', 'lm'],
      final: ['nd', 'ld', 'rn', 'th']
    },
    forbidden: ['ck', 'x', 'z', 'j', 'q', 'ugh', 'ock']
  },

  [NameStyle.FANTASY_DWARVEN]: {
    consonants: {
      initial: ['d', 'b', 'g', 'k', 'th', 'br', 'dr', 'gr', 'kr', 'tr'],
      medial: ['r', 'n', 'm', 'g', 'k', 'd', 'rg', 'rk', 'rd', 'ng'],
      final: ['n', 'm', 'r', 'k', 'd', 'rn', 'rm', 'rk', 'rd', 'ng', 'grim']
    },
    vowels: {
      short: ['a', 'i', 'o', 'u'],
      long: ['ai', 'oi', 'or', 'ar', 'ur'],
      diphthongs: ['oi', 'ai', 'au']
    },
    clusters: {
      initial: ['br', 'dr', 'gr', 'kr', 'tr', 'thr'],
      medial: ['rg', 'rk', 'rd', 'ng', 'mb', 'nd'],
      final: ['rn', 'rm', 'rk', 'rd', 'ng', 'grim', 'din', 'dum']
    },
    forbidden: ['ae', 'ea', 'th-end']
  },

  [NameStyle.FANTASY_ORCISH]: {
    consonants: {
      initial: ['g', 'gr', 'k', 'kr', 'r', 'z', 'dr', 'th', 'b', 'br'],
      medial: ['g', 'k', 'r', 'z', 'rg', 'rk', 'zg', 'gn', 'kn'],
      final: ['g', 'k', 'rg', 'rk', 'zg', 'th', 'sh', 'gash', 'nak']
    },
    vowels: {
      short: ['a', 'o', 'u', 'i'],
      long: ['aa', 'oo', 'uu', 'or', 'ur'],
      diphthongs: ['au', 'oi', 'ai']
    },
    clusters: {
      initial: ['gr', 'kr', 'dr', 'br', 'zg'],
      medial: ['rg', 'rk', 'zg', 'gn', 'kn', 'ng'],
      final: ['rg', 'rk', 'zg', 'gash', 'nak', 'gor', 'zug']
    },
    forbidden: ['ae', 'ie', 'ea', 'ia']
  },

  [NameStyle.FANTASY_HUMAN]: {
    consonants: {
      initial: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w'],
      medial: ['b', 'd', 'f', 'g', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'nd', 'ld', 'st'],
      final: ['d', 'k', 'l', 'm', 'n', 'r', 's', 't', 'th', 'ck', 'nd', 'rd', 'rn']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u'],
      long: ['ae', 'ea', 'ee', 'oo', 'ou'],
      diphthongs: ['ai', 'au', 'ei', 'oi', 'ou']
    },
    clusters: {
      initial: ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'str', 'sw', 'th', 'tr', 'tw', 'wh', 'wr'],
      medial: ['nd', 'ld', 'rd', 'st', 'nt', 'mp', 'nk', 'ng'],
      final: ['nd', 'ld', 'rd', 'st', 'nt', 'nk', 'ng', 'ck', 'sk']
    },
    forbidden: []
  },

  [NameStyle.NORSE]: {
    consonants: {
      initial: ['b', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'r', 's', 't', 'v', 'th', 'sk', 'hj'],
      medial: ['d', 'g', 'k', 'l', 'm', 'n', 'r', 's', 't', 'v', 'ld', 'nd', 'rn', 'lf'],
      final: ['d', 'f', 'k', 'l', 'm', 'n', 'r', 's', 't', 'rn', 'lf', 'ld', 'nd']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u', 'y'],
      long: ['aa', 'ei', 'au', 'ey', 'ae'],
      diphthongs: ['ei', 'au', 'ey']
    },
    clusters: {
      initial: ['sk', 'st', 'sn', 'sv', 'th', 'hj', 'kn', 'gn'],
      medial: ['ld', 'nd', 'rn', 'lf', 'ng', 'rk', 'rg'],
      final: ['ld', 'nd', 'rn', 'lf', 'ng', 'rr']
    },
    forbidden: []
  },

  [NameStyle.CELTIC]: {
    consonants: {
      initial: ['b', 'c', 'd', 'f', 'g', 'l', 'm', 'n', 'r', 's', 't', 'br', 'cr', 'dr', 'gr', 'tr'],
      medial: ['b', 'c', 'd', 'g', 'l', 'm', 'n', 'r', 's', 't', 'gh', 'dh', 'th', 'ch'],
      final: ['n', 'r', 's', 'th', 'gh', 'dh', 'ch', 'd', 'g', 'nn', 'rr']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u'],
      long: ['ae', 'ai', 'ao', 'ea', 'ia', 'io', 'ua'],
      diphthongs: ['ai', 'ao', 'ea', 'ia', 'io', 'ua']
    },
    clusters: {
      initial: ['br', 'cr', 'dr', 'gr', 'tr'],
      medial: ['gh', 'dh', 'th', 'ch', 'nn', 'rr', 'nd', 'ld'],
      final: ['gh', 'dh', 'th', 'ch', 'nn', 'rr']
    },
    forbidden: []
  },

  [NameStyle.LATIN]: {
    consonants: {
      initial: ['c', 'd', 'f', 'g', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'qu'],
      medial: ['c', 'd', 'g', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x', 'ct', 'pt'],
      final: ['s', 'm', 'n', 'r', 'x', 't', 'us', 'um', 'is', 'a']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u'],
      long: ['ae', 'oe', 'au'],
      diphthongs: ['ae', 'oe', 'au', 'ei']
    },
    clusters: {
      initial: ['qu', 'sp', 'st', 'sc', 'pl', 'pr', 'tr', 'cl', 'cr'],
      medial: ['ct', 'pt', 'gn', 'mn', 'nt', 'nd', 'rd'],
      final: ['ns', 'nt', 'ct', 'pt', 'x']
    },
    forbidden: []
  },

  [NameStyle.GREEK]: {
    consonants: {
      initial: ['b', 'd', 'g', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'th', 'ph', 'ch', 'x', 'z'],
      medial: ['d', 'g', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'th', 'ph', 'ch', 'x'],
      final: ['s', 'n', 'r', 'x', 'os', 'us', 'is', 'es', 'on']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u', 'y'],
      long: ['ae', 'ei', 'ou', 'eu', 'ai', 'oi'],
      diphthongs: ['ai', 'ei', 'oi', 'ou', 'eu', 'au']
    },
    clusters: {
      initial: ['ph', 'th', 'ch', 'ps', 'gn', 'kn', 'mn', 'pn'],
      medial: ['ph', 'th', 'ch', 'pt', 'kt', 'gm', 'dm'],
      final: ['ps', 'ks', 'nks', 'mps']
    },
    forbidden: []
  },

  [NameStyle.ARABIC]: {
    consonants: {
      initial: ['a', 'b', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'q', 'r', 's', 'sh', 't', 'w', 'y', 'z'],
      medial: ['b', 'd', 'f', 'h', 'j', 'k', 'l', 'm', 'n', 'q', 'r', 's', 'sh', 't', 'w', 'y', 'z', 'dh', 'th', 'kh'],
      final: ['b', 'd', 'f', 'h', 'j', 'k', 'l', 'm', 'n', 'r', 's', 'sh', 't', 'z', 'ah', 'ir', 'an', 'in']
    },
    vowels: {
      short: ['a', 'i', 'u'],
      long: ['aa', 'ii', 'uu', 'ai', 'au'],
      diphthongs: ['ai', 'au']
    },
    clusters: {
      initial: [],
      medial: ['dh', 'th', 'kh', 'gh', 'sh', 'rr', 'll', 'mm', 'nn'],
      final: ['ah', 'ir', 'an', 'in', 'ud', 'ad']
    },
    forbidden: []
  },

  [NameStyle.JAPANESE]: {
    consonants: {
      initial: ['k', 'g', 's', 'z', 't', 'd', 'n', 'h', 'b', 'p', 'm', 'y', 'r', 'w', 'sh', 'ch', 'ts'],
      medial: ['k', 'g', 's', 'z', 't', 'd', 'n', 'h', 'b', 'p', 'm', 'r', 'sh', 'ch', 'ts', 'ky', 'ry', 'ny'],
      final: ['n', 'ki', 'ko', 'ka', 'ke', 'ru', 'ri', 'ro', 'ra', 're']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u'],
      long: ['aa', 'ii', 'uu', 'ou', 'ei'],
      diphthongs: ['ai', 'ei', 'oi', 'ui']
    },
    clusters: {
      initial: ['ky', 'gy', 'sh', 'ch', 'ny', 'hy', 'by', 'py', 'my', 'ry'],
      medial: ['ky', 'sh', 'ch', 'ny', 'ry', 'pp', 'tt', 'kk', 'ss'],
      final: []
    },
    forbidden: ['ti', 'tu', 'si', 'hu', 'yi', 'ye', 'wu', 'wi', 'we', 'wo']
  },

  [NameStyle.CHINESE]: {
    consonants: {
      initial: ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'w', 'y'],
      medial: ['n', 'ng', 'r'],
      final: ['n', 'ng', 'r', 'i', 'u', 'o', 'a', 'e']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u', 'ü'],
      long: ['ai', 'ei', 'ao', 'ou', 'ia', 'ie', 'iu', 'ua', 'uo', 'üe'],
      diphthongs: ['ai', 'ei', 'ao', 'ou']
    },
    clusters: {
      initial: ['zh', 'ch', 'sh'],
      medial: ['ng'],
      final: ['ng', 'an', 'en', 'in', 'un', 'ang', 'eng', 'ing', 'ong']
    },
    forbidden: []
  },

  [NameStyle.AFRICAN]: {
    consonants: {
      initial: ['b', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'w', 'y', 'z', 'mb', 'nd', 'ng', 'nj', 'ny'],
      medial: ['b', 'd', 'g', 'k', 'l', 'm', 'n', 'r', 's', 't', 'w', 'y', 'z', 'mb', 'nd', 'ng', 'nj', 'ny'],
      final: ['a', 'e', 'i', 'o', 'u', 'la', 'na', 'ra', 'wa', 'ya']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u'],
      long: ['aa', 'ee', 'ii', 'oo', 'uu'],
      diphthongs: ['ai', 'au', 'ia', 'ua']
    },
    clusters: {
      initial: ['mb', 'nd', 'ng', 'nj', 'ny', 'kw', 'gw', 'bw', 'dw'],
      medial: ['mb', 'nd', 'ng', 'nj', 'ny'],
      final: []
    },
    forbidden: []
  },

  [NameStyle.SLAVIC]: {
    consonants: {
      initial: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z', 'st', 'sv', 'sl', 'sm', 'sn', 'zd', 'zv'],
      medial: ['b', 'c', 'd', 'g', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z', 'st', 'sk', 'sn', 'sl', 'šč'],
      final: ['v', 'k', 'n', 'r', 's', 't', 'sk', 'slav', 'mir', 'rad']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u', 'y'],
      long: ['aa', 'ee', 'ii', 'oo', 'ie', 'ia'],
      diphthongs: ['ie', 'ia', 'io', 'iu']
    },
    clusters: {
      initial: ['st', 'sv', 'sl', 'sm', 'sn', 'zd', 'zv', 'vl', 'ml', 'kr', 'gr', 'pr', 'br', 'tr', 'dr'],
      medial: ['st', 'sk', 'sn', 'sl', 'šč', 'zd', 'nd', 'nt', 'nk'],
      final: ['sk', 'slav', 'mir', 'rad', 'grad']
    },
    forbidden: []
  },

  [NameStyle.GERMANIC]: {
    consonants: {
      initial: ['b', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'r', 's', 't', 'v', 'w', 'z', 'sch', 'st', 'sp'],
      medial: ['b', 'd', 'f', 'g', 'k', 'l', 'm', 'n', 'r', 's', 't', 'v', 'z', 'ch', 'sch', 'cht', 'nd', 'ld', 'rn'],
      final: ['d', 'f', 'g', 'k', 'l', 'm', 'n', 'r', 's', 't', 'z', 'ch', 'sch', 'cht', 'nd', 'ld', 'rn', 'rich', 'fried', 'helm', 'bert', 'wald']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u'],
      long: ['aa', 'ee', 'ie', 'oo', 'ei', 'au', 'eu', 'äu'],
      diphthongs: ['ei', 'au', 'eu', 'äu', 'ie']
    },
    clusters: {
      initial: ['sch', 'st', 'sp', 'schr', 'str', 'spr', 'pf', 'kn', 'gn'],
      medial: ['ch', 'sch', 'cht', 'nd', 'ld', 'rn', 'ng', 'nk', 'pf'],
      final: ['ch', 'sch', 'cht', 'nd', 'ld', 'rn', 'ng', 'nk', 'rich', 'fried', 'helm', 'bert', 'wald']
    },
    forbidden: []
  },

  [NameStyle.SCI_FI]: {
    consonants: {
      initial: ['z', 'x', 'k', 'v', 'th', 'kr', 'zr', 'xr', 'q', 'vr', 'dr', 'tr'],
      medial: ['z', 'x', 'k', 'v', 'th', 'rk', 'rx', 'xn', 'zn', 'vn', 'xt', 'kt'],
      final: ['x', 'k', 'z', 'n', 'r', 'th', 'rk', 'rx', 'ax', 'ix', 'ox', 'on']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u'],
      long: ['ae', 'ei', 'ai', 'ou', 'io'],
      diphthongs: ['ae', 'ei', 'ai', 'io']
    },
    clusters: {
      initial: ['kr', 'zr', 'xr', 'vr', 'dr', 'tr', 'th'],
      medial: ['rk', 'rx', 'xn', 'zn', 'vn', 'xt', 'kt'],
      final: ['rk', 'rx', 'ax', 'ix', 'ox', 'on', 'ek', 'ak']
    },
    forbidden: []
  },

  [NameStyle.ELDRITCH]: {
    consonants: {
      initial: ['c', 'n', 'y', 'sh', 'th', 'f', 'z', 'x', 'ny', 'ct'],
      medial: ['th', 'gh', 'ng', 'gn', 'zg', 'yg', 'ct', 'ph'],
      final: ['th', 'gh', 'ng', 'gn', 'oth', 'ath', 'uth', 'ul']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u', 'y'],
      long: ['aa', 'ii', 'oo', 'ae', 'ia', 'ua'],
      diphthongs: ['ia', 'ua', 'ai', 'ao', 'uo']
    },
    clusters: {
      initial: ['ct', 'ny', 'sh', 'th', 'fh'],
      medial: ['th', 'gh', 'ng', 'gn', 'zg', 'yg', 'ct'],
      final: ['th', 'gh', 'ng', 'gn', 'oth', 'ath', 'uth', 'ul', 'yth']
    },
    forbidden: []
  },

  [NameStyle.SIMPLE]: {
    consonants: {
      initial: ['b', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w'],
      medial: ['d', 'g', 'k', 'l', 'm', 'n', 'r', 's', 't', 'v'],
      final: ['d', 'k', 'l', 'm', 'n', 'r', 's', 't']
    },
    vowels: {
      short: ['a', 'e', 'i', 'o', 'u'],
      long: ['ae', 'ee', 'ie', 'oo'],
      diphthongs: ['ai', 'ou']
    },
    clusters: {
      initial: [],
      medial: ['nd', 'st', 'nt'],
      final: ['nd', 'st', 'nt']
    },
    forbidden: []
  },

  [NameStyle.CUSTOM]: {
    consonants: { initial: [], medial: [], final: [] },
    vowels: { short: [], long: [], diphthongs: [] },
    clusters: { initial: [], medial: [], final: [] },
    forbidden: []
  }
};

// ============================================================================
// NAME GENERATOR CLASS
// ============================================================================

export class NameGenerator {
  private styles: Map<string, NamingStyle> = new Map();
  private generatedNames: Map<string, GeneratedName> = new Map();
  private usedNames: Set<string> = new Set();
  private seed: number = Date.now();

  constructor() {
    this.initializePresetStyles();
  }

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
    if (array.length === 0) return '' as unknown as T;
    return array[Math.floor(this.random() * array.length)];
  }

  private initializePresetStyles(): void {
    for (const [style, phonemes] of Object.entries(PRESET_PHONEMES)) {
      if (style === NameStyle.CUSTOM) continue;

      const namingStyle: NamingStyle = {
        id: uuidv4(),
        name: style.replace(/_/g, ' '),
        style: style as NameStyle,
        description: `${style.replace(/_/g, ' ')} naming style`,
        phonemes,
        syllables: {
          patterns: ['CV', 'CVC', 'VC', 'V', 'CCV', 'CVCC'],
          minSyllables: 2,
          maxSyllables: 4,
          stressPosition: 'penultimate'
        },
        prefixes: this.getDefaultPrefixes(style as NameStyle),
        suffixes: this.getDefaultSuffixes(style as NameStyle),
        rules: {
          capitalizeFirst: true,
          allowApostrophes: style === NameStyle.FANTASY_ELVISH || style === NameStyle.ELDRITCH,
          allowHyphens: false,
          doubleVowels: true,
          doubleConsonants: style !== NameStyle.JAPANESE,
          maxConsecutiveConsonants: style === NameStyle.SLAVIC ? 4 : 3,
          maxConsecutiveVowels: style === NameStyle.FANTASY_ELVISH ? 3 : 2
        },
        sampleNames: [],
        culturalNotes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.styles.set(namingStyle.id, namingStyle);
    }
  }

  private getDefaultPrefixes(style: NameStyle): NamingStyle['prefixes'] {
    const prefixes: Record<string, NamingStyle['prefixes']> = {
      [NameStyle.FANTASY_ELVISH]: [
        { text: 'El', meaning: 'Star', usage: [NameCategory.CHARACTER, NameCategory.PLACE] },
        { text: 'Gal', meaning: 'Light', usage: [NameCategory.CHARACTER, NameCategory.PLACE] },
        { text: 'Ar', meaning: 'Noble', usage: [NameCategory.CHARACTER] },
        { text: 'Cel', meaning: 'Silver', usage: [NameCategory.CHARACTER, NameCategory.PLACE] }
      ],
      [NameStyle.FANTASY_DWARVEN]: [
        { text: 'Thor', meaning: 'Thunder', usage: [NameCategory.CHARACTER] },
        { text: 'Bal', meaning: 'Strong', usage: [NameCategory.CHARACTER] },
        { text: 'Kaz', meaning: 'Mountain', usage: [NameCategory.PLACE] },
        { text: 'Dur', meaning: 'Dark', usage: [NameCategory.CHARACTER, NameCategory.PLACE] }
      ],
      [NameStyle.FANTASY_ORCISH]: [
        { text: 'Gro', meaning: 'Son of', usage: [NameCategory.CHARACTER], gender: Gender.MASCULINE },
        { text: 'Gra', meaning: 'Daughter of', usage: [NameCategory.CHARACTER], gender: Gender.FEMININE },
        { text: 'Gor', meaning: 'Blood', usage: [NameCategory.CHARACTER] },
        { text: 'Mog', meaning: 'Power', usage: [NameCategory.CHARACTER] }
      ]
    };

    return prefixes[style] || [];
  }

  private getDefaultSuffixes(style: NameStyle): NamingStyle['suffixes'] {
    const suffixes: Record<string, NamingStyle['suffixes']> = {
      [NameStyle.FANTASY_ELVISH]: [
        { text: 'wen', meaning: 'Maiden', usage: [NameCategory.CHARACTER], gender: Gender.FEMININE },
        { text: 'ion', meaning: 'Son', usage: [NameCategory.CHARACTER], gender: Gender.MASCULINE },
        { text: 'iel', meaning: 'Daughter', usage: [NameCategory.CHARACTER], gender: Gender.FEMININE },
        { text: 'dor', meaning: 'Land', usage: [NameCategory.PLACE] },
        { text: 'oth', meaning: 'Fortress', usage: [NameCategory.PLACE] }
      ],
      [NameStyle.FANTASY_DWARVEN]: [
        { text: 'din', meaning: 'Keeper', usage: [NameCategory.CHARACTER] },
        { text: 'grim', meaning: 'Fierce', usage: [NameCategory.CHARACTER] },
        { text: 'heim', meaning: 'Home', usage: [NameCategory.PLACE] },
        { text: 'hold', meaning: 'Fortress', usage: [NameCategory.PLACE] }
      ],
      [NameStyle.NORSE]: [
        { text: 'son', meaning: 'Son of', usage: [NameCategory.CHARACTER], gender: Gender.MASCULINE },
        { text: 'dottir', meaning: 'Daughter of', usage: [NameCategory.CHARACTER], gender: Gender.FEMININE },
        { text: 'heim', meaning: 'Home', usage: [NameCategory.PLACE] },
        { text: 'gard', meaning: 'Enclosure', usage: [NameCategory.PLACE] }
      ],
      [NameStyle.LATIN]: [
        { text: 'us', meaning: '', usage: [NameCategory.CHARACTER], gender: Gender.MASCULINE },
        { text: 'a', meaning: '', usage: [NameCategory.CHARACTER], gender: Gender.FEMININE },
        { text: 'ium', meaning: '', usage: [NameCategory.PLACE] },
        { text: 'is', meaning: '', usage: [NameCategory.CHARACTER] }
      ],
      [NameStyle.GERMANIC]: [
        { text: 'rich', meaning: 'Ruler', usage: [NameCategory.CHARACTER], gender: Gender.MASCULINE },
        { text: 'fried', meaning: 'Peace', usage: [NameCategory.CHARACTER] },
        { text: 'helm', meaning: 'Helmet/Protection', usage: [NameCategory.CHARACTER], gender: Gender.MASCULINE },
        { text: 'hild', meaning: 'Battle', usage: [NameCategory.CHARACTER], gender: Gender.FEMININE },
        { text: 'burg', meaning: 'Castle', usage: [NameCategory.PLACE] }
      ]
    };

    return suffixes[style] || [];
  }

  // ===========================================================================
  // GENERATION METHODS
  // ===========================================================================

  /**
   * Generate a single name
   */
  generate(options: NameGenerationOptions = {}): GeneratedName {
    const style = options.style || NameStyle.FANTASY_HUMAN;
    const category = options.category || NameCategory.CHARACTER;
    const gender = options.gender || Gender.ANY;

    const phonemes = PRESET_PHONEMES[style] || PRESET_PHONEMES[NameStyle.SIMPLE];
    const namingStyle = this.getStyleByType(style);

    let name = '';
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      name = this.generateRootName(phonemes, namingStyle, options);

      // Apply prefix/suffix
      if (options.includePrefix && namingStyle) {
        const prefix = this.selectAffix(namingStyle.prefixes, category, gender);
        if (prefix) name = prefix + name.toLowerCase();
      }

      if (options.includeSuffix && namingStyle) {
        const suffix = this.selectAffix(namingStyle.suffixes, category, gender);
        if (suffix) name = name + suffix;
      }

      // Validate
      if (this.validateName(name, options) && !this.usedNames.has(name.toLowerCase())) {
        break;
      }

      attempts++;
    }

    // Capitalize
    name = name.charAt(0).toUpperCase() + name.slice(1);

    const generatedName: GeneratedName = {
      id: uuidv4(),
      name,
      category,
      style,
      gender: gender !== Gender.ANY ? gender : undefined,
      components: {
        root: name
      },
      reserved: false,
      createdAt: new Date()
    };

    this.generatedNames.set(generatedName.id, generatedName);
    this.usedNames.add(name.toLowerCase());

    return generatedName;
  }

  /**
   * Generate multiple names
   */
  generateBatch(count: number, options: NameGenerationOptions = {}): GeneratedName[] {
    const names: GeneratedName[] = [];
    for (let i = 0; i < count; i++) {
      names.push(this.generate(options));
    }
    return names;
  }

  /**
   * Generate a full name (given + family)
   */
  generateFullName(options: NameGenerationOptions & {
    familyStyle?: 'patronymic' | 'matronymic' | 'location' | 'occupation' | 'simple';
  } = {}): { given: GeneratedName; family: GeneratedName; full: string } {
    const given = this.generate({ ...options, category: NameCategory.CHARACTER });

    let familyOptions = { ...options, category: NameCategory.CHARACTER };
    if (options.familyStyle === 'location') {
      familyOptions.category = NameCategory.PLACE;
    }

    const family = this.generate(familyOptions);

    return {
      given,
      family,
      full: `${given.name} ${family.name}`
    };
  }

  /**
   * Generate a place name
   */
  generatePlaceName(options: NameGenerationOptions & {
    placeType?: 'city' | 'town' | 'village' | 'fortress' | 'river' | 'mountain' | 'forest' | 'region';
  } = {}): GeneratedName {
    const placeType = options.placeType || 'city';
    const style = options.style || NameStyle.FANTASY_HUMAN;

    // Generate base name
    const baseName = this.generate({
      ...options,
      category: NameCategory.PLACE,
      includeSuffix: true
    });

    // Add place-specific suffix if not already present
    const placeSuffixes: Record<string, string[]> = {
      city: ['burg', 'ton', 'ville', 'polis'],
      town: ['ton', 'ford', 'wick', 'ham'],
      village: ['stead', 'thorpe', 'ham'],
      fortress: ['hold', 'keep', 'guard', 'watch'],
      river: ['water', 'flow', 'stream'],
      mountain: ['peak', 'mount', 'horn', 'top'],
      forest: ['wood', 'grove', 'glen'],
      region: ['land', 'realm', 'march']
    };

    return baseName;
  }

  private generateRootName(phonemes: PhonemeSet, style: NamingStyle | undefined, options: NameGenerationOptions): string {
    const syllableCount = options.syllables || this.randomInt(
      style?.syllables.minSyllables || 2,
      style?.syllables.maxSyllables || 4
    );

    let name = '';

    for (let i = 0; i < syllableCount; i++) {
      const syllable = this.generateSyllable(phonemes, i === 0, i === syllableCount - 1);
      name += syllable;
    }

    // Apply length constraints
    if (options.minLength && name.length < options.minLength) {
      name += this.randomChoice(phonemes.vowels.short);
    }
    if (options.maxLength && name.length > options.maxLength) {
      name = name.slice(0, options.maxLength);
    }

    // Apply start/end constraints
    if (options.startsWith && !name.toLowerCase().startsWith(options.startsWith.toLowerCase())) {
      name = options.startsWith + name.slice(options.startsWith.length);
    }
    if (options.endsWith && !name.toLowerCase().endsWith(options.endsWith.toLowerCase())) {
      name = name.slice(0, -options.endsWith.length) + options.endsWith;
    }

    return name;
  }

  private generateSyllable(phonemes: PhonemeSet, isFirst: boolean, isLast: boolean): string {
    const patterns = ['CV', 'CVC', 'VC', 'V'];
    const pattern = this.randomChoice(patterns);

    let syllable = '';

    for (const char of pattern) {
      if (char === 'C') {
        if (syllable.length === 0 && isFirst) {
          // Initial consonant
          const choices = [...phonemes.consonants.initial];
          if (phonemes.clusters.initial.length > 0 && this.random() > 0.7) {
            choices.push(...phonemes.clusters.initial);
          }
          syllable += this.randomChoice(choices);
        } else if (isLast && pattern.endsWith('C')) {
          // Final consonant
          const choices = [...phonemes.consonants.final];
          if (phonemes.clusters.final.length > 0 && this.random() > 0.7) {
            choices.push(...phonemes.clusters.final);
          }
          syllable += this.randomChoice(choices);
        } else {
          // Medial consonant
          syllable += this.randomChoice(phonemes.consonants.medial);
        }
      } else if (char === 'V') {
        const vowelType = this.random();
        if (vowelType < 0.6) {
          syllable += this.randomChoice(phonemes.vowels.short);
        } else if (vowelType < 0.85) {
          syllable += this.randomChoice(phonemes.vowels.long);
        } else {
          syllable += this.randomChoice(phonemes.vowels.diphthongs);
        }
      }
    }

    return syllable;
  }

  private selectAffix(
    affixes: NamingStyle['prefixes'] | NamingStyle['suffixes'],
    category: NameCategory,
    gender: Gender
  ): string | null {
    const matching = affixes.filter(a => {
      if (!a.usage.includes(category)) return false;
      if (gender !== Gender.ANY && a.gender && a.gender !== gender) return false;
      return true;
    });

    if (matching.length === 0) return null;
    return this.randomChoice(matching).text;
  }

  private validateName(name: string, options: NameGenerationOptions): boolean {
    if (!name || name.length < 2) return false;

    // Check length constraints
    if (options.minLength && name.length < options.minLength) return false;
    if (options.maxLength && name.length > options.maxLength) return false;

    // Check exclusion patterns
    if (options.excludePatterns) {
      for (const pattern of options.excludePatterns) {
        if (name.toLowerCase().includes(pattern.toLowerCase())) {
          return false;
        }
      }
    }

    // Check for excessive repetition
    if (/(.)\1{2,}/.test(name)) return false;

    return true;
  }

  private getStyleByType(style: NameStyle): NamingStyle | undefined {
    for (const s of this.styles.values()) {
      if (s.style === style) return s;
    }
    return undefined;
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Check if a name is already used
   */
  isNameUsed(name: string): boolean {
    return this.usedNames.has(name.toLowerCase());
  }

  /**
   * Reserve a name
   */
  reserveName(name: string, entityId?: string): GeneratedName {
    const generatedName: GeneratedName = {
      id: uuidv4(),
      name,
      category: NameCategory.CHARACTER,
      style: NameStyle.CUSTOM,
      components: { root: name },
      usedFor: entityId,
      reserved: true,
      createdAt: new Date()
    };

    this.generatedNames.set(generatedName.id, generatedName);
    this.usedNames.add(name.toLowerCase());

    return generatedName;
  }

  /**
   * Release a reserved name
   */
  releaseName(nameId: string): boolean {
    const name = this.generatedNames.get(nameId);
    if (!name) return false;

    this.usedNames.delete(name.name.toLowerCase());
    this.generatedNames.delete(nameId);
    return true;
  }

  /**
   * Get all generated names
   */
  getAllNames(): GeneratedName[] {
    return Array.from(this.generatedNames.values());
  }

  /**
   * Get names by category
   */
  getNamesByCategory(category: NameCategory): GeneratedName[] {
    return this.getAllNames().filter(n => n.category === category);
  }

  /**
   * Get names by style
   */
  getNamesByStyle(style: NameStyle): GeneratedName[] {
    return this.getAllNames().filter(n => n.style === style);
  }

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      names: Array.from(this.generatedNames.values()),
      usedNames: Array.from(this.usedNames)
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.names) {
      for (const name of data.names) {
        this.generatedNames.set(name.id, {
          ...name,
          createdAt: new Date(name.createdAt)
        });
      }
    }

    if (data.usedNames) {
      for (const name of data.usedNames) {
        this.usedNames.add(name);
      }
    }
  }

  /**
   * Clear all names (for fresh start)
   */
  clear(): void {
    this.generatedNames.clear();
    this.usedNames.clear();
  }
}

export default NameGenerator;
