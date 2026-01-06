import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'title' | 'image' | 'card';
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', ...props }, ref) => {
    const variantStyles = {
      text: 'h-4 rounded',
      title: 'h-6 rounded',
      image: 'aspect-[3/4] rounded-lg',
      card: 'p-5 rounded-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-zinc-800',
          'bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800',
          'bg-[length:200%_100%]',
          'animate-shimmer',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
