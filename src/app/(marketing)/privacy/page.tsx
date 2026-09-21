import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { LegalPage, type LegalSection } from '@/components/layout/legal-page';

const PAGE = staticSeoPage('/privacy');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const SECTIONS: LegalSection[] = [
  {
    id: 'what-we-collect',
    heading: 'What we collect',
    body: (
      <>
        <p>
          You do not need an account to use {site.name}. Browsing the price comparisons, supplier profiles,
          guides and calculators requires no sign-up and no personal details.
        </p>
        <p>We only receive personal information when you choose to hand it to us:</p>
        <ul className="list-disc space-y-1.5 pl-5 marker:text-accent">
          <li>
            <strong className="font-bold text-content">Your email address</strong>, if you submit the
            newsletter form or request a supplier&rsquo;s lab report and test history.
          </li>
          <li>
            <strong className="font-bold text-content">Your name, email address and message</strong>, if you
            write to us through the{' '}
            <Link href="/contact" className="font-semibold text-accent hover:underline">
              contact page
            </Link>
            .
          </li>
        </ul>
        <p>
          We do not ask for, and have no use for, payment details, postal addresses, dates of birth or
          government identifiers. Purchases happen on the supplier&rsquo;s own site, never on ours.
        </p>
      </>
    ),
  },
  {
    id: 'stays-on-your-device',
    heading: 'What stays on your device',
    body: (
      <>
        <p>
          Two features save data in your browser&rsquo;s local storage rather than on our servers. This data
          never leaves your device, is not transmitted to us, and is not readable by us:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 marker:text-accent">
          <li>
            <strong className="font-bold text-content">Your watchlist</strong>: the suppliers and compounds
            you save are stored under the key <code className="font-mono text-xs text-content">peplookup:watchlist</code>.
          </li>
          <li>
            <strong className="font-bold text-content">Your theme preference</strong>: light or dark mode,
            stored under <code className="font-mono text-xs text-content">peplookup:theme</code>.
          </li>
        </ul>
        <p>
          Clearing your browser&rsquo;s site data erases both. Because they are device-local, a watchlist
          saved on your phone will not appear on your laptop.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    heading: 'How we use what you send us',
    body: (
      <>
        <p>
          Email addresses submitted through our forms are used to answer your message, to send the lab
          report or test history you asked for, or to send the occasional newsletter about new lab results,
          price changes and supplier codes. That is the whole list.
        </p>
        <p>
          We do not sell, rent, or trade your personal information to anyone, and we do not share it with
          the suppliers listed on this site.
        </p>
      </>
    ),
  },
  {
    id: 'processors',
    heading: 'Service providers',
    body: (
      <>
        <p>
          Form submissions are delivered to our inbox by <strong className="font-bold text-content">Web3Forms</strong>,
          an email-forwarding service, which processes the contents of the form in order to deliver it.
        </p>
        <p>
          Our site and its pricing database are hosted by infrastructure providers who, like every web host,
          record standard server logs (IP address, browser user-agent, requested page and timestamp) for
          security, abuse prevention and diagnostics. We do not use these logs to build a profile of you.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    heading: 'Cookies',
    body: (
      <>
        <p>
          {site.name} does not set advertising or cross-site tracking cookies on the public site. The only
          cookie we set is a session cookie for the private administrator dashboard, and it is only ever
          issued to a signed-in operator of this site.
        </p>
        <p>
          Third-party sites you reach from here set their own cookies under their own policies, which we do
          not control.
        </p>
      </>
    ),
  },
  {
    id: 'affiliate-links',
    heading: 'Affiliate links and outbound clicks',
    body: (
      <>
        <p>
          Outbound links to suppliers pass through a redirect on this site before forwarding you to the
          vendor. The redirect exists to attach our affiliate reference and to keep links maintainable, and
          it does not require or record any personal information about you.
        </p>
        <p>
          Once you arrive at a supplier&rsquo;s website you are subject to that company&rsquo;s privacy
          policy and cookie practices, including any affiliate-tracking cookie it chooses to set. Our{' '}
          <Link href="/disclaimer" className="font-semibold text-accent hover:underline">
            affiliate disclosure
          </Link>{' '}
          explains the commercial relationship in full.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    heading: 'How long we keep things',
    body: (
      <p>
        We keep correspondence and newsletter subscriptions only for as long as they are useful for the
        purpose you sent them, or until you ask us to delete them. Device-local data such as your watchlist
        is kept until you clear it yourself, since we never hold a copy.
      </p>
    ),
  },
  {
    id: 'your-rights',
    heading: 'Your choices and rights',
    body: (
      <>
        <p>
          You can unsubscribe from the newsletter at any time using the link in any message we send. You can
          also ask us to tell you what personal information we hold about you, correct it, or delete it
          entirely.
        </p>
        <p>
          Depending on where you live, applicable law such as the GDPR or the CCPA may give you formal
          versions of these rights, including the right to object to processing and the right to lodge a
          complaint with your data protection authority. We honour these requests regardless of where you
          live. Email{' '}
          <a href={`mailto:${site.contactEmail}`} className="font-semibold text-accent hover:underline">
            {site.contactEmail}
          </a>{' '}
          and we will action it.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    heading: 'Security',
    body: (
      <p>
        The site is served over HTTPS and the administrator dashboard is password-protected. No method of
        transmission or storage is completely secure, so while we take reasonable measures to protect what
        you send us, we cannot guarantee absolute security.
      </p>
    ),
  },
  {
    id: 'age',
    heading: 'Children and age restriction',
    body: (
      <p>
        This site is intended for individuals 21 years of age or older, and is not directed at children. We
        do not knowingly collect personal information from anyone under 21. If you believe a minor has sent
        us personal information, contact us and we will delete it.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to this policy',
    body: (
      <p>
        We may update this policy as the site changes. The revision date at the top of this page always
        reflects the current version, and continued use of the site after an update constitutes acceptance
        of it.
      </p>
    ),
  },
];

export default async function PrivacyPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <LegalPage
      eyebrow="Legal"
      title={seo?.h1 || 'Privacy Policy'}
      updated="September 2026"
      sections={SECTIONS}
      intro={
        <>
          <p>
            {site.name} is a price-comparison tool, not a shop and not an advertising network. We collect as
            little as we can get away with, and this page sets out exactly what that means.
          </p>
          <p>
            It applies to every page on {site.domain}. It does not apply to the third-party supplier sites
            we link to, each of which publishes its own policy.
          </p>
        </>
      }
    />
  );
}
