/**
 * Task Resilience Engine - Usage Examples
 *
 * Practical examples of how to use the resilience system to protect
 * AI-assisted writing operations from connection issues and failures.
 */

import {
  TaskResilienceEngine,
  executeWithResilience,
  makeResilient,
  createTextGenerationTask,
  createSceneWritingTask,
  createBatchProcessingTask,
  createPipelineTask
} from './index';

// ============================================================================
// Example 1: Simple Resilient API Call
// ============================================================================

/**
 * The simplest way to add resilience - wrap a single function call
 */
async function example1_simpleResilientCall() {
  // Simulated AI API call
  async function callAI(prompt: string): Promise<string> {
    // This might fail due to connection issues
    const response = await fetch('https://api.example.com/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    return response.json() as Promise<string>;
  }

  // Make it resilient with automatic retries
  const result = await executeWithResilience(
    () => callAI('Write a haiku about coding'),
    {
      maxAttempts: 5,
      baseDelayMs: 2000,
      maxDelayMs: 30000,
      onRetry: (attempt, error, delay) => {
        console.log(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
      }
    }
  );

  if (result.success) {
    console.log('Generated:', result.result);
  } else {
    console.log('Failed after', result.attempts, 'attempts:', result.error?.message);
  }
}

// ============================================================================
// Example 2: Wrap Existing Functions
// ============================================================================

/**
 * Make any async function resilient by wrapping it
 */
function example2_wrapFunction() {
  // Original unreliable function
  async function generateScene(sceneId: string, _prompt: string): Promise<{ text: string; tokens: number }> {
    // ... API call that might fail
    console.log(`Generating scene ${sceneId}`);
    return { text: 'Generated scene...', tokens: 500 };
  }

  // Wrap it to make it resilient
  const resilientGenerateScene = makeResilient(generateScene, {
    maxAttempts: 5,
    baseDelayMs: 2000,
    onRetry: (_attempt, _error, args) => {
      console.log(`Scene ${args[0]} generation failed, retrying...`);
    }
  });

  // Use it just like the original
  return resilientGenerateScene('scene-123', 'A dramatic confrontation');
}

// ============================================================================
// Example 3: Full Task Queue for Long Operations
// ============================================================================

/**
 * For long-running operations, use the full task queue with checkpointing
 */
async function example3_fullTaskQueue() {
  // Create the resilience engine
  const engine = new TaskResilienceEngine({
    dbPath: './data/tasks.db',  // Persistent storage
    concurrency: 2,              // Max 2 tasks at once
    autoStart: true
  });

  // Mock generation function (replace with real AI call)
  async function generateText(prompt: string, options: { maxTokens?: number }) {
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    return {
      text: `Generated text for: ${prompt.slice(0, 50)}...`,
      tokensUsed: options.maxTokens || 1000
    };
  }

  // Register the scene writing task
  engine.registerTask(createSceneWritingTask(generateText));

  // Subscribe to events for progress updates
  engine.on(event => {
    switch (event.type) {
      case 'task_started':
        console.log(`[Started] ${event.task.type} (${event.task.id})`);
        break;
      case 'task_progress':
        console.log(`[Progress] ${Math.round(event.progress * 100)}% - ${event.message}`);
        break;
      case 'task_checkpointed':
        console.log(`[Checkpoint] Saved progress for ${event.task.id}`);
        break;
      case 'task_completed':
        console.log(`[Completed] ${event.task.id}`);
        break;
      case 'task_failed':
        console.log(`[Failed] ${event.task.id}: ${event.error.message}`);
        if (event.willRetry) {
          console.log('  Will retry...');
        }
        break;
      case 'task_retrying':
        console.log(`[Retrying] Attempt ${event.attemptNumber} in ${event.delayMs}ms`);
        break;
    }
  });

  // Enqueue a scene writing task
  const taskId = await engine.enqueue('scene_writing', {
    sceneId: 'scene-001',
    outline: [
      'Establish the setting - a rain-soaked Tokyo street at night',
      'Introduce protagonist Yuki scanning the crowd',
      'Mysterious figure appears at the far end of the street',
      'Tension builds as they approach each other',
      'Climactic confrontation with a twist reveal'
    ],
    characters: [
      { id: 'char-1', name: 'Yuki', currentState: 'Alert, searching' },
      { id: 'char-2', name: 'The Shadow', currentState: 'Approaching menacingly' }
    ],
    location: {
      name: 'Shibuya Backstreet',
      description: 'Narrow alley behind the main crossing, neon reflections on wet pavement'
    },
    styleGuidelines: 'Noir atmosphere, short punchy sentences, focus on sensory details'
  }, {
    priority: 'high',
    tags: ['chapter-1', 'action-scene'],
    projectId: 'my-novel'
  });

  console.log(`Enqueued task: ${taskId}`);

  // Wait for completion (with progress updates)
  const result = await engine.waitForTask(taskId, {
    timeoutMs: 300000, // 5 minutes
    onProgress: (progress, message) => {
      // Progress bar
      const bar = '█'.repeat(Math.round(progress * 20)) + '░'.repeat(20 - Math.round(progress * 20));
      process.stdout.write(`\r[${bar}] ${Math.round(progress * 100)}% ${message || ''}`);
    }
  });

  console.log('\n');

  if (result.status === 'completed' && result.output) {
    const output = JSON.parse(result.output);
    console.log('Generated scene:');
    console.log(output.prose);
    console.log(`\nWord count: ${output.wordCount}`);
  }

  // Cleanup
  await engine.stop();
}

// ============================================================================
// Example 4: Batch Processing with Checkpointing
// ============================================================================

/**
 * Process many items with automatic checkpointing
 */
async function example4_batchProcessing() {
  const engine = new TaskResilienceEngine({ inMemory: true, autoStart: true });

  // Create a batch processing task for character analysis
  const characterAnalysisTask = createBatchProcessingTask<
    { id: string; name: string; dialogue: string[] },
    { id: string; voiceTraits: string[]; emotionalRange: string[] }
  >(
    async (character, _index) => {
      // Simulate AI analysis
      await new Promise(r => setTimeout(r, 500));
      return {
        id: character.id,
        voiceTraits: ['formal', 'measured', 'witty'],
        emotionalRange: ['calm', 'angry', 'amused']
      };
    },
    {
      type: 'character_voice_analysis',
      description: 'Analyze character voice patterns',
      batchSize: 5
    }
  );

  engine.registerTask(characterAnalysisTask);

  // Process 50 characters
  const characters = Array.from({ length: 50 }, (_, i) => ({
    id: `char-${i}`,
    name: `Character ${i}`,
    dialogue: ['Hello there', 'What do you mean?', 'I see...']
  }));

  const taskId = await engine.enqueue('character_voice_analysis', {
    items: characters,
    batchSize: 5
  });

  // If connection drops mid-way, the task will resume from the last checkpoint
  // when the engine restarts

  await engine.waitForTask(taskId);
  console.log(`Analyzed ${characters.length} characters`);

  await engine.stop();
}

// ============================================================================
// Example 5: Multi-Step Pipeline
// ============================================================================

/**
 * Complex multi-step operations with rollback support
 */
async function example5_pipeline() {
  const engine = new TaskResilienceEngine({ inMemory: true, autoStart: true });

  // Define a content generation pipeline
  const contentPipeline = createPipelineTask<{
    projectId: string;
    chapterId: string;
    outline?: string;
    draft?: string;
    editedDraft?: string;
    finalContent?: string;
  }>(
    [
      {
        name: 'generate_outline',
        execute: async (_ctx, taskCtx) => {
          taskCtx.log('Generating chapter outline...');
          await new Promise(r => setTimeout(r, 1000));
          return {
            output: 'Outline generated',
            updatedContext: {
              outline: '1. Opening hook\n2. Rising action\n3. Climax\n4. Resolution'
            }
          };
        }
      },
      {
        name: 'write_draft',
        execute: async (ctx, taskCtx) => {
          taskCtx.log('Writing first draft based on outline...');
          await new Promise(r => setTimeout(r, 2000));
          return {
            output: 'Draft complete',
            updatedContext: {
              draft: `The story begins... (based on: ${ctx.outline?.slice(0, 30)}...)`
            }
          };
        }
      },
      {
        name: 'edit_and_polish',
        execute: async (ctx, taskCtx) => {
          taskCtx.log('Editing and polishing draft...');
          await new Promise(r => setTimeout(r, 1500));
          return {
            output: 'Editing complete',
            updatedContext: {
              editedDraft: ctx.draft + ' [EDITED]'
            }
          };
        }
      },
      {
        name: 'final_review',
        execute: async (ctx, taskCtx) => {
          taskCtx.log('Final quality review...');
          await new Promise(r => setTimeout(r, 1000));
          return {
            output: { qualityScore: 0.92, wordCount: 5000 },
            updatedContext: {
              finalContent: ctx.editedDraft + ' [REVIEWED]'
            }
          };
        }
      }
    ],
    {
      type: 'content_generation_pipeline',
      description: 'Full content generation workflow'
    }
  );

  engine.registerTask(contentPipeline);

  const taskId = await engine.enqueue('content_generation_pipeline', {
    initialContext: {
      projectId: 'novel-1',
      chapterId: 'chapter-5'
    }
  });

  engine.on(event => {
    if (event.type === 'task_progress') {
      console.log(`Pipeline progress: ${event.message}`);
    }
  });

  const result = await engine.waitForTask(taskId);
  console.log('Pipeline complete:', result.status);

  await engine.stop();
}

// ============================================================================
// Example 6: Circuit Breaker for API Protection
// ============================================================================

/**
 * Protect against cascade failures when API is having issues
 */
async function example6_circuitBreaker() {
  const engine = new TaskResilienceEngine({
    inMemory: true,
    autoStart: true
  });

  // The engine automatically creates circuit breakers per task type
  // If a task type fails repeatedly, it will temporarily stop accepting
  // new tasks of that type to let the API recover

  engine.on(event => {
    if (event.type === 'circuit_opened') {
      console.log(`⚠️ Circuit OPENED for ${event.taskType} - pausing new tasks`);
    }
    if (event.type === 'circuit_half_open') {
      console.log(`🔄 Circuit HALF-OPEN for ${event.taskType} - testing recovery`);
    }
    if (event.type === 'circuit_closed') {
      console.log(`✅ Circuit CLOSED for ${event.taskType} - normal operation resumed`);
    }
  });

  // Check circuit breaker status
  const stats = await engine.getStats();
  console.log('Circuit breakers:', stats.circuitBreakers);

  await engine.stop();
}

// ============================================================================
// Example 7: Recovery After Crash
// ============================================================================

/**
 * When using SQLite storage, tasks survive process restarts
 */
async function example7_crashRecovery() {
  // Session 1: Start a long task
  console.log('=== Session 1: Starting task ===');
  {
    const engine = new TaskResilienceEngine({
      dbPath: './data/tasks.db',
      autoStart: true
    });

    // Register task types (must do this each session)
    engine.registerTask(createTextGenerationTask(async (_prompt) => {
      await new Promise(r => setTimeout(r, 500));
      return { text: 'Generated...', tokensUsed: 100 };
    }));

    // Start a long task
    const taskId = await engine.enqueue('text_generation', {
      prompt: 'Write an epic fantasy novel',
      sections: Array.from({ length: 100 }, (_, i) => `Chapter ${i + 1}`)
    });

    console.log('Started task:', taskId);

    // Let it run for a bit
    await new Promise(r => setTimeout(r, 3000));

    // "Crash" - stop without waiting for completion
    console.log('Simulating crash...');
    await engine.stop();
  }

  // Session 2: Recover and continue
  console.log('\n=== Session 2: Recovering ===');
  {
    const engine = new TaskResilienceEngine({
      dbPath: './data/tasks.db',
      autoStart: true,
      staleTaskRecoveryMs: 1000 // Recover stale tasks quickly for demo
    });

    // Re-register task types
    engine.registerTask(createTextGenerationTask(async (_prompt) => {
      await new Promise(r => setTimeout(r, 500));
      return { text: 'Generated...', tokensUsed: 100 };
    }));

    // Check what tasks we have
    const stats = await engine.getStats();
    console.log('Pending:', stats.pending);
    console.log('In Progress:', stats.inProgress);
    console.log('Retrying:', stats.retrying);

    // The engine will automatically recover stale in-progress tasks
    // and resume them from their last checkpoint

    // Wait a bit for recovery
    await new Promise(r => setTimeout(r, 5000));

    await engine.stop();
  }
}

// ============================================================================
// Example 8: Integration with Existing Code
// ============================================================================

/**
 * How to integrate with the Epic Fiction Architect's existing engines
 */
async function example8_integration() {
  // Import existing engines (pseudo-code)
  // import { WritingGenerationEngine } from '../writing-generation';
  // import { ConsistencyChecker } from '../consistency';

  const engine = new TaskResilienceEngine({
    dbPath: './data/tasks.db',
    autoStart: true
  });

  // Wrap existing engine methods with resilience
  // const writerEngine = new WritingGenerationEngine();

  // Register a resilient version of scene generation
  engine.registerTask({
    type: 'resilient_scene_generation',
    description: 'Generate scene with resilience',
    chunkable: true,

    estimateChunks: (input: { beats: string[] }) => input.beats.length,

    executeChunk: async (input, checkpoint, context) => {
      const state: { currentBeat: number; content: string } = checkpoint as { currentBeat: number; content: string } || { currentBeat: 0, content: '' };

      // Call the existing engine (with retry handled by the queue)
      // const result = await writerEngine.generateBeat(input.beats[state.currentBeat]);

      // Simulated:
      await new Promise(r => setTimeout(r, 500));
      const result = { text: `Beat ${state.currentBeat} content`, tokens: 100 };

      state.content += result.text + '\n';
      state.currentBeat++;

      await context.saveCheckpoint(state);

      if (state.currentBeat >= input.beats.length) {
        return { done: true, output: { content: state.content } };
      }

      return {
        done: false,
        checkpoint: state,
        progress: state.currentBeat / input.beats.length
      };
    }
  });

  // Now use it
  const result = await engine.executeAndWait('resilient_scene_generation', {
    beats: ['Opening', 'Conflict', 'Resolution']
  });

  console.log(result.success ? 'Success!' : `Failed: ${result.error}`);

  await engine.stop();
}

// Export for running individual examples
export {
  example1_simpleResilientCall,
  example2_wrapFunction,
  example3_fullTaskQueue,
  example4_batchProcessing,
  example5_pipeline,
  example6_circuitBreaker,
  example7_crashRecovery,
  example8_integration
};
