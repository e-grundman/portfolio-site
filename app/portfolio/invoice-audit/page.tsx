import type { Metadata } from "next";
import Link from "next/link";
import { InvoiceAuditLab } from "@/components/labs/invoice-audit/invoice-audit-lab";
import { Kicker } from "@/components/kicker";
import { getPortfolioEntry } from "@/lib/content/loader";
import { buildFixture, DEFAULT_SEED, invoiceProvenance } from "@/lib/labs/invoice-audit/invoice";
import { loadRecordedRun } from "@/lib/labs/invoice-audit/recorded";
import { ruleProvenance } from "@/lib/labs/invoice-audit/rules";
import { pageMetadata } from "@/lib/metadata";
import { rateDataProvenance } from "@/lib/rates";
import Explainer from "@/content/portfolio/invoice-audit.mdx";

const entry = getPortfolioEntry("invoice-audit");
// The invoice and the recorded run are fixed at build. Only the live button
// touches the server.
const fixture = buildFixture(DEFAULT_SEED);
const recorded = loadRecordedRun();

export const metadata: Metadata = pageMetadata({
  title: entry.title,
  description: entry.summary,
  path: entry.route,
});

export default function InvoiceAuditPage() {
  return (
    <article className="py-6">
      <Kicker>Agent</Kicker>
      <h1 className="headline text-5xl sm:text-6xl">{entry.title}</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{entry.summary}</p>

      <p className="mt-6">
        <a href="#how-it-works" className="field-label text-xs">
          How the agent works ↓
        </a>
      </p>

      <div className="xl:-mx-24">
        <InvoiceAuditLab
          invoice={fixture.invoice}
          planted={fixture.planted}
          recorded={recorded}
        />
      </div>

      <div id="how-it-works" className="mt-12 scroll-mt-8 border-t-2 border-line pt-8">
        <h2 className="field-label text-sm">How it works</h2>
        <div className="mt-6 max-w-xl">
          <Explainer />
        </div>
      </div>

      <div className="mt-12 border-t-2 border-line pt-8">
        <h2 className="field-label text-sm">Data provenance</h2>
        <dl className="mt-4 max-w-xl space-y-4 leading-relaxed text-ink/85">
          <div>
            <dt className="field-label text-sm">Invoice</dt>
            <dd className="mt-1">
              {invoiceProvenance.kind} {invoiceProvenance.detail} {invoiceProvenance.errors}{" "}
              {invoiceProvenance.notRepresenting}
            </dd>
          </div>
          <div>
            <dt className="field-label text-sm">Rules</dt>
            <dd className="mt-1">
              {ruleProvenance.kind} {ruleProvenance.limits} {ruleProvenance.notRepresenting}
            </dd>
          </div>
          <div>
            <dt className="field-label text-sm">Rates</dt>
            <dd className="mt-1">
              {rateDataProvenance.kind} {rateDataProvenance.formula}{" "}
              {rateDataProvenance.notRepresenting}
            </dd>
          </div>
        </dl>
        <p className="mt-6 max-w-xl leading-relaxed text-muted">
          The rules, the invoice generator, the deterministic checks, and the agent are separate
          modules. A new rate year is a data change to the rules file, and a real invoice is a
          parser in front of the same tools. The code is on{" "}
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
        <Link href="/portfolio" className="field-label text-xs">
          ← Back to portfolio
        </Link>
      </p>
    </article>
  );
}
