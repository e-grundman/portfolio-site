import { describe, expect, it } from "vitest";
import { discrepancies, score, type Finding } from "./checks";
import { buildFixture, billableLb, DEFAULT_SEED, packageTotal } from "./invoice";

describe("invoice fixture", () => {
  const fixture = buildFixture(DEFAULT_SEED);

  it("is deterministic for a seed", () => {
    const again = buildFixture(DEFAULT_SEED);
    expect(again.invoice.total).toBe(fixture.invoice.total);
    expect(again.invoice.packages.map((p) => p.tracking)).toEqual(
      fixture.invoice.packages.map((p) => p.tracking),
    );
  });

  it("plants eight errors on distinct packages", () => {
    expect(fixture.planted).toHaveLength(8);
    expect(new Set(fixture.planted.map((p) => p.tracking)).size).toBe(8);
    for (const p of fixture.planted) expect(p.recoverable).toBeGreaterThan(0);
  });

  it("totals the invoice from its lines", () => {
    const sum = fixture.invoice.packages.reduce((s, p) => s + packageTotal(p), 0);
    expect(Math.abs(sum - fixture.invoice.total)).toBeLessThan(0.02);
  });

  it("rounds dims up before the dim weight math", () => {
    // 12x12x12 = 1728 / 139 = 12.43, rounds to 13
    expect(billableLb({ l: 12, w: 12, h: 12 }, 9)).toBe(13);
    // 11.2x11.2x11.2 rounds each side to 12 first
    expect(billableLb({ l: 11.2, w: 11.2, h: 11.2 }, 9)).toBe(13);
  });
});

describe("deterministic checks", () => {
  const fixture = buildFixture(DEFAULT_SEED);
  const found = discrepancies(fixture.invoice);

  it("finds every planted error and touches no clean package", () => {
    const plantedKeys = new Set(fixture.planted.map((p) => `${p.tracking}:${p.code}`));
    const plantedTracking = new Set(fixture.planted.map((p) => p.tracking));
    // Fuel rides on the disputed surcharges, and a misbilled surcharge changes
    // the companion line (the AHS that should have replaced an Oversize), so
    // companions on a planted package are expected. Clean packages must be clean.
    const onCleanPackages = found.filter((d) => !plantedTracking.has(d.tracking));
    expect(onCleanPackages).toEqual([]);
    for (const key of plantedKeys) {
      expect(found.some((d) => `${d.tracking}:${d.code}` === key)).toBe(true);
    }
  });

  it("agrees with the answer key on billed and expected amounts", () => {
    for (const p of fixture.planted) {
      const d = found.find((x) => x.tracking === p.tracking && x.code === p.code)!;
      expect(d.billed).toBeCloseTo(p.billed, 2);
      expect(d.expected).toBeCloseTo(p.expected, 2);
    }
  });
});

describe("scoring", () => {
  const fixture = buildFixture(DEFAULT_SEED);

  it("scores a perfect submission as eight caught, no false positives", () => {
    const findings: Finding[] = fixture.planted.map((p) => ({
      tracking: p.tracking,
      charge_code: p.code,
      issue: "WRONG_AMOUNT",
      billed: p.billed,
      expected: p.expected,
      recoverable: p.recoverable,
      rule_id: p.ruleId,
      explanation: p.note,
      confidence: "high",
    }));
    const s = score(fixture, findings);
    expect(s.caught).toHaveLength(8);
    expect(s.missed).toHaveLength(0);
    expect(s.falsePositives).toHaveLength(0);
    expect(s.amountOff).toHaveLength(0);
  });

  it("does not count CANNOT_VERIFY as a false positive", () => {
    const honest = fixture.invoice.packages.find((p) => p.dasTier !== "none")!;
    const s = score(fixture, [
      {
        tracking: honest.tracking,
        charge_code: "DAS",
        issue: "CANNOT_VERIFY",
        billed: 6.6,
        expected: 6.6,
        recoverable: 0,
        rule_id: "DAS",
        explanation: "ZIP eligibility needs the DAS table.",
        confidence: "low",
      },
    ]);
    expect(s.falsePositives).toHaveLength(0);
    expect(s.missed).toHaveLength(8);
  });
});
