'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionProps {
  children: React.ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  className?: string;
}

export interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  open?: boolean;
  onToggle?: () => void;
}

export interface AccordionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({
  children,
  defaultValue,
  onValueChange,
  className,
}: AccordionProps) {
  const [openValue, setOpenValue] = useState<string | undefined>(defaultValue);

  const handleValueChange = (value: string) => {
    const newValue = openValue === value ? undefined : value;
    setOpenValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className={cn('border border-zinc-800 rounded-lg overflow-hidden', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<AccordionItemProps>(child)) {
          return React.cloneElement(child, {
            ...child.props,
            open: openValue === child.props.value,
            onToggle: () => handleValueChange(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
}

export function AccordionItem({
  value,
  children,
  open,
  onToggle,
}: AccordionItemProps & { open?: boolean; onToggle?: () => void }) {
  return (
    <div className="border-b border-zinc-800 last:border-b-0">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === AccordionHeader) {
            return React.cloneElement(child, {
              ...child.props,
              open,
              onToggle,
            });
          }
          if (child.type === AccordionContent) {
            return React.cloneElement(child, {
              ...child.props,
              open,
            });
          }
        }
        return child;
      })}
    </div>
  );
}

export function AccordionHeader({
  children,
  open,
  onToggle,
  className,
}: AccordionHeaderProps & { open?: boolean; onToggle?: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full p-4 flex items-center justify-between',
        'text-left hover:bg-zinc-800/50 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-inset',
        className
      )}
      aria-expanded={open}
    >
      <span className="font-medium">{children}</span>
      <ChevronDown
        className={cn(
          'w-5 h-5 text-zinc-400 transition-transform duration-200',
          open && 'rotate-180'
        )}
      />
    </button>
  );
}

export function AccordionContent({
  children,
  open,
  className,
}: AccordionContentProps & { open?: boolean }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | string>(0);

  useEffect(() => {
    if (contentRef.current) {
      if (open) {
        setHeight(contentRef.current.scrollHeight);
      } else {
        setHeight(0);
      }
    }
  }, [open]);

  return (
    <div
      ref={contentRef}
      className={cn(
        'overflow-hidden transition-all duration-200 ease-in-out',
        className
      )}
      style={{ height }}
    >
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}
