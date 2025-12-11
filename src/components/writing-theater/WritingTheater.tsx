'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Undo2,
  Redo2,
  Settings,
  BookOpen,
  Users,
  Save,
  Clock,
  Type,
  PanelRightOpen,
  PanelRightClose,
  Maximize2,
  Minimize2,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToolTray } from './ToolTray';
import { ToolPanel } from './ToolPanel';
import { UndoStack, UndoItem } from './UndoStack';
import { ReferencePanel } from './ReferencePanel';
import { EditorCanvas } from './EditorCanvas';
import { AI_TOOLS, getToolsByCategory, AITool } from '@/components/ai-studio/tool-definitions';

// Generate tools for the tray
const GENERATE_TOOLS = getToolsByCategory('generate');

interface WritingTheaterProps {
  initialContent?: string;
  chapterTitle?: string;
  chapterNumber?: number;
  bookTitle?: string;
  onSave?: (content: string) => Promise<void>;
  onBack?: () => void;
}

export function WritingTheater({
  initialContent = '',
  chapterTitle = 'Untitled Chapter',
  chapterNumber = 1,
  bookTitle = 'My Book',
  onSave,
  onBack,
}: WritingTheaterProps) {
  // Content state
  const [content, setContent] = useState(initialContent);
  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null);
  
  // UI state
  const [activeTool, setActiveTool] = useState<AITool | null>(null);
  const [showReference, setShowReference] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Undo stack - keeps last 5 actions
  const [undoStack, setUndoStack] = useState<UndoItem[]>([]);
  const [redoStack, setRedoStack] = useState<UndoItem[]>([]);
  
  // Stats
  const [sessionStartTime] = useState(new Date());
  const [sessionDuration, setSessionDuration] = useState(0);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  
  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Create undo item with 5-word max label
  const createUndoLabel = (action: string, text: string): string => {
    const words = text.trim().split(/\s+/).slice(0, 4);
    if (words.length === 0) return action;
    const preview = words.join(' ');
    return `${action}: ${preview.length > 20 ? preview.slice(0, 20) + '...' : preview}`;
  };

  // Add to undo stack (max 5 items)
  const pushUndo = useCallback((item: UndoItem) => {
    setUndoStack(prev => {
      const newStack = [item, ...prev].slice(0, 5);
      return newStack;
    });
    setRedoStack([]); // Clear redo on new action
  }, []);

  // Undo action
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const [lastAction, ...rest] = undoStack;
    setUndoStack(rest);
    
    // Push current state to redo
    setRedoStack(prev => [{
      id: Date.now().toString(),
      label: createUndoLabel('Redo', content.slice(0, 50)),
      content: content,
      timestamp: new Date(),
    }, ...prev].slice(0, 5));
    
    // Restore previous content
    setContent(lastAction.content);
  }, [undoStack, content]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const [lastRedo, ...rest] = redoStack;
    setRedoStack(rest);
    
    // Push current to undo
    setUndoStack(prev => [{
      id: Date.now().toString(),
      label: createUndoLabel('Undo', content.slice(0, 50)),
      content: content,
      timestamp: new Date(),
    }, ...prev].slice(0, 5));
    
    setContent(lastRedo.content);
  }, [redoStack, content]);

  // Handle content change from editor
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  // Handle selection change
  const handleSelectionChange = useCallback((sel: { start: number; end: number; text: string } | null) => {
    setSelection(sel);
  }, []);

  // Handle tool selection from tray
  const handleToolSelect = useCallback((tool: AITool) => {
    setActiveTool(tool);
    // If tool requires selection but none exists, focus editor
    if (tool.requiresSelection && !selection?.text && editorRef.current) {
      editorRef.current.focus();
    }
  }, [selection]);

  // Handle tool result - insert/replace content
  const handleToolResult = useCallback((result: string, mode: 'insert' | 'replace' | 'append') => {
    // Save current state to undo
    pushUndo({
      id: Date.now().toString(),
      label: createUndoLabel(activeTool?.name || 'AI', result),
      content: content,
      timestamp: new Date(),
    });
    
    if (mode === 'replace' && selection) {
      // Replace selection
      const before = content.slice(0, selection.start);
      const after = content.slice(selection.end);
      setContent(before + result + after);
    } else if (mode === 'insert' && selection) {
      // Insert after cursor
      const before = content.slice(0, selection.end);
      const after = content.slice(selection.end);
      setContent(before + '\n\n' + result + after);
    } else {
      // Append to end
      setContent(content + '\n\n' + result);
    }
    
    setActiveTool(null);
  }, [content, selection, activeTool, pushUndo]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(content);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [content, onSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S = Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Cmd/Ctrl + Z = Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Cmd/Ctrl + Shift + Z = Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        handleRedo();
      }
      // Cmd/Ctrl + J = Continue Writing (first generate tool)
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        const continueTool = GENERATE_TOOLS.find(t => t.id === 'continue-writing');
        if (continueTool) setActiveTool(continueTool);
      }
      // Escape = Close tool panel
      if (e.key === 'Escape' && activeTool) {
        setActiveTool(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleUndo, handleRedo, activeTool]);

  return (
    <div 
      className={cn(
        'flex flex-col h-screen bg-stone-50 dark:bg-stone-950',
        isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* ========== HEADER WITH TOOL TRAY ========== */}
      <header className="flex-shrink-0 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100 dark:border-stone-800">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400">{bookTitle}</p>
              <h1 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Chapter {chapterNumber}: {chapterTitle}
              </h1>
            </div>
          </div>

          {/* Center: Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <Type className="h-4 w-4" />
              <span className="text-sm font-medium">{wordCount.toLocaleString()} words</span>
            </div>
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{formatDuration(sessionDuration)}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Undo/Redo with dropdown */}
            <UndoStack
              undoStack={undoStack}
              redoStack={redoStack}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onJumpTo={(item) => {
                pushUndo({
                  id: Date.now().toString(),
                  label: createUndoLabel('Jump', content.slice(0, 50)),
                  content: content,
                  timestamp: new Date(),
                });
                setContent(item.content);
              }}
            />
            
            {/* Save */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                isSaving 
                  ? 'bg-stone-100 text-stone-400' 
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              )}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            {/* Reference Panel Toggle */}
            <button
              onClick={() => setShowReference(!showReference)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                showReference 
                  ? 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200'
                  : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500'
              )}
              title="Story Bible & Characters"
            >
              {showReference ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                showSettings
                  ? 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200'
                  : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500'
              )}
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tool Tray */}
        <ToolTray
          tools={GENERATE_TOOLS}
          activeTool={activeTool}
          onSelectTool={handleToolSelect}
          selection={selection}
        />
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Canvas - Always visible */}
        <div className="flex-1 overflow-hidden">
          <EditorCanvas
            ref={editorRef}
            content={content}
            onChange={handleContentChange}
            onSelectionChange={handleSelectionChange}
            disabled={!!activeTool}
          />
        </div>

        {/* Tool Panel - Slides in from right when tool is active */}
        <AnimatePresence>
          {activeTool && (
            <ToolPanel
              tool={activeTool}
              content={content}
              selection={selection}
              onClose={() => setActiveTool(null)}
              onResult={handleToolResult}
            />
          )}
        </AnimatePresence>

        {/* Reference Panel - Story Bible & Characters */}
        <AnimatePresence>
          {showReference && !activeTool && (
            <ReferencePanel onClose={() => setShowReference(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default WritingTheater;
