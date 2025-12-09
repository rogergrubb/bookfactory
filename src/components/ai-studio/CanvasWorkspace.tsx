'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Save, Undo2, ChevronDown, ChevronUp, Send, Sparkles, 
  BookOpen, FileText, Settings, BarChart3, Lightbulb, Wand2,
  Check, X, RotateCcw, Clock, User, Bot, Zap, PenTool
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface VersionState {
  id: string;
  content: string;
  timestamp: Date;
  modifiedBy: 'user' | 'ai';
  description: string;
  toolUsed?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  changes?: {
    type: 'addition' | 'replacement' | 'suggestion';
    originalText?: string;
    newText: string;
    accepted?: boolean;
  };
}

interface CanvasWorkspaceProps {
  bookId: string;
  bookTitle: string;
  chapterId?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  initialContent?: string;
  onSave: (content: string) => Promise<void>;
  userName: string;
}

// ============================================================================
// VERSION CONTROL HOOK
// ============================================================================

function useVersionControl(initialContent: string, maxVersions: number = 10) {
  const [versions, setVersions] = useState<VersionState[]>([
    {
      id: crypto.randomUUID(),
      content: initialContent,
      timestamp: new Date(),
      modifiedBy: 'user',
      description: 'Initial content'
    }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addVersion = useCallback((
    content: string, 
    modifiedBy: 'user' | 'ai', 
    description: string,
    toolUsed?: string
  ) => {
    setVersions(prev => {
      // Take versions up to current index and add new one
      const newVersions = [
        {
          id: crypto.randomUUID(),
          content,
          timestamp: new Date(),
          modifiedBy,
          description,
          toolUsed
        },
        ...prev.slice(currentIndex)
      ].slice(0, maxVersions);
      
      return newVersions;
    });
    setCurrentIndex(0);
  }, [currentIndex, maxVersions]);

  const undo = useCallback(() => {
    if (currentIndex < versions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return versions[currentIndex + 1];
    }
    return null;
  }, [currentIndex, versions]);

  const redo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return versions[currentIndex - 1];
    }
    return null;
  }, [currentIndex, versions]);

  const goToVersion = useCallback((index: number) => {
    if (index >= 0 && index < versions.length) {
      setCurrentIndex(index);
      return versions[index];
    }
    return null;
  }, [versions]);

  return {
    versions,
    currentIndex,
    currentVersion: versions[currentIndex],
    addVersion,
    undo,
    redo,
    goToVersion,
    canUndo: currentIndex < versions.length - 1,
    canRedo: currentIndex > 0
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CanvasWorkspace({
  bookId,
  bookTitle,
  chapterId,
  chapterNumber,
  chapterTitle,
  initialContent = '',
  onSave,
  userName
}: CanvasWorkspaceProps) {
  // Content state
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Version control
  const {
    versions,
    currentIndex,
    addVersion,
    undo,
    redo,
    goToVersion,
    canUndo,
    canRedo
  } = useVersionControl(initialContent);
  
  // UI state
  const [undoDropdownOpen, setUndoDropdownOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    original: string;
    suggestion: string;
    visible: boolean;
  } | null>(null);
  
  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  // Word count
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  
  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };
  
  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      addVersion(content, 'user', 'Manual save');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle undo
  const handleUndo = () => {
    const version = undo();
    if (version) {
      setContent(version.content);
    }
  };
  
  // Handle redo
  const handleRedo = () => {
    const version = redo();
    if (version) {
      setContent(version.content);
    }
  };
  
  // Handle version selection
  const handleVersionSelect = (index: number) => {
    const version = goToVersion(index);
    if (version) {
      setContent(version.content);
    }
    setUndoDropdownOpen(false);
  };
  
  // Handle chat submit
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isProcessing) return;
    
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsProcessing(true);
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I understand you want to "${chatInput.slice(0, 50)}...". I've analyzed your text and here's what I suggest...`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
    }, 1500);
  };
  
  // Handle text selection
  const handleTextSelection = () => {
    const textarea = editorRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end) {
        setSelectedText(content.substring(start, end));
      } else {
        setSelectedText(null);
      }
    }
  };
  
  // Accept AI suggestion
  const acceptSuggestion = () => {
    if (aiSuggestion) {
      const newContent = content.replace(aiSuggestion.original, aiSuggestion.suggestion);
      setContent(newContent);
      addVersion(newContent, 'ai', 'AI enhancement accepted');
      setAiSuggestion(null);
    }
  };
  
  // Reject AI suggestion
  const rejectSuggestion = () => {
    setAiSuggestion(null);
  };
  
  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
      {/* Header Bar */}
      <header className="flex-shrink-0 h-14 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 flex items-center justify-between">
        {/* Left: Book/Chapter info */}
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-stone-900 dark:text-stone-100">{bookTitle}</span>
            {chapterNumber && (
              <>
                <span className="text-stone-400">›</span>
                <span className="text-stone-600 dark:text-stone-400">
                  Chapter {chapterNumber}{chapterTitle && `: ${chapterTitle}`}
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Center: Version Control */}
        <div className="flex items-center gap-2">
          {/* Undo Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUndoDropdownOpen(!undoDropdownOpen)}
              disabled={!canUndo}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${canUndo 
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700' 
                  : 'bg-stone-50 dark:bg-stone-900 text-stone-400 dark:text-stone-600 cursor-not-allowed'
                }
              `}
            >
              <Undo2 className="w-4 h-4" />
              {undoDropdownOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            {undoDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 py-2 z-50">
                <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Version History</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {versions.map((version, index) => (
                    <button
                      key={version.id}
                      onClick={() => handleVersionSelect(index)}
                      className={`
                        w-full px-3 py-2.5 flex items-start gap-3 text-left
                        transition-colors duration-150
                        ${index === currentIndex 
                          ? 'bg-teal-50 dark:bg-teal-900/20' 
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                        }
                      `}
                    >
                      <div className={`
                        mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                        ${version.modifiedBy === 'ai' 
                          ? 'bg-violet-100 dark:bg-violet-900/50' 
                          : 'bg-stone-100 dark:bg-stone-800'
                        }
                      `}>
                        {version.modifiedBy === 'ai' 
                          ? <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                          : <User className="w-3 h-3 text-stone-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {index === currentIndex && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-teal-600 text-white rounded">
                              Current
                            </span>
                          )}
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                            {version.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-stone-500">
                            {version.modifiedBy === 'ai' ? 'AI' : 'You'}
                          </span>
                          <span className="text-xs text-stone-400">•</span>
                          <span className="text-xs text-stone-500">
                            {formatRelativeTime(version.timestamp)}
                          </span>
                          {version.toolUsed && (
                            <>
                              <span className="text-xs text-stone-400">•</span>
                              <span className="text-xs text-violet-600 dark:text-violet-400">
                                {version.toolUsed}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Redo */}
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`
              p-1.5 rounded-lg transition-all duration-200
              ${canRedo 
                ? 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800' 
                : 'text-stone-300 dark:text-stone-700 cursor-not-allowed'
              }
            `}
          >
            <RotateCcw className="w-4 h-4 scale-x-[-1]" />
          </button>
        </div>
        
        {/* Right: Save button */}
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-stone-500">
              Saved {formatRelativeTime(lastSaved)}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg
              bg-teal-600 hover:bg-teal-700 text-white
              font-medium text-sm transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas - Writing Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              {/* AI Suggestion Banner */}
              {aiSuggestion?.visible && (
                <div className="mb-6 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-violet-900 dark:text-violet-100">
                          AI Suggestion
                        </p>
                        <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">
                          {aiSuggestion.suggestion.slice(0, 150)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={acceptSuggestion}
                        className="p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={rejectSuggestion}
                        className="p-2 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Text Editor */}
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onSelect={handleTextSelection}
                placeholder="Begin writing your story..."
                className="
                  w-full min-h-[60vh] p-0 
                  bg-transparent border-none outline-none resize-none
                  text-lg leading-relaxed text-stone-800 dark:text-stone-200
                  placeholder:text-stone-400 dark:placeholder:text-stone-600
                  font-serif
                "
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  lineHeight: '1.8'
                }}
              />
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="flex-shrink-0 h-10 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-4">
              <span>{wordCount.toLocaleString()} words</span>
              {selectedText && (
                <span className="text-teal-600">
                  {selectedText.split(/\s+/).length} words selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>~{Math.ceil(wordCount / 200)} min read</span>
            </div>
          </div>
        </div>
        
        {/* Chat Pane */}
        <div className="w-96 border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col">
          {/* Chat Header */}
          <div className="flex-shrink-0 h-14 border-b border-stone-200 dark:border-stone-800 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-stone-900 dark:text-stone-100">Writing Assistant</span>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
              <Settings className="w-4 h-4 text-stone-500" />
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-100 to-violet-100 dark:from-teal-900/30 dark:to-violet-900/30 flex items-center justify-center">
                  <PenTool className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                  How can I help?
                </h3>
                <p className="text-sm text-stone-500 mb-6">
                  Select text and ask me to enhance it, or describe what you'd like to write.
                </p>
                
                {/* Quick Actions */}
                <div className="space-y-2">
                  {[
                    { icon: Wand2, label: 'Improve this section', color: 'blue' },
                    { icon: Zap, label: 'Add tension here', color: 'amber' },
                    { icon: Lightbulb, label: 'Suggest what happens next', color: 'violet' },
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={() => setChatInput(action.label)}
                      className="
                        w-full px-4 py-2.5 rounded-xl text-left
                        bg-stone-50 dark:bg-stone-800 
                        hover:bg-stone-100 dark:hover:bg-stone-700
                        transition-colors duration-150
                        flex items-center gap-3
                      "
                    >
                      <action.icon className={`w-4 h-4 text-${action.color}-600`} />
                      <span className="text-sm text-stone-700 dark:text-stone-300">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                      ${message.role === 'user' 
                        ? 'bg-stone-200 dark:bg-stone-700' 
                        : 'bg-gradient-to-br from-teal-500 to-violet-500'
                      }
                    `}>
                      {message.role === 'user' 
                        ? <User className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                        : <Bot className="w-4 h-4 text-white" />
                      }
                    </div>
                    <div className={`
                      flex-1 px-4 py-3 rounded-2xl
                      ${message.role === 'user'
                        ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                        : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                      }
                    `}>
                      <p className="text-sm">{message.content}</p>
                      {message.changes && (
                        <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-violet-600">Suggested change</span>
                          </div>
                          <p className="text-sm italic bg-violet-50 dark:bg-violet-900/20 p-2 rounded-lg">
                            {message.changes.newText.slice(0, 100)}...
                          </p>
                          <div className="flex gap-2 mt-2">
                            <button className="px-3 py-1 text-xs rounded-lg bg-violet-600 text-white hover:bg-violet-700">
                              Apply
                            </button>
                            <button className="px-3 py-1 text-xs rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600">
                              Dismiss
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </>
            )}
          </div>
          
          {/* Selected Text Indicator */}
          {selectedText && (
            <div className="px-4 py-2 border-t border-stone-200 dark:border-stone-800 bg-teal-50 dark:bg-teal-900/20">
              <p className="text-xs text-teal-700 dark:text-teal-300 truncate">
                <span className="font-medium">Selected:</span> "{selectedText.slice(0, 50)}..."
              </p>
            </div>
          )}
          
          {/* Chat Input */}
          <div className="flex-shrink-0 p-4 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                  placeholder={selectedText ? "What should I do with this text?" : "Ask me anything..."}
                  rows={1}
                  className="
                    w-full px-4 py-3 pr-12
                    bg-stone-100 dark:bg-stone-800 
                    rounded-xl border-none outline-none
                    text-sm text-stone-900 dark:text-stone-100
                    placeholder:text-stone-500
                    resize-none
                  "
                />
                <button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isProcessing}
                  className="
                    absolute right-2 bottom-2
                    w-8 h-8 rounded-lg
                    bg-teal-600 hover:bg-teal-700 
                    disabled:bg-stone-300 dark:disabled:bg-stone-600
                    text-white
                    flex items-center justify-center
                    transition-colors duration-200
                  "
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
