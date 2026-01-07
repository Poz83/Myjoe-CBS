'use client';

import { Check } from 'lucide-react';
import type { StylePreset } from '@/types/domain';

interface StepStyleProps {
  stylePreset: StylePreset | null;
  onUpdate: (data: { stylePreset: StylePreset }) => void;
}

const STYLE_OPTIONS: Array<{
  value: StylePreset;
  name: string;
  description: string;
}> = [
  {
    value: 'bold-simple',
    name: 'Bold & Simple',
    description: 'Clean lines and strong shapes for easy coloring.',
  },
  {
    value: 'kawaii',
    name: 'Kawaii Cute',
    description: 'Adorable characters with big eyes and cheerful expressions.',
  },
  {
    value: 'whimsical',
    name: 'Whimsical Fantasy',
    description: 'Magical creatures and dreamy scenes full of wonder.',
  },
  {
    value: 'cartoon',
    name: 'Cartoon Classic',
    description: 'Playful and expressive characters in classic cartoon style.',
  },
  {
    value: 'botanical',
    name: 'Nature Botanical',
    description: 'Beautiful flowers, plants, and natural patterns.',
  },
];

export function StepStyle({ stylePreset, onUpdate }: StepStyleProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Choose your style
        </h2>
        <p className="text-zinc-400 text-sm">
          Select a visual style for your coloring book
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STYLE_OPTIONS.map((option) => {
          const isSelected = stylePreset === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onUpdate({ stylePreset: option.value })}
              className={`
                relative p-6 rounded-lg border-2 transition-all text-left
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                }
              `}
            >
              {/* Placeholder for sample image */}
              <div className="w-full h-32 bg-zinc-700 rounded mb-4 flex items-center justify-center">
                <span className="text-zinc-500 text-sm">Sample Image</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                    {option.name}
                  </h3>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <p className={`text-sm ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
