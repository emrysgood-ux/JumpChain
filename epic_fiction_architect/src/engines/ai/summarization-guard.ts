/**
 * Epic Fiction Architect - Summarization Guard
 *
 * Prevents over-summarization when building AI context by:
 * - Tracking detail preservation ratios
 * - Protecting critical narrative elements (foreshadowing, promises, character arcs)
 * - Enforcing minimum detail thresholds
 * - Detecting when summaries lose essential information
 *
 * Critical for 300M+ word narratives where details planted in book 1
 * must be remembered and paid off in book 50.
 */

import type {
  Scene,
  Character,
  Promise,
  PlotThread,
  TimelineEvent,
  ConsistencyFact
} from '../../core/types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface SummarizationConfig {
  /** Minimum ratio of preserved details (0.0-1.0) */
  minPreservationRatio: number;

  /** Maximum compression ratio allowed (e.g., 10 = 10:1 compression) */
  maxCompressionRatio: number;

  /** Categories that must never be summarized away */
  protectedCategories: ProtectedCategory[];

  /** Minimum word count before summarization is allowed */
  minWordsBeforeSummarization: number;

  /** Whether to track what was lost in summarization */
  trackLostDetails: boolean;

  /** Alert threshold for detail loss percentage */
  detailLossAlertThreshold: number;
}

export type ProtectedCategory =
  | 'promise_setup'      // Chekhov's guns, foreshadowing
  | 'promise_payoff'     // Promise fulfillments
  | 'character_arc'      // Arc phase transitions
  | 'character_death'    // Death scenes
  | 'character_intro'    // First appearances
  | 'relationship_change' // Major relationship shifts
  | 'plot_pivot'         // Major plot turns
  | 'world_rule'         // World-building rules established
  | 'timeline_anchor'    // Critical timeline dates
  | 'mystery_clue'       // Clues for mysteries
  | 'theme_statement'    // Theme articulations
  | 'voice_sample';      // Character voice examples

export const DEFAULT_CONFIG: SummarizationConfig = {
  minPreservationRatio: 0.7,      // Preserve at least 70% of critical details
  maxCompressionRatio: 20,        // Never compress more than 20:1
  protectedCategories: [
    'promise_setup',
    'promise_payoff',
    'character_arc',
    'character_death',
    'plot_pivot',
    'world_rule',
    'mystery_clue'
  ],
  minWordsBeforeSummarization: 500,
  trackLostDetails: true,
  detailLossAlertThreshold: 0.3   // Alert if >30% details lost
};

// ============================================================================
// DETAIL EXTRACTION
// ============================================================================

export interface ExtractedDetail {
  id: string;
  category: ProtectedCategory | 'general';
  content: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  sourceSceneId?: string;
  sourceChapter?: string;
  linkedEntityIds: string[];
  mustPreserve: boolean;
}

export interface DetailExtractionResult {
  details: ExtractedDetail[];
  totalCount: number;
  criticalCount: number;
  protectedCount: number;
}

/**
 * Extract narrative details from content that must be preserved
 */
export function extractDetails(
  content: string,
  context: {
    promises?: Promise[];
    characters?: Character[];
    plotThreads?: PlotThread[];
    facts?: ConsistencyFact[];
  }
): DetailExtractionResult {
  const details: ExtractedDetail[] = [];
  let idCounter = 0;

  const generateId = () => `detail-${++idCounter}`;

  // Extract promise-related details
  if (context.promises) {
    for (const promise of context.promises) {
      if (promise.status === 'planted' || promise.status === 'reinforced') {
        details.push({
          id: generateId(),
          category: 'promise_setup',
          content: promise.description,
          importance: 'critical',
          sourceSceneId: promise.plantedSceneId,
          linkedEntityIds: [promise.id],
          mustPreserve: true
        });
      }
    }
  }

  // Extract character arc transitions
  if (context.characters) {
    for (const character of context.characters) {
      if (character.arcPhases && character.arcPhases.length > 0) {
        for (const phase of character.arcPhases) {
          details.push({
            id: generateId(),
            category: 'character_arc',
            content: `${character.name}: ${phase.phase} - ${phase.description}`,
            importance: 'high',
            linkedEntityIds: [character.id],
            mustPreserve: phase.lieStrength < 50 || phase.truthAcceptance > 50
          });
        }
      }

      // Character deaths are always critical
      if (character.deathDate) {
        details.push({
          id: generateId(),
          category: 'character_death',
          content: `${character.name} dies`,
          importance: 'critical',
          linkedEntityIds: [character.id],
          mustPreserve: true
        });
      }
    }
  }

  // Extract plot thread pivots
  if (context.plotThreads) {
    for (const thread of context.plotThreads) {
      if (thread.type === 'main' || thread.importance >= 8) {
        details.push({
          id: generateId(),
          category: 'plot_pivot',
          content: thread.description || thread.name,
          importance: thread.type === 'main' ? 'critical' : 'high',
          linkedEntityIds: [thread.id, ...thread.characterIds],
          mustPreserve: thread.type === 'main'
        });
      }
    }
  }

  // Extract consistency facts
  if (context.facts) {
    for (const fact of context.facts) {
      const isWorldRule = fact.category === 'world_rule' || fact.category === 'magic_system';
      details.push({
        id: generateId(),
        category: isWorldRule ? 'world_rule' : 'general',
        content: fact.fact,
        importance: fact.importance === 'critical' ? 'critical' :
                   fact.importance === 'important' ? 'high' : 'medium',
        sourceSceneId: fact.sourceSceneId,
        sourceChapter: fact.sourceChapter,
        linkedEntityIds: fact.relatedEntityIds,
        mustPreserve: fact.importance === 'critical' || isWorldRule
      });
    }
  }

  // Extract inline details from content using pattern matching
  const inlineDetails = extractInlineDetails(content);
  details.push(...inlineDetails);

  return {
    details,
    totalCount: details.length,
    criticalCount: details.filter(d => d.importance === 'critical').length,
    protectedCount: details.filter(d => d.mustPreserve).length
  };
}

/**
 * Extract details directly from text content using pattern matching
 */
function extractInlineDetails(content: string): ExtractedDetail[] {
  const details: ExtractedDetail[] = [];
  let idCounter = 1000;

  const generateId = () => `inline-${++idCounter}`;

  // Patterns that indicate important details
  const patterns: {regex: RegExp; category: ProtectedCategory | 'general'; importance: ExtractedDetail['importance']}[] = [
    // Foreshadowing patterns
    {regex: /(?:little did \w+ know|would later|foreshadow|hint(?:ed)? at|omen)/gi, category: 'promise_setup', importance: 'critical'},

    // Death mentions
    {regex: /(?:died|killed|death of|passed away|murdered|slain)/gi, category: 'character_death', importance: 'critical'},

    // First appearances
    {regex: /(?:first time \w+ (?:saw|met|encountered)|first appearance|entered the story)/gi, category: 'character_intro', importance: 'high'},

    // World rules
    {regex: /(?:the rule was|law of|magic works by|always|never|must|forbidden)/gi, category: 'world_rule', importance: 'high'},

    // Mystery clues
    {regex: /(?:noticed|observed|strange|peculiar|clue|evidence|suspicious)/gi, category: 'mystery_clue', importance: 'medium'},

    // Relationship changes
    {regex: /(?:married|divorced|betrayed|fell in love|broke up|allied with|became enemies)/gi, category: 'relationship_change', importance: 'high'},

    // Theme statements
    {regex: /(?:the meaning of|what matters is|the truth is|lesson|moral|realized that)/gi, category: 'theme_statement', importance: 'medium'}
  ];

  for (const {regex, category, importance} of patterns) {
    let match;
    const globalRegex = new RegExp(regex.source, 'gi');

    while ((match = globalRegex.exec(content)) !== null) {
      // Extract surrounding context (50 chars before and after)
      const start = Math.max(0, match.index - 50);
      const end = Math.min(content.length, match.index + match[0].length + 50);
      const context = content.substring(start, end).trim();

      details.push({
        id: generateId(),
        category,
        content: context,
        importance,
        linkedEntityIds: [],
        mustPreserve: importance === 'critical'
      });
    }
  }

  return details;
}

// ============================================================================
// SUMMARIZATION GUARD
// ============================================================================

export interface SummarizationResult {
  summary: string;
  originalWordCount: number;
  summaryWordCount: number;
  compressionRatio: number;
  preservedDetails: ExtractedDetail[];
  lostDetails: ExtractedDetail[];
  preservationRatio: number;
  isAcceptable: boolean;
  warnings: string[];
  errors: string[];
}

export class SummarizationGuard {
  private config: SummarizationConfig;
  private lostDetailHistory: ExtractedDetail[] = [];

  constructor(config: Partial<SummarizationConfig> = {}) {
    this.config = {...DEFAULT_CONFIG, ...config};
  }

  /**
   * Validate a summarization attempt
   */
  validateSummarization(
    original: string,
    summary: string,
    context: {
      promises?: Promise[];
      characters?: Character[];
      plotThreads?: PlotThread[];
      facts?: ConsistencyFact[];
    }
  ): SummarizationResult {
    const originalWordCount = this.countWords(original);
    const summaryWordCount = this.countWords(summary);
    const compressionRatio = originalWordCount / Math.max(1, summaryWordCount);

    const warnings: string[] = [];
    const errors: string[] = [];

    // Check minimum word count
    if (originalWordCount < this.config.minWordsBeforeSummarization) {
      warnings.push(`Content is only ${originalWordCount} words; summarization may not be needed`);
    }

    // Check compression ratio
    if (compressionRatio > this.config.maxCompressionRatio) {
      errors.push(
        `Compression ratio ${compressionRatio.toFixed(1)}:1 exceeds maximum ${this.config.maxCompressionRatio}:1`
      );
    }

    // Extract details from original
    const extraction = extractDetails(original, context);

    // Check which details are preserved in summary
    const preservedDetails: ExtractedDetail[] = [];
    const lostDetails: ExtractedDetail[] = [];

    for (const detail of extraction.details) {
      if (this.isDetailPreserved(detail, summary)) {
        preservedDetails.push(detail);
      } else {
        lostDetails.push(detail);

        // Check if this was a must-preserve detail
        if (detail.mustPreserve) {
          errors.push(`CRITICAL: Lost must-preserve detail: "${detail.content.substring(0, 50)}..."`);
        }

        // Check protected categories
        if (this.config.protectedCategories.includes(detail.category as ProtectedCategory)) {
          if (detail.importance === 'critical') {
            errors.push(`Lost protected ${detail.category}: "${detail.content.substring(0, 50)}..."`);
          } else {
            warnings.push(`Lost protected ${detail.category}: "${detail.content.substring(0, 50)}..."`);
          }
        }
      }
    }

    // Calculate preservation ratio
    const preservationRatio = extraction.totalCount > 0
      ? preservedDetails.length / extraction.totalCount
      : 1.0;

    // Check preservation ratio
    if (preservationRatio < this.config.minPreservationRatio) {
      errors.push(
        `Preservation ratio ${(preservationRatio * 100).toFixed(1)}% is below minimum ${(this.config.minPreservationRatio * 100).toFixed(1)}%`
      );
    }

    // Check detail loss alert threshold
    const lossRatio = 1 - preservationRatio;
    if (lossRatio > this.config.detailLossAlertThreshold) {
      warnings.push(
        `Detail loss ${(lossRatio * 100).toFixed(1)}% exceeds alert threshold ${(this.config.detailLossAlertThreshold * 100).toFixed(1)}%`
      );
    }

    // Track lost details if configured
    if (this.config.trackLostDetails) {
      this.lostDetailHistory.push(...lostDetails);
    }

    const isAcceptable = errors.length === 0;

    return {
      summary,
      originalWordCount,
      summaryWordCount,
      compressionRatio,
      preservedDetails,
      lostDetails,
      preservationRatio,
      isAcceptable,
      warnings,
      errors
    };
  }

  /**
   * Check if a detail is preserved in the summary
   */
  private isDetailPreserved(detail: ExtractedDetail, summary: string): boolean {
    const summaryLower = summary.toLowerCase();
    const contentLower = detail.content.toLowerCase();

    // Direct substring match
    if (summaryLower.includes(contentLower)) {
      return true;
    }

    // Extract key terms and check for their presence
    const keyTerms = this.extractKeyTerms(detail.content);
    const matchedTerms = keyTerms.filter(term =>
      summaryLower.includes(term.toLowerCase())
    );

    // Consider preserved if >60% of key terms are present
    return keyTerms.length > 0 && matchedTerms.length / keyTerms.length >= 0.6;
  }

  /**
   * Extract key terms from content
   */
  private extractKeyTerms(content: string): string[] {
    // Remove common words and extract significant terms
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
      'that', 'this', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
      'he', 'she', 'him', 'her', 'his', 'hers', 'we', 'us', 'our', 'you', 'your'
    ]);

    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    // Return unique terms
    return [...new Set(words)];
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  /**
   * Get accumulated lost details
   */
  getLostDetailHistory(): ExtractedDetail[] {
    return [...this.lostDetailHistory];
  }

  /**
   * Clear lost detail history
   */
  clearLostDetailHistory(): void {
    this.lostDetailHistory = [];
  }

  /**
   * Generate a report of lost details
   */
  generateLostDetailReport(): string {
    if (this.lostDetailHistory.length === 0) {
      return 'No details have been lost to summarization.';
    }

    const byCategoryMap = new Map<string, ExtractedDetail[]>();
    for (const detail of this.lostDetailHistory) {
      const category = detail.category;
      if (!byCategoryMap.has(category)) {
        byCategoryMap.set(category, []);
      }
      byCategoryMap.get(category)!.push(detail);
    }

    let report = '# Lost Detail Report\n\n';
    report += `Total lost details: ${this.lostDetailHistory.length}\n\n`;

    for (const [category, details] of byCategoryMap) {
      report += `## ${category} (${details.length})\n\n`;
      for (const detail of details) {
        report += `- [${detail.importance}] ${detail.content.substring(0, 100)}${detail.content.length > 100 ? '...' : ''}\n`;
      }
      report += '\n';
    }

    return report;
  }

  /**
   * Create a protected summary that ensures critical details are preserved
   */
  createProtectedSummary(
    content: string,
    targetWordCount: number,
    context: {
      promises?: Promise[];
      characters?: Character[];
      plotThreads?: PlotThread[];
      facts?: ConsistencyFact[];
    }
  ): {summary: string; protectedDetails: string} {
    // Extract all details that must be preserved
    const extraction = extractDetails(content, context);
    const mustPreserve = extraction.details.filter(d =>
      d.mustPreserve ||
      d.importance === 'critical' ||
      this.config.protectedCategories.includes(d.category as ProtectedCategory)
    );

    // Build protected details section
    const protectedSection = mustPreserve
      .map(d => `[${d.category}] ${d.content}`)
      .join('\n');

    // Calculate how much space is left for general summary
    const protectedWordCount = this.countWords(protectedSection);
    const remainingWords = Math.max(100, targetWordCount - protectedWordCount);

    // Create truncated content for general summary
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    let summary = '';
    let wordCount = 0;

    for (const sentence of sentences) {
      const sentenceWords = this.countWords(sentence);
      if (wordCount + sentenceWords <= remainingWords) {
        summary += sentence.trim() + '. ';
        wordCount += sentenceWords;
      } else {
        break;
      }
    }

    return {
      summary: summary.trim(),
      protectedDetails: protectedSection
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if summarization is even necessary
 */
export function shouldSummarize(
  content: string,
  config: SummarizationConfig = DEFAULT_CONFIG
): {shouldSummarize: boolean; reason: string} {
  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount < config.minWordsBeforeSummarization) {
    return {
      shouldSummarize: false,
      reason: `Content is only ${wordCount} words, below threshold of ${config.minWordsBeforeSummarization}`
    };
  }

  return {
    shouldSummarize: true,
    reason: `Content is ${wordCount} words, above threshold of ${config.minWordsBeforeSummarization}`
  };
}

/**
 * Calculate safe summary length that won't over-compress
 */
export function calculateSafeSummaryLength(
  originalWordCount: number,
  config: SummarizationConfig = DEFAULT_CONFIG
): {minWords: number; recommendedWords: number} {
  const minWords = Math.ceil(originalWordCount / config.maxCompressionRatio);
  const recommendedWords = Math.ceil(originalWordCount / (config.maxCompressionRatio / 2));

  return {minWords, recommendedWords};
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SummarizationGuard;
