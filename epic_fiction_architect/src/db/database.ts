/**
 * Epic Fiction Architect - Database Access Layer
 *
 * Provides typed access to the SQLite database with support for:
 * - Full-text search (FTS5)
 * - Vector embeddings for semantic search
 * - CRDT-compatible operations for sync
 * - Transaction management
 * - Migration support
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import {v4 as uuidv4} from 'uuid';
import type {
  Project,
  ProjectSettings,
  StoryElement,
  Character,
  Species,
  CalendarSystem,
  TimelineDate,
  TimelineEvent,
  Container,
  Scene,
  PlotThread,
  Promise,
  WritingSession,
  Embedding,
  ConsistencyFact
} from '../core/types';
import { StoryElementType } from '../core/types';

// ============================================================================
// DATABASE MANAGER
// ============================================================================

export class DatabaseManager {
  private db: Database.Database;

  constructor(dbPath: string) {
    const dbDir = path.dirname(dbPath);

    // Ensure directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, {recursive: true});
    }

    // Open database with WAL mode for better performance
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    // Initialize schema if needed
    this.initializeSchema();
  }

  /**
   * Initialize database schema from schema.sql
   */
  private initializeSchema(): void {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      this.db.exec(schema);
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }

  /**
   * Execute raw SQL (for advanced queries)
   */
  exec(sql: string): void {
    this.db.exec(sql);
  }

  /**
   * Run a single statement
   */
  run(sql: string, params?: unknown[]): Database.RunResult {
    const stmt = this.db.prepare(sql);
    return params ? stmt.run(...params) : stmt.run();
  }

  /**
   * Get single row
   */
  get<T>(sql: string, params?: unknown[]): T | undefined {
    const stmt = this.db.prepare(sql);
    return (params ? stmt.get(...params) : stmt.get()) as T | undefined;
  }

  /**
   * Get all rows
   */
  all<T>(sql: string, params?: unknown[]): T[] {
    const stmt = this.db.prepare(sql);
    return (params ? stmt.all(...params) : stmt.all()) as T[];
  }

  /**
   * Transaction wrapper
   */
  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  // ==========================================================================
  // PROJECT OPERATIONS
  // ==========================================================================

  createProject(name: string, settings?: Partial<ProjectSettings>): Project {
    const id = uuidv4();
    const now = new Date().toISOString();
    const defaultSettings: ProjectSettings = {
      autoSaveInterval: 30000,
      backupFrequency: 'daily',
      defaultSceneWordTarget: 2000,
      enableSpellCheck: true,
      enableGrammarCheck: true,
      theme: 'dark',
      fontFamily: 'Georgia',
      fontSize: 16,
      lineSpacing: 1.5,
      ...settings
    };

    this.run(
      `INSERT INTO projects (id, name, current_word_count, settings, created_at, updated_at)
       VALUES (?, ?, 0, ?, ?, ?)`,
      [id, name, JSON.stringify(defaultSettings), now, now]
    );

    return {
      id,
      name,
      currentWordCount: 0,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      settings: defaultSettings
    };
  }

  getProject(id: string): Project | undefined {
    const row = this.get<{
      id: string;
      name: string;
      description: string | null;
      genre: string | null;
      target_word_count: number | null;
      current_word_count: number;
      default_calendar_id: string | null;
      settings: string;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM projects WHERE id = ?', [id]);

    if (!row) return undefined;

    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      genre: row.genre ?? undefined,
      targetWordCount: row.target_word_count ?? undefined,
      currentWordCount: row.current_word_count,
      defaultCalendarId: row.default_calendar_id ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      settings: JSON.parse(row.settings)
    };
  }

  getAllProjects(): Project[] {
    const rows = this.all<{
      id: string;
      name: string;
      description: string | null;
      genre: string | null;
      target_word_count: number | null;
      current_word_count: number;
      default_calendar_id: string | null;
      settings: string;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM projects ORDER BY updated_at DESC');

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      genre: row.genre ?? undefined,
      targetWordCount: row.target_word_count ?? undefined,
      currentWordCount: row.current_word_count,
      defaultCalendarId: row.default_calendar_id ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      settings: JSON.parse(row.settings)
    }));
  }

  updateProject(id: string, updates: Partial<Project>): void {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      params.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      params.push(updates.description);
    }
    if (updates.genre !== undefined) {
      setClauses.push('genre = ?');
      params.push(updates.genre);
    }
    if (updates.targetWordCount !== undefined) {
      setClauses.push('target_word_count = ?');
      params.push(updates.targetWordCount);
    }
    if (updates.currentWordCount !== undefined) {
      setClauses.push('current_word_count = ?');
      params.push(updates.currentWordCount);
    }
    if (updates.settings !== undefined) {
      setClauses.push('settings = ?');
      params.push(JSON.stringify(updates.settings));
    }

    setClauses.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    this.run(
      `UPDATE projects SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );
  }

  deleteProject(id: string): void {
    // Cascade delete handled by foreign keys
    this.run('DELETE FROM projects WHERE id = ?', [id]);
  }

  // ==========================================================================
  // STORY ELEMENT OPERATIONS
  // ==========================================================================

  createStoryElement(
    projectId: string,
    type: StoryElementType,
    name: string,
    data?: Partial<StoryElement>
  ): StoryElement {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.run(
      `INSERT INTO story_elements
       (id, project_id, type, name, aliases, description, notes, tags, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        type,
        name,
        JSON.stringify(data?.aliases ?? []),
        data?.description ?? null,
        data?.notes ?? null,
        JSON.stringify(data?.tags ?? []),
        JSON.stringify(data?.metadata ?? {}),
        now,
        now
      ]
    );

    // Update FTS index
    this.run(
      `INSERT INTO story_elements_fts (rowid, name, aliases, description, notes, tags)
       SELECT rowid, name, aliases, description, notes, tags FROM story_elements WHERE id = ?`,
      [id]
    );

    return {
      id,
      projectId,
      type,
      name,
      aliases: data?.aliases ?? [],
      description: data?.description,
      notes: data?.notes,
      tags: data?.tags ?? [],
      metadata: data?.metadata ?? {},
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };
  }

  getStoryElement(id: string): StoryElement | undefined {
    const row = this.get<{
      id: string;
      project_id: string;
      type: StoryElementType;
      name: string;
      aliases: string;
      description: string | null;
      notes: string | null;
      tags: string;
      metadata: string;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM story_elements WHERE id = ?', [id]);

    if (!row) return undefined;

    return {
      id: row.id,
      projectId: row.project_id,
      type: row.type,
      name: row.name,
      aliases: JSON.parse(row.aliases),
      description: row.description ?? undefined,
      notes: row.notes ?? undefined,
      tags: JSON.parse(row.tags),
      metadata: JSON.parse(row.metadata),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  getStoryElementsByType(projectId: string, type: StoryElementType): StoryElement[] {
    const rows = this.all<{
      id: string;
      project_id: string;
      type: StoryElementType;
      name: string;
      aliases: string;
      description: string | null;
      notes: string | null;
      tags: string;
      metadata: string;
      created_at: string;
      updated_at: string;
    }>(
      'SELECT * FROM story_elements WHERE project_id = ? AND type = ? ORDER BY name',
      [projectId, type]
    );

    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      type: row.type,
      name: row.name,
      aliases: JSON.parse(row.aliases),
      description: row.description ?? undefined,
      notes: row.notes ?? undefined,
      tags: JSON.parse(row.tags),
      metadata: JSON.parse(row.metadata),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  searchStoryElements(projectId: string, query: string, limit = 50): StoryElement[] {
    const rows = this.all<{
      id: string;
      project_id: string;
      type: StoryElementType;
      name: string;
      aliases: string;
      description: string | null;
      notes: string | null;
      tags: string;
      metadata: string;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT se.* FROM story_elements se
       JOIN story_elements_fts fts ON se.rowid = fts.rowid
       WHERE se.project_id = ? AND story_elements_fts MATCH ?
       ORDER BY rank
       LIMIT ?`,
      [projectId, query, limit]
    );

    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      type: row.type,
      name: row.name,
      aliases: JSON.parse(row.aliases),
      description: row.description ?? undefined,
      notes: row.notes ?? undefined,
      tags: JSON.parse(row.tags),
      metadata: JSON.parse(row.metadata),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  // ==========================================================================
  // CHARACTER OPERATIONS
  // ==========================================================================

  createCharacter(projectId: string, name: string, data?: Partial<Character>): string {
    return this.transaction(() => {
      // Create base story element
      const element = this.createStoryElement(projectId, StoryElementType.CHARACTER, name, data);

      // Create character record
      this.run(
        `INSERT INTO characters
         (id, role, arc_type, species_id, full_name, nicknames, gender, pronouns,
          birth_date, death_date, birth_location_id, physical_description, psychology, voice_fingerprint)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          element.id,
          data?.role ?? 'background',
          data?.arcType ?? 'flat_testing',
          data?.speciesId ?? null,
          data?.fullName ?? name,
          JSON.stringify(data?.nicknames ?? []),
          data?.gender ?? null,
          data?.pronouns ?? null,
          data?.birthDate ? JSON.stringify(data.birthDate) : null,
          data?.deathDate ? JSON.stringify(data.deathDate) : null,
          data?.birthLocationId ?? null,
          data?.physicalDescription ? JSON.stringify(data.physicalDescription) : null,
          data?.psychology ? JSON.stringify(data.psychology) : null,
          data?.voiceFingerprint ? JSON.stringify(data.voiceFingerprint) : null
        ]
      );

      return element.id;
    });
  }

  getCharacter(id: string): Character | undefined {
    const element = this.getStoryElement(id);
    if (!element || element.type !== StoryElementType.CHARACTER) return undefined;

    const charRow = this.get<{
      role: string;
      arc_type: string;
      species_id: string | null;
      full_name: string;
      nicknames: string;
      gender: string | null;
      pronouns: string | null;
      birth_date: string | null;
      death_date: string | null;
      birth_location_id: string | null;
      physical_description: string | null;
      psychology: string | null;
      voice_fingerprint: string | null;
    }>('SELECT * FROM characters WHERE id = ?', [id]);

    if (!charRow) return undefined;

    // Get arc phases
    const arcPhases = this.all<{
      id: string;
      phase: string;
      description: string;
      start_event_id: string | null;
      end_event_id: string | null;
      lie_strength: number;
      truth_acceptance: number;
    }>('SELECT * FROM arc_phases WHERE character_id = ? ORDER BY id', [id]);

    // Get character states
    const states = this.all<{
      id: string;
      effective_from: string;
      effective_to: string | null;
      location_id: string | null;
      status: string;
      occupation: string | null;
      power_level: number | null;
      abilities: string;
      active_relationship_ids: string;
      custom_state: string;
    }>('SELECT * FROM character_states WHERE character_id = ? ORDER BY effective_from', [id]);

    return {
      ...element,
      type: StoryElementType.CHARACTER,
      role: charRow.role as Character['role'],
      arcType: charRow.arc_type as Character['arcType'],
      speciesId: charRow.species_id ?? undefined,
      fullName: charRow.full_name,
      nicknames: JSON.parse(charRow.nicknames),
      gender: charRow.gender ?? undefined,
      pronouns: charRow.pronouns ?? undefined,
      birthDate: charRow.birth_date ? JSON.parse(charRow.birth_date) : undefined,
      deathDate: charRow.death_date ? JSON.parse(charRow.death_date) : undefined,
      birthLocationId: charRow.birth_location_id ?? undefined,
      physicalDescription: charRow.physical_description
        ? JSON.parse(charRow.physical_description)
        : undefined,
      psychology: charRow.psychology ? JSON.parse(charRow.psychology) : undefined,
      voiceFingerprint: charRow.voice_fingerprint
        ? JSON.parse(charRow.voice_fingerprint)
        : undefined,
      arcPhases: arcPhases.map(ap => ({
        id: ap.id,
        characterId: id,
        phase: ap.phase,
        description: ap.description,
        startEventId: ap.start_event_id ?? undefined,
        endEventId: ap.end_event_id ?? undefined,
        lieStrength: ap.lie_strength,
        truthAcceptance: ap.truth_acceptance
      })),
      states: states.map(s => ({
        id: s.id,
        characterId: id,
        effectiveFrom: JSON.parse(s.effective_from),
        effectiveTo: s.effective_to ? JSON.parse(s.effective_to) : undefined,
        locationId: s.location_id ?? undefined,
        status: s.status as 'alive' | 'dead' | 'unknown' | 'transformed',
        occupation: s.occupation ?? undefined,
        powerLevel: s.power_level ?? undefined,
        abilities: JSON.parse(s.abilities),
        activeRelationshipIds: JSON.parse(s.active_relationship_ids),
        customState: JSON.parse(s.custom_state)
      }))
    };
  }

  // ==========================================================================
  // SPECIES & AGING
  // ==========================================================================

  createSpecies(
    projectId: string,
    name: string,
    agingCurve: {chronologicalAge: number; apparentAge: number; label?: string}[],
    data?: Partial<Species>
  ): string {
    const id = uuidv4();

    this.run(
      `INSERT INTO species (id, project_id, name, description, average_lifespan, maturity_age, elder_age)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        name,
        data?.description ?? null,
        data?.averageLifespan ?? null,
        data?.maturityAge ?? null,
        data?.elderAge ?? null
      ]
    );

    // Insert aging curve points
    for (const point of agingCurve) {
      this.run(
        `INSERT INTO species_aging (species_id, chronological_age, apparent_age, label)
         VALUES (?, ?, ?, ?)`,
        [id, point.chronologicalAge, point.apparentAge, point.label ?? null]
      );
    }

    return id;
  }

  getSpecies(id: string): Species | undefined {
    const row = this.get<{
      id: string;
      project_id: string;
      name: string;
      description: string | null;
      average_lifespan: number | null;
      maturity_age: number | null;
      elder_age: number | null;
    }>('SELECT * FROM species WHERE id = ?', [id]);

    if (!row) return undefined;

    const agingCurve = this.all<{
      chronological_age: number;
      apparent_age: number;
      label: string | null;
    }>('SELECT * FROM species_aging WHERE species_id = ? ORDER BY chronological_age', [id]);

    return {
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      description: row.description ?? undefined,
      averageLifespan: row.average_lifespan ?? undefined,
      maturityAge: row.maturity_age ?? undefined,
      elderAge: row.elder_age ?? undefined,
      agingCurve: agingCurve.map(ac => ({
        chronologicalAge: ac.chronological_age,
        apparentAge: ac.apparent_age,
        label: ac.label ?? undefined
      }))
    };
  }

  /**
   * Calculate apparent age for a character at a given date
   */
  calculateApparentAge(
    birthDate: TimelineDate,
    targetDate: TimelineDate,
    speciesId?: string
  ): {chronologicalAge: number; apparentAge: number; ageLabel?: string} {
    // Calculate chronological age (simplified - assumes same calendar)
    const chronologicalAge = targetDate.year - birthDate.year;

    if (!speciesId) {
      // Human aging (1:1)
      return {chronologicalAge, apparentAge: chronologicalAge};
    }

    const species = this.getSpecies(speciesId);
    if (!species || species.agingCurve.length === 0) {
      return {chronologicalAge, apparentAge: chronologicalAge};
    }

    // Interpolate apparent age from aging curve
    const curve = species.agingCurve.sort((a, b) => a.chronologicalAge - b.chronologicalAge);

    // Find surrounding points
    let lowerPoint = curve[0];
    let upperPoint = curve[curve.length - 1];

    for (let i = 0; i < curve.length - 1; i++) {
      if (curve[i].chronologicalAge <= chronologicalAge && curve[i + 1].chronologicalAge > chronologicalAge) {
        lowerPoint = curve[i];
        upperPoint = curve[i + 1];
        break;
      }
    }

    // Linear interpolation
    const range = upperPoint.chronologicalAge - lowerPoint.chronologicalAge;
    const progress = range > 0 ? (chronologicalAge - lowerPoint.chronologicalAge) / range : 0;
    const apparentAge = lowerPoint.apparentAge + progress * (upperPoint.apparentAge - lowerPoint.apparentAge);

    // Determine age label
    let ageLabel: string | undefined;
    for (const point of curve) {
      if (point.chronologicalAge <= chronologicalAge && point.label) {
        ageLabel = point.label;
      }
    }

    return {
      chronologicalAge,
      apparentAge: Math.round(apparentAge * 10) / 10,
      ageLabel
    };
  }

  // ==========================================================================
  // CALENDAR SYSTEM
  // ==========================================================================

  createCalendar(projectId: string, name: string, data?: Partial<CalendarSystem>): string {
    const id = uuidv4();

    this.run(
      `INSERT INTO calendar_systems
       (id, project_id, name, description, is_default, year_zero, era_name, era_negative_name, real_world_anchor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        name,
        data?.description ?? null,
        data?.isDefault ?? false,
        data?.yearZero ?? 0,
        data?.eraName ?? null,
        data?.eraNegativeName ?? null,
        data?.realWorldAnchor ? JSON.stringify(data.realWorldAnchor) : null
      ]
    );

    // Insert months
    if (data?.months) {
      for (const month of data.months) {
        this.run(
          `INSERT INTO calendar_months (id, calendar_id, name, short_name, days, sort_order, season)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), id, month.name, month.shortName ?? null, month.days, month.order, month.season ?? null]
        );
      }
    }

    // Insert weekdays
    if (data?.weekdays) {
      for (const weekday of data.weekdays) {
        this.run(
          `INSERT INTO calendar_weekdays (id, calendar_id, name, short_name, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), id, weekday.name, weekday.shortName ?? null, weekday.order]
        );
      }
    }

    return id;
  }

  getCalendar(id: string): CalendarSystem | undefined {
    const row = this.get<{
      id: string;
      project_id: string;
      name: string;
      description: string | null;
      is_default: number;
      year_zero: number | null;
      era_name: string | null;
      era_negative_name: string | null;
      real_world_anchor: string | null;
    }>('SELECT * FROM calendar_systems WHERE id = ?', [id]);

    if (!row) return undefined;

    const months = this.all<{
      id: string;
      name: string;
      short_name: string | null;
      days: number;
      sort_order: number;
      season: string | null;
    }>('SELECT * FROM calendar_months WHERE calendar_id = ? ORDER BY sort_order', [id]);

    const weekdays = this.all<{
      id: string;
      name: string;
      short_name: string | null;
      sort_order: number;
    }>('SELECT * FROM calendar_weekdays WHERE calendar_id = ? ORDER BY sort_order', [id]);

    const moons = this.all<{
      id: string;
      name: string;
      cycle_length: number;
      phases: string;
    }>('SELECT * FROM calendar_moons WHERE calendar_id = ?', [id]);

    return {
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      description: row.description ?? undefined,
      isDefault: row.is_default === 1,
      yearZero: row.year_zero ?? undefined,
      eraName: row.era_name ?? undefined,
      eraNegativeName: row.era_negative_name ?? undefined,
      realWorldAnchor: row.real_world_anchor ? JSON.parse(row.real_world_anchor) : undefined,
      months: months.map(m => ({
        id: m.id,
        name: m.name,
        shortName: m.short_name ?? undefined,
        days: m.days,
        order: m.sort_order,
        season: m.season ?? undefined
      })),
      weekdays: weekdays.map(w => ({
        id: w.id,
        name: w.name,
        shortName: w.short_name ?? undefined,
        order: w.sort_order
      })),
      moons: moons.map(m => ({
        id: m.id,
        name: m.name,
        cycleLength: m.cycle_length,
        phases: JSON.parse(m.phases)
      }))
    };
  }

  // ==========================================================================
  // TIMELINE EVENTS
  // ==========================================================================

  createTimelineEvent(projectId: string, name: string, date: TimelineDate, data?: Partial<TimelineEvent>): string {
    const id = uuidv4();

    this.run(
      `INSERT INTO timeline_events
       (id, project_id, name, description, date, end_date, location_id, participant_ids,
        event_type, importance, branch_point_id, timeline_variant, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        name,
        data?.description ?? null,
        JSON.stringify(date),
        data?.endDate ? JSON.stringify(data.endDate) : null,
        data?.locationId ?? null,
        JSON.stringify(data?.participantIds ?? []),
        data?.eventType ?? 'plot',
        data?.importance ?? 'moderate',
        data?.branchPointId ?? null,
        data?.timelineVariant ?? 'main',
        JSON.stringify(data?.tags ?? [])
      ]
    );

    // Update FTS
    this.run(
      `INSERT INTO timeline_events_fts (rowid, name, description, tags)
       SELECT rowid, name, description, tags FROM timeline_events WHERE id = ?`,
      [id]
    );

    return id;
  }

  getTimelineEvents(
    projectId: string,
    options?: {
      startDate?: TimelineDate;
      endDate?: TimelineDate;
      variant?: string;
      characterId?: string;
      locationId?: string;
      limit?: number;
    }
  ): TimelineEvent[] {
    let sql = `SELECT * FROM timeline_events WHERE project_id = ?`;
    const params: unknown[] = [projectId];

    if (options?.variant) {
      sql += ` AND timeline_variant = ?`;
      params.push(options.variant);
    }

    if (options?.locationId) {
      sql += ` AND location_id = ?`;
      params.push(options.locationId);
    }

    if (options?.characterId) {
      sql += ` AND participant_ids LIKE ?`;
      params.push(`%"${options.characterId}"%`);
    }

    sql += ` ORDER BY json_extract(date, '$.year'), json_extract(date, '$.month'), json_extract(date, '$.day')`;

    if (options?.limit) {
      sql += ` LIMIT ?`;
      params.push(options.limit);
    }

    const rows = this.all<{
      id: string;
      project_id: string;
      name: string;
      description: string | null;
      date: string;
      end_date: string | null;
      location_id: string | null;
      participant_ids: string;
      event_type: string;
      importance: string;
      branch_point_id: string | null;
      timeline_variant: string;
      tags: string;
    }>(sql, params);

    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      description: row.description ?? undefined,
      date: JSON.parse(row.date),
      endDate: row.end_date ? JSON.parse(row.end_date) : undefined,
      locationId: row.location_id ?? undefined,
      participantIds: JSON.parse(row.participant_ids),
      causedBy: [], // Loaded separately if needed
      causes: [],
      sceneIds: [],
      plotThreadIds: [],
      eventType: row.event_type as TimelineEvent['eventType'],
      importance: row.importance as TimelineEvent['importance'],
      branchPointId: row.branch_point_id ?? undefined,
      timelineVariant: row.timeline_variant,
      tags: JSON.parse(row.tags)
    }));
  }

  // ==========================================================================
  // SCENE OPERATIONS
  // ==========================================================================

  createScene(containerId: string, title: string, data?: Partial<Scene>): string {
    const id = uuidv4();
    const projectId = this.get<{project_id: string}>(
      'SELECT project_id FROM containers WHERE id = ?',
      [containerId]
    )?.project_id;

    if (!projectId) throw new Error('Container not found');

    // Get next sort order
    const maxOrder = this.get<{max_order: number | null}>(
      'SELECT MAX(sort_order) as max_order FROM scenes WHERE container_id = ?',
      [containerId]
    )?.max_order ?? -1;

    this.run(
      `INSERT INTO scenes
       (id, project_id, container_id, title, sort_order, content, synopsis, scene_type,
        goal, conflict, disaster, reaction, dilemma, decision,
        pov_character_id, location_id, date, character_ids, plot_thread_ids,
        word_count, target_word_count, status, emotion_start, emotion_end,
        include_in_compile, notes, version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        containerId,
        title,
        maxOrder + 1,
        data?.content ?? '',
        data?.synopsis ?? null,
        data?.sceneType ?? 'action',
        data?.goal ?? null,
        data?.conflict ?? null,
        data?.disaster ?? null,
        data?.reaction ?? null,
        data?.dilemma ?? null,
        data?.decision ?? null,
        data?.povCharacterId ?? null,
        data?.locationId ?? null,
        data?.date ? JSON.stringify(data.date) : null,
        JSON.stringify(data?.characterIds ?? []),
        JSON.stringify(data?.plotThreadIds ?? []),
        data?.wordCount ?? 0,
        data?.targetWordCount ?? null,
        data?.status ?? 'outline',
        data?.emotionStart ?? null,
        data?.emotionEnd ?? null,
        data?.includeInCompile ?? true,
        data?.notes ?? null,
        1
      ]
    );

    // Update FTS
    this.run(
      `INSERT INTO scenes_fts (rowid, title, content, synopsis, notes)
       SELECT rowid, title, content, synopsis, notes FROM scenes WHERE id = ?`,
      [id]
    );

    return id;
  }

  getScene(id: string): Scene | undefined {
    const row = this.get<{
      id: string;
      project_id: string;
      container_id: string;
      title: string;
      sort_order: number;
      content: string;
      synopsis: string | null;
      scene_type: string;
      goal: string | null;
      conflict: string | null;
      disaster: string | null;
      reaction: string | null;
      dilemma: string | null;
      decision: string | null;
      pov_character_id: string | null;
      location_id: string | null;
      date: string | null;
      character_ids: string;
      plot_thread_ids: string;
      word_count: number;
      target_word_count: number | null;
      status: string;
      emotion_start: number | null;
      emotion_end: number | null;
      include_in_compile: number;
      notes: string | null;
      last_modified: string;
      version: number;
    }>('SELECT * FROM scenes WHERE id = ?', [id]);

    if (!row) return undefined;

    return {
      id: row.id,
      projectId: row.project_id,
      containerId: row.container_id,
      title: row.title,
      sortOrder: row.sort_order,
      content: row.content,
      synopsis: row.synopsis ?? undefined,
      sceneType: row.scene_type as Scene['sceneType'],
      goal: row.goal ?? undefined,
      conflict: row.conflict ?? undefined,
      disaster: row.disaster ?? undefined,
      reaction: row.reaction ?? undefined,
      dilemma: row.dilemma ?? undefined,
      decision: row.decision ?? undefined,
      povCharacterId: row.pov_character_id ?? undefined,
      locationId: row.location_id ?? undefined,
      date: row.date ? JSON.parse(row.date) : undefined,
      characterIds: JSON.parse(row.character_ids),
      plotThreadIds: JSON.parse(row.plot_thread_ids),
      wordCount: row.word_count,
      targetWordCount: row.target_word_count ?? undefined,
      status: row.status as Scene['status'],
      emotionStart: row.emotion_start ?? undefined,
      emotionEnd: row.emotion_end ?? undefined,
      includeInCompile: row.include_in_compile === 1,
      notes: row.notes ?? undefined,
      lastModified: new Date(row.last_modified),
      version: row.version
    };
  }

  updateSceneContent(id: string, content: string): void {
    const wordCount = this.countWords(content);

    this.run(
      `UPDATE scenes SET content = ?, word_count = ?, last_modified = ?, version = version + 1 WHERE id = ?`,
      [content, wordCount, new Date().toISOString(), id]
    );

    // Update FTS
    this.run(
      `UPDATE scenes_fts SET content = ? WHERE rowid = (SELECT rowid FROM scenes WHERE id = ?)`,
      [content, id]
    );
  }

  searchScenes(projectId: string, query: string, limit = 50): Scene[] {
    const rows = this.all<{id: string}>(
      `SELECT s.id FROM scenes s
       JOIN scenes_fts fts ON s.rowid = fts.rowid
       WHERE s.project_id = ? AND scenes_fts MATCH ?
       ORDER BY rank
       LIMIT ?`,
      [projectId, query, limit]
    );

    return rows.map(row => this.getScene(row.id)).filter((s): s is Scene => s !== undefined);
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  // ==========================================================================
  // CONTAINER OPERATIONS
  // ==========================================================================

  createContainer(
    projectId: string,
    type: Container['type'],
    title: string,
    parentId?: string
  ): string {
    const id = uuidv4();

    // Get next sort order
    const maxOrder = this.get<{max_order: number | null}>(
      'SELECT MAX(sort_order) as max_order FROM containers WHERE project_id = ? AND parent_id IS ?',
      [projectId, parentId ?? null]
    )?.max_order ?? -1;

    this.run(
      `INSERT INTO containers
       (id, project_id, parent_id, type, title, sort_order, status, current_word_count, include_in_compile, page_break_before)
       VALUES (?, ?, ?, ?, ?, ?, 'planning', 0, 1, 1)`,
      [id, projectId, parentId ?? null, type, title, maxOrder + 1]
    );

    return id;
  }

  getContainerTree(projectId: string, parentId?: string): Container[] {
    const rows = this.all<{
      id: string;
      project_id: string;
      parent_id: string | null;
      type: string;
      title: string;
      synopsis: string | null;
      sort_order: number;
      status: string;
      target_word_count: number | null;
      current_word_count: number;
      pov: string | null;
      timeline: string | null;
      include_in_compile: number;
      compile_as: string | null;
      page_break_before: number;
    }>(
      `SELECT * FROM containers WHERE project_id = ? AND parent_id IS ? ORDER BY sort_order`,
      [projectId, parentId ?? null]
    );

    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      parentId: row.parent_id ?? undefined,
      type: row.type as Container['type'],
      title: row.title,
      synopsis: row.synopsis ?? undefined,
      sortOrder: row.sort_order,
      status: row.status as Container['status'],
      targetWordCount: row.target_word_count ?? undefined,
      currentWordCount: row.current_word_count,
      pov: row.pov ?? undefined,
      timeline: row.timeline ?? undefined,
      includeInCompile: row.include_in_compile === 1,
      compileAs: row.compile_as ?? undefined,
      pageBreakBefore: row.page_break_before === 1,
      children: this.getContainerTree(projectId, row.id)
    }));
  }

  // ==========================================================================
  // PLOT THREAD OPERATIONS
  // ==========================================================================

  createPlotThread(projectId: string, name: string, data?: Partial<PlotThread>): string {
    const id = uuidv4();

    this.run(
      `INSERT INTO plot_threads
       (id, project_id, parent_thread_id, name, description, type, status, start_scene_id, end_scene_id,
        character_ids, color, importance, progress_percent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        data?.parentThreadId ?? null,
        name,
        data?.description ?? null,
        data?.type ?? 'subplot',
        data?.status ?? 'planned',
        data?.startSceneId ?? null,
        data?.endSceneId ?? null,
        JSON.stringify(data?.characterIds ?? []),
        data?.color ?? '#3498db',
        data?.importance ?? 5,
        data?.progressPercent ?? 0
      ]
    );

    return id;
  }

  // ==========================================================================
  // PROMISE TRACKING
  // ==========================================================================

  createPromise(projectId: string, description: string, plantedSceneId: string, data?: Partial<Promise>): string {
    const id = uuidv4();

    this.run(
      `INSERT INTO promises
       (id, project_id, plot_thread_id, description, promise_type, status,
        planted_scene_id, fulfilled_scene_id, reinforcement_scene_ids,
        expected_fulfillment, actual_fulfillment, must_fulfill_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        data?.plotThreadId ?? null,
        description,
        data?.promiseType ?? 'setup',
        data?.status ?? 'planted',
        plantedSceneId,
        data?.fulfilledSceneId ?? null,
        JSON.stringify(data?.reinforcementSceneIds ?? []),
        data?.expectedFulfillment ?? null,
        data?.actualFulfillment ?? null,
        data?.mustFulfillBy ?? null,
        data?.notes ?? null
      ]
    );

    return id;
  }

  getUnfulfilledPromises(projectId: string): Promise[] {
    const rows = this.all<{
      id: string;
      project_id: string;
      plot_thread_id: string | null;
      description: string;
      promise_type: string;
      status: string;
      planted_scene_id: string;
      fulfilled_scene_id: string | null;
      reinforcement_scene_ids: string;
      expected_fulfillment: string | null;
      actual_fulfillment: string | null;
      must_fulfill_by: string | null;
      notes: string | null;
    }>(
      `SELECT * FROM promises WHERE project_id = ? AND status NOT IN ('fulfilled', 'subverted', 'abandoned')`,
      [projectId]
    );

    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      plotThreadId: row.plot_thread_id ?? undefined,
      description: row.description,
      promiseType: row.promise_type as Promise['promiseType'],
      status: row.status as Promise['status'],
      plantedSceneId: row.planted_scene_id,
      fulfilledSceneId: row.fulfilled_scene_id ?? undefined,
      reinforcementSceneIds: JSON.parse(row.reinforcement_scene_ids),
      expectedFulfillment: row.expected_fulfillment ?? undefined,
      actualFulfillment: row.actual_fulfillment ?? undefined,
      mustFulfillBy: row.must_fulfill_by ?? undefined,
      notes: row.notes ?? undefined
    }));
  }

  // ==========================================================================
  // WRITING SESSION TRACKING
  // ==========================================================================

  startWritingSession(projectId: string, type: WritingSession['sessionType'] = 'freewrite'): string {
    const id = uuidv4();

    this.run(
      `INSERT INTO writing_sessions (id, project_id, start_time, session_type, scene_ids, words_written, words_deleted, net_words)
       VALUES (?, ?, ?, ?, '[]', 0, 0, 0)`,
      [id, projectId, new Date().toISOString(), type]
    );

    return id;
  }

  endWritingSession(id: string, stats: {wordsWritten: number; wordsDeleted: number; sceneIds: string[]}): void {
    this.run(
      `UPDATE writing_sessions
       SET end_time = ?, words_written = ?, words_deleted = ?, net_words = ?, scene_ids = ?
       WHERE id = ?`,
      [
        new Date().toISOString(),
        stats.wordsWritten,
        stats.wordsDeleted,
        stats.wordsWritten - stats.wordsDeleted,
        JSON.stringify(stats.sceneIds),
        id
      ]
    );
  }

  getWritingStats(projectId: string, startDate: Date, endDate: Date): {
    totalWords: number;
    totalSessions: number;
    averageWordsPerSession: number;
    totalDuration: number; // minutes
  } {
    const row = this.get<{
      total_words: number;
      total_sessions: number;
      total_duration: number;
    }>(
      `SELECT
         COALESCE(SUM(net_words), 0) as total_words,
         COUNT(*) as total_sessions,
         COALESCE(SUM((julianday(end_time) - julianday(start_time)) * 24 * 60), 0) as total_duration
       FROM writing_sessions
       WHERE project_id = ?
         AND start_time >= ?
         AND start_time <= ?
         AND end_time IS NOT NULL`,
      [projectId, startDate.toISOString(), endDate.toISOString()]
    );

    return {
      totalWords: row?.total_words ?? 0,
      totalSessions: row?.total_sessions ?? 0,
      averageWordsPerSession: row?.total_sessions ? Math.round(row.total_words / row.total_sessions) : 0,
      totalDuration: Math.round(row?.total_duration ?? 0)
    };
  }

  // ==========================================================================
  // EMBEDDINGS & SEMANTIC SEARCH
  // ==========================================================================

  storeEmbedding(
    projectId: string,
    entityType: Embedding['entityType'],
    entityId: string,
    chunkText: string,
    chunkIndex: number,
    vector: number[],
    model: string
  ): string {
    const id = uuidv4();

    this.run(
      `INSERT INTO embeddings (id, project_id, entity_type, entity_id, chunk_text, chunk_index, vector, model, dimensions, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, entityType, entityId, chunkText, chunkIndex, JSON.stringify(vector), model, vector.length, new Date().toISOString()]
    );

    return id;
  }

  /**
   * Find similar content using cosine similarity
   * Note: For production, consider using sqlite-vec or a dedicated vector DB
   */
  findSimilar(projectId: string, queryVector: number[], limit = 10): {entityType: string; entityId: string; similarity: number; chunkText: string}[] {
    // Get all embeddings for the project
    const embeddings = this.all<{
      entity_type: string;
      entity_id: string;
      chunk_text: string;
      vector: string;
    }>('SELECT entity_type, entity_id, chunk_text, vector FROM embeddings WHERE project_id = ?', [projectId]);

    // Calculate cosine similarity
    const results = embeddings.map(emb => {
      const vector = JSON.parse(emb.vector) as number[];
      const similarity = this.cosineSimilarity(queryVector, vector);
      return {
        entityType: emb.entity_type,
        entityId: emb.entity_id,
        similarity,
        chunkText: emb.chunk_text
      };
    });

    // Sort by similarity and return top results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  // ==========================================================================
  // SNAPSHOT / VERSION CONTROL
  // ==========================================================================

  createSnapshot(projectId: string, name: string, description?: string, isAutoSave = false): string {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Get current word count
    const wordCount = this.get<{total: number}>(
      `SELECT COALESCE(SUM(word_count), 0) as total FROM scenes WHERE project_id = ?`,
      [projectId]
    )?.total ?? 0;

    // Get all scene IDs
    const sceneIds = this.all<{id: string}>('SELECT id FROM scenes WHERE project_id = ?', [projectId])
      .map(r => r.id);

    // Get all container IDs
    const containerIds = this.all<{id: string}>('SELECT id FROM containers WHERE project_id = ?', [projectId])
      .map(r => r.id);

    this.run(
      `INSERT INTO snapshots (id, project_id, name, description, created_at, is_auto_save, captured_container_ids, captured_scene_ids, total_word_count, labels)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]')`,
      [id, projectId, name, description ?? null, now, isAutoSave ? 1 : 0, JSON.stringify(containerIds), JSON.stringify(sceneIds), wordCount]
    );

    // Store document versions for all scenes
    for (const sceneId of sceneIds) {
      const scene = this.getScene(sceneId);
      if (scene) {
        this.run(
          `INSERT INTO document_versions (id, scene_id, snapshot_id, content, word_count, version_number, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), sceneId, id, scene.content, scene.wordCount, scene.version, now]
        );
      }
    }

    return id;
  }

  restoreSnapshot(snapshotId: string): void {
    const snapshot = this.get<{project_id: string; captured_scene_ids: string}>(
      'SELECT project_id, captured_scene_ids FROM snapshots WHERE id = ?',
      [snapshotId]
    );

    if (!snapshot) throw new Error('Snapshot not found');

    const sceneIds = JSON.parse(snapshot.captured_scene_ids) as string[];

    this.transaction(() => {
      for (const sceneId of sceneIds) {
        const version = this.get<{content: string; word_count: number}>(
          'SELECT content, word_count FROM document_versions WHERE scene_id = ? AND snapshot_id = ?',
          [sceneId, snapshotId]
        );

        if (version) {
          this.run(
            `UPDATE scenes SET content = ?, word_count = ?, version = version + 1 WHERE id = ?`,
            [version.content, version.word_count, sceneId]
          );
        }
      }
    });
  }

  // ==========================================================================
  // CONSISTENCY FACTS
  // ==========================================================================

  addConsistencyFact(
    projectId: string,
    fact: string,
    category: ConsistencyFact['category'],
    data?: Partial<ConsistencyFact>
  ): string {
    const id = uuidv4();

    this.run(
      `INSERT INTO consistency_facts
       (id, project_id, fact, category, source_scene_id, source_chapter, importance, related_entity_ids, verified, established_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        fact,
        category,
        data?.sourceSceneId ?? null,
        data?.sourceChapter ?? null,
        data?.importance ?? 'important',
        JSON.stringify(data?.relatedEntityIds ?? []),
        data?.verified ? 1 : 0,
        new Date().toISOString()
      ]
    );

    return id;
  }

  getFactsForEntity(entityId: string): ConsistencyFact[] {
    const rows = this.all<{
      id: string;
      project_id: string;
      fact: string;
      category: string;
      source_scene_id: string | null;
      source_chapter: string | null;
      importance: string;
      related_entity_ids: string;
      verified: number;
      established_at: string;
      last_verified: string | null;
    }>(`SELECT * FROM consistency_facts WHERE related_entity_ids LIKE ?`, [`%"${entityId}"%`]);

    return rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      fact: row.fact,
      category: row.category as ConsistencyFact['category'],
      sourceSceneId: row.source_scene_id ?? undefined,
      sourceChapter: row.source_chapter ?? undefined,
      importance: row.importance as ConsistencyFact['importance'],
      relatedEntityIds: JSON.parse(row.related_entity_ids),
      verified: row.verified === 1,
      establishedAt: new Date(row.established_at),
      lastVerified: row.last_verified ? new Date(row.last_verified) : undefined
    }));
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let dbInstance: DatabaseManager | null = null;

export function getDatabase(dbPath?: string): DatabaseManager {
  if (!dbInstance) {
    const path = dbPath ?? './epic_fiction_architect.db';
    dbInstance = new DatabaseManager(path);
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
