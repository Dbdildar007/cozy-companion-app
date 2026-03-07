ALTER TABLE public.watch_progress ADD COLUMN IF NOT EXISTS season_number integer;
ALTER TABLE public.watch_progress ADD COLUMN IF NOT EXISTS episode_number integer;