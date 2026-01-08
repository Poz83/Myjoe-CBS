'use client';

import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Audience } from '@/types/domain';

const AUDIENCE_INFO: Record<Audience, { label: string; ages: string; desc: string }> = {
  toddler: { label: 'Toddler', ages: '2-4', desc: 'Simple shapes' },
  children: { label: 'Children', ages: '5-8', desc: 'Moderate detail' },
  tween: { label: 'Tween', ages: '9-12', desc: 'Balanced' },
  teen: { label: 'Teen', ages: '13-17', desc: 'Detailed' },
  adult: { label: 'Adult', ages: '18+', desc: 'Intricate' },
};

interface AudienceSelectorProps {
  selected: Audience[];
  onChange?: (audiences: Audience[]) => void;
  disabled?: boolean;
}

export function AudienceSelector({ selected, onChange, disabled }: AudienceSelectorProps) {
  const toggleAudience = (audience: Audience) => {
    if (disabled) return;
    const isSelected = selected.includes(audience);
    const next = isSelected
      ? selected.filter((a) => a !== audience)
      : [...selected, audience];

    // Ensure at least one remains selected
    if (next.length === 0) return;
    onChange?.(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        <Users className="w-4 h-4 text-blue-300" />
        <span>Target Audience</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {(Object.keys(AUDIENCE_INFO) as Audience[]).map((audience) => {
          const isActive = selected.includes(audience);
          const info = AUDIENCE_INFO[audience];
          return (
            <button
              key={audience}
              onClick={() => toggleAudience(audience)}
              disabled={disabled}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                'bg-white/[0.02] border-white/5 hover:border-white/10 hover:scale-[1.01]',
                isActive && 'border-blue-500/50 ring-1 ring-blue-500/30 bg-blue-500/5',
                disabled && 'opacity-60 cursor-not-allowed'
              )}
            >
              <div className={cn('text-sm font-semibold', isActive ? 'text-blue-200' : 'text-white')}>
                {info.label}
              </div>
              <div className="text-xs text-zinc-400">{info.ages}</div>
              <div className="text-[11px] text-zinc-500 mt-1">{info.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
