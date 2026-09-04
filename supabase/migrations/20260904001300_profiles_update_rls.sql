-- Fix: Add UPDATE/ALL RLS policy for profiles table
-- The original migration only had SELECT and INSERT policies.
-- Avatar upload and profile edits need UPDATE permission.
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);