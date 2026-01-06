import { forwardRef } from 'react';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none';
    
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-500',
      secondary: 'bg-zinc-700 text-white hover:bg-zinc-600',
      ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-800',
      danger: 'bg-red-600 text-white hover:bg-red-500',
    };
    
    const sizeStyles = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    };
    
    const iconSizeStyles = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-5 h-5',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader className={cn('animate-spin', iconSizeStyles[size])} />
        ) : icon ? (
          <span className={cn(iconSizeStyles[size], children && 'mr-2')}>
            {icon}
          </span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
