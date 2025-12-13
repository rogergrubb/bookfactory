'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, AlertCircle, CheckCircle, 
  X, Loader2, Lightbulb, RefreshCw, ChevronDown, ChevronUp
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

interface ContinuityToolPanelProps {
  bookId: string;
  selection: { text: string; start: number; end: number } | null;
  chapterContent: string;
  onClose: () => void;
}

export function ContinuityToolPanel({
  bookId,
  selection,
  chapterContent,
  onClose,
}: ContinuityToolPanelProps) {
  const [issues, setIssues] = useState<ConsistencyIssue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [factsChecked, setFactsChecked] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [checkMode, setCheckMode] = useState<'selection' | 'recent' | 'full'>('selection');
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

  // Determine what text to check
  const textToCheck = selection?.text || 
    (checkMode === 'recent' ? chapterContent.slice(-2000) : chapterContent);

  const checkConsistency = async () => {
    if (!bookId || !textToCheck.trim()) return;
    
    setIsChecking(true);
    setError(null);
    
    try {
      const response = await fetch('/api/continuity/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          content: textToCheck.slice(0, 5000), // Limit for API
        }),
      });
      
      if (!response.ok) throw new Error('Check failed');
      
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
  };

  // Auto-check when selection changes
  useEffect(() => {
    if (selection?.text) {
      setCheckMode('selection');
      checkConsistency();
    }
  }, [selection?.text]);

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  return (
    <div className="w-96 h-full flex flex-col border-l border-stone-800 bg-stone-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-800 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-stone-100">Continuity Check</h3>
              <p className="text-xs text-stone-500">
                Check for story consistency issues
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Check Mode Selection */}
      <div className="px-4 py-3 border-b border-stone-800">
        <label className="text-xs text-stone-500 block mb-2">Check scope</label>
        <div className="flex gap-2">
          {selection?.text && (
            <button
              onClick={() => setCheckMode('selection')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs rounded-lg border transition-colors',
                checkMode === 'selection'
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'border-stone-700 text-stone-400 hover:border-stone-600'
              )}
            >
              Selection
            </button>
          )}
          <button
            onClick={() => setCheckMode('recent')}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs rounded-lg border transition-colors',
              checkMode === 'recent'
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                : 'border-stone-700 text-stone-400 hover:border-stone-600'
            )}
          >
            Recent Text
          </button>
          <button
            onClick={() => setCheckMode('full')}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs rounded-lg border transition-colors',
              checkMode === 'full'
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                : 'border-stone-700 text-stone-400 hover:border-stone-600'
            )}
          >
            Full Chapter
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="px-4 py-2 bg-stone-800/30 border-b border-stone-800">
        <p className="text-xs text-stone-500 mb-1">
          Checking {checkMode === 'selection' ? 'selection' : checkMode === 'recent' ? 'recent ~2000 chars' : 'full chapter'}:
        </p>
        <p className="text-xs text-stone-400 italic line-clamp-2">
          "{textToCheck.slice(0, 100)}{textToCheck.length > 100 ? '...' : ''}"
        </p>
        <p className="text-xs text-stone-600 mt-1">
          {textToCheck.length.toLocaleString()} characters
        </p>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {isChecking ? (
          <div className="flex flex-col items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-sm text-stone-400">Analyzing for consistency...</p>
            <p className="text-xs text-stone-600 mt-1">This may take a few seconds</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48">
            <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={checkConsistency}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300"
            >
              Try again
            </button>
          </div>
        ) : !hasChecked ? (
          <div className="flex flex-col items-center justify-center h-48">
            <Shield className="w-10 h-10 text-stone-600 mb-3" />
            <p className="text-sm text-stone-500 mb-4">Ready to check consistency</p>
            <button
              onClick={checkConsistency}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Run Check
            </button>
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48">
            <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="text-lg font-medium text-emerald-400">All Clear!</p>
            <p className="text-sm text-stone-500 mt-2">
              No consistency issues found
            </p>
            <p className="text-xs text-stone-600 mt-1">
              Checked against {factsChecked} tracked facts
            </p>
          </div>
        ) : (
          <div>
            {/* Summary Bar */}
            <div className="px-4 py-3 bg-stone-800/50 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {criticalCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 rounded text-red-400 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {criticalCount} critical
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/20 rounded text-amber-400 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {warningCount} warning{warningCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <span className="text-xs text-stone-500">
                {factsChecked} facts
              </span>
            </div>

            {/* Issues List */}
            <div className="divide-y divide-stone-800">
              {issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'transition-colors',
                    issue.severity === 'critical' ? 'bg-red-500/5' : 'bg-amber-500/5'
                  )}
                >
                  <button
                    onClick={() => setExpandedIssue(expandedIssue === idx ? null : idx)}
                    className="w-full px-4 py-3 text-left"
                  >
                    <div className="flex items-start gap-2">
                      {issue.severity === 'critical' ? (
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium',
                          issue.severity === 'critical' ? 'text-red-300' : 'text-amber-300'
                        )}>
                          {issue.title}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                          {issue.description}
                        </p>
                      </div>
                      {expandedIssue === idx ? (
                        <ChevronUp className="w-4 h-4 text-stone-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedIssue === idx && (
                    <div className="px-4 pb-4 pt-0">
                      {/* Full description */}
                      <p className="text-sm text-stone-400 mb-3 ml-6">
                        {issue.description}
                      </p>

                      {/* Excerpt */}
                      {issue.excerpt && (
                        <div className="ml-6 p-2 rounded bg-stone-800/50 border border-stone-700/50 mb-3">
                          <p className="text-xs text-stone-500 mb-1">In your text:</p>
                          <p className="text-sm text-stone-300 italic">
                            "{issue.excerpt}"
                          </p>
                        </div>
                      )}

                      {/* Suggestion */}
                      {issue.suggestion && (
                        <div className="ml-6 flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-blue-400 font-medium mb-1">How to fix</p>
                            <p className="text-sm text-blue-300">{issue.suggestion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-stone-800">
        <button
          onClick={checkConsistency}
          disabled={isChecking}
          className={cn(
            'w-full py-2.5 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors',
            isChecking
              ? 'bg-stone-700 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          )}
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              {hasChecked ? 'Check Again' : 'Run Check'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
