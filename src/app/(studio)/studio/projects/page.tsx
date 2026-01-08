'use client';

import { useRouter } from 'next/navigation';
import { FolderOpen, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
  const router = useRouter();

  const handleOpenProject = () => {
    router.push('/studio/projects/open');
  };

  const handleCreateNew = () => {
    router.push('/studio/projects/new');
  };

  return (
    <div className="h-full flex items-center justify-center p-8 bg-bg-base">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-heading-xl text-text-primary mb-2">Coloring Book Studio</h1>
          <p className="text-text-secondary">Choose an option to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Open Project Tile */}
          <button
            onClick={handleOpenProject}
            className={cn(
              'group relative p-8 rounded-xl border border-border-subtle',
              'bg-bg-surface',
              'hover:border-accent-cyan/50 hover:bg-accent-cyan-muted',
              'transition-all duration-base cursor-pointer',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base'
            )}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-xl bg-accent-cyan-muted group-hover:bg-accent-cyan/20 flex items-center justify-center transition-colors duration-base">
                <FolderOpen className="w-8 h-8 text-accent-cyan" />
              </div>
              <div>
                <h2 className="text-heading text-text-primary mb-2">Open Project</h2>
                <p className="text-sm text-text-secondary">
                  Continue working on an existing project from your vault
                </p>
              </div>
            </div>
          </button>

          {/* Create New Project Tile */}
          <button
            onClick={handleCreateNew}
            className={cn(
              'group relative p-8 rounded-xl border border-border-subtle',
              'bg-bg-surface',
              'hover:border-accent-purple/50 hover:bg-accent-purple-muted',
              'transition-all duration-base cursor-pointer',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base'
            )}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-xl bg-accent-purple-muted group-hover:bg-accent-purple/20 flex items-center justify-center transition-colors duration-base">
                <Plus className="w-8 h-8 text-accent-purple" />
              </div>
              <div>
                <h2 className="text-heading text-text-primary mb-2">Create New Project</h2>
                <p className="text-sm text-text-secondary">
                  Start a new coloring book project from scratch
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
