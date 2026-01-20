/**
 * Character Voice Profiler
 *
 * Maintains distinct character voices across AI-assisted writing.
 * Tracks speech patterns, vocabulary, mannerisms, and internal
 * thought styles for each character.
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// ENUMS
// ============================================================================

export enum SpeechPattern {
  FORMAL = 'formal',
  INFORMAL = 'informal',
  COLLOQUIAL = 'colloquial',
  ARCHAIC = 'archaic',
  TECHNICAL = 'technical',
  POETIC = 'poetic',
  MILITARY = 'military',
  ARISTOCRATIC = 'aristocratic',
  STREET = 'street',
  ACADEMIC = 'academic',
  CHILDLIKE = 'childlike',
  ELDERLY = 'elderly'
}

export enum EmotionalExpression {
  RESERVED = 'reserved',
  MODERATE = 'moderate',
  EXPRESSIVE = 'expressive',
  VOLATILE = 'volatile',
  STOIC = 'stoic',
  DRAMATIC = 'dramatic'
}

export enum HumorStyle {
  NONE = 'none',
  DRY = 'dry',
  SARCASTIC = 'sarcastic',
  WITTY = 'witty',
  SLAPSTICK = 'slapstick',
  DARK = 'dark',
  SELF_DEPRECATING = 'self_deprecating',
  PUNNY = 'punny'
}

export enum ThoughtStyle {
  ANALYTICAL = 'analytical',
  EMOTIONAL = 'emotional',
  STREAM_OF_CONSCIOUSNESS = 'stream_of_consciousness',
  ORGANIZED = 'organized',
  CHAOTIC = 'chaotic',
  VISUAL = 'visual',
  SPARSE = 'sparse'
}

export enum VoiceViolationType {
  WRONG_VOCABULARY = 'wrong_vocabulary',
  WRONG_PATTERN = 'wrong_pattern',
  WRONG_EMOTION = 'wrong_emotion',
  WRONG_MANNERISM = 'wrong_mannerism',
  INCONSISTENT_SPEECH = 'inconsistent_speech',
  OUT_OF_CHARACTER = 'out_of_character'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface VoiceProfile {
  id: string;
  characterId: string;
  characterName: string;

  // Speech characteristics
  speechPatterns: SpeechPattern[];
  vocabularyLevel: 'simple' | 'moderate' | 'advanced' | 'erudite';
  sentenceComplexity: 'simple' | 'moderate' | 'complex' | 'varied';
  averageSentenceLength: number;  // Target average

  // Vocabulary
  favoriteWords: string[];        // Words they use often
  forbiddenWords: string[];       // Words they would never use
  catchphrases: string[];         // Signature phrases
  oaths: string[];                // Swear words/exclamations
  fillerWords: string[];          // "um", "like", "you know"
  contractionUsage: 'always' | 'sometimes' | 'never';

  // Grammar quirks
  grammarQuirks: string[];        // "ain't", double negatives, etc.
  dialectFeatures: string[];      // Regional speech features
  accentNotes: string;            // How to represent accent

  // Emotional expression
  emotionalExpression: EmotionalExpression;
  humorStyle: HumorStyle;
  angerExpression: string;        // How they express anger
  joyExpression: string;          // How they express joy
  fearExpression: string;         // How they express fear
  sadnessExpression: string;      // How they express sadness

  // Physical mannerisms in dialogue
  physicalTics: string[];         // Habits during speech
  gesturePatterns: string[];      // How they gesture
  eyeContactPattern: string;      // How they make eye contact
  proximityPreference: string;    // Personal space preferences

  // Internal voice (POV chapters)
  thoughtStyle: ThoughtStyle;
  internalVocabulary: string[];   // Words used in thoughts but not speech
  metaphorStyle: string;          // Type of metaphors they use
  associationPatterns: string;    // How thoughts connect

  // Context-dependent variations
  formalSpeechNotes: string;      // How they speak formally
  intimateSpeechNotes: string;    // How they speak to loved ones
  stressSpeechNotes: string;      // How stress affects speech
  lyingSpeechNotes: string;       // Tells when lying

  // Sample dialogue
  sampleDialogues: SampleDialogue[];

  // Metadata
  lastUpdated: Date;
  version: number;
  notes: string;
}

export interface SampleDialogue {
  id: string;
  context: string;                 // Situation description
  dialogue: string;                // The actual dialogue
  emotion: string;                 // Emotional state
  speakingTo?: string;             // Who they're talking to
  isCanonical: boolean;            // From actual story or created for reference
  sourceChapter?: number;
}

export interface VoiceComparison {
  characterIdA: string;
  characterIdB: string;
  similarities: string[];
  differences: string[];
  confusionRisk: 'low' | 'medium' | 'high';
  differentiators: string[];       // Key ways to tell them apart
}

export interface VoiceViolation {
  id: string;
  characterId: string;
  characterName: string;
  violationType: VoiceViolationType;
  severity: 'minor' | 'moderate' | 'major';
  problematicText: string;
  issue: string;
  suggestion: string;
  location?: {
    chapterNumber?: number;
    paragraphIndex?: number;
    lineIndex?: number;
  };
}

export interface DialogueAnalysis {
  characterId: string;
  text: string;
  wordCount: number;
  avgSentenceLength: number;
  vocabularyMatch: number;        // 0-100 match with profile
  patternMatch: number;           // 0-100 match with profile
  violations: VoiceViolation[];
  overallScore: number;           // 0-100
  suggestions: string[];
}

export interface VoiceContext {
  emotion: string;
  stressLevel: 'calm' | 'mild' | 'moderate' | 'high' | 'extreme';
  audience: 'stranger' | 'acquaintance' | 'friend' | 'family' | 'enemy' | 'authority' | 'subordinate';
  setting: 'formal' | 'casual' | 'intimate' | 'public' | 'combat';
}

// ============================================================================
// VOICE PROFILER
// ============================================================================

export class VoiceProfiler {
  private profiles: Map<string, VoiceProfile> = new Map();
  private comparisons: Map<string, VoiceComparison> = new Map();

  constructor() {}

  // ==========================================================================
  // PROFILE MANAGEMENT
  // ==========================================================================

  createProfile(data: {
    characterId: string;
    characterName: string;
    speechPatterns?: SpeechPattern[];
    vocabularyLevel?: 'simple' | 'moderate' | 'advanced' | 'erudite';
  }): VoiceProfile {
    const profile: VoiceProfile = {
      id: uuidv4(),
      characterId: data.characterId,
      characterName: data.characterName,

      // Defaults
      speechPatterns: data.speechPatterns || [SpeechPattern.INFORMAL],
      vocabularyLevel: data.vocabularyLevel || 'moderate',
      sentenceComplexity: 'moderate',
      averageSentenceLength: 12,

      favoriteWords: [],
      forbiddenWords: [],
      catchphrases: [],
      oaths: [],
      fillerWords: [],
      contractionUsage: 'sometimes',

      grammarQuirks: [],
      dialectFeatures: [],
      accentNotes: '',

      emotionalExpression: EmotionalExpression.MODERATE,
      humorStyle: HumorStyle.NONE,
      angerExpression: '',
      joyExpression: '',
      fearExpression: '',
      sadnessExpression: '',

      physicalTics: [],
      gesturePatterns: [],
      eyeContactPattern: '',
      proximityPreference: '',

      thoughtStyle: ThoughtStyle.ORGANIZED,
      internalVocabulary: [],
      metaphorStyle: '',
      associationPatterns: '',

      formalSpeechNotes: '',
      intimateSpeechNotes: '',
      stressSpeechNotes: '',
      lyingSpeechNotes: '',

      sampleDialogues: [],

      lastUpdated: new Date(),
      version: 1,
      notes: ''
    };

    this.profiles.set(profile.characterId, profile);
    return profile;
  }

  getProfile(characterId: string): VoiceProfile | undefined {
    return this.profiles.get(characterId);
  }

  getAllProfiles(): VoiceProfile[] {
    return Array.from(this.profiles.values());
  }

  updateProfile(characterId: string, updates: Partial<VoiceProfile>): boolean {
    const profile = this.profiles.get(characterId);
    if (!profile) return false;

    Object.assign(profile, updates);
    profile.lastUpdated = new Date();
    profile.version++;

    // Invalidate comparisons involving this character
    for (const [key, comp] of this.comparisons) {
      if (comp.characterIdA === characterId || comp.characterIdB === characterId) {
        this.comparisons.delete(key);
      }
    }

    return true;
  }

  deleteProfile(characterId: string): boolean {
    return this.profiles.delete(characterId);
  }

  // ==========================================================================
  // VOCABULARY MANAGEMENT
  // ==========================================================================

  addFavoriteWord(characterId: string, word: string): boolean {
    const profile = this.profiles.get(characterId);
    if (!profile) return false;

    if (!profile.favoriteWords.includes(word.toLowerCase())) {
      profile.favoriteWords.push(word.toLowerCase());
      profile.lastUpdated = new Date();
    }
    return true;
  }

  addForbiddenWord(characterId: string, word: string): boolean {
    const profile = this.profiles.get(characterId);
    if (!profile) return false;

    if (!profile.forbiddenWords.includes(word.toLowerCase())) {
      profile.forbiddenWords.push(word.toLowerCase());
      profile.lastUpdated = new Date();
    }
    return true;
  }

  addCatchphrase(characterId: string, phrase: string): boolean {
    const profile = this.profiles.get(characterId);
    if (!profile) return false;

    if (!profile.catchphrases.includes(phrase)) {
      profile.catchphrases.push(phrase);
      profile.lastUpdated = new Date();
    }
    return true;
  }

  addOath(characterId: string, oath: string): boolean {
    const profile = this.profiles.get(characterId);
    if (!profile) return false;

    if (!profile.oaths.includes(oath)) {
      profile.oaths.push(oath);
      profile.lastUpdated = new Date();
    }
    return true;
  }

  // ==========================================================================
  // SAMPLE DIALOGUE MANAGEMENT
  // ==========================================================================

  addSampleDialogue(
    characterId: string,
    data: Omit<SampleDialogue, 'id'>
  ): SampleDialogue | null {
    const profile = this.profiles.get(characterId);
    if (!profile) return null;

    const sample: SampleDialogue = {
      id: uuidv4(),
      ...data
    };

    profile.sampleDialogues.push(sample);
    profile.lastUpdated = new Date();

    return sample;
  }

  getSampleDialogues(
    characterId: string,
    options?: {
      emotion?: string;
      speakingTo?: string;
      canonicalOnly?: boolean;
    }
  ): SampleDialogue[] {
    const profile = this.profiles.get(characterId);
    if (!profile) return [];

    let samples = profile.sampleDialogues;

    if (options?.emotion) {
      samples = samples.filter(s => s.emotion === options.emotion);
    }

    if (options?.speakingTo) {
      samples = samples.filter(s => s.speakingTo === options.speakingTo);
    }

    if (options?.canonicalOnly) {
      samples = samples.filter(s => s.isCanonical);
    }

    return samples;
  }

  // ==========================================================================
  // DIALOGUE ANALYSIS
  // ==========================================================================

  analyzeDialogue(
    characterId: string,
    dialogue: string,
    context?: VoiceContext
  ): DialogueAnalysis {
    const profile = this.profiles.get(characterId);

    if (!profile) {
      return {
        characterId,
        text: dialogue,
        wordCount: dialogue.split(/\s+/).length,
        avgSentenceLength: 0,
        vocabularyMatch: 0,
        patternMatch: 0,
        violations: [{
          id: uuidv4(),
          characterId,
          characterName: 'Unknown',
          violationType: VoiceViolationType.OUT_OF_CHARACTER,
          severity: 'major',
          problematicText: dialogue,
          issue: 'No voice profile exists for this character',
          suggestion: 'Create a voice profile before analyzing dialogue'
        }],
        overallScore: 0,
        suggestions: ['Create a voice profile for this character']
      };
    }

    const violations: VoiceViolation[] = [];
    const suggestions: string[] = [];
    const words = dialogue.toLowerCase().split(/\s+/);
    const sentences = dialogue.split(/[.!?]+/).filter(s => s.trim().length > 0);

    const wordCount = words.length;
    const avgSentenceLength = sentences.length > 0
      ? wordCount / sentences.length
      : wordCount;

    // Check vocabulary
    let vocabularyScore = 100;

    // Check for forbidden words
    for (const forbidden of profile.forbiddenWords) {
      if (dialogue.toLowerCase().includes(forbidden)) {
        vocabularyScore -= 15;
        violations.push({
          id: uuidv4(),
          characterId,
          characterName: profile.characterName,
          violationType: VoiceViolationType.WRONG_VOCABULARY,
          severity: 'moderate',
          problematicText: forbidden,
          issue: `${profile.characterName} would not use the word "${forbidden}"`,
          suggestion: `Replace "${forbidden}" with vocabulary consistent with this character`
        });
      }
    }

    // Check for expected favorite words (bonus for using them)
    let favoriteWordCount = 0;
    for (const favorite of profile.favoriteWords) {
      if (dialogue.toLowerCase().includes(favorite)) {
        favoriteWordCount++;
      }
    }

    // Check vocabulary level
    const advancedWords = words.filter(w => w.length > 10).length;
    const advancedRatio = advancedWords / wordCount;

    if (profile.vocabularyLevel === 'simple' && advancedRatio > 0.1) {
      vocabularyScore -= 10;
      suggestions.push(`${profile.characterName} uses simpler vocabulary - consider simplifying complex words`);
    } else if (profile.vocabularyLevel === 'erudite' && advancedRatio < 0.05 && wordCount > 20) {
      vocabularyScore -= 10;
      suggestions.push(`${profile.characterName} typically uses more sophisticated vocabulary`);
    }

    // Check contraction usage
    const hasContractions = /\b(isn't|aren't|wasn't|weren't|don't|doesn't|didn't|won't|wouldn't|can't|couldn't|shouldn't|haven't|hasn't|hadn't)\b/i.test(dialogue);
    const hasExpandedForms = /\b(is not|are not|was not|were not|do not|does not|did not|will not|would not|can not|could not|should not|have not|has not|had not)\b/i.test(dialogue);

    if (profile.contractionUsage === 'never' && hasContractions) {
      vocabularyScore -= 15;
      violations.push({
        id: uuidv4(),
        characterId,
        characterName: profile.characterName,
        violationType: VoiceViolationType.WRONG_PATTERN,
        severity: 'minor',
        problematicText: dialogue,
        issue: `${profile.characterName} does not use contractions`,
        suggestion: 'Expand contractions to their full forms'
      });
    } else if (profile.contractionUsage === 'always' && hasExpandedForms && wordCount > 10) {
      vocabularyScore -= 10;
      suggestions.push(`${profile.characterName} typically uses contractions - consider contracting "is not" to "isn't", etc.`);
    }

    vocabularyScore = Math.max(0, Math.min(100, vocabularyScore));

    // Check speech patterns
    let patternScore = 100;

    // Check sentence length
    const lengthDiff = Math.abs(avgSentenceLength - profile.averageSentenceLength);
    if (lengthDiff > profile.averageSentenceLength * 0.5) {
      patternScore -= 15;
      violations.push({
        id: uuidv4(),
        characterId,
        characterName: profile.characterName,
        violationType: VoiceViolationType.WRONG_PATTERN,
        severity: 'minor',
        problematicText: dialogue,
        issue: `Sentence length (avg ${avgSentenceLength.toFixed(1)}) differs from ${profile.characterName}'s typical pattern (avg ${profile.averageSentenceLength})`,
        suggestion: avgSentenceLength > profile.averageSentenceLength
          ? 'Consider breaking up longer sentences'
          : 'Consider combining short sentences for more natural flow'
      });
    }

    // Check for expected filler words in informal speech
    if (profile.fillerWords.length > 0 &&
        profile.speechPatterns.includes(SpeechPattern.INFORMAL) &&
        wordCount > 20) {
      const hasFillers = profile.fillerWords.some(f => dialogue.toLowerCase().includes(f));
      if (!hasFillers) {
        suggestions.push(`Consider adding characteristic filler words: ${profile.fillerWords.slice(0, 3).join(', ')}`);
      }
    }

    // Check for grammar quirks
    if (profile.grammarQuirks.length > 0) {
      const hasQuirks = profile.grammarQuirks.some(q => dialogue.toLowerCase().includes(q.toLowerCase()));
      if (!hasQuirks && wordCount > 15) {
        suggestions.push(`Consider incorporating ${profile.characterName}'s speech quirks: ${profile.grammarQuirks.slice(0, 2).join(', ')}`);
      }
    }

    patternScore = Math.max(0, Math.min(100, patternScore));

    // Context-based checks
    if (context) {
      // Check emotional expression
      if (context.stressLevel === 'extreme' && profile.stressSpeechNotes) {
        suggestions.push(`Under extreme stress, ${profile.characterName}: ${profile.stressSpeechNotes}`);
      }

      // Check formality
      if (context.setting === 'formal' && profile.formalSpeechNotes) {
        suggestions.push(`In formal settings, ${profile.characterName}: ${profile.formalSpeechNotes}`);
      }

      // Check intimacy
      if (context.audience === 'family' && profile.intimateSpeechNotes) {
        suggestions.push(`With loved ones, ${profile.characterName}: ${profile.intimateSpeechNotes}`);
      }
    }

    // Calculate overall score
    const overallScore = Math.round((vocabularyScore + patternScore) / 2);

    return {
      characterId,
      text: dialogue,
      wordCount,
      avgSentenceLength,
      vocabularyMatch: vocabularyScore,
      patternMatch: patternScore,
      violations,
      overallScore,
      suggestions
    };
  }

  // ==========================================================================
  // CHARACTER COMPARISON
  // ==========================================================================

  compareVoices(characterIdA: string, characterIdB: string): VoiceComparison | null {
    const profileA = this.profiles.get(characterIdA);
    const profileB = this.profiles.get(characterIdB);

    if (!profileA || !profileB) return null;

    // Check cache
    const cacheKey = [characterIdA, characterIdB].sort().join('-');
    const cached = this.comparisons.get(cacheKey);
    if (cached) return cached;

    const similarities: string[] = [];
    const differences: string[] = [];
    const differentiators: string[] = [];

    // Compare speech patterns
    const sharedPatterns = profileA.speechPatterns.filter(p =>
      profileB.speechPatterns.includes(p)
    );
    if (sharedPatterns.length > 0) {
      similarities.push(`Both use ${sharedPatterns.join(', ')} speech patterns`);
    }

    const uniqueToA = profileA.speechPatterns.filter(p => !profileB.speechPatterns.includes(p));
    const uniqueToB = profileB.speechPatterns.filter(p => !profileA.speechPatterns.includes(p));
    if (uniqueToA.length > 0 || uniqueToB.length > 0) {
      differences.push(`${profileA.characterName} uses ${uniqueToA.join(', ') || 'different'} patterns vs ${profileB.characterName}'s ${uniqueToB.join(', ') || 'different'} patterns`);
    }

    // Compare vocabulary level
    if (profileA.vocabularyLevel === profileB.vocabularyLevel) {
      similarities.push(`Both have ${profileA.vocabularyLevel} vocabulary`);
    } else {
      differences.push(`${profileA.characterName} has ${profileA.vocabularyLevel} vocabulary vs ${profileB.characterName}'s ${profileB.vocabularyLevel}`);
      differentiators.push(`Vocabulary complexity: ${profileA.characterName} (${profileA.vocabularyLevel}) vs ${profileB.characterName} (${profileB.vocabularyLevel})`);
    }

    // Compare emotional expression
    if (profileA.emotionalExpression === profileB.emotionalExpression) {
      similarities.push(`Both are ${profileA.emotionalExpression} in emotional expression`);
    } else {
      differences.push(`${profileA.characterName} is ${profileA.emotionalExpression} vs ${profileB.characterName} is ${profileB.emotionalExpression}`);
      differentiators.push(`Emotional expression differs`);
    }

    // Compare humor styles
    if (profileA.humorStyle === profileB.humorStyle) {
      if (profileA.humorStyle !== HumorStyle.NONE) {
        similarities.push(`Both use ${profileA.humorStyle} humor`);
      }
    } else {
      differences.push(`${profileA.characterName} uses ${profileA.humorStyle} humor vs ${profileB.characterName}'s ${profileB.humorStyle}`);
    }

    // Compare sentence length
    const lengthDiff = Math.abs(profileA.averageSentenceLength - profileB.averageSentenceLength);
    if (lengthDiff < 3) {
      similarities.push(`Similar sentence lengths (~${profileA.averageSentenceLength} words)`);
    } else {
      differences.push(`${profileA.characterName} uses ~${profileA.averageSentenceLength} word sentences vs ${profileB.characterName}'s ~${profileB.averageSentenceLength}`);
      differentiators.push(`Sentence length: ${profileA.characterName} (${profileA.averageSentenceLength}) vs ${profileB.characterName} (${profileB.averageSentenceLength})`);
    }

    // Compare contraction usage
    if (profileA.contractionUsage !== profileB.contractionUsage) {
      differences.push(`${profileA.characterName} ${profileA.contractionUsage} uses contractions vs ${profileB.characterName} ${profileB.contractionUsage}`);
      differentiators.push(`Contraction usage differs`);
    }

    // Compare catchphrases
    if (profileA.catchphrases.length > 0) {
      differentiators.push(`${profileA.characterName}'s catchphrases: "${profileA.catchphrases.slice(0, 2).join('", "')}"`);
    }
    if (profileB.catchphrases.length > 0) {
      differentiators.push(`${profileB.characterName}'s catchphrases: "${profileB.catchphrases.slice(0, 2).join('", "')}"`);
    }

    // Calculate confusion risk
    let confusionScore = 0;
    confusionScore += sharedPatterns.length * 10;
    confusionScore += profileA.vocabularyLevel === profileB.vocabularyLevel ? 15 : 0;
    confusionScore += profileA.emotionalExpression === profileB.emotionalExpression ? 15 : 0;
    confusionScore += lengthDiff < 3 ? 10 : 0;
    confusionScore += profileA.contractionUsage === profileB.contractionUsage ? 10 : 0;

    const confusionRisk: 'low' | 'medium' | 'high' =
      confusionScore > 40 ? 'high' :
      confusionScore > 20 ? 'medium' : 'low';

    const comparison: VoiceComparison = {
      characterIdA,
      characterIdB,
      similarities,
      differences,
      confusionRisk,
      differentiators
    };

    this.comparisons.set(cacheKey, comparison);
    return comparison;
  }

  findSimilarVoices(characterId: string): { characterId: string; similarity: number }[] {
    const results: { characterId: string; similarity: number }[] = [];
    const targetProfile = this.profiles.get(characterId);

    if (!targetProfile) return results;

    for (const [otherId, _otherProfile] of this.profiles) {
      if (otherId === characterId) continue;

      const comparison = this.compareVoices(characterId, otherId);
      if (comparison) {
        // Calculate similarity score
        let similarity = 0;
        similarity += comparison.similarities.length * 15;
        similarity -= comparison.differences.length * 10;
        similarity = Math.max(0, Math.min(100, similarity));

        if (similarity > 30) {
          results.push({ characterId: otherId, similarity });
        }
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  // ==========================================================================
  // VOICE PROMPTS FOR AI
  // ==========================================================================

  generateVoicePrompt(characterId: string, context?: VoiceContext): string | null {
    const profile = this.profiles.get(characterId);
    if (!profile) return null;

    let prompt = `## Voice Profile: ${profile.characterName}\n\n`;

    // Speech characteristics
    prompt += `### Speech Patterns\n`;
    prompt += `- Style: ${profile.speechPatterns.join(', ')}\n`;
    prompt += `- Vocabulary: ${profile.vocabularyLevel}\n`;
    prompt += `- Sentence complexity: ${profile.sentenceComplexity}\n`;
    prompt += `- Target sentence length: ~${profile.averageSentenceLength} words\n`;
    prompt += `- Contractions: ${profile.contractionUsage}\n\n`;

    // Vocabulary
    if (profile.favoriteWords.length > 0) {
      prompt += `### Vocabulary\n`;
      prompt += `- Favorite words: ${profile.favoriteWords.join(', ')}\n`;
    }
    if (profile.forbiddenWords.length > 0) {
      prompt += `- NEVER uses: ${profile.forbiddenWords.join(', ')}\n`;
    }
    if (profile.catchphrases.length > 0) {
      prompt += `- Catchphrases: "${profile.catchphrases.join('", "')}"\n`;
    }
    if (profile.oaths.length > 0) {
      prompt += `- Exclamations/oaths: ${profile.oaths.join(', ')}\n`;
    }
    if (profile.fillerWords.length > 0) {
      prompt += `- Filler words: ${profile.fillerWords.join(', ')}\n`;
    }
    prompt += '\n';

    // Grammar quirks
    if (profile.grammarQuirks.length > 0 || profile.dialectFeatures.length > 0) {
      prompt += `### Speech Quirks\n`;
      if (profile.grammarQuirks.length > 0) {
        prompt += `- Grammar quirks: ${profile.grammarQuirks.join(', ')}\n`;
      }
      if (profile.dialectFeatures.length > 0) {
        prompt += `- Dialect features: ${profile.dialectFeatures.join(', ')}\n`;
      }
      if (profile.accentNotes) {
        prompt += `- Accent: ${profile.accentNotes}\n`;
      }
      prompt += '\n';
    }

    // Emotional expression
    prompt += `### Emotional Expression\n`;
    prompt += `- General: ${profile.emotionalExpression}\n`;
    prompt += `- Humor: ${profile.humorStyle}\n`;
    if (profile.angerExpression) prompt += `- When angry: ${profile.angerExpression}\n`;
    if (profile.joyExpression) prompt += `- When happy: ${profile.joyExpression}\n`;
    if (profile.fearExpression) prompt += `- When afraid: ${profile.fearExpression}\n`;
    if (profile.sadnessExpression) prompt += `- When sad: ${profile.sadnessExpression}\n`;
    prompt += '\n';

    // Physical mannerisms
    if (profile.physicalTics.length > 0 || profile.gesturePatterns.length > 0) {
      prompt += `### Physical Mannerisms\n`;
      if (profile.physicalTics.length > 0) {
        prompt += `- Physical tics: ${profile.physicalTics.join(', ')}\n`;
      }
      if (profile.gesturePatterns.length > 0) {
        prompt += `- Gestures: ${profile.gesturePatterns.join(', ')}\n`;
      }
      prompt += '\n';
    }

    // Context-specific notes
    if (context) {
      prompt += `### Current Context\n`;
      prompt += `- Emotional state: ${context.emotion}\n`;
      prompt += `- Stress level: ${context.stressLevel}\n`;
      prompt += `- Speaking to: ${context.audience}\n`;
      prompt += `- Setting: ${context.setting}\n`;

      if (context.stressLevel === 'high' || context.stressLevel === 'extreme') {
        if (profile.stressSpeechNotes) {
          prompt += `\nUnder stress: ${profile.stressSpeechNotes}\n`;
        }
      }

      if (context.setting === 'formal' && profile.formalSpeechNotes) {
        prompt += `\nIn formal settings: ${profile.formalSpeechNotes}\n`;
      }

      if ((context.audience === 'family' || context.audience === 'friend') && profile.intimateSpeechNotes) {
        prompt += `\nWith loved ones: ${profile.intimateSpeechNotes}\n`;
      }

      prompt += '\n';
    }

    // Sample dialogues
    const relevantSamples = context
      ? profile.sampleDialogues.filter(s =>
          s.emotion === context.emotion ||
          s.speakingTo === context.audience
        ).slice(0, 3)
      : profile.sampleDialogues.filter(s => s.isCanonical).slice(0, 3);

    if (relevantSamples.length > 0) {
      prompt += `### Sample Dialogue\n`;
      for (const sample of relevantSamples) {
        prompt += `\n[${sample.context}]\n`;
        prompt += `"${sample.dialogue}"\n`;
      }
    }

    return prompt;
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getStats(): {
    totalProfiles: number;
    profilesByPattern: Record<string, number>;
    profilesByVocabLevel: Record<string, number>;
    avgSamplesPerProfile: number;
    highConfusionPairs: number;
  } {
    const profiles = Array.from(this.profiles.values());

    const profilesByPattern: Record<string, number> = {};
    const profilesByVocabLevel: Record<string, number> = {};
    let totalSamples = 0;

    for (const profile of profiles) {
      for (const pattern of profile.speechPatterns) {
        profilesByPattern[pattern] = (profilesByPattern[pattern] || 0) + 1;
      }
      profilesByVocabLevel[profile.vocabularyLevel] = (profilesByVocabLevel[profile.vocabularyLevel] || 0) + 1;
      totalSamples += profile.sampleDialogues.length;
    }

    // Count high confusion pairs
    let highConfusionPairs = 0;
    for (const comp of this.comparisons.values()) {
      if (comp.confusionRisk === 'high') {
        highConfusionPairs++;
      }
    }

    return {
      totalProfiles: profiles.length,
      profilesByPattern,
      profilesByVocabLevel,
      avgSamplesPerProfile: profiles.length > 0 ? totalSamples / profiles.length : 0,
      highConfusionPairs
    };
  }

  // ==========================================================================
  // EXPORT/IMPORT
  // ==========================================================================

  exportToJSON(): string {
    return JSON.stringify({
      profiles: Array.from(this.profiles.values()),
      comparisons: Array.from(this.comparisons.values())
    }, null, 2);
  }

  importFromJSON(json: string): void {
    const data = JSON.parse(json);

    if (data.profiles) {
      for (const profile of data.profiles) {
        profile.lastUpdated = new Date(profile.lastUpdated);
        this.profiles.set(profile.characterId, profile);
      }
    }

    if (data.comparisons) {
      for (const comp of data.comparisons) {
        const key = [comp.characterIdA, comp.characterIdB].sort().join('-');
        this.comparisons.set(key, comp);
      }
    }
  }

  // ==========================================================================
  // CLEAR
  // ==========================================================================

  clear(): void {
    this.profiles.clear();
    this.comparisons.clear();
  }
}

// Export singleton instance
export const voiceProfiler = new VoiceProfiler();

export default VoiceProfiler;
