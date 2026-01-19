# Epic Fiction Architect: System Specification

## The Ultimate Software for Planning 300-Million-Word Narratives

This document presents a comprehensive technical specification for building the definitive fiction planning and writing system—one capable of managing narratives spanning 1000 years, hundreds of characters, and millions of words across multiple interconnected storylines.

---

## Executive Summary

After extensive research into existing tools (Scrivener, Granthika, Plottr, World Anvil, Sudowrite, Obsidian), database architectures (graph databases, temporal databases, event sourcing), AI/LLM integration patterns, and modern application frameworks, this specification outlines a system that synthesizes the best of all approaches while solving the unique challenges of ultra-long-form fiction.

### Core Philosophy
> "You come for plot, stay for character."

The system treats **character transformations** as the primary organizing principle. Plot threads exist to reveal character—build tracking systems around character arcs, and plot continuity follows.

---

## Part 1: Architecture Overview

### 1.1 Technology Stack Recommendation

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Desktop Runtime** | Tauri 2.0 (Rust) | 97% smaller binaries than Electron (2-3MB vs 80-120MB), 30-40MB RAM usage, sub-500ms startup, iOS/Android support |
| **Frontend** | SolidJS or Svelte | Reactive, minimal overhead, excellent DX |
| **Editor Engine** | TipTap (ProseMirror) | Battle-tested collaborative editing, Yjs CRDT integration, extensible plugin architecture |
| **Primary Database** | SQLite + FTS5 | Local-first, full-text search, mature ecosystem |
| **Graph Layer** | libSQL + Custom Graph Tables | Relationship modeling without Neo4j complexity |
| **Vector Store** | sqlite-vec or LanceDB | Embeddings for semantic search, runs locally |
| **Sync Engine** | Yjs + CRDT | Offline-first, conflict-free merging |
| **AI Integration** | OpenAI/Anthropic API + Local Ollama | Continuity checking, generation assistance |

### 1.2 Local-First Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER'S DEVICE (Primary)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   TipTap    │  │   SQLite    │  │   Vector Embeddings     │  │
│  │   Editor    │  │   + FTS5    │  │   (sqlite-vec/LanceDB)  │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                     │                 │
│         └────────────────┼─────────────────────┘                 │
│                          │                                       │
│                    ┌─────▼─────┐                                 │
│                    │   CRDT    │                                 │
│                    │   Layer   │                                 │
│                    │   (Yjs)   │                                 │
│                    └─────┬─────┘                                 │
└──────────────────────────┼──────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   OPTIONAL CLOUD SYNC   │
              │  (Backup & Multi-Device) │
              └─────────────────────────┘
```

**Key Principle**: The user's device is the source of truth. Cloud serves only as backup and sync relay. Works fully offline with unlimited offline duration.

---

## Part 2: Data Model & Schema

### 2.1 Core Entity Ontology

The system uses a hybrid relational + graph model optimized for fiction:

```sql
-- ═══════════════════════════════════════════════════════════════
-- CORE ENTITIES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    premise TEXT,                    -- 15-word Snowflake summary
    created_at DATETIME,
    updated_at DATETIME,
    settings JSON                    -- Theme colors, preferences
);

CREATE TABLE story_elements (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    element_type TEXT NOT NULL,      -- 'character', 'location', 'object', 'faction', 'concept'
    name TEXT NOT NULL,
    aliases JSON,                    -- ["The Dark Lord", "He-Who-Must-Not-Be-Named"]
    created_at DATETIME,
    updated_at DATETIME
);

-- ═══════════════════════════════════════════════════════════════
-- CHARACTER SYSTEM (Most Critical)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE characters (
    id TEXT PRIMARY KEY REFERENCES story_elements(id),

    -- Core Identity
    full_name TEXT,
    age_at_story_start INTEGER,
    birth_date TEXT,                 -- In-world date
    death_date TEXT,                 -- NULL if alive

    -- Arc Tracking (K.M. Weiland System)
    arc_type TEXT,                   -- 'positive_change', 'flat', 'disillusionment', 'fall', 'corruption'
    the_lie TEXT,                    -- What false belief do they hold?
    the_truth TEXT,                  -- What truth will they learn/embody?
    the_want TEXT,                   -- External goal
    the_need TEXT,                   -- Internal need
    ghost TEXT,                      -- Wound from the past

    -- Voice & Physicality
    voice_notes TEXT,                -- Speech patterns, vocabulary
    physical_description TEXT,
    distinguishing_features JSON,    -- Searchable traits

    -- Psychology
    enneagram_type INTEGER,          -- 1-9
    mbti TEXT,                       -- 'INTJ', 'ENFP', etc.
    core_motivation TEXT,
    greatest_fear TEXT,

    -- Meta
    pov_chapters INTEGER DEFAULT 0,  -- Auto-calculated
    word_count INTEGER DEFAULT 0     -- Auto-calculated
);

CREATE TABLE character_arc_beats (
    id TEXT PRIMARY KEY,
    character_id TEXT REFERENCES characters(id),
    beat_type TEXT,                  -- 'first_plot_point', 'midpoint', 'dark_night', etc.
    target_percentage REAL,          -- 0.25, 0.50, 0.75, etc.
    scene_id TEXT REFERENCES scenes(id),
    description TEXT,
    achieved BOOLEAN DEFAULT FALSE
);

-- ═══════════════════════════════════════════════════════════════
-- RELATIONSHIP GRAPH
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE relationships (
    id TEXT PRIMARY KEY,
    source_id TEXT REFERENCES story_elements(id),
    target_id TEXT REFERENCES story_elements(id),
    relationship_type TEXT,          -- 'romantic', 'familial', 'rival', 'mentor', 'ally', 'enemy'
    sub_type TEXT,                   -- 'enemies_to_lovers', 'found_family', 'grudging_respect'
    strength INTEGER DEFAULT 5,      -- 1-10 scale

    -- Temporal Validity
    valid_from TEXT,                 -- In-world date when relationship starts
    valid_until TEXT,                -- NULL if ongoing

    -- Arc Tracking
    arc_stage TEXT,                  -- For romance: 'meet_cute', 'falling', 'retreating', 'resolution'
    notes TEXT,

    UNIQUE(source_id, target_id, relationship_type, valid_from)
);

-- ═══════════════════════════════════════════════════════════════
-- TIMELINE & EVENTS (Bi-Temporal Event Sourcing)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE timeline_events (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),

    -- In-World Time (Story Time)
    story_date TEXT,                 -- Flexible date format for fantasy calendars
    story_date_normalized INTEGER,   -- Unix-like epoch for sorting
    duration_days INTEGER,

    -- Real-World Time (When Author Created)
    created_at DATETIME,
    modified_at DATETIME,

    -- Event Details
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT,                 -- 'scene', 'backstory', 'worldbuilding', 'future'
    significance INTEGER DEFAULT 5,  -- 1-10 for filtering

    -- Temporal Relationships
    caused_by TEXT REFERENCES timeline_events(id),
    enables JSON                     -- Array of event IDs this enables
);

CREATE TABLE event_participants (
    event_id TEXT REFERENCES timeline_events(id),
    element_id TEXT REFERENCES story_elements(id),
    role TEXT,                       -- 'protagonist', 'antagonist', 'witness', 'mentioned'
    PRIMARY KEY (event_id, element_id)
);

-- ═══════════════════════════════════════════════════════════════
-- MANUSCRIPT STRUCTURE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE containers (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    parent_id TEXT REFERENCES containers(id),
    container_type TEXT,             -- 'book', 'part', 'act', 'chapter', 'scene'
    title TEXT,
    sort_order INTEGER,

    -- Beat Sheet Integration
    beat_type TEXT,                  -- 'opening_image', 'catalyst', 'midpoint', etc.
    target_word_count INTEGER,

    -- Status
    status TEXT DEFAULT 'outline',   -- 'outline', 'draft', 'revision', 'final'
    color_label TEXT
);

CREATE TABLE scenes (
    id TEXT PRIMARY KEY REFERENCES containers(id),

    -- Scene-Sequel Structure (Swain)
    scene_type TEXT,                 -- 'scene' or 'sequel'

    -- For Scenes
    goal TEXT,                       -- POV character's goal
    conflict TEXT,                   -- Opposition faced
    disaster TEXT,                   -- How it goes wrong

    -- For Sequels
    reaction TEXT,                   -- Emotional response
    dilemma TEXT,                    -- Choices faced
    decision TEXT,                   -- What they decide

    -- POV
    pov_character_id TEXT REFERENCES characters(id),
    pov_type TEXT,                   -- 'first', 'third_limited', 'third_omniscient'
    tense TEXT,                      -- 'past', 'present'

    -- Location & Time
    location_id TEXT REFERENCES story_elements(id),
    timeline_event_id TEXT REFERENCES timeline_events(id),

    -- Content
    content TEXT,                    -- Actual manuscript text
    word_count INTEGER DEFAULT 0,

    -- Value Shift (Story Grid)
    opening_value TEXT,              -- e.g., "hope/despair: +3"
    closing_value TEXT               -- e.g., "hope/despair: -2"
);

-- ═══════════════════════════════════════════════════════════════
-- PLOT THREADS & PROMISES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE plot_threads (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    thread_type TEXT,                -- 'main_plot', 'subplot', 'mystery', 'romance', 'thematic'
    title TEXT NOT NULL,
    description TEXT,

    -- Sanderson's Promise-Progress-Payoff
    promise_scene_id TEXT REFERENCES scenes(id),
    payoff_scene_id TEXT REFERENCES scenes(id),

    -- Status
    status TEXT DEFAULT 'active',    -- 'foreshadowed', 'active', 'resolved', 'abandoned'
    resolution_notes TEXT,

    -- Priority
    importance INTEGER DEFAULT 5,    -- 1-10
    color_label TEXT
);

CREATE TABLE thread_appearances (
    thread_id TEXT REFERENCES plot_threads(id),
    scene_id TEXT REFERENCES scenes(id),
    appearance_type TEXT,            -- 'seed', 'progress', 'payoff', 'callback'
    notes TEXT,
    PRIMARY KEY (thread_id, scene_id)
);

-- Chekhov's Gun Tracker
CREATE TABLE promises (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    description TEXT NOT NULL,       -- "The sword on the wall"

    -- Tracking
    seed_scene_id TEXT REFERENCES scenes(id),
    progress_scenes JSON,            -- Array of scene IDs
    payoff_scene_id TEXT REFERENCES scenes(id),

    -- Status
    status TEXT DEFAULT 'planted',   -- 'planted', 'growing', 'paid_off', 'abandoned'
    notes TEXT
);

-- ═══════════════════════════════════════════════════════════════
-- WORLDBUILDING
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE worldbuilding_entries (
    id TEXT PRIMARY KEY REFERENCES story_elements(id),
    category TEXT,                   -- 'magic_system', 'culture', 'history', 'technology', 'religion'
    parent_id TEXT REFERENCES worldbuilding_entries(id),

    -- Sanderson's Recommendation: 2-4 deep dives per book
    depth_level TEXT,                -- 'deep_dive', 'mentioned', 'background'

    content TEXT,
    rules JSON,                      -- For magic systems: hard rules that must be followed

    -- Source Tracking
    first_mentioned_scene TEXT REFERENCES scenes(id),
    reader_knowledge_level TEXT      -- 'unknown', 'hinted', 'revealed', 'fully_explained'
);

-- ═══════════════════════════════════════════════════════════════
-- FULL-TEXT SEARCH (FTS5)
-- ═══════════════════════════════════════════════════════════════

CREATE VIRTUAL TABLE manuscript_fts USING fts5(
    scene_id,
    content,
    tokenize='porter unicode61'
);

CREATE VIRTUAL TABLE elements_fts USING fts5(
    element_id,
    name,
    aliases,
    description,
    content,
    tokenize='porter unicode61'
);

-- ═══════════════════════════════════════════════════════════════
-- VECTOR EMBEDDINGS FOR SEMANTIC SEARCH
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE embeddings (
    id TEXT PRIMARY KEY,
    source_type TEXT,                -- 'scene', 'character', 'worldbuilding'
    source_id TEXT,
    chunk_index INTEGER DEFAULT 0,   -- For long content split into chunks
    embedding BLOB,                  -- Vector stored as binary
    embedding_model TEXT,            -- 'text-embedding-3-small', etc.
    created_at DATETIME
);

-- ═══════════════════════════════════════════════════════════════
-- CONSISTENCY TRACKING
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE consistency_facts (
    id TEXT PRIMARY KEY,
    element_id TEXT REFERENCES story_elements(id),
    fact_type TEXT,                  -- 'eye_color', 'age', 'location', 'ability', 'relationship'
    fact_key TEXT,                   -- 'hair_color'
    fact_value TEXT,                 -- 'red'
    valid_from TEXT,                 -- In-world date
    valid_until TEXT,
    source_scene TEXT REFERENCES scenes(id),
    UNIQUE(element_id, fact_type, fact_key, valid_from)
);

CREATE TABLE consistency_violations (
    id TEXT PRIMARY KEY,
    fact_id TEXT REFERENCES consistency_facts(id),
    violating_scene TEXT REFERENCES scenes(id),
    violation_text TEXT,             -- The problematic passage
    severity TEXT,                   -- 'error', 'warning', 'info'
    resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT
);
```

### 2.2 Temporal Modeling for 1000-Year Narratives

For narratives spanning millennia, standard date handling fails. The system uses a flexible temporal model:

```sql
-- Custom calendar support for fantasy worlds
CREATE TABLE calendar_systems (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    name TEXT,                       -- "Jurai Imperial Calendar"
    epoch_description TEXT,          -- "Year 0 = Founding of the Empire"
    days_per_year INTEGER,
    months JSON,                     -- [{"name": "First Month", "days": 30}, ...]
    conversion_to_days TEXT          -- Formula to convert to normalized days
);

-- Era tracking for multi-generational stories
CREATE TABLE eras (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    name TEXT,                       -- "The Foundation Years"
    start_normalized INTEGER,
    end_normalized INTEGER,
    description TEXT,
    color_label TEXT,
    sort_order INTEGER
);
```

---

## Part 3: AI Integration Architecture

### 3.1 Story Bible as Context

Following Sudowrite's proven approach, the system maintains an AI-accessible Story Bible:

```typescript
interface StoryBibleContext {
  // Core Identity
  project: {
    premise: string;
    themes: string[];
    tone: string;
    genre: string[];
  };

  // Active Characters (relevant to current scene)
  characters: {
    id: string;
    name: string;
    aliases: string[];
    currentAge: number;
    physicalDescription: string;
    voiceNotes: string;
    currentArcStage: string;
    relevantFacts: ConsistencyFact[];
  }[];

  // Relationship Web (for current scene participants)
  relationships: {
    between: [string, string];
    type: string;
    currentState: string;
  }[];

  // Recent Context
  previousScenes: {
    summary: string;
    unresolved: string[];
  }[];

  // Active Threads
  activeThreads: {
    title: string;
    lastProgress: string;
    nextExpected: string;
  }[];

  // World Rules
  worldRules: string[];
}
```

### 3.2 Continuity Checking Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                    CONTINUITY CHECKING PIPELINE                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. ENTITY RECOGNITION                                            │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ Scene Text → NER Model → Detected Entities & Mentions    │  │
│     └─────────────────────────────────────────────────────────┘  │
│                              │                                    │
│  2. FACT EXTRACTION                                               │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ "Sarah's green eyes narrowed" → {sarah, eye_color, green}│  │
│     └─────────────────────────────────────────────────────────┘  │
│                              │                                    │
│  3. CONSISTENCY CHECK                                             │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ Compare against consistency_facts table                  │  │
│     │ Check temporal validity (was this true at scene time?)   │  │
│     └─────────────────────────────────────────────────────────┘  │
│                              │                                    │
│  4. VIOLATION FLAGGING                                            │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ ⚠️ Conflict: Sarah's eyes were "blue" in Chapter 3       │  │
│     │    Options: [Ignore] [Mark as intentional] [Fix Ch3]     │  │
│     └─────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 3.3 Semantic Search for Context Retrieval

Using RAG (Retrieval-Augmented Generation) patterns:

```typescript
class SemanticContextRetriever {
  // When writing a new scene, find relevant context
  async getRelevantContext(
    sceneSetup: SceneSetup,
    maxTokens: number = 8000
  ): Promise<StoryBibleContext> {

    // 1. Get characters in scene
    const participants = await this.getParticipants(sceneSetup);

    // 2. Semantic search for similar past scenes
    const embedding = await this.embed(sceneSetup.description);
    const similarScenes = await this.vectorSearch(embedding, {
      limit: 5,
      filter: { before: sceneSetup.timelinePosition }
    });

    // 3. Get active plot threads
    const activeThreads = await this.getActiveThreads(sceneSetup.timelinePosition);

    // 4. Get unresolved promises needing attention
    const unresolvedPromises = await this.getUnresolvedPromises(
      participants,
      sceneSetup.bookNumber
    );

    // 5. Compile and prioritize by relevance
    return this.compileContext(
      participants,
      similarScenes,
      activeThreads,
      unresolvedPromises,
      maxTokens
    );
  }
}
```

### 3.4 AI-Assisted Features

| Feature | Model Used | Context Provided |
|---------|------------|------------------|
| **Continuity Check** | Claude/GPT-4 | Scene text + consistency_facts for participants |
| **Voice Consistency** | Fine-tuned model | Character voice_notes + 5 example passages |
| **Plot Hole Detection** | Claude Opus | Full chapter + relevant thread history |
| **"What If" Explorer** | Any LLM | Scene context + "What if X happened instead?" |
| **Summary Generation** | Fast model (Haiku) | Scene text → 2-sentence summary |
| **Timeline Validation** | Granthika-style logic | Event dates + causal relationships |

---

## Part 4: Editor & UI Architecture

### 4.1 TipTap/ProseMirror Integration

```typescript
// Custom extensions for fiction writing
const FictionWritingExtensions = [
  // Core
  StarterKit,
  Collaboration.configure({ document: ydoc }),

  // Fiction-Specific
  CharacterMention.configure({
    suggestion: characterSuggestionConfig,
    onMention: (character) => trackMention(character, currentScene)
  }),

  LocationMention.configure({
    suggestion: locationSuggestionConfig,
  }),

  PlotThreadTag.configure({
    // Inline markers for plot thread references
    // Renders as subtle colored underline
  }),

  SceneBreak.configure({
    // *** or ### scene breaks
  }),

  ChapterBreak.configure({
    // Chapter transitions
  }),

  CommentThread.configure({
    // Marginal comments like Word/Docs
  }),

  WordCountGoal.configure({
    target: 2500,
    showProgress: true
  }),

  FocusMode.configure({
    // Dims all but current paragraph
  }),

  TypewriterMode.configure({
    // Keeps cursor centered vertically
  })
];
```

### 4.2 View Modes

The system provides multiple views optimized for different tasks:

#### Manuscript View
- Full editor with formatting
- Character/location mentions with hover cards
- Inline consistency warnings
- Word count tracking

#### Corkboard View (Scrivener-style)
- Scene cards arranged on virtual corkboard
- Drag-and-drop reordering
- Color-coded by status/POV character/plot thread
- Synopsis visible on each card

#### Timeline View (Granthika-style)
- Horizontal timeline with zoomable scale (day → year → century)
- Events positioned by in-world date
- Character lifespans shown as bars
- Era backgrounds
- Drag to reposition events (auto-updates related events)

#### Relationship Graph View
- Force-directed graph of characters
- Edge colors by relationship type
- Filter by era/book/relationship type
- Click to see relationship history

#### Outline View
- Hierarchical tree (Book → Part → Chapter → Scene)
- Inline word counts and status
- Beat sheet overlay option
- Drag-and-drop restructuring

#### Story Grid View
- Spreadsheet-style scene analysis
- Columns: POV, Word Count, Event Type, Value Shift, Polarity
- Sortable and filterable
- Visual polarity graph alongside

### 4.3 Dashboard Widgets

```typescript
const WriterDashboard = {
  // Progress Tracking
  dailyWordCount: DailyWordCountWidget,
  projectProgress: ProgressBarWidget,
  streakTracker: StreakWidget,

  // Planning Aids
  activeThreads: ThreadStatusWidget,
  unresolvedPromises: PromiseTrackerWidget,
  upcomingBeats: BeatSheetWidget,

  // Consistency
  recentViolations: ViolationListWidget,
  characterAppearances: CharacterTrackerWidget,

  // AI Insights
  suggestedNextScene: AISuggestionWidget,
  plotHoleAlerts: AIWarningsWidget
};
```

---

## Part 5: Sync & Collaboration Architecture

### 5.1 CRDT-Based Sync with Yjs

```typescript
// Document structure mirroring database
const ydoc = new Y.Doc();

// Manuscript content as Y.XmlFragment (for TipTap)
const manuscriptContent = ydoc.getXmlFragment('manuscript');

// Structured data as Y.Map
const storyBible = ydoc.getMap('storyBible');
const characters = ydoc.getMap('characters');
const timeline = ydoc.getMap('timeline');
const plotThreads = ydoc.getMap('plotThreads');

// Sync provider options
const syncProvider = new HocuspocusProvider({
  url: 'wss://sync.your-server.com',
  name: projectId,
  document: ydoc,

  // Offline-first: queue changes when offline
  onSynced: () => console.log('Synced with server'),
  onDisconnect: () => console.log('Working offline'),
});

// Also persist locally for offline-first
const localProvider = new IndexeddbPersistence(projectId, ydoc);
```

### 5.2 Conflict Resolution Strategy

For most fiction writing, **last-writer-wins** at the paragraph level is acceptable. However, for structured data:

```typescript
const conflictStrategies = {
  // Manuscript text: CRDT handles automatically
  manuscriptContent: 'crdt_merge',

  // Character facts: keep both, flag for human review
  characterFacts: 'keep_both_flag_conflict',

  // Timeline events: temporal logic validation
  timelineEvents: 'validate_causality',

  // Word counts: always recalculate
  wordCounts: 'recalculate'
};
```

### 5.3 Backup & Export

```typescript
const exportFormats = {
  // Full backup
  full: {
    format: 'sqlite_dump',
    includes: ['manuscript', 'storyBible', 'settings', 'history']
  },

  // Manuscript only
  manuscript: {
    formats: ['docx', 'epub', 'pdf', 'markdown', 'html'],
    options: {
      includeComments: boolean,
      includeTrackChanges: boolean,
      chapterBreakStyle: 'pagebreak' | 'heading'
    }
  },

  // Story Bible
  storyBible: {
    formats: ['markdown', 'html', 'json'],
    structure: 'wiki' | 'flat'
  },

  // Timeline
  timeline: {
    formats: ['json', 'csv', 'ical'],
    scope: 'full' | 'selected_era'
  },

  // Interoperability
  scrivener: {
    format: 'scrivx',  // Scrivener project format
    bidirectional: true
  }
};
```

---

## Part 6: Feature Specifications

### 6.1 Character Arc Tracker

Implements K.M. Weiland's arc system with visual tracking:

```typescript
interface CharacterArcTracker {
  character: Character;
  arcType: 'positive_change' | 'flat' | 'disillusionment' | 'fall' | 'corruption';

  // Key beats with target percentages
  beats: {
    // Act 1 (0-25%)
    ordinaryWorld: { target: 0.05, scene?: Scene };
    characteristicMoment: { target: 0.08, scene?: Scene };
    firstPlotPoint: { target: 0.25, scene?: Scene };

    // Act 2A (25-50%)
    reactionPhase: { target: 0.35, scene?: Scene };
    midpoint: { target: 0.50, scene?: Scene };

    // Act 2B (50-75%)
    actionPhase: { target: 0.65, scene?: Scene };
    thirdPlotPoint: { target: 0.75, scene?: Scene };

    // Act 3 (75-100%)
    climax: { target: 0.90, scene?: Scene };
    resolution: { target: 0.98, scene?: Scene };
  };

  // Visual representation
  render(): ArcVisualization;
}
```

### 6.2 Relationship Arc Tracker (Romancing the Beat)

For romance subplots:

```typescript
interface RomanceArcTracker {
  characters: [Character, Character];
  tropeType: 'enemies_to_lovers' | 'friends_to_lovers' | 'second_chance' | 'slow_burn' | string;

  phases: {
    // Phase 1: Setup
    setup: {
      establishProtagonists: Scene[];
      meetCute: Scene | null;
      noWay: Scene[];         // Why love won't happen
      adhesion: Scene[];       // Why they can't walk away
    };

    // Phase 2: Falling
    falling: {
      deepening: Scene[];
      resistingAttraction: Scene[];
      midpoint: Scene | null;  // Often first kiss/intimacy
    };

    // Phase 3: Retreating
    retreating: {
      doubt: Scene[];
      shieldsUp: Scene[];
      breakUp: Scene | null;   // Darkest moment
    };

    // Phase 4: Resolution
    resolution: {
      darkNight: Scene[];
      realization: Scene | null;
      grandGesture: Scene | null;
      wholeheartedness: Scene | null;
    };
  };

  // Tension tracking
  tensionCurve: { scene: Scene; tensionLevel: number }[];
  almostMoments: Scene[];  // Near-misses for slow burn
}
```

### 6.3 Promise-Progress-Payoff Tracker

Implements Sanderson's Chekhov's Gun management:

```typescript
interface PromiseTracker {
  promises: Promise[];

  // Dashboard view
  getUnpaidPromises(beforeScene: Scene): Promise[];
  getOverduePromises(currentProgress: number): Promise[];

  // Alerts
  alerts: {
    type: 'orphan_seed' | 'missing_progress' | 'missing_payoff';
    promise: Promise;
    suggestion: string;
  }[];

  // Visual tracking
  renderPromiseTimeline(): PromiseVisualization;
}
```

### 6.4 Continuity Checker

```typescript
interface ContinuityChecker {
  // Real-time checking as you write
  checkScene(scene: Scene): ContinuityResult;

  // Batch checking
  checkChapter(chapter: Chapter): ContinuityResult[];
  checkBook(book: Book): ContinuityResult[];

  // Types of checks
  checks: {
    // Physical consistency
    eyeColor: 'strict';           // Must never change
    hairColor: 'temporal';        // Can change with in-world reason
    age: 'calculated';            // Auto-calculated from birth date

    // Location consistency
    characterLocation: 'temporal'; // Where is character at this time?
    travelTime: 'validated';      // Can they get there in time?

    // Temporal consistency
    eventOrder: 'strict';         // Cause before effect
    characterAlive: 'strict';     // Can't appear after death

    // Relationship consistency
    relationshipState: 'temporal'; // Are they enemies or friends at this point?
  };

  // AI-powered checks
  aiChecks: {
    voiceConsistency: boolean;    // Does character sound like themselves?
    toneConsistency: boolean;     // Does scene match book's tone?
    paceAnalysis: boolean;        // Is pacing appropriate?
  };
}
```

### 6.5 Series Bible Generator

Auto-generates and maintains series bible from manuscript:

```typescript
interface SeriesBibleGenerator {
  // Auto-extract from manuscript
  extractCharacterDetails(manuscript: Manuscript): CharacterDetails[];
  extractWorldbuildingFacts(manuscript: Manuscript): WorldFact[];
  extractRelationships(manuscript: Manuscript): Relationship[];

  // Track what readers know when
  readerKnowledgeTimeline: {
    fact: string;
    revealedInScene: Scene;
    revealType: 'explicit' | 'implied' | 'hinted';
  }[];

  // Generate formatted bible
  export(format: 'markdown' | 'html' | 'pdf'): string;

  // Color coding by source book
  colorByBook: Map<Book, string>;
}
```

---

## Part 7: Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- [ ] Tauri 2.0 application shell
- [ ] SQLite database with core schema
- [ ] TipTap editor with basic fiction extensions
- [ ] Local file persistence
- [ ] Basic project structure (Books → Chapters → Scenes)

### Phase 2: Story Bible (Months 4-6)
- [ ] Character management system
- [ ] Location and worldbuilding entries
- [ ] Relationship graph
- [ ] Timeline view (basic)
- [ ] Full-text search (FTS5)

### Phase 3: Arc Tracking (Months 7-9)
- [ ] Character arc tracker (Weiland system)
- [ ] Romance arc tracker (Romancing the Beat)
- [ ] Plot thread management
- [ ] Promise-Progress-Payoff tracker
- [ ] Beat sheet integration

### Phase 4: AI Integration (Months 10-12)
- [ ] Vector embeddings for semantic search
- [ ] Continuity checking pipeline
- [ ] AI-assisted consistency checking
- [ ] Voice consistency analysis
- [ ] Context-aware generation assistance

### Phase 5: Sync & Polish (Months 13-15)
- [ ] Yjs CRDT integration
- [ ] Cloud sync (optional)
- [ ] Export to multiple formats
- [ ] Scrivener import/export
- [ ] Mobile companion app (reading/light editing)

### Phase 6: Advanced Features (Months 16-18)
- [ ] Collaboration features
- [ ] Version history with diff view
- [ ] Advanced timeline (multiple calendars)
- [ ] Story Grid analysis
- [ ] Performance optimization for 1M+ word projects

---

## Part 8: Performance Considerations

### 8.1 Handling 300 Million Words

For projects of this scale:

```typescript
const performanceStrategies = {
  // Lazy loading
  manuscriptLoading: 'on_demand',      // Only load visible chapters
  searchIndexing: 'background',        // Index in worker thread
  embeddingGeneration: 'incremental',  // Generate as content is added

  // Chunking
  maxChapterSize: 50000,               // Words before suggesting split
  searchChunkSize: 1000,               // Characters per search chunk

  // Caching
  characterCache: 'lru_1000',          // Keep 1000 most recent characters
  sceneCache: 'lru_100',               // Keep 100 most recent scenes
  searchResultCache: 'ttl_5min',       // Cache search results for 5 min

  // Background processing
  consistencyChecks: 'idle_time',      // Run during idle periods
  embeddingUpdates: 'on_save',         // Update embeddings when saving
  statisticsCalculation: 'debounced'   // Recalculate stats with delay
};
```

### 8.2 Database Optimization

```sql
-- Indexes for common queries
CREATE INDEX idx_scenes_pov ON scenes(pov_character_id);
CREATE INDEX idx_scenes_location ON scenes(location_id);
CREATE INDEX idx_scenes_timeline ON scenes(timeline_event_id);
CREATE INDEX idx_events_date ON timeline_events(story_date_normalized);
CREATE INDEX idx_relationships_source ON relationships(source_id);
CREATE INDEX idx_relationships_target ON relationships(target_id);
CREATE INDEX idx_facts_element ON consistency_facts(element_id, fact_type);

-- Partial indexes for active items
CREATE INDEX idx_active_threads ON plot_threads(project_id)
  WHERE status = 'active';
CREATE INDEX idx_unresolved_promises ON promises(project_id)
  WHERE status != 'paid_off';
```

---

## Part 9: Open Source Considerations

### 9.1 Recommended License
- **Core Application**: MIT or Apache 2.0 (permissive, encourages adoption)
- **AI Features**: Separate module, potentially AGPL if using cloud services

### 9.2 Extension Architecture

```typescript
interface EpicFictionPlugin {
  name: string;
  version: string;

  // Hooks into application
  hooks: {
    onSceneCreate?: (scene: Scene) => void;
    onSceneSave?: (scene: Scene) => Promise<void>;
    beforeExport?: (manuscript: Manuscript) => Manuscript;

    // Custom views
    registerView?: () => ViewDefinition;

    // Custom entity types
    registerEntityType?: () => EntityTypeDefinition;

    // AI integration
    registerAICheck?: () => AICheckDefinition;
  };

  // Settings
  settings?: PluginSettings;
}
```

### 9.3 Community Features
- Template marketplace (beat sheets, character sheets, world templates)
- Plugin repository
- Theme sharing
- Backup/sync provider plugins

---

## Conclusion

This specification outlines a system that combines:

1. **Granthika's** timeline consistency and entity tracking
2. **Scrivener's** project organization and compilation
3. **Plottr's** visual plotting and beat sheets
4. **World Anvil's** worldbuilding depth
5. **Sudowrite's** AI-powered Story Bible
6. **Obsidian's** knowledge graph and linking
7. **Modern local-first architecture** for reliability and privacy

The result is a tool purpose-built for the unique challenges of ultra-long-form fiction—capable of managing narratives spanning centuries with hundreds of characters, while maintaining the consistency and continuity that readers expect.

---

## Research Sources

### Writing Software
- [Scrivener Alternatives](https://alternativeto.net/software/scrivener/)
- [Granthika Features](https://www.granthika.co/features)
- [Plottr Series Bible](https://plottr.com/series-bible-software/)
- [World Anvil Novel Writing](https://www.worldanvil.com/features/novel-writing-software)
- [Manuskript (Open Source)](https://github.com/olivierkes/manuskript)

### Technical Architecture
- [Tauri 2.0](https://v2.tauri.app/)
- [TipTap Editor](https://tiptap.dev/)
- [Yjs CRDT](https://docs.yjs.dev/)
- [SQLite FTS5](https://www.sqlite.org/fts5.html)
- [Local-First Software](https://www.inkandswitch.com/essay/local-first/)

### AI & Embeddings
- [Anthropic Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
- [Sudowrite Story Bible](https://skywork.ai/blog/sudowrite-review-2025-story-engine-describe-pricing/)
- [Finding Flawed Fictions (Plot Hole Detection)](https://arxiv.org/html/2504.11900v1)

### Story Structure Frameworks
- [K.M. Weiland's Arc Types](https://www.helpingwritersbecomeauthors.com/)
- [Romancing the Beat](https://gwenhayes.com/)
- [Save the Cat Beat Sheet](https://savethecat.com/)
- [Story Grid Methodology](https://storygrid.com/)

### Knowledge Graphs
- [Neo4j Graph Concepts](https://neo4j.com/docs/getting-started/graph-database/)
- [RDF and Ontologies](https://www.ontotext.com/knowledgehub/fundamentals/what-is-a-knowledge-graph/)
