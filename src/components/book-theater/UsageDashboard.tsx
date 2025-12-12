'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Zap, Calendar,
  BookOpen, PenTool, Sparkles, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageStats {
  today: { words: number; generations: number };
  week: { words: number; generations: number };
  month: { words: number; generations: number };
  topTools: Array<{ toolId: string; toolName: string; count: number; words: number }>;
  streak: number;
  totalWords: number;
}

interface UsageDashboardProps {
  className?: string;
}

export function UsageDashboard({ className }: UsageDashboardProps) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/usage-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('p-6 space-y-4', className)}>
        <div className="h-24 bg-stone-800 rounded-xl animate-pulse" />
        <div className="h-32 bg-stone-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={cn('p-6 text-center text-stone-500', className)}>
        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No usage data yet</p>
        <p className="text-xs mt-1">Start writing to track your progress!</p>
      </div>
    );
  }

  const periodData = stats[period];
  const periodLabels = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month'
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Period Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-400" />
          Your Writing Activity
        </h3>
        <div className="flex items-center gap-1 bg-stone-800 rounded-lg p-1">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-md transition-colors',
                period === p 
                  ? 'bg-teal-500/20 text-teal-400' 
                  : 'text-stone-400 hover:text-stone-200'
              )}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400/80 uppercase tracking-wide">Words Generated</span>
          </div>
          <p className="text-3xl font-bold text-stone-100">
            {periodData.words.toLocaleString()}
          </p>
          <p className="text-xs text-stone-500 mt-1">{periodLabels[period]}</p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-400/80 uppercase tracking-wide">AI Assists</span>
          </div>
          <p className="text-3xl font-bold text-stone-100">
            {periodData.generations}
          </p>
          <p className="text-xs text-stone-500 mt-1">{periodLabels[period]}</p>
        </div>
      </div>

      {/* Writing Streak */}
      {stats.streak > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-200">
              {stats.streak} Day Streak! 🔥
            </p>
            <p className="text-xs text-stone-500">
              Keep writing daily to maintain your streak
            </p>
          </div>
        </div>
      )}

      {/* Top Tools */}
      {stats.topTools.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-stone-300 flex items-center gap-2">
            <PenTool className="w-4 h-4 text-stone-500" />
            Most Used Tools
          </h4>
          <div className="space-y-2">
            {stats.topTools.slice(0, 5).map((tool, idx) => (
              <div 
                key={tool.toolId}
                className="flex items-center gap-3 p-2 rounded-lg bg-stone-800/50"
              >
                <span className="text-xs font-mono text-stone-600 w-4">
                  {idx + 1}.
                </span>
                <span className="flex-1 text-sm text-stone-300">
                  {tool.toolName}
                </span>
                <span className="text-xs text-stone-500">
                  {tool.count} uses
                </span>
                <span className="text-xs text-stone-600">•</span>
                <span className="text-xs text-emerald-400/70">
                  {tool.words.toLocaleString()} words
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Lifetime Stats */}
      <div className="pt-4 border-t border-stone-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">Total Words Generated</span>
          <span className="font-semibold text-stone-300">
            {stats.totalWords.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// Compact badge for header/sidebar
export function UsageBadge({ className }: { className?: string }) {
  const [todayWords, setTodayWords] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/user/usage-stats')
      .then(res => res.ok ? res.json() : null)
      .then(data => setTodayWords(data?.today?.words || 0))
      .catch(() => setTodayWords(null));
  }, []);

  if (todayWords === null) return null;

  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-xs',
      className
    )}>
      <TrendingUp className="w-3 h-3 text-emerald-400" />
      <span className="text-emerald-400">{todayWords.toLocaleString()}</span>
      <span className="text-stone-500">words today</span>
    </div>
  );
}
