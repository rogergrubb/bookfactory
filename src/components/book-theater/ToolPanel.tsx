'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Loader2, Sparkles, Copy, Check, ArrowRight, Replace, Plus, Wand2, History, TrendingUp, Clock, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, SubOption, Selection, SceneContext } from './types';
import { categoryMeta } from './tool-definitions';
import { GenerationProgressBar } from './GenerationProgress';
import { useGenerationProgress, useSuccessCelebration, useTypewriter } from './hooks/useMicroInteractions';
import { ConfettiOverlay, WordCountDelta, PulseRing, SuccessCheck } from './InsertAnimations';
import { TokenEstimator, SessionUsageBadge } from './TokenEstimator';
import { GenerationHistoryInline, GenerationRecord } from './GenerationHistory';

// Voice types
interface VoiceOption {
  id: string;
  name: string;
  confidence: number;
  timesUsed: number;
}

interface ToolPanelProps {
  tool: Tool;
  subOption?: SubOption | null;
  selection?: Selection | null;
  sceneContext?: SceneContext | null;
  chapterContent: string;
  cursorPosition: number;
  bookId?: string;
  chapterId?: string;
  onClose: () => void;
  onGenerate: (instruction?: string, voiceId?: string) => Promise<string>;
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
  bookId,
  chapterId,
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
  const [sessionStats, setSessionStats] = useState({ generations: 0, words: 0 });
  const [generationTime, setGenerationTime] = useState<number>(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Voice state
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(true);

  // Micro-interaction hooks
  const { progress, startGeneration, completeGeneration, errorGeneration, isGenerating } = useGenerationProgress();
  const { confetti, showSuccess, celebrate } = useSuccessCelebration();
  const { displayText, isComplete: typewriterComplete, skipToEnd } = useTypewriter(result, result.length > 0 && result.length < 500);

  const meta = categoryMeta[tool.category];
  const isCustomMode = selectedSubOption?.id === 'custom';
  const hasResult = result.length > 0;
  const wordCount = result.split(/\s+/).filter(w => w.length > 0).length;

  // Calculate input length for estimation
  const inputLength = (selection?.text?.length || 0) + (chapterContent.length > 2000 ? 2000 : chapterContent.length);

  // Fetch user's voice profiles
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/voice');
        if (response.ok) {
          const data = await response.json();
          setVoices(data.voices || []);
        }
      } catch (err) {
        console.error('Failed to fetch voices:', err);
      } finally {
        setLoadingVoices(false);
      }
    };
    fetchVoices();
  }, []);

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

  // Close voice dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-voice-dropdown]')) {
        setShowVoiceDropdown(false);
      }
    };
    if (showVoiceDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showVoiceDropdown]);

  const handleGenerate = async () => {
    setError(null);
    setResult('');
    const startTime = Date.now();
    startGeneration();

    try {
      const instruction = isCustomMode ? customInstruction : undefined;
      // Pass voice ID to generation
      const generated = await onGenerate(instruction, selectedVoiceId || undefined);
      setResult(generated);
      
      const generatedWordCount = generated.split(/\s+/).filter(w => w.length > 0).length;
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setGenerationTime(elapsed);
      
      completeGeneration(generatedWordCount);

      // Update session stats
      setSessionStats(prev => ({
        generations: prev.generations + 1,
        words: prev.words + generatedWordCount
      }));

      // Track voice usage if voice was selected
      if (selectedVoiceId) {
        trackVoiceUsage(selectedVoiceId, generatedWordCount);
      }

      // Add to local generation history
      const newRecord: GenerationRecord = {
        id: Date.now().toString(),
        toolId: tool.id,
        toolName: tool.name,
        subOptionId: selectedSubOption?.id,
        subOptionName: selectedSubOption?.name,
        input: selection?.text || chapterContent.slice(Math.max(0, cursorPosition - 500), cursorPosition),
        output: generated,
        tokensUsed: Math.round(generatedWordCount * 1.3 + 100),
        timestamp: new Date(),
        isFavorite: false,
      };
      setGenerationHistory(prev => [newRecord, ...prev].slice(0, 10));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      errorGeneration(message);
    }
  };

  // Track voice usage
  const trackVoiceUsage = async (voiceId: string, outputWordCount: number) => {
    try {
      await fetch(`/api/voice/${voiceId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: tool.id,
          chapterId,
          bookId,
          inputWordCount: selection?.text?.length || 0,
          outputWordCount,
        }),
      });
    } catch (err) {
      console.error('Failed to track voice usage:', err);
    }
  };

  // Apply My Voice - rewrite result in selected voice
  const handleApplyMyVoice = async () => {
    if (!selectedVoiceId || !result) return;
    
    setError(null);
    startGeneration();
    
    try {
      const response = await fetch('/api/ai/apply-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: result,
          voiceId: selectedVoiceId,
          bookId,
          chapterId,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to apply voice');
      
      const data = await response.json();
      setResult(data.result);
      
      const newWordCount = data.result.split(/\s+/).filter((w: string) => w.length > 0).length;
      completeGeneration(newWordCount);
      trackVoiceUsage(selectedVoiceId, newWordCount);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply voice';
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

  const selectedVoice = voices.find(v => v.id === selectedVoiceId);

  return (
    <div 
      ref={panelRef}
      className={cn(
        'w-96 h-full flex flex-col border-l bg-stone-900',
        colors.border
      )}
    >
      {/* Confetti Overlay */}
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

        {/* Voice Selector - Integrated in header */}
        {!loadingVoices && voices.length > 0 && (
          <div className="relative mt-2" data-voice-dropdown>
            <button
              onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                selectedVoice
                  ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300'
                  : 'bg-stone-800/50 border border-stone-700 text-stone-400 hover:border-stone-600'
              )}
            >
              <div className="flex items-center gap-2">
                <Mic className="w-3.5 h-3.5" />
                <span>{selectedVoice ? selectedVoice.name : 'No Voice'}</span>
              </div>
              <svg className={cn('w-4 h-4 transition-transform', showVoiceDropdown && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showVoiceDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-stone-900 border border-stone-800 rounded-lg shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setSelectedVoiceId(null);
                    setShowVoiceDropdown(false);
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-stone-800/50 flex items-center justify-between',
                    !selectedVoiceId && 'bg-stone-800/30'
                  )}
                >
                  <span className="text-stone-400">No Voice (Default AI)</span>
                  {!selectedVoiceId && <Check className="w-4 h-4 text-violet-400" />}
                </button>
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => {
                      setSelectedVoiceId(voice.id);
                      setShowVoiceDropdown(false);
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-stone-800/50 flex items-center justify-between',
                      selectedVoiceId === voice.id && 'bg-violet-500/10'
                    )}
                  >
                    <div>
                      <span className="text-stone-200">{voice.name}</span>
                      <span className="text-xs text-stone-500 ml-2">{voice.confidence}% match</span>
                    </div>
                    {selectedVoiceId === voice.id && <Check className="w-4 h-4 text-violet-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Estimator - Show before generation */}
        {!hasResult && !isGenerating && (
          <TokenEstimator
            toolId={tool.id}
            subOptionId={selectedSubOption?.id}
            inputLength={inputLength}
            className="mt-2"
          />
        )}

        {/* Generation Stats - Show after generation */}
        {hasResult && (
          <div className="flex items-center gap-3 mt-2 px-3 py-1.5 rounded-lg bg-stone-800/50 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{wordCount} words</span>
            </div>
            {generationTime > 0 && (
              <>
                <span className="text-stone-600">•</span>
                <div className="flex items-center gap-1 text-stone-400">
                  <Clock className="w-3 h-3" />
                  <span>{generationTime}s</span>
                </div>
              </>
            )}
            {selectedVoice && (
              <>
                <span className="text-stone-600">•</span>
                <div className="flex items-center gap-1 text-violet-400">
                  <Mic className="w-3 h-3" />
                  <span>{selectedVoice.name}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <GenerationProgressBar progress={progress} />
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
                <WordCountDelta delta={wordCount} />
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

      {/* Session Stats */}
      {sessionStats.generations > 0 && (
        <div className="px-4 py-2 border-t border-stone-800/50">
          <SessionUsageBadge 
            generationCount={sessionStats.generations}
            wordsGenerated={sessionStats.words}
          />
        </div>
      )}

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
                {selectedVoice && <span className="text-xs opacity-70 ml-1">with {selectedVoice.name}</span>}
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
            
            {/* Apply My Voice button - only show if voice is selected and result exists */}
            {selectedVoice && (
              <button
                onClick={handleApplyMyVoice}
                disabled={isGenerating}
                className="w-full py-2 px-3 rounded-lg font-medium bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Apply {selectedVoice.name} Style
              </button>
            )}
            
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
          <SuccessCheck show={showInsertSuccess} />
        </div>
      )}
    </div>
  );
}
