/**
 * Entity Registry
 *
 * Central registry for tracking all story entities (characters, locations, powers, items, etc.)
 * with support for simultaneous file creation and cross-reference maintenance.
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// ENUMS
// ============================================================================

export enum EntityType {
  CHARACTER = 'character',
  LOCATION = 'location',
  POWER = 'power',
  ITEM = 'item',
  FACTION = 'faction',
  SPECIES = 'species',
  EVENT = 'event',
  CONCEPT = 'concept',
  RELATIONSHIP = 'relationship',
  PLOT_THREAD = 'plot_thread',
  WORLD_RULE = 'world_rule',
  MAGIC_SYSTEM = 'magic_system',
  TECHNOLOGY = 'technology',
  CULTURE = 'culture',
  LANGUAGE = 'language',
  RELIGION = 'religion'
}

export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECEASED = 'deceased',
  DESTROYED = 'destroyed',
  HISTORICAL = 'historical',
  LEGENDARY = 'legendary',
  UNKNOWN = 'unknown',
  DRAFT = 'draft',
  ARCHIVED = 'archived'
}

export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  CONFLICT = 'conflict',
  ERROR = 'error'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface EntityReference {
  id: string;
  type: EntityType;
  name: string;
  relationship: string;  // "parent", "child", "ally", "enemy", "located_in", etc.
}

export interface EntityAppearance {
  chapterNumber: number;
  sceneId?: string;
  role: 'major' | 'minor' | 'mentioned' | 'background';
  notes?: string;
}

export interface EntityChange {
  id: string;
  timestamp: Date;
  chapterNumber?: number;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  reason?: string;
}

export interface BaseEntity {
  id: string;
  type: EntityType;
  name: string;
  aliases: string[];
  description: string;
  status: EntityStatus;

  // Tracking
  createdAt: Date;
  updatedAt: Date;
  createdInChapter?: number;
  lastAppearanceChapter?: number;

  // References
  references: EntityReference[];
  appearances: EntityAppearance[];
  changeHistory: EntityChange[];

  // Tags and metadata
  tags: string[];
  notes: string[];
  metadata: Record<string, unknown>;

  // File sync
  filePath?: string;
  syncStatus: SyncStatus;
  lastSyncAt?: Date;
}

// Character-specific fields
export interface CharacterEntity extends BaseEntity {
  type: EntityType.CHARACTER;

  // Basic info
  species: string;
  age?: number;
  birthDate?: string;
  deathDate?: string;
  gender?: string;

  // Physical
  appearance: {
    height?: string;
    build?: string;
    hairColor?: string;
    eyeColor?: string;
    distinguishingFeatures: string[];
    physicalDescription: string;
  };

  // Personality
  personality: {
    traits: string[];
    strengths: string[];
    weaknesses: string[];
    fears: string[];
    desires: string[];
    values: string[];
    quirks: string[];
  };

  // Background
  background: {
    birthplace?: string;
    occupation?: string;
    socialClass?: string;
    education?: string;
    history: string;
  };

  // Abilities
  powers: string[];  // IDs of power entities
  skills: { name: string; level: 'novice' | 'competent' | 'expert' | 'master' }[];

  // Relationships
  relationships: {
    characterId: string;
    type: string;
    status: 'active' | 'former' | 'complicated';
    notes?: string;
  }[];

  // Affiliations
  factions: string[];  // IDs of faction entities

  // Voice profile
  speechPatterns: string[];
  vocabulary: 'simple' | 'moderate' | 'advanced' | 'scholarly';
  catchPhrases: string[];

  // Arc tracking
  characterArc?: {
    type: 'positive' | 'negative' | 'flat' | 'fall' | 'rise';
    startingState: string;
    endingState?: string;
    keyMoments: { chapter: number; description: string }[];
  };
}

// Location-specific fields
export interface LocationEntity extends BaseEntity {
  type: EntityType.LOCATION;

  // Geography
  locationType: 'planet' | 'continent' | 'country' | 'region' | 'city' | 'building' | 'room' | 'natural' | 'dimension' | 'other';
  parentLocation?: string;  // ID of containing location
  childLocations: string[];  // IDs of contained locations

  coordinates?: {
    system?: string;
    x?: number;
    y?: number;
    z?: number;
  };

  // Physical characteristics
  climate?: string;
  terrain?: string;
  size?: string;

  // Description
  physicalDescription: string;
  atmosphere: string;
  landmarks: string[];

  // Population
  population?: number;
  inhabitants: string[];  // Species or faction IDs

  // Governance
  government?: string;
  ruler?: string;  // Character ID
  laws: string[];

  // Resources
  resources: string[];
  exports: string[];
  imports: string[];

  // History
  founded?: string;
  historicalEvents: { date: string; event: string }[];

  // Dangers
  hazards: string[];
  dangerLevel: 'safe' | 'low' | 'moderate' | 'high' | 'extreme';

  // Travel
  accessRoutes: { from: string; method: string; duration: string }[];
}

// Power-specific fields
export interface PowerEntity extends BaseEntity {
  type: EntityType.POWER;

  // Classification
  powerType: 'innate' | 'learned' | 'granted' | 'technological' | 'magical' | 'psychic' | 'divine' | 'other';
  category: string;  // e.g., "elemental", "mental", "physical", "reality-warping"
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'unique';

  // Source
  source: string;  // Where the power comes from
  requirements: string[];  // What's needed to use it
  limitations: string[];

  // Effects
  effects: {
    name: string;
    description: string;
    power: 'weak' | 'moderate' | 'strong' | 'overwhelming';
  }[];

  // Costs
  costs: {
    type: string;  // "energy", "health", "time", "material", etc.
    amount: string;
    description: string;
  }[];

  // Scaling
  canImprove: boolean;
  levels?: {
    level: number;
    name: string;
    description: string;
    unlockedAt?: string;
  }[];

  // Interactions
  synergies: string[];  // IDs of powers that work well together
  counters: string[];  // IDs of powers that counter this
  incompatible: string[];  // IDs of powers that can't be used together

  // Users
  knownUsers: string[];  // Character IDs

  // Visual/sensory
  visualManifestation: string;
  sideEffects: string[];
}

// Item-specific fields
export interface ItemEntity extends BaseEntity {
  type: EntityType.ITEM;

  itemType: 'weapon' | 'armor' | 'tool' | 'consumable' | 'artifact' | 'key' | 'vehicle' | 'clothing' | 'currency' | 'other';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'unique';

  // Physical
  physicalDescription: string;
  size: string;
  weight?: string;
  material?: string;

  // Properties
  properties: {
    name: string;
    description: string;
    magical: boolean;
  }[];

  // Usage
  requirements?: string[];
  usageInstructions?: string;

  // Value
  value?: string;

  // History
  creator?: string;  // Character ID
  creationDate?: string;
  previousOwners: { characterId: string; period: string }[];
  currentOwner?: string;  // Character ID
  currentLocation?: string;  // Location ID

  // Powers
  powers: string[];  // Power IDs if magical
}

// Faction-specific fields
export interface FactionEntity extends BaseEntity {
  type: EntityType.FACTION;

  factionType: 'government' | 'military' | 'religious' | 'criminal' | 'merchant' | 'guild' | 'secret_society' | 'other';

  // Organization
  headquarters?: string;  // Location ID
  territory: string[];  // Location IDs

  // Membership
  memberCount?: number;
  leader?: string;  // Character ID
  notableMembers: string[];  // Character IDs
  membershipRequirements: string[];

  // Goals
  publicGoals: string[];
  secretGoals: string[];
  methods: string[];

  // Resources
  resources: string[];
  influence: 'local' | 'regional' | 'national' | 'continental' | 'global' | 'interplanetary';

  // Relationships
  allies: string[];  // Faction IDs
  enemies: string[];  // Faction IDs
  neutral: string[];  // Faction IDs

  // Culture
  symbols: string[];
  traditions: string[];
  ranks: { name: string; level: number; privileges: string[] }[];

  // History
  founded?: string;
  founder?: string;  // Character ID
  majorEvents: { date: string; event: string }[];
}

// Union type for all entities
export type Entity = CharacterEntity | LocationEntity | PowerEntity | ItemEntity | FactionEntity | BaseEntity;

// ============================================================================
// ENTITY REGISTRY CLASS
// ============================================================================

export class EntityRegistry {
  private entities: Map<string, Entity> = new Map();
  private entitiesByType: Map<EntityType, Set<string>> = new Map();
  private entitiesByName: Map<string, string[]> = new Map();  // Name -> IDs (for duplicates)
  private crossReferences: Map<string, Set<string>> = new Map();  // Entity ID -> Referenced Entity IDs
  private pendingChanges: Map<string, EntityChange[]> = new Map();

  private basePath: string = './story-entities';
  private autoSave: boolean = true;

  constructor(basePath?: string) {
    if (basePath) {
      this.basePath = basePath;
    }

    // Initialize type maps
    for (const type of Object.values(EntityType)) {
      this.entitiesByType.set(type, new Set());
    }
  }

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  setBasePath(path: string): void {
    this.basePath = path;
  }

  setAutoSave(enabled: boolean): void {
    this.autoSave = enabled;
  }

  // ==========================================================================
  // ENTITY CRUD
  // ==========================================================================

  createEntity<T extends Entity>(
    type: EntityType,
    name: string,
    data: Partial<Omit<T, 'id' | 'type' | 'name' | 'createdAt' | 'updatedAt' | 'syncStatus'>>
  ): T {
    const id = uuidv4();
    const now = new Date();

    const baseEntity: BaseEntity = {
      id,
      type,
      name,
      aliases: data.aliases || [],
      description: data.description || '',
      status: data.status || EntityStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      createdInChapter: data.createdInChapter,
      lastAppearanceChapter: data.lastAppearanceChapter,
      references: data.references || [],
      appearances: data.appearances || [],
      changeHistory: [],
      tags: data.tags || [],
      notes: data.notes || [],
      metadata: data.metadata || {},
      syncStatus: SyncStatus.PENDING
    };

    const entity = { ...baseEntity, ...data, id, type, name, createdAt: now, updatedAt: now, syncStatus: SyncStatus.PENDING } as T;

    this.entities.set(id, entity);
    this.entitiesByType.get(type)?.add(id);
    this.indexEntityName(name, id);

    // Index aliases
    for (const alias of entity.aliases) {
      this.indexEntityName(alias, id);
    }

    // Build cross-references
    this.buildCrossReferences(entity);

    // Auto-save if enabled
    if (this.autoSave) {
      this.saveEntityToFile(entity);
    }

    return entity;
  }

  getEntity<T extends Entity>(id: string): T | undefined {
    return this.entities.get(id) as T | undefined;
  }

  getEntityByName(name: string, type?: EntityType): Entity | undefined {
    const ids = this.entitiesByName.get(name.toLowerCase());
    if (!ids || ids.length === 0) return undefined;

    if (type) {
      for (const id of ids) {
        const entity = this.entities.get(id);
        if (entity && entity.type === type) return entity;
      }
      return undefined;
    }

    return this.entities.get(ids[0]);
  }

  updateEntity<T extends Entity>(id: string, updates: Partial<T>, reason?: string): T | undefined {
    const entity = this.entities.get(id) as T;
    if (!entity) return undefined;

    const now = new Date();
    const changes: EntityChange[] = [];

    // Track changes
    for (const [key, newValue] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'type' && key !== 'createdAt') {
        const oldValue = (entity as unknown as Record<string, unknown>)[key];
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            id: uuidv4(),
            timestamp: now,
            field: key,
            oldValue,
            newValue,
            reason
          });
        }
      }
    }

    // Apply updates
    const updated = {
      ...entity,
      ...updates,
      id: entity.id,
      type: entity.type,
      createdAt: entity.createdAt,
      updatedAt: now,
      changeHistory: [...entity.changeHistory, ...changes],
      syncStatus: SyncStatus.PENDING
    } as T;

    // Update name index if name changed
    if (updates.name && updates.name !== entity.name) {
      this.removeEntityNameIndex(entity.name, id);
      this.indexEntityName(updates.name as string, id);
    }

    this.entities.set(id, updated);

    // Rebuild cross-references
    this.buildCrossReferences(updated);

    // Auto-save if enabled
    if (this.autoSave) {
      this.saveEntityToFile(updated);
    }

    return updated;
  }

  deleteEntity(id: string): boolean {
    const entity = this.entities.get(id);
    if (!entity) return false;

    // Remove from indices
    this.entitiesByType.get(entity.type)?.delete(id);
    this.removeEntityNameIndex(entity.name, id);
    for (const alias of entity.aliases) {
      this.removeEntityNameIndex(alias, id);
    }

    // Remove cross-references
    this.crossReferences.delete(id);
    for (const refs of this.crossReferences.values()) {
      refs.delete(id);
    }

    // Delete file if exists
    if (entity.filePath && fs.existsSync(entity.filePath)) {
      fs.unlinkSync(entity.filePath);
    }

    this.entities.delete(id);
    return true;
  }

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  createEntitiesBatch<T extends Entity>(
    entities: Array<{
      type: EntityType;
      name: string;
      data: Partial<Omit<T, 'id' | 'type' | 'name' | 'createdAt' | 'updatedAt' | 'syncStatus'>>;
    }>
  ): T[] {
    const created: T[] = [];

    // Temporarily disable auto-save for batch
    const wasAutoSave = this.autoSave;
    this.autoSave = false;

    for (const { type, name, data } of entities) {
      const entity = this.createEntity<T>(type, name, data);
      created.push(entity);
    }

    // Restore auto-save and save all at once
    this.autoSave = wasAutoSave;
    if (this.autoSave) {
      this.saveAllEntitiesToFiles(created);
    }

    return created;
  }

  updateEntitiesBatch(
    updates: Array<{ id: string; updates: Partial<Entity>; reason?: string }>
  ): Entity[] {
    const updated: Entity[] = [];

    const wasAutoSave = this.autoSave;
    this.autoSave = false;

    for (const { id, updates: entityUpdates, reason } of updates) {
      const entity = this.updateEntity(id, entityUpdates, reason);
      if (entity) updated.push(entity);
    }

    this.autoSave = wasAutoSave;
    if (this.autoSave) {
      this.saveAllEntitiesToFiles(updated);
    }

    return updated;
  }

  // ==========================================================================
  // QUERY OPERATIONS
  // ==========================================================================

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  getEntitiesByType(type: EntityType): Entity[] {
    const ids = this.entitiesByType.get(type);
    if (!ids) return [];
    return Array.from(ids).map(id => this.entities.get(id)!).filter(Boolean);
  }

  getEntitiesByStatus(status: EntityStatus): Entity[] {
    return this.getAllEntities().filter(e => e.status === status);
  }

  getEntitiesByTag(tag: string): Entity[] {
    return this.getAllEntities().filter(e => e.tags.includes(tag));
  }

  searchEntities(query: string): Entity[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllEntities().filter(e =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.aliases.some(a => a.toLowerCase().includes(lowerQuery)) ||
      e.description.toLowerCase().includes(lowerQuery) ||
      e.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  getReferencedEntities(id: string): Entity[] {
    const refs = this.crossReferences.get(id);
    if (!refs) return [];
    return Array.from(refs).map(refId => this.entities.get(refId)!).filter(Boolean);
  }

  getReferencingEntities(id: string): Entity[] {
    const referencing: Entity[] = [];
    for (const [entityId, refs] of this.crossReferences) {
      if (refs.has(id)) {
        const entity = this.entities.get(entityId);
        if (entity) referencing.push(entity);
      }
    }
    return referencing;
  }

  getEntitiesInChapter(chapterNumber: number): Entity[] {
    return this.getAllEntities().filter(e =>
      e.appearances.some(a => a.chapterNumber === chapterNumber)
    );
  }

  // ==========================================================================
  // CHARACTER-SPECIFIC QUERIES
  // ==========================================================================

  getCharacters(): CharacterEntity[] {
    return this.getEntitiesByType(EntityType.CHARACTER) as CharacterEntity[];
  }

  getCharactersBySpecies(species: string): CharacterEntity[] {
    return this.getCharacters().filter(c => c.species === species);
  }

  getCharactersByFaction(factionId: string): CharacterEntity[] {
    return this.getCharacters().filter(c => c.factions.includes(factionId));
  }

  getCharactersWithPower(powerId: string): CharacterEntity[] {
    return this.getCharacters().filter(c => c.powers.includes(powerId));
  }

  getCharacterRelationships(characterId: string): Array<{ character: CharacterEntity; type: string; status: string }> {
    const character = this.getEntity<CharacterEntity>(characterId);
    if (!character || character.type !== EntityType.CHARACTER) return [];

    return character.relationships.map(rel => ({
      character: this.getEntity<CharacterEntity>(rel.characterId)!,
      type: rel.type,
      status: rel.status
    })).filter(r => r.character);
  }

  // ==========================================================================
  // LOCATION-SPECIFIC QUERIES
  // ==========================================================================

  getLocations(): LocationEntity[] {
    return this.getEntitiesByType(EntityType.LOCATION) as LocationEntity[];
  }

  getLocationHierarchy(locationId: string): LocationEntity[] {
    const hierarchy: LocationEntity[] = [];
    let current = this.getEntity<LocationEntity>(locationId);

    while (current) {
      hierarchy.unshift(current);
      if (current.parentLocation) {
        current = this.getEntity<LocationEntity>(current.parentLocation);
      } else {
        break;
      }
    }

    return hierarchy;
  }

  getChildLocations(locationId: string): LocationEntity[] {
    const location = this.getEntity<LocationEntity>(locationId);
    if (!location || location.type !== EntityType.LOCATION) return [];

    return location.childLocations
      .map(id => this.getEntity<LocationEntity>(id))
      .filter((l): l is LocationEntity => l !== undefined);
  }

  // ==========================================================================
  // POWER-SPECIFIC QUERIES
  // ==========================================================================

  getPowers(): PowerEntity[] {
    return this.getEntitiesByType(EntityType.POWER) as PowerEntity[];
  }

  getPowersByCategory(category: string): PowerEntity[] {
    return this.getPowers().filter(p => p.category === category);
  }

  getPowerSynergies(powerId: string): PowerEntity[] {
    const power = this.getEntity<PowerEntity>(powerId);
    if (!power || power.type !== EntityType.POWER) return [];

    return power.synergies
      .map(id => this.getEntity<PowerEntity>(id))
      .filter((p): p is PowerEntity => p !== undefined);
  }

  getPowerCounters(powerId: string): PowerEntity[] {
    const power = this.getEntity<PowerEntity>(powerId);
    if (!power || power.type !== EntityType.POWER) return [];

    return power.counters
      .map(id => this.getEntity<PowerEntity>(id))
      .filter((p): p is PowerEntity => p !== undefined);
  }

  // ==========================================================================
  // INDEXING HELPERS
  // ==========================================================================

  private indexEntityName(name: string, id: string): void {
    const key = name.toLowerCase();
    const existing = this.entitiesByName.get(key) || [];
    if (!existing.includes(id)) {
      this.entitiesByName.set(key, [...existing, id]);
    }
  }

  private removeEntityNameIndex(name: string, id: string): void {
    const key = name.toLowerCase();
    const existing = this.entitiesByName.get(key);
    if (existing) {
      this.entitiesByName.set(key, existing.filter(i => i !== id));
    }
  }

  private buildCrossReferences(entity: Entity): void {
    const refs = new Set<string>();

    // Add explicit references
    for (const ref of entity.references) {
      refs.add(ref.id);
    }

    // Add type-specific references
    if (entity.type === EntityType.CHARACTER) {
      const char = entity as CharacterEntity;
      for (const rel of char.relationships) {
        refs.add(rel.characterId);
      }
      for (const powerId of char.powers) {
        refs.add(powerId);
      }
      for (const factionId of char.factions) {
        refs.add(factionId);
      }
    } else if (entity.type === EntityType.LOCATION) {
      const loc = entity as LocationEntity;
      if (loc.parentLocation) refs.add(loc.parentLocation);
      for (const childId of loc.childLocations) {
        refs.add(childId);
      }
      if (loc.ruler) refs.add(loc.ruler);
    } else if (entity.type === EntityType.POWER) {
      const power = entity as PowerEntity;
      for (const id of power.synergies) refs.add(id);
      for (const id of power.counters) refs.add(id);
      for (const id of power.incompatible) refs.add(id);
      for (const id of power.knownUsers) refs.add(id);
    } else if (entity.type === EntityType.ITEM) {
      const item = entity as ItemEntity;
      if (item.creator) refs.add(item.creator);
      if (item.currentOwner) refs.add(item.currentOwner);
      if (item.currentLocation) refs.add(item.currentLocation);
      for (const prev of item.previousOwners) {
        refs.add(prev.characterId);
      }
      for (const powerId of item.powers) {
        refs.add(powerId);
      }
    } else if (entity.type === EntityType.FACTION) {
      const faction = entity as FactionEntity;
      if (faction.headquarters) refs.add(faction.headquarters);
      if (faction.leader) refs.add(faction.leader);
      if (faction.founder) refs.add(faction.founder);
      for (const id of faction.territory) refs.add(id);
      for (const id of faction.notableMembers) refs.add(id);
      for (const id of faction.allies) refs.add(id);
      for (const id of faction.enemies) refs.add(id);
      for (const id of faction.neutral) refs.add(id);
    }

    this.crossReferences.set(entity.id, refs);
  }

  // ==========================================================================
  // FILE OPERATIONS
  // ==========================================================================

  private getEntityFilePath(entity: Entity): string {
    const typeDir = path.join(this.basePath, entity.type);
    const safeName = entity.name.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
    return path.join(typeDir, `${safeName}-${entity.id.slice(0, 8)}.json`);
  }

  saveEntityToFile(entity: Entity): void {
    const filePath = this.getEntityFilePath(entity);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const updated = {
      ...entity,
      filePath,
      syncStatus: SyncStatus.SYNCED,
      lastSyncAt: new Date()
    };

    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    this.entities.set(entity.id, updated);
  }

  saveAllEntitiesToFiles(entities?: Entity[]): void {
    const toSave = entities || this.getAllEntities();
    for (const entity of toSave) {
      this.saveEntityToFile(entity);
    }
  }

  loadEntityFromFile(filePath: string): Entity | undefined {
    if (!fs.existsSync(filePath)) return undefined;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const entity = JSON.parse(content) as Entity;
      entity.createdAt = new Date(entity.createdAt);
      entity.updatedAt = new Date(entity.updatedAt);
      if (entity.lastSyncAt) entity.lastSyncAt = new Date(entity.lastSyncAt);

      this.entities.set(entity.id, entity);
      this.entitiesByType.get(entity.type)?.add(entity.id);
      this.indexEntityName(entity.name, entity.id);
      this.buildCrossReferences(entity);

      return entity;
    } catch {
      return undefined;
    }
  }

  loadAllEntitiesFromDirectory(): number {
    let count = 0;

    if (!fs.existsSync(this.basePath)) return 0;

    for (const typeDir of fs.readdirSync(this.basePath)) {
      const typePath = path.join(this.basePath, typeDir);
      if (!fs.statSync(typePath).isDirectory()) continue;

      for (const file of fs.readdirSync(typePath)) {
        if (file.endsWith('.json')) {
          const entity = this.loadEntityFromFile(path.join(typePath, file));
          if (entity) count++;
        }
      }
    }

    return count;
  }

  // ==========================================================================
  // EXPORT/IMPORT
  // ==========================================================================

  exportToJSON(): string {
    return JSON.stringify({
      entities: Array.from(this.entities.values()),
      basePath: this.basePath
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.basePath) {
      this.basePath = data.basePath;
    }

    for (const entityData of data.entities) {
      entityData.createdAt = new Date(entityData.createdAt);
      entityData.updatedAt = new Date(entityData.updatedAt);
      if (entityData.lastSyncAt) entityData.lastSyncAt = new Date(entityData.lastSyncAt);

      this.entities.set(entityData.id, entityData);
      this.entitiesByType.get(entityData.type)?.add(entityData.id);
      this.indexEntityName(entityData.name, entityData.id);
      for (const alias of entityData.aliases) {
        this.indexEntityName(alias, entityData.id);
      }
      this.buildCrossReferences(entityData);
    }
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getStats(): {
    totalEntities: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    pendingSync: number;
    withConflicts: number;
    averageReferences: number;
  } {
    const entities = this.getAllEntities();
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const type of Object.values(EntityType)) {
      byType[type] = 0;
    }
    for (const status of Object.values(EntityStatus)) {
      byStatus[status] = 0;
    }

    let pendingSync = 0;
    let withConflicts = 0;
    let totalRefs = 0;

    for (const entity of entities) {
      byType[entity.type]++;
      byStatus[entity.status]++;
      if (entity.syncStatus === SyncStatus.PENDING) pendingSync++;
      if (entity.syncStatus === SyncStatus.CONFLICT) withConflicts++;
      totalRefs += this.crossReferences.get(entity.id)?.size || 0;
    }

    return {
      totalEntities: entities.length,
      byType,
      byStatus,
      pendingSync,
      withConflicts,
      averageReferences: entities.length > 0 ? Math.round(totalRefs / entities.length * 10) / 10 : 0
    };
  }

  // ==========================================================================
  // CLEAR
  // ==========================================================================

  clear(): void {
    this.entities.clear();
    this.entitiesByName.clear();
    this.crossReferences.clear();
    this.pendingChanges.clear();

    for (const type of Object.values(EntityType)) {
      this.entitiesByType.set(type, new Set());
    }
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export const entityRegistry = new EntityRegistry();
