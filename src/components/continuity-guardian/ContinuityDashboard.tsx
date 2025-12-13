'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield, AlertTriangle, CheckCircle, Clock, Users, MapPin,
  BookOpen, Zap, ChevronRight, ChevronDown, RefreshCw, Search,
  Filter, X, Eye, Edit2, Check, AlertCircle, FileText, Activity,
  TrendingUp, BarChart3, Calendar, Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  StoryFact,
  TimelineEvent,
  CharacterState,
  ConsistencyIssue,
  ContinuityAnalysis,
  FactCategory,
  IssueSeverity,
} from './types';

interface ContinuityDashboardProps {
  bookId: string;
  className?: string;
}

export function ContinuityDashboard({ bookId, className }: ContinuityDashboardProps) {
  const [view, setView] = useState<'dashboard' | 'facts' | 'timeline' | 'characters' | 'issues'>('dashboard');
  const [analysis, setAnalysis] = useState<ContinuityAnalysis | null>(null);
  const [facts, setFacts] = useState<StoryFact[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [characters, setCharacters] = useState<CharacterState[]>([]);
  const [issues, setIssues] = useState<ConsistencyIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ phase: '', progress: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<ConsistencyIssue | null>(null);
  const [filters, setFilters] = useState({
    category: '' as FactCategory | '',
    severity: '' as IssueSeverity | '',
    status: '' as ConsistencyIssue['status'] | '',
  });

  // Load data on mount
  useEffect(() => {
    loadContinuityData();
  }, [bookId]);

  const loadContinuityData = async () => {
    setLoading(true);
    try {
      const [analysisRes, factsRes, eventsRes, issuesRes] = await Promise.all([
        fetch(`/api/continuity/${bookId}/analysis`),
        fetch(`/api/continuity/${bookId}/facts`),
        fetch(`/api/continuity/${bookId}/events`),
        fetch(`/api/continuity/${bookId}/issues`),
      ]);

      if (analysisRes.ok) setAnalysis(await analysisRes.json());
      if (factsRes.ok) setFacts((await factsRes.json()).facts || []);
      if (eventsRes.ok) setEvents((await eventsRes.json()).events || []);
      if (issuesRes.ok) setIssues((await issuesRes.json()).issues || []);
    } catch (err) {
      console.error('Failed to load continuity data:', err);
    } finally {
      setLoading(false);
    }
  };

  const runFullScan = async () => {
    setIsScanning(true);
    setScanProgress({ phase: 'Starting scan...', progress: 0 });

    try {
      const response = await fetch(`/api/continuity/${bookId}/scan`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Scan failed');

      // Poll for progress
      const pollProgress = async () => {
        const statusRes = await fetch(`/api/continuity/${bookId}/scan/status`);
        if (statusRes.ok) {
          const status = await statusRes.json();
          setScanProgress(status);
          if (status.progress < 100) {
            setTimeout(pollProgress, 1000);
          } else {
            await loadContinuityData();
            setIsScanning(false);
          }
        }
      };
      pollProgress();
    } catch (err) {
      console.error('Scan failed:', err);
      setIsScanning(false);
    }
  };

  const resolveIssue = async (issueId: string, resolution: { method: string; notes: string }) => {
    try {
      await fetch(`/api/continuity/${bookId}/issues/${issueId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolution),
      });
      await loadContinuityData();
      setSelectedIssue(null);
    } catch (err) {
      console.error('Failed to resolve issue:', err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getSeverityColor = (severity: IssueSeverity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'suggestion': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getCategoryIcon = (category: FactCategory) => {
    switch (category) {
      case 'character_trait':
      case 'character_knowledge':
      case 'character_status':
        return Users;
      case 'timeline':
        return Calendar;
      case 'location':
        return MapPin;
      case 'relationship':
        return Link2;
      case 'plot_thread':
        return Activity;
      default:
        return FileText;
    }
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <RefreshCw className="w-6 h-6 text-stone-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-stone-900', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-100">Continuity Guardian</h2>
              <p className="text-sm text-stone-400">
                Track facts, timeline, and consistency
              </p>
            </div>
          </div>
          
          <button
            onClick={runFullScan}
            disabled={isScanning}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors',
              isScanning
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', isScanning && 'animate-spin')} />
            {isScanning ? 'Scanning...' : 'Scan Book'}
          </button>
        </div>

        {/* Scan Progress */}
        {isScanning && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-400">{scanProgress.phase}</span>
              <span className="text-stone-500">{scanProgress.progress}%</span>
            </div>
            <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${scanProgress.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 py-2 border-b border-stone-800 flex gap-1">
        {[
          { id: 'dashboard', label: 'Overview', icon: BarChart3 },
          { id: 'facts', label: 'Facts', icon: FileText, count: facts.length },
          { id: 'timeline', label: 'Timeline', icon: Calendar, count: events.length },
          { id: 'issues', label: 'Issues', icon: AlertTriangle, count: issues.filter(i => i.status === 'open').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as any)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors',
              view === tab.id
                ? 'bg-stone-800 text-stone-100'
                : 'text-stone-400 hover:text-stone-300 hover:bg-stone-800/50'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                'px-1.5 py-0.5 text-xs rounded-full',
                tab.id === 'issues' && issues.some(i => i.status === 'open' && i.severity === 'critical')
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-stone-700 text-stone-400'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {view === 'dashboard' && (
          <DashboardView 
            analysis={analysis} 
            issues={issues}
            facts={facts}
            events={events}
            onViewIssues={() => setView('issues')}
          />
        )}
        
        {view === 'facts' && (
          <FactsView 
            facts={facts}
            filters={filters}
            onFilterChange={setFilters}
          />
        )}
        
        {view === 'timeline' && (
          <TimelineView events={events} />
        )}
        
        {view === 'issues' && (
          <IssuesView 
            issues={issues}
            selectedIssue={selectedIssue}
            onSelectIssue={setSelectedIssue}
            onResolve={resolveIssue}
            filters={filters}
            onFilterChange={setFilters}
          />
        )}
      </div>
    </div>
  );
}

// Dashboard Overview View
function DashboardView({ 
  analysis, 
  issues,
  facts,
  events,
  onViewIssues 
}: { 
  analysis: ContinuityAnalysis | null;
  issues: ConsistencyIssue[];
  facts: StoryFact[];
  events: TimelineEvent[];
  onViewIssues: () => void;
}) {
  const openIssues = issues.filter(i => i.status === 'open');
  const criticalCount = openIssues.filter(i => i.severity === 'critical').length;
  const warningCount = openIssues.filter(i => i.severity === 'warning').length;

  const score = analysis?.continuityScore || 0;
  const scoreColor = score >= 90 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = score >= 90 ? 'from-emerald-500' : score >= 70 ? 'from-amber-500' : 'from-red-500';

  return (
    <div className="space-y-6">
      {/* Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-6 rounded-2xl bg-stone-800/50 border border-stone-700/50">
          <h3 className="text-sm font-medium text-stone-400 mb-4">Continuity Health</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-stone-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${score * 2.51} 251`}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className={scoreBg} stopColor="currentColor" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn('text-2xl font-bold', scoreColor)}>{score}</span>
              </div>
            </div>
            <div>
              <p className={cn('text-lg font-semibold', scoreColor)}>
                {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Work'}
              </p>
              <p className="text-sm text-stone-500">
                {score >= 90 
                  ? 'Story is highly consistent'
                  : score >= 70 
                  ? 'Minor issues to address'
                  : 'Several issues found'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
            <FileText className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-stone-100">{facts.length}</p>
            <p className="text-xs text-stone-500">Facts Tracked</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
            <Calendar className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-stone-100">{events.length}</p>
            <p className="text-xs text-stone-500">Timeline Events</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
            <AlertTriangle className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-stone-100">{warningCount}</p>
            <p className="text-xs text-stone-500">Warnings</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
            <AlertCircle className="w-5 h-5 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-stone-100">{criticalCount}</p>
            <p className="text-xs text-stone-500">Critical Issues</p>
          </div>
        </div>
      </div>

      {/* Recent Issues */}
      {openIssues.length > 0 && (
        <div className="p-6 rounded-2xl bg-stone-800/50 border border-stone-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-stone-300">Open Issues</h3>
            <button
              onClick={onViewIssues}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {openIssues.slice(0, 5).map((issue) => (
              <div
                key={issue.id}
                className={cn(
                  'p-3 rounded-lg border flex items-start gap-3',
                  issue.severity === 'critical' 
                    ? 'bg-red-500/5 border-red-500/30'
                    : issue.severity === 'warning'
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-blue-500/5 border-blue-500/30'
                )}
              >
                <AlertTriangle className={cn(
                  'w-4 h-4 mt-0.5 shrink-0',
                  issue.severity === 'critical' ? 'text-red-400' :
                  issue.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-200 font-medium">{issue.title}</p>
                  <p className="text-xs text-stone-500 truncate">{issue.description}</p>
                </div>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full shrink-0',
                  issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  issue.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 
                  'bg-blue-500/20 text-blue-400'
                )}>
                  {issue.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Issues */}
      {openIssues.length === 0 && (
        <div className="p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-emerald-400 mb-1">All Clear!</h3>
          <p className="text-sm text-stone-400">No continuity issues detected in your story.</p>
        </div>
      )}
    </div>
  );
}

// Facts View
function FactsView({ 
  facts, 
  filters,
  onFilterChange 
}: { 
  facts: StoryFact[];
  filters: any;
  onFilterChange: (f: any) => void;
}) {
  const categories: FactCategory[] = [
    'character_trait', 'character_knowledge', 'character_status',
    'timeline', 'location', 'object', 'world_rule', 'relationship', 'plot_thread'
  ];

  const filteredFacts = facts.filter(f => {
    if (filters.category && f.category !== filters.category) return false;
    return true;
  });

  const groupedFacts = filteredFacts.reduce((acc, fact) => {
    if (!acc[fact.category]) acc[fact.category] = [];
    acc[fact.category].push(fact);
    return acc;
  }, {} as Record<string, StoryFact[]>);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-stone-500" />
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          className="px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-300"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Facts List */}
      {Object.entries(groupedFacts).map(([category, categoryFacts]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-medium text-stone-400 capitalize flex items-center gap-2">
            {category.replace(/_/g, ' ')}
            <span className="text-xs bg-stone-800 px-2 py-0.5 rounded-full">
              {categoryFacts.length}
            </span>
          </h3>
          <div className="space-y-2">
            {categoryFacts.map((fact) => (
              <div
                key={fact.id}
                className="p-3 rounded-lg bg-stone-800/50 border border-stone-700/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm text-stone-200 font-medium">{fact.subject}</span>
                    <span className="text-stone-500 mx-2">→</span>
                    <span className="text-sm text-stone-400">{fact.attribute}:</span>
                    <span className="text-sm text-blue-400 ml-2">"{fact.currentValue}"</span>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    fact.importance === 'critical' ? 'bg-red-500/20 text-red-400' :
                    fact.importance === 'significant' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-stone-700 text-stone-400'
                  )}>
                    {fact.importance}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 italic">
                  "{fact.establishedIn.excerpt}" — {fact.establishedIn.chapterTitle || 'Chapter'}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filteredFacts.length === 0 && (
        <div className="text-center py-12 text-stone-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No facts tracked yet. Run a scan to extract facts from your chapters.</p>
        </div>
      )}
    </div>
  );
}

// Timeline View
function TimelineView({ events }: { events: TimelineEvent[] }) {
  const sortedEvents = [...events].sort((a, b) => {
    if (a.storyTime.dayNumber && b.storyTime.dayNumber) {
      return a.storyTime.dayNumber - b.storyTime.dayNumber;
    }
    return 0;
  });

  return (
    <div className="space-y-4">
      {sortedEvents.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No timeline events tracked yet.</p>
        </div>
      ) : (
        <div className="relative pl-8">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-stone-700" />
          
          {sortedEvents.map((event, idx) => (
            <div key={event.id} className="relative pb-6">
              {/* Dot */}
              <div className={cn(
                'absolute left-0 w-6 h-6 rounded-full border-2 flex items-center justify-center -translate-x-1/2',
                event.importance === 'critical' 
                  ? 'bg-red-500/20 border-red-500' 
                  : event.importance === 'significant'
                  ? 'bg-blue-500/20 border-blue-500'
                  : 'bg-stone-800 border-stone-600'
              )}>
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  event.importance === 'critical' ? 'bg-red-400' :
                  event.importance === 'significant' ? 'bg-blue-400' : 'bg-stone-500'
                )} />
              </div>
              
              {/* Content */}
              <div className="ml-6 p-4 rounded-lg bg-stone-800/50 border border-stone-700/50">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-blue-400 font-mono">
                    {event.storyTime.value}
                  </span>
                  <span className="text-xs text-stone-500">
                    {event.chapterTitle || 'Chapter'}
                  </span>
                </div>
                <p className="text-sm text-stone-200">{event.description}</p>
                {(event.characters.length > 0 || event.locations.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {event.characters.map((char, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                        {char}
                      </span>
                    ))}
                    {event.locations.map((loc, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                        {loc}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Issues View
function IssuesView({ 
  issues, 
  selectedIssue,
  onSelectIssue,
  onResolve,
  filters,
  onFilterChange
}: { 
  issues: ConsistencyIssue[];
  selectedIssue: ConsistencyIssue | null;
  onSelectIssue: (issue: ConsistencyIssue | null) => void;
  onResolve: (id: string, resolution: { method: string; notes: string }) => void;
  filters: any;
  onFilterChange: (f: any) => void;
}) {
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredIssues = issues.filter(i => {
    if (filters.severity && i.severity !== filters.severity) return false;
    if (filters.status && i.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="flex gap-6">
      {/* Issue List */}
      <div className="flex-1 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-stone-500" />
          <select
            value={filters.severity}
            onChange={(e) => onFilterChange({ ...filters, severity: e.target.value })}
            className="px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-300"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="suggestion">Suggestion</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-300"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {/* Issues */}
        <div className="space-y-2">
          {filteredIssues.map((issue) => (
            <button
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              className={cn(
                'w-full p-4 rounded-lg border text-left transition-colors',
                selectedIssue?.id === issue.id
                  ? 'bg-stone-800 border-blue-500/50'
                  : 'bg-stone-800/50 border-stone-700/50 hover:border-stone-600'
              )}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className={cn(
                  'w-4 h-4 mt-0.5 shrink-0',
                  issue.severity === 'critical' ? 'text-red-400' :
                  issue.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-stone-200">{issue.title}</span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      issue.status === 'open' ? 'bg-stone-700 text-stone-400' :
                      issue.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-stone-700 text-stone-400'
                    )}>
                      {issue.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2">{issue.description}</p>
                </div>
              </div>
            </button>
          ))}

          {filteredIssues.length === 0 && (
            <div className="text-center py-12 text-stone-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-50" />
              <p>No issues match your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Issue Detail */}
      {selectedIssue && (
        <div className="w-96 p-6 rounded-xl bg-stone-800/50 border border-stone-700/50 space-y-4">
          <div className="flex items-start justify-between">
            <div className={cn(
              'px-2 py-1 rounded text-xs font-medium',
              selectedIssue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
              selectedIssue.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
              'bg-blue-500/20 text-blue-400'
            )}>
              {selectedIssue.severity.toUpperCase()}
            </div>
            <button
              onClick={() => onSelectIssue(null)}
              className="p-1 text-stone-500 hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-lg font-medium text-stone-100">{selectedIssue.title}</h3>
          <p className="text-sm text-stone-400">{selectedIssue.description}</p>

          {/* Location */}
          {selectedIssue.locations[0] && (
            <div className="p-3 rounded-lg bg-stone-900/50 border border-stone-700/50">
              <p className="text-xs text-stone-500 mb-1">{selectedIssue.locations[0].chapterTitle}</p>
              <p className="text-sm text-stone-300 italic">"{selectedIssue.locations[0].excerpt}"</p>
            </div>
          )}

          {/* Suggestions */}
          {selectedIssue.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-stone-300">AI Suggestions</h4>
              {selectedIssue.suggestions.map((sug, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-sm font-medium text-blue-400">{sug.approach}</p>
                  <p className="text-xs text-stone-400 mt-1">{sug.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Resolution */}
          {selectedIssue.status === 'open' && (
            <div className="pt-4 border-t border-stone-700 space-y-3">
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Resolution notes (optional)..."
                className="w-full h-20 px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-200 placeholder-stone-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onResolve(selectedIssue.id, { method: 'fixed', notes: resolutionNotes })}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
                >
                  Mark Fixed
                </button>
                <button
                  onClick={() => onResolve(selectedIssue.id, { method: 'intentional', notes: resolutionNotes })}
                  className="flex-1 py-2 px-3 rounded-lg bg-stone-700 text-stone-200 text-sm font-medium hover:bg-stone-600"
                >
                  Intentional
                </button>
                <button
                  onClick={() => onResolve(selectedIssue.id, { method: 'wont_fix', notes: resolutionNotes })}
                  className="py-2 px-3 rounded-lg bg-stone-800 text-stone-400 text-sm hover:bg-stone-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
