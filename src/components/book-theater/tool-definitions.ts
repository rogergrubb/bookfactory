// ============================================================================
// TOOL DEFINITIONS - All 44 Tools with Sub-Options
// ============================================================================

import {
  Play, MessageSquare, Palette, Swords, Brain, Zap,
  Maximize2, Minimize2, PenTool, Sparkles, Dumbbell, Waves, MessageCircle, Eye,
  BarChart3, Mic, TrendingUp, Users, RefreshCw, Search, BookOpen, Gauge, Heart,
  Lightbulb, UserPlus, MessagesSquare, ArrowRightLeft, Flame, Shuffle, HelpCircle,
  Globe, GitBranch, Clock, Layers, BookMarked,
  Drama, Whisper, SwitchCamera, FastForward, FileText,
  Scale, Crosshair, Compass
} from 'lucide-react';
import { Tool, ToolCategory } from './types';

// We need to use a custom Whisper icon since it doesn't exist in lucide
const WhisperIcon = Mic; // Fallback

export const tools: Tool[] = [
  // ============================================================================
  // GENERATE TOOLS (6)
  // ============================================================================
  {
    id: 'continue',
    name: 'Continue Writing',
    shortName: 'Cont',
    icon: Play,
    category: 'generate',
    description: 'Continue the story from where you left off',
  },
  {
    id: 'firstdraft',
    name: 'First Draft',
    shortName: 'Draft',
    icon: Zap,
    category: 'generate',
    description: 'Generate a quick first draft from an outline or idea',
  },
  {
    id: 'dialogue',
    name: 'Write Dialogue',
    shortName: 'Dial',
    icon: MessageSquare,
    category: 'generate',
    description: 'Generate character dialogue for a scene',
    isDynamic: true,
    dynamicSource: 'characters',
    hasSubMenu: true,
  },
  {
    id: 'description',
    name: 'Add Description',
    shortName: 'Desc',
    icon: Palette,
    category: 'generate',
    description: 'Add rich sensory details and descriptions',
    hasSubMenu: true,
    subOptions: [
      { id: 'setting', name: 'Setting/Environment' },
      { id: 'character', name: 'Character Appearance' },
      { id: 'action', name: 'Action/Movement' },
      { id: 'emotion', name: 'Emotional State' },
      { id: 'sensory', name: 'Full Sensory (5 senses)' },
    ],
  },
  {
    id: 'action',
    name: 'Action Scene',
    shortName: 'Actn',
    icon: Swords,
    category: 'generate',
    description: 'Write intense action sequences',
    hasSubMenu: true,
    subOptions: [
      { id: 'fight', name: 'Fight/Combat' },
      { id: 'chase', name: 'Chase Scene' },
      { id: 'escape', name: 'Escape/Pursuit' },
      { id: 'disaster', name: 'Disaster/Catastrophe' },
      { id: 'sports', name: 'Sports/Competition' },
    ],
  },
  {
    id: 'thoughts',
    name: 'Inner Thoughts',
    shortName: 'Mind',
    icon: Brain,
    category: 'generate',
    description: 'Write internal monologue and character thoughts',
    isDynamic: true,
    dynamicSource: 'characters',
    hasSubMenu: true,
  },

  // ============================================================================
  // ENHANCE TOOLS (8)
  // ============================================================================
  {
    id: 'expand',
    name: 'Expand',
    shortName: 'Expd',
    icon: Maximize2,
    category: 'enhance',
    description: 'Expand and add detail to selected text',
    requiresSelection: true,
    hasSubMenu: true,
    subOptions: [
      { id: 'detail', name: 'Add Details' },
      { id: 'emotion', name: 'Deepen Emotion' },
      { id: 'sensory', name: 'Add Sensory' },
      { id: 'backstory', name: 'Add Backstory' },
    ],
  },
  {
    id: 'condense',
    name: 'Condense',
    shortName: 'Cond',
    icon: Minimize2,
    category: 'enhance',
    description: 'Tighten prose and remove unnecessary words',
    requiresSelection: true,
    hasSubMenu: true,
    subOptions: [
      { id: 'light', name: 'Light Trim (10-20%)' },
      { id: 'moderate', name: 'Moderate (30-40%)' },
      { id: 'aggressive', name: 'Aggressive (50%+)' },
    ],
  },
  {
    id: 'rewrite',
    name: 'Rewrite',
    shortName: 'Rwrt',
    icon: PenTool,
    category: 'enhance',
    description: 'Rewrite selected text in a different way',
    requiresSelection: true,
    hasSubMenu: true,
    subOptions: [
      { id: 'dramatic', name: 'More Dramatic', icon: Drama },
      { id: 'subtle', name: 'More Subtle', icon: WhisperIcon },
      { id: 'pov', name: 'Different POV', icon: SwitchCamera },
      { id: 'faster', name: 'Faster Pace', icon: FastForward },
      { id: 'slower', name: 'Slower Pace', icon: Gauge },
      { id: 'custom', name: 'Custom...', icon: FileText },
    ],
  },
  {
    id: 'polish',
    name: 'Polish',
    shortName: 'Plsh',
    icon: Sparkles,
    category: 'enhance',
    description: 'Improve overall writing quality',
    requiresSelection: true,
  },
  {
    id: 'strengthen-verbs',
    name: 'Strengthen Verbs',
    shortName: 'Verb',
    icon: Dumbbell,
    category: 'enhance',
    description: 'Replace weak verbs with stronger alternatives',
    requiresSelection: true,
  },
  {
    id: 'vary-sentences',
    name: 'Vary Sentences',
    shortName: 'Vary',
    icon: Waves,
    category: 'enhance',
    description: 'Improve sentence rhythm and variety',
    requiresSelection: true,
  },
  {
    id: 'fix-dialogue-tags',
    name: 'Fix Dialogue Tags',
    shortName: 'Tags',
    icon: MessageCircle,
    category: 'enhance',
    description: 'Improve dialogue attribution',
    requiresSelection: true,
  },
  {
    id: 'show-dont-tell',
    name: 'Show Don\'t Tell',
    shortName: 'Show',
    icon: Eye,
    category: 'enhance',
    description: 'Convert telling to showing',
    requiresSelection: true,
  },

  // ============================================================================
  // ANALYZE TOOLS (10)
  // ============================================================================
  {
    id: 'pacing',
    name: 'Pacing Analysis',
    shortName: 'Pace',
    icon: BarChart3,
    category: 'analyze',
    description: 'Analyze story pacing and rhythm',
  },
  {
    id: 'voice-check',
    name: 'Voice Check',
    shortName: 'Voic',
    icon: Mic,
    category: 'analyze',
    description: 'Check narrative voice consistency',
  },
  {
    id: 'tension-map',
    name: 'Tension Map',
    shortName: 'Tens',
    icon: TrendingUp,
    category: 'analyze',
    description: 'Map dramatic tension throughout',
  },
  {
    id: 'character-voice',
    name: 'Character Voice',
    shortName: 'ChVc',
    icon: Users,
    category: 'analyze',
    description: 'Analyze specific character\'s voice',
    isDynamic: true,
    dynamicSource: 'characters',
    hasSubMenu: true,
  },
  {
    id: 'repetition',
    name: 'Repetition Finder',
    shortName: 'Rept',
    icon: RefreshCw,
    category: 'analyze',
    description: 'Find repeated words and phrases',
  },
  {
    id: 'adverb-hunter',
    name: 'Adverb Hunter',
    shortName: 'Advb',
    icon: Search,
    category: 'analyze',
    description: 'Identify overused adverbs',
  },
  {
    id: 'passive-voice',
    name: 'Passive Voice',
    shortName: 'Pasv',
    icon: BookOpen,
    category: 'analyze',
    description: 'Find passive voice constructions',
  },
  {
    id: 'readability',
    name: 'Readability',
    shortName: 'Read',
    icon: Gauge,
    category: 'analyze',
    description: 'Analyze reading level and clarity',
  },
  {
    id: 'emotional-arc',
    name: 'Emotional Arc',
    shortName: 'Emot',
    icon: Heart,
    category: 'analyze',
    description: 'Track emotional journey',
  },
  {
    id: 'chapter-summary',
    name: 'Chapter Summary',
    shortName: 'Summ',
    icon: FileText,
    category: 'analyze',
    description: 'Generate chapter summary',
  },

  // ============================================================================
  // BRAINSTORM TOOLS (8)
  // ============================================================================
  {
    id: 'plot-ideas',
    name: 'Plot Ideas',
    shortName: 'Plot',
    icon: Lightbulb,
    category: 'brainstorm',
    description: 'Generate plot ideas and directions',
    hasSubMenu: true,
    subOptions: [
      { id: 'next', name: 'What Happens Next?' },
      { id: 'conflict', name: 'Add Conflict' },
      { id: 'complication', name: 'Complication' },
      { id: 'resolution', name: 'Resolution Ideas' },
    ],
  },
  {
    id: 'character-moments',
    name: 'Character Moments',
    shortName: 'ChMo',
    icon: UserPlus,
    category: 'brainstorm',
    description: 'Generate character development moments',
    isDynamic: true,
    dynamicSource: 'characters',
    hasSubMenu: true,
  },
  {
    id: 'dialogue-options',
    name: 'Dialogue Options',
    shortName: 'DiaO',
    icon: MessagesSquare,
    category: 'brainstorm',
    description: 'Brainstorm dialogue variations',
    isDynamic: true,
    dynamicSource: 'characters',
    hasSubMenu: true,
  },
  {
    id: 'scene-transitions',
    name: 'Scene Transitions',
    shortName: 'Trns',
    icon: ArrowRightLeft,
    category: 'brainstorm',
    description: 'Ideas for transitioning between scenes',
  },
  {
    id: 'conflict-escalation',
    name: 'Conflict Escalation',
    shortName: 'Escl',
    icon: Flame,
    category: 'brainstorm',
    description: 'Ways to escalate conflict',
  },
  {
    id: 'twist-generator',
    name: 'Twist Generator',
    shortName: 'Twst',
    icon: Shuffle,
    category: 'brainstorm',
    description: 'Generate plot twists',
    hasSubMenu: true,
    subOptions: [
      { id: 'betrayal', name: 'Betrayal' },
      { id: 'revelation', name: 'Hidden Truth' },
      { id: 'reversal', name: 'Reversal' },
      { id: 'unexpected', name: 'Unexpected Ally/Enemy' },
      { id: 'surprise', name: 'Surprise Me' },
    ],
  },
  {
    id: 'what-if',
    name: 'What If...',
    shortName: 'WtIf',
    icon: HelpCircle,
    category: 'brainstorm',
    description: 'Explore alternative scenarios',
  },
  {
    id: 'stuck-help',
    name: 'I\'m Stuck',
    shortName: 'Help',
    icon: Compass,
    category: 'brainstorm',
    description: 'Get unstuck with suggestions',
  },

  // ============================================================================
  // WORLD TOOLS (6)
  // ============================================================================
  {
    id: 'characters',
    name: 'Characters',
    shortName: 'Char',
    icon: Users,
    category: 'world',
    description: 'Manage characters',
  },
  {
    id: 'locations',
    name: 'Locations',
    shortName: 'Locs',
    icon: Globe,
    category: 'world',
    description: 'Manage locations and settings',
  },
  {
    id: 'plot-threads',
    name: 'Plot Threads',
    shortName: 'Thrd',
    icon: GitBranch,
    category: 'world',
    description: 'Track plot threads and arcs',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    shortName: 'Time',
    icon: Clock,
    category: 'world',
    description: 'Story timeline and events',
  },
  {
    id: 'scene-contexts',
    name: 'Scene Contexts',
    shortName: 'Scns',
    icon: Layers,
    category: 'world',
    description: 'Manage scene environments',
  },
  {
    id: 'story-bible',
    name: 'Story Bible',
    shortName: 'Bibl',
    icon: BookMarked,
    category: 'world',
    description: 'Full story bible reference',
  },
];

// Group tools by category
export const toolsByCategory: Record<ToolCategory, Tool[]> = {
  generate: tools.filter(t => t.category === 'generate'),
  enhance: tools.filter(t => t.category === 'enhance'),
  analyze: tools.filter(t => t.category === 'analyze'),
  brainstorm: tools.filter(t => t.category === 'brainstorm'),
  world: tools.filter(t => t.category === 'world'),
};

// Category metadata
export const categoryMeta: Record<ToolCategory, { name: string; color: string }> = {
  generate: { name: 'Generate', color: 'emerald' },
  enhance: { name: 'Enhance', color: 'blue' },
  analyze: { name: 'Analyze', color: 'amber' },
  brainstorm: { name: 'Brainstorm', color: 'purple' },
  world: { name: 'World', color: 'rose' },
};

// Get tool by ID
export const getToolById = (id: string): Tool | undefined => {
  return tools.find(t => t.id === id);
};
