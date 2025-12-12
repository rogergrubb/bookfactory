// ============================================================================
// BOOK OPERATING THEATER - TYPE DEFINITIONS
// ============================================================================

import { LucideIcon } from 'lucide-react';

// ----------------------------------------------------------------------------
// CORE ENTITIES
// ----------------------------------------------------------------------------

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  genre: string;
  status: string;
  targetWordCount: number;
  targetChapters: number;
  chapters: Chapter[];
  characters?: Character[];
  metadata?: BookMetadata;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookMetadata {
  sceneContexts?: SceneContext[];
  [key: string]: unknown;
}

export interface Character {
  id: string;
  name: string;
  role?: string;
  description?: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
  status: 'DRAFT' | 'REVISION' | 'COMPLETE';
  sceneContextId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SceneContext {
  id: string;
  name: string;
  icon: string;
  sensory: {
    sight: string;
    sound: string;
    smell: string;
    touch: string;
    taste: string;
  };
  mood: {
    primary: string;
    secondary: string;
  };
  props: string[];
  aiNotes: string;
}

// ----------------------------------------------------------------------------
// TOOL SYSTEM
// ----------------------------------------------------------------------------

export type ToolCategory = 'generate' | 'enhance' | 'analyze' | 'brainstorm' | 'world';

export interface SubOption {
  id: string;
  name: string;
  icon?: LucideIcon;
  description?: string;
}

export interface Tool {
  id: string;
  name: string;
  shortName: string;
  icon: LucideIcon;
  category: ToolCategory;
  description: string;
  requiresSelection?: boolean;
  hasSubMenu?: boolean;
  subOptions?: SubOption[];
  isDynamic?: boolean; // Sub-options come from book data (characters, etc.)
  dynamicSource?: 'characters' | 'locations' | 'plotThreads';
}

export interface ToolExecution {
  toolId: string;
  subOptionId?: string;
  selectedText?: string;
  cursorPosition?: number;
  chapterId: string;
  sceneContextId?: string;
  customInstruction?: string;
}

// ----------------------------------------------------------------------------
// UNDO SYSTEM
// ----------------------------------------------------------------------------

export interface UndoItem {
  id: string;
  content: string;
  label: string;
  toolName: string;
  timestamp: Date;
  chapterId: string;
  wordCount: number;
}

// ----------------------------------------------------------------------------
// UI STATE
// ----------------------------------------------------------------------------

export interface Selection {
  start: number;
  end: number;
  text: string;
}

export interface ToolPanelState {
  isOpen: boolean;
  tool: Tool | null;
  subOption: SubOption | null;
  isGenerating: boolean;
  result: string;
  error: string | null;
}

export interface ChapterNavState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  isAddingChapter: boolean;
  insertPosition: number | null; // null = append, number = insert after this index
}
