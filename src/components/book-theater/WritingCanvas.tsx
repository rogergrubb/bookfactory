'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Selection, SceneContext } from './types';

interface WritingCanvasProps {
  content: string;
  onChange: (content: string) => void;
  onSelectionChange: (selection: Selection | null) => void;
  onCursorChange: (position: number) => void;
  chapterTitle: string;
  wordCount: number;
  activeSceneContext: SceneContext | null;
  hasUnsavedChanges: boolean;
  onChapterTitleChange?: (title: string) => void;
}

export function WritingCanvas({
  content,
  onChange,
  onSelectionChange,
  onCursorChange,
  chapterTitle,
  wordCount,
  activeSceneContext,
  hasUnsavedChanges,
  onChapterTitleChange,
}: WritingCanvasProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(chapterTitle);

  // Sync title from props
  useEffect(() => {
    setLocalTitle(chapterTitle);
  }, [chapterTitle]);

  // Handle text selection
  const handleSelect = useCallback(() => {
    if (!textareaRef.current) return;
    
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    
    if (selectionStart !== selectionEnd) {
      onSelectionChange({
        start: selectionStart,
        end: selectionEnd,
        text: value.substring(selectionStart, selectionEnd),
      });
    } else {
      onSelectionChange(null);
    }
    
    onCursorChange(selectionStart);
  }, [onSelectionChange, onCursorChange]);

  // Handle title save
  const handleTitleSave = () => {
    setIsTitleEditing(false);
    if (localTitle !== chapterTitle && onChapterTitleChange) {
      onChapterTitleChange(localTitle);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-stone-950 overflow-hidden">
      {/* Chapter Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-stone-800/50">
        <div className="flex items-center gap-3">
          {/* Scene Context Badge */}
          {activeSceneContext && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-stone-800 rounded-full text-sm">
              <span>{activeSceneContext.icon}</span>
              <span className="text-stone-400">{activeSceneContext.name}</span>
            </span>
          )}
          
          {/* Editable Title */}
          {isTitleEditing ? (
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setLocalTitle(chapterTitle);
                  setIsTitleEditing(false);
                }
              }}
              autoFocus
              className="text-xl font-serif bg-transparent border-b border-teal-500 text-stone-100 outline-none px-1"
            />
          ) : (
            <button
              onClick={() => setIsTitleEditing(true)}
              className="text-xl font-serif text-stone-200 hover:text-stone-100 transition-colors"
            >
              {chapterTitle || 'Untitled Chapter'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Word Count */}
          <span className="text-sm text-stone-500">
            {wordCount.toLocaleString()} words
          </span>
          
          {/* Auto-save Status */}
          <div className="flex items-center gap-2 text-sm">
            {hasUnsavedChanges ? (
              <span className="flex items-center gap-1.5 text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">Auto-saving...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-500">
                <Check className="w-3.5 h-3.5" />
                <span className="text-xs">Saved</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Writing Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleSelect}
            onClick={handleSelect}
            onKeyUp={handleSelect}
            placeholder="Begin writing your chapter..."
            className={cn(
              'w-full min-h-[60vh] bg-transparent text-stone-200 text-lg leading-relaxed',
              'placeholder-stone-600 resize-none outline-none',
              'font-serif'
            )}
            style={{ caretColor: '#14b8a6' }}
          />
        </div>
      </div>

      {/* Scene Context Hint */}
      {activeSceneContext && (
        <div className="px-6 py-2 bg-stone-900/50 border-t border-stone-800/50">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-stone-600">
              <span className="text-stone-500">Scene hints:</span>{' '}
              {activeSceneContext.sensory?.sight && <span>{activeSceneContext.sensory.sight}</span>}
              {activeSceneContext.sensory?.sound && <span> • {activeSceneContext.sensory.sound}</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
