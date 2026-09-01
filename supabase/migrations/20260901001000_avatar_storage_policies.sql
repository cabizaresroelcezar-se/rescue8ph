-- ============================================================================
-- AVATAR STORAGE POLICIES (UPDATE + DELETE)
-- ============================================================================
-- The 20260824000200 migration created the 'avatars' bucket and a policy
-- allowing users to INSERT files into their own folder:
--   (storage.foldername(name))[1] = auth.uid()::text
--
-- But it didn't include UPDATE or DELETE policies, which means a user can't
-- replace their avatar (they'd hit "row violates row-level security policy"
-- on update) or remove it (same on delete).
--
-- This migration adds both policies with the same folder restriction.
--
-- Run this AFTER 20260824000200_storage_buckets_and_wishlist.sql.
-- ============================================================================

drop policy if exists "User update own avatar" on storage.objects;
drop policy if exists "User delete own avatar" on storage.objects;

-- Avatars: authenticated user can update files in their own folder
create policy "User update own avatar" on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Avatars: authenticated user can delete files in their own folder
create policy "User delete own avatar" on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );