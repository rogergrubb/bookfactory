import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma, getUserSeries, createSeries } from '@/lib/db';

const createSeriesSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  genre: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const series = await getUserSeries(userId);
    return NextResponse.json({ series });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = createSeriesSchema.parse(body);

    const series = await createSeries({ userId, ...data });
    return NextResponse.json({ series }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create series' }, { status: 500 });
  }
}
