/**
 * CodexEngine - Centralized World Knowledge Database (Lorebook)
 *
 * Like Novelcrafter's Codex or NovelAI's Lorebook - a centralized
 * database of all story knowledge that AI can pull from for consistency.
 *
 * Features:
 * - Hierarchical knowledge organization
 * - Auto-linking mentions to entries
 * - Context injection for AI prompts
 * - Cross-reference tracking
 * - Version history for entries
 * - Spoiler/reveal tracking
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Entry Types
// ============================================================================

export enum CodexEntryType {
  CHARACTER = 'character',
  LOCATION = 'location',
  ITEM = 'item',
  FACTION = 'faction',
  EVENT = 'event',
  CONCEPT = 'concept',
  SPECIES = 'species',
  MAGIC_SYSTEM = 'magic_system',
  TECHNOLOGY = 'technology',
  CULTURE = 'culture',
  LANGUAGE = 'language',
  RELIGION = 'religion',
  TIMELINE = 'timeline',
  RELATIONSHIP = 'relationship',
  SECRET = 'secret',
  PLOT_THREAD = 'plot_thread',
  CUSTOM = 'custom',
}

export enum EntryVisibility {
  PUBLIC = 'public',           // Known to all characters
  FACTION_KNOWN = 'faction',   // Known to specific factions
  CHARACTER_KNOWN = 'character', // Known to specific characters
  SECRET = 'secret',           // Hidden knowledge
  READER_ONLY = 'reader_only', // Meta knowledge for author
}

export enum RevealStatus {
  NOT_REVEALED = 'not_revealed',
  HINTED = 'hinted',
  PARTIALLY_REVEALED = 'partially_revealed',
  FULLY_REVEALED = 'fully_revealed',
}

// ============================================================================
// Codex Entry Structure
// ============================================================================

export interface CodexEntry {
  entryId: string;
  projectId: string;

  // Basic info
  name: string;
  aliases: string[];
  entryType: CodexEntryType;

  // Content
  summary: string;           // Short description for quick reference
  fullDescription: string;   // Detailed information
  aiContextSnippet: string;  // Optimized text for AI context injection

  // Organization
  category: string;
  subcategory?: string;
  tags: string[];
  parentEntryId?: string;    // For hierarchical organization
  childEntryIds: string[];

  // Trigger words (when to inject this entry into AI context)
  triggerWords: string[];    // Words that activate this entry
  triggerPhrases: string[];  // Phrases that activate this entry
  alwaysInclude: boolean;    // Always include in AI context

  // Cross-references
  relatedEntryIds: string[];
  mentionedInChapters: number[];
  firstMentionChapter?: number;
  firstRevealChapter?: number;

  // Visibility and reveals
  visibility: EntryVisibility;
  revealStatus: RevealStatus;
  knownByCharacterIds: string[];
  knownByFactionIds: string[];

  // Spoiler management
  containsSpoilers: boolean;
  spoilerForChapters: number[];
  spoilerWarning?: string;

  // Metadata
  importance: 'critical' | 'major' | 'moderate' | 'minor' | 'background';
  canonSource?: string;
  isCanon: boolean;
  divergenceNotes?: string;

  // Version control
  version: number;
  createdAt: Date;
  updatedAt: Date;
  changeHistory: EntryChange[];

  // Custom fields
  customFields: Record<string, string | number | boolean | string[]>;
}

export interface EntryChange {
  changeId: string;
  timestamp: Date;
  previousVersion: number;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  reason?: string;
}

// ============================================================================
// Specialized Entry Types
// ============================================================================

export interface CharacterCodexEntry extends CodexEntry {
  entryType: CodexEntryType.CHARACTER;
  customFields: {
    species: string;
    age: number | string;
    gender: string;
    occupation: string;
    status: 'alive' | 'dead' | 'unknown' | 'undead';
    affiliations: string[];
    physicalDescription: string;
    personalityTraits: string[];
    motivations: string[];
    secrets: string[];
    relationships: string; // JSON string of relationships
  };
}

export interface LocationCodexEntry extends CodexEntry {
  entryType: CodexEntryType.LOCATION;
  customFields: {
    locationType: string;
    parentLocation: string;
    climate: string;
    population: string;
    government: string;
    notableFeatures: string[];
    dangers: string[];
    resources: string[];
  };
}

export interface ItemCodexEntry extends CodexEntry {
  entryType: CodexEntryType.ITEM;
  customFields: {
    itemType: string;
    rarity: string;
    origin: string;
    currentOwner: string;
    previousOwners: string[];
    abilities: string[];
    limitations: string[];
    significance: string;
  };
}

// ============================================================================
// Context Injection
// ============================================================================

export interface ContextInjectionRequest {
  projectId: string;
  currentChapter: number;
  sceneText: string;
  maxTokens: number;
  prioritizeTypes?: CodexEntryType[];
  excludeEntryIds?: string[];
  includeSpoilers?: boolean;
  forCharacterId?: string;  // POV character for visibility filtering
}

export interface ContextInjectionResult {
  entries: CodexEntry[];
  totalTokensUsed: number;
  injectionText: string;
  triggeredBy: { entryId: string; trigger: string }[];
}

// ============================================================================
// Search and Query
// ============================================================================

export interface CodexSearchQuery {
  projectId: string;
  searchText?: string;
  entryTypes?: CodexEntryType[];
  tags?: string[];
  visibility?: EntryVisibility[];
  importance?: CodexEntry['importance'][];
  mentionedInChapter?: number;
  knownByCharacterId?: string;
  relatedToEntryId?: string;
  limit?: number;
  offset?: number;
}

export interface CodexSearchResult {
  entries: CodexEntry[];
  totalCount: number;
  hasMore: boolean;
}

// ============================================================================
// Cross-Reference Graph
// ============================================================================

export interface CrossReferenceNode {
  entryId: string;
  entryName: string;
  entryType: CodexEntryType;
  connections: {
    targetEntryId: string;
    relationshipType: string;
    strength: number; // 0-1
  }[];
}

export interface CrossReferenceGraph {
  nodes: CrossReferenceNode[];
  clusters: {
    clusterId: string;
    clusterName: string;
    entryIds: string[];
    primaryType: CodexEntryType;
  }[];
}

// ============================================================================
// Main Engine
// ============================================================================

export class CodexEngine {
  private entries: Map<string, CodexEntry> = new Map();

  // Indexes for fast lookup
  private entriesByProject: Map<string, string[]> = new Map();
  private entriesByType: Map<CodexEntryType, string[]> = new Map();
  private entriesByTag: Map<string, string[]> = new Map();
  private triggerIndex: Map<string, string[]> = new Map(); // word -> entryIds

  // Statistics
  private totalEntries: number = 0;

  constructor() {
    this.initializeIndexes();
  }

  private initializeIndexes(): void {
    for (const type of Object.values(CodexEntryType)) {
      this.entriesByType.set(type, []);
    }
  }

  // ============================================================================
  // Entry Management
  // ============================================================================

  createEntry(
    projectId: string,
    name: string,
    entryType: CodexEntryType,
    data: Partial<Omit<CodexEntry, 'entryId' | 'projectId' | 'name' | 'entryType' | 'createdAt' | 'updatedAt' | 'version' | 'changeHistory'>>
  ): CodexEntry {
    const entryId = uuidv4();
    const now = new Date();

    const entry: CodexEntry = {
      entryId,
      projectId,
      name,
      aliases: data.aliases || [],
      entryType,
      summary: data.summary || '',
      fullDescription: data.fullDescription || '',
      aiContextSnippet: data.aiContextSnippet || data.summary || '',
      category: data.category || 'Uncategorized',
      subcategory: data.subcategory,
      tags: data.tags || [],
      parentEntryId: data.parentEntryId,
      childEntryIds: data.childEntryIds || [],
      triggerWords: data.triggerWords || [name.toLowerCase()],
      triggerPhrases: data.triggerPhrases || [],
      alwaysInclude: data.alwaysInclude || false,
      relatedEntryIds: data.relatedEntryIds || [],
      mentionedInChapters: data.mentionedInChapters || [],
      firstMentionChapter: data.firstMentionChapter,
      firstRevealChapter: data.firstRevealChapter,
      visibility: data.visibility || EntryVisibility.PUBLIC,
      revealStatus: data.revealStatus || RevealStatus.NOT_REVEALED,
      knownByCharacterIds: data.knownByCharacterIds || [],
      knownByFactionIds: data.knownByFactionIds || [],
      containsSpoilers: data.containsSpoilers || false,
      spoilerForChapters: data.spoilerForChapters || [],
      spoilerWarning: data.spoilerWarning,
      importance: data.importance || 'moderate',
      canonSource: data.canonSource,
      isCanon: data.isCanon ?? false,
      divergenceNotes: data.divergenceNotes,
      version: 1,
      createdAt: now,
      updatedAt: now,
      changeHistory: [],
      customFields: data.customFields || {},
    };

    this.entries.set(entryId, entry);
    this.updateIndexes(entry);
    this.totalEntries++;

    return entry;
  }

  updateEntry(
    entryId: string,
    updates: Partial<Omit<CodexEntry, 'entryId' | 'projectId' | 'createdAt' | 'version' | 'changeHistory'>>,
    changeReason?: string
  ): CodexEntry {
    const entry = this.entries.get(entryId);
    if (!entry) throw new Error(`Entry not found: ${entryId}`);

    // Record changes
    for (const [key, newValue] of Object.entries(updates)) {
      const oldValue = (entry as unknown as Record<string, unknown>)[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        entry.changeHistory.push({
          changeId: uuidv4(),
          timestamp: new Date(),
          previousVersion: entry.version,
          fieldChanged: key,
          oldValue: JSON.stringify(oldValue),
          newValue: JSON.stringify(newValue),
          reason: changeReason,
        });
      }
    }

    // Remove from old indexes
    this.removeFromIndexes(entry);

    // Apply updates
    Object.assign(entry, updates);
    entry.version++;
    entry.updatedAt = new Date();

    // Update indexes
    this.updateIndexes(entry);

    return entry;
  }

  deleteEntry(entryId: string): boolean {
    const entry = this.entries.get(entryId);
    if (!entry) return false;

    this.removeFromIndexes(entry);
    this.entries.delete(entryId);
    this.totalEntries--;

    // Remove from parent's children
    if (entry.parentEntryId) {
      const parent = this.entries.get(entry.parentEntryId);
      if (parent) {
        parent.childEntryIds = parent.childEntryIds.filter(id => id !== entryId);
      }
    }

    // Remove from related entries
    for (const relatedId of entry.relatedEntryIds) {
      const related = this.entries.get(relatedId);
      if (related) {
        related.relatedEntryIds = related.relatedEntryIds.filter(id => id !== entryId);
      }
    }

    return true;
  }

  getEntry(entryId: string): CodexEntry | undefined {
    return this.entries.get(entryId);
  }

  // ============================================================================
  // Index Management
  // ============================================================================

  private updateIndexes(entry: CodexEntry): void {
    // By project
    if (!this.entriesByProject.has(entry.projectId)) {
      this.entriesByProject.set(entry.projectId, []);
    }
    const projectEntries = this.entriesByProject.get(entry.projectId)!;
    if (!projectEntries.includes(entry.entryId)) {
      projectEntries.push(entry.entryId);
    }

    // By type
    const typeEntries = this.entriesByType.get(entry.entryType)!;
    if (!typeEntries.includes(entry.entryId)) {
      typeEntries.push(entry.entryId);
    }

    // By tags
    for (const tag of entry.tags) {
      if (!this.entriesByTag.has(tag)) {
        this.entriesByTag.set(tag, []);
      }
      const tagEntries = this.entriesByTag.get(tag)!;
      if (!tagEntries.includes(entry.entryId)) {
        tagEntries.push(entry.entryId);
      }
    }

    // Trigger words
    for (const trigger of [...entry.triggerWords, ...entry.aliases.map(a => a.toLowerCase())]) {
      const normalizedTrigger = trigger.toLowerCase();
      if (!this.triggerIndex.has(normalizedTrigger)) {
        this.triggerIndex.set(normalizedTrigger, []);
      }
      const triggerEntries = this.triggerIndex.get(normalizedTrigger)!;
      if (!triggerEntries.includes(entry.entryId)) {
        triggerEntries.push(entry.entryId);
      }
    }
  }

  private removeFromIndexes(entry: CodexEntry): void {
    // By project
    const projectEntries = this.entriesByProject.get(entry.projectId);
    if (projectEntries) {
      const idx = projectEntries.indexOf(entry.entryId);
      if (idx !== -1) projectEntries.splice(idx, 1);
    }

    // By type
    const typeEntries = this.entriesByType.get(entry.entryType);
    if (typeEntries) {
      const idx = typeEntries.indexOf(entry.entryId);
      if (idx !== -1) typeEntries.splice(idx, 1);
    }

    // By tags
    for (const tag of entry.tags) {
      const tagEntries = this.entriesByTag.get(tag);
      if (tagEntries) {
        const idx = tagEntries.indexOf(entry.entryId);
        if (idx !== -1) tagEntries.splice(idx, 1);
      }
    }

    // Trigger words
    for (const trigger of [...entry.triggerWords, ...entry.aliases.map(a => a.toLowerCase())]) {
      const normalizedTrigger = trigger.toLowerCase();
      const triggerEntries = this.triggerIndex.get(normalizedTrigger);
      if (triggerEntries) {
        const idx = triggerEntries.indexOf(entry.entryId);
        if (idx !== -1) triggerEntries.splice(idx, 1);
      }
    }
  }

  // ============================================================================
  // Context Injection (for AI prompts)
  // ============================================================================

  getContextInjection(request: ContextInjectionRequest): ContextInjectionResult {
    const triggeredBy: { entryId: string; trigger: string }[] = [];
    const matchedEntryIds = new Set<string>();

    // Normalize text for matching
    const normalizedText = request.sceneText.toLowerCase();
    const words = normalizedText.split(/\s+/);

    // Find entries triggered by text
    for (const word of words) {
      const triggered = this.triggerIndex.get(word);
      if (triggered) {
        for (const entryId of triggered) {
          if (!matchedEntryIds.has(entryId)) {
            matchedEntryIds.add(entryId);
            triggeredBy.push({ entryId, trigger: word });
          }
        }
      }
    }

    // Check phrase triggers
    for (const entry of this.entries.values()) {
      if (entry.projectId !== request.projectId) continue;

      for (const phrase of entry.triggerPhrases) {
        if (normalizedText.includes(phrase.toLowerCase()) && !matchedEntryIds.has(entry.entryId)) {
          matchedEntryIds.add(entry.entryId);
          triggeredBy.push({ entryId: entry.entryId, trigger: phrase });
        }
      }

      // Add always-include entries
      if (entry.alwaysInclude && !matchedEntryIds.has(entry.entryId)) {
        matchedEntryIds.add(entry.entryId);
        triggeredBy.push({ entryId: entry.entryId, trigger: 'always_include' });
      }
    }

    // Filter and sort entries
    let entries = Array.from(matchedEntryIds)
      .map(id => this.entries.get(id))
      .filter((e): e is CodexEntry => e !== undefined)
      .filter(e => !request.excludeEntryIds?.includes(e.entryId))
      .filter(e => request.includeSpoilers || !e.containsSpoilers || !e.spoilerForChapters.includes(request.currentChapter));

    // Filter by visibility if POV character specified
    if (request.forCharacterId) {
      entries = entries.filter(e => {
        if (e.visibility === EntryVisibility.PUBLIC) return true;
        if (e.visibility === EntryVisibility.READER_ONLY) return true;
        if (e.visibility === EntryVisibility.CHARACTER_KNOWN) {
          return e.knownByCharacterIds.includes(request.forCharacterId!);
        }
        return false;
      });
    }

    // Prioritize by type if specified
    if (request.prioritizeTypes?.length) {
      entries.sort((a, b) => {
        const aIdx = request.prioritizeTypes!.indexOf(a.entryType);
        const bIdx = request.prioritizeTypes!.indexOf(b.entryType);
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });
    }

    // Sort by importance
    const importanceOrder = { critical: 0, major: 1, moderate: 2, minor: 3, background: 4 };
    entries.sort((a, b) => importanceOrder[a.importance] - importanceOrder[b.importance]);

    // Build injection text with token limit
    let totalTokens = 0;
    const includedEntries: CodexEntry[] = [];
    const injectionParts: string[] = [];

    for (const entry of entries) {
      const snippet = entry.aiContextSnippet || entry.summary;
      const estimatedTokens = Math.ceil(snippet.length / 4);

      if (totalTokens + estimatedTokens <= request.maxTokens) {
        includedEntries.push(entry);
        injectionParts.push(`[${entry.entryType.toUpperCase()}: ${entry.name}] ${snippet}`);
        totalTokens += estimatedTokens;
      }
    }

    return {
      entries: includedEntries,
      totalTokensUsed: totalTokens,
      injectionText: injectionParts.length > 0
        ? `## World Knowledge\n${injectionParts.join('\n\n')}`
        : '',
      triggeredBy: triggeredBy.filter(t => includedEntries.some(e => e.entryId === t.entryId)),
    };
  }

  // ============================================================================
  // Search
  // ============================================================================

  search(query: CodexSearchQuery): CodexSearchResult {
    let results = Array.from(this.entries.values())
      .filter(e => e.projectId === query.projectId);

    // Filter by search text
    if (query.searchText) {
      const searchLower = query.searchText.toLowerCase();
      results = results.filter(e =>
        e.name.toLowerCase().includes(searchLower) ||
        e.aliases.some(a => a.toLowerCase().includes(searchLower)) ||
        e.summary.toLowerCase().includes(searchLower) ||
        e.tags.some(t => t.toLowerCase().includes(searchLower))
      );
    }

    // Filter by type
    if (query.entryTypes?.length) {
      results = results.filter(e => query.entryTypes!.includes(e.entryType));
    }

    // Filter by tags
    if (query.tags?.length) {
      results = results.filter(e => query.tags!.some(t => e.tags.includes(t)));
    }

    // Filter by visibility
    if (query.visibility?.length) {
      results = results.filter(e => query.visibility!.includes(e.visibility));
    }

    // Filter by importance
    if (query.importance?.length) {
      results = results.filter(e => query.importance!.includes(e.importance));
    }

    // Filter by chapter mention
    if (query.mentionedInChapter !== undefined) {
      results = results.filter(e => e.mentionedInChapters.includes(query.mentionedInChapter!));
    }

    // Filter by character knowledge
    if (query.knownByCharacterId) {
      results = results.filter(e => e.knownByCharacterIds.includes(query.knownByCharacterId!));
    }

    // Filter by relation
    if (query.relatedToEntryId) {
      results = results.filter(e => e.relatedEntryIds.includes(query.relatedToEntryId!));
    }

    const totalCount = results.length;

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    results = results.slice(offset, offset + limit);

    return {
      entries: results,
      totalCount,
      hasMore: offset + results.length < totalCount,
    };
  }

  // ============================================================================
  // Cross-References
  // ============================================================================

  linkEntries(entryIdA: string, entryIdB: string): void {
    const entryA = this.entries.get(entryIdA);
    const entryB = this.entries.get(entryIdB);

    if (!entryA || !entryB) throw new Error('Entry not found');

    if (!entryA.relatedEntryIds.includes(entryIdB)) {
      entryA.relatedEntryIds.push(entryIdB);
    }
    if (!entryB.relatedEntryIds.includes(entryIdA)) {
      entryB.relatedEntryIds.push(entryIdA);
    }
  }

  unlinkEntries(entryIdA: string, entryIdB: string): void {
    const entryA = this.entries.get(entryIdA);
    const entryB = this.entries.get(entryIdB);

    if (entryA) {
      entryA.relatedEntryIds = entryA.relatedEntryIds.filter(id => id !== entryIdB);
    }
    if (entryB) {
      entryB.relatedEntryIds = entryB.relatedEntryIds.filter(id => id !== entryIdA);
    }
  }

  getCrossReferenceGraph(projectId: string): CrossReferenceGraph {
    const projectEntries = (this.entriesByProject.get(projectId) || [])
      .map(id => this.entries.get(id))
      .filter((e): e is CodexEntry => e !== undefined);

    const nodes: CrossReferenceNode[] = projectEntries.map(entry => ({
      entryId: entry.entryId,
      entryName: entry.name,
      entryType: entry.entryType,
      connections: entry.relatedEntryIds.map(relatedId => {
        const related = this.entries.get(relatedId);
        return {
          targetEntryId: relatedId,
          relationshipType: 'related',
          strength: related?.importance === 'critical' ? 1.0 :
                    related?.importance === 'major' ? 0.8 :
                    related?.importance === 'moderate' ? 0.6 : 0.4,
        };
      }),
    }));

    // Find clusters by type
    const clusters: CrossReferenceGraph['clusters'] = [];
    const typeGroups = new Map<CodexEntryType, string[]>();

    for (const entry of projectEntries) {
      if (!typeGroups.has(entry.entryType)) {
        typeGroups.set(entry.entryType, []);
      }
      typeGroups.get(entry.entryType)!.push(entry.entryId);
    }

    for (const [type, entryIds] of typeGroups) {
      if (entryIds.length > 1) {
        clusters.push({
          clusterId: uuidv4(),
          clusterName: `${type} cluster`,
          entryIds,
          primaryType: type,
        });
      }
    }

    return { nodes, clusters };
  }

  // ============================================================================
  // Chapter Tracking
  // ============================================================================

  recordMention(entryId: string, chapterNumber: number): void {
    const entry = this.entries.get(entryId);
    if (!entry) throw new Error(`Entry not found: ${entryId}`);

    if (!entry.mentionedInChapters.includes(chapterNumber)) {
      entry.mentionedInChapters.push(chapterNumber);
      entry.mentionedInChapters.sort((a, b) => a - b);
    }

    if (entry.firstMentionChapter === undefined || chapterNumber < entry.firstMentionChapter) {
      entry.firstMentionChapter = chapterNumber;
    }
  }

  recordReveal(entryId: string, chapterNumber: number, revealStatus: RevealStatus): void {
    const entry = this.entries.get(entryId);
    if (!entry) throw new Error(`Entry not found: ${entryId}`);

    entry.revealStatus = revealStatus;

    if (entry.firstRevealChapter === undefined || chapterNumber < entry.firstRevealChapter) {
      entry.firstRevealChapter = chapterNumber;
    }
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  getEntriesByProject(projectId: string): CodexEntry[] {
    const entryIds = this.entriesByProject.get(projectId) || [];
    return entryIds
      .map(id => this.entries.get(id))
      .filter((e): e is CodexEntry => e !== undefined);
  }

  getEntriesByType(entryType: CodexEntryType): CodexEntry[] {
    const entryIds = this.entriesByType.get(entryType) || [];
    return entryIds
      .map(id => this.entries.get(id))
      .filter((e): e is CodexEntry => e !== undefined);
  }

  getEntriesByTag(tag: string): CodexEntry[] {
    const entryIds = this.entriesByTag.get(tag) || [];
    return entryIds
      .map(id => this.entries.get(id))
      .filter((e): e is CodexEntry => e !== undefined);
  }

  // ============================================================================
  // Standard API Methods
  // ============================================================================

  getStats(): {
    totalEntries: number;
    entriesByType: Record<string, number>;
    projectCount: number;
    tagCount: number;
    triggerWordCount: number;
  } {
    const entriesByType: Record<string, number> = {};
    for (const [type, entries] of this.entriesByType) {
      entriesByType[type] = entries.length;
    }

    return {
      totalEntries: this.totalEntries,
      entriesByType,
      projectCount: this.entriesByProject.size,
      tagCount: this.entriesByTag.size,
      triggerWordCount: this.triggerIndex.size,
    };
  }

  clear(): void {
    this.entries.clear();
    this.entriesByProject.clear();
    this.entriesByTag.clear();
    this.triggerIndex.clear();
    this.initializeIndexes();
    this.totalEntries = 0;
  }

  exportToJSON(): string {
    return JSON.stringify({
      entries: Array.from(this.entries.entries()),
      totalEntries: this.totalEntries,
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.clear();

    for (const [entryId, entry] of data.entries) {
      this.entries.set(entryId, entry);
      this.updateIndexes(entry);
    }

    this.totalEntries = data.totalEntries;
  }
}

export default CodexEngine;
