# Data Model

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    profiles     │       │    projects     │       │      pages      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │──┐    │ id (PK)         │
│ owner_id (FK)   │  │    │ owner_id (FK)   │  │    │ project_id (FK) │──┐
│ plan            │  │    │ hero_id (FK)    │──┼──┐ │ sort_order      │  │
│ plan_blots      │  └────│                 │  │  │ │ page_type       │  │
│ subscription_   │       │ name            │  │  │ │ current_version │  │
│   blots         │       │ audience        │  │  │ │ scene_brief     │  │
│ commercial_projects_used │ style_preset    │  │  │ └─────────────────┘  │
│ stripe_*        │       │ ...             │  │  │                      │
└─────────────────┘       └─────────────────┘  │  │ ┌────────────────────┘
                                               │  │ │
┌─────────────────┐                            │  │ │ ┌─────────────────┐
│     heroes      │                            │  │ │ │  page_versions  │
├─────────────────┤                            │  │ │ ├─────────────────┤
│ id (PK)         │◄───────────────────────────┘  │ └─│ page_id (FK)    │
│ owner_id (FK)   │                               │   │ version         │
│ name            │                               │   │ asset_key       │
│ description     │                               │   │ thumbnail_key   │
│ audience        │                               │   │ compiled_prompt │
│ compiled_prompt │                               │   │ seed            │
│ reference_key   │                               │   │ quality_*       │
└─────────────────┘                               │   │ edit_type       │
                                                  │   │ blots_spent     │
┌─────────────────┐       ┌─────────────────┐     │   └─────────────────┘
│      jobs       │       │    job_items    │     │
├─────────────────┤       ├─────────────────┤     │
│ id (PK)         │──┐    │ id (PK)         │     │
│ owner_id (FK)   │  │    │ job_id (FK)     │     │
│ project_id (FK) │──┼────│ page_id (FK)    │─────┘
│ type            │  │    │ status          │
│ status          │  │    │ retry_count     │
│ blots_reserved  │  │    │ asset_key       │
│ blots_spent     │  │    │ error_message   │
└─────────────────┘  │    └─────────────────┘
                     │
┌─────────────────┐  │    ┌─────────────────┐     ┌─────────────────────┐
│     assets      │  │    │  global_config  │     │  blot_transactions  │
├─────────────────┤  │    ├─────────────────┤     ├─────────────────────┤
│ id (PK)         │  │    │ key (PK)        │     │ id (PK)             │
│ owner_id (FK)   │  │    │ value (JSONB)   │     │ owner_id (FK)       │
│ type            │  │    │ description     │     │ type                │
│ r2_key          │  │    └─────────────────┘     │ subscription_delta  │
│ size_bytes      │  │                            │ pack_delta          │
│ project_id (FK) │──┘                            │ description         │
│ hero_id (FK)    │                               │ job_id (FK)         │
└─────────────────┘                               │ stripe_session_id   │
                                                  │ pack_id             │
                                                  └─────────────────────┘
```

---

## Tables

### profiles

User profile, subscription, and Blot balances. Created automatically on signup via trigger.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription (2-tier model: free, creator, studio)
  plan TEXT NOT NULL DEFAULT 'free' 
    CHECK (plan IN ('free', 'creator', 'studio')),
  plan_blots INTEGER NOT NULL DEFAULT 50,  -- Selected Blot level (300, 500, 800, etc.)
  
  -- Blot balances (two separate pools)
  blots INTEGER NOT NULL DEFAULT 75,                -- Single pool, resets monthly
  commercial_projects_used INTEGER NOT NULL DEFAULT 0, -- Free tier tracking
  blots_reset_at TIMESTAMPTZ,
  
  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,  -- Current price ID for upgrade handling
  payment_failed_at TIMESTAMPTZ,
  
  -- Storage
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  storage_limit_bytes BIGINT NOT NULL DEFAULT 26843545600, -- 25 GB default
  
  -- Account status
  disabled_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(owner_id)
);

-- Indexes
CREATE INDEX profiles_owner_idx ON profiles(owner_id);
CREATE INDEX profiles_stripe_customer_idx ON profiles(stripe_customer_id);
CREATE INDEX profiles_plan_idx ON profiles(plan);

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
```

---

### blot_transactions

Audit trail for all Blot credits and debits.

```sql
CREATE TABLE blot_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction type
  type TEXT NOT NULL CHECK (type IN (
    'subscription_reset',    -- Monthly reset
    'subscription_upgrade',  -- Mid-cycle upgrade (Blot difference added)
    'pack_purchase',         -- Bought a pack
    'generation',            -- Used for page generation
    'edit',                  -- Used for page edit
    'hero',                  -- Used for hero creation
    'calibration',           -- Used for style calibration
    'refund'                 -- Refunded (job failed)
  )),
  
  -- Amounts (positive = credit, negative = debit)
  subscription_delta INTEGER NOT NULL DEFAULT 0,
  pack_delta INTEGER NOT NULL DEFAULT 0,
  
  -- Context
  description TEXT,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  stripe_session_id TEXT,
  stripe_invoice_id TEXT,
  pack_id TEXT,  -- 'topup' or 'boost'
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX blot_transactions_owner_idx ON blot_transactions(owner_id);
CREATE INDEX blot_transactions_created_idx ON blot_transactions(created_at DESC);
CREATE INDEX blot_transactions_type_idx ON blot_transactions(type);
```

---

### projects

Coloring book projects with locked "Project DNA" settings.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hero_id UUID REFERENCES heroes(id) ON DELETE SET NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Project DNA (LOCKED at creation - cannot be changed)
  page_count INTEGER NOT NULL CHECK (page_count BETWEEN 1 AND 45),
  trim_size TEXT NOT NULL DEFAULT '8.5x11' 
    CHECK (trim_size IN ('8.5x11', '8.5x8.5', '6x9')),
  audience TEXT NOT NULL 
    CHECK (audience IN ('toddler', 'children', 'tween', 'teen', 'adult')),
  style_preset TEXT NOT NULL 
    CHECK (style_preset IN ('bold-simple', 'kawaii', 'whimsical', 'cartoon', 'botanical')),
  
  -- Derived from audience (computed on insert, locked)
  line_weight TEXT NOT NULL CHECK (line_weight IN ('thick', 'medium', 'fine')),
  complexity TEXT NOT NULL CHECK (complexity IN ('minimal', 'moderate', 'detailed', 'intricate')),
  
  -- Style anchor (set after calibration)
  style_anchor_key TEXT,
  style_anchor_description TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'calibrating', 'generating', 'ready', 'exported')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX projects_owner_idx ON projects(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX projects_owner_status_idx ON projects(owner_id, status) WHERE deleted_at IS NULL;
CREATE INDEX projects_hero_idx ON projects(hero_id);

-- Trigger to derive line_weight and complexity from audience
CREATE OR REPLACE FUNCTION derive_project_dna()
RETURNS TRIGGER AS $$
BEGIN
  -- Derive line_weight
  NEW.line_weight := CASE NEW.audience
    WHEN 'toddler' THEN 'thick'
    WHEN 'children' THEN 'thick'
    WHEN 'tween' THEN 'medium'
    WHEN 'teen' THEN 'medium'
    WHEN 'adult' THEN 'fine'
  END;
  
  -- Derive complexity
  NEW.complexity := CASE NEW.audience
    WHEN 'toddler' THEN 'minimal'
    WHEN 'children' THEN 'moderate'
    WHEN 'tween' THEN 'moderate'
    WHEN 'teen' THEN 'detailed'
    WHEN 'adult' THEN 'intricate'
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_project_dna
  BEFORE INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION derive_project_dna();
```

---

### heroes

Hero characters with reference sheets for consistency.

```sql
CREATE TABLE heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT NOT NULL,  -- User's original description
  
  -- Target audience (affects rendering style)
  audience TEXT NOT NULL 
    CHECK (audience IN ('toddler', 'children', 'tween', 'teen', 'adult')),
  
  -- AI-compiled prompts
  compiled_prompt TEXT NOT NULL,
  negative_prompt TEXT,
  
  -- Reference sheet (2×2 grid: front, side, back, 3/4)
  reference_key TEXT NOT NULL,  -- R2 key for full image
  thumbnail_key TEXT,           -- R2 key for thumbnail
  
  -- Metadata
  style_preset TEXT,  -- Optional: lock to specific style
  times_used INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX heroes_owner_idx ON heroes(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX heroes_audience_idx ON heroes(audience);
```

---

### pages

Individual pages within a project.

```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Position (1-indexed)
  sort_order INTEGER NOT NULL,
  
  -- Page type
  page_type TEXT NOT NULL DEFAULT 'illustration' 
    CHECK (page_type IN ('illustration', 'text-focus', 'pattern', 'educational')),
  
  -- Current version pointer (for quick access)
  current_version INTEGER NOT NULL DEFAULT 1,
  
  -- Scene description (for user reference)
  scene_brief TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(project_id, sort_order)
);

-- Indexes
CREATE INDEX pages_project_idx ON pages(project_id);
CREATE INDEX pages_sort_idx ON pages(project_id, sort_order);
```

---

### page_versions

Immutable version history for each page. Each edit creates a new version.

```sql
CREATE TABLE page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  
  -- Version number (1, 2, 3, ...)
  version INTEGER NOT NULL,
  
  -- Generated assets
  asset_key TEXT NOT NULL,     -- R2 key for full image
  thumbnail_key TEXT,          -- R2 key for thumbnail
  
  -- Generation context (for reproducibility)
  compiled_prompt TEXT NOT NULL,
  negative_prompt TEXT,
  seed TEXT,  -- Flux seed for exact reproduction
  
  -- Full compiler state (JSON for debugging/replay)
  compiler_snapshot JSONB,
  
  -- Quality assessment
  quality_score REAL,  -- 0.0 to 1.0
  quality_status TEXT CHECK (quality_status IN ('pass', 'needs_review', 'fail')),
  
  -- Edit tracking
  edit_type TEXT CHECK (edit_type IN ('initial', 'regenerate', 'inpaint', 'quick_action')),
  edit_prompt TEXT,      -- What user asked for (if edit)
  edit_mask_key TEXT,    -- R2 key for inpaint mask (if applicable)
  
  -- Cost tracking
  blots_spent INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(page_id, version)
);

-- Indexes
CREATE INDEX page_versions_page_idx ON page_versions(page_id);
CREATE INDEX page_versions_page_version_idx ON page_versions(page_id, version DESC);
```

---

### jobs

Async job tracking for generation, export, hero creation.

```sql
CREATE TYPE job_type AS ENUM ('generation', 'export', 'hero_creation', 'calibration');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Job info
  type job_type NOT NULL,
  status job_status NOT NULL DEFAULT 'pending',
  
  -- Progress tracking
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  
  -- Blot accounting
  blots_reserved INTEGER NOT NULL DEFAULT 0,  -- Deducted at job start
  blots_spent INTEGER NOT NULL DEFAULT 0,     -- Actually used
  blots_refunded INTEGER NOT NULL DEFAULT 0,  -- Returned on failure
  
  -- Error info
  error_message TEXT,
  error_code TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX jobs_owner_idx ON jobs(owner_id);
CREATE INDEX jobs_owner_status_idx ON jobs(owner_id, status);
CREATE INDEX jobs_project_idx ON jobs(project_id);
CREATE INDEX jobs_status_idx ON jobs(status) WHERE status IN ('pending', 'processing');
```

---

### job_items

Individual items within a job (e.g., each page in a generation job).

```sql
CREATE TYPE job_item_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'skipped');

CREATE TABLE job_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  
  -- Status
  status job_item_status NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  
  -- Result
  asset_key TEXT,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX job_items_job_idx ON job_items(job_id);
CREATE INDEX job_items_status_idx ON job_items(job_id, status);
CREATE INDEX job_items_page_idx ON job_items(page_id);
```

---

### assets

Track all stored assets for storage quota management.

```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Asset type
  type TEXT NOT NULL CHECK (type IN (
    'page', 'thumbnail', 'hero', 'hero_thumbnail',
    'style_anchor', 'export_pdf', 'export_svg'
  )),
  
  -- R2 storage info
  r2_key TEXT NOT NULL UNIQUE,
  size_bytes BIGINT NOT NULL,
  content_type TEXT,
  
  -- Optional references
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  hero_id UUID REFERENCES heroes(id) ON DELETE SET NULL,
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX assets_owner_idx ON assets(owner_id);
CREATE INDEX assets_project_idx ON assets(project_id);
CREATE INDEX assets_hero_idx ON assets(hero_id);
CREATE INDEX assets_type_idx ON assets(type);

-- Trigger to update profile storage on insert/delete
CREATE OR REPLACE FUNCTION update_storage_used()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET storage_used_bytes = storage_used_bytes + NEW.size_bytes,
        updated_at = NOW()
    WHERE owner_id = NEW.owner_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles 
    SET storage_used_bytes = storage_used_bytes - OLD.size_bytes,
        updated_at = NOW()
    WHERE owner_id = OLD.owner_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_storage
  AFTER INSERT OR DELETE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_storage_used();
```

---

### global_config

Application-wide configuration and kill switches.

```sql
CREATE TABLE global_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert defaults
INSERT INTO global_config (key, value, description) VALUES
  ('generation_enabled', 'true', 'Master switch for generation'),
  ('export_enabled', 'true', 'Master switch for exports'),
  ('signup_enabled', 'true', 'Allow new signups'),
  ('maintenance_mode', 'false', 'Show maintenance page'),
  ('rate_limits', '{"generation": 5, "export": 10}', 'Rate limit config'),
  ('safety_thresholds', '{
    "toddler": {"violence": 0.05, "sexual": 0.01},
    "children": {"violence": 0.10, "sexual": 0.05},
    "tween": {"violence": 0.20, "sexual": 0.10},
    "teen": {"violence": 0.30, "sexual": 0.15},
    "adult": {"violence": 0.50, "sexual": 0.30}
  }', 'Safety thresholds by audience');
```

---

## Blot Helper Functions

```sql
-- Get total available Blots (subscription + pack)
CREATE OR REPLACE FUNCTION get_available_blots(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(blots, 0)
  FROM profiles WHERE owner_id = user_id;
$$ LANGUAGE sql STABLE;

-- Deduct Blots (subscription first, then pack)
CREATE OR REPLACE FUNCTION deduct_blots(
  user_id UUID, 
  amount INTEGER,
  tx_type TEXT DEFAULT 'generation',
  tx_description TEXT DEFAULT NULL,
  tx_job_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  profile_row profiles%ROWTYPE;
  sub_deduct INTEGER;
  pack_deduct INTEGER;
BEGIN
  -- Lock the row for update
  SELECT * INTO profile_row FROM profiles WHERE owner_id = user_id FOR UPDATE;
  
  -- Check sufficient balance
  IF profile_row.blots < amount THEN
    RETURN FALSE;
  END IF;

  -- Update balance
  UPDATE profiles SET
    blots = blots - amount,
    updated_at = NOW()
  WHERE owner_id = user_id;
  
  -- Log transaction
  INSERT INTO blot_transactions (
    owner_id, type, subscription_delta, pack_delta, description, job_id
  ) VALUES (
    user_id, tx_type, -sub_deduct, -pack_deduct, tx_description, tx_job_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- Reset subscription Blots (on renewal)
CREATE OR REPLACE FUNCTION reset_subscription_blots(
  user_id UUID,
  new_amount INTEGER,
  invoice_id TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET
    blots = new_amount,
    blots_reset_at = NOW() + INTERVAL '1 month',
    payment_failed_at = NULL,
    updated_at = NOW()
  WHERE owner_id = user_id;
  
  INSERT INTO blot_transactions (
    owner_id, type, subscription_delta, stripe_invoice_id, description
  ) VALUES (
    user_id, 'subscription_reset', new_amount, invoice_id, 
    'Monthly reset: ' || new_amount || ' Blots'
  );
END;
$$ LANGUAGE plpgsql;

-- Add Blots on mid-cycle upgrade (difference only)
CREATE OR REPLACE FUNCTION add_upgrade_blots(
  user_id UUID,
  blot_difference INTEGER,
  invoice_id TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET
    blots = blots + blot_difference,
    updated_at = NOW()
  WHERE owner_id = user_id;
  
  INSERT INTO blot_transactions (
    owner_id, type, subscription_delta, stripe_invoice_id, description
  ) VALUES (
    user_id, 'subscription_upgrade', blot_difference, invoice_id, 
    'Upgrade: +' || blot_difference || ' Blots'
  );
END;
$$ LANGUAGE plpgsql;

-- Refund Blots (on job failure)
CREATE OR REPLACE FUNCTION refund_blots(
  user_id UUID,
  amount INTEGER,
  p_job_id UUID,
  reason TEXT
) RETURNS VOID AS $$
BEGIN
  -- Refund to subscription pool (simpler than tracking original source)
  UPDATE profiles SET
    blots = blots + amount,
    updated_at = NOW()
  WHERE owner_id = user_id;
  
  INSERT INTO blot_transactions (
    owner_id, type, subscription_delta, job_id, description
  ) VALUES (
    user_id, 'refund', amount, p_job_id, reason
  );
END;
$$ LANGUAGE plpgsql;
```

---

## Row Level Security (RLS)

**CRITICAL: Enable RLS on all tables with user data**

```sql
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

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

-- Page versions (via page → project ownership)
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

CREATE POLICY "Users can create own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

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

-- Blot transactions
ALTER TABLE blot_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON blot_transactions FOR SELECT
  USING (auth.uid() = owner_id);

-- Global config (read-only for all authenticated users)
ALTER TABLE global_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read config"
  ON global_config FOR SELECT
  USING (auth.role() = 'authenticated');
```

---

## TypeScript Types

Generated via: `npx supabase gen types typescript --local > src/types/database.ts`

### Domain Types (src/types/domain.ts)

```typescript
// Tier & Billing
export type Tier = 'free' | 'creator' | 'studio';
export type PackId = 'topup' | 'boost';
export type Interval = 'monthly' | 'yearly';

// Content
export type Audience = 'toddler' | 'children' | 'tween' | 'teen' | 'adult';
export type StylePreset = 'bold-simple' | 'kawaii' | 'whimsical' | 'cartoon' | 'botanical';
export type LineWeight = 'thick' | 'medium' | 'fine';
export type Complexity = 'minimal' | 'moderate' | 'detailed' | 'intricate';
export type TrimSize = '8.5x11' | '8.5x8.5' | '6x9';
export type PageType = 'illustration' | 'text-focus' | 'pattern' | 'educational';

// Jobs
export type JobType = 'generation' | 'export' | 'hero_creation' | 'calibration';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type JobItemStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

// Quality
export type QualityStatus = 'pass' | 'needs_review' | 'fail';
export type EditType = 'initial' | 'regenerate' | 'inpaint' | 'quick_action';

// Blots
export type BlotTransactionType = 
  | 'subscription_reset' 
  | 'subscription_upgrade'
  | 'pack_purchase' 
  | 'generation' 
  | 'edit' 
  | 'hero' 
  | 'calibration' 
  | 'refund';

// Composite types
export interface BlotBalance {
  subscription: number;
  pack: number;
  total: number;
  plan: Tier;
  planBlots: number;
  resetsAt: Date | null;
}

export interface ProjectDNA {
  pageCount: number;
  trimSize: TrimSize;
  audience: Audience;
  stylePreset: StylePreset;
  lineWeight: LineWeight;
  complexity: Complexity;
  styleAnchorKey?: string;
  styleAnchorDescription?: string;
  heroId?: string;
}

export interface SafetyResult {
  safe: boolean;
  reason?: string;
  blockedKeywords?: string[];
  violations?: string[];
  suggestions?: string[];
}
```

---

## Migration Order

When setting up a new database:

```sql
-- 1. Extensions (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enum types
CREATE TYPE job_type AS ENUM (...);
CREATE TYPE job_status AS ENUM (...);
CREATE TYPE job_item_status AS ENUM (...);

-- 3. Tables (in order of dependencies)
-- profiles (no deps)
-- heroes (deps: auth.users)
-- projects (deps: auth.users, heroes)
-- pages (deps: projects)
-- page_versions (deps: pages)
-- jobs (deps: auth.users, projects)
-- job_items (deps: jobs, pages)
-- assets (deps: auth.users, projects, heroes, pages)
-- blot_transactions (deps: auth.users, jobs)
-- global_config (no deps)

-- 4. Triggers
-- handle_new_user
-- derive_project_dna
-- track_storage

-- 5. Functions
-- get_available_blots
-- deduct_blots
-- reset_subscription_blots
-- add_upgrade_blots
-- refund_blots

-- 6. RLS policies

-- 7. Seed data (global_config defaults)
```
