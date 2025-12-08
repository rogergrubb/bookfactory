// ToolExecutionPanel - Comprehensive tool execution interface
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, Copy, Check, RotateCcw, ChevronDown, ChevronRight,
  Send, Settings, Download, Bookmark, BookmarkCheck,
  Maximize2, Minimize2, Volume2, VolumeX, ArrowRightLeft,
  Sparkles, Wand2, BarChart3, Lightbulb, FileText, MessageSquare,
  Palette, Zap, Brain, Star, Eye, Heart, Flame, TrendingUp,
  Hash, Activity, Shuffle, UserPlus, Globe, Swords, GitBranch,
  Layout, Users, Search, BookOpen, ArrowRight, AlertCircle,
  CheckCircle, Info, ChevronUp
} from 'lucide-react';
import { ToolId, ToolResult, Genre, AnalysisResult, AnalysisIssue } from './types';
import { AI_TOOLS, GENRES, getToolById, getToolIconBg, TOOL_CATEGORIES } from './tool-definitions';
import { useToolExecution, useWorkspace } from './hooks';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowRight, FileText, MessageSquare, Palette, Zap, Brain,
  Star, Eye, Heart, Flame, TrendingUp, Sparkles,
  BarChart3, Users, Search, BookOpen, Hash, Activity,
  Shuffle, UserPlus, Globe, Swords, GitBranch, Layout,
  Wand2, Lightbulb
};

interface ToolExecutionPanelProps {
  toolId: ToolId;
  isOpen: boolean;
  onClose: () => void;
  initialInput?: string;
  onApply?: (content: string) => void;
  onChainTool?: (toolId: ToolId, input: string) => void;
}

export function ToolExecutionPanel({
  toolId,
  isOpen,
  onClose,
  initialInput = '',
  onApply,
  onChainTool
}: ToolExecutionPanelProps) {
  const tool = getToolById(toolId);
  const { isLoading, error, result, execute, clearError, clearResult } = useToolExecution();
  
  const [input, setInput] = useState(initialInput);
  const [copied, setCopied] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Options state
  const [genre, setGenre] = useState<Genre>('literary');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [intensity, setIntensity] = useState(5);
  const [customInstructions, setCustomInstructions] = useState('');
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    }
  }, [initialInput]);

  useEffect(() => {
    // Reset state when tool changes
    clearResult();
    clearError();
  }, [toolId, clearResult, clearError]);

  const handleExecute = async () => {
    if (!input.trim() || !tool) return;
    
    try {
      await execute(toolId, input, {
        genre,
        length,
        intensity,
        customInstructions: customInstructions || undefined
      });
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleCopy = async () => {
    if (result?.content) {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = () => {
    if (onApply && result?.content) {
      onApply(result.content);
      onClose();
    }
  };

  const handleChainTool = (nextToolId: ToolId) => {
    if (onChainTool && result?.content) {
      onChainTool(nextToolId, result.content);
    }
  };

  const handleUseAsInput = () => {
    if (result?.content) {
      setInput(result.content);
      clearResult();
    }
  };

  const handleReset = () => {
    setInput('');
    clearResult();
    clearError();
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (result?.content) {
      const utterance = new SpeechSynthesisUtterance(result.content);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleExecute();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!tool) return null;

  const Icon = iconMap[tool.icon] || Sparkles;
  const isAnalysis = tool.category === 'analyze';
  const category = TOOL_CATEGORIES.find(c => c.id === tool.category);

  // Get suggested chain tools based on current tool
  const getChainSuggestions = (): ToolId[] => {
    const suggestions: Record<string, ToolId[]> = {
      // Generate -> Enhance chains
      'continue': ['improve', 'deepen-emotion', 'add-tension'],
      'first-draft': ['improve', 'show-not-tell', 'vary-sentences'],
      'dialogue': ['deepen-emotion', 'add-tension', 'character-voice'],
      'description': ['sensory-details', 'improve', 'show-not-tell'],
      'action': ['add-tension', 'vary-sentences', 'pacing'],
      'inner-monologue': ['deepen-emotion', 'show-not-tell', 'improve'],
      // Enhance -> Enhance chains
      'improve': ['vary-sentences', 'sensory-details', 'deepen-emotion'],
      'show-not-tell': ['improve', 'sensory-details', 'deepen-emotion'],
      'deepen-emotion': ['improve', 'vary-sentences', 'sensory-details'],
      'add-tension': ['pacing', 'improve', 'vary-sentences'],
      'vary-sentences': ['improve', 'sensory-details', 'deepen-emotion'],
      'sensory-details': ['improve', 'deepen-emotion', 'vary-sentences'],
    };
    return suggestions[toolId] || [];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              isFullscreen 
                ? 'inset-4' 
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] max-w-[95vw] h-[750px] max-h-[90vh]'
            }`}
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r ${category?.bgColor || 'from-gray-50'} to-white`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${getToolIconBg(tool)} shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{tool.name}</h2>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      tool.category === 'generate' ? 'bg-violet-100 text-violet-700' :
                      tool.category === 'enhance' ? 'bg-blue-100 text-blue-700' :
                      tool.category === 'analyze' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{tool.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {tool.shortcut && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                    {tool.shortcut}
                  </span>
                )}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Options Bar */}
            <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-4 flex-wrap">
              {/* Genre Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Genre:</span>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as Genre)}
                  className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                >
                  {GENRES.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Length (for generate/enhance tools) */}
              {!isAnalysis && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Length:</span>
                  <div className="flex gap-1">
                    {(['short', 'medium', 'long'] as const).map(len => (
                      <button
                        key={len}
                        onClick={() => setLength(len)}
                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                          length === len
                            ? 'bg-violet-100 text-violet-700 font-medium'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {len.charAt(0).toUpperCase() + len.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <Settings className="w-3 h-3" />
                Advanced
                <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Advanced Options */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 py-3 bg-gray-50/30 border-b border-gray-100 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {/* Intensity Slider */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-2 block">
                        Intensity: {intensity}/10
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={intensity}
                        onChange={(e) => setIntensity(parseInt(e.target.value))}
                        className="w-full accent-violet-600"
                      />
                    </div>

                    {/* Custom Instructions */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-2 block">
                        Custom Instructions
                      </label>
                      <input
                        type="text"
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="Any special requirements..."
                        className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Input Panel */}
              <div className="flex-1 flex flex-col border-r border-gray-100">
                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                  <span className="text-xs font-medium text-gray-500">INPUT</span>
                </div>
                <div className="flex-1 p-4">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={tool.placeholders.input}
                    className="w-full h-full resize-none bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm leading-relaxed"
                  />
                </div>
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {input.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      disabled={!input && !result}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3 inline mr-1" />
                      Reset
                    </button>
                    <button
                      onClick={handleExecute}
                      disabled={!input.trim() || isLoading}
                      className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                        isLoading
                          ? 'bg-gray-200 text-gray-500 cursor-wait'
                          : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {isAnalysis ? 'Analyze' : 'Generate'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Panel */}
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">OUTPUT</span>
                  {result?.content && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleSpeak}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title={isSpeaking ? 'Stop' : 'Read aloud'}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setIsPinned(!isPinned)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title={isPinned ? 'Unpin' : 'Pin'}
                      >
                        {isPinned ? <BookmarkCheck className="w-3.5 h-3.5 text-violet-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
                
                <div ref={outputRef} className="flex-1 p-4 overflow-y-auto">
                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Error</p>
                        <p className="text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
                        <p className="text-sm text-gray-500 mt-3">
                          {isAnalysis ? 'Analyzing your text...' : 'Generating content...'}
                        </p>
                      </div>
                    </div>
                  )}

                  {!isLoading && !error && !result && (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">{tool.placeholders.output}</p>
                      </div>
                    </div>
                  )}

                  {!isLoading && !error && result && (
                    <div className="space-y-4">
                      {/* Analysis Results */}
                      {isAnalysis && result.analysis && (
                        <AnalysisResultDisplay analysis={result.analysis} />
                      )}

                      {/* Text Output */}
                      {result.content && !isAnalysis && (
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                            {result.content}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      {result.metadata && (
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                          {result.metadata.tokensUsed > 0 && (
                            <span>Tokens: {result.metadata.tokensUsed}</span>
                          )}
                          {result.content && (
                            <span>Words: {result.content.split(/\s+/).filter(Boolean).length}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Output Actions */}
                {result?.content && (
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      {/* Chain Tools */}
                      {!isAnalysis && getChainSuggestions().length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Chain with:</span>
                          {getChainSuggestions().map(nextToolId => {
                            const nextTool = getToolById(nextToolId);
                            if (!nextTool) return null;
                            const NextIcon = iconMap[nextTool.icon] || Sparkles;
                            return (
                              <button
                                key={nextToolId}
                                onClick={() => handleChainTool(nextToolId)}
                                className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                              >
                                <NextIcon className="w-3 h-3" />
                                {nextTool.name}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={handleUseAsInput}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          Use as Input
                        </button>
                        {onApply && (
                          <button
                            onClick={handleApply}
                            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Analysis Result Display Component
function AnalysisResultDisplay({ analysis }: { analysis: AnalysisResult }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['issues', 'suggestions']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Score */}
      {typeof analysis.score === 'number' && (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke={analysis.score >= 70 ? '#10b981' : analysis.score >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="6"
                strokeDasharray={`${(analysis.score / 100) * 176} 176`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
              {analysis.score}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">Overall Score</p>
            <p className="text-sm text-gray-500">
              {analysis.score >= 70 ? 'Good' : analysis.score >= 40 ? 'Needs Improvement' : 'Needs Work'}
            </p>
          </div>
        </div>
      )}

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('issues')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-900">Issues ({analysis.issues.length})</span>
            {expandedSections.has('issues') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSections.has('issues') && (
            <div className="divide-y divide-gray-100">
              {analysis.issues.map((issue, idx) => (
                <div key={idx} className="p-3 flex gap-3">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{issue.message}</p>
                    {issue.suggestion && (
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Suggestion:</span> {issue.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('suggestions')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-900">Suggestions ({analysis.suggestions.length})</span>
            {expandedSections.has('suggestions') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSections.has('suggestions') && (
            <div className="p-3 space-y-2">
              {analysis.suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Metrics */}
      {analysis.metrics && Object.keys(analysis.metrics).length > 0 && (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('metrics')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-900">Metrics</span>
            {expandedSections.has('metrics') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedSections.has('metrics') && (
            <div className="p-3 grid grid-cols-2 gap-3">
              {Object.entries(analysis.metrics).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-sm font-medium text-gray-900">{String(value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ToolExecutionPanel;
