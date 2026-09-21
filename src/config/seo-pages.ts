import { site } from '@/config/site';
import type { SeoDefaults } from '@/lib/seo-defaults';

export type StaticSeoGroup = 'Main pages' | 'Tools' | 'Verification' | 'Company' | 'Legal';

export interface StaticSeoPage extends SeoDefaults {
  name: string;
  group: StaticSeoGroup;
}

/**
 * Every fixed (non-database) page on the public site and its default SEO.
 * Each of these pages builds its own metadata and H1 from its entry here, and
 * /admin/seo lists the same entries, so a new static page is added in one
 * place and shows up in the dashboard automatically.
 */
export const STATIC_SEO_PAGES = [
  {
    path: '/',
    name: 'Home',
    group: 'Main pages',
    title: `${site.name} | Compare Peptide Prices by Cost per mg`,
    description: site.description,
    h1: 'Peptide Pricing Comparison.',
  },
  {
    path: '/price-checker',
    name: 'Price Checker',
    group: 'Main pages',
    title: `Price Checker | ${site.name}`,
    description: `Check live per-mg peptide pricing across every verified ${site.name} supplier, with search, filters and side-by-side comparison.`,
    h1: 'Price Checker.',
  },
  {
    path: '/suppliers',
    name: 'Suppliers directory',
    group: 'Main pages',
    title: `Peptide Suppliers Directory | Verified & Compared | ${site.name}`,
    description:
      'Browse verified peptide suppliers and compare trust ratings, lab grades, shipping, payment methods and discount codes.',
    h1: 'Find the Best Peptide Suppliers.',
  },
  {
    path: '/lab-reports',
    name: 'Lab reports',
    group: 'Main pages',
    title: `COA Lab Reports | Verified Peptide Test Results | ${site.name}`,
    description:
      'Independent third-party lab test results for peptides sold by verified vendors: browse certificates of analysis by substance or supplier.',
    h1: 'COA Test Reports Scored',
  },
  {
    path: '/guides',
    name: 'Research guides',
    group: 'Main pages',
    title: `Research Guides | ${site.name}`,
    description: `Plain-language guides on reading a COA, cost per mg, storage, reconstitution and choosing a supplier, the background every ${site.name} tool builds on.`,
    h1: 'Guides for the modern researcher.',
  },
  {
    path: '/watchlist',
    name: 'Watchlist',
    group: 'Main pages',
    title: `Watchlist | Your Saved Suppliers & Compounds | ${site.name}`,
    description: 'Suppliers and compounds you have saved for quick access, stored privately on this device.',
    h1: 'Your Watchlist',
  },
  {
    path: '/tools',
    name: 'All tools',
    group: 'Tools',
    title: `Peptide Pricing Tools | Free Research Calculators | ${site.name}`,
    description:
      'Free calculators and verification tools for peptide research: compare prices, compute cost per mg, reconstitute vials, dose intranasal sprays, and read COAs.',
    h1: 'Peptide Pricing Tools.',
  },
  {
    path: '/tools/price-per-mg',
    name: 'Price per MG calculator',
    group: 'Tools',
    title: `Price per MG Calculator | Compare Peptide Vial Pricing | ${site.name}`,
    description:
      'Convert any peptide vial price into cost per milligram and cost per dose, then check it against real live supplier listings.',
    h1: 'Price per MG',
  },
  {
    path: '/tools/calculator',
    name: 'Reconstitution calculator',
    group: 'Tools',
    title: `Reconstitution Calculator | Peptide Vial & Syringe Units | ${site.name}`,
    description:
      'Convert vial size and bacteriostatic water into exact syringe units: solve for units, dose, or BAC water.',
    h1: 'Reconstitution Calculator',
  },
  {
    path: '/tools/intranasal',
    name: 'Intranasal calculator',
    group: 'Tools',
    title: `Intranasal Calculator | Peptide Spray Dosing | ${site.name}`,
    description:
      'Calculate mcg per spray, sprays per bottle, and how many sprays deliver a target dose for intranasal peptide formulations.',
    h1: 'Intranasal Calculator',
  },
  {
    path: '/tools/coa-reader',
    name: 'COA reader',
    group: 'Tools',
    title: `COA Reader | How to Read a Certificate of Analysis | ${site.name}`,
    description:
      'A field guide to reading a peptide certificate of analysis: what every field means, what the numbers mean, and the red flags that signal a fake.',
    h1: 'COA Reader.',
  },
  {
    path: '/about',
    name: 'About us',
    group: 'Company',
    title: `About Us | ${site.name}`,
    description: `${site.name} is an independent peptide price-comparison platform. Here is what we do, what we don't, and how to reach us.`,
    h1: 'Compare before you buy.',
  },
  {
    path: '/contact',
    name: 'Contact us',
    group: 'Company',
    title: `Contact Us | ${site.name}`,
    description: `Send a question, correction or partnership enquiry to the ${site.name} team.`,
    h1: 'Contact Us',
  },
  {
    path: '/faqs',
    name: 'FAQs',
    group: 'Company',
    title: `Frequently Asked Questions | ${site.name}`,
    description: `Answers to common questions about how ${site.name} compares peptide prices, what supplier profiles show, research-use rules and how your watchlist is stored.`,
    h1: 'Frequently asked questions.',
  },
  {
    path: '/disclaimer',
    name: 'Legal disclaimers',
    group: 'Legal',
    title: `Legal Disclaimers | ${site.name}`,
    description: `Research-use-only notice, affiliate disclosure and terms governing use of ${site.name}.`,
    h1: 'Legal Disclaimers',
  },
  {
    path: '/privacy',
    name: 'Privacy policy',
    group: 'Legal',
    title: `Privacy Policy | ${site.name}`,
    description: `How ${site.name} handles the data you share with us: what we collect, what stays on your device, cookies, analytics and affiliate tracking, and how to reach us.`,
    h1: 'Privacy Policy',
  },
  {
    path: '/terms',
    name: 'Terms of service',
    group: 'Legal',
    title: `Terms of Service | ${site.name}`,
    description: `The terms governing use of ${site.name}: what the site provides, what it does not, acceptable use, third-party links and limits of liability.`,
    h1: 'Terms of Service',
  },
  {
    path: '/labs',
    name: 'Verified labs',
    group: 'Verification',
    title: `Verified Labs | ${site.name}`,
    description: `What "verified" means on ${site.name}, which suppliers publish certificates of analysis, and how to read a COA before you trust a purity number.`,
    h1: 'Verified Labs',
  },
  {
    path: '/coupons',
    name: 'Coupons',
    group: 'Main pages',
    title: `Peptide Coupon Codes | ${site.name}`,
    description: `Every active vendor discount code ${site.name} tracks, with the supplier it belongs to, its rating and a one-tap copy.`,
    h1: 'Vendor coupon codes.',
  },
  {
    path: '/partners',
    name: 'Partners',
    group: 'Company',
    title: `Partners | ${site.name}`,
    description: `How suppliers get listed on ${site.name}, how affiliate relationships work, and why a commission never changes where a supplier ranks.`,
    h1: 'Partners',
  },
] as const satisfies readonly StaticSeoPage[];

export type StaticSeoPath = (typeof STATIC_SEO_PAGES)[number]['path'];

export function staticSeoPage(path: StaticSeoPath): StaticSeoPage {
  const page = STATIC_SEO_PAGES.find((candidate) => candidate.path === path);
  if (!page) throw new Error(`No SEO registry entry for static page "${path}".`);
  return page;
}
