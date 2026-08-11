-- Custom list personalization, mixed media support and persistent ordering.

alter table public.custom_lists
  add column if not exists description text,
  add column if not exists background_color text not null default '#334155',
  add column if not exists cover_url text;

alter table public.custom_lists
  drop constraint if exists custom_lists_description_length_check,
  add constraint custom_lists_description_length_check
    check (description is null or char_length(description) <= 280),
  drop constraint if exists custom_lists_background_color_check,
  add constraint custom_lists_background_color_check
    check (background_color ~ '^#[0-9a-fA-F]{6}$');

alter table public.custom_list_items
  add column if not exists media_type text not null default 'movie',
  add column if not exists position integer,
  add column if not exists release_year integer,
  add column if not exists popularity double precision,
  add column if not exists vote_average double precision;

with ranked_items as (
  select
    list_id,
    media_id,
    row_number() over (partition by list_id order by added_at desc, media_id asc) - 1 as position
  from public.custom_list_items
)
update public.custom_list_items item
set position = ranked.position
from ranked_items ranked
where item.list_id = ranked.list_id
  and item.media_id = ranked.media_id
  and item.position is null;

alter table public.custom_list_items
  alter column position set default 0,
  alter column position set not null,
  drop constraint if exists custom_list_items_media_type_check,
  add constraint custom_list_items_media_type_check check (media_type in ('movie', 'tv')),
  drop constraint if exists custom_list_items_position_check,
  add constraint custom_list_items_position_check check (position >= 0),
  drop constraint if exists custom_list_items_release_year_check,
  add constraint custom_list_items_release_year_check
    check (release_year is null or release_year between 1870 and 3000),
  drop constraint if exists custom_list_items_vote_average_check,
  add constraint custom_list_items_vote_average_check
    check (vote_average is null or vote_average between 0 and 10);

alter table public.custom_list_items drop constraint if exists custom_list_items_pkey;
alter table public.custom_list_items
  add constraint custom_list_items_pkey primary key (list_id, media_type, media_id);

create index if not exists custom_list_items_position_idx
  on public.custom_list_items (list_id, position asc);

create or replace function public.reorder_custom_list_items(
  target_list_id uuid,
  ordered_items jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.custom_lists
    where id = target_list_id and user_id = auth.uid()
  ) then
    raise exception 'Not allowed to reorder this list' using errcode = '42501';
  end if;

  update public.custom_list_items item
  set position = ordered.position
  from jsonb_to_recordset(ordered_items) as ordered(
    media_type text,
    media_id bigint,
    position integer
  )
  where item.list_id = target_list_id
    and item.media_type = ordered.media_type
    and item.media_id = ordered.media_id;

  update public.custom_lists
  set updated_at = timezone('utc'::text, now())
  where id = target_list_id;
end;
$$;

revoke all on function public.reorder_custom_list_items(uuid, jsonb) from public;
grant execute on function public.reorder_custom_list_items(uuid, jsonb) to authenticated;

insert into storage.buckets (id, name, public)
values ('list-covers', 'list-covers', true)
on conflict (id) do update set public = true;

drop policy if exists "List covers are publicly readable" on storage.objects;
create policy "List covers are publicly readable"
  on storage.objects for select to public using (bucket_id = 'list-covers');

drop policy if exists "Users can upload their own list covers" on storage.objects;
create policy "Users can upload their own list covers"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'list-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own list covers" on storage.objects;
create policy "Users can update their own list covers"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'list-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'list-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own list covers" on storage.objects;
create policy "Users can delete their own list covers"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'list-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
