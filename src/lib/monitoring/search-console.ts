import 'server-only';
import { createSign } from 'node:crypto';
import { z } from 'zod';
import type { DailySearchTotals } from '@/lib/monitoring/search-alerts';

/**
 * Google Search Console's Search Analytics API, read with a service account
 * (no SDK: the JWT is signed with Node's own crypto). Needs:
 *   GSC_CLIENT_EMAIL  the service account's email, added as a user on the
 *                     Search Console property
 *   GSC_PRIVATE_KEY   its private key (the "-----BEGIN PRIVATE KEY-----" block;
 *                     literal "\n" sequences are accepted)
 *   GSC_SITE_URL      the property, default "https://www.peplookup.com/"
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const DEFAULT_SITE_URL = 'https://www.peplookup.com/';

export class SearchConsoleNotConfiguredError extends Error {
  constructor() {
    super('Search Console is not configured: set GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY (see src/lib/monitoring/search-console.ts).');
  }
}

const tokenSchema = z.object({ access_token: z.string().min(1) });
const rowsSchema = z.object({
  rows: z
    .array(
      z.object({
        keys: z.array(z.string()).min(1),
        clicks: z.number(),
        impressions: z.number(),
        position: z.number(),
      }),
    )
    .optional(),
});

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function accessToken(): Promise<string> {
  const clientEmail = process.env.GSC_CLIENT_EMAIL;
  const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) throw new SearchConsoleNotConfiguredError();

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(JSON.stringify({ iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${base64url(signer.sign(privateKey))}`;

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Google token request failed (${response.status}): ${await response.text()}`);
  return tokenSchema.parse(await response.json()).access_token;
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Daily clicks, impressions and position for the last `days` days, oldest first. */
export async function fetchDailySearchTotals(days: number): Promise<DailySearchTotals[]> {
  const token = await accessToken();
  const siteUrl = process.env.GSC_SITE_URL ?? DEFAULT_SITE_URL;
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: isoDay(start), endDate: isoDay(end), dimensions: ['date'], rowLimit: days + 5 }),
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (!response.ok) throw new Error(`Search Console query failed (${response.status}): ${await response.text()}`);
  const { rows = [] } = rowsSchema.parse(await response.json());
  return rows
    .map((row) => ({ date: row.keys[0]!, clicks: row.clicks, impressions: row.impressions, position: row.position }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
