'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AITool, AUTHOR_STYLE_CONFIG } from '@/components/ai-studio/tool-definitions';

interface ToolTrayProps {
  tools: AITool[];
  activeTool: AITool | null;
  onSelectTool: (tool: AITool) => void;
  selection: { start: number; end: number; text: string } | null;
}

export function ToolTray({ tools, activeTool, onSelectTool, selection }: ToolTrayProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
      {/* Generate label */}
      <span className="flex-shrink-0 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider mr-2">
        Generate
      </span>
      
      {tools.map((tool) => {
        const isActive = activeTool?.id === tool.id;
        const needsSelection = tool.requiresSelection && !selection?.text;
        const Icon = tool.icon;
        const authorInspiration = tool.inspiredBy?.[0];
        const authorStyle = authorInspiration ? AUTHOR_STYLE_CONFIG[authorInspiration] : null;
        
        return (
          <motion.button
            key={tool.id}
            onClick={() => onSelectTool(tool)}
            disabled={needsSelection}
            whileHover={{ scale: needsSelection ? 1 : 1.02 }}
            whileTap={{ scale: needsSelection ? 1 : 0.98 }}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium',
              'border border-transparent',
              isActive && 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300',
              !isActive && !needsSelection && 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300',
              needsSelection && 'opacity-50 cursor-not-allowed text-stone-400'
            )}
            title={needsSelection ? `Select text to use ${tool.name}` : tool.description}
          >
            {/* Tool Icon */}
            <span className={cn(
              'flex items-center justify-center w-7 h-7 rounded-md',
              isActive ? 'bg-teal-100 dark:bg-teal-800' : 'bg-stone-100 dark:bg-stone-700'
            )}>
              <Icon className={cn(
                'h-4 w-4',
                isActive ? 'text-teal-600 dark:text-teal-400' : 'text-stone-500 dark:text-stone-400'
              )} />
            </span>
            
            {/* Tool Name */}
            <span className="whitespace-nowrap">{tool.name}</span>
            
            {/* Keyboard shortcut if exists */}
            {tool.shortcut && (
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 rounded">
                {tool.shortcut}
              </kbd>
            )}
            
            {/* Author badge */}
            {authorStyle && (
              <span className={cn(
                'hidden lg:inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded',
                authorStyle.bgClass,
                authorStyle.textClass
              )}>
                {authorInspiration && authorInspiration.charAt(0).toUpperCase() + authorInspiration.slice(1)}
              </span>
            )}
          </motion.button>
        );
      })}
      
      {/* Divider */}
      <div className="w-px h-8 bg-stone-200 dark:bg-stone-700 mx-2 flex-shrink-0" />
      
      {/* Quick tip */}
      <span className="flex-shrink-0 text-xs text-stone-400 dark:text-stone-500 hidden lg:block">
        Press <kbd className="px-1 py-0.5 bg-stone-100 dark:bg-stone-800 rounded text-[10px] font-mono">⌘J</kbd> to continue writing
      </span>
    </div>
  );
}
