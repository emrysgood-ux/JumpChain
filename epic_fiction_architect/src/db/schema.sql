-- ═══════════════════════════════════════════════════════════════════════════
-- EPIC FICTION ARCHITECT — Complete Database Schema
-- Version: 2.0
-- Description: SQLite schema for 300-million-word narrative management
-- ═══════════════════════════════════════════════════════════════════════════

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 1: CORE PROJECT STRUCTURE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    premise TEXT,                          -- 15-word Snowflake summary
    genre TEXT,
    target_word_count INTEGER,
    current_word_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    settings JSON DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS story_elements (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    element_type TEXT NOT NULL CHECK (element_type IN (
        'character', 'location', 'object', 'faction', 'concept', 'species', 'culture'
    )),
    name TEXT NOT NULL,
    aliases JSON DEFAULT '[]',
    description TEXT,
    notes TEXT,
    color_label TEXT,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_elements_project ON story_elements(project_id);
CREATE INDEX idx_elements_type ON story_elements(element_type);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 2: CHARACTER SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY REFERENCES story_elements(id) ON DELETE CASCADE,

    -- Core Identity
    full_name TEXT,
    nickname TEXT,
    gender TEXT,
    species_id TEXT REFERENCES story_elements(id),

    -- Birth/Death
    birth_date TEXT,
    birth_date_normalized INTEGER,         -- Days from epoch for sorting
    birth_calendar_id TEXT REFERENCES calendar_systems(id),
    birth_date_approximate BOOLEAN DEFAULT FALSE,
    death_date TEXT,
    death_date_normalized INTEGER,
    is_immortal BOOLEAN DEFAULT FALSE,

    -- Arc Tracking (K.M. Weiland System)
    arc_type TEXT CHECK (arc_type IN (
        'positive_change', 'flat', 'disillusionment', 'fall', 'corruption'
    )),
    the_lie TEXT,
    the_truth TEXT,
    the_want TEXT,
    the_need TEXT,
    ghost TEXT,

    -- Voice & Physicality
    voice_notes TEXT,
    physical_description TEXT,
    distinguishing_features JSON DEFAULT '[]',

    -- Psychology
    enneagram_type INTEGER CHECK (enneagram_type BETWEEN 1 AND 9),
    mbti TEXT CHECK (length(mbti) = 4),
    core_motivation TEXT,
    greatest_fear TEXT,

    -- Stats (auto-calculated)
    pov_scene_count INTEGER DEFAULT 0,
    total_word_count INTEGER DEFAULT 0,
    first_appearance_scene TEXT,
    last_appearance_scene TEXT
);

-- Character Arc Beats
CREATE TABLE IF NOT EXISTS character_arc_beats (
    id TEXT PRIMARY KEY,
    character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    beat_type TEXT NOT NULL CHECK (beat_type IN (
        'ordinary_world', 'characteristic_moment', 'first_plot_point',
        'reaction_phase', 'midpoint', 'action_phase', 'third_plot_point',
        'climax', 'resolution'
    )),
    target_percentage REAL,
    scene_id TEXT REFERENCES scenes(id),
    description TEXT,
    achieved BOOLEAN DEFAULT FALSE,
    achieved_at DATETIME
);

CREATE INDEX idx_arc_beats_character ON character_arc_beats(character_id);

-- Voice Fingerprints
CREATE TABLE IF NOT EXISTS voice_fingerprints (
    id TEXT PRIMARY KEY,
    character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

    -- Vocabulary Profile
    common_words JSON DEFAULT '{}',        -- {"word": count}
    unique_words JSON DEFAULT '[]',
    avoided_words JSON DEFAULT '[]',
    formality_level REAL DEFAULT 0.5,      -- 0 = casual, 1 = formal

    -- Syntax Profile
    avg_sentence_length REAL,
    question_frequency REAL,
    exclamation_frequency REAL,
    fragment_frequency REAL,

    -- Speech Patterns
    dialect_region TEXT,
    dialect_era TEXT,
    social_class TEXT,
    catchphrases JSON DEFAULT '[]',
    speech_tics JSON DEFAULT '[]',
    avoidances JSON DEFAULT '[]',

    -- Sample dialogue for training
    sample_dialogues JSON DEFAULT '[]',

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Species Aging Rates
CREATE TABLE IF NOT EXISTS species_aging (
    species_id TEXT PRIMARY KEY REFERENCES story_elements(id) ON DELETE CASCADE,
    maturity_age INTEGER DEFAULT 18,
    aging_rate REAL DEFAULT 1.0,           -- 1.0 = normal, 0.1 = 10x slower
    max_lifespan INTEGER,                  -- NULL = immortal
    notes TEXT
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 3: RELATIONSHIPS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS relationships (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES story_elements(id) ON DELETE CASCADE,
    target_id TEXT NOT NULL REFERENCES story_elements(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'romantic', 'familial', 'friendship', 'professional', 'rival',
        'mentor', 'ally', 'enemy', 'neutral'
    )),
    sub_type TEXT,                         -- 'enemies_to_lovers', 'found_family', etc.
    strength INTEGER DEFAULT 5 CHECK (strength BETWEEN 1 AND 10),

    -- Temporal Validity
    valid_from TEXT,
    valid_from_normalized INTEGER,
    valid_until TEXT,
    valid_until_normalized INTEGER,

    -- Arc Tracking (for romance)
    arc_stage TEXT,
    notes TEXT,

    UNIQUE(source_id, target_id, relationship_type, valid_from_normalized)
);

CREATE INDEX idx_relationships_source ON relationships(source_id);
CREATE INDEX idx_relationships_target ON relationships(target_id);

-- Romance Arc Beats (Romancing the Beat)
CREATE TABLE IF NOT EXISTS romance_arc_beats (
    id TEXT PRIMARY KEY,
    relationship_id TEXT NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    phase TEXT NOT NULL CHECK (phase IN ('setup', 'falling', 'retreating', 'resolution')),
    beat_type TEXT NOT NULL,
    scene_id TEXT REFERENCES scenes(id),
    description TEXT,
    achieved BOOLEAN DEFAULT FALSE
);

-- Relationship Maps (Visual)
CREATE TABLE IF NOT EXISTS relationship_maps (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    map_type TEXT DEFAULT 'freeform' CHECK (map_type IN (
        'freeform', 'family_tree', 'organizational', 'timeline'
    )),
    viewport JSON DEFAULT '{"x": 0, "y": 0, "zoom": 1}',
    settings JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS map_nodes (
    id TEXT PRIMARY KEY,
    map_id TEXT NOT NULL REFERENCES relationship_maps(id) ON DELETE CASCADE,
    character_id TEXT REFERENCES characters(id),
    label TEXT,
    position_x REAL DEFAULT 0,
    position_y REAL DEFAULT 0,
    width REAL DEFAULT 150,
    height REAL DEFAULT 100,
    color TEXT DEFAULT '#3498db',
    shape TEXT DEFAULT 'rectangle' CHECK (shape IN ('rectangle', 'circle', 'diamond'))
);

CREATE TABLE IF NOT EXISTS map_edges (
    id TEXT PRIMARY KEY,
    map_id TEXT NOT NULL REFERENCES relationship_maps(id) ON DELETE CASCADE,
    source_node_id TEXT NOT NULL REFERENCES map_nodes(id) ON DELETE CASCADE,
    target_node_id TEXT NOT NULL REFERENCES map_nodes(id) ON DELETE CASCADE,
    relationship_id TEXT REFERENCES relationships(id),
    label TEXT,
    color TEXT DEFAULT '#7f8c8d',
    style TEXT DEFAULT 'solid' CHECK (style IN ('solid', 'dashed', 'dotted')),
    thickness REAL DEFAULT 2
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 4: TIMELINE & CALENDARS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS calendar_systems (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    epoch_name TEXT,
    epoch_description TEXT,
    days_per_week INTEGER DEFAULT 7,
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calendar_months (
    id TEXT PRIMARY KEY,
    calendar_id TEXT NOT NULL REFERENCES calendar_systems(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    days INTEGER NOT NULL,
    season TEXT
);

CREATE TABLE IF NOT EXISTS calendar_weekdays (
    id TEXT PRIMARY KEY,
    calendar_id TEXT NOT NULL REFERENCES calendar_systems(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS calendar_moons (
    id TEXT PRIMARY KEY,
    calendar_id TEXT NOT NULL REFERENCES calendar_systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cycle_length REAL NOT NULL,
    phase_names JSON DEFAULT '["New", "Waxing", "Full", "Waning"]',
    start_phase REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS calendar_holidays (
    id TEXT PRIMARY KEY,
    calendar_id TEXT NOT NULL REFERENCES calendar_systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_moveable BOOLEAN DEFAULT FALSE,
    fixed_month INTEGER,
    fixed_day INTEGER,
    rule_type TEXT,
    rule_definition JSON
);

-- Timeline Events
CREATE TABLE IF NOT EXISTS timeline_events (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Story Time
    story_date TEXT,
    story_date_normalized INTEGER,
    calendar_id TEXT REFERENCES calendar_systems(id),
    duration_days INTEGER DEFAULT 1,

    -- Event Details
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'scene' CHECK (event_type IN (
        'scene', 'backstory', 'worldbuilding', 'future', 'historical'
    )),
    significance INTEGER DEFAULT 5 CHECK (significance BETWEEN 1 AND 10),

    -- Causality
    caused_by_event_id TEXT REFERENCES timeline_events(id),

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_project ON timeline_events(project_id);
CREATE INDEX idx_events_date ON timeline_events(story_date_normalized);

-- Event Participants
CREATE TABLE IF NOT EXISTS event_participants (
    event_id TEXT NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
    element_id TEXT NOT NULL REFERENCES story_elements(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'participant' CHECK (role IN (
        'protagonist', 'antagonist', 'participant', 'witness', 'mentioned'
    )),
    PRIMARY KEY (event_id, element_id)
);

-- Event Causality Links
CREATE TABLE IF NOT EXISTS event_causality (
    id TEXT PRIMARY KEY,
    cause_event_id TEXT NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
    effect_event_id TEXT NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
    causality_type TEXT DEFAULT 'enables' CHECK (causality_type IN (
        'enables', 'requires', 'blocks', 'modifies'
    )),
    strength REAL DEFAULT 1.0,
    description TEXT,
    UNIQUE(cause_event_id, effect_event_id)
);

-- Eras
CREATE TABLE IF NOT EXISTS eras (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_normalized INTEGER,
    end_normalized INTEGER,
    description TEXT,
    color_label TEXT,
    sort_order INTEGER
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 5: MANUSCRIPT STRUCTURE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS containers (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id TEXT REFERENCES containers(id) ON DELETE CASCADE,
    container_type TEXT NOT NULL CHECK (container_type IN (
        'book', 'part', 'act', 'chapter', 'scene', 'folder'
    )),
    title TEXT,
    sort_order INTEGER DEFAULT 0,

    -- Beat Sheet Integration
    beat_type TEXT,
    target_word_count INTEGER,

    -- Status
    status TEXT DEFAULT 'outline' CHECK (status IN (
        'idea', 'outline', 'draft', 'revision', 'final'
    )),
    color_label TEXT,
    icon TEXT,

    -- Include in compile
    include_in_compile BOOLEAN DEFAULT TRUE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_containers_project ON containers(project_id);
CREATE INDEX idx_containers_parent ON containers(parent_id);

-- Scenes
CREATE TABLE IF NOT EXISTS scenes (
    id TEXT PRIMARY KEY REFERENCES containers(id) ON DELETE CASCADE,

    -- Scene-Sequel Structure (Swain)
    scene_type TEXT DEFAULT 'scene' CHECK (scene_type IN ('scene', 'sequel')),

    -- For Scenes
    goal TEXT,
    conflict TEXT,
    disaster TEXT,

    -- For Sequels
    reaction TEXT,
    dilemma TEXT,
    decision TEXT,

    -- POV
    pov_character_id TEXT REFERENCES characters(id),
    pov_type TEXT DEFAULT 'third_limited' CHECK (pov_type IN (
        'first', 'second', 'third_limited', 'third_omniscient'
    )),
    tense TEXT DEFAULT 'past' CHECK (tense IN ('past', 'present', 'future')),

    -- Location & Time
    location_id TEXT REFERENCES story_elements(id),
    timeline_event_id TEXT REFERENCES timeline_events(id),

    -- Ordering
    narrative_order INTEGER,               -- Reading order
    chronological_order INTEGER,           -- Story time order

    -- Content
    content TEXT DEFAULT '',
    synopsis TEXT,
    word_count INTEGER DEFAULT 0,

    -- Value Shift (Story Grid)
    opening_value TEXT,
    closing_value TEXT,
    polarity_shift INTEGER DEFAULT 0       -- -5 to +5
);

CREATE INDEX idx_scenes_pov ON scenes(pov_character_id);
CREATE INDEX idx_scenes_location ON scenes(location_id);
CREATE INDEX idx_scenes_narrative ON scenes(narrative_order);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 6: PLOT THREADS & PROMISES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS plot_threads (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    thread_type TEXT DEFAULT 'subplot' CHECK (thread_type IN (
        'main_plot', 'subplot', 'mystery', 'romance', 'thematic', 'character'
    )),
    title TEXT NOT NULL,
    description TEXT,

    -- Promise-Progress-Payoff
    promise_scene_id TEXT REFERENCES scenes(id),
    payoff_scene_id TEXT REFERENCES scenes(id),

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN (
        'foreshadowed', 'active', 'resolved', 'abandoned'
    )),
    resolution_notes TEXT,

    -- Priority
    importance INTEGER DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
    color_label TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS thread_appearances (
    thread_id TEXT NOT NULL REFERENCES plot_threads(id) ON DELETE CASCADE,
    scene_id TEXT NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    appearance_type TEXT DEFAULT 'progress' CHECK (appearance_type IN (
        'seed', 'progress', 'payoff', 'callback'
    )),
    notes TEXT,
    PRIMARY KEY (thread_id, scene_id)
);

-- Chekhov's Guns (Promises)
CREATE TABLE IF NOT EXISTS promises (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    description TEXT NOT NULL,

    -- Tracking
    seed_scene_id TEXT REFERENCES scenes(id),
    payoff_scene_id TEXT REFERENCES scenes(id),
    progress_scene_ids JSON DEFAULT '[]',

    -- Status
    status TEXT DEFAULT 'planted' CHECK (status IN (
        'planted', 'growing', 'paid_off', 'abandoned'
    )),
    notes TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 7: VERSION CONTROL
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS snapshots (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,             -- Can be scene, character, etc.
    document_type TEXT NOT NULL,           -- 'scene', 'character', 'worldbuilding'
    name TEXT,
    content TEXT NOT NULL,
    word_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT
);

CREATE INDEX idx_snapshots_document ON snapshots(document_id, created_at DESC);

CREATE TABLE IF NOT EXISTS document_versions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_auto_save BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_versions_document ON document_versions(document_id, timestamp DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 8: WRITING PRODUCTIVITY
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS writing_goals (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'project', 'session')),
    target_words INTEGER NOT NULL,
    deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_word_counts (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    words_written INTEGER DEFAULT 0,
    goal_met BOOLEAN DEFAULT FALSE,
    UNIQUE(project_id, date)
);

CREATE INDEX idx_daily_words_project ON daily_word_counts(project_id, date DESC);

CREATE TABLE IF NOT EXISTS writing_sessions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    session_type TEXT DEFAULT 'sprint' CHECK (session_type IN (
        'sprint', 'pomodoro_focus', 'pomodoro_break', 'freeform'
    )),
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    planned_duration INTEGER,              -- Minutes
    start_word_count INTEGER,
    end_word_count INTEGER,
    words_written INTEGER GENERATED ALWAYS AS (
        CASE WHEN end_word_count IS NOT NULL
        THEN end_word_count - start_word_count
        ELSE NULL END
    ) STORED,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT
);

CREATE INDEX idx_sessions_project ON writing_sessions(project_id, start_time DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 9: COMPILE & EXPORT
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS compile_presets (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN (
        'docx', 'odt', 'pdf', 'epub', 'mobi', 'html', 'markdown', 'txt', 'fountain', 'scrivx'
    )),
    options JSON NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compile_history (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    preset_id TEXT REFERENCES compile_presets(id),
    format TEXT NOT NULL,
    output_path TEXT,
    word_count INTEGER,
    page_count INTEGER,
    compiled_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 10: WORLDBUILDING
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS worldbuilding_entries (
    id TEXT PRIMARY KEY REFERENCES story_elements(id) ON DELETE CASCADE,
    category TEXT CHECK (category IN (
        'magic_system', 'technology', 'culture', 'history', 'geography',
        'religion', 'politics', 'economy', 'language', 'custom'
    )),
    parent_id TEXT REFERENCES worldbuilding_entries(id),
    content TEXT,
    rules JSON DEFAULT '[]',               -- For magic systems: hard rules
    depth_level TEXT DEFAULT 'mentioned' CHECK (depth_level IN (
        'deep_dive', 'explored', 'mentioned', 'background'
    )),
    first_mentioned_scene TEXT REFERENCES scenes(id),
    reader_knowledge_level TEXT DEFAULT 'unknown' CHECK (reader_knowledge_level IN (
        'unknown', 'hinted', 'revealed', 'fully_explained'
    ))
);

-- Interactive Maps
CREATE TABLE IF NOT EXISTS interactive_maps (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_path TEXT,
    width INTEGER,
    height INTEGER,
    scale_description TEXT,                -- "1 inch = 50 miles"
    parent_map_id TEXT REFERENCES interactive_maps(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS map_pins (
    id TEXT PRIMARY KEY,
    map_id TEXT NOT NULL REFERENCES interactive_maps(id) ON DELETE CASCADE,
    x REAL NOT NULL,                       -- Percentage 0-100
    y REAL NOT NULL,
    icon TEXT DEFAULT 'marker',
    custom_icon TEXT,
    label TEXT,
    description TEXT,
    linked_location_id TEXT REFERENCES story_elements(id),
    linked_child_map_id TEXT REFERENCES interactive_maps(id),
    color TEXT DEFAULT '#e74c3c',
    size REAL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS map_pin_scenes (
    pin_id TEXT NOT NULL REFERENCES map_pins(id) ON DELETE CASCADE,
    scene_id TEXT NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    PRIMARY KEY (pin_id, scene_id)
);

CREATE TABLE IF NOT EXISTS map_regions (
    id TEXT PRIMARY KEY,
    map_id TEXT NOT NULL REFERENCES interactive_maps(id) ON DELETE CASCADE,
    name TEXT,
    points JSON NOT NULL,                  -- Array of {x, y} vertices
    fill_color TEXT DEFAULT '#3498db',
    fill_opacity REAL DEFAULT 0.3,
    stroke_color TEXT DEFAULT '#2980b9',
    linked_location_id TEXT REFERENCES story_elements(id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 11: AI & EMBEDDINGS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS embeddings (
    id TEXT PRIMARY KEY,
    source_type TEXT NOT NULL,             -- 'scene', 'character', 'worldbuilding'
    source_id TEXT NOT NULL,
    chunk_index INTEGER DEFAULT 0,
    chunk_text TEXT,
    embedding BLOB,                        -- Vector as binary
    embedding_model TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_embeddings_source ON embeddings(source_type, source_id);

CREATE TABLE IF NOT EXISTS consistency_facts (
    id TEXT PRIMARY KEY,
    element_id TEXT NOT NULL REFERENCES story_elements(id) ON DELETE CASCADE,
    fact_type TEXT NOT NULL,               -- 'eye_color', 'location', 'relationship'
    fact_key TEXT NOT NULL,
    fact_value TEXT NOT NULL,
    valid_from_normalized INTEGER,
    valid_until_normalized INTEGER,
    source_scene_id TEXT REFERENCES scenes(id),
    confidence REAL DEFAULT 1.0,
    UNIQUE(element_id, fact_type, fact_key, valid_from_normalized)
);

CREATE INDEX idx_facts_element ON consistency_facts(element_id);

CREATE TABLE IF NOT EXISTS consistency_violations (
    id TEXT PRIMARY KEY,
    fact_id TEXT REFERENCES consistency_facts(id),
    scene_id TEXT NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    violation_text TEXT,
    expected_value TEXT,
    found_value TEXT,
    severity TEXT DEFAULT 'warning' CHECK (severity IN ('error', 'warning', 'info')),
    resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Episode Summaries (SCORE Framework)
CREATE TABLE IF NOT EXISTS episode_summaries (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('scene', 'chapter', 'book', 'series')),
    parent_summary_id TEXT REFERENCES episode_summaries(id),
    content TEXT NOT NULL,
    scene_range_start TEXT,
    scene_range_end TEXT,
    key_events JSON DEFAULT '[]',
    emotional_state JSON,
    embedding BLOB,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Entity State Tracking (SCORE Framework)
CREATE TABLE IF NOT EXISTS entity_states (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL REFERENCES story_elements(id) ON DELETE CASCADE,
    state_key TEXT NOT NULL,               -- 'location', 'possession', 'knowledge'
    state_value TEXT NOT NULL,
    valid_from_normalized INTEGER,
    valid_until_normalized INTEGER,
    caused_by_scene_id TEXT REFERENCES scenes(id),
    UNIQUE(entity_id, state_key, valid_from_normalized)
);

CREATE INDEX idx_entity_states ON entity_states(entity_id, state_key);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 12: TEMPLATES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN (
        'beat_sheet', 'character', 'worldbuilding', 'calendar', 'project', 'scene'
    )),
    name TEXT NOT NULL,
    description TEXT,
    author TEXT,
    content JSON NOT NULL,
    is_builtin BOOLEAN DEFAULT FALSE,
    is_community BOOLEAN DEFAULT FALSE,
    downloads INTEGER DEFAULT 0,
    rating REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 13: WHAT-IF BRANCHING
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS branch_points (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scene_id TEXT REFERENCES scenes(id),
    decision_description TEXT NOT NULL,
    story_time_normalized INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alternatives (
    id TEXT PRIMARY KEY,
    branch_point_id TEXT NOT NULL REFERENCES branch_points(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    probability REAL DEFAULT 0.5,
    is_canonical BOOLEAN DEFAULT FALSE,
    explored_depth INTEGER DEFAULT 0,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS alternative_consequences (
    id TEXT PRIMARY KEY,
    alternative_id TEXT NOT NULL REFERENCES alternatives(id) ON DELETE CASCADE,
    consequence_type TEXT CHECK (consequence_type IN (
        'character_fate', 'relationship_change', 'event_change', 'world_state'
    )),
    entity_id TEXT REFERENCES story_elements(id),
    original_outcome TEXT,
    alternative_outcome TEXT,
    divergence_magnitude REAL DEFAULT 0.5
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 14: EMOTION ARC TRACKING
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scene_sentiment (
    scene_id TEXT PRIMARY KEY REFERENCES scenes(id) ON DELETE CASCADE,
    sentiment_score REAL,                  -- -1.0 to 1.0
    tension_level REAL,                    -- 0.0 to 1.0
    emotional_valence TEXT CHECK (emotional_valence IN (
        'positive', 'negative', 'neutral', 'mixed'
    )),
    dominant_emotions JSON DEFAULT '[]',
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS arc_patterns (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    segment_type TEXT NOT NULL CHECK (segment_type IN ('chapter', 'book', 'series')),
    segment_id TEXT,
    pattern_type TEXT CHECK (pattern_type IN (
        'rags_to_riches', 'riches_to_rags', 'man_in_hole',
        'icarus', 'cinderella', 'oedipus', 'custom'
    )),
    pattern_confidence REAL,
    actual_trajectory JSON,
    ideal_trajectory JSON,
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 15: FULL-TEXT SEARCH
-- ═══════════════════════════════════════════════════════════════════════════

CREATE VIRTUAL TABLE IF NOT EXISTS manuscript_fts USING fts5(
    scene_id,
    content,
    tokenize='porter unicode61'
);

CREATE VIRTUAL TABLE IF NOT EXISTS elements_fts USING fts5(
    element_id,
    name,
    aliases,
    description,
    content,
    tokenize='porter unicode61'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 16: TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Update word counts when scene content changes
CREATE TRIGGER IF NOT EXISTS update_scene_word_count
AFTER UPDATE OF content ON scenes
BEGIN
    UPDATE scenes
    SET word_count = (
        SELECT length(NEW.content) - length(replace(NEW.content, ' ', '')) + 1
        WHERE NEW.content != ''
    )
    WHERE id = NEW.id;
END;

-- Update project word count
CREATE TRIGGER IF NOT EXISTS update_project_word_count
AFTER UPDATE OF word_count ON scenes
BEGIN
    UPDATE projects
    SET current_word_count = (
        SELECT COALESCE(SUM(word_count), 0) FROM scenes s
        JOIN containers c ON s.id = c.id
        WHERE c.project_id = (
            SELECT project_id FROM containers WHERE id = NEW.id
        )
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT project_id FROM containers WHERE id = NEW.id);
END;

-- Update FTS index when scene changes
CREATE TRIGGER IF NOT EXISTS update_manuscript_fts
AFTER UPDATE OF content ON scenes
BEGIN
    DELETE FROM manuscript_fts WHERE scene_id = NEW.id;
    INSERT INTO manuscript_fts(scene_id, content) VALUES (NEW.id, NEW.content);
END;

-- Cleanup old auto-save versions (keep last 50)
CREATE TRIGGER IF NOT EXISTS cleanup_old_versions
AFTER INSERT ON document_versions
WHEN NEW.is_auto_save = TRUE
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

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 17: VIEWS
-- ═══════════════════════════════════════════════════════════════════════════

-- Writing streak view
CREATE VIEW IF NOT EXISTS writing_streaks AS
WITH RECURSIVE streak_days AS (
    SELECT
        project_id,
        date,
        words_written,
        1 AS streak_length,
        date AS streak_start
    FROM daily_word_counts
    WHERE words_written > 0

    UNION ALL

    SELECT
        d.project_id,
        d.date,
        d.words_written,
        CASE
            WHEN julianday(d.date) = julianday(s.date) + 1 THEN s.streak_length + 1
            ELSE 1
        END,
        CASE
            WHEN julianday(d.date) = julianday(s.date) + 1 THEN s.streak_start
            ELSE d.date
        END
    FROM daily_word_counts d
    JOIN streak_days s ON d.project_id = s.project_id
    WHERE julianday(d.date) > julianday(s.date)
    AND d.words_written > 0
)
SELECT
    project_id,
    MAX(streak_length) AS longest_streak,
    (SELECT streak_length FROM streak_days s2
     WHERE s2.project_id = streak_days.project_id
     ORDER BY date DESC LIMIT 1) AS current_streak
FROM streak_days
GROUP BY project_id;

-- Narrative flow analysis
CREATE VIEW IF NOT EXISTS narrative_analysis AS
SELECT
    s.id,
    c.title,
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
JOIN containers c ON s.id = c.id
LEFT JOIN timeline_events te ON s.timeline_event_id = te.id
ORDER BY s.narrative_order;

-- Causality violations
CREATE VIEW IF NOT EXISTS causality_violations AS
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

-- Character appearances summary
CREATE VIEW IF NOT EXISTS character_appearances AS
SELECT
    c.id AS character_id,
    se.name AS character_name,
    COUNT(DISTINCT s.id) AS scene_count,
    SUM(s.word_count) AS total_words,
    MIN(s.narrative_order) AS first_appearance,
    MAX(s.narrative_order) AS last_appearance
FROM characters c
JOIN story_elements se ON c.id = se.id
LEFT JOIN scenes s ON s.pov_character_id = c.id
GROUP BY c.id, se.name;

-- Unresolved promises
CREATE VIEW IF NOT EXISTS unresolved_promises AS
SELECT
    p.*,
    seed_scene.title AS seed_scene_title,
    c.title AS seed_chapter
FROM promises p
LEFT JOIN scenes seed_scene ON p.seed_scene_id = seed_scene.id
LEFT JOIN containers c ON seed_scene.id = c.id
WHERE p.status NOT IN ('paid_off', 'abandoned');

-- ═══════════════════════════════════════════════════════════════════════════
-- END OF SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════
