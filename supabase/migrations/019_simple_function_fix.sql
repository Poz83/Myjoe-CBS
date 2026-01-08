-- ============================================================================
-- Simple Function Search Path Fix
-- ============================================================================
-- Direct fix for the is_valid_audience function search_path issue
-- ============================================================================

-- First, try to alter the existing function directly
ALTER FUNCTION public.is_valid_audience(TEXT) SET search_path = public;

-- If the above fails because the function doesn't exist or has different signature,
-- create a standard implementation
CREATE OR REPLACE FUNCTION public.is_valid_audience(audience_value TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN audience_value IN ('toddler', 'children', 'tween', 'teen', 'adult');
END;
$$;