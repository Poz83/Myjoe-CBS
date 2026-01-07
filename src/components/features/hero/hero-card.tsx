'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import type { Database } from '@/lib/supabase/types';

type Hero = Database['public']['Tables']['heroes']['Row'];

interface HeroWithUrls extends Hero {
  thumbnailUrl: string | null;
}

interface HeroCardProps {
  hero: HeroWithUrls;
  onDelete?: (heroId: string) => void;
  onClick?: (heroId: string) => void;
}

const AUDIENCE_CONFIG = {
  toddler: {
    label: 'Toddler',
    className: 'bg-pink-600/20 text-pink-300',
  },
  children: {
    label: 'Children',
    className: 'bg-blue-600/20 text-blue-300',
  },
  tween: {
    label: 'Tween',
    className: 'bg-purple-600/20 text-purple-300',
  },
  teen: {
    label: 'Teen',
    className: 'bg-green-600/20 text-green-300',
  },
  adult: {
    label: 'Adult',
    className: 'bg-orange-600/20 text-orange-300',
  },
} as const;

export function HeroCard({ hero, onDelete, onClick }: HeroCardProps) {
  const [imageLoading, setImageLoading] = useState(!!hero.thumbnailUrl);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [imageError, setImageError] = useState(false);
  const skeletonTimeoutRef = useRef<NodeJS.Timeout>();

  // Show skeleton if image takes >500ms to load
  useEffect(() => {
    if (imageLoading) {
      skeletonTimeoutRef.current = setTimeout(() => {
        setShowSkeleton(true);
      }, 500);
    } else {
      if (skeletonTimeoutRef.current) {
        clearTimeout(skeletonTimeoutRef.current);
      }
      setShowSkeleton(false);
    }

    return () => {
      if (skeletonTimeoutRef.current) {
        clearTimeout(skeletonTimeoutRef.current);
      }
    };
  }, [imageLoading]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking dropdown
    if ((e.target as HTMLElement).closest('[data-dropdown]')) {
      return;
    }
    onClick?.(hero.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm(`Are you sure you want to delete "${hero.name}"?`)) {
      onDelete(hero.id);
    }
  };

  const audienceConfig = AUDIENCE_CONFIG[hero.audience];

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative bg-zinc-900 rounded-lg border border-zinc-800',
        'cursor-pointer transition-all duration-200',
        'hover:border-zinc-700 hover:scale-[1.02]',
        'overflow-hidden'
      )}
    >
      {/* Thumbnail area - square aspect ratio for hero reference sheets */}
      <div className="relative aspect-square bg-zinc-800 overflow-hidden rounded-t-lg">
        {showSkeleton && imageLoading && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] animate-shimmer" />
        )}

        {hero.thumbnailUrl && !imageError ? (
          <img
            src={hero.thumbnailUrl}
            alt={hero.name}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              imageLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
            <User className="w-12 h-12 text-zinc-600" />
          </div>
        )}

        {/* Dropdown menu trigger */}
        <div
          data-dropdown
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              data-dropdown
              className="p-1.5 bg-zinc-900/80 hover:bg-zinc-800 rounded-md border border-zinc-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-zinc-300" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content area */}
      <div className="p-4 space-y-2">
        <h3 className="text-base font-medium text-white line-clamp-1">
          {hero.name}
        </h3>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              audienceConfig.className
            )}
          >
            {audienceConfig.label}
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          Used in {hero.times_used} {hero.times_used === 1 ? 'project' : 'projects'}
        </p>
      </div>
    </div>
  );
}

/**
 * Skeleton variant for loading states
 */
export function HeroCardSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      {/* Thumbnail skeleton */}
      <div className="aspect-square">
        <Skeleton className="w-full h-full rounded-none" variant="image" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-2">
        <Skeleton className="w-3/4 h-5" variant="text" />
        <Skeleton className="w-16 h-5 rounded-full" variant="text" />
        <Skeleton className="w-24 h-3" variant="text" />
      </div>
    </div>
  );
}
