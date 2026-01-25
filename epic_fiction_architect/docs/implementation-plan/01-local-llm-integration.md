# Local LLM Integration Specification

## Purpose

Enable the Epic Fiction Architect to connect to locally-running language models for AI-assisted writing, editing, and analysis without requiring cloud API access or incurring per-token costs.

## Supported Backends

### Ollama
- **Protocol**: REST API (http://localhost:11434)
- **Models**: Llama 3, Mistral, Mixtral, Qwen, DeepSeek, Command-R, and custom models
- **Features**: Streaming, model management, GPU acceleration
- **Installation**: https://ollama.ai

### LM Studio
- **Protocol**: OpenAI-compatible REST API (http://localhost:1234)
- **Models**: Any GGUF-format model
- **Features**: GUI model browser, quantization options, multi-GPU support
- **Installation**: https://lmstudio.ai

### llama.cpp Server
- **Protocol**: REST API with custom endpoints
- **Models**: GGUF models with manual loading
- **Features**: Lowest-level control, grammar constraints, speculative decoding
- **Repo**: https://github.com/ggerganov/llama.cpp

### Text Generation WebUI (oobabooga)
- **Protocol**: OpenAI-compatible API or custom API
- **Models**: Multiple backends (transformers, ExLlamaV2, llama.cpp)
- **Features**: LoRA support, character cards, extensions
- **Repo**: https://github.com/oobabooga/text-generation-webui

### KoboldCpp
- **Protocol**: KoboldAI API
- **Models**: GGUF with CUDA/ROCm/Vulkan acceleration
- **Features**: Story-focused features, memory, world info integration
- **Repo**: https://github.com/LostRuins/koboldcpp

## Interface Design

```typescript
interface LocalLLMConfig {
  backend: 'ollama' | 'lmstudio' | 'llamacpp' | 'oobabooga' | 'koboldcpp' | 'openai-compatible';
  baseUrl: string;
  model: string;
  apiKey?: string; // For authenticated endpoints

  // Generation defaults
  defaults: {
    temperature: number;      // 0.0-2.0, default 0.7
    topP: number;             // 0.0-1.0, default 0.9
    topK: number;             // 1-100, default 40
    maxTokens: number;        // Max generation length
    repeatPenalty: number;    // 1.0-2.0, default 1.1
    stopSequences: string[];  // Stop generation tokens
  };

  // Connection settings
  timeout: number;            // Request timeout in ms
  retryAttempts: number;      // Auto-retry on failure
  healthCheckInterval: number; // Connection monitoring
}

interface LocalLLMProvider {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getStatus(): Promise<LLMStatus>;

  // Model operations
  listModels(): Promise<ModelInfo[]>;
  loadModel(modelId: string): Promise<void>;
  unloadModel(): Promise<void>;
  getCurrentModel(): ModelInfo | null;

  // Generation
  generate(prompt: string, options?: GenerationOptions): Promise<string>;
  generateStream(prompt: string, options?: GenerationOptions): AsyncIterable<string>;

  // Embeddings (if supported)
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;

  // Token counting
  countTokens(text: string): Promise<number>;

  // Events
  on(event: 'connected' | 'disconnected' | 'error' | 'generation-start' | 'generation-end',
     handler: (data: any) => void): void;
}

interface GenerationOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  repeatPenalty?: number;
  stopSequences?: string[];

  // Advanced options
  presencePenalty?: number;
  frequencyPenalty?: number;
  mirostat?: { mode: 1 | 2; tau: number; eta: number };
  grammar?: string; // GBNF grammar for constrained generation

  // Context management
  systemPrompt?: string;
  contextWindow?: number; // Override default context size
}

interface LLMStatus {
  connected: boolean;
  backend: string;
  model: string | null;
  contextSize: number;
  gpuLayers: number;
  memoryUsage: {
    ram: number;
    vram: number;
  };
  tokensPerSecond: number; // Last generation speed
}

interface ModelInfo {
  id: string;
  name: string;
  size: number; // Bytes
  quantization?: string; // e.g., "Q4_K_M"
  contextSize: number;
  parameters?: string; // e.g., "7B", "70B"
  family?: string; // e.g., "llama", "mistral"
}
```

## Backend Adapters

### OllamaAdapter

```typescript
class OllamaAdapter implements LocalLLMProvider {
  private baseUrl: string;
  private currentModel: string | null = null;

  async generate(prompt: string, options?: GenerationOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.currentModel,
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature,
          top_p: options?.topP,
          top_k: options?.topK,
          num_predict: options?.maxTokens,
          repeat_penalty: options?.repeatPenalty,
          stop: options?.stopSequences,
        }
      })
    });

    const data = await response.json();
    return data.response;
  }

  async *generateStream(prompt: string, options?: GenerationOptions): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.currentModel,
        prompt,
        stream: true,
        options: { /* ... */ }
      })
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        const data = JSON.parse(line);
        if (data.response) yield data.response;
      }
    }
  }
}
```

### OpenAICompatibleAdapter

For LM Studio, oobabooga, and other OpenAI-compatible servers:

```typescript
class OpenAICompatibleAdapter implements LocalLLMProvider {
  private baseUrl: string;
  private apiKey?: string;

  async generate(prompt: string, options?: GenerationOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({
        model: this.currentModel,
        prompt,
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
        top_p: options?.topP ?? 0.9,
        stop: options?.stopSequences,
        stream: false
      })
    });

    const data = await response.json();
    return data.choices[0].text;
  }

  // Chat completions variant
  async chat(messages: ChatMessage[], options?: GenerationOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({
        model: this.currentModel,
        messages,
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
        stream: false
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
```

## Integration with Epic Fiction Architect

### Writing Assistance

```typescript
interface WritingAssistant {
  // Scene generation
  generateScene(context: SceneContext): Promise<string>;
  continueScene(partialScene: string, context: SceneContext): Promise<string>;

  // Editing
  expandParagraph(paragraph: string, context: SceneContext): Promise<string>;
  condenseParagraph(paragraph: string, targetLength: number): Promise<string>;
  rephraseForVoice(text: string, characterVoice: VoiceProfile): Promise<string>;

  // Analysis
  analyzeConsistency(scene: string, context: StoryContext): Promise<ConsistencyReport>;
  suggestImprovements(scene: string): Promise<Suggestion[]>;

  // Dialogue
  generateDialogue(characters: Character[], situation: string): Promise<DialogueLine[]>;
  rewriteDialogueForCharacter(line: string, character: Character): Promise<string>;
}

interface SceneContext {
  previousScenes: SceneSummary[];
  characters: CharacterState[];
  location: Location;
  plotThreads: PlotThread[];
  emotionalTone: string;
  pov: Character;

  // Lorebook entries to inject
  relevantLore: LorebookEntry[];
}
```

### Prompt Templates

```typescript
const PROMPT_TEMPLATES = {
  sceneGeneration: `
You are writing a scene for an epic fiction novel. Write in third-person limited POV from {{pov.name}}'s perspective.

SETTING: {{location.name}} - {{location.description}}
TIME: {{timeline.currentDate}}

CHARACTERS PRESENT:
{{#each characters}}
- {{name}}: {{currentState}}
{{/each}}

ACTIVE PLOT THREADS:
{{#each plotThreads}}
- {{name}}: {{currentStatus}}
{{/each}}

PREVIOUS CONTEXT:
{{previousSceneSummary}}

SCENE GOAL: {{sceneGoal}}
EMOTIONAL TONE: {{emotionalTone}}

Write the scene, focusing on:
- Authentic character voices
- Sensory details
- Advancing the plot threads naturally
- {{pov.name}}'s internal experience

---

`,

  dialogueRewrite: `
Rewrite this dialogue line to match {{character.name}}'s voice:
- Speech patterns: {{character.speechPatterns}}
- Vocabulary level: {{character.vocabularyLevel}}
- Emotional state: {{character.currentEmotionalState}}
- Quirks: {{character.speechQuirks}}

ORIGINAL: "{{originalLine}}"

REWRITTEN (same meaning, {{character.name}}'s voice):
`,

  consistencyCheck: `
Analyze this scene for consistency with established story facts:

SCENE:
{{scene}}

ESTABLISHED FACTS:
{{#each facts}}
- {{category}}: {{content}}
{{/each}}

List any inconsistencies found (character knowledge, timeline, physical descriptions, world rules):
`
};
```

## Context Window Management

For epic-scale projects, context management is critical:

```typescript
interface ContextManager {
  // Calculate optimal context allocation
  allocateContext(
    contextWindow: number,
    components: ContextComponent[]
  ): ContextAllocation;

  // Compress context to fit window
  compressContext(
    content: string,
    targetTokens: number
  ): Promise<string>;

  // Prioritize which information to include
  prioritizeInformation(
    available: ContextComponent[],
    currentScene: SceneContext
  ): ContextComponent[];
}

interface ContextComponent {
  type: 'system' | 'lorebook' | 'summary' | 'scene' | 'dialogue';
  content: string;
  tokens: number;
  priority: number; // 0-1, higher = more important
  relevanceScore: number; // How relevant to current generation
}

interface ContextAllocation {
  systemPrompt: number;      // Reserved tokens
  lorebookEntries: number;   // Dynamic based on relevance
  recentScenes: number;      // Sliding window
  currentGeneration: number; // Output budget
  reserved: number;          // Safety margin
}
```

## Configuration UI

```typescript
interface LocalLLMConfigUI {
  // Backend selection
  backendType: SelectField<BackendType>;
  serverUrl: TextField;
  apiKey: PasswordField; // Optional

  // Model selection
  modelList: RefreshableSelect<ModelInfo>;
  contextSize: NumberField; // Override or auto-detect

  // Generation presets
  presets: {
    creative: GenerationOptions;    // Higher temp, more variety
    balanced: GenerationOptions;    // Default settings
    precise: GenerationOptions;     // Lower temp, more focused
    custom: GenerationOptions;      // User-defined
  };

  // Test connection
  testConnection(): Promise<ConnectionTestResult>;

  // Benchmark
  runBenchmark(): Promise<BenchmarkResult>;
}
```

## Error Handling

```typescript
enum LLMError {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  CONTEXT_OVERFLOW = 'CONTEXT_OVERFLOW',
  GENERATION_TIMEOUT = 'GENERATION_TIMEOUT',
  OUT_OF_MEMORY = 'OUT_OF_MEMORY',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  RATE_LIMITED = 'RATE_LIMITED'
}

class LLMErrorHandler {
  handle(error: LLMError, context: ErrorContext): ErrorResolution {
    switch (error) {
      case LLMError.CONTEXT_OVERFLOW:
        return {
          action: 'compress',
          message: 'Context too long, compressing...',
          recovery: () => this.compressAndRetry(context)
        };

      case LLMError.OUT_OF_MEMORY:
        return {
          action: 'notify',
          message: 'GPU memory exhausted. Try a smaller model or reduce context.',
          recovery: null
        };

      case LLMError.CONNECTION_FAILED:
        return {
          action: 'retry',
          message: 'Connection lost, retrying...',
          recovery: () => this.reconnectWithBackoff(context)
        };

      // ... other cases
    }
  }
}
```

## Testing Strategy

1. **Unit Tests**: Mock server responses for each backend
2. **Integration Tests**: Test against actual Ollama/LM Studio instances
3. **Benchmark Tests**: Measure tokens/second, memory usage
4. **Stress Tests**: Long-running generation, context edge cases

## Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Define interfaces and types
- [ ] Implement OllamaAdapter
- [ ] Implement OpenAICompatibleAdapter
- [ ] Basic error handling
- [ ] Connection management

### Phase 2: Generation Features
- [ ] Streaming support
- [ ] Context management
- [ ] Prompt template system
- [ ] Token counting

### Phase 3: Integration
- [ ] Writing assistant functions
- [ ] Lorebook context injection
- [ ] Consistency checking
- [ ] UI configuration panel

### Phase 4: Optimization
- [ ] Context compression
- [ ] Caching strategies
- [ ] Batch generation
- [ ] Performance monitoring
