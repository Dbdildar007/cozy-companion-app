
-- Add missing columns to movies table for unified movies+series storage
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS is_series boolean DEFAULT false;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS is_trending boolean DEFAULT false;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS language text DEFAULT 'English';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS category text DEFAULT '';

-- Drop existing FK constraints on seasons and episodes that reference the 'series' table
ALTER TABLE public.seasons DROP CONSTRAINT IF EXISTS seasons_series_id_fkey;
ALTER TABLE public.episodes DROP CONSTRAINT IF EXISTS episodes_series_id_fkey;

-- Rename series_id to movie_id in seasons table for clarity (since series are now in movies table)
-- Actually let's keep series_id but add FK to movies table
ALTER TABLE public.seasons ADD CONSTRAINT seasons_movie_fkey FOREIGN KEY (series_id) REFERENCES public.movies(id) ON DELETE CASCADE;
ALTER TABLE public.episodes ADD CONSTRAINT episodes_movie_fkey FOREIGN KEY (series_id) REFERENCES public.movies(id) ON DELETE CASCADE;
