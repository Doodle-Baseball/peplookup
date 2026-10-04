-- Paid "list your vendor" applications submitted from /vendor-listing and
-- managed in /admin/vendor-listing.
--
-- Run this once in the Supabase SQL editor. It is safe to re-run.
--
-- Lifecycle: the form creates a row as PENDING_PAYMENT, the visitor is sent to
-- the Whop plan's checkout page, and the Whop `payment.succeeded` webhook (or
-- the admin's "Verify with Whop" button) moves it to PAID, matching the
-- payment to the request by the buyer's email. Nothing here is ever seeded with sample rows.
--
-- Row-level security is enabled with no policies on purpose: only the server
-- (service key) reads or writes this table. It holds applicants' email
-- addresses and phone numbers, so it must never be readable with the
-- publishable key.

create table if not exists public.vendor_listing_requests (
  id uuid primary key default gen_random_uuid(),
  -- Public, human-quotable reference shown on the thanks page and in emails.
  request_id text not null unique check (request_id ~ '^VL-[A-Z0-9]{8}$'),
  plan text not null check (plan in ('basic', 'pro')),
  -- Integer cents, so the amount is never a float.
  amount_cents integer not null check (amount_cents > 0),
  organization_name text not null check (btrim(organization_name) <> ''),
  email text not null check (btrim(email) <> ''),
  contact_number text,
  website_url text not null check (website_url ~* '^https?://'),
  commission_percent numeric(5, 2) not null check (commission_percent >= 0 and commission_percent <= 100),
  customer_discount_percent numeric(5, 2) not null check (customer_discount_percent >= 0 and customer_discount_percent <= 100),
  status text not null default 'PENDING_PAYMENT' check (status in ('PENDING_PAYMENT', 'PAID')),
  whop_payment_id text,
  paid_at timestamptz,
  -- Set once the admin has opened the request; drives the "new" badge in the sidebar.
  seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vendor_listing_requests_created_idx
  on public.vendor_listing_requests (created_at desc);
create index if not exists vendor_listing_requests_unseen_idx
  on public.vendor_listing_requests (created_at desc) where seen_at is null;
-- Payments are matched to a request by the buyer's email, newest pending first.
create index if not exists vendor_listing_requests_email_idx
  on public.vendor_listing_requests (email, created_at desc);

alter table public.vendor_listing_requests enable row level security;
