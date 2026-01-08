 'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div className={cn('relative', className)}>
      {/* Keying by pathname triggers a subtle enter animation per route change */}
      <div
        key={pathname}
        className={cn(
          'animate-page-enter motion-reduce:animate-none motion-reduce:transform-none',
          'will-change-transform will-change-opacity'
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface SuspenseLoaderProps {
  fallback?: React.ReactNode;
  className?: string;
}

export function SuspenseLoader({
  fallback,
  className
}: SuspenseLoaderProps) {
  const defaultFallback = (
    <div className={cn('flex items-center justify-center min-h-[200px]', className)}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" variant="primary" />
        <p className="text-sm text-zinc-400">Loading content...</p>
      </div>
    </div>
  );

  return fallback || defaultFallback;
}