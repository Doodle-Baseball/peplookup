import 'server-only';
import { site } from '@/config/site';
import { VENDOR_LISTING_CONTACT, formatPlanPrice, vendorListingPlan } from '@/config/vendor-listing';
import type { VendorListingRequest } from '@/lib/vendor-listing/requests';

/**
 * Transactional email through Resend's HTTP API (no SDK, no new dependency).
 * Sending is best-effort by design: a failed email must never block a
 * payment from being recorded, so every function resolves to a boolean and
 * logs the reason instead of throwing.
 */

function adminRecipient(): string {
  return process.env.VENDOR_LISTING_NOTIFY_EMAIL ?? site.contactEmail;
}

async function send(message: { to: string; subject: string; html: string; replyTo?: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.VENDOR_LISTING_EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn(`[vendor-listing] Email not sent ("${message.subject}"): set RESEND_API_KEY and VENDOR_LISTING_EMAIL_FROM.`);
    return false;
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
    });
    if (!response.ok) {
      console.error(`[vendor-listing] Email "${message.subject}" rejected (${response.status}): ${await response.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[vendor-listing] Email "${message.subject}" failed:`, error);
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPercent(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(2)}%`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:8px 12px;color:#6b7280;font-size:13px;white-space:nowrap;border-bottom:1px solid #eee">${escapeHtml(label)}</td><td style="padding:8px 12px;font-size:14px;font-weight:600;border-bottom:1px solid #eee">${value}</td></tr>`;
}

function detailsTable(request: VendorListingRequest): string {
  const plan = vendorListingPlan(request.plan);
  const website = escapeHtml(request.websiteUrl);
  return `<table style="border-collapse:collapse;width:100%;border:1px solid #eee;border-radius:8px">
${row('Request ID', escapeHtml(request.requestId))}
${row('Plan', `${escapeHtml(plan.name)} (${formatPlanPrice(plan)}/${plan.interval === 'month' ? 'mo' : 'yr'})`)}
${row('Organisation', escapeHtml(request.organizationName))}
${row('Email', `<a href="mailto:${escapeHtml(request.email)}">${escapeHtml(request.email)}</a>`)}
${row('Contact number', request.contactNumber ? escapeHtml(request.contactNumber) : '—')}
${row('Website', `<a href="${website}">${website}</a>`)}
${row('Commission', formatPercent(request.commissionPercent))}
${row('Customer discount', formatPercent(request.customerDiscountPercent))}
${request.message ? row('Message', escapeHtml(request.message).replace(/\n/g, '<br>')) : ''}
${row('Payment', request.status === 'PAID' ? 'PAID' : 'Pending payment')}
</table>`;
}

function layout(heading: string, intro: string, body: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
<h1 style="font-size:20px;margin:0 0 8px">${escapeHtml(heading)}</h1>
<p style="font-size:14px;line-height:1.5;color:#374151;margin:0 0 16px">${intro}</p>
${body}
<p style="font-size:12px;color:#9ca3af;margin-top:24px">${escapeHtml(site.name)} · ${escapeHtml(site.domain)}</p>
</div>`;
}

/** Sent to the site owner the moment the form is submitted, before any payment. */
export function sendNewRequestEmail(request: VendorListingRequest): Promise<boolean> {
  return send({
    to: adminRecipient(),
    replyTo: request.email,
    subject: `New vendor listing request: ${request.organizationName} (${request.requestId})`,
    html: layout(
      'New vendor listing request',
      'Someone just submitted the vendor application form. They are being sent to checkout now; you will get a second email when payment is confirmed.',
      detailsTable(request),
    ),
  });
}

/** Sent to the site owner once Whop confirms the payment. */
export function sendPaymentConfirmedAdminEmail(request: VendorListingRequest): Promise<boolean> {
  return send({
    to: adminRecipient(),
    replyTo: request.email,
    subject: `Payment received: ${request.organizationName} (${request.requestId})`,
    html: layout(
      'Payment confirmed',
      'Whop confirmed this payment. The vendor is ready to be added to the site.',
      detailsTable(request),
    ),
  });
}

/** Sent to the applicant once Whop confirms the payment. */
export function sendPaymentConfirmedApplicantEmail(request: VendorListingRequest): Promise<boolean> {
  const contact = VENDOR_LISTING_CONTACT;
  return send({
    to: request.email,
    replyTo: contact.email,
    subject: `We received your vendor listing request (${request.requestId})`,
    html: layout(
      'Thank you, your payment was received',
      `Your request ID is <strong>${escapeHtml(request.requestId)}</strong>. ${escapeHtml(contact.name)} will contact you within ${contact.responseWindow} to set up your listing. Questions in the meantime? Write to <a href="mailto:${contact.email}">${contact.email}</a>.`,
      detailsTable(request),
    ),
  });
}
