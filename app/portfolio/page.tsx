import type { Metadata } from "next";
import { Kicker } from "@/components/kicker";
import { PackageCard } from "@/components/package-card";
import { getPortfolio } from "@/lib/content/loader";

export const metadata: Metadata = {
  alternates: { canonical: "/portfolio" },
  title: "Portfolio",
  description:
    "Tools for the decisions shippers have to make, built with Claude Code on synthetic data: warehouse placement, packaging, and the mechanics behind shipping cost.",
};

const statusOrder = ["live", "prototype", "planned"] as const;
const statusCopy: Record<(typeof statusOrder)[number], string> = {
  live: "Working tools",
  prototype: "In progress",
  planned: "Queued",
};

export default function PortfolioIndex() {
  const entries = getPortfolio();

  return (
    <section className="py-6">
      <Kicker>Portfolio</Kicker>
      <h1 className="headline text-5xl sm:text-6xl">
        Tools for shipping decisions
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        Each tool starts from a decision a shipper has to make and models the
        cost mechanism underneath it, so you can change the inputs and see what
        moves. I build them with Claude Code on synthetic data, and every
        dataset states where it came from, because none of it may come from an
        employer.
      </p>

      {statusOrder.map((status) => {
        const group = entries.filter((entry) => entry.status === status);
        if (group.length === 0) return null;

        return (
          <div key={status} className="mt-12">
            <h2 className="field-label text-sm">
              {statusCopy[status]}
            </h2>
            <div className="mt-4 grid gap-6">
              {group.map((entry, index) => (
                <PackageCard
                  key={entry.slug}
                  href={entry.route}
                  title={entry.title}
                  summary={entry.summary}
                  tags={entry.tags}
                  index={index + 1}
                  total={group.length}
                  kind={status === "live" ? "Decision tool" : statusCopy[status]}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
