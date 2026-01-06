import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-5 bg-zinc-900 rounded-lg border border-zinc-800',
          variant === 'interactive' && 'hover:border-zinc-700 transition-colors',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
