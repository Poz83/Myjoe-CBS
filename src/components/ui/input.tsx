import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, disabled, inputSize = 'md', ...props }, ref) => {
    // Consistent heights: sm=32px (h-8), md=40px (h-10), lg=48px (h-12)
    const sizeStyles = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-4 text-base',
    };

    return (
      <input
        ref={ref}
        className={cn(
          // Base styles using design tokens
          'w-full rounded-lg',
          'bg-bg-elevated border text-text-primary',
          'placeholder:text-text-muted',
          'transition-all duration-base',
          // Focus styles
          'focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-cyan-muted',
          // Hover styles
          'hover:border-border-default',
          // Size
          sizeStyles[inputSize],
          // Error state
          error && 'border-error focus:border-error focus:ring-error-muted',
          !error && 'border-border-subtle',
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
