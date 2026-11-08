-- Mirrored product images.
--
-- Run this in the Supabase SQL editor. Safe to re-run.
--
-- Supplier image URLs break (hotlink blocking, moved shops, removed files), so each
-- offer's picture is copied to our own storage. `image_url` then holds OUR copy and
-- `image_source_url` keeps the supplier's original address it was copied from.
alter table public.offers
  add column if not exists image_source_url text;

-- Mirrored copies. Public read so the stored URL works in an <img>. No insert/update/
-- delete policy is granted on storage.objects for this bucket: only server code writes,
-- with the secret key, which bypasses RLS. The browser never uploads with the anon key.
--
-- Images are converted to WebP (max 800px wide) on the server before upload, so WebP is
-- the only type this bucket accepts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 1048576, array['image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

notify pgrst, 'reload schema';
