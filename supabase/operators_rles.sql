-- Add `active` column to operators and enable RLS with policies
ALTER TABLE public.operators
  ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Enable Row Level Security on operators
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check if current user is superadmin
-- This avoids infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.operators
    WHERE id = auth.uid() AND role = 'superadmin'
  );
END;
$$;

-- Allow anyone to INSERT their own operator row with role 'operator' (active defaults true)
DROP POLICY IF EXISTS "Operators can insert self" ON public.operators;
CREATE POLICY "Operators can insert self" ON public.operators 
  FOR INSERT TO public WITH CHECK (
    id = (SELECT auth.uid())
    AND role = 'operator' 
  );


-- Allow superadmins to insert operator rows for other users
DROP POLICY IF EXISTS "Superadmin can insert operators" ON public.operators;
CREATE POLICY "Superadmin can insert operators" ON public.operators
  FOR INSERT TO public
  WITH CHECK (
    is_superadmin()
  );


-- Allow operators to SELECT their own row; allow superadmin to select all
DROP POLICY IF EXISTS "Operators can select" ON public.operators;
CREATE POLICY "Operators can select" ON public.operators
  FOR SELECT
  TO public
  USING (
    id = auth.uid()
    OR is_superadmin()
  );

-- Allow only superadmin to UPDATE operators (to manage active status)
DROP POLICY IF EXISTS "Operators can update" ON public.operators;
CREATE POLICY "Operators can update" ON public.operators
  FOR UPDATE
  TO public
  USING (
    is_superadmin()
  )
  WITH CHECK (
    is_superadmin()
  );

