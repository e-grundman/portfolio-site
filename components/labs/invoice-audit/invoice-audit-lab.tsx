"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Finding, Score } from "@/lib/labs/invoice-audit/checks";
import type { AuditEvent, RecordedRun } from "@/lib/labs/invoice-audit/events";
import {
  packageTotal,
  type Invoice,
  type InvoicePackage,
  type PlantedError,
} from "@/lib/labs/invoice-audit/invoice";
import { rules } from "@/lib/labs/invoice-audit/rules";
import { formatUsd } from "@/lib/format";

type Props = {
  invoice: Invoice;
  planted: PlantedError[];
  recorded: RecordedRun | null;
};

const th = "border-b border-rule py-2 pr-4 field-label text-xs text-muted";
const td = "whitespace-nowrap border-b border-rule py-2 pr-4 font-mono text-sm";
const tdNum = `${td} text-right`;

const chargeLabel: Record<string, string> = {
  TRANSPORTATION: "Transport",
  FUEL: "Fuel",
  RESIDENTIAL: "Residential",
  DAS: "DAS",
  DAS_EXTENDED: "DAS ext.",
  DAS_REMOTE: "DAS remote",
  AHS_DIMENSION: "AHS dim.",
  AHS_WEIGHT: "AHS weight",
  AHS_PACKAGING: "AHS pkg.",
  OVERSIZE: "Oversize",
  SIGNATURE_DIRECT: "Sig. direct",
  SIGNATURE_ADULT: "Sig. adult",
  ADDRESS_CORRECTION: "Addr. corr.",
};

const issueLabel: Record<Finding["issue"], string> = {
  NOT_APPLICABLE: "Not applicable",
  WRONG_AMOUNT: "Wrong amount",
  DUPLICATE: "Duplicate",
  WEIGHT_OVERSTATED: "Weight overstated",
  FUEL_MISCALCULATED: "Fuel miscalculated",
  CANNOT_VERIFY: "Cannot verify",
};

const plantedLabel: Record<PlantedError["kind"], string> = {
  RESIDENTIAL_ON_COMMERCIAL: "Residential charge on a commercial address",
  RESIDENTIAL_EXPRESS_RATE: "Residential charge at the Express rate",
  AHS_NO_TRIGGER: "Additional handling with no trigger met",
  AHS_WRONG_ZONE_TIER: "Additional handling at the wrong zone tier",
  BILLED_WEIGHT_INFLATED: "Billed weight above actual and dimensional",
  DAS_DUPLICATE: "Delivery area surcharge billed twice",
  OVERSIZE_NO_TRIGGER: "Oversize charge where only additional handling applies",
  FUEL_WRONG_PERCENT: "Fuel at the wrong percentage",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="field-label text-sm">{children}</h2>;
}

function Toggle({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 border px-3 py-1.5 field-label text-xs disabled:opacity-50 ${
        active
          ? "border-line bg-highlight text-on-highlight"
          : "border-rule text-muted hover:border-line hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function pct(part: number, whole: number): string {
  if (whole === 0) return "0%";
  return `${((part / whole) * 100).toFixed(1)}%`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function compactInput(input: Record<string, unknown>): string {
  const parts = Object.entries(input).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return parts.join(", ");
}

/** Pull the pieces the page renders out of an event stream. */
function digest(events: AuditEvent[]) {
  let invoice: Invoice | undefined;
  let model = "";
  let findings: Finding[] | undefined;
  let summary = "";
  let score: Score | undefined;
  let done: Extract<AuditEvent, { type: "done" }> | undefined;
  let error = "";
  const log: Extract<AuditEvent, { type: "tool_call" | "assistant" }>[] = [];
  for (const e of events) {
    if (e.type === "started") {
      invoice = e.invoice;
      model = e.model;
    } else if (e.type === "tool_call" || e.type === "assistant") {
      log.push(e);
    } else if (e.type === "findings") {
      findings = e.findings;
      summary = e.summary;
    } else if (e.type === "done") {
      done = e;
      score = e.score;
    } else if (e.type === "error") {
      error = e.message;
    }
  }
  return { invoice, model, findings, summary, score, done, error, log };
}

export function InvoiceAuditLab({ invoice: defaultInvoice, planted, recorded }: Props) {
  const [mode, setMode] = useState<"recorded" | "live">(recorded ? "recorded" : "live");
  const [liveEvents, setLiveEvents] = useState<AuditEvent[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "finished" | "failed">("idle");
  const [failure, setFailure] = useState("");
  const [freshInvoice, setFreshInvoice] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const events = mode === "recorded" ? (recorded?.events ?? []) : liveEvents;
  const run = useMemo(() => digest(events), [events]);
  const invoice = run.invoice ?? defaultInvoice;
  const answerKey = run.invoice && run.invoice.number !== defaultInvoice.number ? null : planted;

  const startLive = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setMode("live");
    setLiveEvents([]);
    setFailure("");
    setStatus("running");
    const seed = freshInvoice ? Math.floor(Date.now() / 1000) : undefined;
    try {
      const response = await fetch("/api/invoice-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seed ? { seed } : {}),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `The server answered ${response.status}.`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        const parsed = lines.filter(Boolean).map((line) => JSON.parse(line) as AuditEvent);
        if (parsed.length) setLiveEvents((prev) => [...prev, ...parsed]);
      }
      if (buffer.trim()) setLiveEvents((prev) => [...prev, JSON.parse(buffer) as AuditEvent]);
      setStatus("finished");
    } catch (error) {
      if (controller.signal.aborted) return;
      setFailure(error instanceof Error ? error.message : "The run failed.");
      setStatus("failed");
    }
  }, [freshInvoice]);

  const disputed = (run.findings ?? []).filter((f) => f.issue !== "CANNOT_VERIFY");
  const unverifiable = (run.findings ?? []).filter((f) => f.issue === "CANNOT_VERIFY");
  const recoverable = disputed.reduce((s, f) => s + f.recoverable, 0);

  return (
    <div>
      {/* The invoice */}
      <section className="mt-12 border-t-2 border-line pt-8">
        <SectionHeading>The invoice</SectionHeading>
        <p className="mt-2 max-w-xl leading-relaxed text-muted">
          One week of FedEx Ground and Home Delivery from a single origin. The shipper&apos;s
          facts on the left, the carrier&apos;s lines on the right. Eight of the forty packages
          carry a billing error.
        </p>
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
          <Stat label="Invoice" value={invoice.number} />
          <Stat label="Period" value={`${invoice.periodStart} to ${invoice.periodEnd}`} />
          <Stat label="Origin" value={invoice.originLabel} />
          <Stat label="Fuel for the period" value={`${(invoice.fuelPct * 100).toFixed(1)}%`} />
          <Stat label="Packages" value={String(invoice.packages.length)} />
          <Stat label="Invoice total" value={formatUsd(invoice.total)} />
        </dl>
        <div className="mt-6 max-h-[28rem] overflow-auto border-b border-rule">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Invoice lines by package</caption>
            <thead className="sticky top-0 bg-bg">
              <tr>
                <th className={th}>Tracking</th>
                <th className={th}>Service</th>
                <th className={th}>Dest</th>
                <th className={`${th} text-right`}>Zone</th>
                <th className={th}>Address</th>
                <th className={th}>Dims (in)</th>
                <th className={`${th} text-right`}>Actual lb</th>
                <th className={`${th} text-right`}>Billed lb</th>
                <th className={th}>Charges</th>
                <th className={`${th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.packages.map((p) => (
                <PackageRow key={p.tracking} p={p} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* The run */}
      <section className="mt-12 border-t-2 border-line pt-8">
        <SectionHeading>The audit run</SectionHeading>
        <p className="mt-2 max-w-xl leading-relaxed text-muted">
          The agent starts from the invoice table and a set of tools that answer factual
          questions. Every call it makes is shown below, with what came back.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {recorded ? (
            <Toggle active={mode === "recorded"} onClick={() => setMode("recorded")}>
              Recorded run, {formatDate(recorded.recordedAt)}
            </Toggle>
          ) : null}
          <Toggle
            active={mode === "live"}
            onClick={startLive}
            disabled={status === "running"}
          >
            {status === "running" ? "Running…" : "Run it live"}
          </Toggle>
          <label className="flex items-center gap-2 field-label text-xs text-muted">
            <input
              type="checkbox"
              checked={freshInvoice}
              onChange={(e) => setFreshInvoice(e.target.checked)}
              disabled={status === "running"}
              className="accent-highlight"
            />
            On a fresh invoice
          </label>
        </div>
        {mode === "live" && status === "idle" ? (
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            A live run takes one to three minutes and costs money, so it is limited to three an
            hour per visitor. A fresh invoice has the same eight error types at different
            positions and amounts, so the answer key is regenerated too.
          </p>
        ) : null}
        {status === "failed" ? (
          <p className="mt-4 max-w-xl font-mono text-sm text-ink/85">{failure}</p>
        ) : null}
        {run.error ? (
          <p className="mt-4 max-w-xl font-mono text-sm text-ink/85">{run.error}</p>
        ) : null}

        {run.model ? (
          <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
            <Stat label="Model" value={run.model} />
            <Stat label="Tool calls" value={String(run.log.filter((e) => e.type === "tool_call").length)} />
            {run.done ? (
              <>
                <Stat label="Turns" value={String(run.done.iterations)} />
                <Stat label="Elapsed" value={`${Math.round(run.done.elapsedMs / 1000)}s`} />
                <Stat
                  label="Tokens in / out"
                  value={`${(run.done.usage.input + run.done.usage.cacheRead + run.done.usage.cacheWrite).toLocaleString()} / ${run.done.usage.output.toLocaleString()}`}
                />
              </>
            ) : status === "running" ? (
              <Stat label="Status" value="working" />
            ) : null}
          </dl>
        ) : null}

        {run.log.length ? (
          <ol className="mt-6 space-y-3">
            {run.log.map((e, i) =>
              e.type === "assistant" ? (
                <li key={i} className="max-w-2xl border-l-2 border-line pl-4 leading-relaxed text-ink/85">
                  {e.text}
                </li>
              ) : (
                <li key={e.id || i} className="border border-rule">
                  <details>
                    <summary className="cursor-pointer px-3 py-2 font-mono text-sm">
                      <span className="field-label text-xs text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>{" "}
                      <span className="font-semibold">{e.name}</span>
                      {Object.keys(e.input).length ? (
                        <span className="text-muted">({compactInput(e.input)})</span>
                      ) : (
                        <span className="text-muted">()</span>
                      )}
                    </summary>
                    <pre className="max-h-64 overflow-auto border-t border-rule bg-panel px-3 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink/85">
                      {e.result}
                      {e.truncated ? "\n[cut for the log]" : ""}
                    </pre>
                  </details>
                </li>
              ),
            )}
          </ol>
        ) : mode === "recorded" ? null : status === "idle" ? (
          <p className="mt-6 max-w-xl leading-relaxed text-muted">
            No recorded run is stored yet. Run it live to see the agent work.
          </p>
        ) : null}
      </section>

      {/* Findings */}
      {run.findings ? (
        <section className="mt-12 border-t-2 border-line pt-8">
          <SectionHeading>Findings</SectionHeading>
          {run.summary ? (
            <p className="mt-2 max-w-xl leading-relaxed text-ink/85">{run.summary}</p>
          ) : null}
          <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
            <Stat label="Lines disputed" value={String(disputed.length)} />
            <Stat label="Recoverable" value={formatUsd(recoverable)} />
            <Stat label="Of invoice total" value={pct(recoverable, invoice.total)} />
            <Stat label="Flagged, cannot verify" value={String(unverifiable.length)} />
          </dl>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Audit findings</caption>
              <thead>
                <tr>
                  <th className={th}>Tracking</th>
                  <th className={th}>Charge</th>
                  <th className={th}>Issue</th>
                  <th className={`${th} text-right`}>Billed</th>
                  <th className={`${th} text-right`}>Expected</th>
                  <th className={`${th} text-right`}>Recover</th>
                  <th className={th}>Rule</th>
                  <th className={th}>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {run.findings.map((f, i) => (
                  <FindingRows key={`${f.tracking}-${f.charge_code}-${i}`} f={f} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Score */}
      {run.score && answerKey ? (
        <ScoreSection score={run.score} planted={answerKey} invoiceTotal={invoice.total} />
      ) : run.score ? (
        <ScoreSection score={run.score} planted={null} invoiceTotal={invoice.total} />
      ) : null}

      {/* Assumptions */}
      <section className="mt-12 border-t-2 border-line pt-8">
        <SectionHeading>What the agent assumes</SectionHeading>
        <ul className="mt-4 max-w-xl list-disc space-y-2 pl-5 leading-relaxed text-ink/85">
          <li>
            The shipper&apos;s order record is right about address type and the carton is right
            about dimensions and weight. A real audit would sample those against the warehouse
            scan before filing.
          </li>
          <li>
            Fuel applies to transportation plus the residential, delivery area, additional
            handling, and oversize surcharges, at the percentage in the invoice header. FedEx
            publishes the percentage weekly and this page does not fetch it.
          </li>
          <li>
            Delivery area eligibility and packaging material are not on an invoice. The agent is
            told so, and the right answer on those lines is a question, not a dispute.
          </li>
          <li>
            Transportation charges come from the site&apos;s synthetic rate table at roughly half
            of list, standing in for a contract. Surcharge amounts are the published 2026 figures
            with no discount, which is how most contracts leave them.
          </li>
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="field-label text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-lg">{value}</dd>
    </div>
  );
}

function PackageRow({ p }: { p: InvoicePackage }) {
  const surcharges = p.charges.filter((c) => c.code !== "TRANSPORTATION" && c.code !== "FUEL");
  const transport = p.charges.find((c) => c.code === "TRANSPORTATION")?.amount ?? 0;
  const fuel = p.charges.find((c) => c.code === "FUEL")?.amount ?? 0;
  return (
    <tr>
      <td className={td}>{p.tracking}</td>
      <td className={`${td} text-xs`}>{p.service.replace("FedEx ", "")}</td>
      <td className={td}>{p.destZip3}</td>
      <td className={tdNum}>{p.zone}</td>
      <td className={`${td} text-xs`}>{p.destAddressType}</td>
      <td className={td}>
        {p.dimsIn.l}×{p.dimsIn.w}×{p.dimsIn.h}
      </td>
      <td className={tdNum}>{p.actualLb}</td>
      <td className={tdNum}>{p.billedLb}</td>
      <td className={`${td} text-xs`}>
        {`Transport ${transport.toFixed(2)}, fuel ${fuel.toFixed(2)}`}
        {surcharges.map((c) => `, ${chargeLabel[c.code] ?? c.code} ${c.amount.toFixed(2)}`).join("")}
      </td>
      <td className={tdNum}>{packageTotal(p).toFixed(2)}</td>
    </tr>
  );
}

function FindingRows({ f }: { f: Finding }) {
  const cannot = f.issue === "CANNOT_VERIFY";
  return (
    <>
      <tr className={cannot ? "text-muted" : ""}>
        <td className={`${td} border-b-0`}>{f.tracking}</td>
        <td className={`${td} border-b-0`}>{chargeLabel[f.charge_code] ?? f.charge_code}</td>
        <td className={`${td} border-b-0 text-xs`}>{issueLabel[f.issue]}</td>
        <td className={`${tdNum} border-b-0`}>{f.billed.toFixed(2)}</td>
        <td className={`${tdNum} border-b-0`}>{f.expected.toFixed(2)}</td>
        <td className={`${tdNum} border-b-0`}>{cannot ? "" : f.recoverable.toFixed(2)}</td>
        <td className={`${td} border-b-0 text-xs`}>{rules[f.rule_id]?.title ?? f.rule_id}</td>
        <td className={`${td} border-b-0 text-xs`}>{f.confidence}</td>
      </tr>
      <tr>
        <td colSpan={8} className="border-b border-rule pb-3 pr-4 text-sm leading-relaxed text-ink/85">
          {f.explanation}
        </td>
      </tr>
    </>
  );
}

function ScoreSection({
  score,
  planted,
  invoiceTotal,
}: {
  score: Score;
  planted: PlantedError[] | null;
  invoiceTotal: number;
}) {
  const caughtKeys = new Set(score.caught.map((p) => `${p.tracking}:${p.code}`));
  const rows = planted ?? [...score.caught, ...score.missed];
  return (
    <section className="mt-12 border-t-2 border-line pt-8">
      <SectionHeading>Against the answer key</SectionHeading>
      <p className="mt-2 max-w-xl leading-relaxed text-muted">
        The errors were planted, so the run can be scored. A catch names the right package and
        the right charge. A false positive is a dispute on a clean line, which is the expensive
        mistake.
      </p>
      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
        <Stat label="Planted" value={String(score.planted)} />
        <Stat label="Caught" value={String(score.caught.length)} />
        <Stat label="Missed" value={String(score.missed.length)} />
        <Stat label="False positives" value={String(score.falsePositives.length)} />
        <Stat
          label="Recoverable, claimed / planted"
          value={`${formatUsd(score.claimedRecoverable)} / ${formatUsd(score.plantedRecoverable)}`}
        />
        <Stat label="Planted, of invoice" value={pct(score.plantedRecoverable, invoiceTotal)} />
      </dl>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Planted errors and whether the agent caught them</caption>
          <thead>
            <tr>
              <th className={th}>Planted error</th>
              <th className={th}>Tracking</th>
              <th className={`${th} text-right`}>Recoverable</th>
              <th className={th}>Result</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const caught = caughtKeys.has(`${p.tracking}:${p.code}`);
              const off = score.amountOff.find((a) => a.planted.tracking === p.tracking);
              return (
                <tr key={`${p.tracking}:${p.code}`}>
                  <td className={`${td} whitespace-normal text-sm`}>
                    <span className="font-sans">{plantedLabel[p.kind]}</span>
                    <span className="mt-1 block font-sans text-xs text-muted">{p.note}</span>
                  </td>
                  <td className={td}>{p.tracking}</td>
                  <td className={tdNum}>{p.recoverable.toFixed(2)}</td>
                  <td className={`${td} text-xs`}>
                    {caught ? (
                      <span className="bg-highlight px-1.5 py-0.5 field-label text-on-highlight">
                        caught{off ? `, claimed ${formatUsd(off.finding.recoverable)}` : ""}
                      </span>
                    ) : (
                      <span className="border border-line px-1.5 py-0.5 field-label">missed</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {score.falsePositives.map((f, i) => (
              <tr key={`fp-${i}`}>
                <td className={`${td} whitespace-normal text-sm`}>
                  <span className="font-sans">False positive: {issueLabel[f.issue]} on {chargeLabel[f.charge_code] ?? f.charge_code}</span>
                  <span className="mt-1 block font-sans text-xs text-muted">{f.explanation}</span>
                </td>
                <td className={td}>{f.tracking}</td>
                <td className={tdNum}>{f.recoverable.toFixed(2)}</td>
                <td className={`${td} text-xs`}>
                  <span className="border border-line px-1.5 py-0.5 field-label">clean line</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
