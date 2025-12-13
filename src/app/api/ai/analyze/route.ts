import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Enhanced request schema with genre and author context
const AnalyzeRequestSchema = z.object({
  type: z.enum([
    'pacing',
    'voice-consistency', 
    'tension-map',
    'character-voice-analysis',
    'repetition-finder',
    'adverb-hunter',
    'passive-voice-finder',
    'readability',
    'emotional-arc',
    'chapter-summary',
    'plot-holes',
    'dialogue-analysis',
    'show-tell-ratio',
    'cliche-finder',
    'continuity-check'
  ]),
  content: z.string().min(1),
  scope: z.enum(['scene', 'chapter', 'book']).optional().default('scene'),
  options: z.object({
    bookContext: z.string().optional(),
    characterNames: z.array(z.string()).optional(),
    storyBible: z.any().optional(),
    fullManuscript: z.string().optional(),
    genre: z.string().optional(),
    targetAudience: z.string().optional(),
    authorVoiceProfile: z.any().optional(),
    previousAnalysis: z.any().optional(),
    chapterNumber: z.number().optional(),
    sceneGoal: z.string().optional(),
  }).optional()
});

// Genre-specific benchmarks for contextual analysis
const GENRE_BENCHMARKS = {
  thriller: { pacingSpeed: 'fast', tensionLevel: 'high', dialogueRatio: 40, adverbTolerance: 'low' },
  romance: { pacingSpeed: 'moderate', tensionLevel: 'emotional', dialogueRatio: 50, adverbTolerance: 'medium' },
  literary: { pacingSpeed: 'varied', tensionLevel: 'subtle', dialogueRatio: 30, adverbTolerance: 'medium' },
  fantasy: { pacingSpeed: 'moderate', tensionLevel: 'building', dialogueRatio: 35, adverbTolerance: 'medium' },
  mystery: { pacingSpeed: 'measured', tensionLevel: 'sustained', dialogueRatio: 45, adverbTolerance: 'low' },
  scifi: { pacingSpeed: 'moderate', tensionLevel: 'building', dialogueRatio: 35, adverbTolerance: 'low' },
  horror: { pacingSpeed: 'slow-to-fast', tensionLevel: 'escalating', dialogueRatio: 30, adverbTolerance: 'low' },
  ya: { pacingSpeed: 'fast', tensionLevel: 'high', dialogueRatio: 50, adverbTolerance: 'medium' },
};

// ============================================================================
// ENHANCED ANALYSIS PROMPTS - Deep, Actionable, Genre-Aware
// ============================================================================

const ANALYSIS_PROMPTS: Record<string, (content: string, scope: string, options?: any) => string> = {

  // =========================================================================
  // 1. PACING ANALYSIS - The Rhythm of Story
  // =========================================================================
  'pacing': (content, scope, options) => `You are a master story editor specializing in narrative pacing. Your analysis helps authors create page-turners.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}
- Scene Goal: ${options?.sceneGoal || 'Not specified'}

GENRE PACING BENCHMARKS:
- Thriller: 60-70% high-tension, short paragraphs, frequent breaks
- Romance: Emotional beats every 500-800 words, balanced pacing
- Literary: Varied rhythm, reflective passages balanced with momentum
- Fantasy/Sci-Fi: World-building interspersed with action
- Mystery: Revelation pacing, clues every 1000-1500 words

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100>,
  "grade": "<A-F>",
  "summary": "<2-3 sentence assessment>",
  "pacingProfile": {
    "overallRhythm": "breakneck|fast|moderate|leisurely|slow",
    "genreAlignment": <0-100>,
    "pagesTurnability": "high|medium|low"
  },
  "pacingCurve": [
    {"position": <0-100>, "intensity": <1-10>, "beat": "<action|dialogue|reflection|tension|release>", "label": "<description>"}
  ],
  "sentenceRhythm": {
    "shortPercent": <under 10 words>,
    "mediumPercent": <10-20 words>,
    "longPercent": <over 20 words>,
    "varietyScore": <0-100>,
    "punchyMoments": ["<effective short sentences>"],
    "runOnIssues": ["<sentences too long>"]
  },
  "hooks": {
    "openingHook": {"present": true|false, "strength": <0-100>, "improvement": "<suggestion>"},
    "endingHook": {"present": true|false, "strength": <0-100>, "improvement": "<suggestion>"},
    "microHooks": <count>
  },
  "dragPoints": [
    {"location": "<quote>", "reason": "<over-description|info-dump|etc>", "fix": "<specific fix>", "rewrite": "<example>"}
  ],
  "rushPoints": [
    {"location": "<quote>", "reason": "<skipped-emotion|etc>", "fix": "<specific fix>", "whatToAdd": "<missing beats>"}
  ],
  "dialogueToNarrative": {"ratio": "<percent>", "balance": "<assessment>", "genreAppropriate": true|false},
  "actionableImprovements": [
    {"priority": "high|medium|low", "issue": "<problem>", "location": "<where>", "currentText": "<text>", "suggestedFix": "<rewrite>"}
  ],
  "quickWins": ["<easy fix 1>", "<easy fix 2>", "<easy fix 3>"],
  "nextToolSuggestion": {"tool": "<next tool>", "reason": "<why>"}
}`,

  // =========================================================================
  // 2. VOICE CONSISTENCY - The Author's Fingerprint
  // =========================================================================
  'voice-consistency': (content, scope, options) => `You are an expert developmental editor specializing in narrative voice consistency.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}
${options?.authorVoiceProfile ? `- Author Voice Profile: ${JSON.stringify(options.authorVoiceProfile)}` : ''}

VOICE ELEMENTS:
1. POV Discipline - No head-hopping, consistent psychic distance
2. Tense Consistency - Past/present maintained
3. Tone Stability - Formal/casual, dark/light
4. Vocabulary Level - Consistent complexity
5. Sentence Patterns - The author's rhythmic fingerprint
6. Filtering - Deep POV vs distant narration

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100>,
  "grade": "<A-F>",
  "summary": "<assessment>",
  "voiceFingerprint": {
    "pov": {
      "type": "first|second|third-limited|third-omniscient",
      "psychicDistance": "intimate|close|medium|distant",
      "consistency": <0-100>,
      "violations": [{"location": "<quote>", "issue": "<problem>", "fix": "<solution>"}]
    },
    "tense": {
      "primary": "past|present",
      "consistency": <0-100>,
      "shifts": [{"location": "<quote>", "from": "<tense>", "to": "<tense>", "fix": "<corrected>"}]
    },
    "tone": {
      "primary": "<dominant tone>",
      "consistency": <0-100>,
      "shifts": [{"location": "<where>", "from": "<tone>", "to": "<tone>", "jarring": true|false}]
    }
  },
  "vocabularyAnalysis": {
    "level": "simple|moderate|complex|literary",
    "consistency": <0-100>,
    "outOfCharacterWords": [{"word": "<word>", "context": "<sentence>", "alternatives": ["<alt1>", "<alt2>"]}],
    "signatureWords": ["<distinctive words>"]
  },
  "filteringConsistency": {
    "style": "deep-pov|moderate|omniscient",
    "filterWordsFound": ["saw", "heard", "felt"],
    "filterWordCount": <count>,
    "removals": [{"original": "<with filter>", "deeperPOV": "<without filter>"}]
  },
  "authorIntrusion": [
    {"location": "<where>", "intrusion": "<text>", "fix": "<character-authentic version>"}
  ],
  "actionableImprovements": [
    {"issue": "<problem>", "location": "<where>", "currentText": "<text>", "fixedText": "<corrected>"}
  ]
}`,

  // =========================================================================
  // 3. TENSION MAP - The Engine of Engagement  
  // =========================================================================
  'tension-map': (content, scope, options) => `You are a story tension architect mapping engagement throughout the narrative.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}
- Scene Goal: ${options?.sceneGoal || 'Not specified'}

TENSION TYPES:
1. Physical Danger - Life/safety threats
2. Emotional Stakes - Relationship risks
3. Mystery/Curiosity - Unanswered questions
4. Time Pressure - Deadlines
5. Internal Conflict - Character decisions
6. Interpersonal Conflict - Character vs character

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100>,
  "grade": "<A-F>",
  "summary": "<assessment>",
  "tensionProfile": {
    "dominantType": "<primary tension>",
    "averageLevel": <1-10>,
    "peakLevel": <1-10>,
    "valleyLevel": <1-10>,
    "sustainedEngagement": <0-100>
  },
  "tensionMap": [
    {"position": <0-100>, "level": <1-10>, "types": ["<tension types>"], "source": "<what creates tension>", "stakes": "<what's at risk>", "readerQuestion": "<question keeping reader engaged>"}
  ],
  "tensionPeaks": [
    {"position": "<where>", "level": <1-10>, "effectiveness": <0-100>, "whatWorks": "<why it succeeds>", "enhancement": "<how to strengthen>"}
  ],
  "tensionValleys": [
    {"position": "<where>", "level": <1-10>, "purpose": "intentional-rest|problematic", "injection": {"technique": "<how to add>", "implementation": "<rewritten passage>"}}
  ],
  "stakesAnalysis": {
    "clarity": <0-100>,
    "escalation": <0-100>,
    "issues": [{"problem": "<issue>", "fix": "<solution>"}]
  },
  "questionHooks": {
    "openQuestions": [{"question": "<reader question>", "planted": "<where>", "compelling": <0-100>}],
    "missingQuestions": ["<questions that should be raised>"]
  },
  "tensionKillers": [
    {"location": "<where>", "killer": "<premature-resolution|stakes-deflation|etc>", "quote": "<text>", "fix": "<how to maintain>"}
  ],
  "actionableImprovements": [
    {"priority": "critical|high|medium", "type": "<add-tension|raise-stakes|etc>", "location": "<where>", "implementation": "<specific change>"}
  ]
}`,

  // =========================================================================
  // 4. CHARACTER VOICE ANALYSIS
  // =========================================================================
  'character-voice-analysis': (content, scope, options) => `You are a character voice specialist ensuring each character sounds distinct and memorable.

CONTEXT:
- Scope: ${scope}
${options?.characterNames ? `- Characters: ${options.characterNames.join(', ')}` : '- Identify all speakers'}
${options?.storyBible ? `- Story Bible available` : ''}

CHARACTER VOICE ELEMENTS:
1. Vocabulary - Education, background in word choice
2. Syntax - Sentence structure patterns
3. Verbal Tics - Catchphrases, speech habits
4. Subtext - What they mean vs what they say
5. Emotional Expression - How they show/hide feelings

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100>,
  "grade": "<A-F>",
  "summary": "<assessment>",
  "voiceDistinctivenessTest": {
    "couldIdentifyWithoutTags": <0-100>,
    "mostDistinctive": "<character>",
    "leastDistinctive": "<character>",
    "interchangeablePairs": ["<similar sounding characters>"]
  },
  "characters": [
    {
      "name": "<character>",
      "speakingLines": <count>,
      "voiceProfile": {"distinctiveness": <0-100>, "consistency": <0-100>, "authenticity": <0-100>},
      "vocabulary": {"level": "<simple|moderate|sophisticated>", "signatureWords": ["<unique words>"]},
      "speechHabits": {"verbalTics": ["<habits>"], "catchphrases": ["<phrases>"]},
      "exampleQuotes": {"strongest": "<best line>", "weakest": "<off-voice line>"},
      "issues": [{"quote": "<problematic>", "problem": "<why>", "rewrite": "<in-character version>"}],
      "enhancements": [{"aspect": "<what to strengthen>", "technique": "<how>"}]
    }
  ],
  "genericDialogue": [
    {"quote": "<could be anyone>", "speaker": "<who>", "characterizedVersion": "<with voice>"}
  ],
  "onTheNoseDialogue": [
    {"quote": "<too direct>", "subtextVersion": "<with subtext>"}
  ],
  "voiceToolkit": {
    "forCharacter": "<name>",
    "wordsToUse": ["<suggestions>"],
    "wordsToAvoid": ["<words that break voice>"],
    "sentencePatterns": ["<syntax templates>"]
  }
}`,

  // =========================================================================
  // 5. REPETITION FINDER
  // =========================================================================
  'repetition-finder': (content, scope, options) => `You are a prose polish specialist focusing on repetition that weakens writing.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}

REPETITION TYPES:
1. Word Echo - Same word too close together
2. Phrase Repetition - Repeated multi-word phrases
3. Sentence Starter Monotony - Same beginnings
4. Gesture Crutches - Characters always nodding, sighing
5. Filter Word Overuse - Saw, heard, felt patterns

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100 variety score>,
  "grade": "<A-F>",
  "summary": "<assessment>",
  "statistics": {
    "totalWords": <count>,
    "uniqueWords": <count>,
    "vocabularyRichness": <ratio>,
    "repetitionDensity": "<issues per 1000 words>"
  },
  "wordEchoes": [
    {
      "word": "<repeated>",
      "occurrences": <count>,
      "proximity": "adjacent|same-paragraph|nearby",
      "severity": "critical|high|medium|low",
      "contexts": [{"sentence": "<context>", "position": <paragraph>}],
      "alternatives": ["<synonym1>", "<synonym2>"],
      "suggestedFix": {"keepInstance": <which>, "rewrites": [{"original": "<sentence>", "revised": "<fixed>"}]}
    }
  ],
  "sentenceStarters": {
    "monotonyScore": <0-100>,
    "overusedStarters": [
      {"starter": "<He/She/The/I>", "count": <times>, "percentage": <percent>, "alternatives": [{"original": "<sentence>", "varied": "<new opening>"}]}
    ]
  },
  "gestureCrutches": [
    {"gesture": "<nodded/sighed>", "count": <times>, "alternatives": [{"instead_of": "<gesture>", "try": "<specific action>", "example": "<rewritten>"}]}
  ],
  "filterWords": {
    "total": <count>,
    "density": "<per 1000>",
    "removable": [{"original": "<with filter>", "direct": "<without filter>"}]
  },
  "prioritizedFixes": [
    {"priority": 1, "issue": "<most impactful>", "fix": "<solution>"}
  ],
  "searchAndReplace": [
    {"find": "<overused>", "replaceWith": ["<option1>", "<option2>"]}
  ]
}`,

  // =========================================================================
  // 6. ADVERB HUNTER
  // =========================================================================
  'adverb-hunter': (content, scope, options) => `You are a prose strengthening specialist following Stephen King's philosophy on adverbs.

IMPORTANT: Not all adverbs are bad. Identify which to cut, revise, or keep.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}

ADVERB ISSUES:
1. Dialogue Tag Adverbs - "said angrily" → show anger
2. Redundant Adverbs - "shouted loudly"
3. Weak Verb + Adverb - "walked quickly" → "strode"
4. Telling Adverbs - "nervously" → show nervous behavior
5. Lazy Intensifiers - "very", "really", "extremely"

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100 prose strength>,
  "grade": "<A-F>",
  "summary": "<assessment>",
  "statistics": {
    "totalAdverbs": <count>,
    "adverbDensity": "<per 1000 words>",
    "problematicAdverbs": <count>,
    "acceptableAdverbs": <count>
  },
  "dialogueTagAdverbs": [
    {
      "original": "<said angrily>",
      "location": "<where>",
      "fix": {
        "option1_action": "<action beat showing emotion>",
        "option2_dialogue": "<stronger dialogue>",
        "recommended": "<best option>"
      },
      "rewrite": "<full rewritten passage>"
    }
  ],
  "weakVerbCombos": [
    {
      "original": "<walked quickly>",
      "strongerVerbs": ["strode", "hurried", "rushed"],
      "bestChoice": "<recommended>",
      "example": {"before": "<sentence>", "after": "<with strong verb>"}
    }
  ],
  "tellingAdverbs": [
    {
      "adverb": "<nervously>",
      "emotion": "<what it tells>",
      "showInstead": {
        "physicalTell": "<body language>",
        "action": "<behavior>",
        "dialogue": "<speech showing it>"
      },
      "rewrite": "<full showing version>"
    }
  ],
  "lazyIntensifiers": [
    {"word": "<very>", "count": <times>, "instances": [{"original": "<sentence>", "strengthened": "<precise word>"}]}
  ],
  "acceptableAdverbs": [
    {"adverb": "<word>", "context": "<sentence>", "whyItWorks": "<reason to keep>"}
  ],
  "strongVerbAlternatives": {
    "walked_quickly": ["strode", "hurried", "rushed"],
    "said_angrily": ["snapped", "snarled", "growled"],
    "looked_carefully": ["examined", "scrutinized", "studied"]
  },
  "actionableRewrites": [
    {"priority": "high|medium|low", "original": "<passage>", "rewritten": "<strengthened>", "technique": "<what changed>"}
  ]
}`,

  // =========================================================================
  // 7. PASSIVE VOICE FINDER
  // =========================================================================
  'passive-voice-finder': (content, scope, options) => `You are a prose activation specialist finding passive constructions and transforming them to dynamic active voice.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}

PASSIVE TYPES:
1. Standard Passive - "was killed" → "killed"
2. Hidden Passive - "got destroyed", "became known"
3. Nominalization - Verbs as nouns ("made a decision" → "decided")
4. "There was/were" constructions
5. Justified Passive - When passive works better

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100 active voice score>,
  "grade": "<A-F>",
  "summary": "<assessment>",
  "statistics": {
    "totalSentences": <count>,
    "passiveConstructions": <count>,
    "passivePercentage": <percent>,
    "assessment": "too-passive|acceptable|well-balanced|very-active"
  },
  "standardPassive": [
    {
      "original": "<passive sentence>",
      "hiddenActor": "<who's doing action>",
      "severity": "revise|consider|acceptable",
      "activeVersion": "<rewritten>",
      "improvement": "<why active is stronger>"
    }
  ],
  "nominalizations": [
    {
      "original": "<sentence with noun-verb>",
      "nominalization": "<the noun>",
      "hiddenVerb": "<the verb>",
      "activated": "<with verb instead of noun>"
    }
  ],
  "thereWasConstructions": [
    {"original": "<there was sentence>", "directVersion": "<without there was>"}
  ],
  "justifiedPassive": [
    {"sentence": "<passive that works>", "reason": "unknown-actor|emphasis|mystery-effect", "keep": true}
  ],
  "transformationShowcase": [
    {"before": "<passive paragraph>", "after": "<activated paragraph>", "changes": ["<change 1>", "<change 2>"]}
  ],
  "actionableRewrites": [
    {"priority": "high|medium|low", "original": "<passive>", "rewritten": "<active>", "explanation": "<why better>"}
  ]
}`,

  // =========================================================================
  // 8. READABILITY SCORE
  // =========================================================================
  'readability': (content, scope, options) => `You are a readability analyst helping authors match prose complexity to their target audience.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}
- Target Audience: ${options?.targetAudience || 'General adult readers'}

GENRE BENCHMARKS:
- Literary Fiction: Grade 8-12, Flesch 50-70
- Commercial Fiction: Grade 6-8, Flesch 60-80
- YA: Grade 5-7, Flesch 70-85
- Thriller: Grade 5-7, Flesch 65-80

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100 appropriateness for target>,
  "grade": "<A-F>",
  "summary": "<assessment with audience fit>",
  "metrics": {
    "fleschReadingEase": {"score": <0-100>, "interpretation": "<easy|standard|difficult>"},
    "fleschKincaidGrade": {"level": <grade>, "recommendation": "<raise|lower|maintain>"},
    "gunningFog": <index>,
    "avgSentenceLength": <words>,
    "avgWordLength": <characters>
  },
  "sentenceAnalysis": {
    "distribution": {
      "short": {"count": <under 10>, "percentage": <percent>},
      "medium": {"count": <10-20>, "percentage": <percent>},
      "long": {"count": <over 20>, "percentage": <percent>}
    },
    "varietyScore": <0-100>,
    "problematicSentences": [{"sentence": "<too long>", "wordCount": <count>, "simplified": "<clearer version>"}]
  },
  "wordAnalysis": {
    "complexWords": {"count": <3+ syllables>, "percentage": <percent>},
    "simplifiable": [{"complex": "<word>", "simpler": "<alternative>", "context": "<sentence>"}]
  },
  "audienceFit": {
    "targetAudience": "<audience>",
    "currentFit": <0-100>,
    "adjustments": [{"element": "<what to change>", "current": "<now>", "suggested": "<improvement>"}]
  },
  "actionableImprovements": [
    {"priority": "high|medium|low", "area": "<sentence-length|word-complexity>", "current": "<example>", "improved": "<better>"}
  ],
  "quickWins": ["<easy readability improvements>"]
}`,

  // =========================================================================
  // 9. EMOTIONAL ARC
  // =========================================================================
  'emotional-arc': (content, scope, options) => `You are an emotional narrative architect mapping the reader's emotional journey.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}
- Scene Goal: ${options?.sceneGoal || 'Not specified'}

EMOTIONAL ELEMENTS:
1. Reader Emotions - What reader feels
2. Character Emotions - What characters experience
3. Cathartic Moments - Emotional release points
4. Empathy Points - Where readers connect

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100 emotional effectiveness>,
  "grade": "<A-F>",
  "summary": "<assessment>",
  "emotionalProfile": {
    "dominantEmotions": ["<primary>", "<secondary>"],
    "emotionalRange": <0-100>,
    "intensity": {"average": <1-10>, "peak": <1-10>, "valley": <1-10>},
    "readerEngagement": <0-100>
  },
  "emotionalJourney": [
    {
      "position": <0-100>,
      "readerFeeling": "<emotion>",
      "characterFeeling": "<emotion>",
      "intensity": <-1.0 to 1.0>,
      "trigger": "<what causes it>",
      "technique": "<how created>"
    }
  ],
  "emotionalPeaks": [
    {"position": "<where>", "emotion": "<emotion>", "effectiveness": <0-100>, "enhancement": "<how to strengthen>"}
  ],
  "emotionalValleys": [
    {"position": "<where>", "purpose": "intentional-rest|problematic", "fix": "<how to inject emotion>"}
  ],
  "empathyPoints": [
    {"location": "<where>", "character": "<who>", "technique": "vulnerability|relatable-flaw|etc", "effectiveness": <0-100>}
  ],
  "showingVsTelling": {
    "emotionsTold": [{"telling": "<she felt sad>", "showing": "<rewritten to show>"}],
    "emotionsShown": [{"passage": "<effective showing>", "technique": "<how>"}]
  },
  "flatSpots": [
    {"location": "<where>", "currentText": "<flat>", "emotionallyCharged": "<with emotion>"}
  ],
  "actionableImprovements": [
    {"priority": "high|medium|low", "emotionalGoal": "<target emotion>", "technique": "<how>", "implementation": "<specific change>"}
  ]
}`,

  // =========================================================================
  // 10. CHAPTER SUMMARY
  // =========================================================================
  'chapter-summary': (content, scope, options) => `You are a story architect creating comprehensive chapter analysis for tracking across manuscripts.

CONTEXT:
- Scope: ${scope}
- Chapter: ${options?.chapterNumber || 'Unknown'}
- Genre: ${options?.genre || 'General fiction'}

PURPOSE: Create reference for continuity, character arcs, plot threads.

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "chapterNumber": ${options?.chapterNumber || 'null'},
  "wordCount": <count>,
  "summaries": {
    "oneLiner": "<single sentence>",
    "shortSummary": "<3-4 sentences>",
    "detailedSummary": "<full paragraph>"
  },
  "plotMovement": {
    "mainPlot": {"advancement": "<how plot moved>", "status": "setup|rising|climax|resolution", "percentComplete": <0-100>},
    "subplots": [{"subplot": "<name>", "advancement": "<movement>", "status": "<stage>"}]
  },
  "keyEvents": [
    {"event": "<what happened>", "significance": "major|moderate|minor", "consequences": "<immediate>", "futureImplications": "<potential impact>"}
  ],
  "characters": [
    {
      "name": "<character>",
      "role": "POV|major|supporting",
      "arc": {"startState": "<beginning>", "endState": "<end>", "change": "<what changed>"},
      "keyActions": ["<actions>"],
      "newInfo": ["<revelations about them>"]
    }
  ],
  "settings": [{"location": "<where>", "significance": "<why matters>", "newDetails": ["<established>"]}],
  "timeline": {"duration": "<time passed>", "timeMarkers": ["<references>"]},
  "revelations": [{"revelation": "<what>", "revealedTo": "reader|character|both", "significance": "major|minor"}],
  "conflicts": [{"conflict": "<description>", "type": "internal|interpersonal|external", "status": "introduced|escalated|resolved"}],
  "foreshadowing": [{"setup": "<element>", "potentialPayoff": "<what it might lead to>"}],
  "openThreads": [{"thread": "<unresolved>", "status": "active|dormant"}],
  "themes": [{"theme": "<thematic element>", "development": "<how explored>"}],
  "chapterFunction": {"primaryPurpose": "<why chapter exists>", "structuralRole": "hook|setup|climax|bridge"},
  "nextChapterSetup": {"hooks": ["<what pulls reader forward>"], "expectations": ["<reader expectations>"]}
}`,

  // =========================================================================
  // 11. PLOT HOLE FINDER
  // =========================================================================
  'plot-holes': (content, scope, options) => `You are a continuity and logic specialist finding plot holes and inconsistencies.

CONTEXT:
- Scope: ${scope}
- Story Context: ${options?.bookContext || 'Analyze in isolation'}
${options?.storyBible ? '- Story Bible: Available' : ''}

PLOT HOLE TYPES:
1. Logic Failures - Impossible as described
2. Timeline Problems - Temporal impossibilities
3. Character Knowledge - Knowing things they shouldn't
4. Character Behavior - Actions contradicting personality
5. World Rule Violations - Breaking established rules
6. Dropped Threads - Setup without payoff

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100 consistency>,
  "grade": "<A-F>",
  "summary": "<assessment>",
  "definiteProblems": [
    {
      "severity": "critical|major|minor",
      "category": "logic|timeline|character-knowledge|behavior|world-rules|dropped-thread",
      "title": "<short description>",
      "description": "<detailed explanation>",
      "evidence": {"quote1": "<text showing one thing>", "quote2": "<contradicting text>"},
      "impact": "<how affects story>",
      "suggestedFixes": [{"approach": "<strategy>", "implementation": "<specific change>", "effort": "easy|moderate|significant"}],
      "bestFix": "<recommended>"
    }
  ],
  "potentialIssues": [
    {"concern": "<might be problem>", "evidence": "<quote>", "mightBeExplainedBy": "<possible explanation>", "needsVerification": "<what to check>"}
  ],
  "timelineAnalysis": {
    "clarity": <0-100>,
    "events": [{"event": "<what>", "when": "<time>", "issues": "<problems>"}],
    "conflicts": [{"issue": "<contradiction>", "fix": "<resolution>"}]
  },
  "characterConsistency": [
    {
      "character": "<name>",
      "consistencyScore": <0-100>,
      "knowledgeIssues": [{"knows": "<what>", "problem": "<how they couldn't know>", "fix": "<solution>"}],
      "behaviorIssues": [{"action": "<what they do>", "established": "<their personality>", "conflict": "<contradiction>", "fix": "<resolution>"}]
    }
  ],
  "threadTracking": [
    {"thread": "<plot element>", "introduced": "<where>", "status": "resolved|ongoing|potentially-dropped", "resolution": "<when/how should resolve>"}
  ],
  "prioritizedFixes": [
    {"priority": 1, "issue": "<most critical>", "fix": "<solution>", "effort": "<level>"}
  ]
}`,

  // =========================================================================
  // 12. DIALOGUE ANALYSIS
  // =========================================================================
  'dialogue-analysis': (content, scope, options) => `You are a dialogue specialist analyzing conversation for naturalness, purpose, and dramatic effectiveness.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}

DIALOGUE ELEMENTS:
1. Naturalness - Sounds like real speech
2. Purpose - Every line advances plot or character
3. Character Voice - Speakers are distinct
4. Subtext - Depth beneath surface
5. Conflict/Tension - Friction in exchanges
6. Tags and Beats - Attribution effectiveness

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100 dialogue quality>,
  "grade": "<A-F>",
  "summary": "<assessment>",
  "statistics": {
    "dialoguePercentage": <percent>,
    "avgExchangeLength": <lines>,
    "speakingCharacters": <count>
  },
  "qualityMetrics": {
    "naturalness": {"score": <0-100>, "note": "<assessment>"},
    "purposefulness": {"score": <0-100>, "note": "<assessment>"},
    "characterDistinction": {"score": <0-100>, "note": "<assessment>"},
    "subtext": {"score": <0-100>, "note": "<assessment>"},
    "conflict": {"score": <0-100>, "note": "<assessment>"}
  },
  "purposeAnalysis": [
    {"exchange": "<dialogue>", "purposes": ["plot|character|tension|world-building"], "assessment": "multi-purpose|purposeless", "fix": "<how to add purpose>"}
  ],
  "naturalnessIssues": [
    {"quote": "<unnatural>", "problem": "too-formal|monologuing|on-the-nose", "naturalVersion": "<how people talk>"}
  ],
  "subtextAnalysis": [
    {"exchange": "<dialogue>", "surface": "<what's said>", "beneath": "<what's meant>", "effectiveness": <0-100>}
  ],
  "infoDumps": [
    {"quote": "<expository dialogue>", "problem": "as-you-know-bob|lecture-mode", "betterDelivery": "<organic version>"}
  ],
  "talkingHeads": [
    {"location": "<where>", "lineCount": <without action>, "beatsToAdd": [{"afterLine": "<which>", "beat": "<action>"}]}
  ],
  "dialogueTags": {
    "distribution": {"said": <count>, "asked": <count>, "creative": <count>},
    "overusedTags": [{"tag": "<overused>", "alternatives": ["<options>"]}],
    "problematicTags": [{"tag": "<distracting>", "replacement": "<better>"}]
  },
  "bestDialogue": [{"exchange": "<excellent>", "whatWorks": ["<elements>"], "learn": "<replicate>"}],
  "weakestDialogue": [{"exchange": "<problematic>", "issues": ["<problems>"], "rewritten": "<improved>"}],
  "actionableImprovements": [
    {"priority": "high|medium|low", "type": "<issue type>", "current": "<dialogue>", "improved": "<better>", "technique": "<what changed>"}
  ]
}`,

  // =========================================================================
  // 13. SHOW/TELL RATIO
  // =========================================================================
  'show-tell-ratio': (content, scope, options) => `You are a "show don't tell" specialist identifying telling passages and demonstrating how to transform them.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}

SHOW VS TELL:
- TELLING: "She was angry"
- SHOWING: "Her jaw tightened, knuckles whitening around the cup"

WHEN TELLING IS OK: Transitions, unimportant info, pacing needs

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100 showing effectiveness>,
  "grade": "<A-F>",
  "summary": "<assessment>",
  "ratio": {
    "showingPercentage": <percent>,
    "tellingPercentage": <percent>,
    "recommendation": "<ideal for this scene>"
  },
  "tellingInstances": [
    {
      "type": "emotion|trait|backstory|motivation",
      "severity": "needs-showing|consider|acceptable",
      "original": "<telling passage>",
      "whatsTold": "<information>",
      "showingVersion": "<transformed>",
      "techniques": ["action", "dialogue", "sensory"],
      "impact": "<how change improves prose>"
    }
  ],
  "emotionalTelling": [
    {
      "original": "<she felt sad>",
      "emotion": "<emotion>",
      "showingOptions": {
        "physicalTells": ["<body language>"],
        "internalSensation": ["<physical feeling>"],
        "actions": ["<behaviors>"],
        "dialogue": ["<speech showing it>"]
      },
      "bestRewrite": "<full showing version>"
    }
  ],
  "effectiveTelling": [
    {"passage": "<telling that works>", "whyEffective": "pacing|transition|efficiency"}
  ],
  "excellentShowing": [
    {"passage": "<great example>", "whatItShows": "<demonstrated>", "techniques": ["<used>"], "whyItWorks": "<analysis>"}
  ],
  "sensoryAnalysis": {
    "sensesUsed": {"sight": <0-100>, "sound": <0-100>, "touch": <0-100>, "smell": <0-100>, "taste": <0-100>},
    "underusedSenses": ["<senses to add>"],
    "suggestions": [{"location": "<where>", "sense": "<which>", "addition": "<specific detail>"}]
  },
  "transformationShowcase": [
    {"before": "<telling passage>", "after": "<showing version>", "techniques": ["<applied>"], "impact": "<improvement>"}
  ],
  "showingToolkit": {
    "forEmotions": {
      "fear": ["racing heart", "cold sweat", "frozen muscles"],
      "anger": ["clenched jaw", "flushed cheeks", "sharp movements"],
      "sadness": ["heavy limbs", "blurred vision", "tight throat"]
    }
  },
  "actionableImprovements": [
    {"priority": "high|medium|low", "original": "<telling>", "rewrite": "<showing>", "technique": "<how>"}
  ]
}`,

  // =========================================================================
  // 14. CLICHE FINDER
  // =========================================================================
  'cliche-finder': (content, scope, options) => `You are a language freshness specialist identifying clichés and suggesting original alternatives.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}

CLICHE TYPES:
1. Phrase Clichés - "crystal clear", "deafening silence"
2. Simile/Metaphor Clichés - "eyes like pools"
3. Description Clichés - "chiseled jaw", "raven hair"
4. Action Clichés - "heart pounded", "breath caught"
5. Emotional Clichés - Stock ways of showing emotions

NOTE: Genre conventions aren't always clichés.

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100 originality>,
  "grade": "<A-F>",
  "summary": "<assessment>",
  "statistics": {
    "totalCliches": <count>,
    "clicheDensity": "<per 1000 words>",
    "severityBreakdown": {"mustFix": <count>, "shouldFix": <count>, "consider": <count>, "genreAcceptable": <count>}
  },
  "phraseCliches": [
    {
      "cliche": "<phrase>",
      "context": "<sentence>",
      "severity": "must-fix|should-fix|consider|genre-ok",
      "whyCliche": "<why overused>",
      "freshAlternatives": [{"alternative": "<original>", "tone": "<how shifts>", "why": "<why better>"}],
      "rewrittenSentence": "<with fresh language>"
    }
  ],
  "descriptionCliches": [
    {"cliche": "<tired description>", "describing": "<what>", "freshApproaches": [{"approach": "<original way>", "example": "<implementation>"}], "rewrite": "<fresh version>"}
  ],
  "actionCliches": [
    {"cliche": "<heart pounded>", "emotion": "<conveying>", "alternatives": {"unexpected": "<surprising reaction>", "specific": "<character-specific>", "sensory": "<unique detail>"}, "rewrite": "<fresh version>"}
  ],
  "emotionalCliches": [
    {"cliche": "<stock expression>", "emotion": "<emotion>", "freshExpressions": [{"expression": "<original>", "technique": "unexpected-physical|character-specific"}], "rewrite": "<fresh beat>"}
  ],
  "genreAcceptable": [
    {"phrase": "<convention>", "genre": "<genre>", "assessment": "<why acceptable>", "verdict": "keep|consider-freshening"}
  ],
  "freshLanguage": [
    {"passage": "<original language>", "whatWorks": "<why effective>", "replicate": "<how to do more>"}
  ],
  "prioritizedFixes": [
    {"priority": 1, "cliche": "<most important>", "impact": "<improvement>", "fix": "<solution>"}
  ],
  "fresheningToolkit": {
    "techniques": [{"technique": "<method>", "example": {"cliche": "<tired>", "fresh": "<original>"}}]
  }
}`,

  // =========================================================================
  // 15. CONTINUITY CHECK
  // =========================================================================
  'continuity-check': (content, scope, options) => `You are a continuity tracking specialist extracting and verifying trackable details.

CONTEXT:
- Scope: ${scope}
${options?.storyBible ? '- Story Bible: Available for cross-reference' : '- Building continuity data from this text'}

CONTINUITY ELEMENTS:
1. Character Physical Details - Eye color, height, scars
2. Character Knowledge - What each knows/doesn't know
3. Object Locations - Where items are
4. Timeline - When things happen
5. Setting Details - Place descriptions
6. Injuries/Conditions - Physical states

TEXT TO ANALYZE:
"""
${content}
"""

Respond in JSON format:
{
  "score": <0-100 consistency>,
  "grade": "<A-F>",
  "summary": "<assessment>",
  "continuityDatabase": {
    "characters": [
      {
        "name": "<character>",
        "aliases": ["<nicknames>"],
        "physicalDetails": {"definite": [{"detail": "<trait>", "source": "<quote>", "location": "<where>"}]},
        "knowledge": [{"knows": "<what>", "learnedWhen": "<when>"}],
        "currentState": {"physical": "<condition>", "emotional": "<state>", "location": "<where>"},
        "relationships": [{"with": "<character>", "nature": "<type>", "status": "<current>"}]
      }
    ],
    "settings": [
      {"name": "<location>", "details": [{"detail": "<element>", "source": "<quote>"}], "atmosphere": "<mood>"}
    ],
    "objects": [
      {"object": "<item>", "description": "<how described>", "currentLocation": "<where>", "owner": "<who>"}
    ],
    "timeline": {
      "explicitTimes": [{"event": "<what>", "time": "<specific>"}],
      "relativeTimes": [{"event": "<what>", "relative": "<three days later>", "anchor": "<relative to>"}],
      "sequence": [{"order": <number>, "event": "<what>"}]
    }
  },
  "internalInconsistencies": [
    {
      "type": "character-detail|object|timeline|knowledge",
      "severity": "critical|major|minor",
      "issue": "<the inconsistency>",
      "evidence": {"instance1": {"quote": "<text>", "location": "<where>"}, "instance2": {"quote": "<contradicting>", "location": "<where>"}},
      "resolution": "<how to fix>"
    }
  ],
  "potentialCrossChapterIssues": [
    {"element": "<detail>", "currentValue": "<what it is>", "concern": "<what to verify>", "trackingNote": "<for manuscript check>"}
  ],
  "characterKnowledgeMatrix": {
    "<character>": {"knows": ["<what they know>"], "doesNotKnow": ["<significant unknowns>"]}
  },
  "trackingRecommendations": [
    {"element": "<important detail>", "recommendation": "<how to keep consistent>", "storyBibleEntry": "<suggested entry>"}
  ]
}`
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AnalyzeRequestSchema.parse(body);
    
    const { type, content, scope, options } = validated;

    const promptGenerator = ANALYSIS_PROMPTS[type];
    if (!promptGenerator) {
      return NextResponse.json(
        { error: `Unknown analysis type: ${type}` },
        { status: 400 }
      );
    }

    const prompt = promptGenerator(content, scope, options);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }]
    });

    const textContent = response.content.find(block => block.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    let analysisResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      analysisResult = { score: 0, summary: responseText, issues: [], suggestions: [], raw: responseText };
    }

    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    return NextResponse.json({
      success: true,
      type,
      scope,
      ...analysisResult,
      tokensUsed,
      metadata: {
        model: 'claude-sonnet-4-20250514',
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens
      }
    });

  } catch (error) {
    console.error('AI Analyze error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Analysis failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
