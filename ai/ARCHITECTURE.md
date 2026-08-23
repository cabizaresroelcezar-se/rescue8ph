# Rescue 8 Philippines — Architecture

## System Overview

Rescue 8 Philippines is a headless e-commerce, CMS, and marketing platform built on Next.js 16 with Supabase as the backend. The system serves Philippine customers with a modern, conversion-focused storefront, a full CMS for marketing content, and a comprehensive admin platform for staff.

```
                 RESCUE 8 PHILIPPINES
                          |
          +---------------+---------------+
          |                               |
      MARKETING                         SHOP
          |                               |
       Next.js                          Next.js
          |                               |
          +---------------+---------------+
                          |
                   DOMAIN / APP LAYER
                          |
          +---------------+---------------+
          |               |               |
       Supabase        Payments        Shipping
          |               |               |
      PostgreSQL        Xendit         Lalamove
      Auth              PayMongo       J&T
      Storage           Manual/COD      LBC
      RLS
```

## Frontend Architecture

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React
- **Rendering**: Server Components by default; Client Components only where interactivity requires it
- **Validation**: Zod schemas (shared client/server)

### Rendering Strategy

| Page Type | Strategy |
|-----------|----------|
| Public marketing | Static or ISR where possible |
| Product pages | Server-first with caching |
| Cart/Checkout | Dynamic (Client Components) |
| Admin | Dynamic (authenticated) |
| Blog | Static generation for published posts |

## Backend Architecture

- **Platform**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Database**: PostgreSQL with Row Level Security (RLS) on every table
- **Auth**: Supabase Auth (email/password, session management)
- **Storage**: Supabase Storage with separate bucket policies
- **Functions**: Supabase Edge Functions for webhooks and server-side operations

## Domain Boundaries

```
UI (React Components)
  ↓
Server/Application Layer (Server Actions / Route Handlers)
  ↓
Domain Logic (TypeScript modules)
  ↓
Database / External Provider (Supabase / Payment / Shipping)
```

### Domains

1. **auth** — Registration, login, logout, password reset, sessions
2. **authorization** — Roles, permissions, RLS, server-side auth checks
3. **users** — User management (admin)
4. **products** — Product CRUD, images, variants
5. **categories** — Category hierarchy
6. **inventory** — Stock levels, movements, reservations
7. **customers** — Customer profiles, addresses
8. **addresses** — Customer and order addresses
9. **cart** — Shopping cart for authenticated users
10. **checkout** — Order creation flow (transactional)
11. **orders** — Order management, status history
12. **payments** — Payment provider abstraction, webhooks
13. **shipping** — Shipping provider abstraction, rates, tracking
14. **cms** — Pages, page sections, site settings, navigation
15. **media** — Media library (Supabase Storage)
16. **blog** — Blog posts and categories
17. **analytics** — Platform analytics
18. **audit** — Audit logs for privileged actions

## Database Structure

### Core Tables

- **roles** — super_admin, admin, customer
- **permissions** — Granular permission codes
- **role_permissions** — Many-to-many role/permission mapping
- **profiles** — User profiles linked to auth.users

### Commerce Tables

- **products** — Product catalog with SEO fields
- **product_images** — Images with sort order and primary flag
- **product_variants** — Variant support (extensible)
- **categories** — Hierarchical categories
- **product_categories** — Many-to-many product/category
- **inventory** — Stock on hand and reserved
- **inventory_movements** — Audit trail for all inventory changes

### Order Tables

- **orders** — Order header with totals and status
- **order_items** — Historical product snapshot per line
- **order_addresses** — Historical delivery address snapshot
- **order_status_history** — Full status transition log

### Payment Tables

- **payments** — Payment records linked to orders
- **payment_transactions** — Webhook events and idempotency

### Shipping Tables

- **shipping_rates** — Quoted rates per order
- **shipments** — Shipment records with tracking
- **shipment_events** — Tracking event history

### Cart Tables

- **carts** — One per authenticated user
- **cart_items** — Cart line items

### CMS Tables

- **pages** — CMS pages with sections
- **page_sections** — JSON-configured content sections
- **blog_posts** — Blog content
- **blog_categories** — Blog categorization
- **faqs** — FAQ entries
- **testimonials** — Customer testimonials
- **services** — Service/solution offerings
- **media** — Media library metadata
- **site_settings** — Key-value site configuration
- **navigation_items** — Navigation menu structure

### Promotion Tables

- **coupons** — Discount codes
- **coupon_redemptions** — Usage tracking

### Security Tables

- **audit_logs** — Privileged action audit trail
- **customer_addresses** — Customer saved addresses

## Auth Architecture

1. Supabase Auth handles authentication (email/password)
2. On user signup, a trigger creates a profile record
3. New users get the `customer` role by default
4. Role assignments are stored in `profiles.role_id` (database-enforced)
5. Permissions are checked via `private.has_role()` and `private.has_permission()` functions
6. Frontend permission checks improve UX; server + RLS enforce security
7. User-editable metadata is NEVER used for authorization

## RLS Architecture

### Public Read Access

Anonymous and authenticated users can read:
- Products where `status = 'ACTIVE'`
- Categories where `status = 'PUBLISHED'`
- Pages where `status = 'PUBLISHED'`
- Blog posts where `status = 'PUBLISHED'`
- FAQs where `is_enabled = true`
- Testimonials where `is_enabled = true`
- Services where `status = 'PUBLISHED'`

### Customer Access

Customers can only access their own:
- Profile
- Addresses (CRUD)
- Cart and cart items
- Orders, order items, order addresses
- Payments, shipments, shipment events (read-only)
- Coupon redemptions (read-only)

Customers cannot modify:
- Order totals, payment status, shipping status
- Inventory, order history, audit logs

### Staff Access

Staff access is permission-driven via `private.has_permission()`:
- `PRODUCTS_UPDATE` → product modifications
- `ORDERS_UPDATE` → order status operations
- `ORDERS_REFUND` → refund operations
- `INVENTORY_UPDATE` → inventory modifications
- `CONTENT_UPDATE` → CMS updates
- `USERS_MANAGE` → user management
- `SETTINGS_MANAGE` → site settings changes

### Super Admin

Super Admin has all permissions. No untraceable master bypass — all operations are auditable.

## CMS Architecture

- Pages are composed of typed sections (hero, feature_grid, product_grid, etc.)
- Section content is stored as JSONB
- CMS content is data-driven, not executable code
- Navigation is database-managed
- Site settings are key-value with public/private distinction

## Commerce Architecture

### Checkout Flow

```
Cart → Customer Info → Address → Shipping Selection →
Shipping Cost → Payment Method → Review → Payment → Confirmation
```

### Order Number Generation

- Format: `R8-YYYYMMDD-NNNNNN`
- Server/database controlled (never client-provided)
- Sequence-based per-day

### Historical Snapshots

Order items snapshot product name, SKU, and unit price.
Order addresses snapshot the full delivery address.
This preserves order history even if products or addresses change.

## Inventory

- `quantity_on_hand` and `quantity_reserved` tracked per product
- All changes recorded in `inventory_movements`
- Operations must be atomic (prevent overselling)
- Movement types: PURCHASE, SALE, RESERVATION, RELEASE, RETURN, DAMAGE, ADJUSTMENT

## Payments

### Provider Abstraction

```typescript
interface PaymentProvider {
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(request: VerifyPaymentRequest): Promise<PaymentStatus>;
  refundPayment(request: RefundRequest): Promise<RefundResult>;
}
```

### Rules

- Payment status verified server-side (never trust browser redirect)
- Webhooks validated and idempotent
- Secrets remain server-side
- Providers: Xendit, PayMongo, Manual/COD

## Shipping

### Provider Abstraction

```typescript
interface ShippingProvider {
  getRates(request: ShippingRateRequest): Promise<ShippingRate[]>;
  createShipment(request: CreateShipmentRequest): Promise<Shipment>;
  cancelShipment(shipmentId: string): Promise<void>;
  getTracking(trackingNumber: string): Promise<TrackingInformation>;
}
```

### Rules

- Checkout does not depend on a single shipping provider
- Provider failures handled gracefully
- Secrets remain server-side
- Do not invent provider API behavior
- Providers: Manual (MVP), Lalamove, J&T, LBC

## Caching

- Static generation for marketing pages where possible
- ISR for product pages
- Server-side caching for CMS content
- CDN delivery via Vercel

## SEO

- Metadata API for all pages
- Open Graph tags
- Canonical URLs
- Dynamic sitemap
- robots.txt
- Product schema (JSON-LD)
- Organization schema
- Breadcrumb schema
- Article schema (blog)

## Performance

- LCP < 2.5s, INP < 200ms, CLS < 0.1
- Server Components by default
- Minimal client-side JavaScript
- Responsive images (AVIF/WebP)
- Lazy loading
- Code splitting

## Security

- RLS on every application table
- RBAC with database-enforced permissions
- Server-side authorization for all mutations
- Input validation (Zod) on client and server
- Secure authentication and session management
- Rate limiting
- Webhook signature verification
- CSP headers
- XSS protection
- Secret management (never expose to client)
- Audit logging for privileged actions

## Testing

- Unit tests for domain logic
- Integration tests for API routes
- End-to-end tests for critical flows
- Database/RLS tests for authorization

## Deployment

- Vercel for hosting
- GitHub for source control
- CI/CD via GitHub Actions
- Supabase for database, auth, storage
- Environment variables managed securely