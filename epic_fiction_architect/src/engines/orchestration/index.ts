/**
 * Epic Fiction Architect - Orchestration Engine
 *
 * Coordinates the complex interplay of scenes, plot threads, and reader
 * knowledge across a massive narrative. Ensures:
 * - Scenes are properly sequenced with dependencies
 * - Plot threads are tracked and don't go forgotten
 * - Reader perspective is managed separately from character knowledge
 *
 * No character exists in a bubble - this engine tracks the ripples.
 */

// =============================================================================
// SCENE ORCHESTRATOR
// =============================================================================

export {
  // Enums
  SceneType,
  SceneStatus,
  DependencyType,
  POVType,
  EmotionalTone,

  // Interfaces
  type PlannedScene,
  type SceneBeat,
  type SceneDependency,
  type PlannedChapter,
  type CharacterAvailability,
  type SchedulingConflict,
  type OrchestratorConfig,

  // Class
  SceneOrchestrator,

  // Default instance
  sceneOrchestrator
} from './scene-orchestrator';

// =============================================================================
// PLOT THREAD MANAGER
// =============================================================================

export {
  // Enums
  PlotThreadType,
  ThreadStatus,
  ThreadPriority,
  ThreadInteractionType,

  // Interfaces
  type PlotThread,
  type ThreadMilestone,
  type ThreadInteraction,
  type ThreadResolution,
  type ThreadHealth,
  type WeavingPattern,
  type ThreadManagerConfig,

  // Class
  PlotThreadManager,

  // Default instance
  plotThreadManager
} from './plot-thread-manager';

// =============================================================================
// READER PERSPECTIVE TRACKER
// =============================================================================

export {
  // Enums
  ReaderKnowledgeType,
  DeliveryMethod,
  ReaderConfidence,
  DramaticRelationship,

  // Interfaces
  type ReaderKnowledge,
  type DramaticKnowledgeLink,
  type TrackedMystery,
  type DramaticIrony,
  type ReaderStateSnapshot,
  type ReaderTrackerConfig,

  // Class
  ReaderPerspectiveTracker,

  // Default instance
  readerPerspectiveTracker
} from './reader-perspective-tracker';

// =============================================================================
// INTEGRATED ORCHESTRATION SUITE
// =============================================================================

import { SceneOrchestrator, PlannedScene } from './scene-orchestrator';
import { PlotThreadManager, PlotThread } from './plot-thread-manager';
import { ReaderPerspectiveTracker, ReaderKnowledgeType, DeliveryMethod } from './reader-perspective-tracker';

/**
 * Integrated Orchestration Suite
 *
 * Combines scene planning, plot thread management, and reader knowledge
 * tracking into a unified system for narrative orchestration.
 */
export class OrchestrationSuite {
  public readonly scenes: SceneOrchestrator;
  public readonly threads: PlotThreadManager;
  public readonly reader: ReaderPerspectiveTracker;

  constructor() {
    this.scenes = new SceneOrchestrator();
    this.threads = new PlotThreadManager();
    this.reader = new ReaderPerspectiveTracker();
  }

  /**
   * Create a scene linked to plot threads
   */
  createScene(
    sceneData: Parameters<SceneOrchestrator['createScene']>[0],
    options?: {
      advancesThreads?: string[];
      deliversKnowledge?: Array<{
        type: ReaderKnowledgeType;
        subject: string;
        content: string;
        deliveryMethod: DeliveryMethod;
        unknownToCharacters?: string[];
      }>;
    }
  ): PlannedScene {
    const scene = this.scenes.createScene(sceneData);

    // Record thread activity
    if (options?.advancesThreads) {
      for (const threadId of options.advancesThreads) {
        if (scene.chapterNumber) {
          this.threads.recordActivity(threadId, scene.chapterNumber);
        }
      }
      scene.plotThreads = options.advancesThreads;
    }

    // Record knowledge delivery
    if (options?.deliversKnowledge && scene.chapterNumber) {
      for (const knowledge of options.deliversKnowledge) {
        this.reader.deliverKnowledge({
          ...knowledge,
          shortDescription: knowledge.content.substring(0, 100),
          deliveredChapter: scene.chapterNumber,
          deliveredSceneId: scene.id,
          deliveryContext: `Scene: ${scene.title}`,
          unknownToCharacters: knowledge.unknownToCharacters
        });
      }
    }

    return scene;
  }

  /**
   * Get comprehensive status for a chapter
   */
  getChapterStatus(chapterNumber: number): {
    scenes: PlannedScene[];
    activeThreads: PlotThread[];
    knowledgeDelivered: number;
    dramaticIronies: number;
    conflicts: ReturnType<SceneOrchestrator['detectConflicts']>;
    threadHealth: ReturnType<PlotThreadManager['getAllThreadHealth']>;
  } {
    const chapterId = Array.from(
      (this.scenes as SceneOrchestrator)['chapters'].values()
    ).find(c => c.number === chapterNumber)?.id;

    const scenes = chapterId
      ? this.scenes.getScenesInChapter(chapterId)
      : [];

    const activeThreads = this.threads.getThreadsInChapter(chapterNumber);

    const readerState = this.reader.getReaderStateAtChapter(chapterNumber);

    return {
      scenes,
      activeThreads,
      knowledgeDelivered: readerState.knownFacts.filter(
        k => k.deliveredChapter === chapterNumber
      ).length,
      dramaticIronies: readerState.activeDramaticIronies.length,
      conflicts: this.scenes.detectConflicts(),
      threadHealth: this.threads.getAllThreadHealth(chapterNumber)
    };
  }

  /**
   * Find gaps in coverage
   */
  findCoverageGaps(startChapter: number, endChapter: number): {
    neglectedThreads: PlotThread[];
    chaptersWithoutScenes: number[];
    longDramaticIronies: Array<{ id: string; name: string; duration: number }>;
    openMysteriesWithoutClues: Array<{ id: string; name: string; chaptersSinceClue: number }>;
  } {
    // Find neglected threads
    const weaving = this.threads.analyzeWeavingPattern(startChapter, endChapter);
    const neglectedThreads: PlotThread[] = [];

    for (const warning of weaving.dormancyWarnings) {
      const thread = this.threads.getThread(warning.threadId);
      if (thread && warning.duration > 50) {
        neglectedThreads.push(thread);
      }
    }

    // Find chapters without scenes
    const chaptersWithoutScenes: number[] = [];
    for (let ch = startChapter; ch <= endChapter; ch++) {
      const chapter = Array.from(
        (this.scenes as SceneOrchestrator)['chapters'].values()
      ).find(c => c.number === ch);

      if (!chapter || chapter.sceneIds.length === 0) {
        chaptersWithoutScenes.push(ch);
      }
    }

    // Find long-running dramatic ironies
    const longDramaticIronies = this.reader.getActiveDramaticIronies()
      .filter(di => endChapter - di.establishedChapter > 100)
      .map(di => ({
        id: di.id,
        name: di.name,
        duration: endChapter - di.establishedChapter
      }));

    // Find open mysteries without recent clues
    const openMysteriesWithoutClues = this.reader.getOpenMysteries()
      .filter(m => {
        const lastClue = m.clueDistribution.length > 0
          ? Math.max(...m.clueDistribution.map(c => c.chapter))
          : m.posedChapter;
        return endChapter - lastClue > 100;
      })
      .map(m => {
        const lastClue = m.clueDistribution.length > 0
          ? Math.max(...m.clueDistribution.map(c => c.chapter))
          : m.posedChapter;
        return {
          id: m.id,
          name: m.name,
          chaptersSinceClue: endChapter - lastClue
        };
      });

    return {
      neglectedThreads,
      chaptersWithoutScenes,
      longDramaticIronies,
      openMysteriesWithoutClues
    };
  }

  /**
   * Generate comprehensive orchestration report
   */
  generateReport(currentChapter: number): string {
    let report = `# Orchestration Report - Chapter ${currentChapter}\n\n`;

    // Scene stats
    const sceneStats = this.scenes.getStats();
    report += `## Scene Planning\n\n`;
    report += `- **Total Scenes:** ${sceneStats.totalScenes}\n`;
    report += `- **Total Chapters:** ${sceneStats.totalChapters}\n`;
    report += `- **Unassigned Scenes:** ${sceneStats.unassignedScenes}\n`;
    report += `- **Blocked Scenes:** ${sceneStats.blockedScenes}\n`;
    report += `- **Scheduling Conflicts:** ${sceneStats.totalConflicts}\n\n`;

    // Thread stats
    const threadStats = this.threads.getStats();
    report += `## Plot Threads\n\n`;
    report += `- **Total Threads:** ${threadStats.totalThreads}\n`;
    report += `- **Active:** ${threadStats.activeThreads}\n`;
    report += `- **Resolved:** ${threadStats.resolvedThreads}\n`;
    report += `- **Average Progress:** ${threadStats.avgProgressPercentage.toFixed(1)}%\n\n`;

    // Thread health
    const healthIssues = this.threads.getAllThreadHealth(currentChapter)
      .filter(h => h.health === 'critical' || h.health === 'concerning');

    if (healthIssues.length > 0) {
      report += `### Threads Needing Attention\n\n`;
      for (const h of healthIssues) {
        report += `- **${h.threadName}** (${h.health}): ${h.issues.join(', ')}\n`;
      }
      report += `\n`;
    }

    // Reader knowledge stats
    const readerStats = this.reader.getStats();
    report += `## Reader Knowledge\n\n`;
    report += `- **Total Knowledge Pieces:** ${readerStats.totalKnowledge}\n`;
    report += `- **Active Dramatic Ironies:** ${readerStats.activeDramaticIronies}\n`;
    report += `- **Open Mysteries:** ${readerStats.openMysteries}\n`;
    report += `- **Truthful Information:** ${readerStats.truthfulPercentage.toFixed(1)}%\n\n`;

    // Coverage gaps
    const gaps = this.findCoverageGaps(
      Math.max(1, currentChapter - 100),
      currentChapter
    );

    if (gaps.neglectedThreads.length > 0 ||
        gaps.longDramaticIronies.length > 0 ||
        gaps.openMysteriesWithoutClues.length > 0) {
      report += `## Coverage Issues\n\n`;

      if (gaps.neglectedThreads.length > 0) {
        report += `### Neglected Plot Threads\n`;
        for (const thread of gaps.neglectedThreads) {
          report += `- ${thread.name} (${thread.chaptersSinceLast} chapters dormant)\n`;
        }
        report += `\n`;
      }

      if (gaps.longDramaticIronies.length > 0) {
        report += `### Long-Running Dramatic Ironies\n`;
        for (const di of gaps.longDramaticIronies) {
          report += `- ${di.name} (${di.duration} chapters)\n`;
        }
        report += `\n`;
      }

      if (gaps.openMysteriesWithoutClues.length > 0) {
        report += `### Mysteries Without Recent Clues\n`;
        for (const m of gaps.openMysteriesWithoutClues) {
          report += `- ${m.name} (${m.chaptersSinceClue} chapters since last clue)\n`;
        }
        report += `\n`;
      }
    }

    return report;
  }

  /**
   * Export all data
   */
  exportToJSON(): string {
    return JSON.stringify({
      scenes: JSON.parse(this.scenes.exportToJSON()),
      threads: JSON.parse(this.threads.exportToJSON()),
      reader: JSON.parse(this.reader.exportToJSON()),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import all data
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.scenes) {
      this.scenes.importFromJSON(JSON.stringify(data.scenes));
    }
    if (data.threads) {
      this.threads.importFromJSON(JSON.stringify(data.threads));
    }
    if (data.reader) {
      this.reader.importFromJSON(JSON.stringify(data.reader));
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.scenes.clear();
    this.threads.clear();
    this.reader.clear();
  }
}

// Default instance
export const orchestrationSuite = new OrchestrationSuite();

export default OrchestrationSuite;
