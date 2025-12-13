// AI Image Generation Service
// Builds prompts for image generation

import { 
  ImageGenerationRequest, 
  ImageType, 
  ImageStyle,
  CHARACTER_STYLE_PRESETS,
  SCENE_STYLE_PRESETS,
} from './types';

// Build character portrait prompt
function buildCharacterPrompt(request: ImageGenerationRequest): string {
  const parts: string[] = [];
  
  if (request.characterDescription) {
    parts.push(request.characterDescription);
  }
  
  if (request.characterTraits && request.characterTraits.length > 0) {
    parts.push(`Character traits: ${request.characterTraits.join(', ')}`);
  }
  
  const stylePreset = request.type === 'CHARACTER_FULL' 
    ? CHARACTER_STYLE_PRESETS.fullBody 
    : CHARACTER_STYLE_PRESETS.portrait;
  
  parts.push(...stylePreset.positiveModifiers);
  
  if (request.style) {
    parts.push(`${request.style} style`);
  }
  
  return parts.join('. ');
}

// Build scene illustration prompt
function buildScenePrompt(request: ImageGenerationRequest): string {
  const parts: string[] = [];
  
  if (request.sceneDescription) {
    parts.push(request.sceneDescription);
  }
  
  if (request.mood) {
    parts.push(`Mood: ${request.mood}`);
  }
  
  if (request.timeOfDay) {
    parts.push(`Time: ${request.timeOfDay}`);
  }
  
  if (request.weather) {
    parts.push(`Weather: ${request.weather}`);
  }
  
  const stylePreset = SCENE_STYLE_PRESETS.cinematic;
  parts.push(...stylePreset.positiveModifiers);
  
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
export function getDimensions(aspectRatio?: string): { width: number; height: number } {
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

// Generate character portrait from character data
export function buildCharacterPortraitPrompt(character: {
  name: string;
  description?: string;
  traits?: string[];
  role?: string;
}, options?: {
  style?: ImageStyle;
  type?: 'portrait' | 'full';
}): string {
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
    aspectRatio: options?.type === 'full' ? '9:16' : '3:4',
  };
  
  return buildPrompt(request);
}

// Generate scene illustration prompt from scene/chapter data
export function buildSceneIllustrationPrompt(scene: {
  content: string;
  location?: string;
  mood?: string;
}, options?: {
  style?: ImageStyle;
}): string {
  const sceneDescription = scene.content.slice(0, 500);
  
  const request: ImageGenerationRequest = {
    type: 'SCENE_ILLUSTRATION',
    sceneDescription: `Scene: ${sceneDescription}${scene.location ? `. Location: ${scene.location}` : ''}`,
    mood: scene.mood,
    style: options?.style || 'cinematic',
    aspectRatio: '16:9',
  };
  
  return buildPrompt(request);
}
