-- ============================================================================
-- Migration 007: Billing System Alignment
-- ============================================================================
-- Aligns schema with documentation (03_DATA_MODEL.md, 07_BILLING.md)
-- - Fixes profiles table (dual blot pools, correct plan values)
-- - Creates blot_transactions audit table
-- - Adds all billing helper functions
-- - Fixes constraints on projects, jobs, assets
-- - Adds derive_project_dna trigger
-- - Adds safety_thresholds config
-- ============================================================================

-- ============================================================================
-- 1. FIX PROFILES TABLE
-- ============================================================================

-- Drop old plan constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;

-- Add new constraint with correct values (free, creator, studio)
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'creator', 'studio'));

-- Migrate existing data (starter/pro -> creator/studio)
UPDATE profiles SET plan = 'creator' WHERE plan = 'starter';
UPDATE profiles SET plan = 'studio' WHERE plan = 'pro';

-- Add plan_blots column (selected blot level: 300, 500, 800, etc.)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_blots INTEGER NOT NULL DEFAULT 50;

-- Rename blots -> subscription_blots (resets monthly)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'blots') THEN
    ALTER TABLE profiles RENAME COLUMN blots TO subscription_blots;
  END IF;
END $$;

-- Add pack_blots column (never expires)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pack_blots INTEGER NOT NULL DEFAULT 0;

-- Ensure subscription_blots exists if not renamed
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_blots INTEGER NOT NULL DEFAULT 50;

-- Add Stripe price tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add payment failure tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ;

-- Fix storage default to 25GB (was 1GB)
ALTER TABLE profiles ALTER COLUMN storage_limit_bytes SET DEFAULT 26843545600;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS profiles_owner_idx ON profiles(owner_id);
CREATE INDEX IF NOT EXISTS profiles_plan_idx ON profiles(plan);

-- ============================================================================
-- 2. CREATE BLOT_TRANSACTIONS TABLE (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS blot_transactions (
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
CREATE INDEX IF NOT EXISTS blot_transactions_owner_idx ON blot_transactions(owner_id);
CREATE INDEX IF NOT EXISTS blot_transactions_created_idx ON blot_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS blot_transactions_type_idx ON blot_transactions(type);

-- RLS
ALTER TABLE blot_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON blot_transactions;
CREATE POLICY "Users can view own transactions"
  ON blot_transactions FOR SELECT
  USING (auth.uid() = owner_id);

-- ============================================================================
-- 3. FIX PROJECTS TABLE (Add 'calibrating' status)
-- ============================================================================

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check
  CHECK (status IN ('draft', 'calibrating', 'generating', 'ready', 'exported'));

-- Add missing index
CREATE INDEX IF NOT EXISTS projects_hero_idx ON projects(hero_id);

-- ============================================================================
-- 4. FIX JOBS TABLE (Add 'calibration' type + error_code)
-- ============================================================================

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_type_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_type_check
  CHECK (type IN ('generation', 'export', 'hero_creation', 'calibration'));

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS error_code TEXT;

-- Add missing index for pending/processing jobs
CREATE INDEX IF NOT EXISTS jobs_status_pending_idx ON jobs(status)
  WHERE status IN ('pending', 'processing');

-- Add INSERT policy for jobs
DROP POLICY IF EXISTS "Users can create own jobs" ON jobs;
CREATE POLICY "Users can create own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- ============================================================================
-- 5. FIX ASSETS TABLE
-- ============================================================================

-- Add page_id FK
ALTER TABLE assets ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE SET NULL;

-- Fix type constraint
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_check;
ALTER TABLE assets ADD CONSTRAINT assets_type_check
  CHECK (type IN ('page', 'thumbnail', 'hero', 'hero_thumbnail', 'style_anchor', 'export_pdf', 'export_svg'));

-- Add missing indexes
CREATE INDEX IF NOT EXISTS assets_hero_idx ON assets(hero_id);
CREATE INDEX IF NOT EXISTS assets_type_idx ON assets(type);
CREATE INDEX IF NOT EXISTS assets_page_idx ON assets(page_id);

-- Storage tracking trigger
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
    SET storage_used_bytes = GREATEST(0, storage_used_bytes - OLD.size_bytes),
        updated_at = NOW()
    WHERE owner_id = OLD.owner_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_storage ON assets;
CREATE TRIGGER track_storage
  AFTER INSERT OR DELETE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_storage_used();

-- ============================================================================
-- 6. ADD HELPER FUNCTIONS FOR BILLING
-- ============================================================================

-- Get total available Blots (subscription + pack)
CREATE OR REPLACE FUNCTION get_available_blots(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(subscription_blots, 0) + COALESCE(pack_blots, 0)
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

  -- Check sufficient total balance
  IF (profile_row.subscription_blots + profile_row.pack_blots) < amount THEN
    RETURN FALSE;
  END IF;

  -- Calculate split: subscription first, then pack
  IF profile_row.subscription_blots >= amount THEN
    sub_deduct := amount;
    pack_deduct := 0;
  ELSE
    sub_deduct := profile_row.subscription_blots;
    pack_deduct := amount - sub_deduct;
  END IF;

  -- Update balances
  UPDATE profiles SET
    subscription_blots = subscription_blots - sub_deduct,
    pack_blots = pack_blots - pack_deduct,
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

-- Add pack Blots (on purchase)
CREATE OR REPLACE FUNCTION add_pack_blots(
  user_id UUID,
  amount INTEGER,
  p_pack_id TEXT,
  session_id TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET
    pack_blots = pack_blots + amount,
    updated_at = NOW()
  WHERE owner_id = user_id;

  INSERT INTO blot_transactions (
    owner_id, type, pack_delta, pack_id, stripe_session_id, description
  ) VALUES (
    user_id, 'pack_purchase', amount, p_pack_id, session_id,
    'Blot pack: ' || p_pack_id || ' (+' || amount || ')'
  );
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
    subscription_blots = new_amount,
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
    subscription_blots = subscription_blots + blot_difference,
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
    subscription_blots = subscription_blots + amount,
    updated_at = NOW()
  WHERE owner_id = user_id;

  INSERT INTO blot_transactions (
    owner_id, type, subscription_delta, job_id, description
  ) VALUES (
    user_id, 'refund', amount, p_job_id, reason
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. ADD DERIVE_PROJECT_DNA TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION derive_project_dna()
RETURNS TRIGGER AS $$
BEGIN
  -- Derive line_weight from audience
  NEW.line_weight := CASE NEW.audience
    WHEN 'toddler' THEN 'thick'
    WHEN 'children' THEN 'thick'
    WHEN 'tween' THEN 'medium'
    WHEN 'teen' THEN 'medium'
    WHEN 'adult' THEN 'fine'
  END;

  -- Derive complexity from audience
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

DROP TRIGGER IF EXISTS set_project_dna ON projects;
CREATE TRIGGER set_project_dna
  BEFORE INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION derive_project_dna();

-- ============================================================================
-- 8. ADD MISSING INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS heroes_audience_idx ON heroes(audience);
CREATE INDEX IF NOT EXISTS pages_sort_idx ON pages(project_id, sort_order);
CREATE INDEX IF NOT EXISTS page_versions_page_version_idx ON page_versions(page_id, version DESC);
CREATE INDEX IF NOT EXISTS job_items_page_idx ON job_items(page_id);

-- ============================================================================
-- 9. ADD SAFETY_THRESHOLDS TO GLOBAL_CONFIG
-- ============================================================================

INSERT INTO global_config (key, value, description) VALUES
  ('safety_thresholds', '{
    "toddler": {"violence": 0.05, "sexual": 0.01},
    "children": {"violence": 0.10, "sexual": 0.05},
    "tween": {"violence": 0.20, "sexual": 0.10},
    "teen": {"violence": 0.30, "sexual": 0.15},
    "adult": {"violence": 0.50, "sexual": 0.30}
  }'::jsonb, 'Safety thresholds by audience')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 10. GRANT PERMISSIONS FOR HELPER FUNCTIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_available_blots(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_blots(UUID, INTEGER, TEXT, TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION add_pack_blots(UUID, INTEGER, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION reset_subscription_blots(UUID, INTEGER, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION add_upgrade_blots(UUID, INTEGER, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION refund_blots(UUID, INTEGER, UUID, TEXT) TO service_role;
