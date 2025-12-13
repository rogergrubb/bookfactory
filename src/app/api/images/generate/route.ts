// API Route: /api/images/generate
// Handles AI image generation requests

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

type ImageType = 
  | 'CHARACTER_PORTRAIT'
  | 'CHARACTER_FULL'
  | 'SCENE_ILLUSTRATION'
  | 'LOCATION'
  | 'ITEM'
  | 'COVER_CONCEPT'
  | 'MOOD_BOARD';

type ImageStyle = 
  | 'realistic'
  | 'artistic'
  | 'anime'
  | 'painterly'
  | 'fantasy'
  | 'noir';

interface GenerateRequest {
  bookId: string;
  characterId?: string;
  chapterId?: string;
  type: ImageType;
  style: ImageStyle;
  quality: 'standard' | 'hd';
  prompt?: string;
  characterName?: string;
  characterDescription?: string;
  sceneContent?: string;
  locationName?: string;
  genre?: string;
}

// Build prompt using Claude
async function buildOptimizedPrompt(request: GenerateRequest): Promise<string> {
  const contextParts: string[] = [];
  
  if (request.type === 'CHARACTER_PORTRAIT' || request.type === 'CHARACTER_FULL') {
    if (request.characterName) contextParts.push(`Character name: ${request.characterName}`);
    if (request.characterDescription) contextParts.push(`Description: ${request.characterDescription}`);
  } else if (request.type === 'SCENE_ILLUSTRATION') {
    if (request.sceneContent) contextParts.push(`Scene: ${request.sceneContent.slice(0, 1000)}`);
  } else if (request.type === 'LOCATION') {
    if (request.locationName) contextParts.push(`Location: ${request.locationName}`);
  }
  
  if (request.genre) contextParts.push(`Genre: ${request.genre}`);
  
  if (contextParts.length === 0) {
    return request.prompt || 'A detailed illustration';
  }
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Create a DALL-E 3 image prompt for:

Type: ${request.type.replace('_', ' ').toLowerCase()}
Style: ${request.style}
${contextParts.join('\n')}

Be specific and descriptive. Include lighting, composition, mood. Keep under 200 words. No NSFW. Respond with ONLY the prompt.`
    }]
  });
  
  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  
  return request.prompt || 'A detailed illustration';
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body: GenerateRequest = await request.json();
    const { bookId, characterId, chapterId, type, style, quality } = body;
    
    if (!bookId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify book ownership
    const book = await prisma.book.findFirst({
      where: { id: bookId, userId },
    });
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    
    // Build prompt
    const prompt = body.prompt || await buildOptimizedPrompt(body);
    
    // Note: DALL-E integration requires OpenAI API key
    // For now, return the prompt for manual generation
    // TODO: Add OpenAI integration when API key is available
    
    return NextResponse.json({
      id: `img-${Date.now()}`,
      prompt,
      type,
      style,
      message: 'Image prompt generated. OpenAI DALL-E integration pending.',
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Image generation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    
    // Return empty for now - images table may not exist yet
    return NextResponse.json({ images: [] });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
