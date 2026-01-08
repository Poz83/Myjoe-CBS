'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Arrow colors use CSS variable for consistency
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--bg-elevated)] border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--bg-elevated)] border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--bg-elevated)] border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--bg-elevated)] border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-popover',
            'px-3 py-1.5 rounded-md',
            'bg-bg-elevated text-text-primary text-sm',
            'border border-border-subtle shadow-md',
            'whitespace-nowrap pointer-events-none',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            positionClasses[position],
            className
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-0 h-0 border-[5px]',
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
}

// Provider pattern for more complex tooltip scenarios
export interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

export const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  return <>{children}</>;
};

export const TooltipContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
