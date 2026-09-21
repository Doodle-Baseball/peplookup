-- Adds the fields the expanded "Add vendor" admin form needs. Run this once
-- in the Supabase SQL editor, same as 0001_suppliers.sql.

alter table public.suppliers
  add column if not exists access_type text
    check (access_type in ('ruo', 'legit_script', 'telehealth')),
  add column if not exists supply_countries text[] not null default '{}',
  add column if not exists coa_verification_level text
    check (coa_verification_level in ('none', 'product_level', 'batch_level')),
  add column if not exists coa_lab_name text,
  add column if not exists domain_registered_at timestamptz;
