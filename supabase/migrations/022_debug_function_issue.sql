-- ============================================================================
-- Debug Function Issue
-- ============================================================================
-- This migration investigates the is_valid_audience function issue
-- ============================================================================

-- First, let's see what functions exist with this name
DO $$
DECLARE
    func_info RECORD;
BEGIN
    RAISE NOTICE 'Searching for is_valid_audience functions...';

    FOR func_info IN
        SELECT
            n.nspname as schema_name,
            p.proname as func_name,
            pg_get_function_identity_arguments(p.oid) as args,
            pg_get_functiondef(p.oid) as definition,
            p.prosrc as source,
            obj_description(p.oid, 'pg_proc') as description
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname LIKE '%audience%'
    LOOP
        RAISE NOTICE 'Found function: %.%(%)', func_info.schema_name, func_info.func_name, func_info.args;
        RAISE NOTICE 'Definition: %', func_info.definition;
        RAISE NOTICE 'Source: %', func_info.source;
        RAISE NOTICE '---';
    END LOOP;

    -- Check if our specific function exists
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'is_valid_audience'
    ) THEN
        RAISE NOTICE 'is_valid_audience function EXISTS in public schema';

        -- Try to get its configuration
        SELECT
            p.proconfig,
            p.provolatile,
            p.prosecdef
        INTO func_info
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'is_valid_audience'
        LIMIT 1;

        RAISE NOTICE 'Function config: %', func_info.proconfig;

    ELSE
        RAISE NOTICE 'is_valid_audience function does NOT exist in public schema';
    END IF;
END $$;

-- Now try to create the function with explicit search_path
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

-- Verify it was created correctly
DO $$
DECLARE
    func_config TEXT[];
BEGIN
    RAISE NOTICE 'Function created. Checking search_path setting...';

    -- Check if the function now has the correct search_path
    SELECT p.proconfig INTO func_config
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_valid_audience'
    LIMIT 1;

    RAISE NOTICE 'Function config after creation: %', func_config;

    IF func_config IS NOT NULL THEN
        RAISE NOTICE 'Function config array: %', array_to_string(func_config, ', ');
        IF array_to_string(func_config, ' ') LIKE '%search_path%' THEN
            RAISE NOTICE 'SUCCESS: Function has search_path configured';
        ELSE
            RAISE NOTICE 'WARNING: Function config does not contain search_path';
        END IF;
    ELSE
        RAISE NOTICE 'WARNING: Function has no configuration (proconfig is null)';
    END IF;
END $$;