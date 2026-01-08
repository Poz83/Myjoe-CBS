-- ============================================================================
-- Compliance Fields Migration
-- ============================================================================
-- Adds GDPR/UK GDPR compliance fields to profiles table for:
-- - Geo IP country detection
-- - Marketing attribution (referral source)
-- - Explicit consent tracking
-- ============================================================================

-- Add compliance fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cookie_consent JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepted_privacy_at TIMESTAMPTZ;

-- Add index for country-based queries (analytics, tax compliance)
CREATE INDEX IF NOT EXISTS profiles_country_idx ON profiles(country);

-- Comment on columns for documentation
COMMENT ON COLUMN profiles.country IS 'ISO 3166-1 alpha-2 country code detected via geo IP at signup';
COMMENT ON COLUMN profiles.referral_source IS 'How user heard about us (e.g., google, twitter, friend, youtube)';
COMMENT ON COLUMN profiles.marketing_consent IS 'Explicit consent for marketing emails (GDPR requirement)';
COMMENT ON COLUMN profiles.cookie_consent IS 'Cookie consent preferences: {analytics: bool, marketing: bool, timestamp: string}';
COMMENT ON COLUMN profiles.accepted_terms_at IS 'Timestamp when user accepted Terms of Service';
COMMENT ON COLUMN profiles.accepted_privacy_at IS 'Timestamp when user accepted Privacy Policy';
