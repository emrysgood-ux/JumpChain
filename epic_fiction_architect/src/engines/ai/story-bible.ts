/**
 * Epic Fiction Architect - Story Bible Retrieval System
 *
 * The Story Bible is the authoritative reference for all established facts,
 * character details, timeline events, and world rules. This system provides:
 *
 * - Unified search across all story elements
 * - Context-aware retrieval (considers current scene/chapter)
 * - Fact verification and contradiction detection
 * - Character state tracking over time
 * - AI prompt context building
 */

import {DatabaseManager} from '../../db/database';
import {EmbeddingsEngine} from './embeddings';
import {CalendarEngine} from '../timeline/calendar';
import {AgeCalculator} from '../timeline/age';
import {
  SummarizationGuard,
  SummarizationConfig,
  DEFAULT_CONFIG as DEFAULT_SUMMARIZATION_CONFIG,
  shouldSummarize,
  calculateSafeSummaryLength
} from './summarization-guard';
import type {
  StoryBibleQuery,
  StoryBibleResult,
  SearchResult,
  ConsistencyFact,
  TimelineDate,
  TimelineEvent,
  CharacterState,
  Character,
  Scene,
  Location,
  PlotThread,
  Promise as StoryPromise
} from '../../core/types';

// ============================================================================
// TYPES
// ============================================================================

export interface StoryBibleEntry {
  id: string;
  type: 'character' | 'location' | 'event' | 'scene' | 'fact' | 'thread' | 'promise';
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  relevanceScore: number;
  source?: string;
}

export interface ContextSnapshot {
  characters: {
    id: string;
    name: string;
    age?: {chronological: number; apparent: number};
    location?: string;
    status: string;
  }[];
  activeThreads: {
    id: string;
    name: string;
    status: string;
    progress: number;
  }[];
  pendingPromises: {
    id: string;
    description: string;
    plantedIn: string;
  }[];
  recentEvents: {
    id: string;
    name: string;
    date: string;
  }[];
}

export interface AIContextPackage {
  characterBios: string;
  currentSituation: string;
  relevantFacts: string;
  activeConflicts: string;
  worldRules: string;
  tokenEstimate: number;
}

// ============================================================================
// STORY BIBLE
// ============================================================================

export class StoryBible {
  private db: DatabaseManager;
  private embeddings: EmbeddingsEngine;
  private calendar: CalendarEngine;
  private ageCalc: AgeCalculator;
  private summarizationGuard: SummarizationGuard;

  constructor(
    db: DatabaseManager,
    embeddings: EmbeddingsEngine,
    calendar: CalendarEngine,
    ageCalc: AgeCalculator,
    summarizationConfig?: Partial<SummarizationConfig>
  ) {
    this.db = db;
    this.embeddings = embeddings;
    this.calendar = calendar;
    this.ageCalc = ageCalc;
    this.summarizationGuard = new SummarizationGuard(summarizationConfig);
  }

  /**
   * Get the summarization guard for external access
   */
  getSummarizationGuard(): SummarizationGuard {
    return this.summarizationGuard;
  }

  // ==========================================================================
  // MAIN QUERY INTERFACE
  // ==========================================================================

  /**
   * Query the Story Bible with natural language
   */
  async query(query: StoryBibleQuery): Promise<StoryBibleResult> {
    const results: SearchResult[] = [];
    const projectId = this.getProjectId(query);

    if (!projectId) {
      return {query: query.query, results: [], relatedFacts: []};
    }

    // 1. Semantic search
    const semanticResults = await this.embeddings.semanticSearch(
      projectId,
      query.query,
      {
        entityTypes: query.filters?.entityTypes as any,
        limit: query.limit ?? 10
      }
    );
    results.push(...semanticResults);

    // 2. Full-text search (FTS5)
    const ftsResults = this.fullTextSearch(projectId, query.query, query.limit ?? 10);
    for (const fts of ftsResults) {
      if (!results.find(r => r.entityId === fts.entityId)) {
        results.push(fts);
      }
    }

    // 3. Get related facts
    const relatedFacts: ConsistencyFact[] = [];
    for (const result of results.slice(0, 5)) {
      const facts = this.db.getFactsForEntity(result.entityId);
      relatedFacts.push(...facts);
    }

    // Deduplicate
    const uniqueFacts = Array.from(
      new Map(relatedFacts.map(f => [f.id, f])).values()
    );

    // 4. Add timeline context if date provided
    let timelineContext: TimelineEvent[] | undefined;
    if (query.context?.date) {
      timelineContext = this.getEventsNearDate(projectId, query.context.date, 5);
    }

    // 5. Get character states if characters in context
    let characterStates: CharacterState[] | undefined;
    if (query.context?.characterIds && query.context?.date) {
      characterStates = this.getCharacterStates(query.context.characterIds, query.context.date);
    }

    // Sort by relevance
    results.sort((a, b) => b.score - a.score);

    return {
      query: query.query,
      results: results.slice(0, query.limit ?? 10),
      relatedFacts: uniqueFacts,
      timelineContext,
      characterStates
    };
  }

  /**
   * Get a context snapshot at a specific point in the story
   */
  getContextSnapshot(projectId: string, atDate: TimelineDate, sceneId?: string): ContextSnapshot {
    // Get all characters and their states at this date
    const characterElements = this.db.getStoryElementsByType(projectId, 'character' as any);
    const characters = characterElements.map(elem => {
      const char = this.db.getCharacter(elem.id);
      if (!char) return null;

      const ageResult = char.birthDate ? this.ageCalc.calculateAge(elem.id, atDate) : undefined;

      // Get current state
      const states = char.states?.filter(s => {
        const stateStart = this.calendar.dateToDayNumber(s.effectiveFrom);
        const targetDay = this.calendar.dateToDayNumber(atDate);
        const stateEnd = s.effectiveTo ? this.calendar.dateToDayNumber(s.effectiveTo) : Infinity;
        return stateStart <= targetDay && targetDay <= stateEnd;
      }) ?? [];

      const currentState = states[states.length - 1];

      return {
        id: elem.id,
        name: char.name,
        age: ageResult ? {
          chronological: ageResult.chronologicalAge,
          apparent: ageResult.apparentAge
        } : undefined,
        location: currentState?.locationId,
        status: currentState?.status ?? 'alive'
      };
    }).filter((c): c is NonNullable<typeof c> => c !== null);

    // Get active plot threads
    const threads = this.db.all<{
      id: string;
      name: string;
      status: string;
      progress_percent: number;
    }>(
      `SELECT id, name, status, progress_percent FROM plot_threads
       WHERE project_id = ? AND status IN ('planned', 'active', 'paused')`,
      [projectId]
    );

    const activeThreads = threads.map(t => ({
      id: t.id,
      name: t.name,
      status: t.status,
      progress: t.progress_percent
    }));

    // Get pending promises
    const promises = this.db.getUnfulfilledPromises(projectId);
    const pendingPromises = promises.map(p => {
      const scene = this.db.getScene(p.plantedSceneId);
      return {
        id: p.id,
        description: p.description,
        plantedIn: scene?.title ?? 'Unknown'
      };
    });

    // Get recent events
    const dayNumber = this.calendar.dateToDayNumber(atDate);
    const events = this.db.getTimelineEvents(projectId, {limit: 5});
    const recentEvents = events
      .filter(e => this.calendar.dateToDayNumber(e.date) <= dayNumber)
      .slice(-5)
      .map(e => ({
        id: e.id,
        name: e.name,
        date: this.calendar.formatDate(e.date)
      }));

    return {
      characters,
      activeThreads,
      pendingPromises,
      recentEvents
    };
  }

  // ==========================================================================
  // AI CONTEXT BUILDING
  // ==========================================================================

  /**
   * Build a comprehensive context package for AI writing assistance
   * Now with over-summarization protection
   */
  async buildAIContext(
    projectId: string,
    sceneId: string,
    query?: string,
    maxTokens: number = 8000
  ): Promise<AIContextPackage & {summarizationWarnings?: string[]}> {
    const scene = this.db.getScene(sceneId);
    if (!scene) {
      return this.emptyContextPackage();
    }

    // Gather context for summarization guard
    const promises = this.db.getUnfulfilledPromises(projectId);
    const characterIds = scene.characterIds;
    const characters = characterIds.map(id => this.db.getCharacter(id)).filter((c): c is Character => c !== null);
    const threads = this.getRelevantPlotThreads(projectId, characterIds);
    const facts = this.db.all<{
      id: string;
      project_id: string;
      fact: string;
      category: string;
      importance: string;
      source_scene_id: string | null;
      source_chapter: string | null;
      related_entity_ids: string;
      verified: number;
    }>('SELECT * FROM consistency_facts WHERE project_id = ?', [projectId]);

    const consistencyFacts: ConsistencyFact[] = facts.map(f => ({
      id: f.id,
      projectId: f.project_id,
      fact: f.fact,
      category: f.category as ConsistencyFact['category'],
      importance: f.importance as ConsistencyFact['importance'],
      sourceSceneId: f.source_scene_id ?? undefined,
      sourceChapter: f.source_chapter ?? undefined,
      relatedEntityIds: JSON.parse(f.related_entity_ids),
      verified: f.verified === 1,
      establishedAt: new Date()
    }));

    const parts: {section: string; content: string; priority: number}[] = [];
    const tokensPerChar = 0.25;
    const summarizationWarnings: string[] = [];

    // 1. POV Character Bio (highest priority)
    if (scene.povCharacterId) {
      const povChar = this.db.getCharacter(scene.povCharacterId);
      if (povChar) {
        const bio = this.buildCharacterBio(povChar, scene.date);
        parts.push({section: 'characterBios', content: `## POV Character: ${povChar.name}\n${bio}`, priority: 100});
      }
    }

    // 2. Other characters in scene
    for (const charId of scene.characterIds.filter(id => id !== scene.povCharacterId)) {
      const char = this.db.getCharacter(charId);
      if (char) {
        const bio = this.buildCharacterBio(char, scene.date);
        parts.push({section: 'characterBios', content: `## ${char.name}\n${bio}`, priority: 80});
      }
    }

    // 3. Location details
    if (scene.locationId) {
      const location = this.db.getStoryElement(scene.locationId);
      if (location) {
        const locDesc = this.buildLocationDescription(location.id);
        parts.push({section: 'currentSituation', content: `## Location: ${location.name}\n${locDesc}`, priority: 90});
      }
    }

    // 4. Scene-Sequel structure context
    if (scene.goal || scene.conflict) {
      const structureContext = this.buildSceneStructureContext(scene);
      parts.push({section: 'currentSituation', content: structureContext, priority: 85});
    }

    // 5. Active plot threads involving scene characters
    const relevantThreads = this.getRelevantPlotThreads(projectId, scene.characterIds);
    if (relevantThreads.length > 0) {
      const threadsContent = relevantThreads.map(t =>
        `- **${t.name}** (${t.status}, ${t.progress}% complete): ${t.description ?? ''}`
      ).join('\n');
      parts.push({section: 'activeConflicts', content: `## Active Plot Threads\n${threadsContent}`, priority: 70});
    }

    // 6. Pending promises that might need fulfillment
    const promises = this.db.getUnfulfilledPromises(projectId);
    const relevantPromises = promises.filter(p =>
      p.mustFulfillBy === sceneId || // Due in this scene
      Math.random() < 0.3 // Random reminder of 30% of promises
    );
    if (relevantPromises.length > 0) {
      const promiseContent = relevantPromises.map(p =>
        `- ${p.description} (planted in ${this.db.getScene(p.plantedSceneId)?.title ?? 'unknown'})`
      ).join('\n');
      parts.push({section: 'relevantFacts', content: `## Narrative Promises to Consider\n${promiseContent}`, priority: 60});
    }

    // 7. Query-specific context (if query provided)
    if (query) {
      const queryResults = await this.query({query, limit: 5});
      if (queryResults.results.length > 0) {
        const queryContent = queryResults.results.map(r =>
          `### ${r.title}\n${r.snippet}`
        ).join('\n\n');
        parts.push({section: 'relevantFacts', content: `## Relevant to "${query}"\n${queryContent}`, priority: 75});
      }
    }

    // 8. Established world rules
    const worldRules = this.db.all<{fact: string}>(
      `SELECT fact FROM consistency_facts WHERE project_id = ? AND category = 'rule' AND importance = 'critical'`,
      [projectId]
    );
    if (worldRules.length > 0) {
      const rulesContent = worldRules.map(r => `- ${r.fact}`).join('\n');
      parts.push({section: 'worldRules', content: `## World Rules (Do Not Violate)\n${rulesContent}`, priority: 95});
    }

    // Sort by priority and build context within token limit
    parts.sort((a, b) => b.priority - a.priority);

    const result: AIContextPackage & {summarizationWarnings?: string[]} = {
      characterBios: '',
      currentSituation: '',
      relevantFacts: '',
      activeConflicts: '',
      worldRules: '',
      tokenEstimate: 0
    };

    let totalTokens = 0;
    const skippedParts: string[] = [];

    for (const part of parts) {
      const partTokens = Math.ceil(part.content.length * tokensPerChar);
      if (totalTokens + partTokens > maxTokens) {
        skippedParts.push(part.content);
        continue;
      }

      const section = part.section as keyof AIContextPackage;
      if (section !== 'tokenEstimate') {
        result[section] += (result[section] ? '\n\n' : '') + part.content;
        totalTokens += partTokens;
      }
    }

    result.tokenEstimate = totalTokens;

    // Validate summarization to prevent over-compression
    if (skippedParts.length > 0) {
      const originalContent = skippedParts.join('\n\n');
      const summarizationCheck = shouldSummarize(originalContent);

      if (summarizationCheck.shouldSummarize) {
        // Validate that we're not losing critical details
        const validationResult = this.summarizationGuard.validateSummarization(
          originalContent,
          '', // Empty summary since content was skipped
          {
            promises,
            characters,
            plotThreads: threads,
            facts: consistencyFacts
          }
        );

        if (!validationResult.isAcceptable) {
          summarizationWarnings.push(
            `⚠️ Over-summarization detected: ${validationResult.errors.join('; ')}`
          );
        }

        if (validationResult.warnings.length > 0) {
          summarizationWarnings.push(...validationResult.warnings);
        }

        if (validationResult.lostDetails.length > 0) {
          const criticalLost = validationResult.lostDetails.filter(d => d.importance === 'critical');
          if (criticalLost.length > 0) {
            summarizationWarnings.push(
              `CRITICAL: ${criticalLost.length} critical details lost due to token limit`
            );
          }
        }
      }
    }

    if (summarizationWarnings.length > 0) {
      result.summarizationWarnings = summarizationWarnings;
    }

    return result;
  }

  /**
   * Build character bio with current state
   */
  private buildCharacterBio(character: Character, atDate?: TimelineDate): string {
    const parts: string[] = [];

    // Basic info
    parts.push(`**Role:** ${character.role}`);
    if (character.arcType) parts.push(`**Arc:** ${character.arcType}`);

    // Age at date
    if (atDate && character.birthDate) {
      const age = this.ageCalc.calculateAge(character.id, atDate);
      if (age) {
        parts.push(`**Age:** ${age.chronologicalAge} (appears ${age.apparentAge}) - ${age.ageCategory}`);
      }
    }

    // Physical description
    if (character.physicalDescription) {
      const phys = character.physicalDescription;
      const physParts = [phys.height, phys.build, phys.hairColor ? `${phys.hairColor} hair` : '', phys.eyeColor ? `${phys.eyeColor} eyes` : ''].filter(Boolean);
      if (physParts.length > 0) {
        parts.push(`**Physical:** ${physParts.join(', ')}`);
      }
    }

    // Psychology / Arc
    if (character.psychology) {
      const psych = character.psychology;
      if (psych.lie) parts.push(`**Believes (Lie):** ${psych.lie}`);
      if (psych.truth) parts.push(`**Must Learn (Truth):** ${psych.truth}`);
      if (psych.want) parts.push(`**Wants:** ${psych.want}`);
      if (psych.need) parts.push(`**Needs:** ${psych.need}`);
      if (psych.ghost) parts.push(`**Past Wound:** ${psych.ghost}`);
    }

    // Voice
    if (character.voiceFingerprint) {
      const voice = character.voiceFingerprint;
      parts.push(`**Voice:** ${voice.vocabularyComplexity} vocabulary, ${voice.sentenceVariation} sentence variation`);
      if (voice.catchphrases.length > 0) {
        parts.push(`**Catchphrases:** "${voice.catchphrases.join('", "')}"`);
      }
    }

    return parts.join('\n');
  }

  /**
   * Build location description
   */
  private buildLocationDescription(locationId: string): string {
    const location = this.db.getStoryElement(locationId);
    if (!location) return '';

    const parts: string[] = [];
    if (location.description) parts.push(location.description);

    // Get sensory details from metadata
    const meta = location.metadata as any;
    if (meta?.sights?.length) parts.push(`**Sights:** ${meta.sights.join(', ')}`);
    if (meta?.sounds?.length) parts.push(`**Sounds:** ${meta.sounds.join(', ')}`);
    if (meta?.smells?.length) parts.push(`**Smells:** ${meta.smells.join(', ')}`);

    return parts.join('\n');
  }

  /**
   * Build scene structure context (Scene-Sequel)
   */
  private buildSceneStructureContext(scene: Scene): string {
    const parts: string[] = ['## Scene Structure'];

    if (scene.sceneType === 'action') {
      if (scene.goal) parts.push(`**Goal:** ${scene.goal}`);
      if (scene.conflict) parts.push(`**Conflict:** ${scene.conflict}`);
      if (scene.disaster) parts.push(`**Disaster/Outcome:** ${scene.disaster}`);
    } else if (scene.sceneType === 'reaction') {
      if (scene.reaction) parts.push(`**Reaction:** ${scene.reaction}`);
      if (scene.dilemma) parts.push(`**Dilemma:** ${scene.dilemma}`);
      if (scene.decision) parts.push(`**Decision:** ${scene.decision}`);
    }

    return parts.join('\n');
  }

  private emptyContextPackage(): AIContextPackage {
    return {
      characterBios: '',
      currentSituation: '',
      relevantFacts: '',
      activeConflicts: '',
      worldRules: '',
      tokenEstimate: 0
    };
  }

  // ==========================================================================
  // SEARCH METHODS
  // ==========================================================================

  /**
   * Full-text search using SQLite FTS5
   */
  private fullTextSearch(projectId: string, query: string, limit: number): SearchResult[] {
    const results: SearchResult[] = [];

    // Search scenes
    const scenes = this.db.searchScenes(projectId, query, limit);
    for (const scene of scenes) {
      results.push({
        entityType: 'scene',
        entityId: scene.id,
        title: scene.title,
        snippet: scene.content.substring(0, 200),
        score: 0.8, // FTS gets slightly lower score than semantic
        highlights: [{field: 'content', matches: [query]}]
      });
    }

    // Search story elements
    const elements = this.db.searchStoryElements(projectId, query, limit);
    for (const elem of elements) {
      results.push({
        entityType: elem.type,
        entityId: elem.id,
        title: elem.name,
        snippet: elem.description?.substring(0, 200) ?? '',
        score: 0.8,
        highlights: [{field: 'description', matches: [query]}]
      });
    }

    return results;
  }

  /**
   * Get events near a date
   */
  private getEventsNearDate(projectId: string, date: TimelineDate, count: number): TimelineEvent[] {
    const events = this.db.getTimelineEvents(projectId, {limit: count * 3});
    const targetDay = this.calendar.dateToDayNumber(date);

    // Sort by distance from target date
    events.sort((a, b) => {
      const aDist = Math.abs(this.calendar.dateToDayNumber(a.date) - targetDay);
      const bDist = Math.abs(this.calendar.dateToDayNumber(b.date) - targetDay);
      return aDist - bDist;
    });

    return events.slice(0, count);
  }

  /**
   * Get character states at a date
   */
  private getCharacterStates(characterIds: string[], date: TimelineDate): CharacterState[] {
    const states: CharacterState[] = [];
    const targetDay = this.calendar.dateToDayNumber(date);

    for (const charId of characterIds) {
      const char = this.db.getCharacter(charId);
      if (!char?.states) continue;

      // Find state active at this date
      const activeState = char.states.find(s => {
        const startDay = this.calendar.dateToDayNumber(s.effectiveFrom);
        const endDay = s.effectiveTo ? this.calendar.dateToDayNumber(s.effectiveTo) : Infinity;
        return startDay <= targetDay && targetDay <= endDay;
      });

      if (activeState) {
        states.push(activeState);
      }
    }

    return states;
  }

  /**
   * Get plot threads relevant to characters
   */
  private getRelevantPlotThreads(projectId: string, characterIds: string[]): PlotThread[] {
    const threads = this.db.all<{
      id: string;
      name: string;
      description: string | null;
      status: string;
      progress_percent: number;
      character_ids: string;
    }>(
      `SELECT * FROM plot_threads WHERE project_id = ? AND status IN ('planned', 'active')`,
      [projectId]
    );

    return threads
      .filter(t => {
        const threadChars = JSON.parse(t.character_ids) as string[];
        return characterIds.some(id => threadChars.includes(id));
      })
      .map(t => ({
        id: t.id,
        projectId,
        name: t.name,
        description: t.description ?? undefined,
        type: 'subplot' as const,
        status: t.status as any,
        characterIds: JSON.parse(t.character_ids),
        color: '#3498db',
        importance: 5,
        progressPercent: t.progress_percent
      }));
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  private getProjectId(query: StoryBibleQuery): string {
    if (query.context?.currentSceneId) {
      const scene = this.db.getScene(query.context.currentSceneId);
      if (scene) return scene.projectId;
    }
    if (query.context?.currentChapterId) {
      const container = this.db.get<{project_id: string}>(
        'SELECT project_id FROM containers WHERE id = ?',
        [query.context.currentChapterId]
      );
      if (container) return container.project_id;
    }
    // Default - would come from app state in real implementation
    return '';
  }
}

// ============================================================================
// SCORE FRAMEWORK IMPLEMENTATION
// ============================================================================

/**
 * SCORE Framework for AI-assisted writing
 * (Story Context for Optimized Response Enhancement)
 *
 * Research shows 23.6% higher narrative coherence with proper context.
 */
export class SCOREFramework {
  private storyBible: StoryBible;

  constructor(storyBible: StoryBible) {
    this.storyBible = storyBible;
  }

  /**
   * Build a SCORE-formatted prompt context
   */
  async buildSCOREContext(
    projectId: string,
    sceneId: string,
    writerIntent: string
  ): Promise<string> {
    const context = await this.storyBible.buildAIContext(projectId, sceneId, writerIntent);

    const scorePrompt = `
# STORY BIBLE CONTEXT (SCORE Framework)

## S - Setting & Situation
${context.currentSituation || 'No specific setting context available.'}

## C - Characters
${context.characterBios || 'No character information available.'}

## O - Ongoing Conflicts
${context.activeConflicts || 'No active conflicts tracked.'}

## R - Rules & Restrictions
${context.worldRules || 'No specific world rules defined.'}

## E - Established Facts
${context.relevantFacts || 'No relevant facts retrieved.'}

---
**Writer's Intent:** ${writerIntent}
**Token Budget Used:** ~${context.tokenEstimate}

Please write with consistency to the above context.
`;

    return scorePrompt;
  }
}
