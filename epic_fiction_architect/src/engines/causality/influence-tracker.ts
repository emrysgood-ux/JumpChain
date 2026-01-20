/**
 * Epic Fiction Architect - Influence Tracker
 *
 * Tracks ongoing influence relationships between entities that persist
 * across chapters and decay or grow over time. Unlike ripples (one-time
 * cause-effect), influences represent continuous effects like:
 * - A mentor's lasting impact on a student
 * - A ruler's control over subjects
 * - A reputation's effect on how others treat someone
 * - A traumatic event's ongoing psychological impact
 *
 * Designed for narratives where past events continue to shape present behavior.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Types of influence relationships
 */
export enum InfluenceType {
  // Personal influence
  MENTORSHIP = 'mentorship',           // Teaching, guidance
  INSPIRATION = 'inspiration',         // Role model effect
  INTIMIDATION = 'intimidation',       // Fear-based influence
  MANIPULATION = 'manipulation',       // Covert control
  LOVE = 'love',                       // Romantic/familial bonds
  HATRED = 'hatred',                   // Antagonism
  RESPECT = 'respect',                 // Earned regard
  DEBT = 'debt',                       // Obligation owed
  TRAUMA = 'trauma',                   // Lasting psychological impact

  // Social influence
  REPUTATION = 'reputation',           // What others believe
  FAME = 'fame',                       // Wide recognition
  INFAMY = 'infamy',                   // Negative recognition
  AUTHORITY = 'authority',             // Legitimate power
  CHARISMA = 'charisma',               // Personal magnetism

  // Political influence
  ALLEGIANCE = 'allegiance',           // Loyalty to cause/person
  LOYALTY = 'loyalty',                 // Personal loyalty/devotion
  BETRAYAL = 'betrayal',               // Lasting betrayal impact
  PATRONAGE = 'patronage',             // Support/sponsorship
  VASSALAGE = 'vassalage',             // Feudal-style loyalty
  DEPENDENCY = 'dependency',           // Economic/resource need
  BLACKMAIL = 'blackmail',             // Coerced compliance

  // Magical/Power influence
  BOND = 'bond',                       // Magical connection
  CORRUPTION = 'corruption',           // Dark influence
  BLESSING = 'blessing',               // Divine favor
  CURSE = 'curse',                     // Magical affliction
  RESONANCE = 'resonance',             // Power synchronization

  // Knowledge influence
  TEACHING = 'teaching',               // Knowledge transfer
  PROPHECY = 'prophecy',               // Destined connection
  LEGACY = 'legacy',                   // Inherited influence
  MEMORY = 'memory',                   // Remembered impact

  // Custom
  CUSTOM = 'custom'
}

/**
 * Direction of influence flow
 */
export enum InfluenceDirection {
  UNIDIRECTIONAL = 'unidirectional',   // One way (mentor -> student)
  BIDIRECTIONAL = 'bidirectional',     // Both ways (friends)
  ASYMMETRIC = 'asymmetric'            // Both ways but unequal
}

/**
 * Current state of influence
 */
export enum InfluenceStatus {
  ACTIVE = 'active',                   // Currently in effect
  DORMANT = 'dormant',                 // Temporarily inactive
  GROWING = 'growing',                 // Increasing over time
  DECAYING = 'decaying',               // Decreasing over time
  CONTESTED = 'contested',             // Being challenged
  BROKEN = 'broken',                   // Severed (but remembered)
  TRANSFORMED = 'transformed'          // Changed into different type
}

/**
 * Visibility of influence
 */
export enum InfluenceVisibility {
  PUBLIC = 'public',                   // Everyone knows
  KNOWN = 'known',                     // Some people know
  PRIVATE = 'private',                 // Only involved parties know
  SECRET = 'secret',                   // Hidden from all
  SUBCONSCIOUS = 'subconscious'        // Even subjects unaware
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * An influence relationship between entities
 */
export interface Influence {
  id: string;

  // Participants
  sourceId: string;                    // Who/what exerts influence
  sourceType: string;
  sourceName: string;
  targetId: string;                    // Who is influenced
  targetType: string;
  targetName: string;

  // Influence details
  type: InfluenceType;
  direction: InfluenceDirection;
  status: InfluenceStatus;
  visibility: InfluenceVisibility;

  // Magnitude (0-100)
  strength: number;                    // Current influence strength
  maxStrength: number;                 // Peak strength reached
  minThreshold: number;                // Below this, influence breaks

  // Dynamics
  growthRate: number;                  // % change per chapter (can be negative)
  volatility: number;                  // How much strength fluctuates
  resistance: number;                  // Target's resistance to this influence

  // Temporal
  establishedChapter: number;          // When influence began
  lastActiveChapter: number;           // Last chapter it was relevant
  expiresChapter?: number;             // When influence ends (if set)

  // Effects
  effects: InfluenceEffect[];          // What this influence causes
  modifiers: InfluenceModifier[];      // Things affecting this influence

  // Context
  origin?: string;                     // How influence was established
  description: string;
  tags: string[];

  // Reciprocal
  reciprocalInfluenceId?: string;      // For bidirectional influences

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * An effect caused by an influence
 */
export interface InfluenceEffect {
  id: string;
  description: string;
  category: string;                    // emotional, behavioral, social, etc.
  magnitude: number;                   // 0-100 effect strength
  conditions?: string[];               // When effect applies
  expression: string;                  // How it manifests in narrative
}

/**
 * Something that modifies an influence
 */
export interface InfluenceModifier {
  id: string;
  source: string;                      // What causes modification
  type: 'amplify' | 'dampen' | 'block' | 'transform';
  value: number;                       // Modifier amount
  duration?: number;                   // Chapters modifier lasts
  appliedChapter: number;
  expiresChapter?: number;
  description: string;
}

/**
 * A network of influences around an entity
 */
export interface InfluenceNetwork {
  centerId: string;
  centerName: string;
  inbound: Influence[];                // Influences ON this entity
  outbound: Influence[];               // Influences FROM this entity
  totalInboundStrength: number;
  totalOutboundStrength: number;
  dominantInbound?: Influence;
  dominantOutbound?: Influence;
}

/**
 * Historical record of influence changes
 */
export interface InfluenceHistory {
  influenceId: string;
  chapter: number;
  previousStrength: number;
  newStrength: number;
  previousStatus: InfluenceStatus;
  newStatus: InfluenceStatus;
  cause: string;
  timestamp: Date;
}

/**
 * Conflict between influences
 */
export interface InfluenceConflict {
  id: string;
  targetId: string;                    // Entity being pulled
  influences: string[];                // Competing influence IDs
  dominantId?: string;                 // Currently winning
  tensionLevel: number;                // 0-100 internal conflict
  resolutionRequired: boolean;         // Needs narrative resolution
  potentialOutcomes: string[];
  createdChapter: number;
}

/**
 * Configuration for influence tracking
 */
export interface InfluenceTrackerConfig {
  defaultGrowthRate: number;
  defaultDecayRate: number;
  defaultMinThreshold: number;
  enableAutoDecay: boolean;
  conflictThreshold: number;           // When to flag conflicts
  maxInfluencesPerEntity: number;
  historyRetention: number;            // Chapters to keep history
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: InfluenceTrackerConfig = {
  defaultGrowthRate: 0,
  defaultDecayRate: -1,                // Lose 1% per chapter by default
  defaultMinThreshold: 5,              // Break below 5%
  enableAutoDecay: true,
  conflictThreshold: 30,               // Flag when competing > 30%
  maxInfluencesPerEntity: 50,
  historyRetention: 1000
};

// ============================================================================
// INFLUENCE TRACKER
// ============================================================================

/**
 * Influence Tracker
 *
 * Manages ongoing influence relationships between entities,
 * tracking how they grow, decay, conflict, and shape behavior over time.
 */
export class InfluenceTracker {
  private config: InfluenceTrackerConfig;
  private influences: Map<string, Influence> = new Map();
  private history: InfluenceHistory[] = [];
  private conflicts: Map<string, InfluenceConflict> = new Map();

  // Indices
  private influencesBySource: Map<string, Set<string>> = new Map();
  private influencesByTarget: Map<string, Set<string>> = new Map();
  private influencesByType: Map<InfluenceType, Set<string>> = new Map();

  constructor(config?: Partial<InfluenceTrackerConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  setConfig(config: Partial<InfluenceTrackerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ==========================================================================
  // INFLUENCE CREATION
  // ==========================================================================

  /**
   * Create a new influence relationship
   */
  createInfluence(data: {
    sourceId: string;
    sourceType: string;
    sourceName: string;
    targetId: string;
    targetType: string;
    targetName: string;
    type: InfluenceType;
    strength: number;
    establishedChapter: number;
    direction?: InfluenceDirection;
    visibility?: InfluenceVisibility;
    growthRate?: number;
    resistance?: number;
    origin?: string;
    description?: string;
    effects?: InfluenceEffect[];
    tags?: string[];
    expiresChapter?: number;
  }): Influence {
    const id = uuidv4();
    const now = new Date();

    const influence: Influence = {
      id,
      sourceId: data.sourceId,
      sourceType: data.sourceType,
      sourceName: data.sourceName,
      targetId: data.targetId,
      targetType: data.targetType,
      targetName: data.targetName,
      type: data.type,
      direction: data.direction ?? InfluenceDirection.UNIDIRECTIONAL,
      status: InfluenceStatus.ACTIVE,
      visibility: data.visibility ?? InfluenceVisibility.KNOWN,
      strength: Math.min(100, Math.max(0, data.strength)),
      maxStrength: data.strength,
      minThreshold: this.config.defaultMinThreshold,
      growthRate: data.growthRate ?? this.config.defaultDecayRate,
      volatility: 5,
      resistance: data.resistance ?? 0,
      establishedChapter: data.establishedChapter,
      lastActiveChapter: data.establishedChapter,
      expiresChapter: data.expiresChapter,
      effects: data.effects ?? [],
      modifiers: [],
      origin: data.origin,
      description: data.description ?? `${data.sourceName} ${data.type} influence on ${data.targetName}`,
      tags: data.tags ?? [],
      createdAt: now,
      updatedAt: now
    };

    this.storeInfluence(influence);

    // Create reciprocal if bidirectional
    if (influence.direction === InfluenceDirection.BIDIRECTIONAL) {
      const reciprocal = this.createInfluence({
        ...data,
        sourceId: data.targetId,
        sourceType: data.targetType,
        sourceName: data.targetName,
        targetId: data.sourceId,
        targetType: data.sourceType,
        targetName: data.sourceName,
        direction: InfluenceDirection.UNIDIRECTIONAL,
        description: `Reciprocal: ${data.targetName} ${data.type} influence on ${data.sourceName}`
      });

      influence.reciprocalInfluenceId = reciprocal.id;
      reciprocal.reciprocalInfluenceId = influence.id;
    }

    return influence;
  }

  /**
   * Store influence and update indices
   */
  private storeInfluence(influence: Influence): void {
    this.influences.set(influence.id, influence);

    // Index by source
    if (!this.influencesBySource.has(influence.sourceId)) {
      this.influencesBySource.set(influence.sourceId, new Set());
    }
    this.influencesBySource.get(influence.sourceId)!.add(influence.id);

    // Index by target
    if (!this.influencesByTarget.has(influence.targetId)) {
      this.influencesByTarget.set(influence.targetId, new Set());
    }
    this.influencesByTarget.get(influence.targetId)!.add(influence.id);

    // Index by type
    if (!this.influencesByType.has(influence.type)) {
      this.influencesByType.set(influence.type, new Set());
    }
    this.influencesByType.get(influence.type)!.add(influence.id);
  }

  // ==========================================================================
  // INFLUENCE QUERIES
  // ==========================================================================

  /**
   * Get influence by ID
   */
  getInfluence(id: string): Influence | undefined {
    return this.influences.get(id);
  }

  /**
   * Get all influences
   */
  getAllInfluences(): Influence[] {
    return Array.from(this.influences.values());
  }

  /**
   * Get influences exerted by an entity
   */
  getInfluencesFrom(entityId: string): Influence[] {
    const ids = this.influencesBySource.get(entityId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.influences.get(id)!).filter(Boolean);
  }

  /**
   * Get influences on an entity
   */
  getInfluencesOn(entityId: string): Influence[] {
    const ids = this.influencesByTarget.get(entityId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.influences.get(id)!).filter(Boolean);
  }

  /**
   * Get influences by type
   */
  getInfluencesByType(type: InfluenceType): Influence[] {
    const ids = this.influencesByType.get(type);
    if (!ids) return [];
    return Array.from(ids).map(id => this.influences.get(id)!).filter(Boolean);
  }

  /**
   * Get influence between two specific entities
   */
  getInfluenceBetween(sourceId: string, targetId: string): Influence[] {
    return this.getInfluencesFrom(sourceId)
      .filter(i => i.targetId === targetId);
  }

  /**
   * Get the influence network for an entity
   */
  getInfluenceNetwork(entityId: string): InfluenceNetwork {
    const inbound = this.getInfluencesOn(entityId)
      .filter(i => i.status === InfluenceStatus.ACTIVE || i.status === InfluenceStatus.GROWING);
    const outbound = this.getInfluencesFrom(entityId)
      .filter(i => i.status === InfluenceStatus.ACTIVE || i.status === InfluenceStatus.GROWING);

    const totalInbound = inbound.reduce((sum, i) => sum + i.strength, 0);
    const totalOutbound = outbound.reduce((sum, i) => sum + i.strength, 0);

    const entity = inbound[0] || outbound[0];

    return {
      centerId: entityId,
      centerName: entity?.targetName ?? entity?.sourceName ?? entityId,
      inbound,
      outbound,
      totalInboundStrength: totalInbound,
      totalOutboundStrength: totalOutbound,
      dominantInbound: inbound.sort((a, b) => b.strength - a.strength)[0],
      dominantOutbound: outbound.sort((a, b) => b.strength - a.strength)[0]
    };
  }

  /**
   * Get strongest influences on an entity
   */
  getDominantInfluences(entityId: string, limit: number = 5): Influence[] {
    return this.getInfluencesOn(entityId)
      .filter(i => i.status === InfluenceStatus.ACTIVE)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);
  }

  // ==========================================================================
  // INFLUENCE MODIFICATION
  // ==========================================================================

  /**
   * Modify influence strength
   */
  modifyStrength(
    influenceId: string,
    change: number,
    chapter: number,
    cause: string
  ): Influence | undefined {
    const influence = this.influences.get(influenceId);
    if (!influence) return undefined;

    const previousStrength = influence.strength;
    const previousStatus = influence.status;

    // Apply change with resistance
    const effectiveChange = change * (1 - influence.resistance / 100);
    influence.strength = Math.min(100, Math.max(0, influence.strength + effectiveChange));

    // Update max strength
    if (influence.strength > influence.maxStrength) {
      influence.maxStrength = influence.strength;
    }

    // Update status based on strength
    if (influence.strength <= influence.minThreshold) {
      influence.status = InfluenceStatus.BROKEN;
    } else if (change > 0 && influence.status !== InfluenceStatus.CONTESTED) {
      influence.status = InfluenceStatus.GROWING;
    } else if (change < 0 && influence.status !== InfluenceStatus.CONTESTED) {
      influence.status = InfluenceStatus.DECAYING;
    }

    influence.lastActiveChapter = chapter;
    influence.updatedAt = new Date();

    // Record history
    this.recordHistory({
      influenceId,
      chapter,
      previousStrength,
      newStrength: influence.strength,
      previousStatus,
      newStatus: influence.status,
      cause,
      timestamp: new Date()
    });

    return influence;
  }

  /**
   * Add a modifier to an influence
   */
  addModifier(
    influenceId: string,
    modifier: Omit<InfluenceModifier, 'id'>
  ): InfluenceModifier | undefined {
    const influence = this.influences.get(influenceId);
    if (!influence) return undefined;

    const mod: InfluenceModifier = {
      ...modifier,
      id: uuidv4()
    };

    influence.modifiers.push(mod);
    influence.updatedAt = new Date();

    return mod;
  }

  /**
   * Add an effect to an influence
   */
  addEffect(
    influenceId: string,
    effect: Omit<InfluenceEffect, 'id'>
  ): InfluenceEffect | undefined {
    const influence = this.influences.get(influenceId);
    if (!influence) return undefined;

    const eff: InfluenceEffect = {
      ...effect,
      id: uuidv4()
    };

    influence.effects.push(eff);
    influence.updatedAt = new Date();

    return eff;
  }

  /**
   * Change influence status
   */
  setStatus(
    influenceId: string,
    status: InfluenceStatus,
    chapter: number,
    cause: string
  ): void {
    const influence = this.influences.get(influenceId);
    if (!influence) return;

    const previousStatus = influence.status;
    influence.status = status;
    influence.lastActiveChapter = chapter;
    influence.updatedAt = new Date();

    this.recordHistory({
      influenceId,
      chapter,
      previousStrength: influence.strength,
      newStrength: influence.strength,
      previousStatus,
      newStatus: status,
      cause,
      timestamp: new Date()
    });
  }

  /**
   * Break an influence
   */
  breakInfluence(
    influenceId: string,
    chapter: number,
    cause: string
  ): void {
    this.setStatus(influenceId, InfluenceStatus.BROKEN, chapter, cause);

    // Also break reciprocal if exists
    const influence = this.influences.get(influenceId);
    if (influence?.reciprocalInfluenceId) {
      this.setStatus(
        influence.reciprocalInfluenceId,
        InfluenceStatus.BROKEN,
        chapter,
        `Reciprocal broken: ${cause}`
      );
    }
  }

  /**
   * Transform influence to different type
   */
  transformInfluence(
    influenceId: string,
    newType: InfluenceType,
    chapter: number,
    cause: string
  ): Influence | undefined {
    const influence = this.influences.get(influenceId);
    if (!influence) return undefined;

    // Remove from old type index
    this.influencesByType.get(influence.type)?.delete(influenceId);

    // Update type
    const previousStatus = influence.status;
    influence.type = newType;
    influence.status = InfluenceStatus.TRANSFORMED;
    influence.lastActiveChapter = chapter;
    influence.updatedAt = new Date();

    // Add to new type index
    if (!this.influencesByType.has(newType)) {
      this.influencesByType.set(newType, new Set());
    }
    this.influencesByType.get(newType)!.add(influenceId);

    this.recordHistory({
      influenceId,
      chapter,
      previousStrength: influence.strength,
      newStrength: influence.strength,
      previousStatus,
      newStatus: InfluenceStatus.TRANSFORMED,
      cause: `Transformed to ${newType}: ${cause}`,
      timestamp: new Date()
    });

    return influence;
  }

  // ==========================================================================
  // TIME SIMULATION
  // ==========================================================================

  /**
   * Advance influences by one chapter
   */
  advanceChapter(chapter: number): {
    updated: number;
    broken: number;
    conflicts: InfluenceConflict[];
  } {
    let updated = 0;
    let broken = 0;
    const newConflicts: InfluenceConflict[] = [];

    for (const influence of this.influences.values()) {
      if (influence.status === InfluenceStatus.BROKEN) continue;
      if (influence.expiresChapter && chapter > influence.expiresChapter) {
        this.breakInfluence(influence.id, chapter, 'Expired');
        broken++;
        continue;
      }

      // Apply growth/decay
      if (this.config.enableAutoDecay && influence.growthRate !== 0) {
        const change = influence.strength * (influence.growthRate / 100);
        this.modifyStrength(influence.id, change, chapter, 'Natural progression');
        updated++;

        // Check if broken
        const updatedInfluence = this.influences.get(influence.id);
        if (updatedInfluence?.status === InfluenceStatus.BROKEN) {
          broken++;
        }
      }

      // Process modifiers
      influence.modifiers = influence.modifiers.filter(mod => {
        if (mod.expiresChapter && chapter > mod.expiresChapter) {
          return false;
        }

        // Apply modifier effect
        let strengthChange = 0;
        switch (mod.type) {
          case 'amplify':
            strengthChange = influence.strength * (mod.value / 100);
            break;
          case 'dampen':
            strengthChange = -influence.strength * (mod.value / 100);
            break;
          case 'block':
            influence.status = InfluenceStatus.DORMANT;
            break;
        }

        if (strengthChange !== 0) {
          this.modifyStrength(influence.id, strengthChange, chapter, `Modifier: ${mod.description}`);
        }

        return true;
      });
    }

    // Detect conflicts
    for (const [targetId, influenceIds] of this.influencesByTarget) {
      const activeInfluences = Array.from(influenceIds)
        .map(id => this.influences.get(id)!)
        .filter(i => i && i.status === InfluenceStatus.ACTIVE && i.strength > this.config.conflictThreshold);

      if (activeInfluences.length > 1) {
        // Check for conflicting influence types
        const hasConflict = this.detectConflict(activeInfluences);
        if (hasConflict) {
          const conflict = this.createConflict(targetId, activeInfluences, chapter);
          newConflicts.push(conflict);
        }
      }
    }

    return { updated, broken, conflicts: newConflicts };
  }

  /**
   * Detect if influences are in conflict
   */
  private detectConflict(influences: Influence[]): boolean {
    const conflictingPairs: [InfluenceType, InfluenceType][] = [
      [InfluenceType.LOVE, InfluenceType.HATRED],
      [InfluenceType.LOYALTY, InfluenceType.BETRAYAL] as [InfluenceType, InfluenceType],
      [InfluenceType.RESPECT, InfluenceType.INTIMIDATION],
      [InfluenceType.BLESSING, InfluenceType.CURSE],
      [InfluenceType.INSPIRATION, InfluenceType.CORRUPTION],
      [InfluenceType.ALLEGIANCE, InfluenceType.BLACKMAIL]
    ];

    for (const [type1, type2] of conflictingPairs) {
      const has1 = influences.some(i => i.type === type1);
      const has2 = influences.some(i => i.type === type2);
      if (has1 && has2) return true;
    }

    // Also conflict if same type from different sources (competing mentors, etc.)
    const typeGroups = new Map<InfluenceType, Influence[]>();
    for (const inf of influences) {
      if (!typeGroups.has(inf.type)) {
        typeGroups.set(inf.type, []);
      }
      typeGroups.get(inf.type)!.push(inf);
    }

    for (const group of typeGroups.values()) {
      if (group.length > 1) {
        const sources = new Set(group.map(i => i.sourceId));
        if (sources.size > 1) return true;
      }
    }

    return false;
  }

  /**
   * Create a conflict record
   */
  private createConflict(
    targetId: string,
    influences: Influence[],
    chapter: number
  ): InfluenceConflict {
    const sorted = influences.sort((a, b) => b.strength - a.strength);
    const tensionLevel = Math.min(100, sorted.reduce((sum, i) => sum + i.strength, 0) / influences.length);

    const conflict: InfluenceConflict = {
      id: uuidv4(),
      targetId,
      influences: influences.map(i => i.id),
      dominantId: sorted[0]?.id,
      tensionLevel,
      resolutionRequired: tensionLevel > 70,
      potentialOutcomes: this.generatePotentialOutcomes(influences),
      createdChapter: chapter
    };

    this.conflicts.set(conflict.id, conflict);

    // Mark influences as contested
    for (const inf of influences) {
      inf.status = InfluenceStatus.CONTESTED;
      inf.updatedAt = new Date();
    }

    return conflict;
  }

  /**
   * Generate potential conflict outcomes
   */
  private generatePotentialOutcomes(influences: Influence[]): string[] {
    const outcomes: string[] = [];
    const sorted = influences.sort((a, b) => b.strength - a.strength);

    if (sorted.length >= 2) {
      outcomes.push(`${sorted[0].sourceName}'s ${sorted[0].type} dominates`);
      outcomes.push(`${sorted[1].sourceName}'s ${sorted[1].type} overcomes`);
      outcomes.push(`Target breaks free from both influences`);
      outcomes.push(`Influences merge into new form`);
      outcomes.push(`Internal conflict causes breakdown`);
    }

    return outcomes;
  }

  // ==========================================================================
  // CONFLICT MANAGEMENT
  // ==========================================================================

  /**
   * Get all active conflicts
   */
  getConflicts(): InfluenceConflict[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * Get conflicts for an entity
   */
  getConflictsFor(entityId: string): InfluenceConflict[] {
    return Array.from(this.conflicts.values())
      .filter(c => c.targetId === entityId);
  }

  /**
   * Resolve a conflict
   */
  resolveConflict(
    conflictId: string,
    winningInfluenceId: string,
    chapter: number,
    resolution: string
  ): void {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return;

    for (const infId of conflict.influences) {
      const influence = this.influences.get(infId);
      if (!influence) continue;

      if (infId === winningInfluenceId) {
        influence.status = InfluenceStatus.ACTIVE;
        this.modifyStrength(infId, influence.strength * 0.2, chapter, `Won conflict: ${resolution}`);
      } else {
        this.modifyStrength(infId, -influence.strength * 0.5, chapter, `Lost conflict: ${resolution}`);
      }
    }

    this.conflicts.delete(conflictId);
  }

  // ==========================================================================
  // HISTORY
  // ==========================================================================

  /**
   * Record a history entry
   */
  private recordHistory(entry: InfluenceHistory): void {
    this.history.push(entry);

    // Trim old history
    const cutoffChapter = entry.chapter - this.config.historyRetention;
    this.history = this.history.filter(h => h.chapter > cutoffChapter);
  }

  /**
   * Get history for an influence
   */
  getHistory(influenceId: string): InfluenceHistory[] {
    return this.history.filter(h => h.influenceId === influenceId);
  }

  /**
   * Get all history for a chapter range
   */
  getHistoryRange(startChapter: number, endChapter: number): InfluenceHistory[] {
    return this.history.filter(h =>
      h.chapter >= startChapter && h.chapter <= endChapter
    );
  }

  // ==========================================================================
  // ANALYSIS
  // ==========================================================================

  /**
   * Calculate influence score for an entity (how influential they are)
   */
  calculateInfluenceScore(entityId: string): {
    score: number;
    reach: number;
    depth: number;
    types: InfluenceType[];
  } {
    const outbound = this.getInfluencesFrom(entityId)
      .filter(i => i.status === InfluenceStatus.ACTIVE);

    const score = outbound.reduce((sum, i) => sum + i.strength, 0);
    const reach = new Set(outbound.map(i => i.targetId)).size;
    const types = [...new Set(outbound.map(i => i.type))];

    // Calculate depth (how far influence spreads through network)
    let depth = 0;
    const visited = new Set<string>([entityId]);
    let frontier = outbound.map(i => i.targetId);

    while (frontier.length > 0 && depth < 10) {
      const newFrontier: string[] = [];
      for (const id of frontier) {
        if (visited.has(id)) continue;
        visited.add(id);

        const further = this.getInfluencesFrom(id)
          .filter(i => i.status === InfluenceStatus.ACTIVE)
          .map(i => i.targetId);
        newFrontier.push(...further);
      }
      frontier = newFrontier;
      if (newFrontier.length > 0) depth++;
    }

    return { score, reach, depth, types };
  }

  /**
   * Find most influential entities
   */
  getMostInfluential(limit: number = 10): Array<{
    entityId: string;
    entityName: string;
    score: number;
    reach: number;
  }> {
    const scores = new Map<string, { name: string; score: number; reach: number }>();

    for (const influence of this.influences.values()) {
      if (influence.status !== InfluenceStatus.ACTIVE) continue;

      const current = scores.get(influence.sourceId) ?? {
        name: influence.sourceName,
        score: 0,
        reach: 0
      };

      current.score += influence.strength;
      current.reach++;
      scores.set(influence.sourceId, current);
    }

    return Array.from(scores.entries())
      .map(([id, data]) => ({ entityId: id, entityName: data.name, ...data }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Find most influenced entities
   */
  getMostInfluenced(limit: number = 10): Array<{
    entityId: string;
    entityName: string;
    totalInfluence: number;
    sourceCount: number;
  }> {
    const influenced = new Map<string, { name: string; total: number; sources: number }>();

    for (const influence of this.influences.values()) {
      if (influence.status !== InfluenceStatus.ACTIVE) continue;

      const current = influenced.get(influence.targetId) ?? {
        name: influence.targetName,
        total: 0,
        sources: 0
      };

      current.total += influence.strength;
      current.sources++;
      influenced.set(influence.targetId, current);
    }

    return Array.from(influenced.entries())
      .map(([id, data]) => ({
        entityId: id,
        entityName: data.name,
        totalInfluence: data.total,
        sourceCount: data.sources
      }))
      .sort((a, b) => b.totalInfluence - a.totalInfluence)
      .slice(0, limit);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    totalInfluences: number;
    activeInfluences: number;
    brokenInfluences: number;
    contestedInfluences: number;
    avgStrength: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    activeConflicts: number;
    entitiesWithInfluence: number;
    entitiesUnderInfluence: number;
  } {
    const influences = Array.from(this.influences.values());

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalStrength = 0;

    for (const inf of influences) {
      byType[inf.type] = (byType[inf.type] ?? 0) + 1;
      byStatus[inf.status] = (byStatus[inf.status] ?? 0) + 1;
      totalStrength += inf.strength;
    }

    return {
      totalInfluences: influences.length,
      activeInfluences: influences.filter(i => i.status === InfluenceStatus.ACTIVE).length,
      brokenInfluences: influences.filter(i => i.status === InfluenceStatus.BROKEN).length,
      contestedInfluences: influences.filter(i => i.status === InfluenceStatus.CONTESTED).length,
      avgStrength: influences.length > 0 ? totalStrength / influences.length : 0,
      byType,
      byStatus,
      activeConflicts: this.conflicts.size,
      entitiesWithInfluence: this.influencesBySource.size,
      entitiesUnderInfluence: this.influencesByTarget.size
    };
  }

  // ==========================================================================
  // IMPORT/EXPORT
  // ==========================================================================

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      influences: Array.from(this.influences.values()),
      conflicts: Array.from(this.conflicts.values()),
      history: this.history,
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

    if (data.config) {
      this.config = { ...defaultConfig, ...data.config };
    }

    if (data.influences) {
      for (const inf of data.influences) {
        inf.createdAt = new Date(inf.createdAt);
        inf.updatedAt = new Date(inf.updatedAt);
        this.storeInfluence(inf);
      }
    }

    if (data.conflicts) {
      for (const conflict of data.conflicts) {
        this.conflicts.set(conflict.id, conflict);
      }
    }

    if (data.history) {
      this.history = data.history.map((h: InfluenceHistory) => ({
        ...h,
        timestamp: new Date(h.timestamp)
      }));
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.influences.clear();
    this.conflicts.clear();
    this.history = [];
    this.influencesBySource.clear();
    this.influencesByTarget.clear();
    this.influencesByType.clear();
  }
}

// Default instance
export const influenceTracker = new InfluenceTracker();

export default InfluenceTracker;
