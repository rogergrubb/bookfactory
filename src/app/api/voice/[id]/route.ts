// API Route: /api/voice/[id]/route.ts
// Get, update, delete single voice profile

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// GET - Get single voice profile with samples
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
      include: {
        trainingSamples: {
          select: {
            id: true,
            source: true,
            sourceName: true,
            wordCount: true,
            addedAt: true,
          },
        },
      },
    });
    
    if (!voice) {
      return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
    }
    
    return NextResponse.json({ voice });
  } catch (error) {
    console.error('Error fetching voice:', error);
    return NextResponse.json({ error: 'Failed to fetch voice' }, { status: 500 });
  }
}

// PATCH - Update voice profile (rename, etc)
export async function PATCH(
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
    const { name, description } = body;
    
    // Verify ownership
    const voice = await prisma.voiceProfile.findFirst({
      where: { id, userId },
    });
    
    if (!voice) {
      return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
    }
    
    const updated = await prisma.voiceProfile.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });
    
    return NextResponse.json({ voice: updated });
  } catch (error) {
    console.error('Error updating voice:', error);
    return NextResponse.json({ error: 'Failed to update voice' }, { status: 500 });
  }
}

// DELETE - Delete single voice profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify ownership
    const voice = await prisma.voiceProfile.findFirst({
      where: { id, userId },
    });
    
    if (!voice) {
      return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
    }
    
    await prisma.voiceProfile.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting voice:', error);
    return NextResponse.json({ error: 'Failed to delete voice' }, { status: 500 });
  }
}
