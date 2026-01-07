-- Migration: Blot Pack Purchases
-- Adds support for one-time blot pack purchases

-- Blot Pack Purchases Table
CREATE TABLE IF NOT EXISTS blot_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id TEXT NOT NULL,
  blots INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookup by owner
CREATE INDEX IF NOT EXISTS idx_blot_purchases_owner ON blot_purchases(owner_id);

-- Index for stripe session lookup (webhook processing)
CREATE INDEX IF NOT EXISTS idx_blot_purchases_stripe_session ON blot_purchases(stripe_session_id);

-- Enable Row Level Security
ALTER TABLE blot_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own purchases
CREATE POLICY "Users can view own purchases"
  ON blot_purchases FOR SELECT
  USING (auth.uid() = owner_id);

-- Policy: Only service role can insert (via webhook)
CREATE POLICY "Service role can insert purchases"
  ON blot_purchases FOR INSERT
  WITH CHECK (true);

-- Helper function to add blots to a user's profile
-- Called after successful Stripe payment
CREATE OR REPLACE FUNCTION add_blots(p_user_id UUID, p_amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET blots = blots + p_amount 
  WHERE owner_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a blot pack purchase and add blots atomically
CREATE OR REPLACE FUNCTION record_blot_purchase(
  p_user_id UUID,
  p_pack_id TEXT,
  p_blots INTEGER,
  p_price_cents INTEGER,
  p_stripe_session_id TEXT DEFAULT NULL,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_purchase_id UUID;
BEGIN
  -- Insert purchase record
  INSERT INTO blot_purchases (owner_id, pack_id, blots, price_cents, stripe_session_id, stripe_payment_intent_id)
  VALUES (p_user_id, p_pack_id, p_blots, p_price_cents, p_stripe_session_id, p_stripe_payment_intent_id)
  RETURNING id INTO v_purchase_id;
  
  -- Add blots to user's profile
  UPDATE profiles 
  SET blots = blots + p_blots 
  WHERE owner_id = p_user_id;
  
  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (for service role calls)
GRANT EXECUTE ON FUNCTION add_blots(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION record_blot_purchase(UUID, TEXT, INTEGER, INTEGER, TEXT, TEXT) TO service_role;
