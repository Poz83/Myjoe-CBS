'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Image as ImageIcon, Expand, Sparkles, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreativeToolbar, QuickActionBar } from '@/components/studio/creative-toolbar';
import { ThumbnailLightbox } from '@/components/studio/thumbnail-lightbox';
import { cn } from '@/lib/utils';
import type { Database } from '@/lib/supabase/types';

type Page = Database['public']['Tables']['pages']['Row'];

// PageVersion type (may be added to DB types later)
interface PageVersion {
  id: string;
  page_id: string;
  version: number;
  asset_key: string;
  thumbnail_key?: string;
  compiled_prompt?: string;
  edit_type: 'initial' | 'regenerate' | 'inpaint' | 'quick_action';
  edit_prompt?: string;
  edit_mask_key?: string;
  blots_spent: number;
  quality_score?: number;
  created_at: string;
}

interface PagePreviewProps {
  page: Page | null;
  pageVersions?: PageVersion[];
  imageUrl?: string | null;
  onGeneratePages?: () => void;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onSimplify?: () => void;
  onAddDetail?: () => void;
  onExport?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  isGenerating?: boolean;
  blotBalance?: number;
  styleReady?: boolean;
  showToolbar?: boolean;
}

const MIN_ZOOM = 25;
const MAX_ZOOM = 200;
const ZOOM_STEP = 25;

export function PagePreview({
  page,
  pageVersions,
  imageUrl,
  onGeneratePages,
  onRegenerate,
  onEdit,
  onSimplify,
  onAddDetail,
  onExport,
  onDuplicate,
  onDelete,
  isGenerating = false,
  blotBalance = 0,
  styleReady = true,
  showToolbar = true,
}: PagePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  // Handle zoom change
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(Math.max(MIN_ZOOM, Math.min(newZoom, MAX_ZOOM)));
  }, []);

  // Fit to screen
  const handleFitToScreen = useCallback(() => {
    setZoom(100);
  }, []);

  // Reset zoom
  const handleResetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetZoom();
          break;
        case 'f':
        case 'F':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            handleFitToScreen();
          }
          break;
        case ' ':
          if (imageUrl) {
            e.preventDefault();
            setLightboxOpen(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetZoom, handleFitToScreen, imageUrl]);

  // Build lightbox images from versions
  const lightboxImages = pageVersions?.map((version, index) => ({
    id: version.id,
    src: version.asset_key ? `/api/r2/${version.asset_key}` : '',
    alt: `Version ${version.version}`,
    label: `Version ${version.version}`,
  })) || (imageUrl ? [{ id: page?.id || '1', src: imageUrl, alt: 'Current page' }] : []);

  // Empty state when no page is selected or no pages exist
  if (!page) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#171717] p-8 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-6">
            <ImageIcon className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Ready to create
          </h3>
          <p className="text-zinc-400 mb-8 text-center max-w-md">
            Generate your coloring book pages with AI-powered illustration
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={onGeneratePages}
            icon={<Sparkles className="w-5 h-5" />}
          >
            Generate Pages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#171717] relative" ref={containerRef}>
      {/* Preview Area */}
      <div
        className="flex-1 overflow-auto flex items-center justify-center p-8"
        onMouseEnter={() => setShowQuickActions(true)}
        onMouseLeave={() => setShowQuickActions(false)}
      >
        <div
          ref={imageContainerRef}
          className="relative transition-transform duration-200 ease-out group"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {imageUrl ? (
            <>
              {/* Loading State */}
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 rounded-lg">
                  <Loader className="w-8 h-8 text-zinc-500 animate-spin" />
                </div>
              )}

              {/* Page Image */}
              <img
                src={imageUrl}
                alt={page.scene_brief || 'Coloring page'}
                className={cn(
                  'max-w-[600px] max-h-[780px] rounded-lg shadow-2xl',
                  'border border-zinc-700/50 bg-white',
                  'cursor-pointer transition-all duration-200',
                  'group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]',
                  isImageLoading ? 'opacity-0' : 'opacity-100'
                )}
                onLoad={() => setIsImageLoading(false)}
                onClick={() => setLightboxOpen(true)}
                draggable={false}
              />

              {/* Expand Overlay on Hover */}
              <button
                onClick={() => setLightboxOpen(true)}
                className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  'bg-black/40 backdrop-blur-[2px] rounded-lg',
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                )}
              >
                <div className="flex flex-col items-center gap-2 text-white">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Expand className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">Click to expand</span>
                  <span className="text-xs text-white/60">or press Space</span>
                </div>
              </button>

              {/* Quick Action Bar - appears on hover */}
              {showQuickActions && !isGenerating && (
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <QuickActionBar
                    onRegenerate={onRegenerate}
                    onEdit={onEdit}
                    onSimplify={onSimplify}
                    onAddDetail={onAddDetail}
                    blotBalance={blotBalance}
                    disabled={isGenerating}
                  />
                </div>
              )}
            </>
          ) : (
            /* Placeholder when no image yet */
            <div className="w-[400px] h-[520px] bg-zinc-800/50 rounded-lg border border-zinc-700/50 border-dashed flex items-center justify-center">
              <div className="text-center space-y-3 p-6">
                <div className="w-16 h-16 rounded-xl bg-zinc-700/50 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8 text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-medium">Page {page.sort_order + 1}</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
                    {page.scene_brief || 'Waiting to be generated...'}
                  </p>
                </div>
                {isGenerating && (
                  <div className="flex items-center justify-center gap-2 text-blue-400 text-xs">
                    <Loader className="w-3 h-3 animate-spin" />
                    <span>Generating...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Creative Toolbar */}
      {showToolbar && (
        <CreativeToolbar
          zoom={zoom}
          onZoomChange={handleZoomChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToScreen={handleFitToScreen}
          onResetZoom={handleResetZoom}
          onGenerate={onGeneratePages}
          onRegenerate={onRegenerate}
          onEdit={onEdit}
          onSimplify={onSimplify}
          onAddDetail={onAddDetail}
          onExport={onExport}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          hasSelectedPage={!!page}
          isGenerating={isGenerating}
          blotBalance={blotBalance}
          styleReady={styleReady}
          position="floating"
        />
      )}

      {/* Lightbox for full-screen image viewing */}
      <ThumbnailLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={lightboxImages}
        initialIndex={0}
        onDownload={onExport ? () => onExport() : undefined}
      />
    </div>
  );
}

// Thumbnail grid component for selecting pages
interface PageThumbnailGridProps {
  pages: Page[];
  selectedPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onExpandPage?: (pageId: string) => void;
  getImageUrl?: (page: Page) => string | null;
}

export function PageThumbnailGrid({
  pages,
  selectedPageId,
  onSelectPage,
  onExpandPage,
  getImageUrl,
}: PageThumbnailGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleExpand = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxImages = pages.map((page, index) => ({
    id: page.id,
    src: getImageUrl?.(page) || '',
    alt: `Page ${index + 1}`,
    label: page.scene_brief || `Page ${index + 1}`,
  }));

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
        {pages.map((page, index) => {
          const isSelected = page.id === selectedPageId;
          const imageUrl = getImageUrl?.(page);

          return (
            <button
              key={page.id}
              onClick={() => onSelectPage(page.id)}
              className={cn(
                'relative aspect-[3/4] rounded-xl overflow-hidden group',
                'bg-zinc-800 border-2 transition-all duration-200',
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-zinc-700 hover:border-zinc-600'
              )}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`Page ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-zinc-600" />
                </div>
              )}

              {/* Page Number Badge */}
              <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center">
                <span className="text-xs font-semibold text-white">{index + 1}</span>
              </div>

              {/* Expand Button on Hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpand(index);
                }}
                className={cn(
                  'absolute top-2 right-2 w-7 h-7 rounded-lg',
                  'bg-black/50 backdrop-blur-sm',
                  'flex items-center justify-center',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  'hover:bg-black/70'
                )}
              >
                <Expand className="w-4 h-4 text-white" />
              </button>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset rounded-xl pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      <ThumbnailLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
      />
    </>
  );
}
