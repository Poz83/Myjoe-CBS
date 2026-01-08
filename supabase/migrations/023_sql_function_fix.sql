-- ============================================================================
-- SQL Function Fix for is_valid_audience
-- ============================================================================
-- Using SQL language with explicit schema references and SECURITY DEFINER
-- ============================================================================

-- Create the function using SQL language with explicit schema references
CREATE OR REPLACE FUNCTION public.is_valid_audience(audience_value TEXT)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT audience_value IN ('toddler', 'children', 'tween', 'teen', 'adult');
$$;

-- Add a comment for documentation
COMMENT ON FUNCTION public.is_valid_audience(TEXT) IS 'Validates that an audience value is one of the allowed options. Uses explicit schema references to prevent search_path attacks.';