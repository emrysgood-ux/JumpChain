/**
 * Epic Fiction Architect - Entity Management System
 *
 * Comprehensive entity tracking system for managing all story elements
 * (characters, locations, powers, items, factions) with:
 * - Simultaneous file creation and maintenance
 * - Cross-reference tracking between entities
 * - File generation (Markdown/JSON) for documentation
 * - Full change history and version tracking
 *
 * Designed for 12,000+ chapter stories with thousands of interconnected entities.
 */

// =============================================================================
// ENTITY REGISTRY
// =============================================================================

export {
  // Enums
  EntityType,
  EntityStatus,
  SyncStatus,

  // Interfaces
  type EntityReference,
  type EntityAppearance,
  type EntityChange,
  type BaseEntity,
  type CharacterEntity,
  type LocationEntity,
  type PowerEntity,
  type ItemEntity,
  type FactionEntity,
  type Entity,

  // Class
  EntityRegistry,

  // Default instance
  entityRegistry
} from './entity-registry';

// =============================================================================
// FILE GENERATOR
// =============================================================================

export {
  // Interfaces
  type FileGeneratorConfig,
  type GenerationResult,

  // Class
  EntityFileGenerator
} from './file-generator';

// =============================================================================
// CROSS-REFERENCE TRACKER
// =============================================================================

export {
  // Enums
  ReferenceType,
  ReferenceStrength,
  ReferenceStatus,
  ReferenceErrorType,

  // Interfaces
  type CrossReference,
  type ReferenceError,
  type ReferenceQuery,
  type ReferenceNode,
  type ReferenceEdge,
  type ReferenceGraph,

  // Class
  CrossReferenceTracker,

  // Default instance
  crossReferenceTracker
} from './cross-reference-tracker';

// =============================================================================
// INTEGRATED ENTITY MANAGEMENT SUITE
// =============================================================================

import { EntityRegistry, EntityType, Entity } from './entity-registry';
import { EntityFileGenerator, FileGeneratorConfig } from './file-generator';
import { CrossReferenceTracker, ReferenceType, ReferenceStrength } from './cross-reference-tracker';

/**
 * Entity Management Suite
 *
 * Unified interface for managing all story entities with automatic
 * cross-reference tracking and file generation.
 */
export class EntityManagementSuite {
  public readonly registry: EntityRegistry;
  public readonly fileGenerator: EntityFileGenerator;
  public readonly crossReferences: CrossReferenceTracker;

  constructor(config?: {
    fileGeneratorConfig?: Partial<FileGeneratorConfig>;
  }) {
    this.registry = new EntityRegistry();
    this.fileGenerator = new EntityFileGenerator(this.registry, config?.fileGeneratorConfig);
    this.crossReferences = new CrossReferenceTracker();

    // Connect cross-reference tracker to registry for validation
    this.crossReferences.setEntityLookup((id) => this.registry.getEntity(id));
  }

  /**
   * Create an entity with automatic cross-reference creation
   */
  createEntity<T extends Entity>(
    type: EntityType,
    name: string,
    data: Partial<Omit<T, 'id' | 'type' | 'name' | 'createdAt' | 'updatedAt' | 'syncStatus'>>,
    options?: {
      generateFile?: boolean;
      createReferences?: Array<{
        targetId: string;
        targetType: EntityType;
        referenceType: ReferenceType;
        strength?: ReferenceStrength;
      }>;
    }
  ): T {
    // Create the entity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entity = this.registry.createEntity<T>(type, name, data as any);

    // Create cross-references if specified
    if (options?.createReferences) {
      for (const ref of options.createReferences) {
        this.crossReferences.createReference(
          entity.id,
          type,
          ref.targetId,
          ref.targetType,
          ref.referenceType,
          { strength: ref.strength }
        );
      }
    }

    // Generate file if requested
    if (options?.generateFile) {
      this.fileGenerator.generateEntityFile(entity);
    }

    return entity;
  }

  /**
   * Create multiple entities at once with cross-references
   */
  createEntitiesBatch<T extends Entity>(
    entities: Array<{
      type: EntityType;
      name: string;
      data: Partial<Omit<T, 'id' | 'type' | 'name' | 'createdAt' | 'updatedAt' | 'syncStatus'>>;
    }>,
    options?: {
      generateFiles?: boolean;
    }
  ): T[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = this.registry.createEntitiesBatch<T>(entities as any);

    if (options?.generateFiles) {
      for (const entity of created) {
        this.fileGenerator.generateEntityFile(entity);
      }
    }

    return created;
  }

  /**
   * Link two entities with a cross-reference
   */
  linkEntities(
    sourceId: string,
    targetId: string,
    referenceType: ReferenceType,
    options?: {
      strength?: ReferenceStrength;
      description?: string;
      bidirectional?: boolean;
      establishedChapter?: number;
    }
  ): void {
    const source = this.registry.getEntity(sourceId);
    const target = this.registry.getEntity(targetId);

    if (!source || !target) {
      throw new Error(`Cannot link: source or target entity not found`);
    }

    this.crossReferences.createReference(
      sourceId,
      source.type,
      targetId,
      target.type,
      referenceType,
      options
    );
  }

  /**
   * Delete an entity and all its cross-references
   */
  deleteEntity(id: string): boolean {
    // Delete all cross-references first
    this.crossReferences.deleteReferencesForEntity(id);

    // Then delete the entity
    return this.registry.deleteEntity(id);
  }

  /**
   * Get all entities connected to a given entity
   */
  getConnectedEntities(entityId: string): Entity[] {
    const refs = this.crossReferences.getAllReferencesForEntity(entityId);
    const connectedIds = new Set<string>();

    for (const ref of refs) {
      if (ref.sourceId === entityId) {
        connectedIds.add(ref.targetId);
      } else {
        connectedIds.add(ref.sourceId);
      }
    }

    return Array.from(connectedIds)
      .map(id => this.registry.getEntity(id))
      .filter((e): e is Entity => e !== undefined);
  }

  /**
   * Find path between two entities through cross-references
   */
  findConnectionPath(startId: string, endId: string): {
    path: Entity[];
    references: ReturnType<CrossReferenceTracker['findPath']>[0];
  } | null {
    const paths = this.crossReferences.findPath(startId, endId);

    if (paths.length === 0) return null;

    const shortestPath = paths[0];
    const entityPath: Entity[] = [];

    // Build entity path
    entityPath.push(this.registry.getEntity(startId)!);
    for (const ref of shortestPath) {
      entityPath.push(this.registry.getEntity(ref.targetId)!);
    }

    return {
      path: entityPath.filter(Boolean),
      references: shortestPath
    };
  }

  /**
   * Generate all entity files
   */
  generateAllFiles(): ReturnType<EntityFileGenerator['generateAllEntityFiles']> {
    return this.fileGenerator.generateAllEntityFiles();
  }

  /**
   * Generate index files
   */
  generateIndexFiles(): void {
    this.fileGenerator.generateIndexFiles();
  }

  /**
   * Validate all entities and references
   */
  validateAll(): {
    entitiesValid: boolean;
    referencesValid: boolean;
    orphanedEntities: Entity[];
    referenceErrors: ReturnType<CrossReferenceTracker['validateAllReferences']>;
    registryStats: ReturnType<EntityRegistry['getStats']>;
    referenceStats: ReturnType<CrossReferenceTracker['getStats']>;
  } {
    // Find entities with no references (potential orphans)
    const orphanedEntities: Entity[] = [];
    for (const entity of this.registry.getAllEntities()) {
      const refs = this.crossReferences.getAllReferencesForEntity(entity.id);
      if (refs.length === 0) {
        orphanedEntities.push(entity);
      }
    }

    // Validate cross-references
    const referenceValidation = this.crossReferences.validateAllReferences();

    return {
      entitiesValid: orphanedEntities.length === 0,
      referencesValid: referenceValidation.valid,
      orphanedEntities,
      referenceErrors: referenceValidation,
      registryStats: this.registry.getStats(),
      referenceStats: this.crossReferences.getStats()
    };
  }

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    entities: ReturnType<EntityRegistry['getStats']>;
    references: ReturnType<CrossReferenceTracker['getStats']>;
    connectionDensity: number;
  } {
    const entityStats = this.registry.getStats();
    const refStats = this.crossReferences.getStats();

    // Connection density: actual connections / possible connections
    const totalEntities = entityStats.totalEntities;
    const possibleConnections = totalEntities * (totalEntities - 1);
    const connectionDensity = possibleConnections > 0
      ? refStats.totalReferences / possibleConnections
      : 0;

    return {
      entities: entityStats,
      references: refStats,
      connectionDensity
    };
  }

  /**
   * Generate a report
   */
  generateReport(): string {
    const stats = this.getStats();
    const validation = this.validateAll();

    let report = `# Entity Management Report\n\n`;

    report += `## Overview\n\n`;
    report += `- **Total Entities:** ${stats.entities.totalEntities.toLocaleString()}\n`;
    report += `- **Total References:** ${stats.references.totalReferences.toLocaleString()}\n`;
    report += `- **Connection Density:** ${(stats.connectionDensity * 100).toFixed(2)}%\n\n`;

    report += `## Entities by Type\n\n`;
    for (const [type, count] of Object.entries(stats.entities.byType)) {
      report += `- **${type}:** ${count}\n`;
    }

    report += `\n## References by Type\n\n`;
    for (const [type, count] of Object.entries(stats.references.byType)) {
      report += `- **${type}:** ${count}\n`;
    }

    report += `\n## Validation Status\n\n`;
    report += `- **Entities Valid:** ${validation.entitiesValid ? 'Yes' : 'No'}\n`;
    report += `- **References Valid:** ${validation.referencesValid ? 'Yes' : 'No'}\n`;
    report += `- **Orphaned Entities:** ${validation.orphanedEntities.length}\n`;
    report += `- **Reference Errors:** ${validation.referenceErrors.errors.length}\n`;

    return report;
  }

  /**
   * Export all data
   */
  exportAll(): string {
    return JSON.stringify({
      entities: JSON.parse(this.registry.exportToJSON()),
      references: JSON.parse(this.crossReferences.exportToJSON()),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import all data
   */
  importAll(json: string): void {
    const data = JSON.parse(json);

    if (data.entities) {
      this.registry.importFromJSON(JSON.stringify(data.entities));
    }

    if (data.references) {
      this.crossReferences.importFromJSON(JSON.stringify(data.references));
    }
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.registry.clear();
    this.crossReferences.clear();
  }
}

// Default instance with connected components
export const entityManagementSuite = new EntityManagementSuite();

export default EntityManagementSuite;
