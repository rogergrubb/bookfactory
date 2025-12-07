import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { generateContent } from '@/lib/ai';
import { prisma, logActivity, logAIUsage } from '@/lib/db';

const generateSchema = z.object({
  type: z.enum(['continue', 'improve', 'dialogue', 'description', 'brainstorm', 'outline']),
  content: z.string().min(1).max(50000),
  context: z.object({
    bookId: z.string().optional(),
    bookTitle: z.string().optional(),
    genre: z.string().optional(),
    characters: z.array(z.string()).optional(),
    chapterTitle: z.string().optional(),
    previousContent: z.string().optional(),
  }).optional(),
  style: z.enum(['formal', 'casual', 'literary', 'commercial']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

const typeLabels: Record<string, string> = {
  continue: 'Continue Writing',
  improve: 'Improve Text',
  dialogue: 'Generate Dialogue',
  description: 'Write Description',
  brainstorm: 'Brainstorm Ideas',
  outline: 'Create Outline',
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = generateSchema.parse(body);

    // Check user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Generate content
    const result = await generateContent({
      type: data.type,
      content: data.content,
      context: data.context,
      style: data.style,
      length: data.length,
    });

    const inputTokens = Math.ceil(data.content.length / 4);
    const outputTokens = Math.ceil(result.length / 4);

    // Log AI usage
    await logAIUsage({
      userId,
      type: data.type,
      inputTokens,
      outputTokens,
      bookId: data.context?.bookId,
    });

    // Log activity
    await logActivity({
      userId,
      type: 'AI_USED',
      message: `Used AI: ${typeLabels[data.type] || data.type}`,
      bookId: data.context?.bookId,
      metadata: { type: data.type, inputTokens, outputTokens } as Record<string, string | number>,
    });

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('AI generate error:', error);
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
