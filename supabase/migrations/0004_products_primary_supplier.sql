-- Links a compound to the vendor selected in the admin "Add compound" form
-- (Vendor dropdown). Nullable and unconstrained by a foreign key so picking
-- a vendor is never required and a later vendor delete can't be blocked by
-- this reference; the admin UI is the only place that enforces the value
-- came from an existing supplier.

alter table public.products
  add column if not exists primary_supplier_slug text;
