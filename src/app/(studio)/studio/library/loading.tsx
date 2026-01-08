import { Skeleton } from '@/components/ui/skeleton';

function HeroCardSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-3 space-y-2">
        <Skeleton variant="text" className="h-4 w-3/4" />
        <Skeleton variant="text" className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default function LibraryLoading() {
  return (
    <div className="h-full p-6 overflow-auto">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton variant="title" className="h-8 w-32" />
        <Skeleton variant="text" className="h-10 w-32 rounded-lg" />
      </div>

      {/* Heroes grid skeleton */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <HeroCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
