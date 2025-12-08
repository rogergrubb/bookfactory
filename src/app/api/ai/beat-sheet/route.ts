import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Story structure templates
const STRUCTURES = {
  'save-the-cat': {
    name: 'Save the Cat',
    beats: [
      { name: 'Opening Image', percentage: 0, description: 'A visual that represents the struggle & tone of the story' },
      { name: 'Theme Stated', percentage: 5, description: 'Someone poses a question or makes a statement that is the thematic premise' },
      { name: 'Setup', percentage: 1, description: 'Explore the status quo, introduce characters, show what needs fixing' },
      { name: 'Catalyst', percentage: 10, description: 'The moment that sets the story in motion' },
      { name: 'Debate', percentage: 10, description: 'Hero doubts the journey, asks "should I go?"' },
      { name: 'Break into Two', percentage: 20, description: 'Hero decides to accept the call to adventure' },
      { name: 'B Story', percentage: 22, description: 'Introduction of love interest or mentor (often carries theme)' },
      { name: 'Fun and Games', percentage: 20, description: 'The promise of the premise—the fun part' },
      { name: 'Midpoint', percentage: 50, description: 'Stakes are raised, false victory or false defeat' },
      { name: 'Bad Guys Close In', percentage: 50, description: 'Pressure mounts, team frays, hero's flaws emerge' },
      { name: 'All Is Lost', percentage: 75, description: 'The opposite of the Midpoint, a whiff of death' },
      { name: 'Dark Night of the Soul', percentage: 75, description: 'Hero mourns, wallows, but then finds a solution' },
      { name: 'Break into Three', percentage: 80, description: 'Solution is found, hero rallies' },
      { name: 'Finale', percentage: 80, description: 'Hero implements solution, defeats enemies, learns lesson' },
      { name: 'Final Image', percentage: 99, description: 'Opposite of opening image, showing how much hero has changed' },
    ]
  },
  'three-act': {
    name: 'Three-Act Structure',
    beats: [
      { name: 'Act 1: Setup', percentage: 0, description: 'Introduce protagonist, world, and status quo' },
      { name: 'Inciting Incident', percentage: 10, description: 'Event that disrupts the status quo' },
      { name: 'First Plot Point', percentage: 25, description: 'Protagonist commits to the journey' },
      { name: 'Act 2A: Rising Action', percentage: 25, description: 'Protagonist reacts to new situation' },
      { name: 'Midpoint', percentage: 50, description: 'Major revelation or shift' },
      { name: 'Act 2B: Complications', percentage: 50, description: 'Stakes increase, protagonist becomes proactive' },
      { name: 'Second Plot Point', percentage: 75, description: 'Final piece needed for resolution' },
      { name: 'Act 3: Resolution', percentage: 75, description: 'Climax and resolution' },
      { name: 'Denouement', percentage: 95, description: 'New equilibrium established' },
    ]
  },
  'heros-journey': {
    name: "Hero's Journey",
    beats: [
      { name: 'Ordinary World', percentage: 0, description: "Hero's normal life before the adventure" },
      { name: 'Call to Adventure', percentage: 8, description: 'Hero is presented with a problem or challenge' },
      { name: 'Refusal of the Call', percentage: 12, description: 'Hero hesitates or refuses' },
      { name: 'Meeting the Mentor', percentage: 15, description: 'Hero meets someone who gives guidance' },
      { name: 'Crossing the Threshold', percentage: 20, description: 'Hero commits to the adventure' },
      { name: 'Tests, Allies, Enemies', percentage: 25, description: 'Hero faces challenges, makes friends/foes' },
      { name: 'Approach to Inmost Cave', percentage: 45, description: 'Hero prepares for major challenge' },
      { name: 'Ordeal', percentage: 50, description: 'Hero faces greatest fear or deadly danger' },
      { name: 'Reward', percentage: 60, description: 'Hero takes possession of the treasure' },
      { name: 'The Road Back', percentage: 70, description: 'Hero deals with consequences of action' },
      { name: 'Resurrection', percentage: 85, description: 'Final test where hero must use everything learned' },
      { name: 'Return with Elixir', percentage: 95, description: 'Hero returns home transformed' },
    ]
  },
  'seven-point': {
    name: 'Seven-Point Structure',
    beats: [
      { name: 'Hook', percentage: 0, description: 'Opposite state from the resolution' },
      { name: 'Plot Turn 1', percentage: 15, description: 'Introduction of conflict' },
      { name: 'Pinch Point 1', percentage: 30, description: 'Apply pressure, show stakes' },
      { name: 'Midpoint', percentage: 50, description: 'Move from reaction to action' },
      { name: 'Pinch Point 2', percentage: 70, description: 'Apply more pressure, show consequences' },
      { name: 'Plot Turn 2', percentage: 85, description: 'Character gets final piece needed' },
      { name: 'Resolution', percentage: 95, description: 'Conflict resolved, character transformed' },
    ]
  },
  'romance': {
    name: 'Romance Beat Sheet',
    beats: [
      { name: 'Meet Cute', percentage: 5, description: 'Protagonists meet in memorable way' },
      { name: 'The Debate', percentage: 10, description: 'Why they cannot/should not be together' },
      { name: 'Forced Proximity', percentage: 15, description: 'Circumstances push them together' },
      { name: 'Growing Attraction', percentage: 25, description: 'Chemistry builds despite resistance' },
      { name: 'First Kiss/Connection', percentage: 35, description: 'Physical or emotional breakthrough' },
      { name: 'Deepening Relationship', percentage: 45, description: 'Getting to know each other truly' },
      { name: 'Midpoint Shift', percentage: 50, description: 'Commitment or setback' },
      { name: 'Dark Moment Setup', percentage: 65, description: 'External/internal threats emerge' },
      { name: 'Black Moment', percentage: 75, description: 'Breakup or major conflict' },
      { name: 'Grand Gesture', percentage: 85, description: 'One or both fight for the relationship' },
      { name: 'Resolution', percentage: 95, description: 'HEA or HFN achieved' },
    ]
  },
  'mystery': {
    name: 'Mystery Beat Sheet',
    beats: [
      { name: 'Crime/Mystery Introduced', percentage: 5, description: 'The puzzle is presented' },
      { name: 'Sleuth Takes Case', percentage: 10, description: 'Detective commits to solving it' },
      { name: 'First Clues', percentage: 15, description: 'Initial investigation and discoveries' },
      { name: 'Red Herring 1', percentage: 25, description: 'False lead that seems promising' },
      { name: 'Midpoint Revelation', percentage: 50, description: 'Major clue changes understanding' },
      { name: 'Stakes Raised', percentage: 60, description: 'Personal danger or new victim' },
      { name: 'Red Herring 2', percentage: 70, description: 'Another false lead' },
      { name: 'Dark Night', percentage: 80, description: 'Sleuth seems defeated' },
      { name: 'Final Clue', percentage: 85, description: 'The piece that solves it' },
      { name: 'Confrontation', percentage: 90, description: 'Reveal and showdown with culprit' },
      { name: 'Resolution', percentage: 95, description: 'Justice served, order restored' },
    ]
  },
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, bookId, ...data } = body;

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

    if (action === 'generate') {
      // Generate a complete beat sheet from premise
      const { premise, structure, genre, targetWordCount } = data;
      
      if (!premise) {
        return NextResponse.json({ error: 'Story premise required' }, { status: 400 });
      }

      const structureTemplate = STRUCTURES[structure as keyof typeof STRUCTURES] || STRUCTURES['save-the-cat'];
      const wordCount = targetWordCount || 80000;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: `You are a master story architect who creates compelling, well-structured narratives. Generate beat sheets that are specific, emotionally resonant, and commercially viable.`,
        messages: [{
          role: 'user',
          content: `Create a detailed beat sheet for this story:

PREMISE: ${premise}
GENRE: ${genre || 'General Fiction'}
STRUCTURE: ${structureTemplate.name}
TARGET WORD COUNT: ${wordCount.toLocaleString()} words

Structure beats to hit:
${structureTemplate.beats.map(b => `- ${b.name} (${b.percentage}%): ${b.description}`).join('\n')}

For each beat, return JSON:
{
  "title": "${book.title || 'Untitled'}",
  "premise": "${premise}",
  "genre": "${genre || 'General Fiction'}",
  "structure": "${structureTemplate.name}",
  "targetWordCount": ${wordCount},
  "beats": [
    {
      "beatName": "Name of the beat",
      "percentage": 0-100,
      "targetWordCount": "word count to reach by this point",
      "chapterEstimate": "Suggested chapter number(s)",
      "summary": "2-3 sentence description of what happens",
      "scenes": [
        {
          "title": "Scene title",
          "pov": "POV character",
          "location": "Where it takes place",
          "purpose": "What this scene accomplishes",
          "conflict": "The conflict/tension in this scene",
          "outcome": "How it ends",
          "notes": "Any important details"
        }
      ],
      "emotionalState": "Character's emotional state at this point",
      "plotThreads": ["Plot threads active/resolved here"],
      "foreshadowing": "Any setup/payoff elements"
    }
  ],
  "characterArcs": [
    {
      "character": "Character name",
      "startState": "Where they start",
      "midpointState": "Where they are at midpoint",
      "endState": "Where they end",
      "keyMoments": ["Moments that define their arc"]
    }
  ],
  "themes": ["Central themes explored"],
  "subplots": [
    {
      "name": "Subplot name",
      "purpose": "How it serves the main story",
      "beats": ["When it appears in the story"]
    }
  ]
}`
        }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      const beatSheetText = textContent?.type === 'text' ? textContent.text : '';
      
      let beatSheet;
      try {
        const jsonMatch = beatSheetText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          beatSheet = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        return NextResponse.json({ raw: beatSheetText });
      }

      // Save to book metadata
      const currentMetadata = (book.metadata || {}) as Record<string, unknown>;
      await prisma.book.update({
        where: { id: bookId },
        data: {
          metadata: { 
            ...currentMetadata, 
            beatSheet,
            beatSheetUpdatedAt: new Date().toISOString()
          }
        }
      });

      return NextResponse.json({ beatSheet });
    }

    if (action === 'expand-beat') {
      // Expand a single beat into detailed scenes
      const { beat, context } = data;
      
      if (!beat) {
        return NextResponse.json({ error: 'Beat required' }, { status: 400 });
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Expand this story beat into detailed scenes:

Beat: ${JSON.stringify(beat, null, 2)}

Story context: ${context || 'No additional context provided'}

Return JSON with expanded scene breakdown:
{
  "beatName": "${beat.beatName}",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene title",
      "type": "action/dialogue/introspection/transition",
      "pov": "POV character",
      "location": "Detailed setting",
      "timeOfDay": "When it takes place",
      "characters": ["Characters present"],
      "openingHook": "First line or moment",
      "conflict": "The central tension",
      "beats": [
        "Beat 1: What happens first",
        "Beat 2: Rising action",
        "Beat 3: Scene climax",
        "Beat 4: Resolution or cliffhanger"
      ],
      "emotionalArc": "How emotions shift",
      "closingMoment": "How scene ends",
      "wordCountEstimate": 1500,
      "notes": "Writing notes or warnings"
    }
  ],
  "transitionTo": "How this connects to next beat"
}`
        }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      const expandedText = textContent?.type === 'text' ? textContent.text : '';
      
      let expandedBeat;
      try {
        const jsonMatch = expandedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          expandedBeat = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        return NextResponse.json({ raw: expandedText });
      }

      return NextResponse.json({ expandedBeat });
    }

    if (action === 'scene-to-prose') {
      // Convert a scene outline to prose
      const { scene, voiceProfile, genre } = data;
      
      if (!scene) {
        return NextResponse.json({ error: 'Scene required' }, { status: 400 });
      }

      const systemPrompt = voiceProfile 
        ? `You are a novelist writing in this specific voice:\n${JSON.stringify(voiceProfile, null, 2)}`
        : `You are an expert ${genre || 'fiction'} novelist crafting compelling prose.`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Write the full prose for this scene:

${JSON.stringify(scene, null, 2)}

Write immersive, publishable-quality prose. Include dialogue, action, description, and interiority. Show, don't tell. Aim for approximately ${scene.wordCountEstimate || 1500} words.

Write only the scene—no preamble or explanation.`
        }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      const prose = textContent?.type === 'text' ? textContent.text : '';

      return NextResponse.json({ 
        prose,
        wordCount: prose.split(/\s+/).length,
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || 0
      });
    }

    if (action === 'analyze-pacing') {
      // Analyze story pacing based on beat sheet
      const { manuscript, beatSheet } = data;
      
      if (!manuscript || !beatSheet) {
        return NextResponse.json({ error: 'Manuscript and beat sheet required' }, { status: 400 });
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Analyze the pacing of this manuscript against its intended beat sheet:

BEAT SHEET:
${JSON.stringify(beatSheet, null, 2)}

MANUSCRIPT (first 10000 chars):
${manuscript.slice(0, 10000)}

Current manuscript word count: ${manuscript.split(/\s+/).length}

Return JSON:
{
  "overallPacing": "fast/balanced/slow",
  "pacingScore": 1-10,
  "beatAlignment": [
    {
      "beat": "Beat name",
      "expectedPercentage": 25,
      "actualPercentage": 30,
      "status": "early/on-track/late/missing",
      "notes": "Analysis"
    }
  ],
  "issues": [
    {
      "type": "sagging-middle/rushed-opening/delayed-inciting-incident/etc",
      "location": "Where in the story",
      "description": "What's wrong",
      "suggestion": "How to fix"
    }
  ],
  "strengths": ["What's working well"],
  "recommendations": ["Top 3 pacing improvements"]
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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Beat Sheet API error:', error);
    return NextResponse.json({ error: 'Beat sheet operation failed' }, { status: 500 });
  }
}

// Get available structures and saved beat sheet
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    // Return available structures
    const structures = Object.entries(STRUCTURES).map(([key, value]) => ({
      id: key,
      name: value.name,
      beatCount: value.beats.length,
      beats: value.beats,
    }));

    if (!bookId) {
      return NextResponse.json({ structures });
    }

    // Get saved beat sheet for this book
    const book = await prisma.book.findFirst({
      where: { id: bookId },
      include: { user: true }
    });

    if (!book || book.user.clerkId !== userId) {
      return NextResponse.json({ structures, beatSheet: null });
    }

    const metadata = (book.metadata || {}) as { beatSheet?: unknown; beatSheetUpdatedAt?: string };
    
    return NextResponse.json({ 
      structures,
      beatSheet: metadata.beatSheet || null,
      updatedAt: metadata.beatSheetUpdatedAt || null
    });

  } catch (error) {
    console.error('Get Beat Sheet error:', error);
    return NextResponse.json({ error: 'Failed to get beat sheet' }, { status: 500 });
  }
}
