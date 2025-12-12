'use client';

import React from 'react';
import { Sparkles, Loader2, Check, AlertCircle, PenTool, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GenerationProgress, GenerationPhase } from './hooks/useMicroInteractions';

interface GenerationProgressBarProps {
  progress: GenerationProgress;
  className?: string;
  showWordCount?: boolean;
}

const phaseConfig: Record<GenerationPhase, { icon: React.ElementType; color: string; bgColor: string }> = {
  idle: { icon: Sparkles, color: 'text-stone-500', bgColor: 'bg-stone-700' },
  thinking: { icon: Loader2, color: 'text-amber-400', bgColor: 'bg-amber-500' },
  writing: { icon: PenTool, color: 'text-teal-400', bgColor: 'bg-teal-500' },
  polishing: { icon: Wand2, color: 'text-purple-400', bgColor: 'bg-purple-500' },
  complete: { icon: Check, color: 'text-emerald-400', bgColor: 'bg-emerald-500' },
  error: { icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-500' },
};

export function GenerationProgressBar({ 
  progress, 
  className,
  showWordCount = true,
}: GenerationProgressBarProps) {
  const { phase, message, progress: progressValue, wordCount } = progress;
  const config = phaseConfig[phase];
  const Icon = config.icon;
  const isAnimating = phase === 'thinking' || phase === 'writing' || phase === 'polishing';

  if (phase === 'idle') return null;

  return (
    <div className={cn(
      'rounded-lg border overflow-hidden transition-all duration-300',
      phase === 'complete' ? 'border-emerald-500/30 bg-emerald-500/5' :
      phase === 'error' ? 'border-red-500/30 bg-red-500/5' :
      'border-stone-700 bg-stone-800/50',
      className
    )}>
      {/* Progress bar */}
      <div className="h-1 bg-stone-800 overflow-hidden">
        <div 
          className={cn(
            'h-full transition-all duration-300 ease-out',
            config.bgColor,
            isAnimating && 'animate-pulse'
          )}
          style={{ width: `${progressValue}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Icon */}
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          phase === 'complete' ? 'bg-emerald-500/20' :
          phase === 'error' ? 'bg-red-500/20' :
          'bg-stone-700'
        )}>
          <Icon className={cn(
            'w-4 h-4',
            config.color,
            phase === 'thinking' && 'animate-spin'
          )} />
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium transition-all duration-200',
            config.color
          )}>
            {message}
          </p>
          {isAnimating && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-stone-500">{Math.round(progressValue)}%</span>
              <div className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <span 
                    key={i}
                    className={cn(
                      'w-1 h-1 rounded-full bg-stone-600',
                      'animate-bounce'
                    )}
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Word count badge */}
        {phase === 'complete' && showWordCount && wordCount && (
          <div className="animate-in zoom-in-50 duration-300">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium">
              +{wordCount} words
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT INLINE PROGRESS
// ============================================================================

interface InlineProgressProps {
  progress: GenerationProgress;
  className?: string;
}

export function InlineProgress({ progress, className }: InlineProgressProps) {
  const { phase, message } = progress;
  const config = phaseConfig[phase];
  const Icon = config.icon;

  if (phase === 'idle') return null;

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200',
      phase === 'complete' ? 'bg-emerald-500/20' :
      phase === 'error' ? 'bg-red-500/20' :
      'bg-stone-800',
      className
    )}>
      <Icon className={cn(
        'w-3.5 h-3.5',
        config.color,
        phase === 'thinking' && 'animate-spin'
      )} />
      <span className={cn('text-xs font-medium', config.color)}>
        {message}
      </span>
    </div>
  );
}

// ============================================================================
// DRAMATIC FULL-SCREEN PROGRESS (for major operations)
// ============================================================================

interface FullScreenProgressProps {
  progress: GenerationProgress;
  isOpen: boolean;
  toolName?: string;
}

export function FullScreenProgress({ progress, isOpen, toolName }: FullScreenProgressProps) {
  const { phase, message, progress: progressValue } = progress;
  const config = phaseConfig[phase];
  const Icon = config.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
      <div className="text-center max-w-md px-8">
        {/* Animated icon */}
        <div className="relative mb-6">
          <div className={cn(
            'w-20 h-20 rounded-2xl mx-auto flex items-center justify-center',
            'bg-gradient-to-br from-stone-800 to-stone-900',
            'shadow-xl shadow-stone-950/50'
          )}>
            <Icon className={cn(
              'w-8 h-8',
              config.color,
              phase === 'thinking' && 'animate-spin',
              phase === 'writing' && 'animate-bounce',
              phase === 'complete' && 'animate-pulse'
            )} />
          </div>
          
          {/* Orbiting dots */}
          {(phase === 'thinking' || phase === 'writing') && (
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={cn(
                    'absolute w-2 h-2 rounded-full',
                    config.bgColor
                  )}
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 90}deg) translateX(50px) translateY(-50%)`,
                    opacity: 0.6 - i * 0.1,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tool name */}
        {toolName && (
          <p className="text-stone-500 text-sm mb-2">Running {toolName}</p>
        )}

        {/* Message */}
        <h3 className={cn(
          'text-xl font-medium mb-4 transition-all duration-300',
          config.color
        )}>
          {message}
        </h3>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-stone-800 rounded-full mx-auto overflow-hidden">
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              config.bgColor
            )}
            style={{ width: `${progressValue}%` }}
          />
        </div>
        <p className="text-stone-600 text-sm mt-2">{Math.round(progressValue)}%</p>
      </div>
    </div>
  );
}
