-- ============================================================================
-- STORAGE BUCKETS + POLICIES
-- ============================================================================
-- Creates the storage buckets used by the storefront (products, blog,
-- banners, avatars, pages) and the matching storage.objects policies so
-- admin staff can upload and the public can read.
--
-- Run this AFTER 20260824000100_initial_rescue8_schema.sql.
-- ============================================================================

-- Products: public read, authenticated staff write
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  5 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Blog
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog',
  'blog',
  true,
  5 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Pages (CMS)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pages',
  'pages',
  true,
  5 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Banners
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'banners',
  'banners',
  true,
  10 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Avatars
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- --------------------------------------------------------------------------
-- Storage RLS policies
-- --------------------------------------------------------------------------

-- Public read on every bucket
drop policy if exists "Public read products"    on storage.objects;
drop policy if exists "Public read blog"        on storage.objects;
drop policy if exists "Public read pages"       on storage.objects;
drop policy if exists "Public read banners"     on storage.objects;
drop policy if exists "Public read avatars"     on storage.objects;
drop policy if exists "Staff write products"    on storage.objects;
drop policy if exists "Staff write blog"        on storage.objects;
drop policy if exists "Staff write pages"       on storage.objects;
drop policy if exists "Staff write banners"     on storage.objects;
drop policy if exists "User write own avatar"   on storage.objects;

create policy "Public read products" on storage.objects for select
  to public using (bucket_id = 'products');

create policy "Public read blog" on storage.objects for select
  to public using (bucket_id = 'blog');

create policy "Public read pages" on storage.objects for select
  to public using (bucket_id = 'pages');

create policy "Public read banners" on storage.objects for select
  to public using (bucket_id = 'banners');

create policy "Public read avatars" on storage.objects for select
  to public using (bucket_id = 'avatars');

-- Staff write (admin or super_admin role) on products/blog/pages/banners.
-- The profiles table stores role_id (FK to public.roles), not a role text
-- column, so the policy joins to public.roles to read the role name.
create policy "Staff write products" on storage.objects for insert
  to authenticated with check (
    bucket_id = 'products'
    and exists (
      select 1 from public.profiles p
      join public.roles r on r.id = p.role_id
      where p.id = auth.uid()
        and r.name in ('admin', 'super_admin')
    )
  );

create policy "Staff write blog" on storage.objects for insert
  to authenticated with check (
    bucket_id = 'blog'
    and exists (
      select 1 from public.profiles p
      join public.roles r on r.id = p.role_id
      where p.id = auth.uid()
        and r.name in ('admin', 'super_admin')
    )
  );

create policy "Staff write pages" on storage.objects for insert
  to authenticated with check (
    bucket_id = 'pages'
    and exists (
      select 1 from public.profiles p
      join public.roles r on r.id = p.role_id
      where p.id = auth.uid()
        and r.name in ('admin', 'super_admin')
    )
  );

create policy "Staff write banners" on storage.objects for insert
  to authenticated with check (
    bucket_id = 'banners'
    and exists (
      select 1 from public.profiles p
      join public.roles r on r.id = p.role_id
      where p.id = auth.uid()
        and r.name in ('admin', 'super_admin')
    )
  );

-- Avatars: any authenticated user can write under <uid>/...
create policy "User write own avatar" on storage.objects for insert
  to authenticated with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- WISHLIST
-- ============================================================================
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_wishlist_user_id on public.wishlist(user_id);
create index if not exists idx_wishlist_product_id on public.wishlist(product_id);

alter table public.wishlist enable row level security;

drop policy if exists "Users can read own wishlist"   on public.wishlist;
drop policy if exists "Users can add to own wishlist" on public.wishlist;
drop policy if exists "Users can remove own wishlist" on public.wishlist;

create policy "Users can read own wishlist"
  on public.wishlist for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can add to own wishlist"
  on public.wishlist for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove own wishlist"
  on public.wishlist for delete
  to authenticated
  using (auth.uid() = user_id);
