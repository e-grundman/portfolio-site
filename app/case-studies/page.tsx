import type { Metadata } from "next";
import { EntryRow } from "@/components/entry-row";
import { Kicker } from "@/components/kicker";
import { MetricFigure } from "@/components/metric";
import { notFound } from "next/navigation";
import { getCaseStudies } from "@/lib/content/loader";
import { sections } from "@/lib/site";

export const metadata: Metadata = {
  title: "Case studies",
  description:
    "Case studies in parcel transportation, ecommerce fulfillment, logistics billing, and data products.",
};

/**
 * Long form proof behind the career highlights. Entries live in
 * content/case-studies and are gated by sections.caseStudies.
 */
export default function CaseStudyIndex() {
  if (!sections.caseStudies) notFound();
  const work = getCaseStudies();

  return (
    <section className="py-6">
      <Kicker>Case studies</Kicker>
      <h1 className="headline text-5xl sm:text-6xl">
        The work behind the numbers
      </h1>
      <p className="mt-6 text-pretty text-lg leading-relaxed text-muted">
        Each one names the target, the constraint that could not move, what
        changed, and how it was measured. Where an employer has published the
        outcome, it is cited and linked.
      </p>
      <div className="mt-10">
        {work.map((entry) => (
          <EntryRow
            key={entry.slug}
            href={`/case-studies/${entry.slug}`}
            title={entry.title}
            summary={entry.summary}
            rail={<MetricFigure metric={entry.metrics[0]} />}
          />
        ))}
      </div>
    </section>
  );
}
