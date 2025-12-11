'use client';

import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface EditorCanvasProps {
  content: string;
  onChange: (content: string) => void;
  onSelectionChange: (selection: { start: number; end: number; text: string } | null) => void;
  disabled?: boolean;
}

// Theme configurations
const THEMES = {
  light: {
    bg: 'bg-white',
    text: 'text-stone-900',
    placeholder: 'placeholder:text-stone-300',
  },
  sepia: {
    bg: 'bg-amber-50',
    text: 'text-amber-950',
    placeholder: 'placeholder:text-amber-300',
  },
  dark: {
    bg: 'bg-stone-900',
    text: 'text-stone-100',
    placeholder: 'placeholder:text-stone-600',
  },
};

export const EditorCanvas = forwardRef<HTMLTextAreaElement, EditorCanvasProps>(
  function EditorCanvas({ content, onChange, onSelectionChange, disabled }, ref) {
    const [theme] = useState<keyof typeof THEMES>('light');
    const [fontSize] = useState(18);
    const [lineHeight] = useState(1.8);
    const [fontFamily] = useState("'Georgia', serif");
    
    const themeStyles = THEMES[theme];

    // Handle selection change
    const handleSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (start !== end) {
        const text = textarea.value.substring(start, end);
        onSelectionChange({ start, end, text });
      } else {
        onSelectionChange(null);
      }
    }, [onSelectionChange]);

    // Handle content change
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    }, [onChange]);

    // Listen for selection changes via mouse and keyboard
    useEffect(() => {
      const textarea = (ref as React.RefObject<HTMLTextAreaElement>)?.current;
      if (!textarea) return;

      const handleSelectionChange = () => {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        if (start !== end) {
          const text = textarea.value.substring(start, end);
          onSelectionChange({ start, end, text });
        } else {
          onSelectionChange(null);
        }
      };

      // Listen for mouse up and key up to detect selection changes
      textarea.addEventListener('mouseup', handleSelectionChange);
      textarea.addEventListener('keyup', handleSelectionChange);

      return () => {
        textarea.removeEventListener('mouseup', handleSelectionChange);
        textarea.removeEventListener('keyup', handleSelectionChange);
      };
    }, [ref, onSelectionChange]);

    return (
      <div className={cn('h-full', themeStyles.bg)}>
        <div className="max-w-3xl mx-auto h-full px-8 py-12">
          <textarea
            ref={ref}
            value={content}
            onChange={handleChange}
            onSelect={handleSelect}
            disabled={disabled}
            placeholder="Start writing your story...

The words will come. Trust the process.

Position your cursor and press ⌘J to let AI continue your narrative, or select text and choose a tool to enhance it."
            className={cn(
              'w-full h-full resize-none outline-none bg-transparent',
              'transition-opacity duration-200',
              themeStyles.text,
              themeStyles.placeholder,
              disabled && 'opacity-60 cursor-not-allowed'
            )}
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
            }}
            spellCheck
          />
        </div>
      </div>
    );
  }
);
