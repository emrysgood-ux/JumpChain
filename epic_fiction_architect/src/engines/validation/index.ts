/**
 * Epic Fiction Architect - Validation Engines
 *
 * Comprehensive validation system for maintaining continuity and integrity
 * across massive narratives (12,000+ chapters).
 */

// Chapter Manager
export {
  ChapterManager,
  chapterManager,
  type Chapter,
  type ChapterMetrics,
  type ChapterConnection,
  type CharacterState,
  type EntityMention,
  type PlotThread,
  type SceneData,
  type StoryArc,
  type Volume,
  type StoryState,
  type TimelinePosition,
  type ValidationError,
  ChapterStatus,
  ChapterType,
  POVType,
  SceneType,
  ErrorCategory,
  ErrorSeverity
} from './chapter-manager';

// Continuity Validator
export {
  ContinuityValidator,
  continuityValidator,
  type ValidationRule,
  type ValidationContext,
  type ValidationResult,
  type ValidationReport,
  type CharacterData,
  type LocationData,
  type ItemData,
  type TimelineData,
  type WorldRule,
  type MagicRule,
  ValidationRuleType,
  ValidationScope
} from './continuity-validator';

// Story Integrity Checker
export {
  StoryIntegrityChecker,
  storyIntegrityChecker,
  type CharacterArc,
  type Foreshadowing,
  type PlotPoint,
  type Theme,
  type NarrativeBeats,
  type StoryHealthReport,
  CharacterArcType,
  NarrativeStructure,
  PlotPointType,
  ThemeType,
  IntegrityStatus
} from './story-integrity-checker';

// Relationship Validator
export {
  RelationshipValidator,
  relationshipValidator,
  type Relationship,
  type RelationshipChange,
  type RelationshipRule,
  type RelationshipError,
  type RelationshipNetwork,
  type FamilyTree,
  type ValidationContext as RelationshipValidationContext,
  RelationshipType,
  RelationshipStatus,
  RelationshipSentiment,
  RelationshipChangeType,
  RelationshipErrorType
} from './relationship-validator';

// Knowledge Tracker
export {
  KnowledgeTracker,
  knowledgeTracker,
  type KnowledgePiece,
  type CharacterKnowledge,
  type KnowledgeTransfer,
  type KnowledgeError,
  type KnowledgeValidationContext,
  type KnowledgeQuery,
  type CharacterKnowledgeProfile,
  KnowledgeType,
  KnowledgeSource,
  KnowledgeCertainty,
  KnowledgeStatus,
  KnowledgeErrorType
} from './knowledge-tracker';

/**
 * Unified Validation Suite
 *
 * Provides a single interface to all validation engines for
 * managing 12,000+ chapter stories with zero errors.
 */
export class ValidationSuite {
  public readonly chapters: import('./chapter-manager').ChapterManager;
  public readonly continuity: import('./continuity-validator').ContinuityValidator;
  public readonly integrity: import('./story-integrity-checker').StoryIntegrityChecker;
  public readonly relationships: import('./relationship-validator').RelationshipValidator;
  public readonly knowledge: import('./knowledge-tracker').KnowledgeTracker;

  constructor() {
    const { ChapterManager } = require('./chapter-manager');
    const { ContinuityValidator } = require('./continuity-validator');
    const { StoryIntegrityChecker } = require('./story-integrity-checker');
    const { RelationshipValidator } = require('./relationship-validator');
    const { KnowledgeTracker } = require('./knowledge-tracker');

    this.chapters = new ChapterManager();
    this.continuity = new ContinuityValidator();
    this.integrity = new StoryIntegrityChecker();
    this.relationships = new RelationshipValidator();
    this.knowledge = new KnowledgeTracker();
  }

  /**
   * Initialize a full 12,008 chapter story structure
   */
  initializeStory(chapterCount: number = 12008, options: {
    volumeSize?: number;
    narrativeStructure?: import('./story-integrity-checker').NarrativeStructure;
  } = {}): void {
    const volumeSize = options.volumeSize || 100;

    // Initialize chapters
    this.chapters.initializeFullStory(chapterCount, volumeSize);

    // Set up narrative structure
    if (options.narrativeStructure) {
      this.integrity.setNarrativeStructure(options.narrativeStructure, chapterCount);
    }
  }

  /**
   * Run full validation on the story
   */
  validateFullStory(): {
    continuityReport: import('./continuity-validator').ValidationReport;
    integrityReport: import('./story-integrity-checker').StoryHealthReport;
    relationshipReport: ReturnType<import('./relationship-validator').RelationshipValidator['validateAllRelationships']>;
    knowledgeReport: ReturnType<import('./knowledge-tracker').KnowledgeTracker['validateAllKnowledge']>;
    overallScore: number;
    totalErrors: number;
    criticalErrors: number;
  } {
    // Run continuity validation
    const continuityReport = this.continuity.validateFullStory(this.chapters);

    // Run integrity analysis
    const integrityReport = this.integrity.analyzeStoryHealth(this.chapters);

    // Build validation context for relationship and knowledge validation
    const deadCharacters = new Set<string>();
    const characterAges = new Map<string, number>();
    const characterLocations = new Map<string, string>();
    const characterLanguages = new Map<string, string[]>();

    // Get current chapter for context
    const stats = this.chapters.getStats();
    const currentChapter = stats.totalChapters;

    // Run relationship validation
    const relationshipReport = this.relationships.validateAllRelationships({
      currentChapter,
      deadCharacters,
      characterAges,
      characterLocations
    });

    // Run knowledge validation
    const knowledgeReport = this.knowledge.validateAllKnowledge({
      currentChapter,
      characterLocations,
      characterLanguages,
      deadCharacters
    });

    // Calculate overall metrics
    const totalErrors = continuityReport.errorsFound +
      integrityReport.issues.length +
      relationshipReport.errorsFound +
      knowledgeReport.errorsFound;

    const criticalErrors = continuityReport.criticalIssues.length +
      integrityReport.issues.filter(i => i.severity === 'critical').length +
      relationshipReport.criticalErrors +
      knowledgeReport.criticalErrors;

    const overallScore = Math.round(
      (continuityReport.passRate +
       integrityReport.score +
       relationshipReport.passRate +
       knowledgeReport.passRate) / 4
    );

    return {
      continuityReport,
      integrityReport,
      relationshipReport,
      knowledgeReport,
      overallScore,
      totalErrors,
      criticalErrors
    };
  }

  /**
   * Validate a specific chapter range
   */
  validateChapterRange(start: number, end: number): {
    continuityReport: import('./continuity-validator').ValidationReport;
    errorsFound: number;
  } {
    const continuityReport = this.continuity.validateChapterRange(start, end, this.chapters);

    return {
      continuityReport,
      errorsFound: continuityReport.errorsFound
    };
  }

  /**
   * Get current story statistics
   */
  getStoryStats(): {
    chapters: ReturnType<import('./chapter-manager').ChapterManager['getStats']>;
    validation: {
      totalErrors: number;
      criticalErrors: number;
      avgValidationScore: number;
    };
    arcs: number;
    plotThreads: number;
    characterArcs: number;
    foreshadowing: number;
    relationships: ReturnType<import('./relationship-validator').RelationshipValidator['getStats']>;
    knowledge: ReturnType<import('./knowledge-tracker').KnowledgeTracker['getStats']>;
  } {
    const chapterStats = this.chapters.getStats();

    return {
      chapters: chapterStats,
      validation: {
        totalErrors: chapterStats.errors.total,
        criticalErrors: chapterStats.errors.critical,
        avgValidationScore: chapterStats.validationScoreAvg
      },
      arcs: this.chapters.getAllArcs().length,
      plotThreads: chapterStats.plotThreads.total,
      characterArcs: this.integrity.getCharacterArcs().length,
      foreshadowing: this.integrity.getForeshadowing().length,
      relationships: this.relationships.getStats(),
      knowledge: this.knowledge.getStats()
    };
  }

  /**
   * Generate comprehensive story report
   */
  generateReport(): string {
    const stats = this.getStoryStats();

    let report = `# Story Validation Report\n\n`;
    report += `## Overview\n\n`;
    report += `- **Total Chapters:** ${stats.chapters.totalChapters.toLocaleString()}\n`;
    report += `- **Total Word Count:** ${stats.chapters.totalWordCount.toLocaleString()}\n`;
    report += `- **Volumes:** ${stats.chapters.volumes}\n`;
    report += `- **Story Arcs:** ${stats.arcs}\n\n`;

    report += `## Plot Management\n\n`;
    report += `- **Active Plot Threads:** ${stats.plotThreads}\n`;
    report += `- **Character Arcs:** ${stats.characterArcs}\n`;
    report += `- **Foreshadowing Elements:** ${stats.foreshadowing}\n\n`;

    report += `## Relationships\n\n`;
    report += `- **Total Relationships:** ${stats.relationships.totalRelationships}\n`;
    report += `- **Active Relationships:** ${stats.relationships.activeRelationships}\n`;
    report += `- **Secret Relationships:** ${stats.relationships.secretRelationships}\n`;
    report += `- **Family Trees:** ${stats.relationships.familyTrees}\n\n`;

    report += `## Knowledge Tracking\n\n`;
    report += `- **Knowledge Pieces:** ${stats.knowledge.totalKnowledgePieces}\n`;
    report += `- **Characters Tracked:** ${stats.knowledge.charactersTracked}\n`;
    report += `- **Secrets:** ${stats.knowledge.secrets}\n`;
    report += `- **Misinformation:** ${stats.knowledge.misinformation}\n\n`;

    report += `## Validation Status\n\n`;
    report += `- **Average Score:** ${stats.validation.avgValidationScore}/100\n`;
    report += `- **Total Errors:** ${stats.validation.totalErrors}\n`;
    report += `- **Critical Errors:** ${stats.validation.criticalErrors}\n\n`;

    report += `## Chapter Progress\n\n`;
    for (const [status, count] of Object.entries(stats.chapters.chaptersByStatus)) {
      const percentage = ((count / stats.chapters.totalChapters) * 100).toFixed(1);
      report += `- **${status}:** ${count.toLocaleString()} (${percentage}%)\n`;
    }

    return report;
  }

  /**
   * Export all validation data
   */
  exportAll(): string {
    return JSON.stringify({
      chapters: JSON.parse(this.chapters.exportToJSON()),
      integrity: JSON.parse(this.integrity.exportToJSON()),
      relationships: JSON.parse(this.relationships.exportToJSON()),
      knowledge: JSON.parse(this.knowledge.exportToJSON()),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import all validation data
   */
  importAll(json: string): void {
    const data = JSON.parse(json);

    if (data.chapters) {
      this.chapters.importFromJSON(JSON.stringify(data.chapters));
    }

    if (data.integrity) {
      this.integrity.importFromJSON(JSON.stringify(data.integrity));
    }

    if (data.relationships) {
      this.relationships.importFromJSON(JSON.stringify(data.relationships));
    }

    if (data.knowledge) {
      this.knowledge.importFromJSON(JSON.stringify(data.knowledge));
    }
  }

  /**
   * Clear all validation data
   */
  clearAll(): void {
    this.chapters.clear();
    this.integrity.clear();
    this.relationships.clear();
    this.knowledge.clearErrors();
  }

  /**
   * Get all errors across all validators
   */
  getAllErrors(): {
    continuity: import('./continuity-validator').ValidationResult[];
    relationships: import('./relationship-validator').RelationshipError[];
    knowledge: import('./knowledge-tracker').KnowledgeError[];
  } {
    return {
      continuity: this.continuity.getErrors(),
      relationships: this.relationships.getErrors(),
      knowledge: this.knowledge.getErrors()
    };
  }
}

export default ValidationSuite;
