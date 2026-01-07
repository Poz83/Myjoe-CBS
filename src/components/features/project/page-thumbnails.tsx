'use client';

import { GripVertical, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Database } from '@/lib/supabase/types';

type Page = Database['public']['Tables']['pages']['Row'];

interface PageThumbnailsProps {
  pages: Page[];
  selectedPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onGeneratePages?: () => void;
  isLoading?: boolean;
}

export function PageThumbnails({
  pages,
  selectedPageId,
  onSelectPage,
  onGeneratePages,
  isLoading = false,
}: PageThumbnailsProps) {
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
                  <ImageIcon className="w-12 h-12 text-zinc-600 mb-3" />
                  <p className="text-sm text-zinc-400 mb-4">No pages yet</p>
                  <Button variant="primary" size="sm" onClick={onGeneratePages}>
                    Generate Pages
                  </Button>
                </div>
              ) : (
                // Page list
                pages.map((page, index) => {
                  const isSelected = page.id === selectedPageId;
                  return (
                    <button
                      key={page.id}
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
                        <div className="w-20 h-20 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center">
                          {/* Placeholder for thumbnail image */}
                          <ImageIcon className="w-8 h-8 text-zinc-600" />
                        </div>
                        {/* Page Number Badge */}
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">
                            {index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Page Info */}
                      <div className="flex-1 text-left">
                        <p className={cn(
                          'text-sm font-medium',
                          isSelected ? 'text-white' : 'text-zinc-300'
                        )}>
                          Page {index + 1}
                        </p>
                        {page.scene_brief && (
                          <p className="text-xs text-zinc-500 line-clamp-2">
                            {page.scene_brief}
                          </p>
                        )}
                      </div>
                    </button>
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
                >
                  Generate Pages
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
    </div>
  );
}
