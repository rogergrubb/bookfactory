
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ChevronLeft, Save, Settings, Moon, Sun, Maximize2, Minimize2,
  Plus, MoreHorizontal, GripVertical, Clock, Target, Sparkles,
  Bold, Italic, Underline, List, ListOrdered, Quote, Heading1,
  Heading2, Undo, Redo, Search, X, Check, AlertCircle, Loader2,
  ChevronDown, FileText, BookOpen
} from 'lucide-react';
import { cn, formatWordCount } from '@/lib/utils';
import { useBook } from '@/hooks/useBooks';
import { useChapters, Chapter } from '@/hooks/useChapters';
import { useAI } from '@/hooks/useAI';
import AIAssistant from '@/components/editor/AIAssistant';

const statusColors = {
  DRAFT: 'bg-slate-200 text-slate-600',
  COMPLETE: 'bg-emerald-100 text-emerald-600',
  REVISION: 'bg-amber-100 text-amber-600',
};

export default function WritingEditorPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  // Data fetching
  const { book, isLoading: bookLoading } = useBook(bookId);
  const { chapters, updateChapter, createChapter, deleteChapter, reorderChapters, isLoading: chaptersLoading } = useChapters(bookId);

  // Editor state
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // UI state
  const [darkMode, setDarkMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Session tracking
  const [sessionStart] = useState(new Date());
  const [sessionWords, setSessionWords] = useState(0);
  const [dailyGoal] = useState(1000);
  const [todayWords, setTodayWords] = useState(0);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current chapter
  const currentChapter = chapters.find(ch => ch.id === selectedChapterId);
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  // Auto-select first chapter
  useEffect(() => {
    if (chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  // Load chapter content when selected
  useEffect(() => {
    if (currentChapter) {
      setContent(currentChapter.content || '');
      setHasUnsavedChanges(false);
    }
  }, [selectedChapterId, currentChapter?.id]);

  // Auto-save with debounce
  useEffect(() => {
    if (hasUnsavedChanges && selectedChapterId) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      saveTimeoutRef.current = setTimeout(async () => {
        await handleSave();
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [content, hasUnsavedChanges, selectedChapterId]);

  // Content change handler
  const handleContentChange = useCallback((newContent: string) => {
    const oldWordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const newWordCount = newContent.split(/\s+/).filter(w => w.length > 0).length;
    const wordsDiff = newWordCount - oldWordCount;
    
    if (wordsDiff > 0) {
      setSessionWords(prev => prev + wordsDiff);
      setTodayWords(prev => prev + wordsDiff);
    }

    setContent(newContent);
    setHasUnsavedChanges(true);
  }, [content]);

  // Save handler
  const handleSave = async () => {
    if (!selectedChapterId || !hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      await updateChapter(selectedChapterId, {
        content,
        wordCount,
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Create new chapter
  const handleNewChapter = async () => {
    const newChapter = await createChapter({
      title: `Chapter ${chapters.length + 1}`,
      content: '',
    });
    if (newChapter?.chapter) {
      setSelectedChapterId(newChapter.chapter.id);
    }
  };

  // Delete chapter
  const handleDeleteChapter = async (chapterId: string) => {
    await deleteChapter(chapterId);
    if (selectedChapterId === chapterId) {
      setSelectedChapterId(chapters.find(ch => ch.id !== chapterId)?.id || null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setShowAI(!showAI);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setFocusMode(!focusMode);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowSearch(!showSearch);
      }
      if (e.key === 'Escape') {
        if (focusMode) setFocusMode(false);
        if (showSearch) setShowSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, showAI, showSearch, hasUnsavedChanges]);

  // Format commands
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML);
    }
  };

  if (bookLoading || chaptersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-violet-600" />
          <p className="text-slate-500">Loading your book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Book Not Found</h2>
          <p className="mb-4 text-slate-500">This book doesn't exist or you don't have access.</p>
          <button onClick={() => router.push('/books')} className="text-violet-600 hover:underline">
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  // Calculate progress
  const progress = (todayWords / dailyGoal) * 100;
  const goalMet = todayWords >= dailyGoal;
  const sessionTime = Math.floor((Date.now() - sessionStart.getTime()) / 60000);

  return (
    <div className={cn('flex h-screen', darkMode && 'dark')}>
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {!focusMode && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: sidebarCollapsed ? 60 : 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
              {!sidebarCollapsed && (
                <button onClick={() => router.push('/books')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              )}
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                {sidebarCollapsed ? <ChevronLeft className="h-4 w-4 rotate-180" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            {/* Book Title */}
            {!sidebarCollapsed && (
              <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-white">{book.title}</h2>
                <p className="text-sm text-slate-500">{formatWordCount(book.wordCount)} words</p>
              </div>
            )}

            {/* Chapters List */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="mb-2 flex items-center justify-between px-2">
                {!sidebarCollapsed && <span className="text-xs font-medium text-slate-500">CHAPTERS</span>}
                <button
                  onClick={handleNewChapter}
                  className="rounded p-1 text-slate-400 hover:bg-violet-100 hover:text-violet-600"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <Reorder.Group
                axis="y"
                values={chapters}
                onReorder={(newOrder) => reorderChapters(newOrder.map(ch => ch.id))}
                className="space-y-1"
              >
                {chapters.map((chapter) => (
                  <Reorder.Item
                    key={chapter.id}
                    value={chapter}
                    className={cn(
                      'group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 transition-colors',
                      selectedChapterId === chapter.id
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}
                    onClick={() => setSelectedChapterId(chapter.id)}
                  >
                    <GripVertical className="h-4 w-4 cursor-grab opacity-0 group-hover:opacity-50" />
                    {sidebarCollapsed ? (
                      <span className="text-xs font-bold">{chapter.order}</span>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{chapter.title}</p>
                          <p className="text-xs text-slate-400">{formatWordCount(chapter.wordCount)}</p>
                        </div>
                        <span className={cn('h-2 w-2 rounded-full', statusColors[chapter.status])} />
                      </>
                    )}
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>

            {/* Session Stats */}
            {!sidebarCollapsed && (
              <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                <div className="mb-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Daily Goal</span>
                    <span className={goalMet ? 'text-emerald-600' : 'text-slate-700 dark:text-white'}>
                      {todayWords}/{dailyGoal}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={cn('h-full transition-all', goalMet ? 'bg-emerald-500' : 'bg-violet-500')}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Session: {sessionWords} words</span>
                  <span>{sessionTime} min</span>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Editor */}
      <main className={cn(
        'flex flex-1 flex-col',
        darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900',
        focusMode && 'bg-slate-900'
      )}>
        {/* Toolbar */}
        {!focusMode && (
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-800">
            <div className="flex items-center gap-1">
              <button onClick={() => formatText('bold')} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Bold className="h-4 w-4" />
              </button>
              <button onClick={() => formatText('italic')} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Italic className="h-4 w-4" />
              </button>
              <button onClick={() => formatText('underline')} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Underline className="h-4 w-4" />
              </button>
              <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <button onClick={() => formatText('formatBlock', 'h1')} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Heading1 className="h-4 w-4" />
              </button>
              <button onClick={() => formatText('formatBlock', 'h2')} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Heading2 className="h-4 w-4" />
              </button>
              <button onClick={() => formatText('insertUnorderedList')} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <List className="h-4 w-4" />
              </button>
              <button onClick={() => formatText('insertOrderedList')} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <ListOrdered className="h-4 w-4" />
              </button>
              <button onClick={() => formatText('formatBlock', 'blockquote')} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Quote className="h-4 w-4" />
              </button>
              <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <button onClick={() => document.execCommand('undo')} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Undo className="h-4 w-4" />
              </button>
              <button onClick={() => document.execCommand('redo')} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Redo className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Save Status */}
              <div className="flex items-center gap-2 text-sm">
                {isSaving ? (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : hasUnsavedChanges ? (
                  <span className="text-amber-600">Unsaved changes</span>
                ) : lastSaved ? (
                  <span className="text-slate-400">Saved</span>
                ) : null}
              </div>

              <button
                onClick={() => setShowSearch(!showSearch)}
                className="rounded p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowAI(!showAI)}
                className={cn('rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800', showAI && 'bg-violet-100 text-violet-600')}
              >
                <Sparkles className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="rounded p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setFocusMode(true)}
                className="rounded p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                <Save className="mr-2 inline-block h-4 w-4" /> Save
              </button>
            </div>
          </header>
        )}

        {/* Editor Area */}
        <div className="flex flex-1 overflow-hidden">
          <div className={cn('flex-1 overflow-y-auto', focusMode && 'flex items-center justify-center')}>
            <div className={cn(
              'mx-auto px-8 py-12',
              focusMode ? 'max-w-2xl' : 'max-w-3xl'
            )}>
              {/* Chapter Title */}
              {currentChapter && !focusMode && (
                <input
                  type="text"
                  value={currentChapter.title}
                  onChange={(e) => updateChapter(currentChapter.id, { title: e.target.value })}
                  className="mb-8 w-full bg-transparent text-3xl font-bold outline-none placeholder:text-slate-300"
                  placeholder="Chapter Title"
                />
              )}

              {/* Content Editor */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => handleContentChange(e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: content }}
                className={cn(
                  'prose prose-slate max-w-none outline-none dark:prose-invert',
                  'prose-p:my-4 prose-p:leading-relaxed',
                  'prose-headings:font-bold',
                  focusMode && 'text-lg leading-relaxed text-slate-200'
                )}
                style={{ minHeight: focusMode ? '60vh' : '70vh' }}
              />
            </div>
          </div>

          {/* AI Sidebar */}
          <AnimatePresence>
            {showAI && !focusMode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-slate-200 dark:border-slate-800"
              >
                <AIAssistant
                  bookId={bookId}
                  content={content}
                  onInsert={(text) => {
                    const newContent = content + '\n\n' + text;
                    handleContentChange(newContent);
                  }}
                  onClose={() => setShowAI(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Status Bar */}
        {!focusMode && (
          <footer className="flex items-center justify-between border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <span>{formatWordCount(wordCount)} words</span>
              <span>{Math.ceil(wordCount / 250)} min read</span>
              <span>Chapter {chapters.findIndex(ch => ch.id === selectedChapterId) + 1} of {chapters.length}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className={cn(goalMet && 'text-emerald-600')}>
                <Target className="mr-1 inline-block h-3 w-3" />
                {todayWords}/{dailyGoal} today
              </span>
              <span>⌘S save • ⌘J AI • ⌘⇧F focus</span>
            </div>
          </footer>
        )}

        {/* Focus Mode Exit */}
        {focusMode && (
          <button
            onClick={() => setFocusMode(false)}
            className="fixed right-4 top-4 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        )}
      </main>
    </div>
  );
}
