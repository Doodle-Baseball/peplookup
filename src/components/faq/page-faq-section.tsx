import { getFaqsForPath } from '@/lib/page-faqs';
import type { FaqItem } from '@/data/default-page-faqs';
import { ChevronDownIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';

/** Matches the panel treatment the compound page uses for this section. */
const PANEL_CLASS = 'rounded-panel border border-line bg-surface-raised shadow-card';

/**
 * FAQ block for any page, in the compound page's design.
 *
 * Reads whatever is saved for `path` in /admin/seo, falling back to the
 * built-in defaults, and emits matching FAQPage structured data alongside it.
 * Renders nothing at all when a page has no questions, so an empty set in the
 * admin removes both the section and its schema.
 */
export async function PageFaqSection({
  path,
  className,
  /**
   * Set false on a page that already emits its own FAQPage schema, so the two
   * don't both claim the same URL. The visible section still renders.
   */
  includeSchema = true,
}: {
  path: string;
  className?: string;
  includeSchema?: boolean;
}) {
  const faqs = await getFaqsForPath(path);
  if (faqs.length === 0) return null;

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className={cn(PANEL_CLASS, 'scroll-mt-24 p-5 sm:p-8', className)}
    >
      {includeSchema ? <FaqJsonLd faqs={faqs} /> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
        <div>
          <p className="eyebrow">Questions</p>
          {/* leading-[1.05] rather than leading-none: this heading wraps to two
              or three lines on a phone and at line-height 1 those lines touch. */}
          <h2
            id="faq-heading"
            className="mt-3 text-[clamp(1.75rem,7vw,3rem)] font-black leading-[1.05] text-content"
          >
            Frequently asked <span className="italic text-accent">questions.</span>
          </h2>
        </div>

        <div className="space-y-3 lg:col-span-2">
          {faqs.map((item, index) => (
            <details
              key={`${index}-${item.question}`}
              open={index === 0}
              className="group rounded-card border border-line bg-surface transition-shadow open:bg-surface-raised open:shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-left text-base font-bold text-content sm:p-5 sm:text-lg">
                <span>{item.question}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border border-line bg-surface-raised text-content transition-all group-open:rotate-180 group-open:border-brand group-open:bg-brand group-open:text-surface">
                  <ChevronDownIcon className="h-4 w-4" />
                </span>
              </summary>
              <div className="whitespace-pre-line border-t border-line px-4 pb-4 pt-3 text-sm leading-7 text-muted sm:px-5 sm:pb-5 sm:text-base">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** FAQPage structured data for the questions actually rendered above it. */
export function FaqJsonLd({ faqs }: { faqs: readonly FaqItem[] }) {
  if (faqs.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
