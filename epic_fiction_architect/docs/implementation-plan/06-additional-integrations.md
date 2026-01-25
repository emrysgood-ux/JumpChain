# Additional Tools Integration Specification

## Purpose

Enable seamless workflow integration with popular writing tools, note-taking applications, and external services. Allow writers to continue using their preferred tools while leveraging Epic Fiction Architect's organizational and analytical capabilities.

## Supported Integrations

| Tool | Integration Type | Sync Direction |
|------|-----------------|----------------|
| Scrivener | Import/Export | Bidirectional |
| Obsidian | Vault Sync | Bidirectional |
| Notion | API Sync | Bidirectional |
| World Anvil | API Sync | Import-focused |
| Google Docs | API Sync | Bidirectional |
| Git | Version Control | Native |
| Airtable | Database Sync | Bidirectional |

## Scrivener Integration

### Import from Scrivener

```typescript
interface ScrivenerImporter {
  // Import entire project
  importProject(scrivxPath: string): Promise<ImportedProject>;

  // Import specific binder items
  importBinderItems(scrivxPath: string, itemIds: string[]): Promise<ImportedItems>;

  // Parse Scrivener project structure
  parseProject(scrivxPath: string): Promise<ScrivenerProject>;

  // Map Scrivener metadata to story bible
  mapMetadata(item: ScrivenerItem): StoryBibleEntity;
}

interface ScrivenerProject {
  path: string;
  title: string;
  version: string;  // Scrivener 3, 2, etc.

  // Binder structure
  binder: ScrivenerBinder;

  // Project settings
  settings: ScrivenerSettings;

  // Compile settings
  compileSettings: CompileSettings[];
}

interface ScrivenerBinder {
  root: ScrivenerFolder;
  draftFolder: ScrivenerFolder;   // Manuscript
  researchFolder: ScrivenerFolder;
  trashFolder: ScrivenerFolder;
}

interface ScrivenerItem {
  uuid: string;
  type: 'folder' | 'document' | 'documentGroup';
  title: string;
  created: Date;
  modified: Date;

  // Content
  text?: string;        // RTF or plain text
  synopsis?: string;
  notes?: string;

  // Metadata
  label?: string;       // Color label
  status?: string;
  keywords?: string[];
  customMetadata?: Record<string, any>;

  // Targets
  wordCountTarget?: number;
  includeInCompile?: boolean;

  // Children (for folders)
  children?: ScrivenerItem[];

  // Snapshots
  snapshots?: ScrivenerSnapshot[];
}

class ScrivenerImporterImpl implements ScrivenerImporter {
  async importProject(scrivxPath: string): Promise<ImportedProject> {
    // 1. Parse .scrivx XML file
    const project = await this.parseProject(scrivxPath);

    // 2. Import manuscript structure
    const chapters = await this.importManuscript(project.binder.draftFolder);

    // 3. Import research/reference materials
    const references = await this.importResearch(project.binder.researchFolder);

    // 4. Extract characters, locations from documents
    const entities = this.extractEntities(project);

    // 5. Build story bible
    const storyBible = this.buildStoryBible(entities, chapters);

    return {
      project,
      chapters,
      references,
      storyBible,
      metadata: {
        importDate: new Date(),
        source: scrivxPath,
        originalVersion: project.version
      }
    };
  }

  private async importManuscript(draftFolder: ScrivenerFolder): Promise<Chapter[]> {
    const chapters: Chapter[] = [];

    for (const item of draftFolder.children) {
      if (item.type === 'folder' || item.type === 'documentGroup') {
        // Folder = Chapter
        const chapter = await this.importChapter(item);
        chapters.push(chapter);
      } else if (item.type === 'document' && item.includeInCompile) {
        // Standalone document in draft = single-scene chapter
        const chapter = await this.importDocumentAsChapter(item);
        chapters.push(chapter);
      }
    }

    return chapters;
  }

  private async importChapter(folder: ScrivenerItem): Promise<Chapter> {
    const scenes: Scene[] = [];

    for (const child of folder.children || []) {
      if (child.type === 'document' && child.includeInCompile) {
        const scene = await this.importScene(child);
        scenes.push(scene);
      }
    }

    return {
      id: folder.uuid,
      title: folder.title,
      number: 0,  // Will be assigned later
      scenes,
      synopsis: folder.synopsis,
      notes: folder.notes,
      status: this.mapStatus(folder.status),
      metadata: {
        scrivenerLabel: folder.label,
        scrivenerKeywords: folder.keywords
      }
    };
  }

  private async importScene(doc: ScrivenerItem): Promise<Scene> {
    // Read RTF content and convert to markdown
    const rtfContent = await this.readRTFContent(doc);
    const markdown = this.rtfToMarkdown(rtfContent);

    return {
      id: doc.uuid,
      title: doc.title,
      content: markdown,
      synopsis: doc.synopsis,
      wordCount: this.countWords(markdown),
      status: this.mapStatus(doc.status),
      metadata: {
        scrivenerLabel: doc.label,
        scrivenerKeywords: doc.keywords,
        customMetadata: doc.customMetadata
      }
    };
  }
}
```

### Export to Scrivener

```typescript
interface ScrivenerExporter {
  // Export entire project
  exportProject(project: Project, outputPath: string): Promise<void>;

  // Export specific chapters
  exportChapters(chapters: Chapter[], existingProject: string): Promise<void>;

  // Generate Scrivener compile preset
  generateCompilePreset(template: PublishingTemplate): ScrivenerCompileFormat;
}

class ScrivenerExporterImpl implements ScrivenerExporter {
  async exportProject(project: Project, outputPath: string): Promise<void> {
    // Create Scrivener project structure
    const projectDir = path.join(outputPath, `${project.title}.scriv`);

    // Create directory structure
    await fs.mkdir(path.join(projectDir, 'Files', 'Data'), { recursive: true });
    await fs.mkdir(path.join(projectDir, 'Files', 'Docs'));
    await fs.mkdir(path.join(projectDir, 'Settings'));
    await fs.mkdir(path.join(projectDir, 'Snapshots'));

    // Generate .scrivx file
    const scrivx = this.generateScrivX(project);
    await fs.writeFile(path.join(projectDir, `${project.title}.scrivx`), scrivx);

    // Export documents
    for (const chapter of project.chapters) {
      await this.exportChapter(chapter, projectDir);
    }

    // Export research
    if (project.storyBible) {
      await this.exportStoryBibleAsResearch(project.storyBible, projectDir);
    }
  }

  private generateScrivX(project: Project): string {
    // Generate XML for .scrivx file
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true
    });

    return builder.build({
      ScrivenerProject: {
        '@_Version': '3.0',
        Binder: this.generateBinderXML(project),
        Collections: this.generateCollectionsXML(project),
        LabelSettings: this.generateLabelSettings(),
        StatusSettings: this.generateStatusSettings()
      }
    });
  }
}
```

## Obsidian Integration

### Vault Synchronization

```typescript
interface ObsidianSync {
  // Configure vault connection
  configureVault(vaultPath: string, config: ObsidianConfig): void;

  // Sync operations
  syncToVault(): Promise<SyncResult>;
  syncFromVault(): Promise<SyncResult>;
  bidirectionalSync(): Promise<SyncResult>;

  // Watch for changes
  watchVault(callback: (changes: VaultChange[]) => void): void;
  stopWatching(): void;

  // Conflict resolution
  resolveConflict(conflict: SyncConflict, resolution: Resolution): void;
}

interface ObsidianConfig {
  // Folder mapping
  folders: {
    characters: string;      // e.g., "Story Bible/Characters"
    locations: string;       // e.g., "Story Bible/Locations"
    scenes: string;          // e.g., "Manuscript/Scenes"
    chapters: string;        // e.g., "Manuscript/Chapters"
    timeline: string;        // e.g., "Story Bible/Timeline"
    plotThreads: string;     // e.g., "Story Bible/Plot Threads"
  };

  // Link handling
  linkStyle: 'wikilink' | 'markdown';
  useAliases: boolean;

  // Metadata
  metadataLocation: 'frontmatter' | 'dataview' | 'both';
  dateFormat: string;

  // Templates
  characterTemplate?: string;
  sceneTemplate?: string;
  locationTemplate?: string;

  // Sync behavior
  syncInterval: number;      // milliseconds, 0 for manual only
  conflictStrategy: 'local-wins' | 'remote-wins' | 'manual';
}

interface VaultChange {
  type: 'created' | 'modified' | 'deleted' | 'renamed';
  path: string;
  oldPath?: string;        // For renames
  timestamp: Date;
  content?: string;
}

class ObsidianSyncImpl implements ObsidianSync {
  private config: ObsidianConfig;
  private watcher: FSWatcher | null = null;

  async syncToVault(): Promise<SyncResult> {
    const changes: SyncChange[] = [];

    // Sync characters
    for (const character of this.storyBible.characters) {
      const change = await this.syncCharacterToVault(character);
      if (change) changes.push(change);
    }

    // Sync locations
    for (const location of this.storyBible.locations) {
      const change = await this.syncLocationToVault(location);
      if (change) changes.push(change);
    }

    // Sync scenes
    for (const scene of this.manuscript.scenes) {
      const change = await this.syncSceneToVault(scene);
      if (change) changes.push(change);
    }

    // Sync timeline events
    for (const event of this.timeline.events) {
      const change = await this.syncEventToVault(event);
      if (change) changes.push(change);
    }

    return { changes, conflicts: [], timestamp: new Date() };
  }

  private async syncCharacterToVault(character: Character): Promise<SyncChange | null> {
    const filePath = path.join(
      this.config.folders.characters,
      `${this.sanitizeFilename(character.name)}.md`
    );

    const content = this.generateCharacterNote(character);
    const existing = await this.readVaultFile(filePath);

    if (!existing) {
      await this.writeVaultFile(filePath, content);
      return { type: 'created', path: filePath };
    }

    if (this.hasChanged(existing, content)) {
      // Check for conflicts
      const vaultModified = await this.getFileModTime(filePath);
      const localModified = character.updatedAt;

      if (vaultModified > localModified) {
        return { type: 'conflict', path: filePath, local: content, remote: existing };
      }

      await this.writeVaultFile(filePath, content);
      return { type: 'updated', path: filePath };
    }

    return null;
  }

  private generateCharacterNote(character: Character): string {
    // Generate Obsidian-formatted note with frontmatter
    const frontmatter = {
      id: character.id,
      type: 'character',
      aliases: character.aliases,
      tags: ['character', ...character.tags],
      created: character.createdAt.toISOString(),
      modified: character.updatedAt.toISOString()
    };

    const links = character.relationships.map(rel =>
      `- [[${rel.targetName}]]: ${rel.type} (${rel.description})`
    ).join('\n');

    return `---
${yaml.dump(frontmatter)}---

# ${character.name}

## Basic Information
- **Age**: ${character.age}
- **Species**: ${character.species || 'Human'}
- **Occupation**: ${character.occupation || 'Unknown'}

## Appearance
${character.appearance || 'No description available.'}

## Personality
${character.personality || 'No description available.'}

## Background
${character.background || 'No background available.'}

## Relationships
${links || 'No relationships defined.'}

## Notes
${character.notes || ''}
`;
  }

  async syncFromVault(): Promise<SyncResult> {
    const changes: SyncChange[] = [];

    // Find all character files
    const characterFiles = await glob(
      path.join(this.vaultPath, this.config.folders.characters, '*.md')
    );

    for (const filePath of characterFiles) {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = this.parseObsidianNote(content);

      if (parsed.frontmatter?.type === 'character') {
        const existingId = parsed.frontmatter.id;
        const existing = this.storyBible.characters.find(c => c.id === existingId);

        if (existing) {
          const updated = this.updateCharacterFromNote(existing, parsed);
          if (updated) changes.push({ type: 'updated', path: filePath, entity: updated });
        } else {
          const created = this.createCharacterFromNote(parsed);
          changes.push({ type: 'created', path: filePath, entity: created });
        }
      }
    }

    return { changes, conflicts: [], timestamp: new Date() };
  }

  private parseObsidianNote(content: string): ParsedNote {
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = frontmatterMatch ? yaml.parse(frontmatterMatch[1]) : {};

    // Extract body
    const body = content.replace(/^---\n[\s\S]*?\n---\n*/, '');

    // Extract sections
    const sections = this.parseSections(body);

    // Extract links
    const wikiLinks = body.match(/\[\[(.*?)\]\]/g) || [];
    const links = wikiLinks.map(l => l.slice(2, -2));

    return { frontmatter, body, sections, links };
  }
}
```

## Notion Integration

```typescript
interface NotionSync {
  // Authentication
  connect(apiKey: string): Promise<void>;
  disconnect(): void;

  // Database mapping
  mapDatabase(notionDbId: string, entityType: EntityType): void;
  unmapDatabase(notionDbId: string): void;

  // Sync operations
  syncToNotion(): Promise<SyncResult>;
  syncFromNotion(): Promise<SyncResult>;

  // Real-time updates
  enableWebhook(webhookUrl: string): Promise<void>;
  disableWebhook(): Promise<void>;
}

interface NotionConfig {
  apiKey: string;

  // Database mappings
  databases: {
    characters?: string;     // Notion database ID
    locations?: string;
    scenes?: string;
    plotThreads?: string;
    timeline?: string;
  };

  // Property mappings
  propertyMappings: {
    [entityType: string]: {
      [localProperty: string]: NotionPropertyMapping;
    };
  };

  // Sync settings
  syncDirection: 'to-notion' | 'from-notion' | 'bidirectional';
  conflictResolution: 'local-wins' | 'notion-wins' | 'manual';
}

interface NotionPropertyMapping {
  notionProperty: string;
  notionType: NotionPropertyType;
  transform?: (value: any) => any;  // Optional value transformer
}

type NotionPropertyType =
  | 'title'
  | 'rich_text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'people'
  | 'files'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'phone_number'
  | 'relation'
  | 'rollup'
  | 'formula'
  | 'created_time'
  | 'last_edited_time';

class NotionSyncImpl implements NotionSync {
  private client: Client;  // @notionhq/client

  async syncToNotion(): Promise<SyncResult> {
    const changes: SyncChange[] = [];

    // Sync characters
    if (this.config.databases.characters) {
      for (const character of this.storyBible.characters) {
        const change = await this.syncCharacterToNotion(character);
        if (change) changes.push(change);
      }
    }

    // Sync other entity types...

    return { changes, conflicts: [], timestamp: new Date() };
  }

  private async syncCharacterToNotion(character: Character): Promise<SyncChange | null> {
    const dbId = this.config.databases.characters!;
    const mapping = this.config.propertyMappings.characters;

    // Check if page exists
    const existingPage = await this.findNotionPage(dbId, character.id);

    const properties = this.mapToNotionProperties(character, mapping);

    if (existingPage) {
      // Update existing page
      await this.client.pages.update({
        page_id: existingPage.id,
        properties
      });
      return { type: 'updated', entity: character };
    } else {
      // Create new page
      await this.client.pages.create({
        parent: { database_id: dbId },
        properties
      });
      return { type: 'created', entity: character };
    }
  }

  private mapToNotionProperties(
    entity: any,
    mapping: Record<string, NotionPropertyMapping>
  ): Record<string, any> {
    const properties: Record<string, any> = {};

    for (const [localProp, notionMapping] of Object.entries(mapping)) {
      const value = entity[localProp];
      if (value === undefined) continue;

      const transformedValue = notionMapping.transform
        ? notionMapping.transform(value)
        : value;

      properties[notionMapping.notionProperty] = this.formatNotionProperty(
        transformedValue,
        notionMapping.notionType
      );
    }

    return properties;
  }

  private formatNotionProperty(value: any, type: NotionPropertyType): any {
    switch (type) {
      case 'title':
        return { title: [{ text: { content: String(value) } }] };
      case 'rich_text':
        return { rich_text: [{ text: { content: String(value) } }] };
      case 'number':
        return { number: Number(value) };
      case 'select':
        return { select: { name: String(value) } };
      case 'multi_select':
        return { multi_select: (value as string[]).map(v => ({ name: v })) };
      case 'date':
        return { date: { start: value instanceof Date ? value.toISOString() : value } };
      case 'checkbox':
        return { checkbox: Boolean(value) };
      case 'url':
        return { url: String(value) };
      // ... other types
    }
  }
}
```

## World Anvil Integration

```typescript
interface WorldAnvilSync {
  // Authentication
  connect(apiKey: string): Promise<void>;

  // World selection
  listWorlds(): Promise<WorldAnvilWorld[]>;
  selectWorld(worldId: string): void;

  // Import operations
  importWorld(): Promise<ImportedWorld>;
  importArticles(articleIds: string[]): Promise<ImportedArticles>;
  importTimeline(): Promise<ImportedTimeline>;

  // Export operations (limited by WA API)
  exportCharacters(characters: Character[]): Promise<void>;
  exportLocations(locations: Location[]): Promise<void>;
}

interface WorldAnvilConfig {
  apiKey: string;
  worldId: string;

  // Import settings
  importCategories: string[];  // Which WA categories to import
  mergeStrategy: 'replace' | 'merge' | 'skip-existing';

  // Mapping
  categoryMapping: {
    [waCategory: string]: EntityType;
  };
}

class WorldAnvilSyncImpl implements WorldAnvilSync {
  private apiKey: string;
  private worldId: string;
  private baseUrl = 'https://www.worldanvil.com/api/world';

  async importWorld(): Promise<ImportedWorld> {
    // Fetch world metadata
    const world = await this.fetchWorld();

    // Fetch all articles
    const articles = await this.fetchAllArticles();

    // Fetch timeline
    const timeline = await this.fetchTimeline();

    // Convert to story bible entities
    const characters = articles
      .filter(a => this.isCharacterArticle(a))
      .map(a => this.convertToCharacter(a));

    const locations = articles
      .filter(a => this.isLocationArticle(a))
      .map(a => this.convertToLocation(a));

    // ... other entity types

    return {
      world: {
        name: world.title,
        description: world.description,
        genre: world.genre
      },
      characters,
      locations,
      timeline: this.convertTimeline(timeline),
      rawArticles: articles
    };
  }

  private async fetchAllArticles(): Promise<WorldAnvilArticle[]> {
    const articles: WorldAnvilArticle[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.fetch(`/articles?page=${page}`);
      articles.push(...response.articles);
      hasMore = response.hasMore;
      page++;
    }

    return articles;
  }

  private convertToCharacter(article: WorldAnvilArticle): Character {
    return {
      id: `wa-${article.id}`,
      name: article.title,
      aliases: article.aliases || [],
      description: this.stripHtml(article.content),
      appearance: this.extractSection(article.content, 'Physical Description'),
      personality: this.extractSection(article.content, 'Personality'),
      background: this.extractSection(article.content, 'History'),
      relationships: this.extractRelationships(article),
      metadata: {
        source: 'world-anvil',
        worldAnvilId: article.id,
        worldAnvilUrl: article.url
      }
    };
  }
}
```

## Google Docs Integration

```typescript
interface GoogleDocsSync {
  // Authentication
  authenticate(): Promise<void>;
  setCredentials(credentials: GoogleCredentials): void;

  // Document operations
  importDocument(docId: string): Promise<ImportedDocument>;
  exportToDocument(content: string, docId?: string): Promise<string>;

  // Sync
  syncBidirectional(docId: string, localContent: string): Promise<SyncResult>;

  // Collaboration
  getComments(docId: string): Promise<Comment[]>;
  getSuggestions(docId: string): Promise<Suggestion[]>;
}

class GoogleDocsSyncImpl implements GoogleDocsSync {
  private docs: docs_v1.Docs;

  async importDocument(docId: string): Promise<ImportedDocument> {
    const doc = await this.docs.documents.get({ documentId: docId });

    // Extract content
    const content = this.extractContent(doc.data.body?.content || []);

    // Extract comments
    const comments = await this.getComments(docId);

    // Convert to markdown
    const markdown = this.googleDocToMarkdown(doc.data);

    return {
      id: docId,
      title: doc.data.title || 'Untitled',
      content: markdown,
      comments,
      metadata: {
        createdTime: doc.data.createdTime,
        modifiedTime: doc.data.modifiedTime
      }
    };
  }

  private googleDocToMarkdown(doc: docs_v1.Schema$Document): string {
    const content = doc.body?.content || [];
    let markdown = '';

    for (const element of content) {
      if (element.paragraph) {
        markdown += this.paragraphToMarkdown(element.paragraph);
      } else if (element.table) {
        markdown += this.tableToMarkdown(element.table);
      }
      // ... other element types
    }

    return markdown;
  }

  private paragraphToMarkdown(paragraph: docs_v1.Schema$Paragraph): string {
    let text = '';

    for (const element of paragraph.elements || []) {
      if (element.textRun) {
        let content = element.textRun.content || '';

        // Apply formatting
        const style = element.textRun.textStyle;
        if (style?.bold) content = `**${content}**`;
        if (style?.italic) content = `*${content}*`;
        if (style?.strikethrough) content = `~~${content}~~`;

        text += content;
      }
    }

    // Handle heading styles
    const style = paragraph.paragraphStyle;
    if (style?.namedStyleType?.startsWith('HEADING_')) {
      const level = parseInt(style.namedStyleType.replace('HEADING_', ''));
      return '#'.repeat(level) + ' ' + text.trim() + '\n\n';
    }

    return text;
  }
}
```

## Git Integration

```typescript
interface GitIntegration {
  // Repository operations
  initRepository(path: string): Promise<void>;
  cloneRepository(url: string, path: string): Promise<void>;

  // Branch management
  createBranch(name: string): Promise<void>;
  switchBranch(name: string): Promise<void>;
  listBranches(): Promise<Branch[]>;

  // Commit operations
  stageChanges(paths: string[]): Promise<void>;
  commit(message: string): Promise<Commit>;
  getHistory(options?: HistoryOptions): Promise<Commit[]>;

  // Diff and merge
  getDiff(ref1: string, ref2: string): Promise<Diff>;
  merge(branch: string): Promise<MergeResult>;

  // Remote operations
  push(remote?: string, branch?: string): Promise<void>;
  pull(remote?: string, branch?: string): Promise<void>;
}

interface GitConfig {
  // Auto-commit settings
  autoCommit: boolean;
  commitInterval: number;  // minutes
  commitMessageTemplate: string;

  // Branch strategy
  branchStrategy: 'single' | 'chapter-branches' | 'feature-branches';
  mainBranch: string;

  // Hooks
  preCommitHook?: (changes: StagedChange[]) => boolean;
  postCommitHook?: (commit: Commit) => void;
}

class GitIntegrationImpl implements GitIntegration {
  private git: SimpleGit;

  constructor(repoPath: string) {
    this.git = simpleGit(repoPath);
  }

  async commit(message: string): Promise<Commit> {
    // Stage all changes
    await this.git.add('.');

    // Get staged changes for validation
    const status = await this.git.status();

    if (status.staged.length === 0) {
      throw new Error('No changes to commit');
    }

    // Create commit
    const result = await this.git.commit(message);

    return {
      hash: result.commit,
      message,
      timestamp: new Date(),
      files: status.staged
    };
  }

  async getHistory(options?: HistoryOptions): Promise<Commit[]> {
    const log = await this.git.log({
      maxCount: options?.limit || 50,
      file: options?.path
    });

    return log.all.map(entry => ({
      hash: entry.hash,
      message: entry.message,
      timestamp: new Date(entry.date),
      author: entry.author_name
    }));
  }

  // Story-specific operations
  async createChapterBranch(chapterNumber: number): Promise<void> {
    const branchName = `chapter-${chapterNumber.toString().padStart(3, '0')}`;
    await this.createBranch(branchName);
  }

  async mergeChapterToMain(chapterNumber: number): Promise<MergeResult> {
    const branchName = `chapter-${chapterNumber.toString().padStart(3, '0')}`;
    await this.switchBranch(this.config.mainBranch);
    return this.merge(branchName);
  }
}
```

## Airtable Integration

```typescript
interface AirtableSync {
  // Connection
  connect(apiKey: string, baseId: string): void;

  // Table mapping
  mapTable(tableId: string, entityType: EntityType, fieldMapping: FieldMapping): void;

  // Sync operations
  syncToAirtable(): Promise<SyncResult>;
  syncFromAirtable(): Promise<SyncResult>;

  // Views
  listViews(tableId: string): Promise<AirtableView[]>;
  importView(tableId: string, viewId: string): Promise<ImportedRecords>;
}

interface AirtableConfig {
  apiKey: string;
  baseId: string;

  tables: {
    [entityType: string]: {
      tableId: string;
      fieldMapping: FieldMapping;
    };
  };

  syncSettings: {
    direction: 'to-airtable' | 'from-airtable' | 'bidirectional';
    conflictResolution: 'local-wins' | 'airtable-wins' | 'manual';
  };
}

interface FieldMapping {
  [localField: string]: {
    airtableField: string;
    airtableType: AirtableFieldType;
    linkedTable?: string;  // For linked record fields
  };
}

class AirtableSyncImpl implements AirtableSync {
  private base: Airtable.Base;

  async syncToAirtable(): Promise<SyncResult> {
    const changes: SyncChange[] = [];

    for (const [entityType, config] of Object.entries(this.config.tables)) {
      const entities = this.getEntities(entityType);
      const table = this.base(config.tableId);

      for (const entity of entities) {
        const fields = this.mapToAirtableFields(entity, config.fieldMapping);

        // Check if record exists
        const existingRecord = await this.findRecord(table, entity.id);

        if (existingRecord) {
          await table.update(existingRecord.id, fields);
          changes.push({ type: 'updated', entity });
        } else {
          await table.create(fields);
          changes.push({ type: 'created', entity });
        }
      }
    }

    return { changes, conflicts: [], timestamp: new Date() };
  }
}
```

## Implementation Phases

### Phase 1: Scrivener Integration
- [ ] Import .scrivx project structure
- [ ] Parse RTF content to markdown
- [ ] Import metadata and labels
- [ ] Export to Scrivener format
- [ ] Bidirectional sync

### Phase 2: Obsidian Integration
- [ ] Vault structure mapping
- [ ] Note generation with frontmatter
- [ ] Wiki-link handling
- [ ] File watching for changes
- [ ] Conflict resolution

### Phase 3: Cloud Integrations
- [ ] Notion API integration
- [ ] Google Docs import/export
- [ ] World Anvil import
- [ ] Airtable sync

### Phase 4: Version Control
- [ ] Git repository integration
- [ ] Auto-commit functionality
- [ ] Branch management for chapters
- [ ] Diff visualization
- [ ] History browsing
