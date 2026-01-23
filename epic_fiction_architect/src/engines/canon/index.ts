/**
 * Canon Module Framework
 *
 * A comprehensive system for importing, managing, and validating against
 * external canon from visited universes. Designed for JumpChain stories
 * that weave through multiple fictional universes.
 *
 * Supports:
 * - Pre-built canon modules for popular universes
 * - Custom canon definition and import
 * - Canon versioning (different continuities)
 * - Timeline-aware canon (events that change over time)
 * - Canon conflict detection
 * - Soft vs hard canon distinction
 * - Fanon integration with marking
 *
 * @module engines/canon
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Canonicity level - how authoritative is this information?
 */
export enum CanonicityLevel {
  /** Primary source material (manga, original novels, etc.) */
  PRIMARY = 'primary',
  /** Secondary canon (anime adaptations, official spinoffs) */
  SECONDARY = 'secondary',
  /** Tertiary (games, movies that may contradict) */
  TERTIARY = 'tertiary',
  /** Word of God (author statements) */
  WORD_OF_GOD = 'word_of_god',
  /** Common fanon accepted by community */
  FANON = 'fanon',
  /** Your story's additions */
  ORIGINAL = 'original',
}

/**
 * Type of canon entry
 */
export enum CanonEntryType {
  CHARACTER = 'character',
  LOCATION = 'location',
  EVENT = 'event',
  RULE = 'rule',
  POWER_SYSTEM = 'power_system',
  TECHNOLOGY = 'technology',
  SPECIES = 'species',
  ORGANIZATION = 'organization',
  ITEM = 'item',
  RELATIONSHIP = 'relationship',
  TIMELINE = 'timeline',
  CONCEPT = 'concept',
}

/**
 * A single piece of canon information
 */
export interface CanonEntry {
  id: string;
  moduleId: string;
  type: CanonEntryType;
  name: string;
  aliases: string[];

  /** The canonical information */
  description: string;

  /** Structured data for validation */
  attributes: Record<string, CanonAttribute>;

  /** When in the source timeline this is valid */
  validFrom?: CanonTimepoint;
  validUntil?: CanonTimepoint;

  /** Canonicity level */
  canonicity: CanonicityLevel;

  /** Source reference */
  source: CanonSource;

  /** Related entries */
  relatedEntryIds: string[];

  /** Tags for searching */
  tags: string[];

  /** Custom metadata */
  metadata: Record<string, unknown>;
}

/**
 * A canon attribute with type information for validation
 */
export interface CanonAttribute {
  key: string;
  value: unknown;
  valueType: 'string' | 'number' | 'boolean' | 'enum' | 'range' | 'list' | 'reference';

  /** For enum types */
  allowedValues?: unknown[];

  /** For range types */
  min?: number;
  max?: number;

  /** For reference types - what entity type it references */
  referenceType?: CanonEntryType;

  /** Can this attribute change over the timeline? */
  mutable: boolean;

  /** Source for this specific attribute */
  source?: CanonSource;
}

/**
 * Source reference for canon
 */
export interface CanonSource {
  type: 'book' | 'chapter' | 'episode' | 'movie' | 'game' | 'interview' | 'wiki' | 'custom';
  title: string;
  volume?: string;
  chapter?: string;
  episode?: string;
  page?: string;
  timestamp?: string;
  url?: string;
  notes?: string;
}

/**
 * Timepoint within source material
 */
export interface CanonTimepoint {
  /** Name of the arc/saga */
  arc?: string;
  /** Relative position (e.g., "before Chunin Exams", "post-Time Skip") */
  marker?: string;
  /** If the source has years */
  year?: number;
  /** Ordinal position in timeline */
  order?: number;
}

/**
 * A rule that governs the universe
 */
export interface CanonRule {
  id: string;
  moduleId: string;
  name: string;
  description: string;
  category: string;

  /** Rule type for validation */
  ruleType: 'must' | 'must_not' | 'can' | 'cannot' | 'if_then' | 'constraint';

  /** The rule expressed as a constraint */
  constraint: CanonConstraint;

  /** How strictly to enforce */
  enforcement: 'strict' | 'soft' | 'guideline';

  /** Known exceptions */
  exceptions: string[];

  /** Source */
  source: CanonSource;
  canonicity: CanonicityLevel;
}

/**
 * A constraint for rule validation
 */
export interface CanonConstraint {
  subject: string;
  subjectType?: CanonEntryType;
  predicate: string;
  object?: string;
  objectType?: CanonEntryType;
  condition?: string;

  /** For numerical constraints */
  operator?: 'equals' | 'not_equals' | 'greater' | 'less' | 'greater_eq' | 'less_eq' | 'between';
  value?: number;
  minValue?: number;
  maxValue?: number;
}

/**
 * A complete canon module for a universe
 */
export interface CanonModule {
  id: string;
  name: string;
  universe: string;
  version: string;

  /** Description of this canon module */
  description: string;

  /** What continuity/timeline this represents */
  continuity: string;

  /** When this module was created/updated */
  createdAt: Date;
  updatedAt: Date;

  /** Author of this module */
  author?: string;

  /** All canon entries */
  entries: Map<string, CanonEntry>;

  /** All canon rules */
  rules: Map<string, CanonRule>;

  /** Timeline markers for this universe */
  timeline: CanonTimeline;

  /** Power system definitions */
  powerSystems: CanonPowerSystem[];

  /** Default assumptions when not specified */
  defaults: Record<string, unknown>;

  /** Relationships between entries */
  relationships: CanonRelationship[];

  /** Tags for categorization */
  tags: string[];
}

/**
 * Timeline structure for a universe
 */
export interface CanonTimeline {
  name: string;
  description?: string;

  /** Major eras/arcs in order */
  eras: {
    id: string;
    name: string;
    order: number;
    description?: string;
    startMarker?: string;
    endMarker?: string;
  }[];

  /** Key events in chronological order */
  keyEvents: {
    id: string;
    name: string;
    eraId: string;
    order: number;
    description?: string;
  }[];
}

/**
 * Power system definition
 */
export interface CanonPowerSystem {
  id: string;
  name: string;
  description: string;

  /** How powers are acquired */
  acquisitionMethod: string[];

  /** Power categories/types */
  categories: string[];

  /** Power scaling (if applicable) */
  scaling?: {
    metric: string;
    ranks: string[];
    numerical?: boolean;
  };

  /** Limitations */
  limitations: string[];

  /** How it interacts with other power systems */
  interactions: {
    systemId: string;
    interaction: 'compatible' | 'incompatible' | 'enhances' | 'conflicts' | 'neutral';
    notes?: string;
  }[];

  /** Rules specific to this power system */
  rules: CanonRule[];
}

/**
 * Relationship between canon entries
 */
export interface CanonRelationship {
  id: string;
  sourceEntryId: string;
  targetEntryId: string;
  relationshipType: string;
  bidirectional: boolean;
  validFrom?: CanonTimepoint;
  validUntil?: CanonTimepoint;
  description?: string;
}

/**
 * Result of validating against canon
 */
export interface CanonValidationResult {
  valid: boolean;
  violations: CanonViolation[];
  warnings: CanonWarning[];
  suggestions: string[];
}

export interface CanonViolation {
  id: string;
  severity: 'critical' | 'major' | 'minor';
  type: 'contradiction' | 'impossibility' | 'anachronism' | 'rule_violation';
  description: string;
  canonEntry?: CanonEntry;
  canonRule?: CanonRule;
  yourContent: string;
  suggestedFix?: string;
}

export interface CanonWarning {
  id: string;
  type: 'potential_conflict' | 'ambiguous' | 'fanon_conflict' | 'timeline_unclear';
  description: string;
  relatedEntry?: CanonEntry;
}

// ============================================================================
// CANON MODULE FRAMEWORK
// ============================================================================

/**
 * Canon Module Framework
 *
 * Central system for managing canon across multiple universes.
 */
export class CanonModuleFramework {
  private modules: Map<string, CanonModule> = new Map();
  private activeModules: Set<string> = new Set();

  /** Index for fast lookup by name/alias */
  private nameIndex: Map<string, Set<string>> = new Map();

  /** Index for fast lookup by type */
  private typeIndex: Map<CanonEntryType, Set<string>> = new Map();

  constructor() {
    // Initialize type index
    for (const type of Object.values(CanonEntryType)) {
      this.typeIndex.set(type, new Set());
    }
  }

  // ==========================================================================
  // MODULE MANAGEMENT
  // ==========================================================================

  /**
   * Register a new canon module
   */
  registerModule(module: Omit<CanonModule, 'id' | 'createdAt' | 'updatedAt'>): CanonModule {
    const id = uuidv4();
    const now = new Date();

    const fullModule: CanonModule = {
      ...module,
      id,
      entries: module.entries instanceof Map ? module.entries : new Map(Object.entries(module.entries || {})),
      rules: module.rules instanceof Map ? module.rules : new Map(Object.entries(module.rules || {})),
      createdAt: now,
      updatedAt: now,
    };

    this.modules.set(id, fullModule);
    this.indexModule(fullModule);

    return fullModule;
  }

  /**
   * Import a pre-built module from JSON
   */
  importModule(json: string): CanonModule {
    const data = JSON.parse(json);

    // Convert arrays back to maps
    if (Array.isArray(data.entries)) {
      data.entries = new Map(data.entries);
    }
    if (Array.isArray(data.rules)) {
      data.rules = new Map(data.rules);
    }

    return this.registerModule(data);
  }

  /**
   * Export a module to JSON
   */
  exportModule(moduleId: string): string | null {
    const module = this.modules.get(moduleId);
    if (!module) return null;

    return JSON.stringify({
      ...module,
      entries: Array.from(module.entries.entries()),
      rules: Array.from(module.rules.entries()),
    }, null, 2);
  }

  /**
   * Activate a module for validation
   */
  activateModule(moduleId: string): boolean {
    if (!this.modules.has(moduleId)) return false;
    this.activeModules.add(moduleId);
    return true;
  }

  /**
   * Deactivate a module
   */
  deactivateModule(moduleId: string): void {
    this.activeModules.delete(moduleId);
  }

  /**
   * Get all registered modules
   */
  getModules(): CanonModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get active modules
   */
  getActiveModules(): CanonModule[] {
    return Array.from(this.activeModules).map(id => this.modules.get(id)!).filter(Boolean);
  }

  /**
   * Get a specific module
   */
  getModule(moduleId: string): CanonModule | undefined {
    return this.modules.get(moduleId);
  }

  // ==========================================================================
  // ENTRY MANAGEMENT
  // ==========================================================================

  /**
   * Add an entry to a module
   */
  addEntry(moduleId: string, entry: Omit<CanonEntry, 'id' | 'moduleId'>): CanonEntry | null {
    const module = this.modules.get(moduleId);
    if (!module) return null;

    const id = uuidv4();
    const fullEntry: CanonEntry = {
      ...entry,
      id,
      moduleId,
    };

    module.entries.set(id, fullEntry);
    module.updatedAt = new Date();
    this.indexEntry(fullEntry);

    return fullEntry;
  }

  /**
   * Update an entry
   */
  updateEntry(entryId: string, updates: Partial<CanonEntry>): CanonEntry | null {
    for (const module of this.modules.values()) {
      const entry = module.entries.get(entryId);
      if (entry) {
        const updated = { ...entry, ...updates, id: entry.id, moduleId: entry.moduleId };
        module.entries.set(entryId, updated);
        module.updatedAt = new Date();
        this.reindexEntry(entry, updated);
        return updated;
      }
    }
    return null;
  }

  /**
   * Get an entry by ID
   */
  getEntry(entryId: string): CanonEntry | null {
    for (const module of this.modules.values()) {
      const entry = module.entries.get(entryId);
      if (entry) return entry;
    }
    return null;
  }

  /**
   * Find entries by name or alias
   */
  findEntriesByName(name: string, options?: {
    moduleIds?: string[];
    type?: CanonEntryType;
    fuzzy?: boolean;
  }): CanonEntry[] {
    const results: CanonEntry[] = [];
    const searchName = name.toLowerCase();

    // Use index for exact matches
    const exactMatches = this.nameIndex.get(searchName);
    if (exactMatches) {
      for (const entryId of exactMatches) {
        const entry = this.getEntry(entryId);
        if (entry) {
          if (options?.moduleIds && !options.moduleIds.includes(entry.moduleId)) continue;
          if (options?.type && entry.type !== options.type) continue;
          results.push(entry);
        }
      }
    }

    // Fuzzy search if requested and no exact matches
    if (options?.fuzzy && results.length === 0) {
      for (const module of this.modules.values()) {
        if (options?.moduleIds && !options.moduleIds.includes(module.id)) continue;

        for (const entry of module.entries.values()) {
          if (options?.type && entry.type !== options.type) continue;

          // Check if name contains search term
          if (entry.name.toLowerCase().includes(searchName)) {
            results.push(entry);
          } else if (entry.aliases.some(a => a.toLowerCase().includes(searchName))) {
            results.push(entry);
          }
        }
      }
    }

    return results;
  }

  /**
   * Find entries by type
   */
  findEntriesByType(type: CanonEntryType, moduleIds?: string[]): CanonEntry[] {
    const entryIds = this.typeIndex.get(type);
    if (!entryIds) return [];

    const results: CanonEntry[] = [];
    for (const entryId of entryIds) {
      const entry = this.getEntry(entryId);
      if (entry && (!moduleIds || moduleIds.includes(entry.moduleId))) {
        results.push(entry);
      }
    }

    return results;
  }

  // ==========================================================================
  // RULE MANAGEMENT
  // ==========================================================================

  /**
   * Add a rule to a module
   */
  addRule(moduleId: string, rule: Omit<CanonRule, 'id' | 'moduleId'>): CanonRule | null {
    const module = this.modules.get(moduleId);
    if (!module) return null;

    const id = uuidv4();
    const fullRule: CanonRule = {
      ...rule,
      id,
      moduleId,
    };

    module.rules.set(id, fullRule);
    module.updatedAt = new Date();

    return fullRule;
  }

  /**
   * Get all rules for active modules
   */
  getActiveRules(): CanonRule[] {
    const rules: CanonRule[] = [];

    for (const moduleId of this.activeModules) {
      const module = this.modules.get(moduleId);
      if (module) {
        rules.push(...module.rules.values());
      }
    }

    return rules;
  }

  /**
   * Get rules by category
   */
  getRulesByCategory(category: string): CanonRule[] {
    const rules: CanonRule[] = [];

    for (const module of this.modules.values()) {
      for (const rule of module.rules.values()) {
        if (rule.category === category) {
          rules.push(rule);
        }
      }
    }

    return rules;
  }

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  /**
   * Validate content against active canon modules
   */
  validateAgainstCanon(content: {
    text: string;
    entities: {
      name: string;
      type: CanonEntryType;
      attributes?: Record<string, unknown>;
    }[];
    claims: {
      subject: string;
      predicate: string;
      object?: string;
    }[];
    timepoint?: CanonTimepoint;
  }): CanonValidationResult {
    const violations: CanonViolation[] = [];
    const warnings: CanonWarning[] = [];
    const suggestions: string[] = [];

    // Check each entity against canon
    for (const entity of content.entities) {
      const canonEntries = this.findEntriesByName(entity.name, {
        moduleIds: Array.from(this.activeModules),
        type: entity.type,
        fuzzy: true,
      });

      if (canonEntries.length > 0) {
        // Found canon entry - check attributes
        for (const canonEntry of canonEntries) {
          if (entity.attributes) {
            for (const [key, value] of Object.entries(entity.attributes)) {
              const canonAttr = canonEntry.attributes[key];
              if (canonAttr && !this.attributeMatches(canonAttr, value)) {
                violations.push({
                  id: uuidv4(),
                  severity: canonAttr.mutable ? 'minor' : 'major',
                  type: 'contradiction',
                  description: `${entity.name}'s ${key} is "${value}" but canon says "${canonAttr.value}"`,
                  canonEntry,
                  yourContent: JSON.stringify(entity),
                  suggestedFix: `Change ${key} to "${canonAttr.value}" or add explanation for difference`,
                });
              }
            }
          }

          // Check timepoint validity
          if (content.timepoint && canonEntry.validFrom) {
            if (!this.isTimepointValid(content.timepoint, canonEntry.validFrom, canonEntry.validUntil)) {
              warnings.push({
                id: uuidv4(),
                type: 'anachronism' as 'potential_conflict',
                description: `${entity.name} may not exist/be relevant at this point in the timeline`,
                relatedEntry: canonEntry,
              });
            }
          }
        }
      }
    }

    // Check claims against rules
    const activeRules = this.getActiveRules();
    for (const claim of content.claims) {
      for (const rule of activeRules) {
        if (this.ruleApplies(rule, claim)) {
          const violation = this.checkRuleViolation(rule, claim);
          if (violation) {
            violations.push(violation);
          }
        }
      }
    }

    // Generate suggestions based on findings
    if (violations.length > 0) {
      suggestions.push('Review the listed canon violations and either correct them or add in-story explanations');
    }
    if (warnings.length > 0) {
      suggestions.push('Consider the timeline warnings - these may be intentional divergences or need clarification');
    }

    return {
      valid: violations.filter(v => v.severity === 'critical').length === 0,
      violations,
      warnings,
      suggestions,
    };
  }

  /**
   * Check if an attribute value matches canon
   */
  private attributeMatches(canonAttr: CanonAttribute, value: unknown): boolean {
    switch (canonAttr.valueType) {
      case 'string':
        return String(canonAttr.value).toLowerCase() === String(value).toLowerCase();

      case 'number':
        return Number(canonAttr.value) === Number(value);

      case 'boolean':
        return Boolean(canonAttr.value) === Boolean(value);

      case 'enum':
        if (canonAttr.allowedValues) {
          return canonAttr.allowedValues.includes(value);
        }
        return canonAttr.value === value;

      case 'range':
        const numValue = Number(value);
        if (canonAttr.min !== undefined && numValue < canonAttr.min) return false;
        if (canonAttr.max !== undefined && numValue > canonAttr.max) return false;
        return true;

      case 'list':
        if (Array.isArray(canonAttr.value) && Array.isArray(value)) {
          return value.every(v => (canonAttr.value as unknown[]).includes(v));
        }
        return false;

      default:
        return canonAttr.value === value;
    }
  }

  /**
   * Check if a timepoint is within valid range
   */
  private isTimepointValid(
    current: CanonTimepoint,
    validFrom: CanonTimepoint,
    validUntil?: CanonTimepoint
  ): boolean {
    // Compare by order if available
    if (current.order !== undefined && validFrom.order !== undefined) {
      if (current.order < validFrom.order) return false;
      if (validUntil?.order !== undefined && current.order > validUntil.order) return false;
      return true;
    }

    // Compare by year if available
    if (current.year !== undefined && validFrom.year !== undefined) {
      if (current.year < validFrom.year) return false;
      if (validUntil?.year !== undefined && current.year > validUntil.year) return false;
      return true;
    }

    // Default to valid if we can't determine
    return true;
  }

  /**
   * Check if a rule applies to a claim
   */
  private ruleApplies(rule: CanonRule, claim: { subject: string; predicate: string; object?: string }): boolean {
    const constraint = rule.constraint;

    // Check subject match
    if (constraint.subject !== '*' &&
        !claim.subject.toLowerCase().includes(constraint.subject.toLowerCase())) {
      return false;
    }

    // Check predicate match
    if (!claim.predicate.toLowerCase().includes(constraint.predicate.toLowerCase())) {
      return false;
    }

    return true;
  }

  /**
   * Check if a claim violates a rule
   */
  private checkRuleViolation(
    rule: CanonRule,
    claim: { subject: string; predicate: string; object?: string }
  ): CanonViolation | null {
    const constraint = rule.constraint;

    switch (rule.ruleType) {
      case 'cannot':
        // If the rule says "cannot" and the claim asserts it happens, that's a violation
        return {
          id: uuidv4(),
          severity: rule.enforcement === 'strict' ? 'critical' : 'major',
          type: 'rule_violation',
          description: `Violates rule "${rule.name}": ${constraint.subject} cannot ${constraint.predicate}`,
          canonRule: rule,
          yourContent: `${claim.subject} ${claim.predicate} ${claim.object || ''}`.trim(),
          suggestedFix: rule.exceptions.length > 0
            ? `Consider if this falls under an exception: ${rule.exceptions.join(', ')}`
            : 'Remove this claim or add special justification',
        };

      case 'must_not':
        return {
          id: uuidv4(),
          severity: 'critical',
          type: 'rule_violation',
          description: `Hard violation of "${rule.name}": ${claim.subject} must not ${claim.predicate}`,
          canonRule: rule,
          yourContent: `${claim.subject} ${claim.predicate} ${claim.object || ''}`.trim(),
          suggestedFix: 'This is a strict rule with no exceptions - content must be revised',
        };

      default:
        return null;
    }
  }

  // ==========================================================================
  // INDEXING
  // ==========================================================================

  private indexModule(module: CanonModule): void {
    for (const entry of module.entries.values()) {
      this.indexEntry(entry);
    }
  }

  private indexEntry(entry: CanonEntry): void {
    // Index by name
    const nameLower = entry.name.toLowerCase();
    if (!this.nameIndex.has(nameLower)) {
      this.nameIndex.set(nameLower, new Set());
    }
    this.nameIndex.get(nameLower)!.add(entry.id);

    // Index aliases
    for (const alias of entry.aliases) {
      const aliasLower = alias.toLowerCase();
      if (!this.nameIndex.has(aliasLower)) {
        this.nameIndex.set(aliasLower, new Set());
      }
      this.nameIndex.get(aliasLower)!.add(entry.id);
    }

    // Index by type
    this.typeIndex.get(entry.type)?.add(entry.id);
  }

  private reindexEntry(oldEntry: CanonEntry, newEntry: CanonEntry): void {
    // Remove old indexes
    const oldNameLower = oldEntry.name.toLowerCase();
    this.nameIndex.get(oldNameLower)?.delete(oldEntry.id);
    for (const alias of oldEntry.aliases) {
      this.nameIndex.get(alias.toLowerCase())?.delete(oldEntry.id);
    }

    // Add new indexes
    this.indexEntry(newEntry);
  }

  // ==========================================================================
  // UNIVERSE-SPECIFIC HELPERS
  // ==========================================================================

  /**
   * Get the power system for a universe
   */
  getPowerSystem(moduleId: string, systemName: string): CanonPowerSystem | undefined {
    const module = this.modules.get(moduleId);
    if (!module) return undefined;
    return module.powerSystems.find(ps => ps.name.toLowerCase() === systemName.toLowerCase());
  }

  /**
   * Check power compatibility between universes
   */
  checkPowerCompatibility(
    sourcePowerSystemId: string,
    targetModuleId: string
  ): { compatible: boolean; issues: string[] } {
    const targetModule = this.modules.get(targetModuleId);
    if (!targetModule) {
      return { compatible: true, issues: ['Target module not found - assuming compatible'] };
    }

    const issues: string[] = [];

    for (const targetSystem of targetModule.powerSystems) {
      const interaction = targetSystem.interactions.find(i => i.systemId === sourcePowerSystemId);
      if (interaction) {
        if (interaction.interaction === 'incompatible' || interaction.interaction === 'conflicts') {
          issues.push(`${targetSystem.name} ${interaction.interaction} with source power: ${interaction.notes || ''}`);
        }
      }
    }

    return {
      compatible: issues.length === 0,
      issues,
    };
  }

  /**
   * Get timeline for a universe
   */
  getTimeline(moduleId: string): CanonTimeline | undefined {
    return this.modules.get(moduleId)?.timeline;
  }

  /**
   * Find where in the timeline an event should be placed
   */
  findTimelinePosition(moduleId: string, eventDescription: string): CanonTimepoint | null {
    const module = this.modules.get(moduleId);
    if (!module) return null;

    const timeline = module.timeline;
    const descLower = eventDescription.toLowerCase();

    // Check key events
    for (const event of timeline.keyEvents) {
      if (descLower.includes(event.name.toLowerCase())) {
        const era = timeline.eras.find(e => e.id === event.eraId);
        return {
          arc: era?.name,
          marker: event.name,
          order: event.order,
        };
      }
    }

    // Check eras
    for (const era of timeline.eras) {
      if (descLower.includes(era.name.toLowerCase())) {
        return {
          arc: era.name,
          order: era.order,
        };
      }
    }

    return null;
  }

  // ==========================================================================
  // STATISTICS & EXPORT
  // ==========================================================================

  /**
   * Get statistics about loaded canon
   */
  getStats(): {
    totalModules: number;
    activeModules: number;
    totalEntries: number;
    totalRules: number;
    entriesByType: Record<string, number>;
    entriesByCanonicity: Record<string, number>;
  } {
    let totalEntries = 0;
    let totalRules = 0;
    const entriesByType: Record<string, number> = {};
    const entriesByCanonicity: Record<string, number> = {};

    for (const module of this.modules.values()) {
      totalEntries += module.entries.size;
      totalRules += module.rules.size;

      for (const entry of module.entries.values()) {
        entriesByType[entry.type] = (entriesByType[entry.type] || 0) + 1;
        entriesByCanonicity[entry.canonicity] = (entriesByCanonicity[entry.canonicity] || 0) + 1;
      }
    }

    return {
      totalModules: this.modules.size,
      activeModules: this.activeModules.size,
      totalEntries,
      totalRules,
      entriesByType,
      entriesByCanonicity,
    };
  }

  /**
   * Export all modules to JSON
   */
  exportAll(): string {
    const modules: unknown[] = [];

    for (const module of this.modules.values()) {
      modules.push({
        ...module,
        entries: Array.from(module.entries.entries()),
        rules: Array.from(module.rules.entries()),
      });
    }

    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      modules,
      activeModuleIds: Array.from(this.activeModules),
    }, null, 2);
  }

  /**
   * Import all modules from JSON
   */
  importAll(json: string): void {
    const data = JSON.parse(json);

    for (const moduleData of data.modules) {
      this.importModule(JSON.stringify(moduleData));
    }

    if (data.activeModuleIds) {
      for (const id of data.activeModuleIds) {
        this.activateModule(id);
      }
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.modules.clear();
    this.activeModules.clear();
    this.nameIndex.clear();
    for (const type of Object.values(CanonEntryType)) {
      this.typeIndex.set(type, new Set());
    }
  }
}

// ============================================================================
// PRE-BUILT UNIVERSE TEMPLATES
// ============================================================================

/**
 * Create a basic canon module template for a universe
 */
export function createCanonModuleTemplate(
  universe: string,
  continuity: string = 'main'
): Omit<CanonModule, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: `${universe} Canon`,
    universe,
    version: '1.0.0',
    description: `Canon module for ${universe}`,
    continuity,
    entries: new Map(),
    rules: new Map(),
    timeline: {
      name: `${universe} Timeline`,
      eras: [],
      keyEvents: [],
    },
    powerSystems: [],
    defaults: {},
    relationships: [],
    tags: [universe.toLowerCase()],
  };
}

/**
 * Create a character entry template
 */
export function createCharacterTemplate(
  name: string,
  attributes: Record<string, unknown> = {}
): Omit<CanonEntry, 'id' | 'moduleId'> {
  return {
    type: CanonEntryType.CHARACTER,
    name,
    aliases: [],
    description: '',
    attributes: Object.entries(attributes).reduce((acc, [key, value]) => {
      acc[key] = {
        key,
        value,
        valueType: typeof value as 'string' | 'number' | 'boolean',
        mutable: key !== 'species' && key !== 'birthdate',
      };
      return acc;
    }, {} as Record<string, CanonAttribute>),
    canonicity: CanonicityLevel.PRIMARY,
    source: {
      type: 'custom',
      title: 'User Defined',
    },
    relatedEntryIds: [],
    tags: [],
    metadata: {},
  };
}

/**
 * Create a rule template
 */
export function createRuleTemplate(
  name: string,
  category: string,
  constraint: CanonConstraint
): Omit<CanonRule, 'id' | 'moduleId'> {
  return {
    name,
    description: '',
    category,
    ruleType: 'cannot',
    constraint,
    enforcement: 'soft',
    exceptions: [],
    source: {
      type: 'custom',
      title: 'User Defined',
    },
    canonicity: CanonicityLevel.PRIMARY,
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default CanonModuleFramework;
