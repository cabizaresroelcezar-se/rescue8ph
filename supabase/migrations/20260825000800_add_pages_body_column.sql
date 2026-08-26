-- ============================================================================
-- MIGRATION: add body column to pages table
-- ============================================================================
-- The page-form component (and the cms create/update actions) write a
-- 'body' field, but the original schema never added a body column to
-- the pages table. The page body was intended to live in page_sections
-- (a per-page list of typed sections), but the form also includes a
-- top-level rich-text body for the legacy 'single body' workflow.
--
-- This migration adds the missing column so the form can save+load it.
--
-- Design choice: we add the column to `pages` (matching the form), but
-- keep `page_sections` for the per-section workflow. New CMS pages can
-- use either or both.
-- ============================================================================

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pages' and column_name = 'body'
  ) then
    alter table public.pages add column body text;
  end if;
end $$;