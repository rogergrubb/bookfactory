'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChapterIssuesBadgeProps {
  chapterId: string;
  bookId: string;
  className?: string;
  showTooltip?: boolean;
}

interface IssueCount {
  critical: number;
  warning: number;
  total: number;
}

// Cache for issue counts to avoid redundant API calls
const issueCache = new Map<string, { data: IssueCount; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

export function ChapterIssuesBadge({
  chapterId,
  bookId,
  className,
  showTooltip = true,
}: ChapterIssuesBadgeProps) {
  const [issueCounts, setIssueCounts] = useState<IssueCount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      // Check cache first
      const cacheKey = `${bookId}-${chapterId}`;
      const cached = issueCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setIssueCounts(cached.data);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/continuity/${bookId}/issues?chapterId=${chapterId}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        const issues = data.issues || [];
        
        const counts: IssueCount = {
          critical: issues.filter((i: any) => i.severity === 'critical' && i.status === 'open').length,
          warning: issues.filter((i: any) => i.severity === 'warning' && i.status === 'open').length,
          total: issues.filter((i: any) => i.status === 'open').length,
        };
        
        // Cache the result
        issueCache.set(cacheKey, { data: counts, timestamp: Date.now() });
        setIssueCounts(counts);
      } catch (err) {
        console.error('Failed to fetch chapter issues:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [chapterId, bookId]);

  // Don't show anything while loading initially
  if (loading && !issueCounts) {
    return null;
  }

  // Don't show if error or no issues
  if (error || !issueCounts || issueCounts.total === 0) {
    return null;
  }

  const hasCritical = issueCounts.critical > 0;
  const hasWarning = issueCounts.warning > 0;

  return (
    <div
      className={cn(
        'relative group',
        className
      )}
      title={showTooltip ? `${issueCounts.total} continuity issue${issueCounts.total > 1 ? 's' : ''}` : undefined}
    >
      <div className={cn(
        'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium',
        hasCritical 
          ? 'bg-red-500/20 text-red-400' 
          : 'bg-amber-500/20 text-amber-400'
      )}>
        {hasCritical ? (
          <AlertCircle className="w-3 h-3" />
        ) : (
          <AlertTriangle className="w-3 h-3" />
        )}
        <span>{issueCounts.total}</span>
      </div>

      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-stone-800 border border-stone-700 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="flex items-center gap-2">
            {hasCritical && (
              <span className="text-red-400">{issueCounts.critical} critical</span>
            )}
            {hasCritical && hasWarning && <span className="text-stone-500">•</span>}
            {hasWarning && (
              <span className="text-amber-400">{issueCounts.warning} warning{issueCounts.warning > 1 ? 's' : ''}</span>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-stone-700" />
          </div>
        </div>
      )}
    </div>
  );
}

// Bulk loader for efficiency - load all chapters at once
export function useChapterIssuesBulk(bookId: string, chapterIds: string[]) {
  const [issuesByChapter, setIssuesByChapter] = useState<Record<string, IssueCount>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/continuity/${bookId}/issues`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        const issues = data.issues || [];
        
        // Group by chapter
        const byChapter: Record<string, IssueCount> = {};
        
        for (const chapterId of chapterIds) {
          const chapterIssues = issues.filter((i: any) => {
            const locations = i.locations || [];
            return locations.some((loc: any) => loc.chapterId === chapterId);
          });
          
          byChapter[chapterId] = {
            critical: chapterIssues.filter((i: any) => i.severity === 'critical' && i.status === 'open').length,
            warning: chapterIssues.filter((i: any) => i.severity === 'warning' && i.status === 'open').length,
            total: chapterIssues.filter((i: any) => i.status === 'open').length,
          };
        }
        
        setIssuesByChapter(byChapter);
      } catch (err) {
        console.error('Failed to fetch issues:', err);
      } finally {
        setLoading(false);
      }
    };

    if (bookId && chapterIds.length > 0) {
      fetchAll();
    }
  }, [bookId, chapterIds.join(',')]);

  return { issuesByChapter, loading };
}

// Simple inline badge for compact displays
export function ChapterIssuesDot({
  count,
  severity,
  className,
}: {
  count: number;
  severity: 'critical' | 'warning' | 'clear';
  className?: string;
}) {
  if (count === 0 || severity === 'clear') return null;

  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full',
        severity === 'critical' ? 'bg-red-500' : 'bg-amber-500',
        className
      )}
      title={`${count} ${severity} issue${count > 1 ? 's' : ''}`}
    />
  );
}
