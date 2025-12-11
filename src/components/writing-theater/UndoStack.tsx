'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, Redo2, ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UndoItem {
  id: string;
  label: string;  // Max 5 words
  content: string;
  timestamp: Date;
}

interface UndoStackProps {
  undoStack: UndoItem[];
  redoStack: UndoItem[];
  onUndo: () => void;
  onRedo: () => void;
  onJumpTo: (item: UndoItem) => void;
}

export function UndoStack({ undoStack, redoStack, onUndo, onRedo, onJumpTo }: UndoStackProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative flex items-center gap-1" ref={dropdownRef}>
      {/* Undo button */}
      <button
        onClick={onUndo}
        disabled={undoStack.length === 0}
        className={cn(
          'p-2 rounded-lg transition-colors',
          undoStack.length > 0
            ? 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
            : 'text-stone-300 dark:text-stone-600 cursor-not-allowed'
        )}
        title="Undo (⌘Z)"
      >
        <Undo2 className="h-4 w-4" />
      </button>

      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={undoStack.length === 0 && redoStack.length === 0}
        className={cn(
          'p-1 rounded transition-colors',
          (undoStack.length > 0 || redoStack.length > 0)
            ? 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500'
            : 'text-stone-300 dark:text-stone-600 cursor-not-allowed'
        )}
      >
        <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Redo button */}
      <button
        onClick={onRedo}
        disabled={redoStack.length === 0}
        className={cn(
          'p-2 rounded-lg transition-colors',
          redoStack.length > 0
            ? 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
            : 'text-stone-300 dark:text-stone-600 cursor-not-allowed'
        )}
        title="Redo (⌘⇧Z)"
      >
        <Redo2 className="h-4 w-4" />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (undoStack.length > 0 || redoStack.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden z-50"
          >
            {/* Undo items */}
            {undoStack.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                  Undo History
                </div>
                {undoStack.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onJumpTo(item);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <RotateCcw className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                      <span className="text-sm text-stone-700 dark:text-stone-300 truncate">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 flex-shrink-0 ml-2">
                      {formatTime(item.timestamp)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Divider if both exist */}
            {undoStack.length > 0 && redoStack.length > 0 && (
              <div className="border-t border-stone-200 dark:border-stone-700" />
            )}

            {/* Redo items */}
            {redoStack.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                  Redo Available
                </div>
                {redoStack.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onRedo();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Redo2 className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                      <span className="text-sm text-stone-700 dark:text-stone-300 truncate">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 flex-shrink-0 ml-2">
                      {formatTime(item.timestamp)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Keyboard shortcuts hint */}
            <div className="border-t border-stone-200 dark:border-stone-700 px-3 py-2 bg-stone-50 dark:bg-stone-900/50">
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>
                  <kbd className="px-1 py-0.5 bg-stone-200 dark:bg-stone-700 rounded font-mono">⌘Z</kbd> Undo
                </span>
                <span>
                  <kbd className="px-1 py-0.5 bg-stone-200 dark:bg-stone-700 rounded font-mono">⌘⇧Z</kbd> Redo
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
