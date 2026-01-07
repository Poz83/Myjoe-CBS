'use client';

import type { Audience } from '@/types/domain';

interface StepAudienceProps {
  audience: Audience | null;
  onUpdate: (data: { audience: Audience }) => void;
}

const AUDIENCE_OPTIONS: Array<{
  value: Audience;
  emoji: string;
  label: string;
  ageRange: string;
  description: string;
}> = [
  {
    value: 'toddler',
    emoji: '👶',
    label: 'Toddler',
    ageRange: 'Ages 2-4',
    description: 'Simple, bold shapes perfect for little hands learning to color.',
  },
  {
    value: 'children',
    emoji: '🧒',
    label: 'Children',
    ageRange: 'Ages 5-8',
    description: 'Fun characters and scenes with moderate detail for developing skills.',
  },
  {
    value: 'tween',
    emoji: '🧑',
    label: 'Tween',
    ageRange: 'Ages 9-12',
    description: 'Engaging designs with balanced complexity for growing artists.',
  },
  {
    value: 'teen',
    emoji: '👩',
    label: 'Teen',
    ageRange: 'Ages 13-17',
    description: 'Detailed illustrations with creative challenges for teens.',
  },
  {
    value: 'adult',
    emoji: '🎨',
    label: 'Adult',
    ageRange: 'Ages 18+',
    description: 'Intricate patterns and sophisticated designs for relaxation and creativity.',
  },
];

export function StepAudience({ audience, onUpdate }: StepAudienceProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Who is this book for?
        </h2>
        <p className="text-zinc-400 text-sm">
          Select the target age group for your coloring book
        </p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {AUDIENCE_OPTIONS.map((option) => {
          const isSelected = audience === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onUpdate({ audience: option.value })}
              className={`
                flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                }
              `}
            >
              <span className="text-4xl mb-2">{option.emoji}</span>
              <span className={`font-semibold mb-1 ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                {option.label}
              </span>
              <span className={`text-xs ${isSelected ? 'text-blue-300' : 'text-zinc-500'}`}>
                {option.ageRange}
              </span>
            </button>
          );
        })}
      </div>

      {audience && (
        <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
          <p className="text-sm text-zinc-300">
            {AUDIENCE_OPTIONS.find((opt) => opt.value === audience)?.description}
          </p>
        </div>
      )}
    </div>
  );
}
