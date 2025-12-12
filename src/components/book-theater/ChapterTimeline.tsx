'use client';

import React, { useState, useRef } from 'react';
import { Plus, MoreHorizontal, Trash2, Edit2, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chapter } from './types';

interface ChapterTimelineProps {
  chapters: Chapter[];
  activeChapterIndex: number;
  onChapterSelect: (index: number) => void;
  onChapterCreate: (insertAfterIndex?: number) => void;
  onChapterDelete: (index: number) => void;
  onChapterRename: (index: number, newTitle: string) => void;
  onChapterReorder: (fromIndex: number, toIndex: number) => void;
  hasUnsavedChanges: boolean;
}

export function ChapterTimeline({
  chapters,
  activeChapterIndex,
  onChapterSelect,
  onChapterCreate,
  onChapterDelete,
  onChapterRename,
  onChapterReorder,
  hasUnsavedChanges,
}: ChapterTimelineProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleStartEdit = (index: number, chapter: Chapter) => {
    setEditingIndex(index);
    setEditTitle(chapter.title);
    setMenuOpenIndex(null);
  };

  const handleSaveEdit = (index: number) => {
    if (editTitle.trim()) {
      onChapterRename(index, editTitle.trim());
    }
    setEditingIndex(null);
    setEditTitle('');
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      onChapterReorder(dragIndex, index);
      setDragIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-stone-800 bg-stone-900/50">
      {/* Scroll Left */}
      <button
        onClick={scrollLeft}
        className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 shrink-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Chapter List */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {chapters.map((chapter, index) => {
          const isActive = index === activeChapterIndex;
          const isEditing = editingIndex === index;
          const isMenuOpen = menuOpenIndex === index;
          const isDragging = dragIndex === index;

          return (
            <div 
              key={chapter.id} 
              className="relative flex items-center gap-1 shrink-0"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Chapter Button */}
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleSaveEdit(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(index);
                    if (e.key === 'Escape') setEditingIndex(null);
                  }}
                  autoFocus
                  className="px-3 py-1.5 bg-stone-800 border border-teal-500 rounded-md text-sm text-stone-100 outline-none w-32"
                />
              ) : (
                <button
                  onClick={() => onChapterSelect(index)}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all',
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700',
                    isDragging && 'opacity-50'
                  )}
                >
                  <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-50 cursor-grab" />
                  <span className="truncate max-w-[120px]">
                    {chapter.title || `Ch ${index + 1}`}
                  </span>
                  <span className="text-xs text-stone-500">
                    {chapter.wordCount.toLocaleString()}
                  </span>
                  
                  {/* Menu Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenIndex(isMenuOpen ? null : index);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-stone-600"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </button>
                </button>
              )}

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-stone-800 border border-stone-700 rounded-lg shadow-xl z-50 py-1 min-w-[120px]">
                  <button
                    onClick={() => handleStartEdit(index, chapter)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-stone-300 hover:bg-stone-700"
                  >
                    <Edit2 className="w-3 h-3" />
                    Rename
                  </button>
                  {chapters.length > 1 && (
                    <button
                      onClick={() => {
                        onChapterDelete(index);
                        setMenuOpenIndex(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-stone-700"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                </div>
              )}

              {/* Insert Button Between Chapters */}
              <button
                onClick={() => onChapterCreate(index)}
                className="opacity-0 hover:opacity-100 p-1 rounded hover:bg-stone-700 text-stone-600 hover:text-teal-400 transition-opacity"
                title="Insert chapter here"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Add Chapter Button */}
        <button
          onClick={() => onChapterCreate()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-stone-800 text-stone-500 hover:text-teal-400 hover:bg-stone-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Chapter</span>
        </button>
      </div>

      {/* Scroll Right */}
      <button
        onClick={scrollRight}
        className="p-1 rounded hover:bg-stone-800 text-stone-500 hover:text-stone-300 shrink-0"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Unsaved Indicator */}
      {hasUnsavedChanges && (
        <div className="shrink-0 w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
      )}
    </div>
  );
}
