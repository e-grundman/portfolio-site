import Link from "next/link";

/**
 * A portfolio piece as a package: a header strip with the piece count and
 * kind, then the title, summary, and tags. The whole card is one link.
 */
export function PackageCard({
  href,
  title,
  summary,
  tags = [],
  index,
  total,
  kind,
}: {
  href: string;
  title: string;
  summary?: string;
  tags?: readonly string[];
  index: number;
  total: number;
  kind: string;
}) {
  return (
    <article className="group relative label-panel">
      <div className="flex items-center justify-between border-b-2 border-line px-4 py-2 field-label text-xs">
        <span>
          Pkg {index} of {total}
        </span>
        <span className="text-muted">{kind}</span>
      </div>
      <div className="px-4 pt-4 pb-5">
        <h3 className="headline text-3xl sm:text-4xl">
          <Link href={href} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>
        {summary && (
          <p className="mt-3 text-pretty leading-relaxed text-muted">{summary}</p>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="border border-line px-1.5 py-0.5 field-label text-xs"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <span
            aria-hidden="true"
            className="field-label text-sm group-hover:bg-highlight group-hover:text-on-highlight"
          >
            Open the model →
          </span>
        </div>
      </div>
    </article>
  );
}
