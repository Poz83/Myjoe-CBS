'use client';

import * as React from 'react';

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
    return React.cloneElement(children as React.ReactElement<any>, {
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
  className = '',
}: {
  children: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
}) => {
  const alignClass = align === 'end' ? 'right-0' : 'left-0';
  return (
    <div
      className={`absolute ${alignClass} mt-2 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuSeparator = ({ className = '' }: { className?: string }) => {
  return <div className={`h-px bg-zinc-800 my-1 ${className}`} />;
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
