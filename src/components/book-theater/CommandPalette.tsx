'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Command, Search, ArrowUp, ArrowDown, CornerDownLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, SubOption, ToolCategory } from './types';
import { tools, categoryMeta } from './tool-definitions';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: Tool, subOption?: SubOption) => void;
  hasSelection: boolean;
  recentTools?: string[]; // IDs of recently used tools
}

interface SearchResult {
  tool: Tool;
  score: number;
  matchedField: 'name' | 'shortName' | 'description' | 'category';
  subOption?: SubOption;
}

// Fuzzy search scoring
function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  
  // Exact match
  if (t === q) return 100;
  
  // Starts with
  if (t.startsWith(q)) return 90;
  
  // Contains as word
  if (t.includes(' ' + q) || t.includes(q + ' ')) return 80;
  
  // Contains
  if (t.includes(q)) return 70;
  
  // Fuzzy character matching
  let score = 0;
  let queryIndex = 0;
  let consecutiveMatches = 0;
  
  for (let i = 0; i < t.length && queryIndex < q.length; i++) {
    if (t[i] === q[queryIndex]) {
      score += 10 + consecutiveMatches * 5;
      consecutiveMatches++;
      queryIndex++;
    } else {
      consecutiveMatches = 0;
    }
  }
  
  return queryIndex === q.length ? score : 0;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectTool,
  hasSelection,
  recentTools = [],
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Color mapping
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    rose: 'text-rose-400 bg-rose-500/10',
  };

  // Search and filter tools
  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) {
      // Show recent tools first, then popular tools
      const recentToolObjects = recentTools
        .map(id => tools.find(t => t.id === id))
        .filter((t): t is Tool => !!t)
        .slice(0, 3);
      
      const otherTools = tools
        .filter(t => !recentTools.includes(t.id))
        .slice(0, 8);
      
      return [...recentToolObjects, ...otherTools].map(tool => ({
        tool,
        score: recentTools.includes(tool.id) ? 100 : 50,
        matchedField: 'name' as const,
      }));
    }

    const searchResults: SearchResult[] = [];

    for (const tool of tools) {
      // Skip tools requiring selection if none
      if (tool.requiresSelection && !hasSelection) continue;

      const nameScore = fuzzyScore(query, tool.name);
      const shortScore = fuzzyScore(query, tool.shortName || '');
      const descScore = fuzzyScore(query, tool.description) * 0.5;
      const catScore = fuzzyScore(query, categoryMeta[tool.category].name) * 0.3;

      const maxScore = Math.max(nameScore, shortScore, descScore, catScore);
      
      if (maxScore > 0) {
        searchResults.push({
          tool,
          score: maxScore,
          matchedField: maxScore === nameScore ? 'name' : 
                        maxScore === shortScore ? 'shortName' :
                        maxScore === descScore ? 'description' : 'category',
        });
      }

      // Also search sub-options
      if (tool.subOptions) {
        for (const sub of tool.subOptions) {
          const subScore = fuzzyScore(query, sub.name);
          if (subScore > 20) {
            searchResults.push({
              tool,
              score: subScore * 0.9,
              matchedField: 'name',
              subOption: sub,
            });
          }
        }
      }
    }

    return searchResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [query, hasSelection, recentTools]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setExpandedTool(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          if (selected.tool.hasSubMenu && !selected.subOption && !expandedTool) {
            setExpandedTool(selected.tool.id);
          } else {
            onSelectTool(selected.tool, selected.subOption);
            onClose();
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (expandedTool) {
          setExpandedTool(null);
        } else {
          onClose();
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          setSelectedIndex(i => Math.max(i - 1, 0));
        } else {
          setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        }
        break;
    }
  }, [results, selectedIndex, expandedTool, onSelectTool, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-800">
            <Search className="w-5 h-5 text-stone-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
                setExpandedTool(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search 44 tools... (or type a command)"
              className="flex-1 bg-transparent text-stone-100 placeholder-stone-500 outline-none text-base"
            />
            <div className="flex items-center gap-1">
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-stone-800 rounded text-xs text-stone-500 font-mono">
                <Command className="w-3 h-3" />K
              </kbd>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results List */}
          <div 
            ref={listRef}
            className="max-h-[60vh] overflow-y-auto overscroll-contain"
          >
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-stone-500">
                <p>No tools found for &quot;{query}&quot;</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="py-2">
                {/* Recent Tools Section */}
                {!query && recentTools.length > 0 && (
                  <div className="px-3 py-1.5">
                    <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">
                      Recent
                    </span>
                  </div>
                )}

                {results.map((result, index) => {
                  const { tool, subOption } = result;
                  const meta = categoryMeta[tool.category];
                  const isSelected = index === selectedIndex;
                  const isExpanded = expandedTool === tool.id;
                  const isDisabled = tool.requiresSelection && !hasSelection;

                  return (
                    <div key={`${tool.id}-${subOption?.id || 'main'}`}>
                      <button
                        data-selected={isSelected}
                        onClick={() => {
                          if (isDisabled) return;
                          if (tool.hasSubMenu && !subOption) {
                            setExpandedTool(isExpanded ? null : tool.id);
                            setSelectedIndex(index);
                          } else {
                            onSelectTool(tool, subOption);
                            onClose();
                          }
                        }}
                        disabled={isDisabled}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-75',
                          isSelected && 'bg-stone-800',
                          !isSelected && 'hover:bg-stone-800/50',
                          isDisabled && 'opacity-40 cursor-not-allowed'
                        )}
                      >
                        {/* Icon */}
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                          colorMap[meta.color]
                        )}>
                          <tool.icon className="w-4.5 h-4.5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-stone-100">
                              {subOption ? `${tool.name} → ${subOption.name}` : tool.name}
                            </span>
                            {tool.requiresSelection && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-stone-800 text-stone-500 rounded">
                                Selection
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-stone-500 truncate">
                            {tool.description}
                          </p>
                        </div>

                        {/* Category Badge */}
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full shrink-0',
                          colorMap[meta.color]
                        )}>
                          {meta.name}
                        </span>

                        {/* Expand indicator */}
                        {tool.hasSubMenu && !subOption && (
                          <span className="text-stone-600 text-xs">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        )}
                      </button>

                      {/* Expanded Sub-options */}
                      {isExpanded && tool.subOptions && (
                        <div className="ml-12 border-l-2 border-stone-800 pl-3 py-1 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                          {tool.subOptions.map((sub, subIndex) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                onSelectTool(tool, sub);
                                onClose();
                              }}
                              className={cn(
                                'w-full px-3 py-2 text-left rounded-lg text-sm transition-colors',
                                'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
                              )}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Section divider after recent tools */}
                      {!query && index === Math.min(recentTools.length - 1, 2) && index < results.length - 1 && (
                        <div className="px-3 py-1.5 mt-2">
                          <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">
                            All Tools
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-stone-800 bg-stone-900/80">
            <div className="flex items-center gap-4 text-xs text-stone-600">
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                <ArrowDown className="w-3 h-3" />
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" />
                Select
              </span>
              <span className="flex items-center gap-1">
                <span className="text-[10px]">ESC</span>
                Close
              </span>
            </div>
            <span className="text-xs text-stone-600">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
