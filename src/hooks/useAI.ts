import { useState, useCallback } from 'react';

export type AIAction = 'continue' | 'improve' | 'dialogue' | 'description' | 'brainstorm' | 'outline';
export type AIAnalysis = 'pacing' | 'character' | 'plot' | 'style' | 'readability' | 'continuity';

interface AIContext {
  bookId?: string;
  bookTitle?: string;
  genre?: string;
  characters?: string[];
  chapterTitle?: string;
}

export function useAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (
    type: AIAction,
    content: string,
    context?: AIContext,
    options?: { style?: string; length?: string }
  ) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, context, ...options }),
      });
      
      if (!res.ok) throw new Error('Generation failed');
      
      const data = await res.json();
      return data.result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const analyze = useCallback(async (
    type: AIAnalysis,
    content: string,
    bookContext?: { genre?: string; targetAudience?: string }
  ) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, bookContext }),
      });
      
      if (!res.ok) throw new Error('Analysis failed');
      
      const data = await res.json();
      return data.result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generateDescription = useCallback(async (
    title: string,
    genre: string,
    synopsis: string,
    style: 'blurb' | 'amazon' | 'pitch' | 'social'
  ) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const res = await fetch('/api/ai/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, genre, synopsis, style }),
      });
      
      if (!res.ok) throw new Error('Generation failed');
      
      const data = await res.json();
      return data.description;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateKeywords = useCallback(async (
    title: string,
    genre: string,
    description: string
  ) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const res = await fetch('/api/ai/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, genre, description }),
      });
      
      if (!res.ok) throw new Error('Generation failed');
      
      const data = await res.json();
      return data.keywords;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generate,
    analyze,
    generateDescription,
    generateKeywords,
    isGenerating,
    isAnalyzing,
    error,
  };
}
