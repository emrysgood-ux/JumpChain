/**
 * Epic Fiction Architect - AI Assistance Engines
 *
 * Tools for ensuring consistency and quality when using AI
 * to help write 12,000+ chapter narratives.
 */

// Context Manager
export {
  ContextManager,
  contextManager,
  type ContextPiece,
  type ContextBundle,
  type ContextRequest,
  type GeneratedContext,
  type ContextTemplate,
  type WritingSession,
  type PromptRecord,
  type ResponseRecord,
  ContextType,
  ContextPriority,
  ContextScope
} from './context-manager';

// Style Enforcer
export {
  StyleEnforcer,
  styleEnforcer,
  type StyleGuide,
  type StyleRule,
  type StyleViolation,
  type StyleAnalysis,
  type TextSegment,
  type StylePreset,
  StyleElement,
  StyleViolationType,
  Severity,
  Tense,
  POV
} from './style-enforcer';

// Voice Profiler
export {
  VoiceProfiler,
  voiceProfiler,
  type VoiceProfile,
  type SampleDialogue,
  type VoiceComparison,
  type VoiceViolation,
  type DialogueAnalysis,
  type VoiceContext,
  SpeechPattern,
  EmotionalExpression,
  HumorStyle,
  ThoughtStyle,
  VoiceViolationType
} from './voice-profiler';

/**
 * Unified AI Assistance Suite
 *
 * Provides a single interface to all AI assistance tools for
 * maintaining consistency in AI-assisted writing.
 */
export class AIAssistanceSuite {
  public readonly context: import('./context-manager').ContextManager;
  public readonly style: import('./style-enforcer').StyleEnforcer;
  public readonly voice: import('./voice-profiler').VoiceProfiler;

  constructor() {
    const { ContextManager } = require('./context-manager');
    const { StyleEnforcer } = require('./style-enforcer');
    const { VoiceProfiler } = require('./voice-profiler');

    this.context = new ContextManager();
    this.style = new StyleEnforcer();
    this.voice = new VoiceProfiler();
  }

  /**
   * Prepare for a writing session
   * Returns all context needed for AI-assisted writing
   */
  prepareWritingSession(options: {
    chapterNumber: number;
    sceneIndex?: number;
    povCharacterId?: string;
    involvedCharacterIds?: string[];
    locationId?: string;
    plotThreadIds?: string[];
    styleGuideId?: string;
    maxContextTokens?: number;
  }): {
    session: import('./context-manager').WritingSession;
    context: import('./context-manager').GeneratedContext;
    styleGuide: import('./style-enforcer').StyleGuide | null;
    voicePrompts: Map<string, string>;
  } {
    // Start context session
    const session = this.context.startSession(options.chapterNumber, options.sceneIndex);

    // Generate context
    const context = this.context.generateContextForChapter({
      chapterNumber: options.chapterNumber,
      sceneIndex: options.sceneIndex,
      povCharacterId: options.povCharacterId,
      involvedCharacterIds: options.involvedCharacterIds,
      locationId: options.locationId,
      plotThreadIds: options.plotThreadIds,
      maxTokens: options.maxContextTokens
    });

    // Get style guide
    let styleGuide: import('./style-enforcer').StyleGuide | null = null;
    if (options.styleGuideId) {
      styleGuide = this.style.getGuide(options.styleGuideId) || null;
    } else {
      styleGuide = this.style.getActiveGuide();
    }

    // Generate voice prompts for involved characters
    const voicePrompts = new Map<string, string>();
    const characterIds = [
      options.povCharacterId,
      ...(options.involvedCharacterIds || [])
    ].filter((id): id is string => id !== undefined);

    for (const charId of characterIds) {
      const voicePrompt = this.voice.generateVoicePrompt(charId);
      if (voicePrompt) {
        voicePrompts.set(charId, voicePrompt);
      }
    }

    return {
      session,
      context,
      styleGuide,
      voicePrompts
    };
  }

  /**
   * Analyze AI-generated text for consistency
   */
  analyzeGeneratedText(
    text: string,
    options?: {
      styleGuideId?: string;
      speakingCharacterId?: string;
      voiceContext?: import('./voice-profiler').VoiceContext;
    }
  ): {
    styleAnalysis: import('./style-enforcer').StyleAnalysis | null;
    voiceAnalysis: import('./voice-profiler').DialogueAnalysis | null;
    overallScore: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let totalScore = 0;
    let scoreCount = 0;

    // Style analysis
    let styleAnalysis: import('./style-enforcer').StyleAnalysis | null = null;
    const guideId = options?.styleGuideId || this.style.getActiveGuide()?.id;
    if (guideId) {
      try {
        styleAnalysis = this.style.analyzeText(text, guideId);
        totalScore += styleAnalysis.overallScore;
        scoreCount++;

        for (const violation of styleAnalysis.violations) {
          if (violation.severity === 'error' || violation.severity === 'warning') {
            issues.push(violation.message);
          }
          if (violation.suggestion) {
            suggestions.push(violation.suggestion);
          }
        }
      } catch (e) {
        // No style guide available
      }
    }

    // Voice analysis for dialogue
    let voiceAnalysis: import('./voice-profiler').DialogueAnalysis | null = null;
    if (options?.speakingCharacterId) {
      voiceAnalysis = this.voice.analyzeDialogue(
        text,
        options.speakingCharacterId,
        options.voiceContext
      );
      totalScore += voiceAnalysis.overallScore;
      scoreCount++;

      for (const violation of voiceAnalysis.violations) {
        issues.push(violation.issue);
        if (violation.suggestion) {
          suggestions.push(violation.suggestion);
        }
      }

      suggestions.push(...voiceAnalysis.suggestions);
    }

    const overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 100;

    return {
      styleAnalysis,
      voiceAnalysis,
      overallScore,
      issues: [...new Set(issues)],
      suggestions: [...new Set(suggestions)]
    };
  }

  /**
   * Generate a comprehensive writing prompt for AI
   */
  generateWritingPrompt(options: {
    chapterNumber: number;
    sceneDescription: string;
    povCharacterId?: string;
    involvedCharacterIds?: string[];
    templateId?: string;
  }): string {
    const { context, styleGuide, voicePrompts } = this.prepareWritingSession({
      chapterNumber: options.chapterNumber,
      povCharacterId: options.povCharacterId,
      involvedCharacterIds: options.involvedCharacterIds
    });

    let prompt = context.systemPrompt;
    prompt += '\n\n---\n\n';

    // Add style guidelines
    if (styleGuide) {
      prompt += `## Style Guidelines\n`;
      prompt += `- Vocabulary level: ${styleGuide.vocabularyLevel}\n`;
      prompt += `- Sentence length: ${styleGuide.sentenceLength.targetAverage} words average\n`;
      prompt += `- Formality: ${styleGuide.formality}/10\n`;
      prompt += `- Description density: ${styleGuide.descriptionDensity}/10\n`;
      prompt += `- Show vs Tell: ${styleGuide.showVsTell}/10\n`;
      prompt += `- Pacing: ${styleGuide.pacing}\n`;
      if (styleGuide.forbiddenWords.length > 0) {
        prompt += `- Avoid words: ${styleGuide.forbiddenWords.slice(0, 10).join(', ')}\n`;
      }
      prompt += '\n';
    }

    // Add character voice profiles
    if (voicePrompts.size > 0) {
      prompt += `## Character Voices\n\n`;
      for (const [_charId, voicePrompt] of voicePrompts) {
        prompt += voicePrompt;
        prompt += '\n---\n\n';
      }
    }

    // Add context
    if (context.characterContext) {
      prompt += `## Characters in Scene\n${context.characterContext}\n\n`;
    }

    if (context.worldContext) {
      prompt += `## World Context\n${context.worldContext}\n\n`;
    }

    if (context.plotContext) {
      prompt += `## Plot Context\n${context.plotContext}\n\n`;
    }

    // Add scene description
    prompt += `## Scene to Write\n${options.sceneDescription}\n`;

    return prompt;
  }

  /**
   * Get statistics about AI assistance usage
   */
  getStats(): {
    context: ReturnType<import('./context-manager').ContextManager['getStats']>;
    style: ReturnType<import('./style-enforcer').StyleEnforcer['getStats']>;
    voice: ReturnType<import('./voice-profiler').VoiceProfiler['getStats']>;
  } {
    return {
      context: this.context.getStats(),
      style: this.style.getStats(),
      voice: this.voice.getStats()
    };
  }

  /**
   * Export all AI assistance data
   */
  exportAll(): string {
    return JSON.stringify({
      context: JSON.parse(this.context.exportToJSON()),
      style: JSON.parse(this.style.exportToJSON()),
      voice: JSON.parse(this.voice.exportToJSON()),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import all AI assistance data
   */
  importAll(json: string): void {
    const data = JSON.parse(json);

    if (data.context) {
      this.context.importFromJSON(JSON.stringify(data.context));
    }

    if (data.style) {
      this.style.importFromJSON(JSON.stringify(data.style));
    }

    if (data.voice) {
      this.voice.importFromJSON(JSON.stringify(data.voice));
    }
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.context.clear();
    this.style.clear();
    this.voice.clear();
  }
}

export default AIAssistanceSuite;
