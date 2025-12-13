'use client';

import React, { useState, useCallback } from 'react';
import {
  Image as ImageIcon, Wand2, User, MapPin, Sparkles, BookOpen,
  Loader2, Download, RefreshCw, X, ChevronDown, Check, AlertCircle,
  Palette, Camera, Film, Paintbrush
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ImageType = 
  | 'CHARACTER_PORTRAIT'
  | 'CHARACTER_FULL'
  | 'SCENE_ILLUSTRATION'
  | 'LOCATION'
  | 'COVER_CONCEPT';

type ImageStyle = 
  | 'realistic'
  | 'artistic'
  | 'anime'
  | 'painterly'
  | 'fantasy'
  | 'noir';

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  type: ImageType;
  style: ImageStyle;
  createdAt: Date;
}

interface ImageGeneratorProps {
  bookId: string;
  characterId?: string;
  chapterId?: string;
  // Pre-fill data
  characterName?: string;
  characterDescription?: string;
  sceneContent?: string;
  locationName?: string;
  genre?: string;
  onImageGenerated?: (image: GeneratedImage) => void;
  onClose?: () => void;
}

const IMAGE_TYPES: { value: ImageType; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'CHARACTER_PORTRAIT', label: 'Character Portrait', icon: User, description: 'Face and shoulders' },
  { value: 'CHARACTER_FULL', label: 'Full Character', icon: User, description: 'Full body shot' },
  { value: 'SCENE_ILLUSTRATION', label: 'Scene', icon: Film, description: 'Illustrate a scene' },
  { value: 'LOCATION', label: 'Location', icon: MapPin, description: 'Setting or place' },
  { value: 'COVER_CONCEPT', label: 'Cover Concept', icon: BookOpen, description: 'Book cover idea' },
];

const IMAGE_STYLES: { value: ImageStyle; label: string; preview: string }[] = [
  { value: 'realistic', label: 'Realistic', preview: 'Photo-realistic rendering' },
  { value: 'artistic', label: 'Artistic', preview: 'Stylized illustration' },
  { value: 'painterly', label: 'Painterly', preview: 'Oil painting style' },
  { value: 'fantasy', label: 'Fantasy Art', preview: 'Epic fantasy style' },
  { value: 'anime', label: 'Anime', preview: 'Japanese anime style' },
  { value: 'noir', label: 'Noir', preview: 'Dark, moody atmosphere' },
];

export function ImageGenerator({
  bookId,
  characterId,
  chapterId,
  characterName,
  characterDescription,
  sceneContent,
  locationName,
  genre,
  onImageGenerated,
  onClose,
}: ImageGeneratorProps) {
  const [imageType, setImageType] = useState<ImageType>(
    characterId ? 'CHARACTER_PORTRAIT' : 
    chapterId ? 'SCENE_ILLUSTRATION' : 
    'CHARACTER_PORTRAIT'
  );
  const [style, setStyle] = useState<ImageStyle>('realistic');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);

  // Build auto-prompt based on context
  const buildAutoPrompt = useCallback(() => {
    const parts: string[] = [];
    
    if (imageType === 'CHARACTER_PORTRAIT' || imageType === 'CHARACTER_FULL') {
      if (characterName) parts.push(`Portrait of ${characterName}`);
      if (characterDescription) parts.push(characterDescription);
    } else if (imageType === 'SCENE_ILLUSTRATION') {
      if (sceneContent) parts.push(sceneContent.slice(0, 300));
    } else if (imageType === 'LOCATION') {
      if (locationName) parts.push(locationName);
    }
    
    if (genre) parts.push(`${genre} genre`);
    parts.push(`${style} style`);
    
    return parts.join('. ') || 'Detailed illustration';
  }, [imageType, characterName, characterDescription, sceneContent, locationName, genre, style]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          characterId,
          chapterId,
          type: imageType,
          style,
          quality,
          prompt: useCustomPrompt ? customPrompt : undefined,
          // Context for auto-prompt
          characterName,
          characterDescription,
          sceneContent: sceneContent?.slice(0, 1000),
          locationName,
          genre,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Generation failed');
      }
      
      const data = await response.json();
      
      const newImage: GeneratedImage = {
        id: data.id,
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        type: imageType,
        style,
        createdAt: new Date(),
      };
      
      setGeneratedImage(newImage);
      setRecentImages(prev => [newImage, ...prev].slice(0, 5));
      onImageGenerated?.(newImage);
    } catch (err) {
      console.error('Image generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage?.imageUrl) return;
    
    try {
      const response = await fetch(generatedImage.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${imageType.toLowerCase()}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Wand2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-100">AI Image Generator</h2>
              <p className="text-sm text-stone-400">Visualize your story</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Image Type Selection */}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-3">
            What do you want to generate?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {IMAGE_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => setImageType(type.value)}
                className={cn(
                  'p-3 rounded-lg border text-left transition-all',
                  imageType === type.value
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : 'border-stone-700 text-stone-400 hover:border-stone-600 hover:bg-stone-800'
                )}
              >
                <type.icon className="w-5 h-5 mb-1" />
                <div className="text-sm font-medium">{type.label}</div>
                <div className="text-xs opacity-70">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-3">
            Art Style
          </label>
          <div className="flex flex-wrap gap-2">
            {IMAGE_STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={cn(
                  'px-3 py-2 rounded-lg border text-sm transition-all',
                  style === s.value
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : 'border-stone-700 text-stone-400 hover:border-stone-600'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Selection */}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-3">
            Quality
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setQuality('standard')}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg border text-sm transition-all',
                quality === 'standard'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'border-stone-700 text-stone-400 hover:border-stone-600'
              )}
            >
              Standard
            </button>
            <button
              onClick={() => setQuality('hd')}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg border text-sm transition-all',
                quality === 'hd'
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'border-stone-700 text-stone-400 hover:border-stone-600'
              )}
            >
              HD (Higher detail)
            </button>
          </div>
        </div>

        {/* Prompt Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-stone-300">
              Prompt
            </label>
            <button
              onClick={() => setUseCustomPrompt(!useCustomPrompt)}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              {useCustomPrompt ? 'Use auto-generated' : 'Write custom prompt'}
            </button>
          </div>
          
          {useCustomPrompt ? (
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe what you want to see..."
              className="w-full h-24 px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-500 resize-none focus:outline-none focus:border-purple-500"
            />
          ) : (
            <div className="p-4 bg-stone-800/50 border border-stone-700 rounded-lg">
              <p className="text-sm text-stone-400 italic">
                {buildAutoPrompt() || 'Fill in context above to auto-generate prompt'}
              </p>
            </div>
          )}
        </div>

        {/* Context Preview */}
        {(characterName || sceneContent || locationName) && (
          <div className="p-3 bg-stone-800/30 rounded-lg border border-stone-700/50">
            <p className="text-xs text-stone-500 mb-1">Using context from:</p>
            <div className="flex flex-wrap gap-2">
              {characterName && (
                <span className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded text-xs">
                  Character: {characterName}
                </span>
              )}
              {sceneContent && (
                <span className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded text-xs">
                  Scene content
                </span>
              )}
              {locationName && (
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 rounded text-xs">
                  Location: {locationName}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-300 font-medium">Generation failed</p>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        )}

        {/* Generated Image Display */}
        {generatedImage && (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-stone-700">
              <img 
                src={generatedImage.imageUrl} 
                alt="Generated"
                className="w-full"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={handleDownload}
                  className="p-2 bg-stone-900/80 rounded-lg text-stone-300 hover:text-white hover:bg-stone-900"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-stone-500 italic">
              Prompt: {generatedImage.prompt.slice(0, 150)}...
            </p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={cn(
            'w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all',
            isGenerating
              ? 'bg-stone-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Image
            </>
          )}
        </button>

        {/* Recent Images */}
        {recentImages.length > 1 && (
          <div>
            <p className="text-xs text-stone-500 mb-2">Recent generations</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recentImages.slice(1).map(img => (
                <button
                  key={img.id}
                  onClick={() => setGeneratedImage(img)}
                  className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-stone-700 hover:border-purple-500 transition-colors"
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact button to trigger image generation
export function ImageGeneratorButton({
  onClick,
  label = 'Generate Image',
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors',
        className
      )}
    >
      <Wand2 className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </button>
  );
}
