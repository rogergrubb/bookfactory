// AI Studio Types - Complete type definitions for all 24 tools

export type ToolCategory = 'generate' | 'enhance' | 'analyze' | 'brainstorm';

export type ToolId = 
  // Generate tools
  | 'continue' | 'first-draft' | 'dialogue' | 'description' | 'action' | 'inner-monologue'
  // Enhance tools  
  | 'improve' | 'show-not-tell' | 'deepen-emotion' | 'add-tension' | 'vary-sentences' | 'sensory-details'
  // Analyze tools
  | 'pacing' | 'character-voice' | 'plot-holes' | 'readability' | 'word-frequency' | 'emotional-arc'
  // Brainstorm tools
  | 'plot-twists' | 'character-ideas' | 'world-building' | 'conflict-generator' | 'subplot-ideas' | 'scene-ideas';

export type Genre = 
  | 'romance' | 'mystery' | 'thriller' | 'fantasy' | 'scifi' 
  | 'literary' | 'horror' | 'ya' | 'historical' | 'contemporary';

export interface AITool {
  id: ToolId;
  category: ToolCategory;
  name: string;
  description: string;
  icon: string;
  shortcut: string | null;
  color: string;
  requiresSelection: boolean;
  outputType: 'text' | 'analysis' | 'suggestions' | 'structured';
  placeholders: {
    input: string;
    output: string;
  };
}

export interface ToolExecution {
  toolId: ToolId;
  input: string;
  context?: ToolContext;
  options?: ToolOptions;
}

export interface ToolContext {
  bookId?: string;
  chapterId?: string;
  sceneId?: string;
  characterIds?: string[];
  genre?: Genre;
  storyBibleId?: string;
  voiceProfileId?: string;
  previousContent?: string;
  selectedText?: string;
}

export interface ToolOptions {
  length?: 'short' | 'medium' | 'long';
  tone?: string;
  style?: string;
  intensity?: number;
  focusAreas?: string[];
  customInstructions?: string;
}

export interface ToolResult {
  success: boolean;
  content: string;
  metadata?: {
    tokensUsed: number;
    processingTime: number;
    suggestions?: string[];
    warnings?: string[];
  };
  analysis?: AnalysisResult;
  structured?: StructuredResult;
}

export interface AnalysisResult {
  score?: number;
  issues: AnalysisIssue[];
  suggestions: string[];
  highlights: TextHighlight[];
  metrics?: Record<string, number | string>;
}

export interface AnalysisIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  location?: { start: number; end: number };
  suggestion?: string;
}

export interface TextHighlight {
  start: number;
  end: number;
  type: string;
  label: string;
  color: string;
}

export interface StructuredResult {
  items: StructuredItem[];
  summary?: string;
}

export interface StructuredItem {
  id: string;
  title: string;
  description: string;
  details?: Record<string, string>;
  selected?: boolean;
}

// Book-related types for integration
export interface Book {
  id: string;
  title: string;
  genre: Genre;
  description?: string;
  wordCount: number;
  chapters: Chapter[];
  characters: Character[];
  storyBible?: StoryBible;
  voiceProfile?: VoiceProfile;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  content: string;
  wordCount: number;
  scenes: Scene[];
}

export interface Scene {
  id: string;
  title: string;
  order: number;
  content: string;
  wordCount: number;
  pov?: string;
  location?: string;
  timeframe?: string;
}

export interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  traits: string[];
  backstory?: string;
  goals?: string[];
  flaws?: string[];
  relationships: CharacterRelationship[];
  voiceNotes?: string;
}

export interface CharacterRelationship {
  characterId: string;
  relationshipType: string;
  description: string;
}

export interface StoryBible {
  id: string;
  worldBuilding: WorldBuildingEntry[];
  rules: StoryRule[];
  timeline: TimelineEvent[];
  locations: Location[];
  lore: LoreEntry[];
}

export interface WorldBuildingEntry {
  id: string;
  category: string;
  title: string;
  description: string;
  details: Record<string, string>;
}

export interface StoryRule {
  id: string;
  rule: string;
  reasoning: string;
  examples?: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  event: string;
  characters: string[];
  significance: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  significance: string;
  connectedLocations: string[];
}

export interface LoreEntry {
  id: string;
  category: string;
  title: string;
  content: string;
  references: string[];
}

export interface VoiceProfile {
  id: string;
  name: string;
  samples: string[];
  characteristics: {
    sentenceLength: 'short' | 'medium' | 'long' | 'varied';
    vocabulary: 'simple' | 'moderate' | 'complex';
    tone: string[];
    pacing: 'fast' | 'moderate' | 'slow';
    dialogueStyle: string;
    narrativeStyle: string;
  };
  avoidPatterns: string[];
  preferPatterns: string[];
}

// UI State types
export interface ToolPanelState {
  isOpen: boolean;
  selectedTool: ToolId | null;
  input: string;
  output: string;
  isLoading: boolean;
  error: string | null;
  history: ToolHistoryEntry[];
  context: ToolContext;
  options: ToolOptions;
}

export interface ToolHistoryEntry {
  id: string;
  toolId: ToolId;
  input: string;
  output: string;
  timestamp: Date;
  applied: boolean;
}
