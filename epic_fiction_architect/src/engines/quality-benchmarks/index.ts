/**
 * Quality Benchmark Engine
 *
 * Provides comprehensive quality validation and benchmarking for AI-generated content.
 * Integrates with LeadingEdgeAIConfig for model validation and automatic fallback.
 * Ensures all generated content meets frontier quality standards.
 *
 * @module engines/quality-benchmarks
 */

import { v4 as uuidv4 } from 'uuid';
import {
  LeadingEdgeAIConfig,
  FrontierModel,
  FrontierProvider,
  ModelTier,
  ModelCapability,
  QualityBenchmark,
  countSensoryDetails,
  calculateReadability,
  analyzePacing,
} from '../../config/leading-edge-ai';

// ============================================================================
// Quality Standards Definitions
// ============================================================================

/**
 * Quality dimension being measured
 */
export enum QualityDimension {
  PROSE_QUALITY = 'prose_quality',
  CHARACTER_VOICE = 'character_voice',
  DIALOGUE_AUTHENTICITY = 'dialogue_authenticity',
  PLOT_COHERENCE = 'plot_coherence',
  EMOTIONAL_RESONANCE = 'emotional_resonance',
  PACING_CONTROL = 'pacing_control',
  SENSORY_IMMERSION = 'sensory_immersion',
  WORLD_CONSISTENCY = 'world_consistency',
  THEME_INTEGRATION = 'theme_integration',
  TECHNICAL_ACCURACY = 'technical_accuracy',
}

/**
 * Quality threshold configuration
 */
export interface QualityThreshold {
  dimension: QualityDimension;
  minimumScore: number;      // 0-100
  targetScore: number;       // 0-100
  weight: number;            // Weight in overall calculation
  required: boolean;         // Must meet minimum to pass
}

/**
 * Default quality thresholds for frontier-quality writing
 */
export const FRONTIER_QUALITY_THRESHOLDS: QualityThreshold[] = [
  {
    dimension: QualityDimension.PROSE_QUALITY,
    minimumScore: 80,
    targetScore: 90,
    weight: 0.15,
    required: true,
  },
  {
    dimension: QualityDimension.CHARACTER_VOICE,
    minimumScore: 85,
    targetScore: 95,
    weight: 0.15,
    required: true,
  },
  {
    dimension: QualityDimension.DIALOGUE_AUTHENTICITY,
    minimumScore: 80,
    targetScore: 90,
    weight: 0.10,
    required: true,
  },
  {
    dimension: QualityDimension.PLOT_COHERENCE,
    minimumScore: 90,
    targetScore: 98,
    weight: 0.15,
    required: true,
  },
  {
    dimension: QualityDimension.EMOTIONAL_RESONANCE,
    minimumScore: 75,
    targetScore: 90,
    weight: 0.15,
    required: false,
  },
  {
    dimension: QualityDimension.PACING_CONTROL,
    minimumScore: 75,
    targetScore: 85,
    weight: 0.10,
    required: false,
  },
  {
    dimension: QualityDimension.SENSORY_IMMERSION,
    minimumScore: 70,
    targetScore: 85,
    weight: 0.10,
    required: false,
  },
  {
    dimension: QualityDimension.WORLD_CONSISTENCY,
    minimumScore: 95,
    targetScore: 100,
    weight: 0.10,
    required: true,
  },
];

// ============================================================================
// Model Validation
// ============================================================================

/**
 * Result of model validation
 */
export interface ModelValidationResult {
  isValid: boolean;
  modelId: string;
  tier: ModelTier;
  reasons: string[];
  warnings: string[];
  suggestedAlternatives?: string[];
}

/**
 * Fallback strategy when model fails
 */
export enum FallbackStrategy {
  SAME_PROVIDER_NEXT_BEST = 'same_provider_next_best',
  ANY_PROVIDER_BEST_QUALITY = 'any_provider_best_quality',
  SPECIFIC_MODEL = 'specific_model',
  FAIL_FAST = 'fail_fast',
}

/**
 * Fallback configuration
 */
export interface FallbackConfig {
  strategy: FallbackStrategy;
  maxAttempts: number;
  specificModelIds?: string[];
  allowTier2Fallback: boolean;
  logFallbacks: boolean;
}

// ============================================================================
// Quality Assessment Results
// ============================================================================

/**
 * Individual dimension assessment
 */
export interface DimensionAssessment {
  dimension: QualityDimension;
  score: number;
  threshold: QualityThreshold;
  passed: boolean;
  notes: string[];
  suggestedImprovements: string[];
}

/**
 * Complete quality assessment for generated content
 */
export interface QualityAssessment {
  assessmentId: string;
  timestamp: Date;
  contentId: string;
  modelUsed: string;

  // Dimension scores
  dimensions: DimensionAssessment[];

  // Aggregate scores
  overallScore: number;
  passedAllRequired: boolean;
  passedAllThresholds: boolean;

  // Content metrics
  wordCount: number;
  readabilityScore: number;
  sensoryDetailCount: number;
  pacingAnalysis: {
    averageSentenceLength: number;
    variation: number;
    tempo: string;
  };

  // Recommendations
  criticalIssues: string[];
  recommendations: string[];
  regenerationNeeded: boolean;

  // Benchmark comparison
  comparedToAverage: {
    dimension: QualityDimension;
    score: number;
    averageScore: number;
    percentile: number;
  }[];
}

// ============================================================================
// Quality Benchmark Engine
// ============================================================================

/**
 * Quality Benchmark Engine
 *
 * Validates AI model selection, tracks quality metrics, and provides
 * automatic fallback when quality standards aren't met.
 */
export class QualityBenchmarkEngine {
  private aiConfig: LeadingEdgeAIConfig;
  private thresholds: Map<QualityDimension, QualityThreshold> = new Map();
  private assessments: Map<string, QualityAssessment> = new Map();
  private benchmarkHistory: QualityBenchmark[] = [];

  // Fallback tracking
  private fallbackLog: {
    timestamp: Date;
    originalModel: string;
    fallbackModel: string;
    reason: string;
    success: boolean;
  }[] = [];

  // Model performance tracking
  private modelPerformance: Map<string, {
    totalGenerations: number;
    averageQuality: number;
    failureRate: number;
    lastUpdated: Date;
  }> = new Map();

  private defaultFallbackConfig: FallbackConfig = {
    strategy: FallbackStrategy.ANY_PROVIDER_BEST_QUALITY,
    maxAttempts: 3,
    allowTier2Fallback: false,  // Enforce frontier only
    logFallbacks: true,
  };

  constructor(aiConfig?: LeadingEdgeAIConfig) {
    this.aiConfig = aiConfig || new LeadingEdgeAIConfig();
    this.initializeThresholds();
  }

  /**
   * Initialize default quality thresholds
   */
  private initializeThresholds(): void {
    for (const threshold of FRONTIER_QUALITY_THRESHOLDS) {
      this.thresholds.set(threshold.dimension, threshold);
    }
  }

  // ============================================================================
  // Model Validation
  // ============================================================================

  /**
   * Validate a model meets frontier quality requirements
   */
  validateModel(modelId: string): ModelValidationResult {
    const validation = this.aiConfig.validateModel(modelId);
    const frontierModels = this.aiConfig.getFrontierModels();
    const model = frontierModels.find(m => m.modelId === modelId);

    const result: ModelValidationResult = {
      isValid: validation.valid,
      modelId,
      tier: model?.tier || ModelTier.TIER_4_LEGACY,
      reasons: [],
      warnings: [],
      suggestedAlternatives: [],
    };

    if (!validation.valid) {
      result.reasons.push(validation.reason || 'Model not approved for use');
    }

    // Check tier
    if (model) {
      if (model.tier === ModelTier.TIER_3_STANDARD) {
        result.isValid = false;
        result.reasons.push('Tier 3 (Standard) models are BLOCKED for quality writing');
      } else if (model.tier === ModelTier.TIER_4_LEGACY) {
        result.isValid = false;
        result.reasons.push('Tier 4 (Legacy) models are NEVER allowed');
      } else if (model.tier === ModelTier.TIER_2_ADVANCED) {
        result.warnings.push('Tier 2 model - may produce lower quality than Tier 1');
        // Still valid but with warning
      }

      // Check release date - warn if old
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      if (model.releaseDate < sixMonthsAgo) {
        result.warnings.push(
          `Model released ${model.releaseDate.toISOString().split('T')[0]} - ` +
          `newer models may provide better quality`
        );
      }

      // Check quality score
      if (model.qualityScore < 85) {
        result.warnings.push(
          `Model quality score ${model.qualityScore} is below optimal threshold of 85`
        );
      }
    }

    // Suggest alternatives if not valid or if there are warnings
    if (!result.isValid || result.warnings.length > 0) {
      result.suggestedAlternatives = frontierModels
        .filter(m => m.tier === ModelTier.TIER_1_FRONTIER && m.modelId !== modelId)
        .sort((a, b) => b.qualityScore - a.qualityScore)
        .slice(0, 3)
        .map(m => m.modelId);
    }

    return result;
  }

  /**
   * Select the best model for a task with automatic fallback
   */
  selectModelWithFallback(
    requiredCapabilities: ModelCapability[],
    preferredProvider?: FrontierProvider,
    config?: Partial<FallbackConfig>
  ): {
    model: FrontierModel;
    wasFallback: boolean;
    fallbackReason?: string;
  } {
    const fallbackConfig = { ...this.defaultFallbackConfig, ...config };
    const frontierModels = this.aiConfig.getFrontierModels();

    // First, try to find preferred model
    let selectedModel = this.aiConfig.getBestModelForTask(requiredCapabilities, preferredProvider);

    if (selectedModel) {
      const validation = this.validateModel(selectedModel.modelId);
      if (validation.isValid) {
        return { model: selectedModel, wasFallback: false };
      }
    }

    // Fallback logic
    let attempts = 0;
    let fallbackReason = 'Primary model not available or valid';

    while (attempts < fallbackConfig.maxAttempts) {
      attempts++;

      switch (fallbackConfig.strategy) {
        case FallbackStrategy.SAME_PROVIDER_NEXT_BEST:
          if (preferredProvider) {
            selectedModel = frontierModels
              .filter(m => m.provider === preferredProvider)
              .filter(m => requiredCapabilities.every(c => m.capabilities.includes(c)))
              .filter(m => m.modelId !== selectedModel?.modelId)
              .sort((a, b) => b.qualityScore - a.qualityScore)[0] || null;
          }
          break;

        case FallbackStrategy.ANY_PROVIDER_BEST_QUALITY:
          selectedModel = frontierModels
            .filter(m => {
              if (!fallbackConfig.allowTier2Fallback && m.tier !== ModelTier.TIER_1_FRONTIER) {
                return false;
              }
              return requiredCapabilities.every(c => m.capabilities.includes(c));
            })
            .filter(m => m.modelId !== selectedModel?.modelId)
            .sort((a, b) => b.qualityScore - a.qualityScore)[0] || null;
          break;

        case FallbackStrategy.SPECIFIC_MODEL:
          if (fallbackConfig.specificModelIds && fallbackConfig.specificModelIds[attempts - 1]) {
            const specificId = fallbackConfig.specificModelIds[attempts - 1];
            selectedModel = frontierModels.find(m => m.modelId === specificId) || null;
          }
          break;

        case FallbackStrategy.FAIL_FAST:
          throw new Error('Primary model failed and FAIL_FAST strategy is configured');
      }

      if (selectedModel) {
        const validation = this.validateModel(selectedModel.modelId);
        if (validation.isValid) {
          if (fallbackConfig.logFallbacks) {
            this.fallbackLog.push({
              timestamp: new Date(),
              originalModel: 'preferred',
              fallbackModel: selectedModel.modelId,
              reason: fallbackReason,
              success: true,
            });
          }

          return {
            model: selectedModel,
            wasFallback: true,
            fallbackReason,
          };
        }
      }
    }

    // Final fallback to Claude Opus 4 (should always work)
    const ultimateFallback = frontierModels.find(
      m => m.modelId === 'claude-opus-4-20250514'
    );

    if (ultimateFallback) {
      return {
        model: ultimateFallback,
        wasFallback: true,
        fallbackReason: 'All preferences exhausted, using Claude Opus 4',
      };
    }

    throw new Error('No valid frontier models available for the requested capabilities');
  }

  // ============================================================================
  // Quality Assessment
  // ============================================================================

  /**
   * Perform comprehensive quality assessment on generated content
   */
  assessQuality(
    content: string,
    contentId: string,
    modelUsed: string,
    context?: {
      characterVoiceExpected?: string;
      plotRequirements?: string[];
      emotionalTarget?: string;
    }
  ): QualityAssessment {
    const assessmentId = uuidv4();
    const timestamp = new Date();

    // Basic metrics
    const wordCount = content.split(/\s+/).length;
    const readabilityScore = calculateReadability(content);
    const sensoryDetailCount = countSensoryDetails(content);
    const pacingAnalysis = analyzePacing(content);

    // Assess each dimension
    const dimensions: DimensionAssessment[] = [];
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    for (const [dimension, threshold] of this.thresholds) {
      const assessment = this.assessDimension(
        content,
        dimension,
        threshold,
        context
      );
      dimensions.push(assessment);

      if (!assessment.passed && threshold.required) {
        criticalIssues.push(
          `${dimension}: Score ${assessment.score.toFixed(1)} below minimum ${threshold.minimumScore}`
        );
      }

      recommendations.push(...assessment.suggestedImprovements);
    }

    // Calculate overall score
    let overallScore = 0;
    let totalWeight = 0;

    for (const dim of dimensions) {
      const threshold = this.thresholds.get(dim.dimension)!;
      overallScore += dim.score * threshold.weight;
      totalWeight += threshold.weight;
    }

    overallScore = totalWeight > 0 ? overallScore / totalWeight : 0;

    // Check if all thresholds passed
    const passedAllRequired = dimensions
      .filter(d => this.thresholds.get(d.dimension)?.required)
      .every(d => d.passed);

    const passedAllThresholds = dimensions.every(d => d.passed);

    // Compare to historical average
    const comparedToAverage = this.compareToHistoricalAverage(dimensions);

    const assessment: QualityAssessment = {
      assessmentId,
      timestamp,
      contentId,
      modelUsed,
      dimensions,
      overallScore,
      passedAllRequired,
      passedAllThresholds,
      wordCount,
      readabilityScore,
      sensoryDetailCount,
      pacingAnalysis: {
        averageSentenceLength: pacingAnalysis.averageSentenceLength,
        variation: pacingAnalysis.variation,
        tempo: pacingAnalysis.tempo,
      },
      criticalIssues,
      recommendations: [...new Set(recommendations)], // Remove duplicates
      regenerationNeeded: !passedAllRequired || overallScore < 75,
      comparedToAverage,
    };

    // Store assessment
    this.assessments.set(assessmentId, assessment);

    // Update model performance tracking
    this.updateModelPerformance(modelUsed, overallScore, !passedAllRequired);

    return assessment;
  }

  /**
   * Assess a specific quality dimension
   */
  private assessDimension(
    content: string,
    dimension: QualityDimension,
    threshold: QualityThreshold,
    _context?: {
      characterVoiceExpected?: string;
      plotRequirements?: string[];
      emotionalTarget?: string;
    }
  ): DimensionAssessment {
    let score = 0;
    const notes: string[] = [];
    const suggestedImprovements: string[] = [];

    switch (dimension) {
      case QualityDimension.PROSE_QUALITY:
        score = this.assessProseQuality(content, notes, suggestedImprovements);
        break;

      case QualityDimension.CHARACTER_VOICE:
        score = this.assessCharacterVoice(content, notes, suggestedImprovements);
        break;

      case QualityDimension.DIALOGUE_AUTHENTICITY:
        score = this.assessDialogueAuthenticity(content, notes, suggestedImprovements);
        break;

      case QualityDimension.PLOT_COHERENCE:
        score = this.assessPlotCoherence(content, notes, suggestedImprovements);
        break;

      case QualityDimension.EMOTIONAL_RESONANCE:
        score = this.assessEmotionalResonance(content, notes, suggestedImprovements);
        break;

      case QualityDimension.PACING_CONTROL:
        score = this.assessPacingControl(content, notes, suggestedImprovements);
        break;

      case QualityDimension.SENSORY_IMMERSION:
        score = this.assessSensoryImmersion(content, notes, suggestedImprovements);
        break;

      case QualityDimension.WORLD_CONSISTENCY:
        score = this.assessWorldConsistency(content, notes, suggestedImprovements);
        break;

      case QualityDimension.THEME_INTEGRATION:
        score = this.assessThemeIntegration(content, notes, suggestedImprovements);
        break;

      case QualityDimension.TECHNICAL_ACCURACY:
        score = this.assessTechnicalAccuracy(content, notes, suggestedImprovements);
        break;
    }

    return {
      dimension,
      score,
      threshold,
      passed: score >= threshold.minimumScore,
      notes,
      suggestedImprovements,
    };
  }

  // ============================================================================
  // Dimension Assessment Functions
  // ============================================================================

  private assessProseQuality(
    content: string,
    notes: string[],
    suggestions: string[]
  ): number {
    let score = 80;

    // Check for filter words
    const filterWordPattern = /\b(saw|heard|felt|noticed|realized|knew|thought|wondered)\s+that\b/gi;
    const filterMatches = content.match(filterWordPattern) || [];
    if (filterMatches.length > 0) {
      score -= filterMatches.length * 2;
      notes.push(`Found ${filterMatches.length} filter word constructions`);
      suggestions.push('Remove filter words (saw that, felt that) for more immediate prose');
    }

    // Check for adverb dialogue tags
    const adverbTagPattern = /\b(said|whispered|shouted|replied|asked)\s+\w+ly\b/gi;
    const adverbMatches = content.match(adverbTagPattern) || [];
    if (adverbMatches.length > 0) {
      score -= adverbMatches.length * 3;
      notes.push(`Found ${adverbMatches.length} adverb dialogue tags`);
      suggestions.push('Remove adverbs from dialogue tags - show emotion through action');
    }

    // Check readability
    const readability = calculateReadability(content);
    if (readability < 40) {
      score -= 10;
      notes.push(`Low readability score: ${readability.toFixed(1)}`);
      suggestions.push('Simplify sentence structure for better flow');
    } else if (readability > 60) {
      score += 5;
      notes.push(`Good readability: ${readability.toFixed(1)}`);
    }

    // Check sentence variety
    const pacing = analyzePacing(content);
    if (pacing.variation < 3) {
      score -= 5;
      notes.push('Low sentence length variation');
      suggestions.push('Vary sentence length for better rhythm');
    } else if (pacing.variation > 5) {
      score += 5;
      notes.push('Good sentence variety');
    }

    // Check for passive voice overuse
    const passivePattern = /\b(was|were|been|being)\s+\w+ed\b/gi;
    const passiveMatches = content.match(passivePattern) || [];
    const words = content.split(/\s+/).length;
    const passiveRatio = passiveMatches.length / words;
    if (passiveRatio > 0.03) {
      score -= 5;
      notes.push(`High passive voice usage: ${(passiveRatio * 100).toFixed(1)}%`);
      suggestions.push('Convert passive constructions to active voice');
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessCharacterVoice(
    content: string,
    notes: string[],
    suggestions: string[]
  ): number {
    let score = 85;

    // Check for dialogue presence
    const dialoguePattern = /"[^"]+"/g;
    const dialogueMatches = content.match(dialoguePattern) || [];

    if (dialogueMatches.length === 0) {
      notes.push('No dialogue found - cannot fully assess voice');
      return 70; // Partial score
    }

    // Analyze dialogue variety
    const dialogueLengths = dialogueMatches.map(d => d.length);
    const avgLength = dialogueLengths.reduce((a, b) => a + b, 0) / dialogueLengths.length;
    const variance = dialogueLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / dialogueLengths.length;

    if (variance > 100) {
      score += 5;
      notes.push('Good dialogue length variety');
    } else {
      notes.push('Dialogue lengths too uniform');
      suggestions.push('Vary dialogue length - some characters should be more verbose');
    }

    // Check for dialogue tags variety
    const tagPattern = /(said|asked|replied|whispered|shouted|muttered|murmured)/gi;
    const tags = content.match(tagPattern) || [];
    const uniqueTags = new Set(tags.map(t => t.toLowerCase()));

    if (tags.length > 5 && uniqueTags.size < 3) {
      score -= 5;
      notes.push('Limited dialogue tag variety');
      suggestions.push('Consider action beats instead of repeated dialogue tags');
    }

    // Check for action beats in dialogue
    const actionBeatPattern = /[.!?]\s*[A-Z][^"]*[.!?]\s*"/g;
    const actionBeats = content.match(actionBeatPattern) || [];
    if (actionBeats.length > 0) {
      score += 5;
      notes.push('Good use of action beats');
    } else {
      suggestions.push('Add action beats between dialogue lines');
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessDialogueAuthenticity(
    content: string,
    notes: string[],
    suggestions: string[]
  ): number {
    let score = 80;

    // Check for contractions (natural speech usually has them)
    const contractionPattern = /\b(I'm|don't|won't|can't|shouldn't|couldn't|wouldn't|I'll|we'll|they'll|it's|that's|what's)\b/gi;
    const contractions = content.match(contractionPattern) || [];

    const dialoguePattern = /"[^"]+"/g;
    const dialogueMatches = content.match(dialoguePattern) || [];

    if (dialogueMatches.length > 0) {
      const totalDialogueWords = dialogueMatches.join(' ').split(/\s+/).length;
      const contractionRatio = contractions.length / totalDialogueWords;

      if (contractionRatio > 0.02) {
        score += 5;
        notes.push('Natural use of contractions in dialogue');
      } else {
        notes.push('Dialogue may be too formal');
        suggestions.push('Add contractions for more natural dialogue');
      }
    }

    // Check for speech variety (questions, exclamations, statements)
    const questions = (content.match(/"\s*[^"]*\?\s*"/g) || []).length;
    const exclamations = (content.match(/"\s*[^"]*!\s*"/g) || []).length;
    const statements = dialogueMatches.length - questions - exclamations;

    if (dialogueMatches.length > 5) {
      if (questions > 0 && exclamations > 0 && statements > 0) {
        score += 5;
        notes.push('Good variety in dialogue types');
      } else {
        notes.push('Dialogue types could be more varied');
        suggestions.push('Mix questions, exclamations, and statements');
      }
    }

    // Check for interruptions and natural speech patterns
    const interruptionPattern = /—"|\.\.\."/g;
    const interruptions = content.match(interruptionPattern) || [];
    if (interruptions.length > 0) {
      score += 3;
      notes.push('Natural interruptions and trailing off in dialogue');
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessPlotCoherence(
    content: string,
    notes: string[],
    suggestions: string[]
  ): number {
    let score = 85;

    // Check for narrative flow indicators
    const transitionWords = /\b(however|therefore|meanwhile|afterwards|consequently|subsequently|nevertheless|furthermore)\b/gi;
    const transitions = content.match(transitionWords) || [];

    const words = content.split(/\s+/).length;
    if (words > 500 && transitions.length < 2) {
      score -= 5;
      notes.push('Few transition words for longer passage');
      suggestions.push('Add transitional phrases for better narrative flow');
    }

    // Check for scene grounding
    const locationPattern = /\b(room|hall|forest|city|street|building|house|chamber|valley|mountain|village|castle)\b/gi;
    const locations = content.match(locationPattern) || [];
    if (locations.length === 0 && words > 200) {
      score -= 5;
      notes.push('Scene may lack location grounding');
      suggestions.push('Establish where the scene takes place');
    }

    // Check for temporal markers
    const temporalPattern = /\b(morning|evening|night|dawn|dusk|later|earlier|hour|moment|second|minute|day|week|month|year)\b/gi;
    const temporals = content.match(temporalPattern) || [];
    if (temporals.length > 0) {
      score += 3;
      notes.push('Good use of temporal markers');
    } else if (words > 300) {
      suggestions.push('Consider adding temporal context');
    }

    // Check for character references maintaining consistency
    const characterReferences = content.match(/\b(he|she|they|it|the man|the woman|the boy|the girl)\b/gi) || [];
    if (characterReferences.length > 0) {
      notes.push('Character pronoun usage present');
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessEmotionalResonance(
    content: string,
    notes: string[],
    suggestions: string[]
  ): number {
    let score = 75;

    // Check for emotional vocabulary
    const emotionalWords = content.match(
      /\b(love|hate|fear|joy|anger|sadness|hope|despair|triumph|loss|betrayal|trust|passion|grief|elation|terror|wonder|awe|shame|pride|jealousy|longing|relief|anxiety|peace|fury|tenderness)\b/gi
    ) || [];

    const words = content.split(/\s+/).length;
    const emotionalDensity = emotionalWords.length / words;

    if (emotionalDensity > 0.02) {
      score += 10;
      notes.push('Good emotional vocabulary density');
    } else if (emotionalDensity < 0.005) {
      notes.push('Low emotional word presence');
      suggestions.push('Incorporate more emotionally resonant language');
    }

    // Check for physical manifestations of emotion
    const physicalEmotionPattern = /\b(heart|chest|stomach|throat|hands|trembl|shak|sweat|tears|breath|pulse|clench|tight)\w*\b/gi;
    const physicalEmotions = content.match(physicalEmotionPattern) || [];

    if (physicalEmotions.length > 2) {
      score += 10;
      notes.push('Good physical manifestation of emotion');
    } else if (words > 500) {
      suggestions.push('Show emotions through physical sensations');
    }

    // Check for internal thoughts
    const thoughtPattern = /\b(thought|wondered|realized|knew|felt|sensed|understood|remembered)\b/gi;
    const thoughts = content.match(thoughtPattern) || [];
    if (thoughts.length > 0) {
      score += 5;
      notes.push('Internal perspective present');
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessPacingControl(
    content: string,
    notes: string[],
    suggestions: string[]
  ): number {
    const pacing = analyzePacing(content);
    let score = 75;

    // Assess based on variation
    if (pacing.variation > 5) {
      score += 15;
      notes.push('Excellent sentence length variation');
    } else if (pacing.variation > 3) {
      score += 8;
      notes.push('Good sentence length variation');
    } else {
      notes.push('Limited sentence variation');
      suggestions.push('Mix short punchy sentences with longer flowing ones');
    }

    // Check for paragraph variety
    const paragraphs = content.split(/\n\n+/);
    if (paragraphs.length > 1) {
      const paraLengths = paragraphs.map(p => p.split(/\s+/).length);
      const paraVariance = paraLengths.reduce((sum, len) => {
        const avg = paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length;
        return sum + Math.pow(len - avg, 2);
      }, 0) / paraLengths.length;

      if (paraVariance > 500) {
        score += 5;
        notes.push('Good paragraph length variety');
      }
    }

    // Assess tempo classification
    if (pacing.tempo === 'varied') {
      score += 5;
      notes.push('Dynamic, varied tempo detected');
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessSensoryImmersion(
    content: string,
    notes: string[],
    suggestions: string[]
  ): number {
    const sensoryCount = countSensoryDetails(content);
    let score = 60 + (sensoryCount * 10);

    notes.push(`${sensoryCount} of 5 senses engaged`);

    if (sensoryCount >= 4) {
      notes.push('Excellent sensory immersion');
    } else if (sensoryCount >= 3) {
      notes.push('Good sensory detail');
    } else {
      const missingSenses: string[] = [];

      if (!/\b(saw|looked|gazed|watched|eye|bright|dark|light|color)/gi.test(content)) {
        missingSenses.push('visual');
      }
      if (!/\b(heard|sound|voice|whisper|echo|silence|loud)/gi.test(content)) {
        missingSenses.push('auditory');
      }
      if (!/\b(felt|touch|smooth|rough|cold|warm|soft)/gi.test(content)) {
        missingSenses.push('tactile');
      }
      if (!/\b(smell|scent|aroma|stench|fragrance)/gi.test(content)) {
        missingSenses.push('olfactory');
      }
      if (!/\b(taste|flavor|sweet|bitter|sour)/gi.test(content)) {
        missingSenses.push('gustatory');
      }

      if (missingSenses.length > 0) {
        suggestions.push(`Add ${missingSenses.slice(0, 2).join(' and ')} details`);
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessWorldConsistency(
    content: string,
    notes: string[],
    suggestions: string[]
  ): number {
    // Without external context, we can only do basic checks
    let score = 85;

    // Check for consistent tense
    const pastTense = content.match(/\b(was|were|had|walked|said|went|came|looked|felt)\b/gi) || [];
    const presentTense = content.match(/\b(is|are|has|walk|say|go|come|look|feel)\b/gi) || [];

    const total = pastTense.length + presentTense.length;
    if (total > 10) {
      const pastRatio = pastTense.length / total;
      if (pastRatio > 0.8 || pastRatio < 0.2) {
        score += 10;
        notes.push('Consistent tense usage');
      } else {
        score -= 10;
        notes.push('Possible tense inconsistency');
        suggestions.push('Check for unintentional tense shifts');
      }
    }

    // Check for internal contradictions (basic)
    const negationContradiction = /\b(never|always|no one|everyone)\b/gi;
    const negations = content.match(negationContradiction) || [];
    if (negations.length > 3) {
      notes.push('Multiple absolute statements - verify consistency');
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessThemeIntegration(
    content: string,
    notes: string[],
    suggestions: string[]
  ): number {
    // Without knowing the theme, we check for thematic density markers
    let score = 75;

    // Check for abstract concept words that often carry theme
    const thematicWords = content.match(
      /\b(justice|freedom|love|power|truth|honor|betrayal|redemption|sacrifice|fate|destiny|choice|consequence|legacy|identity|growth|change|loss|hope|fear|courage|wisdom)\b/gi
    ) || [];

    const words = content.split(/\s+/).length;
    const thematicDensity = thematicWords.length / words;

    if (thematicDensity > 0.01) {
      score += 15;
      notes.push('Good thematic vocabulary presence');
    } else if (thematicDensity > 0.005) {
      score += 5;
      notes.push('Some thematic elements present');
    } else {
      notes.push('Limited thematic vocabulary');
      suggestions.push('Consider weaving thematic concepts more explicitly');
    }

    return Math.max(0, Math.min(100, score));
  }

  private assessTechnicalAccuracy(
    content: string,
    notes: string[],
    suggestions: string[]
  ): number {
    let score = 90;

    // Check for common grammatical issues
    const doubleSpaces = content.match(/  +/g) || [];
    if (doubleSpaces.length > 3) {
      score -= 5;
      notes.push('Multiple double spaces found');
      suggestions.push('Clean up extra whitespace');
    }

    // Check for proper quote handling
    const unmatchedQuotes = (content.match(/"/g) || []).length % 2 !== 0;
    if (unmatchedQuotes) {
      score -= 10;
      notes.push('Unmatched quotation marks');
      suggestions.push('Check quotation mark pairing');
    }

    // Check for sentence fragments (very basic)
    const sentences = content.split(/[.!?]+/);
    const shortSentences = sentences.filter(s => s.trim().split(/\s+/).length < 3 && s.trim().length > 0);
    if (shortSentences.length > sentences.length * 0.3) {
      notes.push('High proportion of very short sentences');
      // Not necessarily bad - stylistic choice
    }

    return Math.max(0, Math.min(100, score));
  }

  // ============================================================================
  // Historical Comparison
  // ============================================================================

  private compareToHistoricalAverage(
    dimensions: DimensionAssessment[]
  ): QualityAssessment['comparedToAverage'] {
    const result: QualityAssessment['comparedToAverage'] = [];

    // Get historical averages from benchmark history
    const historicalByDimension = new Map<QualityDimension, number[]>();

    for (const benchmark of this.benchmarkHistory) {
      // Map benchmark metrics to dimensions
      const mapping: [QualityDimension, number][] = [
        [QualityDimension.PROSE_QUALITY, benchmark.metrics.overall],
        [QualityDimension.CHARACTER_VOICE, benchmark.metrics.voiceDistinction],
        [QualityDimension.EMOTIONAL_RESONANCE, benchmark.metrics.emotionalResonance],
        [QualityDimension.PACING_CONTROL, benchmark.metrics.pacing],
      ];

      for (const [dim, score] of mapping) {
        if (!historicalByDimension.has(dim)) {
          historicalByDimension.set(dim, []);
        }
        historicalByDimension.get(dim)!.push(score);
      }
    }

    for (const dim of dimensions) {
      const historical = historicalByDimension.get(dim.dimension) || [];
      const avg = historical.length > 0
        ? historical.reduce((a, b) => a + b, 0) / historical.length
        : 75;

      // Calculate percentile
      const sorted = [...historical, dim.score].sort((a, b) => a - b);
      const percentile = sorted.length > 1
        ? (sorted.indexOf(dim.score) / (sorted.length - 1)) * 100
        : 50;

      result.push({
        dimension: dim.dimension,
        score: dim.score,
        averageScore: avg,
        percentile,
      });
    }

    return result;
  }

  // ============================================================================
  // Model Performance Tracking
  // ============================================================================

  private updateModelPerformance(modelId: string, qualityScore: number, failed: boolean): void {
    const existing = this.modelPerformance.get(modelId);

    if (existing) {
      const newTotal = existing.totalGenerations + 1;
      const newAvgQuality = (
        (existing.averageQuality * existing.totalGenerations) + qualityScore
      ) / newTotal;
      const newFailureRate = (
        (existing.failureRate * existing.totalGenerations) + (failed ? 1 : 0)
      ) / newTotal;

      this.modelPerformance.set(modelId, {
        totalGenerations: newTotal,
        averageQuality: newAvgQuality,
        failureRate: newFailureRate,
        lastUpdated: new Date(),
      });
    } else {
      this.modelPerformance.set(modelId, {
        totalGenerations: 1,
        averageQuality: qualityScore,
        failureRate: failed ? 1 : 0,
        lastUpdated: new Date(),
      });
    }
  }

  /**
   * Get performance metrics for a model
   */
  getModelPerformanceMetrics(modelId: string): {
    totalGenerations: number;
    averageQuality: number;
    failureRate: number;
    lastUpdated: Date;
  } | null {
    return this.modelPerformance.get(modelId) || null;
  }

  /**
   * Get ranking of models by quality
   */
  getModelRankings(): {
    modelId: string;
    averageQuality: number;
    totalGenerations: number;
    rank: number;
  }[] {
    return Array.from(this.modelPerformance.entries())
      .sort((a, b) => b[1].averageQuality - a[1].averageQuality)
      .map(([modelId, data], index) => ({
        modelId,
        averageQuality: data.averageQuality,
        totalGenerations: data.totalGenerations,
        rank: index + 1,
      }));
  }

  // ============================================================================
  // Standard API Methods
  // ============================================================================

  /**
   * Set custom quality thresholds
   */
  setThreshold(dimension: QualityDimension, threshold: QualityThreshold): void {
    this.thresholds.set(dimension, threshold);
  }

  /**
   * Get assessment by ID
   */
  getAssessment(assessmentId: string): QualityAssessment | undefined {
    return this.assessments.get(assessmentId);
  }

  /**
   * Get all assessments for content
   */
  getAssessmentsForContent(contentId: string): QualityAssessment[] {
    return Array.from(this.assessments.values())
      .filter(a => a.contentId === contentId);
  }

  /**
   * Record a quality benchmark
   */
  recordBenchmark(benchmark: QualityBenchmark): void {
    this.benchmarkHistory.push(benchmark);

    if (this.benchmarkHistory.length > 1000) {
      this.benchmarkHistory = this.benchmarkHistory.slice(-1000);
    }
  }

  /**
   * Get fallback history
   */
  getFallbackLog(): typeof this.fallbackLog {
    return [...this.fallbackLog];
  }

  /**
   * Get configuration statistics
   */
  getStats(): {
    assessmentCount: number;
    benchmarkCount: number;
    modelsTracked: number;
    fallbackCount: number;
    averageOverallQuality: number;
    thresholdCount: number;
  } {
    const assessments = Array.from(this.assessments.values());
    const avgQuality = assessments.length > 0
      ? assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length
      : 0;

    return {
      assessmentCount: this.assessments.size,
      benchmarkCount: this.benchmarkHistory.length,
      modelsTracked: this.modelPerformance.size,
      fallbackCount: this.fallbackLog.length,
      averageOverallQuality: avgQuality,
      thresholdCount: this.thresholds.size,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.assessments.clear();
    this.benchmarkHistory = [];
    this.fallbackLog = [];
    this.modelPerformance.clear();
    this.initializeThresholds();
  }

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      assessments: Array.from(this.assessments.entries()),
      benchmarkHistory: this.benchmarkHistory,
      fallbackLog: this.fallbackLog,
      modelPerformance: Array.from(this.modelPerformance.entries()),
      thresholds: Array.from(this.thresholds.entries()),
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.assessments) {
      this.assessments = new Map(data.assessments);
    }
    if (data.benchmarkHistory) {
      this.benchmarkHistory = data.benchmarkHistory;
    }
    if (data.fallbackLog) {
      this.fallbackLog = data.fallbackLog;
    }
    if (data.modelPerformance) {
      this.modelPerformance = new Map(data.modelPerformance);
    }
    if (data.thresholds) {
      this.thresholds = new Map(data.thresholds);
    }
  }
}

// ============================================================================
// Export
// ============================================================================

export default QualityBenchmarkEngine;
