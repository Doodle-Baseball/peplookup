-- Supplier listing without Whop: the applicant pays by Bitcoin or PayPal,
-- uploads a screenshot of the payment, and the admin verifies the payment and
-- approves or rejects the listing in /admin/vendor-listing.
--
-- Run this once in the Supabase SQL editor. It is safe to re-run.
--
-- Lifecycle of a new request: PENDING_REVIEW (submitted with a screenshot)
-- -> payment_verified_at set by the admin -> APPROVED or REJECTED.
-- PENDING_PAYMENT and PAID stay valid for requests made through Whop before.
-- Approving never publishes a supplier; that stays a separate, manual step.

alter table public.vendor_listing_requests
  add column if not exists affiliate_signup_url text check (affiliate_signup_url ~* '^https?://'),
  add column if not exists coa_page_url text check (coa_page_url ~* '^https?://'),
  add column if not exists payment_method text check (payment_method in ('btc', 'paypal')),
  -- Object path inside the private vendor-payment-screenshots bucket.
  add column if not exists payment_screenshot_path text,
  add column if not exists payment_verified_at timestamptz,
  add column if not exists reviewed_at timestamptz;

alter table public.vendor_listing_requests drop constraint if exists vendor_listing_requests_status_check;
alter table public.vendor_listing_requests
  add constraint vendor_listing_requests_status_check
  check (status in ('PENDING_PAYMENT', 'PAID', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'));

-- Private bucket: screenshots show payment details, so they are only ever read
-- by the server (service key) and shown to the admin through short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vendor-payment-screenshots', 'vendor-payment-screenshots', false, 4194304, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
