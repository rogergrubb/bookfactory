import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Request validation schema - expanded for all 15 analyze tools
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
  }).optional()
});

// ============================================================================
// ANALYSIS PROMPTS - All 15 Analyze Tools
// ============================================================================

const ANALYSIS_PROMPTS: Record<string, (content: string, scope: string, options?: any) => string> = {
  
  // 1. PACING ANALYSIS
  'pacing': (content, scope) => `You are an expert fiction editor analyzing narrative pacing. Examine this ${scope} for rhythm, flow, and engagement.

Evaluate:
1. Overall pacing rhythm (action vs reflection balance)
2. Scene/beat tension curve
3. Sentence length variety (short punchy vs flowing)
4. Paragraph density and white space
5. Dialogue-to-narrative ratio
6. Areas that drag (too slow) or rush (too fast)
7. Cliffhangers and hooks

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 overall pacing score>,
  "summary": "<2-3 sentence assessment>",
  "pacingCurve": [
    {"position": <0-100 percentage through text>, "intensity": <1-10>, "label": "<what's happening>"}
  ],
  "issues": [
    {
      "type": "warning|error|info",
      "location": "<quote or position description>",
      "message": "<specific issue>",
      "suggestion": "<how to fix>"
    }
  ],
  "metrics": {
    "avgSentenceLength": <words>,
    "avgParagraphLength": <sentences>,
    "dialogueRatio": <percentage>,
    "actionScenes": <percentage>,
    "reflectiveScenes": <percentage>
  },
  "highlights": [
    {"type": "excellent|slow|rushed", "excerpt": "<15-20 word quote>", "note": "<why this works or doesn't>"}
  ],
  "suggestions": ["<actionable improvement 1>", "<actionable improvement 2>", "<actionable improvement 3>"]
}`,

  // 2. VOICE CONSISTENCY
  'voice-consistency': (content, scope, options) => `You are an expert editor analyzing narrative voice consistency. Check if the author's voice remains consistent throughout this ${scope}.

Focus on:
1. Narrative tone consistency (formal/casual, distant/intimate)
2. POV discipline (no head-hopping, consistent perspective)
3. Tense consistency
4. Style consistency (sentence patterns, vocabulary level)
5. Authorial intrusion or inconsistent filtering
6. Consistent use of literary devices

${options?.bookContext ? `Story context: ${options.bookContext}` : ''}

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 voice consistency score>,
  "summary": "<assessment of voice consistency>",
  "voiceProfile": {
    "tone": "<identified tone>",
    "pov": "<POV type detected>",
    "tense": "<primary tense>",
    "formality": "<formal/informal/mixed>",
    "distance": "<intimate/medium/distant>"
  },
  "issues": [
    {
      "type": "error|warning|info",
      "category": "tone|pov|tense|style",
      "location": "<quote showing the issue>",
      "message": "<what's inconsistent>",
      "suggestion": "<how to fix>"
    }
  ],
  "shifts": [
    {"position": "<where in text>", "from": "<original voice aspect>", "to": "<shifted to>", "jarring": true|false}
  ],
  "suggestions": ["<improvement 1>", "<improvement 2>"]
}`,

  // 3. TENSION MAP
  'tension-map': (content, scope) => `You are an expert at analyzing narrative tension. Map the tension levels throughout this ${scope}, identifying peaks, valleys, and opportunities.

Analyze:
1. Opening hook strength
2. Tension escalation pattern
3. Release and rebuild cycles
4. Stakes clarity and escalation
5. Micro-tension in dialogue/description
6. Cliffhanger/hook effectiveness
7. Flat spots needing tension injection

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 tension effectiveness>,
  "summary": "<overall tension assessment>",
  "tensionMap": [
    {
      "position": <0-100 percentage>,
      "level": <1-10 tension level>,
      "type": "suspense|conflict|mystery|danger|emotional|romantic",
      "description": "<what's creating tension>",
      "stakes": "<what's at risk>"
    }
  ],
  "peaks": [
    {"position": "<where>", "level": <1-10>, "description": "<the peak moment>"}
  ],
  "valleys": [
    {"position": "<where>", "level": <1-10>, "issue": "<why tension dropped>", "suggestion": "<how to raise it>"}
  ],
  "issues": [
    {
      "type": "warning|error",
      "message": "<tension problem>",
      "suggestion": "<fix>"
    }
  ],
  "opportunities": ["<where tension could be added and how>"],
  "suggestions": ["<actionable improvement>"]
}`,

  // 4. CHARACTER VOICE ANALYSIS
  'character-voice-analysis': (content, scope, options) => `You are an expert at analyzing character voice in fiction. Examine how distinct and consistent each character's voice is in dialogue and POV.

${options?.characterNames ? `Characters to analyze: ${options.characterNames.join(', ')}` : 'Identify all speaking characters.'}

Analyze:
1. Distinctiveness - could you tell who's speaking without tags?
2. Consistency - does each character maintain their voice?
3. Speech patterns, vocabulary, rhythm unique to each
4. Verbal tics, catchphrases, dialect
5. Education/background reflected in speech
6. Emotional state affecting speech
7. Subtext and what's left unsaid

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 character voice score>,
  "summary": "<overall assessment>",
  "characters": [
    {
      "name": "<character name or identifier>",
      "distinctiveness": <0-100>,
      "consistency": <0-100>,
      "voiceTraits": ["<trait 1>", "<trait 2>", "<trait 3>"],
      "vocabulary": "<vocabulary level/style>",
      "speechPatterns": ["<pattern 1>", "<pattern 2>"],
      "exampleQuote": "<representative dialogue>",
      "issues": ["<any inconsistencies>"],
      "suggestions": ["<how to strengthen this voice>"]
    }
  ],
  "dialogueQuality": {
    "naturalness": <0-100>,
    "subtextUsage": <0-100>,
    "conflictInDialogue": <0-100>
  },
  "issues": [
    {
      "type": "warning|error",
      "characters": ["<affected characters>"],
      "message": "<the issue>",
      "location": "<quote or description>",
      "suggestion": "<fix>"
    }
  ],
  "interchangeableDialogue": ["<quotes that could be said by anyone>"],
  "suggestions": ["<improvement 1>", "<improvement 2>"]
}`,

  // 5. REPETITION FINDER
  'repetition-finder': (content, scope) => `You are an expert editor finding repetitive language. Identify overused words, repeated phrases, and echoing constructions in this ${scope}.

Find:
1. Words used too frequently (excluding articles/prepositions)
2. Repeated phrases or sentence constructions
3. Echoing words in proximity (same word within 2-3 sentences)
4. Repeated sentence starters
5. Overused dialogue tags
6. Repeated character gestures/actions ("nodded," "sighed")
7. Crutch words specific to this author

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 variety score, 100=excellent variety>,
  "summary": "<assessment of repetition issues>",
  "wordCount": <total words>,
  "uniqueWords": <unique word count>,
  "repetitionRatio": <percentage of repeated significant words>,
  "overusedWords": [
    {
      "word": "<word>",
      "count": <times used>,
      "frequency": "<per 1000 words>",
      "severity": "high|medium|low",
      "alternatives": ["<alt 1>", "<alt 2>", "<alt 3>"]
    }
  ],
  "repeatedPhrases": [
    {
      "phrase": "<repeated phrase>",
      "count": <times>,
      "locations": ["<position 1>", "<position 2>"],
      "suggestion": "<how to vary>"
    }
  ],
  "echoingWords": [
    {
      "word": "<word>",
      "instances": ["<quote 1 showing context>", "<quote 2>"],
      "suggestion": "<fix>"
    }
  ],
  "sentenceStarters": [
    {"starter": "<common starter>", "count": <times>, "percentage": <of total>}
  ],
  "issues": [
    {
      "type": "warning|error",
      "message": "<issue description>",
      "examples": ["<example>"],
      "suggestion": "<fix>"
    }
  ],
  "suggestions": ["<global improvement 1>", "<global improvement 2>"]
}`,

  // 6. ADVERB HUNTER
  'adverb-hunter': (content, scope) => `You are an expert editor hunting unnecessary adverbs. Following Stephen King's advice ("The road to hell is paved with adverbs"), identify adverbs that weaken prose.

Find:
1. -ly adverbs that tell instead of show
2. Adverbs modifying dialogue tags ("said angrily")
3. Redundant adverbs (already implied by verb)
4. Weak verb + adverb that could be one strong verb
5. Adverbs propping up lazy verbs
6. Justified/effective adverbs (not all are bad)

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 prose strength, 100=minimal unnecessary adverbs>,
  "summary": "<assessment>",
  "adverbCount": <total adverbs found>,
  "adverbDensity": "<per 1000 words>",
  "problematicAdverbs": [
    {
      "adverb": "<the adverb>",
      "context": "<sentence containing it>",
      "issue": "telling|redundant|weak-verb|dialogue-tag",
      "severity": "cut|revise|consider",
      "suggestion": "<stronger alternative sentence>"
    }
  ],
  "acceptableAdverbs": [
    {"adverb": "<adverb>", "context": "<sentence>", "reason": "<why it works>"}
  ],
  "dialogueTagAdverbs": [
    {"tag": "<he said angrily>", "suggestion": "<show the anger instead>"}
  ],
  "weakVerbCombos": [
    {"original": "<walked quickly>", "stronger": "<strode/hurried/rushed>"}
  ],
  "issues": [
    {
      "type": "warning|error",
      "message": "<pattern identified>",
      "count": <instances>,
      "suggestion": "<how to improve>"
    }
  ],
  "suggestions": ["<general advice>"]
}`,

  // 7. PASSIVE VOICE FINDER
  'passive-voice-finder': (content, scope) => `You are an expert editor identifying passive voice constructions. Find instances where active voice would strengthen the prose.

Identify:
1. All passive voice constructions
2. Hidden/disguised passive voice
3. Passive voice hiding the actor
4. Weak "to be" verb constructions
5. Nominalization (verbs turned into nouns)
6. Justified passive voice (sometimes appropriate)

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 active voice score>,
  "summary": "<assessment of passive voice usage>",
  "passiveCount": <total passive constructions>,
  "passivePercentage": <of all sentences>,
  "passiveInstances": [
    {
      "original": "<passive sentence>",
      "type": "standard|hidden|nominalization",
      "actor": "<who's doing the action, if identifiable>",
      "severity": "revise|consider|acceptable",
      "activeVersion": "<rewritten in active voice>",
      "improvement": "<why active is better here>"
    }
  ],
  "justifiedPassive": [
    {"sentence": "<passive sentence>", "reason": "<why passive works here>"}
  ],
  "weakConstructions": [
    {"original": "<there was/it was construction>", "stronger": "<direct version>"}
  ],
  "issues": [
    {
      "type": "warning|info",
      "message": "<pattern or problem>",
      "suggestion": "<fix>"
    }
  ],
  "beforeAfterExamples": [
    {"before": "<passive>", "after": "<active>", "impact": "<why better>"}
  ],
  "suggestions": ["<improvement advice>"]
}`,

  // 8. READABILITY SCORE
  'readability': (content, scope) => `You are a readability analysis expert. Calculate comprehensive readability metrics for this ${scope}.

Calculate:
1. Flesch Reading Ease (0-100, higher = easier)
2. Flesch-Kincaid Grade Level
3. Gunning Fog Index
4. Average sentence length
5. Average word length
6. Vocabulary complexity
7. Sentence variety
8. Paragraph structure

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 overall readability>,
  "summary": "<readability assessment and target audience>",
  "metrics": {
    "fleschReadingEase": <0-100>,
    "fleschKincaidGrade": <grade level>,
    "gunningFog": <index>,
    "avgSentenceLength": <words>,
    "avgWordLength": <characters>,
    "avgParagraphLength": <sentences>,
    "complexWords": <percentage over 3 syllables>,
    "vocabularyDiversity": <unique words / total words ratio>
  },
  "sentenceAnalysis": {
    "shortest": <words>,
    "longest": <words>,
    "varietyScore": <0-100>,
    "simplePercentage": <percentage>,
    "compoundPercentage": <percentage>,
    "complexPercentage": <percentage>
  },
  "targetAudience": "<recommended audience>",
  "genreComparison": "<how this compares to typical genre prose>",
  "issues": [
    {
      "type": "warning|info",
      "message": "<readability issue>",
      "example": "<problematic sentence>",
      "suggestion": "<how to improve>"
    }
  ],
  "strengths": ["<what works well>"],
  "suggestions": ["<improvement 1>", "<improvement 2>"]
}`,

  // 9. EMOTIONAL ARC
  'emotional-arc': (content, scope) => `You are an expert at emotional narrative analysis. Map the emotional journey through this ${scope}.

Analyze:
1. Opening emotional state
2. Key emotional beats and transitions
3. Emotional peaks and valleys
4. Reader emotional engagement points
5. Character emotional arcs
6. Cathartic moments
7. Emotional pacing

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 emotional effectiveness>,
  "summary": "<emotional arc assessment>",
  "emotionalJourney": [
    {
      "position": <0-100 percentage>,
      "primaryEmotion": "<emotion>",
      "intensity": <-1.0 to 1.0, negative=negative emotions>,
      "trigger": "<what causes this emotion>",
      "characterFeeling": "<what character feels>",
      "readerFeeling": "<what reader likely feels>"
    }
  ],
  "emotionalPeaks": [
    {"position": "<where>", "emotion": "<emotion>", "intensity": <level>, "moment": "<description>"}
  ],
  "emotionalValleys": [
    {"position": "<where>", "emotion": "<emotion>", "purpose": "<why the lull>"}
  ],
  "dominantEmotions": ["<top emotion>", "<second>", "<third>"],
  "emotionalRange": <0-100 variety of emotions>,
  "issues": [
    {
      "type": "warning|info",
      "message": "<emotional arc issue>",
      "suggestion": "<how to improve>"
    }
  ],
  "flatSpots": ["<positions where emotional engagement drops>"],
  "catharticMoments": ["<powerful emotional release points>"],
  "suggestions": ["<how to strengthen emotional impact>"]
}`,

  // 10. CHAPTER SUMMARY
  'chapter-summary': (content, scope) => `You are an expert story analyst. Create a comprehensive summary of this ${scope} capturing all essential story elements.

Summarize:
1. Key events (plot points)
2. Character appearances and development
3. Setting/location details
4. Revelations or new information
5. Conflict introduced/resolved
6. Themes touched upon
7. Setup/foreshadowing for later
8. Emotional beats

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "summary": "<3-4 sentence plot summary>",
  "detailedSummary": "<paragraph-length detailed summary>",
  "keyEvents": [
    {"event": "<what happened>", "significance": "<why it matters>"}
  ],
  "characters": [
    {
      "name": "<character>",
      "role": "<protagonist/antagonist/supporting>",
      "actions": ["<key action 1>", "<key action 2>"],
      "development": "<how they changed or what we learned>"
    }
  ],
  "settings": [
    {"location": "<where>", "significance": "<why this setting matters>"}
  ],
  "conflicts": [
    {"type": "internal|interpersonal|external", "description": "<the conflict>", "status": "introduced|escalated|resolved"}
  ],
  "revelations": ["<new information revealed>"],
  "foreshadowing": ["<setup for later events>"],
  "themes": ["<thematic elements>"],
  "openQuestions": ["<unresolved questions for reader>"],
  "chapterPurpose": "<what this chapter accomplishes in the larger story>"
}`,

  // 11. PLOT HOLE FINDER
  'plot-holes': (content, scope, options) => `You are an expert continuity editor. Analyze this ${scope} for plot holes, inconsistencies, and logical problems.

${options?.fullManuscript ? 'You have access to the full manuscript for context.' : 'Analyzing this section in isolation - flag anything that MIGHT be inconsistent with a larger story.'}

Find:
1. Logical inconsistencies
2. Timeline problems
3. Character behavior contradictions
4. Physics/world rule violations
5. Forgotten or dropped threads
6. Motivation gaps
7. Impossible knowledge (characters knowing things they shouldn't)
8. Continuity errors

${options?.bookContext ? `Story context: ${options.bookContext}` : ''}

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 consistency score>,
  "summary": "<overall consistency assessment>",
  "plotHoles": [
    {
      "severity": "critical|major|minor",
      "category": "logic|timeline|character|worldbuilding|continuity|motivation",
      "description": "<the inconsistency>",
      "evidence": "<quote or reference showing the problem>",
      "impact": "<how this affects the story>",
      "suggestion": "<how to fix>"
    }
  ],
  "timelineIssues": [
    {"issue": "<temporal problem>", "details": "<specifics>", "fix": "<solution>"}
  ],
  "characterInconsistencies": [
    {"character": "<name>", "issue": "<behavior contradiction>", "fix": "<solution>"}
  ],
  "droppedThreads": ["<setup that wasn't paid off>"],
  "potentialIssues": [
    {"concern": "<might be a problem>", "needsContext": "<what would clarify>"}
  ],
  "suggestions": ["<how to improve consistency>"]
}`,

  // 12. DIALOGUE ANALYSIS
  'dialogue-analysis': (content, scope) => `You are an expert dialogue analyst. Evaluate the dialogue in this ${scope} for quality, effectiveness, and naturalness.

Analyze:
1. Naturalness - does it sound like real speech?
2. Character distinction - unique voices?
3. Subtext - what's beneath the surface?
4. Dialogue tags - variety and effectiveness
5. Beats and action - pacing around dialogue
6. Info-dumping - exposition disguised as dialogue
7. Purpose - does each line advance plot/character?
8. Conflict and tension in exchanges

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 dialogue quality>,
  "summary": "<dialogue assessment>",
  "statistics": {
    "dialoguePercentage": <of total text>,
    "avgExchangeLength": <lines per conversation>,
    "tagVariety": <0-100>,
    "saidUsage": <percentage of tags that are 'said'>
  },
  "qualityMetrics": {
    "naturalness": <0-100>,
    "characterDistinction": <0-100>,
    "subtext": <0-100>,
    "purposefulness": <0-100>,
    "tensionInDialogue": <0-100>
  },
  "dialogueTags": {
    "distribution": {"said": <count>, "asked": <count>, "other": <count>},
    "overusedTags": ["<tag used too often>"],
    "creativeTagsGood": ["<effective creative tags>"],
    "creativeTagsBad": ["<distracting creative tags>"]
  },
  "issues": [
    {
      "type": "error|warning|info",
      "category": "talking-heads|info-dump|on-the-nose|tag-abuse|no-subtext",
      "example": "<problematic dialogue>",
      "message": "<what's wrong>",
      "suggestion": "<how to fix>"
    }
  ],
  "strongExamples": [
    {"dialogue": "<effective exchange>", "why": "<what makes it work>"}
  ],
  "suggestions": ["<improvement 1>", "<improvement 2>"]
}`,

  // 13. SHOW/TELL RATIO
  'show-tell-ratio': (content, scope) => `You are an expert at analyzing showing vs telling in fiction. Evaluate the balance and identify telling passages that could be shown.

Analyze:
1. Showing passages (scene, action, sensory detail)
2. Telling passages (summary, exposition, direct statement)
3. Appropriate use of each
4. Missed opportunities to show
5. Effective summary (telling that works)
6. Emotional telling vs showing

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 showing effectiveness>,
  "summary": "<show/tell balance assessment>",
  "ratio": {
    "showingPercentage": <percentage>,
    "tellingPercentage": <percentage>,
    "recommendation": "<ideal ratio for this type of scene>"
  },
  "tellingInstances": [
    {
      "original": "<telling passage>",
      "type": "emotion|trait|backstory|description|summary",
      "severity": "needs-showing|consider-showing|acceptable",
      "showingVersion": "<how to rewrite as showing>",
      "impact": "<why showing would be better>"
    }
  ],
  "effectiveTelling": [
    {"passage": "<telling that works>", "reason": "<why it's appropriate here>"}
  ],
  "excellentShowing": [
    {"passage": "<great showing example>", "technique": "<what makes it effective>"}
  ],
  "issues": [
    {
      "type": "warning|error",
      "message": "<show/tell problem>",
      "suggestion": "<fix>"
    }
  ],
  "emotionalTelling": ["<emotions stated directly instead of shown>"],
  "suggestions": ["<how to improve show/tell balance>"]
}`,

  // 14. CLICHE FINDER
  'cliche-finder': (content, scope) => `You are an expert at identifying cliches in fiction. Find overused phrases, tired metaphors, and predictable elements in this ${scope}.

Find:
1. Phrase cliches ("crystal clear," "deafening silence")
2. Simile/metaphor cliches ("eyes like pools")
3. Description cliches ("chiseled jaw," "raven hair")
4. Action cliches (holding breath, heart pounding)
5. Plot/situation cliches (for this section)
6. Character type cliches
7. Opening/closing cliches

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 originality score>,
  "summary": "<cliche assessment>",
  "clicheCount": <total found>,
  "clicheDensity": "<per 1000 words>",
  "phraseCliches": [
    {
      "cliche": "<the cliche>",
      "context": "<sentence containing it>",
      "severity": "delete|revise|mild",
      "alternatives": ["<fresh alternative 1>", "<fresh alternative 2>"]
    }
  ],
  "descriptionCliches": [
    {"cliche": "<tired description>", "fresh": "<original alternative>"}
  ],
  "actionCliches": [
    {"cliche": "<heart hammered>", "context": "<where used>", "alternative": "<fresh version>"}
  ],
  "metaphorCliches": [
    {"cliche": "<dead metaphor>", "original": "<fresh metaphor idea>"}
  ],
  "potentialCliches": [
    {"phrase": "<might be cliche>", "verdict": "cliche|borderline|acceptable", "reason": "<why>"}
  ],
  "issues": [
    {
      "type": "warning|error",
      "message": "<cliche problem>",
      "suggestion": "<fix>"
    }
  ],
  "freshLanguage": ["<examples of original phrasing in the text>"],
  "suggestions": ["<how to be more original>"]
}`,

  // 15. CONTINUITY CHECK
  'continuity-check': (content, scope, options) => `You are an expert continuity editor. Check this ${scope} for internal consistency and track details that need to remain consistent.

${options?.storyBible ? 'Cross-reference with the provided Story Bible.' : 'Create a continuity tracking list from this text.'}

Track and verify:
1. Character physical descriptions
2. Character names and nicknames
3. Location descriptions
4. Timeline/time of day
5. Object locations and states
6. Weather/season
7. Character knowledge states
8. Injuries/conditions and their progression
9. Numbers and quantities

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 continuity score>,
  "summary": "<continuity assessment>",
  "continuityTracker": {
    "characters": [
      {
        "name": "<character>",
        "physicalDetails": ["<detail mentioned>"],
        "location": "<where they are>",
        "state": "<physical/emotional state>",
        "knowledge": ["<what they know>"]
      }
    ],
    "settings": [
      {"location": "<place>", "details": ["<descriptive details>"], "timeOfDay": "<when>"}
    ],
    "objects": [
      {"item": "<object>", "location": "<where>", "state": "<condition>"}
    ],
    "timeline": [
      {"event": "<what happened>", "when": "<time reference>"}
    ]
  },
  "inconsistencies": [
    {
      "type": "character|setting|object|timeline|knowledge",
      "issue": "<the inconsistency>",
      "references": ["<conflicting statement 1>", "<conflicting statement 2>"],
      "suggestion": "<how to resolve>"
    }
  ],
  "potentialIssues": [
    {"concern": "<might conflict with earlier/later text>", "detail": "<what to check>"}
  ],
  "suggestions": ["<continuity improvement>"]
}`
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AnalyzeRequestSchema.parse(body);
    
    const { type, content, scope, options } = validated;

    // Get the analysis prompt
    const promptGenerator = ANALYSIS_PROMPTS[type];
    if (!promptGenerator) {
      return NextResponse.json(
        { error: `Unknown analysis type: ${type}` },
        { status: 400 }
      );
    }

    const prompt = promptGenerator(content, scope, options);

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract the response text
    const textContent = response.content.find(block => block.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    // Try to parse as JSON
    let analysisResult;
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // If parsing fails, return raw text analysis
      analysisResult = {
        score: 0,
        summary: responseText,
        issues: [],
        suggestions: [],
        raw: responseText
      };
    }

    // Calculate tokens used
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
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Analysis failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
