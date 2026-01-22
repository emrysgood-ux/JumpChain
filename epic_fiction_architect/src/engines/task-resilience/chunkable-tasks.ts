/**
 * Chunkable Task Patterns
 *
 * Pre-built patterns for common AI-assisted tasks that need resilience.
 * These handle the chunking, checkpointing, and resumption logic.
 */

import {
  TaskDefinition,
  ChunkResult,
  TaskExecutionContext,
  TextGenerationCheckpoint,
  BatchProcessingCheckpoint,
  PipelineCheckpoint
} from './types';

// ============================================================================
// Text Generation Task
// ============================================================================

export interface TextGenerationInput {
  /** Task description / prompt */
  prompt: string;

  /** Expected output sections (for chunking) */
  sections: string[];

  /** Maximum tokens per section */
  maxTokensPerSection?: number;

  /** Model to use */
  model?: string;

  /** Temperature */
  temperature?: number;

  /** System prompt */
  systemPrompt?: string;

  /** Additional context */
  context?: string;
}

export interface TextGenerationOutput {
  /** Generated text */
  text: string;

  /** Sections generated */
  sections: string[];

  /** Total tokens used */
  totalTokens: number;
}

/**
 * Create a text generation task definition
 */
export function createTextGenerationTask(
  generateFn: (prompt: string, options: {
    maxTokens?: number;
    model?: string;
    temperature?: number;
    systemPrompt?: string;
  }) => Promise<{ text: string; tokensUsed: number }>
): TaskDefinition<TextGenerationInput, TextGenerationOutput, TextGenerationCheckpoint> {
  return {
    type: 'text_generation',
    description: 'Generate text in resumable chunks',
    chunkable: true,

    estimateChunks: (input) => input.sections.length,

    executeChunk: async (input, checkpoint, context) => {
      const state = checkpoint || {
        generatedText: '',
        tokensUsed: 0,
        currentSection: 0,
        totalSections: input.sections.length,
        outline: input.sections
      };

      if (context.shouldAbort()) {
        return { done: false, checkpoint: state };
      }

      // Generate the next section
      const sectionIndex = state.currentSection;
      const sectionPrompt = input.sections[sectionIndex];

      context.log(`Generating section ${sectionIndex + 1}/${state.totalSections}: ${sectionPrompt}`);

      try {
        const fullPrompt = state.generatedText
          ? `Continue from where we left off. Previous content:\n\n${state.generatedText.slice(-2000)}\n\nNow write: ${sectionPrompt}`
          : `${input.prompt}\n\nWrite: ${sectionPrompt}`;

        const result = await generateFn(fullPrompt, {
          maxTokens: input.maxTokensPerSection || 4000,
          model: input.model,
          temperature: input.temperature,
          systemPrompt: input.systemPrompt
        });

        // Update state
        state.generatedText += (state.generatedText ? '\n\n' : '') + result.text;
        state.tokensUsed += result.tokensUsed;
        state.currentSection++;

        // Save checkpoint
        await context.saveCheckpoint(state);

        // Report progress
        const progress = state.currentSection / state.totalSections;
        context.reportProgress(progress, `Completed section ${state.currentSection}/${state.totalSections}`);

        // Check if done
        if (state.currentSection >= state.totalSections) {
          return {
            done: true,
            output: {
              text: state.generatedText,
              sections: input.sections,
              totalTokens: state.tokensUsed
            },
            progress: 1
          };
        }

        return {
          done: false,
          checkpoint: state,
          progress,
          chunksCompleted: state.currentSection,
          chunksTotal: state.totalSections
        };
      } catch (error) {
        // Preserve state even on error
        return {
          done: false,
          checkpoint: state,
          progress: state.currentSection / state.totalSections,
          message: `Error: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    },

    validateCheckpoint: (checkpoint) => {
      return (
        typeof checkpoint.currentSection === 'number' &&
        typeof checkpoint.totalSections === 'number' &&
        checkpoint.currentSection <= checkpoint.totalSections
      );
    }
  };
}

// ============================================================================
// Batch Processing Task
// ============================================================================

export interface BatchProcessingInput<TItem, TResult> {
  /** Items to process */
  items: TItem[];

  /** Batch size */
  batchSize?: number;

  /** Whether order matters */
  preserveOrder?: boolean;
}

/**
 * Create a batch processing task definition
 */
export function createBatchProcessingTask<TItem, TResult>(
  processFn: (item: TItem, index: number) => Promise<TResult>,
  options: {
    type: string;
    description: string;
    batchSize?: number;
  }
): TaskDefinition<
  BatchProcessingInput<TItem, TResult>,
  TResult[],
  BatchProcessingCheckpoint
> {
  const batchSize = options.batchSize || 10;

  return {
    type: options.type,
    description: options.description,
    chunkable: true,

    estimateChunks: (input) => Math.ceil(input.items.length / (input.batchSize || batchSize)),

    executeChunk: async (input, checkpoint, context) => {
      const state = checkpoint || {
        processedCount: 0,
        totalCount: input.items.length,
        processedIds: [],
        partialResults: [],
        currentBatch: 0
      };

      if (context.shouldAbort()) {
        return { done: false, checkpoint: state };
      }

      const effectiveBatchSize = input.batchSize || batchSize;
      const startIndex = state.processedCount;
      const endIndex = Math.min(startIndex + effectiveBatchSize, input.items.length);

      context.log(`Processing batch ${state.currentBatch + 1}: items ${startIndex + 1}-${endIndex}`);

      // Process this batch
      for (let i = startIndex; i < endIndex; i++) {
        if (context.shouldAbort()) {
          break;
        }

        try {
          const result = await processFn(input.items[i], i);
          state.partialResults[i] = result;
          state.processedCount++;
          state.processedIds.push(String(i));

          // Update progress
          const progress = state.processedCount / state.totalCount;
          context.reportProgress(progress, `Processed ${state.processedCount}/${state.totalCount} items`);
        } catch (error) {
          // Store error but continue (or rethrow based on config)
          state.partialResults[i] = { _error: error instanceof Error ? error.message : String(error) };
          state.processedCount++;
        }
      }

      state.currentBatch++;

      // Save checkpoint
      await context.saveCheckpoint(state);

      // Check if done
      if (state.processedCount >= state.totalCount) {
        return {
          done: true,
          output: state.partialResults as TResult[],
          progress: 1
        };
      }

      return {
        done: false,
        checkpoint: state,
        progress: state.processedCount / state.totalCount,
        chunksCompleted: state.currentBatch,
        chunksTotal: Math.ceil(state.totalCount / effectiveBatchSize)
      };
    },

    validateCheckpoint: (checkpoint) => {
      return (
        typeof checkpoint.processedCount === 'number' &&
        typeof checkpoint.totalCount === 'number' &&
        Array.isArray(checkpoint.partialResults)
      );
    }
  };
}

// ============================================================================
// Pipeline Task
// ============================================================================

export interface PipelineStep<TContext = Record<string, unknown>> {
  name: string;
  execute: (
    context: TContext,
    taskContext: TaskExecutionContext
  ) => Promise<{ output: unknown; updatedContext?: Partial<TContext> }>;
  canResume?: boolean; // Whether this step can be skipped on resume
  rollback?: (context: TContext) => Promise<void>;
}

export interface PipelineInput<TContext = Record<string, unknown>> {
  /** Initial context */
  initialContext: TContext;
}

/**
 * Create a pipeline task definition
 */
export function createPipelineTask<TContext extends Record<string, unknown>>(
  steps: PipelineStep<TContext>[],
  options: {
    type: string;
    description: string;
  }
): TaskDefinition<PipelineInput<TContext>, Record<string, unknown>, PipelineCheckpoint> {
  return {
    type: options.type,
    description: options.description,
    chunkable: true,

    estimateChunks: () => steps.length,

    executeChunk: async (input, checkpoint, context) => {
      const state = checkpoint || {
        currentStep: 0,
        stepNames: steps.map(s => s.name),
        stepOutputs: {},
        context: input.initialContext
      };

      if (context.shouldAbort()) {
        return { done: false, checkpoint: state };
      }

      // Execute current step
      const stepIndex = state.currentStep;
      const step = steps[stepIndex];

      if (!step) {
        // All steps complete
        return {
          done: true,
          output: state.stepOutputs,
          progress: 1
        };
      }

      context.log(`Executing step ${stepIndex + 1}/${steps.length}: ${step.name}`);

      try {
        const result = await step.execute(
          state.context as TContext,
          context
        );

        // Update state
        state.stepOutputs[step.name] = result.output;
        if (result.updatedContext) {
          state.context = { ...state.context, ...result.updatedContext };
        }
        state.currentStep++;

        // Save checkpoint
        await context.saveCheckpoint(state);

        // Report progress
        const progress = state.currentStep / steps.length;
        context.reportProgress(progress, `Completed step: ${step.name}`);

        // Check if done
        if (state.currentStep >= steps.length) {
          return {
            done: true,
            output: state.stepOutputs,
            progress: 1
          };
        }

        return {
          done: false,
          checkpoint: state,
          progress,
          chunksCompleted: state.currentStep,
          chunksTotal: steps.length
        };
      } catch (error) {
        // Try to rollback if available
        if (step.rollback) {
          try {
            await step.rollback(state.context as TContext);
          } catch (rollbackError) {
            context.log(`Rollback failed: ${rollbackError}`, 'error');
          }
        }
        throw error;
      }
    },

    validateCheckpoint: (checkpoint) => {
      return (
        typeof checkpoint.currentStep === 'number' &&
        Array.isArray(checkpoint.stepNames) &&
        typeof checkpoint.stepOutputs === 'object'
      );
    }
  };
}

// ============================================================================
// Scene Writing Task (Epic Fiction specific)
// ============================================================================

export interface SceneWritingInput {
  /** Scene ID */
  sceneId: string;

  /** Scene outline/beat sheet */
  outline: string[];

  /** Character context */
  characters: Array<{
    id: string;
    name: string;
    currentState: string;
    voiceProfile?: string;
  }>;

  /** Location context */
  location: {
    name: string;
    description: string;
  };

  /** Previous scene summary (for continuity) */
  previousSceneSummary?: string;

  /** POV character */
  povCharacterId?: string;

  /** Word count target */
  targetWordCount?: number;

  /** Tone/style guidelines */
  styleGuidelines?: string;
}

export interface SceneWritingOutput {
  /** Generated prose */
  prose: string;

  /** Word count */
  wordCount: number;

  /** Beat coverage */
  beatsCovered: string[];

  /** Characters who appeared */
  appearingCharacters: string[];

  /** Quality score (if available) */
  qualityScore?: number;
}

export interface SceneWritingCheckpoint {
  /** Written content so far */
  content: string;

  /** Current beat index */
  currentBeat: number;

  /** Total beats */
  totalBeats: number;

  /** Word count so far */
  wordCount: number;

  /** Characters introduced */
  introducedCharacters: string[];

  /** Last generated section */
  lastSection: string;
}

/**
 * Create a scene writing task definition
 *
 * This is tailored for the Epic Fiction Architect system.
 */
export function createSceneWritingTask(
  generateFn: (prompt: string, options: {
    maxTokens?: number;
    systemPrompt?: string;
  }) => Promise<{ text: string; tokensUsed: number }>
): TaskDefinition<SceneWritingInput, SceneWritingOutput, SceneWritingCheckpoint> {
  return {
    type: 'scene_writing',
    description: 'Write a scene beat-by-beat with checkpointing',
    chunkable: true,

    estimateChunks: (input) => input.outline.length,

    executeChunk: async (input, checkpoint, context) => {
      const state = checkpoint || {
        content: '',
        currentBeat: 0,
        totalBeats: input.outline.length,
        wordCount: 0,
        introducedCharacters: [],
        lastSection: ''
      };

      if (context.shouldAbort()) {
        return { done: false, checkpoint: state };
      }

      // Build the current beat prompt
      const currentBeat = input.outline[state.currentBeat];
      const characterContext = input.characters
        .map(c => `- ${c.name}: ${c.currentState}${c.voiceProfile ? ` (Voice: ${c.voiceProfile})` : ''}`)
        .join('\n');

      const systemPrompt = `You are writing a scene for an epic fiction narrative.
Location: ${input.location.name} - ${input.location.description}
Characters present:
${characterContext}
${input.povCharacterId ? `POV Character: ${input.characters.find(c => c.id === input.povCharacterId)?.name}` : ''}
${input.styleGuidelines ? `Style: ${input.styleGuidelines}` : ''}

Write immersive, character-driven prose. Show don't tell. Use sensory details.`;

      const prompt = state.content
        ? `Continue the scene. Previous content (last 1500 chars):

"${state.content.slice(-1500)}"

Now write the next beat: ${currentBeat}

Write naturally, flowing from the previous content. About 300-500 words.`
        : `${input.previousSceneSummary ? `Previous scene: ${input.previousSceneSummary}\n\n` : ''}
Begin the scene with this beat: ${currentBeat}

Set the scene and introduce the situation. About 300-500 words.`;

      context.log(`Writing beat ${state.currentBeat + 1}/${state.totalBeats}: ${currentBeat.slice(0, 50)}...`);

      const result = await generateFn(prompt, {
        maxTokens: 2000,
        systemPrompt
      });

      // Update state
      state.content += (state.content ? '\n\n' : '') + result.text;
      state.wordCount = state.content.split(/\s+/).length;
      state.lastSection = result.text;
      state.currentBeat++;

      // Track characters mentioned
      for (const char of input.characters) {
        if (result.text.includes(char.name) && !state.introducedCharacters.includes(char.id)) {
          state.introducedCharacters.push(char.id);
        }
      }

      // Save checkpoint
      await context.saveCheckpoint(state);

      // Report progress
      const progress = state.currentBeat / state.totalBeats;
      context.reportProgress(
        progress,
        `Beat ${state.currentBeat}/${state.totalBeats} complete (${state.wordCount} words)`
      );

      // Check if done
      if (state.currentBeat >= state.totalBeats) {
        return {
          done: true,
          output: {
            prose: state.content,
            wordCount: state.wordCount,
            beatsCovered: input.outline.slice(0, state.currentBeat),
            appearingCharacters: state.introducedCharacters
          },
          progress: 1
        };
      }

      return {
        done: false,
        checkpoint: state,
        progress,
        chunksCompleted: state.currentBeat,
        chunksTotal: state.totalBeats
      };
    },

    validateCheckpoint: (checkpoint) => {
      return (
        typeof checkpoint.content === 'string' &&
        typeof checkpoint.currentBeat === 'number' &&
        typeof checkpoint.totalBeats === 'number' &&
        checkpoint.currentBeat <= checkpoint.totalBeats
      );
    }
  };
}

// ============================================================================
// Consistency Check Task
// ============================================================================

export interface ConsistencyCheckInput {
  /** Content to check */
  content: string;

  /** Facts to verify against */
  facts: Array<{
    id: string;
    statement: string;
    category: string;
  }>;

  /** Batch size for checking */
  batchSize?: number;
}

export interface ConsistencyViolation {
  factId: string;
  factStatement: string;
  violatingText: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ConsistencyCheckOutput {
  /** Found violations */
  violations: ConsistencyViolation[];

  /** Facts checked */
  factsChecked: number;

  /** Clean (no violations found) */
  isClean: boolean;
}

/**
 * Create a consistency check task definition
 */
export function createConsistencyCheckTask(
  checkFn: (content: string, facts: Array<{ id: string; statement: string }>) => Promise<ConsistencyViolation[]>
): TaskDefinition<ConsistencyCheckInput, ConsistencyCheckOutput, BatchProcessingCheckpoint> {
  return {
    type: 'consistency_check',
    description: 'Check content against facts in batches',
    chunkable: true,

    estimateChunks: (input) => Math.ceil(input.facts.length / (input.batchSize || 20)),

    executeChunk: async (input, checkpoint, context) => {
      const batchSize = input.batchSize || 20;
      const state = checkpoint || {
        processedCount: 0,
        totalCount: input.facts.length,
        processedIds: [],
        partialResults: [],
        currentBatch: 0
      };

      if (context.shouldAbort()) {
        return { done: false, checkpoint: state };
      }

      // Get current batch of facts
      const startIndex = state.processedCount;
      const endIndex = Math.min(startIndex + batchSize, input.facts.length);
      const batchFacts = input.facts.slice(startIndex, endIndex);

      context.log(`Checking facts ${startIndex + 1}-${endIndex} of ${input.facts.length}`);

      // Check this batch
      const violations = await checkFn(
        input.content,
        batchFacts.map(f => ({ id: f.id, statement: f.statement }))
      );

      // Store results
      state.partialResults.push(...violations);
      state.processedCount = endIndex;
      state.processedIds.push(...batchFacts.map(f => f.id));
      state.currentBatch++;

      // Save checkpoint
      await context.saveCheckpoint(state);

      // Report progress
      const progress = state.processedCount / state.totalCount;
      context.reportProgress(
        progress,
        `Checked ${state.processedCount}/${state.totalCount} facts, ${state.partialResults.length} violations found`
      );

      // Check if done
      if (state.processedCount >= state.totalCount) {
        const allViolations = state.partialResults as ConsistencyViolation[];
        return {
          done: true,
          output: {
            violations: allViolations,
            factsChecked: state.totalCount,
            isClean: allViolations.length === 0
          },
          progress: 1
        };
      }

      return {
        done: false,
        checkpoint: state,
        progress,
        chunksCompleted: state.currentBatch,
        chunksTotal: Math.ceil(state.totalCount / batchSize)
      };
    },

    validateCheckpoint: (checkpoint) => {
      return (
        typeof checkpoint.processedCount === 'number' &&
        typeof checkpoint.totalCount === 'number' &&
        Array.isArray(checkpoint.partialResults)
      );
    }
  };
}
