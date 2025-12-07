import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'gradient';
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = 'default',
  variant = 'primary',
  showValue = false,
  label,
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: 'h-1.5',
    default: 'h-2',
    lg: 'h-3',
  };

  const variants = {
    default: 'bg-stone-600 dark:bg-stone-400',
    primary: 'bg-primary-600 dark:bg-primary-500',
    accent: 'bg-accent-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    gradient: 'bg-gradient-to-r from-primary-500 to-accent-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          {label && (
            <span className="text-stone-600 dark:text-stone-400">{label}</span>
          )}
          {showValue && (
            <span className="font-medium text-stone-900 dark:text-stone-100">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800',
          sizes[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Circular Progress
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'primary' | 'accent' | 'success';
  showValue?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  variant = 'primary',
  showValue = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variants = {
    primary: 'text-primary-600 dark:text-primary-500',
    accent: 'text-accent-500',
    success: 'text-emerald-500',
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-stone-200 dark:stroke-stone-800"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn('fill-none transition-all duration-300 ease-out', variants[variant])}
          style={{
            stroke: 'currentColor',
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-stone-900 dark:text-stone-100">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Word Count Progress - Specific for book writing
interface WordCountProgressProps {
  current: number;
  target: number;
  className?: string;
}

export function WordCountProgress({ current, target, className }: WordCountProgressProps) {
  const percentage = Math.min(100, (current / target) * 100);
  const remaining = Math.max(0, target - current);
  
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toLocaleString();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-mono text-stone-600 dark:text-stone-400">
          {formatCount(current)} / {formatCount(target)} words
        </span>
        <span className={cn(
          'font-medium',
          percentage >= 100 ? 'text-emerald-600' : 'text-stone-900 dark:text-stone-100'
        )}>
          {Math.round(percentage)}%
        </span>
      </div>
      <Progress 
        value={current} 
        max={target} 
        variant={percentage >= 100 ? 'success' : 'gradient'} 
        size="lg"
      />
      {percentage < 100 && (
        <p className="text-xs text-stone-500">
          {formatCount(remaining)} words to go
        </p>
      )}
    </div>
  );
}
