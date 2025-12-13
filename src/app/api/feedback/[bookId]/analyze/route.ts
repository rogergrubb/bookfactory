// API Route: /api/feedback/[bookId]/analyze
// Runs AI analysis on a manuscript

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface AnalyzeRequest {
  scope: 'FULL_BOOK' | 'CHAPTER' | 'SELECTION';
  chapterId?: string;
  focusAreas?: string[];
  compareToGenre?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { bookId } = await params;
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
    
    if (body.scope === 'CHAPTER' && body.chapterId) {
      const chapter = book.chapters.find(c => c.id === body.chapterId);
      if (!chapter) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }
      content = chapter.content;
    } else {
      content = book.chapters.map(c => `## ${c.title}\n\n${c.content}`).join('\n\n---\n\n');
    }
    
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    
    if (wordCount < 100) {
      return NextResponse.json({ error: 'Not enough content to analyze' }, { status: 400 });
    }
    
    // Truncate if too long
    if (content.length > 80000) {
      const chunk = 25000;
      content = `[BEGINNING]\n${content.slice(0, chunk)}\n\n[MIDDLE]\n${content.slice(content.length/2 - chunk/2, content.length/2 + chunk/2)}\n\n[END]\n${content.slice(-chunk)}`;
    }
    
    // Run analysis with Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      messages: [{
        role: 'user',
        content: `Analyze this ${book.genre || 'fiction'} manuscript and provide feedback.

<manuscript>
${content}
</manuscript>

Respond with JSON only:
{
  "overallScore": <0-100>,
  "scores": {
    "pacing": <0-100>,
    "dialogue": <0-100>,
    "prose_quality": <0-100>,
    "character_development": <0-100>,
    "plot_structure": <0-100>,
    "tension": <0-100>,
    "voice_consistency": <0-100>,
    "show_dont_tell": <0-100>
  },
  "strengths": [{"category": "<cat>", "title": "<title>", "description": "<desc>"}],
  "weaknesses": [{"category": "<cat>", "title": "<title>", "description": "<desc>", "suggestions": ["<fix>"]}],
  "issues": [{"type": "<type>", "severity": "<minor|moderate|significant|critical>", "title": "<title>", "description": "<desc>", "suggestion": "<fix>"}],
  "executiveSummary": "<2-3 paragraphs>",
  "priorityActions": [{"priority": <1-5>, "action": "<task>", "impact": "<low|medium|high>", "effort": "<low|medium|high>"}]
}`
      }],
    });
    
    const responseText = response.content[0];
    if (responseText.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response' }, { status: 500 });
    }
    
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
    
    return NextResponse.json({
      analysis: {
        id: `analysis-${Date.now()}`,
        bookId,
        scope: body.scope,
        chapterId: body.chapterId,
        overallScore: analysisData.overallScore || 70,
        scores: analysisData.scores || {},
        strengths: analysisData.strengths || [],
        weaknesses: analysisData.weaknesses || [],
        opportunities: [],
        issues: (analysisData.issues || []).map((issue: any, i: number) => ({
          id: `issue-${i}`,
          ...issue,
        })),
        executiveSummary: analysisData.executiveSummary || '',
        priorityActions: analysisData.priorityActions || [],
        wordCountAnalyzed: wordCount,
        analysisVersion: '1.0.0',
        createdAt: new Date(),
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { bookId } = await params;
    
    // Return null for now - analysis storage pending
    return NextResponse.json({ analysis: null });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}
