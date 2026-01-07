'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface StepHeroProps {
  heroId: string | null;
  onUpdate: (data: { heroId: string | null }) => void;
}

export function StepHero({ heroId, onUpdate }: StepHeroProps) {
  // TODO: Fetch heroes from API when endpoint is available
  const heroes: Array<{ id: string; name: string; thumbnail?: string }> = [];

  const handleSkip = () => {
    onUpdate({ heroId: null });
  };

  const handleSelectHero = (selectedHeroId: string) => {
    onUpdate({ heroId: selectedHeroId });
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
          className={`
            w-full p-6 rounded-lg border-2 transition-all text-left
            ${heroId === null
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-semibold mb-1 ${heroId === null ? 'text-white' : 'text-zinc-300'}`}>
                Skip - No main character
              </h3>
              <p className={`text-sm ${heroId === null ? 'text-zinc-300' : 'text-zinc-500'}`}>
                Create a coloring book without a recurring character
              </p>
            </div>
          </div>
        </button>

        {/* Choose from Library */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Choose from library
            </h3>
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                // TODO: Navigate to hero creation page
                console.log('Create new hero');
              }}
            >
              Create new hero
            </Button>
          </div>

          {heroes.length === 0 ? (
            <div className="p-8 bg-zinc-800 rounded-lg border border-zinc-700 text-center">
              <p className="text-zinc-400 mb-4">No heroes in your library yet</p>
              <Button
                variant="secondary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  // TODO: Navigate to hero creation page
                  console.log('Create new hero');
                }}
              >
                Create your first hero
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {heroes.map((hero) => {
                const isSelected = heroId === hero.id;
                return (
                  <button
                    key={hero.id}
                    type="button"
                    onClick={() => handleSelectHero(hero.id)}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                      }
                    `}
                  >
                    {hero.thumbnail ? (
                      <img
                        src={hero.thumbnail}
                        alt={hero.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-full h-24 bg-zinc-700 rounded mb-2 flex items-center justify-center">
                        <span className="text-zinc-500 text-xs">No image</span>
                      </div>
                    )}
                    <p className={`text-sm font-medium text-center ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {hero.name}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
