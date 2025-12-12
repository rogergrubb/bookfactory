'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, RotateCcw, Star, StarOff, Copy, Check, 
  ChevronDown, ChevronRight, Trash2, Eye, Clock,
  ArrowRight, Diff, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface GenerationRecord {
  id: string;
  toolId: string;
  toolName: string;
  subOptionId?: string;
  subOptionName?: string;
  input: string;
  output: string;
  tokensUsed: number;
  timestamp: Date;
  isFavorite: boolean;
  chapterId?: string;
  chapterTitle?: string;
}

interface GenerationHistoryProps {
  chapterId?: string;
  bookId?: string;
  onRestore: (output: string) => void;
  onCompare?: (a: GenerationRecord, b: GenerationRecord) => void;
  className?: string;
}

export function GenerationHistory({ 
  chapterId, 
  bookId, 
  onRestore,
  onCompare,
  className 
}: GenerationHistoryProps) {
  const [records, setRecords] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<GenerationRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    fetchHistory();
  }, [chapterId, bookId]);

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (chapterId) params.append('chapterId', chapterId);
      if (bookId) params.append('bookId', bookId);
      params.append('limit', '50');

      const response = await fetch(`/api/ai/history?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch generation history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = useCallback(async (record: GenerationRecord) => {
    await navigator.clipboard.writeText(record.output);
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleToggleFavorite = useCallback(async (record: GenerationRecord) => {
    try {
      await fetch(`/api/ai/history/${record.id}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !record.isFavorite }),
      });
      setRecords(prev => prev.map(r => 
        r.id === record.id ? { ...r, isFavorite: !r.isFavorite } : r
      ));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, []);

  const handleDelete = useCallback(async (record: GenerationRecord) => {
    if (!confirm('Delete this generation from history?')) return;
    
    try {
      await fetch(`/api/ai/history/${record.id}`, { method: 'DELETE' });
      setRecords(prev => prev.filter(r => r.id !== record.id));
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  }, []);

  const handleCompareSelect = useCallback((record: GenerationRecord) => {
    setCompareSelection(prev => {
      if (prev.find(r => r.id === record.id)) {
        return prev.filter(r => r.id !== record.id);
      }
      if (prev.length >= 2) {
        return [prev[1], record];
      }
      return [...prev, record];
    });
  }, []);

  const toolColors: Record<string, string> = {
    generate: 'text-emerald-400',
    enhance: 'text-blue-400',
    analyze: 'text-amber-400',
    brainstorm: 'text-purple-400',
    world: 'text-rose-400',
  };

  const getToolCategory = (toolId: string): string => {
    const generateTools = ['continue', 'firstdraft', 'dialogue', 'description', 'action', 'thoughts'];
    const enhanceTools = ['expand', 'condense', 'rewrite', 'polish'];
    const analyzeTools = ['pacing', 'voice-check', 'tension-map'];
    const brainstormTools = ['plot-ideas', 'character-moments', 'twist-generator'];
    
    if (generateTools.some(t => toolId.includes(t))) return 'generate';
    if (enhanceTools.some(t => toolId.includes(t))) return 'enhance';
    if (analyzeTools.some(t => toolId.includes(t))) return 'analyze';
    if (brainstormTools.some(t => toolId.includes(t))) return 'brainstorm';
    return 'world';
  };

  const filteredRecords = filter === 'favorites' 
    ? records.filter(r => r.isFavorite) 
    : records;

  if (loading) {
    return (
      <div className={cn('p-4 space-y-2', className)}>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-stone-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
        <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
          <History className="w-4 h-4 text-teal-400" />
          Generation History
          <span className="text-xs text-stone-500">({records.length})</span>
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex items-center gap-1 bg-stone-800 rounded-lg p-0.5">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-2 py-1 text-xs rounded-md transition-colors',
                filter === 'all' ? 'bg-stone-700 text-stone-200' : 'text-stone-400'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={cn(
                'px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1',
                filter === 'favorites' ? 'bg-stone-700 text-stone-200' : 'text-stone-400'
              )}
            >
              <Star className="w-3 h-3" />
            </button>
          </div>

          {/* Compare Mode Toggle */}
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareSelection([]);
            }}
            className={cn(
              'px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1',
              compareMode 
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            )}
          >
            <Diff className="w-3 h-3" />
            Compare
          </button>
        </div>
      </div>

      {/* Compare Bar */}
      {compareMode && compareSelection.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 border-b border-teal-500/30">
          <span className="text-xs text-teal-400">
            {compareSelection.length}/2 selected
          </span>
          {compareSelection.length === 2 && onCompare && (
            <button
              onClick={() => onCompare(compareSelection[0], compareSelection[1])}
              className="px-2 py-1 text-xs bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Compare Now
            </button>
          )}
          <button
            onClick={() => setCompareSelection([])}
            className="ml-auto text-xs text-stone-400 hover:text-stone-200"
          >
            Clear
          </button>
        </div>
      )}

      {/* Records List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-500">
            <History className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No generations yet</p>
            <p className="text-xs">Your AI generations will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-800/50">
            {filteredRecords.map((record) => {
              const isExpanded = expandedId === record.id;
              const isSelected = compareSelection.find(r => r.id === record.id);
              const category = getToolCategory(record.toolId);

              return (
                <div
                  key={record.id}
                  className={cn(
                    'transition-colors',
                    isSelected && 'bg-teal-500/10',
                    !isSelected && 'hover:bg-stone-800/30'
                  )}
                >
                  {/* Record Header */}
                  <div 
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => compareMode 
                      ? handleCompareSelect(record) 
                      : setExpandedId(isExpanded ? null : record.id)
                    }
                  >
                    {compareMode ? (
                      <div className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                        isSelected 
                          ? 'bg-teal-500 border-teal-500' 
                          : 'border-stone-600'
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : record.id);
                        }}
                        className="text-stone-500"
                      >
                        {isExpanded 
                          ? <ChevronDown className="w-4 h-4" /> 
                          : <ChevronRight className="w-4 h-4" />
                        }
                      </button>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-medium', toolColors[category])}>
                          {record.toolName}
                        </span>
                        {record.subOptionName && (
                          <>
                            <ArrowRight className="w-3 h-3 text-stone-600" />
                            <span className="text-xs text-stone-400">
                              {record.subOptionName}
                            </span>
                          </>
                        )}
                        {record.isFavorite && (
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-stone-600">•</span>
                        <span className="text-xs text-stone-500 font-mono">
                          {record.tokensUsed} tokens
                        </span>
                      </div>
                    </div>

                    {!compareMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestore(record.output);
                        }}
                        className="px-2 py-1 text-xs bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restore
                      </button>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && !compareMode && (
                    <div className="px-4 pb-4 space-y-3">
                      {/* Output Preview */}
                      <div className="relative">
                        <div className="p-3 bg-stone-900 rounded-lg border border-stone-700/50 text-sm text-stone-300 max-h-48 overflow-y-auto">
                          {record.output}
                        </div>
                        
                        {/* Actions */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(record)}
                            className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedId === record.id 
                              ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                              : <Copy className="w-3.5 h-3.5 text-stone-400" />
                            }
                          </button>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFavorite(record)}
                          className={cn(
                            'flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors',
                            record.isFavorite
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                          )}
                        >
                          {record.isFavorite 
                            ? <Star className="w-3 h-3 fill-current" />
                            : <StarOff className="w-3 h-3" />
                          }
                          {record.isFavorite ? 'Favorited' : 'Favorite'}
                        </button>
                        
                        <button
                          onClick={() => onRestore(record.output)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Insert at Cursor
                        </button>

                        <button
                          onClick={() => handleDelete(record)}
                          className="ml-auto flex items-center gap-1 px-2 py-1 text-xs text-stone-500 hover:text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for inline use
export function GenerationHistoryInline({ 
  records, 
  onRestore 
}: { 
  records: GenerationRecord[]; 
  onRestore: (output: string) => void;
}) {
  if (records.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1">
      <span className="text-xs text-stone-500 shrink-0">Previous:</span>
      {records.slice(0, 5).map((record, idx) => (
        <button
          key={record.id}
          onClick={() => onRestore(record.output)}
          className="px-2 py-1 text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg shrink-0 transition-colors"
          title={record.output.slice(0, 100) + '...'}
        >
          v{records.length - idx}
        </button>
      ))}
    </div>
  );
}
