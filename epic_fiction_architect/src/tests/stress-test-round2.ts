/**
 * Epic Fiction Architect - ROUND 2 STRESS TEST
 *
 * CRITICAL FINDING: Schema/Code Mismatch
 *
 * The SQL schema and TypeScript implementation use DIFFERENT:
 * - Column names
 * - Table structures
 * - Relationship patterns
 * - Foreign key references
 *
 * This would cause IMMEDIATE CRASHES in production.
 */

// ============================================================================
// SCHEMA vs CODE MISMATCH CATALOG
// ============================================================================

export const schemaMismatches = {
  // -------------------------------------------------------------------------
  // TABLE: projects
  // -------------------------------------------------------------------------
  projects: {
    schema: {
      columns: ['id', 'title', 'subtitle', 'premise', 'genre', 'target_word_count', 'current_word_count', 'settings'],
    },
    typescript: {
      columns: ['id', 'name', 'description', 'genre', 'target_word_count', 'current_word_count', 'default_calendar_id', 'settings'],
    },
    mismatches: [
      'Schema uses "title", TypeScript uses "name"',
      'Schema has "subtitle" and "premise", TypeScript has "description"',
      'TypeScript has "default_calendar_id" not in schema',
    ],
    severity: 'CRITICAL',
  },

  // -------------------------------------------------------------------------
  // TABLE: story_elements
  // -------------------------------------------------------------------------
  story_elements: {
    schema: {
      columns: ['id', 'project_id', 'element_type', 'name', 'aliases', 'description', 'notes', 'color_label', 'icon'],
    },
    typescript: {
      columns: ['id', 'project_id', 'type', 'name', 'aliases', 'description', 'notes', 'tags', 'metadata'],
    },
    mismatches: [
      'Schema uses "element_type", TypeScript uses "type"',
      'Schema has "color_label" and "icon", TypeScript has "tags" and "metadata"',
      'Schema element_type values: character, location, object, faction, concept, species, culture',
      'TypeScript type values: CHARACTER, LOCATION, ITEM, CONCEPT, FACTION, EVENT, SPECIES, MAGIC_SYSTEM, TECHNOLOGY, CULTURE',
      'MISMATCH: "object" vs "ITEM", missing EVENT/MAGIC_SYSTEM/TECHNOLOGY in schema',
    ],
    severity: 'CRITICAL',
  },

  // -------------------------------------------------------------------------
  // TABLE: characters
  // -------------------------------------------------------------------------
  characters: {
    schema: {
      columns: ['id', 'full_name', 'nickname', 'gender', 'species_id', 'birth_date', 'birth_date_normalized', 'birth_calendar_id', 'death_date', 'arc_type', 'the_lie', 'the_truth', 'the_want', 'the_need', 'ghost'],
    },
    typescript: {
      columns: ['id', 'role', 'arc_type', 'species_id', 'full_name', 'nicknames', 'gender', 'pronouns', 'birth_date', 'death_date', 'birth_location_id', 'physical_description', 'psychology', 'voice_fingerprint'],
    },
    mismatches: [
      'Schema: "nickname" (singular), TypeScript: "nicknames" (array/plural)',
      'TypeScript has "role" not in schema',
      'TypeScript has "pronouns" not in schema',
      'Schema has "birth_date_normalized" for sorting, TypeScript computes on-the-fly',
      'Schema has arc fields inline (the_lie, the_truth), TypeScript nests in "psychology" object',
      'TypeScript has "voice_fingerprint" as JSON, Schema has separate table',
    ],
    severity: 'CRITICAL',
  },

  // -------------------------------------------------------------------------
  // TABLE: scenes
  // -------------------------------------------------------------------------
  scenes: {
    schema: {
      primaryKey: 'id REFERENCES containers(id)',
      columns: ['id', 'scene_type', 'goal', 'conflict', 'disaster', 'reaction', 'dilemma', 'decision', 'pov_character_id', 'location_id', 'timeline_event_id', 'narrative_order', 'chronological_order', 'content', 'synopsis', 'word_count'],
    },
    typescript: {
      primaryKey: 'id (standalone UUID)',
      columns: ['id', 'project_id', 'container_id', 'title', 'sort_order', 'content', 'synopsis', 'scene_type', 'goal', 'conflict', 'disaster', 'reaction', 'dilemma', 'decision', 'pov_character_id', 'location_id', 'date', 'character_ids', 'plot_thread_ids', 'word_count', 'status', 'emotion_start', 'emotion_end'],
    },
    mismatches: [
      'ARCHITECTURE DIFFERENCE: Schema has scenes.id as FK to containers.id, TypeScript has scenes with separate container_id',
      'Schema: scene is a subtype of container, TypeScript: scene is a child of container',
      'TypeScript has "character_ids" array, Schema uses separate event_participants table',
      'TypeScript has "date" inline, Schema uses timeline_event_id reference',
      'Schema: "narrative_order" and "chronological_order", TypeScript: "sort_order"',
      'TypeScript has "status", "emotion_start", "emotion_end" not in schema',
    ],
    severity: 'CRITICAL - INCOMPATIBLE ARCHITECTURE',
  },

  // -------------------------------------------------------------------------
  // TABLE: species_aging
  // -------------------------------------------------------------------------
  species_aging: {
    schema: {
      columns: ['species_id', 'maturity_age', 'aging_rate', 'max_lifespan', 'notes'],
      model: 'Single aging_rate multiplier (0.1 = ages 10x slower)',
    },
    typescript: {
      columns: ['id', 'project_id', 'name', 'description', 'average_lifespan', 'maturity_age', 'elder_age', 'aging_curve'],
      model: 'Array of (chronological_age, apparent_age) points with interpolation',
    },
    mismatches: [
      'COMPLETELY DIFFERENT MODELS',
      'Schema: Single "aging_rate" multiplier (e.g., 0.1 for 10x slower)',
      'TypeScript: Aging curve with multiple (age, apparent_age) points',
      'Schema cannot represent non-linear aging (e.g., Juraian rapid youth then slow adult)',
      'Schema has no separate species_aging table - uses inline column',
      'TypeScript age calculation would fail with schema data',
    ],
    severity: 'CRITICAL - INCOMPATIBLE MODEL',
  },

  // -------------------------------------------------------------------------
  // TABLE: FTS (Full-Text Search)
  // -------------------------------------------------------------------------
  fts: {
    schema: {
      tables: ['manuscript_fts', 'elements_fts'],
      manuscript_fts_columns: ['scene_id', 'content'],
    },
    typescript: {
      tables: ['scenes_fts', 'story_elements_fts', 'timeline_events_fts'],
      scenes_fts_columns: ['rowid', 'title', 'content', 'synopsis', 'notes'],
    },
    mismatches: [
      'Different table names (manuscript_fts vs scenes_fts)',
      'Different columns (schema uses scene_id, TypeScript uses rowid)',
      'TypeScript has more FTS tables',
    ],
    severity: 'HIGH',
  },

  // -------------------------------------------------------------------------
  // TABLE: writing_sessions
  // -------------------------------------------------------------------------
  writing_sessions: {
    schema: {
      columns: ['id', 'project_id', 'session_type', 'start_time', 'end_time', 'planned_duration', 'start_word_count', 'end_word_count', 'words_written', 'completed'],
      notes: 'words_written is GENERATED ALWAYS AS (end_word_count - start_word_count)',
    },
    typescript: {
      columns: ['id', 'project_id', 'start_time', 'end_time', 'scene_ids', 'words_written', 'words_deleted', 'net_words', 'session_type', 'sprint_duration'],
    },
    mismatches: [
      'Schema: "words_written" is computed from start/end counts',
      'TypeScript: Tracks "words_written", "words_deleted", "net_words" separately',
      'TypeScript: Tracks "scene_ids" array, Schema: No scene tracking',
      'Schema: "planned_duration", TypeScript: "sprint_duration"',
    ],
    severity: 'HIGH',
  },

  // -------------------------------------------------------------------------
  // TABLE: promises
  // -------------------------------------------------------------------------
  promises: {
    schema: {
      columns: ['id', 'project_id', 'description', 'seed_scene_id', 'payoff_scene_id', 'progress_scene_ids', 'status'],
      status_values: ['planted', 'growing', 'paid_off', 'abandoned'],
    },
    typescript: {
      columns: ['id', 'project_id', 'plot_thread_id', 'description', 'promise_type', 'status', 'planted_scene_id', 'fulfilled_scene_id', 'reinforcement_scene_ids', 'expected_fulfillment', 'actual_fulfillment', 'must_fulfill_by'],
      status_values: ['planted', 'reinforced', 'progressing', 'fulfilled', 'subverted', 'abandoned'],
    },
    mismatches: [
      'Schema: "seed_scene_id", TypeScript: "planted_scene_id"',
      'Schema: "payoff_scene_id", TypeScript: "fulfilled_scene_id"',
      'TypeScript has "promise_type" not in schema',
      'Different status values',
      'TypeScript has "must_fulfill_by" deadline not in schema',
    ],
    severity: 'HIGH',
  },

  // -------------------------------------------------------------------------
  // TABLE: embeddings
  // -------------------------------------------------------------------------
  embeddings: {
    schema: {
      columns: ['id', 'source_type', 'source_id', 'chunk_index', 'chunk_text', 'embedding', 'embedding_model'],
      embedding_storage: 'BLOB (binary)',
    },
    typescript: {
      columns: ['id', 'project_id', 'entity_type', 'entity_id', 'chunk_text', 'chunk_index', 'vector', 'model', 'dimensions'],
      embedding_storage: 'JSON (number[])',
    },
    mismatches: [
      'Schema: "source_type/source_id", TypeScript: "entity_type/entity_id"',
      'Schema: embedding as BLOB, TypeScript: vector as JSON array',
      'TypeScript has "project_id" and "dimensions" not in schema',
    ],
    severity: 'HIGH',
  },

  // -------------------------------------------------------------------------
  // TABLE: containers
  // -------------------------------------------------------------------------
  containers: {
    schema: {
      columns: ['id', 'project_id', 'parent_id', 'container_type', 'title', 'sort_order', 'beat_type', 'target_word_count', 'status', 'include_in_compile'],
      container_types: ['book', 'part', 'act', 'chapter', 'scene', 'folder'],
    },
    typescript: {
      columns: ['id', 'project_id', 'parent_id', 'type', 'title', 'synopsis', 'sort_order', 'status', 'target_word_count', 'current_word_count', 'pov', 'timeline', 'include_in_compile', 'compile_as', 'page_break_before'],
      container_types: ['book', 'part', 'arc', 'chapter', 'folder'],
    },
    mismatches: [
      'Schema: "container_type", TypeScript: "type"',
      'Schema includes "scene" as container type, TypeScript separates scenes',
      'Schema: "act", TypeScript: "arc"',
      'TypeScript has "synopsis", "pov", "timeline", "compile_as", "page_break_before" not in schema',
    ],
    severity: 'HIGH',
  },
};

// ============================================================================
// ADDITIONAL ROUND 2 BUGS
// ============================================================================

export const round2Bugs = [
  // -------------------------------------------------------------------------
  // BUG 24: Schema/Code Incompatibility
  // -------------------------------------------------------------------------
  {
    id: 24,
    title: 'Schema and TypeScript code are incompatible',
    severity: 'CRITICAL',
    description: 'The SQL schema and TypeScript database layer use different column names, table structures, and relationship patterns. The code would CRASH on first database access.',
    impact: 'Application completely non-functional',
    fix: 'Rewrite either schema.sql or database.ts to match',
  },

  // -------------------------------------------------------------------------
  // BUG 25: Word Count Trigger Inaccurate
  // -------------------------------------------------------------------------
  {
    id: 25,
    title: 'Word count trigger counts spaces, not words',
    severity: 'MEDIUM',
    location: 'schema.sql:857',
    description: `
      The trigger uses:
      length(content) - length(replace(content, ' ', '')) + 1

      This counts spaces and adds 1, which is wrong for:
      - Empty content: Returns 1 instead of 0
      - Multiple spaces: Overcounts
      - Newlines: Undercounts
      - Unicode spaces: Undercounts
    `,
    fix: 'Use proper word tokenization or regex',
  },

  // -------------------------------------------------------------------------
  // BUG 26: No Validation on calendar_moons.cycle_length
  // -------------------------------------------------------------------------
  {
    id: 26,
    title: 'Moon cycle length can be zero or negative',
    severity: 'MEDIUM',
    location: 'schema.sql:272',
    description: 'No CHECK constraint on cycle_length. Zero causes division by zero, negative causes invalid phases.',
    fix: 'ADD CHECK (cycle_length > 0)',
  },

  // -------------------------------------------------------------------------
  // BUG 27: Recursive CTE Infinite Loop Risk
  // -------------------------------------------------------------------------
  {
    id: 27,
    title: 'writing_streaks view has infinite recursion risk',
    severity: 'MEDIUM',
    location: 'schema.sql:907-944',
    description: 'The recursive CTE for streaks could loop infinitely with circular date references or corrupt data.',
    fix: 'Add LIMIT clause or maximum recursion depth',
  },

  // -------------------------------------------------------------------------
  // BUG 28: No Unique Constraint on Default Calendar
  // -------------------------------------------------------------------------
  {
    id: 28,
    title: 'Multiple calendars can be marked as default',
    severity: 'LOW',
    location: 'schema.sql:247',
    description: 'is_default has no UNIQUE constraint per project. Multiple default calendars cause ambiguity.',
    fix: 'Add partial unique index: CREATE UNIQUE INDEX idx_default_calendar ON calendar_systems(project_id) WHERE is_default = TRUE',
  },

  // -------------------------------------------------------------------------
  // BUG 29: Embeddings Stored as BLOB - No Vector Operations
  // -------------------------------------------------------------------------
  {
    id: 29,
    title: 'Cannot perform vector similarity on BLOB embeddings',
    severity: 'HIGH',
    location: 'schema.sql:678',
    description: 'Schema stores embeddings as BLOB. SQLite cannot natively compare BLOBs for cosine similarity. TypeScript loads ALL embeddings into memory for comparison.',
    impact: 'O(n) memory and time for every search on large databases',
    fix: 'Use sqlite-vec extension or store as JSON with application-level indexing',
  },

  // -------------------------------------------------------------------------
  // BUG 30: Scene Container Relationship is Backward
  // -------------------------------------------------------------------------
  {
    id: 30,
    title: 'Schema makes scene a subtype of container, breaking hierarchy',
    severity: 'CRITICAL',
    location: 'schema.sql:391',
    description: `
      Schema: scenes.id REFERENCES containers(id) - scene IS a container
      TypeScript: scenes.container_id REFERENCES containers(id) - scene BELONGS TO container

      This means:
      - Schema: To create a scene, first create a container with type="scene", then insert into scenes with same ID
      - TypeScript: Create container, then create scene with container_id reference

      These are INCOMPATIBLE insert patterns.
    `,
    fix: 'Redesign schema to match TypeScript parent-child model',
  },

  // -------------------------------------------------------------------------
  // BUG 31: Missing Index on story_elements.name
  // -------------------------------------------------------------------------
  {
    id: 31,
    title: 'No index on frequently queried story_elements.name',
    severity: 'LOW',
    description: 'Character/location lookups by name will full-table scan',
    fix: 'CREATE INDEX idx_elements_name ON story_elements(name)',
  },

  // -------------------------------------------------------------------------
  // BUG 32: Relationship unique constraint too strict
  // -------------------------------------------------------------------------
  {
    id: 32,
    title: 'Cannot have multiple relationships of same type with NULL dates',
    severity: 'MEDIUM',
    location: 'schema.sql:180',
    description: 'UNIQUE(source_id, target_id, relationship_type, valid_from_normalized) - NULL values in valid_from break uniqueness',
    fix: 'Use COALESCE in unique index or separate handling for undated relationships',
  },

  // -------------------------------------------------------------------------
  // BUG 33: No Foreign Key Index on Large Tables
  // -------------------------------------------------------------------------
  {
    id: 33,
    title: 'Missing indexes on foreign keys',
    severity: 'MEDIUM',
    description: 'Tables like scenes, relationships have foreign keys without indexes. JOIN performance degrades with scale.',
    fix: 'Add indexes on all foreign key columns',
  },

  // -------------------------------------------------------------------------
  // BUG 34: Consistency Facts Tied to Elements, Not Scenes
  // -------------------------------------------------------------------------
  {
    id: 34,
    title: 'Cannot track consistency facts for scenes directly',
    severity: 'LOW',
    location: 'schema.sql:685',
    description: 'consistency_facts.element_id references story_elements. Cannot attach facts to specific scenes without an element.',
    fix: 'Add separate scene_facts table or make element_id nullable',
  },

  // -------------------------------------------------------------------------
  // BUG 35: No Soft Delete Mechanism
  // -------------------------------------------------------------------------
  {
    id: 35,
    title: 'Hard deletes with no recovery',
    severity: 'MEDIUM',
    description: 'All deletes are permanent. No "deleted_at" column for soft deletes. User error is unrecoverable.',
    fix: 'Add deleted_at column and filter in queries',
  },

  // -------------------------------------------------------------------------
  // BUG 36: Arc Phase Percentages Not Validated
  // -------------------------------------------------------------------------
  {
    id: 36,
    title: 'character_arc_beats.target_percentage can be > 100 or < 0',
    severity: 'LOW',
    location: 'schema.sql:107',
    description: 'No CHECK constraint on target_percentage REAL',
    fix: 'ADD CHECK (target_percentage BETWEEN 0 AND 100)',
  },

  // -------------------------------------------------------------------------
  // BUG 37: map_pins x/y Not Validated
  // -------------------------------------------------------------------------
  {
    id: 37,
    title: 'Map pin coordinates can be outside 0-100 range',
    severity: 'LOW',
    location: 'schema.sql:639-640',
    description: 'Comment says "Percentage 0-100" but no CHECK constraint',
    fix: 'ADD CHECK (x BETWEEN 0 AND 100) CHECK (y BETWEEN 0 AND 100)',
  },
];

// ============================================================================
// INTEGRATION TEST FAILURES
// ============================================================================

export const integrationFailures = [
  {
    test: 'Create project -> Create character -> Query character',
    expected: 'Character returned with all fields',
    actual: 'SQL error: no such column "name" (schema has "title")',
    severity: 'CRITICAL',
  },
  {
    test: 'Create scene in container',
    expected: 'Scene created as child of container',
    actual: 'SQL error: scenes.container_id does not exist (schema expects scenes.id = containers.id)',
    severity: 'CRITICAL',
  },
  {
    test: 'Calculate character age with species',
    expected: 'Apparent age from aging curve',
    actual: 'Schema has aging_rate multiplier, not aging curve - incompatible model',
    severity: 'CRITICAL',
  },
  {
    test: 'Full-text search scenes',
    expected: 'Results from scenes_fts',
    actual: 'SQL error: no such table scenes_fts (schema has manuscript_fts)',
    severity: 'HIGH',
  },
  {
    test: 'Store embedding vector',
    expected: 'Vector stored as JSON array',
    actual: 'Schema expects BLOB binary, would corrupt on JSON insert',
    severity: 'HIGH',
  },
  {
    test: 'Get unfulfilled promises',
    expected: 'Query planted_scene_id',
    actual: 'SQL error: no such column planted_scene_id (schema has seed_scene_id)',
    severity: 'HIGH',
  },
];

// ============================================================================
// SUMMARY
// ============================================================================

export const summary = {
  round1_bugs: 23,
  round2_bugs: 14,
  total_bugs: 37,
  critical_bugs: 7,
  high_bugs: 11,
  medium_bugs: 12,
  low_bugs: 7,

  root_cause: `
    The schema.sql was written based on the specification documents,
    while database.ts was written based on types.ts.
    These two were never reconciled.

    The schema represents "what was designed"
    The TypeScript represents "what was implemented"
    They are DIFFERENT SYSTEMS.
  `,

  estimated_fix_hours: '80-120 hours',

  recommendation: `
    STOP: Do not attempt to use this system until schema and code are reconciled.

    Option A: Rewrite database.ts to match schema.sql (preserve schema design)
    Option B: Rewrite schema.sql to match database.ts (preserve code implementation)
    Option C: Start fresh with a unified design document

    Recommended: Option B - the TypeScript implementation is more feature-complete
    and the schema can be regenerated from the type definitions.
  `,
};

// ============================================================================
// Print Report
// ============================================================================

console.log('═'.repeat(70));
console.log(' EPIC FICTION ARCHITECT - ROUND 2 STRESS TEST RESULTS');
console.log('═'.repeat(70));
console.log();
console.log('🚨 CRITICAL FINDING: SCHEMA AND CODE ARE INCOMPATIBLE 🚨');
console.log();
console.log(`Total Bugs Found: ${summary.total_bugs}`);
console.log(`  🔴 Critical: ${summary.critical_bugs}`);
console.log(`  🟠 High: ${summary.high_bugs}`);
console.log(`  🟡 Medium: ${summary.medium_bugs}`);
console.log(`  🟢 Low: ${summary.low_bugs}`);
console.log();
console.log('Root Cause:', summary.root_cause.trim());
console.log();
console.log('Estimated Fix Effort:', summary.estimated_fix_hours);
console.log();
console.log('Recommendation:', summary.recommendation.trim());
