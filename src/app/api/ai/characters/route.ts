import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const characterSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor', 'mentioned']).optional(),
  description: z.string().optional(),
  appearance: z.string().optional(),
  personality: z.string().optional(),
  backstory: z.string().optional(),
  motivations: z.string().optional(),
  relationships: z.array(z.object({
    characterId: z.string(),
    relationship: z.string(),
  })).optional(),
  voiceNotes: z.string().optional(),
  customFields: z.record(z.string()).optional(),
});

// Create or update character
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, bookId, characterId, ...data } = body;

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
      // AI-generate character details from a brief description
      const { brief, genre } = data;
      
      if (!brief) {
        return NextResponse.json({ error: 'Brief description required' }, { status: 400 });
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are an expert character developer for ${genre || 'fiction'} stories. Create rich, nuanced characters that feel real and serve the story.`,
        messages: [{
          role: 'user',
          content: `Create a detailed character profile from this brief: "${brief}"

Return a JSON object with:
{
  "name": "Full name",
  "nickname": "If any",
  "age": "Age or age range",
  "role": "protagonist/antagonist/supporting/minor",
  "occupation": "What they do",
  "appearance": {
    "physical": "Height, build, distinguishing features",
    "style": "How they dress, present themselves",
    "mannerisms": "Physical habits, gestures"
  },
  "personality": {
    "traits": ["5-7 key traits"],
    "strengths": ["2-3 strengths"],
    "flaws": ["2-3 meaningful flaws"],
    "fears": ["1-2 deep fears"],
    "desires": ["1-2 core desires"]
  },
  "backstory": {
    "summary": "2-3 sentence backstory",
    "formativeEvent": "One event that shaped them",
    "secrets": ["1-2 secrets they keep"]
  },
  "voice": {
    "speechPattern": "How they talk",
    "vocabulary": "Word choices they'd make",
    "catchphrases": ["Any distinctive phrases"],
    "internalVoice": "How their thoughts sound"
  },
  "motivations": {
    "want": "What they think they want",
    "need": "What they actually need",
    "conflict": "Internal conflict between want and need"
  },
  "arc": {
    "startingPoint": "Where they begin emotionally/psychologically",
    "potentialGrowth": "How they could change"
  }
}`
        }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      const analysisText = textContent?.type === 'text' ? textContent.text : '';
      
      let character;
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          character = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        return NextResponse.json({ 
          error: 'Failed to parse character data',
          raw: analysisText 
        }, { status: 500 });
      }

      return NextResponse.json({ character });
    }

    if (action === 'analyze-voice') {
      // Analyze dialogue samples to capture character voice
      const { dialogueSamples, characterName } = data;
      
      if (!dialogueSamples || dialogueSamples.length < 200) {
        return NextResponse.json({ 
          error: 'Please provide at least 200 characters of dialogue samples' 
        }, { status: 400 });
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Analyze these dialogue samples for ${characterName || 'this character'} and create a voice profile:

${dialogueSamples}

Return JSON:
{
  "speechPattern": "Description of how they structure sentences",
  "vocabulary": "Level and type of words they use",
  "idioms": ["Common phrases or expressions"],
  "rhythm": "Pacing of their speech",
  "emotionalTendencies": "How they express emotions in dialogue",
  "distinctiveFeatures": ["3-5 unique speech characteristics"],
  "exampleLines": ["3 example lines that capture their voice perfectly"]
}`
        }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      const analysisText = textContent?.type === 'text' ? textContent.text : '';
      
      let voiceProfile;
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          voiceProfile = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        return NextResponse.json({ raw: analysisText });
      }

      return NextResponse.json({ voiceProfile });
    }

    if (action === 'write-dialogue') {
      // Generate dialogue for a specific character
      const { characterProfile, situation, otherCharacters } = data;
      
      if (!characterProfile || !situation) {
        return NextResponse.json({ 
          error: 'Character profile and situation required' 
        }, { status: 400 });
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: `You are writing dialogue for a character with this profile:
${JSON.stringify(characterProfile, null, 2)}

Write ONLY dialogue and brief action beats. The dialogue must sound exactly like this character—their vocabulary, rhythm, emotional tendencies. Stay in character completely.`,
        messages: [{
          role: 'user',
          content: `Write dialogue for this situation: ${situation}
${otherCharacters ? `\nOther characters present: ${otherCharacters}` : ''}

Write 5-10 lines of dialogue with brief action beats.`
        }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      const dialogue = textContent?.type === 'text' ? textContent.text : '';

      return NextResponse.json({ dialogue });
    }

    if (action === 'consistency-check') {
      // Check if text is consistent with character
      const { characterProfile, textToCheck } = data;
      
      if (!characterProfile || !textToCheck) {
        return NextResponse.json({ 
          error: 'Character profile and text required' 
        }, { status: 400 });
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Character Profile:
${JSON.stringify(characterProfile, null, 2)}

Text to check:
${textToCheck}

Analyze this text for character consistency. Return JSON:
{
  "overallScore": 1-10,
  "consistentElements": ["Things that match the character"],
  "inconsistencies": [
    {
      "issue": "Description of inconsistency",
      "line": "The problematic text",
      "suggestion": "How to fix it"
    }
  ],
  "voiceMatch": {
    "score": 1-10,
    "notes": "How well the voice matches"
  },
  "behaviorMatch": {
    "score": 1-10,
    "notes": "How well actions/reactions match"
  }
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

    // Default: Create/update character in database
    const validated = characterSchema.parse(data);
    
    // Store in book metadata (or create Character model)
    const currentMetadata = (book.metadata || {}) as { characters?: Record<string, unknown>[] };
    const characters = currentMetadata.characters || [];
    
    if (characterId) {
      // Update existing
      const index = characters.findIndex((c: { id?: string }) => c.id === characterId);
      if (index >= 0) {
        characters[index] = { ...characters[index], ...validated, updatedAt: new Date().toISOString() };
      }
    } else {
      // Create new
      characters.push({
        id: `char_${Date.now()}`,
        ...validated,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await prisma.book.update({
      where: { id: bookId },
      data: {
        metadata: { ...currentMetadata, characters }
      }
    });

    return NextResponse.json({ 
      success: true, 
      characters 
    });

  } catch (error) {
    console.error('Character API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Character operation failed' }, { status: 500 });
  }
}

// Get characters for a book
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

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

    const metadata = (book.metadata || {}) as { characters?: unknown[] };
    return NextResponse.json({ 
      characters: metadata.characters || [] 
    });

  } catch (error) {
    console.error('Get Characters error:', error);
    return NextResponse.json({ error: 'Failed to get characters' }, { status: 500 });
  }
}
