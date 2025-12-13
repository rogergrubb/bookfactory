// Continuity Guardian - Type Definitions
// Tracks facts, characters, timeline, and consistency across chapters

// ============================================
// FACT TRACKING
// ============================================

export type FactCategory = 
  | 'character_trait'      // Physical appearance, personality
  | 'character_knowledge'  // What a character knows/doesn't know
  | 'character_status'     // Alive, injured, location, relationship status
  | 'timeline'             // When events occur
  | 'location'             // Place details, geography
  | 'object'               // Items, their location, state
  | 'world_rule'           // Magic systems, technology, laws of the world
  | 'relationship'         // How characters relate to each other
  | 'plot_thread'          // Ongoing storylines
  | 'custom';

export interface StoryFact {
  id: string;
  bookId: string;
  category: FactCategory;
  
  // The fact itself
  subject: string;           // Who/what the fact is about
  attribute: string;         // What aspect (e.g., "eye color", "knows about")
  value: string;             // The value (e.g., "blue", "the murder")
  
  // Source tracking
  establishedIn: {
    chapterId: string;
    chapterTitle: string;
    sceneId?: string;
    excerpt: string;         // The text that establishes this fact
    position: number;        // Character position in chapter
  };
  
  // Change tracking
  history: FactChange[];
  currentValue: string;
  
  // Metadata
  confidence: 'explicit' | 'implied' | 'inferred';
  importance: 'critical' | 'significant' | 'minor';
  
  // AI-extracted or user-defined
  source: 'extracted' | 'user' | 'story_bible';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface FactChange {
  id: string;
  factId: string;
  previousValue: string;
  newValue: string;
  changedIn: {
    chapterId: string;
    chapterTitle: string;
    excerpt: string;
    position: number;
  };
  changeType: 'update' | 'contradiction' | 'resolution';
  isValid: boolean;          // User-confirmed if the change is intentional
  notes?: string;
  timestamp: Date;
}

// ============================================
// TIMELINE TRACKING
// ============================================

export interface TimelineEvent {
  id: string;
  bookId: string;
  
  // Event details
  description: string;
  
  // When
  storyTime: {
    type: 'absolute' | 'relative';
    // For absolute: "March 15, 1995"
    // For relative: "3 days after the murder"
    value: string;
    dayNumber?: number;      // Normalized day number for ordering
  };
  
  // Duration
  duration?: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  };
  
  // Where in the manuscript
  chapterId: string;
  chapterTitle: string;
  sceneId?: string;
  position: number;
  
  // Participants
  characters: string[];
  locations: string[];
  
  // Connections
  causedBy?: string;         // Event ID that caused this
  causes?: string[];         // Event IDs this causes
  
  // Metadata
  importance: 'critical' | 'significant' | 'minor';
  
  createdAt: Date;
}

// ============================================
// CHARACTER TRACKING
// ============================================

export interface CharacterState {
  characterId: string;
  characterName: string;
  bookId: string;
  
  // Current state (updates as story progresses)
  currentState: {
    location: string;
    status: 'alive' | 'dead' | 'unknown' | 'injured';
    emotionalState?: string;
    lastSeenChapter: string;
    lastSeenPosition: number;
  };
  
  // Knowledge tracking - what does this character know?
  knowledge: {
    fact: string;
    learnedIn: {
      chapterId: string;
      position: number;
    };
    confidence: 'certain' | 'suspected' | 'unknown';
  }[];
  
  // Trait tracking
  traits: {
    trait: string;
    value: string;
    establishedIn: string;   // chapterId
    isConsistent: boolean;
    inconsistencies?: {
      chapterId: string;
      conflictingValue: string;
      excerpt: string;
    }[];
  }[];
  
  // Chapter appearances
  appearances: {
    chapterId: string;
    chapterTitle: string;
    role: 'pov' | 'present' | 'mentioned' | 'referenced';
    scenes: string[];
  }[];
}

// ============================================
// CONSISTENCY ISSUES
// ============================================

export type IssueType = 
  | 'contradiction'          // Fact contradicts earlier established fact
  | 'timeline_conflict'      // Events in impossible sequence
  | 'character_knowledge'    // Character knows something they shouldn't
  | 'location_impossible'    // Character can't be in two places
  | 'trait_inconsistency'    // Character trait changed without reason
  | 'unresolved_thread'      // Plot thread left hanging
  | 'forgotten_element'      // Important element not mentioned again
  | 'anachronism'           // Timeline/era inconsistency
  | 'logic_error';          // General logical impossibility

export type IssueSeverity = 'critical' | 'warning' | 'suggestion';

export interface ConsistencyIssue {
  id: string;
  bookId: string;
  type: IssueType;
  severity: IssueSeverity;
  
  // What's the problem
  title: string;
  description: string;
  
  // Where it occurs
  locations: {
    chapterId: string;
    chapterTitle: string;
    excerpt: string;
    position: number;
  }[];
  
  // The conflicting facts
  conflictingFacts?: {
    factId: string;
    value: string;
    location: string;
  }[];
  
  // AI suggestions for resolution
  suggestions: {
    approach: string;
    description: string;
    affectedChapters: string[];
  }[];
  
  // Status
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed';
  resolution?: {
    method: 'fixed' | 'intentional' | 'wont_fix';
    notes: string;
    resolvedAt: Date;
  };
  
  // Metadata
  detectedAt: Date;
  detectedBy: 'auto' | 'user';
}

// ============================================
// ANALYSIS RESULTS
// ============================================

export interface ContinuityAnalysis {
  bookId: string;
  analyzedAt: Date;
  chaptersAnalyzed: number;
  
  // Summary stats
  stats: {
    totalFacts: number;
    totalEvents: number;
    totalCharacters: number;
    issuesFound: number;
    criticalIssues: number;
    warningIssues: number;
  };
  
  // Health score (0-100)
  continuityScore: number;
  
  // Breakdown
  scoreBreakdown: {
    characterConsistency: number;
    timelineAccuracy: number;
    plotCoherence: number;
    worldConsistency: number;
  };
  
  // Top issues
  topIssues: ConsistencyIssue[];
  
  // Unresolved plot threads
  unresolvedThreads: {
    thread: string;
    introducedIn: string;
    lastMentionedIn: string;
    chaptersSince: number;
  }[];
}

// ============================================
// EXTRACTION & SCANNING
// ============================================

export interface ExtractionRequest {
  bookId: string;
  chapterId: string;
  chapterContent: string;
  existingFacts?: StoryFact[];
  existingCharacters?: CharacterState[];
}

export interface ExtractionResult {
  facts: Omit<StoryFact, 'id' | 'createdAt' | 'updatedAt'>[];
  events: Omit<TimelineEvent, 'id' | 'createdAt'>[];
  characterUpdates: {
    characterId?: string;
    characterName: string;
    updates: Partial<CharacterState>;
  }[];
  potentialIssues: Omit<ConsistencyIssue, 'id' | 'detectedAt'>[];
}

export interface ScanOptions {
  // What to check
  checkTimeline: boolean;
  checkCharacterTraits: boolean;
  checkCharacterKnowledge: boolean;
  checkLocations: boolean;
  checkPlotThreads: boolean;
  checkWorldRules: boolean;
  
  // Scope
  chapters?: string[];       // Specific chapters, or all if empty
  
  // Sensitivity
  reportMinorIssues: boolean;
}

// ============================================
// UI STATE
// ============================================

export interface ContinuityPanelState {
  view: 'dashboard' | 'facts' | 'timeline' | 'characters' | 'issues';
  filters: {
    category?: FactCategory;
    character?: string;
    chapter?: string;
    severity?: IssueSeverity;
    status?: ConsistencyIssue['status'];
  };
  selectedIssue?: string;
  isScanning: boolean;
  scanProgress?: {
    phase: string;
    progress: number;
  };
}
