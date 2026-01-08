'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const DropdownMenu = ({ 
  children,
  open,
  onOpenChange,
}: { 
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  return <div className="relative inline-block">{children}</div>;
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<unknown>, {
      ref,
      ...props,
    });
  }
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = ({
  children,
  align = 'start',
  sideOffset = 8,
  className,
}: {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
}) => {
  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      className={cn(
        'absolute z-dropdown min-w-[180px]',
        'bg-bg-elevated border border-border-default rounded-lg shadow-lg',
        'py-1',
        'animate-in fade-in-0 zoom-in-95 duration-150',
        alignClasses[align],
        className
      )}
      style={{ marginTop: sideOffset }}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({
  children,
  className,
  disabled,
  destructive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  disabled?: boolean;
  destructive?: boolean;
}) => {
  return (
    <div
      role="menuitem"
      className={cn(
        'px-3 py-2 text-sm cursor-pointer',
        'flex items-center gap-2',
        'transition-colors duration-fast',
        'outline-none',
        destructive
          ? 'text-error hover:bg-error-muted focus:bg-error-muted'
          : 'text-text-primary hover:bg-hover-overlay focus:bg-hover-overlay',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuLabel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(
      'px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary',
      className
    )}>
      {children}
    </div>
  );
};

const DropdownMenuSeparator = ({ className }: { className?: string }) => {
  return <div className={cn('h-px bg-border-subtle my-1', className)} />;
};

const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => {
  return <div role="group">{children}</div>;
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
};
