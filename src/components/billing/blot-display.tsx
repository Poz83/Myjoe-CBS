'use client';

import { Palette } from 'lucide-react';
import { useBlots } from '@/hooks/use-blots';
import { cn } from '@/lib/utils';

interface BlotDisplayProps {
  onClick?: () => void;
  className?: string;
}

function getTextColor(blots: number): string {
  if (blots === 0) return 'text-red-500';
  if (blots < 50) return 'text-amber-500';
  return 'text-zinc-100';
}

export function BlotDisplay({ onClick, className }: BlotDisplayProps) {
  const { blots, isLoading } = useBlots();

  const textColor = getTextColor(blots);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-md transition-colors',
        onClick && 'hover:bg-zinc-700 cursor-pointer',
        !onClick && 'cursor-default',
        className
      )}
      role="status"
      aria-label={`Blot balance: ${blots.toLocaleString()} blots`}
    >
      <Palette className={cn('h-4 w-4', textColor)} aria-hidden="true" />
      {isLoading ? (
        <span className="text-sm font-medium text-zinc-400">...</span>
      ) : (
        <span className={cn('text-sm font-medium', textColor)}>
          {blots.toLocaleString()}
        </span>
      )}
    </button>
  );
}
