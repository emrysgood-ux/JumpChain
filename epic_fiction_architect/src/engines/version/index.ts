/**
 * Epic Fiction Architect - Version Control Engine
 *
 * Git-inspired version control for manuscripts and project data:
 * - Snapshot-based versioning (not line-by-line diffs)
 * - Branch support for alternate versions/drafts
 * - Change history with annotations
 * - Rollback capability
 * - Comparison between versions
 * - Tag support for milestones
 *
 * Designed for creative writing workflows where:
 * - Changes are often large (paragraph/scene level)
 * - Writers need to try alternate versions
 * - History should be meaningful (drafts, revisions, etc.)
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Types of versionable content
 */
export enum VersionableType {
  CHAPTER = 'chapter',
  SCENE = 'scene',
  CHARACTER = 'character',
  LOCATION = 'location',
  PLOT = 'plot',
  WORLD_DATA = 'world_data',
  NOTES = 'notes',
  OUTLINE = 'outline',
  PROJECT_SETTINGS = 'project_settings'
}

/**
 * Change types for history
 */
export enum ChangeType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RENAME = 'rename',
  MOVE = 'move',
  MERGE = 'merge',
  SPLIT = 'split',
  REORDER = 'reorder'
}

/**
 * Branch status
 */
export enum BranchStatus {
  ACTIVE = 'active',
  MERGED = 'merged',
  ABANDONED = 'abandoned',
  ARCHIVED = 'archived'
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * A single version snapshot
 */
export interface Version {
  id: string;
  entityId: string;
  entityType: VersionableType;

  // Version sequence
  versionNumber: number;
  branchId: string;
  parentVersionId?: string;

  // Content
  content: string;
  contentHash: string;

  // Metadata
  wordCount: number;
  characterCount: number;
  title?: string;

  // Change info
  changeType: ChangeType;
  changeDescription: string;
  changedFields?: string[];

  // Author/timing
  authorId?: string;
  authorName?: string;
  createdAt: Date;

  // Tags
  tags: string[];
  isDraft: boolean;
  isAutoSave: boolean;
}

/**
 * A branch representing an alternate version timeline
 */
export interface Branch {
  id: string;
  projectId: string;
  name: string;
  description?: string;

  // Branching
  parentBranchId?: string;
  branchPointVersionId?: string;

  // Status
  status: BranchStatus;
  isDefault: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  mergedAt?: Date;
  mergedIntoBranchId?: string;

  // Stats
  versionCount: number;
  lastVersionId?: string;
}

/**
 * A tagged milestone
 */
export interface Tag {
  id: string;
  name: string;
  description?: string;
  versionId: string;
  branchId: string;
  entityId: string;
  entityType: VersionableType;
  createdAt: Date;
}

/**
 * Difference between two versions
 */
export interface VersionDiff {
  versionAId: string;
  versionBId: string;

  // Content diff
  contentChanged: boolean;
  addedCharacters: number;
  removedCharacters: number;
  addedWords: number;
  removedWords: number;

  // Structural diff
  addedParagraphs: string[];
  removedParagraphs: string[];
  modifiedParagraphs: Array<{
    before: string;
    after: string;
  }>;

  // Metadata diff
  metadataChanges: Array<{
    field: string;
    before: unknown;
    after: unknown;
  }>;
}

/**
 * History entry for change log
 */
export interface HistoryEntry {
  id: string;
  versionId: string;
  entityId: string;
  entityType: VersionableType;
  branchId: string;

  // Change details
  changeType: ChangeType;
  description: string;
  details?: string;

  // Context
  previousVersionId?: string;
  affectedEntities?: string[];

  // Author/timing
  authorId?: string;
  authorName?: string;
  timestamp: Date;
}

/**
 * Merge result
 */
export interface MergeResult {
  success: boolean;
  mergedVersionId?: string;
  conflicts: Array<{
    entityId: string;
    entityType: VersionableType;
    sourceContent: string;
    targetContent: string;
    resolution?: string;
  }>;
  warnings: string[];
  mergedEntities: string[];
}

/**
 * Version control configuration
 */
export interface VersionEngineConfig {
  maxVersionsPerEntity: number;
  autoSaveInterval: number;  // minutes, 0 = disabled
  pruneAutoSavesAfter: number;  // days
  enableAutoSave: boolean;
  defaultBranchName: string;
  compressOldVersions: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: VersionEngineConfig = {
  maxVersionsPerEntity: 100,
  autoSaveInterval: 5,
  pruneAutoSavesAfter: 7,
  enableAutoSave: true,
  defaultBranchName: 'main',
  compressOldVersions: false
};

// ============================================================================
// VERSION ENGINE CLASS
// ============================================================================

export class VersionEngine {
  private config: VersionEngineConfig;

  // Storage
  private versions: Map<string, Version> = new Map();
  private branches: Map<string, Branch> = new Map();
  private tags: Map<string, Tag> = new Map();
  private history: HistoryEntry[] = [];

  // Indices
  private versionsByEntity: Map<string, Set<string>> = new Map();
  private versionsByBranch: Map<string, Set<string>> = new Map();
  private tagsByEntity: Map<string, Set<string>> = new Map();
  private latestVersions: Map<string, Map<string, string>> = new Map(); // branchId -> entityId -> versionId

  constructor(config?: Partial<VersionEngineConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  /**
   * Update configuration
   */
  setConfig(config: Partial<VersionEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): VersionEngineConfig {
    return { ...this.config };
  }

  // ==========================================================================
  // BRANCH MANAGEMENT
  // ==========================================================================

  /**
   * Create a new branch
   */
  createBranch(
    projectId: string,
    name: string,
    options?: {
      description?: string;
      parentBranchId?: string;
      branchPointVersionId?: string;
      isDefault?: boolean;
    }
  ): Branch {
    const id = uuidv4();
    const now = new Date();

    const branch: Branch = {
      id,
      projectId,
      name,
      description: options?.description,
      parentBranchId: options?.parentBranchId,
      branchPointVersionId: options?.branchPointVersionId,
      status: BranchStatus.ACTIVE,
      isDefault: options?.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
      versionCount: 0
    };

    this.branches.set(id, branch);
    this.versionsByBranch.set(id, new Set());
    this.latestVersions.set(id, new Map());

    // If this is set as default, unset other defaults
    if (branch.isDefault) {
      for (const [otherId, otherBranch] of this.branches) {
        if (otherId !== id && otherBranch.projectId === projectId) {
          otherBranch.isDefault = false;
        }
      }
    }

    return branch;
  }

  /**
   * Get branch by ID
   */
  getBranch(id: string): Branch | undefined {
    return this.branches.get(id);
  }

  /**
   * Get default branch for a project
   */
  getDefaultBranch(projectId: string): Branch | undefined {
    for (const branch of this.branches.values()) {
      if (branch.projectId === projectId && branch.isDefault) {
        return branch;
      }
    }

    // If no default, return first active branch
    for (const branch of this.branches.values()) {
      if (branch.projectId === projectId && branch.status === BranchStatus.ACTIVE) {
        return branch;
      }
    }

    return undefined;
  }

  /**
   * Get all branches for a project
   */
  getProjectBranches(projectId: string): Branch[] {
    return Array.from(this.branches.values())
      .filter(b => b.projectId === projectId)
      .sort((a, b) => {
        // Default first, then by name
        if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }

  /**
   * Update branch status
   */
  updateBranchStatus(branchId: string, status: BranchStatus): Branch | undefined {
    const branch = this.branches.get(branchId);
    if (!branch) return undefined;

    branch.status = status;
    branch.updatedAt = new Date();

    return branch;
  }

  /**
   * Rename a branch
   */
  renameBranch(branchId: string, newName: string): Branch | undefined {
    const branch = this.branches.get(branchId);
    if (!branch) return undefined;

    branch.name = newName;
    branch.updatedAt = new Date();

    return branch;
  }

  // ==========================================================================
  // VERSION CREATION
  // ==========================================================================

  /**
   * Create a new version (save a snapshot)
   */
  createVersion(
    entityId: string,
    entityType: VersionableType,
    branchId: string,
    content: string,
    options?: {
      changeType?: ChangeType;
      changeDescription?: string;
      changedFields?: string[];
      title?: string;
      authorId?: string;
      authorName?: string;
      tags?: string[];
      isDraft?: boolean;
      isAutoSave?: boolean;
    }
  ): Version {
    const branch = this.branches.get(branchId);
    if (!branch) {
      throw new Error(`Branch ${branchId} not found`);
    }

    const id = uuidv4();
    const now = new Date();

    // Get previous version for this entity on this branch
    const previousVersionId = this.getLatestVersionId(entityId, branchId);
    const previousVersion = previousVersionId ? this.versions.get(previousVersionId) : undefined;

    // Calculate version number
    const entityVersions = this.getEntityVersions(entityId, branchId);
    const versionNumber = entityVersions.length + 1;

    // Calculate word count
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const characterCount = content.length;

    // Calculate content hash (simple hash for change detection)
    const contentHash = this.hashContent(content);

    const version: Version = {
      id,
      entityId,
      entityType,
      versionNumber,
      branchId,
      parentVersionId: previousVersionId,
      content,
      contentHash,
      wordCount,
      characterCount,
      title: options?.title,
      changeType: options?.changeType ?? (previousVersion ? ChangeType.UPDATE : ChangeType.CREATE),
      changeDescription: options?.changeDescription ?? (previousVersion ? 'Updated content' : 'Created'),
      changedFields: options?.changedFields,
      authorId: options?.authorId,
      authorName: options?.authorName,
      createdAt: now,
      tags: options?.tags ?? [],
      isDraft: options?.isDraft ?? false,
      isAutoSave: options?.isAutoSave ?? false
    };

    // Store version
    this.storeVersion(version);

    // Update branch
    branch.versionCount++;
    branch.lastVersionId = id;
    branch.updatedAt = now;

    // Record history
    this.recordHistory({
      versionId: id,
      entityId,
      entityType,
      branchId,
      changeType: version.changeType,
      description: version.changeDescription,
      previousVersionId,
      authorId: options?.authorId,
      authorName: options?.authorName
    });

    return version;
  }

  /**
   * Store version and update indices
   */
  private storeVersion(version: Version): void {
    this.versions.set(version.id, version);

    // Index by entity
    if (!this.versionsByEntity.has(version.entityId)) {
      this.versionsByEntity.set(version.entityId, new Set());
    }
    this.versionsByEntity.get(version.entityId)!.add(version.id);

    // Index by branch
    if (!this.versionsByBranch.has(version.branchId)) {
      this.versionsByBranch.set(version.branchId, new Set());
    }
    this.versionsByBranch.get(version.branchId)!.add(version.id);

    // Update latest version
    if (!this.latestVersions.has(version.branchId)) {
      this.latestVersions.set(version.branchId, new Map());
    }
    this.latestVersions.get(version.branchId)!.set(version.entityId, version.id);
  }

  /**
   * Simple content hash
   */
  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Get latest version ID for an entity on a branch
   */
  private getLatestVersionId(entityId: string, branchId: string): string | undefined {
    return this.latestVersions.get(branchId)?.get(entityId);
  }

  /**
   * Auto-save version (if content has changed)
   */
  autoSave(
    entityId: string,
    entityType: VersionableType,
    branchId: string,
    content: string,
    authorId?: string,
    authorName?: string
  ): Version | null {
    if (!this.config.enableAutoSave) return null;

    const currentHash = this.hashContent(content);
    const latestVersionId = this.getLatestVersionId(entityId, branchId);

    if (latestVersionId) {
      const latest = this.versions.get(latestVersionId);
      if (latest && latest.contentHash === currentHash) {
        return null; // No changes
      }
    }

    return this.createVersion(entityId, entityType, branchId, content, {
      changeType: ChangeType.UPDATE,
      changeDescription: 'Auto-save',
      authorId,
      authorName,
      isAutoSave: true
    });
  }

  // ==========================================================================
  // VERSION RETRIEVAL
  // ==========================================================================

  /**
   * Get version by ID
   */
  getVersion(id: string): Version | undefined {
    return this.versions.get(id);
  }

  /**
   * Get latest version for an entity on a branch
   */
  getLatestVersion(entityId: string, branchId: string): Version | undefined {
    const versionId = this.getLatestVersionId(entityId, branchId);
    return versionId ? this.versions.get(versionId) : undefined;
  }

  /**
   * Get all versions for an entity (optionally filtered by branch)
   */
  getEntityVersions(entityId: string, branchId?: string): Version[] {
    const versionIds = this.versionsByEntity.get(entityId);
    if (!versionIds) return [];

    let versions = Array.from(versionIds)
      .map(id => this.versions.get(id)!)
      .filter(Boolean);

    if (branchId) {
      versions = versions.filter(v => v.branchId === branchId);
    }

    return versions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Get version history (most recent first)
   */
  getVersionHistory(entityId: string, branchId?: string, limit?: number): Version[] {
    const versions = this.getEntityVersions(entityId, branchId)
      .sort((a, b) => {
        // Sort by createdAt descending, then by versionNumber descending for same timestamp
        const timeDiff = b.createdAt.getTime() - a.createdAt.getTime();
        if (timeDiff !== 0) return timeDiff;
        return b.versionNumber - a.versionNumber;
      });

    return limit ? versions.slice(0, limit) : versions;
  }

  /**
   * Get version at a specific point in time
   */
  getVersionAtTime(entityId: string, branchId: string, timestamp: Date): Version | undefined {
    const versions = this.getEntityVersions(entityId, branchId)
      .filter(v => v.createdAt <= timestamp)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return versions[0];
  }

  // ==========================================================================
  // COMPARISON
  // ==========================================================================

  /**
   * Compare two versions
   */
  compareVersions(versionAId: string, versionBId: string): VersionDiff {
    const versionA = this.versions.get(versionAId);
    const versionB = this.versions.get(versionBId);

    if (!versionA || !versionB) {
      throw new Error('One or both versions not found');
    }

    const contentChanged = versionA.contentHash !== versionB.contentHash;

    // Calculate word/character differences
    const addedCharacters = Math.max(0, versionB.characterCount - versionA.characterCount);
    const removedCharacters = Math.max(0, versionA.characterCount - versionB.characterCount);
    const addedWords = Math.max(0, versionB.wordCount - versionA.wordCount);
    const removedWords = Math.max(0, versionA.wordCount - versionB.wordCount);

    // Paragraph-level diff
    const paragraphsA = versionA.content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const paragraphsB = versionB.content.split(/\n\n+/).filter(p => p.trim().length > 0);

    const addedParagraphs: string[] = [];
    const removedParagraphs: string[] = [];
    const modifiedParagraphs: Array<{ before: string; after: string }> = [];

    // Simple diff - find paragraphs in B not in A
    const setA = new Set(paragraphsA.map(p => p.trim()));
    const setB = new Set(paragraphsB.map(p => p.trim()));

    for (const p of paragraphsB) {
      if (!setA.has(p.trim())) {
        addedParagraphs.push(p);
      }
    }

    for (const p of paragraphsA) {
      if (!setB.has(p.trim())) {
        removedParagraphs.push(p);
      }
    }

    return {
      versionAId,
      versionBId,
      contentChanged,
      addedCharacters,
      removedCharacters,
      addedWords,
      removedWords,
      addedParagraphs,
      removedParagraphs,
      modifiedParagraphs,
      metadataChanges: []
    };
  }

  // ==========================================================================
  // ROLLBACK
  // ==========================================================================

  /**
   * Rollback to a previous version
   */
  rollbackToVersion(
    targetVersionId: string,
    authorId?: string,
    authorName?: string
  ): Version {
    const targetVersion = this.versions.get(targetVersionId);
    if (!targetVersion) {
      throw new Error(`Version ${targetVersionId} not found`);
    }

    // Create a new version with the old content
    return this.createVersion(
      targetVersion.entityId,
      targetVersion.entityType,
      targetVersion.branchId,
      targetVersion.content,
      {
        changeType: ChangeType.UPDATE,
        changeDescription: `Rolled back to version ${targetVersion.versionNumber}`,
        title: targetVersion.title,
        authorId,
        authorName,
        isDraft: false,
        isAutoSave: false
      }
    );
  }

  /**
   * Restore a deleted entity from its last version
   */
  restoreEntity(
    entityId: string,
    branchId: string,
    authorId?: string,
    authorName?: string
  ): Version | undefined {
    const versions = this.getEntityVersions(entityId, branchId);
    if (versions.length === 0) return undefined;

    const lastVersion = versions[versions.length - 1];

    return this.createVersion(
      entityId,
      lastVersion.entityType,
      branchId,
      lastVersion.content,
      {
        changeType: ChangeType.CREATE,
        changeDescription: 'Restored from history',
        title: lastVersion.title,
        authorId,
        authorName
      }
    );
  }

  // ==========================================================================
  // TAGGING
  // ==========================================================================

  /**
   * Create a tag for a version
   */
  createTag(
    name: string,
    versionId: string,
    description?: string
  ): Tag {
    const version = this.versions.get(versionId);
    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }

    const id = uuidv4();

    const tag: Tag = {
      id,
      name,
      description,
      versionId,
      branchId: version.branchId,
      entityId: version.entityId,
      entityType: version.entityType,
      createdAt: new Date()
    };

    this.tags.set(id, tag);

    // Index by entity
    if (!this.tagsByEntity.has(version.entityId)) {
      this.tagsByEntity.set(version.entityId, new Set());
    }
    this.tagsByEntity.get(version.entityId)!.add(id);

    return tag;
  }

  /**
   * Get tag by name for an entity
   */
  getTag(entityId: string, tagName: string): Tag | undefined {
    const tagIds = this.tagsByEntity.get(entityId);
    if (!tagIds) return undefined;

    for (const tagId of tagIds) {
      const tag = this.tags.get(tagId);
      if (tag && tag.name === tagName) {
        return tag;
      }
    }

    return undefined;
  }

  /**
   * Get all tags for an entity
   */
  getEntityTags(entityId: string): Tag[] {
    const tagIds = this.tagsByEntity.get(entityId);
    if (!tagIds) return [];

    return Array.from(tagIds)
      .map(id => this.tags.get(id)!)
      .filter(Boolean)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get version by tag
   */
  getVersionByTag(entityId: string, tagName: string): Version | undefined {
    const tag = this.getTag(entityId, tagName);
    if (!tag) return undefined;

    return this.versions.get(tag.versionId);
  }

  /**
   * Delete a tag
   */
  deleteTag(tagId: string): boolean {
    const tag = this.tags.get(tagId);
    if (!tag) return false;

    this.tags.delete(tagId);
    this.tagsByEntity.get(tag.entityId)?.delete(tagId);

    return true;
  }

  // ==========================================================================
  // BRANCH MERGING
  // ==========================================================================

  /**
   * Merge a branch into another
   */
  mergeBranch(
    sourceBranchId: string,
    targetBranchId: string,
    authorId?: string,
    authorName?: string
  ): MergeResult {
    const sourceBranch = this.branches.get(sourceBranchId);
    const targetBranch = this.branches.get(targetBranchId);

    if (!sourceBranch || !targetBranch) {
      return {
        success: false,
        conflicts: [],
        warnings: ['One or both branches not found'],
        mergedEntities: []
      };
    }

    const conflicts: MergeResult['conflicts'] = [];
    const warnings: string[] = [];
    const mergedEntities: string[] = [];

    // Get all entities with versions on source branch
    const sourceEntityIds = new Set<string>();
    const sourceVersionIds = this.versionsByBranch.get(sourceBranchId);

    if (sourceVersionIds) {
      for (const versionId of sourceVersionIds) {
        const version = this.versions.get(versionId);
        if (version) {
          sourceEntityIds.add(version.entityId);
        }
      }
    }

    // For each entity, merge the latest version
    for (const entityId of sourceEntityIds) {
      const sourceVersion = this.getLatestVersion(entityId, sourceBranchId);
      const targetVersion = this.getLatestVersion(entityId, targetBranchId);

      if (!sourceVersion) continue;

      if (!targetVersion) {
        // No conflict - create version on target branch
        this.createVersion(
          entityId,
          sourceVersion.entityType,
          targetBranchId,
          sourceVersion.content,
          {
            changeType: ChangeType.MERGE,
            changeDescription: `Merged from branch "${sourceBranch.name}"`,
            title: sourceVersion.title,
            authorId,
            authorName
          }
        );
        mergedEntities.push(entityId);
      } else if (sourceVersion.contentHash !== targetVersion.contentHash) {
        // Potential conflict
        conflicts.push({
          entityId,
          entityType: sourceVersion.entityType,
          sourceContent: sourceVersion.content,
          targetContent: targetVersion.content
        });
      } else {
        // Content is the same - no merge needed
        warnings.push(`Entity ${entityId} unchanged, skipping`);
      }
    }

    // Mark source branch as merged if no conflicts
    if (conflicts.length === 0) {
      sourceBranch.status = BranchStatus.MERGED;
      sourceBranch.mergedAt = new Date();
      sourceBranch.mergedIntoBranchId = targetBranchId;
      sourceBranch.updatedAt = new Date();
    }

    return {
      success: conflicts.length === 0,
      conflicts,
      warnings,
      mergedEntities
    };
  }

  /**
   * Resolve a merge conflict
   */
  resolveConflict(
    entityId: string,
    entityType: VersionableType,
    targetBranchId: string,
    resolvedContent: string,
    sourceBranchName: string,
    authorId?: string,
    authorName?: string
  ): Version {
    return this.createVersion(
      entityId,
      entityType,
      targetBranchId,
      resolvedContent,
      {
        changeType: ChangeType.MERGE,
        changeDescription: `Merge conflict resolved (from "${sourceBranchName}")`,
        authorId,
        authorName
      }
    );
  }

  // ==========================================================================
  // HISTORY
  // ==========================================================================

  /**
   * Record a history entry
   */
  private recordHistory(data: {
    versionId: string;
    entityId: string;
    entityType: VersionableType;
    branchId: string;
    changeType: ChangeType;
    description: string;
    previousVersionId?: string;
    affectedEntities?: string[];
    authorId?: string;
    authorName?: string;
  }): HistoryEntry {
    const entry: HistoryEntry = {
      id: uuidv4(),
      versionId: data.versionId,
      entityId: data.entityId,
      entityType: data.entityType,
      branchId: data.branchId,
      changeType: data.changeType,
      description: data.description,
      previousVersionId: data.previousVersionId,
      affectedEntities: data.affectedEntities,
      authorId: data.authorId,
      authorName: data.authorName,
      timestamp: new Date()
    };

    this.history.push(entry);

    return entry;
  }

  /**
   * Get history for an entity
   */
  getEntityHistory(entityId: string, limit?: number): HistoryEntry[] {
    const entries = this.history
      .filter(e => e.entityId === entityId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? entries.slice(0, limit) : entries;
  }

  /**
   * Get history for a branch
   */
  getBranchHistory(branchId: string, limit?: number): HistoryEntry[] {
    const entries = this.history
      .filter(e => e.branchId === branchId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? entries.slice(0, limit) : entries;
  }

  /**
   * Get full project history
   */
  getProjectHistory(projectId: string, limit?: number): HistoryEntry[] {
    const projectBranches = this.getProjectBranches(projectId);
    const branchIds = new Set(projectBranches.map(b => b.id));

    const entries = this.history
      .filter(e => branchIds.has(e.branchId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? entries.slice(0, limit) : entries;
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Prune old auto-save versions
   */
  pruneAutoSaves(olderThanDays?: number): number {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - (olderThanDays ?? this.config.pruneAutoSavesAfter));

    let pruned = 0;

    for (const [id, version] of this.versions) {
      if (version.isAutoSave && version.createdAt < threshold) {
        // Don't delete if it's the only version
        const entityVersions = this.getEntityVersions(version.entityId, version.branchId);
        if (entityVersions.length > 1) {
          this.deleteVersion(id);
          pruned++;
        }
      }
    }

    return pruned;
  }

  /**
   * Delete a version
   */
  private deleteVersion(versionId: string): boolean {
    const version = this.versions.get(versionId);
    if (!version) return false;

    this.versions.delete(versionId);
    this.versionsByEntity.get(version.entityId)?.delete(versionId);
    this.versionsByBranch.get(version.branchId)?.delete(versionId);

    // Update latest if needed
    const latest = this.latestVersions.get(version.branchId);
    if (latest?.get(version.entityId) === versionId) {
      const remaining = this.getEntityVersions(version.entityId, version.branchId);
      if (remaining.length > 0) {
        latest.set(version.entityId, remaining[remaining.length - 1].id);
      } else {
        latest.delete(version.entityId);
      }
    }

    return true;
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get version engine statistics
   */
  getStats(): {
    totalVersions: number;
    totalBranches: number;
    totalTags: number;
    totalHistoryEntries: number;
    versionsByType: Record<string, number>;
    autoSaveCount: number;
    draftCount: number;
  } {
    const versionsByType: Record<string, number> = {};
    let autoSaveCount = 0;
    let draftCount = 0;

    for (const version of this.versions.values()) {
      versionsByType[version.entityType] = (versionsByType[version.entityType] ?? 0) + 1;
      if (version.isAutoSave) autoSaveCount++;
      if (version.isDraft) draftCount++;
    }

    return {
      totalVersions: this.versions.size,
      totalBranches: this.branches.size,
      totalTags: this.tags.size,
      totalHistoryEntries: this.history.length,
      versionsByType,
      autoSaveCount,
      draftCount
    };
  }

  // ==========================================================================
  // SERIALIZATION
  // ==========================================================================

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      versions: Array.from(this.versions.values()),
      branches: Array.from(this.branches.values()),
      tags: Array.from(this.tags.values()),
      history: this.history,
      config: this.config
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.clear();

    if (data.config) {
      this.config = { ...defaultConfig, ...data.config };
    }

    if (data.branches) {
      for (const branch of data.branches) {
        branch.createdAt = new Date(branch.createdAt);
        branch.updatedAt = new Date(branch.updatedAt);
        if (branch.mergedAt) branch.mergedAt = new Date(branch.mergedAt);
        this.branches.set(branch.id, branch);
        this.versionsByBranch.set(branch.id, new Set());
        this.latestVersions.set(branch.id, new Map());
      }
    }

    if (data.versions) {
      for (const version of data.versions) {
        version.createdAt = new Date(version.createdAt);
        this.storeVersion(version);
      }
    }

    if (data.tags) {
      for (const tag of data.tags) {
        tag.createdAt = new Date(tag.createdAt);
        this.tags.set(tag.id, tag);
        if (!this.tagsByEntity.has(tag.entityId)) {
          this.tagsByEntity.set(tag.entityId, new Set());
        }
        this.tagsByEntity.get(tag.entityId)!.add(tag.id);
      }
    }

    if (data.history) {
      for (const entry of data.history) {
        entry.timestamp = new Date(entry.timestamp);
        this.history.push(entry);
      }
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.versions.clear();
    this.branches.clear();
    this.tags.clear();
    this.history = [];
    this.versionsByEntity.clear();
    this.versionsByBranch.clear();
    this.tagsByEntity.clear();
    this.latestVersions.clear();
  }
}

export default VersionEngine;
