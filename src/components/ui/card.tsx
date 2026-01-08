import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', ...props }, ref) => {
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const variantStyles = {
      default: 'bg-bg-surface border border-border-subtle',
      interactive: cn(
        'bg-bg-surface border border-border-subtle',
        'hover:border-border-default hover:bg-hover-overlay',
        'transition-all duration-base cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus'
      ),
      elevated: 'bg-bg-elevated border border-border-subtle shadow-md',
      ghost: 'bg-transparent',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg',
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        tabIndex={variant === 'interactive' ? 0 : undefined}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for better composition
export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-heading text-text-primary', className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('mt-1 text-sm text-text-secondary', className)}>{children}</p>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-4 flex items-center gap-3', className)}>{children}</div>;
}
