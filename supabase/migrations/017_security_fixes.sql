-- ============================================================================
-- Security Fixes Migration
-- ============================================================================
-- This migration addresses multiple security vulnerabilities:
-- 1. Function search_path mutable issues
-- 2. Overly permissive RLS policy
-- ============================================================================

-- Fix handle_new_user function search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (owner_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix get_timezone_info function search_path
CREATE OR REPLACE FUNCTION public.get_timezone_info(tz_name TEXT)
RETURNS TABLE (
  name TEXT,
  abbreviation TEXT,
  utc_offset INTERVAL,
  is_dst BOOLEAN
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  -- Try cache first
  RETURN QUERY
  SELECT tc.name, tc.abbreviation, tc.utc_offset, tc.is_dst
  FROM public.timezone_cache tc
  WHERE tc.name = tz_name;

  -- If not in cache, get from system and cache it
  IF NOT FOUND THEN
    INSERT INTO public.timezone_cache (name, abbreviation, utc_offset, is_dst)
    SELECT ptn.name, ptn.abbrev, ptn.utc_offset, ptn.is_dst
    FROM pg_timezone_names ptn
    WHERE ptn.name = tz_name;

    RETURN QUERY
    SELECT tc.name, tc.abbreviation, tc.utc_offset, tc.is_dst
    FROM public.timezone_cache tc
    WHERE tc.name = tz_name;
  END IF;
END;
$$;

-- Check if is_valid_audience function exists and fix it if it does
-- (This function might have been created by Supabase or another migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_valid_audience'
  ) THEN
    -- Recreate with fixed search_path
    EXECUTE 'ALTER FUNCTION public.is_valid_audience(TEXT) SET search_path = public';
  END IF;
END $$;

-- Fix the overly permissive RLS policy for profile creation
-- Replace the dangerous "WITH CHECK (true)" policy with a more secure one
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;

CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT
  WITH CHECK (
    -- Only allow inserts where owner_id matches the authenticated user
    -- OR allow inserts from the trigger function (service role)
    auth.uid() = owner_id
    OR
    (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'service_role')
  );

-- Note: The leaked password protection warning is a Supabase Auth setting
-- that needs to be enabled in the Supabase dashboard under Authentication > Settings
-- This cannot be fixed via SQL migration.