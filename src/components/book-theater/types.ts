import { LucideIcon } from 'lucide-react';

// ============================================================================
// CORE TYPES
// ============================================================================

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  genre: string;
  status: string;
  wordCount: number;
  targetWordCount: number;
  coverUrl?: string;
  metadata?: Record<string, any>;
  chapters: Chapter[];
  characters?: Character[];
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description?: string;
  traits?: string[];
}

// ============================================================================
// TOOL TYPES
// ============================================================================

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
  isDynamic?: boolean;
  dynamicSource?: 'characters' | 'locations';
}

export interface CategoryMeta {
  name: string;
  color: string;
  description: string;
}

// ============================================================================
// EDITOR TYPES
// ============================================================================

export interface Selection {
  start: number;
  end: number;
  text: string;
}

export type UndoType = 'edit' | 'insert' | 'delete' | 'replace' | 'ai-generate' | 'ai-fix' | 'format' | 'paste';

export interface UndoItem {
  id: string;
  content: string;
  label: string;
  toolName: string;
  timestamp: Date;
  chapterId: string;
  wordCount: number;
  // Extended fields for rich undo UI
  type?: UndoType;
  description?: string;
  wordCountBefore?: number;
  previewBefore?: string;
  previewAfter?: string;
}

// ============================================================================
// SCENE CONTEXT TYPES
// ============================================================================

export interface SensoryPalette {
  sight?: string;
  sound?: string;
  smell?: string;
  touch?: string;
  taste?: string;
}

export interface Mood {
  primary: string;
  secondary?: string;
}

export interface SceneContext {
  id: string;
  name: string;
  icon: string;
  sensory: SensoryPalette;
  mood: Mood;
  props: string[];
  aiNotes?: string;
}

// ============================================================================
// TOOL RUN TYPES
// ============================================================================

export interface ToolRunRecord {
  id: string;
  toolId: string;
  toolName: string;
  input: string;
  output: string;
  createdAt: string;
  status: string;
}

