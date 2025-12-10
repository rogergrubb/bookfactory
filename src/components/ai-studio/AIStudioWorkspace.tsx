// AIStudioWorkspace - Enhanced with workflow tracking
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Wand2, BarChart3, Lightbulb, Command, X,
  ArrowRight, FileText, MessageSquare, Palette, Zap, Brain,
  Star, Eye, Heart, Flame, TrendingUp, Hash, Activity,
  Shuffle, UserPlus, Globe, Swords, GitBranch, Layout,
  BookOpen, Users, Search, ChevronRight, Settings,
  BookMarked, Clock, Target, Grid3X3, List, History,
  Pin, PinOff, Trash2, ArrowRightLeft, Plus, Layers,
  Workflow, Save, Download
} from 'lucide-react';
import { ToolId, ToolCategory } from './types';
import { AI_TOOLS, TOOL_CATEGORIES, getToolsByCategory, getToolById, getToolIconBg } from './tool-definitions';
import { ToolExecutionPanel } from './ToolExecutionPanel';
import { CommandPalette } from './CommandPalette';

// Icon mapping
const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowRight, FileText, MessageSquare, Palette, Zap, Brain,
  Star, Eye, Heart, Flame, TrendingUp, Sparkles,
  BarChart3, Users, Search, Hash, Activity, BookOpen,
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

interface WorkspaceSession {
  id: string;
  toolId: ToolId;
  input: string;
  output: string;
  timestamp: Date;
  workflow: WorkflowStep[];
}

export function AIStudioWorkspace() {
  // State
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sessions, setSessions] = useState<WorkspaceSession[]>([]);
  const [chainInput, setChainInput] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowStep[]>([]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTool = useCallback((toolId: ToolId) => {
    setActiveTool(toolId);
    setShowCommandPalette(false);
  }, []);

  const handleCloseTool = useCallback(() => {
    setActiveTool(null);
    setChainInput('');
    // Keep workflow for history but clear current
    if (currentWorkflow.length > 0) {
      // Save to sessions if there was output
      const sessionId = Date.now().toString();
      // We could save the workflow here to sessions
    }
  }, [currentWorkflow]);

  const handleChainTool = useCallback((toolId: ToolId) => {
    setActiveTool(toolId);
    // Workflow is preserved when chaining
  }, []);

  const handleStartNewWorkflow = useCallback(() => {
    setCurrentWorkflow([]);
    setChainInput('');
    setActiveTool(null);
  }, []);

  const filteredTools = selectedCategory === 'all' 
    ? AI_TOOLS 
    : AI_TOOLS.filter(t => t.category === selectedCategory);

  const generateTools = getToolsByCategory('generate');
  const enhanceTools = getToolsByCategory('enhance');
  const analyzeTools = getToolsByCategory('analyze');
  const brainstormTools = getToolsByCategory('brainstorm');

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
              {/* Current Workflow Indicator */}
              {currentWorkflow.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-lg">
                  <Workflow className="w-4 h-4 text-violet-600" />
                  <span className="text-sm text-violet-700 font-medium">
                    {currentWorkflow.length} step{currentWorkflow.length > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={handleStartNewWorkflow}
                    className="p-1 hover:bg-violet-100 rounded transition-colors"
                    title="Start new workflow"
                  >
                    <X className="w-3 h-3 text-violet-500" />
                  </button>
                </div>
              )}

              {/* Command Palette Trigger */}
              <button
                onClick={() => setShowCommandPalette(true)}
                className="flex items-center gap-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Search tools...</span>
                <kbd className="px-2 py-0.5 bg-white text-xs text-gray-500 rounded-md border border-gray-200">⌘K</kbd>
              </button>

              {/* History Toggle */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-violet-100 text-violet-600' : 'hover:bg-gray-100'}`}
              >
                <History className="w-5 h-5" />
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <Grid3X3 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <List className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Tools
            </button>
            {TOOL_CATEGORIES.map(cat => {
              const Icon = iconComponents[cat.icon] || Sparkles;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Tools Grid/List */}
          <div className="flex-1">
            {selectedCategory === 'all' ? (
              /* All Categories View */
              <div className="space-y-8">
                {TOOL_CATEGORIES.map((category, catIdx) => {
                  const tools = getToolsByCategory(category.id);
                  const CategoryIcon = iconComponents[category.icon] || Sparkles;
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIdx * 0.1 }}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    >
                      <div className={`px-6 py-4 bg-gradient-to-r ${category.gradient}`}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <CategoryIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h2 className="font-bold text-white text-lg">{category.label}</h2>
                            <p className="text-white/80 text-sm">{category.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 grid grid-cols-2 gap-2">
                        {tools.map((tool, idx) => {
                          const ToolIcon = iconComponents[tool.icon] || Sparkles;
                          return (
                            <motion.button
                              key={tool.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: catIdx * 0.1 + idx * 0.03 }}
                              onClick={() => handleSelectTool(tool.id)}
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
                })}
              </div>
            ) : (
              /* Single Category View */
              <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-3'}>
                {filteredTools.map((tool, idx) => {
                  const ToolIcon = iconComponents[tool.icon] || Sparkles;
                  const category = TOOL_CATEGORIES.find(c => c.id === tool.category);
                  
                  if (viewMode === 'list') {
                    return (
                      <motion.button
                        key={tool.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => handleSelectTool(tool.id)}
                        className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all group"
                      >
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${category?.gradient || 'from-violet-500 to-purple-600'} shadow-lg group-hover:scale-110 transition-transform`}>
                          <ToolIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                            {tool.shortcut && (
                              <kbd className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">{tool.shortcut}</kbd>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{tool.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </motion.button>
                    );
                  }

                  return (
                    <motion.button
                      key={tool.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => handleSelectTool(tool.id)}
                      className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all group"
                    >
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${category?.gradient || 'from-violet-500 to-purple-600'} shadow-lg group-hover:scale-110 transition-transform`}>
                        <ToolIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tool.description}</p>
                      </div>
                      {tool.shortcut && (
                        <kbd className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">{tool.shortcut}</kbd>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <AnimatePresence>
            {showHistory && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 320 }}
                exit={{ opacity: 0, width: 0 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex-shrink-0"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Recent Sessions</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                  {sessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No sessions yet</p>
                      <p className="text-xs mt-1">Your tool usage will appear here</p>
                    </div>
                  ) : (
                    sessions.map((session) => {
                      const tool = getToolById(session.toolId);
                      if (!tool) return null;
                      const ToolIcon = iconComponents[tool.icon] || Sparkles;
                      return (
                        <div
                          key={session.id}
                          className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => {
                            setChainInput(session.output);
                            setCurrentWorkflow(session.workflow || []);
                            setActiveTool(session.toolId);
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <ToolIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{tool.name}</span>
                            {session.workflow && session.workflow.length > 1 && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-violet-100 text-violet-600 rounded-full">
                                {session.workflow.length} steps
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">{session.input}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {session.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Quick Start Banner for Generate Workflow */}
      {selectedCategory === 'all' && currentWorkflow.length === 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <Workflow className="w-5 h-5" />
            <span className="font-medium">Start a writing workflow</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectTool('continue')}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                Continue Writing
              </button>
              <button
                onClick={() => handleSelectTool('first-draft')}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                First Draft
              </button>
              <button
                onClick={() => handleSelectTool('dialogue')}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                Dialogue
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectTool={handleSelectTool}
      />

      {/* Tool Execution Panel */}
      {activeTool && (
        <ToolExecutionPanel
          toolId={activeTool}
          bookId="demo-book"
          onClose={handleCloseTool}
          onSaveAndSend={handleChainTool}
          preloadedInput={chainInput}
          workflowSteps={currentWorkflow.map(s => ({ toolId: s.toolId, wordCount: s.wordCount }))}
        />
      )}
    </div>
  );
}

export default AIStudioWorkspace;
