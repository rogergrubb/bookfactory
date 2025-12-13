'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Loader2, Sparkles, Copy, Check, ArrowRight, Replace, Plus, Wand2, 
  History, TrendingUp, Clock, Mic, AlertTriangle, Zap, ChevronDown, ChevronRight,
  Eye, EyeOff, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, SubOption, Selection, SceneContext } from './types';
import { categoryMeta } from './tool-definitions';
import { GenerationProgressBar } from './GenerationProgress';
import { useGenerationProgress, useSuccessCelebration, useTypewriter } from './hooks/useMicroInteractions';
import { ConfettiOverlay, WordCountDelta, PulseRing, SuccessCheck } from './InsertAnimations';
import { TokenEstimator, SessionUsageBadge } from './TokenEstimator';
import { GenerationHistoryInline, GenerationRecord } from './GenerationHistory';

// ============================================================================
// TYPES
// ============================================================================

interface VoiceOption {
  id: string;
  name: string;
  confidence: number;
  timesUsed: number;
}

type IssueSeverity = 'critical' | 'warning' | 'suggestion' | 'info';

interface CorrectionIssue {
  id: string;
  type: string;
  severity: IssueSeverity;
  title: string;
  description?: string;
  original: string;
  suggestion: string;
  confidence: number;
}

interface AnalysisData {
  score?: number;
  summary?: string;
  issues?: CorrectionIssue[];
  insights?: string[];
  nextToolSuggestion?: string;
  [key: string]: any;
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
  onGenerate: (instruction?: string, voiceId?: string) => Promise<string | { result: string; analysisData?: AnalysisData; isAnalysis?: boolean }>;
  onInsertAfter: (text: string) => void;
  onReplace: (text: string) => void;
  onInsertAtCursor: (text: string) => void;
  onApplyCorrection?: (original: string, replacement: string) => void;
}

// ============================================================================
// SEVERITY CONFIG
// ============================================================================

const severityConfig: Record<IssueSeverity, { 
  icon: React.ElementType; 
  color: string; 
  bg: string; 
  border: string;
  label: string;
}> = {
  critical: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Critical' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Warning' },
  suggestion: { icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Suggestion' },
  info: { icon: Eye, color: 'text-stone-400', bg: 'bg-stone-500/10', border: 'border-stone-500/30', label: 'Info' },
};

// ============================================================================
// COMPONENT
// ============================================================================

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
  onApplyCorrection,
}: ToolPanelProps) {
  // Basic state
  const [result, setResult] = useState('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);
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

  // Correction state
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [appliedIssues, setAppliedIssues] = useState<Set<string>>(new Set());
  const [dismissedIssues, setDismissedIssues] = useState<Set<string>>(new Set());

  // Micro-interaction hooks
  const { progress, startGeneration, completeGeneration, errorGeneration, isGenerating } = useGenerationProgress();
  const { confetti, showSuccess, celebrate } = useSuccessCelebration();
  const { displayText, isComplete: typewriterComplete, skipToEnd } = useTypewriter(result, result.length > 0 && result.length < 500);

  const meta = categoryMeta[tool.category];
  const isCustomMode = selectedSubOption?.id === 'custom';
  const hasResult = result.length > 0 || analysisData !== null;
  const wordCount = result.split(/\s+/).filter(w => w.length > 0).length;
  const selectedVoice = voices.find(v => v.id === selectedVoiceId);
  const inputLength = (selection?.text?.length || 0) + (chapterContent.length > 2000 ? 2000 : chapterContent.length);

  // Filter issues
  const filteredIssues = analysisData?.issues?.filter(issue => !dismissedIssues.has(issue.id)) || [];
  const pendingIssues = filteredIssues.filter(i => !appliedIssues.has(i.id));

  // Fetch voices
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

  // Color mapping
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
      if (e.key === 'Escape') onClose();
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
      if (!target.closest('[data-voice-dropdown]')) setShowVoiceDropdown(false);
    };
    if (showVoiceDropdown) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showVoiceDropdown]);

  // Generate handler
  const handleGenerate = async () => {
    setError(null);
    setResult('');
    setAnalysisData(null);
    setIsAnalysisMode(false);
    const startTime = Date.now();
    startGeneration();

    try {
      const instruction = isCustomMode ? customInstruction : undefined;
      const response = await onGenerate(instruction, selectedVoiceId || undefined);
      
      // Handle both string and object responses
      if (typeof response === 'string') {
        setResult(response);
        setIsAnalysisMode(false);
      } else if (response.isAnalysis && response.analysisData) {
        setResult(response.result || response.analysisData.summary || '');
        setAnalysisData(response.analysisData);
        setIsAnalysisMode(true);
      } else {
        setResult(response.result || '');
      }
      
      const generatedWordCount = (typeof response === 'string' ? response : response.result || '').split(/\s+/).filter(w => w.length > 0).length;
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setGenerationTime(elapsed);
      completeGeneration(generatedWordCount);

      setSessionStats(prev => ({
        generations: prev.generations + 1,
        words: prev.words + generatedWordCount
      }));

      if (selectedVoiceId) trackVoiceUsage(selectedVoiceId, generatedWordCount);

      const newRecord: GenerationRecord = {
        id: Date.now().toString(),
        toolId: tool.id,
        toolName: tool.name,
        subOptionId: selectedSubOption?.id,
        subOptionName: selectedSubOption?.name,
        input: selection?.text || chapterContent.slice(Math.max(0, cursorPosition - 500), cursorPosition),
        output: typeof response === 'string' ? response : response.result || '',
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

  const trackVoiceUsage = async (voiceId: string, outputWordCount: number) => {
    try {
      await fetch(`/api/voice/${voiceId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: tool.id, chapterId, bookId, inputWordCount: selection?.text?.length || 0, outputWordCount }),
      });
    } catch (err) {
      console.error('Failed to track voice usage:', err);
    }
  };

  const handleApplyMyVoice = async () => {
    if (!selectedVoiceId || !result) return;
    setError(null);
    startGeneration();
    try {
      const response = await fetch('/api/ai/apply-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: result, voiceId: selectedVoiceId }),
      });
      if (!response.ok) throw new Error('Failed to apply voice');
      const data = await response.json();
      setResult(data.result);
      completeGeneration(data.result.split(/\s+/).length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply voice';
      setError(message);
      errorGeneration(message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (selection) {
      onInsertAfter(result);
    } else {
      onInsertAtCursor(result);
    }
    celebrate();
    setShowInsertSuccess(true);
    setTimeout(() => {
      setShowInsertSuccess(false);
      onClose();
    }, 800);
  };

  const handleReplace = () => {
    if (!selection) return;
    onReplace(result);
    celebrate();
    setShowInsertSuccess(true);
    setTimeout(() => {
      setShowInsertSuccess(false);
      onClose();
    }, 800);
  };

  const handleRegenerate = () => {
    setResult('');
    setAnalysisData(null);
    setIsAnalysisMode(false);
    handleGenerate();
  };

  const handleRestoreFromHistory = (record: GenerationRecord) => {
    setResult(record.output);
  };

  // Correction handlers
  const toggleExpand = (issueId: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) newExpanded.delete(issueId);
    else newExpanded.add(issueId);
    setExpandedIssues(newExpanded);
  };

  const handleApplyFix = (issue: CorrectionIssue) => {
    if (onApplyCorrection) {
      onApplyCorrection(issue.original, issue.suggestion);
    }
    setAppliedIssues(prev => new Set([...prev, issue.id]));
  };

  const handleApplyAllFixes = () => {
    pendingIssues.forEach(issue => {
      if (onApplyCorrection) {
        onApplyCorrection(issue.original, issue.suggestion);
      }
    });
    setAppliedIssues(prev => new Set([...prev, ...pendingIssues.map(i => i.id)]));
  };

  const handleDismissIssue = (issueId: string) => {
    setDismissedIssues(prev => new Set([...prev, issueId]));
  };

  // Count issues by severity
  const severityCounts = filteredIssues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      ref={panelRef}
      className={cn(
        'w-96 h-full flex flex-col bg-stone-900 border-l',
        colors.border,
        confetti && 'overflow-hidden'
      )}
    >
      {confetti && <ConfettiOverlay />}

      {/* Header */}
      <div className={cn('px-4 py-3 border-b border-stone-800', colors.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-1.5 rounded-lg', colors.bg)}>
              <tool.icon className={cn('w-4 h-4', colors.text)} />
            </div>
            <div>
              <h3 className="font-medium text-stone-100">{tool.name}</h3>
              {selectedSubOption && <p className="text-xs text-stone-400">{selectedSubOption.name}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Voice Selector */}
        {!loadingVoices && voices.length > 0 && (
          <div className="relative mt-2" data-voice-dropdown>
            <button
              onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                selectedVoice ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300' : 'bg-stone-800/50 border border-stone-700 text-stone-400 hover:border-stone-600'
              )}
            >
              <div className="flex items-center gap-2">
                <Mic className="w-3.5 h-3.5" />
                <span>{selectedVoice ? selectedVoice.name : 'No Voice'}</span>
              </div>
              <ChevronDown className={cn('w-4 h-4 transition-transform', showVoiceDropdown && 'rotate-180')} />
            </button>
            {showVoiceDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-stone-900 border border-stone-800 rounded-lg shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => { setSelectedVoiceId(null); setShowVoiceDropdown(false); }}
                  className={cn('w-full px-3 py-2 text-left text-sm hover:bg-stone-800/50 flex items-center justify-between', !selectedVoiceId && 'bg-stone-800/30')}
                >
                  <span className="text-stone-400">No Voice (Default AI)</span>
                  {!selectedVoiceId && <Check className="w-4 h-4 text-violet-400" />}
                </button>
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => { setSelectedVoiceId(voice.id); setShowVoiceDropdown(false); }}
                    className={cn('w-full px-3 py-2 text-left text-sm hover:bg-stone-800/50 flex items-center justify-between', selectedVoiceId === voice.id && 'bg-violet-500/10')}
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

        {/* Estimator */}
        {!hasResult && !isGenerating && (
          <TokenEstimator toolId={tool.id} subOptionId={selectedSubOption?.id} inputLength={inputLength} className="mt-2" />
        )}

        {/* Generation Stats */}
        {hasResult && !isAnalysisMode && (
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
          </div>
        )}

        {/* Analysis Score Badge */}
        {isAnalysisMode && analysisData?.score !== undefined && (
          <div className="flex items-center justify-between mt-2 px-3 py-2 rounded-lg bg-stone-800/50">
            <span className="text-xs text-stone-500">Score</span>
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              analysisData.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
              analysisData.score >= 60 ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            )}>
              {analysisData.score}/100
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isGenerating && <GenerationProgressBar progress={progress} />}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Sub-options */}
        {tool.subOptions && tool.subOptions.length > 0 && !hasResult && !isGenerating && (
          <div className="p-4 border-b border-stone-800">
            <label className="text-xs font-medium text-stone-400 block mb-2">Options</label>
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

        {/* Custom instruction */}
        {isCustomMode && !hasResult && !isGenerating && (
          <div className="p-4 border-b border-stone-800">
            <label className="text-xs font-medium text-stone-400 block mb-2">Custom Instruction</label>
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
            <label className="text-xs font-medium text-stone-400 block mb-2">Selected Text</label>
            <div className="p-3 bg-stone-800/50 rounded-lg text-sm text-stone-300 max-h-32 overflow-y-auto">
              {selection.text.slice(0, 300)}{selection.text.length > 300 && '...'}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>
          </div>
        )}

        {/* Regular Result (non-analysis) */}
        {hasResult && !isAnalysisMode && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-400">Result</span>
                <WordCountDelta delta={wordCount} />
              </div>
              <button onClick={handleCopy} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors" title="Copy">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className={cn('p-4 rounded-lg border text-sm text-stone-200 max-h-64 overflow-y-auto bg-stone-800/50 border-stone-700/50', showInsertSuccess && 'ring-2 ring-emerald-500/50')} onClick={() => !typewriterComplete && skipToEnd()}>
              {typewriterComplete ? result : displayText}
              {!typewriterComplete && <span className="inline-block w-0.5 h-4 ml-0.5 bg-stone-400 animate-pulse" />}
            </div>
            {generationHistory.length > 1 && <GenerationHistoryInline records={generationHistory.slice(1)} onRestore={handleRestoreFromHistory} />}
          </div>
        )}

        {/* Analysis Result with Corrections */}
        {isAnalysisMode && analysisData && (
          <div className="flex flex-col">
            {/* Summary */}
            <div className="p-4 border-b border-stone-800">
              <p className="text-sm text-stone-300 leading-relaxed">{analysisData.summary || result}</p>
              
              {/* Severity counts */}
              {filteredIssues.length > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  {Object.entries(severityCounts).map(([severity, count]) => {
                    const config = severityConfig[severity as IssueSeverity];
                    if (!config) return null;
                    return (
                      <div key={severity} className={cn('flex items-center gap-1.5 px-2 py-1 rounded text-xs', config.bg, config.color)}>
                        <config.icon className="w-3 h-3" />
                        <span>{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fix All Button */}
            {pendingIssues.length > 1 && onApplyCorrection && (
              <div className="p-3 border-b border-stone-800 bg-stone-900/50">
                <button
                  onClick={handleApplyAllFixes}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Zap className="w-4 h-4" />
                  Fix All {pendingIssues.length} Issues
                </button>
              </div>
            )}

            {/* Issues List */}
            {filteredIssues.length > 0 ? (
              <div className="divide-y divide-stone-800/50">
                {filteredIssues.map((issue) => {
                  const config = severityConfig[issue.severity] || severityConfig.suggestion;
                  const isExpanded = expandedIssues.has(issue.id);
                  const isApplied = appliedIssues.has(issue.id);

                  return (
                    <div key={issue.id} className={cn('transition-all', isApplied && 'opacity-50')}>
                      <div className="flex items-start gap-3 p-3 cursor-pointer hover:bg-stone-800/20" onClick={() => toggleExpand(issue.id)}>
                        <div className={cn('p-1.5 rounded', config.bg)}>
                          <config.icon className={cn('w-3.5 h-3.5', config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-stone-200 truncate block">{issue.title}</span>
                          <p className="text-xs text-stone-500 mt-0.5 truncate">"{issue.original.slice(0, 40)}{issue.original.length > 40 ? '...' : ''}"</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {isApplied ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400"><Check className="w-3.5 h-3.5" />Fixed</span>
                          ) : onApplyCorrection && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); handleApplyFix(issue); }} className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors" title="Apply fix">
                                <Wand2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDismissIssue(issue.id); }} className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors" title="Dismiss">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-stone-500" /> : <ChevronRight className="w-4 h-4 text-stone-500" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-3 pl-12 space-y-3">
                          {issue.description && <p className="text-xs text-stone-400">{issue.description}</p>}
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-[10px] uppercase tracking-wider text-red-400 w-12 pt-1">Before</span>
                              <div className="flex-1 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-stone-300 font-mono">{issue.original}</div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-[10px] uppercase tracking-wider text-emerald-400 w-12 pt-1">After</span>
                              <div className="flex-1 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-stone-300 font-mono">{issue.suggestion}</div>
                            </div>
                          </div>
                          {!isApplied && onApplyCorrection && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleApplyFix(issue)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors">
                                <Check className="w-3.5 h-3.5" />Apply Fix
                              </button>
                              <button onClick={() => handleDismissIssue(issue.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors">
                                <EyeOff className="w-3.5 h-3.5" />Ignore
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-stone-400">No issues found!</p>
                <p className="text-xs text-stone-500 mt-1">Your writing looks great.</p>
              </div>
            )}

            {/* Insights */}
            {analysisData.insights && analysisData.insights.length > 0 && (
              <div className="p-4 border-t border-stone-800 bg-stone-900/30">
                <h4 className="text-xs font-medium text-stone-400 mb-2">Insights</h4>
                <ul className="space-y-1">
                  {analysisData.insights.map((insight, i) => (
                    <li key={i} className="text-xs text-stone-500 flex items-start gap-2">
                      <span className="text-stone-600">•</span>{insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Stats */}
      {sessionStats.generations > 0 && (
        <div className="px-4 py-2 border-t border-stone-800/50">
          <SessionUsageBadge generationCount={sessionStats.generations} wordsGenerated={sessionStats.words} />
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-4 border-t border-stone-800 space-y-2">
        {!hasResult ? (
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (isCustomMode && !customInstruction.trim())}
            className={cn('w-full py-2.5 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2', colors.button, (isGenerating || (isCustomMode && !customInstruction.trim())) && 'opacity-50 cursor-not-allowed')}
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</>
            ) : (
              <><Sparkles className="w-4 h-4" />{tool.category === 'analyze' ? 'Analyze' : 'Generate'}<span className="text-xs opacity-70 ml-1">⌘↵</span></>
            )}
          </button>
        ) : isAnalysisMode ? (
          <button onClick={handleRegenerate} className="w-full py-2 px-3 rounded-lg font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center justify-center gap-2">
            <Wand2 className="w-4 h-4" />Re-analyze
          </button>
        ) : (
          <>
            <div className="flex gap-2">
              <button onClick={handleInsert} className={cn('flex-1 py-2 px-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2', colors.button)}>
                <Plus className="w-4 h-4" />Insert
              </button>
              {selection && (
                <button onClick={handleReplace} className="flex-1 py-2 px-3 rounded-lg font-medium bg-stone-700 hover:bg-stone-600 text-white transition-colors flex items-center justify-center gap-2">
                  <Replace className="w-4 h-4" />Replace
                </button>
              )}
            </div>
            {selectedVoice && (
              <button onClick={handleApplyMyVoice} disabled={isGenerating} className="w-full py-2 px-3 rounded-lg font-medium bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 transition-colors flex items-center justify-center gap-2">
                <Mic className="w-4 h-4" />Apply {selectedVoice.name} Style
              </button>
            )}
            <button onClick={handleRegenerate} className="w-full py-2 px-3 rounded-lg font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center justify-center gap-2">
              <Wand2 className="w-4 h-4" />Regenerate
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
