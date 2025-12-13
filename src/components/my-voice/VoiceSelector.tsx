'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic, Plus, Check, ChevronDown, User, Sparkles,
  Clock, TrendingUp, Settings, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceOption {
  id: string;
  name: string;
  description?: string;
  wordCount: number;
  confidence: number;
  timesUsed: number;
  lastUsedAt?: Date;
  isDefault?: boolean;
}

interface VoiceSelectorProps {
  voices: VoiceOption[];
  selectedVoiceId: string | null;
  onSelectVoice: (voiceId: string | null) => void;
  onCreateNew: () => void;
  onManageVoices?: () => void;
  compact?: boolean;
  className?: string;
}

export function VoiceSelector({
  voices,
  selectedVoiceId,
  onSelectVoice,
  onCreateNew,
  onManageVoices,
  compact = false,
  className
}: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedVoice = voices.find(v => v.id === selectedVoiceId);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-voice-selector]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const VoiceDropdown = () => (
    <div className="absolute top-full left-0 mt-1 w-72 bg-stone-900 border border-stone-800 rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="p-2 border-b border-stone-800">
        <p className="text-xs text-stone-500 px-2">My Voices</p>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {/* No voice option */}
        <button
          onClick={() => {
            onSelectVoice(null);
            setIsOpen(false);
          }}
          className={cn(
            'w-full px-3 py-2.5 flex items-center gap-3 hover:bg-stone-800/50 transition-colors',
            !selectedVoiceId && 'bg-stone-800/30'
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center">
            <User className="w-4 h-4 text-stone-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm text-stone-300">No Voice Profile</p>
            <p className="text-xs text-stone-500">Use default AI style</p>
          </div>
          {!selectedVoiceId && (
            <Check className="w-4 h-4 text-violet-400" />
          )}
        </button>

        {/* Voice options */}
        {voices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => {
              onSelectVoice(voice.id);
              setIsOpen(false);
            }}
            className={cn(
              'w-full px-3 py-2.5 flex items-center gap-3 hover:bg-stone-800/50 transition-colors',
              selectedVoiceId === voice.id && 'bg-violet-500/10'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              selectedVoiceId === voice.id
                ? 'bg-violet-500/20 border border-violet-500/30'
                : 'bg-stone-800'
            )}>
              <Mic className={cn(
                'w-4 h-4',
                selectedVoiceId === voice.id ? 'text-violet-400' : 'text-stone-500'
              )} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm text-stone-200 truncate">{voice.name}</p>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>{voice.confidence}% match</span>
                <span>•</span>
                <span>{voice.timesUsed} uses</span>
              </div>
            </div>
            {selectedVoiceId === voice.id && (
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
            )}
          </button>
        ))}
      </div>

      <div className="p-2 border-t border-stone-800 space-y-1">
        <button
          onClick={() => {
            onCreateNew();
            setIsOpen(false);
          }}
          className="w-full px-3 py-2 flex items-center gap-2 text-sm text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Train New Voice
        </button>
        
        {onManageVoices && (
          <button
            onClick={() => {
              onManageVoices();
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 flex items-center gap-2 text-sm text-stone-400 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Manage Voices
          </button>
        )}
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className={cn('relative', className)} data-voice-selector>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
            selectedVoice
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600'
          )}
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="max-w-24 truncate">
            {selectedVoice ? selectedVoice.name : 'No Voice'}
          </span>
          <ChevronDown className={cn(
            'w-3.5 h-3.5 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </button>

        {isOpen && <VoiceDropdown />}
      </div>
    );
  }

  // Full version
  return (
    <div className={cn('space-y-4', className)} data-voice-selector>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-stone-300 flex items-center gap-2">
          <Mic className="w-4 h-4 text-violet-400" />
          Writing Voice
        </label>
        {voices.length > 0 && (
          <button
            onClick={onCreateNew}
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        )}
      </div>

      {voices.length === 0 ? (
        // Empty state
        <div className="p-6 rounded-xl border border-dashed border-stone-700 text-center">
          <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
            <Mic className="w-6 h-6 text-violet-400" />
          </div>
          <h4 className="text-sm font-medium text-stone-200 mb-1">No Voice Profiles Yet</h4>
          <p className="text-xs text-stone-500 mb-4">
            Train AI on your writing to match your unique style
          </p>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
          >
            Train Your Voice
          </button>
        </div>
      ) : (
        // Voice selection
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'w-full p-4 rounded-xl border transition-colors flex items-center gap-4',
              selectedVoice
                ? 'bg-violet-500/10 border-violet-500/30 hover:border-violet-500/50'
                : 'bg-stone-800/50 border-stone-700 hover:border-stone-600'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              selectedVoice
                ? 'bg-violet-500/20'
                : 'bg-stone-700'
            )}>
              <Mic className={cn(
                'w-5 h-5',
                selectedVoice ? 'text-violet-400' : 'text-stone-500'
              )} />
            </div>
            
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-stone-200">
                {selectedVoice ? selectedVoice.name : 'No Voice Selected'}
              </p>
              {selectedVoice ? (
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {selectedVoice.confidence}% match
                  </span>
                  <span>•</span>
                  <span>{selectedVoice.wordCount.toLocaleString()} words trained</span>
                </div>
              ) : (
                <p className="text-xs text-stone-500">Using default AI style</p>
              )}
            </div>

            <ChevronDown className={cn(
              'w-5 h-5 text-stone-500 transition-transform',
              isOpen && 'rotate-180'
            )} />
          </button>

          {isOpen && <VoiceDropdown />}
        </div>
      )}

      {/* Quick tip */}
      {selectedVoice && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-stone-800/30 border border-stone-700/50">
          <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-stone-400">
            AI will match your {selectedVoice.name} style for all generated content. 
            Adjust intensity in generation settings.
          </p>
        </div>
      )}
    </div>
  );
}

// Voice intensity slider for fine-tuning
interface VoiceIntensityProps {
  intensity: 'subtle' | 'balanced' | 'strong';
  onChange: (intensity: 'subtle' | 'balanced' | 'strong') => void;
  className?: string;
}

export function VoiceIntensity({
  intensity,
  onChange,
  className
}: VoiceIntensityProps) {
  const options: { value: 'subtle' | 'balanced' | 'strong'; label: string; description: string }[] = [
    { value: 'subtle', label: 'Subtle', description: 'Light touch, more AI creativity' },
    { value: 'balanced', label: 'Balanced', description: 'Best of both styles' },
    { value: 'strong', label: 'Strong', description: 'Closely match your voice' },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-xs font-medium text-stone-400">Voice Intensity</label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
              intensity === option.value
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600'
            )}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
