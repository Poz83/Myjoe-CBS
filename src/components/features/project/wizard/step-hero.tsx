'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, User, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroSelector } from '@/components/features/hero/hero-selector';
import { useHeroes } from '@/hooks/use-heroes';
import { cn } from '@/lib/utils';

interface StepHeroProps {
  heroId: string | null;
  onUpdate: (data: { heroId: string | null }) => void;
}

export function StepHero({ heroId, onUpdate }: StepHeroProps) {
  const router = useRouter();
  const { data: heroes } = useHeroes();
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Get selected hero data for preview
  const selectedHero = heroId && heroes
    ? heroes.find((h) => h.id === heroId)
    : null;

  const handleSkip = () => {
    onUpdate({ heroId: null });
  };

  const handleSelectHero = (selectedHeroId: string | null) => {
    onUpdate({ heroId: selectedHeroId });
  };

  const handleCreateHero = () => {
    router.push('/studio/library/heroes/new');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Add a hero character? (Optional)
        </h2>
        <p className="text-zinc-400 text-sm">
          Choose a main character to appear throughout your coloring book
        </p>
      </div>

      <div className="space-y-4">
        {/* Skip Option */}
        <button
          type="button"
          onClick={handleSkip}
          className={cn(
            'w-full p-6 rounded-lg border-2 transition-all text-left',
            heroId === null
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className={cn(
                'font-semibold mb-1',
                heroId === null ? 'text-white' : 'text-zinc-300'
              )}>
                Skip - No main character
              </h3>
              <p className={cn(
                'text-sm',
                heroId === null ? 'text-zinc-300' : 'text-zinc-500'
              )}>
                Create a coloring book without a recurring character
              </p>
            </div>
          </div>
        </button>

        {/* Selected Hero Preview */}
        {selectedHero && (
          <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-500/10">
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-20 rounded-lg bg-zinc-700 overflow-hidden flex-shrink-0">
                {selectedHero.thumbnailUrl ? (
                  <img
                    src={selectedHero.thumbnailUrl}
                    alt={selectedHero.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-zinc-500" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white">
                  {selectedHero.name}
                </h3>
                <p className="text-sm text-zinc-400 capitalize">
                  {selectedHero.audience} audience
                </p>
                <p className="text-sm text-zinc-500 line-clamp-1 mt-1">
                  {selectedHero.description}
                </p>
              </div>

              {/* Change Button */}
              <Button
                variant="secondary"
                size="sm"
                icon={<Pencil className="w-4 h-4" />}
                onClick={() => setSelectorOpen(true)}
              >
                Change
              </Button>
            </div>
          </div>
        )}

        {/* Choose Hero Section (when no hero selected) */}
        {!selectedHero && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Choose from library
              </h3>
              <Button
                variant="ghost"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleCreateHero}
              >
                Create new hero
              </Button>
            </div>

            {heroes && heroes.length === 0 ? (
              <div className="p-8 bg-zinc-800 rounded-lg border border-zinc-700 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-zinc-500" />
                </div>
                <p className="text-zinc-400 mb-4">No heroes in your library yet</p>
                <Button
                  variant="secondary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleCreateHero}
                >
                  Create your first hero
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                className="w-full py-6"
                onClick={() => setSelectorOpen(true)}
              >
                <User className="w-5 h-5 mr-2" />
                Choose a Hero
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Hero Selector Modal */}
      <HeroSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        selectedHeroId={heroId}
        onSelect={handleSelectHero}
      />
    </div>
  );
}
