/**
 * Epic Fiction Architect - Emotion Arc Engine
 *
 * Emotional pacing and reader journey tracking for epic fiction:
 * - Scene-by-scene emotional tracking
 * - Character emotional states over time
 * - Reader emotional journey mapping
 * - Pacing analysis and recommendations
 * - Catharsis and climax detection
 * - Emotional rhythm patterns
 * - Rest periods and breathing room
 *
 * Designed for narratives spanning 12,000+ chapters requiring
 * careful emotional pacing to avoid reader fatigue.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Core emotional categories
 */
export enum EmotionType {
  // Positive
  JOY = 'joy',
  HOPE = 'hope',
  LOVE = 'love',
  TRIUMPH = 'triumph',
  WONDER = 'wonder',
  CONTENTMENT = 'contentment',
  EXCITEMENT = 'excitement',
  RELIEF = 'relief',
  PRIDE = 'pride',
  GRATITUDE = 'gratitude',
  HUMOR = 'humor',

  // Negative
  SADNESS = 'sadness',
  FEAR = 'fear',
  ANGER = 'anger',
  DESPAIR = 'despair',
  GRIEF = 'grief',
  ANXIETY = 'anxiety',
  DREAD = 'dread',
  HORROR = 'horror',
  SHAME = 'shame',
  GUILT = 'guilt',
  FRUSTRATION = 'frustration',

  // Complex
  BITTERSWEET = 'bittersweet',
  MELANCHOLY = 'melancholy',
  NOSTALGIA = 'nostalgia',
  TENSION = 'tension',
  SUSPENSE = 'suspense',
  ANTICIPATION = 'anticipation',
  AMBIVALENCE = 'ambivalence',
  AWE = 'awe',
  CATHARSIS = 'catharsis',

  // Neutral
  CALM = 'calm',
  NEUTRAL = 'neutral',
  CURIOSITY = 'curiosity',
  CONTEMPLATION = 'contemplation'
}

/**
 * Emotional intensity levels
 */
export enum EmotionIntensity {
  SUBTLE = 'subtle',           // Background emotion (1-2)
  MILD = 'mild',               // Noticeable but not dominant (3-4)
  MODERATE = 'moderate',       // Clear emotional impact (5-6)
  STRONG = 'strong',           // Powerful emotional response (7-8)
  OVERWHELMING = 'overwhelming' // Peak emotional intensity (9-10)
}

/**
 * Scene pacing categories
 */
export enum PaceType {
  BREAKNECK = 'breakneck',     // Extremely fast, action-heavy
  FAST = 'fast',               // Quick pacing, high energy
  MODERATE = 'moderate',       // Balanced pacing
  SLOW = 'slow',               // Deliberate, contemplative
  CONTEMPLATIVE = 'contemplative', // Very slow, introspective
  BREATHING_ROOM = 'breathing_room' // Rest/recovery section
}

/**
 * Types of emotional beats
 */
export enum EmotionalBeatType {
  // Story beats
  HOOK = 'hook',               // Grabs attention
  INCITING = 'inciting',       // Disrupts status quo
  COMPLICATION = 'complication', // Raises stakes
  CRISIS = 'crisis',           // Forcing choice
  CLIMAX = 'climax',           // Peak moment
  RESOLUTION = 'resolution',   // Aftermath

  // Emotional beats
  CATHARSIS = 'catharsis',     // Emotional release
  TWIST = 'twist',             // Unexpected turn
  REVELATION = 'revelation',   // Truth revealed
  REUNION = 'reunion',         // Characters reunite
  SEPARATION = 'separation',   // Characters part
  SACRIFICE = 'sacrifice',     // Selfless act
  BETRAYAL = 'betrayal',       // Trust broken
  REDEMPTION = 'redemption',   // Character redeemed

  // Pacing beats
  REST = 'rest',               // Quiet moment
  BUILDUP = 'buildup',         // Tension increasing
  RELEASE = 'release',         // Tension releasing
  TRANSITION = 'transition'    // Scene change
}

/**
 * Reader emotional state predictions
 */
export enum ReaderState {
  ENGAGED = 'engaged',
  EXCITED = 'excited',
  TENSE = 'tense',
  EMOTIONAL = 'emotional',
  SATISFIED = 'satisfied',
  EXHAUSTED = 'exhausted',
  BORED = 'bored',
  CONFUSED = 'confused',
  FRUSTRATED = 'frustrated',
  INVESTED = 'invested'
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Emotional beat in a scene/chapter
 */
export interface EmotionalBeat {
  id: string;
  chapter: number;
  scene?: number;
  position: number;          // Position within chapter (0-100%)

  // Beat type
  beatType: EmotionalBeatType;
  primaryEmotion: EmotionType;
  secondaryEmotions: EmotionType[];

  // Intensity
  intensity: number;         // 1-10 scale
  intensityLevel: EmotionIntensity;

  // Pacing
  pace: PaceType;
  durationInWords?: number;  // Approximate word count

  // Characters involved
  characterIds: string[];
  characterNames: string[];
  povCharacterId?: string;
  povCharacterName?: string;

  // Context
  description: string;
  triggers: string[];        // What causes this emotion
  consequences: string[];    // What this emotion leads to

  // Narrative significance
  isClimactic: boolean;
  isTurningPoint: boolean;
  arcId?: string;            // Related character arc

  // Metadata
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chapter-level emotional summary
 */
export interface ChapterEmotionalProfile {
  chapter: number;
  title?: string;

  // Dominant emotions
  dominantEmotion: EmotionType;
  emotionalSignature: { emotion: EmotionType; weight: number }[];

  // Metrics
  averageIntensity: number;
  peakIntensity: number;
  emotionalRange: number;    // Variety of emotions
  paceScore: number;         // Overall pace (1-10, 10 = fastest)

  // Beats
  totalBeats: number;
  climacticBeats: number;
  restBeats: number;

  // Pacing analysis
  pacingPattern: PaceType[];
  suggestedAdjustments: string[];

  // Reader impact
  predictedReaderState: ReaderState;
  fatigueFactor: number;     // 0-100, risk of reader fatigue

  // Timestamps
  analyzedAt: Date;
}

/**
 * Arc-level emotional journey
 */
export interface EmotionalArc {
  id: string;
  name: string;
  description: string;

  // Scope
  startChapter: number;
  endChapter?: number;
  characterIds: string[];

  // Journey
  emotionalJourney: {
    chapter: number;
    dominantEmotion: EmotionType;
    intensity: number;
  }[];

  // Key moments
  keyMoments: {
    chapter: number;
    description: string;
    beatType: EmotionalBeatType;
    significance: 'minor' | 'moderate' | 'major' | 'pivotal';
  }[];

  // Pattern analysis
  pattern: 'rising' | 'falling' | 'wave' | 'plateau' | 'zigzag' | 'custom';
  peakChapter?: number;
  peakEmotion?: EmotionType;
  nadirChapter?: number;
  nadirEmotion?: EmotionType;

  // Metadata
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pacing recommendation
 */
export interface PacingRecommendation {
  id: string;
  chapter: number;
  type: 'warning' | 'suggestion' | 'critical';
  category: 'too_fast' | 'too_slow' | 'monotonous' | 'fatigue_risk' | 'missing_rest' | 'climax_proximity';
  message: string;
  suggestedAction: string;
  affectedChapters: number[];
  priority: number;          // 1-10, 10 = most urgent
  createdAt: Date;
}

/**
 * Reader journey tracking
 */
export interface ReaderJourney {
  // Cumulative metrics
  totalEmotionalIntensity: number;
  chaptersRead: number;
  peakMoments: { chapter: number; emotion: EmotionType; intensity: number }[];

  // Current state
  currentFatigue: number;    // 0-100
  recentEmotions: EmotionType[];
  consecutiveHighIntensity: number;
  chaptersSinceRest: number;

  // Historical
  emotionalHistory: {
    chapter: number;
    averageIntensity: number;
    dominantEmotion: EmotionType;
    fatigueAtEnd: number;
  }[];

  // Analysis
  engagementCurve: number[]; // Per-chapter engagement estimate
  recommendedBreakPoints: number[]; // Good chapters to pause reading
}

/**
 * Configuration for the emotion arc engine
 */
export interface EmotionArcEngineConfig {
  maxConsecutiveHighIntensity: number;    // Before fatigue warning
  restFrequency: number;                   // Chapters between rest beats
  climaxCooldown: number;                  // Chapters between climaxes
  fatigueRecoveryRate: number;            // Per rest chapter
  intensityThresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

// ============================================================================
// EMOTION ARC ENGINE
// ============================================================================

/**
 * Manages emotional pacing and reader journey for epic fiction
 */
export class EmotionArcEngine {
  // Primary storage
  private beats: Map<string, EmotionalBeat> = new Map();
  private chapterProfiles: Map<number, ChapterEmotionalProfile> = new Map();
  private arcs: Map<string, EmotionalArc> = new Map();
  private recommendations: Map<string, PacingRecommendation> = new Map();

  // Indexes
  private beatsByChapter: Map<number, string[]> = new Map();
  private beatsByCharacter: Map<string, string[]> = new Map();
  private beatsByEmotion: Map<EmotionType, string[]> = new Map();
  private arcsByCharacter: Map<string, string[]> = new Map();

  // Reader journey
  private readerJourney: ReaderJourney;

  // Configuration
  private config: EmotionArcEngineConfig;

  constructor(config: Partial<EmotionArcEngineConfig> = {}) {
    this.config = {
      maxConsecutiveHighIntensity: 5,
      restFrequency: 10,
      climaxCooldown: 20,
      fatigueRecoveryRate: 10,
      intensityThresholds: {
        low: 3,
        medium: 6,
        high: 8
      },
      ...config
    };

    this.readerJourney = this.createEmptyJourney();
  }

  // ==========================================================================
  // EMOTIONAL BEATS
  // ==========================================================================

  /**
   * Record an emotional beat
   */
  recordBeat(params: {
    chapter: number;
    scene?: number;
    position?: number;
    beatType: EmotionalBeatType;
    primaryEmotion: EmotionType;
    secondaryEmotions?: EmotionType[];
    intensity: number;
    pace?: PaceType;
    characterIds?: string[];
    characterNames?: string[];
    povCharacterId?: string;
    povCharacterName?: string;
    description: string;
    triggers?: string[];
    isClimactic?: boolean;
    isTurningPoint?: boolean;
    arcId?: string;
  }): EmotionalBeat {
    const beat: EmotionalBeat = {
      id: uuidv4(),
      chapter: params.chapter,
      scene: params.scene,
      position: params.position ?? 50,
      beatType: params.beatType,
      primaryEmotion: params.primaryEmotion,
      secondaryEmotions: params.secondaryEmotions || [],
      intensity: Math.max(1, Math.min(10, params.intensity)),
      intensityLevel: this.getIntensityLevel(params.intensity),
      pace: params.pace || PaceType.MODERATE,
      characterIds: params.characterIds || [],
      characterNames: params.characterNames || [],
      povCharacterId: params.povCharacterId,
      povCharacterName: params.povCharacterName,
      description: params.description,
      triggers: params.triggers || [],
      consequences: [],
      isClimactic: params.isClimactic || false,
      isTurningPoint: params.isTurningPoint || false,
      arcId: params.arcId,
      tags: [],
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store
    this.beats.set(beat.id, beat);

    // Index
    this.indexBeat(beat);

    // Update reader journey
    this.updateReaderJourney(beat);

    // Check for pacing issues
    this.checkPacing(beat);

    return beat;
  }

  /**
   * Get a beat by ID
   */
  getBeat(id: string): EmotionalBeat | undefined {
    return this.beats.get(id);
  }

  /**
   * Get beats for a chapter
   */
  getBeatsForChapter(chapter: number): EmotionalBeat[] {
    const beatIds = this.beatsByChapter.get(chapter) || [];
    return beatIds
      .map(id => this.beats.get(id))
      .filter((b): b is EmotionalBeat => b !== undefined)
      .sort((a, b) => a.position - b.position);
  }

  /**
   * Get beats for a character
   */
  getBeatsForCharacter(characterId: string): EmotionalBeat[] {
    const beatIds = this.beatsByCharacter.get(characterId) || [];
    return beatIds
      .map(id => this.beats.get(id))
      .filter((b): b is EmotionalBeat => b !== undefined)
      .sort((a, b) => a.chapter - b.chapter || a.position - b.position);
  }

  /**
   * Update a beat
   */
  updateBeat(id: string, updates: Partial<Omit<EmotionalBeat, 'id' | 'createdAt'>>): EmotionalBeat {
    const beat = this.beats.get(id);
    if (!beat) {
      throw new Error(`Beat not found: ${id}`);
    }

    Object.assign(beat, updates, { updatedAt: new Date() });

    if (updates.intensity !== undefined) {
      beat.intensityLevel = this.getIntensityLevel(updates.intensity);
    }

    return beat;
  }

  // ==========================================================================
  // CHAPTER PROFILES
  // ==========================================================================

  /**
   * Generate emotional profile for a chapter
   */
  generateChapterProfile(chapter: number): ChapterEmotionalProfile {
    const beats = this.getBeatsForChapter(chapter);

    if (beats.length === 0) {
      return this.createEmptyProfile(chapter);
    }

    // Calculate emotional signature
    const emotionCounts = new Map<EmotionType, { count: number; totalIntensity: number }>();
    let totalIntensity = 0;
    let peakIntensity = 0;
    let climacticCount = 0;
    let restCount = 0;
    const pacePattern: PaceType[] = [];

    for (const beat of beats) {
      // Primary emotion
      const primary = emotionCounts.get(beat.primaryEmotion) || { count: 0, totalIntensity: 0 };
      primary.count++;
      primary.totalIntensity += beat.intensity;
      emotionCounts.set(beat.primaryEmotion, primary);

      // Secondary emotions
      for (const secondary of beat.secondaryEmotions) {
        const sec = emotionCounts.get(secondary) || { count: 0, totalIntensity: 0 };
        sec.count++;
        sec.totalIntensity += beat.intensity * 0.5;
        emotionCounts.set(secondary, sec);
      }

      totalIntensity += beat.intensity;
      peakIntensity = Math.max(peakIntensity, beat.intensity);

      if (beat.isClimactic) climacticCount++;
      if (beat.beatType === EmotionalBeatType.REST) restCount++;

      pacePattern.push(beat.pace);
    }

    // Find dominant emotion
    let dominantEmotion = EmotionType.NEUTRAL;
    let maxWeight = 0;
    const emotionalSignature: { emotion: EmotionType; weight: number }[] = [];

    for (const [emotion, data] of emotionCounts) {
      const weight = data.totalIntensity / beats.length;
      emotionalSignature.push({ emotion, weight });
      if (weight > maxWeight) {
        maxWeight = weight;
        dominantEmotion = emotion;
      }
    }

    emotionalSignature.sort((a, b) => b.weight - a.weight);

    // Calculate pace score
    const paceScores: Record<PaceType, number> = {
      [PaceType.BREAKNECK]: 10,
      [PaceType.FAST]: 8,
      [PaceType.MODERATE]: 5,
      [PaceType.SLOW]: 3,
      [PaceType.CONTEMPLATIVE]: 2,
      [PaceType.BREATHING_ROOM]: 1
    };
    const paceScore = pacePattern.reduce((sum, p) => sum + paceScores[p], 0) / pacePattern.length;

    // Predict reader state
    const avgIntensity = totalIntensity / beats.length;
    const predictedReaderState = this.predictReaderState(avgIntensity, climacticCount, restCount);

    // Calculate fatigue factor
    const fatigueFactor = this.calculateFatigue(avgIntensity, climacticCount, restCount);

    // Generate suggestions
    const suggestedAdjustments = this.generatePacingSuggestions(
      avgIntensity, paceScore, climacticCount, restCount, beats.length
    );

    const profile: ChapterEmotionalProfile = {
      chapter,
      dominantEmotion,
      emotionalSignature: emotionalSignature.slice(0, 5),
      averageIntensity: avgIntensity,
      peakIntensity,
      emotionalRange: emotionalSignature.length,
      paceScore,
      totalBeats: beats.length,
      climacticBeats: climacticCount,
      restBeats: restCount,
      pacingPattern: pacePattern,
      suggestedAdjustments,
      predictedReaderState,
      fatigueFactor,
      analyzedAt: new Date()
    };

    this.chapterProfiles.set(chapter, profile);
    return profile;
  }

  /**
   * Get chapter profile
   */
  getChapterProfile(chapter: number): ChapterEmotionalProfile | undefined {
    return this.chapterProfiles.get(chapter);
  }

  /**
   * Get profiles for a range of chapters
   */
  getProfileRange(startChapter: number, endChapter: number): ChapterEmotionalProfile[] {
    const profiles: ChapterEmotionalProfile[] = [];
    for (let chapter = startChapter; chapter <= endChapter; chapter++) {
      let profile = this.chapterProfiles.get(chapter);
      if (!profile) {
        profile = this.generateChapterProfile(chapter);
      }
      profiles.push(profile);
    }
    return profiles;
  }

  // ==========================================================================
  // EMOTIONAL ARCS
  // ==========================================================================

  /**
   * Create an emotional arc
   */
  createArc(params: {
    name: string;
    description: string;
    startChapter: number;
    characterIds: string[];
  }): EmotionalArc {
    const arc: EmotionalArc = {
      id: uuidv4(),
      name: params.name,
      description: params.description,
      startChapter: params.startChapter,
      characterIds: params.characterIds,
      emotionalJourney: [],
      keyMoments: [],
      pattern: 'custom',
      tags: [],
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.arcs.set(arc.id, arc);

    // Index by character
    for (const charId of params.characterIds) {
      if (!this.arcsByCharacter.has(charId)) {
        this.arcsByCharacter.set(charId, []);
      }
      this.arcsByCharacter.get(charId)!.push(arc.id);
    }

    return arc;
  }

  /**
   * Get an arc by ID
   */
  getArc(id: string): EmotionalArc | undefined {
    return this.arcs.get(id);
  }

  /**
   * Add a point to an emotional journey
   */
  addJourneyPoint(arcId: string, params: {
    chapter: number;
    dominantEmotion: EmotionType;
    intensity: number;
  }): void {
    const arc = this.arcs.get(arcId);
    if (!arc) {
      throw new Error(`Arc not found: ${arcId}`);
    }

    arc.emotionalJourney.push({
      chapter: params.chapter,
      dominantEmotion: params.dominantEmotion,
      intensity: params.intensity
    });

    // Sort by chapter
    arc.emotionalJourney.sort((a, b) => a.chapter - b.chapter);

    // Update pattern
    arc.pattern = this.detectPattern(arc.emotionalJourney);

    // Update peak/nadir
    let peak = { chapter: 0, intensity: 0, emotion: EmotionType.NEUTRAL };
    let nadir = { chapter: 0, intensity: 100, emotion: EmotionType.NEUTRAL };

    for (const point of arc.emotionalJourney) {
      if (point.intensity > peak.intensity) {
        peak = { chapter: point.chapter, intensity: point.intensity, emotion: point.dominantEmotion };
      }
      if (point.intensity < nadir.intensity) {
        nadir = { chapter: point.chapter, intensity: point.intensity, emotion: point.dominantEmotion };
      }
    }

    arc.peakChapter = peak.chapter;
    arc.peakEmotion = peak.emotion;
    arc.nadirChapter = nadir.chapter;
    arc.nadirEmotion = nadir.emotion;

    arc.updatedAt = new Date();
  }

  /**
   * Add a key moment to an arc
   */
  addKeyMoment(arcId: string, params: {
    chapter: number;
    description: string;
    beatType: EmotionalBeatType;
    significance: 'minor' | 'moderate' | 'major' | 'pivotal';
  }): void {
    const arc = this.arcs.get(arcId);
    if (!arc) {
      throw new Error(`Arc not found: ${arcId}`);
    }

    arc.keyMoments.push(params);
    arc.keyMoments.sort((a, b) => a.chapter - b.chapter);
    arc.updatedAt = new Date();
  }

  /**
   * Complete an arc
   */
  completeArc(arcId: string, endChapter: number): void {
    const arc = this.arcs.get(arcId);
    if (!arc) {
      throw new Error(`Arc not found: ${arcId}`);
    }

    arc.endChapter = endChapter;
    arc.updatedAt = new Date();
  }

  /**
   * Get arcs for a character
   */
  getArcsForCharacter(characterId: string): EmotionalArc[] {
    const arcIds = this.arcsByCharacter.get(characterId) || [];
    return arcIds
      .map(id => this.arcs.get(id))
      .filter((a): a is EmotionalArc => a !== undefined);
  }

  // ==========================================================================
  // PACING ANALYSIS
  // ==========================================================================

  /**
   * Analyze pacing for a range of chapters
   */
  analyzePacing(startChapter: number, endChapter: number): {
    overallPace: number;
    intensityCurve: number[];
    restDistribution: number[];
    climaxPositions: number[];
    recommendations: PacingRecommendation[];
    fatigueProjection: number[];
  } {
    const profiles = this.getProfileRange(startChapter, endChapter);

    const intensityCurve: number[] = [];
    const restDistribution: number[] = [];
    const climaxPositions: number[] = [];
    const fatigueProjection: number[] = [];
    let totalPace = 0;
    let currentFatigue = 0;

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      intensityCurve.push(profile.averageIntensity);
      totalPace += profile.paceScore;

      if (profile.restBeats > 0) {
        restDistribution.push(i);
      }

      if (profile.climacticBeats > 0) {
        climaxPositions.push(i);
      }

      // Calculate fatigue
      currentFatigue = Math.min(100, currentFatigue + profile.fatigueFactor);
      if (profile.restBeats > 0) {
        currentFatigue = Math.max(0, currentFatigue - this.config.fatigueRecoveryRate);
      }
      fatigueProjection.push(currentFatigue);
    }

    // Get recommendations for the range
    const recommendations = Array.from(this.recommendations.values())
      .filter(r => r.chapter >= startChapter && r.chapter <= endChapter)
      .sort((a, b) => b.priority - a.priority);

    return {
      overallPace: totalPace / profiles.length,
      intensityCurve,
      restDistribution,
      climaxPositions,
      recommendations,
      fatigueProjection
    };
  }

  /**
   * Get pacing recommendations
   */
  getRecommendations(chapter?: number): PacingRecommendation[] {
    const recs = Array.from(this.recommendations.values());

    if (chapter !== undefined) {
      return recs.filter(r => r.affectedChapters.includes(chapter));
    }

    return recs.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Find optimal break points for readers
   */
  findBreakPoints(startChapter: number, endChapter: number): number[] {
    const breakPoints: number[] = [];
    const profiles = this.getProfileRange(startChapter, endChapter);

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const chapter = startChapter + i;

      // Good break points: low intensity, after resolution, before new arc
      const isLowIntensity = profile.averageIntensity < this.config.intensityThresholds.low;
      const hasResolution = this.getBeatsForChapter(chapter)
        .some(b => b.beatType === EmotionalBeatType.RESOLUTION);
      const isBreathingRoom = profile.pacingPattern.includes(PaceType.BREATHING_ROOM);

      if (isLowIntensity || hasResolution || isBreathingRoom) {
        breakPoints.push(chapter);
      }
    }

    return breakPoints;
  }

  // ==========================================================================
  // READER JOURNEY
  // ==========================================================================

  /**
   * Get current reader journey state
   */
  getReaderJourney(): ReaderJourney {
    return { ...this.readerJourney };
  }

  /**
   * Simulate reading to a specific chapter
   */
  simulateReadingTo(chapter: number): ReaderJourney {
    // Reset journey
    const journey = this.createEmptyJourney();

    // Process all chapters up to target
    for (let ch = 1; ch <= chapter; ch++) {
      const beats = this.getBeatsForChapter(ch);

      if (beats.length === 0) continue;

      let chapterIntensity = 0;
      let chapterDominant = EmotionType.NEUTRAL;
      let maxIntensity = 0;

      for (const beat of beats) {
        chapterIntensity += beat.intensity;
        if (beat.intensity > maxIntensity) {
          maxIntensity = beat.intensity;
          chapterDominant = beat.primaryEmotion;
        }

        // Track peaks
        if (beat.intensity >= this.config.intensityThresholds.high) {
          journey.peakMoments.push({
            chapter: ch,
            emotion: beat.primaryEmotion,
            intensity: beat.intensity
          });
        }
      }

      const avgIntensity = chapterIntensity / beats.length;

      // Update fatigue
      if (avgIntensity >= this.config.intensityThresholds.high) {
        journey.consecutiveHighIntensity++;
        journey.currentFatigue = Math.min(100, journey.currentFatigue + 5);
        journey.chaptersSinceRest++;
      } else if (avgIntensity <= this.config.intensityThresholds.low) {
        journey.consecutiveHighIntensity = 0;
        journey.currentFatigue = Math.max(0, journey.currentFatigue - this.config.fatigueRecoveryRate);
        journey.chaptersSinceRest = 0;
      } else {
        journey.consecutiveHighIntensity = 0;
        journey.chaptersSinceRest++;
      }

      journey.totalEmotionalIntensity += chapterIntensity;
      journey.chaptersRead++;
      journey.recentEmotions.push(chapterDominant);
      if (journey.recentEmotions.length > 10) {
        journey.recentEmotions.shift();
      }

      // Record history
      journey.emotionalHistory.push({
        chapter: ch,
        averageIntensity: avgIntensity,
        dominantEmotion: chapterDominant,
        fatigueAtEnd: journey.currentFatigue
      });

      // Calculate engagement (simplified)
      const engagement = this.calculateEngagement(avgIntensity, journey.currentFatigue);
      journey.engagementCurve.push(engagement);
    }

    // Find recommended break points
    journey.recommendedBreakPoints = this.findBreakPoints(1, chapter);

    return journey;
  }

  /**
   * Reset reader journey
   */
  resetReaderJourney(): void {
    this.readerJourney = this.createEmptyJourney();
  }

  // ==========================================================================
  // VISUALIZATION DATA
  // ==========================================================================

  /**
   * Get data for intensity visualization
   */
  getIntensityVisualizationData(startChapter: number, endChapter: number): {
    chapters: number[];
    intensities: number[];
    emotions: EmotionType[];
    paces: PaceType[];
    climaxes: boolean[];
  } {
    const chapters: number[] = [];
    const intensities: number[] = [];
    const emotions: EmotionType[] = [];
    const paces: PaceType[] = [];
    const climaxes: boolean[] = [];

    for (let ch = startChapter; ch <= endChapter; ch++) {
      const profile = this.chapterProfiles.get(ch);
      chapters.push(ch);

      if (profile) {
        intensities.push(profile.averageIntensity);
        emotions.push(profile.dominantEmotion);
        paces.push(profile.pacingPattern[0] || PaceType.MODERATE);
        climaxes.push(profile.climacticBeats > 0);
      } else {
        intensities.push(0);
        emotions.push(EmotionType.NEUTRAL);
        paces.push(PaceType.MODERATE);
        climaxes.push(false);
      }
    }

    return { chapters, intensities, emotions, paces, climaxes };
  }

  /**
   * Get emotional heatmap data
   */
  getEmotionalHeatmap(startChapter: number, endChapter: number): {
    emotions: EmotionType[];
    chapters: number[];
    values: number[][];
  } {
    const allEmotions = new Set<EmotionType>();
    const chapterEmotions = new Map<number, Map<EmotionType, number>>();

    for (let ch = startChapter; ch <= endChapter; ch++) {
      const beats = this.getBeatsForChapter(ch);
      const emotionIntensity = new Map<EmotionType, number>();

      for (const beat of beats) {
        allEmotions.add(beat.primaryEmotion);
        const current = emotionIntensity.get(beat.primaryEmotion) || 0;
        emotionIntensity.set(beat.primaryEmotion, current + beat.intensity);

        for (const secondary of beat.secondaryEmotions) {
          allEmotions.add(secondary);
          const curr = emotionIntensity.get(secondary) || 0;
          emotionIntensity.set(secondary, curr + beat.intensity * 0.5);
        }
      }

      chapterEmotions.set(ch, emotionIntensity);
    }

    const emotions = Array.from(allEmotions);
    const chapters: number[] = [];
    const values: number[][] = [];

    for (let ch = startChapter; ch <= endChapter; ch++) {
      chapters.push(ch);
      const chapterValues: number[] = [];
      const emotionMap = chapterEmotions.get(ch) || new Map();

      for (const emotion of emotions) {
        chapterValues.push(emotionMap.get(emotion) || 0);
      }

      values.push(chapterValues);
    }

    return { emotions, chapters, values };
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Get intensity level from numeric value
   */
  private getIntensityLevel(intensity: number): EmotionIntensity {
    if (intensity <= 2) return EmotionIntensity.SUBTLE;
    if (intensity <= 4) return EmotionIntensity.MILD;
    if (intensity <= 6) return EmotionIntensity.MODERATE;
    if (intensity <= 8) return EmotionIntensity.STRONG;
    return EmotionIntensity.OVERWHELMING;
  }

  /**
   * Index a beat for fast lookups
   */
  private indexBeat(beat: EmotionalBeat): void {
    // By chapter
    if (!this.beatsByChapter.has(beat.chapter)) {
      this.beatsByChapter.set(beat.chapter, []);
    }
    this.beatsByChapter.get(beat.chapter)!.push(beat.id);

    // By character
    for (const charId of beat.characterIds) {
      if (!this.beatsByCharacter.has(charId)) {
        this.beatsByCharacter.set(charId, []);
      }
      this.beatsByCharacter.get(charId)!.push(beat.id);
    }

    // By emotion
    if (!this.beatsByEmotion.has(beat.primaryEmotion)) {
      this.beatsByEmotion.set(beat.primaryEmotion, []);
    }
    this.beatsByEmotion.get(beat.primaryEmotion)!.push(beat.id);
  }

  /**
   * Update reader journey with new beat
   */
  private updateReaderJourney(beat: EmotionalBeat): void {
    this.readerJourney.totalEmotionalIntensity += beat.intensity;

    if (beat.intensity >= this.config.intensityThresholds.high) {
      this.readerJourney.peakMoments.push({
        chapter: beat.chapter,
        emotion: beat.primaryEmotion,
        intensity: beat.intensity
      });
      this.readerJourney.consecutiveHighIntensity++;
      this.readerJourney.currentFatigue = Math.min(100, this.readerJourney.currentFatigue + 5);
    }

    if (beat.beatType === EmotionalBeatType.REST) {
      this.readerJourney.currentFatigue = Math.max(0,
        this.readerJourney.currentFatigue - this.config.fatigueRecoveryRate);
      this.readerJourney.consecutiveHighIntensity = 0;
      this.readerJourney.chaptersSinceRest = 0;
    }

    this.readerJourney.recentEmotions.push(beat.primaryEmotion);
    if (this.readerJourney.recentEmotions.length > 10) {
      this.readerJourney.recentEmotions.shift();
    }
  }

  /**
   * Check pacing and generate recommendations
   */
  private checkPacing(beat: EmotionalBeat): void {
    // Check for consecutive high intensity
    if (this.readerJourney.consecutiveHighIntensity >= this.config.maxConsecutiveHighIntensity) {
      this.addRecommendation({
        chapter: beat.chapter,
        type: 'warning',
        category: 'fatigue_risk',
        message: `${this.readerJourney.consecutiveHighIntensity} consecutive high-intensity beats detected`,
        suggestedAction: 'Consider adding a breathing room scene or lower intensity beat',
        affectedChapters: [beat.chapter],
        priority: 7
      });
    }

    // Check for missing rest
    if (this.readerJourney.chaptersSinceRest >= this.config.restFrequency) {
      this.addRecommendation({
        chapter: beat.chapter,
        type: 'suggestion',
        category: 'missing_rest',
        message: `${this.readerJourney.chaptersSinceRest} chapters since last rest beat`,
        suggestedAction: 'Consider adding a quiet moment or reflection scene',
        affectedChapters: [beat.chapter],
        priority: 5
      });
    }

    // Check climax proximity
    const recentClimax = this.readerJourney.peakMoments
      .filter(p => beat.chapter - p.chapter < this.config.climaxCooldown && p.chapter !== beat.chapter);

    if (beat.isClimactic && recentClimax.length > 0) {
      this.addRecommendation({
        chapter: beat.chapter,
        type: 'warning',
        category: 'climax_proximity',
        message: `Climactic beat too close to previous climax at chapter ${recentClimax[recentClimax.length - 1].chapter}`,
        suggestedAction: 'Space out climactic moments for maximum impact',
        affectedChapters: [beat.chapter, recentClimax[recentClimax.length - 1].chapter],
        priority: 6
      });
    }
  }

  /**
   * Add a pacing recommendation
   */
  private addRecommendation(params: Omit<PacingRecommendation, 'id' | 'createdAt'>): void {
    const rec: PacingRecommendation = {
      ...params,
      id: uuidv4(),
      createdAt: new Date()
    };
    this.recommendations.set(rec.id, rec);
  }

  /**
   * Predict reader state based on metrics
   */
  private predictReaderState(avgIntensity: number, climacticCount: number, restCount: number): ReaderState {
    if (avgIntensity >= 8 && climacticCount > 0) return ReaderState.EMOTIONAL;
    if (avgIntensity >= 7) return ReaderState.EXCITED;
    if (avgIntensity >= 6 && climacticCount === 0) return ReaderState.TENSE;
    if (avgIntensity <= 3 && restCount > 0) return ReaderState.SATISFIED;
    if (avgIntensity <= 2) return ReaderState.BORED;
    return ReaderState.ENGAGED;
  }

  /**
   * Calculate fatigue factor for a chapter
   */
  private calculateFatigue(avgIntensity: number, climacticCount: number, restCount: number): number {
    let fatigue = 0;

    // High intensity adds fatigue
    if (avgIntensity >= this.config.intensityThresholds.high) {
      fatigue += (avgIntensity - this.config.intensityThresholds.high) * 5;
    }

    // Climaxes add significant fatigue
    fatigue += climacticCount * 10;

    // Rest reduces fatigue
    fatigue -= restCount * this.config.fatigueRecoveryRate;

    return Math.max(0, Math.min(100, fatigue));
  }

  /**
   * Generate pacing suggestions
   */
  private generatePacingSuggestions(
    avgIntensity: number,
    paceScore: number,
    climacticCount: number,
    restCount: number,
    beatCount: number
  ): string[] {
    const suggestions: string[] = [];

    if (avgIntensity > 8 && restCount === 0) {
      suggestions.push('Consider adding a moment of respite to let readers process intense emotions');
    }

    if (paceScore > 8 && beatCount > 5) {
      suggestions.push('Pacing is very fast - consider slowing down to build atmosphere');
    }

    if (paceScore < 3 && beatCount > 3) {
      suggestions.push('Pacing is slow - consider adding more dynamic elements');
    }

    if (climacticCount > 2) {
      suggestions.push('Multiple climaxes may diminish individual impact - consider spreading them out');
    }

    return suggestions;
  }

  /**
   * Calculate engagement level
   */
  private calculateEngagement(intensity: number, fatigue: number): number {
    // High intensity is engaging, but fatigue reduces engagement
    const baseEngagement = Math.min(100, intensity * 10);
    const fatigueReduction = fatigue * 0.5;
    return Math.max(0, Math.min(100, baseEngagement - fatigueReduction));
  }

  /**
   * Detect emotional journey pattern
   */
  private detectPattern(journey: { chapter: number; intensity: number }[]): EmotionalArc['pattern'] {
    if (journey.length < 3) return 'custom';

    const intensities = journey.map(j => j.intensity);
    const trends: ('up' | 'down' | 'flat')[] = [];

    for (let i = 1; i < intensities.length; i++) {
      const diff = intensities[i] - intensities[i - 1];
      if (diff > 1) trends.push('up');
      else if (diff < -1) trends.push('down');
      else trends.push('flat');
    }

    const upCount = trends.filter(t => t === 'up').length;
    const downCount = trends.filter(t => t === 'down').length;
    const flatCount = trends.filter(t => t === 'flat').length;

    if (upCount > downCount * 2) return 'rising';
    if (downCount > upCount * 2) return 'falling';
    if (flatCount > upCount + downCount) return 'plateau';
    if (upCount > 0 && downCount > 0 && Math.abs(upCount - downCount) <= 2) return 'wave';
    if (trends.length > 4 && upCount > 1 && downCount > 1) return 'zigzag';

    return 'custom';
  }

  /**
   * Create empty reader journey
   */
  private createEmptyJourney(): ReaderJourney {
    return {
      totalEmotionalIntensity: 0,
      chaptersRead: 0,
      peakMoments: [],
      currentFatigue: 0,
      recentEmotions: [],
      consecutiveHighIntensity: 0,
      chaptersSinceRest: 0,
      emotionalHistory: [],
      engagementCurve: [],
      recommendedBreakPoints: []
    };
  }

  /**
   * Create empty chapter profile
   */
  private createEmptyProfile(chapter: number): ChapterEmotionalProfile {
    return {
      chapter,
      dominantEmotion: EmotionType.NEUTRAL,
      emotionalSignature: [],
      averageIntensity: 0,
      peakIntensity: 0,
      emotionalRange: 0,
      paceScore: 5,
      totalBeats: 0,
      climacticBeats: 0,
      restBeats: 0,
      pacingPattern: [],
      suggestedAdjustments: [],
      predictedReaderState: ReaderState.ENGAGED,
      fatigueFactor: 0,
      analyzedAt: new Date()
    };
  }

  // ==========================================================================
  // STANDARD API METHODS
  // ==========================================================================

  /**
   * Get engine statistics
   */
  getStats(): {
    totalBeats: number;
    totalChapterProfiles: number;
    totalArcs: number;
    totalRecommendations: number;
    beatsByEmotion: Record<string, number>;
    beatsByType: Record<string, number>;
    averageIntensity: number;
    climacticBeatCount: number;
    restBeatCount: number;
    currentReaderFatigue: number;
    criticalRecommendations: number;
  } {
    const beats = Array.from(this.beats.values());

    const byEmotion: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalIntensity = 0;
    let climacticCount = 0;
    let restCount = 0;

    for (const beat of beats) {
      byEmotion[beat.primaryEmotion] = (byEmotion[beat.primaryEmotion] || 0) + 1;
      byType[beat.beatType] = (byType[beat.beatType] || 0) + 1;
      totalIntensity += beat.intensity;
      if (beat.isClimactic) climacticCount++;
      if (beat.beatType === EmotionalBeatType.REST) restCount++;
    }

    const criticalRecs = Array.from(this.recommendations.values())
      .filter(r => r.type === 'critical').length;

    return {
      totalBeats: beats.length,
      totalChapterProfiles: this.chapterProfiles.size,
      totalArcs: this.arcs.size,
      totalRecommendations: this.recommendations.size,
      beatsByEmotion: byEmotion,
      beatsByType: byType,
      averageIntensity: beats.length > 0 ? totalIntensity / beats.length : 0,
      climacticBeatCount: climacticCount,
      restBeatCount: restCount,
      currentReaderFatigue: this.readerJourney.currentFatigue,
      criticalRecommendations: criticalRecs
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.beats.clear();
    this.chapterProfiles.clear();
    this.arcs.clear();
    this.recommendations.clear();
    this.beatsByChapter.clear();
    this.beatsByCharacter.clear();
    this.beatsByEmotion.clear();
    this.arcsByCharacter.clear();
    this.readerJourney = this.createEmptyJourney();
  }

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      beats: Array.from(this.beats.values()),
      chapterProfiles: Array.from(this.chapterProfiles.entries()),
      arcs: Array.from(this.arcs.values()),
      recommendations: Array.from(this.recommendations.values()),
      readerJourney: this.readerJourney,
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

    // Import beats
    for (const beat of data.beats || []) {
      beat.createdAt = new Date(beat.createdAt);
      beat.updatedAt = new Date(beat.updatedAt);
      this.beats.set(beat.id, beat);
      this.indexBeat(beat);
    }

    // Import chapter profiles
    for (const [chapter, profile] of data.chapterProfiles || []) {
      profile.analyzedAt = new Date(profile.analyzedAt);
      this.chapterProfiles.set(Number(chapter), profile);
    }

    // Import arcs
    for (const arc of data.arcs || []) {
      arc.createdAt = new Date(arc.createdAt);
      arc.updatedAt = new Date(arc.updatedAt);
      this.arcs.set(arc.id, arc);

      for (const charId of arc.characterIds) {
        if (!this.arcsByCharacter.has(charId)) {
          this.arcsByCharacter.set(charId, []);
        }
        this.arcsByCharacter.get(charId)!.push(arc.id);
      }
    }

    // Import recommendations
    for (const rec of data.recommendations || []) {
      rec.createdAt = new Date(rec.createdAt);
      this.recommendations.set(rec.id, rec);
    }

    // Import reader journey
    if (data.readerJourney) {
      this.readerJourney = data.readerJourney;
    }

    // Import config
    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
  }
}

// Export default instance
export default EmotionArcEngine;
