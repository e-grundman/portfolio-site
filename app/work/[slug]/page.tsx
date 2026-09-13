import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Kicker } from "@/components/kicker";
import { MetricList } from "@/components/metric";
import { getWork, getWorkEntry } from "@/lib/content/loader";
import { formatMonthYear } from "@/lib/format";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getWork().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const entry = getWorkEntry(slug);
    return { title: entry.title, description: entry.summary };
  } catch {
    return {};
  }
}

export default async function WorkDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const known = getWork().some((entry) => entry.slug === slug);
  if (!known) notFound();

  const entry = getWorkEntry(slug);
  const { default: Body } = await import(`@/content/work/${slug}.mdx`);

  return (
    <article className="border-t border-rule py-16">
      <Kicker>
        {entry.role} · {entry.org} · {entry.timeframe}
      </Kicker>
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        {entry.title}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        {entry.summary}
      </p>

      <div className="mt-10 border-y border-rule py-8">
        <MetricList metrics={entry.metrics} />
      </div>

      <div className="mt-10 border-l-2 border-accent pl-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          The fixed constraint
        </p>
        <p className="mt-2 max-w-xl font-serif text-lg leading-relaxed">
          {entry.constraint}
        </p>
      </div>

      <div className="mt-4 max-w-xl">
        <Body />
      </div>

      {entry.sourceUrl && (
        <p className="mt-12 font-mono text-xs uppercase tracking-[0.15em] text-muted">
          First published{" "}
          <a
            href={entry.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent transition-opacity hover:opacity-70"
          >
            on LinkedIn ↗
          </a>{" "}
          · {formatMonthYear(entry.publishedAt)}
        </p>
      )}

      <p className="mt-12 border-t border-rule pt-8">
        <Link
          href="/work"
          className="font-mono text-xs uppercase tracking-[0.15em] text-accent transition-opacity hover:opacity-70"
        >
          ← All work
        </Link>
      </p>
    </article>
  );
}
