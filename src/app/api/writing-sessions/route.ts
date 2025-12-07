import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  recordWritingSession, 
  getWritingStreak, 
  getWritingHistory,
  getOrCreateUser 
} from '@/lib/db';

// GET - Fetch writing stats and history
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkId, '', '');
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const [streak, history] = await Promise.all([
      getWritingStreak(user.id),
      getWritingHistory(user.id, days),
    ]);
    
    return NextResponse.json({ streak, history });
  } catch (error) {
    console.error('Writing sessions GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch writing stats' },
      { status: 500 }
    );
  }
}

// POST - Record a writing session
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkId, '', '');
    const body = await request.json();
    
    const { wordsWritten, duration, bookId, chapterId } = body;

    if (typeof wordsWritten !== 'number' || wordsWritten < 0) {
      return NextResponse.json(
        { error: 'Invalid wordsWritten value' },
        { status: 400 }
      );
    }

    const session = await recordWritingSession({
      userId: user.id,
      wordsWritten,
      duration,
      bookId,
      chapterId,
    });

    // Get updated streak
    const streak = await getWritingStreak(user.id);
    
    return NextResponse.json({ session, streak });
  } catch (error) {
    console.error('Writing sessions POST error:', error);
    return NextResponse.json(
      { error: 'Failed to record writing session' },
      { status: 500 }
    );
  }
}
