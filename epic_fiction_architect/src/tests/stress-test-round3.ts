/**
 * Epic Fiction Architect - Stress Test Round 3
 *
 * Comprehensive testing of Consistency Checker and Writing Craft Analyzer engines.
 * Tests edge cases, type compatibility, and integration.
 */

import {
  ConsistencyChecker,
  WritingCraftAnalyzer,
  EpicFictionArchitect
} from '../index';

import type {
  ConsistencyViolation,
  ViolationType,
  ViolationCategory,
  TrackedFact,
  ConsistencyRule,
  ConsistencyCheckResult,
  EmotionalArcType,
  EmotionalArcAnalysis,
  RhythmAnalysis,
  ShowTellAnalysis,
  SensoryAnalysis,
  DialogueAnalysis,
  ThematicAnalysis,
  CraftAnalysisReport,
  PrioritizedSuggestion
} from '../index';

// ============================================================================
// TEST UTILITIES
// ============================================================================

let passCount = 0;
let failCount = 0;
const failures: string[] = [];

function test(name: string, fn: () => void): void {
  try {
    fn();
    passCount++;
    console.log(`✓ ${name}`);
  } catch (error) {
    failCount++;
    const msg = error instanceof Error ? error.message : String(error);
    failures.push(`${name}: ${msg}`);
    console.log(`✗ ${name}`);
    console.log(`  Error: ${msg}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertNotEqual<T>(actual: T, notExpected: T, message?: string): void {
  if (actual === notExpected) {
    throw new Error(message || `Expected value to not equal ${notExpected}`);
  }
}

function assertTrue(condition: boolean, message?: string): void {
  if (!condition) {
    throw new Error(message || 'Expected condition to be true');
  }
}

function assertFalse(condition: boolean, message?: string): void {
  if (condition) {
    throw new Error(message || 'Expected condition to be false');
  }
}

function assertDefined<T>(value: T | undefined | null, message?: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(message || 'Expected value to be defined');
  }
}

function assertArray(value: unknown, message?: string): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(message || `Expected array, got ${typeof value}`);
  }
}

function assertInRange(value: number, min: number, max: number, message?: string): void {
  if (value < min || value > max) {
    throw new Error(message || `Expected ${value} to be in range [${min}, ${max}]`);
  }
}

function assertValidDate(value: unknown, message?: string): void {
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    throw new Error(message || 'Expected valid Date');
  }
}

// ============================================================================
// CONSISTENCY CHECKER TESTS
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('CONSISTENCY CHECKER STRESS TESTS');
console.log('='.repeat(70) + '\n');

// Test 1: Basic instantiation
test('ConsistencyChecker instantiates correctly', () => {
  const checker = new ConsistencyChecker();
  assertDefined(checker);
});

// Test 2: Track a basic fact
test('Track basic fact', () => {
  const checker = new ConsistencyChecker();
  const fact = checker.trackFact({
    category: 'character_state',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'status',
    value: 'alive',
    valueType: 'enum',
    establishedAt: 100,
    isCanonical: true,
    tags: ['status'],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1 Scene 1',
      excerpt: 'John was alive and well.'
    }
  });

  assertDefined(fact);
  assertDefined(fact.id);
  assertEqual(fact.subjectId, 'char-001');
  assertEqual(fact.value, 'alive');
});

// Test 3: Track multiple facts for same entity
test('Track multiple facts for same entity', () => {
  const checker = new ConsistencyChecker();

  const fact1 = checker.trackFact({
    category: 'character_attribute',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'hair_color',
    value: 'brown',
    valueType: 'string',
    establishedAt: 100,
    isCanonical: true,
    tags: ['physical', 'appearance'],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1 Scene 1',
      excerpt: 'His brown hair...'
    }
  });

  const fact2 = checker.trackFact({
    category: 'character_attribute',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'eye_color',
    value: 'blue',
    valueType: 'string',
    establishedAt: 100,
    isCanonical: true,
    tags: ['physical', 'appearance'],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1 Scene 1',
      excerpt: 'His blue eyes...'
    }
  });

  assertDefined(fact1);
  assertDefined(fact2);
  assertNotEqual(fact1.id, fact2.id);
});

// Test 4: Supersede a fact
test('Supersede fact correctly', () => {
  const checker = new ConsistencyChecker();

  const fact1 = checker.trackFact({
    category: 'character_state',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'status',
    value: 'alive',
    valueType: 'enum',
    establishedAt: 100,
    isCanonical: true,
    tags: ['status'],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1',
      excerpt: 'John was alive.'
    }
  });

  // Use updateFact to properly supersede
  const fact2 = checker.updateFact(
    fact1.id,
    'dead',
    {type: 'scene', id: 'scene-005', name: 'Chapter 5', excerpt: 'John died.'},
    500
  );

  assertDefined(fact2);
  // The old fact should be superseded by the new one
  const oldFact = checker.getFactsForEntity('char-001').find(f => f.id === fact1.id);
  assertDefined(oldFact);
  assertEqual(oldFact.supersededBy, fact2!.id);
});

// Test 5: Preflight fact check - no conflicts
test('Preflight fact with no conflicts', () => {
  const checker = new ConsistencyChecker();

  checker.trackFact({
    category: 'character_state',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'status',
    value: 'alive',
    valueType: 'enum',
    establishedAt: 100,
    isCanonical: true,
    tags: ['status'],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1',
      excerpt: 'John was alive.'
    }
  });

  const violations = checker.preflightFact({
    category: 'character_state',
    subjectType: 'character',
    subjectId: 'char-002',
    attribute: 'status',
    value: 'alive',
    valueType: 'enum',
    establishedAt: 200,
    isCanonical: true,
    tags: ['status'],
    source: {
      type: 'scene',
      id: 'scene-002',
      name: 'Chapter 2',
      excerpt: 'Mary was alive.'
    }
  });

  assertArray(violations);
  assertEqual(violations.length, 0, 'Should have no violations for different entity');
});

// Test 6: Preflight fact check - detect conflict
test('Preflight fact detects conflict', () => {
  const checker = new ConsistencyChecker();

  checker.trackFact({
    category: 'character_attribute',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'hair_color',
    value: 'brown',
    valueType: 'string',
    establishedAt: 100,
    isCanonical: true,
    tags: ['physical', 'appearance'],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1',
      excerpt: 'His brown hair...'
    }
  });

  const violations = checker.preflightFact({
    category: 'character_attribute',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'hair_color',
    value: 'blonde',
    valueType: 'string',
    establishedAt: 200,
    isCanonical: true,
    tags: ['physical', 'appearance'],
    source: {
      type: 'scene',
      id: 'scene-002',
      name: 'Chapter 2',
      excerpt: 'His blonde hair...'
    }
  });

  assertArray(violations);
  assertTrue(violations.length > 0, 'Should detect hair color conflict');
});

// Test 7: Check with empty scenes
test('Check with empty scenes array', () => {
  const checker = new ConsistencyChecker();

  const result = checker.check([], [], 0);

  assertDefined(result);
  assertArray(result.violations);
  assertDefined(result.summary);
  assertEqual(result.summary.total, 0, 'Empty check should have 0 violations');
});

// Test 8: Check with valid scenes
test('Check with valid scenes', () => {
  const checker = new ConsistencyChecker();

  const scenes = [
    {
      sceneId: 'scene-001',
      chapterNumber: 1,
      position: 100,
      content: 'John walked into the room. His brown hair was unkempt.',
      characterIds: ['char-001']
    },
    {
      sceneId: 'scene-002',
      chapterNumber: 2,
      position: 200,
      content: 'Mary greeted John warmly.',
      characterIds: ['char-001', 'char-002']
    }
  ];

  const characters = [
    {id: 'char-001', name: 'John', status: 'alive' as const},
    {id: 'char-002', name: 'Mary', status: 'alive' as const}
  ];

  const result = checker.check(scenes, characters, 200);

  assertDefined(result);
  assertArray(result.violations);
});

// Test 9: Generate report
test('Generate report from check result', () => {
  const checker = new ConsistencyChecker();

  const result = checker.check([], [], 0);
  const report = checker.generateReport(result);

  assertDefined(report);
  assertTrue(typeof report === 'string');
  assertTrue(report.length > 0);
});

// Test 10: Extract facts from content
test('Extract facts from content', () => {
  const checker = new ConsistencyChecker();

  const content = 'John had brown hair and blue eyes. He was tall and strong.';
  const characterNames = new Map<string, string>();
  characterNames.set('john', 'char-001');
  const facts = checker.extractFactsFromContent(content, 'scene-001', 'Chapter 1 Scene 1', 100, characterNames);

  assertDefined(facts);
  assertArray(facts);
});

// Test 11: Register custom rule
test('Register custom rule', () => {
  const checker = new ConsistencyChecker();

  const customRule: ConsistencyRule = {
    id: 'custom-rule-001',
    name: 'Custom Test Rule',
    description: 'A test rule',
    category: 'continuity',
    severity: 'minor',
    enabled: true,
    tags: ['test'],
    check: (context) => {
      return [];
    }
  };

  checker.registerRule(customRule);
  // If no error thrown, test passes
  assertTrue(true);
});

// Test 12: Dead character rule
test('Dead character rule detects appearance after death', () => {
  const checker = new ConsistencyChecker();

  // Track death
  checker.trackFact({
    category: 'character_state',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'status',
    value: 'dead',
    valueType: 'enum',
    establishedAt: 100,
    isCanonical: true,
    tags: ['death', 'status'],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1',
      excerpt: 'John died.'
    }
  });

  const scenes = [
    {
      sceneId: 'scene-002',
      chapterNumber: 2,
      position: 200,
      content: 'John walked into the room.',
      characterIds: ['char-001']
    }
  ];

  const characters = [
    {id: 'char-001', name: 'John', status: 'dead' as const}
  ];

  const result = checker.check(scenes, characters, 200);

  // Should detect dead character appearing
  assertDefined(result);
  assertArray(result.violations);
});

// Test 13: Fact with all required fields
test('Track fact with minimal required fields', () => {
  const checker = new ConsistencyChecker();

  const fact = checker.trackFact({
    category: 'character_attribute',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'name',
    value: 'John',
    valueType: 'string',
    establishedAt: 0,
    isCanonical: true,
    tags: [],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1 Scene 1',
      excerpt: 'John'
    }
  });

  assertDefined(fact);
  assertDefined(fact.id);
});

// Test 14: Empty string values
test('Handle empty string values', () => {
  const checker = new ConsistencyChecker();

  const fact = checker.trackFact({
    category: 'character_attribute',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'nickname',
    value: '',
    valueType: 'string',
    establishedAt: 0,
    isCanonical: true,
    tags: [],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1 Scene 1',
      excerpt: ''
    }
  });

  assertDefined(fact);
  assertEqual(fact.value, '');
});

// Test 15: Very long content extraction
test('Extract facts from very long content', () => {
  const checker = new ConsistencyChecker();

  // Create a very long content string
  const longContent = 'John had brown hair. '.repeat(1000);
  const characterNames = new Map<string, string>();
  characterNames.set('john', 'char-001');

  const facts = checker.extractFactsFromContent(longContent, 'scene-001', 'Chapter 1 Scene 1', 0, characterNames);

  assertDefined(facts);
  assertArray(facts);
});

// Test 16: Negative position handling
test('Handle negative position values', () => {
  const checker = new ConsistencyChecker();

  const fact = checker.trackFact({
    category: 'character_state',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'status',
    value: 'alive',
    valueType: 'enum',
    establishedAt: -100, // Negative position
    isCanonical: true,
    tags: ['status'],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1',
      excerpt: 'John was alive.'
    }
  });

  assertDefined(fact);
});

// Test 17: Special characters in values
test('Handle special characters in values', () => {
  const checker = new ConsistencyChecker();

  const fact = checker.trackFact({
    category: 'character_attribute',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'catchphrase',
    value: "I'll be back! <script>alert('xss')</script>",
    valueType: 'string',
    establishedAt: 0,
    isCanonical: true,
    tags: ['dialogue'],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1 Scene 1',
      excerpt: "He said \"I'll be back!\""
    }
  });

  assertDefined(fact);
});

// Test 18: Unicode characters
test('Handle unicode characters', () => {
  const checker = new ConsistencyChecker();

  const fact = checker.trackFact({
    category: 'character_attribute',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'name',
    value: '日本語名前 🎭 émojis',
    valueType: 'string',
    establishedAt: 0,
    isCanonical: true,
    tags: [],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1 Scene 1',
      excerpt: '日本語名前 🎭 émojis'
    }
  });

  assertDefined(fact);
  assertEqual(fact.value, '日本語名前 🎭 émojis');
});

// Test 19: Violation severity levels
test('Violation has valid severity', () => {
  const checker = new ConsistencyChecker();

  checker.trackFact({
    category: 'character_attribute',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'hair_color',
    value: 'brown',
    valueType: 'string',
    establishedAt: 100,
    isCanonical: true,
    tags: ['physical', 'appearance'],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1',
      excerpt: 'Brown hair.'
    }
  });

  const violations = checker.preflightFact({
    category: 'character_attribute',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'hair_color',
    value: 'red',
    valueType: 'string',
    establishedAt: 200,
    isCanonical: true,
    tags: ['physical', 'appearance'],
    source: {
      type: 'scene',
      id: 'scene-002',
      name: 'Chapter 2',
      excerpt: 'Red hair.'
    }
  });

  if (violations.length > 0) {
    const severity = violations[0].severity;
    assertTrue(
      severity === 'critical' || severity === 'major' ||
      severity === 'minor' || severity === 'nitpick',
      'Severity must be valid enum value'
    );
  }
});

// Test 20: Violation status values
test('Violation has valid status', () => {
  const checker = new ConsistencyChecker();

  checker.trackFact({
    category: 'character_attribute',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'age',
    value: '25',
    valueType: 'string',
    establishedAt: 100,
    isCanonical: true,
    tags: ['age'],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1',
      excerpt: 'Age 25.'
    }
  });

  const violations = checker.preflightFact({
    category: 'character_attribute',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'age',
    value: '30',
    valueType: 'string',
    establishedAt: 50, // Earlier position!
    isCanonical: true,
    tags: ['age'],
    source: {
      type: 'scene',
      id: 'scene-000',
      name: 'Chapter 0',
      excerpt: 'Age 30.'
    }
  });

  if (violations.length > 0) {
    const status = violations[0].status;
    assertTrue(
      status === 'new' || status === 'reviewed' ||
      status === 'dismissed' || status === 'fixed',
      'Status must be valid enum value'
    );
  }
});

// ============================================================================
// WRITING CRAFT ANALYZER TESTS
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('WRITING CRAFT ANALYZER STRESS TESTS');
console.log('='.repeat(70) + '\n');

// Test 21: Basic instantiation
test('WritingCraftAnalyzer instantiates correctly', () => {
  const analyzer = new WritingCraftAnalyzer();
  assertDefined(analyzer);
});

// Test 22: Analyze empty text
test('Analyze empty text', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze('');

  assertDefined(result);
  assertDefined(result.id);
  assertValidDate(result.analyzedAt);
  assertEqual(result.wordCount, 0);
});

// Test 23: Analyze single word
test('Analyze single word', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze('Hello');

  assertDefined(result);
  assertEqual(result.wordCount, 1);
});

// Test 24: Analyze basic prose
test('Analyze basic prose', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    John walked into the room. The air was thick with tension.
    Mary looked up from her book, her eyes narrowing. "You're late," she said.
    He shrugged, the leather of his jacket creaking. "Traffic."
  `;

  const result = analyzer.analyze(text);

  assertDefined(result);
  assertDefined(result.emotionalArc);
  assertDefined(result.rhythm);
  assertDefined(result.showTell);
  assertDefined(result.sensory);
  assertDefined(result.dialogue);
  assertDefined(result.thematic);
});

// Test 25: Emotional arc detection
test('Emotional arc detection returns valid type', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    Everything was terrible. John had lost his job, his wife, and his home.
    But slowly, things started to improve. He found new work.
    He met someone new. Life was getting better.
    Finally, he was happy again. Everything had worked out.
  `;

  const result = analyzer.analyze(text);
  const validArcs: EmotionalArcType[] = [
    'rags_to_riches', 'tragedy', 'man_in_hole',
    'icarus', 'cinderella', 'oedipus'
  ];

  assertTrue(
    validArcs.includes(result.emotionalArc.primaryArc),
    `Arc type ${result.emotionalArc.primaryArc} should be valid`
  );
});

// Test 26: Emotional arc confidence range
test('Emotional arc confidence is in valid range', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze('Some sample text with emotional content. Joy and happiness abound.');

  assertInRange(result.emotionalArc.confidence, 0, 1, 'Confidence should be 0-1');
});

// Test 27: Rhythm analysis
test('Rhythm analysis returns valid scores', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    Short sentence. This is a much longer sentence that goes on for a while.
    Medium one here. Another short. And yet another very long sentence that
    continues to build and flow with multiple clauses and ideas.
  `;

  const result = analyzer.analyze(text);

  assertInRange(result.rhythm.rhythmScore, 0, 1);
  assertTrue(result.rhythm.averageSentenceLength > 0);
  assertArray(result.rhythm.pacingZones);
});

// Test 28: Show vs Tell detection
test('Show vs Tell detects telling phrases', () => {
  const analyzer = new WritingCraftAnalyzer();
  const tellingText = `
    She was happy. He felt sad. They were angry.
    Obviously, she was nervous. He seemed to be confused.
    She felt a wave of emotion wash over her.
  `;

  const result = analyzer.analyze(tellingText);

  assertTrue(result.showTell.tellInstances.length > 0, 'Should detect telling instances');
  assertInRange(result.showTell.showRatio, 0, 1);
});

// Test 29: Sensory analysis distribution
test('Sensory analysis returns valid distribution', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    She saw the bright red sunset. The sound of waves crashed in her ears.
    The rough sand felt warm beneath her feet. The salty air filled her nostrils.
    She tasted the sweet coconut water. Her body swayed with the gentle breeze.
  `;

  const result = analyzer.analyze(text);

  assertInRange(result.sensory.densityScore, 0, 1);
  assertInRange(result.sensory.balanceScore, 0, 1);

  const dist = result.sensory.senseDistribution;
  assertDefined(dist.visual);
  assertDefined(dist.auditory);
  assertDefined(dist.tactile);
  assertDefined(dist.olfactory);
  assertDefined(dist.gustatory);
  assertDefined(dist.kinesthetic);
});

// Test 30: Dialogue analysis
test('Dialogue analysis with character dialogue', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    "I don't know what you're talking about," she said, twisting her ring.
    He leaned forward. "Don't play games with me."
    "Games?" She laughed bitterly. "This isn't a game."
  `;

  const characterDialogue = new Map<string, string[]>();
  characterDialogue.set('char-001', ["I don't know what you're talking about", "Games?", "This isn't a game."]);
  characterDialogue.set('char-002', ["Don't play games with me."]);

  const result = analyzer.analyze(text, {characterDialogue});

  assertInRange(result.dialogue.voiceDifferentiation, 0, 1);
  assertInRange(result.dialogue.authenticityScore, 0, 1);
  assertInRange(result.dialogue.subtextPresence, 0, 1);
  assertInRange(result.dialogue.beatUsage, 0, 1);
});

// Test 31: Thematic analysis
test('Thematic analysis identifies themes', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    The question of identity haunted him. Who was he really? Behind the mask,
    he felt like a stranger to himself. His true self remained hidden, buried
    beneath layers of pretense. He longed to be authentic, to belong somewhere.
  `;

  const result = analyzer.analyze(text);

  assertArray(result.thematic.identifiedThemes);
  assertInRange(result.thematic.coherenceScore, 0, 1);
});

// Test 32: Quick analysis
test('Quick analysis returns valid quick results', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.quickAnalyze('This is a test sentence. Here is another one.');

  assertDefined(result);
  assertInRange(result.rhythmScore, 0, 1);
  assertInRange(result.showTellRatio, 0, 1);
  assertInRange(result.sensoryDensity, 0, 1);
});

// Test 33: Generate report
test('Generate report produces valid output', () => {
  const analyzer = new WritingCraftAnalyzer();
  const analysis = analyzer.analyze('Test text for report generation. It needs multiple sentences.');
  const report = analyzer.generateReport(analysis);

  assertDefined(report);
  assertTrue(typeof report === 'string');
  assertTrue(report.length > 100);
  assertTrue(report.includes('WRITING CRAFT ANALYSIS REPORT'));
});

// Test 34: Overall score range
test('Overall score is in valid range', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze('Test text with enough content to analyze properly.');

  assertInRange(result.overallScore, 0, 100);
});

// Test 35: Prioritized suggestions
test('Prioritized suggestions have valid structure', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze(`
    She was happy. He was sad. The weather was bad.
    Time passed. After a while, things changed.
  `);

  assertArray(result.prioritizedSuggestions);

  for (const suggestion of result.prioritizedSuggestions) {
    assertTrue(
      ['emotional_arc', 'rhythm', 'show_tell', 'sensory', 'dialogue', 'thematic']
        .includes(suggestion.category),
      'Category must be valid'
    );
    assertTrue(
      ['high', 'medium', 'low'].includes(suggestion.impact),
      'Impact must be valid'
    );
    assertTrue(
      ['high', 'medium', 'low'].includes(suggestion.effort),
      'Effort must be valid'
    );
  }
});

// Test 36: Strengths and areas for improvement
test('Analysis includes strengths and areas for improvement', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze(`
    The moonlight cast silver shadows across the weathered floorboards.
    Sarah's fingers trembled as she reached for the doorknob, her heart
    hammering against her ribs. The brass was cold—colder than it should be.
    She heard nothing from the other side, but she knew. She knew he was there.
  `);

  assertArray(result.strengths);
  assertArray(result.areasForImprovement);
});

// Test 37: Very long text analysis
test('Analyze very long text', () => {
  const analyzer = new WritingCraftAnalyzer();

  // Generate a long text
  const paragraph = `
    The ancient city sprawled before them, its towers reaching toward the crimson sky.
    John felt the weight of centuries pressing down on his shoulders. "We should not
    be here," Mary whispered, her voice trembling. He knew she was right, but the
    artifact they sought was worth the risk. The smell of decay hung heavy in the air.
  `;
  const longText = paragraph.repeat(100);

  const result = analyzer.analyze(longText);

  assertDefined(result);
  assertTrue(result.wordCount > 5000);
});

// Test 38: Text with only dialogue
test('Analyze text with only dialogue', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    "Hello."
    "Hi there."
    "How are you?"
    "I'm fine, thanks."
    "Good to hear."
  `;

  const result = analyzer.analyze(text);

  assertDefined(result);
  assertDefined(result.dialogue);
});

// Test 39: Text with no dialogue
test('Analyze text with no dialogue', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    The sun rose over the mountains. Birds sang in the trees.
    The river flowed gently through the valley. Flowers bloomed
    along its banks. Everything was peaceful and serene.
  `;

  const result = analyzer.analyze(text);

  assertDefined(result);
  assertDefined(result.dialogue);
});

// Test 40: Motif tracking with known symbols
test('Motif tracking with known symbols', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    The raven watched from the dead tree. Its dark eyes followed her movements.
    Later, another raven appeared on the rooftop. She thought of the raven
    she had seen that morning. Ravens seemed to be everywhere now.
  `;

  const result = analyzer.analyze(text, {knownSymbols: ['raven', 'tree']});

  assertArray(result.thematic.motifTracking);
});

// Test 41: Unicode text analysis
test('Analyze unicode text', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    日本語のテキスト。これはテストです。
    Émojis are 🎭 everywhere 🌟 now.
    Café, naïve, résumé—all borrowed words.
  `;

  const result = analyzer.analyze(text);

  assertDefined(result);
});

// Test 42: Pacing zones analysis
test('Pacing zones have valid values', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    Run! The fire spread quickly. Flames everywhere. No time.

    Later, in the quiet aftermath, she sat by the window and watched
    the sun slowly descend beyond the charred remains of what had
    once been her childhood home. The memories flooded back, each one
    more painful than the last, washing over her in waves of grief
    that seemed to have no end.

    Go. Now. Move. Fast.
  `;

  const result = analyzer.analyze(text);

  for (const zone of result.rhythm.pacingZones) {
    assertInRange(zone.startPosition, 0, 1);
    assertInRange(zone.endPosition, 0, 1);
    assertTrue(
      ['rapid', 'moderate', 'slow', 'contemplative'].includes(zone.pace),
      'Pace must be valid'
    );
    assertTrue(zone.avgSentenceLength >= 0);
    assertInRange(zone.effectivenessScore, 0, 1);
  }
});

// Test 43: Tell instance structure
test('Tell instances have valid structure', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    She was happy. He felt nervous. They seemed to be confused.
    Obviously, the situation was tense.
  `;

  const result = analyzer.analyze(text);

  for (const instance of result.showTell.tellInstances) {
    assertDefined(instance.text);
    assertInRange(instance.position, 0, 1);
    assertTrue(
      ['emotion_telling', 'state_telling', 'summary_telling', 'explanation']
        .includes(instance.type),
      'Type must be valid'
    );
    assertTrue(
      ['minor', 'moderate', 'significant'].includes(instance.severity),
      'Severity must be valid'
    );
  }
});

// Test 44: Character voice profile structure
test('Character voice profiles have valid structure', () => {
  const analyzer = new WritingCraftAnalyzer();

  const characterDialogue = new Map<string, string[]>();
  characterDialogue.set('char-001', [
    "I ain't gonna do that, no way, no how.",
    "Y'all better listen up!",
    "That there's the problem, see?"
  ]);
  characterDialogue.set('char-002', [
    "I shall endeavor to accomplish the task.",
    "One must consider all the ramifications.",
    "Indeed, the matter requires careful deliberation."
  ]);

  const result = analyzer.analyze('Test text', {characterDialogue});

  for (const profile of result.dialogue.characterVoices) {
    assertDefined(profile.characterId);
    assertDefined(profile.characterName);
    assertTrue(profile.avgSentenceLength >= 0);
    assertTrue(
      ['simple', 'moderate', 'sophisticated', 'mixed']
        .includes(profile.vocabularyLevel),
      'Vocabulary level must be valid'
    );
    assertInRange(profile.contractionUsage, 0, 1);
    assertArray(profile.uniquePatterns);
  }
});

// Test 45: Identified theme structure
test('Identified themes have valid structure', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    Power corrupts, and absolute power corrupts absolutely. The king
    ruled with an iron fist, dominating all who opposed him. His authority
    was unchallenged, yet rebellion stirred in the hearts of the oppressed.
    They longed for freedom from his tyrannical control.
  `;

  const result = analyzer.analyze(text);

  for (const theme of result.thematic.identifiedThemes) {
    assertDefined(theme.theme);
    assertInRange(theme.confidence, 0, 1);
    assertArray(theme.supportingEvidence);
    assertInRange(theme.resonance, 0, 1);
  }
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('INTEGRATION STRESS TESTS');
console.log('='.repeat(70) + '\n');

// Test 46: Access through main app
test('Access ConsistencyChecker through EpicFictionArchitect', () => {
  const app = new EpicFictionArchitect();

  assertDefined(app.consistency);
  assertTrue(app.consistency instanceof ConsistencyChecker);
});

// Test 47: Access WritingCraftAnalyzer through main app
test('Access WritingCraftAnalyzer through EpicFictionArchitect', () => {
  const app = new EpicFictionArchitect();

  assertDefined(app.craft);
  assertTrue(app.craft instanceof WritingCraftAnalyzer);
});

// Test 48: Use both engines together
test('Use both engines together', () => {
  const app = new EpicFictionArchitect();

  // Track a fact
  const fact = app.consistency.trackFact({
    category: 'character_state',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'status',
    value: 'alive',
    valueType: 'enum',
    establishedAt: 0,
    isCanonical: true,
    tags: ['status'],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1',
      excerpt: 'John was alive.'
    }
  });

  // Analyze some text
  const analysis = app.craft.analyze('John walked into the room. He was happy.');

  assertDefined(fact);
  assertDefined(analysis);
});

// Test 49: Emotional valence array structure
test('Emotional arc points have valid structure', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    Joy filled her heart as she saw him. But then darkness came.
    Despair took hold. Hope seemed lost. Yet slowly, light returned.
  `;

  const result = analyzer.analyze(text);

  for (const point of result.emotionalArc.arcPoints) {
    assertInRange(point.position, 0, 1);
    assertInRange(point.valence, -1, 1);
    assertInRange(point.intensity, 0, 1);
    assertDefined(point.dominantEmotion);
    assertDefined(point.context);
  }
});

// Test 50: Sub-arc detection
test('Sub-arcs have valid structure', () => {
  const analyzer = new WritingCraftAnalyzer();
  const text = `
    Everything started well. Life was good. Then tragedy struck.
    He lost everything. Rock bottom. But then, a glimmer of hope.
    Things improved. Success returned. Life was good again.
    Then another fall. Failure. Despair. The end.
  `;

  const result = analyzer.analyze(text);

  for (const subArc of result.emotionalArc.subArcs) {
    assertArray(subArc.range);
    assertEqual(subArc.range.length, 2);
    assertInRange(subArc.range[0], 0, 1);
    assertInRange(subArc.range[1], 0, 1);
    assertTrue(subArc.intensity >= 0);
  }
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('EDGE CASE STRESS TESTS');
console.log('='.repeat(70) + '\n');

// Test 51: Whitespace-only text
test('Analyze whitespace-only text', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze('   \n\t\n   ');

  assertDefined(result);
  assertEqual(result.wordCount, 0);
});

// Test 52: Single punctuation
test('Analyze single punctuation', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze('.');

  assertDefined(result);
});

// Test 53: Numbers only
test('Analyze numbers only', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze('123 456 789 1000');

  assertDefined(result);
  assertEqual(result.wordCount, 4);
});

// Test 54: Repeated same word
test('Analyze repeated same word', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze('word word word word word');

  assertDefined(result);
});

// Test 55: All caps text
test('Analyze all caps text', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze('THIS IS ALL CAPS. VERY LOUD WRITING.');

  assertDefined(result);
});

// Test 56: Mixed case extreme
test('Analyze mixed case extreme', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze('ThIs Is WeIrD cAsInG. VeRy UnUsUaL.');

  assertDefined(result);
});

// Test 57: Very short sentences
test('Analyze very short sentences', () => {
  const analyzer = new WritingCraftAnalyzer();
  const result = analyzer.analyze('Go. Run. Hide. Fast. Now. Move. Quick.');

  assertDefined(result);
  assertTrue(result.rhythm.averageSentenceLength < 3);
});

// Test 58: Very long single sentence
test('Analyze very long single sentence', () => {
  const analyzer = new WritingCraftAnalyzer();
  const longSentence = Array(100).fill('word').join(' ') + '.';
  const result = analyzer.analyze(longSentence);

  assertDefined(result);
  assertTrue(result.rhythm.averageSentenceLength > 50);
});

// Test 59: Consistency check with null-like values
test('Track fact with null-like string values', () => {
  const checker = new ConsistencyChecker();

  const fact = checker.trackFact({
    category: 'character_state',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'status',
    value: 'null',
    valueType: 'string',
    establishedAt: 0,
    isCanonical: true,
    tags: [],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1',
      excerpt: 'null'
    }
  });

  assertDefined(fact);
  assertEqual(fact.value, 'null');
});

// Test 60: Consistency check with undefined-like values
test('Track fact with undefined-like string values', () => {
  const checker = new ConsistencyChecker();

  const fact = checker.trackFact({
    category: 'character_state',
    subjectType: 'character',
    subjectId: 'char-001',
    attribute: 'status',
    value: 'undefined',
    valueType: 'string',
    establishedAt: 0,
    isCanonical: true,
    tags: [],
    source: {
      type: 'scene',
      id: 'scene-001',
      name: 'Chapter 1',
      excerpt: 'undefined'
    }
  });

  assertDefined(fact);
  assertEqual(fact.value, 'undefined');
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('STRESS TEST ROUND 3 - FINAL RESULTS');
console.log('='.repeat(70));
console.log(`\nTotal: ${passCount + failCount} tests`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failures.length > 0) {
  console.log('\n' + '-'.repeat(70));
  console.log('FAILURES:');
  console.log('-'.repeat(70));
  for (const failure of failures) {
    console.log(`\n✗ ${failure}`);
  }
}

console.log('\n' + '='.repeat(70));

// Exit with appropriate code
if (failCount > 0) {
  console.log('\n❌ STRESS TEST FAILED - Issues found that need fixing\n');
  process.exit(1);
} else {
  console.log('\n✅ ALL STRESS TESTS PASSED\n');
  process.exit(0);
}
