'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRoot = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-lg bg-slate-900 px-3 py-2 text-sm text-white shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-slate-800',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Simple Tooltip wrapper for ease of use
interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  disabled?: boolean;
}

export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  disabled = false,
}: TooltipProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <TooltipRoot delayDuration={delayDuration}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align}>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}

// Help Tooltip - specifically for contextual help
interface HelpTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  learnMoreUrl?: string;
}

export function HelpTooltip({ children, title, description, learnMoreUrl }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <TooltipRoot delayDuration={100}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="max-w-xs" side="top">
          <div className="space-y-1">
            <p className="font-medium">{title}</p>
            <p className="text-xs text-slate-300">{description}</p>
            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                className="mt-2 inline-block text-xs text-violet-400 hover:text-violet-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more →
              </a>
            )}
          </div>
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}

// Info Icon Tooltip - "?" icon with tooltip
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  description: string;
  learnMoreUrl?: string;
  className?: string;
}

export function InfoTooltip({ title, description, learnMoreUrl, className }: InfoTooltipProps) {
  return (
    <HelpTooltip title={title} description={description} learnMoreUrl={learnMoreUrl}>
      <button
        type="button"
        className={cn(
          'inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
          className
        )}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="sr-only">Help</span>
      </button>
    </HelpTooltip>
  );
}

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };
