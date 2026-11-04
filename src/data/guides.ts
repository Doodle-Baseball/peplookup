export type GuideIcon = 'document' | 'flask' | 'shield' | 'bolt' | 'badge' | 'globe';
export type GuideAccent = 'cat-1' | 'cat-2' | 'cat-3' | 'cat-4' | 'cat-5';

export interface GuideSection {
  heading: string;
  body: readonly string[];
}

export interface Guide {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  icon: GuideIcon;
  accent: GuideAccent;
  /**
   * Cover photo URL. When absent the generated icon + colour art is used, so a
   * guide always has a cover without anyone sourcing an image for it.
   */
  coverImageUrl?: string | null;
  /** The cover photo's alt text. Required by the admin whenever a cover image is set. */
  coverImageAlt?: string | null;
  readMinutes: number;
  /** ISO date; kept as a plain string so this file has no server-only imports. */
  publishedAt: string;
  /** ISO timestamp of the last admin save. Absent on guides that ship in the repository. */
  updatedAt?: string | null;
  /** Drafts are false. Absent on guides that ship in the repository, which are always live. */
  isPublished?: boolean;
  /** The "Reviewed by me" tick in /admin/guides (0031). Absent on guides that ship in the repository. */
  reviewedByMe?: boolean;
  /**
   * For a guide that is its own landing page (what-is-peplookup): the search
   * title when it should differ from the H1, the article's named author, the
   * paragraph under the H1 (Markdown), the share image, and `standalone`,
   * which leaves out the sidebar promotion, the product rail and the FAQ block
   * and shows a visible breadcrumb. Guides saved in the admin have none of these.
   */
  seoTitle?: string;
  schemaDescription?: string;
  author?: { name: string; role: string; href: string };
  intro?: string;
  shareImageUrl?: string;
  standalone?: boolean;
  sections: readonly GuideSection[];
  /** One of the site's own calculators/checkers this guide points to, where relevant. */
  relatedTool?: { label: string; href: string };
}

/**
 * Editorial "how things work" content, general process and terminology, never
 * dosing recommendations or purity/safety claims about a specific product.
 * Keep new entries to that same register (see CLAUDE.md's YMYL rules).
 */
export const guides: readonly Guide[] = [
  {
    slug: 'what-is-peplookup',
    title: 'What Is PepLookup?',
    seoTitle: 'What Is PepLookup? Peptide Price Comparison Explained',
    excerpt:
      "PepLookup compares research peptide prices per mg across 90+ suppliers, with coupon codes, COAs and Trustpilot ratings in one place. Here's how it works.",
    schemaDescription:
      'PepLookup compares research peptide prices per mg across 90+ suppliers, with coupon codes, COAs and Trustpilot ratings in one place.',
    category: 'About PepLookup',
    icon: 'globe',
    accent: 'cat-1',
    readMinutes: 4,
    publishedAt: '2026-11-04',
    reviewedByMe: true,
    author: { name: 'Adam Dan', role: 'founder of PepLookup', href: '/about' },
    intro:
      '**PepLookup is a free price comparison site for research peptides.** It shows the price per mg of the same compound across 90+ suppliers, the coupon code for each supplier, their published lab reports (COAs) and their Trustpilot rating, all in one place. You can see who is cheapest before you buy.',
    shareImageUrl: '/logo.png',
    standalone: true,
    sections: [
      {
        heading: 'Why PepLookup exists',
        body: [
          'Buying research peptides usually means opening ten tabs. One supplier sells a 5 mg vial, another sells 10 mg, a third sells a kit of 10. One has a 15% code, another has free shipping over $150. Working out who is actually cheaper takes a calculator and half an hour.',
          'PepLookup does that maths for you. Every price is converted to **price per mg**, so a 5 mg vial and a 10 mg vial can be compared side by side.',
        ],
      },
      {
        heading: 'What you can do on PepLookup',
        body: [
          '### Compare prices per mg',
          'Each compound has its own page listing every supplier that sells it, sorted by price per mg. For example, see [BPC-157 prices per mg](/products/bpc-157) or [tirzepatide prices per mg](/products/tirzepatide). To compare any product across suppliers, use the [price checker](/price-checker).',
          '### Find a coupon code for each supplier',
          'The [coupon directory](/coupons) lists the current code for each supplier we track, with the discount and how to apply it at checkout.',
          "### See each supplier's profile",
          'Every supplier has a profile in the [supplier directory](/suppliers) showing its products and prices, shipping and payment options, published COAs, and its Trustpilot rating where one exists, linked to the source.',
          '### Check lab reports',
          "The [lab reports](/coas) page collects the certificates of analysis (COAs) that suppliers publish, so you can see which products have a test report and which don't. To understand what a COA says, try the [COA reader](/tools/coa-reader).",
          '### Use the free tools',
          [
            '- [Price per mg calculator](/tools/price-per-mg): compare any two listings yourself',
            '- [Reconstitution calculator](/tools/calculator): work out the concentration after adding bacteriostatic water',
            '- [Bacteriostatic water guide](/guides/hospira-bacteriostatic-water): sizes, prices and facts about Hospira bacteriostatic water',
          ].join('\n'),
          '### Get codes automatically with the Chrome extension',
          "The [PepLookup Chrome extension](/extension) shows the code and the Trustpilot rating while you're on a supplier's website. You copy or fill in the code with one click. It never places orders or submits forms for you.",
        ],
      },
      {
        heading: 'How PepLookup works',
        body: [
          [
            "1. **We list suppliers.** Each supplier's products, sizes and prices are added to our database.",
            '2. **We convert every price to price per mg.** That makes different vial sizes and kits comparable.',
            "3. **We add the supplier's code, COAs and Trustpilot rating.** Ratings come from Trustpilot and link back to it. We don't make up our own scores.",
            "4. **You compare and choose.** PepLookup doesn't sell anything. You buy directly from the supplier.",
          ].join('\n'),
        ],
      },
      {
        heading: 'How PepLookup makes money',
        body: [
          "PepLookup is free to use. When you visit a supplier through PepLookup and place an order, we may earn a commission from that supplier. It costs you nothing extra, and it doesn't change how suppliers are sorted. Prices are always sorted by price per mg.",
        ],
      },
      {
        heading: 'Is PepLookup legit?',
        body: [
          "PepLookup is an independent comparison site run by Adam Dan. It doesn't sell peptides, take payments or hold your details. Every supplier page links to the supplier's own site, and every rating links to its Trustpilot source, so you can check anything we show. Questions or a code that doesn't work? [Contact us](/contact).",
        ],
      },
      {
        heading: 'Who PepLookup is for',
        body: [
          'PepLookup is for researchers and labs who buy research peptides and want the best price per mg from a supplier with published lab reports. All products listed are sold by suppliers for **laboratory research use only**. PepLookup does not give medical or dosing advice. See our [disclaimer](/disclaimer).',
        ],
      },
      {
        heading: 'Join the PepLookup community',
        body: ['Want to talk about suppliers, codes and prices with other researchers? Join the [PepLookup community](/community).'],
      },
      {
        heading: 'Frequently asked questions',
        body: [
          '### Is PepLookup free?',
          'Yes. Comparing prices, using the tools and installing the Chrome extension are all free.',
          '### Does PepLookup sell peptides?',
          'No. PepLookup is a comparison site. You buy directly from the supplier.',
          '### How many suppliers does PepLookup compare?',
          'More than 90 research peptide suppliers. See the full list in the [supplier directory](/suppliers).',
          '### Where do the ratings come from?',
          "From Trustpilot. Each rating links to the supplier's Trustpilot page. If a supplier has no Trustpilot rating, we don't show one.",
          '### Can my company be listed on PepLookup?',
          'Yes. Suppliers can apply through the [supplier listing](/supplier-listing) page.',
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}

/**
 * Whether a guide has any written body yet. One without is a placeholder: it
 * stays out of the sitemap and is marked noindex until its text is in.
 */
export function guideHasContent(guide: Pick<Guide, 'sections'>): boolean {
  return guide.sections.some((section) => section.body.some((paragraph) => paragraph.trim().length > 0));
}
