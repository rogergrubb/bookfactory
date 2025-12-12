'use client';

import React from 'react';
import { Undo2, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UndoItem } from './types';

interface UndoStackProps {
  items: UndoItem[];
  onUndo: (index: number) => void;
  onUndoLatest: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onRedo: () => void;
}

export function UndoStack({
  items,
  onUndo,
  onUndoLatest,
  canUndo,
  canRedo,
  onRedo,
}: UndoStackProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatWordDiff = (item: UndoItem, prevItem?: UndoItem) => {
    if (!prevItem) return null;
    const diff = item.wordCount - prevItem.wordCount;
    if (diff === 0) return null;
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  return (
    <div className="bg-stone-900/80 backdrop-blur border-t border-stone-800">
      {/* Quick Undo/Redo Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-stone-800/50">
        <button
          onClick={onUndoLatest}
          disabled={!canUndo}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-all',
            canUndo
              ? 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
              : 'text-stone-600 cursor-not-allowed'
          )}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Undo</span>
          <kbd className="text-[10px] text-stone-500 bg-stone-800 px-1 rounded">⌘Z</kbd>
        </button>
        
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-all',
            canRedo
              ? 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
              : 'text-stone-600 cursor-not-allowed'
          )}
        >
          <Undo2 className="w-3.5 h-3.5 scale-x-[-1]" />
          <span>Redo</span>
          <kbd className="text-[10px] text-stone-500 bg-stone-800 px-1 rounded">⌘⇧Z</kbd>
        </button>

        <div className="flex-1" />
        
        <span className="text-xs text-stone-600">
          {items.length > 0 ? `${items.length} action${items.length !== 1 ? 's' : ''} in history` : 'No history yet'}
        </span>
      </div>

      {/* Action History */}
      {items.length > 0 && (
        <div className="max-h-[150px] overflow-y-auto">
          {items.map((item, index) => {
            const wordDiff = formatWordDiff(item, items[index + 1]);
            
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 hover:bg-stone-800/50 group',
                  index === 0 && 'bg-stone-800/30'
                )}
              >
                {/* Undo this specific action */}
                <button
                  onClick={() => onUndo(index)}
                  className="p-1 rounded hover:bg-stone-700 text-stone-500 hover:text-amber-400 transition-colors"
                  title={`Undo back to: ${item.label}`}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>

                {/* Tool indicator */}
                <Sparkles className="w-3 h-3 text-stone-600" />

                {/* Action label */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-stone-400 truncate block">
                    {item.toolName}: {item.label}
                  </span>
                </div>

                {/* Word diff */}
                {wordDiff && (
                  <span className={cn(
                    'text-xs font-mono',
                    wordDiff.startsWith('+') ? 'text-emerald-500' : 'text-red-400'
                  )}>
                    {wordDiff}
                  </span>
                )}

                {/* Timestamp */}
                <span className="text-xs text-stone-600 whitespace-nowrap">
                  {formatTime(item.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="px-3 py-4 text-center text-stone-600 text-sm">
          <Clock className="w-5 h-5 mx-auto mb-1 opacity-50" />
          Actions you take will appear here
        </div>
      )}
    </div>
  );
}
