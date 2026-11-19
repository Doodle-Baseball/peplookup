import { site } from '@/config/site';
import { CheckBadgeIcon, StarIcon, StoreIcon } from '@/components/icons/icons';
import { cn } from '@/lib/cn';

function BenefitCard({
  art,
  title,
  body,
  index,
  raised = false,
}: {
  art: React.ReactNode;
  title: string;
  body: string;
  index: number;
  /** The middle card sits a little higher, as the one the row centres on. */
  raised?: boolean;
}) {
  return (
    <article
      data-reveal="zoom"
      data-reveal-delay={index * 120}
      className={cn(
        'card-3d rounded-panel border bg-surface-raised p-6 sm:p-7',
        raised ? 'border-accent/30 shadow-lift md:relative md:-top-3' : 'border-line',
      )}
    >
      <div aria-hidden="true" className="card-3d-layer flex h-40 items-center justify-center rounded-card bg-accent-tint">
        {art}
      </div>
      <h3 className="mt-7 text-base font-bold text-content">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}

/** Bars of different heights with the last one, "yours", in the accent colour. Purely illustrative. */
function ComparisonArt() {
  const heights = ['h-4', 'h-7', 'h-6', 'h-10', 'h-9', 'h-14', 'h-20'];
  return (
    <div className="flex items-end gap-2">
      {heights.map((height, index) => (
        <span
          key={height + index}
          className={`animate-listing-grow w-5 rounded-t-md ${height} ${index === heights.length - 1 ? 'bg-accent' : 'bg-accent-soft'}`}
          style={{ animationDelay: `${index * 80}ms` }}
        />
      ))}
    </div>
  );
}

function BacklinkArt() {
  return (
    <div className="flex items-center gap-1">
      <span className="rounded-chip border border-accent/30 bg-accent-tint px-3 py-2 font-mono text-xs font-black text-accent-strong">PL</span>
      <svg width="96" height="24" viewBox="0 0 96 24" fill="none" className="text-accent">
        <path d="M2 12 C 30 -4, 66 28, 94 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 6" className="animate-listing-dash" />
      </svg>
      <span className="rounded-chip bg-brand px-3 py-2 font-mono text-xs font-black text-white shadow-lift">YOU</span>
    </div>
  );
}

function ProfileArt() {
  return (
    <div className="w-48 rounded-card border border-line bg-surface-raised p-3 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-chip bg-accent-soft text-accent-strong">
          <StoreIcon className="h-4 w-4" />
        </span>
        <span className="text-xs font-black text-content">Your Brand</span>
        <CheckBadgeIcon className="ml-auto h-4 w-4 text-accent" />
      </div>
      <div className="mt-3 space-y-1.5">
        <span className="block h-1.5 w-full rounded-pill bg-line" />
        <span className="block h-1.5 w-3/4 rounded-pill bg-line" />
      </div>
      <div className="mt-3 flex gap-1 text-rating">
        {[0, 1, 2, 3, 4].map((star) => (
          <StarIcon key={star} className="h-3 w-3" />
        ))}
      </div>
    </div>
  );
}

/** "What you get": the three things a listing gives a brand. */
export function ListingBenefits() {
  return (
    <section aria-labelledby="benefits-heading" className="py-4 sm:py-8">
      <div data-reveal className="text-center">
        <p className="eyebrow text-accent">What you get</p>
        <h2 id="benefits-heading" className="mx-auto mt-3 max-w-2xl text-xl font-bold leading-snug tracking-tight text-content sm:text-3xl">
          Why promote <span className="text-accent">your peptide brand</span> on {site.name}
        </h2>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
        <BenefitCard
          index={0}
          art={<ProfileArt />}
          title="A dedicated brand page"
          body="Your company information, products, COAs and website link on one page buyers can check before they order."
        />
        <BenefitCard
          index={1}
          raised
          art={<BacklinkArt />}
          title="A backlink to your brand"
          body={`A link from ${site.name} to your website, placed on your brand page so readers can click straight through to your store.`}
        />
        <BenefitCard
          index={2}
          art={<ComparisonArt />}
          title="Compared where buyers decide"
          body="Your products appear in our price-comparison directory, normalised to cost per mg next to other suppliers."
        />
      </div>
    </section>
  );
}
