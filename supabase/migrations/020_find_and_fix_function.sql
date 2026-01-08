-- ============================================================================
-- Find and Fix Function Search Path
-- ============================================================================
-- This migration finds the exact is_valid_audience function signature
-- and fixes the search_path issue
-- ============================================================================

-- Find all functions with this name and fix them
DO $$
DECLARE
    func_cursor CURSOR FOR
        SELECT
            p.oid,
            p.proname,
            pg_get_function_identity_arguments(p.oid) as args,
            obj_description(p.oid, 'pg_proc') as description
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.proname = 'is_valid_audience';

    func_record RECORD;
    alter_sql TEXT;
BEGIN
    -- Loop through all matching functions
    FOR func_record IN func_cursor LOOP
        -- Build ALTER FUNCTION statement
        alter_sql := 'ALTER FUNCTION public.is_valid_audience(' || func_record.args || ') SET search_path = public';
        RAISE NOTICE 'Fixing function: %', alter_sql;

        -- Execute the ALTER statement
        EXECUTE alter_sql;
    END LOOP;

    -- If no functions were found, create a standard one
    IF NOT FOUND THEN
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

        RAISE NOTICE 'Created new is_valid_audience function with fixed search_path';
    END IF;
END $$;