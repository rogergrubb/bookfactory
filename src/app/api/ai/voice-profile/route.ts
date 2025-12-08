import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/db';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Analyze writing sample to extract voice profile
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, sample, bookId } = await req.json();

    if (action === 'analyze') {
      // Analyze a writing sample to create/update voice profile
      if (!sample || sample.length < 500) {
        return NextResponse.json({ 
          error: 'Please provide at least 500 characters of your writing to analyze.' 
        }, { status: 400 });
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are an expert literary analyst specializing in identifying unique authorial voice. Analyze the writing sample and extract a detailed voice profile that can be used to generate text matching this author's style.

Your analysis must be specific and actionable, not generic. Focus on what makes THIS writer unique.`,
        messages: [{
          role: 'user',
          content: `Analyze this writing sample and create a detailed voice profile:

${sample}

Provide a JSON response with this exact structure:
{
  "sentenceStructure": {
    "averageLength": "short/medium/long/varied",
    "complexity": "simple/compound/complex/mixed",
    "patterns": ["specific patterns you noticed"]
  },
  "vocabulary": {
    "level": "accessible/moderate/sophisticated/literary",
    "preferences": ["words or word types they favor"],
    "avoidances": ["words or constructions they avoid"],
    "uniqueTerms": ["distinctive word choices"]
  },
  "rhythm": {
    "pacing": "quick/measured/flowing/staccato",
    "paragraphLength": "short/medium/long/varied",
    "punctuationStyle": "minimal/standard/expressive"
  },
  "tone": {
    "overall": "description of overall tone",
    "emotionalRange": ["emotions commonly expressed"],
    "formality": "casual/conversational/formal/literary"
  },
  "narrativeStyle": {
    "pov": "first/second/third-limited/third-omniscient/mixed",
    "tense": "past/present/mixed",
    "showVsTell": "showing-heavy/balanced/telling-heavy",
    "dialogueStyle": "sparse/moderate/dialogue-heavy"
  },
  "distinctiveFeatures": [
    "List 5-7 specific, unique characteristics of this writing"
  ],
  "stylePrompt": "A 2-3 sentence instruction that could guide AI to write in this voice"
}`
        }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      const analysisText = textContent?.type === 'text' ? textContent.text : '';
      
      // Extract JSON from response
      let voiceProfile;
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          voiceProfile = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // If JSON parsing fails, return the raw analysis
        return NextResponse.json({ 
          profile: null, 
          rawAnalysis: analysisText,
          message: 'Analysis complete but could not structure the profile. Please try again.'
        });
      }

      // Store the voice profile in user settings or book metadata
      if (bookId) {
        await prisma.book.update({
          where: { id: bookId },
          data: {
            metadata: {
              voiceProfile,
              voiceProfileUpdatedAt: new Date().toISOString(),
            }
          }
        });
      }

      return NextResponse.json({
        profile: voiceProfile,
        message: 'Voice profile created successfully'
      });
    }

    if (action === 'generate') {
      // Generate text using stored voice profile
      const { prompt, voiceProfile: providedProfile } = await req.json();
      
      let profile = providedProfile;
      
      // If no profile provided but bookId exists, try to get from book
      if (!profile && bookId) {
        const book = await prisma.book.findUnique({
          where: { id: bookId },
          select: { metadata: true }
        });
        const metadata = book?.metadata as { voiceProfile?: unknown } | null;
        profile = metadata?.voiceProfile;
      }

      if (!profile) {
        return NextResponse.json({ 
          error: 'No voice profile found. Please analyze a writing sample first.' 
        }, { status: 400 });
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are a ghostwriter who has deeply studied and can perfectly replicate a specific author's voice. 

Voice Profile to match:
${JSON.stringify(profile, null, 2)}

Key instruction: ${profile.stylePrompt || 'Match this voice precisely.'}

Write in this exact voice. Do not explain or comment—just write the requested content as if you ARE this author.`,
        messages: [{
          role: 'user',
          content: prompt
        }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      const generatedText = textContent?.type === 'text' ? textContent.text : '';

      return NextResponse.json({
        content: generatedText,
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || 0
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Voice Profile API error:', error);
    return NextResponse.json({ error: 'Voice profile operation failed' }, { status: 500 });
  }
}

// Get stored voice profile
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    if (bookId) {
      const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: { metadata: true }
      });
      const metadata = book?.metadata as { voiceProfile?: unknown; voiceProfileUpdatedAt?: string } | null;
      return NextResponse.json({
        profile: metadata?.voiceProfile || null,
        updatedAt: metadata?.voiceProfileUpdatedAt || null
      });
    }

    return NextResponse.json({ profile: null });

  } catch (error) {
    console.error('Get Voice Profile error:', error);
    return NextResponse.json({ error: 'Failed to get voice profile' }, { status: 500 });
  }
}
