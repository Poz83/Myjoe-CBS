'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, ImageIcon } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
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

// Memoized thumbnail item component for better performance
const ThumbnailItem = React.memo(function ThumbnailItem({
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
        'relative w-full aspect-[3/4] rounded-lg border-2 overflow-hidden',
        'bg-zinc-800/50 hover:bg-zinc-800 transition-all',
        'group',
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-zinc-700 hover:border-zinc-600'
      )}
    >
      {showLoading || (imageLoading && imageUrl) ? (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : imageError || !imageUrl ? (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
          <ImageIcon className="w-8 h-8 text-zinc-600" />
        </div>
      ) : (
        <Image
          src={imageUrl}
          alt={`Page ${page.sortOrder + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 33vw, 25vw"
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
});

export function ThumbnailGrid({
  pages,
  selectedPageId,
  onSelectPage,
  getImageUrl,
  emptyMessage = 'Your canvas is ready',
}: ThumbnailGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);
  
  // Filter and sort pages - only include pages that have images or are explicitly loading
  const sortedPages = useMemo(() => {
    const filtered = pages.filter((page) => {
      // Include page if it has an imageUrl or is explicitly marked as loading
      if (page.imageUrl) return true;
      if (page.isLoading) return true;
      
      // Check if getImageUrl provides a URL (this will be checked async, so we include it)
      if (getImageUrl) {
        try {
          const url = getImageUrl(page);
          if (url && url !== '/api/r2/pages/${page.id}/current.png') return true;
        } catch {
          // Ignore errors
        }
      }
      
      return false;
    });
    
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [pages, getImageUrl]);

  // Calculate columns based on container width
  useEffect(() => {
    const updateColumns = () => {
      if (!parentRef.current) return;
      const width = parentRef.current.offsetWidth;
      if (width < 768) {
        setColumns(3);
      } else if (width < 1024) {
        setColumns(4);
      } else {
        setColumns(5);
      }
    };

    updateColumns();
    const resizeObserver = new ResizeObserver(updateColumns);
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate rows needed
  const rowCount = Math.ceil(sortedPages.length / columns);

  // Calculate item height based on container width (maintains 3/4 aspect ratio)
  const getItemHeight = useCallback(() => {
    if (!parentRef.current) return 200;
    const containerWidth = parentRef.current.offsetWidth;
    const gap = 16; // gap-4 = 16px
    const itemWidth = (containerWidth - (gap * (columns - 1)) - 48) / columns; // 48px for padding
    return itemWidth * (4 / 3); // aspect-[3/4] means height is 4/3 of width
  }, [columns]);

  // Virtual scrolling setup - virtualize rows, not individual items
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => {
      const height = getItemHeight();
      return height + 16; // height + gap
    }, [getItemHeight]),
    overscan: 2, // Render 2 rows outside viewport for smooth scrolling
  });

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

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  return (
    <div ref={parentRef} className="h-full overflow-y-auto p-6" style={{ overflowX: 'hidden' }}>
      <div
        style={{
          height: `${totalHeight}px`,
          width: '100%',
          position: 'relative',
          minHeight: '100%',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const endIndex = Math.min(startIndex + columns, sortedPages.length);
          const rowPages = sortedPages.slice(startIndex, endIndex);

          return (
            <div
              key={virtualRow.key}
              className="grid gap-4 mb-4"
              style={{
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowPages.map((page, colIndex) => {
                const globalIndex = startIndex + colIndex;
                let imageUrl: string | null = null;
                
                // Try to get image URL
                if (page.imageUrl) {
                  imageUrl = page.imageUrl;
                } else if (getImageUrl) {
                  try {
                    const url = getImageUrl(page);
                    // Only use URL if it's not a placeholder/default path
                    if (url && !url.includes('/api/r2/pages/${page.id}')) {
                      imageUrl = url;
                    }
                  } catch {
                    // Ignore errors
                  }
                }
                
                const isSelected = selectedPageId === page.id;
                // Only mark as loading if explicitly set AND we have an image URL or expect one
                const isLoading = page.isLoading && (imageUrl !== null || page.imageUrl !== null);

                return (
                  <ThumbnailItem
                    key={page.id}
                    page={page}
                    isSelected={isSelected}
                    imageUrl={imageUrl}
                    isLoading={isLoading}
                    onSelect={() => onSelectPage?.(page.id)}
                    index={globalIndex}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
