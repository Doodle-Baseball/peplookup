import { site } from '@/config/site';
import { ArrowRightIcon, SearchIcon, StarIcon } from '@/components/icons/icons';

/** The query the step-1 search box types out. Its length drives the typing animation. */
const SEARCH_QUERY = 'best price per mg';

function JourneyCard({ step, art, title, body }: { step: number; art: React.ReactNode; title: string; body: string }) {
  return (
    <li data-reveal="zoom" data-reveal-delay={(step - 1) * 120} className="card-3d group rounded-panel border border-line bg-surface-raised p-6 sm:p-7">
      <div aria-hidden="true" className="card-3d-layer flex h-40 flex-col items-center justify-center rounded-card bg-accent-tint px-5">
        {art}
      </div>
      <p className="eyebrow mt-7 text-accent">Step {step}</p>
      <h3 className="mt-2 text-base font-bold text-content">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </li>
  );
}

function SearchArt() {
  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center gap-2.5 rounded-pill border border-line bg-surface-raised px-4 py-2.5 shadow-card">
        <SearchIcon className="h-4 w-4 shrink-0 text-accent" />
        <span
          className="animate-listing-type font-mono text-sm text-content"
          style={{ '--chars': SEARCH_QUERY.length } as React.CSSProperties}
        >
          {SEARCH_QUERY}
        </span>
        <span className="animate-listing-caret -ml-1.5 h-4 w-0.5 bg-accent" />
      </div>
      <span className="mt-3 block h-2 w-3/4 rounded-pill bg-line" />
      <span className="mt-2 block h-2 w-1/2 rounded-pill bg-line" />
    </div>
  );
}

function ProfileArt() {
  return (
    <div className="w-full max-w-xs rounded-card border border-line bg-surface-raised p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-content">Your Brand</span>
        <span className="flex gap-0.5 text-rating">
          {[0, 1, 2, 3, 4].map((star) => (
            <StarIcon key={star} className="h-3.5 w-3.5" />
          ))}
        </span>
      </div>
      <p className="mt-1 font-mono text-micro font-bold uppercase text-accent">Featured supplier</p>
      <span className="mt-3 block h-1.5 w-full rounded-pill bg-line" />
      <span className="mt-2 block h-1.5 w-2/3 rounded-pill bg-line" />
    </div>
  );
}

function ClickArt() {
  return (
    <div className="relative">
      <span className="animate-listing-press inline-flex items-center gap-2 rounded-pill bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-lift">
        Visit Your Brand
        <ArrowRightIcon className="h-4 w-4" />
      </span>
      {/* A pointer that glides onto the button and presses it. */}
      <svg
        viewBox="0 0 24 24"
        className="animate-listing-pointer absolute -bottom-5 right-2 h-6 w-6 text-content drop-shadow"
        fill="white"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      >
        <path d="M4 3l16 7-7 2.5L10.5 20z" />
      </svg>
    </div>
  );
}

/** "What happens when your brand is listed": the buyer's path from search to the brand's store. */
export function ListingJourney() {
  return (
    <section aria-labelledby="journey-heading" className="py-4 sm:py-8">
      <div data-reveal className="text-center">
        <p className="eyebrow text-accent">How {site.name} works</p>
        <h2 id="journey-heading" className="mx-auto mt-3 max-w-2xl text-xl font-bold leading-snug tracking-tight text-content sm:text-3xl">
          Help Researchers <span className="text-accent">Discover and Compare</span> Your Brand
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Researchers compare suppliers by looking at{' '}
          <span className="font-semibold text-content">product details, prices, laboratory reports, and company information</span>.
          A {site.name} listing puts your brand alongside these details, helping visitors{' '}
          <span className="font-semibold text-accent">discover your products</span> and{' '}
          <span className="font-semibold text-accent">visit your website directly</span>.
        </p>
      </div>

      <ol className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
        <JourneyCard
          step={1}
          title="A buyer compares suppliers"
          body="They look for the best cost per mg on a compound, and for suppliers with published COAs."
          art={<SearchArt />}
        />
        <JourneyCard
          step={2}
          title={`They find your brand on ${site.name}`}
          body="Your products sit in the comparison next to other suppliers, linked to your brand page and COAs."
          art={<ProfileArt />}
        />
        <JourneyCard
          step={3}
          title="They click through to you"
          body="Your backlink sends them straight to your website, ready to buy."
          art={<ClickArt />}
        />
      </ol>

      <div data-reveal className="mt-10 flex flex-col gap-5 rounded-panel border border-accent/20 bg-accent-tint p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-accent text-white shadow-lift">
          <StarIcon className="h-6 w-6" />
        </span>
        <div>
          <h3 className="text-base font-bold text-content">We compare your brand honestly</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Paying gets you listed, not a better position. Prices are compared by cost per mg exactly as published,
            and rankings are by price and quality, never by payment. That honesty is why readers trust what they
            click.
          </p>
        </div>
      </div>
    </section>
  );
}
