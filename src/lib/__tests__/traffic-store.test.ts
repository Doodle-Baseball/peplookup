import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  suppliersSelect: vi.fn(),
  insert: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({
    from: (table: string) =>
      table === 'suppliers' ? { select: mocks.suppliersSelect } : { insert: mocks.insert },
  }),
}));

const suppliersRows = [
  { slug: 'acme', name: 'Acme Peptides', homepage_url: 'https://www.acme.com', affiliate_url: 'https://acme.com/?ref=pep' },
];

/** A new copy of the store, so each case starts with an empty vendor index. */
async function freshStore() {
  vi.resetModules();
  return import('../traffic/store');
}

beforeEach(() => {
  mocks.suppliersSelect.mockReset().mockResolvedValue({ data: suppliersRows, error: null });
  mocks.insert.mockReset().mockResolvedValue({ error: null });
});

describe('recordOutboundClick', () => {
  it('writes one row per click and credits it to the vendor that owns the host', async () => {
    const { recordOutboundClick } = await freshStore();

    expect(await recordOutboundClick({ url: 'https://acme.com/?ref=pep', path: '/suppliers/acme' })).toBe(true);

    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(mocks.insert).toHaveBeenCalledWith({
      url: 'https://acme.com/?ref=pep',
      host: 'acme.com',
      vendor_slug: 'acme',
      vendor_name: 'Acme Peptides',
      source_path: '/suppliers/acme',
    });
  });

  it('records a click on an unknown website without a vendor', async () => {
    const { recordOutboundClick } = await freshStore();

    await recordOutboundClick({ url: 'https://wa.me/12602181154' });

    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'wa.me', vendor_slug: null, vendor_name: null, source_path: null }),
    );
  });

  it('reads the suppliers once for clicks that arrive together, and records every one of them', async () => {
    const { recordOutboundClick } = await freshStore();

    await Promise.all(
      Array.from({ length: 5 }, (_, index) => recordOutboundClick({ url: `https://acme.com/?click=${index}` })),
    );

    expect(mocks.suppliersSelect).toHaveBeenCalledTimes(1);
    expect(mocks.insert).toHaveBeenCalledTimes(5);
    for (const [row] of mocks.insert.mock.calls) expect(row).toMatchObject({ vendor_slug: 'acme' });
  });

  it('keeps reusing the vendor index for later clicks', async () => {
    const { recordOutboundClick } = await freshStore();

    await recordOutboundClick({ url: 'https://acme.com/a' });
    await recordOutboundClick({ url: 'https://acme.com/b' });

    expect(mocks.suppliersSelect).toHaveBeenCalledTimes(1);
  });

  it('still records the click, unattributed, when the suppliers cannot be read, and asks again on the next click', async () => {
    const { recordOutboundClick } = await freshStore();
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.suppliersSelect.mockResolvedValueOnce({ data: null, error: { message: 'connection reset' } });

    await recordOutboundClick({ url: 'https://acme.com/a' });
    expect(mocks.insert).toHaveBeenLastCalledWith(expect.objectContaining({ vendor_slug: null }));

    await recordOutboundClick({ url: 'https://acme.com/b' });
    expect(mocks.suppliersSelect).toHaveBeenCalledTimes(2);
    expect(mocks.insert).toHaveBeenLastCalledWith(expect.objectContaining({ vendor_slug: 'acme' }));
    logged.mockRestore();
  });

  it('ignores links to our own site and non-web schemes without touching the database', async () => {
    const { recordOutboundClick } = await freshStore();

    expect(await recordOutboundClick({ url: 'https://peplookup.com/suppliers' })).toBe(false);
    expect(await recordOutboundClick({ url: 'mailto:hello@acme.com' })).toBe(false);
    expect(await recordOutboundClick({ url: 'not a url' })).toBe(false);

    expect(mocks.suppliersSelect).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
