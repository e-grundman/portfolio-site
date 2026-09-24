import type { Metadata } from "next";
import Link from "next/link";
import { Kicker } from "@/components/kicker";
import { notFound } from "next/navigation";
import { getWriting } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/metadata";
import { sections } from "@/lib/site";
import { formatMonthYear } from "@/lib/format";

export const metadata: Metadata = pageMetadata({
  title: "Writing",
  description:
    "Long form writing on parcel economics, carrier pricing, fulfillment operations, and building data products that change decisions.",
  path: "/writing",
});

/**
 * Held back until there are long form pieces worth a page of their own. The
 * route stays so turning sections.writing back on is the only step required.
 */
export default function WritingIndex() {
  if (!sections.writing) notFound();
  const posts = getWriting();

  return (
    <section className="py-6">
      <Kicker>Writing</Kicker>
      <h1 className="headline text-5xl sm:text-6xl">
        Parcel economics, in public.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        Pieces on shipping cost mechanics, carrier pricing behavior, and the
        difference between a dashboard and a decision. Entries marked with an
        arrow were published on LinkedIn and open there.
      </p>

      <ul className="mt-10">
        {posts.map((post) => {
          const external = post.externalOnly;
          const href = external
            ? (post.canonical ?? "#")
            : `/writing/${post.slug}`;
          const inner = (
            <>
              <div>
                <span className="headline text-xl leading-snug tracking-tight">
                  {post.title}
                  {external && (
                    <span
                      className="ml-2 inline-block font-mono text-sm text-muted"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  )}
                </span>
                <span className="mt-2 block max-w-lg leading-relaxed text-muted">
                  {post.summary}
                </span>
                <span className="mt-3 block field-label text-xs text-muted">
                  {post.tags.join(" · ")}
                </span>
              </div>
              <span className="shrink-0 field-label text-xs text-muted">
                {formatMonthYear(post.publishedAt)}
              </span>
            </>
          );

          return (
            <li key={post.slug} className="border-b border-rule">
              {external ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-baseline justify-between gap-6 py-6"
                >
                  {inner}
                </a>
              ) : (
                <Link
                  href={href}
                  className="group flex items-baseline justify-between gap-6 py-6"
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
