import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// Tool name mapping
const TOOL_NAMES: Record<string, string> = {
  'continue': 'Continue Writing',
  'firstdraft': 'First Draft',
  'dialogue': 'Write Dialogue',
  'description': 'Add Description',
  'action': 'Action Scene',
  'thoughts': 'Inner Thoughts',
  'opening': 'Opening Hook',
  'ending': 'Chapter Ending',
  'transition': 'Write Transition',
  'flashback': 'Flashback/Memory',
  'monologue': 'Monologue/Speech',
  'letter': 'Letter/Document',
  'expand': 'Expand',
  'condense': 'Condense',
  'rewrite': 'Rewrite',
  'polish': 'Polish Prose',
  'strengthen-verbs': 'Strengthen Verbs',
  'vary-sentences': 'Vary Sentences',
  'fix-dialogue-tags': 'Fix Dialogue Tags',
  'show-dont-tell': 'Show Don\'t Tell',
  'add-conflict': 'Add Conflict',
  'add-subtext': 'Add Subtext',
  'adjust-pov': 'Adjust POV',
  'adjust-tense': 'Adjust Tense',
  'punch-up': 'Punch Up',
  'smooth-transitions': 'Smooth Transitions',
  'pacing': 'Pacing Analysis',
  'voice-check': 'Voice Consistency',
  'tension-map': 'Tension Map',
  'character-voice': 'Character Voice',
  'repetition': 'Repetition Finder',
  'adverb-hunter': 'Adverb Hunter',
  'passive-voice': 'Passive Voice',
  'readability': 'Readability Score',
  'emotional-arc': 'Emotional Arc',
  'chapter-summary': 'Chapter Summary',
  'plot-holes': 'Plot Hole Finder',
  'dialogue-analysis': 'Dialogue Analysis',
  'show-tell-ratio': 'Show/Tell Ratio',
  'cliche-finder': 'Cliché Finder',
  'plot-ideas': 'Plot Ideas',
  'character-moments': 'Character Moments',
  'dialogue-options': 'Dialogue Options',
  'scene-transitions': 'Scene Transitions',
  'conflict-escalation': 'Conflict Escalation',
  'twist-generator': 'Twist Generator',
  'what-if': 'What If...',
  'stuck-help': 'I\'m Stuck',
  'names-generator': 'Name Generator',
  'motivation-finder': 'Motivation Finder',
  'theme-explorer': 'Theme Explorer',
  'ending-ideas': 'Ending Ideas',
};

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    const bookId = searchParams.get('bookId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: Record<string, unknown> = {
      userId: user.id,
      status: 'completed',
      output: { not: null },
    };

    if (chapterId) {
      where.documentId = chapterId;
    } else if (bookId) {
      where.bookId = bookId;
    }

    const toolRuns = await prisma.toolRun.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        toolId: true,
        input: true,
        output: true,
        options: true,
        tokensUsed: true,
        createdAt: true,
        documentId: true,
        bookId: true,
      }
    });

    // Transform records
    const records = toolRuns.map(run => {
      const options = run.options as Record<string, unknown> | null;
      const subOptionId = options?.subOptionId as string | undefined;
      
      return {
        id: run.id,
        toolId: run.toolId,
        toolName: TOOL_NAMES[run.toolId] || run.toolId,
        subOptionId,
        subOptionName: subOptionId ? formatSubOptionName(subOptionId) : undefined,
        input: run.input,
        output: run.output || '',
        tokensUsed: run.tokensUsed,
        timestamp: run.createdAt,
        isFavorite: options?.isFavorite === true,
        chapterId: run.documentId,
      };
    });

    return NextResponse.json({ records });

  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

function formatSubOptionName(subOptionId: string): string {
  return subOptionId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
