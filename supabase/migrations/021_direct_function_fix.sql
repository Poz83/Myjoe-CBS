-- ============================================================================
-- Direct Function Fix
-- ============================================================================
-- Simple approach to fix the is_valid_audience function
-- ============================================================================

-- Try to create/replace the function directly
-- This will work whether the function exists or not
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

-- If the function already exists with a different signature, try to drop and recreate
-- But first, let's try the simple approach above first