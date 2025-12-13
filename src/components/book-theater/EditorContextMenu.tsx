'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Copy, Scissors, ClipboardPaste, Sparkles, 
  Search, Wand2, MessageSquare, Eye, X, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextMenuProps {
  x: number;
  y: number;
  selectedText: string;
  onClose: () => void;
  onCheckContinuity: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onEnhance: () => void;
  onGenerateMore: () => void;
  onAnalyze: () => void;
}

export function EditorContextMenu({
  x,
  y,
  selectedText,
  onClose,
  onCheckContinuity,
  onCopy,
  onCut,
  onPaste,
  onEnhance,
  onGenerateMore,
  onAnalyze,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y });

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let adjustedX = x;
      let adjustedY = y;
      
      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }
      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }
      
      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const hasSelection = selectedText.length > 0;

  const menuItems = [
    // Standard operations
    { id: 'copy', label: 'Copy', icon: Copy, shortcut: '⌘C', action: onCopy, disabled: !hasSelection },
    { id: 'cut', label: 'Cut', icon: Scissors, shortcut: '⌘X', action: onCut, disabled: !hasSelection },
    { id: 'paste', label: 'Paste', icon: ClipboardPaste, shortcut: '⌘V', action: onPaste },
    { id: 'divider1', type: 'divider' },
    
    // AI Operations - always available
    { id: 'generate', label: 'Continue Writing', icon: Sparkles, shortcut: '⌘J', action: onGenerateMore },
    
    // Selection-required operations
    { id: 'divider2', type: 'divider', show: hasSelection },
    { id: 'enhance', label: 'Enhance Selection', icon: Wand2, action: onEnhance, disabled: !hasSelection, show: hasSelection },
    { id: 'analyze', label: 'Analyze Selection', icon: Eye, action: onAnalyze, disabled: !hasSelection, show: hasSelection },
    
    // Continuity Check - highlighted
    { id: 'divider3', type: 'divider' },
    { 
      id: 'continuity', 
      label: 'Check Continuity', 
      icon: Shield, 
      action: onCheckContinuity, 
      highlight: true,
      description: hasSelection ? 'Check selection' : 'Check recent text'
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[220px] py-1.5 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {menuItems.map((item, index) => {
        if (item.type === 'divider') {
          if (item.show === false) return null;
          return <div key={`divider-${index}`} className="my-1.5 h-px bg-stone-700/50" />;
        }
        
        if (item.show === false) return null;
        
        return (
          <button
            key={item.id}
            onClick={() => {
              item.action?.();
              onClose();
            }}
            disabled={item.disabled}
            className={cn(
              'w-full px-3 py-2 flex items-center gap-3 text-left transition-colors',
              item.disabled 
                ? 'text-stone-600 cursor-not-allowed' 
                : item.highlight
                ? 'text-blue-300 hover:bg-blue-500/20'
                : 'text-stone-300 hover:bg-stone-800',
            )}
          >
            {item.icon && (
              <item.icon className={cn(
                'w-4 h-4 shrink-0',
                item.disabled ? 'text-stone-600' : item.highlight ? 'text-blue-400' : 'text-stone-400'
              )} />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm">{item.label}</span>
              {item.description && (
                <span className="block text-xs text-stone-500">{item.description}</span>
              )}
            </div>
            {item.shortcut && (
              <span className="text-xs text-stone-500 shrink-0">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Hook to manage context menu state
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    selectedText: string;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, selectedText: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      selectedText,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
  };
}
