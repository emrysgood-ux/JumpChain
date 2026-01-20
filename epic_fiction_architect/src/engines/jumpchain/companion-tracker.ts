/**
 * Companion Tracker - Companion Development Across Jumps
 *
 * In Jumpchain, companions are characters who travel with the Jumper across
 * universes. They can be purchased, imported from previous jumps, or recruited
 * locally. This system tracks:
 * - Companion acquisition and origin
 * - Companion builds (perks, items, powers given)
 * - Character development across jumps
 * - Relationships with Jumper and other companions
 * - Power growth and synchronization
 * - Companion-specific storylines and arcs
 *
 * Companions are not just followers - they're characters with their own journeys.
 */

import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// ENUMS
// =============================================================================

/**
 * How a companion was acquired
 */
export enum CompanionOrigin {
  PURCHASED = 'purchased',           // Bought with CP
  IMPORTED = 'imported',             // From previous jump
  RECRUITED = 'recruited',           // Convinced to join in-universe
  CANON_COMPANION = 'canon_companion', // Pre-existing companion option
  JUMP_START = 'jump_start',         // Started the chain with Jumper
  RESCUED = 'rescued',               // Saved and joined
  ROMANTIC = 'romantic',             // Romance option
  CREATED = 'created',               // Created by Jumper
  SUMMONED = 'summoned',             // Magically/mechanically summoned
  OTHER = 'other'
}

/**
 * Companion status
 */
export enum CompanionStatus {
  ACTIVE = 'active',                 // Currently traveling with Jumper
  WAREHOUSE = 'warehouse',           // In the warehouse
  ORIGIN_WORLD = 'origin_world',     // Stayed in their home world
  INDEPENDENT = 'independent',       // Left but still ally
  LOST = 'lost',                     // Lost during a jump
  DECEASED = 'deceased',             // Died (may be resurrectable)
  ASCENDED = 'ascended',             // Transcended to higher plane
  ENEMY = 'enemy',                   // Turned against Jumper
  SEALED = 'sealed',                 // Sealed/imprisoned
  UNKNOWN = 'unknown'
}

/**
 * Companion role in the party
 */
export enum CompanionRole {
  COMBAT = 'combat',
  SUPPORT = 'support',
  HEALER = 'healer',
  TANK = 'tank',
  SPECIALIST = 'specialist',
  CRAFTING = 'crafting',
  SOCIAL = 'social',
  INTELLIGENCE = 'intelligence',
  LOGISTICS = 'logistics',
  MENTOR = 'mentor',
  STUDENT = 'student',
  PARTNER = 'partner',              // Equal co-protagonist
  GENERAL = 'general'
}

/**
 * Relationship type with Jumper
 */
export enum RelationshipType {
  ROMANTIC_PARTNER = 'romantic_partner',
  SPOUSE = 'spouse',
  BEST_FRIEND = 'best_friend',
  CLOSE_FRIEND = 'close_friend',
  FRIEND = 'friend',
  ALLY = 'ally',
  PROFESSIONAL = 'professional',
  STUDENT = 'student',
  MENTOR = 'mentor',
  FAMILY = 'family',
  ADOPTED_FAMILY = 'adopted_family',
  COMPLICATED = 'complicated',
  STRAINED = 'strained',
  NEUTRAL = 'neutral'
}

/**
 * Character development arc types
 */
export enum ArcType {
  GROWTH = 'growth',                 // Becoming stronger/better
  REDEMPTION = 'redemption',         // Overcoming past mistakes
  DISCOVERY = 'discovery',           // Finding identity/purpose
  OVERCOMING = 'overcoming',         // Defeating personal demons
  ROMANCE = 'romance',               // Love story
  RIVALRY = 'rivalry',               // Friendly competition
  LEADERSHIP = 'leadership',         // Learning to lead
  ACCEPTANCE = 'acceptance',         // Accepting oneself/fate
  INDEPENDENCE = 'independence',     // Becoming self-reliant
  BELONGING = 'belonging',           // Finding a place
  MASTERY = 'mastery',               // Mastering abilities
  SACRIFICE = 'sacrifice',           // Learning to sacrifice
  CUSTOM = 'custom'
}

/**
 * Build allocation method for imported companions
 */
export enum BuildMethod {
  STANDARD = 'standard',             // Gets normal companion stipend
  JUMPER_BUILD = 'jumper_build',     // Uses Jumper's unused CP
  SHARED_POOL = 'shared_pool',       // Draws from shared companion pool
  CUSTOM_AMOUNT = 'custom_amount',   // Specific CP amount
  NO_BUILD = 'no_build'              // No additional purchases
}

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Main companion data
 */
export interface Companion {
  id: string;
  name: string;
  aliases: string[];
  description: string;

  // Origin
  origin: CompanionOrigin;
  originJumpId: string;              // Jump where acquired
  originUniverseName: string;
  originalRole: string;              // What they were before joining
  acquisitionChapter: number;
  acquisitionCost: number;           // CP spent to acquire

  // Status
  status: CompanionStatus;
  currentLocation: string;
  lastActiveChapter: number;

  // Role
  primaryRole: CompanionRole;
  secondaryRoles: CompanionRole[];

  // Relationship
  relationshipWithJumper: RelationshipType;
  relationshipStrength: number;      // 0-100
  relationshipHistory: RelationshipEvent[];

  // Identity
  species: string;
  age: number | 'immortal' | 'unknown';
  gender: string;
  personality: string[];
  coreValues: string[];
  flaws: string[];
  goals: string[];

  // Meta
  isFromFiction: boolean;            // Canon character vs OC
  canonSourceMaterial?: string;
  notes: string;
}

/**
 * Relationship change event
 */
export interface RelationshipEvent {
  id: string;
  chapter: number;
  jumpId: string;
  previousType: RelationshipType;
  newType: RelationshipType;
  previousStrength: number;
  newStrength: number;
  cause: string;
  description: string;
  isSignificant: boolean;
}

/**
 * Companion's purchased perks/items
 */
export interface CompanionBuild {
  id: string;
  companionId: string;
  jumpId: string;
  jumpName: string;
  chapter: number;

  // Budget
  cpAvailable: number;
  cpSpent: number;
  buildMethod: BuildMethod;

  // Purchases
  perks: CompanionPerk[];
  items: CompanionItem[];
  drawbacks: CompanionDrawback[];

  // Origin/Background
  selectedOrigin?: string;
  selectedBackground?: string;
  originPerks: string[];

  notes: string;
}

/**
 * Perk purchased for companion
 */
export interface CompanionPerk {
  id: string;
  name: string;
  description: string;
  cpCost: number;
  source: string;                    // Which jump
  tier: number;
  isOriginPerk: boolean;
  synergiesWith: string[];           // Other perk IDs
  notes: string;
}

/**
 * Item given to companion
 */
export interface CompanionItem {
  id: string;
  name: string;
  description: string;
  cpCost: number;
  source: string;
  isGiftFromJumper: boolean;         // Was this given by Jumper or purchased?
  isSignature: boolean;              // Iconic item for this companion
  notes: string;
}

/**
 * Drawback taken for companion
 */
export interface CompanionDrawback {
  id: string;
  name: string;
  description: string;
  cpGain: number;
  source: string;
  isResolved: boolean;
  resolvedChapter?: number;
  notes: string;
}

/**
 * Character development arc
 */
export interface CharacterArc {
  id: string;
  companionId: string;
  type: ArcType;
  name: string;
  description: string;

  // Timeline
  startChapter: number;
  startJumpId: string;
  currentPhase: number;              // 0-100 progress
  estimatedEndChapter?: number;
  actualEndChapter?: number;
  isComplete: boolean;

  // Story
  incitingIncident: string;
  goal: string;
  obstacles: string[];
  milestones: ArcMilestone[];
  climax?: string;
  resolution?: string;

  // Character change
  startingState: string;
  targetState: string;
  currentState: string;

  // Related
  relatedCharacters: string[];       // Companion IDs
  keyChapters: number[];

  notes: string;
}

/**
 * Milestone in character arc
 */
export interface ArcMilestone {
  id: string;
  chapter: number;
  jumpId: string;
  description: string;
  characterChange: string;
  isReached: boolean;
  sceneId?: string;
}

/**
 * Power/ability growth tracking
 */
export interface CompanionPowerGrowth {
  id: string;
  companionId: string;

  // Power level tracking
  powerLevelByJump: Map<string, number>; // jumpId -> level
  currentPowerLevel: number;            // 0-10 scale
  peakPowerLevel: number;

  // Specific abilities
  abilities: CompanionAbility[];

  // Growth rate
  averageGrowthPerJump: number;
  totalJumpsParticipated: number;
  jumpsAsActive: number;

  // Synergies
  synergyWithJumper: number;            // 0-100
  synergyAbilities: string[];

  lastUpdated: number;
}

/**
 * Individual ability tracking
 */
export interface CompanionAbility {
  id: string;
  name: string;
  source: string;                       // Jump/perk that gave it
  sourceChapter: number;

  // Level
  currentLevel: number;                 // 0-100 mastery
  maxPotential: number;                 // 0-100 max they can reach
  growthRate: number;                   // Per-chapter improvement

  // Usage
  timesUsed: number;
  lastUsedChapter: number;
  signatureUses: string[];              // Notable moments

  // Integration
  synergyWith: string[];                // Other ability IDs
  combinedWith: string[];               // Abilities it merges with

  notes: string;
}

/**
 * Companion interaction record
 */
export interface CompanionInteraction {
  id: string;
  companionIds: string[];               // Who was involved
  chapter: number;
  jumpId: string;

  // Type
  type: 'bonding' | 'conflict' | 'collaboration' | 'training' | 'rescue' | 'betrayal' | 'reconciliation' | 'other';
  description: string;

  // Effects
  relationshipChanges: {
    companionId: string;
    targetId: string;                   // 'jumper' or companion ID
    change: number;                     // -100 to +100
  }[];

  // Outcomes
  outcomes: string[];
  ledToArc?: string;                    // Arc ID if this started something

  significance: 'minor' | 'moderate' | 'major' | 'pivotal';
  notes: string;
}

/**
 * Companion summary for a specific jump
 */
export interface JumpCompanionSummary {
  jumpId: string;
  jumpName: string;
  chapter: number;

  // Participation
  activeCompanions: string[];           // IDs
  warehouseCompanions: string[];
  newCompanions: string[];              // Acquired this jump

  // Builds
  totalCPSpent: number;
  buildsCompleted: string[];            // Build IDs

  // Development
  arcsProgressed: string[];             // Arc IDs
  significantMoments: string[];

  // Status changes
  statusChanges: {
    companionId: string;
    from: CompanionStatus;
    to: CompanionStatus;
    reason: string;
  }[];

  notes: string;
}

/**
 * Companion tracker configuration
 */
export interface CompanionTrackerConfig {
  defaultBuildMethod: BuildMethod;
  defaultCompanionStipend: number;
  trackPowerLevels: boolean;
  autoAdvanceArcs: boolean;
  maxActiveCompanions: number | 'unlimited';
}

// =============================================================================
// COMPANION TRACKER CLASS
// =============================================================================

export class CompanionTracker {
  // Core data
  private companions: Map<string, Companion> = new Map();
  private builds: Map<string, CompanionBuild> = new Map();
  private arcs: Map<string, CharacterArc> = new Map();
  private powerGrowth: Map<string, CompanionPowerGrowth> = new Map();
  private interactions: CompanionInteraction[] = [];
  private jumpSummaries: Map<string, JumpCompanionSummary> = new Map();

  // Indexes
  private companionsByStatus: Map<CompanionStatus, Set<string>> = new Map();
  private companionsByOrigin: Map<string, Set<string>> = new Map();
  private buildsByCompanion: Map<string, Set<string>> = new Map();
  private arcsByCompanion: Map<string, Set<string>> = new Map();

  // Configuration
  private config: CompanionTrackerConfig = {
    defaultBuildMethod: BuildMethod.STANDARD,
    defaultCompanionStipend: 300,        // Most jumps give 300 CP
    trackPowerLevels: true,
    autoAdvanceArcs: true,
    maxActiveCompanions: 8
  };

  constructor() {
    // Initialize status index
    for (const status of Object.values(CompanionStatus)) {
      this.companionsByStatus.set(status, new Set());
    }
  }

  // ===========================================================================
  // COMPANION MANAGEMENT
  // ===========================================================================

  /**
   * Add a new companion
   */
  addCompanion(data: Omit<Companion, 'id' | 'relationshipHistory'>): Companion {
    const id = uuidv4();
    const companion: Companion = {
      ...data,
      id,
      relationshipHistory: []
    };

    this.companions.set(id, companion);

    // Update indexes
    const statusSet = this.companionsByStatus.get(companion.status) || new Set();
    statusSet.add(id);
    this.companionsByStatus.set(companion.status, statusSet);

    const originSet = this.companionsByOrigin.get(companion.originJumpId) || new Set();
    originSet.add(id);
    this.companionsByOrigin.set(companion.originJumpId, originSet);

    // Initialize power growth tracking
    if (this.config.trackPowerLevels) {
      this.initializePowerGrowth(id);
    }

    return companion;
  }

  /**
   * Get a companion by ID
   */
  getCompanion(id: string): Companion | undefined {
    return this.companions.get(id);
  }

  /**
   * Get companion by name
   */
  findCompanionByName(name: string): Companion | undefined {
    return Array.from(this.companions.values())
      .find(c => c.name.toLowerCase() === name.toLowerCase() ||
                 c.aliases.some(a => a.toLowerCase() === name.toLowerCase()));
  }

  /**
   * Get all companions with a specific status
   */
  getCompanionsByStatus(status: CompanionStatus): Companion[] {
    const ids = this.companionsByStatus.get(status) || new Set();
    return Array.from(ids)
      .map(id => this.companions.get(id))
      .filter((c): c is Companion => c !== undefined);
  }

  /**
   * Get active companions (traveling with Jumper)
   */
  getActiveCompanions(): Companion[] {
    return this.getCompanionsByStatus(CompanionStatus.ACTIVE);
  }

  /**
   * Update companion status
   */
  updateCompanionStatus(
    companionId: string,
    newStatus: CompanionStatus,
    chapter: number,
    _reason: string
  ): boolean {
    const companion = this.companions.get(companionId);
    if (!companion) return false;

    const oldStatus = companion.status;

    // Update indexes
    const oldSet = this.companionsByStatus.get(oldStatus);
    if (oldSet) {
      oldSet.delete(companionId);
    }

    const newSet = this.companionsByStatus.get(newStatus) || new Set();
    newSet.add(companionId);
    this.companionsByStatus.set(newStatus, newSet);

    companion.status = newStatus;
    companion.lastActiveChapter = chapter;

    return true;
  }

  /**
   * Update relationship with Jumper
   */
  updateRelationship(
    companionId: string,
    newType: RelationshipType,
    strengthDelta: number,
    chapter: number,
    jumpId: string,
    cause: string,
    description: string
  ): void {
    const companion = this.companions.get(companionId);
    if (!companion) return;

    const event: RelationshipEvent = {
      id: uuidv4(),
      chapter,
      jumpId,
      previousType: companion.relationshipWithJumper,
      newType,
      previousStrength: companion.relationshipStrength,
      newStrength: Math.max(0, Math.min(100, companion.relationshipStrength + strengthDelta)),
      cause,
      description,
      isSignificant: Math.abs(strengthDelta) >= 10 ||
        newType !== companion.relationshipWithJumper
    };

    companion.relationshipHistory.push(event);
    companion.relationshipWithJumper = newType;
    companion.relationshipStrength = event.newStrength;
  }

  // ===========================================================================
  // BUILD MANAGEMENT
  // ===========================================================================

  /**
   * Create a build for a companion in a jump
   */
  createBuild(data: Omit<CompanionBuild, 'id' | 'perks' | 'items' | 'drawbacks'>): CompanionBuild {
    const id = uuidv4();
    const build: CompanionBuild = {
      ...data,
      id,
      perks: [],
      items: [],
      drawbacks: []
    };

    this.builds.set(id, build);

    // Update index
    const compSet = this.buildsByCompanion.get(data.companionId) || new Set();
    compSet.add(id);
    this.buildsByCompanion.set(data.companionId, compSet);

    return build;
  }

  /**
   * Get build for companion in a specific jump
   */
  getBuild(companionId: string, jumpId: string): CompanionBuild | undefined {
    const buildIds = this.buildsByCompanion.get(companionId);
    if (!buildIds) return undefined;

    for (const id of buildIds) {
      const build = this.builds.get(id);
      if (build && build.jumpId === jumpId) {
        return build;
      }
    }

    return undefined;
  }

  /**
   * Get all builds for a companion
   */
  getCompanionBuilds(companionId: string): CompanionBuild[] {
    const ids = this.buildsByCompanion.get(companionId) || new Set();
    return Array.from(ids)
      .map(id => this.builds.get(id))
      .filter((b): b is CompanionBuild => b !== undefined)
      .sort((a, b) => a.chapter - b.chapter);
  }

  /**
   * Add perk to build
   */
  addPerkToBuild(buildId: string, perk: Omit<CompanionPerk, 'id'>): CompanionPerk | null {
    const build = this.builds.get(buildId);
    if (!build) return null;

    if (build.cpSpent + perk.cpCost > build.cpAvailable) {
      return null; // Not enough CP
    }

    const id = uuidv4();
    const fullPerk: CompanionPerk = { ...perk, id };

    build.perks.push(fullPerk);
    build.cpSpent += perk.cpCost;

    // Track ability from perk
    if (this.config.trackPowerLevels) {
      this.addAbilityFromPerk(build.companionId, fullPerk, build.chapter);
    }

    return fullPerk;
  }

  /**
   * Add item to build
   */
  addItemToBuild(buildId: string, item: Omit<CompanionItem, 'id'>): CompanionItem | null {
    const build = this.builds.get(buildId);
    if (!build) return null;

    if (!item.isGiftFromJumper && build.cpSpent + item.cpCost > build.cpAvailable) {
      return null;
    }

    const id = uuidv4();
    const fullItem: CompanionItem = { ...item, id };

    build.items.push(fullItem);
    if (!item.isGiftFromJumper) {
      build.cpSpent += item.cpCost;
    }

    return fullItem;
  }

  /**
   * Add drawback to build
   */
  addDrawbackToBuild(buildId: string, drawback: Omit<CompanionDrawback, 'id'>): CompanionDrawback {
    const build = this.builds.get(buildId);
    if (!build) throw new Error('Build not found');

    const id = uuidv4();
    const fullDrawback: CompanionDrawback = { ...drawback, id };

    build.drawbacks.push(fullDrawback);
    build.cpAvailable += drawback.cpGain;

    return fullDrawback;
  }

  /**
   * Get total CP spent on a companion across all jumps
   */
  getTotalCPInvested(companionId: string): number {
    const companion = this.companions.get(companionId);
    if (!companion) return 0;

    let total = companion.acquisitionCost;

    const builds = this.getCompanionBuilds(companionId);
    for (const build of builds) {
      total += build.cpSpent;
    }

    return total;
  }

  // ===========================================================================
  // CHARACTER ARC MANAGEMENT
  // ===========================================================================

  /**
   * Start a character arc
   */
  startArc(data: Omit<CharacterArc, 'id' | 'milestones' | 'isComplete'>): CharacterArc {
    const id = uuidv4();
    const arc: CharacterArc = {
      ...data,
      id,
      milestones: [],
      isComplete: false
    };

    this.arcs.set(id, arc);

    // Update index
    const compSet = this.arcsByCompanion.get(data.companionId) || new Set();
    compSet.add(id);
    this.arcsByCompanion.set(data.companionId, compSet);

    return arc;
  }

  /**
   * Get arc by ID
   */
  getArc(id: string): CharacterArc | undefined {
    return this.arcs.get(id);
  }

  /**
   * Get all arcs for a companion
   */
  getCompanionArcs(companionId: string): CharacterArc[] {
    const ids = this.arcsByCompanion.get(companionId) || new Set();
    return Array.from(ids)
      .map(id => this.arcs.get(id))
      .filter((a): a is CharacterArc => a !== undefined);
  }

  /**
   * Get active (incomplete) arcs
   */
  getActiveArcs(): CharacterArc[] {
    return Array.from(this.arcs.values())
      .filter(arc => !arc.isComplete);
  }

  /**
   * Add milestone to arc
   */
  addMilestone(arcId: string, milestone: Omit<ArcMilestone, 'id'>): ArcMilestone {
    const arc = this.arcs.get(arcId);
    if (!arc) throw new Error('Arc not found');

    const id = uuidv4();
    const fullMilestone: ArcMilestone = { ...milestone, id };

    arc.milestones.push(fullMilestone);
    arc.milestones.sort((a, b) => a.chapter - b.chapter);

    return fullMilestone;
  }

  /**
   * Mark milestone as reached
   */
  markMilestoneReached(arcId: string, milestoneId: string): void {
    const arc = this.arcs.get(arcId);
    if (!arc) return;

    const milestone = arc.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      milestone.isReached = true;

      // Update arc progress
      const reached = arc.milestones.filter(m => m.isReached).length;
      arc.currentPhase = (reached / arc.milestones.length) * 100;
    }
  }

  /**
   * Complete an arc
   */
  completeArc(
    arcId: string,
    chapter: number,
    climax: string,
    resolution: string,
    finalState: string
  ): void {
    const arc = this.arcs.get(arcId);
    if (!arc) return;

    arc.isComplete = true;
    arc.actualEndChapter = chapter;
    arc.climax = climax;
    arc.resolution = resolution;
    arc.currentState = finalState;
    arc.currentPhase = 100;

    // Mark all milestones as reached
    for (const milestone of arc.milestones) {
      if (milestone.chapter <= chapter) {
        milestone.isReached = true;
      }
    }
  }

  /**
   * Advance arcs based on chapter
   */
  advanceArcsToChapter(chapter: number): CharacterArc[] {
    const advanced: CharacterArc[] = [];

    if (!this.config.autoAdvanceArcs) return advanced;

    for (const arc of this.arcs.values()) {
      if (arc.isComplete) continue;

      let changed = false;
      for (const milestone of arc.milestones) {
        if (!milestone.isReached && milestone.chapter <= chapter) {
          milestone.isReached = true;
          changed = true;
        }
      }

      if (changed) {
        const reached = arc.milestones.filter(m => m.isReached).length;
        arc.currentPhase = (reached / arc.milestones.length) * 100;
        advanced.push(arc);
      }
    }

    return advanced;
  }

  // ===========================================================================
  // POWER GROWTH TRACKING
  // ===========================================================================

  /**
   * Initialize power growth tracking for companion
   */
  private initializePowerGrowth(companionId: string): void {
    const growth: CompanionPowerGrowth = {
      id: uuidv4(),
      companionId,
      powerLevelByJump: new Map(),
      currentPowerLevel: 1,
      peakPowerLevel: 1,
      abilities: [],
      averageGrowthPerJump: 0,
      totalJumpsParticipated: 0,
      jumpsAsActive: 0,
      synergyWithJumper: 50,
      synergyAbilities: [],
      lastUpdated: 0
    };

    this.powerGrowth.set(companionId, growth);
  }

  /**
   * Add ability from perk
   */
  private addAbilityFromPerk(
    companionId: string,
    perk: CompanionPerk,
    chapter: number
  ): void {
    const growth = this.powerGrowth.get(companionId);
    if (!growth) return;

    const ability: CompanionAbility = {
      id: uuidv4(),
      name: perk.name,
      source: perk.source,
      sourceChapter: chapter,
      currentLevel: 25,              // Start at 25% mastery
      maxPotential: 100,
      growthRate: 0.5,               // 0.5% per chapter
      timesUsed: 0,
      lastUsedChapter: chapter,
      signatureUses: [],
      synergyWith: perk.synergiesWith,
      combinedWith: [],
      notes: perk.description
    };

    growth.abilities.push(ability);
  }

  /**
   * Update power level for a jump
   */
  updatePowerLevel(
    companionId: string,
    jumpId: string,
    newLevel: number,
    chapter: number
  ): void {
    const growth = this.powerGrowth.get(companionId);
    if (!growth) return;

    growth.powerLevelByJump.set(jumpId, newLevel);
    growth.currentPowerLevel = newLevel;
    growth.peakPowerLevel = Math.max(growth.peakPowerLevel, newLevel);
    growth.lastUpdated = chapter;

    // Update average
    growth.totalJumpsParticipated++;
    const levels = Array.from(growth.powerLevelByJump.values());
    if (levels.length > 1) {
      const totalGrowth = levels[levels.length - 1] - levels[0];
      growth.averageGrowthPerJump = totalGrowth / (levels.length - 1);
    }
  }

  /**
   * Get power growth for companion
   */
  getPowerGrowth(companionId: string): CompanionPowerGrowth | undefined {
    return this.powerGrowth.get(companionId);
  }

  /**
   * Record ability usage
   */
  recordAbilityUse(
    companionId: string,
    abilityName: string,
    chapter: number,
    isSignatureUse: boolean,
    description?: string
  ): void {
    const growth = this.powerGrowth.get(companionId);
    if (!growth) return;

    const ability = growth.abilities.find(a =>
      a.name.toLowerCase() === abilityName.toLowerCase());
    if (!ability) return;

    ability.timesUsed++;
    ability.lastUsedChapter = chapter;

    // Growth from use
    ability.currentLevel = Math.min(ability.maxPotential,
      ability.currentLevel + ability.growthRate);

    if (isSignatureUse && description) {
      ability.signatureUses.push(`Ch${chapter}: ${description}`);
    }
  }

  // ===========================================================================
  // INTERACTION TRACKING
  // ===========================================================================

  /**
   * Record an interaction between companions
   */
  recordInteraction(data: Omit<CompanionInteraction, 'id'>): CompanionInteraction {
    const id = uuidv4();
    const interaction: CompanionInteraction = { ...data, id };

    this.interactions.push(interaction);

    // Apply relationship changes
    for (const change of data.relationshipChanges) {
      if (change.targetId === 'jumper') {
        const companion = this.companions.get(change.companionId);
        if (companion) {
          companion.relationshipStrength = Math.max(0, Math.min(100,
            companion.relationshipStrength + change.change));
        }
      }
      // TODO: Track companion-companion relationships
    }

    return interaction;
  }

  /**
   * Get interactions for a companion
   */
  getInteractionsFor(companionId: string): CompanionInteraction[] {
    return this.interactions.filter(i =>
      i.companionIds.includes(companionId));
  }

  /**
   * Get interactions by type
   */
  getInteractionsByType(type: CompanionInteraction['type']): CompanionInteraction[] {
    return this.interactions.filter(i => i.type === type);
  }

  /**
   * Get pivotal interactions
   */
  getPivotalInteractions(): CompanionInteraction[] {
    return this.interactions.filter(i => i.significance === 'pivotal');
  }

  // ===========================================================================
  // JUMP SUMMARIES
  // ===========================================================================

  /**
   * Create summary for companions in a jump
   */
  createJumpSummary(
    jumpId: string,
    jumpName: string,
    chapter: number
  ): JumpCompanionSummary {
    const summary: JumpCompanionSummary = {
      jumpId,
      jumpName,
      chapter,
      activeCompanions: this.getActiveCompanions().map(c => c.id),
      warehouseCompanions: this.getCompanionsByStatus(CompanionStatus.WAREHOUSE).map(c => c.id),
      newCompanions: [],
      totalCPSpent: 0,
      buildsCompleted: [],
      arcsProgressed: [],
      significantMoments: [],
      statusChanges: [],
      notes: ''
    };

    this.jumpSummaries.set(jumpId, summary);

    return summary;
  }

  /**
   * Get jump summary
   */
  getJumpSummary(jumpId: string): JumpCompanionSummary | undefined {
    return this.jumpSummaries.get(jumpId);
  }

  /**
   * Update summary with new companion
   */
  recordNewCompanionInJump(jumpId: string, companionId: string): void {
    const summary = this.jumpSummaries.get(jumpId);
    if (summary && !summary.newCompanions.includes(companionId)) {
      summary.newCompanions.push(companionId);
    }
  }

  // ===========================================================================
  // REPORTS
  // ===========================================================================

  /**
   * Generate companion roster report
   */
  generateRosterReport(): string {
    let report = '# Companion Roster\n\n';

    // Active companions
    const active = this.getActiveCompanions();
    report += `## Active Companions (${active.length})\n\n`;

    for (const companion of active) {
      report += `### ${companion.name}\n`;
      report += `- **Origin:** ${companion.originUniverseName}\n`;
      report += `- **Role:** ${companion.primaryRole}\n`;
      report += `- **Relationship:** ${companion.relationshipWithJumper} (${companion.relationshipStrength}%)\n`;

      const growth = this.powerGrowth.get(companion.id);
      if (growth) {
        report += `- **Power Level:** ${growth.currentPowerLevel.toFixed(1)}/10\n`;
        report += `- **Abilities:** ${growth.abilities.length}\n`;
      }

      const arcs = this.getCompanionArcs(companion.id).filter(a => !a.isComplete);
      if (arcs.length > 0) {
        report += `- **Active Arcs:** ${arcs.map(a => a.name).join(', ')}\n`;
      }

      report += '\n';
    }

    // Warehouse companions
    const warehouse = this.getCompanionsByStatus(CompanionStatus.WAREHOUSE);
    if (warehouse.length > 0) {
      report += `## In Warehouse (${warehouse.length})\n\n`;
      for (const companion of warehouse) {
        report += `- **${companion.name}** (${companion.originUniverseName})\n`;
      }
      report += '\n';
    }

    // Statistics
    report += '## Statistics\n\n';
    const stats = this.getStats();
    report += `- **Total Companions:** ${stats.totalCompanions}\n`;
    report += `- **Active:** ${stats.activeCompanions}\n`;
    report += `- **Total CP Invested:** ${stats.totalCPInvested}\n`;
    report += `- **Active Arcs:** ${stats.activeArcs}\n`;
    report += `- **Completed Arcs:** ${stats.completedArcs}\n`;

    return report;
  }

  /**
   * Generate detailed report for a single companion
   */
  generateCompanionReport(companionId: string): string {
    const companion = this.companions.get(companionId);
    if (!companion) return 'Companion not found';

    let report = `# ${companion.name}\n\n`;

    // Basic info
    report += '## Profile\n\n';
    report += `- **Status:** ${companion.status}\n`;
    report += `- **Origin:** ${companion.originUniverseName}\n`;
    report += `- **Original Role:** ${companion.originalRole}\n`;
    report += `- **Species:** ${companion.species}\n`;
    report += `- **Age:** ${companion.age}\n`;
    report += `- **Acquired:** Chapter ${companion.acquisitionChapter}\n`;
    report += `- **Acquisition Cost:** ${companion.acquisitionCost} CP\n\n`;

    // Personality
    report += '## Personality\n\n';
    report += `- **Traits:** ${companion.personality.join(', ')}\n`;
    report += `- **Values:** ${companion.coreValues.join(', ')}\n`;
    report += `- **Flaws:** ${companion.flaws.join(', ')}\n`;
    report += `- **Goals:** ${companion.goals.join(', ')}\n\n`;

    // Relationship
    report += '## Relationship with Jumper\n\n';
    report += `- **Type:** ${companion.relationshipWithJumper}\n`;
    report += `- **Strength:** ${companion.relationshipStrength}%\n`;

    const significantEvents = companion.relationshipHistory
      .filter(e => e.isSignificant)
      .slice(-5);
    if (significantEvents.length > 0) {
      report += '\n### Recent Significant Events\n';
      for (const event of significantEvents) {
        report += `- Ch${event.chapter}: ${event.description}\n`;
      }
    }
    report += '\n';

    // Builds
    const builds = this.getCompanionBuilds(companionId);
    if (builds.length > 0) {
      report += '## Builds\n\n';
      report += `Total CP Invested: ${this.getTotalCPInvested(companionId)}\n\n`;

      for (const build of builds.slice(-3)) {
        report += `### ${build.jumpName}\n`;
        report += `- **CP:** ${build.cpSpent}/${build.cpAvailable}\n`;
        if (build.perks.length > 0) {
          report += `- **Perks:** ${build.perks.map(p => p.name).join(', ')}\n`;
        }
        if (build.items.length > 0) {
          report += `- **Items:** ${build.items.map(i => i.name).join(', ')}\n`;
        }
        report += '\n';
      }
    }

    // Power growth
    const growth = this.powerGrowth.get(companionId);
    if (growth) {
      report += '## Power Growth\n\n';
      report += `- **Current Level:** ${growth.currentPowerLevel.toFixed(1)}/10\n`;
      report += `- **Peak Level:** ${growth.peakPowerLevel.toFixed(1)}/10\n`;
      report += `- **Jumps Participated:** ${growth.totalJumpsParticipated}\n`;
      report += `- **Synergy with Jumper:** ${growth.synergyWithJumper}%\n\n`;

      if (growth.abilities.length > 0) {
        report += '### Key Abilities\n';
        const topAbilities = growth.abilities
          .sort((a, b) => b.currentLevel - a.currentLevel)
          .slice(0, 5);
        for (const ability of topAbilities) {
          report += `- **${ability.name}** (${ability.currentLevel.toFixed(0)}% mastery)\n`;
        }
        report += '\n';
      }
    }

    // Character arcs
    const arcs = this.getCompanionArcs(companionId);
    if (arcs.length > 0) {
      report += '## Character Arcs\n\n';

      const activeArcs = arcs.filter(a => !a.isComplete);
      const completedArcs = arcs.filter(a => a.isComplete);

      if (activeArcs.length > 0) {
        report += '### Active Arcs\n';
        for (const arc of activeArcs) {
          report += `- **${arc.name}** (${arc.type}): ${arc.currentPhase.toFixed(0)}%\n`;
          report += `  - Goal: ${arc.goal}\n`;
          report += `  - Current: ${arc.currentState}\n`;
        }
        report += '\n';
      }

      if (completedArcs.length > 0) {
        report += '### Completed Arcs\n';
        for (const arc of completedArcs) {
          report += `- **${arc.name}** (${arc.type})\n`;
          report += `  - Resolution: ${arc.resolution}\n`;
        }
        report += '\n';
      }
    }

    return report;
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  /**
   * Get overall statistics
   */
  getStats(): {
    totalCompanions: number;
    activeCompanions: number;
    warehouseCompanions: number;
    lostCompanions: number;
    totalCPInvested: number;
    totalBuilds: number;
    activeArcs: number;
    completedArcs: number;
    totalInteractions: number;
    pivotalInteractions: number;
  } {
    let totalCPInvested = 0;
    for (const companion of this.companions.values()) {
      totalCPInvested += this.getTotalCPInvested(companion.id);
    }

    const activeArcs = Array.from(this.arcs.values()).filter(a => !a.isComplete).length;
    const completedArcs = Array.from(this.arcs.values()).filter(a => a.isComplete).length;

    return {
      totalCompanions: this.companions.size,
      activeCompanions: this.getCompanionsByStatus(CompanionStatus.ACTIVE).length,
      warehouseCompanions: this.getCompanionsByStatus(CompanionStatus.WAREHOUSE).length,
      lostCompanions: this.getCompanionsByStatus(CompanionStatus.LOST).length +
        this.getCompanionsByStatus(CompanionStatus.DECEASED).length,
      totalCPInvested,
      totalBuilds: this.builds.size,
      activeArcs,
      completedArcs,
      totalInteractions: this.interactions.length,
      pivotalInteractions: this.getPivotalInteractions().length
    };
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    // Convert powerGrowth maps
    const powerGrowthArray: [string, CompanionPowerGrowth & { powerLevelByJumpArray: [string, number][] }][] = [];
    for (const [id, growth] of this.powerGrowth) {
      powerGrowthArray.push([id, {
        ...growth,
        powerLevelByJumpArray: Array.from(growth.powerLevelByJump.entries())
      }]);
    }

    return JSON.stringify({
      companions: Array.from(this.companions.entries()),
      builds: Array.from(this.builds.entries()),
      arcs: Array.from(this.arcs.entries()),
      powerGrowth: powerGrowthArray,
      interactions: this.interactions,
      jumpSummaries: Array.from(this.jumpSummaries.entries()),
      config: this.config
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.companions) {
      this.companions = new Map(data.companions);
      // Rebuild indexes
      this.companionsByStatus.clear();
      this.companionsByOrigin.clear();
      for (const status of Object.values(CompanionStatus)) {
        this.companionsByStatus.set(status, new Set());
      }
      for (const [id, companion] of this.companions) {
        const statusSet = this.companionsByStatus.get(companion.status) || new Set();
        statusSet.add(id);
        this.companionsByStatus.set(companion.status, statusSet);

        const originSet = this.companionsByOrigin.get(companion.originJumpId) || new Set();
        originSet.add(id);
        this.companionsByOrigin.set(companion.originJumpId, originSet);
      }
    }

    if (data.builds) {
      this.builds = new Map(data.builds);
      // Rebuild index
      this.buildsByCompanion.clear();
      for (const [id, build] of this.builds) {
        const compSet = this.buildsByCompanion.get(build.companionId) || new Set();
        compSet.add(id);
        this.buildsByCompanion.set(build.companionId, compSet);
      }
    }

    if (data.arcs) {
      this.arcs = new Map(data.arcs);
      // Rebuild index
      this.arcsByCompanion.clear();
      for (const [id, arc] of this.arcs) {
        const compSet = this.arcsByCompanion.get(arc.companionId) || new Set();
        compSet.add(id);
        this.arcsByCompanion.set(arc.companionId, compSet);
      }
    }

    if (data.powerGrowth) {
      this.powerGrowth.clear();
      for (const [id, growth] of data.powerGrowth) {
        const restored: CompanionPowerGrowth = {
          ...growth,
          powerLevelByJump: new Map(growth.powerLevelByJumpArray || [])
        };
        this.powerGrowth.set(id, restored);
      }
    }

    if (data.interactions) {
      this.interactions = data.interactions;
    }

    if (data.jumpSummaries) {
      this.jumpSummaries = new Map(data.jumpSummaries);
    }

    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.companions.clear();
    this.builds.clear();
    this.arcs.clear();
    this.powerGrowth.clear();
    this.interactions = [];
    this.jumpSummaries.clear();
    this.buildsByCompanion.clear();
    this.arcsByCompanion.clear();
    this.companionsByOrigin.clear();

    // Reset status index
    for (const status of Object.values(CompanionStatus)) {
      this.companionsByStatus.set(status, new Set());
    }
  }
}

// Default instance
export const companionTracker = new CompanionTracker();

export default CompanionTracker;
