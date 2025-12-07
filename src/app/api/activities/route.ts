import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getActivities, getOrCreateUser } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkId, '', '');
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') || undefined;
    const bookId = searchParams.get('bookId') || undefined;

    const activities = await getActivities(user.id, { limit, offset, type, bookId });
    
    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Activities API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
