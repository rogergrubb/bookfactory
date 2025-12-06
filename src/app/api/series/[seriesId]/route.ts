import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

type RouteParams = { params: Promise<{ seriesId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { seriesId } = await params;
    const series = await prisma.series.findFirst({
      where: { id: seriesId, userId },
      include: {
        books: { orderBy: { seriesOrder: 'asc' } },
        characters: true,
        settings: true,
        timeline: { orderBy: { date: 'asc' } },
      },
    });

    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    return NextResponse.json({ series });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}

const updateSeriesSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  genre: z.string().optional(),
  status: z.enum(['ONGOING', 'COMPLETED', 'HIATUS']).optional(),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { seriesId } = await params;
    const body = await req.json();
    const data = updateSeriesSchema.parse(body);

    const result = await prisma.series.updateMany({
      where: { id: seriesId, userId },
      data,
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const series = await prisma.series.findFirst({
      where: { id: seriesId, userId },
    });

    return NextResponse.json({ series });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update series' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { seriesId } = await params;
    const result = await prisma.series.deleteMany({
      where: { id: seriesId, userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete series' }, { status: 500 });
  }
}
