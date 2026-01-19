/**
 * Epic Fiction Architect - Core Type Definitions
 *
 * Comprehensive TypeScript interfaces for managing 300-million-word narratives
 * spanning 1000+ years with multiple characters, timelines, and worlds.
 */

// ============================================================================
// CORE ENUMS
// ============================================================================

export enum StoryElementType {
  CHARACTER = 'character',
  LOCATION = 'location',
  ITEM = 'item',
  CONCEPT = 'concept',
  FACTION = 'faction',
  EVENT = 'event',
  SPECIES = 'species',
  MAGIC_SYSTEM = 'magic_system',
  TECHNOLOGY = 'technology',
  CULTURE = 'culture'
}

export enum CharacterRole {
  PROTAGONIST = 'protagonist',
  DEUTERAGONIST = 'deuteragonist',
  ANTAGONIST = 'antagonist',
  MENTOR = 'mentor',
  ALLY = 'ally',
  LOVE_INTEREST = 'love_interest',
  SIDEKICK = 'sidekick',
  FOIL = 'foil',
  BACKGROUND = 'background'
}

export enum CharacterArcType {
  // K.M. Weiland Positive Arcs
  POSITIVE_CHANGE = 'positive_change',
  FLAT_TESTING = 'flat_testing',

  // K.M. Weiland Negative Arcs
  DISILLUSIONMENT = 'disillusionment',
  FALL = 'fall',
  CORRUPTION = 'corruption',

  // Extended Types
  REDEMPTION = 'redemption',
  TRAGIC = 'tragic',
  COMING_OF_AGE = 'coming_of_age',
  HEROIC_JOURNEY = 'heroic_journey'
}

export enum PlotThreadStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  PAUSED = 'paused',
  RESOLVED = 'resolved',
  ABANDONED = 'abandoned'
}

export enum PlotThreadType {
  MAIN = 'main',
  SUBPLOT = 'subplot',
  ARC = 'arc',
  SAGA = 'saga',
  MYSTERY = 'mystery',
  ROMANCE = 'romance',
  FORESHADOWING = 'foreshadowing'
}

export enum PromiseStatus {
  PLANTED = 'planted',
  REINFORCED = 'reinforced',
  PROGRESSING = 'progressing',
  FULFILLED = 'fulfilled',
  SUBVERTED = 'subverted',
  ABANDONED = 'abandoned'
}

export enum SceneType {
  ACTION = 'action',
  REACTION = 'reaction', // Sequel in Scene-Sequel structure
  DIALOGUE = 'dialogue',
  EXPOSITION = 'exposition',
  TRANSITION = 'transition',
  FLASHBACK = 'flashback',
  DREAM = 'dream',
  MONTAGE = 'montage'
}

export enum RelationshipType {
  FAMILY = 'family',
  ROMANTIC = 'romantic',
  FRIENDSHIP = 'friendship',
  PROFESSIONAL = 'professional',
  RIVALRY = 'rivalry',
  MENTOR_STUDENT = 'mentor_student',
  ENEMY = 'enemy',
  ACQUAINTANCE = 'acquaintance'
}

export enum RomanceArcBeat {
  // Romancing the Beat structure
  SETUP = 'setup',
  MEET_CUTE = 'meet_cute',
  NO_WAY = 'no_way',
  FIRST_KISS = 'first_kiss',
  ATTRACTION = 'attraction',
  MIDPOINT = 'midpoint',
  INKLING = 'inkling',
  RETREAT = 'retreat',
  DARK_NIGHT = 'dark_night',
  GRAND_GESTURE = 'grand_gesture',
  HAPPILY_EVER_AFTER = 'happily_ever_after'
}

export enum EventCausalityType {
  ENABLES = 'enables',
  PREVENTS = 'prevents',
  REQUIRES = 'requires',
  TRIGGERS = 'triggers',
  INFLUENCES = 'influences',
  FORESHADOWS = 'foreshadows'
}

export enum EmotionArcPattern {
  // Kurt Vonnegut's 6 fundamental patterns
  RAGS_TO_RICHES = 'rags_to_riches',
  RICHES_TO_RAGS = 'riches_to_rags',
  MAN_IN_HOLE = 'man_in_hole',
  ICARUS = 'icarus',
  CINDERELLA = 'cinderella',
  OEDIPUS = 'oedipus'
}

export enum CompileFormat {
  MARKDOWN = 'markdown',
  DOCX = 'docx',
  PDF = 'pdf',
  EPUB = 'epub',
  HTML = 'html',
  PLAIN_TEXT = 'plain_text',
  FOUNTAIN = 'fountain', // Screenplay format
  LATEX = 'latex'
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  genre?: string;
  targetWordCount?: number;
  currentWordCount: number;
  defaultCalendarId?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  autoSaveInterval: number; // milliseconds
  backupFrequency: 'hourly' | 'daily' | 'weekly';
  defaultSceneWordTarget: number;
  enableSpellCheck: boolean;
  enableGrammarCheck: boolean;
  theme: 'light' | 'dark' | 'sepia';
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  aiProvider?: 'openai' | 'anthropic' | 'local';
  aiModel?: string;
  aiApiKey?: string; // Encrypted
}

export interface StoryElement {
  id: string;
  projectId: string;
  type: StoryElementType;
  name: string;
  aliases: string[];
  description?: string;
  notes?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CHARACTER SYSTEM
// ============================================================================

export interface Character extends StoryElement {
  type: StoryElementType.CHARACTER;
  role: CharacterRole;
  arcType: CharacterArcType;
  speciesId?: string;

  // Core Identity
  fullName: string;
  nicknames: string[];
  gender?: string;
  pronouns?: string;

  // Birth/Death
  birthDate?: TimelineDate;
  deathDate?: TimelineDate;
  birthLocationId?: string;

  // Physical Description
  physicalDescription?: PhysicalDescription;

  // Psychological Profile
  psychology?: CharacterPsychology;

  // Voice Fingerprint (for AI consistency)
  voiceFingerprint?: VoiceFingerprint;

  // Arc Tracking
  arcPhases: ArcPhase[];

  // Current state (changes over timeline)
  states: CharacterState[];
}

export interface PhysicalDescription {
  height?: string;
  build?: string;
  hairColor?: string;
  eyeColor?: string;
  skinTone?: string;
  distinguishingFeatures: string[];
  typicalClothing?: string;
  imageReferences: string[]; // URLs or file paths
}

export interface CharacterPsychology {
  // Core traits (Big Five model)
  openness?: number; // 0-100
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;

  // K.M. Weiland Arc Elements
  lie?: string; // The Lie the character believes
  truth?: string; // The Truth they must learn
  want?: string; // What they consciously want
  need?: string; // What they actually need
  ghost?: string; // Past wound that created the Lie

  // Additional traits
  strengths: string[];
  weaknesses: string[];
  fears: string[];
  desires: string[];
  values: string[];
  quirks: string[];
  speechPatterns: string[];
}

export interface VoiceFingerprint {
  // Vocabulary Analysis
  vocabularyComplexity: 'simple' | 'moderate' | 'complex' | 'erudite';
  favoredWords: string[];
  avoidedWords: string[];
  catchphrases: string[];

  // Sentence Patterns
  averageSentenceLength: number;
  sentenceVariation: 'low' | 'medium' | 'high';
  preferredStructures: ('simple' | 'compound' | 'complex' | 'compound-complex')[];

  // Tone & Style
  formalityLevel: number; // 0-100 (casual to formal)
  emotionalExpressiveness: number; // 0-100
  humorStyle?: 'witty' | 'sarcastic' | 'dry' | 'slapstick' | 'dark' | 'none';

  // Cultural/Regional
  dialect?: string;
  languageTics: string[];

  // Sample Passages (for AI training)
  sampleDialogue: string[];
  sampleInternalMonologue: string[];
}

export interface ArcPhase {
  id: string;
  characterId: string;
  phase: string; // e.g., "Act 1 - Orphan", "Midpoint - Wanderer"
  description: string;
  startEventId?: string;
  endEventId?: string;
  lieStrength: number; // 0-100, how strongly they believe the lie
  truthAcceptance: number; // 0-100, how much they accept the truth
}

export interface CharacterState {
  id: string;
  characterId: string;
  effectiveFrom: TimelineDate;
  effectiveTo?: TimelineDate;

  // Location & Status
  locationId?: string;
  status: 'alive' | 'dead' | 'unknown' | 'transformed';
  occupation?: string;

  // Power/Ability levels (for fantasy/sci-fi)
  powerLevel?: number;
  abilities: string[];

  // Relationships active at this time
  activeRelationshipIds: string[];

  // Any custom state properties
  customState: Record<string, unknown>;
}

// ============================================================================
// SPECIES & AGING SYSTEM
// ============================================================================

export interface Species {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  averageLifespan?: number; // In story years
  agingCurve: AgingCurvePoint[];
  maturityAge?: number;
  elderAge?: number;
}

export interface AgingCurvePoint {
  chronologicalAge: number;
  apparentAge: number;
  label?: string; // e.g., "Child", "Adolescent", "Adult", "Elder"
}

export interface SpeciesHybrid {
  id: string;
  speciesIds: string[]; // Parent species
  agingCalculation: 'average' | 'dominant' | 'custom';
  dominantSpeciesId?: string;
  customAgingCurve?: AgingCurvePoint[];
}

// ============================================================================
// RELATIONSHIP SYSTEM
// ============================================================================

export interface Relationship {
  id: string;
  projectId: string;
  character1Id: string;
  character2Id: string;
  type: RelationshipType;

  // Directional descriptions
  character1ToCharacter2?: string; // e.g., "father of"
  character2ToCharacter1?: string; // e.g., "son of"

  // Status over time
  phases: RelationshipPhase[];

  // For romantic relationships
  romanceBeats?: RomanceBeatTracking[];
}

export interface RelationshipPhase {
  id: string;
  relationshipId: string;
  startDate?: TimelineDate;
  endDate?: TimelineDate;
  intensity: number; // -100 (hatred) to 100 (love)
  status: 'forming' | 'stable' | 'strained' | 'broken' | 'reconciled';
  description?: string;
  triggerEventId?: string;
}

export interface RomanceBeatTracking {
  beat: RomanceArcBeat;
  sceneId?: string;
  eventId?: string;
  completed: boolean;
  notes?: string;
}

export interface RelationshipMap {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  asOfDate?: TimelineDate;
  characterIds: string[];
  layout: RelationshipMapLayout;
}

export interface RelationshipMapLayout {
  nodes: {
    characterId: string;
    x: number;
    y: number;
    color?: string;
  }[];
  edges: {
    relationshipId: string;
    style?: 'solid' | 'dashed' | 'dotted';
    color?: string;
  }[];
}

// ============================================================================
// TIMELINE & CALENDAR SYSTEM
// ============================================================================

export interface CalendarSystem {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  isDefault: boolean;

  // Year structure
  yearZero?: number; // Reference year for conversions
  eraName?: string; // e.g., "AD", "After Fall"
  eraNegativeName?: string; // e.g., "BC", "Before Fall"

  // Month structure
  months: CalendarMonth[];

  // Week structure
  weekdays: CalendarWeekday[];

  // Special elements
  moons?: CalendarMoon[];
  seasons?: CalendarSeason[];

  // Conversion to real-world calendar (if applicable)
  realWorldAnchor?: {
    calendarDate: string; // e.g., "1/1/1"
    realWorldDate: string; // e.g., "2024-01-01"
  };
}

export interface CalendarMonth {
  id: string;
  name: string;
  shortName?: string;
  days: number;
  order: number;
  season?: string;
}

export interface CalendarWeekday {
  id: string;
  name: string;
  shortName?: string;
  order: number;
}

export interface CalendarMoon {
  id: string;
  name: string;
  cycleLength: number; // In days
  phases: string[];
}

export interface CalendarSeason {
  id: string;
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

export interface CalendarHoliday {
  id: string;
  calendarId: string;
  name: string;
  month: number;
  day: number;
  description?: string;
  recurring: boolean;
  yearIntroduced?: number;
}

export interface TimelineDate {
  calendarId: string;
  year: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  precision: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'exact';
  isApproximate: boolean;
}

export interface Era {
  id: string;
  projectId: string;
  calendarId: string;
  name: string;
  description?: string;
  startYear: number;
  endYear?: number;
  color?: string;
}

// ============================================================================
// TIMELINE EVENTS
// ============================================================================

export interface TimelineEvent {
  id: string;
  projectId: string;
  name: string;
  description?: string;

  // Timing
  date: TimelineDate;
  endDate?: TimelineDate; // For events with duration

  // Location
  locationId?: string;

  // Participants
  participantIds: string[];

  // Causality
  causedBy: EventCausality[];
  causes: EventCausality[];

  // Linkage
  sceneIds: string[];
  plotThreadIds: string[];

  // Categorization
  eventType: 'plot' | 'character' | 'world' | 'background';
  importance: 'minor' | 'moderate' | 'major' | 'pivotal';

  // What-If branching
  branchPointId?: string;
  timelineVariant?: string; // e.g., "main", "alternate-1", "OG"

  tags: string[];
}

export interface EventCausality {
  id: string;
  fromEventId: string;
  toEventId: string;
  type: EventCausalityType;
  strength: number; // 0-100
  description?: string;
}

// ============================================================================
// MANUSCRIPT STRUCTURE
// ============================================================================

export interface Container {
  id: string;
  projectId: string;
  parentId?: string;
  type: 'book' | 'part' | 'arc' | 'chapter' | 'folder';
  title: string;
  synopsis?: string;
  sortOrder: number;

  // Status
  status: 'planning' | 'drafting' | 'revising' | 'complete';
  targetWordCount?: number;
  currentWordCount: number;

  // Metadata
  pov?: string; // POV character ID
  timeline?: string; // If non-linear narrative

  // For compilation
  includeInCompile: boolean;
  compileAs?: string; // Override title for compile
  pageBreakBefore: boolean;

  // Children (computed)
  children?: (Container | Scene)[];
}

export interface Scene {
  id: string;
  projectId: string;
  containerId: string;
  title: string;
  sortOrder: number;

  // Content
  content: string; // ProseMirror JSON or markdown
  synopsis?: string;

  // Scene-Sequel Structure (Dwight Swain)
  sceneType: SceneType;
  goal?: string;
  conflict?: string;
  disaster?: string; // For action scenes
  reaction?: string;
  dilemma?: string;
  decision?: string; // For sequel/reaction scenes

  // Metadata
  povCharacterId?: string;
  locationId?: string;
  date?: TimelineDate;

  // Characters present
  characterIds: string[];

  // Plot connections
  plotThreadIds: string[];

  // Statistics
  wordCount: number;
  targetWordCount?: number;

  // Status
  status: 'outline' | 'draft' | 'revised' | 'polished';

  // Emotion tracking
  emotionStart?: number; // -100 to 100
  emotionEnd?: number;

  // Compile settings
  includeInCompile: boolean;

  // Notes
  notes?: string;

  // Version
  lastModified: Date;
  version: number;
}

// ============================================================================
// PLOT THREAD SYSTEM
// ============================================================================

export interface PlotThread {
  id: string;
  projectId: string;
  parentThreadId?: string;
  name: string;
  description?: string;
  type: PlotThreadType;
  status: PlotThreadStatus;

  // Scope
  startSceneId?: string;
  endSceneId?: string;

  // Characters involved
  characterIds: string[];

  // Color coding for UI
  color: string;

  // Priority/importance
  importance: number; // 1-10

  // Progress
  progressPercent: number;

  // Child threads
  childThreads?: PlotThread[];
}

export interface Promise {
  id: string;
  projectId: string;
  plotThreadId?: string;

  // The promise itself
  description: string;
  promiseType: 'chekhov_gun' | 'foreshadowing' | 'setup' | 'question' | 'prophecy';

  // Status
  status: PromiseStatus;

  // Location
  plantedSceneId: string;
  fulfilledSceneId?: string;

  // Reinforcements (scenes that remind reader of the promise)
  reinforcementSceneIds: string[];

  // Reader expectation
  expectedFulfillment?: string;
  actualFulfillment?: string;

  // Deadline
  mustFulfillBy?: string; // Scene or chapter reference

  // Notes
  notes?: string;
}

// ============================================================================
// VERSION CONTROL
// ============================================================================

export interface Snapshot {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: Date;
  isAutoSave: boolean;

  // What was captured
  capturedContainerIds: string[];
  capturedSceneIds: string[];

  // Statistics at time of snapshot
  totalWordCount: number;

  // Labels
  labels: string[];
}

export interface DocumentVersion {
  id: string;
  sceneId: string;
  snapshotId?: string;

  // Content at this version
  content: string;
  wordCount: number;

  // Version info
  versionNumber: number;
  createdAt: Date;

  // Change description
  changeDescription?: string;
}

// ============================================================================
// WRITING PRODUCTIVITY
// ============================================================================

export interface WritingGoal {
  id: string;
  projectId: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'total' | 'deadline';
  targetWords: number;
  startDate: Date;
  endDate?: Date;
  currentProgress: number;
}

export interface WritingSession {
  id: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;

  // What was worked on
  sceneIds: string[];

  // Statistics
  wordsWritten: number;
  wordsDeleted: number;
  netWords: number;

  // Session type
  sessionType: 'freewrite' | 'sprint' | 'edit' | 'revision';
  sprintDuration?: number; // In minutes

  // Notes
  notes?: string;
}

export interface WritingStreak {
  projectId: string;
  currentStreak: number;
  longestStreak: number;
  lastWritingDate: Date;
  streakGoal: number; // Words per day to maintain streak
}

// ============================================================================
// COMPILE & EXPORT
// ============================================================================

export interface CompilePreset {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  format: CompileFormat;

  // Content selection
  includeContainerTypes: Container['type'][];
  excludeContainerIds: string[];
  excludeSceneIds: string[];

  // Front/back matter
  includeTitlePage: boolean;
  titlePageTemplate?: string;
  includeTableOfContents: boolean;
  includeCopyright: boolean;
  copyrightText?: string;

  // Formatting
  formatting: CompileFormatting;

  // Separators
  chapterSeparator?: string;
  sceneSeparator?: string;

  // Output
  outputPath?: string;
  filenameTemplate: string; // e.g., "{project}_{date}_{format}"
}

export interface CompileFormatting {
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  paragraphSpacing: number;
  firstLineIndent: number;
  pageSize: 'letter' | 'a4' | 'a5' | '6x9' | 'custom';
  customPageWidth?: number;
  customPageHeight?: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  headerTemplate?: string;
  footerTemplate?: string;
}

// ============================================================================
// WORLDBUILDING
// ============================================================================

export interface Location extends StoryElement {
  type: StoryElementType.LOCATION;
  parentLocationId?: string;
  locationType: 'planet' | 'continent' | 'country' | 'region' | 'city' | 'building' | 'room' | 'other';

  // Coordinates (if using maps)
  coordinates?: {
    mapId: string;
    x: number;
    y: number;
    z?: number;
  };

  // Description
  climate?: string;
  terrain?: string;
  population?: number;
  government?: string;

  // Sensory details
  sights: string[];
  sounds: string[];
  smells: string[];

  // History
  foundedDate?: TimelineDate;
  destroyedDate?: TimelineDate;

  // Children
  childLocations?: Location[];
}

export interface InteractiveMap {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  width: number;
  height: number;

  // Layers
  layers: MapLayer[];

  // Points of interest
  markers: MapMarker[];
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  type: 'base' | 'overlay' | 'markers';
  imageUrl?: string;
}

export interface MapMarker {
  id: string;
  mapId: string;
  locationId?: string;
  eventId?: string;
  x: number;
  y: number;
  icon?: string;
  label?: string;
  description?: string;
  visibleInTimeRange?: {
    start?: TimelineDate;
    end?: TimelineDate;
  };
}

// ============================================================================
// AI & EMBEDDINGS
// ============================================================================

export interface Embedding {
  id: string;
  projectId: string;
  entityType: 'scene' | 'character' | 'location' | 'event' | 'note';
  entityId: string;

  // The text that was embedded
  chunkText: string;
  chunkIndex: number;

  // The embedding vector
  vector: number[];

  // Model info
  model: string;
  dimensions: number;

  // Timestamps
  createdAt: Date;
}

export interface ConsistencyFact {
  id: string;
  projectId: string;

  // The fact
  fact: string;
  category: 'character' | 'world' | 'plot' | 'timeline' | 'rule';

  // Source
  sourceSceneId?: string;
  sourceChapter?: string;

  // Importance
  importance: 'critical' | 'important' | 'minor';

  // For contradiction detection
  relatedEntityIds: string[];

  // Status
  verified: boolean;

  // Timestamps
  establishedAt: Date;
  lastVerified?: Date;
}

export interface EntityState {
  id: string;
  projectId: string;
  entityType: string;
  entityId: string;

  // When this state is valid
  effectiveFrom: TimelineDate;
  effectiveTo?: TimelineDate;

  // The state itself (flexible JSON)
  stateData: Record<string, unknown>;

  // What caused this state change
  triggerEventId?: string;
  triggerSceneId?: string;
}

// ============================================================================
// TEMPLATES
// ============================================================================

export interface Template {
  id: string;
  projectId?: string; // null for global templates
  name: string;
  description?: string;
  category: 'scene' | 'character' | 'chapter' | 'beat_sheet' | 'custom';

  // Template content
  content: string;

  // Fields to fill
  fields: TemplateField[];

  // Is this a system template?
  isSystem: boolean;
}

export interface TemplateField {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'reference';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  options?: string[]; // For select/multiselect
  referenceType?: string; // For reference type (e.g., 'character', 'location')
}

// ============================================================================
// WHAT-IF BRANCHING
// ============================================================================

export interface BranchPoint {
  id: string;
  projectId: string;
  name: string;
  description?: string;

  // The decision point
  triggerEventId?: string;
  triggerSceneId?: string;

  // When this branch occurs
  branchDate: TimelineDate;

  // The original timeline
  baselineVariant: string;

  // Alternatives
  alternatives: BranchAlternative[];
}

export interface BranchAlternative {
  id: string;
  branchPointId: string;
  variantName: string;
  description?: string;

  // What's different
  divergenceDescription: string;

  // Modified events
  modifiedEventIds: string[];
  addedEventIds: string[];
  removedEventIds: string[];

  // Is this the "canon" version?
  isCanon: boolean;

  // Exploration status
  explorationStatus: 'planned' | 'outlined' | 'drafted' | 'complete';
}

// ============================================================================
// EMOTION & SENTIMENT TRACKING
// ============================================================================

export interface SceneSentiment {
  sceneId: string;

  // Overall sentiment
  sentimentScore: number; // -100 to 100

  // Specific emotions detected
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };

  // Tension level
  tensionLevel: number; // 0-100

  // Pacing
  pacing: 'slow' | 'medium' | 'fast';

  // Calculated or manual
  isAutoCalculated: boolean;
  lastCalculated?: Date;
}

export interface ArcPattern {
  id: string;
  projectId: string;
  name: string;
  pattern: EmotionArcPattern;

  // Scope
  startContainerId?: string;
  endContainerId?: string;

  // Expected shape
  expectedCurve: {x: number; y: number}[];

  // Actual curve (from scene sentiments)
  actualCurve?: {x: number; y: number}[];

  // Deviation analysis
  deviationScore?: number;
}

// ============================================================================
// SEARCH & RETRIEVAL
// ============================================================================

export interface SearchResult {
  entityType: string;
  entityId: string;
  title: string;
  snippet: string;
  score: number;
  highlights: {field: string; matches: string[]}[];
}

export interface StoryBibleQuery {
  query: string;
  context?: {
    currentSceneId?: string;
    currentChapterId?: string;
    characterIds?: string[];
    locationIds?: string[];
    date?: TimelineDate;
  };
  filters?: {
    entityTypes?: string[];
    dateRange?: {start?: TimelineDate; end?: TimelineDate};
    tags?: string[];
  };
  limit?: number;
}

export interface StoryBibleResult {
  query: string;
  results: SearchResult[];
  relatedFacts: ConsistencyFact[];
  timelineContext?: TimelineEvent[];
  characterStates?: CharacterState[];
}

// ============================================================================
// IMPORT/EXPORT
// ============================================================================

export interface ImportResult {
  success: boolean;
  projectId?: string;
  importedCounts: {
    scenes: number;
    characters: number;
    locations: number;
    events: number;
    notes: number;
  };
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  format: 'efa_native' | 'scrivener' | 'obsidian' | 'markdown_folder' | 'json';
  includeEmbeddings: boolean;
  includeVersionHistory: boolean;
  includeStatistics: boolean;
  encryptionPassword?: string;
}

// ============================================================================
// APPLICATION STATE
// ============================================================================

export interface AppState {
  currentProjectId?: string;
  openSceneIds: string[];
  activeSceneId?: string;
  sidebarWidth: number;
  editorSettings: EditorSettings;
  recentProjects: {id: string; name: string; lastOpened: Date}[];
}

export interface EditorSettings {
  showWordCount: boolean;
  showTargetProgress: boolean;
  typewriterMode: boolean;
  focusMode: boolean;
  spellCheck: boolean;
  grammarCheck: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}
