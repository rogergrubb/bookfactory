// /api/continuity/[bookId]/facts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { userId } = await auth();
    const { bookId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify book ownership
    const book = await prisma.book.findFirst({
      where: { id: bookId, userId },
    });
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    
    const facts = await prisma.storyFact.findMany({
      where: { bookId },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ facts });
  } catch (error) {
    console.error('Error fetching facts:', error);
    return NextResponse.json({ error: 'Failed to fetch facts' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { userId } = await auth();
    const { bookId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    const fact = await prisma.storyFact.create({
      data: {
        bookId,
        category: body.category,
        subject: body.subject,
        attribute: body.attribute,
        value: body.value,
        currentValue: body.value,
        establishedIn: body.establishedIn,
        confidence: body.confidence || 'explicit',
        importance: body.importance || 'significant',
        source: body.source || 'user',
        history: [],
      },
    });
    
    return NextResponse.json({ fact });
  } catch (error) {
    console.error('Error creating fact:', error);
    return NextResponse.json({ error: 'Failed to create fact' }, { status: 500 });
  }
}
