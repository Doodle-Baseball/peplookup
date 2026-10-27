import { describe, expect, it } from 'vitest';
import { buildPageGraph, graphTypes, ownedSchemaTypes, serializeGraph, type PageGraphInput } from '../graph';

const SITE = 'https://www.peplookup.com';

function page(path: string, over: Partial<PageGraphInput> = {}): PageGraphInput {
  return { path, title: 'Title', description: 'Description', heading: 'Heading', ...over };
}

function node(graph: ReturnType<typeof buildPageGraph>, type: string) {
  return graph['@graph'].find((entry) => entry['@type'] === type);
}

const supplier = {
  slug: 'licensed-peptides',
  name: 'Licensed Peptides',
  homepageUrl: 'https://licensedpeptides.com',
  foundedYear: 2021,
  country: 'United States',
};

describe('buildPageGraph: base graph', () => {
  it('always has Organization, WebSite and the page, linked by @id', () => {
    const graph = buildPageGraph(page('/privacy'));
    const org = node(graph, 'Organization');
    expect(org).toMatchObject({
      '@id': `${SITE}/#organization`,
      url: `${SITE}/`,
      logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` },
      email: 'info@peplookup.com',
      sameAs: ['https://www.skool.com/peptide-5115/about'],
    });
    expect(node(graph, 'WebSite')).toMatchObject({ '@id': `${SITE}/#website`, publisher: { '@id': `${SITE}/#organization` } });
    expect(node(graph, 'WebPage')).toMatchObject({
      '@id': `${SITE}/privacy#webpage`,
      url: `${SITE}/privacy`,
      name: 'Title',
      description: 'Description',
      isPartOf: { '@id': `${SITE}/#website` },
      breadcrumb: { '@id': `${SITE}/privacy#breadcrumb` },
    });
  });

  it('gives the homepage no breadcrumb', () => {
    const graph = buildPageGraph(page('/'));
    expect(graphTypes(graph)).toEqual(new Set(['Organization', 'WebSite', 'WebPage']));
    expect(node(graph, 'WebPage')).not.toHaveProperty('breadcrumb');
    expect(node(graph, 'WebPage')?.url).toBe(`${SITE}/`);
  });

  it('ends the breadcrumb on the page with no item URL', () => {
    const crumbs = node(buildPageGraph(page('/suppliers/licensed-peptides', { heading: 'Licensed Peptides' })), 'BreadcrumbList');
    expect(crumbs?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Suppliers', item: `${SITE}/suppliers` },
      { '@type': 'ListItem', position: 3, name: 'Licensed Peptides' },
    ]);
  });

  it('sets dateModified only when a date is known', () => {
    expect(node(buildPageGraph(page('/terms')), 'WebPage')).not.toHaveProperty('dateModified');
    expect(node(buildPageGraph(page('/terms', { dateModified: '2026-10-01T00:00:00Z' })), 'WebPage')?.dateModified).toBe(
      '2026-10-01T00:00:00Z',
    );
  });
});

describe('buildPageGraph: route types', () => {
  it('lists a collection page as an ItemList with a live count', () => {
    const items = [
      { name: 'A', url: '/suppliers/a' },
      { name: 'B', url: '/suppliers/b' },
    ];
    const graph = buildPageGraph(page('/suppliers', { itemList: items }));
    expect(node(graph, 'CollectionPage')?.mainEntity).toEqual({ '@id': `${SITE}/suppliers#itemlist` });
    expect(node(graph, 'ItemList')).toMatchObject({
      numberOfItems: 2,
      itemListElement: [
        { '@type': 'ListItem', position: 1, url: `${SITE}/suppliers/a`, name: 'A' },
        { '@type': 'ListItem', position: 2, url: `${SITE}/suppliers/b`, name: 'B' },
      ],
    });
  });

  it('leaves out the ItemList when the collection is empty', () => {
    const graph = buildPageGraph(page('/guides', { itemList: [] }));
    expect(graphTypes(graph).has('ItemList')).toBe(false);
    expect(node(graph, 'CollectionPage')).not.toHaveProperty('mainEntity');
  });

  it('makes a supplier page a ProfilePage about the supplier, using its own site', () => {
    const graph = buildPageGraph(page('/suppliers/licensed-peptides', { supplier }));
    expect(node(graph, 'ProfilePage')?.mainEntity).toEqual({ '@id': `${SITE}/suppliers/licensed-peptides#supplier` });
    const subject = graph['@graph'].find((entry) => entry['@id'] === `${SITE}/suppliers/licensed-peptides#supplier`);
    expect(subject).toEqual({
      '@type': 'Organization',
      '@id': `${SITE}/suppliers/licensed-peptides#supplier`,
      name: 'Licensed Peptides',
      url: 'https://licensedpeptides.com/',
      foundingDate: '2021',
      address: { '@type': 'PostalAddress', addressCountry: 'US' },
    });
  });

  it('leaves out supplier fields that are not stored, or a country it cannot map', () => {
    const graph = buildPageGraph(
      page('/suppliers/x', { supplier: { ...supplier, slug: 'x', foundedYear: null, country: 'Atlantis' } }),
    );
    const subject = graph['@graph'].find((entry) => entry['@id'] === `${SITE}/suppliers/x#supplier`);
    expect(subject).not.toHaveProperty('foundingDate');
    expect(subject).not.toHaveProperty('address');
  });

  it('points coupon and review pages at the same supplier node, with no Review or Offer', () => {
    for (const path of ['/coupons/licensed-peptides-coupon-code', '/reviews/licensed-peptides-reviews']) {
      const graph = buildPageGraph(page(path, { supplier }));
      expect(node(graph, 'WebPage')?.about).toEqual({ '@id': `${SITE}/suppliers/licensed-peptides#supplier` });
      expect(graphTypes(graph).has('Review')).toBe(false);
      expect(graphTypes(graph).has('Offer')).toBe(false);
    }
  });

  it('adds a free WebApplication to calculator pages', () => {
    const graph = buildPageGraph(page('/tools/calculator', { heading: 'Peptide Reconstitution Calculator' }));
    expect(node(graph, 'WebApplication')).toMatchObject({
      '@id': `${SITE}/tools/calculator#app`,
      name: 'Peptide Reconstitution Calculator',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });
  });

  it('treats the COA reader and guides as articles, not apps', () => {
    for (const path of ['/tools/coa-reader', '/guides/how-to-read-a-coa']) {
      const graph = buildPageGraph(page(path, { article: { datePublished: '2026-01-02' } }));
      expect(graphTypes(graph).has('WebApplication')).toBe(false);
      expect(node(graph, 'Article')).toMatchObject({
        headline: 'Heading',
        datePublished: '2026-01-02',
        mainEntityOfPage: { '@id': `${SITE}${path}#webpage` },
      });
    }
  });

  it('gives a guide its cover as the Article image and its category as a breadcrumb', () => {
    const graph = buildPageGraph(
      page('/guides/hospira-bacteriostatic-water', {
        heading: 'Hospira Bacteriostatic Water',
        article: { datePublished: '2026-10-27', dateModified: '2026-10-28T10:00:00.000Z', image: 'https://cdn.example/cover.webp' },
        subsection: { name: 'Supplies', path: '/guides' },
      }),
    );
    expect(node(graph, 'Article')).toMatchObject({
      image: 'https://cdn.example/cover.webp',
      datePublished: '2026-10-27',
      dateModified: '2026-10-28T10:00:00.000Z',
    });
    expect(node(graph, 'BreadcrumbList')).toMatchObject({
      itemListElement: [
        { position: 1, name: 'Home', item: `${SITE}/` },
        { position: 2, name: 'Guides', item: `${SITE}/guides` },
        { position: 3, name: 'Supplies', item: `${SITE}/guides` },
        { position: 4, name: 'Hospira Bacteriostatic Water' },
      ],
    });
  });

  it('omits Article dates rather than inventing them', () => {
    const article = node(buildPageGraph(page('/tools/coa-reader')), 'Article');
    expect(article).not.toHaveProperty('datePublished');
    expect(article).not.toHaveProperty('dateModified');
  });

  it('uses the about and contact page types', () => {
    expect(graphTypes(buildPageGraph(page('/about'))).has('AboutPage')).toBe(true);
    expect(graphTypes(buildPageGraph(page('/contact'))).has('ContactPage')).toBe(true);
  });

  it('gives an unknown new route the default WebPage graph', () => {
    const graph = buildPageGraph(page('/some-new-page'));
    expect(graphTypes(graph)).toEqual(new Set(['Organization', 'WebSite', 'WebPage', 'BreadcrumbList']));
  });

  it('adds a Product only when there is at least one in-stock offer', () => {
    const product = { name: 'BPC-157', description: 'Desc', lowPriceCents: 2999, highPriceCents: 8000, offerCount: 3 };
    expect(node(buildPageGraph(page('/products/bpc-157', { product })), 'Product')).toMatchObject({
      offers: { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: '29.99', highPrice: '80.00', offerCount: 3 },
    });
    expect(graphTypes(buildPageGraph(page('/products/bpc-157', { product: { ...product, offerCount: 0 } }))).has('Product')).toBe(
      false,
    );
    expect(graphTypes(buildPageGraph(page('/products/bpc-157'))).has('Product')).toBe(false);
  });

  it('never outputs a type twice or any rating', () => {
    const paths = ['/', '/suppliers', '/suppliers/licensed-peptides', '/tools/calculator', '/tools/coa-reader', '/about'];
    for (const path of paths) {
      const types = buildPageGraph(page(path, { supplier, itemList: [] }))['@graph'].map((entry) => entry['@type']);
      // Supplier pages carry two Organizations by design, PepLookup and the
      // supplier, as different entities with different @ids.
      const pageTypes = types.filter((type) => type !== 'Organization');
      expect(new Set(pageTypes).size).toBe(pageTypes.length);
      expect(JSON.stringify(types)).not.toMatch(/AggregateRating|SearchAction/);
    }
  });
});

describe('supplier homepage', () => {
  it('keeps only the origin, dropping a stored referral path', () => {
    const graph = buildPageGraph(
      page('/suppliers/licensed-peptides', { supplier: { ...supplier, homepageUrl: 'https://licensedpeptides.com/ref/peplookup/' } }),
    );
    const subject = graph['@graph'].find((entry) => entry['@id'] === `${SITE}/suppliers/licensed-peptides#supplier`);
    expect(subject?.url).toBe('https://licensedpeptides.com/');
  });
});

describe('serializeGraph', () => {
  it('escapes "<" so a name can never close the script tag', () => {
    const json = serializeGraph(buildPageGraph(page('/x', { title: '</script><script>alert(1)</script>' })));
    expect(json).not.toContain('</script>');
    expect(JSON.parse(json)['@graph'][2].name).toBe('</script><script>alert(1)</script>');
  });
});

describe('ownedSchemaTypes', () => {
  it('covers what each route outputs, including FAQPage', () => {
    expect(ownedSchemaTypes('/tools/intranasal', { productOffers: false })).toEqual(
      new Set(['Organization', 'WebSite', 'WebPage', 'FAQPage', 'BreadcrumbList', 'WebApplication']),
    );
    expect(ownedSchemaTypes('/products/bpc-157', { productOffers: false }).has('Product')).toBe(false);
    expect(ownedSchemaTypes('/products/bpc-157', { productOffers: true }).has('Product')).toBe(true);
  });
});
