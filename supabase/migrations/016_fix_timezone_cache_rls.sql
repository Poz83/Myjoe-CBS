-- ============================================================================
-- Fix Timezone Cache RLS Security Issue
-- ============================================================================
-- This migration enables RLS on the timezone_cache table and adds
-- appropriate security policies for read access.
-- ============================================================================

-- Enable RLS on timezone_cache table
ALTER TABLE timezone_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read timezone cache data (timezone info is public)
CREATE POLICY "Anyone can read timezone cache"
  ON timezone_cache FOR SELECT
  USING (true);

-- Only service role can modify timezone cache (for maintenance/updates)
-- Note: This assumes you have proper service role authentication in place
CREATE POLICY "Service role can manage timezone cache"
  ON timezone_cache FOR ALL
  USING (
    CASE
      WHEN auth.role() = 'service_role' THEN true
      WHEN auth.jwt() ->> 'role' = 'service_role' THEN true
      ELSE false
    END
  );