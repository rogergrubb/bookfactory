'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen, PenTool, BarChart3, Clock, Target,
  Sparkles, Plus, FileText,
  Flame, DollarSign, ChevronRight, ArrowRight
} from 'lucide-react';
import { cn, formatWordCount } from '@/lib/utils';

const mockStats = {
  totalBooks: 4,
  totalWords: 287500,
  writingStreak: 12,
  monthlyRevenue: 2847.50,
  todayWords: 1250,
  dailyGoal: 1000,
};

const mockRecentBooks = [
  { id: '1', title: 'The Last Horizon', genre: 'Sci-Fi', progress: 78, wordCount: 95000, targetWordCount: 120000, status: 'writing', updatedAt: '2 hours ago' },
  { id: '2', title: 'Midnight Secrets', genre: 'Mystery', progress: 45, wordCount: 32000, targetWordCount: 70000, status: 'writing', updatedAt: 'Yesterday' },
  { id: '3', title: 'Love in Paris', genre: 'Romance', progress: 100, wordCount: 65000, targetWordCount: 65000, status: 'published', updatedAt: '3 days ago' },
];

const mockActivity = [
  { type: 'writing', message: 'Wrote 1,250 words in Chapter 12', time: '2 hours ago', book: 'The Last Horizon' },
  { type: 'feedback', message: 'Sarah left feedback on Chapter 8', time: '5 hours ago', book: 'The Last Horizon' },
  { type: 'sale', message: '3 copies sold on Amazon', time: 'Yesterday', book: 'Love in Paris' },
  { type: 'milestone', message: 'Reached 50% completion!', time: 'Yesterday', book: 'Midnight Secrets' },
];

const quickActions = [
  { label: 'New Book', icon: Plus, href: '/books/new', color: 'from-violet-500 to-indigo-600' },
  { label: 'Continue Writing', icon: PenTool, href: '/write/1', color: 'from-emerald-500 to-teal-600' },
  { label: 'AI Assistant', icon: Sparkles, href: '/books?ai=true', color: 'from-amber-500 to-orange-600' },
  { label: 'View Analytics', icon: BarChart3, href: '/analytics', color: 'from-blue-500 to-cyan-600' },
];

export default function DashboardClient() {
  const progress = (mockStats.todayWords / mockStats.dailyGoal) * 100;
  const goalMet = mockStats.todayWords >= mockStats.dailyGoal;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, Author!</h1>
          <p className="mt-1 text-slate-500">Here&apos;s what&apos;s happening with your books today.</p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/50"><BookOpen className="h-6 w-6 text-violet-600" /></div>
              <span className="text-sm text-emerald-600">+1 this month</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{mockStats.totalBooks}</p>
            <p className="text-sm text-slate-500">Total Books</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/50"><FileText className="h-6 w-6 text-emerald-600" /></div>
              <span className="text-sm text-emerald-600">+12.5k this week</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{formatWordCount(mockStats.totalWords)}</p>
            <p className="text-sm text-slate-500">Total Words</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-orange-100 p-3 dark:bg-orange-900/50"><Flame className="h-6 w-6 text-orange-600" /></div>
              <span className="text-sm text-orange-600">🔥 On fire!</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{mockStats.writingStreak}</p>
            <p className="text-sm text-slate-500">Day Streak</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/50"><DollarSign className="h-6 w-6 text-blue-600" /></div>
              <span className="text-sm text-emerald-600">+18% vs last month</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">${mockStats.monthlyRevenue.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Monthly Revenue</p>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Today&apos;s Progress</h2>
                <span className={cn('rounded-full px-3 py-1 text-sm font-medium', goalMet ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                  {goalMet ? '🎉 Goal Met!' : `${mockStats.dailyGoal - mockStats.todayWords} words to go`}
                </span>
              </div>
              <div className="mb-2 flex items-end justify-between">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{mockStats.todayWords.toLocaleString()}</span>
                <span className="text-slate-500">/ {mockStats.dailyGoal.toLocaleString()} words</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, progress)}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={cn('h-full rounded-full', goalMet ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-violet-500 to-indigo-600')} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Link href="/write/1" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl">
                  <PenTool className="h-4 w-4" /> Continue Writing
                </Link>
                <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600"><Target className="h-4 w-4" /> Adjust goal</button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Books</h2>
                <Link href="/books" className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700">View all <ChevronRight className="h-4 w-4" /></Link>
              </div>
              <div className="space-y-4">
                {mockRecentBooks.map((book) => (
                  <Link key={book.id} href={`/write/${book.id}`} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition-all hover:border-violet-200 hover:bg-violet-50/50 dark:border-slate-800 dark:hover:border-violet-800 dark:hover:bg-violet-950/20">
                    <div className="flex h-14 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">{book.title.charAt(0)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900 dark:text-white">{book.title}</h3>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', book.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700')}>{book.status}</span>
                      </div>
                      <p className="text-sm text-slate-500">{book.genre} • {formatWordCount(book.wordCount)}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full bg-violet-500" style={{ width: `${book.progress}%` }} /></div>
                        <span className="text-xs text-slate-500">{book.progress}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{book.updatedAt}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href} className={cn('flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br p-4 text-white transition-transform hover:scale-105', action.color)}>
                    <action.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
              <div className="space-y-4">
                {mockActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className={cn('mt-1 h-2 w-2 rounded-full', activity.type === 'writing' && 'bg-violet-500', activity.type === 'feedback' && 'bg-blue-500', activity.type === 'sale' && 'bg-emerald-500', activity.type === 'milestone' && 'bg-amber-500')} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{activity.message}</p>
                      <p className="text-xs text-slate-400">{activity.book} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 p-6 text-white">
              <div className="mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5" /><span className="font-medium">Daily Writing Tip</span></div>
              <p className="text-sm text-white/90">&quot;The first draft is just you telling yourself the story.&quot; — Terry Pratchett</p>
              <button className="mt-4 flex items-center gap-1 text-sm text-white/80 hover:text-white">Get more tips <ArrowRight className="h-4 w-4" /></button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
