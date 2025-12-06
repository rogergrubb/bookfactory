import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { generateKeywords } from '@/lib/ai';

const keywordsSchema = z.object({
  title: z.string().min(1),
  genre: z.string().min(1),
  description: z.string().min(10),
  count: z.number().int().min(1).max(10).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = keywordsSchema.parse(body);

    const keywords = await generateKeywords(data);
    return NextResponse.json({ keywords });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
