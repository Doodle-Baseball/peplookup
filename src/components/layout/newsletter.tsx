import { ArrowRightIcon } from '@/components/icons/icons';
import { site } from '@/config/site';

/**
 * Closing call-to-action on every marketing page. It promotes the free Skool
 * community; the old email signup (Web3Forms) was removed with it, so there is
 * nothing to submit and no client-side state.
 */
export function Newsletter() {
  return (
    // `mx-100` is a fixed 100px gutter from the custom spacing scale, which
    // left a phone with barely half its width. Scaled by breakpoint instead.
    <section className="reveal mx-4 py-12 sm:mx-8 lg:mx-100">
      <div className="panel-dark relative overflow-hidden rounded-panel shadow-panel">
        {/* Soft radial glow sweeping from the bottom-right, the only depth
            cue on an otherwise flat near-black card. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.1),_transparent_60%)]"
        />

        <div className="relative px-5 py-12 text-center sm:p-14 lg:py-20">
          <p className="eyebrow">PepLookup Community · Hosted on Skool</p>
          <h2 className="mt-5 text-[clamp(2.5rem,8vw,5rem)] font-black leading-[0.95] text-white">
            Join the Community.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-7 text-white/60">
            A free forum for researchers to learn peptide science, interpret certificates of analysis, review published
            studies and compare verified suppliers.
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href={site.communityUrl}
              target="_blank"
              rel="nofollow noopener"
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-pill bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-content transition-transform hover:-translate-y-0.5"
            >
              Join Free on Skool
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
