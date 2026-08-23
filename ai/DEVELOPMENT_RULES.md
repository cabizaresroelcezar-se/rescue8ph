# Rescue 8 Philippines — Development Rules

## 1. TypeScript

- TypeScript strict mode is mandatory.
- No `any` types without explicit justification.
- Use proper type definitions for all domain entities.
- Share types between client and server where appropriate.

## 2. Security Requirements

- Never expose secrets to the client (service role key, payment secrets, shipping secrets, tokens).
- Never trust frontend authorization — always verify server-side.
- Never trust frontend pricing — always recalculate server-side.
- Never trust frontend inventory — always verify stock server-side.
- Never trust frontend payment status — always verify with provider.
- Never trust frontend shipping values — always calculate server-side.
- Never trust client-side roles — use database-enforced RLS.
- Use RLS on every application table.
- Use server-side validation (Zod) for all inputs.
- Audit privileged actions.
- Never log passwords, tokens, API keys, or payment secrets.

## 3. RLS (Row Level Security)

- RLS must be enabled on every exposed application table.
- Public read access only for explicitly public data (published products, pages, etc.).
- Customer access limited to their own records.
- Staff access is permission-driven.
- No anonymous INSERT/UPDATE/DELETE on business data.
- Security helper functions in `private` schema, not public.

## 4. RBAC (Role-Based Access Control)

- Three roles: super_admin, admin, customer.
- Admin permissions are granular (permission codes).
- Super admin has all permissions but is still auditable.
- Customers have no administrative permissions.
- Permission checks on frontend improve UX.
- Permission enforcement on server and database provides security.

## 5. Server Authorization

- All mutations go through server actions or API routes.
- Server checks user role and permissions before processing.
- Never expose service role key to client.
- Use Supabase client with anon key for client-side requests.
- Use service role key only in secure server contexts.

## 6. Validation

- Use Zod schemas for all input validation.
- Client validation improves UX (immediate feedback).
- Server validation provides security (source of truth).
- Shared schemas between client and server where possible.
- Required schemas: CreateProductSchema, UpdateProductSchema, CheckoutSchema, CustomerAddressSchema, CreateCouponSchema, UpdateOrderSchema, CreatePageSchema, CreateBlogPostSchema.

## 7. Provider Abstraction

- Payment providers behind `PaymentProvider` interface.
- Shipping providers behind `ShippingProvider` interface.
- Checkout depends on abstractions, not concrete providers.
- Do not invent external API capabilities.
- Only implement real provider integrations when credentials/API access are available.
- Handle provider failures gracefully (timeout, rate limits, network failure, outage).

## 8. Database Migrations

- Use Supabase migrations (timestamped SQL files).
- Never overwrite production data.
- Use `gen_random_uuid()` for UUIDs.
- Use `timestamptz` for all timestamps.
- Use foreign keys, constraints, and indexes.
- Use PostgreSQL enums for status fields.
- Preserve historical order data (snapshots in order_items, order_addresses).
- Inventory operations must be atomic.
- Use the `set_updated_at()` trigger for all mutable tables.

## 9. Testing

- Test authentication and authorization.
- Test RLS (customer isolation, staff permissions).
- Test product CRUD.
- Test inventory operations.
- Test cart and checkout.
- Test order creation.
- Test payment webhooks (including duplicates).
- Test refund operations.
- Test shipping failure handling.
- Test admin permissions.
- Prove customer A cannot access customer B's data.
- Prove customers cannot modify prices, orders, payments, or inventory.

## 10. Memory Update Requirements

- Update `/ai/PROJECT_CONTEXT.yaml` when architecture, roles, or business rules change.
- Update `/ai/ARCHITECTURE.md` when system architecture changes.
- Update `/ai/CURRENT_TASK.md` after completing each task.
- Update `/ai/CHANGELOG.md` after meaningful changes.
- Read all memory files at the start of every session.

## 11. Secret Handling

- Store secrets in environment variables (never in code).
- Use `.env.local` for development.
- Use Vercel environment variables for production.
- Never commit secrets to git.
- `.env*` files must be in `.gitignore`.
- Payment and shipping secrets are server-side only.

## 12. External API Assumptions

- Do not invent provider API behavior.
- Only implement when credentials and API docs are available.
- Use abstractions so providers can be swapped.
- Handle all failure modes (timeout, rate limit, network, outage, invalid response, duplicates).
- Use idempotency for money/order/shipment side effects.
- Use retries only when safe.

## 13. Performance Rules

- LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Prefer Server Components.
- Minimize client-side JavaScript.
- Use static rendering where possible.
- Optimize all important images (AVIF/WebP, responsive, lazy load).
- Use code splitting.
- CDN delivery via Vercel.
- Public pages must be fast on mobile networks.
- Do not make the entire site a client-side SPA.

## 14. Server/Client Component Rules

### Server Components (default)

- Marketing pages
- Product pages
- Product grids
- Blog
- CMS content
- Header
- Footer

### Client Components (only when interactivity requires it)

- Cart
- Interactive product gallery
- Search interactions
- Checkout form
- Admin editor
- Interactive dashboards

- Do not use `"use client"` without a technical reason.
- Keep business logic out of React components — use domain modules.

## 15. Code Quality

- Do not rewrite working code without justification.
- Do not create speculative features.
- Do not over-engineer the MVP.
- Prefer simple production-grade solutions.
- Separate domains clearly.
- Avoid duplicate business logic.
- Keep CMS content data-driven (not executable code).
- Document meaningful architectural changes.
- Preserve historical order data.