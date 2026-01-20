/**
 * Continuity Validator Engine
 *
 * Validates continuity across 12,000+ chapters, detecting timeline errors,
 * character inconsistencies, world logic violations, and plot holes.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ChapterManager,
  Chapter,
  CharacterState,
  TimelinePosition,
  ValidationError,
  ErrorCategory,
  ErrorSeverity,
  PlotThread
} from './chapter-manager';

// ============================================================================
// ENUMS
// ============================================================================

export enum ValidationRuleType {
  TIMELINE = 'timeline',
  CHARACTER_AGE = 'character_age',
  CHARACTER_LOCATION = 'character_location',
  CHARACTER_STATUS = 'character_status',
  CHARACTER_KNOWLEDGE = 'character_knowledge',
  RELATIONSHIP = 'relationship',
  ITEM_POSSESSION = 'item_possession',
  ABILITY_USE = 'ability_use',
  MAGIC_RULES = 'magic_rules',
  WORLD_LOGIC = 'world_logic',
  GEOGRAPHY = 'geography',
  TRAVEL_TIME = 'travel_time',
  PLOT_THREAD = 'plot_thread',
  FORESHADOWING = 'foreshadowing',
  NAMING = 'naming',
  DEATH = 'death',
  ECONOMIC = 'economic',
  CULTURAL = 'cultural',
  CUSTOM = 'custom'
}

export enum ValidationScope {
  CHAPTER = 'chapter',        // Single chapter
  ARC = 'arc',                // Story arc
  VOLUME = 'volume',          // Volume
  RANGE = 'range',            // Chapter range
  FULL = 'full'               // Entire story
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface ValidationRule {
  id: string;
  name: string;
  type: ValidationRuleType;
  description: string;
  severity: ErrorSeverity;
  enabled: boolean;
  category: ErrorCategory;
  validator: (context: ValidationContext) => ValidationResult[];
  autoFix?: (error: ValidationError, context: ValidationContext) => boolean;
}

export interface ValidationContext {
  currentChapter: Chapter;
  previousChapter?: Chapter;
  allChapters: Chapter[];
  chapterManager: ChapterManager;
  characterRegistry: Map<string, CharacterData>;
  locationRegistry: Map<string, LocationData>;
  itemRegistry: Map<string, ItemData>;
  timelineRegistry: TimelineData[];
  worldRules: WorldRule[];
  magicRules: MagicRule[];
}

export interface ValidationResult {
  passed: boolean;
  error?: Omit<ValidationError, 'id' | 'chapterId' | 'chapterNumber' | 'createdAt' | 'fixed'>;
}

export interface CharacterData {
  id: string;
  name: string;
  aliases: string[];
  birthChapter?: number;
  deathChapter?: number;
  birthYear?: number;
  species?: string;
  gender?: string;
  homeland?: string;
  abilities: string[];
  knownLanguages: string[];
  physicalDescription: Record<string, string>;
  personalityTraits: string[];
  relationships: Map<string, string>;  // CharacterID -> Relationship type
  locationHistory: { chapter: number; location: string }[];
  statusHistory: { chapter: number; status: string }[];
  inventoryHistory: { chapter: number; items: string[] }[];
}

export interface LocationData {
  id: string;
  name: string;
  aliases: string[];
  type: string;
  parentLocation?: string;
  coordinates?: { x: number; y: number };
  travelTimes: Map<string, number>;  // LocationID -> days
  climate?: string;
  population?: number;
  destroyed?: { chapter: number; cause: string };
}

export interface ItemData {
  id: string;
  name: string;
  type: string;
  unique: boolean;
  magical: boolean;
  createdChapter?: number;
  destroyedChapter?: number;
  ownerHistory: { chapter: number; owner: string }[];
  locationHistory: { chapter: number; location: string }[];
}

export interface TimelineData {
  chapter: number;
  position: TimelinePosition;
  events: string[];
}

export interface WorldRule {
  id: string;
  name: string;
  description: string;
  category: string;
  validator: (context: ValidationContext) => boolean;
  errorMessage: string;
}

export interface MagicRule {
  id: string;
  name: string;
  systemId: string;
  description: string;
  cost?: string;
  limitations: string[];
  validator: (context: ValidationContext, abilityUsed: string) => boolean;
  errorMessage: string;
}

export interface ValidationReport {
  id: string;
  timestamp: Date;
  scope: ValidationScope;
  chaptersValidated: number[];
  duration: number;         // Milliseconds
  errorsFound: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  passRate: number;         // Percentage
  criticalIssues: ValidationError[];
  summary: string;
}

// ============================================================================
// BUILT-IN VALIDATION RULES
// ============================================================================

const createTimelineRule = (): ValidationRule => ({
  id: 'timeline-consistency',
  name: 'Timeline Consistency',
  type: ValidationRuleType.TIMELINE,
  description: 'Ensures timeline progresses logically between chapters',
  severity: ErrorSeverity.ERROR,
  enabled: true,
  category: ErrorCategory.TIMELINE,
  validator: (ctx: ValidationContext): ValidationResult[] => {
    const results: ValidationResult[] = [];

    if (!ctx.previousChapter) return [{ passed: true }];

    const prev = ctx.previousChapter.timelineEnd;
    const curr = ctx.currentChapter.timelineStart;

    // Check for backwards time travel (unless flashback)
    if (ctx.currentChapter.type !== 'flashback' && ctx.currentChapter.type !== 'flash_forward') {
      if (curr.year < prev.year ||
          (curr.year === prev.year && curr.month && prev.month && curr.month < prev.month) ||
          (curr.year === prev.year && curr.month === prev.month && curr.day && prev.day && curr.day < prev.day)) {
        results.push({
          passed: false,
          error: {
            category: ErrorCategory.TIMELINE,
            severity: ErrorSeverity.ERROR,
            title: 'Timeline Regression',
            description: `Chapter ${ctx.currentChapter.number} occurs before Chapter ${ctx.previousChapter.number} in the timeline without being marked as a flashback.`,
            suggestion: 'Mark the chapter as a flashback or correct the timeline.',
            autoFixable: false
          }
        });
      }
    }

    if (results.length === 0) {
      results.push({ passed: true });
    }

    return results;
  }
});

const createCharacterDeathRule = (): ValidationRule => ({
  id: 'character-death',
  name: 'Dead Character Appearance',
  type: ValidationRuleType.DEATH,
  description: 'Ensures dead characters do not appear after their death',
  severity: ErrorSeverity.CRITICAL,
  enabled: true,
  category: ErrorCategory.CHARACTER,
  validator: (ctx: ValidationContext): ValidationResult[] => {
    const results: ValidationResult[] = [];

    for (const mention of ctx.currentChapter.entityMentions) {
      if (mention.entityType !== 'character') continue;

      const character = ctx.characterRegistry.get(mention.entityId);
      if (!character || !character.deathChapter) continue;

      // Check if character died before this chapter and isn't in a flashback
      if (character.deathChapter < ctx.currentChapter.number &&
          ctx.currentChapter.type !== 'flashback') {
        results.push({
          passed: false,
          error: {
            category: ErrorCategory.CHARACTER,
            severity: ErrorSeverity.CRITICAL,
            title: 'Dead Character Appearance',
            description: `${character.name} appears in Chapter ${ctx.currentChapter.number} but died in Chapter ${character.deathChapter}.`,
            relatedEntities: [character.id],
            suggestion: 'Remove the character, use a flashback, or revise death.',
            autoFixable: false
          }
        });
      }
    }

    if (results.length === 0) {
      results.push({ passed: true });
    }

    return results;
  }
});

const createCharacterLocationRule = (): ValidationRule => ({
  id: 'character-location',
  name: 'Character Location Consistency',
  type: ValidationRuleType.CHARACTER_LOCATION,
  description: 'Ensures characters are in consistent locations',
  severity: ErrorSeverity.ERROR,
  enabled: true,
  category: ErrorCategory.CONTINUITY,
  validator: (ctx: ValidationContext): ValidationResult[] => {
    const results: ValidationResult[] = [];

    if (!ctx.previousChapter) return [{ passed: true }];

    for (const currentState of ctx.currentChapter.characterStates) {
      if (!currentState.location) continue;

      // Find previous state
      const prevState = ctx.previousChapter.characterStates.find(
        s => s.characterId === currentState.characterId
      );

      if (!prevState || !prevState.location) continue;

      // Check if location changed without travel
      if (prevState.location !== currentState.location) {
        const character = ctx.characterRegistry.get(currentState.characterId);
        const prevLocation = ctx.locationRegistry.get(prevState.location);
        const currLocation = ctx.locationRegistry.get(currentState.location);

        if (prevLocation && currLocation && prevLocation.travelTimes.has(currLocation.id)) {
          const travelTime = prevLocation.travelTimes.get(currLocation.id)!;
          const chapterGap = ctx.currentChapter.number - ctx.previousChapter.number;

          // Very rough check - assume 1 chapter = roughly 1 day
          if (chapterGap < travelTime / 10) {
            results.push({
              passed: false,
              error: {
                category: ErrorCategory.CONTINUITY,
                severity: ErrorSeverity.ERROR,
                title: 'Impossible Travel',
                description: `${currentState.name} traveled from ${prevState.location} to ${currentState.location} in ${chapterGap} chapters, but travel takes ${travelTime} days.`,
                relatedEntities: [currentState.characterId],
                suggestion: 'Add travel scenes, use teleportation, or fix timeline.',
                autoFixable: false
              }
            });
          }
        }
      }
    }

    if (results.length === 0) {
      results.push({ passed: true });
    }

    return results;
  }
});

const createCharacterAgeRule = (): ValidationRule => ({
  id: 'character-age',
  name: 'Character Age Consistency',
  type: ValidationRuleType.CHARACTER_AGE,
  description: 'Ensures character ages are consistent with timeline',
  severity: ErrorSeverity.WARNING,
  enabled: true,
  category: ErrorCategory.CHARACTER,
  validator: (ctx: ValidationContext): ValidationResult[] => {
    const results: ValidationResult[] = [];

    for (const state of ctx.currentChapter.characterStates) {
      if (state.age === undefined) continue;

      const character = ctx.characterRegistry.get(state.characterId);
      if (!character || !character.birthYear) continue;

      const expectedAge = ctx.currentChapter.timelineStart.year - character.birthYear;

      // Allow some variance for approximate ages
      if (Math.abs(state.age - expectedAge) > 2) {
        results.push({
          passed: false,
          error: {
            category: ErrorCategory.CHARACTER,
            severity: ErrorSeverity.WARNING,
            title: 'Age Inconsistency',
            description: `${state.name} is stated to be ${state.age} in Chapter ${ctx.currentChapter.number}, but should be approximately ${expectedAge} based on birth year ${character.birthYear}.`,
            relatedEntities: [state.characterId],
            suggestion: `Update age to ${expectedAge} or verify birth year.`,
            autoFixable: true
          }
        });
      }
    }

    if (results.length === 0) {
      results.push({ passed: true });
    }

    return results;
  }
});

const createPlotThreadRule = (): ValidationRule => ({
  id: 'plot-thread-consistency',
  name: 'Plot Thread Consistency',
  type: ValidationRuleType.PLOT_THREAD,
  description: 'Tracks unresolved and neglected plot threads',
  severity: ErrorSeverity.WARNING,
  enabled: true,
  category: ErrorCategory.PLOT,
  validator: (ctx: ValidationContext): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Check for neglected plot threads
    const neglectedThreads = ctx.chapterManager.findNeglectedPlotThreads(
      ctx.currentChapter.number,
      100  // 100 chapters without mention
    );

    for (const thread of neglectedThreads) {
      const chaptersSinceLastMention = ctx.currentChapter.number - thread.lastMentionedChapter;
      results.push({
        passed: false,
        error: {
          category: ErrorCategory.PLOT,
          severity: ErrorSeverity.WARNING,
          title: 'Neglected Plot Thread',
          description: `"${thread.name}" hasn't been mentioned in ${chaptersSinceLastMention} chapters (last: Chapter ${thread.lastMentionedChapter}).`,
          suggestion: 'Reference this plot thread or resolve it.',
          autoFixable: false
        }
      });
    }

    // Check for overdue resolutions
    const overdueThreads = ctx.chapterManager.findOverduePlotThreads(ctx.currentChapter.number);

    for (const thread of overdueThreads) {
      const age = ctx.currentChapter.number - thread.introducedChapter;
      results.push({
        passed: false,
        error: {
          category: ErrorCategory.PLOT,
          severity: ErrorSeverity.WARNING,
          title: 'Overdue Plot Thread',
          description: `"${thread.name}" (${thread.priority}) has been active for ${age} chapters since Chapter ${thread.introducedChapter}.`,
          suggestion: 'Consider resolving or escalating this plot thread.',
          autoFixable: false
        }
      });
    }

    if (results.length === 0) {
      results.push({ passed: true });
    }

    return results;
  }
});

const createNamingConsistencyRule = (): ValidationRule => ({
  id: 'naming-consistency',
  name: 'Name Consistency',
  type: ValidationRuleType.NAMING,
  description: 'Ensures character and location names are used consistently',
  severity: ErrorSeverity.WARNING,
  enabled: true,
  category: ErrorCategory.NAMING,
  validator: (ctx: ValidationContext): ValidationResult[] => {
    const results: ValidationResult[] = [];

    for (const mention of ctx.currentChapter.entityMentions) {
      const character = ctx.characterRegistry.get(mention.entityId);
      if (!character) continue;

      // Check if the name used matches known names
      const knownNames = [character.name, ...character.aliases];
      const usedName = mention.entityName;

      // Case-insensitive check
      const isKnown = knownNames.some(n => n.toLowerCase() === usedName.toLowerCase());

      if (!isKnown) {
        // Check for similar names (possible typos)
        const similarNames = knownNames.filter(n =>
          levenshteinDistance(n.toLowerCase(), usedName.toLowerCase()) <= 2
        );

        if (similarNames.length > 0) {
          results.push({
            passed: false,
            error: {
              category: ErrorCategory.NAMING,
              severity: ErrorSeverity.WARNING,
              title: 'Possible Name Typo',
              description: `"${usedName}" might be a typo for "${similarNames[0]}" in Chapter ${ctx.currentChapter.number}.`,
              relatedEntities: [character.id],
              suggestion: `Use "${similarNames[0]}" or add "${usedName}" as an alias.`,
              autoFixable: true
            }
          });
        }
      }
    }

    if (results.length === 0) {
      results.push({ passed: true });
    }

    return results;
  }
});

const createItemPossessionRule = (): ValidationRule => ({
  id: 'item-possession',
  name: 'Item Possession Consistency',
  type: ValidationRuleType.ITEM_POSSESSION,
  description: 'Ensures items are possessed by only one character at a time',
  severity: ErrorSeverity.ERROR,
  enabled: true,
  category: ErrorCategory.CONTINUITY,
  validator: (ctx: ValidationContext): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Get items used in this chapter
    const itemsUsed = ctx.currentChapter.itemsUsed;

    for (const itemId of itemsUsed) {
      const item = ctx.itemRegistry.get(itemId);
      if (!item || !item.unique) continue;

      // Check if item was destroyed
      if (item.destroyedChapter && item.destroyedChapter < ctx.currentChapter.number) {
        results.push({
          passed: false,
          error: {
            category: ErrorCategory.CONTINUITY,
            severity: ErrorSeverity.ERROR,
            title: 'Destroyed Item Used',
            description: `${item.name} is used in Chapter ${ctx.currentChapter.number} but was destroyed in Chapter ${item.destroyedChapter}.`,
            relatedEntities: [itemId],
            suggestion: 'Remove usage, restore item, or fix timeline.',
            autoFixable: false
          }
        });
      }

      // Check for conflicting possession
      if (item.ownerHistory.length > 0) {
        const lastOwner = item.ownerHistory
          .filter(h => h.chapter <= ctx.currentChapter.number)
          .sort((a, b) => b.chapter - a.chapter)[0];

        if (lastOwner) {
          // Check if the item is being used by someone who doesn't own it
          for (const state of ctx.currentChapter.characterStates) {
            if (state.inventory?.includes(itemId) && state.characterId !== lastOwner.owner) {
              const ownerChar = ctx.characterRegistry.get(lastOwner.owner);
              results.push({
                passed: false,
                error: {
                  category: ErrorCategory.CONTINUITY,
                  severity: ErrorSeverity.ERROR,
                  title: 'Item Possession Conflict',
                  description: `${state.name} has ${item.name} in Chapter ${ctx.currentChapter.number}, but it belongs to ${ownerChar?.name || 'Unknown'} as of Chapter ${lastOwner.chapter}.`,
                  relatedEntities: [itemId, state.characterId, lastOwner.owner],
                  suggestion: 'Add transfer scene or fix possession.',
                  autoFixable: false
                }
              });
            }
          }
        }
      }
    }

    if (results.length === 0) {
      results.push({ passed: true });
    }

    return results;
  }
});

// Utility function for name comparison
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// ============================================================================
// CONTINUITY VALIDATOR CLASS
// ============================================================================

export class ContinuityValidator {
  private rules: Map<string, ValidationRule> = new Map();
  private characterRegistry: Map<string, CharacterData> = new Map();
  private locationRegistry: Map<string, LocationData> = new Map();
  private itemRegistry: Map<string, ItemData> = new Map();
  private timelineRegistry: TimelineData[] = [];
  private worldRules: WorldRule[] = [];
  private magicRules: MagicRule[] = [];
  private validationReports: ValidationReport[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    const defaultRules = [
      createTimelineRule(),
      createCharacterDeathRule(),
      createCharacterLocationRule(),
      createCharacterAgeRule(),
      createPlotThreadRule(),
      createNamingConsistencyRule(),
      createItemPossessionRule()
    ];

    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule);
    }
  }

  // ==========================================================================
  // RULE MANAGEMENT
  // ==========================================================================

  addRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) rule.enabled = true;
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) rule.enabled = false;
  }

  getRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  // ==========================================================================
  // REGISTRY MANAGEMENT
  // ==========================================================================

  registerCharacter(character: CharacterData): void {
    this.characterRegistry.set(character.id, character);
  }

  registerLocation(location: LocationData): void {
    this.locationRegistry.set(location.id, location);
  }

  registerItem(item: ItemData): void {
    this.itemRegistry.set(item.id, item);
  }

  addWorldRule(rule: WorldRule): void {
    this.worldRules.push(rule);
  }

  addMagicRule(rule: MagicRule): void {
    this.magicRules.push(rule);
  }

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  validateChapter(chapter: Chapter, chapterManager: ChapterManager): ValidationError[] {
    const errors: ValidationError[] = [];
    const allChapters = chapterManager.getAllChapters();
    const previousChapter = chapterManager.getChapter(chapter.number - 1);

    const context: ValidationContext = {
      currentChapter: chapter,
      previousChapter,
      allChapters,
      chapterManager,
      characterRegistry: this.characterRegistry,
      locationRegistry: this.locationRegistry,
      itemRegistry: this.itemRegistry,
      timelineRegistry: this.timelineRegistry,
      worldRules: this.worldRules,
      magicRules: this.magicRules
    };

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      try {
        const results = rule.validator(context);

        for (const result of results) {
          if (!result.passed && result.error) {
            const error = chapterManager.addError(chapter.number, result.error);
            errors.push(error);
          }
        }
      } catch (err) {
        console.error(`Error running rule ${rule.id}:`, err);
      }
    }

    return errors;
  }

  validateChapterRange(startChapter: number, endChapter: number, chapterManager: ChapterManager): ValidationReport {
    const startTime = Date.now();
    const allErrors: ValidationError[] = [];
    const chaptersValidated: number[] = [];

    for (let i = startChapter; i <= endChapter; i++) {
      const chapter = chapterManager.getChapter(i);
      if (!chapter) continue;

      chaptersValidated.push(i);
      const errors = this.validateChapter(chapter, chapterManager);
      allErrors.push(...errors);
    }

    return this.generateReport(chaptersValidated, allErrors, Date.now() - startTime, ValidationScope.RANGE);
  }

  validateFullStory(chapterManager: ChapterManager, batchSize: number = 100): ValidationReport {
    const startTime = Date.now();
    const allErrors: ValidationError[] = [];
    const chaptersValidated: number[] = [];
    const chapters = chapterManager.getAllChapters();

    // Process in batches to avoid memory issues
    for (let i = 0; i < chapters.length; i += batchSize) {
      const batch = chapters.slice(i, i + batchSize);

      for (const chapter of batch) {
        chaptersValidated.push(chapter.number);
        const errors = this.validateChapter(chapter, chapterManager);
        allErrors.push(...errors);
      }

      // Log progress for long validations
      if (chapters.length > 1000 && i % 1000 === 0) {
        console.log(`Validated ${i}/${chapters.length} chapters...`);
      }
    }

    return this.generateReport(chaptersValidated, allErrors, Date.now() - startTime, ValidationScope.FULL);
  }

  // ==========================================================================
  // SPECIALIZED VALIDATION
  // ==========================================================================

  validateTimeline(chapterManager: ChapterManager): ValidationError[] {
    const errors: ValidationError[] = [];
    const chapters = chapterManager.getAllChapters();

    let previousTimeline: TimelinePosition | undefined;
    let previousChapter: number | undefined;

    for (const chapter of chapters) {
      if (chapter.type === 'flashback' || chapter.type === 'flash_forward') continue;

      const current = chapter.timelineStart;

      if (previousTimeline && previousChapter) {
        // Check for timeline regression
        if (this.compareTimelines(current, previousTimeline) < 0) {
          const error = chapterManager.addError(chapter.number, {
            category: ErrorCategory.TIMELINE,
            severity: ErrorSeverity.ERROR,
            title: 'Timeline Regression',
            description: `Chapter ${chapter.number} occurs before Chapter ${previousChapter} in timeline.`,
            autoFixable: false
          });
          errors.push(error);
        }

        // Check for unreasonable time jumps
        const yearGap = current.year - previousTimeline.year;
        if (yearGap > 100) {
          const error = chapterManager.addError(chapter.number, {
            category: ErrorCategory.TIMELINE,
            severity: ErrorSeverity.WARNING,
            title: 'Large Time Gap',
            description: `${yearGap} year jump between Chapter ${previousChapter} and ${chapter.number}.`,
            autoFixable: false
          });
          errors.push(error);
        }
      }

      previousTimeline = chapter.timelineEnd;
      previousChapter = chapter.number;
    }

    return errors;
  }

  validateCharacterAcrossStory(characterId: string, chapterManager: ChapterManager): ValidationError[] {
    const errors: ValidationError[] = [];
    const character = this.characterRegistry.get(characterId);
    if (!character) return errors;

    const chapters = chapterManager.getAllChapters();
    let lastLocation: string | undefined;
    let lastChapter: number | undefined;
    let isDead = false;

    for (const chapter of chapters) {
      // Skip if character not in this chapter
      const state = chapter.characterStates.find(s => s.characterId === characterId);
      const mention = chapter.entityMentions.find(m => m.entityId === characterId);

      if (!state && !mention) continue;

      // Check for dead character appearance
      if (isDead && chapter.type !== 'flashback') {
        const error = chapterManager.addError(chapter.number, {
          category: ErrorCategory.CHARACTER,
          severity: ErrorSeverity.CRITICAL,
          title: 'Dead Character Appears',
          description: `${character.name} appears in Chapter ${chapter.number} but is dead.`,
          relatedEntities: [characterId],
          autoFixable: false
        });
        errors.push(error);
      }

      // Update death status
      if (state?.status === 'dead') {
        isDead = true;
      }

      // Check location consistency
      if (state?.location && lastLocation && lastChapter) {
        const prevLoc = this.locationRegistry.get(lastLocation);
        const currLoc = this.locationRegistry.get(state.location);

        if (prevLoc && currLoc && state.location !== lastLocation) {
          const travelTime = prevLoc.travelTimes.get(currLoc.id);
          if (travelTime) {
            const chapterGap = chapter.number - lastChapter;
            // Very rough heuristic
            if (chapterGap < Math.ceil(travelTime / 5)) {
              const error = chapterManager.addError(chapter.number, {
                category: ErrorCategory.CONTINUITY,
                severity: ErrorSeverity.WARNING,
                title: 'Fast Travel',
                description: `${character.name} moved from ${prevLoc.name} to ${currLoc.name} too quickly.`,
                relatedEntities: [characterId],
                autoFixable: false
              });
              errors.push(error);
            }
          }
        }
      }

      if (state?.location) {
        lastLocation = state.location;
        lastChapter = chapter.number;
      }
    }

    return errors;
  }

  validateAllCharacters(chapterManager: ChapterManager): ValidationError[] {
    const allErrors: ValidationError[] = [];

    for (const characterId of this.characterRegistry.keys()) {
      const errors = this.validateCharacterAcrossStory(characterId, chapterManager);
      allErrors.push(...errors);
    }

    return allErrors;
  }

  private compareTimelines(a: TimelinePosition, b: TimelinePosition): number {
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== undefined && b.month !== undefined && a.month !== b.month) {
      return a.month - b.month;
    }
    if (a.day !== undefined && b.day !== undefined && a.day !== b.day) {
      return a.day - b.day;
    }
    return 0;
  }

  // ==========================================================================
  // REPORT GENERATION
  // ==========================================================================

  private generateReport(
    chaptersValidated: number[],
    errors: ValidationError[],
    duration: number,
    scope: ValidationScope
  ): ValidationReport {
    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const criticalIssues: ValidationError[] = [];

    for (const error of errors) {
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;

      if (error.severity === ErrorSeverity.CRITICAL) {
        criticalIssues.push(error);
      }
    }

    const totalChecks = chaptersValidated.length * this.rules.size;
    const passRate = totalChecks > 0 ? ((totalChecks - errors.length) / totalChecks) * 100 : 100;

    const report: ValidationReport = {
      id: uuidv4(),
      timestamp: new Date(),
      scope,
      chaptersValidated,
      duration,
      errorsFound: errors.length,
      errorsByCategory,
      errorsBySeverity,
      passRate: Math.round(passRate * 100) / 100,
      criticalIssues,
      summary: this.generateReportSummary(chaptersValidated, errors, duration, passRate)
    };

    this.validationReports.push(report);
    return report;
  }

  private generateReportSummary(
    chapters: number[],
    errors: ValidationError[],
    duration: number,
    passRate: number
  ): string {
    const critical = errors.filter(e => e.severity === ErrorSeverity.CRITICAL).length;
    const severe = errors.filter(e => e.severity === ErrorSeverity.ERROR).length;

    let summary = `Validated ${chapters.length.toLocaleString()} chapters in ${(duration / 1000).toFixed(2)}s. `;
    summary += `Found ${errors.length} issues (${critical} critical, ${severe} errors). `;
    summary += `Pass rate: ${passRate.toFixed(1)}%.`;

    if (critical > 0) {
      summary += ` CRITICAL ISSUES REQUIRE IMMEDIATE ATTENTION.`;
    }

    return summary;
  }

  getValidationReports(): ValidationReport[] {
    return this.validationReports;
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  generateMarkdownReport(report: ValidationReport): string {
    let md = `# Validation Report\n\n`;
    md += `**Generated:** ${report.timestamp.toISOString()}\n\n`;
    md += `**Scope:** ${report.scope}\n\n`;
    md += `**Duration:** ${(report.duration / 1000).toFixed(2)} seconds\n\n`;

    md += `## Summary\n\n`;
    md += `${report.summary}\n\n`;

    md += `## Statistics\n\n`;
    md += `- Chapters Validated: ${report.chaptersValidated.length.toLocaleString()}\n`;
    md += `- Total Errors: ${report.errorsFound}\n`;
    md += `- Pass Rate: ${report.passRate}%\n\n`;

    if (Object.keys(report.errorsByCategory).length > 0) {
      md += `## Errors by Category\n\n`;
      md += `| Category | Count |\n`;
      md += `|----------|-------|\n`;
      for (const [cat, count] of Object.entries(report.errorsByCategory)) {
        md += `| ${cat} | ${count} |\n`;
      }
      md += `\n`;
    }

    if (Object.keys(report.errorsBySeverity).length > 0) {
      md += `## Errors by Severity\n\n`;
      md += `| Severity | Count |\n`;
      md += `|----------|-------|\n`;
      for (const [sev, count] of Object.entries(report.errorsBySeverity)) {
        md += `| ${sev} | ${count} |\n`;
      }
      md += `\n`;
    }

    if (report.criticalIssues.length > 0) {
      md += `## Critical Issues\n\n`;
      for (const issue of report.criticalIssues) {
        md += `### ${issue.title}\n\n`;
        md += `**Chapter:** ${issue.chapterNumber}\n\n`;
        md += `${issue.description}\n\n`;
        if (issue.suggestion) {
          md += `**Suggestion:** ${issue.suggestion}\n\n`;
        }
      }
    }

    return md;
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export const continuityValidator = new ContinuityValidator();
