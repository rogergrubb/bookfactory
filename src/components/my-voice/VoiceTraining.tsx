'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Mic, Upload, FileText, Sparkles, ChevronRight, ChevronDown,
  Plus, X, Loader2, Check, AlertCircle, BookOpen, Trash2,
  Wand2, Eye, Settings, BarChart3, User, Clock, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrainingSample {
  id: string;
  source: 'paste' | 'upload' | 'chapter';
  sourceName: string;
  text: string;
  wordCount: number;
  addedAt: Date;
}

interface VoiceTrainingProps {
  onTrainingComplete: (voiceId: string) => void;
  existingChapters?: { id: string; title: string; content: string }[];
  className?: string;
}

export function VoiceTraining({
  onTrainingComplete,
  existingChapters = [],
  className
}: VoiceTrainingProps) {
  const [samples, setSamples] = useState<TrainingSample[]>([]);
  const [voiceName, setVoiceName] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingPhase, setTrainingPhase] = useState<string>('');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteName, setPasteName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalWordCount = samples.reduce((sum, s) => sum + s.wordCount, 0);
  const canTrain = totalWordCount >= 1000 && voiceName.trim().length > 0;

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const addSample = useCallback((
    source: 'paste' | 'upload' | 'chapter',
    sourceName: string,
    text: string
  ) => {
    const wordCount = countWords(text);
    if (wordCount < 100) {
      setError('Sample must be at least 100 words');
      return;
    }

    const sample: TrainingSample = {
      id: Date.now().toString(),
      source,
      sourceName,
      text,
      wordCount,
      addedAt: new Date(),
    };

    setSamples(prev => [...prev, sample]);
    setError(null);
  }, []);

  const removeSample = useCallback((id: string) => {
    setSamples(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      addSample('upload', file.name, text);
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addSample]);

  const handlePasteSubmit = useCallback(() => {
    if (pasteText.trim()) {
      addSample('paste', pasteName || 'Pasted text', pasteText);
      setPasteText('');
      setPasteName('');
      setShowPasteModal(false);
    }
  }, [pasteText, pasteName, addSample]);

  const handleChapterSelect = useCallback((chapter: { id: string; title: string; content: string }) => {
    addSample('chapter', chapter.title, chapter.content);
    setShowChapterSelect(false);
  }, [addSample]);

  const startTraining = async () => {
    if (!canTrain) return;

    setIsTraining(true);
    setError(null);

    try {
      // Phase 1: Upload samples
      setTrainingPhase('Uploading samples...');
      setTrainingProgress(10);
      await new Promise(r => setTimeout(r, 500));

      // Phase 2: Analyzing sentence structure
      setTrainingPhase('Analyzing sentence patterns...');
      setTrainingProgress(25);
      await new Promise(r => setTimeout(r, 800));

      // Phase 3: Vocabulary analysis
      setTrainingPhase('Profiling vocabulary...');
      setTrainingProgress(40);
      await new Promise(r => setTimeout(r, 800));

      // Phase 4: Deep style analysis
      setTrainingPhase('Deep style analysis with AI...');
      setTrainingProgress(55);

      // Call the actual training API
      const response = await fetch('/api/voice/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: voiceName,
          samples: samples.map(s => ({
            source: s.source,
            sourceName: s.sourceName,
            text: s.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Training failed');
      }

      const { voiceId } = await response.json();

      // Phase 5: Generating style guide
      setTrainingPhase('Generating voice prompt...');
      setTrainingProgress(85);
      await new Promise(r => setTimeout(r, 500));

      // Phase 6: Complete
      setTrainingPhase('Training complete!');
      setTrainingProgress(100);
      await new Promise(r => setTimeout(r, 500));

      onTrainingComplete(voiceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
            <Mic className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-100">Train Your Voice</h2>
            <p className="text-sm text-stone-400">
              Teach AI to write like you
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Voice Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-300">Voice Name</label>
          <input
            type="text"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            placeholder="e.g., My Fiction Voice, Dark Fantasy Style..."
            className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
          />
        </div>

        {/* Sample Sources */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-stone-300">Writing Samples</label>
            <div className="flex items-center gap-2 text-xs">
              <span className={cn(
                'font-mono',
                totalWordCount >= 1000 ? 'text-emerald-400' : 'text-stone-500'
              )}>
                {totalWordCount.toLocaleString()} words
              </span>
              <span className="text-stone-600">/</span>
              <span className="text-stone-500">1,000 minimum</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full transition-all duration-500',
                totalWordCount >= 1000 ? 'bg-emerald-500' : 'bg-violet-500'
              )}
              style={{ width: `${Math.min(100, (totalWordCount / 1000) * 100)}%` }}
            />
          </div>

          {/* Add Sample Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setShowPasteModal(true)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-stone-700 hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors group"
            >
              <FileText className="w-5 h-5 text-stone-400 group-hover:text-violet-400" />
              <span className="text-xs text-stone-400 group-hover:text-stone-300">Paste Text</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-stone-700 hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors group"
            >
              <Upload className="w-5 h-5 text-stone-400 group-hover:text-violet-400" />
              <span className="text-xs text-stone-400 group-hover:text-stone-300">Upload File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />

            {existingChapters.length > 0 && (
              <button
                onClick={() => setShowChapterSelect(true)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-stone-700 hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors group"
              >
                <BookOpen className="w-5 h-5 text-stone-400 group-hover:text-violet-400" />
                <span className="text-xs text-stone-400 group-hover:text-stone-300">From Book</span>
              </button>
            )}
          </div>
        </div>

        {/* Sample List */}
        {samples.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-300">Added Samples</label>
            <div className="space-y-2">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-stone-800/50 border border-stone-700/50"
                >
                  {sample.source === 'paste' && <FileText className="w-4 h-4 text-stone-500" />}
                  {sample.source === 'upload' && <Upload className="w-4 h-4 text-stone-500" />}
                  {sample.source === 'chapter' && <BookOpen className="w-4 h-4 text-stone-500" />}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-300 truncate">{sample.sourceName}</p>
                    <p className="text-xs text-stone-500">
                      {sample.wordCount.toLocaleString()} words
                    </p>
                  </div>

                  <button
                    onClick={() => removeSample(sample.id)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 rounded-xl bg-stone-800/30 border border-stone-700/50 space-y-3">
          <h4 className="text-sm font-medium text-stone-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Tips for Best Results
          </h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>Use 2,000+ words for better accuracy</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>Include samples from different types of scenes</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>Only use YOUR writing, not AI-generated text</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>Match POV and tense to your current project</span>
            </li>
          </ul>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}
      </div>

      {/* Training Progress */}
      {isTraining && (
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-900/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                {trainingPhase}
              </span>
              <span className="text-xs font-mono text-stone-500">{trainingProgress}%</span>
            </div>
            <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 border-t border-stone-800">
        <button
          onClick={startTraining}
          disabled={!canTrain || isTraining}
          className={cn(
            'w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
            canTrain && !isTraining
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/20'
              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
          )}
        >
          {isTraining ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Training...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Train My Voice
            </>
          )}
        </button>
        {!canTrain && !isTraining && (
          <p className="text-xs text-stone-500 text-center mt-2">
            {!voiceName.trim() ? 'Enter a voice name' : 'Add more writing samples (1,000+ words needed)'}
          </p>
        )}
      </div>

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-stone-900 rounded-2xl border border-stone-800 shadow-xl">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <h3 className="font-semibold text-stone-100">Paste Writing Sample</h3>
              <button
                onClick={() => {
                  setShowPasteModal(false);
                  setPasteText('');
                  setPasteName('');
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-stone-400">Sample Name (optional)</label>
                <input
                  type="text"
                  value={pasteName}
                  onChange={(e) => setPasteName(e.target.value)}
                  placeholder="e.g., Chapter 1 excerpt, Short story..."
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-stone-400">Your Writing</label>
                  <span className="text-xs text-stone-500">
                    {countWords(pasteText).toLocaleString()} words
                  </span>
                </div>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your writing here... (minimum 100 words)"
                  className="w-full h-64 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-violet-500/50 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-stone-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasteModal(false);
                  setPasteText('');
                  setPasteName('');
                }}
                className="px-4 py-2 text-sm text-stone-400 hover:text-stone-200"
              >
                Cancel
              </button>
              <button
                onClick={handlePasteSubmit}
                disabled={countWords(pasteText) < 100}
                className={cn(
                  'px-4 py-2 text-sm rounded-lg font-medium',
                  countWords(pasteText) >= 100
                    ? 'bg-violet-500 text-white hover:bg-violet-600'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                )}
              >
                Add Sample
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Select Modal */}
      {showChapterSelect && existingChapters.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-stone-900 rounded-2xl border border-stone-800 shadow-xl">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <h3 className="font-semibold text-stone-100">Select Chapter</h3>
              <button
                onClick={() => setShowChapterSelect(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              {existingChapters.map((chapter) => {
                const wordCount = countWords(chapter.content);
                const alreadyAdded = samples.some(s => s.source === 'chapter' && s.sourceName === chapter.title);
                
                return (
                  <button
                    key={chapter.id}
                    onClick={() => !alreadyAdded && handleChapterSelect(chapter)}
                    disabled={alreadyAdded || wordCount < 100}
                    className={cn(
                      'w-full p-3 rounded-lg text-left flex items-center justify-between transition-colors',
                      alreadyAdded
                        ? 'bg-violet-500/10 border border-violet-500/30'
                        : wordCount < 100
                        ? 'bg-stone-800/30 text-stone-500 cursor-not-allowed'
                        : 'bg-stone-800/50 hover:bg-stone-800 border border-transparent hover:border-stone-700'
                    )}
                  >
                    <div>
                      <p className="text-sm text-stone-300">{chapter.title}</p>
                      <p className="text-xs text-stone-500">{wordCount.toLocaleString()} words</p>
                    </div>
                    {alreadyAdded && (
                      <Check className="w-4 h-4 text-violet-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
