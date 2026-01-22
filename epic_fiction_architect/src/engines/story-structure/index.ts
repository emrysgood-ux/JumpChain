/**
 * StoryStructureEngine - Professional Plotting Frameworks
 *
 * Implements multiple industry-standard story structure templates:
 * - Save the Cat! (15 beats)
 * - Hero's Journey (17 stages)
 * - Three-Act Structure
 * - Dan Harmon's Story Circle (8 steps)
 * - Seven-Point Story Structure
 * - Fichtean Curve
 * - Kishotenketsu (4-act Asian structure)
 *
 * Features:
 * - Beat tracking with target percentages
 * - Multi-book series arc planning
 * - Visual structure validation
 * - Character arc integration with plot beats
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Structure Framework Types
// ============================================================================

export enum StructureFramework {
  SAVE_THE_CAT = 'save_the_cat',
  HEROS_JOURNEY = 'heros_journey',
  THREE_ACT = 'three_act',
  STORY_CIRCLE = 'story_circle',
  SEVEN_POINT = 'seven_point',
  FICHTEAN_CURVE = 'fichtean_curve',
  KISHOTENKETSU = 'kishotenketsu',
  CUSTOM = 'custom',
}

export enum BeatStatus {
  NOT_STARTED = 'not_started',
  OUTLINED = 'outlined',
  DRAFTED = 'drafted',
  REVISED = 'revised',
  COMPLETE = 'complete',
}

export enum ActNumber {
  ACT_ONE = 1,
  ACT_TWO = 2,
  ACT_THREE = 3,
  ACT_FOUR = 4, // For Kishotenketsu
}

// ============================================================================
// Beat Definitions
// ============================================================================

export interface BeatDefinition {
  beatId: string;
  beatName: string;
  beatNumber: number;
  act: ActNumber;

  // Positioning
  targetPercentage: number;        // Where in the story (0-100%)
  percentageRange: { min: number; max: number };

  // Description
  description: string;
  purpose: string;
  keyQuestions: string[];

  // Examples
  examples: string[];

  // What should happen
  requirements: string[];
  commonMistakes: string[];
}

export interface StructureTemplate {
  templateId: string;
  framework: StructureFramework;
  frameworkName: string;
  description: string;
  origin: string;
  bestFor: string[];

  // Total acts in this structure
  totalActs: number;

  // All beats in order
  beats: BeatDefinition[];

  // Act boundaries (percentage)
  actBoundaries: { act: ActNumber; startPercent: number; endPercent: number }[];
}

// ============================================================================
// Story Instance
// ============================================================================

export interface StoryBeat {
  instanceId: string;
  beatDefinitionId: string;
  beatName: string;

  // Content
  summary: string;
  detailedNotes: string;
  scenes: string[]; // Scene IDs

  // Actual positioning
  actualChapter?: number;
  actualPercentage?: number;

  // Status
  status: BeatStatus;
  wordCount: number;

  // Characters involved
  povCharacterId?: string;
  involvedCharacterIds: string[];

  // Validation
  meetsRequirements: boolean;
  validationNotes: string[];
}

export interface StoryStructure {
  structureId: string;
  projectId: string;
  bookId?: string;

  // Template used
  framework: StructureFramework;
  templateId: string;

  // Story info
  storyTitle: string;
  totalTargetWordCount: number;
  currentWordCount: number;

  // Beats
  beats: StoryBeat[];

  // Theme
  themeStatement: string;
  centralQuestion: string;

  // Main character arc
  protagonistId: string;
  protagonistStartState: string;
  protagonistEndState: string;
  protagonistWant: string;
  protagonistNeed: string;

  // Antagonist
  antagonistId?: string;
  antagonistGoal?: string;

  // Progress
  completionPercentage: number;
  lastUpdated: Date;
}

// ============================================================================
// Series Arc Structure
// ============================================================================

export interface SeriesArc {
  arcId: string;
  seriesId: string;
  arcName: string;

  // Multi-book tracking
  bookStructures: StoryStructure[];

  // Series-level theme
  seriesTheme: string;
  seriesPremise: string;

  // Character arc across series
  characterArcsAcrossBooks: {
    characterId: string;
    characterName: string;
    bookArcs: {
      bookId: string;
      startState: string;
      endState: string;
      majorChange: string;
    }[];
  }[];

  // Plot threads across books
  seriesPlotThreads: {
    threadId: string;
    threadName: string;
    introducedInBook: number;
    resolvedInBook?: number;
    status: 'active' | 'resolved' | 'abandoned';
  }[];
}

// ============================================================================
// Pre-defined Structure Templates
// ============================================================================

const SAVE_THE_CAT_TEMPLATE: StructureTemplate = {
  templateId: 'save-the-cat-v1',
  framework: StructureFramework.SAVE_THE_CAT,
  frameworkName: 'Save the Cat!',
  description: 'Blake Snyder\'s 15-beat structure adapted for novels by Jessica Brody',
  origin: 'Blake Snyder (2005), adapted by Jessica Brody (2018)',
  bestFor: ['Commercial fiction', 'Genre fiction', 'Screenplays', 'Page-turners'],
  totalActs: 3,
  actBoundaries: [
    { act: ActNumber.ACT_ONE, startPercent: 0, endPercent: 25 },
    { act: ActNumber.ACT_TWO, startPercent: 25, endPercent: 75 },
    { act: ActNumber.ACT_THREE, startPercent: 75, endPercent: 100 },
  ],
  beats: [
    {
      beatId: 'stc-1',
      beatName: 'Opening Image',
      beatNumber: 1,
      act: ActNumber.ACT_ONE,
      targetPercentage: 0,
      percentageRange: { min: 0, max: 1 },
      description: 'A visual that represents the starting point and tone of the story',
      purpose: 'Establish mood, tone, and the protagonist\'s "before" state',
      keyQuestions: ['What is your protagonist\'s world like before change?', 'What visual encapsulates their status quo?'],
      examples: ['Luke Skywalker staring at twin suns', 'Harry Potter in the cupboard under the stairs'],
      requirements: ['Show protagonist in their ordinary world', 'Hint at what\'s missing in their life'],
      commonMistakes: ['Starting with too much action', 'Info-dumping backstory'],
    },
    {
      beatId: 'stc-2',
      beatName: 'Theme Stated',
      beatNumber: 2,
      act: ActNumber.ACT_ONE,
      targetPercentage: 5,
      percentageRange: { min: 1, max: 10 },
      description: 'Someone (usually not the protagonist) states the theme or life lesson',
      purpose: 'Plant the thematic question the story will answer',
      keyQuestions: ['What lesson does your protagonist need to learn?', 'How can you state it subtly?'],
      examples: ['A mentor gives advice the hero ignores', 'A throwaway line that gains meaning later'],
      requirements: ['Theme should be stated but not heavy-handed', 'Protagonist should not fully understand it yet'],
      commonMistakes: ['Being too on-the-nose', 'Having the protagonist state it themselves'],
    },
    {
      beatId: 'stc-3',
      beatName: 'Setup',
      beatNumber: 3,
      act: ActNumber.ACT_ONE,
      targetPercentage: 10,
      percentageRange: { min: 1, max: 10 },
      description: 'Establish the protagonist\'s world, flaws, and what needs fixing',
      purpose: 'Show us who the protagonist is and what stakes matter to them',
      keyQuestions: ['What is your protagonist\'s flaw?', 'What do they want vs. need?', 'Who are the important people in their life?'],
      examples: ['Introduce supporting cast', 'Show protagonist\'s daily routine', 'Establish their wound'],
      requirements: ['Plant all information needed later', 'Show protagonist\'s flaw in action', 'Create reader sympathy'],
      commonMistakes: ['Introducing too many characters', 'Not making protagonist sympathetic'],
    },
    {
      beatId: 'stc-4',
      beatName: 'Catalyst',
      beatNumber: 4,
      act: ActNumber.ACT_ONE,
      targetPercentage: 10,
      percentageRange: { min: 10, max: 12 },
      description: 'A life-changing event that disrupts the status quo',
      purpose: 'Push the protagonist toward change - the story\'s inciting incident',
      keyQuestions: ['What event makes it impossible to go back?', 'How does this disrupt everything?'],
      examples: ['Harry gets Hogwarts letter', 'Katniss volunteers as tribute', 'Murder discovered'],
      requirements: ['Must be external event', 'Must demand a response', 'Changes everything'],
      commonMistakes: ['Making it too small', 'Protagonist causing it themselves'],
    },
    {
      beatId: 'stc-5',
      beatName: 'Debate',
      beatNumber: 5,
      act: ActNumber.ACT_ONE,
      targetPercentage: 17,
      percentageRange: { min: 12, max: 25 },
      description: 'Protagonist debates whether to accept the call to adventure',
      purpose: 'Show the stakes and why this is a hard decision',
      keyQuestions: ['Why is the protagonist reluctant?', 'What are they afraid of losing?'],
      examples: ['Neo choosing pills', 'Frodo considering destroying the Ring', 'Hero doubts their ability'],
      requirements: ['Show genuine conflict', 'Raise stakes', 'Build anticipation'],
      commonMistakes: ['Rushing through it', 'Making the decision too easy'],
    },
    {
      beatId: 'stc-6',
      beatName: 'Break into Two',
      beatNumber: 6,
      act: ActNumber.ACT_TWO,
      targetPercentage: 25,
      percentageRange: { min: 20, max: 25 },
      description: 'Protagonist makes a choice and enters the new world',
      purpose: 'Cross the threshold from Act 1 to Act 2',
      keyQuestions: ['What active choice does the protagonist make?', 'What world are they entering?'],
      examples: ['Leaving home', 'Accepting the mission', 'Entering the special world'],
      requirements: ['Must be protagonist\'s CHOICE', 'Clear transition to new world/situation'],
      commonMistakes: ['Protagonist is passive', 'No clear threshold moment'],
    },
    {
      beatId: 'stc-7',
      beatName: 'B Story',
      beatNumber: 7,
      act: ActNumber.ACT_TWO,
      targetPercentage: 30,
      percentageRange: { min: 25, max: 35 },
      description: 'Introduction of a secondary story, often a love interest or mentor',
      purpose: 'Provide thematic support and contrast to the A Story',
      keyQuestions: ['Who helps the protagonist learn the theme?', 'What relationship develops?'],
      examples: ['Love interest introduced', 'New mentor appears', 'Unlikely friendship forms'],
      requirements: ['Should connect to theme', 'New character or deepened relationship'],
      commonMistakes: ['B Story disconnected from theme', 'Too similar to A Story'],
    },
    {
      beatId: 'stc-8',
      beatName: 'Fun and Games',
      beatNumber: 8,
      act: ActNumber.ACT_TWO,
      targetPercentage: 40,
      percentageRange: { min: 25, max: 50 },
      description: 'The "promise of the premise" - what the audience came to see',
      purpose: 'Deliver on genre expectations and the story\'s central concept',
      keyQuestions: ['What\'s the promise of your premise?', 'What scenes showcase your concept?'],
      examples: ['Training montage', 'Fish out of water comedy', 'Solving clues in a mystery'],
      requirements: ['Deliver genre expectations', 'Show protagonist learning/growing', 'Reader enjoyment'],
      commonMistakes: ['Too much plot, not enough fun', 'Forgetting the premise'],
    },
    {
      beatId: 'stc-9',
      beatName: 'Midpoint',
      beatNumber: 9,
      act: ActNumber.ACT_TWO,
      targetPercentage: 50,
      percentageRange: { min: 48, max: 52 },
      description: 'A major event that raises stakes - either false victory or false defeat',
      purpose: 'Shift the story direction and escalate stakes',
      keyQuestions: ['Is this a false victory or false defeat?', 'How do stakes rise?'],
      examples: ['False victory: hero seems to win but hasn\'t', 'False defeat: all seems lost temporarily'],
      requirements: ['Major turning point', 'Stakes must escalate', 'No going back'],
      commonMistakes: ['Midpoint is too subtle', 'Stakes don\'t change'],
    },
    {
      beatId: 'stc-10',
      beatName: 'Bad Guys Close In',
      beatNumber: 10,
      act: ActNumber.ACT_TWO,
      targetPercentage: 60,
      percentageRange: { min: 50, max: 75 },
      description: 'External pressure mounts while internal doubts grow',
      purpose: 'Apply pressure from both outside and inside',
      keyQuestions: ['How does the antagonist respond?', 'What internal doubts surface?'],
      examples: ['Villain strikes back', 'Team fractures', 'Plans fall apart'],
      requirements: ['External threats increase', 'Internal flaws cause problems', 'Tension builds'],
      commonMistakes: ['Only external pressure', 'Only internal pressure'],
    },
    {
      beatId: 'stc-11',
      beatName: 'All Is Lost',
      beatNumber: 11,
      act: ActNumber.ACT_TWO,
      targetPercentage: 75,
      percentageRange: { min: 72, max: 78 },
      description: 'The lowest point - protagonist loses everything',
      purpose: 'Create the darkest moment before transformation',
      keyQuestions: ['What\'s the worst thing that could happen?', 'What does the protagonist lose?'],
      examples: ['Mentor dies', 'Love interest leaves', 'All hope seems lost'],
      requirements: ['Must feel like genuine defeat', 'Often involves death (literal or symbolic)'],
      commonMistakes: ['Not dark enough', 'Protagonist gives up too easily'],
    },
    {
      beatId: 'stc-12',
      beatName: 'Dark Night of the Soul',
      beatNumber: 12,
      act: ActNumber.ACT_TWO,
      targetPercentage: 77,
      percentageRange: { min: 75, max: 80 },
      description: 'Protagonist processes the loss and faces their flaw',
      purpose: 'Allow protagonist (and reader) to feel the weight of defeat',
      keyQuestions: ['How does the protagonist react to loss?', 'What truth must they face?'],
      examples: ['Mourning sequence', 'Wandering in despair', 'Confronting past'],
      requirements: ['Emotional processing', 'Flaw must be confronted', 'Set up transformation'],
      commonMistakes: ['Skipping emotional beats', 'Rushing to the solution'],
    },
    {
      beatId: 'stc-13',
      beatName: 'Break into Three',
      beatNumber: 13,
      act: ActNumber.ACT_THREE,
      targetPercentage: 80,
      percentageRange: { min: 78, max: 82 },
      description: 'A new idea or inspiration that combines A and B stories',
      purpose: 'Show the protagonist has learned the theme and is ready to fight',
      keyQuestions: ['What realization does the protagonist have?', 'How do A and B stories merge?'],
      examples: ['Eureka moment', 'Inspiration from B story character', 'Remembered lesson'],
      requirements: ['Internal realization', 'Combines learnings from both stories', 'Protagonist chooses to act'],
      commonMistakes: ['Solution comes from outside', 'Theme not integrated'],
    },
    {
      beatId: 'stc-14',
      beatName: 'Finale',
      beatNumber: 14,
      act: ActNumber.ACT_THREE,
      targetPercentage: 90,
      percentageRange: { min: 80, max: 99 },
      description: 'The climax where protagonist proves they\'ve changed',
      purpose: 'Execute the plan and defeat the antagonist using lessons learned',
      keyQuestions: ['How does the protagonist prove they\'ve changed?', 'How is the theme embodied?'],
      examples: ['Final battle', 'Confrontation', 'Proving transformation through action'],
      requirements: ['Protagonist drives the action', 'Uses lessons learned', 'Theme is proven true'],
      commonMistakes: ['Protagonist is passive in climax', 'Theme abandoned'],
    },
    {
      beatId: 'stc-15',
      beatName: 'Final Image',
      beatNumber: 15,
      act: ActNumber.ACT_THREE,
      targetPercentage: 100,
      percentageRange: { min: 99, max: 100 },
      description: 'Mirror of opening image showing how things have changed',
      purpose: 'Prove transformation and provide closure',
      keyQuestions: ['How does this contrast with the opening?', 'What has changed?'],
      examples: ['Same location, different attitude', 'Visual callback with new meaning'],
      requirements: ['Should mirror opening image', 'Show clear change', 'Emotional closure'],
      commonMistakes: ['No connection to opening', 'Change not visible'],
    },
  ],
};

const HEROS_JOURNEY_TEMPLATE: StructureTemplate = {
  templateId: 'heros-journey-v1',
  framework: StructureFramework.HEROS_JOURNEY,
  frameworkName: 'The Hero\'s Journey',
  description: 'Joseph Campbell\'s monomyth structure as adapted by Christopher Vogler',
  origin: 'Joseph Campbell (1949), Christopher Vogler (1992)',
  bestFor: ['Epic fantasy', 'Adventure', 'Coming-of-age', 'Mythic stories'],
  totalActs: 3,
  actBoundaries: [
    { act: ActNumber.ACT_ONE, startPercent: 0, endPercent: 25 },
    { act: ActNumber.ACT_TWO, startPercent: 25, endPercent: 75 },
    { act: ActNumber.ACT_THREE, startPercent: 75, endPercent: 100 },
  ],
  beats: [
    {
      beatId: 'hj-1', beatName: 'Ordinary World', beatNumber: 1, act: ActNumber.ACT_ONE,
      targetPercentage: 5, percentageRange: { min: 0, max: 10 },
      description: 'The hero\'s normal life before the adventure',
      purpose: 'Establish baseline, create contrast with special world',
      keyQuestions: ['What is the hero\'s everyday life?', 'What\'s missing?'],
      examples: ['Shire for Frodo', 'Tatooine for Luke'], requirements: ['Show normalcy', 'Hint at hero\'s potential'],
      commonMistakes: ['Too long', 'Too boring'],
    },
    {
      beatId: 'hj-2', beatName: 'Call to Adventure', beatNumber: 2, act: ActNumber.ACT_ONE,
      targetPercentage: 10, percentageRange: { min: 8, max: 15 },
      description: 'The hero receives the call to enter the special world',
      purpose: 'Disrupt the ordinary world, present the challenge',
      keyQuestions: ['What disrupts the hero\'s world?', 'What adventure awaits?'],
      examples: ['Gandalf arrives', 'R2-D2\'s message'], requirements: ['Clear call', 'Stakes established'],
      commonMistakes: ['Call too vague', 'No urgency'],
    },
    {
      beatId: 'hj-3', beatName: 'Refusal of the Call', beatNumber: 3, act: ActNumber.ACT_ONE,
      targetPercentage: 15, percentageRange: { min: 12, max: 20 },
      description: 'The hero hesitates or refuses the adventure',
      purpose: 'Show stakes, build tension, prove hero is human',
      keyQuestions: ['Why does the hero hesitate?', 'What are they afraid of?'],
      examples: ['Luke says he can\'t leave', 'Frodo offers the Ring to Gandalf'],
      requirements: ['Genuine reluctance', 'Valid fears'], commonMistakes: ['Refusal feels fake', 'Skipped entirely'],
    },
    {
      beatId: 'hj-4', beatName: 'Meeting the Mentor', beatNumber: 4, act: ActNumber.ACT_ONE,
      targetPercentage: 20, percentageRange: { min: 15, max: 25 },
      description: 'The hero meets a wise figure who provides guidance',
      purpose: 'Give hero tools, wisdom, or confidence to proceed',
      keyQuestions: ['Who guides the hero?', 'What gift/wisdom do they provide?'],
      examples: ['Obi-Wan gives Luke lightsaber', 'Gandalf\'s counsel'],
      requirements: ['Mentor provides something hero needs', 'Wisdom for the journey'],
      commonMistakes: ['Mentor solves hero\'s problems', 'No clear gift'],
    },
    {
      beatId: 'hj-5', beatName: 'Crossing the Threshold', beatNumber: 5, act: ActNumber.ACT_TWO,
      targetPercentage: 25, percentageRange: { min: 20, max: 30 },
      description: 'The hero commits to the adventure and enters the special world',
      purpose: 'No turning back - hero leaves ordinary world behind',
      keyQuestions: ['What marks the point of no return?', 'How does the new world differ?'],
      examples: ['Leaving the Shire', 'Entering the Death Star'],
      requirements: ['Clear threshold', 'Commitment shown'], commonMistakes: ['Threshold unclear', 'Hero is passive'],
    },
    {
      beatId: 'hj-6', beatName: 'Tests, Allies, Enemies', beatNumber: 6, act: ActNumber.ACT_TWO,
      targetPercentage: 35, percentageRange: { min: 25, max: 50 },
      description: 'The hero faces tests and learns the rules of the special world',
      purpose: 'Build skills, relationships, and understanding',
      keyQuestions: ['What challenges test the hero?', 'Who are allies and enemies?'],
      examples: ['Cantina scene', 'Fellowship forming'], requirements: ['Multiple challenges', 'Team assembled'],
      commonMistakes: ['Tests too easy', 'No relationship building'],
    },
    {
      beatId: 'hj-7', beatName: 'Approach to Inmost Cave', beatNumber: 7, act: ActNumber.ACT_TWO,
      targetPercentage: 45, percentageRange: { min: 40, max: 50 },
      description: 'The hero prepares to face the central ordeal',
      purpose: 'Build tension before the main confrontation',
      keyQuestions: ['What\'s the hero\'s greatest fear?', 'How do they prepare?'],
      examples: ['Approaching Mordor', 'Planning the Death Star assault'],
      requirements: ['Building dread', 'Final preparations'], commonMistakes: ['No buildup', 'Rushed'],
    },
    {
      beatId: 'hj-8', beatName: 'Ordeal', beatNumber: 8, act: ActNumber.ACT_TWO,
      targetPercentage: 50, percentageRange: { min: 48, max: 55 },
      description: 'The hero faces their greatest challenge and "dies"',
      purpose: 'Transformation through facing death (literal or symbolic)',
      keyQuestions: ['What is the hero\'s death experience?', 'What do they lose?'],
      examples: ['Luke in trash compactor', 'Gandalf vs Balrog'],
      requirements: ['Real danger', 'Symbolic death'], commonMistakes: ['Stakes too low', 'Hero untouched'],
    },
    {
      beatId: 'hj-9', beatName: 'Reward (Seizing the Sword)', beatNumber: 9, act: ActNumber.ACT_TWO,
      targetPercentage: 60, percentageRange: { min: 55, max: 65 },
      description: 'The hero gains the treasure or knowledge they sought',
      purpose: 'Claim the prize, celebrate survival',
      keyQuestions: ['What does the hero gain?', 'How have they changed?'],
      examples: ['Rescuing Leia', 'Getting the Ring into Mordor'],
      requirements: ['Clear reward', 'Moment of triumph'], commonMistakes: ['Reward unclear', 'No celebration'],
    },
    {
      beatId: 'hj-10', beatName: 'The Road Back', beatNumber: 10, act: ActNumber.ACT_THREE,
      targetPercentage: 75, percentageRange: { min: 70, max: 80 },
      description: 'The hero begins the return journey, often chased',
      purpose: 'Renewed tension, commitment to complete the journey',
      keyQuestions: ['What pushes the hero home?', 'What new dangers arise?'],
      examples: ['Escaping the Death Star', 'Flight from Mordor'],
      requirements: ['Urgency', 'New threats'], commonMistakes: ['No new conflict', 'Too easy'],
    },
    {
      beatId: 'hj-11', beatName: 'Resurrection', beatNumber: 11, act: ActNumber.ACT_THREE,
      targetPercentage: 85, percentageRange: { min: 80, max: 90 },
      description: 'The hero faces a final test where everything is at stake',
      purpose: 'Prove transformation, final purification',
      keyQuestions: ['What\'s the ultimate test?', 'How does the hero prove change?'],
      examples: ['Trench run', 'Mount Doom'], requirements: ['Highest stakes', 'Hero applies lessons'],
      commonMistakes: ['Anticlimax', 'Someone else saves hero'],
    },
    {
      beatId: 'hj-12', beatName: 'Return with the Elixir', beatNumber: 12, act: ActNumber.ACT_THREE,
      targetPercentage: 95, percentageRange: { min: 90, max: 100 },
      description: 'The hero returns home transformed, bringing a gift',
      purpose: 'Show how the journey changed the hero and benefits others',
      keyQuestions: ['What does the hero bring back?', 'How has home changed?'],
      examples: ['Medal ceremony', 'Return to the Shire'],
      requirements: ['Clear gift/elixir', 'Changed hero'], commonMistakes: ['No return shown', 'Gift unclear'],
    },
  ],
};

const STORY_CIRCLE_TEMPLATE: StructureTemplate = {
  templateId: 'story-circle-v1',
  framework: StructureFramework.STORY_CIRCLE,
  frameworkName: 'Dan Harmon\'s Story Circle',
  description: 'Simplified 8-step structure derived from Hero\'s Journey',
  origin: 'Dan Harmon (Community, Rick and Morty)',
  bestFor: ['TV episodes', 'Short stories', 'Character-driven pieces', 'Comedy'],
  totalActs: 2,
  actBoundaries: [
    { act: ActNumber.ACT_ONE, startPercent: 0, endPercent: 50 },
    { act: ActNumber.ACT_TWO, startPercent: 50, endPercent: 100 },
  ],
  beats: [
    { beatId: 'sc-1', beatName: '1. You (A character in a zone of comfort)', beatNumber: 1, act: ActNumber.ACT_ONE, targetPercentage: 5, percentageRange: { min: 0, max: 12 }, description: 'Establish the character in their comfort zone', purpose: 'Show who the character is before change', keyQuestions: ['Who is this character?', 'What\'s their normal?'], examples: ['Rick in his garage', 'Jeff at community college'], requirements: ['Clear comfort zone', 'Character established'], commonMistakes: ['Too long', 'Unclear protagonist'] },
    { beatId: 'sc-2', beatName: '2. Need (But they want something)', beatNumber: 2, act: ActNumber.ACT_ONE, targetPercentage: 15, percentageRange: { min: 10, max: 20 }, description: 'The character desires something', purpose: 'Establish motivation and stakes', keyQuestions: ['What do they want?', 'Why do they want it?'], examples: ['Morty wants adventure', 'Jeff wants easy credits'], requirements: ['Clear desire', 'Motivation shown'], commonMistakes: ['Want too vague', 'No urgency'] },
    { beatId: 'sc-3', beatName: '3. Go (They enter an unfamiliar situation)', beatNumber: 3, act: ActNumber.ACT_ONE, targetPercentage: 25, percentageRange: { min: 20, max: 30 }, description: 'Character leaves comfort zone', purpose: 'Cross into the unfamiliar', keyQuestions: ['What new world do they enter?', 'What makes it uncomfortable?'], examples: ['Portal gun adventure', 'Joining a study group'], requirements: ['Clear departure', 'New environment'], commonMistakes: ['Transition unclear', 'Not uncomfortable enough'] },
    { beatId: 'sc-4', beatName: '4. Search (Adapt to it)', beatNumber: 4, act: ActNumber.ACT_ONE, targetPercentage: 40, percentageRange: { min: 30, max: 50 }, description: 'Character searches for what they want', purpose: 'Struggle and adaptation', keyQuestions: ['How do they pursue their goal?', 'What obstacles arise?'], examples: ['Adventures and mishaps', 'Study group dynamics'], requirements: ['Active pursuit', 'Challenges faced'], commonMistakes: ['Too passive', 'No struggle'] },
    { beatId: 'sc-5', beatName: '5. Find (Find what they wanted)', beatNumber: 5, act: ActNumber.ACT_TWO, targetPercentage: 50, percentageRange: { min: 45, max: 55 }, description: 'Character gets what they wanted', purpose: 'Achievement at a cost', keyQuestions: ['Do they get it?', 'What\'s the catch?'], examples: ['Goal achieved but...', 'Victory with consequences'], requirements: ['Goal reached', 'Price revealed'], commonMistakes: ['Too easy', 'No cost'] },
    { beatId: 'sc-6', beatName: '6. Take (Pay a heavy price for it)', beatNumber: 6, act: ActNumber.ACT_TWO, targetPercentage: 65, percentageRange: { min: 55, max: 75 }, description: 'Character pays the price', purpose: 'Consequences and sacrifice', keyQuestions: ['What do they lose?', 'Was it worth it?'], examples: ['Relationships damaged', 'Values compromised'], requirements: ['Real cost', 'Consequences felt'], commonMistakes: ['Price too light', 'No real loss'] },
    { beatId: 'sc-7', beatName: '7. Return (Then return to their familiar situation)', beatNumber: 7, act: ActNumber.ACT_TWO, targetPercentage: 85, percentageRange: { min: 75, max: 90 }, description: 'Character returns to where they started', purpose: 'Coming back changed', keyQuestions: ['How do they return?', 'What\'s different?'], examples: ['Back home', 'Return to status quo'], requirements: ['Return shown', 'Change visible'], commonMistakes: ['No return', 'Change unclear'] },
    { beatId: 'sc-8', beatName: '8. Change (Having changed)', beatNumber: 8, act: ActNumber.ACT_TWO, targetPercentage: 95, percentageRange: { min: 90, max: 100 }, description: 'Character is demonstrably different', purpose: 'Prove transformation', keyQuestions: ['How have they changed?', 'What did they learn?'], examples: ['New perspective', 'Changed behavior'], requirements: ['Clear change', 'Growth shown'], commonMistakes: ['No visible change', 'Return to exactly same'] },
  ],
};

// ============================================================================
// Main Engine
// ============================================================================

export class StoryStructureEngine {
  private templates: Map<string, StructureTemplate> = new Map();
  private structures: Map<string, StoryStructure> = new Map();
  private seriesArcs: Map<string, SeriesArc> = new Map();

  // Indexes
  private structuresByProject: Map<string, string[]> = new Map();
  private structuresByBook: Map<string, string> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    this.templates.set(SAVE_THE_CAT_TEMPLATE.templateId, SAVE_THE_CAT_TEMPLATE);
    this.templates.set(HEROS_JOURNEY_TEMPLATE.templateId, HEROS_JOURNEY_TEMPLATE);
    this.templates.set(STORY_CIRCLE_TEMPLATE.templateId, STORY_CIRCLE_TEMPLATE);
  }

  // ============================================================================
  // Template Management
  // ============================================================================

  getTemplate(templateId: string): StructureTemplate | undefined {
    return this.templates.get(templateId);
  }

  getTemplateByFramework(framework: StructureFramework): StructureTemplate | undefined {
    for (const template of this.templates.values()) {
      if (template.framework === framework) return template;
    }
    return undefined;
  }

  getAllTemplates(): StructureTemplate[] {
    return Array.from(this.templates.values());
  }

  registerCustomTemplate(template: StructureTemplate): void {
    this.templates.set(template.templateId, template);
  }

  // ============================================================================
  // Structure Creation
  // ============================================================================

  createStructure(
    projectId: string,
    storyTitle: string,
    framework: StructureFramework,
    protagonistId: string,
    options: {
      bookId?: string;
      totalTargetWordCount?: number;
      themeStatement?: string;
      protagonistStartState?: string;
      protagonistEndState?: string;
      protagonistWant?: string;
      protagonistNeed?: string;
    } = {}
  ): StoryStructure {
    const template = this.getTemplateByFramework(framework);
    if (!template) {
      throw new Error(`No template found for framework: ${framework}`);
    }

    const structureId = uuidv4();

    // Create beat instances from template
    const beats: StoryBeat[] = template.beats.map(beatDef => ({
      instanceId: uuidv4(),
      beatDefinitionId: beatDef.beatId,
      beatName: beatDef.beatName,
      summary: '',
      detailedNotes: '',
      scenes: [],
      status: BeatStatus.NOT_STARTED,
      wordCount: 0,
      involvedCharacterIds: [],
      meetsRequirements: false,
      validationNotes: [],
    }));

    const structure: StoryStructure = {
      structureId,
      projectId,
      bookId: options.bookId,
      framework,
      templateId: template.templateId,
      storyTitle,
      totalTargetWordCount: options.totalTargetWordCount || 80000,
      currentWordCount: 0,
      beats,
      themeStatement: options.themeStatement || '',
      centralQuestion: '',
      protagonistId,
      protagonistStartState: options.protagonistStartState || '',
      protagonistEndState: options.protagonistEndState || '',
      protagonistWant: options.protagonistWant || '',
      protagonistNeed: options.protagonistNeed || '',
      completionPercentage: 0,
      lastUpdated: new Date(),
    };

    this.structures.set(structureId, structure);

    // Update indexes
    if (!this.structuresByProject.has(projectId)) {
      this.structuresByProject.set(projectId, []);
    }
    this.structuresByProject.get(projectId)!.push(structureId);

    if (options.bookId) {
      this.structuresByBook.set(options.bookId, structureId);
    }

    return structure;
  }

  // ============================================================================
  // Beat Management
  // ============================================================================

  updateBeat(
    structureId: string,
    beatInstanceId: string,
    updates: Partial<Omit<StoryBeat, 'instanceId' | 'beatDefinitionId' | 'beatName'>>
  ): StoryBeat {
    const structure = this.structures.get(structureId);
    if (!structure) throw new Error(`Structure not found: ${structureId}`);

    const beat = structure.beats.find(b => b.instanceId === beatInstanceId);
    if (!beat) throw new Error(`Beat not found: ${beatInstanceId}`);

    Object.assign(beat, updates);
    structure.lastUpdated = new Date();

    // Recalculate completion
    this.recalculateCompletion(structureId);

    return beat;
  }

  linkSceneToBeat(structureId: string, beatInstanceId: string, sceneId: string): void {
    const structure = this.structures.get(structureId);
    if (!structure) throw new Error(`Structure not found: ${structureId}`);

    const beat = structure.beats.find(b => b.instanceId === beatInstanceId);
    if (!beat) throw new Error(`Beat not found: ${beatInstanceId}`);

    if (!beat.scenes.includes(sceneId)) {
      beat.scenes.push(sceneId);
    }

    structure.lastUpdated = new Date();
  }

  // ============================================================================
  // Validation
  // ============================================================================

  validateStructure(structureId: string): {
    valid: boolean;
    issues: { beatId: string; beatName: string; issue: string; severity: 'warning' | 'error' }[];
    suggestions: string[];
  } {
    const structure = this.structures.get(structureId);
    if (!structure) throw new Error(`Structure not found: ${structureId}`);

    const template = this.templates.get(structure.templateId);
    if (!template) throw new Error(`Template not found: ${structure.templateId}`);

    const issues: { beatId: string; beatName: string; issue: string; severity: 'warning' | 'error' }[] = [];
    const suggestions: string[] = [];

    for (let i = 0; i < structure.beats.length; i++) {
      const beat = structure.beats[i];
      const beatDef = template.beats.find(b => b.beatId === beat.beatDefinitionId);

      if (!beatDef) continue;

      // Check if beat has content
      if (beat.status === BeatStatus.NOT_STARTED && !beat.summary) {
        issues.push({
          beatId: beat.instanceId,
          beatName: beat.beatName,
          issue: 'Beat has no content',
          severity: 'warning',
        });
      }

      // Check positioning
      if (beat.actualPercentage !== undefined) {
        const { min, max } = beatDef.percentageRange;
        if (beat.actualPercentage < min || beat.actualPercentage > max) {
          issues.push({
            beatId: beat.instanceId,
            beatName: beat.beatName,
            issue: `Beat at ${beat.actualPercentage}% should be between ${min}% and ${max}%`,
            severity: 'warning',
          });
        }
      }

      // Check theme statement
      if (!structure.themeStatement) {
        suggestions.push('Add a theme statement to guide your story');
      }

      // Check protagonist arc
      if (!structure.protagonistWant || !structure.protagonistNeed) {
        suggestions.push('Define what your protagonist wants vs. what they need');
      }
    }

    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      suggestions,
    };
  }

  // ============================================================================
  // Progress Tracking
  // ============================================================================

  private recalculateCompletion(structureId: string): void {
    const structure = this.structures.get(structureId);
    if (!structure) return;

    const completedBeats = structure.beats.filter(b =>
      b.status === BeatStatus.COMPLETE || b.status === BeatStatus.REVISED
    ).length;

    structure.completionPercentage = Math.round((completedBeats / structure.beats.length) * 100);
    structure.currentWordCount = structure.beats.reduce((sum, b) => sum + b.wordCount, 0);
  }

  getProgressReport(structureId: string): {
    structure: StoryStructure;
    template: StructureTemplate;
    beatProgress: { beat: StoryBeat; definition: BeatDefinition; isComplete: boolean }[];
    actProgress: { act: ActNumber; completedBeats: number; totalBeats: number }[];
    nextBeatToWork: StoryBeat | null;
  } {
    const structure = this.structures.get(structureId);
    if (!structure) throw new Error(`Structure not found: ${structureId}`);

    const template = this.templates.get(structure.templateId);
    if (!template) throw new Error(`Template not found: ${structure.templateId}`);

    const beatProgress = structure.beats.map(beat => {
      const definition = template.beats.find(b => b.beatId === beat.beatDefinitionId)!;
      return {
        beat,
        definition,
        isComplete: beat.status === BeatStatus.COMPLETE || beat.status === BeatStatus.REVISED,
      };
    });

    // Calculate act progress
    const actProgress: { act: ActNumber; completedBeats: number; totalBeats: number }[] = [];
    for (const boundary of template.actBoundaries) {
      const actBeats = beatProgress.filter(bp => bp.definition.act === boundary.act);
      actProgress.push({
        act: boundary.act,
        completedBeats: actBeats.filter(bp => bp.isComplete).length,
        totalBeats: actBeats.length,
      });
    }

    // Find next beat to work on
    const nextBeatToWork = structure.beats.find(b =>
      b.status === BeatStatus.NOT_STARTED || b.status === BeatStatus.OUTLINED
    ) || null;

    return { structure, template, beatProgress, actProgress, nextBeatToWork };
  }

  // ============================================================================
  // Standard API Methods
  // ============================================================================

  getStats(): {
    templateCount: number;
    structureCount: number;
    seriesArcCount: number;
    frameworksAvailable: StructureFramework[];
  } {
    return {
      templateCount: this.templates.size,
      structureCount: this.structures.size,
      seriesArcCount: this.seriesArcs.size,
      frameworksAvailable: Array.from(this.templates.values()).map(t => t.framework),
    };
  }

  clear(): void {
    this.structures.clear();
    this.seriesArcs.clear();
    this.structuresByProject.clear();
    this.structuresByBook.clear();
    // Keep templates
  }

  exportToJSON(): string {
    return JSON.stringify({
      templates: Array.from(this.templates.entries()),
      structures: Array.from(this.structures.entries()),
      seriesArcs: Array.from(this.seriesArcs.entries()),
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);
    this.templates = new Map(data.templates);
    this.structures = new Map(data.structures);
    this.seriesArcs = new Map(data.seriesArcs);

    // Rebuild indexes
    for (const [structureId, structure] of this.structures) {
      if (!this.structuresByProject.has(structure.projectId)) {
        this.structuresByProject.set(structure.projectId, []);
      }
      this.structuresByProject.get(structure.projectId)!.push(structureId);

      if (structure.bookId) {
        this.structuresByBook.set(structure.bookId, structureId);
      }
    }
  }
}

export default StoryStructureEngine;
