import 'server-only';
import { connect } from 'node:net';

const IANA_WHOIS = 'whois.iana.org';
const LOOKUP_TIMEOUT_MS = 5000;

/** Raw WHOIS query over TCP port 43. Resolves to the response text, or null on any failure. */
function queryWhois(server: string, query: string): Promise<string | null> {
  return new Promise((resolve) => {
    const socket = connect({ host: server, port: 43 });
    let data = '';
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(null);
    }, LOOKUP_TIMEOUT_MS);

    socket.on('connect', () => socket.write(`${query}\r\n`));
    socket.on('data', (chunk) => {
      data += chunk.toString('utf8');
    });
    socket.on('end', () => {
      clearTimeout(timer);
      resolve(data || null);
    });
    socket.on('error', () => {
      clearTimeout(timer);
      resolve(null);
    });
  });
}

function extractReferralServer(ianaResponse: string): string | null {
  const match = /^whois:\s*(\S+)/im.exec(ianaResponse);
  return match?.[1] ?? null;
}

/** Most registries use one of these labels for the creation-date field. */
const CREATION_DATE_PATTERNS = [
  /Creation Date:\s*(.+)/i,
  /Registered on:\s*(.+)/i,
  /Registered:\s*(.+)/i,
  /Domain Registration Date:\s*(.+)/i,
  /created:\s*(.+)/i,
];

function extractCreationDate(whoisResponse: string): string | null {
  for (const pattern of CREATION_DATE_PATTERNS) {
    const match = pattern.exec(whoisResponse);
    const value = match?.[1];
    if (!value) continue;
    const parsed = new Date(value.trim());
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return null;
}

/**
 * Best-effort domain registration date via a raw WHOIS query, following the
 * IANA referral to the domain's actual registry. Returns null on any
 * failure, timeout, unreachable server, or an unparseable response, so
 * callers must never treat this as guaranteed data. Covers the common gTLD
 * registries well; many ccTLDs use non-standard formats or block port 43.
 */
export async function lookupDomainRegisteredAt(homepageUrl: string): Promise<string | null> {
  let hostname: string;
  try {
    hostname = new URL(homepageUrl).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }

  const ianaResponse = await queryWhois(IANA_WHOIS, hostname);
  if (!ianaResponse) return null;

  const registryServer = extractReferralServer(ianaResponse);
  if (!registryServer) return extractCreationDate(ianaResponse);

  const registryResponse = await queryWhois(registryServer, hostname);
  if (!registryResponse) return null;

  return extractCreationDate(registryResponse);
}
