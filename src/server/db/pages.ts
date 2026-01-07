import { createClient } from '@/lib/supabase/server';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import type { Database } from '@/lib/supabase/types';

// ============================================================================
// Types
// ============================================================================

export type Page = Database['public']['Tables']['pages']['Row'];
export type PageInsert = Database['public']['Tables']['pages']['Insert'];
export type PageUpdate = Database['public']['Tables']['pages']['Update'];

export type PageType = 'illustration' | 'text-focus' | 'pattern' | 'educational';
export type QualityStatus = 'pass' | 'needs_review' | 'fail';
export type EditType = 'initial' | 'regenerate' | 'inpaint' | 'quick_action';

export interface PageVersion {
  id: string;
  page_id: string;
  version: number;
  asset_key: string;
  thumbnail_key: string | null;
  compiled_prompt: string;
  negative_prompt: string | null;
  seed: string | null;
  compiler_snapshot: Record<string, unknown> | null;
  quality_score: number | null;
  quality_status: QualityStatus | null;
  edit_type: EditType | null;
  edit_prompt: string | null;
  edit_mask_key: string | null;
  blots_spent: number;
  created_at: string;
}

export interface PageVersionInsert {
  page_id: string;
  version: number;
  asset_key: string;
  thumbnail_key?: string | null;
  compiled_prompt: string;
  negative_prompt?: string | null;
  seed?: string | null;
  compiler_snapshot?: Record<string, unknown> | null;
  quality_score?: number | null;
  quality_status?: QualityStatus | null;
  edit_type?: EditType | null;
  edit_prompt?: string | null;
  edit_mask_key?: string | null;
  blots_spent?: number;
}

export interface PageWithVersions extends Page {
  versions?: PageVersion[];
  current_version_data?: PageVersion;
}

// ============================================================================
// Page Functions
// ============================================================================

/**
 * Create a new page record
 */
export async function createPage(data: PageInsert): Promise<Page> {
  const supabase = await createClient();

  const { data: page, error } = await supabase
    .from('pages')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create page: ${error.message}`);
  }

  return page;
}

/**
 * Create multiple pages in batch (for project generation)
 */
export async function createPages(pages: PageInsert[]): Promise<Page[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pages')
    .insert(pages)
    .select();

  if (error) {
    throw new Error(`Failed to create pages: ${error.message}`);
  }

  return data;
}

/**
 * Create a new page version (immutable)
 */
export async function createPageVersion(data: PageVersionInsert): Promise<PageVersion> {
  const supabase = await createClient();

  const { data: version, error } = await supabase
    .from('page_versions')
    .insert({
      page_id: data.page_id,
      version: data.version,
      asset_key: data.asset_key,
      thumbnail_key: data.thumbnail_key || null,
      compiled_prompt: data.compiled_prompt,
      negative_prompt: data.negative_prompt || null,
      seed: data.seed || null,
      compiler_snapshot: data.compiler_snapshot || null,
      quality_score: data.quality_score || null,
      quality_status: data.quality_status || null,
      edit_type: data.edit_type || 'initial',
      edit_prompt: data.edit_prompt || null,
      edit_mask_key: data.edit_mask_key || null,
      blots_spent: data.blots_spent || 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create page version: ${error.message}`);
  }

  return version as PageVersion;
}

/**
 * Get a page with ownership check (via project)
 */
export async function getPage(pageId: string, userId: string): Promise<PageWithVersions> {
  const supabase = await createClient();

  // Get page with project ownership check
  const { data: page, error } = await supabase
    .from('pages')
    .select(`
      *,
      project:projects!inner(owner_id)
    `)
    .eq('id', pageId)
    .single();

  if (error || !page) {
    throw new NotFoundError('Page');
  }

  // Check ownership via project
  const project = page.project as { owner_id: string };
  if (project.owner_id !== userId) {
    throw new ForbiddenError('Access to this page is forbidden');
  }

  // Remove the join data from response
  const { project: _, ...pageData } = page;
  return pageData as PageWithVersions;
}

/**
 * Get all versions of a page ordered by version number
 */
export async function getPageVersions(pageId: string): Promise<PageVersion[]> {
  const supabase = await createClient();

  const { data: versions, error } = await supabase
    .from('page_versions')
    .select('*')
    .eq('page_id', pageId)
    .order('version', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch page versions: ${error.message}`);
  }

  return versions as PageVersion[];
}

/**
 * Get a specific version of a page
 */
export async function getPageVersion(
  pageId: string,
  version: number
): Promise<PageVersion> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('page_versions')
    .select('*')
    .eq('page_id', pageId)
    .eq('version', version)
    .single();

  if (error || !data) {
    throw new NotFoundError('Page version');
  }

  return data as PageVersion;
}

/**
 * Get the current version data for a page
 */
export async function getCurrentPageVersion(pageId: string): Promise<PageVersion> {
  const supabase = await createClient();

  // Get the page's current version number
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('current_version')
    .eq('id', pageId)
    .single();

  if (pageError || !page) {
    throw new NotFoundError('Page');
  }

  return getPageVersion(pageId, page.current_version);
}

/**
 * Update page data
 */
export async function updatePage(
  pageId: string,
  data: PageUpdate
): Promise<Page> {
  const supabase = await createClient();

  const { data: page, error } = await supabase
    .from('pages')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', pageId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update page: ${error.message}`);
  }

  return page;
}

/**
 * Set the current version pointer for a page
 */
export async function setCurrentVersion(
  pageId: string,
  version: number
): Promise<Page> {
  // Verify the version exists
  await getPageVersion(pageId, version);

  return updatePage(pageId, { current_version: version });
}

/**
 * Get the next version number for a page
 */
export async function getNextVersionNumber(pageId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('page_versions')
    .select('version')
    .eq('page_id', pageId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // No versions exist yet
    return 1;
  }

  return (data?.version || 0) + 1;
}

/**
 * Get all pages for a project
 */
export async function getProjectPages(projectId: string): Promise<Page[]> {
  const supabase = await createClient();

  const { data: pages, error } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch project pages: ${error.message}`);
  }

  return pages;
}

/**
 * Get pages with their current version data
 */
export async function getProjectPagesWithVersions(
  projectId: string
): Promise<PageWithVersions[]> {
  const supabase = await createClient();

  const { data: pages, error } = await supabase
    .from('pages')
    .select(`
      *,
      versions:page_versions(*)
    `)
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch project pages: ${error.message}`);
  }

  // Attach current version data to each page
  return (pages || []).map(page => {
    const versions = (page.versions || []) as PageVersion[];
    const currentVersionData = versions.find(v => v.version === page.current_version);
    return {
      ...page,
      versions,
      current_version_data: currentVersionData,
    } as PageWithVersions;
  });
}

/**
 * Delete a page and all its versions
 */
export async function deletePage(pageId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId);

  if (error) {
    throw new Error(`Failed to delete page: ${error.message}`);
  }
}

/**
 * Reorder pages within a project
 */
export async function reorderPages(
  projectId: string,
  pageOrder: { pageId: string; sortOrder: number }[]
): Promise<void> {
  const supabase = await createClient();

  // Update each page's sort_order
  for (const { pageId, sortOrder } of pageOrder) {
    const { error } = await supabase
      .from('pages')
      .update({ sort_order: sortOrder, updated_at: new Date().toISOString() })
      .eq('id', pageId)
      .eq('project_id', projectId);

    if (error) {
      throw new Error(`Failed to reorder pages: ${error.message}`);
    }
  }
}
