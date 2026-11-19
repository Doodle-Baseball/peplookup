import { LISTED_PLAN_ID, formatPlanPrice, vendorListingPlan } from '@/config/vendor-listing';

/** Three numbered steps joined by a line, matching the three steps of the form below. */
export function ListingHowItWorks() {
  const price = formatPlanPrice(vendorListingPlan(LISTED_PLAN_ID));
  const steps = [
    {
      title: 'Tell us about your brand',
      body: 'Your website, affiliate sign-up link, COA page, and the commission and customer discount you offer.',
    },
    {
      title: `Send ${price} by Bitcoin or PayPal`,
      body: 'We show you exactly where to send it. Upload a screenshot of the payment when it’s done.',
    },
    {
      title: 'We confirm and go live',
      body: 'Our team verifies the payment, then publishes your listing within one business day.',
    },
  ];

  return (
    <section aria-labelledby="how-heading">
      <h2 data-reveal id="how-heading" className="text-center text-2xl font-black tracking-tight text-content sm:text-4xl">
        How it works
      </h2>
      <ol className="mt-10 grid gap-12 md:grid-cols-3 md:gap-0">
        {steps.map((step, index) => (
          <li key={step.title} data-reveal data-reveal-delay={index * 150} className="group relative px-3 text-center">
            {/* Joins this step's number to the next one's; with no column gap, a full column width lands exactly on its centre. */}
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                data-reveal="line"
                data-reveal-delay={300 + index * 150}
                className="absolute left-1/2 top-8 hidden h-px w-full bg-gradient-to-r from-accent/40 via-line to-accent/40 md:block"
              />
            ) : null}
            <span className="listing-step-glow relative mx-auto flex h-16 w-16 items-center justify-center rounded-card bg-accent text-2xl font-black text-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-3">
              {index + 1}
            </span>
            <h3 className="mt-6 text-lg font-black text-content">{step.title}</h3>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted sm:text-base">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
