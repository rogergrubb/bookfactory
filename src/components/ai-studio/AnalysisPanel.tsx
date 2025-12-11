'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, Search, BookOpen, Hash, Activity,
  X, Loader2, ChevronDown, AlertCircle, CheckCircle, Info,
  TrendingUp, TrendingDown, Minus, Maximize2, Minimize2
} from 'lucide-react';
import { ToolId, AnalysisResult, AnalysisIssue } from './types';
import { getToolById, getToolIconBg } from './tool-definitions';

interface AnalysisPanelProps {
  toolId: ToolId;
  isOpen: boolean;
  onClose: () => void;
  initialInput?: string;
}

// Visualization Components
const PacingChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  return (
    <div className="h-32 flex items-end gap-1">
      {data.map((value, idx) => (
        <motion.div
          key={idx}
          initial={{ height: 0 }}
          animate={{ height: `${(value / max) * 100}%` }}
          transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
          className="flex-1 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-sm relative group cursor-pointer"
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Paragraph {idx + 1}: {value}%
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const EmotionalArcChart = ({ data }: { data: { label: string; value: number; emotion: string }[] }) => {
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 50 - (d.value * 40) // Scale from -1 to 1 → 90 to 10
  }));
  
  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, '');

  return (
    <div className="relative h-40">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.3" strokeDasharray="2" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.3" strokeDasharray="2" />
        
        {/* Gradient fill */}
        <defs>
          <linearGradient id="emotionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path d={`${pathD} L 100 50 L 0 50 Z`} fill="url(#emotionGradient)" />
        
        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        
        {/* Points */}
        {points.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="2"
            fill="#8b5cf6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="cursor-pointer"
          />
        ))}
      </svg>
      
      {/* Labels */}
      <div className="absolute top-0 left-0 text-xs text-gray-400">Positive</div>
      <div className="absolute bottom-0 left-0 text-xs text-gray-400">Negative</div>
      
      {/* Emotion labels */}
      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <div key={i} className="text-center">
            <div className="text-xs text-gray-500">{d.label}</div>
            <div className="text-xs font-medium text-violet-600">{d.emotion}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WordFrequencyCloud = ({ words }: { words: { word: string; count: number }[] }) => {
  const maxCount = Math.max(...words.map(w => w.count));
  
  return (
    <div className="flex flex-wrap gap-2 justify-center py-4">
      {words.slice(0, 30).map((item, idx) => {
        const size = 0.7 + (item.count / maxCount) * 0.8;
        const opacity = 0.4 + (item.count / maxCount) * 0.6;
        return (
          <motion.span
            key={item.word}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            style={{ fontSize: `${size}rem` }}
            className={`font-medium cursor-pointer hover:text-violet-600 transition-colors ${
              item.count > maxCount * 0.7 ? 'text-red-600' : 
              item.count > maxCount * 0.4 ? 'text-amber-600' : 
              'text-gray-600'
            }`}
            title={`"${item.word}" appears ${item.count} times`}
          >
            {item.word}
          </motion.span>
        );
      })}
    </div>
  );
};

const ReadabilityGauges = ({ metrics }: { metrics: Record<string, number> }) => {
  const gauges = [
    { label: 'Flesch-Kincaid', value: metrics.fleschKincaid || 0, max: 100, color: 'violet' },
    { label: 'Grade Level', value: metrics.gradeLevel || 0, max: 18, color: 'blue' },
    { label: 'Sentence Complexity', value: metrics.complexity || 0, max: 10, color: 'emerald' },
    { label: 'Vocabulary Diversity', value: metrics.diversity || 0, max: 100, color: 'amber' }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {gauges.map((gauge, idx) => (
        <div key={gauge.label} className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <motion.path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={`var(--${gauge.color})`}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(gauge.value / gauge.max) * 100}, 100`}
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${(gauge.value / gauge.max) * 100}, 100` }}
                transition={{ duration: 1, delay: idx * 0.1 }}
                className={`stroke-${gauge.color}-500`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-800">{Math.round(gauge.value)}</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">{gauge.label}</div>
        </div>
      ))}
    </div>
  );
};

const IssuesList = ({ issues }: { issues: AnalysisIssue[] }) => {
  const iconMap = {
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />
  };

  const bgMap = {
    error: 'bg-red-50 border-red-100',
    warning: 'bg-amber-50 border-amber-100',
    info: 'bg-blue-50 border-blue-100'
  };

  return (
    <div className="space-y-2">
      {issues.map((issue, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className={`p-3 rounded-lg border ${bgMap[issue.type]}`}
        >
          <div className="flex items-start gap-2">
            {iconMap[issue.type]}
            <div className="flex-1">
              <p className="text-sm text-gray-800">{issue.message}</p>
              {issue.suggestion && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 {issue.suggestion}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export function AnalysisPanel({ toolId, isOpen, onClose, initialInput = '' }: AnalysisPanelProps) {
  const tool = getToolById(toolId);
  const [input, setInput] = useState(initialInput);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: toolId,
          content: input
        })
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock analysis for demo
  const runMockAnalysis = () => {
    setIsLoading(true);
    setTimeout(() => {
      const mockResults: Record<string, AnalysisResult> = {
        'pacing': {
          score: 72,
          issues: [
            { id: '1', type: 'warning', message: 'Middle section (paragraphs 4-6) moves slowly', suggestion: 'Consider adding more action or dialogue' },
            { id: '2', type: 'info', message: 'Strong opening hook', suggestion: undefined },
            { id: '3', type: 'warning', message: 'Ending feels rushed', suggestion: 'Expand the final scene for better resolution' }
          ],
          suggestions: ['Add a beat of tension before the reveal', 'Break up the long exposition in paragraph 5'],
                    metrics: { fast: 35, medium: 45, slow: 20 }
        },
        'character-voice': {
          score: 68,
          issues: [
            { id: '1', type: 'error', message: 'Character voice inconsistent in lines 12-15', suggestion: 'Marcus uses formal language here but casual elsewhere' },
            { id: '2', type: 'warning', message: 'Sarah\'s dialogue lacks her usual wit', suggestion: 'Add sardonic undertones to her responses' }
          ],
          suggestions: ['Each character should have unique speech patterns', 'Consider their background and education'],
                    metrics: { consistency: 68, uniqueness: 75, authenticity: 71 }
        },
        'readability': {
          score: 85,
          issues: [
            { id: '3', type: 'info', message: 'Reading level: Grade 8-9', suggestion: 'Appropriate for general adult fiction' }
          ],
          suggestions: ['Vary sentence length more for rhythm'],
                    metrics: { fleschKincaid: 72, gradeLevel: 8.5, complexity: 6, diversity: 78 }
        },
        'word-frequency': {
          score: 0,
          issues: [
            { id: '4', type: 'warning', message: '"just" appears 12 times', suggestion: 'Often a filler word - consider removing' },
            { id: '5', type: 'warning', message: '"looked" appears 8 times', suggestion: 'Try alternatives: glanced, gazed, studied, noticed' },
            { id: '6', type: 'info', message: '"suddenly" appears 4 times', suggestion: 'Overuse can weaken impact' }
          ],
          suggestions: [],
                    metrics: { 
            just: 12, looked: 8, said: 7, that: 15, was: 11,
            suddenly: 4, really: 5, very: 6, eyes: 4, walked: 3,
            thought: 5, seemed: 4, started: 3, began: 3, felt: 4
          }
        },
        'emotional-arc': {
          score: 78,
          issues: [
            { id: '7', type: 'info', message: 'Strong emotional range detected' },
            { id: '8', type: 'warning', message: 'Emotional dip in middle third', suggestion: 'Consider adding a small win or moment of connection' }
          ],
          suggestions: ['The ending could use more emotional payoff'],
                    metrics: {
            open: 0.2, rising: 0.6, mid: -0.3, 
            crisis: -0.8, turn: 0.1, close: 0.7
          }
        },
        'plot-holes': {
          score: 65,
          issues: [
            { id: '9', type: 'error', message: 'Timeline inconsistency: Sarah arrives at 3pm but it\'s already dark', suggestion: 'Either change the time or the lighting description' },
            { id: '10', type: 'warning', message: 'Character motivation unclear: Why does Marcus stay after the argument?', suggestion: 'Add internal reasoning or dialogue' },
            { id: '11', type: 'warning', message: 'Unresolved setup: The letter mentioned in chapter 2 is never addressed', suggestion: 'Either resolve or remove this thread' }
          ],
          suggestions: ['Create a timeline document to track events', 'List character motivations for each scene'],
                    metrics: {}
        }
      };

      setResult(mockResults[toolId] || mockResults['pacing']);
      setIsLoading(false);
    }, 1500);
  };

  if (!tool) return null;

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    BarChart3, Users, Search, BookOpen, Hash, Activity
  };
  const Icon = iconMap[tool.icon] || BarChart3;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              isFullscreen 
                ? 'inset-4' 
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] max-w-[95vw] h-[700px] max-h-[90vh]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{tool.name}</h2>
                  <p className="text-sm text-gray-500">{tool.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Input */}
              <div className="w-2/5 flex flex-col border-r border-gray-100">
                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                  <span className="text-xs font-medium text-gray-500">TEXT TO ANALYZE</span>
                </div>
                <div className="flex-1 p-4">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your text here for analysis..."
                    className="w-full h-full resize-none text-gray-800 text-sm focus:outline-none"
                  />
                </div>
                <div className="px-4 py-3 border-t border-gray-100">
                  <button
                    onClick={runMockAnalysis}
                    disabled={isLoading || !input.trim()}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isLoading || !input.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4" />
                        Analyze
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 flex flex-col bg-gray-50/30 overflow-auto">
                <div className="px-4 py-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500">ANALYSIS RESULTS</span>
                </div>
                
                {result ? (
                  <div className="flex-1 p-6 overflow-auto space-y-6">
                    {/* Score */}
                    {(result.score ?? 0) > 0 && (
                      <div className="text-center pb-4 border-b border-gray-100">
                        <div className="text-4xl font-bold text-gray-800">{result.score}</div>
                        <div className="text-sm text-gray-500">Overall Score</div>
                      </div>
                    )}

                    {toolId === 'pacing' && result.metrics && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Pacing Distribution</h3>
                        <PacingChart data={[65, 70, 45, 30, 35, 55, 80, 90, 75, 60]} />
                      </div>
                    )}

                    {toolId === 'emotional-arc' && result.metrics?.arc && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Emotional Journey</h3>
                        <EmotionalArcChart data={result.metrics.arc as any} />
                      </div>
                    )}

                    {toolId === 'word-frequency' && result.metrics?.words && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Word Cloud</h3>
                        <WordFrequencyCloud words={result.metrics.words as any} />
                      </div>
                    )}

                    {toolId === 'readability' && result.metrics && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Readability Metrics</h3>
                        <ReadabilityGauges metrics={result.metrics as any} />
                      </div>
                    )}

                    {/* Issues */}
                    {result.issues.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          Issues Found ({result.issues.length})
                        </h3>
                        <IssuesList issues={result.issues} />
                      </div>
                    )}

                    {/* Suggestions */}
                    {result.suggestions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Suggestions</h3>
                        <ul className="space-y-2">
                          {result.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center p-6">
                    <div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mx-auto w-fit mb-4">
                        <Icon className="w-8 h-8 text-emerald-600" />
                      </div>
                      <p className="text-gray-400 text-sm">
                        Paste your text and click Analyze to see results
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AnalysisPanel;

