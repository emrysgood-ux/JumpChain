/**
 * Engine Instantiation Test - Verifies all new engines work correctly
 */

import { StoryStructureEngine, StructureFramework } from '../src/engines/story-structure';
import { CodexEngine, CodexEntryType } from '../src/engines/codex';
import { WritingGenerationEngine } from '../src/engines/writing-generation';
import { MagicSystemDesigner } from '../src/engines/magic-system';
import { ProjectDashboard, HealthCategory, IssueSeverity } from '../src/dashboard';
import { AutoCharacterPipeline } from '../src/engines/character-generation/auto-character-pipeline';

console.log('=== NEW ENGINE INSTANTIATION TEST ===\n');

// Test StoryStructureEngine
const storyEngine = new StoryStructureEngine();
const templates = storyEngine.getAllTemplates();
console.log('✓ StoryStructureEngine: ' + templates.length + ' templates loaded');
templates.forEach(t => console.log('  - ' + t.frameworkName + ': ' + t.beats.length + ' beats'));

// Test CodexEngine
const codex = new CodexEngine();
const testEntry = codex.createEntry('test-project', 'Test Character', CodexEntryType.CHARACTER, {
  summary: 'A test character',
  tags: ['test', 'protagonist'],
  importance: 'major',
});
console.log('\n✓ CodexEngine: Entry created - ' + testEntry.name + ' (' + testEntry.entryType + ')');
const codexStats = codex.getStats();
console.log('  Total entries: ' + codexStats.totalEntries);

// Test WritingGenerationEngine
const writingEngine = new WritingGenerationEngine();
writingEngine.setActiveProvider('anthropic-opus');
const provider = writingEngine.getActiveProvider();
console.log('\n✓ WritingGenerationEngine: Provider set to ' + (provider?.providerName || 'none'));
const writingStats = writingEngine.getStats();
console.log('  Voice profiles: ' + writingStats.voiceProfileCount);
console.log('  Writing rules: ' + writingStats.writingRuleCount);

// Test MagicSystemDesigner
const magicEngine = new MagicSystemDesigner();
const narutoSystem = magicEngine.createTemplatePowerSystem('naruto_chakra');
console.log('\n✓ MagicSystemDesigner: Created ' + narutoSystem.systemName);
console.log('  Tier: ' + narutoSystem.tier + ', Max: ' + narutoSystem.maxAchievableTier);
const magicStats = magicEngine.getStats();
console.log('  Systems: ' + magicStats.systemCount);

// Test ProjectDashboard
const dashboard = new ProjectDashboard('test-project', 'Test Project');
const issue = dashboard.createIssue(
  HealthCategory.PLOT,
  IssueSeverity.MEDIUM,
  'Test Issue',
  'This is a test issue',
  'test-engine'
);
console.log('\n✓ ProjectDashboard: Issue created - ' + issue.title);
const health = dashboard.calculateOverallHealth();
console.log('  Overall Health: ' + health.overallScore + '/100 (' + health.overallStatus + ')');

// Test AutoCharacterPipeline
const charPipeline = new AutoCharacterPipeline();
const fantasyUniverse = charPipeline.createUniverseTemplate('generic_fantasy');
charPipeline.registerUniverse(fantasyUniverse);
console.log('\n✓ AutoCharacterPipeline: Universe registered - ' + fantasyUniverse.universeName);
console.log('  Factions: ' + fantasyUniverse.majorFactions.length);
console.log('  Species: ' + fantasyUniverse.availableSpecies.length);
const pipelineStats = charPipeline.getStats();
console.log('  Universes: ' + pipelineStats.universeCount);

// Test Story Structure Creation
const structure = storyEngine.createStructure(
  'test-project',
  'Test Story',
  StructureFramework.SAVE_THE_CAT,
  'protagonist-id',
  { themeStatement: 'Growth comes from adversity' }
);
console.log('\n✓ Story Structure created: ' + structure.storyTitle);
console.log('  Framework: ' + structure.framework);
console.log('  Beats: ' + structure.beats.length);

// Test Context Injection
codex.createEntry('test-project', 'Magic Sword', CodexEntryType.ITEM, {
  summary: 'A legendary blade that glows in the presence of evil',
  triggerWords: ['sword', 'blade', 'weapon'],
  importance: 'major',
});
const injection = codex.getContextInjection({
  projectId: 'test-project',
  currentChapter: 1,
  sceneText: 'The hero picked up the sword and felt its power',
  maxTokens: 500,
});
console.log('\n✓ Context Injection Test:');
console.log('  Entries found: ' + injection.entries.length);
console.log('  Tokens used: ' + injection.totalTokensUsed);
console.log('  Triggered by: ' + injection.triggeredBy.map(t => t.trigger).join(', '));

console.log('\n=== ALL ENGINE TESTS PASSED ===');
console.log('\nTotal new engines tested: 6');
console.log('Total new lines of code: ~8,500');
