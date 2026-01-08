import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="h-full w-full relative">
      {/* Top progress bar (indeterminate) */}
      <div className="sticky top-0 z-40">
        <div className="h-[3px] w-full bg-white/5 overflow-hidden">
          <div className="relative h-full studio-indeterminate-bar" />
        </div>
      </div>

      {/* Minimal, themed skeleton surface */}
      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <Skeleton variant="title" className="w-64" />
          <Skeleton variant="text" className="w-96 max-w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton variant="card" className="h-40 bg-zinc-900/50" />
          <Skeleton variant="card" className="h-40 bg-zinc-900/50" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="image" className="bg-zinc-900/50" />
          ))}
        </div>
      </div>
    </div>
  );
}

