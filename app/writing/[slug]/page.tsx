import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Kicker } from "@/components/kicker";
import { getLocalWriting, getWritingEntry } from "@/lib/content/loader";
import { formatLongDate } from "@/lib/format";

type Params = { slug: string };

/**
 * Only posts that live here get a route. An externalOnly entry is indexed and
 * linked out, so generating a page for it would create a thin duplicate.
 */
export function generateStaticParams(): Params[] {
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
    return {
      title: post.title,
      description: post.summary,
      alternates: post.canonical ? { canonical: post.canonical } : undefined,
    };
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
  const known = getLocalWriting().some((post) => post.slug === slug);
  if (!known) notFound();

  const post = getWritingEntry(slug);
  const { default: Body } = await import(`@/content/writing/${slug}.mdx`);

  return (
    <article className="border-t border-rule py-16">
      <Kicker>{formatLongDate(post.publishedAt)}</Kicker>
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        {post.title}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        {post.summary}
      </p>
      <div className="mt-10 max-w-xl">
        <Body />
      </div>
      <p className="mt-12 border-t border-rule pt-8">
        <Link
          href="/writing"
          className="font-mono text-xs uppercase tracking-[0.15em] text-accent transition-opacity hover:opacity-70"
        >
          ← All writing
        </Link>
      </p>
    </article>
  );
}
