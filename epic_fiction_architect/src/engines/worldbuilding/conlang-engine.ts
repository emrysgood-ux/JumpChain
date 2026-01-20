/**
 * Conlang/Language Engine
 *
 * Comprehensive constructed language system for epic fiction worldbuilding.
 * Supports phonology, morphology, syntax, vocabulary, and writing systems.
 * Integrates with Name Generator for consistent cultural naming.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

export enum PhonemeType {
  CONSONANT = 'consonant',
  VOWEL = 'vowel',
  DIPHTHONG = 'diphthong',
  AFFRICATE = 'affricate',
  CLICK = 'click',
  TONE = 'tone'
}

export enum ArticulationPlace {
  BILABIAL = 'bilabial',
  LABIODENTAL = 'labiodental',
  DENTAL = 'dental',
  ALVEOLAR = 'alveolar',
  POSTALVEOLAR = 'postalveolar',
  RETROFLEX = 'retroflex',
  PALATAL = 'palatal',
  VELAR = 'velar',
  UVULAR = 'uvular',
  PHARYNGEAL = 'pharyngeal',
  GLOTTAL = 'glottal'
}

export enum ArticulationManner {
  PLOSIVE = 'plosive',
  NASAL = 'nasal',
  TRILL = 'trill',
  TAP = 'tap',
  FRICATIVE = 'fricative',
  LATERAL_FRICATIVE = 'lateral_fricative',
  APPROXIMANT = 'approximant',
  LATERAL_APPROXIMANT = 'lateral_approximant'
}

export enum VowelHeight {
  CLOSE = 'close',
  NEAR_CLOSE = 'near_close',
  CLOSE_MID = 'close_mid',
  MID = 'mid',
  OPEN_MID = 'open_mid',
  NEAR_OPEN = 'near_open',
  OPEN = 'open'
}

export enum VowelBackness {
  FRONT = 'front',
  CENTRAL = 'central',
  BACK = 'back'
}

export enum WordOrder {
  SVO = 'SVO',  // Subject-Verb-Object (English, Chinese)
  SOV = 'SOV',  // Subject-Object-Verb (Japanese, Korean, Latin)
  VSO = 'VSO',  // Verb-Subject-Object (Welsh, Arabic)
  VOS = 'VOS',  // Verb-Object-Subject (Malagasy)
  OVS = 'OVS',  // Object-Verb-Subject (Hixkaryana)
  OSV = 'OSV',  // Object-Subject-Verb (Xavante)
  FREE = 'free' // Free word order (Latin, Russian)
}

export enum MorphologicalType {
  ISOLATING = 'isolating',      // One morpheme per word (Chinese)
  AGGLUTINATIVE = 'agglutinative', // Clear morpheme boundaries (Turkish, Japanese)
  FUSIONAL = 'fusional',        // Morphemes blend together (Latin, Russian)
  POLYSYNTHETIC = 'polysynthetic', // Many morphemes in one word (Inuktitut)
  OLIGOSYNTHETIC = 'oligosynthetic' // Few root morphemes, highly combining
}

export enum GrammaticalCase {
  NOMINATIVE = 'nominative',
  ACCUSATIVE = 'accusative',
  DATIVE = 'dative',
  GENITIVE = 'genitive',
  ABLATIVE = 'ablative',
  LOCATIVE = 'locative',
  INSTRUMENTAL = 'instrumental',
  VOCATIVE = 'vocative',
  ERGATIVE = 'ergative',
  ABSOLUTIVE = 'absolutive',
  PARTITIVE = 'partitive',
  COMITATIVE = 'comitative',
  BENEFACTIVE = 'benefactive',
  CAUSATIVE = 'causative'
}

export enum GrammaticalGender {
  NONE = 'none',
  MASCULINE_FEMININE = 'masculine_feminine',
  MASCULINE_FEMININE_NEUTER = 'masculine_feminine_neuter',
  ANIMATE_INANIMATE = 'animate_inanimate',
  HUMAN_NONHUMAN = 'human_nonhuman',
  NOUN_CLASS = 'noun_class'  // Many classes like Bantu languages
}

export enum TenseSystem {
  NONE = 'none',
  PAST_NONPAST = 'past_nonpast',
  PAST_PRESENT_FUTURE = 'past_present_future',
  REMOTE_PAST_NEAR_PAST_PRESENT_NEAR_FUTURE_REMOTE_FUTURE = 'five_tense',
  ASPECT_BASED = 'aspect_based'
}

export enum AspectType {
  PERFECTIVE = 'perfective',
  IMPERFECTIVE = 'imperfective',
  PROGRESSIVE = 'progressive',
  HABITUAL = 'habitual',
  INCHOATIVE = 'inchoative',
  CESSATIVE = 'cessative',
  ITERATIVE = 'iterative',
  SEMELFACTIVE = 'semelfactive'
}

export enum EvidentialityType {
  NONE = 'none',
  DIRECT = 'direct',           // Speaker witnessed
  REPORTED = 'reported',       // Hearsay
  INFERENTIAL = 'inferential', // Based on evidence
  ASSUMED = 'assumed'          // General knowledge
}

export enum HonorificSystem {
  NONE = 'none',
  SIMPLE = 'simple',           // T-V distinction
  COMPLEX = 'complex',         // Multiple levels (Japanese)
  ELABORATE = 'elaborate'      // Royal/religious/social (Thai, Javanese)
}

export enum WritingSystemType {
  ALPHABET = 'alphabet',
  ABJAD = 'abjad',             // Consonants only (Arabic, Hebrew)
  ABUGIDA = 'abugida',         // Consonant-vowel units (Devanagari)
  SYLLABARY = 'syllabary',     // Each symbol = syllable (Japanese kana)
  LOGOGRAPHIC = 'logographic', // Each symbol = word/morpheme (Chinese)
  FEATURAL = 'featural',       // Symbols show phonetic features (Korean)
  MIXED = 'mixed'
}

export enum WritingDirection {
  LEFT_TO_RIGHT = 'ltr',
  RIGHT_TO_LEFT = 'rtl',
  TOP_TO_BOTTOM = 'ttb',
  BOUSTROPHEDON = 'boustrophedon' // Alternating
}

export enum WordCategory {
  NOUN = 'noun',
  VERB = 'verb',
  ADJECTIVE = 'adjective',
  ADVERB = 'adverb',
  PRONOUN = 'pronoun',
  PREPOSITION = 'preposition',
  POSTPOSITION = 'postposition',
  CONJUNCTION = 'conjunction',
  INTERJECTION = 'interjection',
  DETERMINER = 'determiner',
  PARTICLE = 'particle',
  CLASSIFIER = 'classifier',
  NUMERAL = 'numeral'
}

export enum SemanticDomain {
  BODY = 'body',
  KINSHIP = 'kinship',
  FOOD = 'food',
  NATURE = 'nature',
  ANIMALS = 'animals',
  PLANTS = 'plants',
  COLORS = 'colors',
  NUMBERS = 'numbers',
  TIME = 'time',
  SPACE = 'space',
  EMOTIONS = 'emotions',
  ACTIONS = 'actions',
  QUALITIES = 'qualities',
  SOCIAL = 'social',
  RELIGION = 'religion',
  MAGIC = 'magic',
  WARFARE = 'warfare',
  TRADE = 'trade',
  CRAFTS = 'crafts',
  WEATHER = 'weather'
}

export enum LanguageFamily {
  ISOLATE = 'isolate',
  PROTO = 'proto',
  DAUGHTER = 'daughter',
  CREOLE = 'creole',
  PIDGIN = 'pidgin',
  MIXED = 'mixed'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface Phoneme {
  id: string;
  symbol: string;           // IPA or custom symbol
  romanization: string;     // Latin alphabet representation
  type: PhonemeType;
  // For consonants
  place?: ArticulationPlace;
  manner?: ArticulationManner;
  voiced?: boolean;
  // For vowels
  height?: VowelHeight;
  backness?: VowelBackness;
  rounded?: boolean;
  long?: boolean;
  nasalized?: boolean;
  // For tones
  toneContour?: string;     // e.g., "rising", "falling", "high", "low"
  // General
  frequency: number;        // 0-1, how common in the language
  notes?: string;
}

export interface Phonotactics {
  syllableStructures: string[];  // e.g., ["CV", "CVC", "CCVC"]
  onsetClusters: string[][];     // Allowed initial consonant clusters
  codaClusters: string[][];      // Allowed final consonant clusters
  vowelClusters: string[][];     // Allowed vowel sequences
  forbiddenSequences: string[];  // Sequences that never occur
  stressPattern: 'initial' | 'final' | 'penultimate' | 'antepenultimate' | 'lexical' | 'pitch';
  toneCount?: number;
  maxSyllables?: number;
  notes?: string;
}

export interface SoundChange {
  id: string;
  name: string;
  description: string;
  inputPattern: string;     // Regex or phoneme sequence
  outputPattern: string;    // Result
  environment?: string;     // Conditioning environment
  exceptions?: string[];
  historical?: boolean;     // Is this a historical change?
  active?: boolean;         // Does it still apply?
}

export interface Morpheme {
  id: string;
  form: string;
  meaning: string;
  type: 'root' | 'prefix' | 'suffix' | 'infix' | 'circumfix' | 'clitic';
  category?: WordCategory;
  semanticDomain?: SemanticDomain;
  allomorphs?: string[];    // Variant forms
  notes?: string;
}

export interface GrammarRule {
  id: string;
  name: string;
  description: string;
  category: 'phonology' | 'morphology' | 'syntax' | 'semantics' | 'pragmatics';
  rule: string;             // Formal or informal rule description
  examples: {
    input: string;
    output: string;
    gloss?: string;
  }[];
  exceptions?: string[];
  notes?: string;
}

export interface Word {
  id: string;
  lemma: string;            // Dictionary form
  pronunciation: string;    // IPA or phonetic
  romanization: string;
  category: WordCategory;
  meanings: {
    definition: string;
    semanticDomain: SemanticDomain;
    usage?: string;
    register?: 'formal' | 'informal' | 'archaic' | 'poetic' | 'vulgar' | 'technical';
  }[];
  etymology?: {
    origin: string;         // Proto-language form or loan source
    morphemes?: string[];   // Component morpheme IDs
    notes?: string;
  };
  inflections?: Record<string, string>;  // Case/tense forms
  derivations?: string[];   // IDs of derived words
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];  // Common word combinations
  frequency: number;        // 0-1, how common
  dateAdded: Date;
  notes?: string;
}

export interface Phrase {
  id: string;
  text: string;
  pronunciation: string;
  romanization: string;
  translation: string;
  literal?: string;         // Literal/word-by-word translation
  gloss?: string;           // Linguistic gloss
  category: 'greeting' | 'farewell' | 'thanks' | 'apology' | 'question' | 'exclamation' | 'proverb' | 'oath' | 'ritual' | 'other';
  usage?: string;
  cultural_notes?: string;
}

export interface WritingSystem {
  id: string;
  name: string;
  type: WritingSystemType;
  direction: WritingDirection;
  characters: {
    symbol: string;
    phoneme?: string;       // Associated sound
    meaning?: string;       // For logographic
    name?: string;          // Name of the character
  }[];
  diacritics?: {
    symbol: string;
    function: string;
  }[];
  punctuation?: {
    symbol: string;
    usage: string;
  }[];
  numerals?: string[];
  description?: string;
  history?: string;
  aesthetics?: string;      // Visual description
}

export interface Dialect {
  id: string;
  name: string;
  region?: string;
  speakers?: string;        // Who speaks it
  phonemeChanges: Record<string, string>;  // Standard -> Dialect
  vocabularyChanges: Record<string, string>;
  grammaticalDifferences?: string[];
  socialStatus?: 'prestige' | 'standard' | 'regional' | 'stigmatized';
  notes?: string;
}

export interface Language {
  id: string;
  name: string;
  nativeName: string;       // Name in the language itself
  familyType: LanguageFamily;
  parentLanguage?: string;  // ID of parent language
  childLanguages?: string[]; // IDs of descendant languages

  // Phonology
  phonemes: Phoneme[];
  phonotactics: Phonotactics;
  soundChanges?: SoundChange[];

  // Morphology
  morphologicalType: MorphologicalType;
  morphemes: Morpheme[];

  // Grammar
  wordOrder: WordOrder;
  cases: GrammaticalCase[];
  genderSystem: GrammaticalGender;
  genderCount?: number;     // For noun class systems
  tenseSystem: TenseSystem;
  aspects: AspectType[];
  evidentiality: EvidentialityType;
  honorifics: HonorificSystem;
  grammarRules: GrammarRule[];

  // Lexicon
  vocabulary: Word[];
  phrases: Phrase[];

  // Writing
  writingSystems: WritingSystem[];
  primaryWritingSystem?: string;  // ID

  // Dialects
  dialects: Dialect[];
  standardDialect?: string;  // ID

  // Metadata
  speakerPopulation?: number;
  regions?: string[];        // Where it's spoken
  culturalContext?: string;
  history?: string;
  status: 'living' | 'endangered' | 'extinct' | 'liturgical' | 'fictional';

  dateCreated: Date;
  lastModified: Date;
  notes?: string;
}

export interface LanguageGenerationOptions {
  name?: string;
  morphologicalType?: MorphologicalType;
  wordOrder?: WordOrder;
  phonemeComplexity?: 'simple' | 'moderate' | 'complex';
  includeWritingSystem?: boolean;
  includeTones?: boolean;
  caseCount?: number;
  genderSystem?: GrammaticalGender;
  basedOn?: 'elvish' | 'dwarven' | 'orcish' | 'human' | 'alien' | 'ancient' | 'random';
  seed?: number;
}

export interface TranslationResult {
  original: string;
  translated: string;
  pronunciation: string;
  romanization: string;
  gloss?: string;
  literal?: string;
  wordByWord?: { original: string; translated: string }[];
  confidence: number;       // 0-1, based on vocabulary coverage
  unknownWords?: string[];
}

// ============================================================================
// PHONEME PRESETS
// ============================================================================

const PHONEME_PRESETS: Record<string, Partial<Phoneme>[]> = {
  elvish: [
    // Vowels - many, melodic
    { symbol: 'a', romanization: 'a', type: PhonemeType.VOWEL, height: VowelHeight.OPEN, backness: VowelBackness.FRONT, frequency: 0.15 },
    { symbol: 'e', romanization: 'e', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE_MID, backness: VowelBackness.FRONT, frequency: 0.12 },
    { symbol: 'i', romanization: 'i', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.FRONT, frequency: 0.12 },
    { symbol: 'o', romanization: 'o', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE_MID, backness: VowelBackness.BACK, rounded: true, frequency: 0.08 },
    { symbol: 'u', romanization: 'u', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.BACK, rounded: true, frequency: 0.06 },
    { symbol: 'y', romanization: 'y', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.FRONT, rounded: true, frequency: 0.04 },
    { symbol: 'aɪ', romanization: 'ai', type: PhonemeType.DIPHTHONG, frequency: 0.03 },
    { symbol: 'eɪ', romanization: 'ei', type: PhonemeType.DIPHTHONG, frequency: 0.03 },
    // Consonants - soft, flowing
    { symbol: 'l', romanization: 'l', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.LATERAL_APPROXIMANT, frequency: 0.08 },
    { symbol: 'r', romanization: 'r', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.APPROXIMANT, frequency: 0.06 },
    { symbol: 'n', romanization: 'n', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.NASAL, frequency: 0.07 },
    { symbol: 'm', romanization: 'm', type: PhonemeType.CONSONANT, place: ArticulationPlace.BILABIAL, manner: ArticulationManner.NASAL, frequency: 0.05 },
    { symbol: 's', romanization: 's', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.FRICATIVE, voiced: false, frequency: 0.04 },
    { symbol: 'θ', romanization: 'th', type: PhonemeType.CONSONANT, place: ArticulationPlace.DENTAL, manner: ArticulationManner.FRICATIVE, voiced: false, frequency: 0.03 },
    { symbol: 'ð', romanization: 'dh', type: PhonemeType.CONSONANT, place: ArticulationPlace.DENTAL, manner: ArticulationManner.FRICATIVE, voiced: true, frequency: 0.02 },
    { symbol: 'v', romanization: 'v', type: PhonemeType.CONSONANT, place: ArticulationPlace.LABIODENTAL, manner: ArticulationManner.FRICATIVE, voiced: true, frequency: 0.03 },
    { symbol: 'f', romanization: 'f', type: PhonemeType.CONSONANT, place: ArticulationPlace.LABIODENTAL, manner: ArticulationManner.FRICATIVE, voiced: false, frequency: 0.02 },
    { symbol: 't', romanization: 't', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.PLOSIVE, voiced: false, frequency: 0.04 },
    { symbol: 'd', romanization: 'd', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.03 },
  ],

  dwarven: [
    // Vowels - fewer, deeper
    { symbol: 'a', romanization: 'a', type: PhonemeType.VOWEL, height: VowelHeight.OPEN, backness: VowelBackness.BACK, frequency: 0.15 },
    { symbol: 'o', romanization: 'o', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE_MID, backness: VowelBackness.BACK, rounded: true, frequency: 0.12 },
    { symbol: 'u', romanization: 'u', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.BACK, rounded: true, frequency: 0.10 },
    { symbol: 'i', romanization: 'i', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.FRONT, frequency: 0.06 },
    { symbol: 'e', romanization: 'e', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE_MID, backness: VowelBackness.FRONT, frequency: 0.05 },
    // Consonants - hard, guttural
    { symbol: 'k', romanization: 'k', type: PhonemeType.CONSONANT, place: ArticulationPlace.VELAR, manner: ArticulationManner.PLOSIVE, voiced: false, frequency: 0.10 },
    { symbol: 'g', romanization: 'g', type: PhonemeType.CONSONANT, place: ArticulationPlace.VELAR, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.08 },
    { symbol: 'x', romanization: 'kh', type: PhonemeType.CONSONANT, place: ArticulationPlace.VELAR, manner: ArticulationManner.FRICATIVE, voiced: false, frequency: 0.06 },
    { symbol: 'r', romanization: 'r', type: PhonemeType.CONSONANT, place: ArticulationPlace.UVULAR, manner: ArticulationManner.TRILL, frequency: 0.07 },
    { symbol: 'd', romanization: 'd', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.06 },
    { symbol: 't', romanization: 't', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.PLOSIVE, voiced: false, frequency: 0.05 },
    { symbol: 'n', romanization: 'n', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.NASAL, frequency: 0.06 },
    { symbol: 'm', romanization: 'm', type: PhonemeType.CONSONANT, place: ArticulationPlace.BILABIAL, manner: ArticulationManner.NASAL, frequency: 0.05 },
    { symbol: 'z', romanization: 'z', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.FRICATIVE, voiced: true, frequency: 0.04 },
    { symbol: 'b', romanization: 'b', type: PhonemeType.CONSONANT, place: ArticulationPlace.BILABIAL, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.04 },
    { symbol: 'ʔ', romanization: "'", type: PhonemeType.CONSONANT, place: ArticulationPlace.GLOTTAL, manner: ArticulationManner.PLOSIVE, frequency: 0.03 },
  ],

  orcish: [
    // Vowels - guttural
    { symbol: 'a', romanization: 'a', type: PhonemeType.VOWEL, height: VowelHeight.OPEN, backness: VowelBackness.BACK, frequency: 0.15 },
    { symbol: 'u', romanization: 'u', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.BACK, rounded: true, frequency: 0.12 },
    { symbol: 'o', romanization: 'o', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE_MID, backness: VowelBackness.BACK, rounded: true, frequency: 0.08 },
    { symbol: 'ɪ', romanization: 'i', type: PhonemeType.VOWEL, height: VowelHeight.NEAR_CLOSE, backness: VowelBackness.FRONT, frequency: 0.05 },
    // Consonants - harsh, aggressive
    { symbol: 'g', romanization: 'g', type: PhonemeType.CONSONANT, place: ArticulationPlace.VELAR, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.12 },
    { symbol: 'k', romanization: 'k', type: PhonemeType.CONSONANT, place: ArticulationPlace.VELAR, manner: ArticulationManner.PLOSIVE, voiced: false, frequency: 0.10 },
    { symbol: 'ʁ', romanization: 'gh', type: PhonemeType.CONSONANT, place: ArticulationPlace.UVULAR, manner: ArticulationManner.FRICATIVE, voiced: true, frequency: 0.08 },
    { symbol: 'r', romanization: 'r', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.TRILL, frequency: 0.07 },
    { symbol: 'z', romanization: 'z', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.FRICATIVE, voiced: true, frequency: 0.06 },
    { symbol: 'ʃ', romanization: 'sh', type: PhonemeType.CONSONANT, place: ArticulationPlace.POSTALVEOLAR, manner: ArticulationManner.FRICATIVE, voiced: false, frequency: 0.05 },
    { symbol: 'b', romanization: 'b', type: PhonemeType.CONSONANT, place: ArticulationPlace.BILABIAL, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.05 },
    { symbol: 'd', romanization: 'd', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.05 },
    { symbol: 'n', romanization: 'n', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.NASAL, frequency: 0.04 },
    { symbol: 'm', romanization: 'm', type: PhonemeType.CONSONANT, place: ArticulationPlace.BILABIAL, manner: ArticulationManner.NASAL, frequency: 0.03 },
    { symbol: 'ʔ', romanization: "'", type: PhonemeType.CONSONANT, place: ArticulationPlace.GLOTTAL, manner: ArticulationManner.PLOSIVE, frequency: 0.04 },
    { symbol: 'x', romanization: 'kh', type: PhonemeType.CONSONANT, place: ArticulationPlace.VELAR, manner: ArticulationManner.FRICATIVE, voiced: false, frequency: 0.05 },
  ],

  human: [
    // Standard European-style phoneme inventory
    { symbol: 'a', romanization: 'a', type: PhonemeType.VOWEL, height: VowelHeight.OPEN, backness: VowelBackness.CENTRAL, frequency: 0.12 },
    { symbol: 'e', romanization: 'e', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE_MID, backness: VowelBackness.FRONT, frequency: 0.10 },
    { symbol: 'i', romanization: 'i', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.FRONT, frequency: 0.10 },
    { symbol: 'o', romanization: 'o', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE_MID, backness: VowelBackness.BACK, rounded: true, frequency: 0.08 },
    { symbol: 'u', romanization: 'u', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.BACK, rounded: true, frequency: 0.06 },
    { symbol: 'p', romanization: 'p', type: PhonemeType.CONSONANT, place: ArticulationPlace.BILABIAL, manner: ArticulationManner.PLOSIVE, voiced: false, frequency: 0.04 },
    { symbol: 'b', romanization: 'b', type: PhonemeType.CONSONANT, place: ArticulationPlace.BILABIAL, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.04 },
    { symbol: 't', romanization: 't', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.PLOSIVE, voiced: false, frequency: 0.06 },
    { symbol: 'd', romanization: 'd', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.05 },
    { symbol: 'k', romanization: 'k', type: PhonemeType.CONSONANT, place: ArticulationPlace.VELAR, manner: ArticulationManner.PLOSIVE, voiced: false, frequency: 0.05 },
    { symbol: 'g', romanization: 'g', type: PhonemeType.CONSONANT, place: ArticulationPlace.VELAR, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.04 },
    { symbol: 'm', romanization: 'm', type: PhonemeType.CONSONANT, place: ArticulationPlace.BILABIAL, manner: ArticulationManner.NASAL, frequency: 0.05 },
    { symbol: 'n', romanization: 'n', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.NASAL, frequency: 0.06 },
    { symbol: 's', romanization: 's', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.FRICATIVE, voiced: false, frequency: 0.06 },
    { symbol: 'r', romanization: 'r', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.APPROXIMANT, frequency: 0.05 },
    { symbol: 'l', romanization: 'l', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.LATERAL_APPROXIMANT, frequency: 0.05 },
  ],

  alien: [
    // Unusual sounds - clicks, ejectives, etc.
    { symbol: 'ǃ', romanization: '!', type: PhonemeType.CLICK, frequency: 0.08 },
    { symbol: 'ǀ', romanization: '|', type: PhonemeType.CLICK, frequency: 0.06 },
    { symbol: 'ǂ', romanization: '||', type: PhonemeType.CLICK, frequency: 0.04 },
    { symbol: 'ɬ', romanization: 'tl', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.LATERAL_FRICATIVE, frequency: 0.06 },
    { symbol: 'q', romanization: 'q', type: PhonemeType.CONSONANT, place: ArticulationPlace.UVULAR, manner: ArticulationManner.PLOSIVE, voiced: false, frequency: 0.07 },
    { symbol: 'ħ', romanization: 'hh', type: PhonemeType.CONSONANT, place: ArticulationPlace.PHARYNGEAL, manner: ArticulationManner.FRICATIVE, frequency: 0.05 },
    { symbol: 'ʕ', romanization: 'aa', type: PhonemeType.CONSONANT, place: ArticulationPlace.PHARYNGEAL, manner: ArticulationManner.FRICATIVE, voiced: true, frequency: 0.04 },
    { symbol: 'ɨ', romanization: 'ï', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.CENTRAL, frequency: 0.08 },
    { symbol: 'ə', romanization: 'ë', type: PhonemeType.VOWEL, height: VowelHeight.MID, backness: VowelBackness.CENTRAL, frequency: 0.10 },
    { symbol: 'æ', romanization: 'ae', type: PhonemeType.VOWEL, height: VowelHeight.NEAR_OPEN, backness: VowelBackness.FRONT, frequency: 0.07 },
    { symbol: 'ʊ', romanization: 'ù', type: PhonemeType.VOWEL, height: VowelHeight.NEAR_CLOSE, backness: VowelBackness.BACK, rounded: true, frequency: 0.06 },
    { symbol: 'x', romanization: 'x', type: PhonemeType.CONSONANT, place: ArticulationPlace.VELAR, manner: ArticulationManner.FRICATIVE, voiced: false, frequency: 0.06 },
    { symbol: 'χ', romanization: 'xh', type: PhonemeType.CONSONANT, place: ArticulationPlace.UVULAR, manner: ArticulationManner.FRICATIVE, voiced: false, frequency: 0.05 },
    { symbol: 'n', romanization: 'n', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.NASAL, frequency: 0.05 },
    { symbol: 's', romanization: 's', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.FRICATIVE, voiced: false, frequency: 0.05 },
  ],

  ancient: [
    // Classical language style (Latin/Greek influenced)
    { symbol: 'a', romanization: 'a', type: PhonemeType.VOWEL, height: VowelHeight.OPEN, backness: VowelBackness.CENTRAL, frequency: 0.12 },
    { symbol: 'aː', romanization: 'ā', type: PhonemeType.VOWEL, height: VowelHeight.OPEN, backness: VowelBackness.CENTRAL, long: true, frequency: 0.06 },
    { symbol: 'e', romanization: 'e', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE_MID, backness: VowelBackness.FRONT, frequency: 0.10 },
    { symbol: 'eː', romanization: 'ē', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE_MID, backness: VowelBackness.FRONT, long: true, frequency: 0.05 },
    { symbol: 'i', romanization: 'i', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.FRONT, frequency: 0.08 },
    { symbol: 'iː', romanization: 'ī', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.FRONT, long: true, frequency: 0.04 },
    { symbol: 'o', romanization: 'o', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE_MID, backness: VowelBackness.BACK, rounded: true, frequency: 0.08 },
    { symbol: 'oː', romanization: 'ō', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE_MID, backness: VowelBackness.BACK, rounded: true, long: true, frequency: 0.04 },
    { symbol: 'u', romanization: 'u', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.BACK, rounded: true, frequency: 0.06 },
    { symbol: 'uː', romanization: 'ū', type: PhonemeType.VOWEL, height: VowelHeight.CLOSE, backness: VowelBackness.BACK, rounded: true, long: true, frequency: 0.03 },
    { symbol: 'p', romanization: 'p', type: PhonemeType.CONSONANT, place: ArticulationPlace.BILABIAL, manner: ArticulationManner.PLOSIVE, voiced: false, frequency: 0.04 },
    { symbol: 'b', romanization: 'b', type: PhonemeType.CONSONANT, place: ArticulationPlace.BILABIAL, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.03 },
    { symbol: 't', romanization: 't', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.PLOSIVE, voiced: false, frequency: 0.05 },
    { symbol: 'd', romanization: 'd', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.04 },
    { symbol: 'k', romanization: 'c', type: PhonemeType.CONSONANT, place: ArticulationPlace.VELAR, manner: ArticulationManner.PLOSIVE, voiced: false, frequency: 0.04 },
    { symbol: 'g', romanization: 'g', type: PhonemeType.CONSONANT, place: ArticulationPlace.VELAR, manner: ArticulationManner.PLOSIVE, voiced: true, frequency: 0.03 },
    { symbol: 'm', romanization: 'm', type: PhonemeType.CONSONANT, place: ArticulationPlace.BILABIAL, manner: ArticulationManner.NASAL, frequency: 0.04 },
    { symbol: 'n', romanization: 'n', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.NASAL, frequency: 0.05 },
    { symbol: 's', romanization: 's', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.FRICATIVE, voiced: false, frequency: 0.05 },
    { symbol: 'r', romanization: 'r', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.TRILL, frequency: 0.04 },
    { symbol: 'l', romanization: 'l', type: PhonemeType.CONSONANT, place: ArticulationPlace.ALVEOLAR, manner: ArticulationManner.LATERAL_APPROXIMANT, frequency: 0.04 },
  ]
};

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
// CORE VOCABULARY
// ============================================================================

const CORE_CONCEPTS: Record<SemanticDomain, string[]> = {
  [SemanticDomain.BODY]: ['head', 'eye', 'ear', 'nose', 'mouth', 'hand', 'foot', 'heart', 'blood', 'bone'],
  [SemanticDomain.KINSHIP]: ['mother', 'father', 'child', 'sibling', 'spouse', 'ancestor', 'clan', 'family', 'elder', 'youth'],
  [SemanticDomain.FOOD]: ['eat', 'drink', 'bread', 'meat', 'water', 'salt', 'fruit', 'grain', 'cook', 'hunger'],
  [SemanticDomain.NATURE]: ['sun', 'moon', 'star', 'sky', 'earth', 'water', 'fire', 'wind', 'rain', 'mountain'],
  [SemanticDomain.ANIMALS]: ['bird', 'fish', 'horse', 'dog', 'wolf', 'bear', 'deer', 'snake', 'dragon', 'beast'],
  [SemanticDomain.PLANTS]: ['tree', 'flower', 'grass', 'leaf', 'root', 'seed', 'forest', 'herb', 'vine', 'thorn'],
  [SemanticDomain.COLORS]: ['white', 'black', 'red', 'blue', 'green', 'gold', 'silver', 'dark', 'light', 'bright'],
  [SemanticDomain.NUMBERS]: ['one', 'two', 'three', 'four', 'five', 'many', 'few', 'all', 'none', 'half'],
  [SemanticDomain.TIME]: ['day', 'night', 'year', 'season', 'now', 'then', 'before', 'after', 'always', 'never'],
  [SemanticDomain.SPACE]: ['here', 'there', 'up', 'down', 'near', 'far', 'inside', 'outside', 'path', 'place'],
  [SemanticDomain.EMOTIONS]: ['love', 'hate', 'fear', 'joy', 'sorrow', 'anger', 'hope', 'pride', 'shame', 'peace'],
  [SemanticDomain.ACTIONS]: ['go', 'come', 'give', 'take', 'make', 'break', 'see', 'hear', 'speak', 'think'],
  [SemanticDomain.QUALITIES]: ['good', 'bad', 'big', 'small', 'old', 'new', 'strong', 'weak', 'true', 'false'],
  [SemanticDomain.SOCIAL]: ['king', 'lord', 'servant', 'friend', 'enemy', 'stranger', 'people', 'law', 'honor', 'oath'],
  [SemanticDomain.RELIGION]: ['god', 'spirit', 'soul', 'prayer', 'sacred', 'profane', 'blessing', 'curse', 'temple', 'priest'],
  [SemanticDomain.MAGIC]: ['spell', 'power', 'enchant', 'ward', 'summon', 'bind', 'channel', 'essence', 'rune', 'ritual'],
  [SemanticDomain.WARFARE]: ['sword', 'shield', 'arrow', 'battle', 'victory', 'defeat', 'warrior', 'army', 'siege', 'peace'],
  [SemanticDomain.TRADE]: ['gold', 'silver', 'buy', 'sell', 'price', 'merchant', 'market', 'coin', 'wealth', 'debt'],
  [SemanticDomain.CRAFTS]: ['forge', 'weave', 'build', 'carve', 'smith', 'tool', 'craft', 'art', 'skill', 'work'],
  [SemanticDomain.WEATHER]: ['rain', 'snow', 'storm', 'cloud', 'thunder', 'lightning', 'cold', 'hot', 'wind', 'fog']
};

// ============================================================================
// CONLANG ENGINE CLASS
// ============================================================================

export class ConlangEngine {
  private languages: Map<string, Language> = new Map();
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
  // LANGUAGE CRUD
  // ==========================================================================

  createLanguage(data: Partial<Language> & { name: string }): Language {
    const language: Language = {
      id: uuidv4(),
      name: data.name,
      nativeName: data.nativeName || data.name,
      familyType: data.familyType || LanguageFamily.ISOLATE,
      parentLanguage: data.parentLanguage,
      childLanguages: data.childLanguages || [],

      phonemes: data.phonemes || [],
      phonotactics: data.phonotactics || {
        syllableStructures: ['CV', 'CVC'],
        onsetClusters: [],
        codaClusters: [],
        vowelClusters: [],
        forbiddenSequences: [],
        stressPattern: 'penultimate'
      },
      soundChanges: data.soundChanges || [],

      morphologicalType: data.morphologicalType || MorphologicalType.FUSIONAL,
      morphemes: data.morphemes || [],

      wordOrder: data.wordOrder || WordOrder.SVO,
      cases: data.cases || [GrammaticalCase.NOMINATIVE, GrammaticalCase.ACCUSATIVE],
      genderSystem: data.genderSystem || GrammaticalGender.NONE,
      genderCount: data.genderCount,
      tenseSystem: data.tenseSystem || TenseSystem.PAST_PRESENT_FUTURE,
      aspects: data.aspects || [AspectType.PERFECTIVE, AspectType.IMPERFECTIVE],
      evidentiality: data.evidentiality || EvidentialityType.NONE,
      honorifics: data.honorifics || HonorificSystem.NONE,
      grammarRules: data.grammarRules || [],

      vocabulary: data.vocabulary || [],
      phrases: data.phrases || [],

      writingSystems: data.writingSystems || [],
      primaryWritingSystem: data.primaryWritingSystem,

      dialects: data.dialects || [],
      standardDialect: data.standardDialect,

      speakerPopulation: data.speakerPopulation,
      regions: data.regions || [],
      culturalContext: data.culturalContext,
      history: data.history,
      status: data.status || 'fictional',

      dateCreated: new Date(),
      lastModified: new Date(),
      notes: data.notes
    };

    this.languages.set(language.id, language);
    return language;
  }

  getLanguage(id: string): Language | undefined {
    return this.languages.get(id);
  }

  getAllLanguages(): Language[] {
    return Array.from(this.languages.values());
  }

  updateLanguage(id: string, updates: Partial<Language>): Language | undefined {
    const language = this.languages.get(id);
    if (!language) return undefined;

    const updated = { ...language, ...updates, lastModified: new Date() };
    this.languages.set(id, updated);
    return updated;
  }

  deleteLanguage(id: string): boolean {
    return this.languages.delete(id);
  }

  // ==========================================================================
  // PHONEME MANAGEMENT
  // ==========================================================================

  addPhoneme(languageId: string, phoneme: Partial<Phoneme> & { symbol: string; romanization: string }): Phoneme | undefined {
    const language = this.languages.get(languageId);
    if (!language) return undefined;

    const newPhoneme: Phoneme = {
      id: uuidv4(),
      symbol: phoneme.symbol,
      romanization: phoneme.romanization,
      type: phoneme.type || PhonemeType.CONSONANT,
      place: phoneme.place,
      manner: phoneme.manner,
      voiced: phoneme.voiced,
      height: phoneme.height,
      backness: phoneme.backness,
      rounded: phoneme.rounded,
      long: phoneme.long,
      nasalized: phoneme.nasalized,
      toneContour: phoneme.toneContour,
      frequency: phoneme.frequency ?? 0.05,
      notes: phoneme.notes
    };

    language.phonemes.push(newPhoneme);
    language.lastModified = new Date();
    return newPhoneme;
  }

  removePhoneme(languageId: string, phonemeId: string): boolean {
    const language = this.languages.get(languageId);
    if (!language) return false;

    const index = language.phonemes.findIndex(p => p.id === phonemeId);
    if (index === -1) return false;

    language.phonemes.splice(index, 1);
    language.lastModified = new Date();
    return true;
  }

  // ==========================================================================
  // WORD MANAGEMENT
  // ==========================================================================

  addWord(languageId: string, word: Partial<Word> & { lemma: string; romanization: string; category: WordCategory }): Word | undefined {
    const language = this.languages.get(languageId);
    if (!language) return undefined;

    const newWord: Word = {
      id: uuidv4(),
      lemma: word.lemma,
      pronunciation: word.pronunciation || word.romanization,
      romanization: word.romanization,
      category: word.category,
      meanings: word.meanings || [{
        definition: 'undefined',
        semanticDomain: SemanticDomain.ACTIONS
      }],
      etymology: word.etymology,
      inflections: word.inflections,
      derivations: word.derivations,
      synonyms: word.synonyms,
      antonyms: word.antonyms,
      collocations: word.collocations,
      frequency: word.frequency ?? 0.5,
      dateAdded: new Date(),
      notes: word.notes
    };

    language.vocabulary.push(newWord);
    language.lastModified = new Date();
    return newWord;
  }

  findWord(languageId: string, query: string): Word[] {
    const language = this.languages.get(languageId);
    if (!language) return [];

    const lowerQuery = query.toLowerCase();
    return language.vocabulary.filter(word =>
      word.lemma.toLowerCase().includes(lowerQuery) ||
      word.romanization.toLowerCase().includes(lowerQuery) ||
      word.meanings.some(m => m.definition.toLowerCase().includes(lowerQuery))
    );
  }

  // ==========================================================================
  // PHRASE MANAGEMENT
  // ==========================================================================

  addPhrase(languageId: string, phrase: Partial<Phrase> & { text: string; translation: string }): Phrase | undefined {
    const language = this.languages.get(languageId);
    if (!language) return undefined;

    const newPhrase: Phrase = {
      id: uuidv4(),
      text: phrase.text,
      pronunciation: phrase.pronunciation || phrase.text,
      romanization: phrase.romanization || phrase.text,
      translation: phrase.translation,
      literal: phrase.literal,
      gloss: phrase.gloss,
      category: phrase.category || 'other',
      usage: phrase.usage,
      cultural_notes: phrase.cultural_notes
    };

    language.phrases.push(newPhrase);
    language.lastModified = new Date();
    return newPhrase;
  }

  // ==========================================================================
  // WORD GENERATION
  // ==========================================================================

  generateWord(languageId: string, syllableCount?: number): string {
    const language = this.languages.get(languageId);
    if (!language || language.phonemes.length === 0) return '';

    const vowels = language.phonemes.filter(p => p.type === PhonemeType.VOWEL || p.type === PhonemeType.DIPHTHONG);
    const consonants = language.phonemes.filter(p => p.type === PhonemeType.CONSONANT);

    if (vowels.length === 0) return '';

    const structures = language.phonotactics.syllableStructures.length > 0
      ? language.phonotactics.syllableStructures
      : ['CV', 'CVC'];

    const count = syllableCount ?? this.random.nextInt(1, 4);
    let word = '';

    for (let i = 0; i < count; i++) {
      const structure = this.random.pick(structures);

      for (const char of structure) {
        if (char === 'C' && consonants.length > 0) {
          const weights = consonants.map(c => c.frequency);
          word += this.random.weightedPick(consonants, weights).romanization;
        } else if (char === 'V') {
          const weights = vowels.map(v => v.frequency);
          word += this.random.weightedPick(vowels, weights).romanization;
        }
      }
    }

    return word;
  }

  generateVocabulary(languageId: string, domain: SemanticDomain, count: number = 10): Word[] {
    const language = this.languages.get(languageId);
    if (!language) return [];

    const concepts = CORE_CONCEPTS[domain] || [];
    const words: Word[] = [];

    for (let i = 0; i < Math.min(count, concepts.length); i++) {
      const lemma = this.generateWord(languageId, this.random.nextInt(1, 3));
      const word = this.addWord(languageId, {
        lemma,
        romanization: lemma,
        category: this.getCategoryForDomain(domain),
        meanings: [{
          definition: concepts[i],
          semanticDomain: domain
        }],
        frequency: 0.5 + (this.random.next() * 0.5)
      });
      if (word) words.push(word);
    }

    return words;
  }

  private getCategoryForDomain(domain: SemanticDomain): WordCategory {
    switch (domain) {
      case SemanticDomain.ACTIONS:
        return WordCategory.VERB;
      case SemanticDomain.QUALITIES:
      case SemanticDomain.COLORS:
        return WordCategory.ADJECTIVE;
      case SemanticDomain.SPACE:
      case SemanticDomain.TIME:
        return WordCategory.ADVERB;
      case SemanticDomain.NUMBERS:
        return WordCategory.NUMERAL;
      default:
        return WordCategory.NOUN;
    }
  }

  // ==========================================================================
  // RANDOM LANGUAGE GENERATION
  // ==========================================================================

  generateRandomLanguage(options: LanguageGenerationOptions = {}): Language {
    if (options.seed !== undefined) {
      this.random.setSeed(options.seed);
    }

    const basedOn = options.basedOn || this.random.pick(['elvish', 'dwarven', 'orcish', 'human', 'alien', 'ancient'] as const);
    const preset = PHONEME_PRESETS[basedOn] || PHONEME_PRESETS.human;

    // Create phonemes from preset
    const phonemes: Phoneme[] = preset.map(p => ({
      id: uuidv4(),
      symbol: p.symbol!,
      romanization: p.romanization!,
      type: p.type!,
      place: p.place,
      manner: p.manner,
      voiced: p.voiced,
      height: p.height,
      backness: p.backness,
      rounded: p.rounded,
      long: p.long,
      nasalized: p.nasalized,
      toneContour: p.toneContour,
      frequency: p.frequency ?? 0.05
    }));

    // Determine complexity settings
    const complexity = options.phonemeComplexity || this.random.pick(['simple', 'moderate', 'complex']);

    let syllableStructures: string[];
    switch (complexity) {
      case 'simple':
        syllableStructures = ['CV', 'V'];
        break;
      case 'complex':
        syllableStructures = ['CV', 'CVC', 'CCVC', 'CVCC', 'CCV', 'VC'];
        break;
      default:
        syllableStructures = ['CV', 'CVC', 'VC', 'CCV'];
    }

    const phonotactics: Phonotactics = {
      syllableStructures,
      onsetClusters: complexity === 'complex' ? [['s', 't'], ['s', 'k'], ['t', 'r']] : [],
      codaClusters: complexity === 'complex' ? [['n', 't'], ['s', 't'], ['r', 'k']] : [],
      vowelClusters: [],
      forbiddenSequences: [],
      stressPattern: this.random.pick(['initial', 'final', 'penultimate', 'antepenultimate'])
    };

    // Grammar settings
    const wordOrder = options.wordOrder || this.random.pick([
      WordOrder.SVO, WordOrder.SOV, WordOrder.VSO, WordOrder.FREE
    ]);

    const morphologicalType = options.morphologicalType || this.random.pick([
      MorphologicalType.ISOLATING, MorphologicalType.AGGLUTINATIVE,
      MorphologicalType.FUSIONAL, MorphologicalType.POLYSYNTHETIC
    ]);

    const caseCount = options.caseCount ?? this.random.nextInt(2, 8);
    const allCases = Object.values(GrammaticalCase);
    const cases = this.random.pickMultiple(allCases, caseCount);

    const genderSystem = options.genderSystem || this.random.pick([
      GrammaticalGender.NONE,
      GrammaticalGender.MASCULINE_FEMININE,
      GrammaticalGender.MASCULINE_FEMININE_NEUTER,
      GrammaticalGender.ANIMATE_INANIMATE
    ]);

    // Create the language
    const language = this.createLanguage({
      name: options.name || this.generateLanguageName(basedOn),
      nativeName: this.generateWord(uuidv4(), 2) || 'unnamed',
      familyType: LanguageFamily.ISOLATE,

      phonemes,
      phonotactics,

      morphologicalType,
      wordOrder,
      cases,
      genderSystem,
      tenseSystem: this.random.pick([
        TenseSystem.PAST_NONPAST,
        TenseSystem.PAST_PRESENT_FUTURE,
        TenseSystem.ASPECT_BASED
      ]),
      aspects: this.random.pickMultiple(Object.values(AspectType), this.random.nextInt(2, 5)),
      evidentiality: this.random.pick([
        EvidentialityType.NONE,
        EvidentialityType.DIRECT,
        EvidentialityType.NONE
      ]),
      honorifics: this.random.pick([
        HonorificSystem.NONE,
        HonorificSystem.SIMPLE,
        HonorificSystem.COMPLEX
      ]),

      status: 'fictional',
      notes: `Generated language based on ${basedOn} phoneme set with ${complexity} complexity.`
    });

    // Update native name using actual phonemes
    language.nativeName = this.generateWord(language.id, 2) || language.name;

    // Generate initial vocabulary
    const domains = [SemanticDomain.BODY, SemanticDomain.NATURE, SemanticDomain.ACTIONS, SemanticDomain.KINSHIP];
    for (const domain of domains) {
      this.generateVocabulary(language.id, domain, 10);
    }

    // Generate writing system if requested
    if (options.includeWritingSystem !== false) {
      this.generateWritingSystem(language.id);
    }

    // Generate basic phrases
    this.generateBasicPhrases(language.id);

    return language;
  }

  private generateLanguageName(basedOn: string): string {
    const suffixes: Record<string, string[]> = {
      elvish: ['ien', 'arin', 'ellon', 'andor', 'ithil'],
      dwarven: ['ak', 'rik', 'kun', 'thor', 'grim'],
      orcish: ['agh', 'uruk', 'gash', 'zug', 'rog'],
      human: ['ian', 'ish', 'ese', 'ic', 'an'],
      alien: ['xis', 'qon', 'thex', 'zhar', 'vex'],
      ancient: ['um', 'us', 'ae', 'orum', 'ensis']
    };

    const roots: Record<string, string[]> = {
      elvish: ['Sil', 'Quel', 'Fal', 'Tel', 'Lor'],
      dwarven: ['Kaz', 'Dor', 'Gim', 'Bar', 'Thor'],
      orcish: ['Gul', 'Mor', 'Zag', 'Kro', 'Gor'],
      human: ['Nord', 'West', 'East', 'South', 'Common'],
      alien: ['X\'th', 'Qar', 'Vex', 'Z\'rel', 'Tch\''],
      ancient: ['Ver', 'Lat', 'Arc', 'Prim', 'Vetus']
    };

    const rootList = roots[basedOn] || roots.human;
    const suffixList = suffixes[basedOn] || suffixes.human;

    return this.random.pick(rootList) + this.random.pick(suffixList);
  }

  // ==========================================================================
  // WRITING SYSTEM GENERATION
  // ==========================================================================

  generateWritingSystem(languageId: string): WritingSystem | undefined {
    const language = this.languages.get(languageId);
    if (!language) return undefined;

    const type = this.random.pick([
      WritingSystemType.ALPHABET,
      WritingSystemType.ABJAD,
      WritingSystemType.SYLLABARY,
      WritingSystemType.ABUGIDA
    ]);

    const direction = this.random.pick([
      WritingDirection.LEFT_TO_RIGHT,
      WritingDirection.RIGHT_TO_LEFT,
      WritingDirection.TOP_TO_BOTTOM
    ]);

    const characters: { symbol: string; phoneme?: string; name?: string }[] = [];

    // Create characters based on writing system type
    if (type === WritingSystemType.ALPHABET) {
      // One character per phoneme
      for (const phoneme of language.phonemes) {
        characters.push({
          symbol: this.generateGlyph(),
          phoneme: phoneme.symbol,
          name: phoneme.romanization
        });
      }
    } else if (type === WritingSystemType.SYLLABARY) {
      // Generate syllable characters
      const vowels = language.phonemes.filter(p => p.type === PhonemeType.VOWEL);
      const consonants = language.phonemes.filter(p => p.type === PhonemeType.CONSONANT);

      for (const c of consonants.slice(0, 10)) {
        for (const v of vowels.slice(0, 5)) {
          characters.push({
            symbol: this.generateGlyph(),
            phoneme: c.romanization + v.romanization,
            name: c.romanization + v.romanization
          });
        }
      }
    } else {
      // Simplified version for other types
      for (const phoneme of language.phonemes) {
        characters.push({
          symbol: this.generateGlyph(),
          phoneme: phoneme.symbol,
          name: phoneme.romanization
        });
      }
    }

    const writingSystem: WritingSystem = {
      id: uuidv4(),
      name: `${language.name} Script`,
      type,
      direction,
      characters,
      punctuation: [
        { symbol: '•', usage: 'Period/full stop' },
        { symbol: ':', usage: 'Question' },
        { symbol: '|', usage: 'Pause/comma' }
      ],
      numerals: ['∅', '|', '||', '|||', '||||', '⁂', '⁂|', '⁂||', '⁂|||', '⁂||||'],
      description: `A ${type} writing system written ${direction === 'ltr' ? 'left to right' : direction === 'rtl' ? 'right to left' : 'top to bottom'}.`
    };

    language.writingSystems.push(writingSystem);
    language.primaryWritingSystem = writingSystem.id;
    language.lastModified = new Date();

    return writingSystem;
  }

  private generateGlyph(): string {
    // Use Unicode combining characters and geometric shapes to create unique glyphs
    const bases = ['○', '△', '□', '◇', '☆', '∞', '⊕', '⊗', '⊙', '⊚',
                   'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'λ', 'μ',
                   'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ'];
    const modifiers = ['', '̄', '̃', '̇', '̈', '̊', '̌', '́', '̀', '̂'];

    return this.random.pick(bases) + this.random.pick(modifiers);
  }

  // ==========================================================================
  // PHRASE GENERATION
  // ==========================================================================

  generateBasicPhrases(languageId: string): Phrase[] {
    const language = this.languages.get(languageId);
    if (!language) return [];

    const basicPhrases = [
      { translation: 'Hello', category: 'greeting' as const },
      { translation: 'Goodbye', category: 'farewell' as const },
      { translation: 'Thank you', category: 'thanks' as const },
      { translation: 'Please', category: 'other' as const },
      { translation: 'Yes', category: 'other' as const },
      { translation: 'No', category: 'other' as const },
      { translation: 'What is your name?', category: 'question' as const },
      { translation: 'My name is...', category: 'other' as const },
      { translation: 'I don\'t understand', category: 'other' as const },
      { translation: 'Help!', category: 'exclamation' as const }
    ];

    const phrases: Phrase[] = [];

    for (const phrase of basicPhrases) {
      const text = this.generatePhrase(languageId, phrase.translation.split(' ').length);
      const newPhrase = this.addPhrase(languageId, {
        text,
        romanization: text,
        translation: phrase.translation,
        category: phrase.category
      });
      if (newPhrase) phrases.push(newPhrase);
    }

    return phrases;
  }

  generatePhrase(languageId: string, wordCount: number): string {
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(this.generateWord(languageId, this.random.nextInt(1, 3)));
    }
    return words.join(' ');
  }

  // ==========================================================================
  // TRANSLATION
  // ==========================================================================

  translate(languageId: string, text: string): TranslationResult {
    const language = this.languages.get(languageId);
    if (!language) {
      return {
        original: text,
        translated: '',
        pronunciation: '',
        romanization: '',
        confidence: 0,
        unknownWords: text.split(/\s+/)
      };
    }

    const words = text.toLowerCase().split(/\s+/);
    const translatedWords: { original: string; translated: string }[] = [];
    const unknownWords: string[] = [];

    for (const word of words) {
      // Look up word in vocabulary by meaning
      const found = language.vocabulary.find(v =>
        v.meanings.some(m => m.definition.toLowerCase() === word)
      );

      if (found) {
        translatedWords.push({ original: word, translated: found.romanization });
      } else {
        // Generate a new word for unknown concepts
        const generated = this.generateWord(languageId, Math.max(1, Math.ceil(word.length / 3)));
        translatedWords.push({ original: word, translated: generated });
        unknownWords.push(word);
      }
    }

    const translated = translatedWords.map(w => w.translated).join(' ');
    const confidence = (words.length - unknownWords.length) / words.length;

    return {
      original: text,
      translated,
      pronunciation: translated,
      romanization: translated,
      wordByWord: translatedWords,
      confidence,
      unknownWords: unknownWords.length > 0 ? unknownWords : undefined
    };
  }

  // ==========================================================================
  // SOUND CHANGES
  // ==========================================================================

  addSoundChange(languageId: string, change: Partial<SoundChange> & { name: string; inputPattern: string; outputPattern: string }): SoundChange | undefined {
    const language = this.languages.get(languageId);
    if (!language) return undefined;

    const soundChange: SoundChange = {
      id: uuidv4(),
      name: change.name,
      description: change.description || '',
      inputPattern: change.inputPattern,
      outputPattern: change.outputPattern,
      environment: change.environment,
      exceptions: change.exceptions,
      historical: change.historical ?? false,
      active: change.active ?? true
    };

    if (!language.soundChanges) language.soundChanges = [];
    language.soundChanges.push(soundChange);
    language.lastModified = new Date();

    return soundChange;
  }

  applySoundChanges(languageId: string, word: string): string {
    const language = this.languages.get(languageId);
    if (!language || !language.soundChanges) return word;

    let result = word;

    for (const change of language.soundChanges) {
      if (!change.active) continue;

      try {
        const regex = new RegExp(change.inputPattern, 'g');
        result = result.replace(regex, change.outputPattern);
      } catch {
        // Invalid regex, skip
      }
    }

    return result;
  }

  // ==========================================================================
  // LANGUAGE EVOLUTION
  // ==========================================================================

  deriveLanguage(parentId: string, options: { name: string; changes?: SoundChange[] }): Language | undefined {
    const parent = this.languages.get(parentId);
    if (!parent) return undefined;

    // Create child language with copied phonemes and vocabulary
    const child = this.createLanguage({
      name: options.name,
      nativeName: this.generateWord(parentId, 2) || options.name,
      familyType: LanguageFamily.DAUGHTER,
      parentLanguage: parentId,

      phonemes: parent.phonemes.map(p => ({ ...p, id: uuidv4() })),
      phonotactics: { ...parent.phonotactics },
      soundChanges: options.changes || [],

      morphologicalType: parent.morphologicalType,
      wordOrder: parent.wordOrder,
      cases: [...parent.cases],
      genderSystem: parent.genderSystem,
      tenseSystem: parent.tenseSystem,
      aspects: [...parent.aspects],
      evidentiality: parent.evidentiality,
      honorifics: parent.honorifics,

      status: 'fictional',
      notes: `Derived from ${parent.name}`
    });

    // Copy and evolve vocabulary
    for (const word of parent.vocabulary) {
      let evolvedLemma = word.lemma;

      // Apply sound changes
      if (options.changes) {
        for (const change of options.changes) {
          try {
            const regex = new RegExp(change.inputPattern, 'g');
            evolvedLemma = evolvedLemma.replace(regex, change.outputPattern);
          } catch {
            // Invalid regex, skip
          }
        }
      }

      this.addWord(child.id, {
        lemma: evolvedLemma,
        romanization: evolvedLemma,
        category: word.category,
        meanings: word.meanings.map(m => ({ ...m })),
        etymology: {
          origin: word.lemma,
          notes: `From ${parent.name} ${word.lemma}`
        },
        frequency: word.frequency
      });
    }

    // Update parent's child list
    if (!parent.childLanguages) parent.childLanguages = [];
    parent.childLanguages.push(child.id);
    parent.lastModified = new Date();

    return child;
  }

  // ==========================================================================
  // DIALECT CREATION
  // ==========================================================================

  createDialect(languageId: string, dialect: Partial<Dialect> & { name: string }): Dialect | undefined {
    const language = this.languages.get(languageId);
    if (!language) return undefined;

    const newDialect: Dialect = {
      id: uuidv4(),
      name: dialect.name,
      region: dialect.region,
      speakers: dialect.speakers,
      phonemeChanges: dialect.phonemeChanges || {},
      vocabularyChanges: dialect.vocabularyChanges || {},
      grammaticalDifferences: dialect.grammaticalDifferences,
      socialStatus: dialect.socialStatus || 'regional',
      notes: dialect.notes
    };

    language.dialects.push(newDialect);
    language.lastModified = new Date();

    return newDialect;
  }

  // ==========================================================================
  // GRAMMAR RULES
  // ==========================================================================

  addGrammarRule(languageId: string, rule: Partial<GrammarRule> & { name: string; rule: string }): GrammarRule | undefined {
    const language = this.languages.get(languageId);
    if (!language) return undefined;

    const grammarRule: GrammarRule = {
      id: uuidv4(),
      name: rule.name,
      description: rule.description || '',
      category: rule.category || 'syntax',
      rule: rule.rule,
      examples: rule.examples || [],
      exceptions: rule.exceptions,
      notes: rule.notes
    };

    language.grammarRules.push(grammarRule);
    language.lastModified = new Date();

    return grammarRule;
  }

  // ==========================================================================
  // MORPHEME MANAGEMENT
  // ==========================================================================

  addMorpheme(languageId: string, morpheme: Partial<Morpheme> & { form: string; meaning: string }): Morpheme | undefined {
    const language = this.languages.get(languageId);
    if (!language) return undefined;

    const newMorpheme: Morpheme = {
      id: uuidv4(),
      form: morpheme.form,
      meaning: morpheme.meaning,
      type: morpheme.type || 'root',
      category: morpheme.category,
      semanticDomain: morpheme.semanticDomain,
      allomorphs: morpheme.allomorphs,
      notes: morpheme.notes
    };

    language.morphemes.push(newMorpheme);
    language.lastModified = new Date();

    return newMorpheme;
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getLanguageStats(languageId: string): Record<string, any> | undefined {
    const language = this.languages.get(languageId);
    if (!language) return undefined;

    const vowels = language.phonemes.filter(p => p.type === PhonemeType.VOWEL || p.type === PhonemeType.DIPHTHONG);
    const consonants = language.phonemes.filter(p => p.type === PhonemeType.CONSONANT);

    const wordCategories: Record<string, number> = {};
    for (const word of language.vocabulary) {
      wordCategories[word.category] = (wordCategories[word.category] || 0) + 1;
    }

    const semanticDomains: Record<string, number> = {};
    for (const word of language.vocabulary) {
      for (const meaning of word.meanings) {
        semanticDomains[meaning.semanticDomain] = (semanticDomains[meaning.semanticDomain] || 0) + 1;
      }
    }

    return {
      name: language.name,
      nativeName: language.nativeName,
      phonemeCount: language.phonemes.length,
      vowelCount: vowels.length,
      consonantCount: consonants.length,
      vocabularySize: language.vocabulary.length,
      phraseCount: language.phrases.length,
      morphemeCount: language.morphemes.length,
      grammarRuleCount: language.grammarRules.length,
      dialectCount: language.dialects.length,
      writingSystemCount: language.writingSystems.length,
      wordCategories,
      semanticDomains,
      morphologicalType: language.morphologicalType,
      wordOrder: language.wordOrder,
      caseCount: language.cases.length,
      genderSystem: language.genderSystem
    };
  }

  // ==========================================================================
  // EXPORT / IMPORT
  // ==========================================================================

  exportLanguage(languageId: string): string {
    const language = this.languages.get(languageId);
    if (!language) return '';
    return JSON.stringify(language, null, 2);
  }

  exportAllLanguages(): string {
    return JSON.stringify(Array.from(this.languages.values()), null, 2);
  }

  importLanguage(json: string): Language | undefined {
    try {
      const data = JSON.parse(json);
      data.id = uuidv4();
      data.dateCreated = new Date();
      data.lastModified = new Date();
      this.languages.set(data.id, data);
      return data;
    } catch {
      return undefined;
    }
  }

  // ==========================================================================
  // MARKDOWN GENERATION
  // ==========================================================================

  generateMarkdown(languageId: string): string {
    const language = this.languages.get(languageId);
    if (!language) return '';

    const stats = this.getLanguageStats(languageId);

    let md = `# ${language.name}\n\n`;
    md += `**Native Name:** ${language.nativeName}\n\n`;
    md += `**Status:** ${language.status}\n\n`;

    if (language.culturalContext) {
      md += `## Cultural Context\n\n${language.culturalContext}\n\n`;
    }

    if (language.history) {
      md += `## History\n\n${language.history}\n\n`;
    }

    // Typology
    md += `## Typology\n\n`;
    md += `- **Morphological Type:** ${language.morphologicalType}\n`;
    md += `- **Word Order:** ${language.wordOrder}\n`;
    md += `- **Cases:** ${language.cases.join(', ')}\n`;
    md += `- **Gender System:** ${language.genderSystem}\n`;
    md += `- **Tense System:** ${language.tenseSystem}\n`;
    md += `- **Honorific System:** ${language.honorifics}\n\n`;

    // Phonology
    md += `## Phonology\n\n`;
    md += `### Inventory\n\n`;
    md += `- **Vowels (${stats?.vowelCount}):** ${language.phonemes.filter(p => p.type === PhonemeType.VOWEL).map(p => p.romanization).join(', ')}\n`;
    md += `- **Consonants (${stats?.consonantCount}):** ${language.phonemes.filter(p => p.type === PhonemeType.CONSONANT).map(p => p.romanization).join(', ')}\n\n`;

    md += `### Phonotactics\n\n`;
    md += `- **Syllable Structures:** ${language.phonotactics.syllableStructures.join(', ')}\n`;
    md += `- **Stress Pattern:** ${language.phonotactics.stressPattern}\n\n`;

    // Writing Systems
    if (language.writingSystems.length > 0) {
      md += `## Writing Systems\n\n`;
      for (const ws of language.writingSystems) {
        md += `### ${ws.name}\n\n`;
        md += `- **Type:** ${ws.type}\n`;
        md += `- **Direction:** ${ws.direction}\n`;
        md += `- **Characters:** ${ws.characters.length}\n\n`;
        if (ws.description) {
          md += `${ws.description}\n\n`;
        }
      }
    }

    // Vocabulary Sample
    if (language.vocabulary.length > 0) {
      md += `## Vocabulary Sample\n\n`;
      md += `| Word | Meaning | Category |\n`;
      md += `|------|---------|----------|\n`;

      const sample = language.vocabulary.slice(0, 20);
      for (const word of sample) {
        md += `| ${word.romanization} | ${word.meanings[0]?.definition || 'N/A'} | ${word.category} |\n`;
      }
      md += `\n*Total vocabulary: ${language.vocabulary.length} words*\n\n`;
    }

    // Phrases
    if (language.phrases.length > 0) {
      md += `## Common Phrases\n\n`;
      md += `| Phrase | Translation | Category |\n`;
      md += `|--------|-------------|----------|\n`;

      for (const phrase of language.phrases) {
        md += `| ${phrase.romanization} | ${phrase.translation} | ${phrase.category} |\n`;
      }
      md += `\n`;
    }

    // Grammar Rules
    if (language.grammarRules.length > 0) {
      md += `## Grammar Rules\n\n`;
      for (const rule of language.grammarRules) {
        md += `### ${rule.name}\n\n`;
        md += `${rule.description || rule.rule}\n\n`;
        if (rule.examples.length > 0) {
          md += `**Examples:**\n`;
          for (const ex of rule.examples) {
            md += `- ${ex.input} → ${ex.output}${ex.gloss ? ` (${ex.gloss})` : ''}\n`;
          }
          md += `\n`;
        }
      }
    }

    // Dialects
    if (language.dialects.length > 0) {
      md += `## Dialects\n\n`;
      for (const dialect of language.dialects) {
        md += `### ${dialect.name}\n\n`;
        if (dialect.region) md += `- **Region:** ${dialect.region}\n`;
        if (dialect.speakers) md += `- **Speakers:** ${dialect.speakers}\n`;
        if (dialect.socialStatus) md += `- **Status:** ${dialect.socialStatus}\n`;
        md += `\n`;
      }
    }

    if (language.notes) {
      md += `## Notes\n\n${language.notes}\n`;
    }

    return md;
  }

  // ==========================================================================
  // INTEGRATION HELPERS
  // ==========================================================================

  /**
   * Generate culture-appropriate names using this language
   */
  generateCulturalNames(languageId: string, count: number = 10): string[] {
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const syllables = this.random.nextInt(2, 4);
      names.push(this.generateWord(languageId, syllables));
    }
    return names;
  }

  /**
   * Generate place names using this language
   */
  generatePlaceNames(languageId: string, count: number = 10): string[] {
    const language = this.languages.get(languageId);
    if (!language) return [];

    const names: string[] = [];
    const suffixes = ['ton', 'burg', 'ville', 'ford', 'heim', 'grad', 'polis'];

    for (let i = 0; i < count; i++) {
      const root = this.generateWord(languageId, this.random.nextInt(1, 2));
      if (this.random.next() > 0.5) {
        // Add a suffix
        names.push(root + this.random.pick(suffixes));
      } else {
        names.push(root);
      }
    }

    return names;
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export const conlangEngine = new ConlangEngine();
