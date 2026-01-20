/**
 * Style Guide Enforcer
 *
 * Analyzes and enforces consistent writing style across AI-assisted
 * writing sessions. Detects style drift, inconsistent tone, and
 * provides correction suggestions.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

export enum StyleElement {
  // Sentence Level
  SENTENCE_LENGTH = 'sentence_length',
  SENTENCE_VARIETY = 'sentence_variety',
  SENTENCE_STRUCTURE = 'sentence_structure',

  // Word Level
  VOCABULARY_LEVEL = 'vocabulary_level',
  WORD_FREQUENCY = 'word_frequency',
  JARGON_USAGE = 'jargon_usage',

  // Tone
  FORMALITY = 'formality',
  EMOTIONAL_INTENSITY = 'emotional_intensity',
  HUMOR = 'humor',
  DARKNESS = 'darkness',

  // Narrative
  PACING = 'pacing',
  DESCRIPTION_DENSITY = 'description_density',
  DIALOGUE_RATIO = 'dialogue_ratio',
  SHOW_VS_TELL = 'show_vs_tell',

  // POV
  POV_CONSISTENCY = 'pov_consistency',
  NARRATIVE_DISTANCE = 'narrative_distance',
  TENSE_CONSISTENCY = 'tense_consistency',

  // Technical
  PARAGRAPH_LENGTH = 'paragraph_length',
  ADVERB_USAGE = 'adverb_usage',
  PASSIVE_VOICE = 'passive_voice',
  FILTER_WORDS = 'filter_words'
}

export enum StyleViolationType {
  DRIFT = 'drift',                 // Gradual departure from style
  INCONSISTENCY = 'inconsistency', // Internal contradiction
  PROHIBITED = 'prohibited',       // Uses forbidden element
  MISSING = 'missing',             // Lacks required element
  EXCESS = 'excess',               // Too much of something
  ANACHRONISM = 'anachronism',     // Wrong for time period
  REGISTER_MISMATCH = 'register_mismatch' // Wrong formality level
}

export enum Severity {
  INFO = 'info',
  SUGGESTION = 'suggestion',
  WARNING = 'warning',
  ERROR = 'error'
}

export enum Tense {
  PAST = 'past',
  PRESENT = 'present',
  FUTURE = 'future',
  MIXED = 'mixed'
}

export enum POV {
  FIRST = 'first',
  SECOND = 'second',
  THIRD_LIMITED = 'third_limited',
  THIRD_OMNISCIENT = 'third_omniscient'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface StyleGuide {
  id: string;
  name: string;
  description: string;

  // Sentence metrics
  sentenceLength: {
    min: number;
    max: number;
    targetAverage: number;
    tolerance: number;        // Percentage deviation allowed
  };

  // Vocabulary
  vocabularyLevel: 'simple' | 'moderate' | 'advanced' | 'literary';
  forbiddenWords: string[];
  requiredPhrases?: string[];
  preferredTerms: Map<string, string[]>;  // "said" -> ["replied", "answered"]

  // Tone
  formality: number;          // 1-10 scale
  emotionalIntensity: number; // 1-10 scale
  allowedHumor: boolean;
  darknessLevel: number;      // 1-10 scale

  // Narrative
  pacing: 'slow' | 'moderate' | 'fast' | 'variable';
  descriptionDensity: number; // 1-10 scale
  dialogueRatio: {
    min: number;              // Percentage
    max: number;
  };
  showVsTell: number;         // 1-10, higher = more showing

  // POV
  pov: POV;
  tense: Tense;
  narrativeDistance: 'close' | 'medium' | 'distant';

  // Technical
  maxParagraphLength: number; // In sentences
  maxAdverbPercentage: number;
  maxPassivePercentage: number;
  avoidFilterWords: boolean;

  // Custom rules
  customRules: StyleRule[];
}

export interface StyleRule {
  id: string;
  name: string;
  description: string;
  pattern?: RegExp;           // Pattern to detect
  antiPattern?: RegExp;       // Pattern that should NOT appear
  minOccurrences?: number;
  maxOccurrences?: number;
  severity: Severity;
  suggestion?: string;
}

export interface StyleViolation {
  id: string;
  type: StyleViolationType;
  element: StyleElement;
  severity: Severity;
  message: string;
  location: {
    paragraphIndex: number;
    sentenceIndex?: number;
    startChar?: number;
    endChar?: number;
  };
  originalText: string;
  suggestion?: string;
  ruleId?: string;
}

export interface StyleAnalysis {
  id: string;
  textLength: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;

  // Metrics
  metrics: {
    avgSentenceLength: number;
    sentenceLengthVariance: number;
    avgParagraphLength: number;
    dialoguePercentage: number;
    adverbPercentage: number;
    passivePercentage: number;
    readabilityScore: number;   // Flesch-Kincaid
  };

  // Violations
  violations: StyleViolation[];
  violationsByElement: Record<string, number>;
  violationsBySeverity: Record<string, number>;

  // Score
  overallScore: number;         // 0-100
  elementScores: Record<string, number>;

  // Analysis metadata
  analyzedAt: Date;
  guideId: string;
}

export interface TextSegment {
  text: string;
  type: 'narrative' | 'dialogue' | 'description' | 'action' | 'introspection';
  paragraphIndex: number;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  guide: Partial<StyleGuide>;
}

// ============================================================================
// STYLE ENFORCER
// ============================================================================

export class StyleEnforcer {
  private guides: Map<string, StyleGuide> = new Map();
  private analyses: Map<string, StyleAnalysis> = new Map();
  private presets: Map<string, StylePreset> = new Map();
  private activeGuideId: string | null = null;

  // Common patterns for analysis
  private patterns = {
    dialogue: /"[^"]*"|'[^']*'|"[^"]*"|'[^']*'/g,
    sentence: /[^.!?]+[.!?]+/g,
    paragraph: /[^\n]+/g,
    adverb: /\b\w+ly\b/gi,
    passive: /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi,
    filterWords: /\b(felt|saw|heard|noticed|realized|wondered|thought|knew|seemed)\b/gi,
    thatClauses: /\bthat\s+\w+/gi
  };

  constructor() {
    this.initializePresets();
  }

  // ==========================================================================
  // PRESETS
  // ==========================================================================

  private initializePresets(): void {
    // Literary fiction preset
    this.addPreset({
      id: 'literary',
      name: 'Literary Fiction',
      description: 'Elegant, introspective style with rich vocabulary',
      guide: {
        sentenceLength: { min: 8, max: 40, targetAverage: 18, tolerance: 30 },
        vocabularyLevel: 'literary',
        formality: 7,
        emotionalIntensity: 6,
        allowedHumor: true,
        darknessLevel: 5,
        pacing: 'moderate',
        descriptionDensity: 7,
        dialogueRatio: { min: 15, max: 40 },
        showVsTell: 8,
        narrativeDistance: 'close',
        maxParagraphLength: 8,
        maxAdverbPercentage: 3,
        maxPassivePercentage: 10,
        avoidFilterWords: true
      }
    });

    // Action/thriller preset
    this.addPreset({
      id: 'action-thriller',
      name: 'Action/Thriller',
      description: 'Fast-paced, punchy prose',
      guide: {
        sentenceLength: { min: 3, max: 25, targetAverage: 12, tolerance: 40 },
        vocabularyLevel: 'moderate',
        formality: 4,
        emotionalIntensity: 8,
        allowedHumor: false,
        darknessLevel: 6,
        pacing: 'fast',
        descriptionDensity: 4,
        dialogueRatio: { min: 30, max: 60 },
        showVsTell: 9,
        narrativeDistance: 'close',
        maxParagraphLength: 4,
        maxAdverbPercentage: 2,
        maxPassivePercentage: 5,
        avoidFilterWords: true
      }
    });

    // Epic fantasy preset
    this.addPreset({
      id: 'epic-fantasy',
      name: 'Epic Fantasy',
      description: 'Rich worldbuilding with elevated language',
      guide: {
        sentenceLength: { min: 8, max: 45, targetAverage: 20, tolerance: 35 },
        vocabularyLevel: 'advanced',
        formality: 6,
        emotionalIntensity: 7,
        allowedHumor: true,
        darknessLevel: 5,
        pacing: 'variable',
        descriptionDensity: 8,
        dialogueRatio: { min: 20, max: 45 },
        showVsTell: 7,
        narrativeDistance: 'medium',
        maxParagraphLength: 6,
        maxAdverbPercentage: 4,
        maxPassivePercentage: 12,
        avoidFilterWords: false
      }
    });

    // YA contemporary preset
    this.addPreset({
      id: 'ya-contemporary',
      name: 'YA Contemporary',
      description: 'Accessible, relatable voice',
      guide: {
        sentenceLength: { min: 5, max: 30, targetAverage: 14, tolerance: 30 },
        vocabularyLevel: 'moderate',
        formality: 3,
        emotionalIntensity: 8,
        allowedHumor: true,
        darknessLevel: 4,
        pacing: 'moderate',
        descriptionDensity: 5,
        dialogueRatio: { min: 35, max: 55 },
        showVsTell: 7,
        narrativeDistance: 'close',
        maxParagraphLength: 5,
        maxAdverbPercentage: 5,
        maxPassivePercentage: 8,
        avoidFilterWords: true
      }
    });

    // Horror preset
    this.addPreset({
      id: 'horror',
      name: 'Horror',
      description: 'Atmospheric, tension-building prose',
      guide: {
        sentenceLength: { min: 4, max: 35, targetAverage: 15, tolerance: 40 },
        vocabularyLevel: 'moderate',
        formality: 5,
        emotionalIntensity: 9,
        allowedHumor: false,
        darknessLevel: 9,
        pacing: 'variable',
        descriptionDensity: 7,
        dialogueRatio: { min: 20, max: 40 },
        showVsTell: 8,
        narrativeDistance: 'close',
        maxParagraphLength: 5,
        maxAdverbPercentage: 4,
        maxPassivePercentage: 15,
        avoidFilterWords: true
      }
    });
  }

  addPreset(preset: StylePreset): void {
    this.presets.set(preset.id, preset);
  }

  getPreset(id: string): StylePreset | undefined {
    return this.presets.get(id);
  }

  getAllPresets(): StylePreset[] {
    return Array.from(this.presets.values());
  }

  // ==========================================================================
  // STYLE GUIDE MANAGEMENT
  // ==========================================================================

  createGuide(data: {
    name: string;
    description?: string;
    presetId?: string;
    overrides?: Partial<StyleGuide>;
  }): StyleGuide {
    let baseGuide: Partial<StyleGuide> = {};

    // Start from preset if provided
    if (data.presetId) {
      const preset = this.presets.get(data.presetId);
      if (preset) {
        baseGuide = { ...preset.guide };
      }
    }

    const guide: StyleGuide = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      sentenceLength: baseGuide.sentenceLength || { min: 5, max: 35, targetAverage: 15, tolerance: 30 },
      vocabularyLevel: baseGuide.vocabularyLevel || 'moderate',
      forbiddenWords: [],
      preferredTerms: new Map(),
      formality: baseGuide.formality || 5,
      emotionalIntensity: baseGuide.emotionalIntensity || 5,
      allowedHumor: baseGuide.allowedHumor ?? true,
      darknessLevel: baseGuide.darknessLevel || 5,
      pacing: baseGuide.pacing || 'moderate',
      descriptionDensity: baseGuide.descriptionDensity || 5,
      dialogueRatio: baseGuide.dialogueRatio || { min: 20, max: 50 },
      showVsTell: baseGuide.showVsTell || 7,
      pov: POV.THIRD_LIMITED,
      tense: Tense.PAST,
      narrativeDistance: baseGuide.narrativeDistance || 'medium',
      maxParagraphLength: baseGuide.maxParagraphLength || 6,
      maxAdverbPercentage: baseGuide.maxAdverbPercentage || 5,
      maxPassivePercentage: baseGuide.maxPassivePercentage || 10,
      avoidFilterWords: baseGuide.avoidFilterWords ?? true,
      customRules: [],
      ...data.overrides
    };

    this.guides.set(guide.id, guide);
    return guide;
  }

  getGuide(id: string): StyleGuide | undefined {
    return this.guides.get(id);
  }

  getAllGuides(): StyleGuide[] {
    return Array.from(this.guides.values());
  }

  setActiveGuide(guideId: string): boolean {
    if (!this.guides.has(guideId)) return false;
    this.activeGuideId = guideId;
    return true;
  }

  getActiveGuide(): StyleGuide | null {
    if (!this.activeGuideId) return null;
    return this.guides.get(this.activeGuideId) || null;
  }

  updateGuide(id: string, updates: Partial<StyleGuide>): boolean {
    const guide = this.guides.get(id);
    if (!guide) return false;

    Object.assign(guide, updates);
    return true;
  }

  addForbiddenWord(guideId: string, word: string): boolean {
    const guide = this.guides.get(guideId);
    if (!guide) return false;

    if (!guide.forbiddenWords.includes(word.toLowerCase())) {
      guide.forbiddenWords.push(word.toLowerCase());
    }
    return true;
  }

  addPreferredTerm(guideId: string, avoid: string, prefer: string): boolean {
    const guide = this.guides.get(guideId);
    if (!guide) return false;

    const current = guide.preferredTerms.get(avoid.toLowerCase()) || [];
    if (!current.includes(prefer)) {
      guide.preferredTerms.set(avoid.toLowerCase(), [...current, prefer]);
    }
    return true;
  }

  addCustomRule(guideId: string, rule: Omit<StyleRule, 'id'>): StyleRule | null {
    const guide = this.guides.get(guideId);
    if (!guide) return null;

    const newRule: StyleRule = {
      id: uuidv4(),
      ...rule
    };

    guide.customRules.push(newRule);
    return newRule;
  }

  // ==========================================================================
  // TEXT ANALYSIS
  // ==========================================================================

  analyzeText(text: string, guideId?: string): StyleAnalysis {
    const guide = guideId ? this.guides.get(guideId) : this.getActiveGuide();
    if (!guide) {
      throw new Error('No style guide available for analysis');
    }

    const violations: StyleViolation[] = [];
    const elementScores: Record<string, number> = {};

    // Basic text metrics
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = this.extractSentences(text);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // Calculate metrics
    const avgSentenceLength = sentences.length > 0
      ? words.length / sentences.length
      : 0;

    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const sentenceLengthVariance = this.calculateVariance(sentenceLengths);

    const avgParagraphLength = paragraphs.length > 0
      ? sentences.length / paragraphs.length
      : 0;

    const dialogueMatches = text.match(this.patterns.dialogue) || [];
    const dialogueText = dialogueMatches.join(' ');
    const dialoguePercentage = (dialogueText.length / text.length) * 100;

    const adverbMatches = text.match(this.patterns.adverb) || [];
    const adverbPercentage = (adverbMatches.length / words.length) * 100;

    const passiveMatches = text.match(this.patterns.passive) || [];
    const passivePercentage = (passiveMatches.length / sentences.length) * 100;

    const readabilityScore = this.calculateFleschKincaid(text, words.length, sentences.length);

    // Check sentence length
    const sentenceLengthScore = this.checkSentenceLength(
      avgSentenceLength,
      sentenceLengths,
      guide,
      violations
    );
    elementScores[StyleElement.SENTENCE_LENGTH] = sentenceLengthScore;

    // Check dialogue ratio
    const dialogueScore = this.checkDialogueRatio(dialoguePercentage, guide, violations);
    elementScores[StyleElement.DIALOGUE_RATIO] = dialogueScore;

    // Check adverb usage
    const adverbScore = this.checkAdverbUsage(adverbPercentage, adverbMatches, text, guide, violations);
    elementScores[StyleElement.ADVERB_USAGE] = adverbScore;

    // Check passive voice
    const passiveScore = this.checkPassiveVoice(passivePercentage, passiveMatches, text, guide, violations);
    elementScores[StyleElement.PASSIVE_VOICE] = passiveScore;

    // Check filter words
    const filterScore = this.checkFilterWords(text, guide, violations);
    elementScores[StyleElement.FILTER_WORDS] = filterScore;

    // Check forbidden words
    this.checkForbiddenWords(text, guide, violations);

    // Check paragraph length
    const paragraphScore = this.checkParagraphLength(paragraphs, sentences, guide, violations);
    elementScores[StyleElement.PARAGRAPH_LENGTH] = paragraphScore;

    // Run custom rules
    this.runCustomRules(text, guide, violations);

    // Calculate overall score
    const scores = Object.values(elementScores);
    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 100;

    // Build violation summaries
    const violationsByElement: Record<string, number> = {};
    const violationsBySeverity: Record<string, number> = {};

    for (const v of violations) {
      violationsByElement[v.element] = (violationsByElement[v.element] || 0) + 1;
      violationsBySeverity[v.severity] = (violationsBySeverity[v.severity] || 0) + 1;
    }

    const analysis: StyleAnalysis = {
      id: uuidv4(),
      textLength: text.length,
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      metrics: {
        avgSentenceLength,
        sentenceLengthVariance,
        avgParagraphLength,
        dialoguePercentage,
        adverbPercentage,
        passivePercentage,
        readabilityScore
      },
      violations,
      violationsByElement,
      violationsBySeverity,
      overallScore,
      elementScores,
      analyzedAt: new Date(),
      guideId: guide.id
    };

    this.analyses.set(analysis.id, analysis);
    return analysis;
  }

  private extractSentences(text: string): string[] {
    // Remove dialogue to avoid counting dialogue punctuation as sentence ends
    const withoutDialogue = text.replace(this.patterns.dialogue, ' ');
    const matches = withoutDialogue.match(this.patterns.sentence) || [];
    return matches.map(s => s.trim()).filter(s => s.length > 0);
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / numbers.length);
  }

  private calculateFleschKincaid(text: string, wordCount: number, sentenceCount: number): number {
    if (wordCount === 0 || sentenceCount === 0) return 0;

    // Count syllables (simplified)
    const syllableCount = this.countSyllables(text);

    // Flesch Reading Ease formula
    const score = 206.835 -
      1.015 * (wordCount / sentenceCount) -
      84.6 * (syllableCount / wordCount);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let total = 0;

    for (const word of words) {
      // Simplified syllable counting
      const cleaned = word.replace(/[^a-z]/g, '');
      if (cleaned.length === 0) continue;

      let count = cleaned.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
        .replace(/^y/, '')
        .match(/[aeiouy]{1,2}/g)?.length || 1;

      total += count;
    }

    return total;
  }

  // ==========================================================================
  // STYLE CHECKS
  // ==========================================================================

  private checkSentenceLength(
    avg: number,
    lengths: number[],
    guide: StyleGuide,
    violations: StyleViolation[]
  ): number {
    let score = 100;
    const target = guide.sentenceLength.targetAverage;
    const tolerance = guide.sentenceLength.tolerance / 100;

    // Check average
    const deviation = Math.abs(avg - target) / target;
    if (deviation > tolerance) {
      score -= Math.min(30, deviation * 100);
      violations.push({
        id: uuidv4(),
        type: StyleViolationType.DRIFT,
        element: StyleElement.SENTENCE_LENGTH,
        severity: deviation > tolerance * 2 ? Severity.WARNING : Severity.SUGGESTION,
        message: `Average sentence length (${avg.toFixed(1)} words) deviates from target (${target} words)`,
        location: { paragraphIndex: -1 },
        originalText: '',
        suggestion: avg > target
          ? 'Consider breaking up some longer sentences'
          : 'Consider combining some shorter sentences for better flow'
      });
    }

    // Check individual sentences
    let longCount = 0;
    let shortCount = 0;

    for (let i = 0; i < lengths.length; i++) {
      if (lengths[i] > guide.sentenceLength.max) {
        longCount++;
      } else if (lengths[i] < guide.sentenceLength.min) {
        shortCount++;
      }
    }

    if (longCount > lengths.length * 0.1) {
      score -= 15;
      violations.push({
        id: uuidv4(),
        type: StyleViolationType.EXCESS,
        element: StyleElement.SENTENCE_LENGTH,
        severity: Severity.WARNING,
        message: `${longCount} sentences exceed maximum length of ${guide.sentenceLength.max} words`,
        location: { paragraphIndex: -1 },
        originalText: '',
        suggestion: 'Break up run-on sentences for better readability'
      });
    }

    return Math.max(0, score);
  }

  private checkDialogueRatio(
    percentage: number,
    guide: StyleGuide,
    violations: StyleViolation[]
  ): number {
    let score = 100;

    if (percentage < guide.dialogueRatio.min) {
      const deficit = guide.dialogueRatio.min - percentage;
      score -= Math.min(25, deficit);
      violations.push({
        id: uuidv4(),
        type: StyleViolationType.MISSING,
        element: StyleElement.DIALOGUE_RATIO,
        severity: Severity.SUGGESTION,
        message: `Dialogue is ${percentage.toFixed(1)}%, below minimum of ${guide.dialogueRatio.min}%`,
        location: { paragraphIndex: -1 },
        originalText: '',
        suggestion: 'Consider adding more character dialogue to break up narrative'
      });
    } else if (percentage > guide.dialogueRatio.max) {
      const excess = percentage - guide.dialogueRatio.max;
      score -= Math.min(25, excess);
      violations.push({
        id: uuidv4(),
        type: StyleViolationType.EXCESS,
        element: StyleElement.DIALOGUE_RATIO,
        severity: Severity.SUGGESTION,
        message: `Dialogue is ${percentage.toFixed(1)}%, above maximum of ${guide.dialogueRatio.max}%`,
        location: { paragraphIndex: -1 },
        originalText: '',
        suggestion: 'Consider adding more narrative or description between dialogue'
      });
    }

    return Math.max(0, score);
  }

  private checkAdverbUsage(
    percentage: number,
    matches: string[],
    _text: string,
    guide: StyleGuide,
    violations: StyleViolation[]
  ): number {
    let score = 100;

    if (percentage > guide.maxAdverbPercentage) {
      const excess = percentage - guide.maxAdverbPercentage;
      score -= Math.min(30, excess * 5);

      // Find specific problem adverbs
      const problemAdverbs = matches.slice(0, 5);

      violations.push({
        id: uuidv4(),
        type: StyleViolationType.EXCESS,
        element: StyleElement.ADVERB_USAGE,
        severity: percentage > guide.maxAdverbPercentage * 2 ? Severity.WARNING : Severity.SUGGESTION,
        message: `Adverb usage (${percentage.toFixed(1)}%) exceeds maximum (${guide.maxAdverbPercentage}%)`,
        location: { paragraphIndex: -1 },
        originalText: problemAdverbs.join(', '),
        suggestion: 'Replace adverbs with stronger verbs (e.g., "walked quickly" -> "hurried")'
      });
    }

    return Math.max(0, score);
  }

  private checkPassiveVoice(
    percentage: number,
    matches: string[],
    _text: string,
    guide: StyleGuide,
    violations: StyleViolation[]
  ): number {
    let score = 100;

    if (percentage > guide.maxPassivePercentage) {
      const excess = percentage - guide.maxPassivePercentage;
      score -= Math.min(25, excess * 3);

      violations.push({
        id: uuidv4(),
        type: StyleViolationType.EXCESS,
        element: StyleElement.PASSIVE_VOICE,
        severity: Severity.SUGGESTION,
        message: `Passive voice (${percentage.toFixed(1)}%) exceeds maximum (${guide.maxPassivePercentage}%)`,
        location: { paragraphIndex: -1 },
        originalText: matches.slice(0, 3).join(', '),
        suggestion: 'Convert passive constructions to active voice for stronger prose'
      });
    }

    return Math.max(0, score);
  }

  private checkFilterWords(
    text: string,
    guide: StyleGuide,
    violations: StyleViolation[]
  ): number {
    if (!guide.avoidFilterWords) return 100;

    let score = 100;
    const matches = text.match(this.patterns.filterWords) || [];

    if (matches.length > 0) {
      const percentage = (matches.length / text.split(/\s+/).length) * 100;

      if (percentage > 1) {
        score -= Math.min(20, matches.length * 2);
        violations.push({
          id: uuidv4(),
          type: StyleViolationType.PROHIBITED,
          element: StyleElement.FILTER_WORDS,
          severity: Severity.SUGGESTION,
          message: `Found ${matches.length} filter words that distance the reader`,
          location: { paragraphIndex: -1 },
          originalText: [...new Set(matches)].slice(0, 5).join(', '),
          suggestion: 'Remove filter words to make prose more immediate (e.g., "She felt cold" -> "Cold seeped into her bones")'
        });
      }
    }

    return Math.max(0, score);
  }

  private checkForbiddenWords(
    text: string,
    guide: StyleGuide,
    violations: StyleViolation[]
  ): void {
    for (const word of guide.forbiddenWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);

      if (matches && matches.length > 0) {
        const preferred = guide.preferredTerms.get(word);
        violations.push({
          id: uuidv4(),
          type: StyleViolationType.PROHIBITED,
          element: StyleElement.WORD_FREQUENCY,
          severity: Severity.WARNING,
          message: `Found forbidden word "${word}" ${matches.length} time(s)`,
          location: { paragraphIndex: -1 },
          originalText: word,
          suggestion: preferred
            ? `Replace with: ${preferred.join(', ')}`
            : `Avoid using "${word}"`
        });
      }
    }
  }

  private checkParagraphLength(
    paragraphs: string[],
    _sentences: string[],
    guide: StyleGuide,
    violations: StyleViolation[]
  ): number {
    let score = 100;
    let longParagraphs = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const paraText = paragraphs[i];
      const paraSentences = this.extractSentences(paraText);

      if (paraSentences.length > guide.maxParagraphLength) {
        longParagraphs++;
        if (longParagraphs <= 3) {
          violations.push({
            id: uuidv4(),
            type: StyleViolationType.EXCESS,
            element: StyleElement.PARAGRAPH_LENGTH,
            severity: Severity.SUGGESTION,
            message: `Paragraph ${i + 1} has ${paraSentences.length} sentences (max: ${guide.maxParagraphLength})`,
            location: { paragraphIndex: i },
            originalText: paraText.substring(0, 100) + '...',
            suggestion: 'Consider breaking this paragraph into smaller units'
          });
        }
      }
    }

    if (longParagraphs > 0) {
      score -= Math.min(20, longParagraphs * 5);
    }

    return Math.max(0, score);
  }

  private runCustomRules(
    text: string,
    guide: StyleGuide,
    violations: StyleViolation[]
  ): void {
    for (const rule of guide.customRules) {
      // Check pattern presence
      if (rule.pattern) {
        const matches = text.match(rule.pattern) || [];

        if (rule.minOccurrences && matches.length < rule.minOccurrences) {
          violations.push({
            id: uuidv4(),
            type: StyleViolationType.MISSING,
            element: StyleElement.SENTENCE_STRUCTURE,
            severity: rule.severity,
            message: `${rule.name}: Found ${matches.length} occurrences (min: ${rule.minOccurrences})`,
            location: { paragraphIndex: -1 },
            originalText: '',
            suggestion: rule.suggestion,
            ruleId: rule.id
          });
        }

        if (rule.maxOccurrences && matches.length > rule.maxOccurrences) {
          violations.push({
            id: uuidv4(),
            type: StyleViolationType.EXCESS,
            element: StyleElement.SENTENCE_STRUCTURE,
            severity: rule.severity,
            message: `${rule.name}: Found ${matches.length} occurrences (max: ${rule.maxOccurrences})`,
            location: { paragraphIndex: -1 },
            originalText: matches.slice(0, 3).join(', '),
            suggestion: rule.suggestion,
            ruleId: rule.id
          });
        }
      }

      // Check anti-pattern absence
      if (rule.antiPattern) {
        const matches = text.match(rule.antiPattern);

        if (matches && matches.length > 0) {
          violations.push({
            id: uuidv4(),
            type: StyleViolationType.PROHIBITED,
            element: StyleElement.SENTENCE_STRUCTURE,
            severity: rule.severity,
            message: `${rule.name}: Found prohibited pattern`,
            location: { paragraphIndex: -1 },
            originalText: matches.slice(0, 3).join(', '),
            suggestion: rule.suggestion,
            ruleId: rule.id
          });
        }
      }
    }
  }

  // ==========================================================================
  // COMPARISON & DRIFT DETECTION
  // ==========================================================================

  compareAnalyses(analysisIdA: string, analysisIdB: string): {
    drift: boolean;
    driftScore: number;
    differences: { element: string; valueA: number; valueB: number; change: number }[];
  } | null {
    const a = this.analyses.get(analysisIdA);
    const b = this.analyses.get(analysisIdB);

    if (!a || !b) return null;

    const differences: { element: string; valueA: number; valueB: number; change: number }[] = [];

    // Compare metrics
    const metricsA = a.metrics;
    const metricsB = b.metrics;

    const metricPairs = [
      ['avgSentenceLength', metricsA.avgSentenceLength, metricsB.avgSentenceLength],
      ['dialoguePercentage', metricsA.dialoguePercentage, metricsB.dialoguePercentage],
      ['adverbPercentage', metricsA.adverbPercentage, metricsB.adverbPercentage],
      ['passivePercentage', metricsA.passivePercentage, metricsB.passivePercentage],
      ['readabilityScore', metricsA.readabilityScore, metricsB.readabilityScore]
    ];

    for (const [name, valA, valB] of metricPairs) {
      const numA = valA as number;
      const numB = valB as number;
      const change = numA !== 0 ? ((numB - numA) / numA) * 100 : 0;
      if (Math.abs(change) > 10) {
        differences.push({
          element: name as string,
          valueA: numA,
          valueB: numB,
          change
        });
      }
    }

    // Calculate drift score
    const driftScore = differences.length > 0
      ? Math.min(100, differences.reduce((sum, d) => sum + Math.abs(d.change), 0) / differences.length)
      : 0;

    return {
      drift: driftScore > 20,
      driftScore,
      differences
    };
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getStats(): {
    guides: number;
    presets: number;
    analyses: number;
    avgScore: number;
    mostCommonViolations: { element: string; count: number }[];
  } {
    const analyses = Array.from(this.analyses.values());

    const violationCounts: Record<string, number> = {};
    let totalScore = 0;

    for (const analysis of analyses) {
      totalScore += analysis.overallScore;
      for (const [element, count] of Object.entries(analysis.violationsByElement)) {
        violationCounts[element] = (violationCounts[element] || 0) + count;
      }
    }

    const mostCommonViolations = Object.entries(violationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([element, count]) => ({ element, count }));

    return {
      guides: this.guides.size,
      presets: this.presets.size,
      analyses: analyses.length,
      avgScore: analyses.length > 0 ? Math.round(totalScore / analyses.length) : 0,
      mostCommonViolations
    };
  }

  // ==========================================================================
  // EXPORT/IMPORT
  // ==========================================================================

  exportToJSON(): string {
    const guidesArray = Array.from(this.guides.values()).map(g => ({
      ...g,
      preferredTerms: Array.from(g.preferredTerms.entries())
    }));

    return JSON.stringify({
      guides: guidesArray,
      analyses: Array.from(this.analyses.values())
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.guides) {
      for (const guideData of data.guides) {
        const guide: StyleGuide = {
          ...guideData,
          preferredTerms: new Map(guideData.preferredTerms || [])
        };
        this.guides.set(guide.id, guide);
      }
    }

    if (data.analyses) {
      for (const analysis of data.analyses) {
        analysis.analyzedAt = new Date(analysis.analyzedAt);
        this.analyses.set(analysis.id, analysis);
      }
    }
  }

  // ==========================================================================
  // CLEAR
  // ==========================================================================

  clear(): void {
    this.guides.clear();
    this.analyses.clear();
    this.activeGuideId = null;
  }
}

// Export singleton instance
export const styleEnforcer = new StyleEnforcer();

export default StyleEnforcer;
