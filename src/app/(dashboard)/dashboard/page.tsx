'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen, Flame, Target, TrendingUp, Plus, ArrowRight,
  Sparkles, Clock, Edit, FileText, Zap, Award, Calendar,
  PenTool, BarChart3, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with real data
const mockStats = {
  totalBooks: 3,
  totalWords: 47250,
  wordsToday: 1247,
  currentStreak: 7,
  longestStreak: 14,
  weeklyGoal: 7000,
  weeklyProgress: 4850,
};

const mockRecentBooks = [
  { id: '1', title: 'The Last Kingdom', wordCount: 23450, targetWordCount: 80000, status: 'WRITING', updatedAt: new Date(Date.now() - 1000 * 60 * 30) },
  { id: '2', title: 'Midnight Tales', wordCount: 12800, targetWordCount: 50000, status: 'EDITING', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
  { id: '3', title: 'Summer Dreams', wordCount: 11000, targetWordCount: 60000, status: 'DRAFT', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
];

const mockActivity = [
  { type: 'words', message: 'Wrote 1,247 words in The Last Kingdom', time: '30 min ago' },
  { type: 'chapter', message: 'Completed Chapter 12: The Siege', time: '2 hours ago' },
  { type: 'ai', message: 'Generated 3 scene descriptions', time: '3 hours ago' },
  { type: 'export', message: 'Exported Midnight Tales to EPUB', time: 'Yesterday' },
];

const quickActions = [
  { label: 'Continue Writing', href: '/write/1', icon: PenTool, primary: true },
  { label: 'New Book', href: '/books/new', icon: Plus },
  { label: 'AI Assistant', href: '/write/1?ai=true', icon: Sparkles },
  { label: 'View Analytics', href: '/analytics', icon: BarChart3 },
];

function formatRelativeTime(date: Date): string {
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

export default function DashboardHome() {
  const progressPercent = Math.round((mockStats.weeklyProgress / mockStats.weeklyGoal) * 100);
  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-white">
            {greeting}, Author
          </h1>
          <p className="mt-1 text-stone-500">
            {mockStats.currentStreak > 0 
              ? `You're on a ${mockStats.currentStreak}-day writing streak! Keep it up.`
              : 'Start writing today to begin your streak!'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Writing Streak */}
          <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Writing Streak</p>
                <p className="mt-1 text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {mockStats.currentStreak} <span className="text-lg font-normal text-amber-600 dark:text-amber-400">days</span>
                </p>
                <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-500">
                  Best: {mockStats.longestStreak} days
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
                  {mockStats.wordsToday.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +23% vs avg
                </p>
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
                  {(mockStats.totalWords / 1000).toFixed(1)}k
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  Across {mockStats.totalBooks} books
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
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
              <h2 className="mb-4 text-sm font-semibold text-stone-900 dark:text-white">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg p-4 text-center transition",
                      action.primary
                        ? "bg-stone-900 text-white hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
                        : "border border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-stone-600"
                    )}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Books */}
            <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-stone-800">
                <h2 className="text-sm font-semibold text-stone-900 dark:text-white">Recent Books</h2>
                <Link href="/books" className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {mockRecentBooks.map((book) => {
                  const progress = Math.round((book.wordCount / book.targetWordCount) * 100);
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
                            book.status === 'DRAFT' && "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                          )}>
                            {book.status.charAt(0) + book.status.slice(1).toLowerCase()}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          <div className="flex-1">
                            <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                              <div 
                                className="h-full bg-stone-400 dark:bg-stone-500" 
                                style={{ width: `${progress}%` }} 
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
                  <button className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300">
                    Get more tips <ArrowRight className="h-3 w-3" />
                  </button>
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
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {mockActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3">
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
                      <p className="mt-0.5 text-xs text-stone-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="text-center">
                    <span className="text-[10px] font-medium text-stone-400">{day}</span>
                    <div className={cn(
                      "mt-1 aspect-square rounded-md flex items-center justify-center",
                      i < 5 ? "bg-emerald-500 text-white" : i === 5 ? "bg-emerald-200 dark:bg-emerald-900/50" : "bg-stone-100 dark:bg-stone-800"
                    )}>
                      {i < 5 && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-stone-500">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">5 of 7 days</span> completed
              </p>
            </div>

            {/* Achievements */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
              <h2 className="mb-4 text-sm font-semibold text-stone-900 dark:text-white">Recent Achievements</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900 dark:text-white">Week Warrior</p>
                    <p className="text-xs text-stone-500">7-day writing streak</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
                    <BookOpen className="h-5 w-5 text-stone-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900 dark:text-white">Prolific Writer</p>
                    <p className="text-xs text-stone-500">25,000 words written</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
