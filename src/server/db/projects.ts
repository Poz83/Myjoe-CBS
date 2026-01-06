import { createClient } from '@/lib/supabase/server';
import { AUDIENCE_DNA_MAPPING } from '@/lib/constants';
import type { Database } from '@/lib/supabase/types';
import type { Audience, StylePreset, TrimSize } from '@/types/domain';

type Project = Database['public']['Tables']['projects']['Row'];
type Hero = Database['public']['Tables']['heroes']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

/**
 * Extended project type with hero and pages
 */
export interface ProjectWithDetails extends Project {
  hero?: Hero | null;
  pages?: Page[];
}

/**
 * Input for creating a new project
 */
export interface CreateProjectInput {
  name: string;
  description?: string | null;
  pageCount: number;
  audience: Audience;
  stylePreset: StylePreset;
  trimSize?: TrimSize;
  heroId?: string | null;
}

/**
 * Input for updating a project
 */
export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  heroId?: string | null;
  status?: 'draft' | 'generating' | 'ready' | 'exported';
}

/**
 * Get all projects for a user
 * Filters out soft-deleted projects and orders by most recently updated
 */
export async function getProjects(userId: string): Promise<Project[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single project by ID with hero and pages
 * Verifies ownership and includes related data
 */
export async function getProject(
  projectId: string,
  userId: string
): Promise<ProjectWithDetails> {
  const supabase = await createClient();

  // Fetch project with hero join
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      hero:heroes(*)
    `)
    .eq('id', projectId)
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .single();

  if (projectError) {
    if (projectError.code === 'PGRST116') {
      throw new Error('Project not found or access denied');
    }
    throw new Error(`Failed to fetch project: ${projectError.message}`);
  }

  // Fetch pages separately
  const { data: pages, error: pagesError } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (pagesError) {
    throw new Error(`Failed to fetch pages: ${pagesError.message}`);
  }

  return {
    ...project,
    pages: pages || [],
  };
}

/**
 * Create a new project with auto-generated pages
 * Derives line_weight and complexity from audience
 */
export async function createProject(
  userId: string,
  input: CreateProjectInput
): Promise<Project> {
  const supabase = await createClient();

  // Derive DNA from audience
  const dna = AUDIENCE_DNA_MAPPING[input.audience];

  // Insert project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      owner_id: userId,
      name: input.name,
      description: input.description || null,
      page_count: input.pageCount,
      audience: input.audience,
      style_preset: input.stylePreset,
      trim_size: input.trimSize || '8.5x11',
      line_weight: dna.lineWeight,
      complexity: dna.complexity,
      hero_id: input.heroId || null,
      status: 'draft',
    })
    .select()
    .single();

  if (projectError) {
    throw new Error(`Failed to create project: ${projectError.message}`);
  }

  // Create empty pages
  const pagesToInsert = Array.from({ length: input.pageCount }, (_, i) => ({
    project_id: project.id,
    sort_order: i,
    page_type: 'illustration' as const,
    current_version: 1,
  }));

  const { error: pagesError } = await supabase
    .from('pages')
    .insert(pagesToInsert);

  if (pagesError) {
    // Rollback: delete the project if page creation fails
    await supabase.from('projects').delete().eq('id', project.id);
    throw new Error(`Failed to create pages: ${pagesError.message}`);
  }

  return project;
}

/**
 * Update a project
 * Only allows updating specific fields - DNA is immutable
 */
export async function updateProject(
  projectId: string,
  userId: string,
  input: UpdateProjectInput
): Promise<Project> {
  const supabase = await createClient();

  // Verify ownership first
  const { data: existing, error: checkError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .single();

  if (checkError || !existing) {
    throw new Error('Project not found or access denied');
  }

  // Update only allowed fields
  const { data: project, error: updateError } = await supabase
    .from('projects')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update project: ${updateError.message}`);
  }

  return project;
}

/**
 * Soft delete a project
 * Sets deleted_at timestamp instead of removing from database
 */
export async function deleteProject(
  projectId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  // Verify ownership first
  const { data: existing, error: checkError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('owner_id', userId)
    .is('deleted_at', null)
    .single();

  if (checkError || !existing) {
    throw new Error('Project not found or access denied');
  }

  // Soft delete
  const { error: deleteError } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId);

  if (deleteError) {
    throw new Error(`Failed to delete project: ${deleteError.message}`);
  }
}
