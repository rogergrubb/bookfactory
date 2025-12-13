// /api/continuity/[bookId]/issues/[issueId]/resolve/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string; issueId: string }> }
) {
  try {
    const { userId } = await auth();
    const { bookId, issueId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { method, notes } = body;
    
    // Determine status based on method
    let status: string;
    switch (method) {
      case 'fixed':
        status = 'resolved';
        break;
      case 'intentional':
        status = 'acknowledged';
        break;
      case 'wont_fix':
        status = 'dismissed';
        break;
      default:
        status = 'resolved';
    }
    
    const issue = await prisma.consistencyIssue.update({
      where: { id: issueId },
      data: {
        status,
        resolution: {
          method,
          notes: notes || '',
          resolvedAt: new Date().toISOString(),
        },
      },
    });
    
    return NextResponse.json({ issue });
  } catch (error) {
    console.error('Error resolving issue:', error);
    return NextResponse.json({ error: 'Failed to resolve issue' }, { status: 500 });
  }
}
