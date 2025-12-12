'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, ChevronLeft, Plus, MoreVertical, Edit2, Trash2,
  FileText, Clock, Target, TrendingUp, Settings, Sparkles,
  GripVertical, Check, X, Loader2, Play, Users, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
  status: 'DRAFT' | 'REVISION' | 'COMPLETE';
  createdAt: string;
  updatedAt: string;
}

interface Book {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  genre: string;
  status: string;
  targetWordCount: number;
  targetChapters: number;
  createdAt: string;
  updatedAt: string;
  chapters: Chapter[];
  totalWordCount: number;
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Fetch book data
  useEffect(() => {
    async function fetchBook() {
      try {
        const response = await fetch(`/api/books/${bookId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Book not found');
          }
          throw new Error('Failed to load book');
        }
        const data = await response.json();
        // API returns book directly, but may have stats wrapped
        const bookData = data.book || data;
        setBook({
          ...bookData,
          totalWordCount: bookData.stats?.totalWordCount || bookData.chapters?.reduce((sum: number, ch: any) => sum + ch.wordCount, 0) || 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setLoading(false);
      }
    }

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  // Create new chapter
  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) return;

    try {
      const response = await fetch(`/api/books/${bookId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newChapterTitle.trim(),
          order: (book?.chapters.length || 0) + 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to create chapter');

      const { chapter } = await response.json();
      setBook(prev => prev ? {
        ...prev,
        chapters: [...prev.chapters, chapter],
      } : null);
      setNewChapterTitle('');
      setIsCreatingChapter(false);
    } catch (err) {
      console.error('Failed to create chapter:', err);
    }
  };

  // Update chapter title
  const handleUpdateChapterTitle = async (chapterId: string) => {
    if (!editingTitle.trim()) {
      setEditingChapterId(null);
      return;
    }

    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (!response.ok) throw new Error('Failed to update chapter');

      setBook(prev => prev ? {
        ...prev,
        chapters: prev.chapters.map(ch =>
          ch.id === chapterId ? { ...ch, title: editingTitle.trim() } : ch
        ),
      } : null);
      setEditingChapterId(null);
    } catch (err) {
      console.error('Failed to update chapter:', err);
    }
  };

  // Delete chapter
  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;

    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete chapter');

      setBook(prev => prev ? {
        ...prev,
        chapters: prev.chapters.filter(ch => ch.id !== chapterId),
      } : null);
    } catch (err) {
      console.error('Failed to delete chapter:', err);
    }
  };

  // Calculate progress
  const totalWords = book?.totalWordCount || book?.chapters.reduce((sum, ch) => sum + ch.wordCount, 0) || 0;
  const targetWords = book?.targetWordCount || 80000;
  const progressPercent = Math.min(100, Math.round((totalWords / targetWords) * 100));
  const completedChapters = book?.chapters.filter(ch => ch.status === 'COMPLETE').length || 0;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-stone-300" />
        <h2 className="mt-4 text-xl font-semibold text-stone-900">Book Not Found</h2>
        <p className="mt-2 text-stone-500">{error || "This book doesn't exist or you don't have access to it."}</p>
        <Link href="/books" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">
          <ChevronLeft className="h-4 w-4" /> Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/books" className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-800">
                <ChevronLeft className="h-5 w-5 text-stone-500" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-stone-900 dark:text-white">{book.title}</h1>
                {book.subtitle && (
                  <p className="text-sm text-stone-500">{book.subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/writing-theater?bookId=${book.id}`}
                className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                <Play className="h-4 w-4" /> Write
              </Link>
              <button className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-800">
                <Settings className="h-5 w-5 text-stone-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Chapters */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-800">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Chapters</h2>
                <button
                  onClick={() => setIsCreatingChapter(true)}
                  className="flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                >
                  <Plus className="h-4 w-4" /> Add Chapter
                </button>
              </div>

              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {book.chapters.length === 0 && !isCreatingChapter ? (
                  <div className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-10 w-10 text-stone-300" />
                    <p className="mt-3 text-stone-500">No chapters yet</p>
                    <button
                      onClick={() => setIsCreatingChapter(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                    >
                      <Plus className="h-4 w-4" /> Create First Chapter
                    </button>
                  </div>
                ) : (
                  <>
                    {book.chapters
                      .sort((a, b) => a.order - b.order)
                      .map((chapter, index) => (
                        <div
                          key={chapter.id}
                          className="group flex items-center gap-4 px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            {editingChapterId === chapter.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm outline-none focus:border-teal-500 dark:border-stone-700 dark:bg-stone-800"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateChapterTitle(chapter.id);
                                    if (e.key === 'Escape') setEditingChapterId(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleUpdateChapterTitle(chapter.id)}
                                  className="rounded p-1 text-teal-600 hover:bg-teal-50"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingChapterId(null)}
                                  className="rounded p-1 text-stone-400 hover:bg-stone-100"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <Link
                                href={`/books/${book.id}/chapters/${chapter.id}`}
                                className="block"
                              >
                                <p className="font-medium text-stone-900 dark:text-white truncate">
                                  {chapter.title}
                                </p>
                                <p className="text-sm text-stone-500">
                                  {chapter.wordCount.toLocaleString()} words
                                  <span className={cn(
                                    'ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs',
                                    chapter.status === 'COMPLETE' && 'bg-emerald-100 text-emerald-700',
                                    chapter.status === 'REVISION' && 'bg-amber-100 text-amber-700',
                                    chapter.status === 'DRAFT' && 'bg-stone-100 text-stone-600'
                                  )}>
                                    {chapter.status.toLowerCase()}
                                  </span>
                                </p>
                              </Link>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingChapterId(chapter.id);
                                setEditingTitle(chapter.title);
                              }}
                              className="rounded p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteChapter(chapter.id)}
                              className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                    {/* New chapter input */}
                    {isCreatingChapter && (
                      <div className="flex items-center gap-4 px-6 py-4 bg-teal-50/50 dark:bg-teal-950/20">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-600">
                          {book.chapters.length + 1}
                        </div>
                        <input
                          type="text"
                          value={newChapterTitle}
                          onChange={(e) => setNewChapterTitle(e.target.value)}
                          placeholder="Chapter title..."
                          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 outline-none focus:border-teal-500 dark:border-stone-700 dark:bg-stone-800"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateChapter();
                            if (e.key === 'Escape') {
                              setIsCreatingChapter(false);
                              setNewChapterTitle('');
                            }
                          }}
                        />
                        <button
                          onClick={handleCreateChapter}
                          disabled={!newChapterTitle.trim()}
                          className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setIsCreatingChapter(false);
                            setNewChapterTitle('');
                          }}
                          className="rounded p-2 text-stone-400 hover:bg-stone-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Progress */}
            <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400">Progress</h3>
              <div className="mt-4">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-stone-900 dark:text-white">
                    {totalWords.toLocaleString()}
                  </span>
                  <span className="text-sm text-stone-500">/ {targetWords.toLocaleString()} words</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-stone-500">{progressPercent}% complete</p>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400">Book Stats</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <FileText className="h-4 w-4" /> Chapters
                  </span>
                  <span className="font-medium text-stone-900 dark:text-white">
                    {book.chapters.length} / {book.targetChapters}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <Check className="h-4 w-4" /> Completed
                  </span>
                  <span className="font-medium text-stone-900 dark:text-white">
                    {completedChapters} chapters
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <TrendingUp className="h-4 w-4" /> Avg Length
                  </span>
                  <span className="font-medium text-stone-900 dark:text-white">
                    {book.chapters.length > 0 
                      ? Math.round(totalWords / book.chapters.length).toLocaleString() 
                      : 0} words
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400">Quick Actions</h3>
              <div className="mt-4 space-y-2">
                <Link
                  href={`/ai-studio?bookId=${book.id}`}
                  className="flex w-full items-center gap-3 rounded-lg border border-stone-200 px-4 py-3 text-left hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:hover:border-stone-600"
                >
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-stone-900 dark:text-white">AI Studio</p>
                    <p className="text-xs text-stone-500">Generate and enhance content</p>
                  </div>
                </Link>
                <button className="flex w-full items-center gap-3 rounded-lg border border-stone-200 px-4 py-3 text-left hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:hover:border-stone-600">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-stone-900 dark:text-white">Beta Readers</p>
                    <p className="text-xs text-stone-500">Share with readers</p>
                  </div>
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg border border-stone-200 px-4 py-3 text-left hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:hover:border-stone-600">
                  <Download className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-medium text-stone-900 dark:text-white">Export</p>
                    <p className="text-xs text-stone-500">Download as EPUB, PDF, DOCX</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
