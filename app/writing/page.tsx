import type { Metadata } from "next";
import Link from "next/link";
import { Kicker } from "@/components/kicker";
import { notFound } from "next/navigation";
import { getWriting } from "@/lib/content/loader";
import { sections } from "@/lib/site";
import { formatMonthYear } from "@/lib/format";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Long form writing on parcel economics, carrier pricing, fulfillment operations, and building data products that change decisions.",
};

/**
 * Held back until there are long form pieces worth a page of their own. The
 * route stays so turning sections.writing back on is the only step required.
 */
export default function WritingIndex() {
  if (!sections.writing) notFound();
  const posts = getWriting();

  return (
    <section className="border-t border-rule py-16">
      <Kicker>Writing</Kicker>
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
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
                <span className="font-serif text-xl leading-snug tracking-tight transition-colors group-hover:text-accent">
                  {post.title}
                  {external && (
                    <span
                      className="ml-2 inline-block font-mono text-sm text-muted transition-colors group-hover:text-accent"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  )}
                </span>
                <span className="mt-2 block max-w-lg leading-relaxed text-muted">
                  {post.summary}
                </span>
                <span className="mt-3 block font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  {post.tags.join(" · ")}
                </span>
              </div>
              <span className="shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-muted">
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
