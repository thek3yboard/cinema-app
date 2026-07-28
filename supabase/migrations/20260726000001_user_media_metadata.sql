-- Persist display metadata with each saved title so user lists do not need to
-- re-fetch TMDB on every visit.
alter table public.user_media
  add column if not exists title text,
  add column if not exists poster_path text;
