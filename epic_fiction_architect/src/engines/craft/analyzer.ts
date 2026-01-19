/**
 * Epic Fiction Architect - Writing Craft Analyzer
 *
 * Computational analysis of prose quality based on techniques from
 * award-winning literature (Hugo, Nebula, Pulitzer, Booker Prize winners).
 *
 * Core Analysis Features:
 * - Emotional arc detection (Vonnegut's 6 core shapes + Reagan et al. research)
 * - Prose rhythm and pacing analysis
 * - Show vs Tell detection
 * - Sensory detail density measurement
 * - Dialogue authenticity and voice differentiation
 * - Thematic coherence and symbolism tracking
 * - Sentence variety analysis
 */

import {v4 as uuidv4} from 'uuid';

// ============================================================================
// TYPES
// ============================================================================

/**
 * The six fundamental emotional arc shapes from computational narratology
 * research (Reagan et al. "The emotional arcs of stories")
 */
export type EmotionalArcType =
  | 'rags_to_riches'      // Rise - steady climb to success
  | 'tragedy'             // Fall - steady decline
  | 'man_in_hole'         // Fall then Rise - classic problem-solving arc
  | 'icarus'              // Rise then Fall - hubris narrative
  | 'cinderella'          // Rise, Fall, Rise - complex triumph
  | 'oedipus';            // Fall, Rise, Fall - complex tragedy

/**
 * Emotional valence at a story point
 */
export interface EmotionalValence {
  position: number;          // 0-1 normalized position in narrative
  valence: number;          // -1 to 1 (negative to positive emotion)
  intensity: number;        // 0-1 strength of emotion
  dominantEmotion: string;  // joy, sadness, fear, anger, surprise, anticipation
  context: string;          // Scene or chapter reference
}

/**
 * Complete emotional arc analysis
 */
export interface EmotionalArcAnalysis {
  primaryArc: EmotionalArcType;
  confidence: number;
  arcPoints: EmotionalValence[];
  subArcs: {
    range: [number, number];
    type: EmotionalArcType;
    intensity: number;
  }[];
  suggestions: string[];
}

/**
 * Prose rhythm metrics
 */
export interface RhythmAnalysis {
  averageSentenceLength: number;
  sentenceLengthVariance: number;
  rhythmScore: number;           // 0-1, higher = better variety
  pacingZones: PacingZone[];
  suggestions: string[];
}

export interface PacingZone {
  startPosition: number;
  endPosition: number;
  pace: 'rapid' | 'moderate' | 'slow' | 'contemplative';
  avgSentenceLength: number;
  effectivenessScore: number;    // Does pace match content?
}

/**
 * Show vs Tell analysis
 */
export interface ShowTellAnalysis {
  showRatio: number;              // 0-1, proportion of "show"
  tellInstances: TellInstance[];
  overallScore: number;
  suggestions: string[];
}

export interface TellInstance {
  text: string;
  position: number;
  type: 'emotion_telling' | 'state_telling' | 'summary_telling' | 'explanation';
  severity: 'minor' | 'moderate' | 'significant';
  suggestedRevision?: string;
}

/**
 * Sensory detail analysis
 */
export interface SensoryAnalysis {
  densityScore: number;           // 0-1
  senseDistribution: {
    visual: number;
    auditory: number;
    tactile: number;
    olfactory: number;
    gustatory: number;
    kinesthetic: number;          // Movement, body position
  };
  balanceScore: number;           // How well-distributed across senses
  suggestions: string[];
}

/**
 * Dialogue analysis
 */
export interface DialogueAnalysis {
  voiceDifferentiation: number;   // 0-1, how distinct are character voices
  authenticityScore: number;      // 0-1, natural vs stilted
  subtextPresence: number;        // 0-1, hidden meaning in dialogue
  beatUsage: number;              // Action beats vs dialogue tags ratio
  characterVoices: CharacterVoiceProfile[];
  suggestions: string[];
}

export interface CharacterVoiceProfile {
  characterId: string;
  characterName: string;
  avgSentenceLength: number;
  vocabularyLevel: 'simple' | 'moderate' | 'sophisticated' | 'mixed';
  contractionUsage: number;       // 0-1
  uniquePatterns: string[];       // Catchphrases, speech patterns
  distinctivenessScore: number;   // How different from other characters
}

/**
 * Thematic analysis
 */
export interface ThematicAnalysis {
  identifiedThemes: IdentifiedTheme[];
  coherenceScore: number;         // 0-1, how well themes are maintained
  symbolismDensity: number;       // Symbols per 1000 words
  motifTracking: TrackedMotif[];
  suggestions: string[];
}

export interface IdentifiedTheme {
  theme: string;
  confidence: number;
  supportingEvidence: string[];
  resonance: number;              // How powerfully conveyed
}

export interface TrackedMotif {
  motif: string;
  occurrences: {position: number; context: string}[];
  evolutionPattern: 'consistent' | 'building' | 'transforming' | 'fading';
}

/**
 * Complete craft analysis report
 */
export interface CraftAnalysisReport {
  id: string;
  analyzedAt: Date;
  wordCount: number;

  emotionalArc: EmotionalArcAnalysis;
  rhythm: RhythmAnalysis;
  showTell: ShowTellAnalysis;
  sensory: SensoryAnalysis;
  dialogue: DialogueAnalysis;
  thematic: ThematicAnalysis;

  overallScore: number;           // 0-100 composite score
  strengths: string[];
  areasForImprovement: string[];
  prioritizedSuggestions: PrioritizedSuggestion[];
}

export interface PrioritizedSuggestion {
  category: 'emotional_arc' | 'rhythm' | 'show_tell' | 'sensory' | 'dialogue' | 'thematic';
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  example?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Emotion-indicating words for valence analysis
 */
const POSITIVE_EMOTION_WORDS = new Set([
  'happy', 'joy', 'love', 'hope', 'triumph', 'success', 'victory', 'peace',
  'delight', 'pleasure', 'smile', 'laugh', 'celebrate', 'embrace', 'warm',
  'bright', 'beautiful', 'wonderful', 'amazing', 'grateful', 'blessed',
  'excited', 'thrilled', 'proud', 'confident', 'free', 'alive', 'content'
]);

const NEGATIVE_EMOTION_WORDS = new Set([
  'sad', 'grief', 'loss', 'fear', 'despair', 'failure', 'defeat', 'pain',
  'anger', 'rage', 'hate', 'sorrow', 'tears', 'cry', 'scream', 'dark',
  'terrible', 'awful', 'horrible', 'dead', 'death', 'kill', 'suffer',
  'lonely', 'alone', 'betrayed', 'broken', 'lost', 'trapped', 'hopeless'
]);

/**
 * "Telling" indicator phrases
 */
const TELLING_PATTERNS = [
  // Emotion telling
  {pattern: /\b(he|she|they|it|I)\s+(was|were|felt|seemed)\s+(happy|sad|angry|scared|excited|nervous|anxious)/gi, type: 'emotion_telling' as const},
  {pattern: /\bfelt\s+a\s+(wave|rush|surge)\s+of\s+\w+/gi, type: 'emotion_telling' as const},
  {pattern: /\b(obviously|clearly|apparently)\s+\w+/gi, type: 'state_telling' as const},

  // State telling
  {pattern: /\bwas\s+(a|an)\s+(kind|type|sort)\s+of/gi, type: 'state_telling' as const},
  {pattern: /\bseemed\s+to\s+be\s+\w+/gi, type: 'state_telling' as const},

  // Summary telling
  {pattern: /\b(after|before)\s+(a|some)\s+(time|while|days|weeks|months)/gi, type: 'summary_telling' as const},
  {pattern: /\btime\s+passed/gi, type: 'summary_telling' as const},

  // Explanation
  {pattern: /\bbecause\s+(he|she|they|it)\s+(was|were|had)/gi, type: 'explanation' as const},
  {pattern: /\bthe\s+reason\s+(was|being)/gi, type: 'explanation' as const}
];

/**
 * Sensory word categories
 */
const SENSORY_WORDS = {
  visual: new Set([
    'see', 'saw', 'look', 'watch', 'gaze', 'stare', 'glance', 'glimpse',
    'bright', 'dark', 'light', 'shadow', 'color', 'red', 'blue', 'green',
    'shine', 'glow', 'glitter', 'sparkle', 'flash', 'blur', 'clear'
  ]),
  auditory: new Set([
    'hear', 'heard', 'listen', 'sound', 'noise', 'voice', 'whisper', 'shout',
    'scream', 'cry', 'laugh', 'sing', 'music', 'silence', 'quiet', 'loud',
    'ring', 'echo', 'boom', 'crash', 'rustle', 'murmur', 'hum'
  ]),
  tactile: new Set([
    'feel', 'felt', 'touch', 'soft', 'hard', 'rough', 'smooth', 'warm',
    'cold', 'hot', 'wet', 'dry', 'sharp', 'dull', 'pressure', 'pain',
    'tickle', 'itch', 'tingle', 'numb', 'grip', 'stroke', 'caress'
  ]),
  olfactory: new Set([
    'smell', 'scent', 'odor', 'fragrance', 'aroma', 'stench', 'stink',
    'perfume', 'fresh', 'musty', 'sweet', 'sour', 'pungent', 'acrid'
  ]),
  gustatory: new Set([
    'taste', 'flavor', 'sweet', 'sour', 'bitter', 'salty', 'savory',
    'delicious', 'bland', 'spicy', 'tangy', 'rich', 'eat', 'drink'
  ]),
  kinesthetic: new Set([
    'move', 'walk', 'run', 'jump', 'fall', 'rise', 'spin', 'turn',
    'balance', 'stumble', 'stride', 'pace', 'rush', 'freeze', 'tense',
    'relax', 'stretch', 'bend', 'reach', 'pull', 'push', 'lift'
  ])
};

/**
 * Common themes in award-winning literature
 */
const THEME_INDICATORS: Record<string, string[]> = {
  'identity': ['who am I', 'belong', 'identity', 'self', 'true', 'mask', 'pretend', 'authentic'],
  'power': ['power', 'control', 'dominate', 'rule', 'authority', 'rebellion', 'freedom', 'oppress'],
  'love': ['love', 'heart', 'passion', 'desire', 'devotion', 'sacrifice', 'loss', 'longing'],
  'mortality': ['death', 'dying', 'mortal', 'eternal', 'legacy', 'remember', 'forget', 'time'],
  'justice': ['justice', 'fair', 'right', 'wrong', 'innocent', 'guilty', 'punish', 'forgive'],
  'isolation': ['alone', 'lonely', 'isolated', 'connect', 'belong', 'outsider', 'exile', 'stranger'],
  'redemption': ['redeem', 'forgive', 'atone', 'guilt', 'shame', 'change', 'transform', 'save'],
  'truth': ['truth', 'lie', 'deceive', 'honest', 'reveal', 'secret', 'hidden', 'discover']
};

// ============================================================================
// WRITING CRAFT ANALYZER
// ============================================================================

/**
 * Analyzes prose quality using computational narratology techniques
 * based on research from award-winning literature.
 */
export class WritingCraftAnalyzer {
  private arcTemplates: Map<EmotionalArcType, number[]>;

  constructor() {
    this.arcTemplates = this.initializeArcTemplates();
  }

  /**
   * Initialize canonical emotional arc shapes
   */
  private initializeArcTemplates(): Map<EmotionalArcType, number[]> {
    const templates = new Map<EmotionalArcType, number[]>();

    // Normalized arc shapes (10 points each, values from -1 to 1)
    templates.set('rags_to_riches', [-0.8, -0.6, -0.3, 0.0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0]);
    templates.set('tragedy', [0.8, 0.6, 0.3, 0.0, -0.2, -0.4, -0.6, -0.8, -0.9, -1.0]);
    templates.set('man_in_hole', [0.3, -0.2, -0.6, -0.8, -0.6, -0.2, 0.2, 0.5, 0.7, 0.8]);
    templates.set('icarus', [-0.3, 0.2, 0.5, 0.8, 0.9, 0.6, 0.2, -0.3, -0.6, -0.8]);
    templates.set('cinderella', [-0.5, 0.0, 0.4, 0.6, 0.2, -0.3, -0.2, 0.3, 0.7, 0.9]);
    templates.set('oedipus', [0.5, 0.0, -0.4, -0.6, -0.2, 0.3, 0.2, -0.3, -0.7, -0.9]);

    return templates;
  }

  // --------------------------------------------------------------------------
  // MAIN ANALYSIS METHODS
  // --------------------------------------------------------------------------

  /**
   * Perform complete craft analysis on a text
   */
  analyze(text: string, options?: {
    characterDialogue?: Map<string, string[]>;  // Character ID -> their dialogue lines
    knownSymbols?: string[];                    // Known symbolic elements to track
  }): CraftAnalysisReport {
    const wordCount = this.countWords(text);

    const emotionalArc = this.analyzeEmotionalArc(text);
    const rhythm = this.analyzeRhythm(text);
    const showTell = this.analyzeShowTell(text);
    const sensory = this.analyzeSensoryDetails(text);
    const dialogue = this.analyzeDialogue(text, options?.characterDialogue);
    const thematic = this.analyzeThemes(text, options?.knownSymbols);

    // Calculate overall score (weighted average)
    const weights = {
      emotionalArc: 0.20,
      rhythm: 0.15,
      showTell: 0.20,
      sensory: 0.15,
      dialogue: 0.15,
      thematic: 0.15
    };

    const overallScore = Math.round(
      (emotionalArc.confidence * 100 * weights.emotionalArc) +
      (rhythm.rhythmScore * 100 * weights.rhythm) +
      (showTell.overallScore * 100 * weights.showTell) +
      (sensory.densityScore * 100 * weights.sensory) +
      (dialogue.authenticityScore * 100 * weights.dialogue) +
      (thematic.coherenceScore * 100 * weights.thematic)
    );

    // Identify strengths and areas for improvement
    const {strengths, areasForImprovement} = this.identifyStrengthsAndWeaknesses({
      emotionalArc, rhythm, showTell, sensory, dialogue, thematic
    });

    // Prioritize suggestions
    const prioritizedSuggestions = this.prioritizeSuggestions({
      emotionalArc, rhythm, showTell, sensory, dialogue, thematic
    });

    return {
      id: uuidv4(),
      analyzedAt: new Date(),
      wordCount,
      emotionalArc,
      rhythm,
      showTell,
      sensory,
      dialogue,
      thematic,
      overallScore,
      strengths,
      areasForImprovement,
      prioritizedSuggestions
    };
  }

  /**
   * Quick analysis for real-time feedback during writing
   */
  quickAnalyze(text: string): {
    rhythmScore: number;
    showTellRatio: number;
    sensoryDensity: number;
    topSuggestion: string | null;
  } {
    const sentences = this.splitIntoSentences(text);
    const words = this.countWords(text);

    // Quick rhythm check
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length || 0;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / lengths.length;
    const rhythmScore = Math.min(1, variance / 50); // Higher variance = better rhythm

    // Quick show/tell check
    let tellCount = 0;
    for (const pattern of TELLING_PATTERNS) {
      const matches = text.match(pattern.pattern);
      if (matches) tellCount += matches.length;
    }
    const showTellRatio = 1 - (tellCount / Math.max(1, sentences.length));

    // Quick sensory check
    let sensoryCount = 0;
    const lowerText = text.toLowerCase();
    for (const senseWords of Object.values(SENSORY_WORDS)) {
      for (const word of senseWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) sensoryCount += matches.length;
      }
    }
    const sensoryDensity = Math.min(1, (sensoryCount / words) * 20); // Expect ~5% sensory words

    // Generate top suggestion
    let topSuggestion: string | null = null;
    if (rhythmScore < 0.3) {
      topSuggestion = 'Vary your sentence lengths more for better rhythm';
    } else if (showTellRatio < 0.7) {
      topSuggestion = 'Consider showing emotions through actions rather than stating them';
    } else if (sensoryDensity < 0.4) {
      topSuggestion = 'Add more sensory details to ground readers in the scene';
    }

    return {rhythmScore, showTellRatio, sensoryDensity, topSuggestion};
  }

  // --------------------------------------------------------------------------
  // EMOTIONAL ARC ANALYSIS
  // --------------------------------------------------------------------------

  /**
   * Analyze the emotional arc of a narrative
   */
  analyzeEmotionalArc(text: string): EmotionalArcAnalysis {
    const sentences = this.splitIntoSentences(text);
    const windowSize = Math.max(5, Math.floor(sentences.length / 20));

    // Calculate valence at each point
    const arcPoints: EmotionalValence[] = [];

    for (let i = 0; i < sentences.length; i += windowSize) {
      const window = sentences.slice(i, i + windowSize).join(' ');
      const {valence, intensity, emotion} = this.calculateEmotionalValence(window);

      arcPoints.push({
        position: i / sentences.length,
        valence,
        intensity,
        dominantEmotion: emotion,
        context: sentences[i]?.substring(0, 50) + '...'
      });
    }

    // Match to canonical arc
    const {arcType, confidence} = this.matchToCanonicalArc(arcPoints);

    // Detect sub-arcs
    const subArcs = this.detectSubArcs(arcPoints);

    // Generate suggestions
    const suggestions = this.generateArcSuggestions(arcType, arcPoints, confidence);

    return {
      primaryArc: arcType,
      confidence,
      arcPoints,
      subArcs,
      suggestions
    };
  }

  private calculateEmotionalValence(text: string): {
    valence: number;
    intensity: number;
    emotion: string;
  } {
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of words) {
      if (POSITIVE_EMOTION_WORDS.has(word)) positiveCount++;
      if (NEGATIVE_EMOTION_WORDS.has(word)) negativeCount++;
    }

    const total = positiveCount + negativeCount;
    if (total === 0) {
      return {valence: 0, intensity: 0, emotion: 'neutral'};
    }

    const valence = (positiveCount - negativeCount) / total;
    const intensity = Math.min(1, total / (words.length * 0.1));

    let emotion = 'neutral';
    if (valence > 0.3) emotion = positiveCount > negativeCount * 2 ? 'joy' : 'anticipation';
    else if (valence < -0.3) emotion = negativeCount > positiveCount * 2 ? 'sadness' : 'fear';

    return {valence, intensity, emotion};
  }

  private matchToCanonicalArc(points: EmotionalValence[]): {
    arcType: EmotionalArcType;
    confidence: number;
  } {
    // Normalize points to 10-point arc
    const normalized = this.normalizeArcPoints(points.map(p => p.valence), 10);

    let bestMatch: EmotionalArcType = 'man_in_hole';
    let bestCorrelation = -1;

    for (const [arcType, template] of this.arcTemplates) {
      const correlation = this.calculateCorrelation(normalized, template);
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestMatch = arcType;
      }
    }

    // Convert correlation to confidence (correlation ranges from -1 to 1)
    const confidence = (bestCorrelation + 1) / 2;

    return {arcType: bestMatch, confidence};
  }

  private normalizeArcPoints(values: number[], targetLength: number): number[] {
    if (values.length === 0) return new Array(targetLength).fill(0);
    if (values.length === targetLength) return values;

    const result: number[] = [];
    const step = values.length / targetLength;

    for (let i = 0; i < targetLength; i++) {
      const idx = Math.min(Math.floor(i * step), values.length - 1);
      result.push(values[idx]);
    }

    return result;
  }

  private calculateCorrelation(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    const n = a.length;
    const meanA = a.reduce((sum, v) => sum + v, 0) / n;
    const meanB = b.reduce((sum, v) => sum + v, 0) / n;

    let numerator = 0;
    let denomA = 0;
    let denomB = 0;

    for (let i = 0; i < n; i++) {
      const diffA = a[i] - meanA;
      const diffB = b[i] - meanB;
      numerator += diffA * diffB;
      denomA += diffA * diffA;
      denomB += diffB * diffB;
    }

    const denom = Math.sqrt(denomA * denomB);
    return denom === 0 ? 0 : numerator / denom;
  }

  private detectSubArcs(points: EmotionalValence[]): EmotionalArcAnalysis['subArcs'] {
    const subArcs: EmotionalArcAnalysis['subArcs'] = [];
    const minSubArcLength = 3;

    // Sliding window to detect local arc patterns
    for (let i = 0; i < points.length - minSubArcLength; i++) {
      const windowSize = Math.min(5, points.length - i);
      const window = points.slice(i, i + windowSize);
      const values = window.map(p => p.valence);

      // Detect simple patterns
      const trend = this.detectTrend(values);
      if (trend !== 'flat') {
        const arcType = trend === 'rising' ? 'rags_to_riches' : 'tragedy';
        const intensity = Math.abs(values[values.length - 1] - values[0]);

        if (intensity > 0.3) {
          subArcs.push({
            range: [points[i].position, points[i + windowSize - 1].position],
            type: arcType,
            intensity
          });
        }
      }
    }

    return subArcs;
  }

  private detectTrend(values: number[]): 'rising' | 'falling' | 'flat' {
    if (values.length < 2) return 'flat';

    const diff = values[values.length - 1] - values[0];
    if (diff > 0.2) return 'rising';
    if (diff < -0.2) return 'falling';
    return 'flat';
  }

  private generateArcSuggestions(
    arcType: EmotionalArcType,
    points: EmotionalValence[],
    confidence: number
  ): string[] {
    const suggestions: string[] = [];

    if (confidence < 0.5) {
      suggestions.push('Your emotional arc is unclear. Consider strengthening the emotional throughline.');
    }

    // Check for emotional monotony
    const valenceRange = Math.max(...points.map(p => p.valence)) - Math.min(...points.map(p => p.valence));
    if (valenceRange < 0.5) {
      suggestions.push('Add more emotional contrast - your narrative feels emotionally flat.');
    }

    // Arc-specific suggestions
    switch (arcType) {
      case 'rags_to_riches':
        if (points[0]?.valence > 0) {
          suggestions.push('For a stronger rise arc, start from a lower emotional point.');
        }
        break;
      case 'tragedy':
        if (points[points.length - 1]?.valence > -0.3) {
          suggestions.push('The tragic ending could be more impactful with deeper emotional descent.');
        }
        break;
      case 'man_in_hole':
        const midPoint = points[Math.floor(points.length / 2)];
        if (midPoint && midPoint.valence > -0.3) {
          suggestions.push('Deepen the "hole" in the middle for more satisfying resolution.');
        }
        break;
    }

    return suggestions;
  }

  // --------------------------------------------------------------------------
  // RHYTHM ANALYSIS
  // --------------------------------------------------------------------------

  /**
   * Analyze prose rhythm and pacing
   */
  analyzeRhythm(text: string): RhythmAnalysis {
    const sentences = this.splitIntoSentences(text);
    const lengths = sentences.map(s => s.split(/\s+/).length);

    if (lengths.length === 0) {
      return {
        averageSentenceLength: 0,
        sentenceLengthVariance: 0,
        rhythmScore: 0,
        pacingZones: [],
        suggestions: ['No sentences detected for rhythm analysis.']
      };
    }

    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;

    // Calculate rhythm score (good rhythm = high variance but not too extreme)
    // Ideal variance is around 30-60 (mix of short punchy and long flowing)
    const idealVariance = 45;
    const rhythmScore = Math.max(0, 1 - Math.abs(variance - idealVariance) / idealVariance);

    // Detect pacing zones
    const pacingZones = this.detectPacingZones(sentences, lengths);

    // Generate suggestions
    const suggestions = this.generateRhythmSuggestions(avgLength, variance, lengths);

    return {
      averageSentenceLength: avgLength,
      sentenceLengthVariance: variance,
      rhythmScore,
      pacingZones,
      suggestions
    };
  }

  private detectPacingZones(sentences: string[], lengths: number[]): PacingZone[] {
    const zones: PacingZone[] = [];
    const windowSize = Math.max(3, Math.floor(sentences.length / 10));

    for (let i = 0; i < sentences.length; i += windowSize) {
      const window = lengths.slice(i, i + windowSize);
      const avgLen = window.reduce((a, b) => a + b, 0) / window.length;

      let pace: PacingZone['pace'];
      if (avgLen < 8) pace = 'rapid';
      else if (avgLen < 15) pace = 'moderate';
      else if (avgLen < 25) pace = 'slow';
      else pace = 'contemplative';

      // Effectiveness depends on context matching (simplified heuristic)
      const effectivenessScore = 0.7; // Would need content analysis for true effectiveness

      zones.push({
        startPosition: i / sentences.length,
        endPosition: Math.min(1, (i + windowSize) / sentences.length),
        pace,
        avgSentenceLength: avgLen,
        effectivenessScore
      });
    }

    return zones;
  }

  private generateRhythmSuggestions(avgLength: number, variance: number, lengths: number[]): string[] {
    const suggestions: string[] = [];

    if (avgLength > 25) {
      suggestions.push('Your sentences tend to be long. Add shorter, punchier sentences for impact.');
    } else if (avgLength < 10) {
      suggestions.push('Your sentences are quite short. Occasional longer sentences add flow and sophistication.');
    }

    if (variance < 15) {
      suggestions.push('Your sentence lengths are too uniform. Vary them for better rhythm.');
      suggestions.push('Try: "Short sentence. Then a much longer one that builds and flows. Punch. Another flowing thought."');
    }

    // Check for monotonous patterns
    const consecutiveSimilar = this.findConsecutiveSimilarLengths(lengths);
    if (consecutiveSimilar > 5) {
      suggestions.push(`Found ${consecutiveSimilar} sentences of similar length in a row. Break up the monotony.`);
    }

    return suggestions;
  }

  private findConsecutiveSimilarLengths(lengths: number[]): number {
    let maxConsecutive = 0;
    let current = 1;

    for (let i = 1; i < lengths.length; i++) {
      const diff = Math.abs(lengths[i] - lengths[i - 1]);
      if (diff < 3) {
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
      } else {
        current = 1;
      }
    }

    return maxConsecutive;
  }

  // --------------------------------------------------------------------------
  // SHOW VS TELL ANALYSIS
  // --------------------------------------------------------------------------

  /**
   * Detect instances of "telling" vs "showing"
   */
  analyzeShowTell(text: string): ShowTellAnalysis {
    const sentences = this.splitIntoSentences(text);
    const tellInstances: TellInstance[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const position = i / sentences.length;

      for (const {pattern, type} of TELLING_PATTERNS) {
        const matches = sentence.match(pattern);
        if (matches) {
          for (const match of matches) {
            tellInstances.push({
              text: match,
              position,
              type,
              severity: this.assessTellSeverity(type, sentence),
              suggestedRevision: this.suggestShowAlternative(match, type)
            });
          }
        }
      }
    }

    const showRatio = 1 - (tellInstances.length / Math.max(1, sentences.length));
    const overallScore = Math.max(0, showRatio);

    const suggestions = this.generateShowTellSuggestions(tellInstances, showRatio);

    return {
      showRatio,
      tellInstances,
      overallScore,
      suggestions
    };
  }

  private assessTellSeverity(type: TellInstance['type'], sentence: string): TellInstance['severity'] {
    // Emotion telling in key moments is more severe
    if (type === 'emotion_telling') {
      if (/finally|at last|moment|suddenly/i.test(sentence)) {
        return 'significant';
      }
      return 'moderate';
    }

    if (type === 'summary_telling') {
      return 'minor'; // Sometimes necessary
    }

    return 'moderate';
  }

  private suggestShowAlternative(match: string, type: TellInstance['type']): string {
    const alternatives: Record<string, string> = {
      'was happy': 'A smile spread across their face',
      'felt sad': 'Their shoulders slumped, eyes downcast',
      'was angry': 'Their fists clenched, jaw tight',
      'felt scared': 'Their heart hammered against their ribs',
      'was excited': 'They bounced on their toes, unable to stand still',
      'felt nervous': 'They twisted their ring, gaze darting around the room'
    };

    const lowerMatch = match.toLowerCase();
    for (const [tell, show] of Object.entries(alternatives)) {
      if (lowerMatch.includes(tell)) {
        return show;
      }
    }

    if (type === 'emotion_telling') {
      return 'Show through physical sensations, actions, or dialogue';
    }

    return 'Consider showing through concrete details';
  }

  private generateShowTellSuggestions(instances: TellInstance[], ratio: number): string[] {
    const suggestions: string[] = [];

    if (ratio < 0.7) {
      suggestions.push('Your prose has significant "telling" - consider converting to sensory details and actions.');
    }

    // Count by type
    const typeCounts = new Map<string, number>();
    for (const instance of instances) {
      typeCounts.set(instance.type, (typeCounts.get(instance.type) || 0) + 1);
    }

    if ((typeCounts.get('emotion_telling') || 0) > 3) {
      suggestions.push('Too many emotional states are told directly. Show emotions through physical manifestations.');
      suggestions.push('Example: Instead of "She was nervous," try "Her fingers drummed against her thigh."');
    }

    if ((typeCounts.get('summary_telling') || 0) > 2) {
      suggestions.push('Consider expanding summarized passages into scenes for important moments.');
    }

    return suggestions;
  }

  // --------------------------------------------------------------------------
  // SENSORY DETAIL ANALYSIS
  // --------------------------------------------------------------------------

  /**
   * Analyze sensory detail usage and distribution
   */
  analyzeSensoryDetails(text: string): SensoryAnalysis {
    const words = text.toLowerCase().split(/\s+/);
    const wordCount = words.length;

    const counts = {
      visual: 0,
      auditory: 0,
      tactile: 0,
      olfactory: 0,
      gustatory: 0,
      kinesthetic: 0
    };

    for (const word of words) {
      for (const [sense, wordSet] of Object.entries(SENSORY_WORDS) as [keyof typeof counts, Set<string>][]) {
        if (wordSet.has(word)) {
          counts[sense]++;
        }
      }
    }

    const totalSensory = Object.values(counts).reduce((a, b) => a + b, 0);
    const densityScore = Math.min(1, (totalSensory / wordCount) * 15); // ~6-7% ideal

    // Calculate distribution (normalize to percentages)
    const distribution = {
      visual: totalSensory > 0 ? counts.visual / totalSensory : 0,
      auditory: totalSensory > 0 ? counts.auditory / totalSensory : 0,
      tactile: totalSensory > 0 ? counts.tactile / totalSensory : 0,
      olfactory: totalSensory > 0 ? counts.olfactory / totalSensory : 0,
      gustatory: totalSensory > 0 ? counts.gustatory / totalSensory : 0,
      kinesthetic: totalSensory > 0 ? counts.kinesthetic / totalSensory : 0
    };

    // Balance score - how evenly distributed (ideal would be ~0.17 each)
    const idealShare = 1 / 6;
    const deviations = Object.values(distribution).map(v => Math.abs(v - idealShare));
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / 6;
    const balanceScore = Math.max(0, 1 - avgDeviation * 3);

    const suggestions = this.generateSensorySuggestions(counts, densityScore, balanceScore);

    return {
      densityScore,
      senseDistribution: distribution,
      balanceScore,
      suggestions
    };
  }

  private generateSensorySuggestions(
    counts: Record<string, number>,
    density: number,
    balance: number
  ): string[] {
    const suggestions: string[] = [];

    if (density < 0.4) {
      suggestions.push('Add more sensory details to immerse readers in your scenes.');
    }

    // Check for underused senses
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total > 0) {
      if (counts.olfactory < total * 0.05) {
        suggestions.push('Smell is underused - it\'s the sense most strongly tied to memory and emotion.');
      }
      if (counts.tactile < total * 0.1) {
        suggestions.push('Add more tactile details for physical grounding.');
      }
      if (counts.auditory < total * 0.1) {
        suggestions.push('Include more sounds to create an immersive soundscape.');
      }
    }

    if (balance < 0.5) {
      suggestions.push('Your sensory details are unbalanced - try engaging more than just sight.');
    }

    return suggestions;
  }

  // --------------------------------------------------------------------------
  // DIALOGUE ANALYSIS
  // --------------------------------------------------------------------------

  /**
   * Analyze dialogue quality and character voice differentiation
   */
  analyzeDialogue(
    text: string,
    characterDialogue?: Map<string, string[]>
  ): DialogueAnalysis {
    // Extract dialogue from text if not provided
    const dialogueMatches = text.match(/"[^"]+"|'[^']+'/g) || [];

    // Analyze beats vs tags
    const tagPattern = /\b(said|asked|replied|answered|whispered|shouted|exclaimed|muttered|mumbled)\b/gi;
    const tags = text.match(tagPattern) || [];
    const beatPattern = /[.!?]["'][^"']*[A-Z]/g; // Action following dialogue
    const beats = text.match(beatPattern) || [];

    const beatUsage = (beats.length + tags.length) > 0
      ? beats.length / (beats.length + tags.length)
      : 0.5;

    // Analyze character voices if provided
    const characterVoices: CharacterVoiceProfile[] = [];
    let voiceDifferentiation = 0.5; // Default

    if (characterDialogue && characterDialogue.size > 1) {
      for (const [charId, lines] of characterDialogue) {
        const profile = this.analyzeCharacterVoice(charId, charId, lines);
        characterVoices.push(profile);
      }
      voiceDifferentiation = this.calculateVoiceDifferentiation(characterVoices);
    }

    // Check for subtext (questions, deflections, interruptions)
    const subtextIndicators = (text.match(/\.\.\.|—|--|\?.*"/g) || []).length;
    const subtextPresence = Math.min(1, subtextIndicators / Math.max(1, dialogueMatches.length) * 2);

    // Authenticity heuristic (contractions, fragments, interruptions)
    const contractions = (text.match(/'(t|s|re|ve|ll|d)\b/g) || []).length;
    const authenticityScore = Math.min(1, (contractions / Math.max(1, dialogueMatches.length)) * 0.5 + 0.5);

    const suggestions = this.generateDialogueSuggestions(
      beatUsage, voiceDifferentiation, subtextPresence, authenticityScore
    );

    return {
      voiceDifferentiation,
      authenticityScore,
      subtextPresence,
      beatUsage,
      characterVoices,
      suggestions
    };
  }

  private analyzeCharacterVoice(
    characterId: string,
    characterName: string,
    lines: string[]
  ): CharacterVoiceProfile {
    if (lines.length === 0) {
      return {
        characterId,
        characterName,
        avgSentenceLength: 0,
        vocabularyLevel: 'moderate',
        contractionUsage: 0.5,
        uniquePatterns: [],
        distinctivenessScore: 0
      };
    }

    const allText = lines.join(' ');
    const words = allText.split(/\s+/);
    const avgLength = words.length / lines.length;

    // Contraction usage
    const contractionCount = (allText.match(/'(t|s|re|ve|ll|d)\b/g) || []).length;
    const contractionUsage = contractionCount / Math.max(1, words.length) * 10;

    // Vocabulary level (simplified - based on avg word length)
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    let vocabularyLevel: CharacterVoiceProfile['vocabularyLevel'] = 'moderate';
    if (avgWordLength < 4) vocabularyLevel = 'simple';
    else if (avgWordLength > 6) vocabularyLevel = 'sophisticated';

    // Find repeated phrases (potential catchphrases)
    const uniquePatterns = this.findRepeatedPhrases(lines);

    return {
      characterId,
      characterName,
      avgSentenceLength: avgLength,
      vocabularyLevel,
      contractionUsage: Math.min(1, contractionUsage),
      uniquePatterns,
      distinctivenessScore: 0 // Will be calculated comparatively
    };
  }

  private findRepeatedPhrases(lines: string[]): string[] {
    const phrases = new Map<string, number>();

    for (const line of lines) {
      const words = line.toLowerCase().split(/\s+/);
      // Check 2-3 word phrases
      for (let i = 0; i < words.length - 1; i++) {
        const phrase2 = `${words[i]} ${words[i + 1]}`;
        phrases.set(phrase2, (phrases.get(phrase2) || 0) + 1);

        if (i < words.length - 2) {
          const phrase3 = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
          phrases.set(phrase3, (phrases.get(phrase3) || 0) + 1);
        }
      }
    }

    // Return phrases that appear more than once
    return Array.from(phrases.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([phrase]) => phrase);
  }

  private calculateVoiceDifferentiation(profiles: CharacterVoiceProfile[]): number {
    if (profiles.length < 2) return 0.5;

    let totalDiff = 0;
    let comparisons = 0;

    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        const a = profiles[i];
        const b = profiles[j];

        // Compare various metrics
        const lengthDiff = Math.abs(a.avgSentenceLength - b.avgSentenceLength) / 20;
        const contractionDiff = Math.abs(a.contractionUsage - b.contractionUsage);
        const vocabDiff = a.vocabularyLevel !== b.vocabularyLevel ? 0.3 : 0;

        totalDiff += (lengthDiff + contractionDiff + vocabDiff) / 3;
        comparisons++;
      }
    }

    return Math.min(1, totalDiff / comparisons * 2);
  }

  private generateDialogueSuggestions(
    beatUsage: number,
    voiceDiff: number,
    subtext: number,
    authenticity: number
  ): string[] {
    const suggestions: string[] = [];

    if (beatUsage < 0.3) {
      suggestions.push('Replace some "said" tags with action beats to show character movement and emotion.');
      suggestions.push('Example: Instead of \'"I don\'t know," she said nervously\', try \'"I don\'t know." She twisted her ring.\'');
    }

    if (voiceDiff < 0.4) {
      suggestions.push('Your characters sound too similar. Differentiate through vocabulary, sentence length, and speech patterns.');
    }

    if (subtext < 0.3) {
      suggestions.push('Add more subtext - characters rarely say exactly what they mean.');
      suggestions.push('Use deflection, interruption, and non-answers to create tension.');
    }

    if (authenticity < 0.6) {
      suggestions.push('Dialogue feels stiff. Add contractions, fragments, and interruptions for natural speech.');
    }

    return suggestions;
  }

  // --------------------------------------------------------------------------
  // THEMATIC ANALYSIS
  // --------------------------------------------------------------------------

  /**
   * Analyze thematic content and symbolism
   */
  analyzeThemes(text: string, knownSymbols?: string[]): ThematicAnalysis {
    const lowerText = text.toLowerCase();
    const wordCount = this.countWords(text);

    // Identify themes
    const identifiedThemes: IdentifiedTheme[] = [];

    for (const [theme, indicators] of Object.entries(THEME_INDICATORS)) {
      let matchCount = 0;
      const evidence: string[] = [];

      for (const indicator of indicators) {
        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          matchCount += matches.length;
          evidence.push(indicator);
        }
      }

      if (matchCount > 2) {
        const confidence = Math.min(1, matchCount / 20);
        const resonance = Math.min(1, matchCount / wordCount * 100);

        identifiedThemes.push({
          theme,
          confidence,
          supportingEvidence: evidence,
          resonance
        });
      }
    }

    // Sort by confidence
    identifiedThemes.sort((a, b) => b.confidence - a.confidence);

    // Calculate coherence (how focused are themes)
    const coherenceScore = identifiedThemes.length > 0 && identifiedThemes.length <= 3
      ? identifiedThemes[0].confidence
      : identifiedThemes.length > 3
        ? 0.5 // Too many themes = less coherent
        : 0.3; // No clear themes

    // Track motifs (if known symbols provided)
    const motifTracking: TrackedMotif[] = [];
    if (knownSymbols) {
      for (const symbol of knownSymbols) {
        const regex = new RegExp(`\\b${symbol}\\b`, 'gi');
        let match;
        const occurrences: {position: number; context: string}[] = [];

        const textCopy = lowerText;
        let lastIndex = 0;
        while ((match = regex.exec(textCopy)) !== null) {
          const position = match.index / text.length;
          const start = Math.max(0, match.index - 30);
          const end = Math.min(text.length, match.index + symbol.length + 30);
          occurrences.push({
            position,
            context: text.substring(start, end)
          });
          lastIndex = match.index;
        }

        if (occurrences.length > 0) {
          motifTracking.push({
            motif: symbol,
            occurrences,
            evolutionPattern: this.detectMotifEvolution(occurrences)
          });
        }
      }
    }

    // Symbolism density
    const symbolismDensity = motifTracking.reduce((sum, m) => sum + m.occurrences.length, 0) / (wordCount / 1000);

    const suggestions = this.generateThematicSuggestions(identifiedThemes, coherenceScore, motifTracking);

    return {
      identifiedThemes,
      coherenceScore,
      symbolismDensity,
      motifTracking,
      suggestions
    };
  }

  private detectMotifEvolution(occurrences: {position: number; context: string}[]): TrackedMotif['evolutionPattern'] {
    if (occurrences.length < 2) return 'consistent';

    // Check distribution
    const firstThird = occurrences.filter(o => o.position < 0.33).length;
    const lastThird = occurrences.filter(o => o.position > 0.66).length;

    if (firstThird > lastThird * 2) return 'fading';
    if (lastThird > firstThird * 2) return 'building';
    return 'consistent';
  }

  private generateThematicSuggestions(
    themes: IdentifiedTheme[],
    coherence: number,
    motifs: TrackedMotif[]
  ): string[] {
    const suggestions: string[] = [];

    if (themes.length === 0) {
      suggestions.push('No clear themes detected. Consider what universal truth your story explores.');
    } else if (themes.length > 4) {
      suggestions.push('Too many competing themes dilute impact. Focus on 2-3 primary themes.');
    }

    if (coherence < 0.5) {
      suggestions.push('Thematic coherence is weak. Weave your themes more consistently throughout.');
    }

    // Check motif usage
    for (const motif of motifs) {
      if (motif.evolutionPattern === 'fading') {
        suggestions.push(`The "${motif.motif}" motif fades in the latter half - consider returning to it for resonance.`);
      }
    }

    if (motifs.length === 0 && themes.length > 0) {
      suggestions.push('Consider adding symbolic motifs to reinforce your themes visually.');
    }

    return suggestions;
  }

  // --------------------------------------------------------------------------
  // HELPER METHODS
  // --------------------------------------------------------------------------

  private splitIntoSentences(text: string): string[] {
    // Split on sentence-ending punctuation, but handle edge cases
    return text
      .replace(/([.!?])\s+/g, '$1|')
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(w => w.length > 0).length;
  }

  private identifyStrengthsAndWeaknesses(analyses: {
    emotionalArc: EmotionalArcAnalysis;
    rhythm: RhythmAnalysis;
    showTell: ShowTellAnalysis;
    sensory: SensoryAnalysis;
    dialogue: DialogueAnalysis;
    thematic: ThematicAnalysis;
  }): {strengths: string[]; areasForImprovement: string[]} {
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];

    // Emotional arc
    if (analyses.emotionalArc.confidence > 0.7) {
      strengths.push(`Strong ${analyses.emotionalArc.primaryArc.replace(/_/g, ' ')} emotional arc`);
    } else if (analyses.emotionalArc.confidence < 0.4) {
      areasForImprovement.push('Unclear emotional arc');
    }

    // Rhythm
    if (analyses.rhythm.rhythmScore > 0.7) {
      strengths.push('Excellent prose rhythm and sentence variety');
    } else if (analyses.rhythm.rhythmScore < 0.4) {
      areasForImprovement.push('Monotonous sentence structure');
    }

    // Show/Tell
    if (analyses.showTell.overallScore > 0.8) {
      strengths.push('Strong showing through sensory details and action');
    } else if (analyses.showTell.overallScore < 0.5) {
      areasForImprovement.push('Too much telling, not enough showing');
    }

    // Sensory
    if (analyses.sensory.densityScore > 0.7 && analyses.sensory.balanceScore > 0.6) {
      strengths.push('Rich, balanced sensory details');
    } else if (analyses.sensory.densityScore < 0.3) {
      areasForImprovement.push('Lacks sensory immersion');
    }

    // Dialogue
    if (analyses.dialogue.authenticityScore > 0.7 && analyses.dialogue.voiceDifferentiation > 0.6) {
      strengths.push('Authentic dialogue with distinct character voices');
    } else if (analyses.dialogue.voiceDifferentiation < 0.4) {
      areasForImprovement.push('Character voices lack differentiation');
    }

    // Thematic
    if (analyses.thematic.coherenceScore > 0.7) {
      strengths.push('Strong thematic coherence');
    } else if (analyses.thematic.coherenceScore < 0.4) {
      areasForImprovement.push('Weak or scattered thematic focus');
    }

    return {strengths, areasForImprovement};
  }

  private prioritizeSuggestions(analyses: {
    emotionalArc: EmotionalArcAnalysis;
    rhythm: RhythmAnalysis;
    showTell: ShowTellAnalysis;
    sensory: SensoryAnalysis;
    dialogue: DialogueAnalysis;
    thematic: ThematicAnalysis;
  }): PrioritizedSuggestion[] {
    const suggestions: PrioritizedSuggestion[] = [];

    // Gather all suggestions with metadata
    for (const s of analyses.emotionalArc.suggestions) {
      suggestions.push({
        category: 'emotional_arc',
        suggestion: s,
        impact: analyses.emotionalArc.confidence < 0.5 ? 'high' : 'medium',
        effort: 'high'
      });
    }

    for (const s of analyses.rhythm.suggestions) {
      suggestions.push({
        category: 'rhythm',
        suggestion: s,
        impact: 'medium',
        effort: 'low'
      });
    }

    for (const s of analyses.showTell.suggestions) {
      suggestions.push({
        category: 'show_tell',
        suggestion: s,
        impact: 'high',
        effort: 'medium'
      });
    }

    for (const s of analyses.sensory.suggestions) {
      suggestions.push({
        category: 'sensory',
        suggestion: s,
        impact: 'medium',
        effort: 'low'
      });
    }

    for (const s of analyses.dialogue.suggestions) {
      suggestions.push({
        category: 'dialogue',
        suggestion: s,
        impact: 'high',
        effort: 'medium'
      });
    }

    for (const s of analyses.thematic.suggestions) {
      suggestions.push({
        category: 'thematic',
        suggestion: s,
        impact: 'high',
        effort: 'high'
      });
    }

    // Sort by impact (high first) then effort (low first)
    const impactOrder = {high: 0, medium: 1, low: 2};
    const effortOrder = {low: 0, medium: 1, high: 2};

    suggestions.sort((a, b) => {
      const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
      if (impactDiff !== 0) return impactDiff;
      return effortOrder[a.effort] - effortOrder[b.effort];
    });

    return suggestions;
  }

  // --------------------------------------------------------------------------
  // REPORT GENERATION
  // --------------------------------------------------------------------------

  /**
   * Generate a human-readable craft analysis report
   */
  generateReport(analysis: CraftAnalysisReport): string {
    const lines: string[] = [
      '═══════════════════════════════════════════════════════════════════',
      '                    WRITING CRAFT ANALYSIS REPORT',
      '═══════════════════════════════════════════════════════════════════',
      '',
      `Analyzed: ${analysis.analyzedAt.toISOString()}`,
      `Word Count: ${analysis.wordCount.toLocaleString()}`,
      `Overall Score: ${analysis.overallScore}/100`,
      '',
      '───────────────────────────────────────────────────────────────────',
      '  EMOTIONAL ARC',
      '───────────────────────────────────────────────────────────────────',
      `Primary Arc: ${analysis.emotionalArc.primaryArc.replace(/_/g, ' ').toUpperCase()}`,
      `Confidence: ${(analysis.emotionalArc.confidence * 100).toFixed(0)}%`,
      ''
    ];

    if (analysis.emotionalArc.suggestions.length > 0) {
      lines.push('Suggestions:');
      for (const s of analysis.emotionalArc.suggestions) {
        lines.push(`  • ${s}`);
      }
      lines.push('');
    }

    lines.push(
      '───────────────────────────────────────────────────────────────────',
      '  PROSE RHYTHM',
      '───────────────────────────────────────────────────────────────────',
      `Average Sentence Length: ${analysis.rhythm.averageSentenceLength.toFixed(1)} words`,
      `Rhythm Score: ${(analysis.rhythm.rhythmScore * 100).toFixed(0)}%`,
      ''
    );

    lines.push(
      '───────────────────────────────────────────────────────────────────',
      '  SHOW VS TELL',
      '───────────────────────────────────────────────────────────────────',
      `Show Ratio: ${(analysis.showTell.showRatio * 100).toFixed(0)}%`,
      `Tell Instances Found: ${analysis.showTell.tellInstances.length}`,
      ''
    );

    if (analysis.showTell.tellInstances.length > 0) {
      lines.push('Examples to revise:');
      for (const instance of analysis.showTell.tellInstances.slice(0, 3)) {
        lines.push(`  • "${instance.text}" → ${instance.suggestedRevision || 'Consider showing instead'}`);
      }
      lines.push('');
    }

    lines.push(
      '───────────────────────────────────────────────────────────────────',
      '  SENSORY DETAILS',
      '───────────────────────────────────────────────────────────────────',
      `Density Score: ${(analysis.sensory.densityScore * 100).toFixed(0)}%`,
      `Balance Score: ${(analysis.sensory.balanceScore * 100).toFixed(0)}%`,
      '',
      'Distribution:'
    );

    for (const [sense, value] of Object.entries(analysis.sensory.senseDistribution)) {
      const bar = '█'.repeat(Math.round(value * 20));
      lines.push(`  ${sense.padEnd(12)}: ${bar} ${(value * 100).toFixed(0)}%`);
    }
    lines.push('');

    lines.push(
      '───────────────────────────────────────────────────────────────────',
      '  DIALOGUE',
      '───────────────────────────────────────────────────────────────────',
      `Voice Differentiation: ${(analysis.dialogue.voiceDifferentiation * 100).toFixed(0)}%`,
      `Authenticity: ${(analysis.dialogue.authenticityScore * 100).toFixed(0)}%`,
      `Subtext Presence: ${(analysis.dialogue.subtextPresence * 100).toFixed(0)}%`,
      `Action Beat Usage: ${(analysis.dialogue.beatUsage * 100).toFixed(0)}%`,
      ''
    );

    lines.push(
      '───────────────────────────────────────────────────────────────────',
      '  THEMES',
      '───────────────────────────────────────────────────────────────────',
      `Coherence Score: ${(analysis.thematic.coherenceScore * 100).toFixed(0)}%`,
      ''
    );

    if (analysis.thematic.identifiedThemes.length > 0) {
      lines.push('Identified Themes:');
      for (const theme of analysis.thematic.identifiedThemes.slice(0, 5)) {
        lines.push(`  • ${theme.theme.toUpperCase()} (${(theme.confidence * 100).toFixed(0)}% confidence)`);
      }
      lines.push('');
    }

    lines.push(
      '═══════════════════════════════════════════════════════════════════',
      '  SUMMARY',
      '═══════════════════════════════════════════════════════════════════',
      ''
    );

    if (analysis.strengths.length > 0) {
      lines.push('STRENGTHS:');
      for (const s of analysis.strengths) {
        lines.push(`  ✓ ${s}`);
      }
      lines.push('');
    }

    if (analysis.areasForImprovement.length > 0) {
      lines.push('AREAS FOR IMPROVEMENT:');
      for (const s of analysis.areasForImprovement) {
        lines.push(`  ✗ ${s}`);
      }
      lines.push('');
    }

    if (analysis.prioritizedSuggestions.length > 0) {
      lines.push('TOP PRIORITY SUGGESTIONS:');
      for (const s of analysis.prioritizedSuggestions.slice(0, 5)) {
        const impact = s.impact === 'high' ? '!!!' : s.impact === 'medium' ? '!!' : '!';
        lines.push(`  ${impact} [${s.category}] ${s.suggestion}`);
      }
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════════════════════════');

    return lines.join('\n');
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default WritingCraftAnalyzer;
