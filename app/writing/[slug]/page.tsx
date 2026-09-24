import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Kicker } from "@/components/kicker";
import { getLocalWriting, getWritingEntry } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/metadata";
import { sections } from "@/lib/site";
import { formatLongDate } from "@/lib/format";

type Params = { slug: string };

/**
 * Only posts that live here get a route. An externalOnly entry is indexed and
 * linked out, so generating a page for it would create a thin duplicate.
 */
export function generateStaticParams(): Params[] {
  if (!sections.writing) return [];
  return getLocalWriting().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getWritingEntry(slug);
    const meta = pageMetadata({
      title: post.title,
      description: post.summary,
      path: `/writing/${slug}`,
      type: "article",
    });
    // A piece first published elsewhere points its canonical there.
    return post.canonical
      ? { ...meta, alternates: { canonical: post.canonical } }
      : meta;
  } catch {
    return {};
  }
}

export default async function WritingDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!sections.writing) notFound();
  const known = getLocalWriting().some((post) => post.slug === slug);
  if (!known) notFound();

  const post = getWritingEntry(slug);
  const { default: Body } = await import(`@/content/writing/${slug}.mdx`);

  return (
    <article className="py-6">
      <Kicker>{formatLongDate(post.publishedAt)}</Kicker>
      <h1 className="headline text-5xl sm:text-6xl">
        {post.title}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        {post.summary}
      </p>
      <div className="mt-10 max-w-xl">
        <Body />
      </div>
      <p className="mt-12 border-t-2 border-line pt-8">
        <Link
          href="/writing"
          className="field-label text-xs"
        >
          ← All writing
        </Link>
      </p>
    </article>
  );
}
