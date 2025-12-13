// API Route: /api/voice/[id]/prompt/route.ts
// Get the system prompt for a voice profile (used by AI generation)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const voice = await prisma.voiceProfile.findFirst({
      where: { id, userId },
      select: {
        systemPrompt: true,
        styleGuide: true,
        analysis: true,
      },
    });
    
    if (!voice) {
      return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      systemPrompt: voice.systemPrompt,
      styleGuide: voice.styleGuide,
      dimensions: (voice.analysis as any)?.dimensions,
    });
  } catch (error) {
    console.error('Error fetching voice prompt:', error);
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 });
  }
}
