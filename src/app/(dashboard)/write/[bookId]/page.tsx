'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ChevronLeft, Save, Settings, Moon, Sun, Maximize2, Minimize2,
  Plus, GripVertical, Clock, Target, Sparkles,
  Undo, Redo, Search, X, Check, AlertCircle, Loader2,
  FileText, BookOpen, Flame, Eye, EyeOff, Volume2,
  Type, AlignLeft, ChevronRight, MoreVertical, Trash2, Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBook } from '@/hooks/useBooks';
import { useChapters, Chapter } from '@/hooks/useChapters';
import AIAssistant from '@/components/editor/AIAssistant';

const statusColors = {
  DRAFT: 'bg-stone-200 text-stone-600',
  COMPLETE: 'bg-emerald-100 text-emerald-700',
  REVISION: 'bg-amber-100 text-amber-700',
};

const THEMES = {
  light: {
    bg: 'bg-stone-50',
    editor: 'bg-white',
    text: 'text-stone-900',
    muted: 'text-stone-500',
    border: 'border-stone-200',
    sidebar: 'bg-white',
    accent: 'bg-stone-900 text-white',
  },
  dark: {
    bg: 'bg-stone-950',
    editor: 'bg-stone-900',
    text: 'text-stone-100',
    muted: 'text-stone-400',
    border: 'border-stone-800',
    sidebar: 'bg-stone-900',
    accent: 'bg-white text-stone-900',
  },
  sepia: {
    bg: 'bg-amber-50',
    editor: 'bg-amber-50/50',
    text: 'text-amber-950',
    muted: 'text-amber-700',
    border: 'border-amber-200',
    sidebar: 'bg-white',
    accent: 'bg-amber-900 text-white',
  },
  focus: {
    bg: 'bg-stone-900',
    editor: 'bg-stone-900',
    text: 'text-teal-100',
    muted: 'text-teal-400',
    border: 'border-stone-700',
    sidebar: 'bg-stone-800',
    accent: 'bg-teal-500 text-white',
  },
};

function formatWordCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

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
  const [chapterTitle, setChapterTitle] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // UI state
  const [theme, setTheme] = useState<keyof typeof THEMES>('light');
  const [focusMode, setFocusMode] = useState(false);
  const [zenMode, setZenMode] = useState(false); // Even more minimal than focus
  const [showAI, setShowAI] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showChapterMenu, setShowChapterMenu] = useState<string | null>(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState<string | null>(null);

  // Editor settings
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('Georgia, serif');
  const [lineHeight, setLineHeight] = useState(1.8);
  const [showSettings, setShowSettings] = useState(false);

  // Session tracking
  const [sessionStart] = useState(Date.now());
  const [sessionWords, setSessionWords] = useState(0);
  const [dailyGoal] = useState(1000);
  const [todayWords, setTodayWords] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Theme styles
  const themeStyles = THEMES[theme];
  
  // Get current chapter
  const currentChapter = chapters.find(ch => ch.id === selectedChapterId);
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const sessionTime = Math.floor((Date.now() - sessionStart) / 1000);

  // Auto-select first chapter or create one
  useEffect(() => {
    if (chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  // Load chapter content when selected
  useEffect(() => {
    if (currentChapter) {
      setContent(currentChapter.content || '');
      setChapterTitle(currentChapter.title);
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

  // Session time updater
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update session time
      setTodayWords(prev => prev);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setCurrentStreak(data.stats?.currentStreak || 0);
          setTodayWords(data.stats?.todayWords || 0);
        }
      } catch (e) {
        // Ignore errors
      }
    }
    fetchStats();
  }, []);

  // Content change handler
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
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
        title: chapterTitle,
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
    if (confirm('Are you sure you want to delete this chapter?')) {
      await deleteChapter(chapterId);
      if (selectedChapterId === chapterId) {
        setSelectedChapterId(chapters.find(ch => ch.id !== chapterId)?.id || null);
      }
    }
    setShowChapterMenu(null);
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
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        setZenMode(!zenMode);
      }
      if (e.key === 'Escape') {
        if (zenMode) setZenMode(false);
        else if (focusMode) setFocusMode(false);
        if (showSettings) setShowSettings(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, zenMode, showAI, showSettings, hasUnsavedChanges]);

  // Loading state
  if (bookLoading || chaptersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-stone-400" />
          <p className="text-stone-500">Loading your book...</p>
        </div>
      </div>
    );
  }

  // Book not found
  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold text-stone-900">Book Not Found</h2>
          <p className="mb-4 text-stone-500">This book doesn&apos;t exist or you don&apos;t have access.</p>
          <button onClick={() => router.push('/books')} className="text-teal-600 hover:underline">
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  // Calculate progress
  const progress = Math.min(100, (todayWords / dailyGoal) * 100);
  const goalMet = todayWords >= dailyGoal;

  // Zen Mode - Ultra minimal
  if (zenMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setZenMode(false)}
          className="fixed right-6 top-6 rounded-full bg-stone-800 p-3 text-stone-400 transition-colors hover:bg-stone-700 hover:text-white"
        >
          <X className="h-5 w-5" />
        </motion.button>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl px-8"
        >
          <div className="mb-6 flex items-center justify-between text-sm text-stone-500">
            <span>{formatWordCount(wordCount)} words</span>
            <span className="flex items-center gap-2">
              {isSaving ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>
              ) : hasUnsavedChanges ? (
                <span className="text-amber-400">Unsaved</span>
              ) : (
                <span className="text-teal-400">Saved</span>
              )}
            </span>
          </div>
          
          <textarea
            ref={editorRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing..."
            autoFocus
            className="h-[60vh] w-full resize-none bg-transparent text-xl leading-relaxed text-stone-100 placeholder:text-stone-700 focus:outline-none"
            style={{ fontFamily, fontSize: `${fontSize + 2}px`, lineHeight: lineHeight + 0.2 }}
          />
          
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-stone-600">
            <span>ESC to exit</span>
            <span>⌘S to save</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-screen', themeStyles.bg)}>
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {!focusMode && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: sidebarCollapsed ? 64 : 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn('flex flex-col border-r', themeStyles.border, themeStyles.sidebar)}
          >
            {/* Sidebar Header */}
            <div className={cn('flex items-center justify-between border-b p-4', themeStyles.border)}>
              {!sidebarCollapsed && (
                <button 
                  onClick={() => router.push('/books')} 
                  className={cn('flex items-center gap-2 text-sm transition-colors', themeStyles.muted, 'hover:text-stone-900')}
                >
                  <ChevronLeft className="h-4 w-4" /> Books
                </button>
              )}
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
                className={cn('rounded-lg p-1.5 transition-colors hover:bg-stone-100', themeStyles.muted)}
              >
                <ChevronRight className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
              </button>
            </div>

            {/* Book Title */}
            {!sidebarCollapsed && (
              <div className={cn('border-b p-4', themeStyles.border)}>
                <h2 className={cn('font-semibold', themeStyles.text)}>{book.title}</h2>
                <p className={cn('text-sm', themeStyles.muted)}>{formatWordCount(book.wordCount)} words total</p>
              </div>
            )}

            {/* Chapters List */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="mb-2 flex items-center justify-between px-2">
                {!sidebarCollapsed && (
                  <span className={cn('text-xs font-medium uppercase tracking-wider', themeStyles.muted)}>
                    Chapters
                  </span>
                )}
                <button
                  onClick={handleNewChapter}
                  className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-teal-50 hover:text-teal-600"
                  title="New Chapter"
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
                      'group relative flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2.5 transition-all',
                      selectedChapterId === chapter.id
                        ? 'bg-teal-50 text-teal-700'
                        : cn(themeStyles.muted, 'hover:bg-stone-100')
                    )}
                    onClick={() => setSelectedChapterId(chapter.id)}
                  >
                    <GripVertical className="h-4 w-4 cursor-grab opacity-0 transition-opacity group-hover:opacity-40" />
                    
                    {sidebarCollapsed ? (
                      <span className="text-sm font-bold">{chapter.order}</span>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          {editingChapterTitle === chapter.id ? (
                            <input
                              type="text"
                              defaultValue={chapter.title}
                              autoFocus
                              onBlur={(e) => {
                                updateChapter(chapter.id, { title: e.target.value });
                                setEditingChapterTitle(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateChapter(chapter.id, { title: e.currentTarget.value });
                                  setEditingChapterTitle(null);
                                }
                                if (e.key === 'Escape') setEditingChapterTitle(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full rounded bg-white px-1 text-sm outline-none ring-2 ring-teal-500"
                            />
                          ) : (
                            <p className="truncate text-sm font-medium">{chapter.title}</p>
                          )}
                          <p className="text-xs opacity-60">{formatWordCount(chapter.wordCount)} words</p>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className={cn('h-2 w-2 rounded-full', statusColors[chapter.status])} />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowChapterMenu(showChapterMenu === chapter.id ? null : chapter.id);
                            }}
                            className="rounded p-1 hover:bg-stone-200"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Chapter menu */}
                        {showChapterMenu === chapter.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border bg-white py-1 shadow-lg">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingChapterTitle(chapter.id);
                                setShowChapterMenu(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100"
                            >
                              <Edit2 className="h-3 w-3" /> Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChapter(chapter.id);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {chapters.length === 0 && !sidebarCollapsed && (
                <div className="py-8 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-stone-300" />
                  <p className="text-sm text-stone-400">No chapters yet</p>
                  <button
                    onClick={handleNewChapter}
                    className="mt-2 text-sm text-teal-600 hover:underline"
                  >
                    Create first chapter
                  </button>
                </div>
              )}
            </div>

            {/* Session Stats */}
            {!sidebarCollapsed && (
              <div className={cn('border-t p-4', themeStyles.border)}>
                {/* Writing streak */}
                {currentStreak > 0 && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                    <Flame className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-700">{currentStreak} day streak!</span>
                  </div>
                )}
                
                {/* Daily goal progress */}
                <div className="mb-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className={themeStyles.muted}>Daily Goal</span>
                    <span className={cn('font-medium', goalMet ? 'text-emerald-600' : themeStyles.text)}>
                      {todayWords} / {dailyGoal}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className={cn('h-full rounded-full', goalMet ? 'bg-emerald-500' : 'bg-teal-500')}
                    />
                  </div>
                </div>
                
                {/* Session stats */}
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Session: +{sessionWords} words</span>
                  <span>{formatTime(sessionTime)}</span>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Editor */}
      <main className={cn('flex flex-1 flex-col', themeStyles.bg)}>
        {/* Toolbar */}
        {!focusMode && (
          <header className={cn('flex items-center justify-between border-b px-4 py-3', themeStyles.border, themeStyles.sidebar)}>
            <div className="flex items-center gap-3">
              {/* Chapter title */}
              {currentChapter && (
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm', themeStyles.muted)}>Ch. {currentChapter.order}</span>
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => {
                      setChapterTitle(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className={cn(
                      'bg-transparent text-lg font-semibold outline-none transition-colors',
                      'focus:border-b-2 focus:border-teal-500',
                      themeStyles.text
                    )}
                    placeholder="Chapter Title"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Save Status */}
              <div className={cn('flex items-center gap-2 text-sm', themeStyles.muted)}>
                {isSaving ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : hasUnsavedChanges ? (
                  <span className="text-amber-600">Unsaved changes</span>
                ) : lastSaved ? (
                  <span className="text-emerald-600">
                    <Check className="mr-1 inline-block h-3 w-3" /> Saved
                  </span>
                ) : null}
              </div>

              <div className="mx-2 h-6 w-px bg-stone-200" />

              {/* Word count */}
              <div className={cn('flex items-center gap-1.5 text-sm', themeStyles.muted)}>
                <Type className="h-4 w-4" />
                <span>{formatWordCount(wordCount)}</span>
              </div>

              <div className="mx-2 h-6 w-px bg-stone-200" />

              {/* Actions */}
              <button
                onClick={() => setShowAI(!showAI)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
                  showAI ? 'bg-teal-100 text-teal-700' : 'hover:bg-stone-100'
                )}
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI</span>
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  showSettings ? 'bg-stone-100' : 'hover:bg-stone-100',
                  themeStyles.muted
                )}
              >
                <Settings className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setFocusMode(true)}
                className={cn('rounded-lg p-2 transition-colors hover:bg-stone-100', themeStyles.muted)}
                title="Focus Mode (⌘⇧F)"
              >
                <Maximize2 className="h-4 w-4" />
              </button>

              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="ml-2 flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </header>
        )}

        {/* Editor Area */}
        <div className="flex flex-1 overflow-hidden">
          <div className={cn(
            'flex-1 overflow-y-auto',
            focusMode && 'flex items-start justify-center pt-16'
          )}>
            <div className={cn(
              'mx-auto px-8 py-8',
              focusMode ? 'max-w-2xl' : 'max-w-3xl w-full'
            )}>
              {/* Focus Mode Header */}
              {focusMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-8 flex items-center justify-between"
                >
                  <div className={cn('text-sm', themeStyles.muted)}>
                    {formatWordCount(wordCount)} words • {formatTime(sessionTime)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZenMode(true)}
                      className={cn('rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-stone-100', themeStyles.muted)}
                    >
                      Zen Mode
                    </button>
                    <button
                      onClick={() => setFocusMode(false)}
                      className={cn('rounded-lg p-2 transition-colors hover:bg-stone-100', themeStyles.muted)}
                    >
                      <Minimize2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Chapter Title (Focus Mode) */}
              {focusMode && currentChapter && (
                <h1 className={cn('mb-6 text-2xl font-bold', themeStyles.text)}>
                  {chapterTitle}
                </h1>
              )}

              {/* Writing Area */}
              <textarea
                ref={editorRef}
                value={content}
                onChange={handleContentChange}
                placeholder="Start writing your story..."
                className={cn(
                  'w-full resize-none bg-transparent outline-none',
                  'placeholder:text-stone-300',
                  themeStyles.text
                )}
                style={{
                  fontFamily,
                  fontSize: `${fontSize}px`,
                  lineHeight,
                  minHeight: focusMode ? '60vh' : '70vh',
                }}
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
                className={cn('border-l overflow-hidden', themeStyles.border)}
              >
                <AIAssistant
                  bookId={bookId}
                  content={content}
                  onInsert={(text) => {
                    setContent(prev => prev + '\n\n' + text);
                    setHasUnsavedChanges(true);
                  }}
                  onClose={() => setShowAI(false)}
                  bookContext={{
                    title: book.title,
                    genre: book.genre,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && !focusMode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className={cn('border-l overflow-hidden', themeStyles.border, themeStyles.sidebar)}
              >
                <div className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className={cn('font-semibold', themeStyles.text)}>Editor Settings</h3>
                    <button onClick={() => setShowSettings(false)} className="text-stone-400 hover:text-stone-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Theme */}
                  <div className="mb-6">
                    <label className={cn('mb-2 block text-sm font-medium', themeStyles.muted)}>Theme</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            'aspect-square rounded-lg border-2 transition-all',
                            theme === t ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-stone-200',
                            t === 'light' && 'bg-white',
                            t === 'dark' && 'bg-stone-900',
                            t === 'sepia' && 'bg-amber-100',
                            t === 'focus' && 'bg-stone-800'
                          )}
                          title={t.charAt(0).toUpperCase() + t.slice(1)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="mb-6">
                    <label className={cn('mb-2 block text-sm font-medium', themeStyles.muted)}>
                      Font Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="14"
                      max="28"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>

                  {/* Line Height */}
                  <div className="mb-6">
                    <label className={cn('mb-2 block text-sm font-medium', themeStyles.muted)}>
                      Line Height: {lineHeight}
                    </label>
                    <input
                      type="range"
                      min="1.4"
                      max="2.4"
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) => setLineHeight(Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>

                  {/* Font Family */}
                  <div className="mb-6">
                    <label className={cn('mb-2 block text-sm font-medium', themeStyles.muted)}>Font</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 text-sm',
                        themeStyles.border, themeStyles.bg, themeStyles.text
                      )}
                    >
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="'Merriweather', serif">Merriweather</option>
                      <option value="'Lora', serif">Lora</option>
                      <option value="system-ui, sans-serif">System</option>
                      <option value="'JetBrains Mono', monospace">Monospace</option>
                    </select>
                  </div>

                  {/* Keyboard Shortcuts */}
                  <div>
                    <h4 className={cn('mb-2 text-sm font-medium', themeStyles.muted)}>Shortcuts</h4>
                    <div className="space-y-1.5 text-xs text-stone-500">
                      <div className="flex justify-between"><span>Save</span><kbd className="rounded bg-stone-100 px-1.5 py-0.5">⌘S</kbd></div>
                      <div className="flex justify-between"><span>AI Assistant</span><kbd className="rounded bg-stone-100 px-1.5 py-0.5">⌘J</kbd></div>
                      <div className="flex justify-between"><span>Focus Mode</span><kbd className="rounded bg-stone-100 px-1.5 py-0.5">⌘⇧F</kbd></div>
                      <div className="flex justify-between"><span>Zen Mode</span><kbd className="rounded bg-stone-100 px-1.5 py-0.5">⌘⇧Z</kbd></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Status Bar */}
        {!focusMode && (
          <footer className={cn('flex items-center justify-between border-t px-4 py-2 text-xs', themeStyles.border, themeStyles.muted)}>
            <div className="flex items-center gap-4">
              <span>Chapter {chapters.findIndex(ch => ch.id === selectedChapterId) + 1} of {chapters.length}</span>
              <span>{Math.ceil(wordCount / 250)} min read</span>
            </div>
            <div className="flex items-center gap-4">
              <span className={cn('flex items-center gap-1', goalMet && 'text-emerald-600')}>
                <Target className="h-3 w-3" />
                {todayWords}/{dailyGoal} today
              </span>
              {currentStreak > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Flame className="h-3 w-3" />
                  {currentStreak} day streak
                </span>
              )}
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}
