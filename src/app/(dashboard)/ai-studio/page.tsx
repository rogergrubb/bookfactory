'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Sparkles, PenTool, BarChart3, Lightbulb, Crown, Search,
  Filter, ChevronRight, ArrowRight, Clock, Flame, Target,
  BookOpen, Upload, Grid, List, X, Check
} from 'lucide-react';
import { 
  allTools, 
  categoryConfig, 
  authorModeConfig,
  getToolsByCategory,
  getToolsByAuthor,
  type AITool,
  type ToolCategory,
  type AuthorMode
} from '@/components/ai-studio/tool-definitions';

// ============================================================================
// TYPES
// ============================================================================

type EntryPoint = 'idea' | 'notes' | 'draft' | 'finished';
type ViewMode = 'welcome' | 'tools' | 'workflow';

interface RecentProject {
  id: string;
  title: string;
  lastEdited: Date;
  wordCount: number;
  progress: number;
}

// ============================================================================
// HELPER: Get time-aware greeting
// ============================================================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

// ============================================================================
// TOOL CARD
// ============================================================================

function ToolCard({ 
  tool, 
  onClick, 
  size = 'normal' 
}: { 
  tool: AITool; 
  onClick: () => void;
  size?: 'compact' | 'normal';
}) {
  const Icon = tool.icon;
  
  return (
    <button
      onClick={onClick}
      className={`
        group relative text-left rounded-2xl
        bg-white dark:bg-stone-900
        border border-stone-200 dark:border-stone-800
        hover:border-teal-500 dark:hover:border-teal-500
        hover:shadow-lg hover:shadow-teal-500/10
        transition-all duration-200
        ${size === 'compact' ? 'p-3' : 'p-4'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          rounded-xl flex items-center justify-center flex-shrink-0
          bg-gradient-to-br ${tool.gradient || `from-${tool.color}-500 to-${tool.color}-600`}
          group-hover:scale-110 transition-transform duration-200
          ${size === 'compact' ? 'w-10 h-10' : 'w-12 h-12'}
        `}>
          <Icon className={`text-white ${size === 'compact' ? 'w-5 h-5' : 'w-6 h-6'}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium text-stone-900 dark:text-stone-100 ${size === 'compact' ? 'text-sm' : ''}`}>
              {tool.name}
            </h3>
            {tool.shortcut && (
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                {tool.shortcut}
              </kbd>
            )}
          </div>
          <p className={`text-stone-600 dark:text-stone-400 ${size === 'compact' ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'}`}>
            {tool.description}
          </p>
          
          {/* Author badges */}
          {tool.inspiredBy && tool.inspiredBy.length > 0 && size === 'normal' && (
            <div className="flex items-center gap-1 mt-2">
              {tool.inspiredBy.slice(0, 2).map(author => {
                const config = authorModeConfig[author as AuthorMode];
                return (
                  <span 
                    key={author}
                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${config?.bgClass || 'bg-stone-100 dark:bg-stone-800'} ${config?.textClass || 'text-stone-700 dark:text-stone-300'}`}
                  >
                    {author.charAt(0).toUpperCase() + author.slice(1)}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        
        <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
      </div>
    </button>
  );
}

// ============================================================================
// ENTRY POINT CARD
// ============================================================================

function EntryPointCard({
  id,
  icon: Icon,
  title,
  description,
  gradient,
  onClick
}: {
  id: EntryPoint;
  icon: typeof Lightbulb;
  title: string;
  description: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full p-5 rounded-2xl
        bg-white dark:bg-stone-900
        border border-stone-200 dark:border-stone-800
        hover:border-teal-500 dark:hover:border-teal-500
        hover:shadow-lg hover:shadow-teal-500/10
        transition-all duration-200
        flex items-center gap-5 text-left
        group
      "
    >
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center
        bg-gradient-to-br ${gradient}
        group-hover:scale-110 transition-transform duration-200
      `}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-1">
          {title}
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {description}
        </p>
      </div>
      
      <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-200" />
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AIStudioPage() {
  const { user } = useUser();
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorMode | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  
  // Mock data
  const recentProjects: RecentProject[] = [
    { id: '1', title: 'The Last Kingdom', lastEdited: new Date(), wordCount: 45000, progress: 45 },
    { id: '2', title: 'Midnight Sun', lastEdited: new Date(Date.now() - 86400000), wordCount: 12000, progress: 12 },
  ];
  const writingStreak = 7;
  const dailyGoal = 2000;
  const wordsToday = 1300;
  
  const userName = user?.firstName || 'Writer';
  const greeting = getGreeting();
  
  // Filter tools
  const filteredTools = useMemo(() => {
    let tools = allTools;
    
    if (selectedCategory !== 'all') {
      tools = tools.filter(t => t.category === selectedCategory);
    }
    
    if (selectedAuthor !== 'all') {
      tools = tools.filter(t => t.inspiredBy?.includes(selectedAuthor));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tools = tools.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }
    
    return tools;
  }, [selectedCategory, selectedAuthor, searchQuery]);
  
  // Entry points
  const entryPoints = [
    {
      id: 'idea' as EntryPoint,
      icon: Lightbulb,
      title: 'I have an idea',
      description: 'A concept, theme, or "what if" — let\'s develop it together',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      id: 'notes' as EntryPoint,
      icon: PenTool,
      title: 'I have notes or an outline',
      description: 'Character sketches, plot beats, world details — ready to expand',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'draft' as EntryPoint,
      icon: BookOpen,
      title: 'I have a draft',
      description: 'Rough or complete — let\'s enhance and refine it',
      gradient: 'from-teal-500 to-emerald-600'
    },
    {
      id: 'finished' as EntryPoint,
      icon: Sparkles,
      title: 'I have a finished manuscript',
      description: 'Polish, analyze, or prepare for publishing',
      gradient: 'from-violet-500 to-purple-600'
    }
  ];
  
  // Handle entry point selection
  const handleEntryPoint = (entryPoint: EntryPoint) => {
    setViewMode('tools');
    // Could pre-filter tools based on entry point
    if (entryPoint === 'idea') {
      setSelectedCategory('brainstorm');
    } else if (entryPoint === 'notes') {
      setSelectedCategory('generate');
    } else if (entryPoint === 'draft') {
      setSelectedCategory('enhance');
    } else {
      setSelectedCategory('analyze');
    }
  };
  
  // Handle tool selection
  const handleToolSelect = (tool: AITool) => {
    setSelectedTool(tool);
    // Navigate to tool execution or open modal
  };

  return (
    <div className="min-h-full bg-stone-50 dark:bg-stone-950">
      {/* Welcome View */}
      {viewMode === 'welcome' && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-8">
          <div className="w-full max-w-3xl">
            {/* Stats Row */}
            {(writingStreak > 0 || wordsToday > 0) && (
              <div className="flex items-center justify-center gap-6 mb-12">
                {writingStreak > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {writingStreak} day streak
                    </span>
                  </div>
                )}
                
                {dailyGoal > 0 && (
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-teal-600" />
                    <div className="w-32 h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${(wordsToday / dailyGoal) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-stone-600 dark:text-stone-400">
                      {wordsToday.toLocaleString()} / {dailyGoal.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Greeting */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-light text-stone-900 dark:text-stone-100 mb-4"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                {greeting}, <span className="font-medium">{userName}</span>.
              </h1>
              <p className="text-xl text-stone-600 dark:text-stone-400">
                How may I help you today?
              </p>
            </div>
            
            {/* Main Input */}
            <div className="mb-12">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="I'm working on a story about..."
                  className="
                    w-full px-6 py-5 text-lg
                    bg-white dark:bg-stone-900 
                    border border-stone-200 dark:border-stone-800
                    rounded-2xl shadow-sm
                    text-stone-900 dark:text-stone-100
                    placeholder:text-stone-400 dark:placeholder:text-stone-600
                    focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500
                    transition-all duration-200
                  "
                />
                {inputValue && (
                  <button
                    onClick={() => setViewMode('tools')}
                    className="
                      absolute right-3 top-1/2 -translate-y-1/2
                      px-4 py-2 rounded-xl
                      bg-teal-600 hover:bg-teal-700 
                      text-white font-medium text-sm
                      flex items-center gap-2
                      transition-colors duration-200
                    "
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setViewMode('tools')}
                  className="
                    flex items-center gap-2 px-4 py-2.5 rounded-xl
                    text-sm text-stone-600 dark:text-stone-400
                    hover:bg-stone-100 dark:hover:bg-stone-900
                    transition-colors duration-200
                  "
                >
                  <Grid className="w-4 h-4" />
                  Browse all tools
                </button>
                
                {recentProjects.length > 0 && (
                  <button
                    className="
                      flex items-center gap-2 px-4 py-2.5 rounded-xl
                      text-sm text-stone-600 dark:text-stone-400
                      hover:bg-stone-100 dark:hover:bg-stone-900
                      transition-colors duration-200
                    "
                  >
                    <Clock className="w-4 h-4" />
                    Continue where I left off
                  </button>
                )}
              </div>
            </div>
            
            {/* Entry Points */}
            <div className="space-y-3">
              <h2 className="text-center text-sm font-medium text-stone-500 uppercase tracking-wider mb-4">
                Where are you in your journey?
              </h2>
              {entryPoints.map((entry) => (
                <EntryPointCard
                  key={entry.id}
                  {...entry}
                  onClick={() => handleEntryPoint(entry.id)}
                />
              ))}
            </div>
            
            {/* Recent Projects */}
            {recentProjects.length > 0 && (
              <div className="mt-16">
                <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-4">
                  Recent Projects
                </h3>
                <div className="grid gap-3">
                  {recentProjects.slice(0, 3).map((project) => (
                    <button
                      key={project.id}
                      className="
                        p-4 rounded-xl
                        bg-white dark:bg-stone-900
                        border border-stone-200 dark:border-stone-800
                        hover:border-teal-500 dark:hover:border-teal-500
                        transition-all duration-200
                        flex items-center gap-4 text-left
                        group
                      "
                    >
                      <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-stone-900 dark:text-stone-100 truncate">
                          {project.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-stone-500">
                          <span>{project.wordCount.toLocaleString()} words</span>
                          <span>•</span>
                          <span>
                            {new Date(project.lastEdited).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-teal-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Tools View */}
      {viewMode === 'tools' && (
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => setViewMode('welcome')}
                className="text-sm text-teal-600 hover:text-teal-700 mb-2"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                AI Writing Tools
              </h1>
              <p className="text-stone-600 dark:text-stone-400">
                {filteredTools.length} tools available
              </p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ToolCategory | 'all')}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            
            {/* Author Mode Filter */}
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value as AuthorMode | 'all')}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Authors</option>
              {Object.entries(authorModeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                transition-colors duration-200
                ${selectedCategory === 'all'
                  ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'
                }
              `}
            >
              All ({allTools.length})
            </button>
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              const count = getToolsByCategory(key as ToolCategory).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as ToolCategory)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                    transition-colors duration-200
                    ${selectedCategory === key
                      ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
          
          {/* Tools Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onClick={() => handleToolSelect(tool)}
              />
            ))}
          </div>
          
          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                No tools found
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
