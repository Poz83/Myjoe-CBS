import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner, LoadingDots } from '@/components/ui/loading-spinner';

function PageThumbnailSkeleton() {
  return (
    <div className="w-20 h-20 rounded-lg overflow-hidden border border-zinc-800">
      <Skeleton variant="image" className="w-full h-full aspect-square" animation="wave" />
    </div>
  );
}

function ToolbarSkeleton() {
  return (
    <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50">
      <div className="flex items-center gap-4">
        <Skeleton variant="avatar" animation="pulse" />
        <div className="space-y-1">
          <Skeleton variant="title" className="h-5 w-48" animation="wave" />
          <Skeleton variant="text" className="h-3 w-24" animation="fade" />
        </div>
        <Skeleton variant="text" className="h-6 w-16 rounded-full bg-green-500/20" animation="pulse" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton variant="button" className="h-8 w-20" animation="pulse" />
        <Skeleton variant="button" className="h-8 w-24" animation="pulse" />
        <Skeleton variant="button" className="h-8 w-16" animation="pulse" />
      </div>
    </div>
  );
}

function InspectorSkeleton() {
  return (
    <div className="border-l border-zinc-800 p-4 space-y-6">
      <div>
        <Skeleton variant="title" className="h-6 w-32 mb-4" animation="wave" />
        <div className="space-y-3">
          <div className="space-y-2">
            <Skeleton variant="text" className="h-3 w-16" animation="fade" />
            <Skeleton variant="input" animation="pulse" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" className="h-3 w-20" animation="fade" />
            <div className="flex gap-2">
              <Skeleton variant="button" className="h-8 w-12" animation="pulse" />
              <Skeleton variant="button" className="h-8 w-12" animation="pulse" />
              <Skeleton variant="button" className="h-8 w-12" animation="pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" className="h-3 w-24" animation="fade" />
            <Skeleton variant="input" animation="pulse" />
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-4">
        <Skeleton variant="title" className="h-5 w-28 mb-3" animation="wave" />
        <div className="space-y-2">
          <Skeleton variant="text" className="h-4 w-full" animation="fade" />
          <Skeleton variant="text" className="h-4 w-3/4" animation="fade" />
          <Skeleton variant="text" className="h-4 w-1/2" animation="fade" />
        </div>
        <div className="mt-4">
          <Skeleton variant="button" className="h-10 w-full" animation="pulse" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectEditorLoading() {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-zinc-950 to-zinc-900">
      <ToolbarSkeleton />

      {/* Main content area with loading overlay */}
      <div className="flex-1 grid grid-cols-[300px_1fr_360px] overflow-hidden relative">
        {/* Loading overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 p-6 flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" variant="primary" />
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-white">Loading project...</p>
              <p className="text-xs text-zinc-400">Preparing your creative workspace</p>
            </div>
            <LoadingDots size="sm" />
          </div>
        </div>

        {/* Left panel - Page thumbnails */}
        <div className="border-r border-zinc-800 p-4 bg-zinc-950/50">
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="title" className="h-6 w-24" animation="wave" />
            <Skeleton variant="button" className="h-6 w-6 rounded" animation="pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 0.05}s` }}
                className="animate-fade"
              >
                <PageThumbnailSkeleton />
              </div>
            ))}
          </div>
        </div>

        {/* Center panel - Page preview */}
        <div className="flex items-center justify-center p-8 bg-zinc-950">
          <div className="relative">
            <Skeleton
              className="w-full max-w-lg aspect-[3/4] rounded-lg border border-zinc-800"
              animation="wave"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-zinc-900/80 rounded-full p-3">
                <LoadingSpinner size="md" variant="primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - Inspector */}
        <InspectorSkeleton />
      </div>
    </div>
  );
}
