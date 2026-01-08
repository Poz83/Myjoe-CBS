'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Loader2, ImageIcon, FileText } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import type { PageThumbnail } from './thumbnail-grid';

export interface ThumbnailListProps {
  pages: PageThumbnail[];
  selectedPageId?: string | null;
  onSelectPage?: (pageId: string) => void;
  getImageUrl?: (page: PageThumbnail) => string;
}

// Memoized thumbnail item component
const ThumbnailListItem = React.memo(function ThumbnailListItem({
  page,
  isSelected,
  imageUrl,
  isLoading,
  onSelect,
  index,
}: {
  page: PageThumbnail;
  isSelected: boolean;
  imageUrl: string | null;
  isLoading: boolean;
  onSelect: () => void;
  index: number;
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Only show loading spinner if explicitly loading AND we have an image URL
  const showLoading = isLoading && imageUrl !== null;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative w-full aspect-[3/4] rounded-lg overflow-hidden border transition-all shrink-0 group',
        'bg-zinc-900',
        isSelected
          ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-md shadow-blue-500/10'
          : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
      )}
    >
      {showLoading || (imageLoading && imageUrl) ? (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
        </div>
      ) : imageError || !imageUrl ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 gap-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
            <FileText className="w-4 h-4 text-zinc-700 group-hover:text-zinc-600 transition-colors" />
          </div>
        </div>
      ) : (
        <Image
          src={imageUrl}
          alt={`Page ${page.sortOrder + 1}`}
          fill
          className="object-contain p-2"
          sizes="128px"
          loading={index < 4 ? 'eager' : 'lazy'}
          priority={index < 4}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />
      )}

      {/* Page Number Badge */}
      <div
        className={cn(
          'absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors',
          'backdrop-blur-sm',
          isSelected ? 'bg-blue-500 text-white' : 'bg-black/60 text-zinc-400 group-hover:text-zinc-300'
        )}
      >
        {page.sortOrder + 1}
      </div>
    </button>
  );
});

export function ThumbnailList({
  pages,
  selectedPageId,
  onSelectPage,
  getImageUrl,
}: ThumbnailListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Sort pages by order
  const sortedPages = React.useMemo(() => {
    return [...pages].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [pages]);

  const rowVirtualizer = useVirtualizer({
    count: sortedPages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140, // Approximate height + gap
    overscan: 5,
  });

  if (sortedPages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center border-r border-zinc-800">
        <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
          <ImageIcon className="w-5 h-5 text-zinc-600" />
        </div>
        <p className="text-sm text-zinc-500">No pages yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      <div className="px-4 py-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/50 backdrop-blur-sm z-10">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pages</h3>
        <span className="text-xs text-zinc-600 font-mono">{pages.length}</span>
      </div>
      
      <div ref={parentRef} className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const page = sortedPages[virtualRow.index];
            let imageUrl: string | null = null;
            
            if (page.imageUrl) {
              imageUrl = page.imageUrl;
            } else if (getImageUrl) {
              try {
                const url = getImageUrl(page);
                // Only use URL if it's not a placeholder/default path or ensure it's valid
                 if (url) imageUrl = url;
              } catch {
                // Ignore errors
              }
            }
            
            const isSelected = selectedPageId === page.id;
            const isLoading = (page.isLoading ?? false) && (imageUrl !== null || page.imageUrl !== null);

            return (
              <div
                key={page.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: 'auto',
                  transform: `translateY(${virtualRow.start}px)`,
                  paddingBottom: '12px', // Gap between items
                }}
              >
                <ThumbnailListItem
                  page={page}
                  isSelected={isSelected}
                  imageUrl={imageUrl}
                  isLoading={isLoading}
                  onSelect={() => onSelectPage?.(page.id)}
                  index={virtualRow.index}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
