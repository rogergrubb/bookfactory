// AI Feedback & Critique Types

export type AnalysisScope = 'FULL_BOOK' | 'CHAPTER' | 'SELECTION';

export type FeedbackCategory = 
  | 'pacing'
  | 'dialogue'
  | 'prose_quality'
  | 'character_development'
  | 'plot_structure'
  | 'world_building'
  | 'tension'
  | 'emotional_impact'
  | 'voice_consistency'
  | 'show_dont_tell'
  | 'opening_hook'
  | 'chapter_endings'
  | 'scene_structure'
  | 'description_balance'
  | 'readability';

export type FeedbackSeverity = 'suggestion' | 'minor' | 'moderate' | 'significant' | 'critical';

export interface ManuscriptAnalysis {
  id: string;
  userId: string;
  bookId: string;
  scope: AnalysisScope;
  chapterId?: string;
  
  // Overall assessment
  overallScore: number; // 0-100
  
  // Category scores
  scores: CategoryScores;
  
  // Detailed feedback
  strengths: FeedbackItem[];
  weaknesses: FeedbackItem[];
  opportunities: FeedbackItem[];
  
  // Specific issues with locations
  issues: SpecificIssue[];
  
  // Genre analysis
  genreFit?: GenreFitAnalysis;
  
  // Comparable works
  similarWorks?: SimilarWork[];
  
  // Executive summary
  executiveSummary: string;
  
  // Priority actions
  priorityActions: PriorityAction[];
  
  // Metadata
  wordCountAnalyzed: number;
  analysisVersion: string;
  createdAt: Date;
}

export interface CategoryScores {
  pacing: number;
  dialogue: number;
  prose_quality: number;
  character_development: number;
  plot_structure: number;
  world_building: number;
  tension: number;
  emotional_impact: number;
  voice_consistency: number;
  show_dont_tell: number;
  [key: string]: number;
}

export interface FeedbackItem {
  category: FeedbackCategory;
  title: string;
  description: string;
  examples?: TextExample[];
  suggestions?: string[];
  score?: number;
}

export interface TextExample {
  text: string;
  chapterId?: string;
  chapterTitle?: string;
  location?: string; // "Chapter 3, paragraph 5"
}

export interface SpecificIssue {
  id: string;
  type: IssueType;
  severity: FeedbackSeverity;
  category: FeedbackCategory;
  title: string;
  description: string;
  location: IssueLocation;
  excerpt?: string;
  suggestion?: string;
  autoFixAvailable?: boolean;
}

export type IssueType = 
  | 'pacing_issue'
  | 'dialogue_problem'
  | 'telling_not_showing'
  | 'weak_verb'
  | 'passive_voice'
  | 'repetition'
  | 'cliche'
  | 'info_dump'
  | 'head_hopping'
  | 'tense_inconsistency'
  | 'character_inconsistency'
  | 'plot_hole'
  | 'unclear_motivation'
  | 'weak_opening'
  | 'weak_ending'
  | 'overwriting'
  | 'underwriting';

export interface IssueLocation {
  chapterId?: string;
  chapterTitle?: string;
  paragraphIndex?: number;
  sentenceIndex?: number;
  startOffset?: number;
  endOffset?: number;
}

export interface GenreFitAnalysis {
  genre: string;
  fitScore: number; // 0-100
  expectations: GenreExpectation[];
  gaps: string[];
  recommendations: string[];
}

export interface GenreExpectation {
  element: string;
  expected: string;
  found: string;
  met: boolean;
}

export interface SimilarWork {
  title: string;
  author: string;
  similarityScore: number;
  sharedElements: string[];
  differentiators: string[];
}

export interface PriorityAction {
  priority: number; // 1-5, 1 being highest
  category: FeedbackCategory;
  action: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  affectedAreas: string[];
}

// Feedback action tracking
export type FeedbackActionStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'ADDRESSED'
  | 'DISMISSED'
  | 'WONT_FIX';

export interface FeedbackAction {
  id: string;
  analysisId: string;
  feedbackType: 'strength' | 'weakness' | 'opportunity' | 'issue';
  feedbackIndex: number;
  status: FeedbackActionStatus;
  notes?: string;
  addressedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Progress tracking
export interface CritiqueHistory {
  id: string;
  bookId: string;
  overallScore: number;
  categoryScores: CategoryScores;
  wordCount: number;
  changesFromLast?: ScoreChanges;
  recordedAt: Date;
}

export interface ScoreChanges {
  overall: number;
  categories: Partial<CategoryScores>;
}

// Analysis request
export interface AnalysisRequest {
  bookId: string;
  scope: AnalysisScope;
  chapterId?: string;
  selectionStart?: number;
  selectionEnd?: number;
  focusAreas?: FeedbackCategory[];
  genre?: string;
  compareToGenre?: boolean;
  findSimilarWorks?: boolean;
}

// Analysis progress
export interface AnalysisProgress {
  status: 'queued' | 'analyzing' | 'completed' | 'failed';
  phase?: string;
  progress?: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
}

// Category metadata
export const CATEGORY_INFO: Record<FeedbackCategory, {
  name: string;
  description: string;
  icon: string;
}> = {
  pacing: {
    name: 'Pacing',
    description: 'Flow and rhythm of the story',
    icon: '⏱️'
  },
  dialogue: {
    name: 'Dialogue',
    description: 'Character speech and conversations',
    icon: '💬'
  },
  prose_quality: {
    name: 'Prose Quality',
    description: 'Writing style and sentence construction',
    icon: '✍️'
  },
  character_development: {
    name: 'Character Development',
    description: 'Character depth and growth',
    icon: '👤'
  },
  plot_structure: {
    name: 'Plot Structure',
    description: 'Story architecture and progression',
    icon: '📊'
  },
  world_building: {
    name: 'World Building',
    description: 'Setting and world details',
    icon: '🌍'
  },
  tension: {
    name: 'Tension',
    description: 'Conflict and suspense',
    icon: '⚡'
  },
  emotional_impact: {
    name: 'Emotional Impact',
    description: 'Reader emotional engagement',
    icon: '❤️'
  },
  voice_consistency: {
    name: 'Voice Consistency',
    description: 'Narrative voice stability',
    icon: '🎭'
  },
  show_dont_tell: {
    name: 'Show Don\'t Tell',
    description: 'Descriptive vs expository balance',
    icon: '👁️'
  },
  opening_hook: {
    name: 'Opening Hook',
    description: 'Chapter/scene beginnings',
    icon: '🎣'
  },
  chapter_endings: {
    name: 'Chapter Endings',
    description: 'Chapter closings and cliffhangers',
    icon: '🔚'
  },
  scene_structure: {
    name: 'Scene Structure',
    description: 'Individual scene construction',
    icon: '🎬'
  },
  description_balance: {
    name: 'Description Balance',
    description: 'Action vs description ratio',
    icon: '⚖️'
  },
  readability: {
    name: 'Readability',
    description: 'Ease of reading and comprehension',
    icon: '📖'
  }
};

// Severity colors
export const SEVERITY_COLORS: Record<FeedbackSeverity, {
  bg: string;
  text: string;
  border: string;
}> = {
  suggestion: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30'
  },
  minor: {
    bg: 'bg-stone-500/10',
    text: 'text-stone-400',
    border: 'border-stone-500/30'
  },
  moderate: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30'
  },
  significant: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30'
  },
  critical: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30'
  }
};
