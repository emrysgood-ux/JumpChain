/**
 * Knowledge Tracker
 *
 * Tracks what each character knows throughout the story to prevent
 * characters from knowing things they shouldn't (dramatic irony violations).
 * Essential for maintaining reader trust in 12,000+ chapter narratives.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

export enum KnowledgeType {
  // Facts
  FACT = 'fact',                    // General information
  SECRET = 'secret',                // Hidden information
  LIE = 'lie',                      // Misinformation believed true
  RUMOR = 'rumor',                  // Unverified information
  PROPHECY = 'prophecy',            // Future knowledge

  // Skills/Abilities
  SKILL = 'skill',                  // How to do something
  LANGUAGE = 'language',            // Language ability
  MAGIC_KNOWLEDGE = 'magic_knowledge',  // Magic/power understanding

  // Social
  IDENTITY = 'identity',            // Who someone is
  RELATIONSHIP = 'relationship',    // Relationship between characters
  LOCATION = 'location',            // Where something/someone is
  HISTORY = 'history',              // Past events

  // Plot
  PLAN = 'plan',                    // Someone's intentions
  CONSPIRACY = 'conspiracy',        // Hidden machinations
  BETRAYAL = 'betrayal',            // Treachery information
  DEATH = 'death',                  // Someone's death

  // World
  WORLD_SECRET = 'world_secret',    // Hidden truth about the world
  TECHNOLOGY = 'technology',        // Technical knowledge
  CULTURAL = 'cultural'             // Cultural knowledge
}

export enum KnowledgeSource {
  DIRECT_EXPERIENCE = 'direct_experience',   // Witnessed/experienced
  TOLD = 'told',                             // Someone told them
  READ = 'read',                             // Read in book/document
  OVERHEARD = 'overheard',                   // Eavesdropped
  DEDUCED = 'deduced',                       // Figured out logically
  VISION = 'vision',                         // Magical/prophetic vision
  TELEPATHY = 'telepathy',                   // Mind reading
  INHERITED = 'inherited',                   // Racial/ancestral memory
  RUMOR = 'rumor',                           // Heard through gossip
  TAUGHT = 'taught',                         // Formally taught
  DISCOVERED = 'discovered',                 // Found evidence
  REVELATION = 'revelation',                 // Divine/magical revelation
  ASSUMED = 'assumed'                        // Assumed without verification
}

export enum KnowledgeCertainty {
  ABSOLUTE = 'absolute',         // 100% certain (witnessed, proven)
  HIGH = 'high',                 // Very confident
  MODERATE = 'moderate',         // Reasonably sure
  LOW = 'low',                   // Uncertain
  SUSPECTED = 'suspected',       // Just a suspicion
  WRONG = 'wrong'                // Believes false information
}

export enum KnowledgeStatus {
  CURRENT = 'current',           // Still valid knowledge
  OUTDATED = 'outdated',         // Information has changed
  FORGOTTEN = 'forgotten',       // Character forgot
  SUPPRESSED = 'suppressed',     // Deliberately suppressed memory
  CORRECTED = 'corrected',       // Was wrong, now corrected
  LOST = 'lost'                  // Knowledge lost (amnesia, etc.)
}

export enum KnowledgeErrorType {
  PREMATURE_KNOWLEDGE = 'premature_knowledge',     // Knows before learning
  IMPOSSIBLE_KNOWLEDGE = 'impossible_knowledge',   // Can't possibly know
  FORGOTTEN_KNOWLEDGE = 'forgotten_knowledge',     // Uses forgotten info
  WRONG_KNOWLEDGE = 'wrong_knowledge',             // Acts on misinformation incorrectly
  INCONSISTENT = 'inconsistent',                   // Knowledge contradicts itself
  TIMELINE_ERROR = 'timeline_error',               // Knows before event occurred
  SECRET_LEAK = 'secret_leak',                     // Knows secret without learning it
  LOCATION_ERROR = 'location_error',               // Knows despite not being there
  LANGUAGE_ERROR = 'language_error'                // Understands unknown language
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface KnowledgePiece {
  id: string;
  name: string;                     // Short identifier
  description: string;              // Full description
  type: KnowledgeType;
  relatedEntities: string[];        // Entity IDs this knowledge is about
  relatedChapters: number[];        // Chapters where this is relevant
  truthValue: boolean;              // Is it actually true?
  contradicts?: string[];           // IDs of contradicting knowledge
  requires?: string[];              // IDs of prerequisite knowledge
  tags: string[];
  createdChapter: number;           // When this knowledge came into existence
  expiresChapter?: number;          // When this knowledge becomes outdated
}

export interface CharacterKnowledge {
  characterId: string;
  characterName: string;
  knowledgeId: string;
  knowledgeName: string;
  source: KnowledgeSource;
  sourceCharacterId?: string;       // Who told them
  sourceLocation?: string;          // Where they learned it
  certainty: KnowledgeCertainty;
  status: KnowledgeStatus;
  learnedChapter: number;
  learnedContext: string;           // How they learned it
  forgottenChapter?: number;
  updatedChapters: number[];        // Chapters where knowledge was updated
  notes: string;
}

export interface KnowledgeTransfer {
  id: string;
  knowledgeId: string;
  fromCharacterId?: string;         // Null if discovered
  toCharacterId: string;
  chapterNumber: number;
  method: KnowledgeSource;
  wasIntentional: boolean;
  witnesses: string[];
  sceneDescription: string;
  certaintyTransferred: KnowledgeCertainty;
}

export interface KnowledgeError {
  id: string;
  errorType: KnowledgeErrorType;
  severity: 'info' | 'warning' | 'error' | 'critical';
  characterId: string;
  characterName: string;
  knowledgeId: string;
  knowledgeName: string;
  chapterNumber: number;
  message: string;
  expectedBehavior?: string;
  suggestion?: string;
}

export interface KnowledgeValidationContext {
  currentChapter: number;
  characterLocations: Map<string, string>;   // Character ID -> Location ID
  characterLanguages: Map<string, string[]>; // Character ID -> Language IDs
  deadCharacters: Set<string>;
}

export interface KnowledgeQuery {
  characterId?: string;
  knowledgeType?: KnowledgeType;
  source?: KnowledgeSource;
  certainty?: KnowledgeCertainty;
  status?: KnowledgeStatus;
  chapterRange?: { start: number; end: number };
  relatedEntity?: string;
  tags?: string[];
}

export interface CharacterKnowledgeProfile {
  characterId: string;
  characterName: string;
  totalKnowledge: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  byCertainty: Record<string, number>;
  secrets: number;
  misinformation: number;
  recentlyLearned: CharacterKnowledge[];
  forgotten: CharacterKnowledge[];
}

// ============================================================================
// KNOWLEDGE TRACKER
// ============================================================================

export class KnowledgeTracker {
  private knowledge: Map<string, KnowledgePiece> = new Map();
  private characterKnowledge: Map<string, Map<string, CharacterKnowledge>> = new Map();
  private transfers: KnowledgeTransfer[] = [];
  private errors: KnowledgeError[] = [];
  private seed: number = Date.now();

  constructor() {
    // Infrastructure for future deterministic testing
    void this._seededRandom;
  }

  // ==========================================================================
  // SEEDING
  // ==========================================================================

  setSeed(seed: number): void {
    this.seed = seed;
  }

  private _seededRandom(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // ==========================================================================
  // KNOWLEDGE PIECE MANAGEMENT
  // ==========================================================================

  createKnowledge(data: {
    name: string;
    description: string;
    type: KnowledgeType;
    createdChapter: number;
    relatedEntities?: string[];
    relatedChapters?: number[];
    truthValue?: boolean;
    contradicts?: string[];
    requires?: string[];
    tags?: string[];
    expiresChapter?: number;
  }): KnowledgePiece {
    const piece: KnowledgePiece = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      type: data.type,
      relatedEntities: data.relatedEntities || [],
      relatedChapters: data.relatedChapters || [],
      truthValue: data.truthValue ?? true,
      contradicts: data.contradicts,
      requires: data.requires,
      tags: data.tags || [],
      createdChapter: data.createdChapter,
      expiresChapter: data.expiresChapter
    };

    this.knowledge.set(piece.id, piece);
    return piece;
  }

  getKnowledge(id: string): KnowledgePiece | undefined {
    return this.knowledge.get(id);
  }

  getAllKnowledge(): KnowledgePiece[] {
    return Array.from(this.knowledge.values());
  }

  updateKnowledge(id: string, updates: Partial<KnowledgePiece>): boolean {
    const piece = this.knowledge.get(id);
    if (!piece) return false;

    Object.assign(piece, updates);
    return true;
  }

  findKnowledgeByName(name: string): KnowledgePiece | undefined {
    return this.getAllKnowledge().find(k =>
      k.name.toLowerCase() === name.toLowerCase()
    );
  }

  findKnowledgeByType(type: KnowledgeType): KnowledgePiece[] {
    return this.getAllKnowledge().filter(k => k.type === type);
  }

  // ==========================================================================
  // CHARACTER KNOWLEDGE MANAGEMENT
  // ==========================================================================

  giveKnowledge(data: {
    characterId: string;
    characterName: string;
    knowledgeId: string;
    source: KnowledgeSource;
    learnedChapter: number;
    learnedContext: string;
    sourceCharacterId?: string;
    sourceLocation?: string;
    certainty?: KnowledgeCertainty;
    notes?: string;
  }): CharacterKnowledge | null {
    const piece = this.knowledge.get(data.knowledgeId);
    if (!piece) return null;

    // Check if character already has this knowledge
    const existing = this.getCharacterKnowledge(data.characterId, data.knowledgeId);
    if (existing && existing.status === KnowledgeStatus.CURRENT) {
      // Update certainty if new info is more certain
      const certaintyOrder = [
        KnowledgeCertainty.SUSPECTED,
        KnowledgeCertainty.LOW,
        KnowledgeCertainty.MODERATE,
        KnowledgeCertainty.HIGH,
        KnowledgeCertainty.ABSOLUTE
      ];

      const newCertainty = data.certainty || KnowledgeCertainty.MODERATE;
      const existingIndex = certaintyOrder.indexOf(existing.certainty);
      const newIndex = certaintyOrder.indexOf(newCertainty);

      if (newIndex > existingIndex) {
        existing.certainty = newCertainty;
        existing.updatedChapters.push(data.learnedChapter);
      }

      return existing;
    }

    const charKnowledge: CharacterKnowledge = {
      characterId: data.characterId,
      characterName: data.characterName,
      knowledgeId: data.knowledgeId,
      knowledgeName: piece.name,
      source: data.source,
      sourceCharacterId: data.sourceCharacterId,
      sourceLocation: data.sourceLocation,
      certainty: data.certainty || KnowledgeCertainty.MODERATE,
      status: KnowledgeStatus.CURRENT,
      learnedChapter: data.learnedChapter,
      learnedContext: data.learnedContext,
      updatedChapters: [],
      notes: data.notes || ''
    };

    // Initialize character's knowledge map if needed
    if (!this.characterKnowledge.has(data.characterId)) {
      this.characterKnowledge.set(data.characterId, new Map());
    }

    this.characterKnowledge.get(data.characterId)!.set(data.knowledgeId, charKnowledge);

    // Record transfer if from another character
    if (data.sourceCharacterId) {
      this.recordTransfer({
        knowledgeId: data.knowledgeId,
        fromCharacterId: data.sourceCharacterId,
        toCharacterId: data.characterId,
        chapterNumber: data.learnedChapter,
        method: data.source,
        wasIntentional: data.source === KnowledgeSource.TOLD || data.source === KnowledgeSource.TAUGHT,
        witnesses: [],
        sceneDescription: data.learnedContext,
        certaintyTransferred: charKnowledge.certainty
      });
    }

    return charKnowledge;
  }

  getCharacterKnowledge(
    characterId: string,
    knowledgeId: string
  ): CharacterKnowledge | undefined {
    return this.characterKnowledge.get(characterId)?.get(knowledgeId);
  }

  getAllCharacterKnowledge(characterId: string): CharacterKnowledge[] {
    const charMap = this.characterKnowledge.get(characterId);
    if (!charMap) return [];
    return Array.from(charMap.values());
  }

  characterKnows(
    characterId: string,
    knowledgeId: string,
    asOfChapter?: number
  ): boolean {
    const charKnowledge = this.getCharacterKnowledge(characterId, knowledgeId);
    if (!charKnowledge) return false;

    if (charKnowledge.status !== KnowledgeStatus.CURRENT &&
        charKnowledge.status !== KnowledgeStatus.OUTDATED) {
      return false;
    }

    if (asOfChapter !== undefined && charKnowledge.learnedChapter > asOfChapter) {
      return false;
    }

    return true;
  }

  forgetKnowledge(
    characterId: string,
    knowledgeId: string,
    chapterNumber: number,
    reason?: string
  ): boolean {
    const charKnowledge = this.getCharacterKnowledge(characterId, knowledgeId);
    if (!charKnowledge) return false;

    charKnowledge.status = KnowledgeStatus.FORGOTTEN;
    charKnowledge.forgottenChapter = chapterNumber;
    charKnowledge.notes += `\n[Ch${chapterNumber}] Forgotten: ${reason || 'unknown reason'}`;

    return true;
  }

  correctKnowledge(
    characterId: string,
    wrongKnowledgeId: string,
    correctKnowledgeId: string,
    chapterNumber: number,
    context: string
  ): boolean {
    const wrongKnowledge = this.getCharacterKnowledge(characterId, wrongKnowledgeId);
    if (!wrongKnowledge) return false;

    wrongKnowledge.status = KnowledgeStatus.CORRECTED;
    wrongKnowledge.updatedChapters.push(chapterNumber);
    wrongKnowledge.notes += `\n[Ch${chapterNumber}] Corrected: ${context}`;

    // Give them the correct knowledge
    const correctPiece = this.knowledge.get(correctKnowledgeId);
    if (correctPiece) {
      this.giveKnowledge({
        characterId,
        characterName: wrongKnowledge.characterName,
        knowledgeId: correctKnowledgeId,
        source: KnowledgeSource.DISCOVERED,
        learnedChapter: chapterNumber,
        learnedContext: context,
        certainty: KnowledgeCertainty.HIGH
      });
    }

    return true;
  }

  updateCertainty(
    characterId: string,
    knowledgeId: string,
    newCertainty: KnowledgeCertainty,
    chapterNumber: number,
    reason: string
  ): boolean {
    const charKnowledge = this.getCharacterKnowledge(characterId, knowledgeId);
    if (!charKnowledge) return false;

    charKnowledge.certainty = newCertainty;
    charKnowledge.updatedChapters.push(chapterNumber);
    charKnowledge.notes += `\n[Ch${chapterNumber}] Certainty changed to ${newCertainty}: ${reason}`;

    return true;
  }

  // ==========================================================================
  // KNOWLEDGE TRANSFER
  // ==========================================================================

  recordTransfer(data: Omit<KnowledgeTransfer, 'id'>): KnowledgeTransfer {
    const transfer: KnowledgeTransfer = {
      id: uuidv4(),
      ...data
    };

    this.transfers.push(transfer);
    return transfer;
  }

  getTransfersForCharacter(characterId: string): KnowledgeTransfer[] {
    return this.transfers.filter(t =>
      t.fromCharacterId === characterId || t.toCharacterId === characterId
    );
  }

  getTransfersInChapter(chapterNumber: number): KnowledgeTransfer[] {
    return this.transfers.filter(t => t.chapterNumber === chapterNumber);
  }

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  validateKnowledgeUse(
    characterId: string,
    knowledgeId: string,
    chapterNumber: number,
    _context: KnowledgeValidationContext
  ): KnowledgeError[] {
    const errors: KnowledgeError[] = [];
    const piece = this.knowledge.get(knowledgeId);
    const charKnowledge = this.getCharacterKnowledge(characterId, knowledgeId);

    if (!piece) return errors;

    // Get character name for error messages
    let characterName = 'Unknown';
    if (charKnowledge) {
      characterName = charKnowledge.characterName;
    }

    // Check if character even has this knowledge
    if (!charKnowledge) {
      errors.push({
        id: uuidv4(),
        errorType: KnowledgeErrorType.IMPOSSIBLE_KNOWLEDGE,
        severity: 'critical',
        characterId,
        characterName,
        knowledgeId,
        knowledgeName: piece.name,
        chapterNumber,
        message: `${characterName} uses knowledge "${piece.name}" but has never learned it`,
        suggestion: 'Add a scene where the character learns this information'
      });
      return errors;
    }

    // Check if knowledge was learned after this chapter
    if (charKnowledge.learnedChapter > chapterNumber) {
      errors.push({
        id: uuidv4(),
        errorType: KnowledgeErrorType.PREMATURE_KNOWLEDGE,
        severity: 'critical',
        characterId,
        characterName,
        knowledgeId,
        knowledgeName: piece.name,
        chapterNumber,
        message: `${characterName} uses knowledge "${piece.name}" in chapter ${chapterNumber}, but doesn't learn it until chapter ${charKnowledge.learnedChapter}`,
        suggestion: 'Either move the learning scene earlier or this usage later'
      });
    }

    // Check if knowledge was forgotten before this chapter
    if (charKnowledge.status === KnowledgeStatus.FORGOTTEN &&
        charKnowledge.forgottenChapter &&
        charKnowledge.forgottenChapter < chapterNumber) {
      errors.push({
        id: uuidv4(),
        errorType: KnowledgeErrorType.FORGOTTEN_KNOWLEDGE,
        severity: 'error',
        characterId,
        characterName,
        knowledgeId,
        knowledgeName: piece.name,
        chapterNumber,
        message: `${characterName} uses forgotten knowledge "${piece.name}" (forgotten in chapter ${charKnowledge.forgottenChapter})`,
        suggestion: 'Either have the character re-learn the information or remove this reference'
      });
    }

    // Check if the underlying knowledge existed at this point
    if (piece.createdChapter > chapterNumber) {
      errors.push({
        id: uuidv4(),
        errorType: KnowledgeErrorType.TIMELINE_ERROR,
        severity: 'critical',
        characterId,
        characterName,
        knowledgeId,
        knowledgeName: piece.name,
        chapterNumber,
        message: `${characterName} knows about "${piece.name}" before it exists (created in chapter ${piece.createdChapter})`,
        suggestion: 'This is a timeline error - the event/information doesn\'t exist yet'
      });
    }

    // Check if character is using wrong knowledge as if it were true
    if (piece.truthValue === false && charKnowledge.certainty === KnowledgeCertainty.ABSOLUTE) {
      errors.push({
        id: uuidv4(),
        errorType: KnowledgeErrorType.WRONG_KNOWLEDGE,
        severity: 'warning',
        characterId,
        characterName,
        knowledgeId,
        knowledgeName: piece.name,
        chapterNumber,
        message: `${characterName} treats misinformation "${piece.name}" as absolute truth`,
        expectedBehavior: 'Character should act on this belief, but narrative should acknowledge it\'s false'
      });
    }

    return errors;
  }

  validateCharacterKnowledgeState(
    characterId: string,
    chapterNumber: number,
    _context: KnowledgeValidationContext
  ): KnowledgeError[] {
    const errors: KnowledgeError[] = [];
    const charKnowledgeList = this.getAllCharacterKnowledge(characterId);

    for (const ck of charKnowledgeList) {
      if (ck.status !== KnowledgeStatus.CURRENT) continue;

      const piece = this.knowledge.get(ck.knowledgeId);
      if (!piece) continue;

      // Check for contradicting knowledge
      if (piece.contradicts) {
        for (const contradictId of piece.contradicts) {
          const contradictingKnowledge = this.getCharacterKnowledge(characterId, contradictId);
          if (contradictingKnowledge && contradictingKnowledge.status === KnowledgeStatus.CURRENT) {
            errors.push({
              id: uuidv4(),
              errorType: KnowledgeErrorType.INCONSISTENT,
              severity: 'warning',
              characterId,
              characterName: ck.characterName,
              knowledgeId: piece.id,
              knowledgeName: piece.name,
              chapterNumber,
              message: `${ck.characterName} believes contradicting things: "${piece.name}" and "${contradictingKnowledge.knowledgeName}"`,
              suggestion: 'Character should show confusion or one belief should override the other'
            });
          }
        }
      }

      // Check for expired knowledge still being current
      if (piece.expiresChapter && piece.expiresChapter <= chapterNumber) {
        if (ck.status === KnowledgeStatus.CURRENT) {
          errors.push({
            id: uuidv4(),
            errorType: KnowledgeErrorType.INCONSISTENT,
            severity: 'info',
            characterId,
            characterName: ck.characterName,
            knowledgeId: piece.id,
            knowledgeName: piece.name,
            chapterNumber,
            message: `${ck.characterName}'s knowledge "${piece.name}" is outdated as of chapter ${piece.expiresChapter}`,
            suggestion: 'Consider updating the character\'s knowledge or showing them operating on outdated info'
          });
        }
      }
    }

    return errors;
  }

  validateAllKnowledge(context: KnowledgeValidationContext): {
    totalChecks: number;
    errorsFound: number;
    criticalErrors: number;
    errors: KnowledgeError[];
    passRate: number;
  } {
    const errors: KnowledgeError[] = [];
    let totalChecks = 0;

    for (const [characterId, knowledgeMap] of this.characterKnowledge) {
      for (const [knowledgeId, charKnowledge] of knowledgeMap) {
        if (charKnowledge.status === KnowledgeStatus.CURRENT) {
          totalChecks++;
          errors.push(...this.validateKnowledgeUse(
            characterId,
            knowledgeId,
            context.currentChapter,
            context
          ));
        }
      }

      errors.push(...this.validateCharacterKnowledgeState(
        characterId,
        context.currentChapter,
        context
      ));
    }

    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const passRate = totalChecks > 0
      ? Math.round(((totalChecks - errors.length) / totalChecks) * 100)
      : 100;

    this.errors = errors;

    return {
      totalChecks,
      errorsFound: errors.length,
      criticalErrors,
      errors,
      passRate: Math.max(0, passRate)
    };
  }

  getErrors(): KnowledgeError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  // ==========================================================================
  // QUERIES
  // ==========================================================================

  queryKnowledge(query: KnowledgeQuery): CharacterKnowledge[] {
    let results: CharacterKnowledge[] = [];

    // Get all character knowledge
    for (const [characterId, knowledgeMap] of this.characterKnowledge) {
      if (query.characterId && characterId !== query.characterId) continue;

      for (const ck of knowledgeMap.values()) {
        results.push(ck);
      }
    }

    // Apply filters
    if (query.source) {
      results = results.filter(ck => ck.source === query.source);
    }

    if (query.certainty) {
      results = results.filter(ck => ck.certainty === query.certainty);
    }

    if (query.status) {
      results = results.filter(ck => ck.status === query.status);
    }

    if (query.chapterRange) {
      results = results.filter(ck =>
        ck.learnedChapter >= query.chapterRange!.start &&
        ck.learnedChapter <= query.chapterRange!.end
      );
    }

    if (query.knowledgeType || query.relatedEntity || query.tags) {
      results = results.filter(ck => {
        const piece = this.knowledge.get(ck.knowledgeId);
        if (!piece) return false;

        if (query.knowledgeType && piece.type !== query.knowledgeType) return false;
        if (query.relatedEntity && !piece.relatedEntities.includes(query.relatedEntity)) return false;
        if (query.tags && !query.tags.some(t => piece.tags.includes(t))) return false;

        return true;
      });
    }

    return results;
  }

  whoKnows(knowledgeId: string, asOfChapter?: number): string[] {
    const knowers: string[] = [];

    for (const [characterId, knowledgeMap] of this.characterKnowledge) {
      const ck = knowledgeMap.get(knowledgeId);
      if (ck && this.characterKnows(characterId, knowledgeId, asOfChapter)) {
        knowers.push(characterId);
      }
    }

    return knowers;
  }

  findWhoCouldTell(
    knowledgeId: string,
    targetCharacterId: string,
    asOfChapter: number
  ): string[] {
    const knowers = this.whoKnows(knowledgeId, asOfChapter);
    return knowers.filter(id => id !== targetCharacterId);
  }

  getSharedKnowledge(characterIds: string[]): KnowledgePiece[] {
    if (characterIds.length === 0) return [];

    const firstCharKnowledge = this.getAllCharacterKnowledge(characterIds[0])
      .filter(ck => ck.status === KnowledgeStatus.CURRENT)
      .map(ck => ck.knowledgeId);

    const sharedIds = firstCharKnowledge.filter(knowledgeId =>
      characterIds.every(charId => this.characterKnows(charId, knowledgeId))
    );

    return sharedIds
      .map(id => this.knowledge.get(id))
      .filter((k): k is KnowledgePiece => k !== undefined);
  }

  getSecretsBetween(
    characterA: string,
    characterB: string
  ): { knownOnlyByA: KnowledgePiece[]; knownOnlyByB: KnowledgePiece[] } {
    const aKnowledge = new Set(
      this.getAllCharacterKnowledge(characterA)
        .filter(ck => ck.status === KnowledgeStatus.CURRENT)
        .map(ck => ck.knowledgeId)
    );

    const bKnowledge = new Set(
      this.getAllCharacterKnowledge(characterB)
        .filter(ck => ck.status === KnowledgeStatus.CURRENT)
        .map(ck => ck.knowledgeId)
    );

    const onlyA = Array.from(aKnowledge)
      .filter(id => !bKnowledge.has(id))
      .map(id => this.knowledge.get(id))
      .filter((k): k is KnowledgePiece => k !== undefined && k.type === KnowledgeType.SECRET);

    const onlyB = Array.from(bKnowledge)
      .filter(id => !aKnowledge.has(id))
      .map(id => this.knowledge.get(id))
      .filter((k): k is KnowledgePiece => k !== undefined && k.type === KnowledgeType.SECRET);

    return {
      knownOnlyByA: onlyA,
      knownOnlyByB: onlyB
    };
  }

  // ==========================================================================
  // CHARACTER PROFILE
  // ==========================================================================

  getCharacterProfile(characterId: string): CharacterKnowledgeProfile | null {
    const allKnowledge = this.getAllCharacterKnowledge(characterId);
    if (allKnowledge.length === 0) return null;

    const characterName = allKnowledge[0].characterName;

    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byCertainty: Record<string, number> = {};
    let secrets = 0;
    let misinformation = 0;

    for (const ck of allKnowledge) {
      if (ck.status !== KnowledgeStatus.CURRENT) continue;

      const piece = this.knowledge.get(ck.knowledgeId);
      if (!piece) continue;

      // Count by type
      byType[piece.type] = (byType[piece.type] || 0) + 1;

      // Count by source
      bySource[ck.source] = (bySource[ck.source] || 0) + 1;

      // Count by certainty
      byCertainty[ck.certainty] = (byCertainty[ck.certainty] || 0) + 1;

      // Count secrets
      if (piece.type === KnowledgeType.SECRET) secrets++;

      // Count misinformation
      if (!piece.truthValue && ck.certainty !== KnowledgeCertainty.WRONG) {
        misinformation++;
      }
    }

    const currentKnowledge = allKnowledge.filter(ck =>
      ck.status === KnowledgeStatus.CURRENT
    );

    const recentlyLearned = [...currentKnowledge]
      .sort((a, b) => b.learnedChapter - a.learnedChapter)
      .slice(0, 10);

    const forgotten = allKnowledge.filter(ck =>
      ck.status === KnowledgeStatus.FORGOTTEN
    );

    return {
      characterId,
      characterName,
      totalKnowledge: currentKnowledge.length,
      byType,
      bySource,
      byCertainty,
      secrets,
      misinformation,
      recentlyLearned,
      forgotten
    };
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getStats(): {
    totalKnowledgePieces: number;
    totalCharacterKnowledge: number;
    totalTransfers: number;
    byType: Record<string, number>;
    truths: number;
    misinformation: number;
    secrets: number;
    averageKnowledgePerCharacter: number;
    charactersTracked: number;
  } {
    const allPieces = this.getAllKnowledge();

    const byType: Record<string, number> = {};
    let truths = 0;
    let misinformation = 0;
    let secrets = 0;

    for (const piece of allPieces) {
      byType[piece.type] = (byType[piece.type] || 0) + 1;

      if (piece.truthValue) truths++;
      else misinformation++;

      if (piece.type === KnowledgeType.SECRET) secrets++;
    }

    let totalCharacterKnowledge = 0;
    for (const knowledgeMap of this.characterKnowledge.values()) {
      totalCharacterKnowledge += knowledgeMap.size;
    }

    const charactersTracked = this.characterKnowledge.size;

    return {
      totalKnowledgePieces: allPieces.length,
      totalCharacterKnowledge,
      totalTransfers: this.transfers.length,
      byType,
      truths,
      misinformation,
      secrets,
      averageKnowledgePerCharacter: charactersTracked > 0
        ? Math.round(totalCharacterKnowledge / charactersTracked * 10) / 10
        : 0,
      charactersTracked
    };
  }

  // ==========================================================================
  // EXPORT/IMPORT
  // ==========================================================================

  exportToJSON(): string {
    const characterKnowledgeArray: { characterId: string; knowledge: CharacterKnowledge[] }[] = [];

    for (const [characterId, knowledgeMap] of this.characterKnowledge) {
      characterKnowledgeArray.push({
        characterId,
        knowledge: Array.from(knowledgeMap.values())
      });
    }

    return JSON.stringify({
      knowledge: Array.from(this.knowledge.values()),
      characterKnowledge: characterKnowledgeArray,
      transfers: this.transfers
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    // Import knowledge pieces
    if (data.knowledge) {
      for (const piece of data.knowledge) {
        this.knowledge.set(piece.id, piece);
      }
    }

    // Import character knowledge
    if (data.characterKnowledge) {
      for (const charData of data.characterKnowledge) {
        const knowledgeMap = new Map<string, CharacterKnowledge>();
        for (const ck of charData.knowledge) {
          knowledgeMap.set(ck.knowledgeId, ck);
        }
        this.characterKnowledge.set(charData.characterId, knowledgeMap);
      }
    }

    // Import transfers
    if (data.transfers) {
      this.transfers = data.transfers;
    }
  }

  // ==========================================================================
  // CLEAR
  // ==========================================================================

  clear(): void {
    this.knowledge.clear();
    this.characterKnowledge.clear();
    this.transfers = [];
    this.errors = [];
  }
}

// Export singleton instance
export const knowledgeTracker = new KnowledgeTracker();

export default KnowledgeTracker;
