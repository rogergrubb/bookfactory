import { AITool, ToolId, ToolCategory } from './types';

// Complete definitions for all 24 AI tools
export const AI_TOOLS: AITool[] = [
  // ============================================
  // GENERATE TOOLS (6)
  // ============================================
  {
    id: 'continue',
    category: 'generate',
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
    }
  },
  {
    id: 'first-draft',
    category: 'generate',
    name: 'First Draft Mode',
    description: 'Transform outlines and notes into complete, polished scenes',
    icon: 'FileText',
    shortcut: '⌘D',
    color: 'violet',
    requiresSelection: false,
    outputType: 'text',
    placeholders: {
      input: 'Enter your outline, bullet points, or scene notes...\n\nExample:\n- Sarah enters the coffee shop\n- She spots Marcus at a corner table\n- They have an awkward reunion\n- Old feelings resurface',
      output: 'Complete scene will be generated here...'
    }
  },
  {
    id: 'dialogue',
    category: 'generate',
    name: 'Write Dialogue',
    description: 'Create authentic character conversations with distinct voices',
    icon: 'MessageSquare',
    shortcut: '⌘L',
    color: 'violet',
    requiresSelection: false,
    outputType: 'text',
    placeholders: {
      input: 'Describe the conversation context:\n- Who is talking?\n- What are they discussing?\n- What is the emotional undercurrent?\n- What do they each want?',
      output: 'Dialogue will be generated here...'
    }
  },
  {
    id: 'description',
    category: 'generate',
    name: 'Add Description',
    description: 'Rich sensory details and vivid imagery that immerses readers',
    icon: 'Palette',
    shortcut: '⌘E',
    color: 'violet',
    requiresSelection: false,
    outputType: 'text',
    placeholders: {
      input: 'What needs description?\n- A character\'s appearance\n- A location/setting\n- An object\n- An atmosphere/mood',
      output: 'Descriptive passage will appear here...'
    }
  },
  {
    id: 'action',
    category: 'generate',
    name: 'Action Scene',
    description: 'Dynamic, well-paced action sequences with visceral impact',
    icon: 'Zap',
    shortcut: null,
    color: 'violet',
    requiresSelection: false,
    outputType: 'text',
    placeholders: {
      input: 'Describe the action scene:\n- Who is involved?\n- What triggers the action?\n- What\'s at stake?\n- Setting/environment?',
      output: 'Action sequence will be generated here...'
    }
  },
  {
    id: 'inner-monologue',
    category: 'generate',
    name: 'Inner Thoughts',
    description: 'Deep character internal monologue and psychological depth',
    icon: 'Brain',
    shortcut: null,
    color: 'violet',
    requiresSelection: false,
    outputType: 'text',
    placeholders: {
      input: 'Context for internal monologue:\n- Which character?\n- What situation are they in?\n- What are they wrestling with?\n- What memories might surface?',
      output: 'Internal monologue will appear here...'
    }
  },

  // ============================================
  // ENHANCE TOOLS (6)
  // ============================================
  {
    id: 'improve',
    category: 'enhance',
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
    }
  },
  {
    id: 'show-not-tell',
    category: 'enhance',
    name: 'Show, Don\'t Tell',
    description: 'Transform abstract telling into concrete, vivid showing',
    icon: 'Eye',
    shortcut: null,
    color: 'blue',
    requiresSelection: true,
    outputType: 'text',
    placeholders: {
      input: 'Paste text with "telling" that needs to become "showing"...\n\nExample: "She was angry" → showing her anger through actions',
      output: 'Rewritten passage will appear here...'
    }
  },
  {
    id: 'deepen-emotion',
    category: 'enhance',
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
    }
  },
  {
    id: 'add-tension',
    category: 'enhance',
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
    }
  },
  {
    id: 'vary-sentences',
    category: 'enhance',
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
    }
  },
  {
    id: 'sensory-details',
    category: 'enhance',
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
    }
  },

  // ============================================
  // ANALYZE TOOLS (6)
  // ============================================
  {
    id: 'pacing',
    category: 'analyze',
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
    }
  },
  {
    id: 'character-voice',
    category: 'analyze',
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
    }
  },
  {
    id: 'plot-holes',
    category: 'analyze',
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
    }
  },
  {
    id: 'readability',
    category: 'analyze',
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
    }
  },
  {
    id: 'word-frequency',
    category: 'analyze',
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
    }
  },
  {
    id: 'emotional-arc',
    category: 'analyze',
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
    }
  },

  // ============================================
  // BRAINSTORM TOOLS (6)
  // ============================================
  {
    id: 'plot-twists',
    category: 'brainstorm',
    name: 'Plot Twists',
    description: 'Generate unexpected turns and revelations',
    icon: 'Shuffle',
    shortcut: null,
    color: 'amber',
    requiresSelection: false,
    outputType: 'suggestions',
    placeholders: {
      input: 'Describe your current plot situation:\n- What has happened so far?\n- Who are the key players?\n- What do readers expect to happen?',
      output: 'Plot twist ideas will appear here...'
    }
  },
  {
    id: 'character-ideas',
    category: 'brainstorm',
    name: 'Character Ideas',
    description: 'Generate new characters or deepen existing ones',
    icon: 'UserPlus',
    shortcut: null,
    color: 'amber',
    requiresSelection: false,
    outputType: 'structured',
    placeholders: {
      input: 'What kind of character do you need?\n- Role in story (protagonist, antagonist, mentor, etc.)\n- Genre and setting\n- Themes they should embody',
      output: 'Character concepts will appear here...'
    }
  },
  {
    id: 'world-building',
    category: 'brainstorm',
    name: 'World Building',
    description: 'Develop settings, cultures, and world details',
    icon: 'Globe',
    shortcut: null,
    color: 'amber',
    requiresSelection: false,
    outputType: 'structured',
    placeholders: {
      input: 'What aspect of your world needs development?\n- Geography and environment\n- Culture and society\n- Magic/technology systems\n- History and lore',
      output: 'World-building details will appear here...'
    }
  },
  {
    id: 'conflict-generator',
    category: 'brainstorm',
    name: 'Conflict Generator',
    description: 'Create compelling conflicts and obstacles',
    icon: 'Swords',
    shortcut: null,
    color: 'amber',
    requiresSelection: false,
    outputType: 'suggestions',
    placeholders: {
      input: 'Context for conflicts:\n- Who is your protagonist?\n- What do they want?\n- What are they afraid of?\n- Who/what opposes them?',
      output: 'Conflict ideas will appear here...'
    }
  },
  {
    id: 'subplot-ideas',
    category: 'brainstorm',
    name: 'Subplot Ideas',
    description: 'Generate B-plots that enrich your main story',
    icon: 'GitBranch',
    shortcut: null,
    color: 'amber',
    requiresSelection: false,
    outputType: 'suggestions',
    placeholders: {
      input: 'Your main plot summary:\n- What is the central conflict?\n- Who are the main characters?\n- What themes are you exploring?',
      output: 'Subplot suggestions will appear here...'
    }
  },
  {
    id: 'scene-ideas',
    category: 'brainstorm',
    name: 'Scene Ideas',
    description: 'Generate scene concepts to fill gaps or add depth',
    icon: 'Layout',
    shortcut: null,
    color: 'amber',
    requiresSelection: false,
    outputType: 'suggestions',
    placeholders: {
      input: 'What do you need scenes for?\n- Character development\n- Plot advancement\n- Relationship building\n- Tension and conflict\n- World exploration',
      output: 'Scene ideas will appear here...'
    }
  }
];

// Tool categories configuration
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
    bgColor: 'bg-violet-50'
  },
  {
    id: 'enhance',
    name: 'Enhance',
    description: 'Improve existing text',
    icon: 'Wand2',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'analyze',
    name: 'Analyze',
    description: 'Get insights on your writing',
    icon: 'BarChart3',
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50'
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    description: 'Explore ideas and possibilities',
    icon: 'Lightbulb',
    gradient: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50'
  }
];

// Genre configurations
export const GENRES: {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}[] = [
  { id: 'romance', name: 'Romance', icon: 'Heart', color: 'pink', description: 'Love stories and emotional journeys' },
  { id: 'mystery', name: 'Mystery', icon: 'Search', color: 'slate', description: 'Whodunits and detective fiction' },
  { id: 'thriller', name: 'Thriller', icon: 'Zap', color: 'red', description: 'High-stakes suspense and danger' },
  { id: 'fantasy', name: 'Fantasy', icon: 'Wand2', color: 'purple', description: 'Magic, mythical worlds, and epic quests' },
  { id: 'scifi', name: 'Sci-Fi', icon: 'Rocket', color: 'cyan', description: 'Futuristic and speculative fiction' },
  { id: 'literary', name: 'Literary', icon: 'BookOpen', color: 'stone', description: 'Character-driven, thematic depth' },
  { id: 'horror', name: 'Horror', icon: 'Ghost', color: 'zinc', description: 'Fear, dread, and the supernatural' },
  { id: 'ya', name: 'Young Adult', icon: 'Users', color: 'violet', description: 'Coming-of-age stories' },
  { id: 'historical', name: 'Historical', icon: 'Clock', color: 'amber', description: 'Stories set in the past' },
  { id: 'contemporary', name: 'Contemporary', icon: 'Building', color: 'blue', description: 'Modern-day realistic fiction' }
];

// Get tools by category
export function getToolsByCategory(category: ToolCategory): AITool[] {
  return AI_TOOLS.filter(tool => tool.category === category);
}

// Get tool by ID
export function getToolById(id: ToolId): AITool | undefined {
  return AI_TOOLS.find(tool => tool.id === id);
}

// Get tool color class
export function getToolColorClass(tool: AITool): string {
  const colorMap: Record<string, string> = {
    violet: 'bg-violet-100 text-violet-700 border-violet-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200'
  };
  return colorMap[tool.color] || colorMap.violet;
}

// Get tool icon background
export function getToolIconBg(tool: AITool): string {
  const colorMap: Record<string, string> = {
    violet: 'bg-gradient-to-br from-violet-500 to-purple-600',
    blue: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    emerald: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    amber: 'bg-gradient-to-br from-amber-500 to-orange-500'
  };
  return colorMap[tool.color] || colorMap.violet;
}
