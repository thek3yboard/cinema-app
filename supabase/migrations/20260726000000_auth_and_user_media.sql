-- Cinema: profiles, per-user media state and avatar storage.
-- Run this migration through the Supabase CLI or SQL editor before enabling the UI.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (username ~ '^[a-zA-Z0-9_]{3,30}$'),
  display_name text not null check (char_length(display_name) between 1 and 60),
  avatar_url text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

create table if not exists public.user_media (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('movie', 'tv')),
  media_id bigint not null,
  in_watchlist boolean not null default false,
  is_watched boolean not null default false,
  is_favorite boolean not null default false,
  rating numeric(3,1) not null default 0 check (rating >= 0 and rating <= 10),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  primary key (user_id, media_type, media_id)
);

alter table public.profiles enable row level security;
alter table public.user_media enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can read their media state"
  on public.user_media for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their media state"
  on public.user_media for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their media state"
  on public.user_media for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their media state"
  on public.user_media for delete to authenticated using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_username text;
  fallback_name text;
begin
  requested_username := nullif(new.raw_user_meta_data ->> 'username', '');
  fallback_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(new.email, 'cinema-user'), '@', 1)
  );

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(requested_username, 'user_' || replace(left(new.id::text, 8), '-', '')),
    left(fallback_name, 60),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
drop trigger if exists user_media_updated_at on public.user_media;
create trigger user_media_updated_at before update on public.user_media
  for each row execute procedure public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Avatars are publicly readable"
  on storage.objects for select to public using (bucket_id = 'avatars');
