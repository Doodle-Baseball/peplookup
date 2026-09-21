-- Adds the "COA / Test Results" link field to the admin Add/Edit compound
-- form, an optional URL to a certificate of analysis or third-party lab
-- test for that specific compound.

alter table public.products
  add column if not exists coa_url text;
