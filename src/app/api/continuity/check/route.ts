// /api/continuity/check/route.ts
// Real-time consistency check while writing

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { content, bookId, chapterId } = await request.json();
    
    if (!content || !bookId) {
      return NextResponse.json({ error: 'Content and bookId required' }, { status: 400 });
    }
    
    // Get existing facts for this book
    const facts = await prisma.storyFact.findMany({
      where: { bookId },
      take: 100,
      orderBy: { importance: 'asc' }, // Critical facts first
    });
    
    if (facts.length === 0) {
      return NextResponse.json({ issues: [], message: 'No facts tracked yet' });
    }
    
    // Build context from facts
    const factContext = facts.map(f => {
      const established = f.establishedIn as any;
      return `${f.subject}: ${f.attribute} = "${f.currentValue}" (from ${established?.chapterTitle || 'earlier'})`;
    }).join('\n');
    
    // Check for issues
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Check this new content for consistency issues with established story facts.

<established_facts>
${factContext}
</established_facts>

<new_content>
${content.slice(0, 5000)}
</new_content>

Check for:
1. Character traits that contradict established traits
2. Characters knowing things they shouldn't know yet
3. Timeline impossibilities (events in wrong order)
4. Characters being in impossible locations
5. World rule violations

Return ONLY a JSON array of issues found (empty array [] if none):

[
  {
    "type": "contradiction|timeline_conflict|character_knowledge|location_impossible|trait_inconsistency",
    "severity": "critical|warning",
    "title": "brief title",
    "description": "what conflicts with what established fact",
    "excerpt": "the specific problematic text from new content",
    "suggestion": "how to fix it"
  }
]

Be conservative - only flag clear contradictions, not ambiguities.`
      }]
    });
    
    const textBlock = response.content.find(b => b.type === 'text');
    const responseText = textBlock?.type === 'text' ? textBlock.text : '[]';
    
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      const issues = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      return NextResponse.json({ 
        issues,
        factsChecked: facts.length,
      });
    } catch {
      return NextResponse.json({ issues: [], factsChecked: facts.length });
    }
  } catch (error) {
    console.error('Consistency check error:', error);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}
