import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

type RouteParams = { params: Promise<{ collaboratorId: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { collaboratorId } = await params;
    const body = await req.json();

    // Verify ownership through book
    const collaborator = await prisma.collaborator.findFirst({
      where: { id: collaboratorId, book: { userId } },
    });

    if (!collaborator) {
      return NextResponse.json({ error: 'Collaborator not found' }, { status: 404 });
    }

    const updated = await prisma.collaborator.update({
      where: { id: collaboratorId },
      data: body,
    });

    return NextResponse.json({ collaborator: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update collaborator' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { collaboratorId } = await params;

    // Verify ownership through book
    const collaborator = await prisma.collaborator.findFirst({
      where: { id: collaboratorId, book: { userId } },
    });

    if (!collaborator) {
      return NextResponse.json({ error: 'Collaborator not found' }, { status: 404 });
    }

    await prisma.collaborator.delete({ where: { id: collaboratorId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete collaborator' }, { status: 500 });
  }
}
