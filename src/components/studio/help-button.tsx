'use client';

import { HelpCircle } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HelpButtonProps {
  onClick?: () => void;
  className?: string;
}

export function HelpButton({ onClick, className }: HelpButtonProps) {
  return (
    <Tooltip content="Help & Documentation" position="bottom">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center w-9 h-9 rounded-md',
          'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors',
          className
        )}
        aria-label="Help"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    </Tooltip>
  );
}
