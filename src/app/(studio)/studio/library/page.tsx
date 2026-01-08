'use client';

import { useRouter } from 'next/navigation';
import { Plus, User } from 'lucide-react';
import { useHeroes, useDeleteHero } from '@/hooks/use-heroes';
import { HeroCard, HeroCardSkeleton } from '@/components/features/hero/hero-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function LibraryPage() {
  const router = useRouter();
  const { data: heroes, isLoading, error } = useHeroes();
  const deleteHero = useDeleteHero();

  const handleCreateHero = () => {
    router.push('/studio/library/heroes/new');
  };

  const handleDelete = (heroId: string) => {
    deleteHero.mutate(heroId);
  };

  const handleHeroClick = (heroId: string) => {
    // For now, just navigate to details (can be expanded later)
    // router.push(`/studio/library/heroes/${heroId}`);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-red-400">Failed to load heroes</p>
          <p className="text-sm text-zinc-400">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">My Heroes</h1>
        <Button onClick={handleCreateHero} variant="primary" icon={<Plus className="w-4 h-4" />}>
          Create Hero
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <HeroCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!heroes || heroes.length === 0) && (
        <EmptyState
          icon={User}
          title="No heroes yet"
          description="Create your first hero character. Heroes are reusable characters that can appear across multiple coloring book projects."
          action={{ label: 'Create Your First Hero', onClick: handleCreateHero }}
        />
      )}

      {/* Heroes grid */}
      {!isLoading && heroes && heroes.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {heroes.map((hero) => (
            <HeroCard
              key={hero.id}
              hero={hero}
              onDelete={handleDelete}
              onClick={handleHeroClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
