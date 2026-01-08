'use client';

import { useState } from 'react';
import { GripVertical, Image as ImageIcon, Expand, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ThumbnailLightbox, ThumbnailPreview } from '@/components/studio/thumbnail-lightbox';
import { cn } from '@/lib/utils';
import type { Database } from '@/lib/supabase/types';

type Page = Database['public']['Tables']['pages']['Row'];

interface PageThumbnailsProps {
  pages: Page[];
  selectedPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onGeneratePages?: () => void;
  isLoading?: boolean;
  getImageUrl?: (page: Page) => string | null;
}

export function PageThumbnails({
  pages,
  selectedPageId,
  onSelectPage,
  onGeneratePages,
  isLoading = false,
  getImageUrl,
}: PageThumbnailsProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Build lightbox images
  const lightboxImages = pages.map((page, index) => ({
    id: page.id,
    src: getImageUrl?.(page) || '',
    alt: `Page ${index + 1}`,
    label: page.scene_brief || `Page ${index + 1}`,
  }));

  const handleExpandPage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-r border-zinc-800">
      <Tabs defaultValue="pages" className="flex-1 flex flex-col">
        <TabsList className="flex-shrink-0 px-4 pt-4">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Pages Tab */}
        <TabsContent value="pages" className="flex-1 overflow-hidden mt-0">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoading ? (
                // Loading state
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton variant="image" className="w-20 h-20 rounded" />
                  </div>
                ))
              ) : pages.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <div className="w-16 h-16 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">No pages yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onGeneratePages}
                    icon={<Sparkles className="w-4 h-4" />}
                  >
                    Generate Pages
                  </Button>
                </div>
              ) : (
                // Page list with thumbnails
                pages.map((page, index) => {
                  const isSelected = page.id === selectedPageId;
                  const imageUrl = getImageUrl?.(page);

                  return (
                    <ThumbnailPreview
                      key={page.id}
                      src={imageUrl || ''}
                      alt={`Page ${index + 1}`}
                      onExpand={() => {
                        setLightboxIndex(index);
                        setLightboxOpen(true);
                      }}
                    >
                      <button
                        onClick={() => onSelectPage(page.id)}
                        className={cn(
                          'w-full flex items-center gap-2 p-2 rounded-lg transition-all group',
                          'hover:bg-zinc-800',
                          isSelected && 'bg-zinc-800 ring-2 ring-blue-500'
                        )}
                      >
                        {/* Drag Handle */}
                        <div className="flex-shrink-0 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0">
                          <div className="w-20 h-20 bg-zinc-800 rounded border border-zinc-700 overflow-hidden flex items-center justify-center">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={`Page ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-zinc-600" />
                            )}
                          </div>
                          {/* Page Number Badge */}
                          <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {index + 1}
                            </span>
                          </div>
                          {/* Expand Button on Hover */}
                          {imageUrl && (
                            <button
                              onClick={(e) => handleExpandPage(index, e)}
                              className={cn(
                                'absolute top-1 right-1 w-6 h-6 rounded-md',
                                'bg-black/60 backdrop-blur-sm',
                                'flex items-center justify-center',
                                'opacity-0 group-hover:opacity-100 transition-opacity',
                                'hover:bg-black/80'
                              )}
                            >
                              <Expand className="w-3 h-3 text-white" />
                            </button>
                          )}
                        </div>

                        {/* Page Info */}
                        <div className="flex-1 text-left min-w-0">
                          <p className={cn(
                            'text-sm font-medium',
                            isSelected ? 'text-white' : 'text-zinc-300'
                          )}>
                            Page {index + 1}
                          </p>
                          {page.scene_brief && (
                            <p className="text-xs text-zinc-500 line-clamp-2 break-words">
                              {page.scene_brief}
                            </p>
                          )}
                        </div>
                      </button>
                    </ThumbnailPreview>
                  );
                })
              )}
            </div>

            {/* Generate Button at Bottom (if pages exist) */}
            {pages.length > 0 && (
              <div className="flex-shrink-0 p-4 border-t border-zinc-800">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={onGeneratePages}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Add More Pages
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="flex-1 overflow-hidden mt-0">
          <div className="h-full flex items-center justify-center p-4">
            <p className="text-zinc-500">Coming soon</p>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 overflow-hidden mt-0">
          <div className="h-full flex items-center justify-center p-4">
            <p className="text-zinc-500">Coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Lightbox for expanded view */}
      <ThumbnailLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
      />
    </div>
  );
}
