/**
 * Epic Fiction Architect - Real-Time State Tracker
 *
 * Unified real-time state management for all entities:
 * - Current character locations, status, inventory
 * - Current item ownership and locations
 * - Location occupants and conditions
 * - Canon vs Original character tracking
 * - State snapshots at any chapter
 * - Constraint validation (can character be here? do they have item?)
 * - Multi-form entity support (clones, time-displaced, etc.)
 *
 * This fills the critical gap: historical tracking exists,
 * but NO system tracks CURRENT state until now.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Character origin type - Canon vs Original
 */
export enum CharacterOriginType {
  CANON = 'canon',                       // From source material
  ORIGINAL = 'original',                 // OC created for this story
  CANON_DIVERGENT = 'canon_divergent',   // Canon character with altered history
  COMPOSITE = 'composite',               // Merged from multiple sources
  ALTERNATE = 'alternate',               // From alternate universe/timeline
  IMPORTED = 'imported'                  // From another author's work (with permission)
}

/**
 * Character status
 */
export enum CharacterStatus {
  ALIVE = 'alive',
  DEAD = 'dead',
  UNKNOWN = 'unknown',
  MISSING = 'missing',
  TRANSFORMED = 'transformed',
  SEALED = 'sealed',
  ASCENDED = 'ascended',
  DORMANT = 'dormant',
  COMATOSE = 'comatose',
  POSSESSED = 'possessed',
  SPLIT = 'split',                       // Multiple instances exist
  MERGED = 'merged',                     // Combined with another entity
  TEMPORAL_DISPLACED = 'temporal_displaced'
}

/**
 * Location status
 */
export enum LocationStatus {
  INTACT = 'intact',
  DAMAGED = 'damaged',
  DESTROYED = 'destroyed',
  REBUILT = 'rebuilt',
  ABANDONED = 'abandoned',
  OCCUPIED = 'occupied',
  CONTESTED = 'contested',
  SEALED = 'sealed',
  HIDDEN = 'hidden',
  TRANSFORMED = 'transformed'
}

/**
 * Item status
 */
export enum ItemStatus {
  INTACT = 'intact',
  DAMAGED = 'damaged',
  DESTROYED = 'destroyed',
  LOST = 'lost',
  STOLEN = 'stolen',
  MODIFIED = 'modified',
  AWAKENED = 'awakened',
  SEALED = 'sealed',
  CONSUMED = 'consumed',
  DUPLICATED = 'duplicated'
}

/**
 * Entity types for unified tracking
 */
export enum TrackedEntityType {
  CHARACTER = 'character',
  LOCATION = 'location',
  ITEM = 'item',
  FACTION = 'faction',
  VEHICLE = 'vehicle',
  CREATURE = 'creature'
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Real-time character state
 */
export interface CharacterState {
  id: string;
  name: string;
  aliases: string[];

  // Origin tracking
  originType: CharacterOriginType;
  canonSource?: string;                  // Source material if canon
  divergencePoint?: number;              // Chapter where they diverged from canon
  originalTraits: string[];              // Traits from source
  modifiedTraits: string[];              // Traits changed in this story

  // Current state (REAL-TIME)
  status: CharacterStatus;
  currentLocationId: string;
  currentLocationName: string;

  // Health/Condition
  healthPercent: number;                 // 0-100
  injuries: string[];
  conditions: string[];                  // Buffs, debuffs, curses, etc.
  emotionalState: string;

  // Inventory (REAL-TIME)
  currentInventory: {
    itemId: string;
    itemName: string;
    equipped: boolean;
    quantity: number;
  }[];

  // Abilities (currently available)
  activeAbilities: string[];
  sealedAbilities: string[];
  learningAbilities: string[];

  // Relationships (current state)
  currentRelationships: {
    characterId: string;
    characterName: string;
    type: string;
    sentiment: string;
    strength: number;
  }[];

  // Faction membership (current)
  currentFactions: {
    factionId: string;
    factionName: string;
    role: string;
    loyalty: number;
  }[];

  // Knowledge (current - what they know NOW)
  currentKnowledge: string[];
  currentSecrets: string[];

  // Multi-instance tracking
  instanceCount: number;                 // For clones, time-displaced, etc.
  instances?: CharacterInstance[];

  // Timeline
  lastSeenChapter: number;
  lastActionChapter: number;
  introducedChapter: number;
  deathChapter?: number;
  resurrectionChapter?: number;

  // Metadata
  lastUpdated: Date;
  stateVersion: number;
}

/**
 * Character instance (for multi-form entities)
 */
export interface CharacterInstance {
  instanceId: string;
  instanceType: 'clone' | 'time_displaced' | 'alternate' | 'split_personality' | 'possession' | 'form';
  locationId: string;
  locationName: string;
  status: CharacterStatus;
  divergenceChapter: number;
  notes: string;
}

/**
 * Real-time location state
 */
export interface LocationState {
  id: string;
  name: string;
  type: string;                          // city, building, planet, etc.
  parentLocationId?: string;
  parentLocationName?: string;

  // Current state (REAL-TIME)
  status: LocationStatus;
  currentRuler?: string;
  currentFaction?: string;

  // Occupants (REAL-TIME)
  currentOccupants: {
    characterId: string;
    characterName: string;
    role: string;                        // visitor, resident, prisoner, etc.
    arrivedChapter: number;
  }[];

  // Items at location (REAL-TIME)
  currentItems: {
    itemId: string;
    itemName: string;
    placement: string;                   // displayed, hidden, stored, etc.
  }[];

  // Conditions (REAL-TIME)
  currentConditions: string[];           // weather, damage, magic effects, etc.
  accessStatus: 'open' | 'restricted' | 'sealed' | 'destroyed';
  connectedLocations: {
    locationId: string;
    locationName: string;
    travelTime: number;                  // in hours
    route: string;
  }[];

  // Capacity
  maxCapacity?: number;
  currentPopulation: number;

  // Timeline
  introducedChapter: number;
  lastEventChapter: number;
  destructionChapter?: number;
  rebuildChapter?: number;

  // Metadata
  lastUpdated: Date;
  stateVersion: number;
}

/**
 * Real-time item state
 */
export interface ItemState {
  id: string;
  name: string;
  type: string;
  isUnique: boolean;

  // Current state (REAL-TIME)
  status: ItemStatus;
  currentOwnerId?: string;
  currentOwnerName?: string;
  currentLocationId: string;
  currentLocationName: string;

  // Condition
  conditionPercent: number;              // 0-100
  modifications: string[];
  enchantments: string[];
  curses: string[];

  // Quantity (for non-unique items)
  quantity: number;
  maxStack?: number;

  // Availability
  isEquipped: boolean;
  isAccessible: boolean;                 // Can owner reach it right now?
  isHidden: boolean;

  // Ownership history (recent)
  recentOwners: {
    characterId: string;
    characterName: string;
    fromChapter: number;
    toChapter?: number;
    howAcquired: string;
    howLost?: string;
  }[];

  // Timeline
  introducedChapter: number;
  lastUsedChapter: number;
  destructionChapter?: number;

  // Metadata
  lastUpdated: Date;
  stateVersion: number;
}

/**
 * Real-time faction state
 */
export interface FactionState {
  id: string;
  name: string;
  type: string;

  // Current state (REAL-TIME)
  status: 'active' | 'disbanded' | 'underground' | 'merged' | 'split';
  currentLeaderId?: string;
  currentLeaderName?: string;
  memberCount: number;

  // Territory (REAL-TIME)
  controlledLocations: {
    locationId: string;
    locationName: string;
    controlLevel: 'full' | 'contested' | 'influence';
  }[];

  // Resources (REAL-TIME)
  resources: {
    type: string;
    amount: number;
  }[];

  // Relations (REAL-TIME)
  currentAllies: string[];
  currentEnemies: string[];
  currentNeutrals: string[];

  // Members
  keyMembers: {
    characterId: string;
    characterName: string;
    role: string;
    loyalty: number;
  }[];

  // Timeline
  foundedChapter: number;
  disbandedChapter?: number;
  lastActivityChapter: number;

  // Metadata
  lastUpdated: Date;
  stateVersion: number;
}

/**
 * World state snapshot at a specific chapter
 */
export interface WorldStateSnapshot {
  id: string;
  chapter: number;
  timestamp: Date;

  // All states at this moment
  characterStates: Map<string, CharacterState>;
  locationStates: Map<string, LocationState>;
  itemStates: Map<string, ItemState>;
  factionStates: Map<string, FactionState>;

  // Summary
  aliveCharacters: number;
  deadCharacters: number;
  activeLocations: number;
  destroyedLocations: number;
  trackedItems: number;
  activeFactions: number;

  // Notes
  majorEvents: string[];
  notes: string;
}

/**
 * State change event
 */
export interface StateChangeEvent {
  id: string;
  chapter: number;
  entityType: TrackedEntityType;
  entityId: string;
  entityName: string;

  changeType: string;                    // 'location_change', 'status_change', 'inventory_add', etc.
  previousValue: string;
  newValue: string;
  reason: string;

  // Related entities
  relatedEntities: { type: TrackedEntityType; id: string; name: string }[];

  timestamp: Date;
}

/**
 * Constraint validation result
 */
export interface ConstraintValidation {
  isValid: boolean;
  violations: {
    type: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggestion: string;
  }[];
}

/**
 * Cast summary for current chapter
 */
export interface CastSummary {
  chapter: number;

  // Active cast
  activeCharacters: {
    id: string;
    name: string;
    location: string;
    status: CharacterStatus;
    originType: CharacterOriginType;
  }[];

  // By category
  canonCharacters: number;
  originalCharacters: number;
  aliveCharacters: number;
  deadCharacters: number;

  // Location distribution
  charactersByLocation: Map<string, string[]>;

  // Recently changed
  recentlyIntroduced: string[];
  recentlyDied: string[];
  recentlyMoved: string[];
}

// ============================================================================
// REAL-TIME STATE TRACKER
// ============================================================================

/**
 * Unified real-time state tracker for all entities
 */
export class RealTimeStateTracker {
  // Current state (LIVE - represents NOW)
  private characters: Map<string, CharacterState> = new Map();
  private locations: Map<string, LocationState> = new Map();
  private items: Map<string, ItemState> = new Map();
  private factions: Map<string, FactionState> = new Map();

  // State history
  private snapshots: Map<number, WorldStateSnapshot> = new Map();
  private changeLog: StateChangeEvent[] = [];

  // Indexes
  private charactersByLocation: Map<string, Set<string>> = new Map();
  private charactersByStatus: Map<CharacterStatus, Set<string>> = new Map();
  private charactersByOrigin: Map<CharacterOriginType, Set<string>> = new Map();
  private itemsByOwner: Map<string, Set<string>> = new Map();
  private itemsByLocation: Map<string, Set<string>> = new Map();

  // Current chapter tracking
  private currentChapter: number = 1;

  constructor() {
    // Initialize status indexes
    for (const status of Object.values(CharacterStatus)) {
      this.charactersByStatus.set(status, new Set());
    }
    for (const origin of Object.values(CharacterOriginType)) {
      this.charactersByOrigin.set(origin, new Set());
    }
  }

  // ==========================================================================
  // CHAPTER MANAGEMENT
  // ==========================================================================

  /**
   * Set current chapter (advances story time)
   */
  setCurrentChapter(chapter: number): void {
    this.currentChapter = chapter;
  }

  getCurrentChapter(): number {
    return this.currentChapter;
  }

  // ==========================================================================
  // CHARACTER STATE MANAGEMENT
  // ==========================================================================

  /**
   * Register a new character
   */
  registerCharacter(params: {
    name: string;
    aliases?: string[];
    originType: CharacterOriginType;
    canonSource?: string;
    initialLocationId: string;
    initialLocationName: string;
    status?: CharacterStatus;
    introducedChapter?: number;
  }): CharacterState {
    const id = uuidv4();

    const character: CharacterState = {
      id,
      name: params.name,
      aliases: params.aliases || [],
      originType: params.originType,
      canonSource: params.canonSource,
      originalTraits: [],
      modifiedTraits: [],
      status: params.status || CharacterStatus.ALIVE,
      currentLocationId: params.initialLocationId,
      currentLocationName: params.initialLocationName,
      healthPercent: 100,
      injuries: [],
      conditions: [],
      emotionalState: 'neutral',
      currentInventory: [],
      activeAbilities: [],
      sealedAbilities: [],
      learningAbilities: [],
      currentRelationships: [],
      currentFactions: [],
      currentKnowledge: [],
      currentSecrets: [],
      instanceCount: 1,
      lastSeenChapter: params.introducedChapter || this.currentChapter,
      lastActionChapter: params.introducedChapter || this.currentChapter,
      introducedChapter: params.introducedChapter || this.currentChapter,
      lastUpdated: new Date(),
      stateVersion: 1
    };

    this.characters.set(id, character);
    this.indexCharacter(character);

    this.logChange({
      entityType: TrackedEntityType.CHARACTER,
      entityId: id,
      entityName: params.name,
      changeType: 'introduced',
      previousValue: 'none',
      newValue: params.initialLocationName,
      reason: 'Character introduced'
    });

    return character;
  }

  /**
   * Get character by ID
   */
  getCharacter(id: string): CharacterState | undefined {
    return this.characters.get(id);
  }

  /**
   * Get character by name
   */
  getCharacterByName(name: string): CharacterState | undefined {
    for (const char of this.characters.values()) {
      if (char.name.toLowerCase() === name.toLowerCase() ||
          char.aliases.some(a => a.toLowerCase() === name.toLowerCase())) {
        return char;
      }
    }
    return undefined;
  }

  /**
   * Move character to new location
   */
  moveCharacter(characterId: string, newLocationId: string, newLocationName: string, reason: string): void {
    const character = this.characters.get(characterId);
    if (!character) throw new Error(`Character not found: ${characterId}`);

    const oldLocationId = character.currentLocationId;
    const oldLocationName = character.currentLocationName;

    // Update location indexes
    this.charactersByLocation.get(oldLocationId)?.delete(characterId);
    if (!this.charactersByLocation.has(newLocationId)) {
      this.charactersByLocation.set(newLocationId, new Set());
    }
    this.charactersByLocation.get(newLocationId)!.add(characterId);

    // Update character
    character.currentLocationId = newLocationId;
    character.currentLocationName = newLocationName;
    character.lastSeenChapter = this.currentChapter;
    character.lastUpdated = new Date();
    character.stateVersion++;

    // Update location occupants
    const oldLocation = this.locations.get(oldLocationId);
    if (oldLocation) {
      oldLocation.currentOccupants = oldLocation.currentOccupants.filter(o => o.characterId !== characterId);
    }

    const newLocation = this.locations.get(newLocationId);
    if (newLocation) {
      newLocation.currentOccupants.push({
        characterId,
        characterName: character.name,
        role: 'visitor',
        arrivedChapter: this.currentChapter
      });
    }

    this.logChange({
      entityType: TrackedEntityType.CHARACTER,
      entityId: characterId,
      entityName: character.name,
      changeType: 'location_change',
      previousValue: oldLocationName,
      newValue: newLocationName,
      reason
    });
  }

  /**
   * Update character status
   */
  updateCharacterStatus(characterId: string, newStatus: CharacterStatus, reason: string): void {
    const character = this.characters.get(characterId);
    if (!character) throw new Error(`Character not found: ${characterId}`);

    const oldStatus = character.status;

    // Update status indexes
    this.charactersByStatus.get(oldStatus)?.delete(characterId);
    this.charactersByStatus.get(newStatus)?.add(characterId);

    character.status = newStatus;
    character.lastUpdated = new Date();
    character.stateVersion++;

    if (newStatus === CharacterStatus.DEAD) {
      character.deathChapter = this.currentChapter;
    }

    this.logChange({
      entityType: TrackedEntityType.CHARACTER,
      entityId: characterId,
      entityName: character.name,
      changeType: 'status_change',
      previousValue: oldStatus,
      newValue: newStatus,
      reason
    });
  }

  /**
   * Add item to character inventory
   */
  addToInventory(characterId: string, itemId: string, itemName: string, quantity: number = 1, equipped: boolean = false): void {
    const character = this.characters.get(characterId);
    if (!character) throw new Error(`Character not found: ${characterId}`);

    const existing = character.currentInventory.find(i => i.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      character.currentInventory.push({ itemId, itemName, equipped, quantity });
    }

    // Update item state
    const item = this.items.get(itemId);
    if (item) {
      item.currentOwnerId = characterId;
      item.currentOwnerName = character.name;
      item.isEquipped = equipped;
    }

    // Update indexes
    if (!this.itemsByOwner.has(characterId)) {
      this.itemsByOwner.set(characterId, new Set());
    }
    this.itemsByOwner.get(characterId)!.add(itemId);

    character.lastUpdated = new Date();
    character.stateVersion++;

    this.logChange({
      entityType: TrackedEntityType.CHARACTER,
      entityId: characterId,
      entityName: character.name,
      changeType: 'inventory_add',
      previousValue: 'none',
      newValue: `${itemName} x${quantity}`,
      reason: 'Item acquired'
    });
  }

  /**
   * Remove item from character inventory
   */
  removeFromInventory(characterId: string, itemId: string, quantity: number = 1, reason: string): void {
    const character = this.characters.get(characterId);
    if (!character) throw new Error(`Character not found: ${characterId}`);

    const existing = character.currentInventory.find(i => i.itemId === itemId);
    if (!existing) return;

    existing.quantity -= quantity;
    if (existing.quantity <= 0) {
      character.currentInventory = character.currentInventory.filter(i => i.itemId !== itemId);
      this.itemsByOwner.get(characterId)?.delete(itemId);
    }

    character.lastUpdated = new Date();
    character.stateVersion++;

    this.logChange({
      entityType: TrackedEntityType.CHARACTER,
      entityId: characterId,
      entityName: character.name,
      changeType: 'inventory_remove',
      previousValue: existing.itemName,
      newValue: reason,
      reason
    });
  }

  // ==========================================================================
  // LOCATION STATE MANAGEMENT
  // ==========================================================================

  /**
   * Register a new location
   */
  registerLocation(params: {
    name: string;
    type: string;
    parentLocationId?: string;
    parentLocationName?: string;
    status?: LocationStatus;
    introducedChapter?: number;
  }): LocationState {
    const id = uuidv4();

    const location: LocationState = {
      id,
      name: params.name,
      type: params.type,
      parentLocationId: params.parentLocationId,
      parentLocationName: params.parentLocationName,
      status: params.status || LocationStatus.INTACT,
      currentOccupants: [],
      currentItems: [],
      currentConditions: [],
      accessStatus: 'open',
      connectedLocations: [],
      currentPopulation: 0,
      introducedChapter: params.introducedChapter || this.currentChapter,
      lastEventChapter: params.introducedChapter || this.currentChapter,
      lastUpdated: new Date(),
      stateVersion: 1
    };

    this.locations.set(id, location);
    this.charactersByLocation.set(id, new Set());

    return location;
  }

  /**
   * Get location by ID
   */
  getLocation(id: string): LocationState | undefined {
    return this.locations.get(id);
  }

  /**
   * Get location by name
   */
  getLocationByName(name: string): LocationState | undefined {
    for (const loc of this.locations.values()) {
      if (loc.name.toLowerCase() === name.toLowerCase()) {
        return loc;
      }
    }
    return undefined;
  }

  /**
   * Update location status
   */
  updateLocationStatus(locationId: string, newStatus: LocationStatus, reason: string): void {
    const location = this.locations.get(locationId);
    if (!location) throw new Error(`Location not found: ${locationId}`);

    const oldStatus = location.status;
    location.status = newStatus;
    location.lastEventChapter = this.currentChapter;
    location.lastUpdated = new Date();
    location.stateVersion++;

    if (newStatus === LocationStatus.DESTROYED) {
      location.destructionChapter = this.currentChapter;
    }

    this.logChange({
      entityType: TrackedEntityType.LOCATION,
      entityId: locationId,
      entityName: location.name,
      changeType: 'status_change',
      previousValue: oldStatus,
      newValue: newStatus,
      reason
    });
  }

  /**
   * Get characters at location
   */
  getCharactersAtLocation(locationId: string): CharacterState[] {
    const characterIds = this.charactersByLocation.get(locationId);
    if (!characterIds) return [];

    return Array.from(characterIds)
      .map(id => this.characters.get(id))
      .filter((c): c is CharacterState => c !== undefined);
  }

  // ==========================================================================
  // ITEM STATE MANAGEMENT
  // ==========================================================================

  /**
   * Register a new item
   */
  registerItem(params: {
    name: string;
    type: string;
    isUnique?: boolean;
    initialLocationId: string;
    initialLocationName: string;
    initialOwnerId?: string;
    initialOwnerName?: string;
    quantity?: number;
    introducedChapter?: number;
  }): ItemState {
    const id = uuidv4();

    const item: ItemState = {
      id,
      name: params.name,
      type: params.type,
      isUnique: params.isUnique ?? true,
      status: ItemStatus.INTACT,
      currentOwnerId: params.initialOwnerId,
      currentOwnerName: params.initialOwnerName,
      currentLocationId: params.initialLocationId,
      currentLocationName: params.initialLocationName,
      conditionPercent: 100,
      modifications: [],
      enchantments: [],
      curses: [],
      quantity: params.quantity || 1,
      isEquipped: false,
      isAccessible: true,
      isHidden: false,
      recentOwners: params.initialOwnerId ? [{
        characterId: params.initialOwnerId,
        characterName: params.initialOwnerName || 'Unknown',
        fromChapter: params.introducedChapter || this.currentChapter,
        howAcquired: 'initial'
      }] : [],
      introducedChapter: params.introducedChapter || this.currentChapter,
      lastUsedChapter: params.introducedChapter || this.currentChapter,
      lastUpdated: new Date(),
      stateVersion: 1
    };

    this.items.set(id, item);

    // Index
    if (!this.itemsByLocation.has(params.initialLocationId)) {
      this.itemsByLocation.set(params.initialLocationId, new Set());
    }
    this.itemsByLocation.get(params.initialLocationId)!.add(id);

    if (params.initialOwnerId) {
      if (!this.itemsByOwner.has(params.initialOwnerId)) {
        this.itemsByOwner.set(params.initialOwnerId, new Set());
      }
      this.itemsByOwner.get(params.initialOwnerId)!.add(id);
    }

    return item;
  }

  /**
   * Get item by ID
   */
  getItem(id: string): ItemState | undefined {
    return this.items.get(id);
  }

  /**
   * Transfer item to new owner
   */
  transferItem(itemId: string, newOwnerId: string, newOwnerName: string, howAcquired: string): void {
    const item = this.items.get(itemId);
    if (!item) throw new Error(`Item not found: ${itemId}`);

    const oldOwnerId = item.currentOwnerId;
    const oldOwnerName = item.currentOwnerName;

    // Update owner indexes
    if (oldOwnerId) {
      this.itemsByOwner.get(oldOwnerId)?.delete(itemId);
      // Update recent owners
      const lastOwner = item.recentOwners.find(o => o.characterId === oldOwnerId && !o.toChapter);
      if (lastOwner) {
        lastOwner.toChapter = this.currentChapter;
        lastOwner.howLost = `transferred to ${newOwnerName}`;
      }
    }

    if (!this.itemsByOwner.has(newOwnerId)) {
      this.itemsByOwner.set(newOwnerId, new Set());
    }
    this.itemsByOwner.get(newOwnerId)!.add(itemId);

    // Update item
    item.currentOwnerId = newOwnerId;
    item.currentOwnerName = newOwnerName;
    item.recentOwners.push({
      characterId: newOwnerId,
      characterName: newOwnerName,
      fromChapter: this.currentChapter,
      howAcquired
    });
    item.lastUpdated = new Date();
    item.stateVersion++;

    this.logChange({
      entityType: TrackedEntityType.ITEM,
      entityId: itemId,
      entityName: item.name,
      changeType: 'ownership_change',
      previousValue: oldOwnerName || 'none',
      newValue: newOwnerName,
      reason: howAcquired
    });
  }

  // ==========================================================================
  // FACTION STATE MANAGEMENT
  // ==========================================================================

  /**
   * Register a new faction
   */
  registerFaction(params: {
    name: string;
    type: string;
    founderId?: string;
    founderName?: string;
    foundedChapter?: number;
  }): FactionState {
    const id = uuidv4();

    const faction: FactionState = {
      id,
      name: params.name,
      type: params.type,
      status: 'active',
      currentLeaderId: params.founderId,
      currentLeaderName: params.founderName,
      memberCount: params.founderId ? 1 : 0,
      controlledLocations: [],
      resources: [],
      currentAllies: [],
      currentEnemies: [],
      currentNeutrals: [],
      keyMembers: params.founderId ? [{
        characterId: params.founderId,
        characterName: params.founderName || 'Unknown',
        role: 'Founder/Leader',
        loyalty: 100
      }] : [],
      foundedChapter: params.foundedChapter || this.currentChapter,
      lastActivityChapter: params.foundedChapter || this.currentChapter,
      lastUpdated: new Date(),
      stateVersion: 1
    };

    this.factions.set(id, faction);

    return faction;
  }

  /**
   * Get faction by ID
   */
  getFaction(id: string): FactionState | undefined {
    return this.factions.get(id);
  }

  // ==========================================================================
  // CONSTRAINT VALIDATION
  // ==========================================================================

  /**
   * Validate if character can be at location at current chapter
   */
  validateCharacterLocation(characterId: string, locationId: string): ConstraintValidation {
    const violations: ConstraintValidation['violations'] = [];
    const character = this.characters.get(characterId);
    const location = this.locations.get(locationId);

    if (!character) {
      violations.push({
        type: 'character_not_found',
        message: `Character ${characterId} not found`,
        severity: 'error',
        suggestion: 'Register the character first'
      });
      return { isValid: false, violations };
    }

    if (!location) {
      violations.push({
        type: 'location_not_found',
        message: `Location ${locationId} not found`,
        severity: 'error',
        suggestion: 'Register the location first'
      });
      return { isValid: false, violations };
    }

    // Check character status
    if (character.status === CharacterStatus.DEAD) {
      violations.push({
        type: 'character_dead',
        message: `${character.name} is dead (died chapter ${character.deathChapter})`,
        severity: 'error',
        suggestion: 'Resurrect the character first or use flashback'
      });
    }

    // Check location status
    if (location.status === LocationStatus.DESTROYED) {
      violations.push({
        type: 'location_destroyed',
        message: `${location.name} is destroyed (chapter ${location.destructionChapter})`,
        severity: 'error',
        suggestion: 'Rebuild the location or set scene before destruction'
      });
    }

    if (location.accessStatus === 'sealed') {
      violations.push({
        type: 'location_sealed',
        message: `${location.name} is sealed and inaccessible`,
        severity: 'warning',
        suggestion: 'Unseal the location or provide bypass method'
      });
    }

    return {
      isValid: violations.filter(v => v.severity === 'error').length === 0,
      violations
    };
  }

  /**
   * Validate if character has item
   */
  validateCharacterHasItem(characterId: string, itemId: string): ConstraintValidation {
    const violations: ConstraintValidation['violations'] = [];
    const character = this.characters.get(characterId);
    const item = this.items.get(itemId);

    if (!character) {
      violations.push({
        type: 'character_not_found',
        message: `Character ${characterId} not found`,
        severity: 'error',
        suggestion: 'Register the character first'
      });
      return { isValid: false, violations };
    }

    if (!item) {
      violations.push({
        type: 'item_not_found',
        message: `Item ${itemId} not found`,
        severity: 'error',
        suggestion: 'Register the item first'
      });
      return { isValid: false, violations };
    }

    const hasItem = character.currentInventory.some(i => i.itemId === itemId);
    if (!hasItem) {
      violations.push({
        type: 'item_not_owned',
        message: `${character.name} does not currently have ${item.name}`,
        severity: 'error',
        suggestion: item.currentOwnerName
          ? `Item is currently with ${item.currentOwnerName}`
          : `Item is at ${item.currentLocationName}`
      });
    }

    if (item.status === ItemStatus.DESTROYED) {
      violations.push({
        type: 'item_destroyed',
        message: `${item.name} was destroyed`,
        severity: 'error',
        suggestion: 'Repair or recreate the item'
      });
    }

    return {
      isValid: violations.filter(v => v.severity === 'error').length === 0,
      violations
    };
  }

  /**
   * Validate scene constraints (multiple characters at location)
   */
  validateScene(characterIds: string[], locationId: string): ConstraintValidation {
    const violations: ConstraintValidation['violations'] = [];

    for (const charId of characterIds) {
      const result = this.validateCharacterLocation(charId, locationId);
      violations.push(...result.violations);
    }

    // Check for conflicts (characters not at scene location)
    for (const charId of characterIds) {
      const char = this.characters.get(charId);
      if (char && char.currentLocationId !== locationId) {
        violations.push({
          type: 'character_elsewhere',
          message: `${char.name} is currently at ${char.currentLocationName}, not at scene location`,
          severity: 'warning',
          suggestion: 'Move character to scene location first or account for travel'
        });
      }
    }

    return {
      isValid: violations.filter(v => v.severity === 'error').length === 0,
      violations
    };
  }

  // ==========================================================================
  // SNAPSHOTS
  // ==========================================================================

  /**
   * Take a snapshot of current world state
   */
  takeSnapshot(notes?: string): WorldStateSnapshot {
    const snapshot: WorldStateSnapshot = {
      id: uuidv4(),
      chapter: this.currentChapter,
      timestamp: new Date(),
      characterStates: new Map(this.characters),
      locationStates: new Map(this.locations),
      itemStates: new Map(this.items),
      factionStates: new Map(this.factions),
      aliveCharacters: Array.from(this.characters.values()).filter(c => c.status === CharacterStatus.ALIVE).length,
      deadCharacters: Array.from(this.characters.values()).filter(c => c.status === CharacterStatus.DEAD).length,
      activeLocations: Array.from(this.locations.values()).filter(l => l.status !== LocationStatus.DESTROYED).length,
      destroyedLocations: Array.from(this.locations.values()).filter(l => l.status === LocationStatus.DESTROYED).length,
      trackedItems: this.items.size,
      activeFactions: Array.from(this.factions.values()).filter(f => f.status === 'active').length,
      majorEvents: [],
      notes: notes || ''
    };

    this.snapshots.set(this.currentChapter, snapshot);
    return snapshot;
  }

  /**
   * Get snapshot for a chapter
   */
  getSnapshot(chapter: number): WorldStateSnapshot | undefined {
    return this.snapshots.get(chapter);
  }

  // ==========================================================================
  // CAST SUMMARY
  // ==========================================================================

  /**
   * Get current cast summary
   */
  getCastSummary(): CastSummary {
    const activeCharacters = Array.from(this.characters.values())
      .filter(c => c.status === CharacterStatus.ALIVE || c.status === CharacterStatus.UNKNOWN)
      .map(c => ({
        id: c.id,
        name: c.name,
        location: c.currentLocationName,
        status: c.status,
        originType: c.originType
      }));

    const canonCount = activeCharacters.filter(c => c.originType === CharacterOriginType.CANON).length;
    const originalCount = activeCharacters.filter(c => c.originType === CharacterOriginType.ORIGINAL).length;

    const charactersByLocation = new Map<string, string[]>();
    for (const char of this.characters.values()) {
      const locName = char.currentLocationName;
      if (!charactersByLocation.has(locName)) {
        charactersByLocation.set(locName, []);
      }
      charactersByLocation.get(locName)!.push(char.name);
    }

    // Recent changes (last 5 chapters)
    const recentChapter = this.currentChapter - 5;
    const recentlyIntroduced = Array.from(this.characters.values())
      .filter(c => c.introducedChapter >= recentChapter)
      .map(c => c.name);
    const recentlyDied = Array.from(this.characters.values())
      .filter(c => c.deathChapter && c.deathChapter >= recentChapter)
      .map(c => c.name);
    const recentlyMoved = this.changeLog
      .filter(e => e.chapter >= recentChapter && e.changeType === 'location_change')
      .map(e => e.entityName);

    return {
      chapter: this.currentChapter,
      activeCharacters,
      canonCharacters: canonCount,
      originalCharacters: originalCount,
      aliveCharacters: this.charactersByStatus.get(CharacterStatus.ALIVE)?.size || 0,
      deadCharacters: this.charactersByStatus.get(CharacterStatus.DEAD)?.size || 0,
      charactersByLocation,
      recentlyIntroduced,
      recentlyDied,
      recentlyMoved: [...new Set(recentlyMoved)]
    };
  }

  /**
   * Get all canon characters
   */
  getCanonCharacters(): CharacterState[] {
    const ids = this.charactersByOrigin.get(CharacterOriginType.CANON);
    if (!ids) return [];
    return Array.from(ids).map(id => this.characters.get(id)).filter((c): c is CharacterState => c !== undefined);
  }

  /**
   * Get all original characters
   */
  getOriginalCharacters(): CharacterState[] {
    const ids = this.charactersByOrigin.get(CharacterOriginType.ORIGINAL);
    if (!ids) return [];
    return Array.from(ids).map(id => this.characters.get(id)).filter((c): c is CharacterState => c !== undefined);
  }

  // ==========================================================================
  // INDEXING
  // ==========================================================================

  private indexCharacter(character: CharacterState): void {
    // By location
    if (!this.charactersByLocation.has(character.currentLocationId)) {
      this.charactersByLocation.set(character.currentLocationId, new Set());
    }
    this.charactersByLocation.get(character.currentLocationId)!.add(character.id);

    // By status
    this.charactersByStatus.get(character.status)?.add(character.id);

    // By origin
    this.charactersByOrigin.get(character.originType)?.add(character.id);
  }

  private logChange(params: Omit<StateChangeEvent, 'id' | 'chapter' | 'timestamp' | 'relatedEntities'>): void {
    this.changeLog.push({
      ...params,
      id: uuidv4(),
      chapter: this.currentChapter,
      timestamp: new Date(),
      relatedEntities: []
    });
  }

  // ==========================================================================
  // STANDARD API
  // ==========================================================================

  getStats(): {
    totalCharacters: number;
    aliveCharacters: number;
    deadCharacters: number;
    canonCharacters: number;
    originalCharacters: number;
    totalLocations: number;
    totalItems: number;
    totalFactions: number;
    totalSnapshots: number;
    totalChangeEvents: number;
    currentChapter: number;
  } {
    return {
      totalCharacters: this.characters.size,
      aliveCharacters: this.charactersByStatus.get(CharacterStatus.ALIVE)?.size || 0,
      deadCharacters: this.charactersByStatus.get(CharacterStatus.DEAD)?.size || 0,
      canonCharacters: this.charactersByOrigin.get(CharacterOriginType.CANON)?.size || 0,
      originalCharacters: this.charactersByOrigin.get(CharacterOriginType.ORIGINAL)?.size || 0,
      totalLocations: this.locations.size,
      totalItems: this.items.size,
      totalFactions: this.factions.size,
      totalSnapshots: this.snapshots.size,
      totalChangeEvents: this.changeLog.length,
      currentChapter: this.currentChapter
    };
  }

  clear(): void {
    this.characters.clear();
    this.locations.clear();
    this.items.clear();
    this.factions.clear();
    this.snapshots.clear();
    this.changeLog = [];
    this.charactersByLocation.clear();
    this.itemsByOwner.clear();
    this.itemsByLocation.clear();

    for (const status of Object.values(CharacterStatus)) {
      this.charactersByStatus.set(status, new Set());
    }
    for (const origin of Object.values(CharacterOriginType)) {
      this.charactersByOrigin.set(origin, new Set());
    }

    this.currentChapter = 1;
  }

  exportToJSON(): string {
    return JSON.stringify({
      characters: Array.from(this.characters.entries()),
      locations: Array.from(this.locations.entries()),
      items: Array.from(this.items.entries()),
      factions: Array.from(this.factions.entries()),
      snapshots: Array.from(this.snapshots.entries()).map(([ch, snap]) => [ch, {
        ...snap,
        characterStates: Array.from(snap.characterStates.entries()),
        locationStates: Array.from(snap.locationStates.entries()),
        itemStates: Array.from(snap.itemStates.entries()),
        factionStates: Array.from(snap.factionStates.entries())
      }]),
      changeLog: this.changeLog,
      currentChapter: this.currentChapter
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.clear();

    if (data.characters) {
      for (const [id, char] of data.characters) {
        char.lastUpdated = new Date(char.lastUpdated);
        this.characters.set(id, char);
        this.indexCharacter(char);
      }
    }

    if (data.locations) {
      for (const [id, loc] of data.locations) {
        loc.lastUpdated = new Date(loc.lastUpdated);
        this.locations.set(id, loc);
        this.charactersByLocation.set(id, new Set());
      }
    }

    if (data.items) {
      for (const [id, item] of data.items) {
        item.lastUpdated = new Date(item.lastUpdated);
        this.items.set(id, item);
      }
    }

    if (data.factions) {
      for (const [id, faction] of data.factions) {
        faction.lastUpdated = new Date(faction.lastUpdated);
        this.factions.set(id, faction);
      }
    }

    if (data.changeLog) {
      this.changeLog = data.changeLog.map((e: StateChangeEvent) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      }));
    }

    if (data.currentChapter) {
      this.currentChapter = data.currentChapter;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default RealTimeStateTracker;
