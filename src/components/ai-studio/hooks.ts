// AI Studio Hooks - Unified state management for all tools
'use client';

import { useState, useCallback, useRef } from 'react';
import { ToolId, ToolResult, ToolContext, ToolOptions, Genre, AnalysisResult } from './types';
import { getToolById } from './tool-definitions';

export interface ToolExecutionState {
  isLoading: boolean;
  error: string | null;
  result: ToolResult | null;
  history: ToolHistoryItem[];
}

export interface ToolHistoryItem {
  id: string;
  toolId: ToolId;
  input: string;
  output: string;
  timestamp: Date;
  tokensUsed?: number;
}

export function useToolExecution() {
  const [state, setState] = useState<ToolExecutionState>({
    isLoading: false,
    error: null,
    result: null,
    history: []
  });
  
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (
    toolId: ToolId,
    input: string,
    options: {
      genre?: Genre;
      bookId?: string;
      characterIds?: string[];
      length?: 'short' | 'medium' | 'long';
      intensity?: number;
      customInstructions?: string;
    } = {}
  ): Promise<ToolResult> => {
    const tool = getToolById(toolId);
    if (!tool) {
      throw new Error('Unknown tool: ' + toolId);
    }

    // Cancel any pending request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Determine which API endpoint to use based on tool category
      const isAnalysis = tool.category === 'analyze';
      const endpoint = isAnalysis ? '/api/ai/analyze' : '/api/ai/generate';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: toolId,
          content: input,
          genre: options.genre || 'literary',
          bookId: options.bookId,
          characterIds: options.characterIds,
          options: {
            length: options.length || 'medium',
            intensity: options.intensity || 5,
            customInstructions: options.customInstructions
          }
        }),
        signal: abortRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Request failed: ' + response.status);
      }

      const data = await response.json();
      
      const result: ToolResult = {
        success: true,
        content: data.content || data.text || data.summary || '',
        metadata: {
          tokensUsed: data.tokensUsed || 0,
          processingTime: 0,
          suggestions: data.suggestions,
          warnings: data.warnings
        },
        analysis: isAnalysis ? {
          score: data.score,
          issues: data.issues || [],
          suggestions: data.suggestions || [],
          highlights: data.highlights || [],
          metrics: data.metrics
        } : undefined,
        structured: data.items ? { items: data.items, summary: data.summary } : undefined
      };

      // Add to history
      const historyItem: ToolHistoryItem = {
        id: Date.now() + '-' + Math.random().toString(36).slice(2),
        toolId,
        input,
        output: result.content,
        timestamp: new Date(),
        tokensUsed: data.tokensUsed
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        result,
        history: [historyItem, ...prev.history.slice(0, 49)]
      }));

      return result;

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        result: null
      }));
      
      throw error;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null }));
  }, []);

  return {
    ...state,
    execute,
    cancel,
    clearError,
    clearResult
  };
}

// Hook for managing workspace state
export interface WorkspaceState {
  activeToolId: ToolId | null;
  inputText: string;
  outputText: string;
  selectedGenre: Genre;
  selectedBookId: string | null;
  chainMode: boolean;
  pinnedOutputs: PinnedOutput[];
}

export interface PinnedOutput {
  id: string;
  toolId: ToolId;
  content: string;
  timestamp: Date;
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    activeToolId: null,
    inputText: '',
    outputText: '',
    selectedGenre: 'literary',
    selectedBookId: null,
    chainMode: false,
    pinnedOutputs: []
  });

  const setActiveTool = useCallback((toolId: ToolId | null) => {
    setWorkspace(prev => ({ ...prev, activeToolId: toolId }));
  }, []);

  const setInputText = useCallback((text: string) => {
    setWorkspace(prev => ({ ...prev, inputText: text }));
  }, []);

  const setOutputText = useCallback((text: string) => {
    setWorkspace(prev => ({ ...prev, outputText: text }));
  }, []);

  const setGenre = useCallback((genre: Genre) => {
    setWorkspace(prev => ({ ...prev, selectedGenre: genre }));
  }, []);

  const setBookId = useCallback((bookId: string | null) => {
    setWorkspace(prev => ({ ...prev, selectedBookId: bookId }));
  }, []);

  const toggleChainMode = useCallback(() => {
    setWorkspace(prev => ({ ...prev, chainMode: !prev.chainMode }));
  }, []);

  const useOutputAsInput = useCallback(() => {
    setWorkspace(prev => ({
      ...prev,
      inputText: prev.outputText,
      outputText: ''
    }));
  }, []);

  const pinOutput = useCallback((toolId: ToolId, content: string) => {
    const pinned: PinnedOutput = {
      id: 'pin-' + Date.now(),
      toolId,
      content,
      timestamp: new Date()
    };
    setWorkspace(prev => ({
      ...prev,
      pinnedOutputs: [pinned, ...prev.pinnedOutputs.slice(0, 9)]
    }));
  }, []);

  const unpinOutput = useCallback((id: string) => {
    setWorkspace(prev => ({
      ...prev,
      pinnedOutputs: prev.pinnedOutputs.filter(p => p.id !== id)
    }));
  }, []);

  const loadPinnedToInput = useCallback((id: string) => {
    const pinned = workspace.pinnedOutputs.find(p => p.id === id);
    if (pinned) {
      setWorkspace(prev => ({
        ...prev,
        inputText: pinned.content
      }));
    }
  }, [workspace.pinnedOutputs]);

  return {
    workspace,
    setActiveTool,
    setInputText,
    setOutputText,
    setGenre,
    setBookId,
    toggleChainMode,
    useOutputAsInput,
    pinOutput,
    unpinOutput,
    loadPinnedToInput
  };
}
