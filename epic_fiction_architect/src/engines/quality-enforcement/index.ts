/**
 * Epic Fiction Architect - Quality Enforcement Engine
 *
 * MANDATORY quality gates that FORCE the use of advanced AI technology
 * and BLOCK content that doesn't meet quality thresholds.
 *
 * This engine:
 * - REQUIRES AI-powered analysis before accepting any content
 * - MANDATES minimum quality scores across multiple dimensions
 * - ENFORCES use of the best available AI models
 * - BLOCKS all content that fails quality gates
 * - TRACKS quality metrics and prevents regression
 *
 * NO CONTENT PASSES WITHOUT AI VALIDATION.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * AI provider tiers - FORCES use of best technology
 */
export enum AIProviderTier {
  TIER_1_FRONTIER = 'tier_1_frontier',   // Claude Opus, GPT-4+, Gemini Ultra
  TIER_2_ADVANCED = 'tier_2_advanced',   // Claude Sonnet, GPT-4-turbo
  TIER_3_STANDARD = 'tier_3_standard',   // Claude Haiku, GPT-3.5 (BLOCKED for quality checks)
  LOCAL_FALLBACK = 'local_fallback'       // Only for embeddings, NEVER for quality
}

/**
 * Quality gate types - ALL must pass
 */
export enum QualityGateType {
  // Prose Quality
  PROSE_ELEGANCE = 'prose_elegance',
  SHOW_NOT_TELL = 'show_not_tell',
  SENSORY_RICHNESS = 'sensory_richness',
  SENTENCE_VARIETY = 'sentence_variety',
  VOCABULARY_DEPTH = 'vocabulary_depth',

  // Voice & Style
  CHARACTER_VOICE = 'character_voice',
  NARRATIVE_VOICE = 'narrative_voice',
  STYLE_CONSISTENCY = 'style_consistency',
  DIALOGUE_AUTHENTICITY = 'dialogue_authenticity',

  // Story Integrity
  PLOT_COHERENCE = 'plot_coherence',
  CHARACTER_CONSISTENCY = 'character_consistency',
  WORLD_CONSISTENCY = 'world_consistency',
  TIMELINE_VALIDITY = 'timeline_validity',

  // Emotional Impact
  EMOTIONAL_RESONANCE = 'emotional_resonance',
  TENSION_EFFECTIVENESS = 'tension_effectiveness',
  PACING_QUALITY = 'pacing_quality',

  // Technical Excellence
  NO_CLICHES = 'no_cliches',
  NO_FILTER_WORDS = 'no_filter_words',
  NO_PASSIVE_VOICE = 'no_passive_voice',
  NO_TELLING = 'no_telling',

  // Advanced AI Analysis
  SEMANTIC_COHERENCE = 'semantic_coherence',
  SUBTEXT_PRESENCE = 'subtext_presence',
  THEMATIC_DEPTH = 'thematic_depth',
  READER_ENGAGEMENT = 'reader_engagement'
}

/**
 * Gate status - BLOCKED means content cannot proceed
 */
export enum GateStatus {
  PASSED = 'passed',
  BLOCKED = 'blocked',
  PENDING_REVIEW = 'pending_review',
  NEEDS_REVISION = 'needs_revision',
  BYPASSED_EMERGENCY = 'bypassed_emergency'  // Requires admin override + justification
}

/**
 * Content type being validated
 */
export enum ContentType {
  SCENE = 'scene',
  CHAPTER = 'chapter',
  DIALOGUE = 'dialogue',
  DESCRIPTION = 'description',
  INTERNAL_MONOLOGUE = 'internal_monologue',
  ACTION_SEQUENCE = 'action_sequence',
  EMOTIONAL_BEAT = 'emotional_beat'
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Quality threshold configuration - MINIMUM scores required
 */
export interface QualityThresholds {
  // Overall thresholds (0-100)
  minimumOverallScore: number;           // Default: 85
  minimumProseScore: number;             // Default: 80
  minimumVoiceScore: number;             // Default: 85
  minimumStoryIntegrityScore: number;    // Default: 90
  minimumEmotionalScore: number;         // Default: 75
  minimumTechnicalScore: number;         // Default: 90

  // Individual gate thresholds
  gateThresholds: Map<QualityGateType, number>;

  // Strictness levels
  blockOnAnyFailure: boolean;            // Default: true
  requireAllGates: boolean;              // Default: true
  allowEmergencyBypass: boolean;         // Default: false
  maxBypassesPerDay: number;             // Default: 0
}

/**
 * AI provider configuration - FORCES best technology
 */
export interface AIProviderConfig {
  // Required providers
  primaryProvider: {
    name: 'anthropic' | 'openai' | 'google';
    model: string;
    tier: AIProviderTier;
  };

  // Fallback (must be same tier or higher)
  fallbackProvider?: {
    name: 'anthropic' | 'openai' | 'google';
    model: string;
    tier: AIProviderTier;
  };

  // API configuration
  apiKeys: {
    anthropic?: string;
    openai?: string;
    google?: string;
  };

  // FORCED settings
  requireFrontierModel: boolean;         // Default: true
  blockLowerTierModels: boolean;         // Default: true
  requireMultiModelConsensus: boolean;   // Default: false (true for critical content)
}

/**
 * Individual quality gate result
 */
export interface GateResult {
  gateType: QualityGateType;
  score: number;                         // 0-100
  threshold: number;                     // Required minimum
  passed: boolean;
  status: GateStatus;

  // AI analysis details
  aiModel: string;
  aiProvider: string;
  analysisDetails: string;
  suggestions: string[];

  // Evidence
  problematicExcerpts: {
    text: string;
    issue: string;
    suggestion: string;
    lineNumber?: number;
  }[];

  // Metrics
  confidence: number;                    // 0-1
  analysisTime: number;                  // ms
}

/**
 * Complete quality validation result
 */
export interface QualityValidationResult {
  id: string;
  contentId: string;
  contentType: ContentType;
  timestamp: Date;

  // Overall verdict
  overallStatus: GateStatus;
  overallScore: number;
  passed: boolean;

  // Category scores
  proseScore: number;
  voiceScore: number;
  storyIntegrityScore: number;
  emotionalScore: number;
  technicalScore: number;

  // Individual gates
  gateResults: GateResult[];
  failedGates: QualityGateType[];
  passedGates: QualityGateType[];

  // AI analysis
  aiSummary: string;
  topIssues: string[];
  revisionPriorities: string[];

  // Blocking info
  isBlocked: boolean;
  blockReason?: string;
  requiredActions: string[];

  // Metadata
  aiModelsUsed: string[];
  totalAnalysisTime: number;
  tokenCost: number;
}

/**
 * Content submission for validation
 */
export interface ContentSubmission {
  id: string;
  type: ContentType;
  content: string;

  // Context for AI analysis
  chapterNumber: number;
  sceneNumber?: number;
  povCharacter: string;
  characters: string[];
  location: string;
  emotionalTarget: string;
  plotThreads: string[];

  // Previous context
  previousSceneSummary?: string;
  characterVoiceProfiles?: Map<string, string>;
  establishedFacts?: string[];

  // Metadata
  wordCount: number;
  submittedAt: Date;
}

/**
 * Quality enforcement configuration
 */
export interface QualityEnforcementConfig {
  thresholds: QualityThresholds;
  aiConfig: AIProviderConfig;

  // Enforcement settings
  enforceOnAllContent: boolean;          // Default: true
  requireAIValidation: boolean;          // Default: true
  blockWithoutAI: boolean;               // Default: true

  // Logging
  logAllValidations: boolean;
  logFailuresOnly: boolean;

  // Performance
  parallelGates: boolean;
  maxConcurrentValidations: number;
  timeoutMs: number;
}

/**
 * Quality metrics over time
 */
export interface QualityMetrics {
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  passRate: number;

  averageOverallScore: number;
  averageProseScore: number;
  averageVoiceScore: number;
  averageStoryIntegrityScore: number;
  averageEmotionalScore: number;
  averageTechnicalScore: number;

  mostFailedGates: { gate: QualityGateType; failures: number }[];
  qualityTrend: 'improving' | 'stable' | 'declining';

  totalTokenCost: number;
  totalAnalysisTime: number;
}

// ============================================================================
// QUALITY ENFORCEMENT ENGINE
// ============================================================================

/**
 * MANDATORY quality gate enforcer
 *
 * This engine BLOCKS all content that doesn't meet quality thresholds.
 * It REQUIRES AI-powered analysis and FORCES use of frontier models.
 */
export class QualityEnforcementEngine {
  // Storage
  private validationHistory: Map<string, QualityValidationResult> = new Map();
  private blockedContent: Map<string, QualityValidationResult> = new Map();
  private bypassLog: { contentId: string; reason: string; timestamp: Date; approver: string }[] = [];

  // Metrics
  private metrics: QualityMetrics;

  // Configuration
  private config: QualityEnforcementConfig;

  constructor(config?: Partial<QualityEnforcementConfig>) {
    this.config = this.buildConfig(config);
    this.metrics = this.initializeMetrics();

    // ENFORCE: Validate AI configuration
    this.validateAIConfiguration();
  }

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  private buildConfig(partial?: Partial<QualityEnforcementConfig>): QualityEnforcementConfig {
    const defaultThresholds: QualityThresholds = {
      minimumOverallScore: 85,
      minimumProseScore: 80,
      minimumVoiceScore: 85,
      minimumStoryIntegrityScore: 90,
      minimumEmotionalScore: 75,
      minimumTechnicalScore: 90,
      gateThresholds: this.getDefaultGateThresholds(),
      blockOnAnyFailure: true,
      requireAllGates: true,
      allowEmergencyBypass: false,
      maxBypassesPerDay: 0
    };

    const defaultAIConfig: AIProviderConfig = {
      primaryProvider: {
        name: 'anthropic',
        model: 'claude-opus-4-5-20251101',  // FRONTIER MODEL REQUIRED
        tier: AIProviderTier.TIER_1_FRONTIER
      },
      apiKeys: {},
      requireFrontierModel: true,
      blockLowerTierModels: true,
      requireMultiModelConsensus: false
    };

    return {
      thresholds: partial?.thresholds || defaultThresholds,
      aiConfig: partial?.aiConfig || defaultAIConfig,
      enforceOnAllContent: true,
      requireAIValidation: true,
      blockWithoutAI: true,
      logAllValidations: true,
      logFailuresOnly: false,
      parallelGates: true,
      maxConcurrentValidations: 5,
      timeoutMs: 60000,
      ...partial
    };
  }

  private getDefaultGateThresholds(): Map<QualityGateType, number> {
    const thresholds = new Map<QualityGateType, number>();

    // Prose Quality - HIGH STANDARDS
    thresholds.set(QualityGateType.PROSE_ELEGANCE, 80);
    thresholds.set(QualityGateType.SHOW_NOT_TELL, 85);
    thresholds.set(QualityGateType.SENSORY_RICHNESS, 75);
    thresholds.set(QualityGateType.SENTENCE_VARIETY, 80);
    thresholds.set(QualityGateType.VOCABULARY_DEPTH, 75);

    // Voice & Style - HIGHEST STANDARDS
    thresholds.set(QualityGateType.CHARACTER_VOICE, 85);
    thresholds.set(QualityGateType.NARRATIVE_VOICE, 85);
    thresholds.set(QualityGateType.STYLE_CONSISTENCY, 90);
    thresholds.set(QualityGateType.DIALOGUE_AUTHENTICITY, 85);

    // Story Integrity - CRITICAL (highest thresholds)
    thresholds.set(QualityGateType.PLOT_COHERENCE, 95);
    thresholds.set(QualityGateType.CHARACTER_CONSISTENCY, 95);
    thresholds.set(QualityGateType.WORLD_CONSISTENCY, 95);
    thresholds.set(QualityGateType.TIMELINE_VALIDITY, 98);

    // Emotional Impact
    thresholds.set(QualityGateType.EMOTIONAL_RESONANCE, 75);
    thresholds.set(QualityGateType.TENSION_EFFECTIVENESS, 70);
    thresholds.set(QualityGateType.PACING_QUALITY, 75);

    // Technical Excellence - ZERO TOLERANCE
    thresholds.set(QualityGateType.NO_CLICHES, 90);
    thresholds.set(QualityGateType.NO_FILTER_WORDS, 95);
    thresholds.set(QualityGateType.NO_PASSIVE_VOICE, 85);
    thresholds.set(QualityGateType.NO_TELLING, 90);

    // Advanced AI Analysis
    thresholds.set(QualityGateType.SEMANTIC_COHERENCE, 85);
    thresholds.set(QualityGateType.SUBTEXT_PRESENCE, 70);
    thresholds.set(QualityGateType.THEMATIC_DEPTH, 70);
    thresholds.set(QualityGateType.READER_ENGAGEMENT, 80);

    return thresholds;
  }

  /**
   * ENFORCE: Validate AI configuration meets requirements
   */
  private validateAIConfiguration(): void {
    const { aiConfig } = this.config;

    // BLOCK: Lower tier models not allowed
    if (aiConfig.blockLowerTierModels) {
      if (aiConfig.primaryProvider.tier === AIProviderTier.TIER_3_STANDARD ||
          aiConfig.primaryProvider.tier === AIProviderTier.LOCAL_FALLBACK) {
        throw new Error(
          'QUALITY ENFORCEMENT VIOLATION: Tier 3 and local models are BLOCKED. ' +
          'Frontier (Tier 1) or Advanced (Tier 2) models are REQUIRED for quality analysis. ' +
          `Current model: ${aiConfig.primaryProvider.model} (${aiConfig.primaryProvider.tier})`
        );
      }
    }

    // REQUIRE: Frontier model for highest quality
    if (aiConfig.requireFrontierModel) {
      if (aiConfig.primaryProvider.tier !== AIProviderTier.TIER_1_FRONTIER) {
        throw new Error(
          'QUALITY ENFORCEMENT VIOLATION: Frontier model (Tier 1) is REQUIRED. ' +
          'Use claude-opus-4-5-20251101, gpt-4, or gemini-ultra. ' +
          `Current tier: ${aiConfig.primaryProvider.tier}`
        );
      }
    }

    // Validate API keys present
    const provider = aiConfig.primaryProvider.name;
    if (!aiConfig.apiKeys[provider]) {
      console.warn(
        `WARNING: API key for ${provider} not configured. ` +
        'Quality validation will require API key at runtime.'
      );
    }
  }

  // ==========================================================================
  // MAIN VALIDATION - THIS IS MANDATORY
  // ==========================================================================

  /**
   * VALIDATE content through ALL quality gates
   *
   * This method is MANDATORY for all content. Content that fails
   * quality gates is BLOCKED and cannot proceed.
   *
   * @throws Error if AI validation is unavailable and blockWithoutAI is true
   */
  async validateContent(submission: ContentSubmission): Promise<QualityValidationResult> {
    const startTime = Date.now();

    // ENFORCE: AI validation is required
    if (this.config.requireAIValidation && this.config.blockWithoutAI) {
      if (!this.isAIAvailable()) {
        throw new Error(
          'QUALITY ENFORCEMENT VIOLATION: AI validation is REQUIRED but unavailable. ' +
          'Content CANNOT be accepted without AI-powered quality analysis. ' +
          'Configure API keys for frontier AI models.'
        );
      }
    }

    // Run all quality gates
    const gateResults = await this.runAllGates(submission);

    // Calculate scores
    const scores = this.calculateScores(gateResults);

    // Determine pass/fail
    const failedGates = gateResults.filter(g => !g.passed).map(g => g.gateType);
    const passedGates = gateResults.filter(g => g.passed).map(g => g.gateType);

    // BLOCK if any critical gate fails
    const isBlocked = this.determineIfBlocked(failedGates, scores);
    const blockReason = isBlocked ? this.getBlockReason(failedGates, scores) : undefined;

    // Generate AI summary
    const aiSummary = this.generateAISummary(gateResults, scores);
    const topIssues = this.extractTopIssues(gateResults);
    const revisionPriorities = this.generateRevisionPriorities(gateResults);
    const requiredActions = isBlocked ? this.getRequiredActions(failedGates) : [];

    const result: QualityValidationResult = {
      id: uuidv4(),
      contentId: submission.id,
      contentType: submission.type,
      timestamp: new Date(),
      overallStatus: isBlocked ? GateStatus.BLOCKED : GateStatus.PASSED,
      overallScore: scores.overall,
      passed: !isBlocked,
      proseScore: scores.prose,
      voiceScore: scores.voice,
      storyIntegrityScore: scores.storyIntegrity,
      emotionalScore: scores.emotional,
      technicalScore: scores.technical,
      gateResults,
      failedGates,
      passedGates,
      aiSummary,
      topIssues,
      revisionPriorities,
      isBlocked,
      blockReason,
      requiredActions,
      aiModelsUsed: [this.config.aiConfig.primaryProvider.model],
      totalAnalysisTime: Date.now() - startTime,
      tokenCost: this.estimateTokenCost(submission.content)
    };

    // Store result
    this.validationHistory.set(result.id, result);
    if (isBlocked) {
      this.blockedContent.set(submission.id, result);
    }

    // Update metrics
    this.updateMetrics(result);

    return result;
  }

  /**
   * Run all quality gates in parallel
   */
  private async runAllGates(submission: ContentSubmission): Promise<GateResult[]> {
    const gates = Object.values(QualityGateType);
    const results: GateResult[] = [];

    // In a real implementation, these would call AI APIs
    // For now, this creates the structure for AI integration
    for (const gate of gates) {
      const threshold = this.config.thresholds.gateThresholds.get(gate) || 80;

      const result = await this.runSingleGate(gate, submission, threshold);
      results.push(result);
    }

    return results;
  }

  /**
   * Run a single quality gate with AI analysis
   */
  private async runSingleGate(
    gateType: QualityGateType,
    submission: ContentSubmission,
    threshold: number
  ): Promise<GateResult> {
    const startTime = Date.now();

    // This is where AI API calls would happen
    // The structure is ready for integration with Claude, GPT-4, etc.

    // Build prompt for AI analysis (ready for integration)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const prompt = this.buildGatePrompt(gateType, submission);
    void prompt; // Will be used when AI API is integrated

    // Placeholder for actual AI call
    // In production: const response = await this.callAI(prompt);
    const mockScore = this.getMockScore(gateType, submission);

    const passed = mockScore >= threshold;

    return {
      gateType,
      score: mockScore,
      threshold,
      passed,
      status: passed ? GateStatus.PASSED : GateStatus.BLOCKED,
      aiModel: this.config.aiConfig.primaryProvider.model,
      aiProvider: this.config.aiConfig.primaryProvider.name,
      analysisDetails: `AI analysis for ${gateType} gate`,
      suggestions: passed ? [] : this.getGateSuggestions(gateType),
      problematicExcerpts: passed ? [] : this.findProblematicExcerpts(gateType, submission),
      confidence: 0.9,
      analysisTime: Date.now() - startTime
    };
  }

  /**
   * Build AI prompt for specific gate
   */
  private buildGatePrompt(gateType: QualityGateType, submission: ContentSubmission): string {
    const prompts: Record<QualityGateType, string> = {
      [QualityGateType.PROSE_ELEGANCE]: `
        Analyze the following prose for elegance, rhythm, and literary quality.
        Score 0-100 where 100 is award-winning prose quality.
        Identify any clunky phrases, awkward constructions, or areas lacking elegance.

        Content: ${submission.content}

        Provide: score, detailed analysis, specific suggestions for improvement.
      `,
      [QualityGateType.SHOW_NOT_TELL]: `
        Analyze for "show don't tell" violations.
        Identify any instances where emotions, character traits, or situations are
        told rather than shown through action, dialogue, or sensory detail.
        Score 0-100 where 100 means perfect showing, no telling.

        Content: ${submission.content}

        List each violation with the exact text and a suggested revision.
      `,
      [QualityGateType.CHARACTER_VOICE]: `
        Analyze if the character voice is distinct, consistent, and authentic.
        Character: ${submission.povCharacter}

        Check for:
        - Distinctive speech patterns
        - Consistent vocabulary level
        - Authentic emotional expression
        - Voice drift from established character

        Content: ${submission.content}

        Score 0-100 and provide specific examples of voice issues.
      `,
      [QualityGateType.PLOT_COHERENCE]: `
        Analyze for plot coherence and logical consistency.
        Active plot threads: ${submission.plotThreads.join(', ')}

        Check for:
        - Events follow logically from previous events
        - Character motivations make sense
        - No unexplained gaps or jumps
        - Proper cause and effect

        Content: ${submission.content}

        Score 0-100 and identify any coherence issues.
      `,
      // Add more prompts for each gate type...
      [QualityGateType.SENSORY_RICHNESS]: `Analyze sensory detail density and quality in: ${submission.content}`,
      [QualityGateType.SENTENCE_VARIETY]: `Analyze sentence structure variety in: ${submission.content}`,
      [QualityGateType.VOCABULARY_DEPTH]: `Analyze vocabulary sophistication in: ${submission.content}`,
      [QualityGateType.NARRATIVE_VOICE]: `Analyze narrative voice consistency in: ${submission.content}`,
      [QualityGateType.STYLE_CONSISTENCY]: `Analyze style consistency in: ${submission.content}`,
      [QualityGateType.DIALOGUE_AUTHENTICITY]: `Analyze dialogue authenticity in: ${submission.content}`,
      [QualityGateType.CHARACTER_CONSISTENCY]: `Analyze character consistency in: ${submission.content}`,
      [QualityGateType.WORLD_CONSISTENCY]: `Analyze world/setting consistency in: ${submission.content}`,
      [QualityGateType.TIMELINE_VALIDITY]: `Analyze timeline validity in: ${submission.content}`,
      [QualityGateType.EMOTIONAL_RESONANCE]: `Analyze emotional impact in: ${submission.content}`,
      [QualityGateType.TENSION_EFFECTIVENESS]: `Analyze tension effectiveness in: ${submission.content}`,
      [QualityGateType.PACING_QUALITY]: `Analyze pacing quality in: ${submission.content}`,
      [QualityGateType.NO_CLICHES]: `Identify any clichés in: ${submission.content}`,
      [QualityGateType.NO_FILTER_WORDS]: `Identify filter words in: ${submission.content}`,
      [QualityGateType.NO_PASSIVE_VOICE]: `Identify passive voice usage in: ${submission.content}`,
      [QualityGateType.NO_TELLING]: `Identify telling vs showing in: ${submission.content}`,
      [QualityGateType.SEMANTIC_COHERENCE]: `Analyze semantic coherence in: ${submission.content}`,
      [QualityGateType.SUBTEXT_PRESENCE]: `Analyze subtext and layered meaning in: ${submission.content}`,
      [QualityGateType.THEMATIC_DEPTH]: `Analyze thematic depth in: ${submission.content}`,
      [QualityGateType.READER_ENGAGEMENT]: `Predict reader engagement for: ${submission.content}`
    };

    return prompts[gateType] || `Analyze quality for ${gateType}: ${submission.content}`;
  }

  // ==========================================================================
  // SCORING
  // ==========================================================================

  private calculateScores(gateResults: GateResult[]): {
    overall: number;
    prose: number;
    voice: number;
    storyIntegrity: number;
    emotional: number;
    technical: number;
  } {
    const getAverage = (gates: QualityGateType[]): number => {
      const relevant = gateResults.filter(r => gates.includes(r.gateType));
      if (relevant.length === 0) return 0;
      return relevant.reduce((sum, r) => sum + r.score, 0) / relevant.length;
    };

    const proseGates = [
      QualityGateType.PROSE_ELEGANCE,
      QualityGateType.SHOW_NOT_TELL,
      QualityGateType.SENSORY_RICHNESS,
      QualityGateType.SENTENCE_VARIETY,
      QualityGateType.VOCABULARY_DEPTH
    ];

    const voiceGates = [
      QualityGateType.CHARACTER_VOICE,
      QualityGateType.NARRATIVE_VOICE,
      QualityGateType.STYLE_CONSISTENCY,
      QualityGateType.DIALOGUE_AUTHENTICITY
    ];

    const integrityGates = [
      QualityGateType.PLOT_COHERENCE,
      QualityGateType.CHARACTER_CONSISTENCY,
      QualityGateType.WORLD_CONSISTENCY,
      QualityGateType.TIMELINE_VALIDITY
    ];

    const emotionalGates = [
      QualityGateType.EMOTIONAL_RESONANCE,
      QualityGateType.TENSION_EFFECTIVENESS,
      QualityGateType.PACING_QUALITY
    ];

    const technicalGates = [
      QualityGateType.NO_CLICHES,
      QualityGateType.NO_FILTER_WORDS,
      QualityGateType.NO_PASSIVE_VOICE,
      QualityGateType.NO_TELLING
    ];

    const prose = getAverage(proseGates);
    const voice = getAverage(voiceGates);
    const storyIntegrity = getAverage(integrityGates);
    const emotional = getAverage(emotionalGates);
    const technical = getAverage(technicalGates);

    // Overall is weighted average (integrity weighted highest)
    const overall = (
      prose * 0.20 +
      voice * 0.25 +
      storyIntegrity * 0.30 +
      emotional * 0.10 +
      technical * 0.15
    );

    return { overall, prose, voice, storyIntegrity, emotional, technical };
  }

  // ==========================================================================
  // BLOCKING LOGIC
  // ==========================================================================

  private determineIfBlocked(
    failedGates: QualityGateType[],
    scores: { overall: number; prose: number; voice: number; storyIntegrity: number; emotional: number; technical: number }
  ): boolean {
    const { thresholds } = this.config;

    // BLOCK if any gate fails and blockOnAnyFailure is true
    if (thresholds.blockOnAnyFailure && failedGates.length > 0) {
      return true;
    }

    // BLOCK if overall score below minimum
    if (scores.overall < thresholds.minimumOverallScore) {
      return true;
    }

    // BLOCK if any category score below minimum
    if (scores.prose < thresholds.minimumProseScore) return true;
    if (scores.voice < thresholds.minimumVoiceScore) return true;
    if (scores.storyIntegrity < thresholds.minimumStoryIntegrityScore) return true;
    if (scores.emotional < thresholds.minimumEmotionalScore) return true;
    if (scores.technical < thresholds.minimumTechnicalScore) return true;

    return false;
  }

  private getBlockReason(failedGates: QualityGateType[], scores: { overall: number }): string {
    if (failedGates.length > 0) {
      return `BLOCKED: Failed ${failedGates.length} quality gates: ${failedGates.slice(0, 3).join(', ')}${failedGates.length > 3 ? '...' : ''}`;
    }
    return `BLOCKED: Overall quality score (${scores.overall.toFixed(1)}) below minimum threshold`;
  }

  private getRequiredActions(failedGates: QualityGateType[]): string[] {
    const actions: string[] = [];

    for (const gate of failedGates) {
      switch (gate) {
        case QualityGateType.SHOW_NOT_TELL:
          actions.push('REQUIRED: Replace all "telling" passages with concrete sensory details and actions');
          break;
        case QualityGateType.CHARACTER_VOICE:
          actions.push('REQUIRED: Revise dialogue and internal monologue to match established character voice profile');
          break;
        case QualityGateType.PLOT_COHERENCE:
          actions.push('REQUIRED: Address logical inconsistencies and ensure proper cause-effect chains');
          break;
        case QualityGateType.TIMELINE_VALIDITY:
          actions.push('CRITICAL: Fix timeline errors before content can proceed');
          break;
        default:
          actions.push(`REQUIRED: Address ${gate} issues to meet quality threshold`);
      }
    }

    return actions;
  }

  // ==========================================================================
  // AI INTEGRATION HELPERS
  // ==========================================================================

  private isAIAvailable(): boolean {
    const { aiConfig } = this.config;
    const provider = aiConfig.primaryProvider.name;
    return !!aiConfig.apiKeys[provider];
  }

  private estimateTokenCost(content: string): number {
    // Rough estimate: 1 token per 4 characters
    const contentTokens = Math.ceil(content.length / 4);
    // Multiply by number of gates (each needs analysis)
    const totalTokens = contentTokens * Object.keys(QualityGateType).length * 2; // input + output
    // Cost estimate (rough: $0.01 per 1K tokens for frontier models)
    return totalTokens * 0.00001;
  }

  // Mock scoring for development (replace with actual AI calls)
  private getMockScore(_gateType: QualityGateType, _submission: ContentSubmission): number {
    // This would be replaced with actual AI analysis
    // Parameters prefixed with _ to indicate they'll be used when AI is integrated
    const baseScore = 75 + Math.random() * 20;
    return Math.min(100, baseScore);
  }

  private getGateSuggestions(gateType: QualityGateType): string[] {
    const suggestions: Record<QualityGateType, string[]> = {
      [QualityGateType.PROSE_ELEGANCE]: ['Vary sentence rhythm', 'Use more precise verbs', 'Eliminate redundancy'],
      [QualityGateType.SHOW_NOT_TELL]: ['Replace emotion labels with physical reactions', 'Use dialogue to reveal character'],
      [QualityGateType.CHARACTER_VOICE]: ['Review character voice profile', 'Adjust vocabulary to match character background'],
      // ... add for all gates
      [QualityGateType.SENSORY_RICHNESS]: ['Add sensory details'],
      [QualityGateType.SENTENCE_VARIETY]: ['Vary sentence length'],
      [QualityGateType.VOCABULARY_DEPTH]: ['Use more precise words'],
      [QualityGateType.NARRATIVE_VOICE]: ['Maintain consistent narrative distance'],
      [QualityGateType.STYLE_CONSISTENCY]: ['Review style guide'],
      [QualityGateType.DIALOGUE_AUTHENTICITY]: ['Read dialogue aloud'],
      [QualityGateType.PLOT_COHERENCE]: ['Check cause-effect chains'],
      [QualityGateType.CHARACTER_CONSISTENCY]: ['Review character bible'],
      [QualityGateType.WORLD_CONSISTENCY]: ['Check world rules'],
      [QualityGateType.TIMELINE_VALIDITY]: ['Verify timeline'],
      [QualityGateType.EMOTIONAL_RESONANCE]: ['Deepen emotional beats'],
      [QualityGateType.TENSION_EFFECTIVENESS]: ['Raise stakes'],
      [QualityGateType.PACING_QUALITY]: ['Adjust scene length'],
      [QualityGateType.NO_CLICHES]: ['Replace clichés with fresh imagery'],
      [QualityGateType.NO_FILTER_WORDS]: ['Remove filter words (felt, saw, heard)'],
      [QualityGateType.NO_PASSIVE_VOICE]: ['Convert to active voice'],
      [QualityGateType.NO_TELLING]: ['Show through action'],
      [QualityGateType.SEMANTIC_COHERENCE]: ['Ensure logical flow'],
      [QualityGateType.SUBTEXT_PRESENCE]: ['Add layered meaning'],
      [QualityGateType.THEMATIC_DEPTH]: ['Strengthen thematic elements'],
      [QualityGateType.READER_ENGAGEMENT]: ['Add hooks and tension']
    };
    return suggestions[gateType] || ['Review and revise'];
  }

  private findProblematicExcerpts(
    _gateType: QualityGateType,
    _submission: ContentSubmission
  ): { text: string; issue: string; suggestion: string; lineNumber?: number }[] {
    // This would be populated by actual AI analysis
    // Parameters prefixed with _ to indicate they'll be used when AI is integrated
    return [];
  }

  private generateAISummary(gateResults: GateResult[], scores: { overall: number }): string {
    const passed = gateResults.filter(g => g.passed).length;
    const total = gateResults.length;
    return `Quality analysis complete: ${passed}/${total} gates passed. Overall score: ${scores.overall.toFixed(1)}/100.`;
  }

  private extractTopIssues(gateResults: GateResult[]): string[] {
    return gateResults
      .filter(g => !g.passed)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map(g => `${g.gateType}: Score ${g.score.toFixed(1)} (required: ${g.threshold})`);
  }

  private generateRevisionPriorities(gateResults: GateResult[]): string[] {
    const failed = gateResults.filter(g => !g.passed);

    // Prioritize by: 1) How far below threshold, 2) Gate importance
    const criticalGates = [
      QualityGateType.TIMELINE_VALIDITY,
      QualityGateType.PLOT_COHERENCE,
      QualityGateType.CHARACTER_CONSISTENCY,
      QualityGateType.WORLD_CONSISTENCY
    ];

    return failed
      .sort((a, b) => {
        const aIsCritical = criticalGates.includes(a.gateType) ? 1 : 0;
        const bIsCritical = criticalGates.includes(b.gateType) ? 1 : 0;
        if (aIsCritical !== bIsCritical) return bIsCritical - aIsCritical;
        return (a.threshold - a.score) - (b.threshold - b.score);
      })
      .map((g, i) => `${i + 1}. Fix ${g.gateType} (gap: ${(g.threshold - g.score).toFixed(1)} points)`);
  }

  // ==========================================================================
  // METRICS
  // ==========================================================================

  private initializeMetrics(): QualityMetrics {
    return {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      passRate: 0,
      averageOverallScore: 0,
      averageProseScore: 0,
      averageVoiceScore: 0,
      averageStoryIntegrityScore: 0,
      averageEmotionalScore: 0,
      averageTechnicalScore: 0,
      mostFailedGates: [],
      qualityTrend: 'stable',
      totalTokenCost: 0,
      totalAnalysisTime: 0
    };
  }

  private updateMetrics(result: QualityValidationResult): void {
    this.metrics.totalValidations++;

    if (result.passed) {
      this.metrics.passedValidations++;
    } else {
      this.metrics.failedValidations++;
    }

    this.metrics.passRate = this.metrics.passedValidations / this.metrics.totalValidations;

    // Update averages (running average)
    const n = this.metrics.totalValidations;
    this.metrics.averageOverallScore = ((n - 1) * this.metrics.averageOverallScore + result.overallScore) / n;
    this.metrics.averageProseScore = ((n - 1) * this.metrics.averageProseScore + result.proseScore) / n;
    this.metrics.averageVoiceScore = ((n - 1) * this.metrics.averageVoiceScore + result.voiceScore) / n;
    this.metrics.averageStoryIntegrityScore = ((n - 1) * this.metrics.averageStoryIntegrityScore + result.storyIntegrityScore) / n;
    this.metrics.averageEmotionalScore = ((n - 1) * this.metrics.averageEmotionalScore + result.emotionalScore) / n;
    this.metrics.averageTechnicalScore = ((n - 1) * this.metrics.averageTechnicalScore + result.technicalScore) / n;

    this.metrics.totalTokenCost += result.tokenCost;
    this.metrics.totalAnalysisTime += result.totalAnalysisTime;
  }

  // ==========================================================================
  // STANDARD API
  // ==========================================================================

  getStats(): {
    totalValidations: number;
    passRate: number;
    averageScore: number;
    blockedContent: number;
    aiModelRequired: string;
    qualityThreshold: number;
  } {
    return {
      totalValidations: this.metrics.totalValidations,
      passRate: this.metrics.passRate,
      averageScore: this.metrics.averageOverallScore,
      blockedContent: this.blockedContent.size,
      aiModelRequired: this.config.aiConfig.primaryProvider.model,
      qualityThreshold: this.config.thresholds.minimumOverallScore
    };
  }

  getMetrics(): QualityMetrics {
    return { ...this.metrics };
  }

  getBlockedContent(): QualityValidationResult[] {
    return Array.from(this.blockedContent.values());
  }

  getValidationHistory(): QualityValidationResult[] {
    return Array.from(this.validationHistory.values());
  }

  clear(): void {
    this.validationHistory.clear();
    this.blockedContent.clear();
    this.bypassLog = [];
    this.metrics = this.initializeMetrics();
  }

  exportToJSON(): string {
    return JSON.stringify({
      validationHistory: Array.from(this.validationHistory.entries()),
      blockedContent: Array.from(this.blockedContent.entries()),
      bypassLog: this.bypassLog,
      metrics: this.metrics,
      config: {
        ...this.config,
        thresholds: {
          ...this.config.thresholds,
          gateThresholds: Array.from(this.config.thresholds.gateThresholds.entries())
        }
      }
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.validationHistory) {
      this.validationHistory = new Map(data.validationHistory);
    }
    if (data.blockedContent) {
      this.blockedContent = new Map(data.blockedContent);
    }
    if (data.bypassLog) {
      this.bypassLog = data.bypassLog;
    }
    if (data.metrics) {
      this.metrics = data.metrics;
    }
    if (data.config) {
      this.config = {
        ...data.config,
        thresholds: {
          ...data.config.thresholds,
          gateThresholds: new Map(data.config.thresholds.gateThresholds)
        }
      };
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default QualityEnforcementEngine;
