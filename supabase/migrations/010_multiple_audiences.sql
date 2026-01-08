-- Convert audience columns to TEXT[] and enforce allowed values

-- Projects: audience -> TEXT[]
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_audience_check;

ALTER TABLE public.projects
  ALTER COLUMN audience TYPE TEXT[] USING ARRAY[audience],
  ALTER COLUMN audience SET NOT NULL;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_audience_check CHECK (
    array_length(audience, 1) >= 1
    AND audience <@ ARRAY['toddler', 'children', 'tween', 'teen', 'adult']::TEXT[]
  );

-- Heroes: audience -> TEXT[] (for consistency with projects)
ALTER TABLE public.heroes
  DROP CONSTRAINT IF EXISTS heroes_audience_check;

ALTER TABLE public.heroes
  ALTER COLUMN audience TYPE TEXT[] USING ARRAY[audience],
  ALTER COLUMN audience SET NOT NULL;

ALTER TABLE public.heroes
  ADD CONSTRAINT heroes_audience_check CHECK (
    array_length(audience, 1) >= 1
    AND audience <@ ARRAY['toddler', 'children', 'tween', 'teen', 'adult']::TEXT[]
  );
