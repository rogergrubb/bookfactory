// /api/continuity/[bookId]/scan/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { userId } = await auth();
    const { bookId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all chapters
    const chapters = await prisma.chapter.findMany({
      where: { bookId },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, content: true },
    });
    
    if (chapters.length === 0) {
      return NextResponse.json({ error: 'No chapters to scan' }, { status: 400 });
    }
    
    // Store scan status
    await prisma.scanStatus.upsert({
      where: { bookId },
      create: { bookId, phase: 'Starting...', progress: 0 },
      update: { phase: 'Starting...', progress: 0 },
    });
    
    // Process chapters (simplified - in production use background job)
    processBookScan(bookId, chapters);
    
    return NextResponse.json({ started: true, totalChapters: chapters.length });
  } catch (error) {
    console.error('Error starting scan:', error);
    return NextResponse.json({ error: 'Failed to start scan' }, { status: 500 });
  }
}

async function processBookScan(
  bookId: string,
  chapters: { id: string; title: string; content: string }[]
) {
  const existingFacts: any[] = [];
  
  try {
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const progress = Math.round(((i + 1) / chapters.length) * 100);
      
      // Update progress
      await prisma.scanStatus.update({
        where: { bookId },
        data: { 
          phase: `Analyzing: ${chapter.title}`, 
          progress 
        },
      });
      
      // Extract facts from chapter
      const result = await extractFromChapter(chapter, bookId, existingFacts);
      
      // Save extracted facts
      for (const fact of result.facts) {
        try {
          const saved = await prisma.storyFact.create({
            data: {
              bookId,
              category: fact.category,
              subject: fact.subject,
              attribute: fact.attribute,
              value: fact.value,
              currentValue: fact.value,
              establishedIn: {
                chapterId: chapter.id,
                chapterTitle: chapter.title,
                excerpt: fact.excerpt || '',
                position: fact.position || 0,
              },
              confidence: 'extracted',
              importance: fact.importance || 'significant',
              source: 'extracted',
              history: [],
            },
          });
          existingFacts.push(saved);
        } catch (e) {
          console.error('Failed to save fact:', e);
        }
      }
      
      // Save events
      for (const event of result.events) {
        try {
          await prisma.timelineEvent.create({
            data: {
              bookId,
              description: event.description,
              storyTime: event.storyTime,
              chapterId: chapter.id,
              chapterTitle: chapter.title,
              position: event.position || 0,
              characters: event.characters || [],
              locations: event.locations || [],
              importance: event.importance || 'significant',
            },
          });
        } catch (e) {
          console.error('Failed to save event:', e);
        }
      }
      
      // Save issues
      for (const issue of result.issues) {
        try {
          await prisma.consistencyIssue.create({
            data: {
              bookId,
              type: issue.type,
              severity: issue.severity || 'warning',
              title: issue.title,
              description: issue.description,
              locations: [{
                chapterId: chapter.id,
                chapterTitle: chapter.title,
                excerpt: issue.excerpt || '',
                position: 0,
              }],
              suggestions: [],
              status: 'open',
              detectedBy: 'auto',
            },
          });
        } catch (e) {
          console.error('Failed to save issue:', e);
        }
      }
    }
    
    // Mark complete
    await prisma.scanStatus.update({
      where: { bookId },
      data: { 
        phase: 'Complete', 
        progress: 100,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Scan failed:', error);
    await prisma.scanStatus.update({
      where: { bookId },
      data: { phase: 'Error', progress: 0 },
    });
  }
}

async function extractFromChapter(
  chapter: { id: string; title: string; content: string },
  bookId: string,
  existingFacts: any[]
): Promise<{
  facts: any[];
  events: any[];
  issues: any[];
}> {
  // Build context from existing facts (last 50)
  const factContext = existingFacts.slice(-50).map(f => 
    `${f.subject}: ${f.attribute} = "${f.currentValue}"`
  ).join('\n');
  
  // Truncate chapter content for API
  const content = chapter.content?.slice(0, 15000) || '';
  
  if (!content.trim()) {
    return { facts: [], events: [], issues: [] };
  }
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are a continuity analyst. Extract trackable facts and events from this chapter and identify consistency issues.

<existing_facts>
${factContext || 'None established yet'}
</existing_facts>

<chapter title="${chapter.title}">
${content}
</chapter>

Extract and return ONLY valid JSON:

{
  "facts": [
    {
      "category": "character_trait|character_knowledge|character_status|timeline|location|object|relationship|world_rule",
      "subject": "who or what",
      "attribute": "what aspect",
      "value": "the value",
      "excerpt": "brief quote from text (max 80 chars)",
      "importance": "critical|significant|minor"
    }
  ],
  "events": [
    {
      "description": "what happened (brief)",
      "storyTime": {
        "type": "absolute|relative",
        "value": "time description"
      },
      "characters": ["names"],
      "locations": ["places"],
      "importance": "critical|significant|minor"
    }
  ],
  "issues": [
    {
      "type": "contradiction|timeline_conflict|character_knowledge|trait_inconsistency",
      "severity": "critical|warning",
      "title": "brief title",
      "description": "what conflicts with what",
      "excerpt": "problematic text"
    }
  ]
}

Focus on:
- Character physical traits (eye color, hair, height, age)
- Character knowledge (what they know/don't know)
- Character locations and movements
- Timeline markers and event sequences
- Relationships and how they change
- Important objects and their states
- World rules (magic systems, technology, laws)

Flag issues where new content contradicts established facts.`
      }]
    });
    
    const textBlock = response.content.find(b => b.type === 'text');
    const responseText = textBlock?.type === 'text' ? textBlock.text : '{}';
    
    // Extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { facts: [], events: [], issues: [] };
    }
    
    const data = JSON.parse(jsonMatch[0]);
    
    return {
      facts: data.facts || [],
      events: data.events || [],
      issues: data.issues || [],
    };
  } catch (error) {
    console.error('AI extraction failed:', error);
    return { facts: [], events: [], issues: [] };
  }
}
