-- Persistent heart badges for the two linked profiles.
-- The initial usernames are used only to find the profile IDs once. From then
-- on, the relationship continues to work even if either username changes.
create table if not exists public.profile_heart_badges (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  tooltip_profile_id uuid not null references public.profiles(id) on delete cascade,
  constraint profile_heart_badges_distinct_profiles check (profile_id <> tooltip_profile_id)
);

alter table public.profile_heart_badges enable row level security;

drop policy if exists "Public heart badges are readable" on public.profile_heart_badges;
create policy "Public heart badges are readable"
  on public.profile_heart_badges for select to anon, authenticated using (true);

insert into public.profile_heart_badges (profile_id, tooltip_profile_id)
select profile.id, partner.id
from public.profiles profile
join public.profiles partner on lower(profile.username) = 'juanileiva17'
  and lower(partner.username) = 'cami'
union all
select profile.id, partner.id
from public.profiles profile
join public.profiles partner on lower(profile.username) = 'cami'
  and lower(partner.username) = 'juanileiva17'
on conflict (profile_id) do nothing;
