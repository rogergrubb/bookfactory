'use client';

import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, CheckCircle, ChevronDown, ChevronRight, 
  Wand2, Check, X, Eye, EyeOff, Sparkles, Zap,
  ArrowRight, Copy, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Issue severity levels
export type IssueSeverity = 'critical' | 'warning' | 'suggestion' | 'info';

// A single correction issue found by AI
export interface CorrectionIssue {
  id: string;
  type: string;                    // e.g., 'repetition', 'passive-voice', 'cliche', 'adverb'
  severity: IssueSeverity;
  title: string;                   // Short description: "Repeated word: 'suddenly'"
  description?: string;            // Detailed explanation
  original: string;                // The problematic text
  suggestion: string;              // The AI-suggested fix
  startIndex: number;              // Position in document
  endIndex: number;                // End position
  category?: string;               // Tool category that found this
  confidence: number;              // 0-100 confidence score
}

// Result from any analysis tool
export interface AnalysisResult {
  summary: string;                 // Overall analysis summary
  score?: number;                  // Optional overall score (0-100)
  issues: CorrectionIssue[];       // All found issues
  insights?: string[];             // Additional insights without specific fixes
  nextToolSuggestion?: string;     // Suggested next tool to run
}

interface CorrectionPanelProps {
  result: AnalysisResult;
  chapterContent: string;
  onApplyFix: (issue: CorrectionIssue) => void;
  onApplyAll: (issues: CorrectionIssue[]) => void;
  onDismiss: (issueId: string) => void;
  onHighlightIssue?: (issue: CorrectionIssue | null) => void;
  toolName: string;
  toolColor: string;
}

const severityConfig: Record<IssueSeverity, { 
  icon: React.ElementType; 
  color: string; 
  bg: string; 
  border: string;
  label: string;
}> = {
  critical: { 
    icon: AlertTriangle, 
    color: 'text-red-400', 
    bg: 'bg-red-500/10', 
    border: 'border-red-500/30',
    label: 'Critical'
  },
  warning: { 
    icon: AlertTriangle, 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/30',
    label: 'Warning'
  },
  suggestion: { 
    icon: Sparkles, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/30',
    label: 'Suggestion'
  },
  info: { 
    icon: Eye, 
    color: 'text-stone-400', 
    bg: 'bg-stone-500/10', 
    border: 'border-stone-500/30',
    label: 'Info'
  },
};

export function CorrectionPanel({
  result,
  chapterContent,
  onApplyFix,
  onApplyAll,
  onDismiss,
  onHighlightIssue,
  toolName,
  toolColor,
}: CorrectionPanelProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [appliedIssues, setAppliedIssues] = useState<Set<string>>(new Set());
  const [dismissedIssues, setDismissedIssues] = useState<Set<string>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<IssueSeverity | 'all'>('all');
  const [hoveredIssue, setHoveredIssue] = useState<string | null>(null);

  // Filter and sort issues
  const filteredIssues = useMemo(() => {
    return result.issues
      .filter(issue => !dismissedIssues.has(issue.id))
      .filter(issue => filterSeverity === 'all' || issue.severity === filterSeverity)
      .sort((a, b) => {
        // Sort by severity first, then by position
        const severityOrder = { critical: 0, warning: 1, suggestion: 2, info: 3 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return a.startIndex - b.startIndex;
      });
  }, [result.issues, dismissedIssues, filterSeverity]);

  const pendingIssues = filteredIssues.filter(i => !appliedIssues.has(i.id));
  
  // Count by severity
  const severityCounts = useMemo(() => {
    const counts = { critical: 0, warning: 0, suggestion: 0, info: 0 };
    result.issues.forEach(issue => {
      if (!dismissedIssues.has(issue.id)) {
        counts[issue.severity]++;
      }
    });
    return counts;
  }, [result.issues, dismissedIssues]);

  const toggleExpand = (issueId: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  };

  const handleApplyFix = (issue: CorrectionIssue) => {
    onApplyFix(issue);
    setAppliedIssues(prev => new Set([...prev, issue.id]));
  };

  const handleApplyAll = () => {
    onApplyAll(pendingIssues);
    setAppliedIssues(prev => new Set([...prev, ...pendingIssues.map(i => i.id)]));
  };

  const handleDismiss = (issueId: string) => {
    setDismissedIssues(prev => new Set([...prev, issueId]));
    onDismiss(issueId);
  };

  const handleMouseEnter = (issue: CorrectionIssue) => {
    setHoveredIssue(issue.id);
    onHighlightIssue?.(issue);
  };

  const handleMouseLeave = () => {
    setHoveredIssue(null);
    onHighlightIssue?.(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Summary Header */}
      <div className="p-4 border-b border-stone-800">
        {/* Score badge if available */}
        {result.score !== undefined && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-stone-500">Overall Score</span>
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              result.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
              result.score >= 60 ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            )}>
              {result.score}/100
            </div>
          </div>
        )}

        {/* Summary text */}
        <p className="text-sm text-stone-300 leading-relaxed">
          {result.summary}
        </p>

        {/* Issue counts */}
        <div className="flex items-center gap-3 mt-3">
          {Object.entries(severityCounts).map(([severity, count]) => {
            if (count === 0) return null;
            const config = severityConfig[severity as IssueSeverity];
            return (
              <button
                key={severity}
                onClick={() => setFilterSeverity(
                  filterSeverity === severity ? 'all' : severity as IssueSeverity
                )}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all',
                  filterSeverity === severity 
                    ? `${config.bg} ${config.color} ${config.border} border`
                    : 'text-stone-500 hover:text-stone-300'
                )}
              >
                <config.icon className="w-3 h-3" />
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fix All Button */}
      {pendingIssues.length > 1 && (
        <div className="p-3 border-b border-stone-800 bg-stone-900/50">
          <button
            onClick={handleApplyAll}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
              'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
              'text-white font-medium text-sm transition-all',
              'shadow-lg shadow-emerald-500/20'
            )}
          >
            <Zap className="w-4 h-4" />
            Fix All {pendingIssues.length} Issues
          </button>
        </div>
      )}

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto">
        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-stone-400">No issues found!</p>
            <p className="text-xs text-stone-500 mt-1">Your writing looks great.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-800/50">
            {filteredIssues.map((issue) => {
              const config = severityConfig[issue.severity];
              const isExpanded = expandedIssues.has(issue.id);
              const isApplied = appliedIssues.has(issue.id);
              const isHovered = hoveredIssue === issue.id;

              return (
                <div
                  key={issue.id}
                  className={cn(
                    'transition-all',
                    isHovered && 'bg-stone-800/30',
                    isApplied && 'opacity-50'
                  )}
                  onMouseEnter={() => handleMouseEnter(issue)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Issue Header */}
                  <div
                    className="flex items-start gap-3 p-3 cursor-pointer hover:bg-stone-800/20"
                    onClick={() => toggleExpand(issue.id)}
                  >
                    <div className={cn('p-1.5 rounded', config.bg)}>
                      <config.icon className={cn('w-3.5 h-3.5', config.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-200 truncate">
                          {issue.title}
                        </span>
                        {issue.confidence < 80 && (
                          <span className="text-[10px] text-stone-500 px-1.5 py-0.5 bg-stone-800 rounded">
                            {issue.confidence}% sure
                          </span>
                        )}
                      </div>
                      
                      {/* Original text preview */}
                      <p className="text-xs text-stone-500 mt-0.5 truncate">
                        "{issue.original.slice(0, 50)}{issue.original.length > 50 ? '...' : ''}"
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {isApplied ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          Fixed
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyFix(issue);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title="Apply fix"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismiss(issue.id);
                            }}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-stone-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-stone-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pl-12 space-y-3">
                      {/* Description */}
                      {issue.description && (
                        <p className="text-xs text-stone-400">
                          {issue.description}
                        </p>
                      )}

                      {/* Before/After comparison */}
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-red-400 w-12 pt-1">Before</span>
                          <div className="flex-1 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-stone-300 font-mono">
                            {issue.original}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-emerald-400 w-12 pt-1">After</span>
                          <div className="flex-1 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-stone-300 font-mono">
                            {issue.suggestion}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {!isApplied && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApplyFix(issue)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Apply Fix
                          </button>
                          <button
                            onClick={() => handleDismiss(issue.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            Ignore
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insights Section */}
      {result.insights && result.insights.length > 0 && (
        <div className="p-4 border-t border-stone-800 bg-stone-900/30">
          <h4 className="text-xs font-medium text-stone-400 mb-2">Additional Insights</h4>
          <ul className="space-y-1">
            {result.insights.map((insight, i) => (
              <li key={i} className="text-xs text-stone-500 flex items-start gap-2">
                <span className="text-stone-600">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Tool Suggestion */}
      {result.nextToolSuggestion && (
        <div className="p-3 border-t border-stone-800">
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-stone-800/50 hover:bg-stone-800 text-sm text-stone-400 hover:text-stone-200 transition-colors">
            <span>Next: {result.nextToolSuggestion}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Helper to parse analysis result from AI response
export function parseAnalysisResult(response: string, toolId: string): AnalysisResult {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(response);
    return {
      summary: parsed.summary || 'Analysis complete.',
      score: parsed.score,
      issues: (parsed.issues || []).map((issue: any, index: number) => ({
        id: `${toolId}-${index}`,
        type: issue.type || toolId,
        severity: issue.severity || 'suggestion',
        title: issue.title || 'Issue found',
        description: issue.description,
        original: issue.original || '',
        suggestion: issue.suggestion || issue.fix || '',
        startIndex: issue.startIndex || 0,
        endIndex: issue.endIndex || 0,
        category: issue.category,
        confidence: issue.confidence || 85,
      })),
      insights: parsed.insights,
      nextToolSuggestion: parsed.nextToolSuggestion,
    };
  } catch {
    // If not JSON, return as summary with no issues
    return {
      summary: response,
      issues: [],
    };
  }
}
