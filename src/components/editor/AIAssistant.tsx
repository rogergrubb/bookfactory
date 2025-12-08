'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Send, Wand2, MessageSquare, BookOpen, Users,
  Lightbulb, PenTool, Zap, RotateCcw, Copy, Check,
  Brain, Target, Heart, Globe, Swords, Clock, AlertCircle, Loader2,
  ArrowRight, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'analysis';
}

interface AIAssistantProps {
  bookId?: string;
  content?: string;
  selectedText?: string;
  onInsert?: (text: string) => void;
  onClose?: () => void;
  bookContext?: {
    title?: string;
    genre?: string;
    characters?: string[];
  };
}

const quickActions = [
  { 
    id: 'continue', 
    label: 'Continue Writing', 
    icon: PenTool, 
    prompt: 'Continue writing from where I left off, matching my voice and style.',
    description: 'Keep the story flowing'
  },
  { 
    id: 'improve', 
    label: 'Improve Prose', 
    icon: Wand2, 
    prompt: 'Improve this text by enhancing word choice and sentence rhythm while preserving the meaning.',
    description: 'Polish your writing'
  },
  { 
    id: 'dialogue', 
    label: 'Write Dialogue', 
    icon: MessageSquare, 
    prompt: 'Write natural, character-authentic dialogue for this scene.',
    description: 'Natural conversations'
  },
  { 
    id: 'describe', 
    label: 'Add Description', 
    icon: BookOpen, 
    prompt: 'Add vivid sensory description that immerses the reader.',
    description: 'Paint the scene'
  },
  { 
    id: 'emotion', 
    label: 'Deepen Emotion', 
    icon: Heart, 
    prompt: 'Make the emotional content deeper and more visceral.',
    description: 'Feel more deeply'
  },
  { 
    id: 'conflict', 
    label: 'Add Tension', 
    icon: Swords, 
    prompt: 'Add tension, conflict, or stakes to raise the dramatic impact.',
    description: 'Raise the stakes'
  },
];

const analysisTools = [
  { id: 'pacing', label: 'Analyze Pacing', icon: Clock, description: 'Check story rhythm' },
  { id: 'character', label: 'Character Voice', icon: Users, description: 'Voice consistency' },
  { id: 'plot', label: 'Find Plot Holes', icon: AlertCircle, description: 'Logic check' },
  { id: 'worldbuilding', label: 'World Details', icon: Globe, description: 'Setting review' },
];

const suggestedPrompts = [
  "What happens next in this scene?",
  "How can I make this character more compelling?",
  "Help me describe this setting more vividly",
  "What's a surprising twist I could add here?",
  "How do I show instead of tell in this paragraph?",
];

export default function AIAssistant({ 
  bookId, 
  content = '', 
  selectedText, 
  onInsert, 
  onClose,
  bookContext 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'actions' | 'chat' | 'analyze'>('actions');
  const [copied, setCopied] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Auto-resize input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = async (prompt?: string) => {
    const messageText = prompt || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);
    setStreamingContent('');

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'continue',
          content: content.slice(-3000), // Last 3000 chars for context
          prompt: messageText,
          context: bookContext,
          selectedText: selectedText,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      // Check if streaming response
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    fullContent += parsed.text;
                    setStreamingContent(fullContent);
                  }
                } catch {
                  // Ignore parse errors
                }
              }
            }
          }
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullContent || 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date(),
          type: 'suggestion',
        };
        setMessages(prev => [...prev, assistantMessage]);
        setStreamingContent('');
      } else {
        // Handle regular JSON response
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.result || data.content || 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date(),
          type: 'suggestion',
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI request failed:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    const contextText = selectedText || content.slice(-2000);
    setActiveTab('chat');
    handleSend(`${action.prompt}\n\nContext:\n${contextText.slice(0, 1500)}`);
  };

  const handleAnalysis = (tool: typeof analysisTools[0]) => {
    setActiveTab('chat');
    handleSend(`Analyze this text for ${tool.label.toLowerCase()}. Provide specific, actionable feedback:\n\n${content.slice(-2500)}`);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleInsert = (text: string) => {
    onInsert?.(text);
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-semibold text-stone-900">AI Assistant</span>
            {bookContext?.title && (
              <p className="text-xs text-stone-500">Writing: {bookContext.title}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
              title="Clear chat"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose} 
              className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        {[
          { id: 'actions', label: 'Quick Actions', icon: Zap },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'analyze', label: 'Analyze', icon: Brain },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'border-b-2 border-teal-500 text-teal-600'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Actions Tab */}
        {activeTab === 'actions' && (
          <div className="p-4">
            {selectedText && (
              <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-teal-700">
                  <Target className="h-3 w-3" /> Selected text
                </p>
                <p className="line-clamp-3 text-sm text-teal-900">{selectedText}</p>
              </div>
            )}

            <p className="mb-3 text-sm text-stone-500">Choose an action to enhance your writing:</p>
            
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                  className="group flex w-full items-center gap-3 rounded-xl border border-stone-200 p-3 text-left transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-sm disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition-colors group-hover:bg-teal-100 group-hover:text-teal-600">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900">{action.label}</p>
                    <p className="text-xs text-stone-500">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-300 transition-transform group-hover:translate-x-1 group-hover:text-teal-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.length === 0 && showSuggestions ? (
                <div className="py-4">
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
                      <Lightbulb className="h-6 w-6 text-stone-400" />
                    </div>
                    <p className="text-sm text-stone-500">Ask me anything about your writing</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Try asking:</p>
                    {suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="block w-full rounded-lg border border-stone-200 px-3 py-2 text-left text-sm text-stone-600 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'rounded-xl p-3',
                        message.role === 'user'
                          ? 'ml-6 bg-stone-900 text-white'
                          : 'mr-6 border border-stone-200 bg-white'
                      )}
                    >
                      <p className={cn(
                        'whitespace-pre-wrap text-sm leading-relaxed',
                        message.role === 'user' ? 'text-white' : 'text-stone-700'
                      )}>
                        {message.content}
                      </p>
                      
                      {message.role === 'assistant' && (
                        <div className="mt-3 flex gap-2 border-t border-stone-100 pt-2">
                          <button
                            onClick={() => handleCopy(message.content, message.id)}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
                          >
                            {copied === message.id ? (
                              <><Check className="h-3 w-3 text-emerald-500" /> Copied</>
                            ) : (
                              <><Copy className="h-3 w-3" /> Copy</>
                            )}
                          </button>
                          <button
                            onClick={() => handleInsert(message.content)}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-500 transition-colors hover:bg-teal-50 hover:text-teal-700"
                          >
                            <PenTool className="h-3 w-3" /> Insert into editor
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Streaming content */}
                  {streamingContent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mr-6 rounded-xl border border-stone-200 bg-white p-3"
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
                        {streamingContent}
                      </p>
                    </motion.div>
                  )}
                </>
              )}

              {isLoading && !streamingContent && (
                <div className="mr-6 flex items-center gap-2 rounded-xl border border-stone-200 bg-white p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                  <span className="text-sm text-stone-500">Thinking...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="p-4">
            <p className="mb-3 text-sm text-stone-500">Get AI feedback on your writing:</p>
            
            <div className="grid grid-cols-2 gap-2">
              {analysisTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleAnalysis(tool)}
                  disabled={isLoading || !content}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-stone-200 p-4 text-center transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-sm disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition-colors group-hover:bg-teal-100 group-hover:text-teal-600">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{tool.label}</p>
                    <p className="text-xs text-stone-500">{tool.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {!content && (
              <p className="mt-4 text-center text-sm text-amber-600">
                Start writing to enable analysis features
              </p>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-stone-200 p-3">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything about your writing..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-center text-xs text-stone-400">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
