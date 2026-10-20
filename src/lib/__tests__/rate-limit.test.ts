import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '../rate-limit';

describe('createRateLimiter', () => {
  it('allows up to the limit per key within the window, then refuses', () => {
    let time = 0;
    const allow = createRateLimiter({ limit: 3, windowMs: 1000, now: () => time });
    expect([allow('a'), allow('a'), allow('a'), allow('a')]).toEqual([true, true, true, false]);
    expect(allow('b')).toBe(true);
    time = 999;
    expect(allow('a')).toBe(false);
  });

  it('starts a fresh window once the old one has passed', () => {
    let time = 0;
    const allow = createRateLimiter({ limit: 1, windowMs: 1000, now: () => time });
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(false);
    time = 1000;
    expect(allow('a')).toBe(true);
  });

  it('forgets every key rather than growing past maxKeys', () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2, now: () => 0 });
    allow('a');
    allow('b');
    // The table is full, so it is cleared and "a" starts over.
    expect(allow('a')).toBe(true);
  });
});
