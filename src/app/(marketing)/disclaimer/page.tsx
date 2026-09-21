import type { Metadata } from 'next';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { LegalPage, type LegalSection } from '@/components/layout/legal-page';

const PAGE = staticSeoPage('/disclaimer');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const SECTIONS: LegalSection[] = [
  {
    id: 'research-use-only',
    heading: 'Research use only',
    body: (
      <>
        <p>
          Every product referenced on {site.name} is represented as intended for laboratory research use
          only, and not for human or animal consumption. Statements on this site have not been evaluated
          by the U.S. Food and Drug Administration (FDA), and nothing here is intended to diagnose, treat,
          cure or prevent any disease.
        </p>
        <p>
          {site.name} is a price comparison tool. We do not manufacture, compound, formulate, package,
          label, sell, or ship any chemical substance. We aggregate publicly listed pricing and supplier
          information for research purposes only. Any transaction for a listed product occurs directly
          between the buyer and the third-party supplier; {site.name} is not a party to that transaction.
        </p>
      </>
    ),
  },
  {
    id: 'not-advice',
    heading: 'Not medical or scientific advice',
    body: (
      <p>
        Content on this site, including calculators, comparisons and supplier profiles, is for general
        informational purposes only. It is not medical advice, healthcare guidance, diagnosis, treatment,
        or laboratory protocol guidance, and should not be treated as a substitute for consulting a
        qualified professional.
      </p>
    ),
  },
  {
    id: 'acknowledgement',
    heading: 'Research use acknowledgement',
    body: (
      <>
        <p>By using this site, you acknowledge and agree that:</p>
        <ul className="list-disc space-y-1.5 pl-5 marker:text-accent">
          <li>Referenced products are for laboratory research purposes only, not for human or animal consumption.</li>
          <li>Statements on this site have not been evaluated by the FDA and are not medical advice.</li>
          <li>Referenced products are not intended as a food, drug, cosmetic or other household item.</li>
          <li>You are solely responsible for complying with the laws and regulations of your jurisdiction.</li>
          <li>Your use of this site is governed by our Terms of Service.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'no-sales',
    heading: 'We do not sell products',
    body: (
      <p>
        {site.name} does not manufacture, distribute, sell, or ship any peptide or related product. We are
        a comparison and information tool only. Every purchase is made directly with a third-party
        supplier, and we are not a party to that transaction, which means we do not process payments,
        handle shipping or fulfilment, or manage returns, refunds or disputes for any listed supplier.
      </p>
    ),
  },
  {
    id: 'affiliate-disclosure',
    heading: 'Affiliate disclosure (FTC compliance)',
    body: (
      <>
        <p>
          {site.name} participates in affiliate programmes and may earn a commission when a visitor clicks
          a listed link or completes a purchase with a supplier. This commission is paid by the supplier
          and never changes the price a buyer pays.
        </p>
        <p>
          Ranking on this site is by price and verification data, never by commission rate. If that policy
          ever changes, it will be disclosed on the relevant page. This disclosure is provided in
          accordance with FTC guidance on affiliate compensation.
        </p>
      </>
    ),
  },
  {
    id: 'third-party',
    heading: 'Third-party responsibility',
    body: (
      <p>
        Product descriptions, pricing, availability and claims are supplied by independent third-party
        vendors. {site.name} makes no representation or warranty regarding product quality, purity or
        safety; the accuracy of a supplier&rsquo;s claims; a supplier&rsquo;s compliance with applicable
        law; or shipping practices and timelines. Any dispute concerning a purchase should be directed to
        the supplier, not to {site.name}.
      </p>
    ),
  },
  {
    id: 'no-endorsement',
    heading: 'No endorsement',
    body: (
      <p>
        Listing or ranking a supplier or product does not constitute an endorsement, certification, or
        guarantee of efficacy, legitimacy, or regulatory compliance. Comparisons reflect the data
        available to us and may not capture every factor relevant to a purchasing decision.
      </p>
    ),
  },
  {
    id: 'accuracy',
    heading: 'Accuracy of information',
    body: (
      <p>
        We make reasonable efforts to keep pricing and product information current: every price on this
        site carries the time it was last observed. Prices can change without notice, stock can vary, and
        listings may contain errors or omissions. We do not guarantee the completeness, reliability, or
        timeliness of anything displayed.
      </p>
    ),
  },
  {
    id: 'liability',
    heading: 'Limitation of liability',
    body: (
      <>
        <p>
          To the fullest extent permitted by law, {site.name} and its operators are not liable for any
          direct, indirect, incidental, consequential, special or punitive damages arising from the use or
          misuse of a product purchased through a listed supplier, from inaccuracies or omissions in our
          content, or from reliance on information presented on this site. Use of this site is at your own
          risk.
        </p>
        <p>
          All content and services are provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo;
          without warranties of any kind, express or implied, including implied warranties of
          merchantability, fitness for a particular purpose, and non-infringement.
        </p>
      </>
    ),
  },
  {
    id: 'indemnification',
    heading: 'Indemnification',
    body: (
      <p>
        You agree to indemnify and hold harmless {site.name} and its operators from claims, damages, or
        liabilities arising from your use of the site, your purchase or use of a third-party product, or
        your violation of applicable law or these terms.
      </p>
    ),
  },
  {
    id: 'age-restriction',
    heading: 'Age restriction',
    body: (
      <p>
        This site is intended for use by individuals 21 years of age or older. By using it, you confirm
        that you meet this requirement. If you are under 21, you may not use this platform.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to this page',
    body: (
      <p>
        We may update this page at any time without prior notice. Continued use of the site after a change
        constitutes acceptance of the revised terms.
      </p>
    ),
  },
];

export default async function DisclaimerPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <LegalPage
      eyebrow="Legal"
      title={seo?.h1 || 'Legal Disclaimers'}
      updated="September 2026"
      sections={SECTIONS}
      intro={
        <p>
          {site.name} is an informational price-comparison platform. This page explains what the site is,
          what it is not, and the terms under which it may be used. It applies to every page on{' '}
          {site.domain}.
        </p>
      }
    />
  );
}
