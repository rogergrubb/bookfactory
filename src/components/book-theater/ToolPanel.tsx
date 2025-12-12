'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Sparkles, Copy, Check, ArrowRight, Replace, Plus, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, SubOption, Selection, SceneContext } from './types';
import { categoryMeta } from './tool-definitions';
import { GenerationProgressBar } from './GenerationProgress';
import { useGenerationProgress, useSuccessCelebration, useTypewriter } from './hooks/useMicroInteractions';
import { ConfettiOverlay, WordCountDelta, PulseRing, SuccessCheck } from './InsertAnimations';

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
  const panelRef = useRef<HTMLDivElement>(null);

  // Micro-interaction hooks
  const { progress, startGeneration, completeGeneration, errorGeneration, isGenerating } = useGenerationProgress();
  const { confetti, showSuccess, celebrate } = useSuccessCelebration();
  const { displayText, isComplete: typewriterComplete, skipToEnd } = useTypewriter(result, result.length > 0 && result.length < 500);

  const meta = categoryMeta[tool.category];
  const isCustomMode = selectedSubOption?.id === 'custom';
  const hasResult = result.length > 0;
  const wordCount = result.split(/\s+/).filter(w => w.length > 0).length;

  // Color mapping for Tailwind
  const colorStyles: Record<string, { button: string; border: string; bg: string; text: string; glow: string }> = {
    emerald: { button: 'bg-emerald-500 hover:bg-emerald-600', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    blue: { button: 'bg-blue-500 hover:bg-blue-600', border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
    amber: { button: 'bg-amber-500 hover:bg-amber-600', border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
    purple: { button: 'bg-purple-500 hover:bg-purple-600', border: 'border-purple-500/30', bg: 'bg-purple-500/5', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
    rose: { button: 'bg-rose-500 hover:bg-rose-600', border: 'border-rose-500/30', bg: 'bg-rose-500/5', text: 'text-rose-400', glow: 'shadow-rose-500/20' },
  };

  const colors = colorStyles[meta.color] || colorStyles.emerald;

  // Reset when tool changes
  useEffect(() => {
    setResult('');
    setError(null);
    setCustomInstruction('');
    setSelectedSubOption(subOption || null);
    setShowInsertSuccess(false);
  }, [tool.id, subOption]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Enter' && hasResult && !isGenerating && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleInsert();
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
    onReplace(result);
    celebrate('medium');
    setShowInsertSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Check if tool has sub-options to choose from
  const showSubOptions = tool.hasSubMenu && tool.subOptions && !selectedSubOption && !subOption;

  return (
    <>
      {/* Confetti overlay */}
      <ConfettiOverlay confetti={confetti} showSuccess={showSuccess} />

      {/* Panel with slide-in animation */}
      <div 
        ref={panelRef}
        className={cn(
          'w-[380px] h-full flex flex-col bg-stone-900 border-l border-stone-800',
          'animate-in slide-in-from-right duration-200'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-3 border-b transition-all duration-300',
          colors.border, 
          colors.bg,
          showInsertSuccess && 'bg-emerald-500/10 border-emerald-500/30'
        )}>
          {showInsertSuccess ? (
            <SuccessCheck show={true} size="sm" />
          ) : (
            <tool.icon className={cn('w-5 h-5 transition-colors', colors.text)} />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-stone-100">
              {showInsertSuccess ? 'Inserted!' : tool.name}
            </h3>
            {selectedSubOption && !showInsertSuccess && (
              <p className="text-xs text-stone-400">{selectedSubOption.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Sub-option Selection */}
          {showSubOptions && (
            <div className="p-4 border-b border-stone-800 animate-in fade-in duration-200">
              <p className="text-sm text-stone-400 mb-3">Choose an option:</p>
              <div className="space-y-1">
                {tool.subOptions?.map((opt, index) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedSubOption(opt)}
                    className={cn(
                      'w-full px-3 py-2.5 rounded-lg text-left text-sm transition-all',
                      'text-stone-300 hover:text-stone-100 hover:bg-stone-800',
                      'animate-in slide-in-from-left duration-200'
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scene Context Info */}
          {sceneContext && (
            <div className="px-4 py-3 border-b border-stone-800 bg-stone-800/30">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">{sceneContext.icon}</span>
                <span className="text-stone-400">Scene:</span>
                <span className="text-stone-200">{sceneContext.name}</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {sceneContext.mood?.primary} {sceneContext.mood?.secondary && `• ${sceneContext.mood.secondary}`}
              </p>
            </div>
          )}

          {/* Selection Preview */}
          {selection && tool.requiresSelection && (
            <div className="px-4 py-3 border-b border-stone-800">
              <p className="text-xs text-stone-500 mb-1">Selected text:</p>
              <div className="bg-stone-800 rounded-lg p-3 text-sm text-stone-300 max-h-[100px] overflow-y-auto border-l-2 border-teal-500/50">
                &ldquo;{selection.text.length > 200 
                  ? selection.text.slice(0, 200) + '...' 
                  : selection.text}&rdquo;
              </div>
            </div>
          )}

          {/* Custom Instruction Input */}
          {(isCustomMode || tool.id === 'what-if' || tool.id === 'stuck-help') && (
            <div className="px-4 py-3 border-b border-stone-800">
              <label className="text-sm text-stone-400 block mb-2">
                {tool.id === 'what-if' ? 'What if...' : 
                 tool.id === 'stuck-help' ? 'What are you stuck on?' :
                 'Custom instruction:'}
              </label>
              <textarea
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder={
                  tool.id === 'what-if' ? 'the villain was actually trying to help?' :
                  tool.id === 'stuck-help' ? "I don't know how to get my character out of this situation..." :
                  'Describe how you want this rewritten...'
                }
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-500 resize-none focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all"
                rows={3}
              />
            </div>
          )}

          {/* Tool Description */}
          {!showSubOptions && !hasResult && !isGenerating && (
            <div className="px-4 py-3">
              <p className="text-sm text-stone-400">{tool.description}</p>
              
              {tool.requiresSelection && !selection && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg animate-in fade-in duration-200">
                  <p className="text-sm text-amber-300">
                    ✍️ Select some text in your chapter first
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <div className="px-4 py-3">
              <GenerationProgressBar progress={progress} />
            </div>
          )}

          {/* Generate Button */}
          {!showSubOptions && !hasResult && !isGenerating && (
            <div className="px-4 py-3">
              <PulseRing isActive={false} color={meta.color}>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || (tool.requiresSelection && !selection) || (isCustomMode && !customInstruction.trim())}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg font-medium transition-all text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'shadow-lg hover:shadow-xl active:scale-[0.98]',
                    colors.button,
                    colors.glow
                  )}
                >
                  <Wand2 className="w-4 h-4" />
                  Generate
                </button>
              </PulseRing>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="px-4 py-3 animate-in shake duration-300">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
                <button
                  onClick={handleGenerate}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Result Display */}
          {hasResult && !isGenerating && (
            <div className="px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-400">Result</span>
                  <WordCountDelta delta={wordCount} />
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div 
                className="bg-stone-800 rounded-lg p-3 text-sm text-stone-200 max-h-[300px] overflow-y-auto whitespace-pre-wrap leading-relaxed cursor-pointer"
                onClick={() => !typewriterComplete && skipToEnd()}
              >
                {displayText}
                {!typewriterComplete && (
                  <span className="inline-block w-0.5 h-4 bg-teal-400 animate-pulse ml-0.5" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {selection ? (
                  <>
                    <button
                      onClick={handleReplace}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 active:scale-[0.98]"
                    >
                      <Replace className="w-4 h-4" />
                      Replace
                    </button>
                    <button
                      onClick={handleInsert}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm font-medium transition-all active:scale-[0.98]"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Insert After
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleInsert}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    Insert at Cursor
                  </button>
                )}
              </div>

              {/* Generate More */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-stone-700 hover:bg-stone-800 text-stone-400 hover:text-stone-300 text-sm transition-all"
              >
                <Sparkles className="w-3 h-3" />
                Generate Another
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-stone-800 bg-stone-900/50">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>
              <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-stone-500">Esc</kbd> to close
            </span>
            {hasResult && (
              <span>
                <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-stone-500">⌘↵</kbd> to insert
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
