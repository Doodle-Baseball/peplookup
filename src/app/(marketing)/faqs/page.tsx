import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { ArrowRightIcon, BoltIcon, ChevronDownIcon, ExternalIcon } from '@/components/icons/icons';

const PAGE = staticSeoPage('/faqs');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

interface Faq {
  question: string;
  answer: string;
  link?: { label: string; href: string };
}

const SKOOL_URL = 'https://www.skool.com/peptide-5115/about';

const FAQ_GROUPS: readonly { title: string; faqs: readonly Faq[] }[] = [
  {
    title: `About ${site.name}`,
    faqs: [
      {
        question: `What is ${site.name}?`,
        answer: `${site.name} is an independent price-comparison platform for research peptides. It collects publicly listed prices from suppliers and normalises them to cost per mg, so vials of different sizes and multipacks can be compared directly.`,
      },
      {
        question: `Does ${site.name} sell peptides?`,
        answer:
          'No. We do not manufacture, sell or ship any product. Every purchase happens directly between you and the supplier you choose, and we are not a party to that transaction.',
        link: { label: 'Read the full disclaimer', href: '/disclaimer' },
      },
      {
        question: `How does ${site.name} make money?`,
        answer:
          'Some supplier links are affiliate links, so we may earn a commission when you buy through them. The commission is paid by the supplier, never changes the price you pay, and never changes how suppliers are ranked.',
      },
    ],
  },
  {
    title: 'Prices & comparisons',
    faqs: [
      {
        question: 'What does "cost per mg" mean?',
        answer:
          'It is the price you would pay divided by the total milligrams in the pack (mg per vial multiplied by the number of vials). It is the only fair way to compare a 5 mg vial against a 10 mg vial or a three-vial kit.',
        link: { label: 'Try the Price per MG calculator', href: '/tools/price-per-mg' },
      },
      {
        question: 'How current are the prices?',
        answer:
          'Every price carries the time it was last observed, and pages show how long ago that was. Prices older than 48 hours are clearly marked as possibly stale instead of being presented as current.',
      },
      {
        question: 'Why is the lowest price not always ranked first?',
        answer:
          'Out-of-stock listings are removed before ranking, so something you cannot actually buy never wins a "best price" comparison. Sale and list prices are also kept separate, and ranking uses the price you would pay.',
      },
      {
        question: 'Are coupon codes included in the prices shown?',
        answer:
          "Coupon codes are shown next to a supplier's listings so you can copy them, but the prices displayed are the supplier's listed prices. Always confirm the final total at checkout.",
      },
    ],
  },
  {
    title: 'Suppliers & lab testing',
    faqs: [
      {
        question: 'What information is shown for each supplier?',
        answer:
          'Supplier profiles bring together what is available for each vendor: lab verification status, published COAs, shipping details, payment methods, coupons and policies. A listing is not an endorsement, so review a supplier\'s COAs and policies before ordering.',
        link: { label: 'Read: choosing a research supplier', href: '/guides/choosing-a-research-supplier' },
      },
      {
        question: 'What is a COA and why does it matter?',
        answer:
          'A Certificate of Analysis is a lab report on a specific batch, usually covering identity and purity. The most important check is that the batch number on the COA matches the batch on your vial.',
        link: { label: 'Read: how to read a COA', href: '/guides/how-to-read-a-coa' },
      },
      {
        question: 'Can I suggest a supplier or report incorrect data?',
        answer:
          "Yes. Send us the supplier's website or the listing you believe is wrong through the contact page and we will review it.",
        link: { label: 'Contact us', href: '/contact' },
      },
    ],
  },
  {
    title: 'Research use',
    faqs: [
      {
        question: 'Are these products intended for human use?',
        answer:
          'Products referenced on this site are represented by their suppliers as intended for laboratory research use only, not for human or animal consumption. Statements on this site have not been evaluated by the FDA.',
      },
      {
        question: 'Do the calculators give dosing advice?',
        answer:
          'No. The calculators do arithmetic on the numbers you enter, such as vial size, diluent volume and target amount. They do not recommend doses and are not medical advice.',
        link: { label: 'See all tools', href: '/tools' },
      },
    ],
  },
  {
    title: 'Watchlist & community',
    faqs: [
      {
        question: 'Do I need an account?',
        answer: 'No. Browsing, comparing prices and every tool on the site are free and need no sign-up.',
      },
      {
        question: 'Where is my watchlist saved?',
        answer:
          "In your browser on this device. It is never sent to us, so it will not sync to another browser or device, and clearing your browser's site data removes it.",
        link: { label: 'Open your watchlist', href: '/watchlist' },
      },
      {
        question: 'Is there a community I can join?',
        answer:
          'Yes. Our Skool community is where researchers discuss protocols, compare verified suppliers and share notes.',
        link: { label: 'Join the community on Skool', href: SKOOL_URL },
      },
    ],
  },
];

function FaqLink({ link }: { link: NonNullable<Faq['link']> }) {
  const className = 'mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline';
  if (link.href.startsWith('http')) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
        <ExternalIcon className="h-3.5 w-3.5" />
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
      <ArrowRightIcon className="h-3.5 w-3.5" />
    </Link>
  );
}

export default async function FaqsPage() {
  const seo = await getSeoOverride(PAGE.path);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_GROUPS.flatMap((group) =>
      group.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    ),
  };

  return (
    <div className="relative overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-14">
        <section className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-strong">
            <BoltIcon className="h-3.5 w-3.5" />
            Help centre
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-content sm:text-5xl">
            {seo?.h1 ?? (
              <>
                Frequently asked <span className="italic text-brand">questions.</span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
            How prices are compared, what we do and don&rsquo;t do, and how to get the most out of {site.name}.
          </p>
        </section>

        <nav aria-label="FAQ topics" className="mt-10 flex flex-wrap justify-center gap-2">
          {FAQ_GROUPS.map((group, index) => (
            <a
              key={group.title}
              href={`#faq-group-${index}`}
              className="rounded-pill border border-line bg-surface-raised px-3.5 py-1.5 text-xs font-bold text-content transition-colors duration-150 hover:border-brand hover:bg-brand hover:text-surface"
            >
              {group.title}
            </a>
          ))}
        </nav>

        <div className="mt-12 space-y-12">
          {FAQ_GROUPS.map((group, index) => (
            <section key={group.title} id={`faq-group-${index}`} className="scroll-mt-24">
              <h2 className="text-micro font-bold uppercase text-faint">{group.title}</h2>
              <div className="mt-3 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface-raised">
                {group.faqs.map((faq) => (
                  // Native <details>: no client JavaScript, keyboard accessible, and the
                  // answers stay in the HTML for search engines.
                  <details key={faq.question} className="group/faq">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-bold text-content transition-colors duration-150 hover:bg-surface-sunken [&::-webkit-details-marker]:hidden">
                      {faq.question}
                      <ChevronDownIcon className="h-4 w-4 shrink-0 text-faint transition-transform duration-150 group-open/faq:rotate-180" />
                    </summary>
                    <div className="px-5 pb-5 text-sm leading-relaxed text-muted">
                      <p>{faq.answer}</p>
                      {faq.link ? <FaqLink link={faq.link} /> : null}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-14 rounded-card border border-brand/20 bg-brand-tint p-8 text-center">
          <h2 className="text-xl font-black text-content">Still have a question?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Send us a message and we&rsquo;ll get back to you, or ask other researchers in the community.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="btn-3d inline-flex items-center gap-2 rounded-chip bg-brand px-6 py-3 text-sm font-bold text-white"
            >
              Contact us
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a
              href={SKOOL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-chip border border-line bg-surface px-6 py-3 text-sm font-bold text-content transition-colors duration-150 hover:border-brand"
            >
              Join on Skool
              <ExternalIcon className="h-4 w-4" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
