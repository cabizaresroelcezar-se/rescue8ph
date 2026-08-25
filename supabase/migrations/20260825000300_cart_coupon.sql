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