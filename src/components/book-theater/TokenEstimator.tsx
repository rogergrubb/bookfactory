'use client';

import React, { useMemo } from 'react';
import { Coins, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenEstimatorProps {
  toolId: string;
  subOptionId?: string;
  inputLength: number; // characters of input context
  className?: string;
}

// Token cost estimates per tool (approximate)
const TOOL_TOKEN_ESTIMATES: Record<string, { base: number; perChar: number; output: number }> = {
  // Generate tools - higher output
  'continue': { base: 100, perChar: 0.3, output: 400 },
  'firstdraft': { base: 150, perChar: 0.3, output: 600 },
  'dialogue': { base: 100, perChar: 0.25, output: 350 },
  'description': { base: 80, perChar: 0.25, output: 300 },
  'action': { base: 120, perChar: 0.3, output: 500 },
  'thoughts': { base: 100, perChar: 0.25, output: 350 },
  'opening': { base: 80, perChar: 0.2, output: 250 },
  'ending': { base: 80, perChar: 0.25, output: 300 },
  'transition': { base: 60, perChar: 0.2, output: 200 },
  'flashback': { base: 100, perChar: 0.3, output: 400 },
  'monologue': { base: 100, perChar: 0.25, output: 400 },
  'letter': { base: 80, perChar: 0.2, output: 300 },
  
  // Enhance tools - moderate output
  'expand': { base: 80, perChar: 0.35, output: 400 },
  'condense': { base: 60, perChar: 0.3, output: 200 },
  'rewrite': { base: 80, perChar: 0.35, output: 350 },
  'polish': { base: 60, perChar: 0.3, output: 300 },
  'strengthen-verbs': { base: 50, perChar: 0.25, output: 250 },
  'vary-sentences': { base: 50, perChar: 0.25, output: 250 },
  'fix-dialogue-tags': { base: 50, perChar: 0.25, output: 250 },
  'show-dont-tell': { base: 80, perChar: 0.35, output: 400 },
  'add-conflict': { base: 80, perChar: 0.3, output: 350 },
  'add-subtext': { base: 60, perChar: 0.25, output: 300 },
  'adjust-pov': { base: 60, perChar: 0.3, output: 300 },
  'adjust-tense': { base: 50, perChar: 0.25, output: 250 },
  'punch-up': { base: 60, perChar: 0.3, output: 300 },
  'smooth-transitions': { base: 50, perChar: 0.25, output: 200 },
  
  // Analyze tools - longer output
  'pacing': { base: 100, perChar: 0.4, output: 500 },
  'voice-check': { base: 100, perChar: 0.4, output: 450 },
  'tension-map': { base: 100, perChar: 0.4, output: 500 },
  'character-voice': { base: 80, perChar: 0.35, output: 400 },
  'repetition': { base: 80, perChar: 0.4, output: 450 },
  'adverb-hunter': { base: 60, perChar: 0.35, output: 350 },
  'passive-voice': { base: 60, perChar: 0.35, output: 350 },
  'readability': { base: 80, perChar: 0.35, output: 400 },
  'emotional-arc': { base: 100, perChar: 0.4, output: 500 },
  'chapter-summary': { base: 80, perChar: 0.4, output: 400 },
  'plot-holes': { base: 120, perChar: 0.45, output: 600 },
  'dialogue-analysis': { base: 80, perChar: 0.35, output: 400 },
  'show-tell-ratio': { base: 80, perChar: 0.4, output: 400 },
  'cliche-finder': { base: 80, perChar: 0.4, output: 450 },
  
  // Brainstorm tools - moderate output
  'plot-ideas': { base: 80, perChar: 0.25, output: 400 },
  'character-moments': { base: 80, perChar: 0.25, output: 350 },
  'dialogue-options': { base: 60, perChar: 0.3, output: 400 },
  'scene-transitions': { base: 60, perChar: 0.2, output: 300 },
  'conflict-escalation': { base: 80, perChar: 0.25, output: 400 },
  'twist-generator': { base: 100, perChar: 0.25, output: 500 },
  'what-if': { base: 80, perChar: 0.25, output: 400 },
  'stuck-help': { base: 80, perChar: 0.25, output: 400 },
  'names-generator': { base: 40, perChar: 0.1, output: 200 },
  'motivation-finder': { base: 80, perChar: 0.25, output: 400 },
  'theme-explorer': { base: 80, perChar: 0.3, output: 450 },
  'ending-ideas': { base: 80, perChar: 0.25, output: 400 },
  
  // World tools
  'characters': { base: 60, perChar: 0.2, output: 300 },
  'locations': { base: 60, perChar: 0.2, output: 300 },
  'plot-threads': { base: 80, perChar: 0.3, output: 400 },
  'timeline': { base: 80, perChar: 0.3, output: 400 },
  'scene-contexts': { base: 60, perChar: 0.2, output: 300 },
  'story-bible': { base: 100, perChar: 0.35, output: 500 },
  'magic-system': { base: 80, perChar: 0.25, output: 400 },
  'factions': { base: 80, perChar: 0.25, output: 400 },
  'items': { base: 60, perChar: 0.2, output: 300 },
  'research': { base: 60, perChar: 0.25, output: 350 },
};

// Length multipliers for sub-options
const LENGTH_MULTIPLIERS: Record<string, number> = {
  'short': 0.5,
  'medium': 1.0,
  'long': 1.8,
  'chapter-end': 2.5,
  'aggressive': 0.6,
  'light': 0.8,
  'detailed': 1.5,
  'all': 1.2,
};

// Cost per 1000 tokens (Claude Sonnet pricing approximation)
const COST_PER_1K_INPUT = 0.003;
const COST_PER_1K_OUTPUT = 0.015;

export function TokenEstimator({ toolId, subOptionId, inputLength, className }: TokenEstimatorProps) {
  const estimate = useMemo(() => {
    const toolConfig = TOOL_TOKEN_ESTIMATES[toolId] || { base: 80, perChar: 0.25, output: 300 };
    const lengthMultiplier = subOptionId ? (LENGTH_MULTIPLIERS[subOptionId] || 1.0) : 1.0;
    
    // Estimate input tokens (roughly 4 chars per token)
    const inputTokens = Math.ceil(toolConfig.base + (inputLength * toolConfig.perChar / 4));
    
    // Estimate output tokens with length multiplier
    const outputTokens = Math.ceil(toolConfig.output * lengthMultiplier);
    
    const totalTokens = inputTokens + outputTokens;
    
    // Calculate cost
    const inputCost = (inputTokens / 1000) * COST_PER_1K_INPUT;
    const outputCost = (outputTokens / 1000) * COST_PER_1K_OUTPUT;
    const totalCost = inputCost + outputCost;
    
    return {
      inputTokens,
      outputTokens,
      totalTokens,
      totalCost,
      isHighCost: totalCost > 0.05,
    };
  }, [toolId, subOptionId, inputLength]);

  const formatCost = (cost: number) => {
    if (cost < 0.01) return '<$0.01';
    return `$${cost.toFixed(3)}`;
  };

  return (
    <div className={cn(
      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs',
      estimate.isHighCost 
        ? 'bg-amber-500/10 border border-amber-500/30' 
        : 'bg-stone-800/50 border border-stone-700/50',
      className
    )}>
      <div className="flex items-center gap-1.5">
        <Coins className={cn(
          'w-3.5 h-3.5',
          estimate.isHighCost ? 'text-amber-400' : 'text-stone-400'
        )} />
        <span className={cn(
          'font-medium',
          estimate.isHighCost ? 'text-amber-300' : 'text-stone-300'
        )}>
          ~{estimate.totalTokens.toLocaleString()} tokens
        </span>
      </div>
      
      <div className="w-px h-4 bg-stone-700" />
      
      <div className="flex items-center gap-1.5">
        <span className={cn(
          'font-mono',
          estimate.isHighCost ? 'text-amber-300' : 'text-emerald-400'
        )}>
          {formatCost(estimate.totalCost)}
        </span>
      </div>

      {estimate.isHighCost && (
        <>
          <div className="w-px h-4 bg-stone-700" />
          <div className="flex items-center gap-1 text-amber-400">
            <AlertCircle className="w-3 h-3" />
            <span>Higher cost</span>
          </div>
        </>
      )}
      
      <div className="ml-auto text-stone-500 flex items-center gap-1">
        <Zap className="w-3 h-3" />
        <span>Est. cost</span>
      </div>
    </div>
  );
}

// Compact inline version for tool buttons
export function TokenEstimatorInline({ toolId, inputLength }: { toolId: string; inputLength: number }) {
  const toolConfig = TOOL_TOKEN_ESTIMATES[toolId] || { base: 80, perChar: 0.25, output: 300 };
  const inputTokens = Math.ceil(toolConfig.base + (inputLength * toolConfig.perChar / 4));
  const outputTokens = toolConfig.output;
  const totalTokens = inputTokens + outputTokens;
  const totalCost = ((inputTokens / 1000) * COST_PER_1K_INPUT) + ((outputTokens / 1000) * COST_PER_1K_OUTPUT);
  
  return (
    <span className="text-[10px] text-stone-500 font-mono">
      ~{totalTokens < 1000 ? totalTokens : `${(totalTokens/1000).toFixed(1)}k`}
    </span>
  );
}
