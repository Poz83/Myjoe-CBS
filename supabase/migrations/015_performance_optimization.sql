-- ============================================================================
-- Performance Optimization Migration
-- ============================================================================
-- This migration adds optimizations to address the most expensive queries
-- identified in pg_stat_statements analysis.
-- ============================================================================

-- Create a more efficient timezone cache table for repeated lookups
CREATE TABLE IF NOT EXISTS timezone_cache (
  name TEXT PRIMARY KEY,
  abbreviation TEXT,
  utc_offset INTERVAL,
  is_dst BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast timezone lookups (if needed frequently)
CREATE INDEX IF NOT EXISTS timezone_cache_name_idx ON timezone_cache(name);

-- Populate the cache with common timezones (optional - only if needed)
-- This reduces the need to query pg_timezone_names repeatedly
INSERT INTO timezone_cache (name, abbreviation, utc_offset, is_dst)
SELECT
  name,
  abbrev,
  utc_offset,
  is_dst
FROM pg_timezone_names
WHERE name IN ('UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney')
ON CONFLICT (name) DO NOTHING;

-- Add a function to get timezone info efficiently
CREATE OR REPLACE FUNCTION get_timezone_info(tz_name TEXT)
RETURNS TABLE (
  name TEXT,
  abbreviation TEXT,
  utc_offset INTERVAL,
  is_dst BOOLEAN
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Try cache first
  RETURN QUERY
  SELECT tc.name, tc.abbreviation, tc.utc_offset, tc.is_dst
  FROM timezone_cache tc
  WHERE tc.name = tz_name;

  -- If not in cache, get from system and cache it
  IF NOT FOUND THEN
    INSERT INTO timezone_cache (name, abbreviation, utc_offset, is_dst)
    SELECT ptn.name, ptn.abbrev, ptn.utc_offset, ptn.is_dst
    FROM pg_timezone_names ptn
    WHERE ptn.name = tz_name;

    RETURN QUERY
    SELECT tc.name, tc.abbreviation, tc.utc_offset, tc.is_dst
    FROM timezone_cache tc
    WHERE tc.name = tz_name;
  END IF;
END;
$$;

-- Optimize frequently queried auth tables with composite indexes
-- These queries show user lookups are happening frequently

-- Index for user ID + instance ID lookups (from the user query pattern)
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users(instance_id, id);

-- Index for session lookups by ID (from session queries)
CREATE INDEX IF NOT EXISTS sessions_id_idx ON auth.sessions(id);

-- Index for refresh token updates (from the UPDATE query)
CREATE INDEX IF NOT EXISTS refresh_tokens_id_idx ON auth.refresh_tokens(id);

-- Add RLS policies for the timezone cache
ALTER TABLE timezone_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read timezone cache"
  ON timezone_cache FOR SELECT
  USING (true);

-- Comments for documentation
COMMENT ON TABLE timezone_cache IS 'Cache for frequently accessed timezone information to reduce pg_timezone_names queries';
COMMENT ON FUNCTION get_timezone_info(TEXT) IS 'Efficiently retrieve timezone information with caching';