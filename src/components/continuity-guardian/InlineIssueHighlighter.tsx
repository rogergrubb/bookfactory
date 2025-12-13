'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, AlertCircle, X, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Issue {
  type: string;
  severity: 'critical' | 'warning';
  title: string;
  description: string;
  excerpt: string;
  suggestion?: string;
  startIndex?: number;
  endIndex?: number;
}

interface InlineIssueHighlighterProps {
  content: string;
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
  className?: string;
}

// Highlight text with wavy underlines for issues
export function InlineIssueHighlighter({
  content,
  issues,
  onIssueClick,
  className,
}: InlineIssueHighlighterProps) {
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Find issue positions in content
  const issuesWithPositions = useMemo(() => {
    return issues.map(issue => {
      if (issue.startIndex !== undefined && issue.endIndex !== undefined) {
        return issue;
      }
      
      // Try to find excerpt in content
      if (issue.excerpt) {
        const index = content.toLowerCase().indexOf(issue.excerpt.toLowerCase());
        if (index !== -1) {
          return {
            ...issue,
            startIndex: index,
            endIndex: index + issue.excerpt.length,
          };
        }
      }
      
      return issue;
    }).filter(i => i.startIndex !== undefined);
  }, [content, issues]);

  // Sort by position for proper rendering
  const sortedIssues = useMemo(() => {
    return [...issuesWithPositions].sort((a, b) => 
      (a.startIndex || 0) - (b.startIndex || 0)
    );
  }, [issuesWithPositions]);

  // Build segments with highlighting
  const segments = useMemo(() => {
    if (sortedIssues.length === 0) {
      return [{ type: 'text' as const, content }];
    }

    const result: Array<
      | { type: 'text'; content: string }
      | { type: 'issue'; content: string; issue: Issue }
    > = [];
    
    let lastEnd = 0;
    
    for (const issue of sortedIssues) {
      const start = issue.startIndex || 0;
      const end = issue.endIndex || start;
      
      // Add text before this issue
      if (start > lastEnd) {
        result.push({
          type: 'text',
          content: content.slice(lastEnd, start),
        });
      }
      
      // Add the issue highlight
      if (start < content.length) {
        result.push({
          type: 'issue',
          content: content.slice(start, Math.min(end, content.length)),
          issue,
        });
      }
      
      lastEnd = end;
    }
    
    // Add remaining text
    if (lastEnd < content.length) {
      result.push({
        type: 'text',
        content: content.slice(lastEnd),
      });
    }
    
    return result;
  }, [content, sortedIssues]);

  const handleMouseEnter = (e: React.MouseEvent, issue: Issue) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setHoveredIssue(issue);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Rendered content with highlights */}
      <div className="whitespace-pre-wrap">
        {segments.map((segment, idx) => {
          if (segment.type === 'text') {
            return <span key={idx}>{segment.content}</span>;
          }
          
          const isCritical = segment.issue.severity === 'critical';
          
          return (
            <span
              key={idx}
              className={cn(
                'relative cursor-pointer transition-colors',
                isCritical
                  ? 'decoration-red-500 hover:bg-red-500/10'
                  : 'decoration-amber-500 hover:bg-amber-500/10',
                // Wavy underline style
                'underline decoration-wavy decoration-2 underline-offset-4'
              )}
              onMouseEnter={(e) => handleMouseEnter(e, segment.issue)}
              onMouseLeave={() => setHoveredIssue(null)}
              onClick={() => onIssueClick?.(segment.issue)}
            >
              {segment.content}
            </span>
          );
        })}
      </div>

      {/* Hover Tooltip */}
      {hoveredIssue && (
        <IssueTooltip
          issue={hoveredIssue}
          x={tooltipPosition.x}
          y={tooltipPosition.y}
          onClose={() => setHoveredIssue(null)}
        />
      )}
    </div>
  );
}

// Tooltip for issue details
function IssueTooltip({
  issue,
  x,
  y,
  onClose,
}: {
  issue: Issue;
  x: number;
  y: number;
  onClose: () => void;
}) {
  const isCritical = issue.severity === 'critical';

  return (
    <div
      className="fixed z-50 w-72 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-150"
      style={{
        left: Math.min(x - 144, window.innerWidth - 300),
        top: y - 8,
        transform: 'translateY(-100%)',
      }}
    >
      {/* Header */}
      <div className={cn(
        'px-3 py-2 flex items-start gap-2',
        isCritical ? 'bg-red-500/10' : 'bg-amber-500/10'
      )}>
        {isCritical ? (
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium',
            isCritical ? 'text-red-300' : 'text-amber-300'
          )}>
            {issue.title}
          </p>
          <p className="text-xs text-stone-500 capitalize">
            {issue.type.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="px-3 py-2">
        <p className="text-xs text-stone-400">{issue.description}</p>
      </div>

      {/* Suggestion */}
      {issue.suggestion && (
        <div className="px-3 py-2 bg-blue-500/5 border-t border-stone-800">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">{issue.suggestion}</p>
          </div>
        </div>
      )}

      {/* Arrow */}
      <div 
        className={cn(
          'absolute left-1/2 -translate-x-1/2 top-full w-3 h-3 rotate-45 -mt-1.5',
          'bg-stone-900 border-r border-b border-stone-700'
        )}
      />
    </div>
  );
}

// CSS styles for wavy underline (add to global styles if not using Tailwind)
export const wavyUnderlineStyles = `
.decoration-wavy {
  text-decoration-style: wavy;
}
`;

// Hook for managing issue highlights in editor
export function useIssueHighlights(bookId: string, content: string) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced check
  useEffect(() => {
    if (!content || content.length < 100) {
      setIssues([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/continuity/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId,
            content: content.slice(-3000),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setIssues(data.issues || []);
        }
      } catch (err) {
        console.error('Issue check failed:', err);
      } finally {
        setLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [bookId, content]);

  return { issues, loading };
}
