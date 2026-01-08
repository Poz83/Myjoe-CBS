import { forwardRef } from 'react';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
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
    // Base styles using design tokens
    const baseStyles = cn(
      'inline-flex items-center justify-center gap-2 font-medium',
      'rounded-lg transition-all duration-base',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
      'disabled:opacity-50 disabled:pointer-events-none'
    );
    
    const variantStyles = {
      primary: 'bg-accent-cyan text-bg-base hover:bg-accent-cyan-hover shadow-sm',
      secondary: 'bg-bg-elevated text-text-primary border border-border-subtle hover:border-border-default hover:bg-hover-overlay',
      ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-hover-overlay',
      danger: 'bg-error text-white hover:brightness-110',
      outline: 'border border-border-default bg-transparent text-text-secondary hover:text-text-primary hover:bg-hover-overlay',
      accent: 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white hover:shadow-glow-cyan',
    };
    
    // Consistent heights: sm=32px (h-8), md=40px (h-10), lg=48px (h-12)
    const sizeStyles = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-0',
      'icon-sm': 'h-8 w-8 p-0',
    };
    
    const iconSizeStyles = {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      icon: 'w-5 h-5',
      'icon-sm': 'w-4 h-4',
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
          <span className={cn(iconSizeStyles[size], children ? '' : undefined)}>
            {icon}
          </span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
