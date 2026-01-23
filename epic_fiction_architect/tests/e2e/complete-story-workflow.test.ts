/**
 * End-to-End Tests: Complete Story Workflow
 *
 * Tests complete user journeys through the Epic Fiction Architect system.
 * These tests simulate real-world usage patterns and verify that all
 * components work together correctly.
 *
 * Test Pyramid Level: E2E (top)
 * Focus: User workflows, system integration, real-world scenarios
 */

import { ValidationSuite } from '../../src/engines/validation';
import { PredictiveNarrativeEngine } from '../../src/engines/narrative';
import { CharacterArcType } from '../../src/engines/validation/story-integrity-checker';
import { RelationshipType, RelationshipStatus, RelationshipSentiment } from '../../src/engines/validation/relationship-validator';

// ============================================================================
// E2E TEST: COMPLETE STORY CREATION WORKFLOW
// ============================================================================

describe('E2E: Complete Story Creation Workflow', () => {
  let validation: ValidationSuite;
  let narrative: PredictiveNarrativeEngine;

  beforeEach(() => {
    validation = new ValidationSuite();
    narrative = new PredictiveNarrativeEngine();
  });

  /**
   * Test: Create a complete story from scratch
   *
   * This simulates a user creating a new epic story with:
   * - Chapter structure
   * - Character arcs and relationships
   * - Plot events and causal chains
   * - Foreshadowing tracking
   */
  it('should create and validate a complete 100-chapter story', () => {
    // PHASE 1: Initialize story structure
    validation.initializeStory(100, {
      volumeSize: 10,
    });

    // Verify structure was created
    const storyStats = validation.getStoryStats();
    expect(storyStats.chapters.totalChapters).toBe(100);

    // PHASE 2: Create character arcs
    const heroArc = validation.integrity.createCharacterArc({
      characterId: 'hero-001',
      characterName: 'Aria Starlight',
      arcType: CharacterArcType.POSITIVE,
      startChapter: 1,
      endChapter: 100,
    });

    expect(heroArc.id).toBeDefined();

    // Add key moments
    validation.integrity.addKeyMoment(heroArc.id, {
      chapter: 10,
      type: 'turning_point',
      description: 'Call to adventure',
    });

    validation.integrity.addKeyMoment(heroArc.id, {
      chapter: 50,
      type: 'test',
      description: 'Major ordeal',
    });

    // PHASE 3: Establish relationships
    validation.relationships.createRelationship({
      character1Id: 'hero-001',
      character2Id: 'mentor-001',
      type: RelationshipType.MENTORSHIP,
      status: RelationshipStatus.ACTIVE,
      sentiment: RelationshipSentiment.POSITIVE,
      startChapter: 5,
    });

    validation.relationships.createRelationship({
      character1Id: 'hero-001',
      character2Id: 'companion-001',
      type: RelationshipType.FRIENDSHIP,
      status: RelationshipStatus.ACTIVE,
      sentiment: RelationshipSentiment.POSITIVE,
      startChapter: 10,
    });

    validation.relationships.createRelationship({
      character1Id: 'hero-001',
      character2Id: 'villain-001',
      type: RelationshipType.RIVALRY,
      status: RelationshipStatus.ACTIVE,
      sentiment: RelationshipSentiment.NEGATIVE,
      startChapter: 20,
    });

    // PHASE 4: Add foreshadowing
    validation.integrity.plantForeshadowing({
      description: 'Mysterious birthmark glows in moonlight',
      setupChapter: 3,
      type: 'symbol',
      subtlety: 'subtle',
    });

    validation.integrity.plantForeshadowing({
      description: 'Mentor hints at knowing hero\'s true parents',
      setupChapter: 15,
      type: 'dialogue',
      subtlety: 'moderate',
    });

    // PHASE 5: Create plot events with proper API
    narrative.addPlotEvent({
      name: 'Village Attack',
      description: 'Shadow forces attack the village',
      eventType: 'action',
      participantIds: ['hero-001', 'villain-001'],
      timelinePosition: 10,
      isDecisionPoint: true,
      importance: 8,
      requiresConditions: [],
      establishesConditions: [
        { id: 'hero-driven', name: 'Hero motivated', category: 'character_state', value: true, affectedEntityIds: ['hero-001'], isNegatable: false },
      ],
      affectsGoals: [],
    });

    narrative.addPlotEvent({
      name: 'Meeting the Mentor',
      description: 'Hero meets the mysterious sage',
      eventType: 'revelation',
      participantIds: ['hero-001', 'mentor-001'],
      timelinePosition: 15,
      importance: 7,
      isDecisionPoint: false,
      requiresConditions: [
        { id: 'hero-driven', name: 'Hero motivated', category: 'character_state', value: true, affectedEntityIds: ['hero-001'], isNegatable: false },
      ],
      establishesConditions: [
        { id: 'has-mentor', name: 'Has mentor', category: 'character_state', value: true, affectedEntityIds: ['hero-001'], isNegatable: false },
      ],
      affectsGoals: [],
    });

    narrative.addPlotEvent({
      name: 'First Confrontation',
      description: 'Hero faces villain for the first time',
      eventType: 'conflict',
      participantIds: ['hero-001', 'villain-001'],
      timelinePosition: 50,
      importance: 9,
      isDecisionPoint: true,
      requiresConditions: [
        { id: 'has-mentor', name: 'Has mentor', category: 'character_state', value: true, affectedEntityIds: ['hero-001'], isNegatable: false },
      ],
      establishesConditions: [
        { id: 'knows-enemy', name: 'Knows the enemy', category: 'character_state', value: true, affectedEntityIds: ['hero-001'], isNegatable: false },
      ],
      affectsGoals: [],
    });

    // Add character goal
    narrative.addCharacterGoal({
      characterId: 'hero-001',
      description: 'Defeat the villain and save the kingdom',
      priority: 10,
      establishedAt: 10,
      motivations: ['protect loved ones', 'fulfill destiny'],
      conflicts: [],
      status: 'active',
    });

    // PHASE 6: Run full validation
    const validationReport = validation.validateFullStory();

    // ASSERTIONS
    expect(validationReport.overallScore).toBeGreaterThanOrEqual(0);
    expect(validationReport.totalErrors).toBeDefined();

    // Check narrative health
    const narrativeAnalysis = narrative.analyze();
    expect(narrativeAnalysis.healthScore).toBeGreaterThan(0);

    // Verify causal chain is auto-detected
    expect(narrativeAnalysis.causalAnalysis.maxCausalDepth).toBeGreaterThanOrEqual(2);

    // Verify arcs
    const arcs = validation.integrity.getCharacterArcs();
    expect(arcs.length).toBe(1);

    // Verify foreshadowing
    const foreshadowing = validation.integrity.getForeshadowing();
    expect(foreshadowing.length).toBe(2);

    // Verify relationships
    const relStats = validation.relationships.getStats();
    expect(relStats.totalRelationships).toBe(3);
  });

  /**
   * Test: Export and import complete story state
   *
   * Verifies that the entire story state can be serialized and restored.
   */
  it('should export and import complete story state', () => {
    // Create a minimal story
    validation.initializeStory(10);

    narrative.addPlotEvent({
      name: 'Test Event',
      description: 'A test event',
      eventType: 'action',
      participantIds: ['char-1'],
      timelinePosition: 1,
      importance: 5,
      isDecisionPoint: false,
      requiresConditions: [],
      establishesConditions: [],
      affectsGoals: [],
    });

    // Export all state
    const validationExport = validation.exportAll();
    const narrativeExport = narrative.exportToJSON();

    // Create new instances
    const newValidation = new ValidationSuite();
    const newNarrative = new PredictiveNarrativeEngine();

    // Import state
    newValidation.importAll(validationExport);
    newNarrative.importFromJSON(narrativeExport);

    // Verify restored state
    expect(newValidation.getStoryStats().chapters.totalChapters).toBe(10);
    expect(newNarrative.getStats().plotGraphStats.totalEvents).toBe(1);
  });
});

// ============================================================================
// E2E TEST: LARGE-SCALE STORY MANAGEMENT
// ============================================================================

describe('E2E: Large-Scale Story Management', () => {
  /**
   * Test: Manage a 1000-chapter epic story
   *
   * Verifies the system can handle large stories efficiently.
   */
  it('should handle a 1000-chapter story structure', () => {
    const validation = new ValidationSuite();

    // Initialize large story
    const startTime = Date.now();
    validation.initializeStory(1000, { volumeSize: 50 });
    const initTime = Date.now() - startTime;

    // Should initialize quickly (under 5 seconds)
    expect(initTime).toBeLessThan(5000);

    const stats = validation.getStoryStats();
    expect(stats.chapters.totalChapters).toBe(1000);

    // Verify we can query chapters efficiently
    const queryStart = Date.now();
    const allChapters = validation.chapters.getAllChapters();
    const queryTime = Date.now() - queryStart;

    expect(queryTime).toBeLessThan(100); // Query should be fast
    expect(allChapters.length).toBe(1000);

    // Run validation on a subset
    const validationStart = Date.now();
    const rangeReport = validation.validateChapterRange(1, 100);
    const validationTime = Date.now() - validationStart;

    expect(validationTime).toBeLessThan(2000);
    expect(rangeReport).toBeDefined();
  });

  /**
   * Test: Complex plot thread management
   *
   * Tests creating many plot threads with resolution tracking.
   */
  it('should handle complex plot thread tracking', () => {
    const validation = new ValidationSuite();
    validation.initializeStory(500, { volumeSize: 50 });

    // Create 20 plot threads
    const threads = [];
    for (let i = 0; i < 20; i++) {
      threads.push(
        validation.chapters.createPlotThread({
          name: `Thread ${i + 1}`,
          introducedChapter: i * 20 + 1,
          priority: i < 3 ? 'main' : i < 10 ? 'major' : 'minor',
        })
      );
    }

    expect(threads.length).toBe(20);

    // Resolve some threads
    for (let i = 0; i < 10; i++) {
      validation.chapters.resolvePlotThread(threads[i].id, i * 20 + 100);
    }

    // Check active vs resolved
    const activeThreads = validation.chapters.getActivePlotThreads();
    expect(activeThreads.length).toBe(10);

    const allThreads = validation.chapters.getAllPlotThreads();
    expect(allThreads.length).toBe(20);
  });
});

// ============================================================================
// E2E TEST: NARRATIVE CONSISTENCY CHECK
// ============================================================================

describe('E2E: Narrative Consistency Check', () => {
  /**
   * Test: Detect and report narrative inconsistencies
   *
   * Verifies the system can identify plot holes and orphaned events.
   */
  it('should detect plot holes and orphaned events', () => {
    const narrative = new PredictiveNarrativeEngine();

    // Create events with proper causal chain (links are auto-detected via conditions)
    narrative.addPlotEvent({
      name: 'The Setup',
      description: 'Establishing the world',
      eventType: 'action',
      participantIds: ['hero'],
      timelinePosition: 1,
      importance: 7,
      isDecisionPoint: false,
      requiresConditions: [],
      establishesConditions: [
        { id: 'world-established', name: 'World established', category: 'world_state', value: true, affectedEntityIds: [], isNegatable: false },
      ],
      affectsGoals: [],
    });

    narrative.addPlotEvent({
      name: 'The Consequence',
      description: 'Something happens because of setup',
      eventType: 'consequence',
      participantIds: ['hero'],
      timelinePosition: 10,
      importance: 6,
      isDecisionPoint: false,
      requiresConditions: [
        { id: 'world-established', name: 'World established', category: 'world_state', value: true, affectedEntityIds: [], isNegatable: false },
      ],
      establishesConditions: [],
      affectsGoals: [],
    });

    // Create an orphaned event (plot hole - no causal connections)
    narrative.addPlotEvent({
      name: 'Orphaned Event',
      description: 'This event has no connection',
      eventType: 'action',
      participantIds: ['random'],
      timelinePosition: 5,
      importance: 3,
      isDecisionPoint: false,
      requiresConditions: [],
      establishesConditions: [],
      affectsGoals: [],
    });

    // Create an event with unsatisfied condition (plot hole)
    narrative.addPlotEvent({
      name: 'Impossible Event',
      description: 'This requires something that never happens',
      eventType: 'consequence',
      participantIds: ['hero'],
      timelinePosition: 15,
      importance: 5,
      isDecisionPoint: false,
      requiresConditions: [
        { id: 'never-established', name: 'This never happens', category: 'world_state', value: true, affectedEntityIds: [], isNegatable: false },
      ],
      establishesConditions: [],
      affectsGoals: [],
    });

    // Analyze narrative
    const analysis = narrative.analyze();

    // Should detect issues
    expect(analysis.causalAnalysis.orphanedEvents.length).toBeGreaterThan(0);
    expect(analysis.causalAnalysis.unsatisfiedEvents.length).toBeGreaterThan(0);
    expect(analysis.issues.length).toBeGreaterThan(0);

    // Health score should be reduced
    expect(analysis.healthScore).toBeLessThan(100);

    // Get predictions
    const predictions = narrative.predict(10);
    expect(predictions.potentialPlotHoles.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// E2E TEST: COMPLETE JUMPCHAIN JOURNEY
// ============================================================================

describe('E2E: JumpChain Multi-Universe Journey', () => {
  /**
   * Test: Simulate a JumpChain with multiple universe jumps
   *
   * This tests tracking a character across multiple fictional universes.
   */
  it('should track character through multiple universe jumps', () => {
    const validation = new ValidationSuite();
    const narrative = new PredictiveNarrativeEngine();

    // Initialize a 500-chapter JumpChain story
    validation.initializeStory(500, { volumeSize: 50 });

    const jumperId = 'jumper-001';
    const universes = ['Pokemon', 'Naruto', 'Harry Potter', 'Marvel', 'DC'];

    // Register jumper's arc
    validation.integrity.createCharacterArc({
      characterId: jumperId,
      characterName: 'The Jumper',
      arcType: CharacterArcType.POSITIVE,
      startChapter: 1,
      endChapter: 500,
    });

    // Add key moments for each universe
    universes.forEach((name, i) => {
      const arc = validation.integrity.getCharacterArcs()[0];
      validation.integrity.addKeyMoment(arc.id, {
        chapter: i * 100 + 1,
        type: 'turning_point',
        description: `Arrival in ${name} universe`,
      });
    });

    // Create companions and relationships
    const companions = [
      { name: 'Pikachu', startChapter: 10 },
      { name: 'Naruto Clone', startChapter: 110 },
      { name: 'Hermione', startChapter: 210 },
    ];

    companions.forEach((c, i) => {
      validation.relationships.createRelationship({
        character1Id: jumperId,
        character2Id: `companion-${i}`,
        type: RelationshipType.FRIENDSHIP,
        status: RelationshipStatus.ACTIVE,
        sentiment: RelationshipSentiment.POSITIVE,
        startChapter: c.startChapter,
      });
    });

    // Create key narrative events for each jump with proper causal linking via conditions
    universes.forEach((name, i) => {
      // Arrival event
      narrative.addPlotEvent({
        name: `Arrival in ${name}`,
        description: `The Jumper arrives in the ${name} universe`,
        eventType: 'action',
        participantIds: [jumperId],
        timelinePosition: i * 100 + 1,
        importance: 8,
        isDecisionPoint: true,
        requiresConditions: i > 0
          ? [{ id: `completed-${universes[i-1]}`, name: `${universes[i-1]} completed`, category: 'world_state', value: true, affectedEntityIds: [jumperId], isNegatable: false }]
          : [],
        establishesConditions: [
          { id: `in-${name}`, name: `In ${name}`, category: 'world_state', value: true, affectedEntityIds: [jumperId], isNegatable: false },
        ],
        affectsGoals: [],
      });

      // Completion event
      narrative.addPlotEvent({
        name: `${name} Jump Complete`,
        description: `The Jumper completes their time in ${name}`,
        eventType: 'resolution',
        participantIds: [jumperId],
        timelinePosition: i * 100 + 99,
        importance: 8,
        isDecisionPoint: false,
        requiresConditions: [
          { id: `in-${name}`, name: `In ${name}`, category: 'world_state', value: true, affectedEntityIds: [jumperId], isNegatable: false },
        ],
        establishesConditions: [
          { id: `completed-${name}`, name: `${name} completed`, category: 'world_state', value: true, affectedEntityIds: [jumperId], isNegatable: false },
        ],
        affectsGoals: [],
      });
    });

    // Add character goal
    narrative.addCharacterGoal({
      characterId: jumperId,
      description: 'Complete the Chain and gain the Spark',
      priority: 10,
      establishedAt: 1,
      motivations: ['freedom', 'power', 'adventure'],
      conflicts: [],
      status: 'active',
    });

    // Verify the complete setup
    const narrativeAnalysis = narrative.analyze();

    // Check causal depth - should have linked chains
    expect(narrativeAnalysis.causalAnalysis.maxCausalDepth).toBeGreaterThanOrEqual(5);

    // The chain should be causally connected (no orphans, no unsatisfied)
    expect(narrativeAnalysis.causalAnalysis.orphanedEvents.length).toBe(0);
    expect(narrativeAnalysis.causalAnalysis.unsatisfiedEvents.length).toBe(0);

    // Validate the story
    const validationStats = validation.getStoryStats();
    expect(validationStats.chapters.totalChapters).toBe(500);

    // Check relationships
    expect(validationStats.relationships.totalRelationships).toBe(3);
  });
});
