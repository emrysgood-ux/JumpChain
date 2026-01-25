/**
 * WritingGenerationEngine - AI-Assisted Content Generation
 *
 * Provides intelligent writing assistance for 300M+ word narratives:
 * - Scene generation from prompts with context awareness
 * - Dialogue generation maintaining character voice consistency
 * - Narrative continuation with plot coherence
 * - Integration with all tracking engines
 * - Advanced prompting with chain-of-thought and few-shot learning
 * - Iterative refinement for maximum quality
 *
 * REQUIRES frontier AI models for all generation tasks.
 * Integrates with LeadingEdgeAIConfig for model management.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  LeadingEdgeAIConfig,
  FrontierModel,
  ModelCapability,
  PromptingTechnique,
  AdvancedPromptTemplate,
  QualityBenchmark,
  validateWordCount,
  countSensoryDetails,
  calculateReadability,
  analyzePacing,
} from '../../config/leading-edge-ai';

// ============================================================================
// AI Provider Configuration
// ============================================================================

export enum AIProviderTier {
  TIER_1_FRONTIER = 'tier_1_frontier',   // Claude Opus 4, GPT-4+, Gemini Ultra
  TIER_2_ADVANCED = 'tier_2_advanced',   // Claude Sonnet, GPT-4-mini
  TIER_3_STANDARD = 'tier_3_standard',   // BLOCKED for generation
  TIER_4_BASIC = 'tier_4_basic',         // NEVER ALLOWED
}

export interface AIProviderConfig {
  providerId: string;
  providerName: string;
  tier: AIProviderTier;
  modelId: string;
  contextWindow: number;
  maxOutputTokens: number;
  supportedCapabilities: GenerationCapability[];
  costPer1kTokens: { input: number; output: number };
}

export const APPROVED_PROVIDERS: AIProviderConfig[] = [
  {
    providerId: 'anthropic-opus',
    providerName: 'Anthropic Claude Opus 4',
    tier: AIProviderTier.TIER_1_FRONTIER,
    modelId: 'claude-opus-4-5-20251101',
    contextWindow: 200000,
    maxOutputTokens: 32000,
    supportedCapabilities: ['scene', 'dialogue', 'continuation', 'outline', 'brainstorm', 'revision', 'voice_match'],
    costPer1kTokens: { input: 0.015, output: 0.075 }
  },
  {
    providerId: 'openai-gpt4',
    providerName: 'OpenAI GPT-4 Turbo',
    tier: AIProviderTier.TIER_1_FRONTIER,
    modelId: 'gpt-4-turbo-preview',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportedCapabilities: ['scene', 'dialogue', 'continuation', 'outline', 'brainstorm', 'revision', 'voice_match'],
    costPer1kTokens: { input: 0.01, output: 0.03 }
  },
  {
    providerId: 'anthropic-sonnet',
    providerName: 'Anthropic Claude Sonnet',
    tier: AIProviderTier.TIER_2_ADVANCED,
    modelId: 'claude-sonnet-4-20250514',
    contextWindow: 200000,
    maxOutputTokens: 16000,
    supportedCapabilities: ['scene', 'dialogue', 'continuation', 'outline', 'brainstorm'],
    costPer1kTokens: { input: 0.003, output: 0.015 }
  },
];

// ============================================================================
// Generation Types
// ============================================================================

export type GenerationCapability =
  | 'scene'
  | 'dialogue'
  | 'continuation'
  | 'outline'
  | 'brainstorm'
  | 'revision'
  | 'voice_match';

export enum GenerationType {
  SCENE = 'scene',
  DIALOGUE = 'dialogue',
  CONTINUATION = 'continuation',
  OUTLINE = 'outline',
  BRAINSTORM = 'brainstorm',
  REVISION = 'revision',
  CHAPTER = 'chapter',
  SCENE_BATCH = 'scene_batch',
}

export enum SceneType {
  ACTION = 'action',
  DIALOGUE_HEAVY = 'dialogue_heavy',
  INTERNAL_REFLECTION = 'internal_reflection',
  DISCOVERY = 'discovery',
  TRAINING = 'training',
  ROMANTIC = 'romantic',
  POLITICAL = 'political',
  COMEDIC = 'comedic',
  EMOTIONAL_CLIMAX = 'emotional_climax',
  TRANSITION = 'transition',
  WORLDBUILDING = 'worldbuilding',
  CONFLICT = 'conflict',
}

export enum ToneType {
  SERIOUS = 'serious',
  LIGHT = 'light',
  TENSE = 'tense',
  MELANCHOLIC = 'melancholic',
  TRIUMPHANT = 'triumphant',
  MYSTERIOUS = 'mysterious',
  ROMANTIC = 'romantic',
  COMEDIC = 'comedic',
  EPIC = 'epic',
  INTIMATE = 'intimate',
  OMINOUS = 'ominous',
  HOPEFUL = 'hopeful',
}

export enum PacingType {
  FAST = 'fast',
  MODERATE = 'moderate',
  SLOW = 'slow',
  BUILDING = 'building',
  CLIMACTIC = 'climactic',
  DENOUEMENT = 'denouement',
}

// ============================================================================
// Character Voice Profiles
// ============================================================================

export interface CharacterVoiceProfile {
  characterId: string;
  characterName: string;

  // Speech patterns
  vocabularyLevel: 'simple' | 'moderate' | 'sophisticated' | 'archaic' | 'technical';
  sentenceComplexity: 'short' | 'moderate' | 'complex' | 'varied';
  favoredExpressions: string[];
  avoidedWords: string[];
  speechQuirks: string[];
  accentOrDialect?: string;

  // Internal voice
  thoughtPatterns: string[];
  internalTone: ToneType;
  introspectionStyle: 'analytical' | 'emotional' | 'practical' | 'philosophical';

  // Emotional expression
  emotionalRange: number; // 0-1, how openly they express emotions
  defaultEmotionalState: string;
  stressResponse: 'withdrawn' | 'aggressive' | 'analytical' | 'humor' | 'denial';

  // Relationships affect speech
  formalWithStrangers: boolean;
  informalWithFriends: boolean;
  respectfulToAuthority: boolean;

  // Sample passages for voice matching
  sampleDialogues: string[];
  sampleNarration: string[];

  // Canon source tracking
  isCanonCharacter: boolean;
  canonSource?: string;
  divergenceNotes?: string;
}

// ============================================================================
// Scene Context
// ============================================================================

export interface SceneContext {
  // Location and time
  locationId: string;
  locationName: string;
  locationDescription: string;
  timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'midnight';
  weather?: string;
  ambiance?: string;

  // Characters present
  charactersPresent: {
    characterId: string;
    characterName: string;
    role: 'pov' | 'major' | 'minor' | 'background';
    currentMood: string;
    currentGoal?: string;
    secrets?: string[];
  }[];

  // Plot context
  currentPlotThreads: {
    threadId: string;
    threadName: string;
    currentState: string;
    relevanceToScene: number; // 0-1
  }[];

  // Recent events affecting this scene
  recentEvents: {
    eventDescription: string;
    chaptersAgo: number;
    emotionalImpact: number; // -1 to 1
    charactersAffected: string[];
  }[];

  // Foreshadowing to plant
  foreshadowingToPlant?: {
    futureEvent: string;
    subtlety: 'obvious' | 'moderate' | 'subtle' | 'hidden';
  }[];

  // Callbacks to previous setups
  setupsToPayoff?: {
    setupDescription: string;
    setupChapter: number;
    payoffIntensity: 'minor' | 'moderate' | 'major';
  }[];
}

// ============================================================================
// Generation Requests
// ============================================================================

export interface GenerationRequest {
  requestId: string;
  type: GenerationType;
  createdAt: Date;

  // Context
  projectId: string;
  bookId: string;
  chapterId?: string;
  sceneNumber?: number;

  // Core parameters
  prompt: string;
  sceneType?: SceneType;
  tone?: ToneType;
  pacing?: PacingType;

  // Length targets
  targetWordCount: {
    minimum: number;
    target: number;
    maximum: number;
  };

  // Character focus
  povCharacterId?: string;
  involvedCharacterIds: string[];

  // Context injection
  sceneContext?: SceneContext;
  voiceProfiles?: CharacterVoiceProfile[];

  // Quality requirements
  qualityThreshold: number; // 0-100
  requiredElements: string[];
  forbiddenElements: string[];

  // Generation settings
  temperature: number; // 0-1
  creativityLevel: 'conservative' | 'moderate' | 'creative' | 'experimental';
  styleGuidelines?: string[];
}

export interface DialogueGenerationRequest extends GenerationRequest {
  type: GenerationType.DIALOGUE;

  // Dialogue-specific
  participantIds: string[];
  conversationGoal: string;
  tension: number; // 0-1
  subtext?: string;
  revealedSecrets?: string[];
  emotionalBeats: { character: string; emotion: string; beat: number }[];

  // Constraints
  maxExchanges?: number;
  mustIncludeLines?: { character: string; line: string }[];
  mustAvoidTopics?: string[];
}

export interface ContinuationRequest extends GenerationRequest {
  type: GenerationType.CONTINUATION;

  // What to continue from
  precedingText: string;
  precedingWordCount: number;

  // Continuation goals
  continueTowardEvent?: string;
  maintainMomentum: boolean;
  transitionNeeded?: string;
}

export interface BatchSceneRequest {
  batchId: string;
  projectId: string;
  bookId: string;
  chapterId: string;

  // Batch configuration
  scenesToGenerate: number;
  characterId: string;

  // Distribution (must sum to scenesToGenerate)
  sceneTypeDistribution: Map<SceneType, number>;

  // Shared context
  chapterGoal: string;
  chapterTone: ToneType;
  sharedContext: SceneContext;

  // Individual scene briefs
  sceneBriefs: {
    sceneIndex: number;
    type: SceneType;
    brief: string;
    wordTarget: number;
  }[];
}

// ============================================================================
// Generation Results
// ============================================================================

export interface GenerationResult {
  resultId: string;
  requestId: string;
  generatedAt: Date;

  // Provider info
  providerId: string;
  modelUsed: string;

  // Generated content
  content: string;
  wordCount: number;

  // Quality metrics
  qualityScore: number;
  voiceConsistencyScore?: number;
  plotCoherenceScore?: number;
  emotionalImpactScore?: number;

  // Token usage
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  estimatedCost: number;

  // Generation metadata
  generationTimeMs: number;
  temperature: number;

  // Elements detected
  elementsIncluded: string[];
  elementsMissing: string[];

  // Warnings
  warnings: string[];

  // Revision suggestions
  suggestedRevisions?: string[];
}

export interface BatchGenerationResult {
  batchId: string;
  completedAt: Date;

  totalScenes: number;
  successfulScenes: number;
  failedScenes: number;

  results: GenerationResult[];

  totalWordCount: number;
  averageQualityScore: number;
  totalCost: number;
  totalTimeMs: number;
}

// ============================================================================
// Writing Rules Integration
// ============================================================================

export interface WritingRule {
  ruleId: string;
  ruleName: string;
  category: 'prose' | 'dialogue' | 'structure' | 'voice' | 'pacing' | 'content';

  description: string;
  enforcement: 'strict' | 'moderate' | 'guideline';

  // Rule definition
  checkType: 'regex' | 'semantic' | 'statistical' | 'custom';
  checkPattern?: string;
  checkFunction?: (text: string, context: SceneContext) => { passed: boolean; issues: string[] };

  // Auto-fix capability
  canAutoFix: boolean;
  autoFixFunction?: (text: string) => string;
}

export const DEFAULT_WRITING_RULES: WritingRule[] = [
  {
    ruleId: 'no-adverb-dialogue-tags',
    ruleName: 'No Adverbs in Dialogue Tags',
    category: 'prose',
    description: 'Avoid adverbs in dialogue tags (said angrily, whispered softly)',
    enforcement: 'strict',
    checkType: 'regex',
    checkPattern: '\\b(said|whispered|shouted|replied|asked|answered|murmured|muttered)\\s+\\w+ly\\b',
    canAutoFix: false,
  },
  {
    ruleId: 'show-dont-tell',
    ruleName: 'Show Don\'t Tell',
    category: 'prose',
    description: 'Avoid direct emotion statements, show through action',
    enforcement: 'moderate',
    checkType: 'regex',
    checkPattern: '\\b(felt|was feeling|seemed to feel)\\s+(happy|sad|angry|scared|nervous|excited)\\b',
    canAutoFix: false,
  },
  {
    ruleId: 'avoid-filter-words',
    ruleName: 'Avoid Filter Words',
    category: 'prose',
    description: 'Minimize filter words that distance reader from experience',
    enforcement: 'moderate',
    checkType: 'regex',
    checkPattern: '\\b(saw|heard|felt|noticed|realized|knew|thought|wondered|decided)\\s+that\\b',
    canAutoFix: false,
  },
  {
    ruleId: 'vary-sentence-length',
    ruleName: 'Vary Sentence Length',
    category: 'pacing',
    description: 'Mix short and long sentences for rhythm',
    enforcement: 'guideline',
    checkType: 'statistical',
    canAutoFix: false,
  },
  {
    ruleId: 'unique-dialogue-voices',
    ruleName: 'Unique Character Voices',
    category: 'voice',
    description: 'Each character should have distinct speech patterns',
    enforcement: 'strict',
    checkType: 'semantic',
    canAutoFix: false,
  },
];

// ============================================================================
// Prompt Templates
// ============================================================================

export interface PromptTemplate {
  templateId: string;
  templateName: string;
  generationType: GenerationType;
  sceneType?: SceneType;

  template: string;
  variables: string[];

  // Quality modifiers
  qualityInstructions: string;
  styleInstructions: string;
}

const SCENE_GENERATION_TEMPLATE = `
You are writing a scene for an epic 300M+ word narrative called "{{projectName}}".

## Scene Parameters
- Scene Type: {{sceneType}}
- Tone: {{tone}}
- Pacing: {{pacing}}
- Target Word Count: {{targetWordCount}} words (minimum {{minWordCount}})

## POV Character
{{povCharacterProfile}}

## Characters Present
{{charactersPresent}}

## Location
{{locationDescription}}
Time: {{timeOfDay}}
{{weather}}
{{ambiance}}

## Plot Context
Current active plot threads:
{{plotThreads}}

Recent events affecting this scene:
{{recentEvents}}

## Scene Goal
{{sceneGoal}}

## Required Elements
{{requiredElements}}

## Forbidden Elements
{{forbiddenElements}}

{{foreshadowingInstructions}}
{{payoffInstructions}}

## Writing Guidelines
- Maintain consistent character voices as defined in profiles
- Show emotions through action, dialogue, and body language
- Avoid adverbs in dialogue tags
- Vary sentence length for rhythm
- Ground the reader in the sensory details of the setting
- Every scene must advance plot, character, or both

## Generate the Scene
Write the complete scene, hitting the target word count while maintaining quality.
`;

const DIALOGUE_GENERATION_TEMPLATE = `
You are writing dialogue for an epic narrative.

## Conversation Parameters
- Participants: {{participants}}
- Conversation Goal: {{conversationGoal}}
- Tension Level: {{tensionLevel}}/10
- Subtext: {{subtext}}

## Character Voice Profiles
{{voiceProfiles}}

## Context
{{sceneContext}}

## Emotional Beats to Hit
{{emotionalBeats}}

## Required Lines
{{requiredLines}}

## Topics to Avoid
{{avoidTopics}}

## Guidelines
- Each character must sound distinct based on their voice profile
- Subtext should be present - characters rarely say exactly what they mean
- Use action beats between dialogue to show character reactions
- Vary dialogue length - not every response should be the same size
- Include natural interruptions and overlapping speech where appropriate

## Generate the Dialogue
Write the complete dialogue exchange.
`;

// ============================================================================
// Main Engine
// ============================================================================

export class WritingGenerationEngine {
  private requests: Map<string, GenerationRequest> = new Map();
  private results: Map<string, GenerationResult> = new Map();
  private voiceProfiles: Map<string, CharacterVoiceProfile> = new Map();
  private writingRules: Map<string, WritingRule> = new Map();
  private promptTemplates: Map<string, PromptTemplate> = new Map();

  // Indexes
  private resultsByRequest: Map<string, string[]> = new Map();
  private resultsByCharacter: Map<string, string[]> = new Map();
  private resultsByChapter: Map<string, string[]> = new Map();

  // Statistics
  private totalGenerations: number = 0;
  private totalWordCount: number = 0;
  private totalCost: number = 0;
  private totalTokens: number = 0;

  // Production tracking configuration
  // Default: 0 (disabled) - set to a reasonable target like 3-10 for daily quotas
  // Note: 299 is the total scenes for Chapter 1, NOT a daily per-character requirement
  private minimumDailyScenesPerCharacter: number = 0;

  // Active provider
  private activeProvider: AIProviderConfig | null = null;

  constructor() {
    this.initializeDefaultRules();
    this.initializeDefaultTemplates();
  }

  // ============================================================================
  // Production Configuration
  // ============================================================================

  /**
   * Set the minimum daily scene generation target per character.
   * Default is 0 (disabled). Recommended range: 3-10 for active projects.
   *
   * IMPORTANT: The 299 figure refers to total scenes in Chapter 1,
   * NOT a daily per-character production requirement.
   */
  setMinimumDailyScenesPerCharacter(count: number): void {
    if (count < 0) {
      throw new Error('Minimum daily scenes cannot be negative');
    }
    this.minimumDailyScenesPerCharacter = count;
  }

  getMinimumDailyScenesPerCharacter(): number {
    return this.minimumDailyScenesPerCharacter;
  }

  // ============================================================================
  // Provider Management
  // ============================================================================

  setActiveProvider(providerId: string): void {
    const provider = APPROVED_PROVIDERS.find(p => p.providerId === providerId);
    if (!provider) {
      throw new Error(`Unknown provider: ${providerId}`);
    }

    if (provider.tier === AIProviderTier.TIER_3_STANDARD ||
        provider.tier === AIProviderTier.TIER_4_BASIC) {
      throw new Error(
        `Provider ${provider.providerName} (${provider.tier}) is BLOCKED for writing generation. ` +
        `Only Tier 1 (Frontier) and Tier 2 (Advanced) models are allowed.`
      );
    }

    this.activeProvider = provider;
  }

  getActiveProvider(): AIProviderConfig | null {
    return this.activeProvider;
  }

  validateProviderForCapability(capability: GenerationCapability): void {
    if (!this.activeProvider) {
      throw new Error('No AI provider configured. Call setActiveProvider() first.');
    }

    if (!this.activeProvider.supportedCapabilities.includes(capability)) {
      throw new Error(
        `Provider ${this.activeProvider.providerName} does not support ${capability}. ` +
        `Supported: ${this.activeProvider.supportedCapabilities.join(', ')}`
      );
    }
  }

  // ============================================================================
  // Voice Profile Management
  // ============================================================================

  registerVoiceProfile(profile: CharacterVoiceProfile): void {
    this.voiceProfiles.set(profile.characterId, profile);
  }

  getVoiceProfile(characterId: string): CharacterVoiceProfile | undefined {
    return this.voiceProfiles.get(characterId);
  }

  updateVoiceProfile(
    characterId: string,
    updates: Partial<CharacterVoiceProfile>
  ): CharacterVoiceProfile {
    const existing = this.voiceProfiles.get(characterId);
    if (!existing) {
      throw new Error(`Voice profile not found: ${characterId}`);
    }

    const updated = { ...existing, ...updates };
    this.voiceProfiles.set(characterId, updated);
    return updated;
  }

  addSampleDialogue(characterId: string, dialogue: string): void {
    const profile = this.voiceProfiles.get(characterId);
    if (!profile) {
      throw new Error(`Voice profile not found: ${characterId}`);
    }

    profile.sampleDialogues.push(dialogue);
  }

  addSampleNarration(characterId: string, narration: string): void {
    const profile = this.voiceProfiles.get(characterId);
    if (!profile) {
      throw new Error(`Voice profile not found: ${characterId}`);
    }

    profile.sampleNarration.push(narration);
  }

  // ============================================================================
  // Writing Rules Management
  // ============================================================================

  private initializeDefaultRules(): void {
    DEFAULT_WRITING_RULES.forEach(rule => {
      this.writingRules.set(rule.ruleId, rule);
    });
  }

  addWritingRule(rule: WritingRule): void {
    this.writingRules.set(rule.ruleId, rule);
  }

  removeWritingRule(ruleId: string): boolean {
    return this.writingRules.delete(ruleId);
  }

  checkAgainstRules(text: string, context: SceneContext): {
    passed: boolean;
    violations: { ruleId: string; ruleName: string; issues: string[] }[];
  } {
    const violations: { ruleId: string; ruleName: string; issues: string[] }[] = [];

    for (const [ruleId, rule] of this.writingRules) {
      if (rule.checkType === 'regex' && rule.checkPattern) {
        const regex = new RegExp(rule.checkPattern, 'gi');
        const matches = text.match(regex);

        if (matches && matches.length > 0) {
          violations.push({
            ruleId,
            ruleName: rule.ruleName,
            issues: matches.map(m => `Found: "${m}"`)
          });
        }
      } else if (rule.checkType === 'custom' && rule.checkFunction) {
        const result = rule.checkFunction(text, context);
        if (!result.passed) {
          violations.push({
            ruleId,
            ruleName: rule.ruleName,
            issues: result.issues
          });
        }
      }
      // semantic and statistical checks would require AI analysis
    }

    return {
      passed: violations.filter(v =>
        this.writingRules.get(v.ruleId)?.enforcement === 'strict'
      ).length === 0,
      violations
    };
  }

  // ============================================================================
  // Template Management
  // ============================================================================

  private initializeDefaultTemplates(): void {
    this.promptTemplates.set('scene-default', {
      templateId: 'scene-default',
      templateName: 'Default Scene Generation',
      generationType: GenerationType.SCENE,
      template: SCENE_GENERATION_TEMPLATE,
      variables: [
        'projectName', 'sceneType', 'tone', 'pacing', 'targetWordCount', 'minWordCount',
        'povCharacterProfile', 'charactersPresent', 'locationDescription', 'timeOfDay',
        'weather', 'ambiance', 'plotThreads', 'recentEvents', 'sceneGoal',
        'requiredElements', 'forbiddenElements', 'foreshadowingInstructions', 'payoffInstructions'
      ],
      qualityInstructions: 'Prioritize emotional resonance and character authenticity',
      styleInstructions: 'Match the established tone of the epic narrative'
    });

    this.promptTemplates.set('dialogue-default', {
      templateId: 'dialogue-default',
      templateName: 'Default Dialogue Generation',
      generationType: GenerationType.DIALOGUE,
      template: DIALOGUE_GENERATION_TEMPLATE,
      variables: [
        'participants', 'conversationGoal', 'tensionLevel', 'subtext',
        'voiceProfiles', 'sceneContext', 'emotionalBeats', 'requiredLines', 'avoidTopics'
      ],
      qualityInstructions: 'Each character must be distinguishable by voice alone',
      styleInstructions: 'Natural dialogue with subtext and action beats'
    });
  }

  registerTemplate(template: PromptTemplate): void {
    this.promptTemplates.set(template.templateId, template);
  }

  // ============================================================================
  // Scene Generation
  // ============================================================================

  async generateScene(request: GenerationRequest): Promise<GenerationResult> {
    this.validateProviderForCapability('scene');

    // Store request
    const requestId = request.requestId || uuidv4();
    request.requestId = requestId;
    request.createdAt = new Date();
    this.requests.set(requestId, request);

    // Build prompt
    const prompt = this.buildScenePrompt(request);

    // Generate (simulated - in real implementation, call AI API)
    const result = await this.executeGeneration(request, prompt);

    // Validate against writing rules
    if (request.sceneContext) {
      const ruleCheck = this.checkAgainstRules(result.content, request.sceneContext);
      if (!ruleCheck.passed) {
        result.warnings.push(
          `Writing rule violations: ${ruleCheck.violations.map(v => v.ruleName).join(', ')}`
        );
      }
    }

    // Store result
    this.storeResult(result, request);

    return result;
  }

  private buildScenePrompt(request: GenerationRequest): string {
    const template = this.promptTemplates.get('scene-default');
    if (!template) {
      throw new Error('Scene template not found');
    }

    let prompt = template.template;

    // Replace variables
    prompt = prompt.replace('{{sceneType}}', request.sceneType || 'general');
    prompt = prompt.replace('{{tone}}', request.tone || 'serious');
    prompt = prompt.replace('{{pacing}}', request.pacing || 'moderate');
    prompt = prompt.replace('{{targetWordCount}}', String(request.targetWordCount.target));
    prompt = prompt.replace('{{minWordCount}}', String(request.targetWordCount.minimum));

    // POV character profile
    if (request.povCharacterId && request.voiceProfiles) {
      const povProfile = request.voiceProfiles.find(p => p.characterId === request.povCharacterId);
      if (povProfile) {
        prompt = prompt.replace('{{povCharacterProfile}}', this.formatVoiceProfile(povProfile));
      }
    }

    // Scene context
    if (request.sceneContext) {
      const ctx = request.sceneContext;
      prompt = prompt.replace('{{locationDescription}}', ctx.locationDescription);
      prompt = prompt.replace('{{timeOfDay}}', ctx.timeOfDay);
      prompt = prompt.replace('{{weather}}', ctx.weather || '');
      prompt = prompt.replace('{{ambiance}}', ctx.ambiance || '');

      // Characters present
      const charsPresent = ctx.charactersPresent
        .map(c => `- ${c.characterName} (${c.role}): ${c.currentMood}, Goal: ${c.currentGoal || 'none specified'}`)
        .join('\n');
      prompt = prompt.replace('{{charactersPresent}}', charsPresent);

      // Plot threads
      const plotThreads = ctx.currentPlotThreads
        .filter(t => t.relevanceToScene > 0.3)
        .map(t => `- ${t.threadName}: ${t.currentState}`)
        .join('\n');
      prompt = prompt.replace('{{plotThreads}}', plotThreads);

      // Recent events
      const recentEvents = ctx.recentEvents
        .map(e => `- ${e.eventDescription} (${e.chaptersAgo} chapters ago)`)
        .join('\n');
      prompt = prompt.replace('{{recentEvents}}', recentEvents);
    }

    // Required and forbidden elements
    prompt = prompt.replace('{{requiredElements}}',
      request.requiredElements.map(e => `- ${e}`).join('\n') || 'None specified');
    prompt = prompt.replace('{{forbiddenElements}}',
      request.forbiddenElements.map(e => `- ${e}`).join('\n') || 'None specified');

    // Scene goal from prompt
    prompt = prompt.replace('{{sceneGoal}}', request.prompt);

    // Foreshadowing and payoff instructions
    let foreshadowingInstructions = '';
    let payoffInstructions = '';

    if (request.sceneContext?.foreshadowingToPlant?.length) {
      foreshadowingInstructions = '## Foreshadowing to Plant\n' +
        request.sceneContext.foreshadowingToPlant
          .map(f => `- ${f.futureEvent} (${f.subtlety})`)
          .join('\n');
    }

    if (request.sceneContext?.setupsToPayoff?.length) {
      payoffInstructions = '## Setups to Pay Off\n' +
        request.sceneContext.setupsToPayoff
          .map(s => `- ${s.setupDescription} from chapter ${s.setupChapter} (${s.payoffIntensity})`)
          .join('\n');
    }

    prompt = prompt.replace('{{foreshadowingInstructions}}', foreshadowingInstructions);
    prompt = prompt.replace('{{payoffInstructions}}', payoffInstructions);

    return prompt;
  }

  private formatVoiceProfile(profile: CharacterVoiceProfile): string {
    return `
Name: ${profile.characterName}
Vocabulary: ${profile.vocabularyLevel}
Sentence Style: ${profile.sentenceComplexity}
Speech Quirks: ${profile.speechQuirks.join(', ')}
Internal Tone: ${profile.internalTone}
Introspection Style: ${profile.introspectionStyle}
Emotional Range: ${profile.emotionalRange}/1 (${profile.emotionalRange < 0.3 ? 'reserved' : profile.emotionalRange > 0.7 ? 'expressive' : 'moderate'})
Stress Response: ${profile.stressResponse}
${profile.isCanonCharacter ? `Canon Source: ${profile.canonSource}\n${profile.divergenceNotes ? `Divergence: ${profile.divergenceNotes}` : ''}` : 'Original Character'}
    `.trim();
  }

  // ============================================================================
  // Dialogue Generation
  // ============================================================================

  async generateDialogue(request: DialogueGenerationRequest): Promise<GenerationResult> {
    this.validateProviderForCapability('dialogue');

    const requestId = request.requestId || uuidv4();
    request.requestId = requestId;
    request.createdAt = new Date();
    this.requests.set(requestId, request);

    const prompt = this.buildDialoguePrompt(request);
    const result = await this.executeGeneration(request, prompt);

    this.storeResult(result, request);
    return result;
  }

  private buildDialoguePrompt(request: DialogueGenerationRequest): string {
    const template = this.promptTemplates.get('dialogue-default');
    if (!template) {
      throw new Error('Dialogue template not found');
    }

    let prompt = template.template;

    // Get voice profiles for participants
    const voiceProfiles = request.participantIds
      .map(id => this.voiceProfiles.get(id))
      .filter((p): p is CharacterVoiceProfile => p !== undefined);

    prompt = prompt.replace('{{participants}}',
      voiceProfiles.map(p => p.characterName).join(', '));
    prompt = prompt.replace('{{conversationGoal}}', request.conversationGoal);
    prompt = prompt.replace('{{tensionLevel}}', String(Math.round(request.tension * 10)));
    prompt = prompt.replace('{{subtext}}', request.subtext || 'None specified');

    // Voice profiles section
    const voiceProfilesText = voiceProfiles
      .map(p => this.formatVoiceProfile(p))
      .join('\n\n---\n\n');
    prompt = prompt.replace('{{voiceProfiles}}', voiceProfilesText);

    // Emotional beats
    const emotionalBeats = request.emotionalBeats
      .map(b => `- ${b.character}: ${b.emotion} at beat ${b.beat}`)
      .join('\n');
    prompt = prompt.replace('{{emotionalBeats}}', emotionalBeats || 'None specified');

    // Required lines
    const requiredLines = request.mustIncludeLines
      ?.map(l => `- ${l.character}: "${l.line}"`)
      .join('\n') || 'None';
    prompt = prompt.replace('{{requiredLines}}', requiredLines);

    // Topics to avoid
    prompt = prompt.replace('{{avoidTopics}}',
      request.mustAvoidTopics?.join(', ') || 'None');

    return prompt;
  }

  // ============================================================================
  // Continuation Generation
  // ============================================================================

  async generateContinuation(request: ContinuationRequest): Promise<GenerationResult> {
    this.validateProviderForCapability('continuation');

    const requestId = request.requestId || uuidv4();
    request.requestId = requestId;
    request.createdAt = new Date();
    this.requests.set(requestId, request);

    const prompt = this.buildContinuationPrompt(request);
    const result = await this.executeGeneration(request, prompt);

    this.storeResult(result, request);
    return result;
  }

  private buildContinuationPrompt(request: ContinuationRequest): string {
    return `
Continue the following narrative passage.

## Preceding Text (${request.precedingWordCount} words)
${request.precedingText}

## Continuation Parameters
- Target Word Count: ${request.targetWordCount.target} words
- Minimum: ${request.targetWordCount.minimum} words
- Tone: ${request.tone || 'maintain current tone'}
- Pacing: ${request.pacing || 'maintain current pacing'}
${request.continueTowardEvent ? `- Continue Toward: ${request.continueTowardEvent}` : ''}
${request.transitionNeeded ? `- Transition Needed: ${request.transitionNeeded}` : ''}

## Guidelines
- Maintain consistent voice and style from the preceding text
- ${request.maintainMomentum ? 'Keep the current momentum and energy' : 'Natural pacing is acceptable'}
- Seamless continuation - no jarring shifts unless intentional

## Continue the Narrative
    `.trim();
  }

  // ============================================================================
  // Batch Generation (bulk scene processing)
  // ============================================================================

  async generateBatch(request: BatchSceneRequest): Promise<BatchGenerationResult> {
    this.validateProviderForCapability('scene');

    const startTime = Date.now();
    const results: GenerationResult[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const brief of request.sceneBriefs) {
      try {
        const sceneRequest: GenerationRequest = {
          requestId: uuidv4(),
          type: GenerationType.SCENE,
          createdAt: new Date(),
          projectId: request.projectId,
          bookId: request.bookId,
          chapterId: request.chapterId,
          sceneNumber: brief.sceneIndex,
          prompt: brief.brief,
          sceneType: brief.type,
          tone: request.chapterTone,
          pacing: PacingType.MODERATE,
          targetWordCount: {
            minimum: Math.floor(brief.wordTarget * 0.8),
            target: brief.wordTarget,
            maximum: Math.floor(brief.wordTarget * 1.5),
          },
          povCharacterId: request.characterId,
          involvedCharacterIds: [request.characterId],
          sceneContext: request.sharedContext,
          qualityThreshold: 80,
          requiredElements: [],
          forbiddenElements: [],
          temperature: 0.7,
          creativityLevel: 'moderate',
        };

        const result = await this.generateScene(sceneRequest);
        results.push(result);

        if (result.qualityScore >= sceneRequest.qualityThreshold) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
        // Log error but continue batch
      }
    }

    const totalWordCount = results.reduce((sum, r) => sum + r.wordCount, 0);
    const totalCost = results.reduce((sum, r) => sum + r.estimatedCost, 0);
    const avgQuality = results.length > 0
      ? results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length
      : 0;

    return {
      batchId: request.batchId,
      completedAt: new Date(),
      totalScenes: request.scenesToGenerate,
      successfulScenes: successCount,
      failedScenes: failCount,
      results,
      totalWordCount,
      averageQualityScore: avgQuality,
      totalCost,
      totalTimeMs: Date.now() - startTime,
    };
  }

  // ============================================================================
  // Generation Execution (Simulated - Real implementation calls AI API)
  // ============================================================================

  private async executeGeneration(
    request: GenerationRequest,
    prompt: string
  ): Promise<GenerationResult> {
    if (!this.activeProvider) {
      throw new Error('No AI provider configured');
    }

    const startTime = Date.now();

    // In real implementation, this would call the AI API
    // For now, we simulate the structure

    // Simulate token counting
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(request.targetWordCount.target * 1.5);

    // Simulated content (in real impl, this comes from AI)
    const simulatedContent = this.generatePlaceholderContent(request);

    const result: GenerationResult = {
      resultId: uuidv4(),
      requestId: request.requestId,
      generatedAt: new Date(),
      providerId: this.activeProvider.providerId,
      modelUsed: this.activeProvider.modelId,
      content: simulatedContent,
      wordCount: simulatedContent.split(/\s+/).length,
      qualityScore: 85 + Math.random() * 10, // Simulated score
      voiceConsistencyScore: 80 + Math.random() * 15,
      plotCoherenceScore: 85 + Math.random() * 10,
      emotionalImpactScore: 75 + Math.random() * 20,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      estimatedCost: (
        (inputTokens / 1000) * this.activeProvider.costPer1kTokens.input +
        (outputTokens / 1000) * this.activeProvider.costPer1kTokens.output
      ),
      generationTimeMs: Date.now() - startTime,
      temperature: request.temperature,
      elementsIncluded: request.requiredElements,
      elementsMissing: [],
      warnings: [],
      suggestedRevisions: [],
    };

    return result;
  }

  private generatePlaceholderContent(request: GenerationRequest): string {
    // This is placeholder content for testing the structure
    // Real implementation would return AI-generated content
    const wordTarget = request.targetWordCount.target;
    const sentences = Math.ceil(wordTarget / 15); // ~15 words per sentence

    const placeholderSentences = [
      'The narrative continues with careful attention to character voice.',
      'Each word is chosen to advance the plot while maintaining emotional resonance.',
      'The scene unfolds naturally, revealing character through action.',
      'Dialogue flows with distinct voices for each participant.',
      'The setting grounds the reader in sensory detail.',
      'Tension builds through subtext and implication.',
      'The emotional beat lands with appropriate weight.',
      'Foreshadowing weaves subtly through the prose.',
      'Character relationships evolve through interaction.',
      'The pacing matches the scene\'s requirements.',
    ];

    let content = '';
    for (let i = 0; i < sentences; i++) {
      content += placeholderSentences[i % placeholderSentences.length] + ' ';
    }

    return `[PLACEHOLDER: This is simulated content for ${request.type}. ` +
      `In production, this would be AI-generated content matching the request parameters. ` +
      `Scene type: ${request.sceneType}, Tone: ${request.tone}, Target: ${wordTarget} words]\n\n` +
      content.trim();
  }

  // ============================================================================
  // Result Storage and Retrieval
  // ============================================================================

  private storeResult(result: GenerationResult, request: GenerationRequest): void {
    this.results.set(result.resultId, result);

    // Update indexes
    if (!this.resultsByRequest.has(request.requestId)) {
      this.resultsByRequest.set(request.requestId, []);
    }
    this.resultsByRequest.get(request.requestId)!.push(result.resultId);

    if (request.povCharacterId) {
      if (!this.resultsByCharacter.has(request.povCharacterId)) {
        this.resultsByCharacter.set(request.povCharacterId, []);
      }
      this.resultsByCharacter.get(request.povCharacterId)!.push(result.resultId);
    }

    if (request.chapterId) {
      if (!this.resultsByChapter.has(request.chapterId)) {
        this.resultsByChapter.set(request.chapterId, []);
      }
      this.resultsByChapter.get(request.chapterId)!.push(result.resultId);
    }

    // Update statistics
    this.totalGenerations++;
    this.totalWordCount += result.wordCount;
    this.totalCost += result.estimatedCost;
    this.totalTokens += result.tokensUsed.total;
  }

  getResult(resultId: string): GenerationResult | undefined {
    return this.results.get(resultId);
  }

  getResultsForCharacter(characterId: string): GenerationResult[] {
    const resultIds = this.resultsByCharacter.get(characterId) || [];
    return resultIds
      .map(id => this.results.get(id))
      .filter((r): r is GenerationResult => r !== undefined);
  }

  getResultsForChapter(chapterId: string): GenerationResult[] {
    const resultIds = this.resultsByChapter.get(chapterId) || [];
    return resultIds
      .map(id => this.results.get(id))
      .filter((r): r is GenerationResult => r !== undefined);
  }

  // ============================================================================
  // Production Tracking (configurable daily scene targets)
  // ============================================================================

  getDailyProductionStats(characterId: string, date: Date): {
    scenesGenerated: number;
    wordCount: number;
    meetsMinimum: boolean;
    shortfall: number;
    averageQuality: number;
    costToDate: number;
    minimumTarget: number;
  } {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const results = this.getResultsForCharacter(characterId)
      .filter(r => r.generatedAt >= startOfDay && r.generatedAt <= endOfDay);

    const scenesGenerated = results.length;
    const wordCount = results.reduce((sum, r) => sum + r.wordCount, 0);
    const minimumTarget = this.minimumDailyScenesPerCharacter;

    return {
      scenesGenerated,
      wordCount,
      meetsMinimum: minimumTarget === 0 || scenesGenerated >= minimumTarget,
      shortfall: Math.max(0, minimumTarget - scenesGenerated),
      averageQuality: results.length > 0
        ? results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length
        : 0,
      costToDate: results.reduce((sum, r) => sum + r.estimatedCost, 0),
      minimumTarget,
    };
  }

  getDeficitRecoveryTarget(characterId: string): {
    deficitDays: number;
    scenesOwed: number;
    recoveryTarget: number;
    deadline: Date;
    minimumTarget: number;
  } {
    const minimumTarget = this.minimumDailyScenesPerCharacter;

    // If no minimum is set, there's no deficit to track
    if (minimumTarget === 0) {
      return {
        deficitDays: 0,
        scenesOwed: 0,
        recoveryTarget: 0,
        deadline: new Date(),
        minimumTarget: 0,
      };
    }

    // Check last 7 days for deficits
    const deficits: { date: Date; shortfall: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const stats = this.getDailyProductionStats(characterId, date);

      if (stats.shortfall > 0) {
        deficits.push({ date, shortfall: stats.shortfall });
      }
    }

    const scenesOwed = deficits.reduce((sum, d) => sum + d.shortfall, 0);
    // 150% recovery rule
    const recoveryTarget = Math.ceil(scenesOwed * 1.5) + minimumTarget;

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 1); // Tomorrow

    return {
      deficitDays: deficits.length,
      scenesOwed,
      recoveryTarget,
      deadline,
      minimumTarget,
    };
  }

  // ============================================================================
  // Advanced Prompting Integration
  // ============================================================================

  private leadingEdgeConfig: LeadingEdgeAIConfig | null = null;

  /**
   * Connect to LeadingEdgeAIConfig for frontier model enforcement
   */
  connectLeadingEdgeConfig(config: LeadingEdgeAIConfig): void {
    this.leadingEdgeConfig = config;
  }

  /**
   * Get the best frontier model for the current generation task
   */
  private selectBestModel(capabilities: ModelCapability[]): FrontierModel | null {
    if (!this.leadingEdgeConfig) {
      return null;
    }
    return this.leadingEdgeConfig.getBestModelForTask(capabilities);
  }

  /**
   * Apply chain-of-thought prompting wrapper
   */
  private applyChainOfThought(prompt: string, task: string): string {
    return `
Before generating the ${task}, think through the following steps:

<thinking>
1. What is the core emotional or narrative goal of this ${task}?
2. What constraints must be satisfied?
3. What are the potential pitfalls to avoid?
4. How should the pacing unfold?
5. What sensory details will ground the reader?
6. What subtext should be present?
</thinking>

After your analysis, generate the ${task}.

---

${prompt}

---

Remember: First analyze in <thinking> tags, then generate the ${task}.
`;
  }

  /**
   * Apply few-shot examples to prompt
   */
  private applyFewShotExamples(
    prompt: string,
    examples: { input: string; output: string; explanation?: string }[]
  ): string {
    if (examples.length === 0) return prompt;

    const examplesSection = examples.map((ex, i) => `
### Example ${i + 1}

**Request:**
${ex.input}

**High-Quality Response:**
${ex.output}

${ex.explanation ? `**Why this works:** ${ex.explanation}` : ''}
`).join('\n---\n');

    return `
## Learning from Examples

Study these examples of high-quality output before generating your response:

${examplesSection}

---

## Your Task

${prompt}
`;
  }

  /**
   * Apply iterative refinement instruction
   */
  private applyIterativeRefinement(prompt: string, passes: number): string {
    if (passes <= 1) return prompt;

    return `
${prompt}

---

## Quality Refinement Protocol

After generating your initial response, perform ${passes} refinement passes:

**Pass 1 - Prose Quality:**
- Check for filter words and remove
- Ensure show-don't-tell
- Vary sentence length for rhythm
- Remove adverbs from dialogue tags

**Pass 2 - Character Voice:**
- Verify each character sounds distinct
- Check dialogue matches voice profiles
- Ensure consistent POV
- Validate emotional beats

${passes >= 3 ? `**Pass 3 - Polish:**
- Read aloud mentally for flow
- Tighten any bloated passages
- Ensure sensory immersion
- Verify foreshadowing subtlety
` : ''}

Output your FINAL refined version only.
`;
  }

  /**
   * Generate with advanced prompting techniques
   */
  async generateWithAdvancedPrompting(
    request: GenerationRequest,
    options: {
      useChainOfThought?: boolean;
      useFewShot?: boolean;
      iterativeRefinementPasses?: number;
      templateId?: string;
    } = {}
  ): Promise<GenerationResult> {
    const {
      useChainOfThought = true,
      useFewShot = true,
      iterativeRefinementPasses = 2,
      templateId,
    } = options;

    this.validateProviderForCapability('scene');

    // Get advanced template if available
    let advancedTemplate: AdvancedPromptTemplate | undefined;
    if (templateId && this.leadingEdgeConfig) {
      advancedTemplate = this.leadingEdgeConfig.getTemplate(templateId);
    }

    // Build base prompt
    let prompt = this.buildScenePrompt(request);

    // Apply advanced techniques
    if (useChainOfThought) {
      prompt = this.applyChainOfThought(prompt, request.type);
    }

    if (useFewShot && advancedTemplate?.fewShotExamples) {
      prompt = this.applyFewShotExamples(prompt, advancedTemplate.fewShotExamples);
    }

    if (iterativeRefinementPasses > 1) {
      prompt = this.applyIterativeRefinement(prompt, iterativeRefinementPasses);
    }

    // Store request
    const requestId = request.requestId || uuidv4();
    request.requestId = requestId;
    request.createdAt = new Date();
    this.requests.set(requestId, request);

    // Execute with enhanced prompt
    const result = await this.executeAdvancedGeneration(request, prompt, advancedTemplate);

    // Run quality benchmarks
    const benchmark = this.runQualityBenchmarks(result, advancedTemplate);
    if (this.leadingEdgeConfig && benchmark) {
      this.leadingEdgeConfig.recordBenchmark(benchmark);
    }

    // Store result
    this.storeResult(result, request);

    return result;
  }

  /**
   * Execute generation with advanced quality tracking
   */
  private async executeAdvancedGeneration(
    request: GenerationRequest,
    prompt: string,
    _template?: AdvancedPromptTemplate
  ): Promise<GenerationResult> {
    // Use leading edge config to select best model
    let selectedModel: FrontierModel | null = null;
    if (this.leadingEdgeConfig) {
      const requiredCapabilities: ModelCapability[] = [
        ModelCapability.CREATIVE_WRITING,
        ModelCapability.CHARACTER_VOICE,
      ];

      if (request.type === GenerationType.DIALOGUE) {
        requiredCapabilities.push(ModelCapability.DIALOGUE_GENERATION);
      }

      selectedModel = this.selectBestModel(requiredCapabilities);
    }

    // Fall back to active provider if no leading edge config
    const result = await this.executeGeneration(request, prompt);

    // Enhance result with model info if available
    if (selectedModel) {
      result.modelUsed = selectedModel.modelId;
    }

    return result;
  }

  /**
   * Run quality benchmarks on generated content
   */
  private runQualityBenchmarks(
    result: GenerationResult,
    _template?: AdvancedPromptTemplate
  ): QualityBenchmark | null {
    if (!result.content) return null;

    const content = result.content;

    // Calculate metrics
    const readability = calculateReadability(content);
    const sensoryCount = countSensoryDetails(content);
    const pacing = analyzePacing(content);

    // Normalize readability to 0-100 (Flesch score is typically 0-100+)
    const normalizedReadability = Math.min(100, Math.max(0, readability));

    // Calculate creativity based on vocabulary diversity
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const vocabularyDiversity = (uniqueWords.size / words.length) * 100;

    // Pacing score based on variation (higher variation = more dynamic)
    const pacingScore = Math.min(100, pacing.variation * 10 + 50);

    // Emotional resonance estimation (based on emotional word density)
    const emotionalWords = content.match(
      /\b(love|hate|fear|joy|anger|sadness|hope|despair|triumph|loss|betrayal|trust|passion|grief|elation|terror|wonder|awe|shame|pride)\b/gi
    );
    const emotionalDensity = ((emotionalWords?.length || 0) / words.length) * 100;
    const emotionalResonance = Math.min(100, emotionalDensity * 20 + 60);

    // Overall score is weighted average
    const overall = (
      normalizedReadability * 0.15 +
      vocabularyDiversity * 0.15 +
      Math.min(100, sensoryCount * 20) * 0.2 +
      pacingScore * 0.15 +
      emotionalResonance * 0.2 +
      result.qualityScore * 0.15
    );

    const benchmark: QualityBenchmark = {
      benchmarkId: uuidv4(),
      timestamp: new Date(),
      modelId: result.modelUsed,
      templateId: 'scene-default',
      metrics: {
        coherence: result.plotCoherenceScore || 85,
        creativity: vocabularyDiversity,
        consistency: result.voiceConsistencyScore || 80,
        emotionalResonance,
        technicalAccuracy: 90, // Would need external validation
        voiceDistinction: result.voiceConsistencyScore || 80,
        pacing: pacingScore,
        overall,
      },
      passedGates: [],
      failedGates: [],
    };

    // Check quality gates
    if (validateWordCount(content, 1000)) {
      benchmark.passedGates.push('word-count');
    } else {
      benchmark.failedGates.push('word-count');
    }

    if (sensoryCount >= 3) {
      benchmark.passedGates.push('sensory-minimum');
    } else {
      benchmark.failedGates.push('sensory-minimum');
    }

    if (normalizedReadability >= 60) {
      benchmark.passedGates.push('readability');
    } else {
      benchmark.failedGates.push('readability');
    }

    return benchmark;
  }

  /**
   * Generate with automatic model selection and quality enforcement
   */
  async generateFrontierQuality(
    request: GenerationRequest
  ): Promise<{
    result: GenerationResult;
    benchmark: QualityBenchmark | null;
    modelUsed: FrontierModel | null;
    techniquesApplied: PromptingTechnique[];
  }> {
    const techniquesApplied: PromptingTechnique[] = [
      PromptingTechnique.CHAIN_OF_THOUGHT,
      PromptingTechnique.FEW_SHOT,
      PromptingTechnique.ITERATIVE_REFINEMENT,
    ];

    // Select best model
    const modelUsed = this.selectBestModel([
      ModelCapability.CREATIVE_WRITING,
      ModelCapability.LONG_FORM_NARRATIVE,
      ModelCapability.CHARACTER_VOICE,
      ModelCapability.EMOTIONAL_DEPTH,
    ]);

    // Generate with all advanced techniques
    const result = await this.generateWithAdvancedPrompting(request, {
      useChainOfThought: true,
      useFewShot: true,
      iterativeRefinementPasses: 3,
      templateId: 'scene-gen-master-v1',
    });

    // Get benchmark
    const benchmark = this.runQualityBenchmarks(result);

    // Validate meets frontier quality threshold
    if (benchmark && benchmark.metrics.overall < 85) {
      result.warnings.push(
        `Quality score ${benchmark.metrics.overall.toFixed(1)} below frontier threshold of 85. ` +
        `Consider regeneration or manual refinement.`
      );
    }

    return { result, benchmark, modelUsed, techniquesApplied };
  }

  /**
   * Get quality analysis for existing content
   */
  analyzeContentQuality(content: string): {
    readability: number;
    sensoryDetails: number;
    pacing: ReturnType<typeof analyzePacing>;
    emotionalDensity: number;
    vocabularyDiversity: number;
    suggestions: string[];
  } {
    const readability = calculateReadability(content);
    const sensoryDetails = countSensoryDetails(content);
    const pacing = analyzePacing(content);

    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const vocabularyDiversity = (uniqueWords.size / words.length) * 100;

    const emotionalWords = content.match(
      /\b(love|hate|fear|joy|anger|sadness|hope|despair|triumph|loss|betrayal|trust|passion|grief|elation|terror|wonder|awe|shame|pride)\b/gi
    );
    const emotionalDensity = ((emotionalWords?.length || 0) / words.length) * 100;

    const suggestions: string[] = [];

    if (readability < 50) {
      suggestions.push('Readability is low. Consider shorter sentences and simpler vocabulary.');
    }
    if (sensoryDetails < 3) {
      suggestions.push(`Only ${sensoryDetails} senses engaged. Add visual, auditory, tactile, or other sensory details.`);
    }
    if (pacing.variation < 3) {
      suggestions.push('Sentence length lacks variation. Mix short punchy sentences with longer flowing ones.');
    }
    if (emotionalDensity < 2) {
      suggestions.push('Low emotional word density. Consider adding more emotionally resonant language.');
    }
    if (vocabularyDiversity < 40) {
      suggestions.push('Vocabulary repetition detected. Vary word choices for richer prose.');
    }

    return {
      readability,
      sensoryDetails,
      pacing,
      emotionalDensity,
      vocabularyDiversity,
      suggestions,
    };
  }

  // ============================================================================
  // Standard API Methods
  // ============================================================================

  getStats(): {
    totalGenerations: number;
    totalWordCount: number;
    totalCost: number;
    totalTokens: number;
    voiceProfileCount: number;
    writingRuleCount: number;
    templateCount: number;
    activeProvider: string | null;
    averageQualityScore: number;
    generationsByType: Map<GenerationType, number>;
  } {
    const generationsByType = new Map<GenerationType, number>();

    for (const request of this.requests.values()) {
      const current = generationsByType.get(request.type) || 0;
      generationsByType.set(request.type, current + 1);
    }

    const allResults = Array.from(this.results.values());
    const avgQuality = allResults.length > 0
      ? allResults.reduce((sum, r) => sum + r.qualityScore, 0) / allResults.length
      : 0;

    return {
      totalGenerations: this.totalGenerations,
      totalWordCount: this.totalWordCount,
      totalCost: this.totalCost,
      totalTokens: this.totalTokens,
      voiceProfileCount: this.voiceProfiles.size,
      writingRuleCount: this.writingRules.size,
      templateCount: this.promptTemplates.size,
      activeProvider: this.activeProvider?.providerName || null,
      averageQualityScore: avgQuality,
      generationsByType,
    };
  }

  clear(): void {
    this.requests.clear();
    this.results.clear();
    this.voiceProfiles.clear();
    this.resultsByRequest.clear();
    this.resultsByCharacter.clear();
    this.resultsByChapter.clear();
    this.totalGenerations = 0;
    this.totalWordCount = 0;
    this.totalCost = 0;
    this.totalTokens = 0;
    // Keep rules and templates
    this.initializeDefaultRules();
    this.initializeDefaultTemplates();
  }

  exportToJSON(): string {
    return JSON.stringify({
      requests: Array.from(this.requests.entries()),
      results: Array.from(this.results.entries()),
      voiceProfiles: Array.from(this.voiceProfiles.entries()),
      writingRules: Array.from(this.writingRules.entries()).map(([_id, rule]) => ({
        ...rule,
        checkFunction: undefined, // Can't serialize functions
        autoFixFunction: undefined,
      })),
      promptTemplates: Array.from(this.promptTemplates.entries()),
      stats: {
        totalGenerations: this.totalGenerations,
        totalWordCount: this.totalWordCount,
        totalCost: this.totalCost,
        totalTokens: this.totalTokens,
      },
      activeProviderId: this.activeProvider?.providerId || null,
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.requests = new Map(data.requests);
    this.results = new Map(data.results);
    this.voiceProfiles = new Map(data.voiceProfiles);

    // Rebuild rules (without functions - those need to be re-registered)
    for (const [id, rule] of data.writingRules) {
      this.writingRules.set(id, rule);
    }

    this.promptTemplates = new Map(data.promptTemplates);

    this.totalGenerations = data.stats.totalGenerations;
    this.totalWordCount = data.stats.totalWordCount;
    this.totalCost = data.stats.totalCost;
    this.totalTokens = data.stats.totalTokens;

    if (data.activeProviderId) {
      try {
        this.setActiveProvider(data.activeProviderId);
      } catch {
        // Provider may not be available
      }
    }

    // Rebuild indexes
    this.rebuildIndexes();
  }

  private rebuildIndexes(): void {
    this.resultsByRequest.clear();
    this.resultsByCharacter.clear();
    this.resultsByChapter.clear();

    for (const [resultId, result] of this.results) {
      const request = this.requests.get(result.requestId);
      if (!request) continue;

      // By request
      if (!this.resultsByRequest.has(result.requestId)) {
        this.resultsByRequest.set(result.requestId, []);
      }
      this.resultsByRequest.get(result.requestId)!.push(resultId);

      // By character
      if (request.povCharacterId) {
        if (!this.resultsByCharacter.has(request.povCharacterId)) {
          this.resultsByCharacter.set(request.povCharacterId, []);
        }
        this.resultsByCharacter.get(request.povCharacterId)!.push(resultId);
      }

      // By chapter
      if (request.chapterId) {
        if (!this.resultsByChapter.has(request.chapterId)) {
          this.resultsByChapter.set(request.chapterId, []);
        }
        this.resultsByChapter.get(request.chapterId)!.push(resultId);
      }
    }
  }
}

// ============================================================================
// Export
// ============================================================================

export default WritingGenerationEngine;
