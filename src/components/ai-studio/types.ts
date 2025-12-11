// ============================================================================
// BOOKFACTORY AI - COMPLETE TYPE SYSTEM
// The Master Storyteller's Toolkit
// ============================================================================

// ============================================================================
// SECTION 1: CORE BOOK & PROJECT TYPES
// ============================================================================

export interface Book {
  id: string;
  userId: string;
  title: string;
  subtitle?: string;
  genre: Genre;
  targetWordCount?: number;
  currentWordCount: number;
  status: BookStatus;
  coverImage?: string;
  
  // Structure preference
  structureMode: 'discovery' | 'planned' | 'outlined';
  chapterCount?: number; // If planned upfront
  
  // Series support (Rowling-style)
  seriesId?: string;
  seriesOrder?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastWrittenAt?: Date;
}

export type BookStatus = 'idea' | 'outlining' | 'drafting' | 'revising' | 'editing' | 'complete';

export type Genre = 
  | 'romance' | 'mystery' | 'thriller' | 'fantasy' | 'scifi'
  | 'literary' | 'horror' | 'ya' | 'historical' | 'contemporary'
  | 'crime' | 'adventure' | 'dystopian' | 'paranormal' | 'other';

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title?: string;
  
  // Content state
  status: 'empty' | 'drafting' | 'complete';
  wordCount: number;
  
  // Ordering
  order: number;
  
  // Patterson-style metrics
  estimatedReadTime?: number; // minutes
  hookScore?: number; // 0-100, how strong is the chapter ending
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Scene {
  id: string;
  chapterId: string;
  bookId: string;
  
  // Content
  title?: string;
  content: string;
  wordCount: number;
  
  // Ordering
  order: number;
  
  // POV tracking
  povCharacterId?: string;
  
  // Location tracking
  locationId?: string;
  
  // Timeline
  timelinePosition?: string; // e.g., "Day 3, Morning"
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SECTION 2: VERSION CONTROL (10-state undo system)
// ============================================================================

export interface VersionState {
  id: string;
  sceneId: string;
  
  // Content snapshot
  content: string;
  wordCount: number;
  
  // Metadata
  timestamp: Date;
  modifiedBy: 'user' | 'ai';
  description: string;
  toolUsed?: string; // If AI, which tool was used
  
  // For display
  previewText: string; // First 100 chars
}

export interface VersionStack {
  sceneId: string;
  versions: VersionState[]; // Max 10, newest first
  currentIndex: number; // Which version is active
}

// ============================================================================
// SECTION 3: STORY BIBLE SYSTEM
// ============================================================================

// ----- CHARACTERS -----

export interface Character {
  id: string;
  bookId: string;
  
  // Basic Info
  name: string;
  fullName?: string;
  aliases?: string[];
  role: CharacterRole;
  isDeceased: boolean;
  
  // Appearance
  avatar?: string;
  age?: number;
  ageDescription?: string; // "mid-thirties", "elderly"
  physicalDescription: string;
  distinctiveFeatures?: string[];
  
  // Voice & Personality
  voiceNotes: string; // How they speak
  personality: string;
  quirks?: string[];
  speechPatterns?: string[];
  
  // Arc & Motivation
  backstory: string;
  motivation: string;
  arc: string; // e.g., "Grief → Denial → Acceptance"
  internalConflict?: string;
  externalGoal?: string;
  
  // For Rowling-style tracking
  secrets?: CharacterSecret[];
  
  // For Character Web positioning
  webPosition: { x: number; y: number };
  webColor?: string;
  
  // Tracking
  appearsInChapters: number[];
  firstAppearance?: { chapterId: string; lineNumber?: number };
  
  createdAt: Date;
  updatedAt: Date;
}

export type CharacterRole = 
  | 'protagonist' 
  | 'antagonist' 
  | 'deuteragonist' // Second main character
  | 'mentor'
  | 'love-interest'
  | 'sidekick'
  | 'supporting'
  | 'minor'
  | 'mentioned'; // Referenced but never appears

export interface CharacterSecret {
  id: string;
  description: string;
  knownBy: string[]; // Character IDs who know
  revealedIn?: { chapterId: string; lineNumber?: number };
  status: 'hidden' | 'hinted' | 'revealed';
}

// ----- RELATIONSHIPS (Character Web edges) -----

export interface Relationship {
  id: string;
  bookId: string;
  
  // The two characters
  characterA: string; // Character ID
  characterB: string; // Character ID
  
  // Relationship info
  label: string; // "siblings", "ex-lovers", "enemies"
  type: RelationshipType;
  description?: string;
  
  // Evolution (for dynamic relationships)
  evolution?: RelationshipEvolution[];
  
  // Visual styling for Character Web
  lineStyle: 'solid' | 'dashed' | 'dotted';
  lineColor?: string;
  bidirectional: boolean; // Does it go both ways equally?
}

export type RelationshipType = 
  | 'family' 
  | 'romantic' 
  | 'former-romantic'
  | 'friendship' 
  | 'professional' 
  | 'antagonistic'
  | 'mentor-student'
  | 'rivals'
  | 'secret';

export interface RelationshipEvolution {
  chapter: number;
  description: string; // "Tension begins after betrayal"
  newType?: RelationshipType;
}

// ----- LOCATIONS -----

export interface Location {
  id: string;
  bookId: string;
  
  // Basic
  name: string;
  type: LocationType;
  description: string;
  
  // Sensory details (Sanderson-style immersion)
  sights?: string;
  sounds?: string;
  smells?: string;
  atmosphere?: string;
  
  // Connections
  parentLocationId?: string; // For nested locations (room in a building)
  connectedLocations?: string[]; // Adjacent places
  
  // History
  history?: string;
  significance?: string; // Why this place matters
  
  // Tracking
  appearsInChapters: number[];
  
  // For visual mapping
  mapPosition?: { x: number; y: number };
  
  createdAt: Date;
  updatedAt: Date;
}

export type LocationType = 
  | 'city' | 'town' | 'village'
  | 'building' | 'room' | 'outdoor'
  | 'landscape' | 'vehicle' | 'other';

// ----- WORLD RULES (Sanderson's Laws) -----

export interface WorldRule {
  id: string;
  bookId: string;
  
  category: WorldRuleCategory;
  name: string;
  description: string;
  
  // Sanderson's Laws compliance
  limitations?: string[]; // What it CAN'T do (Limitations > Powers)
  costs?: string[]; // What it costs to use
  
  // Consistency tracking
  exceptions?: WorldRuleException[];
  
  // Source tracking
  establishedIn?: { chapterId: string; lineNumber?: number };
  
  createdAt: Date;
  updatedAt: Date;
}

export type WorldRuleCategory = 
  | 'magic-system'
  | 'technology'
  | 'physics' // If different from our world
  | 'society'
  | 'economy'
  | 'religion'
  | 'politics'
  | 'biology'
  | 'other';

export interface WorldRuleException {
  id: string;
  description: string;
  reason?: string;
  occurredIn?: { chapterId: string; lineNumber?: number };
}

// ----- TIMELINE -----

export interface TimelineEvent {
  id: string;
  bookId: string;
  
  // Event details
  title: string;
  description?: string;
  
  // Timing
  storyDate?: string; // In-story date/time
  relativeTime?: string; // "3 days before Chapter 1"
  chapter?: number;
  
  // Type
  type: TimelineEventType;
  
  // Connections
  involvedCharacters?: string[];
  locationId?: string;
  
  // For timeline visualization
  order: number;
  
  createdAt: Date;
}

export type TimelineEventType = 
  | 'backstory'
  | 'plot-point'
  | 'character-moment'
  | 'world-event'
  | 'death'
  | 'revelation';

// ----- THEMES -----

export interface Theme {
  id: string;
  bookId: string;
  
  name: string;
  description: string;
  
  // How it manifests
  symbols?: string[];
  motifs?: string[];
  
  // Tracking
  occurrences?: ThemeOccurrence[];
}

export interface ThemeOccurrence {
  chapterId: string;
  description: string;
  type: 'subtle' | 'explicit' | 'symbolic';
}

// ----- RESEARCH NOTES -----

export interface ResearchNote {
  id: string;
  bookId: string;
  
  title: string;
  content: string;
  category?: string;
  source?: string;
  
  // Tagging
  tags?: string[];
  linkedCharacters?: string[];
  linkedLocations?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SECTION 4: CONTINUITY GUARDIAN
// ============================================================================

export interface ContinuityAlert {
  id: string;
  bookId: string;
  
  // Severity
  severity: 'error' | 'warning' | 'info';
  
  // Type of inconsistency
  type: ContinuityAlertType;
  
  // Where the problem is
  location: {
    chapterId: string;
    lineNumber?: number;
    text: string; // The problematic text
  };
  
  // What it conflicts with
  conflictsWith: {
    source: 'story-bible' | 'chapter' | 'timeline';
    reference: string; // ID or location
    originalText: string;
    description: string;
  };
  
  // Status
  status: 'active' | 'ignored' | 'resolved';
  resolution?: string;
  resolvedAt?: Date;
  
  createdAt: Date;
}

export type ContinuityAlertType = 
  | 'physical-description' // Eye color changed
  | 'character-location' // Character in two places
  | 'timeline' // Date/time inconsistency
  | 'character-knowledge' // Character knows something they shouldn't
  | 'object-placement' // Object moved without explanation
  | 'relationship' // Relationship contradicted
  | 'world-rule' // Magic/tech rule violated
  | 'death' // Dead character appears alive
  | 'name' // Name spelled differently
  | 'age'; // Age inconsistency

// ============================================================================
// SECTION 5: NARRATIVE THREAD TRACKER (Rowling-style)
// ============================================================================

export interface NarrativeThread {
  id: string;
  bookId: string;
  
  // Type of thread
  type: NarrativeThreadType;
  
  // The setup (planting)
  planted: {
    chapterId: string;
    lineNumber?: number;
    text: string;
    description: string; // What was planted
  };
  
  // The payoff (resolution)
  payoff?: {
    chapterId: string;
    lineNumber?: number;
    text: string;
    description: string;
  };
  
  // Status
  status: 'planted' | 'hinted' | 'partial' | 'resolved' | 'abandoned';
  
  // Notes
  notes?: string;
  
  // Reminder system
  reminderAtChapter?: number; // "Remind me to resolve this by Chapter X"
  
  createdAt: Date;
  updatedAt: Date;
}

export type NarrativeThreadType = 
  | 'foreshadowing' // Hints at future events
  | 'promise' // Promise made to reader
  | 'mystery' // Question raised
  | 'dramatic-irony' // Reader knows, character doesn't
  | 'chekhovs-gun' // Object/detail that must be used
  | 'setup-payoff' // Generic setup needing resolution
  | 'red-herring'; // Intentional misdirection

// ============================================================================
// SECTION 6: CLUE TRACKER (Rowling's color-coded system)
// ============================================================================

export interface Clue {
  id: string;
  bookId: string;
  
  // Type
  type: 'clue' | 'red-herring';
  
  // The clue itself
  location: {
    chapterId: string;
    lineNumber?: number;
    text: string;
  };
  
  description: string;
  
  // What it points to
  pointsTo?: string; // What truth/reveal this leads to
  
  // Reveal tracking
  revealedIn?: {
    chapterId: string;
    lineNumber?: number;
  };
  
  // For color-coding (blue = clue, red = red herring)
  color: 'blue' | 'red';
  
  status: 'planted' | 'revealed' | 'abandoned';
  
  createdAt: Date;
}

// ============================================================================
// SECTION 7: MAGIC SYSTEM BUILDER (Sanderson's Laws)
// ============================================================================

export interface MagicSystem {
  id: string;
  bookId: string;
  
  name: string;
  description: string;
  
  // Sanderson's First Law: Reader understanding = author's ability to solve problems
  hardness: 'soft' | 'medium' | 'hard'; // How well-defined are the rules?
  
  // Core mechanics
  source: string; // Where does the power come from?
  users: string; // Who can use it?
  
  // Sanderson's Second Law: Limitations > Powers
  powers: MagicPower[];
  limitations: MagicLimitation[];
  costs: MagicCost[];
  
  // Sanderson's Third Law: Expand before adding
  expansions?: MagicExpansion[];
  
  // Visual/sensory
  visualManifestation?: string;
  sideEffects?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface MagicPower {
  id: string;
  name: string;
  description: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'master';
}

export interface MagicLimitation {
  id: string;
  description: string;
  type: 'absolute' | 'conditional' | 'personal';
  // Absolute: Never possible
  // Conditional: Only under certain circumstances
  // Personal: Varies by user
}

export interface MagicCost {
  id: string;
  description: string;
  type: 'physical' | 'mental' | 'resource' | 'moral' | 'time';
}

export interface MagicExpansion {
  id: string;
  description: string;
  buildsOn: string; // Which existing power this expands
  introducedIn?: { chapterId: string };
}

// ============================================================================
// SECTION 8: AUTHOR MODE FEATURES
// ============================================================================

// ----- KING MODE: Discovery Writing -----

export interface WritingSession {
  id: string;
  bookId: string;
  userId: string;
  
  // Session data
  startTime: Date;
  endTime?: Date;
  
  // Word counts
  startingWordCount: number;
  endingWordCount?: number;
  wordsWritten: number;
  
  // Goal tracking
  dailyGoal: number;
  goalMet: boolean;
  
  // Where they stopped (King's mid-action stop)
  stoppedMidScene: boolean;
  resumeHint?: string; // What was happening when they stopped
}

export interface WritingStreak {
  userId: string;
  currentStreak: number; // Days in a row
  longestStreak: number;
  lastWritingDate: Date;
  totalDaysWritten: number;
}

export interface DailyGoal {
  userId: string;
  wordCount: number; // Default: 2000 (King's target)
  active: boolean;
}

// ----- PATTERSON MODE: Outlining & Hooks -----

export interface DetailedOutline {
  id: string;
  bookId: string;
  
  // Patterson writes 50-80 page outlines
  chapters: OutlineChapter[];
  
  wordCount: number; // Track outline length
  draftNumber: number; // Patterson does 3-6 drafts of outline
  
  createdAt: Date;
  updatedAt: Date;
}

export interface OutlineChapter {
  id: string;
  number: number;
  
  // Scene-by-scene breakdown
  scenes: OutlineScene[];
  
  // Patterson's hook requirement
  endingHook?: string;
  hookStrength?: 'weak' | 'medium' | 'strong' | 'cliffhanger';
  
  // Character arcs in this chapter
  characterBeats?: { characterId: string; beat: string }[];
  
  // Notes
  notes?: string;
}

export interface OutlineScene {
  id: string;
  order: number;
  
  // What happens
  description: string;
  
  // Key elements
  povCharacter?: string;
  location?: string;
  characters?: string[];
  
  // Emotional goal (Patterson: "know what you want emotionally")
  emotionalGoal?: string;
  
  // Status
  status: 'tbd' | 'sketched' | 'detailed' | 'written';
}

export interface ChapterHookAnalysis {
  chapterId: string;
  
  // Analysis results
  endingText: string; // Last 2-3 sentences
  hookType: 'question' | 'cliffhanger' | 'revelation' | 'tension' | 'mystery' | 'none';
  score: number; // 0-100
  
  suggestions?: string[];
}

// ----- ROWLING MODE: Series & Mystery -----

export interface Series {
  id: string;
  userId: string;
  
  name: string;
  description?: string;
  
  books: string[]; // Book IDs in order
  
  // Cross-book planning
  overarchingPlot?: string;
  seriesArc?: string;
  
  // Shared Story Bible elements
  sharedCharacters?: string[];
  sharedLocations?: string[];
  sharedWorldRules?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ChapterMatrix {
  bookId: string;
  
  // Columns = subplots
  subplots: Subplot[];
  
  // Rows = chapters with their subplot involvement
  chapters: ChapterMatrixRow[];
}

export interface Subplot {
  id: string;
  name: string;
  color: string; // For visual coding
  description?: string;
}

export interface ChapterMatrixRow {
  chapterId: string;
  chapterNumber: number;
  
  // What happens in each subplot this chapter
  subplotBeats: {
    subplotId: string;
    beat: string;
    status: 'planned' | 'written';
  }[];
  
  // Main plot beat
  mainPlotBeat?: string;
}

// ----- READER AVATAR (Patterson: Write for one reader) -----

export interface ReaderAvatar {
  id: string;
  bookId: string;
  
  // Demographics
  name?: string;
  age?: number;
  ageRange?: string;
  
  // Reading preferences
  favoriteBooks?: string[];
  favoriteAuthors?: string[];
  genres?: string[];
  
  // What they want
  readsFor: ('escape' | 'learning' | 'entertainment' | 'emotion' | 'thrill')[];
  pacing: 'slow-burn' | 'moderate' | 'fast-paced';
  
  // What they hate
  petPeeves?: string[];
  turnoffs?: string[];
  
  // Notes
  notes?: string;
}

// ============================================================================
// SECTION 9: CANVAS & WORKSPACE
// ============================================================================

export interface CanvasState {
  bookId: string;
  currentChapterId?: string;
  currentSceneId?: string;
  
  // Split view
  viewMode: 'write' | 'split' | 'preview';
  
  // Chat pane
  chatOpen: boolean;
  chatHistory: ChatMessage[];
  
  // Tool state
  activeToolId?: string;
  
  // Selection
  selectedText?: {
    start: number;
    end: number;
    text: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  
  // If AI made changes
  changes?: {
    type: 'addition' | 'replacement' | 'suggestion';
    originalText?: string;
    newText: string;
    accepted?: boolean;
  };
  
  // Tool used
  toolUsed?: string;
}

// ============================================================================
// SECTION 10: USER PREFERENCES & ENTRY POINTS
// ============================================================================

export interface UserProfile {
  id: string;
  userId: string;
  
  // Name for personalized greeting
  displayName: string;
  
  // Writing preferences
  authorMode: 'king' | 'sanderson' | 'rowling' | 'patterson' | 'hybrid';
  
  // Goals
  dailyWordGoal: number;
  
  // UI preferences
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
  
  // Feature toggles
  enableContinuityGuardian: boolean;
  enableThreadTracker: boolean;
  enableHookChecker: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export type EntryPoint = 
  | 'idea' // Just a concept
  | 'notes' // Outline or notes
  | 'draft' // Have a draft
  | 'finished'; // Polished manuscript

export interface JourneyState {
  userId: string;
  bookId: string;
  
  entryPoint: EntryPoint;
  currentPhase: BookStatus;
  
  // What tools they've used
  toolsUsed: string[];
  
  // Suggestions
  recommendedNextTool?: string;
  skippedTools?: string[];
}

// ============================================================================
// SECTION 11: TOOL SYSTEM (Extended)
// ============================================================================

export type ToolCategory = 'generate' | 'enhance' | 'analyze' | 'brainstorm' | 'craft';

export type ToolScope = 'scene' | 'chapter' | 'book' | 'hybrid';

export interface AITool {
  id: string;
  category: ToolCategory;
  scope: ToolScope;
  
  name: string;
  description: string;
  icon: string;
  shortcut?: string;
  color: string;
  
  // Requirements
  requiresSelection: boolean;
  requiresStoryBible?: boolean;
  
  // Input/Output
  inputType: 'text' | 'selection' | 'context' | 'none';
  outputType: 'text' | 'suggestions' | 'analysis' | 'data';
  
  // Placeholders
  placeholders: {
    input: string;
    output: string;
  };
  
  // Chaining
  canChainTo: string[];
  
  // Constraints
  minInputLength?: number;
  maxInputLength?: number;
  estimatedTokens: number;
  
  // Master author alignment
  inspiredBy?: ('king' | 'sanderson' | 'rowling' | 'patterson')[];
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export type {
  // Core
  Book,
  Chapter,
  Scene,
  
  // Version Control
  VersionState,
  VersionStack,
  
  // Story Bible
  Character,
  Relationship,
  Location,
  WorldRule,
  TimelineEvent,
  Theme,
  ResearchNote,
  
  // Continuity
  ContinuityAlert,
  
  // Narrative
  NarrativeThread,
  Clue,
  
  // Magic
  MagicSystem,
  
  // Author Modes
  WritingSession,
  WritingStreak,
  DetailedOutline,
  ChapterHookAnalysis,
  Series,
  ChapterMatrix,
  ReaderAvatar,
  
  // Workspace
  CanvasState,
  ChatMessage,
  
  // User
  UserProfile,
  JourneyState,
  
  // Tools
  AITool,
};

// ============================================================================
// SECTION: AI STUDIO TOOL TYPES (for AIStudioPage)
// ============================================================================

export type ToolId = string;

export type ToolScope = 'scene' | 'chapter' | 'book' | 'hybrid';

export type ScopeView = 'scene' | 'book' | 'all';

export type CategoryFilter = 'all' | 'generate' | 'enhance' | 'analyze' | 'brainstorm' | 'craft';

export interface Document {
  id: string;
  bookId: string;
  chapterId?: string;
  title: string;
  content: string;
  wordCount: number;
  type: 'scene' | 'chapter' | 'notes' | 'outline';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HybridScopeSelection {
  scope: 'scene' | 'book';
  bookId: string;
  documentId?: string;
}

export interface AIStudioState {
  selectedScope: ScopeView;
  selectedCategory: CategoryFilter;
  selectedBook?: Book;
  selectedDocument?: Document;
  activeToolId?: ToolId;
  isExecuting: boolean;
  error?: string;
}

export interface ToolContext {
  userId?: string;
  bookId: string;
  documentId?: string;
  content?: string;
  selection?: string;
  scope: ToolScope;
}


// ============================================================================
// ANALYSIS TYPES
// ============================================================================

export interface AnalysisIssue {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  location?: {
    start: number;
    end: number;
  };
  suggestion?: string;
}

export interface AnalysisResult {
  score?: number;
  metrics?: Record<string, unknown>;
  issues: AnalysisIssue[];
  suggestions: string[];
  summary?: string;
}



// ============================================================================
// BRAINSTORM TYPES
// ============================================================================

export interface StructuredItem {
  id: string;
  title: string;
  description: string;
  selected?: boolean;
  details?: Record<string, string>;
}


export function validateToolExecution(
  toolId: ToolId, 
  context: ToolContext
): { valid: boolean; error?: string } {
  if (!toolId) {
    return { valid: false, error: 'No tool selected' };
  }
  
  if (!context.bookId) {
    return { valid: false, error: 'Please select a book first' };
  }
  
  if (context.scope === 'scene' && !context.documentId) {
    return { valid: false, error: 'Please select a scene or chapter' };
  }
  
  return { valid: true };
}

// Define ToolCategory directly to avoid circular imports
export type ToolCategory = 'generate' | 'enhance' | 'analyze' | 'brainstorm' | 'craft';

