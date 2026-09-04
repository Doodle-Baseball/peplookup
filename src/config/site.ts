export const site = {
  name: 'PepLookup',
  /** Rendered as two tones in the wordmark. */
  nameParts: { lead: 'Pep', tail: 'Lookup' },
  domain: 'peplookup.com',
  contactEmail: 'info@peplookup.com',
  tagline: 'Fast, accurate, transparent peptide monitoring for the modern researcher.',
  description:
    'Compare peptide prices across verified suppliers, normalised to cost per mg, with lab-verified COAs and current discount codes.',
} as const;

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
  { label: 'Search', href: '/' },
  { label: 'Suppliers', href: '/suppliers' },
  { label: 'Sales', href: '/sales' },
  {
    label: 'Tools',
    href: '/tools',
    childrenHeading: 'Research Tools',
    children: [
      { label: 'Price per MG', href: '/tools/price-per-mg', hint: 'Cost per milligram' },
      { label: 'Reconstitution', href: '/tools/calculator', hint: 'Syringe units & dose' },
      { label: 'Intranasal', href: '/tools/intranasal', hint: 'Spray doses' },
      { label: 'COA Reader', href: '/tools/coa-reader', hint: 'Verify certificates' },
      { label: 'Watchlist', href: '/watchlist', hint: 'Track your favourite peptides' },
      { label: 'All Tools', href: '/tools' },
    ],
  },
  { label: 'Protocol', href: '/lab-database' },
  { label: 'Lab Reports', href: '/lab-reports' },
  {
    label: 'Price Checker',
    href: '/tools/price-checker',
    childrenHeading: 'Price Trackers',
    children: [
      { label: 'BPC-157', href: '/compare/bpc-157' },
      { label: 'TB-500', href: '/compare/tb-500' },
      { label: 'Semaglutide', href: '/compare/semaglutide' },
      { label: 'Tirzepatide', href: '/compare/tirzepatide' },
      { label: 'Retatrutide', href: '/compare/retatrutide' },
      { label: 'Price Checker', href: '/tools/price-checker' },
    ],
  },
  { label: 'Blog', href: '/blog' },
  { label: 'Guides', href: '/guides' },
  { label: 'Partners', href: '/partners' },
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
  {
    label: 'Vendors',
    href: '/vendor',
    childrenHeading: 'Vendor Portal',
    children: [
      { label: 'Sign In', href: '/vendor/sign-in' },
      { label: 'Sign Up', href: '/vendor/sign-up' },
      { label: 'View Plans', href: '/vendor/upgrade' },
    ],
  },
];

export const footerNav: readonly { heading: string; links: readonly NavChild[] }[] = [
  {
    heading: 'Explore',
    links: [
      { label: 'Price Search', href: '/' },
      { label: 'Suppliers', href: '/suppliers' },
      { label: 'Sales & Deals', href: '/sales' },
      { label: 'Price Checker', href: '/tools/price-checker' },
      { label: 'Watchlist', href: '/watchlist' },
      { label: 'Partners', href: '/partners' },
    ],
  },
  {
    heading: 'Verification',
    links: [
      { label: 'Lab Reports', href: '/lab-reports' },
      { label: 'Verified Labs', href: '/labs' },
      { label: 'Testing Protocol', href: '/lab-database' },
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
      { label: 'Research Blog', href: '/blog' },
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
      { label: 'Vendor Refund Policy', href: '/vendor/cancellation-policy' },
    ],
  },
];

/** Shown site-wide above the fold. Research-use-only posture is non-negotiable. */
export const RESEARCH_USE_NOTICE =
  'Research Use Only. Products listed are not for human or animal consumption. Statements have not been evaluated by the FDA.';
