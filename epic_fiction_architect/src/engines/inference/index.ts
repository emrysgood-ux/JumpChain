/**
 * Inference Rule Engine
 *
 * A sophisticated logical inference system that derives new facts from
 * established facts. Essential for maintaining consistency at scale by
 * automatically computing implied truths.
 *
 * Features:
 * - Forward chaining inference (derive conclusions from premises)
 * - Backward chaining inference (verify if a fact can be proven)
 * - Temporal inference (facts valid at specific times)
 * - Transitive relationship handling (A→B→C implies A→C)
 * - Inheritance rules (species traits, faction memberships)
 * - Mathematical constraints (age calculations, distances)
 * - Custom rule definitions
 *
 * Example inferences:
 * - If A is B's parent and B is C's parent, then A is C's grandparent
 * - If character X is dead at time T, X cannot act after T
 * - If location A is 100 miles from B, travel takes time
 * - If character belongs to species S, character has S's traits
 *
 * @module engines/inference
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * A fact that can be reasoned about
 */
export interface InferenceFact {
  id: string;
  /** Subject of the fact (who/what) */
  subject: string;
  subjectType: string;
  /** Predicate (relationship/property) */
  predicate: string;
  /** Object (value or related entity) */
  object: string;
  objectType?: string;
  /** When this fact is valid */
  validFrom?: number;
  validUntil?: number;
  /** Confidence level (0-1) */
  confidence: number;
  /** Is this a derived fact or established? */
  derived: boolean;
  /** If derived, what rule produced it */
  derivedFrom?: {
    ruleId: string;
    premiseIds: string[];
  };
  /** Source of this fact */
  source?: string;
  /** Metadata */
  metadata: Record<string, unknown>;
}

/**
 * An inference rule that can derive new facts
 */
export interface InferenceRule {
  id: string;
  name: string;
  description: string;
  category: InferenceCategory;

  /** Premises required (patterns to match) */
  premises: FactPattern[];

  /** Conclusions to derive (patterns to create) */
  conclusions: FactPattern[];

  /** Optional guard conditions */
  guards?: GuardCondition[];

  /** Priority (higher runs first) */
  priority: number;

  /** Is this rule enabled? */
  enabled: boolean;

  /** Confidence modifier for derived facts */
  confidenceModifier: number;

  /** Tags */
  tags: string[];
}

/**
 * Categories of inference rules
 */
export enum InferenceCategory {
  RELATIONSHIP = 'relationship',      // Family, social connections
  TEMPORAL = 'temporal',              // Time-based inferences
  SPATIAL = 'spatial',                // Location, distance
  PROPERTY = 'property',              // Attribute inheritance
  STATE = 'state',                    // Character states
  KNOWLEDGE = 'knowledge',            // Who knows what
  CAPABILITY = 'capability',          // What characters can do
  CONSTRAINT = 'constraint',          // Mathematical constraints
  CUSTOM = 'custom',                  // User-defined
}

/**
 * Pattern for matching or creating facts
 */
export interface FactPattern {
  /** Variable name or literal for subject */
  subject: PatternElement;
  /** Variable name or literal for predicate */
  predicate: PatternElement;
  /** Variable name or literal for object */
  object: PatternElement;
  /** Optional type constraints */
  subjectType?: PatternElement;
  objectType?: PatternElement;
  /** Temporal constraints */
  temporal?: TemporalConstraint;
}

/**
 * Element of a pattern - either a variable or literal
 */
export interface PatternElement {
  type: 'variable' | 'literal';
  value: string;
  /** For variables, optional type constraint */
  typeConstraint?: string;
}

/**
 * Temporal constraint for patterns
 */
export interface TemporalConstraint {
  type: 'at' | 'before' | 'after' | 'during' | 'overlap' | 'any';
  reference?: string; // Variable name or literal timestamp
}

/**
 * Guard condition that must be true for rule to fire
 */
export interface GuardCondition {
  type: 'not_exists' | 'exists' | 'compare' | 'function';
  /** For existence checks */
  pattern?: FactPattern;
  /** For comparisons */
  left?: string;  // Variable reference
  operator?: 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'matches';
  right?: string | number; // Value or variable reference
  /** For function checks */
  function?: string;
  args?: string[];
}

/**
 * Result of inference
 */
export interface InferenceResult {
  derivedFacts: InferenceFact[];
  appliedRules: {
    ruleId: string;
    ruleName: string;
    factsDerived: number;
  }[];
  iterations: number;
  duration: number;
  conflicts: InferenceConflict[];
}

/**
 * Conflict between inferred facts
 */
export interface InferenceConflict {
  id: string;
  type: 'contradiction' | 'inconsistency' | 'temporal_paradox';
  description: string;
  involvedFacts: string[];
  resolution?: string;
}

/**
 * Variable binding during pattern matching
 */
interface Binding {
  [variable: string]: string;
}

// ============================================================================
// BUILT-IN INFERENCE RULES
// ============================================================================

/**
 * Create built-in family relationship rules
 */
function createFamilyRules(): InferenceRule[] {
  return [
    // Grandparent: if A is parent of B, and B is parent of C, then A is grandparent of C
    {
      id: 'family-grandparent',
      name: 'Grandparent Inference',
      description: 'If A is parent of B and B is parent of C, then A is grandparent of C',
      category: InferenceCategory.RELATIONSHIP,
      premises: [
        {
          subject: { type: 'variable', value: 'A' },
          predicate: { type: 'literal', value: 'parent_of' },
          object: { type: 'variable', value: 'B' },
        },
        {
          subject: { type: 'variable', value: 'B' },
          predicate: { type: 'literal', value: 'parent_of' },
          object: { type: 'variable', value: 'C' },
        },
      ],
      conclusions: [
        {
          subject: { type: 'variable', value: 'A' },
          predicate: { type: 'literal', value: 'grandparent_of' },
          object: { type: 'variable', value: 'C' },
        },
      ],
      guards: [
        {
          type: 'not_exists',
          pattern: {
            subject: { type: 'variable', value: 'A' },
            predicate: { type: 'literal', value: 'grandparent_of' },
            object: { type: 'variable', value: 'C' },
          },
        },
      ],
      priority: 10,
      enabled: true,
      confidenceModifier: 1.0,
      tags: ['family', 'relationship'],
    },

    // Sibling: if A and B share a parent (and A != B), they are siblings
    {
      id: 'family-sibling',
      name: 'Sibling Inference',
      description: 'If A and B share a parent, they are siblings',
      category: InferenceCategory.RELATIONSHIP,
      premises: [
        {
          subject: { type: 'variable', value: 'P' },
          predicate: { type: 'literal', value: 'parent_of' },
          object: { type: 'variable', value: 'A' },
        },
        {
          subject: { type: 'variable', value: 'P' },
          predicate: { type: 'literal', value: 'parent_of' },
          object: { type: 'variable', value: 'B' },
        },
      ],
      conclusions: [
        {
          subject: { type: 'variable', value: 'A' },
          predicate: { type: 'literal', value: 'sibling_of' },
          object: { type: 'variable', value: 'B' },
        },
      ],
      guards: [
        {
          type: 'compare',
          left: 'A',
          operator: 'neq',
          right: 'B',
        },
        {
          type: 'not_exists',
          pattern: {
            subject: { type: 'variable', value: 'A' },
            predicate: { type: 'literal', value: 'sibling_of' },
            object: { type: 'variable', value: 'B' },
          },
        },
      ],
      priority: 10,
      enabled: true,
      confidenceModifier: 1.0,
      tags: ['family', 'relationship'],
    },

    // Ancestor (transitive): if A is ancestor of B, and B is parent of C, then A is ancestor of C
    {
      id: 'family-ancestor-transitive',
      name: 'Ancestor Transitivity',
      description: 'If A is ancestor of B and B is parent of C, A is ancestor of C',
      category: InferenceCategory.RELATIONSHIP,
      premises: [
        {
          subject: { type: 'variable', value: 'A' },
          predicate: { type: 'literal', value: 'ancestor_of' },
          object: { type: 'variable', value: 'B' },
        },
        {
          subject: { type: 'variable', value: 'B' },
          predicate: { type: 'literal', value: 'parent_of' },
          object: { type: 'variable', value: 'C' },
        },
      ],
      conclusions: [
        {
          subject: { type: 'variable', value: 'A' },
          predicate: { type: 'literal', value: 'ancestor_of' },
          object: { type: 'variable', value: 'C' },
        },
      ],
      guards: [
        {
          type: 'not_exists',
          pattern: {
            subject: { type: 'variable', value: 'A' },
            predicate: { type: 'literal', value: 'ancestor_of' },
            object: { type: 'variable', value: 'C' },
          },
        },
      ],
      priority: 9,
      enabled: true,
      confidenceModifier: 0.95,
      tags: ['family', 'relationship', 'transitive'],
    },

    // Parent implies ancestor
    {
      id: 'family-parent-is-ancestor',
      name: 'Parent is Ancestor',
      description: 'If A is parent of B, A is ancestor of B',
      category: InferenceCategory.RELATIONSHIP,
      premises: [
        {
          subject: { type: 'variable', value: 'A' },
          predicate: { type: 'literal', value: 'parent_of' },
          object: { type: 'variable', value: 'B' },
        },
      ],
      conclusions: [
        {
          subject: { type: 'variable', value: 'A' },
          predicate: { type: 'literal', value: 'ancestor_of' },
          object: { type: 'variable', value: 'B' },
        },
      ],
      guards: [
        {
          type: 'not_exists',
          pattern: {
            subject: { type: 'variable', value: 'A' },
            predicate: { type: 'literal', value: 'ancestor_of' },
            object: { type: 'variable', value: 'B' },
          },
        },
      ],
      priority: 11,
      enabled: true,
      confidenceModifier: 1.0,
      tags: ['family', 'relationship'],
    },
  ];
}

/**
 * Create temporal inference rules
 */
function createTemporalRules(): InferenceRule[] {
  return [
    // Dead characters cannot act
    {
      id: 'temporal-death-prevents-action',
      name: 'Death Prevents Action',
      description: 'If character is dead at time T, they cannot perform actions after T',
      category: InferenceCategory.TEMPORAL,
      premises: [
        {
          subject: { type: 'variable', value: 'C' },
          predicate: { type: 'literal', value: 'status' },
          object: { type: 'literal', value: 'dead' },
        },
      ],
      conclusions: [
        {
          subject: { type: 'variable', value: 'C' },
          predicate: { type: 'literal', value: 'cannot_act' },
          object: { type: 'literal', value: 'true' },
        },
      ],
      priority: 20,
      enabled: true,
      confidenceModifier: 1.0,
      tags: ['temporal', 'state', 'death'],
    },
  ];
}

/**
 * Create property inheritance rules
 */
function createPropertyRules(): InferenceRule[] {
  return [
    // Species inheritance: if X is species S, and S has trait T, then X has trait T
    {
      id: 'property-species-trait',
      name: 'Species Trait Inheritance',
      description: 'Characters inherit traits from their species',
      category: InferenceCategory.PROPERTY,
      premises: [
        {
          subject: { type: 'variable', value: 'X' },
          predicate: { type: 'literal', value: 'species' },
          object: { type: 'variable', value: 'S' },
        },
        {
          subject: { type: 'variable', value: 'S' },
          predicate: { type: 'literal', value: 'has_trait' },
          object: { type: 'variable', value: 'T' },
        },
      ],
      conclusions: [
        {
          subject: { type: 'variable', value: 'X' },
          predicate: { type: 'literal', value: 'has_trait' },
          object: { type: 'variable', value: 'T' },
        },
      ],
      guards: [
        {
          type: 'not_exists',
          pattern: {
            subject: { type: 'variable', value: 'X' },
            predicate: { type: 'literal', value: 'lacks_trait' },
            object: { type: 'variable', value: 'T' },
          },
        },
      ],
      priority: 5,
      enabled: true,
      confidenceModifier: 0.9,
      tags: ['property', 'species', 'inheritance'],
    },

    // Faction membership inheritance
    {
      id: 'property-faction-membership',
      name: 'Faction Property Inheritance',
      description: 'Members of a faction have access to faction resources',
      category: InferenceCategory.PROPERTY,
      premises: [
        {
          subject: { type: 'variable', value: 'X' },
          predicate: { type: 'literal', value: 'member_of' },
          object: { type: 'variable', value: 'F' },
        },
        {
          subject: { type: 'variable', value: 'F' },
          predicate: { type: 'literal', value: 'has_resource' },
          object: { type: 'variable', value: 'R' },
        },
      ],
      conclusions: [
        {
          subject: { type: 'variable', value: 'X' },
          predicate: { type: 'literal', value: 'can_access' },
          object: { type: 'variable', value: 'R' },
        },
      ],
      priority: 4,
      enabled: true,
      confidenceModifier: 0.8,
      tags: ['property', 'faction', 'access'],
    },
  ];
}

/**
 * Create knowledge inference rules
 */
function createKnowledgeRules(): InferenceRule[] {
  return [
    // Witness knowledge: if X witnessed event E, X knows about E
    {
      id: 'knowledge-witness',
      name: 'Witness Knowledge',
      description: 'Characters know about events they witnessed',
      category: InferenceCategory.KNOWLEDGE,
      premises: [
        {
          subject: { type: 'variable', value: 'X' },
          predicate: { type: 'literal', value: 'witnessed' },
          object: { type: 'variable', value: 'E' },
        },
      ],
      conclusions: [
        {
          subject: { type: 'variable', value: 'X' },
          predicate: { type: 'literal', value: 'knows_about' },
          object: { type: 'variable', value: 'E' },
        },
      ],
      priority: 8,
      enabled: true,
      confidenceModifier: 1.0,
      tags: ['knowledge', 'witness'],
    },

    // Told knowledge: if X told Y about Z, Y knows about Z
    {
      id: 'knowledge-told',
      name: 'Information Transfer',
      description: 'Characters know what they are told',
      category: InferenceCategory.KNOWLEDGE,
      premises: [
        {
          subject: { type: 'variable', value: 'X' },
          predicate: { type: 'literal', value: 'told' },
          object: { type: 'variable', value: 'Y' },
        },
        {
          subject: { type: 'variable', value: 'X' },
          predicate: { type: 'literal', value: 'told_about' },
          object: { type: 'variable', value: 'Z' },
        },
      ],
      conclusions: [
        {
          subject: { type: 'variable', value: 'Y' },
          predicate: { type: 'literal', value: 'knows_about' },
          object: { type: 'variable', value: 'Z' },
        },
      ],
      priority: 7,
      enabled: true,
      confidenceModifier: 0.85,
      tags: ['knowledge', 'communication'],
    },
  ];
}

// ============================================================================
// INFERENCE RULE ENGINE
// ============================================================================

/**
 * Inference Rule Engine
 *
 * Derives new facts from established facts using logical rules.
 */
export class InferenceRuleEngine {
  private facts: Map<string, InferenceFact> = new Map();
  private rules: Map<string, InferenceRule> = new Map();
  private conflicts: InferenceConflict[] = [];

  /** Index for fast lookup by subject */
  private subjectIndex: Map<string, Set<string>> = new Map();
  /** Index for fast lookup by predicate */
  private predicateIndex: Map<string, Set<string>> = new Map();
  /** Index for fast lookup by object */
  private objectIndex: Map<string, Set<string>> = new Map();

  /** Maximum iterations to prevent infinite loops */
  private maxIterations: number = 100;

  /** Track derived fact IDs for this session */
  private sessionDerivedIds: Set<string> = new Set();

  constructor(options?: { maxIterations?: number }) {
    if (options?.maxIterations) {
      this.maxIterations = options.maxIterations;
    }

    // Register built-in rules
    this.registerBuiltInRules();
  }

  /**
   * Register built-in inference rules
   */
  private registerBuiltInRules(): void {
    const allRules = [
      ...createFamilyRules(),
      ...createTemporalRules(),
      ...createPropertyRules(),
      ...createKnowledgeRules(),
    ];

    for (const rule of allRules) {
      this.rules.set(rule.id, rule);
    }
  }

  // ==========================================================================
  // FACT MANAGEMENT
  // ==========================================================================

  /**
   * Add a fact to the knowledge base
   */
  addFact(fact: Omit<InferenceFact, 'id' | 'derived'>): InferenceFact {
    const id = uuidv4();
    const fullFact: InferenceFact = {
      ...fact,
      id,
      derived: false,
    };

    this.facts.set(id, fullFact);
    this.indexFact(fullFact);

    return fullFact;
  }

  /**
   * Add multiple facts
   */
  addFacts(facts: Omit<InferenceFact, 'id' | 'derived'>[]): InferenceFact[] {
    return facts.map(f => this.addFact(f));
  }

  /**
   * Get a fact by ID
   */
  getFact(id: string): InferenceFact | undefined {
    return this.facts.get(id);
  }

  /**
   * Get all facts
   */
  getAllFacts(): InferenceFact[] {
    return Array.from(this.facts.values());
  }

  /**
   * Get derived facts only
   */
  getDerivedFacts(): InferenceFact[] {
    return Array.from(this.facts.values()).filter(f => f.derived);
  }

  /**
   * Get established (non-derived) facts
   */
  getEstablishedFacts(): InferenceFact[] {
    return Array.from(this.facts.values()).filter(f => !f.derived);
  }

  /**
   * Query facts by pattern
   */
  queryFacts(query: {
    subject?: string;
    predicate?: string;
    object?: string;
    validAt?: number;
  }): InferenceFact[] {
    let candidates: Set<string> | null = null;

    // Use indexes to narrow down candidates
    if (query.subject) {
      candidates = this.subjectIndex.get(query.subject) || new Set();
    }
    if (query.predicate) {
      const predicateFacts = this.predicateIndex.get(query.predicate) || new Set();
      if (candidates === null) {
        candidates = predicateFacts;
      } else {
        candidates = new Set([...candidates].filter(id => predicateFacts.has(id)));
      }
    }
    if (query.object) {
      const objectFacts = this.objectIndex.get(query.object) || new Set();
      if (candidates === null) {
        candidates = objectFacts;
      } else {
        candidates = new Set([...candidates].filter(id => objectFacts.has(id)));
      }
    }

    // If no index constraints, start with all facts
    if (candidates === null) {
      candidates = new Set(this.facts.keys());
    }

    // Filter and validate
    const results: InferenceFact[] = [];
    for (const id of candidates) {
      const fact = this.facts.get(id);
      if (!fact) continue;

      // Check temporal validity
      if (query.validAt !== undefined) {
        if (fact.validFrom !== undefined && query.validAt < fact.validFrom) continue;
        if (fact.validUntil !== undefined && query.validAt > fact.validUntil) continue;
      }

      results.push(fact);
    }

    return results;
  }

  /**
   * Remove a fact
   */
  removeFact(id: string): boolean {
    const fact = this.facts.get(id);
    if (!fact) return false;

    // Remove from indexes
    this.subjectIndex.get(fact.subject)?.delete(id);
    this.predicateIndex.get(fact.predicate)?.delete(id);
    this.objectIndex.get(fact.object)?.delete(id);

    // Remove derived facts that depended on this
    for (const derived of this.facts.values()) {
      if (derived.derivedFrom?.premiseIds.includes(id)) {
        this.removeFact(derived.id);
      }
    }

    this.facts.delete(id);
    return true;
  }

  /**
   * Index a fact for fast lookup
   */
  private indexFact(fact: InferenceFact): void {
    // Subject index
    if (!this.subjectIndex.has(fact.subject)) {
      this.subjectIndex.set(fact.subject, new Set());
    }
    this.subjectIndex.get(fact.subject)!.add(fact.id);

    // Predicate index
    if (!this.predicateIndex.has(fact.predicate)) {
      this.predicateIndex.set(fact.predicate, new Set());
    }
    this.predicateIndex.get(fact.predicate)!.add(fact.id);

    // Object index
    if (!this.objectIndex.has(fact.object)) {
      this.objectIndex.set(fact.object, new Set());
    }
    this.objectIndex.get(fact.object)!.add(fact.id);
  }

  // ==========================================================================
  // RULE MANAGEMENT
  // ==========================================================================

  /**
   * Register an inference rule
   */
  registerRule(rule: InferenceRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove a rule
   */
  removeRule(id: string): boolean {
    return this.rules.delete(id);
  }

  /**
   * Enable/disable a rule
   */
  setRuleEnabled(id: string, enabled: boolean): void {
    const rule = this.rules.get(id);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Get all rules
   */
  getRules(): InferenceRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rules by category
   */
  getRulesByCategory(category: InferenceCategory): InferenceRule[] {
    return Array.from(this.rules.values()).filter(r => r.category === category);
  }

  // ==========================================================================
  // INFERENCE
  // ==========================================================================

  /**
   * Run forward chaining inference
   *
   * Applies all matching rules until no new facts can be derived.
   */
  runInference(): InferenceResult {
    const startTime = Date.now();
    let iteration = 0;
    const appliedRules: Map<string, number> = new Map();
    this.sessionDerivedIds.clear();

    // Get enabled rules sorted by priority
    const enabledRules = Array.from(this.rules.values())
      .filter(r => r.enabled)
      .sort((a, b) => b.priority - a.priority);

    let newFactsThisIteration = true;

    while (newFactsThisIteration && iteration < this.maxIterations) {
      newFactsThisIteration = false;
      iteration++;

      for (const rule of enabledRules) {
        const newFacts = this.applyRule(rule);

        if (newFacts.length > 0) {
          newFactsThisIteration = true;
          const currentCount = appliedRules.get(rule.id) || 0;
          appliedRules.set(rule.id, currentCount + newFacts.length);
        }
      }
    }

    // Check for conflicts
    this.detectConflicts();

    return {
      derivedFacts: Array.from(this.sessionDerivedIds).map(id => this.facts.get(id)!).filter(Boolean),
      appliedRules: Array.from(appliedRules.entries()).map(([ruleId, count]) => ({
        ruleId,
        ruleName: this.rules.get(ruleId)?.name || 'Unknown',
        factsDerived: count,
      })),
      iterations: iteration,
      duration: Date.now() - startTime,
      conflicts: [...this.conflicts],
    };
  }

  /**
   * Apply a single rule and return new facts
   */
  private applyRule(rule: InferenceRule): InferenceFact[] {
    const newFacts: InferenceFact[] = [];

    // Find all bindings that satisfy the premises
    const bindings = this.findBindings(rule.premises);

    for (const binding of bindings) {
      // Check guard conditions
      if (!this.checkGuards(rule.guards || [], binding)) {
        continue;
      }

      // Generate conclusions
      for (const conclusionPattern of rule.conclusions) {
        const newFact = this.instantiatePattern(conclusionPattern, binding, rule);

        // Check if this fact already exists
        const existing = this.queryFacts({
          subject: newFact.subject,
          predicate: newFact.predicate,
          object: newFact.object,
        });

        if (existing.length === 0) {
          this.facts.set(newFact.id, newFact);
          this.indexFact(newFact);
          this.sessionDerivedIds.add(newFact.id);
          newFacts.push(newFact);
        }
      }
    }

    return newFacts;
  }

  /**
   * Find all variable bindings that satisfy the premises
   */
  private findBindings(premises: FactPattern[]): Binding[] {
    if (premises.length === 0) return [{}];

    // Start with first premise
    let bindings = this.matchPattern(premises[0], {});

    // Extend with each subsequent premise
    for (let i = 1; i < premises.length; i++) {
      const newBindings: Binding[] = [];

      for (const binding of bindings) {
        const extended = this.matchPattern(premises[i], binding);
        newBindings.push(...extended);
      }

      bindings = newBindings;

      // Early exit if no bindings
      if (bindings.length === 0) break;
    }

    return bindings;
  }

  /**
   * Match a pattern against facts and return bindings
   */
  private matchPattern(pattern: FactPattern, existingBinding: Binding): Binding[] {
    const results: Binding[] = [];

    // Build query from pattern
    const query: { subject?: string; predicate?: string; object?: string } = {};

    if (pattern.subject.type === 'literal') {
      query.subject = pattern.subject.value;
    } else if (existingBinding[pattern.subject.value]) {
      query.subject = existingBinding[pattern.subject.value];
    }

    if (pattern.predicate.type === 'literal') {
      query.predicate = pattern.predicate.value;
    } else if (existingBinding[pattern.predicate.value]) {
      query.predicate = existingBinding[pattern.predicate.value];
    }

    if (pattern.object.type === 'literal') {
      query.object = pattern.object.value;
    } else if (existingBinding[pattern.object.value]) {
      query.object = existingBinding[pattern.object.value];
    }

    // Query facts
    const matchingFacts = this.queryFacts(query);

    // Create bindings for each match
    for (const fact of matchingFacts) {
      const newBinding: Binding = { ...existingBinding };
      let valid = true;

      // Bind variables
      if (pattern.subject.type === 'variable') {
        if (newBinding[pattern.subject.value] && newBinding[pattern.subject.value] !== fact.subject) {
          valid = false;
        } else {
          newBinding[pattern.subject.value] = fact.subject;
        }
      }

      if (pattern.predicate.type === 'variable') {
        if (newBinding[pattern.predicate.value] && newBinding[pattern.predicate.value] !== fact.predicate) {
          valid = false;
        } else {
          newBinding[pattern.predicate.value] = fact.predicate;
        }
      }

      if (pattern.object.type === 'variable') {
        if (newBinding[pattern.object.value] && newBinding[pattern.object.value] !== fact.object) {
          valid = false;
        } else {
          newBinding[pattern.object.value] = fact.object;
        }
      }

      if (valid) {
        results.push(newBinding);
      }
    }

    return results;
  }

  /**
   * Check guard conditions
   */
  private checkGuards(guards: GuardCondition[], binding: Binding): boolean {
    for (const guard of guards) {
      switch (guard.type) {
        case 'not_exists':
          if (guard.pattern) {
            const matches = this.matchPattern(guard.pattern, binding);
            if (matches.length > 0) return false;
          }
          break;

        case 'exists':
          if (guard.pattern) {
            const matches = this.matchPattern(guard.pattern, binding);
            if (matches.length === 0) return false;
          }
          break;

        case 'compare':
          if (guard.left && guard.operator && guard.right !== undefined) {
            const leftValue = binding[guard.left] || guard.left;
            const rightValue = typeof guard.right === 'string'
              ? (binding[guard.right] || guard.right)
              : guard.right;

            if (!this.compareValues(leftValue, guard.operator, rightValue)) {
              return false;
            }
          }
          break;
      }
    }

    return true;
  }

  /**
   * Compare values with an operator
   */
  private compareValues(
    left: string | number,
    operator: GuardCondition['operator'],
    right: string | number
  ): boolean {
    switch (operator) {
      case 'eq': return left === right;
      case 'neq': return left !== right;
      case 'lt': return Number(left) < Number(right);
      case 'lte': return Number(left) <= Number(right);
      case 'gt': return Number(left) > Number(right);
      case 'gte': return Number(left) >= Number(right);
      case 'contains': return String(left).includes(String(right));
      case 'matches': return new RegExp(String(right)).test(String(left));
      default: return false;
    }
  }

  /**
   * Instantiate a pattern with bindings to create a fact
   */
  private instantiatePattern(
    pattern: FactPattern,
    binding: Binding,
    rule: InferenceRule
  ): InferenceFact {
    const subject = pattern.subject.type === 'variable'
      ? binding[pattern.subject.value]
      : pattern.subject.value;

    const predicate = pattern.predicate.type === 'variable'
      ? binding[pattern.predicate.value]
      : pattern.predicate.value;

    const object = pattern.object.type === 'variable'
      ? binding[pattern.object.value]
      : pattern.object.value;

    // Calculate premise IDs for derivation tracking
    const premiseIds: string[] = [];
    for (const premise of rule.premises) {
      const matches = this.matchPattern(premise, binding);
      for (const match of matches) {
        const facts = this.queryFacts({
          subject: premise.subject.type === 'variable' ? match[premise.subject.value] : premise.subject.value,
          predicate: premise.predicate.type === 'variable' ? match[premise.predicate.value] : premise.predicate.value,
          object: premise.object.type === 'variable' ? match[premise.object.value] : premise.object.value,
        });
        premiseIds.push(...facts.map(f => f.id));
      }
    }

    // Calculate confidence as minimum of premise confidences times modifier
    const premiseConfidences = [...new Set(premiseIds)]
      .map(id => this.facts.get(id)?.confidence || 1)
      .filter(Boolean);
    const baseConfidence = premiseConfidences.length > 0
      ? Math.min(...premiseConfidences)
      : 1;

    return {
      id: uuidv4(),
      subject,
      subjectType: pattern.subjectType?.type === 'variable'
        ? binding[pattern.subjectType.value] || ''
        : pattern.subjectType?.value || '',
      predicate,
      object,
      objectType: pattern.objectType?.type === 'variable'
        ? binding[pattern.objectType.value] || ''
        : pattern.objectType?.value || '',
      confidence: baseConfidence * rule.confidenceModifier,
      derived: true,
      derivedFrom: {
        ruleId: rule.id,
        premiseIds: [...new Set(premiseIds)],
      },
      metadata: {
        derivedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Detect conflicts between facts
   */
  private detectConflicts(): void {
    this.conflicts = [];

    // Check for contradictory facts
    for (const fact of this.facts.values()) {
      // Check for negation conflicts (e.g., "is alive" vs "is dead")
      const potentialConflicts = this.queryFacts({
        subject: fact.subject,
      });

      for (const other of potentialConflicts) {
        if (other.id === fact.id) continue;

        // Same predicate, different object (potential conflict)
        if (other.predicate === fact.predicate && other.object !== fact.object) {
          // Check if temporally overlapping
          if (this.temporalOverlap(fact, other)) {
            this.conflicts.push({
              id: uuidv4(),
              type: 'contradiction',
              description: `${fact.subject} has conflicting values for ${fact.predicate}: "${fact.object}" vs "${other.object}"`,
              involvedFacts: [fact.id, other.id],
            });
          }
        }

        // Status contradictions
        if (fact.predicate === 'status' && other.predicate === 'status') {
          if (this.temporalOverlap(fact, other) && fact.object !== other.object) {
            this.conflicts.push({
              id: uuidv4(),
              type: 'contradiction',
              description: `${fact.subject} has conflicting status: "${fact.object}" vs "${other.object}"`,
              involvedFacts: [fact.id, other.id],
            });
          }
        }
      }
    }
  }

  /**
   * Check if two facts have temporal overlap
   */
  private temporalOverlap(a: InferenceFact, b: InferenceFact): boolean {
    // If neither has temporal bounds, assume overlap
    if (a.validFrom === undefined && a.validUntil === undefined &&
        b.validFrom === undefined && b.validUntil === undefined) {
      return true;
    }

    const aFrom = a.validFrom ?? -Infinity;
    const aUntil = a.validUntil ?? Infinity;
    const bFrom = b.validFrom ?? -Infinity;
    const bUntil = b.validUntil ?? Infinity;

    return aFrom <= bUntil && bFrom <= aUntil;
  }

  // ==========================================================================
  // BACKWARD CHAINING
  // ==========================================================================

  /**
   * Check if a fact can be proven (backward chaining)
   */
  canProve(query: {
    subject: string;
    predicate: string;
    object: string;
  }, maxDepth: number = 10): { provable: boolean; proof?: string[]; confidence?: number } {
    // Check if fact exists directly
    const existing = this.queryFacts(query);
    if (existing.length > 0) {
      return {
        provable: true,
        proof: [`Direct fact: ${existing[0].id}`],
        confidence: existing[0].confidence,
      };
    }

    // Try to derive through rules
    return this.backwardChain(query, maxDepth, []);
  }

  /**
   * Backward chain to prove a query
   */
  private backwardChain(
    query: { subject: string; predicate: string; object: string },
    depth: number,
    visited: string[]
  ): { provable: boolean; proof?: string[]; confidence?: number } {
    if (depth <= 0) {
      return { provable: false };
    }

    const queryKey = `${query.subject}:${query.predicate}:${query.object}`;
    if (visited.includes(queryKey)) {
      return { provable: false };
    }

    const newVisited = [...visited, queryKey];

    // Find rules that could derive this conclusion
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      for (const conclusion of rule.conclusions) {
        // Check if conclusion pattern matches query
        const binding: Binding = {};

        if (conclusion.subject.type === 'literal' && conclusion.subject.value !== query.subject) continue;
        if (conclusion.predicate.type === 'literal' && conclusion.predicate.value !== query.predicate) continue;
        if (conclusion.object.type === 'literal' && conclusion.object.value !== query.object) continue;

        // Bind variables
        if (conclusion.subject.type === 'variable') binding[conclusion.subject.value] = query.subject;
        if (conclusion.predicate.type === 'variable') binding[conclusion.predicate.value] = query.predicate;
        if (conclusion.object.type === 'variable') binding[conclusion.object.value] = query.object;

        // Try to prove all premises
        const proof: string[] = [`Rule: ${rule.name}`];
        let allPremisesProvable = true;
        let minConfidence = 1;

        for (const premise of rule.premises) {
          const premiseQuery = {
            subject: premise.subject.type === 'variable'
              ? binding[premise.subject.value] || ''
              : premise.subject.value,
            predicate: premise.predicate.type === 'variable'
              ? binding[premise.predicate.value] || ''
              : premise.predicate.value,
            object: premise.object.type === 'variable'
              ? binding[premise.object.value] || ''
              : premise.object.value,
          };

          // Check if premise is directly satisfied
          const premiseFacts = this.queryFacts(premiseQuery);
          if (premiseFacts.length > 0) {
            proof.push(`Premise satisfied: ${premiseQuery.subject} ${premiseQuery.predicate} ${premiseQuery.object}`);
            minConfidence = Math.min(minConfidence, premiseFacts[0].confidence);
            continue;
          }

          // Try to prove premise recursively
          const premiseResult = this.backwardChain(premiseQuery, depth - 1, newVisited);
          if (premiseResult.provable) {
            proof.push(...(premiseResult.proof || []));
            minConfidence = Math.min(minConfidence, premiseResult.confidence || 1);
          } else {
            allPremisesProvable = false;
            break;
          }
        }

        if (allPremisesProvable) {
          return {
            provable: true,
            proof,
            confidence: minConfidence * rule.confidenceModifier,
          };
        }
      }
    }

    return { provable: false };
  }

  // ==========================================================================
  // STATISTICS & EXPORT
  // ==========================================================================

  /**
   * Get statistics
   */
  getStats(): {
    totalFacts: number;
    derivedFacts: number;
    establishedFacts: number;
    totalRules: number;
    enabledRules: number;
    conflictCount: number;
    rulesByCategory: Record<string, number>;
  } {
    const derived = this.getDerivedFacts().length;
    const rulesByCategory: Record<string, number> = {};

    for (const rule of this.rules.values()) {
      rulesByCategory[rule.category] = (rulesByCategory[rule.category] || 0) + 1;
    }

    return {
      totalFacts: this.facts.size,
      derivedFacts: derived,
      establishedFacts: this.facts.size - derived,
      totalRules: this.rules.size,
      enabledRules: Array.from(this.rules.values()).filter(r => r.enabled).length,
      conflictCount: this.conflicts.length,
      rulesByCategory,
    };
  }

  /**
   * Export to JSON
   */
  toJSON(): string {
    return JSON.stringify({
      facts: Array.from(this.facts.values()),
      rules: Array.from(this.rules.values()),
      conflicts: this.conflicts,
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  static fromJSON(json: string): InferenceRuleEngine {
    const data = JSON.parse(json);
    const engine = new InferenceRuleEngine();

    // Clear defaults
    engine.facts.clear();
    engine.rules.clear();

    // Import facts
    for (const fact of data.facts) {
      engine.facts.set(fact.id, fact);
      engine.indexFact(fact);
    }

    // Import rules
    for (const rule of data.rules) {
      engine.rules.set(rule.id, rule);
    }

    engine.conflicts = data.conflicts || [];

    return engine;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.facts.clear();
    this.subjectIndex.clear();
    this.predicateIndex.clear();
    this.objectIndex.clear();
    this.conflicts = [];
    this.sessionDerivedIds.clear();
  }

  /**
   * Clear only derived facts (keep established facts)
   */
  clearDerived(): void {
    for (const [id, fact] of this.facts) {
      if (fact.derived) {
        this.removeFact(id);
      }
    }
    this.sessionDerivedIds.clear();
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default InferenceRuleEngine;
