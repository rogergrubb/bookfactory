import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// GET /api/books/[bookId]/tool-runs - List tool runs for a book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Verify user owns this book
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId, userId: user.id },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Fetch tool runs
    const toolRuns = await prisma.toolRun.findMany({
      where: { 
        bookId,
        userId: user.id,
        status: 'completed',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        toolId: true,
        input: true,
        output: true,
        status: true,
        createdAt: true,
      },
    });

    // Map tool IDs to names
    const toolNames: Record<string, string> = {
      'continue': 'Continue Writing',
      'firstdraft': 'First Draft',
      'dialogue': 'Write Dialogue',
      'description': 'Add Description',
      'action': 'Action Scene',
      'thoughts': 'Inner Thoughts',
      'expand': 'Expand',
      'condense': 'Condense',
      'rewrite': 'Rewrite',
      'polish': 'Polish',
      'strengthen-verbs': 'Strengthen Verbs',
      'vary-sentences': 'Vary Sentences',
      'fix-dialogue-tags': 'Fix Dialogue Tags',
      'show-dont-tell': 'Show Don\'t Tell',
      'pacing': 'Pacing Analysis',
      'voice-check': 'Voice Check',
      'tension-map': 'Tension Map',
      'character-voice': 'Character Voice',
      'repetition': 'Repetition Finder',
      'adverb-hunter': 'Adverb Hunter',
      'passive-voice': 'Passive Voice',
      'readability': 'Readability',
      'emotional-arc': 'Emotional Arc',
      'chapter-summary': 'Chapter Summary',
      'plot-ideas': 'Plot Ideas',
      'character-moments': 'Character Moments',
      'dialogue-options': 'Dialogue Options',
      'scene-transitions': 'Scene Transitions',
      'conflict-escalation': 'Conflict Escalation',
      'twist-generator': 'Twist Generator',
      'what-if': 'What If...',
      'stuck-help': 'I\'m Stuck',
    };

    const formattedRuns = toolRuns.map(run => ({
      id: run.id,
      toolId: run.toolId,
      toolName: toolNames[run.toolId] || run.toolId,
      input: run.input?.slice(0, 200) || '',
      output: run.output || '',
      createdAt: run.createdAt.toISOString(),
      status: run.status,
    }));

    return NextResponse.json({ toolRuns: formattedRuns });
  } catch (error) {
    console.error('Tool runs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool runs' },
      { status: 500 }
    );
  }
}
