# Rescue 8 Philippines

A Philippine e-commerce + CMS + admin back-office platform for emergency preparedness, first aid, and rescue equipment.

Built with **Next.js + React 19 + TypeScript** on the front end and **Supabase** (PostgreSQL + Auth + Storage + RLS) on the back end. The whole storefront and admin run on a single Next.js App Router code base, isolated into separate route groups so the customer-facing UI never leaks admin chrome into the React tree.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Route Map](#route-map)
- [Feature Inventory](#feature-inventory)
- [Server Actions Pattern](#server-actions-pattern)
- [RLS Pattern](#rls-pattern)
- [Role & Permission System](#role--permission-system)
- [Recent Commits](#recent-commits)
- [Dev Workflow](#dev-workflow)
- [Security](#security)
- [License](#license)

---

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Language**: TypeScript 5 (strict)
- **Styling**: Tailwind CSS v4, Lucide icons
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- **Validation**: Zod (server actions)
- **Rich text**: TipTap (StarterKit + Link + Image + Placeholder + CharacterCount)
- **Hosting**: Vercel-ready
- **Payments** (implemented): Manual / COD (in `src/lib/payments/`). Xendit + PayMongo adapters pending — providers can be plugged into the existing `PaymentProvider` interface without further code changes when credentials are available.
- **Shipping** (implemented): Manual (flat-rate placeholder in `src/lib/shipping/`). Lalamove / J&T / LBC adapters pending — same plug-in pattern as payments.

---

## Quick Start

```bash
# 1. Clone + install
git clone https://github.com/cabizaresroelcezar-se/rescue8ph.git
cd rescue8ph
npm install

# 2. Set up environment
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY + SUPABASE_SERVICE_ROLE_KEY

# 3. Apply all Supabase migrations (in order — see Database Setup below)
# Paste each migration file into Supabase SQL Editor > Run

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

`.env.example` lists every required variable. The minimum set for local dev:

| Variable | Required | Where it's used |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Browser + server (Supabase client) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Browser (anon auth) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes (admin actions) | Server only (privileged writes, audit logging) |
| `RESEND_API_KEY` | optional (future) | Transactional email |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URLs, OG tags |

**Never commit `.env.local` to git.** The service-role key bypasses RLS — keep it server-side only.

---

## Database Setup

Migrations live in `supabase/migrations/` and must be applied **in order**. Each filename is a timestamp:

```text
20260824000100_initial_rescue8_schema.sql     -- core tables, RLS, triggers
20260824000200_storage_buckets_and_wishlist.sql
20260825000100_seed_blog_posts.sql
20260825000200_pages_body.sql
20260825000300_cart_coupon.sql                -- run before using coupons
20260825000400_product_reviews.sql            -- run before product reviews
20260825000500_seed_products_and_categories.sql -- optional seed for fresh DB
20260825000600_recently_viewed.sql
20260825000700_review_helpful_votes.sql
20260825000800_add_pages_body_column.sql
20260825000900_order_notes.sql                -- order conversation thread
20260825001000_cms_enhancements.sql           -- TipTap content + revision history
20260825001100_wishlist_share_links.sql       -- public /wishlist/[token] sharing
```

For fresh DB setup, paste each file **top to bottom** into Supabase SQL Editor. All migrations are idempotent (`do $$ ... if not exists` guards on every CREATE).

For production, set up the Supabase CLI:

```bash
supabase link --project-ref <your-ref>
supabase db push
```

---

## Project Structure

```
src/
  app/
    (admin)/admin/        # Admin back-office (no storefront chrome)
    (storefront)/         # Customer-facing pages, isolated route group
      (marketing)/        # /, /about, /contact, /blog, /faq, /services, /privacy, /terms
      (shop)/             # /products, /products/[slug], /cart, /checkout
    account/              # Customer account dashboard (own layout)
    auth/                 # login, register, forgot/reset, callback
    api/                  # /api/health, /api/webhooks/payments (placeholder)
    layout.tsx            # root <html>/<body> shell only
  components/
    ui/                   # Primitives (Button, Input, Card, etc.)
    layout/               # Storefront shell (Header + Footer)
    marketing/            # Marketing components (ContactForm, etc.)
    shop/                 # Storefront: ProductCard, ReviewList, CartCouponInput, etc.
    admin/                # Admin: Sidebar, Topbar, ThemeToggle, ProductImageUploader, etc.
  features/               # Domain modules — server actions + types
    auth/                 # login, register, logout
    products/             # product + variant + image CRUD
    cart/                 # cart actions, coupon application
    orders/               # checkout, status transitions, shipment tracking
    coupons/              # customer + staff coupon actions
    reviews/              # product reviews + moderation
    review-votes/         # helpful-vote upsert
    recently-viewed/      # view tracking + retrieval
    order-notes/          # staff conversation thread
    pages/                # CMS page CRUD
    cms/                  # CMS enhancements (revisions, schedule, restore)
    blog/                 # blog post CRUD
    media/                # storage asset management
    settings/             # site_settings CRUD
    analytics/            # admin dashboard queries
  lib/
    supabase/             # server + browser Supabase clients
    auth/                 # requireUser, requireAdmin, requirePermission helpers
    audit/                # logAudit() writes to private.audit_log
    motion/               # FadeIn, Stagger, useDelayedRefresh
    format/               # formatDatePh(), currency
    seo/                  # createMetadata, JSON-LD schemas
    validation/           # Zod schemas
    payments/, shipping/  # provider abstraction (planned)

supabase/
  migrations/             # SQL DDL — see Database Setup above
  seed.sql                # Top-level seed (delegates to migrations)

ai/                       # Project memory (PROJECT_CONTEXT.yaml, CHANGELOG.md, etc.)
```

---

## Route Map

58 routes across 4 route groups + the public auth pages.

### Public Storefront (`src/app/(storefront)`)

| Route | Purpose |
|---|---|
| `/` | Marketing home (hero, features, CTA) |
| `/about`, `/services`, `/faq` | Marketing info pages (CMS pages rendered by slug) |
| `/contact` | Contact form |
| `/blog`, `/blog/[slug]` | Blog list + detail |
| `/privacy`, `/terms` | Legal |
| `/products` | Product catalog with filters + pagination |
| `/products/[slug]` | Product detail + reviews + related |
| `/cart` | Cart with coupon input |
| `/checkout`, `/checkout/success`, `/checkout/failed` | Checkout flow |

### Customer Account (`src/app/account`)

| Route | Purpose |
|---|---|
| `/account` | Dashboard (profile + recently viewed) |
| `/account/profile` | Edit profile |
| `/account/addresses` | Shipping address book |
| `/account/orders`, `/account/orders/[id]` | Order history + detail |
| `/account/wishlist` | Saved products |

### Auth (`src/app/auth`)

`/login`, `/register`, `/forgot-password`, `/reset-password`, `/callback`

### Admin Back-Office (`src/app/(admin)/admin`)

| Route | Purpose |
|---|---|
| `/admin` | Dashboard / landing |
| `/admin/products`, `/admin/products/[id]`, `/admin/products/new` | Product CRUD + category tagging |
| `/admin/inventory` | Variant / stock management |
| `/admin/media` | Storage asset library |
| `/admin/orders`, `/admin/orders/[id]` | Order list + detail (**with internal notes timeline**) |
| `/admin/customers` | Customer directory |
| `/admin/coupons`, `/admin/coupons/[id]`, `/admin/coupons/new` | Coupon CRUD |
| `/admin/reviews` | Moderation queue |
| `/admin/blog`, `/admin/blog/[id]`, `/admin/blog/new` | Blog post CRUD |
| `/admin/pages`, `/admin/pages/[id]`, `/admin/pages/new` | CMS pages (**TipTap rich text, autosave, revisions**) |
| `/admin/content` | Composable sections editor |
| `/admin/users`, `/admin/users/[id]`, `/admin/users/roles` | User management + roles matrix |
| `/admin/analytics` | Charts |
| `/admin/audit-logs` | Audit trail viewer |
| `/admin/settings` | Site config CRUD |

### API (`src/app/api`)

| Route | Purpose |
|---|---|
| `/api/health` | Liveness probe |
| `/api/webhooks/payments` | Payment-provider webhook receiver (placeholder for Xendit/PayMongo) |

---

## Feature Inventory

### Storefront
- **Marketing pages** — Home + about/services/faq/contact/privacy/terms, all CMS-backed
- **Product catalog** — Pagination (24/page), category filter, in-stock filter, on-sale filter, search by name/SKU, sort by name/price/created, active-filter chips
- **Product detail** — Image gallery, category chips (clickable → filtered list), star-rating summary, related products by category, customer reviews
- **Customer reviews** — Star rating (1–5), title + body, edit/delete own reviews, histogram, verified-purchase detection, helpful votes, staff moderation
- **Cart** — Add/update/remove lines, coupon input with live discount, free-shipping detection
- **Checkout** — Address collection, payment selection, order placement (provider-pluggable)
- **Wishlist** — Save products, view list (filtered by user_id)
- **Recently viewed** — Auto-tracked on product-page mount, shown on /account dashboard (max 20 per user)

### Account
- Profile editing, password change
- Order history + detail with status timeline
- Shipping address book (multi-address)
- Wishlist management
- Recently viewed products

### Admin Back-Office
- **Admin topbar** — Dark/light theme toggle (synced across navigation), user menu, store link
- **Sidebar nav** — Catalog / Sales / CMS / System groups, recent items shortcut
- **Product CRUD** — Variants, images, SEO, **multi-category tagging** with live picker
- **Inventory** — Variant-level stock tracking + low-stock alerts
- **Media library** — Storage bucketed uploads, alt-text editor, image picker
- **Orders** — Status transitions, payment + shipment tracking, line-item editing, **internal notes timeline** (per-order conversation thread with INTERNAL/CUSTOMER_VISIBLE flag, edit-own-within-5-min, delete-with-permission)
- **Customers** — Order history per customer, password reset, impersonate-as
- **Coupons** — Percentage/fixed/buy-x-get-y, date window, usage cap, max-discount, per-customer limits, active toggle
- **Reviews moderation** — Approve/Reject/Flag/Delete, stats by status
- **Blog** — Post CRUD with rich-text editor + publication scheduling
- **CMS pages** — **TipTap rich-text editor** (B/I/U, H2/H3, lists, links, images, code, undo), autosave (1.5s debounce), revision history with restore, schedule-publish (future-dated with SCHEDULED status), featured image, slug history → automatic 301 redirects, "Published by {user}" attribution
- **Composable content sections** — Hero / FAQ / CTA / Rich-text blocks per page
- **User management** — Roles matrix (admin, super_admin, customer), per-user permissions override, audit trail
- **Analytics** — AOV, conversion, top products, customer cohorts
- **Audit log** — Every privileged write logs actor + action + resource to `private.audit_log`
- **Site settings** — Key-value store with typed values (text, number, boolean, JSON, monospace)

### Cross-cutting
- **Login redirect** — Unauthenticated users hit `/auth/login?redirectTo=<path>`
- **Role guard** — Admin/customer routes short-circuit at the React layer (not just RLS) so 404s render fast
- **Dark/light theme** — CSS-class toggle with server-rendered initial state, persisted in localStorage
- **Audit logging** — Every server action that mutates data calls `logAudit()` with actor, action, resourceType, resourceId, oldValues, newValues
- **Ephemeral feedback** — `useDelayedRefresh()` keeps UI responsive across slow server actions

---

## Server Actions Pattern

Every mutation in this codebase goes through a `"use server"` action:

```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAudit, AuditAction } from "@/lib/audit";

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const title = formData.get("title") as string;
  const { data, error } = await supabase.from("products").insert({
    title,
    /* ... */
    created_by: user.id,
  }).select("id").single();

  if (error) throw new Error(error.message);

  await logAudit({
    action: AuditAction.CREATE,
    resourceType: "products",
    resourceId: data.id,
    newValues: { title },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${data.id}`);
}
```

Conventions:
- **`createClient`** — server-side Supabase client with cookie-bound auth
- **`revalidatePath`** — invalidate Next.js route caches for the pages that read the affected table
- **`logAudit`** — write to `private.audit_log` (failures are swallowed, not blocking)
- **Form redirect** — `redirect("/path")` after a successful write
- **Permission check** — many actions call `requirePermission("PRODUCT_CREATE")` first; `private.has_permission()` checks both role-granted and user-overridden perms

---

## RLS Pattern

Every table has RLS enabled. Standard policies:

| Operation | Rule |
|---|---|
| `SELECT` public | `status = 'PUBLISHED'` (and not soft-deleted) |
| `SELECT` staff | `private.is_staff()` → true for `admin` / `super_admin` |
| `SELECT` own | `user_id = auth.uid()` |
| `INSERT` | `author_id = auth.uid()` and `private.has_permission('<RESOURCE>_CREATE')` |
| `UPDATE` own | `user_id = auth.uid()` and the row isn't archive-flagged |
| `UPDATE` staff | `private.is_staff()` (bypass ownership) |
| `DELETE` | Soft-delete preferred (`is_archived` flag); hard delete only for staff with `DELETE` permission |

Example:

```sql
create policy "Customers can read their own orders"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or private.is_staff());
```

---

## Role & Permission System

- Roles: `super_admin`, `admin`, `customer`
- Each role has a default permission set in `private.role_permissions`
- A user can additionally be granted individual permissions in `private.user_permission_overrides`
- All permission checks go through `private.has_permission(text)` (returns bool) or `private.has_any_permission(text[])` (returns bool)
- `private.is_staff()` is a SQL helper that returns true for `admin` or `super_admin` (used by RLS policies; not a role name itself)
- The `/admin/users/roles` matrix UI shows the effective permission set per role

Standard permission keys (sample, plural form):

```
PRODUCTS_VIEW, PRODUCTS_CREATE, PRODUCTS_UPDATE, PRODUCTS_DELETE
ORDERS_VIEW, ORDERS_UPDATE, ORDERS_CANCEL, ORDERS_REFUND
COUPONS_VIEW, COUPONS_CREATE, COUPONS_UPDATE, COUPONS_DELETE
REVIEWS_MODERATE, REVIEWS_DELETE
PAGES_VIEW, PAGES_CREATE, PAGES_UPDATE, PAGES_DELETE, PAGES_PUBLISH
USERS_VIEW, USERS_MANAGE
SETTINGS_VIEW, SETTINGS_MANAGE
BLOG_CREATE, BLOG_UPDATE, BLOG_DELETE
```

---

## Recent Commits

Last synced to `main`: 0d1cc64 — see `git log --oneline -20` for the current tip.

A full vertical slice shipped to `main` via fast-forward from `feat/wishlist-and-storage-buckets` (originally PR #6):

```
5c5c750 feat(shop): search-term highlighting + product detail share bar
3610d68 feat(admin): dashboard widgets — low-stock alert, recent orders, revenue sparkline
5e7d91f feat(orders): printable receipts at /admin/orders/[id]/receipt + /account/orders/[id]/receipt
42ad2da fix(media): tiles not rendering on /admin/media after gallery refactor
8d0dd1c feat(admin): media library preview modal + inventory add form + compact login
55fe16f feat(audit): search, date range, actor lookup, JSON diff, pagination
d19f765 fix(db): drop now() from partial index predicate on wishlist_share_links
9d3554a feat(wishlist): share wishlist via public /wishlist/[token] URL
a893dfe docs: comprehensive README rewrite
cf6673a feat(products): multi-category tagging on products
0e8ce57 feat(cms): WordPress/Optimizely-grade CMS with rich-text editor
b5d3f42 fix(cms): add missing body column to pages table
88ad06d fix(layout): use next/script for theme detection to suppress React 19 warning
05a453a fix(admin): add auth + role guard to /admin/pages list and edit page
7cf9ece feat(reviews): wire helpful-vote button into product page
e76921e feat(shop): recently viewed products on /account dashboard
4016080 feat(shop): show star rating + review count on /products cards
ac48961 feat(admin): full CRUD for site_settings + add/delete
f0c6f12 chore: product/category seed migration + debug dump script
46845ff feat(reviews): end-to-end product reviews + ratings + moderation queue
01bde04 feat(shop): add in-stock + on-sale filters, pagination, active filter chips
2f146fe feat(admin): add dark/light mode toggle to admin topbar
cff30d4 refactor: split admin + storefront into separate route groups
```

---

## Dev Workflow

```bash
npm run dev          # http://localhost:3000 (background process — keep it running)
npm run lint         # ESLint (Next + TypeScript + Tailwind rules)
npm run build        # Next.js production build — all 58 routes
npm run start        # Run the production build (after `npm run build`)
```

**Rule of thumb for any code change**: end the turn with `npm run lint && npm run build` passing, plus a `curl` to confirm the affected route returns 200/307.

### Coding conventions

- **TypeScript strict** — no `any`, prefer `unknown` + narrowing
- **Server actions only** — no PUT/POST API routes unless a webhook truly needs one
- **`createClient` + cookie-bound auth** for every server-component data fetch
- **Idempotent SQL** — guard every CREATE with `do $$ ... if not exists` so migrations can re-run safely
- **Lint suppressions** — `// eslint-disable-next-line react-hooks/set-state-in-effect` is acceptable for legitimate prop-reset effects only
- **Commit scope** — `feat(scope): …`, `fix(scope): …`, `chore: …`, `refactor: …`, `style(scope): …`
- **Screenshots / HTTP responses** — required evidence at the bottom of every PR description

### Adding a new feature (typical sequence)

1. Write SQL migration in `supabase/migrations/<timestamp>_<feature>.sql` (idempotent)
2. Paste into Supabase SQL Editor > Run, verify `Success. No rows returned`
3. Write Zod validators if there's user input
4. Write server actions in `src/features/<feature>/actions.ts`
5. Write components in `src/components/<group>/`
6. Wire page under appropriate route group
7. Add to sidebar nav if admin surface
8. `npm run lint && npm run build` clean before commit + push

---

## Security

- **RLS** on every database table — no exceptions
- **RBAC** with granular per-resource permissions (`PRODUCT_CREATE`, `PAGE_PUBLISH`, etc.)
- **Server-side authorization** for every mutation — client-side guards alone are never trusted
- **Service-role key** is server-only; never exposed to the browser bundle
- **Audit logging** for every privileged action (`private.audit_log`)
- **CSRF** — Next.js server actions are CSRF-protected by default
- **Sanitization** — user-edited HTML (CMS content) is sanitized server-side before being stored; admin-only input, never rendered raw without sanitation

---

## License

MIT

---

## Maintainers

- **Repository**: [github.com/cabizaresroelcezar-se/rescue8ph](https://github.com/cabizaresroelcezar-se/rescue8ph)
For deeper architectural decisions, see `ai/ARCHITECTURE.md` and `ai/PROJECT_CONTEXT.yaml`.
