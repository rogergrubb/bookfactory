'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Users, Globe, Search, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReferencePanelProps {
  onClose: () => void;
}

type Tab = 'characters' | 'world' | 'notes';

export function ReferencePanel({ onClose }: ReferencePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('characters');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'world', label: 'World', icon: Globe },
    { id: 'notes', label: 'Notes', icon: BookOpen },
  ];

  // Mock data - in reality this would come from Story Bible
  const characters = [
    { id: '1', name: 'Elena Vance', role: 'Protagonist', color: 'teal' },
    { id: '2', name: 'Marcus Webb', role: 'Antagonist', color: 'rose' },
    { id: '3', name: 'Dr. Sarah Chen', role: 'Mentor', color: 'amber' },
    { id: '4', name: 'James "Jimmy" O\'Brien', role: 'Sidekick', color: 'blue' },
  ];

  const worldElements = [
    { id: '1', name: 'New Chicago', type: 'Location', description: 'Megacity, year 2147' },
    { id: '2', name: 'Neural Link', type: 'Technology', description: 'Brain-computer interface' },
    { id: '3', name: 'The Collective', type: 'Organization', description: 'Underground resistance' },
  ];

  const notes = [
    { id: '1', title: 'Chapter 3 revision notes', updated: '2 hours ago' },
    { id: '2', title: 'Elena\'s arc outline', updated: '1 day ago' },
    { id: '3', title: 'Climax scene ideas', updated: '3 days ago' },
  ];

  const filteredCharacters = characters.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorld = worldElements.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="w-80 border-l border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">Story Bible</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400 -mb-px'
                : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div className="space-y-2">
            {filteredCharacters.map(character => (
              <button
                key={character.id}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left group"
              >
                <span className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  character.color === 'teal' && 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
                  character.color === 'rose' && 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
                  character.color === 'amber' && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                  character.color === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                )}>
                  {character.name.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {character.name}
                  </p>
                  <p className="text-xs text-stone-500">{character.role}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
              </button>
            ))}
            
            {/* Add new character */}
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-stone-200 dark:border-stone-700 hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors text-stone-500 hover:text-teal-600">
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add character</span>
            </button>
          </div>
        )}

        {/* World Tab */}
        {activeTab === 'world' && (
          <div className="space-y-2">
            {filteredWorld.map(element => (
              <button
                key={element.id}
                className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left group"
              >
                <Globe className="h-5 w-5 text-stone-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {element.name}
                    </p>
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-stone-100 dark:bg-stone-700 text-stone-500 rounded">
                      {element.type}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{element.description}</p>
                </div>
              </button>
            ))}
            
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-stone-200 dark:border-stone-700 hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors text-stone-500 hover:text-teal-600">
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add world element</span>
            </button>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-2">
            {filteredNotes.map(note => (
              <button
                key={note.id}
                className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left group"
              >
                <BookOpen className="h-5 w-5 text-stone-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {note.title}
                  </p>
                  <p className="text-xs text-stone-500">{note.updated}</p>
                </div>
              </button>
            ))}
            
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-stone-200 dark:border-stone-700 hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors text-stone-500 hover:text-teal-600">
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add note</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer tip */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
        <p className="text-xs text-stone-500 text-center">
          Click any item to insert into your writing
        </p>
      </div>
    </motion.aside>
  );
}
