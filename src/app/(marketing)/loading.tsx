/**
 * Shown the moment a link is clicked, while the next page's server components
 * are still running. Without a loading file Next.js has nothing to render in
 * that window, so a click on a slow route looked like nothing had happened.
 *
 * It also raises the value of link prefetching: for dynamically rendered
 * routes Next prefetches the loading state, so this is what appears instantly
 * rather than a stalled page.
 */
export default function MarketingLoading() {
  return (
    <div className="mx-auto max-w-shell px-4 py-12" role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>

      <div aria-hidden="true" className="animate-pulse">
        <div className="mx-auto h-7 w-40 rounded-pill bg-surface-sunken" />
        <div className="mx-auto mt-5 h-10 w-3/4 rounded-card bg-surface-sunken sm:h-14" />
        <div className="mx-auto mt-4 h-4 w-2/3 rounded-pill bg-surface-sunken" />

        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((card) => (
            <li key={card} className="h-64 rounded-card border border-line bg-surface-sunken" />
          ))}
        </ul>
      </div>
    </div>
  );
}
