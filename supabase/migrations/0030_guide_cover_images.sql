-- Guide cover uploads and alt text, managed from /admin/guides.
--
-- Run this in the Supabase SQL editor, after 0012_guides.sql. Safe to re-run.

-- Alt text for the cover photo, rendered as the <img alt>. The admin requires
-- it whenever a cover image is set; null when the guide uses generated art.
alter table public.guides
  add column if not exists cover_image_alt text;

-- Uploaded covers. Public read so the stored URL works in an <img> and in
-- og:image. No insert/update/delete policy is granted on storage.objects for
-- this bucket: only the admin server action writes, with the secret key, which
-- bypasses RLS. The browser never uploads with the anon key.
--
-- Covers are converted to WebP on the server before upload, so WebP is the
-- only type this bucket accepts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guide-images', 'guide-images', true, 2097152, array['image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

notify pgrst, 'reload schema';
