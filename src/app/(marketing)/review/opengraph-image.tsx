import { ImageResponse } from 'next/og';
import { site } from '@/config/site';

export const alt = `Peptide supplier and company reviews on ${site.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
// The Node build of the image renderer can't load its bundled font on Windows; the edge build can, everywhere.
export const runtime = 'edge';

/**
 * The image shown when /reviews is shared on X, Skool and the like. Text only,
 * in the site's colours, and no figures that could go stale between deploys.
 */
export default function ReviewsOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'rgb(246 245 245)',
          color: 'rgb(13 13 13)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: 999,
              background: 'rgb(236 244 239)',
              color: 'rgb(27 77 54)',
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            Reviews
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2 }}>
            Peptide Supplier &amp; Company Reviews
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: 'rgb(106 106 100)', lineHeight: 1.3 }}>
            Honest, independent ratings, trusted vendors and COA-verified suppliers.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 900 }}>
            Pep<span style={{ color: 'rgb(45 106 79)' }}>Lookup</span>
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: 'rgb(106 106 100)' }}>{`${site.domain}/reviews`}</div>
        </div>
      </div>
    ),
    size,
  );
}
