# EPIC FICTION ARCHITECT — Priority Gap Analysis & Repairs

## YOLO SUPREME: Competitive Analysis Against Every Major Tool

This document identifies critical gaps in the Epic Fiction Architect specification by comparing against **15+ commercial and open-source tools**, then provides concrete code/schema solutions for each gap.

---

## EXECUTIVE SUMMARY: 23 PRIORITY GAPS IDENTIFIED

### CRITICAL (P0) — Must Have for MVP
| # | Gap | Found In | Our Status |
|---|-----|----------|------------|
| 1 | Export/Compile System | Scrivener, novelWriter | ❌ MISSING |
| 2 | Import & Split | Scrivener | ❌ MISSING |
| 3 | Snapshot/Version Control | Scrivener, Git | ❌ MISSING |
| 4 | Word Count Goals & Tracking | All tools | ❌ MISSING |
| 5 | Writing Sprint/Pomodoro Timer | SidekickWriter | ❌ MISSING |
| 6 | Character Age Calculator | Aeon Timeline, Granthika | ❌ MISSING |
| 7 | Custom Fantasy Calendars (detailed) | Aeon Timeline, World Anvil | ⚠️ PARTIAL |

### HIGH (P1) — Required for Competitive Parity
| # | Gap | Found In | Our Status |
|---|-----|----------|------------|
| 8 | Visual Relationship Maps | Campfire, Plottr | ❌ MISSING |
| 9 | Interactive Map System | World Anvil, Campfire | ❌ MISSING |
| 10 | Narrative vs Chronological Views | Aeon Timeline | ❌ MISSING |
| 11 | Event Causality Engine | Granthika, Causality | ⚠️ PARTIAL |
| 12 | Story Bible Context Retrieval | Sudowrite | ⚠️ PARTIAL |
| 13 | Corkboard/Index Card View | Scrivener, Plottr | ❌ MISSING |
| 14 | Templates Marketplace | Plottr (30+) | ❌ MISSING |

### MEDIUM (P2) — Differentiators
| # | Gap | Found In | Our Status |
|---|-----|----------|------------|
| 15 | Dataview-style Queries | Obsidian | ❌ MISSING |
| 16 | Module/Plugin Architecture | Campfire, Obsidian | ❌ MISSING |
| 17 | Focus/Distraction-Free Mode | All tools | ❌ MISSING |
| 18 | Typewriter Scrolling | novelWriter | ⚠️ PARTIAL |
| 19 | Split Editor View | Scrivener | ❌ MISSING |
| 20 | Frequency Analyzer | Manuskript | ❌ MISSING |

### LOW (P3) — Nice to Have
| # | Gap | Found In | Our Status |
|---|-----|----------|------------|
| 21 | Mobile Companion App | Plottr, Campfire | ❌ MISSING |
| 22 | Cloud Sync Dashboard | Campfire, World Anvil | ⚠️ PARTIAL |
| 23 | Reading Mode | Obsidian | ❌ MISSING |

---

## GAP #1: Export/Compile System (P0 CRITICAL)

### What Competitors Have

**[Scrivener](https://www.literatureandlatte.com/scrivener/overview):**
- Compile to DOCX, RTF, PDF, EPUB, MOBI, HTML, Plain Text, Final Draft, Fountain
- Customizable formatting (override writing format for output)
- Front/back matter insertion
- Chapter numbering, headers/footers
- Table of contents generation

**[novelWriter](https://github.com/vkbo/novelWriter):**
- Export to ODT, PDF, HTML, Markdown, Plain Text
- Novel manuscript formatting
- Custom headers and page breaks

### The Fix

```typescript
// ═══════════════════════════════════════════════════════════════
// COMPILE/EXPORT ENGINE
// ═══════════════════════════════════════════════════════════════

interface CompileEngine {
  // Format targets
  compile(project: Project, options: CompileOptions): Promise<CompiledDocument>;

  // Supported formats
  supportedFormats: ExportFormat[];
}

type ExportFormat =
  | 'docx'      // Microsoft Word
  | 'odt'       // OpenDocument
  | 'pdf'       // PDF (via print engine)
  | 'epub'      // EPUB 3
  | 'mobi'      // Kindle (via Calibre)
  | 'html'      // Single HTML file
  | 'markdown'  // Markdown
  | 'txt'       // Plain text
  | 'fountain'  // Screenplay format
  | 'scrivx';   // Scrivener project (interop)

interface CompileOptions {
  // What to include
  includeChapters: string[];        // Chapter IDs or 'all'
  includeFrontMatter: boolean;
  includeBackMatter: boolean;
  includeTableOfContents: boolean;

  // Formatting overrides
  formatting: {
    fontFamily: string;             // 'Times New Roman'
    fontSize: number;               // 12
    lineSpacing: number;            // 2.0 (double)
    paragraphIndent: number;        // 0.5 inches
    paragraphSpacing: number;       // 0
    margins: { top: number; bottom: number; left: number; right: number };
    pageSize: 'letter' | 'a4' | 'custom';
  };

  // Chapter formatting
  chapterStyle: {
    startOnNewPage: boolean;
    titleFormat: 'CHAPTER ONE' | 'Chapter 1' | 'I' | 'custom';
    customTitleFormat?: string;     // "Chapter <$n>: <$title>"
    titleAlignment: 'left' | 'center' | 'right';
    dropCaps: boolean;
  };

  // Scene breaks
  sceneBreakStyle: '***' | '* * *' | '###' | 'blank_line' | 'custom';
  customSceneBreak?: string;

  // Headers/Footers
  headers: {
    left: string;                   // "<$author>"
    center: string;                 // "<$title>"
    right: string;                  // "<$pagenum>"
  };
  footers: { left: string; center: string; right: string };

  // Metadata
  metadata: {
    title: string;
    author: string;
    isbn?: string;
    publisher?: string;
    copyright?: string;
  };
}

// Compile presets
const COMPILE_PRESETS = {
  manuscriptSubmission: {
    formatting: {
      fontFamily: 'Courier New',
      fontSize: 12,
      lineSpacing: 2.0,
      paragraphIndent: 0.5,
      margins: { top: 1, bottom: 1, left: 1, right: 1 }
    },
    chapterStyle: { startOnNewPage: true, titleFormat: 'CHAPTER ONE' }
  },

  ebook: {
    formatting: {
      fontFamily: 'Georgia',
      fontSize: 11,
      lineSpacing: 1.5,
      paragraphIndent: 1.5, // em
    },
    includeTableOfContents: true
  },

  printBook6x9: {
    formatting: {
      pageSize: 'custom',
      customSize: { width: 6, height: 9 },
      margins: { top: 0.75, bottom: 0.75, left: 0.875, right: 0.625 } // gutter
    }
  }
};
```

### Database Schema Addition

```sql
-- Compile presets saved per project
CREATE TABLE compile_presets (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    name TEXT NOT NULL,
    format TEXT NOT NULL,           -- 'docx', 'epub', etc.
    options JSON NOT NULL,          -- Full CompileOptions
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME
);

-- Compile history
CREATE TABLE compile_history (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    preset_id TEXT REFERENCES compile_presets(id),
    output_path TEXT,
    word_count INTEGER,
    compiled_at DATETIME
);
```

---

## GAP #2: Import & Split System (P0 CRITICAL)

### What Competitors Have

**[Scrivener](https://scrivener.tenderapp.com/help/kb/features-and-usage/importing-work-into-scrivener):**
- Import DOCX, RTF, TXT, PDF, HTML, OPML
- "Import and Split" by heading levels or custom separator
- Preserve formatting or strip to plain text

### The Fix

```typescript
interface ImportEngine {
  // Import single file
  importFile(file: File, options: ImportOptions): Promise<ImportResult>;

  // Import and split
  importAndSplit(file: File, options: SplitOptions): Promise<ImportResult>;

  // Supported formats
  supportedFormats: ImportFormat[];
}

type ImportFormat = 'docx' | 'odt' | 'rtf' | 'txt' | 'md' | 'html' | 'opml' | 'scrivx';

interface ImportOptions {
  targetContainer: string;          // Where to import
  preserveFormatting: boolean;
  convertToMarkdown: boolean;
  importAs: 'chapter' | 'scene' | 'note' | 'research';
}

interface SplitOptions extends ImportOptions {
  splitMethod: 'heading' | 'separator' | 'pagebreak';

  // For heading-based split
  headingLevel?: 1 | 2 | 3;         // Split at H1, H2, or H3

  // For separator-based split
  separator?: string;               // '###', '***', '///', etc.

  // Naming
  namingStrategy: 'heading_text' | 'numbered' | 'custom';
  customNamingPattern?: string;     // "Chapter <$n>"
}

interface ImportResult {
  success: boolean;
  documentsCreated: number;
  documents: ImportedDocument[];
  warnings: string[];
  errors: string[];
}

// Implementation
async function importAndSplit(file: File, options: SplitOptions): Promise<ImportResult> {
  // 1. Parse the file based on format
  const content = await parseFile(file);

  // 2. Find split points
  const splitPoints = findSplitPoints(content, options);

  // 3. Create documents
  const documents: ImportedDocument[] = [];
  for (let i = 0; i < splitPoints.length; i++) {
    const section = content.slice(splitPoints[i], splitPoints[i + 1]);
    const name = generateName(section, i, options);

    const doc = await createDocument({
      content: section,
      name,
      type: options.importAs,
      parentId: options.targetContainer
    });

    documents.push(doc);
  }

  return { success: true, documentsCreated: documents.length, documents, warnings: [], errors: [] };
}
```

---

## GAP #3: Snapshot/Version Control (P0 CRITICAL)

### What Competitors Have

**[Scrivener](https://forum.literatureandlatte.com/t/version-control-and-doc-compare/22404):** Snapshots feature saves document state before editing
**[Patchwork](https://www.inkandswitch.com/patchwork/notebook/):** Prose-focused diff visualization
**Git:** Full version history with branching

### The Fix

```typescript
interface VersionControl {
  // Snapshots (manual saves)
  createSnapshot(documentId: string, name?: string): Promise<Snapshot>;
  listSnapshots(documentId: string): Promise<Snapshot[]>;
  restoreSnapshot(snapshotId: string): Promise<void>;
  compareSnapshots(snapshotId1: string, snapshotId2: string): Promise<Diff>;

  // Auto-save versions
  getVersionHistory(documentId: string, limit?: number): Promise<Version[]>;

  // Diff visualization
  visualizeDiff(diff: Diff): DiffVisualization;
}

interface Snapshot {
  id: string;
  documentId: string;
  name: string;
  content: string;
  wordCount: number;
  createdAt: Date;
  createdBy: string;
}

interface Version {
  id: string;
  documentId: string;
  content: string;
  wordCount: number;
  timestamp: Date;
  autoSaved: boolean;
}

interface Diff {
  additions: DiffSegment[];
  deletions: DiffSegment[];
  modifications: DiffSegment[];
  stats: {
    wordsAdded: number;
    wordsDeleted: number;
    wordsModified: number;
  };
}

interface DiffSegment {
  type: 'add' | 'delete' | 'modify';
  startOffset: number;
  endOffset: number;
  oldText?: string;
  newText?: string;
}
```

### Database Schema Addition

```sql
-- Document snapshots
CREATE TABLE snapshots (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    name TEXT,
    content TEXT NOT NULL,
    word_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT
);

-- Auto-save versions (rolling window)
CREATE TABLE document_versions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_auto_save BOOLEAN DEFAULT TRUE
);

-- Index for fast retrieval
CREATE INDEX idx_snapshots_doc ON snapshots(document_id, created_at DESC);
CREATE INDEX idx_versions_doc ON document_versions(document_id, timestamp DESC);

-- Cleanup trigger: keep only last 50 auto-saves per document
CREATE TRIGGER cleanup_old_versions
AFTER INSERT ON document_versions
BEGIN
    DELETE FROM document_versions
    WHERE document_id = NEW.document_id
    AND is_auto_save = TRUE
    AND id NOT IN (
        SELECT id FROM document_versions
        WHERE document_id = NEW.document_id
        ORDER BY timestamp DESC
        LIMIT 50
    );
END;
```

---

## GAP #4: Word Count Goals & Tracking (P0 CRITICAL)

### What Competitors Have

**All major tools** have daily word count goals, project targets, and progress tracking.

### The Fix

```typescript
interface WordCountTracker {
  // Goals
  setDailyGoal(words: number): void;
  setProjectGoal(words: number, deadline?: Date): void;
  setSessionGoal(words: number): void;

  // Tracking
  getCurrentSessionCount(): number;
  getTodayCount(): number;
  getProjectCount(): number;

  // Progress
  getDailyProgress(): Progress;
  getProjectProgress(): Progress;

  // History
  getWritingHistory(days: number): DailyStats[];

  // Streaks
  getCurrentStreak(): number;
  getLongestStreak(): number;
}

interface Progress {
  current: number;
  goal: number;
  percentage: number;
  remaining: number;
  onTrack: boolean;             // For project goals with deadlines
  projectedCompletion?: Date;
}

interface DailyStats {
  date: Date;
  wordsWritten: number;
  goalMet: boolean;
  sessions: SessionStats[];
}

interface SessionStats {
  startTime: Date;
  endTime: Date;
  startWordCount: number;
  endWordCount: number;
  wordsWritten: number;
  duration: number;             // minutes
  wordsPerMinute: number;
}
```

### Database Schema Addition

```sql
-- Word count goals
CREATE TABLE writing_goals (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    goal_type TEXT NOT NULL,        -- 'daily', 'project', 'session'
    target_words INTEGER NOT NULL,
    deadline DATE,                  -- For project goals
    created_at DATETIME,
    updated_at DATETIME
);

-- Daily word counts
CREATE TABLE daily_word_counts (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    date DATE NOT NULL,
    words_written INTEGER DEFAULT 0,
    goal_met BOOLEAN DEFAULT FALSE,
    UNIQUE(project_id, date)
);

-- Writing sessions
CREATE TABLE writing_sessions (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    start_word_count INTEGER,
    end_word_count INTEGER,
    words_written INTEGER GENERATED ALWAYS AS (end_word_count - start_word_count) STORED
);

-- Streak tracking view
CREATE VIEW writing_streaks AS
WITH RECURSIVE dates AS (
    SELECT date, words_written > 0 AS wrote,
           ROW_NUMBER() OVER (ORDER BY date) AS rn
    FROM daily_word_counts
),
streaks AS (
    SELECT date, wrote, rn,
           rn - ROW_NUMBER() OVER (PARTITION BY wrote ORDER BY date) AS streak_group
    FROM dates
    WHERE wrote = TRUE
)
SELECT MIN(date) AS streak_start,
       MAX(date) AS streak_end,
       COUNT(*) AS streak_length
FROM streaks
GROUP BY streak_group;
```

---

## GAP #5: Writing Sprint/Pomodoro Timer (P0 CRITICAL)

### What Competitors Have

**[SidekickWriter](https://www.sidekickwriter.com/free-tools/writing-sprint-timer):** Sprint timer with word count tracking
**[Pomofocus](https://pomofocus.io/):** Pomodoro timer with task tracking

### The Fix

```typescript
interface WritingTimer {
  // Sprint mode
  startSprint(duration: number): Sprint;  // duration in minutes
  pauseSprint(): void;
  resumeSprint(): void;
  endSprint(): SprintResult;

  // Pomodoro mode
  startPomodoro(config?: PomodoroConfig): Pomodoro;
  skipBreak(): void;

  // State
  getCurrentTimer(): TimerState | null;
  getSprintHistory(): SprintResult[];
}

interface PomodoroConfig {
  focusDuration: number;            // Default: 25 minutes
  shortBreakDuration: number;       // Default: 5 minutes
  longBreakDuration: number;        // Default: 15 minutes
  sessionsBeforeLongBreak: number;  // Default: 4
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  sounds: {
    focusEnd: string;
    breakEnd: string;
  };
}

interface Sprint {
  id: string;
  startTime: Date;
  duration: number;
  startWordCount: number;
  status: 'running' | 'paused' | 'completed';
}

interface SprintResult {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  wordsWritten: number;
  wordsPerMinute: number;
  goalMet: boolean;
}

interface TimerState {
  type: 'sprint' | 'pomodoro_focus' | 'pomodoro_break';
  remainingSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
  currentWordCount: number;
  startWordCount: number;
}
```

### UI Component

```typescript
// Timer display component
const WritingTimerWidget = () => {
  const [timer, setTimer] = useState<TimerState | null>(null);

  return (
    <div className="writing-timer">
      {timer ? (
        <>
          <div className="timer-display">
            {formatTime(timer.remainingSeconds)}
          </div>
          <div className="word-progress">
            +{timer.currentWordCount - timer.startWordCount} words
          </div>
          <div className="controls">
            <button onClick={timer.isPaused ? resume : pause}>
              {timer.isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button onClick={end}>⏹️ End</button>
          </div>
        </>
      ) : (
        <div className="start-options">
          <button onClick={() => startSprint(15)}>15 min sprint</button>
          <button onClick={() => startSprint(25)}>25 min sprint</button>
          <button onClick={() => startPomodoro()}>🍅 Pomodoro</button>
        </div>
      )}
    </div>
  );
};
```

---

## GAP #6: Character Age Calculator (P0 CRITICAL)

### What Competitors Have

**[Aeon Timeline](https://www.aeontimeline.com/features/narrative-storytelling):** Automatically calculates character ages at any event
**[Granthika](https://www.granthika.co/features):** Flags age inconsistencies

### The Fix

```typescript
interface AgeCalculator {
  // Calculate age at specific point
  getAgeAt(character: Character, date: StoryDate): Age;

  // Validate age references in text
  validateAgeReference(
    character: Character,
    claimedAge: number,
    atScene: Scene
  ): AgeValidation;

  // Get all characters' ages at scene
  getSceneAges(scene: Scene): Map<Character, Age>;

  // Timeline of character ages
  getAgeTimeline(character: Character): AgePoint[];
}

interface Age {
  years: number;
  months: number;
  days: number;
  formatted: string;              // "23 years, 4 months"
  isApproximate: boolean;         // If birth date is uncertain
}

interface AgeValidation {
  isValid: boolean;
  calculatedAge: Age;
  claimedAge: number;
  discrepancy?: number;           // Years off
  suggestion?: string;            // "Character would be 45, not 42"
}

// Implementation
function getAgeAt(character: Character, date: StoryDate): Age {
  const birthDate = character.birthDate;
  if (!birthDate) {
    return { years: 0, months: 0, days: 0, formatted: 'Unknown', isApproximate: true };
  }

  const normalizedBirth = normalizeDate(birthDate, character.calendar);
  const normalizedTarget = normalizeDate(date, date.calendar);

  const diffDays = normalizedTarget - normalizedBirth;
  const years = Math.floor(diffDays / 365.25);
  const months = Math.floor((diffDays % 365.25) / 30.44);
  const days = Math.floor(diffDays % 30.44);

  return {
    years,
    months,
    days,
    formatted: formatAge(years, months),
    isApproximate: birthDate.isApproximate
  };
}

// Special handling for long-lived characters (Juraians, etc.)
function getAgeAt(character: Character, date: StoryDate): Age {
  const species = character.species;
  const baseAge = calculateBaseAge(character.birthDate, date);

  // Apply species-specific aging
  if (species?.agingRate) {
    // Juraians age ~10x slower after maturity
    const apparentAge = calculateApparentAge(baseAge, species.agingRate);
    return {
      chronologicalAge: baseAge,
      apparentAge,
      formatted: `${baseAge.years} (appears ${apparentAge.years})`
    };
  }

  return baseAge;
}
```

### Database Schema Addition

```sql
-- Character birth dates with calendar reference
ALTER TABLE characters ADD COLUMN birth_calendar_id TEXT REFERENCES calendar_systems(id);
ALTER TABLE characters ADD COLUMN birth_date_normalized INTEGER; -- Days from epoch
ALTER TABLE characters ADD COLUMN birth_date_approximate BOOLEAN DEFAULT FALSE;

-- Death dates (for historical characters)
ALTER TABLE characters ADD COLUMN death_date TEXT;
ALTER TABLE characters ADD COLUMN death_date_normalized INTEGER;

-- Species aging rates
CREATE TABLE species_aging (
    species_id TEXT PRIMARY KEY REFERENCES story_elements(id),
    maturity_age INTEGER,           -- When normal aging starts
    aging_rate REAL,                -- 1.0 = normal, 0.1 = 10x slower
    max_lifespan INTEGER,           -- NULL = effectively immortal
    notes TEXT
);

-- Jurai example
INSERT INTO species_aging VALUES
  ('jurai_royal', 20, 0.1, NULL, 'Royal Juraians effectively immortal with tree bond');
```

---

## GAP #7: Custom Fantasy Calendars (Detailed) (P0 CRITICAL)

### What Competitors Have

**[Aeon Timeline](https://www.aeontimeline.com/):** Fully custom calendars with multiple moons
**[World Anvil](https://www.worldanvil.com/):** Fantasy calendars with holidays

### The Fix

```typescript
interface CalendarSystem {
  id: string;
  name: string;                     // "Jurai Imperial Calendar"
  epochName: string;                // "After Founding"
  epochDate: string;                // "Year 0 = Founding of Empire"

  // Structure
  daysPerWeek: number;
  weekDayNames: string[];
  months: CalendarMonth[];
  intercalaryDays: IntercalaryDay[]; // Extra days not in months

  // Multiple moons (for fantasy)
  moons: Moon[];

  // Seasons
  seasons: Season[];

  // Holidays/festivals
  holidays: Holiday[];

  // Conversion
  toNormalizedDays(date: CalendarDate): number;
  fromNormalizedDays(days: number): CalendarDate;

  // Display
  formatDate(date: CalendarDate, format: string): string;
}

interface CalendarMonth {
  name: string;
  shortName: string;
  days: number;
  season?: string;
}

interface Moon {
  name: string;
  cycleLength: number;              // Days
  phaseNames: string[];             // ['New', 'Waxing', 'Full', 'Waning']
  startPhase: number;               // Phase at epoch
}

interface Holiday {
  name: string;
  date: CalendarDate | HolidayRule;
  description: string;
  isMoveable: boolean;              // Like Easter
}

interface HolidayRule {
  type: 'fixed' | 'nth_weekday' | 'moon_phase' | 'custom';
  month?: number;
  day?: number;
  weekday?: number;
  occurrence?: number;              // 1st, 2nd, 3rd, etc.
  moonName?: string;
  phase?: string;
  customRule?: string;
}

// Example: Jurai Calendar
const juraiCalendar: CalendarSystem = {
  id: 'jurai_imperial',
  name: 'Jurai Imperial Calendar',
  epochName: 'Imperial Era',
  epochDate: 'Year 0 = Coronation of First Emperor',

  daysPerWeek: 8,
  weekDayNames: ['Firstday', 'Seconday', 'Thirdday', 'Fourthday',
                 'Fifthday', 'Sixthday', 'Seventhday', 'Treeday'],

  months: [
    { name: 'Tsunamimonth', shortName: 'Tsun', days: 40 },
    { name: 'Funaho', shortName: 'Fun', days: 40 },
    { name: 'Misaki', shortName: 'Mis', days: 40 },
    { name: 'Azusa', shortName: 'Azu', days: 40 },
    { name: 'Seto', shortName: 'Set', days: 40 },
    { name: 'Yosho', shortName: 'Yos', days: 40 },
    { name: 'Ayeka', shortName: 'Aye', days: 40 },
    { name: 'Sasami', shortName: 'Sas', days: 40 },
    { name: 'Tennyo', shortName: 'Ten', days: 40 },
  ], // 360 days

  intercalaryDays: [
    { name: 'Festival of Trees', afterMonth: 4 }, // 5-day festival
    { name: 'Festival of Trees', afterMonth: 4 },
    { name: 'Festival of Trees', afterMonth: 4 },
    { name: 'Festival of Trees', afterMonth: 4 },
    { name: 'Festival of Trees', afterMonth: 4 },
  ], // = 365 days

  moons: [], // Jurai has artificial lighting

  seasons: [
    { name: 'Growing', months: [0, 1, 2] },
    { name: 'Flourishing', months: [3, 4, 5] },
    { name: 'Harvest', months: [6, 7, 8] },
  ],

  holidays: [
    {
      name: 'Emperor\'s Day',
      date: { month: 0, day: 1 },
      description: 'Celebration of the reigning Emperor',
      isMoveable: false
    }
  ]
};
```

### Database Schema Addition

```sql
CREATE TABLE calendar_months (
    id TEXT PRIMARY KEY,
    calendar_id TEXT REFERENCES calendar_systems(id),
    sort_order INTEGER,
    name TEXT NOT NULL,
    short_name TEXT,
    days INTEGER NOT NULL,
    season TEXT
);

CREATE TABLE calendar_weekdays (
    id TEXT PRIMARY KEY,
    calendar_id TEXT REFERENCES calendar_systems(id),
    sort_order INTEGER,
    name TEXT NOT NULL
);

CREATE TABLE calendar_moons (
    id TEXT PRIMARY KEY,
    calendar_id TEXT REFERENCES calendar_systems(id),
    name TEXT NOT NULL,
    cycle_length REAL NOT NULL,
    phase_names JSON,
    start_phase REAL DEFAULT 0
);

CREATE TABLE calendar_holidays (
    id TEXT PRIMARY KEY,
    calendar_id TEXT REFERENCES calendar_systems(id),
    name TEXT NOT NULL,
    description TEXT,
    is_moveable BOOLEAN DEFAULT FALSE,
    fixed_month INTEGER,
    fixed_day INTEGER,
    rule_type TEXT,
    rule_definition JSON
);
```

---

## GAP #8: Visual Relationship Maps (P1 HIGH)

### What Competitors Have

**[Campfire](https://www.campfirewriting.com/):** Freestyle flowchart relationship maps
**[Plottr](https://plottr.com/):** Character relationship visualization

### The Fix

```typescript
interface RelationshipMapEngine {
  // Create and manage maps
  createMap(name: string, type: RelationshipMapType): RelationshipMap;
  getMap(id: string): RelationshipMap;
  updateMap(map: RelationshipMap): void;

  // Auto-generate from data
  generateFromRelationships(characters: Character[]): RelationshipMap;
  generateFamilyTree(rootCharacter: Character): RelationshipMap;

  // Layout algorithms
  applyLayout(map: RelationshipMap, algorithm: LayoutAlgorithm): void;

  // Export
  exportAsImage(map: RelationshipMap, format: 'png' | 'svg'): Blob;
}

type RelationshipMapType = 'freeform' | 'family_tree' | 'organizational' | 'timeline';
type LayoutAlgorithm = 'force_directed' | 'hierarchical' | 'circular' | 'grid';

interface RelationshipMap {
  id: string;
  name: string;
  type: RelationshipMapType;
  nodes: MapNode[];
  edges: MapEdge[];
  viewport: { x: number; y: number; zoom: number };
  settings: MapSettings;
}

interface MapNode {
  id: string;
  characterId?: string;             // Link to character
  label: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  image?: string;                   // Character portrait
  shape: 'rectangle' | 'circle' | 'diamond';
}

interface MapEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipId?: string;          // Link to relationship record
  label: string;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  thickness: number;
  arrows: 'none' | 'forward' | 'backward' | 'both';
}

interface MapSettings {
  showLabels: boolean;
  showImages: boolean;
  colorByRelationshipType: boolean;
  filterByEra?: string;
  filterByRelationshipTypes?: string[];
}
```

### Database Schema Addition

```sql
CREATE TABLE relationship_maps (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    viewport JSON,
    settings JSON,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE map_nodes (
    id TEXT PRIMARY KEY,
    map_id TEXT REFERENCES relationship_maps(id),
    character_id TEXT REFERENCES characters(id),
    label TEXT,
    position_x REAL,
    position_y REAL,
    width REAL,
    height REAL,
    color TEXT,
    shape TEXT
);

CREATE TABLE map_edges (
    id TEXT PRIMARY KEY,
    map_id TEXT REFERENCES relationship_maps(id),
    source_node_id TEXT REFERENCES map_nodes(id),
    target_node_id TEXT REFERENCES map_nodes(id),
    relationship_id TEXT REFERENCES relationships(id),
    label TEXT,
    color TEXT,
    style TEXT,
    thickness REAL
);
```

---

## GAP #9: Interactive Map System (P1 HIGH)

### What Competitors Have

**[World Anvil](https://www.worldanvil.com/):** Upload maps, add clickable pins linked to articles
**[Campfire](https://www.campfirewriting.com/):** Maps module with location linking

### The Fix

```typescript
interface InteractiveMapSystem {
  // Map management
  uploadMap(image: File, metadata: MapMetadata): Promise<InteractiveMap>;
  getMap(id: string): InteractiveMap;
  listMaps(): InteractiveMap[];

  // Pins/markers
  addPin(mapId: string, pin: MapPin): void;
  updatePin(pinId: string, updates: Partial<MapPin>): void;
  removePin(pinId: string): void;

  // Regions (polygons)
  addRegion(mapId: string, region: MapRegion): void;

  // Linking
  linkPinToLocation(pinId: string, locationId: string): void;
  linkPinToScene(pinId: string, sceneId: string): void;

  // Nested maps
  linkToChildMap(pinId: string, childMapId: string): void; // World → Region → City
}

interface InteractiveMap {
  id: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  scale?: MapScale;                 // "1 inch = 50 miles"
  parentMapId?: string;             // For nested maps
  pins: MapPin[];
  regions: MapRegion[];
}

interface MapPin {
  id: string;
  x: number;                        // Percentage (0-100)
  y: number;
  icon: string;                     // 'city', 'castle', 'forest', 'custom'
  customIcon?: string;
  label: string;
  description?: string;
  linkedLocationId?: string;
  linkedSceneIds?: string[];
  linkedChildMapId?: string;        // Drill down to detailed map
  color: string;
  size: number;
}

interface MapRegion {
  id: string;
  name: string;
  points: { x: number; y: number }[]; // Polygon vertices
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  linkedLocationId?: string;
}
```

---

## GAP #10: Narrative vs Chronological Views (P1 HIGH)

### What Competitors Have

**[Aeon Timeline](https://www.aeontimeline.com/features/narrative-storytelling):** Switch between story order and timeline order

### The Fix

```typescript
interface DualViewSystem {
  // View modes
  getChronologicalOrder(): Scene[];  // By story-time
  getNarrativeOrder(): Scene[];      // By reading order

  // Reordering
  setNarrativePosition(sceneId: string, position: number): void;
  moveSceneInNarrative(sceneId: string, direction: 'up' | 'down'): void;

  // Visualization
  getTimelineGaps(): TimelineGap[];  // Gaps between chronological events
  getNarrativeJumps(): NarrativeJump[]; // Flashbacks, flash-forwards

  // Analysis
  identifyFlashbacks(): Scene[];
  identifyFlashForwards(): Scene[];
}

interface NarrativeJump {
  fromScene: Scene;
  toScene: Scene;
  jumpType: 'flashback' | 'flash_forward' | 'parallel';
  timeDifference: Duration;         // How far in story-time
}

// Database additions
ALTER TABLE scenes ADD COLUMN narrative_order INTEGER;
ALTER TABLE scenes ADD COLUMN chronological_order INTEGER; -- Auto-calculated from timeline_event

-- View for narrative analysis
CREATE VIEW narrative_analysis AS
SELECT
    s.id,
    s.title,
    s.narrative_order,
    s.chronological_order,
    te.story_date_normalized,
    LAG(te.story_date_normalized) OVER (ORDER BY s.narrative_order) AS prev_chrono,
    CASE
        WHEN te.story_date_normalized < LAG(te.story_date_normalized) OVER (ORDER BY s.narrative_order)
        THEN 'flashback'
        WHEN te.story_date_normalized > LAG(te.story_date_normalized) OVER (ORDER BY s.narrative_order) + 30
        THEN 'time_skip'
        ELSE 'linear'
    END AS narrative_flow
FROM scenes s
LEFT JOIN timeline_events te ON s.timeline_event_id = te.id
ORDER BY s.narrative_order;
```

---

## GAP #11: Event Causality Engine (P1 HIGH)

### What Competitors Have

**[Granthika](https://www.granthika.co/features):** Tracks event dependencies and alerts inconsistencies
**[Causality](https://www.hollywoodcamerawork.com/causality.html):** Visual cause-effect chains

### Enhance Our Existing System

```typescript
interface CausalityEngine {
  // Dependency tracking
  addDependency(effect: Event, cause: Event): void;
  removeDependency(effectId: string, causeId: string): void;
  getDependencies(eventId: string): { causes: Event[]; effects: Event[] };

  // Validation
  validateCausality(): CausalityViolation[];
  checkCircularDependencies(): CircularDependency[];
  checkTemporalConsistency(): TemporalViolation[];

  // What-if analysis
  simulateEventRemoval(eventId: string): CascadeEffect[];
  simulateEventChange(eventId: string, newDate: StoryDate): CascadeEffect[];

  // Visualization
  getCausalityGraph(rootEventId?: string): CausalityGraph;
}

interface CausalityViolation {
  type: 'effect_before_cause' | 'missing_cause' | 'orphan_effect';
  effectEvent: Event;
  causeEvent?: Event;
  message: string;
  severity: 'error' | 'warning';
}

interface CascadeEffect {
  affectedEvent: Event;
  impactType: 'invalidated' | 'date_shift_required' | 'minor_adjustment';
  suggestedResolution?: string;
}
```

### Database Schema Enhancement

```sql
-- Enhance existing timeline_events
ALTER TABLE timeline_events ADD COLUMN requires_events JSON; -- Array of prerequisite event IDs
ALTER TABLE timeline_events ADD COLUMN invalidated_by JSON; -- Events that would negate this

-- Causality links table
CREATE TABLE event_causality (
    id TEXT PRIMARY KEY,
    cause_event_id TEXT REFERENCES timeline_events(id),
    effect_event_id TEXT REFERENCES timeline_events(id),
    causality_type TEXT,            -- 'enables', 'requires', 'blocks', 'modifies'
    strength REAL DEFAULT 1.0,      -- 0.0-1.0, for probabilistic causality
    description TEXT,
    UNIQUE(cause_event_id, effect_event_id)
);

-- Validation view
CREATE VIEW causality_violations AS
SELECT
    ec.id,
    'effect_before_cause' AS violation_type,
    ec.cause_event_id,
    ec.effect_event_id,
    cause.title AS cause_title,
    effect.title AS effect_title,
    cause.story_date_normalized AS cause_date,
    effect.story_date_normalized AS effect_date
FROM event_causality ec
JOIN timeline_events cause ON ec.cause_event_id = cause.id
JOIN timeline_events effect ON ec.effect_event_id = effect.id
WHERE effect.story_date_normalized < cause.story_date_normalized;
```

---

## GAP #12: Story Bible Context Retrieval (P1 HIGH)

### What Competitors Have

**[Sudowrite](https://skywork.ai/blog/sudowrite-review-2025-story-engine-describe-pricing/):** Story Bible with smart context retrieval
**[Bookwiz](https://www.aitoolnet.com/bookwiz):** Auto-references knowledge base during generation

### Enhance Our Existing System

```typescript
interface StoryBibleRetriever {
  // Context assembly for AI
  assembleContext(options: ContextOptions): StoryBibleContext;

  // Smart retrieval
  getRelevantCharacters(scene: Scene): Character[];
  getRelevantLocations(scene: Scene): Location[];
  getRelevantWorldRules(scene: Scene): WorldRule[];
  getRelevantHistory(scene: Scene): HistoricalEvent[];

  // Caching for performance
  cacheContext(sceneId: string): void;
  invalidateCache(elementId: string): void;

  // Query optimization
  prioritizeByRelevance(elements: StoryElement[], scene: Scene): StoryElement[];
}

interface ContextOptions {
  scene: Scene;
  maxTokens: number;
  priorities: {
    characters: number;             // 0-1 weight
    locations: number;
    worldRules: number;
    recentEvents: number;
    activeThreads: number;
  };
  includeTypes: ('character' | 'location' | 'worldRule' | 'event' | 'thread')[];
}

interface StoryBibleContext {
  // Structured for LLM consumption
  characters: CharacterContext[];
  locations: LocationContext[];
  worldRules: string[];
  recentEvents: EventSummary[];
  activeThreads: ThreadContext[];

  // Metadata
  totalTokens: number;
  truncated: boolean;
  priorityOrder: string[];
}

interface CharacterContext {
  name: string;
  aliases: string[];
  role: string;                     // 'protagonist', 'antagonist', etc.
  currentState: string;             // Brief state at scene time
  relevantTraits: string[];
  relevantRelationships: string[];
}

// Implementation with smart prioritization
function assembleContext(options: ContextOptions): StoryBibleContext {
  const { scene, maxTokens, priorities } = options;

  // 1. Get all potentially relevant elements
  const characters = getSceneParticipants(scene);
  const location = getSceneLocation(scene);
  const recentScenes = getRecentScenes(scene, 5);
  const activeThreads = getActiveThreadsForScene(scene);

  // 2. Score each element by relevance
  const scoredElements = [
    ...characters.map(c => ({ element: c, type: 'character', score: scoreCharacter(c, scene) })),
    { element: location, type: 'location', score: 1.0 },
    ...activeThreads.map(t => ({ element: t, type: 'thread', score: scoreThread(t, scene) }))
  ];

  // 3. Sort by score and apply weights
  scoredElements.sort((a, b) =>
    (b.score * priorities[b.type]) - (a.score * priorities[a.type])
  );

  // 4. Fill context up to token limit
  let tokenCount = 0;
  const context: StoryBibleContext = {
    characters: [],
    locations: [],
    worldRules: [],
    recentEvents: [],
    activeThreads: [],
    totalTokens: 0,
    truncated: false,
    priorityOrder: []
  };

  for (const scored of scoredElements) {
    const elementTokens = estimateTokens(scored.element);
    if (tokenCount + elementTokens > maxTokens) {
      context.truncated = true;
      break;
    }

    addToContext(context, scored.element, scored.type);
    tokenCount += elementTokens;
    context.priorityOrder.push(scored.element.id);
  }

  context.totalTokens = tokenCount;
  return context;
}
```

---

## GAP #13-23: Additional Gaps (Condensed)

### GAP #13: Corkboard View
```typescript
interface CorkboardView {
  getCards(containerId: string): IndexCard[];
  arrangeCards(arrangement: 'grid' | 'freeform' | 'stacked'): void;
  moveCard(cardId: string, position: { x: number; y: number }): void;
  setCardColor(cardId: string, color: string): void;
  setCardLabel(cardId: string, label: string): void;
}

interface IndexCard {
  id: string;
  sceneId: string;
  title: string;
  synopsis: string;
  color: string;
  label: string;
  position: { x: number; y: number };
  status: string;
  wordCount: number;
}
```

### GAP #14: Templates Marketplace
```sql
CREATE TABLE templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,                  -- 'beat_sheet', 'character', 'world', 'calendar'
    author TEXT,
    description TEXT,
    content JSON,
    downloads INTEGER DEFAULT 0,
    rating REAL,
    is_builtin BOOLEAN DEFAULT FALSE,
    is_community BOOLEAN DEFAULT FALSE,
    created_at DATETIME
);
```

### GAP #15: Dataview-style Queries
```typescript
interface QueryEngine {
  // SQL-like queries on story data
  query(queryString: string): QueryResult;

  // Predefined query templates
  findScenesWithCharacter(characterId: string): Scene[];
  findScenesAtLocation(locationId: string): Scene[];
  findScenesInDateRange(start: StoryDate, end: StoryDate): Scene[];
  findUnresolvedPromises(): Promise[];
  findOrphanedCharacters(): Character[]; // Characters mentioned but not defined
}

// Example queries:
// "scenes WHERE pov_character = 'Sheldon' AND word_count > 2000"
// "characters WHERE arc_type = 'positive_change' AND last_appeared < 'Year 5'"
// "promises WHERE status = 'planted' AND seed_scene.book = 1"
```

### GAP #16: Module/Plugin Architecture
```typescript
interface PluginSystem {
  loadPlugin(plugin: Plugin): void;
  unloadPlugin(pluginId: string): void;
  getLoadedPlugins(): Plugin[];

  // Extension points
  registerView(view: ViewExtension): void;
  registerExportFormat(format: ExportExtension): void;
  registerEntityType(type: EntityTypeExtension): void;
  registerAIProvider(provider: AIProviderExtension): void;
}
```

### GAP #17: Focus Mode
```typescript
interface FocusMode {
  enable(options: FocusModeOptions): void;
  disable(): void;

  options: {
    hideUI: boolean;                // Hide all chrome
    dimSurroundings: boolean;       // Dim non-current paragraph
    fullscreen: boolean;
    ambientSounds: string[];        // 'rain', 'fireplace', 'cafe'
    backgroundImage?: string;
  };
}
```

### GAP #18: Split Editor
```typescript
interface SplitEditor {
  split(direction: 'horizontal' | 'vertical'): void;
  unsplit(): void;

  // Each pane can show different documents or views
  setLeftPane(content: PaneContent): void;
  setRightPane(content: PaneContent): void;

  // Lock sync scrolling for comparison
  syncScroll(enabled: boolean): void;
}

type PaneContent =
  | { type: 'document'; documentId: string }
  | { type: 'outline' }
  | { type: 'character'; characterId: string }
  | { type: 'timeline' }
  | { type: 'snapshot'; snapshotId: string };
```

### GAP #20: Frequency Analyzer
```typescript
interface FrequencyAnalyzer {
  // Word frequency
  getWordFrequency(scope: 'document' | 'chapter' | 'project'): WordFrequency[];
  getOverusedWords(threshold: number): string[];

  // Phrase frequency
  getPhraseFrequency(ngramSize: number): PhraseFrequency[];

  // Character dialogue analysis
  getDialoguePatterns(characterId: string): DialoguePattern;

  // Comparison
  compareToGenre(genre: string): FrequencyComparison;
}

interface WordFrequency {
  word: string;
  count: number;
  frequency: number;                // Per 1000 words
  isOverused: boolean;
  genreAverage?: number;
}
```

---

## IMPLEMENTATION PRIORITY

### Sprint 1 (2 weeks): Core Writing Features
- [ ] Export/Compile Engine (Gap #1)
- [ ] Word Count Goals (Gap #4)
- [ ] Writing Timer (Gap #5)
- [ ] Snapshot System (Gap #3)

### Sprint 2 (2 weeks): Import & Views
- [ ] Import & Split (Gap #2)
- [ ] Corkboard View (Gap #13)
- [ ] Split Editor (Gap #18)
- [ ] Focus Mode (Gap #17)

### Sprint 3 (2 weeks): Timeline & Causality
- [ ] Character Age Calculator (Gap #6)
- [ ] Custom Calendars (Gap #7)
- [ ] Narrative vs Chronological Views (Gap #10)
- [ ] Causality Engine Enhancement (Gap #11)

### Sprint 4 (2 weeks): Visual Tools
- [ ] Relationship Maps (Gap #8)
- [ ] Interactive Maps (Gap #9)
- [ ] Templates System (Gap #14)

### Sprint 5 (2 weeks): AI & Advanced
- [ ] Story Bible Retrieval (Gap #12)
- [ ] Query Engine (Gap #15)
- [ ] Frequency Analyzer (Gap #20)

### Sprint 6 (2 weeks): Platform
- [ ] Plugin Architecture (Gap #16)
- [ ] Mobile Companion (Gap #21)

---

## COMPETITIVE POSITIONING

After these repairs, Epic Fiction Architect will have:

| Feature | Scrivener | Plottr | World Anvil | Sudowrite | **EFA** |
|---------|-----------|--------|-------------|-----------|---------|
| Export formats | ✅ 10+ | ✅ 2 | ✅ 3 | ❌ | ✅ **10+** |
| Import & Split | ✅ | ❌ | ❌ | ❌ | ✅ |
| Version Control | ✅ Snapshots | ❌ | ❌ | ❌ | ✅ **Full** |
| Word Goals | ✅ | ✅ | ❌ | ❌ | ✅ |
| Visual Timeline | ❌ | ✅ | ✅ | ❌ | ✅ |
| Relationship Maps | ❌ | ✅ | ❌ | ❌ | ✅ |
| Interactive Maps | ❌ | ❌ | ✅ | ❌ | ✅ |
| AI Integration | ❌ | ❌ | ❌ | ✅ | ✅ **Advanced** |
| Custom Calendars | ❌ | ❌ | ✅ | ❌ | ✅ |
| Age Calculator | ❌ | ❌ | ❌ | ❌ | ✅ **Unique** |
| Causality Engine | ❌ | ❌ | ❌ | ❌ | ✅ **Unique** |
| 1000-year Support | ❌ | ❌ | ⚠️ | ❌ | ✅ **Optimized** |
| Local-first | ✅ | ⚠️ | ❌ | ❌ | ✅ |
| Open Source | ❌ | ❌ | ❌ | ❌ | ✅ |

**Epic Fiction Architect becomes the only tool with ALL features.**

---

## SOURCES

### Commercial Tools Analyzed
- [Scrivener](https://www.literatureandlatte.com/scrivener/overview)
- [Plottr](https://plottr.com/features/)
- [World Anvil](https://www.worldanvil.com/)
- [Campfire Writing](https://www.campfirewriting.com/)
- [Aeon Timeline](https://www.aeontimeline.com/)
- [Granthika](https://www.granthika.co/)
- [Sudowrite](https://skywork.ai/blog/sudowrite-review-2025-story-engine-describe-pricing/)

### Open Source Analyzed
- [Manuskript](https://github.com/olivierkes/manuskript)
- [novelWriter](https://github.com/vkbo/novelWriter)
- [Obsidian Worldbuilding Templates](https://github.com/witchka/Obsidian-Worldbuilding-Templates)

### Research
- [Patchwork Version Control](https://www.inkandswitch.com/patchwork/notebook/)
- [Causality Story Sequencer](https://www.hollywoodcamerawork.com/causality.html)

---

**END OF GAP ANALYSIS DOCUMENT**
