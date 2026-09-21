import type { Metadata } from 'next';
import { site, whatsappUrl } from '@/config/site';
import { staticSeoPage } from '@/config/seo-pages';
import { pageMetadata } from '@/lib/seo-defaults';
import { getSeoOverride, withSeo } from '@/lib/seo';
import { ExternalIcon, GlobeIcon } from '@/components/icons/icons';

const PAGE = staticSeoPage('/contact');

export async function generateMetadata(): Promise<Metadata> {
  return withSeo(PAGE.path, pageMetadata(PAGE));
}

const inputClass =
  'mt-1.5 w-full rounded-chip border border-line bg-surface px-4 py-2.5 text-sm text-content outline-none transition-colors placeholder:text-faint focus:border-brand';

export default async function ContactPage() {
  const seo = await getSeoOverride(PAGE.path);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-black text-content sm:text-4xl">{seo?.h1 || 'Contact Us'}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Questions, pricing corrections or partnership enquiries? Send us a message and we&rsquo;ll get back to you.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        {/* Posts straight to Web3Forms, so the form works without JavaScript. */}
        <form
          action="https://api.web3forms.com/submit"
          method="POST"
          className="space-y-5 rounded-card border border-line bg-surface-raised p-5 sm:p-6"
        >
          <input type="hidden" name="access_key" value="ee118fde-8201-4c9f-8174-f0895772887d" />
          <input type="hidden" name="subject" value={`New contact message from ${site.name}`} />
          <input type="hidden" name="from_name" value={`${site.name} Website`} />
          {/* Honeypot: people never see or tick it, spam bots do. */}
          <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" />

          <div>
            <label htmlFor="contact-name" className="text-sm font-semibold text-content">
              Name
            </label>
            <input id="contact-name" name="name" type="text" required autoComplete="name" className={inputClass} />
          </div>

          <div>
            <label htmlFor="contact-email" className="text-sm font-semibold text-content">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="text-sm font-semibold text-content">
              Message
            </label>
            <textarea id="contact-message" name="message" required rows={6} className={inputClass} />
          </div>

          <button
            type="submit"
            className="rounded-chip bg-brand px-6 py-2.5 text-sm font-bold text-surface transition-colors hover:bg-brand-strong"
          >
            Send message
          </button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-card border border-line bg-surface-raised p-5 sm:p-6">
            <h2 className="text-sm font-black uppercase tracking-wide text-content">Email us directly</h2>
            <a
              href={`mailto:${site.contactEmail}`}
              className="mt-2 inline-block break-all text-sm font-semibold text-brand hover:underline"
            >
              {site.contactEmail}
            </a>
          </div>

          <div className="rounded-card border border-line bg-surface-raised p-5 sm:p-6">
            <h2 className="text-sm font-black uppercase tracking-wide text-content">Message us on WhatsApp</h2>
            <p className="mt-1.5 text-sm text-muted">
              Quickest route for a listing correction or a partnership question.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              {site.whatsapp}
              <ExternalIcon className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="rounded-card border border-brand/20 bg-brand-tint p-5 sm:p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-brand text-white">
              <GlobeIcon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-sm font-black uppercase tracking-wide text-content">
              Join the research community
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Talk protocols and verified suppliers with other researchers in our Skool community.
            </p>
            <a
              href="https://www.skool.com/peptide-5115/about"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
            >
              Join on Skool
              <ExternalIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
