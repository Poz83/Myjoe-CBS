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
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  title,
  className,
}: DialogProps) {
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

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
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Dialog Content */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        className={cn(
          'relative z-50 bg-zinc-900 rounded-lg border border-zinc-800',
          'shadow-[0_20px_40px_rgba(0,0,0,0.4)]',
          'max-w-lg w-full mx-4 p-6',
          'focus:outline-none',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        {title && (
          <h2 id="dialog-title" className="text-xl font-semibold mb-4 pr-8">
            {title}
          </h2>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
