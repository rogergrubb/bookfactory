// /api/continuity/[bookId]/scan/status/route.ts

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
    
    const status = await prisma.scanStatus.findUnique({
      where: { bookId },
    });
    
    return NextResponse.json(status || { phase: 'Not started', progress: 0 });
  } catch (error) {
    console.error('Error fetching scan status:', error);
    return NextResponse.json({ phase: 'Error', progress: 0 });
  }
}
