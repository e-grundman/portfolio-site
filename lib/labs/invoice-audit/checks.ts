/**
 * Deterministic checks and scoring.
 *
 * `expectedLines` rebuilds what each package should have been billed from the
 * shipper's own facts and the published rules. `discrepancies` is the
 * arithmetic pass: every line where billed and expected differ. It exists to
 * prove the answer key is findable and to score the agent, not to replace it.
 * The agent's job is the part arithmetic cannot do: deciding which rule
 * governs a line, saying what cannot be verified, and writing the claim.
 */
import {
  correctCharges,
  packageTotal,
  type AuditFixture,
  type ChargeCode,
  type Invoice,
  type InvoicePackage,
  type PlantedError,
} from "./invoice";
import type { RuleId } from "./rules";

export type IssueType =
  | "NOT_APPLICABLE"
  | "WRONG_AMOUNT"
  | "DUPLICATE"
  | "WEIGHT_OVERSTATED"
  | "FUEL_MISCALCULATED"
  | "CANNOT_VERIFY";

export type Finding = {
  tracking: string;
  charge_code: ChargeCode;
  issue: IssueType;
  billed: number;
  expected: number;
  recoverable: number;
  rule_id: RuleId;
  explanation: string;
  confidence: "high" | "medium" | "low";
};

export type Discrepancy = {
  tracking: string;
  code: ChargeCode;
  billed: number;
  expected: number;
  delta: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function sumBy(charges: { code: ChargeCode; amount: number }[], code: ChargeCode): number {
  return round2(charges.filter((c) => c.code === code).reduce((s, c) => s + c.amount, 0));
}

/** Every line where the billed total for a charge code differs from the rebuilt one. */
export function discrepancies(invoice: Invoice): Discrepancy[] {
  const out: Discrepancy[] = [];
  for (const p of invoice.packages) {
    const { charges: expected } = correctCharges(p, invoice.fuelPct);
    const codes = new Set<ChargeCode>([
      ...p.charges.map((c) => c.code),
      ...expected.map((c) => c.code),
    ]);
    for (const code of codes) {
      const billed = sumBy(p.charges, code);
      const should = sumBy(expected, code);
      if (Math.abs(billed - should) > 0.005) {
        out.push({ tracking: p.tracking, code, billed, expected: should, delta: round2(billed - should) });
      }
    }
  }
  return out;
}

export type Score = {
  planted: number;
  caught: PlantedError[];
  missed: PlantedError[];
  falsePositives: Finding[];
  /** Findings that flag a real planted line but with the wrong dollar recovery. */
  amountOff: { finding: Finding; planted: PlantedError }[];
  plantedRecoverable: number;
  claimedRecoverable: number;
};

/**
 * Score findings against the answer key. A finding counts as a catch when it
 * names the planted tracking number and charge code. CANNOT_VERIFY findings
 * are neither catches nor false positives: they are the agent saying what it
 * does not know, which is the behavior the page is trying to show.
 */
export function score(fixture: AuditFixture, findings: Finding[]): Score {
  const caught: PlantedError[] = [];
  const missed: PlantedError[] = [];
  const amountOff: Score["amountOff"] = [];
  const matched = new Set<Finding>();

  for (const planted of fixture.planted) {
    const hit = findings.find(
      (f) =>
        f.tracking === planted.tracking &&
        f.charge_code === planted.code &&
        f.issue !== "CANNOT_VERIFY",
    );
    if (hit) {
      caught.push(planted);
      matched.add(hit);
      // Fuel rides on most surcharges, so allow a tolerance of the fuel share.
      if (Math.abs(hit.recoverable - planted.recoverable) > Math.max(0.5, planted.recoverable * 0.2)) {
        amountOff.push({ finding: hit, planted });
      }
    } else {
      missed.push(planted);
    }
  }

  const falsePositives = findings.filter(
    (f) => !matched.has(f) && f.issue !== "CANNOT_VERIFY",
  );

  return {
    planted: fixture.planted.length,
    caught,
    missed,
    falsePositives,
    amountOff,
    plantedRecoverable: round2(fixture.planted.reduce((s, p) => s + p.recoverable, 0)),
    claimedRecoverable: round2(
      findings.filter((f) => f.issue !== "CANNOT_VERIFY").reduce((s, f) => s + f.recoverable, 0),
    ),
  };
}

/** Compact one-line-per-package view the agent starts from. */
export function packageSummaryTable(invoice: Invoice): string {
  const header =
    "tracking | service | ship_date | dest_zip3 | zone | address_type | dims_in (LxWxH) | actual_lb | billed_lb | charges (code=amount) | line_total";
  const rows = invoice.packages.map((p) =>
    [
      p.tracking,
      p.service,
      p.shipDate,
      p.destZip3,
      p.zone,
      p.destAddressType,
      `${p.dimsIn.l}x${p.dimsIn.w}x${p.dimsIn.h}`,
      p.actualLb,
      p.billedLb,
      p.charges.map((c) => `${c.code}=${c.amount.toFixed(2)}`).join(" "),
      packageTotal(p).toFixed(2),
    ].join(" | "),
  );
  return [header, ...rows].join("\n");
}

export function packageDetail(p: InvoicePackage): string {
  return JSON.stringify(
    {
      ...p,
      lineTotal: packageTotal(p),
    },
    null,
    2,
  );
}
