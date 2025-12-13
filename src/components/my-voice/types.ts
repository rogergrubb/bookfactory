// My Voice Training System - Type Definitions
// A comprehensive voice analysis and training system that goes beyond Sudowrite

export interface VoiceProfile {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Training samples metadata
  trainingSamples: TrainingSample[];
  totalWordCount: number;
  sampleCount: number;
  
  // Analyzed voice characteristics
  analysis: VoiceAnalysis;
  
  // Generated prompts for AI
  systemPrompt: string;
  styleGuide: string;
  
  // Usage stats
  timesUsed: number;
  lastUsedAt?: Date;
  
  // Status
  status: 'training' | 'ready' | 'error';
  trainingProgress?: number;
}

export interface TrainingSample {
  id: string;
  voiceProfileId: string;
  source: 'paste' | 'upload' | 'chapter';
  sourceId?: string; // chapterId if from a chapter
  sourceName?: string;
  text: string;
  wordCount: number;
  addedAt: Date;
}

export interface VoiceAnalysis {
  // Core Style Dimensions (scored 1-10)
  dimensions: StyleDimensions;
  
  // Sentence Structure Patterns
  sentencePatterns: SentencePatterns;
  
  // Word Choice Patterns
  vocabularyProfile: VocabularyProfile;
  
  // Rhythm & Pacing
  rhythmProfile: RhythmProfile;
  
  // Tone & Mood
  toneProfile: ToneProfile;
  
  // Dialogue Style (if present in samples)
  dialogueStyle?: DialogueStyle;
  
  // POV & Narrative Distance
  narrativeStyle: NarrativeStyle;
  
  // Unique Fingerprints
  signatures: StyleSignatures;
  
  // Comparison to known authors
  similarAuthors?: AuthorSimilarity[];
  
  // Confidence score
  confidence: number; // 0-100
  analysisVersion: string;
}

export interface StyleDimensions {
  // Formal ←→ Conversational
  formality: number;
  
  // Sparse ←→ Ornate
  density: number;
  
  // Direct ←→ Meandering
  directness: number;
  
  // Serious ←→ Playful
  seriousness: number;
  
  // Reserved ←→ Emotional
  emotionality: number;
  
  // Abstract ←→ Concrete
  concreteness: number;
  
  // Fast ←→ Slow pacing
  pacing: number;
  
  // Simple ←→ Complex
  complexity: number;
}

export interface SentencePatterns {
  // Average lengths
  avgSentenceLength: number;
  avgParagraphLength: number;
  avgParagraphSentences: number;
  
  // Variance (high = varied, low = consistent)
  sentenceLengthVariance: number;
  
  // Structure preferences
  simplePercentage: number;      // Simple sentences
  compoundPercentage: number;    // Compound (and, but, or)
  complexPercentage: number;     // Complex (subordinate clauses)
  fragmentPercentage: number;    // Intentional fragments
  
  // Opening patterns
  commonOpenings: {
    pattern: string;
    frequency: number;
    examples: string[];
  }[];
  
  // Punctuation tendencies
  punctuationStyle: {
    dashFrequency: number;       // Em dashes per 1000 words
    ellipsisFrequency: number;   // Ellipses per 1000 words
    semicolonFrequency: number;  // Semicolons per 1000 words
    exclamationFrequency: number;
    questionFrequency: number;
  };
}

export interface VocabularyProfile {
  // Vocabulary level
  avgWordLength: number;
  uniqueWordsRatio: number; // Type-token ratio
  readabilityScore: number; // Flesch-Kincaid
  
  // Word preferences
  favoredWords: {
    word: string;
    frequency: number;
    contexts: string[];
  }[];
  
  avoidedPatterns: string[]; // Words/phrases never used
  
  // Verb tendencies
  activeVoicePercentage: number;
  verbTenseDistribution: {
    past: number;
    present: number;
    future: number;
  };
  
  // Adjective/adverb usage
  adjectiveFrequency: number;  // Per 100 words
  adverbFrequency: number;     // Per 100 words
  
  // Sensory language
  sensoryFrequency: {
    visual: number;
    auditory: number;
    tactile: number;
    olfactory: number;
    gustatory: number;
  };
  
  // Figurative language
  figurativeUsage: {
    simileFrequency: number;
    metaphorFrequency: number;
    personificationFrequency: number;
  };
}

export interface RhythmProfile {
  // Pacing patterns
  avgBeatsPerSentence: number; // Syllable-based rhythm
  rhythmVariation: number;
  
  // Scene-level pacing
  actionScenePace: 'fast' | 'medium' | 'slow';
  reflectionScenePace: 'fast' | 'medium' | 'slow';
  dialogueScenePace: 'fast' | 'medium' | 'slow';
  
  // Paragraph rhythm
  shortParagraphPercentage: number; // 1-2 sentences
  mediumParagraphPercentage: number; // 3-5 sentences
  longParagraphPercentage: number; // 6+ sentences
  
  // Momentum patterns
  buildsToClimax: boolean; // Sentences get shorter toward tension
  usesRhythmicBeats: boolean; // Repeated structures for emphasis
}

export interface ToneProfile {
  // Primary tones (top 3)
  primaryTones: {
    tone: string;
    strength: number;
  }[];
  
  // Emotional range
  emotionalRange: {
    positive: number;
    negative: number;
    neutral: number;
  };
  
  // Humor style (if present)
  humorStyle?: 'dry' | 'witty' | 'slapstick' | 'dark' | 'absurd' | 'none';
  
  // Tension handling
  tensionBuildMethod: 'gradual' | 'sudden' | 'oscillating';
  
  // Reader relationship
  readerRelationship: 'intimate' | 'friendly' | 'professional' | 'distant';
}

export interface DialogueStyle {
  // Tag usage
  tagStyle: 'minimal' | 'balanced' | 'descriptive';
  saidPercentage: number; // How often "said" vs other tags
  
  // Action beats
  actionBeatFrequency: number; // Per dialogue exchange
  
  // Dialogue patterns
  avgExchangeLength: number; // Words per speech
  interruptionFrequency: number;
  subTextHeaviness: number; // 1-10, how much is implied vs stated
  
  // Character voice differentiation
  voiceDifferentiation: 'strong' | 'moderate' | 'subtle';
  
  // Dialect/accent usage
  usesDialect: boolean;
  dialectStyle?: string;
}

export interface NarrativeStyle {
  // POV tendencies
  preferredPOV: 'first' | 'third-limited' | 'third-omniscient' | 'second' | 'mixed';
  
  // Narrative distance
  narrativeDistance: 'close' | 'medium' | 'distant';
  
  // Interiority (access to thoughts)
  interiorityLevel: 'deep' | 'moderate' | 'surface';
  
  // Description integration
  descriptionStyle: 'woven' | 'blocked' | 'minimal';
  
  // Temporal handling
  temporalFlow: 'linear' | 'nonlinear' | 'mixed';
  flashbackUsage: 'frequent' | 'occasional' | 'rare';
}

export interface StyleSignatures {
  // Unique phrases/constructions
  signaturePhrases: string[];
  
  // Recurring patterns
  recurringStructures: {
    pattern: string;
    description: string;
    examples: string[];
  }[];
  
  // What makes this voice unique
  distinguishingFeatures: string[];
  
  // Avoidances (what they never do)
  notableAbsences: string[];
}

export interface AuthorSimilarity {
  authorName: string;
  similarityScore: number; // 0-100
  sharedTraits: string[];
}

// Voice Training Progress
export interface VoiceTrainingProgress {
  phase: 'uploading' | 'analyzing' | 'extracting' | 'generating' | 'complete' | 'error';
  progress: number; // 0-100
  currentStep: string;
  estimatedTimeRemaining?: number; // seconds
  error?: string;
}

// Voice Application Settings
export interface VoiceApplicationSettings {
  intensity: 'subtle' | 'balanced' | 'strong';
  preserveContent: boolean; // Keep meaning, change style
  matchPOV: boolean;
  matchTense: boolean;
  adaptToContext: boolean; // Adjust based on scene type
}

// The compiled voice prompt for AI use
export interface CompiledVoicePrompt {
  systemInstructions: string;
  styleGuide: string;
  examples: {
    before: string;
    after: string;
    note: string;
  }[];
  avoidances: string[];
  signatures: string[];
}
