-- Rescue 8 Philippines — Seed Data
-- Run this after the initial migration to add basic content.
-- This file does NOT contain fake business data (no products, no orders).
-- It only seeds structural data that the application needs to function.

-- Site settings
insert into public.site_settings (key, value, description, is_public) values
  ('site_name', '{"value": "Rescue 8 Philippines"}'::jsonb, 'Site name', true),
  ('site_tagline', '{"value": "Premium products and solutions for every Filipino"}'::jsonb, 'Site tagline', true),
  ('contact_email', '{"value": "support@rescue8ph.com"}'::jsonb, 'Contact email', true),
  ('contact_phone', '{"value": ""}'::jsonb, 'Contact phone', true),
  ('social_facebook', '{"value": ""}'::jsonb, 'Facebook URL', true),
  ('social_instagram', '{"value": ""}'::jsonb, 'Instagram URL', true),
  ('currency', '{"value": "PHP"}'::jsonb, 'Default currency', true),
  ('free_shipping_threshold', '{"value": 0}'::jsonb, 'Free shipping threshold', true)
on conflict (key) do nothing;

-- Basic navigation
insert into public.navigation_items (label, href, sort_order, is_enabled) values
  ('Home', '/', 0, true),
  ('Products', '/products', 1, true),
  ('About', '/about', 2, true),
  ('Services', '/services', 3, true),
  ('Blog', '/blog', 4, true),
  ('FAQ', '/faq', 5, true),
  ('Contact', '/contact', 6, true)
on conflict do nothing;

-- Homepage CMS page
insert into public.pages (title, slug, status, published_at) values
  ('Home', 'home', 'PUBLISHED', now())
on conflict (slug) do nothing;