import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma, logActivity } from '@/lib/db';

type RouteParams = { params: Promise<{ bookId: string }> };

const createChapterSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  order: z.number().int().min(1).optional(),
});

// GET /api/books/[bookId]/chapters - Get all chapters for a book
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookId } = await params;

    // Get user from Clerk ID
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Verify user owns the book
    const book = await prisma.book.findFirst({ where: { id: bookId, userId: user.id } });
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    const chapters = await prisma.chapter.findMany({
      where: { bookId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('GET /api/books/[bookId]/chapters error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/books/[bookId]/chapters - Create a new chapter
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookId } = await params;
    const body = await req.json();
    const data = createChapterSchema.parse(body);

    // Get user from Clerk ID
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Verify user owns the book
    const book = await prisma.book.findFirst({ where: { id: bookId, userId: user.id } });
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    // Get the next order number if not specified
    let order = data.order;
    if (!order) {
      const lastChapter = await prisma.chapter.findFirst({
        where: { bookId },
        orderBy: { order: 'desc' },
      });
      order = (lastChapter?.order || 0) + 1;
    }

    const wordCount = data.content ? data.content.split(/\s+/).filter(w => w.length > 0).length : 0;

    const chapter = await prisma.chapter.create({
      data: {
        bookId,
        title: data.title,
        content: data.content || '',
        wordCount,
        order,
        status: 'DRAFT',
      },
    });

    // Log activity
    await logActivity({
      userId: user.id,
      type: 'CHAPTER_CREATED',
      message: `Created chapter "${chapter.title}" in "${book.title}"`,
      bookId,
      chapterId: chapter.id,
    });

    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('POST /api/books/[bookId]/chapters error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
