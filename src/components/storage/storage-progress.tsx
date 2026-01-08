'use client';

import { cn } from '@/lib/utils';

interface StorageProgressProps {
  used: number;
  limit: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: { radius: 20, strokeWidth: 3, textSize: 'text-xs' },
  md: { radius: 32, strokeWidth: 4, textSize: 'text-sm' },
  lg: { radius: 40, strokeWidth: 5, textSize: 'text-base' },
};

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) {
    return `${gb.toFixed(1)}GB`;
  }
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(0)}MB`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(0)}KB`;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 90) return '#ef4444'; // red-500
  if (percentage >= 75) return '#f59e0b'; // amber-500
  return '#10b981'; // emerald-500
}

export function StorageProgress({ used, limit, className, size = 'md' }: StorageProgressProps) {
  const { radius, strokeWidth, textSize } = sizeClasses[size];
  const circumference = 2 * Math.PI * radius;
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = getProgressColor(percentage);

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative">
        <svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-zinc-700"
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-semibold text-white', textSize)}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      {/* Storage info */}
      <div className="text-center">
        <div className="text-xs text-zinc-400">
          {formatBytes(used)} / {formatBytes(limit)}
        </div>
        <div className="text-xs text-zinc-500">
          {formatBytes(limit - used)} free
        </div>
      </div>
    </div>
  );
}