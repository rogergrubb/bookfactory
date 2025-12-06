
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Grid, List, BookOpen, MoreHorizontal,
  Edit, Trash2, Copy, Download, Eye, Clock, TrendingUp, FileText,
  ChevronDown, X, Sparkles, FolderOpen, Tag, Calendar
} from 'lucide-react';
import { cn, formatWordCount, formatRelativeTime } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { useBooks, Book } from '@/hooks/useBooks';

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  WRITING: { label: 'Writing', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400' },
  EDITING: { label: 'Editing', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' },
  PUBLISHED: { label: 'Published', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' },
};

const genres = ['All Genres', 'Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Thriller', 'Literary Fiction', 'Non-Fiction'];
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
  const [genreFilter, setGenreFilter] = useState('All Genres');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { books, isLoading, deleteBook, refresh } = useBooks({ 
    search: searchQuery,
    status: statusFilter !== 'all' ? statusFilter : undefined 
  });

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (genreFilter !== 'All Genres') {
      result = result.filter(book => book.genre === genreFilter);
    }

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
  }, [books, genreFilter, sortBy]);

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

  const toggleSelectBook = (bookId: string) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="text-slate-500">Loading your books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Books</h1>
            <p className="mt-1 text-slate-500">Manage and organize your writing projects</p>
          </div>
          <Link
            href="/books/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30"
          >
            <Plus className="h-5 w-5" /> New Book
          </Link>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Books', value: stats.total, icon: BookOpen, color: 'bg-violet-100 text-violet-600' },
            { label: 'In Progress', value: stats.writing, icon: Edit, color: 'bg-amber-100 text-amber-600' },
            { label: 'Published', value: stats.published, icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Total Words', value: formatWordCount(stats.totalWords), icon: FileText, color: 'bg-blue-100 text-blue-600' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className={cn('rounded-lg p-2', stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                showFilters
                  ? 'border-violet-500 bg-violet-50 text-violet-600 dark:bg-violet-950'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
              )}
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('rounded-l-xl p-2.5', viewMode === 'grid' ? 'bg-violet-100 text-violet-600' : 'text-slate-400')}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('rounded-r-xl p-2.5', viewMode === 'list' ? 'bg-violet-100 text-violet-600' : 'text-slate-400')}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap gap-4 p-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="all">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="WRITING">Writing</option>
                    <option value="EDITING">Editing</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Genre</label>
                  <select
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Books Grid/List */}
        {filteredBooks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
              {searchQuery || statusFilter !== 'all' ? 'No books found' : 'No books yet'}
            </h3>
            <p className="mb-6 text-slate-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters or search query'
                : 'Create your first book to get started'}
            </p>
            <Link
              href="/books/new"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-medium text-white"
            >
              <Plus className="h-5 w-5" /> Create Your First Book
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Cover */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-violet-500 to-indigo-600">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-6xl font-bold text-white/30">{book.title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white">{book.title}</h3>
                    <p className="text-sm text-white/80">{book.genre}</p>
                  </div>
                  {/* Quick Actions */}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      href={`/write/${book.id}`}
                      className="rounded-lg bg-white/90 p-2 text-slate-700 hover:bg-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button className="rounded-lg bg-white/90 p-2 text-slate-700 hover:bg-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusConfig[book.status].color)}>
                      {statusConfig[book.status].label}
                    </span>
                    <span className="text-xs text-slate-500">{formatRelativeTime(new Date(book.updatedAt))}</span>
                  </div>
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {Math.round((book.wordCount / book.targetWordCount) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-600"
                        style={{ width: `${Math.min(100, (book.wordCount / book.targetWordCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{formatWordCount(book.wordCount)} words</span>
                    <span>{book.chapters?.length || 0} chapters</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                layout
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-violet-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xl font-bold text-white">
                  {book.title.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{book.title}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusConfig[book.status].color)}>
                      {statusConfig[book.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{book.genre} • {formatWordCount(book.wordCount)} • {book.chapters?.length || 0} chapters</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Updated {formatRelativeTime(new Date(book.updatedAt))}</p>
                  <div className="mt-2 flex justify-end gap-1">
                    <Link href={`/write/${book.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(book.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-slate-900"
              >
                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Delete Book?</h3>
                <p className="mb-6 text-slate-500">This action cannot be undone. All chapters and content will be permanently deleted.</p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
