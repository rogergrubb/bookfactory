'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Loader2, Sparkles, Copy, Check, ArrowRight, Replace, Plus, Wand2, History, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, SubOption, Selection, SceneContext } from './types';
import { categoryMeta } from './tool-definitions';
import { GenerationProgressBar } from './GenerationProgress';
import { useGenerationProgress, useSuccessCelebration, useTypewriter } from './hooks/useMicroInteractions';
import { ConfettiOverlay, WordCountDelta, PulseRing, SuccessCheck } from './InsertAnimations';
import { TokenEstimator } from './TokenEstimator';
import { GenerationHistoryInline, GenerationRecord } from './GenerationHistory';

interface ToolPanelProps {
  tool: Tool;
  subOption?: SubOption | null;
  selection?: Selection | null;
  sceneContext?: SceneContext | null;
  chapterContent: string;
  cursorPosition: number;
  onClose: () => void;
  onGenerate: (instruction?: string) => Promise<string>;
  onInsertAfter: (text: string) => void;
  onReplace: (text: string) => void;
  onInsertAtCursor: (text: string) => void;
}

export function ToolPanel({
  tool,
  subOption,
  selection,
  sceneContext,
  chapterContent,
  cursorPosition,
  onClose,
  onGenerate,
  onInsertAfter,
  onReplace,
  onInsertAtCursor,
}: ToolPanelProps) {
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [customInstruction, setCustomInstruction] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedSubOption, setSelectedSubOption] = useState<SubOption | null>(subOption || null);
  const [showInsertSuccess, setShowInsertSuccess] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<GenerationRecord[]>([]);
  const [tokensUsed, setTokensUsed] = useState<number>(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Micro-interaction hooks
  const { progress, startGeneration, completeGeneration, errorGeneration, isGenerating } = useGenerationProgress();
  const { confetti, showSuccess, celebrate } = useSuccessCelebration();
  const { displayText, isComplete: typewriterComplete, skipToEnd } = useTypewriter(result, result.length > 0 && result.length < 500);

  const meta = categoryMeta[tool.category];
  const isCustomMode = selectedSubOption?.id === 'custom';
  const hasResult = result.length > 0;
  const wordCount = result.split(/\s+/).filter(w => w.length > 0).length;

  // Calculate input length for token estimation
  const inputLength = (selection?.text?.length || 0) + (chapterContent.length > 2000 ? 2000 : chapterContent.length);

  // Color mapping for Tailwind
  const colorStyles: Record<string, { button: string; border: string; bg: string; text: string; glow: string }> = {
    emerald: { button: 'bg-emerald-500 hover:bg-emerald-600', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    blue: { button: 'bg-blue-500 hover:bg-blue-600', border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
    amber: { button: 'bg-amber-500 hover:bg-amber-600', border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
    purple: { button: 'bg-purple-500 hover:bg-purple-600', border: 'border-purple-500/30', bg: 'bg-purple-500/5', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
    rose: { button: 'bg-rose-500 hover:bg-rose-600', border: 'border-rose-500/30', bg: 'bg-rose-500/5', text: 'text-rose-400', glow: 'shadow-rose-500/20' },
  };

  const colors = colorStyles[meta.color] || colorStyles.emerald;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isGenerating && !hasResult) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasResult, isGenerating, onClose]);

  const handleGenerate = async () => {
    setError(null);
    setResult('');
    startGeneration();

    try {
      const instruction = isCustomMode ? customInstruction : undefined;
      const generated = await onGenerate(instruction);
      setResult(generated);
      const generatedWordCount = generated.split(/\s+/).filter(w => w.length > 0).length;
      completeGeneration(generatedWordCount);

      // Add to local generation history
      const newRecord: GenerationRecord = {
        id: Date.now().toString(),
        toolId: tool.id,
        toolName: tool.name,
        subOptionId: selectedSubOption?.id,
        subOptionName: selectedSubOption?.name,
        input: selection?.text || chapterContent.slice(Math.max(0, cursorPosition - 500), cursorPosition),
        output: generated,
        tokensUsed: Math.round(generatedWordCount * 1.3 + 100), // Estimate
        timestamp: new Date(),
        isFavorite: false,
      };
      setGenerationHistory(prev => [newRecord, ...prev].slice(0, 10));
      setTokensUsed(prev => prev + newRecord.tokensUsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      errorGeneration(message);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (selection) {
      onInsertAfter(result);
    } else {
      onInsertAtCursor(result);
    }
    celebrate('medium');
    setShowInsertSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleReplace = () => {
    if (selection) {
      onReplace(result);
      celebrate('medium');
      setShowInsertSuccess(true);
      setTimeout(() => {
        onClose();
      }, 600);
    }
  };

  const handleRestoreFromHistory = useCallback((output: string) => {
    setResult(output);
  }, []);

  const handleRegenerate = async () => {
    setResult('');
    handleGenerate();
  };

  return (
    <div 
      ref={panelRef}
      className={cn(
        'w-96 h-full flex flex-col border-l bg-stone-900',
        colors.border
      )}
    >
      {/* Confetti Overlay - Fixed props */}
      <ConfettiOverlay confetti={confetti} showSuccess={showSuccess} />

      {/* Header */}
      <div className={cn('px-4 py-3 border-b border-stone-800', colors.bg)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-lg', colors.bg)}>
              <tool.icon className={cn('w-4 h-4', colors.text)} />
            </div>
            <div>
              <h3 className="font-medium text-stone-100">{tool.name}</h3>
              {selectedSubOption && (
                <p className="text-xs text-stone-400">{selectedSubOption.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Token Estimator - Show before generation */}
        {!hasResult && !isGenerating && (
          <TokenEstimator
            toolId={tool.id}
            subOptionId={selectedSubOption?.id}
            inputLength={inputLength}
            className="mt-2"
          />
        )}

        {/* Tokens Used - Show after generation */}
        {hasResult && tokensUsed > 0 && (
          <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-stone-800/50 text-xs">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-stone-400">Used:</span>
            <span className="font-mono text-stone-300">{tokensUsed.toLocaleString()} tokens</span>
            <span className="text-stone-500">this session</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <GenerationProgressBar progress={progress} color={meta.color} />
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Sub-options (if tool has them and no result yet) */}
        {tool.subOptions && tool.subOptions.length > 0 && !hasResult && !isGenerating && (
          <div className="p-4 border-b border-stone-800">
            <label className="text-xs font-medium text-stone-400 block mb-2">
              Options
            </label>
            <div className="flex flex-wrap gap-2">
              {tool.subOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedSubOption(opt)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-lg border transition-all',
                    selectedSubOption?.id === opt.id
                      ? `${colors.bg} ${colors.border} ${colors.text}`
                      : 'border-stone-700 text-stone-400 hover:border-stone-600 hover:text-stone-300'
                  )}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom instruction input */}
        {isCustomMode && !hasResult && !isGenerating && (
          <div className="p-4 border-b border-stone-800">
            <label className="text-xs font-medium text-stone-400 block mb-2">
              Custom Instruction
            </label>
            <textarea
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="Describe what you want..."
              className="w-full h-24 px-3 py-2 text-sm bg-stone-800 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-stone-600 resize-none"
            />
          </div>
        )}

        {/* Selection Preview */}
        {selection && !hasResult && !isGenerating && (
          <div className="p-4 border-b border-stone-800">
            <label className="text-xs font-medium text-stone-400 block mb-2">
              Selected Text
            </label>
            <div className="p-3 bg-stone-800/50 rounded-lg text-sm text-stone-300 max-h-32 overflow-y-auto">
              {selection.text.slice(0, 300)}
              {selection.text.length > 300 && '...'}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          </div>
        )}

        {/* Result */}
        {hasResult && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-400">Result</span>
                <WordCountDelta count={wordCount} show={showSuccess} />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div 
              className={cn(
                'p-4 rounded-lg border text-sm text-stone-200 max-h-64 overflow-y-auto',
                'bg-stone-800/50 border-stone-700/50',
                showInsertSuccess && 'ring-2 ring-emerald-500/50'
              )}
              onClick={() => !typewriterComplete && skipToEnd()}
            >
              {typewriterComplete ? result : displayText}
              {!typewriterComplete && (
                <span className="inline-block w-0.5 h-4 ml-0.5 bg-stone-400 animate-pulse" />
              )}
            </div>
            
            {/* Generation History - Inline versions */}
            {generationHistory.length > 1 && (
              <GenerationHistoryInline 
                records={generationHistory.slice(1)} 
                onRestore={handleRestoreFromHistory}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-stone-800 space-y-2">
        {!hasResult ? (
          // Pre-generation: Generate button
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (isCustomMode && !customInstruction.trim())}
            className={cn(
              'w-full py-2.5 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2',
              colors.button,
              (isGenerating || (isCustomMode && !customInstruction.trim())) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
                <span className="text-xs opacity-70 ml-1">⌘↵</span>
              </>
            )}
          </button>
        ) : (
          // Post-generation: Insert/Replace/Regenerate buttons
          <>
            <div className="flex gap-2">
              <button
                onClick={handleInsert}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2',
                  colors.button
                )}
              >
                <Plus className="w-4 h-4" />
                Insert
              </button>
              {selection && (
                <button
                  onClick={handleReplace}
                  className="flex-1 py-2 px-3 rounded-lg font-medium bg-stone-700 hover:bg-stone-600 text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Replace className="w-4 h-4" />
                  Replace
                </button>
              )}
            </div>
            <button
              onClick={handleRegenerate}
              className="w-full py-2 px-3 rounded-lg font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Regenerate
            </button>
          </>
        )}
      </div>

      {/* Success Overlay */}
      {showInsertSuccess && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm">
          <SuccessCheck />
        </div>
      )}
    </div>
  );
}
