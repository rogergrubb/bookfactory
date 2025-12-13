// AI Image Generation Types

export type ImageType = 
  | 'CHARACTER_PORTRAIT'
  | 'CHARACTER_FULL'
  | 'SCENE_ILLUSTRATION'
  | 'LOCATION'
  | 'ITEM'
  | 'COVER_CONCEPT'
  | 'MOOD_BOARD';

export type ImageStyle = 
  | 'realistic'
  | 'artistic'
  | 'anime'
  | 'painterly'
  | 'sketch'
  | 'fantasy'
  | 'noir'
  | 'vintage';

export type ImageStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface GeneratedImage {
  id: string;
  userId: string;
  bookId?: string;
  characterId?: string;
  chapterId?: string;
  sceneId?: string;
  type: ImageType;
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  model: string;
  style?: ImageStyle;
  quality: 'standard' | 'hd';
  metadata?: Record<string, unknown>;
  status: ImageStatus;
  errorMessage?: string;
  createdAt: Date;
}

export interface ImageGenerationRequest {
  type: ImageType;
  bookId?: string;
  characterId?: string;
  chapterId?: string;
  sceneId?: string;
  
  // For character portraits
  characterDescription?: string;
  characterTraits?: string[];
  
  // For scenes
  sceneDescription?: string;
  mood?: string;
  timeOfDay?: string;
  weather?: string;
  
  // For locations
  locationName?: string;
  locationDescription?: string;
  
  // Style options
  style?: ImageStyle;
  quality?: 'standard' | 'hd';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  
  // Custom prompt override
  customPrompt?: string;
  negativePrompt?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  image?: GeneratedImage;
  error?: string;
}

// Character visualization presets
export const CHARACTER_STYLE_PRESETS: Record<string, {
  positiveModifiers: string[];
  negativeModifiers: string[];
  aspectRatio: string;
}> = {
  portrait: {
    positiveModifiers: [
      'portrait photography',
      'professional headshot',
      'detailed face',
      'sharp focus',
      'good lighting'
    ],
    negativeModifiers: [
      'blurry',
      'distorted features',
      'extra limbs',
      'bad anatomy'
    ],
    aspectRatio: '3:4'
  },
  fullBody: {
    positiveModifiers: [
      'full body shot',
      'character design',
      'detailed clothing',
      'dynamic pose'
    ],
    negativeModifiers: [
      'cropped',
      'partial body',
      'bad proportions'
    ],
    aspectRatio: '9:16'
  },
  actionPose: {
    positiveModifiers: [
      'dynamic action pose',
      'motion blur',
      'dramatic lighting',
      'cinematic'
    ],
    negativeModifiers: [
      'static',
      'boring pose',
      'flat lighting'
    ],
    aspectRatio: '16:9'
  }
};

// Scene visualization presets
export const SCENE_STYLE_PRESETS: Record<string, {
  positiveModifiers: string[];
  negativeModifiers: string[];
}> = {
  cinematic: {
    positiveModifiers: [
      'cinematic composition',
      'dramatic lighting',
      'film still',
      'professional photography'
    ],
    negativeModifiers: [
      'amateur',
      'flat',
      'boring composition'
    ]
  },
  atmospheric: {
    positiveModifiers: [
      'atmospheric',
      'moody lighting',
      'environmental storytelling',
      'rich details'
    ],
    negativeModifiers: [
      'harsh lighting',
      'overexposed',
      'flat'
    ]
  },
  fantasyArt: {
    positiveModifiers: [
      'fantasy art',
      'magical atmosphere',
      'rich colors',
      'detailed background'
    ],
    negativeModifiers: [
      'modern elements',
      'anachronistic',
      'generic'
    ]
  }
};

// Genre-specific style mappings
export const GENRE_STYLE_MAP: Record<string, ImageStyle> = {
  'Fantasy': 'fantasy',
  'Science Fiction': 'artistic',
  'Romance': 'painterly',
  'Thriller': 'noir',
  'Historical Fiction': 'vintage',
  'Literary Fiction': 'artistic',
  'Horror': 'noir',
  'Mystery': 'noir',
  'Young Adult': 'artistic',
  'Children\'s': 'artistic'
};
