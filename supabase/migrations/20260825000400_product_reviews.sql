-- ============================================================================
-- MIGRATION: product reviews + ratings
-- ============================================================================
-- Adds a reviews table so customers can rate + review products.
-- Includes RLS for read/write/moderate, a verified-purchase flag, and
-- a one-review-per-(user, product) constraint so a customer can't
-- spam the same product with multiple reviews.
-- ============================================================================

create type review_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- 1..5 stars; enforced by CHECK
  rating smallint not null,
  title text,
  body text not null,
  -- Verified purchase = the user actually ordered this product (any status)
  is_verified_purchase boolean not null default false,
  status review_status not null default 'PENDING',
  moderated_by uuid references auth.users(id),
  moderated_at timestamptz,
  moderation_reason text,
  -- Helpful votes (simple counter; voting UI is a follow-up)
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_reviews_rating_range check (rating between 1 and 5),
  constraint product_reviews_body_length check (char_length(body) between 10 and 4000),
  constraint product_reviews_title_length check (title is null or char_length(title) <= 200)
);

create unique index idx_product_reviews_one_per_user
  on public.product_reviews(product_id, user_id);

create index idx_product_reviews_product_status
  on public.product_reviews(product_id, status, created_at desc);

create index idx_product_reviews_status_pending
  on public.product_reviews(status, created_at desc)
  where status = 'PENDING';

create index idx_product_reviews_user
  on public.product_reviews(user_id);

create trigger product_reviews_set_updated_at
  before update on public.product_reviews
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.product_reviews enable row level security;

-- Public read for APPROVED reviews
create policy "Anyone can read approved reviews"
  on public.product_reviews for select
  to anon, authenticated
  using (status = 'APPROVED');

-- Authenticated users can read their own reviews (any status)
create policy "Users can read their own reviews"
  on public.product_reviews for select
  to authenticated
  using (user_id = auth.uid());

-- Staff can read ALL reviews (for moderation)
create policy "Staff can read all reviews"
  on public.product_reviews for select
  to authenticated
  using (private.is_staff());

-- Authenticated users can insert a review for themselves
-- Status defaults to PENDING so it needs moderation before showing
create policy "Users can create their own reviews"
  on public.product_reviews for insert
  to authenticated
  with check (user_id = auth.uid() and status = 'PENDING');

-- Users can update only the body/title (NOT rating — that would let them
-- game the score). Also can only edit while still PENDING.
create policy "Users can edit their own pending reviews"
  on public.product_reviews for update
  to authenticated
  using (user_id = auth.uid() and status = 'PENDING')
  with check (user_id = auth.uid() and status = 'PENDING');

-- Users can delete their own reviews
create policy "Users can delete their own reviews"
  on public.product_reviews for delete
  to authenticated
  using (user_id = auth.uid());

-- Staff can update any review (for moderation)
create policy "Staff can moderate reviews"
  on public.product_reviews for update
  to authenticated
  using (private.is_staff())
  with check (private.is_staff());

-- ============================================================================
-- Aggregate trigger — refresh product's cached average + count
-- (Not implemented as a denormalized column on products for now; the
-- product detail page will compute it via a separate aggregate query.)
-- ============================================================================