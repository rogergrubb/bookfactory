'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, SubOption, SceneContext, ToolCategory } from './types';
import { tools, categoryMeta, getToolsByCategory } from './tool-definitions';

interface ToolTrayProps {
  onSelectTool: (tool: Tool, subOption?: SubOption) => void;
  activeTool: Tool | null;
  hasSelection: boolean;
  characters?: { id: string; name: string }[];
  sceneContexts: SceneContext[];
  activeSceneContext: SceneContext | null;
  onSceneContextChange: (context: SceneContext | null) => void;
}

export function ToolTray({
  onSelectTool,
  activeTool,
  hasSelection,
  characters = [],
  sceneContexts,
  activeSceneContext,
  onSceneContextChange,
}: ToolTrayProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<ToolCategory>>(
    new Set(['generate'])
  );
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const toggleCategory = (category: ToolCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categories: ToolCategory[] = ['generate', 'enhance', 'analyze', 'brainstorm', 'world'];

  const colorClasses: Record<string, { bg: string; text: string; border: string; hover: string }> = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', hover: 'hover:bg-emerald-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', hover: 'hover:bg-blue-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', hover: 'hover:bg-amber-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', hover: 'hover:bg-purple-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', hover: 'hover:bg-rose-500/20' },
  };

  // Build dynamic sub-options for character-based tools
  const getSubOptionsForTool = (tool: Tool): SubOption[] => {
    if (tool.isDynamic && tool.dynamicSource === 'characters' && characters.length > 0) {
      return characters.map(c => ({ id: c.id, name: c.name }));
    }
    return tool.subOptions || [];
  };

  return (
    <div className="w-56 h-full flex flex-col bg-stone-900 border-r border-stone-800">
      {/* Header */}
      <div className="px-3 py-2 border-b border-stone-800">
        <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500">
          Tools
        </h3>
      </div>

      {/* Tool Categories */}
      <div className="flex-1 overflow-y-auto py-2">
        {categories.map((category) => {
          const meta = categoryMeta[category];
          const isExpanded = expandedCategories.has(category);
          const categoryTools = getToolsByCategory(category);
          const colors = colorClasses[meta.color];

          return (
            <div key={category} className="mb-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
                  colors.hover,
                  isExpanded ? colors.bg : ''
                )}
              >
                <span className={cn('font-medium', colors.text)}>
                  {meta.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">{categoryTools.length}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  )}
                </div>
              </button>

              {/* Tools */}
              {isExpanded && (
                <div className="py-1">
                  {categoryTools.map((tool) => {
                    const isActive = activeTool?.id === tool.id;
                    const isHovered = hoveredTool === tool.id;
                    const subOptions = getSubOptionsForTool(tool);
                    const hasSubmenu = subOptions.length > 0;

                    return (
                      <div
                        key={tool.id}
                        className="relative"
                        onMouseEnter={() => setHoveredTool(tool.id)}
                        onMouseLeave={() => setHoveredTool(null)}
                      >
                        <button
                          onClick={() => {
                            if (!hasSubmenu) {
                              onSelectTool(tool);
                            }
                          }}
                          disabled={tool.requiresSelection && !hasSelection}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-all',
                            'text-stone-400 hover:text-stone-200',
                            isActive && `${colors.bg} ${colors.text}`,
                            tool.requiresSelection && !hasSelection && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <tool.icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1 text-left truncate">{tool.name}</span>
                          {hasSubmenu && (
                            <ChevronRight className="w-3 h-3 text-stone-500" />
                          )}
                        </button>

                        {/* Submenu */}
                        {hasSubmenu && isHovered && (
                          <div className="absolute left-full top-0 ml-1 w-48 bg-stone-800 border border-stone-700 rounded-lg shadow-xl z-50 py-1">
                            {subOptions.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => onSelectTool(tool, sub)}
                                className="w-full px-3 py-1.5 text-sm text-left text-stone-300 hover:bg-stone-700 hover:text-stone-100"
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Scene Context */}
      {activeSceneContext && (
        <div className="border-t border-stone-800 px-3 py-2">
          <button
            onClick={() => onSceneContextChange(null)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"
            title="Click to clear scene context"
          >
            <span className="text-lg">{activeSceneContext.icon}</span>
            <div className="flex-1 text-left">
              <p className="text-xs text-stone-300">{activeSceneContext.name}</p>
              <p className="text-[10px] text-stone-500">{activeSceneContext.mood?.primary}</p>
            </div>
            <Layers className="w-4 h-4 text-stone-500" />
          </button>
        </div>
      )}
    </div>
  );
}
