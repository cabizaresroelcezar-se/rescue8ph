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