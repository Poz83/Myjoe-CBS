import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}: EmptyStateProps) {
  const sizeStyles = {
    sm: {
      container: 'py-8 px-4',
      iconWrapper: 'w-12 h-12 mb-4',
      icon: 'w-6 h-6',
      title: 'text-base',
      description: 'text-sm max-w-xs',
      gap: 'mb-4',
    },
    md: {
      container: 'py-16 px-4',
      iconWrapper: 'w-16 h-16 mb-6',
      icon: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm max-w-sm',
      gap: 'mb-6',
    },
    lg: {
      container: 'py-24 px-4',
      iconWrapper: 'w-20 h-20 mb-8',
      icon: 'w-10 h-10',
      title: 'text-xl',
      description: 'text-base max-w-md',
      gap: 'mb-8',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div className={cn('flex flex-col items-center justify-center', styles.container, className)}>
      <div className={cn(
        'bg-bg-elevated rounded-full flex items-center justify-center',
        'border border-border-subtle',
        styles.iconWrapper
      )}>
        <Icon className={cn('text-text-muted', styles.icon)} aria-hidden="true" />
      </div>
      <h3 className={cn('font-semibold text-text-primary mb-2', styles.title)}>{title}</h3>
      <p className={cn('text-text-secondary text-center', styles.description, styles.gap)}>{description}</p>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button variant={action.variant || 'primary'}>{action.label}</Button>
              </Link>
            ) : (
              <Button variant={action.variant || 'primary'} onClick={action.onClick}>
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant={secondaryAction.variant || 'secondary'}>{secondaryAction.label}</Button>
              </Link>
            ) : (
              <Button variant={secondaryAction.variant || 'secondary'} onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
