import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { analyzeContent } from '@/lib/ai';

const analyzeSchema = z.object({
  type: z.enum(['pacing', 'character', 'plot', 'style', 'readability', 'continuity']),
  content: z.string().min(1).max(100000),
  bookContext: z.object({
    genre: z.string().optional(),
    targetAudience: z.string().optional(),
    existingCharacters: z.array(z.object({ name: z.string(), description: z.string() })).optional(),
    plotPoints: z.array(z.string()).optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = analyzeSchema.parse(body);

    const result = await analyzeContent({
      type: data.type,
      content: data.content,
      bookContext: data.bookContext,
    });

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('AI analyze error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
