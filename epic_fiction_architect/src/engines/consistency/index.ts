/**
 * Epic Fiction Architect - Consistency Engine
 *
 * Automated contradiction detection and narrative consistency enforcement.
 */

export {
  ConsistencyChecker,
  default
} from './checker';

export type {
  ConsistencyViolation,
  ViolationType,
  ViolationCategory,
  ConflictingFact,
  FactSource,
  TrackedFact,
  ConsistencyRule,
  RuleContext,
  SceneContext,
  CharacterContext,
  WorldRule,
  RuleConstraint,
  ConsistencyCheckResult
} from './checker';
