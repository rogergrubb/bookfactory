import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  X,
  FileQuestion
} from 'lucide-react';
import { Button } from './button';

// Re-export Badge from badge component for backward compatibility
export { Badge, StatusBadge, CounterBadge, type BadgeProps } from './badge';

// =============================================================================
// ALERT COMPONENT
// =============================================================================

const alertVariants = cva(
  'relative flex gap-3 rounded-xl border p-4',
  {
    variants: {
      variant: {
        default: [
          'border-stone-200 bg-stone-50 text-stone-800',
          'dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200',
        ].join(' '),
        info: [
          'border-blue-200 bg-blue-50 text-blue-800',
          'dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
        ].join(' '),
        success: [
          'border-emerald-200 bg-emerald-50 text-emerald-800',
          'dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200',
        ].join(' '),
        warning: [
          'border-amber-200 bg-amber-50 text-amber-800',
          'dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200',
        ].join(' '),
        error: [
          'border-red-200 bg-red-50 text-red-800',
          'dark:border-red-800 dark:bg-red-900/20 dark:text-red-200',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

const icons = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Alert({
  className,
  variant = 'default',
  title,
  dismissible,
  onDismiss,
  icon,
  children,
  ...props
}: AlertProps) {
  const IconComponent = icons[variant || 'default'];

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <div className="shrink-0">
        {icon || <IconComponent className="h-5 w-5" />}
      </div>
      <div className="flex-1 space-y-1">
        {title && (
          <p className="font-medium leading-tight">{title}</p>
        )}
        {children && (
          <div className="text-sm opacity-90">{children}</div>
        )}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </button>
      )}
    </div>
  );
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'accent' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-6 text-center',
      className
    )}>
      {/* Icon */}
      <div className="mb-4 rounded-2xl bg-stone-100 p-4 dark:bg-stone-800">
        {icon || <FileQuestion className="h-8 w-8 text-stone-400" />}
      </div>
      
      {/* Title */}
      <h3 className="mb-1 font-display text-lg font-semibold text-stone-900 dark:text-stone-100">
        {title}
      </h3>
      
      {/* Description */}
      {description && (
        <p className="mb-6 max-w-sm text-sm text-stone-500 dark:text-stone-400">
          {description}
        </p>
      )}
      
      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {action && (
            <Button 
              variant={action.variant || 'primary'} 
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              variant="ghost" 
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// INLINE MESSAGE COMPONENT
// =============================================================================

interface InlineMessageProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
}

export function InlineMessage({ variant = 'info', children, className }: InlineMessageProps) {
  const variantStyles = {
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
  };

  const IconComponent = icons[variant];

  return (
    <p className={cn('flex items-center gap-1.5 text-sm', variantStyles[variant], className)}>
      <IconComponent className="h-4 w-4 shrink-0" />
      {children}
    </p>
  );
}

// =============================================================================
// PROGRESS BAR COMPONENT (alias for compatibility)
// =============================================================================

interface ProgressBarProps {
  progress?: number;
  value?: number;
  className?: string;
  variant?: 'default' | 'primary' | 'accent' | 'success';
  color?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ 
  progress, 
  value,
  className, 
  variant = 'primary',
  color,
  showLabel,
  label
}: ProgressBarProps) {
  // Support both 'value' (old) and 'progress' (new) props
  const progressValue = value ?? progress ?? 0;

  // Map color prop to variant or use as custom color
  const colorVariants: Record<string, string> = {
    default: 'bg-stone-600',
    primary: 'bg-primary-600',
    accent: 'bg-accent-500',
    success: 'bg-emerald-500',
    violet: 'bg-violet-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
  };

  const barColor = color 
    ? (colorVariants[color] || `bg-${color}-500`)
    : colorVariants[variant];

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm">
          {label && <span className="text-stone-600 dark:text-stone-400">{label}</span>}
          <span className="text-stone-500 dark:text-stone-400">{Math.round(progressValue)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColor)}
          style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
        />
      </div>
    </div>
  );
}
