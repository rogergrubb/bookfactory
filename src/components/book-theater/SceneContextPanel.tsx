'use client';

import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, Eye, EyeOff, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SceneContext, SensoryPalette, Mood } from './types';

interface SceneContextPanelProps {
  contexts: SceneContext[];
  activeContext: SceneContext | null;
  onSelect: (context: SceneContext | null) => void;
  onCreate: (context: Omit<SceneContext, 'id'>) => void;
  onUpdate: (context: SceneContext) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const MOOD_OPTIONS = [
  'Tense', 'Romantic', 'Mysterious', 'Cheerful', 'Melancholic', 
  'Suspenseful', 'Peaceful', 'Chaotic', 'Eerie', 'Hopeful',
  'Dreadful', 'Nostalgic', 'Triumphant', 'Desperate', 'Whimsical'
];

const ICON_OPTIONS = ['🏠', '🏰', '🌲', '🏖️', '🌃', '⛰️', '🚗', '✈️', '🏚️', '🏛️', '🌅', '🌙', '⛈️', '🔥', '❄️'];

export function SceneContextPanel({
  contexts,
  activeContext,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  onClose,
}: SceneContextPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<SceneContext, 'id'>>({
    name: '',
    icon: '🏠',
    sensory: { sight: '', sound: '', smell: '', touch: '', taste: '' },
    mood: { primary: 'Tense', secondary: '' },
    props: [],
    aiNotes: '',
  });

  const [propsInput, setPropsInput] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '🏠',
      sensory: { sight: '', sound: '', smell: '', touch: '', taste: '' },
      mood: { primary: 'Tense', secondary: '' },
      props: [],
      aiNotes: '',
    });
    setPropsInput('');
  };

  const handleStartCreate = () => {
    resetForm();
    setIsCreating(true);
    setEditingId(null);
  };

  const handleStartEdit = (context: SceneContext) => {
    setFormData({
      name: context.name,
      icon: context.icon,
      sensory: { ...context.sensory },
      mood: { ...context.mood },
      props: [...context.props],
      aiNotes: context.aiNotes || '',
    });
    setPropsInput(context.props.join(', '));
    setEditingId(context.id);
    setIsCreating(false);
  };

  const handleSave = () => {
    const props = propsInput.split(',').map(p => p.trim()).filter(Boolean);
    const contextData = { ...formData, props };

    if (isCreating) {
      onCreate(contextData);
    } else if (editingId) {
      onUpdate({ ...contextData, id: editingId });
    }

    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  const isEditing = isCreating || editingId;

  return (
    <div className="w-[400px] h-full flex flex-col bg-stone-900 border-l border-stone-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-rose-400" />
          <h3 className="font-medium text-stone-100">Scene Contexts</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isEditing ? (
          /* Edit/Create Form */
          <div className="space-y-4">
            {/* Name & Icon */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-stone-500 block mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Haunted Manor"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Icon</label>
                <div className="flex flex-wrap gap-1 p-2 bg-stone-800 rounded-lg max-w-[120px]">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setFormData({ ...formData, icon })}
                      className={cn(
                        'w-6 h-6 rounded text-sm',
                        formData.icon === icon ? 'bg-teal-500/30' : 'hover:bg-stone-700'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="text-xs text-stone-500 block mb-1">Mood</label>
              <div className="flex gap-2">
                <select
                  value={formData.mood.primary}
                  onChange={(e) => setFormData({ ...formData, mood: { ...formData.mood, primary: e.target.value } })}
                  className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-teal-500"
                >
                  {MOOD_OPTIONS.map((mood) => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
                <select
                  value={formData.mood.secondary || ''}
                  onChange={(e) => setFormData({ ...formData, mood: { ...formData.mood, secondary: e.target.value } })}
                  className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="">Secondary (optional)</option>
                  {MOOD_OPTIONS.map((mood) => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sensory Details */}
            <div>
              <label className="text-xs text-stone-500 block mb-2">Sensory Palette</label>
              <div className="space-y-2">
                {(['sight', 'sound', 'smell', 'touch', 'taste'] as const).map((sense) => (
                  <div key={sense} className="flex gap-2 items-center">
                    <span className="w-12 text-xs text-stone-500 capitalize">{sense}</span>
                    <input
                      type="text"
                      value={formData.sensory[sense] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        sensory: { ...formData.sensory, [sense]: e.target.value }
                      })}
                      placeholder={
                        sense === 'sight' ? 'Dim candlelight, shadows...' :
                        sense === 'sound' ? 'Creaking floorboards...' :
                        sense === 'smell' ? 'Musty, old books...' :
                        sense === 'touch' ? 'Cold stone walls...' :
                        'Dust on the tongue...'
                      }
                      className="flex-1 bg-stone-800 border border-stone-700 rounded px-2 py-1 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Props */}
            <div>
              <label className="text-xs text-stone-500 block mb-1">Props (comma-separated)</label>
              <input
                type="text"
                value={propsInput}
                onChange={(e) => setPropsInput(e.target.value)}
                placeholder="Dusty chandelier, creaky stairs, locked door..."
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* AI Notes */}
            <div>
              <label className="text-xs text-stone-500 block mb-1">AI Notes</label>
              <textarea
                value={formData.aiNotes}
                onChange={(e) => setFormData({ ...formData, aiNotes: e.target.value })}
                placeholder="Instructions for AI when using this context..."
                rows={3}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-500 resize-none focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 rounded-lg border border-stone-700 text-stone-400 hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
              >
                {isCreating ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        ) : (
          /* Context List */
          <div className="space-y-3">
            {contexts.length === 0 ? (
              <div className="text-center py-8">
                <Palette className="w-12 h-12 text-stone-700 mx-auto mb-3" />
                <p className="text-stone-500 text-sm mb-4">
                  No scene contexts yet. Create one to help AI understand your scenes.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Scene Context
                </button>
              </div>
            ) : (
              <>
                {contexts.map((context) => {
                  const isActive = activeContext?.id === context.id;

                  return (
                    <div
                      key={context.id}
                      className={cn(
                        'p-3 rounded-lg border transition-all cursor-pointer',
                        isActive
                          ? 'border-teal-500/50 bg-teal-500/10'
                          : 'border-stone-800 hover:border-stone-700 bg-stone-800/50'
                      )}
                      onClick={() => onSelect(isActive ? null : context)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{context.icon}</span>
                          <div>
                            <h4 className="font-medium text-stone-200">{context.name}</h4>
                            <p className="text-xs text-stone-500">
                              {context.mood.primary}
                              {context.mood.secondary && ` • ${context.mood.secondary}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isActive && (
                            <span className="text-xs text-teal-400 mr-2">Active</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(context);
                            }}
                            className="p-1 rounded hover:bg-stone-700 text-stone-500 hover:text-stone-300"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(context.id);
                            }}
                            className="p-1 rounded hover:bg-stone-700 text-stone-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Preview */}
                      {context.sensory.sight && (
                        <p className="mt-2 text-xs text-stone-500 line-clamp-1">
                          👁️ {context.sensory.sight}
                        </p>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={handleStartCreate}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-stone-700 rounded-lg text-stone-500 hover:text-stone-300 hover:border-stone-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Scene Context
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
