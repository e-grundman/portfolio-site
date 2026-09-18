import { describe, expect, it } from "vitest";
import {
  billableWeight,
  breakEvenDensity,
  breakEvenWeightLb,
  maxCubicInchesAtWeight,
  roundSide,
} from "./billing";
import { compareStrategies, evaluateStrategy, ruleMatrix } from "./model";
import {
  fitsCatalog,
  packItem,
  rightSizedCartons,
  stockCartons,
  strategies,
} from "./packaging";
import { generateItems } from "./products";
import { dimRules, dimRulesById } from "./rules";

const rule = (id: string) => dimRulesById.get(id)!;
const items = generateItems(4000);

describe("side rounding", () => {
  it("rounds a fractional inch up under the current rule", () => {
    expect(roundSide(12.1, "up")).toBe(13);
    expect(roundSide(12, "up")).toBe(12);
  });

  it("rounds to the nearest inch under the earlier rule", () => {
    expect(roundSide(12.1, "nearest")).toBe(12);
    expect(roundSide(12.5, "nearest")).toBe(13);
  });
});

describe("billable weight", () => {
  it("bills dimensional weight when the box is light for its size", () => {
    const result = billableWeight(
      { length: 20, width: 20, height: 12 },
      4,
      rule("ups-fedex-now"),
    );
    expect(result.cubicInches).toBe(4800);
    expect(result.dimWeightLb).toBe(35);
    expect(result.billableLb).toBe(35);
    expect(result.dimBinds).toBe(true);
  });

  it("bills actual weight when the box is dense", () => {
    const result = billableWeight(
      { length: 8, width: 6, height: 4 },
      9.2,
      rule("ups-fedex-now"),
    );
    expect(result.billableLb).toBe(10);
    expect(result.dimBinds).toBe(false);
  });

  it("charges more for the same box after the round up rule", () => {
    const dims = { length: 12.25, width: 10.25, height: 6.25 };
    const before = billableWeight(dims, 1, rule("ups-fedex-before"));
    const after = billableWeight(dims, 1, rule("ups-fedex-now"));
    expect(before.cubicInches).toBe(12 * 10 * 6);
    expect(after.cubicInches).toBe(13 * 11 * 7);
    expect(after.billableLb).toBeGreaterThan(before.billableLb);
  });

  it("skips dim weight below one cubic foot under USPS rules", () => {
    const result = billableWeight(
      { length: 12, width: 12, height: 12 },
      1,
      rule("usps-now"),
    );
    expect(result.dimWeightLb).toBeUndefined();
    expect(result.billableLb).toBe(1);
  });

  it("applies dim weight just past one cubic foot under USPS rules", () => {
    const result = billableWeight(
      { length: 12.1, width: 12, height: 12 },
      1,
      rule("usps-now"),
    );
    expect(result.cubicInches).toBe(13 * 12 * 12);
    expect(result.dimWeightLb).toBe(14);
  });

  it("never bills below the actual weight", () => {
    for (const r of dimRules) {
      for (const item of items.slice(0, 500)) {
        const pkg = packItem(item, "stock");
        const result = billableWeight(pkg.dims, pkg.weightLb, r);
        expect(result.billableLb).toBeGreaterThanOrEqual(result.actualBilledLb);
      }
    }
  });
});

describe("break even", () => {
  it("puts the density line near 12.4 lb per cubic foot at 139", () => {
    expect(breakEvenDensity(rule("ups-fedex-now"))).toBeCloseTo(12.43, 2);
    expect(breakEvenDensity(rule("usps-before"))).toBeCloseTo(10.41, 2);
  });

  it("switches billing basis exactly at the break even weight", () => {
    const dims = { length: 14.25, width: 12.25, height: 8.25 };
    const r = rule("ups-fedex-now");
    const breakEven = breakEvenWeightLb(dims, r);
    expect(billableWeight(dims, breakEven, r).dimBinds).toBe(true);
    expect(billableWeight(dims, breakEven + 0.1, r).dimBinds).toBe(false);
  });

  it("bills actual weight up to the largest cube at that weight", () => {
    const r = rule("ups-fedex-now");
    const cube = maxCubicInchesAtWeight(5, r);
    expect(cube).toBe(5 * 139);
    expect(Math.ceil(cube / r.divisor)).toBe(5);
    expect(Math.ceil((cube + 1) / r.divisor)).toBe(6);
  });
});

describe("packaging", () => {
  it("fits every synthetic item into both catalogs", () => {
    for (const item of items) {
      expect(fitsCatalog(item, stockCartons)).toBe(true);
      expect(fitsCatalog(item, rightSizedCartons)).toBe(true);
    }
  });

  it("never gives the twelve carton set a bigger box than the stock set", () => {
    for (const item of items) {
      const stock = packItem(item, "stock").dims;
      const sized = packItem(item, "right-sized").dims;
      expect(sized.length * sized.width * sized.height).toBeLessThanOrEqual(
        stock.length * stock.width * stock.height,
      );
    }
  });

  it("only bags mailer eligible categories", () => {
    for (const item of items) {
      const pkg = packItem(item, "mailers");
      if (item.category === "beauty" || item.category === "home" || item.category === "dense") {
        expect(pkg.kind).toBe("carton");
      }
    }
  });
});

describe("strategy model", () => {
  it("is deterministic", () => {
    const a = evaluateStrategy("stock", "ups-fedex-now", items);
    const b = evaluateStrategy("stock", "ups-fedex-now", generateItems(4000));
    expect(a.costPerOrder).toBe(b.costPerOrder);
  });

  it("gets cheaper as packaging tightens", () => {
    const [stock, sized, mailers] = compareStrategies("ups-fedex-now", items);
    expect(sized.costPerOrder).toBeLessThan(stock.costPerOrder);
    expect(mailers.costPerOrder).toBeLessThan(sized.costPerOrder);
    expect(stock.costPerOrderDelta).toBe(0);
  });

  it("never reports a negative air premium", () => {
    for (const result of compareStrategies("ups-fedex-now", items)) {
      expect(result.airPremiumPerOrder).toBeGreaterThanOrEqual(0);
      for (const category of result.byCategory) {
        expect(category.airPremiumPerOrder).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("prices the round up rule as a cost increase for every strategy", () => {
    const before = dimRules.findIndex((r) => r.id === "ups-fedex-before");
    const after = dimRules.findIndex((r) => r.id === "ups-fedex-now");
    for (const row of ruleMatrix(items)) {
      expect(row.costPerOrder[after]).toBeGreaterThan(row.costPerOrder[before]);
    }
  });

  it("covers every strategy", () => {
    expect(ruleMatrix(items)).toHaveLength(strategies.length);
  });
});
