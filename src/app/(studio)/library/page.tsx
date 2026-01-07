'use client';

import { useRouter } from 'next/navigation';
import { Plus, User } from 'lucide-react';
import { useHeroes, useDeleteHero } from '@/hooks/use-heroes';
import { HeroCard, HeroCardSkeleton } from '@/components/features/hero/hero-card';
import { Button } from '@/components/ui/button';

export default function LibraryPage() {
  const router = useRouter();
  const { data: heroes, isLoading, error } = useHeroes();
  const deleteHero = useDeleteHero();

  const handleCreateHero = () => {
    router.push('/library/heroes/new');
  };

  const handleDelete = (heroId: string) => {
    deleteHero.mutate(heroId);
  };

  const handleHeroClick = (heroId: string) => {
    // For now, just navigate to details (can be expanded later)
    // router.push(`/library/heroes/${heroId}`);
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
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No heroes yet</h2>
          <p className="text-zinc-400 mb-6 text-center max-w-md">
            Create your first hero character. Heroes are reusable characters that can appear across multiple coloring book projects.
          </p>
          <Button onClick={handleCreateHero} variant="primary" icon={<Plus className="w-4 h-4" />}>
            Create Your First Hero
          </Button>
        </div>
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
