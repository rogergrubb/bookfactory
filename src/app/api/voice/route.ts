// API Route: /api/voice/route.ts
// List and manage voice profiles

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - List all voice profiles for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const voices = await prisma.voiceProfile.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        totalWordCount: true,
        sampleCount: true,
        analysis: true,
        timesUsed: true,
        lastUsedAt: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    // Extract confidence from analysis
    const voicesWithConfidence = voices.map(v => ({
      ...v,
      confidence: (v.analysis as any)?.confidence || 0,
    }));
    
    return NextResponse.json({ voices: voicesWithConfidence });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json({ error: 'Failed to fetch voices' }, { status: 500 });
  }
}

// DELETE - Delete a voice profile
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const voiceId = searchParams.get('id');
    
    if (!voiceId) {
      return NextResponse.json({ error: 'Voice ID required' }, { status: 400 });
    }
    
    // Verify ownership
    const voice = await prisma.voiceProfile.findFirst({
      where: { id: voiceId, userId },
    });
    
    if (!voice) {
      return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
    }
    
    await prisma.voiceProfile.delete({
      where: { id: voiceId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting voice:', error);
    return NextResponse.json({ error: 'Failed to delete voice' }, { status: 500 });
  }
}
