-- Optional free-text message on a vendor listing application (the form's last,
-- optional field). Run once in the Supabase SQL editor; safe to re-run.
alter table public.vendor_listing_requests
  add column if not exists message text check (message is null or char_length(message) <= 1000);
