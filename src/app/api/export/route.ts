import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { exportBook, ExportFormat } from '@/lib/export';

const exportSchema = z.object({
  bookId: z.string(),
  format: z.enum(['epub', 'pdf', 'docx', 'markdown', 'html']),
  includeTitle: z.boolean().optional().default(true),
  includeToc: z.boolean().optional().default(true),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const options = exportSchema.parse(body);

    // Fetch book with chapters
    const book = await prisma.book.findFirst({
      where: { id: options.bookId, userId },
      include: {
        chapters: { orderBy: { order: 'asc' } },
        user: { select: { name: true } },
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const bookData = {
      id: book.id,
      title: book.title,
      subtitle: book.subtitle || undefined,
      author: book.user?.name || 'Unknown Author',
      description: book.description || undefined,
      genre: book.genre,
      chapters: book.chapters.map(ch => ({
        id: ch.id,
        title: ch.title,
        content: ch.content,
        order: ch.order,
      })),
    };

    const { data, filename, mimeType } = await exportBook(bookData, {
      format: options.format as ExportFormat,
      includeTitle: options.includeTitle,
      includeToc: options.includeToc,
      fontSize: options.fontSize,
      fontFamily: options.fontFamily,
    });

    // Return base64 for binary formats, string for text
    const isBinary = ['epub', 'docx'].includes(options.format);
    
    return NextResponse.json({
      data: isBinary ? (data as Buffer).toString('base64') : data.toString(),
      filename,
      mimeType,
      encoding: isBinary ? 'base64' : 'utf-8',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid options', details: error.issues }, { status: 400 });
    }
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');
    const format = searchParams.get('format') || 'epub';

    if (!bookId) {
      return NextResponse.json({ error: 'bookId required' }, { status: 400 });
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId, userId },
      include: {
        chapters: { orderBy: { order: 'asc' } },
        user: { select: { name: true } },
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const bookData = {
      id: book.id,
      title: book.title,
      subtitle: book.subtitle || undefined,
      author: book.user?.name || 'Unknown Author',
      description: book.description || undefined,
      genre: book.genre,
      chapters: book.chapters.map(ch => ({
        id: ch.id,
        title: ch.title,
        content: ch.content,
        order: ch.order,
      })),
    };

    const { data, filename, mimeType } = await exportBook(bookData, {
      format: format as ExportFormat,
    });

    return new NextResponse(Buffer.isBuffer(data) ? new Uint8Array(data) : data, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
