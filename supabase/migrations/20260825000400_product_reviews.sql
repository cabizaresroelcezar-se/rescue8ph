-- ============================================================================
-- MIGRATION: product reviews + ratings (idempotent)
-- ============================================================================
-- Adds a reviews table so customers can rate + review products.
-- Re-runnable: every CREATE is guarded with IF NOT EXISTS, every policy
-- is created with a uniqueness check, and the enum is wrapped in DO $$.
-- ============================================================================

-- ----- Enum type -----
do $$ begin
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type review_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');
  end if;
end $$;

-- ----- Table -----
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null,
  title text,
  body text not null,
  is_verified_purchase boolean not null default false,
  status review_status not null default 'PENDING',
  moderated_by uuid references auth.users(id),
  moderated_at timestamptz,
  moderation_reason text,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----- CHECK constraints (add only if missing) -----
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'product_reviews_rating_range'
  ) then
    alter table public.product_reviews
      add constraint product_reviews_rating_range check (rating between 1 and 5);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'product_reviews_body_length'
  ) then
    alter table public.product_reviews
      add constraint product_reviews_body_length check (char_length(body) between 10 and 4000);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'product_reviews_title_length'
  ) then
    alter table public.product_reviews
      add constraint product_reviews_title_length
        check (title is null or char_length(title) <= 200);
  end if;
end $$;

-- ----- Indexes -----
create unique index if not exists idx_product_reviews_one_per_user
  on public.product_reviews(product_id, user_id);

create index if not exists idx_product_reviews_product_status
  on public.product_reviews(product_id, status, created_at desc);

create index if not exists idx_product_reviews_status_pending
  on public.product_reviews(status, created_at desc)
  where status = 'PENDING';

create index if not exists idx_product_reviews_user
  on public.product_reviews(user_id);

-- ----- Trigger (drop+create to keep it idempotent if signature changed) -----
drop trigger if exists product_reviews_set_updated_at on public.product_reviews;
create trigger product_reviews_set_updated_at
  before update on public.product_reviews
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.product_reviews enable row level security;

-- Helper to create policies only if missing
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_reviews'
      and policyname = 'Anyone can read approved reviews'
  ) then
    create policy "Anyone can read approved reviews"
      on public.product_reviews for select
      to anon, authenticated
      using (status = 'APPROVED');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_reviews'
      and policyname = 'Users can read their own reviews'
  ) then
    create policy "Users can read their own reviews"
      on public.product_reviews for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_reviews'
      and policyname = 'Staff can read all reviews'
  ) then
    create policy "Staff can read all reviews"
      on public.product_reviews for select
      to authenticated
      using (private.is_staff());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_reviews'
      and policyname = 'Users can create their own reviews'
  ) then
    create policy "Users can create their own reviews"
      on public.product_reviews for insert
      to authenticated
      with check (user_id = auth.uid() and status = 'PENDING');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_reviews'
      and policyname = 'Users can edit their own pending reviews'
  ) then
    create policy "Users can edit their own pending reviews"
      on public.product_reviews for update
      to authenticated
      using (user_id = auth.uid() and status = 'PENDING')
      with check (user_id = auth.uid() and status = 'PENDING');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_reviews'
      and policyname = 'Users can delete their own reviews'
  ) then
    create policy "Users can delete their own reviews"
      on public.product_reviews for delete
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'product_reviews'
      and policyname = 'Staff can moderate reviews'
  ) then
    create policy "Staff can moderate reviews"
      on public.product_reviews for update
      to authenticated
      using (private.is_staff())
      with check (private.is_staff());
  end if;
end $$;

-- ============================================================================
-- Done. Aggregate stats are computed at query time via getReviewStats().
-- ============================================================================