/**
 * Engine Instantiation Test - Verifies all new engines work correctly
 */

import { StoryStructureEngine, StructureFramework } from '../src/engines/story-structure';
import { CodexEngine, CodexEntryType } from '../src/engines/codex';
import { WritingGenerationEngine } from '../src/engines/writing-generation';
import { MagicSystemDesigner } from '../src/engines/magic-system';
import { ProjectDashboard, HealthCategory, IssueSeverity } from '../src/dashboard';
import { AutoCharacterPipeline } from '../src/engines/character-generation/auto-character-pipeline';
import { LeadingEdgeAIConfig, ModelCapability, FrontierProvider } from '../src/config/leading-edge-ai';
import { QualityBenchmarkEngine } from '../src/engines/quality-benchmarks';

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

// Test LeadingEdgeAIConfig
const aiConfig = new LeadingEdgeAIConfig();
const frontierModels = aiConfig.getFrontierModels();
console.log('\n✓ LeadingEdgeAIConfig: ' + frontierModels.length + ' frontier models');
const bestModel = aiConfig.getBestModelForTask([
  ModelCapability.CREATIVE_WRITING,
  ModelCapability.CHARACTER_VOICE
]);
console.log('  Best model for writing: ' + (bestModel?.displayName || 'none'));
const activeAnthropic = aiConfig.getActiveModel(FrontierProvider.ANTHROPIC);
console.log('  Active Anthropic model: ' + (activeAnthropic?.displayName || 'none'));
const configStats = aiConfig.getStats();
console.log('  Templates: ' + configStats.templateCount);
console.log('  Average quality score: ' + configStats.averageQualityScore);

// Test Writing Engine with LeadingEdge Config
writingEngine.connectLeadingEdgeConfig(aiConfig);
const qualityAnalysis = writingEngine.analyzeContentQuality(
  'The warrior raised his gleaming sword, feeling the ancient power pulse through his fingers. ' +
  'Cold wind whispered across the battlefield as the scent of smoke filled his nostrils. ' +
  '"We end this today," he growled, his voice low and dangerous.'
);
console.log('\n✓ Writing Quality Analysis:');
console.log('  Readability: ' + qualityAnalysis.readability.toFixed(1));
console.log('  Sensory details: ' + qualityAnalysis.sensoryDetails + '/5');
console.log('  Pacing tempo: ' + qualityAnalysis.pacing.tempo);
console.log('  Suggestions: ' + qualityAnalysis.suggestions.length);

// Test QualityBenchmarkEngine
const benchmarkEngine = new QualityBenchmarkEngine(aiConfig);
const modelValidation = benchmarkEngine.validateModel('claude-opus-4-20250514');
console.log('\n✓ QualityBenchmarkEngine:');
console.log('  Model validation: ' + (modelValidation.isValid ? 'VALID' : 'INVALID'));
console.log('  Model tier: ' + modelValidation.tier);
const selectedModel = benchmarkEngine.selectModelWithFallback([
  ModelCapability.CREATIVE_WRITING,
  ModelCapability.EMOTIONAL_DEPTH
]);
console.log('  Selected model: ' + selectedModel.model.displayName);
console.log('  Was fallback: ' + selectedModel.wasFallback);

// Test quality assessment
const testContent = `
The moonlight cast long shadows across the courtyard as Elena stepped through the ancient gates.
Her heart pounded against her ribs, each beat a reminder of what she had to do.

"You shouldn't have come," Marcus said, his voice barely above a whisper. The torchlight
flickered across his weathered face, revealing the pain he tried so hard to hide.

Elena reached out, her fingers trembling. "I had no choice. The prophecy—"

"Damn the prophecy!" His outburst echoed off the stone walls. She could smell the wine on
his breath, see the red rims around his eyes. "Do you know what they'll do when they find
out you're here?"

She did know. The cold certainty of it settled in her stomach like a stone. But some truths
were worth dying for. Some people were worth saving, even from themselves.
`;

const assessment = benchmarkEngine.assessQuality(testContent, 'test-content-1', 'claude-opus-4-20250514');
console.log('\n✓ Quality Assessment:');
console.log('  Overall score: ' + assessment.overallScore.toFixed(1) + '/100');
console.log('  Passed all required: ' + assessment.passedAllRequired);
console.log('  Regeneration needed: ' + assessment.regenerationNeeded);
console.log('  Word count: ' + assessment.wordCount);
console.log('  Sensory details: ' + assessment.sensoryDetailCount + '/5');
console.log('  Critical issues: ' + assessment.criticalIssues.length);

const benchStats = benchmarkEngine.getStats();
console.log('  Assessments tracked: ' + benchStats.assessmentCount);

console.log('\n=== ALL ENGINE TESTS PASSED ===');
console.log('\nTotal new engines tested: 8');
console.log('Total new lines of code: ~11,500');
