/**
 * Epic Fiction Architect - Reality-Fiction Bridge
 *
 * Handles the complex relationship between real-world locations and
 * fictional modifications. Supports:
 *
 * - Pure Fiction: Entirely made-up worlds (Middle-earth, Westeros)
 * - Alternate History: Real world with different history (Man in the High Castle)
 * - Urban Fantasy: Real world with hidden magic (Dresden Files, Harry Potter)
 * - Amalgam: Real locations with fictional elements mixed in (Tenchi Muyo)
 * - Masked Reality: Fictional names for real places (Springfield, Gotham)
 * - Crossover: Multiple fictional worlds merged together
 *
 * Key concepts:
 * - Reality Anchor: Connection to real-world location/data
 * - Fiction Layer: Modifications/additions to reality
 * - Divergence Point: When/how reality and fiction split
 * - Coexistence Rules: How real and fictional elements interact
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * How the fictional world relates to reality
 */
export enum RealityRelationType {
  // Pure fiction - no real-world connection
  PURE_FICTION = 'pure_fiction',

  // Based on reality
  ALTERNATE_HISTORY = 'alternate_history',      // History diverged at a point
  ALTERNATE_GEOGRAPHY = 'alternate_geography',  // Geography is different
  ALTERNATE_PHYSICS = 'alternate_physics',      // Laws of nature differ

  // Hidden/parallel to reality
  URBAN_FANTASY = 'urban_fantasy',              // Magic hidden in real world
  PARALLEL_WORLD = 'parallel_world',            // Exists alongside reality
  POCKET_DIMENSION = 'pocket_dimension',        // Small space attached to reality
  SHADOW_REALM = 'shadow_realm',                // Dark reflection of reality

  // Mixed reality
  AMALGAM = 'amalgam',                          // Real + fictional blended
  OVERLAY = 'overlay',                          // Fictional layer over reality
  MASKED = 'masked',                            // Real places with fake names
  FICTIONALIZED = 'fictionalized',              // Real places made fictional

  // Multiple sources
  CROSSOVER = 'crossover',                      // Multiple fictions merged
  MULTIVERSE = 'multiverse',                    // Many parallel realities
  COMPOSITE = 'composite'                        // Elements from multiple sources
}

/**
 * Level of reality correspondence
 */
export enum RealityCorrespondence {
  NONE = 'none',                    // No connection
  INSPIRED = 'inspired',            // Loosely inspired
  PARTIAL = 'partial',              // Some elements match
  STRONG = 'strong',                // Most elements match
  EXACT = 'exact',                  // Direct correspondence
  INVERTED = 'inverted'             // Opposite of reality
}

/**
 * Types of fictional modifications to reality
 */
export enum FictionalModificationType {
  // Additions
  ADD_LOCATION = 'add_location',           // New place that doesn't exist
  ADD_BUILDING = 'add_building',           // New structure in real location
  ADD_ORGANIZATION = 'add_organization',   // Fictional group
  ADD_SPECIES = 'add_species',             // Non-human inhabitants
  ADD_MAGIC = 'add_magic',                 // Supernatural elements
  ADD_TECHNOLOGY = 'add_technology',       // Tech beyond current reality

  // Modifications
  MODIFY_HISTORY = 'modify_history',       // Changed historical events
  MODIFY_GEOGRAPHY = 'modify_geography',   // Altered terrain/layout
  MODIFY_CULTURE = 'modify_culture',       // Different customs/society
  MODIFY_LAWS = 'modify_laws',             // Different physics/rules
  MODIFY_NAME = 'modify_name',             // Renamed but same place

  // Removals
  REMOVE_LOCATION = 'remove_location',     // Real place doesn't exist
  REMOVE_EVENT = 'remove_event',           // Historical event didn't happen
  REMOVE_PEOPLE = 'remove_people',         // People don't exist

  // Replacements
  REPLACE_LOCATION = 'replace_location',   // Different place at same coords
  REPLACE_HISTORY = 'replace_history',     // Entirely different past
  REPLACE_GOVERNMENT = 'replace_government' // Different ruling system
}

/**
 * Visibility of fictional elements
 */
export enum FictionalVisibility {
  PUBLIC = 'public',           // Everyone knows (alternate history)
  HIDDEN = 'hidden',           // Secret from mundanes (urban fantasy)
  DIMENSIONAL = 'dimensional', // Only accessible via special means
  TEMPORAL = 'temporal',       // Only exists at certain times
  SELECTIVE = 'selective'      // Only certain people can perceive
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * A real-world anchor point
 */
export interface RealityAnchor {
  id: string;
  name: string;
  type: 'location' | 'event' | 'person' | 'organization' | 'culture' | 'object';

  // Real-world data
  realWorld: {
    name: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    address?: string;
    region?: string;
    country?: string;
    description?: string;
    wikipediaUrl?: string;
    established?: string;
    population?: number;
    area?: number;
  };

  // Correspondence level
  correspondence: RealityCorrespondence;
  accuracyNotes?: string;

  // Metadata
  verifiedDate?: Date;
  dataSource?: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * A fictional modification/layer
 */
export interface FictionLayer {
  id: string;
  name: string;
  description: string;

  // What's being modified
  realityAnchorId?: string;          // If modifying something real
  baseLocationId?: string;           // If building on existing fiction

  // Modification type
  modificationType: FictionalModificationType;
  visibility: FictionalVisibility;

  // The fictional changes
  changes: {
    addedElements: FictionalElement[];
    modifiedElements: FictionalModification[];
    removedElements: string[];        // Names/descriptions of removed real things
  };

  // Constraints
  constraints: {
    maintainRealGeography: boolean;
    maintainRealHistory: boolean;
    maintainRealCulture: boolean;
    customRules: string[];
  };

  // In-story explanation
  narrativeExplanation?: string;      // How does the story explain this?

  createdAt: Date;
  updatedAt: Date;
}

/**
 * A fictional element added to reality
 */
export interface FictionalElement {
  id: string;
  type: 'location' | 'building' | 'organization' | 'species' | 'magic_system' |
        'technology' | 'character' | 'event' | 'artifact' | 'phenomenon';
  name: string;
  description: string;

  // Placement
  relativePosition?: {
    referenceRealLocation: string;   // "near Tokyo", "under London"
    direction?: string;
    distance?: string;
    accessibility?: string;
  };

  // Integration
  visibility: FictionalVisibility;
  interactsWithReality: boolean;
  discoveryConditions?: string[];    // How can this be found?

  // Metadata
  sourceUniverse?: string;           // For crossovers
  canonicalReference?: string;
}

/**
 * A modification to a real-world element
 */
export interface FictionalModification {
  id: string;
  realElementName: string;           // What real thing is modified
  modificationType: FictionalModificationType;

  // The change
  originalState?: string;            // How it is in reality
  modifiedState: string;             // How it is in fiction
  reason?: string;                   // Why this change exists

  // Scope
  scopeStart?: string;               // When modification takes effect (date/event)
  scopeEnd?: string;                 // When/if it ends
  isRetroactive: boolean;            // Does it change history?
}

/**
 * A divergence point where fiction splits from reality
 */
export interface DivergencePoint {
  id: string;
  name: string;
  description: string;

  // When divergence occurred
  divergenceDate?: string;           // "1945", "Ancient times", "Unknown"
  divergenceEvent?: string;          // What caused the split

  // Nature of divergence
  divergenceType: 'single_event' | 'gradual' | 'always_different' | 'recent' | 'future';

  // Scope
  affectedAspects: Array<'history' | 'geography' | 'physics' | 'magic' | 'technology' | 'biology'>;

  // Effects
  majorDifferences: string[];
  subtleDifferences: string[];

  // Butterfly effects
  cascadeEffects: {
    aspect: string;
    originalPath: string;
    divergentPath: string;
  }[];

  createdAt: Date;
}

/**
 * Complete amalgam world definition
 */
export interface AmalgamWorld {
  id: string;
  name: string;
  description: string;

  // World type
  relationType: RealityRelationType;
  primaryCorrespondence: RealityCorrespondence;

  // Real-world base
  realWorldBase: {
    primaryRegion?: string;          // "Japan", "Europe", "Earth"
    timeframe?: string;              // "Modern day", "1920s", "Near future"
    majorRealLocationsUsed: string[];
    realWorldConstraints: string[];  // What must remain true
  };

  // Divergence(s)
  divergencePoints: string[];        // DivergencePoint IDs

  // Fiction layers
  fictionLayers: string[];           // FictionLayer IDs

  // Coexistence rules
  coexistenceRules: {
    magicAndTechnology: 'separate' | 'integrated' | 'conflict' | 'unknown';
    mundaneAwareness: 'none' | 'rumors' | 'partial' | 'full';
    masqueradeEnforcement?: string;
    crossoverRules?: string[];
  };

  // Source tracking (for crossovers)
  sourceUniverses: {
    universeId: string;
    universeName: string;
    elementsUsed: string[];
    integrationNotes?: string;
  }[];

  // Consistency guidelines
  consistencyGuidelines: string[];

  createdAt: Date;
  updatedAt: Date;
}

/**
 * A location with reality-fiction binding
 */
export interface BoundLocation {
  id: string;
  fictionalName: string;
  fictionalDescription: string;

  // Reality binding
  realityAnchorId?: string;
  realWorldName?: string;
  realWorldCoordinates?: {
    latitude: number;
    longitude: number;
  };

  // Binding details
  bindingType: 'exact' | 'nearby' | 'inspired' | 'replacement' | 'hidden_within' | 'overlay';
  bindingStrength: RealityCorrespondence;

  // Fictional modifications at this location
  fictionLayerIds: string[];
  localModifications: FictionalModification[];
  localAdditions: FictionalElement[];

  // Navigation
  accessFromReality?: string;        // How to get there from real world
  exitToReality?: string;            // How to leave to real world

  // In-universe perception
  mundanePerception?: string;        // What non-magical people see
  awakenedPerception?: string;       // What magical people see

  // Map integration
  showOnRealMap: boolean;
  mapLayerId?: string;
  customMapIcon?: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuration for the bridge
 */
export interface RealityFictionBridgeConfig {
  defaultRelationType: RealityRelationType;
  defaultCorrespondence: RealityCorrespondence;
  defaultVisibility: FictionalVisibility;
  enableRealWorldValidation: boolean;
  enableCoordinateMapping: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: RealityFictionBridgeConfig = {
  defaultRelationType: RealityRelationType.AMALGAM,
  defaultCorrespondence: RealityCorrespondence.PARTIAL,
  defaultVisibility: FictionalVisibility.HIDDEN,
  enableRealWorldValidation: false,
  enableCoordinateMapping: true
};

// ============================================================================
// REALITY-FICTION BRIDGE CLASS
// ============================================================================

export class RealityFictionBridge {
  private config: RealityFictionBridgeConfig;

  // Storage
  private realityAnchors: Map<string, RealityAnchor> = new Map();
  private fictionLayers: Map<string, FictionLayer> = new Map();
  private divergencePoints: Map<string, DivergencePoint> = new Map();
  private amalgamWorlds: Map<string, AmalgamWorld> = new Map();
  private boundLocations: Map<string, BoundLocation> = new Map();

  // Indices
  private anchorsByCoordinates: Map<string, string> = new Map();  // "lat,lon" -> anchorId
  private layersByAnchor: Map<string, Set<string>> = new Map();
  private locationsByWorld: Map<string, Set<string>> = new Map();

  constructor(config?: Partial<RealityFictionBridgeConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  setConfig(config: Partial<RealityFictionBridgeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): RealityFictionBridgeConfig {
    return { ...this.config };
  }

  // ==========================================================================
  // REALITY ANCHORS
  // ==========================================================================

  /**
   * Create a reality anchor (real-world reference point)
   */
  createRealityAnchor(data: {
    name: string;
    type: RealityAnchor['type'];
    realWorld: RealityAnchor['realWorld'];
    correspondence?: RealityCorrespondence;
    accuracyNotes?: string;
    dataSource?: string;
  }): RealityAnchor {
    const id = uuidv4();
    const now = new Date();

    const anchor: RealityAnchor = {
      id,
      name: data.name,
      type: data.type,
      realWorld: data.realWorld,
      correspondence: data.correspondence ?? this.config.defaultCorrespondence,
      accuracyNotes: data.accuracyNotes,
      dataSource: data.dataSource,
      verifiedDate: now,
      createdAt: now,
      updatedAt: now
    };

    this.realityAnchors.set(id, anchor);

    // Index by coordinates if available
    if (anchor.realWorld.coordinates) {
      const key = `${anchor.realWorld.coordinates.latitude},${anchor.realWorld.coordinates.longitude}`;
      this.anchorsByCoordinates.set(key, id);
    }

    return anchor;
  }

  /**
   * Get reality anchor by ID
   */
  getRealityAnchor(id: string): RealityAnchor | undefined {
    return this.realityAnchors.get(id);
  }

  /**
   * Find reality anchor by coordinates
   */
  findAnchorByCoordinates(lat: number, lon: number, tolerance: number = 0.01): RealityAnchor | undefined {
    // Exact match first
    const exactKey = `${lat},${lon}`;
    const exactId = this.anchorsByCoordinates.get(exactKey);
    if (exactId) return this.realityAnchors.get(exactId);

    // Search within tolerance
    for (const anchor of this.realityAnchors.values()) {
      if (anchor.realWorld.coordinates) {
        const latDiff = Math.abs(anchor.realWorld.coordinates.latitude - lat);
        const lonDiff = Math.abs(anchor.realWorld.coordinates.longitude - lon);
        if (latDiff <= tolerance && lonDiff <= tolerance) {
          return anchor;
        }
      }
    }

    return undefined;
  }

  /**
   * Find reality anchors by name
   */
  findAnchorsByName(query: string): RealityAnchor[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.realityAnchors.values())
      .filter(a =>
        a.name.toLowerCase().includes(lowerQuery) ||
        a.realWorld.name.toLowerCase().includes(lowerQuery)
      );
  }

  /**
   * Create anchors for common real-world locations
   */
  createCommonAnchors(): RealityAnchor[] {
    const anchors: RealityAnchor[] = [];

    const commonLocations = [
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
      { name: 'Kyoto', lat: 35.0116, lon: 135.7681, country: 'Japan' },
      { name: 'Okayama', lat: 34.6618, lon: 133.9344, country: 'Japan' },
      { name: 'London', lat: 51.5074, lon: -0.1278, country: 'United Kingdom' },
      { name: 'New York City', lat: 40.7128, lon: -74.0060, country: 'United States' },
      { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'United States' },
      { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
      { name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'Germany' },
      { name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'Italy' },
      { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
      { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea' },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' }
    ];

    for (const loc of commonLocations) {
      anchors.push(this.createRealityAnchor({
        name: loc.name,
        type: 'location',
        realWorld: {
          name: loc.name,
          coordinates: { latitude: loc.lat, longitude: loc.lon },
          country: loc.country
        },
        correspondence: RealityCorrespondence.EXACT,
        dataSource: 'common_locations'
      }));
    }

    return anchors;
  }

  // ==========================================================================
  // FICTION LAYERS
  // ==========================================================================

  /**
   * Create a fiction layer
   */
  createFictionLayer(data: {
    name: string;
    description: string;
    realityAnchorId?: string;
    baseLocationId?: string;
    modificationType: FictionalModificationType;
    visibility?: FictionalVisibility;
    changes?: Partial<FictionLayer['changes']>;
    constraints?: Partial<FictionLayer['constraints']>;
    narrativeExplanation?: string;
  }): FictionLayer {
    const id = uuidv4();
    const now = new Date();

    const layer: FictionLayer = {
      id,
      name: data.name,
      description: data.description,
      realityAnchorId: data.realityAnchorId,
      baseLocationId: data.baseLocationId,
      modificationType: data.modificationType,
      visibility: data.visibility ?? this.config.defaultVisibility,
      changes: {
        addedElements: data.changes?.addedElements ?? [],
        modifiedElements: data.changes?.modifiedElements ?? [],
        removedElements: data.changes?.removedElements ?? []
      },
      constraints: {
        maintainRealGeography: data.constraints?.maintainRealGeography ?? true,
        maintainRealHistory: data.constraints?.maintainRealHistory ?? false,
        maintainRealCulture: data.constraints?.maintainRealCulture ?? true,
        customRules: data.constraints?.customRules ?? []
      },
      narrativeExplanation: data.narrativeExplanation,
      createdAt: now,
      updatedAt: now
    };

    this.fictionLayers.set(id, layer);

    // Index by anchor
    if (data.realityAnchorId) {
      if (!this.layersByAnchor.has(data.realityAnchorId)) {
        this.layersByAnchor.set(data.realityAnchorId, new Set());
      }
      this.layersByAnchor.get(data.realityAnchorId)!.add(id);
    }

    return layer;
  }

  /**
   * Add fictional element to a layer
   */
  addFictionalElement(layerId: string, element: Omit<FictionalElement, 'id'>): FictionalElement {
    const layer = this.fictionLayers.get(layerId);
    if (!layer) throw new Error(`Layer ${layerId} not found`);

    const fullElement: FictionalElement = {
      ...element,
      id: uuidv4()
    };

    layer.changes.addedElements.push(fullElement);
    layer.updatedAt = new Date();

    return fullElement;
  }

  /**
   * Add fictional modification to a layer
   */
  addFictionalModification(
    layerId: string,
    modification: Omit<FictionalModification, 'id'>
  ): FictionalModification {
    const layer = this.fictionLayers.get(layerId);
    if (!layer) throw new Error(`Layer ${layerId} not found`);

    const fullMod: FictionalModification = {
      ...modification,
      id: uuidv4()
    };

    layer.changes.modifiedElements.push(fullMod);
    layer.updatedAt = new Date();

    return fullMod;
  }

  /**
   * Get fiction layer
   */
  getFictionLayer(id: string): FictionLayer | undefined {
    return this.fictionLayers.get(id);
  }

  /**
   * Get layers for a reality anchor
   */
  getLayersForAnchor(anchorId: string): FictionLayer[] {
    const layerIds = this.layersByAnchor.get(anchorId);
    if (!layerIds) return [];

    return Array.from(layerIds)
      .map(id => this.fictionLayers.get(id)!)
      .filter(Boolean);
  }

  // ==========================================================================
  // DIVERGENCE POINTS
  // ==========================================================================

  /**
   * Create a divergence point
   */
  createDivergencePoint(data: {
    name: string;
    description: string;
    divergenceDate?: string;
    divergenceEvent?: string;
    divergenceType: DivergencePoint['divergenceType'];
    affectedAspects: DivergencePoint['affectedAspects'];
    majorDifferences: string[];
    subtleDifferences?: string[];
  }): DivergencePoint {
    const id = uuidv4();

    const point: DivergencePoint = {
      id,
      name: data.name,
      description: data.description,
      divergenceDate: data.divergenceDate,
      divergenceEvent: data.divergenceEvent,
      divergenceType: data.divergenceType,
      affectedAspects: data.affectedAspects,
      majorDifferences: data.majorDifferences,
      subtleDifferences: data.subtleDifferences ?? [],
      cascadeEffects: [],
      createdAt: new Date()
    };

    this.divergencePoints.set(id, point);
    return point;
  }

  /**
   * Add cascade effect to divergence point
   */
  addCascadeEffect(
    pointId: string,
    effect: DivergencePoint['cascadeEffects'][0]
  ): void {
    const point = this.divergencePoints.get(pointId);
    if (!point) throw new Error(`Divergence point ${pointId} not found`);

    point.cascadeEffects.push(effect);
  }

  /**
   * Get divergence point
   */
  getDivergencePoint(id: string): DivergencePoint | undefined {
    return this.divergencePoints.get(id);
  }

  // ==========================================================================
  // AMALGAM WORLDS
  // ==========================================================================

  /**
   * Create an amalgam world definition
   */
  createAmalgamWorld(data: {
    name: string;
    description: string;
    relationType: RealityRelationType;
    primaryCorrespondence?: RealityCorrespondence;
    realWorldBase: AmalgamWorld['realWorldBase'];
    coexistenceRules?: Partial<AmalgamWorld['coexistenceRules']>;
    consistencyGuidelines?: string[];
  }): AmalgamWorld {
    const id = uuidv4();
    const now = new Date();

    const world: AmalgamWorld = {
      id,
      name: data.name,
      description: data.description,
      relationType: data.relationType,
      primaryCorrespondence: data.primaryCorrespondence ?? this.config.defaultCorrespondence,
      realWorldBase: data.realWorldBase,
      divergencePoints: [],
      fictionLayers: [],
      coexistenceRules: {
        magicAndTechnology: data.coexistenceRules?.magicAndTechnology ?? 'integrated',
        mundaneAwareness: data.coexistenceRules?.mundaneAwareness ?? 'none',
        masqueradeEnforcement: data.coexistenceRules?.masqueradeEnforcement,
        crossoverRules: data.coexistenceRules?.crossoverRules
      },
      sourceUniverses: [],
      consistencyGuidelines: data.consistencyGuidelines ?? [],
      createdAt: now,
      updatedAt: now
    };

    this.amalgamWorlds.set(id, world);
    this.locationsByWorld.set(id, new Set());

    return world;
  }

  /**
   * Add divergence point to world
   */
  addDivergenceToWorld(worldId: string, divergencePointId: string): void {
    const world = this.amalgamWorlds.get(worldId);
    if (!world) throw new Error(`World ${worldId} not found`);

    if (!world.divergencePoints.includes(divergencePointId)) {
      world.divergencePoints.push(divergencePointId);
      world.updatedAt = new Date();
    }
  }

  /**
   * Add fiction layer to world
   */
  addLayerToWorld(worldId: string, layerId: string): void {
    const world = this.amalgamWorlds.get(worldId);
    if (!world) throw new Error(`World ${worldId} not found`);

    if (!world.fictionLayers.includes(layerId)) {
      world.fictionLayers.push(layerId);
      world.updatedAt = new Date();
    }
  }

  /**
   * Add source universe for crossover
   */
  addSourceUniverse(
    worldId: string,
    source: AmalgamWorld['sourceUniverses'][0]
  ): void {
    const world = this.amalgamWorlds.get(worldId);
    if (!world) throw new Error(`World ${worldId} not found`);

    world.sourceUniverses.push(source);
    world.updatedAt = new Date();
  }

  /**
   * Get amalgam world
   */
  getAmalgamWorld(id: string): AmalgamWorld | undefined {
    return this.amalgamWorlds.get(id);
  }

  /**
   * Get all amalgam worlds
   */
  getAllAmalgamWorlds(): AmalgamWorld[] {
    return Array.from(this.amalgamWorlds.values());
  }

  // ==========================================================================
  // BOUND LOCATIONS
  // ==========================================================================

  /**
   * Create a bound location (links fictional location to reality)
   */
  createBoundLocation(data: {
    fictionalName: string;
    fictionalDescription: string;
    realityAnchorId?: string;
    realWorldName?: string;
    realWorldCoordinates?: { latitude: number; longitude: number };
    bindingType: BoundLocation['bindingType'];
    bindingStrength?: RealityCorrespondence;
    worldId?: string;
  }): BoundLocation {
    const id = uuidv4();
    const now = new Date();

    const location: BoundLocation = {
      id,
      fictionalName: data.fictionalName,
      fictionalDescription: data.fictionalDescription,
      realityAnchorId: data.realityAnchorId,
      realWorldName: data.realWorldName,
      realWorldCoordinates: data.realWorldCoordinates,
      bindingType: data.bindingType,
      bindingStrength: data.bindingStrength ?? this.config.defaultCorrespondence,
      fictionLayerIds: [],
      localModifications: [],
      localAdditions: [],
      showOnRealMap: this.config.enableCoordinateMapping && !!data.realWorldCoordinates,
      createdAt: now,
      updatedAt: now
    };

    this.boundLocations.set(id, location);

    // Index by world if provided
    if (data.worldId) {
      if (!this.locationsByWorld.has(data.worldId)) {
        this.locationsByWorld.set(data.worldId, new Set());
      }
      this.locationsByWorld.get(data.worldId)!.add(id);
    }

    return location;
  }

  /**
   * Add local modification to bound location
   */
  addLocalModification(
    locationId: string,
    modification: Omit<FictionalModification, 'id'>
  ): FictionalModification {
    const location = this.boundLocations.get(locationId);
    if (!location) throw new Error(`Location ${locationId} not found`);

    const fullMod: FictionalModification = {
      ...modification,
      id: uuidv4()
    };

    location.localModifications.push(fullMod);
    location.updatedAt = new Date();

    return fullMod;
  }

  /**
   * Add local fictional element to bound location
   */
  addLocalElement(
    locationId: string,
    element: Omit<FictionalElement, 'id'>
  ): FictionalElement {
    const location = this.boundLocations.get(locationId);
    if (!location) throw new Error(`Location ${locationId} not found`);

    const fullElement: FictionalElement = {
      ...element,
      id: uuidv4()
    };

    location.localAdditions.push(fullElement);
    location.updatedAt = new Date();

    return fullElement;
  }

  /**
   * Set perception details for bound location
   */
  setLocationPerceptions(
    locationId: string,
    mundane?: string,
    awakened?: string
  ): void {
    const location = this.boundLocations.get(locationId);
    if (!location) return;

    if (mundane !== undefined) location.mundanePerception = mundane;
    if (awakened !== undefined) location.awakenedPerception = awakened;
    location.updatedAt = new Date();
  }

  /**
   * Get bound location
   */
  getBoundLocation(id: string): BoundLocation | undefined {
    return this.boundLocations.get(id);
  }

  /**
   * Get locations for a world
   */
  getWorldLocations(worldId: string): BoundLocation[] {
    const locationIds = this.locationsByWorld.get(worldId);
    if (!locationIds) return [];

    return Array.from(locationIds)
      .map(id => this.boundLocations.get(id)!)
      .filter(Boolean);
  }

  /**
   * Find bound locations near coordinates
   */
  findLocationsNearCoordinates(
    lat: number,
    lon: number,
    radiusKm: number
  ): BoundLocation[] {
    const results: BoundLocation[] = [];

    for (const location of this.boundLocations.values()) {
      if (location.realWorldCoordinates) {
        const distance = this.calculateDistance(
          lat, lon,
          location.realWorldCoordinates.latitude,
          location.realWorldCoordinates.longitude
        );
        if (distance <= radiusKm) {
          results.push(location);
        }
      }
    }

    return results;
  }

  /**
   * Calculate distance between coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // ==========================================================================
  // PRESET WORLDS
  // ==========================================================================

  /**
   * Create Tenchi Muyo-style amalgam (real Japan with hidden aliens/magic)
   */
  createTenchiMuyoStyleWorld(): AmalgamWorld {
    const world = this.createAmalgamWorld({
      name: 'Earth (Hidden Alien Contact)',
      description: 'Modern Earth where alien civilizations secretly interact with humanity, with key events centered around rural Japan',
      relationType: RealityRelationType.URBAN_FANTASY,
      primaryCorrespondence: RealityCorrespondence.STRONG,
      realWorldBase: {
        primaryRegion: 'Japan',
        timeframe: 'Modern day',
        majorRealLocationsUsed: ['Okayama Prefecture', 'Tokyo', 'Kurashiki'],
        realWorldConstraints: [
          'Geography matches real Japan',
          'Major historical events occurred normally',
          'Technology level matches reality',
          'Alien/supernatural elements remain hidden from general public'
        ]
      },
      coexistenceRules: {
        magicAndTechnology: 'integrated',
        mundaneAwareness: 'rumors',
        masqueradeEnforcement: 'Self-policing by supernatural community with occasional government liaison',
        crossoverRules: ['Jurai royal trees can bond with humans', 'Space travel requires Jurai technology or similar']
      },
      consistencyGuidelines: [
        'Rural areas more likely to have supernatural activity',
        'Government aware but maintains plausible deniability',
        'Ancient shrines often have genuine spiritual significance',
        'Alien technology disguised as normal objects when in public'
      ]
    });

    // Add divergence point
    const divergence = this.createDivergencePoint({
      name: 'First Jurai Contact',
      description: 'When the first Jurai ship crashed on Earth in ancient times',
      divergenceDate: 'Ancient times (700+ years ago)',
      divergenceEvent: 'Arrival of Yosho pursuing Ryoko',
      divergenceType: 'single_event',
      affectedAspects: ['history', 'magic'],
      majorDifferences: [
        'Alien civilizations exist and have contacted Earth',
        'Some shrine families have alien heritage',
        'Advanced technology exists but is hidden'
      ]
    });

    this.addDivergenceToWorld(world.id, divergence.id);

    return world;
  }

  /**
   * Create Dresden Files-style world (hidden supernatural in modern cities)
   */
  createDresdenStyleWorld(): AmalgamWorld {
    const world = this.createAmalgamWorld({
      name: 'Earth (Supernatural Masquerade)',
      description: 'Modern Earth where magic is real but hidden, with supernatural communities in major cities',
      relationType: RealityRelationType.URBAN_FANTASY,
      primaryCorrespondence: RealityCorrespondence.EXACT,
      realWorldBase: {
        primaryRegion: 'Global (primarily North America/Europe)',
        timeframe: 'Modern day',
        majorRealLocationsUsed: ['Chicago', 'Edinburgh', 'New Orleans', 'Los Angeles'],
        realWorldConstraints: [
          'All major real-world locations exist exactly as in reality',
          'History matches reality with hidden supernatural influences',
          'Technology functions normally except around strong magic'
        ]
      },
      coexistenceRules: {
        magicAndTechnology: 'conflict',
        mundaneAwareness: 'rumors',
        masqueradeEnforcement: 'White Council and Accords enforce secrecy',
        crossoverRules: ['Magic disrupts modern technology', 'Thresholds protect homes']
      },
      consistencyGuidelines: [
        'Magic users avoid technology',
        'Supernatural creatures have territories',
        'Ancient accords govern supernatural politics',
        'Mortal authorities occasionally encounter supernatural but rationalize it'
      ]
    });

    const divergence = this.createDivergencePoint({
      name: 'Always Supernatural',
      description: 'Magic has always existed alongside mundane reality',
      divergenceType: 'always_different',
      affectedAspects: ['magic', 'history'],
      majorDifferences: [
        'Magic is real and has rules',
        'Supernatural creatures exist in hiding',
        'Ancient supernatural accords govern non-human society'
      ]
    });

    this.addDivergenceToWorld(world.id, divergence.id);

    return world;
  }

  // ==========================================================================
  // MAP INTEGRATION
  // ==========================================================================

  /**
   * Get all map-displayable locations with coordinates
   */
  getMappableLocations(): Array<{
    locationId: string;
    name: string;
    latitude: number;
    longitude: number;
    type: string;
    description: string;
    hasModifications: boolean;
  }> {
    const results = [];

    for (const location of this.boundLocations.values()) {
      if (location.showOnRealMap && location.realWorldCoordinates) {
        results.push({
          locationId: location.id,
          name: location.fictionalName,
          latitude: location.realWorldCoordinates.latitude,
          longitude: location.realWorldCoordinates.longitude,
          type: location.bindingType,
          description: location.fictionalDescription,
          hasModifications: location.localModifications.length > 0 || location.localAdditions.length > 0
        });
      }
    }

    return results;
  }

  /**
   * Generate map layer data for a world
   */
  generateWorldMapLayer(worldId: string): {
    layerName: string;
    points: Array<{
      lat: number;
      lon: number;
      label: string;
      type: string;
      popup: string;
    }>;
  } {
    const world = this.amalgamWorlds.get(worldId);
    if (!world) throw new Error(`World ${worldId} not found`);

    const locations = this.getWorldLocations(worldId);
    const points = [];

    for (const location of locations) {
      if (location.realWorldCoordinates) {
        let popup = `<b>${location.fictionalName}</b><br>${location.fictionalDescription}`;

        if (location.realWorldName) {
          popup += `<br><i>Based on: ${location.realWorldName}</i>`;
        }

        if (location.localAdditions.length > 0) {
          popup += `<br><b>Notable:</b> ${location.localAdditions.map(a => a.name).join(', ')}`;
        }

        points.push({
          lat: location.realWorldCoordinates.latitude,
          lon: location.realWorldCoordinates.longitude,
          label: location.fictionalName,
          type: location.bindingType,
          popup
        });
      }
    }

    return {
      layerName: world.name,
      points
    };
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get bridge statistics
   */
  getStats(): {
    totalAnchors: number;
    totalLayers: number;
    totalDivergencePoints: number;
    totalWorlds: number;
    totalBoundLocations: number;
    locationsByBindingType: Record<string, number>;
    worldsByRelationType: Record<string, number>;
  } {
    const locationsByBindingType: Record<string, number> = {};
    for (const loc of this.boundLocations.values()) {
      locationsByBindingType[loc.bindingType] = (locationsByBindingType[loc.bindingType] ?? 0) + 1;
    }

    const worldsByRelationType: Record<string, number> = {};
    for (const world of this.amalgamWorlds.values()) {
      worldsByRelationType[world.relationType] = (worldsByRelationType[world.relationType] ?? 0) + 1;
    }

    return {
      totalAnchors: this.realityAnchors.size,
      totalLayers: this.fictionLayers.size,
      totalDivergencePoints: this.divergencePoints.size,
      totalWorlds: this.amalgamWorlds.size,
      totalBoundLocations: this.boundLocations.size,
      locationsByBindingType,
      worldsByRelationType
    };
  }

  // ==========================================================================
  // SERIALIZATION
  // ==========================================================================

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      realityAnchors: Array.from(this.realityAnchors.values()),
      fictionLayers: Array.from(this.fictionLayers.values()),
      divergencePoints: Array.from(this.divergencePoints.values()),
      amalgamWorlds: Array.from(this.amalgamWorlds.values()),
      boundLocations: Array.from(this.boundLocations.values()),
      config: this.config
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.clear();

    if (data.config) {
      this.config = { ...defaultConfig, ...data.config };
    }

    if (data.realityAnchors) {
      for (const anchor of data.realityAnchors) {
        anchor.createdAt = new Date(anchor.createdAt);
        anchor.updatedAt = new Date(anchor.updatedAt);
        if (anchor.verifiedDate) anchor.verifiedDate = new Date(anchor.verifiedDate);
        this.realityAnchors.set(anchor.id, anchor);

        if (anchor.realWorld.coordinates) {
          const key = `${anchor.realWorld.coordinates.latitude},${anchor.realWorld.coordinates.longitude}`;
          this.anchorsByCoordinates.set(key, anchor.id);
        }
      }
    }

    if (data.fictionLayers) {
      for (const layer of data.fictionLayers) {
        layer.createdAt = new Date(layer.createdAt);
        layer.updatedAt = new Date(layer.updatedAt);
        this.fictionLayers.set(layer.id, layer);

        if (layer.realityAnchorId) {
          if (!this.layersByAnchor.has(layer.realityAnchorId)) {
            this.layersByAnchor.set(layer.realityAnchorId, new Set());
          }
          this.layersByAnchor.get(layer.realityAnchorId)!.add(layer.id);
        }
      }
    }

    if (data.divergencePoints) {
      for (const point of data.divergencePoints) {
        point.createdAt = new Date(point.createdAt);
        this.divergencePoints.set(point.id, point);
      }
    }

    if (data.amalgamWorlds) {
      for (const world of data.amalgamWorlds) {
        world.createdAt = new Date(world.createdAt);
        world.updatedAt = new Date(world.updatedAt);
        this.amalgamWorlds.set(world.id, world);
        this.locationsByWorld.set(world.id, new Set());
      }
    }

    if (data.boundLocations) {
      for (const location of data.boundLocations) {
        location.createdAt = new Date(location.createdAt);
        location.updatedAt = new Date(location.updatedAt);
        this.boundLocations.set(location.id, location);
      }
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.realityAnchors.clear();
    this.fictionLayers.clear();
    this.divergencePoints.clear();
    this.amalgamWorlds.clear();
    this.boundLocations.clear();
    this.anchorsByCoordinates.clear();
    this.layersByAnchor.clear();
    this.locationsByWorld.clear();
  }
}

export default RealityFictionBridge;
