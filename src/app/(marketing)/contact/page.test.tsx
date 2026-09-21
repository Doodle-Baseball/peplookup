import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ContactPage from './page';

// Isolates this render from Supabase/cache: SEO overrides are covered by
// src/lib/__tests__/seo.test.ts, not by this page smoke test.
vi.mock('@/lib/seo', () => ({ getSeoOverride: async () => null, withSeo: async (_path: string, base: unknown) => base }));

describe('ContactPage', () => {
  it('includes the Web3Forms submission action and access key', async () => {
    // An async Server Component: call it directly and await the element tree,
    // since react-dom/server's static renderer can't run async components itself.
    const html = renderToStaticMarkup(await ContactPage());

    expect(html).toContain('https://api.web3forms.com/submit');
    expect(html).toContain('ee118fde-8201-4c9f-8174-f0895772887d');
  });
});
