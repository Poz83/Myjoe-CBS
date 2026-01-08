'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface IdeaBoxProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

export function IdeaBox({
  value,
  onChange,
  onGenerate,
  isGenerating = false,
  disabled = false,
  maxLength = 500,
}: IdeaBoxProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value.slice(0, maxLength);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const canGenerate = localValue.trim().length >= 3 && !isGenerating && !disabled;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-400" />
        <label className="text-sm font-medium text-zinc-200">Idea Box</label>
      </div>

      <textarea
        value={localValue}
        onChange={handleChange}
        disabled={disabled || isGenerating}
        placeholder="Describe your coloring book theme... (e.g., 'Cute animals in a magical forest')"
        className={cn(
          'w-full min-h-[120px] px-4 py-3 bg-zinc-800/30 border border-zinc-700 rounded-lg',
          'text-sm text-zinc-200 placeholder-zinc-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
          'resize-y transition-colors',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        maxLength={maxLength}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {localValue.length} / {maxLength} characters
        </span>
      </div>

      <Button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Pages...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate All Pages
          </>
        )}
      </Button>

      {localValue.trim().length < 3 && (
        <p className="text-xs text-zinc-500 text-center">
          Enter at least 3 characters to generate pages
        </p>
      )}
    </div>
  );
}
