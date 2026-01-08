'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Book } from 'lucide-react';
import { useProjects, useDeleteProject } from '@/hooks/use-projects';
import { ProjectCard } from '@/components/features/project/project-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DeleteProjectDialog } from '@/components/features/project/delete-project-dialog';
import { useState } from 'react';

export default function OpenProjectPage() {
  const router = useRouter();
  const { data: projects, isLoading, error } = useProjects();
  const deleteProject = useDeleteProject();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = (projectId: string, projectName: string) => {
    setProjectToDelete({ id: projectId, name: projectName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject.mutate(projectToDelete.id);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleNewProject = () => {
    router.push('/studio/projects/new');
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-red-400">Couldn't load projects</p>
          <p className="text-sm text-zinc-400">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
          <Button onClick={() => router.push('/studio/projects')} variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/studio/projects')}
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-white">Open Project</h1>
            <p className="text-sm text-zinc-400 mt-1">Select a project to continue working</p>
          </div>
        </div>
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
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Book}
            title="No projects yet"
            description="Create your first coloring book and bring your ideas to life."
            action={{ label: 'Create Project', onClick: handleNewProject }}
          />
        </div>
      )}

      {/* Projects grid */}
      {!isLoading && projects && projects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={(id) => handleDelete(id, project.name)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        projectName={projectToDelete?.name || ''}
        onConfirm={confirmDelete}
        isDeleting={deleteProject.isPending}
      />
    </div>
  );
}
