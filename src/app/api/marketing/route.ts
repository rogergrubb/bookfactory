import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['EMAIL', 'SOCIAL', 'ADS']),
  bookId: z.string().optional(),
  content: z.string(),
  scheduledAt: z.string().datetime().optional(),
  platforms: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      include: { book: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = createCampaignSchema.parse(body);

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        ...data,
        status: data.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
