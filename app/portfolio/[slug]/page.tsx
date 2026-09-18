import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Kicker } from "@/components/kicker";
import { getPortfolio, getPortfolioEntry } from "@/lib/content/loader";

type Params = { slug: string };

/**
 * Registry shell for entries that have no bespoke route yet. An entry with its
 * own directory under app/portfolio wins, because Next.js prefers the static
 * segment, so this only ever renders the planned and prototype entries.
 */
export function generateStaticParams(): Params[] {
  return getPortfolio()
    .filter((entry) => entry.status !== "live")
    .map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const entry = getPortfolioEntry(slug);
    return { title: entry.title, description: entry.summary };
  } catch {
    return {};
  }
}

export default async function PortfolioShell({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const known = getPortfolio().some((entry) => entry.slug === slug);
  if (!known) notFound();

  const entry = getPortfolioEntry(slug);
  const { default: Body } = await import(`@/content/portfolio/${slug}.mdx`);

  return (
    <article className="py-6">
      <Kicker>{entry.status}</Kicker>
      <h1 className="headline text-5xl sm:text-6xl">
        {entry.title}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        {entry.summary}
      </p>

      <div className="mt-8 max-w-xl">
        <Body />
      </div>

      <div className="mt-12 border border-rule p-6">
        <p className="field-label text-sm">
          Not built yet
        </p>
        <p className="mt-3 max-w-lg leading-relaxed text-ink/85">
          This one is specified and queued rather than shipped. The write up
          above is the design, and it is here so the reasoning is public before
          the tool is.
        </p>
      </div>

      <div className="mt-8 border-t-2 border-line pt-6">
        <p className="field-label text-sm">
          Data provenance
        </p>
        <p className="mt-3 max-w-xl leading-relaxed text-ink/85">
          {entry.dataProvenance}
        </p>
      </div>

      <p className="mt-12 border-t-2 border-line pt-8">
        <Link
          href="/portfolio"
          className="field-label text-xs"
        >
          ← Back to portfolio
        </Link>
      </p>
    </article>
  );
}
