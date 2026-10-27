import { describe, expect, it } from 'vitest';
import { sectionAnchorIds } from '../guide-toc';

describe('sectionAnchorIds', () => {
  it('slugs each heading', () => {
    expect(sectionAnchorIds(['What is Hospira bacteriostatic water?', 'Hospira vs other brands'])).toEqual([
      'what-is-hospira-bacteriostatic-water',
      'hospira-vs-other-brands',
    ]);
  });

  it('keeps repeated headings distinct', () => {
    expect(sectionAnchorIds(['Storage', 'Storage', 'Storage'])).toEqual(['storage', 'storage-2', 'storage-3']);
  });

  it('falls back for a heading with no letters or numbers', () => {
    expect(sectionAnchorIds(['???'])).toEqual(['section']);
  });
});
