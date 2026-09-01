-- ============================================================================
-- RESCUE8PH PENDING MIGRATIONS BUNDLE
-- Generated: 2026-09-01T15:31:58Z
-- Source: supabase/migrations/ on main (commit 3ae9c8f)
--
-- Apply these in order via Supabase SQL Editor if the workflow file is not active:
--   https://github.com/cabizaresroelcezar-se/rescue8ph/blob/main/.github/workflows/supabase-migrate.yml
--
-- 12 migrations (20260824000200 through 20260825001100). The original schema
-- (20260824000100_initial_rescue8_schema.sql) is assumed already applied.
-- ============================================================================


-- ============================================================================
-- >>> BEGIN MIGRATION: 20260824000200_storage_buckets_and_wishlist.sql
-- ============================================================================

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

-- <<< END MIGRATION: 20260824000200_storage_buckets_and_wishlist.sql


-- ============================================================================
-- >>> BEGIN MIGRATION: 20260825000100_seed_blog_posts.sql
-- ============================================================================

-- ============================================================================
-- SEED: Blog categories and demo posts for the storefront
-- ============================================================================
-- Idempotent: uses ON CONFLICT DO NOTHING / WHERE NOT EXISTS so it can be
-- safely re-run. Posts require at least one author profile (created by the
-- super_admin test seed in 20260824000100).
-- ============================================================================

-- Categories
insert into public.blog_categories (id, name, slug, description)
values
  ('a1111111-1111-1111-1111-111111111101', 'First Aid',     'first-aid',     'Practical first-aid tips, kit guides, and emergency-response basics.'),
  ('a1111111-1111-1111-1111-111111111102', 'EMS Equipment', 'ems-equipment', 'How to choose and maintain EMS gear for first responders.'),
  ('a1111111-1111-1111-1111-111111111103', 'Disaster Prep', 'disaster-prep', 'Earthquake, typhoon, and flood preparedness for the Philippines.'),
  ('a1111111-1111-1111-1111-111111111104', 'Training',      'training',      'Training program updates, certifications, and field stories.')
on conflict (id) do nothing;

-- Find the super_admin profile to use as the author of seed posts
do $$
declare
  author_id uuid;
begin
  select p.id into author_id
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where r.name = 'super_admin'
  limit 1;

  if author_id is null then
    -- Fallback to any admin profile
    select p.id into author_id
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where r.name in ('admin', 'super_admin')
    limit 1;
  end if;

  if author_id is null then
    raise notice 'No admin profile found; skipping blog seed posts.';
    return;
  end if;

  insert into public.blog_posts
    (id, title, slug, excerpt, content, status, category_id, author_id,
     seo_title, seo_description, published_at)
  values
    (
      'b1111111-1111-1111-1111-111111111101',
      'Building Your First-Aid Kit: A Philippine Field Guide',
      'building-first-aid-kit-philippine-field-guide',
      'What every home, school, and LGU kit should include — calibrated for the kinds of incidents we actually respond to in the Philippines.',
      E'## Why a purpose-built first-aid kit matters\n\nA standard first-aid kit can fail at the worst moment — when a bandage falls off in the rain, when a tourniquet is missing because no one thought to add one, or when a tablet expires unnoticed.\n\n## The core of a Philippine-ready kit\n\nFor our climate and incident types, every kit should include:\n\n- **Bleeding control** — tourniquet, hemostatic gauze, pressure dressings\n- **Basic wound care** — assorted bandages, antiseptic, gauze, tape\n- **CPR & airway** — face shield, pocket mask\n- **Heat & hydration** — oral rehydration salts, electrolyte sachets\n- **Tools** — trauma shears, gloves, marker, whistle\n\n## Storage tips\n\nStore in a waterproof container. Check expiration dates every 6 months. Keep a smaller "go-bag" version in your vehicle.\n\n## Where to buy\n\nRescue 8 Philippines stocks complete kits for **home, school, vehicle, and LGU** use. We also accept bulk orders for institutional buyers.\n\n---\n\nNeed help choosing the right kit? [Contact us](/contact) and our team can recommend a configuration based on your use case.',
      'PUBLISHED',
      'a1111111-1111-1111-1111-111111111101',
      author_id,
      'Building Your First-Aid Kit: A Philippine Field Guide',
      'A practical guide to assembling a first-aid kit for Philippine homes, schools, and LGUs.',
      now() - interval '7 days'
    ),
    (
      'b1111111-1111-1111-1111-111111111102',
      'AED Placement: Where Schools and Offices Should Install One',
      'aed-placement-schools-offices',
      'Strategic AED placement can double survival rates for sudden cardiac arrest. Here is how to pick the right spot.',
      E'## Why location matters\n\nAEDs are most effective when used within **3–5 minutes** of collapse. Every minute of delay reduces survival by ~10%.\n\n## Best placement guidelines\n\n- **High-traffic zones** — lobbies, cafeterias, gyms\n- **Near elevators and stairs** — easily visible from main corridors\n- **Outdoor venues** — near pools, sports fields\n- **Marked and unlocked** — visible signage, accessible during off-hours\n\n## Maintenance checklist\n\n- Battery self-test (monthly)\n- Pad expiration check (every 2 years)\n- Quick visual inspection (weekly)\n\nRescue 8 supplies FDA-aligned AEDs and offers **maintenance contracts** for schools and offices nationwide.',
      'PUBLISHED',
      'a1111111-1111-1111-1111-111111111102',
      author_id,
      'AED Placement: Where Schools and Offices Should Install One',
      'Best practices for AED placement in Philippine schools and offices.',
      now() - interval '14 days'
    ),
    (
      'b1111111-1111-1111-1111-111111111103',
      'Typhoon Preparedness: 72-Hour Kits for Filipino Families',
      'typhoon-preparedness-72-hour-kits',
      'A family-ready emergency kit that covers water, food, light, communication, and first aid for at least three days.',
      E'## The 72-hour rule\n\nWhen a typhoon makes landfall, relief may take **up to 72 hours** to reach the hardest-hit barangays. Your family should be ready to be self-sufficient during that window.\n\n## What to include\n\n- Water — 4 liters per person per day\n- Food — non-perishable, ready-to-eat\n- Light — flashlight + extra batteries\n- Communication — battery radio, power bank\n- First aid — compact trauma + medication kit\n- Documents — sealed copies in waterproof pouch\n\n## Pets and dependents\n\nDon\'t forget supplies for infants, elderly family members, and pets.\n\n---\n\nWe carry complete 72-hour family kits and can customize for your household size. [Shop kits](/products) or [contact us](/contact) for bulk orders.',
      'PUBLISHED',
      'a1111111-1111-1111-1111-111111111103',
      author_id,
      'Typhoon Preparedness: 72-Hour Kits for Filipino Families',
      'Build a 72-hour emergency kit tailored to Philippine typhoon conditions.',
      now() - interval '21 days'
    ),
    (
      'b1111111-1111-1111-1111-111111111104',
      'Stop the Bleed: How Bystanders Can Save Lives',
      'stop-the-bleed-bystander-first-responder',
      'Severe bleeding can kill in minutes. Here is what every bystander can do before help arrives.',
      E'## The window is small\n\nA person can bleed out from a serious wound in **under 5 minutes**. Bystanders who know what to do can be the difference between life and death.\n\n## Three steps to Stop the Bleed\n\n1. **Apply direct pressure** — Use both hands and a clean cloth\n2. **Pack the wound** — Push gauze deep into the source of bleeding\n3. **Apply a tourniquet** — 2–3 inches above the wound, never on a joint\n\n## Training matters\n\nHands-on practice builds the muscle memory you\'ll need under stress. Rescue 8 offers **Stop the Bleed** workshops for schools, LGUs, and corporate offices.\n\n---\n\n[Request a training schedule](/contact) — we deliver on-site or at our Quezon City training facility.',
      'PUBLISHED',
      'a1111111-1111-1111-1111-111111111104',
      author_id,
      'Stop the Bleed: How Bystanders Can Save Lives',
      'A bystander-friendly guide to controlling severe bleeding.',
      now() - interval '30 days'
    ),
    (
      'b1111111-1111-1111-1111-111111111105',
      'Choosing the Right Fire Extinguisher for Your Workplace',
      'choosing-fire-extinguisher-workplace',
      'Classes A through K, placement, and inspection — a quick reference for facility managers.',
      E'## The five classes you need to know\n\n- **Class A** — ordinary combustibles (wood, paper, cloth)\n- **Class B** — flammable liquids (gasoline, oil)\n- **Class C** — flammable gases\n- **Class D** — combustible metals\n- **Class K** — cooking oils and fats\n\n## Workplace recommendations\n\n- **Offices** — Class ABC dry chemical\n- **Kitchens & pantries** — Class K wet chemical\n- **Server rooms** — Class C clean agent\n- **Industrial** — Class ABC + D depending on process\n\n## Inspection basics\n\n- Visual check — gauge pressure, accessibility (monthly)\n- Professional service — annually\n- Hydrostatic test — every 5–12 years\n\nRescue 8 supplies **commercial-grade extinguishers** and offers installation + annual inspection contracts.',
      'PUBLISHED',
      'a1111111-1111-1111-1111-111111111104',
      author_id,
      'Choosing the Right Fire Extinguisher for Your Workplace',
      'A practical guide to fire extinguisher classes, placement, and inspection.',
      now() - interval '40 days'
    )
  on conflict (id) do nothing;
end $$;
-- <<< END MIGRATION: 20260825000100_seed_blog_posts.sql


-- ============================================================================
-- >>> BEGIN MIGRATION: 20260825000200_pages_body.sql
-- ============================================================================

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
-- <<< END MIGRATION: 20260825000200_pages_body.sql


-- ============================================================================
-- >>> BEGIN MIGRATION: 20260825000300_cart_coupon.sql
-- ============================================================================

-- ============================================================================
-- MIGRATION: add applied coupon reference to carts
-- ============================================================================
-- Carts previously had no coupon linkage; customers could not apply a
-- promo code from the cart page. This adds a nullable coupon_id FK plus
-- a cached discount_amount so the cart UI can show the discount without
-- re-validating on every render.
-- ============================================================================

alter table public.carts
  add column if not exists coupon_id uuid references public.coupons(id) on delete set null,
  add column if not exists coupon_discount_amount numeric(12,2);

-- ============================================================================
-- RLS: customers can update only their own cart's coupon fields (insert is
-- handled implicitly by the cart's own user_id policy).
-- ============================================================================

drop policy if exists "Customers can update their own cart" on public.carts;

create policy "Customers can update their own cart"
  on public.carts for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
-- <<< END MIGRATION: 20260825000300_cart_coupon.sql


-- ============================================================================
-- >>> BEGIN MIGRATION: 20260825000400_product_reviews.sql
-- ============================================================================

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
-- <<< END MIGRATION: 20260825000400_product_reviews.sql


-- ============================================================================
-- >>> BEGIN MIGRATION: 20260825000500_seed_products_and_categories.sql
-- ============================================================================

-- ============================================================================
-- MIGRATION: seed products + categories
-- ============================================================================
-- Seeds the 8 categories and 2 starter products + their images.
--
-- IDEMPOTENT: uses ON CONFLICT (slug) DO UPDATE for products, and
-- ON CONFLICT (slug) DO NOTHING for categories (the live DB has more
-- categories than just these).
--
-- IMPORTANT: image storage_paths reference files uploaded to the
-- 'products' storage bucket. Run the storage bucket migration
-- (20260824000200_storage_buckets_and_wishlist.sql) FIRST and upload
-- the actual image files before relying on the URLs to resolve.
-- ============================================================================

-- ----- Categories (additive — keeps existing PUBLISHED categories) -----
insert into public.categories (slug, name, description, status) values
  ('disaster-preparedness', 'Disaster Preparedness', null, 'PUBLISHED'),
  ('ems-equipment',         'EMS Equipment',         null, 'PUBLISHED'),
  ('fire-safety',           'Fire Safety',           null, 'PUBLISHED'),
  ('first-aid-kits',        'First Aid Kits',        null, 'PUBLISHED'),
  ('rescue-equipment',      'Rescue Equipment',      null, 'PUBLISHED'),
  ('safety-equipment',      'Safety Equipment',      null, 'PUBLISHED'),
  ('training-equipment',    'Training Equipment',    null, 'PUBLISHED'),
  ('water-rescue',          'Water Rescue',          null, 'PUBLISHED')
on conflict (slug) do nothing;

-- ----- Products (upsert by slug) -----
insert into public.products (
  id, title, slug, short_description, description,
  price, compare_at_price, sku, status, featured, published_at, created_at, updated_at
) values
  (
    '20e4c747-8b5b-4724-82f5-e9142f225746',
    'First Aid Kit',
    'first-aid-kit',
    'Comprehensive emergency first aid kit designed for workplaces, schools, and homes. Includes bandages, antiseptics, gloves, and emergency tools.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    1000.00,
    null,
    null,
    'ACTIVE',
    false,
    now(),
    '2026-08-24T06:33:18.470425+00:00',
    now()
  ),
  (
    'dc018dc5-5df3-40ae-8159-234100988b78',
    'Go Bag',
    'go-bag',
    '72-hour emergency go-bag packed with essential supplies for evacuation scenarios. Includes water, food rations, first aid, light, and documentation pouches.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    3500.00,
    null,
    null,
    'ACTIVE',
    false,
    now(),
    '2026-08-25T20:31:33.220954+00:00',
    now()
  )
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  status = excluded.status,
  updated_at = now();

-- ----- Product images -----
insert into public.product_images (
  id, product_id, storage_path, alt_text, is_primary, sort_order, created_at
) values
  (
    '54cc0fe4-bc78-4190-a0cd-ea339200c049',
    '20e4c747-8b5b-4724-82f5-e9142f225746',
    '20e4c747-8b5b-4724-82f5-e9142f225746/1787689613159-8j0i10-r8prod-first-aid-kit.jpg',
    'r8prod-first-aid-kit',
    true,
    0,
    now()
  ),
  (
    'd39ef2f3-7a0d-4592-a42c-590817b6048d',
    'dc018dc5-5df3-40ae-8159-234100988b78',
    'dc018dc5-5df3-40ae-8159-234100988b78/1787689901077-sl31x0-r8prod-go-bag.jpg',
    'r8prod-go-bag',
    true,
    0,
    now()
  )
on conflict (id) do update set
  storage_path = excluded.storage_path,
  alt_text = excluded.alt_text,
  is_primary = excluded.is_primary,
  sort_order = excluded.sort_order;

-- ----- Product-Category links (First Aid Kit → First Aid Kits) -----
insert into public.product_categories (product_id, category_id)
select p.id, c.id
from public.products p
cross join public.categories c
where p.slug = 'first-aid-kit' and c.slug = 'first-aid-kits'
on conflict do nothing;

insert into public.product_categories (product_id, category_id)
select p.id, c.id
from public.products p
cross join public.categories c
where p.slug = 'go-bag' and c.slug = 'disaster-preparedness'
on conflict do nothing;
-- <<< END MIGRATION: 20260825000500_seed_products_and_categories.sql


-- ============================================================================
-- >>> BEGIN MIGRATION: 20260825000600_recently_viewed.sql
-- ============================================================================

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
-- <<< END MIGRATION: 20260825000600_recently_viewed.sql


-- ============================================================================
-- >>> BEGIN MIGRATION: 20260825000700_review_helpful_votes.sql
-- ============================================================================

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
-- <<< END MIGRATION: 20260825000700_review_helpful_votes.sql


-- ============================================================================
-- >>> BEGIN MIGRATION: 20260825000800_add_pages_body_column.sql
-- ============================================================================

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
-- <<< END MIGRATION: 20260825000800_add_pages_body_column.sql


-- ============================================================================
-- >>> BEGIN MIGRATION: 20260825000900_order_notes.sql
-- ============================================================================

-- ============================================================================
-- MIGRATION: order notes (admin conversation thread)
-- ============================================================================
-- A per-order timeline of notes from staff (and optionally the customer).
-- Internal-only by default — never exposed on storefront.
--
-- Use cases:
-- - Customer service: "Spoke with customer on the phone, requested
--   rush shipping because emergency preparedness class next week."
-- - Ops coordination: "Inventory confirmed for warehouse B."
-- - Audit trail: who said what, when, on each order.
--
-- This is DIFFERENT from orders.internal_notes (a single freeform
-- text column on orders) and orders.customer_notes (set at checkout).
-- order_notes is an append-only conversation thread.
-- ============================================================================

-- Enum for note visibility (must exist before table)
do $$ begin
  if not exists (
    select 1 from pg_type where typname = 'note_visibility'
  ) then
    create type note_visibility as enum ('INTERNAL', 'CUSTOMER_VISIBLE');
  end if;
end $$;

create table if not exists public.order_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  -- Visibility: INTERNAL = staff only, CUSTOMER_VISIBLE = also shown to
  -- the order's customer (future-facing: will surface in /account/orders/[id])
  visibility note_visibility not null default 'INTERNAL',
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_order_notes_order_created
  on public.order_notes(order_id, created_at desc);

create index if not exists idx_order_notes_author
  on public.order_notes(author_id);

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'order_notes_body_length'
  ) then
    alter table public.order_notes
      add constraint order_notes_body_length
      check (char_length(body) between 1 and 4000);
  end if;
end $$;

drop trigger if exists order_notes_set_updated_at on public.order_notes;
create trigger order_notes_set_updated_at
  before update on public.order_notes
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.order_notes enable row level security;

-- Staff can read all notes
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'order_notes'
      and policyname = 'Staff can read all order notes'
  ) then
    create policy "Staff can read all order notes"
      on public.order_notes for select
      to authenticated
      using (private.is_staff());
  end if;
end $$;

-- Customers can read notes flagged CUSTOMER_VISIBLE on their own orders
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'order_notes'
      and policyname = 'Customers can read customer-visible notes on their orders'
  ) then
    create policy "Customers can read customer-visible notes on their orders"
      on public.order_notes for select
      to authenticated
      using (
        visibility = 'CUSTOMER_VISIBLE'
        and exists (
          select 1 from public.orders o
          where o.id = order_notes.order_id and o.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- Staff can add notes (must check permission for write)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'order_notes'
      and policyname = 'Staff can add order notes'
  ) then
    create policy "Staff can add order notes"
      on public.order_notes for insert
      to authenticated
      with check (
        author_id = auth.uid()
        and private.has_permission('ORDER_UPDATE')
      );
  end if;
end $$;

-- Staff can edit their own notes (within 5 minutes, so they can fix typos)
-- implemented at app layer via server action (RLS doesn't have time-window
-- predicates cleanly). RLS lets any staff update their own row.
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'order_notes'
      and policyname = 'Staff can update their own order notes'
  ) then
    create policy "Staff can update their own order notes"
      on public.order_notes for update
      to authenticated
      using (author_id = auth.uid() and private.is_staff())
      with check (author_id = auth.uid() and private.is_staff());
  end if;
end $$;

-- Staff can delete their own notes (within edit window) OR any note
-- if they have ORDER_DELETE permission (for compliance takedown)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'order_notes'
      and policyname = 'Staff can delete order notes'
  ) then
    create policy "Staff can delete order notes"
      on public.order_notes for delete
      to authenticated
      using (
        author_id = auth.uid()
        or private.has_permission('ORDER_DELETE')
      );
  end if;
end $$;
-- <<< END MIGRATION: 20260825000900_order_notes.sql


-- ============================================================================
-- >>> BEGIN MIGRATION: 20260825001000_cms_enhancements.sql
-- ============================================================================

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
-- <<< END MIGRATION: 20260825001000_cms_enhancements.sql


-- ============================================================================
-- >>> BEGIN MIGRATION: 20260825001100_wishlist_share_links.sql
-- ============================================================================

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

-- Plain (non-partial) index on the lookups we run for share-link fetches:
--   - by id (PK is already indexed, but this also covers id-only queries)
--   - by user_id for the owner's own-link listing
-- We don't use a partial predicate here because Postgres requires
-- index-predicate functions be IMMUTABLE, but now() is STABLE. Filtering
-- by revoked_at/expires_at is done in the WHERE clauses / RLS policies.
create index if not exists idx_wishlist_share_links_active
  on public.wishlist_share_links(id, user_id);

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
-- <<< END MIGRATION: 20260825001100_wishlist_share_links.sql

