'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X, BookOpen, FileText, ChevronRight, Search,
  Clock, BookMarked, Folder, FolderOpen, Check, Loader2
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Book {
  id: string;
  title: string;
  genre: string;
  wordCount: number;
  updatedAt: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  wordCount: number;
  scenes: Scene[];
}

interface Scene {
  id: string;
  title: string;
  order: number;
  wordCount: number;
}

interface ScopedContextSelectorProps {
  mode: 'book' | 'document';
  selectedBookId: string | null;
  onBookSelect: (bookId: string) => void;
  onDocumentSelect: (documentId: string) => void;
  onClose: () => void;
}

// ============================================================================
// MOCK DATA (will be replaced with API calls)
// ============================================================================

const MOCK_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'The Midnight Garden',
    genre: 'fantasy',
    wordCount: 45230,
    updatedAt: '2024-01-15T10:30:00Z',
    chapters: [
      {
        id: 'ch-1',
        title: 'Chapter 1: The Beginning',
        order: 1,
        wordCount: 3200,
        scenes: [
          { id: 'sc-1-1', title: 'Opening Scene', order: 1, wordCount: 1200 },
          { id: 'sc-1-2', title: 'The Discovery', order: 2, wordCount: 2000 }
        ]
      },
      {
        id: 'ch-2',
        title: 'Chapter 2: Into the Garden',
        order: 2,
        wordCount: 4100,
        scenes: [
          { id: 'sc-2-1', title: 'First Steps', order: 1, wordCount: 1500 },
          { id: 'sc-2-2', title: 'The Encounter', order: 2, wordCount: 2600 }
        ]
      },
      {
        id: 'ch-3',
        title: 'Chapter 3: Secrets Revealed',
        order: 3,
        wordCount: 3800,
        scenes: [
          { id: 'sc-3-1', title: 'The Revelation', order: 1, wordCount: 1900 },
          { id: 'sc-3-2', title: 'Consequences', order: 2, wordCount: 1900 }
        ]
      }
    ]
  },
  {
    id: 'book-2',
    title: 'Echoes of Tomorrow',
    genre: 'scifi',
    wordCount: 32100,
    updatedAt: '2024-01-14T14:20:00Z',
    chapters: [
      {
        id: 'ch-4',
        title: 'Chapter 1: Year 2157',
        order: 1,
        wordCount: 2800,
        scenes: [
          { id: 'sc-4-1', title: 'The Station', order: 1, wordCount: 1400 },
          { id: 'sc-4-2', title: 'The Signal', order: 2, wordCount: 1400 }
        ]
      },
      {
        id: 'ch-5',
        title: 'Chapter 2: Contact',
        order: 2,
        wordCount: 3500,
        scenes: [
          { id: 'sc-5-1', title: 'First Contact', order: 1, wordCount: 1750 },
          { id: 'sc-5-2', title: 'The Message', order: 2, wordCount: 1750 }
        ]
      }
    ]
  },
  {
    id: 'book-3',
    title: 'Shadows in the Snow',
    genre: 'mystery',
    wordCount: 58400,
    updatedAt: '2024-01-12T09:15:00Z',
    chapters: [
      {
        id: 'ch-6',
        title: 'Chapter 1: The Body',
        order: 1,
        wordCount: 4200,
        scenes: [
          { id: 'sc-6-1', title: 'Discovery', order: 1, wordCount: 2100 },
          { id: 'sc-6-2', title: 'Investigation Begins', order: 2, wordCount: 2100 }
        ]
      }
    ]
  }
];

// ============================================================================
// BOOK CARD COMPONENT
// ============================================================================

function BookCard({
  book,
  isSelected,
  onSelect
}: {
  book: Book;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const genreColors: Record<string, string> = {
    fantasy: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    scifi: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    mystery: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
    romance: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    thriller: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  };

  return (
    <button
      onClick={onSelect}
      className={`
        w-full p-4 rounded-xl border-2 text-left transition-all
        ${isSelected
          ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
          : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <BookMarked className={`w-4 h-4 ${isSelected ? 'text-violet-600' : 'text-gray-400'}`} />
            <h4 className="font-medium text-gray-900 dark:text-white truncate">{book.title}</h4>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${genreColors[book.genre] || genreColors.fantasy}`}>
              {book.genre}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {book.wordCount.toLocaleString()} words
            </span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Updated {new Date(book.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        {isSelected && (
          <Check className="w-5 h-5 text-violet-600 flex-shrink-0" />
        )}
      </div>
    </button>
  );
}

// ============================================================================
// CHAPTER/SCENE TREE COMPONENT
// ============================================================================

function DocumentTree({
  book,
  selectedDocumentId,
  onSelect
}: {
  book: Book;
  selectedDocumentId: string | null;
  onSelect: (documentId: string) => void;
}) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  return (
    <div className="space-y-2">
      {book.chapters.map((chapter) => {
        const isExpanded = expandedChapters.has(chapter.id);
        const isChapterSelected = selectedDocumentId === chapter.id;
        const hasSelectedScene = chapter.scenes.some(s => s.id === selectedDocumentId);

        return (
          <div key={chapter.id} className="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Chapter Header */}
            <div
              className={`
                flex items-center gap-2 p-3 cursor-pointer transition-colors
                ${isChapterSelected
                  ? 'bg-violet-50 dark:bg-violet-950/30'
                  : hasSelectedScene
                    ? 'bg-blue-50 dark:bg-blue-950/30'
                    : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleChapter(chapter.id);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-amber-500" />
                ) : (
                  <Folder className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => onSelect(chapter.id)}
                className="flex-1 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isChapterSelected ? 'text-violet-700 dark:text-violet-300' : 'text-gray-900 dark:text-white'}`}>
                    {chapter.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{chapter.wordCount.toLocaleString()} words</span>
                    {isChapterSelected && <Check className="w-4 h-4 text-violet-600" />}
                  </div>
                </div>
              </button>
            </div>

            {/* Scenes */}
            {isExpanded && chapter.scenes.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                {chapter.scenes.map((scene) => {
                  const isSceneSelected = selectedDocumentId === scene.id;
                  return (
                    <button
                      key={scene.id}
                      onClick={() => onSelect(scene.id)}
                      className={`
                        w-full flex items-center justify-between px-4 py-2 pl-10 text-left transition-colors
                        ${isSceneSelected
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className={`w-3.5 h-3.5 ${isSceneSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className={`text-sm ${isSceneSelected ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                          {scene.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{scene.wordCount.toLocaleString()}w</span>
                        {isSceneSelected && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN CONTEXT SELECTOR COMPONENT
// ============================================================================

export function ScopedContextSelector({
  mode,
  selectedBookId,
  onBookSelect,
  onDocumentSelect,
  onClose
}: ScopedContextSelectorProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelectedBookId, setLocalSelectedBookId] = useState<string | null>(selectedBookId);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  // Load books
  useEffect(() => {
    // In production, this would be an API call
    setIsLoading(true);
    setTimeout(() => {
      setBooks(MOCK_BOOKS);
      setIsLoading(false);
    }, 300);
  }, []);

  // Filter books by search
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected book for document mode
  const selectedBook = books.find(b => b.id === localSelectedBookId);

  // Handle confirm
  const handleConfirm = () => {
    if (mode === 'book' && localSelectedBookId) {
      onBookSelect(localSelectedBookId);
    } else if (mode === 'document' && selectedDocumentId) {
      if (localSelectedBookId && localSelectedBookId !== selectedBookId) {
        onBookSelect(localSelectedBookId);
      }
      onDocumentSelect(selectedDocumentId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {mode === 'book' ? (
              <BookOpen className="w-5 h-5 text-violet-600" />
            ) : (
              <FileText className="w-5 h-5 text-blue-600" />
            )}
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {mode === 'book' ? 'Select a Book' : 'Select a Scene or Chapter'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {mode === 'book'
                  ? 'Choose which book to work with'
                  : 'Choose a specific scene or chapter for scene-level tools'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={mode === 'book' ? 'Search books...' : 'Search chapters and scenes...'}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
            </div>
          ) : mode === 'book' ? (
            <div className="grid gap-3">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isSelected={localSelectedBookId === book.id}
                  onSelect={() => setLocalSelectedBookId(book.id)}
                />
              ))}
              {filteredBooks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No books found
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Book selector in document mode */}
              {!selectedBook && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">First, select a book:</p>
                  <div className="grid gap-2">
                    {filteredBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        isSelected={localSelectedBookId === book.id}
                        onSelect={() => setLocalSelectedBookId(book.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Document tree */}
              {selectedBook && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select a chapter or scene from <span className="font-medium text-gray-900 dark:text-white">{selectedBook.title}</span>:
                    </p>
                    <button
                      onClick={() => setLocalSelectedBookId(null)}
                      className="text-xs text-violet-600 hover:underline"
                    >
                      Change book
                    </button>
                  </div>
                  <DocumentTree
                    book={selectedBook}
                    selectedDocumentId={selectedDocumentId}
                    onSelect={setSelectedDocumentId}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={mode === 'book' ? !localSelectedBookId : !selectedDocumentId}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === 'book' ? 'Select Book' : 'Select Document'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ScopedContextSelector;
