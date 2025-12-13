// /api/continuity/[bookId]/analysis/route.ts

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
    
    // Get counts
    const [factCount, eventCount, issueCount, openIssues, criticalIssues] = await Promise.all([
      prisma.storyFact.count({ where: { bookId } }),
      prisma.bookTimelineEvent.count({ where: { bookId } }),
      prisma.consistencyIssue.count({ where: { bookId } }),
      prisma.consistencyIssue.count({ where: { bookId, status: 'open' } }),
      prisma.consistencyIssue.count({ where: { bookId, status: 'open', severity: 'critical' } }),
    ]);
    
    // Calculate continuity score
    let score = 100;
    score -= criticalIssues * 15;
    score -= (openIssues - criticalIssues) * 5;
    score = Math.max(0, Math.min(100, score));
    
    const analysis = {
      bookId,
      analyzedAt: new Date(),
      chaptersAnalyzed: 0,
      stats: {
        totalFacts: factCount,
        totalEvents: eventCount,
        totalCharacters: 0,
        issuesFound: issueCount,
        criticalIssues,
        warningIssues: openIssues - criticalIssues,
      },
      continuityScore: score,
      scoreBreakdown: {
        characterConsistency: score,
        timelineAccuracy: score,
        plotCoherence: score,
        worldConsistency: score,
      },
      topIssues: [],
      unresolvedThreads: [],
    };
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json({ error: 'Failed to fetch analysis' }, { status: 500 });
  }
}
