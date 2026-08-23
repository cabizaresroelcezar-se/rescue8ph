# CHANGELOG

## 2026-08-24

### Added

- Rescue 8 Philippines project definition
- Technology architecture (Next.js 16, Supabase, TypeScript, Tailwind v4, shadcn/ui)
- Supabase architecture (PostgreSQL, Auth, Storage, RLS)
- Role model (super_admin, admin, customer)
- Permission model (23 granular permissions)
- CMS architecture (pages, sections, blog, FAQs, testimonials, services)
- Commerce architecture (products, inventory, orders, payments, shipping)
- Payment provider abstraction (PaymentProvider interface)
- Shipping provider abstraction (ShippingProvider interface)
- Persistent AI project memory model (/ai directory)
- Next.js 16 project initialized with TypeScript strict mode
- Tailwind CSS v4 configured with Rescue 8 brand design tokens
- shadcn/ui configured (button, card, input, label, badge, avatar, separator, sheet, dropdown-menu, dialog)
- Supabase client utilities (client, server, admin, middleware)
- Zod validation schemas (product, address, checkout, coupon, order, page, blog post)
- Domain types (all database entities as TypeScript interfaces)
- SEO utilities (metadata, organization, product, breadcrumb, article schemas)
- Auth helpers (getCurrentUser, getCurrentProfile, hasPermission, hasRole, requireAuth, requireAdmin)
- Payment and shipping provider type abstractions
- Complete initial Supabase migration (DB-001):
  - 13 PostgreSQL enums
  - 35 database tables
  - All constraints (check, unique, foreign keys)
  - All indexes
  - Updated_at trigger function
  - Auth user signup trigger (auto-create profile)
  - Order number generation function
  - Security helper functions (private schema: has_role, has_permission, is_super_admin, is_staff, is_owner)
  - RLS enabled on all tables
  - RLS policies: public read, customer own-records, staff permission-driven, audit logs
  - Seed data: roles, permissions, role_permissions
  - Seed data: site settings, navigation, homepage CMS page
- Environment variable documentation (.env.example)
- Project structure (app/, components/, features/, lib/, types/, tests/)

### Decisions

- Next.js 16 selected as frontend framework
- Supabase selected as backend platform (PostgreSQL, Auth, Storage, Edge Functions)
- PostgreSQL selected as database with RLS for authorization
- Payment provider abstraction selected (Xendit, PayMongo, Manual/COD)
- Shipping provider abstraction selected (Manual, Lalamove, J&T, LBC)
- Structured CMS sections selected over a complex page builder
- TypeScript strict mode mandatory
- Server-first rendering as default strategy
- Vercel selected for hosting with GitHub CI/CD
- Tailwind v4 CSS-based configuration (no tailwind.config.ts)
- shadcn/ui "base-nova" style with neutral base color
- RLS policies use SECURITY DEFINER functions in private schema
- Order number format: R8-YYYYMMDD-NNNNNN (database sequence)
- Historical snapshots for order items and order addresses

### Verified

- Lint passes (0 errors, 0 warnings)
- TypeScript type checking passes (0 errors)
- Production build succeeds (Next.js 16.3.2)