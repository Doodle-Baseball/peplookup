import type { Metadata } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { site } from '@/config/site';
import { LoadingScreen } from '@/components/layout/loading-screen';
import { NavigationProgress } from '@/components/layout/navigation-progress';

/**
 * Self-hosted at build time rather than fetched from fonts.googleapis.com: a
 * cross-origin stylesheet in <head> blocks first paint on two extra DNS +
 * TLS handshakes before a single glyph is requested. next/font emits the
 * @font-face rules inline and serves the files from our own origin.
 */
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

/** Backs .eyebrow / .font-mono, the theme's uppercase label type. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: `${site.name} | Compare Peptide Prices by Cost per mg`, template: `%s | ${site.name}` },
  description: site.description,
  metadataBase: new URL(`https://${site.domain}`),
  // Name only: a `url` here makes Next emit <link rel="author" href="…"> as well.
  authors: [{ name: site.publisher }],
  creator: site.publisher,
  publisher: site.publisher,
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

/** Site-wide structured data naming the author and publisher of every page. */
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `https://${site.domain}/#organization`,
      name: site.publisher,
      url: `https://${site.domain}`,
      logo: `https://${site.domain}/favicon.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `https://${site.domain}/#website`,
      name: site.name,
      url: `https://${site.domain}`,
      description: site.description,
      author: { '@type': 'Organization', name: site.publisher },
      publisher: { '@id': `https://${site.domain}/#organization` },
    },
  ],
};

/** Google Analytics 4 measurement ID. Public by design: it ships to every visitor's browser. */
const GA_MEASUREMENT_ID = 'G-CTRYVJ794V';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <NavigationProgress />
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
