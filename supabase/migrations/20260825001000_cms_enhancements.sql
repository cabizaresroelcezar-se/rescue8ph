-- ============================================================================
-- MIGRATION: CMS WordPress/Optimizely-grade enhancements
-- ============================================================================
-- Adds:
--   1. published_by_user_id + publish tracking
--   2. featured_image_url (separate from og_image)
--   3. schedule: publish_at (allow future publish)
--   4. page_revisions table (full edit history)
--   5. page_redirects table (slug history → 301 redirects)
--
-- All changes are idempotent. Safe to re-run.
-- ============================================================================

-- ============================================================================
-- 1) pages table: add new columns
-- ============================================================================

-- Extend content_status with SCHEDULED (idempotent)
do $$ begin
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'SCHEDULED'
      and enumtypid = (select oid from pg_type where typname = 'content_status')
  ) then
    alter type content_status add value 'SCHEDULED';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pages' and column_name = 'featured_image_url'
  ) then
    alter table public.pages add column featured_image_url text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pages' and column_name = 'published_by'
  ) then
    alter table public.pages add column published_by uuid references auth.users(id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pages' and column_name = 'publish_at'
  ) then
    -- publish_at: when null, use published_at as the effective publish
    -- time. If set in the future, the page is treated as "scheduled".
    alter table public.pages add column publish_at timestamptz;
  end if;
end $$;

-- Index for "by author" queries
create index if not exists idx_pages_published_by
  on public.pages(published_by)
  where published_by is not null;

-- Index for "what's due to publish" — Postgres requires that a new
-- enum value be committed before it can be referenced in a partial
-- index, so we use a plain (non-partial) index. The WHERE clause
-- can be added in a follow-up migration once the enum value is
-- definitely visible.
create index if not exists idx_pages_publish_at
  on public.pages(publish_at);

-- ============================================================================
-- 2) page_revisions table: append-only edit history
-- ============================================================================
-- A revision is a snapshot of the page after an edit. The current
-- 'live' page is always in `pages`; revisions are immutable.
--
-- Triggers automatically insert a revision when:
--   - The page is INSERTed (first revision = version 1)
--   - The page is UPDATEd and either title, slug, body, excerpt,
--     seo_*, or featured_image change
--
-- We don't record revisions for every column change (status changes,
-- published_at, etc) so the table stays compact.
-- ============================================================================

create table if not exists public.page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  version integer not null,
  -- Snapshot of the editable fields at this point in time
  title text not null,
  slug text not null,
  body text,
  excerpt text,
  seo_title text,
  seo_description text,
  featured_image_url text,
  status content_status not null,
  -- Who saved this revision
  author_id uuid not null references auth.users(id) on delete restrict,
  -- Optional note: "Wording rewrite", "Fixed typo in intro", etc.
  change_note text,
  created_at timestamptz not null default now(),
  -- One revision number per page
  constraint page_revisions_page_version_unique unique (page_id, version)
);

create index if not exists idx_page_revisions_page_created
  on public.page_revisions(page_id, created_at desc);

create index if not exists idx_page_revisions_author
  on public.page_revisions(author_id);

-- Body length sanity check
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'page_revisions_change_note_length'
  ) then
    alter table public.page_revisions
      add constraint page_revisions_change_note_length
      check (change_note is null or char_length(change_note) <= 200);
  end if;
end $$;

-- ============================================================================
-- Trigger: auto-record a revision on page edits
-- ============================================================================
create or replace function public.record_page_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_version integer;
  changed_cols text[] := '{}';
begin
  -- Skip if it's a status-only update (e.g. publish toggle) — the
  -- revision table is for content changes, not workflow state.
  -- We detect "content changed" by comparing the key editable fields.
  if tg_op = 'UPDATE' then
    if old.title is distinct from new.title then
      changed_cols := array_append(changed_cols, 'title');
    end if;
    if old.slug is distinct from new.slug then
      changed_cols := array_append(changed_cols, 'slug');
    end if;
    if old.body is distinct from new.body then
      changed_cols := array_append(changed_cols, 'body');
    end if;
    if old.excerpt is distinct from new.excerpt then
      changed_cols := array_append(changed_cols, 'excerpt');
    end if;
    if old.seo_title is distinct from new.seo_title then
      changed_cols := array_append(changed_cols, 'seo_title');
    end if;
    if old.seo_description is distinct from new.seo_description then
      changed_cols := array_append(changed_cols, 'seo_description');
    end if;
    if old.featured_image_url is distinct from new.featured_image_url then
      changed_cols := array_append(changed_cols, 'featured_image_url');
    end if;

    -- If nothing content-related changed, skip
    if array_length(changed_cols, 1) is null then
      return new;
    end if;
  end if;

  -- Determine next version
  select coalesce(max(version), 0) + 1
    into next_version
  from public.page_revisions
  where page_id = new.id;

  insert into public.page_revisions (
    page_id, version, title, slug, body, excerpt,
    seo_title, seo_description, featured_image_url, status,
    author_id, change_note
  ) values (
    new.id, next_version, new.title, new.slug, new.body, new.excerpt,
    new.seo_title, new.seo_description, new.featured_image_url, new.status,
    coalesce(new.updated_by, new.created_by, auth.uid()),
    case
      when tg_op = 'INSERT' then 'Initial draft'
      else null
    end
  );

  return new;
end;
$$;

drop trigger if exists pages_record_revision on public.pages;
create trigger pages_record_revision
  after insert or update on public.pages
  for each row execute function public.record_page_revision();

-- ============================================================================
-- 3) page_redirects table: track slug history for 301 redirects
-- ============================================================================
-- When a page slug changes, the old slug is recorded here. The
-- storefront middleware/page renderer looks up the new slug for old
-- URLs and 301-redirects.
--
-- Backfilled by the trigger below.
-- ============================================================================

create table if not exists public.page_redirects (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  old_slug text not null,
  new_slug text not null,
  created_at timestamptz not null default now(),
  constraint page_redirects_old_slug_unique unique (old_slug)
);

create index if not exists idx_page_redirects_page
  on public.page_redirects(page_id);

-- Trigger: record a redirect when a page's slug changes
create or replace function public.record_page_slug_redirect()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.slug is distinct from new.slug then
    insert into public.page_redirects (page_id, old_slug, new_slug)
    values (new.id, old.slug, new.slug)
    on conflict (old_slug) do update
      set page_id = excluded.page_id,
          new_slug = excluded.new_slug,
          created_at = excluded.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists pages_record_redirect on public.pages;
create trigger pages_record_redirect
  after update on public.pages
  for each row execute function public.record_page_slug_redirect();

-- ============================================================================
-- 4) RLS for new tables
-- ============================================================================
alter table public.page_revisions enable row level security;
alter table public.page_redirects enable row level security;

-- Staff can read all revisions
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'page_revisions'
      and policyname = 'Staff can read page revisions'
  ) then
    create policy "Staff can read page revisions"
      on public.page_revisions for select
      to authenticated
      using (private.is_staff());
  end if;
end $$;

-- Revisions are append-only (no UPDATE/DELETE policies). The trigger
-- runs as SECURITY DEFINER so it can insert regardless of the actor.

-- Anyone (anon) can read redirects; the storefront uses them for 301s
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'page_redirects'
      and policyname = 'Anyone can read page redirects'
  ) then
    create policy "Anyone can read page redirects"
      on public.page_redirects for select
      to anon, authenticated
      using (true);
  end if;
end $$;