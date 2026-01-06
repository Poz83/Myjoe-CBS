-- ============================================================================
-- Storage Management Functions
-- ============================================================================
-- Optional: These functions provide atomic storage updates
-- If not used, the storage service will fall back to direct updates
-- ============================================================================

-- Increment storage usage atomically
CREATE OR REPLACE FUNCTION increment_storage(
  p_user_id UUID,
  p_bytes BIGINT
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET storage_used_bytes = storage_used_bytes + p_bytes
  WHERE owner_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement storage usage atomically (prevents negative values)
CREATE OR REPLACE FUNCTION decrement_storage(
  p_user_id UUID,
  p_bytes BIGINT
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET storage_used_bytes = GREATEST(0, storage_used_bytes - p_bytes)
  WHERE owner_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
