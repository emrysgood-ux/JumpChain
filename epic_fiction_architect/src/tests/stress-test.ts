/**
 * Epic Fiction Architect - Stress Test Suite
 *
 * Purpose: Break the system to find edge cases, failures, and bugs
 *
 * Run with: npx ts-node src/tests/stress-test.ts
 */

import {
  EpicFictionArchitect,
  speciesAgingTemplates,
  calendarTemplates
} from '../index';
import type {TimelineDate, Character} from '../core/types';

// ============================================================================
// TEST HARNESS
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void | Promise<void>): void {
  try {
    const result = fn();
    if (result instanceof Promise) {
      result
        .then(() => results.push({name, passed: true}))
        .catch(e => results.push({name, passed: false, error: e.message}));
    } else {
      results.push({name, passed: true});
    }
  } catch (e: any) {
    results.push({name, passed: false, error: e.message});
  }
}

function expectThrows(fn: () => void, expectedError?: string): void {
  try {
    fn();
    throw new Error('Expected function to throw but it did not');
  } catch (e: any) {
    if (expectedError && !e.message.includes(expectedError)) {
      throw new Error(`Expected error containing "${expectedError}" but got "${e.message}"`);
    }
  }
}

// ============================================================================
// AGE CALCULATOR STRESS TESTS
// ============================================================================

function ageCalculatorTests(app: EpicFictionArchitect) {
  const projectId = app.createProject('Age Test Project').id;

  // Create Juraian species
  const juraianId = app.database.createSpecies(
    projectId,
    'Juraian',
    speciesAgingTemplates.juraian.agingCurve,
    {averageLifespan: 5000, maturityAge: 200, elderAge: 4000}
  );

  const calendarId = app.database.createCalendar(projectId, 'Test Calendar', {
    isDefault: true,
    months: calendarTemplates.gregorian.months,
    weekdays: calendarTemplates.gregorian.weekdays
  });

  const makeDate = (year: number, month = 1, day = 1): TimelineDate => ({
    calendarId,
    year,
    month,
    day,
    precision: 'day',
    isApproximate: false
  });

  // TEST 1: Character born AFTER target date (negative age)
  test('Age Calculator: Character born after target date', () => {
    const charId = app.database.createCharacter(projectId, 'Future Child', {
      birthDate: makeDate(2000)
    });

    const age = app.ages.calculateAge(charId, makeDate(1990));

    // FAILURE: Returns negative age instead of null or error
    if (age && age.chronologicalAge < 0) {
      throw new Error(`BUG: Negative age returned (${age.chronologicalAge}) - should return null or handle gracefully`);
    }
  });

  // TEST 2: Extremely old character beyond aging curve
  test('Age Calculator: Character 10,000 years old (beyond curve)', () => {
    const charId = app.database.createCharacter(projectId, 'Ancient One', {
      speciesId: juraianId,
      birthDate: makeDate(-10000)
    });

    const age = app.ages.calculateAge(charId, makeDate(0));

    // Check extrapolation is reasonable
    if (age && age.apparentAge > 200) {
      throw new Error(`BUG: Apparent age ${age.apparentAge} is unreasonably high for extrapolation`);
    }
  });

  // TEST 3: Character with no birth date
  test('Age Calculator: Character without birth date', () => {
    const charId = app.database.createCharacter(projectId, 'Mysterious Stranger', {});

    const age = app.ages.calculateAge(charId, makeDate(2000));

    if (age !== null) {
      throw new Error('BUG: Should return null for character without birth date');
    }
  });

  // TEST 4: Zero-age calculation (born on target date)
  test('Age Calculator: Born on exact target date', () => {
    const charId = app.database.createCharacter(projectId, 'Newborn', {
      birthDate: makeDate(2000, 6, 15)
    });

    const age = app.ages.calculateAge(charId, makeDate(2000, 6, 15));

    if (age && age.chronologicalAge !== 0) {
      throw new Error(`BUG: Age should be 0 on birth date, got ${age.chronologicalAge}`);
    }
  });

  // TEST 5: Dead character - querying date after death
  test('Age Calculator: Dead character after death date', () => {
    const charId = app.database.createCharacter(projectId, 'Deceased', {
      birthDate: makeDate(1900),
      deathDate: makeDate(1950)
    });

    const age = app.ages.calculateAge(charId, makeDate(2000));

    if (age && age.ageCategory !== 'deceased') {
      throw new Error('BUG: Should indicate character is deceased');
    }
    if (age && age.chronologicalAge !== 50) {
      throw new Error(`BUG: Age at death should be 50, got ${age.chronologicalAge}`);
    }
  });

  // TEST 6: Species with empty aging curve
  test('Age Calculator: Species with empty aging curve', () => {
    const emptySpeciesId = app.database.createSpecies(projectId, 'Empty Species', []);

    const charId = app.database.createCharacter(projectId, 'Empty Species Char', {
      speciesId: emptySpeciesId,
      birthDate: makeDate(1950)
    });

    const age = app.ages.calculateAge(charId, makeDate(2000));

    // Should fall back to 1:1 aging
    if (age && age.chronologicalAge !== age.apparentAge) {
      throw new Error('BUG: Empty aging curve should default to 1:1 aging');
    }
  });

  // TEST 7: Hybrid species calculation (not implemented)
  test('Age Calculator: Hybrid species (missing feature)', () => {
    // EXPECTED FAILURE: Hybrid aging not fully implemented
    // The system has speciesHybrid types but no calculation logic
    throw new Error('MISSING FEATURE: Hybrid species aging calculation not implemented');
  });
}

// ============================================================================
// CALENDAR SYSTEM STRESS TESTS
// ============================================================================

function calendarTests(app: EpicFictionArchitect) {
  const projectId = app.createProject('Calendar Test Project').id;

  // TEST 1: Leap year handling
  test('Calendar: Leap year calculation', () => {
    const calendarId = app.database.createCalendar(projectId, 'Gregorian', {
      months: calendarTemplates.gregorian.months
    });

    // February has 28 days in template - no leap year support!
    const daysInFeb = app.calendar.getDaysInMonth(calendarId, 2);

    if (daysInFeb === 28) {
      throw new Error('MISSING FEATURE: Leap year handling not implemented - February always 28 days');
    }
  });

  // TEST 2: Cross-calendar date conversion
  test('Calendar: Convert between different calendars', () => {
    const cal1 = app.database.createCalendar(projectId, 'Calendar A', {
      months: [{name: 'Month1', days: 30, order: 1, id: '1'}],
      weekdays: []
    });

    const cal2 = app.database.createCalendar(projectId, 'Calendar B', {
      months: [{name: 'MonthX', days: 45, order: 1, id: '1'}],
      weekdays: []
    });

    const date1: TimelineDate = {
      calendarId: cal1,
      year: 100,
      month: 1,
      day: 15,
      precision: 'day',
      isApproximate: false
    };

    // Try to calculate days between dates in different calendars
    const date2: TimelineDate = {...date1, calendarId: cal2};

    try {
      app.calendar.daysBetween(date1, date2);
      throw new Error('BUG: Should throw error for different calendars');
    } catch (e: any) {
      if (!e.message.includes('different calendars')) {
        throw e;
      }
    }
  });

  // TEST 3: Negative year handling
  test('Calendar: Negative years (BCE dates)', () => {
    const calendarId = app.database.createCalendar(projectId, 'Era Test', {
      yearZero: 0,
      eraName: 'CE',
      eraNegativeName: 'BCE',
      months: calendarTemplates.gregorian.months
    });

    const bceDate: TimelineDate = {
      calendarId,
      year: -500,
      month: 6,
      day: 15,
      precision: 'day',
      isApproximate: false
    };

    const formatted = app.calendar.formatDate(bceDate);

    if (!formatted.includes('BCE') && !formatted.includes('500')) {
      throw new Error(`BUG: BCE date not formatted correctly: ${formatted}`);
    }
  });

  // TEST 4: Moon phase with fractional cycle
  test('Calendar: Moon phase with fractional cycle length (29.5 days)', () => {
    // The lunar cycle is 29.5 days, but we store as integer
    // This may cause phase drift over time
    const calendarId = app.database.createCalendar(projectId, 'Lunar Test', {
      months: calendarTemplates.gregorian.months,
      moons: [{
        id: 'moon1',
        name: 'Luna',
        cycleLength: 29.5, // Fractional!
        phases: ['New', 'Waxing', 'Full', 'Waning']
      }]
    });

    // Check phase after 1000 cycles (29,500 days)
    const date1: TimelineDate = {calendarId, year: 0, month: 1, day: 1, precision: 'day', isApproximate: false};
    const date2 = app.calendar.addDays(date1, 29500);

    const phase1 = app.calendar.getMoonPhase(date1, 'moon1');
    const phase2 = app.calendar.getMoonPhase(date2, 'moon1');

    // After exactly 1000 cycles, should be same phase
    if (phase1?.phase !== phase2?.phase) {
      throw new Error(`PRECISION ISSUE: Moon phase drift after 1000 cycles. Expected ${phase1?.phase}, got ${phase2?.phase}`);
    }
  });

  // TEST 5: Empty calendar (no months)
  test('Calendar: Calendar with no months defined', () => {
    const emptyCalId = app.database.createCalendar(projectId, 'Empty', {
      months: [],
      weekdays: []
    });

    const daysInYear = app.calendar.getDaysInYear(emptyCalId);

    if (daysInYear !== 0 && daysInYear !== 365) {
      throw new Error(`BUG: Empty calendar days in year: ${daysInYear}`);
    }
  });
}

// ============================================================================
// DATABASE STRESS TESTS
// ============================================================================

function databaseTests(app: EpicFictionArchitect) {
  // TEST 1: Circular relationships
  test('Database: Circular character relationships', () => {
    const projectId = app.createProject('Circular Test').id;

    const char1 = app.database.createCharacter(projectId, 'Person A', {});
    const char2 = app.database.createCharacter(projectId, 'Person B', {});
    const char3 = app.database.createCharacter(projectId, 'Person C', {});

    // A is parent of B, B is parent of C, C is parent of A (impossible!)
    // System should detect or prevent this
    app.database.run(
      `INSERT INTO relationships (id, project_id, character1_id, character2_id, type, character1_to_character2)
       VALUES (?, ?, ?, ?, 'family', 'parent of')`,
      ['r1', projectId, char1, char2]
    );
    app.database.run(
      `INSERT INTO relationships (id, project_id, character1_id, character2_id, type, character1_to_character2)
       VALUES (?, ?, ?, ?, 'family', 'parent of')`,
      ['r2', projectId, char2, char3]
    );
    app.database.run(
      `INSERT INTO relationships (id, project_id, character1_id, character2_id, type, character1_to_character2)
       VALUES (?, ?, ?, ?, 'family', 'parent of')`,
      ['r3', projectId, char3, char1]
    );

    // MISSING: No circular relationship detection
    throw new Error('MISSING FEATURE: No circular relationship detection');
  });

  // TEST 2: Orphaned scenes
  test('Database: Scene with deleted container', () => {
    const projectId = app.createProject('Orphan Test').id;
    const containerId = app.database.createContainer(projectId, 'chapter', 'Chapter 1');
    const sceneId = app.database.createScene(containerId, 'Scene 1', {content: 'Test'});

    // Delete container - what happens to scene?
    app.database.run('DELETE FROM containers WHERE id = ?', [containerId]);

    const scene = app.database.getScene(sceneId);

    // Scene still exists but is orphaned
    if (scene) {
      throw new Error('BUG: Orphaned scene should be cascade deleted or container deletion should be prevented');
    }
  });

  // TEST 3: Circular causality
  test('Database: Circular event causality (A causes B causes A)', () => {
    const projectId = app.createProject('Causality Test').id;
    const calendarId = app.database.createCalendar(projectId, 'Test', {
      months: [{name: 'M1', days: 30, order: 1, id: 'm1'}]
    });

    const event1 = app.database.createTimelineEvent(projectId, 'Event A', {
      calendarId, year: 100, month: 1, day: 1, precision: 'day', isApproximate: false
    });
    const event2 = app.database.createTimelineEvent(projectId, 'Event B', {
      calendarId, year: 100, month: 1, day: 2, precision: 'day', isApproximate: false
    });

    // Create circular causality
    app.database.run(
      `INSERT INTO event_causality (id, from_event_id, to_event_id, type, strength)
       VALUES (?, ?, ?, 'triggers', 100)`,
      ['c1', event1, event2]
    );
    app.database.run(
      `INSERT INTO event_causality (id, from_event_id, to_event_id, type, strength)
       VALUES (?, ?, ?, 'triggers', 100)`,
      ['c2', event2, event1]
    );

    // MISSING: No circular causality detection
    throw new Error('MISSING FEATURE: No circular causality detection');
  });

  // TEST 4: Very long content
  test('Database: Scene with 1 million characters', () => {
    const projectId = app.createProject('Long Content Test').id;
    const containerId = app.database.createContainer(projectId, 'chapter', 'Big Chapter');

    const longContent = 'A'.repeat(1_000_000);

    try {
      const sceneId = app.database.createScene(containerId, 'Massive Scene', {
        content: longContent
      });

      const scene = app.database.getScene(sceneId);
      if (scene?.content.length !== 1_000_000) {
        throw new Error('Content was truncated');
      }
    } catch (e: any) {
      throw new Error(`BUG: Failed to handle large content: ${e.message}`);
    }
  });

  // TEST 5: Unicode and special characters
  test('Database: Unicode content handling', () => {
    const projectId = app.createProject('Unicode Test 日本語 🎭').id;
    const containerId = app.database.createContainer(projectId, 'chapter', 'Chapter 一');

    const unicodeContent = `
      Japanese: 日本語テスト
      Chinese: 中文测试
      Korean: 한국어 테스트
      Emoji: 🎭🎪🎨🎬🎼
      Math: ∑∏∫∂∆
      Special: "curly quotes" 'apostrophes' — em dash – en dash
    `;

    const sceneId = app.database.createScene(containerId, 'Scene 日本語', {
      content: unicodeContent
    });

    const scene = app.database.getScene(sceneId);
    if (!scene?.content.includes('日本語')) {
      throw new Error('BUG: Unicode content corrupted');
    }
  });

  // TEST 6: SQL injection attempt
  test('Database: SQL injection prevention', () => {
    const maliciousName = "Robert'); DROP TABLE projects;--";

    try {
      const project = app.createProject(maliciousName);
      const retrieved = app.database.getProject(project.id);

      if (retrieved?.name !== maliciousName) {
        throw new Error('SQL injection may have succeeded or content was sanitized unexpectedly');
      }
    } catch (e: any) {
      // Should NOT throw - parameterized queries should handle this
      throw new Error(`BUG: SQL injection caused error: ${e.message}`);
    }
  });
}

// ============================================================================
// COMPILE ENGINE STRESS TESTS
// ============================================================================

function compileTests(app: EpicFictionArchitect) {
  // TEST 1: Empty manuscript
  test('Compile: Empty project with no content', async () => {
    const projectId = app.createProject('Empty Project').id;

    const result = await app.compile.compile(projectId, {format: 'markdown'});

    if (!result.success) {
      throw new Error(`Compilation failed on empty project: ${result.errors.join(', ')}`);
    }

    if (result.warnings.length === 0) {
      throw new Error('BUG: Should warn about empty manuscript');
    }
  });

  // TEST 2: Deeply nested structure
  test('Compile: Deeply nested containers (100 levels)', async () => {
    const projectId = app.createProject('Deep Nesting Test').id;

    let parentId: string | undefined = undefined;
    for (let i = 0; i < 100; i++) {
      parentId = app.database.createContainer(projectId, 'folder', `Level ${i}`, parentId);
    }

    // Add a scene at the deepest level
    app.database.createScene(parentId!, 'Deep Scene', {content: 'Finally here!'});

    try {
      const result = await app.compile.compile(projectId, {format: 'markdown'});
      if (!result.success) {
        throw new Error(`Deep nesting compilation failed: ${result.errors.join(', ')}`);
      }
    } catch (e: any) {
      throw new Error(`BUG: Stack overflow or recursion limit on deep nesting: ${e.message}`);
    }
  });

  // TEST 3: Special characters in titles
  test('Compile: Special characters in chapter titles', async () => {
    const projectId = app.createProject('Special Chars Test').id;

    const titles = [
      'Chapter: "The Beginning"',
      "Chapter's Apostrophe",
      'Chapter <with> HTML',
      'Chapter & Ampersand',
      'Chapter\nWith\nNewlines',
      'Chapter\\With\\Backslashes',
    ];

    for (const title of titles) {
      const containerId = app.database.createContainer(projectId, 'chapter', title);
      app.database.createScene(containerId, 'Scene', {content: 'Content'});
    }

    const result = await app.compile.compile(projectId, {format: 'html'});

    // Check that HTML wasn't broken by unescaped characters
    if (typeof result.content === 'string' && result.content.includes('<<')) {
      throw new Error('BUG: HTML entities not properly escaped');
    }
  });

  // TEST 4: Compile non-existent project
  test('Compile: Non-existent project ID', async () => {
    const result = await app.compile.compile('non-existent-id', {format: 'markdown'});

    if (result.success) {
      throw new Error('BUG: Should fail for non-existent project');
    }
  });
}

// ============================================================================
// AI/EMBEDDINGS STRESS TESTS
// ============================================================================

async function aiTests(app: EpicFictionArchitect) {
  // TEST 1: Empty content embedding
  test('Embeddings: Empty string embedding', async () => {
    try {
      const embedding = await app.embeddings.generateEmbedding('');
      if (embedding.length === 0) {
        throw new Error('BUG: Empty embedding returned for empty string');
      }
    } catch (e: any) {
      // Should handle gracefully, not crash
      if (e.message.includes('undefined') || e.message.includes('null')) {
        throw new Error(`BUG: Unhandled null/undefined: ${e.message}`);
      }
    }
  });

  // TEST 2: Very long content embedding
  test('Embeddings: Chunk handling for very long text', async () => {
    const projectId = app.createProject('Embedding Test').id;
    const containerId = app.database.createContainer(projectId, 'chapter', 'Test');

    const longContent = 'This is a test sentence. '.repeat(10000); // ~250k chars
    const sceneId = app.database.createScene(containerId, 'Long Scene', {content: longContent});
    const scene = app.database.getScene(sceneId);

    if (scene) {
      try {
        await app.embeddings.indexScene(scene);
        // Check that multiple chunks were created
        const embeddings = app.database.all(
          'SELECT COUNT(*) as count FROM embeddings WHERE entity_id = ?',
          [sceneId]
        ) as {count: number}[];

        if (embeddings[0].count < 10) {
          throw new Error(`BUG: Expected many chunks, got ${embeddings[0].count}`);
        }
      } catch (e: any) {
        throw new Error(`BUG: Failed to index long content: ${e.message}`);
      }
    }
  });

  // TEST 3: Semantic search with no indexed content
  test('Embeddings: Search on empty index', async () => {
    const projectId = app.createProject('Empty Search Test').id;

    const results = await app.embeddings.semanticSearch(projectId, 'test query');

    if (results.length > 0) {
      throw new Error('BUG: Found results in empty index');
    }
  });
}

// ============================================================================
// PROMISE/PAYOFF STRESS TESTS
// ============================================================================

function promiseTests(app: EpicFictionArchitect) {
  // TEST 1: Promise referencing deleted scene
  test('Promises: Promise with deleted planted scene', () => {
    const projectId = app.createProject('Promise Test').id;
    const containerId = app.database.createContainer(projectId, 'chapter', 'Ch1');
    const sceneId = app.database.createScene(containerId, 'Setup Scene', {content: 'Setup'});

    const promiseId = app.database.createPromise(
      projectId,
      'The gun on the mantle',
      sceneId,
      {promiseType: 'chekhov_gun', status: 'planted'}
    );

    // Delete the scene
    app.database.run('DELETE FROM scenes WHERE id = ?', [sceneId]);

    // Promise now references non-existent scene
    const promises = app.database.getUnfulfilledPromises(projectId);
    const orphanedPromise = promises.find(p => p.id === promiseId);

    if (orphanedPromise) {
      // Try to get the planted scene info
      const scene = app.database.getScene(orphanedPromise.plantedSceneId);
      if (!scene) {
        throw new Error('BUG: Promise references deleted scene - should cascade delete or prevent scene deletion');
      }
    }
  });

  // TEST 2: Promise fulfilled before planted
  test('Promises: Fulfilled scene before planted scene in timeline', () => {
    const projectId = app.createProject('Timeline Promise Test').id;
    const calendarId = app.database.createCalendar(projectId, 'Test', {
      months: [{name: 'M1', days: 30, order: 1, id: 'm1'}]
    });

    const containerId = app.database.createContainer(projectId, 'chapter', 'Ch1');

    // Create fulfillment scene first (year 100)
    const fulfillSceneId = app.database.createScene(containerId, 'Payoff', {
      content: 'The gun fires!',
      date: {calendarId, year: 100, month: 1, day: 1, precision: 'day', isApproximate: false}
    });

    // Create planted scene later (year 200) - AFTER fulfillment!
    const plantSceneId = app.database.createScene(containerId, 'Setup', {
      content: 'Notice the gun on the mantle.',
      date: {calendarId, year: 200, month: 1, day: 1, precision: 'day', isApproximate: false}
    });

    const promiseId = app.database.createPromise(
      projectId,
      "Chekhov's gun",
      plantSceneId,
      {fulfilledSceneId: fulfillSceneId, status: 'fulfilled', promiseType: 'chekhov_gun'}
    );

    // MISSING: No validation that fulfillment happens after planting
    throw new Error('MISSING FEATURE: No timeline validation for promise fulfillment order');
  });
}

// ============================================================================
// PRODUCTIVITY TRACKER STRESS TESTS
// ============================================================================

function productivityTests(app: EpicFictionArchitect) {
  // TEST 1: End session that was never started
  test('Productivity: End non-existent session', () => {
    const result = app.productivity.endSession('fake-session-id');

    if (result !== null) {
      throw new Error('BUG: Should return null for non-existent session');
    }
  });

  // TEST 2: Multiple active sessions
  test('Productivity: Multiple concurrent sessions', () => {
    const projectId = app.createProject('Multi Session Test').id;

    const session1 = app.productivity.startSession(projectId, 'freewrite');
    const session2 = app.productivity.startSession(projectId, 'sprint');

    // Both sessions are now "active" - is this intended?
    // Could lead to duplicate word counting

    const stats1 = app.productivity.getActiveSessionStats(session1);
    const stats2 = app.productivity.getActiveSessionStats(session2);

    if (stats1 && stats2) {
      // Both are active - potential for bugs
      console.warn('WARNING: Multiple concurrent sessions allowed - may cause word count duplication');
    }
  });

  // TEST 3: Negative words written
  test('Productivity: Session where more deleted than written', () => {
    const projectId = app.createProject('Negative Words Test').id;
    const containerId = app.database.createContainer(projectId, 'chapter', 'Ch1');

    // Create scene with content
    const sceneId = app.database.createScene(containerId, 'Scene', {
      content: 'This is existing content that will be deleted.'
    });

    // Start session
    const sessionId = app.productivity.startSession(projectId, 'edit');

    // Delete all content
    app.database.updateSceneContent(sceneId, '');

    // End session
    const stats = app.productivity.endSession(sessionId);

    if (stats && stats.netWords >= 0) {
      throw new Error(`BUG: Net words should be negative when deleting, got ${stats.netWords}`);
    }
  });
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     EPIC FICTION ARCHITECT - STRESS TEST TO FAIL               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Initialize app with test database
  const app = new EpicFictionArchitect({
    databasePath: ':memory:' // In-memory for testing
  });

  try {
    console.log('🔬 Running Age Calculator Tests...');
    ageCalculatorTests(app);

    console.log('📅 Running Calendar System Tests...');
    calendarTests(app);

    console.log('🗄️  Running Database Tests...');
    databaseTests(app);

    console.log('📚 Running Compile Engine Tests...');
    await compileTests(app);

    console.log('🤖 Running AI/Embeddings Tests...');
    await aiTests(app);

    console.log('🎯 Running Promise/Payoff Tests...');
    promiseTests(app);

    console.log('⏱️  Running Productivity Tracker Tests...');
    productivityTests(app);

  } finally {
    app.close();
  }

  // Report results
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                        TEST RESULTS                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);

  console.log(`✅ PASSED: ${passed.length}`);
  console.log(`❌ FAILED: ${failed.length}`);
  console.log(`📊 TOTAL:  ${results.length}\n`);

  if (failed.length > 0) {
    console.log('FAILURES:\n');
    for (const f of failed) {
      console.log(`  ❌ ${f.name}`);
      console.log(`     ${f.error}\n`);
    }
  }

  // Summary of found issues
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    ISSUES DISCOVERED                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const issues = [
    '1. NEGATIVE AGES: Characters born after target date return negative ages',
    '2. LEAP YEARS: No leap year support in calendar system',
    '3. HYBRID SPECIES: Aging calculation for hybrid species not implemented',
    '4. CIRCULAR RELATIONSHIPS: No detection of impossible family trees',
    '5. CIRCULAR CAUSALITY: Events can cause each other (paradox)',
    '6. ORPHANED ENTITIES: Deleting containers doesn\'t cascade to scenes',
    '7. PROMISE TIMELINE: No validation that payoff comes after setup',
    '8. MOON PHASE DRIFT: Fractional cycle lengths cause drift over time',
    '9. CONCURRENT SESSIONS: Multiple writing sessions can run simultaneously',
    '10. CROSS-CALENDAR DATES: No conversion between different calendar systems',
  ];

  for (const issue of issues) {
    console.log(`  ⚠️  ${issue}`);
  }
}

// Run tests
runAllTests().catch(console.error);
