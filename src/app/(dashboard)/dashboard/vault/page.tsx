'use client';

import { useState } from 'react';
import { Archive, Folder, Users, FileText, Download } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StorageProgress } from '@/components/storage/storage-progress';
import { useStorageQuota } from '@/hooks/use-storage-quota';
import { useVaultProjects } from '@/hooks/use-vault-projects';
import { useVaultHeroes } from '@/hooks/use-vault-heroes';
import { useVaultPages } from '@/hooks/use-vault-pages';
import { useVaultExports } from '@/hooks/use-vault-exports';
import { ProjectCard } from '@/components/features/project/project-card';
import { HeroCard, HeroCardSkeleton } from '@/components/features/hero/hero-card';
import { useDeleteProject } from '@/hooks/use-projects';
import { useDeleteHero } from '@/hooks/use-heroes';
import { EmptyState } from '@/components/ui/empty-state';
import { DeleteProjectDialog } from '@/components/features/project/delete-project-dialog';

const tabs = [
  { id: 'projects', label: 'Projects', icon: Folder, description: 'Coloring Book Studio projects' },
  { id: 'heroes', label: 'Heroes', icon: Users, description: 'Hero Lab characters' },
  { id: 'pages', label: 'Pages', icon: FileText, description: 'Individual coloring pages' },
  { id: 'exports', label: 'Exports', icon: Download, description: 'PDF exports and downloads' },
];

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState('projects');
  const { used, limit, remaining, percentageUsed, isLoading } = useStorageQuota();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Vault</h1>
          <p className="text-zinc-500">Manage your creative assets and storage</p>
        </div>
        <div className="flex items-center gap-4">
          <StorageProgress
            used={used}
            limit={limit}
            size="lg"
          />
          <div className="text-right">
            <div className="text-sm text-zinc-400">
              {((remaining / (1024 * 1024 * 1024))).toFixed(1)}GB free
            </div>
            <div className="text-xs text-zinc-500">
              of {(limit / (1024 * 1024 * 1024)).toFixed(0)}GB total
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <ProjectsTab />
        </TabsContent>

        {/* Heroes Tab */}
        <TabsContent value="heroes">
          <HeroesTab />
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages">
          <PagesTab />
        </TabsContent>

        {/* Exports Tab */}
        <TabsContent value="exports">
          <ExportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExportsTab() {
  const { data: exportsByProject, isLoading, error } = useVaultExports();

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load exports</p>
        <p className="text-sm text-zinc-400 mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Exports</h2>
          <p className="text-sm text-zinc-500">PDF exports and downloads grouped by project</p>
        </div>
        {exportsByProject && exportsByProject.length > 0 && (
          <div className="text-sm text-zinc-400">
            {exportsByProject.reduce((sum, p) => sum + p.assets.length, 0)} export{exportsByProject.reduce((sum, p) => sum + p.assets.length, 0) !== 1 ? 's' : ''} • {' '}
            {(exportsByProject.reduce((sum, p) => sum + p.totalStorage, 0) / (1024 * 1024 * 1024)).toFixed(2)}GB storage
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-zinc-800 rounded animate-pulse w-48" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="bg-zinc-800 rounded-lg p-4 animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-zinc-700 rounded w-32" />
                      <div className="h-4 bg-zinc-700 rounded w-16" />
                    </div>
                    <div className="h-3 bg-zinc-700 rounded w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!exportsByProject || exportsByProject.length === 0) && (
        <EmptyState
          icon={Download}
          title="No exports yet"
          description="Export your completed projects as PDFs to see them here."
          action={{ label: 'View Projects', onClick: () => window.location.href = '/studio/projects' }}
        />
      )}

      {/* Exports grouped by project */}
      {!isLoading && exportsByProject && exportsByProject.length > 0 && (
        <div className="space-y-8">
          {exportsByProject.map((projectGroup) => (
            <div key={projectGroup.project.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-zinc-400" />
                  <div>
                    <h3 className="text-lg font-medium text-white">{projectGroup.project.name}</h3>
                    <p className="text-sm text-zinc-500">
                      {projectGroup.assets.length} export{projectGroup.assets.length !== 1 ? 's' : ''} • {(projectGroup.totalStorage / (1024 * 1024)).toFixed(1)}MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = `/studio/projects/${projectGroup.project.id}`}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View Project →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pl-8">
                {projectGroup.assets.map((asset) => (
                  <div key={asset.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm font-medium text-white">
                          {asset.content_type?.includes('pdf') ? 'PDF Export' : 'Export'}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {(asset.size_bytes / (1024 * 1024)).toFixed(1)}MB
                      </span>
                    </div>
                    <div className="text-xs text-zinc-600">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implement download functionality
                        console.log('Download', asset.r2_key);
                      }}
                      className="mt-3 w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PagesTab() {
  const { data: pagesByProject, isLoading, error } = useVaultPages();

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load pages</p>
        <p className="text-sm text-zinc-400 mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Pages</h2>
          <p className="text-sm text-zinc-500">Individual coloring pages grouped by project</p>
        </div>
        {pagesByProject && pagesByProject.length > 0 && (
          <div className="text-sm text-zinc-400">
            {pagesByProject.reduce((sum, p) => sum + p.assets.length, 0)} page{pagesByProject.reduce((sum, p) => sum + p.assets.length, 0) !== 1 ? 's' : ''} • {' '}
            {(pagesByProject.reduce((sum, p) => sum + p.totalStorage, 0) / (1024 * 1024 * 1024)).toFixed(2)}GB storage
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-zinc-800 rounded animate-pulse w-48" />
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {Array.from({ length: 8 }).map((_, j) => (
                  <div key={j} className="aspect-[3/4] bg-zinc-800 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!pagesByProject || pagesByProject.length === 0) && (
        <EmptyState
          icon={FileText}
          title="No pages yet"
          description="Generate coloring pages in your projects to see them here."
          action={{ label: 'View Projects', onClick: () => window.location.href = '/studio/projects' }}
        />
      )}

      {/* Pages grouped by project */}
      {!isLoading && pagesByProject && pagesByProject.length > 0 && (
        <div className="space-y-8">
          {pagesByProject.map((projectGroup) => (
            <div key={projectGroup.project.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-zinc-400" />
                  <div>
                    <h3 className="text-lg font-medium text-white">{projectGroup.project.name}</h3>
                    <p className="text-sm text-zinc-500">
                      {projectGroup.assets.length} page{projectGroup.assets.length !== 1 ? 's' : ''} • {(projectGroup.totalStorage / (1024 * 1024)).toFixed(1)}MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = `/studio/projects/${projectGroup.project.id}`}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View Project →
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 pl-8">
                {projectGroup.assets.map((asset) => (
                  <div key={asset.id} className="relative group">
                    <div className="aspect-[3/4] bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                      {/* Placeholder for page thumbnail */}
                      <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-zinc-500" />
                      </div>
                    </div>
                    {/* Size overlay */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {(asset.size_bytes / (1024 * 1024)).toFixed(1)}MB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HeroesTab() {
  const { data: heroes, isLoading, error } = useVaultHeroes();
  const deleteHero = useDeleteHero();

  const handleDelete = (heroId: string) => {
    deleteHero.mutate(heroId);
  };

  const handleHeroClick = (heroId: string) => {
    // For now, just navigate to details (can be expanded later)
    // router.push(`/studio/library/heroes/${heroId}`);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load heroes</p>
        <p className="text-sm text-zinc-400 mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Heroes</h2>
          <p className="text-sm text-zinc-500">Hero Lab characters</p>
        </div>
        {heroes && heroes.length > 0 && (
          <div className="text-sm text-zinc-400">
            {heroes.length} hero{heroes.length !== 1 ? 's' : ''} • {' '}
            {(heroes.reduce((sum, h) => sum + h.storageUsed, 0) / (1024 * 1024 * 1024)).toFixed(2)}GB storage
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <HeroCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!heroes || heroes.length === 0) && (
        <EmptyState
          icon={Users}
          title="No heroes yet"
          description="Create your first hero character in Hero Lab."
          action={{ label: 'Create Hero', onClick: () => window.location.href = '/studio/library/heroes/new' }}
        />
      )}

      {/* Heroes grid */}
      {!isLoading && heroes && heroes.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {heroes.map((hero) => (
            <div key={hero.id} className="relative">
              <HeroCard
                hero={hero}
                onDelete={handleDelete}
                onClick={handleHeroClick}
              />
              {/* Storage info overlay */}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {(hero.storageUsed / (1024 * 1024)).toFixed(0)}MB
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsTab() {
  const { data: projects, isLoading, error } = useVaultProjects();
  const deleteProject = useDeleteProject();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = (projectId: string) => {
    const project = projects?.find(p => p.id === projectId);
    if (project) {
      setProjectToDelete({ id: projectId, name: project.name });
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject.mutate(projectToDelete.id);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load projects</p>
        <p className="text-sm text-zinc-400 mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <p className="text-sm text-zinc-500">Coloring Book Studio projects</p>
        </div>
        {projects && projects.length > 0 && (
          <div className="text-sm text-zinc-400">
            {projects.length} project{projects.length !== 1 ? 's' : ''} • {' '}
            {(projects.reduce((sum, p) => sum + p.storageUsed, 0) / (1024 * 1024 * 1024)).toFixed(2)}GB storage
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
              <div className="aspect-[3/4] bg-zinc-800 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 bg-zinc-800 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!projects || projects.length === 0) && (
        <EmptyState
          icon={Folder}
          title="No projects yet"
          description="Create your first coloring book project to see it here."
          action={{ label: 'Create Project', onClick: () => window.location.href = '/studio/projects/new' }}
        />
      )}

      {/* Projects grid */}
      {!isLoading && projects && projects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="relative">
              <ProjectCard
                project={project}
                onDelete={(id) => handleDelete(id)}
              />
              {/* Storage info overlay */}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {(project.storageUsed / (1024 * 1024)).toFixed(0)}MB
              </div>
            </div>
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