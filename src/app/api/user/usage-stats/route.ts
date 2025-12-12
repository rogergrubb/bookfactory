import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get usage stats for each period
    const [todayUsage, weekUsage, monthUsage, topTools, recentActivity] = await Promise.all([
      // Today's usage
      prisma.aIUsage.aggregate({
        where: {
          userId: user.id,
          createdAt: { gte: todayStart }
        },
        _sum: {
          inputTokens: true,
          outputTokens: true,
        },
        _count: true,
      }),
      
      // This week's usage
      prisma.aIUsage.aggregate({
        where: {
          userId: user.id,
          createdAt: { gte: weekStart }
        },
        _sum: {
          inputTokens: true,
          outputTokens: true,
        },
        _count: true,
      }),
      
      // This month's usage
      prisma.aIUsage.aggregate({
        where: {
          userId: user.id,
          createdAt: { gte: monthStart }
        },
        _sum: {
          inputTokens: true,
          outputTokens: true,
        },
        _count: true,
      }),
      
      // Top tools (by usage count in last 30 days)
      prisma.aIUsage.groupBy({
        by: ['type'],
        where: {
          userId: user.id,
          createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        },
        _count: true,
        _sum: {
          inputTokens: true,
          outputTokens: true,
        },
        orderBy: {
          _count: {
            type: 'desc'
          }
        },
        take: 10,
      }),
      
      // Recent activity
      prisma.aIUsage.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          type: true,
          inputTokens: true,
          outputTokens: true,
          createdAt: true,
        }
      }),
    ]);

    // Cost calculation (Claude Sonnet pricing approximation)
    const COST_PER_1K_INPUT = 0.003;
    const COST_PER_1K_OUTPUT = 0.015;

    const calculateCost = (inputTokens: number, outputTokens: number) => {
      return ((inputTokens / 1000) * COST_PER_1K_INPUT) + ((outputTokens / 1000) * COST_PER_1K_OUTPUT);
    };

    const formatPeriodStats = (data: typeof todayUsage) => {
      const inputTokens = data._sum.inputTokens || 0;
      const outputTokens = data._sum.outputTokens || 0;
      return {
        tokens: inputTokens + outputTokens,
        cost: calculateCost(inputTokens, outputTokens),
        generations: data._count,
      };
    };

    return NextResponse.json({
      today: formatPeriodStats(todayUsage),
      week: formatPeriodStats(weekUsage),
      month: formatPeriodStats(monthUsage),
      topTools: topTools.map(t => ({
        toolId: t.type,
        count: t._count,
        tokens: (t._sum.inputTokens || 0) + (t._sum.outputTokens || 0),
      })),
      recentActivity: recentActivity.map(a => ({
        id: a.id,
        toolId: a.type,
        tokens: a.inputTokens + a.outputTokens,
        cost: calculateCost(a.inputTokens, a.outputTokens),
        timestamp: a.createdAt,
      })),
    });

  } catch (error) {
    console.error('Usage stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage stats' },
      { status: 500 }
    );
  }
}
