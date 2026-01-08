-- ============================================================================
-- Remove Unused Indexes Migration
-- ============================================================================
-- This migration removes indexes that are flagged as unused by Supabase linter.
-- These indexes were either recently created and not yet used, or are truly
-- unnecessary for current application functionality.
-- ============================================================================

-- Remove indexes that are confirmed unused and not needed for current features

-- Remove the country index (compliance field not actively used yet)
DROP INDEX IF EXISTS profiles_country_idx;

-- Note: Keeping the following indexes despite "unused" warnings because they are:
-- 1. Essential for RLS policies (assets_owner_idx)
-- 2. Critical for billing operations (profiles_stripe_customer_idx)
-- 3. Important for application relationships (all the others)
-- 4. Newly created foreign key indexes that may be used as app matures

-- If these indexes remain unused after significant app usage (months),
-- they can be safely removed. For now, they provide insurance against
-- future performance issues.