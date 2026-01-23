/**
 * Unit Tests: Validation Engines
 *
 * Tests for the validation subsystem including:
 * - ChapterManager
 * - ContinuityValidator
 * - StoryIntegrityChecker
 * - RelationshipValidator
 * - KnowledgeTracker
 * - ValidationSuite
 *
 * Test Pyramid Level: UNIT (base)
 * Focus: Individual engine functions, data structures, isolated behavior
 */

import {
  ChapterManager,
  ChapterStatus,
  ChapterType,
  POVType,
} from '../../src/engines/validation/chapter-manager';

import {
  ContinuityValidator,
} from '../../src/engines/validation/continuity-validator';

import {
  StoryIntegrityChecker,
  CharacterArcType,
  NarrativeStructure,
  PlotPointType,
} from '../../src/engines/validation/story-integrity-checker';

import {
  RelationshipValidator,
  RelationshipType,
  RelationshipStatus,
  RelationshipSentiment,
} from '../../src/engines/validation/relationship-validator';

import {
  KnowledgeTracker,
} from '../../src/engines/validation/knowledge-tracker';

import { ValidationSuite } from '../../src/engines/validation';

// ============================================================================
// CHAPTER MANAGER UNIT TESTS
// ============================================================================

describe('ChapterManager', () => {
  let manager: ChapterManager;

  beforeEach(() => {
    manager = new ChapterManager();
  });

  describe('Chapter Creation', () => {
    it('should create a chapter with required fields', () => {
      const chapter = manager.createChapter({
        number: 1,
        title: 'The Beginning',
      });

      expect(chapter.id).toBeDefined();
      expect(chapter.number).toBe(1);
      expect(chapter.title).toBe('The Beginning');
      expect(chapter.status).toBe(ChapterStatus.PLANNED);
    });

    it('should create a chapter with custom properties', () => {
      const chapter = manager.createChapter({
        number: 1,
        title: 'Epic Battle',
        type: ChapterType.REGULAR,
        povType: POVType.THIRD_LIMITED,
        povCharacter: 'hero-1',
      });

      expect(chapter.type).toBe(ChapterType.REGULAR);
      expect(chapter.povType).toBe(POVType.THIRD_LIMITED);
      expect(chapter.povCharacter).toBe('hero-1');
    });

    it('should reject duplicate chapter numbers', () => {
      manager.createChapter({ number: 1, title: 'Ch 1' });

      expect(() => {
        manager.createChapter({ number: 1, title: 'Ch 1 Duplicate' });
      }).toThrow('Chapter 1 already exists');
    });

    it('should create chapters with different numbers', () => {
      const ch1 = manager.createChapter({ number: 1, title: 'Ch 1' });
      const ch2 = manager.createChapter({ number: 2, title: 'Ch 2' });
      const ch3 = manager.createChapter({ number: 3, title: 'Ch 3' });

      expect(ch1.number).toBe(1);
      expect(ch2.number).toBe(2);
      expect(ch3.number).toBe(3);
    });
  });

  describe('Chapter Retrieval', () => {
    it('should retrieve a chapter by number', () => {
      const created = manager.createChapter({ number: 1, title: 'Test' });
      const retrieved = manager.getChapter(1);

      expect(retrieved).toBeDefined();
      expect(retrieved?.number).toBe(1);
      expect(retrieved?.title).toBe('Test');
    });

    it('should retrieve a chapter by ID', () => {
      const created = manager.createChapter({ number: 1, title: 'Test' });
      const retrieved = manager.getChapterById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return undefined for non-existent chapter', () => {
      const retrieved = manager.getChapter(999);
      expect(retrieved).toBeUndefined();
    });

    it('should get all chapters sorted by number', () => {
      manager.createChapter({ number: 3, title: 'Third' });
      manager.createChapter({ number: 1, title: 'First' });
      manager.createChapter({ number: 2, title: 'Second' });

      const all = manager.getAllChapters();
      expect(all.length).toBe(3);
      expect(all[0].number).toBe(1);
      expect(all[1].number).toBe(2);
      expect(all[2].number).toBe(3);
    });
  });

  describe('Chapter Updates', () => {
    it('should update chapter content', () => {
      manager.createChapter({ number: 1, title: 'Test' });

      manager.updateChapter(1, {
        content: 'Chapter content here...',
      });

      const updated = manager.getChapter(1);
      expect(updated?.content).toBe('Chapter content here...');
    });

    it('should update chapter status', () => {
      manager.createChapter({ number: 1, title: 'Test' });

      manager.updateChapter(1, { status: ChapterStatus.DRAFTED });
      expect(manager.getChapter(1)?.status).toBe(ChapterStatus.DRAFTED);
    });

    it('should delete a chapter', () => {
      manager.createChapter({ number: 1, title: 'Test' });

      const deleted = manager.deleteChapter(1);
      expect(deleted).toBe(true);
      expect(manager.getChapter(1)).toBeUndefined();
    });
  });

  describe('Batch Operations', () => {
    it('should create chapter batch', () => {
      const chapters = manager.createChapterBatch(5, 1);

      expect(chapters.length).toBe(5);
      expect(chapters[0].number).toBe(1);
      expect(chapters[4].number).toBe(5);
    });

    it('should initialize full story structure', () => {
      const result = manager.initializeFullStory(100, 10);

      expect(result.chapters.length).toBe(100);
      expect(result.volumes.length).toBe(10);
      expect(result.arcs.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    it('should calculate correct statistics', () => {
      manager.createChapter({ number: 1, title: 'C1' });
      manager.createChapter({ number: 2, title: 'C2' });
      manager.createChapter({ number: 3, title: 'C3' });

      const stats = manager.getStats();

      expect(stats.totalChapters).toBe(3);
      expect(stats.chaptersByStatus[ChapterStatus.PLANNED]).toBe(3);
    });
  });

  describe('Plot Thread Management', () => {
    it('should create and retrieve plot threads', () => {
      const thread = manager.createPlotThread({
        name: 'Hero Quest',
        introducedChapter: 1,
        priority: 'main',
      });

      expect(thread.id).toBeDefined();
      expect(thread.name).toBe('Hero Quest');
      expect(thread.status).toBe('introduced');
    });

    it('should resolve plot threads', () => {
      const thread = manager.createPlotThread({
        name: 'Mystery',
        introducedChapter: 1,
      });

      manager.resolvePlotThread(thread.id, 50);
      const resolved = manager.getPlotThread(thread.id);

      expect(resolved?.status).toBe('resolved');
      expect(resolved?.resolvedChapter).toBe(50);
    });

    it('should find neglected plot threads', () => {
      manager.createPlotThread({
        name: 'Forgotten Thread',
        introducedChapter: 1,
      });

      const neglected = manager.findNeglectedPlotThreads(200, 50);
      expect(neglected.length).toBe(1);
    });
  });

  describe('Export/Import', () => {
    it('should export to JSON and import back', () => {
      manager.createChapter({ number: 1, title: 'Export Test' });
      manager.createChapter({ number: 2, title: 'Export Test 2' });

      const json = manager.exportToJSON();
      expect(json).toBeDefined();

      const newManager = new ChapterManager();
      newManager.importFromJSON(json);

      const stats = newManager.getStats();
      expect(stats.totalChapters).toBe(2);
    });
  });
});

// ============================================================================
// CONTINUITY VALIDATOR UNIT TESTS
// ============================================================================

describe('ContinuityValidator', () => {
  let validator: ContinuityValidator;

  beforeEach(() => {
    validator = new ContinuityValidator();
  });

  describe('Initialization', () => {
    it('should initialize with default rules', () => {
      const rules = validator.getRules();
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  describe('Rule Management', () => {
    it('should add custom rules', () => {
      const initialCount = validator.getRules().length;

      validator.addRule({
        id: 'custom-rule',
        name: 'Custom Test Rule',
        type: 'custom' as any,
        description: 'A test rule',
        severity: 'warning' as any,
        enabled: true,
        category: 'continuity' as any,
        validator: () => [{ passed: true }],
      });

      expect(validator.getRules().length).toBe(initialCount + 1);
    });

    it('should enable and disable rules', () => {
      validator.disableRule('timeline-consistency');
      const rules = validator.getRules();
      const timelineRule = rules.find(r => r.id === 'timeline-consistency');
      expect(timelineRule?.enabled).toBe(false);

      validator.enableRule('timeline-consistency');
      const enabledRule = validator.getRules().find(r => r.id === 'timeline-consistency');
      expect(enabledRule?.enabled).toBe(true);
    });
  });

  describe('Character Registration', () => {
    it('should register character data', () => {
      validator.registerCharacter({
        id: 'hero-1',
        name: 'John Hero',
        aliases: ['The Champion'],
        abilities: ['swordsmanship'],
        knownLanguages: ['Common'],
        physicalDescription: {},
        personalityTraits: ['brave'],
        relationships: new Map(),
        locationHistory: [],
        statusHistory: [],
        inventoryHistory: [],
      });

      // Character is registered (private, but validation should work)
      expect(() => validator.getRules()).not.toThrow();
    });
  });

  describe('Location Registration', () => {
    it('should register location data', () => {
      validator.registerLocation({
        id: 'loc-1',
        name: 'Castle Fortress',
        aliases: [],
        type: 'castle',
        travelTimes: new Map(),
      });

      // Location is registered
      expect(() => validator.getRules()).not.toThrow();
    });
  });

  describe('Validation', () => {
    it('should validate a chapter', () => {
      const chapterManager = new ChapterManager();
      chapterManager.createChapter({
        number: 1,
        title: 'Test Chapter',
        timelineStart: { year: 100 },
        timelineEnd: { year: 100 },
      });

      const chapter = chapterManager.getChapter(1)!;
      const errors = validator.validateChapter(chapter, chapterManager);

      expect(Array.isArray(errors)).toBe(true);
    });
  });

  describe('Clear', () => {
    it('should clear all data', () => {
      validator.registerCharacter({
        id: 'char-1',
        name: 'Test',
        aliases: [],
        abilities: [],
        knownLanguages: [],
        physicalDescription: {},
        personalityTraits: [],
        relationships: new Map(),
        locationHistory: [],
        statusHistory: [],
        inventoryHistory: [],
      });

      validator.clear();
      // After clear, validator should still work
      expect(() => validator.getRules()).not.toThrow();
    });
  });
});

// ============================================================================
// STORY INTEGRITY CHECKER UNIT TESTS
// ============================================================================

describe('StoryIntegrityChecker', () => {
  let checker: StoryIntegrityChecker;

  beforeEach(() => {
    checker = new StoryIntegrityChecker();
  });

  describe('Character Arc Management', () => {
    it('should create a character arc', () => {
      const arc = checker.createCharacterArc({
        characterId: 'hero-1',
        characterName: 'John Hero',
        arcType: CharacterArcType.POSITIVE,
        startChapter: 1,
        endChapter: 100,
      });

      expect(arc.id).toBeDefined();
      expect(arc.arcType).toBe(CharacterArcType.POSITIVE);
      expect(arc.status).toBe('in_progress');
    });

    it('should update character arc', () => {
      const arc = checker.createCharacterArc({
        characterId: 'hero-1',
        characterName: 'John Hero',
        arcType: CharacterArcType.REDEMPTION,
        startChapter: 1,
      });

      checker.updateCharacterArc(arc.id, { status: 'completed' });
      const arcs = checker.getCharacterArcs();

      expect(arcs.find(a => a.id === arc.id)?.status).toBe('completed');
    });

    it('should add key moments to arc', () => {
      const arc = checker.createCharacterArc({
        characterId: 'hero-1',
        characterName: 'John Hero',
        arcType: CharacterArcType.MATURATION,
        startChapter: 1,
        endChapter: 100,
      });

      checker.addKeyMoment(arc.id, {
        chapter: 10,
        type: 'turning_point',
        description: 'Call to adventure',
      });

      const arcs = checker.getCharacterArcs();
      const updatedArc = arcs.find(a => a.id === arc.id);
      expect(updatedArc?.keyMoments.length).toBe(1);
    });
  });

  describe('Foreshadowing', () => {
    it('should plant foreshadowing elements', () => {
      const foreshadow = checker.plantForeshadowing({
        description: 'Mysterious pendant glows',
        setupChapter: 5,
        type: 'object',
        subtlety: 'subtle',
      });

      expect(foreshadow.id).toBeDefined();
      expect(foreshadow.status).toBe('planted');
    });

    it('should pay off foreshadowing', () => {
      const foreshadow = checker.plantForeshadowing({
        description: 'Prophecy mentioned',
        setupChapter: 1,
      });

      checker.payoffForeshadowing(foreshadow.id, 100);
      const foreshadowing = checker.getForeshadowing();

      expect(foreshadowing.find(f => f.id === foreshadow.id)?.status).toBe('fully_paid');
      expect(foreshadowing.find(f => f.id === foreshadow.id)?.payoffChapter).toBe(100);
    });

    it('should get unpaid foreshadowing', () => {
      checker.plantForeshadowing({
        description: 'Setup 1',
        setupChapter: 1,
      });

      const paidForeshadow = checker.plantForeshadowing({
        description: 'Setup 2',
        setupChapter: 5,
      });
      checker.payoffForeshadowing(paidForeshadow.id, 50);

      const unpaid = checker.getUnpaidForeshadowing();
      expect(unpaid.length).toBe(1);
    });
  });

  describe('Plot Points', () => {
    it('should add plot points', () => {
      const point = checker.addPlotPoint({
        type: PlotPointType.INCITING_INCIDENT,
        chapter: 5,
        description: 'Hero receives the call',
        impact: 'major',
      });

      expect(point.id).toBeDefined();
      expect(point.type).toBe(PlotPointType.INCITING_INCIDENT);
    });

    it('should get plot points by type', () => {
      checker.addPlotPoint({
        type: PlotPointType.CLIMAX,
        chapter: 90,
        description: 'Final battle',
      });
      checker.addPlotPoint({
        type: PlotPointType.MIDPOINT,
        chapter: 50,
        description: 'Midpoint revelation',
      });

      const climaxPoints = checker.getPlotPointsByType(PlotPointType.CLIMAX);
      expect(climaxPoints.length).toBe(1);
    });
  });

  describe('Narrative Structure', () => {
    it('should set narrative structure', () => {
      const beats = checker.setNarrativeStructure(NarrativeStructure.THREE_ACT, 100);

      expect(beats.structure).toBe(NarrativeStructure.THREE_ACT);
      expect(beats.beats.length).toBeGreaterThan(0);
    });

    it('should mark beats as achieved', () => {
      checker.setNarrativeStructure(NarrativeStructure.HEROES_JOURNEY, 100);
      checker.markBeatAchieved('Ordinary World', 1);

      const beats = checker.getNarrativeBeats();
      const ordinaryWorld = beats?.beats.find(b => b.name === 'Ordinary World');
      expect(ordinaryWorld?.achieved).toBe(true);
    });
  });

  describe('Export/Import', () => {
    it('should export and import data', () => {
      checker.createCharacterArc({
        characterId: 'test-char',
        characterName: 'Test Character',
        arcType: CharacterArcType.REDEMPTION,
        startChapter: 1,
      });

      const json = checker.exportToJSON();
      const newChecker = new StoryIntegrityChecker();
      newChecker.importFromJSON(json);

      expect(newChecker.getCharacterArcs().length).toBe(1);
    });
  });
});

// ============================================================================
// RELATIONSHIP VALIDATOR UNIT TESTS
// ============================================================================

describe('RelationshipValidator', () => {
  let validator: RelationshipValidator;

  beforeEach(() => {
    validator = new RelationshipValidator();
  });

  describe('Relationship Creation', () => {
    it('should create a relationship', () => {
      const relationship = validator.createRelationship({
        character1Id: 'char-1',
        character2Id: 'char-2',
        type: RelationshipType.FRIENDSHIP,
        status: RelationshipStatus.ACTIVE,
        sentiment: RelationshipSentiment.POSITIVE,
        startChapter: 1,
      });

      expect(relationship.id).toBeDefined();
      expect(relationship.type).toBe(RelationshipType.FRIENDSHIP);
    });
  });

  describe('Relationship Types', () => {
    it('should handle family relationships', () => {
      const created = validator.createRelationship({
        character1Id: 'parent-1',
        character2Id: 'child-1',
        type: RelationshipType.FAMILY_PARENT_CHILD,
        status: RelationshipStatus.ACTIVE,
        sentiment: RelationshipSentiment.POSITIVE,
        startChapter: 1,
      });

      const rel = validator.getRelationship(created.id);
      expect(rel?.type).toBe(RelationshipType.FAMILY_PARENT_CHILD);
    });

    it('should handle romantic relationships', () => {
      const created = validator.createRelationship({
        character1Id: 'char-a',
        character2Id: 'char-b',
        type: RelationshipType.ROMANTIC,
        status: RelationshipStatus.ACTIVE,
        sentiment: RelationshipSentiment.POSITIVE,
        startChapter: 10,
      });

      const rel = validator.getRelationship(created.id);
      expect(rel?.type).toBe(RelationshipType.ROMANTIC);
    });
  });

  describe('Relationship Updates', () => {
    it('should update relationship status', () => {
      const rel = validator.createRelationship({
        character1Id: 'char-1',
        character2Id: 'char-2',
        type: RelationshipType.RIVALRY,
        status: RelationshipStatus.ACTIVE,
        sentiment: RelationshipSentiment.NEGATIVE,
        startChapter: 1,
      });

      const result = validator.updateRelationship(rel.id, 50, {
        status: RelationshipStatus.ENDED,
        reason: 'Final confrontation resolved their differences',
      });

      expect(result).toBe(true);

      // Use getRelationship with ID directly
      const updated = validator.getRelationship(rel.id);
      expect(updated?.status).toBe(RelationshipStatus.ENDED);
    });
  });

  describe('Statistics', () => {
    it('should provide relationship statistics', () => {
      validator.createRelationship({
        character1Id: 'c1',
        character2Id: 'c2',
        type: RelationshipType.FRIENDSHIP,
        status: RelationshipStatus.ACTIVE,
        sentiment: RelationshipSentiment.POSITIVE,
        startChapter: 1,
      });

      const stats = validator.getStats();
      expect(stats.totalRelationships).toBe(1);
      expect(stats.activeRelationships).toBe(1);
    });
  });
});

// ============================================================================
// KNOWLEDGE TRACKER UNIT TESTS
// ============================================================================

describe('KnowledgeTracker', () => {
  let tracker: KnowledgeTracker;

  beforeEach(() => {
    tracker = new KnowledgeTracker();
  });

  describe('Basic Operations', () => {
    it('should initialize without errors', () => {
      expect(tracker).toBeDefined();
    });

    it('should provide statistics', () => {
      const stats = tracker.getStats();
      expect(stats).toBeDefined();
      expect(stats.totalKnowledgePieces).toBeDefined();
    });
  });

  describe('Error Management', () => {
    it('should clear errors', () => {
      tracker.clearErrors();
      const errors = tracker.getErrors();
      expect(Array.isArray(errors)).toBe(true);
    });
  });
});

// ============================================================================
// VALIDATION SUITE UNIT TESTS
// ============================================================================

describe('ValidationSuite', () => {
  let suite: ValidationSuite;

  beforeEach(() => {
    suite = new ValidationSuite();
  });

  describe('Initialization', () => {
    it('should initialize all sub-validators', () => {
      expect(suite.chapters).toBeDefined();
      expect(suite.continuity).toBeDefined();
      expect(suite.integrity).toBeDefined();
      expect(suite.relationships).toBeDefined();
      expect(suite.knowledge).toBeDefined();
    });

    it('should initialize a story structure', () => {
      suite.initializeStory(100, { volumeSize: 10 });

      const stats = suite.getStoryStats();
      expect(stats.chapters.totalChapters).toBe(100);
    });
  });

  describe('Full Validation', () => {
    it('should run full story validation', () => {
      suite.initializeStory(10, { volumeSize: 5 });

      const report = suite.validateFullStory();

      expect(report).toBeDefined();
      expect(report.overallScore).toBeDefined();
      expect(typeof report.totalErrors).toBe('number');
    });
  });

  describe('Report Generation', () => {
    it('should generate a text report', () => {
      suite.initializeStory(50, { volumeSize: 10 });

      const report = suite.generateReport();

      expect(report).toContain('Story Validation Report');
      expect(report).toContain('Total Chapters');
    });
  });

  describe('Export/Import', () => {
    it('should export and import all data', () => {
      suite.initializeStory(20, { volumeSize: 5 });

      const exportedData = suite.exportAll();
      expect(exportedData).toBeDefined();

      const newSuite = new ValidationSuite();
      newSuite.importAll(exportedData);

      const stats = newSuite.getStoryStats();
      expect(stats.chapters.totalChapters).toBe(20);
    });
  });

  describe('Clear All', () => {
    it('should clear all validation data', () => {
      suite.initializeStory(100);

      suite.clearAll();

      const stats = suite.getStoryStats();
      expect(stats.chapters.totalChapters).toBe(0);
    });
  });
});
