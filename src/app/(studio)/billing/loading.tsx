import { Skeleton } from '@/components/ui/skeleton';

export default function BillingLoading() {
  return (
    <div className="min-h-full p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <Skeleton variant="text" className="h-8 w-8 rounded" />
          <Skeleton variant="title" className="h-8 w-24" />
        </div>

        <div className="space-y-8">
          {/* Current Plan Card skeleton */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton variant="title" className="h-6 w-32" />
                  <Skeleton variant="text" className="h-4 w-24" />
                </div>
              </div>
              <Skeleton variant="text" className="h-8 w-20 rounded-lg" />
            </div>

            {/* Blot balance skeleton */}
            <div className="p-4 bg-zinc-800/50 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton variant="text" className="h-4 w-28" />
                <Skeleton variant="text" className="h-8 w-16" />
              </div>
              <Skeleton variant="text" className="h-3 w-48 mb-3" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            {/* Storage skeleton */}
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Skeleton variant="text" className="h-4 w-24" />
                <Skeleton variant="text" className="h-4 w-32" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>

          {/* Plans section skeleton */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <Skeleton variant="title" className="h-6 w-40 mb-2" />
            <Skeleton variant="text" className="h-4 w-64 mb-6" />
            
            {/* Tier buttons skeleton */}
            <div className="flex gap-2 mb-4">
              <Skeleton variant="text" className="h-8 w-20 rounded-lg" />
              <Skeleton variant="text" className="h-8 w-20 rounded-lg" />
            </div>

            {/* Interval toggle skeleton */}
            <div className="flex items-center gap-3 mb-6">
              <Skeleton variant="text" className="h-4 w-16" />
              <Skeleton className="h-6 w-11 rounded-full" />
              <Skeleton variant="text" className="h-4 w-24" />
            </div>

            {/* Dropdown skeleton */}
            <Skeleton className="h-12 w-full rounded-lg mb-6" />

            {/* Features skeleton */}
            <div className="p-4 bg-zinc-800/30 rounded-lg mb-6">
              <Skeleton variant="text" className="h-4 w-32 mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="text" className="h-4 w-3/4" />
                ))}
              </div>
            </div>

            {/* Button skeleton */}
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
