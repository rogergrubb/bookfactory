'use client';

import React, { useState, useRef } from 'react';
import { Plus, MoreHorizontal, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chapter } from './types';

interface ChapterTimelineProps {
  chapters: Chapter[];
  activeIndex: number;
  onChapterSelect: (index: number) => void;
  onChapterCreate: (insertAfterIndex?: number) => void;
  onChapterDelete: (chapterId: string) => void;
  onChapterRename: (chapterId: string, newTitle: string) => void;
}

export function ChapterTimeline({
  chapters,
  activeIndex,
  onChapterSelect,
  onChapterCreate,
  onChapterDelete,
  onChapterRename,
}: ChapterTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleStartEdit = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setEditTitle(chapter.title);
    setMenuOpenId(null);
  };

  const handleSaveEdit = (chapterId: string) => {
    if (editTitle.trim()) {
      onChapterRename(chapterId, editTitle.trim());
    }
    setEditingId(null);
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
          const isActive = index === activeIndex;
          const isEditing = editingId === chapter.id;
          const isMenuOpen = menuOpenId === chapter.id;

          return (
            <div key={chapter.id} className="relative flex items-center gap-1 shrink-0">
              {/* Chapter Button */}
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleSaveEdit(chapter.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(chapter.id);
                    if (e.key === 'Escape') setEditingId(null);
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
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700'
                  )}
                >
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
                      setMenuOpenId(isMenuOpen ? null : chapter.id);
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
                    onClick={() => handleStartEdit(chapter)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-stone-300 hover:bg-stone-700"
                  >
                    <Edit2 className="w-3 h-3" />
                    Rename
                  </button>
                  {chapters.length > 1 && (
                    <button
                      onClick={() => {
                        onChapterDelete(chapter.id);
                        setMenuOpenId(null);
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
    </div>
  );
}
