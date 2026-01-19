/**
 * Epic Fiction Architect - Writing Rules Engine
 *
 * Detects banned constructions, phrases, and patterns based on
 * professional fiction writing standards ("Show Don't Tell" philosophy).
 */

export {
  WritingRulesEngine,
  default,
  BANNED_CONSTRUCTIONS,
  BANNED_PHRASES,
  SEARCH_PATTERNS,
  EROTICA_RULES
} from './writing-rules';

export type {
  BannedConstruction,
  ConstructionCategory,
  BannedPhrase,
  PhraseCategory,
  SearchPattern,
  EroticaRule,
  EroticaCategory,
  RuleViolation,
  RulesAnalysisResult,
  WritingRulesOptions
} from './writing-rules';
