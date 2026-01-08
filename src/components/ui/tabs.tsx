'use client';

import { useState, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  children,
  onValueChange,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'underline' | 'pill';
}

export function TabsList({ children, className, variant = 'underline' }: TabsListProps) {
  const variants = {
    underline: 'flex items-center gap-1 border-b border-border-subtle',
    pill: 'inline-flex items-center gap-1 p-1 bg-bg-elevated rounded-lg',
  };

  return (
    <div
      role="tablist"
      className={cn(variants[variant], className)}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }

  const isActive = context.value === value;

  return (
    <button
      onClick={() => !disabled && context.onValueChange(value)}
      disabled={disabled}
      className={cn(
        // Base styles
        'h-10 px-4 text-sm font-medium transition-all duration-base',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        // Active/inactive states
        isActive
          ? 'text-text-primary border-b-2 border-accent-cyan -mb-px'
          : 'text-text-secondary hover:text-text-primary border-b-2 border-transparent',
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }

  if (context.value !== value) {
    return null;
  }

  return (
    <div
      className={cn(
        'mt-4 animate-in fade-in-0 duration-200',
        className
      )}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
