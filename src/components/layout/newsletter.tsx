'use client';

import { useState, type FormEvent } from 'react';

/**
 * Posts to our own API route. No third-party script, and no address is stored
 * client-side. The route is a stub until a mailing provider is configured.
 */
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error(`Subscribe failed: ${response.status}`);
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  }

  return (
    <section className="mx-auto max-w-shell px-4 py-12">
      <div className="rounded-card border border-line bg-surface-raised p-8 text-center">
        <p className="text-micro font-bold uppercase text-brand">Stay updated</p>
        <h2 className="mt-2 text-2xl font-black text-content">Join the Inner Circle</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          Get notified about new lab results, price drops and supplier coupons before everyone else.
        </p>

        <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
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
            className="min-w-0 flex-1 rounded-chip border border-line bg-surface px-4 py-3 text-sm text-content placeholder:text-faint"
          />
          <button
            type="submit"
            disabled={state === 'sending'}
            className="rounded-chip bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-strong disabled:opacity-60"
          >
            {state === 'sending' ? 'Joining…' : 'Join Now'}
          </button>
        </form>

        <p aria-live="polite" className="mt-3 text-xs">
          {state === 'done' ? (
            <span className="font-semibold text-brand-strong">You are on the list.</span>
          ) : state === 'error' ? (
            <span className="font-semibold text-danger">
              Could not subscribe just now. Please try again.
            </span>
          ) : (
            <span className="uppercase text-faint">We respect your privacy. No spam.</span>
          )}
        </p>
      </div>
    </section>
  );
}
