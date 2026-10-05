// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OutboundLinkTracker } from '../outbound-link-tracker';

describe('OutboundLinkTracker', () => {
  const sendBeacon = vi.fn(() => true);

  beforeEach(() => {
    sendBeacon.mockClear();
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });
    window.history.pushState({}, '', '/suppliers/acme');
    render(
      <>
        <OutboundLinkTracker />
        <a href="https://acme.com/?ref=pep">vendor</a>
        <a href="/products">internal</a>
        <a href="https://www.peplookup.com/guides">own site</a>
        <a href="mailto:info@peplookup.com">mail</a>
        <a href="/go?to=https%3A%2F%2Facme.com%2Fp">shop</a>
        <a href="https://acme.com/shop"><span>nested</span></a>
      </>,
    );
  });

  afterEach(cleanup);

  function sentPayload() {
    const blob = (sendBeacon.mock.calls[0] as unknown as [string, Blob])[1];
    return blob.text().then((text) => JSON.parse(text) as { url: string; path: string });
  }

  it('reports the exact link and the page it was clicked from', async () => {
    fireEvent.click(screen.getByText('vendor'));
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(await sentPayload()).toEqual({ url: 'https://acme.com/?ref=pep', path: '/suppliers/acme' });
  });

  it('reports a /go redirect link as the vendor URL it leads to', async () => {
    fireEvent.click(screen.getByText('shop'));
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(await sentPayload()).toEqual({ url: 'https://acme.com/p', path: '/suppliers/acme' });
  });

  it('reports clicks on elements nested inside a link', () => {
    fireEvent.click(screen.getByText('nested'));
    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });

  it('reports a middle-click, which opens the destination in a new tab', () => {
    fireEvent(screen.getByText('vendor'), new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });

  it('ignores internal links, our own domain and mailto links', () => {
    fireEvent.click(screen.getByText('internal'));
    fireEvent.click(screen.getByText('own site'));
    fireEvent.click(screen.getByText('mail'));
    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it('does not track clicks made inside the admin dashboard', () => {
    window.history.pushState({}, '', '/admin/vendor-listing');
    fireEvent.click(screen.getByText('vendor'));
    expect(sendBeacon).not.toHaveBeenCalled();
  });
});
