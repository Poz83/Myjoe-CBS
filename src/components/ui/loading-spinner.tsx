import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'accent',
  className
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  // Using design tokens for colors
  const variantClasses = {
    primary: 'border-accent-purple',
    secondary: 'border-text-muted',
    accent: 'border-accent-cyan',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-transparent border-t-current',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'accent';
  className?: string;
}

export function LoadingDots({ size = 'md', variant = 'accent', className }: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };

  const variantClasses = {
    primary: 'bg-accent-purple',
    accent: 'bg-accent-cyan',
  };

  return (
    <div className={cn('flex space-x-1', className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-pulse',
            sizeClasses[size],
            variantClasses[variant]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  );
}

interface LoadingPulseProps {
  variant?: 'primary' | 'accent';
  className?: string;
}

export function LoadingPulse({ variant = 'accent', className }: LoadingPulseProps) {
  const variantClasses = {
    primary: 'bg-accent-purple',
    accent: 'bg-accent-cyan',
  };

  return (
    <div className={cn('flex items-center space-x-2', className)} role="status" aria-label="Loading">
      <div className={cn('w-2 h-2 rounded-full animate-pulse', variantClasses[variant])} />
      <div className={cn('w-2 h-2 rounded-full animate-pulse', variantClasses[variant])} style={{ animationDelay: '0.2s' }} />
      <div className={cn('w-2 h-2 rounded-full animate-pulse', variantClasses[variant])} style={{ animationDelay: '0.4s' }} />
    </div>
  );
}