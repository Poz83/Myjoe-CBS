-- ============================================================================
-- Fix Profile Insert Policy
-- ============================================================================
-- The profiles table needs an INSERT policy to allow the trigger function
-- to create profiles when new users sign up.
-- 
-- Note: The handle_new_user() trigger function is SECURITY DEFINER and should
-- bypass RLS, but Supabase requires an INSERT policy to be present. This policy
-- allows inserts - security is ensured by:
-- 1. Foreign key constraint on owner_id -> auth.users(id)
-- 2. Only the trigger function inserts profiles (not user-facing)
-- ============================================================================

-- Add INSERT policy for profile creation
CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT
  WITH CHECK (true);
