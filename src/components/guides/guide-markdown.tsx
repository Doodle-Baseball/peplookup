import Link from 'next/link';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { classifyGuideLink } from '@/lib/guide-links';

/**
 * Everything a section body may render. Headings are left out on purpose: the
 * page owns its H1 and H2s, so a stray "#" in the text is shown as plain text
 * instead of adding a second H1. Raw HTML is never rendered (skipHtml), and
 * react-markdown already drops javascript: and other unsafe link targets.
 */
const ALLOWED_ELEMENTS = [
  'p',
  'a',
  'strong',
  'em',
  'del',
  'code',
  'br',
  'hr',
  'blockquote',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

const LINK_CLASS = 'font-semibold text-brand underline underline-offset-2 hover:text-brand-strong';

function components(sponsoredHosts: ReadonlySet<string>): Components {
  return {
    a: ({ href = '', children }) => {
      const kind = classifyGuideLink(href, sponsoredHosts);
      if (kind === 'internal') {
        return (
          <Link href={href} className={LINK_CLASS}>
            {children}
          </Link>
        );
      }
      if (kind === 'other') {
        return (
          <a href={href} className={LINK_CLASS}>
            {children}
          </a>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel={kind === 'sponsored' ? 'sponsored nofollow noopener noreferrer' : 'noopener noreferrer'}
          className={LINK_CLASS}
        >
          {children}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      );
    },
    strong: ({ children }) => <strong className="font-bold text-content">{children}</strong>,
    ul: ({ children }) => <ul className="list-disc space-y-1.5 pl-5">{children}</ul>,
    ol: ({ children, start }) => (
      <ol start={start} className="list-decimal space-y-1.5 pl-5">
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-line pl-4 italic">{children}</blockquote>
    ),
    code: ({ children }) => (
      <code className="rounded-chip bg-surface-sunken px-1 py-0.5 font-mono text-sm text-content">{children}</code>
    ),
    // On a narrow phone the table scrolls sideways inside its own frame rather than widening the page.
    table: ({ children }) => (
      <div className="overflow-x-auto rounded-card border border-line bg-surface-raised shadow-card ring-1 ring-accent/5">
        <table className="w-full min-w-full border-collapse text-left text-sm tabular-nums">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b-2 border-accent/30 bg-gradient-to-r from-accent-tint to-surface-raised">{children}</thead>
    ),
    tbody: ({ children }) => <tbody className="divide-y divide-line">{children}</tbody>,
    tr: ({ children }) => (
      <tr className="transition-colors duration-200 even:bg-surface hover:bg-accent-tint">{children}</tr>
    ),
    th: ({ children, style }) => (
      <th
        scope="col"
        style={style}
        className="whitespace-nowrap px-3 py-3 font-mono text-micro font-bold uppercase tracking-wide text-accent-strong sm:px-4"
      >
        {children}
      </th>
    ),
    // The first cell of each row names it (the pack size), so it reads stronger than the figures.
    td: ({ children, style }) => (
      <td
        style={style}
        className="whitespace-nowrap px-3 py-2.5 font-medium text-content first:font-bold sm:px-4"
      >
        {children}
      </td>
    ),
  };
}

/** One guide section's body, written in Markdown in the admin. */
export function GuideMarkdown({
  source,
  sponsoredHosts,
}: {
  source: string;
  /** Supplier hosts: links to these are marked rel="sponsored nofollow". */
  sponsoredHosts: ReadonlySet<string>;
}) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      allowedElements={ALLOWED_ELEMENTS}
      unwrapDisallowed
      skipHtml
      components={components(sponsoredHosts)}
    >
      {source}
    </Markdown>
  );
}
