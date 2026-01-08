'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  size = 'md',
  className,
}: DialogProps) {
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Size variants
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      // Store the previously focused element
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus the dialog content
      setTimeout(() => {
        const firstFocusable = contentRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 0);
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus to previous element
      previousActiveElementRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    const handleTab = (e: KeyboardEvent) => {
      if (!open || !contentRef.current) return;

      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    if (open) {
      document.addEventListener('keydown', handleTab);
    }

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [open]);

  if (!mounted || !open) return null;

  const dialogContent = (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-bg-overlay backdrop-blur-sm animate-in fade-in-0 duration-200" />
      
      {/* Dialog Content */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-description' : undefined}
        className={cn(
          'relative z-modal',
          'bg-bg-surface rounded-xl border border-border-subtle',
          'shadow-lg',
          'w-full mx-4 p-6',
          'focus:outline-none',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          sizeStyles[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className={cn(
            'absolute top-4 right-4 h-8 w-8',
            'flex items-center justify-center rounded-lg',
            'text-text-muted hover:text-text-primary',
            'hover:bg-hover-overlay',
            'transition-colors duration-base',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus'
          )}
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        {(title || description) && (
          <div className="mb-6 pr-8">
            {title && (
              <h2 id="dialog-title" className="text-heading-lg text-text-primary">
                {title}
              </h2>
            )}
            {description && (
              <p id="dialog-description" className="mt-2 text-sm text-text-secondary">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}

// Dialog sub-components for better composition
export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-6', className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-heading-lg text-text-primary', className)}>{children}</h2>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('mt-2 text-sm text-text-secondary', className)}>{children}</p>;
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-6 flex items-center justify-end gap-3', className)}>{children}</div>;
}
