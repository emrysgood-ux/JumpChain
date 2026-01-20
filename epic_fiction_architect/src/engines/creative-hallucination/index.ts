/**
 * Creative Hallucination Engine
 *
 * Harnesses AI's tendency to generate plausible content as a creative feature.
 * In fiction, "hallucination" IS the goal - creating believable invented content.
 *
 * This system provides:
 * - Controlled divergence for generating variations
 * - Dream logic for surreal/non-linear content
 * - Unreliable narrator support with truth layers
 * - World extrapolation from seed details
 * - Creative prompt templates
 * - Canon grounding to maintain consistency
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

export enum HallucinationType {
  // World-building
  EXTRAPOLATE_WORLD = 'extrapolate_world',       // Extend world details from seeds
  INVENT_HISTORY = 'invent_history',             // Create plausible history
  GENERATE_CULTURE = 'generate_culture',         // Invent cultural details
  FABRICATE_LORE = 'fabricate_lore',             // Create mythology/legends

  // Character
  IMAGINE_BACKSTORY = 'imagine_backstory',       // Generate character history
  EXTRAPOLATE_MOTIVATION = 'extrapolate_motivation', // Derive hidden motives
  INVENT_RELATIONSHIPS = 'invent_relationships', // Create connection history
  GENERATE_VOICE = 'generate_voice',             // Develop unique voice patterns

  // Plot
  DIVERGE_TIMELINE = 'diverge_timeline',         // "What if" scenarios
  GENERATE_COMPLICATIONS = 'generate_complications', // Invent obstacles
  EXTRAPOLATE_CONSEQUENCES = 'extrapolate_consequences', // Ripple effects
  INVENT_SUBPLOTS = 'invent_subplots',           // Create side stories

  // Narrative
  DREAM_LOGIC = 'dream_logic',                   // Surreal sequences
  UNRELIABLE_PERSPECTIVE = 'unreliable_perspective', // Distorted POV
  MEMORY_FRAGMENT = 'memory_fragment',           // Incomplete/altered memories
  PROPHETIC_VISION = 'prophetic_vision',         // Symbolic future glimpses

  // Creative
  RANDOM_DETAIL = 'random_detail',               // Unexpected specifics
  SENSORY_INVENTION = 'sensory_invention',       // Imagined sensations
  METAPHOR_GENERATION = 'metaphor_generation',   // Creative comparisons
  DIALOGUE_RIFF = 'dialogue_riff'                // Improvisational exchanges
}

export enum TruthLayer {
  OBJECTIVE_REALITY = 'objective_reality',       // What actually happened
  NARRATOR_BELIEF = 'narrator_belief',           // What narrator thinks happened
  CHARACTER_PERCEPTION = 'character_perception', // What character perceives
  PUBLIC_KNOWLEDGE = 'public_knowledge',         // What's commonly known
  HIDDEN_TRUTH = 'hidden_truth',                 // Secret reality
  DELIBERATE_LIE = 'deliberate_lie',             // Intentional falsehood
  DREAM_REALITY = 'dream_reality',               // Dream-state truth
  PROPHECY_SHADOW = 'prophecy_shadow',           // Possible future
  MYTH_VERSION = 'myth_version'                  // Legendary/mythologized version
}

export enum DivergenceStrength {
  MINIMAL = 'minimal',       // Small variations
  MODERATE = 'moderate',     // Noticeable changes
  SIGNIFICANT = 'significant', // Major alterations
  RADICAL = 'radical',       // Completely different
  SURREAL = 'surreal'        // Logic-defying
}

export enum GroundingLevel {
  STRICT = 'strict',         // Must match all canon
  FLEXIBLE = 'flexible',     // Can bend minor details
  LOOSE = 'loose',           // Just major elements
  NONE = 'none'              // Complete freedom
}

export enum DreamLogicType {
  TRANSFORMATION = 'transformation',   // Things become other things
  COMPRESSION = 'compression',         // Time/space collapse
  SYMBOLIC = 'symbolic',               // Metaphors become literal
  RECURSIVE = 'recursive',             // Loops and repetition
  ASSOCIATIVE = 'associative',         // Non-linear connections
  FRAGMENTED = 'fragmented'            // Broken/incomplete
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface HallucinationSeed {
  id: string;
  type: HallucinationType;
  inputPrompt: string;
  constraints: string[];
  grounding: GroundingLevel;
  divergenceStrength: DivergenceStrength;
  canonAnchors: CanonAnchor[];
  createdAt: Date;
}

export interface CanonAnchor {
  id: string;
  category: 'character' | 'world' | 'plot' | 'theme' | 'rule';
  element: string;
  description: string;
  isInviolable: boolean;  // Can never be contradicted
  flexibility: string;    // How it can be bent
}

export interface GeneratedContent {
  id: string;
  seedId: string;
  type: HallucinationType;
  content: string;
  truthLayer: TruthLayer;
  confidence: number;        // 0-1 how "plausible"
  novelty: number;           // 0-1 how unexpected
  canonCompliance: number;   // 0-1 how well it fits
  tags: string[];
  usedInChapters: number[];
  isAccepted: boolean;       // Writer approved
  variations: string[];      // Alternative versions
  createdAt: Date;
}

export interface TruthRecord {
  id: string;
  subject: string;
  versions: TruthVersion[];
  activeLayer: TruthLayer;
  revealedIn?: number;       // Chapter where truth revealed
  notes: string;
}

export interface TruthVersion {
  layer: TruthLayer;
  content: string;
  believers: string[];       // Character IDs who believe this
  evidence: string[];        // What supports this version
  contradictions: string[];  // What conflicts with it
}

export interface UnreliableNarrator {
  id: string;
  characterId: string;
  name: string;
  biases: NarratorBias[];
  blindSpots: string[];
  lies: NarratorLie[];
  distortions: PerceptionDistortion[];
  reliability: number;       // 0-1 overall reliability
  chapterRange: { start: number; end?: number };
}

export interface NarratorBias {
  type: 'emotional' | 'ideological' | 'self-serving' | 'protective' | 'cultural';
  description: string;
  affects: string[];         // What topics it distorts
  strength: number;          // 0-1
}

export interface NarratorLie {
  id: string;
  truthRecordId: string;
  statedVersion: string;
  motivation: string;
  audience: 'reader' | 'self' | 'both';
  discoveredIn?: number;
}

export interface PerceptionDistortion {
  type: 'memory' | 'sensory' | 'emotional' | 'temporal' | 'identity';
  description: string;
  trigger?: string;
  chapters: number[];
}

export interface DreamSequence {
  id: string;
  characterId: string;
  chapter: number;
  logicType: DreamLogicType;
  symbols: DreamSymbol[];
  transformations: Transformation[];
  hiddenMeanings: string[];
  surfaceNarrative: string;
  deepInterpretation: string;
  foreshadows: string[];
  processesMaterial: string[];  // What real events it processes
}

export interface DreamSymbol {
  symbol: string;
  represents: string;
  emotionalValence: number;  // -1 to 1
  recurringAcross: number[]; // Chapter appearances
}

export interface Transformation {
  from: string;
  to: string;
  trigger: string;
  meaning: string;
}

export interface ExtrapolationRequest {
  id: string;
  type: HallucinationType;
  seedElements: string[];
  direction: string;         // What to extrapolate toward
  constraints: string[];
  mustInclude: string[];
  mustExclude: string[];
  styleGuidance: string;
  targetLength: 'brief' | 'moderate' | 'detailed' | 'extensive';
}

export interface WorldExtrapolation {
  id: string;
  domain: 'geography' | 'history' | 'culture' | 'technology' | 'magic' | 'biology' | 'politics' | 'economics' | 'religion';
  seedFacts: string[];
  generatedDetails: GeneratedDetail[];
  internalConsistency: number;
  integrationNotes: string;
}

export interface GeneratedDetail {
  id: string;
  content: string;
  derivedFrom: string[];     // Which seeds it extends
  implications: string[];    // What else this suggests
  confidence: number;
  accepted: boolean;
}

export interface CreativePrompt {
  id: string;
  name: string;
  type: HallucinationType;
  template: string;
  variables: PromptVariable[];
  examples: string[];
  guidance: string;
  outputFormat: string;
}

export interface PromptVariable {
  name: string;
  description: string;
  type: 'string' | 'list' | 'choice' | 'number';
  options?: string[];
  default?: string;
}

export interface DivergencePoint {
  id: string;
  chapter: number;
  originalEvent: string;
  divergenceQuestion: string;  // "What if..."
  branches: DivergenceBranch[];
  selectedBranch?: string;
  explorationNotes: string;
}

export interface DivergenceBranch {
  id: string;
  description: string;
  immediateConsequences: string[];
  longTermEffects: string[];
  characterImpacts: Map<string, string>;
  thematicImplications: string[];
  plausibility: number;
  narrativeInterest: number;
}

// ============================================================================
// CREATIVE HALLUCINATION ENGINE CLASS
// ============================================================================

export class CreativeHallucinationEngine {
  private seeds: Map<string, HallucinationSeed> = new Map();
  private generatedContent: Map<string, GeneratedContent> = new Map();
  private truthRecords: Map<string, TruthRecord> = new Map();
  private unreliableNarrators: Map<string, UnreliableNarrator> = new Map();
  private dreamSequences: Map<string, DreamSequence> = new Map();
  private worldExtrapolations: Map<string, WorldExtrapolation> = new Map();
  private prompts: Map<string, CreativePrompt> = new Map();
  private divergencePoints: Map<string, DivergencePoint> = new Map();
  private canonAnchors: Map<string, CanonAnchor> = new Map();

  // Indexes
  private contentBySeedIndex: Map<string, string[]> = new Map();
  private truthBySubjectIndex: Map<string, string[]> = new Map();
  private dreamsByCharacterIndex: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDefaultPrompts();
  }

  // ============================================================================
  // SEED MANAGEMENT
  // ============================================================================

  createSeed(info: Omit<HallucinationSeed, 'id' | 'createdAt'>): HallucinationSeed {
    const seed: HallucinationSeed = {
      ...info,
      id: uuidv4(),
      createdAt: new Date()
    };

    this.seeds.set(seed.id, seed);
    this.contentBySeedIndex.set(seed.id, []);

    // Register canon anchors
    for (const anchor of seed.canonAnchors) {
      this.canonAnchors.set(anchor.id, anchor);
    }

    return seed;
  }

  getSeed(seedId: string): HallucinationSeed | undefined {
    return this.seeds.get(seedId);
  }

  // ============================================================================
  // CANON ANCHOR MANAGEMENT
  // ============================================================================

  addCanonAnchor(anchor: Omit<CanonAnchor, 'id'>): CanonAnchor {
    const full: CanonAnchor = {
      ...anchor,
      id: uuidv4()
    };

    this.canonAnchors.set(full.id, full);
    return full;
  }

  getInviolableAnchors(): CanonAnchor[] {
    return Array.from(this.canonAnchors.values())
      .filter(a => a.isInviolable);
  }

  checkCanonCompliance(content: string, anchors: CanonAnchor[]): {
    compliant: boolean;
    violations: string[];
    score: number;
  } {
    const violations: string[] = [];

    for (const anchor of anchors) {
      if (anchor.isInviolable) {
        // Simple check - in real implementation, use semantic analysis
        const lowerContent = content.toLowerCase();
        const lowerElement = anchor.element.toLowerCase();

        // Check for direct contradictions (simplified)
        if (lowerContent.includes(`not ${lowerElement}`) ||
            lowerContent.includes(`no ${lowerElement}`)) {
          violations.push(`Violates inviolable anchor: ${anchor.element}`);
        }
      }
    }

    const score = violations.length === 0 ? 1.0 :
                  Math.max(0, 1 - (violations.length * 0.2));

    return {
      compliant: violations.length === 0,
      violations,
      score
    };
  }

  // ============================================================================
  // GENERATED CONTENT MANAGEMENT
  // ============================================================================

  recordGeneration(info: Omit<GeneratedContent, 'id' | 'createdAt'>): GeneratedContent {
    const content: GeneratedContent = {
      ...info,
      id: uuidv4(),
      createdAt: new Date()
    };

    this.generatedContent.set(content.id, content);

    // Update index
    const seedContent = this.contentBySeedIndex.get(info.seedId) || [];
    seedContent.push(content.id);
    this.contentBySeedIndex.set(info.seedId, seedContent);

    return content;
  }

  acceptGeneration(contentId: string): void {
    const content = this.generatedContent.get(contentId);
    if (content) {
      content.isAccepted = true;
      this.generatedContent.set(contentId, content);
    }
  }

  addVariation(contentId: string, variation: string): void {
    const content = this.generatedContent.get(contentId);
    if (content) {
      content.variations.push(variation);
      this.generatedContent.set(contentId, content);
    }
  }

  getAcceptedContent(): GeneratedContent[] {
    return Array.from(this.generatedContent.values())
      .filter(c => c.isAccepted);
  }

  getContentBySeed(seedId: string): GeneratedContent[] {
    const ids = this.contentBySeedIndex.get(seedId) || [];
    return ids
      .map(id => this.generatedContent.get(id))
      .filter((c): c is GeneratedContent => c !== undefined);
  }

  // ============================================================================
  // TRUTH LAYER MANAGEMENT
  // ============================================================================

  createTruthRecord(subject: string, initialVersion: TruthVersion): TruthRecord {
    const record: TruthRecord = {
      id: uuidv4(),
      subject,
      versions: [initialVersion],
      activeLayer: initialVersion.layer,
      notes: ''
    };

    this.truthRecords.set(record.id, record);

    // Update index
    const subjectRecords = this.truthBySubjectIndex.get(subject) || [];
    subjectRecords.push(record.id);
    this.truthBySubjectIndex.set(subject, subjectRecords);

    return record;
  }

  addTruthVersion(recordId: string, version: TruthVersion): void {
    const record = this.truthRecords.get(recordId);
    if (record) {
      record.versions.push(version);
      this.truthRecords.set(recordId, record);
    }
  }

  setActiveLayer(recordId: string, layer: TruthLayer): void {
    const record = this.truthRecords.get(recordId);
    if (record) {
      record.activeLayer = layer;
      this.truthRecords.set(recordId, record);
    }
  }

  revealTruth(recordId: string, chapter: number, newLayer: TruthLayer): void {
    const record = this.truthRecords.get(recordId);
    if (record) {
      record.revealedIn = chapter;
      record.activeLayer = newLayer;
      this.truthRecords.set(recordId, record);
    }
  }

  getTruthForLayer(recordId: string, layer: TruthLayer): TruthVersion | undefined {
    const record = this.truthRecords.get(recordId);
    return record?.versions.find(v => v.layer === layer);
  }

  getConflictingTruths(recordId: string): Array<{
    layer1: TruthLayer;
    layer2: TruthLayer;
    conflict: string;
  }> {
    const record = this.truthRecords.get(recordId);
    if (!record) return [];

    const conflicts: Array<{
      layer1: TruthLayer;
      layer2: TruthLayer;
      conflict: string;
    }> = [];

    for (let i = 0; i < record.versions.length; i++) {
      for (let j = i + 1; j < record.versions.length; j++) {
        const v1 = record.versions[i];
        const v2 = record.versions[j];

        // Check for contradictions
        for (const contradiction of v1.contradictions) {
          if (v2.content.toLowerCase().includes(contradiction.toLowerCase())) {
            conflicts.push({
              layer1: v1.layer,
              layer2: v2.layer,
              conflict: contradiction
            });
          }
        }
      }
    }

    return conflicts;
  }

  // ============================================================================
  // UNRELIABLE NARRATOR MANAGEMENT
  // ============================================================================

  createUnreliableNarrator(info: Omit<UnreliableNarrator, 'id'>): UnreliableNarrator {
    const narrator: UnreliableNarrator = {
      ...info,
      id: uuidv4()
    };

    this.unreliableNarrators.set(narrator.id, narrator);
    return narrator;
  }

  addNarratorBias(narratorId: string, bias: NarratorBias): void {
    const narrator = this.unreliableNarrators.get(narratorId);
    if (narrator) {
      narrator.biases.push(bias);
      // Recalculate reliability
      narrator.reliability = this.calculateReliability(narrator);
      this.unreliableNarrators.set(narratorId, narrator);
    }
  }

  addNarratorLie(narratorId: string, lie: Omit<NarratorLie, 'id'>): NarratorLie {
    const narrator = this.unreliableNarrators.get(narratorId);
    if (!narrator) throw new Error('Narrator not found');

    const fullLie: NarratorLie = {
      ...lie,
      id: uuidv4()
    };

    narrator.lies.push(fullLie);
    narrator.reliability = this.calculateReliability(narrator);
    this.unreliableNarrators.set(narratorId, narrator);

    return fullLie;
  }

  addPerceptionDistortion(narratorId: string, distortion: PerceptionDistortion): void {
    const narrator = this.unreliableNarrators.get(narratorId);
    if (narrator) {
      narrator.distortions.push(distortion);
      narrator.reliability = this.calculateReliability(narrator);
      this.unreliableNarrators.set(narratorId, narrator);
    }
  }

  private calculateReliability(narrator: UnreliableNarrator): number {
    let reliability = 1.0;

    // Reduce for biases
    for (const bias of narrator.biases) {
      reliability -= bias.strength * 0.1;
    }

    // Reduce for lies
    reliability -= narrator.lies.length * 0.1;

    // Reduce for distortions
    reliability -= narrator.distortions.length * 0.05;

    // Reduce for blind spots
    reliability -= narrator.blindSpots.length * 0.05;

    return Math.max(0, Math.min(1, reliability));
  }

  getNarratorDistortionForChapter(narratorId: string, chapter: number): {
    biases: NarratorBias[];
    activeLies: NarratorLie[];
    distortions: PerceptionDistortion[];
  } {
    const narrator = this.unreliableNarrators.get(narratorId);
    if (!narrator) {
      return { biases: [], activeLies: [], distortions: [] };
    }

    // Check if narrator is active in this chapter
    if (chapter < narrator.chapterRange.start ||
        (narrator.chapterRange.end && chapter > narrator.chapterRange.end)) {
      return { biases: [], activeLies: [], distortions: [] };
    }

    return {
      biases: narrator.biases,
      activeLies: narrator.lies.filter(l => !l.discoveredIn || l.discoveredIn > chapter),
      distortions: narrator.distortions.filter(d => d.chapters.includes(chapter))
    };
  }

  // ============================================================================
  // DREAM SEQUENCE MANAGEMENT
  // ============================================================================

  createDreamSequence(info: Omit<DreamSequence, 'id'>): DreamSequence {
    const dream: DreamSequence = {
      ...info,
      id: uuidv4()
    };

    this.dreamSequences.set(dream.id, dream);

    // Update index
    const charDreams = this.dreamsByCharacterIndex.get(info.characterId) || [];
    charDreams.push(dream.id);
    this.dreamsByCharacterIndex.set(info.characterId, charDreams);

    return dream;
  }

  addDreamSymbol(dreamId: string, symbol: DreamSymbol): void {
    const dream = this.dreamSequences.get(dreamId);
    if (dream) {
      dream.symbols.push(symbol);
      this.dreamSequences.set(dreamId, dream);
    }
  }

  addTransformation(dreamId: string, transformation: Transformation): void {
    const dream = this.dreamSequences.get(dreamId);
    if (dream) {
      dream.transformations.push(transformation);
      this.dreamSequences.set(dreamId, dream);
    }
  }

  getRecurringSymbols(characterId: string): Map<string, DreamSymbol[]> {
    const dreamIds = this.dreamsByCharacterIndex.get(characterId) || [];
    const symbolMap = new Map<string, DreamSymbol[]>();

    for (const dreamId of dreamIds) {
      const dream = this.dreamSequences.get(dreamId);
      if (!dream) continue;

      for (const symbol of dream.symbols) {
        const existing = symbolMap.get(symbol.symbol) || [];
        existing.push(symbol);
        symbolMap.set(symbol.symbol, existing);
      }
    }

    // Filter to only recurring (2+ appearances)
    const recurring = new Map<string, DreamSymbol[]>();
    for (const [symbol, instances] of symbolMap) {
      if (instances.length >= 2) {
        recurring.set(symbol, instances);
      }
    }

    return recurring;
  }

  generateDreamLogicTransitions(logicType: DreamLogicType): string[] {
    const transitions: Record<DreamLogicType, string[]> = {
      [DreamLogicType.TRANSFORMATION]: [
        'The face shifted, becoming someone else entirely',
        'The walls breathed, then became water',
        'Their words turned into butterflies mid-sentence',
        'The path underfoot transformed to glass, to sand, to memory'
      ],
      [DreamLogicType.COMPRESSION]: [
        'Years passed in the space between heartbeats',
        'The hallway stretched into miles, then collapsed to a single door',
        'They spoke for hours but no time had passed',
        'The city existed in a single room'
      ],
      [DreamLogicType.SYMBOLIC]: [
        'The weight of their guilt became an actual stone',
        'Their fear took shape and watched them',
        'The lies they told grew into a forest around them',
        'Their hope manifested as a small flame they carried'
      ],
      [DreamLogicType.RECURSIVE]: [
        'They found themselves at the beginning again',
        'The conversation repeated with subtle changes each time',
        'Every door led back to the same room',
        'They watched themselves from across the room, watching themselves'
      ],
      [DreamLogicType.ASSOCIATIVE]: [
        'The smell of rain reminded them of a face, which became the rain',
        'One word led to another led to a place led to a feeling',
        'The color blue was also the sound of their name',
        'Memory connected to memory with no regard for time'
      ],
      [DreamLogicType.FRAGMENTED]: [
        'Parts of the scene were missing, simply not there',
        'They could only see pieces, the rest was void',
        'The narrative jumped without connection',
        'Some things existed only partially'
      ]
    };

    return transitions[logicType] || [];
  }

  // ============================================================================
  // WORLD EXTRAPOLATION
  // ============================================================================

  createWorldExtrapolation(info: Omit<WorldExtrapolation, 'id'>): WorldExtrapolation {
    const extrapolation: WorldExtrapolation = {
      ...info,
      id: uuidv4()
    };

    this.worldExtrapolations.set(extrapolation.id, extrapolation);
    return extrapolation;
  }

  addGeneratedDetail(
    extrapolationId: string,
    detail: Omit<GeneratedDetail, 'id'>
  ): GeneratedDetail {
    const extrapolation = this.worldExtrapolations.get(extrapolationId);
    if (!extrapolation) throw new Error('Extrapolation not found');

    const fullDetail: GeneratedDetail = {
      ...detail,
      id: uuidv4()
    };

    extrapolation.generatedDetails.push(fullDetail);

    // Recalculate consistency
    extrapolation.internalConsistency = this.calculateConsistency(extrapolation);

    this.worldExtrapolations.set(extrapolationId, extrapolation);
    return fullDetail;
  }

  private calculateConsistency(extrapolation: WorldExtrapolation): number {
    if (extrapolation.generatedDetails.length < 2) return 1.0;

    // Simple consistency check - in practice, would use more sophisticated analysis
    const accepted = extrapolation.generatedDetails.filter(d => d.accepted);
    const avgConfidence = accepted.length > 0
      ? accepted.reduce((sum, d) => sum + d.confidence, 0) / accepted.length
      : 0.5;

    return avgConfidence;
  }

  generateExtrapolationPrompt(request: ExtrapolationRequest): string {
    let prompt = `Generate ${request.targetLength} content for ${request.type}.\n\n`;

    prompt += `SEED ELEMENTS:\n`;
    for (const seed of request.seedElements) {
      prompt += `- ${seed}\n`;
    }

    prompt += `\nDIRECTION: ${request.direction}\n`;

    if (request.constraints.length > 0) {
      prompt += `\nCONSTRAINTS:\n`;
      for (const constraint of request.constraints) {
        prompt += `- ${constraint}\n`;
      }
    }

    if (request.mustInclude.length > 0) {
      prompt += `\nMUST INCLUDE:\n`;
      for (const include of request.mustInclude) {
        prompt += `- ${include}\n`;
      }
    }

    if (request.mustExclude.length > 0) {
      prompt += `\nMUST EXCLUDE:\n`;
      for (const exclude of request.mustExclude) {
        prompt += `- ${exclude}\n`;
      }
    }

    if (request.styleGuidance) {
      prompt += `\nSTYLE: ${request.styleGuidance}\n`;
    }

    return prompt;
  }

  // ============================================================================
  // DIVERGENCE MANAGEMENT
  // ============================================================================

  createDivergencePoint(info: Omit<DivergencePoint, 'id'>): DivergencePoint {
    const point: DivergencePoint = {
      ...info,
      id: uuidv4()
    };

    this.divergencePoints.set(point.id, point);
    return point;
  }

  addDivergenceBranch(
    pointId: string,
    branch: Omit<DivergenceBranch, 'id'>
  ): DivergenceBranch {
    const point = this.divergencePoints.get(pointId);
    if (!point) throw new Error('Divergence point not found');

    const fullBranch: DivergenceBranch = {
      ...branch,
      id: uuidv4()
    };

    point.branches.push(fullBranch);
    this.divergencePoints.set(pointId, point);
    return fullBranch;
  }

  selectBranch(pointId: string, branchId: string): void {
    const point = this.divergencePoints.get(pointId);
    if (point) {
      point.selectedBranch = branchId;
      this.divergencePoints.set(pointId, point);
    }
  }

  generateWhatIfScenarios(event: string, count: number = 5): string[] {
    const templates = [
      `What if ${event} had happened differently?`,
      `What if ${event} never occurred?`,
      `What if ${event} happened earlier?`,
      `What if ${event} happened to someone else?`,
      `What if the opposite of ${event} happened?`,
      `What if ${event} had witnesses?`,
      `What if ${event} was discovered later?`,
      `What if ${event} was prevented?`,
      `What if ${event} had unintended consequences?`,
      `What if ${event} was orchestrated?`
    ];

    return templates.slice(0, count);
  }

  // ============================================================================
  // PROMPT TEMPLATES
  // ============================================================================

  private initializeDefaultPrompts(): void {
    const defaultPrompts: Omit<CreativePrompt, 'id'>[] = [
      {
        name: 'Character Backstory Generator',
        type: HallucinationType.IMAGINE_BACKSTORY,
        template: `Create a backstory for {characterName} that explains {traitToExplain}.
Consider their {context} and ensure it connects to {plotRelevance}.
The backstory should feel {tone} and include {specificity} sensory details.`,
        variables: [
          { name: 'characterName', description: 'Character name', type: 'string' },
          { name: 'traitToExplain', description: 'Trait or behavior to justify', type: 'string' },
          { name: 'context', description: 'World/setting context', type: 'string' },
          { name: 'plotRelevance', description: 'How it connects to plot', type: 'string' },
          { name: 'tone', description: 'Emotional tone', type: 'choice', options: ['tragic', 'hopeful', 'mysterious', 'mundane'] },
          { name: 'specificity', description: 'Detail level', type: 'choice', options: ['sparse', 'moderate', 'rich'] }
        ],
        examples: [
          'Create a backstory for Marcus that explains his fear of water. Consider his military background and ensure it connects to the underwater temple discovery. The backstory should feel tragic and include rich sensory details.'
        ],
        guidance: 'Focus on formative experiences. Include at least one specific memory with sensory detail.',
        outputFormat: 'Narrative prose, 200-500 words'
      },
      {
        name: 'World Detail Extrapolator',
        type: HallucinationType.EXTRAPOLATE_WORLD,
        template: `Given these world facts: {seedFacts}
Generate {count} additional details about {aspect}.
Maintain consistency with the established {tone} and {techLevel}.
Each detail should have implications for {narrativeUse}.`,
        variables: [
          { name: 'seedFacts', description: 'Known world facts', type: 'list' },
          { name: 'count', description: 'Number of details', type: 'number' },
          { name: 'aspect', description: 'World aspect to expand', type: 'string' },
          { name: 'tone', description: 'World tone', type: 'string' },
          { name: 'techLevel', description: 'Technology level', type: 'string' },
          { name: 'narrativeUse', description: 'How details serve story', type: 'string' }
        ],
        examples: [],
        guidance: 'Each detail should feel like a natural extension of the seeds. Include implications.',
        outputFormat: 'Numbered list with detail and implication for each'
      },
      {
        name: 'Dream Sequence Creator',
        type: HallucinationType.DREAM_LOGIC,
        template: `Create a dream sequence for {characterName} processing {emotionalMaterial}.
Use {dreamLogicType} dream logic.
Include symbols for: {symbols}
The dream should foreshadow: {foreshadowing}
Surface narrative: {surfaceAction}`,
        variables: [
          { name: 'characterName', description: 'Dreamer', type: 'string' },
          { name: 'emotionalMaterial', description: 'What they are processing', type: 'string' },
          { name: 'dreamLogicType', description: 'Type of dream logic', type: 'choice', options: ['transformation', 'compression', 'symbolic', 'recursive', 'associative', 'fragmented'] },
          { name: 'symbols', description: 'Symbols to include', type: 'list' },
          { name: 'foreshadowing', description: 'What to foreshadow', type: 'string' },
          { name: 'surfaceAction', description: 'What literally happens', type: 'string' }
        ],
        examples: [],
        guidance: 'Balance surreal imagery with emotional truth. The dream should make psychological sense even if not logical sense.',
        outputFormat: 'Narrative prose with italics for transformations'
      },
      {
        name: 'Unreliable Narration Layer',
        type: HallucinationType.UNRELIABLE_PERSPECTIVE,
        template: `Rewrite this scene from {narratorName}'s perspective.
Their biases: {biases}
What they missed or misinterpreted: {blindSpots}
What they are lying about (to reader or self): {lies}
Original objective version: {objectiveScene}`,
        variables: [
          { name: 'narratorName', description: 'Unreliable narrator', type: 'string' },
          { name: 'biases', description: 'Their biases', type: 'list' },
          { name: 'blindSpots', description: 'What they miss', type: 'list' },
          { name: 'lies', description: 'What they misrepresent', type: 'list' },
          { name: 'objectiveScene', description: 'What actually happened', type: 'string' }
        ],
        examples: [],
        guidance: 'The distortion should be subtle enough to be believed on first read, with clues for rereading.',
        outputFormat: 'Narrative prose matching original length'
      },
      {
        name: 'Consequence Extrapolator',
        type: HallucinationType.EXTRAPOLATE_CONSEQUENCES,
        template: `Event: {event}
Generate {timeframe} consequences across these domains:
- Personal (for {affectedCharacters})
- Social (for {community})
- Systemic (for {systems})
Consider both obvious and non-obvious ripple effects.`,
        variables: [
          { name: 'event', description: 'Triggering event', type: 'string' },
          { name: 'timeframe', description: 'Consequence timeframe', type: 'choice', options: ['immediate', 'short-term', 'long-term', 'generational'] },
          { name: 'affectedCharacters', description: 'Characters affected', type: 'list' },
          { name: 'community', description: 'Social groups affected', type: 'string' },
          { name: 'systems', description: 'Systems affected', type: 'list' }
        ],
        examples: [],
        guidance: 'Include at least one unexpected consequence that creates new story opportunities.',
        outputFormat: 'Structured list by domain with connections noted'
      }
    ];

    for (const prompt of defaultPrompts) {
      const full: CreativePrompt = {
        ...prompt,
        id: uuidv4()
      };
      this.prompts.set(full.id, full);
    }
  }

  getPrompt(promptId: string): CreativePrompt | undefined {
    return this.prompts.get(promptId);
  }

  getPromptsByType(type: HallucinationType): CreativePrompt[] {
    return Array.from(this.prompts.values())
      .filter(p => p.type === type);
  }

  addCustomPrompt(prompt: Omit<CreativePrompt, 'id'>): CreativePrompt {
    const full: CreativePrompt = {
      ...prompt,
      id: uuidv4()
    };

    this.prompts.set(full.id, full);
    return full;
  }

  fillPromptTemplate(promptId: string, values: Record<string, string>): string {
    const prompt = this.prompts.get(promptId);
    if (!prompt) throw new Error('Prompt not found');

    let filled = prompt.template;
    for (const [key, value] of Object.entries(values)) {
      filled = filled.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    return filled;
  }

  // ============================================================================
  // ANALYSIS AND UTILITIES
  // ============================================================================

  analyzeHallucinationPatterns(): {
    mostUsedTypes: Array<{ type: HallucinationType; count: number }>;
    averageCanonCompliance: number;
    acceptanceRate: number;
    truthLayerDistribution: Map<TruthLayer, number>;
  } {
    const typeCounts = new Map<HallucinationType, number>();
    let totalCompliance = 0;
    let acceptedCount = 0;
    const layerCounts = new Map<TruthLayer, number>();

    for (const content of this.generatedContent.values()) {
      // Type counts
      typeCounts.set(content.type, (typeCounts.get(content.type) || 0) + 1);

      // Compliance
      totalCompliance += content.canonCompliance;

      // Acceptance
      if (content.isAccepted) acceptedCount++;

      // Truth layers
      layerCounts.set(content.truthLayer, (layerCounts.get(content.truthLayer) || 0) + 1);
    }

    const contentCount = this.generatedContent.size;

    // Sort types by count
    const sortedTypes = Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));

    return {
      mostUsedTypes: sortedTypes,
      averageCanonCompliance: contentCount > 0 ? totalCompliance / contentCount : 1,
      acceptanceRate: contentCount > 0 ? acceptedCount / contentCount : 0,
      truthLayerDistribution: layerCounts
    };
  }

  getUnresolvedTruths(): TruthRecord[] {
    return Array.from(this.truthRecords.values())
      .filter(r => r.activeLayer !== TruthLayer.OBJECTIVE_REALITY && !r.revealedIn);
  }

  // ============================================================================
  // SERIALIZATION
  // ============================================================================

  exportToJSON(): string {
    const data = {
      seeds: Array.from(this.seeds.entries()),
      generatedContent: Array.from(this.generatedContent.entries()),
      truthRecords: Array.from(this.truthRecords.entries()),
      unreliableNarrators: Array.from(this.unreliableNarrators.entries()),
      dreamSequences: Array.from(this.dreamSequences.entries()),
      worldExtrapolations: Array.from(this.worldExtrapolations.entries()),
      prompts: Array.from(this.prompts.entries()),
      divergencePoints: Array.from(this.divergencePoints.entries()),
      canonAnchors: Array.from(this.canonAnchors.entries()),
      indexes: {
        contentBySeedIndex: Array.from(this.contentBySeedIndex.entries()),
        truthBySubjectIndex: Array.from(this.truthBySubjectIndex.entries()),
        dreamsByCharacterIndex: Array.from(this.dreamsByCharacterIndex.entries())
      }
    };

    return JSON.stringify(data, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    this.seeds = new Map(data.seeds);
    this.generatedContent = new Map(data.generatedContent);
    this.truthRecords = new Map(data.truthRecords);
    this.unreliableNarrators = new Map(data.unreliableNarrators);
    this.dreamSequences = new Map(data.dreamSequences);
    this.worldExtrapolations = new Map(data.worldExtrapolations);
    this.prompts = new Map(data.prompts);
    this.divergencePoints = new Map(data.divergencePoints);
    this.canonAnchors = new Map(data.canonAnchors);

    if (data.indexes) {
      this.contentBySeedIndex = new Map(data.indexes.contentBySeedIndex);
      this.truthBySubjectIndex = new Map(data.indexes.truthBySubjectIndex);
      this.dreamsByCharacterIndex = new Map(data.indexes.dreamsByCharacterIndex);
    }
  }

  clear(): void {
    this.seeds.clear();
    this.generatedContent.clear();
    this.truthRecords.clear();
    this.unreliableNarrators.clear();
    this.dreamSequences.clear();
    this.worldExtrapolations.clear();
    this.divergencePoints.clear();
    this.canonAnchors.clear();
    this.contentBySeedIndex.clear();
    this.truthBySubjectIndex.clear();
    this.dreamsByCharacterIndex.clear();

    // Reinitialize default prompts
    this.prompts.clear();
    this.initializeDefaultPrompts();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CreativeHallucinationEngine;
