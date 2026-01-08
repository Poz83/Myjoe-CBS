-- ============================================================================
-- RLS Performance Fix Migration
-- ============================================================================
-- This migration fixes RLS policy performance issues by wrapping auth.uid()
-- calls with (select auth.uid()) to prevent re-evaluation for each row.
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
-- ============================================================================

-- Drop existing policies that need auth.uid() wrapping fixes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can CRUD own heroes" ON heroes;
DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can view own job items" ON job_items;
DROP POLICY IF EXISTS "Users can CRUD own assets" ON assets;
DROP POLICY IF EXISTS "Users can CRUD own projects" ON projects;
DROP POLICY IF EXISTS "Users can CRUD own pages" ON pages;
DROP POLICY IF EXISTS "Users can CRUD own page versions" ON page_versions;

-- Recreate policies with performance optimizations

-- Profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING ((select auth.uid()) = owner_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING ((select auth.uid()) = owner_id);

-- Heroes
CREATE POLICY "Users can CRUD own heroes"
  ON heroes FOR ALL
  USING ((select auth.uid()) = owner_id);

-- Jobs
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING ((select auth.uid()) = owner_id);

-- Job items (via job ownership)
CREATE POLICY "Users can view own job items"
  ON job_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_items.job_id
      AND jobs.owner_id = (select auth.uid())
    )
  );

-- Assets
CREATE POLICY "Users can CRUD own assets"
  ON assets FOR ALL
  USING ((select auth.uid()) = owner_id);

-- Projects
CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL
  USING ((select auth.uid()) = owner_id AND deleted_at IS NULL);

-- Pages (via project ownership)
CREATE POLICY "Users can CRUD own pages"
  ON pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
      AND projects.owner_id = (select auth.uid())
      AND projects.deleted_at IS NULL
    )
  );

-- Page versions (via page -> project ownership)
CREATE POLICY "Users can CRUD own page versions"
  ON page_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN projects ON projects.id = pages.project_id
      WHERE pages.id = page_versions.page_id
      AND projects.owner_id = (select auth.uid())
      AND projects.deleted_at IS NULL
    )
  );