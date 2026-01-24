/**
 * Example: Divergent Rewrite - The Accelerator Explosion
 *
 * Demonstrates using the Creative Hallucination Engine to explore
 * alternate versions of a pivotal death scene.
 */

import {
  CreativeHallucinationEngine,
  HallucinationType,
  TruthLayer,
  DivergenceStrength,
  GroundingLevel,
  DreamLogicType
} from '../src/engines/creative-hallucination';

// Initialize the engine
const hallucination = new CreativeHallucinationEngine();

// ============================================================================
// SETUP: Establish Canon Anchors (what MUST remain true)
// ============================================================================

console.log('=== ESTABLISHING CANON ANCHORS ===\n');

const sheldonExists = hallucination.addCanonAnchor({
  category: 'character',
  element: 'Sheldon is a physicist working on particle acceleration',
  description: 'Core character identity',
  isInviolable: false,  // Can be changed by the explosion
  flexibility: 'Can be killed, injured, or transformed'
});

const acceleratorExists = hallucination.addCanonAnchor({
  category: 'world',
  element: 'The particle accelerator is experimental and unstable',
  description: 'The machine that causes the incident',
  isInviolable: true,
  flexibility: 'None - this is the cause'
});

const explosionHappens = hallucination.addCanonAnchor({
  category: 'plot',
  element: 'An explosion occurs during the critical experiment',
  description: 'The pivotal event',
  isInviolable: true,
  flexibility: 'Severity and consequences can vary'
});

console.log('Canon anchors established:');
console.log('- Sheldon: physicist (flexible)');
console.log('- Accelerator: experimental, unstable (fixed)');
console.log('- Explosion: happens (fixed, consequences flexible)\n');

// ============================================================================
// CREATE DIVERGENCE POINT
// ============================================================================

console.log('=== CREATING DIVERGENCE POINT ===\n');

const divergence = hallucination.createDivergencePoint({
  chapter: 847,
  originalEvent: 'Sheldon dies in the accelerator explosion during the tachyon experiment',
  divergenceQuestion: 'What if the explosion had different outcomes?',
  branches: [],
  explorationNotes: 'Exploring alternate fates for dramatic potential'
});

// ============================================================================
// GENERATE DIVERGENT BRANCHES
// ============================================================================

console.log('=== GENERATING ALTERNATE BRANCHES ===\n');

// Branch 1: Original - Death
hallucination.addDivergenceBranch(divergence.id, {
  description: 'Sheldon dies instantly in the explosion',
  immediateConsequences: [
    'Research team devastated',
    'Project shut down',
    'Investigation launched',
    'Amy discovers she is pregnant with his child'
  ],
  longTermEffects: [
    'His theories are vindicated posthumously',
    'Memorial accelerator named after him',
    'Amy raises their child alone',
    'Leonard takes over the research'
  ],
  characterImpacts: new Map([
    ['amy', 'Grief transforms to determination to continue his work'],
    ['leonard', 'Guilt over not being there, dedicates life to completing the theory'],
    ['howard', 'PTSD from being nearby during explosion'],
    ['raj', 'Writes biography that becomes bestseller']
  ]),
  thematicImplications: [
    'Legacy outlives the person',
    'Science demands sacrifice',
    'Love persists beyond death'
  ],
  plausibility: 1.0,
  narrativeInterest: 0.7
});

// Branch 2: Survival with transformation
const transformBranch = hallucination.addDivergenceBranch(divergence.id, {
  description: 'Sheldon survives but is fundamentally changed by tachyon exposure',
  immediateConsequences: [
    'Coma for three weeks',
    'Awakens with fragmented memories',
    'Perceives time non-linearly',
    'His personality softens dramatically'
  ],
  longTermEffects: [
    'Becomes a different person emotionally',
    'Can glimpse probability streams (or believes he can)',
    'Relationship with Amy must be rebuilt',
    'His arrogance replaced by humility and wonder'
  ],
  characterImpacts: new Map([
    ['amy', 'Must decide if she loves who he became, not who he was'],
    ['leonard', 'Loses his intellectual rival, gains a true friend'],
    ['sheldon', 'Mourns his former self while discovering new capabilities']
  ]),
  thematicImplications: [
    'Identity is mutable',
    'Trauma can create growth',
    'Who we are vs who we become'
  ],
  plausibility: 0.6,
  narrativeInterest: 0.9
});

// Branch 3: Fake death / disappearance
hallucination.addDivergenceBranch(divergence.id, {
  description: 'Sheldon vanishes in the explosion - no body found',
  immediateConsequences: [
    'Declared dead after no remains found',
    'Theories range from vaporization to dimensional displacement',
    'Amy refuses to accept his death',
    'Strange readings detected in the aftermath'
  ],
  longTermEffects: [
    'Amy searches for evidence he survived',
    'Sightings reported but unconfirmed',
    'Returns years later, unchanged, from somewhere else',
    'Time passed differently where he was'
  ],
  characterImpacts: new Map([
    ['amy', 'Hope becomes obsession becomes vindication'],
    ['leonard', 'Practical grief vs supporting Amy\'s "delusion"'],
    ['sheldon', 'Experienced years alone, returns changed by isolation']
  ]),
  thematicImplications: [
    'Schrodinger\'s friend - dead and alive until observed',
    'Faith vs evidence',
    'The weight of waiting'
  ],
  plausibility: 0.4,
  narrativeInterest: 0.95
});

// Branch 4: Role reversal - someone else dies
hallucination.addDivergenceBranch(divergence.id, {
  description: 'Leonard pushes Sheldon clear and dies in his place',
  immediateConsequences: [
    'Sheldon survives with minor injuries',
    'Leonard dies saving him',
    'Penny collapses at the news',
    'Sheldon\'s worldview shattered'
  ],
  longTermEffects: [
    'Sheldon develops survivor\'s guilt',
    'Dedicates work to Leonard\'s memory',
    'Becomes emotional support for Penny',
    'Finally understands friendship through loss'
  ],
  characterImpacts: new Map([
    ['sheldon', 'Forced to confront his self-centeredness'],
    ['penny', 'Widow, must rebuild her life'],
    ['amy', 'Supports Sheldon through transformation'],
    ['howard', 'Becomes Sheldon\'s closest friend in Leonard\'s absence']
  ]),
  thematicImplications: [
    'Sacrifice and its ripples',
    'Growth through loss',
    'Friendship is proven in extremity'
  ],
  plausibility: 0.8,
  narrativeInterest: 0.85
});

console.log('Generated 4 divergent branches:');
console.log('1. Death (original) - plausibility: 1.0, interest: 0.7');
console.log('2. Transformation - plausibility: 0.6, interest: 0.9');
console.log('3. Disappearance - plausibility: 0.4, interest: 0.95');
console.log('4. Role Swap - plausibility: 0.8, interest: 0.85\n');

// ============================================================================
// CREATE TRUTH LAYERS (for unreliable narration)
// ============================================================================

console.log('=== ESTABLISHING TRUTH LAYERS ===\n');

// What ACTUALLY happened (selecting transformation branch for this example)
hallucination.selectBranch(divergence.id, transformBranch.id);

const explosionTruth = hallucination.createTruthRecord(
  'The Accelerator Explosion',
  {
    layer: TruthLayer.OBJECTIVE_REALITY,
    content: `The tachyon field collapsed asymmetrically at 3:47 AM.
Sheldon was at the epicenter, exposed to exotic particles for 0.003 seconds.
The explosion was contained by the magnetic shielding, limiting physical damage.
Sheldon's neural patterns were altered at the quantum level.
He was not "killed" in any conventional sense - he was rewritten.`,
    believers: [],  // No one knows the full truth yet
    evidence: ['Sensor logs', 'Quantum state recordings', 'Medical scans'],
    contradictions: ['Conventional physics', 'Expected radiation damage patterns']
  }
);

// What the official report says
hallucination.addTruthVersion(explosionTruth.id, {
  layer: TruthLayer.PUBLIC_KNOWLEDGE,
  content: `Dr. Sheldon Carter was injured in a laboratory accident.
The particle accelerator experienced a containment failure.
Dr. Carter sustained head trauma and was in a medically induced coma.
He has since recovered with some memory impairment.`,
  believers: ['media', 'university administration', 'general public'],
  evidence: ['Press release', 'Hospital records'],
  contradictions: ['Does not explain personality changes', 'Sensor data classified']
});

// What Amy believes
hallucination.addTruthVersion(explosionTruth.id, {
  layer: TruthLayer.CHARACTER_PERCEPTION,
  content: `Something wonderful and terrible happened to Sheldon.
The man who woke up has his memories but not his walls.
He looks at me like he's seeing me for the first time.
Part of me mourns the man he was. Part of me is falling in love again.
I don't think he was injured. I think he was... opened.`,
  believers: ['amy'],
  evidence: ['Behavioral changes', 'His new capacity for emotion', 'The way he holds her hand now'],
  contradictions: ['Medical diagnosis', 'Her scientific training']
});

// What Sheldon himself believes
hallucination.addTruthVersion(explosionTruth.id, {
  layer: TruthLayer.NARRATOR_BELIEF,
  content: `I remember dying. I remember the light.
I remember being everywhere and everywhen simultaneously.
I saw every version of every choice I ever made.
I saw who I could have been if I had not been afraid.
When I came back, I chose to bring that person with me.
I did not survive the explosion. I was born from it.`,
  believers: ['sheldon'],
  evidence: ['Personal experience', 'Visions during coma'],
  contradictions: ['Cannot be verified', 'Possibly confabulation']
});

console.log('Truth layers established:');
console.log('- OBJECTIVE_REALITY: Quantum rewriting of neural patterns');
console.log('- PUBLIC_KNOWLEDGE: Simple accident and recovery');
console.log('- CHARACTER_PERCEPTION (Amy): Emotional/spiritual transformation');
console.log('- NARRATOR_BELIEF (Sheldon): Death and rebirth experience\n');

// ============================================================================
// CREATE DREAM SEQUENCE (Sheldon's coma visions)
// ============================================================================

console.log('=== GENERATING DREAM SEQUENCE ===\n');

const comaDream = hallucination.createDreamSequence({
  characterId: 'sheldon',
  chapter: 849,  // During the coma
  logicType: DreamLogicType.TRANSFORMATION,
  symbols: [],
  transformations: [],
  hiddenMeanings: [
    'Fear of emotional connection',
    'Guilt over treating friends as subordinates',
    'Longing for his deceased father\'s approval',
    'Love for Amy he could never express'
  ],
  surfaceNarrative: 'Sheldon walks through an infinite library where books become people become equations',
  deepInterpretation: 'His compartmentalized mind breaking down, forcing integration',
  foreshadows: [
    'He will remember things that haven\'t happened yet',
    'His relationship with his father\'s memory will heal',
    'He will save Leonard in a future crisis by acting on instinct'
  ],
  processesMaterial: [
    'The moment of the explosion',
    'Every time he pushed Amy away',
    'Leonard\'s years of patience',
    'His mother\'s prayers for him'
  ]
});

// Add dream symbols
hallucination.addDreamSymbol(comaDream.id, {
  symbol: 'The infinite library',
  represents: 'His organized but isolated mind',
  emotionalValence: -0.3,  // Slightly negative - lonely
  recurringAcross: [849, 851, 892]
});

hallucination.addDreamSymbol(comaDream.id, {
  symbol: 'His father\'s baseball glove',
  represents: 'Connection and acceptance he never received',
  emotionalValence: 0.7,  // Positive - longing
  recurringAcross: [849, 912]
});

hallucination.addDreamSymbol(comaDream.id, {
  symbol: 'Amy\'s hand dissolving when he reaches for it',
  represents: 'Fear of losing her through his own inability to connect',
  emotionalValence: -0.8,  // Strongly negative
  recurringAcross: [849]
});

// Add transformations (dream logic)
hallucination.addTransformation(comaDream.id, {
  from: 'The accelerator control room',
  to: 'His childhood bedroom',
  trigger: 'Opening a notebook full of equations',
  meaning: 'Science was his escape from emotional pain'
});

hallucination.addTransformation(comaDream.id, {
  from: 'A conversation with Leonard',
  to: 'A conversation with his younger self',
  trigger: 'Leonard says "You matter to me"',
  meaning: 'Learning to receive love, first from others, then from himself'
});

console.log('Dream sequence generated for coma chapters');
console.log('Logic type: TRANSFORMATION');
console.log('Key symbols: Library (isolation), Baseball glove (father), Amy\'s hand (fear)');
console.log('Processing: explosion trauma, relationship fears, childhood wounds\n');

// ============================================================================
// GENERATE THE REWRITTEN SCENE
// ============================================================================

console.log('=== GENERATING REWRITTEN SCENE ===\n');

const seed = hallucination.createSeed({
  type: HallucinationType.DIVERGE_TIMELINE,
  inputPrompt: 'Rewrite the accelerator explosion where Sheldon survives but is transformed',
  constraints: [
    'The explosion must still happen',
    'The transformation must be ambiguous - scientific or spiritual',
    'Amy must witness the immediate aftermath',
    'The reader should feel both loss and possibility'
  ],
  grounding: GroundingLevel.FLEXIBLE,
  divergenceStrength: DivergenceStrength.SIGNIFICANT,
  canonAnchors: [sheldonExists, acceleratorExists, explosionHappens]
});

// Record generated content
const rewrittenScene = hallucination.recordGeneration({
  seedId: seed.id,
  type: HallucinationType.DIVERGE_TIMELINE,
  content: `
CHAPTER 847: THE LIGHT THAT UNMAKES

The countdown reached zero at 3:47 AM.

Sheldon's finger hovered over the initiation sequence, his reflection ghosting
in the monitor—that familiar face, all angles and certainty. Twenty years of
work. Every equation, every sleepless night, every relationship sacrificed on
the altar of this moment.

"Tachyon field stable at 99.7%," the computer announced.

"That's not stable enough," Leonard's voice crackled through the intercom.
"Sheldon, abort. We can recalibrate and try again tomorrow."

But Sheldon had seen the numbers. Had lived in them. 99.7% was as close as
they would ever get, and the universe did not negotiate with precision.

"Initiating."

The light came first—not the white of movies, but a color that didn't exist,
that couldn't exist, a hue his brain translated as screaming. The magnetic
containment held for 0.002 seconds before the field collapsed asymmetrically,
folding in on the epicenter.

Folding in on him.

Time stopped being a line. It became a library.

He was everywhere. Everywhen. He saw himself at five, building circuits while
his father watched baseball in the next room, wishing the boy would just be
normal. He saw himself at fifteen, understanding that genius was its own
prison. He saw himself pushing Amy away a thousand times in a thousand tiny
ways, and he finally understood why.

He was afraid.

Not of death. Never of death. Death was merely a cessation of pattern.

He was afraid of being known. Of being loved without having earned it. Of the
terrifying vulnerability of mattering to someone not for what he could do,
but for who he was.

The library stretched infinite around him, and for the first time, he walked
out of the stacks and into the open air.

---

Amy found him in the wreckage.

The containment room was scorched but intact—the shielding had held, barely.
Alarms screamed. Emergency lights painted everything in crimson and shadow.

And there was Sheldon, sitting upright in the center of it all, his lab coat
smoking, his eyes open and fixed on something she couldn't see.

"Sheldon!" She ran to him, touched his face. His skin was warm, too warm,
but he was breathing. He was alive. "Sheldon, can you hear me?"

He blinked. Focused on her. And for the first time in the years she had known
him, she saw something in his eyes that hadn't been there before.

Presence.

"Amy," he said, and his voice was the same but the way he said her name was
different, reverent, like a prayer he finally understood. "I saw you. In the
light. I saw all the times I should have told you—"

He reached up and touched her face with trembling fingers.

"You're crying," he said, wonder in his voice. "I made you cry. I've made you
cry so many times, haven't I? I'm sorry. I'm sorry I didn't know how to—"

"Sheldon, you're in shock. Don't try to—"

"I'm not in shock." He smiled, and it was his smile but softer, like someone
had sanded away the sharp edges. "I'm awake. For the first time in my life,
I'm actually awake."

She would spend years trying to understand what happened in that room.

The medical scans would show anomalies they couldn't explain. The quantum
physicists would argue about probability fields and observer effects. Leonard
would hypothesize that the tachyon exposure had somehow altered his neural
pathways, rewritten the brain chemistry that had made connection so difficult
for him.

But Amy would always remember this moment. The moment she looked into the
eyes of the man she loved and saw, for the first time, the man he could
have been all along.

The man who had been hiding in the library.

"I don't want to be afraid anymore," Sheldon said. "I don't want to die
without having lived."

The alarms continued to wail. Emergency teams were coming. The world would
intrude with its questions and protocols and explanations.

But for now, in the smoke and the emergency lights, Sheldon Carter held
Amy Farrah Fowler's hand like it was the most important equation he had
ever solved.

---

Three weeks later, he would wake from the coma speaking about libraries
and probability streams and a color that didn't exist.

But he would never let go of her hand again.
`,
  truthLayer: TruthLayer.NARRATOR_BELIEF,  // Told from Sheldon's transformed perspective
  confidence: 0.85,
  novelty: 0.9,
  canonCompliance: 0.95,
  tags: ['transformation', 'near-death', 'character-growth', 'romance', 'scifi'],
  usedInChapters: [847],
  isAccepted: false,
  variations: []
});

console.log('REWRITTEN SCENE: "The Light That Unmakes"');
console.log('Chapter: 847');
console.log('Truth Layer: NARRATOR_BELIEF (transformed Sheldon\'s perspective)');
console.log('Confidence: 0.85 | Novelty: 0.9 | Canon Compliance: 0.95\n');
console.log('--- BEGIN SCENE ---\n');
console.log(rewrittenScene.content);
console.log('\n--- END SCENE ---\n');

// ============================================================================
// ANALYSIS
// ============================================================================

console.log('=== DIVERGENCE ANALYSIS ===\n');

const whatIfs = hallucination.generateWhatIfScenarios('the accelerator explosion');
console.log('Additional "What If" scenarios to explore:');
whatIfs.forEach((q, i) => console.log(`${i + 1}. ${q}`));

console.log('\n=== PATTERN ANALYSIS ===\n');

const patterns = hallucination.analyzeHallucinationPatterns();
console.log('Hallucination patterns:');
console.log(`- Most used types: ${patterns.mostUsedTypes.map(t => t.type).join(', ')}`);
console.log(`- Average canon compliance: ${(patterns.averageCanonCompliance * 100).toFixed(1)}%`);
console.log(`- Acceptance rate: ${(patterns.acceptanceRate * 100).toFixed(1)}%`);

// Check for unresolved truths
const unresolved = hallucination.getUnresolvedTruths();
console.log(`\nUnresolved truth records: ${unresolved.length}`);
unresolved.forEach(t => {
  console.log(`- "${t.subject}" - active layer: ${t.activeLayer}`);
});

console.log('\n=== DEMONSTRATION COMPLETE ===');
console.log('The Creative Hallucination Engine allows you to:');
console.log('1. Establish canon anchors (what cannot change)');
console.log('2. Create divergence points with multiple branches');
console.log('3. Track multiple truth layers for unreliable narration');
console.log('4. Generate dream sequences with symbolic logic');
console.log('5. Produce variant scenes while maintaining consistency');
