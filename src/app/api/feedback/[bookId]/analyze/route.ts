// API Route: /api/feedback/[bookId]/analyze
// Runs AI analysis on a manuscript

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface AnalyzeRequest {
  scope: 'FULL_BOOK' | 'CHAPTER' | 'SELECTION';
  chapterId?: string;
  selectionStart?: number;
  selectionEnd?: number;
  focusAreas?: string[];
  compareToGenre?: boolean;
  findSimilarWorks?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { bookId } = params;
    const body: AnalyzeRequest = await request.json();
    
    // Fetch the book with chapters
    const book = await prisma.book.findFirst({
      where: { id: bookId, userId },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            content: true,
            order: true,
          },
        },
      },
    });
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    
    // Get content to analyze
    let content = '';
    let wordCount = 0;
    
    if (body.scope === 'CHAPTER' && body.chapterId) {
      const chapter = book.chapters.find(c => c.id === body.chapterId);
      if (!chapter) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }
      content = chapter.content;
    } else {
      // Full book
      content = book.chapters.map(c => `## ${c.title}\n\n${c.content}`).join('\n\n---\n\n');
    }
    
    wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    
    if (wordCount < 100) {
      return NextResponse.json({ error: 'Not enough content to analyze' }, { status: 400 });
    }
    
    // Truncate if too long
    const maxChars = 100000;
    if (content.length > maxChars) {
      const chunkSize = Math.floor(maxChars / 3);
      const beginning = content.slice(0, chunkSize);
      const middle = content.slice(
        Math.floor(content.length / 2) - chunkSize / 2,
        Math.floor(content.length / 2) + chunkSize / 2
      );
      const end = content.slice(-chunkSize);
      content = `[BEGINNING - First ${Math.round(chunkSize/1000)}k chars]\n${beginning}\n\n[MIDDLE SAMPLE]\n${middle}\n\n[ENDING - Last ${Math.round(chunkSize/1000)}k chars]\n${end}`;
    }
    
    // Build analysis prompt
    const prompt = buildAnalysisPrompt(content, book.genre, body.focusAreas);
    
    // Run analysis with Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });
    
    const responseText = response.content[0];
    if (responseText.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response' }, { status: 500 });
    }
    
    // Parse the JSON response
    let analysisData: any;
    try {
      const jsonMatch = responseText.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (e) {
      console.error('Failed to parse analysis:', e);
      return NextResponse.json({ error: 'Failed to parse analysis' }, { status: 500 });
    }
    
    // Save to database
    const analysis = await prisma.manuscriptAnalysis.create({
      data: {
        userId,
        bookId,
        scope: body.scope,
        chapterId: body.chapterId,
        overallScore: analysisData.overallScore || 70,
        scores: analysisData.scores || {},
        strengths: analysisData.strengths || [],
        weaknesses: analysisData.weaknesses || [],
        opportunities: analysisData.opportunities || [],
        issues: (analysisData.issues || []).map((issue: any, index: number) => ({
          id: `issue-${index}`,
          ...issue,
        })),
        genreFit: analysisData.genreFit,
        similarWorks: analysisData.similarWorks,
        executiveSummary: analysisData.executiveSummary || '',
        priorityActions: analysisData.priorityActions || [],
        wordCountAnalyzed: wordCount,
        analysisVersion: '1.0.0',
      },
    });
    
    // Save to history for progress tracking
    await prisma.critiqueHistory.create({
      data: {
        bookId,
        overallScore: analysisData.overallScore || 70,
        categoryScores: analysisData.scores || {},
        wordCount,
      },
    });
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(content: string, genre: string, focusAreas?: string[]): string {
  const focusNote = focusAreas?.length 
    ? `\nPay special attention to these areas: ${focusAreas.join(', ')}`
    : '';

  return `You are an expert manuscript editor and literary critic. Analyze the following ${genre || 'fiction'} manuscript and provide detailed, actionable feedback.
${focusNote}

<manuscript>
${content}
</manuscript>

Analyze the manuscript across these categories:
- pacing: Flow and rhythm of the story
- dialogue: Character speech and conversations
- prose_quality: Writing style and sentence construction
- character_development: Character depth and growth
- plot_structure: Story architecture and progression
- world_building: Setting and world details
- tension: Conflict and suspense
- emotional_impact: Reader emotional engagement
- voice_consistency: Narrative voice stability
- show_dont_tell: Descriptive vs expository balance

Provide your analysis as a JSON object with this EXACT structure:
{
  "overallScore": <0-100>,
  "scores": {
    "pacing": <0-100>,
    "dialogue": <0-100>,
    "prose_quality": <0-100>,
    "character_development": <0-100>,
    "plot_structure": <0-100>,
    "world_building": <0-100>,
    "tension": <0-100>,
    "emotional_impact": <0-100>,
    "voice_consistency": <0-100>,
    "show_dont_tell": <0-100>
  },
  "strengths": [
    {
      "category": "<category_key>",
      "title": "<brief title>",
      "description": "<detailed description of what works well>",
      "examples": [{"text": "<direct quote from manuscript>", "location": "<where in the text>"}]
    }
  ],
  "weaknesses": [
    {
      "category": "<category_key>",
      "title": "<brief title>",
      "description": "<detailed description of the issue>",
      "examples": [{"text": "<quote showing the problem>", "location": "<where>"}],
      "suggestions": ["<specific improvement 1>", "<specific improvement 2>"]
    }
  ],
  "opportunities": [
    {
      "category": "<category_key>",
      "title": "<what could be enhanced>",
      "description": "<how it could be better and why it would help>"
    }
  ],
  "issues": [
    {
      "type": "<pacing_issue|dialogue_problem|telling_not_showing|weak_verb|passive_voice|repetition|cliche|info_dump|head_hopping|tense_inconsistency|character_inconsistency|plot_hole|unclear_motivation|weak_opening|weak_ending|overwriting|underwriting>",
      "severity": "<suggestion|minor|moderate|significant|critical>",
      "category": "<category_key>",
      "title": "<brief descriptive title>",
      "description": "<what's wrong and why it matters>",
      "excerpt": "<the problematic text from the manuscript>",
      "suggestion": "<specific fix or rewrite suggestion>"
    }
  ],
  "executiveSummary": "<2-3 paragraphs: Overall assessment, main strengths, and top 3 priorities for revision>",
  "priorityActions": [
    {
      "priority": <1-5, where 1 is highest priority>,
      "category": "<category_key>",
      "action": "<specific, actionable task>",
      "impact": "<low|medium|high>",
      "effort": "<low|medium|high>",
      "affectedAreas": ["<what parts of manuscript>"]
    }
  ],
  "genreFit": {
    "genre": "${genre || 'fiction'}",
    "fitScore": <0-100>,
    "expectations": [
      {"element": "<genre element>", "expected": "<what readers expect>", "found": "<what's in the manuscript>", "met": <true|false>}
    ],
    "gaps": ["<missing genre elements>"],
    "recommendations": ["<how to better satisfy genre expectations>"]
  }
}

Be specific and constructive. Quote directly from the text. Focus on the most impactful feedback. Respond with ONLY the JSON object, no other text.`;
}

// GET - Fetch latest analysis for a book
export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { bookId } = params;
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    
    const where: any = { bookId, userId };
    if (chapterId) {
      where.chapterId = chapterId;
    }
    
    const analysis = await prisma.manuscriptAnalysis.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    if (!analysis) {
      return NextResponse.json({ analysis: null });
    }
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}
