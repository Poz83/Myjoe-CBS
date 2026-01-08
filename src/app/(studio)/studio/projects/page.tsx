'use client';

import { useRouter } from 'next/navigation';
import { Book } from 'lucide-react';
import { useProjects, useDeleteProject } from '@/hooks/use-projects';
import { ProjectCard } from '@/components/features/project/project-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function ProjectsPage() {
  const router = useRouter();
  const { data: projects, isLoading, error } = useProjects();
  const deleteProject = useDeleteProject();

  const handleNewProject = () => {
    router.push('/studio/projects/new');
  };

  const handleDelete = (projectId: string) => {
    deleteProject.mutate(projectId);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-red-400">Failed to load projects</p>
          <p className="text-sm text-zinc-400">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">My Projects</h1>
        <Button onClick={handleNewProject} variant="primary">
          New Project
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
              <Skeleton variant="image" className="aspect-[3/4]" />
              <div className="p-4 space-y-2">
                <Skeleton variant="text" className="h-4 w-3/4" />
                <Skeleton variant="text" className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!projects || projects.length === 0) && (
        <EmptyState
          icon={Book}
          title="No projects yet"
          description="Create your first coloring book and bring your ideas to life."
          action={{ label: 'Create Project', onClick: handleNewProject }}
        />
      )}

      {/* Projects grid */}
      {!isLoading && projects && projects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
