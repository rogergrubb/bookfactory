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

// =============================================================================
// UNIVERSAL CORRECTION OUTPUT SCHEMA
// All analysis tools must include "issues" array with this structure
// =============================================================================
const CORRECTION_SCHEMA = `
CRITICAL OUTPUT REQUIREMENT - ISSUES ARRAY:
Your response MUST include an "issues" array. Each issue MUST have these exact fields:
{
  "issues": [
    {
      "type": "<issue-type like 'repetition', 'passive-voice', 'cliche', 'pacing-drag'>",
      "severity": "<critical|warning|suggestion|info>",
      "title": "<short 5-10 word description>",
      "description": "<why this is a problem and how to fix it>",
      "original": "<EXACT text from the manuscript - copy precisely>",
      "suggestion": "<your improved version - ready to replace>",
      "confidence": <0-100 how certain you are this needs fixing>
    }
  ]
}

SEVERITY DEFINITIONS:
- critical: Breaks reader immersion, confuses meaning, or violates genre conventions
- warning: Weakens prose, reduces impact, or accumulates as a pattern problem
- suggestion: Could be better but not urgent, style choice considerations
- info: FYI items, patterns to be aware of, not necessarily wrong

IMPORTANT:
- "original" must be EXACT text copied from input - this will be used for find/replace
- "suggestion" must be a complete replacement, not just a note
- Include at least the top 10 most impactful issues found
- Order by severity then by impact
`;

// =============================================================================
// ANALYSIS PROMPTS - All Updated with Correction Format
// =============================================================================

const ANALYSIS_PROMPTS: Record<string, (content: string, scope: string, options?: any) => string> = {

  // ===========================================================================
  // 1. PACING ANALYSIS
  // ===========================================================================
  'pacing': (content, scope, options) => `You are a master story editor specializing in narrative pacing.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}
- Scene Goal: ${options?.sceneGoal || 'Not specified'}

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

PACING-SPECIFIC ISSUE TYPES:
- pacing-drag: Sections that slow momentum unnecessarily
- pacing-rush: Moments that need more beats/development
- run-on-sentence: Sentences over 35 words hurting rhythm
- monotonous-rhythm: Same sentence length repeated
- weak-hook: Opening or closing lacks pull

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence pacing assessment>",
  "pacingProfile": {
    "rhythm": "breakneck|fast|moderate|leisurely|slow",
    "genreAlignment": <0-100>,
    "pageTurner": true|false
  },
  "issues": [/* REQUIRED - see schema above */],
  "insights": ["<pattern observation 1>", "<pattern observation 2>"],
  "nextToolSuggestion": "tension-map"
}`,

  // ===========================================================================
  // 2. VOICE CONSISTENCY
  // ===========================================================================
  'voice-consistency': (content, scope, options) => `You are an expert developmental editor specializing in narrative voice.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}
${options?.authorVoiceProfile ? `- Author Voice Profile: ${JSON.stringify(options.authorVoiceProfile)}` : ''}

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

VOICE-SPECIFIC ISSUE TYPES:
- pov-slip: Head-hopping or inconsistent psychic distance
- tense-shift: Unintended past/present mixing
- tone-break: Jarring tone inconsistency
- filter-word: "She saw", "He felt" weakening deep POV
- author-intrusion: Author's voice breaking character voice
- vocabulary-mismatch: Word too sophisticated/simple for POV character

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence voice assessment>",
  "voiceProfile": {
    "pov": "first|third-limited|third-omniscient|second",
    "tense": "past|present",
    "tone": "<description>",
    "consistency": <0-100>
  },
  "issues": [/* REQUIRED - see schema above */],
  "insights": ["<voice pattern 1>", "<voice pattern 2>"],
  "nextToolSuggestion": "character-voice-analysis"
}`,

  // ===========================================================================
  // 3. TENSION MAP
  // ===========================================================================
  'tension-map': (content, scope, options) => `You are a thriller/suspense editor who analyzes narrative tension.

CONTEXT:
- Scope: ${scope}
- Genre: ${options?.genre || 'General fiction'}
- Scene Goal: ${options?.sceneGoal || 'Not specified'}

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

TENSION-SPECIFIC ISSUE TYPES:
- tension-killer: Moment that deflates built tension prematurely
- stakes-unclear: Reader doesn't know what's at risk
- conflict-missing: Scene lacks opposing forces
- tension-plateau: Extended flat section without escalation
- anticlimactic: Build-up without payoff
- over-explained: Spelling out tension instead of showing it

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence tension assessment>",
  "tensionCurve": [
    {"position": <0-100>, "level": <1-10>, "type": "conflict|mystery|emotional|physical|social"}
  ],
  "peakMoment": "<most tense moment>",
  "issues": [/* REQUIRED - see schema above */],
  "insights": ["<tension pattern 1>", "<tension pattern 2>"],
  "nextToolSuggestion": "emotional-arc"
}`,

  // ===========================================================================
  // 4. CHARACTER VOICE ANALYSIS
  // ===========================================================================
  'character-voice-analysis': (content, scope, options) => `You are a dialogue coach analyzing character voice distinction.

CONTEXT:
- Scope: ${scope}
- Characters: ${options?.characterNames?.join(', ') || 'Not specified'}

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

CHARACTER-VOICE ISSUE TYPES:
- same-voice: Characters sound identical, could swap dialogue
- on-the-nose: Dialogue too direct, lacks subtext
- generic-speech: Dialogue anyone could say
- inconsistent-vocabulary: Character uses words outside their voice
- missing-verbal-tic: Character lacks distinctive speech patterns
- info-dump-dialogue: Unnatural exposition in speech

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence character voice assessment>",
  "characters": [
    {"name": "<name>", "distinctiveness": <0-100>, "voiceMarkers": ["<pattern1>", "<pattern2>"]}
  ],
  "issues": [/* REQUIRED - see schema above */],
  "insights": ["<character voice pattern 1>", "<character voice pattern 2>"],
  "nextToolSuggestion": "dialogue-analysis"
}`,

  // ===========================================================================
  // 5. REPETITION FINDER
  // ===========================================================================
  'repetition-finder': (content, scope, options) => `You are an editorial proofreader with eagle eyes for repetition.

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

REPETITION ISSUE TYPES:
- word-echo: Same unusual word used too close together
- phrase-repetition: Same phrase repeated unnecessarily
- sentence-starter: Consecutive sentences starting same way
- gesture-crutch: Overused physical actions (nodded, sighed, shrugged)
- pet-word: Author's unconscious favorite word appearing too often
- rhythm-repetition: Same sentence structure repeated

SEVERITY GUIDANCE:
- critical: Same unusual word in adjacent sentences
- warning: Pattern repeated 3+ times in passage
- suggestion: Noticeable but not distracting

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence repetition assessment>",
  "mostRepeated": [{"word": "<word>", "count": <n>, "tooMany": true|false}],
  "issues": [/* REQUIRED - see schema above */],
  "insights": ["<repetition pattern 1>", "<repetition pattern 2>"],
  "nextToolSuggestion": "adverb-hunter"
}`,

  // ===========================================================================
  // 6. ADVERB HUNTER
  // ===========================================================================
  'adverb-hunter': (content, scope, options) => `You are Stephen King's editor hunting unnecessary adverbs.

"The road to hell is paved with adverbs." - Stephen King

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

ADVERB ISSUE TYPES:
- dialogue-tag-adverb: "said angrily" - show emotion instead
- redundant-adverb: "shouted loudly" - adverb repeats verb meaning
- weak-verb-adverb: "walked quickly" - use stronger verb "strode"
- telling-adverb: "obviously", "clearly" - trust the reader
- lazy-intensifier: "very", "really", "extremely" - find precise word

NOTE: Not all adverbs are bad. Flag ONLY unnecessary ones.
Provide the STRONG VERB alternative in your suggestion.

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence adverb assessment>",
  "adverbCount": <total found>,
  "problematicCount": <ones that should change>,
  "issues": [/* REQUIRED - include strong verb alternatives */],
  "acceptableAdverbs": ["<adverbs that work in context>"],
  "insights": ["<adverb pattern 1>"],
  "nextToolSuggestion": "passive-voice-finder"
}`,

  // ===========================================================================
  // 7. PASSIVE VOICE FINDER
  // ===========================================================================
  'passive-voice-finder': (content, scope, options) => `You are an editor who activates passive prose.

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

PASSIVE VOICE ISSUE TYPES:
- standard-passive: "was done by" - convert to active
- hidden-passive: "got destroyed" - stealth passive construction  
- nominalization: "made a decision" - convert to "decided"
- there-was: "There was/were" constructions that can be eliminated
- weak-it: "It was clear that" - remove and strengthen

NOTE: Some passive is intentional for:
- Unknown actor: "The body was found..."
- Emphasis shift: Putting important info at sentence end
- Genre convention: Academic, legal, procedural writing

Flag ONLY unnecessary passive. Include active rewrite.

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence passive voice assessment>",
  "passiveCount": <total found>,
  "unnecessaryCount": <ones that should change>,
  "issues": [/* REQUIRED - include active voice rewrites */],
  "justifiedPassive": ["<passive constructions that work>"],
  "insights": ["<passive pattern 1>"],
  "nextToolSuggestion": "show-tell-ratio"
}`,

  // ===========================================================================
  // 8. READABILITY SCORE
  // ===========================================================================
  'readability': (content, scope, options) => `You are a readability expert analyzing prose accessibility.

CONTEXT:
- Target Audience: ${options?.targetAudience || 'General adult fiction'}
- Genre: ${options?.genre || 'General fiction'}

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

READABILITY ISSUE TYPES:
- sentence-too-long: Over 35 words, hard to parse
- paragraph-too-dense: Wall of text, needs breaking
- complex-word: Unnecessarily sophisticated when simple works
- jargon-unexplained: Technical term without context
- readability-mismatch: Writing level wrong for target audience

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence readability assessment>",
  "metrics": {
    "avgSentenceLength": <words>,
    "avgWordLength": <syllables>,
    "gradeLevel": <Flesch-Kincaid grade>,
    "fleschScore": <0-100 ease score>
  },
  "audienceFit": "perfect|good|slightly-off|mismatch",
  "issues": [/* REQUIRED - see schema above */],
  "insights": ["<readability pattern 1>"],
  "nextToolSuggestion": "pacing"
}`,

  // ===========================================================================
  // 9. EMOTIONAL ARC
  // ===========================================================================
  'emotional-arc': (content, scope, options) => `You are an emotional intelligence expert analyzing reader/character feelings.

CONTEXT:
- Scope: ${scope}
- Scene Goal: ${options?.sceneGoal || 'Not specified'}

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

EMOTIONAL ARC ISSUE TYPES:
- emotion-told: "She was angry" - show through action/dialogue
- flat-emotion: Extended passage with no emotional variation
- unearned-emotion: Big feeling without adequate setup
- missing-interiority: External action without internal reaction
- emotional-whiplash: Too-rapid mood swings without transition
- cliched-emotion: "heart pounded", "stomach dropped" overused

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence emotional arc assessment>",
  "emotionalJourney": [
    {"position": <0-100>, "emotion": "<feeling>", "intensity": <-1.0 to 1.0>}
  ],
  "dominantEmotion": "<primary feeling>",
  "issues": [/* REQUIRED - include showing alternatives */],
  "insights": ["<emotional pattern 1>"],
  "nextToolSuggestion": "show-tell-ratio"
}`,

  // ===========================================================================
  // 10. CHAPTER SUMMARY
  // ===========================================================================
  'chapter-summary': (content, scope, options) => `You are a story analyst creating chapter breakdowns.

CONTEXT:
- Chapter Number: ${options?.chapterNumber || 'Unknown'}

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

CHAPTER ISSUE TYPES:
- missing-goal: Chapter lacks clear character objective
- no-stakes: Nothing at risk in this chapter
- static-character: Character unchanged from start to end
- dangling-thread: Setup without payoff or continuation
- redundant-scene: Chapter doesn't advance plot or character

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence chapter assessment>",
  "oneLiner": "<10-word chapter summary>",
  "plotMovement": {
    "majorEvents": ["<event 1>", "<event 2>"],
    "plotAdvancement": <0-100>
  },
  "characterArcs": [
    {"name": "<character>", "startState": "<beginning>", "endState": "<ending>", "change": "<what shifted>"}
  ],
  "issues": [/* REQUIRED - see schema above */],
  "chapterFunction": "<setup|rising-action|climax|falling-action|resolution>",
  "nextToolSuggestion": "plot-holes"
}`,

  // ===========================================================================
  // 11. PLOT HOLE FINDER
  // ===========================================================================
  'plot-holes': (content, scope, options) => `You are a continuity editor hunting logic problems.

CONTEXT:
- Scope: ${scope}
${options?.storyBible ? `- Story Bible: ${JSON.stringify(options.storyBible)}` : ''}
${options?.bookContext ? `- Book Context: ${options.bookContext}` : ''}

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

PLOT HOLE ISSUE TYPES:
- logic-error: Character knows something they shouldn't
- timeline-conflict: Events happen in impossible order
- character-inconsistency: Person acts against established nature
- dropped-thread: Setup never paid off
- world-rule-violation: Breaks established story rules
- motivation-missing: Character acts without clear reason
- convenient-coincidence: Too lucky/unlucky without setup

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence plot consistency assessment>",
  "definiteProblems": <count of confirmed issues>,
  "potentialIssues": <count of possible issues>,
  "issues": [/* REQUIRED - include suggested fixes */],
  "insights": ["<continuity observation 1>"],
  "nextToolSuggestion": "continuity-check"
}`,

  // ===========================================================================
  // 12. DIALOGUE ANALYSIS
  // ===========================================================================
  'dialogue-analysis': (content, scope, options) => `You are Aaron Sorkin analyzing dialogue craft.

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

DIALOGUE ISSUE TYPES:
- on-the-nose: Character says exactly what they mean
- info-dump: Unnatural exposition in speech
- talking-heads: Dialogue without action beats
- tag-overload: Too many "said angrily", "exclaimed"
- same-length: All dialogue same rhythm/length
- unrealistic: No one talks like this
- no-subtext: Surface meaning = full meaning

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence dialogue assessment>",
  "dialogueRatio": "<percentage of text that is dialogue>",
  "naturalness": <0-100>,
  "subtextLevel": <0-100>,
  "issues": [/* REQUIRED - include improved dialogue */],
  "bestLine": "<most effective dialogue in passage>",
  "insights": ["<dialogue pattern 1>"],
  "nextToolSuggestion": "character-voice-analysis"
}`,

  // ===========================================================================
  // 13. SHOW/TELL RATIO
  // ===========================================================================
  'show-tell-ratio': (content, scope, options) => `You are an expert on "show don't tell" in fiction.

CONTEXT:
- Genre: ${options?.genre || 'General fiction'}

NOTE: Some telling is good. Telling works for:
- Transitions between scenes
- Unimportant information
- Pacing control
- Summary of elapsed time

Flag ONLY telling that should be showing.

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

SHOW-TELL ISSUE TYPES:
- emotion-told: "She was sad" - show through physical/action
- trait-told: "He was smart" - demonstrate through behavior
- backstory-dump: Exposition that should be woven in
- reaction-told: "He didn't like it" - show response

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence show/tell assessment>",
  "ratio": {
    "showingPercent": <0-100>,
    "tellingPercent": <0-100>,
    "genreIdeal": "<ideal ratio for genre>"
  },
  "issues": [/* REQUIRED - include showing alternatives */],
  "effectiveTelling": ["<telling that works>"],
  "insights": ["<show/tell pattern 1>"],
  "nextToolSuggestion": "emotional-arc"
}`,

  // ===========================================================================
  // 14. CLICHÉ FINDER
  // ===========================================================================
  'cliche-finder': (content, scope, options) => `You are a prose stylist hunting tired language.

CONTEXT:
- Genre: ${options?.genre || 'General fiction'}

NOTE: Genre conventions aren't always clichés. Romance readers expect certain tropes.
Flag ONLY phrases that feel lazy or overused.

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

CLICHE ISSUE TYPES:
- phrase-cliche: "it was a dark and stormy night"
- description-cliche: "chiseled jaw", "raven hair", "piercing eyes"
- action-cliche: "heart pounded", "blood ran cold"
- simile-cliche: "quiet as a mouse", "strong as an ox"
- emotion-cliche: "tears streamed down her face"
- opening-cliche: "woke up to the sound of"

Provide FRESH, ORIGINAL alternatives in suggestions.

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence cliché assessment>",
  "clicheCount": <total found>,
  "severityCounts": {"critical": <n>, "warning": <n>, "suggestion": <n>},
  "issues": [/* REQUIRED - include fresh alternatives */],
  "freshPhrases": ["<original language that works well>"],
  "insights": ["<cliché pattern 1>"],
  "nextToolSuggestion": "adverb-hunter"
}`,

  // ===========================================================================
  // 15. CONTINUITY CHECK
  // ===========================================================================
  'continuity-check': (content, scope, options) => `You are a continuity supervisor checking story consistency.

CONTEXT:
- Scope: ${scope}
${options?.storyBible ? `- Story Bible: ${JSON.stringify(options.storyBible)}` : ''}
${options?.bookContext ? `- Book Context: ${options.bookContext}` : ''}

TEXT TO ANALYZE:
"""
${content}
"""

${CORRECTION_SCHEMA}

CONTINUITY ISSUE TYPES:
- timeline-error: "Monday morning" when it should be Tuesday
- setting-change: Room layout changes mid-scene
- character-detail: Eye color, hair, age inconsistent
- object-continuity: Item appears/disappears illogically
- knowledge-error: Character forgets what they learned
- name-inconsistency: Spelling of name varies

Respond in JSON:
{
  "score": <0-100>,
  "summary": "<2-3 sentence continuity assessment>",
  "trackingRecommendations": ["<thing to track>", "<thing to track>"],
  "issues": [/* REQUIRED - see schema above */],
  "characterDetails": [{"name": "<name>", "details": ["<detail 1>", "<detail 2>"]}],
  "timelineEvents": ["<event with time marker>"],
  "insights": ["<continuity observation>"],
  "nextToolSuggestion": "plot-holes"
}`
};

// =============================================================================
// API HANDLER
// =============================================================================

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
      // Fallback if JSON parsing fails
      analysisResult = { 
        score: 0, 
        summary: responseText, 
        issues: [], 
        insights: [],
        raw: responseText 
      };
    }

    // Ensure issues array exists and has required fields
    if (analysisResult.issues) {
      analysisResult.issues = analysisResult.issues.map((issue: any, index: number) => ({
        id: `${type}-${index}-${Date.now()}`,
        type: issue.type || type,
        severity: issue.severity || 'suggestion',
        title: issue.title || 'Issue found',
        description: issue.description || '',
        original: issue.original || issue.currentText || issue.location || '',
        suggestion: issue.suggestion || issue.suggestedFix || issue.fix || issue.rewrite || '',
        confidence: issue.confidence || 80,
      }));
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
