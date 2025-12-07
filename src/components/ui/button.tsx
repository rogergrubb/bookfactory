import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        // Primary - Teal, main action buttons
        primary: [
          'bg-primary-600 text-white',
          'shadow-md shadow-primary-500/20',
          'hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30',
          'dark:bg-primary-500 dark:hover:bg-primary-400',
        ].join(' '),
        
        // Accent - Amber, call-to-action buttons
        accent: [
          'bg-gradient-to-r from-accent-500 to-accent-600 text-white',
          'shadow-md shadow-accent-500/25',
          'hover:shadow-lg hover:shadow-accent-500/35 hover:translate-y-[-1px]',
        ].join(' '),
        
        // Secondary - Subtle background
        secondary: [
          'bg-stone-100 text-stone-900',
          'hover:bg-stone-200',
          'dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700',
        ].join(' '),
        
        // Outline - Border only
        outline: [
          'border-2 border-stone-200 bg-transparent text-stone-700',
          'hover:bg-stone-50 hover:border-stone-300',
          'dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:border-stone-600',
        ].join(' '),
        
        // Ghost - No background until hover
        ghost: [
          'text-stone-600',
          'hover:bg-stone-100 hover:text-stone-900',
          'dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100',
        ].join(' '),
        
        // Link - Text only with underline
        link: [
          'text-primary-600 underline-offset-4',
          'hover:underline',
          'dark:text-primary-400',
        ].join(' '),
        
        // Destructive - Red for delete/danger actions
        destructive: [
          'bg-red-600 text-white',
          'shadow-md shadow-red-500/20',
          'hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/30',
        ].join(' '),
        
        // Success - Green for positive actions
        success: [
          'bg-emerald-600 text-white',
          'shadow-md shadow-emerald-500/20',
          'hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30',
        ].join(' '),
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md',
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base rounded-xl',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    loading, 
    leftIcon,
    rightIcon,
    children, 
    disabled, 
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
