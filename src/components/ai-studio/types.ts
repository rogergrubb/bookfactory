// ============================================================================
// AI STUDIO TYPES - COMPLETE SCOPED TOOL SYSTEM
// ============================================================================

// ============================================================================
// SECTION 1: TOOL SCOPE DEFINITIONS
// ============================================================================

/**
 * Tool Scope Types:
 * - scene: Operates on a single scene/chapter, requires book_id + document_id
 * - book: Operates on entire book or global structure, requires book_id only
 * - hybrid: User chooses scope at runtime (scene, selected chapters, or whole book)
 */
export type ToolScope = 'scene' | 'book' | 'hybrid';

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

// ============================================================================
// SECTION 2: SCOPE VIEW FILTERS
// ============================================================================

/**
 * Top-level scope view for UI filtering
 */
export type ScopeView = 'scene' | 'book' | 'all';

/**
 * Category filter for tools
 */
export type CategoryFilter = 'all' | ToolCategory;

/**
 * Scope selection for hybrid tools at runtime
 */
export interface HybridScopeSelection {
  mode: 'this-scene' | 'selected-chapters' | 'whole-book';
  sceneId?: string;
  chapterIds?: string[];
  bookId: string;
}

// ============================================================================
// SECTION 3: TOOL DEFINITIONS
// ============================================================================

export interface AITool {
  id: ToolId;
  category: ToolCategory;
  scope: ToolScope;
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
  // Scope-specific metadata
  canChainTo: ToolId[];
  minInputLength: number;
  maxInputLength: number;
  estimatedTokens: number;
}

// ============================================================================
// SECTION 4: TOOL EXECUTION & CONTEXT
// ============================================================================

export interface ToolExecution {
  toolId: ToolId;
  input: string;
  context: ToolContext;
  options?: ToolOptions;
  scopeSelection?: HybridScopeSelection;
}

export interface ToolContext {
  // Required identifiers based on scope
  userId: string;
  bookId: string;
  documentId?: string; // Required for scene-scope tools
  
  // Optional enrichment
  chapterIds?: string[]; // For hybrid tools with selected chapters
  characterIds?: string[];
  genre?: Genre;
  storyBibleId?: string;
  voiceProfileId?: string;
  previousContent?: string;
  selectedText?: string;
  
  // Workflow chain context
  workflowId?: string;
  previousToolRuns?: string[];
}

export interface ToolOptions {
  length?: 'short' | 'medium' | 'long';
  tone?: string;
  style?: string;
  intensity?: number;
  focusAreas?: string[];
  customInstructions?: string;
}

// ============================================================================
// SECTION 5: TOOL RESULTS
// ============================================================================

export interface ToolResult {
  success: boolean;
  content: string;
  metadata: ToolResultMetadata;
  analysis?: AnalysisResult;
  structured?: StructuredResult;
}

export interface ToolResultMetadata {
  toolRunId: string;
  tokensUsed: number;
  processingTime: number;
  scope: ToolScope;
  appliedTo: {
    bookId: string;
    documentId?: string;
    chapterIds?: string[];
  };
  suggestions?: string[];
  warnings?: string[];
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

// ============================================================================
// SECTION 6: SAVE & ROUTING LOGIC
// ============================================================================

export type SaveAction = 'save' | 'save-and-send';

export interface SaveRequest {
  action: SaveAction;
  toolRunId: string;
  content: string;
  metadata: ToolResultMetadata;
  // For save-and-send
  nextToolId?: ToolId;
  routingOptions?: RoutingOptions;
}

export interface RoutingOptions {
  preserveInput: boolean;
  appendToExisting: boolean;
  targetScope?: HybridScopeSelection;
}

export interface SaveResponse {
  success: boolean;
  savedToId: string;
  savedToType: 'document' | 'tool_run' | 'book';
  // For save-and-send: next tool preloaded state
  nextToolState?: {
    toolId: ToolId;
    preloadedInput: string;
    context: ToolContext;
  };
}

// ============================================================================
// SECTION 7: DATA MODEL - CENTRAL DATA POOL
// ============================================================================

/**
 * User table - core user data
 */
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  subscription: 'free' | 'pro' | 'enterprise';
  aiCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Book table - top-level container
 */
export interface Book {
  id: string;
  userId: string;
  title: string;
  genre: Genre;
  description: string | null;
  coverImageUrl: string | null;
  wordCount: number;
  status: 'draft' | 'in-progress' | 'completed' | 'published';
  metadata: BookMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookMetadata {
  targetWordCount?: number;
  targetAudience?: string;
  themes?: string[];
  tone?: string;
  pov?: string;
  timeline?: string;
}

/**
 * Document table - scenes, chapters, outlines, notes
 */
export interface Document {
  id: string;
  bookId: string;
  type: 'chapter' | 'scene' | 'outline' | 'note' | 'character-sheet';
  parentId: string | null; // For nested scenes within chapters
  title: string;
  content: string;
  wordCount: number;
  order: number;
  metadata: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentMetadata {
  pov?: string;
  location?: string;
  timeframe?: string;
  characters?: string[];
  tags?: string[];
  status?: 'draft' | 'revision' | 'final';
}

/**
 * ToolRun table - all AI tool executions
 */
export interface ToolRun {
  id: string;
  userId: string;
  bookId: string;
  documentId: string | null;
  toolId: ToolId;
  scope: ToolScope;
  scopeSelection: HybridScopeSelection | null;
  input: string;
  output: string;
  context: ToolContext;
  options: ToolOptions | null;
  result: ToolResult;
  tokensUsed: number;
  processingTime: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  errorMessage: string | null;
  // Workflow chaining
  workflowId: string | null;
  previousToolRunId: string | null;
  nextToolRunId: string | null;
  // Save tracking
  savedToDocumentId: string | null;
  appliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workflow table - chained tool sequences
 */
export interface Workflow {
  id: string;
  userId: string;
  bookId: string;
  name: string;
  toolRunIds: string[];
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
}

/**
 * Character table
 */
export interface Character {
  id: string;
  bookId: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  traits: string[];
  backstory: string | null;
  goals: string[];
  flaws: string[];
  relationships: CharacterRelationship[];
  voiceNotes: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterRelationship {
  characterId: string;
  relationshipType: string;
  description: string;
}

/**
 * StoryBible table
 */
export interface StoryBible {
  id: string;
  bookId: string;
  worldBuilding: WorldBuildingEntry[];
  rules: StoryRule[];
  timeline: TimelineEvent[];
  locations: Location[];
  lore: LoreEntry[];
  createdAt: Date;
  updatedAt: Date;
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

/**
 * VoiceProfile table
 */
export interface VoiceProfile {
  id: string;
  bookId: string;
  name: string;
  samples: string[];
  characteristics: VoiceCharacteristics;
  avoidPatterns: string[];
  preferPatterns: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceCharacteristics {
  sentenceLength: 'short' | 'medium' | 'long' | 'varied';
  vocabulary: 'simple' | 'moderate' | 'complex';
  tone: string[];
  pacing: 'fast' | 'moderate' | 'slow';
  dialogueStyle: string;
  narrativeStyle: string;
}

// ============================================================================
// SECTION 8: UI STATE TYPES
// ============================================================================

export interface AIStudioState {
  // View filters
  scopeView: ScopeView;
  categoryFilter: CategoryFilter;
  
  // Context selection
  selectedBookId: string | null;
  selectedDocumentId: string | null;
  selectedChapterIds: string[];
  
  // Active tool
  activeTool: ToolId | null;
  toolPanelOpen: boolean;
  
  // Execution state
  isExecuting: boolean;
  currentToolRun: ToolRun | null;
  
  // Workflow state
  activeWorkflow: Workflow | null;
  workflowTrail: ToolRun[];
  
  // Results
  lastResult: ToolResult | null;
  resultHistory: ToolRun[];
}

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
  // Hybrid scope selection
  hybridSelection: HybridScopeSelection | null;
}

export interface ToolHistoryEntry {
  id: string;
  toolId: ToolId;
  input: string;
  output: string;
  timestamp: Date;
  applied: boolean;
  savedToDocumentId: string | null;
}

// ============================================================================
// SECTION 9: VALIDATION RULES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: 'MISSING_BOOK_ID' | 'MISSING_DOCUMENT_ID' | 'INVALID_SCOPE' | 
        'SCOPE_MISMATCH' | 'INVALID_CHAIN' | 'INSUFFICIENT_INPUT' |
        'CONTEXT_REQUIRED' | 'CHAPTERS_REQUIRED';
}

/**
 * Validate tool execution based on scope requirements
 */
export function validateToolExecution(
  tool: AITool,
  context: ToolContext,
  scopeSelection?: HybridScopeSelection
): ValidationResult {
  const errors: ValidationError[] = [];

  // All tools require bookId
  if (!context.bookId) {
    errors.push({
      field: 'bookId',
      message: 'Book selection is required',
      code: 'MISSING_BOOK_ID'
    });
  }

  // Scene-scope tools require documentId
  if (tool.scope === 'scene' && !context.documentId) {
    errors.push({
      field: 'documentId',
      message: 'Scene/chapter selection is required for this tool',
      code: 'MISSING_DOCUMENT_ID'
    });
  }

  // Hybrid tools require scope selection
  if (tool.scope === 'hybrid') {
    if (!scopeSelection) {
      errors.push({
        field: 'scopeSelection',
        message: 'Please select a scope: this scene, selected chapters, or whole book',
        code: 'INVALID_SCOPE'
      });
    } else if (scopeSelection.mode === 'this-scene' && !scopeSelection.sceneId) {
      errors.push({
        field: 'sceneId',
        message: 'Scene selection is required',
        code: 'MISSING_DOCUMENT_ID'
      });
    } else if (scopeSelection.mode === 'selected-chapters' && 
               (!scopeSelection.chapterIds || scopeSelection.chapterIds.length === 0)) {
      errors.push({
        field: 'chapterIds',
        message: 'Please select at least one chapter',
        code: 'CHAPTERS_REQUIRED'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate tool chaining based on scope compatibility
 */
export function validateToolChain(
  sourceTool: AITool,
  targetTool: AITool,
  sourceScope: ToolScope,
  targetScope?: HybridScopeSelection
): ValidationResult {
  const errors: ValidationError[] = [];

  // Scene tools can only chain to scene or hybrid tools
  if (sourceScope === 'scene' && targetTool.scope === 'book') {
    errors.push({
      field: 'targetTool',
      message: 'Scene-level outputs cannot be sent to book-level tools',
      code: 'INVALID_CHAIN'
    });
  }

  // Book tools can only chain to book or hybrid tools
  if (sourceScope === 'book' && targetTool.scope === 'scene') {
    errors.push({
      field: 'targetTool',
      message: 'Book-level outputs cannot be sent to scene-level tools',
      code: 'INVALID_CHAIN'
    });
  }

  // Check if tool is in allowed chain list
  if (sourceTool.canChainTo.length > 0 && 
      !sourceTool.canChainTo.includes(targetTool.id)) {
    errors.push({
      field: 'targetTool',
      message: `${sourceTool.name} cannot chain to ${targetTool.name}`,
      code: 'INVALID_CHAIN'
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
