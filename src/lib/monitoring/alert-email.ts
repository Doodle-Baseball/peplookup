import 'server-only';
import { site } from '@/config/site';

/**
 * SEO and uptime alerts by email, through Resend's HTTP API, the same service
 * the vendor-listing emails use. Recipient: SEO_ALERT_EMAIL, else
 * VENDOR_LISTING_NOTIFY_EMAIL, else the site's contact address. Sender:
 * SEO_ALERT_EMAIL_FROM, else VENDOR_LISTING_EMAIL_FROM.
 */

export function alertRecipient(): string {
  return process.env.SEO_ALERT_EMAIL ?? process.env.VENDOR_LISTING_NOTIFY_EMAIL ?? site.contactEmail;
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Sends one alert. Throws when it can't, so a job that should have warned reports the failure instead of passing silently. */
export async function sendAlertEmail(message: { subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SEO_ALERT_EMAIL_FROM ?? process.env.VENDOR_LISTING_EMAIL_FROM;
  if (!apiKey || !from) throw new Error('Alert email not sent: set RESEND_API_KEY and SEO_ALERT_EMAIL_FROM (or VENDOR_LISTING_EMAIL_FROM).');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [alertRecipient()], subject: `[${site.name}] ${message.subject}`, html: message.html }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Alert email "${message.subject}" rejected (${response.status}): ${await response.text()}`);
}

/** A list as an HTML <ul>, every item escaped. */
export function htmlList(items: readonly string[]): string {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}
