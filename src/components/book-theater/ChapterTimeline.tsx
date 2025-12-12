'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal, Pencil, Trash2, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chapter } from './types';

interface ChapterTimelineProps {
  chapters: Chapter[];
  activeChapterIndex: number;
  onChapterSelect: (index: number) => void;
  onChapterCreate: (insertAfterIndex?: number) => void;
  onChapterRename: (index: number, newTitle: string) => void;
  onChapterDelete: (index: number) => void;
  onChapterReorder: (fromIndex: number, toIndex: number) => void;
  hasUnsavedChanges: boolean;
}

export function ChapterTimeline({
  chapters,
  activeChapterIndex,
  onChapterSelect,
  onChapterCreate,
  onChapterRename,
  onChapterDelete,
  onChapterReorder,
  hasUnsavedChanges,
}: ChapterTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ index: number; x: number; y: number } | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showInsertAt, setShowInsertAt] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Check scrollability
  const checkScrollability = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  }, []);

  useEffect(() => {
    checkScrollability();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
    }
    return () => {
      if (ref) ref.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability, chapters.length]);

  // Scroll active chapter into view
  useEffect(() => {
    const btn = document.getElementById(`chapter-pill-${activeChapterIndex}`);
    if (btn && scrollRef.current) {
      const container = scrollRef.current;
      const btnRect = btn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      if (btnRect.left < containerRect.left || btnRect.right > containerRect.right) {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeChapterIndex]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({ index, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Editing handlers
  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingTitle(chapters[index]?.title || `Chapter ${index + 1}`);
    closeContextMenu();
  };

  const finishEditing = () => {
    if (editingIndex !== null && editingTitle.trim()) {
      onChapterRename(editingIndex, editingTitle.trim());
    }
    setEditingIndex(null);
    setEditingTitle('');
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingTitle('');
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setShowInsertAt(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && showInsertAt !== null && draggedIndex !== showInsertAt) {
      onChapterReorder(draggedIndex, showInsertAt);
    }
    setDraggedIndex(null);
    setShowInsertAt(null);
  };

  // Get chapter status indicator
  const getStatusIndicator = (chapter: Chapter) => {
    switch (chapter.status) {
      case 'COMPLETE':
        return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />;
      case 'REVISION':
        return <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />;
      default:
        return <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />;
    }
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-stone-900/50 border-b border-stone-800">
      {/* Scroll Left */}
      <button
        onClick={() => scroll('left')}
        className={cn(
          'p-1 rounded hover:bg-stone-800 transition-opacity',
          !canScrollLeft && 'opacity-30 pointer-events-none'
        )}
      >
        <ChevronLeft className="w-4 h-4 text-stone-400" />
      </button>

      {/* Chapter Pills Container */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {chapters.map((chapter, index) => (
          <React.Fragment key={chapter.id}>
            {/* Insert Button (appears between chapters on hover) */}
            <div
              className={cn(
                'flex items-center transition-all',
                showInsertAt === index ? 'w-6' : 'w-0 overflow-hidden',
                index === 0 && 'ml-0'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setShowInsertAt(index);
              }}
            >
              <button
                onClick={() => onChapterCreate(index - 1)}
                className="w-5 h-5 flex items-center justify-center rounded bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Chapter Pill */}
            {editingIndex === index ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={finishEditing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishEditing();
                  if (e.key === 'Escape') cancelEditing();
                }}
                autoFocus
                className="w-24 px-2 py-1 text-sm bg-stone-800 border border-teal-500 rounded text-stone-100 outline-none"
              />
            ) : (
              <button
                id={`chapter-pill-${index}`}
                onClick={() => onChapterSelect(index)}
                onContextMenu={(e) => handleContextMenu(e, index)}
                onDoubleClick={() => startEditing(index)}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm whitespace-nowrap transition-all',
                  'border select-none cursor-pointer',
                  index === activeChapterIndex
                    ? 'bg-teal-500/20 border-teal-500/50 text-teal-100'
                    : 'bg-stone-800/50 border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-stone-200',
                  draggedIndex === index && 'opacity-50',
                  hasUnsavedChanges && index === activeChapterIndex && 'ring-1 ring-amber-500/50'
                )}
              >
                {getStatusIndicator(chapter)}
                <span className="font-medium">{index + 1}</span>
                {chapter.title && chapter.title !== `Chapter ${index + 1}` && (
                  <span className="text-xs opacity-70 max-w-[60px] truncate">
                    {chapter.title}
                  </span>
                )}
              </button>
            )}

            {/* Hover insert indicator between pills */}
            <div
              className="w-2 h-6 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer group"
              onClick={() => onChapterCreate(index)}
              onMouseEnter={() => setShowInsertAt(index + 1)}
              onMouseLeave={() => setShowInsertAt(null)}
            >
              <div className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center transition-all',
                'bg-stone-700 group-hover:bg-teal-500/30',
                showInsertAt === index + 1 && 'bg-teal-500/30'
              )}>
                <Plus className="w-2.5 h-2.5 text-stone-400 group-hover:text-teal-400" />
              </div>
            </div>
          </React.Fragment>
        ))}

        {/* Add Chapter Button (end) */}
        <button
          onClick={() => onChapterCreate()}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border border-dashed border-stone-700 text-stone-500 hover:border-teal-500/50 hover:text-teal-400 hover:bg-teal-500/10 transition-all whitespace-nowrap"
        >
          <Plus className="w-3 h-3" />
          <span>{chapters.length === 0 ? 'Start Chapter 1' : 'New'}</span>
        </button>
      </div>

      {/* Scroll Right */}
      <button
        onClick={() => scroll('right')}
        className={cn(
          'p-1 rounded hover:bg-stone-800 transition-opacity',
          !canScrollRight && 'opacity-30 pointer-events-none'
        )}
      >
        <ChevronRight className="w-4 h-4 text-stone-400" />
      </button>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-stone-800 border border-stone-700 rounded-lg shadow-xl py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => startEditing(contextMenu.index)}
            className="w-full px-3 py-2 text-left text-sm text-stone-200 hover:bg-stone-700 flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={() => {
              onChapterCreate(contextMenu.index - 1);
              closeContextMenu();
            }}
            className="w-full px-3 py-2 text-left text-sm text-stone-200 hover:bg-stone-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Insert Before
          </button>
          <button
            onClick={() => {
              onChapterCreate(contextMenu.index);
              closeContextMenu();
            }}
            className="w-full px-3 py-2 text-left text-sm text-stone-200 hover:bg-stone-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Insert After
          </button>
          <div className="border-t border-stone-700 my-1" />
          <button
            onClick={() => {
              if (confirm(`Delete "${chapters[contextMenu.index]?.title || `Chapter ${contextMenu.index + 1}`}"?`)) {
                onChapterDelete(contextMenu.index);
              }
              closeContextMenu();
            }}
            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-stone-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Chapter
          </button>
        </div>
      )}
    </div>
  );
}
