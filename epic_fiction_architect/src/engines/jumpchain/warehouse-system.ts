/**
 * Warehouse System - Cosmic Warehouse and Inventory Management
 *
 * In Jumpchain, the Cosmic Warehouse is an extradimensional space that follows
 * the Jumper across all universes. It serves as storage for items, vehicles,
 * companions, and even entire structures. This system tracks:
 * - Base warehouse dimensions and expansions
 * - Purchased attachments and extensions
 * - Item storage and organization
 * - Access mechanics across different universes
 * - Companion housing and facilities
 *
 * Your warehouse grows with you - tracking 10 years of acquisitions per jump.
 */

import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Types of warehouse attachments/extensions
 */
export enum AttachmentType {
  // Basic Utilities
  ELECTRICITY = 'electricity',
  PLUMBING = 'plumbing',
  CLIMATE_CONTROL = 'climate_control',
  LIGHTING = 'lighting',
  INTERNET = 'internet',

  // Living Facilities
  HOUSING_BASIC = 'housing_basic',
  HOUSING_LUXURY = 'housing_luxury',
  HOUSING_COMPANION = 'housing_companion',
  MEDICAL_BAY = 'medical_bay',
  KITCHEN = 'kitchen',
  RECREATION = 'recreation',

  // Storage Expansions
  SPACE_EXPANSION = 'space_expansion',
  EXTRA_DIMENSIONAL = 'extra_dimensional',
  POCKET_DIMENSION = 'pocket_dimension',
  INFINITE_STORAGE = 'infinite_storage',

  // Workshops
  WORKSHOP_BASIC = 'workshop_basic',
  WORKSHOP_ADVANCED = 'workshop_advanced',
  FORGE = 'forge',
  LAB_SCIENCE = 'lab_science',
  LAB_MAGIC = 'lab_magic',
  LAB_TECH = 'lab_tech',

  // Special Facilities
  TRAINING_ROOM = 'training_room',
  GRAVITY_ROOM = 'gravity_room',
  TIME_DILATION = 'time_dilation',
  PORTAL_ROOM = 'portal_room',
  GARDEN = 'garden',
  FARM = 'farm',
  MEDBAY_ADVANCED = 'medbay_advanced',
  RESURRECTION_CHAMBER = 'resurrection_chamber',

  // Vehicle/Structure Storage
  GARAGE = 'garage',
  HANGAR = 'hangar',
  DOCK = 'dock',
  STRUCTURE_STORAGE = 'structure_storage',

  // Security
  DEFENSE_BASIC = 'defense_basic',
  DEFENSE_ADVANCED = 'defense_advanced',
  ANTI_INTRUSION = 'anti_intrusion',
  DIMENSIONAL_LOCK = 'dimensional_lock',

  // Custom/Other
  CUSTOM = 'custom'
}

/**
 * Warehouse access methods
 */
export enum AccessMethod {
  DOOR = 'door',                    // Simple door that appears
  KEY = 'key',                      // Requires key item
  MENTAL_COMMAND = 'mental_command', // Think to access
  PORTAL = 'portal',                // Creates portal
  TELEPORTATION = 'teleportation',  // Instant transport
  RESTRICTED = 'restricted',        // Limited access conditions
  ALWAYS_ACCESSIBLE = 'always_accessible'
}

/**
 * Storage zone types for organization
 */
export enum StorageZone {
  GENERAL = 'general',
  WEAPONS = 'weapons',
  ARMOR = 'armor',
  CONSUMABLES = 'consumables',
  VEHICLES = 'vehicles',
  STRUCTURES = 'structures',
  ARTIFACTS = 'artifacts',
  TECHNOLOGY = 'technology',
  MAGICAL_ITEMS = 'magical_items',
  CRAFTING_MATERIALS = 'crafting_materials',
  DOCUMENTS = 'documents',
  CURRENCY = 'currency',
  COMPANION_ITEMS = 'companion_items',
  LIVING_CREATURES = 'living_creatures',
  HAZARDOUS = 'hazardous',
  RESTRICTED = 'restricted',
  CUSTOM = 'custom'
}

/**
 * Item preservation status
 */
export enum PreservationStatus {
  NORMAL = 'normal',           // Normal wear/decay
  PRESERVED = 'preserved',     // Time frozen
  STASIS = 'stasis',          // Complete stasis
  DEGRADING = 'degrading',    // Actively deteriorating
  REGENERATING = 'regenerating' // Self-repairing
}

/**
 * Warehouse supplement sources
 */
export enum SupplementSource {
  PERSONAL_REALITY = 'personal_reality',  // Most common warehouse supplement
  COSMIC_WAREHOUSE = 'cosmic_warehouse',
  BODY_MOD = 'body_mod',
  ESSENTIAL_BODY_MOD = 'essential_body_mod',
  JUMP_SPECIFIC = 'jump_specific',
  UNIVERSAL_DRAWBACK = 'universal_drawback',
  CUSTOM = 'custom'
}

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Warehouse dimensions
 */
export interface WarehouseDimensions {
  length: number;      // In meters
  width: number;
  height: number;
  totalVolume: number; // Cubic meters
  usedVolume: number;
  infiniteSpace: boolean;
  dimensionalLayers: number; // Extra-dimensional expansions
}

/**
 * Warehouse attachment/extension
 */
export interface WarehouseAttachment {
  id: string;
  type: AttachmentType;
  name: string;
  description: string;
  source: SupplementSource;
  sourceJumpId?: string;
  cpCost: number;

  // Effects
  providesUtility: string[];
  spaceTaken: number;       // Volume consumed
  spaceProvided: number;    // Volume added (for expansions)

  // Upgrades
  tier: number;             // 1-5 for upgradeable attachments
  maxTier: number;
  upgradesFrom?: string;    // Previous tier attachment ID

  // Conditions
  prerequisites: string[];  // Required attachments
  restrictions: string[];

  // Tracking
  acquiredChapter: number;
  isActive: boolean;
  notes: string;
}

/**
 * Stored item in warehouse
 */
export interface StoredItem {
  id: string;
  itemId: string;           // Reference to JumpItem
  name: string;
  description: string;

  // Location
  zone: StorageZone;
  customZone?: string;
  locationDescription: string;
  attachmentId?: string;    // If stored in specific facility

  // Preservation
  preservation: PreservationStatus;
  timeInStorage: number;    // Chapters stored
  condition: number;        // 0-100

  // Organization
  quantity: number;
  stackable: boolean;
  containerIds: string[];   // Nested storage (box in a room)
  tags: string[];

  // Access
  isRestricted: boolean;
  restrictionReason?: string;
  lastAccessed: number;     // Chapter
  accessCount: number;

  // Special
  isLiving: boolean;        // Living creatures need care
  isSentient: boolean;
  maintenanceRequired: boolean;
  notes: string;
}

/**
 * Companion quarters in warehouse
 */
export interface CompanionQuarters {
  id: string;
  companionId: string;
  companionName: string;

  // Housing
  attachmentId: string;     // Housing attachment providing the space
  roomSize: 'small' | 'medium' | 'large' | 'suite' | 'wing';
  customization: string[];  // Personal touches

  // Amenities
  amenities: string[];
  personalWorkshop: boolean;
  trainingSpace: boolean;

  // Status
  isOccupied: boolean;
  lastOccupied: number;     // Chapter
  satisfactionLevel: number; // 0-100
  notes: string;
}

/**
 * Vehicle/structure stored in warehouse
 */
export interface StoredVehicle {
  id: string;
  itemId: string;           // Reference to JumpItem
  name: string;
  type: 'vehicle' | 'ship' | 'aircraft' | 'spacecraft' | 'structure' | 'building' | 'other';

  // Dimensions
  length: number;
  width: number;
  height: number;
  volume: number;

  // Storage
  attachmentId: string;     // Garage/hangar/dock storing it
  canBeDeployed: boolean;
  deploymentMethod: string;

  // Status
  condition: number;        // 0-100
  fuel: number;             // 0-100 or null if N/A
  crewRequired: number;
  crewCapacity: number;

  // Access
  lastUsed: number;         // Chapter
  timesDeployed: number;
  notes: string;
}

/**
 * Access point to warehouse
 */
export interface WarehouseAccess {
  id: string;
  method: AccessMethod;
  description: string;

  // Conditions
  universeRestrictions: string[];   // Can't access in certain universes
  cooldown: number;                 // Chapters between access
  duration: number;                 // How long portal stays open

  // Security
  requiresKey: boolean;
  keyItemId?: string;
  mentalPassword: boolean;
  biometricLock: boolean;

  // Limits
  sizeLimit: {
    maxHeight: number;
    maxWidth: number;
    maxVolume: number;
  } | null;

  // Origin
  sourceAttachmentId?: string;
  isDefault: boolean;
  notes: string;
}

/**
 * Resource tracking (currency, materials, etc.)
 */
export interface WarehouseResource {
  id: string;
  name: string;
  category: 'currency' | 'material' | 'energy' | 'consumable' | 'other';

  quantity: number;
  unit: string;
  isInfinite: boolean;
  regenerationRate: number;  // Per chapter

  sourceJumpIds: string[];
  storageZone: StorageZone;
  notes: string;
}

/**
 * Warehouse event log
 */
export interface WarehouseEvent {
  id: string;
  chapter: number;
  eventType: 'deposit' | 'withdrawal' | 'upgrade' | 'damage' | 'breach' | 'expansion' | 'access' | 'other';
  description: string;

  affectedItems: string[];
  affectedAttachments: string[];

  wasAutomatic: boolean;
  initiatedBy: string;      // Character ID
  notes: string;
}

/**
 * Warehouse supplement tracking
 */
export interface WarehouseSupplement {
  id: string;
  name: string;
  source: SupplementSource;
  version: string;

  cpBudget: number;
  cpSpent: number;

  appliedChapter: number;
  attachmentIds: string[];   // Attachments from this supplement

  specialRules: string[];
  notes: string;
}

/**
 * Warehouse system configuration
 */
export interface WarehouseConfig {
  defaultPreservation: PreservationStatus;
  autoOrganize: boolean;
  trackAccessHistory: boolean;
  maxEventHistory: number;
}

// =============================================================================
// WAREHOUSE SYSTEM CLASS
// =============================================================================

export class WarehouseSystem {
  // Core dimensions
  private dimensions: WarehouseDimensions;

  // Data storage
  private attachments: Map<string, WarehouseAttachment> = new Map();
  private storedItems: Map<string, StoredItem> = new Map();
  private companionQuarters: Map<string, CompanionQuarters> = new Map();
  private storedVehicles: Map<string, StoredVehicle> = new Map();
  private accessPoints: Map<string, WarehouseAccess> = new Map();
  private resources: Map<string, WarehouseResource> = new Map();
  private events: WarehouseEvent[] = [];
  private supplements: Map<string, WarehouseSupplement> = new Map();

  // Indexes
  private itemsByZone: Map<StorageZone, Set<string>> = new Map();
  private attachmentsByType: Map<AttachmentType, Set<string>> = new Map();

  // Configuration
  private config: WarehouseConfig = {
    defaultPreservation: PreservationStatus.PRESERVED,
    autoOrganize: true,
    trackAccessHistory: true,
    maxEventHistory: 10000
  };

  constructor() {
    // Initialize with default warehouse (10x10x10 meters - standard starting size)
    this.dimensions = {
      length: 10,
      width: 10,
      height: 10,
      totalVolume: 1000,
      usedVolume: 0,
      infiniteSpace: false,
      dimensionalLayers: 0
    };

    // Initialize zone indexes
    for (const zone of Object.values(StorageZone)) {
      this.itemsByZone.set(zone, new Set());
    }

    // Initialize attachment type indexes
    for (const type of Object.values(AttachmentType)) {
      this.attachmentsByType.set(type, new Set());
    }

    // Add default access method
    this.addAccessPoint({
      method: AccessMethod.DOOR,
      description: 'A simple door that appears when you will it',
      universeRestrictions: [],
      cooldown: 0,
      duration: -1, // Stays open
      requiresKey: false,
      mentalPassword: false,
      biometricLock: false,
      sizeLimit: { maxHeight: 3, maxWidth: 3, maxVolume: 27 },
      isDefault: true,
      notes: 'Standard warehouse access'
    });
  }

  // ===========================================================================
  // DIMENSION MANAGEMENT
  // ===========================================================================

  /**
   * Get current warehouse dimensions
   */
  getDimensions(): WarehouseDimensions {
    return { ...this.dimensions };
  }

  /**
   * Expand warehouse dimensions
   */
  expandWarehouse(expansion: {
    lengthAdd?: number;
    widthAdd?: number;
    heightAdd?: number;
    volumeMultiplier?: number;
    addDimensionalLayer?: boolean;
    setInfinite?: boolean;
    sourceAttachmentId?: string;
    chapter: number;
  }): void {
    if (expansion.lengthAdd) {
      this.dimensions.length += expansion.lengthAdd;
    }
    if (expansion.widthAdd) {
      this.dimensions.width += expansion.widthAdd;
    }
    if (expansion.heightAdd) {
      this.dimensions.height += expansion.heightAdd;
    }

    // Recalculate volume
    if (expansion.volumeMultiplier) {
      this.dimensions.totalVolume *= expansion.volumeMultiplier;
    } else {
      this.dimensions.totalVolume = this.dimensions.length *
        this.dimensions.width *
        this.dimensions.height;
    }

    if (expansion.addDimensionalLayer) {
      this.dimensions.dimensionalLayers++;
      // Each layer doubles effective space
      this.dimensions.totalVolume *= 2;
    }

    if (expansion.setInfinite) {
      this.dimensions.infiniteSpace = true;
      this.dimensions.totalVolume = Infinity;
    }

    // Log event
    this.logEvent({
      chapter: expansion.chapter,
      eventType: 'expansion',
      description: `Warehouse expanded`,
      affectedItems: [],
      affectedAttachments: expansion.sourceAttachmentId
        ? [expansion.sourceAttachmentId] : [],
      wasAutomatic: false,
      initiatedBy: 'jumper',
      notes: JSON.stringify(expansion)
    });
  }

  /**
   * Get available storage space
   */
  getAvailableSpace(): number {
    if (this.dimensions.infiniteSpace) return Infinity;
    return this.dimensions.totalVolume - this.dimensions.usedVolume;
  }

  // ===========================================================================
  // ATTACHMENT MANAGEMENT
  // ===========================================================================

  /**
   * Add an attachment/extension to the warehouse
   */
  addAttachment(data: Omit<WarehouseAttachment, 'id'>): WarehouseAttachment {
    const id = uuidv4();
    const attachment: WarehouseAttachment = { ...data, id };

    this.attachments.set(id, attachment);

    // Update index
    const typeSet = this.attachmentsByType.get(attachment.type) || new Set();
    typeSet.add(id);
    this.attachmentsByType.set(attachment.type, typeSet);

    // Apply space effects
    if (attachment.spaceProvided > 0) {
      this.dimensions.totalVolume += attachment.spaceProvided;
    }
    if (attachment.spaceTaken > 0) {
      this.dimensions.usedVolume += attachment.spaceTaken;
    }

    // Log event
    this.logEvent({
      chapter: attachment.acquiredChapter,
      eventType: 'upgrade',
      description: `Added attachment: ${attachment.name}`,
      affectedItems: [],
      affectedAttachments: [id],
      wasAutomatic: false,
      initiatedBy: 'jumper',
      notes: ''
    });

    return attachment;
  }

  /**
   * Get an attachment by ID
   */
  getAttachment(id: string): WarehouseAttachment | undefined {
    return this.attachments.get(id);
  }

  /**
   * Get all attachments of a specific type
   */
  getAttachmentsByType(type: AttachmentType): WarehouseAttachment[] {
    const ids = this.attachmentsByType.get(type) || new Set();
    return Array.from(ids)
      .map(id => this.attachments.get(id))
      .filter((a): a is WarehouseAttachment => a !== undefined);
  }

  /**
   * Check if attachment requirements are met
   */
  checkAttachmentPrerequisites(prerequisites: string[]): {
    met: boolean;
    missing: string[];
  } {
    const missing: string[] = [];

    for (const prereq of prerequisites) {
      const hasAttachment = Array.from(this.attachments.values())
        .some(a => a.name.toLowerCase() === prereq.toLowerCase() ||
                   a.type === prereq);

      if (!hasAttachment) {
        missing.push(prereq);
      }
    }

    return {
      met: missing.length === 0,
      missing
    };
  }

  /**
   * Upgrade an attachment to next tier
   */
  upgradeAttachment(
    attachmentId: string,
    newData: Partial<WarehouseAttachment>,
    chapter: number
  ): WarehouseAttachment | null {
    const attachment = this.attachments.get(attachmentId);
    if (!attachment) return null;

    if (attachment.tier >= attachment.maxTier) {
      return null; // Already at max
    }

    const upgraded: WarehouseAttachment = {
      ...attachment,
      ...newData,
      tier: attachment.tier + 1,
      upgradesFrom: attachmentId
    };

    this.attachments.set(attachmentId, upgraded);

    this.logEvent({
      chapter,
      eventType: 'upgrade',
      description: `Upgraded ${attachment.name} to tier ${upgraded.tier}`,
      affectedItems: [],
      affectedAttachments: [attachmentId],
      wasAutomatic: false,
      initiatedBy: 'jumper',
      notes: ''
    });

    return upgraded;
  }

  /**
   * Deactivate an attachment (but keep record)
   */
  deactivateAttachment(attachmentId: string, _chapter: number): boolean {
    const attachment = this.attachments.get(attachmentId);
    if (!attachment) return false;

    attachment.isActive = false;

    // Return space
    if (attachment.spaceProvided > 0) {
      this.dimensions.totalVolume -= attachment.spaceProvided;
    }
    if (attachment.spaceTaken > 0) {
      this.dimensions.usedVolume -= attachment.spaceTaken;
    }

    return true;
  }

  // ===========================================================================
  // ITEM STORAGE
  // ===========================================================================

  /**
   * Store an item in the warehouse
   */
  storeItem(data: Omit<StoredItem, 'id'>): StoredItem {
    const id = uuidv4();
    const item: StoredItem = { ...data, id };

    this.storedItems.set(id, item);

    // Update zone index
    const zoneSet = this.itemsByZone.get(item.zone) || new Set();
    zoneSet.add(id);
    this.itemsByZone.set(item.zone, zoneSet);

    // Log event
    if (this.config.trackAccessHistory) {
      this.logEvent({
        chapter: item.lastAccessed,
        eventType: 'deposit',
        description: `Stored: ${item.name}`,
        affectedItems: [id],
        affectedAttachments: item.attachmentId ? [item.attachmentId] : [],
        wasAutomatic: false,
        initiatedBy: 'jumper',
        notes: ''
      });
    }

    return item;
  }

  /**
   * Retrieve an item from storage
   */
  retrieveItem(itemId: string, chapter: number): StoredItem | null {
    const item = this.storedItems.get(itemId);
    if (!item) return null;

    item.lastAccessed = chapter;
    item.accessCount++;

    if (this.config.trackAccessHistory) {
      this.logEvent({
        chapter,
        eventType: 'withdrawal',
        description: `Retrieved: ${item.name}`,
        affectedItems: [itemId],
        affectedAttachments: [],
        wasAutomatic: false,
        initiatedBy: 'jumper',
        notes: ''
      });
    }

    return item;
  }

  /**
   * Remove an item from storage
   */
  removeItem(itemId: string, chapter: number): boolean {
    const item = this.storedItems.get(itemId);
    if (!item) return false;

    // Remove from zone index
    const zoneSet = this.itemsByZone.get(item.zone);
    if (zoneSet) {
      zoneSet.delete(itemId);
    }

    this.storedItems.delete(itemId);

    this.logEvent({
      chapter,
      eventType: 'withdrawal',
      description: `Permanently removed: ${item.name}`,
      affectedItems: [itemId],
      affectedAttachments: [],
      wasAutomatic: false,
      initiatedBy: 'jumper',
      notes: 'Item removed from warehouse'
    });

    return true;
  }

  /**
   * Get items by storage zone
   */
  getItemsByZone(zone: StorageZone): StoredItem[] {
    const ids = this.itemsByZone.get(zone) || new Set();
    return Array.from(ids)
      .map(id => this.storedItems.get(id))
      .filter((i): i is StoredItem => i !== undefined);
  }

  /**
   * Search items by tags or name
   */
  searchItems(query: {
    name?: string;
    tags?: string[];
    zone?: StorageZone;
    isRestricted?: boolean;
    preservation?: PreservationStatus;
  }): StoredItem[] {
    return Array.from(this.storedItems.values()).filter(item => {
      if (query.name && !item.name.toLowerCase().includes(query.name.toLowerCase())) {
        return false;
      }
      if (query.tags && !query.tags.some(tag => item.tags.includes(tag))) {
        return false;
      }
      if (query.zone && item.zone !== query.zone) {
        return false;
      }
      if (query.isRestricted !== undefined && item.isRestricted !== query.isRestricted) {
        return false;
      }
      if (query.preservation && item.preservation !== query.preservation) {
        return false;
      }
      return true;
    });
  }

  /**
   * Move item to different zone
   */
  moveItem(itemId: string, newZone: StorageZone, newLocation?: string): boolean {
    const item = this.storedItems.get(itemId);
    if (!item) return false;

    // Update zone index
    const oldZoneSet = this.itemsByZone.get(item.zone);
    if (oldZoneSet) {
      oldZoneSet.delete(itemId);
    }

    const newZoneSet = this.itemsByZone.get(newZone) || new Set();
    newZoneSet.add(itemId);
    this.itemsByZone.set(newZone, newZoneSet);

    item.zone = newZone;
    if (newLocation) {
      item.locationDescription = newLocation;
    }

    return true;
  }

  /**
   * Update item condition (for degrading items)
   */
  updateItemCondition(itemId: string, conditionDelta: number): number {
    const item = this.storedItems.get(itemId);
    if (!item) return -1;

    item.condition = Math.max(0, Math.min(100, item.condition + conditionDelta));
    return item.condition;
  }

  // ===========================================================================
  // COMPANION QUARTERS
  // ===========================================================================

  /**
   * Assign quarters to a companion
   */
  assignQuarters(data: Omit<CompanionQuarters, 'id'>): CompanionQuarters {
    const id = uuidv4();
    const quarters: CompanionQuarters = { ...data, id };

    this.companionQuarters.set(id, quarters);

    return quarters;
  }

  /**
   * Get quarters for a companion
   */
  getQuartersForCompanion(companionId: string): CompanionQuarters | undefined {
    return Array.from(this.companionQuarters.values())
      .find(q => q.companionId === companionId);
  }

  /**
   * Get all occupied quarters
   */
  getOccupiedQuarters(): CompanionQuarters[] {
    return Array.from(this.companionQuarters.values())
      .filter(q => q.isOccupied);
  }

  /**
   * Update companion satisfaction with quarters
   */
  updateSatisfaction(quartersId: string, delta: number): void {
    const quarters = this.companionQuarters.get(quartersId);
    if (quarters) {
      quarters.satisfactionLevel = Math.max(0, Math.min(100,
        quarters.satisfactionLevel + delta));
    }
  }

  // ===========================================================================
  // VEHICLE/STRUCTURE STORAGE
  // ===========================================================================

  /**
   * Store a vehicle or structure
   */
  storeVehicle(data: Omit<StoredVehicle, 'id'>): StoredVehicle | null {
    // Check if appropriate storage exists
    const storageTypes: AttachmentType[] = [];
    switch (data.type) {
      case 'vehicle':
        storageTypes.push(AttachmentType.GARAGE);
        break;
      case 'aircraft':
      case 'spacecraft':
        storageTypes.push(AttachmentType.HANGAR);
        break;
      case 'ship':
        storageTypes.push(AttachmentType.DOCK);
        break;
      case 'structure':
      case 'building':
        storageTypes.push(AttachmentType.STRUCTURE_STORAGE);
        break;
    }

    // Verify storage exists
    const hasStorage = storageTypes.some(type => {
      const attachments = this.getAttachmentsByType(type);
      return attachments.some(a => a.isActive);
    });

    if (!hasStorage && !this.dimensions.infiniteSpace) {
      // Check general space
      if (data.volume > this.getAvailableSpace()) {
        return null;
      }
    }

    const id = uuidv4();
    const vehicle: StoredVehicle = { ...data, id };

    this.storedVehicles.set(id, vehicle);
    this.dimensions.usedVolume += vehicle.volume;

    return vehicle;
  }

  /**
   * Get stored vehicle
   */
  getVehicle(id: string): StoredVehicle | undefined {
    return this.storedVehicles.get(id);
  }

  /**
   * Deploy a vehicle (mark as in-use)
   */
  deployVehicle(vehicleId: string, chapter: number): boolean {
    const vehicle = this.storedVehicles.get(vehicleId);
    if (!vehicle || !vehicle.canBeDeployed) return false;

    vehicle.lastUsed = chapter;
    vehicle.timesDeployed++;

    this.logEvent({
      chapter,
      eventType: 'withdrawal',
      description: `Deployed vehicle: ${vehicle.name}`,
      affectedItems: [vehicleId],
      affectedAttachments: [],
      wasAutomatic: false,
      initiatedBy: 'jumper',
      notes: ''
    });

    return true;
  }

  /**
   * Get all stored vehicles/structures
   */
  getAllVehicles(): StoredVehicle[] {
    return Array.from(this.storedVehicles.values());
  }

  // ===========================================================================
  // ACCESS MANAGEMENT
  // ===========================================================================

  /**
   * Add an access point to the warehouse
   */
  addAccessPoint(data: Omit<WarehouseAccess, 'id'>): WarehouseAccess {
    const id = uuidv4();
    const access: WarehouseAccess = { ...data, id };

    this.accessPoints.set(id, access);

    return access;
  }

  /**
   * Check if warehouse can be accessed in current context
   */
  canAccessWarehouse(context: {
    universe: string;
    chapter: number;
    lastAccessChapter: number;
  }): { canAccess: boolean; reason: string; availableMethods: WarehouseAccess[] } {
    const available: WarehouseAccess[] = [];
    let blockReason = '';

    for (const access of this.accessPoints.values()) {
      // Check universe restrictions
      if (access.universeRestrictions.includes(context.universe)) {
        blockReason = `Access blocked in universe: ${context.universe}`;
        continue;
      }

      // Check cooldown
      if (access.cooldown > 0) {
        const chaptersSince = context.chapter - context.lastAccessChapter;
        if (chaptersSince < access.cooldown) {
          continue; // This method on cooldown
        }
      }

      available.push(access);
    }

    return {
      canAccess: available.length > 0,
      reason: available.length > 0 ? 'Access available' : blockReason,
      availableMethods: available
    };
  }

  /**
   * Get all access points
   */
  getAllAccessPoints(): WarehouseAccess[] {
    return Array.from(this.accessPoints.values());
  }

  // ===========================================================================
  // RESOURCE TRACKING
  // ===========================================================================

  /**
   * Add a resource type to track
   */
  addResource(data: Omit<WarehouseResource, 'id'>): WarehouseResource {
    const id = uuidv4();
    const resource: WarehouseResource = { ...data, id };

    this.resources.set(id, resource);

    return resource;
  }

  /**
   * Get resource by ID
   */
  getResource(id: string): WarehouseResource | undefined {
    return this.resources.get(id);
  }

  /**
   * Update resource quantity
   */
  updateResourceQuantity(resourceId: string, delta: number): number {
    const resource = this.resources.get(resourceId);
    if (!resource) return -1;

    if (!resource.isInfinite) {
      resource.quantity = Math.max(0, resource.quantity + delta);
    }

    return resource.quantity;
  }

  /**
   * Process resource regeneration for a chapter
   */
  processRegeneration(_chapter: number): Map<string, number> {
    const regenerated = new Map<string, number>();

    for (const [id, resource] of this.resources) {
      if (resource.regenerationRate > 0 && !resource.isInfinite) {
        resource.quantity += resource.regenerationRate;
        regenerated.set(id, resource.regenerationRate);
      }
    }

    return regenerated;
  }

  /**
   * Get all resources
   */
  getAllResources(): WarehouseResource[] {
    return Array.from(this.resources.values());
  }

  // ===========================================================================
  // SUPPLEMENT MANAGEMENT
  // ===========================================================================

  /**
   * Apply a warehouse supplement
   */
  applySupplement(data: Omit<WarehouseSupplement, 'id'>): WarehouseSupplement {
    const id = uuidv4();
    const supplement: WarehouseSupplement = { ...data, id };

    this.supplements.set(id, supplement);

    return supplement;
  }

  /**
   * Get applied supplements
   */
  getAppliedSupplements(): WarehouseSupplement[] {
    return Array.from(this.supplements.values());
  }

  /**
   * Get CP remaining for a supplement
   */
  getSupplementCPRemaining(supplementId: string): number {
    const supplement = this.supplements.get(supplementId);
    if (!supplement) return 0;
    return supplement.cpBudget - supplement.cpSpent;
  }

  /**
   * Spend CP from a supplement
   */
  spendSupplementCP(supplementId: string, amount: number): boolean {
    const supplement = this.supplements.get(supplementId);
    if (!supplement) return false;
    if (supplement.cpSpent + amount > supplement.cpBudget) return false;

    supplement.cpSpent += amount;
    return true;
  }

  // ===========================================================================
  // EVENT LOGGING
  // ===========================================================================

  /**
   * Log a warehouse event
   */
  private logEvent(data: Omit<WarehouseEvent, 'id'>): WarehouseEvent {
    const id = uuidv4();
    const event: WarehouseEvent = { ...data, id };

    this.events.push(event);

    // Trim history if needed
    if (this.events.length > this.config.maxEventHistory) {
      this.events = this.events.slice(-this.config.maxEventHistory);
    }

    return event;
  }

  /**
   * Get events for a chapter range
   */
  getEvents(startChapter: number, endChapter: number): WarehouseEvent[] {
    return this.events.filter(e =>
      e.chapter >= startChapter && e.chapter <= endChapter);
  }

  /**
   * Get recent events
   */
  getRecentEvents(count: number): WarehouseEvent[] {
    return this.events.slice(-count);
  }

  // ===========================================================================
  // INVENTORY REPORT
  // ===========================================================================

  /**
   * Generate comprehensive inventory report
   */
  generateInventoryReport(): string {
    let report = '# Warehouse Inventory Report\n\n';

    // Dimensions
    report += '## Dimensions\n\n';
    if (this.dimensions.infiniteSpace) {
      report += '- **Space:** Infinite\n';
    } else {
      report += `- **Dimensions:** ${this.dimensions.length}m × ${this.dimensions.width}m × ${this.dimensions.height}m\n`;
      report += `- **Total Volume:** ${this.dimensions.totalVolume.toLocaleString()} m³\n`;
      report += `- **Used Volume:** ${this.dimensions.usedVolume.toLocaleString()} m³\n`;
      report += `- **Available:** ${this.getAvailableSpace().toLocaleString()} m³\n`;
    }
    if (this.dimensions.dimensionalLayers > 0) {
      report += `- **Dimensional Layers:** ${this.dimensions.dimensionalLayers}\n`;
    }
    report += '\n';

    // Attachments
    const activeAttachments = Array.from(this.attachments.values())
      .filter(a => a.isActive);
    report += `## Attachments (${activeAttachments.length})\n\n`;

    const attachmentsByCategory = new Map<string, WarehouseAttachment[]>();
    for (const attachment of activeAttachments) {
      const category = this.getAttachmentCategory(attachment.type);
      const list = attachmentsByCategory.get(category) || [];
      list.push(attachment);
      attachmentsByCategory.set(category, list);
    }

    for (const [category, attachments] of attachmentsByCategory) {
      report += `### ${category}\n`;
      for (const a of attachments) {
        report += `- **${a.name}** (Tier ${a.tier}/${a.maxTier})`;
        if (a.cpCost > 0) report += ` - ${a.cpCost} CP`;
        report += '\n';
      }
      report += '\n';
    }

    // Items by zone
    report += `## Stored Items (${this.storedItems.size})\n\n`;
    for (const [zone, ids] of this.itemsByZone) {
      if (ids.size > 0) {
        report += `### ${zone.replace(/_/g, ' ').toUpperCase()}\n`;
        for (const id of ids) {
          const item = this.storedItems.get(id);
          if (item) {
            report += `- **${item.name}**`;
            if (item.quantity > 1) report += ` (×${item.quantity})`;
            report += ` - Condition: ${item.condition}%\n`;
          }
        }
        report += '\n';
      }
    }

    // Vehicles
    if (this.storedVehicles.size > 0) {
      report += `## Vehicles & Structures (${this.storedVehicles.size})\n\n`;
      for (const vehicle of this.storedVehicles.values()) {
        report += `- **${vehicle.name}** (${vehicle.type}) - Condition: ${vehicle.condition}%\n`;
      }
      report += '\n';
    }

    // Companion quarters
    const occupied = this.getOccupiedQuarters();
    if (occupied.length > 0) {
      report += `## Companion Housing (${occupied.length} occupied)\n\n`;
      for (const quarters of occupied) {
        report += `- **${quarters.companionName}** - ${quarters.roomSize} quarters`;
        report += ` (Satisfaction: ${quarters.satisfactionLevel}%)\n`;
      }
      report += '\n';
    }

    // Resources
    if (this.resources.size > 0) {
      report += `## Resources\n\n`;
      for (const resource of this.resources.values()) {
        report += `- **${resource.name}:** `;
        if (resource.isInfinite) {
          report += 'Infinite';
        } else {
          report += `${resource.quantity.toLocaleString()} ${resource.unit}`;
        }
        report += '\n';
      }
      report += '\n';
    }

    return report;
  }

  /**
   * Get attachment category for grouping
   */
  private getAttachmentCategory(type: AttachmentType): string {
    if ([AttachmentType.ELECTRICITY, AttachmentType.PLUMBING,
         AttachmentType.CLIMATE_CONTROL, AttachmentType.LIGHTING,
         AttachmentType.INTERNET].includes(type)) {
      return 'Utilities';
    }
    if ([AttachmentType.HOUSING_BASIC, AttachmentType.HOUSING_LUXURY,
         AttachmentType.HOUSING_COMPANION, AttachmentType.KITCHEN,
         AttachmentType.RECREATION, AttachmentType.MEDICAL_BAY].includes(type)) {
      return 'Living Facilities';
    }
    if ([AttachmentType.SPACE_EXPANSION, AttachmentType.EXTRA_DIMENSIONAL,
         AttachmentType.POCKET_DIMENSION, AttachmentType.INFINITE_STORAGE].includes(type)) {
      return 'Storage Expansions';
    }
    if ([AttachmentType.WORKSHOP_BASIC, AttachmentType.WORKSHOP_ADVANCED,
         AttachmentType.FORGE, AttachmentType.LAB_SCIENCE,
         AttachmentType.LAB_MAGIC, AttachmentType.LAB_TECH].includes(type)) {
      return 'Workshops & Labs';
    }
    if ([AttachmentType.TRAINING_ROOM, AttachmentType.GRAVITY_ROOM,
         AttachmentType.TIME_DILATION, AttachmentType.PORTAL_ROOM,
         AttachmentType.GARDEN, AttachmentType.FARM].includes(type)) {
      return 'Special Facilities';
    }
    if ([AttachmentType.GARAGE, AttachmentType.HANGAR,
         AttachmentType.DOCK, AttachmentType.STRUCTURE_STORAGE].includes(type)) {
      return 'Vehicle Storage';
    }
    if ([AttachmentType.DEFENSE_BASIC, AttachmentType.DEFENSE_ADVANCED,
         AttachmentType.ANTI_INTRUSION, AttachmentType.DIMENSIONAL_LOCK].includes(type)) {
      return 'Security';
    }
    return 'Other';
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  /**
   * Get warehouse statistics
   */
  getStats(): {
    totalAttachments: number;
    activeAttachments: number;
    totalItems: number;
    totalVehicles: number;
    companionQuarters: number;
    occupiedQuarters: number;
    totalResources: number;
    spaceUsedPercent: number;
    hasInfiniteSpace: boolean;
    totalEvents: number;
    supplements: number;
  } {
    const activeAttachments = Array.from(this.attachments.values())
      .filter(a => a.isActive).length;
    const occupiedQuarters = Array.from(this.companionQuarters.values())
      .filter(q => q.isOccupied).length;

    return {
      totalAttachments: this.attachments.size,
      activeAttachments,
      totalItems: this.storedItems.size,
      totalVehicles: this.storedVehicles.size,
      companionQuarters: this.companionQuarters.size,
      occupiedQuarters,
      totalResources: this.resources.size,
      spaceUsedPercent: this.dimensions.infiniteSpace
        ? 0
        : (this.dimensions.usedVolume / this.dimensions.totalVolume) * 100,
      hasInfiniteSpace: this.dimensions.infiniteSpace,
      totalEvents: this.events.length,
      supplements: this.supplements.size
    };
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      dimensions: this.dimensions,
      attachments: Array.from(this.attachments.entries()),
      storedItems: Array.from(this.storedItems.entries()),
      companionQuarters: Array.from(this.companionQuarters.entries()),
      storedVehicles: Array.from(this.storedVehicles.entries()),
      accessPoints: Array.from(this.accessPoints.entries()),
      resources: Array.from(this.resources.entries()),
      events: this.events,
      supplements: Array.from(this.supplements.entries()),
      config: this.config
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.dimensions) {
      this.dimensions = data.dimensions;
    }

    if (data.attachments) {
      this.attachments = new Map(data.attachments);
      // Rebuild index
      this.attachmentsByType.clear();
      for (const type of Object.values(AttachmentType)) {
        this.attachmentsByType.set(type, new Set());
      }
      for (const [id, attachment] of this.attachments) {
        const typeSet = this.attachmentsByType.get(attachment.type) || new Set();
        typeSet.add(id);
        this.attachmentsByType.set(attachment.type, typeSet);
      }
    }

    if (data.storedItems) {
      this.storedItems = new Map(data.storedItems);
      // Rebuild zone index
      this.itemsByZone.clear();
      for (const zone of Object.values(StorageZone)) {
        this.itemsByZone.set(zone, new Set());
      }
      for (const [id, item] of this.storedItems) {
        const zoneSet = this.itemsByZone.get(item.zone) || new Set();
        zoneSet.add(id);
        this.itemsByZone.set(item.zone, zoneSet);
      }
    }

    if (data.companionQuarters) {
      this.companionQuarters = new Map(data.companionQuarters);
    }

    if (data.storedVehicles) {
      this.storedVehicles = new Map(data.storedVehicles);
    }

    if (data.accessPoints) {
      this.accessPoints = new Map(data.accessPoints);
    }

    if (data.resources) {
      this.resources = new Map(data.resources);
    }

    if (data.events) {
      this.events = data.events;
    }

    if (data.supplements) {
      this.supplements = new Map(data.supplements);
    }

    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    // Reset dimensions
    this.dimensions = {
      length: 10,
      width: 10,
      height: 10,
      totalVolume: 1000,
      usedVolume: 0,
      infiniteSpace: false,
      dimensionalLayers: 0
    };

    this.attachments.clear();
    this.storedItems.clear();
    this.companionQuarters.clear();
    this.storedVehicles.clear();
    this.accessPoints.clear();
    this.resources.clear();
    this.events = [];
    this.supplements.clear();

    // Reset indexes
    for (const zone of Object.values(StorageZone)) {
      this.itemsByZone.set(zone, new Set());
    }
    for (const type of Object.values(AttachmentType)) {
      this.attachmentsByType.set(type, new Set());
    }
  }
}

// Default instance
export const warehouseSystem = new WarehouseSystem();

export default WarehouseSystem;
