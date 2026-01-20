/**
 * Epic Fiction Project - Unified Project Management
 *
 * The unified entry point for managing epic-scale fiction projects.
 * Brings together all tracking engines with a consistent API.
 *
 * Features:
 * - Single source of truth for character IDs
 * - Cross-engine event propagation
 * - Unified serialization/deserialization
 * - Project-wide statistics and health reports
 * - Diagnostic tools
 */

import { v4 as uuidv4 } from 'uuid';

// Import all engines
import {
  CharacterArcSystem,
  Character,
  CharacterRole,
  CharacterArc,
  ArcType,
  ArcPhase,
  SkillCategory,
  GrowthTrigger
} from '../character-arc';

import {
  SubplotManager,
  Subplot,
  PlotLevel,
  PlotCategory,
  PlotStatus,
  PlotBeatType
} from '../subplot-manager';

import {
  TensionTracker,
  Stakes,
  StakesLevel,
  TensionLevel,
  TensionSource,
  Deadline,
  DeadlineType
} from '../tension-tracker';

import {
  ForeshadowingSystem,
  ForeshadowingSetup,
  ForeshadowingType,
  SubtletyLevel,
  ChekhovsGun,
  Prophecy
} from '../foreshadowing';

import {
  SeriesManager,
  SeriesInfo,
  BookInfo,
  BookStatus
} from '../series-manager';

import {
  CreativeHallucinationEngine,
  TruthLayer,
  DreamLogicType,
  DivergencePoint,
  HallucinationType
} from '../creative-hallucination';

// =============================================================================
// PROJECT METADATA
// =============================================================================

export interface ProjectMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  genre: string[];
  targetWordCount: number;
  targetChapterCount: number;

  // Timeline
  createdAt: Date;
  updatedAt: Date;

  // Status
  currentChapter: number;
  wordCount: number;

  // Settings
  settings: ProjectSettings;
}

export interface ProjectSettings {
  // Auto-tracking options
  autoUpdateTensionOnPlotChange: boolean;
  autoCreateForeshadowingReminders: boolean;
  warnOnDormantPlots: boolean;
  warnOnOverdueDeadlines: boolean;

  // Thresholds
  dormancyThresholdChapters: number;
  tensionWarningThreshold: TensionLevel;
  stakesWarningThreshold: StakesLevel;
}

// =============================================================================
// DIAGNOSTIC TYPES
// =============================================================================

export interface ProjectDiagnostic {
  timestamp: Date;
  currentChapter: number;

  // Health scores
  overallHealth: 'healthy' | 'warning' | 'critical';
  healthScore: number;

  // Per-system health
  characterHealth: SystemHealth;
  plotHealth: SystemHealth;
  tensionHealth: SystemHealth;
  foreshadowingHealth: SystemHealth;

  // Issues found
  issues: DiagnosticIssue[];

  // Recommendations
  recommendations: string[];

  // Statistics
  stats: ProjectStatistics;
}

export interface SystemHealth {
  system: string;
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  issues: string[];
}

export interface DiagnosticIssue {
  system: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  recommendation: string;
  relatedIds?: string[];
}

export interface ProjectStatistics {
  // Characters
  totalCharacters: number;
  livingCharacters: number;
  charactersWithArcs: number;
  averageArcsPerCharacter: number;

  // Plots
  totalPlots: number;
  activePlots: number;
  completedPlots: number;
  dormantPlots: number;

  // Tension
  currentTension: TensionLevel;
  highestStakes: StakesLevel;
  activeDeadlines: number;

  // Foreshadowing
  pendingSetups: number;
  overduePayoffs: number;
  unfiredGuns: number;

  // Series
  totalBooks: number;
  totalArcs: number;
  chaptersWritten: number;
}

// =============================================================================
// CROSS-SYSTEM EVENT
// =============================================================================

export type ProjectEventType =
  | 'character_created'
  | 'character_died'
  | 'character_resurrected'
  | 'arc_started'
  | 'arc_completed'
  | 'plot_created'
  | 'plot_resolved'
  | 'plot_dormant'
  | 'stakes_escalated'
  | 'deadline_approaching'
  | 'deadline_missed'
  | 'foreshadowing_overdue'
  | 'tension_peak'
  | 'tension_valley';

export interface ProjectEvent {
  id: string;
  type: ProjectEventType;
  chapter: number;
  timestamp: Date;
  description: string;
  relatedIds: {
    characterId?: string;
    plotId?: string;
    arcId?: string;
    stakesId?: string;
    setupId?: string;
  };
  metadata?: Record<string, unknown>;
}

// =============================================================================
// EPIC FICTION PROJECT CLASS
// =============================================================================

export class EpicFictionProject {
  // Metadata
  public metadata: ProjectMetadata;

  // Engines
  public characters: CharacterArcSystem;
  public plots: SubplotManager;
  public tension: TensionTracker;
  public foreshadowing: ForeshadowingSystem;
  public series: SeriesManager;
  public hallucination: CreativeHallucinationEngine;

  // Event log
  private eventLog: ProjectEvent[] = [];
  private eventListeners: Map<ProjectEventType, ((event: ProjectEvent) => void)[]> = new Map();

  constructor(name: string, author: string) {
    const id = uuidv4();
    const now = new Date();

    this.metadata = {
      id,
      name,
      description: '',
      author,
      genre: [],
      targetWordCount: 0,
      targetChapterCount: 0,
      createdAt: now,
      updatedAt: now,
      currentChapter: 0,
      wordCount: 0,
      settings: {
        autoUpdateTensionOnPlotChange: true,
        autoCreateForeshadowingReminders: true,
        warnOnDormantPlots: true,
        warnOnOverdueDeadlines: true,
        dormancyThresholdChapters: 30,
        tensionWarningThreshold: TensionLevel.INTENSE,
        stakesWarningThreshold: StakesLevel.CRITICAL
      }
    };

    // Initialize engines
    this.characters = new CharacterArcSystem();
    this.plots = new SubplotManager();
    this.tension = new TensionTracker();
    this.foreshadowing = new ForeshadowingSystem();
    this.series = new SeriesManager();
    this.hallucination = new CreativeHallucinationEngine();
  }

  // ===========================================================================
  // CONVENIENCE METHODS - CHARACTER
  // ===========================================================================

  /**
   * Create a character with full tracking setup
   */
  createCharacter(data: {
    name: string;
    role: CharacterRole;
    importance: 'primary' | 'secondary' | 'tertiary' | 'background';
    introductionChapter: number;
    introductionContext: string;
    description: string;
    aliases?: string[];
    occupation?: string;
    origin?: string;
    currentUniverse?: string;
    narrativePurpose?: string;
  }): Character {
    const character = this.characters.createCharacter(data);

    this.emitEvent({
      type: 'character_created',
      chapter: data.introductionChapter,
      description: `Character "${data.name}" introduced`,
      relatedIds: { characterId: character.id }
    });

    return character;
  }

  /**
   * Start a character arc with automatic tracking
   */
  startArc(data: {
    characterId: string;
    characterName: string;
    type: ArcType;
    name: string;
    description: string;
    startChapter: number;
    estimatedEndChapter?: number;
    stakes: string;
    stakesLevel: 'personal' | 'local' | 'regional' | 'global' | 'cosmic';
    startingState: Parameters<CharacterArcSystem['createArc']>[0]['startingState'];
    targetState: Parameters<CharacterArcSystem['createArc']>[0]['targetState'];
    isPrimary?: boolean;
  }): CharacterArc {
    const arc = this.characters.createArc(data);

    this.emitEvent({
      type: 'arc_started',
      chapter: data.startChapter,
      description: `Arc "${data.name}" started for ${data.characterName}`,
      relatedIds: { characterId: data.characterId, arcId: arc.id }
    });

    return arc;
  }

  // ===========================================================================
  // CONVENIENCE METHODS - PLOT
  // ===========================================================================

  /**
   * Create a plot with automatic tension/stakes linking
   */
  createPlot(data: {
    name: string;
    description: string;
    level: PlotLevel;
    category: PlotCategory;
    startChapter: number;
    expectedEndChapter?: number;
    deadlineChapter?: number;
    primaryCharacterIds: string[];
    secondaryCharacterIds?: string[];
    antagonistIds?: string[];
    centralConflict: string;
    stakes: string;
    stakesLevel: Subplot['stakesLevel'];
    createAssociatedStakes?: boolean;
  }): Subplot {
    const plot = this.plots.createPlot(data);

    // Optionally create associated stakes
    if (data.createAssociatedStakes) {
      this.tension.createStakes({
        name: `${data.name} Stakes`,
        description: data.stakes,
        level: this.mapStakesLevel(data.stakesLevel),
        affectedCharacterIds: data.primaryCharacterIds,
        affectedGroupIds: [],
        scope: data.stakesLevel,
        whatAtRisk: [data.stakes],
        worstCase: `${data.name} fails`,
        bestCase: `${data.name} succeeds`,
        startChapter: data.startChapter,
        plotId: plot.id,
        notes: `Auto-created for plot: ${data.name}`
      });
    }

    this.emitEvent({
      type: 'plot_created',
      chapter: data.startChapter,
      description: `Plot "${data.name}" created`,
      relatedIds: { plotId: plot.id }
    });

    return plot;
  }

  /**
   * Map string stakes level to enum
   */
  private mapStakesLevel(level: Subplot['stakesLevel']): StakesLevel {
    const mapping: Record<string, StakesLevel> = {
      'personal': StakesLevel.MODERATE,
      'local': StakesLevel.HIGH,
      'regional': StakesLevel.SEVERE,
      'global': StakesLevel.CATASTROPHIC,
      'cosmic': StakesLevel.EXISTENTIAL
    };
    return mapping[level] || StakesLevel.MODERATE;
  }

  // ===========================================================================
  // CONVENIENCE METHODS - FORESHADOWING
  // ===========================================================================

  /**
   * Plant a seed (foreshadowing) with automatic reminder scheduling
   */
  plantSeed(data: {
    type: ForeshadowingType;
    name: string;
    description: string;
    setupChapter: number;
    setupMethod: string;
    subtlety: SubtletyLevel;
    foreshadowedElement: string;
    expectedPayoff: string;
    plannedPayoffChapter?: number;
    maxChapterDistance?: number;
    characterIds?: string[];
    plotIds?: string[];
    isRedHerring?: boolean;
    readerAwareness?: 'likely_noticed' | 'possibly_noticed' | 'probably_missed';
  }): ForeshadowingSetup {
    const setup = this.foreshadowing.createSetup({
      ...data,
      characterIds: data.characterIds || [],
      plotIds: data.plotIds || [],
      relatedSetupIds: [],
      isRedHerring: data.isRedHerring || false,
      readerAwareness: data.readerAwareness || 'possibly_noticed',
      notes: ''
    });

    // Schedule automatic reminders if enabled
    if (this.metadata.settings.autoCreateForeshadowingReminders && data.plannedPayoffChapter) {
      const reminderInterval = Math.floor((data.plannedPayoffChapter - data.setupChapter) / 3);
      if (reminderInterval > 10) {
        this.foreshadowing.addReminder(setup.id, data.setupChapter + reminderInterval);
        this.foreshadowing.addReminder(setup.id, data.setupChapter + reminderInterval * 2);
      }
    }

    return setup;
  }

  // ===========================================================================
  // CHAPTER ADVANCEMENT
  // ===========================================================================

  /**
   * Advance to a new chapter - triggers all necessary checks
   */
  advanceToChapter(chapter: number): DiagnosticIssue[] {
    this.metadata.currentChapter = chapter;
    this.metadata.updatedAt = new Date();

    const issues: DiagnosticIssue[] = [];

    // Check for approaching deadlines
    const approachingDeadlines = this.tension.getApproachingDeadlines(chapter, 5);
    for (const deadline of approachingDeadlines) {
      if (deadline.targetChapter - chapter <= 3) {
        issues.push({
          system: 'tension',
          severity: 'high',
          type: 'deadline_approaching',
          description: `Deadline "${deadline.name}" in ${deadline.targetChapter - chapter} chapters`,
          recommendation: 'Resolve or extend this deadline soon'
        });

        this.emitEvent({
          type: 'deadline_approaching',
          chapter,
          description: `Deadline "${deadline.name}" approaching`,
          relatedIds: {}
        });
      }
    }

    // Check for dormant plots
    if (this.metadata.settings.warnOnDormantPlots) {
      const dormant = this.plots.getDormantPlots(chapter);
      for (const plot of dormant) {
        issues.push({
          system: 'plots',
          severity: 'medium',
          type: 'plot_dormant',
          description: `Plot "${plot.name}" has been inactive for ${chapter - plot.lastActiveChapter} chapters`,
          recommendation: 'Reactivate this plot or mark as abandoned'
        });
      }
    }

    // Check for overdue foreshadowing
    const overdueSetups = this.foreshadowing.getOverdueSetups(chapter);
    for (const setup of overdueSetups) {
      issues.push({
        system: 'foreshadowing',
        severity: 'high',
        type: 'foreshadowing_overdue',
        description: `Foreshadowing "${setup.name}" is overdue for payoff`,
        recommendation: 'Deliver payoff soon or add a reminder'
      });

      this.emitEvent({
        type: 'foreshadowing_overdue',
        chapter,
        description: `Foreshadowing "${setup.name}" overdue`,
        relatedIds: { setupId: setup.id }
      });
    }

    // Update foreshadowing urgency
    for (const setup of this.foreshadowing.getPendingSetups()) {
      this.foreshadowing.updateUrgency(setup.id, chapter);
    }

    return issues;
  }

  // ===========================================================================
  // DIAGNOSTICS
  // ===========================================================================

  /**
   * Run full project diagnostic
   */
  runDiagnostic(): ProjectDiagnostic {
    const chapter = this.metadata.currentChapter;
    const issues: DiagnosticIssue[] = [];
    const recommendations: string[] = [];

    // Character system health
    const charStats = this.characters.getStats();
    const characterIssues: string[] = [];

    if (charStats.totalCharacters === 0) {
      characterIssues.push('No characters defined');
      issues.push({
        system: 'characters',
        severity: 'critical',
        type: 'no_characters',
        description: 'No characters have been created',
        recommendation: 'Create at least one main character'
      });
    }

    const charactersWithArcs = new Set<string>();
    for (const arc of Array.from(this.characters['arcs'].values())) {
      charactersWithArcs.add(arc.characterId);
    }

    if (charStats.totalCharacters > 0 && charactersWithArcs.size === 0) {
      characterIssues.push('No character arcs defined');
      recommendations.push('Create character arcs to track character development');
    }

    const characterHealth: SystemHealth = {
      system: 'characters',
      status: characterIssues.length > 2 ? 'critical' : characterIssues.length > 0 ? 'warning' : 'healthy',
      score: Math.max(0, 100 - characterIssues.length * 20),
      issues: characterIssues
    };

    // Plot system health
    const plotStats = this.plots.getStats();
    const plotIssues: string[] = [];

    const dormantPlots = this.plots.getDormantPlots(chapter);
    if (dormantPlots.length > 0) {
      plotIssues.push(`${dormantPlots.length} dormant plots`);
      for (const plot of dormantPlots) {
        issues.push({
          system: 'plots',
          severity: 'medium',
          type: 'dormant_plot',
          description: `Plot "${plot.name}" inactive for ${chapter - plot.lastActiveChapter} chapters`,
          recommendation: 'Reactivate or resolve this plot',
          relatedIds: [plot.id]
        });
      }
    }

    const overduePlots = this.plots.getOverduePlots(chapter);
    if (overduePlots.length > 0) {
      plotIssues.push(`${overduePlots.length} overdue plots`);
      for (const plot of overduePlots) {
        issues.push({
          system: 'plots',
          severity: 'high',
          type: 'overdue_plot',
          description: `Plot "${plot.name}" past expected end chapter`,
          recommendation: 'Resolve this plot or update expected end',
          relatedIds: [plot.id]
        });
      }
    }

    const plotHealth: SystemHealth = {
      system: 'plots',
      status: overduePlots.length > 2 ? 'critical' : plotIssues.length > 0 ? 'warning' : 'healthy',
      score: Math.max(0, 100 - dormantPlots.length * 5 - overduePlots.length * 15),
      issues: plotIssues
    };

    // Tension system health
    const tensionStats = this.tension.getStats();
    const tensionIssues: string[] = [];

    const currentTension = this.tension.calculateCurrentTension(chapter);
    if (currentTension >= TensionLevel.OVERWHELMING) {
      tensionIssues.push('Tension at overwhelming levels - readers may burn out');
      recommendations.push('Add relief moments or resolve some tension sources');
    } else if (currentTension <= TensionLevel.RELAXED && chapter > 10) {
      tensionIssues.push('Tension very low - consider adding conflict');
    }

    const approachingDeadlines = this.tension.getApproachingDeadlines(chapter, 5);
    if (approachingDeadlines.length > 3) {
      tensionIssues.push('Multiple deadlines approaching simultaneously');
      recommendations.push('Consider staggering deadline resolutions');
    }

    const tensionHealth: SystemHealth = {
      system: 'tension',
      status: tensionIssues.length > 2 ? 'critical' : tensionIssues.length > 0 ? 'warning' : 'healthy',
      score: Math.max(0, 100 - tensionIssues.length * 15),
      issues: tensionIssues
    };

    // Foreshadowing system health
    const fsStats = this.foreshadowing.getStats();
    const fsIssues: string[] = [];

    const overdueSetups = this.foreshadowing.getOverdueSetups(chapter);
    if (overdueSetups.length > 0) {
      fsIssues.push(`${overdueSetups.length} setups overdue for payoff`);
      for (const setup of overdueSetups) {
        issues.push({
          system: 'foreshadowing',
          severity: 'high',
          type: 'overdue_setup',
          description: `"${setup.name}" needs payoff`,
          recommendation: 'Deliver payoff or add reminder',
          relatedIds: [setup.id]
        });
      }
    }

    const overdueGuns = this.foreshadowing.getOverdueGuns(chapter);
    if (overdueGuns.length > 0) {
      fsIssues.push(`${overdueGuns.length} Chekhov's guns unfired past deadline`);
      for (const gun of overdueGuns) {
        issues.push({
          system: 'foreshadowing',
          severity: 'critical',
          type: 'unfired_gun',
          description: `Chekhov's gun "${gun.name}" must fire`,
          recommendation: 'Fire this gun or remove it from the story',
          relatedIds: [gun.id]
        });
      }
    }

    const foreshadowingHealth: SystemHealth = {
      system: 'foreshadowing',
      status: overdueGuns.length > 0 ? 'critical' : fsIssues.length > 0 ? 'warning' : 'healthy',
      score: Math.max(0, 100 - overdueSetups.length * 10 - overdueGuns.length * 25),
      issues: fsIssues
    };

    // Calculate overall health
    const scores = [
      characterHealth.score,
      plotHealth.score,
      tensionHealth.score,
      foreshadowingHealth.score
    ];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    let overallHealth: ProjectDiagnostic['overallHealth'] = 'healthy';
    if (avgScore < 50 || issues.some(i => i.severity === 'critical')) {
      overallHealth = 'critical';
    } else if (avgScore < 75 || issues.some(i => i.severity === 'high')) {
      overallHealth = 'warning';
    }

    // Build statistics
    const stats: ProjectStatistics = {
      totalCharacters: charStats.totalCharacters,
      livingCharacters: charStats.livingCharacters,
      charactersWithArcs: charactersWithArcs.size,
      averageArcsPerCharacter: charStats.totalCharacters > 0
        ? charStats.totalArcs / charStats.totalCharacters
        : 0,
      totalPlots: plotStats.totalPlots,
      activePlots: plotStats.byStatus['active'] || 0,
      completedPlots: plotStats.byStatus['completed'] || 0,
      dormantPlots: dormantPlots.length,
      currentTension,
      highestStakes: this.tension.getHighestActiveStakes(),
      activeDeadlines: tensionStats.activeDeadlines,
      pendingSetups: fsStats.pendingSetups,
      overduePayoffs: overdueSetups.length,
      unfiredGuns: fsStats.unfiredGuns,
      totalBooks: this.series.getStats().totalBooks,
      totalArcs: this.series.getStats().totalCharacterArcs,
      chaptersWritten: chapter
    };

    return {
      timestamp: new Date(),
      currentChapter: chapter,
      overallHealth,
      healthScore: Math.round(avgScore),
      characterHealth,
      plotHealth,
      tensionHealth,
      foreshadowingHealth,
      issues,
      recommendations,
      stats
    };
  }

  /**
   * Generate diagnostic report as markdown
   */
  generateDiagnosticReport(): string {
    const diagnostic = this.runDiagnostic();

    let report = `# Project Diagnostic Report\n\n`;
    report += `**Project:** ${this.metadata.name}\n`;
    report += `**Author:** ${this.metadata.author}\n`;
    report += `**Current Chapter:** ${diagnostic.currentChapter}\n`;
    report += `**Generated:** ${diagnostic.timestamp.toISOString()}\n\n`;

    // Overall health
    const healthEmoji = diagnostic.overallHealth === 'healthy' ? '✅' :
                        diagnostic.overallHealth === 'warning' ? '⚠️' : '🔴';
    report += `## Overall Health: ${healthEmoji} ${diagnostic.overallHealth.toUpperCase()} (${diagnostic.healthScore}/100)\n\n`;

    // System health summary
    report += `## System Health\n\n`;
    for (const health of [diagnostic.characterHealth, diagnostic.plotHealth, diagnostic.tensionHealth, diagnostic.foreshadowingHealth]) {
      const emoji = health.status === 'healthy' ? '✅' : health.status === 'warning' ? '⚠️' : '🔴';
      report += `### ${emoji} ${health.system.charAt(0).toUpperCase() + health.system.slice(1)} (${health.score}/100)\n`;
      if (health.issues.length > 0) {
        for (const issue of health.issues) {
          report += `- ${issue}\n`;
        }
      } else {
        report += `- No issues detected\n`;
      }
      report += '\n';
    }

    // Issues
    if (diagnostic.issues.length > 0) {
      report += `## Issues Found (${diagnostic.issues.length})\n\n`;

      const critical = diagnostic.issues.filter(i => i.severity === 'critical');
      const high = diagnostic.issues.filter(i => i.severity === 'high');
      const medium = diagnostic.issues.filter(i => i.severity === 'medium');
      const low = diagnostic.issues.filter(i => i.severity === 'low');

      if (critical.length > 0) {
        report += `### 🔴 Critical (${critical.length})\n`;
        for (const issue of critical) {
          report += `- **[${issue.system}]** ${issue.description}\n`;
          report += `  - Recommendation: ${issue.recommendation}\n`;
        }
        report += '\n';
      }

      if (high.length > 0) {
        report += `### 🟠 High (${high.length})\n`;
        for (const issue of high) {
          report += `- **[${issue.system}]** ${issue.description}\n`;
          report += `  - Recommendation: ${issue.recommendation}\n`;
        }
        report += '\n';
      }

      if (medium.length > 0) {
        report += `### 🟡 Medium (${medium.length})\n`;
        for (const issue of medium) {
          report += `- **[${issue.system}]** ${issue.description}\n`;
        }
        report += '\n';
      }

      if (low.length > 0) {
        report += `### 🟢 Low (${low.length})\n`;
        for (const issue of low) {
          report += `- **[${issue.system}]** ${issue.description}\n`;
        }
        report += '\n';
      }
    }

    // Statistics
    report += `## Statistics\n\n`;
    report += `### Characters\n`;
    report += `- Total: ${diagnostic.stats.totalCharacters}\n`;
    report += `- Living: ${diagnostic.stats.livingCharacters}\n`;
    report += `- With arcs: ${diagnostic.stats.charactersWithArcs}\n`;
    report += `- Avg arcs/character: ${diagnostic.stats.averageArcsPerCharacter.toFixed(1)}\n\n`;

    report += `### Plots\n`;
    report += `- Total: ${diagnostic.stats.totalPlots}\n`;
    report += `- Active: ${diagnostic.stats.activePlots}\n`;
    report += `- Completed: ${diagnostic.stats.completedPlots}\n`;
    report += `- Dormant: ${diagnostic.stats.dormantPlots}\n\n`;

    report += `### Tension\n`;
    report += `- Current level: ${TensionLevel[diagnostic.stats.currentTension]}\n`;
    report += `- Highest stakes: ${StakesLevel[diagnostic.stats.highestStakes]}\n`;
    report += `- Active deadlines: ${diagnostic.stats.activeDeadlines}\n\n`;

    report += `### Foreshadowing\n`;
    report += `- Pending setups: ${diagnostic.stats.pendingSetups}\n`;
    report += `- Overdue payoffs: ${diagnostic.stats.overduePayoffs}\n`;
    report += `- Unfired guns: ${diagnostic.stats.unfiredGuns}\n\n`;

    // Recommendations
    if (diagnostic.recommendations.length > 0) {
      report += `## Recommendations\n\n`;
      for (const rec of diagnostic.recommendations) {
        report += `- ${rec}\n`;
      }
    }

    return report;
  }

  // ===========================================================================
  // EVENT SYSTEM
  // ===========================================================================

  /**
   * Emit a project event
   */
  private emitEvent(data: Omit<ProjectEvent, 'id' | 'timestamp'>): void {
    const event: ProjectEvent = {
      id: uuidv4(),
      timestamp: new Date(),
      ...data
    };

    this.eventLog.push(event);

    // Notify listeners
    const listeners = this.eventListeners.get(data.type) || [];
    for (const listener of listeners) {
      listener(event);
    }
  }

  /**
   * Subscribe to project events
   */
  on(eventType: ProjectEventType, callback: (event: ProjectEvent) => void): () => void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(callback);
    this.eventListeners.set(eventType, listeners);

    // Return unsubscribe function
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  /**
   * Get event history
   */
  getEventHistory(filter?: { type?: ProjectEventType; fromChapter?: number; toChapter?: number }): ProjectEvent[] {
    let events = this.eventLog;

    if (filter?.type) {
      events = events.filter(e => e.type === filter.type);
    }
    if (filter?.fromChapter !== undefined) {
      events = events.filter(e => e.chapter >= filter.fromChapter!);
    }
    if (filter?.toChapter !== undefined) {
      events = events.filter(e => e.chapter <= filter.toChapter!);
    }

    return events;
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Export entire project to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      version: '1.0.0',
      metadata: {
        ...this.metadata,
        createdAt: this.metadata.createdAt.toISOString(),
        updatedAt: this.metadata.updatedAt.toISOString()
      },
      characters: JSON.parse(this.characters.exportToJSON()),
      plots: JSON.parse(this.plots.exportToJSON()),
      tension: JSON.parse(this.tension.exportToJSON()),
      foreshadowing: JSON.parse(this.foreshadowing.exportToJSON()),
      series: JSON.parse(this.series.exportToJSON()),
      hallucination: JSON.parse(this.hallucination.exportToJSON()),
      eventLog: this.eventLog.map(e => ({
        ...e,
        timestamp: e.timestamp.toISOString()
      }))
    }, null, 2);
  }

  /**
   * Import project from JSON
   */
  static importFromJSON(json: string): EpicFictionProject {
    const data = JSON.parse(json);

    const project = new EpicFictionProject(data.metadata.name, data.metadata.author);

    // Restore metadata
    project.metadata = {
      ...data.metadata,
      createdAt: new Date(data.metadata.createdAt),
      updatedAt: new Date(data.metadata.updatedAt)
    };

    // Restore engines
    if (data.characters) {
      project.characters.importFromJSON(JSON.stringify(data.characters));
    }
    if (data.plots) {
      project.plots.importFromJSON(JSON.stringify(data.plots));
    }
    if (data.tension) {
      project.tension.importFromJSON(JSON.stringify(data.tension));
    }
    if (data.foreshadowing) {
      project.foreshadowing.importFromJSON(JSON.stringify(data.foreshadowing));
    }
    if (data.series) {
      project.series.importFromJSON(JSON.stringify(data.series));
    }
    if (data.hallucination) {
      project.hallucination.importFromJSON(JSON.stringify(data.hallucination));
    }

    // Restore event log
    if (data.eventLog) {
      project.eventLog = data.eventLog.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      }));
    }

    return project;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.characters.clear();
    this.plots.clear();
    this.tension.clear();
    this.foreshadowing.clear();
    this.series.clear();
    this.hallucination.clear();
    this.eventLog = [];
  }
}

// Re-export classes (runtime values)
export {
  CharacterArcSystem,
  SubplotManager,
  TensionTracker,
  ForeshadowingSystem,
  SeriesManager,
  CreativeHallucinationEngine
};

// Re-export enums (runtime values)
export {
  CharacterRole,
  ArcType,
  ArcPhase,
  SkillCategory,
  GrowthTrigger,
  PlotLevel,
  PlotCategory,
  PlotStatus,
  PlotBeatType,
  StakesLevel,
  TensionLevel,
  TensionSource,
  DeadlineType,
  ForeshadowingType,
  SubtletyLevel,
  TruthLayer,
  DreamLogicType,
  HallucinationType,
  BookStatus
};

// Re-export types/interfaces
export type {
  Character,
  CharacterArc,
  Subplot,
  Stakes,
  Deadline,
  ForeshadowingSetup,
  ChekhovsGun,
  Prophecy,
  DivergencePoint,
  SeriesInfo,
  BookInfo
};

export default EpicFictionProject;
