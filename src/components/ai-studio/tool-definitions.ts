// ============================================================================
// AI STUDIO TOOL DEFINITIONS - COMPLETE SCOPED TOOL SYSTEM
// ============================================================================

import { AITool, ToolId, ToolCategory, ToolScope, Genre } from './types';

// ============================================================================
// GENRE OPTIONS
// ============================================================================

export const GENRES: { id: Genre; name: string }[] = [
  { id: 'romance', name: 'Romance' }, { id: 'mystery', name: 'Mystery' }, { id: 'thriller', name: 'Thriller' }, { id: 'fantasy', name: 'Fantasy' }, { id: 'scifi', name: 'Sci-Fi' },
  { id: 'literary', name: 'Literary' }, { id: 'horror', name: 'Horror' }, { id: 'ya', name: 'Young Adult' }, { id: 'historical', name: 'Historical' }, { id: 'contemporary', name: 'Contemporary' }
];

// ============================================================================
// SECTION 1: TOOL SCOPE ASSIGNMENTS
// ============================================================================

/**
 * SCENE-SCOPE TOOLS (require book_id + document_id)
 * - Operate on single scene/chapter
 * - Can only chain to scene-level or hybrid tools
 */
export const SCENE_SCOPE_TOOLS: ToolId[] = [
  // Generate
  'continue',
  'dialogue',
  'description',
  'action',
  'inner-monologue',
  // Enhance
  'improve',
  'show-not-tell',
  'deepen-emotion',
  'add-tension',
  'vary-sentences',
  'sensory-details',
];

/**
 * BOOK-SCOPE TOOLS (require book_id only)
 * - Operate on entire manuscript or global structure
 * - Can only chain to book-level or hybrid tools
 */
export const BOOK_SCOPE_TOOLS: ToolId[] = [
  // Analyze
  'plot-holes',
  'emotional-arc',
  // Brainstorm
  'plot-twists',
  'character-ideas',
  'world-building',
  'conflict-generator',
  'subplot-ideas',
];

/**
 * HYBRID-SCOPE TOOLS (user chooses at runtime)
 * - Can run on: this scene, selected chapters, or whole book
 * - Chain to any tool based on selected scope
 */
export const HYBRID_SCOPE_TOOLS: ToolId[] = [
  // Generate
  'first-draft',
  // Analyze
  'pacing',
  'character-voice',
  'readability',
  'word-frequency',
  // Brainstorm
  'scene-ideas',
];

// ============================================================================
// SECTION 2: COMPLETE TOOL DEFINITIONS
// ============================================================================

export const AI_TOOLS: AITool[] = [
  // ============================================================================
  // GENERATE TOOLS (6)
  // ============================================================================
  {
    id: 'continue',
    category: 'generate',
    scope: 'scene',
    name: 'Continue Writing',
    description: 'AI continues your story naturally, matching your voice and style',
    icon: 'ArrowRight',
    shortcut: '⌘K',
    color: 'violet',
    requiresSelection: false,
    outputType: 'text',
    placeholders: {
      input: 'Paste your text here, or select text in the editor. The AI will continue from where you left off...',
      output: 'AI-generated continuation will appear here...'
    },
    canChainTo: ['improve', 'show-not-tell', 'deepen-emotion', 'add-tension', 'vary-sentences', 'sensory-details', 'pacing', 'character-voice'],
    minInputLength: 50,
    maxInputLength: 10000,
    estimatedTokens: 500
  },
  {
    id: 'first-draft',
    category: 'generate',
    scope: 'hybrid',
    name: 'First Draft Mode',
    description: 'Transform outlines and notes into complete, polished scenes',
    icon: 'FileText',
    shortcut: '⌘D',
    color: 'violet',
    requiresSelection: false,
    outputType: 'text',
    placeholders: {
      input: `Enter your outline, bullet points, or scene notes...

Example:
- Sarah enters the coffee shop
- She spots Marcus at a corner table
- They have an awkward reunion
- Old feelings resurface`,
      output: 'Complete scene will be generated here...'
    },
    canChainTo: ['improve', 'show-not-tell', 'deepen-emotion', 'pacing', 'character-voice'],
    minInputLength: 20,
    maxInputLength: 5000,
    estimatedTokens: 1000
  },
  {
    id: 'dialogue',
    category: 'generate',
    scope: 'scene',
    name: 'Write Dialogue',
    description: 'Create authentic character conversations with distinct voices',
    icon: 'MessageSquare',
    shortcut: '⌘L',
    color: 'violet',
    requiresSelection: false,
    outputType: 'text',
    placeholders: {
      input: `Describe the conversation context:
- Who is talking?
- What are they discussing?
- What is the emotional undercurrent?
- What do they each want?`,
      output: 'Dialogue will be generated here...'
    },
    canChainTo: ['improve', 'show-not-tell', 'character-voice', 'add-tension'],
    minInputLength: 20,
    maxInputLength: 3000,
    estimatedTokens: 400
  },
  {
    id: 'description',
    category: 'generate',
    scope: 'scene',
    name: 'Add Description',
    description: 'Rich sensory details and vivid imagery that immerses readers',
    icon: 'Palette',
    shortcut: '⌘E',
    color: 'violet',
    requiresSelection: false,
    outputType: 'text',
    placeholders: {
      input: `What needs description?
- A character\`s appearance
- A location/setting
- An object
- An atmosphere/mood`,
      output: 'Descriptive passage will appear here...'
    },
    canChainTo: ['improve', 'sensory-details', 'show-not-tell'],
    minInputLength: 10,
    maxInputLength: 2000,
    estimatedTokens: 300
  },
  {
    id: 'action',
    category: 'generate',
    scope: 'scene',
    name: 'Action Scene',
    description: 'Dynamic, well-paced action sequences with visceral impact',
    icon: 'Zap',
    shortcut: null,
    color: 'violet',
    requiresSelection: false,
    outputType: 'text',
    placeholders: {
      input: `Describe the action scene:
- Who is involved?
- What triggers the action?
- What\`s at stake?
- Setting/environment?`,
      output: 'Action sequence will be generated here...'
    },
    canChainTo: ['improve', 'add-tension', 'vary-sentences', 'pacing'],
    minInputLength: 20,
    maxInputLength: 3000,
    estimatedTokens: 600
  },
  {
    id: 'inner-monologue',
    category: 'generate',
    scope: 'scene',
    name: 'Inner Thoughts',
    description: 'Deep character internal monologue and psychological depth',
    icon: 'Brain',
    shortcut: null,
    color: 'violet',
    requiresSelection: false,
    outputType: 'text',
    placeholders: {
      input: `Context for internal monologue:
- Which character?
- What situation are they in?
- What are they wrestling with?
- What memories might surface?`,
      output: 'Internal monologue will appear here...'
    },
    canChainTo: ['improve', 'deepen-emotion', 'show-not-tell', 'character-voice'],
    minInputLength: 20,
    maxInputLength: 3000,
    estimatedTokens: 400
  },

  // ============================================================================
  // ENHANCE TOOLS (6) - All Scene Scope
  // ============================================================================
  {
    id: 'improve',
    category: 'enhance',
    scope: 'scene',
    name: 'Improve Prose',
    description: 'Elevate your writing while maintaining your unique voice',
    icon: 'Star',
    shortcut: '⌘I',
    color: 'blue',
    requiresSelection: true,
    outputType: 'text',
    placeholders: {
      input: 'Paste the text you want to improve...',
      output: 'Enhanced version will appear here...'
    },
    canChainTo: ['show-not-tell', 'deepen-emotion', 'add-tension', 'vary-sentences', 'sensory-details', 'pacing'],
    minInputLength: 50,
    maxInputLength: 5000,
    estimatedTokens: 400
  },
  {
    id: 'show-not-tell',
    category: 'enhance',
    scope: 'scene',
    name: 'Show, Don\'t Tell',
    description: 'Transform abstract telling into concrete, vivid showing',
    icon: 'Eye',
    shortcut: null,
    color: 'blue',
    requiresSelection: true,
    outputType: 'text',
    placeholders: {
      input: `Paste text with "telling" that needs to become "showing"...

Example: "She was angry" → showing her anger through actions`,
      output: 'Rewritten passage will appear here...'
    },
    canChainTo: ['improve', 'deepen-emotion', 'sensory-details'],
    minInputLength: 20,
    maxInputLength: 3000,
    estimatedTokens: 350
  },
  {
    id: 'deepen-emotion',
    category: 'enhance',
    scope: 'scene',
    name: 'Deepen Emotion',
    description: 'Add emotional resonance and psychological depth',
    icon: 'Heart',
    shortcut: null,
    color: 'blue',
    requiresSelection: true,
    outputType: 'text',
    placeholders: {
      input: 'Paste the passage you want to make more emotionally impactful...',
      output: 'Emotionally enriched version will appear here...'
    },
    canChainTo: ['improve', 'show-not-tell', 'character-voice'],
    minInputLength: 50,
    maxInputLength: 4000,
    estimatedTokens: 400
  },
  {
    id: 'add-tension',
    category: 'enhance',
    scope: 'scene',
    name: 'Add Tension',
    description: 'Increase conflict, stakes, and suspense in your scenes',
    icon: 'Flame',
    shortcut: null,
    color: 'blue',
    requiresSelection: true,
    outputType: 'text',
    placeholders: {
      input: 'Paste the scene that needs more tension...',
      output: 'Version with heightened tension will appear here...'
    },
    canChainTo: ['improve', 'pacing', 'vary-sentences'],
    minInputLength: 100,
    maxInputLength: 5000,
    estimatedTokens: 500
  },
  {
    id: 'vary-sentences',
    category: 'enhance',
    scope: 'scene',
    name: 'Vary Sentences',
    description: 'Improve rhythm and flow with varied sentence structures',
    icon: 'TrendingUp',
    shortcut: null,
    color: 'blue',
    requiresSelection: true,
    outputType: 'text',
    placeholders: {
      input: 'Paste text with monotonous sentence structure...',
      output: 'Version with varied rhythm will appear here...'
    },
    canChainTo: ['improve', 'readability'],
    minInputLength: 100,
    maxInputLength: 4000,
    estimatedTokens: 350
  },
  {
    id: 'sensory-details',
    category: 'enhance',
    scope: 'scene',
    name: 'Sensory Details',
    description: 'Enrich with sight, sound, smell, taste, and touch',
    icon: 'Sparkles',
    shortcut: null,
    color: 'blue',
    requiresSelection: true,
    outputType: 'text',
    placeholders: {
      input: 'Paste the passage to enrich with sensory details...',
      output: 'Sensorially enriched version will appear here...'
    },
    canChainTo: ['improve', 'show-not-tell'],
    minInputLength: 50,
    maxInputLength: 3000,
    estimatedTokens: 350
  },

  // ============================================================================
  // ANALYZE TOOLS (6) - Mixed Scopes
  // ============================================================================
  {
    id: 'pacing',
    category: 'analyze',
    scope: 'hybrid',
    name: 'Pacing Analysis',
    description: 'Evaluate scene pacing and narrative rhythm',
    icon: 'BarChart3',
    shortcut: null,
    color: 'emerald',
    requiresSelection: true,
    outputType: 'analysis',
    placeholders: {
      input: 'Paste the chapter or scene to analyze for pacing...',
      output: 'Pacing analysis will appear here...'
    },
    canChainTo: ['add-tension', 'vary-sentences'],
    minInputLength: 200,
    maxInputLength: 20000,
    estimatedTokens: 600
  },
  {
    id: 'character-voice',
    category: 'analyze',
    scope: 'hybrid',
    name: 'Character Voice Check',
    description: 'Analyze consistency and authenticity of character voices',
    icon: 'Users',
    shortcut: null,
    color: 'emerald',
    requiresSelection: true,
    outputType: 'analysis',
    placeholders: {
      input: 'Paste dialogue or character-focused text to analyze...',
      output: 'Voice analysis will appear here...'
    },
    canChainTo: ['dialogue', 'inner-monologue', 'improve'],
    minInputLength: 100,
    maxInputLength: 15000,
    estimatedTokens: 500
  },
  {
    id: 'plot-holes',
    category: 'analyze',
    scope: 'book',
    name: 'Plot Hole Finder',
    description: 'Identify logical inconsistencies and plot problems',
    icon: 'Search',
    shortcut: null,
    color: 'emerald',
    requiresSelection: true,
    outputType: 'analysis',
    placeholders: {
      input: 'Paste text to check for plot holes and inconsistencies...',
      output: 'Plot analysis will appear here...'
    },
    canChainTo: ['plot-twists', 'scene-ideas'],
    minInputLength: 500,
    maxInputLength: 50000,
    estimatedTokens: 800
  },
  {
    id: 'readability',
    category: 'analyze',
    scope: 'hybrid',
    name: 'Readability Score',
    description: 'Grade level, complexity, and accessibility analysis',
    icon: 'BookOpen',
    shortcut: null,
    color: 'emerald',
    requiresSelection: true,
    outputType: 'analysis',
    placeholders: {
      input: 'Paste text to analyze for readability...',
      output: 'Readability metrics will appear here...'
    },
    canChainTo: ['improve', 'vary-sentences'],
    minInputLength: 100,
    maxInputLength: 20000,
    estimatedTokens: 400
  },
  {
    id: 'word-frequency',
    category: 'analyze',
    scope: 'hybrid',
    name: 'Word Frequency',
    description: 'Find overused words, phrases, and patterns',
    icon: 'Hash',
    shortcut: null,
    color: 'emerald',
    requiresSelection: true,
    outputType: 'analysis',
    placeholders: {
      input: 'Paste text to analyze for word frequency...',
      output: 'Frequency analysis will appear here...'
    },
    canChainTo: ['improve', 'vary-sentences'],
    minInputLength: 200,
    maxInputLength: 50000,
    estimatedTokens: 500
  },
  {
    id: 'emotional-arc',
    category: 'analyze',
    scope: 'book',
    name: 'Emotional Arc',
    description: 'Map the emotional journey through your text',
    icon: 'Activity',
    shortcut: null,
    color: 'emerald',
    requiresSelection: true,
    outputType: 'analysis',
    placeholders: {
      input: 'Paste chapter or scene to map emotional arc...',
      output: 'Emotional arc visualization will appear here...'
    },
    canChainTo: ['deepen-emotion', 'pacing', 'scene-ideas'],
    minInputLength: 500,
    maxInputLength: 50000,
    estimatedTokens: 700
  },

  // ============================================================================
  // BRAINSTORM TOOLS (6) - Mixed Scopes
  // ============================================================================
  {
    id: 'plot-twists',
    category: 'brainstorm',
    scope: 'book',
    name: 'Plot Twists',
    description: 'Generate unexpected turns and revelations',
    icon: 'Shuffle',
    shortcut: null,
    color: 'amber',
    requiresSelection: false,
    outputType: 'suggestions',
    placeholders: {
      input: `Describe your current plot situation:
- What has happened so far?
- Who are the key players?
- What do readers expect to happen?`,
      output: 'Plot twist ideas will appear here...'
    },
    canChainTo: ['scene-ideas', 'conflict-generator', 'first-draft'],
    minInputLength: 50,
    maxInputLength: 5000,
    estimatedTokens: 600
  },
  {
    id: 'character-ideas',
    category: 'brainstorm',
    scope: 'book',
    name: 'Character Ideas',
    description: 'Generate new characters or deepen existing ones',
    icon: 'UserPlus',
    shortcut: null,
    color: 'amber',
    requiresSelection: false,
    outputType: 'structured',
    placeholders: {
      input: `What kind of character do you need?
- Role in story (protagonist, antagonist, mentor, etc.)
- Genre and setting
- Themes they should embody`,
      output: 'Character concepts will appear here...'
    },
    canChainTo: ['dialogue', 'inner-monologue', 'conflict-generator'],
    minInputLength: 20,
    maxInputLength: 3000,
    estimatedTokens: 500
  },
  {
    id: 'world-building',
    category: 'brainstorm',
    scope: 'book',
    name: 'World Building',
    description: 'Develop settings, cultures, and world details',
    icon: 'Globe',
    shortcut: null,
    color: 'amber',
    requiresSelection: false,
    outputType: 'structured',
    placeholders: {
      input: `What aspect of your world needs development?
- Geography and environment
- Culture and society
- Magic/technology systems
- History and lore`,
      output: 'World-building details will appear here...'
    },
    canChainTo: ['description', 'scene-ideas'],
    minInputLength: 20,
    maxInputLength: 5000,
    estimatedTokens: 700
  },
  {
    id: 'conflict-generator',
    category: 'brainstorm',
    scope: 'book',
    name: 'Conflict Generator',
    description: 'Create compelling conflicts and obstacles',
    icon: 'Swords',
    shortcut: null,
    color: 'amber',
    requiresSelection: false,
    outputType: 'suggestions',
    placeholders: {
      input: `Context for conflicts:
- Who is your protagonist?
- What do they want?
- What are they afraid of?
- Who/what opposes them?`,
      output: 'Conflict ideas will appear here...'
    },
    canChainTo: ['plot-twists', 'scene-ideas', 'action', 'add-tension'],
    minInputLength: 30,
    maxInputLength: 4000,
    estimatedTokens: 500
  },
  {
    id: 'subplot-ideas',
    category: 'brainstorm',
    scope: 'book',
    name: 'Subplot Ideas',
    description: 'Generate B-plots that enrich your main story',
    icon: 'GitBranch',
    shortcut: null,
    color: 'amber',
    requiresSelection: false,
    outputType: 'suggestions',
    placeholders: {
      input: `Your main plot summary:
- What is the central conflict?
- Who are the main characters?
- What themes are you exploring?`,
      output: 'Subplot suggestions will appear here...'
    },
    canChainTo: ['scene-ideas', 'character-ideas', 'conflict-generator'],
    minInputLength: 50,
    maxInputLength: 5000,
    estimatedTokens: 600
  },
  {
    id: 'scene-ideas',
    category: 'brainstorm',
    scope: 'hybrid',
    name: 'Scene Ideas',
    description: 'Generate scene concepts to fill gaps or add depth',
    icon: 'Layout',
    shortcut: null,
    color: 'amber',
    requiresSelection: false,
    outputType: 'suggestions',
    placeholders: {
      input: `What do you need scenes for?
- Character development
- Plot advancement
- Relationship building
- Tension and conflict
- World exploration`,
      output: 'Scene ideas will appear here...'
    },
    canChainTo: ['first-draft', 'dialogue', 'action', 'description'],
    minInputLength: 20,
    maxInputLength: 4000,
    estimatedTokens: 500
  }
];

// ============================================================================
// SECTION 3: TOOL CATEGORY CONFIGURATION
// ============================================================================

export const TOOL_CATEGORIES: {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  bgColor: string;
}[] = [
  {
    id: 'generate',
    name: 'Generate',
    description: 'Create new content',
    icon: 'Sparkles',
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30'
  },
  {
    id: 'enhance',
    name: 'Enhance',
    description: 'Improve existing text',
    icon: 'Wand2',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30'
  },
  {
    id: 'analyze',
    name: 'Analyze',
    description: 'Get insights on your writing',
    icon: 'BarChart3',
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30'
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    description: 'Explore ideas and possibilities',
    icon: 'Lightbulb',
    gradient: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30'
  }
];

// ============================================================================
// SECTION 4: SCOPE VIEW CONFIGURATION
// ============================================================================

export const SCOPE_VIEWS: {
  id: 'scene' | 'book' | 'all';
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: 'scene',
    name: 'Scene / Chapter',
    description: 'Tools that work on individual scenes',
    icon: 'FileText'
  },
  {
    id: 'book',
    name: 'Whole Book & Structure',
    description: 'Tools for manuscript-wide operations',
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
// SECTION 5: HELPER FUNCTIONS
// ============================================================================

export function getToolsByCategory(category: ToolCategory): AITool[] {
  return AI_TOOLS.filter(tool => tool.category === category);
}

export function getToolById(id: ToolId): AITool | undefined {
  return AI_TOOLS.find(tool => tool.id === id);
}

export function getToolsByScope(scope: 'scene' | 'book' | 'all'): AITool[] {
  if (scope === 'all') return AI_TOOLS;
  if (scope === 'scene') {
    return AI_TOOLS.filter(tool => tool.scope === 'scene' || tool.scope === 'hybrid');
  }
  return AI_TOOLS.filter(tool => tool.scope === 'book' || tool.scope === 'hybrid');
}

export function getToolsByScopeAndCategory(
  scope: 'scene' | 'book' | 'all',
  category: ToolCategory | 'all'
): AITool[] {
  let tools = getToolsByScope(scope);
  if (category !== 'all') {
    tools = tools.filter(tool => tool.category === category);
  }
  return tools;
}

export function getChainableTools(sourceTool: AITool): AITool[] {
  return sourceTool.canChainTo
    .map(id => getToolById(id))
    .filter((tool): tool is AITool => tool !== undefined);
}

export function getToolColorClass(tool: AITool): string {
  const colorMap: Record<string, string> = {
    violet: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
    blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    amber: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
  };
  return colorMap[tool.color] || colorMap.violet;
}

export function getToolIconBg(tool: AITool): string {
  const colorMap: Record<string, string> = {
    violet: 'bg-gradient-to-br from-violet-500 to-purple-600',
    blue: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    emerald: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    amber: 'bg-gradient-to-br from-amber-500 to-orange-500'
  };
  return colorMap[tool.color] || colorMap.violet;
}

export function getScopeBadgeClass(scope: 'scene' | 'book' | 'hybrid'): string {
  const scopeColors: Record<string, string> = {
    scene: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    book: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    hybrid: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
  };
  return scopeColors[scope];
}

export function getScopeLabel(scope: 'scene' | 'book' | 'hybrid'): string {
  const labels: Record<string, string> = {
    scene: 'Scene',
    book: 'Book',
    hybrid: 'Flexible'
  };
  return labels[scope];
}

// ============================================================================
// SECTION 6: QUICK ACTIONS BY SCOPE
// ============================================================================

export const QUICK_ACTIONS_SCENE: ToolId[] = [
  'continue',
  'improve',
  'dialogue',
  'add-tension',
  'show-not-tell',
  'pacing'
];

export const QUICK_ACTIONS_BOOK: ToolId[] = [
  'plot-holes',
  'emotional-arc',
  'plot-twists',
  'character-ideas',
  'subplot-ideas',
  'world-building'
];

export function getQuickActions(scope: 'scene' | 'book' | 'all'): AITool[] {
  const ids = scope === 'scene' 
    ? QUICK_ACTIONS_SCENE 
    : scope === 'book' 
      ? QUICK_ACTIONS_BOOK 
      : [...QUICK_ACTIONS_SCENE.slice(0, 3), ...QUICK_ACTIONS_BOOK.slice(0, 3)];
  
  return ids
    .map(id => getToolById(id))
    .filter((tool): tool is AITool => tool !== undefined);
}
