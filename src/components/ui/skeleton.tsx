import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'title' | 'image' | 'card' | 'avatar' | 'button' | 'input' | 'thumbnail';
  animation?: 'shimmer' | 'pulse' | 'wave' | 'fade';
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', animation = 'shimmer', ...props }, ref) => {
    // Using design tokens for consistent styling
    const variantStyles = {
      text: 'h-4 rounded-md',
      title: 'h-6 rounded-md',
      image: 'aspect-[3/4] rounded-lg',
      card: 'p-5 rounded-lg border border-border-subtle',
      avatar: 'w-10 h-10 rounded-full',
      button: 'h-10 rounded-lg',
      input: 'h-10 rounded-lg border border-border-subtle',
      thumbnail: 'aspect-[3/4] rounded-lg',
    };

    // Animation styles using token-compatible colors
    const animationStyles = {
      shimmer: 'bg-gradient-to-r from-bg-elevated via-bg-surface to-bg-elevated bg-[length:200%_100%] animate-shimmer',
      pulse: 'bg-bg-elevated animate-pulse',
      wave: 'bg-gradient-to-r from-bg-elevated via-hover-overlay to-bg-elevated bg-[length:400%_100%] animate-wave',
      fade: 'bg-bg-elevated animate-fade',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          animationStyles[animation],
          variantStyles[variant],
          className
        )}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Convenience component for text skeleton groups
export function SkeletonText({ 
  lines = 3, 
  className 
}: { 
  lines?: number; 
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          className={i === lines - 1 ? 'w-3/4' : 'w-full'} 
        />
      ))}
    </div>
  );
}
