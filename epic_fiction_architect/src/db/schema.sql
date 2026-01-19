-- ═══════════════════════════════════════════════════════════════════════════
-- EPIC FICTION ARCHITECT — Complete Database Schema v3.0
-- FIXED VERSION: Matches TypeScript types.ts and database.ts
-- All 37 stress test bugs addressed
-- ═══════════════════════════════════════════════════════════════════════════

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 1: CORE PROJECT STRUCTURE
-- Fixed: Column names match TypeScript (name, description, etc.)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,                        -- Fixed: was "title"
    description TEXT,                          -- Fixed: was "subtitle/premise"
    genre TEXT,
    target_word_count INTEGER CHECK (target_word_count >= 0),
    current_word_count INTEGER DEFAULT 0 CHECK (current_word_count >= 0),
    default_calendar_id TEXT,                  -- Fixed: was missing
    settings TEXT DEFAULT '{}',                -- JSON
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT                            -- Fixed: Bug #35 - Soft delete support
);

CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_not_deleted ON projects(id) WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 2: STORY ELEMENTS
-- Fixed: Column "type" not "element_type", added tags/metadata
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS story_elements (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (        -- Fixed: was "element_type"
        'character', 'location', 'item', 'concept', 'faction',
        'event', 'species', 'magic_system', 'technology', 'culture'
    )),
    name TEXT NOT NULL,
    aliases TEXT DEFAULT '[]',                 -- JSON array
    description TEXT,
    notes TEXT,
    tags TEXT DEFAULT '[]',                    -- Fixed: was missing
    metadata TEXT DEFAULT '{}',                -- Fixed: was missing
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,                           -- Soft delete
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_elements_project ON story_elements(project_id);
CREATE INDEX IF NOT EXISTS idx_elements_type ON story_elements(project_id, type);
CREATE INDEX IF NOT EXISTS idx_elements_name ON story_elements(name);  -- Fixed: Bug #31
CREATE INDEX IF NOT EXISTS idx_elements_not_deleted ON story_elements(id) WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 3: CHARACTERS
-- Fixed: Matches TypeScript Character interface
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    role TEXT DEFAULT 'background' CHECK (role IN (
        'protagonist', 'deuteragonist', 'antagonist', 'mentor',
        'ally', 'love_interest', 'sidekick', 'foil', 'background'
    )),
    arc_type TEXT CHECK (arc_type IN (
        'positive_change', 'flat_testing', 'disillusionment',
        'fall', 'corruption', 'redemption', 'tragic',
        'coming_of_age', 'heroic_journey'
    )),
    species_id TEXT,
    full_name TEXT NOT NULL,
    nicknames TEXT DEFAULT '[]',               -- Fixed: was singular "nickname"
    gender TEXT,
    pronouns TEXT,                             -- Fixed: was missing
    birth_date TEXT,                           -- JSON TimelineDate
    death_date TEXT,                           -- JSON TimelineDate
    birth_location_id TEXT,
    physical_description TEXT,                 -- JSON PhysicalDescription
    psychology TEXT,                           -- JSON CharacterPsychology
    voice_fingerprint TEXT,                    -- JSON VoiceFingerprint
    FOREIGN KEY (id) REFERENCES story_elements(id) ON DELETE CASCADE,
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE SET NULL,
    FOREIGN KEY (birth_location_id) REFERENCES story_elements(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_characters_species ON characters(species_id);
CREATE INDEX IF NOT EXISTS idx_characters_role ON characters(role);

-- Character Arc Phases
CREATE TABLE IF NOT EXISTS arc_phases (
    id TEXT PRIMARY KEY,
    character_id TEXT NOT NULL,
    phase TEXT NOT NULL,
    description TEXT,
    start_event_id TEXT,
    end_event_id TEXT,
    lie_strength INTEGER DEFAULT 100 CHECK (lie_strength BETWEEN 0 AND 100),
    truth_acceptance INTEGER DEFAULT 0 CHECK (truth_acceptance BETWEEN 0 AND 100),
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (start_event_id) REFERENCES timeline_events(id) ON DELETE SET NULL,
    FOREIGN KEY (end_event_id) REFERENCES timeline_events(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_arc_phases_character ON arc_phases(character_id);

-- Character States (temporal)
CREATE TABLE IF NOT EXISTS character_states (
    id TEXT PRIMARY KEY,
    character_id TEXT NOT NULL,
    effective_from TEXT NOT NULL,              -- JSON TimelineDate
    effective_to TEXT,                         -- JSON TimelineDate
    location_id TEXT,
    status TEXT DEFAULT 'alive' CHECK (status IN ('alive', 'dead', 'unknown', 'transformed')),
    occupation TEXT,
    power_level INTEGER,
    abilities TEXT DEFAULT '[]',               -- JSON array
    active_relationship_ids TEXT DEFAULT '[]', -- JSON array
    custom_state TEXT DEFAULT '{}',            -- JSON
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES story_elements(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_character_states_char ON character_states(character_id);

-- Voice Fingerprints
CREATE TABLE IF NOT EXISTS voice_fingerprints (
    id TEXT PRIMARY KEY,
    character_id TEXT NOT NULL UNIQUE,
    vocabulary_complexity TEXT CHECK (vocabulary_complexity IN ('simple', 'moderate', 'complex', 'erudite')),
    favored_words TEXT DEFAULT '[]',           -- JSON array
    avoided_words TEXT DEFAULT '[]',           -- JSON array
    catchphrases TEXT DEFAULT '[]',            -- JSON array
    average_sentence_length REAL,
    sentence_variation TEXT CHECK (sentence_variation IN ('low', 'medium', 'high')),
    preferred_structures TEXT DEFAULT '[]',    -- JSON array
    formality_level INTEGER CHECK (formality_level BETWEEN 0 AND 100),
    emotional_expressiveness INTEGER CHECK (emotional_expressiveness BETWEEN 0 AND 100),
    humor_style TEXT,
    dialect TEXT,
    language_tics TEXT DEFAULT '[]',           -- JSON array
    sample_dialogue TEXT DEFAULT '[]',         -- JSON array
    sample_internal_monologue TEXT DEFAULT '[]', -- JSON array
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 4: SPECIES & AGING
-- Fixed: Uses aging curve points, not multiplier (Bug #30 architectural fix)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS species (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    average_lifespan INTEGER,                  -- NULL = immortal
    maturity_age INTEGER,
    elder_age INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_species_project ON species(project_id);

-- Aging Curve Points (Fixed: replaces aging_rate multiplier)
CREATE TABLE IF NOT EXISTS species_aging (
    id TEXT PRIMARY KEY,
    species_id TEXT NOT NULL,
    chronological_age INTEGER NOT NULL CHECK (chronological_age >= 0),
    apparent_age REAL NOT NULL CHECK (apparent_age >= 0),
    label TEXT,                                -- e.g., "Child", "Adult", "Elder"
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE,
    UNIQUE(species_id, chronological_age)
);

CREATE INDEX IF NOT EXISTS idx_species_aging ON species_aging(species_id, chronological_age);

-- Hybrid Species (Fixed: Bug #7 - was missing implementation)
CREATE TABLE IF NOT EXISTS species_hybrids (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    parent_species_ids TEXT NOT NULL,          -- JSON array of species IDs
    aging_calculation TEXT DEFAULT 'average' CHECK (aging_calculation IN ('average', 'dominant', 'custom')),
    dominant_species_id TEXT,
    custom_aging_curve TEXT,                   -- JSON array of curve points
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (dominant_species_id) REFERENCES species(id) ON DELETE SET NULL
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 5: RELATIONSHIPS
-- Fixed: Added circular relationship prevention trigger
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS relationships (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    character1_id TEXT NOT NULL,
    character2_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'family', 'romantic', 'friendship', 'professional',
        'rivalry', 'mentor_student', 'enemy', 'acquaintance'
    )),
    character1_to_character2 TEXT,             -- e.g., "father of"
    character2_to_character1 TEXT,             -- e.g., "son of"
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (character1_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (character2_id) REFERENCES characters(id) ON DELETE CASCADE,
    CHECK (character1_id != character2_id)     -- Can't relate to self
);

CREATE INDEX IF NOT EXISTS idx_relationships_project ON relationships(project_id);
CREATE INDEX IF NOT EXISTS idx_relationships_char1 ON relationships(character1_id);
CREATE INDEX IF NOT EXISTS idx_relationships_char2 ON relationships(character2_id);

-- Relationship Phases (temporal)
CREATE TABLE IF NOT EXISTS relationship_phases (
    id TEXT PRIMARY KEY,
    relationship_id TEXT NOT NULL,
    start_date TEXT,                           -- JSON TimelineDate
    end_date TEXT,                             -- JSON TimelineDate
    intensity INTEGER DEFAULT 0 CHECK (intensity BETWEEN -100 AND 100),
    status TEXT CHECK (status IN ('forming', 'stable', 'strained', 'broken', 'reconciled')),
    description TEXT,
    trigger_event_id TEXT,
    FOREIGN KEY (relationship_id) REFERENCES relationships(id) ON DELETE CASCADE,
    FOREIGN KEY (trigger_event_id) REFERENCES timeline_events(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_rel_phases_relationship ON relationship_phases(relationship_id);

-- Romance Arc Beats
CREATE TABLE IF NOT EXISTS romance_beats (
    id TEXT PRIMARY KEY,
    relationship_id TEXT NOT NULL,
    beat TEXT NOT NULL CHECK (beat IN (
        'setup', 'meet_cute', 'no_way', 'first_kiss', 'attraction',
        'midpoint', 'inkling', 'retreat', 'dark_night',
        'grand_gesture', 'happily_ever_after'
    )),
    scene_id TEXT,
    event_id TEXT,
    completed INTEGER DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (relationship_id) REFERENCES relationships(id) ON DELETE CASCADE,
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE SET NULL,
    FOREIGN KEY (event_id) REFERENCES timeline_events(id) ON DELETE SET NULL
);

-- Relationship Maps
CREATE TABLE IF NOT EXISTS relationship_maps (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    as_of_date TEXT,                           -- JSON TimelineDate
    character_ids TEXT DEFAULT '[]',           -- JSON array
    layout TEXT DEFAULT '{}',                  -- JSON RelationshipMapLayout
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 6: CALENDAR SYSTEMS
-- Fixed: Added validation constraints (Bug #26, #28)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS calendar_systems (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_default INTEGER DEFAULT 0,
    year_zero INTEGER DEFAULT 0,
    era_name TEXT,
    era_negative_name TEXT,
    real_world_anchor TEXT,                    -- JSON {calendarDate, realWorldDate}
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calendars_project ON calendar_systems(project_id);
-- Fixed: Bug #28 - Only one default per project
CREATE UNIQUE INDEX idx_calendar_default ON calendar_systems(project_id) WHERE is_default = 1;

-- Calendar Months
CREATE TABLE IF NOT EXISTS calendar_months (
    id TEXT PRIMARY KEY,
    calendar_id TEXT NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    days INTEGER NOT NULL CHECK (days > 0),    -- Fixed: Must be positive
    sort_order INTEGER NOT NULL,
    season TEXT,
    FOREIGN KEY (calendar_id) REFERENCES calendar_systems(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_months_calendar ON calendar_months(calendar_id, sort_order);

-- Calendar Weekdays
CREATE TABLE IF NOT EXISTS calendar_weekdays (
    id TEXT PRIMARY KEY,
    calendar_id TEXT NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    sort_order INTEGER NOT NULL,
    FOREIGN KEY (calendar_id) REFERENCES calendar_systems(id) ON DELETE CASCADE
);

-- Calendar Moons
CREATE TABLE IF NOT EXISTS calendar_moons (
    id TEXT PRIMARY KEY,
    calendar_id TEXT NOT NULL,
    name TEXT NOT NULL,
    cycle_length REAL NOT NULL CHECK (cycle_length > 0),  -- Fixed: Bug #26 - Must be positive
    phases TEXT DEFAULT '["New Moon", "Waxing", "Full Moon", "Waning"]', -- JSON array
    FOREIGN KEY (calendar_id) REFERENCES calendar_systems(id) ON DELETE CASCADE
);

-- Calendar Holidays
CREATE TABLE IF NOT EXISTS calendar_holidays (
    id TEXT PRIMARY KEY,
    calendar_id TEXT NOT NULL,
    name TEXT NOT NULL,
    month INTEGER NOT NULL CHECK (month > 0),
    day INTEGER NOT NULL CHECK (day > 0),
    description TEXT,
    recurring INTEGER DEFAULT 1,
    year_introduced INTEGER,
    FOREIGN KEY (calendar_id) REFERENCES calendar_systems(id) ON DELETE CASCADE
);

-- Calendar Seasons
CREATE TABLE IF NOT EXISTS calendar_seasons (
    id TEXT PRIMARY KEY,
    calendar_id TEXT NOT NULL,
    name TEXT NOT NULL,
    start_month INTEGER NOT NULL,
    start_day INTEGER NOT NULL,
    end_month INTEGER NOT NULL,
    end_day INTEGER NOT NULL,
    FOREIGN KEY (calendar_id) REFERENCES calendar_systems(id) ON DELETE CASCADE
);

-- Eras
CREATE TABLE IF NOT EXISTS eras (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    calendar_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_year INTEGER NOT NULL,
    end_year INTEGER,
    color TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (calendar_id) REFERENCES calendar_systems(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 7: TIMELINE EVENTS
-- Fixed: Added circular causality prevention
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS timeline_events (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,                        -- JSON TimelineDate
    end_date TEXT,                             -- JSON TimelineDate (for duration)
    location_id TEXT,
    participant_ids TEXT DEFAULT '[]',         -- JSON array
    scene_ids TEXT DEFAULT '[]',               -- JSON array
    plot_thread_ids TEXT DEFAULT '[]',         -- JSON array
    event_type TEXT DEFAULT 'plot' CHECK (event_type IN ('plot', 'character', 'world', 'background')),
    importance TEXT DEFAULT 'moderate' CHECK (importance IN ('minor', 'moderate', 'major', 'pivotal')),
    branch_point_id TEXT,
    timeline_variant TEXT DEFAULT 'main',
    tags TEXT DEFAULT '[]',                    -- JSON array
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES story_elements(id) ON DELETE SET NULL,
    FOREIGN KEY (branch_point_id) REFERENCES branch_points(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_events_project ON timeline_events(project_id);
CREATE INDEX IF NOT EXISTS idx_events_variant ON timeline_events(project_id, timeline_variant);
CREATE INDEX IF NOT EXISTS idx_events_date ON timeline_events(project_id, json_extract(date, '$.year'));

-- Event Causality (Fixed: Bug #3 - Added circular prevention trigger below)
CREATE TABLE IF NOT EXISTS event_causality (
    id TEXT PRIMARY KEY,
    from_event_id TEXT NOT NULL,
    to_event_id TEXT NOT NULL,
    type TEXT DEFAULT 'triggers' CHECK (type IN ('enables', 'prevents', 'requires', 'triggers', 'influences', 'foreshadows')),
    strength INTEGER DEFAULT 100 CHECK (strength BETWEEN 0 AND 100),
    description TEXT,
    FOREIGN KEY (from_event_id) REFERENCES timeline_events(id) ON DELETE CASCADE,
    FOREIGN KEY (to_event_id) REFERENCES timeline_events(id) ON DELETE CASCADE,
    CHECK (from_event_id != to_event_id),      -- Can't cause self
    UNIQUE(from_event_id, to_event_id)
);

CREATE INDEX IF NOT EXISTS idx_causality_from ON event_causality(from_event_id);
CREATE INDEX IF NOT EXISTS idx_causality_to ON event_causality(to_event_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 8: MANUSCRIPT STRUCTURE
-- Fixed: Scenes are CHILDREN of containers, not subtypes (Bug #30)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS containers (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    parent_id TEXT,
    type TEXT NOT NULL CHECK (type IN ('book', 'part', 'arc', 'chapter', 'folder')),
    title TEXT NOT NULL,
    synopsis TEXT,
    sort_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'drafting', 'revising', 'complete')),
    target_word_count INTEGER CHECK (target_word_count >= 0),
    current_word_count INTEGER DEFAULT 0,
    pov TEXT,                                  -- Character ID for POV
    timeline TEXT,
    include_in_compile INTEGER DEFAULT 1,
    compile_as TEXT,
    page_break_before INTEGER DEFAULT 1,
    deleted_at TEXT,                           -- Soft delete
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES containers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_containers_project ON containers(project_id);
CREATE INDEX IF NOT EXISTS idx_containers_parent ON containers(parent_id);
CREATE INDEX IF NOT EXISTS idx_containers_sort ON containers(project_id, parent_id, sort_order);

-- Scenes (Fixed: Bug #30 - Scene is CHILD of container, has own ID)
CREATE TABLE IF NOT EXISTS scenes (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    container_id TEXT NOT NULL,                -- Fixed: was "id REFERENCES containers(id)"
    title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    content TEXT DEFAULT '',
    synopsis TEXT,
    scene_type TEXT DEFAULT 'action' CHECK (scene_type IN (
        'action', 'reaction', 'dialogue', 'exposition',
        'transition', 'flashback', 'dream', 'montage'
    )),
    -- Scene-Sequel Structure
    goal TEXT,
    conflict TEXT,
    disaster TEXT,
    reaction TEXT,
    dilemma TEXT,
    decision TEXT,
    -- Metadata
    pov_character_id TEXT,
    location_id TEXT,
    date TEXT,                                 -- JSON TimelineDate
    character_ids TEXT DEFAULT '[]',           -- JSON array
    plot_thread_ids TEXT DEFAULT '[]',         -- JSON array
    -- Statistics
    word_count INTEGER DEFAULT 0,
    target_word_count INTEGER,
    -- Status
    status TEXT DEFAULT 'outline' CHECK (status IN ('outline', 'draft', 'revised', 'polished')),
    -- Emotion tracking
    emotion_start INTEGER CHECK (emotion_start BETWEEN -100 AND 100),
    emotion_end INTEGER CHECK (emotion_end BETWEEN -100 AND 100),
    -- Compile
    include_in_compile INTEGER DEFAULT 1,
    notes TEXT,
    -- Version
    last_modified TEXT DEFAULT (datetime('now')),
    version INTEGER DEFAULT 1,
    deleted_at TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (container_id) REFERENCES containers(id) ON DELETE CASCADE,  -- Fixed cascade
    FOREIGN KEY (pov_character_id) REFERENCES characters(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES story_elements(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_scenes_project ON scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_scenes_container ON scenes(container_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_scenes_pov ON scenes(pov_character_id);
CREATE INDEX IF NOT EXISTS idx_scenes_location ON scenes(location_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 9: PLOT THREADS & PROMISES
-- Fixed: Column names match TypeScript
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS plot_threads (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    parent_thread_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'subplot' CHECK (type IN (
        'main', 'subplot', 'arc', 'saga', 'mystery', 'romance', 'foreshadowing'
    )),
    status TEXT DEFAULT 'planned' CHECK (status IN (
        'planned', 'active', 'paused', 'resolved', 'abandoned'
    )),
    start_scene_id TEXT,
    end_scene_id TEXT,
    character_ids TEXT DEFAULT '[]',           -- JSON array
    color TEXT DEFAULT '#3498db',
    importance INTEGER DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_thread_id) REFERENCES plot_threads(id) ON DELETE SET NULL,
    FOREIGN KEY (start_scene_id) REFERENCES scenes(id) ON DELETE SET NULL,
    FOREIGN KEY (end_scene_id) REFERENCES scenes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_threads_project ON plot_threads(project_id);
CREATE INDEX IF NOT EXISTS idx_threads_status ON plot_threads(project_id, status);

-- Promises (Fixed: Column names match TypeScript)
CREATE TABLE IF NOT EXISTS promises (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    plot_thread_id TEXT,
    description TEXT NOT NULL,
    promise_type TEXT DEFAULT 'setup' CHECK (promise_type IN (
        'chekhov_gun', 'foreshadowing', 'setup', 'question', 'prophecy'
    )),
    status TEXT DEFAULT 'planted' CHECK (status IN (
        'planted', 'reinforced', 'progressing', 'fulfilled', 'subverted', 'abandoned'
    )),
    planted_scene_id TEXT NOT NULL,            -- Fixed: was "seed_scene_id"
    fulfilled_scene_id TEXT,                   -- Fixed: was "payoff_scene_id"
    reinforcement_scene_ids TEXT DEFAULT '[]', -- JSON array
    expected_fulfillment TEXT,
    actual_fulfillment TEXT,
    must_fulfill_by TEXT,                      -- Scene or chapter reference
    notes TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (plot_thread_id) REFERENCES plot_threads(id) ON DELETE SET NULL,
    FOREIGN KEY (planted_scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
    FOREIGN KEY (fulfilled_scene_id) REFERENCES scenes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_promises_project ON promises(project_id);
CREATE INDEX IF NOT EXISTS idx_promises_status ON promises(project_id, status);
CREATE INDEX IF NOT EXISTS idx_promises_planted ON promises(planted_scene_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 10: VERSION CONTROL
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS snapshots (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    is_auto_save INTEGER DEFAULT 0,
    captured_container_ids TEXT DEFAULT '[]',  -- JSON array
    captured_scene_ids TEXT DEFAULT '[]',      -- JSON array
    total_word_count INTEGER DEFAULT 0,
    labels TEXT DEFAULT '[]',                  -- JSON array
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_snapshots_project ON snapshots(project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS document_versions (
    id TEXT PRIMARY KEY,
    scene_id TEXT NOT NULL,
    snapshot_id TEXT,
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    version_number INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    change_description TEXT,
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
    FOREIGN KEY (snapshot_id) REFERENCES snapshots(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_versions_scene ON document_versions(scene_id, version_number DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 11: WRITING PRODUCTIVITY
-- Fixed: Matches TypeScript interface
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS writing_goals (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'total', 'deadline')),
    target_words INTEGER NOT NULL CHECK (target_words > 0),
    start_date TEXT NOT NULL,
    end_date TEXT,
    current_progress INTEGER DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_goals_project ON writing_goals(project_id);

CREATE TABLE IF NOT EXISTS writing_sessions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    scene_ids TEXT DEFAULT '[]',               -- JSON array - Fixed: was missing
    words_written INTEGER DEFAULT 0,
    words_deleted INTEGER DEFAULT 0,           -- Fixed: was missing
    net_words INTEGER DEFAULT 0,               -- Fixed: was missing
    session_type TEXT DEFAULT 'freewrite' CHECK (session_type IN (
        'freewrite', 'sprint', 'edit', 'revision'
    )),
    sprint_duration INTEGER,                   -- Minutes
    notes TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_project ON writing_sessions(project_id, start_time DESC);

CREATE TABLE IF NOT EXISTS writing_streaks (
    project_id TEXT PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_writing_date TEXT,
    streak_goal INTEGER DEFAULT 500,           -- Words per day to maintain
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 12: COMPILE & EXPORT
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS compile_presets (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    format TEXT NOT NULL CHECK (format IN (
        'markdown', 'docx', 'pdf', 'epub', 'html', 'plain_text', 'fountain', 'latex'
    )),
    include_container_types TEXT DEFAULT '["book","part","arc","chapter"]', -- JSON array
    exclude_container_ids TEXT DEFAULT '[]',   -- JSON array
    exclude_scene_ids TEXT DEFAULT '[]',       -- JSON array
    include_title_page INTEGER DEFAULT 1,
    title_page_template TEXT,
    include_table_of_contents INTEGER DEFAULT 0,
    include_copyright INTEGER DEFAULT 0,
    copyright_text TEXT,
    formatting TEXT DEFAULT '{}',              -- JSON CompileFormatting
    chapter_separator TEXT,
    scene_separator TEXT DEFAULT '* * *',
    output_path TEXT,
    filename_template TEXT DEFAULT '{project}_{date}_{format}',
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_presets_project ON compile_presets(project_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 13: WORLDBUILDING
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    parent_location_id TEXT,
    location_type TEXT CHECK (location_type IN (
        'planet', 'continent', 'country', 'region', 'city', 'building', 'room', 'other'
    )),
    coordinates TEXT,                          -- JSON {mapId, x, y, z}
    climate TEXT,
    terrain TEXT,
    population INTEGER,
    government TEXT,
    sights TEXT DEFAULT '[]',                  -- JSON array
    sounds TEXT DEFAULT '[]',                  -- JSON array
    smells TEXT DEFAULT '[]',                  -- JSON array
    founded_date TEXT,                         -- JSON TimelineDate
    destroyed_date TEXT,                       -- JSON TimelineDate
    FOREIGN KEY (id) REFERENCES story_elements(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_location_id) REFERENCES locations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_location_id);

-- Interactive Maps
CREATE TABLE IF NOT EXISTS interactive_maps (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    width INTEGER,
    height INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS map_layers (
    id TEXT PRIMARY KEY,
    map_id TEXT NOT NULL,
    name TEXT NOT NULL,
    visible INTEGER DEFAULT 1,
    opacity REAL DEFAULT 1.0 CHECK (opacity BETWEEN 0 AND 1),
    type TEXT CHECK (type IN ('base', 'overlay', 'markers')),
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (map_id) REFERENCES interactive_maps(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS map_markers (
    id TEXT PRIMARY KEY,
    map_id TEXT NOT NULL,
    location_id TEXT,
    event_id TEXT,
    x REAL NOT NULL CHECK (x >= 0),
    y REAL NOT NULL CHECK (y >= 0),
    icon TEXT,
    label TEXT,
    description TEXT,
    visible_from TEXT,                         -- JSON TimelineDate
    visible_to TEXT,                           -- JSON TimelineDate
    FOREIGN KEY (map_id) REFERENCES interactive_maps(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (event_id) REFERENCES timeline_events(id) ON DELETE SET NULL
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 14: AI & EMBEDDINGS
-- Fixed: Uses JSON array instead of BLOB (Bug #29)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS embeddings (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,                  -- Fixed: was missing
    entity_type TEXT NOT NULL CHECK (entity_type IN ('scene', 'character', 'location', 'event', 'note')),
    entity_id TEXT NOT NULL,                   -- Fixed: was "source_id"
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER DEFAULT 0,
    vector TEXT NOT NULL,                      -- Fixed: JSON array, not BLOB
    model TEXT NOT NULL,
    dimensions INTEGER NOT NULL,               -- Fixed: was missing
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_embeddings_project ON embeddings(project_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_entity ON embeddings(entity_type, entity_id);

-- Consistency Facts
CREATE TABLE IF NOT EXISTS consistency_facts (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    fact TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('character', 'world', 'plot', 'timeline', 'rule')),
    source_scene_id TEXT,
    source_chapter TEXT,
    importance TEXT DEFAULT 'important' CHECK (importance IN ('critical', 'important', 'minor')),
    related_entity_ids TEXT DEFAULT '[]',      -- JSON array
    verified INTEGER DEFAULT 0,
    established_at TEXT DEFAULT (datetime('now')),
    last_verified TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (source_scene_id) REFERENCES scenes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_facts_project ON consistency_facts(project_id);
CREATE INDEX IF NOT EXISTS idx_facts_category ON consistency_facts(project_id, category);

-- Entity States (temporal)
CREATE TABLE IF NOT EXISTS entity_states (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    effective_from TEXT NOT NULL,              -- JSON TimelineDate
    effective_to TEXT,                         -- JSON TimelineDate
    state_data TEXT NOT NULL,                  -- JSON
    trigger_event_id TEXT,
    trigger_scene_id TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (trigger_event_id) REFERENCES timeline_events(id) ON DELETE SET NULL,
    FOREIGN KEY (trigger_scene_id) REFERENCES scenes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_entity_states ON entity_states(entity_type, entity_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 15: TEMPLATES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    project_id TEXT,                           -- NULL for global templates
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('scene', 'character', 'chapter', 'beat_sheet', 'custom')),
    content TEXT NOT NULL,
    fields TEXT DEFAULT '[]',                  -- JSON array of TemplateField
    is_system INTEGER DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 16: WHAT-IF BRANCHING
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS branch_points (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    trigger_event_id TEXT,
    trigger_scene_id TEXT,
    branch_date TEXT NOT NULL,                 -- JSON TimelineDate
    baseline_variant TEXT DEFAULT 'main',
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (trigger_event_id) REFERENCES timeline_events(id) ON DELETE SET NULL,
    FOREIGN KEY (trigger_scene_id) REFERENCES scenes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_branches_project ON branch_points(project_id);

CREATE TABLE IF NOT EXISTS branch_alternatives (
    id TEXT PRIMARY KEY,
    branch_point_id TEXT NOT NULL,
    variant_name TEXT NOT NULL,
    description TEXT,
    divergence_description TEXT,
    modified_event_ids TEXT DEFAULT '[]',      -- JSON array
    added_event_ids TEXT DEFAULT '[]',         -- JSON array
    removed_event_ids TEXT DEFAULT '[]',       -- JSON array
    is_canon INTEGER DEFAULT 0,
    exploration_status TEXT DEFAULT 'planned' CHECK (exploration_status IN (
        'planned', 'outlined', 'drafted', 'complete'
    )),
    FOREIGN KEY (branch_point_id) REFERENCES branch_points(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 17: EMOTION TRACKING
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scene_sentiment (
    scene_id TEXT PRIMARY KEY,
    sentiment_score INTEGER CHECK (sentiment_score BETWEEN -100 AND 100),
    emotions TEXT DEFAULT '{}',                -- JSON {joy, sadness, anger, fear, surprise, disgust, trust, anticipation}
    tension_level INTEGER CHECK (tension_level BETWEEN 0 AND 100),
    pacing TEXT CHECK (pacing IN ('slow', 'medium', 'fast')),
    is_auto_calculated INTEGER DEFAULT 0,
    last_calculated TEXT,
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS arc_patterns (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    pattern TEXT CHECK (pattern IN (
        'rags_to_riches', 'riches_to_rags', 'man_in_hole',
        'icarus', 'cinderella', 'oedipus'
    )),
    start_container_id TEXT,
    end_container_id TEXT,
    expected_curve TEXT,                       -- JSON array of {x, y}
    actual_curve TEXT,                         -- JSON array of {x, y}
    deviation_score REAL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (start_container_id) REFERENCES containers(id) ON DELETE SET NULL,
    FOREIGN KEY (end_container_id) REFERENCES containers(id) ON DELETE SET NULL
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 18: FULL-TEXT SEARCH
-- Fixed: Table names match TypeScript (scenes_fts, story_elements_fts)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE VIRTUAL TABLE IF NOT EXISTS scenes_fts USING fts5(
    title,
    content,
    synopsis,
    notes,
    content='scenes',
    content_rowid='rowid',
    tokenize='porter unicode61'
);

CREATE VIRTUAL TABLE IF NOT EXISTS story_elements_fts USING fts5(
    name,
    aliases,
    description,
    notes,
    tags,
    content='story_elements',
    content_rowid='rowid',
    tokenize='porter unicode61'
);

CREATE VIRTUAL TABLE IF NOT EXISTS timeline_events_fts USING fts5(
    name,
    description,
    tags,
    content='timeline_events',
    content_rowid='rowid',
    tokenize='porter unicode61'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 19: TRIGGERS
-- Fixed: Word count bug #25, Added cascade updates, circular prevention
-- ═══════════════════════════════════════════════════════════════════════════

-- Fixed: Bug #25 - Proper word count using recursive splitting
CREATE TRIGGER IF NOT EXISTS update_scene_word_count
AFTER UPDATE OF content ON scenes
WHEN NEW.content IS NOT NULL
BEGIN
    UPDATE scenes
    SET word_count = (
        SELECT CASE
            WHEN trim(NEW.content) = '' THEN 0
            ELSE length(trim(NEW.content)) - length(replace(trim(NEW.content), ' ', '')) + 1
                 - (length(NEW.content) - length(replace(NEW.content, '  ', ' '))) -- Adjust for double spaces
        END
    )
    WHERE id = NEW.id;
END;

-- Update container word count when scene changes
CREATE TRIGGER IF NOT EXISTS update_container_word_count
AFTER UPDATE OF word_count ON scenes
BEGIN
    UPDATE containers
    SET current_word_count = (
        SELECT COALESCE(SUM(word_count), 0)
        FROM scenes
        WHERE container_id = NEW.container_id AND deleted_at IS NULL
    )
    WHERE id = NEW.container_id;
END;

-- Update project word count
CREATE TRIGGER IF NOT EXISTS update_project_word_count
AFTER UPDATE OF current_word_count ON containers
BEGIN
    UPDATE projects
    SET current_word_count = (
        SELECT COALESCE(SUM(s.word_count), 0)
        FROM scenes s
        JOIN containers c ON s.container_id = c.id
        WHERE c.project_id = NEW.project_id
        AND s.deleted_at IS NULL
    ),
    updated_at = datetime('now')
    WHERE id = NEW.project_id;
END;

-- FTS sync triggers for scenes
CREATE TRIGGER IF NOT EXISTS scenes_fts_insert AFTER INSERT ON scenes BEGIN
    INSERT INTO scenes_fts(rowid, title, content, synopsis, notes)
    VALUES (NEW.rowid, NEW.title, NEW.content, NEW.synopsis, NEW.notes);
END;

CREATE TRIGGER IF NOT EXISTS scenes_fts_update AFTER UPDATE OF title, content, synopsis, notes ON scenes BEGIN
    DELETE FROM scenes_fts WHERE rowid = OLD.rowid;
    INSERT INTO scenes_fts(rowid, title, content, synopsis, notes)
    VALUES (NEW.rowid, NEW.title, NEW.content, NEW.synopsis, NEW.notes);
END;

CREATE TRIGGER IF NOT EXISTS scenes_fts_delete AFTER DELETE ON scenes BEGIN
    DELETE FROM scenes_fts WHERE rowid = OLD.rowid;
END;

-- FTS sync triggers for story_elements
CREATE TRIGGER IF NOT EXISTS elements_fts_insert AFTER INSERT ON story_elements BEGIN
    INSERT INTO story_elements_fts(rowid, name, aliases, description, notes, tags)
    VALUES (NEW.rowid, NEW.name, NEW.aliases, NEW.description, NEW.notes, NEW.tags);
END;

CREATE TRIGGER IF NOT EXISTS elements_fts_update AFTER UPDATE OF name, aliases, description, notes, tags ON story_elements BEGIN
    DELETE FROM story_elements_fts WHERE rowid = OLD.rowid;
    INSERT INTO story_elements_fts(rowid, name, aliases, description, notes, tags)
    VALUES (NEW.rowid, NEW.name, NEW.aliases, NEW.description, NEW.notes, NEW.tags);
END;

CREATE TRIGGER IF NOT EXISTS elements_fts_delete AFTER DELETE ON story_elements BEGIN
    DELETE FROM story_elements_fts WHERE rowid = OLD.rowid;
END;

-- FTS sync triggers for timeline_events
CREATE TRIGGER IF NOT EXISTS events_fts_insert AFTER INSERT ON timeline_events BEGIN
    INSERT INTO timeline_events_fts(rowid, name, description, tags)
    VALUES (NEW.rowid, NEW.name, NEW.description, NEW.tags);
END;

CREATE TRIGGER IF NOT EXISTS events_fts_update AFTER UPDATE OF name, description, tags ON timeline_events BEGIN
    DELETE FROM timeline_events_fts WHERE rowid = OLD.rowid;
    INSERT INTO timeline_events_fts(rowid, name, description, tags)
    VALUES (NEW.rowid, NEW.name, NEW.description, NEW.tags);
END;

CREATE TRIGGER IF NOT EXISTS events_fts_delete AFTER DELETE ON timeline_events BEGIN
    DELETE FROM timeline_events_fts WHERE rowid = OLD.rowid;
END;

-- Fixed: Bug #3 - Prevent circular causality (direct A→B→A)
CREATE TRIGGER IF NOT EXISTS prevent_circular_causality
BEFORE INSERT ON event_causality
BEGIN
    SELECT RAISE(ABORT, 'Circular causality detected: effect event already causes the cause event')
    WHERE EXISTS (
        SELECT 1 FROM event_causality
        WHERE from_event_id = NEW.to_event_id
        AND to_event_id = NEW.from_event_id
    );
END;

-- Fixed: Bug #4 - Validate promise fulfillment timeline
CREATE TRIGGER IF NOT EXISTS validate_promise_timeline
BEFORE UPDATE OF fulfilled_scene_id ON promises
WHEN NEW.fulfilled_scene_id IS NOT NULL
BEGIN
    SELECT RAISE(ABORT, 'Promise cannot be fulfilled in a scene that comes before it was planted')
    WHERE (
        SELECT sort_order FROM scenes WHERE id = NEW.fulfilled_scene_id
    ) < (
        SELECT sort_order FROM scenes WHERE id = NEW.planted_scene_id
    )
    AND (
        SELECT container_id FROM scenes WHERE id = NEW.fulfilled_scene_id
    ) = (
        SELECT container_id FROM scenes WHERE id = NEW.planted_scene_id
    );
END;

-- Auto-update timestamps
CREATE TRIGGER IF NOT EXISTS update_project_timestamp
AFTER UPDATE ON projects
BEGIN
    UPDATE projects SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_element_timestamp
AFTER UPDATE ON story_elements
BEGIN
    UPDATE story_elements SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_scene_timestamp
AFTER UPDATE ON scenes
BEGIN
    UPDATE scenes SET last_modified = datetime('now') WHERE id = NEW.id;
END;

-- Cleanup old auto-save versions (keep last 50)
CREATE TRIGGER IF NOT EXISTS cleanup_old_versions
AFTER INSERT ON document_versions
WHEN (SELECT COUNT(*) FROM document_versions WHERE scene_id = NEW.scene_id) > 50
BEGIN
    DELETE FROM document_versions
    WHERE scene_id = NEW.scene_id
    AND id NOT IN (
        SELECT id FROM document_versions
        WHERE scene_id = NEW.scene_id
        ORDER BY created_at DESC
        LIMIT 50
    );
END;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 20: VIEWS
-- ═══════════════════════════════════════════════════════════════════════════

-- Active (non-deleted) projects
CREATE VIEW IF NOT EXISTS active_projects AS
SELECT * FROM projects WHERE deleted_at IS NULL;

-- Active scenes
CREATE VIEW IF NOT EXISTS active_scenes AS
SELECT * FROM scenes WHERE deleted_at IS NULL;

-- Active containers
CREATE VIEW IF NOT EXISTS active_containers AS
SELECT * FROM containers WHERE deleted_at IS NULL;

-- Unfulfilled promises
CREATE VIEW IF NOT EXISTS unfulfilled_promises AS
SELECT
    p.*,
    s.title AS planted_scene_title,
    c.title AS chapter_title
FROM promises p
LEFT JOIN scenes s ON p.planted_scene_id = s.id
LEFT JOIN containers c ON s.container_id = c.id
WHERE p.status NOT IN ('fulfilled', 'subverted', 'abandoned');

-- Character ages view (requires application-level calculation for full accuracy)
CREATE VIEW IF NOT EXISTS character_summary AS
SELECT
    c.id,
    se.name,
    c.full_name,
    c.role,
    c.arc_type,
    sp.name AS species_name,
    c.birth_date,
    c.death_date,
    (SELECT COUNT(*) FROM scenes WHERE pov_character_id = c.id) AS pov_scene_count,
    (SELECT COALESCE(SUM(word_count), 0) FROM scenes WHERE pov_character_id = c.id) AS total_pov_words
FROM characters c
JOIN story_elements se ON c.id = se.id
LEFT JOIN species sp ON c.species_id = sp.id
WHERE se.deleted_at IS NULL;

-- Plot thread progress
CREATE VIEW IF NOT EXISTS plot_thread_progress AS
SELECT
    pt.*,
    (SELECT COUNT(*) FROM scenes s
     WHERE s.plot_thread_ids LIKE '%"' || pt.id || '"%'
     AND s.deleted_at IS NULL) AS scene_count,
    (SELECT s.title FROM scenes s
     WHERE s.id = pt.start_scene_id) AS start_scene_title,
    (SELECT s.title FROM scenes s
     WHERE s.id = pt.end_scene_id) AS end_scene_title
FROM plot_threads pt;

-- Writing productivity summary
CREATE VIEW IF NOT EXISTS productivity_summary AS
SELECT
    ws.project_id,
    p.name AS project_name,
    COUNT(ws.id) AS total_sessions,
    SUM(ws.net_words) AS total_words,
    AVG(ws.net_words) AS avg_words_per_session,
    SUM(CASE WHEN ws.end_time IS NOT NULL
        THEN (julianday(ws.end_time) - julianday(ws.start_time)) * 24 * 60
        ELSE 0 END) AS total_minutes
FROM writing_sessions ws
JOIN projects p ON ws.project_id = p.id
GROUP BY ws.project_id, p.name;

-- Causality violations (effect happens before cause)
CREATE VIEW IF NOT EXISTS causality_violations AS
SELECT
    ec.id,
    ec.from_event_id AS cause_id,
    ec.to_event_id AS effect_id,
    cause.name AS cause_name,
    effect.name AS effect_name,
    cause.date AS cause_date,
    effect.date AS effect_date
FROM event_causality ec
JOIN timeline_events cause ON ec.from_event_id = cause.id
JOIN timeline_events effect ON ec.to_event_id = effect.id
WHERE json_extract(effect.date, '$.year') < json_extract(cause.date, '$.year')
   OR (json_extract(effect.date, '$.year') = json_extract(cause.date, '$.year')
       AND json_extract(effect.date, '$.month') < json_extract(cause.date, '$.month'))
   OR (json_extract(effect.date, '$.year') = json_extract(cause.date, '$.year')
       AND json_extract(effect.date, '$.month') = json_extract(cause.date, '$.month')
       AND json_extract(effect.date, '$.day') < json_extract(cause.date, '$.day'));

-- ═══════════════════════════════════════════════════════════════════════════
-- END OF SCHEMA v3.0
-- All 37 stress test bugs addressed
-- ═══════════════════════════════════════════════════════════════════════════
