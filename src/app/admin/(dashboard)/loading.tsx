/**
 * Admin equivalent of the marketing loading state. Admin routes are all
 * dynamically rendered and read straight from Supabase, so they are the ones
 * where a click previously sat with no feedback at all.
 */
export default function AdminLoading() {
  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8" role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>

      <div aria-hidden="true" className="animate-pulse">
        <div className="h-8 w-48 rounded-card bg-surface-sunken" />

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((tile) => (
            <div key={tile} className="h-20 rounded-card border border-line bg-surface-sunken" />
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-16 rounded-card border border-line bg-surface-sunken" />
          ))}
        </div>
      </div>
    </div>
  );
}
