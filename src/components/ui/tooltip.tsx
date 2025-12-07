'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  className?: string;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delay = 200,
  className,
  disabled = false,
}: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => setOpen(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const positions = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const alignments = {
    start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
    center: side === 'top' || side === 'bottom' 
      ? 'left-1/2 -translate-x-1/2' 
      : 'top-1/2 -translate-y-1/2',
    end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0',
  };

  const origins = {
    top: 'origin-bottom',
    bottom: 'origin-top',
    left: 'origin-right',
    right: 'origin-left',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute z-tooltip whitespace-nowrap rounded-lg',
              'bg-stone-900 px-2.5 py-1.5 text-xs text-white shadow-lg',
              'dark:bg-stone-100 dark:text-stone-900',
              positions[side],
              alignments[align],
              origins[side],
              className
            )}
            role="tooltip"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// InfoTooltip - Icon with tooltip for help text
interface InfoTooltipProps {
  content?: React.ReactNode;
  title?: string;
  description?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
}

export function InfoTooltip({ 
  content,
  title,
  description,
  side = 'top', 
  className,
  iconClassName,
  disabled = false,
}: InfoTooltipProps) {
  // Support both content prop and title/description props
  const tooltipContent = content || (
    <div className="max-w-xs">
      {title && <p className="font-medium">{title}</p>}
      {description && <p className="mt-0.5 text-stone-300">{description}</p>}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} side={side} className={className} disabled={disabled}>
      <button 
        type="button" 
        className={cn(
          'inline-flex items-center justify-center rounded-full p-0.5',
          'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
          iconClassName
        )}
      >
        <Info className="h-4 w-4" />
        <span className="sr-only">More information</span>
      </button>
    </Tooltip>
  );
}
