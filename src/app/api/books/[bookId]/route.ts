import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getBookById, updateBook, deleteBook, prisma } from '@/lib/db';

type RouteParams = { params: Promise<{ bookId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookId } = await params;
    const book = await getBookById(bookId, userId);
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    const totalWordCount = book.chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
    const progress = Math.round((totalWordCount / book.targetWordCount) * 100);

    return NextResponse.json({
      ...book,
      stats: { totalWordCount, progress },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

const updateBookSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
  genre: z.string().optional(),
  status: z.enum(['DRAFT', 'WRITING', 'EDITING', 'PUBLISHED', 'ARCHIVED']).optional(),
  coverUrl: z.string().url().optional(),
  targetWordCount: z.number().int().positive().optional(),
  seriesId: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookId } = await params;
    const body = await req.json();
    const parsed = updateBookSchema.parse(body);
    
    // Convert to correct type for updateBook
    const data: Record<string, any> = { ...parsed };

    const result = await updateBook(bookId, userId, data);
    if (!result) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookId } = await params;
    const result = await deleteBook(bookId, userId);
    if (!result) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
