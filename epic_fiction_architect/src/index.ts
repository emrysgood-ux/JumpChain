/**
 * Epic Fiction Architect - Main Application Entry Point
 *
 * A comprehensive fiction writing application designed for epic-scale narratives
 * spanning millions of words and thousands of years.
 *
 * Core Features:
 * - Character management with non-human aging systems
 * - Custom fantasy calendar support
 * - Timeline & event causality tracking
 * - Scene-Sequel writing structure
 * - Promise/Payoff tracking
 * - AI-powered Story Bible with semantic search
 * - Multi-format compilation (DOCX, EPUB, PDF, etc.)
 * - Writing productivity tracking
 *
 * Technology Stack:
 * - SQLite with FTS5 for local-first storage
 * - Vector embeddings for semantic search
 * - TypeScript for type safety
 * - Designed for Tauri 2.0 desktop app
 */

// ============================================================================
// EXPORTS
// ============================================================================

// Core Types
export * from './core/types';
import {CompileFormat} from './core/types';

// Database
export {DatabaseManager, getDatabase, closeDatabase} from './db/database';

// Compile Engine
export {CompileEngine, compilePresetTemplates} from './engines/compile/index';
export type {CompileOptions, CompileResult} from './engines/compile/index';

// Timeline & Calendar
export {CalendarEngine, calendarTemplates} from './engines/timeline/calendar';
export {AgeCalculator, speciesAgingTemplates} from './engines/timeline/age';
export type {AgeResult, AgeComparison} from './engines/timeline/age';

// Productivity Tracking
export {ProductivityTracker, WritingTimer} from './engines/tracking/productivity';
export type {
  SessionStats,
  DailyStats,
  WeeklyStats,
  ProjectionResult,
  SprintResult
} from './engines/tracking/productivity';

// AI & Embeddings
export {EmbeddingsEngine, defaultConfig as defaultEmbeddingConfig} from './engines/ai/embeddings';
export type {EmbeddingConfig} from './engines/ai/embeddings';
export {StoryBible, SCOREFramework} from './engines/ai/story-bible';
export type {StoryBibleEntry, ContextSnapshot, AIContextPackage} from './engines/ai/story-bible';
export {SummarizationGuard, DEFAULT_CONFIG as DEFAULT_SUMMARIZATION_CONFIG} from './engines/ai/summarization-guard';
export type {SummarizationConfig, ExtractedDetail, SummarizationResult} from './engines/ai/summarization-guard';

// Predictive Narrative Engine (Causal Graphs, Probability Mapping, Cascade Simulation)
export {
  PredictiveNarrativeEngine,
  CausalPlotGraph,
  ProbabilityMapper,
  CascadeSimulator
} from './engines/narrative/index';
export type {
  PlotEvent,
  CausalLink,
  CharacterGoal,
  DramaticConflict,
  DecisionPoint,
  NarrativeBranch,
  NarrativePath,
  WhatIfResult,
  WorldStateVar,
  StateChange,
  SimulationResult,
  SensitivityAnalysis,
  NarrativePrediction,
  NarrativeAnalysisReport
} from './engines/narrative/index';

// Consistency Checker (Contradiction Detection)
export {ConsistencyChecker} from './engines/consistency/index';
export type {
  ConsistencyViolation,
  ViolationType,
  ViolationCategory,
  TrackedFact,
  ConsistencyRule,
  ConsistencyCheckResult
} from './engines/consistency/index';

// Writing Craft Analyzer (Award-Winning Prose Techniques)
export {WritingCraftAnalyzer} from './engines/craft/index';
export type {
  EmotionalArcType,
  EmotionalArcAnalysis,
  RhythmAnalysis,
  ShowTellAnalysis,
  SensoryAnalysis,
  DialogueAnalysis,
  ThematicAnalysis,
  CraftAnalysisReport,
  PrioritizedSuggestion
} from './engines/craft/index';

// Writing Rules Engine (Banned Patterns & Phrases Detection)
export {
  WritingRulesEngine,
  BANNED_CONSTRUCTIONS,
  BANNED_PHRASES,
  SEARCH_PATTERNS,
  EROTICA_RULES
} from './engines/rules/index';
export type {
  BannedConstruction,
  ConstructionCategory,
  BannedPhrase,
  PhraseCategory,
  SearchPattern,
  EroticaRule,
  EroticaCategory,
  RuleViolation,
  RulesAnalysisResult,
  WritingRulesOptions
} from './engines/rules/index';

// Map Visualization Engine (ASCII, SVG, Leaflet/OpenStreetMap)
export {MapVisualizer} from './engines/maps/index';
export type {
  MapPoint,
  MapRegion,
  MapPath,
  MapLayer,
  PointType,
  RegionType,
  PathType,
  TerrainType,
  MapConfig,
  WorldMap,
  ASCIIRenderOptions,
  SVGRenderOptions,
  LeafletExportOptions
} from './engines/maps/index';

// ============================================================================
// APPLICATION CLASS
// ============================================================================

import {DatabaseManager, getDatabase} from './db/database';
import {CompileEngine} from './engines/compile/index';
import {CalendarEngine} from './engines/timeline/calendar';
import {AgeCalculator} from './engines/timeline/age';
import {ProductivityTracker} from './engines/tracking/productivity';
import {EmbeddingsEngine} from './engines/ai/embeddings';
import {StoryBible, SCOREFramework} from './engines/ai/story-bible';
import {PredictiveNarrativeEngine} from './engines/narrative/index';
import {ConsistencyChecker} from './engines/consistency/index';
import {WritingCraftAnalyzer} from './engines/craft/index';
import {WritingRulesEngine} from './engines/rules/index';
import {MapVisualizer} from './engines/maps/index';
import type {EmbeddingConfig} from './engines/ai/embeddings';

export interface EpicFictionArchitectConfig {
  databasePath?: string;
  embeddings?: Partial<EmbeddingConfig>;
}

/**
 * Main application class that provides unified access to all features
 */
export class EpicFictionArchitect {
  private db: DatabaseManager;
  private _compileEngine: CompileEngine;
  private _calendar: CalendarEngine;
  private _ageCalculator: AgeCalculator;
  private _productivity: ProductivityTracker;
  private _embeddings: EmbeddingsEngine;
  private _storyBible: StoryBible;
  private _score: SCOREFramework;
  private _narrative: PredictiveNarrativeEngine;
  private _consistency: ConsistencyChecker;
  private _craft: WritingCraftAnalyzer;
  private _rules: WritingRulesEngine;
  private _maps: MapVisualizer;

  constructor(config: EpicFictionArchitectConfig = {}) {
    // Initialize database
    this.db = getDatabase(config.databasePath ?? './epic_fiction_architect.db');

    // Initialize engines
    this._compileEngine = new CompileEngine(this.db);
    this._calendar = new CalendarEngine(this.db);
    this._ageCalculator = new AgeCalculator(this.db, this._calendar);
    this._productivity = new ProductivityTracker(this.db);
    this._embeddings = new EmbeddingsEngine(this.db, config.embeddings);
    this._storyBible = new StoryBible(this.db, this._embeddings, this._calendar, this._ageCalculator);
    this._score = new SCOREFramework(this._storyBible);
    this._narrative = new PredictiveNarrativeEngine();
    this._consistency = new ConsistencyChecker();
    this._craft = new WritingCraftAnalyzer();
    this._rules = new WritingRulesEngine();
    this._maps = new MapVisualizer();
  }

  // --------------------------------------------------------------------------
  // Engine Accessors
  // --------------------------------------------------------------------------

  /** Database access layer */
  get database(): DatabaseManager {
    return this.db;
  }

  /** Compile/Export engine */
  get compile(): CompileEngine {
    return this._compileEngine;
  }

  /** Calendar system engine */
  get calendar(): CalendarEngine {
    return this._calendar;
  }

  /** Character age calculator */
  get ages(): AgeCalculator {
    return this._ageCalculator;
  }

  /** Writing productivity tracker */
  get productivity(): ProductivityTracker {
    return this._productivity;
  }

  /** AI embeddings engine */
  get embeddings(): EmbeddingsEngine {
    return this._embeddings;
  }

  /** Story Bible retrieval system */
  get storyBible(): StoryBible {
    return this._storyBible;
  }

  /** SCORE Framework for AI context */
  get score(): SCOREFramework {
    return this._score;
  }

  /** Predictive Narrative Engine (causal graphs, branching, cascades) */
  get narrative(): PredictiveNarrativeEngine {
    return this._narrative;
  }

  /** Consistency Checker (contradiction detection) */
  get consistency(): ConsistencyChecker {
    return this._consistency;
  }

  /** Writing Craft Analyzer (award-winning prose techniques) */
  get craft(): WritingCraftAnalyzer {
    return this._craft;
  }

  /** Writing Rules Engine (banned patterns & phrases detection) */
  get rules(): WritingRulesEngine {
    return this._rules;
  }

  /** Map Visualization Engine (ASCII, SVG, Leaflet/OpenStreetMap) */
  get maps(): MapVisualizer {
    return this._maps;
  }

  // --------------------------------------------------------------------------
  // Convenience Methods
  // --------------------------------------------------------------------------

  /**
   * Create a new project
   */
  createProject(name: string, options?: {
    description?: string;
    genre?: string;
    targetWordCount?: number;
  }) {
    const project = this.db.createProject(name);

    if (options) {
      this.db.updateProject(project.id, options);
    }

    return project;
  }

  /**
   * Get all projects
   */
  getProjects() {
    return this.db.getAllProjects();
  }

  /**
   * Quick search across all content types
   */
  async search(_projectId: string, query: string) {
    return this._storyBible.query({
      query,
      limit: 20
    });
  }

  /**
   * Get AI writing context for a scene
   */
  async getWritingContext(projectId: string, sceneId: string, intent?: string) {
    if (intent) {
      return this._score.buildSCOREContext(projectId, sceneId, intent);
    }
    return this._storyBible.buildAIContext(projectId, sceneId);
  }

  /**
   * Start a writing session
   */
  startWriting(projectId: string, type: 'freewrite' | 'sprint' | 'edit' = 'freewrite') {
    return this._productivity.startSession(projectId, type);
  }

  /**
   * End a writing session
   */
  endWriting(sessionId: string) {
    return this._productivity.endSession(sessionId);
  }

  /**
   * Compile manuscript to file
   */
  async compileManuscript(
    projectId: string,
    format: CompileFormat
  ) {
    return this._compileEngine.compile(projectId, {format});
  }

  /**
   * Close the application and clean up resources
   */
  close() {
    this.db.close();
  }
}

// ============================================================================
// CLI USAGE EXAMPLE
// ============================================================================

/**
 * Example usage:
 *
 * ```typescript
 * import { EpicFictionArchitect } from 'epic-fiction-architect';
 *
 * // Initialize application
 * const app = new EpicFictionArchitect({
 *   databasePath: './my-novel.db',
 *   embeddings: {
 *     provider: 'openai',
 *     apiKey: process.env.OPENAI_API_KEY
 *   }
 * });
 *
 * // Create a new project
 * const project = app.createProject('Son of Cosmos', {
 *   description: 'A Tenchi Muyo JumpChain story',
 *   genre: 'Science Fantasy',
 *   targetWordCount: 300000000
 * });
 *
 * // Create a custom calendar
 * const calendarId = app.database.createCalendar(project.id, 'Juraian Calendar', {
 *   yearZero: 0,
 *   eraName: 'JSC',
 *   months: calendarTemplates.juraian.months,
 *   weekdays: calendarTemplates.juraian.weekdays
 * });
 *
 * // Create species with aging curves
 * const juraianId = app.database.createSpecies(
 *   project.id,
 *   'Juraian',
 *   speciesAgingTemplates.juraian.agingCurve,
 *   {
 *     averageLifespan: 5000,
 *     maturityAge: 200,
 *     elderAge: 4000
 *   }
 * );
 *
 * // Create a character
 * const yoshoId = app.database.createCharacter(project.id, 'Yosho', {
 *   fullName: 'Yosho Masaki Jurai',
 *   role: 'mentor',
 *   arcType: 'flat_testing',
 *   speciesId: juraianId,
 *   birthDate: {
 *     calendarId,
 *     year: -700,
 *     month: 3,
 *     day: 15,
 *     precision: 'day',
 *     isApproximate: false
 *   },
 *   psychology: {
 *     lie: 'I must carry my burden alone',
 *     truth: 'Accepting help strengthens us all',
 *     want: 'To protect Earth from discovery',
 *     need: 'To let others share his mission',
 *     ghost: 'His mother\'s death and exile from Jurai'
 *   }
 * });
 *
 * // Calculate age at a specific date
 * const age = app.ages.calculateAge(yoshoId, {
 *   calendarId,
 *   year: 1989,
 *   month: 4,
 *   day: 3,
 *   precision: 'day',
 *   isApproximate: false
 * });
 * console.log(`Yosho: ${age.chronologicalAge} years old, appears ${age.apparentAge}`);
 * // Output: Yosho: 689 years old, appears 35
 *
 * // Start a writing session
 * const sessionId = app.startWriting(project.id, 'sprint');
 *
 * // ... write for a while ...
 *
 * // End session and get stats
 * const stats = app.endWriting(sessionId);
 * console.log(`Wrote ${stats.netWords} words in ${stats.duration} minutes`);
 *
 * // Get AI writing context
 * const context = await app.getWritingContext(
 *   project.id,
 *   sceneId,
 *   'Write the scene where Sheldon first meets young Tenchi'
 * );
 *
 * // Compile to EPUB
 * const result = await app.compileManuscript(project.id, 'epub');
 * console.log(`Compiled ${result.wordCount} words to ${result.filename}`);
 *
 * // Clean up
 * app.close();
 * ```
 */

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default EpicFictionArchitect;
