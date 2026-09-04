import 'server-only';

/**
 * Signed, stateless admin session using Web Crypto so this also works from
 * edge middleware (no Node `crypto` module there). The cookie carries an
 * expiry and an HMAC over (email + expiry); nothing sensitive is stored in
 * the token itself.
 */

const COOKIE_NAME = 'peplookup_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error('ADMIN_SESSION_SECRET is not configured.');
  return value;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return toHex(signature);
}

/** Constant-time string comparison to avoid leaking length/prefix via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * The token deliberately carries only the expiry, not the email: there is a
 * single admin account, so identity does not need to round-trip through the
 * cookie. That also sidesteps using "." as a field delimiter while signing a
 * value (an email address) that legitimately contains dots — an earlier
 * version did `${email}.${expires}.${signature}` and split on ".", which
 * silently rejected every real session because "gmail.com" itself split into
 * two parts.
 */
export async function createAdminSessionToken(): Promise<string> {
  const expiresStr = String(Date.now() + SESSION_TTL_MS);
  const signature = await hmac(expiresStr);
  return `${expiresStr}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const separatorIndex = token.indexOf('.');
  if (separatorIndex === -1) return false;

  const expiresStr = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  const expected = await hmac(expiresStr);
  return timingSafeEqual(signature, expected);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  return (
    timingSafeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase()) &&
    timingSafeEqual(password, expectedPassword)
  );
}

export const ADMIN_SESSION_COOKIE = COOKIE_NAME;
