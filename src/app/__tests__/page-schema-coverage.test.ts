import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const MARKETING_DIR = join(process.cwd(), 'src', 'app', '(marketing)');

/**
 * Public pages allowed to skip <PageSeo>, each with the reason. Anything not
 * listed must render it, so a new page can never ship without structured data.
 */
const EXEMPT: Readonly<Record<string, string>> = {
  'thanks/page.tsx': 'post-payment confirmation, always noindex, so it carries no structured data',
};

function pageFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return pageFiles(full);
    return entry === 'page.tsx' ? [full] : [];
  });
}

describe('structured data coverage', () => {
  const pages = pageFiles(MARKETING_DIR).map((file) => ({
    route: relative(MARKETING_DIR, file).split(sep).join('/'),
    source: readFileSync(file, 'utf8'),
  }));

  it('finds the public pages', () => {
    expect(pages.length).toBeGreaterThan(20);
  });

  it.each(pages.map((page) => [page.route, page.source] as const))('%s renders PageSeo or is exempt', (route, source) => {
    if (route in EXEMPT) return;
    expect(source).toMatch(/<PageSeo\b/);
  });

  it('leaves no hand-written JSON-LD outside the shared builders', () => {
    // /faqs keeps its own FAQPage: it is that page's FAQ source, and nothing
    // else outputs FAQPage there.
    const offenders = pages
      .filter((page) => page.route !== 'faqs/page.tsx' && page.source.includes('application/ld+json'))
      .map((page) => page.route);
    expect(offenders).toEqual([]);
  });
});
