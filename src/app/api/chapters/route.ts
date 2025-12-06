import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const createChapterSchema = z.object({
  bookId: z.string(),
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  order: z.number().int().min(1).optional(),
});

const updateChapterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  status: z.enum(['DRAFT', 'COMPLETE', 'REVISION']).optional(),
  order: z.number().int().min(1).optional(),
});

// GET /api/chapters?bookId=xxx - Get all chapters for a book
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bookId = req.nextUrl.searchParams.get('bookId');
    if (!bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 });

    // Verify user owns the book
    const book = await prisma.book.findFirst({ where: { id: bookId, userId } });
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    const chapters = await prisma.chapter.findMany({
      where: { bookId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ chapters });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chapters - Create a new chapter
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = createChapterSchema.parse(body);

    // Verify user owns the book
    const book = await prisma.book.findFirst({ where: { id: data.bookId, userId } });
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    // Get the next order number if not specified
    if (!data.order) {
      const lastChapter = await prisma.chapter.findFirst({
        where: { bookId: data.bookId },
        orderBy: { order: 'desc' },
      });
      data.order = (lastChapter?.order || 0) + 1;
    }

    const chapter = await prisma.chapter.create({
      data: {
        bookId: data.bookId,
        title: data.title,
        content: data.content || '',
        wordCount: data.content ? data.content.split(/\s+/).length : 0,
        order: data.order,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
