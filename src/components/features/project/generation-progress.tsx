'use client';

import { useEffect } from 'react';
import { Sparkles, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGenerationJob, useCancelGeneration, type JobItem } from '@/hooks/use-generation';
import { cn } from '@/lib/utils';

interface GenerationProgressProps {
  jobId: string;
  onComplete: () => void;
  onCancel: () => void;
}

// Estimate ~10 seconds per page
const SECONDS_PER_PAGE = 10;

function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `~${Math.ceil(seconds)} seconds`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `~${minutes} minute${minutes > 1 ? 's' : ''}`;
}

function ThumbnailItem({ item }: { item: JobItem }) {
  const isCompleted = item.status === 'completed';
  const isFailed = item.status === 'failed';
  const isProcessing = item.status === 'processing';

  return (
    <div
      className={cn(
        'relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all',
        isCompleted && 'border-green-500/50',
        isFailed && 'border-red-500/50',
        isProcessing && 'border-blue-500/50 animate-pulse',
        !isCompleted && !isFailed && !isProcessing && 'border-zinc-700'
      )}
    >
      {isCompleted && item.thumbnailUrl ? (
        <img
          src={item.thumbnailUrl}
          alt="Generated page"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
          {isProcessing && (
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          )}
          {isFailed && (
            <AlertCircle className="w-6 h-6 text-red-400" />
          )}
          {!isProcessing && !isFailed && (
            <div className="w-8 h-8 rounded-full bg-zinc-700" />
          )}
        </div>
      )}

      {/* Status overlay */}
      {isCompleted && (
        <div className="absolute top-1 right-1">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        </div>
      )}
    </div>
  );
}

export function GenerationProgress({
  jobId,
  onComplete,
  onCancel,
}: GenerationProgressProps) {
  const { job, items, isLoading, error } = useGenerationJob(jobId);
  const cancelGeneration = useCancelGeneration();

  // Handle job completion
  useEffect(() => {
    if (job?.status === 'completed') {
      onComplete();
    }
  }, [job?.status, onComplete]);

  const handleCancel = async () => {
    await cancelGeneration.mutateAsync(jobId);
    onCancel();
  };

  // Calculate progress
  const totalItems = job?.totalItems || 0;
  const completedItems = job?.completedItems || 0;
  const failedItems = job?.failedItems || 0;
  const processedItems = completedItems + failedItems;
  const progressPercent = totalItems > 0 ? (processedItems / totalItems) * 100 : 0;

  // Calculate time remaining
  const remainingItems = totalItems - processedItems;
  const secondsRemaining = remainingItems * SECONDS_PER_PAGE;

  // Determine status text
  const getStatusText = () => {
    if (!job) return 'Starting...';
    if (job.status === 'pending') return 'Preparing generation...';
    if (job.status === 'processing') {
      const processingItem = items.find(i => i.status === 'processing');
      if (processingItem) {
        const itemIndex = items.indexOf(processingItem) + 1;
        return `Generating page ${itemIndex} of ${totalItems}...`;
      }
      return `Generating pages... (${completedItems}/${totalItems})`;
    }
    if (job.status === 'failed') return 'Generation failed';
    if (job.status === 'cancelled') return 'Generation cancelled';
    return 'Processing...';
  };

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-zinc-400 mb-6">{error.message}</p>
          <Button variant="secondary" onClick={onCancel}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Failed state
  if (job?.status === 'failed') {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Couldn't create your pages
          </h2>
          <p className="text-zinc-400 mb-6">
            {job.errorMessage || "Something went wrong while creating your pages."}
          </p>
          <Button variant="secondary" onClick={onCancel}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Generating your coloring book...
          </h1>
          <p className="text-zinc-400">{getStatusText()}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">
              {completedItems} of {totalItems} pages
            </span>
            <span className="text-zinc-400">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-4 gap-3">
          {isLoading || items.length === 0 ? (
            // Loading skeletons
            Array.from({ length: Math.min(totalItems || 8, 12) }).map((_, i) => (
              <Skeleton key={i} variant="image" className="aspect-[3/4]" />
            ))
          ) : (
            // Actual items (show first 12)
            items.slice(0, 12).map((item) => (
              <ThumbnailItem key={item.id} item={item} />
            ))
          )}
        </div>

        {/* Show more indicator */}
        {items.length > 12 && (
          <p className="text-center text-sm text-zinc-500">
            +{items.length - 12} more pages
          </p>
        )}

        {/* Time Remaining */}
        {job?.status === 'processing' && remainingItems > 0 && (
          <p className="text-center text-sm text-zinc-500">
            {formatTimeRemaining(secondsRemaining)} remaining
          </p>
        )}

        {/* Failed Items Warning */}
        {failedItems > 0 && (
          <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{failedItems} page{failedItems > 1 ? 's' : ''} couldn't be created</span>
          </div>
        )}

        {/* Cancel Button */}
        {(job?.status === 'pending' || job?.status === 'processing') && (
          <div className="flex justify-center">
            <Button
              variant="danger"
              onClick={handleCancel}
              loading={cancelGeneration.isPending}
              icon={<X className="w-4 h-4" />}
            >
              Cancel Generation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
