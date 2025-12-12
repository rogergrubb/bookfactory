'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, Copy, Check, ArrowRight, Replace, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, SubOption, Selection } from './types';
import { categoryMeta } from './tool-definitions';

interface ToolPanelProps {
  tool: Tool;
  subOption?: SubOption | null;
  selection?: Selection | null;
  onClose: () => void;
  onGenerate: (instruction?: string) => Promise<string>;
  onInsertAfter: (text: string) => void;
  onReplace: (text: string) => void;
  onInsertAtCursor: (text: string) => void;
  isGenerating?: boolean;
}

export function ToolPanel({
  tool,
  subOption,
  selection,
  onClose,
  onGenerate,
  onInsertAfter,
  onReplace,
  onInsertAtCursor,
  isGenerating: externalIsGenerating,
}: ToolPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [customInstruction, setCustomInstruction] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedSubOption, setSelectedSubOption] = useState<SubOption | null>(subOption || null);

  const meta = categoryMeta[tool.category];
  const isCustomMode = selectedSubOption?.id === 'custom';
  const hasResult = result.length > 0;
  const loading = isGenerating || externalIsGenerating;

  // Color mapping for Tailwind
  const colorStyles: Record<string, { button: string; border: string; bg: string }> = {
    emerald: { button: 'bg-emerald-500 hover:bg-emerald-600', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
    blue: { button: 'bg-blue-500 hover:bg-blue-600', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
    amber: { button: 'bg-amber-500 hover:bg-amber-600', border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
    purple: { button: 'bg-purple-500 hover:bg-purple-600', border: 'border-purple-500/30', bg: 'bg-purple-500/5' },
    rose: { button: 'bg-rose-500 hover:bg-rose-600', border: 'border-rose-500/30', bg: 'bg-rose-500/5' },
  };

  const colors = colorStyles[meta.color] || colorStyles.emerald;

  // Reset when tool changes
  useEffect(() => {
    setResult('');
    setError(null);
    setCustomInstruction('');
    setSelectedSubOption(subOption || null);
  }, [tool.id, subOption]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setResult('');

    try {
      const instruction = isCustomMode ? customInstruction : undefined;
      const generated = await onGenerate(instruction);
      setResult(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
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
    onClose();
  };

  const handleReplace = () => {
    onReplace(result);
    onClose();
  };

  // Check if tool has sub-options to choose from
  const showSubOptions = tool.hasSubMenu && tool.subOptions && !selectedSubOption && !subOption;

  return (
    <div className="w-[380px] h-full flex flex-col bg-stone-900 border-l border-stone-800">
      {/* Header */}
      <div className={cn('flex items-center gap-3 px-4 py-3 border-b', colors.border, colors.bg)}>
        <tool.icon className="w-5 h-5 text-stone-300" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-stone-100">{tool.name}</h3>
          {selectedSubOption && (
            <p className="text-xs text-stone-400">{selectedSubOption.name}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Sub-option Selection */}
        {showSubOptions && (
          <div className="p-4 border-b border-stone-800">
            <p className="text-sm text-stone-400 mb-3">Choose an option:</p>
            <div className="space-y-1">
              {tool.subOptions?.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedSubOption(opt)}
                  className="w-full px-3 py-2 rounded text-left text-sm transition-all flex items-center gap-2 hover:bg-stone-800 text-stone-300 hover:text-stone-100"
                >
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selection Preview */}
        {selection && tool.requiresSelection && (
          <div className="px-4 py-3 border-b border-stone-800">
            <p className="text-xs text-stone-500 mb-1">Selected text:</p>
            <div className="bg-stone-800 rounded p-2 text-sm text-stone-300 max-h-[100px] overflow-y-auto">
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
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-500 resize-none focus:outline-none focus:border-teal-500"
              rows={3}
            />
          </div>
        )}

        {/* Tool Description */}
        {!showSubOptions && !hasResult && (
          <div className="px-4 py-3">
            <p className="text-sm text-stone-400">{tool.description}</p>
            
            {tool.requiresSelection && !selection && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-amber-300">
                  Select some text in your chapter first
                </p>
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        {!showSubOptions && !hasResult && (
          <div className="px-4 py-3">
            <button
              onClick={handleGenerate}
              disabled={loading || (tool.requiresSelection && !selection) || (isCustomMode && !customInstruction.trim())}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                colors.button
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="px-4 py-3">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Result Display */}
        {hasResult && (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-400">Result:</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-300"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-stone-800 rounded-lg p-3 text-sm text-stone-200 max-h-[300px] overflow-y-auto whitespace-pre-wrap">
              {result}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              {selection ? (
                <>
                  <button
                    onClick={handleReplace}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium"
                  >
                    <Replace className="w-4 h-4" />
                    Replace
                  </button>
                  <button
                    onClick={handleInsert}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm font-medium"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Insert After
                  </button>
                </>
              ) : (
                <button
                  onClick={handleInsert}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Insert at Cursor
                </button>
              )}
            </div>

            {/* Generate More */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-stone-700 hover:bg-stone-800 text-stone-400 text-sm"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              Generate Another
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-stone-800 bg-stone-900/50">
        <div className="flex items-center justify-between text-xs text-stone-600">
          <span>
            <kbd className="bg-stone-800 px-1 rounded">Esc</kbd> to close
          </span>
          {hasResult && (
            <span>
              <kbd className="bg-stone-800 px-1 rounded">Enter</kbd> to insert
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
