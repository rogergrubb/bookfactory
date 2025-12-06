'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Send, Wand2, MessageSquare, BookOpen, Users,
  Lightbulb, PenTool, Zap, RotateCcw, Copy, Check, ChevronDown,
  Brain, Target, Heart, Globe, Swords, Clock, AlertCircle, Loader2
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
  { id: 'continue', label: 'Continue Writing', icon: PenTool, prompt: 'Continue writing from where I left off.' },
  { id: 'improve', label: 'Improve Text', icon: Wand2, prompt: 'Improve this text while keeping the meaning.' },
  { id: 'dialogue', label: 'Write Dialogue', icon: MessageSquare, prompt: 'Write natural dialogue for this scene.' },
  { id: 'describe', label: 'Add Description', icon: BookOpen, prompt: 'Add vivid sensory description.' },
  { id: 'emotion', label: 'Deepen Emotion', icon: Heart, prompt: 'Make the emotional content deeper.' },
  { id: 'conflict', label: 'Add Conflict', icon: Swords, prompt: 'Add tension or conflict.' },
];

const analysisTools = [
  { id: 'pacing', label: 'Analyze Pacing', icon: Clock },
  { id: 'character', label: 'Character Voice', icon: Users },
  { id: 'plot', label: 'Plot Holes', icon: AlertCircle },
  { id: 'worldbuilding', label: 'World Details', icon: Globe },
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
  const [activeTab, setActiveTab] = useState<'chat' | 'actions' | 'analyze'>('actions');
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'continue',
          content: content.slice(-2000), // Last 2000 chars for context
          prompt: messageText,
          context: bookContext,
        }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.result || 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
        type: 'suggestion',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
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
    const contextText = selectedText || content.slice(-1000);
    handleSend(`${action.prompt}\n\nContext:\n${contextText}`);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleInsert = (text: string) => {
    onInsert?.(text);
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <span className="font-semibold text-slate-900 dark:text-white">AI Assistant</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'actions', label: 'Quick Actions', icon: Zap },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'analyze', label: 'Analyze', icon: Brain },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 py-2 text-sm transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-violet-500 text-violet-600'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'actions' && (
          <div className="p-4">
            <p className="mb-4 text-sm text-slate-500">Choose an action to enhance your writing:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-left text-sm transition-colors hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-violet-950/30"
                >
                  <action.icon className="h-4 w-4 text-violet-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                </button>
              ))}
            </div>
            
            {selectedText && (
              <div className="mt-4 rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                <p className="mb-1 text-xs font-medium text-slate-500">Selected text:</p>
                <p className="line-clamp-3 text-sm text-slate-700 dark:text-slate-300">{selectedText}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="py-8 text-center">
                  <Sparkles className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-sm text-slate-500">Start a conversation about your writing</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'rounded-lg p-3',
                      message.role === 'user'
                        ? 'ml-8 bg-violet-100 dark:bg-violet-900/30'
                        : 'mr-8 bg-slate-100 dark:bg-slate-800'
                    )}
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleCopy(message.content, message.id)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-600"
                        >
                          {copied === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copied === message.id ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={() => handleInsert(message.content)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-600"
                        >
                          <PenTool className="h-3 w-3" /> Insert
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="mr-8 flex items-center gap-2 rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                  <span className="text-sm text-slate-500">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {activeTab === 'analyze' && (
          <div className="p-4">
            <p className="mb-4 text-sm text-slate-500">Analyze your writing:</p>
            <div className="space-y-2">
              {analysisTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleSend(`Analyze this text for ${tool.label.toLowerCase()}: ${content.slice(-2000)}`)}
                  disabled={isLoading}
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50 dark:border-slate-700"
                >
                  <tool.icon className="h-5 w-5 text-violet-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask anything about your writing..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-violet-600 p-2 text-white disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
