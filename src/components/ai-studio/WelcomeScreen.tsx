'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, FileText, Edit3, Sparkles, Upload, Clock, 
  ArrowRight, BookOpen, PenTool, Wand2, ChevronRight,
  Flame, Target, TrendingUp
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type EntryPoint = 'idea' | 'notes' | 'draft' | 'finished';

interface WelcomeScreenProps {
  userName: string;
  onStartJourney: (entryPoint: EntryPoint, input?: string) => void;
  onContinueProject?: (projectId: string) => void;
  onDropFile?: (file: File) => void;
  recentProjects?: {
    id: string;
    title: string;
    lastEdited: Date;
    wordCount: number;
    progress: number;
  }[];
  writingStreak?: number;
  dailyGoal?: number;
  wordsToday?: number;
}

// ============================================================================
// HELPER: Get time-aware greeting
// ============================================================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WelcomeScreen({
  userName,
  onStartJourney,
  onContinueProject,
  onDropFile,
  recentProjects = [],
  writingStreak = 0,
  dailyGoal = 2000,
  wordsToday = 0
}: WelcomeScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showEntryPoints, setShowEntryPoints] = useState(false);
  
  const greeting = getGreeting();
  const goalProgress = Math.min((wordsToday / dailyGoal) * 100, 100);
  
  // Entry point options
  const entryPoints: {
    id: EntryPoint;
    icon: typeof Lightbulb;
    title: string;
    description: string;
    gradient: string;
    iconBg: string;
  }[] = [
    {
      id: 'idea',
      icon: Lightbulb,
      title: 'I have an idea',
      description: 'A concept, theme, or "what if" — let\'s develop it together',
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30'
    },
    {
      id: 'notes',
      icon: FileText,
      title: 'I have notes or an outline',
      description: 'Character sketches, plot beats, world details — ready to expand',
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      id: 'draft',
      icon: Edit3,
      title: 'I have a draft',
      description: 'Rough or complete — let\'s enhance and refine it',
      gradient: 'from-teal-500 to-emerald-600',
      iconBg: 'bg-teal-100 dark:bg-teal-900/30'
    },
    {
      id: 'finished',
      icon: Sparkles,
      title: 'I have a finished manuscript',
      description: 'Polish, analyze, or prepare for publishing',
      gradient: 'from-violet-500 to-purple-600',
      iconBg: 'bg-violet-100 dark:bg-violet-900/30'
    }
  ];
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && onDropFile) {
      onDropFile(file);
    }
  };
  
  // Handle input submit
  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      // Determine entry point based on input
      setShowEntryPoints(true);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8 bg-stone-50 dark:bg-stone-950"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-teal-600/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 shadow-2xl border-2 border-dashed border-teal-500">
            <Upload className="w-16 h-16 text-teal-600 mx-auto mb-4" />
            <p className="text-xl font-medium text-stone-900 dark:text-stone-100">
              Drop your manuscript here
            </p>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="w-full max-w-3xl">
        {/* Stats Row (if user has activity) */}
        {(writingStreak > 0 || wordsToday > 0) && (
          <div className="flex items-center justify-center gap-6 mb-12">
            {writingStreak > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Flame className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {writingStreak} day streak
                </span>
              </div>
            )}
            
            {dailyGoal > 0 && (
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-teal-600" />
                <div className="w-32 h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
                <span className="text-sm text-stone-600 dark:text-stone-400">
                  {wordsToday.toLocaleString()} / {dailyGoal.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Greeting */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-stone-900 dark:text-stone-100 mb-4"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            {greeting}, <span className="font-medium">{userName}</span>.
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-400">
            How may I help you today?
          </p>
        </div>
        
        {/* Main Input */}
        {!showEntryPoints && (
          <div className="mb-12">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                placeholder="I'm working on a story about..."
                className="
                  w-full px-6 py-5 text-lg
                  bg-white dark:bg-stone-900 
                  border border-stone-200 dark:border-stone-800
                  rounded-2xl shadow-sm
                  text-stone-900 dark:text-stone-100
                  placeholder:text-stone-400 dark:placeholder:text-stone-600
                  focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500
                  transition-all duration-200
                "
              />
              {inputValue && (
                <button
                  onClick={handleInputSubmit}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    px-4 py-2 rounded-xl
                    bg-teal-600 hover:bg-teal-700 
                    text-white font-medium text-sm
                    flex items-center gap-2
                    transition-colors duration-200
                  "
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setShowEntryPoints(true)}
                className="
                  flex items-center gap-2 px-4 py-2.5 rounded-xl
                  text-sm text-stone-600 dark:text-stone-400
                  hover:bg-stone-100 dark:hover:bg-stone-900
                  transition-colors duration-200
                "
              >
                <Upload className="w-4 h-4" />
                Drop a manuscript
              </button>
              
              {recentProjects.length > 0 && (
                <button
                  onClick={() => onContinueProject?.(recentProjects[0].id)}
                  className="
                    flex items-center gap-2 px-4 py-2.5 rounded-xl
                    text-sm text-stone-600 dark:text-stone-400
                    hover:bg-stone-100 dark:hover:bg-stone-900
                    transition-colors duration-200
                  "
                >
                  <Clock className="w-4 h-4" />
                  Continue where I left off
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Entry Points */}
        {showEntryPoints && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-medium text-stone-900 dark:text-stone-100 mb-2">
                Where are you in your journey?
              </h2>
              <p className="text-stone-600 dark:text-stone-400">
                Choose your starting point — you can always switch later
              </p>
            </div>
            
            <div className="space-y-3">
              {entryPoints.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onStartJourney(entry.id, inputValue)}
                  className="
                    w-full p-5 rounded-2xl
                    bg-white dark:bg-stone-900
                    border border-stone-200 dark:border-stone-800
                    hover:border-teal-500 dark:hover:border-teal-500
                    hover:shadow-lg hover:shadow-teal-500/10
                    transition-all duration-200
                    flex items-center gap-5 text-left
                    group
                  "
                >
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center
                    ${entry.iconBg}
                    group-hover:scale-110 transition-transform duration-200
                  `}>
                    <entry.icon className={`w-7 h-7 bg-gradient-to-br ${entry.gradient} bg-clip-text text-transparent`} 
                                style={{ color: entry.id === 'idea' ? '#f59e0b' : entry.id === 'notes' ? '#3b82f6' : entry.id === 'draft' ? '#14b8a6' : '#8b5cf6' }} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-1">
                      {entry.title}
                    </h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      {entry.description}
                    </p>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-200" />
                </button>
              ))}
            </div>
            
            {/* Back button */}
            <button
              onClick={() => setShowEntryPoints(false)}
              className="
                mt-6 mx-auto block px-4 py-2
                text-sm text-stone-500 hover:text-stone-700
                transition-colors duration-200
              "
            >
              ← Back
            </button>
          </div>
        )}
        
        {/* Recent Projects */}
        {recentProjects.length > 0 && !showEntryPoints && (
          <div className="mt-16">
            <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-4">
              Recent Projects
            </h3>
            <div className="grid gap-3">
              {recentProjects.slice(0, 3).map((project) => (
                <button
                  key={project.id}
                  onClick={() => onContinueProject?.(project.id)}
                  className="
                    p-4 rounded-xl
                    bg-white dark:bg-stone-900
                    border border-stone-200 dark:border-stone-800
                    hover:border-teal-500 dark:hover:border-teal-500
                    transition-all duration-200
                    flex items-center gap-4 text-left
                    group
                  "
                >
                  <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-stone-900 dark:text-stone-100 truncate">
                      {project.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-stone-500">
                      <span>{project.wordCount.toLocaleString()} words</span>
                      <span>•</span>
                      <span>
                        {new Date(project.lastEdited).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-24">
                    <div className="h-1.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-stone-500 mt-1 text-right">
                      {project.progress}%
                    </p>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-teal-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <p className="text-xs text-stone-400 flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">⌘K</kbd>
          <span>Quick actions</span>
        </p>
      </div>
    </div>
  );
}
