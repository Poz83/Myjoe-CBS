'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageThumbnail {
  id: string;
  sortOrder: number;
  imageUrl?: string | null;
  isLoading?: boolean;
}

export interface ThumbnailGridProps {
  pages: PageThumbnail[];
  selectedPageId?: string | null;
  onSelectPage?: (pageId: string) => void;
  getImageUrl?: (page: PageThumbnail) => string;
  emptyMessage?: string;
}

export function ThumbnailGrid({
  pages,
  selectedPageId,
  onSelectPage,
  getImageUrl,
  emptyMessage = 'Your canvas is ready',
}: ThumbnailGridProps) {
  const sortedPages = [...pages].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sortedPages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm">{emptyMessage}</p>
          <p className="text-zinc-500 text-xs">Generate pages to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {sortedPages.map((page) => {
          const imageUrl = getImageUrl
            ? getImageUrl(page)
            : page.imageUrl || `/api/r2/pages/${page.id}/current.png`;
          const isSelected = selectedPageId === page.id;
          const isLoading = page.isLoading;

          return (
            <button
              key={page.id}
              onClick={() => onSelectPage?.(page.id)}
              className={cn(
                'relative aspect-[3/4] rounded-lg border-2 overflow-hidden',
                'bg-zinc-800/50 hover:bg-zinc-800 transition-all',
                'group',
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-zinc-700 hover:border-zinc-600'
              )}
            >
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
              ) : imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`Page ${page.sortOrder + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 33vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
                  <ImageIcon className="w-8 h-8 text-zinc-600" />
                </div>
              )}

              {/* Page Number Badge */}
              <div
                className={cn(
                  'absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium',
                  'bg-zinc-900/80 backdrop-blur-sm',
                  isSelected ? 'text-blue-300' : 'text-zinc-400'
                )}
              >
                {page.sortOrder + 1}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
