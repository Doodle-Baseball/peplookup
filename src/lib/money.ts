/**
 * Money is stored and compared as integer cents. Floating point on prices
 * produces values like 12.340000000000001 and, worse, wrong "cheapest vendor"
 * results when two vendors tie at a rounded value but not at full precision.
 */

export type Cents = number & { readonly __brand: 'Cents' };

export function cents(value: number): Cents {
  if (!Number.isFinite(value)) throw new RangeError(`Not a finite amount: ${value}`);
  return Math.round(value) as Cents;
}

/**
 * Exact decimal -> cents. Deliberately avoids `value * 100`: 1.005 * 100 is
 * 100.49999999999999 in binary float and rounds DOWN to $1.00. Parsing the
 * digits directly keeps half-up rounding honest at the half-cent boundary.
 */
const DECIMAL = /^(-)?(\d*)(?:\.(\d*))?$/;

function decimalStringToCents(text: string): Cents {
  const match = DECIMAL.exec(text);
  if (!match) throw new RangeError(`Not a valid amount: ${text}`);

  const [, sign, whole = '', frac = ''] = match;
  // Rejects '', '.', '-' and anything else that stripped down to no digits.
  if (whole === '' && frac === '') throw new RangeError(`Not a valid amount: ${text}`);

  const pairedFrac = `${frac}00`.slice(0, 2);
  let total = (whole === '' ? 0n : BigInt(whole)) * 100n + BigInt(pairedFrac);

  const thirdDigit = frac[2];
  if (thirdDigit !== undefined && Number(thirdDigit) >= 5) total += 1n;

  const signed = sign === '-' ? -total : total;
  if (signed > BigInt(Number.MAX_SAFE_INTEGER) || signed < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new RangeError(`Amount out of safe range: ${text}`);
  }
  return Number(signed) as Cents;
}

/** Parse a decimal string or number of currency units ("$29.97") into cents. */
export function toCents(amount: string | number): Cents {
  if (typeof amount === 'number') {
    if (!Number.isFinite(amount)) throw new RangeError(`Not a finite amount: ${amount}`);
    // String(n) gives the shortest round-tripping decimal, so this reuses the
    // exact path above rather than multiplying. Exponent form needs expanding.
    const text = String(amount);
    return decimalStringToCents(
      text.includes('e') || text.includes('E') ? amount.toFixed(4) : text,
    );
  }
  return decimalStringToCents(amount.trim().replace(/[^0-9.-]/g, ''));
}

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

const CURRENCY_LOCALE: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
};

/** Render cents for display only. Never feed this back into comparisons. */
export function formatMoney(value: Cents, currency: Currency = 'USD'): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: 'currency',
    currency,
  }).format(value / 100);
}

/**
 * Price per mg needs more than 2 decimals to stay useful: a $30 / 10mg vial is
 * $3.00/mg, but cheap bulk GLP vials land in the $0.4xx range where two
 * decimals collapses distinct vendors into a fake tie.
 */
export function formatPerMg(centsPerMg: number, currency: Currency = 'USD'): string {
  const digits = centsPerMg < 10 ? 3 : 2;
  return `${new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(centsPerMg / 100)}/mg`;
}
