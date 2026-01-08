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
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Coloring Book Studio</h1>
          <p className="text-zinc-400">Choose an option to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Open Project Tile */}
          <button
            onClick={handleOpenProject}
            className={cn(
              'group relative p-8 rounded-2xl border border-zinc-800',
              'bg-gradient-to-br from-zinc-900/50 to-zinc-900/30',
              'hover:border-blue-500/50 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-blue-600/5',
              'transition-all duration-300 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-zinc-900'
            )}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                <FolderOpen className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Open Project</h2>
                <p className="text-sm text-zinc-400">
                  Continue working on an existing project from your vault
                </p>
              </div>
            </div>
          </button>

          {/* Create New Project Tile */}
          <button
            onClick={handleCreateNew}
            className={cn(
              'group relative p-8 rounded-2xl border border-zinc-800',
              'bg-gradient-to-br from-zinc-900/50 to-zinc-900/30',
              'hover:border-blue-500/50 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-blue-600/5',
              'transition-all duration-300 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-zinc-900'
            )}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                <Plus className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Create New Project</h2>
                <p className="text-sm text-zinc-400">
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
