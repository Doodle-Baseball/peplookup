/**
 * Shared decorative background: a fine, even dot grid (the clean "data
 * surface" texture common to professional SaaS heroes) plus soft accent-colour
 * washes that drift very slowly. No external image, nothing to fail to load,
 * nothing to license. The parent needs `relative isolate` so this can sit
 * behind its content with a negative z-index.
 */
export function PatternBackdrop({ mask }: { mask?: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="dot-grid absolute inset-0" style={{ maskImage: mask, WebkitMaskImage: mask }} />
      {/* Positioning and drift live on separate elements: the drift animation
          sets `transform`, which would otherwise wipe out the centring. */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <div className="animate-drift h-[28rem] w-[60rem] rounded-full bg-accent/10 blur-[120px]" />
      </div>
      <div className="absolute -right-24 top-24">
        <div className="animate-drift-reverse h-72 w-72 rounded-full bg-brand/5 blur-3xl" />
      </div>
      <div className="absolute -left-24 top-0">
        <div className="animate-drift h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>
    </div>
  );
}
