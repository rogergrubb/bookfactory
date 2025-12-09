'use client';

import React, { useState } from 'react';
import { 
  Shield, AlertTriangle, AlertCircle, Info, Check, X, 
  RefreshCw, ChevronRight, ChevronDown, Eye, EyeOff,
  User, MapPin, Clock, Sparkles, BookOpen, Filter,
  Zap, Search
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type AlertSeverity = 'error' | 'warning' | 'info';
type AlertType = 
  | 'physical-description' 
  | 'character-location' 
  | 'timeline' 
  | 'character-knowledge'
  | 'object-placement'
  | 'relationship'
  | 'world-rule'
  | 'death'
  | 'name'
  | 'age';

type AlertStatus = 'active' | 'ignored' | 'resolved';

interface ContinuityAlert {
  id: string;
  severity: AlertSeverity;
  type: AlertType;
  location: {
    chapterId: string;
    chapterNumber: number;
    lineNumber?: number;
    text: string;
  };
  conflictsWith: {
    source: 'story-bible' | 'chapter' | 'timeline';
    reference: string;
    originalText: string;
    description: string;
  };
  status: AlertStatus;
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

interface ContinuityGuardianProps {
  bookId: string;
  alerts: ContinuityAlert[];
  isScanning: boolean;
  lastScanAt?: Date;
  onScan: () => void;
  onResolve: (alertId: string, resolution: string) => void;
  onIgnore: (alertId: string) => void;
  onJumpTo: (chapterId: string, lineNumber?: number) => void;
  onUpdateStoryBible: (alertId: string, update: any) => void;
}

// ============================================================================
// CONFIG
// ============================================================================

const severityConfig: Record<AlertSeverity, { icon: typeof AlertTriangle; color: string; bgColor: string; label: string }> = {
  error: { 
    icon: AlertCircle, 
    color: 'text-red-600 dark:text-red-400', 
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Error'
  },
  warning: { 
    icon: AlertTriangle, 
    color: 'text-amber-600 dark:text-amber-400', 
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    label: 'Warning'
  },
  info: { 
    icon: Info, 
    color: 'text-blue-600 dark:text-blue-400', 
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Info'
  },
};

const typeConfig: Record<AlertType, { icon: typeof User; label: string; description: string }> = {
  'physical-description': { icon: User, label: 'Physical Description', description: 'Character appearance changed' },
  'character-location': { icon: MapPin, label: 'Character Location', description: 'Character in impossible location' },
  'timeline': { icon: Clock, label: 'Timeline', description: 'Date/time inconsistency' },
  'character-knowledge': { icon: Eye, label: 'Character Knowledge', description: 'Character knows something they shouldn\'t' },
  'object-placement': { icon: Sparkles, label: 'Object Placement', description: 'Object moved without explanation' },
  'relationship': { icon: User, label: 'Relationship', description: 'Relationship contradiction' },
  'world-rule': { icon: Sparkles, label: 'World Rule', description: 'Magic/tech rule violated' },
  'death': { icon: AlertCircle, label: 'Death', description: 'Dead character appears alive' },
  'name': { icon: User, label: 'Name', description: 'Name spelled differently' },
  'age': { icon: Clock, label: 'Age', description: 'Age inconsistency' },
};

// ============================================================================
// ALERT CARD
// ============================================================================

function AlertCard({
  alert,
  onResolve,
  onIgnore,
  onJumpTo,
  onUpdateStoryBible
}: {
  alert: ContinuityAlert;
  onResolve: (resolution: string) => void;
  onIgnore: () => void;
  onJumpTo: () => void;
  onUpdateStoryBible: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showResolveInput, setShowResolveInput] = useState(false);
  const [resolution, setResolution] = useState('');
  
  const severity = severityConfig[alert.severity];
  const type = typeConfig[alert.type];
  const SeverityIcon = severity.icon;
  const TypeIcon = type.icon;

  return (
    <div className={`
      rounded-xl border transition-all duration-200
      ${alert.status === 'ignored' 
        ? 'opacity-50 border-stone-200 dark:border-stone-800' 
        : alert.status === 'resolved'
        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10'
        : `border-stone-200 dark:border-stone-800 ${severity.bgColor}`
      }
    `}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-4 text-left"
      >
        {/* Severity Icon */}
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${severity.bgColor}
        `}>
          <SeverityIcon className={`w-5 h-5 ${severity.color}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`
              px-2 py-0.5 text-xs font-medium rounded-full
              ${severity.bgColor} ${severity.color}
            `}>
              {severity.label}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
              {type.label}
            </span>
            <span className="text-xs text-stone-500">
              Chapter {alert.location.chapterNumber}
              {alert.location.lineNumber && `, line ${alert.location.lineNumber}`}
            </span>
            {alert.status === 'resolved' && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                ✓ Resolved
              </span>
            )}
            {alert.status === 'ignored' && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400">
                Ignored
              </span>
            )}
          </div>
          
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
            {alert.conflictsWith.description}
          </p>
          
          <p className="text-xs text-stone-500 italic line-clamp-1">
            "{alert.location.text}"
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
          <div className="h-px bg-stone-200 dark:bg-stone-700" />
          
          {/* Conflict Details */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Current Text */}
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                <X className="w-3 h-3" />
                IN YOUR TEXT (Ch {alert.location.chapterNumber})
              </p>
              <p className="text-sm text-stone-700 dark:text-stone-300 italic">
                "{alert.location.text}"
              </p>
            </div>
            
            {/* Original/Conflict */}
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {alert.conflictsWith.source === 'story-bible' ? 'IN STORY BIBLE' : 
                 alert.conflictsWith.source === 'chapter' ? 'IN EARLIER CHAPTER' : 'IN TIMELINE'}
              </p>
              <p className="text-sm text-stone-700 dark:text-stone-300 italic">
                "{alert.conflictsWith.originalText}"
              </p>
            </div>
          </div>
          
          {/* Resolution (if resolved) */}
          {alert.status === 'resolved' && alert.resolution && (
            <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800">
              <p className="text-xs font-medium text-stone-500 mb-1">Resolution</p>
              <p className="text-sm text-stone-700 dark:text-stone-300">
                {alert.resolution}
              </p>
            </div>
          )}
          
          {/* Resolve Input */}
          {showResolveInput && alert.status === 'active' && (
            <div className="space-y-2">
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="How did you resolve this? (optional)"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onResolve(resolution);
                    setShowResolveInput(false);
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => setShowResolveInput(false)}
                  className="px-3 py-1.5 text-sm rounded-lg text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Actions */}
          {alert.status === 'active' && !showResolveInput && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={onJumpTo}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                <BookOpen className="w-4 h-4" />
                Jump to Text
              </button>
              
              <button
                onClick={() => setShowResolveInput(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
              >
                <Check className="w-4 h-4" />
                Resolve
              </button>
              
              <button
                onClick={onUpdateStoryBible}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50"
              >
                <Sparkles className="w-4 h-4" />
                Update Story Bible
              </button>
              
              <button
                onClick={onIgnore}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <EyeOff className="w-4 h-4" />
                Ignore
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ContinuityGuardian({
  bookId,
  alerts,
  isScanning,
  lastScanAt,
  onScan,
  onResolve,
  onIgnore,
  onJumpTo,
  onUpdateStoryBible
}: ContinuityGuardianProps) {
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
  const [filterType, setFilterType] = useState<AlertType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterType !== 'all' && alert.type !== filterType) return false;
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
    if (searchQuery && !alert.location.text.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !alert.conflictsWith.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  // Stats
  const errorCount = alerts.filter(a => a.severity === 'error' && a.status === 'active').length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && a.status === 'active').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  return (
    <div className="h-full flex flex-col bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="flex-shrink-0 p-6 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Continuity Guardian
              </h1>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                AI-powered consistency checking
              </p>
            </div>
          </div>
          
          <button
            onClick={onScan}
            disabled={isScanning}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
              ${isScanning 
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-500 cursor-not-allowed' 
                : 'bg-teal-600 hover:bg-teal-700 text-white'
              }
            `}
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
        
        {/* Stats Bar */}
        <div className="flex items-center gap-4">
          {errorCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {errorCount} errors
              </span>
            </div>
          )}
          
          {warningCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {warningCount} warnings
              </span>
            </div>
          )}
          
          {resolvedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {resolvedCount} resolved
              </span>
            </div>
          )}
          
          {errorCount === 0 && warningCount === 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                All clear!
              </span>
            </div>
          )}
          
          {lastScanAt && (
            <span className="text-xs text-stone-500 ml-auto">
              Last scan: {new Date(lastScanAt).toLocaleString()}
            </span>
          )}
        </div>
      </header>
      
      {/* Filters */}
      <div className="flex-shrink-0 p-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alerts..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm"
            />
          </div>
          
          <Filter className="w-4 h-4 text-stone-400" />
          
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as AlertSeverity | 'all')}
            className="px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
          >
            <option value="all">All Severities</option>
            <option value="error">🔴 Errors</option>
            <option value="warning">🟡 Warnings</option>
            <option value="info">🔵 Info</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AlertType | 'all')}
            className="px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
          >
            <option value="all">All Types</option>
            {Object.entries(typeConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as AlertStatus | 'all')}
            className="px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredAlerts.length > 0 ? (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onResolve={(resolution) => onResolve(alert.id, resolution)}
                onIgnore={() => onIgnore(alert.id)}
                onJumpTo={() => onJumpTo(alert.location.chapterId, alert.location.lineNumber)}
                onUpdateStoryBible={() => onUpdateStoryBible(alert.id, {})}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-emerald-300 dark:text-emerald-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-stone-900 dark:text-stone-100 mb-2">
              {alerts.length === 0 ? 'No Issues Found' : 'No Matching Alerts'}
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-md mx-auto">
              {alerts.length === 0 
                ? 'Your story is consistent! Run a scan to check for new issues as you write.'
                : 'Try adjusting your filters to see other alerts.'
              }
            </p>
            {alerts.length === 0 && (
              <button
                onClick={onScan}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                Run First Scan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
