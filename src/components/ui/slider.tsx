'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps {
  value: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  showValue?: boolean;
}

/**
 * Simple single-value slider with a consistent dashboard aesthetic.
 * Accepts an array value to stay compatible with prior usages that expect [number].
 * Uses design tokens for consistent styling.
 */
export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
  showValue = false,
}: SliderProps) {
  const current = Array.isArray(value) && value.length > 0 ? value[0] : min;
  const percentage = ((current - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    onValueChange?.([next]);
  };

  return (
    <div className={cn('w-full flex items-center gap-3', className)}>
      <div className="relative flex-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'w-full h-2 rounded-full appearance-none cursor-pointer',
            'bg-bg-elevated border border-border-subtle',
            // Track fill effect using gradient
            '[&::-webkit-slider-runnable-track]:rounded-full',
            // Thumb styles - using CSS variables for accent color
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-accent-cyan',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg-base',
            '[&::-webkit-slider-thumb]:shadow-sm',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-base',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            // Firefox thumb styles
            '[&::-moz-range-thumb]:appearance-none',
            '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-accent-cyan',
            '[&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-bg-base',
            // Focus styles
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed [&::-webkit-slider-thumb]:cursor-not-allowed'
          )}
          style={{
            background: `linear-gradient(to right, var(--accent-cyan) 0%, var(--accent-cyan) ${percentage}%, var(--bg-elevated) ${percentage}%, var(--bg-elevated) 100%)`,
          }}
        />
      </div>
      {showValue && (
        <span className="text-sm text-text-secondary tabular-nums min-w-[3ch] text-right">
          {current}
        </span>
      )}
    </div>
  );
}
