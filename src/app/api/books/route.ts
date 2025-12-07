import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma, getUserBooks, createBook, logActivity, getOrCreateUser } from '@/lib/db';

// Validation schemas
const createBookSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  genre: z.string().min(1),
  targetWordCount: z.number().int().min(1000).max(500000),
  targetChapters: z.number().int().min(1).max(100),
  template: z.string().optional(),
  seriesId: z.string().optional(),
});

// GET /api/books - List all books for user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { userId };
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          chapters: { select: { id: true, wordCount: true, status: true } },
          series: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.book.count({ where }),
    ]);

    // Calculate stats for each book
    const booksWithStats = books.map(book => ({
      ...book,
      totalWordCount: book.chapters.reduce((sum, ch) => sum + ch.wordCount, 0),
      completedChapters: book.chapters.filter(ch => ch.status === 'COMPLETE').length,
      totalChapters: book.chapters.length,
    }));

    return NextResponse.json({
      books: booksWithStats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + books.length < total,
      },
    });
  } catch (error) {
    console.error('GET /api/books error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/books - Create a new book
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createBookSchema.parse(body);

    const book = await createBook({
      userId,
      ...validatedData,
    });

    // If template specified, create initial chapters
    if (validatedData.template) {
      const templateChapters = getTemplateChapters(validatedData.template, validatedData.targetChapters);
      
      await prisma.chapter.createMany({
        data: templateChapters.map((ch, index) => ({
          bookId: book.id,
          title: ch.title,
          content: ch.content || '',
          wordCount: 0,
          order: index + 1,
          status: 'DRAFT',
        })),
      });
    }

    // Log activity
    await logActivity({
      userId,
      type: 'BOOK_CREATED',
      message: `Created new book "${book.title}"`,
      bookId: book.id,
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('POST /api/books error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function for templates
function getTemplateChapters(template: string, targetChapters: number) {
  const templates: Record<string, { title: string; content?: string }[]> = {
    'three-act': [
      { title: 'Act 1: The Setup', content: '<!-- Act 1 introduces the world and characters -->' },
      { title: 'Chapter 1: The Ordinary World' },
      { title: 'Chapter 2: The Inciting Incident' },
      { title: 'Chapter 3: The First Turning Point' },
      { title: 'Act 2: The Confrontation', content: '<!-- Act 2 contains rising action and obstacles -->' },
      { title: 'Chapter 4: Rising Action' },
      { title: 'Chapter 5: The Midpoint' },
      { title: 'Chapter 6: Complications' },
      { title: 'Chapter 7: The Dark Moment' },
      { title: 'Act 3: The Resolution', content: '<!-- Act 3 resolves the conflict -->' },
      { title: 'Chapter 8: The Climax' },
      { title: 'Chapter 9: Falling Action' },
      { title: 'Chapter 10: The Resolution' },
    ],
    'hero-journey': [
      { title: '1. Ordinary World' },
      { title: '2. Call to Adventure' },
      { title: '3. Refusal of the Call' },
      { title: '4. Meeting the Mentor' },
      { title: '5. Crossing the Threshold' },
      { title: '6. Tests, Allies, Enemies' },
      { title: '7. Approach to the Inmost Cave' },
      { title: '8. The Ordeal' },
      { title: '9. Reward' },
      { title: '10. The Road Back' },
      { title: '11. Resurrection' },
      { title: '12. Return with the Elixir' },
    ],
    'save-cat': [
      { title: '1. Opening Image' },
      { title: '2. Theme Stated' },
      { title: '3. Setup' },
      { title: '4. Catalyst' },
      { title: '5. Debate' },
      { title: '6. Break into Two' },
      { title: '7. B Story' },
      { title: '8. Fun and Games' },
      { title: '9. Midpoint' },
      { title: '10. Bad Guys Close In' },
      { title: '11. All Is Lost' },
      { title: '12. Dark Night of the Soul' },
      { title: '13. Break into Three' },
      { title: '14. Finale' },
      { title: '15. Final Image' },
    ],
    'nonfiction': [
      { title: 'Introduction' },
      { title: 'Chapter 1: The Problem' },
      { title: 'Chapter 2: The Solution Overview' },
      { title: 'Chapter 3: Step 1' },
      { title: 'Chapter 4: Step 2' },
      { title: 'Chapter 5: Step 3' },
      { title: 'Chapter 6: Common Mistakes' },
      { title: 'Chapter 7: Advanced Strategies' },
      { title: 'Chapter 8: Case Studies' },
      { title: 'Chapter 9: Taking Action' },
      { title: 'Conclusion' },
      { title: 'Resources' },
    ],
  };

  return templates[template] || Array.from({ length: targetChapters }, (_, i) => ({
    title: `Chapter ${i + 1}`,
  }));
}
