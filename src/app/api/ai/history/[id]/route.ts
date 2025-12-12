import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isFavorite } = body;

    const toolRun = await prisma.toolRun.findFirst({
      where: {
        id,
        userId: user.id,
      }
    });

    if (!toolRun) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const currentOptions = (toolRun.options as Record<string, unknown>) || {};
    const updatedOptions = {
      ...currentOptions,
      isFavorite: Boolean(isFavorite),
    };

    await prisma.toolRun.update({
      where: { id },
      data: { options: updatedOptions },
    });

    return NextResponse.json({ success: true, isFavorite });

  } catch (error) {
    console.error('Favorite toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to update favorite status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    const toolRun = await prisma.toolRun.findFirst({
      where: {
        id,
        userId: user.id,
      }
    });

    if (!toolRun) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    await prisma.toolRun.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete record error:', error);
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    );
  }
}
