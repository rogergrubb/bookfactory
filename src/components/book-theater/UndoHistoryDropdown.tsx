'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCcw, Clock, FileText, Wand2, Scissors, Plus, Replace,
  ChevronDown, Check, Trash2, History, Sparkles, ArrowLeft,
  Type, Palette, Zap, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface UndoEntry {
  id: string;
  timestamp: Date;
  type: 'edit' | 'insert' | 'delete' | 'replace' | 'ai-generate' | 'ai-fix' | 'format' | 'paste';
  label: string;
  description: string;
  toolName?: string;
  wordCountBefore: number;
  wordCountAfter: number;
  chapterId: string;
  chapterName?: string;
  // For preview
  previewBefore?: string;
  previewAfter?: string;
  // Content snapshot for restoration
  contentSnapshot: string;
}

interface UndoHistoryDropdownProps {
  entries: UndoEntry[];
  currentWordCount: number;
  onUndo: (entry: UndoEntry) => void;
  onUndoToPoint: (entryId: string) => void;
  onClearHistory: () => void;
  className?: string;
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const typeIcons: Record<string, React.ElementType> = {
  'edit': Type,
  'insert': Plus,
  'delete': Trash2,
  'replace': Replace,
  'ai-generate': Sparkles,
  'ai-fix': Wand2,
  'format': Palette,
  'paste': FileText,
};

const typeColors: Record<string, string> = {
  'edit': 'text-stone-400',
  'insert': 'text-emerald-400',
  'delete': 'text-red-400',
  'replace': 'text-blue-400',
  'ai-generate': 'text-purple-400',
  'ai-fix': 'text-amber-400',
  'format': 'text-cyan-400',
  'paste': 'text-stone-400',
};

const typeBgColors: Record<string, string> = {
  'edit': 'bg-stone-500/10',
  'insert': 'bg-emerald-500/10',
  'delete': 'bg-red-500/10',
  'replace': 'bg-blue-500/10',
  'ai-generate': 'bg-purple-500/10',
  'ai-fix': 'bg-amber-500/10',
  'format': 'bg-cyan-500/10',
  'paste': 'bg-stone-500/10',
};

// ============================================================================
// HELPERS
// ============================================================================

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return date.toLocaleDateString();
}

function formatWordDelta(before: number, after: number): { text: string; color: string } {
  const delta = after - before;
  if (delta > 0) return { text: `+${delta} words`, color: 'text-emerald-400' };
  if (delta < 0) return { text: `${delta} words`, color: 'text-red-400' };
  return { text: 'No change', color: 'text-stone-500' };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UndoHistoryDropdown({
  entries,
  currentWordCount,
  onUndo,
  onUndoToPoint,
  onClearHistory,
  className,
}: UndoHistoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<UndoEntry | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedEntry(null);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (entries.length > 0 && !e.shiftKey) {
          e.preventDefault();
          onUndo(entries[0]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entries, onUndo]);

  const canUndo = entries.length > 0;

  // Group entries by time period
  const groupedEntries = React.useMemo(() => {
    const now = new Date();
    const groups: { label: string; entries: UndoEntry[] }[] = [
      { label: 'Recent', entries: [] },
      { label: 'Earlier Today', entries: [] },
      { label: 'Yesterday', entries: [] },
      { label: 'Older', entries: [] },
    ];

    entries.forEach(entry => {
      const diffMs = now.getTime() - entry.timestamp.getTime();
      const diffMin = diffMs / (1000 * 60);
      const diffHour = diffMin / 60;
      
      if (diffMin < 30) {
        groups[0].entries.push(entry);
      } else if (diffHour < 24) {
        groups[1].entries.push(entry);
      } else if (diffHour < 48) {
        groups[2].entries.push(entry);
      } else {
        groups[3].entries.push(entry);
      }
    });

    return groups.filter(g => g.entries.length > 0);
  }, [entries]);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!canUndo}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          canUndo
            ? 'text-stone-300 hover:text-white hover:bg-stone-800/80 active:scale-95'
            : 'text-stone-600 cursor-not-allowed'
        )}
      >
        <RotateCcw className="w-4 h-4" />
        <span>Undo</span>
        {canUndo && (
          <ChevronDown className={cn(
            'w-3.5 h-3.5 transition-transform',
            isOpen && 'rotate-180'
          )} />
        )}
      </button>

      {/* Dropdown Panel - Apple-style mega menu */}
      {isOpen && canUndo && (
        <div className={cn(
          'absolute top-full right-0 mt-2 z-50',
          'w-[420px] max-h-[520px]',
          'bg-stone-900/95 backdrop-blur-xl',
          'border border-stone-700/50 rounded-2xl',
          'shadow-2xl shadow-black/50',
          'overflow-hidden',
          'animate-in fade-in slide-in-from-top-2 duration-200'
        )}>
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-stone-700 to-stone-800">
                  <History className="w-5 h-5 text-stone-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Edit History</h3>
                  <p className="text-xs text-stone-500">{entries.length} changes • {currentWordCount} words</p>
                </div>
              </div>
              
              {/* Quick Undo Button */}
              <button
                onClick={() => {
                  onUndo(entries[0]);
                  if (entries.length <= 1) setIsOpen(false);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                  'bg-white/10 hover:bg-white/15 active:bg-white/20',
                  'text-white text-sm font-medium transition-all'
                )}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Undo
                <kbd className="text-[10px] text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">⌘Z</kbd>
              </button>
            </div>
          </div>

          {/* Entry Preview (when hovering) */}
          {selectedEntry && (
            <div className="px-5 py-4 border-b border-stone-800/50 bg-stone-800/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Preview</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Before</span>
                  <div className="p-2 bg-stone-900 rounded-lg text-xs text-stone-400 max-h-20 overflow-hidden line-clamp-3">
                    {selectedEntry.previewBefore || 'No preview available'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">After</span>
                  <div className="p-2 bg-stone-900 rounded-lg text-xs text-stone-400 max-h-20 overflow-hidden line-clamp-3">
                    {selectedEntry.previewAfter || 'No preview available'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onUndoToPoint(selectedEntry.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full mt-3 py-2 rounded-lg',
                  'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30',
                  'text-amber-400 text-sm font-medium transition-colors'
                )}
              >
                Restore to this point
              </button>
            </div>
          )}

          {/* Entries List */}
          <div className="overflow-y-auto max-h-[320px] scrollbar-thin scrollbar-thumb-stone-700">
            {groupedEntries.map((group, groupIndex) => (
              <div key={group.label}>
                {/* Group Header */}
                <div className="px-5 py-2 bg-stone-800/30 sticky top-0 backdrop-blur-sm">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                    {group.label}
                  </span>
                </div>

                {/* Group Entries */}
                {group.entries.map((entry, index) => {
                  const Icon = typeIcons[entry.type] || FileText;
                  const iconColor = typeColors[entry.type] || 'text-stone-400';
                  const bgColor = typeBgColors[entry.type] || 'bg-stone-500/10';
                  const wordDelta = formatWordDelta(entry.wordCountBefore, entry.wordCountAfter);
                  const isFirst = groupIndex === 0 && index === 0;
                  const isHovered = hoveredEntry === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        'px-5 py-3 cursor-pointer transition-all',
                        'border-b border-stone-800/30 last:border-b-0',
                        isHovered ? 'bg-stone-800/50' : 'hover:bg-stone-800/30',
                        isFirst && 'bg-emerald-500/5'
                      )}
                      onMouseEnter={() => {
                        setHoveredEntry(entry.id);
                        setSelectedEntry(entry);
                      }}
                      onMouseLeave={() => {
                        setHoveredEntry(null);
                        // Keep preview if explicitly selected
                      }}
                      onClick={() => {
                        onUndo(entry);
                        if (entries.length <= 1) setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={cn('p-2 rounded-lg mt-0.5', bgColor)}>
                          <Icon className={cn('w-4 h-4', iconColor)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white text-sm truncate">
                              {entry.label}
                            </span>
                            {isFirst && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                                Latest
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-stone-400 mt-0.5 truncate">
                            {entry.description}
                          </p>

                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[11px] text-stone-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(entry.timestamp)}
                            </span>
                            <span className={cn('text-[11px]', wordDelta.color)}>
                              {wordDelta.text}
                            </span>
                            {entry.chapterName && (
                              <span className="text-[11px] text-stone-600 truncate max-w-[100px]">
                                {entry.chapterName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Undo indicator on hover */}
                        {isHovered && (
                          <div className="flex items-center gap-1 text-stone-400">
                            <ArrowLeft className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-stone-800/50 bg-stone-900/50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm('Clear all history? This cannot be undone.')) {
                    onClearHistory();
                    setIsOpen(false);
                  }
                }}
                className="text-xs text-stone-500 hover:text-red-400 transition-colors"
              >
                Clear History
              </button>
              <span className="text-[11px] text-stone-600">
                History saved locally
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXPORT HELPER - Create undo entry from action
// ============================================================================

export function createUndoEntry(
  type: UndoEntry['type'],
  label: string,
  description: string,
  contentBefore: string,
  contentAfter: string,
  chapterId: string,
  chapterName?: string,
  toolName?: string
): UndoEntry {
  const wordsBefore = contentBefore.split(/\s+/).filter(w => w.length > 0).length;
  const wordsAfter = contentAfter.split(/\s+/).filter(w => w.length > 0).length;
  
  return {
    id: `undo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date(),
    type,
    label,
    description,
    toolName,
    wordCountBefore: wordsBefore,
    wordCountAfter: wordsAfter,
    chapterId,
    chapterName,
    previewBefore: contentBefore.slice(0, 150),
    previewAfter: contentAfter.slice(0, 150),
    contentSnapshot: contentBefore, // Store previous state for restoration
  };
}
