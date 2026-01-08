'use client';

import { useState, useMemo } from 'react';
import { X, Search, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHeroes } from '@/hooks/use-heroes';
import { cn } from '@/lib/utils';
import type { Database } from '@/lib/supabase/types';

type Hero = Database['public']['Tables']['heroes']['Row'];

interface HeroWithUrls extends Hero {
  thumbnailUrl: string | null;
}

interface HeroSelectorProps {
  open: boolean;
  onClose: () => void;
  selectedHeroId: string | null;
  onSelect: (heroId: string | null) => void;
}

const AUDIENCE_CONFIG = {
  toddler: { label: 'Toddler', className: 'bg-pink-600/20 text-pink-300' },
  children: { label: 'Children', className: 'bg-blue-600/20 text-blue-300' },
  tween: { label: 'Tween', className: 'bg-purple-600/20 text-purple-300' },
  teen: { label: 'Teen', className: 'bg-green-600/20 text-green-300' },
  adult: { label: 'Adult', className: 'bg-orange-600/20 text-orange-300' },
} as const;

type AudienceKey = keyof typeof AUDIENCE_CONFIG;

export function HeroSelector({
  open,
  onClose,
  selectedHeroId,
  onSelect,
}: HeroSelectorProps) {
  const { data: heroes, isLoading } = useHeroes();
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelection, setTempSelection] = useState<string | null>(selectedHeroId);

  // Filter heroes by search query
  const filteredHeroes = useMemo(() => {
    if (!heroes) return [];
    if (!searchQuery.trim()) return heroes;

    const query = searchQuery.toLowerCase();
    return heroes.filter((hero) =>
      hero.name.toLowerCase().includes(query) ||
      hero.description.toLowerCase().includes(query)
    );
  }, [heroes, searchQuery]);

  // Get selected hero data for preview
  const selectedHero = useMemo(() => {
    if (!tempSelection || !heroes) return null;
    return heroes.find((h) => h.id === tempSelection) || null;
  }, [tempSelection, heroes]);

  const handleConfirm = () => {
    onSelect(tempSelection);
    onClose();
  };

  const handleClose = () => {
    setTempSelection(selectedHeroId); // Reset to original
    setSearchQuery('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Select a Hero</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search heroes..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* No Hero Option */}
          <button
            type="button"
            onClick={() => setTempSelection(null)}
            className={cn(
              'w-full p-4 rounded-lg border-2 transition-all text-left',
              tempSelection === null
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center">
                <X className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h3 className={cn(
                  'font-semibold',
                  tempSelection === null ? 'text-white' : 'text-zinc-300'
                )}>
                  No Hero
                </h3>
                <p className={cn(
                  'text-sm',
                  tempSelection === null ? 'text-zinc-300' : 'text-zinc-500'
                )}>
                  Create a coloring book without a recurring character
                </p>
              </div>
              {tempSelection === null && (
                <Check className="w-5 h-5 text-blue-400 ml-auto" />
              )}
            </div>
          </button>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-zinc-800 rounded-lg overflow-hidden">
                  <Skeleton className="aspect-square w-full" variant="image" />
                  <div className="p-2 space-y-1">
                    <Skeleton className="h-4 w-3/4" variant="text" />
                    <Skeleton className="h-3 w-12 rounded-full" variant="text" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredHeroes.length === 0 && heroes && heroes.length === 0 && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-zinc-400 mb-2">No heroes in your library</p>
              <p className="text-sm text-zinc-500">
                Create heroes in the Library to use them in projects
              </p>
            </div>
          )}

          {/* No Search Results */}
          {!isLoading && filteredHeroes.length === 0 && heroes && heroes.length > 0 && (
            <div className="py-8 text-center">
              <p className="text-zinc-400">No heroes match &quot;{searchQuery}&quot;</p>
            </div>
          )}

          {/* Hero Grid */}
          {!isLoading && filteredHeroes.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {filteredHeroes.map((hero) => {
                const isSelected = tempSelection === hero.id;
                const primaryAudience = Array.isArray(hero.audience) ? hero.audience[0] : hero.audience;
                const audienceKey: AudienceKey =
                  primaryAudience && primaryAudience in AUDIENCE_CONFIG
                    ? (primaryAudience as AudienceKey)
                    : 'children';
                const audienceConfig = AUDIENCE_CONFIG[audienceKey];

                return (
                  <button
                    key={hero.id}
                    type="button"
                    onClick={() => setTempSelection(hero.id)}
                    className={cn(
                      'rounded-lg border-2 transition-all overflow-hidden text-left',
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square bg-zinc-700">
                      {hero.thumbnailUrl ? (
                        <img
                          src={hero.thumbnailUrl}
                          alt={hero.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-zinc-500" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2 space-y-1">
                      <p className={cn(
                        'text-sm font-medium line-clamp-1',
                        isSelected ? 'text-white' : 'text-zinc-300'
                      )}>
                        {hero.name}
                      </p>
                      <span className={cn(
                        'inline-block px-1.5 py-0.5 text-xs font-medium rounded-full',
                        audienceConfig.className
                      )}>
                        {audienceConfig.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between gap-4">
            {/* Selected Preview */}
            <div className="flex items-center gap-3 min-w-0">
              {selectedHero ? (
                <>
                  <div className="w-10 h-10 rounded-lg bg-zinc-700 overflow-hidden flex-shrink-0">
                    {selectedHero.thumbnailUrl ? (
                      <img
                        src={selectedHero.thumbnailUrl}
                        alt={selectedHero.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5 text-zinc-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {selectedHero.name}
                    </p>
                    <p className="text-xs text-zinc-400">Selected</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-400">No hero selected</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirm}>
                Confirm Selection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
