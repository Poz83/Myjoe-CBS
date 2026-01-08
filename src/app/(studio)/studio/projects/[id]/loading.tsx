import { Skeleton } from '@/components/ui/skeleton';

function PageThumbnailSkeleton() {
  return (
    <div className="w-20 h-20 rounded-lg overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
  );
}

export default function ProjectEditorLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar skeleton */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Skeleton variant="text" className="h-6 w-6 rounded" />
          <Skeleton variant="text" className="h-5 w-48" />
          <Skeleton variant="text" className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="text" className="h-8 w-24 rounded-lg" />
          <Skeleton variant="text" className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* 3-column layout skeleton */}
      <div className="flex-1 grid grid-cols-[300px_1fr_360px] overflow-hidden">
        {/* Left panel - Page thumbnails */}
        <div className="border-r border-zinc-800 p-4">
          <Skeleton variant="title" className="h-6 w-24 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PageThumbnailSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Center panel - Page preview */}
        <div className="flex items-center justify-center p-8">
          <Skeleton className="w-full max-w-lg aspect-[3/4] rounded-lg" />
        </div>

        {/* Right panel - Inspector */}
        <div className="border-l border-zinc-800 p-4">
          <Skeleton variant="title" className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-3/4" />
            <Skeleton variant="text" className="h-4 w-1/2" />
            <div className="pt-4">
              <Skeleton variant="text" className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
