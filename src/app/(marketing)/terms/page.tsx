import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { LegalPage, type LegalSection } from '@/components/layout/legal-page';

const PAGE = staticSeoPage('/terms');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    heading: 'Accepting these terms',
    body: (
      <>
        <p>
          By using {site.name} you agree to these terms. If you do not agree with any part of them, please stop
          using the site. We may update this page as the site changes; the date shown above is the last revision,
          and continuing to use {site.name} after a change means you accept the revised terms.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-provide',
    heading: 'What this site provides',
    body: (
      <>
        <p>
          {site.name} is an informational price-comparison tool for research compounds. We collect publicly
          listed prices, pack sizes and certificates of analysis from third-party suppliers and present them
          side by side so they can be compared.
        </p>
        <p>
          We do not manufacture, sell, store, ship or handle any product listed on this site. Every purchase is
          a transaction between you and the supplier, on the supplier&rsquo;s own site, under the
          supplier&rsquo;s own terms. Questions about orders, payment, delivery, returns or product quality go
          to that supplier, not to us.
        </p>
      </>
    ),
  },
  {
    id: 'research-use',
    heading: 'Research use only',
    body: (
      <>
        <p>
          Everything listed on {site.name} is presented for laboratory and research purposes only. Nothing on
          this site is intended for human or animal consumption, and nothing here is medical advice, a dosing
          recommendation or an endorsement of any compound or supplier.
        </p>
        <p>
          You are responsible for knowing and following the laws that apply where you live. See the full{' '}
          <Link href="/disclaimer" className="font-semibold text-accent hover:underline">
            legal disclaimer
          </Link>{' '}
          for the complete research-use notice.
        </p>
      </>
    ),
  },
  {
    id: 'accuracy',
    heading: 'Accuracy of prices and listings',
    body: (
      <>
        <p>
          Prices, stock states and certificates change without notice. Every price on {site.name} carries the
          time it was last observed, and that timestamp is the honest limit of what we can promise: the figure
          was correct when we recorded it, not necessarily at the moment you read it.
        </p>
        <p>
          Always confirm the current price, size and availability on the supplier&rsquo;s own page before
          buying. If you spot a listing that is wrong or out of date, tell us through the{' '}
          <Link href="/contact" className="font-semibold text-accent hover:underline">
            contact page
          </Link>{' '}
          and we will correct it.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    heading: 'Acceptable use',
    body: (
      <>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1.5 pl-5 marker:text-accent">
          <li>Scrape, harvest or bulk-copy the site&rsquo;s data for a competing commercial service.</li>
          <li>Interfere with the site&rsquo;s operation, security or availability, or attempt to gain access to any non-public area of it.</li>
          <li>Misrepresent {site.name} as the seller of any product, or imply that we endorse a supplier when we do not.</li>
          <li>Use the site for any unlawful purpose or in breach of the research-use restrictions above.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'third-party-links',
    heading: 'Third-party links and affiliate relationships',
    body: (
      <>
        <p>
          {site.name} links out to supplier sites, laboratory documents and other third-party pages. We do not
          control that content and are not responsible for it. A link is not an endorsement.
        </p>
        <p>
          Some outbound links are affiliate links, meaning we may earn a commission if you buy through them at
          no extra cost to you. A commission never changes the price you pay and never changes where a supplier
          appears in a comparison; ranking follows the numbers alone. See the{' '}
          <Link href="/partners" className="font-semibold text-accent hover:underline">
            partners page
          </Link>{' '}
          for how those relationships work.
        </p>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    heading: 'Intellectual property',
    body: (
      <>
        <p>
          The {site.name} name, design, written guides and the way our comparisons are compiled and presented
          belong to us. Supplier names, logos and product images belong to their respective owners and appear
          here for identification in a comparison context.
        </p>
        <p>
          You are welcome to quote or cite our pages with attribution and a link. You may not republish the site
          wholesale or present our data as your own.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    heading: 'Limits of liability',
    body: (
      <>
        <p>
          {site.name} is provided as is, without warranties of any kind. We do not guarantee that the site will
          be uninterrupted, error-free, or that every price and document shown is current and accurate.
        </p>
        <p>
          To the fullest extent the law allows, we are not liable for any loss arising from your use of this
          site or from any purchase you make from a third-party supplier you found through it. That includes
          losses from out-of-date pricing, a supplier&rsquo;s conduct, or the quality of anything they ship.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    heading: 'Questions about these terms',
    body: (
      <>
        <p>
          Write to us at{' '}
          <a href={`mailto:${site.contactEmail}`} className="font-semibold text-accent hover:underline">
            {site.contactEmail}
          </a>{' '}
          or through the{' '}
          <Link href="/contact" className="font-semibold text-accent hover:underline">
            contact page
          </Link>
          .
        </p>
      </>
    ),
  },
];

export default async function TermsPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <LegalPage
      eyebrow="Legal"
      title={seo?.h1 || 'Terms of Service'}
      updated="September 2026"
      sections={SECTIONS}
      intro={
        <p>
          These terms govern your use of {site.name}. They sit alongside our{' '}
          <Link href="/privacy" className="font-semibold text-accent hover:underline">
            privacy policy
          </Link>{' '}
          and{' '}
          <Link href="/disclaimer" className="font-semibold text-accent hover:underline">
            legal disclaimer
          </Link>
          , and apply to every page on {site.domain}.
        </p>
      }
    />
  );
}
