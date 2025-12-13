'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, ChevronRight, Save, Loader2, Check, Clock } from 'lucide-react';
import { UndoHistoryDropdown, UndoEntry } from './UndoHistoryDropdown';
import { cn } from '@/lib/utils';
import { Chapter, Selection, SceneContext } from './types';
import { ContinuityIndicator } from '@/components/continuity-guardian';
import { EditorContextMenu, useContextMenu } from './EditorContextMenu';

interface WritingCanvasProps {
  chapter: Chapter | null;
  content: string;
  onChange: (content: string) => void;
  onSelect: (selection: Selection | null) => void;
  onCursorChange: (position: number) => void;
  onCreateNextChapter: () => void;
  onGoToNextChapter: () => void;
  hasNextChapter: boolean;
  sceneContext: SceneContext | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  wordCount: number;
  isFirstChapter: boolean;
  bookId?: string;
  onOpenTool?: (toolId: string, subOption?: string) => void;
  onCheckContinuity?: (text: string) => void;
}

export function WritingCanvas({
  chapter,
  content,
  onChange,
  onSelect,
  onCursorChange,
  onCreateNextChapter,
  onGoToNextChapter,
  hasNextChapter,
  sceneContext,
  isSaving,
  hasUnsavedChanges,
  onSave,
  wordCount,
  undoEntries = [],
  onUndo,
  onUndoToPoint,
  onClearHistory,
  isFirstChapter,
  bookId,
  onOpenTool,
  onCheckContinuity,
}: WritingCanvasProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [title, setTitle] = useState(chapter?.title || '');
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [continuityEnabled, setContinuityEnabled] = useState(true);
  const [currentSelection, setCurrentSelection] = useState<Selection | null>(null);

  // Context menu state
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();

  useEffect(() => {
    setTitle(chapter?.title || '');
  }, [chapter?.id, chapter?.title]);

  const checkIfAtEnd = useCallback(() => {
    if (textareaRef.current) {
      const { selectionStart, value } = textareaRef.current;
      const trimmedLength = value.trimEnd().length;
      setIsAtEnd(selectionStart >= trimmedLength && value.length > 100);
    }
  }, []);

  const handleSelect = useCallback(() => {
    if (!textareaRef.current) return;
    
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    
    if (selectionStart !== selectionEnd) {
      const selection = {
        start: selectionStart,
        end: selectionEnd,
        text: value.substring(selectionStart, selectionEnd),
      };
      setCurrentSelection(selection);
      onSelect(selection);
    } else {
      setCurrentSelection(null);
      onSelect(null);
    }
    
    onCursorChange(selectionStart);
    checkIfAtEnd();
  }, [onSelect, onCursorChange, checkIfAtEnd]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
      
      // Cmd/Ctrl + J to continue writing
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        onOpenTool?.('continue', 'auto');
      }
      
      // Cmd/Ctrl + Shift + C to check continuity
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault();
        const textToCheck = currentSelection?.text || content.slice(-2000);
        onCheckContinuity?.(textToCheck);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onOpenTool, onCheckContinuity, currentSelection, content]);

  useEffect(() => {
    if (textareaRef.current && content) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = content.length;
      textareaRef.current.selectionEnd = content.length;
    }
  }, [chapter?.id]);

  // Context menu handlers
  const handleCopy = useCallback(() => {
    if (currentSelection?.text) {
      navigator.clipboard.writeText(currentSelection.text);
    }
  }, [currentSelection]);

  const handleCut = useCallback(() => {
    if (currentSelection?.text && textareaRef.current) {
      navigator.clipboard.writeText(currentSelection.text);
      const newContent = content.slice(0, currentSelection.start) + content.slice(currentSelection.end);
      onChange(newContent);
    }
  }, [currentSelection, content, onChange]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (textareaRef.current) {
        const { selectionStart, selectionEnd } = textareaRef.current;
        const newContent = content.slice(0, selectionStart) + text + content.slice(selectionEnd);
        onChange(newContent);
      }
    } catch (err) {
      console.error('Paste failed:', err);
    }
  }, [content, onChange]);

  const handleContextMenuOpen = useCallback((e: React.MouseEvent) => {
    handleContextMenu(e, currentSelection?.text || '');
  }, [handleContextMenu, currentSelection]);

  const handleCheckContinuityFromMenu = useCallback(() => {
    const textToCheck = currentSelection?.text || content.slice(-2000);
    onCheckContinuity?.(textToCheck);
  }, [currentSelection, content, onCheckContinuity]);

  if (!chapter) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-stone-950 p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-serif text-stone-200 mb-4">
            {isFirstChapter ? 'Start Your Story' : 'No Chapter Selected'}
          </h2>
          <p className="text-stone-400 mb-6">
            {isFirstChapter
              ? 'Every great story begins with a single chapter. Create your first one to start writing.'
              : 'Select a chapter from the timeline above, or create a new one.'}
          </p>
          <button
            onClick={onCreateNextChapter}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Chapter 1
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-stone-950 overflow-hidden">
      {/* Chapter Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-stone-800/50">
        <div className="flex items-center gap-3">
          {sceneContext && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-stone-800 rounded-full text-sm">
              <span>{sceneContext.icon}</span>
              <span className="text-stone-400">{sceneContext.name}</span>
            </span>
          )}
          
          {isTitleEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsTitleEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsTitleEditing(false);
                if (e.key === 'Escape') {
                  setTitle(chapter.title);
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
              {chapter.title || `Chapter ${chapter.order}`}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-500">
            {wordCount.toLocaleString()} words
          </span>
          
          {/* Continuity Indicator */}
          {bookId && (
            <ContinuityIndicator
              bookId={bookId}
              content={content}
              isEnabled={continuityEnabled}
              onToggle={setContinuityEnabled}
            />
          )}
          
          {/* Auto-save Status */}
          <div className="flex items-center gap-2 text-sm">
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-stone-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs">Saving...</span>
              </span>
            ) : hasUnsavedChanges ? (
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
          
          {/* Undo History Dropdown */}
          {onUndo && (
            <UndoHistoryDropdown
              entries={undoEntries}
              currentWordCount={wordCount}
              onUndo={onUndo}
              onUndoToPoint={onUndoToPoint || (() => {})}
              onClearHistory={onClearHistory || (() => {})}
            />
          )}
          
          <button
            onClick={onSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
              hasUnsavedChanges
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
          </button>
        </div>
      </div>

      {/* Writing Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              onChange(e.target.value);
              checkIfAtEnd();
            }}
            onSelect={handleSelect}
            onClick={handleSelect}
            onKeyUp={handleSelect}
            onContextMenu={handleContextMenuOpen}
            placeholder="Begin writing your chapter..."
            className={cn(
              'w-full min-h-[60vh] bg-transparent text-stone-200 text-lg leading-relaxed',
              'placeholder-stone-600 resize-none outline-none',
              'font-serif'
            )}
            style={{ 
              caretColor: '#14b8a6',
            }}
          />

          {/* End of Chapter Actions */}
          {isAtEnd && content.length > 100 && (
            <div className="mt-8 pt-8 border-t border-stone-800">
              <p className="text-stone-500 text-sm mb-4">
                ✨ You&apos;ve reached the end of this chapter
              </p>
              <div className="flex gap-3">
                {hasNextChapter ? (
                  <button
                    onClick={onGoToNextChapter}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg transition-colors"
                  >
                    Continue to Next Chapter
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onCreateNextChapter}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Next Chapter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scene Context Hint */}
      {sceneContext && (
        <div className="px-6 py-2 bg-stone-900/50 border-t border-stone-800/50">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-stone-600">
              <span className="text-stone-500">Scene hints:</span>{' '}
              {sceneContext.sensory?.sight && <span>{sceneContext.sensory.sight}</span>}
              {sceneContext.sensory?.sound && <span> • {sceneContext.sensory.sound}</span>}
            </p>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <EditorContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          selectedText={contextMenu.selectedText}
          onClose={closeContextMenu}
          onCheckContinuity={handleCheckContinuityFromMenu}
          onCopy={handleCopy}
          onCut={handleCut}
          onPaste={handlePaste}
          onEnhance={() => onOpenTool?.('expand', 'all')}
          onGenerateMore={() => onOpenTool?.('continue', 'auto')}
          onAnalyze={() => onOpenTool?.('pacing', 'chapter')}
        />
      )}
    </div>
  );
}

