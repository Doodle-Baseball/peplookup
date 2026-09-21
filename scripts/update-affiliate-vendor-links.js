const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envPath = 'D:/Downloads/peplookup/peplookup-claude-new-session-y5xb4n/.env.local';
const csvPath = 'D:/Downloads/peplookup/peptide_vendor_directory - peptide_vendor_directory.csv';

const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
}

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function parseCsvText(csv) {
  const rows = [];
  let currentRow = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const ch = csv[i];
    if (ch === '"') {
      if (inQuotes && csv[i + 1] === '"') {
        currentValue += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      const isCrLf = ch === '\r' && csv[i + 1] === '\n';
      currentRow.push(currentValue);
      currentValue = '';
      if (currentRow.some((cell) => cell.trim() !== '')) rows.push(currentRow);
      currentRow = [];
      if (isCrLf) i += 1;
      continue;
    }

    currentValue += ch;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    if (currentRow.some((cell) => cell.trim() !== '')) rows.push(currentRow);
  }

  return rows;
}

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCell(row, indexMap, headerName) {
  const index = indexMap.get(normalizeHeader(headerName));
  if (index === undefined || index >= row.length) return '';
  return String(row[index] ?? '').trim();
}

function hostFromUrl(url) {
  try {
    const value = String(url || '').trim();
    if (!value) return '';
    const parsed = new URL(value);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function homepageKey(url) {
  try {
    const value = String(url || '').trim();
    if (!value) return '';
    const parsed = new URL(value);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return normalizeName(url);
  }
}

(async () => {
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCsvText(csvText);
  if (rows.length < 2) throw new Error('CSV has no vendor rows');

  const headers = rows[0];
  const indexMap = new Map(headers.map((header, index) => [normalizeHeader(header), index]));
  const linkLookup = new Map();

  for (const row of rows.slice(1)) {
    const name = getCell(row, indexMap, 'Name');
    const affiliateUrl = getCell(row, indexMap, 'Affiliate Website Link');
    if (!name || !affiliateUrl) continue;

    const nameKey = normalizeName(name);
    const homepageHost = hostFromUrl(getCell(row, indexMap, 'Website URL')) || hostFromUrl(getCell(row, indexMap, 'Homepage')) || '';

    if (nameKey) linkLookup.set(nameKey, affiliateUrl);
    if (homepageHost) linkLookup.set(homepageHost, affiliateUrl);
  }

  const { data: suppliers, error: readError } = await client
    .from('suppliers')
    .select('slug, name, homepage_url, affiliate_url');

  if (readError) throw readError;

  let updated = 0;
  for (const supplier of suppliers || []) {
    const nameKey = normalizeName(supplier.name);
    const homepageHost = homepageKey(supplier.homepage_url);
    const target = linkLookup.get(nameKey) || linkLookup.get(homepageHost) || linkLookup.get(homepageHost.replace('www.', ''));

    if (!target) continue;

    const { error: updateError } = await client
      .from('suppliers')
      .update({ affiliate_url: target, updated_at: new Date().toISOString() })
      .eq('slug', supplier.slug);

    if (!updateError) {
      updated += 1;
    } else {
      console.log('UPDATE_ERROR', supplier.name, updateError.message);
    }
  }

  console.log('updated_affiliate_links=', updated);
  console.log('sample=', JSON.stringify((suppliers || []).slice(0, 3), null, 2));
})();
