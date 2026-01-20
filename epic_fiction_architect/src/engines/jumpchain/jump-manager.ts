/**
 * Epic Fiction Architect - Jump Chain Manager
 *
 * Core system for tracking multi-universe Jumpchain adventures:
 * - Jump sequence and universe tracking
 * - Choice Point (CP) management per jump
 * - Perk, power, and item acquisition
 * - Drawback and scenario handling
 * - Chain failure conditions
 * - Origin/background management per jump
 * - Jump document integration
 *
 * Designed for narratives spanning 100+ jumps across fictional universes.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Status of a jump in the chain
 */
export enum JumpStatus {
  PLANNED = 'planned',           // Not yet started
  ACTIVE = 'active',             // Currently in this jump
  COMPLETED = 'completed',       // Successfully finished
  FAILED = 'failed',             // Chain failure occurred
  SKIPPED = 'skipped',           // Gauntlet/special skip
  PAUSED = 'paused'              // Narrative pause
}

/**
 * Types of jumps
 */
export enum JumpType {
  STANDARD = 'standard',         // Normal 10-year jump
  GAUNTLET = 'gauntlet',         // No powers, special rules
  SUPPLEMENT = 'supplement',     // Body mod, warehouse, etc.
  SCENARIO = 'scenario',         // Special challenge mode
  ENDJUMP = 'endjump',           // Final jump option
  QUICKSILVER = 'quicksilver',   // Short duration jump
  EXTENDED = 'extended'          // Longer than standard
}

/**
 * Origin types (common across many jumps)
 */
export enum OriginType {
  DROP_IN = 'drop_in',           // No background, keep memories
  NATIVE = 'native',             // Born in universe
  REINCARNATION = 'reincarnation', // Reborn with memories
  INSERTION = 'insertion',       // Inserted into existing role
  CUSTOM = 'custom'              // Jump-specific origin
}

/**
 * Acquisition source types
 */
export enum AcquisitionSource {
  PURCHASED = 'purchased',       // Bought with CP
  FREE = 'free',                 // Free with origin/discount
  DRAWBACK = 'drawback',         // Taken as drawback
  SCENARIO = 'scenario',         // Scenario reward
  ITEM = 'item',                 // Item-granted
  COMPANION = 'companion',       // Companion import
  CHAIN_REWARD = 'chain_reward', // Chain-wide reward
  FANWANK = 'fanwank',           // Author fiat
  EARNED = 'earned'              // Earned in-universe
}

/**
 * Perk categories
 */
export enum PerkCategory {
  PHYSICAL = 'physical',         // Body enhancements
  MENTAL = 'mental',             // Mind enhancements
  SOCIAL = 'social',             // Charisma, leadership
  COMBAT = 'combat',             // Fighting abilities
  MAGIC = 'magic',               // Magical abilities
  TECHNOLOGY = 'technology',     // Tech skills/knowledge
  CRAFTING = 'crafting',         // Creation abilities
  SURVIVAL = 'survival',         // Survival skills
  STEALTH = 'stealth',           // Sneaky abilities
  KNOWLEDGE = 'knowledge',       // Information/skills
  META = 'meta',                 // Chain-affecting perks
  UNIQUE = 'unique'              // Setting-specific
}

/**
 * Item rarity/tier
 */
export enum ItemTier {
  MUNDANE = 'mundane',           // Normal items
  UNCOMMON = 'uncommon',         // Slightly special
  RARE = 'rare',                 // Notable items
  EPIC = 'epic',                 // Powerful items
  LEGENDARY = 'legendary',       // Extremely powerful
  ARTIFACT = 'artifact',         // Universe-defining
  CONCEPTUAL = 'conceptual'      // Abstract/meta items
}

/**
 * Chain failure types
 */
export enum ChainFailureType {
  DEATH = 'death',               // Jumper died
  DRAWBACK = 'drawback',         // Failed drawback condition
  SCENARIO = 'scenario',         // Failed scenario
  CHOICE = 'choice',             // Chose to end chain
  CORRUPTION = 'corruption',     // Lost self/turned evil
  TRAPPED = 'trapped'            // Stuck in universe
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * A single jump in the chain
 */
export interface Jump {
  id: string;
  order: number;                 // Position in chain (1, 2, 3...)
  name: string;                  // Jump document name
  universe: string;              // Setting/franchise
  status: JumpStatus;
  type: JumpType;

  // Timing
  duration: number;              // Years (usually 10)
  startChapter?: number;
  endChapter?: number;

  // Build
  origin: JumpOrigin;
  choicePoints: ChoicePointBudget;
  perks: JumpPerk[];
  items: JumpItem[];
  companions: JumpCompanion[];
  drawbacks: JumpDrawback[];

  // Scenarios
  scenarios: JumpScenario[];

  // World details
  worldDetails: {
    powerLevel: string;          // Street, city, continental, planetary, etc.
    dangerLevel: number;         // 1-10
    technologyLevel: string;
    magicLevel: string;
    keyEvents: string[];         // Major canon events
    jumpStartDate?: string;      // In-universe date
    jumpEndDate?: string;
  };

  // Outcomes
  outcomes: {
    majorAccomplishments: string[];
    failedObjectives: string[];
    unintendedConsequences: string[];
    relationshipsFormed: string[];
    enemiesMade: string[];
    secretsLearned: string[];
    powersGained: string[];      // Beyond purchased perks
    powerLimitationsDiscovered: string[];
  };

  // Notes
  buildNotes: string;
  narrativeNotes: string;
  retconNotes: string;

  // Metadata
  documentUrl?: string;
  documentVersion?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Origin selection for a jump
 */
export interface JumpOrigin {
  type: OriginType;
  name: string;
  description: string;
  age?: number;
  gender?: string;
  background?: string;
  location?: string;
  startingResources?: string[];
  freePerks?: string[];          // Perk IDs that are free
  discountedPerks?: string[];    // Perk IDs at half price
  memories: boolean;             // Keep pre-jump memories
  identity: boolean;             // Get new identity
}

/**
 * Choice point budget for a jump
 */
export interface ChoicePointBudget {
  starting: number;              // Base CP (usually 1000)
  fromDrawbacks: number;
  fromScenarios: number;
  fromChainRewards: number;
  spent: number;
  remaining: number;
  stipend?: number;              // Per-year additional CP
}

/**
 * A perk purchased/acquired in a jump
 */
export interface JumpPerk {
  id: string;
  jumpId: string;
  name: string;
  description: string;
  category: PerkCategory;
  cost: number;                  // CP cost (0 if free)
  actualCost: number;            // After discounts
  source: AcquisitionSource;

  // Effects
  effects: string[];
  limitations: string[];
  synergies: string[];           // Other perk IDs it combos with
  scaling: boolean;              // Does it grow with jumper

  // Classification
  isCapstone: boolean;
  isOriginLocked: boolean;
  requiredOrigin?: string;

  // Toggle
  canToggle: boolean;            // Can turn on/off
  isActive: boolean;

  // Narrative
  chapterAcquired?: number;
  firstUsedChapter?: number;
  notableUses: Array<{
    chapter: number;
    description: string;
  }>;

  notes: string;
}

/**
 * An item acquired in a jump
 */
export interface JumpItem {
  id: string;
  jumpId: string;
  name: string;
  description: string;
  tier: ItemTier;
  cost: number;
  actualCost: number;
  source: AcquisitionSource;

  // Properties
  abilities: string[];
  limitations: string[];
  durability: 'indestructible' | 'repairable' | 'consumable' | 'normal';
  returnOnLoss: boolean;         // Returns at end of jump

  // Location
  inWarehouse: boolean;
  currentLocation?: string;

  // Import
  canImport: boolean;            // Can be imported in future jumps
  importCost?: number;

  notes: string;
}

/**
 * A companion in the jump
 */
export interface JumpCompanion {
  id: string;
  globalCompanionId?: string;    // Links to persistent companion
  jumpId: string;
  name: string;
  origin: string;
  source: AcquisitionSource;
  cost: number;

  // Build
  cpBudget: number;              // Their CP to spend
  perks: string[];               // Perk IDs they have
  items: string[];               // Item IDs they have

  // Status
  isActive: boolean;             // Active this jump
  relationship: string;          // friend, lover, minion, etc.

  notes: string;
}

/**
 * A drawback taken in a jump
 */
export interface JumpDrawback {
  id: string;
  jumpId: string;
  name: string;
  description: string;
  cpGained: number;

  // Conditions
  failureConditions: string[];   // What causes chain fail
  successConditions: string[];   // How to survive it
  canBeBoughtOff: boolean;
  buyOffCost?: number;

  // Duration
  duration: 'jump' | 'chain' | 'permanent' | 'until_condition';
  endCondition?: string;

  // Status
  status: 'active' | 'completed' | 'failed' | 'bought_off';

  // Narrative
  impactOnNarrative: string[];
  closeCallChapters: number[];   // Near-failure moments

  notes: string;
}

/**
 * A scenario in the jump
 */
export interface JumpScenario {
  id: string;
  jumpId: string;
  name: string;
  description: string;

  // Rewards
  cpReward: number;
  perkRewards: string[];
  itemRewards: string[];
  otherRewards: string[];

  // Conditions
  objectives: Array<{
    description: string;
    isOptional: boolean;
    isComplete: boolean;
    completedChapter?: number;
  }>;
  failureConditions: string[];

  // Status
  status: 'active' | 'completed' | 'failed' | 'abandoned';

  notes: string;
}

/**
 * Chain-wide state
 */
export interface ChainState {
  id: string;
  name: string;                  // Chain name
  jumperName: string;

  // Progress
  currentJumpIndex: number;
  totalJumps: number;
  status: 'active' | 'completed' | 'failed' | 'paused';

  // Accumulated resources
  warehouseUnlocked: boolean;
  bodyModApplied: boolean;
  totalCPEarned: number;
  totalCPSpent: number;

  // Chain-wide benefits
  chainPerks: ChainPerk[];       // Perks affecting all jumps
  chainDrawbacks: JumpDrawback[]; // Drawbacks lasting all jumps

  // Failure tracking
  deaths: number;
  oneUps: number;                // Extra lives remaining
  failureType?: ChainFailureType;
  failureChapter?: number;
  failureDescription?: string;

  // Settings
  housRules: string[];
  allowedSupplements: string[];
  difficulty: 'easy' | 'standard' | 'hard' | 'nightmare';

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chain-wide perks (from supplements, rewards, etc.)
 */
export interface ChainPerk {
  id: string;
  name: string;
  description: string;
  source: string;                // Which supplement/reward
  effects: string[];
  isActive: boolean;
}

/**
 * Configuration for the jump manager
 */
export interface JumpManagerConfig {
  defaultStartingCP: number;
  defaultJumpDuration: number;
  maxDrawbackCP: number;
  companionImportCost: number;
  enableOneUps: boolean;
  oneUpCount: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: JumpManagerConfig = {
  defaultStartingCP: 1000,
  defaultJumpDuration: 10,
  maxDrawbackCP: 600,
  companionImportCost: 200,
  enableOneUps: true,
  oneUpCount: 1
};

// ============================================================================
// JUMP MANAGER
// ============================================================================

/**
 * Jump Chain Manager
 *
 * Tracks the progression through multiple universes, managing builds,
 * acquisitions, and chain-wide state.
 */
export class JumpManager {
  private config: JumpManagerConfig;
  private jumps: Map<string, Jump> = new Map();
  private chainState: ChainState;

  // Indices
  private jumpsByOrder: Map<number, string> = new Map();
  private jumpsByUniverse: Map<string, string[]> = new Map();
  private perksByJump: Map<string, Map<string, JumpPerk>> = new Map();
  private itemsByJump: Map<string, Map<string, JumpItem>> = new Map();

  constructor(
    jumperName: string,
    chainName: string,
    config?: Partial<JumpManagerConfig>
  ) {
    this.config = { ...defaultConfig, ...config };

    // Initialize chain state
    this.chainState = {
      id: uuidv4(),
      name: chainName,
      jumperName,
      currentJumpIndex: 0,
      totalJumps: 0,
      status: 'active',
      warehouseUnlocked: false,
      bodyModApplied: false,
      totalCPEarned: 0,
      totalCPSpent: 0,
      chainPerks: [],
      chainDrawbacks: [],
      deaths: 0,
      oneUps: this.config.enableOneUps ? this.config.oneUpCount : 0,
      housRules: [],
      allowedSupplements: [],
      difficulty: 'standard',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // ==========================================================================
  // JUMP MANAGEMENT
  // ==========================================================================

  /**
   * Create a new jump
   */
  createJump(data: {
    name: string;
    universe: string;
    type?: JumpType;
    duration?: number;
    startingCP?: number;
    origin: Omit<JumpOrigin, 'freePerks' | 'discountedPerks'> & {
      freePerks?: string[];
      discountedPerks?: string[];
    };
    worldDetails?: Partial<Jump['worldDetails']>;
    documentUrl?: string;
    buildNotes?: string;
  }): Jump {
    const id = uuidv4();
    const now = new Date();
    const order = this.chainState.totalJumps + 1;

    const startingCP = data.startingCP ?? this.config.defaultStartingCP;

    const jump: Jump = {
      id,
      order,
      name: data.name,
      universe: data.universe,
      status: JumpStatus.PLANNED,
      type: data.type ?? JumpType.STANDARD,
      duration: data.duration ?? this.config.defaultJumpDuration,
      origin: {
        ...data.origin,
        freePerks: data.origin.freePerks ?? [],
        discountedPerks: data.origin.discountedPerks ?? []
      },
      choicePoints: {
        starting: startingCP,
        fromDrawbacks: 0,
        fromScenarios: 0,
        fromChainRewards: 0,
        spent: 0,
        remaining: startingCP
      },
      perks: [],
      items: [],
      companions: [],
      drawbacks: [],
      scenarios: [],
      worldDetails: {
        powerLevel: data.worldDetails?.powerLevel ?? 'unknown',
        dangerLevel: data.worldDetails?.dangerLevel ?? 5,
        technologyLevel: data.worldDetails?.technologyLevel ?? 'unknown',
        magicLevel: data.worldDetails?.magicLevel ?? 'unknown',
        keyEvents: data.worldDetails?.keyEvents ?? [],
        jumpStartDate: data.worldDetails?.jumpStartDate,
        jumpEndDate: data.worldDetails?.jumpEndDate
      },
      outcomes: {
        majorAccomplishments: [],
        failedObjectives: [],
        unintendedConsequences: [],
        relationshipsFormed: [],
        enemiesMade: [],
        secretsLearned: [],
        powersGained: [],
        powerLimitationsDiscovered: []
      },
      buildNotes: data.buildNotes ?? '',
      narrativeNotes: '',
      retconNotes: '',
      documentUrl: data.documentUrl,
      createdAt: now,
      updatedAt: now
    };

    this.storeJump(jump);
    this.chainState.totalJumps++;
    this.chainState.totalCPEarned += startingCP;
    this.chainState.updatedAt = now;

    return jump;
  }

  /**
   * Store jump and update indices
   */
  private storeJump(jump: Jump): void {
    this.jumps.set(jump.id, jump);
    this.jumpsByOrder.set(jump.order, jump.id);

    if (!this.jumpsByUniverse.has(jump.universe)) {
      this.jumpsByUniverse.set(jump.universe, []);
    }
    this.jumpsByUniverse.get(jump.universe)!.push(jump.id);

    this.perksByJump.set(jump.id, new Map());
    this.itemsByJump.set(jump.id, new Map());
  }

  /**
   * Get jump by ID
   */
  getJump(id: string): Jump | undefined {
    return this.jumps.get(id);
  }

  /**
   * Get jump by order
   */
  getJumpByOrder(order: number): Jump | undefined {
    const id = this.jumpsByOrder.get(order);
    return id ? this.jumps.get(id) : undefined;
  }

  /**
   * Get current jump
   */
  getCurrentJump(): Jump | undefined {
    return this.getJumpByOrder(this.chainState.currentJumpIndex);
  }

  /**
   * Get all jumps
   */
  getAllJumps(): Jump[] {
    return Array.from(this.jumps.values())
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Start a jump
   */
  startJump(jumpId: string, startChapter: number): boolean {
    const jump = this.jumps.get(jumpId);
    if (!jump || jump.status !== JumpStatus.PLANNED) return false;

    jump.status = JumpStatus.ACTIVE;
    jump.startChapter = startChapter;
    this.chainState.currentJumpIndex = jump.order;
    jump.updatedAt = new Date();

    return true;
  }

  /**
   * Complete a jump
   */
  completeJump(jumpId: string, endChapter: number): boolean {
    const jump = this.jumps.get(jumpId);
    if (!jump || jump.status !== JumpStatus.ACTIVE) return false;

    jump.status = JumpStatus.COMPLETED;
    jump.endChapter = endChapter;
    jump.updatedAt = new Date();

    return true;
  }

  /**
   * Fail the chain
   */
  failChain(
    failureType: ChainFailureType,
    chapter: number,
    description: string
  ): boolean {
    // Check for one-ups
    if (failureType === ChainFailureType.DEATH && this.chainState.oneUps > 0) {
      this.chainState.oneUps--;
      this.chainState.deaths++;
      this.chainState.updatedAt = new Date();
      return false; // Chain continues
    }

    // Actually fail
    this.chainState.status = 'failed';
    this.chainState.failureType = failureType;
    this.chainState.failureChapter = chapter;
    this.chainState.failureDescription = description;
    this.chainState.updatedAt = new Date();

    const currentJump = this.getCurrentJump();
    if (currentJump) {
      currentJump.status = JumpStatus.FAILED;
      currentJump.updatedAt = new Date();
    }

    return true;
  }

  // ==========================================================================
  // PERK MANAGEMENT
  // ==========================================================================

  /**
   * Add a perk to a jump
   */
  addPerk(
    jumpId: string,
    data: {
      name: string;
      description: string;
      category: PerkCategory;
      cost: number;
      source?: AcquisitionSource;
      effects?: string[];
      limitations?: string[];
      isCapstone?: boolean;
      isOriginLocked?: boolean;
      requiredOrigin?: string;
      canToggle?: boolean;
      scaling?: boolean;
      notes?: string;
    }
  ): JumpPerk | undefined {
    const jump = this.jumps.get(jumpId);
    if (!jump) return undefined;

    const id = uuidv4();

    // Calculate actual cost
    let actualCost = data.cost;
    const source = data.source ?? AcquisitionSource.PURCHASED;

    if (source === AcquisitionSource.FREE) {
      actualCost = 0;
    } else if (jump.origin.discountedPerks?.includes(data.name)) {
      actualCost = Math.floor(data.cost / 2);
    }

    // Check budget
    if (actualCost > jump.choicePoints.remaining) {
      return undefined; // Can't afford
    }

    const perk: JumpPerk = {
      id,
      jumpId,
      name: data.name,
      description: data.description,
      category: data.category,
      cost: data.cost,
      actualCost,
      source,
      effects: data.effects ?? [],
      limitations: data.limitations ?? [],
      synergies: [],
      scaling: data.scaling ?? false,
      isCapstone: data.isCapstone ?? false,
      isOriginLocked: data.isOriginLocked ?? false,
      requiredOrigin: data.requiredOrigin,
      canToggle: data.canToggle ?? false,
      isActive: true,
      notableUses: [],
      notes: data.notes ?? ''
    };

    // Update budget
    jump.choicePoints.spent += actualCost;
    jump.choicePoints.remaining -= actualCost;
    this.chainState.totalCPSpent += actualCost;

    // Store
    jump.perks.push(perk);
    this.perksByJump.get(jumpId)!.set(id, perk);
    jump.updatedAt = new Date();

    return perk;
  }

  /**
   * Get all perks for a jump
   */
  getPerksForJump(jumpId: string): JumpPerk[] {
    const jump = this.jumps.get(jumpId);
    return jump?.perks ?? [];
  }

  /**
   * Get all perks across chain
   */
  getAllPerks(): JumpPerk[] {
    const perks: JumpPerk[] = [];
    for (const jump of this.jumps.values()) {
      perks.push(...jump.perks);
    }
    return perks;
  }

  /**
   * Get perks by category across chain
   */
  getPerksByCategory(category: PerkCategory): JumpPerk[] {
    return this.getAllPerks().filter(p => p.category === category);
  }

  /**
   * Record a notable use of a perk
   */
  recordPerkUse(
    perkId: string,
    chapter: number,
    description: string
  ): void {
    for (const perkMap of this.perksByJump.values()) {
      const perk = perkMap.get(perkId);
      if (perk) {
        if (!perk.firstUsedChapter) {
          perk.firstUsedChapter = chapter;
        }
        perk.notableUses.push({ chapter, description });
        return;
      }
    }
  }

  // ==========================================================================
  // ITEM MANAGEMENT
  // ==========================================================================

  /**
   * Add an item to a jump
   */
  addItem(
    jumpId: string,
    data: {
      name: string;
      description: string;
      tier: ItemTier;
      cost: number;
      source?: AcquisitionSource;
      abilities?: string[];
      limitations?: string[];
      durability?: JumpItem['durability'];
      returnOnLoss?: boolean;
      canImport?: boolean;
      importCost?: number;
      notes?: string;
    }
  ): JumpItem | undefined {
    const jump = this.jumps.get(jumpId);
    if (!jump) return undefined;

    const id = uuidv4();
    const source = data.source ?? AcquisitionSource.PURCHASED;

    // Calculate actual cost
    let actualCost = data.cost;
    if (source === AcquisitionSource.FREE) {
      actualCost = 0;
    }

    // Check budget
    if (actualCost > jump.choicePoints.remaining) {
      return undefined;
    }

    const item: JumpItem = {
      id,
      jumpId,
      name: data.name,
      description: data.description,
      tier: data.tier,
      cost: data.cost,
      actualCost,
      source,
      abilities: data.abilities ?? [],
      limitations: data.limitations ?? [],
      durability: data.durability ?? 'normal',
      returnOnLoss: data.returnOnLoss ?? false,
      inWarehouse: false,
      canImport: data.canImport ?? true,
      importCost: data.importCost,
      notes: data.notes ?? ''
    };

    // Update budget
    jump.choicePoints.spent += actualCost;
    jump.choicePoints.remaining -= actualCost;
    this.chainState.totalCPSpent += actualCost;

    // Store
    jump.items.push(item);
    this.itemsByJump.get(jumpId)!.set(id, item);
    jump.updatedAt = new Date();

    return item;
  }

  /**
   * Get all items for a jump
   */
  getItemsForJump(jumpId: string): JumpItem[] {
    const jump = this.jumps.get(jumpId);
    return jump?.items ?? [];
  }

  /**
   * Get all items across chain
   */
  getAllItems(): JumpItem[] {
    const items: JumpItem[] = [];
    for (const jump of this.jumps.values()) {
      items.push(...jump.items);
    }
    return items;
  }

  /**
   * Move item to warehouse
   */
  storeInWarehouse(itemId: string): boolean {
    if (!this.chainState.warehouseUnlocked) return false;

    for (const jump of this.jumps.values()) {
      const item = jump.items.find(i => i.id === itemId);
      if (item) {
        item.inWarehouse = true;
        item.currentLocation = 'Cosmic Warehouse';
        return true;
      }
    }
    return false;
  }

  // ==========================================================================
  // DRAWBACK MANAGEMENT
  // ==========================================================================

  /**
   * Add a drawback to a jump
   */
  addDrawback(
    jumpId: string,
    data: {
      name: string;
      description: string;
      cpGained: number;
      failureConditions?: string[];
      successConditions?: string[];
      canBeBoughtOff?: boolean;
      buyOffCost?: number;
      duration?: JumpDrawback['duration'];
      endCondition?: string;
      impactOnNarrative?: string[];
      notes?: string;
    }
  ): JumpDrawback | undefined {
    const jump = this.jumps.get(jumpId);
    if (!jump) return undefined;

    // Check max drawback CP
    if (jump.choicePoints.fromDrawbacks + data.cpGained > this.config.maxDrawbackCP) {
      return undefined;
    }

    const id = uuidv4();

    const drawback: JumpDrawback = {
      id,
      jumpId,
      name: data.name,
      description: data.description,
      cpGained: data.cpGained,
      failureConditions: data.failureConditions ?? [],
      successConditions: data.successConditions ?? [],
      canBeBoughtOff: data.canBeBoughtOff ?? false,
      buyOffCost: data.buyOffCost,
      duration: data.duration ?? 'jump',
      endCondition: data.endCondition,
      status: 'active',
      impactOnNarrative: data.impactOnNarrative ?? [],
      closeCallChapters: [],
      notes: data.notes ?? ''
    };

    // Update budget
    jump.choicePoints.fromDrawbacks += data.cpGained;
    jump.choicePoints.remaining += data.cpGained;
    this.chainState.totalCPEarned += data.cpGained;

    // Add to chain drawbacks if permanent
    if (data.duration === 'chain' || data.duration === 'permanent') {
      this.chainState.chainDrawbacks.push(drawback);
    }

    // Store
    jump.drawbacks.push(drawback);
    jump.updatedAt = new Date();

    return drawback;
  }

  /**
   * Complete a drawback successfully
   */
  completeDrawback(drawbackId: string): boolean {
    for (const jump of this.jumps.values()) {
      const drawback = jump.drawbacks.find(d => d.id === drawbackId);
      if (drawback && drawback.status === 'active') {
        drawback.status = 'completed';
        return true;
      }
    }
    return false;
  }

  /**
   * Fail a drawback (potentially chain failure)
   */
  failDrawback(drawbackId: string, chapter: number): boolean {
    for (const jump of this.jumps.values()) {
      const drawback = jump.drawbacks.find(d => d.id === drawbackId);
      if (drawback && drawback.status === 'active') {
        drawback.status = 'failed';

        // Check if this causes chain failure
        if (drawback.failureConditions.length > 0) {
          return this.failChain(
            ChainFailureType.DRAWBACK,
            chapter,
            `Failed drawback: ${drawback.name}`
          );
        }
        return false;
      }
    }
    return false;
  }

  /**
   * Record a close call with a drawback
   */
  recordCloseCall(drawbackId: string, chapter: number): void {
    for (const jump of this.jumps.values()) {
      const drawback = jump.drawbacks.find(d => d.id === drawbackId);
      if (drawback) {
        drawback.closeCallChapters.push(chapter);
        return;
      }
    }
  }

  // ==========================================================================
  // COMPANION MANAGEMENT
  // ==========================================================================

  /**
   * Add a companion to a jump
   */
  addCompanion(
    jumpId: string,
    data: {
      name: string;
      origin: string;
      cost: number;
      source?: AcquisitionSource;
      cpBudget?: number;
      relationship?: string;
      globalCompanionId?: string;
      notes?: string;
    }
  ): JumpCompanion | undefined {
    const jump = this.jumps.get(jumpId);
    if (!jump) return undefined;

    const id = uuidv4();
    const source = data.source ?? AcquisitionSource.PURCHASED;

    const actualCost = source === AcquisitionSource.FREE ? 0 : data.cost;

    if (actualCost > jump.choicePoints.remaining) {
      return undefined;
    }

    const companion: JumpCompanion = {
      id,
      globalCompanionId: data.globalCompanionId,
      jumpId,
      name: data.name,
      origin: data.origin,
      source,
      cost: actualCost,
      cpBudget: data.cpBudget ?? 0,
      perks: [],
      items: [],
      isActive: true,
      relationship: data.relationship ?? 'companion',
      notes: data.notes ?? ''
    };

    // Update budget
    jump.choicePoints.spent += actualCost;
    jump.choicePoints.remaining -= actualCost;
    this.chainState.totalCPSpent += actualCost;

    // Store
    jump.companions.push(companion);
    jump.updatedAt = new Date();

    return companion;
  }

  /**
   * Import a companion to a new jump
   */
  importCompanion(
    targetJumpId: string,
    globalCompanionId: string,
    name: string
  ): JumpCompanion | undefined {
    return this.addCompanion(targetJumpId, {
      name,
      origin: 'Import',
      cost: this.config.companionImportCost,
      source: AcquisitionSource.COMPANION,
      globalCompanionId
    });
  }

  // ==========================================================================
  // SCENARIO MANAGEMENT
  // ==========================================================================

  /**
   * Add a scenario to a jump
   */
  addScenario(
    jumpId: string,
    data: {
      name: string;
      description: string;
      cpReward?: number;
      objectives?: Array<{
        description: string;
        isOptional?: boolean;
      }>;
      perkRewards?: string[];
      itemRewards?: string[];
      otherRewards?: string[];
      failureConditions?: string[];
      notes?: string;
    }
  ): JumpScenario | undefined {
    const jump = this.jumps.get(jumpId);
    if (!jump) return undefined;

    const id = uuidv4();

    const scenario: JumpScenario = {
      id,
      jumpId,
      name: data.name,
      description: data.description,
      cpReward: data.cpReward ?? 0,
      perkRewards: data.perkRewards ?? [],
      itemRewards: data.itemRewards ?? [],
      otherRewards: data.otherRewards ?? [],
      objectives: (data.objectives ?? []).map(obj => ({
        description: obj.description,
        isOptional: obj.isOptional ?? false,
        isComplete: false
      })),
      failureConditions: data.failureConditions ?? [],
      status: 'active',
      notes: data.notes ?? ''
    };

    jump.scenarios.push(scenario);
    jump.updatedAt = new Date();

    return scenario;
  }

  /**
   * Complete a scenario objective
   */
  completeObjective(
    scenarioId: string,
    objectiveIndex: number,
    chapter: number
  ): boolean {
    for (const jump of this.jumps.values()) {
      const scenario = jump.scenarios.find(s => s.id === scenarioId);
      if (scenario && scenario.objectives[objectiveIndex]) {
        scenario.objectives[objectiveIndex].isComplete = true;
        scenario.objectives[objectiveIndex].completedChapter = chapter;

        // Check if all required objectives complete
        const requiredComplete = scenario.objectives
          .filter(o => !o.isOptional)
          .every(o => o.isComplete);

        if (requiredComplete) {
          scenario.status = 'completed';

          // Award rewards
          jump.choicePoints.fromScenarios += scenario.cpReward;
          jump.choicePoints.remaining += scenario.cpReward;
          this.chainState.totalCPEarned += scenario.cpReward;
        }

        return true;
      }
    }
    return false;
  }

  // ==========================================================================
  // CHAIN STATE MANAGEMENT
  // ==========================================================================

  /**
   * Get chain state
   */
  getChainState(): ChainState {
    return { ...this.chainState };
  }

  /**
   * Update chain state
   */
  updateChainState(updates: Partial<ChainState>): void {
    Object.assign(this.chainState, updates);
    this.chainState.updatedAt = new Date();
  }

  /**
   * Unlock warehouse
   */
  unlockWarehouse(): void {
    this.chainState.warehouseUnlocked = true;
    this.chainState.updatedAt = new Date();
  }

  /**
   * Apply body mod
   */
  applyBodyMod(): void {
    this.chainState.bodyModApplied = true;
    this.chainState.updatedAt = new Date();
  }

  /**
   * Add chain perk
   */
  addChainPerk(perk: Omit<ChainPerk, 'id'>): ChainPerk {
    const newPerk: ChainPerk = {
      ...perk,
      id: uuidv4()
    };
    this.chainState.chainPerks.push(newPerk);
    this.chainState.updatedAt = new Date();
    return newPerk;
  }

  /**
   * Add house rule
   */
  addHouseRule(rule: string): void {
    this.chainState.housRules.push(rule);
    this.chainState.updatedAt = new Date();
  }

  // ==========================================================================
  // QUERIES
  // ==========================================================================

  /**
   * Get jumps by universe
   */
  getJumpsByUniverse(universe: string): Jump[] {
    const ids = this.jumpsByUniverse.get(universe);
    if (!ids) return [];
    return ids.map(id => this.jumps.get(id)!).filter(Boolean);
  }

  /**
   * Get active drawbacks
   */
  getActiveDrawbacks(): JumpDrawback[] {
    const drawbacks: JumpDrawback[] = [];
    for (const jump of this.jumps.values()) {
      for (const drawback of jump.drawbacks) {
        if (drawback.status === 'active') {
          drawbacks.push(drawback);
        }
      }
    }
    return drawbacks;
  }

  /**
   * Get total CP spent
   */
  getTotalCPStats(): {
    totalEarned: number;
    totalSpent: number;
    perksSpent: number;
    itemsSpent: number;
    companionsSpent: number;
    remaining: number;
  } {
    let perksSpent = 0;
    let itemsSpent = 0;
    let companionsSpent = 0;

    for (const jump of this.jumps.values()) {
      perksSpent += jump.perks.reduce((sum, p) => sum + p.actualCost, 0);
      itemsSpent += jump.items.reduce((sum, i) => sum + i.actualCost, 0);
      companionsSpent += jump.companions.reduce((sum, c) => sum + c.cost, 0);
    }

    return {
      totalEarned: this.chainState.totalCPEarned,
      totalSpent: this.chainState.totalCPSpent,
      perksSpent,
      itemsSpent,
      companionsSpent,
      remaining: this.chainState.totalCPEarned - this.chainState.totalCPSpent
    };
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    totalJumps: number;
    completedJumps: number;
    totalPerks: number;
    totalItems: number;
    totalCompanions: number;
    totalDrawbacks: number;
    activeDrawbacks: number;
    cpStats: ReturnType<JumpManager['getTotalCPStats']>;
    perksByCategory: Record<string, number>;
    itemsByTier: Record<string, number>;
    jumpsByType: Record<string, number>;
  } {
    const jumps = Array.from(this.jumps.values());
    const perks = this.getAllPerks();
    const items = this.getAllItems();
    const drawbacks = this.getActiveDrawbacks();

    const perksByCategory: Record<string, number> = {};
    for (const perk of perks) {
      perksByCategory[perk.category] = (perksByCategory[perk.category] ?? 0) + 1;
    }

    const itemsByTier: Record<string, number> = {};
    for (const item of items) {
      itemsByTier[item.tier] = (itemsByTier[item.tier] ?? 0) + 1;
    }

    const jumpsByType: Record<string, number> = {};
    for (const jump of jumps) {
      jumpsByType[jump.type] = (jumpsByType[jump.type] ?? 0) + 1;
    }

    let totalCompanions = 0;
    let totalDrawbacks = 0;
    for (const jump of jumps) {
      totalCompanions += jump.companions.length;
      totalDrawbacks += jump.drawbacks.length;
    }

    return {
      totalJumps: jumps.length,
      completedJumps: jumps.filter(j => j.status === JumpStatus.COMPLETED).length,
      totalPerks: perks.length,
      totalItems: items.length,
      totalCompanions,
      totalDrawbacks,
      activeDrawbacks: drawbacks.length,
      cpStats: this.getTotalCPStats(),
      perksByCategory,
      itemsByTier,
      jumpsByType
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
      chainState: this.chainState,
      jumps: Array.from(this.jumps.values()),
      config: this.config,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.config) {
      this.config = { ...defaultConfig, ...data.config };
    }

    if (data.chainState) {
      this.chainState = {
        ...data.chainState,
        createdAt: new Date(data.chainState.createdAt),
        updatedAt: new Date(data.chainState.updatedAt)
      };
    }

    if (data.jumps) {
      this.jumps.clear();
      this.jumpsByOrder.clear();
      this.jumpsByUniverse.clear();
      this.perksByJump.clear();
      this.itemsByJump.clear();

      for (const jump of data.jumps) {
        jump.createdAt = new Date(jump.createdAt);
        jump.updatedAt = new Date(jump.updatedAt);
        this.storeJump(jump);

        // Rebuild perk/item indices
        for (const perk of jump.perks) {
          this.perksByJump.get(jump.id)!.set(perk.id, perk);
        }
        for (const item of jump.items) {
          this.itemsByJump.get(jump.id)!.set(item.id, item);
        }
      }
    }
  }
}

export default JumpManager;
