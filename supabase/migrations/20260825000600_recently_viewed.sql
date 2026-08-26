-- ============================================================================
-- MIGRATION: recently viewed products
-- ============================================================================
-- Tracks which products a user has viewed and when, so we can build
-- "Recently viewed" personalization on the account dashboard.
--
-- Design choices:
-- - One row per (user_id, product_id); updates update the viewed_at.
--   Using a unique index + upsert means visiting the same product
--   again bumps the timestamp instead of creating dupes.
-- - No DELETE on the row via trigger — we cap to the 20 newest per
--   user via a function call from the server action.
-- - Anonymous visitors are NOT tracked in this table (we'd need a
--   cookie-based identifier). This is a follow-up.
-- ============================================================================

create table if not exists public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  constraint recently_viewed_one_per_user_product unique (user_id, product_id)
);

create index if not exists idx_recently_viewed_user_viewed
  on public.recently_viewed(user_id, viewed_at desc);

create index if not exists idx_recently_viewed_product
  on public.recently_viewed(product_id);

drop trigger if exists recently_viewed_bump on public.recently_viewed;
create trigger recently_viewed_bump
  before update on public.recently_viewed
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.recently_viewed enable row level security;

-- ============================================================================
-- Helper function: cap a user's recently_viewed to the N most recent rows
-- ============================================================================
create or replace function public.cap_recently_viewed(p_user_id uuid, p_max integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.recently_viewed
  where user_id = p_user_id
    and id not in (
      select id from public.recently_viewed
      where user_id = p_user_id
      order by viewed_at desc
      limit p_max
    );
end;
$$;

-- Users can read their own recently viewed (all of it)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'recently_viewed'
      and policyname = 'Users can read their own recently viewed'
  ) then
    create policy "Users can read their own recently viewed"
      on public.recently_viewed for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- Users can insert their own row
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'recently_viewed'
      and policyname = 'Users can insert their own recently viewed'
  ) then
    create policy "Users can insert their own recently viewed"
      on public.recently_viewed for insert
      to authenticated
      with check (user_id = auth.uid());
  end if;
end $$;

-- Users can update their own row (the upsert path uses ON CONFLICT DO UPDATE)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'recently_viewed'
      and policyname = 'Users can update their own recently viewed'
  ) then
    create policy "Users can update their own recently viewed"
      on public.recently_viewed for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

-- Users can delete their own rows (for the "Clear all" button)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'recently_viewed'
      and policyname = 'Users can delete their own recently viewed'
  ) then
    create policy "Users can delete their own recently viewed"
      on public.recently_viewed for delete
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;