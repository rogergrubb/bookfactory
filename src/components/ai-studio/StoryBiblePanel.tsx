// StoryBiblePanel - Manage world-building, characters, and story rules
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, BookMarked, Loader2, Plus, Search, Filter,
  MapPin, Scroll, Clock, Users, Wand2, Cpu, Globe, Sparkles,
  ChevronRight, Edit2, Trash2, Tag, AlertCircle, Check,
  BookOpen, Layout, Layers
} from 'lucide-react';

type EntryCategory = 'setting' | 'rule' | 'lore' | 'timeline' | 'faction' | 'magic' | 'technology' | 'culture' | 'other';

interface StoryBibleEntry {
  id: string;
  category: EntryCategory;
  name: string;
  description: string;
  details?: Record<string, unknown>;
  tags?: string[];
  relatedEntries?: string[];
  createdAt: string;
  updatedAt: string;
}

interface StoryBiblePanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookId?: string;
}

const CATEGORY_CONFIG: Record<EntryCategory, { icon: React.ComponentType<{className?: string}>; color: string; label: string }> = {
  setting: { icon: MapPin, color: 'emerald', label: 'Settings' },
  rule: { icon: Scroll, color: 'amber', label: 'Rules' },
  lore: { icon: BookOpen, color: 'purple', label: 'Lore' },
  timeline: { icon: Clock, color: 'blue', label: 'Timeline' },
  faction: { icon: Users, color: 'red', label: 'Factions' },
  magic: { icon: Wand2, color: 'violet', label: 'Magic' },
  technology: { icon: Cpu, color: 'cyan', label: 'Technology' },
  culture: { icon: Globe, color: 'orange', label: 'Culture' },
  other: { icon: Layers, color: 'gray', label: 'Other' }
};

export function StoryBiblePanel({ isOpen, onClose, bookId }: StoryBiblePanelProps) {
  const [entries, setEntries] = useState<StoryBibleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EntryCategory | 'all'>('all');
  const [selectedEntry, setSelectedEntry] = useState<StoryBibleEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'generate' | 'add'>('browse');
  
  // Generate form
  const [premise, setPremise] = useState('');
  const [genre, setGenre] = useState('fantasy');
  const [worldType, setWorldType] = useState('fantasy');

  // Add/Edit form
  const [editEntry, setEditEntry] = useState<Partial<StoryBibleEntry>>({
    category: 'setting',
    name: '',
    description: '',
    tags: []
  });

  useEffect(() => {
    if (isOpen && bookId) {
      fetchEntries();
    }
  }, [isOpen, bookId]);

  const fetchEntries = async () => {
    if (!bookId) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/story-bible?bookId=' + bookId);
      const data = await res.json();
      if (data.storyBible) {
        setEntries(data.storyBible);
      }
    } catch (err) {
      console.error('Failed to fetch story bible:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWorld = async () => {
    if (!premise.trim()) {
      setError('Please enter a story premise.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const res = await fetch('/api/ai/story-bible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-world',
          bookId,
          premise,
          genre,
          worldType
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.storyBible) {
        setEntries(data.storyBible);
        setActiveTab('browse');
        setPremise('');
      }
    } catch (err) {
      setError('World generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addEntry = async () => {
    if (!editEntry.name || !editEntry.description) {
      setError('Name and description are required.');
      return;
    }
    
    try {
      const res = await fetch('/api/ai/story-bible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          bookId,
          entry: {
            ...editEntry,
            id: 'entry_' + Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      });
      
      const data = await res.json();
      
      if (data.storyBible) {
        setEntries(data.storyBible);
        setEditEntry({ category: 'setting', name: '', description: '', tags: [] });
        setActiveTab('browse');
      }
    } catch (err) {
      setError('Failed to add entry.');
    }
  };

  const deleteEntry = async (entryId: string) => {
    try {
      const res = await fetch('/api/ai/story-bible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          bookId,
          entryId
        })
      });
      
      const data = await res.json();
      
      if (data.storyBible) {
        setEntries(data.storyBible);
        setSelectedEntry(null);
      }
    } catch (err) {
      setError('Failed to delete entry.');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] max-w-[1400px] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-white flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <BookMarked className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Story Bible</h2>
                <p className="text-sm text-gray-500">{entries.length} entries</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 py-3 border-b border-gray-100 flex gap-4 flex-shrink-0">
            <button
              onClick={() => setActiveTab('browse')}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (
                activeTab === 'browse'
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Browse
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (
                activeTab === 'generate'
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Generate World
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (
                activeTab === 'add'
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Entry
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'browse' && (
              <>
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-100 flex flex-col">
                  {/* Search */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search entries..."
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                  </div>
                  
                  {/* Categories */}
                  <div className="flex-1 overflow-y-auto p-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ' + (
                        selectedCategory === 'all'
                          ? 'bg-violet-100 text-violet-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <span>All Entries</span>
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{entries.length}</span>
                    </button>
                    
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      const count = categoryCounts[key] || 0;
                      if (count === 0) return null;
                      
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedCategory(key as EntryCategory)}
                          className={'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors mt-1 ' + (
                            selectedCategory === key
                              ? 'bg-violet-100 text-violet-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {config.label}
                          </span>
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Entry List */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                    </div>
                  ) : filteredEntries.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <BookMarked className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="font-medium text-gray-900 mb-2">No entries yet</h4>
                        <p className="text-sm text-gray-500 mb-4">Generate a world or add entries manually</p>
                        <button
                          onClick={() => setActiveTab('generate')}
                          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700"
                        >
                          Generate World
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="grid gap-3">
                        {filteredEntries.map(entry => {
                          const config = CATEGORY_CONFIG[entry.category];
                          const Icon = config.icon;
                          
                          return (
                            <button
                              key={entry.id}
                              onClick={() => setSelectedEntry(entry)}
                              className={'w-full text-left p-4 rounded-xl border transition-all ' + (
                                selectedEntry?.id === entry.id
                                  ? 'border-violet-300 bg-violet-50'
                                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={'p-2 rounded-lg bg-' + config.color + '-100'}>
                                  <Icon className={'w-4 h-4 text-' + config.color + '-600'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-900 truncate">{entry.name}</h4>
                                    <span className={'px-2 py-0.5 text-xs rounded-full bg-' + config.color + '-100 text-' + config.color + '-700'}>
                                      {config.label}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{entry.description}</p>
                                  {entry.tags && entry.tags.length > 0 && (
                                    <div className="flex gap-1 mt-2">
                                      {entry.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Entry Detail */}
                {selectedEntry && (
                  <div className="w-96 border-l border-gray-100 flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Entry Details</h3>
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button 
                          onClick={() => deleteEntry(selectedEntry.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedEntry.name}</h2>
                      <p className="text-gray-600 mb-4">{selectedEntry.description}</p>
                      
                      {selectedEntry.details && Object.keys(selectedEntry.details).length > 0 && (
                        <div className="space-y-3">
                          {Object.entries(selectedEntry.details).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">{key}</span>
                              <p className="text-sm text-gray-800 mt-1">
                                {typeof value === 'string' ? value : JSON.stringify(value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                        <div className="mt-4">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Tags</span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedEntry.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'generate' && (
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="p-4 rounded-2xl bg-violet-50 w-fit mx-auto mb-4">
                      <Sparkles className="w-10 h-10 text-violet-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Your World</h3>
                    <p className="text-gray-500">Describe your story premise and let AI create comprehensive world-building</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Story Premise</label>
                      <textarea
                        value={premise}
                        onChange={(e) => setPremise(e.target.value)}
                        placeholder="Example: A detective in 1920s Chicago discovers that the city's most powerful crime families are secretly controlled by immortal beings who have been manipulating human history for centuries..."
                        className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                        <select
                          value={genre}
                          onChange={(e) => setGenre(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        >
                          <option value="fantasy">Fantasy</option>
                          <option value="scifi">Science Fiction</option>
                          <option value="mystery">Mystery</option>
                          <option value="thriller">Thriller</option>
                          <option value="romance">Romance</option>
                          <option value="horror">Horror</option>
                          <option value="literary">Literary Fiction</option>
                          <option value="historical">Historical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">World Type</label>
                        <select
                          value={worldType}
                          onChange={(e) => setWorldType(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        >
                          <option value="realistic">Realistic/Contemporary</option>
                          <option value="fantasy">Fantasy World</option>
                          <option value="scifi">Science Fiction</option>
                          <option value="alternate">Alternate History</option>
                          <option value="urban-fantasy">Urban Fantasy</option>
                          <option value="dystopia">Dystopia</option>
                          <option value="historical">Historical Setting</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={generateWorld}
                      disabled={!premise.trim() || isGenerating}
                      className={'w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ' + (
                        isGenerating
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700'
                      )}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating World...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate World
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'add' && (
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Entry</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                          const Icon = config.icon;
                          return (
                            <button
                              key={key}
                              onClick={() => setEditEntry({...editEntry, category: key as EntryCategory})}
                              className={'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ' + (
                                editEntry.category === key
                                  ? 'border-violet-300 bg-violet-50 text-violet-700'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
                              )}
                            >
                              <Icon className="w-4 h-4" />
                              {config.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={editEntry.name || ''}
                        onChange={(e) => setEditEntry({...editEntry, name: e.target.value})}
                        placeholder="Entry name..."
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={editEntry.description || ''}
                        onChange={(e) => setEditEntry({...editEntry, description: e.target.value})}
                        placeholder="Describe this entry..."
                        className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={(editEntry.tags || []).join(', ')}
                        onChange={(e) => setEditEntry({...editEntry, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                        placeholder="tag1, tag2, tag3..."
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>

                    <button
                      onClick={addEntry}
                      disabled={!editEntry.name || !editEntry.description}
                      className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                      Add Entry
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="px-6 py-3 bg-red-50 border-t border-red-100">
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default StoryBiblePanel;
