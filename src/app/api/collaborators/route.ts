import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma, getCollaborators, inviteCollaborator } from '@/lib/db';

const inviteSchema = z.object({
  bookId: z.string(),
  email: z.string().email(),
  role: z.enum(['BETA_READER', 'EDITOR', 'CO_AUTHOR']),
  permissions: z.array(z.enum(['COMMENT', 'SUGGEST_EDITS', 'VIEW_FULL'])),
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bookId = req.nextUrl.searchParams.get('bookId');
    if (!bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 });

    const collaborators = await getCollaborators(bookId, userId);
    if (!collaborators) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    return NextResponse.json({ collaborators });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch collaborators' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = inviteSchema.parse(body);

    // Verify user owns the book
    const book = await prisma.book.findFirst({ where: { id: data.bookId, userId } });
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });

    const collaborator = await inviteCollaborator(data);
    
    // TODO: Send invitation email
    
    return NextResponse.json({ collaborator }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to invite collaborator' }, { status: 500 });
  }
}
