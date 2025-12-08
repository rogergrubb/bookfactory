'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Wand2, MessageSquare, Brain, Lightbulb, Target,
  Users, BookOpen, Palette, Zap, Mic, FileText, TrendingUp,
  Heart, Swords, Map, Clock, Eye, RefreshCw, Copy, Check,
  ChevronRight, ArrowRight, Play, Pause, Volume2, Settings,
  Star, Feather, PenTool, Glasses, Theater, Ghost, Flame,
  Search, Command, CornerDownLeft, X, Loader2, Send,
  BookMarked, Compass, Layers, Grid3X3, BarChart3, Quote
} from 'lucide-react';

// Apple-inspired color system
const colors = {
  bg: 'bg-[#fbfbfd]',
  card: 'bg-white',
  text: 'text-[#1d1d1f]',
  muted: 'text-[#86868b]',
  border: 'border-[#d2d2d7]',
  accent: 'bg-[#0071e3]',
  accentHover: 'hover:bg-[#0077ed]',
  accentText: 'text-[#0071e3]',
  gradient: 'bg-gradient-to-br from-[#fbfbfd] to-[#f5f5f7]',
};

// AI Tool Categories
const toolCategories = [
  {
    id: 'generate',
    name: 'Generate',
    icon: Sparkles,
    description: 'Create new content',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'enhance',
    name: 'Enhance',
    icon: Wand2,
    description: 'Improve existing text',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'analyze',
    name: 'Analyze',
    icon: BarChart3,
    description: 'Get insights on your writing',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    icon: Lightbulb,
    description: 'Explore ideas',
    color: 'from-amber-500 to-orange-500',
  },
];

// Comprehensive AI Tools
const aiTools = [
  // Generate tools
  { id: 'continue', category: 'generate', name: 'Continue Writing', description: 'AI continues your story naturally', icon: ArrowRight, shortcut: '⌘K' },
  { id: 'first-draft', category: 'generate', name: 'First Draft Mode', description: 'Generate complete scenes from outlines', icon: FileText, shortcut: '⌘D' },
  { id: 'dialogue', category: 'generate', name: 'Write Dialogue', description: 'Create character conversations', icon: MessageSquare, shortcut: '⌘L' },
  { id: 'description', category: 'generate', name: 'Add Description', description: 'Rich sensory details and imagery', icon: Palette, shortcut: '⌘E' },
  { id: 'action', category: 'generate', name: 'Action Scene', description: 'Dynamic, paced action sequences', icon: Zap, shortcut: null },
  { id: 'inner-monologue', category: 'generate', name: 'Inner Thoughts', description: 'Character internal monologue', icon: Brain, shortcut: null },
  
  // Enhance tools
  { id: 'improve', category: 'enhance', name: 'Improve Prose', description: 'Elevate your writing style', icon: Star, shortcut: '⌘I' },
  { id: 'show-not-tell', category: 'enhance', name: 'Show, Don\'t Tell', description: 'Transform telling into showing', icon: Eye, shortcut: null },
  { id: 'deepen-emotion', category: 'enhance', name: 'Deepen Emotion', description: 'Add emotional resonance', icon: Heart, shortcut: null },
  { id: 'add-tension', category: 'enhance', name: 'Add Tension', description: 'Increase conflict and stakes', icon: Flame, shortcut: null },
  { id: 'vary-sentences', category: 'enhance', name: 'Vary Sentences', description: 'Improve rhythm and flow', icon: TrendingUp, shortcut: null },
  { id: 'sensory-details', category: 'enhance', name: 'Sensory Details', description: 'Engage all five senses', icon: Feather, shortcut: null },
  
  // Analyze tools
  { id: 'pacing', category: 'analyze', name: 'Pacing Analysis', description: 'Scene and chapter pacing review', icon: Clock, shortcut: null },
  { id: 'character-voice', category: 'analyze', name: 'Character Voice', description: 'Voice consistency check', icon: Users, shortcut: null },
  { id: 'plot-holes', category: 'analyze', name: 'Plot Hole Finder', description: 'Identify inconsistencies', icon: Search, shortcut: null },
  { id: 'readability', category: 'analyze', name: 'Readability Score', description: 'Complexity and clarity metrics', icon: Glasses, shortcut: null },
  { id: 'word-frequency', category: 'analyze', name: 'Word Frequency', description: 'Overused words and phrases', icon: BarChart3, shortcut: null },
  { id: 'emotional-arc', category: 'analyze', name: 'Emotional Arc', description: 'Map story emotions', icon: TrendingUp, shortcut: null },
  
  // Brainstorm tools
  { id: 'plot-twist', category: 'brainstorm', name: 'Plot Twists', description: 'Unexpected story turns', icon: RefreshCw, shortcut: null },
  { id: 'character-dev', category: 'brainstorm', name: 'Character Ideas', description: 'Backstory and motivations', icon: Users, shortcut: null },
  { id: 'world-building', category: 'brainstorm', name: 'World Building', description: 'Settings and lore ideas', icon: Map, shortcut: null },
  { id: 'conflict', category: 'brainstorm', name: 'Conflict Generator', description: 'Internal and external conflicts', icon: Swords, shortcut: null },
  { id: 'subplot', category: 'brainstorm', name: 'Subplot Ideas', description: 'Secondary storylines', icon: Layers, shortcut: null },
  { id: 'scene-ideas', category: 'brainstorm', name: 'Scene Ideas', description: 'What happens next?', icon: Theater, shortcut: null },
];

// Genre-specific writing modes
const genreModes = [
  { id: 'romance', name: 'Romance', icon: Heart, description: 'Emotional tension, chemistry' },
  { id: 'mystery', name: 'Mystery', icon: Search, description: 'Clues, red herrings, suspense' },
  { id: 'thriller', name: 'Thriller', icon: Flame, description: 'High stakes, fast pace' },
  { id: 'fantasy', name: 'Fantasy', icon: Sparkles, description: 'Magic systems, world-building' },
  { id: 'scifi', name: 'Sci-Fi', icon: Compass, description: 'Technology, speculation' },
  { id: 'literary', name: 'Literary', icon: Feather, description: 'Prose style, themes' },
  { id: 'horror', name: 'Horror', icon: Ghost, description: 'Dread, atmosphere' },
  { id: 'ya', name: 'Young Adult', icon: Star, description: 'Coming-of-age, voice' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tool?: string;
}

export default function AIStudioPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('generate');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('literary');
  const [inputText, setInputText] = useState('');
  const [contextText, setContextText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tools' | 'chat' | 'canvas'>('tools');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setSelectedTool(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredTools = aiTools.filter(tool => 
    tool.category === selectedCategory &&
    (commandSearch === '' || 
      tool.name.toLowerCase().includes(commandSearch.toLowerCase()) ||
      tool.description.toLowerCase().includes(commandSearch.toLowerCase()))
  );

  const allFilteredTools = aiTools.filter(tool =>
    commandSearch === '' || 
    tool.name.toLowerCase().includes(commandSearch.toLowerCase()) ||
    tool.description.toLowerCase().includes(commandSearch.toLowerCase())
  );

  const handleToolSelect = async (toolId: string) => {
    setSelectedTool(toolId);
    setShowCommandPalette(false);
    
    const tool = aiTools.find(t => t.id === toolId);
    if (!tool) return;

    // If there's context text, immediately run the tool
    if (contextText.trim()) {
      await runTool(toolId, contextText);
    }
  };

  const runTool = async (toolId: string, text: string) => {
    const tool = aiTools.find(t => t.id === toolId);
    if (!tool || !text.trim()) return;

    setIsGenerating(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `**${tool.name}**\n\n${text}`,
      timestamp: new Date(),
      tool: toolId,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: toolId,
          content: text,
          genre: selectedGenre,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || data.text || 'Generated content will appear here.',
        timestamp: new Date(),
        tool: toolId,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      setContextText('');
    }
  };

  const handleSendChat = async () => {
    if (!inputText.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    const prompt = inputText;
    setInputText('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chat',
          prompt: prompt,
          content: contextText,
          genre: selectedGenre,
        }),
      });

      if (!response.ok) throw new Error('Chat failed');
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || data.text || 'I\'m here to help with your writing.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      {/* Hero Header - Apple Style */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-100 to-[#fbfbfd]" />
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200 mb-6">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-700">AI Writing Studio</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-[#1d1d1f] mb-4">
              Your words.
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Amplified.
              </span>
            </h1>
            
            <p className="text-xl text-[#86868b] max-w-2xl mx-auto mb-8">
              The most advanced AI writing assistant for fiction authors. 
              Generate, enhance, analyze, and brainstorm with unprecedented intelligence.
            </p>

            {/* Quick Action Bar */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowCommandPalette(true)}
                className="flex items-center gap-3 px-6 py-3 bg-[#1d1d1f] text-white rounded-full hover:bg-[#424245] transition-all shadow-lg hover:shadow-xl"
              >
                <Command className="h-4 w-4" />
                <span className="font-medium">Open Command Palette</span>
                <kbd className="px-2 py-0.5 text-xs bg-white/20 rounded">⌘K</kbd>
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-1 mb-12 p-1 bg-stone-100 rounded-full max-w-md mx-auto">
          {[
            { id: 'tools', label: 'AI Tools', icon: Grid3X3 },
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'canvas', label: 'Story Canvas', icon: BookMarked },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#1d1d1f] shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Genre Selector */}
        <div className="mb-12">
          <p className="text-sm text-[#86868b] text-center mb-4">Writing Mode</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {genreModes.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                  selectedGenre === genre.id
                    ? 'bg-[#1d1d1f] text-white'
                    : 'bg-white text-[#1d1d1f] border border-[#d2d2d7] hover:border-[#86868b]'
                }`}
              >
                <genre.icon className="h-3.5 w-3.5" />
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'tools' && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category Tabs */}
              <div className="flex items-center justify-center gap-6 mb-12">
                {toolCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group flex flex-col items-center gap-3 p-6 rounded-2xl transition-all ${
                      selectedCategory === category.id
                        ? 'bg-white shadow-lg border border-[#d2d2d7]'
                        : 'hover:bg-white/50'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${category.color}`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className={`font-medium ${selectedCategory === category.id ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`}>
                        {category.name}
                      </p>
                      <p className="text-xs text-[#86868b] mt-0.5">{category.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Tools Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map((tool, index) => (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleToolSelect(tool.id)}
                    className="group relative flex items-start gap-4 p-6 bg-white rounded-2xl border border-[#d2d2d7] hover:border-[#86868b] hover:shadow-lg transition-all text-left"
                  >
                    <div className="p-3 rounded-xl bg-stone-100 group-hover:bg-stone-200 transition-colors">
                      <tool.icon className="h-5 w-5 text-[#1d1d1f]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-[#1d1d1f]">{tool.name}</h3>
                        {tool.shortcut && (
                          <kbd className="px-2 py-0.5 text-xs bg-stone-100 text-[#86868b] rounded font-mono">
                            {tool.shortcut}
                          </kbd>
                        )}
                      </div>
                      <p className="text-sm text-[#86868b] mt-1">{tool.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#d2d2d7] group-hover:text-[#86868b] absolute right-4 top-1/2 -translate-y-1/2 transition-colors" />
                  </motion.button>
                ))}
              </div>

              {/* Context Input Area */}
              <div className="mt-12">
                <div className="bg-white rounded-2xl border border-[#d2d2d7] p-6">
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-3">
                    Paste your text or scene here
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={contextText}
                    onChange={(e) => setContextText(e.target.value)}
                    placeholder="Paste text from your manuscript to use with any AI tool above..."
                    className="w-full h-48 p-4 bg-stone-50 rounded-xl border-0 resize-none focus:ring-2 focus:ring-violet-500 text-[#1d1d1f] placeholder:text-[#86868b]"
                  />
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-[#86868b]">
                      {contextText.split(/\s+/).filter(Boolean).length} words
                    </p>
                    <button
                      onClick={() => setContextText('')}
                      className="text-sm text-[#86868b] hover:text-[#1d1d1f]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              {/* Chat Messages */}
              <div className="bg-white rounded-2xl border border-[#d2d2d7] min-h-[500px] flex flex-col">
                <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[600px]">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4">
                        <MessageSquare className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-[#1d1d1f] mb-2">
                        Start a conversation
                      </h3>
                      <p className="text-[#86868b] max-w-md">
                        Ask me anything about your story, characters, plot, or writing craft. 
                        I'm here to help you create your best work.
                      </p>
                      
                      {/* Suggested prompts */}
                      <div className="grid gap-2 mt-8 w-full max-w-md">
                        {[
                          "Help me develop my protagonist's backstory",
                          "How can I increase tension in my climax?",
                          "Suggest a plot twist for my mystery",
                          "What's missing from this scene?",
                        ].map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => setInputText(prompt)}
                            className="flex items-center gap-3 p-3 text-left text-sm bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
                          >
                            <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <span className="text-[#1d1d1f]">{prompt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-4 ${
                            message.role === 'user'
                              ? 'bg-[#1d1d1f] text-white'
                              : 'bg-stone-100 text-[#1d1d1f]'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-200">
                              <button
                                onClick={() => copyToClipboard(message.content, message.id)}
                                className="flex items-center gap-1.5 text-xs text-[#86868b] hover:text-[#1d1d1f]"
                              >
                                {copiedId === message.id ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                                {copiedId === message.id ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {isGenerating && (
                    <div className="flex justify-start">
                      <div className="bg-stone-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-[#86868b]">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-[#d2d2d7]">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChat();
                        }
                      }}
                      placeholder="Ask about your story, characters, or writing..."
                      rows={1}
                      className="flex-1 px-4 py-3 bg-stone-50 rounded-xl border-0 resize-none focus:ring-2 focus:ring-violet-500 text-[#1d1d1f] placeholder:text-[#86868b]"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={!inputText.trim() || isGenerating}
                      className="p-3 bg-[#1d1d1f] text-white rounded-xl hover:bg-[#424245] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'canvas' && (
            <motion.div
              key="canvas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center py-24"
            >
              <div className="inline-flex p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-6">
                <BookMarked className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-3">Story Canvas</h2>
              <p className="text-[#86868b] max-w-md mx-auto mb-8">
                Visual story planning with AI-powered beat sheets, character arcs, 
                and plot timelines. Coming soon.
              </p>
              <button className="px-6 py-3 bg-stone-100 text-[#1d1d1f] rounded-full font-medium hover:bg-stone-200 transition-colors">
                Join Waitlist
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output Results */}
        {messages.length > 0 && activeTab === 'tools' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-6">Results</h2>
            <div className="space-y-4">
              {messages.filter(m => m.role === 'assistant').slice(-3).map((message) => (
                <div
                  key={message.id}
                  className="bg-white rounded-2xl border border-[#d2d2d7] p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">AI Generated</p>
                        <p className="text-xs text-[#86868b]">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-[#1d1d1f] whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCommandPalette(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-[#d2d2d7]">
                <Search className="h-5 w-5 text-[#86868b]" />
                <input
                  type="text"
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  placeholder="Search AI tools..."
                  className="flex-1 bg-transparent text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none text-lg"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs bg-stone-100 text-[#86868b] rounded font-mono">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto p-2">
                {allFilteredTools.length === 0 ? (
                  <div className="py-8 text-center text-[#86868b]">
                    No tools found
                  </div>
                ) : (
                  allFilteredTools.map((tool) => {
                    const category = toolCategories.find(c => c.id === tool.category);
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleToolSelect(tool.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-100 transition-colors text-left"
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${category?.color || 'from-stone-400 to-stone-500'}`}>
                          <tool.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1d1d1f]">{tool.name}</p>
                          <p className="text-sm text-[#86868b] truncate">{tool.description}</p>
                        </div>
                        {tool.shortcut && (
                          <kbd className="px-2 py-1 text-xs bg-stone-100 text-[#86868b] rounded font-mono">
                            {tool.shortcut}
                          </kbd>
                        )}
                        <CornerDownLeft className="h-4 w-4 text-[#d2d2d7]" />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-[#d2d2d7] bg-stone-50 flex items-center justify-between text-xs text-[#86868b]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="h-3 w-3" /> to select
                  </span>
                  <span className="flex items-center gap-1">
                    <span>↑↓</span> to navigate
                  </span>
                </div>
                <span>{allFilteredTools.length} tools available</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
