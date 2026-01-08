'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProject } from '@/hooks/use-projects';
import { useLoading } from '@/components/ui/loading-provider';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();
  const { startLoading, stopLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const hasCreatedRef = useRef(false);

  const createAndOpen = useCallback(async () => {
    setError(null);
    startLoading('Creating your coloring book project...');

    try {
      const project = await createProject.mutateAsync({
        name: 'Untitled Project',
        pageCount: 20,
        audience: ['children'],
        stylePreset: 'bold-simple',
        trimSize: '8.5x11',
        heroId: null,
      });

      stopLoading();
      router.replace(`/studio/projects/${project.id}`);
    } catch (e) {
      stopLoading();
      hasCreatedRef.current = false; // allow retry
      setError(e instanceof Error ? e.message : 'Failed to create project');
    }
  }, [createProject, router, startLoading, stopLoading]);

  useEffect(() => {
    // Prevent double-create in React StrictMode (dev)
    if (hasCreatedRef.current) return;
    hasCreatedRef.current = true;
    void createAndOpen();
  }, [createAndOpen]);

  return (
    <div className="h-full flex items-center justify-center p-8 bg-bg-base">
      {error ? (
        <div className="w-full max-w-md bg-bg-surface rounded-xl border border-border-subtle p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-10 h-10 rounded-full bg-error-muted flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-error" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h1 className="text-heading text-text-primary">Couldn&apos;t create your project</h1>
              <p className="text-sm text-text-secondary mt-1">{error}</p>
              <div className="mt-5 flex gap-3">
                <Button
                  variant="primary"
                  onClick={createAndOpen}
                  icon={<RefreshCcw className="w-4 h-4" />}
                  loading={createProject.isPending}
                >
                  Retry
                </Button>
                <Button variant="ghost" onClick={() => router.push('/studio/projects')}>
                  Back to Projects
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" variant="accent" />
          <p className="text-sm text-text-muted animate-pulse">Creating your project…</p>
        </div>
      )}
    </div>
  );
}
