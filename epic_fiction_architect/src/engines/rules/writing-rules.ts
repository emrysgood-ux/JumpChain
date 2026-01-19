/**
 * Epic Fiction Architect - Writing Rules Engine
 *
 * Detects banned constructions, phrases, and patterns based on
 * professional fiction writing standards. Implements the "Show Don't Tell"
 * philosophy with concrete pattern matching.
 */

// ============================================================================
// PART 1: BANNED CONSTRUCTIONS
// ============================================================================

export interface BannedConstruction {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  severity: 'critical' | 'major' | 'minor';
  category: ConstructionCategory;
  suggestion: string;
  examples: {
    bad: string;
    good: string;
  };
}

export type ConstructionCategory =
  | 'sequential_action'
  | 'vague_interiority'
  | 'anthropomorphized_abstraction'
  | 'filter_word'
  | 'purple_prose'
  | 'pacing_killer'
  | 'telling_emotion'
  | 'weak_verb'
  | 'redundant_attribution';

/**
 * Part 1: Banned Constructions - 31 patterns that indicate weak prose
 */
export const BANNED_CONSTRUCTIONS: BannedConstruction[] = [
  // 1. Sequential Action Pairs - ", then" constructions
  {
    id: 'seq-then-comma',
    name: 'Sequential ", then" construction',
    description: 'Chains two beats with ", then" creating mechanical prose',
    pattern: /,\s*then\s+\w+ed\b/gi,
    severity: 'major',
    category: 'sequential_action',
    suggestion: 'Use a period. Let the second action breathe as its own sentence.',
    examples: {
      bad: 'She opened the door, then stepped inside.',
      good: 'She opened the door. Her footsteps echoed on marble.'
    }
  },
  // 2. "Something [verbs] him/her"
  {
    id: 'something-verbs',
    name: '"Something [verbed] pronoun" construction',
    description: 'Vague interiority placeholder - what is "something"?',
    pattern: /\bsomething\s+(?:in|about|within)\s+(?:him|her|them)\s+\w+ed\b/gi,
    severity: 'critical',
    category: 'vague_interiority',
    suggestion: 'Name the specific sensation, memory, or impulse.',
    examples: {
      bad: 'Something in her shifted.',
      good: 'The old resentment cracked like ice.'
    }
  },
  // 3. "Silence [verbed]"
  {
    id: 'silence-verbed',
    name: 'Anthropomorphized silence',
    description: 'Silence cannot stretch, hang, or fall - show its effect on characters',
    pattern: /\b(?:the\s+)?silence\s+(?:stretched|hung|fell|descended|thickened|grew|settled|lingered|wrapped|enveloped|pressed)\b/gi,
    severity: 'major',
    category: 'anthropomorphized_abstraction',
    suggestion: 'Show what characters do in the silence, or cut entirely.',
    examples: {
      bad: 'The silence stretched between them.',
      good: 'Neither spoke. She traced the rim of her glass.'
    }
  },
  // 4. "Eyes [verbed] without looking"
  {
    id: 'eyes-without-looking',
    name: 'Synecdoche gone wrong',
    description: 'Eyes cannot search, find, or hold without the person doing so',
    pattern: /\b(?:his|her|their|the)\s+eyes\s+(?:searched|found|held|met|locked|bore into|wandered|scanned|roamed|traveled|darted|flicked)\b/gi,
    severity: 'minor',
    category: 'anthropomorphized_abstraction',
    suggestion: 'Use "gaze" or "look" instead, or show the whole person.',
    examples: {
      bad: 'Her eyes searched the room.',
      good: 'She scanned the crowd, looking for his face.'
    }
  },
  // 5. "[Body part] [verbed] of its own accord"
  {
    id: 'body-own-accord',
    name: 'Disembodied action',
    description: 'Body parts acting independently break reader immersion',
    pattern: /\b(?:hand|hands|arm|arms|leg|legs|foot|feet|finger|fingers|body|head)\s+(?:moved|reached|shot out|jerked|trembled|shook)\s+(?:of\s+(?:its|their)\s+own\s+accord|involuntarily|without\s+(?:his|her|their)\s+(?:permission|consent|volition))/gi,
    severity: 'minor',
    category: 'anthropomorphized_abstraction',
    suggestion: 'Show the character acting, with their emotional state.',
    examples: {
      bad: 'His hand reached out of its own accord.',
      good: 'He reached for her before he could stop himself.'
    }
  },
  // 6. "Couldn't help but [verb]"
  {
    id: 'couldnt-help-but',
    name: '"Couldn\'t help but" construction',
    description: 'Passive voice that distances reader from action',
    pattern: /\bcouldn't\s+help\s+but\s+\w+/gi,
    severity: 'major',
    category: 'filter_word',
    suggestion: 'Just have them do the thing.',
    examples: {
      bad: 'She couldn\'t help but smile.',
      good: 'A smile tugged at her lips.'
    }
  },
  // 7. "Found himself/herself [verb]ing"
  {
    id: 'found-self-verbing',
    name: '"Found [self] [verb]ing" filter',
    description: 'Distances reader from immediate experience',
    pattern: /\bfound\s+(?:himself|herself|themselves|themself)\s+\w+ing\b/gi,
    severity: 'major',
    category: 'filter_word',
    suggestion: 'Direct action: they did it.',
    examples: {
      bad: 'He found himself staring at her.',
      good: 'He stared at her.'
    }
  },
  // 8. "Began to / Started to"
  {
    id: 'began-started-to',
    name: '"Began to" / "Started to" filter',
    description: 'Either they do it or they don\'t',
    pattern: /\b(?:began|started)\s+to\s+\w+/gi,
    severity: 'minor',
    category: 'filter_word',
    suggestion: 'Just use the verb directly.',
    examples: {
      bad: 'She began to walk toward the door.',
      good: 'She walked toward the door.'
    }
  },
  // 9. "Seemed to / Appeared to"
  {
    id: 'seemed-appeared',
    name: '"Seemed to" / "Appeared to" hedging',
    description: 'Either commit or show uncertainty through action',
    pattern: /\b(?:seemed|appeared)\s+to\s+(?:be\s+)?\w+/gi,
    severity: 'minor',
    category: 'filter_word',
    suggestion: 'Commit to the action or show POV character\'s uncertainty.',
    examples: {
      bad: 'He seemed to be angry.',
      good: 'His jaw tightened. Was he angry, or just tired?'
    }
  },
  // 10. "Realized / Noticed / Knew"
  {
    id: 'realized-noticed-knew',
    name: 'Perception filter words',
    description: 'Shows the character noticing instead of the thing itself',
    pattern: /\b(?:she|he|they|I)\s+(?:realized|noticed|knew|understood|recognized|sensed|felt)\s+(?:that\s+)?/gi,
    severity: 'minor',
    category: 'filter_word',
    suggestion: 'Just show what they perceived directly.',
    examples: {
      bad: 'She realized the door was open.',
      good: 'The door stood open.'
    }
  },
  // 11. "A [emotion] washed over / flooded / filled"
  {
    id: 'emotion-washed-over',
    name: 'Emotion flooding/washing',
    description: 'Names the emotion instead of showing its physical manifestation',
    pattern: /\b(?:a\s+)?(?:wave\s+of\s+)?(?:fear|anger|rage|sadness|joy|happiness|relief|dread|panic|anxiety|guilt|shame|love|hatred|jealousy|envy)\s+(?:washed|flooded|filled|swept|crashed|surged|rushed)\s+(?:over|through)\b/gi,
    severity: 'critical',
    category: 'telling_emotion',
    suggestion: 'Show the physical sensation or behavioral change.',
    examples: {
      bad: 'Fear washed over her.',
      good: 'Her mouth went dry. The floor seemed to tilt.'
    }
  },
  // 12. "[Pronoun] felt [emotion]"
  {
    id: 'pronoun-felt-emotion',
    name: 'Direct emotion telling',
    description: 'Names the emotion instead of showing it',
    pattern: /\b(?:she|he|they|I)\s+felt\s+(?:a\s+)?(?:sudden\s+)?(?:fear|anger|rage|sadness|joy|happiness|relief|dread|panic|anxiety|guilt|shame|love|hatred|jealousy|envy|nervous|anxious|scared|angry|sad|happy|relieved|guilty|ashamed|jealous)\b/gi,
    severity: 'critical',
    category: 'telling_emotion',
    suggestion: 'Show physical symptoms or behavior instead.',
    examples: {
      bad: 'She felt scared.',
      good: 'Her hands wouldn\'t stop shaking.'
    }
  },
  // 13. "With a [emotion] [noun]"
  {
    id: 'with-emotion-noun',
    name: '"With a [emotion]" attribution',
    description: 'Telling emotion through dialogue attribution',
    pattern: /\bwith\s+(?:a\s+)?(?:nervous|anxious|angry|sad|happy|bitter|sardonic|wry|knowing|meaningful|pointed)\s+(?:laugh|smile|grin|look|glance|nod|shrug|sigh|chuckle)/gi,
    severity: 'minor',
    category: 'redundant_attribution',
    suggestion: 'Let the dialogue and action convey the emotion.',
    examples: {
      bad: '"Sure," she said with a bitter laugh.',
      good: '"Sure." She laughed, but her eyes didn\'t.'
    }
  },
  // 14. "Little did [pronoun] know"
  {
    id: 'little-did-know',
    name: '"Little did X know" foreshadowing',
    description: 'Heavy-handed authorial intrusion',
    pattern: /\blittle\s+did\s+(?:she|he|they|I|we)\s+know\b/gi,
    severity: 'critical',
    category: 'pacing_killer',
    suggestion: 'Trust your story structure. Cut it.',
    examples: {
      bad: 'Little did she know, this would change everything.',
      good: '[Just cut it. The events will speak for themselves.]'
    }
  },
  // 15. "If only [pronoun] had known"
  {
    id: 'if-only-known',
    name: '"If only X had known" hindsight',
    description: 'Breaks narrative tension with future knowledge',
    pattern: /\bif\s+only\s+(?:she|he|they|I)\s+had\s+known\b/gi,
    severity: 'major',
    category: 'pacing_killer',
    suggestion: 'Stay in the present moment of the narrative.',
    examples: {
      bad: 'If only she had known what was coming.',
      good: '[Cut. Let the reader discover alongside the character.]'
    }
  },
  // 16. "Orbs" for eyes
  {
    id: 'orbs-for-eyes',
    name: '"Orbs" for eyes',
    description: 'Purple prose - just say eyes',
    pattern: /\b(?:his|her|their|the)\s+(?:\w+\s+)?orbs\b/gi,
    severity: 'critical',
    category: 'purple_prose',
    suggestion: 'Just say "eyes."',
    examples: {
      bad: 'Her cerulean orbs gazed at him.',
      good: 'She looked at him.'
    }
  },
  // 17. "Ministrations"
  {
    id: 'ministrations',
    name: '"Ministrations"',
    description: 'Pretentious word for actions - be specific',
    pattern: /\bministrations\b/gi,
    severity: 'major',
    category: 'purple_prose',
    suggestion: 'Name the specific action being performed.',
    examples: {
      bad: 'She moaned at his ministrations.',
      good: 'She moaned as his fingers traced her spine.'
    }
  },
  // 18. "Velvet heat/steel"
  {
    id: 'velvet-heat-steel',
    name: '"Velvet heat" / "velvet steel"',
    description: 'Clichéd sensory description',
    pattern: /\bvelvet\s+(?:heat|steel|hardness|softness)\b/gi,
    severity: 'major',
    category: 'purple_prose',
    suggestion: 'Find a fresh comparison.',
    examples: {
      bad: 'His velvet heat pressed against her.',
      good: '[Use specific sensory details unique to your characters.]'
    }
  },
  // 19. "The [adjective] [man/woman]"
  {
    id: 'the-adjective-person',
    name: '"The [adjective] man/woman" epithet',
    description: 'Epithet substitution for character names',
    pattern: /\bthe\s+(?:older|younger|taller|shorter|dark-haired|blonde|brunette|muscular|slender|handsome|beautiful)\s+(?:man|woman|male|female)\b/gi,
    severity: 'minor',
    category: 'purple_prose',
    suggestion: 'Use their name or a pronoun.',
    examples: {
      bad: 'The older man sighed.',
      good: 'Marcus sighed.'
    }
  },
  // 20. "Pools" (for eyes or other)
  {
    id: 'pools-description',
    name: '"Pools" for eyes or other',
    description: 'Clichéd metaphor',
    pattern: /\b(?:deep\s+)?pools\s+of\s+(?:\w+\s+)?(?:blue|green|brown|hazel|amber|chocolate|emerald|sapphire|desire|lust|emotion)\b/gi,
    severity: 'major',
    category: 'purple_prose',
    suggestion: 'Just describe the eyes directly or skip it.',
    examples: {
      bad: 'She stared into the deep pools of his eyes.',
      good: 'She met his gaze.'
    }
  },
  // 21. "Digits" for fingers
  {
    id: 'digits-for-fingers',
    name: '"Digits" for fingers',
    description: 'Unnecessarily clinical word choice',
    pattern: /\b(?:his|her|their)\s+digits\b/gi,
    severity: 'major',
    category: 'purple_prose',
    suggestion: 'Just say "fingers."',
    examples: {
      bad: 'His digits traced her collarbone.',
      good: 'His fingers traced her collarbone.'
    }
  },
  // 22. "Nether regions" or similar
  {
    id: 'nether-regions',
    name: '"Nether regions" euphemism',
    description: 'Coy euphemism that breaks immersion',
    pattern: /\b(?:nether\s+regions?|neither\s+regions?|private\s+parts?|intimate\s+area|womanhood|manhood|center|core|sex)\b/gi,
    severity: 'major',
    category: 'purple_prose',
    suggestion: 'Use anatomically accurate terms or contextually appropriate words.',
    examples: {
      bad: 'He touched her nether regions.',
      good: '[Use specific, appropriate anatomical terms for your genre.]'
    }
  },
  // 23. Overuse of "suddenly"
  {
    id: 'suddenly',
    name: '"Suddenly" as surprise marker',
    description: 'If it\'s sudden, the writing should make it feel sudden',
    pattern: /\bsuddenly\b/gi,
    severity: 'minor',
    category: 'weak_verb',
    suggestion: 'Use short sentences, paragraph breaks, or punchy verbs instead.',
    examples: {
      bad: 'Suddenly, a shot rang out.',
      good: 'A shot. Everyone dropped.'
    }
  },
  // 24. "Very" + adjective
  {
    id: 'very-adjective',
    name: '"Very" + adjective',
    description: 'Use a stronger word instead',
    pattern: /\bvery\s+(?:big|small|good|bad|happy|sad|angry|scared|tired|fast|slow|hot|cold|important|interesting)\b/gi,
    severity: 'minor',
    category: 'weak_verb',
    suggestion: 'Use a single, stronger adjective.',
    examples: {
      bad: 'She was very tired.',
      good: 'She was exhausted.'
    }
  },
  // 25. "Could see/hear/feel/smell"
  {
    id: 'could-sense-verb',
    name: '"Could see/hear/feel" filter',
    description: 'Adds unnecessary distance from the sensory experience',
    pattern: /\b(?:could|can)\s+(?:see|hear|feel|smell|taste|sense)\b/gi,
    severity: 'minor',
    category: 'filter_word',
    suggestion: 'Just describe what they perceive directly.',
    examples: {
      bad: 'She could see the mountain in the distance.',
      good: 'The mountain loomed in the distance.'
    }
  },
  // 26. "Was [verb]ing" (progressive past)
  {
    id: 'was-verbing',
    name: '"Was [verb]ing" weak progressive',
    description: 'Often weaker than simple past tense',
    pattern: /\b(?:was|were)\s+\w+ing\b/gi,
    severity: 'minor',
    category: 'weak_verb',
    suggestion: 'Consider using simple past tense for stronger prose.',
    examples: {
      bad: 'She was walking down the street.',
      good: 'She walked down the street.'
    }
  },
  // 27. "In order to"
  {
    id: 'in-order-to',
    name: '"In order to" wordiness',
    description: 'Just use "to"',
    pattern: /\bin\s+order\s+to\b/gi,
    severity: 'minor',
    category: 'pacing_killer',
    suggestion: 'Replace with "to".',
    examples: {
      bad: 'She left early in order to catch the train.',
      good: 'She left early to catch the train.'
    }
  },
  // 28. "The fact that"
  {
    id: 'the-fact-that',
    name: '"The fact that" filler',
    description: 'Almost always can be cut or rewritten',
    pattern: /\bthe\s+fact\s+that\b/gi,
    severity: 'minor',
    category: 'pacing_killer',
    suggestion: 'Rewrite to eliminate this phrase.',
    examples: {
      bad: 'She was bothered by the fact that he lied.',
      good: 'His lies bothered her.'
    }
  },
  // 29. "At this point in time"
  {
    id: 'at-this-point',
    name: '"At this point in time" wordiness',
    description: 'Just say "now"',
    pattern: /\bat\s+this\s+point\s+in\s+time\b/gi,
    severity: 'minor',
    category: 'pacing_killer',
    suggestion: 'Replace with "now" or cut entirely.',
    examples: {
      bad: 'At this point in time, she decided to leave.',
      good: 'She decided to leave.'
    }
  },
  // 30. "Needless to say"
  {
    id: 'needless-to-say',
    name: '"Needless to say"',
    description: 'If it\'s needless, don\'t say it',
    pattern: /\bneedless\s+to\s+say\b/gi,
    severity: 'minor',
    category: 'pacing_killer',
    suggestion: 'Just say it, or cut it entirely.',
    examples: {
      bad: 'Needless to say, she was furious.',
      good: 'She slammed the door hard enough to crack the frame.'
    }
  },
  // 31. "Let out a breath [pronoun] didn't know [pronoun] was holding"
  {
    id: 'breath-didnt-know-holding',
    name: 'Breath they didn\'t know they were holding',
    description: 'Extremely overused cliché',
    pattern: /\b(?:let\s+out|released|exhaled)\s+(?:a|the)\s+breath\s+(?:she|he|they|I)\s+didn't\s+(?:know|realize)\s+(?:she|he|they|I)\s+(?:was|were|had\s+been)\s+holding\b/gi,
    severity: 'critical',
    category: 'purple_prose',
    suggestion: 'Just say they exhaled, or show relief differently.',
    examples: {
      bad: 'She let out a breath she didn\'t know she was holding.',
      good: 'She exhaled. Safe.'
    }
  }
];

// ============================================================================
// PART 2: BANNED WORDS AND PHRASES
// ============================================================================

export interface BannedPhrase {
  id: string;
  phrase: string | RegExp;
  category: PhraseCategory;
  severity: 'critical' | 'major' | 'minor';
  reason: string;
  suggestion: string;
}

export type PhraseCategory =
  | 'physical_tell'
  | 'vague_interiority'
  | 'cliche_reaction'
  | 'purple_prose_word'
  | 'hedging_word'
  | 'filler_word'
  | 'melodrama'
  | 'body_part_cliche'
  | 'emotion_shortcut';

/**
 * Part 2: Banned Words and Phrases organized by category
 */
export const BANNED_PHRASES: BannedPhrase[] = [
  // Physical Tells (clichéd emotional indicators)
  { id: 'heart-pounded', phrase: /\bheart\s+(?:pounded|raced|hammered|thundered|skipped)\b/gi, category: 'physical_tell', severity: 'minor', reason: 'Overused physical tell', suggestion: 'Show the emotion through behavior' },
  { id: 'breath-caught', phrase: /\bbreath\s+(?:caught|hitched|quickened)\b/gi, category: 'physical_tell', severity: 'minor', reason: 'Overused physical tell', suggestion: 'Vary your physical indicators' },
  { id: 'stomach-dropped', phrase: /\bstomach\s+(?:dropped|lurched|churned|knotted|flipped)\b/gi, category: 'physical_tell', severity: 'minor', reason: 'Overused physical tell', suggestion: 'Find fresh ways to show dread' },
  { id: 'blood-ran-cold', phrase: /\bblood\s+(?:ran|turned)\s+cold\b/gi, category: 'physical_tell', severity: 'major', reason: 'Cliché', suggestion: 'Show fear through specific behavior' },
  { id: 'spine-tingled', phrase: /\bspine\s+(?:tingled|shivered|chilled)\b/gi, category: 'physical_tell', severity: 'minor', reason: 'Overused physical tell', suggestion: 'Describe the actual sensation uniquely' },
  { id: 'knees-weak', phrase: /\bknees\s+(?:went\s+)?weak\b/gi, category: 'physical_tell', severity: 'major', reason: 'Cliché', suggestion: 'Show physical weakness through action' },
  { id: 'mouth-dry', phrase: /\bmouth\s+(?:went\s+)?dry\b/gi, category: 'physical_tell', severity: 'minor', reason: 'Overused but acceptable sparingly', suggestion: 'Use rarely' },

  // Vague Interiority Placeholders
  { id: 'something-inside', phrase: /\bsomething\s+(?:inside|within|deep\s+within)\b/gi, category: 'vague_interiority', severity: 'critical', reason: 'Too vague - what is "something"?', suggestion: 'Name the specific feeling, memory, or impulse' },
  { id: 'part-of-pronoun', phrase: /\b(?:a\s+)?part\s+of\s+(?:him|her|them)\b/gi, category: 'vague_interiority', severity: 'major', reason: 'Vague - which part?', suggestion: 'Be specific about the internal conflict' },
  { id: 'somehow', phrase: /\bsomehow\b/gi, category: 'vague_interiority', severity: 'minor', reason: 'Hand-wavy explanation', suggestion: 'Explain how, or cut it' },

  // Clichéd Reactions
  { id: 'let-out-breath', phrase: /\blet\s+out\s+(?:a|the)\s+breath\b/gi, category: 'cliche_reaction', severity: 'minor', reason: 'Overused relief signal', suggestion: 'Vary your relief indicators' },
  { id: 'rolled-eyes', phrase: /\b(?:rolled|rolling)\s+(?:her|his|their)\s+eyes\b/gi, category: 'cliche_reaction', severity: 'minor', reason: 'Overused annoyance signal', suggestion: 'Show annoyance through dialogue or action' },
  { id: 'raised-eyebrow', phrase: /\braised\s+(?:an?\s+)?(?:eye)?brow\b/gi, category: 'cliche_reaction', severity: 'minor', reason: 'Overused skepticism signal', suggestion: 'Show skepticism through dialogue' },
  { id: 'clenched-jaw', phrase: /\b(?:clenched|set)\s+(?:her|his|their)\s+jaw\b/gi, category: 'cliche_reaction', severity: 'minor', reason: 'Overused anger/determination signal', suggestion: 'Vary your tension indicators' },
  { id: 'narrowed-eyes', phrase: /\bnarrowed\s+(?:her|his|their)\s+eyes\b/gi, category: 'cliche_reaction', severity: 'minor', reason: 'Overused suspicion signal', suggestion: 'Show suspicion through behavior or dialogue' },

  // Purple Prose Words
  { id: 'orbs', phrase: /\borbs\b/gi, category: 'purple_prose_word', severity: 'critical', reason: 'Never use "orbs" for eyes', suggestion: 'Say "eyes"' },
  { id: 'ministrations', phrase: /\bministrations\b/gi, category: 'purple_prose_word', severity: 'major', reason: 'Pretentious and vague', suggestion: 'Name the specific action' },
  { id: 'visage', phrase: /\bvisage\b/gi, category: 'purple_prose_word', severity: 'major', reason: 'Archaic and pretentious', suggestion: 'Say "face"' },
  { id: 'countenance', phrase: /\bcountenance\b/gi, category: 'purple_prose_word', severity: 'major', reason: 'Archaic and pretentious', suggestion: 'Say "face" or "expression"' },
  { id: 'alabaster', phrase: /\balabaster\b/gi, category: 'purple_prose_word', severity: 'major', reason: 'Clichéd skin description', suggestion: 'Use specific, fresh description or skip it' },
  { id: 'raven-tresses', phrase: /\braven\s+(?:tresses|locks|hair)\b/gi, category: 'purple_prose_word', severity: 'major', reason: 'Clichéd hair description', suggestion: 'Say "black hair" or skip the description' },
  { id: 'crimson-lips', phrase: /\bcrimson\s+lips\b/gi, category: 'purple_prose_word', severity: 'major', reason: 'Clichéd lip description', suggestion: 'Skip it or find a fresh approach' },
  { id: 'lithe', phrase: /\blithe\b/gi, category: 'purple_prose_word', severity: 'minor', reason: 'Often purple and cliché', suggestion: 'Be more specific about movement quality' },

  // Hedging Words
  { id: 'somewhat', phrase: /\bsomewhat\b/gi, category: 'hedging_word', severity: 'minor', reason: 'Weakens prose', suggestion: 'Commit to the description or cut it' },
  { id: 'rather', phrase: /\brather\s+(?!than)\b/gi, category: 'hedging_word', severity: 'minor', reason: 'Weakens prose', suggestion: 'Cut it or commit' },
  { id: 'quite', phrase: /\bquite\b/gi, category: 'hedging_word', severity: 'minor', reason: 'Usually adds nothing', suggestion: 'Cut it or use a stronger word' },
  { id: 'slightly', phrase: /\bslightly\b/gi, category: 'hedging_word', severity: 'minor', reason: 'Often unnecessary', suggestion: 'Cut it or be specific about the degree' },

  // Filler Words
  { id: 'just', phrase: /\bjust\b/gi, category: 'filler_word', severity: 'minor', reason: 'Often unnecessary', suggestion: 'Cut it in most cases' },
  { id: 'really', phrase: /\breally\b/gi, category: 'filler_word', severity: 'minor', reason: 'Usually adds nothing', suggestion: 'Use a stronger word or cut' },
  { id: 'basically', phrase: /\bbasically\b/gi, category: 'filler_word', severity: 'minor', reason: 'Filler word', suggestion: 'Cut it' },
  { id: 'actually', phrase: /\bactually\b/gi, category: 'filler_word', severity: 'minor', reason: 'Often unnecessary', suggestion: 'Cut it or examine if contrast is needed' },

  // Melodrama Markers
  { id: 'entire-world', phrase: /\b(?:her|his|their|the)\s+entire\s+world\b/gi, category: 'melodrama', severity: 'major', reason: 'Melodramatic', suggestion: 'Be specific about what was affected' },
  { id: 'never-be-same', phrase: /\b(?:nothing|everything)\s+would\s+(?:ever\s+)?be\s+the\s+same\b/gi, category: 'melodrama', severity: 'major', reason: 'Melodramatic and vague', suggestion: 'Show the specific change' },
  { id: 'world-stopped', phrase: /\b(?:the\s+)?world\s+(?:stopped|stood\s+still|fell\s+away)\b/gi, category: 'melodrama', severity: 'major', reason: 'Melodramatic', suggestion: 'Show the character\'s specific experience' },

  // Body Part Clichés
  { id: 'pools-of-eyes', phrase: /\bpools?\s+of\s+(?:\w+\s+)?(?:blue|green|brown|eyes)\b/gi, category: 'body_part_cliche', severity: 'major', reason: 'Clichéd eye description', suggestion: 'Skip elaborate eye descriptions' },
  { id: 'cupids-bow', phrase: /\bcupid'?s\s+bow\b/gi, category: 'body_part_cliche', severity: 'minor', reason: 'Overused lip description', suggestion: 'Skip it or find fresh description' },
  { id: 'strong-jaw', phrase: /\bstrong\s+jaw\b/gi, category: 'body_part_cliche', severity: 'minor', reason: 'Clichéd masculine description', suggestion: 'Skip it or be more specific' },
  { id: 'piercing-eyes', phrase: /\bpiercing\s+(?:blue\s+)?eyes\b/gi, category: 'body_part_cliche', severity: 'major', reason: 'Clichéd eye description', suggestion: 'Show the intensity through behavior' },

  // Emotion Shortcuts
  { id: 'felt-tears', phrase: /\bfelt\s+(?:hot\s+)?tears\b/gi, category: 'emotion_shortcut', severity: 'minor', reason: 'Telling emotion', suggestion: 'Show crying through action' },
  { id: 'felt-anger', phrase: /\bfelt\s+(?:a\s+)?(?:surge\s+of\s+)?(?:anger|rage)\b/gi, category: 'emotion_shortcut', severity: 'major', reason: 'Telling emotion', suggestion: 'Show anger through physical behavior' },
  { id: 'felt-happiness', phrase: /\bfelt\s+(?:a\s+)?(?:surge\s+of\s+)?(?:happiness|joy)\b/gi, category: 'emotion_shortcut', severity: 'major', reason: 'Telling emotion', suggestion: 'Show joy through behavior' }
];

// ============================================================================
// PART 3: SEARCH PATTERNS FOR REVISION
// ============================================================================

export interface SearchPattern {
  id: string;
  name: string;
  pattern: RegExp;
  description: string;
  purpose: string;
}

/**
 * Part 3: Quick-scan search patterns for revision
 */
export const SEARCH_PATTERNS: SearchPattern[] = [
  { id: 'was-were', name: 'Passive voice markers', pattern: /\b(?:was|were)\s+\w+(?:ed|ing)\b/gi, description: 'Find potential passive voice', purpose: 'Consider active voice alternatives' },
  { id: 'ly-adverbs', name: '-ly adverbs', pattern: /\b\w+ly\b/gi, description: 'Find adverbs', purpose: 'Check if a stronger verb would work' },
  { id: 'that-clauses', name: '"That" clauses', pattern: /\bthat\s+(?:was|is|were|are|had|have|he|she|they|it)\b/gi, description: 'Find "that" clauses', purpose: 'Many can be cut' },
  { id: 'there-was-were', name: '"There was/were" constructions', pattern: /\bthere\s+(?:was|were|is|are)\b/gi, description: 'Find expletive constructions', purpose: 'Often can be rewritten stronger' },
  { id: 'it-was', name: '"It was" constructions', pattern: /\bit\s+was\s+(?:a|the|clear|obvious|evident)\b/gi, description: 'Find weak "it was" constructions', purpose: 'Consider more direct phrasing' },
  { id: 'said-adverb', name: 'Dialogue attribution adverbs', pattern: /\bsaid\s+\w+ly\b/gi, description: 'Find modified "said"', purpose: 'Usually cut the adverb or use action beat' },
  { id: 'ing-sentence-start', name: '-ing sentence starts', pattern: /^[A-Z]\w+ing\b/gm, description: 'Find sentences starting with -ing', purpose: 'Check for dangling participles' },
  { id: 'emotion-words', name: 'Direct emotion words', pattern: /\b(?:angry|sad|happy|scared|nervous|anxious|excited|confused|frustrated|irritated|annoyed|worried|afraid)\b/gi, description: 'Find emotion words', purpose: 'Consider showing instead of telling' }
];

// ============================================================================
// PART 4: EROTICA-SPECIFIC RULES
// ============================================================================

export interface EroticaRule {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'critical' | 'major' | 'minor';
  category: EroticaCategory;
  reason: string;
  suggestion: string;
}

export type EroticaCategory =
  | 'euphemism'
  | 'purple_anatomy'
  | 'pacing'
  | 'choreography'
  | 'emotion';

/**
 * Part 4: Erotica-specific rules
 */
export const EROTICA_RULES: EroticaRule[] = [
  // Euphemisms to avoid
  { id: 'nether-regions', name: '"Nether regions"', pattern: /\bnether\s+regions?\b/gi, severity: 'critical', category: 'euphemism', reason: 'Coy euphemism breaks immersion', suggestion: 'Use direct anatomical terms' },
  { id: 'womanhood-manhood', name: '"Womanhood/Manhood"', pattern: /\b(?:womanhood|manhood)\b/gi, severity: 'major', category: 'euphemism', reason: 'Victorian euphemism', suggestion: 'Use direct anatomical terms' },
  { id: 'core', name: '"Core" as euphemism', pattern: /\b(?:her|his)\s+core\b/gi, severity: 'major', category: 'euphemism', reason: 'Vague euphemism', suggestion: 'Be specific or use direct terms' },
  { id: 'center', name: '"Center" as euphemism', pattern: /\b(?:her|his)\s+center\b/gi, severity: 'major', category: 'euphemism', reason: 'Vague euphemism', suggestion: 'Be specific or use direct terms' },
  { id: 'sex-noun', name: '"Sex" as noun for genitals', pattern: /\b(?:her|his)\s+sex\b/gi, severity: 'minor', category: 'euphemism', reason: 'Dated terminology', suggestion: 'Use direct anatomical terms' },
  { id: 'bundle-of-nerves', name: '"Bundle of nerves"', pattern: /\bbundle\s+of\s+nerves\b/gi, severity: 'major', category: 'euphemism', reason: 'Anatomical euphemism', suggestion: 'Use direct terms' },

  // Purple anatomy descriptions
  { id: 'velvet-steel', name: '"Velvet steel" etc.', pattern: /\bvelvet\s+(?:steel|heat|hardness)\b/gi, severity: 'major', category: 'purple_anatomy', reason: 'Clichéd description', suggestion: 'Use fresh sensory detail' },
  { id: 'turgid', name: '"Turgid"', pattern: /\bturgid\b/gi, severity: 'critical', category: 'purple_anatomy', reason: 'Unintentionally funny', suggestion: 'Use direct description' },
  { id: 'throbbing-member', name: '"Throbbing member"', pattern: /\bthrobbing\s+member\b/gi, severity: 'critical', category: 'purple_anatomy', reason: 'Clichéd and dated', suggestion: 'Use direct terms or fresh description' },
  { id: 'weeping-tip', name: '"Weeping tip"', pattern: /\bweeping\s+(?:tip|head|slit)\b/gi, severity: 'major', category: 'purple_anatomy', reason: 'Purple prose cliché', suggestion: 'Use direct description' },
  { id: 'honeyed', name: '"Honeyed" anything', pattern: /\bhoneyed\s+\w+\b/gi, severity: 'major', category: 'purple_anatomy', reason: 'Clichéd sensory description', suggestion: 'Use fresh description' },

  // Pacing issues
  { id: 'clothing-inventory', name: 'Clothing removal inventory', pattern: /\b(?:removed|pulled\s+off|stripped\s+off)\s+(?:her|his)\s+(?:shirt|pants|jeans|dress|bra|panties|boxers|underwear)\s+(?:and|then|,)/gi, severity: 'minor', category: 'pacing', reason: 'Mechanical undressing sequence', suggestion: 'Integrate with emotion, skip some steps' },
  { id: 'body-part-inventory', name: 'Body part inventory', pattern: /\b(?:moved|kissed|touched|caressed)\s+(?:from|to)\s+(?:her|his)\s+\w+\s+(?:to|then\s+to)\s+(?:her|his)\s+\w+/gi, severity: 'minor', category: 'pacing', reason: 'Mechanical choreography', suggestion: 'Focus on emotional impact, not geography' },

  // Choreography problems
  { id: 'impossible-position', name: 'Physically impossible position', pattern: /\bwhile\s+(?:still\s+)?(?:kissing|holding|pinning)\b.*\b(?:removed|pulled|reached)\b/gi, severity: 'major', category: 'choreography', reason: 'May be physically impossible', suggestion: 'Check if this is anatomically feasible' },

  // Emotion in erotica
  { id: 'pleasure-crashed', name: 'Pleasure crashing/washing', pattern: /\bpleasure\s+(?:crashed|washed|flooded|rolled)\s+(?:over|through)\b/gi, severity: 'major', category: 'emotion', reason: 'Telling pleasure instead of showing', suggestion: 'Show through physical reactions and sensations' },
  { id: 'saw-stars', name: '"Saw stars"', pattern: /\bsaw\s+stars\b/gi, severity: 'major', category: 'emotion', reason: 'Clichéd pleasure indicator', suggestion: 'Find fresh way to show intensity' },
  { id: 'toes-curled', name: '"Toes curled"', pattern: /\btoes\s+curled\b/gi, severity: 'minor', category: 'emotion', reason: 'Overused pleasure indicator', suggestion: 'Use sparingly or find alternatives' }
];

// ============================================================================
// MAIN ENGINE CLASS
// ============================================================================

export interface RuleViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  category: string;
  severity: 'critical' | 'major' | 'minor';
  text: string;
  position: {
    start: number;
    end: number;
    line?: number;
    column?: number;
  };
  reason: string;
  suggestion: string;
}

export interface RulesAnalysisResult {
  violations: RuleViolation[];
  summary: {
    total: number;
    critical: number;
    major: number;
    minor: number;
    byCategory: Map<string, number>;
  };
  score: number; // 0-100, higher is better
  searchPatternMatches: Map<string, number>; // Pattern ID -> count
}

export interface WritingRulesOptions {
  includeEroticaRules?: boolean;
  severityThreshold?: 'critical' | 'major' | 'minor';
  excludeCategories?: string[];
  excludeRuleIds?: string[];
  runSearchPatterns?: boolean;
}

/**
 * Writing Rules Engine - Detects banned patterns and violations
 */
export class WritingRulesEngine {
  private bannedConstructions: BannedConstruction[];
  private bannedPhrases: BannedPhrase[];
  private searchPatterns: SearchPattern[];
  private eroticaRules: EroticaRule[];

  constructor() {
    this.bannedConstructions = [...BANNED_CONSTRUCTIONS];
    this.bannedPhrases = [...BANNED_PHRASES];
    this.searchPatterns = [...SEARCH_PATTERNS];
    this.eroticaRules = [...EROTICA_RULES];
  }

  /**
   * Analyze text for rule violations
   */
  analyze(text: string, options: WritingRulesOptions = {}): RulesAnalysisResult {
    const {
      includeEroticaRules = false,
      severityThreshold = 'minor',
      excludeCategories = [],
      excludeRuleIds = [],
      runSearchPatterns = true
    } = options;

    const violations: RuleViolation[] = [];
    const severityOrder = { critical: 0, major: 1, minor: 2 };
    const thresholdLevel = severityOrder[severityThreshold];

    // Check banned constructions
    for (const rule of this.bannedConstructions) {
      if (excludeRuleIds.includes(rule.id)) continue;
      if (excludeCategories.includes(rule.category)) continue;
      if (severityOrder[rule.severity] > thresholdLevel) continue;

      const matches = this.findMatches(text, rule.pattern);
      for (const match of matches) {
        violations.push({
          id: `${rule.id}-${match.start}`,
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          severity: rule.severity,
          text: match.text,
          position: match,
          reason: rule.description,
          suggestion: rule.suggestion
        });
      }
    }

    // Check banned phrases
    for (const rule of this.bannedPhrases) {
      if (excludeRuleIds.includes(rule.id)) continue;
      if (excludeCategories.includes(rule.category)) continue;
      if (severityOrder[rule.severity] > thresholdLevel) continue;

      const pattern = typeof rule.phrase === 'string'
        ? new RegExp(`\\b${this.escapeRegex(rule.phrase)}\\b`, 'gi')
        : rule.phrase;

      const matches = this.findMatches(text, pattern);
      for (const match of matches) {
        violations.push({
          id: `${rule.id}-${match.start}`,
          ruleId: rule.id,
          ruleName: rule.phrase.toString(),
          category: rule.category,
          severity: rule.severity,
          text: match.text,
          position: match,
          reason: rule.reason,
          suggestion: rule.suggestion
        });
      }
    }

    // Check erotica rules if enabled
    if (includeEroticaRules) {
      for (const rule of this.eroticaRules) {
        if (excludeRuleIds.includes(rule.id)) continue;
        if (excludeCategories.includes(rule.category)) continue;
        if (severityOrder[rule.severity] > thresholdLevel) continue;

        const matches = this.findMatches(text, rule.pattern);
        for (const match of matches) {
          violations.push({
            id: `${rule.id}-${match.start}`,
            ruleId: rule.id,
            ruleName: rule.name,
            category: `erotica_${rule.category}`,
            severity: rule.severity,
            text: match.text,
            position: match,
            reason: rule.reason,
            suggestion: rule.suggestion
          });
        }
      }
    }

    // Run search patterns
    const searchPatternMatches = new Map<string, number>();
    if (runSearchPatterns) {
      for (const pattern of this.searchPatterns) {
        const matches = this.findMatches(text, pattern.pattern);
        searchPatternMatches.set(pattern.id, matches.length);
      }
    }

    // Calculate summary
    const summary = {
      total: violations.length,
      critical: violations.filter(v => v.severity === 'critical').length,
      major: violations.filter(v => v.severity === 'major').length,
      minor: violations.filter(v => v.severity === 'minor').length,
      byCategory: new Map<string, number>()
    };

    for (const v of violations) {
      const count = summary.byCategory.get(v.category) || 0;
      summary.byCategory.set(v.category, count + 1);
    }

    // Calculate score (100 - weighted violations per 1000 words)
    const wordCount = text.split(/\s+/).length;
    const weightedViolations =
      summary.critical * 10 +
      summary.major * 5 +
      summary.minor * 1;
    const violationsPerThousand = (weightedViolations / wordCount) * 1000;
    const score = Math.max(0, Math.round(100 - violationsPerThousand));

    return {
      violations,
      summary,
      score,
      searchPatternMatches
    };
  }

  /**
   * Quick analysis for real-time feedback
   */
  quickAnalyze(text: string): { violations: number; criticalCount: number; score: number; topViolation: RuleViolation | null } {
    const result = this.analyze(text, { severityThreshold: 'major' });
    return {
      violations: result.summary.total,
      criticalCount: result.summary.critical,
      score: result.score,
      topViolation: result.violations[0] || null
    };
  }

  /**
   * Check a specific rule against text
   */
  checkRule(text: string, ruleId: string): RuleViolation[] {
    const result = this.analyze(text, {
      excludeRuleIds: this.bannedConstructions
        .filter(r => r.id !== ruleId)
        .map(r => r.id)
        .concat(
          this.bannedPhrases
            .filter(r => r.id !== ruleId)
            .map(r => r.id)
        )
    });
    return result.violations;
  }

  /**
   * Generate a readable report
   */
  generateReport(result: RulesAnalysisResult): string {
    const lines: string[] = [];

    lines.push('# Writing Rules Analysis Report');
    lines.push('');
    lines.push(`## Summary`);
    lines.push(`- **Score**: ${result.score}/100`);
    lines.push(`- **Total Violations**: ${result.summary.total}`);
    lines.push(`  - Critical: ${result.summary.critical}`);
    lines.push(`  - Major: ${result.summary.major}`);
    lines.push(`  - Minor: ${result.summary.minor}`);
    lines.push('');

    if (result.summary.byCategory.size > 0) {
      lines.push('## Violations by Category');
      for (const [category, count] of result.summary.byCategory) {
        lines.push(`- ${category}: ${count}`);
      }
      lines.push('');
    }

    if (result.violations.length > 0) {
      lines.push('## Violations');
      lines.push('');

      // Group by severity
      const critical = result.violations.filter(v => v.severity === 'critical');
      const major = result.violations.filter(v => v.severity === 'major');
      const minor = result.violations.filter(v => v.severity === 'minor');

      if (critical.length > 0) {
        lines.push('### Critical');
        for (const v of critical) {
          lines.push(`- **"${v.text}"** (${v.ruleName})`);
          lines.push(`  - ${v.reason}`);
          lines.push(`  - Suggestion: ${v.suggestion}`);
        }
        lines.push('');
      }

      if (major.length > 0) {
        lines.push('### Major');
        for (const v of major) {
          lines.push(`- **"${v.text}"** (${v.ruleName})`);
          lines.push(`  - ${v.reason}`);
          lines.push(`  - Suggestion: ${v.suggestion}`);
        }
        lines.push('');
      }

      if (minor.length > 0) {
        lines.push('### Minor');
        for (const v of minor.slice(0, 20)) { // Limit minor to 20
          lines.push(`- **"${v.text}"** (${v.ruleName})`);
          lines.push(`  - Suggestion: ${v.suggestion}`);
        }
        if (minor.length > 20) {
          lines.push(`- ...and ${minor.length - 20} more minor violations`);
        }
        lines.push('');
      }
    }

    // Search pattern summary
    if (result.searchPatternMatches.size > 0) {
      lines.push('## Search Patterns (for manual review)');
      for (const pattern of this.searchPatterns) {
        const count = result.searchPatternMatches.get(pattern.id) || 0;
        if (count > 0) {
          lines.push(`- **${pattern.name}**: ${count} matches - ${pattern.purpose}`);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Add a custom banned construction
   */
  addBannedConstruction(rule: BannedConstruction): void {
    this.bannedConstructions.push(rule);
  }

  /**
   * Add a custom banned phrase
   */
  addBannedPhrase(rule: BannedPhrase): void {
    this.bannedPhrases.push(rule);
  }

  /**
   * Get all rules for a category
   */
  getRulesByCategory(category: string): (BannedConstruction | BannedPhrase)[] {
    const constructions = this.bannedConstructions.filter(r => r.category === category);
    const phrases = this.bannedPhrases.filter(r => r.category === category);
    return [...constructions, ...phrases];
  }

  /**
   * Get all rule IDs
   */
  getAllRuleIds(): string[] {
    return [
      ...this.bannedConstructions.map(r => r.id),
      ...this.bannedPhrases.map(r => r.id),
      ...this.eroticaRules.map(r => r.id)
    ];
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private findMatches(text: string, pattern: RegExp): Array<{ text: string; start: number; end: number; line?: number; column?: number }> {
    const matches: Array<{ text: string; start: number; end: number; line?: number; column?: number }> = [];

    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // Calculate line and column
      const beforeMatch = text.substring(0, start);
      const lines = beforeMatch.split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;

      matches.push({
        text: match[0],
        start,
        end,
        line,
        column
      });

      // Prevent infinite loop for zero-length matches
      if (match[0].length === 0) {
        pattern.lastIndex++;
      }
    }

    return matches;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export default WritingRulesEngine;
