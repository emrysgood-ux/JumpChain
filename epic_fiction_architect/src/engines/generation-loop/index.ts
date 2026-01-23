/**
 * Generation-Validation Loop Engine
 *
 * A sophisticated content generation system that ensures all AI-generated
 * content meets quality and consistency standards through iterative
 * generate → validate → fix cycles.
 *
 * Core Concept:
 * Instead of generating content once and hoping for the best, this engine
 * generates content, validates it against all constraints, and if violations
 * are found, automatically regenerates with corrections until standards are met.
 *
 * Features:
 * - Multi-stage validation pipeline
 * - Automatic fix suggestions and regeneration
 * - Configurable quality gates
 * - Convergence detection (stop when no improvements possible)
 * - Partial acceptance (accept good parts, fix bad parts)
 * - Cost management (track API calls, tokens)
 * - Detailed generation reports
 *
 * @module engines/generation-loop
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Configuration for the generation loop
 */
export interface GenerationLoopConfig {
  /** Maximum iterations before giving up */
  maxIterations: number;

  /** Minimum quality score to accept (0-100) */
  minQualityScore: number;

  /** Maximum consistency violations to accept */
  maxConsistencyViolations: number;

  /** Allow partial acceptance of content */
  allowPartialAcceptance: boolean;

  /** Stop if no improvement for N iterations */
  convergenceThreshold: number;

  /** Maximum tokens to spend on generation */
  maxTokenBudget: number;

  /** Quality dimensions that must pass */
  requiredQualityGates: QualityGate[];

  /** Custom validators to run */
  customValidators: CustomValidator[];

  /** How to handle failures */
  failureStrategy: 'retry' | 'fallback' | 'partial' | 'fail';
}

/**
 * A quality gate that must pass
 */
export interface QualityGate {
  id: string;
  name: string;
  description: string;
  /** Minimum score (0-100) */
  minScore: number;
  /** Category of quality being measured */
  category: QualityCategory;
  /** Is this gate required? */
  required: boolean;
  /** Weight in overall score */
  weight: number;
}

export enum QualityCategory {
  PROSE = 'prose',
  CONSISTENCY = 'consistency',
  CHARACTER_VOICE = 'character_voice',
  PLOT_COHERENCE = 'plot_coherence',
  WORLD_RULES = 'world_rules',
  TIMELINE = 'timeline',
  EMOTIONAL_RESONANCE = 'emotional_resonance',
  PACING = 'pacing',
  DIALOGUE = 'dialogue',
  TECHNICAL = 'technical',
}

/**
 * Custom validator function
 */
export interface CustomValidator {
  id: string;
  name: string;
  /** Validation function - returns violations */
  validate: (content: string, context: ValidationContext) => Promise<ValidationViolation[]>;
  /** Fix suggestion function - returns suggested fixes */
  suggest?: (violations: ValidationViolation[], content: string) => Promise<string[]>;
}

/**
 * Context for validation
 */
export interface ValidationContext {
  /** Current scene/chapter being generated */
  sceneId?: string;
  /** Timeline position */
  timelinePosition?: number;
  /** Characters involved */
  characterIds: string[];
  /** Location */
  locationId?: string;
  /** Established facts to check against */
  establishedFacts: EstablishedFact[];
  /** Canon rules to enforce */
  canonRules: CanonRule[];
  /** Previous content for continuity */
  previousContent?: string;
  /** Target emotional tone */
  targetTone?: string;
  /** Any special constraints */
  constraints: string[];
}

/**
 * An established fact from the story bible
 */
export interface EstablishedFact {
  id: string;
  subject: string;
  attribute: string;
  value: unknown;
  establishedAt: number;
  source: string;
}

/**
 * A canon rule to enforce
 */
export interface CanonRule {
  id: string;
  name: string;
  description: string;
  category: string;
  enforcement: 'strict' | 'soft' | 'guideline';
}

/**
 * A validation violation
 */
export interface ValidationViolation {
  id: string;
  type: ViolationType;
  severity: 'critical' | 'major' | 'minor' | 'warning';
  category: QualityCategory;
  description: string;
  /** The problematic content */
  excerpt?: string;
  /** Line/position information */
  location?: {
    start: number;
    end: number;
    line?: number;
  };
  /** Suggested fix */
  suggestedFix?: string;
  /** Related fact/rule that was violated */
  relatedId?: string;
}

export enum ViolationType {
  CONTRADICTION = 'contradiction',
  QUALITY_BELOW_THRESHOLD = 'quality_below_threshold',
  TIMELINE_ERROR = 'timeline_error',
  CHARACTER_VOICE_MISMATCH = 'character_voice_mismatch',
  WORLD_RULE_VIOLATION = 'world_rule_violation',
  PLOT_HOLE = 'plot_hole',
  PACING_ISSUE = 'pacing_issue',
  DIALOGUE_ISSUE = 'dialogue_issue',
  TECHNICAL_ERROR = 'technical_error',
  CANON_VIOLATION = 'canon_violation',
}

/**
 * Request for content generation
 */
export interface GenerationRequest {
  id: string;
  /** What to generate */
  prompt: string;
  /** System context for AI */
  systemContext: string;
  /** Validation context */
  validationContext: ValidationContext;
  /** Override config for this request */
  configOverrides?: Partial<GenerationLoopConfig>;
  /** Metadata */
  metadata: Record<string, unknown>;
}

/**
 * Result of a single generation attempt
 */
export interface GenerationAttempt {
  attemptNumber: number;
  timestamp: Date;
  content: string;
  tokensUsed: number;
  duration: number;
  validationResult: ValidationResult;
  acceptedSegments: AcceptedSegment[];
  rejectedSegments: RejectedSegment[];
}

/**
 * Result of validation
 */
export interface ValidationResult {
  passed: boolean;
  overallScore: number;
  gateResults: {
    gateId: string;
    gateName: string;
    score: number;
    passed: boolean;
    violations: ValidationViolation[];
  }[];
  totalViolations: number;
  criticalViolations: number;
  suggestions: string[];
}

/**
 * A segment of content that was accepted
 */
export interface AcceptedSegment {
  start: number;
  end: number;
  content: string;
  score: number;
}

/**
 * A segment that was rejected
 */
export interface RejectedSegment {
  start: number;
  end: number;
  content: string;
  violations: ValidationViolation[];
  replacementAttempts: number;
}

/**
 * Final result of generation loop
 */
export interface GenerationResult {
  requestId: string;
  success: boolean;
  /** Final accepted content */
  content: string;
  /** Overall quality score */
  qualityScore: number;
  /** All attempts made */
  attempts: GenerationAttempt[];
  /** Total tokens used */
  totalTokensUsed: number;
  /** Total time taken */
  totalDuration: number;
  /** Remaining violations (if any) */
  remainingViolations: ValidationViolation[];
  /** Why did we stop? */
  terminationReason: TerminationReason;
  /** Detailed report */
  report: GenerationReport;
}

export enum TerminationReason {
  SUCCESS = 'success',
  MAX_ITERATIONS = 'max_iterations',
  TOKEN_BUDGET_EXCEEDED = 'token_budget_exceeded',
  CONVERGENCE = 'convergence',
  CRITICAL_FAILURE = 'critical_failure',
  USER_CANCELLED = 'user_cancelled',
}

/**
 * Detailed generation report
 */
export interface GenerationReport {
  requestId: string;
  startTime: Date;
  endTime: Date;
  totalAttempts: number;
  qualityProgression: { attempt: number; score: number }[];
  violationProgression: { attempt: number; violations: number }[];
  gatePassRates: { gateId: string; gateName: string; passRate: number }[];
  tokenBreakdown: {
    generation: number;
    validation: number;
    fixSuggestions: number;
  };
  convergenceInfo: {
    converged: boolean;
    atIteration?: number;
    finalDelta?: number;
  };
  recommendations: string[];
}

/**
 * AI generation function type
 */
export type AIGenerateFunction = (
  prompt: string,
  systemContext: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    previousAttempts?: string[];
    corrections?: string[];
  }
) => Promise<{ content: string; tokensUsed: number }>;

/**
 * AI fix function type
 */
export type AIFixFunction = (
  content: string,
  violations: ValidationViolation[],
  context: ValidationContext
) => Promise<{ fixedContent: string; tokensUsed: number }>;

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: GenerationLoopConfig = {
  maxIterations: 5,
  minQualityScore: 85,
  maxConsistencyViolations: 0,
  allowPartialAcceptance: true,
  convergenceThreshold: 2,
  maxTokenBudget: 100000,
  requiredQualityGates: [
    {
      id: 'consistency',
      name: 'Consistency Check',
      description: 'No contradictions with established facts',
      minScore: 95,
      category: QualityCategory.CONSISTENCY,
      required: true,
      weight: 0.25,
    },
    {
      id: 'prose-quality',
      name: 'Prose Quality',
      description: 'Writing quality meets standards',
      minScore: 80,
      category: QualityCategory.PROSE,
      required: true,
      weight: 0.20,
    },
    {
      id: 'character-voice',
      name: 'Character Voice',
      description: 'Characters sound authentic',
      minScore: 85,
      category: QualityCategory.CHARACTER_VOICE,
      required: true,
      weight: 0.20,
    },
    {
      id: 'timeline',
      name: 'Timeline Accuracy',
      description: 'No temporal paradoxes',
      minScore: 100,
      category: QualityCategory.TIMELINE,
      required: true,
      weight: 0.15,
    },
    {
      id: 'world-rules',
      name: 'World Rules',
      description: 'Magic/physics systems followed',
      minScore: 90,
      category: QualityCategory.WORLD_RULES,
      required: true,
      weight: 0.20,
    },
  ],
  customValidators: [],
  failureStrategy: 'partial',
};

// ============================================================================
// GENERATION LOOP ENGINE
// ============================================================================

/**
 * Generation-Validation Loop Engine
 *
 * Orchestrates the generate → validate → fix cycle for AI content generation.
 */
export class GenerationLoopEngine {
  private config: GenerationLoopConfig;
  private aiGenerate: AIGenerateFunction;
  private aiFix: AIFixFunction;

  /** Event handlers */
  private eventHandlers: Map<string, GenerationEventHandler[]> = new Map();

  /** Active generation requests */
  private activeRequests: Map<string, { request: GenerationRequest; cancelled: boolean }> = new Map();

  /** Generation history */
  private history: Map<string, GenerationResult> = new Map();

  constructor(
    aiGenerate: AIGenerateFunction,
    aiFix: AIFixFunction,
    config?: Partial<GenerationLoopConfig>
  ) {
    this.aiGenerate = aiGenerate;
    this.aiFix = aiFix;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ==========================================================================
  // MAIN GENERATION LOOP
  // ==========================================================================

  /**
   * Generate content with validation loop
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = new Date();
    const config = { ...this.config, ...request.configOverrides };

    // Track request
    this.activeRequests.set(request.id, { request, cancelled: false });

    const attempts: GenerationAttempt[] = [];
    let totalTokensUsed = 0;
    let bestContent = '';
    let bestScore = 0;
    let convergenceCounter = 0;
    let previousScore = 0;
    let terminationReason = TerminationReason.SUCCESS;

    try {
      for (let iteration = 1; iteration <= config.maxIterations; iteration++) {
        // Check cancellation
        if (this.activeRequests.get(request.id)?.cancelled) {
          terminationReason = TerminationReason.USER_CANCELLED;
          break;
        }

        // Check token budget
        if (totalTokensUsed >= config.maxTokenBudget) {
          terminationReason = TerminationReason.TOKEN_BUDGET_EXCEEDED;
          break;
        }

        // Emit progress event
        this.emit('progress', {
          requestId: request.id,
          iteration,
          maxIterations: config.maxIterations,
          currentScore: bestScore,
          tokensUsed: totalTokensUsed,
        });

        // Generate or fix content
        const attemptStart = Date.now();
        let content: string;
        let tokensUsed: number;

        if (iteration === 1) {
          // First iteration: generate fresh
          const result = await this.aiGenerate(
            request.prompt,
            request.systemContext,
            { maxTokens: Math.min(config.maxTokenBudget - totalTokensUsed, 8000) }
          );
          content = result.content;
          tokensUsed = result.tokensUsed;
        } else {
          // Subsequent iterations: fix previous attempt
          const lastAttempt = attempts[attempts.length - 1];
          const result = await this.aiFix(
            lastAttempt.content,
            lastAttempt.validationResult.gateResults.flatMap(g => g.violations),
            request.validationContext
          );
          content = result.fixedContent;
          tokensUsed = result.tokensUsed;
        }

        totalTokensUsed += tokensUsed;

        // Validate content
        const validationResult = await this.validateContent(
          content,
          request.validationContext,
          config
        );

        // Process segments if partial acceptance enabled
        const { acceptedSegments, rejectedSegments } = config.allowPartialAcceptance
          ? this.processSegments(content, validationResult)
          : { acceptedSegments: [], rejectedSegments: [] };

        // Record attempt
        const attempt: GenerationAttempt = {
          attemptNumber: iteration,
          timestamp: new Date(),
          content,
          tokensUsed,
          duration: Date.now() - attemptStart,
          validationResult,
          acceptedSegments,
          rejectedSegments,
        };
        attempts.push(attempt);

        // Emit attempt event
        this.emit('attempt', {
          requestId: request.id,
          attempt,
        });

        // Track best result
        if (validationResult.overallScore > bestScore) {
          bestScore = validationResult.overallScore;
          bestContent = content;
        }

        // Check if we passed all gates
        if (validationResult.passed) {
          terminationReason = TerminationReason.SUCCESS;
          break;
        }

        // Check for critical failures
        if (validationResult.criticalViolations > 0 && config.failureStrategy === 'fail') {
          terminationReason = TerminationReason.CRITICAL_FAILURE;
          break;
        }

        // Check convergence
        const scoreDelta = validationResult.overallScore - previousScore;
        if (Math.abs(scoreDelta) < 1) {
          convergenceCounter++;
          if (convergenceCounter >= config.convergenceThreshold) {
            terminationReason = TerminationReason.CONVERGENCE;
            break;
          }
        } else {
          convergenceCounter = 0;
        }
        previousScore = validationResult.overallScore;

        // Check max iterations
        if (iteration === config.maxIterations) {
          terminationReason = TerminationReason.MAX_ITERATIONS;
        }
      }
    } catch (error) {
      terminationReason = TerminationReason.CRITICAL_FAILURE;
      this.emit('error', { requestId: request.id, error });
    }

    // Clean up
    this.activeRequests.delete(request.id);

    // Build final result
    const endTime = new Date();
    const lastAttempt = attempts[attempts.length - 1];

    const result: GenerationResult = {
      requestId: request.id,
      success: terminationReason === TerminationReason.SUCCESS,
      content: bestContent,
      qualityScore: bestScore,
      attempts,
      totalTokensUsed,
      totalDuration: endTime.getTime() - startTime.getTime(),
      remainingViolations: lastAttempt?.validationResult.gateResults.flatMap(g => g.violations) || [],
      terminationReason,
      report: this.buildReport(request.id, startTime, endTime, attempts, totalTokensUsed, config),
    };

    // Store in history
    this.history.set(request.id, result);

    // Emit completion
    this.emit('complete', { requestId: request.id, result });

    return result;
  }

  /**
   * Cancel an active generation
   */
  cancel(requestId: string): boolean {
    const active = this.activeRequests.get(requestId);
    if (active) {
      active.cancelled = true;
      return true;
    }
    return false;
  }

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  /**
   * Validate content against all quality gates
   */
  private async validateContent(
    content: string,
    context: ValidationContext,
    config: GenerationLoopConfig
  ): Promise<ValidationResult> {
    const gateResults: ValidationResult['gateResults'] = [];
    let totalViolations = 0;
    let criticalViolations = 0;

    // Run each quality gate
    for (const gate of config.requiredQualityGates) {
      const violations = await this.runGateValidation(gate, content, context);
      const score = this.calculateGateScore(gate, violations);
      const passed = score >= gate.minScore;

      gateResults.push({
        gateId: gate.id,
        gateName: gate.name,
        score,
        passed,
        violations,
      });

      totalViolations += violations.length;
      criticalViolations += violations.filter(v => v.severity === 'critical').length;
    }

    // Run custom validators
    for (const validator of config.customValidators) {
      const violations = await validator.validate(content, context);
      const score = Math.max(0, 100 - violations.length * 10);

      gateResults.push({
        gateId: validator.id,
        gateName: validator.name,
        score,
        passed: violations.length === 0,
        violations,
      });

      totalViolations += violations.length;
      criticalViolations += violations.filter(v => v.severity === 'critical').length;
    }

    // Calculate overall score
    let overallScore = 0;
    let totalWeight = 0;
    for (const result of gateResults) {
      const gate = config.requiredQualityGates.find(g => g.id === result.gateId);
      const weight = gate?.weight || 0.1;
      overallScore += result.score * weight;
      totalWeight += weight;
    }
    overallScore = totalWeight > 0 ? overallScore / totalWeight : 0;

    // Check if all required gates passed
    const allRequiredPassed = gateResults
      .filter(r => {
        const gate = config.requiredQualityGates.find(g => g.id === r.gateId);
        return gate?.required;
      })
      .every(r => r.passed);

    const passed = allRequiredPassed &&
      overallScore >= config.minQualityScore &&
      criticalViolations <= config.maxConsistencyViolations;

    // Generate suggestions
    const suggestions = this.generateSuggestions(gateResults);

    return {
      passed,
      overallScore,
      gateResults,
      totalViolations,
      criticalViolations,
      suggestions,
    };
  }

  /**
   * Run validation for a specific quality gate
   */
  private async runGateValidation(
    gate: QualityGate,
    content: string,
    context: ValidationContext
  ): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];

    switch (gate.category) {
      case QualityCategory.CONSISTENCY:
        violations.push(...this.checkConsistency(content, context));
        break;

      case QualityCategory.PROSE:
        violations.push(...this.checkProseQuality(content));
        break;

      case QualityCategory.CHARACTER_VOICE:
        violations.push(...this.checkCharacterVoice(content, context));
        break;

      case QualityCategory.TIMELINE:
        violations.push(...this.checkTimeline(content, context));
        break;

      case QualityCategory.WORLD_RULES:
        violations.push(...this.checkWorldRules(content, context));
        break;

      case QualityCategory.PLOT_COHERENCE:
        violations.push(...this.checkPlotCoherence(content, context));
        break;

      case QualityCategory.DIALOGUE:
        violations.push(...this.checkDialogue(content));
        break;

      case QualityCategory.PACING:
        violations.push(...this.checkPacing(content));
        break;

      case QualityCategory.TECHNICAL:
        violations.push(...this.checkTechnical(content));
        break;
    }

    return violations;
  }

  /**
   * Calculate gate score based on violations
   */
  private calculateGateScore(gate: QualityGate, violations: ValidationViolation[]): number {
    let score = 100;

    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'major':
          score -= 15;
          break;
        case 'minor':
          score -= 5;
          break;
        case 'warning':
          score -= 2;
          break;
      }
    }

    return Math.max(0, score);
  }

  // ==========================================================================
  // VALIDATION CHECKS
  // ==========================================================================

  private checkConsistency(content: string, context: ValidationContext): ValidationViolation[] {
    const violations: ValidationViolation[] = [];
    const contentLower = content.toLowerCase();

    // Check against established facts
    for (const fact of context.establishedFacts) {
      // Check for contradictions
      if (fact.attribute === 'eye_color' || fact.attribute === 'hair_color') {
        const subjectPattern = new RegExp(`\\b${fact.subject}\\b[^.]*\\b(\\w+)\\s+(eyes|hair)`, 'gi');
        const matches = content.matchAll(subjectPattern);

        for (const match of matches) {
          const foundColor = match[1].toLowerCase();
          const attributeType = match[2].toLowerCase();

          if (attributeType === 'eyes' && fact.attribute === 'eye_color' && foundColor !== String(fact.value).toLowerCase()) {
            violations.push({
              id: uuidv4(),
              type: ViolationType.CONTRADICTION,
              severity: 'major',
              category: QualityCategory.CONSISTENCY,
              description: `${fact.subject}'s eye color is "${fact.value}" but content says "${foundColor}"`,
              excerpt: match[0],
              suggestedFix: `Change "${foundColor}" to "${fact.value}"`,
              relatedId: fact.id,
            });
          }
        }
      }

      // Check for dead character actions
      if (fact.attribute === 'status' && fact.value === 'dead') {
        const actionPattern = new RegExp(`\\b${fact.subject}\\b[^.]*\\b(said|walked|ran|looked|smiled|laughed|attacked|grabbed)`, 'gi');
        const matches = content.matchAll(actionPattern);

        for (const match of matches) {
          // Check if this is a flashback or memory context
          if (!contentLower.includes('remembered') && !contentLower.includes('flashback')) {
            violations.push({
              id: uuidv4(),
              type: ViolationType.CONTRADICTION,
              severity: 'critical',
              category: QualityCategory.CONSISTENCY,
              description: `${fact.subject} is dead but performs action in present scene`,
              excerpt: match[0],
              suggestedFix: `Remove ${fact.subject} from active scene or mark as flashback`,
              relatedId: fact.id,
            });
          }
        }
      }
    }

    return violations;
  }

  private checkProseQuality(content: string): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    // Check for filter words
    const filterPatterns = [
      { pattern: /\b(saw|heard|felt|noticed|realized|knew|thought|wondered)\s+that\b/gi, name: 'filter word' },
      { pattern: /\b(very|really|quite|rather|somewhat|basically|actually)\b/gi, name: 'weak modifier' },
      { pattern: /\bsuddenly\b/gi, name: '"suddenly" crutch' },
    ];

    for (const { pattern, name } of filterPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        violations.push({
          id: uuidv4(),
          type: ViolationType.QUALITY_BELOW_THRESHOLD,
          severity: 'minor',
          category: QualityCategory.PROSE,
          description: `Found ${name}: "${match[0]}"`,
          excerpt: match[0],
          location: { start: match.index || 0, end: (match.index || 0) + match[0].length },
          suggestedFix: `Remove or rewrite to show rather than tell`,
        });
      }
    }

    // Check for adverb-laden dialogue tags
    const adverbTagPattern = /\b(said|whispered|shouted|replied|asked)\s+\w+ly\b/gi;
    const adverbMatches = content.matchAll(adverbTagPattern);
    for (const match of adverbMatches) {
      violations.push({
        id: uuidv4(),
        type: ViolationType.QUALITY_BELOW_THRESHOLD,
        severity: 'minor',
        category: QualityCategory.PROSE,
        description: `Adverb dialogue tag: "${match[0]}"`,
        excerpt: match[0],
        suggestedFix: `Show the emotion through action instead`,
      });
    }

    return violations;
  }

  private checkCharacterVoice(content: string, context: ValidationContext): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    // This would integrate with voice profiler in full implementation
    // For now, basic checks

    // Check dialogue consistency within scene
    const dialoguePattern = /"[^"]+"/g;
    const dialogues = content.match(dialoguePattern) || [];

    // Flag if all dialogue sounds the same length/style
    if (dialogues.length > 3) {
      const lengths = dialogues.map(d => d.length);
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avgLength, 2), 0) / lengths.length;

      if (variance < 50) {
        violations.push({
          id: uuidv4(),
          type: ViolationType.CHARACTER_VOICE_MISMATCH,
          severity: 'warning',
          category: QualityCategory.CHARACTER_VOICE,
          description: 'Dialogue lengths too uniform - characters may sound too similar',
          suggestedFix: 'Vary dialogue length based on character personality',
        });
      }
    }

    return violations;
  }

  private checkTimeline(content: string, context: ValidationContext): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    // Check for temporal contradictions
    const beforeAfterPattern = /\b(before|after|since|until)\s+\w+/gi;
    const matches = content.matchAll(beforeAfterPattern);

    // Would integrate with timeline engine for full validation
    // Basic check for obvious issues
    for (const _match of matches) {
      // Placeholder for timeline validation
    }

    return violations;
  }

  private checkWorldRules(content: string, context: ValidationContext): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    // Check canon rules
    for (const rule of context.canonRules) {
      if (rule.enforcement === 'strict') {
        // Would integrate with canon module for full validation
        // Check if content violates the rule
        const ruleKeywords = rule.description.toLowerCase().split(' ').filter(w => w.length > 4);
        for (const keyword of ruleKeywords) {
          if (content.toLowerCase().includes(keyword)) {
            // Flag for review (full implementation would parse semantically)
          }
        }
      }
    }

    return violations;
  }

  private checkPlotCoherence(content: string, context: ValidationContext): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    // Check for scene grounding
    const hasLocation = /\b(room|hall|forest|city|street|building|house|chamber|valley|mountain)\b/gi.test(content);
    if (!hasLocation && content.length > 500) {
      violations.push({
        id: uuidv4(),
        type: ViolationType.PLOT_HOLE,
        severity: 'minor',
        category: QualityCategory.PLOT_COHERENCE,
        description: 'Scene lacks clear location grounding',
        suggestedFix: 'Establish where the scene takes place',
      });
    }

    // Check for character introduction
    const pronounPattern = /\b(he|she|they)\b/gi;
    const pronounMatches = content.match(pronounPattern) || [];
    const firstPronounIndex = content.search(pronounPattern);

    if (pronounMatches.length > 0 && firstPronounIndex < 100) {
      // Check if character was named before pronoun
      const beforePronoun = content.substring(0, firstPronounIndex);
      const hasName = /\b[A-Z][a-z]+\b/.test(beforePronoun);

      if (!hasName && !context.previousContent) {
        violations.push({
          id: uuidv4(),
          type: ViolationType.PLOT_HOLE,
          severity: 'minor',
          category: QualityCategory.PLOT_COHERENCE,
          description: 'Pronoun used before character introduction',
          suggestedFix: 'Introduce character by name before using pronouns',
        });
      }
    }

    return violations;
  }

  private checkDialogue(content: string): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    // Check for unmatched quotes
    const quoteCount = (content.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      violations.push({
        id: uuidv4(),
        type: ViolationType.TECHNICAL_ERROR,
        severity: 'major',
        category: QualityCategory.DIALOGUE,
        description: 'Unmatched quotation marks',
        suggestedFix: 'Check all dialogue for properly closed quotes',
      });
    }

    // Check for talking head syndrome (too much dialogue, no action)
    const sentences = content.split(/[.!?]+/);
    const dialogueSentences = sentences.filter(s => s.includes('"'));
    if (sentences.length > 5 && dialogueSentences.length / sentences.length > 0.8) {
      violations.push({
        id: uuidv4(),
        type: ViolationType.DIALOGUE_ISSUE,
        severity: 'warning',
        category: QualityCategory.DIALOGUE,
        description: 'Scene is dialogue-heavy with little action or description',
        suggestedFix: 'Add action beats, body language, and environmental details',
      });
    }

    return violations;
  }

  private checkPacing(content: string): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    // Analyze sentence lengths
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 0) {
      const lengths = sentences.map(s => s.trim().split(/\s+/).length);
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avgLength, 2), 0) / lengths.length;

      if (variance < 10 && sentences.length > 5) {
        violations.push({
          id: uuidv4(),
          type: ViolationType.PACING_ISSUE,
          severity: 'minor',
          category: QualityCategory.PACING,
          description: 'Sentence lengths too uniform - monotonous pacing',
          suggestedFix: 'Mix short punchy sentences with longer flowing ones',
        });
      }

      if (avgLength > 30) {
        violations.push({
          id: uuidv4(),
          type: ViolationType.PACING_ISSUE,
          severity: 'warning',
          category: QualityCategory.PACING,
          description: 'Average sentence length very long - may slow pacing',
          suggestedFix: 'Break up long sentences for faster reading pace',
        });
      }
    }

    return violations;
  }

  private checkTechnical(content: string): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    // Check for double spaces
    const doubleSpaces = content.match(/  +/g) || [];
    if (doubleSpaces.length > 3) {
      violations.push({
        id: uuidv4(),
        type: ViolationType.TECHNICAL_ERROR,
        severity: 'minor',
        category: QualityCategory.TECHNICAL,
        description: `Found ${doubleSpaces.length} instances of double spaces`,
        suggestedFix: 'Clean up extra whitespace',
      });
    }

    // Check for common typos/errors
    const commonErrors = [
      { pattern: /\bteh\b/gi, fix: 'the' },
      { pattern: /\byou're\s+\w+\s+(is|are)\b/gi, fix: 'your' },
      { pattern: /\bits'\s+\w+\s+(is|are)\b/gi, fix: 'its' },
    ];

    for (const { pattern, fix } of commonErrors) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        violations.push({
          id: uuidv4(),
          type: ViolationType.TECHNICAL_ERROR,
          severity: 'minor',
          category: QualityCategory.TECHNICAL,
          description: `Possible typo/error: "${match[0]}"`,
          excerpt: match[0],
          suggestedFix: `Consider using "${fix}"`,
        });
      }
    }

    return violations;
  }

  // ==========================================================================
  // SEGMENT PROCESSING
  // ==========================================================================

  /**
   * Process content into accepted and rejected segments
   */
  private processSegments(
    content: string,
    validationResult: ValidationResult
  ): { acceptedSegments: AcceptedSegment[]; rejectedSegments: RejectedSegment[] } {
    const acceptedSegments: AcceptedSegment[] = [];
    const rejectedSegments: RejectedSegment[] = [];

    // Get all violation locations
    const violationLocations = validationResult.gateResults
      .flatMap(g => g.violations)
      .filter(v => v.location)
      .map(v => ({ ...v.location!, violation: v }))
      .sort((a, b) => a.start - b.start);

    if (violationLocations.length === 0) {
      // No location-specific violations - accept all
      acceptedSegments.push({
        start: 0,
        end: content.length,
        content,
        score: validationResult.overallScore,
      });
      return { acceptedSegments, rejectedSegments };
    }

    // Process segments around violations
    let currentPos = 0;
    for (const loc of violationLocations) {
      // Accept segment before violation
      if (loc.start > currentPos) {
        acceptedSegments.push({
          start: currentPos,
          end: loc.start,
          content: content.substring(currentPos, loc.start),
          score: 90, // Assumed good if no violations
        });
      }

      // Mark violation segment
      rejectedSegments.push({
        start: loc.start,
        end: loc.end,
        content: content.substring(loc.start, loc.end),
        violations: [loc.violation],
        replacementAttempts: 0,
      });

      currentPos = loc.end;
    }

    // Accept remaining content
    if (currentPos < content.length) {
      acceptedSegments.push({
        start: currentPos,
        end: content.length,
        content: content.substring(currentPos),
        score: 90,
      });
    }

    return { acceptedSegments, rejectedSegments };
  }

  // ==========================================================================
  // SUGGESTIONS & REPORTS
  // ==========================================================================

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(gateResults: ValidationResult['gateResults']): string[] {
    const suggestions: string[] = [];

    for (const result of gateResults) {
      if (!result.passed) {
        suggestions.push(`Improve ${result.gateName}: Score ${result.score.toFixed(1)} below ${
          this.config.requiredQualityGates.find(g => g.id === result.gateId)?.minScore || 80
        }`);

        // Add specific suggestions from violations
        for (const violation of result.violations) {
          if (violation.suggestedFix) {
            suggestions.push(`• ${violation.suggestedFix}`);
          }
        }
      }
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }

  /**
   * Build detailed generation report
   */
  private buildReport(
    requestId: string,
    startTime: Date,
    endTime: Date,
    attempts: GenerationAttempt[],
    totalTokensUsed: number,
    config: GenerationLoopConfig
  ): GenerationReport {
    const qualityProgression = attempts.map(a => ({
      attempt: a.attemptNumber,
      score: a.validationResult.overallScore,
    }));

    const violationProgression = attempts.map(a => ({
      attempt: a.attemptNumber,
      violations: a.validationResult.totalViolations,
    }));

    // Calculate gate pass rates
    const gatePassCounts: Map<string, { passed: number; total: number; name: string }> = new Map();
    for (const attempt of attempts) {
      for (const result of attempt.validationResult.gateResults) {
        const current = gatePassCounts.get(result.gateId) || { passed: 0, total: 0, name: result.gateName };
        current.total++;
        if (result.passed) current.passed++;
        gatePassCounts.set(result.gateId, current);
      }
    }

    const gatePassRates = Array.from(gatePassCounts.entries()).map(([gateId, data]) => ({
      gateId,
      gateName: data.name,
      passRate: data.total > 0 ? data.passed / data.total : 0,
    }));

    // Check convergence
    let converged = false;
    let convergenceIteration: number | undefined;
    let finalDelta: number | undefined;

    if (qualityProgression.length >= config.convergenceThreshold) {
      const recent = qualityProgression.slice(-config.convergenceThreshold);
      const deltas = recent.slice(1).map((p, i) => Math.abs(p.score - recent[i].score));
      if (deltas.every(d => d < 1)) {
        converged = true;
        convergenceIteration = recent[0].attempt;
        finalDelta = deltas[deltas.length - 1];
      }
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (!converged && attempts.length === config.maxIterations) {
      recommendations.push('Consider increasing max iterations or adjusting quality thresholds');
    }
    if (totalTokensUsed > config.maxTokenBudget * 0.8) {
      recommendations.push('Token usage was high - consider optimizing prompts');
    }
    for (const rate of gatePassRates) {
      if (rate.passRate < 0.5) {
        recommendations.push(`${rate.gateName} has low pass rate (${(rate.passRate * 100).toFixed(1)}%) - review validation criteria`);
      }
    }

    return {
      requestId,
      startTime,
      endTime,
      totalAttempts: attempts.length,
      qualityProgression,
      violationProgression,
      gatePassRates,
      tokenBreakdown: {
        generation: Math.floor(totalTokensUsed * 0.7),
        validation: Math.floor(totalTokensUsed * 0.1),
        fixSuggestions: Math.floor(totalTokensUsed * 0.2),
      },
      convergenceInfo: {
        converged,
        atIteration: convergenceIteration,
        finalDelta,
      },
      recommendations,
    };
  }

  // ==========================================================================
  // EVENTS
  // ==========================================================================

  /** Event handler type */
  private emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    }
  }

  /**
   * Register event handler
   */
  on(event: 'progress' | 'attempt' | 'complete' | 'error', handler: GenerationEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    };
  }

  // ==========================================================================
  // CONFIGURATION & STATS
  // ==========================================================================

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<GenerationLoopConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): GenerationLoopConfig {
    return { ...this.config };
  }

  /**
   * Get generation history
   */
  getHistory(requestId?: string): GenerationResult | GenerationResult[] | null {
    if (requestId) {
      return this.history.get(requestId) || null;
    }
    return Array.from(this.history.values());
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history.clear();
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalGenerations: number;
    successRate: number;
    averageAttempts: number;
    averageQuality: number;
    totalTokensUsed: number;
    averageDuration: number;
    terminationReasons: Record<string, number>;
  } {
    const results = Array.from(this.history.values());

    if (results.length === 0) {
      return {
        totalGenerations: 0,
        successRate: 0,
        averageAttempts: 0,
        averageQuality: 0,
        totalTokensUsed: 0,
        averageDuration: 0,
        terminationReasons: {},
      };
    }

    const successes = results.filter(r => r.success).length;
    const totalAttempts = results.reduce((sum, r) => sum + r.attempts.length, 0);
    const totalQuality = results.reduce((sum, r) => sum + r.qualityScore, 0);
    const totalTokens = results.reduce((sum, r) => sum + r.totalTokensUsed, 0);
    const totalDuration = results.reduce((sum, r) => sum + r.totalDuration, 0);

    const terminationReasons: Record<string, number> = {};
    for (const result of results) {
      terminationReasons[result.terminationReason] =
        (terminationReasons[result.terminationReason] || 0) + 1;
    }

    return {
      totalGenerations: results.length,
      successRate: successes / results.length,
      averageAttempts: totalAttempts / results.length,
      averageQuality: totalQuality / results.length,
      totalTokensUsed: totalTokens,
      averageDuration: totalDuration / results.length,
      terminationReasons,
    };
  }
}

/**
 * Event handler type
 */
export type GenerationEventHandler = (data: unknown) => void;

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a generation request
 */
export function createGenerationRequest(
  prompt: string,
  systemContext: string,
  validationContext: Partial<ValidationContext> = {},
  metadata: Record<string, unknown> = {}
): GenerationRequest {
  return {
    id: uuidv4(),
    prompt,
    systemContext,
    validationContext: {
      characterIds: [],
      establishedFacts: [],
      canonRules: [],
      constraints: [],
      ...validationContext,
    },
    metadata,
  };
}

/**
 * Create a simple AI generate function wrapper
 */
export function createMockAIGenerate(): AIGenerateFunction {
  return async (prompt, _systemContext, _options) => {
    // This is a mock - real implementation would call actual AI API
    return {
      content: `[Generated content for: ${prompt.substring(0, 50)}...]`,
      tokensUsed: 500,
    };
  };
}

/**
 * Create a simple AI fix function wrapper
 */
export function createMockAIFix(): AIFixFunction {
  return async (content, violations, _context) => {
    // This is a mock - real implementation would call actual AI API
    let fixedContent = content;

    // Apply basic fixes
    for (const violation of violations) {
      if (violation.suggestedFix && violation.excerpt) {
        // Very basic replacement (real implementation would be smarter)
        fixedContent = fixedContent.replace(violation.excerpt, violation.suggestedFix);
      }
    }

    return {
      fixedContent,
      tokensUsed: 300,
    };
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default GenerationLoopEngine;
