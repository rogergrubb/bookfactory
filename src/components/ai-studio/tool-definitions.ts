// ============================================================================
// BOOKFACTORY AI - COMPLETE TOOL DEFINITIONS
// 44 Tools Inspired by Master Authors
// ============================================================================

import { 
  Sparkles, Wand2, MessageSquare, Eye, Zap, Brain,
  PenTool, BookOpen, Target, TrendingUp, BarChart3,
  Lightbulb, Users, Map, Swords, GitBranch, Clock,
  Heart, Flame, AlertTriangle, Skull, Crown, Search,
  FileText, Repeat, Shuffle, Volume2, Palette, Scissors,
  ArrowRight, Layers, Grid, List, ChevronRight
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type ToolCategory = 'generate' | 'enhance' | 'analyze' | 'brainstorm' | 'craft';
export type ToolScope = 'scene' | 'chapter' | 'book' | 'hybrid';
export type AuthorMode = 'king' | 'sanderson' | 'rowling' | 'patterson' | 'collins';

export interface AITool {
  id: string;
  category: ToolCategory;
  scope: ToolScope;
  
  name: string;
  description: string;
  longDescription?: string;
  icon: any; // Lucide icon component
  shortcut?: string;
  
  // Visual
  color: string;
  gradient?: string;
  
  // Requirements
  requiresSelection: boolean;
  requiresStoryBible?: boolean;
  requiresOutline?: boolean;
  
  // Input/Output
  inputType: 'text' | 'selection' | 'context' | 'structured' | 'none';
  outputType: 'text' | 'suggestions' | 'analysis' | 'data' | 'structured';
  
  // Placeholders
  placeholders: {
    input: string;
    output: string;
  };
  
  // Workflow chaining
  canChainTo: string[];
  suggestedAfter?: string[];
  
  // Constraints
  minInputLength?: number;
  maxInputLength?: number;
  estimatedTokens: number;
  
  // Master author alignment
  inspiredBy?: AuthorMode[];
  
  // Custom options
  options?: ToolOption[];
}

export interface ToolOption {
  id: string;
  label: string;
  type: 'select' | 'toggle' | 'number' | 'text';
  default: any;
  choices?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

// ============================================================================
// GENERATE TOOLS (6)
// ============================================================================

export const generateTools: AITool[] = [
  {
    id: 'continue-writing',
    category: 'generate',
    scope: 'scene',
    name: 'Continue Writing',
    description: 'AI continues your story matching your voice',
    longDescription: 'Seamlessly picks up where you left off, maintaining your unique voice, style, and narrative momentum. Perfect for pushing through blocks.',
    icon: ArrowRight,
    shortcut: '⌘⇧C',
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'text',
    placeholders: {
      input: 'Select where to continue from...',
      output: 'Continuing your story...'
    },
    canChainTo: ['improve-prose', 'add-tension', 'deepen-emotion'],
    estimatedTokens: 1500,
    inspiredBy: ['king'],
    options: [
      {
        id: 'length',
        label: 'Length',
        type: 'select',
        default: 'medium',
        choices: [
          { value: 'short', label: '~200 words' },
          { value: 'medium', label: '~500 words' },
          { value: 'long', label: '~1000 words' }
        ]
      },
      {
        id: 'stopMidAction',
        label: 'Stop mid-action (King method)',
        type: 'toggle',
        default: true
      }
    ]
  },
  {
    id: 'first-draft',
    category: 'generate',
    scope: 'scene',
    name: 'First Draft Mode',
    description: 'Transform outlines into full scenes',
    longDescription: 'Takes your outline, beats, or notes and expands them into a complete first draft scene with proper pacing and structure.',
    icon: PenTool,
    shortcut: '⌘⇧F',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    requiresSelection: false,
    requiresOutline: true,
    inputType: 'structured',
    outputType: 'text',
    placeholders: {
      input: 'Paste your outline or scene beats...',
      output: 'Generating first draft...'
    },
    canChainTo: ['improve-prose', 'write-dialogue', 'add-description'],
    estimatedTokens: 2000,
    inspiredBy: ['patterson', 'sanderson'],
    options: [
      {
        id: 'detailLevel',
        label: 'Detail Level',
        type: 'select',
        default: 'balanced',
        choices: [
          { value: 'sparse', label: 'Sparse (action-focused)' },
          { value: 'balanced', label: 'Balanced' },
          { value: 'rich', label: 'Rich (descriptive)' }
        ]
      }
    ]
  },
  {
    id: 'write-dialogue',
    category: 'generate',
    scope: 'scene',
    name: 'Write Dialogue',
    description: 'Create authentic character conversations',
    longDescription: 'Generates natural dialogue that reveals character, advances plot, and maintains distinct voices for each speaker.',
    icon: MessageSquare,
    shortcut: '⌘⇧D',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'structured',
    outputType: 'text',
    placeholders: {
      input: 'Describe the conversation context and participants...',
      output: 'Writing dialogue...'
    },
    canChainTo: ['improve-prose', 'add-tension', 'character-voice-check'],
    estimatedTokens: 1200,
    options: [
      {
        id: 'characters',
        label: 'Characters',
        type: 'text',
        default: ''
      },
      {
        id: 'subtext',
        label: 'Include subtext',
        type: 'toggle',
        default: true
      },
      {
        id: 'conflictLevel',
        label: 'Conflict Level',
        type: 'select',
        default: 'medium',
        choices: [
          { value: 'low', label: 'Friendly' },
          { value: 'medium', label: 'Tension' },
          { value: 'high', label: 'Confrontation' }
        ]
      }
    ]
  },
  {
    id: 'add-description',
    category: 'generate',
    scope: 'scene',
    name: 'Add Description',
    description: 'Rich sensory and environmental details',
    longDescription: 'Weaves in vivid sensory details, atmosphere, and world-building without slowing pace. Shows rather than tells.',
    icon: Eye,
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select the passage to enhance...',
      output: 'Adding description...'
    },
    canChainTo: ['improve-prose', 'sensory-details'],
    estimatedTokens: 800,
    inspiredBy: ['sanderson'],
    options: [
      {
        id: 'focus',
        label: 'Focus',
        type: 'select',
        default: 'balanced',
        choices: [
          { value: 'visual', label: 'Visual' },
          { value: 'sensory', label: 'All Senses' },
          { value: 'emotional', label: 'Emotional/Atmosphere' },
          { value: 'balanced', label: 'Balanced' }
        ]
      }
    ]
  },
  {
    id: 'action-scene',
    category: 'generate',
    scope: 'scene',
    name: 'Action Scene',
    description: 'Dynamic, fast-paced action sequences',
    longDescription: 'Creates visceral, cinematic action with clear choreography, escalating stakes, and emotional beats woven throughout.',
    icon: Zap,
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
    requiresSelection: false,
    inputType: 'structured',
    outputType: 'text',
    placeholders: {
      input: 'Describe the action setup and stakes...',
      output: 'Writing action sequence...'
    },
    canChainTo: ['add-tension', 'improve-prose'],
    estimatedTokens: 1500,
    inspiredBy: ['collins', 'patterson'],
    options: [
      {
        id: 'pacing',
        label: 'Pacing',
        type: 'select',
        default: 'fast',
        choices: [
          { value: 'building', label: 'Building tension' },
          { value: 'fast', label: 'Fast-paced' },
          { value: 'frenetic', label: 'Frenetic' }
        ]
      },
      {
        id: 'violence',
        label: 'Violence Level',
        type: 'select',
        default: 'moderate',
        choices: [
          { value: 'mild', label: 'Mild' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'intense', label: 'Intense' }
        ]
      }
    ]
  },
  {
    id: 'inner-thoughts',
    category: 'generate',
    scope: 'scene',
    name: 'Inner Thoughts',
    description: 'Deep character internal monologue',
    longDescription: 'Adds rich internal monologue that reveals character psychology, conflicts, and growth without breaking narrative flow.',
    icon: Brain,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    requiresSelection: true,
    requiresStoryBible: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select where to add internal thoughts...',
      output: 'Writing inner thoughts...'
    },
    canChainTo: ['deepen-emotion', 'improve-prose'],
    estimatedTokens: 600,
    options: [
      {
        id: 'character',
        label: 'POV Character',
        type: 'text',
        default: ''
      },
      {
        id: 'depth',
        label: 'Psychological Depth',
        type: 'select',
        default: 'medium',
        choices: [
          { value: 'surface', label: 'Surface thoughts' },
          { value: 'medium', label: 'Layered' },
          { value: 'deep', label: 'Deep psychology' }
        ]
      }
    ]
  }
];

// ============================================================================
// ENHANCE TOOLS (6)
// ============================================================================

export const enhanceTools: AITool[] = [
  {
    id: 'improve-prose',
    category: 'enhance',
    scope: 'scene',
    name: 'Improve Prose',
    description: 'Elevate writing while keeping your voice',
    longDescription: 'Refines sentence structure, word choice, and rhythm while preserving your unique authorial voice. The "darling detector" flags over-polished passages.',
    icon: Sparkles,
    shortcut: '⌘⇧I',
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select text to improve...',
      output: 'Improving prose...'
    },
    canChainTo: ['vary-sentences', 'show-dont-tell'],
    estimatedTokens: 800,
    inspiredBy: ['king'],
    options: [
      {
        id: 'intensity',
        label: 'Edit Intensity',
        type: 'select',
        default: 'moderate',
        choices: [
          { value: 'light', label: 'Light touch' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'aggressive', label: 'Aggressive' }
        ]
      },
      {
        id: 'flagDarlings',
        label: 'Flag potential "darlings"',
        type: 'toggle',
        default: true
      }
    ]
  },
  {
    id: 'show-dont-tell',
    category: 'enhance',
    scope: 'scene',
    name: 'Show Don\'t Tell',
    description: 'Transform telling into vivid showing',
    longDescription: 'Converts abstract statements and summaries into concrete scenes with action, dialogue, and sensory details that let readers experience the story.',
    icon: Eye,
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select "telling" passage to transform...',
      output: 'Transforming to showing...'
    },
    canChainTo: ['improve-prose', 'sensory-details'],
    estimatedTokens: 1000,
    options: [
      {
        id: 'expansionFactor',
        label: 'Expansion',
        type: 'select',
        default: 'moderate',
        choices: [
          { value: 'compact', label: 'Compact (1.5x)' },
          { value: 'moderate', label: 'Moderate (2x)' },
          { value: 'expanded', label: 'Expanded (3x)' }
        ]
      }
    ]
  },
  {
    id: 'deepen-emotion',
    category: 'enhance',
    scope: 'scene',
    name: 'Deepen Emotion',
    description: 'Add emotional resonance and depth',
    longDescription: 'Intensifies emotional impact through physical reactions, internal thoughts, metaphor, and pacing. Makes readers feel what characters feel.',
    icon: Heart,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select passage to deepen...',
      output: 'Deepening emotion...'
    },
    canChainTo: ['improve-prose', 'inner-thoughts'],
    estimatedTokens: 800,
    options: [
      {
        id: 'emotion',
        label: 'Target Emotion',
        type: 'select',
        default: 'auto',
        choices: [
          { value: 'auto', label: 'Auto-detect' },
          { value: 'joy', label: 'Joy' },
          { value: 'sadness', label: 'Sadness' },
          { value: 'fear', label: 'Fear' },
          { value: 'anger', label: 'Anger' },
          { value: 'love', label: 'Love' },
          { value: 'grief', label: 'Grief' }
        ]
      }
    ]
  },
  {
    id: 'add-tension',
    category: 'enhance',
    scope: 'scene',
    name: 'Add Tension',
    description: 'Increase stakes and suspense',
    longDescription: 'Injects tension through pacing, word choice, unresolved questions, and mounting pressure. Essential for page-turners.',
    icon: Flame,
    shortcut: '⌘⇧T',
    color: 'red',
    gradient: 'from-red-500 to-orange-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select passage to add tension...',
      output: 'Adding tension...'
    },
    canChainTo: ['improve-prose', 'hook-checker'],
    estimatedTokens: 800,
    inspiredBy: ['patterson', 'collins'],
    options: [
      {
        id: 'tensionType',
        label: 'Tension Type',
        type: 'select',
        default: 'suspense',
        choices: [
          { value: 'suspense', label: 'Suspense' },
          { value: 'dread', label: 'Dread' },
          { value: 'urgency', label: 'Urgency' },
          { value: 'interpersonal', label: 'Interpersonal' }
        ]
      }
    ]
  },
  {
    id: 'vary-sentences',
    category: 'enhance',
    scope: 'scene',
    name: 'Vary Sentences',
    description: 'Improve rhythm and flow',
    longDescription: 'Analyzes and varies sentence length and structure to create better rhythm. Short punchy sentences for impact. Longer ones for flow.',
    icon: Repeat,
    color: 'indigo',
    gradient: 'from-indigo-500 to-violet-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select passage to vary...',
      output: 'Varying sentences...'
    },
    canChainTo: ['improve-prose'],
    estimatedTokens: 600
  },
  {
    id: 'sensory-details',
    category: 'enhance',
    scope: 'scene',
    name: 'Sensory Details',
    description: 'Enrich with all five senses',
    longDescription: 'Adds sight, sound, smell, taste, and touch details that immerse readers in your world. Goes beyond just visual description.',
    icon: Volume2,
    color: 'lime',
    gradient: 'from-lime-500 to-green-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select passage to enrich...',
      output: 'Adding sensory details...'
    },
    canChainTo: ['improve-prose'],
    estimatedTokens: 600,
    inspiredBy: ['sanderson'],
    options: [
      {
        id: 'senses',
        label: 'Focus Senses',
        type: 'select',
        default: 'all',
        choices: [
          { value: 'all', label: 'All senses' },
          { value: 'visual', label: 'Sight' },
          { value: 'audio', label: 'Sound' },
          { value: 'olfactory', label: 'Smell' },
          { value: 'tactile', label: 'Touch' }
        ]
      }
    ]
  }
];

// ============================================================================
// ANALYZE TOOLS (8)
// ============================================================================

export const analyzeTools: AITool[] = [
  {
    id: 'pacing-analysis',
    category: 'analyze',
    scope: 'chapter',
    name: 'Pacing Analysis',
    description: 'Evaluate narrative flow and rhythm',
    longDescription: 'Visualizes pacing across your chapter or book, identifying slow sections, rushed moments, and suggesting adjustments for better flow.',
    icon: TrendingUp,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Analyzing chapter pacing...',
      output: 'Pacing report...'
    },
    canChainTo: ['add-tension', 'vary-sentences'],
    estimatedTokens: 1500,
    inspiredBy: ['patterson']
  },
  {
    id: 'character-voice-check',
    category: 'analyze',
    scope: 'book',
    name: 'Character Voice Check',
    description: 'Ensure distinct, consistent voices',
    longDescription: 'Analyzes dialogue and POV sections to ensure each character sounds unique and consistent throughout. Flags voice drift.',
    icon: Users,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Analyzing character voices...',
      output: 'Voice consistency report...'
    },
    canChainTo: ['write-dialogue'],
    estimatedTokens: 2000
  },
  {
    id: 'plot-hole-finder',
    category: 'analyze',
    scope: 'book',
    name: 'Plot Hole Finder',
    description: 'Detect logical inconsistencies',
    longDescription: 'Scans your manuscript for plot holes, contradictions, and logical inconsistencies. Cross-references with your Story Bible.',
    icon: Search,
    color: 'red',
    gradient: 'from-red-500 to-rose-600',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Scanning for plot holes...',
      output: 'Plot hole report...'
    },
    canChainTo: [],
    estimatedTokens: 2500,
    inspiredBy: ['rowling']
  },
  {
    id: 'readability-score',
    category: 'analyze',
    scope: 'hybrid',
    name: 'Readability Score',
    description: 'Grade level and reading metrics',
    longDescription: 'Calculates Flesch-Kincaid, Gunning Fog, and other readability metrics. Ensures your prose matches your target audience.',
    icon: BarChart3,
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'data',
    placeholders: {
      input: 'Calculating readability...',
      output: 'Readability metrics...'
    },
    canChainTo: ['vary-sentences', 'improve-prose'],
    estimatedTokens: 500
  },
  {
    id: 'word-frequency',
    category: 'analyze',
    scope: 'hybrid',
    name: 'Word Frequency',
    description: 'Find overused words and phrases',
    longDescription: 'Identifies overused words, crutch phrases, and repetitive patterns. The "darling detector" that helps you kill your darlings.',
    icon: Repeat,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'data',
    placeholders: {
      input: 'Analyzing word frequency...',
      output: 'Frequency report...'
    },
    canChainTo: ['improve-prose'],
    estimatedTokens: 800,
    inspiredBy: ['king']
  },
  {
    id: 'emotional-arc',
    category: 'analyze',
    scope: 'book',
    name: 'Emotional Arc',
    description: 'Map the emotional journey',
    longDescription: 'Visualizes the emotional trajectory of your story, identifying peaks, valleys, and the overall shape of your narrative\'s emotional impact.',
    icon: Heart,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Mapping emotional arc...',
      output: 'Emotional arc visualization...'
    },
    canChainTo: ['deepen-emotion', 'add-tension'],
    estimatedTokens: 2000
  },
  {
    id: 'timeline-visualizer',
    category: 'analyze',
    scope: 'book',
    name: 'Timeline Visualizer',
    description: 'Map chronological events',
    longDescription: 'Extracts and visualizes the timeline of events in your story, identifying gaps, overlaps, and potential temporal inconsistencies.',
    icon: Clock,
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'data',
    placeholders: {
      input: 'Extracting timeline...',
      output: 'Timeline visualization...'
    },
    canChainTo: [],
    estimatedTokens: 1500,
    inspiredBy: ['rowling']
  },
  {
    id: 'act-balance',
    category: 'analyze',
    scope: 'book',
    name: 'Act Balance Checker',
    description: 'Analyze story structure balance',
    longDescription: 'Checks your act structure balance. Collins uses equal thirds; traditional is 25/50/25. See where you fall and if it\'s working.',
    icon: Layers,
    color: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Analyzing act structure...',
      output: 'Act balance report...'
    },
    canChainTo: ['pacing-analysis'],
    estimatedTokens: 1200,
    inspiredBy: ['collins'],
    options: [
      {
        id: 'structure',
        label: 'Target Structure',
        type: 'select',
        default: 'three-act',
        choices: [
          { value: 'three-act', label: 'Three Act (25/50/25)' },
          { value: 'collins', label: 'Collins (33/33/33)' },
          { value: 'five-act', label: 'Five Act' },
          { value: 'heros-journey', label: 'Hero\'s Journey' }
        ]
      }
    ]
  }
];

// ============================================================================
// BRAINSTORM TOOLS (8)
// ============================================================================

export const brainstormTools: AITool[] = [
  {
    id: 'plot-twists',
    category: 'brainstorm',
    scope: 'book',
    name: 'Plot Twists',
    description: 'Generate unexpected story turns',
    longDescription: 'Generates surprising but earned plot twists that fit your story\'s logic. Each twist comes with setup suggestions for proper foreshadowing.',
    icon: Shuffle,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'context',
    outputType: 'suggestions',
    placeholders: {
      input: 'Analyzing story for twist opportunities...',
      output: 'Plot twist suggestions...'
    },
    canChainTo: ['first-draft'],
    estimatedTokens: 1500,
    options: [
      {
        id: 'twistType',
        label: 'Twist Type',
        type: 'select',
        default: 'any',
        choices: [
          { value: 'any', label: 'Any' },
          { value: 'betrayal', label: 'Betrayal' },
          { value: 'revelation', label: 'Revelation' },
          { value: 'reversal', label: 'Reversal' },
          { value: 'death', label: 'Death' }
        ]
      }
    ]
  },
  {
    id: 'character-ideas',
    category: 'brainstorm',
    scope: 'book',
    name: 'Character Ideas',
    description: 'Generate or deepen characters',
    longDescription: 'Creates compelling new characters or deepens existing ones with backstory, motivation, flaws, and arc suggestions.',
    icon: Users,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    requiresSelection: false,
    inputType: 'structured',
    outputType: 'suggestions',
    placeholders: {
      input: 'Describe the role or archetype needed...',
      output: 'Character suggestions...'
    },
    canChainTo: [],
    estimatedTokens: 1200,
    options: [
      {
        id: 'role',
        label: 'Character Role',
        type: 'select',
        default: 'any',
        choices: [
          { value: 'any', label: 'Any' },
          { value: 'protagonist', label: 'Protagonist' },
          { value: 'antagonist', label: 'Antagonist' },
          { value: 'mentor', label: 'Mentor' },
          { value: 'sidekick', label: 'Sidekick' },
          { value: 'love-interest', label: 'Love Interest' }
        ]
      }
    ]
  },
  {
    id: 'world-building',
    category: 'brainstorm',
    scope: 'book',
    name: 'World Building',
    description: 'Expand settings, cultures, rules',
    longDescription: 'Generates rich world-building elements: locations, cultures, histories, economies, religions, and the "rules" of your world.',
    icon: Map,
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600',
    requiresSelection: false,
    inputType: 'structured',
    outputType: 'suggestions',
    placeholders: {
      input: 'Describe what aspect of your world to develop...',
      output: 'World-building suggestions...'
    },
    canChainTo: ['magic-system-builder'],
    estimatedTokens: 1500,
    inspiredBy: ['sanderson']
  },
  {
    id: 'conflict-generator',
    category: 'brainstorm',
    scope: 'scene',
    name: 'Conflict Generator',
    description: 'Create compelling conflicts',
    longDescription: 'Generates internal and external conflicts that drive your story forward. Every scene needs conflict—this ensures you have it.',
    icon: Swords,
    color: 'red',
    gradient: 'from-red-500 to-orange-600',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'context',
    outputType: 'suggestions',
    placeholders: {
      input: 'Analyzing scene for conflict opportunities...',
      output: 'Conflict suggestions...'
    },
    canChainTo: ['add-tension', 'write-dialogue'],
    estimatedTokens: 1000,
    options: [
      {
        id: 'conflictType',
        label: 'Conflict Type',
        type: 'select',
        default: 'both',
        choices: [
          { value: 'both', label: 'Both' },
          { value: 'internal', label: 'Internal' },
          { value: 'external', label: 'External' }
        ]
      }
    ]
  },
  {
    id: 'subplot-ideas',
    category: 'brainstorm',
    scope: 'book',
    name: 'Subplot Ideas',
    description: 'Generate B-plots and threads',
    longDescription: 'Creates subplots that enrich your main story, develop characters, and provide thematic resonance without distracting.',
    icon: GitBranch,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'context',
    outputType: 'suggestions',
    placeholders: {
      input: 'Analyzing story for subplot opportunities...',
      output: 'Subplot suggestions...'
    },
    canChainTo: [],
    estimatedTokens: 1200,
    inspiredBy: ['rowling']
  },
  {
    id: 'scene-ideas',
    category: 'brainstorm',
    scope: 'chapter',
    name: 'Scene Ideas',
    description: 'Fill gaps with compelling scenes',
    longDescription: 'Suggests scenes to fill narrative gaps, develop characters, or advance plot when you\'re not sure what comes next.',
    icon: Lightbulb,
    shortcut: '⌘⇧S',
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'suggestions',
    placeholders: {
      input: 'What needs to happen next?',
      output: 'Scene suggestions...'
    },
    canChainTo: ['first-draft'],
    estimatedTokens: 1000
  },
  {
    id: 'story-structure',
    category: 'brainstorm',
    scope: 'book',
    name: 'Story Structure',
    description: 'Beat-sheet framework planning',
    longDescription: 'Helps you plan your story\'s structure using proven frameworks: Three-Act, Hero\'s Journey, Save the Cat, or Collins\' equal thirds.',
    icon: Grid,
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-600',
    requiresSelection: false,
    inputType: 'structured',
    outputType: 'structured',
    placeholders: {
      input: 'Describe your story concept...',
      output: 'Structure beat sheet...'
    },
    canChainTo: ['first-draft'],
    estimatedTokens: 2000,
    inspiredBy: ['collins', 'sanderson'],
    options: [
      {
        id: 'framework',
        label: 'Framework',
        type: 'select',
        default: 'three-act',
        choices: [
          { value: 'three-act', label: 'Three Act' },
          { value: 'heros-journey', label: 'Hero\'s Journey' },
          { value: 'save-cat', label: 'Save the Cat' },
          { value: 'seven-point', label: 'Seven Point' }
        ]
      }
    ]
  },
  {
    id: 'character-death-planner',
    category: 'brainstorm',
    scope: 'book',
    name: 'Character Death Planner',
    description: 'Plan meaningful character exits',
    longDescription: 'When you commit to a story like Hunger Games, you must accept deaths. This helps plan impactful, meaningful character deaths.',
    icon: Skull,
    color: 'stone',
    gradient: 'from-stone-600 to-stone-800',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'structured',
    outputType: 'suggestions',
    placeholders: {
      input: 'Which character and what impact do you want?',
      output: 'Death scene suggestions...'
    },
    canChainTo: ['first-draft', 'deepen-emotion'],
    estimatedTokens: 1200,
    inspiredBy: ['collins'],
    options: [
      {
        id: 'impact',
        label: 'Story Impact',
        type: 'select',
        default: 'major',
        choices: [
          { value: 'minor', label: 'Minor (plot device)' },
          { value: 'major', label: 'Major (emotional beat)' },
          { value: 'devastating', label: 'Devastating (story-changing)' }
        ]
      }
    ]
  }
];

// ============================================================================
// CRAFT TOOLS - MASTER AUTHOR SPECIFIC (16)
// ============================================================================

export const craftTools: AITool[] = [
  // KING MODE (4)
  {
    id: 'daily-word-goal',
    category: 'craft',
    scope: 'book',
    name: 'Daily Word Goal',
    description: 'Track your King-style daily quota',
    longDescription: 'Stephen King writes 2,000 words daily, including holidays. Track your progress, build streaks, and develop professional writing habits.',
    icon: Target,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    requiresSelection: false,
    inputType: 'none',
    outputType: 'data',
    placeholders: {
      input: '',
      output: 'Progress tracking...'
    },
    canChainTo: [],
    estimatedTokens: 100,
    inspiredBy: ['king'],
    options: [
      {
        id: 'dailyGoal',
        label: 'Daily Goal',
        type: 'number',
        default: 2000,
        min: 100,
        max: 10000
      }
    ]
  },
  {
    id: 'session-warmup',
    category: 'craft',
    scope: 'scene',
    name: 'Session Warmup',
    description: 'Review last pages before writing',
    longDescription: 'King rereads the last 2 pages before starting. This tool shows your recent work to get you back in the flow.',
    icon: BookOpen,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'text',
    placeholders: {
      input: 'Loading previous session...',
      output: 'Your last session...'
    },
    canChainTo: ['continue-writing'],
    estimatedTokens: 200,
    inspiredBy: ['king']
  },
  {
    id: 'cliffhanger-reminder',
    category: 'craft',
    scope: 'scene',
    name: 'Cliffhanger Reminder',
    description: 'Stop mid-action for momentum',
    longDescription: 'King stops writing mid-scene to maintain momentum for the next session. This reminds you to stop at peak tension.',
    icon: AlertTriangle,
    color: 'red',
    gradient: 'from-red-500 to-rose-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'suggestions',
    placeholders: {
      input: 'Analyzing scene state...',
      output: 'Stopping point suggestions...'
    },
    canChainTo: [],
    estimatedTokens: 300,
    inspiredBy: ['king']
  },
  {
    id: 'darling-detector',
    category: 'craft',
    scope: 'hybrid',
    name: 'Darling Detector',
    description: 'Find over-polished passages to cut',
    longDescription: '"Kill your darlings" — finds passages that are technically beautiful but might not serve the story. Flag them for review.',
    icon: Scissors,
    color: 'rose',
    gradient: 'from-rose-500 to-red-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Scanning for darlings...',
      output: 'Potential darlings found...'
    },
    canChainTo: ['improve-prose'],
    estimatedTokens: 1000,
    inspiredBy: ['king']
  },
  
  // SANDERSON MODE (4)
  {
    id: 'magic-system-builder',
    category: 'craft',
    scope: 'book',
    name: 'Magic System Builder',
    description: 'Design rules, costs, limitations',
    longDescription: 'Build magic systems following Sanderson\'s Laws: limitations are more interesting than powers, costs create tension, rules enable solutions.',
    icon: Sparkles,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    requiresSelection: false,
    inputType: 'structured',
    outputType: 'structured',
    placeholders: {
      input: 'Describe your magic concept...',
      output: 'Magic system framework...'
    },
    canChainTo: ['world-building'],
    estimatedTokens: 2000,
    inspiredBy: ['sanderson'],
    options: [
      {
        id: 'hardness',
        label: 'System Hardness',
        type: 'select',
        default: 'hard',
        choices: [
          { value: 'soft', label: 'Soft (mysterious)' },
          { value: 'medium', label: 'Medium' },
          { value: 'hard', label: 'Hard (rule-based)' }
        ]
      }
    ]
  },
  {
    id: 'beat-markers',
    category: 'craft',
    scope: 'book',
    name: 'Beat Markers',
    description: 'Floating outline key points',
    longDescription: 'Sanderson\'s "points on the map" — mark key scenes you\'re writing toward without rigid outlining. Navigate by waypoints.',
    icon: Map,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    requiresSelection: false,
    inputType: 'structured',
    outputType: 'structured',
    placeholders: {
      input: 'Define your key story beats...',
      output: 'Beat map...'
    },
    canChainTo: ['first-draft'],
    estimatedTokens: 800,
    inspiredBy: ['sanderson']
  },
  {
    id: 'multi-track',
    category: 'craft',
    scope: 'book',
    name: 'Multi-Track Development',
    description: 'Toggle plot/character/world focus',
    longDescription: 'Sanderson weaves plot, character, setting, and theme iteratively. This helps you develop each track and see how they interconnect.',
    icon: Layers,
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Analyzing story tracks...',
      output: 'Track analysis...'
    },
    canChainTo: [],
    estimatedTokens: 1500,
    inspiredBy: ['sanderson']
  },
  {
    id: 'constraint-creator',
    category: 'craft',
    scope: 'book',
    name: 'Constraint Creator',
    description: 'Define what\'s impossible',
    longDescription: 'Limitations are more interesting than powers. Define what your magic/tech CAN\'T do to create meaningful constraints.',
    icon: AlertTriangle,
    color: 'orange',
    gradient: 'from-orange-500 to-amber-600',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'structured',
    outputType: 'suggestions',
    placeholders: {
      input: 'What system needs constraints?',
      output: 'Constraint suggestions...'
    },
    canChainTo: ['magic-system-builder'],
    estimatedTokens: 800,
    inspiredBy: ['sanderson']
  },
  
  // ROWLING MODE (4)
  {
    id: 'series-bible',
    category: 'craft',
    scope: 'book',
    name: 'Series Bible',
    description: 'Multi-book planning system',
    longDescription: 'Rowling planned 7 books before writing. This helps you plan across a series with shared elements, arcs, and reveals.',
    icon: BookOpen,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    requiresSelection: false,
    inputType: 'structured',
    outputType: 'structured',
    placeholders: {
      input: 'Define your series scope...',
      output: 'Series bible framework...'
    },
    canChainTo: [],
    estimatedTokens: 2000,
    inspiredBy: ['rowling']
  },
  {
    id: 'clue-tracker',
    category: 'craft',
    scope: 'book',
    name: 'Clue Tracker',
    description: 'Blue clues, red herrings',
    longDescription: 'Rowling\'s color-coded system: blue ink for real clues, red for red herrings. Track your mystery elements.',
    icon: Eye,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    requiresSelection: false,
    inputType: 'structured',
    outputType: 'data',
    placeholders: {
      input: 'What clue or herring to add?',
      output: 'Clue tracking...'
    },
    canChainTo: [],
    estimatedTokens: 500,
    inspiredBy: ['rowling']
  },
  {
    id: 'chapter-matrix',
    category: 'craft',
    scope: 'book',
    name: 'Chapter Matrix',
    description: 'Grid view: chapters × subplots',
    longDescription: 'Rowling\'s chapter spreadsheet with columns for each subplot. See at a glance how your threads weave through chapters.',
    icon: Grid,
    color: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'data',
    placeholders: {
      input: 'Generating chapter matrix...',
      output: 'Matrix view...'
    },
    canChainTo: [],
    estimatedTokens: 1200,
    inspiredBy: ['rowling']
  },
  {
    id: 'handwriting-mode',
    category: 'craft',
    scope: 'scene',
    name: 'Handwriting Mode',
    description: 'Stylus-friendly writing interface',
    longDescription: 'Rowling writes by hand first, then types. This mode optimizes for stylus input and handwritten notes.',
    icon: PenTool,
    color: 'stone',
    gradient: 'from-stone-500 to-stone-700',
    requiresSelection: false,
    inputType: 'none',
    outputType: 'text',
    placeholders: {
      input: 'Switching to handwriting mode...',
      output: 'Handwriting canvas ready...'
    },
    canChainTo: [],
    estimatedTokens: 100,
    inspiredBy: ['rowling']
  },
  
  // PATTERSON MODE (4)
  {
    id: 'deep-outline',
    category: 'craft',
    scope: 'book',
    name: 'Deep Outline Mode',
    description: 'Detailed scene-by-scene pre-writing',
    longDescription: 'Patterson writes 50-80 page outlines. This helps you create detailed, scene-level outlines before drafting.',
    icon: List,
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-600',
    requiresSelection: false,
    inputType: 'structured',
    outputType: 'structured',
    placeholders: {
      input: 'Creating detailed outline...',
      output: 'Deep outline...'
    },
    canChainTo: ['first-draft'],
    estimatedTokens: 3000,
    inspiredBy: ['patterson']
  },
  {
    id: 'chapter-length-advisor',
    category: 'craft',
    scope: 'chapter',
    name: 'Chapter Length Advisor',
    description: 'Flag long chapters for splitting',
    longDescription: 'Patterson uses short chapters. This analyzes chapter length and suggests split points for better pacing.',
    icon: Scissors,
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'suggestions',
    placeholders: {
      input: 'Analyzing chapter length...',
      output: 'Split suggestions...'
    },
    canChainTo: [],
    estimatedTokens: 600,
    inspiredBy: ['patterson']
  },
  {
    id: 'hook-checker',
    category: 'craft',
    scope: 'chapter',
    name: 'Hook Checker',
    description: 'Analyze chapter ending strength',
    longDescription: 'Patterson ends every chapter with a hook. This analyzes your chapter endings and scores their "turn the page" power.',
    icon: Zap,
    color: 'red',
    gradient: 'from-red-500 to-orange-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Analyzing chapter hook...',
      output: 'Hook analysis...'
    },
    canChainTo: ['add-tension'],
    estimatedTokens: 800,
    inspiredBy: ['patterson']
  },
  {
    id: 'reader-avatar',
    category: 'craft',
    scope: 'book',
    name: 'Reader Avatar',
    description: 'Define your ideal reader',
    longDescription: '"Write for one reader sitting across from you" — Patterson. Define and write for your specific ideal reader.',
    icon: User,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    requiresSelection: false,
    inputType: 'structured',
    outputType: 'structured',
    placeholders: {
      input: 'Who is your ideal reader?',
      output: 'Reader avatar...'
    },
    canChainTo: [],
    estimatedTokens: 800,
    inspiredBy: ['patterson']
  }
];

// ============================================================================
// ALL TOOLS COMBINED
// ============================================================================

export const allTools: AITool[] = [
  ...generateTools,
  ...enhanceTools,
  ...analyzeTools,
  ...brainstormTools,
  ...craftTools
];

// ============================================================================
// TOOL HELPERS
// ============================================================================

export function getToolById(id: string): AITool | undefined {
  return allTools.find(tool => tool.id === id);
}

export function getToolsByCategory(category: ToolCategory): AITool[] {
  return allTools.filter(tool => tool.category === category);
}

export function getToolsByScope(scope: ToolScope): AITool[] {
  return allTools.filter(tool => tool.scope === scope);
}

export function getToolsByAuthor(author: AuthorMode): AITool[] {
  return allTools.filter(tool => tool.inspiredBy?.includes(author));
}

export function getChainableTools(fromToolId: string): AITool[] {
  const tool = getToolById(fromToolId);
  if (!tool) return [];
  return tool.canChainTo.map(id => getToolById(id)).filter(Boolean) as AITool[];
}

// ============================================================================
// CATEGORY CONFIG
// ============================================================================

export const categoryConfig: Record<ToolCategory, { label: string; icon: any; color: string; description: string }> = {
  generate: { 
    label: 'Generate', 
    icon: PenTool, 
    color: 'teal',
    description: 'Create new content'
  },
  enhance: { 
    label: 'Enhance', 
    icon: Sparkles, 
    color: 'amber',
    description: 'Improve existing text'
  },
  analyze: { 
    label: 'Analyze', 
    icon: BarChart3, 
    color: 'blue',
    description: 'Understand your story'
  },
  brainstorm: { 
    label: 'Brainstorm', 
    icon: Lightbulb, 
    color: 'violet',
    description: 'Generate ideas'
  },
  craft: { 
    label: 'Craft', 
    icon: Crown, 
    color: 'rose',
    description: 'Master author tools'
  }
};

export const authorModeConfig: Record<AuthorMode, { label: string; description: string; color: string }> = {
  king: { 
    label: 'Stephen King', 
    description: 'Discovery writing, 2K words/day, kill your darlings',
    color: 'amber'
  },
  sanderson: { 
    label: 'Brandon Sanderson', 
    description: 'Detailed outlines, magic systems, limitations > powers',
    color: 'violet'
  },
  rowling: { 
    label: 'J.K. Rowling', 
    description: 'Series planning, clue tracking, chapter matrices',
    color: 'blue'
  },
  patterson: { 
    label: 'James Patterson', 
    description: 'Deep outlines, short chapters, hooks',
    color: 'red'
  },
  collins: { 
    label: 'Suzanne Collins', 
    description: 'Structure first, equal acts, commitment to consequences',
    color: 'emerald'
  }
};
