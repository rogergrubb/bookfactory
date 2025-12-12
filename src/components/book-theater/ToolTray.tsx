'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, SubOption, ToolCategory, SceneContext } from './types';
import { toolsByCategory, categoryMeta } from './tool-definitions';

interface ToolTrayProps {
  onSelectTool: (tool: Tool, subOption?: SubOption) => void;
  activeTool: Tool | null;
  hasSelection: boolean;
  characters?: { id: string; name: string }[];
  sceneContexts?: SceneContext[];
  activeSceneContext?: SceneContext | null;
  onSceneContextChange?: (context: SceneContext | null) => void;
}

type ViewState = 
  | { type: 'main' }
  | { type: 'submenu'; tool: Tool }
  | { type: 'scene-contexts' };

export function ToolTray({
  onSelectTool,
  activeTool,
  hasSelection,
  characters = [],
  sceneContexts = [],
  activeSceneContext,
  onSceneContextChange,
}: ToolTrayProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<ToolCategory>>(new Set());
  const [viewState, setViewState] = useState<ViewState>({ type: 'main' });

  const toggleCategory = (category: ToolCategory) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleToolClick = (tool: Tool) => {
    // Check if tool requires selection but none exists
    if (tool.requiresSelection && !hasSelection) {
      // TODO: Flash editor to indicate selection needed
      return;
    }

    // If tool has submenu, show it
    if (tool.hasSubMenu || tool.isDynamic) {
      setViewState({ type: 'submenu', tool });
      return;
    }

    // Otherwise, directly select the tool
    onSelectTool(tool);
  };

  const handleSubOptionClick = (tool: Tool, subOption: SubOption) => {
    onSelectTool(tool, subOption);
    setViewState({ type: 'main' });
  };

  const goBack = () => {
    setViewState({ type: 'main' });
  };

  // Get dynamic sub-options for tools that pull from book data
  const getDynamicSubOptions = (tool: Tool): SubOption[] => {
    if (tool.dynamicSource === 'characters') {
      const charOptions = characters.map(c => ({
        id: c.id,
        name: c.name,
      }));
      // Add special options for character-based tools
      if (tool.id === 'dialogue' || tool.id === 'dialogue-options') {
        charOptions.push({ id: 'two-characters', name: '↔ Two Characters...' });
      }
      if (tool.id === 'character-voice') {
        charOptions.push({ id: 'compare', name: '⚖️ Compare Two...' });
      }
      return charOptions;
    }
    return tool.subOptions || [];
  };

  // ============================================================================
  // RENDER: SUBMENU VIEW
  // ============================================================================
  if (viewState.type === 'submenu') {
    const { tool } = viewState;
    const subOptions = tool.isDynamic ? getDynamicSubOptions(tool) : (tool.subOptions || []);
    const meta = categoryMeta[tool.category];

    return (
      <div className="h-full flex flex-col bg-stone-900 border-r border-stone-800">
        {/* Header with back button */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-3 py-2 text-left hover:bg-stone-800 border-b border-stone-800"
        >
          <ChevronLeft className="w-4 h-4 text-stone-400" />
          <tool.icon className={cn('w-4 h-4', `text-${meta.color}-400`)} />
          <span className="text-sm font-medium text-stone-200 truncate">{tool.name}</span>
        </button>

        {/* Sub-options list */}
        <div className="flex-1 overflow-y-auto py-2">
          {subOptions.length === 0 ? (
            <div className="px-3 py-4 text-center text-stone-500 text-sm">
              {tool.dynamicSource === 'characters' ? (
                <>No characters yet. Add them in the World panel.</>
              ) : (
                <>No options available</>
              )}
            </div>
          ) : (
            subOptions.map(option => (
              <button
                key={option.id}
                onClick={() => handleSubOptionClick(tool, option)}
                className="w-full px-3 py-2 text-left hover:bg-stone-800 flex items-center gap-2 group"
              >
                {option.icon && <option.icon className="w-4 h-4 text-stone-500 group-hover:text-stone-300" />}
                <span className="text-sm text-stone-300 group-hover:text-stone-100">
                  {option.name}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Custom option for certain tools */}
        {(tool.id === 'rewrite' || tool.id === 'expand') && (
          <div className="border-t border-stone-800 p-2">
            <button
              onClick={() => handleSubOptionClick(tool, { id: 'custom', name: 'Custom...' })}
              className="w-full px-3 py-2 text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded text-left"
            >
              ✍️ Custom instruction...
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // RENDER: SCENE CONTEXTS VIEW
  // ============================================================================
  if (viewState.type === 'scene-contexts') {
    return (
      <div className="h-full flex flex-col bg-stone-900 border-r border-stone-800">
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-3 py-2 text-left hover:bg-stone-800 border-b border-stone-800"
        >
          <ChevronLeft className="w-4 h-4 text-stone-400" />
          <span className="text-sm font-medium text-stone-200">Scene Contexts</span>
        </button>

        <div className="flex-1 overflow-y-auto py-2">
          {/* No context option */}
          <button
            onClick={() => {
              onSceneContextChange?.(null);
              setViewState({ type: 'main' });
            }}
            className={cn(
              'w-full px-3 py-2 text-left flex items-center gap-2',
              !activeSceneContext ? 'bg-stone-800 text-stone-100' : 'hover:bg-stone-800 text-stone-400'
            )}
          >
            <span className="text-lg">📝</span>
            <span className="text-sm">No Scene Context</span>
          </button>

          {sceneContexts.map(ctx => (
            <button
              key={ctx.id}
              onClick={() => {
                onSceneContextChange?.(ctx);
                setViewState({ type: 'main' });
              }}
              className={cn(
                'w-full px-3 py-2 text-left flex items-center gap-2',
                activeSceneContext?.id === ctx.id 
                  ? 'bg-stone-800 text-stone-100' 
                  : 'hover:bg-stone-800 text-stone-300'
              )}
            >
              <span className="text-lg">{ctx.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{ctx.name}</div>
                <div className="text-xs text-stone-500 truncate">{ctx.mood.primary}</div>
              </div>
              {activeSceneContext?.id === ctx.id && (
                <span className="text-emerald-400">●</span>
              )}
            </button>
          ))}
        </div>

        <div className="border-t border-stone-800 p-2">
          <button
            className="w-full px-3 py-2 text-sm text-teal-400 hover:text-teal-300 hover:bg-stone-800 rounded text-left"
          >
            + Create New Context
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN TOOL TRAY
  // ============================================================================
  return (
    <div className="h-full flex flex-col bg-stone-900 border-r border-stone-800 w-[140px]">
      {/* Scene Context Quick Access */}
      {sceneContexts.length > 0 && (
        <button
          onClick={() => setViewState({ type: 'scene-contexts' })}
          className="flex items-center gap-2 px-3 py-2 border-b border-stone-800 hover:bg-stone-800"
        >
          <span className="text-lg">{activeSceneContext?.icon || '📝'}</span>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs text-stone-500">Scene</div>
            <div className="text-sm text-stone-300 truncate">
              {activeSceneContext?.name || 'None'}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-500" />
        </button>
      )}

      {/* Tool Categories */}
      <div className="flex-1 overflow-y-auto">
        {(Object.keys(toolsByCategory) as ToolCategory[]).map(category => {
          const meta = categoryMeta[category];
          const categoryTools = toolsByCategory[category];
          const isCollapsed = collapsedCategories.has(category);

          return (
            <div key={category} className="border-b border-stone-800/50">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-stone-800/50"
              >
                <span className={cn(
                  'text-xs font-semibold uppercase tracking-wider',
                  `text-${meta.color}-400/70`
                )}>
                  {meta.name}
                </span>
                <ChevronDown 
                  className={cn(
                    'w-3 h-3 text-stone-500 transition-transform',
                    isCollapsed && '-rotate-90'
                  )} 
                />
              </button>

              {/* Tools Grid */}
              {!isCollapsed && (
                <div className="grid grid-cols-2 gap-0.5 px-1 pb-1">
                  {categoryTools.map(tool => {
                    const isActive = activeTool?.id === tool.id;
                    const isDisabled = tool.requiresSelection && !hasSelection;
                    const hasSubmenu = tool.hasSubMenu || tool.isDynamic;

                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleToolClick(tool)}
                        disabled={isDisabled}
                        title={`${tool.name}${isDisabled ? ' (select text first)' : ''}`}
                        className={cn(
                          'flex flex-col items-center justify-center py-1.5 px-1 rounded transition-all',
                          'group relative',
                          isActive 
                            ? `bg-${meta.color}-500/20 ring-1 ring-${meta.color}-500/50` 
                            : 'hover:bg-stone-800',
                          isDisabled && 'opacity-40 cursor-not-allowed'
                        )}
                      >
                        <tool.icon className={cn(
                          'w-4 h-4 mb-0.5',
                          isActive ? `text-${meta.color}-400` : 'text-stone-400 group-hover:text-stone-200'
                        )} />
                        <span className={cn(
                          'text-[10px] leading-tight',
                          isActive ? `text-${meta.color}-300` : 'text-stone-500 group-hover:text-stone-300'
                        )}>
                          {tool.shortName}
                        </span>
                        {hasSubmenu && (
                          <ChevronRight className="w-2 h-2 absolute right-0.5 top-0.5 text-stone-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
