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
    });
    // The brand's other profiles are listed on the homepage's Organization node only.
    expect(org).not.toHaveProperty('sameAs');
    expect(node(buildPageGraph(page('/')), 'Organization')?.sameAs).toEqual([
      'https://chromewebstore.google.com/detail/pogbkndeefgihpmgpgidimjapbocfckd',
      'https://www.skool.com/peptide-5115',
    ]);
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
    const crumbs = node(buildPageGraph(page('/supplier/licensed-peptides', { heading: 'Licensed Peptides' })), 'BreadcrumbList');
    expect(crumbs?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Suppliers', item: `${SITE}/supplier` },
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
      { name: 'A', url: '/supplier/a' },
      { name: 'B', url: '/supplier/b' },
    ];
    const graph = buildPageGraph(page('/supplier', { itemList: items }));
    expect(node(graph, 'CollectionPage')?.mainEntity).toEqual({ '@id': `${SITE}/supplier#itemlist` });
    expect(node(graph, 'ItemList')).toMatchObject({
      numberOfItems: 2,
      itemListElement: [
        { '@type': 'ListItem', position: 1, url: `${SITE}/supplier/a`, name: 'A' },
        { '@type': 'ListItem', position: 2, url: `${SITE}/supplier/b`, name: 'B' },
      ],
    });
  });

  it('leaves out the ItemList when the collection is empty', () => {
    const graph = buildPageGraph(page('/guide', { itemList: [] }));
    expect(graphTypes(graph).has('ItemList')).toBe(false);
    expect(node(graph, 'CollectionPage')).not.toHaveProperty('mainEntity');
  });

  it('makes a supplier page a ProfilePage about the supplier, using its own site', () => {
    const graph = buildPageGraph(page('/supplier/licensed-peptides', { supplier }));
    expect(node(graph, 'ProfilePage')?.mainEntity).toEqual({ '@id': `${SITE}/supplier/licensed-peptides#supplier` });
    const subject = graph['@graph'].find((entry) => entry['@id'] === `${SITE}/supplier/licensed-peptides#supplier`);
    expect(subject).toEqual({
      '@type': 'Organization',
      '@id': `${SITE}/supplier/licensed-peptides#supplier`,
      name: 'Licensed Peptides',
      url: 'https://licensedpeptides.com/',
      foundingDate: '2021',
      address: { '@type': 'PostalAddress', addressCountry: 'US' },
    });
  });

  it('leaves out supplier fields that are not stored, or a country it cannot map', () => {
    const graph = buildPageGraph(
      page('/supplier/x', { supplier: { ...supplier, slug: 'x', foundedYear: null, country: 'Atlantis' } }),
    );
    const subject = graph['@graph'].find((entry) => entry['@id'] === `${SITE}/supplier/x#supplier`);
    expect(subject).not.toHaveProperty('foundingDate');
    expect(subject).not.toHaveProperty('address');
  });

  it('points coupon and review pages at the same supplier node, with no Review or Offer', () => {
    for (const path of ['/coupon/licensed-peptides-coupon-code', '/review/licensed-peptides-reviews']) {
      const graph = buildPageGraph(page(path, { supplier }));
      expect(node(graph, 'WebPage')?.about).toEqual({ '@id': `${SITE}/supplier/licensed-peptides#supplier` });
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
    for (const path of ['/tools/coa-reader', '/guide/how-to-read-a-coa']) {
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
      page('/guide/hospira-bacteriostatic-water', {
        heading: 'Hospira Bacteriostatic Water',
        article: { datePublished: '2026-10-27', dateModified: '2026-10-28T10:00:00.000Z', image: 'https://cdn.example/cover.webp' },
        subsection: { name: 'Supplies', path: '/guide' },
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
        { position: 2, name: 'Guides', item: `${SITE}/guide` },
        { position: 3, name: 'Supplies', item: `${SITE}/guide` },
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
    expect(node(buildPageGraph(page('/product/bpc-157', { product })), 'Product')).toMatchObject({
      offers: { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: '29.99', highPrice: '80.00', offerCount: 3 },
    });
    expect(graphTypes(buildPageGraph(page('/product/bpc-157', { product: { ...product, offerCount: 0 } }))).has('Product')).toBe(
      false,
    );
    expect(graphTypes(buildPageGraph(page('/product/bpc-157'))).has('Product')).toBe(false);
  });

  it('never outputs a type twice or any rating', () => {
    const paths = ['/', '/supplier', '/supplier/licensed-peptides', '/tools/calculator', '/tools/coa-reader', '/about'];
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
      page('/supplier/licensed-peptides', { supplier: { ...supplier, homepageUrl: 'https://licensedpeptides.com/ref/peplookup/' } }),
    );
    const subject = graph['@graph'].find((entry) => entry['@id'] === `${SITE}/supplier/licensed-peptides#supplier`);
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
    expect(ownedSchemaTypes('/product/bpc-157', { productOffers: false }).has('Product')).toBe(false);
    expect(ownedSchemaTypes('/product/bpc-157', { productOffers: true }).has('Product')).toBe(true);
  });
});

describe('buildPageGraph: a supplier profile at /supplier/<slug>', () => {
  const profile = buildPageGraph(
    page('/supplier/american-peptides', { heading: 'American Peptides', supplier: { ...supplier, slug: 'american-peptides', name: 'American Peptides' } }),
  );
  const NEW = `${SITE}/supplier/american-peptides`;

  it('names the new address as the page url, @id and supplier @id', () => {
    const webPage = node(profile, 'ProfilePage');
    expect(webPage).toMatchObject({ '@id': `${NEW}#webpage`, url: NEW });
    expect(JSON.stringify(profile)).toContain(`"${NEW}#supplier"`);
  });

  it('keys the BreadcrumbList to the new address, still under Suppliers', () => {
    const breadcrumbs = node(profile, 'BreadcrumbList') as { '@id': string; itemListElement: { name: string; item?: string }[] };
    expect(breadcrumbs['@id']).toBe(`${NEW}#breadcrumb`);
    // The current page is the last crumb and, as on every page of the site, carries no item URL.
    expect(breadcrumbs.itemListElement.at(-1)).toMatchObject({ name: 'American Peptides' });
    expect(breadcrumbs.itemListElement.some((crumb) => crumb.name === 'Suppliers' && crumb.item === `${SITE}/supplier`)).toBe(true);
  });

  it('never mentions the old plural address', () => {
    expect(serializeGraph(profile)).not.toMatch(/\/suppliers\/american-peptides(?!-)/);
  });

  it('names every supplier profile at its own /supplier/<slug>', () => {
    const other = buildPageGraph(page('/supplier/licensed-peptides', { supplier }));
    expect(node(other, 'ProfilePage')).toMatchObject({ url: `${SITE}/supplier/licensed-peptides` });
  });
});
