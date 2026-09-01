# CHANGELOG

## 2026-08-27 (Phase 15 — Deployment Prep)

### Added

- `.github/workflows/supabase-migrate.yml`: Auto-applies pending migrations on push to main
  - Triggers only when `supabase/migrations/**` changes
  - Runs `supabase db push` after linking to project via secrets
  - Required repo secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`
  - Can also be manually triggered via `workflow_dispatch`

### Reconciled

- Fast-forwarded main to `feat/wishlist-and-storage-buckets` (HEAD `5c5c750`)
- Closed 5 stale PRs (#2-#6) from 2026-08-24; their feature branches preserved locally + on remote
- Local main in sync with origin/main at commit `0ba9075`

### Verified

- `npm run lint` — exit 0, no errors
- `npm run build` — exit 0, full route table printed

### Status

- All phases 0-14 code complete on local + remote main
- 12 pending Supabase migrations not yet applied to any production DB
- Vercel project not yet created
- Production Supabase project not yet provisioned

## 2026-08-24 (Phase 12-14)

### Added — ANALYTICS-001 (Phase 12: Analytics & Audit)

- Admin analytics dashboard with real metrics:
  - Total revenue from paid/fulfilled orders
  - Gross order value (all orders)
  - 7-day rolling revenue
  - KPI grid: revenue, customers, products, low stock
  - Order status breakdown with colored badges
  - Top products by revenue (from order_items)
  - Recent orders table (latest 10)
- Enhanced audit logs page:
  - Filter by action and resource_type (URL params)
  - Expandable old_values/new_values diff viewer
  - Action label mapping (CREATE, UPDATE, DELETE, etc.)
  - Count display and empty state
- Audit logging utility (lib/audit/index.ts):
  - logAudit() function for server actions
  - AuditAction constants
  - Auto-resolves user_id from Supabase session
  - Wired into products + orders server actions
  - Fail-safe: never breaks the main operation
- formatCurrency utility added to lib/format.ts

### Added — SEO-001 (Phase 13: Performance / SEO / Accessibility)

- Dynamic sitemap (src/app/sitemap.ts): products, blog posts, services + static pages
- robots.ts: disallow admin/account/checkout/cart/api, sitemap reference
- JSON-LD Organization schema on homepage (with address + Facebook sameAs)
- JSON-LD Product + Breadcrumb + Organization schemas on product detail page
- JSON-LD Article (BlogPosting) schema on blog post detail page
- generateMetadata on product detail and blog detail pages
- Enhanced metadata with canonical URLs on FAQ, Blog, Products listing
- Enhanced metadata on Privacy and Terms pages
- Organization schema updated: logo.svg, Facebook sameAs, postal address
- Image optimization: AVIF/WebP formats, Supabase remote patterns in next.config.ts

### Added — HARDENING-001 (Phase 14: Production Hardening)

- Security headers in next.config.ts:
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy (camera, microphone, geolocation disabled)
  - Strict-Transport-Security with preload
  - X-DNS-Prefetch-Control: on
- Global error boundary (src/app/error.tsx) with retry + home navigation
- Environment variable validation (lib/env.ts)
- Health check endpoint (/api/health) with env validation
- poweredByHeader disabled, compression enabled

## 2026-08-24 (Earlier)

### Added — AUTH-001

- Auth server actions: signUp, signIn, signOut, requestPasswordReset, updatePassword, updateProfile
- Auth pages: login, register, forgot-password, reset-password, callback handler
- Auth layout: centered card-based design
- Protected account pages: dashboard, profile editor, orders list, order detail
- Admin dashboard page with role-based section visibility
- Header component: auth-aware navigation (login/signup or account/admin/signout)
- Footer component: site footer with navigation links
- SignOutButton: client component for logout via server action
- ButtonLink component: Link wrapper with button styling (Base UI compatible)
- Middleware: session refresh, route protection (/account, /admin), auth redirect
- Supabase database connection established (ap-northeast-2 pooler)
- Seed data applied: 8 site settings, 7 navigation items, 1 homepage CMS page

### Added — Previous

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