import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        default: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, status, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    
    const statusColors = {
      online: 'bg-emerald-500',
      offline: 'bg-stone-400',
      away: 'bg-amber-500',
      busy: 'bg-red-500',
    };

    const statusSizes = {
      xs: 'h-1.5 w-1.5 border',
      sm: 'h-2 w-2 border',
      default: 'h-2.5 w-2.5 border-2',
      lg: 'h-3 w-3 border-2',
      xl: 'h-3.5 w-3.5 border-2',
      '2xl': 'h-4 w-4 border-2',
    };

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : fallback ? (
          <span className="font-medium text-stone-600 dark:text-stone-300">
            {getInitials(fallback)}
          </span>
        ) : (
          <User className="h-1/2 w-1/2 text-stone-400" />
        )}
        
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-white dark:border-stone-900',
              statusColors[status],
              statusSizes[size || 'default']
            )}
          />
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

// Avatar Group
interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: VariantProps<typeof avatarVariants>['size'];
  className?: string;
}

export function AvatarGroup({ children, max, size = 'default', className }: AvatarGroupProps) {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = max ? avatars.slice(0, max) : avatars;
  const remainingCount = max ? Math.max(0, avatars.length - max) : 0;

  const overlapSizes = {
    xs: '-space-x-1.5',
    sm: '-space-x-2',
    default: '-space-x-2.5',
    lg: '-space-x-3',
    xl: '-space-x-4',
    '2xl': '-space-x-5',
  };

  return (
    <div className={cn('flex items-center', overlapSizes[size || 'default'], className)}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className="relative ring-2 ring-white dark:ring-stone-900 rounded-full"
        >
          {React.isValidElement(avatar)
            ? React.cloneElement(avatar as React.ReactElement<AvatarProps>, { size })
            : avatar}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            avatarVariants({ size }),
            'ring-2 ring-white dark:ring-stone-900 bg-stone-200 dark:bg-stone-700 font-medium text-stone-600 dark:text-stone-300'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export { Avatar, avatarVariants };
