'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Shuffle, UserPlus, Globe, Swords, GitBranch, Layout,
  X, Loader2, Plus, Trash2, Star, StarOff, ChevronDown,
  RefreshCw, Download, Share2, Maximize2, Minimize2,
  Sparkles, Copy, Check, BookmarkPlus, Edit3, Save, Lightbulb
} from 'lucide-react';
import { ToolId, StructuredItem } from './types';
import { getToolById } from './tool-definitions';

interface BrainstormPanelProps {
  toolId: ToolId;
  isOpen: boolean;
  onClose: () => void;
  context?: {
    bookTitle?: string;
    currentPlot?: string;
    characters?: string[];
  };
  onSaveIdea?: (idea: StructuredItem) => void;
}

// Idea Card Component
const IdeaCard = ({ 
  idea, 
  index, 
  onToggleStar, 
  onDelete, 
  onEdit,
  onSave,
  isEditing,
  editedContent,
  setEditedContent
}: { 
  idea: StructuredItem; 
  index: number;
  onToggleStar: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSave: () => void;
  isEditing: boolean;
  editedContent: { title: string; description: string };
  setEditedContent: (content: { title: string; description: string }) => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${idea.title}\n\n${idea.description}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
        idea.selected 
          ? 'bg-amber-50 border-amber-200 shadow-md shadow-amber-100' 
          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
      }`}
    >
      {/* Star indicator */}
      {idea.selected && (
        <div className="absolute -top-2 -right-2 p-1.5 bg-amber-400 rounded-full shadow-lg">
          <Star className="w-3 h-3 text-white fill-white" />
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editedContent.title}
            onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
            className="w-full text-sm font-semibold text-gray-800 bg-transparent border-b border-gray-200 focus:border-violet-500 focus:outline-none pb-1"
          />
          <textarea
            value={editedContent.description}
            onChange={(e) => setEditedContent({ ...editedContent, description: e.target.value })}
            rows={3}
            className="w-full text-sm text-gray-600 bg-transparent border border-gray-200 rounded-lg p-2 focus:border-violet-500 focus:outline-none resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={onEdit}
              className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-3 py-1 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-gray-800 text-sm leading-tight">{idea.title}</h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onToggleStar}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title={idea.selected ? "Unstar" : "Star"}
              >
                {idea.selected ? (
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                ) : (
                  <StarOff className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
              <button
                onClick={onEdit}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Edit"
              >
                <Edit3 className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
              <button
                onClick={onDelete}
                className="p-1 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{idea.description}</p>
          
          {/* Tags/Details */}
          {idea.details && Object.keys(idea.details).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
              {Object.entries(idea.details).map(([key, value]) => (
                <span
                  key={key}
                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

// Mock idea generators for each tool
const generateMockIdeas = (toolId: ToolId, context?: any): StructuredItem[] => {
  const mockIdeas: Record<string, StructuredItem[]> = {
    'plot-twists': [
      {
        id: '1',
        title: 'The Mentor is the Villain',
        description: 'The wise mentor figure who has been guiding the protagonist is revealed to be orchestrating all the challenges. Their "guidance" was actually manipulation to make the hero stronger for their own purposes.',
        details: { impact: 'High', setup: 'Chapter 3' }
      },
      {
        id: '2',
        title: 'The Dead Character Returns',
        description: 'A character presumed dead in act one returns, but their experiences during their "death" have fundamentally changed their allegiances and motivations.',
        details: { impact: 'Medium', setup: 'Chapter 5' }
      },
      {
        id: '3',
        title: 'The Goal Was a Trap',
        description: 'The object/person/place the protagonist has been seeking was bait. Reaching it triggers the true conflict and reveals the real antagonist.',
        details: { impact: 'High', setup: 'Chapter 7' }
      },
      {
        id: '4',
        title: 'Identity Switch',
        description: 'Two characters have been unknowingly switched (either literally or metaphorically). The hero discovers they\'ve been fighting alongside the wrong person.',
        details: { impact: 'Medium', setup: 'Chapter 4' }
      }
    ],
    'character-ideas': [
      {
        id: '1',
        title: 'The Reluctant Prophet',
        description: 'A cynical journalist who begins receiving accurate visions of the future but refuses to believe in anything supernatural. Must reconcile their skepticism with undeniable evidence.',
        details: { role: 'Protagonist', archetype: 'Skeptic' }
      },
      {
        id: '2',
        title: 'The Ethical Hacker',
        description: 'A reformed cybercriminal who now works for a nonprofit, haunted by the damage their past exploits caused. Brilliant but socially awkward, they communicate better through code than conversation.',
        details: { role: 'Supporting', archetype: 'Reformed Criminal' }
      },
      {
        id: '3',
        title: 'The Silent Witness',
        description: 'A mute character who observed a crucial event that everyone has forgotten. They must find ways to communicate what they know despite everyone dismissing them.',
        details: { role: 'Catalyst', archetype: 'Observer' }
      },
      {
        id: '4',
        title: 'The Accidental Immortal',
        description: 'Someone who accidentally gained immortality 200 years ago and has been trying to undo it ever since. They\'ve seen history repeat itself and are deeply weary of human nature.',
        details: { role: 'Mentor', archetype: 'Immortal' }
      }
    ],
    'world-building': [
      {
        id: '1',
        title: 'Emotion-Based Economy',
        description: 'In this world, strong emotions are harvested and traded as currency. The wealthy are emotionally numb, while the poor are forced to feel deeply to survive.',
        details: { type: 'Social System', complexity: 'High' }
      },
      {
        id: '2',
        title: 'Living Architecture',
        description: 'Buildings are grown from genetically modified coral and fungi. They breathe, heal themselves, and sometimes develop primitive consciousness. Architects are more like shepherds.',
        details: { type: 'Technology', complexity: 'Medium' }
      },
      {
        id: '3',
        title: 'The Naming Prohibition',
        description: 'Speaking someone\'s true name gives you power over them. Everyone uses nicknames, titles, or numbers. Learning someone\'s birth name is the ultimate act of trust—or betrayal.',
        details: { type: 'Magic System', complexity: 'Medium' }
      },
      {
        id: '4',
        title: 'Memory Rain',
        description: 'Periodic rainfall carries fragments of random memories from anyone who has ever died in that location. People sometimes become addicted to these borrowed experiences.',
        details: { type: 'Natural Phenomenon', complexity: 'High' }
      }
    ],
    'conflict-generator': [
      {
        id: '1',
        title: 'Impossible Choice',
        description: 'The protagonist must choose between saving their closest ally or preventing a disaster that will harm thousands. Either choice creates lasting consequences.',
        details: { type: 'Moral Dilemma', stakes: 'High' }
      },
      {
        id: '2',
        title: 'The Necessary Betrayal',
        description: 'To achieve their goal, the protagonist must betray someone who trusts them completely. The betrayal must be convincing enough to fool everyone, including allies.',
        details: { type: 'Internal', stakes: 'Medium' }
      },
      {
        id: '3',
        title: 'Inherited Enemy',
        description: 'The protagonist discovers they\'ve inherited a blood feud from their deceased parent. An enemy is coming who believes they are owed a debt of vengeance.',
        details: { type: 'External', stakes: 'High' }
      },
      {
        id: '4',
        title: 'The Ticking Clock',
        description: 'A deadline that cannot be moved. Something irreversible will happen, and every chapter brings them closer to the moment of truth.',
        details: { type: 'Pressure', stakes: 'High' }
      }
    ],
    'subplot-ideas': [
      {
        id: '1',
        title: 'Found Family Formation',
        description: 'A group of misfits gradually becomes a found family through shared adversity. Each member brings something unique; together they\'re stronger than the sum of parts.',
        details: { theme: 'Belonging', parallel: 'Main theme of isolation' }
      },
      {
        id: '2',
        title: 'The Mentor\'s Secret',
        description: 'A subplot revealing the mentor figure has their own unresolved conflict that mirrors the protagonist\'s journey but with different choices made.',
        details: { theme: 'Legacy', parallel: 'Protagonist growth' }
      },
      {
        id: '3',
        title: 'Forbidden Romance',
        description: 'Two characters from opposing factions develop feelings for each other. Their relationship becomes a secret that could destroy both their positions.',
        details: { theme: 'Love vs Duty', parallel: 'Main conflict' }
      },
      {
        id: '4',
        title: 'The Redemption Arc',
        description: 'A secondary antagonist begins questioning their allegiance after witnessing the protagonist\'s humanity. Their defection becomes pivotal in act three.',
        details: { theme: 'Change', parallel: 'Antagonist motivation' }
      }
    ],
    'scene-ideas': [
      {
        id: '1',
        title: 'The Quiet Before the Storm',
        description: 'A peaceful, almost mundane scene where characters share a meal or moment of rest. The normalcy contrasts sharply with the danger ahead, making readers treasure what might be lost.',
        details: { purpose: 'Emotional Beat', placement: 'Before climax' }
      },
      {
        id: '2',
        title: 'The Unwitting Reveal',
        description: 'A casual conversation where one character accidentally reveals crucial information without realizing its significance. The protagonist must hide their reaction.',
        details: { purpose: 'Plot Advancement', placement: 'Mid-story' }
      },
      {
        id: '3',
        title: 'Parallel Histories',
        description: 'Two characters share stories from their past that reveal surprising parallels or connections. This moment of vulnerability deepens their relationship.',
        details: { purpose: 'Character Development', placement: 'Rising Action' }
      },
      {
        id: '4',
        title: 'The False Victory',
        description: 'The characters achieve what they thought was their goal, only to realize it\'s not what they expected. The celebration turns to uncertainty.',
        details: { purpose: 'Plot Twist', placement: 'Mid-point' }
      }
    ]
  };

  return mockIdeas[toolId] || mockIdeas['plot-twists'];
};

export function BrainstormPanel({ toolId, isOpen, onClose, context, onSaveIdea }: BrainstormPanelProps) {
  const tool = getToolById(toolId);
  const [prompt, setPrompt] = useState('');
  const [ideas, setIdeas] = useState<StructuredItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState({ title: '', description: '' });
  const [filter, setFilter] = useState<'all' | 'starred'>('all');

  const handleGenerate = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newIdeas = generateMockIdeas(toolId, context);
      setIdeas(prev => [...newIdeas, ...prev]);
      setIsLoading(false);
    }, 1500);
  };

  const handleToggleStar = (id: string) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, selected: !idea.selected } : idea
    ));
  };

  const handleDelete = (id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
  };

  const handleEdit = (idea: StructuredItem) => {
    if (editingId === idea.id) {
      setEditingId(null);
    } else {
      setEditingId(idea.id);
      setEditedContent({ title: idea.title, description: idea.description });
    }
  };

  const handleSaveEdit = (id: string) => {
    setIdeas(prev => prev.map(idea =>
      idea.id === id ? { ...idea, ...editedContent } : idea
    ));
    setEditingId(null);
  };

  const handleReorder = (newOrder: StructuredItem[]) => {
    setIdeas(newOrder);
  };

  const filteredIdeas = filter === 'starred' 
    ? ideas.filter(idea => idea.selected)
    : ideas;

  const starredCount = ideas.filter(i => i.selected).length;

  if (!tool) return null;

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Shuffle, UserPlus, Globe, Swords, GitBranch, Layout, Lightbulb
  };
  const Icon = iconMap[tool.icon] || Lightbulb;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              isFullscreen 
                ? 'inset-4' 
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] max-w-[95vw] h-[700px] max-h-[90vh]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{tool.name}</h2>
                  <p className="text-sm text-gray-500">{tool.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Context Bar */}
            <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Describe what you need (e.g., "a twist for my heist story" or "a villain with sympathetic motives")...`}
                    className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-sm transition-all ${
                    isLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/25'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Brainstorming...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Ideas
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            {ideas.length > 0 && (
              <div className="px-6 py-2 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      filter === 'all' 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All ({ideas.length})
                  </button>
                  <button
                    onClick={() => setFilter('starred')}
                    className={`px-3 py-1 text-xs rounded-full transition-all flex items-center gap-1 ${
                      filter === 'starred' 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    Starred ({starredCount})
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-3 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    More Ideas
                  </button>
                </div>
              </div>
            )}

            {/* Ideas Grid */}
            <div className="flex-1 overflow-auto p-6">
              {filteredIdeas.length > 0 ? (
                <Reorder.Group
                  axis="y"
                  values={filteredIdeas}
                  onReorder={handleReorder}
                  className="grid grid-cols-2 gap-4"
                >
                  {filteredIdeas.map((idea, idx) => (
                    <Reorder.Item key={idea.id} value={idea}>
                      <IdeaCard
                        idea={idea}
                        index={idx}
                        onToggleStar={() => handleToggleStar(idea.id)}
                        onDelete={() => handleDelete(idea.id)}
                        onEdit={() => handleEdit(idea)}
                        onSave={() => handleSaveEdit(idea.id)}
                        isEditing={editingId === idea.id}
                        editedContent={editedContent}
                        setEditedContent={setEditedContent}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-50 mb-6">
                    <Icon className="w-12 h-12 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Ready to Brainstorm</h3>
                  <p className="text-gray-500 text-sm max-w-md mb-6">
                    Describe what you're looking for, or click "Generate Ideas" to get started with creative suggestions.
                  </p>
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Ideas
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {starredCount > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-amber-50/50">
                <span className="text-sm text-amber-700">
                  {starredCount} idea{starredCount !== 1 ? 's' : ''} starred
                </span>
                <button
                  onClick={() => {
                    const starredIdeas = ideas.filter(i => i.selected);
                    // Export or save starred ideas
                    console.log('Exporting:', starredIdeas);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Save Starred to Story Bible
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BrainstormPanel;
