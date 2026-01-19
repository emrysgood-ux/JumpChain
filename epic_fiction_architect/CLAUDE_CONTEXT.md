# Epic Fiction Architect - Claude Context Document

## Overview

Epic Fiction Architect is a TypeScript library for managing epic-scale fiction writing projects (300+ million words, 1000+ year timelines). It provides tools for timeline management, character tracking, consistency checking, and AI-assisted writing analysis.

**Location**: `/epic_fiction_architect/src/`
**Language**: TypeScript
**Database**: SQLite (better-sqlite3)
**Entry Point**: `src/index.ts`

---

## Quick Start

```typescript
import { EpicFictionArchitect } from './index';

const app = new EpicFictionArchitect({
  databasePath: './my_project.db'
});

// Access engines via properties
app.calendar      // Timeline/calendar management
app.age           // Character age calculation
app.productivity  // Writing session tracking
app.storyBible    // AI context with embeddings
app.narrative     // Causal graphs & probability
app.consistency   // Contradiction detection
app.craft         // Prose quality analysis
```

---

## Architecture

```
src/
├── index.ts                 # Main exports & EpicFictionArchitect class
├── db/
│   ├── database.ts          # SQLite wrapper
│   └── schema.sql           # Database schema (43 tables)
├── engines/
│   ├── timeline/
│   │   ├── calendar.ts      # Multi-calendar system
│   │   └── age.ts           # Species-aware age calculation
│   ├── compile/
│   │   └── compile.ts       # Manuscript compilation
│   ├── tracking/
│   │   └── productivity.ts  # Writing session tracking
│   ├── ai/
│   │   ├── embeddings.ts    # Vector embeddings
│   │   ├── story-bible.ts   # AI context building
│   │   └── summarization-guard.ts
│   ├── narrative/
│   │   ├── causal-plot-graph.ts
│   │   ├── probability-mapper.ts
│   │   ├── cascade-simulator.ts
│   │   └── index.ts         # PredictiveNarrativeEngine
│   ├── consistency/
│   │   ├── checker.ts       # Contradiction detection
│   │   └── index.ts
│   ├── craft/
│   │   ├── analyzer.ts      # Prose quality analysis
│   │   └── index.ts
│   └── rules/
│       ├── writing-rules.ts # Banned patterns/phrases detection
│       └── index.ts
├── types/
│   └── core.ts              # Core TypeScript interfaces
└── tests/
    └── stress-test-round3.ts
```

---

## Core Types

### Project & Story Elements

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  defaultCalendarId?: string;
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface Character {
  id: string;
  name: string;
  aliases: string[];
  role: 'protagonist' | 'antagonist' | 'mentor' | 'ally' | ...;
  status: 'alive' | 'dead' | 'unknown' | 'undead';
  birthDate?: StoryDate;
  deathDate?: StoryDate;
  speciesId?: string;
  biography?: string;
  traits: string[];
  goals: string[];
  // ... more fields
}

interface Scene {
  id: string;
  projectId: string;
  containerId: string;
  title: string;
  content?: string;
  date?: StoryDate;
  povCharacterId?: string;
  characterIds: string[];
  locationId?: string;
  wordCount: number;
  status: 'outline' | 'draft' | 'revised' | 'final';
  // Scene-Sequel structure
  goal?: string;
  conflict?: string;
  disaster?: string;
  // ... more fields
}

interface StoryDate {
  year: number;
  month?: number;
  day?: number;
  hour?: number;
  calendarId?: string;
}
```

---

## Engine Reference

### 1. Calendar Engine (`app.calendar`)

Manages multiple calendar systems with different month/day structures.

```typescript
// Create a fantasy calendar
const calendarId = app.calendar.createCalendar({
  projectId: 'proj-001',
  name: 'Imperial Calendar',
  monthsPerYear: 13,
  daysPerWeek: 8,
  epoch: { year: 0, description: 'Founding of the Empire' }
});

// Add months
app.calendar.addMonth(calendarId, { name: 'Firstmoon', days: 28, sortOrder: 1 });

// Convert between calendars
const converted = app.calendar.convertDate(
  { year: 1000, month: 5, day: 15, calendarId: 'calendar-a' },
  'calendar-b'
);

// Format dates
const formatted = app.calendar.formatDate(date, 'long'); // "15th of Firstmoon, 1000 IE"
```

### 2. Age Calculator (`app.age`)

Calculates character ages accounting for different species aging rates.

```typescript
// Define a species with custom aging
app.age.defineSpecies({
  id: 'elf',
  name: 'Elf',
  agingCurve: [
    { chronologicalAge: 0, biologicalAge: 0, label: 'infant' },
    { chronologicalAge: 100, biologicalAge: 18, label: 'young adult' },
    { chronologicalAge: 500, biologicalAge: 40, label: 'mature' },
    { chronologicalAge: 1000, biologicalAge: 60, label: 'elder' }
  ],
  maxLifespan: 2000
});

// Calculate age at a point in time
const age = app.age.calculateAge(character, storyDate);
// Returns: { chronological: 250, biological: 25, label: 'adult', ... }
```

### 3. Productivity Tracker (`app.productivity`)

Tracks writing sessions and progress.

```typescript
// Start a session
const sessionId = app.productivity.startSession('proj-001', 'scene-001');

// End session (auto-calculates words written)
const session = app.productivity.endSession(sessionId);

// Get statistics
const stats = app.productivity.getProjectStats('proj-001', {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});
// Returns: { totalWords, totalSessions, avgWordsPerSession, ... }

// Set goals
app.productivity.setGoal('proj-001', {
  type: 'daily',
  targetWords: 2000,
  deadline: new Date('2024-12-31')
});
```

### 4. Story Bible (`app.storyBible`)

Builds AI context packages with semantic search.

```typescript
// Build context for AI writing assistance
const context = await app.storyBible.buildAIContext(
  'proj-001',
  'scene-001',
  'What does the protagonist want?',
  8000 // max tokens
);

// Returns structured context:
// {
//   characterBios: "## POV: John\n...",
//   currentSituation: "## Location: Castle\n...",
//   activeConflicts: "## Plot Threads\n...",
//   relevantFacts: "## World Rules\n...",
//   recentEvents: "...",
//   worldRules: "..."
// }

// Query the story bible
const results = await app.storyBible.query({
  query: 'magic system rules',
  limit: 10,
  filters: { projectId: 'proj-001' }
});
```

### 5. Predictive Narrative Engine (`app.narrative`)

Analyzes plot causality, probability, and cascading effects.

```typescript
// Add events to causal graph
app.narrative.causalGraph.addEvent({
  id: 'event-001',
  name: 'King dies',
  position: 100,
  characters: ['king-001'],
  consequences: []
});

// Create causal link
app.narrative.causalGraph.addCausalLink({
  fromEventId: 'event-001',
  toEventId: 'event-002',
  type: 'enables',      // enables | prevents | influences
  strength: 0.9,
  description: 'Death triggers succession crisis'
});

// Map probability branches
const branch = app.narrative.probabilityMapper.addBranch({
  id: 'branch-001',
  parentId: null,
  description: 'Prince claims throne',
  probability: 0.6,
  requirements: ['event-001'],
  consequences: ['civil war begins']
});

// Simulate cascade effects
const cascade = app.narrative.cascadeSimulator.simulateCascade(
  'event-001',
  { maxDepth: 5, decayRate: 0.8 }
);
// Returns affected world states and their changes
```

### 6. Consistency Checker (`app.consistency`)

Detects contradictions and tracks facts across the narrative.

```typescript
// Track a fact
const fact = app.consistency.trackFact({
  category: 'character_attribute',
  subjectType: 'character',
  subjectId: 'char-001',
  attribute: 'hair_color',
  value: 'brown',
  valueType: 'string',
  establishedAt: 100,  // narrative position
  isCanonical: true,
  tags: ['physical', 'appearance'],
  source: {
    type: 'scene',
    id: 'scene-001',
    name: 'Chapter 1',
    excerpt: 'His brown hair...'
  }
});

// Check for conflicts before writing
const violations = app.consistency.preflightFact({
  // ... same structure, different value
  value: 'blonde'  // Would conflict!
});

// Run full consistency check
const result = app.consistency.check(scenes, characters, currentPosition);
// Returns: { violations, summary, healthScore, ... }

// Built-in rules detect:
// - Dead character appearances
// - Attribute contradictions
// - Location paradoxes
// - World rule violations
// - Knowledge paradoxes
// - Unfulfilled promises (Chekhov's Gun)

// Generate report
const report = app.consistency.generateReport(result);
```

### 7. Writing Craft Analyzer (`app.craft`)

Analyzes prose quality based on award-winning literature techniques.

```typescript
// Full analysis
const analysis = app.craft.analyze(text, {
  characterDialogue: new Map([
    ['char-001', ['Line 1', 'Line 2']],
    ['char-002', ['Line 3']]
  ]),
  knownSymbols: ['raven', 'storm']
});

// Returns:
// {
//   emotionalArc: {
//     primaryArc: 'man_in_hole',  // or rags_to_riches, tragedy, icarus, cinderella, oedipus
//     confidence: 0.85,
//     arcPoints: [...],
//     suggestions: [...]
//   },
//   rhythm: {
//     averageSentenceLength: 15.2,
//     rhythmScore: 0.78,
//     pacingZones: [...]
//   },
//   showTell: {
//     showRatio: 0.72,
//     tellInstances: [{ text, position, type, suggestedRevision }]
//   },
//   sensory: {
//     densityScore: 0.65,
//     senseDistribution: { visual: 0.4, auditory: 0.2, ... }
//   },
//   dialogue: {
//     voiceDifferentiation: 0.8,
//     authenticityScore: 0.75,
//     characterVoices: [...]
//   },
//   thematic: {
//     identifiedThemes: [{ theme: 'power', confidence: 0.9, ... }],
//     coherenceScore: 0.82
//   },
//   overallScore: 75,
//   prioritizedSuggestions: [...]
// }

// Quick analysis for real-time feedback
const quick = app.craft.quickAnalyze(text);
// Returns: { rhythmScore, showTellRatio, sensoryDensity, topSuggestion }

// Generate readable report
const report = app.craft.generateReport(analysis);
```

---

## Database Operations

The database layer wraps better-sqlite3 with convenience methods:

```typescript
// Access via app.db (internal) or import directly
import { getDatabase } from './db/database';

const db = getDatabase('./project.db');

// CRUD operations are on the db object
db.getProject(id);
db.createProject(project);
db.updateProject(id, updates);
db.deleteProject(id);

// Same pattern for:
db.getCharacter(id);
db.getScene(id);
db.getStoryElement(id);
// etc.
```

---

## Key Interfaces for Facts & Violations

```typescript
interface TrackedFact {
  id: string;
  category: ViolationCategory;  // 'character_attribute' | 'character_state' | 'continuity' | ...
  subjectType: 'character' | 'location' | 'object' | 'world' | 'relationship';
  subjectId: string;
  attribute: string;
  value: unknown;
  valueType: 'string' | 'number' | 'boolean' | 'enum' | 'range' | 'list';
  source: FactSource;
  establishedAt: number;
  validUntil?: number;
  supersededBy?: string;
  isCanonical: boolean;
  tags: string[];
}

interface FactSource {
  type: 'scene' | 'chapter' | 'outline' | 'user' | 'inferred';
  id: string;
  name: string;
  excerpt?: string;
}

interface ConsistencyViolation {
  id: string;
  type: ViolationType;  // 'contradiction' | 'paradox' | 'anachronism' | ...
  severity: 'critical' | 'major' | 'minor' | 'nitpick';
  category: ViolationCategory;
  description: string;
  conflicts: ConflictingFact[];
  affectedEntityIds: string[];
  suggestions: string[];
  status: 'new' | 'reviewed' | 'dismissed' | 'fixed';
  confidence: number;
}
```

---

## Emotional Arc Types

The craft analyzer detects these six fundamental story shapes (from computational narratology research):

| Arc Type | Pattern | Example |
|----------|---------|---------|
| `rags_to_riches` | Rise | Cinderella (simple), Great Gatsby |
| `tragedy` | Fall | Romeo & Juliet, Hamlet |
| `man_in_hole` | Fall → Rise | Most Hollywood films |
| `icarus` | Rise → Fall | Breaking Bad |
| `cinderella` | Rise → Fall → Rise | Jane Eyre |
| `oedipus` | Fall → Rise → Fall | Greek tragedies |

### 8. Writing Rules Engine (`app.rules`)

Detects banned constructions, phrases, and patterns based on "Show Don't Tell" principles.

```typescript
// Full analysis
const result = app.rules.analyze(text, {
  includeEroticaRules: false,        // Enable erotica-specific rules
  severityThreshold: 'minor',         // 'critical' | 'major' | 'minor'
  excludeCategories: [],              // Skip certain categories
  excludeRuleIds: [],                 // Skip specific rules
  runSearchPatterns: true             // Include search pattern counts
});

// Returns:
// {
//   violations: [
//     {
//       id: 'seq-then-comma-42',
//       ruleId: 'seq-then-comma',
//       ruleName: 'Sequential ", then" construction',
//       category: 'sequential_action',
//       severity: 'major',
//       text: ', then stepped',
//       position: { start: 42, end: 55, line: 2, column: 10 },
//       reason: 'Chains two beats creating mechanical prose',
//       suggestion: 'Use a period. Let the second action breathe.'
//     }
//   ],
//   summary: {
//     total: 15,
//     critical: 2,
//     major: 8,
//     minor: 5,
//     byCategory: Map { 'filter_word' => 5, ... }
//   },
//   score: 78,  // 0-100, higher is better
//   searchPatternMatches: Map { 'was-were' => 12, ... }
// }

// Quick analysis for real-time feedback
const quick = app.rules.quickAnalyze(text);
// Returns: { violations, criticalCount, score, topViolation }

// Check a specific rule
const matches = app.rules.checkRule(text, 'orbs-for-eyes');

// Generate readable report
const report = app.rules.generateReport(result);

// Add custom rules
app.rules.addBannedConstruction({
  id: 'my-custom-rule',
  name: 'My Custom Pattern',
  description: 'Detects custom bad pattern',
  pattern: /\bmy bad pattern\b/gi,
  severity: 'major',
  category: 'custom',
  suggestion: 'Replace with better prose.',
  examples: {
    bad: 'This is my bad pattern.',
    good: 'This is better prose.'
  }
});
```

#### Rule Categories

**Banned Constructions (31 patterns)**:
- `sequential_action`: ", then" chains
- `vague_interiority`: "Something in her shifted"
- `anthropomorphized_abstraction`: "Silence stretched", "Eyes searched"
- `filter_word`: "Found himself", "Began to", "Seemed to"
- `purple_prose`: "Orbs", "Ministrations", "Velvet heat"
- `pacing_killer`: "Little did X know", "In order to"
- `telling_emotion`: "Fear washed over", "She felt scared"
- `weak_verb`: "Suddenly", "Very + adjective"
- `redundant_attribution`: "With a nervous laugh"

**Banned Phrases (37 categories)**:
- `physical_tell`: Overused body reactions (heart pounded, stomach dropped)
- `vague_interiority`: "Something inside", "Part of him"
- `cliche_reaction`: Rolled eyes, raised eyebrow, clenched jaw
- `purple_prose_word`: Orbs, visage, countenance, alabaster
- `hedging_word`: Somewhat, rather, quite, slightly
- `filler_word`: Just, really, basically, actually
- `melodrama`: "Her entire world", "Nothing would ever be the same"
- `body_part_cliche`: Pools of eyes, piercing gaze, strong jaw
- `emotion_shortcut`: "Felt tears", "Felt anger"

**Erotica Rules (optional)**:
- `euphemism`: Nether regions, womanhood, core, center
- `purple_anatomy`: Velvet steel, turgid, throbbing member
- `pacing`: Clothing inventory, body part inventory
- `choreography`: Physically impossible positions
- `emotion`: "Pleasure crashed", "Saw stars"

**Search Patterns (for revision)**:
- Passive voice markers (`was/were + verb`)
- -ly adverbs
- "That" clauses
- "There was/were" constructions
- Dialogue attribution adverbs

---

## Testing

Run the stress test to verify everything works:

```bash
cd epic_fiction_architect
npm install
npx tsx src/tests/stress-test-round3.ts
```

All 60 tests should pass.

---

## Common Tasks

### Creating a New Project

```typescript
const project = app.createProject({
  name: 'My Epic',
  description: 'A 10-book series'
});
```

### Adding a Character

```typescript
const character = app.db.createCharacter({
  projectId: project.id,
  name: 'John Smith',
  role: 'protagonist',
  status: 'alive',
  birthDate: { year: 980, month: 3, day: 15 },
  traits: ['brave', 'stubborn'],
  goals: ['save the kingdom']
});
```

### Checking Consistency Before Writing

```typescript
// Before adding a fact about hair color
const violations = app.consistency.preflightFact({
  category: 'character_attribute',
  subjectType: 'character',
  subjectId: character.id,
  attribute: 'hair_color',
  value: 'blonde',
  valueType: 'string',
  establishedAt: currentPosition,
  isCanonical: true,
  tags: ['physical'],
  source: { type: 'scene', id: scene.id, name: scene.title }
});

if (violations.length > 0) {
  console.log('Warning:', violations[0].description);
}
```

### Analyzing Draft Prose

```typescript
const draft = `The sun rose over the castle walls. Princess Elena felt nervous
as she approached the throne room. Her heart was pounding.`;

const analysis = app.craft.analyze(draft);

if (analysis.showTell.showRatio < 0.7) {
  console.log('Consider showing emotions through actions instead of telling');
  for (const instance of analysis.showTell.tellInstances) {
    console.log(`- "${instance.text}" → ${instance.suggestedRevision}`);
  }
}
```

---

## Notes for Claude

1. **The database schema is in `src/db/schema.sql`** - all tables use `IF NOT EXISTS`
2. **All 8 engines are accessed via the main `EpicFictionArchitect` class**:
   - `app.calendar` - Multi-calendar system
   - `app.ages` - Species-aware age calculation
   - `app.productivity` - Writing session tracking
   - `app.storyBible` - AI context with embeddings
   - `app.narrative` - Causal graphs & probability
   - `app.consistency` - Contradiction detection
   - `app.craft` - Prose quality analysis
   - `app.rules` - Banned patterns/phrases detection
3. **The `TrackedFact` interface requires all fields** - don't use simplified versions
4. **Consistency check returns `summary` not `stats`**
5. **Test file at `src/tests/stress-test-round3.ts`** has 60 working examples
6. **Writing Rules Engine** - Use `app.rules.analyze()` with `includeEroticaRules: true` for mature content
