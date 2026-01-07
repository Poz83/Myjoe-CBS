-- Migration: Add metadata column to jobs table
-- Stores generation parameters like the user's idea for the job processor

-- Add metadata JSONB column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Comment for documentation
COMMENT ON COLUMN jobs.metadata IS 'Stores job-specific parameters like the generation idea';
