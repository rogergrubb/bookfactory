import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: [
          'bg-stone-100 text-stone-700',
          'dark:bg-stone-800 dark:text-stone-300',
        ].join(' '),
        primary: [
          'bg-primary-100 text-primary-700',
          'dark:bg-primary-900/30 dark:text-primary-400',
        ].join(' '),
        accent: [
          'bg-accent-100 text-accent-700',
          'dark:bg-accent-900/30 dark:text-accent-400',
        ].join(' '),
        success: [
          'bg-emerald-100 text-emerald-700',
          'dark:bg-emerald-900/30 dark:text-emerald-400',
        ].join(' '),
        warning: [
          'bg-amber-100 text-amber-700',
          'dark:bg-amber-900/30 dark:text-amber-400',
        ].join(' '),
        error: [
          'bg-red-100 text-red-700',
          'dark:bg-red-900/30 dark:text-red-400',
        ].join(' '),
        info: [
          'bg-blue-100 text-blue-700',
          'dark:bg-blue-900/30 dark:text-blue-400',
        ].join(' '),
        outline: [
          'border border-stone-200 bg-transparent text-stone-600',
          'dark:border-stone-700 dark:text-stone-400',
        ].join(' '),
        // Solid variants (more prominent)
        'solid-primary': 'bg-primary-600 text-white',
        'solid-accent': 'bg-accent-600 text-white',
        'solid-success': 'bg-emerald-600 text-white',
        'solid-error': 'bg-red-600 text-white',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[10px]',
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  dot?: boolean;
  dotColor?: string;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, leftIcon, rightIcon, dot, dotColor, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span 
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              dotColor || 'bg-current opacity-70'
            )} 
          />
        )}
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

// Status Badge - Specifically for book/content status
interface StatusBadgeProps {
  status: 'DRAFT' | 'WRITING' | 'EDITING' | 'PUBLISHED' | 'ARCHIVED' | 'REVISION';
  className?: string;
  showDot?: boolean;
}

const statusConfig = {
  DRAFT: { label: 'Draft', variant: 'default' as const, dotColor: 'bg-stone-400' },
  WRITING: { label: 'Writing', variant: 'primary' as const, dotColor: 'bg-primary-500' },
  EDITING: { label: 'Editing', variant: 'accent' as const, dotColor: 'bg-accent-500' },
  PUBLISHED: { label: 'Published', variant: 'success' as const, dotColor: 'bg-emerald-500' },
  ARCHIVED: { label: 'Archived', variant: 'default' as const, dotColor: 'bg-stone-400' },
  REVISION: { label: 'Revision', variant: 'warning' as const, dotColor: 'bg-amber-500' },
};

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT;
  
  return (
    <Badge 
      variant={config.variant} 
      className={className}
      dot={showDot}
      dotColor={config.dotColor}
    >
      {config.label}
    </Badge>
  );
}

// Counter Badge - For notification counts
interface CounterBadgeProps {
  count: number;
  max?: number;
  variant?: 'primary' | 'accent' | 'error';
  className?: string;
}

export function CounterBadge({ count, max = 99, variant = 'error', className }: CounterBadgeProps) {
  if (count <= 0) return null;
  
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge 
      variant={`solid-${variant}` as const} 
      size="xs" 
      className={cn('min-w-[18px] justify-center', className)}
    >
      {displayCount}
    </Badge>
  );
}

export { Badge, badgeVariants };
