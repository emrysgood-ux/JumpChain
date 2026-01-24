/**
 * Millennium Planner
 *
 * A strategic planning engine for narratives spanning 1000+ years.
 * Designed for epic-scale fiction where story arcs must be planned
 * across centuries while maintaining coherence and dramatic impact.
 *
 * Core Philosophy:
 * "Build for impossible requests so reasonable ones are a cakewalk."
 *
 * Features:
 * - Era-based planning (divide 1000 years into manageable epochs)
 * - Multi-generational character tracking
 * - Long-term consequence planning
 * - Prophecy/foreshadowing management
 * - Theme evolution across centuries
 * - Power scaling across millennia
 * - World state progression
 * - JumpChain integration (universe transitions)
 *
 * BOOK 1 STRUCTURE (Sheldon Carter saga):
 * - Book 1 = ENTIRE 1000-year saga (all 12,008 chapters)
 * - Each chapter = 1 month (12 chapters per year)
 * - Single universe (Tenchi Muyo) throughout Book 1
 * - Sheldon has NO prophecy in Book 1
 * - 11 eras spanning ~91 years each
 * - JumpChain universe hopping reserved for potential future books
 *
 * @module engines/millennium-planner
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * A millennium plan - the master structure for 1000+ years
 */
export interface MillenniumPlan {
  id: string;
  name: string;
  description: string;

  /** Total span in years */
  totalYears: number;

  /** Start year (in-universe) */
  startYear: number;

  /** Eras that make up the millennium */
  eras: Era[];

  /** Long-term threads that span multiple eras */
  millenniumThreads: MillenniumThread[];

  /** Major turning points */
  crucibleMoments: CrucibleMoment[];

  /** Prophecies and long-term foreshadowing */
  prophecies: Prophecy[];

  /** Theme evolution plan */
  themeEvolution: ThemeEvolution;

  /** Characters who span significant portions */
  longLivedCharacters: LongLivedCharacter[];

  /** World state changes over time */
  worldStateProgression: WorldStateSnapshot[];

  /** For JumpChain: universe transitions */
  jumpPlan?: JumpPlan;

  /** Generation parameters */
  generationConfig: MillenniumGenerationConfig;

  /** Metadata */
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

/**
 * An era within the millennium (typically 50-200 years)
 */
export interface Era {
  id: string;
  name: string;
  description: string;

  /** Start and end years */
  startYear: number;
  endYear: number;

  /** Overall tone/mood */
  tone: EraTonet;

  /** Key themes for this era */
  themes: string[];

  /** Major arcs within this era */
  arcs: Arc[];

  /** Power level of protagonists (1-100 scale) */
  powerLevel: PowerLevel;

  /** Dominant conflicts */
  conflicts: Conflict[];

  /** Era-specific settings/locations */
  primarySettings: Setting[];

  /** Characters prominent in this era */
  prominentCharacters: string[];

  /** World state at era start */
  openingState: Partial<WorldState>;

  /** World state at era end */
  closingState: Partial<WorldState>;

  /** Estimated word count for this era */
  targetWordCount: number;

  /** How many chapters/scenes */
  targetChapterCount: number;
}

export enum EraTonet {
  HOPEFUL = 'hopeful',
  DARK = 'dark',
  EPIC = 'epic',
  INTIMATE = 'intimate',
  CHAOTIC = 'chaotic',
  REBUILDING = 'rebuilding',
  DECLINE = 'decline',
  GOLDEN_AGE = 'golden_age',
  WAR = 'war',
  EXPLORATION = 'exploration',
  MYSTERY = 'mystery',
  REVOLUTION = 'revolution',
}

/**
 * A story arc (typically spans 1-50 years within an era)
 */
export interface Arc {
  id: string;
  eraId: string;
  name: string;
  description: string;

  /** Start and end years */
  startYear: number;
  endYear: number;

  /** Arc type */
  arcType: ArcType;

  /** Central conflict */
  centralConflict: string;

  /** Resolution type */
  resolution: ResolutionType;

  /** Key events in order */
  keyEvents: ArcEvent[];

  /** Characters with major roles */
  majorCharacters: string[];

  /** Character arcs within this story arc */
  characterArcs: CharacterArcOutline[];

  /** Subplots */
  subplots: Subplot[];

  /** Promises made (foreshadowing) */
  promises: string[];

  /** Promises fulfilled */
  payoffs: string[];

  /** Target word count */
  targetWordCount: number;
}

export enum ArcType {
  ADVENTURE = 'adventure',
  WAR = 'war',
  POLITICAL = 'political',
  PERSONAL = 'personal',
  MYSTERY = 'mystery',
  ROMANCE = 'romance',
  TRAGEDY = 'tragedy',
  COMEDY = 'comedy',
  HEIST = 'heist',
  SURVIVAL = 'survival',
  DISCOVERY = 'discovery',
  REVENGE = 'revenge',
  REDEMPTION = 'redemption',
  COMING_OF_AGE = 'coming_of_age',
}

export enum ResolutionType {
  VICTORY = 'victory',
  PYRRHIC_VICTORY = 'pyrrhic_victory',
  DEFEAT = 'defeat',
  STALEMATE = 'stalemate',
  TRANSFORMATION = 'transformation',
  SACRIFICE = 'sacrifice',
  REVELATION = 'revelation',
  OPEN_ENDED = 'open_ended',
}

/**
 * Key event within an arc
 */
export interface ArcEvent {
  id: string;
  name: string;
  description: string;
  year: number;
  eventType: EventType;
  importance: 'pivotal' | 'major' | 'significant' | 'minor';
  participants: string[];
  consequences: string[];
  foreshadowedBy?: string[];
  foreshadows?: string[];
}

export enum EventType {
  BATTLE = 'battle',
  DEATH = 'death',
  BIRTH = 'birth',
  DISCOVERY = 'discovery',
  BETRAYAL = 'betrayal',
  ALLIANCE = 'alliance',
  TRANSFORMATION = 'transformation',
  REVELATION = 'revelation',
  MEETING = 'meeting',
  DEPARTURE = 'departure',
  RETURN = 'return',
  ACHIEVEMENT = 'achievement',
  LOSS = 'loss',
  DECISION = 'decision',
}

/**
 * Character arc outline
 */
export interface CharacterArcOutline {
  characterId: string;
  arcType: 'growth' | 'fall' | 'flat' | 'redemption' | 'corruption';
  startState: string;
  endState: string;
  keyMoments: string[];
  internalConflict: string;
}

/**
 * Subplot within an arc
 */
export interface Subplot {
  id: string;
  name: string;
  type: 'romance' | 'rivalry' | 'mystery' | 'political' | 'personal' | 'comic_relief';
  description: string;
  resolution: string;
}

/**
 * A thread that spans multiple eras
 */
export interface MillenniumThread {
  id: string;
  name: string;
  description: string;

  /** Type of long-term thread */
  threadType: MillenniumThreadType;

  /** When this thread begins and ends */
  startYear: number;
  endYear: number;

  /** Eras this thread touches */
  touchedEraIds: string[];

  /** How this thread manifests in each era */
  manifestations: {
    eraId: string;
    description: string;
    intensity: number; // 1-10
  }[];

  /** Final resolution */
  resolution: string;

  /** Key moments in this thread */
  keyMoments: {
    year: number;
    event: string;
    significance: string;
  }[];
}

export enum MillenniumThreadType {
  LEGACY = 'legacy',           // Family/organizational legacy
  PROPHECY = 'prophecy',       // Long-term prophecy unfolding
  ARTIFACT = 'artifact',       // Item passing through generations
  CONFLICT = 'conflict',       // Multi-generational conflict
  MYSTERY = 'mystery',         // Mystery spanning centuries
  CURSE = 'curse',             // Curse/blessing spanning time
  TRANSFORMATION = 'transformation', // World/character transformation
  CYCLE = 'cycle',             // Repeating pattern
}

/**
 * A crucible moment - major turning point
 */
export interface CrucibleMoment {
  id: string;
  name: string;
  description: string;
  year: number;
  eraId: string;

  /** What makes this moment crucial */
  significance: string;

  /** World state before */
  worldBefore: Partial<WorldState>;

  /** World state after */
  worldAfter: Partial<WorldState>;

  /** Key participants */
  participants: string[];

  /** Long-term consequences */
  consequences: {
    description: string;
    manifestsIn: number; // Years until consequence manifests
    severity: 'catastrophic' | 'major' | 'significant' | 'subtle';
  }[];

  /** Does this fulfill any prophecies? */
  fulfillsProphecyIds?: string[];
}

/**
 * A prophecy spanning time
 */
export interface Prophecy {
  id: string;
  name: string;

  /** The prophecy text */
  text: string;

  /** When prophecy was made */
  spokenYear: number;

  /** When it will be fulfilled (planned) */
  fulfillmentYear: number;

  /** Components that must be fulfilled */
  components: {
    description: string;
    fulfilled: boolean;
    fulfilledYear?: number;
    fulfilledBy?: string;
  }[];

  /** How it will be fulfilled (or subverted) */
  fulfillmentType: 'literal' | 'symbolic' | 'subverted' | 'partial';

  /** Characters involved in fulfillment */
  involvedCharacters: string[];

  /** Foreshadowing moments */
  foreshadowing: {
    year: number;
    hint: string;
    subtlety: 'obvious' | 'moderate' | 'subtle' | 'hidden';
  }[];
}

/**
 * Theme evolution across the millennium
 */
export interface ThemeEvolution {
  /** Primary theme of the entire work */
  centralTheme: string;

  /** How theme manifests in each era */
  eraManifestations: {
    eraId: string;
    themeExpression: string;
    dominantSubtheme: string;
  }[];

  /** Thematic questions explored */
  thematicQuestions: {
    question: string;
    exploredInEras: string[];
    resolution?: string;
  }[];

  /** Counter-themes */
  counterThemes: string[];

  /** Symbol evolution */
  recurringSymbols: {
    symbol: string;
    firstAppearance: number;
    meaningEvolution: { year: number; meaning: string }[];
  }[];
}

/**
 * Long-lived character (immortal, slow-aging, etc.)
 */
export interface LongLivedCharacter {
  id: string;
  name: string;

  /** Why they live so long */
  longevitySource: 'immortal' | 'slow_aging' | 'reincarnation' | 'time_travel' | 'stasis' | 'other';

  /** When they're active in the story */
  activeRanges: { startYear: number; endYear: number; status: string }[];

  /** How they change over centuries */
  characterEvolution: {
    year: number;
    state: string;
    keyChange: string;
  }[];

  /** Their role in different eras */
  eraRoles: {
    eraId: string;
    role: 'protagonist' | 'antagonist' | 'mentor' | 'background' | 'absent';
    description: string;
  }[];

  /** Relationships that span eras */
  longTermRelationships: {
    otherCharacterId: string;
    relationshipType: string;
    evolution: { year: number; status: string }[];
  }[];
}

/**
 * Power level tracking
 */
export interface PowerLevel {
  /** Overall power tier */
  tier: 'mortal' | 'superhuman' | 'legendary' | 'mythical' | 'cosmic' | 'omnipotent';

  /** Numeric scale (1-100) */
  numericScale: number;

  /** Power types available */
  availablePowerTypes: string[];

  /** Threats at this level */
  appropriateThreats: string[];
}

/**
 * Conflict definition
 */
export interface Conflict {
  id: string;
  name: string;
  type: 'war' | 'political' | 'personal' | 'ideological' | 'cosmic' | 'nature';
  description: string;
  factions: { name: string; alignment: string }[];
  stakes: string;
  resolution?: string;
}

/**
 * Setting definition
 */
export interface Setting {
  id: string;
  name: string;
  type: 'planet' | 'continent' | 'nation' | 'city' | 'location' | 'dimension';
  description: string;
  significance: string;
}

/**
 * World state at a point in time
 */
export interface WorldState {
  year: number;

  /** Political state */
  political: {
    majorPowers: string[];
    conflicts: string[];
    alliances: string[];
  };

  /** Technological/magical state */
  technological: {
    level: string;
    keyAdvances: string[];
    lostKnowledge?: string[];
  };

  /** Social state */
  social: {
    populationTrend: 'growing' | 'stable' | 'declining';
    majorMovements: string[];
    culturalTone: string;
  };

  /** Environmental state */
  environmental: {
    stability: 'pristine' | 'stable' | 'stressed' | 'crisis' | 'recovering';
    majorChanges: string[];
  };

  /** Supernatural state */
  supernatural: {
    magicLevel: 'dormant' | 'low' | 'moderate' | 'high' | 'overwhelming';
    activeThreats: string[];
    protections: string[];
  };
}

/**
 * World state snapshot for tracking progression
 */
export interface WorldStateSnapshot {
  year: number;
  eraId: string;
  state: WorldState;
  changesSinceLastSnapshot: string[];
}

/**
 * JumpChain-specific planning
 */
export interface JumpPlan {
  /** Total jumps planned */
  totalJumps: number;

  /** Jump sequence */
  jumps: {
    jumpNumber: number;
    universe: string;
    yearsSpent: number;
    startYear: number; // In millennium timeline
    primaryGoals: string[];
    powersGained: string[];
    companionsRecruited: string[];
    majorEvents: string[];
  }[];

  /** Power scaling across jumps */
  powerProgression: {
    jumpNumber: number;
    powerLevel: PowerLevel;
  }[];

  /** Chain-wide goals */
  chainGoals: string[];

  /** Spark/Ascension planning (if applicable) */
  endgamePlan?: {
    targetJump: number;
    method: string;
    requirements: string[];
  };
}

/**
 * Configuration for generation
 */
export interface MillenniumGenerationConfig {
  /** Target total word count */
  targetWordCount: number;

  /** Words per year on average */
  wordsPerYearAverage: number;

  /** Minimum words per era */
  minWordsPerEra: number;

  /** Maximum words per era */
  maxWordsPerEra: number;

  /** Detail levels */
  detailLevel: {
    major: number;  // Words for major events
    moderate: number;
    minor: number;
  };

  /** Skip ranges (time skips) */
  allowedTimeSkips: {
    maxYears: number;
    requiredTransition: boolean;
  };

  /** Pacing preferences */
  pacing: {
    actionToReflectionRatio: number;
    dialogueToNarrativeRatio: number;
  };
}

// ============================================================================
// MILLENNIUM PLANNER ENGINE
// ============================================================================

/**
 * Millennium Planner
 *
 * Strategic planning engine for 1000+ year narratives.
 */
export class MillenniumPlanner {
  private plans: Map<string, MillenniumPlan> = new Map();
  private activePlanId: string | null = null;

  /**
   * Create a new millennium plan
   */
  createPlan(config: {
    name: string;
    description: string;
    totalYears: number;
    startYear: number;
    isJumpChain?: boolean;
  }): MillenniumPlan {
    const id = uuidv4();
    const now = new Date();

    const plan: MillenniumPlan = {
      id,
      name: config.name,
      description: config.description,
      totalYears: config.totalYears,
      startYear: config.startYear,
      eras: [],
      millenniumThreads: [],
      crucibleMoments: [],
      prophecies: [],
      themeEvolution: {
        centralTheme: '',
        eraManifestations: [],
        thematicQuestions: [],
        counterThemes: [],
        recurringSymbols: [],
      },
      longLivedCharacters: [],
      worldStateProgression: [],
      jumpPlan: config.isJumpChain ? {
        totalJumps: 0,
        jumps: [],
        powerProgression: [],
        chainGoals: [],
      } : undefined,
      generationConfig: this.createDefaultGenerationConfig(config.totalYears),
      createdAt: now,
      updatedAt: now,
      version: '1.0.0',
    };

    this.plans.set(id, plan);
    this.activePlanId = id;

    return plan;
  }

  /**
   * Create default generation config based on years
   */
  private createDefaultGenerationConfig(totalYears: number): MillenniumGenerationConfig {
    // For 1000 years at novel-level detail: ~50-100 million words
    // For 1000 years at saga level: ~10-20 million words
    // We'll target saga level by default

    const targetWordCount = totalYears * 10000; // 10k words per year average

    return {
      targetWordCount,
      wordsPerYearAverage: 10000,
      minWordsPerEra: 500000,  // 500k minimum per era
      maxWordsPerEra: 5000000, // 5M maximum per era
      detailLevel: {
        major: 50000,    // 50k words for major events
        moderate: 10000, // 10k for moderate
        minor: 1000,     // 1k for minor
      },
      allowedTimeSkips: {
        maxYears: 100,
        requiredTransition: true,
      },
      pacing: {
        actionToReflectionRatio: 0.6,
        dialogueToNarrativeRatio: 0.4,
      },
    };
  }

  /**
   * Auto-generate era structure for a plan
   */
  generateEraStructure(
    planId: string,
    options?: {
      minEraLength?: number;
      maxEraLength?: number;
      preferredCount?: number;
    }
  ): Era[] {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    const minLength = options?.minEraLength || 50;
    const maxLength = options?.maxEraLength || 200;
    const preferredCount = options?.preferredCount || Math.ceil(plan.totalYears / 100);

    const eras: Era[] = [];
    let currentYear = plan.startYear;
    let eraNumber = 1;

    // Tone cycle for variety
    const toneCycle: EraTonet[] = [
      EraTonet.HOPEFUL,
      EraTonet.EPIC,
      EraTonet.DARK,
      EraTonet.REBUILDING,
      EraTonet.GOLDEN_AGE,
      EraTonet.WAR,
      EraTonet.REVOLUTION,
      EraTonet.EXPLORATION,
    ];

    while (currentYear < plan.startYear + plan.totalYears) {
      const remainingYears = (plan.startYear + plan.totalYears) - currentYear;

      // Calculate era length
      let eraLength: number;
      if (remainingYears <= maxLength) {
        eraLength = remainingYears;
      } else {
        // Vary era lengths for natural feel
        const baseLength = plan.totalYears / preferredCount;
        const variance = (Math.random() - 0.5) * 0.4; // ±20%
        eraLength = Math.min(
          Math.max(minLength, Math.round(baseLength * (1 + variance))),
          maxLength
        );
      }

      const era: Era = {
        id: uuidv4(),
        name: `Era ${eraNumber}: [Name TBD]`,
        description: '',
        startYear: currentYear,
        endYear: currentYear + eraLength,
        tone: toneCycle[(eraNumber - 1) % toneCycle.length],
        themes: [],
        arcs: [],
        powerLevel: this.calculatePowerLevel(eraNumber, preferredCount),
        conflicts: [],
        primarySettings: [],
        prominentCharacters: [],
        openingState: {},
        closingState: {},
        targetWordCount: Math.round(eraLength * plan.generationConfig.wordsPerYearAverage),
        targetChapterCount: Math.round(eraLength * 12), // 12 chapters per year (1 chapter = 1 month)
      };

      eras.push(era);
      currentYear += eraLength;
      eraNumber++;
    }

    plan.eras = eras;
    plan.updatedAt = new Date();

    return eras;
  }

  /**
   * Calculate power level progression
   */
  private calculatePowerLevel(eraNumber: number, totalEras: number): PowerLevel {
    const progress = eraNumber / totalEras;

    if (progress < 0.1) {
      return {
        tier: 'mortal',
        numericScale: 10 + (progress * 100),
        availablePowerTypes: ['physical', 'skill'],
        appropriateThreats: ['bandits', 'beasts', 'local threats'],
      };
    } else if (progress < 0.3) {
      return {
        tier: 'superhuman',
        numericScale: 20 + (progress * 100),
        availablePowerTypes: ['physical', 'skill', 'magic_basic'],
        appropriateThreats: ['armies', 'monsters', 'mages'],
      };
    } else if (progress < 0.5) {
      return {
        tier: 'legendary',
        numericScale: 40 + (progress * 80),
        availablePowerTypes: ['physical', 'skill', 'magic', 'unique_abilities'],
        appropriateThreats: ['legendary creatures', 'nations', 'demon lords'],
      };
    } else if (progress < 0.7) {
      return {
        tier: 'mythical',
        numericScale: 60 + (progress * 50),
        availablePowerTypes: ['physical', 'skill', 'magic', 'unique_abilities', 'reality_warping'],
        appropriateThreats: ['gods', 'cosmic entities', 'world threats'],
      };
    } else if (progress < 0.9) {
      return {
        tier: 'cosmic',
        numericScale: 80 + (progress * 20),
        availablePowerTypes: ['all'],
        appropriateThreats: ['multiversal threats', 'abstract concepts', 'fundamental forces'],
      };
    } else {
      return {
        tier: 'omnipotent',
        numericScale: 95 + (progress * 5),
        availablePowerTypes: ['all', 'conceptual'],
        appropriateThreats: ['other omnipotents', 'existence itself', 'internal conflicts'],
      };
    }
  }

  /**
   * Add a crucible moment to the plan
   */
  addCrucibleMoment(
    planId: string,
    moment: Omit<CrucibleMoment, 'id'>
  ): CrucibleMoment {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    const fullMoment: CrucibleMoment = {
      ...moment,
      id: uuidv4(),
    };

    plan.crucibleMoments.push(fullMoment);
    plan.crucibleMoments.sort((a, b) => a.year - b.year);
    plan.updatedAt = new Date();

    return fullMoment;
  }

  /**
   * Add a millennium thread
   */
  addMillenniumThread(
    planId: string,
    thread: Omit<MillenniumThread, 'id'>
  ): MillenniumThread {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    const fullThread: MillenniumThread = {
      ...thread,
      id: uuidv4(),
    };

    plan.millenniumThreads.push(fullThread);
    plan.updatedAt = new Date();

    return fullThread;
  }

  /**
   * Add a prophecy
   */
  addProphecy(
    planId: string,
    prophecy: Omit<Prophecy, 'id'>
  ): Prophecy {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    const fullProphecy: Prophecy = {
      ...prophecy,
      id: uuidv4(),
    };

    plan.prophecies.push(fullProphecy);
    plan.updatedAt = new Date();

    return fullProphecy;
  }

  /**
   * Add a long-lived character
   */
  addLongLivedCharacter(
    planId: string,
    character: Omit<LongLivedCharacter, 'id'>
  ): LongLivedCharacter {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    const fullCharacter: LongLivedCharacter = {
      ...character,
      id: uuidv4(),
    };

    plan.longLivedCharacters.push(fullCharacter);
    plan.updatedAt = new Date();

    return fullCharacter;
  }

  /**
   * Create an arc within an era
   */
  createArc(
    planId: string,
    eraId: string,
    arc: Omit<Arc, 'id' | 'eraId'>
  ): Arc {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    const era = plan.eras.find(e => e.id === eraId);
    if (!era) throw new Error(`Era ${eraId} not found`);

    const fullArc: Arc = {
      ...arc,
      id: uuidv4(),
      eraId,
    };

    era.arcs.push(fullArc);
    era.arcs.sort((a, b) => a.startYear - b.startYear);
    plan.updatedAt = new Date();

    return fullArc;
  }

  /**
   * Set theme evolution
   */
  setThemeEvolution(planId: string, evolution: ThemeEvolution): void {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    plan.themeEvolution = evolution;
    plan.updatedAt = new Date();
  }

  /**
   * Update JumpChain plan
   */
  updateJumpPlan(planId: string, jumpPlan: JumpPlan): void {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    plan.jumpPlan = jumpPlan;
    plan.updatedAt = new Date();
  }

  /**
   * Add world state snapshot
   */
  addWorldStateSnapshot(
    planId: string,
    snapshot: Omit<WorldStateSnapshot, 'changesSinceLastSnapshot'>
  ): WorldStateSnapshot {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    // Calculate changes since last snapshot
    const lastSnapshot = plan.worldStateProgression[plan.worldStateProgression.length - 1];
    const changes = lastSnapshot
      ? this.calculateWorldStateChanges(lastSnapshot.state, snapshot.state)
      : ['Initial state'];

    const fullSnapshot: WorldStateSnapshot = {
      ...snapshot,
      changesSinceLastSnapshot: changes,
    };

    plan.worldStateProgression.push(fullSnapshot);
    plan.worldStateProgression.sort((a, b) => a.year - b.year);
    plan.updatedAt = new Date();

    return fullSnapshot;
  }

  /**
   * Calculate changes between world states
   */
  private calculateWorldStateChanges(
    previous: WorldState,
    current: WorldState
  ): string[] {
    const changes: string[] = [];

    // Political changes
    if (JSON.stringify(previous.political) !== JSON.stringify(current.political)) {
      changes.push('Political landscape shifted');
    }

    // Technological changes
    if (JSON.stringify(previous.technological) !== JSON.stringify(current.technological)) {
      changes.push('Technological advancement');
    }

    // Social changes
    if (JSON.stringify(previous.social) !== JSON.stringify(current.social)) {
      changes.push('Social transformation');
    }

    // Environmental changes
    if (JSON.stringify(previous.environmental) !== JSON.stringify(current.environmental)) {
      changes.push('Environmental change');
    }

    // Supernatural changes
    if (JSON.stringify(previous.supernatural) !== JSON.stringify(current.supernatural)) {
      changes.push('Supernatural shift');
    }

    return changes.length > 0 ? changes : ['Minor changes'];
  }

  // ==========================================================================
  // GENERATION HELPERS
  // ==========================================================================

  /**
   * Generate a generation roadmap for the entire millennium
   */
  generateRoadmap(planId: string): GenerationRoadmap {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    const segments: GenerationSegment[] = [];

    for (const era of plan.eras) {
      // Create segments for each arc in the era
      if (era.arcs.length > 0) {
        for (const arc of era.arcs) {
          for (const event of arc.keyEvents) {
            segments.push({
              id: uuidv4(),
              type: event.importance === 'pivotal' ? 'crucial' : event.importance === 'major' ? 'major' : 'standard',
              eraId: era.id,
              arcId: arc.id,
              eventId: event.id,
              year: event.year,
              description: event.description,
              estimatedWords: plan.generationConfig.detailLevel[
                event.importance === 'pivotal' ? 'major' :
                event.importance === 'major' ? 'moderate' : 'minor'
              ],
              dependencies: event.foreshadowedBy || [],
              validates: event.foreshadows || [],
              characters: event.participants,
              priority: event.importance === 'pivotal' ? 1 : event.importance === 'major' ? 2 : 3,
            });
          }
        }

        // Add transitions between arcs
        if (era.arcs.length > 1) {
          for (let i = 1; i < era.arcs.length; i++) {
            segments.push({
              id: uuidv4(),
              type: 'transition',
              eraId: era.id,
              arcId: era.arcs[i].id,
              year: era.arcs[i].startYear,
              description: `Transition from ${era.arcs[i-1].name} to ${era.arcs[i].name}`,
              estimatedWords: 5000,
              dependencies: [era.arcs[i-1].id],
              validates: [],
              characters: [],
              priority: 2,
            });
          }
        }
      } else {
        // Generate default segments for eras without explicit arcs
        // Create segments at key points: start, middle, and end of era
        const eraLength = era.endYear - era.startYear;
        const segmentInterval = Math.max(10, Math.floor(eraLength / 5)); // ~5 segments per era minimum

        for (let year = era.startYear; year < era.endYear; year += segmentInterval) {
          const isStart = year === era.startYear;
          const isEnd = year + segmentInterval >= era.endYear;

          segments.push({
            id: uuidv4(),
            type: isStart || isEnd ? 'major' : 'standard',
            eraId: era.id,
            year,
            description: isStart ? `${era.name} begins - establishing the era` :
                         isEnd ? `${era.name} concludes - era transitions` :
                         `${era.name} continues - year ${year} events`,
            estimatedWords: isStart || isEnd ? plan.generationConfig.detailLevel.major :
                            plan.generationConfig.detailLevel.moderate,
            dependencies: [],
            validates: [],
            characters: era.prominentCharacters || [],
            priority: isStart ? 1 : isEnd ? 2 : 3,
          });
        }
      }
    }

    // Sort by year
    segments.sort((a, b) => a.year - b.year);

    // Calculate total estimated words
    const totalWords = segments.reduce((sum, s) => sum + s.estimatedWords, 0);

    return {
      planId,
      segments,
      totalSegments: segments.length,
      totalEstimatedWords: totalWords,
      estimatedDuration: `${Math.ceil(totalWords / 50000)} sessions at 50k words/session`,
    };
  }

  /**
   * Get consistency requirements for a segment
   */
  getSegmentConsistencyRequirements(
    planId: string,
    segmentYear: number
  ): ConsistencyRequirements {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    // Find applicable era
    const era = plan.eras.find(e => e.startYear <= segmentYear && e.endYear >= segmentYear);

    // Find world state
    const worldStates = plan.worldStateProgression.filter(s => s.year <= segmentYear);
    const currentWorldState = worldStates[worldStates.length - 1];

    // Find active threads
    const activeThreads = plan.millenniumThreads.filter(
      t => t.startYear <= segmentYear && t.endYear >= segmentYear
    );

    // Find relevant prophecies
    const relevantProphecies = plan.prophecies.filter(
      p => p.spokenYear <= segmentYear && p.fulfillmentYear >= segmentYear
    );

    // Find active long-lived characters
    const activeLongLived = plan.longLivedCharacters.filter(c =>
      c.activeRanges.some(r => r.startYear <= segmentYear && r.endYear >= segmentYear)
    );

    // Find past crucible moments that should have consequences
    const relevantCrucibles = plan.crucibleMoments.filter(
      c => c.year <= segmentYear &&
      c.consequences.some(con => c.year + con.manifestsIn >= segmentYear)
    );

    return {
      year: segmentYear,
      eraContext: era ? {
        id: era.id,
        name: era.name,
        tone: era.tone,
        powerLevel: era.powerLevel,
        themes: era.themes,
      } : undefined,
      worldState: currentWorldState?.state,
      activeMillenniumThreads: activeThreads.map(t => ({
        id: t.id,
        name: t.name,
        currentIntensity: t.manifestations.find(m => m.eraId === era?.id)?.intensity || 5,
      })),
      activeProphecies: relevantProphecies.map(p => ({
        id: p.id,
        text: p.text,
        componentsRemaining: p.components.filter(c => !c.fulfilled).length,
      })),
      activeLongLivedCharacters: activeLongLived.map(c => ({
        id: c.id,
        name: c.name,
        currentRole: c.eraRoles.find(r => r.eraId === era?.id)?.role || 'background',
      })),
      activeConsequences: relevantCrucibles.flatMap(c =>
        c.consequences
          .filter(con => c.year + con.manifestsIn <= segmentYear)
          .map(con => ({
            fromEvent: c.name,
            description: con.description,
            severity: con.severity,
          }))
      ),
    };
  }

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  /**
   * Validate plan for completeness and consistency
   */
  validatePlan(planId: string): PlanValidationResult {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);

    const issues: PlanValidationIssue[] = [];
    const warnings: string[] = [];

    // Check era coverage
    const totalEraCoverage = plan.eras.reduce((sum, e) => sum + (e.endYear - e.startYear), 0);
    if (totalEraCoverage < plan.totalYears) {
      issues.push({
        type: 'gap',
        severity: 'critical',
        description: `Eras only cover ${totalEraCoverage} years but plan is for ${plan.totalYears} years`,
        location: 'eras',
      });
    }

    // Check for era overlaps
    for (let i = 1; i < plan.eras.length; i++) {
      if (plan.eras[i].startYear < plan.eras[i-1].endYear) {
        issues.push({
          type: 'overlap',
          severity: 'critical',
          description: `Era "${plan.eras[i].name}" overlaps with "${plan.eras[i-1].name}"`,
          location: 'eras',
        });
      }
    }

    // Check prophecies have fulfillment plans
    for (const prophecy of plan.prophecies) {
      if (prophecy.fulfillmentYear > plan.startYear + plan.totalYears) {
        issues.push({
          type: 'unfulfilled',
          severity: 'major',
          description: `Prophecy "${prophecy.name}" fulfillment is beyond plan scope`,
          location: `prophecy:${prophecy.id}`,
        });
      }
    }

    // Check threads have resolutions
    for (const thread of plan.millenniumThreads) {
      if (!thread.resolution) {
        warnings.push(`Thread "${thread.name}" has no planned resolution`);
      }
    }

    // Check long-lived characters have coverage
    for (const character of plan.longLivedCharacters) {
      const totalActiveYears = character.activeRanges.reduce(
        (sum, r) => sum + (r.endYear - r.startYear), 0
      );
      if (totalActiveYears < plan.totalYears * 0.1) {
        warnings.push(`Long-lived character "${character.name}" is only active for ${totalActiveYears} years`);
      }
    }

    // Check theme evolution
    if (!plan.themeEvolution.centralTheme) {
      warnings.push('No central theme defined');
    }

    // Check word count feasibility
    const estimatedWords = plan.eras.reduce((sum, e) => sum + e.targetWordCount, 0);
    if (estimatedWords > plan.generationConfig.targetWordCount * 1.5) {
      warnings.push(`Estimated words (${estimatedWords}) exceeds target by >50%`);
    }

    return {
      valid: issues.filter(i => i.severity === 'critical').length === 0,
      issues,
      warnings,
      coverage: {
        yearsPlanned: totalEraCoverage,
        erasDefined: plan.eras.length,
        arcsPlanned: plan.eras.reduce((sum, e) => sum + e.arcs.length, 0),
        crucibleMoments: plan.crucibleMoments.length,
        prophecies: plan.prophecies.length,
        threads: plan.millenniumThreads.length,
      },
    };
  }

  // ==========================================================================
  // ACCESSORS
  // ==========================================================================

  /**
   * Get a plan by ID
   */
  getPlan(planId: string): MillenniumPlan | undefined {
    return this.plans.get(planId);
  }

  /**
   * Get active plan
   */
  getActivePlan(): MillenniumPlan | undefined {
    return this.activePlanId ? this.plans.get(this.activePlanId) : undefined;
  }

  /**
   * Set active plan
   */
  setActivePlan(planId: string): void {
    if (!this.plans.has(planId)) {
      throw new Error(`Plan ${planId} not found`);
    }
    this.activePlanId = planId;
  }

  /**
   * Get all plans
   */
  getAllPlans(): MillenniumPlan[] {
    return Array.from(this.plans.values());
  }

  /**
   * Export plan to JSON
   */
  exportPlan(planId: string): string {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);
    return JSON.stringify(plan, null, 2);
  }

  /**
   * Import plan from JSON
   */
  importPlan(json: string): MillenniumPlan {
    const plan = JSON.parse(json) as MillenniumPlan;
    plan.createdAt = new Date(plan.createdAt);
    plan.updatedAt = new Date(plan.updatedAt);
    this.plans.set(plan.id, plan);
    return plan;
  }

  /**
   * Delete a plan
   */
  deletePlan(planId: string): boolean {
    if (this.activePlanId === planId) {
      this.activePlanId = null;
    }
    return this.plans.delete(planId);
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalPlans: number;
    activePlanId: string | null;
    totalYearsPlanned: number;
    totalEras: number;
    totalArcs: number;
  } {
    const plans = Array.from(this.plans.values());
    return {
      totalPlans: plans.length,
      activePlanId: this.activePlanId,
      totalYearsPlanned: plans.reduce((sum, p) => sum + p.totalYears, 0),
      totalEras: plans.reduce((sum, p) => sum + p.eras.length, 0),
      totalArcs: plans.reduce((sum, p) => sum + p.eras.reduce((s, e) => s + e.arcs.length, 0), 0),
    };
  }
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface GenerationRoadmap {
  planId: string;
  segments: GenerationSegment[];
  totalSegments: number;
  totalEstimatedWords: number;
  estimatedDuration: string;
}

export interface GenerationSegment {
  id: string;
  type: 'crucial' | 'major' | 'standard' | 'transition' | 'time_skip';
  eraId: string;
  arcId?: string;
  eventId?: string;
  year: number;
  description: string;
  estimatedWords: number;
  dependencies: string[];
  validates: string[];
  characters: string[];
  priority: number;
}

export interface ConsistencyRequirements {
  year: number;
  eraContext?: {
    id: string;
    name: string;
    tone: EraTonet;
    powerLevel: PowerLevel;
    themes: string[];
  };
  worldState?: WorldState;
  activeMillenniumThreads: {
    id: string;
    name: string;
    currentIntensity: number;
  }[];
  activeProphecies: {
    id: string;
    text: string;
    componentsRemaining: number;
  }[];
  activeLongLivedCharacters: {
    id: string;
    name: string;
    currentRole: string;
  }[];
  activeConsequences: {
    fromEvent: string;
    description: string;
    severity: string;
  }[];
}

export interface PlanValidationResult {
  valid: boolean;
  issues: PlanValidationIssue[];
  warnings: string[];
  coverage: {
    yearsPlanned: number;
    erasDefined: number;
    arcsPlanned: number;
    crucibleMoments: number;
    prophecies: number;
    threads: number;
  };
}

export interface PlanValidationIssue {
  type: 'gap' | 'overlap' | 'unfulfilled' | 'inconsistency' | 'missing';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  location: string;
}

// ============================================================================
// EXPORT
// ============================================================================

export default MillenniumPlanner;
