import { describe, expect, it } from 'vitest';
import { stripOwnedJsonLd } from '../pasted-json-ld';

const owned = new Set(['WebApplication', 'FAQPage', 'Organization']);
const script = (body: unknown) => `<script type="application/ld+json">${JSON.stringify(body)}</script>`;

describe('stripOwnedJsonLd', () => {
  it('drops a pasted node of a type the page already outputs', () => {
    expect(stripOwnedJsonLd(script({ '@type': 'WebApplication', name: 'X' }), owned)).toBe('');
  });

  it('keeps JSON-LD of types the page does not output', () => {
    const html = script({ '@type': 'HowTo', name: 'X' });
    expect(stripOwnedJsonLd(html, owned)).toBe(html);
  });

  it('removes only the owned nodes from a mixed @graph', () => {
    const out = stripOwnedJsonLd(script({ '@context': 'https://schema.org', '@graph': [{ '@type': 'FAQPage' }, { '@type': 'HowTo' }] }), owned);
    expect(out).toContain('HowTo');
    expect(out).not.toContain('FAQPage');
  });

  it('handles an array of nodes and a @type array', () => {
    expect(stripOwnedJsonLd(script([{ '@type': ['Organization', 'Brand'] }]), owned)).toBe('');
  });

  it('leaves other tags and invalid JSON alone', () => {
    const html = '<meta name="x" content="y"><script type="application/ld+json">{not json</script><script>track()</script>';
    expect(stripOwnedJsonLd(html, owned)).toBe(html);
  });
});
