const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const csvPath = 'D:/Downloads/peplookup/peptide_vendor_directory - peptide_vendor_directory.csv';
const envPath = 'D:/Downloads/peplookup/peplookup-claude-new-session-y5xb4n/.env.local';

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

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitList(value) {
  return String(value || '')
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parsePercent(value) {
  const match = String(value || '').match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function homepageFromAffiliate(url) {
  try {
    const parsed = new URL(String(url || '').trim());
    return parsed.origin + '/';
  } catch {
    return String(url || '').trim() || null;
  }
}

function mapAccessType(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes('ruo')) return 'ruo';
  if (normalized.includes('legit')) return 'legit_script';
  if (normalized.includes('telehealth')) return 'telehealth';
  return null;
}

function getCell(row, indexMap, headerName) {
  const index = indexMap.get(normalizeHeader(headerName));
  if (index === undefined || index >= row.length) return '';
  return String(row[index] ?? '').trim();
}

(async () => {
  const rows = parseCsvText(fs.readFileSync(csvPath, 'utf8'));
  if (rows.length < 2) {
    throw new Error('CSV has no data rows');
  }

  const headers = rows[0];
  const indexMap = new Map(headers.map((header, index) => [normalizeHeader(header), index]));
  const records = [];

  for (const row of rows.slice(1)) {
    if (!row.some((cell) => String(cell).trim())) continue;

    const name = getCell(row, indexMap, 'Name');
    const affiliateUrl = getCell(row, indexMap, 'Affiliate Website Link');
    if (!name || !affiliateUrl) continue;

    const homepageUrl = homepageFromAffiliate(affiliateUrl);
    const description = getCell(row, indexMap, 'Description (100-150 chars)') || null;
    const country = getCell(row, indexMap, 'Supply countries') || null;
    const shippingSpeed = getCell(row, indexMap, 'Delivery Time') || null;
    const paymentMethods = splitList(getCell(row, indexMap, 'Payment Methods'));
    const couponCode = getCell(row, indexMap, 'Coupon Code') || null;
    const discountText = getCell(row, indexMap, 'Discount %');
    const couponPercentOff = parsePercent(discountText);
    const policyShippingUrl = getCell(row, indexMap, 'Shipping Policy URL') || null;
    const policyReturnsUrl = getCell(row, indexMap, 'Returns Policy URL') || null;
    const foundedYearText = getCell(row, indexMap, 'Established (Year)');
    const foundedYear = foundedYearText ? Number(foundedYearText) || null : null;
    const accessType = mapAccessType(getCell(row, indexMap, 'Access Type'));
    const supplyCountries = splitList(country || '');
    const coaLabName = getCell(row, indexMap, 'COA Lab / Provider') || null;
    const iconValue = getCell(row, indexMap, 'icon url');
    const logoUrl = iconValue && /\.(png|jpg|jpeg|svg|webp|gif|ico)(\?.*)?$/i.test(iconValue) && !/^icon url none$/i.test(iconValue)
      ? iconValue
      : null;

    let slug = slugify(name);
    let uniqueIndex = 2;
    while (true) {
      const { data } = await client.from('suppliers').select('slug').eq('slug', slug).maybeSingle();
      if (!data) break;
      slug = `${slugify(name)}-${uniqueIndex}`;
      uniqueIndex += 1;
    }

    const hostname = (() => {
      try {
        return new URL(homepageUrl).hostname;
      } catch {
        return '';
      }
    })();

    const record = {
      slug,
      name,
      homepage_url: homepageUrl,
      affiliate_url: affiliateUrl,
      description,
      country,
      logo_url: logoUrl,
      favicon_url: hostname ? `https://www.google.com/s2/favicons?sz=128&domain=${hostname}` : null,
      is_active: true,
      founded_year: foundedYear,
      access_type: accessType,
      supply_countries: supplyCountries,
      coa_lab_name: coaLabName,
      shipping_speed: shippingSpeed,
      payment_methods: paymentMethods,
      coupon_code: couponCode,
      coupon_percent_off: couponPercentOff,
      policy_shipping_url: policyShippingUrl,
      policy_returns_url: policyReturnsUrl,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    records.push(record);
  }

  const { error: deleteError } = await client.from('suppliers').delete().not('slug', 'is', null);
  if (deleteError) throw deleteError;

  const { error: insertError } = await client.from('suppliers').insert(records);
  if (insertError) throw insertError;

  console.log('Imported rows:', records.length);
  console.log('First row:', JSON.stringify(records[0], null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
