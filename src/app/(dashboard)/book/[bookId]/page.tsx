'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Settings, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Components
import { ToolTray } from '@/components/book-theater/ToolTray';
import { ChapterTimeline } from '@/components/book-theater/ChapterTimeline';
import { WritingCanvas } from '@/components/book-theater/WritingCanvas';
import { ToolPanel } from '@/components/book-theater/ToolPanel';
import { UndoStack } from '@/components/book-theater/UndoStack';
import { SceneContextPanel } from '@/components/book-theater/SceneContextPanel';

// Types & Tools
import { 
  Book, Chapter, Tool, SubOption, Selection, 
  UndoItem, SceneContext 
} from '@/components/book-theater/types';

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function BookTheaterPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  
  // Book & Chapter Data
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editor State
  const [selection, setSelection] = useState<Selection | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Tool State
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [activeSubOption, setActiveSubOption] = useState<SubOption | null>(null);
  const [showSceneContextPanel, setShowSceneContextPanel] = useState(false);

  // Scene Contexts
  const [sceneContexts, setSceneContexts] = useState<SceneContext[]>([
    {
      id: 'haunted-house',
      name: 'Haunted House',
      icon: '🏚️',
      sensory: {
        sight: 'Cobwebs in corners, dust motes in pale light, shadows that move',
        sound: 'Creaking floorboards, distant whispers, settling wood',
        smell: 'Musty decay, old wood, something rotting',
        touch: 'Cold spots, rough peeling wallpaper, sticky door handles',
        taste: 'Dust on the tongue, metallic fear',
      },
      mood: { primary: 'Dread', secondary: 'Curiosity' },
      props: ['Creaking stairs', 'Flickering candles', 'Dusty portraits', 'Locked doors'],
      aiNotes: 'Build tension slowly. Characters should feel watched. Every sound is amplified.',
    },
  ]);
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

  useEffect(() => {
    async function fetchBook() {
      try {
        const response = await fetch(`/api/books/${bookId}`);
        if (!response.ok) throw new Error('Book not found');
        
        const data = await response.json();
        const bookData = data.book || data;
        setBook(bookData);

        if (bookData.chapters?.length > 0) {
          const sorted = [...bookData.chapters].sort((a: Chapter, b: Chapter) => a.order - b.order);
          setBook({ ...bookData, chapters: sorted });
          setContent(sorted[0]?.content || '');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setLoading(false);
      }
    }

    if (bookId) fetchBook();
  }, [bookId]);

  // -------------------------------------------------------------------------
  // CHAPTER MANAGEMENT
  // -------------------------------------------------------------------------

  const saveChapter = useCallback(async () => {
    if (!currentChapter || !book) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/chapters/${currentChapter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, wordCount }),
      });

      if (!response.ok) throw new Error('Failed to save');

      setBook(prev => prev ? {
        ...prev,
        chapters: prev.chapters.map((ch, i) =>
          i === activeChapterIndex ? { ...ch, content, wordCount } : ch
        ),
      } : null);

      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [currentChapter, book, content, wordCount, activeChapterIndex]);

  const switchChapter = useCallback(async (index: number) => {
    if (!book || index === activeChapterIndex) return;

    if (hasUnsavedChanges && currentChapter) {
      await saveChapter();
    }

    setActiveChapterIndex(index);
    setContent(book.chapters[index]?.content || '');
    setHasUnsavedChanges(false);
    setActiveTool(null);
    setActiveSubOption(null);
    setSelection(null);
  }, [book, activeChapterIndex, hasUnsavedChanges, currentChapter, saveChapter]);

  const createChapter = useCallback(async (insertAfterIndex?: number) => {
    if (!book) return;

    try {
      const newOrder = insertAfterIndex !== undefined
        ? book.chapters[insertAfterIndex].order + 1
        : (book.chapters.length > 0 
            ? Math.max(...book.chapters.map(c => c.order)) + 1 
            : 1);

      const response = await fetch(`/api/books/${bookId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Chapter ${newOrder}`,
          content: '',
          order: newOrder,
        }),
      });

      if (!response.ok) throw new Error('Failed to create chapter');

      const newChapter = await response.json();

      setBook(prev => {
        if (!prev) return null;

        let updatedChapters = [...prev.chapters];

        if (insertAfterIndex !== undefined) {
          updatedChapters = updatedChapters.map(ch => 
            ch.order >= newOrder ? { ...ch, order: ch.order + 1 } : ch
          );
        }

        updatedChapters.push(newChapter);
        updatedChapters.sort((a, b) => a.order - b.order);

        return { ...prev, chapters: updatedChapters };
      });

      const newIndex = insertAfterIndex !== undefined 
        ? insertAfterIndex + 1 
        : (book.chapters.length);
      
      setActiveChapterIndex(newIndex);
      setContent('');
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to create chapter:', err);
    }
  }, [book, bookId]);

  const renameChapter = useCallback(async (index: number, newTitle: string) => {
    if (!book) return;

    const chapter = book.chapters[index];
    if (!chapter) return;

    try {
      await fetch(`/api/chapters/${chapter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      setBook(prev => prev ? {
        ...prev,
        chapters: prev.chapters.map((ch, i) =>
          i === index ? { ...ch, title: newTitle } : ch
        ),
      } : null);
    } catch (err) {
      console.error('Failed to rename chapter:', err);
    }
  }, [book]);

  const deleteChapter = useCallback(async (index: number) => {
    if (!book || book.chapters.length <= 1) return;

    const chapter = book.chapters[index];
    if (!chapter) return;

    try {
      await fetch(`/api/chapters/${chapter.id}`, {
        method: 'DELETE',
      });

      setBook(prev => {
        if (!prev) return null;
        const updated = prev.chapters.filter((_, i) => i !== index);
        return { ...prev, chapters: updated };
      });

      if (activeChapterIndex >= index && activeChapterIndex > 0) {
        setActiveChapterIndex(prev => prev - 1);
      }

      const newIndex = Math.min(activeChapterIndex, book.chapters.length - 2);
      setContent(book.chapters[newIndex === index ? newIndex + 1 : newIndex]?.content || '');
    } catch (err) {
      console.error('Failed to delete chapter:', err);
    }
  }, [book, activeChapterIndex]);

  const reorderChapter = useCallback(async (fromIndex: number, toIndex: number) => {
    if (!book) return;
    console.log('Reorder from', fromIndex, 'to', toIndex);
  }, [book]);

  // -------------------------------------------------------------------------
  // UNDO/REDO
  // -------------------------------------------------------------------------

  const pushUndo = useCallback((label: string, toolName: string) => {
    if (!currentChapter) return;

    const item: UndoItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content,
      label,
      toolName,
      timestamp: new Date(),
      chapterId: currentChapter.id,
      wordCount,
    };

    setUndoStack(prev => [item, ...prev.slice(0, 4)]);
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
    return data.result;
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

  const handleCreateSceneContext = useCallback((context: Omit<SceneContext, 'id'>) => {
    const newContext: SceneContext = {
      ...context,
      id: `ctx-${Date.now()}`,
    };
    setSceneContexts(prev => [...prev, newContext]);
  }, []);

  const handleUpdateSceneContext = useCallback((context: SceneContext) => {
    setSceneContexts(prev => prev.map(c => c.id === context.id ? context : c));
    if (activeSceneContext?.id === context.id) {
      setActiveSceneContext(context);
    }
  }, [activeSceneContext]);

  const handleDeleteSceneContext = useCallback((id: string) => {
    setSceneContexts(prev => prev.filter(c => c.id !== id));
    if (activeSceneContext?.id === id) {
      setActiveSceneContext(null);
    }
  }, [activeSceneContext]);

  // -------------------------------------------------------------------------
  // KEYBOARD SHORTCUTS
  // -------------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo(0);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Escape') {
        handleToolClose();
        setShowSceneContextPanel(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleToolClose]);

  // -------------------------------------------------------------------------
  // RENDER: LOADING / ERROR
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Book not found'}</p>
          <Link href="/books" className="text-teal-400 hover:underline">
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: MAIN LAYOUT
  // -------------------------------------------------------------------------

  return (
    <div className="h-screen flex flex-col bg-stone-950 overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-stone-900 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <Link
            href="/books"
            className="flex items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Books</span>
          </Link>
          <div className="w-px h-5 bg-stone-700" />
          <h1 className="text-lg font-medium text-stone-100">{book.title}</h1>
          {book.subtitle && (
            <span className="text-sm text-stone-500">{book.subtitle}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chapter Timeline */}
      <ChapterTimeline
        chapters={book.chapters}
        activeChapterIndex={activeChapterIndex}
        onChapterSelect={switchChapter}
        onChapterCreate={createChapter}
        onChapterRename={renameChapter}
        onChapterDelete={deleteChapter}
        onChapterReorder={reorderChapter}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tool Tray (Left) */}
        <ToolTray
          onSelectTool={handleToolSelect}
          activeTool={activeTool}
          hasSelection={!!selection}
          characters={characters}
          sceneContexts={sceneContexts}
          activeSceneContext={activeSceneContext}
          onSceneContextChange={setActiveSceneContext}
        />

        {/* Writing Canvas (Center) */}
        <WritingCanvas
          chapter={currentChapter}
          content={content}
          onChange={(newContent) => {
            setContent(newContent);
            setHasUnsavedChanges(true);
          }}
          onSelect={setSelection}
          onCursorChange={setCursorPosition}
          onCreateNextChapter={() => createChapter(activeChapterIndex)}
          onGoToNextChapter={() => switchChapter(activeChapterIndex + 1)}
          hasNextChapter={activeChapterIndex < book.chapters.length - 1}
          sceneContext={activeSceneContext}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={saveChapter}
          wordCount={wordCount}
          isFirstChapter={book.chapters.length === 0}
        />

        {/* Tool Panel (Right) - Conditional */}
        {activeTool && !showSceneContextPanel && (
          <ToolPanel
            tool={activeTool}
            subOption={activeSubOption}
            selection={selection}
            sceneContext={activeSceneContext}
            chapterContent={content}
            cursorPosition={cursorPosition}
            onClose={handleToolClose}
            onGenerate={handleGenerate}
            onInsertAfter={handleInsertAfter}
            onReplace={handleReplace}
            onInsertAtCursor={handleInsertAtCursor}
          />
        )}

        {/* Scene Context Panel (Right) - Conditional */}
        {showSceneContextPanel && (
          <SceneContextPanel
            contexts={sceneContexts}
            activeContext={activeSceneContext}
            onSelect={(ctx) => {
              setActiveSceneContext(ctx);
              setShowSceneContextPanel(false);
            }}
            onCreate={handleCreateSceneContext}
            onUpdate={handleUpdateSceneContext}
            onDelete={handleDeleteSceneContext}
            onClose={() => setShowSceneContextPanel(false)}
          />
        )}
      </div>

      {/* Undo Stack (Bottom) */}
      <UndoStack
        items={undoStack}
        onUndo={undo}
        onUndoLatest={() => undo(0)}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onRedo={redo}
      />
    </div>
  );
}
