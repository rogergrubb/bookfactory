import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Request validation schema
const AnalyzeRequestSchema = z.object({
  type: z.enum(['pacing', 'character-voice', 'plot-holes', 'readability', 'word-frequency', 'emotional-arc']),
  content: z.string().min(1),
  options: z.object({
    bookContext: z.string().optional(),
    characterNames: z.array(z.string()).optional()
  }).optional()
});

// Analysis prompts
const ANALYSIS_PROMPTS: Record<string, (content: string, options?: any) => string> = {
  'pacing': (content) => `You are an expert editor analyzing pacing in fiction. Analyze this text for pacing issues and provide a structured assessment.

Evaluate:
1. Overall pacing rhythm (fast/slow sections)
2. Scene-by-scene tension curve
3. Balance of action, dialogue, and description
4. Paragraph-level pacing variety
5. Areas that drag or rush

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 overall pacing score>,
  "summary": "<brief overall assessment>",
  "issues": [
    {
      "type": "warning|error|info",
      "message": "<issue description>",
      "suggestion": "<how to fix>"
    }
  ],
  "suggestions": ["<general suggestion 1>", "<general suggestion 2>"],
  "metrics": {
    "fastSections": <percentage>,
    "mediumSections": <percentage>,
    "slowSections": <percentage>,
    "averageParagraphLength": <words>,
    "dialogueToNarrativeRatio": "<ratio>"
  },
  "highlights": [
    {
      "type": "slow|fast|good",
      "text": "<excerpt>",
      "note": "<explanation>"
    }
  ]
}`,

  'character-voice': (content, options) => `You are an expert editor analyzing character voice in fiction. Evaluate the dialogue and character-specific passages for voice consistency, authenticity, and distinctiveness.

${options?.characterNames ? `Characters to focus on: ${options.characterNames.join(', ')}` : ''}

Analyze:
1. Voice consistency for each character
2. Distinctiveness between characters
3. Authenticity of dialogue
4. Speech patterns and verbal tics
5. Voice-breaking moments

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 overall voice score>,
  "summary": "<brief overall assessment>",
  "characters": [
    {
      "name": "<character name or identifier>",
      "voiceScore": <0-100>,
      "traits": ["<trait 1>", "<trait 2>"],
      "issues": ["<issue 1>"]
    }
  ],
  "issues": [
    {
      "type": "warning|error|info",
      "message": "<issue description>",
      "suggestion": "<how to fix>",
      "location": "<quote or description of location>"
    }
  ],
  "suggestions": ["<general suggestion 1>", "<general suggestion 2>"]
}`,

  'plot-holes': (content, options) => `You are an expert editor analyzing narrative for plot holes and inconsistencies. Carefully examine this text for:

1. Logical inconsistencies
2. Timeline problems
3. Character behavior contradictions
4. Unresolved setups or forgotten threads
5. World-building contradictions
6. Motivation gaps

${options?.bookContext ? `Story context: ${options.bookContext}` : ''}

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 consistency score>,
  "summary": "<brief overall assessment>",
  "issues": [
    {
      "type": "error|warning|info",
      "category": "timeline|logic|character|worldbuilding|continuity",
      "message": "<detailed description of the issue>",
      "suggestion": "<how to fix>",
      "severity": "critical|major|minor"
    }
  ],
  "suggestions": ["<general suggestion 1>", "<general suggestion 2>"],
  "warnings": ["<potential issue that needs story context to verify>"]
}`,

  'readability': (content) => `You are an expert at readability analysis. Evaluate this text for readability metrics and accessibility.

Calculate and assess:
1. Flesch-Kincaid readability score
2. Grade level
3. Average sentence length
4. Average word length
5. Vocabulary complexity
6. Sentence structure variety

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 readability score>,
  "summary": "<brief overall assessment>",
  "metrics": {
    "fleschKincaid": <score>,
    "gradeLevel": <level>,
    "averageSentenceLength": <words>,
    "averageWordLength": <letters>,
    "vocabularyDiversity": <percentage>,
    "complexSentences": <percentage>,
    "passiveVoice": <percentage>
  },
  "issues": [
    {
      "type": "warning|info",
      "message": "<issue>",
      "suggestion": "<fix>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "suggestions": ["<improvement 1>", "<improvement 2>"]
}`,

  'word-frequency': (content) => `You are an expert editor analyzing word usage patterns. Identify overused words, repeated phrases, and patterns that might indicate areas for revision.

Analyze:
1. Most frequently used words (excluding common articles/prepositions)
2. Overused words that stand out
3. Repeated phrases or constructions
4. Weak words (very, just, really, etc.)
5. Filter words (seemed, appeared, felt, etc.)
6. Adverb overuse

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "wordCount": <total>,
  "uniqueWords": <count>,
  "summary": "<brief assessment>",
  "frequentWords": [
    {"word": "<word>", "count": <number>, "concern": true|false}
  ],
  "issues": [
    {
      "type": "warning|info",
      "message": "<word or phrase> appears <count> times",
      "suggestion": "<alternatives or fix>"
    }
  ],
  "patterns": [
    {
      "pattern": "<pattern description>",
      "examples": ["<example 1>", "<example 2>"],
      "suggestion": "<how to vary>"
    }
  ],
  "weakWords": {
    "very": <count>,
    "just": <count>,
    "really": <count>,
    "seemed": <count>,
    "felt": <count>,
    "suddenly": <count>
  }
}`,

  'emotional-arc': (content) => `You are an expert at emotional narrative analysis. Map the emotional journey through this text, identifying shifts in tone, mood, and emotional intensity.

Analyze:
1. Opening emotional state
2. Key emotional beats and transitions
3. Emotional climax points
4. Resolution emotional state
5. Pacing of emotional shifts
6. Balance of emotional range

Text to analyze:
"""
${content}
"""

Respond in this JSON format:
{
  "score": <0-100 emotional effectiveness score>,
  "summary": "<brief assessment of emotional arc>",
  "arc": [
    {
      "position": "opening|early|middle|late|climax|resolution",
      "emotion": "<primary emotion>",
      "intensity": <-1.0 to 1.0, negative=negative emotions>,
      "description": "<what's happening emotionally>"
    }
  ],
  "issues": [
    {
      "type": "warning|info",
      "message": "<issue with emotional flow>",
      "suggestion": "<how to improve>"
    }
  ],
  "strengths": ["<emotional strength 1>", "<emotional strength 2>"],
  "suggestions": ["<improvement 1>", "<improvement 2>"],
  "dominantEmotions": ["<emotion 1>", "<emotion 2>", "<emotion 3>"]
}`
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AnalyzeRequestSchema.parse(body);
    
    const { type, content, options } = validated;

    // Get the analysis prompt
    const promptGenerator = ANALYSIS_PROMPTS[type];
    if (!promptGenerator) {
      return NextResponse.json(
        { error: `Unknown analysis type: ${type}` },
        { status: 400 }
      );
    }

    const prompt = promptGenerator(content, options);

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
