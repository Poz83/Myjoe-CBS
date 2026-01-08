-- Migration: Add line thickness fields to projects table
-- Allows users to specify line thickness in points (2-8) or use auto-detection

-- Add new columns
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS line_thickness_pts INTEGER CHECK (line_thickness_pts BETWEEN 2 AND 8),
ADD COLUMN IF NOT EXISTS line_thickness_auto BOOLEAN NOT NULL DEFAULT true;

-- Migrate existing projects: derive from line_weight
UPDATE projects 
SET line_thickness_pts = CASE line_weight
  WHEN 'thick' THEN 6
  WHEN 'medium' THEN 4
  WHEN 'fine' THEN 2
  ELSE 4 -- Default to medium
END,
line_thickness_auto = true
WHERE line_thickness_pts IS NULL;

-- Add comment
COMMENT ON COLUMN projects.line_thickness_pts IS 'Line thickness in points (2-8). NULL if auto-detected.';
COMMENT ON COLUMN projects.line_thickness_auto IS 'Whether line thickness is auto-detected based on audience and idea.';
