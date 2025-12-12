'use client';

import React from 'react';
import { Undo2, Redo2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UndoItem } from './types';

interface UndoStackProps {
  items: UndoItem[];
  onUndo: (index?: number) => void;
  onRedo: () => void;
  canRedo: boolean;
}

export function UndoStack({ items, onUndo, onRedo, canRedo }: UndoStackProps) {
  if (items.length === 0 && !canRedo) return null;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-stone-800 bg-stone-900/80">
      {/* Undo/Redo Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUndo(0)}
          disabled={items.length === 0}
          className={cn(
            'p-1.5 rounded transition-colors',
            items.length > 0
              ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              : 'text-stone-700 cursor-not-allowed'
          )}
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(
            'p-1.5 rounded transition-colors',
            canRedo
              ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              : 'text-stone-700 cursor-not-allowed'
          )}
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      {items.length > 0 && <div className="w-px h-4 bg-stone-700" />}

      {/* Undo History */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto">
        {items.slice(0, 5).map((item, index) => (
          <button
            key={item.id}
            onClick={() => onUndo(index)}
            className="flex items-center gap-2 px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs text-stone-400 hover:text-stone-200 transition-colors shrink-0"
          >
            <Clock className="w-3 h-3 text-stone-500" />
            <span className="truncate max-w-[100px]">{item.toolName}</span>
            <span className="text-stone-600">
              {item.wordCount > 0 ? `${item.wordCount}w` : ''}
            </span>
          </button>
        ))}
      </div>

      {/* History Count */}
      {items.length > 0 && (
        <span className="text-xs text-stone-600 shrink-0">
          {items.length} undo{items.length !== 1 ? 's' : ''} available
        </span>
      )}
    </div>
  );
}
