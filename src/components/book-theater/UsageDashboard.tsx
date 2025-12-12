'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Coins, Calendar, ChevronDown, 
  Zap, Clock, FileText, Sparkles, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageStats {
  today: { tokens: number; cost: number; generations: number };
  week: { tokens: number; cost: number; generations: number };
  month: { tokens: number; cost: number; generations: number };
  topTools: { toolId: string; count: number; tokens: number }[];
  recentActivity: {
    id: string;
    toolId: string;
    tokens: number;
    cost: number;
    timestamp: Date;
  }[];
}

interface UsageDashboardProps {
  userId?: string;
  className?: string;
}

export function UsageDashboard({ userId, className }: UsageDashboardProps) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    fetchUsageStats();
  }, [userId]);

  const fetchUsageStats = async () => {
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

  const formatCost = (cost: number) => {
    if (cost < 0.01) return '<$0.01';
    if (cost < 1) return `$${cost.toFixed(2)}`;
    return `$${cost.toFixed(2)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens < 1000) return tokens.toString();
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
    return `${(tokens / 1000000).toFixed(2)}M`;
  };

  const toolNames: Record<string, string> = {
    'continue': 'Continue Writing',
    'firstdraft': 'First Draft',
    'dialogue': 'Write Dialogue',
    'expand': 'Expand',
    'rewrite': 'Rewrite',
    'pacing': 'Pacing Analysis',
    'plot-ideas': 'Plot Ideas',
  };

  if (loading) {
    return (
      <div className={cn('p-4 animate-pulse', className)}>
        <div className="h-8 bg-stone-800 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-stone-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Demo/fallback stats if no data
  const currentStats = stats?.[period] || { tokens: 0, cost: 0, generations: 0 };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-400" />
          AI Usage
        </h3>
        
        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-stone-800 rounded-lg p-1">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                period === p 
                  ? 'bg-teal-500 text-white' 
                  : 'text-stone-400 hover:text-stone-200'
              )}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-stone-400">Tokens Used</span>
          </div>
          <div className="text-2xl font-bold text-stone-100">
            {formatTokens(currentStats.tokens)}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            ≈ {formatCost(currentStats.cost)} spent
          </div>
        </div>

        <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-stone-400">Generations</span>
          </div>
          <div className="text-2xl font-bold text-stone-100">
            {currentStats.generations}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            {currentStats.generations > 0 
              ? `~${Math.round(currentStats.tokens / currentStats.generations)} tokens/gen`
              : 'No generations yet'}
          </div>
        </div>

        <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-stone-400">Avg. Cost</span>
          </div>
          <div className="text-2xl font-bold text-stone-100">
            {currentStats.generations > 0 
              ? formatCost(currentStats.cost / currentStats.generations)
              : '$0.00'}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            per generation
          </div>
        </div>
      </div>

      {/* Top Tools */}
      {stats?.topTools && stats.topTools.length > 0 && (
        <div className="bg-stone-800/30 border border-stone-700/30 rounded-xl p-4">
          <h4 className="text-sm font-medium text-stone-300 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Most Used Tools
          </h4>
          <div className="space-y-2">
            {stats.topTools.slice(0, 5).map((tool, idx) => (
              <div key={tool.toolId} className="flex items-center gap-3">
                <span className="text-xs text-stone-500 w-4">{idx + 1}.</span>
                <span className="flex-1 text-sm text-stone-300">
                  {toolNames[tool.toolId] || tool.toolId}
                </span>
                <span className="text-xs text-stone-500">{tool.count} uses</span>
                <span className="text-xs text-stone-400 font-mono">
                  {formatTokens(tool.tokens)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Warning */}
      {currentStats.cost > 5 && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">High usage detected</p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              You&apos;ve used {formatCost(currentStats.cost)} this {period}. 
              Consider using shorter outputs or the condense tool.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for sidebar/header
export function UsageBadge({ className }: { className?: string }) {
  const [todayTokens, setTodayTokens] = useState<number>(0);
  const [todayCost, setTodayCost] = useState<number>(0);

  useEffect(() => {
    fetch('/api/user/usage-stats')
      .then(res => res.json())
      .then(data => {
        setTodayTokens(data?.today?.tokens || 0);
        setTodayCost(data?.today?.cost || 0);
      })
      .catch(() => {});
  }, []);

  const formatCost = (cost: number) => cost < 0.01 ? '<$0.01' : `$${cost.toFixed(2)}`;

  return (
    <div className={cn(
      'flex items-center gap-2 px-2 py-1 rounded-lg bg-stone-800/50 text-xs',
      className
    )}>
      <Coins className="w-3 h-3 text-emerald-400" />
      <span className="text-stone-400">Today:</span>
      <span className="font-mono text-stone-300">{formatCost(todayCost)}</span>
    </div>
  );
}
