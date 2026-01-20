/**
 * Relationship Validator
 *
 * Tracks and validates all character relationships across 12,000+ chapters.
 * Ensures relationship consistency, proper progression, and logical transitions.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

export enum RelationshipType {
  // Family
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  SPOUSE = 'spouse',
  GRANDPARENT = 'grandparent',
  GRANDCHILD = 'grandchild',
  AUNT_UNCLE = 'aunt_uncle',
  NIECE_NEPHEW = 'niece_nephew',
  COUSIN = 'cousin',
  IN_LAW = 'in_law',
  STEP_FAMILY = 'step_family',
  ADOPTED = 'adopted',

  // Romantic
  ROMANTIC_INTEREST = 'romantic_interest',
  DATING = 'dating',
  ENGAGED = 'engaged',
  MARRIED = 'married',
  EX_PARTNER = 'ex_partner',
  UNREQUITED_LOVE = 'unrequited_love',
  SECRET_AFFAIR = 'secret_affair',

  // Social
  FRIEND = 'friend',
  BEST_FRIEND = 'best_friend',
  ACQUAINTANCE = 'acquaintance',
  ALLY = 'ally',
  ENEMY = 'enemy',
  RIVAL = 'rival',
  NEMESIS = 'nemesis',
  FRENEMY = 'frenemy',

  // Professional
  EMPLOYER = 'employer',
  EMPLOYEE = 'employee',
  COLLEAGUE = 'colleague',
  BUSINESS_PARTNER = 'business_partner',
  MENTOR = 'mentor',
  MENTEE = 'mentee',
  MASTER = 'master',
  APPRENTICE = 'apprentice',
  TEACHER = 'teacher',
  STUDENT = 'student',

  // Hierarchical
  LEADER = 'leader',
  FOLLOWER = 'follower',
  KING = 'king',
  SUBJECT = 'subject',
  COMMANDER = 'commander',
  SOLDIER = 'soldier',

  // Special
  CREATOR = 'creator',
  CREATION = 'creation',
  BONDED = 'bonded',           // Magical/soul bond
  TWIN_FLAME = 'twin_flame',
  VESSEL = 'vessel',           // Possession/host
  REINCARNATION = 'reincarnation',
  CLONE = 'clone',
  OTHER = 'other'
}

export enum RelationshipStatus {
  ACTIVE = 'active',
  DORMANT = 'dormant',        // Not currently interacting
  ENDED = 'ended',            // Relationship ended
  ESTRANGED = 'estranged',
  UNKNOWN = 'unknown',        // Characters don't know about relationship
  SECRET = 'secret',          // Hidden from others
  DECEASED = 'deceased'       // One party is dead
}

export enum RelationshipSentiment {
  LOVE = 'love',
  AFFECTION = 'affection',
  RESPECT = 'respect',
  NEUTRAL = 'neutral',
  DISTRUST = 'distrust',
  DISLIKE = 'dislike',
  HATRED = 'hatred',
  FEAR = 'fear',
  OBSESSION = 'obsession',
  COMPLICATED = 'complicated'
}

export enum RelationshipChangeType {
  ESTABLISHED = 'established',
  STRENGTHENED = 'strengthened',
  WEAKENED = 'weakened',
  TRANSFORMED = 'transformed',
  ENDED = 'ended',
  REVEALED = 'revealed',       // Secret relationship revealed
  DISCOVERED = 'discovered',   // Character discovers relationship
  BETRAYED = 'betrayed'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface RelationshipChange {
  id: string;
  chapterNumber: number;
  changeType: RelationshipChangeType;
  previousType?: RelationshipType;
  newType?: RelationshipType;
  previousSentiment?: RelationshipSentiment;
  newSentiment?: RelationshipSentiment;
  reason: string;
  witnesses: string[];          // Character IDs who witnessed
  isPublicKnowledge: boolean;
  sceneDescription?: string;
}

export interface Relationship {
  id: string;
  characterA: string;           // Character ID
  characterAName: string;
  characterB: string;           // Character ID
  characterBName: string;
  type: RelationshipType;
  reverseType?: RelationshipType;  // Type from B's perspective if different
  status: RelationshipStatus;
  sentimentAtoB: RelationshipSentiment;
  sentimentBtoA: RelationshipSentiment;
  establishedChapter: number;
  endedChapter?: number;
  isSymmetric: boolean;
  isSecret: boolean;
  knownBy: string[];            // Character IDs who know about this
  history: RelationshipChange[];
  notes: string;
  tags: string[];
}

export interface RelationshipRule {
  id: string;
  name: string;
  description: string;
  validate: (relationship: Relationship, allRelationships: Relationship[], context: ValidationContext) => RelationshipError[];
  autoFix?: (relationship: Relationship) => Relationship;
}

export interface ValidationContext {
  currentChapter: number;
  deadCharacters: Set<string>;
  characterAges: Map<string, number>;
  characterLocations: Map<string, string>;
}

export interface RelationshipError {
  id: string;
  relationshipId: string;
  errorType: RelationshipErrorType;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  chapterNumber: number;
  characterIds: string[];
  suggestion?: string;
}

export enum RelationshipErrorType {
  DEAD_CHARACTER = 'dead_character',
  IMPOSSIBLE_RELATION = 'impossible_relation',
  AGE_VIOLATION = 'age_violation',
  CIRCULAR_RELATION = 'circular_relation',
  CONTRADICTORY = 'contradictory',
  MISSING_TRANSITION = 'missing_transition',
  TIMELINE_ERROR = 'timeline_error',
  DUPLICATE = 'duplicate',
  SELF_RELATION = 'self_relation',
  KNOWLEDGE_ERROR = 'knowledge_error'
}

export interface RelationshipNetwork {
  characterId: string;
  characterName: string;
  relationships: {
    relationship: Relationship;
    otherCharacterId: string;
    otherCharacterName: string;
    perspective: 'A' | 'B';
  }[];
  totalConnections: number;
  familyCount: number;
  romanticCount: number;
  socialCount: number;
  professionalCount: number;
}

export interface FamilyTree {
  id: string;
  name: string;
  rootCharacterId?: string;
  generations: Map<number, string[]>;  // Generation number -> character IDs
  members: string[];
  relationships: Relationship[];
}

// ============================================================================
// RELATIONSHIP VALIDATOR
// ============================================================================

export class RelationshipValidator {
  private relationships: Map<string, Relationship> = new Map();
  private characterRelationships: Map<string, Set<string>> = new Map();  // CharacterId -> RelationshipIds
  private familyTrees: Map<string, FamilyTree> = new Map();
  private rules: Map<string, RelationshipRule> = new Map();
  private errors: RelationshipError[] = [];
  private seed: number = Date.now();

  constructor() {
    this.initializeBuiltInRules();
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
  // BUILT-IN RULES
  // ==========================================================================

  private initializeBuiltInRules(): void {
    // Rule: No self-relationships
    this.addRule({
      id: 'no-self-relation',
      name: 'No Self-Relationships',
      description: 'A character cannot have a relationship with themselves',
      validate: (rel) => {
        if (rel.characterA === rel.characterB) {
          return [{
            id: uuidv4(),
            relationshipId: rel.id,
            errorType: RelationshipErrorType.SELF_RELATION,
            severity: 'critical',
            message: `Character ${rel.characterAName} has a relationship with themselves`,
            chapterNumber: rel.establishedChapter,
            characterIds: [rel.characterA],
            suggestion: 'Remove or fix this relationship'
          }];
        }
        return [];
      }
    });

    // Rule: Dead character relationships
    this.addRule({
      id: 'dead-character-check',
      name: 'Dead Character Validation',
      description: 'Validates relationships involving deceased characters',
      validate: (rel, _allRels, context) => {
        const errors: RelationshipError[] = [];

        if (rel.status === RelationshipStatus.ACTIVE) {
          if (context.deadCharacters.has(rel.characterA)) {
            errors.push({
              id: uuidv4(),
              relationshipId: rel.id,
              errorType: RelationshipErrorType.DEAD_CHARACTER,
              severity: 'error',
              message: `Active relationship with deceased character ${rel.characterAName}`,
              chapterNumber: context.currentChapter,
              characterIds: [rel.characterA, rel.characterB],
              suggestion: `Update relationship status to 'deceased'`
            });
          }
          if (context.deadCharacters.has(rel.characterB)) {
            errors.push({
              id: uuidv4(),
              relationshipId: rel.id,
              errorType: RelationshipErrorType.DEAD_CHARACTER,
              severity: 'error',
              message: `Active relationship with deceased character ${rel.characterBName}`,
              chapterNumber: context.currentChapter,
              characterIds: [rel.characterA, rel.characterB],
              suggestion: `Update relationship status to 'deceased'`
            });
          }
        }

        return errors;
      }
    });

    // Rule: Age-appropriate relationships
    this.addRule({
      id: 'age-appropriate',
      name: 'Age-Appropriate Relationships',
      description: 'Validates romantic relationships are age-appropriate',
      validate: (rel, _allRels, context) => {
        const romanticTypes = [
          RelationshipType.ROMANTIC_INTEREST,
          RelationshipType.DATING,
          RelationshipType.ENGAGED,
          RelationshipType.MARRIED,
          RelationshipType.SECRET_AFFAIR
        ];

        if (!romanticTypes.includes(rel.type)) return [];

        const ageA = context.characterAges.get(rel.characterA);
        const ageB = context.characterAges.get(rel.characterB);

        if (ageA === undefined || ageB === undefined) return [];

        const errors: RelationshipError[] = [];
        const MIN_AGE = 18;

        if (ageA < MIN_AGE || ageB < MIN_AGE) {
          errors.push({
            id: uuidv4(),
            relationshipId: rel.id,
            errorType: RelationshipErrorType.AGE_VIOLATION,
            severity: 'critical',
            message: `Romantic relationship involves underage character (${rel.characterAName}: ${ageA}, ${rel.characterBName}: ${ageB})`,
            chapterNumber: context.currentChapter,
            characterIds: [rel.characterA, rel.characterB],
            suggestion: 'Ensure all parties in romantic relationships are of appropriate age'
          });
        }

        return errors;
      }
    });

    // Rule: No duplicate relationships
    this.addRule({
      id: 'no-duplicates',
      name: 'No Duplicate Relationships',
      description: 'Prevents duplicate relationships between same characters',
      validate: (rel, allRels) => {
        const duplicates = allRels.filter(r =>
          r.id !== rel.id &&
          ((r.characterA === rel.characterA && r.characterB === rel.characterB) ||
           (r.characterA === rel.characterB && r.characterB === rel.characterA)) &&
          r.type === rel.type &&
          r.status === RelationshipStatus.ACTIVE &&
          rel.status === RelationshipStatus.ACTIVE
        );

        if (duplicates.length > 0) {
          return [{
            id: uuidv4(),
            relationshipId: rel.id,
            errorType: RelationshipErrorType.DUPLICATE,
            severity: 'warning',
            message: `Duplicate ${rel.type} relationship between ${rel.characterAName} and ${rel.characterBName}`,
            chapterNumber: rel.establishedChapter,
            characterIds: [rel.characterA, rel.characterB],
            suggestion: 'Merge or remove duplicate relationships'
          }];
        }

        return [];
      }
    });

    // Rule: Circular family relationships
    this.addRule({
      id: 'no-circular-family',
      name: 'No Circular Family Relationships',
      description: 'Prevents impossible family tree structures',
      validate: (rel, allRels) => {
        const familyTypes = [
          RelationshipType.PARENT,
          RelationshipType.CHILD,
          RelationshipType.GRANDPARENT,
          RelationshipType.GRANDCHILD
        ];

        if (!familyTypes.includes(rel.type)) return [];

        // Check for circular parent-child relationships
        if (rel.type === RelationshipType.PARENT) {
          const isChildOfChild = this.checkCircularFamily(
            rel.characterA,
            rel.characterB,
            allRels,
            new Set()
          );

          if (isChildOfChild) {
            return [{
              id: uuidv4(),
              relationshipId: rel.id,
              errorType: RelationshipErrorType.CIRCULAR_RELATION,
              severity: 'critical',
              message: `Circular family relationship: ${rel.characterAName} cannot be parent of ${rel.characterBName}`,
              chapterNumber: rel.establishedChapter,
              characterIds: [rel.characterA, rel.characterB],
              suggestion: 'Review and fix family tree structure'
            }];
          }
        }

        return [];
      }
    });

    // Rule: Contradictory relationships
    this.addRule({
      id: 'no-contradictions',
      name: 'No Contradictory Relationships',
      description: 'Detects logically contradictory relationships',
      validate: (rel, allRels) => {
        const errors: RelationshipError[] = [];

        // Can't be both parent and child
        if (rel.type === RelationshipType.PARENT) {
          const isAlsoChild = allRels.some(r =>
            r.id !== rel.id &&
            r.characterA === rel.characterB &&
            r.characterB === rel.characterA &&
            r.type === RelationshipType.PARENT &&
            r.status === RelationshipStatus.ACTIVE
          );

          if (isAlsoChild) {
            errors.push({
              id: uuidv4(),
              relationshipId: rel.id,
              errorType: RelationshipErrorType.CONTRADICTORY,
              severity: 'critical',
              message: `${rel.characterAName} and ${rel.characterBName} are listed as each other's parents`,
              chapterNumber: rel.establishedChapter,
              characterIds: [rel.characterA, rel.characterB],
              suggestion: 'Fix parent-child relationship direction'
            });
          }
        }

        // Can't be both sibling and parent/child
        if (rel.type === RelationshipType.SIBLING) {
          const isParentOrChild = allRels.some(r =>
            r.id !== rel.id &&
            ((r.characterA === rel.characterA && r.characterB === rel.characterB) ||
             (r.characterA === rel.characterB && r.characterB === rel.characterA)) &&
            (r.type === RelationshipType.PARENT || r.type === RelationshipType.CHILD) &&
            r.status === RelationshipStatus.ACTIVE
          );

          if (isParentOrChild) {
            errors.push({
              id: uuidv4(),
              relationshipId: rel.id,
              errorType: RelationshipErrorType.CONTRADICTORY,
              severity: 'critical',
              message: `${rel.characterAName} and ${rel.characterBName} are both siblings and parent/child`,
              chapterNumber: rel.establishedChapter,
              characterIds: [rel.characterA, rel.characterB],
              suggestion: 'Fix contradictory family relationships'
            });
          }
        }

        return errors;
      }
    });

    // Rule: Relationship progression
    this.addRule({
      id: 'relationship-progression',
      name: 'Valid Relationship Progression',
      description: 'Ensures relationship changes follow logical progression',
      validate: (rel) => {
        if (rel.history.length < 2) return [];

        const errors: RelationshipError[] = [];

        for (let i = 1; i < rel.history.length; i++) {
          const prev = rel.history[i - 1];
          const curr = rel.history[i];

          // Check for missing chapters between changes
          if (curr.chapterNumber < prev.chapterNumber) {
            errors.push({
              id: uuidv4(),
              relationshipId: rel.id,
              errorType: RelationshipErrorType.TIMELINE_ERROR,
              severity: 'error',
              message: `Relationship change in chapter ${curr.chapterNumber} occurs before previous change in chapter ${prev.chapterNumber}`,
              chapterNumber: curr.chapterNumber,
              characterIds: [rel.characterA, rel.characterB],
              suggestion: 'Fix timeline of relationship changes'
            });
          }

          // Validate progression logic
          if (curr.changeType === RelationshipChangeType.STRENGTHENED &&
              prev.changeType === RelationshipChangeType.ENDED) {
            errors.push({
              id: uuidv4(),
              relationshipId: rel.id,
              errorType: RelationshipErrorType.MISSING_TRANSITION,
              severity: 'warning',
              message: `Relationship was strengthened immediately after being ended in chapter ${curr.chapterNumber}`,
              chapterNumber: curr.chapterNumber,
              characterIds: [rel.characterA, rel.characterB],
              suggestion: 'Add intermediate reconciliation event'
            });
          }
        }

        return errors;
      }
    });
  }

  private checkCircularFamily(
    currentId: string,
    targetId: string,
    allRels: Relationship[],
    visited: Set<string>
  ): boolean {
    if (visited.has(currentId)) return false;
    visited.add(currentId);

    const children = allRels.filter(r =>
      r.characterA === currentId &&
      r.type === RelationshipType.PARENT &&
      r.status === RelationshipStatus.ACTIVE
    );

    for (const child of children) {
      if (child.characterB === targetId) return true;
      if (this.checkCircularFamily(child.characterB, targetId, allRels, visited)) {
        return true;
      }
    }

    return false;
  }

  // ==========================================================================
  // RULE MANAGEMENT
  // ==========================================================================

  addRule(rule: RelationshipRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  getRule(ruleId: string): RelationshipRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): RelationshipRule[] {
    return Array.from(this.rules.values());
  }

  // ==========================================================================
  // RELATIONSHIP CRUD
  // ==========================================================================

  createRelationship(data: {
    characterA: string;
    characterAName: string;
    characterB: string;
    characterBName: string;
    type: RelationshipType;
    establishedChapter: number;
    reverseType?: RelationshipType;
    sentimentAtoB?: RelationshipSentiment;
    sentimentBtoA?: RelationshipSentiment;
    isSecret?: boolean;
    knownBy?: string[];
    notes?: string;
    tags?: string[];
  }): Relationship {
    const relationship: Relationship = {
      id: uuidv4(),
      characterA: data.characterA,
      characterAName: data.characterAName,
      characterB: data.characterB,
      characterBName: data.characterBName,
      type: data.type,
      reverseType: data.reverseType,
      status: RelationshipStatus.ACTIVE,
      sentimentAtoB: data.sentimentAtoB || RelationshipSentiment.NEUTRAL,
      sentimentBtoA: data.sentimentBtoA || RelationshipSentiment.NEUTRAL,
      establishedChapter: data.establishedChapter,
      isSymmetric: !data.reverseType || data.reverseType === data.type,
      isSecret: data.isSecret || false,
      knownBy: data.knownBy || [],
      history: [{
        id: uuidv4(),
        chapterNumber: data.establishedChapter,
        changeType: RelationshipChangeType.ESTABLISHED,
        newType: data.type,
        newSentiment: data.sentimentAtoB,
        reason: 'Relationship established',
        witnesses: [],
        isPublicKnowledge: !data.isSecret
      }],
      notes: data.notes || '',
      tags: data.tags || []
    };

    this.relationships.set(relationship.id, relationship);
    this.indexRelationship(relationship);

    return relationship;
  }

  private indexRelationship(rel: Relationship): void {
    // Index for character A
    if (!this.characterRelationships.has(rel.characterA)) {
      this.characterRelationships.set(rel.characterA, new Set());
    }
    this.characterRelationships.get(rel.characterA)!.add(rel.id);

    // Index for character B
    if (!this.characterRelationships.has(rel.characterB)) {
      this.characterRelationships.set(rel.characterB, new Set());
    }
    this.characterRelationships.get(rel.characterB)!.add(rel.id);
  }

  getRelationship(id: string): Relationship | undefined {
    return this.relationships.get(id);
  }

  getAllRelationships(): Relationship[] {
    return Array.from(this.relationships.values());
  }

  getRelationshipsForCharacter(characterId: string): Relationship[] {
    const relIds = this.characterRelationships.get(characterId);
    if (!relIds) return [];

    return Array.from(relIds)
      .map(id => this.relationships.get(id))
      .filter((r): r is Relationship => r !== undefined);
  }

  getRelationshipBetween(
    characterA: string,
    characterB: string
  ): Relationship | undefined {
    const relsA = this.characterRelationships.get(characterA);
    if (!relsA) return undefined;

    for (const relId of relsA) {
      const rel = this.relationships.get(relId);
      if (rel && (rel.characterB === characterB || rel.characterA === characterB)) {
        return rel;
      }
    }

    return undefined;
  }

  // ==========================================================================
  // RELATIONSHIP CHANGES
  // ==========================================================================

  updateRelationship(
    relationshipId: string,
    chapterNumber: number,
    changes: {
      type?: RelationshipType;
      status?: RelationshipStatus;
      sentimentAtoB?: RelationshipSentiment;
      sentimentBtoA?: RelationshipSentiment;
      reason: string;
      witnesses?: string[];
      isPublicKnowledge?: boolean;
    }
  ): boolean {
    const rel = this.relationships.get(relationshipId);
    if (!rel) return false;

    let changeType: RelationshipChangeType = RelationshipChangeType.TRANSFORMED;

    // Determine change type
    if (changes.status === RelationshipStatus.ENDED) {
      changeType = RelationshipChangeType.ENDED;
      rel.endedChapter = chapterNumber;
    } else if (changes.sentimentAtoB || changes.sentimentBtoA) {
      const oldSentimentValue = this.getSentimentValue(rel.sentimentAtoB);
      const newSentimentValue = this.getSentimentValue(
        changes.sentimentAtoB || rel.sentimentAtoB
      );

      if (newSentimentValue > oldSentimentValue) {
        changeType = RelationshipChangeType.STRENGTHENED;
      } else if (newSentimentValue < oldSentimentValue) {
        changeType = RelationshipChangeType.WEAKENED;
      }
    }

    // Record change
    const change: RelationshipChange = {
      id: uuidv4(),
      chapterNumber,
      changeType,
      previousType: changes.type ? rel.type : undefined,
      newType: changes.type,
      previousSentiment: changes.sentimentAtoB ? rel.sentimentAtoB : undefined,
      newSentiment: changes.sentimentAtoB,
      reason: changes.reason,
      witnesses: changes.witnesses || [],
      isPublicKnowledge: changes.isPublicKnowledge ?? true
    };

    rel.history.push(change);

    // Apply changes
    if (changes.type) rel.type = changes.type;
    if (changes.status) rel.status = changes.status;
    if (changes.sentimentAtoB) rel.sentimentAtoB = changes.sentimentAtoB;
    if (changes.sentimentBtoA) rel.sentimentBtoA = changes.sentimentBtoA;

    return true;
  }

  private getSentimentValue(sentiment: RelationshipSentiment): number {
    const values: Record<RelationshipSentiment, number> = {
      [RelationshipSentiment.LOVE]: 10,
      [RelationshipSentiment.AFFECTION]: 8,
      [RelationshipSentiment.RESPECT]: 6,
      [RelationshipSentiment.NEUTRAL]: 5,
      [RelationshipSentiment.COMPLICATED]: 5,
      [RelationshipSentiment.DISTRUST]: 4,
      [RelationshipSentiment.DISLIKE]: 3,
      [RelationshipSentiment.FEAR]: 2,
      [RelationshipSentiment.HATRED]: 1,
      [RelationshipSentiment.OBSESSION]: 5
    };
    return values[sentiment];
  }

  endRelationship(
    relationshipId: string,
    chapterNumber: number,
    reason: string
  ): boolean {
    return this.updateRelationship(relationshipId, chapterNumber, {
      status: RelationshipStatus.ENDED,
      reason
    });
  }

  revealSecret(
    relationshipId: string,
    chapterNumber: number,
    revealedTo: string[],
    reason: string
  ): boolean {
    const rel = this.relationships.get(relationshipId);
    if (!rel) return false;

    rel.knownBy = [...new Set([...rel.knownBy, ...revealedTo])];

    if (revealedTo.length > 3) {
      rel.isSecret = false;
    }

    rel.history.push({
      id: uuidv4(),
      chapterNumber,
      changeType: RelationshipChangeType.REVEALED,
      reason,
      witnesses: revealedTo,
      isPublicKnowledge: !rel.isSecret
    });

    return true;
  }

  // ==========================================================================
  // FAMILY TREE
  // ==========================================================================

  createFamilyTree(name: string, rootCharacterId?: string): FamilyTree {
    const tree: FamilyTree = {
      id: uuidv4(),
      name,
      rootCharacterId,
      generations: new Map(),
      members: rootCharacterId ? [rootCharacterId] : [],
      relationships: []
    };

    if (rootCharacterId) {
      tree.generations.set(0, [rootCharacterId]);
    }

    this.familyTrees.set(tree.id, tree);
    return tree;
  }

  addToFamilyTree(
    treeId: string,
    characterId: string,
    generation: number
  ): boolean {
    const tree = this.familyTrees.get(treeId);
    if (!tree) return false;

    if (!tree.members.includes(characterId)) {
      tree.members.push(characterId);
    }

    if (!tree.generations.has(generation)) {
      tree.generations.set(generation, []);
    }

    const genMembers = tree.generations.get(generation)!;
    if (!genMembers.includes(characterId)) {
      genMembers.push(characterId);
    }

    // Update family relationships
    this.updateFamilyTreeRelationships(tree);

    return true;
  }

  private updateFamilyTreeRelationships(tree: FamilyTree): void {
    tree.relationships = this.getAllRelationships().filter(r =>
      tree.members.includes(r.characterA) &&
      tree.members.includes(r.characterB) &&
      this.isFamilyRelationship(r.type)
    );
  }

  private isFamilyRelationship(type: RelationshipType): boolean {
    return [
      RelationshipType.PARENT,
      RelationshipType.CHILD,
      RelationshipType.SIBLING,
      RelationshipType.SPOUSE,
      RelationshipType.GRANDPARENT,
      RelationshipType.GRANDCHILD,
      RelationshipType.AUNT_UNCLE,
      RelationshipType.NIECE_NEPHEW,
      RelationshipType.COUSIN,
      RelationshipType.IN_LAW,
      RelationshipType.STEP_FAMILY,
      RelationshipType.ADOPTED
    ].includes(type);
  }

  getFamilyTree(id: string): FamilyTree | undefined {
    return this.familyTrees.get(id);
  }

  getAllFamilyTrees(): FamilyTree[] {
    return Array.from(this.familyTrees.values());
  }

  // ==========================================================================
  // RELATIONSHIP NETWORK
  // ==========================================================================

  getRelationshipNetwork(characterId: string): RelationshipNetwork {
    const rels = this.getRelationshipsForCharacter(characterId);
    let characterName = '';

    const relationships = rels.map(rel => {
      const isA = rel.characterA === characterId;
      if (isA) characterName = rel.characterAName;
      else characterName = rel.characterBName;

      return {
        relationship: rel,
        otherCharacterId: isA ? rel.characterB : rel.characterA,
        otherCharacterName: isA ? rel.characterBName : rel.characterAName,
        perspective: (isA ? 'A' : 'B') as 'A' | 'B'
      };
    });

    const familyTypes = new Set([
      RelationshipType.PARENT, RelationshipType.CHILD, RelationshipType.SIBLING,
      RelationshipType.SPOUSE, RelationshipType.GRANDPARENT, RelationshipType.GRANDCHILD
    ]);
    const romanticTypes = new Set([
      RelationshipType.ROMANTIC_INTEREST, RelationshipType.DATING,
      RelationshipType.ENGAGED, RelationshipType.MARRIED
    ]);
    const socialTypes = new Set([
      RelationshipType.FRIEND, RelationshipType.BEST_FRIEND,
      RelationshipType.ALLY, RelationshipType.ENEMY, RelationshipType.RIVAL
    ]);
    const professionalTypes = new Set([
      RelationshipType.EMPLOYER, RelationshipType.EMPLOYEE,
      RelationshipType.MENTOR, RelationshipType.MENTEE, RelationshipType.COLLEAGUE
    ]);

    return {
      characterId,
      characterName,
      relationships,
      totalConnections: relationships.length,
      familyCount: relationships.filter(r => familyTypes.has(r.relationship.type)).length,
      romanticCount: relationships.filter(r => romanticTypes.has(r.relationship.type)).length,
      socialCount: relationships.filter(r => socialTypes.has(r.relationship.type)).length,
      professionalCount: relationships.filter(r => professionalTypes.has(r.relationship.type)).length
    };
  }

  findPath(
    fromCharacterId: string,
    toCharacterId: string,
    maxDepth: number = 6
  ): { path: Relationship[]; degrees: number } | null {
    const visited = new Set<string>();
    const queue: { characterId: string; path: Relationship[] }[] = [
      { characterId: fromCharacterId, path: [] }
    ];

    while (queue.length > 0) {
      const { characterId, path } = queue.shift()!;

      if (path.length > maxDepth) continue;
      if (visited.has(characterId)) continue;
      visited.add(characterId);

      if (characterId === toCharacterId) {
        return { path, degrees: path.length };
      }

      const rels = this.getRelationshipsForCharacter(characterId);
      for (const rel of rels) {
        const nextId = rel.characterA === characterId ? rel.characterB : rel.characterA;
        if (!visited.has(nextId)) {
          queue.push({ characterId: nextId, path: [...path, rel] });
        }
      }
    }

    return null;
  }

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  validateRelationship(
    relationshipId: string,
    context: ValidationContext
  ): RelationshipError[] {
    const rel = this.relationships.get(relationshipId);
    if (!rel) return [];

    const allRels = this.getAllRelationships();
    const errors: RelationshipError[] = [];

    for (const rule of this.rules.values()) {
      errors.push(...rule.validate(rel, allRels, context));
    }

    return errors;
  }

  validateAllRelationships(context: ValidationContext): {
    totalRelationships: number;
    errorsFound: number;
    criticalErrors: number;
    errors: RelationshipError[];
    passRate: number;
  } {
    const allRels = this.getAllRelationships();
    const errors: RelationshipError[] = [];

    for (const rel of allRels) {
      for (const rule of this.rules.values()) {
        errors.push(...rule.validate(rel, allRels, context));
      }
    }

    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const passRate = allRels.length > 0
      ? Math.round(((allRels.length - errors.length) / allRels.length) * 100)
      : 100;

    this.errors = errors;

    return {
      totalRelationships: allRels.length,
      errorsFound: errors.length,
      criticalErrors,
      errors,
      passRate
    };
  }

  getErrors(): RelationshipError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  // ==========================================================================
  // QUERIES
  // ==========================================================================

  findRelationshipsByType(type: RelationshipType): Relationship[] {
    return this.getAllRelationships().filter(r => r.type === type);
  }

  findRelationshipsBySentiment(sentiment: RelationshipSentiment): Relationship[] {
    return this.getAllRelationships().filter(r =>
      r.sentimentAtoB === sentiment || r.sentimentBtoA === sentiment
    );
  }

  findSecretRelationships(): Relationship[] {
    return this.getAllRelationships().filter(r => r.isSecret);
  }

  findActiveRelationships(): Relationship[] {
    return this.getAllRelationships().filter(r =>
      r.status === RelationshipStatus.ACTIVE
    );
  }

  findRelationshipsEstablishedInChapter(chapterNumber: number): Relationship[] {
    return this.getAllRelationships().filter(r =>
      r.establishedChapter === chapterNumber
    );
  }

  findRelationshipsChangedInChapter(chapterNumber: number): Relationship[] {
    return this.getAllRelationships().filter(r =>
      r.history.some(h => h.chapterNumber === chapterNumber)
    );
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getStats(): {
    totalRelationships: number;
    activeRelationships: number;
    endedRelationships: number;
    secretRelationships: number;
    byType: Record<string, number>;
    bySentiment: Record<string, number>;
    familyTrees: number;
    averageConnectionsPerCharacter: number;
  } {
    const all = this.getAllRelationships();

    const byType: Record<string, number> = {};
    const bySentiment: Record<string, number> = {};

    for (const rel of all) {
      byType[rel.type] = (byType[rel.type] || 0) + 1;
      bySentiment[rel.sentimentAtoB] = (bySentiment[rel.sentimentAtoB] || 0) + 1;
      bySentiment[rel.sentimentBtoA] = (bySentiment[rel.sentimentBtoA] || 0) + 1;
    }

    const uniqueCharacters = new Set<string>();
    for (const rel of all) {
      uniqueCharacters.add(rel.characterA);
      uniqueCharacters.add(rel.characterB);
    }

    return {
      totalRelationships: all.length,
      activeRelationships: all.filter(r => r.status === RelationshipStatus.ACTIVE).length,
      endedRelationships: all.filter(r => r.status === RelationshipStatus.ENDED).length,
      secretRelationships: all.filter(r => r.isSecret).length,
      byType,
      bySentiment,
      familyTrees: this.familyTrees.size,
      averageConnectionsPerCharacter: uniqueCharacters.size > 0
        ? Math.round((all.length * 2) / uniqueCharacters.size * 10) / 10
        : 0
    };
  }

  // ==========================================================================
  // EXPORT/IMPORT
  // ==========================================================================

  exportToJSON(): string {
    const data = {
      relationships: Array.from(this.relationships.values()),
      familyTrees: Array.from(this.familyTrees.entries()).map(([_id, tree]) => ({
        ...tree,
        generations: Array.from(tree.generations.entries())
      })),
      customRules: Array.from(this.rules.values())
        .filter(r => !r.id.startsWith('no-') && !r.id.startsWith('dead-') && !r.id.startsWith('age-') && !r.id.startsWith('relationship-'))
        .map(r => ({ id: r.id, name: r.name, description: r.description }))
    };

    return JSON.stringify(data, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    // Import relationships
    if (data.relationships) {
      for (const rel of data.relationships) {
        this.relationships.set(rel.id, rel);
        this.indexRelationship(rel);
      }
    }

    // Import family trees
    if (data.familyTrees) {
      for (const treeData of data.familyTrees) {
        const tree: FamilyTree = {
          ...treeData,
          generations: new Map(treeData.generations)
        };
        this.familyTrees.set(tree.id, tree);
      }
    }
  }

  // ==========================================================================
  // CLEAR
  // ==========================================================================

  clear(): void {
    this.relationships.clear();
    this.characterRelationships.clear();
    this.familyTrees.clear();
    this.errors = [];
  }
}

// Export singleton instance
export const relationshipValidator = new RelationshipValidator();

export default RelationshipValidator;
