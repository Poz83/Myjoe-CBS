'use client';

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LineThicknessSelectorProps {
  value: number | null; // pts (2-8), null means auto
  auto: boolean;
  onChange: (value: number | null, auto: boolean) => void;
  disabled?: boolean;
}

const THICKNESS_PRESETS = [
  { value: 2, label: 'Fine', description: 'Delicate lines, intricate details' },
  { value: 4, label: 'Medium', description: 'Balanced detail' },
  { value: 6, label: 'Thick', description: 'Bold, chunky shapes' },
] as const;

const THICKNESS_EXAMPLES = {
  2: 'Fine lines perfect for intricate patterns and detailed illustrations',
  4: 'Medium lines ideal for balanced compositions',
  6: 'Thick lines great for bold, simple shapes',
  8: 'Extra thick lines for maximum simplicity',
} as const;

export function LineThicknessSelector({
  value,
  auto,
  onChange,
  disabled = false,
}: LineThicknessSelectorProps) {
  const [localValue, setLocalValue] = useState<number>(value ?? 4);
  const [localAuto, setLocalAuto] = useState(auto);

  const handleAutoToggle = (checked: boolean) => {
    setLocalAuto(checked);
    onChange(checked ? null : localValue, checked);
  };

  const handlePresetClick = (presetValue: number) => {
    setLocalValue(presetValue);
    setLocalAuto(false);
    onChange(presetValue, false);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setLocalValue(newValue);
    setLocalAuto(false);
    onChange(newValue, false);
  };

  return (
    <div className="space-y-4">
      {/* Auto Checkbox */}
      <label className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700 hover:border-zinc-600 cursor-pointer transition-colors group">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative">
            <input
              type="checkbox"
              checked={localAuto}
              onChange={(e) => handleAutoToggle(e.target.checked)}
              disabled={disabled}
              className="sr-only"
            />
            <div
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                localAuto
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-zinc-800 border-zinc-600 group-hover:border-zinc-500'
              )}
            >
              {localAuto && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-zinc-200">Auto-detect</span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              AI chooses optimal thickness based on audience and idea
            </p>
          </div>
        </div>
      </label>

      {/* Manual Controls */}
      {!localAuto && (
        <div className="space-y-3">
          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {THICKNESS_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                disabled={disabled}
                className={cn(
                  'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                  localValue === preset.value
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                    : 'bg-zinc-800/30 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                )}
              >
                <div className="font-semibold">{preset.label}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{preset.value}pt</div>
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>2pt (Fine)</span>
              <span className="font-medium text-zinc-300">{localValue}pt</span>
              <span>8pt (Thick)</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={localValue}
              onChange={handleSliderChange}
              disabled={disabled}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Example Description */}
          {THICKNESS_EXAMPLES[localValue as keyof typeof THICKNESS_EXAMPLES] && (
            <p className="text-xs text-zinc-500 italic">
              {THICKNESS_EXAMPLES[localValue as keyof typeof THICKNESS_EXAMPLES]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
