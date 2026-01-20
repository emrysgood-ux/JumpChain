/**
 * Epic Fiction Architect - Relationship Engine
 *
 * Graph-based relationship tracking for epic fiction with 80+ characters:
 * - Temporal relationship evolution (relationships change over time)
 * - Multiple relationship types (family, romantic, rivalry, etc.)
 * - Relationship strength and sentiment tracking
 * - Group/faction affiliations
 * - Cross-universe relationships (for jumpchain narratives)
 * - Network analysis (centrality, clusters, influence)
 * - Relationship events (formation, breakup, betrayal, reconciliation)
 *
 * Designed for narratives spanning 1,000+ years with complex social dynamics.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Primary relationship type categories
 */
export enum RelationshipType {
  // Family
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  SPOUSE = 'spouse',
  EXTENDED_FAMILY = 'extended_family',
  ADOPTIVE = 'adoptive',
  GODPARENT = 'godparent',
  IN_LAW = 'in_law',

  // Romantic
  ROMANTIC_PARTNER = 'romantic_partner',
  EX_PARTNER = 'ex_partner',
  BETROTHED = 'betrothed',
  CRUSH = 'crush',
  AFFAIR = 'affair',

  // Friendship
  BEST_FRIEND = 'best_friend',
  CLOSE_FRIEND = 'close_friend',
  FRIEND = 'friend',
  ACQUAINTANCE = 'acquaintance',
  CHILDHOOD_FRIEND = 'childhood_friend',

  // Professional
  MENTOR = 'mentor',
  STUDENT = 'student',
  COLLEAGUE = 'colleague',
  EMPLOYER = 'employer',
  EMPLOYEE = 'employee',
  BUSINESS_PARTNER = 'business_partner',
  SUBORDINATE = 'subordinate',
  SUPERIOR = 'superior',

  // Adversarial
  RIVAL = 'rival',
  ENEMY = 'enemy',
  NEMESIS = 'nemesis',
  COMPETITOR = 'competitor',
  BULLY = 'bully',
  VICTIM = 'victim',

  // Political/Social
  ALLY = 'ally',
  VASSAL = 'vassal',
  LIEGE = 'liege',
  POLITICAL_RIVAL = 'political_rival',
  FACTION_MEMBER = 'faction_member',

  // Special
  SOULMATE = 'soulmate',
  BOND = 'bond',               // Magical/supernatural bond
  REINCARNATION = 'reincarnation', // Past life connection
  ALTERNATE_SELF = 'alternate_self', // Multiverse
  CREATOR = 'creator',         // Created the other (AI, clone, etc.)
  CREATION = 'creation',

  // Neutral
  STRANGER = 'stranger',
  UNKNOWN = 'unknown'
}

/**
 * Relationship sentiment/emotional quality
 */
export enum RelationshipSentiment {
  LOVING = 'loving',
  AFFECTIONATE = 'affectionate',
  WARM = 'warm',
  FRIENDLY = 'friendly',
  NEUTRAL = 'neutral',
  COOL = 'cool',
  STRAINED = 'strained',
  HOSTILE = 'hostile',
  HATEFUL = 'hateful',
  COMPLICATED = 'complicated',
  AMBIVALENT = 'ambivalent'
}

/**
 * Relationship status
 */
export enum RelationshipStatus {
  ACTIVE = 'active',
  DORMANT = 'dormant',        // Not currently interacting
  ESTRANGED = 'estranged',
  ENDED = 'ended',
  DECEASED = 'deceased',       // One party is dead
  SEVERED = 'severed',         // Permanently broken
  RECONCILED = 'reconciled',   // Reformed after break
  PENDING = 'pending',         // Not yet established
  SECRET = 'secret'            // Hidden from others
}

/**
 * Types of relationship events
 */
export enum RelationshipEventType {
  // Formation
  FIRST_MEETING = 'first_meeting',
  BONDING = 'bonding',
  CONFESSION = 'confession',
  COMMITMENT = 'commitment',
  MARRIAGE = 'marriage',

  // Changes
  DEEPENING = 'deepening',
  COOLING = 'cooling',
  RECONCILIATION = 'reconciliation',
  FORGIVENESS = 'forgiveness',
  REVELATION = 'revelation',

  // Conflict
  ARGUMENT = 'argument',
  BETRAYAL = 'betrayal',
  DECEPTION = 'deception',
  ABANDONMENT = 'abandonment',
  BREAKUP = 'breakup',
  DIVORCE = 'divorce',

  // Special
  SEPARATION = 'separation',
  REUNION = 'reunion',
  DEATH = 'death',
  RESURRECTION = 'resurrection',
  UNIVERSE_SHIFT = 'universe_shift' // Relationship across universes
}

/**
 * Faction types
 */
export enum FactionType {
  FAMILY = 'family',
  ORGANIZATION = 'organization',
  GOVERNMENT = 'government',
  MILITARY = 'military',
  RELIGIOUS = 'religious',
  CRIMINAL = 'criminal',
  ACADEMIC = 'academic',
  CORPORATE = 'corporate',
  SECRET_SOCIETY = 'secret_society',
  ALLIANCE = 'alliance',
  TEAM = 'team',
  INFORMAL_GROUP = 'informal_group'
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * A single relationship between two characters
 */
export interface Relationship {
  id: string;

  // Participants
  characterAId: string;
  characterAName: string;
  characterBId: string;
  characterBName: string;

  // Type and nature
  type: RelationshipType;
  typeFromBPerspective?: RelationshipType; // If asymmetric (parent/child)
  sentiment: RelationshipSentiment;
  sentimentFromB?: RelationshipSentiment; // If feelings differ

  // Metrics
  strength: number;           // 0-100, how strong the bond is
  trust: number;              // 0-100, level of trust
  intimacy: number;           // 0-100, emotional closeness
  conflict: number;           // 0-100, level of tension/conflict
  influence: number;          // -100 to 100, A's influence on B

  // Status
  status: RelationshipStatus;
  isPublic: boolean;          // Known to others
  isReciprocal: boolean;      // Both parties feel similarly

  // Timeline
  startChapter: number;
  endChapter?: number;
  lastInteractionChapter: number;
  significantChapters: number[];

  // Universe tracking (for jumpchain)
  universe?: string;
  crossUniverseOrigin?: boolean; // Relationship spans universes

  // Narrative
  description: string;
  sharedHistory: string[];
  secrets: string[];          // Things they know about each other
  unresolved: string[];       // Unresolved issues

  // Metadata
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A relationship event/change
 */
export interface RelationshipEvent {
  id: string;
  relationshipId: string;
  eventType: RelationshipEventType;
  chapter: number;
  description: string;

  // Changes caused by this event
  sentimentChange?: RelationshipSentiment;
  strengthChange?: number;    // Delta
  trustChange?: number;
  statusChange?: RelationshipStatus;

  // Context
  triggeringEvent?: string;   // What caused this
  witnesses?: string[];       // Character IDs who witnessed
  consequences: string[];

  // Metadata
  isCanon: boolean;
  significance: 'minor' | 'moderate' | 'major' | 'pivotal';
  timestamp: Date;
}

/**
 * Relationship history snapshot at a point in time
 */
export interface RelationshipSnapshot {
  relationshipId: string;
  chapter: number;
  type: RelationshipType;
  sentiment: RelationshipSentiment;
  strength: number;
  trust: number;
  status: RelationshipStatus;
  timestamp: Date;
}

/**
 * A group/faction that characters belong to
 */
export interface Faction {
  id: string;
  name: string;
  type: FactionType;
  description: string;

  // Membership
  members: FactionMember[];
  foundingChapter: number;
  disbandedChapter?: number;

  // Hierarchy
  leaderId?: string;
  leaderName?: string;
  hierarchy: { role: string; characterId: string; characterName: string }[];

  // Relations with other factions
  allies: string[];           // Faction IDs
  enemies: string[];
  neutrals: string[];

  // Universe
  universe?: string;
  activeUniverses: string[];  // For cross-universe factions

  // Metadata
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A character's membership in a faction
 */
export interface FactionMember {
  characterId: string;
  characterName: string;
  role: string;
  rank?: number;
  joinedChapter: number;
  leftChapter?: number;
  status: 'active' | 'inactive' | 'expelled' | 'defected' | 'deceased';
  loyalty: number;            // 0-100
}

/**
 * Network analysis results
 */
export interface NetworkAnalysis {
  // Centrality measures
  degreeCentrality: Map<string, number>;      // Number of connections
  closenessCentrality: Map<string, number>;   // How close to all others
  betweennessCentrality: Map<string, number>; // Bridge between groups

  // Clusters
  clusters: { id: string; members: string[]; label: string }[];

  // Key relationships
  strongestBonds: { relationshipId: string; strength: number }[];
  mostConflicted: { relationshipId: string; conflict: number }[];

  // Isolated characters
  isolatedCharacters: string[];

  // Influence mapping
  mostInfluential: string[];
  mostInfluenced: string[];

  // Computed at
  chapter: number;
  timestamp: Date;
}

/**
 * Configuration for the relationship engine
 */
export interface RelationshipEngineConfig {
  enableSnapshots: boolean;
  snapshotInterval: number;   // Chapters between auto-snapshots
  trackSecrets: boolean;
  enableNetworkAnalysis: boolean;
  maxRelationshipsPerCharacter: number;
  decayRate: number;          // How fast inactive relationships cool
}

// ============================================================================
// RELATIONSHIP ENGINE
// ============================================================================

/**
 * Manages all character relationships in epic fiction
 */
export class RelationshipEngine {
  // Primary storage
  private relationships: Map<string, Relationship> = new Map();
  private factions: Map<string, Faction> = new Map();
  private events: Map<string, RelationshipEvent> = new Map();
  private snapshots: RelationshipSnapshot[] = [];

  // Indexes for fast lookup
  private relationshipsByCharacter: Map<string, Set<string>> = new Map();
  private relationshipsByType: Map<RelationshipType, Set<string>> = new Map();
  private relationshipsByUniverse: Map<string, Set<string>> = new Map();
  private factionsByCharacter: Map<string, Set<string>> = new Map();
  private eventsByRelationship: Map<string, string[]> = new Map();

  // Pair index for quick lookup
  private relationshipPairs: Map<string, string> = new Map(); // "idA:idB" -> relationshipId

  // Configuration
  private config: RelationshipEngineConfig;

  constructor(config: Partial<RelationshipEngineConfig> = {}) {
    this.config = {
      enableSnapshots: true,
      snapshotInterval: 50,
      trackSecrets: true,
      enableNetworkAnalysis: true,
      maxRelationshipsPerCharacter: 200,
      decayRate: 0.01,
      ...config
    };
  }

  // ==========================================================================
  // RELATIONSHIP CRUD
  // ==========================================================================

  /**
   * Create a new relationship between two characters
   */
  createRelationship(params: {
    characterAId: string;
    characterAName: string;
    characterBId: string;
    characterBName: string;
    type: RelationshipType;
    typeFromBPerspective?: RelationshipType;
    sentiment?: RelationshipSentiment;
    strength?: number;
    startChapter: number;
    description?: string;
    universe?: string;
    isPublic?: boolean;
  }): Relationship {
    // Check for existing relationship
    const existingId = this.getRelationshipIdBetween(params.characterAId, params.characterBId);
    if (existingId) {
      throw new Error(`Relationship already exists between ${params.characterAName} and ${params.characterBName}`);
    }

    const relationship: Relationship = {
      id: uuidv4(),
      characterAId: params.characterAId,
      characterAName: params.characterAName,
      characterBId: params.characterBId,
      characterBName: params.characterBName,
      type: params.type,
      typeFromBPerspective: params.typeFromBPerspective || this.getReciprocalType(params.type),
      sentiment: params.sentiment || RelationshipSentiment.NEUTRAL,
      strength: params.strength ?? 50,
      trust: 50,
      intimacy: 30,
      conflict: 0,
      influence: 0,
      status: RelationshipStatus.ACTIVE,
      isPublic: params.isPublic ?? true,
      isReciprocal: true,
      startChapter: params.startChapter,
      lastInteractionChapter: params.startChapter,
      significantChapters: [params.startChapter],
      universe: params.universe,
      description: params.description || '',
      sharedHistory: [],
      secrets: [],
      unresolved: [],
      tags: [],
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store
    this.relationships.set(relationship.id, relationship);

    // Index
    this.indexRelationship(relationship);

    // Create first meeting event
    this.recordEvent({
      relationshipId: relationship.id,
      eventType: RelationshipEventType.FIRST_MEETING,
      chapter: params.startChapter,
      description: `${params.characterAName} and ${params.characterBName} first meet`,
      significance: 'moderate'
    });

    return relationship;
  }

  /**
   * Get a relationship by ID
   */
  getRelationship(id: string): Relationship | undefined {
    return this.relationships.get(id);
  }

  /**
   * Get relationship between two characters
   */
  getRelationshipBetween(characterAId: string, characterBId: string): Relationship | undefined {
    const id = this.getRelationshipIdBetween(characterAId, characterBId);
    return id ? this.relationships.get(id) : undefined;
  }

  /**
   * Get all relationships for a character
   */
  getRelationshipsForCharacter(characterId: string): Relationship[] {
    const relationshipIds = this.relationshipsByCharacter.get(characterId);
    if (!relationshipIds) return [];

    return Array.from(relationshipIds)
      .map(id => this.relationships.get(id))
      .filter((r): r is Relationship => r !== undefined);
  }

  /**
   * Get relationships by type
   */
  getRelationshipsByType(type: RelationshipType): Relationship[] {
    const ids = this.relationshipsByType.get(type);
    if (!ids) return [];

    return Array.from(ids)
      .map(id => this.relationships.get(id))
      .filter((r): r is Relationship => r !== undefined);
  }

  /**
   * Update a relationship
   */
  updateRelationship(id: string, updates: Partial<Omit<Relationship, 'id' | 'characterAId' | 'characterBId' | 'createdAt'>>): Relationship {
    const relationship = this.relationships.get(id);
    if (!relationship) {
      throw new Error(`Relationship not found: ${id}`);
    }

    // Track if type changed for re-indexing
    const oldType = relationship.type;

    // Apply updates
    Object.assign(relationship, updates, { updatedAt: new Date() });

    // Re-index if type changed
    if (updates.type && updates.type !== oldType) {
      this.relationshipsByType.get(oldType)?.delete(id);
      if (!this.relationshipsByType.has(updates.type)) {
        this.relationshipsByType.set(updates.type, new Set());
      }
      this.relationshipsByType.get(updates.type)!.add(id);
    }

    return relationship;
  }

  /**
   * End a relationship
   */
  endRelationship(id: string, chapter: number, reason: string): Relationship {
    const relationship = this.relationships.get(id);
    if (!relationship) {
      throw new Error(`Relationship not found: ${id}`);
    }

    relationship.status = RelationshipStatus.ENDED;
    relationship.endChapter = chapter;
    relationship.updatedAt = new Date();

    // Record event
    this.recordEvent({
      relationshipId: id,
      eventType: RelationshipEventType.BREAKUP,
      chapter,
      description: reason,
      statusChange: RelationshipStatus.ENDED,
      significance: 'major'
    });

    return relationship;
  }

  // ==========================================================================
  // RELATIONSHIP DYNAMICS
  // ==========================================================================

  /**
   * Record an interaction that affects the relationship
   */
  recordInteraction(params: {
    relationshipId: string;
    chapter: number;
    description: string;
    strengthChange?: number;
    trustChange?: number;
    intimacyChange?: number;
    conflictChange?: number;
    sentimentChange?: RelationshipSentiment;
  }): void {
    const relationship = this.relationships.get(params.relationshipId);
    if (!relationship) {
      throw new Error(`Relationship not found: ${params.relationshipId}`);
    }

    // Apply changes with bounds
    if (params.strengthChange) {
      relationship.strength = Math.max(0, Math.min(100, relationship.strength + params.strengthChange));
    }
    if (params.trustChange) {
      relationship.trust = Math.max(0, Math.min(100, relationship.trust + params.trustChange));
    }
    if (params.intimacyChange) {
      relationship.intimacy = Math.max(0, Math.min(100, relationship.intimacy + params.intimacyChange));
    }
    if (params.conflictChange) {
      relationship.conflict = Math.max(0, Math.min(100, relationship.conflict + params.conflictChange));
    }
    if (params.sentimentChange) {
      relationship.sentiment = params.sentimentChange;
    }

    relationship.lastInteractionChapter = params.chapter;
    relationship.updatedAt = new Date();
  }

  /**
   * Record a betrayal
   */
  recordBetrayal(params: {
    relationshipId: string;
    betrayerId: string;
    chapter: number;
    description: string;
    severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
  }): void {
    const trustDamage: Record<string, number> = {
      minor: -10,
      moderate: -25,
      major: -50,
      catastrophic: -80
    };

    this.recordInteraction({
      relationshipId: params.relationshipId,
      chapter: params.chapter,
      description: params.description,
      trustChange: trustDamage[params.severity],
      conflictChange: Math.abs(trustDamage[params.severity]) / 2,
      sentimentChange: params.severity === 'catastrophic'
        ? RelationshipSentiment.HATEFUL
        : RelationshipSentiment.HOSTILE
    });

    this.recordEvent({
      relationshipId: params.relationshipId,
      eventType: RelationshipEventType.BETRAYAL,
      chapter: params.chapter,
      description: params.description,
      trustChange: trustDamage[params.severity],
      significance: params.severity === 'minor' ? 'moderate' :
                    params.severity === 'moderate' ? 'major' : 'pivotal'
    });
  }

  /**
   * Record reconciliation
   */
  recordReconciliation(params: {
    relationshipId: string;
    chapter: number;
    description: string;
  }): void {
    const relationship = this.relationships.get(params.relationshipId);
    if (!relationship) {
      throw new Error(`Relationship not found: ${params.relationshipId}`);
    }

    this.recordInteraction({
      relationshipId: params.relationshipId,
      chapter: params.chapter,
      description: params.description,
      strengthChange: 15,
      trustChange: 10,
      conflictChange: -20,
      sentimentChange: RelationshipSentiment.WARM
    });

    relationship.status = RelationshipStatus.RECONCILED;

    this.recordEvent({
      relationshipId: params.relationshipId,
      eventType: RelationshipEventType.RECONCILIATION,
      chapter: params.chapter,
      description: params.description,
      statusChange: RelationshipStatus.RECONCILED,
      significance: 'major'
    });
  }

  /**
   * Transform relationship type (e.g., friends to lovers)
   */
  transformRelationship(params: {
    relationshipId: string;
    newType: RelationshipType;
    chapter: number;
    description: string;
  }): Relationship {
    const relationship = this.relationships.get(params.relationshipId);
    if (!relationship) {
      throw new Error(`Relationship not found: ${params.relationshipId}`);
    }

    const oldType = relationship.type;

    this.updateRelationship(params.relationshipId, {
      type: params.newType,
      typeFromBPerspective: this.getReciprocalType(params.newType)
    });

    relationship.significantChapters.push(params.chapter);

    this.recordEvent({
      relationshipId: params.relationshipId,
      eventType: RelationshipEventType.DEEPENING,
      chapter: params.chapter,
      description: `Relationship transformed from ${oldType} to ${params.newType}: ${params.description}`,
      significance: 'pivotal'
    });

    return relationship;
  }

  // ==========================================================================
  // EVENTS
  // ==========================================================================

  /**
   * Record a relationship event
   */
  recordEvent(params: {
    relationshipId: string;
    eventType: RelationshipEventType;
    chapter: number;
    description: string;
    sentimentChange?: RelationshipSentiment;
    strengthChange?: number;
    trustChange?: number;
    statusChange?: RelationshipStatus;
    triggeringEvent?: string;
    witnesses?: string[];
    significance?: 'minor' | 'moderate' | 'major' | 'pivotal';
  }): RelationshipEvent {
    const event: RelationshipEvent = {
      id: uuidv4(),
      relationshipId: params.relationshipId,
      eventType: params.eventType,
      chapter: params.chapter,
      description: params.description,
      sentimentChange: params.sentimentChange,
      strengthChange: params.strengthChange,
      trustChange: params.trustChange,
      statusChange: params.statusChange,
      triggeringEvent: params.triggeringEvent,
      witnesses: params.witnesses,
      consequences: [],
      isCanon: true,
      significance: params.significance || 'moderate',
      timestamp: new Date()
    };

    this.events.set(event.id, event);

    // Index by relationship
    if (!this.eventsByRelationship.has(params.relationshipId)) {
      this.eventsByRelationship.set(params.relationshipId, []);
    }
    this.eventsByRelationship.get(params.relationshipId)!.push(event.id);

    return event;
  }

  /**
   * Get events for a relationship
   */
  getEventsForRelationship(relationshipId: string): RelationshipEvent[] {
    const eventIds = this.eventsByRelationship.get(relationshipId) || [];
    return eventIds
      .map(id => this.events.get(id))
      .filter((e): e is RelationshipEvent => e !== undefined)
      .sort((a, b) => a.chapter - b.chapter);
  }

  // ==========================================================================
  // FACTIONS
  // ==========================================================================

  /**
   * Create a faction/group
   */
  createFaction(params: {
    name: string;
    type: FactionType;
    description: string;
    foundingChapter: number;
    founderId?: string;
    founderName?: string;
    universe?: string;
  }): Faction {
    const faction: Faction = {
      id: uuidv4(),
      name: params.name,
      type: params.type,
      description: params.description,
      members: [],
      foundingChapter: params.foundingChapter,
      hierarchy: [],
      allies: [],
      enemies: [],
      neutrals: [],
      universe: params.universe,
      activeUniverses: params.universe ? [params.universe] : [],
      tags: [],
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add founder as first member and leader
    if (params.founderId && params.founderName) {
      faction.leaderId = params.founderId;
      faction.leaderName = params.founderName;
      faction.members.push({
        characterId: params.founderId,
        characterName: params.founderName,
        role: 'Founder',
        rank: 1,
        joinedChapter: params.foundingChapter,
        status: 'active',
        loyalty: 100
      });
      faction.hierarchy.push({
        role: 'Leader',
        characterId: params.founderId,
        characterName: params.founderName
      });

      // Index
      if (!this.factionsByCharacter.has(params.founderId)) {
        this.factionsByCharacter.set(params.founderId, new Set());
      }
      this.factionsByCharacter.get(params.founderId)!.add(faction.id);
    }

    this.factions.set(faction.id, faction);
    return faction;
  }

  /**
   * Get a faction by ID
   */
  getFaction(id: string): Faction | undefined {
    return this.factions.get(id);
  }

  /**
   * Get faction by name
   */
  getFactionByName(name: string): Faction | undefined {
    for (const faction of this.factions.values()) {
      if (faction.name.toLowerCase() === name.toLowerCase()) {
        return faction;
      }
    }
    return undefined;
  }

  /**
   * Add a member to a faction
   */
  addFactionMember(params: {
    factionId: string;
    characterId: string;
    characterName: string;
    role: string;
    rank?: number;
    chapter: number;
  }): void {
    const faction = this.factions.get(params.factionId);
    if (!faction) {
      throw new Error(`Faction not found: ${params.factionId}`);
    }

    // Check if already a member
    const existing = faction.members.find(m => m.characterId === params.characterId);
    if (existing && existing.status === 'active') {
      throw new Error(`Character ${params.characterName} is already an active member of ${faction.name}`);
    }

    // Add or reactivate
    if (existing) {
      existing.status = 'active';
      existing.role = params.role;
      existing.rank = params.rank;
    } else {
      faction.members.push({
        characterId: params.characterId,
        characterName: params.characterName,
        role: params.role,
        rank: params.rank,
        joinedChapter: params.chapter,
        status: 'active',
        loyalty: 70
      });
    }

    faction.updatedAt = new Date();

    // Index
    if (!this.factionsByCharacter.has(params.characterId)) {
      this.factionsByCharacter.set(params.characterId, new Set());
    }
    this.factionsByCharacter.get(params.characterId)!.add(params.factionId);
  }

  /**
   * Remove a member from a faction
   */
  removeFactionMember(factionId: string, characterId: string, chapter: number, reason: 'left' | 'expelled' | 'defected' | 'deceased'): void {
    const faction = this.factions.get(factionId);
    if (!faction) {
      throw new Error(`Faction not found: ${factionId}`);
    }

    const member = faction.members.find(m => m.characterId === characterId);
    if (!member) {
      throw new Error(`Character not found in faction`);
    }

    member.status = reason === 'left' ? 'inactive' : reason;
    member.leftChapter = chapter;
    faction.updatedAt = new Date();

    // Update leader if needed
    if (faction.leaderId === characterId) {
      faction.leaderId = undefined;
      faction.leaderName = undefined;
    }
  }

  /**
   * Get factions for a character
   */
  getFactionsForCharacter(characterId: string): Faction[] {
    const factionIds = this.factionsByCharacter.get(characterId);
    if (!factionIds) return [];

    return Array.from(factionIds)
      .map(id => this.factions.get(id))
      .filter((f): f is Faction => f !== undefined);
  }

  /**
   * Set faction relations
   */
  setFactionRelation(factionAId: string, factionBId: string, relation: 'ally' | 'enemy' | 'neutral'): void {
    const factionA = this.factions.get(factionAId);
    const factionB = this.factions.get(factionBId);

    if (!factionA || !factionB) {
      throw new Error('One or both factions not found');
    }

    // Remove from all lists first
    const lists = ['allies', 'enemies', 'neutrals'] as const;
    for (const list of lists) {
      factionA[list] = factionA[list].filter(id => id !== factionBId);
      factionB[list] = factionB[list].filter(id => id !== factionAId);
    }

    // Add to appropriate list
    const listName = relation === 'ally' ? 'allies' : relation === 'enemy' ? 'enemies' : 'neutrals';
    factionA[listName].push(factionBId);
    factionB[listName].push(factionAId);

    factionA.updatedAt = new Date();
    factionB.updatedAt = new Date();
  }

  // ==========================================================================
  // NETWORK ANALYSIS
  // ==========================================================================

  /**
   * Perform network analysis on relationships
   */
  analyzeNetwork(chapter?: number): NetworkAnalysis {
    const activeRelationships = Array.from(this.relationships.values())
      .filter(r => r.status === RelationshipStatus.ACTIVE)
      .filter(r => !chapter || r.startChapter <= chapter);

    // Build adjacency map
    const adjacency = new Map<string, Set<string>>();
    const characterIds = new Set<string>();

    for (const rel of activeRelationships) {
      characterIds.add(rel.characterAId);
      characterIds.add(rel.characterBId);

      if (!adjacency.has(rel.characterAId)) {
        adjacency.set(rel.characterAId, new Set());
      }
      if (!adjacency.has(rel.characterBId)) {
        adjacency.set(rel.characterBId, new Set());
      }

      adjacency.get(rel.characterAId)!.add(rel.characterBId);
      adjacency.get(rel.characterBId)!.add(rel.characterAId);
    }

    // Calculate degree centrality
    const degreeCentrality = new Map<string, number>();
    for (const [charId, connections] of adjacency) {
      degreeCentrality.set(charId, connections.size);
    }

    // Calculate closeness centrality (simplified BFS-based)
    const closenessCentrality = new Map<string, number>();
    for (const charId of characterIds) {
      const distances = this.bfsDistances(charId, adjacency);
      const totalDistance = Array.from(distances.values()).reduce((a, b) => a + b, 0);
      const reachable = distances.size - 1; // Exclude self
      if (reachable > 0 && totalDistance > 0) {
        closenessCentrality.set(charId, reachable / totalDistance);
      } else {
        closenessCentrality.set(charId, 0);
      }
    }

    // Calculate betweenness centrality (simplified)
    const betweennessCentrality = new Map<string, number>();
    for (const charId of characterIds) {
      betweennessCentrality.set(charId, 0);
    }

    // Find isolated characters
    const isolatedCharacters = Array.from(characterIds)
      .filter(id => (adjacency.get(id)?.size || 0) === 0);

    // Find strongest bonds
    const strongestBonds = activeRelationships
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 10)
      .map(r => ({ relationshipId: r.id, strength: r.strength }));

    // Find most conflicted
    const mostConflicted = activeRelationships
      .filter(r => r.conflict > 30)
      .sort((a, b) => b.conflict - a.conflict)
      .slice(0, 10)
      .map(r => ({ relationshipId: r.id, conflict: r.conflict }));

    // Find most influential (based on influence scores)
    const influenceScores = new Map<string, number>();
    for (const rel of activeRelationships) {
      influenceScores.set(rel.characterAId,
        (influenceScores.get(rel.characterAId) || 0) + Math.max(0, rel.influence));
      influenceScores.set(rel.characterBId,
        (influenceScores.get(rel.characterBId) || 0) + Math.max(0, -rel.influence));
    }

    const sortedByInfluence = Array.from(influenceScores.entries())
      .sort((a, b) => b[1] - a[1]);

    const mostInfluential = sortedByInfluence.slice(0, 5).map(([id]) => id);
    const mostInfluenced = sortedByInfluence.slice(-5).map(([id]) => id);

    // Simple cluster detection (connected components)
    const clusters = this.findClusters(adjacency);

    return {
      degreeCentrality,
      closenessCentrality,
      betweennessCentrality,
      clusters: clusters.map((members, i) => ({
        id: `cluster_${i}`,
        members: Array.from(members),
        label: `Cluster ${i + 1}`
      })),
      strongestBonds,
      mostConflicted,
      isolatedCharacters,
      mostInfluential,
      mostInfluenced,
      chapter: chapter || 0,
      timestamp: new Date()
    };
  }

  /**
   * Get relationship summary for a character
   */
  getCharacterRelationshipSummary(characterId: string): {
    totalRelationships: number;
    byType: Record<string, number>;
    bySentiment: Record<string, number>;
    averageStrength: number;
    averageTrust: number;
    factions: string[];
    allies: string[];
    enemies: string[];
  } {
    const relationships = this.getRelationshipsForCharacter(characterId);
    const factions = this.getFactionsForCharacter(characterId);

    const byType: Record<string, number> = {};
    const bySentiment: Record<string, number> = {};
    let totalStrength = 0;
    let totalTrust = 0;
    const allies: string[] = [];
    const enemies: string[] = [];

    for (const rel of relationships) {
      const type = rel.type;
      byType[type] = (byType[type] || 0) + 1;

      const sentiment = rel.sentiment;
      bySentiment[sentiment] = (bySentiment[sentiment] || 0) + 1;

      totalStrength += rel.strength;
      totalTrust += rel.trust;

      // Determine if ally or enemy
      const otherName = rel.characterAId === characterId ? rel.characterBName : rel.characterAName;
      if (rel.sentiment === RelationshipSentiment.HOSTILE ||
          rel.sentiment === RelationshipSentiment.HATEFUL ||
          rel.type === RelationshipType.ENEMY ||
          rel.type === RelationshipType.NEMESIS) {
        enemies.push(otherName);
      } else if (rel.strength >= 60 && rel.trust >= 50) {
        allies.push(otherName);
      }
    }

    return {
      totalRelationships: relationships.length,
      byType,
      bySentiment,
      averageStrength: relationships.length > 0 ? totalStrength / relationships.length : 0,
      averageTrust: relationships.length > 0 ? totalTrust / relationships.length : 0,
      factions: factions.map(f => f.name),
      allies,
      enemies
    };
  }

  // ==========================================================================
  // SNAPSHOTS & HISTORY
  // ==========================================================================

  /**
   * Take a snapshot of all relationships at a chapter
   */
  takeSnapshot(chapter: number): void {
    for (const rel of this.relationships.values()) {
      if (rel.status === RelationshipStatus.ACTIVE || rel.status === RelationshipStatus.DORMANT) {
        this.snapshots.push({
          relationshipId: rel.id,
          chapter,
          type: rel.type,
          sentiment: rel.sentiment,
          strength: rel.strength,
          trust: rel.trust,
          status: rel.status,
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Get relationship history from snapshots
   */
  getRelationshipHistory(relationshipId: string): RelationshipSnapshot[] {
    return this.snapshots
      .filter(s => s.relationshipId === relationshipId)
      .sort((a, b) => a.chapter - b.chapter);
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Get reciprocal relationship type
   */
  private getReciprocalType(type: RelationshipType): RelationshipType {
    const reciprocals: Partial<Record<RelationshipType, RelationshipType>> = {
      [RelationshipType.PARENT]: RelationshipType.CHILD,
      [RelationshipType.CHILD]: RelationshipType.PARENT,
      [RelationshipType.MENTOR]: RelationshipType.STUDENT,
      [RelationshipType.STUDENT]: RelationshipType.MENTOR,
      [RelationshipType.EMPLOYER]: RelationshipType.EMPLOYEE,
      [RelationshipType.EMPLOYEE]: RelationshipType.EMPLOYER,
      [RelationshipType.SUPERIOR]: RelationshipType.SUBORDINATE,
      [RelationshipType.SUBORDINATE]: RelationshipType.SUPERIOR,
      [RelationshipType.VASSAL]: RelationshipType.LIEGE,
      [RelationshipType.LIEGE]: RelationshipType.VASSAL,
      [RelationshipType.BULLY]: RelationshipType.VICTIM,
      [RelationshipType.VICTIM]: RelationshipType.BULLY,
      [RelationshipType.CREATOR]: RelationshipType.CREATION,
      [RelationshipType.CREATION]: RelationshipType.CREATOR
    };

    return reciprocals[type] || type;
  }

  /**
   * Get relationship ID between two characters
   */
  private getRelationshipIdBetween(charAId: string, charBId: string): string | undefined {
    const key1 = `${charAId}:${charBId}`;
    const key2 = `${charBId}:${charAId}`;
    return this.relationshipPairs.get(key1) || this.relationshipPairs.get(key2);
  }

  /**
   * Index a relationship for fast lookups
   */
  private indexRelationship(rel: Relationship): void {
    // By character
    for (const charId of [rel.characterAId, rel.characterBId]) {
      if (!this.relationshipsByCharacter.has(charId)) {
        this.relationshipsByCharacter.set(charId, new Set());
      }
      this.relationshipsByCharacter.get(charId)!.add(rel.id);
    }

    // By type
    if (!this.relationshipsByType.has(rel.type)) {
      this.relationshipsByType.set(rel.type, new Set());
    }
    this.relationshipsByType.get(rel.type)!.add(rel.id);

    // By universe
    if (rel.universe) {
      if (!this.relationshipsByUniverse.has(rel.universe)) {
        this.relationshipsByUniverse.set(rel.universe, new Set());
      }
      this.relationshipsByUniverse.get(rel.universe)!.add(rel.id);
    }

    // Pair index
    this.relationshipPairs.set(`${rel.characterAId}:${rel.characterBId}`, rel.id);
  }

  /**
   * BFS distances from a source node
   */
  private bfsDistances(source: string, adjacency: Map<string, Set<string>>): Map<string, number> {
    const distances = new Map<string, number>();
    const queue: string[] = [source];
    distances.set(source, 0);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDist = distances.get(current)!;
      const neighbors = adjacency.get(current) || new Set();

      for (const neighbor of neighbors) {
        if (!distances.has(neighbor)) {
          distances.set(neighbor, currentDist + 1);
          queue.push(neighbor);
        }
      }
    }

    return distances;
  }

  /**
   * Find connected components (clusters)
   */
  private findClusters(adjacency: Map<string, Set<string>>): Set<string>[] {
    const visited = new Set<string>();
    const clusters: Set<string>[] = [];

    for (const charId of adjacency.keys()) {
      if (!visited.has(charId)) {
        const cluster = new Set<string>();
        const queue = [charId];

        while (queue.length > 0) {
          const current = queue.shift()!;
          if (visited.has(current)) continue;

          visited.add(current);
          cluster.add(current);

          const neighbors = adjacency.get(current) || new Set();
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              queue.push(neighbor);
            }
          }
        }

        if (cluster.size > 0) {
          clusters.push(cluster);
        }
      }
    }

    return clusters;
  }

  // ==========================================================================
  // STANDARD API METHODS
  // ==========================================================================

  /**
   * Get engine statistics
   */
  getStats(): {
    totalRelationships: number;
    activeRelationships: number;
    endedRelationships: number;
    totalFactions: number;
    totalEvents: number;
    totalSnapshots: number;
    relationshipsByType: Record<string, number>;
    relationshipsBySentiment: Record<string, number>;
    averageRelationshipsPerCharacter: number;
    strongestRelationship: { id: string; names: string; strength: number } | null;
    mostConflicted: { id: string; names: string; conflict: number } | null;
  } {
    const relationships = Array.from(this.relationships.values());
    const active = relationships.filter(r => r.status === RelationshipStatus.ACTIVE);

    const byType: Record<string, number> = {};
    const bySentiment: Record<string, number> = {};

    for (const rel of relationships) {
      byType[rel.type] = (byType[rel.type] || 0) + 1;
      bySentiment[rel.sentiment] = (bySentiment[rel.sentiment] || 0) + 1;
    }

    // Find unique characters
    const characters = new Set<string>();
    for (const rel of relationships) {
      characters.add(rel.characterAId);
      characters.add(rel.characterBId);
    }

    // Find strongest and most conflicted
    let strongest: Relationship | null = null;
    let mostConflicted: Relationship | null = null;

    for (const rel of active) {
      if (!strongest || rel.strength > strongest.strength) {
        strongest = rel;
      }
      if (!mostConflicted || rel.conflict > mostConflicted.conflict) {
        mostConflicted = rel;
      }
    }

    return {
      totalRelationships: relationships.length,
      activeRelationships: active.length,
      endedRelationships: relationships.filter(r => r.status === RelationshipStatus.ENDED).length,
      totalFactions: this.factions.size,
      totalEvents: this.events.size,
      totalSnapshots: this.snapshots.length,
      relationshipsByType: byType,
      relationshipsBySentiment: bySentiment,
      averageRelationshipsPerCharacter: characters.size > 0
        ? (relationships.length * 2) / characters.size
        : 0,
      strongestRelationship: strongest ? {
        id: strongest.id,
        names: `${strongest.characterAName} & ${strongest.characterBName}`,
        strength: strongest.strength
      } : null,
      mostConflicted: mostConflicted && mostConflicted.conflict > 0 ? {
        id: mostConflicted.id,
        names: `${mostConflicted.characterAName} & ${mostConflicted.characterBName}`,
        conflict: mostConflicted.conflict
      } : null
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.relationships.clear();
    this.factions.clear();
    this.events.clear();
    this.snapshots = [];
    this.relationshipsByCharacter.clear();
    this.relationshipsByType.clear();
    this.relationshipsByUniverse.clear();
    this.factionsByCharacter.clear();
    this.eventsByRelationship.clear();
    this.relationshipPairs.clear();
  }

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      relationships: Array.from(this.relationships.values()),
      factions: Array.from(this.factions.values()),
      events: Array.from(this.events.values()),
      snapshots: this.snapshots,
      config: this.config,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.clear();

    // Import relationships
    for (const rel of data.relationships || []) {
      rel.createdAt = new Date(rel.createdAt);
      rel.updatedAt = new Date(rel.updatedAt);
      this.relationships.set(rel.id, rel);
      this.indexRelationship(rel);
    }

    // Import factions
    for (const faction of data.factions || []) {
      faction.createdAt = new Date(faction.createdAt);
      faction.updatedAt = new Date(faction.updatedAt);
      this.factions.set(faction.id, faction);

      // Index faction members
      for (const member of faction.members) {
        if (!this.factionsByCharacter.has(member.characterId)) {
          this.factionsByCharacter.set(member.characterId, new Set());
        }
        this.factionsByCharacter.get(member.characterId)!.add(faction.id);
      }
    }

    // Import events
    for (const event of data.events || []) {
      event.timestamp = new Date(event.timestamp);
      this.events.set(event.id, event);

      if (!this.eventsByRelationship.has(event.relationshipId)) {
        this.eventsByRelationship.set(event.relationshipId, []);
      }
      this.eventsByRelationship.get(event.relationshipId)!.push(event.id);
    }

    // Import snapshots
    for (const snapshot of data.snapshots || []) {
      snapshot.timestamp = new Date(snapshot.timestamp);
      this.snapshots.push(snapshot);
    }

    // Import config
    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
  }
}

// Export default instance
export default RelationshipEngine;
