/**
 * Series Manager - Multi-Book Coordination System
 *
 * Manages massive narrative series spanning multiple books/volumes.
 * For 300M+ word narratives (12,008 chapters), this handles:
 * - Book/volume/arc organization
 * - Cross-book plot continuity
 * - Cliffhangers and book breaks
 * - Series-level character progression
 * - Reading order management
 * - Publication/release coordination
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

export enum BookStatus {
  PLANNED = 'planned',
  OUTLINING = 'outlining',
  DRAFTING = 'drafting',
  REVISION = 'revision',
  COMPLETE = 'complete',
  PUBLISHED = 'published'
}

export enum ArcScope {
  SINGLE_BOOK = 'single_book',      // Contained within one book
  DUOLOGY = 'duology',              // Spans two books
  TRILOGY = 'trilogy',              // Spans three books
  SAGA = 'saga',                    // Spans 4-6 books
  EPIC = 'epic',                    // Spans 7+ books
  SERIES_WIDE = 'series_wide'       // Entire series
}

export enum CliffhangerType {
  REVELATION = 'revelation',         // Major truth revealed
  DANGER = 'danger',                 // Character in peril
  DECISION = 'decision',             // Critical choice pending
  ARRIVAL = 'arrival',               // New element introduced
  DEPARTURE = 'departure',           // Character leaves/dies
  MYSTERY = 'mystery',               // Question raised
  REVERSAL = 'reversal',             // Expectations subverted
  PROPHECY = 'prophecy',             // Future event hinted
  CLIFFHANGER_LITERAL = 'literal'    // Actual physical danger
}

export enum ReadingOrder {
  PUBLICATION = 'publication',       // Order published
  CHRONOLOGICAL = 'chronological',   // In-universe timeline
  RECOMMENDED = 'recommended',       // Author's recommendation
  MACHETE = 'machete',               // Skip certain entries
  PARALLEL = 'parallel'              // Can be read simultaneously
}

export enum SpinoffType {
  PREQUEL = 'prequel',
  SEQUEL = 'sequel',
  INTERQUEL = 'interquel',           // Between main entries
  SIDEQUEL = 'sidequel',             // Concurrent different POV
  PARALLEL = 'parallel',             // Same time, different story
  ANTHOLOGY = 'anthology',           // Collection of shorts
  COMPANION = 'companion'            // Supplementary material
}

export enum BookBreakQuality {
  WEAK = 'weak',                     // Arbitrary break
  ADEQUATE = 'adequate',             // Acceptable stopping point
  GOOD = 'good',                     // Natural pause
  EXCELLENT = 'excellent',           // Strong ending
  MASTERFUL = 'masterful'            // Perfect cliffhanger
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface SeriesInfo {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  genre: string[];
  totalPlannedBooks: number;
  totalPlannedWords: number;
  totalPlannedChapters: number;
  startDate?: Date;
  targetEndDate?: Date;
  premise: string;
  themes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookInfo {
  id: string;
  seriesId: string;
  bookNumber: number;
  title: string;
  subtitle?: string;
  status: BookStatus;
  wordCountTarget: number;
  wordCountActual: number;
  chapterStart: number;
  chapterEnd: number;
  chapterCount: number;
  premise: string;
  themes: string[];
  primaryArc: string;
  secondaryArcs: string[];
  openingHook: string;
  closingCliffhanger?: CliffhangerInfo;
  publishedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VolumeInfo {
  id: string;
  seriesId: string;
  volumeNumber: number;
  title: string;
  bookIds: string[];
  description: string;
  overarchingArc: string;
  startChapter: number;
  endChapter: number;
}

export interface CliffhangerInfo {
  id: string;
  bookId: string;
  type: CliffhangerType;
  description: string;
  chapter: number;
  intensity: number;  // 1-10
  resolutionBookId?: string;
  resolutionChapter?: number;
  isResolved: boolean;
  elements: string[];
  readerImpact: string;
}

export interface CrossBookPlot {
  id: string;
  seriesId: string;
  name: string;
  description: string;
  scope: ArcScope;
  startBookId: string;
  startChapter: number;
  endBookId?: string;
  endChapter?: number;
  bookAppearances: BookAppearance[];
  status: 'active' | 'dormant' | 'resolved' | 'abandoned';
  importance: number;  // 1-10
  threads: string[];   // Sub-elements to track
}

export interface BookAppearance {
  bookId: string;
  chapters: number[];
  role: 'introduction' | 'development' | 'escalation' | 'climax' | 'resolution' | 'aftermath';
  notes: string;
}

export interface SeriesCharacterArc {
  id: string;
  characterId: string;
  characterName: string;
  scope: ArcScope;
  startBookId: string;
  endBookId?: string;
  arcType: string;
  startingState: string;
  targetEndState: string;
  currentState: string;
  bookProgression: CharacterBookProgress[];
  keyMoments: SeriesKeyMoment[];
}

export interface CharacterBookProgress {
  bookId: string;
  bookNumber: number;
  developmentFocus: string;
  majorChanges: string[];
  endOfBookState: string;
  completionPercent: number;
}

export interface SeriesKeyMoment {
  id: string;
  bookId: string;
  chapter: number;
  description: string;
  impactLevel: number;  // 1-10
  affectsBooks: string[];
}

export interface BookTransition {
  id: string;
  fromBookId: string;
  toBookId: string;
  timeGap: TimeGapInfo;
  cliffhangerResolution?: string;
  newElements: string[];
  continuingThreads: string[];
  droppedThreads: string[];
  breakQuality: BookBreakQuality;
  readerBridging: string;  // How to keep readers engaged
}

export interface TimeGapInfo {
  duration: string;       // "3 months", "10 years"
  inUniverseTime: number; // In days
  significantEvents: string[];
  characterChanges: Map<string, string>;
}

export interface Spinoff {
  id: string;
  mainSeriesId: string;
  title: string;
  type: SpinoffType;
  connectionPoints: ConnectionPoint[];
  requiredReading: string[];  // Book IDs that should be read first
  timeline: SpinoffTimeline;
  sharedCharacters: string[];
  sharedLocations: string[];
  sharedPlots: string[];
}

export interface ConnectionPoint {
  spinoffChapter: number;
  mainSeriesBookId: string;
  mainSeriesChapter: number;
  connectionType: 'reference' | 'crossover' | 'setup' | 'payoff' | 'parallel';
  description: string;
}

export interface SpinoffTimeline {
  relativeToMain: 'before' | 'during' | 'after' | 'mixed';
  mainSeriesBookId?: string;
  startOffset?: string;   // "-5 years", "+3 months"
}

export interface ReadingGuide {
  id: string;
  seriesId: string;
  orderType: ReadingOrder;
  name: string;
  description: string;
  bookOrder: ReadingOrderEntry[];
  includesSpinoffs: boolean;
  targetAudience: string;
}

export interface ReadingOrderEntry {
  bookId: string;
  position: number;
  isOptional: boolean;
  notes: string;
  alternativePosition?: number;  // For parallel reads
}

export interface BookBreakAnalysis {
  bookId: string;
  breakQuality: BookBreakQuality;
  cliffhangerStrength: number;
  unresolvedThreads: number;
  readerSatisfaction: number;   // Estimated 1-10
  urgencyToNextBook: number;    // 1-10
  naturalStoppingPoint: boolean;
  recommendations: string[];
}

export interface SeriesHealthReport {
  seriesId: string;
  generatedAt: Date;
  overallHealth: number;        // 1-100
  booksAnalyzed: number;
  totalWordCount: number;
  avgWordsPerBook: number;
  plotContinuity: number;       // 1-100
  characterConsistency: number; // 1-100
  thematicCoherence: number;    // 1-100
  pacingBalance: number;        // 1-100
  unresolvedCliffhangers: CliffhangerInfo[];
  abandonedPlots: CrossBookPlot[];
  dormantCharacters: string[];
  recommendations: string[];
}

// ============================================================================
// SERIES MANAGER CLASS
// ============================================================================

export class SeriesManager {
  private series: Map<string, SeriesInfo> = new Map();
  private books: Map<string, BookInfo> = new Map();
  private volumes: Map<string, VolumeInfo> = new Map();
  private cliffhangers: Map<string, CliffhangerInfo> = new Map();
  private crossBookPlots: Map<string, CrossBookPlot> = new Map();
  private characterArcs: Map<string, SeriesCharacterArc> = new Map();
  private bookTransitions: Map<string, BookTransition> = new Map();
  private spinoffs: Map<string, Spinoff> = new Map();
  private readingGuides: Map<string, ReadingGuide> = new Map();

  // Indexes
  private booksBySeriesIndex: Map<string, string[]> = new Map();
  private volumesBySeriesIndex: Map<string, string[]> = new Map();
  private cliffhangersByBookIndex: Map<string, string[]> = new Map();
  private plotsBySeriesIndex: Map<string, string[]> = new Map();
  private arcsByCharacterIndex: Map<string, string[]> = new Map();

  // ============================================================================
  // SERIES MANAGEMENT
  // ============================================================================

  createSeries(info: Omit<SeriesInfo, 'id' | 'createdAt' | 'updatedAt'>): SeriesInfo {
    const series: SeriesInfo = {
      ...info,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.series.set(series.id, series);
    this.booksBySeriesIndex.set(series.id, []);
    this.volumesBySeriesIndex.set(series.id, []);
    this.plotsBySeriesIndex.set(series.id, []);

    return series;
  }

  getSeries(seriesId: string): SeriesInfo | undefined {
    return this.series.get(seriesId);
  }

  updateSeries(seriesId: string, updates: Partial<SeriesInfo>): SeriesInfo | undefined {
    const series = this.series.get(seriesId);
    if (!series) return undefined;

    const updated: SeriesInfo = {
      ...series,
      ...updates,
      id: series.id,
      createdAt: series.createdAt,
      updatedAt: new Date()
    };

    this.series.set(seriesId, updated);
    return updated;
  }

  // ============================================================================
  // BOOK MANAGEMENT
  // ============================================================================

  addBook(info: Omit<BookInfo, 'id' | 'createdAt' | 'updatedAt'>): BookInfo {
    const book: BookInfo = {
      ...info,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.books.set(book.id, book);

    // Update index
    const seriesBooks = this.booksBySeriesIndex.get(info.seriesId) || [];
    seriesBooks.push(book.id);
    this.booksBySeriesIndex.set(info.seriesId, seriesBooks);

    return book;
  }

  getBook(bookId: string): BookInfo | undefined {
    return this.books.get(bookId);
  }

  getSeriesBooks(seriesId: string): BookInfo[] {
    const bookIds = this.booksBySeriesIndex.get(seriesId) || [];
    return bookIds
      .map(id => this.books.get(id))
      .filter((b): b is BookInfo => b !== undefined)
      .sort((a, b) => a.bookNumber - b.bookNumber);
  }

  updateBook(bookId: string, updates: Partial<BookInfo>): BookInfo | undefined {
    const book = this.books.get(bookId);
    if (!book) return undefined;

    const updated: BookInfo = {
      ...book,
      ...updates,
      id: book.id,
      seriesId: book.seriesId,
      createdAt: book.createdAt,
      updatedAt: new Date()
    };

    this.books.set(bookId, updated);
    return updated;
  }

  updateBookStatus(bookId: string, status: BookStatus): void {
    this.updateBook(bookId, { status });
  }

  updateBookWordCount(bookId: string, wordCount: number): void {
    this.updateBook(bookId, { wordCountActual: wordCount });
  }

  // ============================================================================
  // VOLUME MANAGEMENT
  // ============================================================================

  createVolume(info: Omit<VolumeInfo, 'id'>): VolumeInfo {
    const volume: VolumeInfo = {
      ...info,
      id: uuidv4()
    };

    this.volumes.set(volume.id, volume);

    // Update index
    const seriesVolumes = this.volumesBySeriesIndex.get(info.seriesId) || [];
    seriesVolumes.push(volume.id);
    this.volumesBySeriesIndex.set(info.seriesId, seriesVolumes);

    return volume;
  }

  getSeriesVolumes(seriesId: string): VolumeInfo[] {
    const volumeIds = this.volumesBySeriesIndex.get(seriesId) || [];
    return volumeIds
      .map(id => this.volumes.get(id))
      .filter((v): v is VolumeInfo => v !== undefined)
      .sort((a, b) => a.volumeNumber - b.volumeNumber);
  }

  // ============================================================================
  // CLIFFHANGER MANAGEMENT
  // ============================================================================

  addCliffhanger(info: Omit<CliffhangerInfo, 'id'>): CliffhangerInfo {
    const cliffhanger: CliffhangerInfo = {
      ...info,
      id: uuidv4()
    };

    this.cliffhangers.set(cliffhanger.id, cliffhanger);

    // Update book's closing cliffhanger
    const book = this.books.get(info.bookId);
    if (book) {
      this.updateBook(info.bookId, { closingCliffhanger: cliffhanger });
    }

    // Update index
    const bookCliffhangers = this.cliffhangersByBookIndex.get(info.bookId) || [];
    bookCliffhangers.push(cliffhanger.id);
    this.cliffhangersByBookIndex.set(info.bookId, bookCliffhangers);

    return cliffhanger;
  }

  resolveCliffhanger(
    cliffhangerId: string,
    resolutionBookId: string,
    resolutionChapter: number
  ): void {
    const cliffhanger = this.cliffhangers.get(cliffhangerId);
    if (cliffhanger) {
      cliffhanger.resolutionBookId = resolutionBookId;
      cliffhanger.resolutionChapter = resolutionChapter;
      cliffhanger.isResolved = true;
      this.cliffhangers.set(cliffhangerId, cliffhanger);
    }
  }

  getUnresolvedCliffhangers(seriesId: string): CliffhangerInfo[] {
    const books = this.getSeriesBooks(seriesId);
    const bookIds = new Set(books.map(b => b.id));

    return Array.from(this.cliffhangers.values())
      .filter(c => bookIds.has(c.bookId) && !c.isResolved);
  }

  getBookCliffhangers(bookId: string): CliffhangerInfo[] {
    const ids = this.cliffhangersByBookIndex.get(bookId) || [];
    return ids
      .map(id => this.cliffhangers.get(id))
      .filter((c): c is CliffhangerInfo => c !== undefined);
  }

  // ============================================================================
  // CROSS-BOOK PLOT MANAGEMENT
  // ============================================================================

  createCrossBookPlot(info: Omit<CrossBookPlot, 'id'>): CrossBookPlot {
    const plot: CrossBookPlot = {
      ...info,
      id: uuidv4()
    };

    this.crossBookPlots.set(plot.id, plot);

    // Update index
    const seriesPlots = this.plotsBySeriesIndex.get(info.seriesId) || [];
    seriesPlots.push(plot.id);
    this.plotsBySeriesIndex.set(info.seriesId, seriesPlots);

    return plot;
  }

  getCrossBookPlot(plotId: string): CrossBookPlot | undefined {
    return this.crossBookPlots.get(plotId);
  }

  getSeriesPlots(seriesId: string): CrossBookPlot[] {
    const plotIds = this.plotsBySeriesIndex.get(seriesId) || [];
    return plotIds
      .map(id => this.crossBookPlots.get(id))
      .filter((p): p is CrossBookPlot => p !== undefined);
  }

  updatePlotStatus(plotId: string, status: CrossBookPlot['status']): void {
    const plot = this.crossBookPlots.get(plotId);
    if (plot) {
      plot.status = status;
      this.crossBookPlots.set(plotId, plot);
    }
  }

  addPlotAppearance(plotId: string, appearance: BookAppearance): void {
    const plot = this.crossBookPlots.get(plotId);
    if (plot) {
      plot.bookAppearances.push(appearance);
      this.crossBookPlots.set(plotId, plot);
    }
  }

  getActivePlots(seriesId: string): CrossBookPlot[] {
    return this.getSeriesPlots(seriesId).filter(p => p.status === 'active');
  }

  getDormantPlots(seriesId: string): CrossBookPlot[] {
    return this.getSeriesPlots(seriesId).filter(p => p.status === 'dormant');
  }

  // ============================================================================
  // SERIES CHARACTER ARC MANAGEMENT
  // ============================================================================

  createSeriesCharacterArc(info: Omit<SeriesCharacterArc, 'id'>): SeriesCharacterArc {
    const arc: SeriesCharacterArc = {
      ...info,
      id: uuidv4()
    };

    this.characterArcs.set(arc.id, arc);

    // Update index
    const characterArcs = this.arcsByCharacterIndex.get(info.characterId) || [];
    characterArcs.push(arc.id);
    this.arcsByCharacterIndex.set(info.characterId, characterArcs);

    return arc;
  }

  getCharacterSeriesArc(characterId: string): SeriesCharacterArc[] {
    const arcIds = this.arcsByCharacterIndex.get(characterId) || [];
    return arcIds
      .map(id => this.characterArcs.get(id))
      .filter((a): a is SeriesCharacterArc => a !== undefined);
  }

  updateCharacterBookProgress(
    arcId: string,
    progress: CharacterBookProgress
  ): void {
    const arc = this.characterArcs.get(arcId);
    if (arc) {
      const existingIndex = arc.bookProgression.findIndex(
        p => p.bookId === progress.bookId
      );

      if (existingIndex >= 0) {
        arc.bookProgression[existingIndex] = progress;
      } else {
        arc.bookProgression.push(progress);
      }

      arc.currentState = progress.endOfBookState;
      this.characterArcs.set(arcId, arc);
    }
  }

  addSeriesKeyMoment(arcId: string, moment: Omit<SeriesKeyMoment, 'id'>): void {
    const arc = this.characterArcs.get(arcId);
    if (arc) {
      arc.keyMoments.push({
        ...moment,
        id: uuidv4()
      });
      this.characterArcs.set(arcId, arc);
    }
  }

  // ============================================================================
  // BOOK TRANSITION MANAGEMENT
  // ============================================================================

  createBookTransition(info: Omit<BookTransition, 'id'>): BookTransition {
    const transition: BookTransition = {
      ...info,
      id: uuidv4()
    };

    this.bookTransitions.set(transition.id, transition);
    return transition;
  }

  getTransitionBetweenBooks(
    fromBookId: string,
    toBookId: string
  ): BookTransition | undefined {
    return Array.from(this.bookTransitions.values()).find(
      t => t.fromBookId === fromBookId && t.toBookId === toBookId
    );
  }

  // ============================================================================
  // SPINOFF MANAGEMENT
  // ============================================================================

  createSpinoff(info: Omit<Spinoff, 'id'>): Spinoff {
    const spinoff: Spinoff = {
      ...info,
      id: uuidv4()
    };

    this.spinoffs.set(spinoff.id, spinoff);
    return spinoff;
  }

  getSeriesSpinoffs(mainSeriesId: string): Spinoff[] {
    return Array.from(this.spinoffs.values())
      .filter(s => s.mainSeriesId === mainSeriesId);
  }

  addConnectionPoint(spinoffId: string, connection: ConnectionPoint): void {
    const spinoff = this.spinoffs.get(spinoffId);
    if (spinoff) {
      spinoff.connectionPoints.push(connection);
      this.spinoffs.set(spinoffId, spinoff);
    }
  }

  // ============================================================================
  // READING GUIDE MANAGEMENT
  // ============================================================================

  createReadingGuide(info: Omit<ReadingGuide, 'id'>): ReadingGuide {
    const guide: ReadingGuide = {
      ...info,
      id: uuidv4()
    };

    this.readingGuides.set(guide.id, guide);
    return guide;
  }

  getSeriesReadingGuides(seriesId: string): ReadingGuide[] {
    return Array.from(this.readingGuides.values())
      .filter(g => g.seriesId === seriesId);
  }

  generateChronologicalOrder(seriesId: string): ReadingOrderEntry[] {
    const books = this.getSeriesBooks(seriesId);
    // For a simple implementation, assume book order is chronological
    // In reality, this would be based on in-universe timeline
    return books.map((book, index) => ({
      bookId: book.id,
      position: index + 1,
      isOptional: false,
      notes: `Book ${book.bookNumber}: ${book.title}`
    }));
  }

  // ============================================================================
  // ANALYSIS AND REPORTS
  // ============================================================================

  analyzeBookBreak(bookId: string): BookBreakAnalysis {
    const book = this.books.get(bookId);
    if (!book) {
      throw new Error(`Book not found: ${bookId}`);
    }

    // Get cliffhangers for future analysis
    this.getBookCliffhangers(bookId);
    const unresolvedPlots = this.getActivePlots(book.seriesId)
      .filter(p => p.bookAppearances.some(a => a.bookId === bookId));

    const cliffhangerStrength = book.closingCliffhanger?.intensity || 0;
    const unresolvedCount = unresolvedPlots.length;

    // Calculate reader satisfaction (lower with more unresolved threads)
    const readerSatisfaction = Math.max(1, 10 - (unresolvedCount * 0.5));

    // Calculate urgency (higher with stronger cliffhanger)
    const urgencyToNextBook = cliffhangerStrength;

    // Determine break quality
    let breakQuality: BookBreakQuality;
    const score = (cliffhangerStrength + readerSatisfaction) / 2;
    if (score >= 9) breakQuality = BookBreakQuality.MASTERFUL;
    else if (score >= 7) breakQuality = BookBreakQuality.EXCELLENT;
    else if (score >= 5) breakQuality = BookBreakQuality.GOOD;
    else if (score >= 3) breakQuality = BookBreakQuality.ADEQUATE;
    else breakQuality = BookBreakQuality.WEAK;

    const recommendations: string[] = [];
    if (cliffhangerStrength < 5) {
      recommendations.push('Consider strengthening the cliffhanger');
    }
    if (unresolvedCount > 5) {
      recommendations.push('Too many unresolved threads - consider resolving some');
    }
    if (readerSatisfaction < 5) {
      recommendations.push('Readers may feel unsatisfied - add some resolution');
    }

    return {
      bookId,
      breakQuality,
      cliffhangerStrength,
      unresolvedThreads: unresolvedCount,
      readerSatisfaction,
      urgencyToNextBook,
      naturalStoppingPoint: score >= 5,
      recommendations
    };
  }

  generateSeriesHealthReport(seriesId: string): SeriesHealthReport {
    const series = this.series.get(seriesId);
    if (!series) {
      throw new Error(`Series not found: ${seriesId}`);
    }

    const books = this.getSeriesBooks(seriesId);
    const plots = this.getSeriesPlots(seriesId);
    const unresolvedCliffs = this.getUnresolvedCliffhangers(seriesId);
    const abandonedPlots = plots.filter(p => p.status === 'abandoned');
    const dormantPlots = plots.filter(p => p.status === 'dormant');

    const totalWordCount = books.reduce((sum, b) => sum + b.wordCountActual, 0);
    const avgWordsPerBook = books.length > 0 ? totalWordCount / books.length : 0;

    // Calculate health metrics
    const plotContinuity = this.calculatePlotContinuity(plots, books);
    const characterConsistency = this.calculateCharacterConsistency(seriesId);
    const thematicCoherence = this.calculateThematicCoherence(series, books);
    const pacingBalance = this.calculatePacingBalance(books);

    const overallHealth = Math.round(
      (plotContinuity + characterConsistency + thematicCoherence + pacingBalance) / 4
    );

    const recommendations: string[] = [];
    if (unresolvedCliffs.length > books.length) {
      recommendations.push('Too many unresolved cliffhangers - prioritize resolution');
    }
    if (abandonedPlots.length > 0) {
      recommendations.push(`${abandonedPlots.length} abandoned plots should be addressed`);
    }
    if (dormantPlots.length > 3) {
      recommendations.push('Several plots have gone dormant - consider reactivating');
    }
    if (plotContinuity < 70) {
      recommendations.push('Plot continuity needs improvement');
    }

    // Find dormant characters (those with arcs but no recent progress)
    const dormantCharacters = this.findDormantCharacters(seriesId, books);

    return {
      seriesId,
      generatedAt: new Date(),
      overallHealth,
      booksAnalyzed: books.length,
      totalWordCount,
      avgWordsPerBook,
      plotContinuity,
      characterConsistency,
      thematicCoherence,
      pacingBalance,
      unresolvedCliffhangers: unresolvedCliffs,
      abandonedPlots,
      dormantCharacters,
      recommendations
    };
  }

  private calculatePlotContinuity(plots: CrossBookPlot[], _books: BookInfo[]): number {
    if (plots.length === 0) return 100;

    const resolvedRatio = plots.filter(p => p.status === 'resolved').length / plots.length;
    const abandonedPenalty = plots.filter(p => p.status === 'abandoned').length * 10;

    return Math.max(0, Math.min(100,
      Math.round((resolvedRatio * 50) + 50 - abandonedPenalty)
    ));
  }

  private calculateCharacterConsistency(seriesId: string): number {
    const arcs = Array.from(this.characterArcs.values())
      .filter(a => {
        const startBook = this.books.get(a.startBookId);
        return startBook?.seriesId === seriesId;
      });

    if (arcs.length === 0) return 100;

    // Check for progression in each arc
    const progressingArcs = arcs.filter(a => a.bookProgression.length > 0);
    const progressRatio = progressingArcs.length / arcs.length;

    return Math.round(progressRatio * 100);
  }

  private calculateThematicCoherence(series: SeriesInfo, books: BookInfo[]): number {
    if (books.length === 0) return 100;

    const seriesThemes = new Set(series.themes);
    let matchCount = 0;
    let totalBookThemes = 0;

    for (const book of books) {
      for (const theme of book.themes) {
        totalBookThemes++;
        if (seriesThemes.has(theme)) {
          matchCount++;
        }
      }
    }

    if (totalBookThemes === 0) return 100;
    return Math.round((matchCount / totalBookThemes) * 100);
  }

  private calculatePacingBalance(books: BookInfo[]): number {
    if (books.length < 2) return 100;

    const wordCounts = books.map(b => b.wordCountActual).filter(w => w > 0);
    if (wordCounts.length < 2) return 100;

    const avg = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
    const variance = wordCounts.reduce((sum, w) => sum + Math.pow(w - avg, 2), 0) / wordCounts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / avg) * 100;

    // Lower variation = better pacing balance
    return Math.max(0, Math.min(100, Math.round(100 - coefficientOfVariation)));
  }

  private findDormantCharacters(seriesId: string, books: BookInfo[]): string[] {
    const dormant: string[] = [];
    const latestBookNumber = Math.max(...books.map(b => b.bookNumber), 0);

    for (const arc of this.characterArcs.values()) {
      const startBook = this.books.get(arc.startBookId);
      if (startBook?.seriesId !== seriesId) continue;

      // Check if character has appeared in recent books
      const lastAppearance = Math.max(
        ...arc.bookProgression.map(p => p.bookNumber),
        0
      );

      if (latestBookNumber - lastAppearance > 2) {
        dormant.push(arc.characterName);
      }
    }

    return dormant;
  }

  // ============================================================================
  // PLANNING HELPERS
  // ============================================================================

  planBookStructure(
    _seriesId: string,
    totalChapters: number,
    targetBooksCount: number,
    avgWordsPerChapter: number
  ): Array<{
    bookNumber: number;
    chapterStart: number;
    chapterEnd: number;
    chapterCount: number;
    estimatedWordCount: number;
  }> {
    const chaptersPerBook = Math.ceil(totalChapters / targetBooksCount);
    const result: Array<{
      bookNumber: number;
      chapterStart: number;
      chapterEnd: number;
      chapterCount: number;
      estimatedWordCount: number;
    }> = [];

    let currentChapter = 1;
    for (let i = 0; i < targetBooksCount; i++) {
      const chapterStart = currentChapter;
      const chapterEnd = Math.min(chapterStart + chaptersPerBook - 1, totalChapters);
      const chapterCount = chapterEnd - chapterStart + 1;

      result.push({
        bookNumber: i + 1,
        chapterStart,
        chapterEnd,
        chapterCount,
        estimatedWordCount: chapterCount * avgWordsPerChapter
      });

      currentChapter = chapterEnd + 1;
      if (currentChapter > totalChapters) break;
    }

    return result;
  }

  suggestBookBreakPoints(
    _seriesId: string,
    chapters: Array<{ number: number; tensionLevel: number; plotResolutions: number }>
  ): number[] {
    // Find natural break points where tension is lower and plots are resolved
    const breakPoints: number[] = [];

    for (let i = 1; i < chapters.length; i++) {
      const chapter = chapters[i];
      const prevChapter = chapters[i - 1];

      // Good break point: tension drops after climax, some resolution
      if (prevChapter.tensionLevel > 7 &&
          chapter.tensionLevel < 5 &&
          chapter.plotResolutions > 0) {
        breakPoints.push(chapter.number);
      }
    }

    return breakPoints;
  }

  // ============================================================================
  // SERIALIZATION
  // ============================================================================

  exportToJSON(): string {
    const data = {
      series: Array.from(this.series.entries()),
      books: Array.from(this.books.entries()),
      volumes: Array.from(this.volumes.entries()),
      cliffhangers: Array.from(this.cliffhangers.entries()),
      crossBookPlots: Array.from(this.crossBookPlots.entries()),
      characterArcs: Array.from(this.characterArcs.entries()),
      bookTransitions: Array.from(this.bookTransitions.entries()),
      spinoffs: Array.from(this.spinoffs.entries()),
      readingGuides: Array.from(this.readingGuides.entries()),
      indexes: {
        booksBySeriesIndex: Array.from(this.booksBySeriesIndex.entries()),
        volumesBySeriesIndex: Array.from(this.volumesBySeriesIndex.entries()),
        cliffhangersByBookIndex: Array.from(this.cliffhangersByBookIndex.entries()),
        plotsBySeriesIndex: Array.from(this.plotsBySeriesIndex.entries()),
        arcsByCharacterIndex: Array.from(this.arcsByCharacterIndex.entries())
      }
    };

    return JSON.stringify(data, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.series = new Map(data.series);
    this.books = new Map(data.books);
    this.volumes = new Map(data.volumes);
    this.cliffhangers = new Map(data.cliffhangers);
    this.crossBookPlots = new Map(data.crossBookPlots);
    this.characterArcs = new Map(data.characterArcs);
    this.bookTransitions = new Map(data.bookTransitions);
    this.spinoffs = new Map(data.spinoffs);
    this.readingGuides = new Map(data.readingGuides);

    if (data.indexes) {
      this.booksBySeriesIndex = new Map(data.indexes.booksBySeriesIndex);
      this.volumesBySeriesIndex = new Map(data.indexes.volumesBySeriesIndex);
      this.cliffhangersByBookIndex = new Map(data.indexes.cliffhangersByBookIndex);
      this.plotsBySeriesIndex = new Map(data.indexes.plotsBySeriesIndex);
      this.arcsByCharacterIndex = new Map(data.indexes.arcsByCharacterIndex);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getSeriesProgress(seriesId: string): {
    plannedBooks: number;
    completedBooks: number;
    inProgressBooks: number;
    totalChaptersWritten: number;
    totalWordsWritten: number;
    percentComplete: number;
  } {
    const series = this.series.get(seriesId);
    const books = this.getSeriesBooks(seriesId);

    const completedBooks = books.filter(
      b => b.status === BookStatus.COMPLETE || b.status === BookStatus.PUBLISHED
    ).length;

    const inProgressBooks = books.filter(
      b => b.status === BookStatus.DRAFTING || b.status === BookStatus.REVISION
    ).length;

    const totalChaptersWritten = books
      .filter(b => b.status !== BookStatus.PLANNED && b.status !== BookStatus.OUTLINING)
      .reduce((sum, b) => sum + b.chapterCount, 0);

    const totalWordsWritten = books.reduce((sum, b) => sum + b.wordCountActual, 0);

    const percentComplete = series
      ? (totalWordsWritten / series.totalPlannedWords) * 100
      : 0;

    return {
      plannedBooks: series?.totalPlannedBooks || 0,
      completedBooks,
      inProgressBooks,
      totalChaptersWritten,
      totalWordsWritten,
      percentComplete: Math.min(100, Math.round(percentComplete * 100) / 100)
    };
  }

  findPlotsByChapter(seriesId: string, bookId: string, chapter: number): CrossBookPlot[] {
    return this.getSeriesPlots(seriesId).filter(plot =>
      plot.bookAppearances.some(
        app => app.bookId === bookId && app.chapters.includes(chapter)
      )
    );
  }

  getCliffhangerResolutionGap(cliffhangerId: string): number | null {
    const cliffhanger = this.cliffhangers.get(cliffhangerId);
    if (!cliffhanger || !cliffhanger.isResolved) return null;

    const originBook = this.books.get(cliffhanger.bookId);
    const resolutionBook = cliffhanger.resolutionBookId
      ? this.books.get(cliffhanger.resolutionBookId)
      : null;

    if (!originBook || !resolutionBook) return null;

    return resolutionBook.bookNumber - originBook.bookNumber;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SeriesManager;
