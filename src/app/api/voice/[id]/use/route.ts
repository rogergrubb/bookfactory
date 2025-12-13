// API Route: /api/voice/[id]/use/route.ts
// Track voice usage when it's used in generation

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { toolId, chapterId, bookId, inputWordCount, outputWordCount } = body;
    
    // Verify ownership
    const voice = await prisma.voiceProfile.findFirst({
      where: { id, userId },
    });
    
    if (!voice) {
      return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
    }
    
    // Update voice profile usage stats
    await prisma.voiceProfile.update({
      where: { id },
      data: {
        timesUsed: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
    
    // Log detailed usage
    await prisma.voiceUsageLog.create({
      data: {
        voiceProfileId: id,
        userId,
        toolId: toolId || 'unknown',
        chapterId,
        bookId,
        inputWordCount: inputWordCount || 0,
        outputWordCount: outputWordCount || 0,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging voice usage:', error);
    return NextResponse.json({ error: 'Failed to log usage' }, { status: 500 });
  }
}
