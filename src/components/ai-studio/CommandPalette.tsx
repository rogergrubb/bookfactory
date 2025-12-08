'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Command, CornerDownLeft, ChevronUp, ChevronDown,
  ArrowRight, FileText, MessageSquare, Palette, Zap, Brain,
  Star, Eye, Heart, Flame, TrendingUp, Sparkles,
  BarChart3, Users, Hash, Activity, BookOpen,
  Shuffle, UserPlus, Globe, Swords, GitBranch, Layout,
  Wand2, Lightbulb
} from 'lucide-react';
import { ToolId, ToolCategory } from './types';
import { AI_TOOLS, TOOL_CATEGORIES, getToolsByCategory, getToolIconBg } from './tool-definitions';

// Icon mapping
const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowRight, FileText, MessageSquare, Palette, Zap, Brain,
  Star, Eye, Heart, Flame, TrendingUp, Sparkles,
  BarChart3, Users, Hash, Activity, BookOpen, Search,
  Shuffle, UserPlus, Globe, Swords, GitBranch, Layout,
  Wand2, Lightbulb
};

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: ToolId) => void;
  selectedText?: string;
}

export function CommandPalette({ isOpen, onClose, onSelectTool, selectedText }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<ToolCategory | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter tools based on search
  const filteredTools = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) {
      return activeCategory 
        ? AI_TOOLS.filter(t => t.category === activeCategory)
        : AI_TOOLS;
    }
    return AI_TOOLS.filter(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query)
    );
  }, [search, activeCategory]);

  // Group by category for display
  const groupedTools = useMemo(() => {
    if (search.trim()) {
      return { results: filteredTools };
    }
    if (activeCategory) {
      return { [activeCategory]: filteredTools };
    }
    return AI_TOOLS.reduce((acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, typeof AI_TOOLS>);
  }, [filteredTools, search, activeCategory]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setActiveCategory(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredTools.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredTools[selectedIndex]) {
          onSelectTool(filteredTools[selectedIndex].id);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (search || activeCategory) {
          setSearch('');
          setActiveCategory(null);
        } else {
          onClose();
        }
        break;
      case 'Backspace':
        if (!search && activeCategory) {
          setActiveCategory(null);
        }
        break;
    }
  }, [filteredTools, selectedIndex, onSelectTool, onClose, search, activeCategory]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selectedEl = list.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search, activeCategory]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[600px] max-w-[90vw] bg-white rounded-2xl shadow-2xl overflow-hidden z-50"
            onKeyDown={handleKeyDown}
          >
            {/* Search Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search AI tools..."
                className="flex-1 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-md">ESC</kbd>
              </div>
            </div>

            {/* Category Pills */}
            {!search && (
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 bg-gray-50/50 overflow-x-auto">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                    !activeCategory
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
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                        activeCategory === cat.id
                          ? `bg-gradient-to-r ${cat.gradient} text-white`
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected Text Preview */}
            {selectedText && (
              <div className="px-4 py-2 bg-violet-50 border-b border-violet-100">
                <div className="flex items-center gap-2 text-xs text-violet-600">
                  <span className="font-medium">Selected text:</span>
                  <span className="truncate text-violet-500">
                    "{selectedText.slice(0, 60)}{selectedText.length > 60 ? '...' : ''}"
                  </span>
                </div>
              </div>
            )}

            {/* Tools List */}
            <div 
              ref={listRef}
              className="max-h-[400px] overflow-y-auto overscroll-contain"
            >
              {Object.entries(groupedTools).map(([category, tools]) => (
                <div key={category}>
                  {/* Category Header */}
                  {!search && category !== 'results' && (
                    <div className="px-4 py-2 bg-gray-50/80 sticky top-0 z-10">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {TOOL_CATEGORIES.find(c => c.id === category)?.name || category}
                      </span>
                    </div>
                  )}

                  {/* Tools */}
                  {(tools as typeof AI_TOOLS).map((tool, idx) => {
                    const globalIndex = filteredTools.findIndex(t => t.id === tool.id);
                    const isSelected = globalIndex === selectedIndex;
                    const Icon = iconComponents[tool.icon] || Sparkles;
                    const categoryInfo = TOOL_CATEGORIES.find(c => c.id === tool.category);

                    return (
                      <motion.button
                        key={tool.id}
                        data-index={globalIndex}
                        onClick={() => {
                          onSelectTool(tool.id);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                          isSelected
                            ? 'bg-violet-50'
                            : 'hover:bg-gray-50'
                        }`}
                        initial={false}
                        animate={{ 
                          backgroundColor: isSelected ? 'rgb(245 243 255)' : 'transparent'
                        }}
                      >
                        {/* Icon */}
                        <div className={`p-2.5 rounded-xl ${
                          isSelected
                            ? `bg-gradient-to-br ${categoryInfo?.gradient || 'from-violet-500 to-purple-600'} shadow-lg`
                            : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isSelected ? 'text-violet-900' : 'text-gray-800'}`}>
                              {tool.name}
                            </span>
                            {tool.requiresSelection && selectedText && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded font-medium">
                                Ready
                              </span>
                            )}
                          </div>
                          <p className={`text-sm truncate ${isSelected ? 'text-violet-600' : 'text-gray-500'}`}>
                            {tool.description}
                          </p>
                        </div>

                        {/* Shortcut */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {tool.shortcut && (
                            <kbd className={`px-2 py-1 text-xs font-medium rounded-md ${
                              isSelected
                                ? 'bg-violet-100 text-violet-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {tool.shortcut}
                            </kbd>
                          )}
                          <CornerDownLeft className={`w-4 h-4 ${
                            isSelected ? 'text-violet-400' : 'text-gray-300'
                          }`} />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ))}

              {/* Empty State */}
              {filteredTools.length === 0 && (
                <div className="py-12 text-center">
                  <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No tools found for "{search}"</p>
                  <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" />
                  to select
                </span>
                <span className="flex items-center gap-1">
                  <ChevronUp className="w-3 h-3" />
                  <ChevronDown className="w-3 h-3" />
                  to navigate
                </span>
              </div>
              <span>{filteredTools.length} tools available</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
