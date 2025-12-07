'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Filter, Grid, List, BookOpen, MoreHorizontal,
  Edit, Trash2, Clock, FileText, ChevronDown, X
} from 'lucide-react';
import { cn, formatWordCount, formatRelativeTime } from '@/lib/utils';
import { useBooks, Book } from '@/hooks/useBooks';

type BookStatus = 'DRAFT' | 'WRITING' | 'EDITING' | 'PUBLISHED';

const statusConfig: Record<BookStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400' },
  WRITING: { label: 'Writing', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' },
  EDITING: { label: 'Editing', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' },
  PUBLISHED: { label: 'Published', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
};

const sortOptions = [
  { value: 'updatedAt', label: 'Last Modified' },
  { value: 'title', label: 'Title' },
  { value: 'wordCount', label: 'Word Count' },
  { value: 'createdAt', label: 'Date Created' },
];

export default function BooksPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { books, isLoading, deleteBook } = useBooks({ 
    search: searchQuery,
    status: statusFilter !== 'all' ? statusFilter : undefined 
  });

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'wordCount':
          return b.wordCount - a.wordCount;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [books, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: books.length,
    writing: books.filter(b => b.status === 'WRITING').length,
    published: books.filter(b => b.status === 'PUBLISHED').length,
    totalWords: books.reduce((sum, b) => sum + b.wordCount, 0),
  }), [books]);

  const handleDelete = async (bookId: string) => {
    await deleteBook(bookId);
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />
          <p className="text-sm text-stone-500">Loading your books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-stone-900 dark:text-white">My Books</h1>
            <p className="mt-0.5 text-sm text-stone-500">
              {stats.total} {stats.total === 1 ? 'book' : 'books'} · {formatWordCount(stats.totalWords)} total words
            </p>
          </div>
          <Link
            href="/books/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
          >
            <Plus className="h-4 w-4" /> New Book
          </Link>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Books', value: stats.total, icon: BookOpen },
            { label: 'In Progress', value: stats.writing, icon: Edit },
            { label: 'Published', value: stats.published, icon: FileText },
            { label: 'Total Words', value: formatWordCount(stats.totalWords), icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-stone-100 p-2 dark:bg-stone-800">
                  <stat.icon className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-stone-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-stone-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-300 focus:ring-2 focus:ring-stone-900/5 dark:border-stone-700 dark:bg-stone-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition',
                showFilters
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400'
              )}
            >
              <Filter className="h-4 w-4" /> Filter
            </button>
            <div className="flex rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-l-lg p-2 transition',
                  viewMode === 'grid' ? 'bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-white' : 'text-stone-400 hover:text-stone-600'
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-r-lg p-2 transition',
                  viewMode === 'list' ? 'bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-white' : 'text-stone-400 hover:text-stone-600'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm outline-none dark:border-stone-700 dark:bg-stone-800"
              >
                <option value="all">All</option>
                <option value="DRAFT">Draft</option>
                <option value="WRITING">Writing</option>
                <option value="EDITING">Editing</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm outline-none dark:border-stone-700 dark:bg-stone-800"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => { setStatusFilter('all'); setSortBy('updatedAt'); }}
              className="ml-auto text-sm text-stone-500 hover:text-stone-700"
            >
              Reset
            </button>
          </div>
        )}

        {/* Books Grid/List */}
        {filteredBooks.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center dark:border-stone-800">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-stone-300 dark:text-stone-600" />
            <h3 className="mb-1 font-medium text-stone-900 dark:text-white">
              {searchQuery || statusFilter !== 'all' ? 'No books found' : 'No books yet'}
            </h3>
            <p className="mb-5 text-sm text-stone-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Create your first book to get started'}
            </p>
            <Link
              href="/books/new"
              className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
            >
              <Plus className="h-4 w-4" /> Create Book
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
              >
                {/* Cover */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-stone-200 to-stone-100 dark:from-stone-800 dark:to-stone-900">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-5xl font-bold text-stone-300 dark:text-stone-700">{book.title.charAt(0)}</span>
                    </div>
                  )}
                  {/* Quick Actions */}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      href={`/write/${book.id}`}
                      className="rounded-md bg-white/95 p-1.5 text-stone-700 shadow-sm transition hover:bg-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button 
                      onClick={() => setMenuOpen(menuOpen === book.id ? null : book.id)}
                      className="rounded-md bg-white/95 p-1.5 text-stone-700 shadow-sm transition hover:bg-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Dropdown menu */}
                  {menuOpen === book.id && (
                    <div className="absolute right-2 top-12 z-10 w-36 rounded-lg border border-stone-200 bg-white py-1 shadow-lg dark:border-stone-700 dark:bg-stone-800">
                      <button
                        onClick={() => { setDeleteConfirm(book.id); setMenuOpen(null); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-medium text-stone-900 dark:text-white line-clamp-1">{book.title}</h3>
                    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', statusConfig[book.status as BookStatus]?.color || statusConfig.DRAFT.color)}>
                      {statusConfig[book.status as BookStatus]?.label || 'Draft'}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-stone-500">{book.genre || 'No genre'}</p>
                  {/* Progress */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">{formatWordCount(book.wordCount)}</span>
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        {Math.round((book.wordCount / (book.targetWordCount || 50000)) * 100)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                      <div
                        className="h-full bg-stone-900 transition-all dark:bg-white"
                        style={{ width: `${Math.min(100, (book.wordCount / (book.targetWordCount || 50000)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-stone-400">Updated {formatRelativeTime(new Date(book.updatedAt))}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-4 transition hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="flex h-12 w-9 items-center justify-center rounded-md bg-stone-100 text-lg font-semibold text-stone-400 dark:bg-stone-800">
                  {book.title.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-stone-900 dark:text-white">{book.title}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusConfig[book.status as BookStatus]?.color || statusConfig.DRAFT.color)}>
                      {statusConfig[book.status as BookStatus]?.label || 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500">
                    {book.genre || 'No genre'} · {formatWordCount(book.wordCount)} · {book.chapters?.length || 0} chapters
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-stone-400 sm:block">
                    {formatRelativeTime(new Date(book.updatedAt))}
                  </span>
                  <Link 
                    href={`/write/${book.id}`} 
                    className="rounded-md p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(book.id)}
                    className="rounded-md p-2 text-stone-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Modal */}
        {deleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-stone-900"
            >
              <h3 className="mb-2 text-lg font-semibold text-stone-900 dark:text-white">Delete this book?</h3>
              <p className="mb-6 text-sm text-stone-500">
                This action cannot be undone. All chapters and content will be permanently deleted.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
