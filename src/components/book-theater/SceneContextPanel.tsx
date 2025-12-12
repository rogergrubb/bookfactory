'use client';

import React, { useState } from 'react';
import { X, Plus, Sparkles, Loader2, Eye, Ear, Wind, Hand, Utensils, Palette, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SceneContext } from './types';

interface SceneContextPanelProps {
  contexts: SceneContext[];
  activeContext: SceneContext | null;
  onSelect: (context: SceneContext | null) => void;
  onCreate: (context: Omit<SceneContext, 'id'>) => void;
  onUpdate: (context: SceneContext) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const ICONS = ['🏚️', '🚀', '🌊', '🔥', '🌲', '🏰', '🌆', '⛰️', '🏜️', '❄️', '🌙', '☀️', '⚡', '🎭', '💀', '🎪'];

export function SceneContextPanel({
  contexts,
  activeContext,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  onClose,
}: SceneContextPanelProps) {
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingContext, setEditingContext] = useState<SceneContext | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [form, setForm] = useState<Omit<SceneContext, 'id'>>({
    name: '',
    icon: '🏚️',
    sensory: { sight: '', sound: '', smell: '', touch: '', taste: '' },
    mood: { primary: '', secondary: '' },
    props: [],
    aiNotes: '',
  });
  const [newProp, setNewProp] = useState('');

  const resetForm = () => {
    setForm({
      name: '',
      icon: '🏚️',
      sensory: { sight: '', sound: '', smell: '', touch: '', taste: '' },
      mood: { primary: '', secondary: '' },
      props: [],
      aiNotes: '',
    });
    setNewProp('');
  };

  const startCreate = () => {
    resetForm();
    setMode('create');
  };

  const startEdit = (context: SceneContext) => {
    setEditingContext(context);
    setForm({
      name: context.name,
      icon: context.icon,
      sensory: { ...context.sensory },
      mood: { ...context.mood },
      props: [...context.props],
      aiNotes: context.aiNotes,
    });
    setMode('edit');
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    if (mode === 'create') {
      onCreate(form);
    } else if (mode === 'edit' && editingContext) {
      onUpdate({ ...editingContext, ...form });
    }

    setMode('list');
    resetForm();
    setEditingContext(null);
  };

  const handleDelete = () => {
    if (editingContext && confirm(`Delete "${editingContext.name}"?`)) {
      onDelete(editingContext.id);
      setMode('list');
      setEditingContext(null);
    }
  };

  const addProp = () => {
    if (newProp.trim()) {
      setForm(prev => ({ ...prev, props: [...prev.props, newProp.trim()] }));
      setNewProp('');
    }
  };

  const removeProp = (index: number) => {
    setForm(prev => ({ ...prev, props: prev.props.filter((_, i) => i !== index) }));
  };

  const generateFromDescription = async () => {
    if (!form.name.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-scene-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: form.name }),
      });
      
      if (!response.ok) throw new Error('Generation failed');
      
      const data = await response.json();
      setForm(prev => ({
        ...prev,
        sensory: data.sensory || prev.sensory,
        mood: data.mood || prev.mood,
        props: data.props || prev.props,
        aiNotes: data.aiNotes || prev.aiNotes,
      }));
    } catch (err) {
      console.error('Failed to generate:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // ============================================================================
  // RENDER: LIST VIEW
  // ============================================================================
  if (mode === 'list') {
    return (
      <div className="w-[380px] h-full flex flex-col bg-stone-900 border-l border-stone-800">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
          <h3 className="font-medium text-stone-100">Scene Contexts</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* No context option */}
          <button
            onClick={() => onSelect(null)}
            className={cn(
              'w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-stone-800',
              !activeContext && 'bg-stone-800/50'
            )}
          >
            <span className="text-2xl">📝</span>
            <div>
              <div className="font-medium text-stone-200">No Scene Context</div>
              <div className="text-sm text-stone-500">Write without environment presets</div>
            </div>
          </button>

          <div className="border-t border-stone-800" />

          {/* Context list */}
          {contexts.map(ctx => (
            <div
              key={ctx.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 hover:bg-stone-800 group',
                activeContext?.id === ctx.id && 'bg-teal-500/10'
              )}
            >
              <button
                onClick={() => onSelect(ctx)}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <span className="text-2xl">{ctx.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-200">{ctx.name}</div>
                  <div className="text-sm text-stone-500 truncate">
                    {ctx.mood.primary} • {ctx.mood.secondary}
                  </div>
                </div>
                {activeContext?.id === ctx.id && (
                  <span className="text-teal-400">●</span>
                )}
              </button>
              <button
                onClick={() => startEdit(ctx)}
                className="p-1.5 rounded hover:bg-stone-700 text-stone-500 opacity-0 group-hover:opacity-100"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>
          ))}

          {contexts.length === 0 && (
            <div className="px-4 py-8 text-center text-stone-500">
              <p className="mb-2">No scene contexts yet</p>
              <p className="text-sm">Create one to add atmosphere to your AI-generated content</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-stone-800">
          <button
            onClick={startCreate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Scene Context
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: CREATE/EDIT VIEW
  // ============================================================================
  return (
    <div className="w-[380px] h-full flex flex-col bg-stone-900 border-l border-stone-800">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
        <h3 className="font-medium text-stone-100">
          {mode === 'create' ? 'New Scene Context' : 'Edit Scene Context'}
        </h3>
        <button
          onClick={() => setMode('list')}
          className="p-1.5 rounded hover:bg-stone-800 text-stone-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Icon & Name */}
        <div className="flex gap-3">
          <div className="relative">
            <button className="w-12 h-12 text-2xl bg-stone-800 rounded-lg hover:bg-stone-700 flex items-center justify-center">
              {form.icon}
            </button>
            <div className="absolute top-full left-0 mt-1 p-2 bg-stone-800 rounded-lg border border-stone-700 hidden group-focus-within:grid grid-cols-8 gap-1 z-10">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setForm(prev => ({ ...prev, icon }))}
                  className="w-8 h-8 text-lg hover:bg-stone-700 rounded"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Scene name (e.g., Haunted House)"
            className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* AI Generate Button */}
        <button
          onClick={generateFromDescription}
          disabled={!form.name.trim() || isGenerating}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate from name
        </button>

        {/* Sensory Palette */}
        <div>
          <h4 className="text-sm font-medium text-stone-300 mb-2">Sensory Palette</h4>
          <div className="space-y-2">
            {[
              { key: 'sight', icon: Eye, label: 'Sight', placeholder: 'Blue emergency lights, murky depths...' },
              { key: 'sound', icon: Ear, label: 'Sound', placeholder: 'Sonar pings, hydraulic hiss...' },
              { key: 'smell', icon: Wind, label: 'Smell', placeholder: 'Recycled air, oil, sweat...' },
              { key: 'touch', icon: Hand, label: 'Touch', placeholder: 'Vibrating deck, cold metal...' },
              { key: 'taste', icon: Utensils, label: 'Taste', placeholder: 'Metallic fear, stale oxygen...' },
            ].map(({ key, icon: Icon, label, placeholder }) => (
              <div key={key} className="flex items-start gap-2">
                <Icon className="w-4 h-4 text-stone-500 mt-2.5" />
                <input
                  type="text"
                  value={form.sensory[key as keyof typeof form.sensory]}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    sensory: { ...prev.sensory, [key]: e.target.value }
                  }))}
                  placeholder={placeholder}
                  className="flex-1 bg-stone-800 border border-stone-700 rounded px-2 py-1.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div>
          <h4 className="text-sm font-medium text-stone-300 mb-2">Mood</h4>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={form.mood.primary}
              onChange={(e) => setForm(prev => ({
                ...prev,
                mood: { ...prev.mood, primary: e.target.value }
              }))}
              placeholder="Primary mood..."
              className="bg-stone-800 border border-stone-700 rounded px-2 py-1.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-600"
            />
            <input
              type="text"
              value={form.mood.secondary}
              onChange={(e) => setForm(prev => ({
                ...prev,
                mood: { ...prev.mood, secondary: e.target.value }
              }))}
              placeholder="Secondary mood..."
              className="bg-stone-800 border border-stone-700 rounded px-2 py-1.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-600"
            />
          </div>
        </div>

        {/* Props */}
        <div>
          <h4 className="text-sm font-medium text-stone-300 mb-2">Common Props</h4>
          <div className="flex flex-wrap gap-1 mb-2">
            {form.props.map((prop, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-800 rounded text-sm text-stone-300"
              >
                {prop}
                <button onClick={() => removeProp(i)} className="text-stone-500 hover:text-stone-300">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newProp}
              onChange={(e) => setNewProp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addProp()}
              placeholder="Add prop..."
              className="flex-1 bg-stone-800 border border-stone-700 rounded px-2 py-1.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-600"
            />
            <button
              onClick={addProp}
              className="px-2 py-1.5 bg-stone-700 hover:bg-stone-600 rounded text-sm text-stone-300"
            >
              Add
            </button>
          </div>
        </div>

        {/* AI Notes */}
        <div>
          <h4 className="text-sm font-medium text-stone-300 mb-2">AI Writing Notes</h4>
          <textarea
            value={form.aiNotes}
            onChange={(e) => setForm(prev => ({ ...prev, aiNotes: e.target.value }))}
            placeholder="Notes for AI (e.g., 'Characters speak in clipped, urgent sentences')"
            rows={3}
            className="w-full bg-stone-800 border border-stone-700 rounded px-2 py-1.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-600 resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-stone-800 flex gap-2">
        {mode === 'edit' && (
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => setMode('list')}
          className="flex-1 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!form.name.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  );
}
