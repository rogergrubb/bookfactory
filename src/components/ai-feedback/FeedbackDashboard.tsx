'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Lightbulb, Target, ChevronRight, ChevronDown, Loader2, RefreshCw,
  BookOpen, FileText, Sparkles, Clock, ArrowRight, X, Filter,
  ThumbsUp, ThumbsDown, Check, AlertCircle, Info, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ManuscriptAnalysis,
  FeedbackItem,
  SpecificIssue,
  PriorityAction,
  CategoryScores,
  FeedbackCategory,
  CATEGORY_INFO,
  SEVERITY_COLORS
} from './types';

interface FeedbackDashboardProps {
  bookId: string;
  chapterId?: string;
  onClose?: () => void;
}

type ViewType = 'overview' | 'strengths' | 'weaknesses' | 'issues' | 'actions';

export function FeedbackDashboard({ bookId, chapterId, onClose }: FeedbackDashboardProps) {
  const [analysis, setAnalysis] = useState<ManuscriptAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | 'all'>('all');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestAnalysis();
  }, [bookId, chapterId]);

  const fetchLatestAnalysis = async () => {
    setLoading(true);
    try {
      const url = chapterId 
        ? `/api/feedback/${bookId}/analysis?chapterId=${chapterId}`
        : `/api/feedback/${bookId}/analysis`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to fetch analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(`/api/feedback/${bookId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: chapterId ? 'CHAPTER' : 'FULL_BOOK',
          chapterId,
          compareToGenre: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const views: { id: ViewType; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'strengths', label: 'Strengths', icon: ThumbsUp, count: analysis?.strengths.length },
    { id: 'weaknesses', label: 'Areas to Improve', icon: Target, count: analysis?.weaknesses.length },
    { id: 'issues', label: 'Specific Issues', icon: AlertTriangle, count: analysis?.issues.length },
    { id: 'actions', label: 'Action Plan', icon: Zap, count: analysis?.priorityActions.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-stone-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-800 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-100">AI Manuscript Critique</h2>
              <p className="text-sm text-stone-400">
                {chapterId ? 'Chapter Analysis' : 'Full Book Analysis'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                analyzing
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              )}
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {analysis ? 'Re-analyze' : 'Run Analysis'}
                </>
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* View Tabs */}
        {analysis && (
          <div className="flex gap-1 overflow-x-auto">
            {views.map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                  activeView === view.id
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                )}
              >
                <view.icon className="w-4 h-4" />
                {view.label}
                {view.count !== undefined && view.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-stone-800 text-xs">
                    {view.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!analysis ? (
          <EmptyState onAnalyze={runAnalysis} analyzing={analyzing} />
        ) : activeView === 'overview' ? (
          <OverviewView analysis={analysis} />
        ) : activeView === 'strengths' ? (
          <StrengthsView strengths={analysis.strengths} />
        ) : activeView === 'weaknesses' ? (
          <WeaknessesView weaknesses={analysis.weaknesses} />
        ) : activeView === 'issues' ? (
          <IssuesView 
            issues={analysis.issues}
            expandedIssue={expandedIssue}
            onToggleExpand={setExpandedIssue}
          />
        ) : activeView === 'actions' ? (
          <ActionsView actions={analysis.priorityActions} />
        ) : null}
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ onAnalyze, analyzing }: { onAnalyze: () => void; analyzing: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
        <BarChart3 className="w-8 h-8 text-amber-400" />
      </div>
      <h3 className="text-xl font-medium text-stone-200 mb-2">No Analysis Yet</h3>
      <p className="text-stone-400 text-center max-w-md mb-6">
        Get detailed feedback on your manuscript including pacing, dialogue, 
        character development, and more.
      </p>
      <button
        onClick={onAnalyze}
        disabled={analyzing}
        className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50"
      >
        {analyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Analyze My Manuscript
          </>
        )}
      </button>
    </div>
  );
}

// Overview View
function OverviewView({ analysis }: { analysis: ManuscriptAnalysis }) {
  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const scoreCategories = Object.entries(analysis.scores)
    .filter(([key]) => key in CATEGORY_INFO)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="flex items-center gap-6 p-6 bg-stone-900 rounded-xl border border-stone-800">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-stone-800"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${(analysis.overallScore / 100) * 352} 352`}
              className={scoreColor(analysis.overallScore)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-3xl font-bold', scoreColor(analysis.overallScore))}>
              {analysis.overallScore}
            </span>
            <span className="text-xs text-stone-500">Overall</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-stone-200 mb-2">Manuscript Score</h3>
          <p className="text-sm text-stone-400">
            Based on analysis of {analysis.wordCountAnalyzed.toLocaleString()} words
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1 text-emerald-400">
              <ThumbsUp className="w-4 h-4" />
              {analysis.strengths.length} strengths
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Target className="w-4 h-4" />
              {analysis.weaknesses.length} areas to improve
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              {analysis.issues.filter(i => i.severity === 'critical' || i.severity === 'significant').length} issues
            </span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-6 bg-stone-900 rounded-xl border border-stone-800">
        <h3 className="text-sm font-medium text-stone-400 mb-3">Executive Summary</h3>
        <p className="text-stone-300 whitespace-pre-line">{analysis.executiveSummary}</p>
      </div>

      {/* Category Scores */}
      <div className="p-6 bg-stone-900 rounded-xl border border-stone-800">
        <h3 className="text-sm font-medium text-stone-400 mb-4">Category Scores</h3>
        <div className="space-y-3">
          {scoreCategories.slice(0, 10).map(([category, score]) => {
            const info = CATEGORY_INFO[category as FeedbackCategory];
            return (
              <div key={category} className="flex items-center gap-3">
                <span className="text-lg">{info?.icon || '📝'}</span>
                <span className="w-40 text-sm text-stone-300 truncate">
                  {info?.name || category}
                </span>
                <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full transition-all',
                      score >= 80 ? 'bg-emerald-500' :
                      score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className={cn('text-sm font-medium w-8', scoreColor(score))}>
                  {score}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Actions Preview */}
      {analysis.priorityActions.length > 0 && (
        <div className="p-6 bg-stone-900 rounded-xl border border-stone-800">
          <h3 className="text-sm font-medium text-stone-400 mb-4">Top Priority Actions</h3>
          <div className="space-y-3">
            {analysis.priorityActions.slice(0, 3).map((action, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-stone-800/50 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-amber-400">{action.priority}</span>
                </div>
                <div>
                  <p className="text-sm text-stone-200">{action.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      action.impact === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                      action.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-stone-700 text-stone-400'
                    )}>
                      {action.impact} impact
                    </span>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      action.effort === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                      action.effort === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    )}>
                      {action.effort} effort
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Strengths View
function StrengthsView({ strengths }: { strengths: FeedbackItem[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-stone-200">
        What's Working Well ({strengths.length})
      </h2>
      
      {strengths.map((strength, index) => (
        <div 
          key={index}
          className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <ThumbsUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-stone-200 font-medium">{strength.title}</h3>
              <p className="text-xs text-emerald-400 capitalize mb-2">{strength.category}</p>
              <p className="text-sm text-stone-400">{strength.description}</p>
              
              {strength.examples && strength.examples.length > 0 && (
                <div className="mt-3 p-3 bg-stone-800/50 rounded-lg">
                  <p className="text-xs text-stone-500 mb-1">Example:</p>
                  <p className="text-sm text-stone-300 italic">
                    "{strength.examples[0].text}"
                  </p>
                  {strength.examples[0].location && (
                    <p className="text-xs text-stone-500 mt-1">
                      — {strength.examples[0].location}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Weaknesses View
function WeaknessesView({ weaknesses }: { weaknesses: FeedbackItem[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-stone-200">
        Areas to Improve ({weaknesses.length})
      </h2>
      
      {weaknesses.map((weakness, index) => (
        <div 
          key={index}
          className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-stone-200 font-medium">{weakness.title}</h3>
              <p className="text-xs text-amber-400 capitalize mb-2">{weakness.category}</p>
              <p className="text-sm text-stone-400">{weakness.description}</p>
              
              {weakness.examples && weakness.examples.length > 0 && (
                <div className="mt-3 p-3 bg-stone-800/50 rounded-lg">
                  <p className="text-xs text-stone-500 mb-1">Example:</p>
                  <p className="text-sm text-stone-300 italic">
                    "{weakness.examples[0].text}"
                  </p>
                </div>
              )}
              
              {weakness.suggestions && weakness.suggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-stone-500 mb-2">Suggestions:</p>
                  <ul className="space-y-1">
                    {weakness.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-300">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Issues View
function IssuesView({ 
  issues, 
  expandedIssue, 
  onToggleExpand 
}: { 
  issues: SpecificIssue[];
  expandedIssue: string | null;
  onToggleExpand: (id: string | null) => void;
}) {
  const severityOrder = ['critical', 'significant', 'moderate', 'minor', 'suggestion'];
  const sortedIssues = [...issues].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-stone-200">
          Specific Issues ({issues.length})
        </h2>
        <div className="flex items-center gap-2 text-xs">
          {severityOrder.slice(0, 4).map(severity => {
            const count = issues.filter(i => i.severity === severity).length;
            if (count === 0) return null;
            const colors = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS];
            return (
              <span key={severity} className={cn('px-2 py-1 rounded', colors.bg, colors.text)}>
                {count} {severity}
              </span>
            );
          })}
        </div>
      </div>
      
      <div className="space-y-2">
        {sortedIssues.map((issue) => {
          const colors = SEVERITY_COLORS[issue.severity];
          const isExpanded = expandedIssue === issue.id;
          
          return (
            <div 
              key={issue.id}
              className={cn('rounded-xl border overflow-hidden', colors.border, colors.bg)}
            >
              <button
                onClick={() => onToggleExpand(isExpanded ? null : issue.id)}
                className="w-full p-4 flex items-start gap-3 text-left"
              >
                <AlertTriangle className={cn('w-5 h-5 shrink-0 mt-0.5', colors.text)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-stone-200 font-medium">{issue.title}</h3>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded capitalize', colors.bg, colors.text)}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 capitalize mt-0.5">
                    {issue.category} • {issue.type.replace(/_/g, ' ')}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-stone-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-stone-500" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 ml-8">
                  <p className="text-sm text-stone-400 mb-3">{issue.description}</p>
                  
                  {issue.excerpt && (
                    <div className="p-3 bg-stone-800/50 rounded-lg mb-3">
                      <p className="text-xs text-stone-500 mb-1">Problematic text:</p>
                      <p className="text-sm text-stone-300 italic">"{issue.excerpt}"</p>
                    </div>
                  )}
                  
                  {issue.suggestion && (
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-blue-400 font-medium mb-1">Suggestion</p>
                        <p className="text-sm text-blue-300">{issue.suggestion}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Actions View
function ActionsView({ actions }: { actions: PriorityAction[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-stone-200">
        Action Plan ({actions.length} items)
      </h2>
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <div 
            key={index}
            className="p-4 bg-stone-900 rounded-xl border border-stone-800"
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                action.priority === 1 ? 'bg-red-500/20 text-red-400' :
                action.priority === 2 ? 'bg-orange-500/20 text-orange-400' :
                action.priority === 3 ? 'bg-amber-500/20 text-amber-400' :
                'bg-stone-700 text-stone-400'
              )}>
                <span className="text-lg font-bold">{action.priority}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-stone-200 font-medium">{action.action}</h3>
                <p className="text-xs text-stone-500 capitalize mt-1">{action.category}</p>
                
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-stone-500" />
                    <span className={cn(
                      'text-xs',
                      action.impact === 'high' ? 'text-emerald-400' :
                      action.impact === 'medium' ? 'text-amber-400' :
                      'text-stone-400'
                    )}>
                      {action.impact} impact
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-stone-500" />
                    <span className={cn(
                      'text-xs',
                      action.effort === 'low' ? 'text-emerald-400' :
                      action.effort === 'medium' ? 'text-amber-400' :
                      'text-red-400'
                    )}>
                      {action.effort} effort
                    </span>
                  </div>
                </div>
                
                {action.affectedAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {action.affectedAreas.map((area, i) => (
                      <span 
                        key={i}
                        className="px-2 py-0.5 bg-stone-800 rounded text-xs text-stone-400"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
