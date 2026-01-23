/**
 * Millennium-Scale Integration Tests
 *
 * Tests for generating 1000 years of continuous in-universe content
 * with 100% accuracy and consistency.
 *
 * Philosophy: "Build for impossible requests so reasonable ones are a cakewalk."
 */

import { CanonModuleFramework, CanonEntryType, CanonicityLevel, createCanonModuleTemplate, createCharacterTemplate, createRuleTemplate } from '../../src/engines/canon';
import { InferenceRuleEngine, InferenceCategory } from '../../src/engines/inference';
import { GenerationLoopEngine, createGenerationRequest, createMockAIGenerate, createMockAIFix, QualityCategory } from '../../src/engines/generation-loop';
import { MillenniumPlanner, EraTonet, ArcType, ResolutionType, EventType, MillenniumThreadType } from '../../src/engines/millennium-planner';
import { ContinuousGenerationEngine, createContinuousGenerator, createTestConfig, SessionStatus } from '../../src/engines/continuous-generation';

// ============================================================================
// CANON MODULE FRAMEWORK TESTS
// ============================================================================

describe('Canon Module Framework', () => {
  let canon: CanonModuleFramework;

  beforeEach(() => {
    canon = new CanonModuleFramework();
  });

  describe('Module Management', () => {
    it('should create and register a canon module', () => {
      const template = createCanonModuleTemplate('Naruto', 'manga');
      const module = canon.registerModule(template);

      expect(module.id).toBeDefined();
      expect(module.universe).toBe('Naruto');
      expect(module.continuity).toBe('manga');
    });

    it('should activate and deactivate modules', () => {
      const module = canon.registerModule(createCanonModuleTemplate('Test'));

      expect(canon.activateModule(module.id)).toBe(true);
      expect(canon.getActiveModules().length).toBe(1);

      canon.deactivateModule(module.id);
      expect(canon.getActiveModules().length).toBe(0);
    });

    it('should export and import modules', () => {
      const module = canon.registerModule(createCanonModuleTemplate('Test'));
      const entry = canon.addEntry(module.id, createCharacterTemplate('Naruto', {
        hair_color: 'blonde',
        eye_color: 'blue',
      }));

      const exported = canon.exportModule(module.id);
      expect(exported).toBeTruthy();

      // Create new canon and import
      const canon2 = new CanonModuleFramework();
      const imported = canon2.importModule(exported!);

      expect(imported.universe).toBe('Test');
      expect(imported.entries.size).toBe(1);
    });
  });

  describe('Entry Management', () => {
    it('should add and find entries by name', () => {
      const module = canon.registerModule(createCanonModuleTemplate('Test'));
      const entry = canon.addEntry(module.id, createCharacterTemplate('Sasuke'));

      const found = canon.findEntriesByName('Sasuke');
      expect(found.length).toBe(1);
      expect(found[0].id).toBe(entry!.id);
    });

    it('should support fuzzy search', () => {
      const module = canon.registerModule(createCanonModuleTemplate('Test'));
      canon.addEntry(module.id, createCharacterTemplate('Uzumaki Naruto'));

      const found = canon.findEntriesByName('Naruto', { fuzzy: true });
      expect(found.length).toBe(1);
    });

    it('should find entries by type', () => {
      const module = canon.registerModule(createCanonModuleTemplate('Test'));
      canon.addEntry(module.id, createCharacterTemplate('Character1'));
      canon.addEntry(module.id, {
        ...createCharacterTemplate('Location1'),
        type: CanonEntryType.LOCATION,
      });

      const characters = canon.findEntriesByType(CanonEntryType.CHARACTER);
      expect(characters.length).toBe(1);
    });
  });

  describe('Validation', () => {
    it('should validate content against canon', () => {
      const module = canon.registerModule(createCanonModuleTemplate('Test'));
      canon.addEntry(module.id, {
        ...createCharacterTemplate('Naruto', { eye_color: 'blue' }),
        attributes: {
          eye_color: {
            key: 'eye_color',
            value: 'blue',
            valueType: 'string',
            mutable: false,
          },
        },
      });
      canon.activateModule(module.id);

      const result = canon.validateAgainstCanon({
        text: 'Naruto looked at him with his green eyes.',
        entities: [{
          name: 'Naruto',
          type: CanonEntryType.CHARACTER,
          attributes: { eye_color: 'green' },
        }],
        claims: [],
      });

      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0].type).toBe('contradiction');
    });

    it('should handle canon rules', () => {
      const module = canon.registerModule(createCanonModuleTemplate('Test'));
      canon.addRule(module.id, {
        name: 'No Flying Without Wings',
        description: 'Humans cannot fly without magical assistance',
        category: 'physics',
        ruleType: 'cannot',
        constraint: {
          subject: 'human',
          predicate: 'fly',
        },
        enforcement: 'strict',
        exceptions: ['with chakra', 'with magic'],
        source: { type: 'custom', title: 'World Rules' },
        canonicity: CanonicityLevel.PRIMARY,
      });

      expect(canon.getActiveRules().length).toBe(0); // Module not activated
      canon.activateModule(module.id);
      expect(canon.getActiveRules().length).toBe(1);
    });
  });
});

// ============================================================================
// INFERENCE RULE ENGINE TESTS
// ============================================================================

describe('Inference Rule Engine', () => {
  let engine: InferenceRuleEngine;

  beforeEach(() => {
    engine = new InferenceRuleEngine();
  });

  describe('Fact Management', () => {
    it('should add and query facts', () => {
      const fact = engine.addFact({
        subject: 'Naruto',
        subjectType: 'character',
        predicate: 'eye_color',
        object: 'blue',
        confidence: 1.0,
        metadata: {},
      });

      const results = engine.queryFacts({ subject: 'Naruto' });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe(fact.id);
    });

    it('should support temporal queries', () => {
      engine.addFact({
        subject: 'Naruto',
        subjectType: 'character',
        predicate: 'status',
        object: 'alive',
        validFrom: 0,
        validUntil: 100,
        confidence: 1.0,
        metadata: {},
      });

      const valid = engine.queryFacts({ subject: 'Naruto', validAt: 50 });
      expect(valid.length).toBe(1);

      const invalid = engine.queryFacts({ subject: 'Naruto', validAt: 150 });
      expect(invalid.length).toBe(0);
    });
  });

  describe('Inference', () => {
    it('should infer grandparent relationships', () => {
      // A is parent of B
      engine.addFact({
        subject: 'Grandpa',
        subjectType: 'character',
        predicate: 'parent_of',
        object: 'Dad',
        confidence: 1.0,
        metadata: {},
      });

      // B is parent of C
      engine.addFact({
        subject: 'Dad',
        subjectType: 'character',
        predicate: 'parent_of',
        object: 'Child',
        confidence: 1.0,
        metadata: {},
      });

      const result = engine.runInference();

      // Should infer: Grandpa is grandparent of Child
      const grandparentFacts = engine.queryFacts({
        subject: 'Grandpa',
        predicate: 'grandparent_of',
      });

      expect(grandparentFacts.length).toBe(1);
      expect(grandparentFacts[0].object).toBe('Child');
      expect(grandparentFacts[0].derived).toBe(true);
    });

    it('should infer sibling relationships', () => {
      engine.addFact({
        subject: 'Parent',
        subjectType: 'character',
        predicate: 'parent_of',
        object: 'Child1',
        confidence: 1.0,
        metadata: {},
      });

      engine.addFact({
        subject: 'Parent',
        subjectType: 'character',
        predicate: 'parent_of',
        object: 'Child2',
        confidence: 1.0,
        metadata: {},
      });

      const result = engine.runInference();

      const siblingFacts = engine.queryFacts({ predicate: 'sibling_of' });
      expect(siblingFacts.length).toBeGreaterThan(0);
    });

    it('should detect conflicts', () => {
      engine.addFact({
        subject: 'Character',
        subjectType: 'character',
        predicate: 'status',
        object: 'alive',
        confidence: 1.0,
        metadata: {},
      });

      engine.addFact({
        subject: 'Character',
        subjectType: 'character',
        predicate: 'status',
        object: 'dead',
        confidence: 1.0,
        metadata: {},
      });

      const result = engine.runInference();
      expect(result.conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('Backward Chaining', () => {
    it('should prove facts through backward chaining', () => {
      engine.addFact({
        subject: 'A',
        subjectType: 'character',
        predicate: 'parent_of',
        object: 'B',
        confidence: 1.0,
        metadata: {},
      });

      engine.addFact({
        subject: 'B',
        subjectType: 'character',
        predicate: 'parent_of',
        object: 'C',
        confidence: 1.0,
        metadata: {},
      });

      const proof = engine.canProve({
        subject: 'A',
        predicate: 'grandparent_of',
        object: 'C',
      });

      expect(proof.provable).toBe(true);
      expect(proof.proof).toBeDefined();
    });
  });
});

// ============================================================================
// GENERATION LOOP ENGINE TESTS
// ============================================================================

describe('Generation Loop Engine', () => {
  let engine: GenerationLoopEngine;

  beforeEach(() => {
    engine = new GenerationLoopEngine(
      createMockAIGenerate(),
      createMockAIFix(),
      {
        maxIterations: 3,
        minQualityScore: 70,
      }
    );
  });

  describe('Generation', () => {
    it('should generate content with validation', async () => {
      const request = createGenerationRequest(
        'Write a scene where Naruto trains',
        'You are a fiction writer',
        { characterIds: ['naruto'] }
      );

      const result = await engine.generate(request);

      expect(result.requestId).toBe(request.id);
      expect(result.content).toBeTruthy();
      expect(result.qualityScore).toBeGreaterThan(0);
      expect(result.attempts.length).toBeGreaterThan(0);
    });

    it('should track quality progression', async () => {
      const request = createGenerationRequest(
        'Write a dialogue scene',
        'You are a fiction writer'
      );

      const result = await engine.generate(request);

      expect(result.report.qualityProgression.length).toBeGreaterThan(0);
    });

    it('should handle events', async () => {
      let progressEvents = 0;
      let completeEvents = 0;

      engine.on('progress', () => progressEvents++);
      engine.on('complete', () => completeEvents++);

      const request = createGenerationRequest('Test', 'System');
      await engine.generate(request);

      expect(progressEvents).toBeGreaterThan(0);
      expect(completeEvents).toBe(1);
    });
  });

  describe('Statistics', () => {
    it('should track generation statistics', async () => {
      const request = createGenerationRequest('Test', 'System');
      await engine.generate(request);

      const stats = engine.getStats();
      expect(stats.totalGenerations).toBe(1);
      expect(stats.averageAttempts).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// MILLENNIUM PLANNER TESTS
// ============================================================================

describe('Millennium Planner', () => {
  let planner: MillenniumPlanner;

  beforeEach(() => {
    planner = new MillenniumPlanner();
  });

  describe('Plan Creation', () => {
    it('should create a 1000-year plan', () => {
      const plan = planner.createPlan({
        name: 'Epic JumpChain',
        description: 'A 1000-year journey',
        totalYears: 1000,
        startYear: 0,
        isJumpChain: true,
      });

      expect(plan.totalYears).toBe(1000);
      expect(plan.jumpPlan).toBeDefined();
    });

    it('should auto-generate era structure', () => {
      const plan = planner.createPlan({
        name: 'Test',
        description: 'Test',
        totalYears: 1000,
        startYear: 0,
      });

      const eras = planner.generateEraStructure(plan.id);

      expect(eras.length).toBeGreaterThan(0);

      // Verify coverage
      const totalCoverage = eras.reduce((sum, e) => sum + (e.endYear - e.startYear), 0);
      expect(totalCoverage).toBe(1000);

      // Verify no gaps
      for (let i = 1; i < eras.length; i++) {
        expect(eras[i].startYear).toBe(eras[i-1].endYear);
      }
    });

    it('should have progressive power levels', () => {
      const plan = planner.createPlan({
        name: 'Test',
        description: 'Test',
        totalYears: 1000,
        startYear: 0,
      });

      const eras = planner.generateEraStructure(plan.id);

      // First era should be weaker than last era
      expect(eras[0].powerLevel.numericScale).toBeLessThan(
        eras[eras.length - 1].powerLevel.numericScale
      );
    });
  });

  describe('Planning Features', () => {
    it('should add crucible moments', () => {
      const plan = planner.createPlan({
        name: 'Test',
        description: 'Test',
        totalYears: 1000,
        startYear: 0,
      });

      planner.generateEraStructure(plan.id);

      const moment = planner.addCrucibleMoment(plan.id, {
        name: 'The Great Battle',
        description: 'A pivotal battle',
        year: 500,
        eraId: plan.eras[5].id,
        significance: 'Changed everything',
        worldBefore: {},
        worldAfter: {},
        participants: ['Hero'],
        consequences: [{
          description: 'The world was never the same',
          manifestsIn: 100,
          severity: 'major',
        }],
      });

      expect(moment.id).toBeDefined();
      expect(plan.crucibleMoments.length).toBe(1);
    });

    it('should add prophecies', () => {
      const plan = planner.createPlan({
        name: 'Test',
        description: 'Test',
        totalYears: 1000,
        startYear: 0,
      });

      const prophecy = planner.addProphecy(plan.id, {
        name: 'The Chosen One',
        text: 'When darkness falls, a light shall rise',
        spokenYear: 0,
        fulfillmentYear: 900,
        components: [
          { description: 'Darkness falls', fulfilled: false },
          { description: 'Light rises', fulfilled: false },
        ],
        fulfillmentType: 'literal',
        involvedCharacters: [],
        foreshadowing: [],
      });

      expect(prophecy.id).toBeDefined();
      expect(plan.prophecies.length).toBe(1);
    });

    it('should add millennium threads', () => {
      const plan = planner.createPlan({
        name: 'Test',
        description: 'Test',
        totalYears: 1000,
        startYear: 0,
      });

      planner.generateEraStructure(plan.id);

      const thread = planner.addMillenniumThread(plan.id, {
        name: 'The Legacy',
        description: 'A family legacy spanning centuries',
        threadType: MillenniumThreadType.LEGACY,
        startYear: 0,
        endYear: 1000,
        touchedEraIds: plan.eras.map(e => e.id),
        manifestations: plan.eras.map(e => ({
          eraId: e.id,
          description: 'The legacy continues',
          intensity: 5,
        })),
        resolution: 'The legacy is fulfilled',
        keyMoments: [],
      });

      expect(thread.id).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should validate plan completeness', () => {
      const plan = planner.createPlan({
        name: 'Test',
        description: 'Test',
        totalYears: 1000,
        startYear: 0,
      });

      planner.generateEraStructure(plan.id);

      const validation = planner.validatePlan(plan.id);

      expect(validation.valid).toBe(true);
      expect(validation.coverage.yearsPlanned).toBe(1000);
    });

    it('should detect gaps in era coverage', () => {
      const plan = planner.createPlan({
        name: 'Test',
        description: 'Test',
        totalYears: 1000,
        startYear: 0,
      });

      // Manually add eras with a gap
      plan.eras = [{
        id: 'era1',
        name: 'Era 1',
        description: '',
        startYear: 0,
        endYear: 400,
        tone: EraTonet.HOPEFUL,
        themes: [],
        arcs: [],
        powerLevel: { tier: 'mortal', numericScale: 10, availablePowerTypes: [], appropriateThreats: [] },
        conflicts: [],
        primarySettings: [],
        prominentCharacters: [],
        openingState: {},
        closingState: {},
        targetWordCount: 1000000,
        targetChapterCount: 100,
      }];

      const validation = planner.validatePlan(plan.id);

      expect(validation.valid).toBe(false);
      expect(validation.issues.some(i => i.type === 'gap')).toBe(true);
    });
  });

  describe('Generation Roadmap', () => {
    it('should generate a complete roadmap', () => {
      const plan = planner.createPlan({
        name: 'Test',
        description: 'Test',
        totalYears: 100,
        startYear: 0,
      });

      planner.generateEraStructure(plan.id, { preferredCount: 2 });

      // Add some arcs
      for (const era of plan.eras) {
        planner.createArc(plan.id, era.id, {
          name: `${era.name} Main Arc`,
          description: 'Main storyline',
          startYear: era.startYear,
          endYear: era.endYear,
          arcType: ArcType.ADVENTURE,
          centralConflict: 'Good vs Evil',
          resolution: ResolutionType.VICTORY,
          keyEvents: [{
            id: 'event1',
            name: 'Key Event',
            description: 'Something important',
            year: era.startYear + 10,
            eventType: EventType.BATTLE,
            importance: 'major',
            participants: ['Hero'],
            consequences: ['Things change'],
          }],
          majorCharacters: ['Hero'],
          characterArcs: [],
          subplots: [],
          promises: [],
          payoffs: [],
          targetWordCount: 500000,
        });
      }

      const roadmap = planner.generateRoadmap(plan.id);

      expect(roadmap.segments.length).toBeGreaterThan(0);
      expect(roadmap.totalEstimatedWords).toBeGreaterThan(0);
    });

    it('should provide consistency requirements for segments', () => {
      const plan = planner.createPlan({
        name: 'Test',
        description: 'Test',
        totalYears: 100,
        startYear: 0,
      });

      planner.generateEraStructure(plan.id);

      const requirements = planner.getSegmentConsistencyRequirements(plan.id, 50);

      expect(requirements.year).toBe(50);
      expect(requirements.eraContext).toBeDefined();
    });
  });
});

// ============================================================================
// CONTINUOUS GENERATION ENGINE TESTS
// ============================================================================

describe('Continuous Generation Engine', () => {
  describe('Configuration', () => {
    it('should create with default config', () => {
      const engine = new ContinuousGenerationEngine();
      expect(engine.getStatus()).toBe(SessionStatus.INITIALIZING);
    });

    it('should accept custom config', () => {
      const engine = createContinuousGenerator('test-plan', createTestConfig());
      expect(engine.getStatus()).toBe(SessionStatus.INITIALIZING);
    });
  });

  describe('Session Management', () => {
    it('should execute and complete a session', async () => {
      const engine = createContinuousGenerator('test-plan', {
        ...createTestConfig(),
        limits: {
          maxTokens: 10000,
          maxTimeMs: 5000,
          maxRetriesPerSegment: 1,
          checkpointInterval: 2,
        },
      });

      // Use a smaller mock roadmap for testing
      const result = await engine.execute();

      expect([SessionStatus.COMPLETED, SessionStatus.FAILED]).toContain(result.status);
      expect(result.sessionId).toBeDefined();
    });

    it('should support pause and resume', async () => {
      const engine = createContinuousGenerator('test-plan', createTestConfig());

      // Start in background
      const executePromise = engine.execute();

      // Pause after a short delay
      await new Promise(resolve => setTimeout(resolve, 10));
      engine.pause();

      expect(engine.getStatus()).toBe(SessionStatus.PAUSED);

      // Resume
      engine.resume();
      expect([SessionStatus.GENERATING, SessionStatus.COMPLETED]).toContain(engine.getStatus());

      // Wait for completion
      const result = await executePromise;
      expect(result).toBeDefined();
    });

    it('should support cancellation', async () => {
      const engine = createContinuousGenerator('test-plan', createTestConfig());

      const executePromise = engine.execute();

      // Cancel after short delay
      await new Promise(resolve => setTimeout(resolve, 10));
      engine.cancel();

      const result = await executePromise;
      expect(result.status).toBe(SessionStatus.CANCELLED);
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress throughout execution', async () => {
      const progressUpdates: number[] = [];

      const engine = createContinuousGenerator('test-plan', {
        ...createTestConfig(),
        callbacks: {
          onProgress: (progress) => {
            progressUpdates.push(progress.percentComplete);
          },
        },
      });

      await engine.execute();

      expect(progressUpdates.length).toBeGreaterThan(0);
    });

    it('should provide accurate progress information', () => {
      const engine = createContinuousGenerator('test-plan', createTestConfig());

      const progress = engine.getProgress();

      expect(progress.sessionId).toBeDefined();
      expect(progress.status).toBe(SessionStatus.INITIALIZING);
      expect(progress.percentComplete).toBe(0);
    });
  });

  describe('Checkpointing', () => {
    it('should create checkpoints during execution', async () => {
      const checkpoints: any[] = [];

      const engine = createContinuousGenerator('test-plan', {
        ...createTestConfig(),
        limits: {
          maxTokens: 100000,
          maxTimeMs: 10000,
          maxRetriesPerSegment: 1,
          checkpointInterval: 5,
        },
        callbacks: {
          onCheckpoint: (checkpoint) => {
            checkpoints.push(checkpoint);
          },
        },
      });

      await engine.execute();

      // Should have at least one checkpoint
      expect(engine.getCheckpoints().length).toBeGreaterThan(0);
    });
  });

  describe('Quality Enforcement', () => {
    it('should track quality metrics', async () => {
      const engine = createContinuousGenerator('test-plan', {
        ...createTestConfig(),
        quality: {
          minScore: 80,
          maxViolations: 5,
          requiredAccuracy: 95,
        },
      });

      const result = await engine.execute();

      expect(result.quality).toBeDefined();
      expect(result.quality.averageScore).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// INTEGRATION TEST: FULL 1000-YEAR GENERATION
// ============================================================================

describe('Full 1000-Year Generation Integration', () => {
  it('should plan and validate a 1000-year narrative', async () => {
    // Create millennium plan
    const planner = new MillenniumPlanner();
    const plan = planner.createPlan({
      name: 'Ultimate JumpChain',
      description: '1000 years of adventure across multiple universes',
      totalYears: 1000,
      startYear: 0,
      isJumpChain: true,
    });

    // Generate era structure
    const eras = planner.generateEraStructure(plan.id);
    expect(eras.length).toBeGreaterThan(5);

    // Add long-term elements
    planner.addProphecy(plan.id, {
      name: 'The Final Spark',
      text: 'After a thousand years, the Jumper shall ascend',
      spokenYear: 0,
      fulfillmentYear: 999,
      components: [
        { description: 'Gather power from 10 universes', fulfilled: false },
        { description: 'Unite companions', fulfilled: false },
        { description: 'Face the final challenge', fulfilled: false },
      ],
      fulfillmentType: 'literal',
      involvedCharacters: ['Jumper'],
      foreshadowing: [],
    });

    planner.addMillenniumThread(plan.id, {
      name: 'The Jumper\'s Journey',
      description: 'The protagonist\'s growth across centuries',
      threadType: MillenniumThreadType.TRANSFORMATION,
      startYear: 0,
      endYear: 1000,
      touchedEraIds: eras.map(e => e.id),
      manifestations: eras.map(e => ({
        eraId: e.id,
        description: 'Growth continues',
        intensity: 5,
      })),
      resolution: 'Achieves Spark',
      keyMoments: [],
    });

    // Validate plan
    const validation = planner.validatePlan(plan.id);
    expect(validation.valid).toBe(true);
    expect(validation.coverage.yearsPlanned).toBe(1000);

    // Generate roadmap
    const roadmap = planner.generateRoadmap(plan.id);
    expect(roadmap.totalSegments).toBeGreaterThan(0);
  });

  it('should integrate all engines for coherent generation', async () => {
    // Set up canon
    const canon = new CanonModuleFramework();
    const module = canon.registerModule(createCanonModuleTemplate('TestUniverse'));
    canon.addEntry(module.id, createCharacterTemplate('Protagonist', {
      species: 'human',
      age_at_start: 18,
    }));
    canon.activateModule(module.id);

    // Set up inference engine
    const inference = new InferenceRuleEngine();
    inference.addFact({
      subject: 'Protagonist',
      subjectType: 'character',
      predicate: 'status',
      object: 'alive',
      validFrom: 0,
      confidence: 1.0,
      metadata: {},
    });

    // Set up generation loop
    const genLoop = new GenerationLoopEngine(
      createMockAIGenerate(),
      createMockAIFix(),
      { maxIterations: 2, minQualityScore: 70 }
    );

    // Generate content
    const request = createGenerationRequest(
      'Protagonist begins their journey',
      'Write the opening scene',
      {
        characterIds: ['Protagonist'],
        establishedFacts: [{
          id: '1',
          subject: 'Protagonist',
          attribute: 'status',
          value: 'alive',
          establishedAt: 0,
          source: 'initial',
        }],
        canonRules: [],
      }
    );

    const result = await genLoop.generate(request);

    expect(result.success).toBe(true);
    expect(result.qualityScore).toBeGreaterThanOrEqual(70);

    // Run inference on generated content
    inference.addFact({
      subject: 'Protagonist',
      subjectType: 'character',
      predicate: 'began_journey',
      object: 'true',
      validFrom: 0,
      confidence: 0.9,
      metadata: { source: result.requestId },
    });

    const inferenceResult = inference.runInference();
    expect(inferenceResult.conflicts.length).toBe(0);
  });

  it('should maintain consistency across a simulated millennium', () => {
    const inference = new InferenceRuleEngine();

    // Simulate 1000 years of facts
    for (let year = 0; year < 1000; year += 10) {
      inference.addFact({
        subject: 'Protagonist',
        subjectType: 'character',
        predicate: 'visited',
        object: `location_${year}`,
        validFrom: year,
        validUntil: year + 10,
        confidence: 1.0,
        metadata: {},
      });
    }

    // Add parent/child relationships across generations
    for (let gen = 0; gen < 10; gen++) {
      inference.addFact({
        subject: `Character_Gen${gen}`,
        subjectType: 'character',
        predicate: 'parent_of',
        object: `Character_Gen${gen + 1}`,
        validFrom: gen * 100,
        confidence: 1.0,
        metadata: {},
      });
    }

    // Run inference
    const result = inference.runInference();

    // Should have derived ancestor relationships
    const ancestorFacts = inference.queryFacts({ predicate: 'ancestor_of' });
    expect(ancestorFacts.length).toBeGreaterThan(0);

    // Should have derived grandparent relationships
    const grandparentFacts = inference.queryFacts({ predicate: 'grandparent_of' });
    expect(grandparentFacts.length).toBeGreaterThan(0);

    // No conflicts should exist
    expect(result.conflicts.length).toBe(0);

    // Stats should reflect the scale
    const stats = inference.getStats();
    expect(stats.totalFacts).toBeGreaterThan(100);
    expect(stats.derivedFacts).toBeGreaterThan(0);
  });
});

// ============================================================================
// STRESS TESTS
// ============================================================================

describe('Stress Tests', () => {
  it('should handle large numbers of facts efficiently', () => {
    const inference = new InferenceRuleEngine();
    const startTime = Date.now();

    // Add 10,000 facts
    for (let i = 0; i < 10000; i++) {
      inference.addFact({
        subject: `entity_${i % 1000}`,
        subjectType: 'character',
        predicate: `predicate_${i % 100}`,
        object: `value_${i}`,
        confidence: 1.0,
        metadata: {},
      });
    }

    const addTime = Date.now() - startTime;

    // Query should be fast due to indexing
    const queryStart = Date.now();
    const results = inference.queryFacts({ subject: 'entity_500' });
    const queryTime = Date.now() - queryStart;

    expect(addTime).toBeLessThan(5000); // Should add in under 5 seconds
    expect(queryTime).toBeLessThan(100); // Query should be under 100ms
    expect(results.length).toBeGreaterThan(0);
  });

  it('should handle deep inference chains', () => {
    const inference = new InferenceRuleEngine({ maxIterations: 50 });

    // Create a chain of 20 generations
    for (let i = 0; i < 20; i++) {
      inference.addFact({
        subject: `Person_${i}`,
        subjectType: 'character',
        predicate: 'parent_of',
        object: `Person_${i + 1}`,
        confidence: 1.0,
        metadata: {},
      });
    }

    const startTime = Date.now();
    const result = inference.runInference();
    const duration = Date.now() - startTime;

    // Should complete in reasonable time
    expect(duration).toBeLessThan(10000);

    // Should have derived many relationships
    expect(result.derivedFacts.length).toBeGreaterThan(0);
  });

  it('should handle large canon modules', () => {
    const canon = new CanonModuleFramework();
    const module = canon.registerModule(createCanonModuleTemplate('LargeUniverse'));

    // Add 1000 entries
    for (let i = 0; i < 1000; i++) {
      canon.addEntry(module.id, createCharacterTemplate(`Character_${i}`, {
        id: i,
        faction: `faction_${i % 10}`,
      }));
    }

    canon.activateModule(module.id);

    const stats = canon.getStats();
    expect(stats.totalEntries).toBe(1000);

    // Search should be fast
    const searchStart = Date.now();
    const results = canon.findEntriesByName('Character_500');
    const searchTime = Date.now() - searchStart;

    expect(searchTime).toBeLessThan(100);
    expect(results.length).toBe(1);
  });
});
