/**
 * Epic Fiction Architect - Causality Engine
 *
 * Comprehensive system for tracking how actions and relationships
 * propagate through the story world. No character exists in a bubble -
 * every action creates ripples, and every relationship exerts influence.
 *
 * Components:
 * - Ripple Effect Engine: Tracks cascading consequences of actions
 * - Influence Tracker: Manages ongoing influence relationships
 *
 * Together they model how past events shape present circumstances
 * and how character actions affect the broader narrative.
 */

// =============================================================================
// RIPPLE EFFECT ENGINE
// =============================================================================

export {
  // Enums
  ActionType,
  RippleCategory,
  PropagationSpeed,
  RippleStatus,
  RippleIntensity,

  // Interfaces
  type CausalAction,
  type Ripple,
  type RippleChain,
  type PropagationRule,
  type WorldStateSnapshot,
  type RippleEngineConfig,

  // Class
  RippleEffectEngine,

  // Default instance
  rippleEffectEngine
} from './ripple-effect-engine';

// =============================================================================
// INFLUENCE TRACKER
// =============================================================================

export {
  // Enums
  InfluenceType,
  InfluenceDirection,
  InfluenceStatus,
  InfluenceVisibility,

  // Interfaces
  type Influence,
  type InfluenceEffect,
  type InfluenceModifier,
  type InfluenceNetwork,
  type InfluenceHistory,
  type InfluenceConflict,
  type InfluenceTrackerConfig,

  // Class
  InfluenceTracker,

  // Default instance
  influenceTracker
} from './influence-tracker';

// =============================================================================
// INTEGRATED CAUSALITY SYSTEM
// =============================================================================

import {
  RippleEffectEngine,
  ActionType,
  RippleCategory,
  RippleIntensity
} from './ripple-effect-engine';
import {
  InfluenceTracker,
  InfluenceType
} from './influence-tracker';

/**
 * Configuration for the integrated causality system
 */
export interface CausalitySystemConfig {
  autoCreateInfluenceFromRipples: boolean;
  rippleToInfluenceThreshold: RippleIntensity;
  syncChapterAdvancement: boolean;
}

const defaultCausalityConfig: CausalitySystemConfig = {
  autoCreateInfluenceFromRipples: true,
  rippleToInfluenceThreshold: RippleIntensity.SIGNIFICANT,
  syncChapterAdvancement: true
};

/**
 * Integrated Causality System
 *
 * Combines ripple effects (one-time consequences) with influence tracking
 * (ongoing relationships) to model how the story world evolves.
 */
export class CausalitySystem {
  public readonly ripples: RippleEffectEngine;
  public readonly influences: InfluenceTracker;
  private config: CausalitySystemConfig;

  // Entity integration (set externally)
  private entityLookup?: (id: string) => { id: string; type: string; name: string } | undefined;

  constructor(config?: Partial<CausalitySystemConfig>) {
    this.config = { ...defaultCausalityConfig, ...config };
    this.ripples = new RippleEffectEngine();
    this.influences = new InfluenceTracker();
  }

  /**
   * Set entity lookup for integration with entity management
   */
  setEntityLookup(
    lookup: (id: string) => { id: string; type: string; name: string } | undefined
  ): void {
    this.entityLookup = lookup;
    this.ripples.setEntityLookup(lookup);
  }

  /**
   * Set relationship lookup for integration with cross-references
   */
  setRelationshipLookup(
    lookup: (entityId: string) => Array<{
      targetId: string;
      targetType: string;
      relationType: string;
    }>
  ): void {
    this.ripples.setRelationshipLookup(lookup);
  }

  /**
   * Record an action and propagate its effects
   */
  recordAction(
    type: ActionType,
    data: Parameters<RippleEffectEngine['recordAction']>[1]
  ): {
    action: ReturnType<RippleEffectEngine['recordAction']>;
    ripples: ReturnType<RippleEffectEngine['getRipplesForAction']>;
    influencesCreated: number;
  } {
    // Record the action
    const action = this.ripples.recordAction(type, data);

    // Get generated ripples
    const ripples = this.ripples.getRipplesForAction(action.id);

    // Optionally convert strong ripples to influences
    let influencesCreated = 0;
    if (this.config.autoCreateInfluenceFromRipples) {
      for (const ripple of ripples) {
        if (ripple.intensity >= this.config.rippleToInfluenceThreshold) {
          this.createInfluenceFromRipple(ripple, action);
          influencesCreated++;
        }
      }
    }

    return { action, ripples, influencesCreated };
  }

  /**
   * Create an influence relationship from a strong ripple
   */
  private createInfluenceFromRipple(
    ripple: ReturnType<RippleEffectEngine['getRipple']>,
    action: ReturnType<RippleEffectEngine['getAction']>
  ): void {
    if (!ripple || !action) return;

    // Map ripple category to influence type
    const influenceType = this.mapCategoryToInfluenceType(ripple.category, action.type);
    if (!influenceType) return;

    // Check if similar influence already exists
    const existing = this.influences.getInfluenceBetween(action.actorId, ripple.affectedEntityId);
    if (existing.some(i => i.type === influenceType)) {
      // Strengthen existing influence instead
      const match = existing.find(i => i.type === influenceType);
      if (match) {
        this.influences.modifyStrength(
          match.id,
          ripple.intensity * 5,
          action.chapterOccurred,
          `Reinforced by ${action.name}`
        );
      }
      return;
    }

    // Create new influence
    this.influences.createInfluence({
      sourceId: action.actorId,
      sourceType: action.actorType,
      sourceName: action.actorName,
      targetId: ripple.affectedEntityId,
      targetType: ripple.affectedEntityType,
      targetName: ripple.affectedEntityName,
      type: influenceType,
      strength: ripple.intensity * 10,
      establishedChapter: action.chapterOccurred,
      origin: `Created from ${action.name}`,
      description: `${action.actorName}'s ${influenceType} influence on ${ripple.affectedEntityName} from ${action.name}`
    });
  }

  /**
   * Map ripple category to influence type
   */
  private mapCategoryToInfluenceType(
    category: RippleCategory,
    actionType: ActionType
  ): InfluenceType | null {
    // Action-specific mappings
    switch (actionType) {
      case ActionType.DEATH:
        return InfluenceType.LEGACY;
      case ActionType.BETRAYAL:
        return InfluenceType.TRAUMA;
      case ActionType.HEROIC_ACT:
        return InfluenceType.INSPIRATION;
      case ActionType.POWER_AWAKENED:
        return InfluenceType.RESONANCE;
      case ActionType.SECRET_REVEALED:
        return InfluenceType.BLACKMAIL;
    }

    // Category-based mappings
    switch (category) {
      case RippleCategory.EMOTIONAL:
        return InfluenceType.RESPECT;
      case RippleCategory.POLITICAL:
        return InfluenceType.AUTHORITY;
      case RippleCategory.SOCIAL:
        return InfluenceType.REPUTATION;
      case RippleCategory.KNOWLEDGE:
        return InfluenceType.TEACHING;
      case RippleCategory.MAGICAL:
        return InfluenceType.BOND;
      default:
        return null;
    }
  }

  /**
   * Advance the simulation to a specific chapter
   */
  advanceToChapter(targetChapter: number): {
    rippleResults: ReturnType<RippleEffectEngine['advanceToChapter']>;
    influenceResults: ReturnType<InfluenceTracker['advanceChapter']>;
    newConflicts: number;
  } {
    const rippleResults = this.ripples.advanceToChapter(targetChapter);

    // Advance influences for each chapter
    let totalUpdated = 0;
    let totalBroken = 0;
    const allConflicts: ReturnType<InfluenceTracker['advanceChapter']>['conflicts'] = [];

    if (this.config.syncChapterAdvancement) {
      const currentChapter = this.getCurrentChapter();
      for (let ch = currentChapter + 1; ch <= targetChapter; ch++) {
        const result = this.influences.advanceChapter(ch);
        totalUpdated += result.updated;
        totalBroken += result.broken;
        allConflicts.push(...result.conflicts);
      }
    }

    return {
      rippleResults,
      influenceResults: {
        updated: totalUpdated,
        broken: totalBroken,
        conflicts: allConflicts
      },
      newConflicts: allConflicts.length
    };
  }

  /**
   * Get current chapter
   */
  getCurrentChapter(): number {
    return this.ripples.getCurrentChapter();
  }

  /**
   * Get all effects on an entity (ripples + influences)
   */
  getEffectsOnEntity(entityId: string): {
    activeRipples: ReturnType<RippleEffectEngine['getRipplesForEntity']>;
    activeInfluences: ReturnType<InfluenceTracker['getInfluencesOn']>;
    totalRippleIntensity: number;
    totalInfluenceStrength: number;
    dominantInfluence?: ReturnType<InfluenceTracker['getInfluence']>;
  } {
    const activeRipples = this.ripples.getRipplesForEntity(entityId)
      .filter(r => r.status === 'active' || r.status === 'manifested');
    const activeInfluences = this.influences.getInfluencesOn(entityId)
      .filter(i => i.status === 'active' || i.status === 'growing');

    const totalRippleIntensity = activeRipples.reduce((sum, r) => sum + r.intensity, 0);
    const totalInfluenceStrength = activeInfluences.reduce((sum, i) => sum + i.strength, 0);

    const dominantInfluence = activeInfluences.sort((a, b) => b.strength - a.strength)[0];

    return {
      activeRipples,
      activeInfluences,
      totalRippleIntensity,
      totalInfluenceStrength,
      dominantInfluence
    };
  }

  /**
   * Get all effects caused by an entity (ripples from their actions + their influences)
   */
  getEffectsFromEntity(entityId: string): {
    actions: ReturnType<RippleEffectEngine['getAllActions']>;
    totalRipplesCaused: number;
    activeInfluences: ReturnType<InfluenceTracker['getInfluencesFrom']>;
    influenceScore: ReturnType<InfluenceTracker['calculateInfluenceScore']>;
  } {
    const actions = this.ripples.getAllActions()
      .filter(a => a.actorId === entityId);

    let totalRipplesCaused = 0;
    for (const action of actions) {
      totalRipplesCaused += this.ripples.getRipplesForAction(action.id).length;
    }

    const activeInfluences = this.influences.getInfluencesFrom(entityId)
      .filter(i => i.status === 'active');

    const influenceScore = this.influences.calculateInfluenceScore(entityId);

    return {
      actions,
      totalRipplesCaused,
      activeInfluences,
      influenceScore
    };
  }

  /**
   * Trace how an action affected the world
   */
  traceActionImpact(actionId: string): {
    action: ReturnType<RippleEffectEngine['getAction']>;
    rippleChain: ReturnType<RippleEffectEngine['getRippleChain']>;
    influencesCreated: ReturnType<InfluenceTracker['getInfluence']>[];
    affectedEntities: string[];
    maxDepth: number;
    totalIntensity: number;
  } {
    const action = this.ripples.getAction(actionId);
    const rippleChain = this.ripples.getRippleChain(actionId);

    // Find influences that originated from this action
    const allInfluences = this.influences.getAllInfluences();
    const relatedInfluences = allInfluences.filter(i =>
      i.origin?.includes(action?.name ?? '')
    );

    const affectedEntities = rippleChain
      ? Array.from(rippleChain.affectedEntities)
      : [];

    const maxDepth = rippleChain?.depth ?? 0;
    const totalIntensity = rippleChain?.ripples.reduce((sum, r) => sum + r.intensity, 0) ?? 0;

    return {
      action,
      rippleChain,
      influencesCreated: relatedInfluences,
      affectedEntities,
      maxDepth,
      totalIntensity
    };
  }

  /**
   * Find connections between two entities through causality
   */
  findCausalConnection(entityA: string, entityB: string): {
    directInfluences: ReturnType<InfluenceTracker['getInfluenceBetween']>;
    sharedActions: Array<{ actionId: string; entityARipples: number; entityBRipples: number }>;
    connectionStrength: number;
  } {
    // Direct influences
    const aToB = this.influences.getInfluenceBetween(entityA, entityB);
    const bToA = this.influences.getInfluenceBetween(entityB, entityA);
    const directInfluences = [...aToB, ...bToA];

    // Actions affecting both
    const aRipples = this.ripples.getRipplesForEntity(entityA);
    const bRipples = this.ripples.getRipplesForEntity(entityB);

    const aActions = new Set(aRipples.map(r => r.sourceActionId));
    const bActions = new Set(bRipples.map(r => r.sourceActionId));

    const sharedActionIds = Array.from(aActions).filter(id => bActions.has(id));
    const sharedActions = sharedActionIds.map(actionId => ({
      actionId,
      entityARipples: aRipples.filter(r => r.sourceActionId === actionId).length,
      entityBRipples: bRipples.filter(r => r.sourceActionId === actionId).length
    }));

    // Calculate connection strength
    const influenceStrength = directInfluences.reduce((sum, i) => sum + i.strength, 0);
    const sharedActionStrength = sharedActions.length * 10;
    const connectionStrength = influenceStrength + sharedActionStrength;

    return {
      directInfluences,
      sharedActions,
      connectionStrength
    };
  }

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    rippleStats: ReturnType<RippleEffectEngine['getStats']>;
    influenceStats: ReturnType<InfluenceTracker['getStats']>;
    totalCausalEvents: number;
    avgRipplesPerAction: number;
    avgInfluenceStrength: number;
  } {
    const rippleStats = this.ripples.getStats();
    const influenceStats = this.influences.getStats();

    const avgRipplesPerAction = rippleStats.totalActions > 0
      ? rippleStats.totalRipples / rippleStats.totalActions
      : 0;

    return {
      rippleStats,
      influenceStats,
      totalCausalEvents: rippleStats.totalActions + influenceStats.totalInfluences,
      avgRipplesPerAction,
      avgInfluenceStrength: influenceStats.avgStrength
    };
  }

  /**
   * Generate a causality report for an entity
   */
  generateEntityReport(entityId: string): string {
    const effectsOn = this.getEffectsOnEntity(entityId);
    const effectsFrom = this.getEffectsFromEntity(entityId);
    const network = this.influences.getInfluenceNetwork(entityId);
    const entity = this.entityLookup?.(entityId);
    const entityName = entity?.name ?? entityId;

    let report = `# Causality Report: ${entityName}\n\n`;

    report += `## Influence Network\n\n`;
    report += `- **Inbound Influences:** ${network.inbound.length} (total strength: ${network.totalInboundStrength.toFixed(1)})\n`;
    report += `- **Outbound Influences:** ${network.outbound.length} (total strength: ${network.totalOutboundStrength.toFixed(1)})\n`;

    if (network.dominantInbound) {
      report += `- **Dominant Inbound:** ${network.dominantInbound.sourceName}'s ${network.dominantInbound.type} (${network.dominantInbound.strength.toFixed(1)}%)\n`;
    }

    report += `\n## Ripple Effects\n\n`;
    report += `- **Active Ripples Affecting:** ${effectsOn.activeRipples.length}\n`;
    report += `- **Total Ripple Intensity:** ${effectsOn.totalRippleIntensity}\n`;
    report += `- **Actions Taken:** ${effectsFrom.actions.length}\n`;
    report += `- **Total Ripples Caused:** ${effectsFrom.totalRipplesCaused}\n`;

    report += `\n## Influence Score\n\n`;
    report += `- **Score:** ${effectsFrom.influenceScore.score.toFixed(1)}\n`;
    report += `- **Reach:** ${effectsFrom.influenceScore.reach} entities\n`;
    report += `- **Depth:** ${effectsFrom.influenceScore.depth} hops\n`;
    report += `- **Types:** ${effectsFrom.influenceScore.types.join(', ')}\n`;

    if (effectsOn.activeRipples.length > 0) {
      report += `\n## Recent Ripple Effects\n\n`;
      for (const ripple of effectsOn.activeRipples.slice(0, 5)) {
        report += `- **${ripple.category}:** ${ripple.effectDescription} (intensity: ${ripple.intensity})\n`;
      }
    }

    if (network.inbound.length > 0) {
      report += `\n## Key Influences On ${entityName}\n\n`;
      for (const inf of network.inbound.slice(0, 5)) {
        report += `- **${inf.sourceName}** (${inf.type}): ${inf.strength.toFixed(1)}% - ${inf.description}\n`;
      }
    }

    return report;
  }

  /**
   * Export all data
   */
  exportToJSON(): string {
    return JSON.stringify({
      ripples: JSON.parse(this.ripples.exportToJSON()),
      influences: JSON.parse(this.influences.exportToJSON()),
      config: this.config,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import all data
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.config) {
      this.config = { ...defaultCausalityConfig, ...data.config };
    }

    if (data.ripples) {
      this.ripples.importFromJSON(JSON.stringify(data.ripples));
    }

    if (data.influences) {
      this.influences.importFromJSON(JSON.stringify(data.influences));
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.ripples.clear();
    this.influences.clear();
  }
}

// Default integrated instance
export const causalitySystem = new CausalitySystem();

export default CausalitySystem;
