'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Wand2, BarChart3, Lightbulb, Command,
  ArrowRight, FileText, MessageSquare, Palette, Zap, Brain,
  Star, Eye, Heart, Flame, TrendingUp, Hash, Activity,
  Shuffle, UserPlus, Globe, Swords, GitBranch, Layout,
  BookOpen, Users, Search, ChevronRight, Settings,
  BookMarked, Clock, Award, Target, Plus, Filter,
  Grid3X3, List, ChevronDown, Layers, Play, Save,
  Send, X, AlertCircle, CheckCircle, ArrowRightCircle
} from 'lucide-react';
import { 
  ToolId, ToolCategory, Book, Document, ScopeView, CategoryFilter,
  HybridScopeSelection, AIStudioState, ToolContext, validateToolExecution
} from './types';
import { 
  AI_TOOLS, TOOL_CATEGORIES, SCOPE_VIEWS, 
  getToolsByScope, getToolsByScopeAndCategory, getToolById,
  getToolIconBg, getToolColorClass, getScopeBadgeClass, getScopeLabel,
  getQuickActions, getChainableTools
} from './tool-definitions';
import { ToolExecutionPanel } from './ToolExecutionPanel';
import { ScopedContextSelector } from './ScopedContextSelector';

// ============================================================================
// ICON MAPPING
// ============================================================================

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowRight, FileText, MessageSquare, Palette, Zap, Brain,
  Star, Eye, Heart, Flame, TrendingUp, Sparkles,
  BarChart3, Users, Search, Hash, Activity, BookOpen,
  Shuffle, UserPlus, Globe, Swords, GitBranch, Layout,
  Wand2, Lightbulb, Grid3X3, Layers, Play, Save, Send
};

// ============================================================================
// SCOPE SWITCH COMPONENT
// ============================================================================

function ScopeSwitch({
  activeScope,
  onScopeChange
}: {
  activeScope: ScopeView;
  onScopeChange: (scope: ScopeView) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
      {SCOPE_VIEWS.map((scope) => {
        const Icon = iconComponents[scope.icon] || Grid3X3;
        const isActive = activeScope === scope.id;
        return (
          <button
            key={scope.id}
            onClick={() => onScopeChange(scope.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${isActive 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{scope.name}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// CATEGORY FILTER COMPONENT
// ============================================================================

function CategoryFilterBar({
  activeCategory,
  onCategoryChange,
  scopeView
}: {
  activeCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  scopeView: ScopeView;
}) {
  // Count tools per category for current scope
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    TOOL_CATEGORIES.forEach(cat => {
      const tools = getToolsByScopeAndCategory(scopeView, cat.id);
      counts[cat.id] = tools.length;
      counts.all += tools.length;
    });
    return counts;
  }, [scopeView]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onCategoryChange('all')}
        className={`
          px-3 py-1.5 rounded-lg text-sm font-medium transition-all
          ${activeCategory === 'all'
            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
        `}
      >
        All ({categoryCounts.all})
      </button>
      {TOOL_CATEGORIES.map((category) => {
        const Icon = iconComponents[category.icon] || Sparkles;
        const isActive = activeCategory === category.id;
        const count = categoryCounts[category.id] || 0;
        
        if (count === 0) return null;
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${isActive
                ? `bg-gradient-to-r ${category.gradient} text-white shadow-sm`
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{category.name}</span>
            <span className={`
              text-xs px-1.5 py-0.5 rounded-full
              ${isActive ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}
            `}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// QUICK ACTIONS COMPONENT
// ============================================================================

function QuickActions({
  scopeView,
  onSelectTool,
  selectedBookId,
  selectedDocumentId
}: {
  scopeView: ScopeView;
  onSelectTool: (id: ToolId) => void;
  selectedBookId: string | null;
  selectedDocumentId: string | null;
}) {
  const quickTools = getQuickActions(scopeView);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {scopeView === 'scene' ? 'Scene-level tools' : scopeView === 'book' ? 'Book-level tools' : 'Most used tools'}
          </p>
        </div>
        <Command className="w-4 h-4 text-gray-400" />
      </div>
      <div className="grid grid-cols-6 gap-3">
        {quickTools.map((tool, idx) => {
          const Icon = iconComponents[tool.icon] || Sparkles;
          const isDisabled = tool.scope === 'scene' && !selectedDocumentId;
          
          return (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => !isDisabled && onSelectTool(tool.id)}
              disabled={isDisabled}
              className={`
                group flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                ${isDisabled 
                  ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700'
                }
              `}
            >
              <div className={`
                p-3 rounded-xl shadow-lg transition-all
                ${getToolIconBg(tool)}
                ${!isDisabled && 'group-hover:shadow-xl group-hover:scale-110'}
              `}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{tool.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getScopeBadgeClass(tool.scope)}`}>
                {getScopeLabel(tool.scope)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TOOL CARD COMPONENT
// ============================================================================

function ToolCard({
  tool,
  onSelect,
  isDisabled
}: {
  tool: typeof AI_TOOLS[0];
  onSelect: () => void;
  isDisabled: boolean;
}) {
  const Icon = iconComponents[tool.icon] || Sparkles;

  return (
    <button
      onClick={() => !isDisabled && onSelect()}
      disabled={isDisabled}
      className={`
        group flex items-start gap-3 p-3 rounded-xl text-left transition-all w-full
        ${isDisabled
          ? 'bg-gray-50 dark:bg-gray-800/50 opacity-50 cursor-not-allowed'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }
      `}
    >
      <div className={`
        p-2 rounded-lg transition-transform
        ${getToolIconBg(tool)}
        ${!isDisabled && 'group-hover:scale-110'}
      `}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white text-sm">{tool.name}</span>
          {tool.shortcut && (
            <span className="text-[10px] text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
              {tool.shortcut}
            </span>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getScopeBadgeClass(tool.scope)}`}>
            {getScopeLabel(tool.scope)}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{tool.description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// ============================================================================
// TOOL CATEGORY SECTION
// ============================================================================

function ToolCategorySection({
  category,
  tools,
  onSelectTool,
  selectedDocumentId
}: {
  category: typeof TOOL_CATEGORIES[0];
  tools: typeof AI_TOOLS;
  onSelectTool: (id: ToolId) => void;
  selectedDocumentId: string | null;
}) {
  const Icon = iconComponents[category.icon] || Sparkles;

  if (tools.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
    >
      <div className={`p-4 ${category.bgColor} border-b border-gray-100 dark:border-gray-800`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
          </div>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            {tools.length} tools
          </span>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-2">
        {tools.map(tool => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onSelect={() => onSelectTool(tool.id)}
            isDisabled={tool.scope === 'scene' && !selectedDocumentId}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// CONTEXT VALIDATION BANNER
// ============================================================================

function ContextValidationBanner({
  scopeView,
  selectedBookId,
  selectedDocumentId,
  onSelectBook,
  onSelectDocument
}: {
  scopeView: ScopeView;
  selectedBookId: string | null;
  selectedDocumentId: string | null;
  onSelectBook: () => void;
  onSelectDocument: () => void;
}) {
  if (selectedBookId && (scopeView === 'book' || selectedDocumentId)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-4"
    >
      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
          {!selectedBookId 
            ? 'Select a book to use AI tools'
            : scopeView === 'scene' && !selectedDocumentId
              ? 'Select a scene or chapter for scene-level tools'
              : 'Some tools require a scene selection'
          }
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
          {!selectedBookId
            ? 'AI tools need context from your book to generate relevant content'
            : 'Scene-level tools work on individual scenes or chapters'
          }
        </p>
      </div>
      <button
        onClick={!selectedBookId ? onSelectBook : onSelectDocument}
        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {!selectedBookId ? 'Select Book' : 'Select Scene'}
      </button>
    </motion.div>
  );
}

// ============================================================================
// USAGE STATS COMPONENT
// ============================================================================

function UsageStats() {
  const stats = [
    { label: 'AI Credits', value: '2,450', icon: Sparkles, color: 'violet', change: '+150 today' },
    { label: 'Words Generated', value: '12.4K', icon: FileText, color: 'blue', change: 'This month' },
    { label: 'Tools Used', value: '47', icon: Wand2, color: 'emerald', change: 'Last 7 days' },
    { label: 'Time Saved', value: '8.2 hrs', icon: Clock, color: 'amber', change: 'Estimated' }
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    violet: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' }
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </div>
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <Icon className={`w-5 h-5 ${colors.text}`} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN AI STUDIO PAGE COMPONENT
// ============================================================================

export function AIStudioPage() {
  // State
  const [scopeView, setScopeView] = useState<ScopeView>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [showToolPanel, setShowToolPanel] = useState(false);
  const [showContextSelector, setShowContextSelector] = useState(false);
  const [selectorMode, setSelectorMode] = useState<'book' | 'document'>('book');

  // Memoized filtered tools
  const filteredTools = useMemo(() => {
    return getToolsByScopeAndCategory(scopeView, categoryFilter);
  }, [scopeView, categoryFilter]);

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    const grouped: Record<ToolCategory, typeof AI_TOOLS> = {
      generate: [],
      enhance: [],
      analyze: [],
      brainstorm: []
    };
    
    filteredTools.forEach(tool => {
      grouped[tool.category].push(tool);
    });
    
    return grouped;
  }, [filteredTools]);

  // Handle tool selection
  const handleSelectTool = useCallback((toolId: ToolId) => {
    const tool = getToolById(toolId);
    if (!tool) return;

    // Validate context
    const context: ToolContext = {
      userId: 'current-user', // Will be replaced with actual user ID
      bookId: selectedBookId || '',
      documentId: selectedDocumentId || undefined
    };

    const validation = validateToolExecution(tool, context);
    
    if (!validation.valid) {
      // Show appropriate selector
      if (validation.errors.some(e => e.code === 'MISSING_BOOK_ID')) {
        setSelectorMode('book');
        setShowContextSelector(true);
        return;
      }
      if (validation.errors.some(e => e.code === 'MISSING_DOCUMENT_ID')) {
        setSelectorMode('document');
        setShowContextSelector(true);
        return;
      }
    }

    setActiveTool(toolId);
    setShowToolPanel(true);
  }, [selectedBookId, selectedDocumentId]);

  // Handle context selection
  const handleBookSelect = useCallback((bookId: string) => {
    setSelectedBookId(bookId);
    setShowContextSelector(false);
  }, []);

  const handleDocumentSelect = useCallback((documentId: string) => {
    setSelectedDocumentId(documentId);
    setShowContextSelector(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Writing Studio</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">24 AI-powered tools to enhance your writing</p>
            </div>
            <div className="flex items-center gap-3">
              {selectedBookId && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
                  <BookMarked className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span className="text-sm text-violet-700 dark:text-violet-300 font-medium">Book Selected</span>
                </div>
              )}
              {selectedDocumentId && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Scene Selected</span>
                </div>
              )}
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scope Switch - Row 1 */}
          <div className="flex items-center justify-between mb-3">
            <ScopeSwitch activeScope={scopeView} onScopeChange={setScopeView} />
            <button
              onClick={() => {
                setSelectorMode('book');
                setShowContextSelector(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span>Change Context</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Category Filter - Row 2 */}
          <CategoryFilterBar
            activeCategory={categoryFilter}
            onCategoryChange={setCategoryFilter}
            scopeView={scopeView}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Validation Banner */}
        <ContextValidationBanner
          scopeView={scopeView}
          selectedBookId={selectedBookId}
          selectedDocumentId={selectedDocumentId}
          onSelectBook={() => {
            setSelectorMode('book');
            setShowContextSelector(true);
          }}
          onSelectDocument={() => {
            setSelectorMode('document');
            setShowContextSelector(true);
          }}
        />

        {/* Stats */}
        <UsageStats />

        {/* Quick Actions */}
        <QuickActions
          scopeView={scopeView}
          onSelectTool={handleSelectTool}
          selectedBookId={selectedBookId}
          selectedDocumentId={selectedDocumentId}
        />

        {/* Tool Categories */}
        {categoryFilter === 'all' ? (
          <div className="grid grid-cols-2 gap-6">
            {TOOL_CATEGORIES.map(category => (
              <ToolCategorySection
                key={category.id}
                category={category}
                tools={toolsByCategory[category.id]}
                onSelectTool={handleSelectTool}
                selectedDocumentId={selectedDocumentId}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {TOOL_CATEGORIES.filter(c => c.id === categoryFilter).map(category => (
              <ToolCategorySection
                key={category.id}
                category={category}
                tools={toolsByCategory[category.id]}
                onSelectTool={handleSelectTool}
                selectedDocumentId={selectedDocumentId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tool Execution Panel */}
      <AnimatePresence>
        {showToolPanel && activeTool && (
          <ToolExecutionPanel
            toolId={activeTool}
            bookId={selectedBookId!}
            documentId={selectedDocumentId || undefined}
            onClose={() => {
              setShowToolPanel(false);
              setActiveTool(null);
            }}
            onSaveAndSend={(nextToolId) => {
              setActiveTool(nextToolId);
            }}
          />
        )}
      </AnimatePresence>

      {/* Context Selector Modal */}
      <AnimatePresence>
        {showContextSelector && (
          <ScopedContextSelector
            mode={selectorMode}
            selectedBookId={selectedBookId}
            onBookSelect={handleBookSelect}
            onDocumentSelect={handleDocumentSelect}
            onClose={() => setShowContextSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIStudioPage;
