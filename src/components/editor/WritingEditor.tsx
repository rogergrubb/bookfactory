'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Moon, 
  Sun, 
  Type, 
  AlignLeft, 
  Save,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  Clock,
  BookOpen,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useEditorStore, useBookStore, useAIAssistantStore } from '@/lib/store';
import { cn, countWords, debounce } from '@/lib/utils';

interface WritingEditorProps {
  initialContent?: string;
  chapterTitle?: string;
  chapterNumber?: number;
  onSave?: (content: string) => Promise<void>;
  onContentChange?: (content: string) => void;
}

const THEMES = {
  light: {
    bg: 'bg-white',
    text: 'text-slate-900',
    secondary: 'text-slate-500',
    border: 'border-slate-200',
    highlight: 'bg-violet-50',
  },
  dark: {
    bg: 'bg-slate-950',
    text: 'text-slate-100',
    secondary: 'text-slate-400',
    border: 'border-slate-800',
    highlight: 'bg-violet-950/50',
  },
  sepia: {
    bg: 'bg-amber-50',
    text: 'text-amber-950',
    secondary: 'text-amber-800',
    border: 'border-amber-200',
    highlight: 'bg-amber-100',
  },
  focus: {
    bg: 'bg-slate-900',
    text: 'text-emerald-100',
    secondary: 'text-emerald-500',
    border: 'border-emerald-900',
    highlight: 'bg-emerald-950/50',
  },
};

const FONTS = [
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Merriweather', value: "'Merriweather', serif" },
  { name: 'Lora', value: "'Lora', serif" },
  { name: 'Crimson', value: "'Crimson Text', serif" },
  { name: 'System', value: 'system-ui, sans-serif' },
  { name: 'Monospace', value: "'JetBrains Mono', monospace" },
];

export function WritingEditor({
  initialContent = '',
  chapterTitle = 'Untitled Chapter',
  chapterNumber = 1,
  onSave,
  onContentChange,
}: WritingEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [sessionDuration, setSessionDuration] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    theme,
    fontFamily,
    fontSize,
    lineHeight,
    focusMode,
    typewriterMode,
    setTheme,
    setFontFamily,
    setFontSize,
    setLineHeight,
    toggleFocusMode,
    toggleTypewriterMode,
  } = useEditorStore();
  
  const {
    wordCountGoal,
    sessionWordCount,
    autoSaveEnabled,
    incrementSessionWordCount,
    updateLastSaved,
  } = useBookStore();
  
  const { isGenerating, setIsGenerating } = useAIAssistantStore();

  const themeStyles = THEMES[theme as keyof typeof THEMES];
  const wordCount = countWords(content);
  const goalProgress = Math.min(100, (wordCount / wordCountGoal) * 100);

  // Auto-save with debounce
  const debouncedSave = useCallback(
    debounce(async (text: string) => {
      if (onSave && autoSaveEnabled) {
        setIsSaving(true);
        try {
          await onSave(text);
          updateLastSaved();
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 2000),
    [onSave, autoSaveEnabled]
  );

  // Handle content changes
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const oldWordCount = countWords(content);
    const newWordCount = countWords(newContent);
    
    setContent(newContent);
    onContentChange?.(newContent);
    debouncedSave(newContent);
    
    if (newWordCount > oldWordCount) {
      incrementSessionWordCount(newWordCount - oldWordCount);
    }
  }, [content, onContentChange, debouncedSave, incrementSessionWordCount]);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Format session duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) {
          setIsSaving(true);
          onSave(content).finally(() => {
            setIsSaving(false);
            updateLastSaved();
          });
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        toggleFocusMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, onSave, toggleFocusMode, updateLastSaved]);

  // Typewriter mode scroll
  useEffect(() => {
    if (typewriterMode && textareaRef.current) {
      const textarea = textareaRef.current;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, cursorPosition);
      const lines = textBeforeCursor.split('\n').length;
      const scrollPosition = (lines * lineHeight) - (textarea.clientHeight / 2);
      textarea.scrollTop = Math.max(0, scrollPosition);
    }
  }, [content, typewriterMode]);

  return (
    <div 
      className={cn(
        'relative flex h-screen flex-col transition-all duration-500',
        themeStyles.bg,
        isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Header - Hidden in focus mode */}
      <AnimatePresence>
        {!focusMode && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'flex items-center justify-between border-b px-6 py-4',
              themeStyles.border
            )}
          >
            <div className="flex items-center gap-4">
              <button className={cn('rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800', themeStyles.secondary)}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <p className={cn('text-sm', themeStyles.secondary)}>Chapter {chapterNumber}</p>
                <h1 className={cn('text-xl font-semibold', themeStyles.text)}>{chapterTitle}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className={cn('flex items-center gap-2', themeStyles.secondary)}>
                  <Type className="h-4 w-4" />
                  <span className="text-sm font-medium">{wordCount.toLocaleString()} words</span>
                </div>
                <div className={cn('flex items-center gap-2', themeStyles.secondary)}>
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">{formatDuration(sessionDuration)}</span>
                </div>
              </div>

              {/* Save Status */}
              <div className={cn('flex items-center gap-2', themeStyles.secondary)}>
                {isSaving ? (
                  <>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                    <span className="text-sm">Saving...</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm">Saved</span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAI(!showAI)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 transition-colors',
                    showAI 
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                    themeStyles.secondary
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">AI Assist</span>
                </button>
                
                <button
                  onClick={toggleFocusMode}
                  className={cn(
                    'rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800',
                    themeStyles.secondary
                  )}
                  title="Focus Mode (⌘F)"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    'rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800',
                    themeStyles.secondary
                  )}
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <div className={cn(
            'mx-auto h-full max-w-3xl px-8 py-8',
            focusMode && 'max-w-2xl py-16'
          )}>
            {/* Focus Mode Header */}
            {focusMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 flex items-center justify-between"
              >
                <div className={cn('text-sm', themeStyles.secondary)}>
                  {wordCount.toLocaleString()} words • {formatDuration(sessionDuration)}
                </div>
                <button
                  onClick={toggleFocusMode}
                  className={cn(
                    'rounded-lg p-2 transition-colors hover:bg-slate-100/10',
                    themeStyles.secondary
                  )}
                >
                  <Minimize2 className="h-5 w-5" />
                </button>
              </motion.div>
            )}

            {/* Writing Area */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing your story..."
              className={cn(
                'h-full w-full resize-none bg-transparent outline-none',
                'placeholder:text-slate-300 dark:placeholder:text-slate-600',
                themeStyles.text
              )}
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
              }}
            />
          </div>
        </div>

        {/* AI Assistant Panel */}
        <AnimatePresence>
          {showAI && !focusMode && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                'w-96 border-l overflow-y-auto',
                themeStyles.border,
                themeStyles.bg
              )}
            >
              <div className="p-6">
                <h3 className={cn('mb-4 font-semibold', themeStyles.text)}>AI Writing Assistant</h3>
                
                {/* Quick Actions */}
                <div className="space-y-2">
                  {[
                    { label: 'Continue Writing', icon: BookOpen, prompt: 'continue' },
                    { label: 'Improve Dialogue', icon: Type, prompt: 'dialogue' },
                    { label: 'Add Description', icon: AlignLeft, prompt: 'description' },
                    { label: 'Check Pacing', icon: Target, prompt: 'pacing' },
                  ].map((action) => (
                    <button
                      key={action.prompt}
                      disabled={isGenerating}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                        'hover:border-violet-300 hover:bg-violet-50 dark:hover:border-violet-700 dark:hover:bg-violet-950/50',
                        themeStyles.border,
                        isGenerating && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <action.icon className={cn('h-5 w-5', themeStyles.secondary)} />
                      <span className={cn('text-sm font-medium', themeStyles.text)}>
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Prompt */}
                <div className="mt-6">
                  <label className={cn('text-sm font-medium', themeStyles.secondary)}>
                    Custom Request
                  </label>
                  <textarea
                    placeholder="Ask AI to help with anything..."
                    className={cn(
                      'mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none',
                      'focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
                      themeStyles.border,
                      themeStyles.bg,
                      themeStyles.text
                    )}
                    rows={3}
                  />
                  <button
                    className="mt-3 w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
                  >
                    Generate with AI
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && !focusMode && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                'w-80 border-l overflow-y-auto',
                themeStyles.border,
                themeStyles.bg
              )}
            >
              <div className="p-6">
                <h3 className={cn('mb-6 font-semibold', themeStyles.text)}>Editor Settings</h3>
                
                {/* Theme */}
                <div className="mb-6">
                  <label className={cn('mb-2 block text-sm font-medium', themeStyles.secondary)}>
                    Theme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['light', 'dark', 'sepia', 'focus'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          'aspect-square rounded-lg border-2 transition-all',
                          theme === t ? 'border-violet-500 ring-2 ring-violet-500/20' : themeStyles.border,
                          t === 'light' && 'bg-white',
                          t === 'dark' && 'bg-slate-900',
                          t === 'sepia' && 'bg-amber-100',
                          t === 'focus' && 'bg-slate-800'
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Font */}
                <div className="mb-6">
                  <label className={cn('mb-2 block text-sm font-medium', themeStyles.secondary)}>
                    Font
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className={cn(
                      'w-full rounded-lg border px-3 py-2 text-sm',
                      themeStyles.border,
                      themeStyles.bg,
                      themeStyles.text
                    )}
                  >
                    {FONTS.map((f) => (
                      <option key={f.name} value={f.value}>{f.name}</option>
                    ))}
                  </select>
                </div>

                {/* Font Size */}
                <div className="mb-6">
                  <label className={cn('mb-2 block text-sm font-medium', themeStyles.secondary)}>
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Line Height */}
                <div className="mb-6">
                  <label className={cn('mb-2 block text-sm font-medium', themeStyles.secondary)}>
                    Line Height: {lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1.2"
                    max="2.5"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Typewriter Mode */}
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm font-medium', themeStyles.secondary)}>
                    Typewriter Mode
                  </span>
                  <button
                    onClick={toggleTypewriterMode}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition-colors',
                      typewriterMode ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                        typewriterMode && 'translate-x-5'
                      )}
                    />
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Progress Bar - Hidden in focus mode */}
      <AnimatePresence>
        {!focusMode && (
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn('border-t px-6 py-3', themeStyles.border)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={cn('text-sm', themeStyles.secondary)}>
                  Session: +{sessionWordCount} words
                </span>
                <span className={cn('text-sm', themeStyles.secondary)}>
                  Goal: {wordCount.toLocaleString()} / {wordCountGoal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-48 rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goalProgress}%` }}
                    className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600"
                  />
                </div>
                <span className={cn('text-sm font-medium', themeStyles.secondary)}>
                  {Math.round(goalProgress)}%
                </span>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WritingEditor;
