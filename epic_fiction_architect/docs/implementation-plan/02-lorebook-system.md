# Lorebook/WorldInfo System Specification

## Purpose

Implement a context injection system compatible with NovelAI and SillyTavern lorebook formats, enabling automatic insertion of relevant world information, character details, and story context into LLM prompts based on trigger conditions.

## Format Compatibility

### NovelAI Lorebook Format

```typescript
interface NovelAILorebook {
  lorebookVersion: number; // Currently 5
  entries: NovelAIEntry[];
  settings: {
    orderByKeyLocations: boolean;
  };
  categories: NovelAICategory[];
}

interface NovelAIEntry {
  text: string;                    // Content to inject
  contextConfig: {
    prefix: string;                // Text before entry
    suffix: string;                // Text after entry
    tokenBudget: number;           // Max tokens for this entry
    reservedTokens: number;        // Always reserve this many
    budgetPriority: number;        // Higher = more important
    trimDirection: 'trimBottom' | 'trimTop' | 'doNotTrim';
    insertionType: 'newline' | 'sentence' | 'token';
    maximumTrimType: 'sentence' | 'newline' | 'token';
    insertionPosition: number;     // -1 = end, 0+ = position from start
  };
  lastUpdatedAt: number;
  displayName: string;
  keys: string[];                  // Trigger keywords
  searchRange: number;             // How far back to search for triggers
  enabled: boolean;
  forceActivation: boolean;        // Always include
  keyRelative: boolean;            // Position relative to key
  nonStoryActivatable: boolean;    // Activate in Author's Note too
  category: string;
  loreBiasGroups: BiasGroup[];     // Token probability adjustments
}

interface NovelAICategory {
  name: string;
  id: string;
  enabled: boolean;
  createSubcontext: boolean;
  subcontextSettings: {
    text: string;
    contextConfig: ContextConfig;
  };
  useCategoryDefaults: boolean;
  categoryDefaults: ContextConfig;
  categoryBiasGroups: BiasGroup[];
  open: boolean;
}
```

### SillyTavern WorldInfo Format

```typescript
interface SillyTavernWorldInfo {
  entries: Record<string, SillyTavernEntry>;
  originalData?: {
    // Preserves original format metadata
  };
}

interface SillyTavernEntry {
  uid: number;
  key: string[];                   // Trigger keywords (array or comma-separated)
  keysecondary: string[];          // Secondary keys (AND logic with primary)
  comment: string;                 // Display name/description
  content: string;                 // Content to inject
  constant: boolean;               // Always include
  selective: boolean;              // Require secondary key match
  selectiveLogic: 0 | 1 | 2 | 3;   // 0=AND ALL, 1=NOT ALL, 2=NOT ANY, 3=AND ANY
  addMemo: boolean;                // Show in UI
  order: number;                   // Insertion order
  position: 0 | 1 | 2 | 3 | 4;     // Where to insert
  disable: boolean;                // Entry disabled
  excludeRecursion: boolean;       // Don't trigger from other entries
  preventRecursion: boolean;       // Don't let this trigger others
  delayUntilRecursion: boolean;    // Only activate via recursion
  probability: number;             // 0-100, chance to activate
  useProbability: boolean;         // Enable probability
  depth: number;                   // How deep in context (for position 4)
  group: string;                   // Grouping for UI
  groupOverride: boolean;          // Override group settings
  groupWeight: number;             // Weight within group
  scanDepth: number;               // How far back to scan for triggers
  caseSensitive: boolean;          // Key matching case sensitivity
  matchWholeWords: boolean;        // Whole word matching only
  automationId: string;            // For external automation
  role: 0 | 1 | 2;                 // 0=system, 1=user, 2=assistant
  vectorized: boolean;             // Use vector similarity
  sticky: number;                  // Stay active for N messages after trigger
  cooldown: number;                // Minimum messages between activations
  delay: number;                   // Messages before first activation
}
```

## Unified Internal Format

```typescript
interface LorebookEntry {
  id: string;
  name: string;
  content: string;

  // Trigger configuration
  triggers: {
    keywords: string[];            // Primary trigger words
    secondaryKeywords?: string[];  // Secondary conditions
    keywordLogic: 'any' | 'all';   // How to combine keywords
    secondaryLogic: 'and' | 'not'; // Relationship with secondary
    caseSensitive: boolean;
    wholeWord: boolean;
    regex?: string;                // Advanced: regex pattern
  };

  // Activation settings
  activation: {
    enabled: boolean;
    constant: boolean;             // Always include
    probability: number;           // 0-1, activation chance
    scanDepth: number;             // Tokens to scan back
    sticky: number;                // Stay active N turns
    cooldown: number;              // Min turns between activations
    delay: number;                 // Turns before first activation
  };

  // Insertion settings
  insertion: {
    position: 'before_char' | 'after_char' | 'before_scenario' |
              'after_scenario' | 'at_depth' | 'before_author_note' | 'after_author_note';
    depth?: number;                // For 'at_depth' position
    order: number;                 // Sort order among entries
    prefix: string;
    suffix: string;
  };

  // Token budget
  budget: {
    maxTokens: number;
    priority: number;              // Higher = more likely to be included
    trimDirection: 'start' | 'end' | 'none';
  };

  // Organization
  category: string;
  tags: string[];

  // Recursion control
  recursion: {
    exclude: boolean;              // Don't trigger from other entries
    prevent: boolean;              // Don't trigger other entries
    delayUntil: boolean;           // Only via recursion
  };

  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    source?: string;               // Import source
    notes?: string;                // Author notes
  };
}

interface Lorebook {
  id: string;
  name: string;
  description: string;
  version: number;
  entries: LorebookEntry[];
  categories: LorebookCategory[];
  settings: LorebookSettings;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    tags: string[];
  };
}

interface LorebookCategory {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  order: number;
  defaultSettings?: Partial<LorebookEntry>; // Defaults for entries in category
  color?: string;                  // UI color coding
}

interface LorebookSettings {
  globalScanDepth: number;
  maxActiveEntries: number;
  totalTokenBudget: number;
  recursionLimit: number;
  enableVectorSearch: boolean;
  vectorSimilarityThreshold: number;
}
```

## Import/Export System

```typescript
interface LorebookConverter {
  // Import from external formats
  importNovelAI(json: string): Lorebook;
  importSillyTavern(json: string): Lorebook;
  importKoboldAI(json: string): Lorebook;

  // Export to external formats
  exportNovelAI(lorebook: Lorebook): string;
  exportSillyTavern(lorebook: Lorebook): string;
  exportKoboldAI(lorebook: Lorebook): string;

  // Auto-detect format
  detectFormat(json: string): 'novelai' | 'sillytavern' | 'koboldai' | 'native' | 'unknown';
  importAny(json: string): Lorebook;
}

class LorebookConverterImpl implements LorebookConverter {
  importNovelAI(json: string): Lorebook {
    const data: NovelAILorebook = JSON.parse(json);

    return {
      id: generateId(),
      name: 'Imported NovelAI Lorebook',
      description: '',
      version: 1,
      entries: data.entries.map(entry => this.convertNovelAIEntry(entry)),
      categories: data.categories.map(cat => this.convertNovelAICategory(cat)),
      settings: {
        globalScanDepth: 1000,
        maxActiveEntries: 50,
        totalTokenBudget: 2048,
        recursionLimit: 3,
        enableVectorSearch: false,
        vectorSimilarityThreshold: 0.7
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['imported', 'novelai']
      }
    };
  }

  private convertNovelAIEntry(entry: NovelAIEntry): LorebookEntry {
    return {
      id: generateId(),
      name: entry.displayName,
      content: entry.text,
      triggers: {
        keywords: entry.keys,
        keywordLogic: 'any',
        caseSensitive: false,
        wholeWord: true
      },
      activation: {
        enabled: entry.enabled,
        constant: entry.forceActivation,
        probability: 1,
        scanDepth: entry.searchRange,
        sticky: 0,
        cooldown: 0,
        delay: 0
      },
      insertion: {
        position: this.mapNovelAIPosition(entry.contextConfig.insertionPosition),
        order: entry.contextConfig.budgetPriority,
        prefix: entry.contextConfig.prefix,
        suffix: entry.contextConfig.suffix
      },
      budget: {
        maxTokens: entry.contextConfig.tokenBudget,
        priority: entry.contextConfig.budgetPriority,
        trimDirection: this.mapTrimDirection(entry.contextConfig.trimDirection)
      },
      category: entry.category,
      tags: [],
      recursion: {
        exclude: false,
        prevent: false,
        delayUntil: false
      },
      metadata: {
        createdAt: new Date(entry.lastUpdatedAt),
        updatedAt: new Date(entry.lastUpdatedAt),
        source: 'novelai'
      }
    };
  }

  // ... similar conversion methods for other formats
}
```

## Context Injection Engine

```typescript
interface ContextInjector {
  // Main injection method
  injectContext(
    prompt: string,
    lorebook: Lorebook,
    state: InjectionState
  ): InjectionResult;

  // Scan for trigger matches
  findTriggers(
    text: string,
    entries: LorebookEntry[],
    settings: LorebookSettings
  ): TriggerMatch[];

  // Select entries within budget
  selectEntries(
    matches: TriggerMatch[],
    budget: number
  ): LorebookEntry[];

  // Apply recursion (entries triggering other entries)
  applyRecursion(
    activeEntries: LorebookEntry[],
    lorebook: Lorebook,
    depth: number
  ): LorebookEntry[];
}

interface InjectionState {
  messageHistory: Message[];
  turnNumber: number;
  activeStickyEntries: Map<string, number>; // entryId -> turns remaining
  cooldownEntries: Map<string, number>;     // entryId -> turns until available
  delayedEntries: Map<string, number>;      // entryId -> turns until first available
}

interface TriggerMatch {
  entry: LorebookEntry;
  matchedKeywords: string[];
  matchPositions: number[];
  score: number; // Relevance score
}

interface InjectionResult {
  modifiedPrompt: string;
  activeEntries: LorebookEntry[];
  tokensUsed: number;
  truncatedEntries: string[]; // Entry IDs that were truncated
  skippedEntries: string[];   // Entry IDs skipped due to budget
  newState: InjectionState;
}

class ContextInjectorImpl implements ContextInjector {
  injectContext(
    prompt: string,
    lorebook: Lorebook,
    state: InjectionState
  ): InjectionResult {
    // 1. Update state (cooldowns, sticky, delays)
    const updatedState = this.updateState(state);

    // 2. Find all trigger matches
    const matches = this.findTriggers(prompt, lorebook.entries, lorebook.settings);

    // 3. Add constant entries
    const constantEntries = lorebook.entries.filter(e =>
      e.activation.enabled && e.activation.constant
    );

    // 4. Add sticky entries still active
    const stickyEntries = Array.from(updatedState.activeStickyEntries.keys())
      .map(id => lorebook.entries.find(e => e.id === id))
      .filter(Boolean) as LorebookEntry[];

    // 5. Combine and dedupe
    const candidates = this.dedupeEntries([
      ...constantEntries,
      ...stickyEntries,
      ...matches.map(m => m.entry)
    ]);

    // 6. Filter by probability, cooldown, delay
    const eligible = this.filterEligible(candidates, updatedState);

    // 7. Apply recursion
    const withRecursion = this.applyRecursion(
      eligible,
      lorebook,
      lorebook.settings.recursionLimit
    );

    // 8. Select within budget
    const selected = this.selectEntries(withRecursion, lorebook.settings.totalTokenBudget);

    // 9. Build modified prompt
    const modifiedPrompt = this.buildPrompt(prompt, selected);

    // 10. Update sticky state
    const newState = this.updateStickyState(updatedState, selected);

    return {
      modifiedPrompt,
      activeEntries: selected,
      tokensUsed: this.countTokens(selected),
      truncatedEntries: [],
      skippedEntries: [],
      newState
    };
  }

  findTriggers(
    text: string,
    entries: LorebookEntry[],
    settings: LorebookSettings
  ): TriggerMatch[] {
    const textToScan = text.slice(-settings.globalScanDepth);
    const matches: TriggerMatch[] = [];

    for (const entry of entries) {
      if (!entry.activation.enabled || entry.activation.constant) continue;

      const scanText = textToScan.slice(-entry.activation.scanDepth);
      const matchResult = this.matchEntry(scanText, entry);

      if (matchResult.matched) {
        matches.push({
          entry,
          matchedKeywords: matchResult.keywords,
          matchPositions: matchResult.positions,
          score: this.calculateScore(matchResult, entry)
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  private matchEntry(text: string, entry: LorebookEntry): MatchResult {
    const { triggers } = entry;
    const normalizedText = triggers.caseSensitive ? text : text.toLowerCase();

    // Check primary keywords
    const primaryMatches = triggers.keywords.filter(keyword => {
      const normalizedKeyword = triggers.caseSensitive ? keyword : keyword.toLowerCase();

      if (triggers.wholeWord) {
        const regex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`);
        return regex.test(normalizedText);
      }

      return normalizedText.includes(normalizedKeyword);
    });

    // Check if primary condition is met
    const primaryMet = triggers.keywordLogic === 'any'
      ? primaryMatches.length > 0
      : primaryMatches.length === triggers.keywords.length;

    if (!primaryMet) return { matched: false, keywords: [], positions: [] };

    // Check secondary keywords if present
    if (triggers.secondaryKeywords?.length) {
      const secondaryMatches = triggers.secondaryKeywords.filter(keyword => {
        const normalizedKeyword = triggers.caseSensitive ? keyword : keyword.toLowerCase();
        return normalizedText.includes(normalizedKeyword);
      });

      const secondaryMet = triggers.secondaryLogic === 'and'
        ? secondaryMatches.length > 0
        : secondaryMatches.length === 0;

      if (!secondaryMet) return { matched: false, keywords: [], positions: [] };
    }

    return {
      matched: true,
      keywords: primaryMatches,
      positions: this.findPositions(text, primaryMatches)
    };
  }
}
```

## Vector Search Integration

For semantic matching beyond keyword triggers:

```typescript
interface VectorSearchConfig {
  enabled: boolean;
  embeddingModel: string;
  similarityThreshold: number;
  maxResults: number;
}

interface VectorizedEntry extends LorebookEntry {
  embedding?: number[];
  embeddingModel?: string;
}

class VectorLorebookSearch {
  private embeddings: Map<string, number[]> = new Map();

  async vectorizeEntries(
    entries: LorebookEntry[],
    llmProvider: LocalLLMProvider
  ): Promise<void> {
    for (const entry of entries) {
      if (!this.embeddings.has(entry.id)) {
        const embedding = await llmProvider.embed(
          `${entry.name}: ${entry.content}`
        );
        this.embeddings.set(entry.id, embedding);
      }
    }
  }

  async findSimilar(
    query: string,
    entries: LorebookEntry[],
    llmProvider: LocalLLMProvider,
    threshold: number
  ): Promise<TriggerMatch[]> {
    const queryEmbedding = await llmProvider.embed(query);

    const similarities = entries
      .filter(e => this.embeddings.has(e.id))
      .map(entry => ({
        entry,
        similarity: this.cosineSimilarity(
          queryEmbedding,
          this.embeddings.get(entry.id)!
        )
      }))
      .filter(({ similarity }) => similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);

    return similarities.map(({ entry, similarity }) => ({
      entry,
      matchedKeywords: ['[semantic]'],
      matchPositions: [],
      score: similarity
    }));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
```

## Integration with Story Bible

Connect lorebook entries to existing story bible data:

```typescript
interface StoryBibleLorebookBridge {
  // Generate lorebook entries from story bible
  generateFromCharacter(character: Character): LorebookEntry[];
  generateFromLocation(location: Location): LorebookEntry[];
  generateFromFaction(faction: Faction): LorebookEntry[];
  generateFromEvent(event: TimelineEvent): LorebookEntry[];
  generateFromTechnology(tech: Technology): LorebookEntry[];

  // Sync changes bidirectionally
  syncToStoryBible(entry: LorebookEntry): void;
  syncFromStoryBible(entityType: string, entityId: string): LorebookEntry;

  // Bulk operations
  generateFullLorebook(storyBible: StoryBible): Lorebook;
  updateLorebookFromBible(lorebook: Lorebook, storyBible: StoryBible): Lorebook;
}

class StoryBibleLorebookBridgeImpl implements StoryBibleLorebookBridge {
  generateFromCharacter(character: Character): LorebookEntry[] {
    const entries: LorebookEntry[] = [];

    // Basic character entry
    entries.push({
      id: `char-${character.id}-basic`,
      name: `${character.name} (Basic)`,
      content: this.formatCharacterBasic(character),
      triggers: {
        keywords: [
          character.name,
          ...character.aliases,
          ...character.nicknames
        ],
        keywordLogic: 'any',
        caseSensitive: false,
        wholeWord: true
      },
      activation: {
        enabled: true,
        constant: false,
        probability: 1,
        scanDepth: 2000,
        sticky: 3,
        cooldown: 0,
        delay: 0
      },
      insertion: {
        position: 'before_char',
        order: 100,
        prefix: '[Character: ',
        suffix: ']\n'
      },
      budget: {
        maxTokens: 300,
        priority: 80,
        trimDirection: 'end'
      },
      category: 'characters',
      tags: ['character', 'auto-generated'],
      recursion: { exclude: false, prevent: false, delayUntil: false },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        source: `story-bible:character:${character.id}`
      }
    });

    // Detailed appearance (lower priority, only when specifically relevant)
    if (character.appearance) {
      entries.push({
        id: `char-${character.id}-appearance`,
        name: `${character.name} (Appearance)`,
        content: this.formatCharacterAppearance(character),
        triggers: {
          keywords: [character.name],
          secondaryKeywords: ['looked', 'appeared', 'wearing', 'eyes', 'hair', 'face', 'tall', 'short'],
          keywordLogic: 'any',
          secondaryLogic: 'and',
          caseSensitive: false,
          wholeWord: true
        },
        activation: {
          enabled: true,
          constant: false,
          probability: 1,
          scanDepth: 500,
          sticky: 0,
          cooldown: 5,
          delay: 0
        },
        insertion: {
          position: 'at_depth',
          depth: 2,
          order: 50,
          prefix: '',
          suffix: '\n'
        },
        budget: {
          maxTokens: 200,
          priority: 40,
          trimDirection: 'end'
        },
        category: 'character-details',
        tags: ['character', 'appearance', 'auto-generated'],
        recursion: { exclude: true, prevent: false, delayUntil: false },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          source: `story-bible:character:${character.id}`
        }
      });
    }

    // Relationships (triggers on both character names)
    for (const rel of character.relationships) {
      entries.push(this.generateRelationshipEntry(character, rel));
    }

    return entries;
  }

  private formatCharacterBasic(character: Character): string {
    const parts = [
      `${character.name} is a ${character.age}-year-old ${character.species || 'human'}.`,
      character.occupation && `Occupation: ${character.occupation}.`,
      character.personality && `Personality: ${character.personality}.`,
      character.currentGoal && `Current goal: ${character.currentGoal}.`,
      character.speechPattern && `Speech pattern: ${character.speechPattern}.`
    ];

    return parts.filter(Boolean).join(' ');
  }
}
```

## Database Schema

```sql
-- Lorebooks
CREATE TABLE lorebooks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  settings TEXT, -- JSON
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lorebook entries
CREATE TABLE lorebook_entries (
  id TEXT PRIMARY KEY,
  lorebook_id TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  triggers TEXT NOT NULL, -- JSON
  activation TEXT NOT NULL, -- JSON
  insertion TEXT NOT NULL, -- JSON
  budget TEXT NOT NULL, -- JSON
  category TEXT,
  tags TEXT, -- JSON array
  recursion TEXT, -- JSON
  metadata TEXT, -- JSON
  embedding BLOB, -- Vector embedding if computed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lorebook_id) REFERENCES lorebooks(id) ON DELETE CASCADE
);

-- Categories
CREATE TABLE lorebook_categories (
  id TEXT PRIMARY KEY,
  lorebook_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  default_settings TEXT, -- JSON
  color TEXT,
  FOREIGN KEY (lorebook_id) REFERENCES lorebooks(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_entries_lorebook ON lorebook_entries(lorebook_id);
CREATE INDEX idx_entries_category ON lorebook_entries(category);
CREATE INDEX idx_categories_lorebook ON lorebook_categories(lorebook_id);

-- Full-text search for content
CREATE VIRTUAL TABLE lorebook_entries_fts USING fts5(
  name,
  content,
  tags,
  content=lorebook_entries,
  content_rowid=rowid
);
```

## UI Components

```typescript
interface LorebookEditorUI {
  // Entry list with filtering
  entryList: {
    filter: SearchFilter;
    sort: SortOption;
    groupBy: 'category' | 'none';
    selectedEntries: string[];
  };

  // Entry editor
  entryEditor: {
    currentEntry: LorebookEntry | null;
    previewText: string;
    testResults: TriggerMatch[];
  };

  // Import/Export
  importDialog: {
    file: File | null;
    detectedFormat: string;
    preview: Lorebook | null;
    conflictResolution: 'skip' | 'replace' | 'rename';
  };

  // Bulk operations
  bulkOperations: {
    setCategory(entryIds: string[], category: string): void;
    setEnabled(entryIds: string[], enabled: boolean): void;
    delete(entryIds: string[]): void;
    duplicate(entryIds: string[]): void;
  };

  // Testing
  testPanel: {
    testText: string;
    simulateInjection(): InjectionResult;
  };
}
```

## Implementation Phases

### Phase 1: Core Format Support
- [ ] Define unified internal format
- [ ] NovelAI import/export
- [ ] SillyTavern import/export
- [ ] Database schema and storage

### Phase 2: Context Injection Engine
- [ ] Keyword trigger matching
- [ ] Budget management
- [ ] Insertion positioning
- [ ] Recursion handling
- [ ] State management (sticky, cooldown, delay)

### Phase 3: Story Bible Integration
- [ ] Character entry generation
- [ ] Location entry generation
- [ ] Bidirectional sync
- [ ] Auto-update on story bible changes

### Phase 4: Advanced Features
- [ ] Vector search integration
- [ ] Testing/preview UI
- [ ] Bulk operations
- [ ] Performance optimization for large lorebooks
