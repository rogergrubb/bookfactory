'use client';

import React, { useState } from 'react';
import { 
  GitBranch, Plus, Search, Filter, ChevronRight, ChevronDown,
  Eye, EyeOff, Check, AlertTriangle, HelpCircle, Lightbulb,
  ArrowRight, BookOpen, Clock, Tag, X, Link2
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type ThreadType = 'foreshadowing' | 'promise' | 'mystery' | 'dramatic-irony' | 'chekhovs-gun' | 'setup-payoff' | 'red-herring';
type ThreadStatus = 'planted' | 'hinted' | 'partial' | 'resolved' | 'abandoned';

interface NarrativeThread {
  id: string;
  type: ThreadType;
  planted: {
    chapterId: string;
    chapterNumber: number;
    text: string;
    description: string;
  };
  payoff?: {
    chapterId: string;
    chapterNumber: number;
    text: string;
    description: string;
  };
  status: ThreadStatus;
  notes?: string;
  reminderAtChapter?: number;
}

interface Clue {
  id: string;
  type: 'clue' | 'red-herring';
  chapterNumber: number;
  text: string;
  description: string;
  pointsTo?: string;
  status: 'planted' | 'revealed' | 'abandoned';
}

interface NarrativeThreadTrackerProps {
  bookId: string;
  threads: NarrativeThread[];
  clues: Clue[];
  currentChapter?: number;
  onAddThread: (thread: Omit<NarrativeThread, 'id'>) => void;
  onUpdateThread: (id: string, updates: Partial<NarrativeThread>) => void;
  onDeleteThread: (id: string) => void;
  onAddClue: (clue: Omit<Clue, 'id'>) => void;
  onUpdateClue: (id: string, updates: Partial<Clue>) => void;
}

// ============================================================================
// CONFIG
// ============================================================================

const threadTypeConfig: Record<ThreadType, { label: string; icon: typeof GitBranch; color: string; description: string }> = {
  foreshadowing: { 
    label: 'Foreshadowing', 
    icon: Eye, 
    color: 'violet',
    description: 'Hints at future events'
  },
  promise: { 
    label: 'Promise', 
    icon: Lightbulb, 
    color: 'amber',
    description: 'Implicit promise to reader'
  },
  mystery: { 
    label: 'Mystery', 
    icon: HelpCircle, 
    color: 'blue',
    description: 'Question that needs answering'
  },
  'dramatic-irony': { 
    label: 'Dramatic Irony', 
    icon: EyeOff, 
    color: 'purple',
    description: 'Reader knows, character doesn\'t'
  },
  'chekhovs-gun': { 
    label: "Chekhov's Gun", 
    icon: AlertTriangle, 
    color: 'red',
    description: 'Detail that must be used later'
  },
  'setup-payoff': { 
    label: 'Setup/Payoff', 
    icon: ArrowRight, 
    color: 'teal',
    description: 'Generic setup needing resolution'
  },
  'red-herring': { 
    label: 'Red Herring', 
    icon: EyeOff, 
    color: 'rose',
    description: 'Intentional misdirection'
  },
};

const statusConfig: Record<ThreadStatus, { label: string; color: string; bgColor: string }> = {
  planted: { label: 'Planted', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  hinted: { label: 'Hinted', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  partial: { label: 'Partial', color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-900/30' },
  resolved: { label: 'Resolved', color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  abandoned: { label: 'Abandoned', color: 'text-stone-500', bgColor: 'bg-stone-100 dark:bg-stone-800' },
};

// ============================================================================
// THREAD CARD
// ============================================================================

function ThreadCard({ 
  thread, 
  currentChapter,
  onUpdate,
  onDelete
}: { 
  thread: NarrativeThread;
  currentChapter?: number;
  onUpdate: (updates: Partial<NarrativeThread>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = threadTypeConfig[thread.type];
  const status = statusConfig[thread.status];
  const Icon = config.icon;
  
  // Check if reminder is due
  const reminderDue = thread.reminderAtChapter && 
    currentChapter && 
    currentChapter >= thread.reminderAtChapter && 
    thread.status !== 'resolved';

  return (
    <div className={`
      rounded-xl border transition-all duration-200
      ${reminderDue 
        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' 
        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
      }
    `}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-4 text-left"
      >
        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          bg-${config.color}-100 dark:bg-${config.color}-900/30
        `}>
          <Icon className={`w-5 h-5 text-${config.color}-600 dark:text-${config.color}-400`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`
              px-2 py-0.5 text-xs font-medium rounded-full
              ${status.bgColor} ${status.color}
            `}>
              {status.label}
            </span>
            <span className="text-xs text-stone-500">
              Ch {thread.planted.chapterNumber}
              {thread.payoff && ` → Ch ${thread.payoff.chapterNumber}`}
            </span>
            {reminderDue && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500 text-white animate-pulse">
                Reminder: Resolve by Ch {thread.reminderAtChapter}
              </span>
            )}
          </div>
          
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
            {thread.planted.description}
          </p>
          
          <p className="text-xs text-stone-500 italic line-clamp-1">
            "{thread.planted.text}"
          </p>
        </div>
        
        {/* Expand */}
        <ChevronRight className={`
          w-5 h-5 text-stone-400 transition-transform flex-shrink-0
          ${expanded ? 'rotate-90' : ''}
        `} />
      </button>
      
      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="h-px bg-stone-200 dark:bg-stone-800" />
          
          {/* Planted */}
          <div className="flex gap-4">
            <div className="w-10 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="flex-1 w-0.5 bg-stone-200 dark:bg-stone-700" />
            </div>
            <div className="flex-1 pb-4">
              <p className="text-xs font-medium text-stone-500 mb-1">
                PLANTED — Chapter {thread.planted.chapterNumber}
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-400 italic">
                "{thread.planted.text}"
              </p>
            </div>
          </div>
          
          {/* Payoff (if exists) */}
          {thread.payoff ? (
            <div className="flex gap-4">
              <div className="w-10 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-stone-500 mb-1">
                  PAYOFF — Chapter {thread.payoff.chapterNumber}
                </p>
                <p className="text-sm text-stone-600 dark:text-stone-400 italic">
                  "{thread.payoff.text}"
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="w-10 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full border-2 border-dashed border-stone-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-stone-400">
                  AWAITING PAYOFF
                </p>
                <button
                  onClick={() => {/* Open payoff modal */}}
                  className="mt-2 text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  + Add payoff
                </button>
              </div>
            </div>
          )}
          
          {/* Notes */}
          {thread.notes && (
            <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
              <p className="text-xs font-medium text-stone-500 mb-1">Notes</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {thread.notes}
              </p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <select
              value={thread.status}
              onChange={(e) => onUpdate({ status: e.target.value as ThreadStatus })}
              className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300"
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            
            <button
              onClick={onDelete}
              className="px-3 py-1.5 text-xs rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CLUE TRACKER
// ============================================================================

function ClueCard({ clue }: { clue: Clue }) {
  const isClue = clue.type === 'clue';
  
  return (
    <div className={`
      p-3 rounded-lg border-l-4
      ${isClue 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
      }
    `}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`
              px-2 py-0.5 text-xs font-medium rounded-full
              ${isClue 
                ? 'bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                : 'bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-300'
              }
            `}>
              {isClue ? '🔵 Clue' : '🔴 Red Herring'}
            </span>
            <span className="text-xs text-stone-500">
              Ch {clue.chapterNumber}
            </span>
          </div>
          <p className="text-sm text-stone-700 dark:text-stone-300">
            {clue.description}
          </p>
          {clue.pointsTo && (
            <p className="text-xs text-stone-500 mt-1">
              Points to: {clue.pointsTo}
            </p>
          )}
        </div>
        
        <span className={`
          text-xs font-medium px-2 py-0.5 rounded-full
          ${clue.status === 'planted' 
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            : clue.status === 'revealed'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
          }
        `}>
          {clue.status}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NarrativeThreadTracker({
  bookId,
  threads,
  clues,
  currentChapter,
  onAddThread,
  onUpdateThread,
  onDeleteThread,
  onAddClue,
  onUpdateClue
}: NarrativeThreadTrackerProps) {
  const [activeTab, setActiveTab] = useState<'threads' | 'clues'>('threads');
  const [filterStatus, setFilterStatus] = useState<ThreadStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<ThreadType | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Filter threads
  const filteredThreads = threads.filter(thread => {
    if (filterStatus !== 'all' && thread.status !== filterStatus) return false;
    if (filterType !== 'all' && thread.type !== filterType) return false;
    return true;
  });
  
  // Stats
  const unresolvedCount = threads.filter(t => t.status !== 'resolved' && t.status !== 'abandoned').length;
  const remindersDue = threads.filter(t => 
    t.reminderAtChapter && 
    currentChapter && 
    currentChapter >= t.reminderAtChapter && 
    t.status !== 'resolved'
  ).length;

  return (
    <div className="h-full flex flex-col bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="flex-shrink-0 p-6 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Narrative Threads
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              Track foreshadowing, promises, and payoffs
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Thread</span>
          </button>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <GitBranch className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {unresolvedCount} unresolved
            </span>
          </div>
          
          {remindersDue > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {remindersDue} reminders due
              </span>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4">
          <button
            onClick={() => setActiveTab('threads')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeTab === 'threads'
                ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }
            `}
          >
            <GitBranch className="w-4 h-4 inline mr-2" />
            Threads ({threads.length})
          </button>
          
          <button
            onClick={() => setActiveTab('clues')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeTab === 'clues'
                ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }
            `}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Clues ({clues.length})
          </button>
        </div>
      </header>
      
      {/* Filters */}
      <div className="flex-shrink-0 p-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-stone-400" />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ThreadStatus | 'all')}
            className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
          >
            <option value="all">All Statuses</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ThreadType | 'all')}
            className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
          >
            <option value="all">All Types</option>
            {Object.entries(threadTypeConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'threads' ? (
          <div className="space-y-3">
            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  currentChapter={currentChapter}
                  onUpdate={(updates) => onUpdateThread(thread.id, updates)}
                  onDelete={() => onDeleteThread(thread.id)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <GitBranch className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                  No threads yet
                </h3>
                <p className="text-stone-600 dark:text-stone-400 mb-4">
                  Start tracking your story's foreshadowing and promises
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium"
                >
                  Add First Thread
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Clue Legend */}
            <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-stone-100 dark:bg-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-stone-600 dark:text-stone-400">Clue (leads to truth)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-stone-600 dark:text-stone-400">Red Herring (misleads)</span>
              </div>
            </div>
            
            {clues.length > 0 ? (
              clues.map((clue) => (
                <ClueCard key={clue.id} clue={clue} />
              ))
            ) : (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                  No clues tracked yet
                </h3>
                <p className="text-stone-600 dark:text-stone-400 mb-4">
                  Track clues and red herrings like J.K. Rowling
                </p>
                <button className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium">
                  Add Clue
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
