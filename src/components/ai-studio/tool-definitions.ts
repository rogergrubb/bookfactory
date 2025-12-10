// ============================================================================
// BOOKFACTORY AI - COMPLETE TOOL DEFINITIONS
// 44 Tools inspired by Master Authors
// ============================================================================

import { 
  Wand2, Sparkles, MessageSquare, Eye, Zap, Brain, 
  TrendingUp, Heart, Gauge, FileText, BarChart2, 
  Lightbulb, Shuffle, Users, Globe, Swords, GitBranch,
  Layout, Skull, Flame, Clock, BookOpen, Target,
  AlertTriangle, Palette, Map, Edit3, CheckCircle,
  Feather, Volume2, Search, Layers, PenTool, Star
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type ToolCategory = 'generate' | 'enhance' | 'analyze' | 'brainstorm' | 'craft';
export type ToolScope = 'scene' | 'chapter' | 'book' | 'hybrid';
export type AuthorInspiration = 'king' | 'sanderson' | 'rowling' | 'patterson' | 'collins';

export interface AITool {
  id: string;
  category: ToolCategory;
  scope: ToolScope;
  name: string;
  description: string;
  longDescription?: string;
  icon: any;
  shortcut?: string;
  color: string;
  gradient: string;
  
  // Requirements
  requiresSelection: boolean;
  requiresStoryBible?: boolean;
  requiresOutline?: boolean;
  
  // Input/Output
  inputType: 'text' | 'selection' | 'context' | 'none';
  outputType: 'text' | 'suggestions' | 'analysis' | 'data';
  
  // Placeholders
  placeholders: {
    input: string;
    output: string;
  };
  
  // Options
  options?: ToolOption[];
  
  // Chaining - what tools can follow this one
  canChainTo: string[];
  
  // Constraints
  minInputLength?: number;
  maxInputLength?: number;
  estimatedTokens: number;
  
  // Master author alignment
  inspiredBy?: AuthorInspiration[];
  
  // For UI grouping
  isNew?: boolean;
  isPremium?: boolean;
}

export interface ToolOption {
  id: string;
  label: string;
  type: 'select' | 'slider' | 'toggle' | 'text';
  default: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

export const AI_TOOLS: AITool[] = [
  // =========================================================================
  // GENERATE TOOLS (6)
  // =========================================================================
  {
    id: 'continue-writing',
    category: 'generate',
    scope: 'scene',
    name: 'Continue Writing',
    description: 'AI continues your story matching your voice',
    longDescription: 'Seamlessly picks up where you left off, matching your writing style, tone, and narrative voice. Perfect for when you know what happens next but need help getting words on the page.',
    icon: PenTool,
    shortcut: '⌘J',
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'text',
    placeholders: {
      input: 'Your story so far...',
      output: 'Continuing the narrative...'
    },
    options: [
      {
        id: 'length',
        label: 'Length',
        type: 'select',
        default: 'medium',
        options: [
          { value: 'short', label: 'Short (~100 words)' },
          { value: 'medium', label: 'Medium (~250 words)' },
          { value: 'long', label: 'Long (~500 words)' },
        ]
      },
      {
        id: 'style',
        label: 'Pacing',
        type: 'select',
        default: 'match',
        options: [
          { value: 'match', label: 'Match current' },
          { value: 'slower', label: 'Slow down' },
          { value: 'faster', label: 'Speed up' },
        ]
      }
    ],
    canChainTo: ['improve-prose', 'add-tension', 'deepen-emotion'],
    estimatedTokens: 800,
    inspiredBy: ['king'],
  },
  
  {
    id: 'first-draft',
    category: 'generate',
    scope: 'scene',
    name: 'First Draft Mode',
    description: 'Transform outlines into full scenes',
    longDescription: 'Takes your scene outline, beat sheet, or bullet points and expands them into a full prose draft. Gets words on the page fast so you can refine later.',
    icon: FileText,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    requiresSelection: false,
    requiresOutline: true,
    inputType: 'text',
    outputType: 'text',
    placeholders: {
      input: 'Scene outline or beats...',
      output: 'Generating first draft...'
    },
    options: [
      {
        id: 'detail',
        label: 'Detail Level',
        type: 'slider',
        default: 50,
        min: 0,
        max: 100
      }
    ],
    canChainTo: ['improve-prose', 'write-dialogue', 'add-description'],
    estimatedTokens: 1200,
    inspiredBy: ['patterson'],
  },
  
  {
    id: 'write-dialogue',
    category: 'generate',
    scope: 'scene',
    name: 'Write Dialogue',
    description: 'Create authentic character conversations',
    longDescription: 'Generates dialogue that sounds natural and reveals character. Uses your Story Bible to maintain consistent character voices.',
    icon: MessageSquare,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'text',
    outputType: 'text',
    placeholders: {
      input: 'Describe the conversation (who, what, where)...',
      output: 'Writing dialogue...'
    },
    options: [
      {
        id: 'subtext',
        label: 'Subtext Level',
        type: 'slider',
        default: 50,
        min: 0,
        max: 100
      },
      {
        id: 'conflict',
        label: 'Include Conflict',
        type: 'toggle',
        default: true
      }
    ],
    canChainTo: ['improve-prose', 'add-tension', 'character-voice-check'],
    estimatedTokens: 600,
  },
  
  {
    id: 'add-description',
    category: 'generate',
    scope: 'scene',
    name: 'Add Description',
    description: 'Rich sensory details and world-building',
    longDescription: 'Enhances your scene with vivid sensory details, atmospheric description, and world-building elements that immerse readers.',
    icon: Eye,
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select text to enhance with description...',
      output: 'Adding rich description...'
    },
    options: [
      {
        id: 'senses',
        label: 'Focus Senses',
        type: 'select',
        default: 'all',
        options: [
          { value: 'all', label: 'All senses' },
          { value: 'visual', label: 'Visual' },
          { value: 'auditory', label: 'Sound' },
          { value: 'tactile', label: 'Touch' },
          { value: 'olfactory', label: 'Smell' },
        ]
      }
    ],
    canChainTo: ['improve-prose', 'sensory-details'],
    estimatedTokens: 400,
    inspiredBy: ['sanderson'],
  },
  
  {
    id: 'action-scene',
    category: 'generate',
    scope: 'scene',
    name: 'Action Scene',
    description: 'Dynamic, fast-paced action sequences',
    longDescription: 'Creates gripping action sequences with clear choreography, varied sentence rhythm, and visceral impact. Perfect for fights, chases, and high-stakes moments.',
    icon: Zap,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'text',
    placeholders: {
      input: 'Describe the action (who, where, stakes)...',
      output: 'Writing action sequence...'
    },
    options: [
      {
        id: 'intensity',
        label: 'Intensity',
        type: 'slider',
        default: 70,
        min: 0,
        max: 100
      },
      {
        id: 'violence',
        label: 'Violence Level',
        type: 'select',
        default: 'moderate',
        options: [
          { value: 'mild', label: 'Mild' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'graphic', label: 'Graphic' },
        ]
      }
    ],
    canChainTo: ['add-tension', 'improve-prose', 'pacing-analysis'],
    estimatedTokens: 800,
    inspiredBy: ['collins'],
  },
  
  {
    id: 'inner-thoughts',
    category: 'generate',
    scope: 'scene',
    name: 'Inner Thoughts',
    description: 'Character internal monologue',
    longDescription: 'Adds deep POV internal monologue that reveals character psychology, motivation, and emotional state. Creates intimacy between reader and character.',
    icon: Brain,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    requiresSelection: true,
    requiresStoryBible: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select moment to add inner thoughts...',
      output: 'Adding internal monologue...'
    },
    canChainTo: ['deepen-emotion', 'improve-prose'],
    estimatedTokens: 400,
  },
  
  // =========================================================================
  // ENHANCE TOOLS (6)
  // =========================================================================
  {
    id: 'improve-prose',
    category: 'enhance',
    scope: 'scene',
    name: 'Improve Prose',
    description: 'Elevate writing while keeping your voice',
    longDescription: 'Polishes your prose for clarity, rhythm, and impact while preserving your unique voice. Tightens sentences, strengthens verbs, and removes clutter.',
    icon: Sparkles,
    shortcut: '⌘I',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select text to improve...',
      output: 'Enhancing prose...'
    },
    options: [
      {
        id: 'intensity',
        label: 'Edit Intensity',
        type: 'slider',
        default: 50,
        min: 0,
        max: 100
      },
      {
        id: 'preserve-voice',
        label: 'Preserve Voice',
        type: 'toggle',
        default: true
      }
    ],
    canChainTo: ['vary-sentences', 'show-dont-tell'],
    estimatedTokens: 500,
    inspiredBy: ['king'],
  },
  
  {
    id: 'show-dont-tell',
    category: 'enhance',
    scope: 'scene',
    name: 'Show Don\'t Tell',
    description: 'Transform telling into showing',
    longDescription: 'Converts expository "telling" passages into vivid "showing" scenes with action, dialogue, and sensory detail. Makes your writing more immersive.',
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
    canChainTo: ['improve-prose', 'deepen-emotion'],
    estimatedTokens: 600,
  },
  
  {
    id: 'deepen-emotion',
    category: 'enhance',
    scope: 'scene',
    name: 'Deepen Emotion',
    description: 'Add emotional resonance and depth',
    longDescription: 'Amplifies the emotional impact of your scene through physical sensation, internal reaction, and meaningful detail. Makes readers feel what characters feel.',
    icon: Heart,
    color: 'rose',
    gradient: 'from-rose-500 to-red-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select scene to deepen emotionally...',
      output: 'Adding emotional depth...'
    },
    options: [
      {
        id: 'emotion',
        label: 'Target Emotion',
        type: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Auto-detect' },
          { value: 'joy', label: 'Joy' },
          { value: 'sorrow', label: 'Sorrow' },
          { value: 'fear', label: 'Fear' },
          { value: 'anger', label: 'Anger' },
          { value: 'love', label: 'Love' },
          { value: 'tension', label: 'Tension' },
        ]
      }
    ],
    canChainTo: ['improve-prose', 'inner-thoughts'],
    estimatedTokens: 500,
  },
  
  {
    id: 'add-tension',
    category: 'enhance',
    scope: 'scene',
    name: 'Add Tension',
    description: 'Increase stakes and suspense',
    longDescription: 'Raises the tension in your scene through pacing, stakes escalation, uncertainty, and reader anxiety. Keeps pages turning.',
    icon: TrendingUp,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select scene to add tension...',
      output: 'Increasing tension...'
    },
    options: [
      {
        id: 'type',
        label: 'Tension Type',
        type: 'select',
        default: 'suspense',
        options: [
          { value: 'suspense', label: 'Suspense' },
          { value: 'conflict', label: 'Conflict' },
          { value: 'mystery', label: 'Mystery' },
          { value: 'stakes', label: 'Raise Stakes' },
        ]
      }
    ],
    canChainTo: ['improve-prose', 'pacing-analysis'],
    estimatedTokens: 500,
    inspiredBy: ['patterson', 'collins'],
  },
  
  {
    id: 'vary-sentences',
    category: 'enhance',
    scope: 'scene',
    name: 'Vary Sentences',
    description: 'Improve rhythm and flow',
    longDescription: 'Creates musical prose through varied sentence lengths, structures, and rhythms. Prevents monotony and creates natural reading flow.',
    icon: Gauge,
    color: 'indigo',
    gradient: 'from-indigo-500 to-blue-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select passage to vary...',
      output: 'Varying sentence structure...'
    },
    canChainTo: ['improve-prose', 'pacing-analysis'],
    estimatedTokens: 400,
    inspiredBy: ['king'],
  },
  
  {
    id: 'sensory-details',
    category: 'enhance',
    scope: 'scene',
    name: 'Sensory Details',
    description: 'Enrich with all five senses',
    longDescription: 'Layers in sensory details across all five senses to create an immersive, vivid reading experience. Makes scenes come alive.',
    icon: Volume2,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    requiresSelection: true,
    inputType: 'selection',
    outputType: 'text',
    placeholders: {
      input: 'Select scene to enrich...',
      output: 'Adding sensory details...'
    },
    canChainTo: ['improve-prose', 'add-description'],
    estimatedTokens: 400,
    inspiredBy: ['sanderson'],
  },
  
  // =========================================================================
  // ANALYZE TOOLS (8)
  // =========================================================================
  {
    id: 'pacing-analysis',
    category: 'analyze',
    scope: 'chapter',
    name: 'Pacing Analysis',
    description: 'Evaluate narrative flow and rhythm',
    longDescription: 'Analyzes the pacing of your chapter or scene, identifying where it drags, rushes, or flows well. Provides specific recommendations.',
    icon: TrendingUp,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Chapter content...',
      output: 'Analyzing pacing...'
    },
    canChainTo: ['add-tension', 'vary-sentences'],
    estimatedTokens: 600,
    inspiredBy: ['patterson'],
  },
  
  {
    id: 'character-voice-check',
    category: 'analyze',
    scope: 'chapter',
    name: 'Character Voice Check',
    description: 'Verify voice consistency',
    longDescription: 'Compares dialogue and POV against your Story Bible character profiles. Flags inconsistencies in speech patterns, vocabulary, and personality.',
    icon: Users,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Chapter content...',
      output: 'Checking character voices...'
    },
    canChainTo: ['write-dialogue', 'improve-prose'],
    estimatedTokens: 800,
  },
  
  {
    id: 'plot-hole-finder',
    category: 'analyze',
    scope: 'book',
    name: 'Plot Hole Finder',
    description: 'Identify logical inconsistencies',
    longDescription: 'Scans your manuscript for plot holes, contradictions, and logical inconsistencies. Connects to your Story Bible for comprehensive checking.',
    icon: Search,
    color: 'red',
    gradient: 'from-red-500 to-rose-600',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Manuscript content...',
      output: 'Scanning for plot holes...'
    },
    canChainTo: [],
    estimatedTokens: 1000,
    inspiredBy: ['rowling'],
  },
  
  {
    id: 'readability-score',
    category: 'analyze',
    scope: 'chapter',
    name: 'Readability Score',
    description: 'Grade level and reading metrics',
    longDescription: 'Calculates Flesch-Kincaid, Gunning Fog, and other readability metrics. Helps ensure your prose matches your target audience.',
    icon: BarChart2,
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'data',
    placeholders: {
      input: 'Text to analyze...',
      output: 'Calculating metrics...'
    },
    canChainTo: ['improve-prose', 'vary-sentences'],
    estimatedTokens: 300,
  },
  
  {
    id: 'word-frequency',
    category: 'analyze',
    scope: 'chapter',
    name: 'Word Frequency',
    description: 'Find overused words and phrases',
    longDescription: 'Identifies words and phrases you\'re overusing. Helps eliminate verbal tics and repetitive language.',
    icon: FileText,
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'data',
    placeholders: {
      input: 'Text to analyze...',
      output: 'Analyzing word frequency...'
    },
    canChainTo: ['improve-prose'],
    estimatedTokens: 300,
    inspiredBy: ['king'],
  },
  
  {
    id: 'emotional-arc',
    category: 'analyze',
    scope: 'chapter',
    name: 'Emotional Arc',
    description: 'Map the emotional journey',
    longDescription: 'Visualizes the emotional trajectory of your chapter or scene. Identifies flat spots and emotional peaks.',
    icon: Heart,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'data',
    placeholders: {
      input: 'Chapter content...',
      output: 'Mapping emotional arc...'
    },
    canChainTo: ['deepen-emotion', 'add-tension'],
    estimatedTokens: 500,
  },
  
  {
    id: 'timeline-visualizer',
    category: 'analyze',
    scope: 'book',
    name: 'Timeline Visualizer',
    description: 'Chronological event mapping',
    longDescription: 'Extracts and visualizes the timeline of events in your story. Helps identify pacing issues and temporal inconsistencies.',
    icon: Clock,
    color: 'indigo',
    gradient: 'from-indigo-500 to-violet-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'data',
    placeholders: {
      input: 'Manuscript content...',
      output: 'Building timeline...'
    },
    canChainTo: [],
    estimatedTokens: 800,
    inspiredBy: ['rowling'],
  },
  
  {
    id: 'act-balance',
    category: 'analyze',
    scope: 'book',
    name: 'Act Balance Checker',
    description: 'Analyze story structure',
    longDescription: 'Evaluates your manuscript against standard story structures (three-act, Save the Cat, etc.). Shows percentage breakdown by act.',
    icon: Layout,
    color: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'data',
    placeholders: {
      input: 'Manuscript content...',
      output: 'Analyzing structure...'
    },
    canChainTo: ['story-structure'],
    estimatedTokens: 600,
    inspiredBy: ['collins', 'patterson'],
  },
  
  // =========================================================================
  // BRAINSTORM TOOLS (8)
  // =========================================================================
  {
    id: 'plot-twists',
    category: 'brainstorm',
    scope: 'book',
    name: 'Plot Twists',
    description: 'Generate unexpected turns',
    longDescription: 'Suggests plot twists that are surprising yet inevitable. Analyzes your existing setup for twist opportunities.',
    icon: Shuffle,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'text',
    outputType: 'suggestions',
    placeholders: {
      input: 'Current story situation...',
      output: 'Generating plot twists...'
    },
    canChainTo: ['scene-ideas'],
    estimatedTokens: 500,
  },
  
  {
    id: 'character-ideas',
    category: 'brainstorm',
    scope: 'book',
    name: 'Character Ideas',
    description: 'Generate and deepen characters',
    longDescription: 'Creates compelling character concepts or deepens existing ones. Generates backstory, motivation, flaws, and arcs.',
    icon: Users,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'suggestions',
    placeholders: {
      input: 'Character concept or existing character to deepen...',
      output: 'Generating character ideas...'
    },
    canChainTo: [],
    estimatedTokens: 600,
  },
  
  {
    id: 'world-building',
    category: 'brainstorm',
    scope: 'book',
    name: 'World Building',
    description: 'Settings, cultures, and rules',
    longDescription: 'Develops world-building elements including settings, cultures, history, and governing rules. Creates internally consistent worlds.',
    icon: Globe,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'suggestions',
    placeholders: {
      input: 'World concept or aspect to develop...',
      output: 'Generating world details...'
    },
    canChainTo: ['magic-system-builder'],
    estimatedTokens: 800,
    inspiredBy: ['sanderson'],
  },
  
  {
    id: 'conflict-generator',
    category: 'brainstorm',
    scope: 'scene',
    name: 'Conflict Generator',
    description: 'Create compelling conflicts',
    longDescription: 'Generates conflict ideas at various levels: internal, interpersonal, societal, or cosmic. Ensures meaningful stakes.',
    icon: Swords,
    color: 'red',
    gradient: 'from-red-500 to-rose-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'suggestions',
    placeholders: {
      input: 'Characters and situation...',
      output: 'Generating conflicts...'
    },
    canChainTo: ['add-tension', 'scene-ideas'],
    estimatedTokens: 400,
    inspiredBy: ['collins'],
  },
  
  {
    id: 'subplot-ideas',
    category: 'brainstorm',
    scope: 'book',
    name: 'Subplot Ideas',
    description: 'Generate B-plots and threads',
    longDescription: 'Creates subplots that complement and enhance your main plot. Ensures thematic resonance and character development.',
    icon: GitBranch,
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'text',
    outputType: 'suggestions',
    placeholders: {
      input: 'Main plot and characters...',
      output: 'Generating subplot ideas...'
    },
    canChainTo: ['scene-ideas'],
    estimatedTokens: 500,
    inspiredBy: ['rowling'],
  },
  
  {
    id: 'scene-ideas',
    category: 'brainstorm',
    scope: 'chapter',
    name: 'Scene Ideas',
    description: 'Fill gaps with great scenes',
    longDescription: 'Suggests scenes that accomplish specific story goals while remaining compelling. Perfect for outline development.',
    icon: Lightbulb,
    color: 'yellow',
    gradient: 'from-yellow-500 to-amber-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'suggestions',
    placeholders: {
      input: 'What needs to happen...',
      output: 'Generating scene ideas...'
    },
    canChainTo: ['first-draft'],
    estimatedTokens: 400,
    inspiredBy: ['patterson'],
  },
  
  {
    id: 'story-structure',
    category: 'brainstorm',
    scope: 'book',
    name: 'Story Structure',
    description: 'Beat-sheet framework planning',
    longDescription: 'Helps plan your story using proven frameworks: three-act structure, Save the Cat, Hero\'s Journey, or custom. Creates comprehensive beat sheets.',
    icon: Layout,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'data',
    placeholders: {
      input: 'Story concept and key elements...',
      output: 'Building structure...'
    },
    options: [
      {
        id: 'framework',
        label: 'Framework',
        type: 'select',
        default: 'three-act',
        options: [
          { value: 'three-act', label: 'Three Act' },
          { value: 'save-the-cat', label: 'Save the Cat' },
          { value: 'heros-journey', label: 'Hero\'s Journey' },
          { value: 'seven-point', label: 'Seven Point' },
        ]
      }
    ],
    canChainTo: ['scene-ideas'],
    estimatedTokens: 800,
    inspiredBy: ['collins', 'patterson'],
  },
  
  {
    id: 'character-death-planner',
    category: 'brainstorm',
    scope: 'book',
    name: 'Character Death Planner',
    description: 'Plan impactful character exits',
    longDescription: 'Helps plan meaningful character deaths with maximum emotional impact. Considers timing, setup, and aftermath.',
    icon: Skull,
    color: 'stone',
    gradient: 'from-stone-600 to-stone-800',
    requiresSelection: false,
    requiresStoryBible: true,
    inputType: 'text',
    outputType: 'suggestions',
    placeholders: {
      input: 'Character and story context...',
      output: 'Planning character exit...'
    },
    canChainTo: ['scene-ideas', 'emotional-arc'],
    estimatedTokens: 600,
    inspiredBy: ['collins'],
  },
  
  // =========================================================================
  // CRAFT TOOLS - DISCOVERY WRITER (King Mode) (4)
  // =========================================================================
  {
    id: 'daily-word-goal',
    category: 'craft',
    scope: 'hybrid',
    name: 'Daily Word Goal',
    description: 'Track your writing streak',
    longDescription: 'Tracks daily word count against your goal (default: 2,000 words like Stephen King). Maintains writing streaks and provides motivation.',
    icon: Flame,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    requiresSelection: false,
    inputType: 'none',
    outputType: 'data',
    placeholders: {
      input: '',
      output: 'Tracking progress...'
    },
    canChainTo: ['session-warmup'],
    estimatedTokens: 100,
    inspiredBy: ['king'],
  },
  
  {
    id: 'session-warmup',
    category: 'craft',
    scope: 'scene',
    name: 'Session Warmup',
    description: 'Review last 2 pages before writing',
    longDescription: 'Displays your last 2 pages of writing to help you get back into the flow. King\'s technique for maintaining momentum.',
    icon: BookOpen,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'text',
    placeholders: {
      input: '',
      output: 'Loading previous session...'
    },
    canChainTo: ['continue-writing'],
    estimatedTokens: 200,
    inspiredBy: ['king'],
  },
  
  {
    id: 'cliffhanger-reminder',
    category: 'craft',
    scope: 'scene',
    name: 'Cliffhanger Reminder',
    description: 'Stop mid-action for tomorrow',
    longDescription: 'Suggests optimal stopping points mid-scene to maintain momentum for your next writing session. Never stop at the end of a chapter.',
    icon: AlertTriangle,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'suggestions',
    placeholders: {
      input: 'Current scene...',
      output: 'Finding stopping point...'
    },
    canChainTo: [],
    estimatedTokens: 200,
    inspiredBy: ['king'],
  },
  
  {
    id: 'darling-detector',
    category: 'craft',
    scope: 'chapter',
    name: 'Darling Detector',
    description: 'Find over-polished passages',
    longDescription: '"Kill your darlings" - identifies passages that may be beautiful but don\'t serve the story. Flags purple prose and self-indulgent writing.',
    icon: Star,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Chapter content...',
      output: 'Detecting darlings...'
    },
    canChainTo: ['improve-prose'],
    estimatedTokens: 500,
    inspiredBy: ['king'],
  },
  
  // =========================================================================
  // CRAFT TOOLS - ARCHITECT (Sanderson Mode) (4)
  // =========================================================================
  {
    id: 'magic-system-builder',
    category: 'craft',
    scope: 'book',
    name: 'Magic/World System Builder',
    description: 'Rules, costs, and limitations',
    longDescription: 'Builds magic systems following Sanderson\'s Laws: clear rules, meaningful limitations, costs that matter. Creates internally consistent power systems.',
    icon: Sparkles,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'data',
    placeholders: {
      input: 'Magic/system concept...',
      output: 'Building system...'
    },
    canChainTo: ['world-building'],
    estimatedTokens: 1000,
    inspiredBy: ['sanderson'],
  },
  
  {
    id: 'beat-markers',
    category: 'craft',
    scope: 'book',
    name: 'Beat Markers',
    description: 'Floating outline points',
    longDescription: 'Creates Sanderson-style "points on the map" - key scenes you\'re writing toward without rigid chapter-by-chapter outlining.',
    icon: Target,
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'data',
    placeholders: {
      input: 'Story concept and key moments...',
      output: 'Creating beat markers...'
    },
    canChainTo: ['story-structure', 'scene-ideas'],
    estimatedTokens: 600,
    inspiredBy: ['sanderson'],
  },
  
  {
    id: 'multi-track',
    category: 'craft',
    scope: 'book',
    name: 'Multi-Track Development',
    description: 'Toggle plot/character/world/magic',
    longDescription: 'Helps develop your story across multiple tracks simultaneously: plot, character, world, and magic/tech. Ensures all elements weave together.',
    icon: Layers,
    color: 'indigo',
    gradient: 'from-indigo-500 to-blue-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'data',
    placeholders: {
      input: 'Current development focus...',
      output: 'Balancing tracks...'
    },
    canChainTo: ['world-building', 'character-ideas'],
    estimatedTokens: 800,
    inspiredBy: ['sanderson'],
  },
  
  {
    id: 'constraint-creator',
    category: 'craft',
    scope: 'book',
    name: 'Constraint Creator',
    description: 'Define impossibilities',
    longDescription: 'Helps define what\'s impossible in your world. Limitations create interesting problems and prevent deus ex machina solutions.',
    icon: AlertTriangle,
    color: 'red',
    gradient: 'from-red-500 to-rose-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'suggestions',
    placeholders: {
      input: 'System or world element...',
      output: 'Defining constraints...'
    },
    canChainTo: ['magic-system-builder'],
    estimatedTokens: 400,
    inspiredBy: ['sanderson'],
  },
  
  // =========================================================================
  // CRAFT TOOLS - MYSTERY WEAVER (Rowling Mode) (4)
  // =========================================================================
  {
    id: 'series-bible',
    category: 'craft',
    scope: 'book',
    name: 'Series Bible',
    description: 'Multi-book planning',
    longDescription: 'Plan story arcs, character development, and world evolution across multiple books. Track what readers know vs. what\'s coming.',
    icon: BookOpen,
    color: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'data',
    placeholders: {
      input: 'Series concept...',
      output: 'Building series bible...'
    },
    canChainTo: ['story-structure'],
    estimatedTokens: 1000,
    inspiredBy: ['rowling'],
  },
  
  {
    id: 'clue-tracker',
    category: 'craft',
    scope: 'book',
    name: 'Clue Tracker',
    description: 'Blue clues, red herrings',
    longDescription: 'Track clues (real information) and red herrings (misdirection) like Rowling\'s color-coded system. Ensures proper setup and payoff.',
    icon: Eye,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'data',
    placeholders: {
      input: 'Clue or red herring...',
      output: 'Tracking clue...'
    },
    canChainTo: ['plot-hole-finder'],
    estimatedTokens: 300,
    inspiredBy: ['rowling'],
  },
  
  {
    id: 'chapter-matrix',
    category: 'craft',
    scope: 'book',
    name: 'Chapter Matrix',
    description: 'Grid view: chapters × subplots',
    longDescription: 'Creates a grid showing how each subplot progresses through each chapter. Ensures all threads get attention and nothing is dropped.',
    icon: Layout,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'data',
    placeholders: {
      input: 'Chapters and subplots...',
      output: 'Building matrix...'
    },
    canChainTo: ['subplot-ideas'],
    estimatedTokens: 600,
    inspiredBy: ['rowling'],
  },
  
  {
    id: 'handwriting-mode',
    category: 'craft',
    scope: 'scene',
    name: 'Handwriting Mode',
    description: 'Stylus/sketch input',
    longDescription: 'Enables handwriting input for those who, like Rowling, prefer drafting by hand. OCR converts to text.',
    icon: Edit3,
    color: 'stone',
    gradient: 'from-stone-500 to-stone-700',
    requiresSelection: false,
    inputType: 'none',
    outputType: 'text',
    placeholders: {
      input: '',
      output: 'Converting handwriting...'
    },
    canChainTo: ['improve-prose'],
    estimatedTokens: 200,
    inspiredBy: ['rowling'],
    isNew: true,
  },
  
  // =========================================================================
  // CRAFT TOOLS - COMMERCIAL MASTER (Patterson Mode) (4)
  // =========================================================================
  {
    id: 'deep-outline',
    category: 'craft',
    scope: 'book',
    name: 'Deep Outline Mode',
    description: 'Scene-by-scene pre-writing',
    longDescription: 'Creates Patterson-style detailed outlines: scene-by-scene breakdowns with emotional goals, character beats, and hooks. The outline IS the book.',
    icon: FileText,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'data',
    placeholders: {
      input: 'Story concept and key beats...',
      output: 'Building deep outline...'
    },
    canChainTo: ['first-draft', 'hook-checker'],
    estimatedTokens: 1200,
    inspiredBy: ['patterson'],
  },
  
  {
    id: 'chapter-length-advisor',
    category: 'craft',
    scope: 'chapter',
    name: 'Chapter Length Advisor',
    description: 'Flag long chapters',
    longDescription: 'Analyzes chapter length for Patterson-style pacing. Flags chapters that may benefit from being split. Short chapters = fast pacing.',
    icon: Gauge,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Chapter content...',
      output: 'Analyzing length...'
    },
    canChainTo: ['pacing-analysis'],
    estimatedTokens: 300,
    inspiredBy: ['patterson'],
  },
  
  {
    id: 'hook-checker',
    category: 'craft',
    scope: 'chapter',
    name: 'Hook Checker',
    description: 'Analyze chapter endings',
    longDescription: 'Evaluates chapter endings for hook strength. Patterson says every chapter should end with a hook that makes readers turn the page.',
    icon: Target,
    color: 'red',
    gradient: 'from-red-500 to-rose-600',
    requiresSelection: false,
    inputType: 'context',
    outputType: 'analysis',
    placeholders: {
      input: 'Chapter ending...',
      output: 'Analyzing hook...'
    },
    options: [
      {
        id: 'hook-type',
        label: 'Hook Type',
        type: 'select',
        default: 'any',
        options: [
          { value: 'any', label: 'Any hook' },
          { value: 'cliffhanger', label: 'Cliffhanger' },
          { value: 'question', label: 'Question' },
          { value: 'revelation', label: 'Revelation' },
        ]
      }
    ],
    canChainTo: ['add-tension'],
    estimatedTokens: 400,
    inspiredBy: ['patterson'],
  },
  
  {
    id: 'reader-avatar',
    category: 'craft',
    scope: 'book',
    name: 'Reader Avatar',
    description: 'Define your ideal reader',
    longDescription: 'Creates a detailed profile of your ideal reader. Patterson: "Write for one reader sitting across from you." Helps focus and personalize.',
    icon: User,
    color: 'teal',
    gradient: 'from-teal-500 to-emerald-600',
    requiresSelection: false,
    inputType: 'text',
    outputType: 'data',
    placeholders: {
      input: 'Who is your ideal reader?',
      output: 'Building reader avatar...'
    },
    canChainTo: ['readability-score'],
    estimatedTokens: 400,
    inspiredBy: ['patterson'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getToolById(id: string): AITool | undefined {
  return AI_TOOLS.find(tool => tool.id === id);
}

export function getToolsByCategory(category: ToolCategory): AITool[] {
  return AI_TOOLS.filter(tool => tool.category === category);
}

export function getToolsByScope(scope: ToolScope): AITool[] {
  return AI_TOOLS.filter(tool => tool.scope === scope);
}

export function getToolsByAuthor(author: AuthorInspiration): AITool[] {
  return AI_TOOLS.filter(tool => tool.inspiredBy?.includes(author));
}

export function getChainableTools(toolId: string): AITool[] {
  const tool = getToolById(toolId);
  if (!tool) return [];
  return tool.canChainTo.map(id => getToolById(id)).filter(Boolean) as AITool[];
}

// Tool categories with metadata
export const TOOL_CATEGORIES: { id: ToolCategory; label: string; description: string; color: string; icon: string }[] = [
  { id: 'generate', label: 'Generate', description: 'Create new content', color: 'teal', icon: 'PenTool' },
  { id: 'enhance', label: 'Enhance', description: 'Improve existing content', color: 'violet', icon: 'Sparkles' },
  { id: 'analyze', label: 'Analyze', description: 'Evaluate and measure', color: 'blue', icon: 'BarChart3' },
  { id: 'brainstorm', label: 'Brainstorm', description: 'Generate ideas', color: 'amber', icon: 'Lightbulb' },
  { id: 'craft', label: 'Craft', description: 'Master author tools', color: 'rose', icon: 'Feather' },
];

// Category config as Record for object-style access
export const CATEGORY_STYLE_CONFIG: Record<ToolCategory, { 
  label: string; 
  description: string; 
  color: string;
  icon: any;
}> = {
  generate: { label: 'Generate', description: 'Create new content', color: 'teal', icon: PenTool },
  enhance: { label: 'Enhance', description: 'Improve existing content', color: 'violet', icon: Sparkles },
  analyze: { label: 'Analyze', description: 'Evaluate and measure', color: 'blue', icon: BarChart2 },
  brainstorm: { label: 'Brainstorm', description: 'Generate ideas', color: 'amber', icon: Lightbulb },
  craft: { label: 'Craft', description: 'Master author tools', color: 'rose', icon: Feather },
};

// Author modes with metadata
export const AUTHOR_MODES: { id: AuthorInspiration; name: string; description: string; tools: string[] }[] = [
  { 
    id: 'king', 
    name: 'Discovery Writer (King)', 
    description: '2,000 words/day, no outline, trust the story',
    tools: ['daily-word-goal', 'session-warmup', 'cliffhanger-reminder', 'darling-detector']
  },
  { 
    id: 'sanderson', 
    name: 'Architect (Sanderson)', 
    description: 'Deep world-building, hard magic, floating outlines',
    tools: ['magic-system-builder', 'beat-markers', 'multi-track', 'constraint-creator']
  },
  { 
    id: 'rowling', 
    name: 'Mystery Weaver (Rowling)', 
    description: 'Series planning, clue tracking, meticulous setup',
    tools: ['series-bible', 'clue-tracker', 'chapter-matrix', 'handwriting-mode']
  },
  { 
    id: 'patterson', 
    name: 'Commercial Master (Patterson)', 
    description: 'Deep outlines, short chapters, strong hooks',
    tools: ['deep-outline', 'chapter-length-advisor', 'hook-checker', 'reader-avatar']
  },
];

// ============================================================================
// AUTHOR STYLE CONFIG (for UI styling)
// ============================================================================

export const AUTHOR_STYLE_CONFIG: Record<AuthorInspiration, { 
  color: string; 
  name: string; 
  description: string;
  bgClass: string;
  textClass: string;
}> = {
  king: { 
    color: 'amber', 
    name: 'Stephen King',
    description: 'Discovery Writer',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-300'
  },
  sanderson: { 
    color: 'blue', 
    name: 'Brandon Sanderson',
    description: 'World Builder',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300'
  },
  rowling: { 
    color: 'purple', 
    name: 'J.K. Rowling',
    description: 'Mystery Weaver',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-300'
  },
  patterson: { 
    color: 'rose', 
    name: 'James Patterson',
    description: 'Commercial Master',
    bgClass: 'bg-rose-100 dark:bg-rose-900/30',
    textClass: 'text-rose-700 dark:text-rose-300'
  },
  collins: { 
    color: 'emerald', 
    name: 'Suzanne Collins',
    description: 'Tension Builder',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-300'
  },
};

// ============================================================================
// COMPATIBILITY EXPORTS (for existing code)
// ============================================================================

// Alias for backward compatibility
export const allTools = AI_TOOLS;
export const categoryConfig = CATEGORY_STYLE_CONFIG;
export const authorModeConfig = AUTHOR_STYLE_CONFIG;
export const authorModes = AUTHOR_MODES;
export const toolCategories = TOOL_CATEGORIES;

// Export AuthorMode type
export type AuthorMode = AuthorInspiration;

// ============================================================================
// SCOPE VIEWS (for UI scope switching)
// ============================================================================

export type ScopeViewId = 'scene' | 'book' | 'all';

export interface ScopeViewDefinition {
  id: ScopeViewId;
  name: string;
  description: string;
  icon: string;
}

export const SCOPE_VIEWS: ScopeViewDefinition[] = [
  {
    id: 'scene',
    name: 'Scene/Chapter',
    description: 'Tools that work on individual scenes or chapters',
    icon: 'FileText'
  },
  {
    id: 'book',
    name: 'Whole Book',
    description: 'Tools that analyze or affect the entire book',
    icon: 'BookOpen'
  },
  {
    id: 'all',
    name: 'All Tools',
    description: 'View all available tools',
    icon: 'Grid3X3'
  }
];

// ============================================================================
// EXTENDED HELPER FUNCTIONS
// ============================================================================

export function getToolsByScopeAndCategory(
  scope: ScopeViewId | null, 
  category: ToolCategory | 'all'
): AITool[] {
  let filtered = AI_TOOLS;
  
  // Filter by scope
  if (scope && scope !== 'all') {
    filtered = filtered.filter(tool => {
      if (scope === 'scene') {
        return tool.scope === 'scene' || tool.scope === 'chapter' || tool.scope === 'hybrid';
      }
      if (scope === 'book') {
        return tool.scope === 'book' || tool.scope === 'hybrid';
      }
      return true;
    });
  }
  
  // Filter by category
  if (category && category !== 'all') {
    filtered = filtered.filter(tool => tool.category === category);
  }
  
  return filtered;
}

export function getToolIconBg(tool: AITool): string {
  const colorMap: Record<string, string> = {
    teal: 'bg-teal-100 dark:bg-teal-900/30',
    violet: 'bg-violet-100 dark:bg-violet-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    amber: 'bg-amber-100 dark:bg-amber-900/30',
    rose: 'bg-rose-100 dark:bg-rose-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30',
    pink: 'bg-pink-100 dark:bg-pink-900/30',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30',
    lime: 'bg-lime-100 dark:bg-lime-900/30',
    sky: 'bg-sky-100 dark:bg-sky-900/30',
  };
  return colorMap[tool.color] || 'bg-gray-100 dark:bg-gray-800';
}

export function getToolColorClass(tool: AITool): string {
  const colorMap: Record<string, string> = {
    teal: 'text-teal-600 dark:text-teal-400',
    violet: 'text-violet-600 dark:text-violet-400',
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    orange: 'text-orange-600 dark:text-orange-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    pink: 'text-pink-600 dark:text-pink-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    lime: 'text-lime-600 dark:text-lime-400',
    sky: 'text-sky-600 dark:text-sky-400',
  };
  return colorMap[tool.color] || 'text-gray-600 dark:text-gray-400';
}

export function getScopeBadgeClass(scope: ToolScope): string {
  const scopeMap: Record<ToolScope, string> = {
    scene: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    chapter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    book: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    hybrid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };
  return scopeMap[scope] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

export function getScopeLabel(scope: ToolScope): string {
  const labelMap: Record<ToolScope, string> = {
    scene: 'Scene',
    chapter: 'Chapter',
    book: 'Book',
    hybrid: 'Flexible',
  };
  return labelMap[scope] || scope;
}

export function getQuickActions(scope: ScopeViewId): AITool[] {
  // Return popular tools for quick access based on current scope
  const quickActionIds: Record<ScopeViewId, string[]> = {
    scene: ['continue-writing', 'improve-prose', 'write-dialogue', 'add-tension'],
    book: ['plot-holes', 'character-arc-analysis', 'pacing-analysis', 'readability-score'],
    all: ['continue-writing', 'improve-prose', 'plot-holes', 'brainstorm-ideas']
  };
  
  const ids = quickActionIds[scope] || quickActionIds.all;
  return ids.map(id => getToolById(id)).filter(Boolean) as AITool[];
}
