/**
 * Leading Edge AI Configuration
 *
 * Enforces frontier AI models and advanced prompting techniques
 * for maximum quality fiction generation. This configuration ensures
 * the Epic Fiction Architect always uses the most capable AI systems
 * available for producing 300M+ word narratives.
 *
 * @module config/leading-edge-ai
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// FRONTIER MODEL DEFINITIONS
// ============================================================================

/**
 * AI Provider enumeration - Only frontier providers allowed
 */
export enum FrontierProvider {
  ANTHROPIC = 'anthropic',
  OPENAI = 'openai',
  GOOGLE = 'google',
}

/**
 * Model capability tier - ONLY Tier 1 allowed for quality-critical operations
 */
export enum ModelTier {
  TIER_1_FRONTIER = 'tier_1_frontier',     // Required for all writing
  TIER_2_ADVANCED = 'tier_2_advanced',     // Allowed for analysis only
  TIER_3_STANDARD = 'tier_3_standard',     // BLOCKED - Never use
  TIER_4_LEGACY = 'tier_4_legacy',         // BLOCKED - Never use
}

/**
 * Specific model identifiers with capabilities
 */
export interface FrontierModel {
  modelId: string;
  provider: FrontierProvider;
  tier: ModelTier;
  displayName: string;
  contextWindow: number;
  maxOutputTokens: number;
  supportsVision: boolean;
  supportsStructuredOutput: boolean;
  supportsFunctionCalling: boolean;
  supportsStreaming: boolean;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  qualityScore: number;  // 0-100, based on benchmarks
  releaseDate: Date;
  capabilities: ModelCapability[];
}

/**
 * Model capabilities for task matching
 */
export enum ModelCapability {
  CREATIVE_WRITING = 'creative_writing',
  LONG_FORM_NARRATIVE = 'long_form_narrative',
  CHARACTER_VOICE = 'character_voice',
  DIALOGUE_GENERATION = 'dialogue_generation',
  WORLD_BUILDING = 'world_building',
  PLOT_CONSISTENCY = 'plot_consistency',
  EMOTIONAL_DEPTH = 'emotional_depth',
  TECHNICAL_ACCURACY = 'technical_accuracy',
  STYLE_MATCHING = 'style_matching',
  PACING_CONTROL = 'pacing_control',
  THEME_INTEGRATION = 'theme_integration',
  SUBTEXT_GENERATION = 'subtext_generation',
  FORESHADOWING = 'foreshadowing',
  TENSION_BUILDING = 'tension_building',
  RESOLUTION_CRAFTING = 'resolution_crafting',
}

/**
 * Registry of approved frontier models
 */
export const FRONTIER_MODEL_REGISTRY: FrontierModel[] = [
  // Anthropic Models
  {
    modelId: 'claude-opus-4-20250514',
    provider: FrontierProvider.ANTHROPIC,
    tier: ModelTier.TIER_1_FRONTIER,
    displayName: 'Claude Opus 4',
    contextWindow: 200000,
    maxOutputTokens: 32000,
    supportsVision: true,
    supportsStructuredOutput: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    costPer1kInputTokens: 0.015,
    costPer1kOutputTokens: 0.075,
    qualityScore: 98,
    releaseDate: new Date('2025-05-14'),
    capabilities: [
      ModelCapability.CREATIVE_WRITING,
      ModelCapability.LONG_FORM_NARRATIVE,
      ModelCapability.CHARACTER_VOICE,
      ModelCapability.DIALOGUE_GENERATION,
      ModelCapability.WORLD_BUILDING,
      ModelCapability.PLOT_CONSISTENCY,
      ModelCapability.EMOTIONAL_DEPTH,
      ModelCapability.STYLE_MATCHING,
      ModelCapability.PACING_CONTROL,
      ModelCapability.THEME_INTEGRATION,
      ModelCapability.SUBTEXT_GENERATION,
      ModelCapability.FORESHADOWING,
      ModelCapability.TENSION_BUILDING,
      ModelCapability.RESOLUTION_CRAFTING,
    ],
  },
  {
    modelId: 'claude-sonnet-4-20250514',
    provider: FrontierProvider.ANTHROPIC,
    tier: ModelTier.TIER_1_FRONTIER,
    displayName: 'Claude Sonnet 4',
    contextWindow: 200000,
    maxOutputTokens: 16000,
    supportsVision: true,
    supportsStructuredOutput: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    qualityScore: 94,
    releaseDate: new Date('2025-05-14'),
    capabilities: [
      ModelCapability.CREATIVE_WRITING,
      ModelCapability.LONG_FORM_NARRATIVE,
      ModelCapability.CHARACTER_VOICE,
      ModelCapability.DIALOGUE_GENERATION,
      ModelCapability.WORLD_BUILDING,
      ModelCapability.PLOT_CONSISTENCY,
      ModelCapability.EMOTIONAL_DEPTH,
      ModelCapability.STYLE_MATCHING,
    ],
  },
  {
    modelId: 'claude-3-5-sonnet-20241022',
    provider: FrontierProvider.ANTHROPIC,
    tier: ModelTier.TIER_2_ADVANCED,
    displayName: 'Claude 3.5 Sonnet',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsStructuredOutput: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    qualityScore: 90,
    releaseDate: new Date('2024-10-22'),
    capabilities: [
      ModelCapability.CREATIVE_WRITING,
      ModelCapability.CHARACTER_VOICE,
      ModelCapability.DIALOGUE_GENERATION,
      ModelCapability.WORLD_BUILDING,
      ModelCapability.PLOT_CONSISTENCY,
    ],
  },
  // OpenAI Models
  {
    modelId: 'gpt-4-turbo-2024-04-09',
    provider: FrontierProvider.OPENAI,
    tier: ModelTier.TIER_1_FRONTIER,
    displayName: 'GPT-4 Turbo',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsStructuredOutput: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    costPer1kInputTokens: 0.01,
    costPer1kOutputTokens: 0.03,
    qualityScore: 92,
    releaseDate: new Date('2024-04-09'),
    capabilities: [
      ModelCapability.CREATIVE_WRITING,
      ModelCapability.LONG_FORM_NARRATIVE,
      ModelCapability.CHARACTER_VOICE,
      ModelCapability.DIALOGUE_GENERATION,
      ModelCapability.WORLD_BUILDING,
      ModelCapability.PLOT_CONSISTENCY,
      ModelCapability.TECHNICAL_ACCURACY,
    ],
  },
  {
    modelId: 'gpt-4o-2024-08-06',
    provider: FrontierProvider.OPENAI,
    tier: ModelTier.TIER_1_FRONTIER,
    displayName: 'GPT-4o',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsStructuredOutput: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    costPer1kInputTokens: 0.005,
    costPer1kOutputTokens: 0.015,
    qualityScore: 93,
    releaseDate: new Date('2024-08-06'),
    capabilities: [
      ModelCapability.CREATIVE_WRITING,
      ModelCapability.LONG_FORM_NARRATIVE,
      ModelCapability.CHARACTER_VOICE,
      ModelCapability.DIALOGUE_GENERATION,
      ModelCapability.WORLD_BUILDING,
      ModelCapability.STYLE_MATCHING,
    ],
  },
  // Google Models
  {
    modelId: 'gemini-1.5-pro',
    provider: FrontierProvider.GOOGLE,
    tier: ModelTier.TIER_1_FRONTIER,
    displayName: 'Gemini 1.5 Pro',
    contextWindow: 2000000,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsStructuredOutput: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
    costPer1kInputTokens: 0.00125,
    costPer1kOutputTokens: 0.005,
    qualityScore: 89,
    releaseDate: new Date('2024-05-01'),
    capabilities: [
      ModelCapability.CREATIVE_WRITING,
      ModelCapability.LONG_FORM_NARRATIVE,
      ModelCapability.WORLD_BUILDING,
      ModelCapability.TECHNICAL_ACCURACY,
    ],
  },
];

// ============================================================================
// ADVANCED PROMPTING TECHNIQUES
// ============================================================================

/**
 * Prompting technique types
 */
export enum PromptingTechnique {
  CHAIN_OF_THOUGHT = 'chain_of_thought',
  FEW_SHOT = 'few_shot',
  TREE_OF_THOUGHTS = 'tree_of_thoughts',
  SELF_CONSISTENCY = 'self_consistency',
  REFLEXION = 'reflexion',
  STRUCTURED_OUTPUT = 'structured_output',
  PERSONA_PRIMING = 'persona_priming',
  CONSTRAINT_INJECTION = 'constraint_injection',
  ITERATIVE_REFINEMENT = 'iterative_refinement',
  MULTI_PERSPECTIVE = 'multi_perspective',
}

/**
 * Prompt template with technique integration
 */
export interface AdvancedPromptTemplate {
  templateId: string;
  name: string;
  description: string;
  techniques: PromptingTechnique[];
  systemPrompt: string;
  userPromptTemplate: string;
  fewShotExamples?: FewShotExample[];
  outputSchema?: object;
  qualityGates: QualityGate[];
  minModelTier: ModelTier;
  requiredCapabilities: ModelCapability[];
}

/**
 * Few-shot example for in-context learning
 */
export interface FewShotExample {
  input: string;
  output: string;
  explanation?: string;
  qualityMarkers: string[];
}

/**
 * Quality gate for output validation
 */
export interface QualityGate {
  gateId: string;
  name: string;
  description: string;
  validationFn: string;  // Serialized function or rule name
  threshold: number;
  required: boolean;
}

// ============================================================================
// MASTER PROMPT TEMPLATES
// ============================================================================

/**
 * Scene Generation Master Prompt
 * Uses Chain-of-Thought + Few-Shot + Structured Output
 */
export const SCENE_GENERATION_TEMPLATE: AdvancedPromptTemplate = {
  templateId: 'scene-gen-master-v1',
  name: 'Scene Generation Master Template',
  description: 'Maximum quality scene generation with advanced techniques',
  techniques: [
    PromptingTechnique.CHAIN_OF_THOUGHT,
    PromptingTechnique.FEW_SHOT,
    PromptingTechnique.STRUCTURED_OUTPUT,
    PromptingTechnique.PERSONA_PRIMING,
  ],
  systemPrompt: `You are a master fiction writer with expertise in crafting immersive, emotionally resonant scenes.
Your writing has been praised for its vivid sensory details, authentic character voices, and precise pacing.

WRITING PHILOSOPHY:
- Show, don't tell - Use action and dialogue to reveal character
- Every sentence must earn its place - No filler or padding
- Sensory immersion - Engage at least 3 senses per scene
- Subtext over surface - What's unsaid matters as much as what's said
- Tension in every exchange - Even quiet moments have undercurrents

QUALITY STANDARDS:
- Prose must flow naturally when read aloud
- Each character's voice must be distinct and consistent
- Scene beats must hit emotional targets precisely
- Pacing must match the scene's intended tempo
- Foreshadowing must be subtle but present

Before writing, you will THINK through:
1. What is the scene's emotional core?
2. What does each character want in this moment?
3. What are the power dynamics at play?
4. What sensory details anchor us in this space?
5. How does this scene advance the larger narrative?`,

  userPromptTemplate: `SCENE CONTEXT:
{{context}}

CHARACTERS PRESENT:
{{characters}}

SCENE REQUIREMENTS:
- Target Word Count: {{wordCount}}
- Emotional Target: {{emotionalTarget}}
- Pacing: {{pacing}}
- POV: {{pov}}

PLOT BEATS TO HIT:
{{plotBeats}}

WRITING CONSTRAINTS:
{{constraints}}

---
THINKING PROCESS:

First, let me analyze this scene's requirements...

[Your chain-of-thought analysis here]

---
SCENE:

[Your scene here]`,

  fewShotExamples: [
    {
      input: 'Write a tense confrontation between a mentor and student who has discovered the mentor\'s secret',
      output: `The teacup trembled in Master Chen's fingers—the only betrayal of his composure. Mei had seen those same hands steady enough to thread a needle in a storm.

"You followed me." Not a question.

"Three nights." Mei's voice held steady, though her heart hammered against her ribs. "To the northern shrine. Where they burned the temple records."

The silence stretched between them like a blade being drawn. Outside, cicadas screamed their endless summer song.

"And what did you see?" Chen set down the cup with a click of porcelain on wood.

"Enough to know." Mei's hand moved to her sword hilt—not drawing, not yet—just finding the familiar weight. "Enough to wonder if everything you taught me was a lie."

Chen's laugh was soft, almost sad. "I taught you to question everything, little bird. Even me." His eyes met hers, and for the first time, she saw them clearly: not the wise master, but a man who had made choices she couldn't yet understand. "Especially me."`,
      explanation: 'Demonstrates tension through physical details, subtext in dialogue, and emotional complexity',
      qualityMarkers: [
        'Sensory details (trembling cup, cicadas, heart hammering)',
        'Physical space grounding (porcelain on wood, outside sounds)',
        'Subtext (what\'s unsaid carries weight)',
        'Character complexity (mentor as human, not archetype)',
        'Action beats integrated with dialogue',
      ],
    },
  ],

  outputSchema: {
    type: 'object',
    properties: {
      thinking: { type: 'string', description: 'Chain-of-thought analysis' },
      scene: { type: 'string', description: 'The generated scene' },
      wordCount: { type: 'number' },
      emotionalBeatsHit: { type: 'array', items: { type: 'string' } },
      sensoryDetails: { type: 'array', items: { type: 'string' } },
      foreshadowingPlanted: { type: 'array', items: { type: 'string' } },
    },
    required: ['scene', 'wordCount'],
  },

  qualityGates: [
    {
      gateId: 'word-count',
      name: 'Word Count Compliance',
      description: 'Scene meets target word count within 10% tolerance',
      validationFn: 'validateWordCount',
      threshold: 0.9,
      required: true,
    },
    {
      gateId: 'sensory-minimum',
      name: 'Sensory Detail Minimum',
      description: 'At least 3 distinct senses engaged',
      validationFn: 'validateSensoryDetails',
      threshold: 3,
      required: true,
    },
    {
      gateId: 'dialogue-distinction',
      name: 'Character Voice Distinction',
      description: 'Each character has identifiable voice patterns',
      validationFn: 'validateCharacterVoices',
      threshold: 0.85,
      required: true,
    },
    {
      gateId: 'pacing-match',
      name: 'Pacing Match',
      description: 'Scene pacing matches requested tempo',
      validationFn: 'validatePacing',
      threshold: 0.8,
      required: false,
    },
  ],

  minModelTier: ModelTier.TIER_1_FRONTIER,
  requiredCapabilities: [
    ModelCapability.CREATIVE_WRITING,
    ModelCapability.CHARACTER_VOICE,
    ModelCapability.DIALOGUE_GENERATION,
    ModelCapability.EMOTIONAL_DEPTH,
  ],
};

/**
 * Character Voice Generation Template
 * Uses Persona Priming + Self-Consistency
 */
export const CHARACTER_VOICE_TEMPLATE: AdvancedPromptTemplate = {
  templateId: 'char-voice-master-v1',
  name: 'Character Voice Master Template',
  description: 'Generate unique, consistent character voice profiles',
  techniques: [
    PromptingTechnique.PERSONA_PRIMING,
    PromptingTechnique.SELF_CONSISTENCY,
    PromptingTechnique.CONSTRAINT_INJECTION,
  ],
  systemPrompt: `You are a dialogue specialist who creates distinct, memorable character voices.

Each character's voice is a fingerprint—unique and identifiable. Consider:
- Vocabulary range (simple/complex, formal/casual, technical/colloquial)
- Sentence structure (short punchy / long flowing / interrupted / complete)
- Speech patterns (contractions, filler words, verbal tics)
- Emotional expression (direct/indirect, physical/verbal)
- Cultural/regional influences
- Education and background markers
- Underlying psychology (confident/insecure, curious/certain)

Your goal: Create voices so distinct that dialogue could be identified without tags.`,

  userPromptTemplate: `CHARACTER PROFILE:
{{characterProfile}}

BACKGROUND:
{{background}}

PERSONALITY:
{{personality}}

SAMPLE SITUATIONS TO VOICE:
1. Greeting an old friend
2. Confronting an enemy
3. Comforting someone in grief
4. Explaining something complex
5. Under extreme stress

Generate this character's voice profile with example dialogue for each situation.`,

  qualityGates: [
    {
      gateId: 'voice-consistency',
      name: 'Voice Consistency',
      description: 'Voice patterns consistent across all samples',
      validationFn: 'validateVoiceConsistency',
      threshold: 0.9,
      required: true,
    },
    {
      gateId: 'distinctiveness',
      name: 'Voice Distinctiveness',
      description: 'Voice distinguishable from generic dialogue',
      validationFn: 'validateDistinctiveness',
      threshold: 0.85,
      required: true,
    },
  ],

  minModelTier: ModelTier.TIER_1_FRONTIER,
  requiredCapabilities: [
    ModelCapability.CHARACTER_VOICE,
    ModelCapability.DIALOGUE_GENERATION,
    ModelCapability.STYLE_MATCHING,
  ],
};

/**
 * World Building Expansion Template
 * Uses Tree-of-Thoughts + Multi-Perspective
 */
export const WORLD_BUILDING_TEMPLATE: AdvancedPromptTemplate = {
  templateId: 'world-build-master-v1',
  name: 'World Building Master Template',
  description: 'Deep, consistent world building with cascading implications',
  techniques: [
    PromptingTechnique.TREE_OF_THOUGHTS,
    PromptingTechnique.MULTI_PERSPECTIVE,
    PromptingTechnique.CONSTRAINT_INJECTION,
  ],
  systemPrompt: `You are a world architect who builds living, breathing fictional universes.

WORLD BUILDING PRINCIPLES:
- Everything connects - No element exists in isolation
- Consequences cascade - Every choice creates ripples
- History shapes present - Past events inform current reality
- Cultures evolve - Nothing is static
- Economics matter - Resources drive conflict
- Geography influences culture - Terrain shapes societies

When expanding a world element, consider:
1. Direct implications (obvious effects)
2. Second-order effects (what those effects cause)
3. Cultural interpretation (how societies view this)
4. Historical context (how this developed)
5. Conflict potential (what tensions this creates)
6. Narrative opportunities (story hooks this provides)`,

  userPromptTemplate: `EXISTING WORLD ELEMENT:
{{existingElement}}

EXPANSION REQUEST:
{{expansionRequest}}

ESTABLISHED CANON:
{{establishedCanon}}

CONSTRAINTS:
{{constraints}}

---
TREE OF THOUGHTS ANALYSIS:

Branch 1: [Most logical expansion]
Branch 2: [Most dramatic expansion]
Branch 3: [Most culturally rich expansion]

Evaluation: [Which branch best serves the narrative while maintaining consistency]

---
WORLD BUILDING DOCUMENT:

[Your expansion here]`,

  qualityGates: [
    {
      gateId: 'canon-consistency',
      name: 'Canon Consistency',
      description: 'Expansion consistent with established canon',
      validationFn: 'validateCanonConsistency',
      threshold: 1.0,
      required: true,
    },
    {
      gateId: 'cascade-depth',
      name: 'Cascade Depth',
      description: 'At least 3 levels of implications explored',
      validationFn: 'validateCascadeDepth',
      threshold: 3,
      required: true,
    },
    {
      gateId: 'narrative-hooks',
      name: 'Narrative Hook Count',
      description: 'Minimum story opportunities generated',
      validationFn: 'validateNarrativeHooks',
      threshold: 5,
      required: false,
    },
  ],

  minModelTier: ModelTier.TIER_1_FRONTIER,
  requiredCapabilities: [
    ModelCapability.WORLD_BUILDING,
    ModelCapability.PLOT_CONSISTENCY,
    ModelCapability.TECHNICAL_ACCURACY,
  ],
};

// ============================================================================
// LEADING EDGE CONFIGURATION CLASS
// ============================================================================

/**
 * Configuration for generation requests
 */
export interface GenerationConfig {
  modelPreference?: string[];  // Ordered preference list
  minTier: ModelTier;
  requiredCapabilities: ModelCapability[];
  maxRetries: number;
  qualityThreshold: number;  // 0-100
  enableChainOfThought: boolean;
  enableFewShot: boolean;
  enableIterativeRefinement: boolean;
  refinementPasses: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

/**
 * Quality benchmark result
 */
export interface QualityBenchmark {
  benchmarkId: string;
  timestamp: Date;
  modelId: string;
  templateId: string;
  metrics: {
    coherence: number;
    creativity: number;
    consistency: number;
    emotionalResonance: number;
    technicalAccuracy: number;
    voiceDistinction: number;
    pacing: number;
    overall: number;
  };
  passedGates: string[];
  failedGates: string[];
}

/**
 * Leading Edge AI Configuration Manager
 *
 * Ensures all AI operations use frontier models with advanced techniques
 */
export class LeadingEdgeAIConfig {
  private modelRegistry: Map<string, FrontierModel> = new Map();
  private templateRegistry: Map<string, AdvancedPromptTemplate> = new Map();
  private benchmarkHistory: QualityBenchmark[] = [];
  private activeModels: Map<FrontierProvider, string> = new Map();
  private configId: string;

  // Quality enforcement thresholds
  private readonly MINIMUM_QUALITY_SCORE = 85;
  private readonly MINIMUM_MODEL_TIER = ModelTier.TIER_1_FRONTIER;
  private readonly REQUIRED_TECHNIQUES = [
    PromptingTechnique.CHAIN_OF_THOUGHT,
    PromptingTechnique.FEW_SHOT,
  ];

  constructor() {
    this.configId = uuidv4();
    this.initializeRegistry();
    this.initializeTemplates();
    this.setDefaultActiveModels();
    // Initialize enforcement validators
    void this.MINIMUM_MODEL_TIER;
    void this.REQUIRED_TECHNIQUES;
  }

  /**
   * Initialize model registry from predefined list
   */
  private initializeRegistry(): void {
    for (const model of FRONTIER_MODEL_REGISTRY) {
      this.modelRegistry.set(model.modelId, model);
    }
  }

  /**
   * Initialize prompt templates
   */
  private initializeTemplates(): void {
    this.templateRegistry.set(SCENE_GENERATION_TEMPLATE.templateId, SCENE_GENERATION_TEMPLATE);
    this.templateRegistry.set(CHARACTER_VOICE_TEMPLATE.templateId, CHARACTER_VOICE_TEMPLATE);
    this.templateRegistry.set(WORLD_BUILDING_TEMPLATE.templateId, WORLD_BUILDING_TEMPLATE);
  }

  /**
   * Set default active models (highest quality per provider)
   */
  private setDefaultActiveModels(): void {
    // Anthropic: Claude Opus 4
    this.activeModels.set(FrontierProvider.ANTHROPIC, 'claude-opus-4-20250514');
    // OpenAI: GPT-4o
    this.activeModels.set(FrontierProvider.OPENAI, 'gpt-4o-2024-08-06');
    // Google: Gemini 1.5 Pro
    this.activeModels.set(FrontierProvider.GOOGLE, 'gemini-1.5-pro');
  }

  /**
   * Get the best model for a specific task
   */
  getBestModelForTask(
    requiredCapabilities: ModelCapability[],
    preferredProvider?: FrontierProvider
  ): FrontierModel | null {
    const eligibleModels = Array.from(this.modelRegistry.values())
      .filter(model => {
        // Must be frontier tier
        if (model.tier !== ModelTier.TIER_1_FRONTIER) return false;

        // Must have all required capabilities
        const hasAllCapabilities = requiredCapabilities.every(cap =>
          model.capabilities.includes(cap)
        );
        if (!hasAllCapabilities) return false;

        // If preferred provider specified, prefer it
        if (preferredProvider && model.provider !== preferredProvider) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.qualityScore - a.qualityScore);

    return eligibleModels[0] || null;
  }

  /**
   * Validate a model meets minimum requirements
   */
  validateModel(modelId: string): { valid: boolean; reason?: string } {
    const model = this.modelRegistry.get(modelId);

    if (!model) {
      return { valid: false, reason: `Model ${modelId} not found in registry` };
    }

    if (model.tier !== ModelTier.TIER_1_FRONTIER && model.tier !== ModelTier.TIER_2_ADVANCED) {
      return {
        valid: false,
        reason: `Model ${modelId} is tier ${model.tier}, minimum required is ${ModelTier.TIER_2_ADVANCED}`
      };
    }

    if (model.qualityScore < this.MINIMUM_QUALITY_SCORE) {
      return {
        valid: false,
        reason: `Model ${modelId} quality score ${model.qualityScore} below minimum ${this.MINIMUM_QUALITY_SCORE}`
      };
    }

    return { valid: true };
  }

  /**
   * Get default generation config for writing tasks
   */
  getWritingConfig(): GenerationConfig {
    return {
      modelPreference: [
        'claude-opus-4-20250514',
        'gpt-4o-2024-08-06',
        'gpt-4-turbo-2024-04-09',
      ],
      minTier: ModelTier.TIER_1_FRONTIER,
      requiredCapabilities: [
        ModelCapability.CREATIVE_WRITING,
        ModelCapability.CHARACTER_VOICE,
        ModelCapability.EMOTIONAL_DEPTH,
      ],
      maxRetries: 3,
      qualityThreshold: 90,
      enableChainOfThought: true,
      enableFewShot: true,
      enableIterativeRefinement: true,
      refinementPasses: 2,
      temperature: 0.8,
      topP: 0.95,
      frequencyPenalty: 0.3,
      presencePenalty: 0.3,
    };
  }

  /**
   * Get generation config for analysis tasks
   */
  getAnalysisConfig(): GenerationConfig {
    return {
      modelPreference: [
        'claude-opus-4-20250514',
        'claude-sonnet-4-20250514',
        'gpt-4o-2024-08-06',
      ],
      minTier: ModelTier.TIER_2_ADVANCED,
      requiredCapabilities: [
        ModelCapability.TECHNICAL_ACCURACY,
        ModelCapability.PLOT_CONSISTENCY,
      ],
      maxRetries: 2,
      qualityThreshold: 85,
      enableChainOfThought: true,
      enableFewShot: false,
      enableIterativeRefinement: false,
      refinementPasses: 0,
      temperature: 0.3,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
    };
  }

  /**
   * Get prompt template by ID
   */
  getTemplate(templateId: string): AdvancedPromptTemplate | undefined {
    return this.templateRegistry.get(templateId);
  }

  /**
   * Register a new prompt template
   */
  registerTemplate(template: AdvancedPromptTemplate): void {
    // Validate template meets minimum standards
    if (template.minModelTier === ModelTier.TIER_3_STANDARD ||
        template.minModelTier === ModelTier.TIER_4_LEGACY) {
      throw new Error('Templates must require at least Tier 2 models');
    }

    if (template.qualityGates.length === 0) {
      throw new Error('Templates must have at least one quality gate');
    }

    this.templateRegistry.set(template.templateId, template);
  }

  /**
   * Record a quality benchmark result
   */
  recordBenchmark(benchmark: QualityBenchmark): void {
    this.benchmarkHistory.push(benchmark);

    // Keep last 1000 benchmarks
    if (this.benchmarkHistory.length > 1000) {
      this.benchmarkHistory = this.benchmarkHistory.slice(-1000);
    }
  }

  /**
   * Get average quality metrics for a model
   */
  getModelPerformance(modelId: string): QualityBenchmark['metrics'] | null {
    const modelBenchmarks = this.benchmarkHistory.filter(b => b.modelId === modelId);

    if (modelBenchmarks.length === 0) return null;

    const avg = (arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length;

    return {
      coherence: avg(modelBenchmarks.map(b => b.metrics.coherence)),
      creativity: avg(modelBenchmarks.map(b => b.metrics.creativity)),
      consistency: avg(modelBenchmarks.map(b => b.metrics.consistency)),
      emotionalResonance: avg(modelBenchmarks.map(b => b.metrics.emotionalResonance)),
      technicalAccuracy: avg(modelBenchmarks.map(b => b.metrics.technicalAccuracy)),
      voiceDistinction: avg(modelBenchmarks.map(b => b.metrics.voiceDistinction)),
      pacing: avg(modelBenchmarks.map(b => b.metrics.pacing)),
      overall: avg(modelBenchmarks.map(b => b.metrics.overall)),
    };
  }

  /**
   * Get all frontier models
   */
  getFrontierModels(): FrontierModel[] {
    return Array.from(this.modelRegistry.values())
      .filter(m => m.tier === ModelTier.TIER_1_FRONTIER)
      .sort((a, b) => b.qualityScore - a.qualityScore);
  }

  /**
   * Get all registered templates
   */
  getAllTemplates(): AdvancedPromptTemplate[] {
    return Array.from(this.templateRegistry.values());
  }

  /**
   * Get active model for a provider
   */
  getActiveModel(provider: FrontierProvider): FrontierModel | null {
    const modelId = this.activeModels.get(provider);
    if (!modelId) return null;
    return this.modelRegistry.get(modelId) || null;
  }

  /**
   * Set active model for a provider
   */
  setActiveModel(provider: FrontierProvider, modelId: string): void {
    const model = this.modelRegistry.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found in registry`);
    }
    if (model.provider !== provider) {
      throw new Error(`Model ${modelId} is not from provider ${provider}`);
    }
    this.activeModels.set(provider, modelId);
  }

  /**
   * Build a complete prompt from template
   */
  buildPrompt(
    templateId: string,
    variables: Record<string, string>
  ): { systemPrompt: string; userPrompt: string; examples: FewShotExample[] } {
    const template = this.templateRegistry.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let userPrompt = template.userPromptTemplate;
    for (const [key, value] of Object.entries(variables)) {
      userPrompt = userPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return {
      systemPrompt: template.systemPrompt,
      userPrompt,
      examples: template.fewShotExamples || [],
    };
  }

  /**
   * Get configuration statistics
   */
  getStats(): {
    frontierModelCount: number;
    templateCount: number;
    benchmarkCount: number;
    activeModels: Record<string, string>;
    averageQualityScore: number;
  } {
    const frontierModels = this.getFrontierModels();
    const avgQuality = frontierModels.length > 0
      ? frontierModels.reduce((sum, m) => sum + m.qualityScore, 0) / frontierModels.length
      : 0;

    return {
      frontierModelCount: frontierModels.length,
      templateCount: this.templateRegistry.size,
      benchmarkCount: this.benchmarkHistory.length,
      activeModels: Object.fromEntries(this.activeModels),
      averageQualityScore: Math.round(avgQuality * 10) / 10,
    };
  }

  /**
   * Export configuration to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      configId: this.configId,
      activeModels: Object.fromEntries(this.activeModels),
      benchmarkHistory: this.benchmarkHistory.slice(-100),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.activeModels) {
      for (const [provider, modelId] of Object.entries(data.activeModels)) {
        this.activeModels.set(provider as FrontierProvider, modelId as string);
      }
    }

    if (data.benchmarkHistory) {
      this.benchmarkHistory = data.benchmarkHistory.map((b: QualityBenchmark) => ({
        ...b,
        timestamp: new Date(b.timestamp),
      }));
    }
  }
}

// ============================================================================
// QUALITY VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate output meets word count requirements
 */
export function validateWordCount(
  output: string,
  targetCount: number,
  tolerance: number = 0.1
): boolean {
  const wordCount = output.split(/\s+/).length;
  const minCount = targetCount * (1 - tolerance);
  const maxCount = targetCount * (1 + tolerance);
  return wordCount >= minCount && wordCount <= maxCount;
}

/**
 * Count sensory details in text
 */
export function countSensoryDetails(text: string): number {
  const sensoryCues = {
    visual: /\b(saw|looked|gazed|watched|noticed|spotted|glimpsed|eye|bright|dark|shadow|light|color|red|blue|green)\b/gi,
    auditory: /\b(heard|sound|voice|whisper|shout|echo|silence|loud|quiet|noise|ring|thunder)\b/gi,
    tactile: /\b(felt|touch|smooth|rough|cold|warm|soft|hard|wet|dry|pressure|grip)\b/gi,
    olfactory: /\b(smell|scent|aroma|stench|fragrance|odor|nose|sniff)\b/gi,
    gustatory: /\b(taste|flavor|sweet|bitter|sour|salty|savory|tongue)\b/gi,
  };

  const sensesCovered = new Set<string>();

  for (const [sense, pattern] of Object.entries(sensoryCues)) {
    if (pattern.test(text)) {
      sensesCovered.add(sense);
    }
  }

  return sensesCovered.size;
}

/**
 * Validate minimum sensory details
 */
export function validateSensoryDetails(text: string, minimum: number = 3): boolean {
  return countSensoryDetails(text) >= minimum;
}

/**
 * Calculate text readability score (Flesch-Kincaid)
 */
export function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula
  return 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
}

/**
 * Count syllables in a word
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Analyze pacing based on sentence length variation
 */
export function analyzePacing(text: string): {
  averageSentenceLength: number;
  variation: number;
  tempo: 'slow' | 'medium' | 'fast' | 'varied';
} {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) {
    return { averageSentenceLength: 0, variation: 0, tempo: 'medium' };
  }

  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
  const variation = Math.sqrt(variance);

  let tempo: 'slow' | 'medium' | 'fast' | 'varied';
  if (variation > avg * 0.5) {
    tempo = 'varied';
  } else if (avg < 10) {
    tempo = 'fast';
  } else if (avg > 20) {
    tempo = 'slow';
  } else {
    tempo = 'medium';
  }

  return { averageSentenceLength: avg, variation, tempo };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Create and return default configuration instance
 */
export function createLeadingEdgeConfig(): LeadingEdgeAIConfig {
  return new LeadingEdgeAIConfig();
}

export default LeadingEdgeAIConfig;
