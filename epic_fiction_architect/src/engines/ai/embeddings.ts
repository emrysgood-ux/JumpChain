/**
 * Epic Fiction Architect - AI & Embeddings Engine
 *
 * Provides:
 * - Text embedding generation (local or API-based)
 * - Semantic search across story content
 * - RAG (Retrieval Augmented Generation) support
 * - Consistency checking
 * - Character voice analysis
 */

import {DatabaseManager} from '../../db/database';
import type {
  Embedding,
  ConsistencyFact,
  VoiceFingerprint,
  Character,
  Scene,
  StoryBibleQuery,
  StoryBibleResult,
  SearchResult
} from '../../core/types';
import {v4 as uuidv4} from 'uuid';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface EmbeddingConfig {
  provider: 'openai' | 'anthropic' | 'local' | 'ollama';
  model: string;
  dimensions: number;
  apiKey?: string;
  baseUrl?: string;
  chunkSize: number;
  chunkOverlap: number;
}

export const defaultConfig: EmbeddingConfig = {
  provider: 'local',
  model: 'all-MiniLM-L6-v2',
  dimensions: 384,
  chunkSize: 500,
  chunkOverlap: 50
};

// ============================================================================
// EMBEDDINGS ENGINE
// ============================================================================

export class EmbeddingsEngine {
  private db: DatabaseManager;
  private config: EmbeddingConfig;

  constructor(db: DatabaseManager, config: Partial<EmbeddingConfig> = {}) {
    this.db = db;
    this.config = {...defaultConfig, ...config};
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    switch (this.config.provider) {
      case 'openai':
        return this.generateOpenAIEmbedding(text);
      case 'anthropic':
        return this.generateAnthropicEmbedding(text);
      case 'ollama':
        return this.generateOllamaEmbedding(text);
      case 'local':
      default:
        return this.generateLocalEmbedding(text);
    }
  }

  /**
   * OpenAI embeddings
   */
  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key required');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'text-embedding-3-small',
        input: text
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Anthropic embeddings (via Voyage AI)
   */
  private async generateAnthropicEmbedding(text: string): Promise<number[]> {
    // Anthropic partners with Voyage AI for embeddings
    if (!this.config.apiKey) {
      throw new Error('Voyage AI API key required');
    }

    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'voyage-3',
        input: text
      })
    });

    if (!response.ok) {
      throw new Error(`Voyage AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Ollama local embeddings
   */
  private async generateOllamaEmbedding(text: string): Promise<number[]> {
    const baseUrl = this.config.baseUrl || 'http://localhost:11434';

    const response = await fetch(`${baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'nomic-embed-text',
        prompt: text
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  }

  /**
   * Local embeddings (placeholder - would use transformers.js in production)
   */
  private async generateLocalEmbedding(text: string): Promise<number[]> {
    // In production, this would use @xenova/transformers
    // For now, generate a deterministic pseudo-embedding based on text hash
    const hash = this.simpleHash(text);
    const embedding: number[] = [];

    for (let i = 0; i < this.config.dimensions; i++) {
      // Generate deterministic but distributed values
      const val = Math.sin(hash * (i + 1) * 0.001) * 0.5;
      embedding.push(val);
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => v / magnitude);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // ==========================================================================
  // CONTENT INDEXING
  // ==========================================================================

  /**
   * Index a scene for semantic search
   */
  async indexScene(scene: Scene): Promise<void> {
    // Delete existing embeddings for this scene
    this.db.run('DELETE FROM embeddings WHERE entity_type = ? AND entity_id = ?', ['scene', scene.id]);

    // Chunk the content
    const chunks = this.chunkText(scene.content);

    // Generate and store embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await this.generateEmbedding(chunks[i]);

      this.db.storeEmbedding(
        scene.projectId,
        'scene',
        scene.id,
        chunks[i],
        i,
        embedding,
        this.config.model
      );
    }

    // Also index synopsis if present
    if (scene.synopsis) {
      const synopsisEmbedding = await this.generateEmbedding(scene.synopsis);
      this.db.storeEmbedding(
        scene.projectId,
        'scene',
        scene.id,
        `Synopsis: ${scene.synopsis}`,
        -1, // Special index for synopsis
        synopsisEmbedding,
        this.config.model
      );
    }
  }

  /**
   * Index a character for semantic search
   */
  async indexCharacter(character: Character): Promise<void> {
    // Delete existing embeddings
    this.db.run('DELETE FROM embeddings WHERE entity_type = ? AND entity_id = ?', ['character', character.id]);

    // Build character description text
    const descriptionParts: string[] = [
      `Character: ${character.name}`,
      character.fullName !== character.name ? `Full name: ${character.fullName}` : '',
      character.description ?? '',
      character.physicalDescription ? `Physical: ${JSON.stringify(character.physicalDescription)}` : '',
      character.psychology?.lie ? `Believes: ${character.psychology.lie}` : '',
      character.psychology?.truth ? `Truth: ${character.psychology.truth}` : '',
      character.psychology?.want ? `Wants: ${character.psychology.want}` : '',
      character.psychology?.need ? `Needs: ${character.psychology.need}` : '',
      character.psychology?.ghost ? `Past wound: ${character.psychology.ghost}` : ''
    ].filter(Boolean);

    const text = descriptionParts.join('\n');
    const embedding = await this.generateEmbedding(text);

    this.db.storeEmbedding(
      character.projectId,
      'character',
      character.id,
      text,
      0,
      embedding,
      this.config.model
    );
  }

  /**
   * Index all content in a project
   */
  async indexProject(projectId: string, onProgress?: (current: number, total: number) => void): Promise<void> {
    // Get all scenes
    const scenes = this.db.all<{id: string}>(
      'SELECT id FROM scenes WHERE project_id = ?',
      [projectId]
    );

    // Get all characters
    const characters = this.db.all<{id: string}>(
      'SELECT id FROM story_elements WHERE project_id = ? AND type = ?',
      [projectId, 'character']
    );

    const total = scenes.length + characters.length;
    let current = 0;

    // Index scenes
    for (const {id} of scenes) {
      const scene = this.db.getScene(id);
      if (scene) {
        await this.indexScene(scene);
      }
      current++;
      onProgress?.(current, total);
    }

    // Index characters
    for (const {id} of characters) {
      const character = this.db.getCharacter(id);
      if (character) {
        await this.indexCharacter(character);
      }
      current++;
      onProgress?.(current, total);
    }
  }

  // ==========================================================================
  // SEMANTIC SEARCH
  // ==========================================================================

  /**
   * Search for similar content
   */
  async semanticSearch(
    projectId: string,
    query: string,
    options: {
      entityTypes?: Embedding['entityType'][];
      limit?: number;
      minSimilarity?: number;
    } = {}
  ): Promise<SearchResult[]> {
    const {entityTypes, limit = 10, minSimilarity = 0.5} = options;

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Find similar
    let results = this.db.findSimilar(projectId, queryEmbedding, limit * 2);

    // Filter by entity type if specified
    if (entityTypes && entityTypes.length > 0) {
      results = results.filter(r => entityTypes.includes(r.entityType as Embedding['entityType']));
    }

    // Filter by minimum similarity
    results = results.filter(r => r.similarity >= minSimilarity);

    // Take top results
    results = results.slice(0, limit);

    // Enrich with entity info
    return results.map(r => {
      let title = '';

      if (r.entityType === 'scene') {
        const scene = this.db.getScene(r.entityId);
        title = scene?.title ?? 'Unknown Scene';
      } else if (r.entityType === 'character') {
        const char = this.db.getCharacter(r.entityId);
        title = char?.name ?? 'Unknown Character';
      }

      return {
        entityType: r.entityType,
        entityId: r.entityId,
        title,
        snippet: r.chunkText.substring(0, 200) + (r.chunkText.length > 200 ? '...' : ''),
        score: r.similarity,
        highlights: [{field: 'content', matches: [query]}]
      };
    });
  }

  // ==========================================================================
  // STORY BIBLE / RAG
  // ==========================================================================

  /**
   * Query the Story Bible with context
   */
  async queryStoryBible(query: StoryBibleQuery): Promise<StoryBibleResult> {
    // Semantic search for relevant content
    const searchResults = await this.semanticSearch(
      this.getCurrentProjectId(query),
      query.query,
      {
        entityTypes: query.filters?.entityTypes as Embedding['entityType'][] | undefined,
        limit: query.limit ?? 10
      }
    );

    // Get related consistency facts
    const relatedFacts: ConsistencyFact[] = [];
    for (const result of searchResults.slice(0, 5)) {
      const facts = this.db.getFactsForEntity(result.entityId);
      relatedFacts.push(...facts);
    }

    // Deduplicate facts
    const uniqueFacts = Array.from(
      new Map(relatedFacts.map(f => [f.id, f])).values()
    );

    return {
      query: query.query,
      results: searchResults,
      relatedFacts: uniqueFacts
    };
  }

  private getCurrentProjectId(query: StoryBibleQuery): string {
    // Extract project ID from context or use a default
    if (query.context?.currentSceneId) {
      const scene = this.db.getScene(query.context.currentSceneId);
      if (scene) return scene.projectId;
    }
    // In production, this would come from app state
    return '';
  }

  /**
   * Build RAG context for AI prompt
   */
  async buildRAGContext(
    projectId: string,
    query: string,
    maxTokens: number = 4000
  ): Promise<string> {
    const storyBible = await this.queryStoryBible({
      query,
      limit: 20
    });

    const contextParts: string[] = ['## Relevant Story Context\n'];
    let tokenEstimate = 0;
    const tokensPerChar = 0.25; // Rough estimate

    // Add search results
    for (const result of storyBible.results) {
      const entry = `### ${result.title} (${result.entityType})\n${result.snippet}\n\n`;
      const entryTokens = Math.ceil(entry.length * tokensPerChar);

      if (tokenEstimate + entryTokens > maxTokens * 0.7) break;

      contextParts.push(entry);
      tokenEstimate += entryTokens;
    }

    // Add relevant facts
    if (storyBible.relatedFacts.length > 0) {
      contextParts.push('## Established Facts\n');

      for (const fact of storyBible.relatedFacts) {
        const entry = `- [${fact.category}] ${fact.fact}\n`;
        const entryTokens = Math.ceil(entry.length * tokensPerChar);

        if (tokenEstimate + entryTokens > maxTokens) break;

        contextParts.push(entry);
        tokenEstimate += entryTokens;
      }
    }

    return contextParts.join('');
  }

  // ==========================================================================
  // CONSISTENCY CHECKING
  // ==========================================================================

  /**
   * Check for potential inconsistencies in new content
   */
  async checkConsistency(
    projectId: string,
    newContent: string
  ): Promise<{
    potentialIssues: {fact: string; conflictingText: string; severity: 'low' | 'medium' | 'high'}[];
  }> {
    const issues: {fact: string; conflictingText: string; severity: 'low' | 'medium' | 'high'}[] = [];

    // Get relevant facts based on content
    const contentEmbedding = await this.generateEmbedding(newContent);
    const similarContent = this.db.findSimilar(projectId, contentEmbedding, 20);

    // Get facts related to similar content
    const relatedFacts: ConsistencyFact[] = [];
    for (const item of similarContent) {
      const facts = this.db.getFactsForEntity(item.entityId);
      relatedFacts.push(...facts);
    }

    // Check each critical/important fact
    for (const fact of relatedFacts.filter(f => f.importance !== 'minor')) {
      // Simple keyword-based contradiction detection
      // In production, this would use an LLM for nuanced checking
      const factKeywords = this.extractKeywords(fact.fact);
      const contentLower = newContent.toLowerCase();

      // Check for negations of fact keywords
      for (const keyword of factKeywords) {
        const negationPatterns = [
          `not ${keyword}`,
          `never ${keyword}`,
          `no ${keyword}`,
          `isn't ${keyword}`,
          `wasn't ${keyword}`,
          `doesn't ${keyword}`,
          `didn't ${keyword}`
        ];

        for (const pattern of negationPatterns) {
          if (contentLower.includes(pattern)) {
            issues.push({
              fact: fact.fact,
              conflictingText: this.extractSentenceContaining(newContent, pattern),
              severity: fact.importance === 'critical' ? 'high' : 'medium'
            });
          }
        }
      }
    }

    return {potentialIssues: issues};
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once']);

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
  }

  private extractSentenceContaining(text: string, pattern: string): string {
    const sentences = text.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(pattern)) {
        return sentence.trim();
      }
    }
    return '';
  }

  // ==========================================================================
  // VOICE FINGERPRINTING
  // ==========================================================================

  /**
   * Analyze character dialogue to generate voice fingerprint
   */
  async analyzeCharacterVoice(characterId: string): Promise<VoiceFingerprint> {
    // Get all dialogue for this character
    const scenes = this.db.all<{content: string}>(
      `SELECT content FROM scenes
       WHERE character_ids LIKE ? AND content LIKE ?`,
      [`%"${characterId}"%`, '%"%']
    );

    // Extract dialogue (simplified - assumes quoted text is dialogue)
    const dialogueLines: string[] = [];
    for (const {content} of scenes) {
      const matches = content.match(/"[^"]+"/g) ?? [];
      dialogueLines.push(...matches.map(m => m.slice(1, -1)));
    }

    if (dialogueLines.length === 0) {
      // Return default fingerprint
      return this.defaultVoiceFingerprint();
    }

    // Analyze patterns
    const allText = dialogueLines.join(' ');
    const words = allText.toLowerCase().split(/\s+/);
    const sentences = dialogueLines;

    // Word frequency
    const wordFreq = new Map<string, number>();
    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) ?? 0) + 1);
    }

    // Find favored words (above average frequency, not common)
    const avgFreq = words.length / wordFreq.size;
    const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'to', 'of', 'and', 'in', 'that', 'have', 'for', 'not', 'on', 'with', 'as', 'at', 'this', 'but', 'be', 'or']);
    const favoredWords = Array.from(wordFreq.entries())
      .filter(([word, freq]) => freq > avgFreq * 1.5 && !commonWords.has(word) && word.length > 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    // Sentence length analysis
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const sentenceVariation = this.calculateVariation(sentenceLengths);

    // Vocabulary complexity (using word length as proxy)
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    const vocabularyComplexity: VoiceFingerprint['vocabularyComplexity'] =
      avgWordLength < 4 ? 'simple' :
      avgWordLength < 5 ? 'moderate' :
      avgWordLength < 6 ? 'complex' : 'erudite';

    // Detect catchphrases (repeated exact phrases)
    const phrases = this.extractPhrases(dialogueLines, 3, 6);
    const catchphrases = phrases
      .filter(p => p.count >= 3)
      .map(p => p.phrase)
      .slice(0, 5);

    return {
      vocabularyComplexity,
      favoredWords,
      avoidedWords: [], // Would need more sophisticated analysis
      catchphrases,
      averageSentenceLength: Math.round(avgSentenceLength),
      sentenceVariation: sentenceVariation < 5 ? 'low' : sentenceVariation < 10 ? 'medium' : 'high',
      preferredStructures: ['simple'], // Simplified
      formalityLevel: this.estimateFormality(allText),
      emotionalExpressiveness: this.estimateExpressiveness(allText),
      languageTics: [],
      sampleDialogue: dialogueLines.slice(0, 5),
      sampleInternalMonologue: []
    };
  }

  private defaultVoiceFingerprint(): VoiceFingerprint {
    return {
      vocabularyComplexity: 'moderate',
      favoredWords: [],
      avoidedWords: [],
      catchphrases: [],
      averageSentenceLength: 15,
      sentenceVariation: 'medium',
      preferredStructures: ['simple', 'compound'],
      formalityLevel: 50,
      emotionalExpressiveness: 50,
      languageTics: [],
      sampleDialogue: [],
      sampleInternalMonologue: []
    };
  }

  private calculateVariation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private extractPhrases(
    texts: string[],
    minWords: number,
    maxWords: number
  ): {phrase: string; count: number}[] {
    const phraseCount = new Map<string, number>();

    for (const text of texts) {
      const words = text.toLowerCase().split(/\s+/);
      for (let len = minWords; len <= maxWords; len++) {
        for (let i = 0; i <= words.length - len; i++) {
          const phrase = words.slice(i, i + len).join(' ');
          phraseCount.set(phrase, (phraseCount.get(phrase) ?? 0) + 1);
        }
      }
    }

    return Array.from(phraseCount.entries())
      .map(([phrase, count]) => ({phrase, count}))
      .sort((a, b) => b.count - a.count);
  }

  private estimateFormality(text: string): number {
    // Simple heuristics for formality
    const formalIndicators = ['therefore', 'however', 'furthermore', 'nevertheless', 'accordingly', 'consequently', 'thus', 'hence', 'moreover'];
    const informalIndicators = ['gonna', 'wanna', 'gotta', 'yeah', 'nope', 'kinda', 'sorta', 'stuff', 'things', 'like'];

    const words = text.toLowerCase().split(/\s+/);
    let formalCount = 0;
    let informalCount = 0;

    for (const word of words) {
      if (formalIndicators.includes(word)) formalCount++;
      if (informalIndicators.includes(word)) informalCount++;
    }

    const total = formalCount + informalCount;
    if (total === 0) return 50;

    return Math.round((formalCount / total) * 100);
  }

  private estimateExpressiveness(text: string): number {
    // Count exclamation marks, question marks, and emotional words
    const exclamations = (text.match(/!/g) ?? []).length;
    const questions = (text.match(/\?/g) ?? []).length;
    const emotionalWords = ['love', 'hate', 'amazing', 'terrible', 'wonderful', 'awful', 'incredible', 'horrible', 'fantastic', 'dreadful', 'excited', 'worried', 'happy', 'sad', 'angry', 'afraid'];

    const words = text.toLowerCase().split(/\s+/);
    let emotionalCount = 0;
    for (const word of words) {
      if (emotionalWords.includes(word)) emotionalCount++;
    }

    const score = (exclamations * 2 + questions + emotionalCount) / Math.max(1, words.length / 100);
    return Math.min(100, Math.round(score * 10));
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * Chunk text into overlapping segments
   */
  private chunkText(text: string): string[] {
    const chunks: string[] = [];
    const words = text.split(/\s+/);

    for (let i = 0; i < words.length; i += this.config.chunkSize - this.config.chunkOverlap) {
      const chunk = words.slice(i, i + this.config.chunkSize).join(' ');
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
    }

    return chunks;
  }
}
