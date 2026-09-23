export const site = {
  name: 'PepLookup',
  /** Rendered as two tones in the wordmark. */
  nameParts: { lead: 'Pep', tail: 'Lookup' },
domain: 'www.peplookup.com',
  contactEmail: 'info@peplookup.com',
  /** Display form; `whatsappUrl` below builds the wa.me link from it. */
  whatsapp: '+1 260 218 1154',
  tagline: 'Fast, accurate, transparent peptide monitoring for the modern researcher.',
  description:
    'Compare peptide prices across verified suppliers, normalised to cost per mg, with lab-verified COAs and current discount codes.',
} as const;

/** wa.me needs the number as digits only, no spaces or leading plus. */
export const whatsappUrl = `https://wa.me/${site.whatsapp.replace(/\D/g, '')}`;

export interface NavChild {
  readonly label: string;
  readonly href: string;
  readonly hint?: string;
}

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly children?: readonly NavChild[];
  /** Rendered as a highlighted group heading above its children. */
  readonly childrenHeading?: string;
}

export const primaryNav: readonly NavItem[] = [
  { label: 'Peptides', href: '/' },
  { label: 'Suppliers', href: '/suppliers' },
  {
    label: 'Tools',
    href: '/tools',
    childrenHeading: 'Research Tools',
    children: [
      { label: 'Price per MG', href: '/tools/price-per-mg', hint: 'Cost per milligram' },
      { label: 'Reconstitution', href: '/tools/calculator', hint: 'Syringe units & dose' },
      { label: 'Intranasal', href: '/tools/intranasal', hint: 'Spray doses' },
      { label: 'COA Reader', href: '/tools/coa-reader', hint: 'Verify certificates' },
      { label: 'All Tools', href: '/tools' },
    ],
  },
  { label: 'Coupons', href: '/coupons' },
  { label: 'Lab Reports', href: '/lab-reports' },
  {
    label: 'Price Checker',
    href: '/price-checker',
    childrenHeading: 'Compounds',
    children: [
      { label: 'BPC-157', href: '/products/bpc-157' },
      { label: 'TB-500', href: '/products/tb-500' },
      { label: 'Semaglutide', href: '/products/semaglutide' },
      { label: 'Tirzepatide', href: '/products/tirzepatide' },
      { label: 'Retatrutide', href: '/products/retatrutide' },
      { label: 'All Compounds', href: '/price-checker' },
    ],
  },
  { label: 'Guides', href: '/guides' },
  {
    label: 'Contact',
    href: '/contact',
    childrenHeading: 'Contact',
    children: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'About', href: '/about' },
      { label: 'FAQs', href: '/faqs' },
    ],
  },
];

export const footerNav: readonly { heading: string; links: readonly NavChild[] }[] = [
  {
    heading: 'Explore',
    links: [
      { label: 'Peptides', href: '/' },
      { label: 'Suppliers', href: '/suppliers' },
      { label: 'Price Checker', href: '/price-checker' },
      { label: 'Watchlist', href: '/watchlist' },
      { label: 'Partners', href: '/partners' },
    ],
  },
  {
    heading: 'Verification',
    links: [
      { label: 'Lab Reports', href: '/lab-reports' },
      { label: 'Verified Labs', href: '/labs' },
      { label: 'COA Reader', href: '/tools/coa-reader' },
    ],
  },
  {
    heading: 'Tools',
    links: [
      { label: 'All Tools', href: '/tools' },
      { label: 'Price per MG', href: '/tools/price-per-mg' },
      { label: 'Reconstitution', href: '/tools/calculator' },
      { label: 'Intranasal', href: '/tools/intranasal' },
      { label: 'COA Reader', href: '/tools/coa-reader' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Research Guides', href: '/guides' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Disclaimer', href: '/disclaimer' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

/** Shown site-wide above the fold. Research-use-only posture is non-negotiable. */
export const RESEARCH_USE_NOTICE =
  'Research Use Only. Products listed are not for human or animal consumption. Statements have not been evaluated by the FDA.';
