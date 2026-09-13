import type { Metadata } from "next";
import Link from "next/link";
import { ZoneOptimizer } from "@/components/labs/zone-optimizer/zone-optimizer";
import { Kicker } from "@/components/kicker";
import { getLabEntry } from "@/lib/content/loader";
import { rateDataProvenance } from "@/lib/rates";
import { zoneDataProvenance } from "@/lib/zones";
import { orderDataProvenance } from "@/lib/labs/zone-optimizer/orders";
import Explainer from "@/content/labs/zone-optimizer.mdx";

const lab = getLabEntry("zone-optimizer");

export const metadata: Metadata = {
  title: lab.title,
  description: lab.summary,
};

export default function ZoneOptimizerLab() {
  return (
    <article className="border-t border-rule py-16">
      <Kicker>Lab · {lab.status}</Kicker>
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        {lab.title}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        {lab.summary}
      </p>

      <div className="mt-8 max-w-xl">
        <Explainer />
      </div>

      <ZoneOptimizer />

      <div className="mt-12 border-t border-rule pt-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Data provenance
        </h2>
        <dl className="mt-4 max-w-xl space-y-4 leading-relaxed text-ink/85">
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              Orders
            </dt>
            <dd className="mt-1">
              {orderDataProvenance.kind} {orderDataProvenance.destinations}{" "}
              {orderDataProvenance.weights}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              Zones
            </dt>
            <dd className="mt-1">
              {zoneDataProvenance.matrix.method}{" "}
              {zoneDataProvenance.matrix.approximation} Centroids come from{" "}
              {zoneDataProvenance.centroids.source}.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              Rates
            </dt>
            <dd className="mt-1">
              {rateDataProvenance.kind} {rateDataProvenance.formula}{" "}
              {rateDataProvenance.notRepresenting}
            </dd>
          </div>
        </dl>
        <p className="mt-6 max-w-xl leading-relaxed text-muted">
          The zone lookup and the rate table are separate modules behind stable
          interfaces, so either can be replaced with a real table without
          touching the model. The code is on{" "}
          <a
            href="https://github.com/e-grundman/portfolio-site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline decoration-rule underline-offset-4 transition-colors hover:decoration-accent"
          >
            GitHub
          </a>
          .
        </p>
      </div>

      <p className="mt-12 border-t border-rule pt-8">
        <Link
          href="/labs"
          className="font-mono text-xs uppercase tracking-[0.15em] text-accent transition-opacity hover:opacity-70"
        >
          ← All labs
        </Link>
      </p>
    </article>
  );
}
