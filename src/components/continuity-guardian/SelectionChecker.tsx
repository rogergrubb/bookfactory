'use client';

import React, { useState, useCallback } from 'react';
import { 
  Shield, AlertTriangle, AlertCircle, CheckCircle, 
  X, Loader2, Lightbulb, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsistencyIssue {
  type: string;
  severity: 'critical' | 'warning';
  title: string;
  description: string;
  excerpt: string;
  suggestion?: string;
}

interface SelectionCheckerProps {
  bookId: string;
  selectedText: string;
  onClose: () => void;
  className?: string;
}

export function SelectionChecker({
  bookId,
  selectedText,
  onClose,
  className,
}: SelectionCheckerProps) {
  const [issues, setIssues] = useState<ConsistencyIssue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [factsChecked, setFactsChecked] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkSelection = useCallback(async () => {
    if (!bookId || !selectedText.trim()) return;
    
    setIsChecking(true);
    setError(null);
    
    try {
      const response = await fetch('/api/continuity/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          content: selectedText,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Check failed');
      }
      
      const data = await response.json();
      setIssues(data.issues || []);
      setFactsChecked(data.factsChecked || 0);
      setHasChecked(true);
    } catch (err) {
      console.error('Continuity check failed:', err);
      setError('Check failed. Please try again.');
    } finally {
      setIsChecking(false);
    }
  }, [bookId, selectedText]);

  // Auto-check on mount
  React.useEffect(() => {
    checkSelection();
  }, []);

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  return (
    <div className={cn(
      'w-96 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-800 flex items-center justify-between bg-stone-800/50">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-stone-200">Check Selection</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={checkSelection}
            disabled={isChecking}
            className="p-1.5 rounded-lg bg-stone-700 text-stone-400 hover:text-stone-200 disabled:opacity-50"
            title="Check again"
          >
            <RefreshCw className={cn('w-4 h-4', isChecking && 'animate-spin')} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Text Preview */}
      <div className="px-4 py-2 bg-stone-800/30 border-b border-stone-800">
        <p className="text-xs text-stone-500 mb-1">Checking:</p>
        <p className="text-sm text-stone-400 italic line-clamp-2">
          "{selectedText.slice(0, 150)}{selectedText.length > 150 ? '...' : ''}"
        </p>
      </div>

      {/* Content */}
      <div className="max-h-72 overflow-y-auto">
        {isChecking ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-stone-400">Checking for consistency issues...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={checkSelection}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300"
            >
              Try again
            </button>
          </div>
        ) : !hasChecked ? (
          <div className="p-6 text-center">
            <Shield className="w-8 h-8 text-stone-600 mx-auto mb-2" />
            <p className="text-sm text-stone-500">Click to check selection</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-base font-medium text-emerald-400">No issues found!</p>
            <p className="text-xs text-stone-500 mt-2">
              Checked against {factsChecked} tracked facts
            </p>
          </div>
        ) : (
          <div>
            {/* Summary */}
            <div className="px-4 py-2 bg-stone-800/30 flex items-center gap-3">
              {criticalCount > 0 && (
                <span className="flex items-center gap-1.5 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {criticalCount} critical
                </span>
              )}
              {warningCount > 0 && (
                <span className="flex items-center gap-1.5 text-amber-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {warningCount} warning{warningCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {/* Issues */}
            <div className="divide-y divide-stone-800">
              {issues.map((issue, idx) => (
                <IssueDetail key={idx} issue={issue} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {hasChecked && !isChecking && (
        <div className="px-4 py-2 border-t border-stone-800 bg-stone-900/50">
          <p className="text-xs text-stone-500">
            {factsChecked} facts checked •{' '}
            {issues.length === 0 ? (
              <span className="text-emerald-400">All clear</span>
            ) : (
              <span className="text-amber-400">{issues.length} issue{issues.length > 1 ? 's' : ''} found</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// Detailed issue display
function IssueDetail({ issue }: { issue: ConsistencyIssue }) {
  const isCritical = issue.severity === 'critical';

  return (
    <div className={cn(
      'p-4',
      isCritical ? 'bg-red-500/5' : 'bg-amber-500/5'
    )}>
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        {isCritical ? (
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        )}
        <div>
          <p className={cn(
            'text-sm font-medium',
            isCritical ? 'text-red-300' : 'text-amber-300'
          )}>
            {issue.title}
          </p>
          <p className="text-xs text-stone-500 capitalize">{issue.type.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-stone-400 mb-3 ml-6">{issue.description}</p>

      {/* Problematic excerpt */}
      {issue.excerpt && (
        <div className="ml-6 p-2 rounded bg-stone-800/50 border border-stone-700/50 mb-3">
          <p className="text-xs text-stone-500 mb-1">Problematic text:</p>
          <p className="text-sm text-stone-300 italic">"{issue.excerpt}"</p>
        </div>
      )}

      {/* Suggestion */}
      {issue.suggestion && (
        <div className="ml-6 flex items-start gap-2 p-2 rounded bg-blue-500/10 border border-blue-500/20">
          <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-blue-400 font-medium mb-0.5">Suggestion</p>
            <p className="text-sm text-blue-300">{issue.suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
