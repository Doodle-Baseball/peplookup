-- Lets an already-open /suppliers tab pick up a drag-and-drop reorder from
-- /admin/vendors live, instead of only on its next visit or once the
-- 5-minute cache expires.
--
-- The site subscribes to Postgres changes on `suppliers` with the publishable
-- (anon) key, which only works once the table is added to Supabase's default
-- realtime publication. Run this once in the Supabase SQL editor. Safe to
-- re-run: adding a table that's already in the publication is a Postgres
-- error, so this checks first.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'suppliers'
  ) then
    alter publication supabase_realtime add table public.suppliers;
  end if;
end $$;
