/**
 * Epic Fiction Architect - Cross-Reference Tracker
 *
 * Tracks and maintains relationships between all entities across the story.
 * Supports bidirectional references, reference validation, and orphan detection.
 * Designed for 12,000+ chapter stories with thousands of interconnected entities.
 */

import { EntityType, Entity } from './entity-registry';

/**
 * Types of cross-references between entities
 */
export enum ReferenceType {
  // Character references
  BELONGS_TO = 'belongs_to',           // Character belongs to faction
  LOCATED_AT = 'located_at',           // Character/item at location
  OWNS = 'owns',                       // Character owns item
  HAS_POWER = 'has_power',             // Character has power
  KNOWS = 'knows',                     // Character knows another
  RELATED_TO = 'related_to',           // Family relationship
  EMPLOYED_BY = 'employed_by',         // Works for faction/character

  // Location references
  CONTAINS = 'contains',               // Location contains sublocation
  CONNECTED_TO = 'connected_to',       // Locations are connected
  RULED_BY = 'ruled_by',               // Location ruled by character/faction

  // Power references
  DERIVED_FROM = 'derived_from',       // Power derived from another
  COUNTERS = 'counters',               // Power counters another
  ENHANCES = 'enhances',               // Power enhances another
  REQUIRES = 'requires',               // Power requires item/condition

  // Faction references
  ALLIED_WITH = 'allied_with',         // Factions are allied
  ENEMIES_WITH = 'enemies_with',       // Factions are enemies
  CONTROLS = 'controls',               // Faction controls location

  // Item references
  CREATED_BY = 'created_by',           // Item created by character
  FOUND_AT = 'found_at',               // Item found at location
  COMPONENT_OF = 'component_of',       // Item is component of another

  // Event references
  PARTICIPATED_IN = 'participated_in', // Character in event
  OCCURRED_AT = 'occurred_at',         // Event at location
  CAUSED_BY = 'caused_by',             // Event caused by entity
  RESULTED_IN = 'resulted_in',         // Event resulted in another

  // Generic references
  MENTIONED_IN = 'mentioned_in',       // Entity mentioned in chapter
  REFERENCES = 'references',           // Generic reference
  PREDECESSOR_OF = 'predecessor_of',   // Temporal predecessor
  SUCCESSOR_OF = 'successor_of',       // Temporal successor
  INSPIRED_BY = 'inspired_by',         // Creative inspiration
  SIMILAR_TO = 'similar_to'            // Similarity reference
}

/**
 * Reference strength/importance
 */
export enum ReferenceStrength {
  CRITICAL = 'critical',     // Plot-critical connection
  STRONG = 'strong',         // Important connection
  MODERATE = 'moderate',     // Notable connection
  WEAK = 'weak',             // Minor connection
  HISTORICAL = 'historical'  // Past connection (no longer active)
}

/**
 * Reference status
 */
export enum ReferenceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',       // Foreshadowed but not yet established
  BROKEN = 'broken',         // Was active, now severed
  SECRET = 'secret'          // Hidden from public knowledge
}

/**
 * A cross-reference between two entities
 */
export interface CrossReference {
  id: string;
  sourceId: string;
  sourceType: EntityType;
  targetId: string;
  targetType: EntityType;
  referenceType: ReferenceType;
  strength: ReferenceStrength;
  status: ReferenceStatus;

  // Metadata
  description?: string;
  establishedChapter?: number;
  endedChapter?: number;

  // Context
  context?: {
    reason?: string;
    conditions?: string[];
    notes?: string;
  };

  // Bidirectional reference info
  bidirectional: boolean;
  inverseType?: ReferenceType;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reference validation error
 */
export interface ReferenceError {
  referenceId: string;
  errorType: ReferenceErrorType;
  message: string;
  sourceId: string;
  targetId: string;
  severity: 'critical' | 'warning' | 'info';
  suggestedFix?: string;
}

export enum ReferenceErrorType {
  ORPHAN_SOURCE = 'orphan_source',       // Source entity doesn't exist
  ORPHAN_TARGET = 'orphan_target',       // Target entity doesn't exist
  INVALID_TYPE_COMBO = 'invalid_type_combo', // Invalid source/target type combo
  CIRCULAR_REFERENCE = 'circular_reference', // Circular dependency
  DUPLICATE_REFERENCE = 'duplicate_reference', // Same reference exists
  TIMELINE_CONFLICT = 'timeline_conflict',   // Reference timeline issues
  STATUS_CONFLICT = 'status_conflict',       // Incompatible statuses
  MISSING_INVERSE = 'missing_inverse'        // Bidirectional without inverse
}

/**
 * Query options for finding references
 */
export interface ReferenceQuery {
  sourceId?: string;
  targetId?: string;
  sourceType?: EntityType;
  targetType?: EntityType;
  referenceType?: ReferenceType | ReferenceType[];
  strength?: ReferenceStrength | ReferenceStrength[];
  status?: ReferenceStatus | ReferenceStatus[];
  bidirectionalOnly?: boolean;
  establishedBefore?: number;
  establishedAfter?: number;
  includeInactive?: boolean;
}

/**
 * Reference graph node for visualization
 */
export interface ReferenceNode {
  id: string;
  type: EntityType;
  name: string;
  connections: number;
  inbound: number;
  outbound: number;
}

/**
 * Reference graph edge for visualization
 */
export interface ReferenceEdge {
  source: string;
  target: string;
  type: ReferenceType;
  strength: ReferenceStrength;
  bidirectional: boolean;
}

/**
 * Reference graph for visualization
 */
export interface ReferenceGraph {
  nodes: ReferenceNode[];
  edges: ReferenceEdge[];
  clusters: Map<EntityType, string[]>;
}

/**
 * Valid reference type combinations
 */
const VALID_REFERENCE_COMBOS: Map<ReferenceType, Array<[EntityType, EntityType]>> = new Map([
  [ReferenceType.BELONGS_TO, [
    [EntityType.CHARACTER, EntityType.FACTION],
    [EntityType.LOCATION, EntityType.FACTION]
  ]],
  [ReferenceType.LOCATED_AT, [
    [EntityType.CHARACTER, EntityType.LOCATION],
    [EntityType.ITEM, EntityType.LOCATION],
    [EntityType.FACTION, EntityType.LOCATION]
  ]],
  [ReferenceType.OWNS, [
    [EntityType.CHARACTER, EntityType.ITEM],
    [EntityType.FACTION, EntityType.ITEM],
    [EntityType.CHARACTER, EntityType.LOCATION]
  ]],
  [ReferenceType.HAS_POWER, [
    [EntityType.CHARACTER, EntityType.POWER],
    [EntityType.ITEM, EntityType.POWER],
    [EntityType.FACTION, EntityType.POWER]
  ]],
  [ReferenceType.KNOWS, [
    [EntityType.CHARACTER, EntityType.CHARACTER]
  ]],
  [ReferenceType.RELATED_TO, [
    [EntityType.CHARACTER, EntityType.CHARACTER]
  ]],
  [ReferenceType.CONTAINS, [
    [EntityType.LOCATION, EntityType.LOCATION]
  ]],
  [ReferenceType.CONNECTED_TO, [
    [EntityType.LOCATION, EntityType.LOCATION]
  ]],
  [ReferenceType.RULED_BY, [
    [EntityType.LOCATION, EntityType.CHARACTER],
    [EntityType.LOCATION, EntityType.FACTION]
  ]],
  [ReferenceType.ALLIED_WITH, [
    [EntityType.FACTION, EntityType.FACTION],
    [EntityType.CHARACTER, EntityType.CHARACTER]
  ]],
  [ReferenceType.ENEMIES_WITH, [
    [EntityType.FACTION, EntityType.FACTION],
    [EntityType.CHARACTER, EntityType.CHARACTER]
  ]],
  [ReferenceType.CONTROLS, [
    [EntityType.FACTION, EntityType.LOCATION],
    [EntityType.CHARACTER, EntityType.LOCATION]
  ]],
  [ReferenceType.CREATED_BY, [
    [EntityType.ITEM, EntityType.CHARACTER],
    [EntityType.POWER, EntityType.CHARACTER]
  ]],
  [ReferenceType.DERIVED_FROM, [
    [EntityType.POWER, EntityType.POWER]
  ]],
  [ReferenceType.COUNTERS, [
    [EntityType.POWER, EntityType.POWER]
  ]],
  [ReferenceType.ENHANCES, [
    [EntityType.POWER, EntityType.POWER],
    [EntityType.ITEM, EntityType.POWER]
  ]]
]);

/**
 * Inverse reference type mappings for bidirectional references
 */
const INVERSE_REFERENCE_TYPES: Map<ReferenceType, ReferenceType> = new Map([
  [ReferenceType.OWNS, ReferenceType.BELONGS_TO],
  [ReferenceType.CONTAINS, ReferenceType.LOCATED_AT],
  [ReferenceType.ALLIED_WITH, ReferenceType.ALLIED_WITH],
  [ReferenceType.ENEMIES_WITH, ReferenceType.ENEMIES_WITH],
  [ReferenceType.CONNECTED_TO, ReferenceType.CONNECTED_TO],
  [ReferenceType.KNOWS, ReferenceType.KNOWS],
  [ReferenceType.RELATED_TO, ReferenceType.RELATED_TO],
  [ReferenceType.SIMILAR_TO, ReferenceType.SIMILAR_TO],
  [ReferenceType.COUNTERS, ReferenceType.COUNTERS],
  [ReferenceType.PREDECESSOR_OF, ReferenceType.SUCCESSOR_OF],
  [ReferenceType.SUCCESSOR_OF, ReferenceType.PREDECESSOR_OF]
]);

/**
 * Cross-Reference Tracker
 *
 * Maintains all relationships between entities with validation,
 * graph traversal, and orphan detection capabilities.
 */
export class CrossReferenceTracker {
  private references: Map<string, CrossReference> = new Map();
  private referencesBySource: Map<string, Set<string>> = new Map();
  private referencesByTarget: Map<string, Set<string>> = new Map();
  private referencesByType: Map<ReferenceType, Set<string>> = new Map();
  private errors: ReferenceError[] = [];

  // External entity lookup (set by registry integration)
  private entityLookup?: (id: string) => Entity | undefined;

  /**
   * Set the entity lookup function for validation
   */
  setEntityLookup(lookup: (id: string) => Entity | undefined): void {
    this.entityLookup = lookup;
  }

  /**
   * Generate a unique reference ID
   */
  private generateId(): string {
    return `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new cross-reference
   */
  createReference(
    sourceId: string,
    sourceType: EntityType,
    targetId: string,
    targetType: EntityType,
    referenceType: ReferenceType,
    options: {
      strength?: ReferenceStrength;
      status?: ReferenceStatus;
      description?: string;
      establishedChapter?: number;
      bidirectional?: boolean;
      context?: CrossReference['context'];
    } = {}
  ): CrossReference {
    const id = this.generateId();
    const now = new Date();

    // Check for valid type combination
    const validCombos = VALID_REFERENCE_COMBOS.get(referenceType);
    if (validCombos) {
      const isValid = validCombos.some(
        ([s, t]) => s === sourceType && t === targetType
      );
      if (!isValid) {
        // Allow it but log a warning - some references are flexible
        console.warn(
          `Potentially invalid reference type ${referenceType} for ${sourceType} -> ${targetType}`
        );
      }
    }

    // Check for duplicates
    const existingRefs = this.findReferences({
      sourceId,
      targetId,
      referenceType
    });
    if (existingRefs.length > 0) {
      throw new Error(
        `Duplicate reference: ${sourceId} -> ${targetId} (${referenceType}) already exists`
      );
    }

    const bidirectional = options.bidirectional ??
      INVERSE_REFERENCE_TYPES.has(referenceType);

    const reference: CrossReference = {
      id,
      sourceId,
      sourceType,
      targetId,
      targetType,
      referenceType,
      strength: options.strength ?? ReferenceStrength.MODERATE,
      status: options.status ?? ReferenceStatus.ACTIVE,
      description: options.description,
      establishedChapter: options.establishedChapter,
      bidirectional,
      inverseType: INVERSE_REFERENCE_TYPES.get(referenceType),
      context: options.context,
      createdAt: now,
      updatedAt: now
    };

    // Store reference
    this.references.set(id, reference);

    // Index by source
    if (!this.referencesBySource.has(sourceId)) {
      this.referencesBySource.set(sourceId, new Set());
    }
    this.referencesBySource.get(sourceId)!.add(id);

    // Index by target
    if (!this.referencesByTarget.has(targetId)) {
      this.referencesByTarget.set(targetId, new Set());
    }
    this.referencesByTarget.get(targetId)!.add(id);

    // Index by type
    if (!this.referencesByType.has(referenceType)) {
      this.referencesByType.set(referenceType, new Set());
    }
    this.referencesByType.get(referenceType)!.add(id);

    // Create inverse reference if bidirectional
    if (bidirectional && options.bidirectional !== false) {
      const inverseType = INVERSE_REFERENCE_TYPES.get(referenceType);
      if (inverseType && inverseType !== referenceType) {
        // Don't create inverse for symmetric relationships (they're self-inverse)
        try {
          this.createReference(
            targetId,
            targetType,
            sourceId,
            sourceType,
            inverseType,
            {
              ...options,
              bidirectional: false // Prevent infinite loop
            }
          );
        } catch {
          // Inverse already exists, that's fine
        }
      }
    }

    return reference;
  }

  /**
   * Create multiple references at once
   */
  createReferencesBatch(
    references: Array<{
      sourceId: string;
      sourceType: EntityType;
      targetId: string;
      targetType: EntityType;
      referenceType: ReferenceType;
      options?: Parameters<CrossReferenceTracker['createReference']>[5];
    }>
  ): CrossReference[] {
    return references.map(ref =>
      this.createReference(
        ref.sourceId,
        ref.sourceType,
        ref.targetId,
        ref.targetType,
        ref.referenceType,
        ref.options
      )
    );
  }

  /**
   * Get a reference by ID
   */
  getReference(id: string): CrossReference | undefined {
    return this.references.get(id);
  }

  /**
   * Update a reference
   */
  updateReference(
    id: string,
    updates: Partial<Pick<
      CrossReference,
      'strength' | 'status' | 'description' | 'endedChapter' | 'context'
    >>
  ): CrossReference | undefined {
    const reference = this.references.get(id);
    if (!reference) return undefined;

    const updated: CrossReference = {
      ...reference,
      ...updates,
      updatedAt: new Date()
    };

    this.references.set(id, updated);
    return updated;
  }

  /**
   * Delete a reference
   */
  deleteReference(id: string): boolean {
    const reference = this.references.get(id);
    if (!reference) return false;

    // Remove from indices
    this.referencesBySource.get(reference.sourceId)?.delete(id);
    this.referencesByTarget.get(reference.targetId)?.delete(id);
    this.referencesByType.get(reference.referenceType)?.delete(id);

    // Remove main entry
    this.references.delete(id);

    return true;
  }

  /**
   * Delete all references for an entity
   */
  deleteReferencesForEntity(entityId: string): number {
    let deleted = 0;

    // Delete outbound references
    const outbound = this.referencesBySource.get(entityId);
    if (outbound) {
      for (const refId of outbound) {
        if (this.deleteReference(refId)) deleted++;
      }
    }

    // Delete inbound references
    const inbound = this.referencesByTarget.get(entityId);
    if (inbound) {
      for (const refId of inbound) {
        if (this.deleteReference(refId)) deleted++;
      }
    }

    return deleted;
  }

  /**
   * Find references matching a query
   */
  findReferences(query: ReferenceQuery): CrossReference[] {
    let results: CrossReference[] = [];

    // Start with the most restrictive filter
    if (query.sourceId) {
      const refIds = this.referencesBySource.get(query.sourceId);
      if (!refIds) return [];
      results = Array.from(refIds)
        .map(id => this.references.get(id)!)
        .filter(Boolean);
    } else if (query.targetId) {
      const refIds = this.referencesByTarget.get(query.targetId);
      if (!refIds) return [];
      results = Array.from(refIds)
        .map(id => this.references.get(id)!)
        .filter(Boolean);
    } else if (query.referenceType && !Array.isArray(query.referenceType)) {
      const refIds = this.referencesByType.get(query.referenceType);
      if (!refIds) return [];
      results = Array.from(refIds)
        .map(id => this.references.get(id)!)
        .filter(Boolean);
    } else {
      results = Array.from(this.references.values());
    }

    // Apply additional filters
    if (query.sourceId && results.length > 0) {
      // Already filtered by source
    }

    if (query.targetId && !query.sourceId) {
      // Already filtered by target
    } else if (query.targetId) {
      results = results.filter(r => r.targetId === query.targetId);
    }

    if (query.sourceType) {
      results = results.filter(r => r.sourceType === query.sourceType);
    }

    if (query.targetType) {
      results = results.filter(r => r.targetType === query.targetType);
    }

    if (query.referenceType) {
      const types = Array.isArray(query.referenceType)
        ? query.referenceType
        : [query.referenceType];
      results = results.filter(r => types.includes(r.referenceType));
    }

    if (query.strength) {
      const strengths = Array.isArray(query.strength)
        ? query.strength
        : [query.strength];
      results = results.filter(r => strengths.includes(r.strength));
    }

    if (query.status) {
      const statuses = Array.isArray(query.status)
        ? query.status
        : [query.status];
      results = results.filter(r => statuses.includes(r.status));
    } else if (!query.includeInactive) {
      results = results.filter(r =>
        r.status === ReferenceStatus.ACTIVE ||
        r.status === ReferenceStatus.PENDING ||
        r.status === ReferenceStatus.SECRET
      );
    }

    if (query.bidirectionalOnly) {
      results = results.filter(r => r.bidirectional);
    }

    if (query.establishedBefore !== undefined) {
      results = results.filter(r =>
        r.establishedChapter !== undefined &&
        r.establishedChapter < query.establishedBefore!
      );
    }

    if (query.establishedAfter !== undefined) {
      results = results.filter(r =>
        r.establishedChapter !== undefined &&
        r.establishedChapter > query.establishedAfter!
      );
    }

    return results;
  }

  /**
   * Get all references from an entity
   */
  getOutboundReferences(entityId: string): CrossReference[] {
    return this.findReferences({ sourceId: entityId });
  }

  /**
   * Get all references to an entity
   */
  getInboundReferences(entityId: string): CrossReference[] {
    return this.findReferences({ targetId: entityId });
  }

  /**
   * Get all references involving an entity (both directions)
   */
  getAllReferencesForEntity(entityId: string): CrossReference[] {
    const outbound = this.getOutboundReferences(entityId);
    const inbound = this.getInboundReferences(entityId);

    // Deduplicate (bidirectional refs appear in both)
    const seen = new Set<string>();
    const results: CrossReference[] = [];

    for (const ref of [...outbound, ...inbound]) {
      if (!seen.has(ref.id)) {
        seen.add(ref.id);
        results.push(ref);
      }
    }

    return results;
  }

  /**
   * Find path between two entities
   */
  findPath(
    startId: string,
    endId: string,
    maxDepth: number = 6
  ): CrossReference[][] {
    const paths: CrossReference[][] = [];
    const visited = new Set<string>();

    const dfs = (currentId: string, path: CrossReference[], depth: number) => {
      if (depth > maxDepth) return;
      if (currentId === endId && path.length > 0) {
        paths.push([...path]);
        return;
      }

      visited.add(currentId);

      const outbound = this.getOutboundReferences(currentId);
      for (const ref of outbound) {
        if (!visited.has(ref.targetId)) {
          path.push(ref);
          dfs(ref.targetId, path, depth + 1);
          path.pop();
        }
      }

      visited.delete(currentId);
    };

    dfs(startId, [], 0);

    // Sort by path length (shortest first)
    paths.sort((a, b) => a.length - b.length);

    return paths;
  }

  /**
   * Get connection degree for an entity
   */
  getConnectionDegree(entityId: string): {
    total: number;
    inbound: number;
    outbound: number;
    bidirectional: number;
  } {
    const outbound = this.referencesBySource.get(entityId)?.size ?? 0;
    const inbound = this.referencesByTarget.get(entityId)?.size ?? 0;

    // Count bidirectional (counted in both, so divide by 2 for actual count)
    const allRefs = this.getAllReferencesForEntity(entityId);
    const bidirectional = allRefs.filter(r => r.bidirectional).length;

    return {
      total: allRefs.length,
      inbound,
      outbound,
      bidirectional
    };
  }

  /**
   * Find orphan references (references to non-existent entities)
   */
  findOrphanReferences(): ReferenceError[] {
    if (!this.entityLookup) {
      console.warn('Entity lookup not set - cannot detect orphan references');
      return [];
    }

    const errors: ReferenceError[] = [];

    for (const ref of this.references.values()) {
      const sourceExists = this.entityLookup(ref.sourceId);
      const targetExists = this.entityLookup(ref.targetId);

      if (!sourceExists) {
        errors.push({
          referenceId: ref.id,
          errorType: ReferenceErrorType.ORPHAN_SOURCE,
          message: `Source entity ${ref.sourceId} does not exist`,
          sourceId: ref.sourceId,
          targetId: ref.targetId,
          severity: 'critical',
          suggestedFix: `Delete reference ${ref.id} or restore entity ${ref.sourceId}`
        });
      }

      if (!targetExists) {
        errors.push({
          referenceId: ref.id,
          errorType: ReferenceErrorType.ORPHAN_TARGET,
          message: `Target entity ${ref.targetId} does not exist`,
          sourceId: ref.sourceId,
          targetId: ref.targetId,
          severity: 'critical',
          suggestedFix: `Delete reference ${ref.id} or restore entity ${ref.targetId}`
        });
      }
    }

    return errors;
  }

  /**
   * Find circular references
   */
  findCircularReferences(
    referenceTypes?: ReferenceType[]
  ): Array<{ cycle: string[]; references: CrossReference[] }> {
    const cycles: Array<{ cycle: string[]; references: CrossReference[] }> = [];
    const globalVisited = new Set<string>();

    const findCyclesFrom = (startId: string) => {
      const visited = new Set<string>();
      const path: string[] = [];
      const pathRefs: CrossReference[] = [];

      const dfs = (currentId: string): boolean => {
        if (path.includes(currentId)) {
          // Found cycle
          const cycleStart = path.indexOf(currentId);
          cycles.push({
            cycle: [...path.slice(cycleStart), currentId],
            references: [...pathRefs.slice(cycleStart)]
          });
          return true;
        }

        if (visited.has(currentId)) return false;
        visited.add(currentId);
        path.push(currentId);

        const outbound = this.getOutboundReferences(currentId)
          .filter(r => !referenceTypes || referenceTypes.includes(r.referenceType));

        for (const ref of outbound) {
          pathRefs.push(ref);
          dfs(ref.targetId);
          pathRefs.pop();
        }

        path.pop();
        return false;
      };

      dfs(startId);
      globalVisited.add(startId);
    };

    // Check from each entity
    const allEntityIds = new Set<string>();
    for (const ref of this.references.values()) {
      allEntityIds.add(ref.sourceId);
      allEntityIds.add(ref.targetId);
    }

    for (const entityId of allEntityIds) {
      if (!globalVisited.has(entityId)) {
        findCyclesFrom(entityId);
      }
    }

    return cycles;
  }

  /**
   * Validate all references
   */
  validateAllReferences(): {
    valid: boolean;
    errors: ReferenceError[];
    orphanCount: number;
    circularCount: number;
    duplicateCount: number;
  } {
    this.errors = [];

    // Find orphans
    const orphanErrors = this.findOrphanReferences();
    this.errors.push(...orphanErrors);

    // Find circular references (for hierarchical types only)
    const hierarchicalTypes = [
      ReferenceType.CONTAINS,
      ReferenceType.DERIVED_FROM,
      ReferenceType.COMPONENT_OF
    ];
    const cycles = this.findCircularReferences(hierarchicalTypes);
    for (const cycle of cycles) {
      this.errors.push({
        referenceId: cycle.references[0]?.id ?? 'unknown',
        errorType: ReferenceErrorType.CIRCULAR_REFERENCE,
        message: `Circular reference detected: ${cycle.cycle.join(' -> ')}`,
        sourceId: cycle.cycle[0],
        targetId: cycle.cycle[cycle.cycle.length - 1],
        severity: 'warning'
      });
    }

    // Check for missing inverses in bidirectional references
    for (const ref of this.references.values()) {
      if (ref.bidirectional && ref.inverseType) {
        const inverse = this.findReferences({
          sourceId: ref.targetId,
          targetId: ref.sourceId,
          referenceType: ref.inverseType
        });

        if (inverse.length === 0 && ref.inverseType !== ref.referenceType) {
          this.errors.push({
            referenceId: ref.id,
            errorType: ReferenceErrorType.MISSING_INVERSE,
            message: `Bidirectional reference missing inverse: ${ref.sourceId} -> ${ref.targetId}`,
            sourceId: ref.sourceId,
            targetId: ref.targetId,
            severity: 'info',
            suggestedFix: `Create inverse reference of type ${ref.inverseType}`
          });
        }
      }
    }

    return {
      valid: this.errors.filter(e => e.severity === 'critical').length === 0,
      errors: this.errors,
      orphanCount: orphanErrors.length,
      circularCount: cycles.length,
      duplicateCount: 0 // Duplicates prevented at creation
    };
  }

  /**
   * Build a reference graph for visualization
   */
  buildGraph(options: {
    entityTypes?: EntityType[];
    referenceTypes?: ReferenceType[];
    minStrength?: ReferenceStrength;
    entityNames?: Map<string, string>;
  } = {}): ReferenceGraph {
    const nodes: Map<string, ReferenceNode> = new Map();
    const edges: ReferenceEdge[] = [];
    const clusters: Map<EntityType, string[]> = new Map();

    // Strength hierarchy for filtering
    const strengthOrder = [
      ReferenceStrength.CRITICAL,
      ReferenceStrength.STRONG,
      ReferenceStrength.MODERATE,
      ReferenceStrength.WEAK,
      ReferenceStrength.HISTORICAL
    ];
    const minStrengthIndex = options.minStrength
      ? strengthOrder.indexOf(options.minStrength)
      : strengthOrder.length - 1;

    for (const ref of this.references.values()) {
      // Filter by type
      if (options.entityTypes) {
        if (!options.entityTypes.includes(ref.sourceType) ||
            !options.entityTypes.includes(ref.targetType)) {
          continue;
        }
      }

      if (options.referenceTypes) {
        if (!options.referenceTypes.includes(ref.referenceType)) {
          continue;
        }
      }

      // Filter by strength
      const strengthIndex = strengthOrder.indexOf(ref.strength);
      if (strengthIndex > minStrengthIndex) {
        continue;
      }

      // Add/update source node
      if (!nodes.has(ref.sourceId)) {
        nodes.set(ref.sourceId, {
          id: ref.sourceId,
          type: ref.sourceType,
          name: options.entityNames?.get(ref.sourceId) ?? ref.sourceId,
          connections: 0,
          inbound: 0,
          outbound: 0
        });

        // Add to cluster
        if (!clusters.has(ref.sourceType)) {
          clusters.set(ref.sourceType, []);
        }
        clusters.get(ref.sourceType)!.push(ref.sourceId);
      }
      nodes.get(ref.sourceId)!.outbound++;
      nodes.get(ref.sourceId)!.connections++;

      // Add/update target node
      if (!nodes.has(ref.targetId)) {
        nodes.set(ref.targetId, {
          id: ref.targetId,
          type: ref.targetType,
          name: options.entityNames?.get(ref.targetId) ?? ref.targetId,
          connections: 0,
          inbound: 0,
          outbound: 0
        });

        // Add to cluster
        if (!clusters.has(ref.targetType)) {
          clusters.set(ref.targetType, []);
        }
        clusters.get(ref.targetType)!.push(ref.targetId);
      }
      nodes.get(ref.targetId)!.inbound++;
      nodes.get(ref.targetId)!.connections++;

      // Add edge
      edges.push({
        source: ref.sourceId,
        target: ref.targetId,
        type: ref.referenceType,
        strength: ref.strength,
        bidirectional: ref.bidirectional
      });
    }

    return {
      nodes: Array.from(nodes.values()),
      edges,
      clusters
    };
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalReferences: number;
    byType: Record<string, number>;
    byStrength: Record<string, number>;
    byStatus: Record<string, number>;
    bidirectionalCount: number;
    uniqueEntities: number;
    avgConnectionsPerEntity: number;
    errorCount: number;
  } {
    const byType: Record<string, number> = {};
    const byStrength: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let bidirectionalCount = 0;
    const entities = new Set<string>();

    for (const ref of this.references.values()) {
      byType[ref.referenceType] = (byType[ref.referenceType] ?? 0) + 1;
      byStrength[ref.strength] = (byStrength[ref.strength] ?? 0) + 1;
      byStatus[ref.status] = (byStatus[ref.status] ?? 0) + 1;

      if (ref.bidirectional) bidirectionalCount++;

      entities.add(ref.sourceId);
      entities.add(ref.targetId);
    }

    const totalReferences = this.references.size;
    const uniqueEntities = entities.size;

    return {
      totalReferences,
      byType,
      byStrength,
      byStatus,
      bidirectionalCount,
      uniqueEntities,
      avgConnectionsPerEntity: uniqueEntities > 0
        ? (totalReferences * 2) / uniqueEntities
        : 0,
      errorCount: this.errors.length
    };
  }

  /**
   * Get validation errors
   */
  getErrors(): ReferenceError[] {
    return [...this.errors];
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Clear all references
   */
  clear(): void {
    this.references.clear();
    this.referencesBySource.clear();
    this.referencesByTarget.clear();
    this.referencesByType.clear();
    this.errors = [];
  }

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      references: Array.from(this.references.values()),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.clear();

    if (data.references) {
      for (const ref of data.references) {
        ref.createdAt = new Date(ref.createdAt);
        ref.updatedAt = new Date(ref.updatedAt);

        this.references.set(ref.id, ref);

        // Rebuild indices
        if (!this.referencesBySource.has(ref.sourceId)) {
          this.referencesBySource.set(ref.sourceId, new Set());
        }
        this.referencesBySource.get(ref.sourceId)!.add(ref.id);

        if (!this.referencesByTarget.has(ref.targetId)) {
          this.referencesByTarget.set(ref.targetId, new Set());
        }
        this.referencesByTarget.get(ref.targetId)!.add(ref.id);

        if (!this.referencesByType.has(ref.referenceType)) {
          this.referencesByType.set(ref.referenceType, new Set());
        }
        this.referencesByType.get(ref.referenceType)!.add(ref.id);
      }
    }
  }
}

// Default instance
export const crossReferenceTracker = new CrossReferenceTracker();

export default CrossReferenceTracker;
