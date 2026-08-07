-- Use username as the only public identity for every profile.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_username text;
begin
  requested_username := nullif(new.raw_user_meta_data ->> 'username', '');

  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(requested_username, 'user_' || replace(left(new.id::text, 8), '-', '')),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

alter table public.profiles
  drop column if exists display_name;
