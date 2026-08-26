-- ============================================================================
-- MIGRATION: review helpful votes
-- ============================================================================
-- Tracks which users voted "Was this review helpful?" so they can only vote
-- once per review (and can change their mind).
--
-- The product_reviews.helpful_count column is the cached aggregate; we
-- bump it atomically via a trigger so the count is always in sync.
-- ============================================================================

create table if not exists public.review_votes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.product_reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- is_helpful: true = helpful, false = not helpful
  is_helpful boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_votes_one_per_user unique (review_id, user_id)
);

create index if not exists idx_review_votes_review
  on public.review_votes(review_id);

create index if not exists idx_review_votes_user
  on public.review_votes(user_id);

drop trigger if exists review_votes_set_updated_at on public.review_votes;
create trigger review_votes_set_updated_at
  before update on public.review_votes
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Helper: keep product_reviews.helpful_count in sync with review_votes
-- ============================================================================
create or replace function public.sync_review_helpful_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.product_reviews
      set helpful_count = helpful_count + (case when new.is_helpful then 1 else 0 end)
      where id = new.review_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.product_reviews
      set helpful_count = helpful_count - (case when old.is_helpful then 1 else 0 end)
      where id = old.review_id;
    return old;
  elsif tg_op = 'UPDATE' then
    -- User flipped their vote
    if old.is_helpful is distinct from new.is_helpful then
      update public.product_reviews
        set helpful_count = helpful_count + (case when new.is_helpful then 1 else -1 end)
        where id = new.review_id;
    end if;
    return new;
  end if;
  return null;
end;
$$;

drop trigger if exists review_votes_sync_count on public.review_votes;
create trigger review_votes_sync_count
  after insert or update or delete on public.review_votes
  for each row execute function public.sync_review_helpful_count();

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.review_votes enable row level security;

-- Users can read their own votes (so we know which buttons to highlight)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'review_votes'
      and policyname = 'Users can read their own review votes'
  ) then
    create policy "Users can read their own review votes"
      on public.review_votes for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- Staff can read all votes (moderation)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'review_votes'
      and policyname = 'Staff can read all review votes'
  ) then
    create policy "Staff can read all review votes"
      on public.review_votes for select
      to authenticated
      using (private.is_staff());
  end if;
end $$;

-- Anonymous users can see vote totals via product_reviews.helpful_count
-- (which is exposed via the public read on product_reviews). They just
-- can't vote without signing in.

-- Authenticated users can vote on reviews (the trigger updates helpful_count)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'review_votes'
      and policyname = 'Users can vote on reviews'
  ) then
    create policy "Users can vote on reviews"
      on public.review_votes for insert
      to authenticated
      with check (user_id = auth.uid());
  end if;
end $$;

-- Users can change their own vote (UPDATE for the flip case)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'review_votes'
      and policyname = 'Users can update their own review votes'
  ) then
    create policy "Users can update their own review votes"
      on public.review_votes for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

-- Users can remove their own vote (un-helpful)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'review_votes'
      and policyname = 'Users can delete their own review votes'
  ) then
    create policy "Users can delete their own review votes"
      on public.review_votes for delete
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;