'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Check, RefreshCw, Replace, ArrowRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AITool } from '@/components/ai-studio/tool-definitions';

interface ToolPanelProps {
  tool: AITool;
  content: string;
  selection: { start: number; end: number; text: string } | null;
  onClose: () => void;
  onResult: (result: string, mode: 'insert' | 'replace' | 'append') => void;
}

export function ToolPanel({ tool, content, selection, onClose, onResult }: ToolPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Tool options state
  const [options, setOptions] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    tool.options?.forEach(opt => {
      initial[opt.id] = opt.default;
    });
    return initial;
  });

  // Get context for the AI
  const getContext = useCallback(() => {
    if (tool.inputType === 'selection' && selection?.text) {
      return selection.text;
    }
    // Get last 500 words of context
    const words = content.split(/\s+/);
    const contextWords = words.slice(-500).join(' ');
    return contextWords;
  }, [tool.inputType, selection, content]);

  // Generate content using the AI
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setResult('');

    try {
      const context = getContext();
      
      const response = await fetch('/api/ai/theater', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: tool.id,
          context,
          selection: selection?.text,
          options,
          customPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setResult(data.result || data.content || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate for context-based tools
  useEffect(() => {
    if (tool.inputType === 'context' && !tool.requiresSelection) {
      handleGenerate();
    }
  }, [tool.id]);

  const Icon = tool.icon;

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="w-[420px] border-l border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-3">
          <span className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg',
            `bg-gradient-to-br ${tool.gradient}`
          )}>
            <Icon className="h-5 w-5 text-white" />
          </span>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">{tool.name}</h3>
            <p className="text-xs text-stone-500">{tool.description}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Selection preview if required */}
        {tool.requiresSelection && selection?.text && (
          <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Selected text</p>
            <p className="text-sm text-stone-700 dark:text-stone-300 line-clamp-3">
              {selection.text}
            </p>
          </div>
        )}

        {/* Tool Options */}
        {tool.options && tool.options.length > 0 && (
          <div className="space-y-3">
            {tool.options.map(option => (
              <div key={option.id} className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {option.label}
                </label>
                
                {option.type === 'select' && (
                  <select
                    value={options[option.id]}
                    onChange={(e) => setOptions(prev => ({ ...prev, [option.id]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    {option.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
                
                {option.type === 'slider' && (
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={option.min || 0}
                      max={option.max || 100}
                      value={options[option.id]}
                      onChange={(e) => setOptions(prev => ({ ...prev, [option.id]: Number(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm text-stone-500 w-8 text-right">{options[option.id]}</span>
                  </div>
                )}
                
                {option.type === 'toggle' && (
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, [option.id]: !prev[option.id] }))}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors',
                      options[option.id] ? 'bg-teal-600' : 'bg-stone-200 dark:bg-stone-700'
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                      options[option.id] && 'translate-x-5'
                    )} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Custom prompt input */}
        {tool.inputType === 'text' && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {tool.placeholders.input}
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={tool.placeholders.input}
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 resize-none"
            />
          </div>
        )}

        {/* Generate button (for tools that need manual trigger) */}
        {(tool.inputType === 'text' || (tool.requiresSelection && selection?.text)) && !isGenerating && !result && (
          <button
            onClick={handleGenerate}
            disabled={tool.inputType === 'text' && !customPrompt.trim()}
            className={cn(
              'w-full py-2.5 rounded-lg font-medium text-white transition-colors',
              'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Generate
          </button>
        )}

        {/* Loading state */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
            <p className="text-sm text-stone-500">{tool.placeholders.output}</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={handleGenerate}
              className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Result */}
        {result && !isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Result</p>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 max-h-[300px] overflow-y-auto">
              <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                {result}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions - only show when we have a result */}
      {result && !isGenerating && (
        <div className="flex-shrink-0 border-t border-stone-200 dark:border-stone-700 p-4">
          <div className="flex gap-2">
            {/* Replace selection (if selection exists) */}
            {selection?.text && (
              <button
                onClick={() => onResult(result, 'replace')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              >
                <Replace className="h-4 w-4" />
                Replace
              </button>
            )}
            
            {/* Insert after */}
            <button
              onClick={() => onResult(result, selection ? 'insert' : 'append')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors',
                selection?.text
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              )}
            >
              <Plus className="h-4 w-4" />
              {selection ? 'Insert After' : 'Add to End'}
            </button>
          </div>
          
          {/* Keyboard hint */}
          <p className="text-xs text-center text-stone-400 mt-2">
            Press <kbd className="px-1 py-0.5 bg-stone-100 dark:bg-stone-800 rounded font-mono">Esc</kbd> to close
          </p>
        </div>
      )}
    </motion.aside>
  );
}
