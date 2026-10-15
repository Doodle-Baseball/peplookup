-- Permanent redirects for the two supplier "-2" addresses that never got one.
--
-- Every other supplier that once lived at /suppliers/<slug>-2 already has its
-- row in seo_redirects. These two were missed, so their old URLs served the
-- "Supplier not found" page instead of moving on to the supplier, and Google
-- Search Console kept reporting /suppliers/prpeps-2 as a page excluded by
-- noindex. Middleware answers each with a 301 once this has run.
--
-- Run once in the Supabase SQL editor, after 0010. Re-running is safe.
-- To undo: delete from public.seo_redirects
--   where from_path in ('/suppliers/prpeps-2', '/suppliers/pure-amino-2');

insert into public.seo_redirects (from_path, to_path) values
  ('/suppliers/prpeps-2', '/suppliers/prpeps'),
  ('/suppliers/pure-amino-2', '/suppliers/pure-amino')
on conflict (from_path) do nothing;
