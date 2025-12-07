
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  BookOpen, Plus, GripVertical, Edit, Trash2, Eye, Users, Globe,
  Calendar, DollarSign, TrendingUp, ChevronRight, Settings, Package,
  Link as LinkIcon, FileText, Star, MoreHorizontal, Check, X
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatWordCount } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { EmptyState, ProgressBar } from '@/components/ui/feedback';

interface Series {
  id: string;
  name: string;
  description: string;
  genre: string;
  bookCount: number;
  totalWords: number;
  totalSales: number;
  avgRating: number;
  status: 'ongoing' | 'completed' | 'hiatus';
  createdAt: string;
}

interface SeriesBook {
  id: string;
  title: string;
  order: number;
  status: 'DRAFT' | 'WRITING' | 'EDITING' | 'PUBLISHED';
  wordCount: number;
  publishedAt?: string;
  sales?: number;
}

interface SharedElement {
  id: string;
  type: 'character' | 'location' | 'item' | 'event';
  name: string;
  description: string;
  appearances: string[];
}

const mockSeries: Series[] = [
  { id: '1', name: 'Horizon Chronicles', description: 'An epic space opera following humanity\'s journey across the stars', genre: 'Science Fiction', bookCount: 3, totalWords: 285000, totalSales: 4523, avgRating: 4.6, status: 'ongoing', createdAt: '2023-06-15' },
  { id: '2', name: 'The Darkwood Saga', description: 'Dark fantasy adventures in a world where magic comes at a terrible price', genre: 'Fantasy', bookCount: 2, totalWords: 180000, totalSales: 2891, avgRating: 4.4, status: 'ongoing', createdAt: '2023-09-20' },
];

const mockSeriesBooks: SeriesBook[] = [
  { id: '1', title: 'The Last Horizon', order: 1, status: 'PUBLISHED', wordCount: 95000, publishedAt: '2024-01-15', sales: 2156 },
  { id: '2', title: 'Beyond the Void', order: 2, status: 'PUBLISHED', wordCount: 102000, publishedAt: '2024-06-20', sales: 1834 },
  { id: '3', title: 'Empire of Stars', order: 3, status: 'WRITING', wordCount: 67500 },
];

const mockSharedElements: SharedElement[] = [
  { id: '1', type: 'character', name: 'Captain Elena Vance', description: 'Main protagonist, former military pilot turned explorer', appearances: ['1', '2', '3'] },
  { id: '2', type: 'character', name: 'Dr. Marcus Chen', description: 'Ship\'s scientist and Elena\'s closest confidant', appearances: ['1', '2', '3'] },
  { id: '3', type: 'location', name: 'The Frontier Station', description: 'Massive space station at the edge of known space', appearances: ['1', '2'] },
  { id: '4', type: 'item', name: 'The Compass', description: 'Ancient artifact that points to habitable worlds', appearances: ['1', '2', '3'] },
];

const statusColors = {
  ongoing: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  hiatus: 'bg-amber-100 text-amber-700',
};

const bookStatusColors = {
  DRAFT: 'bg-slate-100 text-slate-700',
  WRITING: 'bg-blue-100 text-blue-700',
  EDITING: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
};

const elementIcons = { character: Users, location: Globe, item: Package, event: Calendar };

export default function SeriesPage() {
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(mockSeries[0]);
  const [activeTab, setActiveTab] = useState<'books' | 'elements' | 'marketing'>('books');
  const [books, setBooks] = useState(mockSeriesBooks);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Series Management</h1>
            <p className="mt-1 text-slate-500">Organize multi-book series and shared elements</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 font-medium text-white shadow-lg">
            <Plus className="h-4 w-4" /> New Series
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Series List */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-white">Your Series</h2>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {mockSeries.map((series) => (
                  <button key={series.id} onClick={() => setSelectedSeries(series)} className={cn(
                    'w-full p-4 text-left transition-colors',
                    selectedSeries?.id === series.id ? 'bg-violet-50 dark:bg-violet-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}>
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-slate-900 dark:text-white">{series.name}</h3>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColors[series.status])}>{series.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{series.bookCount} books • {formatWordCount(series.totalWords)}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Series Detail */}
          <div className="lg:col-span-3">
            {selectedSeries ? (
              <div className="space-y-6">
                {/* Series Header */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedSeries.name}</h2>
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', statusColors[selectedSeries.status])}>{selectedSeries.status}</span>
                      </div>
                      <p className="mt-2 text-slate-500">{selectedSeries.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Tooltip content="Edit series"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Edit className="h-4 w-4" /></button></Tooltip>
                      <Tooltip content="Series settings"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Settings className="h-4 w-4" /></button></Tooltip>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedSeries.bookCount}</p>
                      <p className="text-sm text-slate-500">Books</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatWordCount(selectedSeries.totalWords)}</p>
                      <p className="text-sm text-slate-500">Total Words</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                      <p className="text-2xl font-bold text-emerald-600">{selectedSeries.totalSales.toLocaleString()}</p>
                      <p className="text-sm text-slate-500">Total Sales</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedSeries.avgRating}</p>
                      </div>
                      <p className="text-sm text-slate-500">Avg Rating</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                  {[
                    { id: 'books', label: 'Books', icon: BookOpen },
                    { id: 'elements', label: 'Shared Elements', icon: LinkIcon },
                    { id: 'marketing', label: 'Series Marketing', icon: TrendingUp },
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
                      activeTab === tab.id ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50' : 'text-slate-500 hover:text-slate-700'
                    )}>
                      <tab.icon className="h-4 w-4" /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* Books Tab */}
                {activeTab === 'books' && (
                  <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Books in Series</h3>
                        <button className="inline-flex items-center gap-2 rounded-lg bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-200">
                          <Plus className="h-4 w-4" /> Add Book
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">Drag to reorder books</p>
                    </div>
                    <Reorder.Group axis="y" values={books} onReorder={setBooks} className="divide-y divide-slate-200 dark:divide-slate-800">
                      {books.map((book) => (
                        <Reorder.Item key={book.id} value={book} className="flex items-center gap-4 p-4">
                          <GripVertical className="h-5 w-5 cursor-grab text-slate-400" />
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-lg font-bold text-violet-600">
                            {book.order}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-slate-900 dark:text-white">{book.title}</h4>
                              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', bookStatusColors[book.status])}>{book.status}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                              <span>{formatWordCount(book.wordCount)}</span>
                              {book.publishedAt && <span>Published {new Date(book.publishedAt).toLocaleDateString()}</span>}
                              {book.sales && <span className="text-emerald-600">{book.sales} sales</span>}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Tooltip content="Edit"><Link href={`/write/${book.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Edit className="h-4 w-4" /></Link></Tooltip>
                            <Tooltip content="View"><Link href={`/books/${book.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Eye className="h-4 w-4" /></Link></Tooltip>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                )}

                {/* Shared Elements Tab */}
                {activeTab === 'elements' && (
                  <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">Shared Elements</h3>
                          <p className="text-sm text-slate-500">Characters, locations, and items that appear across books</p>
                        </div>
                        <button className="inline-flex items-center gap-2 rounded-lg bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-700">
                          <Plus className="h-4 w-4" /> Add Element
                        </button>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {mockSharedElements.map((element) => {
                        const Icon = elementIcons[element.type];
                        return (
                          <div key={element.id} className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={cn('rounded-lg p-2', element.type === 'character' ? 'bg-violet-100 text-violet-600' : element.type === 'location' ? 'bg-blue-100 text-blue-600' : element.type === 'item' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600')}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-slate-900 dark:text-white">{element.name}</h4>
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 capitalize dark:bg-slate-800">{element.type}</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">{element.description}</p>
                                <p className="mt-2 text-xs text-slate-400">Appears in {element.appearances.length} book{element.appearances.length > 1 ? 's' : ''}</p>
                              </div>
                              <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Edit className="h-4 w-4" /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Marketing Tab */}
                {activeTab === 'marketing' && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                      <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Create Box Set</h3>
                      <p className="text-sm text-slate-500">Bundle your series into a discounted box set for increased sales.</p>
                      <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white">
                        <Package className="h-4 w-4" /> Create Box Set
                      </button>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                      <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Series Landing Page</h3>
                      <p className="text-sm text-slate-500">Create a dedicated page for your series with reading order, buy links, and more.</p>
                      <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700">
                        <Globe className="h-4 w-4" /> Generate Page
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState icon={<BookOpen className="h-8 w-8 text-stone-400" />} title="No series selected" description="Select a series from the list or create a new one" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
