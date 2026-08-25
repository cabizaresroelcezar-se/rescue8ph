-- ============================================================================
-- MIGRATION: add Markdown body to pages table
-- ============================================================================
-- Pages previously had only title/slug/excerpt/SEO; this adds a Markdown
-- body so admins can author rich content via the existing Markdown renderer.
-- Safe to re-run: IF NOT EXISTS guard.
-- ============================================================================

alter table public.pages
  add column if not exists body text not null default '';

-- Index on slug is already created in the initial schema; no other indexes
-- are needed for body content.

comment on column public.pages.body is 'Markdown body rendered by the storefront page detail.';