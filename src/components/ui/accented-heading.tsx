/**
 * An admin-set H1 in the same style as the built-in ones: its last word in the
 * accent colour, ending in a full stop. The admin types plain text, so the
 * styling is applied here rather than stored with the heading.
 */
export function AccentedHeading({ text }: { text: string }) {
  const trimmed = text.trim().replace(/\.$/, '');
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace === -1) return <span className="text-accent">{trimmed}.</span>;
  return (
    <>
      {trimmed.slice(0, lastSpace)} <span className="text-accent">{trimmed.slice(lastSpace + 1)}.</span>
    </>
  );
}
