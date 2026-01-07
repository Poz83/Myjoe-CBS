'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StepBasicsProps {
  name: string;
  pageCount: number;
  onUpdate: (data: { name?: string; pageCount?: number }) => void;
}

const PAGE_PRESETS = [20, 30, 40] as const;

export function StepBasics({ name, pageCount, onUpdate }: StepBasicsProps) {
  const [customPageCount, setCustomPageCount] = useState<string>('');
  const [useCustom, setUseCustom] = useState(false);

  const handlePresetClick = (preset: number) => {
    setUseCustom(false);
    setCustomPageCount('');
    onUpdate({ pageCount: preset });
  };

  const handleCustomChange = (value: string) => {
    setCustomPageCount(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= 45) {
      onUpdate({ pageCount: num });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Name your coloring book
        </h2>
        <p className="text-zinc-400 text-sm">
          Choose a name that describes your project
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="project-name" className="block text-sm font-medium text-zinc-300">
          Project Name
        </label>
        <Input
          id="project-name"
          type="text"
          placeholder="My Amazing Coloring Book"
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          maxLength={100}
          required
        />
        <p className="text-xs text-zinc-500">
          {name.length}/100 characters
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-300">
          Number of Pages
        </label>
        
        <div className="flex gap-3">
          {PAGE_PRESETS.map((preset) => (
            <Button
              key={preset}
              variant={pageCount === preset && !useCustom ? 'primary' : 'secondary'}
              onClick={() => handlePresetClick(preset)}
              className="flex-1"
            >
              {preset} pages
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            variant={useCustom ? 'primary' : 'ghost'}
            onClick={() => {
              setUseCustom(true);
              setCustomPageCount(pageCount.toString());
            }}
            className="w-full"
          >
            Custom
          </Button>

          {useCustom && (
            <div className="space-y-2">
              <Input
                type="number"
                min={1}
                max={45}
                placeholder="Enter page count (1-45)"
                value={customPageCount}
                onChange={(e) => handleCustomChange(e.target.value)}
              />
              <p className="text-xs text-zinc-500">
                Range: 1-45 pages
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
