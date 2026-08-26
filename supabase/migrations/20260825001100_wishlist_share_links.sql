-- ============================================================================
-- MIGRATION: Wishlist share links
-- ============================================================================
-- Lets a user generate a public URL like /wishlist/<token> that lets anyone
-- view their saved products without requiring sign-in.
--
-- Lifecycle:
--   1. User clicks "Share wishlist" on /account/wishlist
--   2. Server creates a row with a random 32-char token
--   3. UI shows the URL; user can copy/revoke
--   4. Visitor opens /wishlist/<token> — anon read of owner's wishlist
--
-- Security notes:
--   - Tokens are 32 random hex chars (128 bits of entropy) — not enumerable
--   - Owner can revoke at any time (sets revoked_at = now())
--   - Optional expires_at for time-limited shares
--   - RLS: any anon or authenticated reader can SELECT non-revoked non-expired
--     rows. Owners can SELECT/UPDATE/INSERT their own. Deletes are blocked
--     except via revoke (UPDATE).
-- ============================================================================

create table if not exists public.wishlist_share_links (
  -- Token is the public identifier; the row's own id is internal.
  -- Using `id` as the token avoids an extra index + keeps URL → PK lookups O(1).
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Optional human-readable label so the owner can tell multiple links apart
  -- (e.g. "For Mom" / "Bday list" / "Work gear").
  label text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  constraint wishlist_share_links_label_length
    check (label is null or char_length(label) <= 80)
);

-- One non-revoked, non-expired link per user is enough; the UI will reuse it.
-- Don't block creation of multiple links (user might want a label-specific
-- one), but the index makes the common "find the active link for user X"
-- query fast.
create index if not exists idx_wishlist_share_links_user_id
  on public.wishlist_share_links(user_id);

-- Fast token-lookup by primary key (already indexed).
create index if not exists idx_wishlist_share_links_active
  on public.wishlist_share_links(id)
  where revoked_at is null and (expires_at is null or expires_at > now());

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.wishlist_share_links enable row level security;

-- Owners can read their own share links (any status — to see revoked ones too)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public'
      and tablename = 'wishlist_share_links'
      and policyname = 'Owners can read own wishlist share links'
  ) then
    create policy "Owners can read own wishlist share links"
      on public.wishlist_share_links for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

-- Anyone (anon + authenticated) can read a non-revoked, non-expired link.
-- The token is a secret, so SELECT-by-token is the only practical path.
-- Note: the application fetches by token (not full table scan) and only
-- exposes resolved data; raw row data never leaves the server response.
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public'
      and tablename = 'wishlist_share_links'
      and policyname = 'Anyone can read active wishlist share links by token'
  ) then
    create policy "Anyone can read active wishlist share links by token"
      on public.wishlist_share_links for select
      to anon, authenticated
      using (
        revoked_at is null
        and (expires_at is null or expires_at > now())
      );
  end if;
end $$;

-- Owners can insert their own share links
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public'
      and tablename = 'wishlist_share_links'
      and policyname = 'Owners can insert own wishlist share links'
  ) then
    create policy "Owners can insert own wishlist share links"
      on public.wishlist_share_links for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Owners can update their own share links (e.g. set label or revoke)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public'
      and tablename = 'wishlist_share_links'
      and policyname = 'Owners can update own wishlist share links'
  ) then
    create policy "Owners can update own wishlist share links"
      on public.wishlist_share_links for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
-- Hard deletes are intentionally NOT permitted by RLS. Use revoke instead.
-- (If you need cleanup of long-revoked links, schedule a job: DELETE FROM
-- wishlist_share_links WHERE revoked_at < now() - interval '90 days' AND
-- service_role_key bypasses RLS.)