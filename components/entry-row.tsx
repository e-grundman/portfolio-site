import Link from "next/link";

/**
 * One row in an index. A row is a link with a title, a summary, and an
 * optional right hand rail for a figure or a date.
 */
export function EntryRow({
  href,
  title,
  summary,
  rail,
  external = false,
}: {
  href: string;
  title: string;
  summary?: string;
  rail?: React.ReactNode;
  external?: boolean;
}) {
  const heading = (
    <span className="headline text-2xl tracking-tight">
      {title}
      {external && (
        <span
          className="ml-2 inline-block font-mono text-sm text-muted"
          aria-hidden="true"
        >
          ↗
        </span>
      )}
    </span>
  );

  return (
    <article className="group grid grid-cols-1 gap-3 border-b border-rule py-8 sm:grid-cols-[1fr_auto] sm:gap-10">
      <div>
        <h2>
          {external ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {heading}
            </a>
          ) : (
            <Link href={href}>{heading}</Link>
          )}
        </h2>
        {summary && (
          <p className="mt-3 max-w-lg leading-relaxed text-muted">{summary}</p>
        )}
      </div>
      {rail && <div className="sm:text-right">{rail}</div>}
    </article>
  );
}
