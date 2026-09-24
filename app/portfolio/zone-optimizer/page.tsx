import type { Metadata } from "next";
import Link from "next/link";
import { ZoneOptimizer } from "@/components/labs/zone-optimizer/zone-optimizer";
import { Kicker } from "@/components/kicker";
import { getPortfolioEntry } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/metadata";
import { rateDataProvenance } from "@/lib/rates";
import { zoneDataProvenance } from "@/lib/zones";
import { orderDataProvenance } from "@/lib/labs/zone-optimizer/orders";
import Explainer from "@/content/portfolio/zone-optimizer.mdx";

const entry = getPortfolioEntry("zone-optimizer");

export const metadata: Metadata = pageMetadata({
  title: entry.title,
  description: entry.summary,
  path: entry.route,
});

export default function ZoneOptimizerPage() {
  return (
    <article className="py-6">
      <Kicker>Decision tool</Kicker>
      <h1 className="headline text-5xl sm:text-6xl">
        {entry.title}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        {entry.summary}
      </p>

      <p className="mt-6">
        <a
          href="#how-it-works"
          className="field-label text-xs"
        >
          How the model works ↓
        </a>
      </p>

      {/* The tool leads and gets more width than the reading column, so the
          tables and charts are not squeezed on a laptop screen. */}
      <div className="xl:-mx-24">
        <ZoneOptimizer />
      </div>

      <div id="how-it-works" className="mt-12 scroll-mt-8 border-t-2 border-line pt-8">
        <h2 className="field-label text-sm">
          How it works
        </h2>
        <div className="mt-6 max-w-xl">
          <Explainer />
        </div>
      </div>

      <div className="mt-12 border-t-2 border-line pt-8">
        <h2 className="field-label text-sm">
          Data provenance
        </h2>
        <dl className="mt-4 max-w-xl space-y-4 leading-relaxed text-ink/85">
          <div>
            <dt className="field-label text-sm">
              Orders
            </dt>
            <dd className="mt-1">
              {orderDataProvenance.kind} {orderDataProvenance.destinations}{" "}
              {orderDataProvenance.weights}
            </dd>
          </div>
          <div>
            <dt className="field-label text-sm">
              Zones
            </dt>
            <dd className="mt-1">
              {zoneDataProvenance.matrix.method}{" "}
              {zoneDataProvenance.matrix.approximation} Centroids come from{" "}
              {zoneDataProvenance.centroids.source}.
            </dd>
          </div>
          <div>
            <dt className="field-label text-sm">
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
            className="underline decoration-highlight decoration-[3px] underline-offset-2"
          >
            GitHub
          </a>
          .
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
