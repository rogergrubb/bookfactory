'use client';

import React from 'react';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenEstimatorProps {
  toolId: string;
  subOptionId?: string;
  inputLength: number;
  className?: string;
  variant?: 'full' | 'compact';
}

// Estimates based on typical generation lengths
const toolEstimates: Record<string, { baseOutput: number; perCharInput: number; description: string }> = {
  // Generate tools - create new content
  'continue': { baseOutput: 400, perCharInput: 0.1, description: 'Continues your story' },
  'first-draft': { baseOutput: 600, perCharInput: 0.05, description: 'Creates initial prose' },
  'dialogue': { baseOutput: 350, perCharInput: 0.1, description: 'Generates conversation' },
  'description': { baseOutput: 300, perCharInput: 0.1, description: 'Adds vivid details' },
  'action': { baseOutput: 350, perCharInput: 0.1, description: 'Creates dynamic scenes' },
  'thoughts': { baseOutput: 300, perCharInput: 0.1, description: 'Reveals inner voice' },
  
  // Enhance tools - modify existing content
  'expand': { baseOutput: 400, perCharInput: 0.2, description: 'Adds depth and detail' },
  'condense': { baseOutput: 200, perCharInput: 0.15, description: 'Tightens prose' },
  'rewrite': { baseOutput: 350, perCharInput: 0.2, description: 'Fresh perspective' },
  'polish': { baseOutput: 300, perCharInput: 0.2, description: 'Refines language' },
  
  // Analyze tools - examine content
  'pacing': { baseOutput: 500, perCharInput: 0.1, description: 'Evaluates rhythm' },
  'voice-check': { baseOutput: 450, perCharInput: 0.1, description: 'Consistency check' },
  'tension-map': { baseOutput: 500, perCharInput: 0.1, description: 'Analyzes stakes' },
  
  // Brainstorm tools - generate ideas
  'plot-ideas': { baseOutput: 400, perCharInput: 0.05, description: 'Story directions' },
  'character-moments': { baseOutput: 350, perCharInput: 0.05, description: 'Character beats' },
  'twist-generator': { baseOutput: 400, perCharInput: 0.05, description: 'Surprise elements' },
  
  // World tools
  'setting-builder': { baseOutput: 450, perCharInput: 0.05, description: 'Location details' },
  'culture-creator': { baseOutput: 500, perCharInput: 0.05, description: 'Society elements' },
};

// Length multipliers for sub-options
const lengthMultipliers: Record<string, number> = {
  'short': 0.5,
  'brief': 0.5,
  'medium': 1.0,
  'standard': 1.0,
  'long': 1.8,
  'detailed': 1.8,
  'extended': 2.0,
  'comprehensive': 2.0,
};

export function TokenEstimator({ 
  toolId, 
  subOptionId, 
  inputLength, 
  className,
  variant = 'full'
}: TokenEstimatorProps) {
  const estimate = toolEstimates[toolId] || { baseOutput: 400, perCharInput: 0.1, description: 'AI generation' };
  
  // Get length multiplier from sub-option
  const multiplier = subOptionId 
    ? lengthMultipliers[subOptionId.toLowerCase()] || 1.0 
    : 1.0;

  // Calculate estimated output
  const estimatedOutput = Math.round(estimate.baseOutput * multiplier);
  
  // Estimate processing time (rough: 50 tokens/second)
  const estimatedSeconds = Math.max(2, Math.round(estimatedOutput / 50));

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-stone-400', className)}>
        <Clock className="w-3 h-3" />
        <span>~{estimatedSeconds}s</span>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-3 px-3 py-2 rounded-lg bg-stone-800/50 border border-stone-700/50',
      className
    )}>
      <div className="flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs text-stone-300">{estimate.description}</span>
      </div>
      
      <div className="flex items-center gap-3 ml-auto text-xs">
        <div className="flex items-center gap-1 text-stone-400">
          <TrendingUp className="w-3 h-3" />
          <span>~{estimatedOutput} words</span>
        </div>
        <div className="flex items-center gap-1 text-stone-500">
          <Clock className="w-3 h-3" />
          <span>~{estimatedSeconds}s</span>
        </div>
      </div>
    </div>
  );
}

// Session usage badge - shows activity this session
export function SessionUsageBadge({ 
  generationCount, 
  wordsGenerated,
  className 
}: { 
  generationCount: number;
  wordsGenerated: number;
  className?: string;
}) {
  if (generationCount === 0) return null;

  return (
    <div className={cn(
      'flex items-center gap-2 px-2 py-1 rounded-lg bg-stone-800/50 text-xs',
      className
    )}>
      <Zap className="w-3 h-3 text-emerald-400" />
      <span className="text-stone-400">
        {generationCount} generation{generationCount !== 1 ? 's' : ''} 
      </span>
      <span className="text-stone-600">•</span>
      <span className="text-stone-400">
        {wordsGenerated.toLocaleString()} words
      </span>
    </div>
  );
}
