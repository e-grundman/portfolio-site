import type { Metadata } from "next";
import { EntryRow } from "@/components/entry-row";
import { Kicker } from "@/components/kicker";
import { MetricFigure } from "@/components/metric";
import { getWork } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies in parcel transportation, ecommerce fulfillment, logistics billing, and data products.",
};

export default function WorkIndex() {
  const work = getWork();

  return (
    <section className="border-t border-rule py-16">
      <Kicker>Work</Kicker>
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        Problems nobody had untangled yet.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        Each case study names the constraint that could not move, what I did
        inside it, and what I would do differently. Figures are operational
        rather than financial, because the financial ones belong to an employer.
      </p>
      <div className="mt-10">
        {work.map((entry) => (
          <EntryRow
            key={entry.slug}
            href={`/work/${entry.slug}`}
            title={entry.title}
            summary={entry.summary}
            rail={<MetricFigure metric={entry.metrics[0]} />}
          />
        ))}
      </div>
    </section>
  );
}
