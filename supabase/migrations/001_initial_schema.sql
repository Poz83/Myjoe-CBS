-- ============================================================================
-- Myjoe Database Schema Migration
-- ============================================================================
-- This migration creates all tables, triggers, indexes, and RLS policies
-- for the Myjoe coloring book application.
-- ============================================================================

-- ============================================================================
-- TABLES (in dependency order)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles
-- User profile and subscription data. Created automatically on signup via trigger.
-- ----------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'creator', 'pro')),
  blots INTEGER NOT NULL DEFAULT 50,
  blots_reset_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Storage
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  storage_limit_bytes BIGINT NOT NULL DEFAULT 1073741824, -- 1 GB
  
  -- Status
  disabled_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(owner_id)
);

-- ----------------------------------------------------------------------------
-- heroes
-- Hero characters with reference sheets. Includes target audience for age-appropriate rendering.
-- ----------------------------------------------------------------------------
CREATE TABLE heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT NOT NULL, -- User's original description
  
  -- Target audience (affects how hero is rendered)
  audience TEXT NOT NULL CHECK (audience IN ('toddler', 'children', 'tween', 'teen', 'adult')),
  
  -- Compiled prompt (AI-enhanced for consistency)
  compiled_prompt TEXT NOT NULL,
  negative_prompt TEXT,
  
  -- Reference sheet (2x2 grid: front, side, back, 3/4)
  reference_key TEXT NOT NULL, -- R2 key
  thumbnail_key TEXT,
  
  -- Metadata
  style_preset TEXT, -- Optional: lock to specific style
  times_used INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- projects
-- Coloring book projects with Project DNA (locked style settings).
-- ----------------------------------------------------------------------------
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hero_id UUID REFERENCES heroes(id) ON DELETE SET NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Project DNA (locked at creation)
  page_count INTEGER NOT NULL CHECK (page_count BETWEEN 1 AND 45),
  trim_size TEXT NOT NULL DEFAULT '8.5x11' CHECK (trim_size IN ('8.5x11', '8.5x8.5', '6x9')),
  audience TEXT NOT NULL CHECK (audience IN ('toddler', 'children', 'tween', 'teen', 'adult')),
  style_preset TEXT NOT NULL CHECK (style_preset IN ('bold-simple', 'kawaii', 'whimsical', 'cartoon', 'botanical')),
  
  -- Derived from audience (computed on insert)
  line_weight TEXT NOT NULL CHECK (line_weight IN ('thick', 'medium', 'fine')),
  complexity TEXT NOT NULL CHECK (complexity IN ('minimal', 'moderate', 'detailed', 'intricate')),
  
  -- Style anchor (set after calibration)
  style_anchor_key TEXT,
  style_anchor_description TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'exported')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- pages
-- Individual pages within a project.
-- ----------------------------------------------------------------------------
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Position
  sort_order INTEGER NOT NULL,
  
  -- Type
  page_type TEXT NOT NULL DEFAULT 'illustration' 
    CHECK (page_type IN ('illustration', 'text-focus', 'pattern', 'educational')),
  
  -- Current version pointer
  current_version INTEGER NOT NULL DEFAULT 1,
  
  -- Scene info
  scene_brief TEXT, -- Short description for user
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(project_id, sort_order)
);

-- ----------------------------------------------------------------------------
-- page_versions
-- Immutable version history for each page.
-- ----------------------------------------------------------------------------
CREATE TABLE page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  
  -- Version number (1, 2, 3, ...)
  version INTEGER NOT NULL,
  
  -- Assets
  asset_key TEXT NOT NULL, -- R2 key for full image
  thumbnail_key TEXT,      -- R2 key for thumbnail
  
  -- Generation context (for reproducibility)
  compiled_prompt TEXT NOT NULL,
  negative_prompt TEXT,
  seed TEXT, -- If using Flux later
  
  -- Full compiler snapshot (JSON blob for debugging)
  compiler_snapshot JSONB,
  
  -- Quality
  quality_score REAL,
  quality_status TEXT CHECK (quality_status IN ('pass', 'needs_review', 'fail')),
  
  -- Edit info
  edit_type TEXT CHECK (edit_type IN ('initial', 'regenerate', 'inpaint', 'quick_action')),
  edit_prompt TEXT, -- What user asked for (if edit)
  edit_mask_key TEXT, -- R2 key for inpaint mask (if applicable)
  
  -- Cost tracking
  blots_spent INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(page_id, version)
);

-- ----------------------------------------------------------------------------
-- jobs
-- Async job tracking for generation, export, etc.
-- ----------------------------------------------------------------------------
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Job info
  type TEXT NOT NULL CHECK (type IN ('generation', 'export', 'hero_creation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Progress
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  
  -- Cost
  blots_reserved INTEGER NOT NULL DEFAULT 0,
  blots_spent INTEGER NOT NULL DEFAULT 0,
  blots_refunded INTEGER NOT NULL DEFAULT 0,
  
  -- Error info
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- job_items
-- Individual items within a job (e.g., each page in a generation job).
-- ----------------------------------------------------------------------------
CREATE TABLE job_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  
  -- Result
  asset_key TEXT,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- assets
-- Track all stored assets for storage quota management.
-- ----------------------------------------------------------------------------
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Type
  type TEXT NOT NULL CHECK (type IN ('page', 'thumbnail', 'hero', 'export', 'style_anchor')),
  
  -- R2 info
  r2_key TEXT NOT NULL UNIQUE,
  size_bytes BIGINT NOT NULL,
  content_type TEXT,
  
  -- Reference (optional)
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  hero_id UUID REFERENCES heroes(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- global_config
-- Application-wide configuration and kill switches.
-- ----------------------------------------------------------------------------
CREATE TABLE global_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (owner_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- DEFAULT CONFIG VALUES
-- ============================================================================

INSERT INTO global_config (key, value, description) VALUES
  ('generation_enabled', 'true'::jsonb, 'Master switch for generation'),
  ('export_enabled', 'true'::jsonb, 'Master switch for exports'),
  ('signup_enabled', 'true'::jsonb, 'Allow new signups'),
  ('maintenance_mode', 'false'::jsonb, 'Show maintenance page'),
  ('rate_limits', '{"generation": 5, "export": 10}'::jsonb, 'Rate limit config');

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX profiles_stripe_customer_idx ON profiles(stripe_customer_id);

-- Projects
CREATE INDEX projects_owner_status_idx ON projects(owner_id, status) WHERE deleted_at IS NULL;

-- Heroes
CREATE INDEX heroes_owner_idx ON heroes(owner_id) WHERE deleted_at IS NULL;

-- Pages
CREATE INDEX pages_project_idx ON pages(project_id);

-- Page versions
CREATE INDEX page_versions_page_idx ON page_versions(page_id);

-- Jobs
CREATE INDEX jobs_owner_status_idx ON jobs(owner_id, status);
CREATE INDEX jobs_project_idx ON jobs(project_id);

-- Job items
CREATE INDEX job_items_job_idx ON job_items(job_id);
CREATE INDEX job_items_status_idx ON job_items(job_id, status);

-- Assets
CREATE INDEX assets_owner_idx ON assets(owner_id);
CREATE INDEX assets_project_idx ON assets(project_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = owner_id);

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL
  USING (auth.uid() = owner_id);

-- Heroes
ALTER TABLE heroes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own heroes"
  ON heroes FOR ALL
  USING (auth.uid() = owner_id);

-- Pages (via project ownership)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own pages"
  ON pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Page versions (via page -> project ownership)
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own page versions"
  ON page_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN projects ON projects.id = pages.project_id
      WHERE pages.id = page_versions.page_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = owner_id);

-- Job items (via job ownership)
ALTER TABLE job_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own job items"
  ON job_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_items.job_id
      AND jobs.owner_id = auth.uid()
    )
  );

-- Assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own assets"
  ON assets FOR ALL
  USING (auth.uid() = owner_id);

-- Global config (read-only for all)
ALTER TABLE global_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read config"
  ON global_config FOR SELECT
  USING (true);
