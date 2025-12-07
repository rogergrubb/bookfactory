import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl border transition-all duration-200',
  {
    variants: {
      variant: {
        default: [
          'bg-white border-stone-200',
          'dark:bg-stone-900 dark:border-stone-800',
        ].join(' '),
        elevated: [
          'bg-white border-stone-100 shadow-lg',
          'dark:bg-stone-900 dark:border-stone-800',
        ].join(' '),
        outlined: [
          'bg-transparent border-stone-200',
          'dark:border-stone-700',
        ].join(' '),
        ghost: [
          'bg-stone-50/50 border-transparent',
          'dark:bg-stone-800/50',
        ].join(' '),
        interactive: [
          'bg-white border-stone-200 cursor-pointer',
          'hover:border-primary-300 hover:shadow-md hover:shadow-primary-500/5',
          'dark:bg-stone-900 dark:border-stone-800 dark:hover:border-primary-700',
        ].join(' '),
        gradient: [
          'bg-gradient-to-br from-primary-500 to-primary-700 border-0 text-white',
        ].join(' '),
        accent: [
          'bg-gradient-to-br from-accent-400 to-accent-600 border-0 text-white',
        ].join(' '),
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

// Card Header
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// Card Title
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-display text-xl font-semibold leading-tight tracking-tight text-stone-900 dark:text-stone-50',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// Card Description
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-stone-500 dark:text-stone-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// Card Content
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// Card Footer
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Stat Card - Special card for displaying metrics
interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent';
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, description, icon, trend, variant = 'default', ...props }, ref) => {
    const iconBgColors = {
      default: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
      primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
      accent: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
    };
    
    return (
      <Card ref={ref} className={cn('', className)} {...props}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-50">{value}</p>
            {description && (
              <p className="text-xs text-stone-400 dark:text-stone-500">{description}</p>
            )}
            {trend && (
              <p className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          {icon && (
            <div className={cn('rounded-lg p-2.5', iconBgColors[variant])}>
              {icon}
            </div>
          )}
        </div>
      </Card>
    );
  }
);
StatCard.displayName = 'StatCard';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
  cardVariants,
};
