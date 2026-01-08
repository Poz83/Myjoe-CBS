-- ============================================================================
-- Migration 010: Auto-create Profile on User Signup
-- ============================================================================
-- Creates a trigger to automatically create a profile with default free tier
-- values when a new user signs up via auth.users
-- ============================================================================

-- ============================================================================
-- 1. CREATE FUNCTION TO HANDLE NEW USER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    owner_id,
    plan,
    blots,
    plan_blots,
    storage_used_bytes,
    storage_limit_bytes,
    commercial_projects_used,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'free',
    75,  -- Free tier gets 75 blots
    75,  -- Plan blots allocation
    0,   -- No storage used initially
    1073741824,  -- 1 GB storage limit
    0,   -- No commercial projects used
    NOW(),
    NOW()
  )
  ON CONFLICT (owner_id) DO NOTHING;  -- Skip if profile already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. CREATE TRIGGER ON AUTH.USERS
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. BACKFILL EXISTING USERS WITHOUT PROFILES
-- ============================================================================

-- Create profiles for any existing users that don't have one
INSERT INTO public.profiles (
  owner_id,
  plan,
  blots,
  plan_blots,
  storage_used_bytes,
  storage_limit_bytes,
  commercial_projects_used,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'free',
  75,
  75,
  0,
  1073741824,
  0,
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.owner_id = u.id
WHERE p.id IS NULL
ON CONFLICT (owner_id) DO NOTHING;

-- ============================================================================
-- 4. ADD COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates a free tier profile when a new user signs up';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
  'Trigger to auto-create profile for new users with 75 free blots';
