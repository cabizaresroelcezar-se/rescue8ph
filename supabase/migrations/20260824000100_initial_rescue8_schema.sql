-- ============================================================================
-- Rescue 8 Philippines — Initial Schema and RLS Foundation
-- Migration: 20260824000100_initial_rescue8_schema.sql
-- Task: DB-001
-- ============================================================================

-- This migration creates the complete initial database schema including:
--   - Enums
--   - Roles, permissions, role_permissions
--   - Profiles with auth trigger
--   - Products, categories, images, variants
--   - Inventory and movements
--   - Customer addresses, carts, cart items
--   - Orders, order items, order addresses, order status history
--   - Payments, payment transactions
--   - Shipping rates, shipments, shipment events
--   - Coupons, coupon redemptions
--   - CMS pages, page sections
--   - Blog categories, blog posts
--   - FAQs, testimonials, services
--   - Media, site settings, navigation, audit logs
--   - Security helper functions
--   - RLS policies
--   - Storage buckets
--   - Seed data (roles, permissions)

-- ============================================================================
-- ENUMS
-- ============================================================================

create type profile_status as enum ('ACTIVE', 'INACTIVE', 'SUSPENDED');
create type product_status as enum ('DRAFT', 'ACTIVE', 'ARCHIVED');
create type content_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');
create type inventory_movement_type as enum (
  'PURCHASE', 'SALE', 'RESERVATION', 'RELEASE', 'RETURN', 'DAMAGE', 'ADJUSTMENT'
);
create type order_status as enum (
  'PENDING', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'READY_TO_SHIP',
  'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED',
  'REFUNDED', 'PARTIALLY_REFUNDED'
);
create type payment_status as enum (
  'PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED',
  'PARTIALLY_REFUNDED'
);
create type payment_provider as enum ('XENDIT', 'PAYMONGO', 'MANUAL');
create type shipping_provider as enum ('MANUAL', 'LALAMOVE', 'JNT', 'LBC');
create type shipment_status as enum (
  'PENDING', 'QUOTED', 'BOOKED', 'PICKED_UP', 'IN_TRANSIT',
  'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED'
);
create type coupon_discount_type as enum ('PERCENTAGE', 'FIXED_AMOUNT');
create type media_type as enum ('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER');
create type page_section_type as enum (
  'HERO', 'FEATURE_GRID', 'PRODUCT_GRID', 'IMAGE_TEXT', 'SERVICE_GRID',
  'TESTIMONIALS', 'FAQ', 'BLOG_GRID', 'CTA', 'RICH_TEXT', 'BANNER'
);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION (reusable)
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- ROLES
-- ============================================================================

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ROLE PERMISSIONS
-- ============================================================================

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- ============================================================================
-- PROFILES
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  status profile_status not null default 'ACTIVE',
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role_id on public.profiles(role_id);
create index idx_profiles_status on public.profiles(status);

-- Trigger: auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_role_id uuid;
  first text;
  last text;
begin
  -- Get the customer role id
  select id into customer_role_id from public.roles where name = 'customer' limit 1;

  if customer_role_id is null then
    raise exception 'Customer role not found. Ensure seed data is applied.';
  end if;

  -- Safely read optional metadata (never used for authorization)
  first := nullif(new.raw_user_meta_data->>'first_name', '');
  last := nullif(new.raw_user_meta_data->>'last_name', '');

  insert into public.profiles (id, role_id, status, first_name, last_name)
  values (new.id, customer_role_id, 'ACTIVE', first, last);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- PRODUCTS
-- ============================================================================

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  short_description text,
  description text,
  price numeric(12,2) not null,
  compare_at_price numeric(12,2),
  sku text unique,
  status product_status not null default 'DRAFT',
  featured boolean not null default false,
  weight_grams integer,
  length_cm numeric(10,2),
  width_cm numeric(10,2),
  height_cm numeric(10,2),
  seo_title text,
  seo_description text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint products_price_positive check (price >= 0),
  constraint products_compare_at_price_positive check (compare_at_price is null or compare_at_price >= 0),
  constraint products_weight_positive check (weight_grams is null or weight_grams >= 0),
  constraint products_length_positive check (length_cm is null or length_cm >= 0),
  constraint products_width_positive check (width_cm is null or width_cm >= 0),
  constraint products_height_positive check (height_cm is null or height_cm >= 0)
);

create index idx_products_slug on public.products(slug);
create index idx_products_status on public.products(status);
create index idx_products_featured on public.products(featured);
create index idx_products_created_at on public.products(created_at);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================================
-- CATEGORIES
-- ============================================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  parent_id uuid references public.categories(id),
  status content_status not null default 'DRAFT',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_categories_slug on public.categories(slug);
create index idx_categories_parent_id on public.categories(parent_id);
create index idx_categories_status on public.categories(status);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ============================================================================
-- PRODUCT CATEGORIES
-- ============================================================================

create table public.product_categories (
  product_id uuid references public.products(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create index idx_product_categories_category_id on public.product_categories(category_id);

-- ============================================================================
-- PRODUCT IMAGES
-- ============================================================================

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_product_images_product_id on public.product_images(product_id);
create index idx_product_images_sort_order on public.product_images(sort_order);

-- Partial unique index: at most one primary image per product
create unique index idx_product_images_primary
  on public.product_images(product_id)
  where is_primary = true;

create trigger product_images_set_updated_at
  before update on public.product_images
  for each row execute function public.set_updated_at();

-- ============================================================================
-- PRODUCT VARIANTS
-- ============================================================================

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text unique,
  price numeric(12,2),
  stock integer not null default 0,
  attributes jsonb not null default '{}'::jsonb,
  status product_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_stock_positive check (stock >= 0),
  constraint product_variants_price_positive check (price is null or price >= 0)
);

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- ============================================================================
-- INVENTORY
-- ============================================================================

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  quantity_on_hand integer not null default 0,
  quantity_reserved integer not null default 0,
  reorder_level integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_on_hand_positive check (quantity_on_hand >= 0),
  constraint inventory_reserved_positive check (quantity_reserved >= 0),
  constraint inventory_reorder_positive check (reorder_level >= 0),
  constraint inventory_reserved_le_on_hand check (quantity_reserved <= quantity_on_hand)
);

create trigger inventory_set_updated_at
  before update on public.inventory
  for each row execute function public.set_updated_at();

-- ============================================================================
-- INVENTORY MOVEMENTS
-- ============================================================================

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  movement_type inventory_movement_type not null,
  quantity integer not null,
  reference_type text,
  reference_id uuid,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint inventory_movements_quantity_positive check (quantity > 0)
);

create index idx_inventory_movements_product_id on public.inventory_movements(product_id);
create index idx_inventory_movements_reference_id on public.inventory_movements(reference_id);
create index idx_inventory_movements_created_at on public.inventory_movements(created_at);

-- ============================================================================
-- CUSTOMER ADDRESSES
-- ============================================================================

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  first_name text not null,
  last_name text not null,
  phone text not null,
  region text not null,
  province text not null,
  city_municipality text not null,
  barangay text not null,
  street_address text not null,
  building_unit text,
  postal_code text,
  delivery_notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customer_addresses_user_id on public.customer_addresses(user_id);

-- Partial unique index: one default address per user
create unique index idx_customer_addresses_default
  on public.customer_addresses(user_id)
  where is_default = true;

create trigger customer_addresses_set_updated_at
  before update on public.customer_addresses
  for each row execute function public.set_updated_at();

-- ============================================================================
-- CARTS
-- ============================================================================

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger carts_set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

-- ============================================================================
-- CART ITEMS
-- ============================================================================

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  quantity integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_quantity_positive check (quantity > 0)
);

-- Prevent duplicate lines for same cart/product/variant combination
-- Handle NULL variant safely
create unique index idx_cart_items_unique
  on public.cart_items(cart_id, product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));

create trigger cart_items_set_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ORDERS
-- ============================================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid not null references auth.users(id) on delete restrict,
  status order_status not null default 'PENDING',
  currency char(3) not null default 'PHP',
  subtotal numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  shipping_total numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null default 0,
  customer_notes text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_subtotal_positive check (subtotal >= 0),
  constraint orders_discount_positive check (discount_total >= 0),
  constraint orders_shipping_positive check (shipping_total >= 0),
  constraint orders_tax_positive check (tax_total >= 0),
  constraint orders_grand_total_positive check (grand_total >= 0)
);

create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created_at on public.orders(created_at);
create index idx_orders_order_number on public.orders(order_number);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Order number generation sequence
create sequence public.order_number_seq;

create or replace function public.generate_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  seq_val bigint;
  date_part text;
  order_num text;
begin
  select nextval('public.order_number_seq') into seq_val;
  date_part := to_char(now(), 'YYYYMMDD');
  order_num := 'R8-' || date_part || '-' || lpad(seq_val::text, 6, '0');
  return order_num;
end;
$$;

-- ============================================================================
-- ORDER ADDRESSES (historical snapshot)
-- ============================================================================

create table public.order_addresses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text,
  region text not null,
  province text not null,
  city_municipality text not null,
  barangay text not null,
  street_address text not null,
  building_unit text,
  postal_code text,
  delivery_notes text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ORDER ITEMS (historical snapshot)
-- ============================================================================

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  product_name text not null,
  sku text,
  unit_price numeric(12,2) not null,
  quantity integer not null,
  discount_amount numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null,
  created_at timestamptz not null default now(),
  constraint order_items_unit_price_positive check (unit_price >= 0),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_discount_positive check (discount_amount >= 0),
  constraint order_items_subtotal_positive check (subtotal >= 0)
);

-- ============================================================================
-- ORDER STATUS HISTORY
-- ============================================================================

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  note text,
  changed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index idx_order_status_history_order_id on public.order_status_history(order_id);
create index idx_order_status_history_created_at on public.order_status_history(created_at);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider payment_provider not null,
  status payment_status not null default 'PENDING',
  amount numeric(12,2) not null,
  currency char(3) not null default 'PHP',
  provider_payment_id text,
  provider_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_positive check (amount > 0)
);

create index idx_payments_order_id on public.payments(order_id);
create index idx_payments_status on public.payments(status);
create index idx_payments_provider_payment_id on public.payments(provider_payment_id);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ============================================================================
-- PAYMENT TRANSACTIONS
-- ============================================================================

create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  event_type text not null,
  external_event_id text,
  status payment_status,
  amount numeric(12,2),
  payload jsonb,
  created_at timestamptz not null default now()
);

create index idx_payment_transactions_payment_id on public.payment_transactions(payment_id);
create index idx_payment_transactions_external_event_id on public.payment_transactions(external_event_id);

-- ============================================================================
-- SHIPPING RATES
-- ============================================================================

create table public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  provider shipping_provider not null,
  service_name text not null,
  rate numeric(12,2) not null,
  currency char(3) not null default 'PHP',
  estimated_delivery_text text,
  provider_rate_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint shipping_rates_rate_positive check (rate >= 0)
);

-- ============================================================================
-- SHIPMENTS
-- ============================================================================

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider shipping_provider not null,
  status shipment_status not null default 'PENDING',
  tracking_number text,
  provider_shipment_id text,
  service_name text,
  shipping_cost numeric(12,2) not null default 0,
  estimated_delivery_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shipments_cost_positive check (shipping_cost >= 0)
);

create index idx_shipments_order_id on public.shipments(order_id);
create index idx_shipments_tracking_number on public.shipments(tracking_number);
create index idx_shipments_provider_shipment_id on public.shipments(provider_shipment_id);

create trigger shipments_set_updated_at
  before update on public.shipments
  for each row execute function public.set_updated_at();

-- ============================================================================
-- SHIPMENT EVENTS
-- ============================================================================

create table public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status shipment_status not null,
  event_time timestamptz not null default now(),
  description text,
  provider_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_shipment_events_shipment_id on public.shipment_events(shipment_id);
create index idx_shipment_events_event_time on public.shipment_events(event_time);

-- ============================================================================
-- COUPONS
-- ============================================================================

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type coupon_discount_type not null,
  discount_value numeric(12,2) not null,
  minimum_order_amount numeric(12,2),
  maximum_discount_amount numeric(12,2),
  usage_limit integer,
  usage_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_discount_value_positive check (discount_value > 0),
  constraint coupons_minimum_order_positive check (minimum_order_amount is null or minimum_order_amount >= 0),
  constraint coupons_maximum_discount_positive check (maximum_discount_amount is null or maximum_discount_amount >= 0),
  constraint coupons_usage_limit_positive check (usage_limit is null or usage_limit > 0),
  constraint coupons_usage_count_positive check (usage_count >= 0)
);

create trigger coupons_set_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

-- ============================================================================
-- COUPON REDEMPTIONS
-- ============================================================================

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  discount_amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

-- Prevent multiple redemptions for the same order
create unique index idx_coupon_redemptions_order on public.coupon_redemptions(order_id);

-- ============================================================================
-- CMS PAGES
-- ============================================================================

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  status content_status not null default 'DRAFT',
  seo_title text,
  seo_description text,
  og_image_url text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_pages_slug on public.pages(slug);
create index idx_pages_status on public.pages(status);

create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

-- ============================================================================
-- PAGE SECTIONS
-- ============================================================================

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_type page_section_type not null,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_page_sections_page_id on public.page_sections(page_id);
create index idx_page_sections_sort_order on public.page_sections(sort_order);

create trigger page_sections_set_updated_at
  before update on public.page_sections
  for each row execute function public.set_updated_at();

-- ============================================================================
-- BLOG CATEGORIES
-- ============================================================================

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger blog_categories_set_updated_at
  before update on public.blog_categories
  for each row execute function public.set_updated_at();

-- ============================================================================
-- BLOG POSTS
-- ============================================================================

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  featured_image_url text,
  author_id uuid references public.profiles(id),
  category_id uuid references public.blog_categories(id),
  status content_status not null default 'DRAFT',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_blog_posts_slug on public.blog_posts(slug);
create index idx_blog_posts_status on public.blog_posts(status);
create index idx_blog_posts_published_at on public.blog_posts(published_at);

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ============================================================================
-- FAQs
-- ============================================================================

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger faqs_set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

-- ============================================================================
-- TESTIMONIALS
-- ============================================================================

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_or_company text,
  quote text not null,
  image_url text,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- ============================================================================
-- SERVICES
-- ============================================================================

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  short_description text,
  description text,
  image_url text,
  sort_order integer not null default 0,
  status content_status not null default 'DRAFT',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ============================================================================
-- MEDIA
-- ============================================================================

create table public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  file_name text not null,
  file_type media_type not null,
  mime_type text,
  file_size bigint,
  alt_text text,
  width integer,
  height integer,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index idx_media_file_type on public.media(file_type);
create index idx_media_uploaded_by on public.media(uploaded_by);

-- ============================================================================
-- SITE SETTINGS
-- ============================================================================

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- NAVIGATION ITEMS
-- ============================================================================

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text,
  parent_id uuid references public.navigation_items(id) on delete cascade,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  open_in_new_tab boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_navigation_items_parent_id on public.navigation_items(parent_id);
create index idx_navigation_items_sort_order on public.navigation_items(sort_order);

create trigger navigation_items_set_updated_at
  before update on public.navigation_items
  for each row execute function public.set_updated_at();

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_user_id on public.audit_logs(user_id);
create index idx_audit_logs_resource_type on public.audit_logs(resource_type);
create index idx_audit_logs_resource_id on public.audit_logs(resource_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at);

-- ============================================================================
-- SECURITY HELPER FUNCTIONS (private schema)
-- ============================================================================

create schema if not exists private;

-- Helper: get the role name of the current user
create or replace function private.get_user_role()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  role_name text;
begin
  if auth.uid() is null then
    return null;
  end if;

  select r.name into role_name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid();

  return role_name;
end;
$$;

-- Helper: check if current user has a specific role
create or replace function private.has_role(role_name text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return private.get_user_role() = role_name;
end;
$$;

-- Helper: check if current user has a specific permission
create or replace function private.has_permission(permission_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  has_perm boolean := false;
begin
  if auth.uid() is null then
    return false;
  end if;

  select exists(
    select 1
    from public.profiles p
    join public.role_permissions rp on rp.role_id = p.role_id
    join public.permissions perm on perm.id = rp.permission_id
    where p.id = auth.uid()
      and perm.code = permission_code
  ) into has_perm;

  return has_perm;
end;
$$;

-- Helper: check if current user is super_admin
create or replace function private.is_super_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return private.has_role('super_admin');
end;
$$;

-- Helper: check if current user is admin or super_admin
create or replace function private.is_staff()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return private.has_role('admin') or private.has_role('super_admin');
end;
$$;

-- Helper: check if a row belongs to the current user (for use in RLS)
create or replace function private.is_owner(user_uuid uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return auth.uid() is not null and auth.uid() = user_uuid;
end;
$$;

-- ============================================================================
-- RLS: Enable on all application tables
-- ============================================================================

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_addresses enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_events enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.faqs enable row level security;
alter table public.testimonials enable row level security;
alter table public.services enable row level security;
alter table public.media enable row level security;
alter table public.site_settings enable row level security;
alter table public.navigation_items enable row level security;
alter table public.audit_logs enable row level security;

-- ============================================================================
-- RLS POLICIES: PUBLIC READ (anonymous + authenticated)
-- ============================================================================

-- Roles/permissions are readable by authenticated users
create policy "Authenticated can read roles"
  on public.roles for select
  to authenticated
  using (true);

create policy "Authenticated can read permissions"
  on public.permissions for select
  to authenticated
  using (true);

create policy "Authenticated can read role_permissions"
  on public.role_permissions for select
  to authenticated
  using (true);

-- Products: public can read ACTIVE
create policy "Public can read active products"
  on public.products for select
  to anon, authenticated
  using (status = 'ACTIVE');

create policy "Staff can read all products"
  on public.products for select
  to authenticated
  using (private.is_staff());

create policy "Staff can insert products"
  on public.products for insert
  to authenticated
  with check (private.has_permission('PRODUCTS_CREATE'));

create policy "Staff can update products"
  on public.products for update
  to authenticated
  using (private.has_permission('PRODUCTS_UPDATE'))
  with check (private.has_permission('PRODUCTS_UPDATE'));

create policy "Staff can delete products"
  on public.products for delete
  to authenticated
  using (private.has_permission('PRODUCTS_DELETE'));

-- Categories: public can read PUBLISHED
create policy "Public can read published categories"
  on public.categories for select
  to anon, authenticated
  using (status = 'PUBLISHED');

create policy "Staff can read all categories"
  on public.categories for select
  to authenticated
  using (private.is_staff());

create policy "Staff can insert categories"
  on public.categories for insert
  to authenticated
  with check (private.has_permission('CONTENT_CREATE'));

create policy "Staff can update categories"
  on public.categories for update
  to authenticated
  using (private.has_permission('CONTENT_UPDATE'))
  with check (private.has_permission('CONTENT_UPDATE'));

create policy "Staff can delete categories"
  on public.categories for delete
  to authenticated
  using (private.has_permission('CONTENT_DELETE'));

-- Product categories: public can read
create policy "Public can read product_categories"
  on public.product_categories for select
  to anon, authenticated
  using (true);

create policy "Staff can manage product_categories"
  on public.product_categories for all
  to authenticated
  using (private.has_permission('PRODUCTS_UPDATE'))
  with check (private.has_permission('PRODUCTS_UPDATE'));

-- Product images: public can read
create policy "Public can read product images"
  on public.product_images for select
  to anon, authenticated
  using (true);

create policy "Staff can insert product images"
  on public.product_images for insert
  to authenticated
  with check (private.has_permission('MEDIA_UPLOAD'));

create policy "Staff can update product images"
  on public.product_images for update
  to authenticated
  using (private.has_permission('MEDIA_UPLOAD'))
  with check (private.has_permission('MEDIA_UPLOAD'));

create policy "Staff can delete product images"
  on public.product_images for delete
  to authenticated
  using (private.has_permission('MEDIA_DELETE'));

-- Product variants: public can read ACTIVE
create policy "Public can read active variants"
  on public.product_variants for select
  to anon, authenticated
  using (status = 'ACTIVE');

create policy "Staff can read all variants"
  on public.product_variants for select
  to authenticated
  using (private.is_staff());

create policy "Staff can insert variants"
  on public.product_variants for insert
  to authenticated
  with check (private.has_permission('PRODUCTS_CREATE'));

create policy "Staff can update variants"
  on public.product_variants for update
  to authenticated
  using (private.has_permission('PRODUCTS_UPDATE'))
  with check (private.has_permission('PRODUCTS_UPDATE'));

create policy "Staff can delete variants"
  on public.product_variants for delete
  to authenticated
  using (private.has_permission('PRODUCTS_DELETE'));

-- Inventory: staff only
create policy "Staff can read inventory"
  on public.inventory for select
  to authenticated
  using (private.has_permission('INVENTORY_VIEW'));

create policy "Staff can update inventory"
  on public.inventory for insert
  to authenticated
  with check (private.has_permission('INVENTORY_UPDATE'));

create policy "Staff can insert inventory"
  on public.inventory for update
  to authenticated
  using (private.has_permission('INVENTORY_UPDATE'))
  with check (private.has_permission('INVENTORY_UPDATE'));

create policy "Staff can delete inventory"
  on public.inventory for delete
  to authenticated
  using (private.has_permission('INVENTORY_UPDATE'));

-- Inventory movements: staff only
create policy "Staff can read inventory movements"
  on public.inventory_movements for select
  to authenticated
  using (private.has_permission('INVENTORY_VIEW'));

create policy "Staff can insert inventory movements"
  on public.inventory_movements for insert
  to authenticated
  with check (private.has_permission('INVENTORY_UPDATE'));

-- Pages: public can read PUBLISHED
create policy "Public can read published pages"
  on public.pages for select
  to anon, authenticated
  using (status = 'PUBLISHED');

create policy "Staff can read all pages"
  on public.pages for select
  to authenticated
  using (private.is_staff());

create policy "Staff can insert pages"
  on public.pages for insert
  to authenticated
  with check (private.has_permission('CONTENT_CREATE'));

create policy "Staff can update pages"
  on public.pages for update
  to authenticated
  using (private.has_permission('CONTENT_UPDATE'))
  with check (private.has_permission('CONTENT_UPDATE'));

create policy "Staff can delete pages"
  on public.pages for delete
  to authenticated
  using (private.has_permission('CONTENT_DELETE'));

-- Page sections: public can read enabled sections of published pages
create policy "Public can read page sections"
  on public.page_sections for select
  to anon, authenticated
  using (
    is_enabled = true
    and exists (
      select 1 from public.pages p
      where p.id = page_sections.page_id
        and p.status = 'PUBLISHED'
    )
  );

create policy "Staff can read all page sections"
  on public.page_sections for select
  to authenticated
  using (private.is_staff());

create policy "Staff can insert page sections"
  on public.page_sections for insert
  to authenticated
  with check (private.has_permission('CONTENT_CREATE'));

create policy "Staff can update page sections"
  on public.page_sections for update
  to authenticated
  using (private.has_permission('CONTENT_UPDATE'))
  with check (private.has_permission('CONTENT_UPDATE'));

create policy "Staff can delete page sections"
  on public.page_sections for delete
  to authenticated
  using (private.has_permission('CONTENT_DELETE'));

-- Blog categories: public can read
create policy "Public can read blog categories"
  on public.blog_categories for select
  to anon, authenticated
  using (true);

create policy "Staff can manage blog categories"
  on public.blog_categories for all
  to authenticated
  using (private.has_permission('CONTENT_UPDATE'))
  with check (private.has_permission('CONTENT_UPDATE'));

-- Blog posts: public can read PUBLISHED
create policy "Public can read published blog posts"
  on public.blog_posts for select
  to anon, authenticated
  using (status = 'PUBLISHED');

create policy "Staff can read all blog posts"
  on public.blog_posts for select
  to authenticated
  using (private.is_staff());

create policy "Staff can insert blog posts"
  on public.blog_posts for insert
  to authenticated
  with check (private.has_permission('CONTENT_CREATE'));

create policy "Staff can update blog posts"
  on public.blog_posts for update
  to authenticated
  using (private.has_permission('CONTENT_UPDATE'))
  with check (private.has_permission('CONTENT_UPDATE'));

create policy "Staff can delete blog posts"
  on public.blog_posts for delete
  to authenticated
  using (private.has_permission('CONTENT_DELETE'));

-- FAQs: public can read enabled
create policy "Public can read enabled FAQs"
  on public.faqs for select
  to anon, authenticated
  using (is_enabled = true);

create policy "Staff can read all FAQs"
  on public.faqs for select
  to authenticated
  using (private.is_staff());

create policy "Staff can manage FAQs"
  on public.faqs for all
  to authenticated
  using (private.has_permission('CONTENT_UPDATE'))
  with check (private.has_permission('CONTENT_UPDATE'));

-- Testimonials: public can read enabled
create policy "Public can read enabled testimonials"
  on public.testimonials for select
  to anon, authenticated
  using (is_enabled = true);

create policy "Staff can read all testimonials"
  on public.testimonials for select
  to authenticated
  using (private.is_staff());

create policy "Staff can manage testimonials"
  on public.testimonials for all
  to authenticated
  using (private.has_permission('CONTENT_UPDATE'))
  with check (private.has_permission('CONTENT_UPDATE'));

-- Services: public can read PUBLISHED
create policy "Public can read published services"
  on public.services for select
  to anon, authenticated
  using (status = 'PUBLISHED');

create policy "Staff can read all services"
  on public.services for select
  to authenticated
  using (private.is_staff());

create policy "Staff can manage services"
  on public.services for all
  to authenticated
  using (private.has_permission('CONTENT_UPDATE'))
  with check (private.has_permission('CONTENT_UPDATE'));

-- Navigation items: public can read enabled
create policy "Public can read navigation"
  on public.navigation_items for select
  to anon, authenticated
  using (is_enabled = true);

create policy "Staff can manage navigation"
  on public.navigation_items for all
  to authenticated
  using (private.has_permission('SETTINGS_MANAGE'))
  with check (private.has_permission('SETTINGS_MANAGE'));

-- Site settings: public can read public settings
create policy "Public can read public settings"
  on public.site_settings for select
  to anon, authenticated
  using (is_public = true);

create policy "Staff can read all settings"
  on public.site_settings for select
  to authenticated
  using (private.has_permission('SETTINGS_VIEW'));

create policy "Staff can manage settings"
  on public.site_settings for all
  to authenticated
  using (private.has_permission('SETTINGS_MANAGE'))
  with check (private.has_permission('SETTINGS_MANAGE'));

-- Media: staff can read all, public can read
create policy "Authenticated can read media"
  on public.media for select
  to anon, authenticated
  using (true);

create policy "Staff can upload media"
  on public.media for insert
  to authenticated
  with check (private.has_permission('MEDIA_UPLOAD'));

create policy "Staff can delete media"
  on public.media for delete
  to authenticated
  using (private.has_permission('MEDIA_DELETE'));

-- Coupons: staff only (no public read)
create policy "Staff can read coupons"
  on public.coupons for select
  to authenticated
  using (private.is_staff());

create policy "Staff can manage coupons"
  on public.coupons for all
  to authenticated
  using (private.has_permission('SETTINGS_MANAGE'))
  with check (private.has_permission('SETTINGS_MANAGE'));

-- ============================================================================
-- RLS POLICIES: CUSTOMER (own records only)
-- ============================================================================

-- Profiles: customer can read/update own
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Customer addresses: full CRUD on own
create policy "Users can read own addresses"
  on public.customer_addresses for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own addresses"
  on public.customer_addresses for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own addresses"
  on public.customer_addresses for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own addresses"
  on public.customer_addresses for delete
  to authenticated
  using (auth.uid() = user_id);

-- Carts: full CRUD on own
create policy "Users can read own cart"
  on public.carts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own cart"
  on public.carts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own cart"
  on public.carts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cart"
  on public.carts for delete
  to authenticated
  using (auth.uid() = user_id);

-- Cart items: access via cart ownership
create policy "Users can read own cart items"
  on public.cart_items for select
  to authenticated
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users can insert own cart items"
  on public.cart_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users can update own cart items"
  on public.cart_items for update
  to authenticated
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users can delete own cart items"
  on public.cart_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id
        and c.user_id = auth.uid()
    )
  );

-- Orders: customer reads own, staff reads all
create policy "Users can read own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Staff can read all orders"
  on public.orders for select
  to authenticated
  using (private.has_permission('ORDERS_VIEW'));

create policy "Staff can update orders"
  on public.orders for update
  to authenticated
  using (private.has_permission('ORDERS_UPDATE'))
  with check (private.has_permission('ORDERS_UPDATE'));

-- Order addresses: customer reads own, staff reads all
create policy "Users can read own order addresses"
  on public.order_addresses for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );

create policy "Staff can read all order addresses"
  on public.order_addresses for select
  to authenticated
  using (private.has_permission('ORDERS_VIEW'));

-- Order items: customer reads own, staff reads all
create policy "Users can read own order items"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );

create policy "Staff can read all order items"
  on public.order_items for select
  to authenticated
  using (private.has_permission('ORDERS_VIEW'));

-- Order status history: customer reads own, staff reads all
create policy "Users can read own order history"
  on public.order_status_history for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );

create policy "Staff can read all order history"
  on public.order_status_history for select
  to authenticated
  using (private.has_permission('ORDERS_VIEW'));

create policy "Staff can insert order history"
  on public.order_status_history for insert
  to authenticated
  with check (private.has_permission('ORDERS_UPDATE'));

-- Payments: customer reads own (read-only), staff reads all
create policy "Users can read own payments"
  on public.payments for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id
        and o.user_id = auth.uid()
    )
  );

create policy "Staff can read all payments"
  on public.payments for select
  to authenticated
  using (private.has_permission('ORDERS_VIEW'));

create policy "Staff can update payments"
  on public.payments for update
  to authenticated
  using (private.has_permission('ORDERS_UPDATE'))
  with check (private.has_permission('ORDERS_UPDATE'));

create policy "Staff can insert payments"
  on public.payments for insert
  to authenticated
  with check (private.has_permission('ORDERS_UPDATE'));

-- Payment transactions: staff only
create policy "Staff can read payment transactions"
  on public.payment_transactions for select
  to authenticated
  using (private.has_permission('ORDERS_VIEW'));

create policy "Staff can insert payment transactions"
  on public.payment_transactions for insert
  to authenticated
  with check (private.has_permission('ORDERS_UPDATE'));

-- Shipping rates: customer reads own, staff reads all
create policy "Users can read own shipping rates"
  on public.shipping_rates for select
  to authenticated
  using (
    order_id is not null
    and exists (
      select 1 from public.orders o
      where o.id = shipping_rates.order_id
        and o.user_id = auth.uid()
    )
  );

create policy "Staff can read all shipping rates"
  on public.shipping_rates for select
  to authenticated
  using (private.has_permission('ORDERS_VIEW'));

create policy "Staff can insert shipping rates"
  on public.shipping_rates for insert
  to authenticated
  with check (private.has_permission('ORDERS_UPDATE'));

-- Shipments: customer reads own (read-only), staff reads all
create policy "Users can read own shipments"
  on public.shipments for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = shipments.order_id
        and o.user_id = auth.uid()
    )
  );

create policy "Staff can read all shipments"
  on public.shipments for select
  to authenticated
  using (private.has_permission('ORDERS_VIEW'));

create policy "Staff can update shipments"
  on public.shipments for update
  to authenticated
  using (private.has_permission('ORDERS_UPDATE'))
  with check (private.has_permission('ORDERS_UPDATE'));

create policy "Staff can insert shipments"
  on public.shipments for insert
  to authenticated
  with check (private.has_permission('ORDERS_UPDATE'));

-- Shipment events: customer reads own, staff reads all
create policy "Users can read own shipment events"
  on public.shipment_events for select
  to authenticated
  using (
    exists (
      select 1 from public.shipments s
      where s.id = shipment_id
        and exists (
          select 1 from public.orders o
          where o.id = s.order_id
            and o.user_id = auth.uid()
        )
    )
  );

create policy "Staff can read all shipment events"
  on public.shipment_events for select
  to authenticated
  using (private.has_permission('ORDERS_VIEW'));

create policy "Staff can insert shipment events"
  on public.shipment_events for insert
  to authenticated
  with check (private.has_permission('ORDERS_UPDATE'));

-- Coupon redemptions: customer reads own, staff reads all
create policy "Users can read own coupon redemptions"
  on public.coupon_redemptions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Staff can read all coupon redemptions"
  on public.coupon_redemptions for select
  to authenticated
  using (private.has_permission('ORDERS_VIEW'));

create policy "Staff can insert coupon redemptions"
  on public.coupon_redemptions for insert
  to authenticated
  with check (private.has_permission('ORDERS_UPDATE'));

-- ============================================================================
-- RLS POLICIES: AUDIT LOGS (staff only)
-- ============================================================================

create policy "Staff can read audit logs"
  on public.audit_logs for select
  to authenticated
  using (private.is_staff());

create policy "Staff can insert audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (private.is_staff());

-- No update or delete policies on audit_logs (immutable)

-- ============================================================================
-- SEED DATA: ROLES
-- ============================================================================

insert into public.roles (name, description) values
  ('super_admin', 'Full system access'),
  ('admin', 'Staff user controlled by granular permissions'),
  ('customer', 'Customer who can browse, purchase, and manage their account');

-- ============================================================================
-- SEED DATA: PERMISSIONS
-- ============================================================================

insert into public.permissions (code, description) values
  ('PRODUCTS_VIEW', 'View products'),
  ('PRODUCTS_CREATE', 'Create products'),
  ('PRODUCTS_UPDATE', 'Update products'),
  ('PRODUCTS_DELETE', 'Delete products'),
  ('ORDERS_VIEW', 'View orders'),
  ('ORDERS_UPDATE', 'Update orders'),
  ('ORDERS_CANCEL', 'Cancel orders'),
  ('ORDERS_REFUND', 'Refund orders'),
  ('CUSTOMERS_VIEW', 'View customers'),
  ('INVENTORY_VIEW', 'View inventory'),
  ('INVENTORY_UPDATE', 'Update inventory'),
  ('CONTENT_VIEW', 'View content'),
  ('CONTENT_CREATE', 'Create content'),
  ('CONTENT_UPDATE', 'Update content'),
  ('CONTENT_DELETE', 'Delete content'),
  ('MEDIA_VIEW', 'View media'),
  ('MEDIA_UPLOAD', 'Upload media'),
  ('MEDIA_DELETE', 'Delete media'),
  ('ANALYTICS_VIEW', 'View analytics'),
  ('USERS_VIEW', 'View users'),
  ('USERS_MANAGE', 'Manage users'),
  ('SETTINGS_VIEW', 'View settings'),
  ('SETTINGS_MANAGE', 'Manage settings');

-- ============================================================================
-- SEED DATA: ROLE PERMISSIONS
-- ============================================================================

-- SUPER_ADMIN: all permissions
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'super_admin';

-- ADMIN: all except USERS_MANAGE and SETTINGS_MANAGE
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
  and p.code not in ('USERS_MANAGE', 'SETTINGS_MANAGE');

-- CUSTOMER: no administrative permissions (no role_permissions rows)

-- ============================================================================
-- STORAGE BUCKETS (via Supabase Storage API)
-- ============================================================================
-- Storage buckets must be created via the Supabase dashboard or Storage API.
-- The following buckets should be created:
--   - products (public read, staff write)
--   - blog (public read, staff write)
--   - pages (public read, staff write)
--   - banners (public read, staff write)
--   - avatars (user own write, public read)
--
-- Storage policies (applied separately via Supabase Storage):
--   products:   anon select, authenticated insert (with MEDIA_UPLOAD check via RLS)
--   blog:       anon select, authenticated insert (with CONTENT_CREATE check)
--   pages:      anon select, authenticated insert (with CONTENT_CREATE check)
--   banners:    anon select, authenticated insert (with CONTENT_CREATE check)
--   avatars:    anon select, user can only write to their own path

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================