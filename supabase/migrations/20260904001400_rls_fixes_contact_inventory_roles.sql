-- Fix: Create contact_inquiries table + fix swapped inventory policies + role_permissions RLS

-- 1. contact_inquiries table (was missing entirely)
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'NEW',
  created_at timestamptz not null default now()
);
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact inquiry"
  ON public.contact_inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can read contact inquiries"
  ON public.contact_inquiries FOR SELECT
  TO authenticated USING (private.is_staff());

-- 2. Fix swapped inventory policies
DROP POLICY IF EXISTS "Staff can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Staff can insert inventory" ON public.inventory;
CREATE POLICY "Staff can insert inventory"
  ON public.inventory FOR INSERT
  TO authenticated WITH CHECK (private.has_permission('INVENTORY_UPDATE'));
CREATE POLICY "Staff can update inventory"
  ON public.inventory FOR UPDATE
  TO authenticated USING (private.has_permission('INVENTORY_UPDATE'))
  WITH CHECK (private.has_permission('INVENTORY_UPDATE'));

-- 3. role_permissions INSERT/DELETE/UPDATE for super_admin
CREATE POLICY "Super admin can insert role permissions"
  ON public.role_permissions FOR INSERT
  TO authenticated WITH CHECK (private.is_super_admin());
CREATE POLICY "Super admin can delete role permissions"
  ON public.role_permissions FOR DELETE
  TO authenticated USING (private.is_super_admin());
CREATE POLICY "Super admin can update role permissions"
  ON public.role_permissions FOR UPDATE
  TO authenticated USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());