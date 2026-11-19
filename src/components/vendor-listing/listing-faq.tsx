import { getFaqsForPath } from '@/lib/page-faqs';
import { getIndexDecision } from '@/lib/seo';
import { FaqJsonLd } from '@/components/faq/page-faq-section';

/**
 * The listing page's questions as one bordered list with a plus that turns
 * into a cross when open. Same source as every other page's FAQ (saved in
 * /admin/seo, else the built-in defaults) and the same structured-data rule:
 * none on a noindex page.
 */
export async function ListingFaq({ path }: { path: string }) {
  const [faqs, decision] = await Promise.all([getFaqsForPath(path), getIndexDecision(path)]);
  if (faqs.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="faq-heading" className="mx-auto max-w-4xl scroll-mt-24">
      {decision.indexable ? <FaqJsonLd faqs={faqs} /> : null}
      <h2 id="faq-heading" className="text-center text-2xl font-black tracking-tight text-content sm:text-4xl">
        Questions
      </h2>

      <div className="mt-8 divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface-raised shadow-card">
        {faqs.map((item, index) => (
          <details key={`${index}-${item.question}`} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-left text-base font-bold text-content transition-colors hover:bg-accent-tint focus-visible:bg-accent-tint sm:px-8 sm:py-6 sm:text-lg">
              <span>{item.question}</span>
              <span
                aria-hidden="true"
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-accent transition-all duration-300 group-open:rotate-45 group-open:bg-accent group-open:text-white"
              >
                <span className="absolute h-0.5 w-3.5 rounded-pill bg-current" />
                <span className="absolute h-3.5 w-0.5 rounded-pill bg-current" />
              </span>
            </summary>
            <div className="whitespace-pre-line px-6 pb-6 text-sm leading-7 text-muted sm:px-8 sm:text-base">{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
