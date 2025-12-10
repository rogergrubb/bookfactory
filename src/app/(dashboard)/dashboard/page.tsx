'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  BookOpen, Flame, Target, TrendingUp, Plus, ArrowRight,
  Sparkles, Clock, Edit, FileText, Zap, Award, Calendar,
  PenTool, BarChart3, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBooks, Book } from '@/hooks/useBooks';

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Stats interface
interface DashboardStats {
  totalBooks: number;
  totalWords: number;
  wordsToday: number;
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface Activity {
  id: string;
  type: 'words' | 'chapter' | 'ai' | 'export';
  message: string;
  createdAt: string;
}

// Helper functions
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Quick actions configuration
const quickActions = [
  { label: 'Continue Writing', href: '/write', icon: PenTool, primary: true },
  { label: 'New Book', href: '/books/new', icon: Plus },
  { label: 'AI Studio', href: '/ai-studio', icon: Sparkles },
  { label: 'View Analytics', href: '/analytics', icon: BarChart3 },
];

// Loading skeleton component
function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-stone-200 dark:bg-stone-700 rounded" />
          <div className="h-8 w-16 bg-stone-200 dark:bg-stone-700 rounded" />
          <div className="h-3 w-24 bg-stone-200 dark:bg-stone-700 rounded" />
        </div>
        <div className="h-10 w-10 bg-stone-200 dark:bg-stone-700 rounded-full" />
      </div>
    </div>
  );
}

function BookCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="h-12 w-10 bg-stone-200 dark:bg-stone-700 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-stone-200 dark:bg-stone-700 rounded" />
        <div className="h-2 w-24 bg-stone-200 dark:bg-stone-700 rounded" />
      </div>
    </div>
  );
}

// Empty state component
function EmptyBooksState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-stone-100 p-4 dark:bg-stone-800">
        <BookOpen className="h-8 w-8 text-stone-400" />
      </div>
      <h3 className="mt-4 font-medium text-stone-900 dark:text-white">No books yet</h3>
      <p className="mt-1 text-sm text-stone-500">Start your writing journey by creating your first book.</p>
      <Link 
        href="/books/new"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
      >
        <Plus className="h-4 w-4" />
        Create Your First Book
      </Link>
    </div>
  );
}

export default function DashboardHome() {
  // Fetch books
  const { data: booksData, isLoading: booksLoading, error: booksError } = useBooks();
  
  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useSWR<{ stats: DashboardStats }>(
    '/api/dashboard',
    fetcher,
    { 
      revalidateOnFocus: false,
      fallbackData: { 
        stats: {
          totalBooks: 0,
          totalWords: 0,
          wordsToday: 0,
          currentStreak: 0,
          longestStreak: 0,
          weeklyGoal: 7000,
          weeklyProgress: 0,
        }
      }
    }
  );
  
  // Fetch recent activity
  const { data: activityData, isLoading: activityLoading } = useSWR<{ activities: Activity[] }>(
    '/api/activities?limit=5',
    fetcher,
    { revalidateOnFocus: false }
  );

  const books = booksData?.books ?? [];
  const stats = statsData?.stats ?? {
    totalBooks: books.length,
    totalWords: books.reduce((sum, b) => sum + (b.wordCount || 0), 0),
    wordsToday: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyGoal: 7000,
    weeklyProgress: 0,
  };
  const activities = activityData?.activities ?? [];

  // Calculate derived values
  const progressPercent = stats.weeklyGoal > 0 
    ? Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100) 
    : 0;
  const greeting = getGreeting();

  // Get most recent book for "Continue Writing" action
  const mostRecentBook = useMemo(() => {
    if (!books.length) return null;
    return books.reduce((latest, book) => {
      const latestDate = new Date(latest.updatedAt);
      const bookDate = new Date(book.updatedAt);
      return bookDate > latestDate ? book : latest;
    }, books[0]);
  }, [books]);

  // Dynamic quick actions based on user's books
  const dynamicQuickActions = useMemo(() => {
    return quickActions.map(action => {
      if (action.label === 'Continue Writing' && mostRecentBook) {
        return { ...action, href: `/write/${mostRecentBook.id}` };
      }
      return action;
    });
  }, [mostRecentBook]);

  const isLoading = booksLoading || statsLoading;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-white">
            {greeting}, Author
          </h1>
          <p className="mt-1 text-stone-500">
            {stats.currentStreak > 0 
              ? `You're on a ${stats.currentStreak}-day writing streak! Keep it up.`
              : books.length > 0 
                ? 'Start writing today to begin your streak!'
                : 'Welcome to BookFactory! Create your first book to get started.'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* Writing Streak */}
              <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Writing Streak</p>
                    <p className="mt-1 text-3xl font-bold text-amber-900 dark:text-amber-100">
                      {stats.currentStreak} <span className="text-lg font-normal text-amber-600 dark:text-amber-400">days</span>
                    </p>
                    <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-500">
                      Best: {stats.longestStreak} days
                    </p>
                  </div>
                  <div className="rounded-full bg-amber-100 p-2.5 dark:bg-amber-900/50">
                    <Flame className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>

              {/* Words Today */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-500">Words Today</p>
                    <p className="mt-1 text-3xl font-bold text-stone-900 dark:text-white">
                      {stats.wordsToday.toLocaleString()}
                    </p>
                    {stats.wordsToday > 0 && (
                      <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Great progress!
                      </p>
                    )}
                  </div>
                  <div className="rounded-full bg-stone-100 p-2.5 dark:bg-stone-800">
                    <Edit className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                  </div>
                </div>
              </div>

              {/* Total Words */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-500">Total Words</p>
                    <p className="mt-1 text-3xl font-bold text-stone-900 dark:text-white">
                      {stats.totalWords >= 1000 
                        ? `${(stats.totalWords / 1000).toFixed(1)}k`
                        : stats.totalWords.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                      Across {stats.totalBooks} {stats.totalBooks === 1 ? 'book' : 'books'}
                    </p>
                  </div>
                  <div className="rounded-full bg-stone-100 p-2.5 dark:bg-stone-800">
                    <FileText className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                  </div>
                </div>
              </div>

              {/* Weekly Goal */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-500">Weekly Goal</p>
                    <p className="mt-1 text-3xl font-bold text-stone-900 dark:text-white">
                      {progressPercent}%
                    </p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          progressPercent >= 100 ? "bg-emerald-500" : "bg-stone-900 dark:bg-white"
                        )}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-full bg-stone-100 p-2.5 dark:bg-stone-800">
                    <Target className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {dynamicQuickActions.map((action) => (
              <Link 
                key={action.label}
                href={action.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition",
                  action.primary 
                    ? "bg-stone-900 text-white hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
                    : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-800 dark:hover:bg-stone-800"
                )}
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Books & Tips */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recent Books */}
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-stone-800">
                <h2 className="text-sm font-semibold text-stone-900 dark:text-white">Your Books</h2>
                <Link href="/books" className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              
              {booksLoading ? (
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  <BookCardSkeleton />
                  <BookCardSkeleton />
                  <BookCardSkeleton />
                </div>
              ) : books.length === 0 ? (
                <EmptyBooksState />
              ) : (
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {books.slice(0, 5).map((book) => {
                    const progress = book.targetWordCount > 0 
                      ? Math.round((book.wordCount / book.targetWordCount) * 100) 
                      : 0;
                    return (
                      <Link 
                        key={book.id} 
                        href={`/write/${book.id}`}
                        className="flex items-center gap-4 p-4 transition hover:bg-stone-50 dark:hover:bg-stone-800/50"
                      >
                        <div className="flex h-12 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-stone-200 to-stone-100 text-lg font-bold text-stone-400 dark:from-stone-700 dark:to-stone-800 dark:text-stone-500">
                          {book.title.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-stone-900 dark:text-white truncate">{book.title}</h3>
                            <span className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                              book.status === 'WRITING' && "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                              book.status === 'EDITING' && "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
                              book.status === 'DRAFT' && "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
                              book.status === 'PUBLISHED' && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            )}>
                              {book.status.charAt(0) + book.status.slice(1).toLowerCase()}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3">
                            <div className="flex-1">
                              <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                                <div 
                                  className="h-full bg-stone-400 dark:bg-stone-500" 
                                  style={{ width: `${Math.min(progress, 100)}%` }} 
                                />
                              </div>
                            </div>
                            <span className="text-xs text-stone-400">
                              {book.wordCount.toLocaleString()} / {book.targetWordCount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <span className="hidden text-xs text-stone-400 sm:block">
                          {formatRelativeTime(book.updatedAt)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Writing Tips */}
            <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-amber-50 to-orange-50 p-5 dark:border-amber-900/50 dark:from-amber-950/20 dark:to-orange-950/20">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/50">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">AI Writing Tip</h3>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    Try describing your scene&apos;s atmosphere before the action. This helps readers feel immersed in your world.
                  </p>
                  <Link 
                    href="/ai-studio"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                  >
                    Open AI Studio <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
              <div className="border-b border-stone-100 px-5 py-4 dark:border-stone-800">
                <h2 className="text-sm font-semibold text-stone-900 dark:text-white">Recent Activity</h2>
              </div>
              {activityLoading ? (
                <div className="p-4">
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-6 w-6 bg-stone-200 dark:bg-stone-700 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 w-full bg-stone-200 dark:bg-stone-700 rounded" />
                          <div className="h-2 w-16 bg-stone-200 dark:bg-stone-700 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activities.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <Clock className="mx-auto h-6 w-6 text-stone-300" />
                  <p className="mt-2 text-sm text-stone-500">No recent activity</p>
                  <p className="text-xs text-stone-400">Start writing to see your progress here</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 px-5 py-3">
                      <div className={cn(
                        "mt-0.5 rounded-full p-1.5",
                        activity.type === 'words' && "bg-emerald-100 dark:bg-emerald-900/30",
                        activity.type === 'chapter' && "bg-blue-100 dark:bg-blue-900/30",
                        activity.type === 'ai' && "bg-amber-100 dark:bg-amber-900/30",
                        activity.type === 'export' && "bg-purple-100 dark:bg-purple-900/30"
                      )}>
                        {activity.type === 'words' && <Edit className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />}
                        {activity.type === 'chapter' && <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
                        {activity.type === 'ai' && <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />}
                        {activity.type === 'export' && <Zap className="h-3 w-3 text-purple-600 dark:text-purple-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-700 dark:text-stone-300">{activity.message}</p>
                        <p className="mt-0.5 text-xs text-stone-400">{formatRelativeTime(activity.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Writing Calendar Preview */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-stone-900 dark:text-white">This Week</h2>
                <Link href="/analytics" className="text-xs font-medium text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">
                  Details
                </Link>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const today = new Date().getDay();
                  const isToday = (i + 1) % 7 === today;
                  const isPast = i < ((today + 6) % 7);
                  
                  return (
                    <div key={i} className="text-center">
                      <span className="text-[10px] font-medium text-stone-400">{day}</span>
                      <div className={cn(
                        "mt-1 aspect-square rounded-md flex items-center justify-center",
                        isToday 
                          ? "ring-2 ring-stone-900 dark:ring-white bg-stone-100 dark:bg-stone-800"
                          : isPast 
                            ? "bg-stone-100 dark:bg-stone-800"
                            : "bg-stone-50 dark:bg-stone-900"
                      )}>
                        {isPast && stats.currentStreak > 0 && <span className="text-[10px] font-bold text-emerald-500">✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-xs text-stone-500">
                {stats.currentStreak > 0 ? (
                  <>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {Math.min(stats.currentStreak, 7)} of 7 days
                    </span>{' '}
                    completed
                  </>
                ) : (
                  'Write today to start your streak!'
                )}
              </p>
            </div>

            {/* Achievements */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
              <h2 className="mb-4 text-sm font-semibold text-stone-900 dark:text-white">Achievements</h2>
              <div className="space-y-3">
                {stats.currentStreak >= 7 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <Award className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900 dark:text-white">Week Warrior</p>
                      <p className="text-xs text-stone-500">7-day writing streak</p>
                    </div>
                  </div>
                )}
                {stats.totalWords >= 25000 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900 dark:text-white">Prolific Writer</p>
                      <p className="text-xs text-stone-500">25,000 words written</p>
                    </div>
                  </div>
                )}
                {stats.totalBooks >= 1 && stats.currentStreak < 7 && stats.totalWords < 25000 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <PenTool className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900 dark:text-white">First Steps</p>
                      <p className="text-xs text-stone-500">Created your first book</p>
                    </div>
                  </div>
                )}
                {stats.totalBooks === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-stone-500">Start writing to unlock achievements!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
