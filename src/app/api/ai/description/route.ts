import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { generateBookDescription } from '@/lib/ai';

const descriptionSchema = z.object({
  title: z.string().min(1),
  genre: z.string().min(1),
  synopsis: z.string().min(10),
  keywords: z.array(z.string()).optional(),
  style: z.enum(['blurb', 'amazon', 'pitch', 'social']),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = descriptionSchema.parse(body);

    const result = await generateBookDescription(data);
    return NextResponse.json({ description: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
