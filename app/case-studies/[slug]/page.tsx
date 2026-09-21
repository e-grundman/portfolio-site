import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Kicker } from "@/components/kicker";
import { MetricList } from "@/components/metric";
import { getCaseStudies, getCaseStudyEntry } from "@/lib/content/loader";
import { sections } from "@/lib/site";
import { formatMonthYear } from "@/lib/format";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  if (!sections.caseStudies) return [];
  return getCaseStudies().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const entry = getCaseStudyEntry(slug);
    return { title: entry.title, description: entry.summary };
  } catch {
    return {};
  }
}

export default async function CaseStudyDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!sections.caseStudies) notFound();
  const known = getCaseStudies().some((entry) => entry.slug === slug);
  if (!known) notFound();

  const entry = getCaseStudyEntry(slug);
  const { default: Body } = await import(`@/content/case-studies/${slug}.mdx`);

  return (
    <article className="py-6">
      <Kicker>
        {entry.role} · {entry.org} · {entry.timeframe}
      </Kicker>
      <h1 className="headline text-5xl sm:text-6xl">
        {entry.title}
      </h1>
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
          Outcome figures published by{" "}
          <a
            href={entry.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-highlight decoration-[3px] underline-offset-2"
          >
            {new URL(entry.sourceUrl).hostname.replace(/^www\./, "")} ↗
          </a>{" "}
          · {formatMonthYear(entry.publishedAt)}
        </p>
      )}

      <p className="mt-12 border-t-2 border-line pt-8">
        <Link
          href="/case-studies"
          className="field-label text-xs"
        >
          ← All case studies
        </Link>
      </p>
    </article>
  );
}
