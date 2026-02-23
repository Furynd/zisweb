-- Migration: Add username and email columns to operators table
ALTER TABLE public.operators 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS email text UNIQUE,
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Add index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_operators_username ON public.operators(username);
CREATE INDEX IF NOT EXISTS idx_operators_email ON public.operators(email);
CREATE INDEX IF NOT EXISTS idx_operators_active ON public.operators(active);
