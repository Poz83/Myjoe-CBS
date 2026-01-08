-- ============================================================================
-- Add Foreign Key Indexes Migration
-- ============================================================================
-- This migration adds missing indexes for foreign key columns to improve
-- query performance and foreign key constraint enforcement.
-- ============================================================================

-- Add index for assets.hero_id foreign key
CREATE INDEX assets_hero_idx ON assets(hero_id);

-- Add index for job_items.page_id foreign key
CREATE INDEX job_items_page_idx ON job_items(page_id);

-- Add index for projects.hero_id foreign key
CREATE INDEX projects_hero_idx ON projects(hero_id) WHERE deleted_at IS NULL;