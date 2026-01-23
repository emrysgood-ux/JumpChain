/**
 * Epic Fiction Architect - Jumpchain Systems
 *
 * Specialized systems for managing Jumpchain narratives - stories where a
 * protagonist travels across multiple fictional universes, accumulating
 * powers, items, companions, and experiences over potentially thousands
 * of chapters.
 *
 * This module provides:
 * - Jump management and tracking
 * - Power synergy detection across universes
 * - Cosmic Warehouse inventory system
 * - Universal power translation
 * - Companion development tracking
 *
 * When your story spans entire multiverses, you need tools that can keep up.
 */

// =============================================================================
// JUMP MANAGER
// =============================================================================

export {
  // Enums
  JumpStatus,
  JumpType,
  OriginType,
  AcquisitionSource,
  PerkCategory,
  ItemTier,
  ChainFailureType,

  // Interfaces
  type Jump,
  type JumpOrigin,
  type ChoicePointBudget,
  type JumpPerk,
  type JumpItem,
  type JumpCompanion,
  type JumpDrawback,
  type JumpScenario,
  type ChainState,
  type ChainPerk,
  type JumpManagerConfig,

  // Class
  JumpManager
} from './jump-manager';

// =============================================================================
// POWER SYNERGY ENGINE
// =============================================================================

export {
  // Enums
  InteractionType,
  PowerSource,
  PowerTier,
  PowerContext,
  LimitationType,

  // Interfaces
  type Power,
  type PowerEffect,
  type PowerLimitation,
  type ScalingFactor,
  type UniverseCompatibility,
  type PowerSynergy,
  type PowerConflict,
  type CombinationResult,
  type ScalingCalculation,
  type PowerSynergyConfig,

  // Class
  PowerSynergyEngine,

  // Default instance
  powerSynergyEngine
} from './power-synergy-engine';

// =============================================================================
// WAREHOUSE SYSTEM
// =============================================================================

export {
  // Enums
  AttachmentType,
  AccessMethod,
  StorageZone,
  PreservationStatus,
  SupplementSource,

  // Interfaces
  type WarehouseDimensions,
  type WarehouseAttachment,
  type StoredItem,
  type CompanionQuarters,
  type StoredVehicle,
  type WarehouseAccess,
  type WarehouseResource,
  type WarehouseEvent,
  type WarehouseSupplement,
  type WarehouseConfig,

  // Class
  WarehouseSystem,

  // Default instance
  warehouseSystem
} from './warehouse-system';

// =============================================================================
// UNIVERSAL ADAPTER
// =============================================================================

export {
  // Enums
  MetaphysicsType,
  AdaptationResult,
  FiatLevel,
  TranslationComplexity,
  UniverseResistance,

  // Interfaces
  type UniverseProfile,
  type UniverseRule,
  type PowerProfile,
  type TranslationRule,
  type TranslationResult,
  type AdaptationProgress,
  type PowerHarmonization,
  type UniversalAdapterConfig,

  // Class
  UniversalAdapter,

  // Default instance
  universalAdapter
} from './universal-adapter';

// =============================================================================
// COMPANION TRACKER
// =============================================================================

export {
  // Enums
  CompanionOrigin,
  CompanionStatus,
  CompanionRole,
  RelationshipType,
  ArcType,
  BuildMethod,

  // Interfaces
  type Companion,
  type RelationshipEvent,
  type CompanionBuild,
  type CompanionPerk,
  type CompanionItem,
  type CompanionDrawback,
  type CharacterArc,
  type ArcMilestone,
  type CompanionPowerGrowth,
  type CompanionAbility,
  type CompanionInteraction,
  type JumpCompanionSummary,
  type CompanionTrackerConfig,

  // Class
  CompanionTracker,

  // Default instance
  companionTracker
} from './companion-tracker';

// =============================================================================
// INTEGRATED JUMPCHAIN SUITE
// =============================================================================

import { JumpManager, JumpStatus, OriginType } from './jump-manager';
import { PowerSynergyEngine, PowerSource, PowerTier, PowerContext, Power } from './power-synergy-engine';
import { WarehouseSystem, StorageZone } from './warehouse-system';
import { UniversalAdapter, MetaphysicsType, FiatLevel, UniverseResistance, UniverseRealityType } from './universal-adapter';
import { CompanionTracker, CompanionStatus, BuildMethod } from './companion-tracker';

/**
 * Integrated Jumpchain Suite
 *
 * Combines all Jumpchain-specific systems into a unified interface
 * for managing the complex interplay of cross-universe travel.
 */
export class JumpchainSuite {
  public readonly jumps: JumpManager;
  public readonly powers: PowerSynergyEngine;
  public readonly warehouse: WarehouseSystem;
  public readonly adapter: UniversalAdapter;
  public readonly companions: CompanionTracker;

  constructor(jumperName = 'Jumper', chainName = 'My Chain') {
    this.jumps = new JumpManager(jumperName, chainName);
    this.powers = new PowerSynergyEngine();
    this.warehouse = new WarehouseSystem();
    this.adapter = new UniversalAdapter();
    this.companions = new CompanionTracker();
  }

  /**
   * Start a new jump - coordinates all systems
   */
  startJump(jumpData: {
    name: string;
    universe: string;
    startingCP: number;
    chapter: number;
    duration?: number;
    metaphysics?: MetaphysicsType[];
    originName?: string;
    originType?: OriginType;
  }): {
    jumpId: string;
    universeProfileId: string;
    companionSummaryId: string;
  } {
    // Create the jump with proper origin
    const jump = this.jumps.createJump({
      name: jumpData.name,
      universe: jumpData.universe,
      startingCP: jumpData.startingCP,
      duration: jumpData.duration || 10,
      origin: {
        name: jumpData.originName || 'Drop-In',
        type: jumpData.originType || OriginType.DROP_IN,
        description: `Origin for ${jumpData.name}`,
        memories: true,
        identity: false
      }
    });

    // Start the jump at the chapter
    this.jumps.startJump(jump.id, jumpData.chapter);

    // Create universe profile for power translation
    const universeProfile = this.adapter.createUniverseProfile({
      name: jumpData.universe,
      description: `Universe from ${jumpData.name}`,
      primaryMetaphysics: jumpData.metaphysics || [MetaphysicsType.UNKNOWN],
      secondaryMetaphysics: [],
      forbiddenMetaphysics: [],
      foreignPowerResistance: UniverseResistance.NEUTRAL,
      powerCeiling: 10,
      baselineHuman: 1,
      scalingFactor: 1.0,
      specialRules: [],
      fiatOverrides: true,
      crossoverFriendly: true,
      realityType: UniverseRealityType.PURE_FICTION,
      sourceJumpId: jump.id,
      notes: ''
    });

    // Create companion summary for this jump
    const companionSummary = this.companions.createJumpSummary(
      jump.id,
      jumpData.name,
      jumpData.chapter
    );

    return {
      jumpId: jump.id,
      universeProfileId: universeProfile.id,
      companionSummaryId: companionSummary.jumpId
    };
  }

  /**
   * Complete current jump - wrap up all systems
   */
  completeJump(
    jumpId: string,
    endChapter: number,
    _outcome: 'completed' | 'failed' | 'abandoned' = 'completed'
  ): void {
    const jump = this.jumps.getJump(jumpId);
    if (!jump) return;

    // Complete the jump
    this.jumps.completeJump(jumpId, endChapter);

    // Update all active companions
    const activeCompanions = this.companions.getActiveCompanions();
    for (const companion of activeCompanions) {
      // Update power growth
      const growth = this.companions.getPowerGrowth(companion.id);
      if (growth) {
        this.companions.updatePowerLevel(
          companion.id,
          jumpId,
          growth.currentPowerLevel + growth.averageGrowthPerJump,
          endChapter
        );
      }
    }

    // Advance character arcs
    this.companions.advanceArcsToChapter(endChapter);
  }

  /**
   * Add a perk and register it with power systems
   */
  addPerkWithPowerTracking(
    jumpId: string,
    perkData: {
      name: string;
      description: string;
      cost: number;
      category: Parameters<JumpManager['addPerk']>[1]['category'];
      tier?: number;
    },
    powerData?: {
      powerSource: PowerSource;
      tier: PowerTier;
      contexts: PowerContext[];
      tags: string[];
    }
  ): { perkId: string | undefined; powerId?: string } {
    const jump = this.jumps.getJump(jumpId);
    const perk = this.jumps.addPerk(jumpId, perkData);
    let powerId: string | undefined;

    if (perk && powerData && jump) {
      const power = this.powers.registerPower({
        name: perkData.name,
        description: perkData.description,
        sourceJumpId: jumpId,
        sourceJumpName: jump.name,
        sourceUniverse: jump.universe,
        powerSource: powerData.powerSource,
        tier: powerData.tier,
        contexts: powerData.contexts,
        tags: powerData.tags
      });
      powerId = power.id;
    }

    return { perkId: perk?.id, powerId };
  }

  /**
   * Store an item in warehouse
   */
  storeItemInWarehouse(
    jumpId: string,
    itemId: string,
    storageOptions: {
      zone: StorageZone;
      location?: string;
      isRestricted?: boolean;
    }
  ): string | null {
    const jump = this.jumps.getJump(jumpId);
    const item = jump?.items.find(i => i.id === itemId);
    if (!item || !jump) return null;

    const stored = this.warehouse.storeItem({
      itemId: item.id,
      name: item.name,
      description: item.description,
      zone: storageOptions.zone,
      locationDescription: storageOptions.location || 'General storage',
      preservation: this.warehouse['config'].defaultPreservation,
      timeInStorage: 0,
      condition: 100,
      quantity: 1,
      stackable: false,
      containerIds: [],
      tags: [],
      isRestricted: storageOptions.isRestricted || false,
      lastAccessed: jump.startChapter || 0,
      accessCount: 0,
      isLiving: false,
      isSentient: false,
      maintenanceRequired: false,
      notes: `From: ${jump.name}`
    });

    return stored.id;
  }

  /**
   * Import companion to new jump
   */
  importCompanion(
    companionId: string,
    jumpId: string,
    buildData: {
      cpAvailable: number;
      buildMethod: BuildMethod;
    }
  ): string | null {
    const companion = this.companions.getCompanion(companionId);
    const jump = this.jumps.getJump(jumpId);
    if (!companion || !jump) return null;

    const startChapter = jump.startChapter || 0;

    // Update companion status
    this.companions.updateCompanionStatus(
      companionId,
      CompanionStatus.ACTIVE,
      startChapter,
      `Imported to ${jump.name}`
    );

    // Create build for this jump
    const build = this.companions.createBuild({
      companionId,
      jumpId,
      jumpName: jump.name,
      chapter: startChapter,
      cpAvailable: buildData.cpAvailable,
      cpSpent: 0,
      buildMethod: buildData.buildMethod,
      originPerks: [],
      notes: ''
    });

    // Record in jump summary
    this.companions.recordNewCompanionInJump(jumpId, companionId);

    return build.id;
  }

  /**
   * Check how powers translate to current universe
   */
  checkPowerTranslations(
    jumpId: string
  ): ReturnType<UniversalAdapter['generateTranslationReport']> {
    const jump = this.jumps.getJump(jumpId);
    if (!jump) return 'Jump not found';

    // Find universe profile
    const universeProfile = Array.from(this.adapter['universeProfiles'].values())
      .find(u => u.sourceJumpId === jumpId);
    if (!universeProfile) return 'Universe profile not found';

    // Get all power profiles
    const allPowers = Array.from(this.powers['powers'].values()) as Power[];
    const powerProfiles = allPowers
      .filter(p => p.isActive)
      .map(p => {
        // Create power profile if not exists
        let profile = this.adapter.getPowerProfile(p.id);
        if (!profile) {
          profile = this.adapter.createPowerProfile({
            powerId: p.id,
            name: p.name,
            metaphysicsType: this.inferMetaphysicsFromSource(p.powerSource),
            secondaryTypes: [],
            mechanism: p.description,
            requiresAmbientEnergy: false,
            canGenerateOwnEnergy: true,
            adaptability: 70,
            mechanismFlexibility: 'flexible',
            fiatLevel: FiatLevel.STANDARD,
            fiatProtections: ['Basic functionality guaranteed'],
            tags: p.tags,
            sourceUniverseId: p.sourceJumpId
          });
        }
        return profile.id;
      });

    const startChapter = jump.startChapter || 0;
    return this.adapter.generateTranslationReport(
      powerProfiles,
      universeProfile.id,
      startChapter
    );
  }

  /**
   * Infer metaphysics type from power source
   */
  private inferMetaphysicsFromSource(source: PowerSource): MetaphysicsType {
    switch (source) {
      case PowerSource.MAGIC:
        return MetaphysicsType.MAGIC_AMBIENT;
      case PowerSource.CHI:
        return MetaphysicsType.MAGIC_INTERNAL;
      case PowerSource.TECHNOLOGICAL:
        return MetaphysicsType.TECH_SOFT;
      case PowerSource.PSYCHIC:
        return MetaphysicsType.PSYCHIC;
      case PowerSource.DIVINE:
        return MetaphysicsType.MAGIC_DIVINE;
      case PowerSource.COSMIC:
        return MetaphysicsType.COSMIC;
      default:
        return MetaphysicsType.UNKNOWN;
    }
  }

  /**
   * Generate comprehensive chain report
   */
  generateChainReport(_currentChapter: number): string {
    let report = '# Jumpchain Progress Report\n\n';

    // Chain state
    const chainState = this.jumps.getChainState();
    const allJumps = this.jumps.getAllJumps();
    const currentJump = this.jumps.getCurrentJump();
    const cpStats = this.jumps.getTotalCPStats();

    report += '## Chain Status\n\n';
    report += `- **Total Jumps:** ${allJumps.length}\n`;
    report += `- **Completed:** ${allJumps.filter(j => j.status === JumpStatus.COMPLETED).length}\n`;
    report += `- **Current Jump:** ${currentJump?.name || 'None'}\n`;
    report += `- **Chain Active:** ${chainState.status === 'active' ? 'Yes' : 'No'}\n`;
    report += `- **Total CP Earned:** ${cpStats.totalEarned}\n`;
    report += `- **Total CP Spent:** ${cpStats.totalSpent}\n\n`;

    // Power stats
    const powerStats = this.powers.getStats();
    report += '## Powers\n\n';
    report += `- **Registered Powers:** ${powerStats.totalPowers}\n`;
    report += `- **Synergies:** ${powerStats.totalSynergies}\n`;
    report += `- **Conflicts:** ${powerStats.totalConflicts}\n\n`;

    // Warehouse stats
    const warehouseStats = this.warehouse.getStats();
    report += '## Warehouse\n\n';
    report += `- **Attachments:** ${warehouseStats.activeAttachments}\n`;
    report += `- **Stored Items:** ${warehouseStats.totalItems}\n`;
    report += `- **Vehicles:** ${warehouseStats.totalVehicles}\n`;
    report += `- **Space Used:** ${warehouseStats.hasInfiniteSpace ? 'Infinite' : `${warehouseStats.spaceUsedPercent.toFixed(1)}%`}\n\n`;

    // Companion stats
    const companionStats = this.companions.getStats();
    report += '## Companions\n\n';
    report += `- **Total:** ${companionStats.totalCompanions}\n`;
    report += `- **Active:** ${companionStats.activeCompanions}\n`;
    report += `- **In Warehouse:** ${companionStats.warehouseCompanions}\n`;
    report += `- **Active Arcs:** ${companionStats.activeArcs}\n`;
    report += `- **Total CP Invested:** ${companionStats.totalCPInvested}\n\n`;

    return report;
  }

  /**
   * Export all data
   */
  exportToJSON(): string {
    return JSON.stringify({
      jumps: JSON.parse(this.jumps.exportToJSON()),
      powers: JSON.parse(this.powers.exportToJSON()),
      warehouse: JSON.parse(this.warehouse.exportToJSON()),
      adapter: JSON.parse(this.adapter.exportToJSON()),
      companions: JSON.parse(this.companions.exportToJSON()),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import all data
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.jumps) this.jumps.importFromJSON(JSON.stringify(data.jumps));
    if (data.powers) this.powers.importFromJSON(JSON.stringify(data.powers));
    if (data.warehouse) this.warehouse.importFromJSON(JSON.stringify(data.warehouse));
    if (data.adapter) this.adapter.importFromJSON(JSON.stringify(data.adapter));
    if (data.companions) this.companions.importFromJSON(JSON.stringify(data.companions));
  }

  /**
   * Clear all data - reinitialize all systems
   */
  clear(): void {
    // Reinitialize all systems
    (this as { jumps: JumpManager }).jumps = new JumpManager('Jumper', 'My Chain');
    (this as { powers: PowerSynergyEngine }).powers = new PowerSynergyEngine();
    this.warehouse.clear();
    this.adapter.clear();
    this.companions.clear();
  }
}

// Default instance
export const jumpchainSuite = new JumpchainSuite();

export default JumpchainSuite;
