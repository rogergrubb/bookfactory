'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, Settings, Download, Loader2, Save, Check, 
  Clock, History, X, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Components
import { ToolTray } from '@/components/book-theater/ToolTray';
import { ChapterTimeline } from '@/components/book-theater/ChapterTimeline';
import { WritingCanvas } from '@/components/book-theater/WritingCanvas';
import { ToolPanel } from '@/components/book-theater/ToolPanel';
import { UndoStack } from '@/components/book-theater/UndoStack';
import { SceneContextPanel } from '@/components/book-theater/SceneContextPanel';

// Types
import { 
  Book, Chapter, Tool, SubOption, Selection, 
  UndoItem, SceneContext 
} from '@/components/book-theater/types';

// ============================================================================
// TYPES
// ============================================================================

interface ToolRunRecord {
  id: string;
  toolId: string;
  toolName: string;
  input: string;
  output: string;
  createdAt: string;
  status: string;
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function BookTheaterPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  
  // Book & Chapter Data
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [content, setContent] = useState('');
  
  // Save State
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Editor State
  const [selection, setSelection] = useState<Selection | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Tool State
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [activeSubOption, setActiveSubOption] = useState<SubOption | null>(null);
  const [showSceneContextPanel, setShowSceneContextPanel] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Tool History
  const [toolHistory, setToolHistory] = useState<ToolRunRecord[]>([]);
  const [showToolHistory, setShowToolHistory] = useState(false);

  // Scene Contexts (will be loaded from book metadata)
  const [sceneContexts, setSceneContexts] = useState<SceneContext[]>([]);
  const [activeSceneContext, setActiveSceneContext] = useState<SceneContext | null>(null);

  // Undo/Redo
  const [undoStack, setUndoStack] = useState<UndoItem[]>([]);
  const [redoStack, setRedoStack] = useState<UndoItem[]>([]);

  // Characters (for dynamic tool options)
  const [characters, setCharacters] = useState<{ id: string; name: string }[]>([]);

  // Computed
  const currentChapter = book?.chapters[activeChapterIndex] || null;
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  // -------------------------------------------------------------------------
  // DATA FETCHING
  // -------------------------------------------------------------------------

  // Load book data
  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        const response = await fetch(`/api/books/${bookId}`);
        if (!response.ok) throw new Error('Book not found');
        
        const data = await response.json();
        const bookData = data.book || data;
        setBook(bookData);

        // Load scene contexts from book metadata
        if (bookData.metadata?.sceneContexts) {
          setSceneContexts(bookData.metadata.sceneContexts);
        }

        // Load characters
        if (bookData.characters) {
          setCharacters(bookData.characters.map((c: any) => ({ id: c.id, name: c.name })));
        }

        // Set initial chapter content
        if (bookData.chapters?.length > 0) {
          const sorted = [...bookData.chapters].sort((a: Chapter, b: Chapter) => a.order - b.order);
          bookData.chapters = sorted;
          setContent(sorted[0].content || '');
          if (sorted[0].updatedAt) {
            setLastSaved(new Date(sorted[0].updatedAt));
          }
        }

        setError(null);
      } catch (err) {
        console.error('Failed to load book:', err);
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setLoading(false);
      }
    }

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  // Load tool history
  useEffect(() => {
    async function fetchToolHistory() {
      try {
        const response = await fetch(`/api/books/${bookId}/tool-runs?limit=20`);
        if (response.ok) {
          const data = await response.json();
          setToolHistory(data.toolRuns || []);
        }
      } catch (err) {
        console.error('Failed to load tool history:', err);
      }
    }

    if (bookId) {
      fetchToolHistory();
    }
  }, [bookId]);

  // -------------------------------------------------------------------------
  // SAVE FUNCTIONALITY
  // -------------------------------------------------------------------------

  const saveChapter = useCallback(async () => {
    if (!currentChapter || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/chapters/${currentChapter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          wordCount,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save');
      }

      // Update local book state
      if (book) {
        const updatedChapters = [...book.chapters];
        updatedChapters[activeChapterIndex] = {
          ...updatedChapters[activeChapterIndex],
          content,
          wordCount,
          updatedAt: new Date().toISOString(),
        };
        setBook({ ...book, chapters: updatedChapters });
      }

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }, [currentChapter, content, wordCount, book, activeChapterIndex, isSaving]);

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && currentChapter) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save (5 seconds)
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveChapter();
      }, 5000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, currentChapter, saveChapter]);

  // Save on chapter switch
  const handleChapterChange = useCallback(async (index: number) => {
    if (hasUnsavedChanges && currentChapter) {
      await saveChapter();
    }

    setActiveChapterIndex(index);

    if (book?.chapters[index]) {
      setContent(book.chapters[index].content || '');
      if (book.chapters[index].updatedAt) {
        setLastSaved(new Date(book.chapters[index].updatedAt));
      }
    }

    setHasUnsavedChanges(false);
    setUndoStack([]);
    setRedoStack([]);
    setSelection(null);
  }, [book, hasUnsavedChanges, currentChapter, saveChapter]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveChapter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveChapter]);

  // -------------------------------------------------------------------------
  // CHAPTER MANAGEMENT
  // -------------------------------------------------------------------------

  const createChapter = useCallback(async (insertAfterIndex?: number) => {
    if (!book) return;

    try {
      const newOrder = insertAfterIndex !== undefined 
        ? insertAfterIndex + 1.5 
        : book.chapters.length;

      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          title: `Chapter ${book.chapters.length + 1}`,
          content: '',
          order: newOrder,
        }),
      });

      if (!response.ok) throw new Error('Failed to create chapter');

      const { chapter } = await response.json();

      // Update local state
      const updatedChapters = [...book.chapters, chapter]
        .sort((a, b) => a.order - b.order)
        .map((c, i) => ({ ...c, order: i }));

      setBook({ ...book, chapters: updatedChapters });

      // Switch to new chapter
      const newIndex = updatedChapters.findIndex(c => c.id === chapter.id);
      setActiveChapterIndex(newIndex);
      setContent('');
      setHasUnsavedChanges(false);

    } catch (err) {
      console.error('Failed to create chapter:', err);
    }
  }, [book, bookId]);

  const deleteChapter = useCallback(async (index: number) => {
    if (!book || book.chapters.length <= 1) return;

    const chapterId = book.chapters[index]?.id;
    if (!chapterId) return;

    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete chapter');

      const updatedChapters = book.chapters
        .filter(c => c.id !== chapterId)
        .map((c, i) => ({ ...c, order: i }));

      setBook({ ...book, chapters: updatedChapters });

      // Adjust active index if needed
      if (activeChapterIndex >= updatedChapters.length) {
        setActiveChapterIndex(updatedChapters.length - 1);
        setContent(updatedChapters[updatedChapters.length - 1].content || '');
      }

    } catch (err) {
      console.error('Failed to delete chapter:', err);
    }
  }, [book, activeChapterIndex]);

  const renameChapter = useCallback(async (index: number, newTitle: string) => {
    if (!book) return;

    const chapterId = book.chapters[index]?.id;
    if (!chapterId) return;

    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) throw new Error('Failed to rename chapter');

      const updatedChapters = book.chapters.map((c, i) =>
        i === index ? { ...c, title: newTitle } : c
      );

      setBook({ ...book, chapters: updatedChapters });

    } catch (err) {
      console.error('Failed to rename chapter:', err);
    }
  }, [book]);

  const reorderChapter = useCallback(async (fromIndex: number, toIndex: number) => {
    if (!book) return;

    const updatedChapters = [...book.chapters];
    const [moved] = updatedChapters.splice(fromIndex, 1);
    updatedChapters.splice(toIndex, 0, moved);

    // Update order values
    const reorderedChapters = updatedChapters.map((c, i) => ({ ...c, order: i }));
    setBook({ ...book, chapters: reorderedChapters });

    // Adjust active index if needed
    if (activeChapterIndex === fromIndex) {
      setActiveChapterIndex(toIndex);
    } else if (fromIndex < activeChapterIndex && toIndex >= activeChapterIndex) {
      setActiveChapterIndex(activeChapterIndex - 1);
    } else if (fromIndex > activeChapterIndex && toIndex <= activeChapterIndex) {
      setActiveChapterIndex(activeChapterIndex + 1);
    }

    // Persist to server
    try {
      await Promise.all(reorderedChapters.map(c =>
        fetch(`/api/chapters/${c.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: c.order }),
        })
      ));
    } catch (err) {
      console.error('Failed to reorder chapters:', err);
    }
  }, [book, activeChapterIndex]);

  // -------------------------------------------------------------------------
  // UNDO/REDO
  // -------------------------------------------------------------------------

  const pushUndo = useCallback((label: string, toolName: string) => {
    if (!currentChapter) return;

    setUndoStack(prev => [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content,
      label,
      toolName,
      timestamp: new Date(),
      chapterId: currentChapter.id,
      wordCount,
    }, ...prev.slice(0, 4)]);

    setRedoStack([]);
  }, [currentChapter, content, wordCount]);

  const undo = useCallback((index: number = 0) => {
    if (undoStack.length === 0) return;

    if (currentChapter) {
      setRedoStack(prev => [{
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        content,
        label: 'Before undo',
        toolName: 'Undo',
        timestamp: new Date(),
        chapterId: currentChapter.id,
        wordCount,
      }, ...prev.slice(0, 4)]);
    }

    const item = undoStack[index];
    setContent(item.content);
    setHasUnsavedChanges(true);
    setUndoStack(prev => prev.slice(index + 1));
  }, [undoStack, currentChapter, content, wordCount]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const [item, ...rest] = redoStack;

    if (currentChapter) {
      setUndoStack(prev => [{
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        content,
        label: 'Before redo',
        toolName: 'Redo',
        timestamp: new Date(),
        chapterId: currentChapter.id,
        wordCount,
      }, ...prev.slice(0, 4)]);
    }

    setContent(item.content);
    setHasUnsavedChanges(true);
    setRedoStack(rest);
  }, [redoStack, currentChapter, content, wordCount]);

  // -------------------------------------------------------------------------
  // TOOL HANDLING
  // -------------------------------------------------------------------------

  const handleToolSelect = useCallback((tool: Tool, subOption?: SubOption) => {
    if (tool.id === 'scene-contexts') {
      setShowSceneContextPanel(true);
      return;
    }

    setActiveTool(tool);
    setActiveSubOption(subOption || null);
  }, []);

  const handleToolClose = useCallback(() => {
    setActiveTool(null);
    setActiveSubOption(null);
  }, []);

  const handleGenerate = useCallback(async (customInstruction?: string): Promise<string> => {
    if (!activeTool || !currentChapter) {
      throw new Error('No tool or chapter selected');
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/theater', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: activeTool.id,
          subOptionId: activeSubOption?.id,
          chapterContent: content,
          selectedText: selection?.text,
          cursorPosition,
          sceneContext: activeSceneContext,
          customInstruction,
          bookId,
          chapterId: currentChapter.id,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await response.json();

      // Add to tool history
      if (data.toolRunId) {
        setToolHistory(prev => [{
          id: data.toolRunId,
          toolId: activeTool.id,
          toolName: activeTool.name,
          input: selection?.text || content.slice(Math.max(0, cursorPosition - 200), cursorPosition + 200),
          output: data.result,
          createdAt: new Date().toISOString(),
          status: 'completed',
        }, ...prev.slice(0, 19)]);
      }

      return data.result;
    } finally {
      setIsGenerating(false);
    }
  }, [activeTool, activeSubOption, content, selection, cursorPosition, activeSceneContext, bookId, currentChapter]);

  const handleInsertAfter = useCallback((text: string) => {
    if (!selection) return;

    pushUndo(`Insert after "${selection.text.slice(0, 20)}..."`, activeTool?.name || 'Insert');

    const newContent = 
      content.slice(0, selection.end) + 
      '\n\n' + text + 
      content.slice(selection.end);

    setContent(newContent);
    setHasUnsavedChanges(true);
    setSelection(null);
  }, [selection, content, pushUndo, activeTool]);

  const handleReplace = useCallback((text: string) => {
    if (!selection) return;

    pushUndo(`Replace "${selection.text.slice(0, 20)}..."`, activeTool?.name || 'Replace');

    const newContent = 
      content.slice(0, selection.start) + 
      text + 
      content.slice(selection.end);

    setContent(newContent);
    setHasUnsavedChanges(true);
    setSelection(null);
  }, [selection, content, pushUndo, activeTool]);

  const handleInsertAtCursor = useCallback((text: string) => {
    pushUndo('Insert at cursor', activeTool?.name || 'Insert');

    const newContent = 
      content.slice(0, cursorPosition) + 
      text + 
      content.slice(cursorPosition);

    setContent(newContent);
    setHasUnsavedChanges(true);
  }, [content, cursorPosition, pushUndo, activeTool]);

  // -------------------------------------------------------------------------
  // SCENE CONTEXT HANDLERS
  // -------------------------------------------------------------------------

  const handleCreateSceneContext = useCallback(async (context: Omit<SceneContext, 'id'>) => {
    const newContext: SceneContext = {
      ...context,
      id: `ctx-${Date.now()}`,
    };
    const updated = [...sceneContexts, newContext];
    setSceneContexts(updated);

    // Persist to book metadata
    if (book) {
      await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: { ...book.metadata, sceneContexts: updated },
        }),
      });
    }
  }, [sceneContexts, book, bookId]);

  const handleUpdateSceneContext = useCallback(async (context: SceneContext) => {
    const updated = sceneContexts.map(c => c.id === context.id ? context : c);
    setSceneContexts(updated);

    if (activeSceneContext?.id === context.id) {
      setActiveSceneContext(context);
    }

    // Persist to book metadata
    if (book) {
      await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: { ...book.metadata, sceneContexts: updated },
        }),
      });
    }
  }, [sceneContexts, activeSceneContext, book, bookId]);

  const handleDeleteSceneContext = useCallback(async (id: string) => {
    const updated = sceneContexts.filter(c => c.id !== id);
    setSceneContexts(updated);

    if (activeSceneContext?.id === id) {
      setActiveSceneContext(null);
    }

    // Persist to book metadata
    if (book) {
      await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: { ...book.metadata, sceneContexts: updated },
        }),
      });
    }
  }, [sceneContexts, activeSceneContext, book, bookId]);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-950">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-stone-950 text-white">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h1 className="text-xl font-semibold">{error || 'Book not found'}</h1>
        <Link href="/books" className="text-teal-500 hover:underline">
          ← Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-stone-950 text-white">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-stone-800 px-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/books" 
            className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Books</span>
          </Link>
          <div className="h-4 w-px bg-stone-700" />
          <h1 className="font-medium text-white">{book.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Status */}
          <div className="flex items-center gap-2 text-sm">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                <span className="text-stone-400">Saving...</span>
              </>
            ) : saveError ? (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-400">Save failed</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-stone-400">Unsaved changes</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span className="text-stone-500">
                  Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            ) : null}
          </div>

          {/* Save Button */}
          <button
            onClick={saveChapter}
            disabled={!hasUnsavedChanges || isSaving}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
              hasUnsavedChanges && !isSaving
                ? 'bg-teal-600 text-white hover:bg-teal-500'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
            )}
          >
            <Save className="h-4 w-4" />
            Save
          </button>

          {/* Tool History */}
          <button
            onClick={() => setShowToolHistory(!showToolHistory)}
            className="flex items-center gap-2 rounded-lg bg-stone-800 px-3 py-1.5 text-sm text-stone-300 hover:bg-stone-700 transition-colors"
          >
            <History className="h-4 w-4" />
            History
          </button>

          {/* Settings */}
          <button className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors">
            <Settings className="h-5 w-5" />
          </button>

          {/* Export */}
          <button className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Chapter Timeline */}
      <ChapterTimeline
        chapters={book.chapters}
        activeChapterIndex={activeChapterIndex}
        onChapterSelect={handleChapterChange}
        onChapterCreate={createChapter}
        onChapterDelete={deleteChapter}
        onChapterRename={renameChapter}
        onChapterReorder={reorderChapter}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tool Tray */}
        <ToolTray
          onSelectTool={handleToolSelect}
          activeTool={activeTool}
          hasSelection={!!selection}
          characters={characters}
          sceneContexts={sceneContexts}
          activeSceneContext={activeSceneContext}
          onSceneContextChange={setActiveSceneContext}
        />

        {/* Writing Canvas */}
        <div className="flex-1 overflow-hidden">
          <WritingCanvas
            chapter={currentChapter}
            content={content}
            onChange={(newContent) => {
              if (newContent !== content) {
                setContent(newContent);
                setHasUnsavedChanges(true);
              }
            }}
            onSelect={setSelection}
            onCursorChange={setCursorPosition}
            onCreateNextChapter={() => createChapter(activeChapterIndex)}
            onGoToNextChapter={() => {
              if (activeChapterIndex < book.chapters.length - 1) {
                handleChapterChange(activeChapterIndex + 1);
              }
            }}
            hasNextChapter={activeChapterIndex < book.chapters.length - 1}
            sceneContext={activeSceneContext}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={saveChapter}
            wordCount={wordCount}
            isFirstChapter={activeChapterIndex === 0}
          />
        </div>

        {/* Tool Panel */}
        {activeTool && (
          <ToolPanel
            tool={activeTool}
            subOption={activeSubOption}
            selection={selection}
            onClose={handleToolClose}
            onGenerate={handleGenerate}
            onInsertAfter={handleInsertAfter}
            onReplace={handleReplace}
            onInsertAtCursor={handleInsertAtCursor}
            isGenerating={isGenerating}
          />
        )}

        {/* Scene Context Panel */}
        {showSceneContextPanel && (
          <SceneContextPanel
            contexts={sceneContexts}
            activeContext={activeSceneContext}
            onSelect={setActiveSceneContext}
            onCreate={handleCreateSceneContext}
            onUpdate={handleUpdateSceneContext}
            onDelete={handleDeleteSceneContext}
            onClose={() => setShowSceneContextPanel(false)}
          />
        )}

        {/* Tool History Panel */}
        {showToolHistory && (
          <div className="w-80 border-l border-stone-800 bg-stone-900 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Tool History</h3>
              <button 
                onClick={() => setShowToolHistory(false)}
                className="p-1 rounded hover:bg-stone-800"
              >
                <X className="h-4 w-4 text-stone-400" />
              </button>
            </div>

            {toolHistory.length === 0 ? (
              <p className="text-sm text-stone-500">No tool runs yet. Use a tool to see history.</p>
            ) : (
              <div className="space-y-3">
                {toolHistory.map((run) => (
                  <div key={run.id} className="rounded-lg bg-stone-800 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{run.toolName}</span>
                      <span className="text-xs text-stone-500">
                        {new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 line-clamp-2">
                      {run.output?.slice(0, 100)}...
                    </p>
                    <button
                      onClick={() => {
                        pushUndo('Reuse from history', run.toolName);
                        handleInsertAtCursor(run.output);
                      }}
                      className="mt-2 text-xs text-teal-500 hover:text-teal-400"
                    >
                      Insert this result
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Undo Stack */}
      <UndoStack
        items={undoStack}
        onUndo={undo}
        onRedo={redo}
        canRedo={redoStack.length > 0}
      />
    </div>
  );
}
