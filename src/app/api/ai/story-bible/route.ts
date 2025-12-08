import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/db';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface StoryBibleEntry {
  id: string;
  category: 'setting' | 'rule' | 'lore' | 'timeline' | 'faction' | 'magic' | 'technology' | 'culture' | 'other';
  name: string;
  description: string;
  details?: Record<string, unknown>;
  tags?: string[];
  relatedEntries?: string[];
  createdAt: string;
  updatedAt: string;
}

interface StoryBibleMetadata {
  storyBible?: StoryBibleEntry[];
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, bookId, entryId, ...data } = body;

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }

    // Verify book ownership
    const book = await prisma.book.findFirst({
      where: { id: bookId },
      include: { user: true }
    });

    if (!book || book.user.clerkId !== userId) {
      return NextResponse.json({ error: 'Book not found or unauthorized' }, { status: 404 });
    }

    const currentMetadata = (book.metadata || {}) as StoryBibleMetadata;
    let storyBible = currentMetadata.storyBible || [];

    if (action === 'generate-world') {
      // Generate comprehensive world-building from a premise
      const { premise, genre, worldType } = data;
      
      if (!premise) {
        return NextResponse.json({ error: 'Story premise required' }, { status: 400 });
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: `You are a master world-builder creating rich, consistent fictional worlds. Create detailed but usable world-building that serves storytelling.`,
        messages: [{
          role: 'user',
          content: `Create a story bible for this premise:
"${premise}"

Genre: ${genre || 'General Fiction'}
World Type: ${worldType || 'realistic'}

Return JSON with comprehensive world-building:
{
  "overview": {
    "worldName": "Name if applicable",
    "tagline": "One-line description",
    "tone": "Description of the world's tone/feel",
    "themes": ["Central themes"],
    "uniqueHook": "What makes this world special"
  },
  "settings": [
    {
      "name": "Location name",
      "type": "city/region/building/etc",
      "description": "2-3 sentence description",
      "atmosphere": "Mood/feel of this place",
      "sensoryDetails": {
        "sights": "Visual details",
        "sounds": "Audio details",
        "smells": "Olfactory details"
      },
      "significance": "Why this place matters to the story"
    }
  ],
  "rules": [
    {
      "name": "Rule name",
      "description": "How it works",
      "limitations": "What it can't do",
      "consequences": "What happens if broken/used"
    }
  ],
  "history": [
    {
      "event": "Event name",
      "when": "When it happened",
      "impact": "How it shapes the present"
    }
  ],
  "factions": [
    {
      "name": "Group name",
      "description": "Who they are",
      "goals": "What they want",
      "methods": "How they operate",
      "conflicts": "Who they oppose"
    }
  ],
  "culture": {
    "social": "Social structures/norms",
    "beliefs": "Common beliefs/religions",
    "customs": "Daily life customs",
    "taboos": "What's forbidden"
  },
  "storyPotential": {
    "conflicts": ["Built-in conflicts to explore"],
    "mysteries": ["Unanswered questions"],
    "opportunities": ["Story opportunities this world creates"]
  }
}`
        }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      const worldText = textContent?.type === 'text' ? textContent.text : '';
      
      let worldData;
      try {
        const jsonMatch = worldText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          worldData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        return NextResponse.json({ raw: worldText });
      }

      // Convert to story bible entries
      const newEntries: StoryBibleEntry[] = [];
      const timestamp = new Date().toISOString();

      // Add overview
      if (worldData.overview) {
        newEntries.push({
          id: `entry_${Date.now()}_overview`,
          category: 'other',
          name: 'World Overview',
          description: worldData.overview.tagline,
          details: worldData.overview,
          tags: ['overview', 'core'],
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }

      // Add settings
      if (worldData.settings) {
        worldData.settings.forEach((setting: Record<string, unknown>, i: number) => {
          newEntries.push({
            id: `entry_${Date.now()}_setting_${i}`,
            category: 'setting',
            name: setting.name as string,
            description: setting.description as string,
            details: setting,
            tags: ['setting', setting.type as string],
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        });
      }

      // Add rules
      if (worldData.rules) {
        worldData.rules.forEach((rule: Record<string, unknown>, i: number) => {
          newEntries.push({
            id: `entry_${Date.now()}_rule_${i}`,
            category: 'rule',
            name: rule.name as string,
            description: rule.description as string,
            details: rule,
            tags: ['rule', 'worldbuilding'],
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        });
      }

      // Add history
      if (worldData.history) {
        worldData.history.forEach((event: Record<string, unknown>, i: number) => {
          newEntries.push({
            id: `entry_${Date.now()}_history_${i}`,
            category: 'timeline',
            name: event.event as string,
            description: event.impact as string,
            details: event,
            tags: ['history', 'timeline'],
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        });
      }

      // Add factions
      if (worldData.factions) {
        worldData.factions.forEach((faction: Record<string, unknown>, i: number) => {
          newEntries.push({
            id: `entry_${Date.now()}_faction_${i}`,
            category: 'faction',
            name: faction.name as string,
            description: faction.description as string,
            details: faction,
            tags: ['faction', 'group'],
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        });
      }

      // Save to book
      storyBible = [...storyBible, ...newEntries];
      await prisma.book.update({
        where: { id: bookId },
        data: {
          metadata: { ...currentMetadata, storyBible }
        }
      });

      return NextResponse.json({ 
        worldData,
        entriesCreated: newEntries.length,
        storyBible
      });
    }

    if (action === 'check-consistency') {
      // Check if text is consistent with story bible
      const { textToCheck } = data;
      
      if (!textToCheck) {
        return NextResponse.json({ error: 'Text to check required' }, { status: 400 });
      }

      if (storyBible.length === 0) {
        return NextResponse.json({ 
          error: 'No story bible entries found. Generate world-building first.' 
        }, { status: 400 });
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Story Bible (established world rules and details):
${JSON.stringify(storyBible, null, 2)}

Text to check for consistency:
${textToCheck}

Analyze this text against the story bible. Return JSON:
{
  "overallConsistency": 1-10,
  "matches": ["Elements that correctly match the story bible"],
  "violations": [
    {
      "type": "contradiction/impossibility/anachronism/other",
      "severity": "minor/moderate/major",
      "issue": "Description of the problem",
      "storyBibleReference": "Which entry it violates",
      "problematicText": "The specific text",
      "suggestion": "How to fix it"
    }
  ],
  "missingContext": ["Story bible elements that could enrich this text"],
  "opportunities": ["Ways to better integrate world-building"]
}`
        }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      const analysisText = textContent?.type === 'text' ? textContent.text : '';
      
      let analysis;
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        return NextResponse.json({ raw: analysisText });
      }

      return NextResponse.json({ analysis });
    }

    if (action === 'expand-entry') {
      // Expand a story bible entry with more detail
      const { entryToExpand, focusAreas } = data;
      
      if (!entryToExpand) {
        return NextResponse.json({ error: 'Entry to expand required' }, { status: 400 });
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Expand this story bible entry with more detail:
${JSON.stringify(entryToExpand, null, 2)}

${focusAreas ? `Focus particularly on: ${focusAreas}` : ''}

Existing story bible context:
${JSON.stringify(storyBible.slice(0, 10), null, 2)}

Return JSON with the expanded entry in the same format but with richer, more detailed content. Add specific, usable details that help with writing scenes.`
        }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      const expandedText = textContent?.type === 'text' ? textContent.text : '';
      
      let expandedEntry;
      try {
        const jsonMatch = expandedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          expandedEntry = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        return NextResponse.json({ raw: expandedText });
      }

      return NextResponse.json({ expandedEntry });
    }

    if (action === 'add' || action === 'update') {
      // Add or update a story bible entry
      const { category, name, description, details, tags } = data;
      
      if (!name || !description) {
        return NextResponse.json({ error: 'Name and description required' }, { status: 400 });
      }

      const timestamp = new Date().toISOString();

      if (action === 'update' && entryId) {
        const index = storyBible.findIndex(e => e.id === entryId);
        if (index >= 0) {
          storyBible[index] = {
            ...storyBible[index],
            category: category || storyBible[index].category,
            name,
            description,
            details: details || storyBible[index].details,
            tags: tags || storyBible[index].tags,
            updatedAt: timestamp,
          };
        }
      } else {
        storyBible.push({
          id: `entry_${Date.now()}`,
          category: category || 'other',
          name,
          description,
          details,
          tags: tags || [],
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }

      await prisma.book.update({
        where: { id: bookId },
        data: {
          metadata: { ...currentMetadata, storyBible }
        }
      });

      return NextResponse.json({ success: true, storyBible });
    }

    if (action === 'delete' && entryId) {
      storyBible = storyBible.filter(e => e.id !== entryId);
      
      await prisma.book.update({
        where: { id: bookId },
        data: {
          metadata: { ...currentMetadata, storyBible }
        }
      });

      return NextResponse.json({ success: true, storyBible });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Story Bible API error:', error);
    return NextResponse.json({ error: 'Story bible operation failed' }, { status: 500 });
  }
}

// Get story bible for a book
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 });
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId },
      include: { user: true }
    });

    if (!book || book.user.clerkId !== userId) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const metadata = (book.metadata || {}) as StoryBibleMetadata;
    let entries = metadata.storyBible || [];

    // Filter by category
    if (category) {
      entries = entries.filter(e => e.category === category);
    }

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      entries = entries.filter(e => 
        e.name.toLowerCase().includes(searchLower) ||
        e.description.toLowerCase().includes(searchLower) ||
        e.tags?.some(t => t.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({ 
      storyBible: entries,
      categories: ['setting', 'rule', 'lore', 'timeline', 'faction', 'magic', 'technology', 'culture', 'other']
    });

  } catch (error) {
    console.error('Get Story Bible error:', error);
    return NextResponse.json({ error: 'Failed to get story bible' }, { status: 500 });
  }
}
