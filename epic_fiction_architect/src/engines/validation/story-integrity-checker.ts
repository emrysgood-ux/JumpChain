/**
 * Story Integrity Checker
 *
 * High-level validation for plot coherence, character arcs, foreshadowing/payoff,
 * thematic consistency, and narrative structure across massive stories.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ChapterManager,
  Chapter,
  PlotThread,
  StoryArc,
  ValidationError,
  ErrorCategory,
  ErrorSeverity,
  EntityMention
} from './chapter-manager';

// ============================================================================
// ENUMS
// ============================================================================

export enum CharacterArcType {
  POSITIVE = 'positive',       // Character improves
  NEGATIVE = 'negative',       // Character degrades
  FLAT = 'flat',               // Character stays same (tests others)
  CORRUPTION = 'corruption',   // Good to bad
  REDEMPTION = 'redemption',   // Bad to good
  DISILLUSIONMENT = 'disillusionment',
  EDUCATION = 'education',
  MATURATION = 'maturation',
  FALL = 'fall',
  RISE = 'rise',
  CIRCULAR = 'circular'        // Returns to start
}

export enum NarrativeStructure {
  THREE_ACT = 'three_act',
  FIVE_ACT = 'five_act',
  SEVEN_POINT = 'seven_point',
  HEROES_JOURNEY = 'heroes_journey',
  SAVE_THE_CAT = 'save_the_cat',
  KISHŌTENKETSU = 'kishotenketsu',
  FREYTAG = 'freytag',
  EPISODIC = 'episodic',
  IN_MEDIAS_RES = 'in_medias_res',
  FRAME_STORY = 'frame_story',
  PARALLEL = 'parallel',
  CUSTOM = 'custom'
}

export enum PlotPointType {
  HOOK = 'hook',
  INCITING_INCIDENT = 'inciting_incident',
  FIRST_PLOT_POINT = 'first_plot_point',
  FIRST_PINCH = 'first_pinch',
  MIDPOINT = 'midpoint',
  SECOND_PINCH = 'second_pinch',
  SECOND_PLOT_POINT = 'second_plot_point',
  CLIMAX = 'climax',
  RESOLUTION = 'resolution',
  SETUP = 'setup',
  PAYOFF = 'payoff',
  TWIST = 'twist',
  REVELATION = 'revelation',
  REVERSAL = 'reversal',
  DARK_NIGHT = 'dark_night',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  FALSE_VICTORY = 'false_victory',
  FALSE_DEFEAT = 'false_defeat'
}

export enum ThemeType {
  MAIN = 'main',
  SECONDARY = 'secondary',
  MOTIF = 'motif',
  SYMBOL = 'symbol'
}

export enum IntegrityStatus {
  EXCELLENT = 'excellent',     // No issues
  GOOD = 'good',               // Minor issues
  FAIR = 'fair',               // Some issues
  POOR = 'poor',               // Many issues
  CRITICAL = 'critical'        // Major structural problems
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface CharacterArc {
  id: string;
  characterId: string;
  characterName: string;
  arcType: CharacterArcType;
  startChapter: number;
  endChapter?: number;
  status: 'in_progress' | 'completed' | 'abandoned';

  // Arc progression
  startingPoint: string;       // Character's initial state
  endingPoint?: string;        // Character's final state
  wantVsNeed?: {
    want: string;              // What they think they want
    need: string;              // What they actually need
  };

  // Key moments
  keyMoments: {
    chapter: number;
    type: 'turning_point' | 'test' | 'growth' | 'setback' | 'revelation' | 'decision';
    description: string;
  }[];

  // Tracking
  progressPercentage: number;
  notes?: string;
}

export interface Foreshadowing {
  id: string;
  description: string;
  setupChapter: number;
  payoffChapter?: number;
  type: 'dialogue' | 'object' | 'event' | 'character' | 'symbol' | 'prophecy';
  subtlety: 'obvious' | 'moderate' | 'subtle' | 'very_subtle';
  status: 'planted' | 'partially_paid' | 'fully_paid' | 'abandoned';
  relatedPlotThread?: string;
  notes?: string;
}

export interface PlotPoint {
  id: string;
  type: PlotPointType;
  chapter: number;
  description: string;
  characters: string[];
  relatedArcs: string[];
  impact: 'minor' | 'moderate' | 'major' | 'critical';
  achieved: boolean;
}

export interface Theme {
  id: string;
  name: string;
  type: ThemeType;
  description: string;
  introducedChapter: number;
  chapters: number[];          // Chapters where theme appears
  symbols?: string[];
  relatedCharacters?: string[];
  exploration: string;
  resolution?: string;
}

export interface NarrativeBeats {
  structure: NarrativeStructure;
  totalChapters: number;
  beats: {
    name: string;
    expectedPosition: number;  // Percentage through story
    actualChapter?: number;
    achieved: boolean;
    notes?: string;
  }[];
}

export interface StoryHealthReport {
  id: string;
  timestamp: Date;
  status: IntegrityStatus;
  score: number;              // 0-100

  // Plot Analysis
  plotThreadAnalysis: {
    total: number;
    resolved: number;
    active: number;
    neglected: number;
    abandoned: number;
    dangling: PlotThread[];
  };

  // Character Arc Analysis
  characterArcAnalysis: {
    total: number;
    completed: number;
    inProgress: number;
    abandoned: number;
    underdeveloped: CharacterArc[];
  };

  // Foreshadowing Analysis
  foreshadowingAnalysis: {
    total: number;
    paidOff: number;
    pending: number;
    orphaned: Foreshadowing[];
  };

  // Pacing Analysis
  pacingAnalysis: {
    averagePacing: number;
    slowestArc: { arcId: string; pacing: number };
    fastestArc: { arcId: string; pacing: number };
    pacingIssues: string[];
  };

  // Theme Analysis
  themeAnalysis: {
    themes: Theme[];
    themeConsistency: number;  // 0-100
    underexploredThemes: string[];
  };

  // Structural Analysis
  structuralAnalysis: {
    structure: NarrativeStructure;
    beatsMet: number;
    totalBeats: number;
    missingBeats: string[];
  };

  // Issues
  issues: {
    category: string;
    severity: ErrorSeverity;
    description: string;
    suggestion: string;
  }[];

  summary: string;
}

// ============================================================================
// STORY INTEGRITY CHECKER CLASS
// ============================================================================

export class StoryIntegrityChecker {
  private characterArcs: Map<string, CharacterArc> = new Map();
  private foreshadowing: Map<string, Foreshadowing> = new Map();
  private plotPoints: Map<string, PlotPoint> = new Map();
  private themes: Map<string, Theme> = new Map();
  private narrativeBeats: NarrativeBeats | null = null;
  private healthReports: StoryHealthReport[] = [];

  constructor() {}

  // ==========================================================================
  // CHARACTER ARC MANAGEMENT
  // ==========================================================================

  createCharacterArc(data: Partial<CharacterArc> & {
    characterId: string;
    characterName: string;
    arcType: CharacterArcType;
    startChapter: number;
  }): CharacterArc {
    const arc: CharacterArc = {
      id: uuidv4(),
      characterId: data.characterId,
      characterName: data.characterName,
      arcType: data.arcType,
      startChapter: data.startChapter,
      endChapter: data.endChapter,
      status: 'in_progress',
      startingPoint: data.startingPoint || '',
      endingPoint: data.endingPoint,
      wantVsNeed: data.wantVsNeed,
      keyMoments: data.keyMoments || [],
      progressPercentage: 0,
      notes: data.notes
    };

    this.characterArcs.set(arc.id, arc);
    return arc;
  }

  updateCharacterArc(arcId: string, updates: Partial<CharacterArc>): CharacterArc | undefined {
    const arc = this.characterArcs.get(arcId);
    if (!arc) return undefined;

    const updated = { ...arc, ...updates };
    this.characterArcs.set(arcId, updated);
    return updated;
  }

  addKeyMoment(arcId: string, moment: CharacterArc['keyMoments'][0]): void {
    const arc = this.characterArcs.get(arcId);
    if (!arc) return;

    arc.keyMoments.push(moment);
    arc.keyMoments.sort((a, b) => a.chapter - b.chapter);

    // Update progress based on arc type patterns
    this.updateArcProgress(arcId);
  }

  private updateArcProgress(arcId: string): void {
    const arc = this.characterArcs.get(arcId);
    if (!arc || !arc.endChapter) return;

    const totalSpan = arc.endChapter - arc.startChapter;
    const currentSpan = arc.keyMoments.length > 0
      ? arc.keyMoments[arc.keyMoments.length - 1].chapter - arc.startChapter
      : 0;

    arc.progressPercentage = Math.min(100, Math.round((currentSpan / totalSpan) * 100));
  }

  getCharacterArcs(): CharacterArc[] {
    return Array.from(this.characterArcs.values());
  }

  getCharacterArcsByCharacter(characterId: string): CharacterArc[] {
    return this.getCharacterArcs().filter(a => a.characterId === characterId);
  }

  // ==========================================================================
  // FORESHADOWING MANAGEMENT
  // ==========================================================================

  plantForeshadowing(data: Partial<Foreshadowing> & {
    description: string;
    setupChapter: number;
  }): Foreshadowing {
    const foreshadow: Foreshadowing = {
      id: uuidv4(),
      description: data.description,
      setupChapter: data.setupChapter,
      payoffChapter: data.payoffChapter,
      type: data.type || 'event',
      subtlety: data.subtlety || 'moderate',
      status: 'planted',
      relatedPlotThread: data.relatedPlotThread,
      notes: data.notes
    };

    this.foreshadowing.set(foreshadow.id, foreshadow);
    return foreshadow;
  }

  payoffForeshadowing(foreshadowId: string, payoffChapter: number): Foreshadowing | undefined {
    const foreshadow = this.foreshadowing.get(foreshadowId);
    if (!foreshadow) return undefined;

    foreshadow.payoffChapter = payoffChapter;
    foreshadow.status = 'fully_paid';
    return foreshadow;
  }

  getForeshadowing(): Foreshadowing[] {
    return Array.from(this.foreshadowing.values());
  }

  getUnpaidForeshadowing(): Foreshadowing[] {
    return this.getForeshadowing().filter(f => f.status === 'planted');
  }

  // ==========================================================================
  // PLOT POINT MANAGEMENT
  // ==========================================================================

  addPlotPoint(data: Partial<PlotPoint> & {
    type: PlotPointType;
    chapter: number;
    description: string;
  }): PlotPoint {
    const point: PlotPoint = {
      id: uuidv4(),
      type: data.type,
      chapter: data.chapter,
      description: data.description,
      characters: data.characters || [],
      relatedArcs: data.relatedArcs || [],
      impact: data.impact || 'moderate',
      achieved: data.achieved ?? true
    };

    this.plotPoints.set(point.id, point);
    return point;
  }

  getPlotPoints(): PlotPoint[] {
    return Array.from(this.plotPoints.values()).sort((a, b) => a.chapter - b.chapter);
  }

  getPlotPointsByType(type: PlotPointType): PlotPoint[] {
    return this.getPlotPoints().filter(p => p.type === type);
  }

  // ==========================================================================
  // THEME MANAGEMENT
  // ==========================================================================

  addTheme(data: Partial<Theme> & { name: string; introducedChapter: number }): Theme {
    const theme: Theme = {
      id: uuidv4(),
      name: data.name,
      type: data.type || ThemeType.SECONDARY,
      description: data.description || '',
      introducedChapter: data.introducedChapter,
      chapters: data.chapters || [data.introducedChapter],
      symbols: data.symbols,
      relatedCharacters: data.relatedCharacters,
      exploration: data.exploration || '',
      resolution: data.resolution
    };

    this.themes.set(theme.id, theme);
    return theme;
  }

  trackThemeAppearance(themeId: string, chapter: number): void {
    const theme = this.themes.get(themeId);
    if (!theme) return;

    if (!theme.chapters.includes(chapter)) {
      theme.chapters.push(chapter);
      theme.chapters.sort((a, b) => a - b);
    }
  }

  getThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  // ==========================================================================
  // NARRATIVE STRUCTURE
  // ==========================================================================

  setNarrativeStructure(structure: NarrativeStructure, totalChapters: number): NarrativeBeats {
    const beats = this.getBeatsForStructure(structure, totalChapters);

    this.narrativeBeats = {
      structure,
      totalChapters,
      beats
    };

    return this.narrativeBeats;
  }

  private getBeatsForStructure(structure: NarrativeStructure, totalChapters: number): NarrativeBeats['beats'] {
    const structures: Record<NarrativeStructure, { name: string; position: number }[]> = {
      [NarrativeStructure.THREE_ACT]: [
        { name: 'Setup', position: 0 },
        { name: 'Inciting Incident', position: 10 },
        { name: 'First Act Turn', position: 25 },
        { name: 'Rising Action', position: 50 },
        { name: 'Midpoint', position: 50 },
        { name: 'Second Act Turn', position: 75 },
        { name: 'Climax', position: 90 },
        { name: 'Resolution', position: 95 }
      ],
      [NarrativeStructure.HEROES_JOURNEY]: [
        { name: 'Ordinary World', position: 0 },
        { name: 'Call to Adventure', position: 8 },
        { name: 'Refusal of Call', position: 12 },
        { name: 'Meeting the Mentor', position: 17 },
        { name: 'Crossing Threshold', position: 25 },
        { name: 'Tests, Allies, Enemies', position: 35 },
        { name: 'Approach to Inmost Cave', position: 50 },
        { name: 'Ordeal', position: 60 },
        { name: 'Reward', position: 70 },
        { name: 'Road Back', position: 80 },
        { name: 'Resurrection', position: 90 },
        { name: 'Return with Elixir', position: 95 }
      ],
      [NarrativeStructure.SEVEN_POINT]: [
        { name: 'Hook', position: 0 },
        { name: 'Plot Turn 1', position: 15 },
        { name: 'Pinch Point 1', position: 35 },
        { name: 'Midpoint', position: 50 },
        { name: 'Pinch Point 2', position: 65 },
        { name: 'Plot Turn 2', position: 80 },
        { name: 'Resolution', position: 95 }
      ],
      [NarrativeStructure.SAVE_THE_CAT]: [
        { name: 'Opening Image', position: 0 },
        { name: 'Theme Stated', position: 5 },
        { name: 'Setup', position: 10 },
        { name: 'Catalyst', position: 12 },
        { name: 'Debate', position: 17 },
        { name: 'Break into Two', position: 25 },
        { name: 'B Story', position: 30 },
        { name: 'Fun and Games', position: 35 },
        { name: 'Midpoint', position: 50 },
        { name: 'Bad Guys Close In', position: 60 },
        { name: 'All Is Lost', position: 75 },
        { name: 'Dark Night of Soul', position: 80 },
        { name: 'Break into Three', position: 85 },
        { name: 'Finale', position: 90 },
        { name: 'Final Image', position: 99 }
      ],
      [NarrativeStructure.FIVE_ACT]: [
        { name: 'Exposition', position: 0 },
        { name: 'Rising Action', position: 20 },
        { name: 'Climax', position: 50 },
        { name: 'Falling Action', position: 70 },
        { name: 'Denouement', position: 90 }
      ],
      [NarrativeStructure.FREYTAG]: [
        { name: 'Exposition', position: 0 },
        { name: 'Rising Action', position: 25 },
        { name: 'Climax', position: 50 },
        { name: 'Falling Action', position: 75 },
        { name: 'Catastrophe', position: 90 }
      ],
      [NarrativeStructure.KISHŌTENKETSU]: [
        { name: 'Ki (Introduction)', position: 0 },
        { name: 'Shō (Development)', position: 25 },
        { name: 'Ten (Twist)', position: 50 },
        { name: 'Ketsu (Conclusion)', position: 75 }
      ],
      [NarrativeStructure.EPISODIC]: [],
      [NarrativeStructure.IN_MEDIAS_RES]: [
        { name: 'In Medias Res', position: 0 },
        { name: 'Backstory', position: 10 },
        { name: 'Present Continuation', position: 25 },
        { name: 'Climax', position: 85 },
        { name: 'Resolution', position: 95 }
      ],
      [NarrativeStructure.FRAME_STORY]: [
        { name: 'Outer Frame Start', position: 0 },
        { name: 'Inner Story Start', position: 10 },
        { name: 'Inner Story End', position: 90 },
        { name: 'Outer Frame End', position: 95 }
      ],
      [NarrativeStructure.PARALLEL]: [],
      [NarrativeStructure.CUSTOM]: []
    };

    const beats = structures[structure] || [];

    return beats.map(beat => ({
      name: beat.name,
      expectedPosition: beat.position,
      actualChapter: Math.round((beat.position / 100) * totalChapters),
      achieved: false
    }));
  }

  markBeatAchieved(beatName: string, actualChapter: number): void {
    if (!this.narrativeBeats) return;

    const beat = this.narrativeBeats.beats.find(b => b.name === beatName);
    if (beat) {
      beat.achieved = true;
      beat.actualChapter = actualChapter;
    }
  }

  getNarrativeBeats(): NarrativeBeats | null {
    return this.narrativeBeats;
  }

  // ==========================================================================
  // ANALYSIS
  // ==========================================================================

  analyzeStoryHealth(chapterManager: ChapterManager): StoryHealthReport {
    const plotAnalysis = this.analyzePlotThreads(chapterManager);
    const arcAnalysis = this.analyzeCharacterArcs(chapterManager);
    const foreshadowAnalysis = this.analyzeForeshadowing(chapterManager);
    const pacingAnalysis = this.analyzePacing(chapterManager);
    const themeAnalysis = this.analyzeThemes(chapterManager);
    const structuralAnalysis = this.analyzeStructure(chapterManager);

    const issues = this.collectIssues(
      plotAnalysis,
      arcAnalysis,
      foreshadowAnalysis,
      pacingAnalysis,
      themeAnalysis,
      structuralAnalysis
    );

    const score = this.calculateHealthScore(
      plotAnalysis,
      arcAnalysis,
      foreshadowAnalysis,
      structuralAnalysis
    );

    const status = this.determineStatus(score);

    const report: StoryHealthReport = {
      id: uuidv4(),
      timestamp: new Date(),
      status,
      score,
      plotThreadAnalysis: plotAnalysis,
      characterArcAnalysis: arcAnalysis,
      foreshadowingAnalysis: foreshadowAnalysis,
      pacingAnalysis,
      themeAnalysis,
      structuralAnalysis,
      issues,
      summary: this.generateHealthSummary(status, score, issues.length)
    };

    this.healthReports.push(report);
    return report;
  }

  private analyzePlotThreads(chapterManager: ChapterManager): StoryHealthReport['plotThreadAnalysis'] {
    const threads = chapterManager.getAllPlotThreads();
    const currentChapter = chapterManager.getTotalChapters();

    const resolved = threads.filter(t => t.status === 'resolved');
    const active = threads.filter(t => t.status !== 'resolved' && t.status !== 'abandoned');
    const abandoned = threads.filter(t => t.status === 'abandoned');
    const neglected = chapterManager.findNeglectedPlotThreads(currentChapter, 100);

    // Find dangling threads (active but near end of story)
    const dangling = active.filter(t => {
      const age = currentChapter - t.introducedChapter;
      const remainingChapters = 12008 - currentChapter; // Assuming target
      return age > 500 && remainingChapters < 100;
    });

    return {
      total: threads.length,
      resolved: resolved.length,
      active: active.length,
      neglected: neglected.length,
      abandoned: abandoned.length,
      dangling
    };
  }

  private analyzeCharacterArcs(chapterManager: ChapterManager): StoryHealthReport['characterArcAnalysis'] {
    const arcs = this.getCharacterArcs();
    const currentChapter = chapterManager.getTotalChapters();

    const completed = arcs.filter(a => a.status === 'completed');
    const inProgress = arcs.filter(a => a.status === 'in_progress');
    const abandoned = arcs.filter(a => a.status === 'abandoned');

    // Find underdeveloped arcs
    const underdeveloped = inProgress.filter(arc => {
      const expectedProgress = arc.endChapter
        ? ((currentChapter - arc.startChapter) / (arc.endChapter - arc.startChapter)) * 100
        : 50;
      return arc.progressPercentage < expectedProgress - 20;
    });

    return {
      total: arcs.length,
      completed: completed.length,
      inProgress: inProgress.length,
      abandoned: abandoned.length,
      underdeveloped
    };
  }

  private analyzeForeshadowing(chapterManager: ChapterManager): StoryHealthReport['foreshadowingAnalysis'] {
    const foreshadows = this.getForeshadowing();
    const currentChapter = chapterManager.getTotalChapters();

    const paidOff = foreshadows.filter(f => f.status === 'fully_paid');
    const pending = foreshadows.filter(f => f.status === 'planted');

    // Find orphaned foreshadowing (planted long ago, never paid off)
    const orphaned = pending.filter(f => currentChapter - f.setupChapter > 500);

    return {
      total: foreshadows.length,
      paidOff: paidOff.length,
      pending: pending.length,
      orphaned
    };
  }

  private analyzePacing(chapterManager: ChapterManager): StoryHealthReport['pacingAnalysis'] {
    const arcs = chapterManager.getAllArcs();
    const issues: string[] = [];

    if (arcs.length === 0) {
      return {
        averagePacing: 0,
        slowestArc: { arcId: '', pacing: 0 },
        fastestArc: { arcId: '', pacing: 0 },
        pacingIssues: ['No story arcs defined']
      };
    }

    const pacingScores: { arcId: string; pacing: number }[] = [];

    for (const arc of arcs) {
      const chapterCount = arc.chapters.length;
      if (chapterCount === 0) continue;

      // Calculate events per chapter (rough pacing metric)
      let eventCount = 0;
      for (const chapterNum of arc.chapters) {
        const chapter = chapterManager.getChapter(chapterNum);
        if (chapter) {
          eventCount += chapter.plotAdvancement.length;
        }
      }

      const pacing = eventCount / chapterCount;
      pacingScores.push({ arcId: arc.id, pacing });

      // Detect pacing issues
      if (pacing < 0.1) {
        issues.push(`Arc "${arc.name}" has very slow pacing (${pacing.toFixed(2)} events/chapter)`);
      } else if (pacing > 3) {
        issues.push(`Arc "${arc.name}" has very fast pacing (${pacing.toFixed(2)} events/chapter)`);
      }
    }

    const avgPacing = pacingScores.reduce((sum, s) => sum + s.pacing, 0) / pacingScores.length;
    const sorted = [...pacingScores].sort((a, b) => a.pacing - b.pacing);

    return {
      averagePacing: avgPacing,
      slowestArc: sorted[0] || { arcId: '', pacing: 0 },
      fastestArc: sorted[sorted.length - 1] || { arcId: '', pacing: 0 },
      pacingIssues: issues
    };
  }

  private analyzeThemes(chapterManager: ChapterManager): StoryHealthReport['themeAnalysis'] {
    const themes = this.getThemes();
    const totalChapters = chapterManager.getTotalChapters();

    // Calculate theme consistency
    let consistencySum = 0;
    const underexplored: string[] = [];

    for (const theme of themes) {
      const coverage = (theme.chapters.length / totalChapters) * 100;

      if (theme.type === ThemeType.MAIN && coverage < 10) {
        underexplored.push(theme.name);
        consistencySum += coverage / 10; // Low score for main themes with low coverage
      } else if (theme.type === ThemeType.SECONDARY && coverage < 5) {
        underexplored.push(theme.name);
        consistencySum += coverage / 5;
      } else {
        consistencySum += Math.min(100, coverage * 10); // Cap at 100
      }
    }

    const themeConsistency = themes.length > 0 ? consistencySum / themes.length : 100;

    return {
      themes,
      themeConsistency: Math.round(themeConsistency),
      underexploredThemes: underexplored
    };
  }

  private analyzeStructure(chapterManager: ChapterManager): StoryHealthReport['structuralAnalysis'] {
    if (!this.narrativeBeats) {
      return {
        structure: NarrativeStructure.CUSTOM,
        beatsMet: 0,
        totalBeats: 0,
        missingBeats: ['No narrative structure defined']
      };
    }

    const achieved = this.narrativeBeats.beats.filter(b => b.achieved);
    const missing = this.narrativeBeats.beats
      .filter(b => !b.achieved)
      .map(b => b.name);

    return {
      structure: this.narrativeBeats.structure,
      beatsMet: achieved.length,
      totalBeats: this.narrativeBeats.beats.length,
      missingBeats: missing
    };
  }

  private collectIssues(...analyses: any[]): StoryHealthReport['issues'] {
    const issues: StoryHealthReport['issues'] = [];

    const [plotAnalysis, arcAnalysis, foreshadowAnalysis, pacingAnalysis, themeAnalysis, structuralAnalysis] = analyses;

    // Plot issues
    if (plotAnalysis.dangling.length > 0) {
      issues.push({
        category: 'Plot',
        severity: ErrorSeverity.ERROR,
        description: `${plotAnalysis.dangling.length} plot threads are dangling near the end`,
        suggestion: 'Resolve or address these plot threads before the story ends'
      });
    }

    if (plotAnalysis.neglected > 5) {
      issues.push({
        category: 'Plot',
        severity: ErrorSeverity.WARNING,
        description: `${plotAnalysis.neglected} plot threads haven't been mentioned recently`,
        suggestion: 'Reference neglected plot threads or resolve them'
      });
    }

    // Arc issues
    if (arcAnalysis.underdeveloped.length > 0) {
      issues.push({
        category: 'Character',
        severity: ErrorSeverity.WARNING,
        description: `${arcAnalysis.underdeveloped.length} character arcs are underdeveloped`,
        suggestion: 'Add key moments to develop these character arcs'
      });
    }

    // Foreshadowing issues
    if (foreshadowAnalysis.orphaned.length > 0) {
      issues.push({
        category: 'Foreshadowing',
        severity: ErrorSeverity.WARNING,
        description: `${foreshadowAnalysis.orphaned.length} foreshadowing elements haven't been paid off`,
        suggestion: 'Either pay off these setups or remove them if no longer relevant'
      });
    }

    // Pacing issues
    for (const issue of pacingAnalysis.pacingIssues) {
      issues.push({
        category: 'Pacing',
        severity: ErrorSeverity.INFO,
        description: issue,
        suggestion: 'Consider adjusting the pacing in this arc'
      });
    }

    // Theme issues
    if (themeAnalysis.underexploredThemes.length > 0) {
      issues.push({
        category: 'Theme',
        severity: ErrorSeverity.INFO,
        description: `Themes underexplored: ${themeAnalysis.underexploredThemes.join(', ')}`,
        suggestion: 'Add more scenes that explore these themes'
      });
    }

    // Structure issues
    if (structuralAnalysis.missingBeats.length > 3) {
      issues.push({
        category: 'Structure',
        severity: ErrorSeverity.WARNING,
        description: `Missing narrative beats: ${structuralAnalysis.missingBeats.slice(0, 3).join(', ')}...`,
        suggestion: 'Ensure all major story beats are present'
      });
    }

    return issues;
  }

  private calculateHealthScore(
    plotAnalysis: StoryHealthReport['plotThreadAnalysis'],
    arcAnalysis: StoryHealthReport['characterArcAnalysis'],
    foreshadowAnalysis: StoryHealthReport['foreshadowingAnalysis'],
    structuralAnalysis: StoryHealthReport['structuralAnalysis']
  ): number {
    let score = 100;

    // Plot deductions
    score -= plotAnalysis.dangling.length * 5;
    score -= plotAnalysis.neglected * 2;
    score -= plotAnalysis.abandoned * 1;

    // Arc deductions
    score -= arcAnalysis.underdeveloped.length * 3;
    score -= arcAnalysis.abandoned * 2;

    // Foreshadowing deductions
    score -= foreshadowAnalysis.orphaned.length * 2;

    // Structure deductions
    const beatPercentage = structuralAnalysis.totalBeats > 0
      ? (structuralAnalysis.beatsMet / structuralAnalysis.totalBeats) * 100
      : 100;
    if (beatPercentage < 80) {
      score -= (80 - beatPercentage);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private determineStatus(score: number): IntegrityStatus {
    if (score >= 90) return IntegrityStatus.EXCELLENT;
    if (score >= 75) return IntegrityStatus.GOOD;
    if (score >= 60) return IntegrityStatus.FAIR;
    if (score >= 40) return IntegrityStatus.POOR;
    return IntegrityStatus.CRITICAL;
  }

  private generateHealthSummary(status: IntegrityStatus, score: number, issueCount: number): string {
    return `Story integrity is ${status.toUpperCase()} (${score}/100) with ${issueCount} issues identified.`;
  }

  // ==========================================================================
  // REPORTS
  // ==========================================================================

  getHealthReports(): StoryHealthReport[] {
    return this.healthReports;
  }

  generateMarkdownReport(report: StoryHealthReport): string {
    let md = `# Story Integrity Report\n\n`;
    md += `**Status:** ${report.status.toUpperCase()} (${report.score}/100)\n\n`;
    md += `**Generated:** ${report.timestamp.toISOString()}\n\n`;
    md += `---\n\n`;

    // Summary
    md += `## Summary\n\n${report.summary}\n\n`;

    // Plot Threads
    md += `## Plot Thread Analysis\n\n`;
    md += `- Total: ${report.plotThreadAnalysis.total}\n`;
    md += `- Resolved: ${report.plotThreadAnalysis.resolved}\n`;
    md += `- Active: ${report.plotThreadAnalysis.active}\n`;
    md += `- Neglected: ${report.plotThreadAnalysis.neglected}\n`;
    md += `- Abandoned: ${report.plotThreadAnalysis.abandoned}\n\n`;

    if (report.plotThreadAnalysis.dangling.length > 0) {
      md += `### Dangling Threads\n\n`;
      for (const thread of report.plotThreadAnalysis.dangling) {
        md += `- **${thread.name}** (since Chapter ${thread.introducedChapter})\n`;
      }
      md += `\n`;
    }

    // Character Arcs
    md += `## Character Arc Analysis\n\n`;
    md += `- Total: ${report.characterArcAnalysis.total}\n`;
    md += `- Completed: ${report.characterArcAnalysis.completed}\n`;
    md += `- In Progress: ${report.characterArcAnalysis.inProgress}\n`;
    md += `- Abandoned: ${report.characterArcAnalysis.abandoned}\n\n`;

    if (report.characterArcAnalysis.underdeveloped.length > 0) {
      md += `### Underdeveloped Arcs\n\n`;
      for (const arc of report.characterArcAnalysis.underdeveloped) {
        md += `- **${arc.characterName}**: ${arc.arcType} arc at ${arc.progressPercentage}% progress\n`;
      }
      md += `\n`;
    }

    // Foreshadowing
    md += `## Foreshadowing Analysis\n\n`;
    md += `- Total: ${report.foreshadowingAnalysis.total}\n`;
    md += `- Paid Off: ${report.foreshadowingAnalysis.paidOff}\n`;
    md += `- Pending: ${report.foreshadowingAnalysis.pending}\n\n`;

    if (report.foreshadowingAnalysis.orphaned.length > 0) {
      md += `### Orphaned Foreshadowing\n\n`;
      for (const f of report.foreshadowingAnalysis.orphaned) {
        md += `- "${f.description}" (planted Chapter ${f.setupChapter})\n`;
      }
      md += `\n`;
    }

    // Structure
    md += `## Structural Analysis\n\n`;
    md += `- Structure: ${report.structuralAnalysis.structure}\n`;
    md += `- Beats Achieved: ${report.structuralAnalysis.beatsMet}/${report.structuralAnalysis.totalBeats}\n\n`;

    if (report.structuralAnalysis.missingBeats.length > 0) {
      md += `### Missing Beats\n\n`;
      for (const beat of report.structuralAnalysis.missingBeats) {
        md += `- ${beat}\n`;
      }
      md += `\n`;
    }

    // Issues
    if (report.issues.length > 0) {
      md += `## Issues\n\n`;
      for (const issue of report.issues) {
        md += `### [${issue.severity.toUpperCase()}] ${issue.category}\n\n`;
        md += `${issue.description}\n\n`;
        md += `**Suggestion:** ${issue.suggestion}\n\n`;
      }
    }

    return md;
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  exportToJSON(): string {
    return JSON.stringify({
      characterArcs: Array.from(this.characterArcs.values()),
      foreshadowing: Array.from(this.foreshadowing.values()),
      plotPoints: Array.from(this.plotPoints.values()),
      themes: Array.from(this.themes.values()),
      narrativeBeats: this.narrativeBeats
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.characterArcs.clear();
    this.foreshadowing.clear();
    this.plotPoints.clear();
    this.themes.clear();

    if (data.characterArcs) {
      for (const arc of data.characterArcs) {
        this.characterArcs.set(arc.id, arc);
      }
    }

    if (data.foreshadowing) {
      for (const f of data.foreshadowing) {
        this.foreshadowing.set(f.id, f);
      }
    }

    if (data.plotPoints) {
      for (const p of data.plotPoints) {
        this.plotPoints.set(p.id, p);
      }
    }

    if (data.themes) {
      for (const t of data.themes) {
        this.themes.set(t.id, t);
      }
    }

    if (data.narrativeBeats) {
      this.narrativeBeats = data.narrativeBeats;
    }
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export const storyIntegrityChecker = new StoryIntegrityChecker();
