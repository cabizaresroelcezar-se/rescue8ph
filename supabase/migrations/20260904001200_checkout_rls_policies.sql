-- ============================================================================
-- Fix: Add INSERT RLS policies for checkout flow
-- ============================================================================
-- The original migration only had SELECT/UPDATE policies for orders, 
-- order_items, order_addresses, payments, and order_status_history.
-- Customers could not create orders because there were no INSERT policies.
-- This migration adds the missing INSERT policies so the checkout flow works.
-- ============================================================================

-- Orders: customers can insert their own orders
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order items: customers can insert items for their own orders
CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND o.user_id = auth.uid()
    )
  );

-- Order addresses: customers can insert addresses for their own orders
CREATE POLICY "Users can insert own order addresses"
  ON public.order_addresses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND o.user_id = auth.uid()
    )
  );

-- Payments: customers can insert payment records for their own orders
CREATE POLICY "Users can insert own payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
        AND o.user_id = auth.uid()
    )
  );

-- Order status history: customers can insert initial history for their own orders
CREATE POLICY "Users can insert own order history"
  ON public.order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND o.user_id = auth.uid()
    )
  );