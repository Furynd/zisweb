-- Supabase schema for ZISWeb (v2)
-- Stores all transaction types in a single row, with multiple amount fields
-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Operators table
CREATE TABLE IF NOT EXISTS public.operators (
  id uuid PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('operator','superadmin')),
  created_at timestamptz DEFAULT now()
);
-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL,
  address text,
  kelurahan text,
  kecamatan text,
  kota text,
  phone text,
  zakat_fitrah_amount numeric DEFAULT 0,
  zakat_fitrah_rice numeric DEFAULT 0,
  zakat_maal_amount numeric DEFAULT 0,
  infaq_amount numeric DEFAULT 0,
  shodaqoh_amount numeric DEFAULT 0,
  fidyah_amount numeric DEFAULT 0,
  fidyah_rice numeric DEFAULT 0,
  wakaf_amount numeric DEFAULT 0,
  hibah_amount numeric DEFAULT 0,
  total_amount numeric GENERATED ALWAYS AS (
    COALESCE(zakat_fitrah_amount,0) + COALESCE(zakat_maal_amount,0) + COALESCE(infaq_amount,0) + COALESCE(shodaqoh_amount,0) + COALESCE(fidyah_amount,0) + COALESCE(wakaf_amount,0) + COALESCE(hibah_amount,0)
  ) STORED,
  total_rice numeric GENERATED ALWAYS AS (
    COALESCE(zakat_fitrah_rice,0) + COALESCE(fidyah_rice,0)
  ) STORED,
  payment_method text CHECK (payment_method IN ('rice','cash','transfer')),
  transfer_receipt text,
  operator_id uuid REFERENCES public.operators(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- DROP existing policies if they exist (safe recreate)
DROP POLICY IF EXISTS "Operators can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Only superadmin can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Operators can view transactions" ON public.transactions;

-- INSERT policy: allow operators and superadmins to insert, ensure operator_id matches auth.uid()
CREATE POLICY "Operators can insert transactions" ON public.transactions
  FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.operators o
      WHERE o.id = auth.uid()
        AND o.role IN ('operator', 'superadmin')
        AND o.active = true
    )
    AND operator_id = auth.uid()
  );

-- Policy: Only superadmin can update
CREATE POLICY "Only superadmin can update transactions" ON public.transactions
  FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.operators o
      WHERE o.id = auth.uid()
        AND o.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.operators o
      WHERE o.id = auth.uid()
        AND o.role = 'superadmin'
    )
  );

-- SELECT policy: Operators see their own, superadmin sees all
CREATE POLICY "Operators can view transactions" ON public.transactions
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.operators o
      WHERE o.id = auth.uid()
        AND (o.role = 'superadmin' OR operator_id = auth.uid())
    )
  );

-- DELETE policy: only superadmin can delete transactions
DROP POLICY IF EXISTS "Only superadmin can delete transactions" ON public.transactions;
CREATE POLICY "Only superadmin can delete transactions" ON public.transactions
  FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.operators o
      WHERE o.id = auth.uid()
        AND o.role = 'superadmin'
    )
  );

-- Public stats function (aggregated sums by type)
CREATE OR REPLACE FUNCTION public.get_transaction_stats()
RETURNS TABLE(
  zakat_fitrah numeric,
  zakat_fitrah_rice numeric,
  zakat_maal numeric,
  infaq numeric,
  shodaqoh numeric,
  fidyah numeric,
  fidyah_rice numeric,
  wakaf numeric,
  hibah numeric,
  total_amount numeric,
  total_rice numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);
  RETURN QUERY SELECT
    COALESCE(SUM(t.zakat_fitrah_amount),0),
    COALESCE(SUM(t.zakat_fitrah_rice),0),
    COALESCE(SUM(t.zakat_maal_amount),0),
    COALESCE(SUM(t.infaq_amount),0),
    COALESCE(SUM(t.shodaqoh_amount),0),
    COALESCE(SUM(t.fidyah_amount),0),
    COALESCE(SUM(t.fidyah_rice),0),
    COALESCE(SUM(t.wakaf_amount),0),
    COALESCE(SUM(t.hibah_amount),0),
    COALESCE(SUM(t.total_amount),0),
    COALESCE(SUM(t.total_rice),0)
  FROM public.transactions t;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_transaction_stats() TO public;
