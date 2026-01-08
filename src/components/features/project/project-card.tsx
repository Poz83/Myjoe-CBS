'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Trash2, Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import type { Database } from '@/lib/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

// Flexible project type for vault view (may not have all fields)
interface VaultProjectMinimal {
  id: string;
  name: string;
  page_count: number;
  status: string;
}

interface ProjectCardProps {
  project: Project | VaultProjectMinimal;
  onDelete?: (projectId: string) => void;
}

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    className: 'bg-zinc-600 text-zinc-100',
  },
  calibrating: {
    label: 'Calibrating',
    className: 'bg-amber-600 text-white animate-pulse',
  },
  generating: {
    label: 'Generating',
    className: 'bg-blue-600 text-white animate-pulse',
  },
  ready: {
    label: 'Ready',
    className: 'bg-green-600 text-white',
  },
  exported: {
    label: 'Exported',
    className: 'bg-purple-600 text-white',
  },
} as const;

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();
  // For now, we show placeholder immediately since thumbnails aren't available yet
  // When thumbnails are implemented, set this to true and load the thumbnail URL
  const [imageLoading, setImageLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const skeletonTimeoutRef = useRef<NodeJS.Timeout>();

  // Show skeleton if image takes >500ms to load (for future thumbnail implementation)
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
    router.push(`/studio/projects/${project.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm(`Are you sure you want to delete "${project.name}"?`)) {
      onDelete(project.id);
    }
  };

  const statusConfig = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;

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
      {/* Thumbnail area */}
      <div className="relative aspect-[3/4] bg-zinc-800 overflow-hidden">
        {showSkeleton && imageLoading && (
          <Skeleton variant="image" className="absolute inset-0 w-full h-full" />
        )}
        {/* Placeholder - will be replaced with actual thumbnail when available */}
        {!showSkeleton && (
          <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
            <Book className="w-12 h-12 text-zinc-600" />
          </div>
        )}
        {/* Future: When thumbnails are available, uncomment this:
        <img
          ref={imageRef}
          src={thumbnailUrl}
          alt={project.name}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            imageLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />
        */}
        
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-md',
              statusConfig.className
            )}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Dropdown menu trigger */}
        <div
          data-dropdown
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
      <div className="p-4">
        <h3 className="text-base font-medium text-white mb-1 line-clamp-1">
          {project.name}
        </h3>
        <p className="text-sm text-zinc-400">
          {project.page_count} {project.page_count === 1 ? 'page' : 'pages'}
        </p>
      </div>
    </div>
  );
}
