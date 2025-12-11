'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, Save, Send, ArrowRight, ChevronDown, ChevronRight,
  Download, Copy, Check, Loader2, AlertCircle, Sparkles,
  FileText, BookOpen, Layers, RotateCcw, Wand2, Star,
  ArrowRightCircle, CheckCircle, Clock, Zap
} from 'lucide-react';
import { 
  ToolId, ToolResult, ToolContext, HybridScopeSelection, 
  SaveAction, SaveRequest, ToolOptions, AITool
} from './types';
import { getToolById, getChainableTools, getToolIconBg, getScopeBadgeClass, getScopeLabel } from './tool-definitions';

// ============================================================================
// ICON MAPPING
// ============================================================================

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowRight: ArrowRight,
  FileText: FileText,
  MessageSquare: Sparkles,
  Palette: Sparkles,
  Zap: Zap,
  Brain: Sparkles,
  Star: Star,
  Eye: Sparkles,
  Heart: Sparkles,
  Flame: Sparkles,
  TrendingUp: Sparkles,
  Sparkles: Sparkles,
  BarChart3: Sparkles,
  Users: Sparkles,
  Search: Sparkles,
  Hash: Sparkles,
  Activity: Sparkles,
  BookOpen: BookOpen,
  Shuffle: Sparkles,
  UserPlus: Sparkles,
  Globe: Sparkles,
  Swords: Sparkles,
  GitBranch: Sparkles,
  Layout: Layers,
  Wand2: Wand2,
  Lightbulb: Sparkles
};

// ============================================================================
// HYBRID SCOPE SELECTOR
// ============================================================================

interface HybridScopeSelectorProps {
  tool: AITool;
  bookId: string;
  documentId?: string;
  selection: HybridScopeSelection | null;
  onSelectionChange: (selection: HybridScopeSelection) => void;
}

function HybridScopeSelector({ tool, bookId, documentId, selection, onSelectionChange }: HybridScopeSelectorProps) {
  const modes = [
    { id: 'this-scene', label: 'This Scene', icon: FileText, description: 'Run on current scene only', disabled: !documentId },
    { id: 'selected-chapters', label: 'Selected Chapters', icon: Layers, description: 'Choose specific chapters', disabled: false },
    { id: 'whole-book', label: 'Whole Book', icon: BookOpen, description: 'Analyze entire manuscript', disabled: false }
  ] as const;

  return (
    <div className="bg-teal-50 dark:bg-teal-950/30 rounded-xl p-4 border border-teal-200 dark:border-teal-800">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        <span className="text-sm font-medium text-teal-800 dark:text-teal-200">
          Choose Scope for {tool.name}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selection?.mode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => !mode.disabled && onSelectionChange({
                mode: mode.id,
                bookId,
                sceneId: mode.id === 'this-scene' ? documentId : undefined,
                chapterIds: mode.id === 'selected-chapters' ? [] : undefined
              })}
              disabled={mode.disabled}
              className={`
                p-3 rounded-lg border-2 text-left transition-all
                ${isSelected 
                  ? 'border-teal-500 bg-teal-100 dark:bg-teal-900/50' 
                  : mode.disabled
                    ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                    : 'border-transparent bg-white dark:bg-gray-800 hover:border-teal-300'
                }
              `}
            >
              <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-teal-600' : 'text-gray-400'}`} />
              <div className="text-sm font-medium text-gray-900 dark:text-white">{mode.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{mode.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TOOL OPTIONS PANEL
// ============================================================================

interface ToolOptionsPanelProps {
  tool: AITool;
  options: ToolOptions;
  onChange: (options: ToolOptions) => void;
}

function ToolOptionsPanel({ tool, options, onChange }: ToolOptionsPanelProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Options</span>
      </div>
      
      {/* Length selector */}
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Output Length</label>
        <div className="flex gap-2">
          {(['short', 'medium', 'long'] as const).map((length) => (
            <button
              key={length}
              onClick={() => onChange({ ...options, length })}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all
                ${options.length === length
                  ? 'bg-violet-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }
              `}
            >
              {length}
            </button>
          ))}
        </div>
      </div>

      {/* Custom instructions */}
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Custom Instructions (optional)</label>
        <textarea
          value={options.customInstructions || ''}
          onChange={(e) => onChange({ ...options, customInstructions: e.target.value })}
          placeholder="Add any specific instructions for the AI..."
          rows={2}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>
    </div>
  );
}

// ============================================================================
// SAVE BAR COMPONENT
// ============================================================================

interface SaveBarProps {
  result: ToolResult | null;
  tool: AITool;
  onSave: () => void;
  onSaveAndSend: (nextToolId: ToolId) => void;
  onDownload: (format: 'txt' | 'md' | 'html') => void;
  onCopy: () => void;
  isSaving: boolean;
}

function SaveBar({ result, tool, onSave, onSaveAndSend, onDownload, onCopy, isSaving }: SaveBarProps) {
  const [showChainMenu, setShowChainMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const chainableTools = useMemo(() => getChainableTools(tool.id), [tool]);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!result?.success) return null;

  return (
    <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Download & Copy */}
        <div className="flex items-center gap-2">
          {/* Download dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Save Locally</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showDownloadMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden min-w-[160px]"
                >
                  {[
                    { format: 'txt' as const, label: 'Plain Text (.txt)' },
                    { format: 'md' as const, label: 'Markdown (.md)' },
                    { format: 'html' as const, label: 'HTML (.html)' }
                  ].map(({ format, label }) => (
                    <button
                      key={format}
                      onClick={() => {
                        onDownload(format);
                        setShowDownloadMenu(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Right side - Save & Pass Along */}
        <div className="flex items-center gap-3">
          {/* Save button */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save</span>
          </button>

          {/* Save & Send dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowChainMenu(!showChainMenu)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Send className="w-4 h-4" />
              <span>Save & Send</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showChainMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden min-w-[280px] max-h-[400px] overflow-y-auto"
                >
                  {/* Same category tools */}
                  <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Continue in {tool.category}
                    </div>
                    {chainableTools
                      .filter(t => t.category === tool.category)
                      .map(chainTool => {
                        const Icon = iconComponents[chainTool.icon] || Sparkles;
                        return (
                          <button
                            key={chainTool.id}
                            onClick={() => {
                              onSaveAndSend(chainTool.id);
                              setShowChainMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <div className={`p-1.5 rounded-lg ${getToolIconBg(chainTool)}`}>
                              <Icon className="w-3 h-3 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{chainTool.name}</div>
                            </div>
                            <ArrowRightCircle className="w-4 h-4 text-gray-400" />
                          </button>
                        );
                      })}
                  </div>

                  {/* Polish/Enhance tools */}
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Polish It
                    </div>
                    {chainableTools
                      .filter(t => t.category === 'enhance' && t.category !== tool.category)
                      .slice(0, 4)
                      .map(chainTool => {
                        const Icon = iconComponents[chainTool.icon] || Sparkles;
                        return (
                          <button
                            key={chainTool.id}
                            onClick={() => {
                              onSaveAndSend(chainTool.id);
                              setShowChainMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <div className={`p-1.5 rounded-lg ${getToolIconBg(chainTool)}`}>
                              <Icon className="w-3 h-3 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{chainTool.name}</div>
                            </div>
                            <ArrowRightCircle className="w-4 h-4 text-gray-400" />
                          </button>
                        );
                      })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WORKFLOW TRAIL COMPONENT
// ============================================================================

interface WorkflowTrailProps {
  steps: Array<{ toolId: ToolId; wordCount: number }>;
  currentToolId: ToolId;
}

export function WorkflowTrail({ steps, currentToolId }: WorkflowTrailProps) {
  if (steps.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-950/30 rounded-lg overflow-x-auto">
      <span className="text-xs text-violet-600 dark:text-violet-400 font-medium whitespace-nowrap">Workflow:</span>
      {steps.map((step, idx) => {
        const tool = getToolById(step.toolId);
        if (!tool) return null;
        const Icon = iconComponents[tool.icon] || Sparkles;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ArrowRight className="w-3 h-3 text-violet-400 flex-shrink-0" />}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 rounded-md whitespace-nowrap">
              <Icon className="w-3 h-3 text-violet-600" />
              <span className="text-xs text-gray-700 dark:text-gray-300">{tool.name}</span>
              {step.wordCount > 0 && (
                <span className="text-[10px] text-gray-400">({step.wordCount}w)</span>
              )}
            </div>
          </React.Fragment>
        );
      })}
      <ArrowRight className="w-3 h-3 text-violet-400 flex-shrink-0" />
      <div className="flex items-center gap-1.5 px-2 py-1 bg-violet-600 text-white rounded-md whitespace-nowrap">
        <span className="text-xs font-medium">{getToolById(currentToolId)?.name}</span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN TOOL EXECUTION PANEL
// ============================================================================

interface ToolExecutionPanelProps {
  toolId: ToolId;
  bookId: string;
  documentId?: string;
  onClose: () => void;
  onSaveAndSend: (nextToolId: ToolId) => void;
  preloadedInput?: string;
  workflowSteps?: Array<{ toolId: ToolId; wordCount: number }>;
}

export function ToolExecutionPanel({
  toolId,
  bookId,
  documentId,
  onClose,
  onSaveAndSend,
  preloadedInput = '',
  workflowSteps = []
}: ToolExecutionPanelProps) {
  const tool = getToolById(toolId);
  
  // State
  const [input, setInput] = useState(preloadedInput);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ToolOptions>({ length: 'medium' });
  const [hybridSelection, setHybridSelection] = useState<HybridScopeSelection | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  // Initialize hybrid selection for hybrid tools
  useEffect(() => {
    if (tool?.scope === 'hybrid' && documentId) {
      setHybridSelection({
        mode: 'this-scene',
        bookId,
        sceneId: documentId
      });
    }
  }, [tool?.scope, bookId, documentId]);

  if (!tool) {
    return (
      <div className="fixed inset-y-0 right-0 w-[600px] bg-white dark:bg-gray-900 shadow-2xl flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Tool not found</p>
        </div>
      </div>
    );
  }

  const Icon = iconComponents[tool.icon] || Sparkles;

  // Run tool
  const handleRun = async () => {
    if (!input.trim()) {
      setError('Please enter some content');
      return;
    }

    // Validate input length
    if (tool.minInputLength && input.length < tool.minInputLength) {
      setError(`Input must be at least ${tool.minInputLength} characters`);
      return;
    }

    setIsRunning(true);
    setError(null);
    setResult(null);
    setOutput('');

    try {
      const response = await fetch('/api/ai-studio/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          input,
          context: {
            bookId,
            documentId,
            userId: 'current-user' // Will be replaced with actual user ID
          },
          options,
          scopeSelection: tool.scope === 'hybrid' ? hybridSelection : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Tool execution failed');
      }

      const data = await response.json();
      setResult(data);
      setOutput(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  // Save result
  const handleSave = async () => {
    if (!result) return;
    
    setIsSaving(true);
    try {
      await fetch('/api/ai-studio/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save' as SaveAction,
          toolRunId: result.metadata.toolRunId,
          content: output,
          metadata: result.metadata
        } as SaveRequest)
      });
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Save and send to next tool
  const handleSaveAndSend = async (nextToolId: ToolId) => {
    if (!result) return;
    
    setIsSaving(true);
    try {
      await fetch('/api/ai-studio/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-and-send' as SaveAction,
          toolRunId: result.metadata.toolRunId,
          content: output,
          metadata: result.metadata,
          nextToolId
        } as SaveRequest)
      });
      
      onSaveAndSend(nextToolId);
    } catch (err) {
      console.error('Save and send failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Download output
  const handleDownload = (format: 'txt' | 'md' | 'html') => {
    if (!output) return;

    let content = output;
    let mimeType = 'text/plain';
    let extension = format;

    if (format === 'md') {
      content = `# ${tool.name} Output\n\n${output}`;
      mimeType = 'text/markdown';
    } else if (format === 'html') {
      content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${tool.name} Output</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1 { color: #4f46e5; }
  </style>
</head>
<body>
  <h1>${tool.name} Output</h1>
  <div>${output.replace(/\n/g, '<br>')}</div>
</body>
</html>`;
      mimeType = 'text/html';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.name.toLowerCase().replace(/\s+/g, '-')}-output.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-y-0 right-0 w-[600px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${getToolIconBg(tool)}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{tool.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getScopeBadgeClass(tool.scope)}`}>
                {getScopeLabel(tool.scope)} Scope
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Workflow Trail */}
      {workflowSteps.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800">
          <WorkflowTrail steps={workflowSteps} currentToolId={toolId} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Hybrid Scope Selector */}
        {tool.scope === 'hybrid' && (
          <HybridScopeSelector
            tool={tool}
            bookId={bookId}
            documentId={documentId}
            selection={hybridSelection}
            onSelectionChange={setHybridSelection}
          />
        )}

        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tool.placeholders.input}
            rows={8}
            className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {input.length} / {tool.maxInputLength} characters
            </span>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
            >
              {showOptions ? 'Hide options' : 'Show options'}
            </button>
          </div>
        </div>

        {/* Options */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ToolOptionsPanel tool={tool} options={options} onChange={setOptions} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Run Button */}
        <button
          onClick={handleRun}
          disabled={isRunning || !input.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Run {tool.name}</span>
            </>
          )}
        </button>

        {/* Output */}
        {output && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Output
            </label>
            <div className="w-full min-h-[200px] px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl whitespace-pre-wrap">
              {output}
            </div>
            {result?.metadata && (
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {result.metadata.tokensUsed} tokens
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {(result.metadata.processingTime / 1000).toFixed(1)}s
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Bar */}
      <SaveBar
        result={result}
        tool={tool}
        onSave={handleSave}
        onSaveAndSend={handleSaveAndSend}
        onDownload={handleDownload}
        onCopy={handleCopy}
        isSaving={isSaving}
      />
    </motion.div>
  );
}

export default ToolExecutionPanel;


