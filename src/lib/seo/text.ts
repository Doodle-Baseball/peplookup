/**
 * Text rules shared by every page, the admin and the build check. Pure and
 * client-safe: no database access, so the admin editor, the tests and
 * scripts/seo-check.mjs all apply exactly the same rules.
 */

/** Trigram set the way Postgres' pg_trgm builds it: lower-cased words, each padded with two spaces before and one after. */
function trigrams(text: string): Set<string> {
  const set = new Set<string>();
  for (const word of text.toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
    if (!word) continue;
    const padded = `  ${word} `;
    for (let index = 0; index + 3 <= padded.length; index += 1) set.add(padded.slice(index, index + 3));
  }
  return set;
}

/**
 * 0-1 similarity of two texts, matching pg_trgm's similarity() so the page
 * check and the admin's database check agree on what "70% similar" means.
 */
export function trigramSimilarity(a: string, b: string): number {
  const left = trigrams(a);
  const right = trigrams(b);
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const gram of left) if (right.has(gram)) shared += 1;
  return shared / (left.size + right.size - shared);
}

/** The text with a supplier's own name taken out, so two texts that differ only by the name compare as duplicates. */
export function withoutName(text: string, name: string): string {
  if (!name.trim()) return text;
  return text.split(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')).join(' ');
}

export function wordCountOf(text: string | null | undefined): number {
  const trimmed = (text ?? '').trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

function setSimilarity(left: ReadonlySet<string>, right: ReadonlySet<string>): number {
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const gram of left) if (right.has(gram)) shared += 1;
  return shared / (left.size + right.size - shared);
}

/** The closest other text by trigram similarity, or null when there is nothing to compare against. */
export function mostSimilar<T extends { name: string; text: string }>(
  own: { name: string; text: string },
  others: readonly T[],
): { match: T; score: number } | null {
  const ownGrams = trigrams(withoutName(own.text, own.name));
  let best: { match: T; score: number } | null = null;
  for (const other of others) {
    if (!other.text.trim()) continue;
    const score = setSimilarity(ownGrams, trigrams(withoutName(other.text, other.name)));
    if (!best || score > best.score) best = { match: other, score };
  }
  return best;
}

/**
 * For each entry, its closest other entry. Each text is broken into trigrams
 * once, so comparing every supplier with every other stays fast enough to run
 * inside a page render (a pairwise mostSimilar() rebuilt them per pair).
 */
export function closestMatches<T extends { key: string; name: string; text: string }>(
  entries: readonly T[],
): Map<string, { match: T; score: number } | null> {
  const prepared = entries.map((entry) => ({
    entry,
    grams: entry.text.trim() ? trigrams(withoutName(entry.text, entry.name)) : null,
  }));
  const result = new Map<string, { match: T; score: number } | null>();
  for (const own of prepared) {
    let best: { match: T; score: number } | null = null;
    if (own.grams) {
      for (const other of prepared) {
        if (other === own || !other.grams) continue;
        const score = setSimilarity(own.grams, other.grams);
        if (!best || score > best.score) best = { match: other.entry, score };
      }
    }
    result.set(own.entry.key, best);
  }
  return result;
}

const STAR_GLYPHS = /[★☆✩✪✫✬✭✮✯✰⭐]/gu;
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu;
/** Pictographic by Unicode's definition, but ordinary marks in a brand or product name. */
const KEPT_SYMBOLS = new Set(['©', '®', '™']);
/** "4.7★", "4.7 ★" or "★4.7", with an optional "Rating" after it and a joiner ("+", "|", "·") before it. */
const STAR_RATING = /\s*([+|·,–-]\s*)?(?:(\d(?:\.\d)?)\s*[★⭐]|[★⭐]\s*(\d(?:\.\d)?))(\s*(?:rating|rated|stars?))?/giu;

/**
 * Titles and descriptions never carry "★" or emoji, whatever was typed in the
 * admin. A star attached to a number is a rating claim, so it becomes "4.7/5"
 * when the supplier has a rating, and is dropped entirely when it has none
 * (a number with no rating behind it is a claim we can't support).
 */
export function cleanSeoText(text: string, options: { hasRating: boolean }): string {
  const withRatings = text.replace(STAR_RATING, (_match, joiner: string | undefined, before, after, label: string | undefined) => {
    if (!options.hasRating) return '';
    const value = before ?? after;
    return `${joiner ? ` ${joiner.trim()} ` : ' '}${value}/5${label ?? ''}`;
  });
  return withRatings
    .replace(STAR_GLYPHS, '')
    .replace(EMOJI, (symbol) => (KEPT_SYMBOLS.has(symbol) ? symbol : ''))
    .replace(/\(\s*\)/g, '')
    .replace(/\s+([,.;:!?)])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** True when the text still contains a star or emoji, for the build check. */
export function hasStarOrEmoji(text: string): boolean {
  return [...text].some(
    (symbol) =>
      /[★☆✩✪✫✬✭✮✯✰⭐]/u.test(symbol) || (/\p{Extended_Pictographic}/u.test(symbol) && !KEPT_SYMBOLS.has(symbol)),
  );
}

/** A purity figure ("99%+ purity", "≥98% pure") or a third-party testing claim ("independent HPLC/MS testing"). */
const PURITY_CLAIM = /(?:≥|>=|>)?\s?9\d(?:\.\d+)?\s?%\s?\+?\s*(?:purity|pure)\b/i;
const TESTING_CLAIM =
  /\b(?:third[- ]party|3rd[- ]party|independent(?:ly)?|eight-panel independent)\b[^.?!]{0,40}?\b(?:HPLC|LC-?MS|mass spec\w*|HPLC\/MS|test(?:ing|ed)?|laborator(?:y|ies))\b/i;
const ATTRIBUTED = /^(?:Yes\.\s+|No\.\s+)?(?:Supplier states|According to the supplier|[\w .'&-]{1,60} states:)/i;

/** "Same-day fulfillment" reads as same-day delivery; the supplier only ships the same day. */
const SAME_DAY_FULFILMENT = /\bsame[- ]day (?:order )?fulfil{1,2}ment\b/gi;

/**
 * The supplier's delivery window as it states it, e.g. "1–5 business days"
 * from "Same-day fulfillment; 1–5 business days standard". Processing times
 * are skipped. Null when the supplier states no window, so none is invented.
 */
export function deliveryWindow(shippingSpeed: string | null | undefined): string | null {
  if (!shippingSpeed) return null;
  for (const part of shippingSpeed.split(/[;\n]/)) {
    if (/processing|dispatch/i.test(part)) continue;
    const match = part.match(/\b(\d+\s?[–-]\s?\d+|\d+)\s?(?:business |working )?days?\b/i);
    if (match) return `${match[1]!.replace(/\s?[–-]\s?/, '–')} ${/business/i.test(match[0]) ? 'business ' : ''}days`;
  }
  return null;
}

/**
 * Sentences with their trailing space kept, so joining them gives the text
 * back. A stop only ends a sentence when a space and a capital (or digit)
 * follow, so "U.S.-based" or "2.5 mg" stay whole.
 */
function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  const boundary = /[.?!]+(?=\s+["'(\[]?[\p{Lu}\p{N}])/gu;
  let start = 0;
  for (let match = boundary.exec(text); match; match = boundary.exec(text)) {
    const end = match.index + match[0].length;
    const nextWord = text.slice(end).search(/\S/);
    const cut = nextWord === -1 ? text.length : end + nextWord;
    sentences.push(text.slice(start, cut));
    start = cut;
  }
  if (start < text.length) sentences.push(text.slice(start));
  return sentences;
}

export interface ClaimContext {
  /** Whether we link at least one of this supplier's certificates of analysis. */
  hasLinkedCoa: boolean;
  shippingSpeed: string | null;
}

/**
 * The A7 text fixes, applied when supplier text is rendered (so admin-written
 * text and anything saved later are covered too):
 *   - a purity or third-party-testing claim with no COA of ours to back it is
 *     attributed to the supplier ("Supplier states: …");
 *   - "same-day fulfillment" becomes "ships same day" with the supplier's own
 *     stated delivery window, so title, description and body never promise
 *     same-day delivery.
 */
export function qualifyClaims(text: string, context: ClaimContext): string {
  if (!text) return text;
  const window = deliveryWindow(context.shippingSpeed);
  const shipped = splitSentences(text)
    .map((sentence) => {
      if (!sentence.match(SAME_DAY_FULFILMENT)) return sentence;
      const isQuestion = sentence.trim().endsWith('?');
      return sentence.replace(SAME_DAY_FULFILMENT, (match, offset: number) => {
        const startsSentence = sentence.slice(0, offset).trim() === '';
        if (isQuestion) return startsSentence ? 'Same-day shipping' : 'same-day shipping';
        if (startsSentence) return window ? `Ships same day; delivery in ${window}` : 'Ships same day';
        return window ? `same-day shipping (delivery in ${window})` : 'same-day shipping';
      });
    })
    .join('');

  if (context.hasLinkedCoa) return shipped;
  return splitSentences(shipped)
    .map((sentence) => {
      const leading = sentence.match(/^\s*/)?.[0] ?? '';
      const body = sentence.slice(leading.length);
      if (!body || sentence.trim().endsWith('?')) return sentence;
      if (!PURITY_CLAIM.test(body) && !TESTING_CLAIM.test(body)) return sentence;
      if (ATTRIBUTED.test(body)) return sentence;
      // Keep a leading "Yes." on its own; the claim after it is what gets attributed.
      const answer = body.match(/^(Yes|No)\.\s+/);
      if (answer) return `${leading}${answer[0]}Supplier states: ${body.slice(answer[0].length)}`;
      return `${leading}Supplier states: ${body}`;
    })
    .join('');
}

/**
 * Same-day wording inside a supplier's own shipping line, which already states
 * its delivery windows ("Same-day fulfillment; 1–5 business days standard").
 */
export function qualifyShippingSpeed(shippingSpeed: string): string {
  return shippingSpeed.replace(SAME_DAY_FULFILMENT, (match) => (match[0] === 'S' ? 'Ships same day' : 'ships same day'));
}

/** Same-day wording for a title, which has no room for the delivery window. */
export function qualifyTitleClaims(title: string): string {
  return title.replace(SAME_DAY_FULFILMENT, (match) => (match[0] === 'S' ? 'Same-Day Shipping' : 'same-day shipping'));
}
