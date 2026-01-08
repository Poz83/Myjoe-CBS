import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserAssets } from '@/server/storage/assets';
import { getProjects } from '@/server/db/projects';
import { getHeroes } from '@/server/db/heroes';
import { z } from 'zod';

const querySchema = z.object({
  type: z.enum(['projects', 'heroes', 'pages', 'exports']).optional(),
});

/**
 * GET /api/vault/assets
 * Get organized assets for the vault view
 * Query params: ?type=projects|heroes|pages|exports
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const queryParams = querySchema.safeParse({
      type: url.searchParams.get('type'),
    });

    if (!queryParams.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryParams.error.format() },
        { status: 400 }
      );
    }

    const { type } = queryParams.data;

    // If no type specified, return overview of all types
    if (!type) {
      const [projectsAssets, heroesAssets, pagesAssets, exportsAssets] = await Promise.all([
        getUserAssets(user.id, { type: 'thumbnail' }), // Project thumbnails
        getUserAssets(user.id, { type: 'hero' }),
        getUserAssets(user.id, { type: 'page' }),
        getUserAssets(user.id, { type: 'export' }),
      ]);

      const projects = await getProjects(user.id);
      const heroes = await getHeroes(user.id);

      return NextResponse.json({
        overview: {
          projects: { count: projects.length, storage: projectsAssets.reduce((sum, a) => sum + a.size_bytes, 0) },
          heroes: { count: heroes.length, storage: heroesAssets.reduce((sum, a) => sum + a.size_bytes, 0) },
          pages: { count: pagesAssets.length, storage: pagesAssets.reduce((sum, a) => sum + a.size_bytes, 0) },
          exports: { count: exportsAssets.length, storage: exportsAssets.reduce((sum, a) => sum + a.size_bytes, 0) },
        }
      });
    }

    // Return specific type data
    switch (type) {
      case 'projects': {
        const projects = await getProjects(user.id);
        const projectAssets = await getUserAssets(user.id, { type: 'thumbnail' });

        // Group projects with their assets
        const projectsWithStorage = projects.map(project => {
          const projectAssetsSize = projectAssets
            .filter(asset => asset.project_id === project.id)
            .reduce((sum, asset) => sum + asset.size_bytes, 0);

          return {
            ...project,
            storageUsed: projectAssetsSize,
            assetCount: projectAssets.filter(asset => asset.project_id === project.id).length,
          };
        });

        return NextResponse.json({ projects: projectsWithStorage });
      }

      case 'heroes': {
        const heroes = await getHeroes(user.id);
        const heroAssets = await getUserAssets(user.id, { type: 'hero' });

        // Group heroes with their assets
        const heroesWithStorage = heroes.map(hero => {
          const heroAsset = heroAssets.find(asset => asset.hero_id === hero.id);
          return {
            ...hero,
            storageUsed: heroAsset?.size_bytes || 0,
            hasAsset: !!heroAsset,
          };
        });

        return NextResponse.json({ heroes: heroesWithStorage });
      }

      case 'pages': {
        const pagesAssets = await getUserAssets(user.id, { type: 'page' });
        const projects = await getProjects(user.id);

        // Group pages by project
        const pagesByProject = pagesAssets.reduce((acc, asset) => {
          const projectId = asset.project_id;
          if (!projectId) return acc;

          if (!acc[projectId]) {
            const project = projects.find(p => p.id === projectId);
            acc[projectId] = {
              project: project || { id: projectId, name: 'Unknown Project' },
              assets: [],
              totalStorage: 0,
            };
          }

          acc[projectId].assets.push(asset);
          acc[projectId].totalStorage += asset.size_bytes;

          return acc;
        }, {} as Record<string, { project: any; assets: any[]; totalStorage: number }>);

        return NextResponse.json({ pagesByProject: Object.values(pagesByProject) });
      }

      case 'exports': {
        const exportsAssets = await getUserAssets(user.id, { type: 'export' });
        const projects = await getProjects(user.id);

        // Group exports by project
        const exportsByProject = exportsAssets.reduce((acc, asset) => {
          const projectId = asset.project_id;
          if (!projectId) return acc;

          if (!acc[projectId]) {
            const project = projects.find(p => p.id === projectId);
            acc[projectId] = {
              project: project || { id: projectId, name: 'Unknown Project' },
              assets: [],
              totalStorage: 0,
            };
          }

          acc[projectId].assets.push(asset);
          acc[projectId].totalStorage += asset.size_bytes;

          return acc;
        }, {} as Record<string, { project: any; assets: any[]; totalStorage: number }>);

        return NextResponse.json({ exportsByProject: Object.values(exportsByProject) });
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Vault assets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vault assets' },
      { status: 500 }
    );
  }
}