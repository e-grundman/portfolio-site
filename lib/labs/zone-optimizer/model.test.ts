import { describe, expect, it } from "vitest";
import { getBaseRate, getRate } from "@/lib/rates";
import { ZONES, getZone, roadMiles, getCentroid } from "@/lib/zones";
import { compareConfigurations, evaluateConfiguration } from "./model";
import { generateOrders } from "./orders";
import { candidateNodes } from "./nodes";

/** Smaller book keeps the suite fast. The model does not care about size. */
const orders = generateOrders(4000);

describe("zone lookup", () => {
  it("puts a node's own ZIP3 in zone 2", () => {
    for (const node of candidateNodes) {
      expect(getZone(node.zip3, node.zip3)).toBe(2);
    }
  });

  it("assigns coast to coast the far zone", () => {
    expect(getZone("917", "100")).toBe(8);
    expect(getZone("981", "331")).toBe(8);
  });

  it("never assigns a zone outside the published bands", () => {
    for (const node of candidateNodes.slice(0, 3)) {
      for (const order of orders.slice(0, 500)) {
        const zone = getZone(node.zip3, order.destZip3);
        expect(zone).toBeDefined();
        expect(ZONES).toContain(zone);
      }
    }
  });

  it("rises monotonically with distance from one origin", () => {
    const origin = getCentroid("660")!;
    const sample = orders.slice(0, 800).map((order) => ({
      miles: roadMiles(origin, getCentroid(order.destZip3)!),
      zone: getZone("660", order.destZip3)!,
    }));
    for (const a of sample) {
      for (const b of sample) {
        if (a.miles < b.miles) expect(a.zone).toBeLessThanOrEqual(b.zone);
      }
    }
  });
});

describe("rate table", () => {
  it("rises with weight inside a zone", () => {
    for (const zone of ZONES) {
      for (let weight = 1; weight < 70; weight += 1) {
        expect(getBaseRate(zone, weight + 1)).toBeGreaterThan(
          getBaseRate(zone, weight),
        );
      }
    }
  });

  it("rises with zone at a fixed weight", () => {
    for (let i = 1; i < ZONES.length; i += 1) {
      expect(getBaseRate(ZONES[i], 10)).toBeGreaterThan(
        getBaseRate(ZONES[i - 1], 10),
      );
    }
  });

  it("adds fuel on the base and residential as a flat fee", () => {
    const commercial = getRate({ zone: 5, billableWeightLb: 10 });
    const residential = getRate({
      zone: 5,
      billableWeightLb: 10,
      residential: true,
    });
    expect(commercial.total).toBeCloseTo(commercial.base + commercial.fuel, 10);
    expect(residential.total - commercial.total).toBeCloseTo(5.95, 10);
  });
});

describe("configuration model", () => {
  it("serves every order from a single node", () => {
    const result = evaluateConfiguration(["kansas-city-ks"], orders);
    expect(result.unservedOrders).toBe(0);
    expect(result.orderCount).toBe(orders.length);
  });

  it("blended cost per package equals total spend over order count", () => {
    const result = evaluateConfiguration(["atlanta-ga", "city-of-industry-ca"], orders);
    expect(result.costPerPackage).toBeCloseTo(
      result.totalCost / result.orderCount,
      10,
    );
  });

  it("histogram counts sum to the served order count", () => {
    const result = evaluateConfiguration(["edison-nj", "dallas-tx"], orders);
    const counted = ZONES.reduce((sum, zone) => sum + result.histogram[zone], 0);
    expect(counted).toBe(result.orderCount);
    const share = ZONES.reduce(
      (sum, zone) => sum + result.histogramShare[zone],
      0,
    );
    expect(share).toBeCloseTo(1, 10);
  });

  it("adding a node never raises average zone or cost per package", () => {
    const one = evaluateConfiguration(["edison-nj"], orders);
    const two = evaluateConfiguration(["edison-nj", "city-of-industry-ca"], orders);
    const three = evaluateConfiguration(
      ["edison-nj", "city-of-industry-ca", "dallas-tx"],
      orders,
    );

    expect(two.averageZone).toBeLessThanOrEqual(one.averageZone);
    expect(three.averageZone).toBeLessThanOrEqual(two.averageZone);
    expect(two.costPerPackage).toBeLessThanOrEqual(one.costPerPackage);
    expect(three.costPerPackage).toBeLessThanOrEqual(two.costPerPackage);
  });

  it("assignment shares sum to one and orders sum to the book", () => {
    const result = evaluateConfiguration(
      ["chicago-il", "atlanta-ga", "las-vegas-nv"],
      orders,
    );
    const totalOrders = result.assignments.reduce((sum, a) => sum + a.orders, 0);
    const totalShare = result.assignments.reduce((sum, a) => sum + a.share, 0);
    expect(totalOrders).toBe(result.orderCount);
    expect(totalShare).toBeCloseTo(1, 10);
  });

  it("reports deltas against the first configuration", () => {
    const [baseline, twoNode] = compareConfigurations(
      [["edison-nj"], ["edison-nj", "city-of-industry-ca"]],
      orders,
    );
    expect(baseline.costPerPackageDelta).toBe(0);
    expect(twoNode.costPerPackageDelta).toBeLessThan(0);
    expect(twoNode.annualSavingsAtOrderCount).toBeGreaterThan(0);
    expect(twoNode.costPerPackagePctDelta).toBeLessThan(0);
  });
});

describe("synthetic order book", () => {
  it("is deterministic for a seed", () => {
    expect(generateOrders(100, 42)).toEqual(generateOrders(100, 42));
  });

  it("stays inside the rate table weight range", () => {
    for (const order of orders) {
      expect(order.weightLb).toBeGreaterThanOrEqual(1);
      expect(order.weightLb).toBeLessThanOrEqual(70);
    }
  });
});
