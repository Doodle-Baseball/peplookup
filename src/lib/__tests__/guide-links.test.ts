import { describe, expect, it } from 'vitest';
import { classifyGuideLink, hostsFromUrls } from '../guide-links';

const suppliers = hostsFromUrls(['https://www.primepepsolutions.com/?ref=PEPLOOKUP', 'not a url', null]);

describe('classifyGuideLink', () => {
  it('keeps site paths in the same tab', () => {
    expect(classifyGuideLink('/tools/calculator', suppliers)).toBe('internal');
    expect(classifyGuideLink('/suppliers/hospira-bacteriostatic-water', suppliers)).toBe('internal');
  });

  it('treats /go affiliate redirects and supplier sites as sponsored', () => {
    expect(classifyGuideLink('/go?to=prime-pep&src=site', suppliers)).toBe('sponsored');
    expect(classifyGuideLink('https://primepepsolutions.com/product', suppliers)).toBe('sponsored');
    expect(classifyGuideLink('https://WWW.primepepsolutions.com', suppliers)).toBe('sponsored');
  });

  it('opens any other site as a plain external link', () => {
    expect(classifyGuideLink('https://labeling.pfizer.com/ShowLabeling.aspx?id=4666', suppliers)).toBe('external');
  });

  it('does not mistake a path that only starts with /go for the redirect', () => {
    expect(classifyGuideLink('/goals', suppliers)).toBe('internal');
  });

  it('leaves protocol-relative, anchor and mailto links alone', () => {
    expect(classifyGuideLink('//evil.example/x', suppliers)).toBe('other');
    expect(classifyGuideLink('#faq', suppliers)).toBe('other');
    expect(classifyGuideLink('mailto:info@peplookup.com', suppliers)).toBe('other');
  });
});
