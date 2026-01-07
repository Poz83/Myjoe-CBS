'use client';

import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlotsBadgeProps {
  balance: number;
  onClick?: () => void;
  className?: string;
}

function getColorClass(balance: number) {
  if (balance <= 10) return 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20';
  if (balance <= 50) return 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20';
  return 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20';
}

export function BlotsBadge({ balance, onClick, className }: BlotsBadgeProps) {
  const colorClass = getColorClass(balance);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors',
        colorClass,
        className
      )}
    >
      <Palette className="w-4 h-4" />
      <span className="font-semibold tabular-nums">{balance.toLocaleString()}</span>
      <span className="text-sm opacity-80">Blots</span>
    </button>
  );
}
