'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, AlertTriangle, AlertCircle, CheckCircle, 
  X, ChevronRight, Loader2, Info, Eye, EyeOff,
  Lightbulb, RefreshCw
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

interface ContinuityIndicatorProps {
  bookId: string;
  content: string;
  isEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

export function ContinuityIndicator({
  bookId,
  content,
  isEnabled = true,
  onToggle,
  className,
}: ContinuityIndicatorProps) {
  const [issues, setIssues] = useState<ConsistencyIssue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [lastCheckedContent, setLastCheckedContent] = useState('');
  const [factsChecked, setFactsChecked] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(0);

  // Debounced check - runs after user stops typing
  const checkConsistency = useCallback(async (textToCheck: string) => {
    if (!isEnabled || !bookId || !textToCheck.trim()) return;
    
    // Don't check if content hasn't changed significantly
    if (textToCheck === lastCheckedContent) return;
    
    // Rate limit: at least 3 seconds between checks
    const now = Date.now();
    if (now - lastCheckRef.current < 3000) return;
    
    setIsChecking(true);
    setError(null);
    lastCheckRef.current = now;
    
    try {
      const response = await fetch('/api/continuity/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          content: textToCheck,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Check failed');
      }
      
      const data = await response.json();
      setIssues(data.issues || []);
      setFactsChecked(data.factsChecked || 0);
      setLastCheckedContent(textToCheck);
    } catch (err) {
      console.error('Continuity check failed:', err);
      setError('Check failed');
    } finally {
      setIsChecking(false);
    }
  }, [bookId, isEnabled, lastCheckedContent]);

  // Debounce content changes - check 2s after user stops typing
  useEffect(() => {
    if (!isEnabled) return;
    
    // Clear previous timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    
    // Only check if we have enough content
    if (content.length < 100) return;
    
    // Get the last ~1000 characters for checking (most recent writing)
    const textToCheck = content.slice(-2000);
    
    // Schedule check
    checkTimeoutRef.current = setTimeout(() => {
      checkConsistency(textToCheck);
    }, 2000);
    
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [content, checkConsistency, isEnabled]);

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const hasIssues = issues.length > 0;

  // Status color
  const getStatusColor = () => {
    if (!isEnabled) return 'text-stone-500';
    if (isChecking) return 'text-blue-400';
    if (criticalCount > 0) return 'text-red-400';
    if (warningCount > 0) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getStatusBg = () => {
    if (!isEnabled) return 'bg-stone-800';
    if (criticalCount > 0) return 'bg-red-500/10 border-red-500/30';
    if (warningCount > 0) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className={cn('relative', className)}>
      {/* Indicator Badge */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all',
          getStatusBg(),
          showPanel && 'ring-2 ring-offset-2 ring-offset-stone-900 ring-blue-500/50'
        )}
      >
        <Shield className={cn('w-4 h-4', getStatusColor())} />
        
        {isChecking ? (
          <span className="flex items-center gap-1.5 text-blue-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs">Checking...</span>
          </span>
        ) : !isEnabled ? (
          <span className="text-xs text-stone-500">Off</span>
        ) : hasIssues ? (
          <span className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-xs">{criticalCount}</span>
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs">{warningCount}</span>
              </span>
            )}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            <span className="text-xs">Clear</span>
          </span>
        )}
      </button>

      {/* Issues Panel */}
      {showPanel && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={cn('w-4 h-4', getStatusColor())} />
              <span className="text-sm font-medium text-stone-200">Continuity Guardian</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggle?.(!isEnabled)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isEnabled 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-stone-800 text-stone-500'
                )}
                title={isEnabled ? 'Disable checking' : 'Enable checking'}
              >
                {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => checkConsistency(content.slice(-2000))}
                disabled={isChecking || !isEnabled}
                className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-50"
                title="Check now"
              >
                <RefreshCw className={cn('w-4 h-4', isChecking && 'animate-spin')} />
              </button>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="max-h-80 overflow-y-auto">
            {!isEnabled ? (
              <div className="p-6 text-center">
                <EyeOff className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                <p className="text-sm text-stone-500">Continuity checking is disabled</p>
                <button
                  onClick={() => onToggle?.(true)}
                  className="mt-3 text-xs text-blue-400 hover:text-blue-300"
                >
                  Enable checking
                </button>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-emerald-400 font-medium">All clear!</p>
                <p className="text-xs text-stone-500 mt-1">
                  Checked against {factsChecked} tracked facts
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-800">
                {issues.map((issue, idx) => (
                  <IssueItem key={idx} issue={issue} />
                ))}
              </div>
            )}
          </div>

          {/* Panel Footer */}
          {isEnabled && factsChecked > 0 && (
            <div className="px-4 py-2 border-t border-stone-800 bg-stone-900/50">
              <p className="text-xs text-stone-500">
                Checking against {factsChecked} facts • {' '}
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  Open full dashboard
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Individual issue component
function IssueItem({ issue }: { issue: ConsistencyIssue }) {
  const [expanded, setExpanded] = useState(false);
  const isCritical = issue.severity === 'critical';

  return (
    <div className={cn(
      'p-3 transition-colors',
      isCritical ? 'bg-red-500/5' : 'bg-amber-500/5'
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-2">
          {isCritical ? (
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-medium',
              isCritical ? 'text-red-300' : 'text-amber-300'
            )}>
              {issue.title}
            </p>
            <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
              {issue.description}
            </p>
          </div>
          <ChevronRight className={cn(
            'w-4 h-4 text-stone-500 transition-transform shrink-0',
            expanded && 'rotate-90'
          )} />
        </div>
      </button>
      
      {expanded && (
        <div className="mt-3 ml-6 space-y-2">
          {/* Excerpt */}
          <div className="p-2 rounded bg-stone-800/50 border border-stone-700/50">
            <p className="text-xs text-stone-500 mb-1">Problematic text:</p>
            <p className="text-sm text-stone-300 italic">"{issue.excerpt}"</p>
          </div>
          
          {/* Full description */}
          <p className="text-xs text-stone-400">{issue.description}</p>
          
          {/* Suggestion */}
          {issue.suggestion && (
            <div className="flex items-start gap-2 p-2 rounded bg-blue-500/10 border border-blue-500/20">
              <Lightbulb className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-300">{issue.suggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact inline issue marker for text highlighting (future enhancement)
export function InlineIssueMarker({ 
  type, 
  message,
  onClick 
}: { 
  type: 'critical' | 'warning';
  message: string;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'relative cursor-pointer group',
        type === 'critical' 
          ? 'underline decoration-red-500 decoration-wavy decoration-2 underline-offset-4'
          : 'underline decoration-amber-500 decoration-wavy decoration-2 underline-offset-4'
      )}
      title={message}
    >
      <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {type === 'critical' ? (
          <AlertCircle className="w-3 h-3 text-red-400" />
        ) : (
          <AlertTriangle className="w-3 h-3 text-amber-400" />
        )}
      </span>
    </span>
  );
}
