// ToolExecutionPanel - Enhanced with Save & Pass-along workflow
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
  CheckCircle, Info, ChevronUp, Save, ChevronLeft, Workflow,
  ExternalLink, FileDown, FileType, FileCode
} from 'lucide-react';
import { ToolId, ToolResult, Genre, AnalysisResult, ToolCategory } from './types';
import { AI_TOOLS, GENRES, getToolById, getToolIconBg, TOOL_CATEGORIES, getToolsByCategory } from './tool-definitions';
import { useToolExecution } from './hooks';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowRight, FileText, MessageSquare, Palette, Zap, Brain,
  Star, Eye, Heart, Flame, TrendingUp, Sparkles,
  BarChart3, Users, Search, BookOpen, Hash, Activity,
  Shuffle, UserPlus, Globe, Swords, GitBranch, Layout,
  Wand2, Lightbulb
};

// Workflow step tracking
interface WorkflowStep {
  toolId: ToolId;
  toolName: string;
  timestamp: Date;
  wordCount: number;
}

interface ToolExecutionPanelProps {
  toolId: ToolId;
  isOpen: boolean;
  onClose: () => void;
  initialInput?: string;
  onApply?: (content: string) => void;
  onChainTool?: (toolId: ToolId, input: string) => void;
  workflowSteps?: WorkflowStep[];
  onWorkflowUpdate?: (steps: WorkflowStep[]) => void;
}

export function ToolExecutionPanel({
  toolId,
  isOpen,
  onClose,
  initialInput = '',
  onApply,
  onChainTool,
  workflowSteps = [],
  onWorkflowUpdate
}: ToolExecutionPanelProps) {
  const tool = getToolById(toolId);
  const { isLoading, error, result, execute, clearError, clearResult } = useToolExecution();
  
  const [input, setInput] = useState(initialInput);
  const [copied, setCopied] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showPassMenu, setShowPassMenu] = useState(false);
  const [internalWorkflow, setInternalWorkflow] = useState<WorkflowStep[]>(workflowSteps);
  
  // Options state
  const [genre, setGenre] = useState<Genre>('literary');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [intensity, setIntensity] = useState(5);
  const [customInstructions, setCustomInstructions] = useState('');
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const saveMenuRef = useRef<HTMLDivElement>(null);
  const passMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
        setShowSaveMenu(false);
      }
      if (passMenuRef.current && !passMenuRef.current.contains(e.target as Node)) {
        setShowPassMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    clearResult();
    clearError();
  }, [toolId, clearResult, clearError]);

  // Sync workflow steps
  useEffect(() => {
    setInternalWorkflow(workflowSteps);
  }, [workflowSteps]);

  const handleExecute = async () => {
    if (!input.trim() || !tool) return;
    
    try {
      const execResult = await execute(toolId, input, {
        genre,
        length,
        intensity,
        customInstructions: customInstructions || undefined
      });
      
      // Add to workflow trail
      if (execResult?.content) {
        const newStep: WorkflowStep = {
          toolId,
          toolName: tool.name,
          timestamp: new Date(),
          wordCount: execResult.content.split(/\s+/).filter(Boolean).length
        };
        const updatedWorkflow = [...internalWorkflow, newStep];
        setInternalWorkflow(updatedWorkflow);
        onWorkflowUpdate?.(updatedWorkflow);
      }
    } catch (err) {
      // Error handled in hook
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

  // Save locally functionality
  const handleSaveLocally = (format: 'txt' | 'md' | 'html') => {
    if (!result?.content || !tool) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${tool.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
    
    let content = result.content;
    let mimeType = 'text/plain';
    let extension = format;
    
    if (format === 'md') {
      content = `# ${tool.name} Output\n\n*Generated on ${new Date().toLocaleDateString()}*\n\n---\n\n${result.content}`;
      mimeType = 'text/markdown';
    } else if (format === 'html') {
      content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tool.name} Output</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.8; color: #333; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #e5e5e5; padding-bottom: 0.5rem; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }
    .content { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>${tool.name} Output</h1>
  <p class="meta">Generated on ${new Date().toLocaleDateString()}</p>
  <div class="content">${result.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
</body>
</html>`;
      mimeType = 'text/html';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowSaveMenu(false);
  };

  // Pass to next tool - stay in workflow
  const handlePassToTool = (nextToolId: ToolId) => {
    if (onChainTool && result?.content) {
      onChainTool(nextToolId, result.content);
    }
    setShowPassMenu(false);
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
    setInternalWorkflow([]);
    onWorkflowUpdate?.([]);
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

  // Get tools in the same category for "pass to next" suggestions
  const getSameCategoryTools = (): ToolId[] => {
    const categoryTools = getToolsByCategory(tool.category);
    return categoryTools
      .filter(t => t.id !== toolId)
      .map(t => t.id);
  };

  // Get smart chain suggestions based on current tool
  const getChainSuggestions = (): ToolId[] => {
    const suggestions: Record<string, ToolId[]> = {
      // Generate -> Generate (workflow within same category)
      'continue': ['first-draft', 'dialogue', 'description', 'action', 'inner-monologue'],
      'first-draft': ['continue', 'dialogue', 'description', 'action', 'inner-monologue'],
      'dialogue': ['continue', 'first-draft', 'inner-monologue', 'action'],
      'description': ['continue', 'first-draft', 'dialogue', 'action'],
      'action': ['continue', 'dialogue', 'description', 'inner-monologue'],
      'inner-monologue': ['continue', 'dialogue', 'description', 'action'],
      // Enhance tools
      'improve': ['vary-sentences', 'sensory-details', 'deepen-emotion'],
      'show-not-tell': ['improve', 'sensory-details', 'deepen-emotion'],
      'deepen-emotion': ['improve', 'vary-sentences', 'sensory-details'],
      'add-tension': ['improve', 'vary-sentences', 'deepen-emotion'],
      'vary-sentences': ['improve', 'sensory-details', 'deepen-emotion'],
      'sensory-details': ['improve', 'deepen-emotion', 'vary-sentences'],
    };
    return suggestions[toolId] || getSameCategoryTools();
  };

  // Get enhance tools for "Polish it" quick action
  const getEnhanceTools = (): ToolId[] => {
    return ['improve', 'show-not-tell', 'deepen-emotion', 'add-tension', 'vary-sentences', 'sensory-details'];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-screen container with flexbox centering */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            
            {/* Panel - 90% of screen, centered */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
                isFullscreen 
                  ? 'w-full h-full' 
                  : 'w-[90vw] h-[90vh] max-w-[1400px]'
              }`}
              onKeyDown={handleKeyDown}
            >
              {/* Header with Workflow Trail */}
              <div className="flex-shrink-0">
                {/* Workflow Trail */}
                {internalWorkflow.length > 0 && (
                  <div className="px-6 py-2 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
                    <div className="flex items-center gap-2 text-xs">
                      <Workflow className="w-3.5 h-3.5 text-violet-500" />
                      <span className="text-violet-600 font-medium">Workflow:</span>
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {internalWorkflow.map((step, idx) => (
                          <React.Fragment key={idx}>
                            {idx > 0 && <ChevronRight className="w-3 h-3 text-violet-300 flex-shrink-0" />}
                            <span className="px-2 py-0.5 bg-white rounded-full text-violet-700 whitespace-nowrap">
                              {step.toolName}
                              <span className="text-violet-400 ml-1">({step.wordCount}w)</span>
                            </span>
                          </React.Fragment>
                        ))}
                        <ChevronRight className="w-3 h-3 text-violet-300 flex-shrink-0" />
                        <span className="px-2 py-0.5 bg-violet-100 rounded-full text-violet-800 font-medium whitespace-nowrap">
                          {tool.name}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Main Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${getToolIconBg(tool)} shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
                      <p className="text-sm text-gray-500">{tool.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {tool.shortcut && (
                      <kbd className="px-2.5 py-1 text-xs bg-gray-100 text-gray-500 rounded-lg border border-gray-200">
                        {tool.shortcut}
                      </kbd>
                    )}
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className={`p-2 rounded-lg transition-colors ${showAdvanced ? 'bg-violet-100 text-violet-600' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isFullscreen ? <Minimize2 className="w-5 h-5 text-gray-500" /> : <Maximize2 className="w-5 h-5 text-gray-500" />}
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-gray-100 bg-gray-50/50 overflow-hidden flex-shrink-0"
                  >
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        {/* Genre */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Genre Style</label>
                          <select
                            value={genre}
                            onChange={(e) => setGenre(e.target.value as Genre)}
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          >
                            {GENRES.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Length */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Output Length</label>
                          <select
                            value={length}
                            onChange={(e) => setLength(e.target.value as 'short' | 'medium' | 'long')}
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          >
                            <option value="short">Short (~200 words)</option>
                            <option value="medium">Medium (~400 words)</option>
                            <option value="long">Long (~700 words)</option>
                          </select>
                        </div>
                        
                        {/* Intensity */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Intensity: {intensity}/10
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={intensity}
                            onChange={(e) => setIntensity(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                          />
                        </div>
                      </div>
                      
                      {/* Custom Instructions */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Custom Instructions</label>
                        <input
                          type="text"
                          value={customInstructions}
                          onChange={(e) => setCustomInstructions(e.target.value)}
                          placeholder="Add specific instructions for the AI..."
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Content - Split View */}
              <div className="flex-1 flex min-h-0">
                {/* Input Panel */}
                <div className="flex-1 flex flex-col border-r border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Input</span>
                  </div>
                  <div className="flex-1 p-4 min-h-0">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={tool.placeholders?.input || 'Enter your text here...'}
                      className="w-full h-full resize-none text-gray-800 placeholder-gray-400 focus:outline-none text-[15px] leading-relaxed"
                    />
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{input.split(/\s+/).filter(Boolean).length} words</span>
                      <span>•</span>
                      <span>{input.length} characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                      <button
                        onClick={handleExecute}
                        disabled={isLoading || !input.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate
                            <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded">⌘↵</kbd>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Output Panel */}
                <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50/50 to-white">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Output</span>
                    {result?.content && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleSpeak}
                          className={`p-1.5 rounded-md transition-colors ${isSpeaking ? 'bg-violet-100 text-violet-600' : 'hover:bg-gray-100 text-gray-500'}`}
                          title={isSpeaking ? 'Stop' : 'Read aloud'}
                        >
                          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={handleCopy}
                          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                          title="Copy to clipboard"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div ref={outputRef} className="flex-1 p-4 overflow-y-auto min-h-0">
                    {error && (
                      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Generation Failed</p>
                          <p className="text-sm mt-1 opacity-80">{error}</p>
                        </div>
                      </div>
                    )}
                    
                    {isLoading && (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-violet-100 rounded-full" />
                          <div className="absolute inset-0 w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="mt-4 text-sm">Generating your content...</p>
                      </div>
                    )}
                    
                    {!isLoading && !error && !result && (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Icon className="w-12 h-12 opacity-20 mb-3" />
                        <p className="text-sm">{tool.placeholders?.output || 'Output will appear here...'}</p>
                      </div>
                    )}
                    
                    {result && !isAnalysis && (
                      <div className="prose prose-gray max-w-none">
                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                          {result.content}
                        </div>

                        {/* Metadata */}
                        {result.metadata && (
                          <div className="flex items-center gap-4 pt-4 mt-4 border-t border-gray-100 text-xs text-gray-400">
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
                    
                    {result?.analysis && isAnalysis && (
                      <AnalysisResultDisplay analysis={result.analysis} />
                    )}
                  </div>

                  {/* Output Actions - Enhanced with Save & Pass */}
                  {result?.content && (
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                      <div className="flex items-center justify-between gap-4">
                        {/* Left: Save & Pass Actions */}
                        <div className="flex items-center gap-2">
                          {/* Save Locally Dropdown */}
                          <div className="relative" ref={saveMenuRef}>
                            <button
                              onClick={() => setShowSaveMenu(!showSaveMenu)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Save Locally
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            
                            <AnimatePresence>
                              {showSaveMenu && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10"
                                >
                                  <div className="p-1">
                                    <button
                                      onClick={() => handleSaveLocally('txt')}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                      <FileText className="w-4 h-4 text-gray-400" />
                                      Plain Text (.txt)
                                    </button>
                                    <button
                                      onClick={() => handleSaveLocally('md')}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                      <FileCode className="w-4 h-4 text-gray-400" />
                                      Markdown (.md)
                                    </button>
                                    <button
                                      onClick={() => handleSaveLocally('html')}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                      <FileType className="w-4 h-4 text-gray-400" />
                                      Web Page (.html)
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Pass to Next Tool Dropdown */}
                          {!isAnalysis && (
                            <div className="relative" ref={passMenuRef}>
                              <button
                                onClick={() => setShowPassMenu(!showPassMenu)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 text-violet-700 rounded-lg hover:from-violet-100 hover:to-purple-100 transition-colors"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                Pass to Next Tool
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              
                              <AnimatePresence>
                                {showPassMenu && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10"
                                  >
                                    {/* Same Category Tools */}
                                    <div className="p-2 border-b border-gray-100">
                                      <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Continue in {category?.name}
                                      </p>
                                      <div className="space-y-0.5">
                                        {getChainSuggestions().slice(0, 4).map(nextToolId => {
                                          const nextTool = getToolById(nextToolId);
                                          if (!nextTool || nextTool.category !== tool.category) return null;
                                          const NextIcon = iconMap[nextTool.icon] || Sparkles;
                                          return (
                                            <button
                                              key={nextToolId}
                                              onClick={() => handlePassToTool(nextToolId)}
                                              className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                              <div className={`p-1.5 rounded-md ${getToolIconBg(nextTool)}`}>
                                                <NextIcon className="w-3 h-3 text-white" />
                                              </div>
                                              <div className="text-left">
                                                <p className="font-medium text-gray-800">{nextTool.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{nextTool.description}</p>
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    
                                    {/* Enhance Tools */}
                                    {tool.category === 'generate' && (
                                      <div className="p-2">
                                        <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Polish It
                                        </p>
                                        <div className="space-y-0.5">
                                          {getEnhanceTools().slice(0, 3).map(nextToolId => {
                                            const nextTool = getToolById(nextToolId);
                                            if (!nextTool) return null;
                                            const NextIcon = iconMap[nextTool.icon] || Sparkles;
                                            return (
                                              <button
                                                key={nextToolId}
                                                onClick={() => handlePassToTool(nextToolId)}
                                                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                              >
                                                <div className={`p-1.5 rounded-md ${getToolIconBg(nextTool)}`}>
                                                  <NextIcon className="w-3 h-3 text-white" />
                                                </div>
                                                <div className="text-left">
                                                  <p className="font-medium text-gray-800">{nextTool.name}</p>
                                                  <p className="text-xs text-gray-500 truncate">{nextTool.description}</p>
                                                </div>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>

                        {/* Right: Apply & Use as Input */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleUseAsInput}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            Use as Input
                          </button>
                          {onApply && (
                            <button
                              onClick={handleApply}
                              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Apply to Editor
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
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
              <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="6" />
              <circle
                cx="32" cy="32" r="28" fill="none"
                stroke={analysis.score >= 70 ? '#10b981' : analysis.score >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="6"
                strokeDasharray={(analysis.score / 100) * 176 + ' 176'}
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
      {analysis.issues && analysis.issues.length > 0 && (
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
      {analysis.suggestions && analysis.suggestions.length > 0 && (
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
