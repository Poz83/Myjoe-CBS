-- ============================================================================
-- RLS Policies Fix Migration
-- ============================================================================
-- This migration fixes RLS policies to match Prompt 1.3 requirements:
-- 1. Projects policy must check deleted_at IS NULL
-- 2. Pages policy must check projects.deleted_at IS NULL
-- 3. Page_versions policy must check projects.deleted_at IS NULL
-- ============================================================================

-- Drop existing policies that need fixes
DROP POLICY IF EXISTS "Users can CRUD own projects" ON projects;
DROP POLICY IF EXISTS "Users can CRUD own pages" ON pages;
DROP POLICY IF EXISTS "Users can CRUD own page versions" ON page_versions;

-- Projects: Add deleted_at filter
CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL
  USING (auth.uid() = owner_id AND deleted_at IS NULL);

-- Pages: Add deleted_at filter on parent project
CREATE POLICY "Users can CRUD own pages"
  ON pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  );

-- Page versions: Add deleted_at filter on parent project
CREATE POLICY "Users can CRUD own page versions"
  ON page_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN projects ON projects.id = pages.project_id
      WHERE pages.id = page_versions.page_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  );
