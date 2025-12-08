'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Wand2, BarChart3, Lightbulb, Command,
  ArrowRight, FileText, MessageSquare, Palette, Zap, Brain,
  Star, Eye, Heart, Flame, TrendingUp, Hash, Activity,
  Shuffle, UserPlus, Globe, Swords, GitBranch, Layout,
  BookOpen, Users, Search, ChevronRight, Settings, Zap as ZapIcon,
  BookMarked, Clock, Award, Target, Plus, Filter,
  Maximize2, Grid3X3, List, LayoutGrid
} from 'lucide-react';
import { ToolId, ToolCategory, Book, Character, Genre } from './types';
import { AI_TOOLS, TOOL_CATEGORIES, GENRES, getToolsByCategory, getToolIconBg } from './tool-definitions';
import { CommandPalette } from './CommandPalette';
import { ToolPanel } from './ToolPanel';
import { AnalysisPanel } from './AnalysisPanel';
import { BrainstormPanel } from './BrainstormPanel';

// Icon mapping
const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowRight, FileText, MessageSquare, Palette, Zap, Brain,
  Star, Eye, Heart, Flame, TrendingUp, Sparkles,
  BarChart3, Users, Search, Hash, Activity, BookOpen,
  Shuffle, UserPlus, Globe, Swords, GitBranch, Layout,
  Wand2, Lightbulb
};

// Placeholder data - will be replaced with real data from API/database
const PLACEHOLDER_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'The Midnight Garden',
    genre: 'fantasy',
    description: 'A tale of magic and mystery...',
    wordCount: 45230,
    chapters: [],
    characters: []
  },
  {
    id: 'book-2',
    title: 'Echoes of Tomorrow',
    genre: 'scifi',
    description: 'A journey through time...',
    wordCount: 32100,
    chapters: [],
    characters: []
  }
];

const PLACEHOLDER_CHARACTERS: Character[] = [
  { id: 'char-1', name: 'Elena Vance', role: 'protagonist', description: '', traits: [], relationships: [] },
  { id: 'char-2', name: 'Marcus Webb', role: 'supporting', description: '', traits: [], relationships: [] },
  { id: 'char-3', name: 'The Shadow', role: 'antagonist', description: '', traits: [], relationships: [] }
];

// Usage Stats Component
function UsageStats() {
  const stats = [
    { label: 'AI Credits', value: '2,450', icon: Sparkles, color: 'violet', change: '+150 today' },
    { label: 'Words Generated', value: '12.4K', icon: FileText, color: 'blue', change: 'This month' },
    { label: 'Tools Used', value: '47', icon: Wand2, color: 'emerald', change: 'Last 7 days' },
    { label: 'Time Saved', value: '8.2 hrs', icon: Clock, color: 'amber', change: 'Estimated' }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </div>
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <Icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Quick Actions Component
function QuickActions({ onSelectTool }: { onSelectTool: (id: ToolId) => void }) {
  const quickTools = [
    { id: 'continue' as ToolId, label: 'Continue Writing', icon: ArrowRight, gradient: 'from-violet-500 to-purple-600' },
    { id: 'improve' as ToolId, label: 'Improve Prose', icon: Star, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'dialogue' as ToolId, label: 'Write Dialogue', icon: MessageSquare, gradient: 'from-violet-500 to-purple-600' },
    { id: 'pacing' as ToolId, label: 'Check Pacing', icon: BarChart3, gradient: 'from-emerald-500 to-teal-500' },
    { id: 'plot-twists' as ToolId, label: 'Plot Twists', icon: Shuffle, gradient: 'from-amber-500 to-orange-500' },
    { id: 'character-ideas' as ToolId, label: 'Character Ideas', icon: UserPlus, gradient: 'from-amber-500 to-orange-500' }
  ];

  return (
    <div className="grid grid-cols-6 gap-3">
      {quickTools.map((tool, idx) => {
        const Icon = tool.icon;
        return (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectTool(tool.id)}
            className="group flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all"
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.gradient} shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">{tool.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

// Tool Category Section
function ToolCategorySection({ 
  category, 
  onSelectTool 
}: { 
  category: typeof TOOL_CATEGORIES[0];
  onSelectTool: (id: ToolId) => void;
}) {
  const tools = getToolsByCategory(category.id);
  const Icon = iconComponents[category.icon] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className={`p-4 ${category.bgColor} border-b border-gray-100`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.description}</p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {tools.map((tool, idx) => {
          const ToolIcon = iconComponents[tool.icon] || Sparkles;
          return (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onSelectTool(tool.id)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient} opacity-80 group-hover:opacity-100 group-hover:shadow-md transition-all`}>
                <ToolIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 text-sm">{tool.name}</span>
                  {tool.shortcut && (
                    <kbd className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded">
                      {tool.shortcut}
                    </kbd>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{tool.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Recent Activity Placeholder
function RecentActivity() {
  const activities = [
    { tool: 'Continue Writing', book: 'The Midnight Garden', chapter: 'Chapter 12', time: '2 min ago', words: 450 },
    { tool: 'Pacing Analysis', book: 'The Midnight Garden', chapter: 'Chapter 11', time: '15 min ago', words: 0 },
    { tool: 'Write Dialogue', book: 'Echoes of Tomorrow', chapter: 'Chapter 5', time: '1 hour ago', words: 320 },
    { tool: 'Character Ideas', book: 'Echoes of Tomorrow', chapter: null, time: '2 hours ago', words: 0 }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-xs text-violet-600 hover:text-violet-700">View all</button>
      </div>
      <div className="divide-y divide-gray-50">
        {activities.map((activity, idx) => (
          <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-800 text-sm">{activity.tool}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">{activity.book}</span>
                  {activity.chapter && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{activity.chapter}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">{activity.time}</span>
                {activity.words > 0 && (
                  <div className="text-xs text-emerald-600 font-medium">+{activity.words} words</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Placeholder components for features not yet built
function StoryBiblePlaceholder() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
      <div className="p-4 rounded-2xl bg-violet-50 w-fit mx-auto mb-4">
        <BookMarked className="w-8 h-8 text-violet-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">Story Bible</h3>
      <p className="text-sm text-gray-500 mb-4">Keep track of characters, locations, and plot points</p>
      <button className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors">
        Coming Soon
      </button>
    </div>
  );
}

function VoiceProfilePlaceholder() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
      <div className="p-4 rounded-2xl bg-blue-50 w-fit mx-auto mb-4">
        <Target className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">Voice Profile</h3>
      <p className="text-sm text-gray-500 mb-4">Train AI to match your unique writing style</p>
      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        Coming Soon
      </button>
    </div>
  );
}

// Main AI Studio Page
export default function AIStudioPage() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle tool selection
  const handleSelectTool = useCallback((toolId: ToolId) => {
    setSelectedTool(toolId);
    setCommandPaletteOpen(false);
  }, []);

  // Handle closing tool panel
  const handleCloseTool = useCallback(() => {
    setSelectedTool(null);
  }, []);

  // Handle applying generated content
  const handleApplyContent = useCallback((content: string) => {
    // TODO: Integrate with editor - send content to active editor
    console.log('Applying content:', content);
    setSelectedTool(null);
  }, []);

  // Determine which panel to show based on tool category
  const renderToolPanel = () => {
    if (!selectedTool) return null;

    const tool = AI_TOOLS.find(t => t.id === selectedTool);
    if (!tool) return null;

    switch (tool.category) {
      case 'analyze':
        return (
          <AnalysisPanel
            toolId={selectedTool}
            isOpen={true}
            onClose={handleCloseTool}
            initialInput={selectedText}
          />
        );
      case 'brainstorm':
        return (
          <BrainstormPanel
            toolId={selectedTool}
            isOpen={true}
            onClose={handleCloseTool}
          />
        );
      default:
        return (
          <ToolPanel
            toolId={selectedTool}
            isOpen={true}
            onClose={handleCloseTool}
            initialInput={selectedText}
            onApply={handleApplyContent}
            books={PLACEHOLDER_BOOKS}
            characters={PLACEHOLDER_CHARACTERS}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Writing Studio</h1>
                <p className="text-sm text-gray-500">24 powerful tools to elevate your writing</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Command Palette Trigger */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Search tools...</span>
                <kbd className="px-2 py-0.5 bg-white text-xs text-gray-500 rounded-md border border-gray-200">
                  ⌘K
                </kbd>
              </button>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <UsageStats />

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <QuickActions onSelectTool={handleSelectTool} />
        </section>

        {/* Tool Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Tools</h2>
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {TOOL_CATEGORIES.map(category => (
              <ToolCategorySection
                key={category.id}
                category={category}
                onSelectTool={handleSelectTool}
              />
            ))}
          </div>
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <RecentActivity />
          </div>
          <div className="space-y-6">
            <StoryBiblePlaceholder />
            <VoiceProfilePlaceholder />
          </div>
        </section>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectTool={handleSelectTool}
        selectedText={selectedText}
      />

      {/* Tool Panels */}
      {renderToolPanel()}
    </div>
  );
}
