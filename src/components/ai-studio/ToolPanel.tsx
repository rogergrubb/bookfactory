'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, FileText, MessageSquare, Palette, Zap, Brain,
  Star, Eye, Heart, Flame, TrendingUp, Sparkles,
  BarChart3, Users, Search, BookOpen, Hash, Activity,
  Shuffle, UserPlus, Globe, Swords, GitBranch, Layout,
  X, Loader2, Copy, Check, RotateCcw, ChevronDown,
  Wand2, Send, BookMarked, Lightbulb, Clock, Settings,
  Download, Share2, Bookmark, MoreHorizontal, Maximize2,
  Minimize2, Volume2, VolumeX, Play, Pause
} from 'lucide-react';
import { AITool, ToolId, ToolContext, ToolOptions, Genre, Book, Character } from './types';
import { AI_TOOLS, GENRES, getToolById, getToolIconBg } from './tool-definitions';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowRight, FileText, MessageSquare, Palette, Zap, Brain,
  Star, Eye, Heart, Flame, TrendingUp, Sparkles,
  BarChart3, Users, Search, BookOpen, Hash, Activity,
  Shuffle, UserPlus, Globe, Swords, GitBranch, Layout,
  Wand2, Lightbulb
};

interface ToolPanelProps {
  toolId: ToolId;
  isOpen: boolean;
  onClose: () => void;
  initialInput?: string;
  context?: ToolContext;
  onApply?: (content: string) => void;
  books?: Book[];
  characters?: Character[];
}

export function ToolPanel({
  toolId,
  isOpen,
  onClose,
  initialInput = '',
  context,
  onApply,
  books = [],
  characters = []
}: ToolPanelProps) {
  const tool = getToolById(toolId);
  const [input, setInput] = useState(initialInput);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre>(context?.genre || 'literary');
  const [selectedBook, setSelectedBook] = useState<string>(context?.bookId || '');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>(context?.characterIds || []);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<ToolOptions>({
    length: 'medium',
    intensity: 5,
    customInstructions: ''
  });
  const [history, setHistory] = useState<Array<{ input: string; output: string; timestamp: Date }>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
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

  const Icon = tool ? iconMap[tool.icon] || Sparkles : Sparkles;

  const handleGenerate = async () => {
    if (!input.trim() || !tool) return;
    
    setIsLoading(true);
    setError(null);
    setOutput('');

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: toolId,
          content: input,
          genre: selectedGenre,
          bookId: selectedBook || undefined,
          characterIds: selectedCharacters.length > 0 ? selectedCharacters : undefined,
          options: {
            ...options,
            context: context
          }
        })
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      setOutput(data.content || data.text || '');
      
      // Add to history
      setHistory(prev => [{
        input,
        output: data.content || data.text || '',
        timestamp: new Date()
      }, ...prev.slice(0, 9)]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApply && output) {
      onApply(output);
      onClose();
    }
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (output) {
      const utterance = new SpeechSynthesisUtterance(output);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!tool) return null;

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
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] max-w-[95vw] h-[700px] max-h-[90vh]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${getToolIconBg(tool)} shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{tool.name}</h2>
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

            {/* Context Bar */}
            <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-4 flex-wrap">
              {/* Genre Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Genre:</span>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value as Genre)}
                  className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                >
                  {GENRES.map(genre => (
                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                  ))}
                </select>
              </div>

              {/* Book Selector */}
              {books.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Book:</span>
                  <select
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  >
                    <option value="">None</option>
                    {books.map(book => (
                      <option key={book.id} value={book.id}>{book.title}</option>
                    ))}
                  </select>
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
                  <div className="grid grid-cols-3 gap-4">
                    {/* Length */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Output Length</label>
                      <div className="flex gap-1">
                        {(['short', 'medium', 'long'] as const).map(len => (
                          <button
                            key={len}
                            onClick={() => setOptions(o => ({ ...o, length: len }))}
                            className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-all ${
                              options.length === len
                                ? 'bg-violet-100 text-violet-700 font-medium'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {len.charAt(0).toUpperCase() + len.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Intensity */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Intensity: {options.intensity}/10
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={options.intensity}
                        onChange={(e) => setOptions(o => ({ ...o, intensity: parseInt(e.target.value) }))}
                        className="w-full accent-violet-600"
                      />
                    </div>

                    {/* Character Selection */}
                    {characters.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Characters</label>
                        <div className="flex flex-wrap gap-1">
                          {characters.slice(0, 5).map(char => (
                            <button
                              key={char.id}
                              onClick={() => {
                                setSelectedCharacters(prev => 
                                  prev.includes(char.id)
                                    ? prev.filter(id => id !== char.id)
                                    : [...prev, char.id]
                                );
                              }}
                              className={`px-2 py-0.5 text-xs rounded-full transition-all ${
                                selectedCharacters.includes(char.id)
                                  ? 'bg-violet-100 text-violet-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {char.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom Instructions */}
                  <div className="mt-3">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Custom Instructions</label>
                    <input
                      type="text"
                      value={options.customInstructions}
                      onChange={(e) => setOptions(o => ({ ...o, customInstructions: e.target.value }))}
                      placeholder="Any specific requirements..."
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Input Section */}
              <div className="flex-1 flex flex-col border-r border-gray-100">
                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                  <span className="text-xs font-medium text-gray-500">INPUT</span>
                </div>
                <div className="flex-1 p-4 overflow-auto">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tool.placeholders.input}
                    className="w-full h-full resize-none text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm leading-relaxed"
                  />
                </div>
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {input.length} characters • {input.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={isLoading || !input.trim()}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                        isLoading || !input.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98]'
                      }`}
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
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Section */}
              <div className="flex-1 flex flex-col bg-gray-50/30">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">OUTPUT</span>
                  {output && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleSpeak}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all"
                        title={isSpeaking ? "Stop" : "Read aloud"}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all"
                        title="Copy"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
                <div 
                  ref={outputRef}
                  className="flex-1 p-4 overflow-auto"
                >
                  {error ? (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
                      <span className="text-sm">{error}</span>
                    </div>
                  ) : output ? (
                    <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {output}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className={`p-4 rounded-2xl ${getToolIconBg(tool)} opacity-20 mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-gray-400 text-sm max-w-xs">
                        {tool.placeholders.output}
                      </p>
                    </div>
                  )}
                </div>
                {output && (
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {output.length} characters • {output.split(/\s+/).filter(Boolean).length} words
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setOutput('')}
                        className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        Clear
                      </button>
                      {onApply && (
                        <button
                          onClick={handleApply}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Apply to Editor
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* History Drawer */}
            {history.length > 0 && (
              <div className="border-t border-gray-100">
                <details className="group">
                  <summary className="px-6 py-2 cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700 list-none flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Recent generations ({history.length})
                    <ChevronDown className="w-3 h-3 ml-auto group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 py-3 bg-gray-50/50 max-h-32 overflow-auto">
                    <div className="space-y-2">
                      {history.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInput(item.input);
                            setOutput(item.output);
                          }}
                          className="w-full text-left p-2 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
                        >
                          <div className="text-xs text-gray-800 truncate">{item.input.slice(0, 60)}...</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {item.timestamp.toLocaleTimeString()}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ToolPanel;
