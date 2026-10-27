// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { GuideMarkdown } from '../guide-markdown';

const sponsored = new Set(['primepepsolutions.com']);

afterEach(cleanup);

function renderMarkdown(source: string) {
  return render(<GuideMarkdown source={source} sponsoredHosts={sponsored} />);
}

describe('GuideMarkdown', () => {
  it('renders bold, italic and both list types', () => {
    renderMarkdown('**Rx only** and *room temperature*\n\n- one\n- two\n\n1. first\n2. second');
    expect(screen.getByText('Rx only').tagName).toBe('STRONG');
    expect(screen.getByText('room temperature').tagName).toBe('EM');
    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('renders a table with column headers', () => {
    renderMarkdown('| Pack | Price |\n|---|---|\n| 1 vial | $22.99 |');
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Pack' }).getAttribute('scope')).toBe('col');
    expect(screen.getByRole('cell', { name: '$22.99' })).toBeTruthy();
  });

  it('opens internal links in the same tab and external ones in a new tab', () => {
    renderMarkdown('[calculator](/tools/calculator) and [label](https://labeling.pfizer.com/x)');
    const internal = screen.getByRole('link', { name: 'calculator' });
    expect(internal.getAttribute('target')).toBeNull();
    const external = screen.getByRole('link', { name: /label/ });
    expect(external.getAttribute('target')).toBe('_blank');
    expect(external.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('marks supplier links sponsored', () => {
    renderMarkdown('[shop](https://www.primepepsolutions.com/bac-water)');
    expect(screen.getByRole('link', { name: /shop/ }).getAttribute('rel')).toBe('sponsored nofollow noopener noreferrer');
  });

  it('drops raw HTML, scripts, javascript: links and headings', () => {
    const { container } = renderMarkdown(
      '<script>alert(1)</script>\n\n<b onclick="x()">raw</b>\n\n[bad](javascript:alert(1))\n\n# Not a second H1',
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('[onclick]')).toBeNull();
    expect(container.querySelector('h1')).toBeNull();
    expect(screen.getByText('Not a second H1')).toBeTruthy();
    const bad = screen.getByText('bad').closest('a');
    expect(bad?.getAttribute('href') ?? '').not.toMatch(/javascript/i);
  });
});
