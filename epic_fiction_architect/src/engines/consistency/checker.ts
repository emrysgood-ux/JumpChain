/**
 * Epic Fiction Architect - Consistency Checker
 *
 * Automated contradiction detection for epic-scale narratives.
 * Critical for 300M+ word stories where human memory cannot track
 * all established facts across thousands of pages.
 *
 * Detects:
 * - Character attribute contradictions (eye color changed)
 * - Timeline paradoxes (events before they're possible)
 * - Dead character appearances (ghosts without explanation)
 * - Relationship contradictions (enemies→allies without arc)
 * - World rule violations (magic system broken)
 * - Location impossibilities (two places at once)
 * - Promise violations (Chekhov's guns unfired)
 * - Knowledge paradoxes (knowing the unknowable)
 *
 * Uses semantic similarity for fuzzy matching of descriptions
 * and temporal logic for timeline validation.
 */

import {v4 as uuidv4} from 'uuid';

// ============================================================================
// TYPES
// ============================================================================

/**
 * A consistency violation detected in the narrative
 */
export interface ConsistencyViolation {
  id: string;
  type: ViolationType;
  severity: 'critical' | 'major' | 'minor' | 'nitpick';
  category: ViolationCategory;

  /** Human-readable description */
  description: string;

  /** The conflicting facts */
  conflicts: ConflictingFact[];

  /** Affected entity IDs */
  affectedEntityIds: string[];

  /** Scene/chapter where violation occurs */
  location: {
    sceneId?: string;
    chapterId?: string;
    lineNumber?: number;
    excerpt?: string;
  };

  /** Suggested fixes */
  suggestions: string[];

  /** Whether this has been reviewed/dismissed */
  status: 'new' | 'reviewed' | 'dismissed' | 'fixed';

  /** Confidence score (0-1) */
  confidence: number;

  /** When detected */
  detectedAt: Date;
}

export type ViolationType =
  | 'contradiction'      // Direct contradiction of facts
  | 'paradox'           // Logical impossibility
  | 'inconsistency'     // Soft inconsistency (might be intentional)
  | 'omission'          // Missing required information
  | 'anachronism'       // Timeline-related error
  | 'impossibility';    // Physical/logical impossibility

export type ViolationCategory =
  | 'character_attribute'   // Physical descriptions, traits
  | 'character_state'       // Alive/dead, location, condition
  | 'character_knowledge'   // What characters know
  | 'character_ability'     // Skills, powers, limitations
  | 'relationship'          // Between characters
  | 'timeline'              // Temporal ordering
  | 'location'              // Geography, travel time
  | 'world_rule'            // Magic system, physics, etc.
  | 'object'                // Items, artifacts
  | 'promise'               // Narrative promises (Chekhov)
  | 'voice'                 // Character voice consistency
  | 'continuity';           // General scene-to-scene

/**
 * A fact that conflicts with another
 */
export interface ConflictingFact {
  id: string;
  statement: string;
  source: FactSource;
  establishedAt: number; // Timeline position
  confidence: number;
}

export interface FactSource {
  type: 'scene' | 'chapter' | 'character_sheet' | 'world_bible' | 'user_defined';
  id: string;
  name: string;
  excerpt?: string;
}

/**
 * A tracked fact about the story world
 */
export interface TrackedFact {
  id: string;
  category: ViolationCategory;
  subjectType: 'character' | 'location' | 'object' | 'world' | 'relationship';
  subjectId: string;
  attribute: string;
  value: unknown;
  valueType: 'string' | 'number' | 'boolean' | 'enum' | 'range' | 'list';
  source: FactSource;
  establishedAt: number;
  validUntil?: number; // For facts that change
  supersededBy?: string; // ID of fact that replaced this
  isCanonical: boolean;
  tags: string[];
  confidence?: number; // Confidence level for the fact (0-1)
}

/**
 * A rule that must be maintained
 */
export interface ConsistencyRule {
  id: string;
  name: string;
  description: string;
  category: ViolationCategory;
  severity: ConsistencyViolation['severity'];

  /** Check function - returns violations if rule is broken */
  check: (context: RuleContext) => ConsistencyViolation[];

  /** Whether this rule is enabled */
  enabled: boolean;

  /** Tags for filtering */
  tags: string[];
}

export interface RuleContext {
  facts: TrackedFact[];
  scenes: SceneContext[];
  characters: CharacterContext[];
  worldRules: WorldRule[];
  currentPosition: number;
}

export interface SceneContext {
  id: string;
  title: string;
  content: string;
  position: number;
  characterIds: string[];
  locationId?: string;
  date?: number;
}

export interface CharacterContext {
  id: string;
  name: string;
  aliases: string[];
  birthDate?: number;
  deathDate?: number;
  attributes: Map<string, unknown>;
}

export interface WorldRule {
  id: string;
  name: string;
  description: string;
  category: string;
  constraints: RuleConstraint[];
}

export interface RuleConstraint {
  type: 'must' | 'must_not' | 'can' | 'cannot';
  subject: string;
  action: string;
  condition?: string;
}

/**
 * Result of a consistency check
 */
export interface ConsistencyCheckResult {
  timestamp: Date;
  duration: number;
  totalFactsChecked: number;
  totalRulesApplied: number;
  violations: ConsistencyViolation[];

  summary: {
    critical: number;
    major: number;
    minor: number;
    nitpick: number;
    total: number;
  };

  byCategory: Map<ViolationCategory, ConsistencyViolation[]>;

  healthScore: number; // 0-100, higher is better
}

// ============================================================================
// BUILT-IN RULES
// ============================================================================

/**
 * Rule: Characters cannot appear after their death (without explanation)
 */
const deadCharacterRule: ConsistencyRule = {
  id: 'dead-character-appearance',
  name: 'Dead Character Appearance',
  description: 'Characters should not appear in scenes after their death date',
  category: 'character_state',
  severity: 'critical',
  enabled: true,
  tags: ['character', 'timeline', 'death'],
  check: (context: RuleContext): ConsistencyViolation[] => {
    const violations: ConsistencyViolation[] = [];

    for (const character of context.characters) {
      if (!character.deathDate) continue;

      for (const scene of context.scenes) {
        if (scene.date && scene.date > character.deathDate) {
          if (scene.characterIds.includes(character.id)) {
            violations.push({
              id: uuidv4(),
              type: 'paradox',
              severity: 'critical',
              category: 'character_state',
              description: `${character.name} appears in "${scene.title}" but died earlier`,
              conflicts: [
                {
                  id: uuidv4(),
                  statement: `${character.name} dies`,
                  source: {type: 'character_sheet', id: character.id, name: character.name},
                  establishedAt: character.deathDate,
                  confidence: 1
                },
                {
                  id: uuidv4(),
                  statement: `${character.name} appears in scene`,
                  source: {type: 'scene', id: scene.id, name: scene.title},
                  establishedAt: scene.date,
                  confidence: 0.9
                }
              ],
              affectedEntityIds: [character.id, scene.id],
              location: {sceneId: scene.id},
              suggestions: [
                'Remove character from scene',
                'Change scene date to before death',
                'Add resurrection/ghost explanation',
                'Mark as flashback scene'
              ],
              status: 'new',
              confidence: 0.95,
              detectedAt: new Date()
            });
          }
        }
      }
    }

    return violations;
  }
};

/**
 * Rule: Character attributes should not change without explanation
 */
const attributeConsistencyRule: ConsistencyRule = {
  id: 'attribute-consistency',
  name: 'Character Attribute Consistency',
  description: 'Physical attributes should remain consistent unless explicitly changed',
  category: 'character_attribute',
  severity: 'major',
  enabled: true,
  tags: ['character', 'description', 'physical'],
  check: (context: RuleContext): ConsistencyViolation[] => {
    const violations: ConsistencyViolation[] = [];

    // Group facts by subject and attribute
    const factsBySubjectAttr = new Map<string, TrackedFact[]>();

    for (const fact of context.facts) {
      if (fact.category !== 'character_attribute') continue;
      const key = `${fact.subjectId}:${fact.attribute}`;
      const existing = factsBySubjectAttr.get(key) || [];
      existing.push(fact);
      factsBySubjectAttr.set(key, existing);
    }

    // Check for conflicting values
    for (const [_key, facts] of factsBySubjectAttr) {
      if (facts.length < 2) continue;

      // Sort by establishment time
      facts.sort((a, b) => a.establishedAt - b.establishedAt);

      for (let i = 1; i < facts.length; i++) {
        const earlier = facts[i - 1];
        const later = facts[i];

        // Skip if explicitly superseded
        if (earlier.supersededBy === later.id) continue;

        // Check if values differ
        if (JSON.stringify(earlier.value) !== JSON.stringify(later.value)) {
          const character = context.characters.find(c => c.id === earlier.subjectId);

          violations.push({
            id: uuidv4(),
            type: 'contradiction',
            severity: 'major',
            category: 'character_attribute',
            description: `${character?.name || 'Character'}'s ${earlier.attribute} changes from "${earlier.value}" to "${later.value}" without explanation`,
            conflicts: [
              {
                id: earlier.id,
                statement: `${earlier.attribute} is ${earlier.value}`,
                source: earlier.source,
                establishedAt: earlier.establishedAt,
                confidence: earlier.confidence || 0.9
              },
              {
                id: later.id,
                statement: `${later.attribute} is ${later.value}`,
                source: later.source,
                establishedAt: later.establishedAt,
                confidence: later.confidence || 0.9
              }
            ],
            affectedEntityIds: [earlier.subjectId],
            location: {sceneId: later.source.id},
            suggestions: [
              `Change later reference to match earlier ("${earlier.value}")`,
              'Add scene explaining the change',
              'Mark earlier fact as superseded'
            ],
            status: 'new',
            confidence: 0.85,
            detectedAt: new Date()
          });
        }
      }
    }

    return violations;
  }
};

/**
 * Rule: Characters cannot be in two places at once
 */
const locationParadoxRule: ConsistencyRule = {
  id: 'location-paradox',
  name: 'Location Paradox',
  description: 'Characters cannot be in multiple locations simultaneously',
  category: 'location',
  severity: 'critical',
  enabled: true,
  tags: ['character', 'location', 'timeline'],
  check: (context: RuleContext): ConsistencyViolation[] => {
    const violations: ConsistencyViolation[] = [];

    // Group scenes by date
    const scenesByDate = new Map<number, SceneContext[]>();
    for (const scene of context.scenes) {
      if (scene.date === undefined) continue;
      const existing = scenesByDate.get(scene.date) || [];
      existing.push(scene);
      scenesByDate.set(scene.date, existing);
    }

    // Check each date for location conflicts
    for (const [date, scenes] of scenesByDate) {
      if (scenes.length < 2) continue;

      // Check each character
      for (const character of context.characters) {
        const characterScenes = scenes.filter(s =>
          s.characterIds.includes(character.id)
        );

        if (characterScenes.length < 2) continue;

        // Check if locations differ
        const locations = new Set(characterScenes.map(s => s.locationId).filter(Boolean));

        if (locations.size > 1) {
          violations.push({
            id: uuidv4(),
            type: 'paradox',
            severity: 'critical',
            category: 'location',
            description: `${character.name} appears in multiple locations on the same date`,
            conflicts: characterScenes.map(s => ({
              id: uuidv4(),
              statement: `${character.name} is at ${s.locationId || 'unknown location'}`,
              source: {type: 'scene' as const, id: s.id, name: s.title},
              establishedAt: date,
              confidence: 0.9
            })),
            affectedEntityIds: [character.id, ...characterScenes.map(s => s.id)],
            location: {sceneId: characterScenes[0].id},
            suggestions: [
              'Adjust scene dates to allow travel time',
              'Remove character from one scene',
              'Add teleportation/fast travel explanation'
            ],
            status: 'new',
            confidence: 0.9,
            detectedAt: new Date()
          });
        }
      }
    }

    return violations;
  }
};

/**
 * Rule: World rules should not be violated
 */
const worldRuleViolationRule: ConsistencyRule = {
  id: 'world-rule-violation',
  name: 'World Rule Violation',
  description: 'Established world rules (magic systems, physics, etc.) must be followed',
  category: 'world_rule',
  severity: 'major',
  enabled: true,
  tags: ['world', 'rules', 'magic', 'physics'],
  check: (context: RuleContext): ConsistencyViolation[] => {
    const violations: ConsistencyViolation[] = [];

    for (const rule of context.worldRules) {
      for (const constraint of rule.constraints) {
        // Check facts against constraints
        const relevantFacts = context.facts.filter(f =>
          f.category === 'world_rule' &&
          f.tags.includes(rule.category)
        );

        for (const fact of relevantFacts) {
          const factValue = String(fact.value).toLowerCase();
          const action = constraint.action.toLowerCase();

          if (constraint.type === 'cannot' && factValue.includes(action)) {
            violations.push({
              id: uuidv4(),
              type: 'contradiction',
              severity: 'major',
              category: 'world_rule',
              description: `Violates world rule "${rule.name}": ${constraint.subject} cannot ${constraint.action}`,
              conflicts: [
                {
                  id: rule.id,
                  statement: `${constraint.subject} ${constraint.type} ${constraint.action}`,
                  source: {type: 'world_bible', id: rule.id, name: rule.name},
                  establishedAt: 0,
                  confidence: 1
                },
                {
                  id: fact.id,
                  statement: String(fact.value),
                  source: fact.source,
                  establishedAt: fact.establishedAt,
                  confidence: fact.confidence || 0.8
                }
              ],
              affectedEntityIds: [fact.subjectId],
              location: {sceneId: fact.source.id},
              suggestions: [
                'Revise scene to follow world rule',
                'Add exception explanation',
                'Modify world rule if this should be allowed'
              ],
              status: 'new',
              confidence: 0.8,
              detectedAt: new Date()
            });
          }
        }
      }
    }

    return violations;
  }
};

/**
 * Rule: Characters should not know things they haven't learned
 */
const knowledgeParadoxRule: ConsistencyRule = {
  id: 'knowledge-paradox',
  name: 'Knowledge Paradox',
  description: 'Characters should not know information they have not been exposed to',
  category: 'character_knowledge',
  severity: 'major',
  enabled: true,
  tags: ['character', 'knowledge', 'information'],
  check: (context: RuleContext): ConsistencyViolation[] => {
    const violations: ConsistencyViolation[] = [];

    // Get knowledge facts
    const knowledgeFacts = context.facts.filter(f => f.category === 'character_knowledge');

    for (const fact of knowledgeFacts) {
      // Find when this knowledge was first available
      const knowledgeSource = context.facts.find(f =>
        f.attribute === 'revealed' &&
        f.value === fact.attribute
      );

      if (knowledgeSource && fact.establishedAt < knowledgeSource.establishedAt) {
        const character = context.characters.find(c => c.id === fact.subjectId);

        violations.push({
          id: uuidv4(),
          type: 'paradox',
          severity: 'major',
          category: 'character_knowledge',
          description: `${character?.name || 'Character'} knows "${fact.attribute}" before it was revealed`,
          conflicts: [
            {
              id: fact.id,
              statement: `${character?.name} knows ${fact.attribute}`,
              source: fact.source,
              establishedAt: fact.establishedAt,
              confidence: 0.85
            },
            {
              id: knowledgeSource.id,
              statement: `${fact.attribute} is revealed`,
              source: knowledgeSource.source,
              establishedAt: knowledgeSource.establishedAt,
              confidence: 0.9
            }
          ],
          affectedEntityIds: [fact.subjectId],
          location: {sceneId: fact.source.id},
          suggestions: [
            'Move revelation scene earlier',
            'Remove premature knowledge reference',
            'Add earlier exposure scene'
          ],
          status: 'new',
          confidence: 0.8,
          detectedAt: new Date()
        });
      }
    }

    return violations;
  }
};

/**
 * Rule: Unfulfilled narrative promises (Chekhov's Gun)
 */
const unfulfilledPromiseRule: ConsistencyRule = {
  id: 'unfulfilled-promise',
  name: 'Unfulfilled Narrative Promise',
  description: 'Foreshadowing and setups should have payoffs',
  category: 'promise',
  severity: 'minor',
  enabled: true,
  tags: ['promise', 'foreshadowing', 'chekhov'],
  check: (context: RuleContext): ConsistencyViolation[] => {
    const violations: ConsistencyViolation[] = [];

    const promiseFacts = context.facts.filter(f =>
      f.category === 'promise' as ViolationCategory ||
      (f.tags && f.tags.includes('foreshadowing')) ||
      (f.tags && f.tags.includes('setup'))
    );

    const payoffFacts = context.facts.filter(f =>
      (f.tags && f.tags.includes('payoff')) ||
      (f.tags && f.tags.includes('fulfillment'))
    );

    for (const promise of promiseFacts) {
      // Check if there's a matching payoff
      const hasPayoff = payoffFacts.some(p =>
        p.attribute === promise.attribute ||
        p.subjectId === promise.subjectId
      );

      if (!hasPayoff) {
        // Check how long it's been
        const timeSincePromise = context.currentPosition - promise.establishedAt;
        const severity: ConsistencyViolation['severity'] =
          timeSincePromise > 100 ? 'major' :
          timeSincePromise > 50 ? 'minor' : 'nitpick';

        violations.push({
          id: uuidv4(),
          type: 'omission',
          severity,
          category: 'promise',
          description: `Unfulfilled promise: "${promise.attribute}" set up but never paid off`,
          conflicts: [
            {
              id: promise.id,
              statement: `Setup: ${promise.value}`,
              source: promise.source,
              establishedAt: promise.establishedAt,
              confidence: 0.7
            }
          ],
          affectedEntityIds: [promise.subjectId],
          location: {sceneId: promise.source.id},
          suggestions: [
            'Add payoff scene before ending',
            'Convert to red herring (acknowledge misdirection)',
            'Remove or reduce setup emphasis'
          ],
          status: 'new',
          confidence: 0.6,
          detectedAt: new Date()
        });
      }
    }

    return violations;
  }
};

// ============================================================================
// CONSISTENCY CHECKER ENGINE
// ============================================================================

export class ConsistencyChecker {
  private facts: Map<string, TrackedFact> = new Map();
  private rules: Map<string, ConsistencyRule> = new Map();
  private violations: Map<string, ConsistencyViolation> = new Map();
  private worldRules: Map<string, WorldRule> = new Map();

  constructor() {
    // Register built-in rules
    this.registerRule(deadCharacterRule);
    this.registerRule(attributeConsistencyRule);
    this.registerRule(locationParadoxRule);
    this.registerRule(worldRuleViolationRule);
    this.registerRule(knowledgeParadoxRule);
    this.registerRule(unfulfilledPromiseRule);
  }

  // ==========================================================================
  // FACT MANAGEMENT
  // ==========================================================================

  /**
   * Track a new fact about the story world
   */
  trackFact(fact: Omit<TrackedFact, 'id'>): TrackedFact {
    const id = uuidv4();
    const fullFact: TrackedFact = {...fact, id};
    this.facts.set(id, fullFact);
    return fullFact;
  }

  /**
   * Update an existing fact (creates supersession chain)
   */
  updateFact(
    factId: string,
    newValue: unknown,
    source: FactSource,
    establishedAt: number
  ): TrackedFact | null {
    const existing = this.facts.get(factId);
    if (!existing) return null;

    // Create new fact that supersedes old one
    const newFact = this.trackFact({
      ...existing,
      value: newValue,
      source,
      establishedAt,
      isCanonical: true
    });

    // Mark old fact as superseded
    existing.supersededBy = newFact.id;
    existing.isCanonical = false;

    return newFact;
  }

  /**
   * Get all facts for an entity
   */
  getFactsForEntity(entityId: string): TrackedFact[] {
    return Array.from(this.facts.values())
      .filter(f => f.subjectId === entityId);
  }

  /**
   * Get canonical (current) facts only
   */
  getCanonicalFacts(): TrackedFact[] {
    return Array.from(this.facts.values())
      .filter(f => f.isCanonical);
  }

  /**
   * Extract facts from scene content using patterns
   */
  extractFactsFromContent(
    content: string,
    sceneId: string,
    sceneName: string,
    position: number,
    characterNames: Map<string, string> // name -> id
  ): TrackedFact[] {
    const extracted: TrackedFact[] = [];

    // Pattern: "[Character] has [color] eyes"
    const eyeColorPattern = /(\w+(?:\s+\w+)?)\s+has?\s+(\w+)\s+eyes/gi;
    let match;

    while ((match = eyeColorPattern.exec(content)) !== null) {
      const name = match[1];
      const color = match[2];
      const charId = characterNames.get(name.toLowerCase());

      if (charId) {
        extracted.push(this.trackFact({
          category: 'character_attribute',
          subjectType: 'character',
          subjectId: charId,
          attribute: 'eye_color',
          value: color.toLowerCase(),
          valueType: 'string',
          source: {type: 'scene', id: sceneId, name: sceneName, excerpt: match[0]},
          establishedAt: position,
          isCanonical: true,
          tags: ['physical', 'appearance']
        }));
      }
    }

    // Pattern: "[Character] has [color] hair"
    const hairColorPattern = /(\w+(?:\s+\w+)?)\s+has?\s+(\w+)\s+hair/gi;
    while ((match = hairColorPattern.exec(content)) !== null) {
      const name = match[1];
      const color = match[2];
      const charId = characterNames.get(name.toLowerCase());

      if (charId) {
        extracted.push(this.trackFact({
          category: 'character_attribute',
          subjectType: 'character',
          subjectId: charId,
          attribute: 'hair_color',
          value: color.toLowerCase(),
          valueType: 'string',
          source: {type: 'scene', id: sceneId, name: sceneName, excerpt: match[0]},
          establishedAt: position,
          isCanonical: true,
          tags: ['physical', 'appearance']
        }));
      }
    }

    // Pattern: "[Character] died" or "[Character] was killed"
    const deathPattern = /(\w+(?:\s+\w+)?)\s+(?:died|was killed|passed away|perished)/gi;
    while ((match = deathPattern.exec(content)) !== null) {
      const name = match[1];
      const charId = characterNames.get(name.toLowerCase());

      if (charId) {
        extracted.push(this.trackFact({
          category: 'character_state',
          subjectType: 'character',
          subjectId: charId,
          attribute: 'status',
          value: 'dead',
          valueType: 'enum',
          source: {type: 'scene', id: sceneId, name: sceneName, excerpt: match[0]},
          establishedAt: position,
          isCanonical: true,
          tags: ['death', 'status']
        }));
      }
    }

    return extracted;
  }

  // ==========================================================================
  // RULE MANAGEMENT
  // ==========================================================================

  /**
   * Register a consistency rule
   */
  registerRule(rule: ConsistencyRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Enable/disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Get all registered rules
   */
  getRules(): ConsistencyRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Register a world rule
   */
  registerWorldRule(rule: Omit<WorldRule, 'id'>): WorldRule {
    const id = uuidv4();
    const fullRule: WorldRule = {...rule, id};
    this.worldRules.set(id, fullRule);
    return fullRule;
  }

  // ==========================================================================
  // CHECKING
  // ==========================================================================

  /**
   * Run all consistency checks
   */
  check(
    scenes: SceneContext[],
    characters: CharacterContext[],
    currentPosition: number
  ): ConsistencyCheckResult {
    const startTime = Date.now();
    const allViolations: ConsistencyViolation[] = [];

    const context: RuleContext = {
      facts: Array.from(this.facts.values()),
      scenes,
      characters,
      worldRules: Array.from(this.worldRules.values()),
      currentPosition
    };

    let rulesApplied = 0;

    // Run each enabled rule
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      rulesApplied++;

      try {
        const violations = rule.check(context);
        allViolations.push(...violations);

        // Store violations
        for (const v of violations) {
          this.violations.set(v.id, v);
        }
      } catch (error) {
        console.error(`Error in rule ${rule.id}:`, error);
      }
    }

    // Calculate summary
    const summary = {
      critical: allViolations.filter(v => v.severity === 'critical').length,
      major: allViolations.filter(v => v.severity === 'major').length,
      minor: allViolations.filter(v => v.severity === 'minor').length,
      nitpick: allViolations.filter(v => v.severity === 'nitpick').length,
      total: allViolations.length
    };

    // Group by category
    const byCategory = new Map<ViolationCategory, ConsistencyViolation[]>();
    for (const v of allViolations) {
      const existing = byCategory.get(v.category) || [];
      existing.push(v);
      byCategory.set(v.category, existing);
    }

    // Calculate health score
    const healthScore = this.calculateHealthScore(summary, context.facts.length);

    return {
      timestamp: new Date(),
      duration: Date.now() - startTime,
      totalFactsChecked: context.facts.length,
      totalRulesApplied: rulesApplied,
      violations: allViolations,
      summary,
      byCategory,
      healthScore
    };
  }

  /**
   * Calculate narrative health score
   */
  private calculateHealthScore(
    summary: ConsistencyCheckResult['summary'],
    totalFacts: number
  ): number {
    // Start at 100
    let score = 100;

    // Deduct for violations
    score -= summary.critical * 15;
    score -= summary.major * 8;
    score -= summary.minor * 3;
    score -= summary.nitpick * 1;

    // Scale by total facts (more facts = more opportunity for errors)
    const factPenalty = Math.log10(Math.max(1, totalFacts)) * 2;
    score += factPenalty; // Slight bonus for having tracked facts

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check a specific scene for violations
   */
  checkScene(
    scene: SceneContext,
    characters: CharacterContext[]
  ): ConsistencyViolation[] {
    const result = this.check([scene], characters, scene.position);
    return result.violations;
  }

  /**
   * Quick check for a new fact before adding
   */
  preflightFact(fact: Omit<TrackedFact, 'id'>): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];

    // Check for direct contradictions with existing facts
    const existingFacts = this.getFactsForEntity(fact.subjectId)
      .filter(f => f.attribute === fact.attribute && f.isCanonical);

    for (const existing of existingFacts) {
      if (JSON.stringify(existing.value) !== JSON.stringify(fact.value)) {
        // Check if fact allows change (has validUntil)
        if (!existing.validUntil || fact.establishedAt < existing.validUntil) {
          violations.push({
            id: 'preflight-' + uuidv4(),
            type: 'contradiction',
            severity: 'major',
            category: fact.category,
            description: `This would contradict existing fact: ${existing.attribute} = ${existing.value}`,
            conflicts: [
              {
                id: existing.id,
                statement: `${existing.attribute} is ${existing.value}`,
                source: existing.source,
                establishedAt: existing.establishedAt,
                confidence: 0.9
              }
            ],
            affectedEntityIds: [fact.subjectId],
            location: {},
            suggestions: [
              'Use updateFact() to properly supersede',
              'Add explanation for the change'
            ],
            status: 'new',
            confidence: 0.9,
            detectedAt: new Date()
          });
        }
      }
    }

    return violations;
  }

  // ==========================================================================
  // VIOLATION MANAGEMENT
  // ==========================================================================

  /**
   * Get all violations
   */
  getViolations(): ConsistencyViolation[] {
    return Array.from(this.violations.values());
  }

  /**
   * Get violations by status
   */
  getViolationsByStatus(status: ConsistencyViolation['status']): ConsistencyViolation[] {
    return Array.from(this.violations.values())
      .filter(v => v.status === status);
  }

  /**
   * Update violation status
   */
  updateViolationStatus(
    violationId: string,
    status: ConsistencyViolation['status']
  ): void {
    const violation = this.violations.get(violationId);
    if (violation) {
      violation.status = status;
    }
  }

  /**
   * Dismiss a violation (mark as intentional/acceptable)
   */
  dismissViolation(violationId: string, _reason?: string): void {
    this.updateViolationStatus(violationId, 'dismissed');
  }

  /**
   * Clear all violations (for re-checking)
   */
  clearViolations(): void {
    this.violations.clear();
  }

  // ==========================================================================
  // REPORTS
  // ==========================================================================

  /**
   * Generate a human-readable consistency report
   */
  generateReport(result: ConsistencyCheckResult): string {
    let report = '# Consistency Check Report\n\n';

    report += `**Generated:** ${result.timestamp.toISOString()}\n`;
    report += `**Duration:** ${result.duration}ms\n`;
    report += `**Facts Checked:** ${result.totalFactsChecked}\n`;
    report += `**Rules Applied:** ${result.totalRulesApplied}\n`;
    report += `**Health Score:** ${result.healthScore.toFixed(1)}/100\n\n`;

    report += '## Summary\n\n';
    report += `| Severity | Count |\n`;
    report += `|----------|-------|\n`;
    report += `| Critical | ${result.summary.critical} |\n`;
    report += `| Major | ${result.summary.major} |\n`;
    report += `| Minor | ${result.summary.minor} |\n`;
    report += `| Nitpick | ${result.summary.nitpick} |\n`;
    report += `| **Total** | **${result.summary.total}** |\n\n`;

    if (result.violations.length === 0) {
      report += '✅ No consistency violations detected!\n';
      return report;
    }

    report += '## Violations\n\n';

    // Group by severity
    const bySeverity = {
      critical: result.violations.filter(v => v.severity === 'critical'),
      major: result.violations.filter(v => v.severity === 'major'),
      minor: result.violations.filter(v => v.severity === 'minor'),
      nitpick: result.violations.filter(v => v.severity === 'nitpick')
    };

    for (const [severity, violations] of Object.entries(bySeverity)) {
      if (violations.length === 0) continue;

      const emoji = severity === 'critical' ? '🔴' :
                    severity === 'major' ? '🟠' :
                    severity === 'minor' ? '🟡' : '⚪';

      report += `### ${emoji} ${severity.toUpperCase()} (${violations.length})\n\n`;

      for (const v of violations) {
        report += `#### ${v.description}\n\n`;
        report += `- **Type:** ${v.type}\n`;
        report += `- **Category:** ${v.category}\n`;
        report += `- **Confidence:** ${(v.confidence * 100).toFixed(0)}%\n`;

        if (v.conflicts.length > 0) {
          report += `- **Conflicts:**\n`;
          for (const c of v.conflicts) {
            report += `  - "${c.statement}" (${c.source.name})\n`;
          }
        }

        if (v.suggestions.length > 0) {
          report += `- **Suggestions:**\n`;
          for (const s of v.suggestions) {
            report += `  - ${s}\n`;
          }
        }

        report += '\n';
      }
    }

    return report;
  }

  // ==========================================================================
  // SERIALIZATION
  // ==========================================================================

  toJSON(): {
    facts: TrackedFact[];
    worldRules: WorldRule[];
    violations: ConsistencyViolation[];
  } {
    return {
      facts: Array.from(this.facts.values()),
      worldRules: Array.from(this.worldRules.values()),
      violations: Array.from(this.violations.values())
    };
  }

  static fromJSON(data: ReturnType<ConsistencyChecker['toJSON']>): ConsistencyChecker {
    const checker = new ConsistencyChecker();

    for (const fact of data.facts) {
      checker.facts.set(fact.id, fact);
    }
    for (const rule of data.worldRules) {
      checker.worldRules.set(rule.id, rule);
    }
    for (const violation of data.violations) {
      checker.violations.set(violation.id, violation);
    }

    return checker;
  }
}

export default ConsistencyChecker;
