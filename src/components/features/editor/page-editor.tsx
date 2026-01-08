'use client';

import { useState, useCallback } from 'react';
import {
  Sparkles,
  Edit3,
  Minimize2,
  Plus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionItem, AccordionHeader, AccordionContent } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { EditCanvas } from './edit-canvas';
import { useEditPage, useRestoreVersion, type EditPageError } from '@/hooks/use-page-editor';
import { BLOT_COSTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { PageWithVersions, PageVersion } from '@/server/db/pages';

// ============================================================================
// Types
// ============================================================================

interface PageEditorProps {
  page: PageWithVersions | null;
  versions: PageVersion[];
  imageUrl: string | null;
  thumbnailUrls: Record<number, string>;
  projectId: string;
  isLoading?: boolean;
}

type Mode = 'view' | 'edit';

const PAGE_TYPE_LABELS: Record<string, string> = {
  illustration: 'Illustration',
  'text-focus': 'Text Focus',
  pattern: 'Pattern',
  educational: 'Educational',
};

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];

// ============================================================================
// Component
// ============================================================================

export function PageEditor({
  page,
  versions,
  imageUrl,
  thumbnailUrls,
  projectId,
  isLoading,
}: PageEditorProps) {
  // State
  const [mode, setMode] = useState<Mode>('view');
  const [zoom, setZoom] = useState(100);
  const [previewVersion, setPreviewVersion] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [pendingMask, setPendingMask] = useState<string | null>(null);
  const [editError, setEditError] = useState<EditPageError | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Hooks
  const editPage = useEditPage();
  const restoreVersion = useRestoreVersion();

  // Derived state
  const currentVersion = page?.current_version || 1;
  const displayVersion = previewVersion || currentVersion;
  const displayUrl = previewVersion
    ? thumbnailUrls[previewVersion] || imageUrl
    : imageUrl;
  const isViewingOldVersion = previewVersion !== null && previewVersion !== currentVersion;

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  }, [zoom]);

  const handleFitToScreen = useCallback(() => {
    setZoom(100);
  }, []);

  // Action handlers
  const handleAction = useCallback(async (type: 'regenerate' | 'simplify' | 'add_detail') => {
    if (!page) return;

    setActiveAction(type);
    setEditError(null);

    try {
      await editPage.mutateAsync({
        pageId: page.id,
        projectId,
        type: type === 'add_detail' ? 'quick_action' : type === 'simplify' ? 'quick_action' : 'regenerate',
        prompt: type === 'simplify' ? 'Simplify this image, reduce complexity' :
                type === 'add_detail' ? 'Add more detail and complexity to this image' : undefined,
      });
    } catch (err) {
      setEditError(err as EditPageError);
    } finally {
      setActiveAction(null);
    }
  }, [page, projectId, editPage]);

  const handleEditMode = useCallback(() => {
    setMode('edit');
    setEditPrompt('');
    setEditError(null);
    setPendingMask(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setMode('view');
    setEditPrompt('');
    setEditError(null);
    setPendingMask(null);
  }, []);

  const handleMaskCreate = useCallback((maskDataUrl: string) => {
    setPendingMask(maskDataUrl);
  }, []);

  const handleApplyEdit = useCallback(async () => {
    if (!page || !pendingMask) return;

    setActiveAction('inpaint');
    setEditError(null);

    try {
      await editPage.mutateAsync({
        pageId: page.id,
        projectId,
        type: 'inpaint',
        prompt: editPrompt || 'Edit this area',
        maskDataUrl: pendingMask,
      });
      setMode('view');
      setPendingMask(null);
      setEditPrompt('');
    } catch (err) {
      setEditError(err as EditPageError);
    } finally {
      setActiveAction(null);
    }
  }, [page, projectId, pendingMask, editPrompt, editPage]);

  const handleRestoreVersion = useCallback(async () => {
    if (!page || previewVersion === null) return;

    try {
      await restoreVersion.mutateAsync({
        pageId: page.id,
        projectId,
        version: previewVersion,
      });
      setPreviewVersion(null);
    } catch {
      // Error handled by mutation
    }
  }, [page, projectId, previewVersion, restoreVersion]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex items-center justify-center bg-zinc-950">
          <Skeleton variant="image" className="w-96 h-[512px]" />
        </div>
        <div className="w-[360px] bg-zinc-900 border-l border-zinc-800 p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // Empty state
  if (!page) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-950">
        <p className="text-zinc-400">Page not found</p>
      </div>
    );
  }

  // Edit mode
  if (mode === 'edit' && imageUrl) {
    return (
      <div className="flex flex-col h-full bg-zinc-950">
        {/* Edit canvas */}
        <div className="flex-1">
          <EditCanvas
            imageUrl={imageUrl}
            onMaskCreate={handleMaskCreate}
            onCancel={handleCancelEdit}
          />
        </div>

        {/* Bottom bar with prompt and actions */}
        {pendingMask && (
          <div className="flex-shrink-0 p-4 bg-zinc-900 border-t border-zinc-800 space-y-3">
            {/* Safety error */}
            {editError?.blocked && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">
                    This content isn't suitable: {editError.blocked.join(', ')}
                  </p>
                  {editError.suggestions && editError.suggestions.length > 0 && (
                    <p className="text-xs text-zinc-400 mt-1">
                      Try: {editError.suggestions.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Prompt input */}
            <div className="flex items-center gap-3">
              <Input
                placeholder="Describe your edit..."
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                className={cn(
                  'flex-1',
                  editError?.blocked && 'border-red-500 focus:border-red-500'
                )}
              />
              <Button
                variant="secondary"
                onClick={handleCancelEdit}
                disabled={activeAction === 'inpaint'}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleApplyEdit}
                loading={activeAction === 'inpaint'}
              >
                Apply Edit ({BLOT_COSTS.editPage} Blots)
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // View mode
  return (
    <div className="flex h-full">
      {/* Center - Image preview */}
      <div className="flex-1 flex flex-col bg-zinc-950">
        {/* Zoom controls */}
        <div className="flex items-center justify-center gap-2 p-2 bg-zinc-900/50 border-b border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom === ZOOM_LEVELS[0]}
            icon={<ZoomOut className="w-4 h-4" />}
          />
          <span className="text-sm text-zinc-400 w-12 text-center">{zoom}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            icon={<ZoomIn className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFitToScreen}
            icon={<Maximize2 className="w-4 h-4" />}
          />
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-4">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={`Page ${page.sort_order + 1}`}
              style={{
                width: `${zoom}%`,
                maxWidth: 'none',
              }}
              className="object-contain transition-all duration-200"
            />
          ) : (
            <div className="w-64 h-80 bg-zinc-800 rounded-lg flex items-center justify-center">
              <p className="text-zinc-500">No image yet</p>
            </div>
          )}
        </div>

        {/* Version preview bar */}
        {isViewingOldVersion && (
          <div className="flex items-center justify-center gap-3 p-3 bg-amber-500/10 border-t border-amber-500/30">
            <span className="text-sm text-amber-400">
              Viewing version {previewVersion} (current: {currentVersion})
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPreviewVersion(null)}
            >
              Back to Current
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRestoreVersion}
              loading={restoreVersion.isPending}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Restore This Version
            </Button>
          </div>
        )}
      </div>

      {/* Right - Inspector */}
      <div className="w-[360px] flex flex-col bg-zinc-900 border-l border-zinc-800">
        <div className="flex-1 overflow-y-auto">
          <Accordion defaultValue="scene" className="border-0">
            {/* Scene Section */}
            <AccordionItem value="scene">
              <AccordionHeader>Scene</AccordionHeader>
              <AccordionContent>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Description
                    </label>
                    <p className="text-sm text-zinc-300">
                      {page.scene_brief || 'No scene description yet'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Page Type
                    </label>
                    <span className="inline-block px-2 py-1 bg-zinc-800 rounded text-xs font-medium text-zinc-300">
                      {PAGE_TYPE_LABELS[page.page_type] || page.page_type}
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Actions Section */}
            <AccordionItem value="actions">
              <AccordionHeader>Actions</AccordionHeader>
              <AccordionContent>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full justify-between"
                    onClick={() => handleAction('regenerate')}
                    disabled={!!activeAction}
                    icon={activeAction === 'regenerate' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  >
                    <span>Regenerate</span>
                    <span className="text-xs text-zinc-400">
                      {BLOT_COSTS.regeneratePage} Blots
                    </span>
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-between"
                    onClick={handleEditMode}
                    disabled={!!activeAction || !imageUrl}
                    icon={<Edit3 className="w-4 h-4" />}
                  >
                    <span>Edit</span>
                    <span className="text-xs text-zinc-400">
                      {BLOT_COSTS.editPage} Blots
                    </span>
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-between"
                    onClick={() => handleAction('simplify')}
                    disabled={!!activeAction}
                    icon={activeAction === 'simplify' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Minimize2 className="w-4 h-4" />
                    )}
                  >
                    <span>Simplify</span>
                    <span className="text-xs text-zinc-400">
                      {BLOT_COSTS.editPage} Blots
                    </span>
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-between"
                    onClick={() => handleAction('add_detail')}
                    disabled={!!activeAction}
                    icon={activeAction === 'add_detail' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  >
                    <span>Add Detail</span>
                    <span className="text-xs text-zinc-400">
                      {BLOT_COSTS.editPage} Blots
                    </span>
                  </Button>
                </div>

                {/* Action error */}
                {editError && !editError.blocked && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400">{editError.error}</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Versions Section */}
            <AccordionItem value="versions">
              <AccordionHeader>Versions</AccordionHeader>
              <AccordionContent>
                <div className="space-y-2">
                  {/* Version thumbnails */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {versions.map((version) => {
                      const isCurrentVersion = version.version === currentVersion;
                      const isSelected = version.version === displayVersion;
                      const thumbUrl = thumbnailUrls[version.version];

                      return (
                        <button
                          key={version.id}
                          onClick={() => setPreviewVersion(
                            version.version === currentVersion ? null : version.version
                          )}
                          className={cn(
                            'flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all',
                            isSelected && 'border-blue-500',
                            !isSelected && 'border-zinc-700 hover:border-zinc-500'
                          )}
                        >
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt={`Version ${version.version}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                              <span className="text-xs text-zinc-500">v{version.version}</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {versions.length === 0 && (
                    <p className="text-xs text-zinc-500 text-center py-2">
                      No versions yet
                    </p>
                  )}

                  {versions.length > 0 && (
                    <p className="text-xs text-zinc-500 text-center">
                      Click a version to preview
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-zinc-800">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => handleAction('regenerate')}
            disabled={!!activeAction}
            loading={activeAction === 'regenerate'}
          >
            Generate Page
          </Button>
        </div>
      </div>
    </div>
  );
}
