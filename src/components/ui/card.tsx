import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { gradient?: boolean }
>(({ className, gradient, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300',
      'hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-200',
      'dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
      gradient && 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-none tracking-tight text-slate-900 dark:text-white',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Specialized Card Variants
const StatsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: React.ReactNode;
  }
>(({ className, title, value, change, changeType = 'neutral', icon, ...props }, ref) => (
  <Card ref={ref} className={cn('overflow-hidden', className)} {...props}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {change && (
            <p className={cn(
              'mt-1 text-sm font-medium',
              changeType === 'positive' && 'text-emerald-600',
              changeType === 'negative' && 'text-red-600',
              changeType === 'neutral' && 'text-slate-500'
            )}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 p-3 dark:from-violet-900/30 dark:to-indigo-900/30">
            {icon}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
));
StatsCard.displayName = 'StatsCard';

const BookCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    author?: string;
    genre?: string;
    wordCount?: number;
    status?: string;
    coverUrl?: string;
    progress?: number;
  }
>(({ className, title, author, genre, wordCount, status, coverUrl, progress, ...props }, ref) => (
  <Card 
    ref={ref} 
    className={cn(
      'group cursor-pointer overflow-hidden transition-all duration-300',
      'hover:-translate-y-1',
      className
    )} 
    {...props}
  >
    <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
      {coverUrl ? (
        <img 
          src={coverUrl} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="text-center p-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-3">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-2">{title}</p>
          </div>
        </div>
      )}
      {status && (
        <div className="absolute top-3 right-3">
          <span className={cn(
            'rounded-full px-2.5 py-1 text-xs font-medium',
            status === 'PUBLISHED' && 'bg-emerald-500 text-white',
            status === 'DRAFT' && 'bg-slate-500 text-white',
            status === 'WRITING' && 'bg-blue-500 text-white',
            status === 'EDITING' && 'bg-amber-500 text-white'
          )}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
        </div>
      )}
    </div>
    <CardContent className="p-4">
      <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{title}</h4>
      {author && <p className="mt-0.5 text-sm text-slate-500">{author}</p>}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        {genre && <span>{genre}</span>}
        {wordCount !== undefined && <span>{wordCount.toLocaleString()} words</span>}
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700">
            <div 
              className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">{progress}% complete</p>
        </div>
      )}
    </CardContent>
  </Card>
));
BookCard.displayName = 'BookCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatsCard,
  BookCard,
};
