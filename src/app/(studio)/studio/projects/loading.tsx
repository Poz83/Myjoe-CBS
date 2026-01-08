import { Skeleton } from '@/components/ui/skeleton';
import { LoadingDots } from '@/components/ui/loading-spinner';

function ProjectCardSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors">
      <Skeleton variant="image" className="aspect-[3/4]" animation="wave" />
      <div className="p-4 space-y-3">
        <Skeleton variant="title" className="h-5 w-4/5" animation="fade" />
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-3 w-1/2" animation="fade" />
          <Skeleton variant="text" className="h-3 w-6 rounded-full" animation="fade" />
        </div>
        <div className="flex space-x-2">
          <Skeleton variant="text" className="h-6 w-12 rounded-full" animation="pulse" />
          <Skeleton variant="text" className="h-6 w-16 rounded-full" animation="pulse" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectsLoading() {
  return (
    <div className="h-full p-6 overflow-auto">
      {/* Header with loading indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Skeleton variant="title" className="h-8 w-48" animation="wave" />
          <LoadingDots size="sm" />
        </div>
        <Skeleton variant="button" className="h-10 w-32" animation="pulse" />
      </div>

      {/* Projects grid skeleton with staggered animation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
            className="animate-fade"
          >
            <ProjectCardSkeleton />
          </div>
        ))}
      </div>

      {/* Loading message */}
      <div className="flex items-center justify-center mt-12 space-x-2">
        <LoadingDots size="md" />
        <span className="text-sm text-zinc-400">Loading your projects...</span>
      </div>
    </div>
  );
}
