import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getChapterById, updateChapter, deleteChapter } from '@/lib/db';

type RouteParams = { params: Promise<{ chapterId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { chapterId } = await params;
    const chapter = await getChapterById(chapterId, userId);
    if (!chapter) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });

    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chapter' }, { status: 500 });
  }
}

const updateChapterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  status: z.enum(['DRAFT', 'COMPLETE', 'REVISION']).optional(),
  order: z.number().int().positive().optional(),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { chapterId } = await params;
    const body = await req.json();
    const data = updateChapterSchema.parse(body);

    const chapter = await updateChapter(chapterId, userId, data);
    if (!chapter) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });

    return NextResponse.json(chapter);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { chapterId } = await params;
    const result = await deleteChapter(chapterId, userId);
    if (!result) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
