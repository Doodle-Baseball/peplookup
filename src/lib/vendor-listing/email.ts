import 'server-only';
import { site } from '@/config/site';
import { PAYMENT_METHOD_LABEL, formatPlanPrice, vendorListingPlan } from '@/config/vendor-listing';
import type { VendorListingRequest } from '@/lib/vendor-listing/requests';

/**
 * Transactional email through Resend's HTTP API (no SDK, no new dependency).
 * Sending is best-effort by design: a failed email must never block an
 * application from being recorded, so every function resolves to a boolean
 * and logs the reason instead of throwing.
 */

function adminRecipient(): string {
  return process.env.VENDOR_LISTING_NOTIFY_EMAIL ?? site.contactEmail;
}

interface Attachment {
  filename: string;
  bytes: Uint8Array;
}

async function send(message: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: readonly Attachment[];
}): Promise<boolean> {
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
        ...(message.attachments?.length
          ? {
              attachments: message.attachments.map((attachment) => ({
                filename: attachment.filename,
                content: Buffer.from(attachment.bytes).toString('base64'),
              })),
            }
          : {}),
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

function link(url: string): string {
  const safe = escapeHtml(url);
  return `<a href="${safe}">${safe}</a>`;
}

function detailsTable(request: VendorListingRequest): string {
  const plan = vendorListingPlan(request.plan);
  return `<table style="border-collapse:collapse;width:100%;border:1px solid #eee;border-radius:8px">
${row('Request ID', escapeHtml(request.requestId))}
${row('Submitted', escapeHtml(new Date(request.createdAt).toUTCString()))}
${row('Plan', `${escapeHtml(plan.name)} (${formatPlanPrice(plan)}/${plan.interval === 'month' ? 'mo' : 'yr'})`)}
${row('Brand name', escapeHtml(request.organizationName))}
${row('Contact email', `<a href="mailto:${escapeHtml(request.email)}">${escapeHtml(request.email)}</a>`)}
${row('Contact number', request.contactNumber ? escapeHtml(request.contactNumber) : '—')}
${row('Website', link(request.websiteUrl))}
${row('Affiliate sign-up', request.affiliateSignupUrl ? link(request.affiliateSignupUrl) : '—')}
${row('COA page', request.coaPageUrl ? link(request.coaPageUrl) : '—')}
${row('Commission', formatPercent(request.commissionPercent))}
${row('Customer discount', formatPercent(request.customerDiscountPercent))}
${request.message ? row('Anything else', escapeHtml(request.message).replace(/\n/g, '<br>')) : ''}
${row('Payment method', request.paymentMethod ? escapeHtml(PAYMENT_METHOD_LABEL[request.paymentMethod]) : '—')}
${row('Payment', 'Screenshot attached, not verified yet')}
${row('Listing', 'Awaiting review')}
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

/**
 * Sent to the site owner (info@peplookup.com unless VENDOR_LISTING_NOTIFY_EMAIL
 * says otherwise) the moment an application is submitted, with the payment
 * screenshot attached. Nothing is published until the admin approves it.
 */
export function sendNewRequestEmail(request: VendorListingRequest, screenshot: Attachment): Promise<boolean> {
  return send({
    to: adminRecipient(),
    replyTo: request.email,
    subject: `New supplier listing request: ${request.organizationName} (${request.requestId})`,
    html: layout(
      'New supplier listing request',
      'A brand submitted the supplier listing form with a payment screenshot (attached). Verify the payment, then approve or reject the listing in /admin/vendor-listing.',
      detailsTable(request),
    ),
    attachments: [screenshot],
  });
}
