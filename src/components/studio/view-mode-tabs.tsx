'use client';

import { LayoutGrid, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'pages' | 'grid' | 'export';

interface ViewModeTabsProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

const TABS: { value: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'pages', label: 'Pages', icon: FileText },
  { value: 'grid', label: 'Grid', icon: LayoutGrid },
  { value: 'export', label: 'Export', icon: Download },
];

export function ViewModeTabs({ value, onChange, className }: ViewModeTabsProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center bg-zinc-800/50 rounded-lg p-1 border border-zinc-700/50',
        className
      )}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = value === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              isActive
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
