import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 w-full px-4 bg-zinc-900 border rounded-md text-white placeholder:text-zinc-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500',
          'transition-colors',
          error && 'border-red-500 focus:ring-red-500/40 focus:border-red-500',
          !error && 'border-zinc-700',
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
