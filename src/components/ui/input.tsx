import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const inputVariants = cva(
  // Base styles
  [
    'flex w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200',
    'placeholder:text-stone-400',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-stone-50',
    'dark:bg-stone-900 dark:placeholder:text-stone-500',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'border-stone-200',
          'focus:border-primary-500 focus:ring-primary-500/20',
          'dark:border-stone-700 dark:focus:border-primary-400',
        ].join(' '),
        error: [
          'border-red-300 text-red-900',
          'focus:border-red-500 focus:ring-red-500/20',
          'dark:border-red-700 dark:text-red-100',
        ].join(' '),
        success: [
          'border-emerald-300',
          'focus:border-emerald-500 focus:ring-emerald-500/20',
          'dark:border-emerald-700',
        ].join(' '),
      },
      inputSize: {
        sm: 'h-8 text-xs px-2.5',
        default: 'h-10',
        lg: 'h-12 text-base px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant,
      inputSize,
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || React.useId();
    
    // Determine variant based on error/success state
    const computedVariant = error ? 'error' : success ? 'success' : variant;
    
    // Handle password visibility toggle
    const inputType = type === 'password' && showPassword ? 'text' : type;
    
    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            {label}
          </label>
        )}
        
        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              {leftIcon}
            </div>
          )}
          
          {/* Input */}
          <input
            type={inputType}
            id={inputId}
            className={cn(
              inputVariants({ variant: computedVariant, inputSize }),
              leftIcon && 'pl-10',
              (rightIcon || showPasswordToggle || error || success) && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          
          {/* Right side icons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {/* Password toggle */}
            {type === 'password' && showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-stone-400 hover:text-stone-600 focus:outline-none dark:hover:text-stone-300"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
            
            {/* Error icon */}
            {error && !showPasswordToggle && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            
            {/* Success icon */}
            {success && !error && !showPasswordToggle && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
            
            {/* Custom right icon */}
            {rightIcon && !error && !success && !showPasswordToggle && (
              <span className="text-stone-400">{rightIcon}</span>
            )}
          </div>
        </div>
        
        {/* Helper text / Error message / Success message */}
        {(helperText || error || success) && (
          <p
            id={error ? `${inputId}-error` : `${inputId}-helper`}
            className={cn(
              'mt-1.5 text-xs',
              error && 'text-red-600 dark:text-red-400',
              success && !error && 'text-emerald-600 dark:text-emerald-400',
              !error && !success && 'text-stone-500 dark:text-stone-400'
            )}
          >
            {error || success || helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Textarea component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, success, disabled, id, ...props }, ref) => {
    const textareaId = id || React.useId();
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            {label}
          </label>
        )}
        
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[100px] w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200',
            'placeholder:text-stone-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-stone-50',
            'dark:bg-stone-900 dark:placeholder:text-stone-500',
            'resize-y',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : success
              ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20'
              : 'border-stone-200 focus:border-primary-500 focus:ring-primary-500/20 dark:border-stone-700',
            className
          )}
          ref={ref}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        
        {(helperText || error || success) && (
          <p
            className={cn(
              'mt-1.5 text-xs',
              error && 'text-red-600',
              success && !error && 'text-emerald-600',
              !error && !success && 'text-stone-500'
            )}
          >
            {error || success || helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Input, Textarea, inputVariants };
