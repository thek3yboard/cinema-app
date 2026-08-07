-- Public profiles and user-created movie lists.

-- Profiles contain only public-facing fields (username, display name and avatar).
drop policy if exists "Public profiles are readable" on public.profiles;
create policy "Public profiles are readable"
  on public.profiles for select to anon, authenticated
  using (true);

create table if not exists public.custom_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists custom_lists_user_id_updated_at_idx
  on public.custom_lists (user_id, updated_at desc);

create table if not exists public.custom_list_items (
  list_id uuid not null references public.custom_lists(id) on delete cascade,
  media_id bigint not null,
  title text,
  poster_path text,
  added_at timestamptz not null default timezone('utc'::text, now()),
  primary key (list_id, media_id)
);

create index if not exists custom_list_items_added_at_idx
  on public.custom_list_items (list_id, added_at desc);

alter table public.custom_lists enable row level security;
alter table public.custom_list_items enable row level security;

drop policy if exists "Owners and visitors can read custom lists" on public.custom_lists;
create policy "Owners and visitors can read custom lists"
  on public.custom_lists for select to anon, authenticated
  using (is_public or auth.uid() = user_id);

drop policy if exists "Users can create their own custom lists" on public.custom_lists;
create policy "Users can create their own custom lists"
  on public.custom_lists for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own custom lists" on public.custom_lists;
create policy "Users can update their own custom lists"
  on public.custom_lists for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own custom lists" on public.custom_lists;
create policy "Users can delete their own custom lists"
  on public.custom_lists for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Owners and visitors can read custom list items" on public.custom_list_items;
create policy "Owners and visitors can read custom list items"
  on public.custom_list_items for select to anon, authenticated
  using (
    exists (
      select 1 from public.custom_lists
      where custom_lists.id = custom_list_items.list_id
        and (custom_lists.is_public or custom_lists.user_id = auth.uid())
    )
  );

drop policy if exists "Users can add items to their own custom lists" on public.custom_list_items;
create policy "Users can add items to their own custom lists"
  on public.custom_list_items for insert to authenticated
  with check (
    exists (
      select 1 from public.custom_lists
      where custom_lists.id = custom_list_items.list_id
        and custom_lists.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update items in their own custom lists" on public.custom_list_items;
create policy "Users can update items in their own custom lists"
  on public.custom_list_items for update to authenticated
  using (
    exists (
      select 1 from public.custom_lists
      where custom_lists.id = custom_list_items.list_id
        and custom_lists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.custom_lists
      where custom_lists.id = custom_list_items.list_id
        and custom_lists.user_id = auth.uid()
    )
  );

drop policy if exists "Users can remove items from their own custom lists" on public.custom_list_items;
create policy "Users can remove items from their own custom lists"
  on public.custom_list_items for delete to authenticated
  using (
    exists (
      select 1 from public.custom_lists
      where custom_lists.id = custom_list_items.list_id
        and custom_lists.user_id = auth.uid()
    )
  );

drop trigger if exists custom_lists_updated_at on public.custom_lists;
create trigger custom_lists_updated_at before update on public.custom_lists
  for each row execute procedure public.set_updated_at();
