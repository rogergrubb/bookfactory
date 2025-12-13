// API Route: /api/images/generate
// Handles AI image generation requests

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  // Context for auto-prompt
  characterName?: string;
  characterDescription?: string;
  sceneContent?: string;
  locationName?: string;
  genre?: string;
}

// Use Claude to build an optimized prompt
async function buildOptimizedPrompt(request: GenerateRequest): Promise<string> {
  const contextParts: string[] = [];
  
  // Gather context
  if (request.type === 'CHARACTER_PORTRAIT' || request.type === 'CHARACTER_FULL') {
    if (request.characterName) contextParts.push(`Character name: ${request.characterName}`);
    if (request.characterDescription) contextParts.push(`Description: ${request.characterDescription}`);
  } else if (request.type === 'SCENE_ILLUSTRATION') {
    if (request.sceneContent) contextParts.push(`Scene: ${request.sceneContent.slice(0, 1000)}`);
  } else if (request.type === 'LOCATION') {
    if (request.locationName) contextParts.push(`Location: ${request.locationName}`);
  }
  
  if (request.genre) contextParts.push(`Genre: ${request.genre}`);
  
  // If no context, use provided prompt or default
  if (contextParts.length === 0) {
    return request.prompt || 'A detailed illustration';
  }
  
  // Use Claude to optimize the prompt
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `You are an expert at creating DALL-E 3 image generation prompts. Create a detailed, vivid prompt for the following:

Type: ${request.type.replace('_', ' ').toLowerCase()}
Style: ${request.style}
${contextParts.join('\n')}

Requirements:
1. Be specific and descriptive
2. Include lighting, composition, and mood
3. Match the ${request.style} style
4. Keep it under 200 words
5. Avoid any NSFW content
6. Don't include text or words in the image

Respond with ONLY the prompt, no explanation or quotes.`
    }]
  });
  
  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  
  return request.prompt || 'A detailed illustration';
}

// Get DALL-E size based on image type
function getImageSize(type: ImageType): '1024x1024' | '1792x1024' | '1024x1792' {
  switch (type) {
    case 'CHARACTER_PORTRAIT':
      return '1024x1024';
    case 'CHARACTER_FULL':
      return '1024x1792';
    case 'SCENE_ILLUSTRATION':
      return '1792x1024';
    case 'LOCATION':
      return '1792x1024';
    case 'COVER_CONCEPT':
      return '1024x1792';
    default:
      return '1024x1024';
  }
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
    
    // Build optimized prompt
    const prompt = body.prompt || await buildOptimizedPrompt(body);
    
    // Generate image with DALL-E 3
    const size = getImageSize(type);
    
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size,
      quality: quality === 'hd' ? 'hd' : 'standard',
      style: style === 'realistic' ? 'natural' : 'vivid',
    });
    
    const imageUrl = imageResponse.data[0]?.url;
    const revisedPrompt = imageResponse.data[0]?.revised_prompt;
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }
    
    // Parse dimensions from size
    const [width, height] = size.split('x').map(Number);
    
    // Save to database
    const savedImage = await prisma.generatedImage.create({
      data: {
        userId,
        bookId,
        characterId,
        chapterId,
        type,
        prompt: revisedPrompt || prompt,
        imageUrl,
        width,
        height,
        model: 'dall-e-3',
        style,
        quality,
        status: 'COMPLETED',
      },
    });
    
    // If this is a character portrait, update the character's imageUrl
    if (characterId && (type === 'CHARACTER_PORTRAIT' || type === 'CHARACTER_FULL')) {
      await prisma.character.update({
        where: { id: characterId },
        data: { imageUrl },
      });
    }
    
    return NextResponse.json({
      id: savedImage.id,
      imageUrl,
      prompt: revisedPrompt || prompt,
      type,
      style,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    
    // Handle OpenAI specific errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 400) {
        return NextResponse.json(
          { error: 'Invalid prompt. Please try a different description.' },
          { status: 400 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limited. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Image generation failed' },
      { status: 500 }
    );
  }
}

// GET - List generated images for a book
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const characterId = searchParams.get('characterId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const where: any = { userId };
    if (bookId) where.bookId = bookId;
    if (characterId) where.characterId = characterId;
    if (type) where.type = type;
    
    const images = await prisma.generatedImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
