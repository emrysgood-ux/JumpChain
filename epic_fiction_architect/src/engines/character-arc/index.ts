/**
 * Character Arc System - Multi-Chapter Character Development Tracking
 *
 * For 12,008 chapter narratives, characters must evolve meaningfully while
 * maintaining consistency. This system tracks:
 * - Multiple simultaneous character arcs (hero's journey, redemption, corruption)
 * - Motivation evolution over time
 * - Skill/ability progression trees
 * - Trauma and growth milestones
 * - Belief system and philosophy changes
 * - Character state snapshots at key points
 *
 * Characters are defined by their journeys, not their starting points.
 */

import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Standard character arc types
 */
export enum ArcType {
  // Classic Arcs
  HERO_JOURNEY = 'hero_journey',           // Call to adventure → Return
  REDEMPTION = 'redemption',               // Fall → Realization → Redemption
  CORRUPTION = 'corruption',               // Good → Compromise → Fall
  FALL = 'fall',                          // Tragic hero arc
  RISE = 'rise',                          // Rags to riches, skill mastery
  FLAT = 'flat',                          // Character changes world, not self

  // Relationship Arcs
  ROMANCE = 'romance',                     // Meet → Conflict → Union
  FRIENDSHIP = 'friendship',               // Strangers → Trust → Bond
  RIVALRY = 'rivalry',                     // Opposition → Respect
  MENTOR = 'mentor',                       // Teaching → Letting go
  BETRAYAL = 'betrayal',                   // Trust → Betrayal → Aftermath
  RECONCILIATION = 'reconciliation',       // Estrangement → Healing

  // Internal Arcs
  IDENTITY = 'identity',                   // Who am I?
  ACCEPTANCE = 'acceptance',               // Denial → Acceptance
  OVERCOMING_FEAR = 'overcoming_fear',     // Fear → Confrontation → Mastery
  OVERCOMING_FLAW = 'overcoming_flaw',     // Flaw → Awareness → Change
  BELIEF_CHANGE = 'belief_change',         // Old belief → Crisis → New belief
  MATURATION = 'maturation',               // Youth → Experience → Wisdom

  // Power Arcs
  POWER_GAIN = 'power_gain',               // Weak → Training → Strong
  POWER_LOSS = 'power_loss',               // Powerful → Loss → Adaptation
  MASTERY = 'mastery',                     // Skill acquisition journey
  CORRUPTION_BY_POWER = 'corruption_by_power',

  // Special
  CUSTOM = 'custom'
}

/**
 * Arc phases - where in the journey
 */
export enum ArcPhase {
  NOT_STARTED = 'not_started',
  SETUP = 'setup',                         // Establishing status quo
  INCITING = 'inciting',                   // Call to change
  RESISTANCE = 'resistance',               // Refusing the call
  COMMITMENT = 'commitment',               // Point of no return
  RISING_ACTION = 'rising_action',         // Growth through trials
  MIDPOINT = 'midpoint',                   // Major shift/revelation
  COMPLICATIONS = 'complications',         // Things get harder
  CRISIS = 'crisis',                       // Darkest moment
  CLIMAX = 'climax',                       // Final confrontation
  RESOLUTION = 'resolution',               // New equilibrium
  AFTERMATH = 'aftermath',                 // Living with changes
  COMPLETED = 'completed'
}

/**
 * Motivation categories
 */
export enum MotivationType {
  SURVIVAL = 'survival',
  SAFETY = 'safety',
  BELONGING = 'belonging',
  LOVE = 'love',
  ESTEEM = 'esteem',
  SELF_ACTUALIZATION = 'self_actualization',
  REVENGE = 'revenge',
  JUSTICE = 'justice',
  POWER = 'power',
  KNOWLEDGE = 'knowledge',
  FREEDOM = 'freedom',
  DUTY = 'duty',
  LEGACY = 'legacy',
  REDEMPTION = 'redemption',
  PROTECTION = 'protection',
  ESCAPE = 'escape',
  CURIOSITY = 'curiosity',
  FAITH = 'faith',
  CUSTOM = 'custom'
}

/**
 * Skill categories
 */
export enum SkillCategory {
  COMBAT = 'combat',
  MAGIC = 'magic',
  TECHNOLOGY = 'technology',
  SOCIAL = 'social',
  INTELLECTUAL = 'intellectual',
  PHYSICAL = 'physical',
  CRAFTING = 'crafting',
  LEADERSHIP = 'leadership',
  SURVIVAL = 'survival',
  STEALTH = 'stealth',
  PERCEPTION = 'perception',
  WILLPOWER = 'willpower',
  EMOTIONAL = 'emotional',
  SPECIAL = 'special'
}

/**
 * Growth trigger types
 */
export enum GrowthTrigger {
  TRAINING = 'training',
  MENTOR = 'mentor',
  FAILURE = 'failure',
  SUCCESS = 'success',
  TRAUMA = 'trauma',
  REVELATION = 'revelation',
  RELATIONSHIP = 'relationship',
  CRISIS = 'crisis',
  SACRIFICE = 'sacrifice',
  LOSS = 'loss',
  VICTORY = 'victory',
  REFLECTION = 'reflection',
  CONFRONTATION = 'confrontation',
  CHOICE = 'choice',
  EXTERNAL_FORCE = 'external_force'
}

/**
 * Belief change types
 */
export enum BeliefChangeType {
  STRENGTHENED = 'strengthened',
  WEAKENED = 'weakened',
  ABANDONED = 'abandoned',
  ADOPTED = 'adopted',
  INVERTED = 'inverted',
  NUANCED = 'nuanced',
  RADICALIZED = 'radicalized',
  MODERATED = 'moderated'
}

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * A character arc instance
 */
export interface CharacterArc {
  id: string;
  characterId: string;
  characterName: string;

  // Arc definition
  type: ArcType;
  customTypeName?: string;
  name: string;
  description: string;

  // Timeline
  startChapter: number;
  currentPhase: ArcPhase;
  estimatedEndChapter?: number;
  actualEndChapter?: number;

  // Progress
  progressPercent: number;           // 0-100
  phaseHistory: PhaseTransition[];

  // Stakes
  stakes: string;                    // What's at risk
  stakesLevel: 'personal' | 'local' | 'regional' | 'global' | 'cosmic';

  // Character state
  startingState: CharacterState;
  targetState: CharacterState;
  currentState: CharacterState;

  // Milestones
  milestones: ArcMilestone[];

  // Relationships
  relatedCharacterIds: string[];     // Characters involved in this arc
  parentArcId?: string;              // If this is a sub-arc
  childArcIds: string[];             // Sub-arcs
  conflictingArcIds: string[];       // Arcs that create tension

  // Meta
  isPrimary: boolean;                // Main arc vs supporting
  isComplete: boolean;
  resolution?: ArcResolution;

  notes: string;
}

/**
 * Phase transition record
 */
export interface PhaseTransition {
  fromPhase: ArcPhase;
  toPhase: ArcPhase;
  chapter: number;
  trigger: string;
  significance: 'minor' | 'moderate' | 'major' | 'pivotal';
}

/**
 * Character state snapshot
 */
export interface CharacterState {
  id: string;
  chapter: number;

  // Core traits
  coreTraits: string[];

  // Emotional state
  emotionalState: string;
  dominantEmotions: string[];

  // Relationships summary
  keyRelationships: {
    characterId: string;
    characterName: string;
    relationship: string;
    strength: number;              // -100 to 100
  }[];

  // Skills/abilities
  skillLevels: Map<string, number>;  // skill name → level (0-100)

  // Beliefs
  coreBeliefs: string[];
  values: string[];
  worldview: string;

  // Goals
  shortTermGoals: string[];
  longTermGoals: string[];
  secretGoals: string[];

  // Flaws/weaknesses
  flaws: string[];
  fears: string[];

  // Resources
  powerLevel: number;              // Relative power (0-100)
  resources: string[];

  notes: string;
}

/**
 * Arc milestone
 */
export interface ArcMilestone {
  id: string;
  chapter: number;
  name: string;
  description: string;

  // Type
  type: 'beat' | 'turning_point' | 'revelation' | 'choice' | 'consequence' | 'growth';
  significance: 'minor' | 'moderate' | 'major' | 'pivotal';

  // Change
  changeDescription: string;
  beforeState: string;
  afterState: string;

  // Tracking
  isReached: boolean;
  plannedChapter?: number;
  actualChapter?: number;

  sceneId?: string;
  notes: string;
}

/**
 * Arc resolution
 */
export interface ArcResolution {
  type: 'positive' | 'negative' | 'bittersweet' | 'ambiguous' | 'open';
  description: string;
  lessonsLearned: string[];
  characterChange: string;
  readerTakeaway: string;
  chapter: number;
  satisfactionScore: number;       // 0-100 (how well payoff matched setup)
}

/**
 * Character motivation
 */
export interface CharacterMotivation {
  id: string;
  characterId: string;

  type: MotivationType;
  customType?: string;
  description: string;

  // Strength and urgency
  strength: number;                // 0-100
  urgency: number;                 // 0-100

  // Origin
  originChapter: number;
  originEvent: string;

  // Evolution
  evolutionHistory: {
    chapter: number;
    strengthChange: number;
    reason: string;
  }[];

  // Conflicts
  conflictsWith: string[];         // Other motivation IDs

  // Timeline
  startChapter: number;
  endChapter?: number;
  isActive: boolean;

  notes: string;
}

/**
 * Character skill
 */
export interface CharacterSkill {
  id: string;
  characterId: string;

  name: string;
  category: SkillCategory;
  description: string;

  // Level tracking
  currentLevel: number;            // 0-100
  maxPotential: number;            // Max this character can reach

  // Progress
  progressHistory: {
    chapter: number;
    fromLevel: number;
    toLevel: number;
    trigger: GrowthTrigger;
    event: string;
  }[];

  // Usage
  timesUsed: number;
  lastUsedChapter: number;
  significantUses: {
    chapter: number;
    description: string;
    outcome: 'success' | 'failure' | 'partial';
  }[];

  // Relationships
  synergyWith: string[];           // Other skill IDs
  prerequisiteFor: string[];

  notes: string;
}

/**
 * Character belief
 */
export interface CharacterBelief {
  id: string;
  characterId: string;

  belief: string;
  category: 'moral' | 'philosophical' | 'religious' | 'political' | 'personal' | 'about_self' | 'about_others' | 'about_world';

  // Strength
  conviction: number;              // 0-100
  isCore: boolean;                 // Core beliefs resist change

  // Origin
  originChapter: number;
  originReason: string;

  // Changes
  changeHistory: {
    chapter: number;
    changeType: BeliefChangeType;
    previousConviction: number;
    newConviction: number;
    catalyst: string;
    internalConflict: string;
  }[];

  // Conflicts
  testedBy: string[];              // Events/situations that tested this belief
  conflictsWith: string[];         // Other belief IDs (internal conflict)

  // Timeline
  startChapter: number;
  endChapter?: number;             // If abandoned
  isActive: boolean;

  notes: string;
}

/**
 * Trauma record
 */
export interface CharacterTrauma {
  id: string;
  characterId: string;

  event: string;
  chapter: number;
  severity: 'minor' | 'moderate' | 'severe' | 'devastating';

  // Effects
  symptoms: string[];
  triggers: string[];
  copingMechanisms: string[];

  // Healing
  healingProgress: number;         // 0-100
  healingMilestones: {
    chapter: number;
    description: string;
    progressGain: number;
  }[];

  // Impact
  affectedAreas: string[];         // Relationships, skills, beliefs affected
  behavioralChanges: string[];

  isResolved: boolean;
  resolutionChapter?: number;
  resolutionMethod?: string;

  notes: string;
}

/**
 * Character growth event
 */
export interface GrowthEvent {
  id: string;
  characterId: string;
  chapter: number;

  trigger: GrowthTrigger;
  triggerEvent: string;

  // What changed
  changes: {
    type: 'skill' | 'belief' | 'motivation' | 'trait' | 'relationship' | 'arc_phase';
    targetId: string;
    description: string;
    magnitude: number;             // -100 to 100
  }[];

  // Narrative
  internalThought?: string;        // Character's realization
  externalManifestation?: string;  // How it shows

  significance: 'minor' | 'moderate' | 'major' | 'pivotal';
  notes: string;
}

/**
 * Character development summary
 */
export interface CharacterDevelopmentSummary {
  characterId: string;
  characterName: string;

  // Arc status
  activeArcs: number;
  completedArcs: number;
  primaryArc?: CharacterArc;

  // Growth metrics
  totalGrowthEvents: number;
  majorGrowthEvents: number;
  chaptersWithGrowth: number;
  growthDensity: number;           // Growth events per 100 chapters

  // Skills
  totalSkills: number;
  masteredSkills: number;          // Level 80+
  averageSkillLevel: number;
  mostImprovedSkill?: string;

  // Beliefs
  totalBeliefs: number;
  changedBeliefs: number;
  abandonedBeliefs: number;

  // Trauma
  totalTraumas: number;
  resolvedTraumas: number;

  // Motivations
  activeMotivations: number;
  dominantMotivation?: CharacterMotivation;

  // State comparison
  stateChangeScore: number;        // How different current vs starting (0-100)
}

/**
 * Arc health analysis
 */
export interface ArcHealthAnalysis {
  arcId: string;

  // Pacing
  pacingScore: number;             // 0-100
  pacingIssues: string[];

  // Progress
  isStalled: boolean;
  chaptersInCurrentPhase: number;
  expectedProgressByNow: number;
  actualProgress: number;

  // Milestones
  missedMilestones: ArcMilestone[];
  upcomingMilestones: ArcMilestone[];

  // Conflicts
  conflictingArcs: string[];
  conflictResolutionNeeded: boolean;

  // Recommendations
  recommendations: string[];
}

/**
 * System configuration
 */
export interface CharacterArcConfig {
  autoTrackPhaseTransitions: boolean;
  warnOnStalledArcs: boolean;
  stalledArcThresholdChapters: number;
  trackGrowthDensity: boolean;
  minGrowthEventsPerArc: number;
}

// =============================================================================
// CHARACTER ARC SYSTEM CLASS
// =============================================================================

export class CharacterArcSystem {
  // Data storage
  private arcs: Map<string, CharacterArc> = new Map();
  private states: Map<string, CharacterState> = new Map();
  private motivations: Map<string, CharacterMotivation> = new Map();
  private skills: Map<string, CharacterSkill> = new Map();
  private beliefs: Map<string, CharacterBelief> = new Map();
  private traumas: Map<string, CharacterTrauma> = new Map();
  private growthEvents: GrowthEvent[] = [];

  // Indexes
  private arcsByCharacter: Map<string, Set<string>> = new Map();
  private skillsByCharacter: Map<string, Set<string>> = new Map();
  private beliefsByCharacter: Map<string, Set<string>> = new Map();
  private traumasByCharacter: Map<string, Set<string>> = new Map();
  private motivationsByCharacter: Map<string, Set<string>> = new Map();
  private arcsByType: Map<ArcType, Set<string>> = new Map();

  // Configuration
  private config: CharacterArcConfig = {
    autoTrackPhaseTransitions: true,
    warnOnStalledArcs: true,
    stalledArcThresholdChapters: 50,
    trackGrowthDensity: true,
    minGrowthEventsPerArc: 5
  };

  constructor() {
    // Initialize type index
    for (const type of Object.values(ArcType)) {
      this.arcsByType.set(type, new Set());
    }
  }

  // ===========================================================================
  // ARC MANAGEMENT
  // ===========================================================================

  /**
   * Create a new character arc
   */
  createArc(data: {
    characterId: string;
    characterName: string;
    type: ArcType;
    customTypeName?: string;
    name: string;
    description: string;
    startChapter: number;
    estimatedEndChapter?: number;
    stakes: string;
    stakesLevel: CharacterArc['stakesLevel'];
    startingState: Omit<CharacterState, 'id' | 'chapter'>;
    targetState: Omit<CharacterState, 'id' | 'chapter'>;
    isPrimary?: boolean;
    parentArcId?: string;
    notes?: string;
  }): CharacterArc {
    const id = uuidv4();

    // Create state snapshots
    const startingStateId = uuidv4();
    const startingState: CharacterState = {
      ...data.startingState,
      id: startingStateId,
      chapter: data.startChapter,
      skillLevels: new Map(Object.entries(data.startingState.skillLevels || {}))
    };

    const targetStateId = uuidv4();
    const targetState: CharacterState = {
      ...data.targetState,
      id: targetStateId,
      chapter: data.estimatedEndChapter || data.startChapter + 100,
      skillLevels: new Map(Object.entries(data.targetState.skillLevels || {}))
    };

    const arc: CharacterArc = {
      id,
      characterId: data.characterId,
      characterName: data.characterName,
      type: data.type,
      customTypeName: data.customTypeName,
      name: data.name,
      description: data.description,
      startChapter: data.startChapter,
      currentPhase: ArcPhase.SETUP,
      estimatedEndChapter: data.estimatedEndChapter,
      progressPercent: 0,
      phaseHistory: [{
        fromPhase: ArcPhase.NOT_STARTED,
        toPhase: ArcPhase.SETUP,
        chapter: data.startChapter,
        trigger: 'Arc initiated',
        significance: 'major'
      }],
      stakes: data.stakes,
      stakesLevel: data.stakesLevel,
      startingState,
      targetState,
      currentState: { ...startingState, id: uuidv4() },
      milestones: [],
      relatedCharacterIds: [],
      parentArcId: data.parentArcId,
      childArcIds: [],
      conflictingArcIds: [],
      isPrimary: data.isPrimary ?? false,
      isComplete: false,
      notes: data.notes || ''
    };

    this.arcs.set(id, arc);
    this.states.set(startingStateId, startingState);
    this.states.set(targetStateId, targetState);

    // Update indexes
    const charSet = this.arcsByCharacter.get(data.characterId) || new Set();
    charSet.add(id);
    this.arcsByCharacter.set(data.characterId, charSet);

    const typeSet = this.arcsByType.get(data.type) || new Set();
    typeSet.add(id);
    this.arcsByType.set(data.type, typeSet);

    // Link to parent
    if (data.parentArcId) {
      const parent = this.arcs.get(data.parentArcId);
      if (parent) {
        parent.childArcIds.push(id);
      }
    }

    return arc;
  }

  /**
   * Get arc by ID
   */
  getArc(id: string): CharacterArc | undefined {
    return this.arcs.get(id);
  }

  /**
   * Get all arcs for a character
   */
  getCharacterArcs(characterId: string): CharacterArc[] {
    const ids = this.arcsByCharacter.get(characterId) || new Set();
    return Array.from(ids)
      .map(id => this.arcs.get(id))
      .filter((a): a is CharacterArc => a !== undefined);
  }

  /**
   * Get active (incomplete) arcs for a character
   */
  getActiveArcs(characterId: string): CharacterArc[] {
    return this.getCharacterArcs(characterId).filter(a => !a.isComplete);
  }

  /**
   * Get primary arc for a character
   */
  getPrimaryArc(characterId: string): CharacterArc | undefined {
    return this.getCharacterArcs(characterId).find(a => a.isPrimary && !a.isComplete);
  }

  /**
   * Transition arc to new phase
   */
  transitionPhase(
    arcId: string,
    newPhase: ArcPhase,
    chapter: number,
    trigger: string,
    significance: PhaseTransition['significance']
  ): boolean {
    const arc = this.arcs.get(arcId);
    if (!arc) return false;

    const transition: PhaseTransition = {
      fromPhase: arc.currentPhase,
      toPhase: newPhase,
      chapter,
      trigger,
      significance
    };

    arc.phaseHistory.push(transition);
    arc.currentPhase = newPhase;

    // Update progress based on phase
    arc.progressPercent = this.calculateProgressFromPhase(newPhase);

    // Check completion
    if (newPhase === ArcPhase.COMPLETED) {
      arc.isComplete = true;
      arc.actualEndChapter = chapter;
    }

    return true;
  }

  /**
   * Calculate progress from phase
   */
  private calculateProgressFromPhase(phase: ArcPhase): number {
    const phaseProgress: Record<ArcPhase, number> = {
      [ArcPhase.NOT_STARTED]: 0,
      [ArcPhase.SETUP]: 5,
      [ArcPhase.INCITING]: 10,
      [ArcPhase.RESISTANCE]: 15,
      [ArcPhase.COMMITMENT]: 25,
      [ArcPhase.RISING_ACTION]: 35,
      [ArcPhase.MIDPOINT]: 50,
      [ArcPhase.COMPLICATIONS]: 65,
      [ArcPhase.CRISIS]: 80,
      [ArcPhase.CLIMAX]: 90,
      [ArcPhase.RESOLUTION]: 95,
      [ArcPhase.AFTERMATH]: 98,
      [ArcPhase.COMPLETED]: 100
    };
    return phaseProgress[phase] || 0;
  }

  /**
   * Add milestone to arc
   */
  addMilestone(arcId: string, milestone: Omit<ArcMilestone, 'id'>): ArcMilestone {
    const arc = this.arcs.get(arcId);
    if (!arc) throw new Error(`Arc ${arcId} not found`);

    const id = uuidv4();
    const fullMilestone: ArcMilestone = { ...milestone, id };

    arc.milestones.push(fullMilestone);
    arc.milestones.sort((a, b) => (a.plannedChapter || 0) - (b.plannedChapter || 0));

    return fullMilestone;
  }

  /**
   * Reach a milestone
   */
  reachMilestone(arcId: string, milestoneId: string, chapter: number): boolean {
    const arc = this.arcs.get(arcId);
    if (!arc) return false;

    const milestone = arc.milestones.find(m => m.id === milestoneId);
    if (!milestone) return false;

    milestone.isReached = true;
    milestone.actualChapter = chapter;

    return true;
  }

  /**
   * Complete an arc with resolution
   */
  completeArc(arcId: string, resolution: ArcResolution): boolean {
    const arc = this.arcs.get(arcId);
    if (!arc) return false;

    arc.isComplete = true;
    arc.currentPhase = ArcPhase.COMPLETED;
    arc.actualEndChapter = resolution.chapter;
    arc.progressPercent = 100;
    arc.resolution = resolution;

    // Add final phase transition
    arc.phaseHistory.push({
      fromPhase: arc.phaseHistory[arc.phaseHistory.length - 1]?.toPhase || ArcPhase.CLIMAX,
      toPhase: ArcPhase.COMPLETED,
      chapter: resolution.chapter,
      trigger: 'Arc completed',
      significance: 'pivotal'
    });

    return true;
  }

  /**
   * Update current state
   */
  updateCurrentState(arcId: string, updates: Partial<CharacterState>, chapter: number): void {
    const arc = this.arcs.get(arcId);
    if (!arc) return;

    arc.currentState = {
      ...arc.currentState,
      ...updates,
      chapter,
      skillLevels: updates.skillLevels
        ? new Map(updates.skillLevels)
        : arc.currentState.skillLevels
    };
  }

  // ===========================================================================
  // SKILL MANAGEMENT
  // ===========================================================================

  /**
   * Add skill to character
   */
  addSkill(data: Omit<CharacterSkill, 'id' | 'progressHistory' | 'timesUsed' | 'lastUsedChapter' | 'significantUses'>): CharacterSkill {
    const id = uuidv4();
    const skill: CharacterSkill = {
      ...data,
      id,
      progressHistory: [{
        chapter: 0,
        fromLevel: 0,
        toLevel: data.currentLevel,
        trigger: GrowthTrigger.EXTERNAL_FORCE,
        event: 'Starting level'
      }],
      timesUsed: 0,
      lastUsedChapter: 0,
      significantUses: []
    };

    this.skills.set(id, skill);

    // Update index
    const charSet = this.skillsByCharacter.get(data.characterId) || new Set();
    charSet.add(id);
    this.skillsByCharacter.set(data.characterId, charSet);

    return skill;
  }

  /**
   * Get skills for character
   */
  getCharacterSkills(characterId: string): CharacterSkill[] {
    const ids = this.skillsByCharacter.get(characterId) || new Set();
    return Array.from(ids)
      .map(id => this.skills.get(id))
      .filter((s): s is CharacterSkill => s !== undefined);
  }

  /**
   * Improve a skill
   */
  improveSkill(
    skillId: string,
    newLevel: number,
    chapter: number,
    trigger: GrowthTrigger,
    event: string
  ): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;

    const clampedLevel = Math.min(skill.maxPotential, Math.max(0, newLevel));

    skill.progressHistory.push({
      chapter,
      fromLevel: skill.currentLevel,
      toLevel: clampedLevel,
      trigger,
      event
    });

    skill.currentLevel = clampedLevel;

    // Record growth event
    this.recordGrowthEvent({
      characterId: skill.characterId,
      chapter,
      trigger,
      triggerEvent: event,
      changes: [{
        type: 'skill',
        targetId: skillId,
        description: `${skill.name}: ${skill.currentLevel} → ${clampedLevel}`,
        magnitude: clampedLevel - skill.currentLevel
      }],
      significance: Math.abs(clampedLevel - skill.currentLevel) >= 20 ? 'major' : 'moderate',
      notes: ''
    });

    return true;
  }

  /**
   * Record skill usage
   */
  recordSkillUse(
    skillId: string,
    chapter: number,
    description: string,
    outcome: 'success' | 'failure' | 'partial',
    isSignificant: boolean
  ): void {
    const skill = this.skills.get(skillId);
    if (!skill) return;

    skill.timesUsed++;
    skill.lastUsedChapter = chapter;

    if (isSignificant) {
      skill.significantUses.push({ chapter, description, outcome });
    }
  }

  // ===========================================================================
  // BELIEF MANAGEMENT
  // ===========================================================================

  /**
   * Add belief to character
   */
  addBelief(data: Omit<CharacterBelief, 'id' | 'changeHistory' | 'testedBy'>): CharacterBelief {
    const id = uuidv4();
    const belief: CharacterBelief = {
      ...data,
      id,
      changeHistory: [],
      testedBy: []
    };

    this.beliefs.set(id, belief);

    // Update index
    const charSet = this.beliefsByCharacter.get(data.characterId) || new Set();
    charSet.add(id);
    this.beliefsByCharacter.set(data.characterId, charSet);

    return belief;
  }

  /**
   * Get beliefs for character
   */
  getCharacterBeliefs(characterId: string): CharacterBelief[] {
    const ids = this.beliefsByCharacter.get(characterId) || new Set();
    return Array.from(ids)
      .map(id => this.beliefs.get(id))
      .filter((b): b is CharacterBelief => b !== undefined);
  }

  /**
   * Change a belief
   */
  changeBelief(
    beliefId: string,
    changeType: BeliefChangeType,
    newConviction: number,
    chapter: number,
    catalyst: string,
    internalConflict: string
  ): boolean {
    const belief = this.beliefs.get(beliefId);
    if (!belief) return false;

    belief.changeHistory.push({
      chapter,
      changeType,
      previousConviction: belief.conviction,
      newConviction,
      catalyst,
      internalConflict
    });

    belief.conviction = newConviction;

    if (changeType === BeliefChangeType.ABANDONED) {
      belief.isActive = false;
      belief.endChapter = chapter;
    }

    // Record growth event
    this.recordGrowthEvent({
      characterId: belief.characterId,
      chapter,
      trigger: GrowthTrigger.REVELATION,
      triggerEvent: catalyst,
      changes: [{
        type: 'belief',
        targetId: beliefId,
        description: `Belief "${belief.belief}" ${changeType}`,
        magnitude: newConviction - belief.conviction
      }],
      significance: belief.isCore ? 'major' : 'moderate',
      notes: internalConflict
    });

    return true;
  }

  /**
   * Test a belief
   */
  testBelief(beliefId: string, situation: string): void {
    const belief = this.beliefs.get(beliefId);
    if (belief) {
      belief.testedBy.push(situation);
    }
  }

  // ===========================================================================
  // MOTIVATION MANAGEMENT
  // ===========================================================================

  /**
   * Add motivation
   */
  addMotivation(data: Omit<CharacterMotivation, 'id' | 'evolutionHistory'>): CharacterMotivation {
    const id = uuidv4();
    const motivation: CharacterMotivation = {
      ...data,
      id,
      evolutionHistory: []
    };

    this.motivations.set(id, motivation);

    // Update index
    const charSet = this.motivationsByCharacter.get(data.characterId) || new Set();
    charSet.add(id);
    this.motivationsByCharacter.set(data.characterId, charSet);

    return motivation;
  }

  /**
   * Get motivations for character
   */
  getCharacterMotivations(characterId: string): CharacterMotivation[] {
    const ids = this.motivationsByCharacter.get(characterId) || new Set();
    return Array.from(ids)
      .map(id => this.motivations.get(id))
      .filter((m): m is CharacterMotivation => m !== undefined);
  }

  /**
   * Update motivation strength
   */
  updateMotivationStrength(
    motivationId: string,
    strengthChange: number,
    chapter: number,
    reason: string
  ): void {
    const motivation = this.motivations.get(motivationId);
    if (!motivation) return;

    motivation.evolutionHistory.push({
      chapter,
      strengthChange,
      reason
    });

    motivation.strength = Math.max(0, Math.min(100, motivation.strength + strengthChange));

    if (motivation.strength === 0) {
      motivation.isActive = false;
      motivation.endChapter = chapter;
    }
  }

  /**
   * Get dominant motivation
   */
  getDominantMotivation(characterId: string): CharacterMotivation | undefined {
    const motivations = this.getCharacterMotivations(characterId)
      .filter(m => m.isActive);

    if (motivations.length === 0) return undefined;

    return motivations.reduce((prev, curr) =>
      (curr.strength * curr.urgency) > (prev.strength * prev.urgency) ? curr : prev
    );
  }

  // ===========================================================================
  // TRAUMA MANAGEMENT
  // ===========================================================================

  /**
   * Add trauma
   */
  addTrauma(data: Omit<CharacterTrauma, 'id' | 'healingMilestones'>): CharacterTrauma {
    const id = uuidv4();
    const trauma: CharacterTrauma = {
      ...data,
      id,
      healingMilestones: []
    };

    this.traumas.set(id, trauma);

    // Update index
    const charSet = this.traumasByCharacter.get(data.characterId) || new Set();
    charSet.add(id);
    this.traumasByCharacter.set(data.characterId, charSet);

    // Record growth event (negative growth)
    this.recordGrowthEvent({
      characterId: data.characterId,
      chapter: data.chapter,
      trigger: GrowthTrigger.TRAUMA,
      triggerEvent: data.event,
      changes: [{
        type: 'trait',
        targetId: id,
        description: `Trauma: ${data.event}`,
        magnitude: data.severity === 'devastating' ? -50 :
                   data.severity === 'severe' ? -30 :
                   data.severity === 'moderate' ? -15 : -5
      }],
      significance: data.severity === 'devastating' ? 'pivotal' :
                    data.severity === 'severe' ? 'major' : 'moderate',
      notes: ''
    });

    return trauma;
  }

  /**
   * Get traumas for character
   */
  getCharacterTraumas(characterId: string): CharacterTrauma[] {
    const ids = this.traumasByCharacter.get(characterId) || new Set();
    return Array.from(ids)
      .map(id => this.traumas.get(id))
      .filter((t): t is CharacterTrauma => t !== undefined);
  }

  /**
   * Record healing progress
   */
  recordHealingProgress(
    traumaId: string,
    chapter: number,
    description: string,
    progressGain: number
  ): void {
    const trauma = this.traumas.get(traumaId);
    if (!trauma) return;

    trauma.healingMilestones.push({ chapter, description, progressGain });
    trauma.healingProgress = Math.min(100, trauma.healingProgress + progressGain);

    if (trauma.healingProgress >= 100) {
      trauma.isResolved = true;
      trauma.resolutionChapter = chapter;
      trauma.resolutionMethod = description;
    }
  }

  // ===========================================================================
  // GROWTH EVENT TRACKING
  // ===========================================================================

  /**
   * Record a growth event
   */
  recordGrowthEvent(data: Omit<GrowthEvent, 'id'>): GrowthEvent {
    const id = uuidv4();
    const event: GrowthEvent = { ...data, id };

    this.growthEvents.push(event);

    return event;
  }

  /**
   * Get growth events for character
   */
  getCharacterGrowthEvents(characterId: string): GrowthEvent[] {
    return this.growthEvents.filter(e => e.characterId === characterId);
  }

  /**
   * Get growth events in chapter range
   */
  getGrowthEventsInRange(characterId: string, startChapter: number, endChapter: number): GrowthEvent[] {
    return this.getCharacterGrowthEvents(characterId)
      .filter(e => e.chapter >= startChapter && e.chapter <= endChapter);
  }

  // ===========================================================================
  // ANALYSIS
  // ===========================================================================

  /**
   * Generate character development summary
   */
  generateDevelopmentSummary(characterId: string): CharacterDevelopmentSummary {
    const arcs = this.getCharacterArcs(characterId);
    const skills = this.getCharacterSkills(characterId);
    const beliefs = this.getCharacterBeliefs(characterId);
    const traumas = this.getCharacterTraumas(characterId);
    const motivations = this.getCharacterMotivations(characterId);
    const growthEvents = this.getCharacterGrowthEvents(characterId);

    const activeArcs = arcs.filter(a => !a.isComplete);
    const completedArcs = arcs.filter(a => a.isComplete);
    const primaryArc = activeArcs.find(a => a.isPrimary);

    const masteredSkills = skills.filter(s => s.currentLevel >= 80);
    const avgSkillLevel = skills.length > 0
      ? skills.reduce((sum, s) => sum + s.currentLevel, 0) / skills.length
      : 0;

    const mostImprovedSkill = skills.length > 0
      ? skills.reduce((prev, curr) => {
          const prevImprove = prev.progressHistory.length > 1
            ? prev.currentLevel - prev.progressHistory[0].toLevel
            : 0;
          const currImprove = curr.progressHistory.length > 1
            ? curr.currentLevel - curr.progressHistory[0].toLevel
            : 0;
          return currImprove > prevImprove ? curr : prev;
        }).name
      : undefined;

    const changedBeliefs = beliefs.filter(b => b.changeHistory.length > 0);
    const abandonedBeliefs = beliefs.filter(b => !b.isActive);

    const majorGrowthEvents = growthEvents.filter(e =>
      e.significance === 'major' || e.significance === 'pivotal'
    );

    const chaptersWithGrowth = new Set(growthEvents.map(e => e.chapter)).size;

    // Calculate state change score
    let stateChangeScore = 0;
    if (primaryArc) {
      const start = primaryArc.startingState;
      const current = primaryArc.currentState;

      // Compare traits, beliefs, skills
      const traitDiff = start.coreTraits.filter(t => !current.coreTraits.includes(t)).length;
      const beliefDiff = start.coreBeliefs.filter(b => !current.coreBeliefs.includes(b)).length;

      stateChangeScore = Math.min(100, (traitDiff + beliefDiff + changedBeliefs.length) * 10);
    }

    return {
      characterId,
      characterName: arcs[0]?.characterName || 'Unknown',
      activeArcs: activeArcs.length,
      completedArcs: completedArcs.length,
      primaryArc,
      totalGrowthEvents: growthEvents.length,
      majorGrowthEvents: majorGrowthEvents.length,
      chaptersWithGrowth,
      growthDensity: chaptersWithGrowth > 0 ? (growthEvents.length / chaptersWithGrowth) * 100 : 0,
      totalSkills: skills.length,
      masteredSkills: masteredSkills.length,
      averageSkillLevel: avgSkillLevel,
      mostImprovedSkill,
      totalBeliefs: beliefs.length,
      changedBeliefs: changedBeliefs.length,
      abandonedBeliefs: abandonedBeliefs.length,
      totalTraumas: traumas.length,
      resolvedTraumas: traumas.filter(t => t.isResolved).length,
      activeMotivations: motivations.filter(m => m.isActive).length,
      dominantMotivation: this.getDominantMotivation(characterId),
      stateChangeScore
    };
  }

  /**
   * Analyze arc health
   */
  analyzeArcHealth(arcId: string, currentChapter: number): ArcHealthAnalysis {
    const arc = this.arcs.get(arcId);
    if (!arc) throw new Error(`Arc ${arcId} not found`);

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check pacing
    const expectedChapters = (arc.estimatedEndChapter || currentChapter + 100) - arc.startChapter;
    const elapsedChapters = currentChapter - arc.startChapter;
    const expectedProgress = (elapsedChapters / expectedChapters) * 100;

    const pacingDiff = Math.abs(expectedProgress - arc.progressPercent);
    let pacingScore = Math.max(0, 100 - pacingDiff * 2);

    if (arc.progressPercent < expectedProgress - 20) {
      issues.push('Arc is progressing slower than expected');
      recommendations.push('Consider adding catalyst events to accelerate arc');
    } else if (arc.progressPercent > expectedProgress + 20) {
      issues.push('Arc is progressing faster than expected');
      recommendations.push('Consider adding complications or expanding the arc');
    }

    // Check for stalling
    const lastTransition = arc.phaseHistory[arc.phaseHistory.length - 1];
    const chaptersInPhase = currentChapter - (lastTransition?.chapter || arc.startChapter);
    const isStalled = chaptersInPhase > this.config.stalledArcThresholdChapters &&
                      arc.currentPhase !== ArcPhase.COMPLETED;

    if (isStalled) {
      issues.push(`Arc has been in ${arc.currentPhase} phase for ${chaptersInPhase} chapters`);
      recommendations.push('Consider a triggering event to move arc forward');
      pacingScore -= 20;
    }

    // Check milestones
    const missedMilestones = arc.milestones.filter(m =>
      !m.isReached && m.plannedChapter && m.plannedChapter < currentChapter
    );
    const upcomingMilestones = arc.milestones.filter(m =>
      !m.isReached && m.plannedChapter && m.plannedChapter >= currentChapter
    );

    if (missedMilestones.length > 0) {
      issues.push(`${missedMilestones.length} milestone(s) missed`);
      recommendations.push('Reach missed milestones or reschedule them');
      pacingScore -= missedMilestones.length * 5;
    }

    // Check conflicting arcs
    const conflictingArcs = arc.conflictingArcIds
      .map(id => this.arcs.get(id))
      .filter((a): a is CharacterArc => a !== undefined && !a.isComplete);

    const conflictResolutionNeeded = conflictingArcs.some(a =>
      Math.abs(a.progressPercent - arc.progressPercent) < 20
    );

    if (conflictResolutionNeeded) {
      issues.push('Conflicting arcs are at similar progress - tension building');
      recommendations.push('Consider a confrontation scene between conflicting arcs');
    }

    return {
      arcId,
      pacingScore: Math.max(0, pacingScore),
      pacingIssues: issues,
      isStalled,
      chaptersInCurrentPhase: chaptersInPhase,
      expectedProgressByNow: expectedProgress,
      actualProgress: arc.progressPercent,
      missedMilestones,
      upcomingMilestones,
      conflictingArcs: conflictingArcs.map(a => a.id),
      conflictResolutionNeeded,
      recommendations
    };
  }

  /**
   * Get stalled arcs
   */
  getStalledArcs(currentChapter: number): CharacterArc[] {
    return Array.from(this.arcs.values()).filter(arc => {
      if (arc.isComplete) return false;
      const lastTransition = arc.phaseHistory[arc.phaseHistory.length - 1];
      const chaptersInPhase = currentChapter - (lastTransition?.chapter || arc.startChapter);
      return chaptersInPhase > this.config.stalledArcThresholdChapters;
    });
  }

  // ===========================================================================
  // REPORTS
  // ===========================================================================

  /**
   * Generate character journey report
   */
  generateJourneyReport(characterId: string): string {
    const summary = this.generateDevelopmentSummary(characterId);
    let report = `# Character Journey: ${summary.characterName}\n\n`;

    // Arc overview
    report += '## Character Arcs\n\n';
    report += `- **Active Arcs:** ${summary.activeArcs}\n`;
    report += `- **Completed Arcs:** ${summary.completedArcs}\n`;

    if (summary.primaryArc) {
      report += `\n### Primary Arc: ${summary.primaryArc.name}\n`;
      report += `- **Type:** ${summary.primaryArc.type}\n`;
      report += `- **Phase:** ${summary.primaryArc.currentPhase}\n`;
      report += `- **Progress:** ${summary.primaryArc.progressPercent.toFixed(0)}%\n`;
      report += `- **Stakes:** ${summary.primaryArc.stakes} (${summary.primaryArc.stakesLevel})\n`;
    }

    // Growth metrics
    report += '\n## Growth Metrics\n\n';
    report += `- **Total Growth Events:** ${summary.totalGrowthEvents}\n`;
    report += `- **Major Events:** ${summary.majorGrowthEvents}\n`;
    report += `- **Growth Density:** ${summary.growthDensity.toFixed(1)} per 100 chapters\n`;

    // Skills
    report += '\n## Skills\n\n';
    report += `- **Total Skills:** ${summary.totalSkills}\n`;
    report += `- **Mastered (80+):** ${summary.masteredSkills}\n`;
    report += `- **Average Level:** ${summary.averageSkillLevel.toFixed(0)}\n`;
    if (summary.mostImprovedSkill) {
      report += `- **Most Improved:** ${summary.mostImprovedSkill}\n`;
    }

    // Beliefs
    report += '\n## Beliefs\n\n';
    report += `- **Total Beliefs:** ${summary.totalBeliefs}\n`;
    report += `- **Changed:** ${summary.changedBeliefs}\n`;
    report += `- **Abandoned:** ${summary.abandonedBeliefs}\n`;

    // Trauma
    report += '\n## Trauma\n\n';
    report += `- **Total Traumas:** ${summary.totalTraumas}\n`;
    report += `- **Resolved:** ${summary.resolvedTraumas}\n`;

    // Motivations
    report += '\n## Motivations\n\n';
    report += `- **Active:** ${summary.activeMotivations}\n`;
    if (summary.dominantMotivation) {
      report += `- **Dominant:** ${summary.dominantMotivation.description} (${summary.dominantMotivation.type})\n`;
    }

    // State change
    report += '\n## Overall Change\n\n';
    report += `- **State Change Score:** ${summary.stateChangeScore}/100\n`;

    return report;
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  /**
   * Get system statistics
   */
  getStats(): {
    totalArcs: number;
    activeArcs: number;
    completedArcs: number;
    totalSkills: number;
    totalBeliefs: number;
    totalTraumas: number;
    totalMotivations: number;
    totalGrowthEvents: number;
    characterCount: number;
  } {
    return {
      totalArcs: this.arcs.size,
      activeArcs: Array.from(this.arcs.values()).filter(a => !a.isComplete).length,
      completedArcs: Array.from(this.arcs.values()).filter(a => a.isComplete).length,
      totalSkills: this.skills.size,
      totalBeliefs: this.beliefs.size,
      totalTraumas: this.traumas.size,
      totalMotivations: this.motivations.size,
      totalGrowthEvents: this.growthEvents.length,
      characterCount: this.arcsByCharacter.size
    };
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    // Convert Maps in states
    const statesArray: [string, CharacterState & { skillLevelsArray: [string, number][] }][] = [];
    for (const [id, state] of this.states) {
      statesArray.push([id, {
        ...state,
        skillLevelsArray: Array.from(state.skillLevels.entries())
      }]);
    }

    // Convert arcs with nested state maps
    const arcsArray = Array.from(this.arcs.entries()).map(([id, arc]) => [id, {
      ...arc,
      startingState: {
        ...arc.startingState,
        skillLevelsArray: Array.from(arc.startingState.skillLevels.entries())
      },
      targetState: {
        ...arc.targetState,
        skillLevelsArray: Array.from(arc.targetState.skillLevels.entries())
      },
      currentState: {
        ...arc.currentState,
        skillLevelsArray: Array.from(arc.currentState.skillLevels.entries())
      }
    }]);

    return JSON.stringify({
      arcs: arcsArray,
      states: statesArray,
      motivations: Array.from(this.motivations.entries()),
      skills: Array.from(this.skills.entries()),
      beliefs: Array.from(this.beliefs.entries()),
      traumas: Array.from(this.traumas.entries()),
      growthEvents: this.growthEvents,
      config: this.config
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.arcs) {
      this.arcs.clear();
      this.arcsByCharacter.clear();
      this.arcsByType.clear();

      for (const type of Object.values(ArcType)) {
        this.arcsByType.set(type, new Set());
      }

      for (const [id, arc] of data.arcs) {
        const restored: CharacterArc = {
          ...arc,
          startingState: {
            ...arc.startingState,
            skillLevels: new Map(arc.startingState.skillLevelsArray || [])
          },
          targetState: {
            ...arc.targetState,
            skillLevels: new Map(arc.targetState.skillLevelsArray || [])
          },
          currentState: {
            ...arc.currentState,
            skillLevels: new Map(arc.currentState.skillLevelsArray || [])
          }
        };
        this.arcs.set(id, restored);

        // Rebuild indexes
        const charSet = this.arcsByCharacter.get(arc.characterId) || new Set();
        charSet.add(id);
        this.arcsByCharacter.set(arc.characterId, charSet);

        const typeSet = this.arcsByType.get(arc.type) || new Set();
        typeSet.add(id);
        this.arcsByType.set(arc.type, typeSet);
      }
    }

    if (data.states) {
      this.states.clear();
      for (const [id, state] of data.states) {
        this.states.set(id, {
          ...state,
          skillLevels: new Map(state.skillLevelsArray || [])
        });
      }
    }

    if (data.motivations) {
      this.motivations = new Map(data.motivations);
      this.motivationsByCharacter.clear();
      for (const [id, mot] of this.motivations) {
        const charSet = this.motivationsByCharacter.get(mot.characterId) || new Set();
        charSet.add(id);
        this.motivationsByCharacter.set(mot.characterId, charSet);
      }
    }

    if (data.skills) {
      this.skills = new Map(data.skills);
      this.skillsByCharacter.clear();
      for (const [id, skill] of this.skills) {
        const charSet = this.skillsByCharacter.get(skill.characterId) || new Set();
        charSet.add(id);
        this.skillsByCharacter.set(skill.characterId, charSet);
      }
    }

    if (data.beliefs) {
      this.beliefs = new Map(data.beliefs);
      this.beliefsByCharacter.clear();
      for (const [id, belief] of this.beliefs) {
        const charSet = this.beliefsByCharacter.get(belief.characterId) || new Set();
        charSet.add(id);
        this.beliefsByCharacter.set(belief.characterId, charSet);
      }
    }

    if (data.traumas) {
      this.traumas = new Map(data.traumas);
      this.traumasByCharacter.clear();
      for (const [id, trauma] of this.traumas) {
        const charSet = this.traumasByCharacter.get(trauma.characterId) || new Set();
        charSet.add(id);
        this.traumasByCharacter.set(trauma.characterId, charSet);
      }
    }

    if (data.growthEvents) {
      this.growthEvents = data.growthEvents;
    }

    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.arcs.clear();
    this.states.clear();
    this.motivations.clear();
    this.skills.clear();
    this.beliefs.clear();
    this.traumas.clear();
    this.growthEvents = [];

    this.arcsByCharacter.clear();
    this.skillsByCharacter.clear();
    this.beliefsByCharacter.clear();
    this.traumasByCharacter.clear();
    this.motivationsByCharacter.clear();

    for (const type of Object.values(ArcType)) {
      this.arcsByType.set(type, new Set());
    }
  }
}

// Default instance
export const characterArcSystem = new CharacterArcSystem();

export default CharacterArcSystem;
