'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRightIcon } from '@/components/icons/icons';

const WEB3FORMS_ACCESS_KEY = 'ee118fde-8201-4c9f-8174-f0895772887d';

/**
 * Sends signups to Web3Forms straight from the browser. It has to be
 * client-side: Web3Forms sits behind Cloudflare, which answers server-side
 * requests (e.g. from an API route) with a 403 challenge page.
 */
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'PepLookup newsletter signup',
          from_name: 'PepLookup Website',
          email,
          message: `Newsletter signup request from ${email}`,
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      const succeeded =
        response.ok && typeof result === 'object' && result !== null && 'success' in result && result.success === true;
      if (!succeeded) throw new Error(`Web3Forms rejected the signup (HTTP ${response.status})`);
      setState('done');
      setEmail('');
    } catch (error) {
      console.error(error);
      setState('error');
    }
  }

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
          <p className="eyebrow">Newsletter · Quarterly</p>
          <h2 className="mt-5 text-[clamp(2.5rem,8vw,5rem)] font-black leading-[0.95] text-white">
            Join the Inner Circle.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-white/60">
            Get notified about new lab results, price drops and supplier coupons before everyone else.
          </p>

          <form
            onSubmit={submit}
            className="mx-auto mt-8 flex max-w-lg flex-col gap-2 rounded-card border border-white/10 sm:rounded-pill bg-white/5 p-2 sm:flex-row sm:items-center"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-pill bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              disabled={state === 'sending'}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-pill bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-content transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
            >
              {state === 'sending' ? 'Joining…' : 'Join Now'}
              {state === 'sending' ? null : <ArrowRightIcon className="h-4 w-4" />}
            </button>
          </form>

          <p aria-live="polite" className="mt-4 text-xs">
            {state === 'done' ? (
              <span className="font-semibold text-ok">You are on the list.</span>
            ) : state === 'error' ? (
              <span className="font-semibold text-danger">
                Could not subscribe just now. Please try again.
              </span>
            ) : (
              <span className="uppercase tracking-wide text-white/40">We respect your privacy. No spam.</span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
