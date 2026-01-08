'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageEditor } from '@/components/features/editor/page-editor';
import { usePageDetail } from '@/hooks/use-page-editor';

export default function PageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const pageId = params.pageId as string;

  const { data, isLoading, error } = usePageDetail(pageId);

  const handleBack = () => {
    router.push(`/studio/projects/${projectId}`);
  };

  // Error state
  if (error) {
    return (
      <div className="h-screen flex flex-col bg-zinc-950">
        <header className="flex items-center gap-4 px-4 h-14 border-b border-zinc-800 bg-zinc-900">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-400">{error.message || "Couldn't load page"}</p>
        </div>
      </div>
    );
  }

  const page = data?.page || null;
  const versions = data?.versions || [];
  const imageUrl = data?.imageUrl || null;
  const thumbnailUrls = data?.thumbnailUrls || {};
  const totalVersions = versions.length;
  const currentVersion = page?.current_version || 1;

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div className="h-6 w-px bg-zinc-700" />
          <h1 className="text-lg font-semibold text-white">
            {isLoading ? 'Loading...' : `Page ${(page?.sort_order || 0) + 1}`}
          </h1>
        </div>
        <div className="text-sm text-zinc-400">
          {!isLoading && totalVersions > 0 && (
            <span>Version {currentVersion} of {totalVersions}</span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <PageEditor
          page={page}
          versions={versions}
          imageUrl={imageUrl}
          thumbnailUrls={thumbnailUrls}
          projectId={projectId}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
