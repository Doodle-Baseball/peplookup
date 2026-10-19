import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/config/site';
import { chromeExtension } from '@/config/extension';
import { staticSeoPage } from '@/config/seo-pages';
import { PageSeo } from '@/components/seo/page-seo';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { LegalPage, type LegalSection } from '@/components/layout/legal-page';

const PAGE = staticSeoPage('/extension/privacy');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const LINK_CLASS = 'font-semibold text-accent hover:underline';

const SECTIONS: LegalSection[] = [
  {
    id: 'what-it-does',
    heading: 'What the extension does',
    body: (
      <p>
        {chromeExtension.name} has one job: when you visit the store of a supplier {site.name} lists, it shows that
        supplier&rsquo;s {site.name} coupon code so you can copy it or fill it into the discount field. It never
        submits an order, a form or a payment for you.
      </p>
    ),
  },
  {
    id: 'what-it-reads',
    heading: 'What it reads',
    body: (
      <>
        <p>
          To know whether you are on a supported store, the extension checks the website address of the tab you are
          viewing against the list of supplier domains it downloads from us. That check happens in your browser.
          The addresses you visit are not sent to {site.name}.
        </p>
        <p>
          The list itself is public: it is the same set of codes shown on our{' '}
          <Link href="/coupons" className={LINK_CLASS}>
            coupons page
          </Link>
          . Downloading it sends nothing about you beyond what any request to a website carries, such as your IP
          address, which our hosting provider handles like any other page view.
        </p>
      </>
    ),
  },
  {
    id: 'never-collected',
    heading: 'What it never collects',
    body: (
      <p>
        The extension does not collect your name, email address, account details, passwords, payment details,
        what is in your cart, what you type into forms, or your browsing history. We do not sell or share data
        about you, and we do not use the extension for advertising.
      </p>
    ),
  },
  {
    id: 'offer-clicks',
    heading: 'When you click an offer',
    body: (
      <>
        <p>
          Offer links in the extension open a {site.name} address (
          <code className="font-mono text-xs text-content">{site.domain}/go</code>) that forwards you to the supplier
          through our affiliate link. For each click we record which supplier it was for, that it came from the
          extension, and the time. We do not record who you are. A cookie holding only the value
          &ldquo;1&rdquo; is kept for 10 minutes so a repeat click on the same supplier is counted once.
        </p>
        <p>
          The same click is counted in Google Analytics as an &ldquo;affiliate_click&rdquo; event. If you have visited{' '}
          {site.name} before, Google Analytics may link that event to the analytics cookie already set on our site,
          as described in our{' '}
          <Link href="/privacy" className={LINK_CLASS}>
            website privacy policy
          </Link>
          . Once you reach the supplier&rsquo;s site, its own privacy policy applies.
        </p>
      </>
    ),
  },
  {
    id: 'install-uninstall',
    heading: 'Install and uninstall pages',
    body: (
      <p>
        After you install the extension it opens a welcome page on our site, and after you remove it, a page asking
        why. Answering that question is optional. If you do, we store only the reason you pick and anything you
        choose to type, without any identifier. To stop spam, the page briefly limits how many answers one
        connection can send, without saving your IP address.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: 'Questions and requests',
    body: (
      <p>
        Email{' '}
        <a href={`mailto:${site.contactEmail}`} className={LINK_CLASS}>
          {site.contactEmail}
        </a>{' '}
        with any question about this policy or to ask us to delete feedback you sent. If this policy changes, the
        date at the top of this page changes with it.
      </p>
    ),
  },
];

export default async function ExtensionPrivacyPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <LegalPage
      structuredData={<PageSeo seo={PAGE} />}
      eyebrow="Legal"
      title={seo?.h1 || PAGE.h1}
      updated="October 2026"
      sections={SECTIONS}
      intro={
        <>
          <p>
            This policy covers the {chromeExtension.name} extension for Google Chrome, published by {site.name}.
          </p>
          <p>
            For the {site.domain} website itself, see our{' '}
            <Link href="/privacy" className={LINK_CLASS}>
              privacy policy
            </Link>
            .
          </p>
        </>
      }
    />
  );
}
