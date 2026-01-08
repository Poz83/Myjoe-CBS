-- ============================================================================
-- Migration 008: Corbin Method Simplification
-- ============================================================================
-- Simplifies billing to 2-tier dropdown method (no packs):
-- - Merges pack_blots into subscription_blots
-- - Renames subscription_blots to blots (single pool)
-- - Drops pack_blots column
-- - Adds commercial_projects_used for free tier tracking
-- - Updates free tier blots from 50 to 75
-- - Simplifies helper functions
-- ============================================================================

-- ============================================================================
-- 1. MERGE PACK_BLOTS INTO SUBSCRIPTION_BLOTS
-- ============================================================================

-- First, add any pack_blots to subscription_blots
UPDATE profiles 
SET subscription_blots = subscription_blots + COALESCE(pack_blots, 0)
WHERE pack_blots > 0;

-- ============================================================================
-- 2. RENAME SUBSCRIPTION_BLOTS TO BLOTS
-- ============================================================================

-- Check if blots column exists (might already be there), if not rename
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'blots') THEN
    ALTER TABLE profiles RENAME COLUMN subscription_blots TO blots;
  END IF;
END $$;

-- ============================================================================
-- 3. DROP PACK_BLOTS COLUMN
-- ============================================================================

ALTER TABLE profiles DROP COLUMN IF EXISTS pack_blots;

-- ============================================================================
-- 4. ADD COMMERCIAL_PROJECTS_USED FOR FREE TIER
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commercial_projects_used INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN profiles.commercial_projects_used IS 
  'Number of commercial projects used by free tier users (max 1 allowed)';

-- ============================================================================
-- 5. UPDATE FREE TIER DEFAULTS (50 -> 75 blots)
-- ============================================================================

-- Update default for new free users
ALTER TABLE profiles ALTER COLUMN blots SET DEFAULT 75;
ALTER TABLE profiles ALTER COLUMN plan_blots SET DEFAULT 75;

-- Update existing free users to 75 blots
UPDATE profiles 
SET blots = 75, plan_blots = 75 
WHERE plan = 'free' AND blots < 75;

-- ============================================================================
-- 6. SIMPLIFY BLOT_TRANSACTIONS TABLE
-- ============================================================================

-- Update type constraint to remove pack_purchase
ALTER TABLE blot_transactions DROP CONSTRAINT IF EXISTS blot_transactions_type_check;
ALTER TABLE blot_transactions ADD CONSTRAINT blot_transactions_type_check
  CHECK (type IN (
    'subscription_reset',    -- Monthly reset
    'subscription_upgrade',  -- Mid-cycle upgrade
    'generation',            -- Used for page generation
    'edit',                  -- Used for page edit
    'hero',                  -- Used for hero creation
    'calibration',           -- Used for style calibration
    'refund'                 -- Refunded (job failed)
    -- pack_purchase removed
  ));

-- Drop pack-related columns (keep for history but ignore)
-- We'll keep pack_delta and pack_id for historical records

-- ============================================================================
-- 7. SIMPLIFY HELPER FUNCTIONS
-- ============================================================================

-- Get available Blots (simplified - single pool)
CREATE OR REPLACE FUNCTION get_available_blots(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(blots, 0)
  FROM profiles WHERE owner_id = user_id;
$$ LANGUAGE sql STABLE;

-- Deduct Blots (simplified - single pool)
CREATE OR REPLACE FUNCTION deduct_blots(
  user_id UUID,
  amount INTEGER,
  tx_type TEXT DEFAULT 'generation',
  tx_description TEXT DEFAULT NULL,
  tx_job_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  profile_row profiles%ROWTYPE;
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

  -- Log transaction (subscription_delta only, pack_delta always 0)
  INSERT INTO blot_transactions (
    owner_id, type, subscription_delta, pack_delta, description, job_id
  ) VALUES (
    user_id, tx_type, -amount, 0, tx_description, tx_job_id
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Reset Blots (simplified)
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
    owner_id, type, subscription_delta, pack_delta, stripe_invoice_id, description
  ) VALUES (
    user_id, 'subscription_reset', new_amount, 0, invoice_id,
    'Monthly reset: ' || new_amount || ' Blots'
  );
END;
$$ LANGUAGE plpgsql;

-- Add Blots on upgrade (simplified)
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
    owner_id, type, subscription_delta, pack_delta, stripe_invoice_id, description
  ) VALUES (
    user_id, 'subscription_upgrade', blot_difference, 0, invoice_id,
    'Upgrade: +' || blot_difference || ' Blots'
  );
END;
$$ LANGUAGE plpgsql;

-- Refund Blots (simplified)
CREATE OR REPLACE FUNCTION refund_blots(
  user_id UUID,
  amount INTEGER,
  p_job_id UUID,
  reason TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET
    blots = blots + amount,
    updated_at = NOW()
  WHERE owner_id = user_id;

  INSERT INTO blot_transactions (
    owner_id, type, subscription_delta, pack_delta, job_id, description
  ) VALUES (
    user_id, 'refund', amount, 0, p_job_id, reason
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. DROP PACK-RELATED FUNCTION
-- ============================================================================

DROP FUNCTION IF EXISTS add_pack_blots(UUID, INTEGER, TEXT, TEXT);

-- ============================================================================
-- 9. ADD INDEX FOR COMMERCIAL PROJECTS TRACKING
-- ============================================================================

CREATE INDEX IF NOT EXISTS profiles_commercial_projects_idx 
  ON profiles(commercial_projects_used) 
  WHERE plan = 'free';

-- ============================================================================
-- 10. DROP LEGACY BLOT_PURCHASES TABLE (from migration 005)
-- ============================================================================

-- Drop the blot_purchases table - pack purchases no longer used
DROP TABLE IF EXISTS blot_purchases CASCADE;

-- ============================================================================
-- 11. DROP LEGACY FUNCTIONS (from migration 005)
-- ============================================================================

-- Drop old pack-related functions from migration 005
DROP FUNCTION IF EXISTS add_blots(UUID, INTEGER);
DROP FUNCTION IF EXISTS record_blot_purchase(UUID, TEXT, INTEGER, INTEGER, TEXT, TEXT);

-- ============================================================================
-- 12. UPDATE COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 
  'User profiles with billing info - Corbin 2-tier method (creator/studio)';

COMMENT ON COLUMN profiles.blots IS 
  'Current blot balance (single pool, resets monthly for subscribers)';

COMMENT ON COLUMN profiles.plan_blots IS 
  'Blot allocation for current plan (used for reset amount)';
