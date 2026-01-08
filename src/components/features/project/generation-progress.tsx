'use client';

import { useEffect, useState } from 'react';
import { Sparkles, X, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGenerationJob, useCancelGeneration, type JobItem } from '@/hooks/use-generation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

export function GenerationProgress({
  jobId,
  onComplete,
  onCancel,
}: GenerationProgressProps) {
  const { job, items, isLoading, error } = useGenerationJob(jobId);
  const cancelGeneration = useCancelGeneration();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle job completion
  useEffect(() => {
    if (job?.status === 'completed') {
      const timer = setTimeout(() => {
        onComplete();
      }, 1500); // Small delay to show completion state
      return () => clearTimeout(timer);
    }
  }, [job?.status, onComplete]);

  const handleCancel = async () => {
    await cancelGeneration.mutateAsync(jobId);
    onCancel();
  };

  // Find the currently processing item or the last completed one to show
  const processingItemIndex = items.findIndex(i => i.status === 'processing');
  const lastCompletedIndex = items.findLastIndex(i => i.status === 'completed');
  
  // Determine which image to show in the "hero" spot
  // If processing, show processing placeholder. If recently completed, show that.
  const activeIndex = processingItemIndex !== -1 ? processingItemIndex : 
                      lastCompletedIndex !== -1 ? lastCompletedIndex : 0;
  
  const activeItem = items[activeIndex];

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
      if (activeItem) {
        return `Generating page ${activeIndex + 1} of ${totalItems}...`;
      }
      return `Generating pages... (${completedItems}/${totalItems})`;
    }
    if (job.status === 'failed') return 'Generation failed';
    if (job.status === 'cancelled') return 'Generation cancelled';
    if (job.status === 'completed') return 'All pages created!';
    return 'Processing...';
  };

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-zinc-400 mb-6">{error.message}</p>
          <Button variant="secondary" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Failed state
  if (job?.status === 'failed') {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Couldn't create your pages
          </h2>
          <p className="text-zinc-400 mb-6">
            {job.errorMessage || "Something went wrong while creating your pages."}
          </p>
          <Button variant="secondary" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center space-y-8">
        
        {/* Main Preview Area */}
        <div className="relative w-64 aspect-[3/4] bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col items-center justify-center group">
          {activeItem?.status === 'completed' && activeItem.thumbnailUrl ? (
            <Image
              src={activeItem.thumbnailUrl}
              alt="Generated page"
              fill
              className="object-contain p-4"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-600 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                <Sparkles className="w-12 h-12 text-blue-400 relative z-10 animate-bounce-subtle" />
              </div>
              <p className="text-sm font-medium text-zinc-500">
                {activeItem?.status === 'pending' ? 'Waiting...' : 'Creating magic...'}
              </p>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-zinc-800/80 backdrop-blur border border-zinc-700 text-xs font-medium text-white flex items-center gap-2">
            {activeItem?.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
            {activeItem?.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-green-400" />}
            <span>Page {activeIndex + 1}</span>
          </div>
        </div>

        {/* Status Text & Progress */}
        <div className="w-full text-center space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              {job?.status === 'completed' ? 'Generation Complete!' : 'Creating your book...'}
            </h2>
            <p className="text-zinc-400 flex items-center justify-center gap-2">
              {getStatusText()}
            </p>
          </div>

          <div className="space-y-2 max-w-sm mx-auto">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500 px-1">
               <span>{Math.round(progressPercent)}%</span>
               {job?.status === 'processing' && remainingItems > 0 && (
                 <span>{formatTimeRemaining(secondsRemaining)} left</span>
               )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4">
          {(job?.status === 'pending' || job?.status === 'processing') && (
            <Button
              variant="ghost"
              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={handleCancel}
              disabled={cancelGeneration.isPending}
            >
              Cancel Generation
            </Button>
          )}
          {job?.status === 'completed' && (
             <Button
               className="bg-white text-black hover:bg-zinc-200 min-w-[120px]"
               onClick={onComplete}
             >
               View Pages
             </Button>
          )}
        </div>
      </div>
    </div>
  );
}
