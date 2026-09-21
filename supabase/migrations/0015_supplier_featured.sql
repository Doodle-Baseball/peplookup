-- Marks a vendor as a Special/Featured supplier, toggled from /admin/vendors.
-- Featured vendors are pinned to the top of the public /suppliers directory,
-- ahead of the usual reviews/coupon ranking.
--
-- Run this in the Supabase SQL editor.

alter table public.suppliers add column if not exists is_featured boolean not null default false;

create index if not exists suppliers_is_featured_idx on public.suppliers (is_featured) where is_featured;
