// AI Image Generation Service
// Builds prompts and generates images via OpenAI DALL-E

import OpenAI from 'openai';
import { 
  ImageGenerationRequest, 
  ImageType, 
  ImageStyle,
  CHARACTER_STYLE_PRESETS,
  SCENE_STYLE_PRESETS,
  GENRE_STYLE_MAP
} from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Build character portrait prompt
function buildCharacterPrompt(request: ImageGenerationRequest): string {
  const parts: string[] = [];
  
  // Base description
  if (request.characterDescription) {
    parts.push(request.characterDescription);
  }
  
  // Traits
  if (request.characterTraits && request.characterTraits.length > 0) {
    parts.push(`Character traits: ${request.characterTraits.join(', ')}`);
  }
  
  // Style modifiers
  const stylePreset = request.type === 'CHARACTER_FULL' 
    ? CHARACTER_STYLE_PRESETS.fullBody 
    : CHARACTER_STYLE_PRESETS.portrait;
  
  parts.push(...stylePreset.positiveModifiers);
  
  // Style
  if (request.style) {
    parts.push(`${request.style} style`);
  }
  
  return parts.join('. ');
}

// Build scene illustration prompt
function buildScenePrompt(request: ImageGenerationRequest): string {
  const parts: string[] = [];
  
  // Scene description
  if (request.sceneDescription) {
    parts.push(request.sceneDescription);
  }
  
  // Mood
  if (request.mood) {
    parts.push(`Mood: ${request.mood}`);
  }
  
  // Time of day
  if (request.timeOfDay) {
    parts.push(`Time: ${request.timeOfDay}`);
  }
  
  // Weather
  if (request.weather) {
    parts.push(`Weather: ${request.weather}`);
  }
  
  // Style modifiers
  const stylePreset = SCENE_STYLE_PRESETS.cinematic;
  parts.push(...stylePreset.positiveModifiers);
  
  // Style
  if (request.style) {
    parts.push(`${request.style} style`);
  }
  
  return parts.join('. ');
}

// Build location prompt
function buildLocationPrompt(request: ImageGenerationRequest): string {
  const parts: string[] = [];
  
  if (request.locationName) {
    parts.push(request.locationName);
  }
  
  if (request.locationDescription) {
    parts.push(request.locationDescription);
  }
  
  parts.push('detailed environment', 'establishing shot', 'cinematic composition');
  
  if (request.style) {
    parts.push(`${request.style} style`);
  }
  
  return parts.join('. ');
}

// Build prompt based on type
export function buildPrompt(request: ImageGenerationRequest): string {
  // Custom prompt override
  if (request.customPrompt) {
    return request.customPrompt;
  }
  
  switch (request.type) {
    case 'CHARACTER_PORTRAIT':
    case 'CHARACTER_FULL':
      return buildCharacterPrompt(request);
    
    case 'SCENE_ILLUSTRATION':
      return buildScenePrompt(request);
    
    case 'LOCATION':
      return buildLocationPrompt(request);
    
    case 'ITEM':
      return `Detailed illustration of: ${request.customPrompt || 'magical item'}. Product photography style, detailed, high quality`;
    
    case 'COVER_CONCEPT':
      return `Book cover concept: ${request.sceneDescription || request.customPrompt}. Professional book cover design, compelling composition, ${request.style || 'artistic'} style`;
    
    case 'MOOD_BOARD':
      return `Mood board collage: ${request.mood || request.customPrompt}. Atmospheric, evocative, ${request.style || 'artistic'} style`;
    
    default:
      return request.customPrompt || 'detailed illustration';
  }
}

// Get dimensions based on aspect ratio
function getDimensions(aspectRatio?: string): { width: number; height: number } {
  switch (aspectRatio) {
    case '1:1':
      return { width: 1024, height: 1024 };
    case '16:9':
      return { width: 1792, height: 1024 };
    case '9:16':
      return { width: 1024, height: 1792 };
    case '4:3':
      return { width: 1024, height: 768 };
    case '3:4':
      return { width: 768, height: 1024 };
    default:
      return { width: 1024, height: 1024 };
  }
}

// Get DALL-E size string
function getDalleSize(aspectRatio?: string): '1024x1024' | '1792x1024' | '1024x1792' {
  switch (aspectRatio) {
    case '16:9':
    case '4:3':
      return '1792x1024';
    case '9:16':
    case '3:4':
      return '1024x1792';
    default:
      return '1024x1024';
  }
}

// Main generation function
export async function generateImage(request: ImageGenerationRequest): Promise<{
  success: boolean;
  imageUrl?: string;
  prompt?: string;
  error?: string;
}> {
  try {
    const prompt = buildPrompt(request);
    const size = getDalleSize(request.aspectRatio);
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size,
      quality: request.quality === 'hd' ? 'hd' : 'standard',
      style: request.style === 'realistic' ? 'natural' : 'vivid',
    });
    
    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      return { success: false, error: 'No image URL returned' };
    }
    
    return {
      success: true,
      imageUrl,
      prompt,
    };
  } catch (error) {
    console.error('Image generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Generate character portrait from character data
export async function generateCharacterPortrait(character: {
  name: string;
  description?: string;
  traits?: string[];
  role?: string;
}, options?: {
  style?: ImageStyle;
  type?: 'portrait' | 'full';
  quality?: 'standard' | 'hd';
}): Promise<{
  success: boolean;
  imageUrl?: string;
  prompt?: string;
  error?: string;
}> {
  // Build rich description
  const descriptionParts: string[] = [];
  
  descriptionParts.push(`Portrait of ${character.name}`);
  
  if (character.role) {
    descriptionParts.push(`a ${character.role}`);
  }
  
  if (character.description) {
    descriptionParts.push(character.description);
  }
  
  const request: ImageGenerationRequest = {
    type: options?.type === 'full' ? 'CHARACTER_FULL' : 'CHARACTER_PORTRAIT',
    characterDescription: descriptionParts.join(', '),
    characterTraits: character.traits,
    style: options?.style || 'realistic',
    quality: options?.quality || 'standard',
    aspectRatio: options?.type === 'full' ? '9:16' : '3:4',
  };
  
  return generateImage(request);
}

// Generate scene illustration from scene/chapter data
export async function generateSceneIllustration(scene: {
  content: string;
  location?: string;
  characters?: string[];
  mood?: string;
}, options?: {
  style?: ImageStyle;
  quality?: 'standard' | 'hd';
}): Promise<{
  success: boolean;
  imageUrl?: string;
  prompt?: string;
  error?: string;
}> {
  // Extract key visual elements from scene content
  // This is a simplified version - in production, use AI to analyze
  const sceneDescription = scene.content.slice(0, 500);
  
  const request: ImageGenerationRequest = {
    type: 'SCENE_ILLUSTRATION',
    sceneDescription: `Scene: ${sceneDescription}${scene.location ? `. Location: ${scene.location}` : ''}`,
    mood: scene.mood,
    style: options?.style || 'cinematic',
    quality: options?.quality || 'standard',
    aspectRatio: '16:9',
  };
  
  return generateImage(request);
}

// Use AI to analyze text and generate appropriate prompt
export async function analyzeAndGeneratePrompt(
  text: string,
  type: ImageType,
  genre?: string
): Promise<string> {
  // Use Claude to analyze the text and generate an image prompt
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const anthropic = new Anthropic();
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are an expert at creating image generation prompts. Analyze the following text and create a detailed, vivid prompt for generating a ${type.toLowerCase().replace('_', ' ')} image.

Text to analyze:
${text.slice(0, 2000)}

${genre ? `Genre: ${genre}` : ''}

Create a prompt that:
1. Captures the visual essence of the text
2. Includes specific details about appearance, lighting, mood
3. Is suitable for DALL-E 3
4. Avoids any NSFW or violent content

Respond with ONLY the prompt, no explanation.`
    }]
  });
  
  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  
  return 'Detailed illustration';
}
