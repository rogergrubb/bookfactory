import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma, getOrCreateUser, updateUser } from '@/lib/db';

// GET /api/user - Get current user profile
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
    const name = clerkUser?.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : '';

    const user = await getOrCreateUser(clerkId, email, name);

    return NextResponse.json({ user });
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

const updateUserSchema = z.object({
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  twitter: z.string().max(50).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  autoSave: z.boolean().optional(),
  autoSaveInterval: z.number().int().min(10).max(300).optional(),
  wordCountGoal: z.number().int().min(100).max(50000).optional(),
});

// PATCH /api/user - Update current user profile
export async function PATCH(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = updateUserSchema.parse(body);

    // Get user first
    const existingUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!existingUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const user = await updateUser(existingUser.id, data);

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('PATCH /api/user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
