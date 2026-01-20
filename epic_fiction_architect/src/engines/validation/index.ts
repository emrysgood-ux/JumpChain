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

  constructor() {
    const { ChapterManager } = require('./chapter-manager');
    const { ContinuityValidator } = require('./continuity-validator');
    const { StoryIntegrityChecker } = require('./story-integrity-checker');

    this.chapters = new ChapterManager();
    this.continuity = new ContinuityValidator();
    this.integrity = new StoryIntegrityChecker();
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
    overallScore: number;
    totalErrors: number;
    criticalErrors: number;
  } {
    // Run continuity validation
    const continuityReport = this.continuity.validateFullStory(this.chapters);

    // Run integrity analysis
    const integrityReport = this.integrity.analyzeStoryHealth(this.chapters);

    // Calculate overall metrics
    const totalErrors = continuityReport.errorsFound + integrityReport.issues.length;
    const criticalErrors = continuityReport.criticalIssues.length +
      integrityReport.issues.filter(i => i.severity === 'critical').length;

    const overallScore = Math.round(
      (continuityReport.passRate + integrityReport.score) / 2
    );

    return {
      continuityReport,
      integrityReport,
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
      foreshadowing: this.integrity.getForeshadowing().length
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
  }
}

export default ValidationSuite;
