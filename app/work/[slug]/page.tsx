import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Kicker } from "@/components/kicker";
import { MetricList } from "@/components/metric";
import { getWork, getWorkEntry } from "@/lib/content/loader";
import { sections } from "@/lib/site";
import { formatMonthYear } from "@/lib/format";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  if (!sections.work) return [];
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
  if (!sections.work) notFound();
  const known = getWork().some((entry) => entry.slug === slug);
  if (!known) notFound();

  const entry = getWorkEntry(slug);
  const { default: Body } = await import(`@/content/work/${slug}.mdx`);

  return (
    <article className="py-6">
      <Kicker>
        {entry.role} · {entry.org} · {entry.timeframe}
      </Kicker>
      <h1 className="headline text-5xl sm:text-6xl">
        {entry.title}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        {entry.summary}
      </p>

      <div className="mt-10 border-y border-rule py-8">
        <MetricList metrics={entry.metrics} />
      </div>

      <div className="mt-10 border-l-4 border-highlight pl-5">
        <p className="field-label text-sm">
          The fixed constraint
        </p>
        <p className="mt-2 max-w-xl headline text-lg leading-relaxed">
          {entry.constraint}
        </p>
      </div>

      <div className="mt-4 max-w-xl">
        <Body />
      </div>

      {entry.sourceUrl && (
        <p className="mt-12 field-label text-xs text-muted">
          First published{" "}
          <a
            href={entry.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-highlight decoration-[3px] underline-offset-2"
          >
            on LinkedIn ↗
          </a>{" "}
          · {formatMonthYear(entry.publishedAt)}
        </p>
      )}

      <p className="mt-12 border-t-2 border-line pt-8">
        <Link
          href="/work"
          className="field-label text-xs"
        >
          ← All work
        </Link>
      </p>
    </article>
  );
}
