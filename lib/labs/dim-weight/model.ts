/**
 * Packaging program model.
 *
 * Pack every synthetic item under a packaging strategy, bill it under a dim
 * weight rule set, and price it on the shared synthetic rate table. The same
 * item is also priced on actual weight alone, and the gap between the two is
 * the air premium: what the carrier charged for space the product did not use.
 */
import { getRate } from "@/lib/rates";
import { billableWeight, type BillableResult } from "./billing";
import { packItem, strategies, type Package, type StrategyId } from "./packaging";
import {
  categories,
  generateItems,
  type CategoryId,
  type SyntheticItem,
} from "./products";
import { dimRules, dimRulesById, type DimRule } from "./rules";

export type PricedItem = {
  item: SyntheticItem;
  pkg: Package;
  billing: BillableResult;
  cost: number;
  costOnActual: number;
};

export type CategoryResult = {
  category: CategoryId;
  label: string;
  orders: number;
  dimBilledShare: number;
  averageActualLb: number;
  averageBillableLb: number;
  airPremiumPerOrder: number;
};

export type StrategyResult = {
  strategy: StrategyId;
  label: string;
  rule: DimRule;
  orderCount: number;
  dimBilledShare: number;
  /** Package weight as the carrier bills it before dim, whole pounds. */
  averageActualLb: number;
  averageBillableLb: number;
  costPerOrder: number;
  costOnActualPerOrder: number;
  airPremiumPerOrder: number;
  totalCost: number;
  byCategory: CategoryResult[];
};

export type StrategyComparison = StrategyResult & {
  /** Against the first strategy in the list. Negative is cheaper. */
  costPerOrderDelta: number;
  costPerOrderPctDelta: number;
  savingsAtOrderCount: number;
};

function getRule(ruleId: string): DimRule {
  const rule = dimRulesById.get(ruleId);
  if (!rule) throw new Error(`Unknown dim rule ${ruleId}`);
  return rule;
}

export function priceItem(
  item: SyntheticItem,
  strategy: StrategyId,
  rule: DimRule,
): PricedItem {
  const pkg = packItem(item, strategy);
  const billing = billableWeight(pkg.dims, pkg.weightLb, rule);
  const cost = getRate({
    zone: item.zone,
    billableWeightLb: billing.billableLb,
    residential: item.residential,
  }).total;
  const costOnActual = getRate({
    zone: item.zone,
    billableWeightLb: billing.actualBilledLb,
    residential: item.residential,
  }).total;
  return { item, pkg, billing, cost, costOnActual };
}

export function priceItems(
  strategy: StrategyId,
  ruleId: string,
  items: SyntheticItem[] = generateItems(),
): PricedItem[] {
  const rule = getRule(ruleId);
  return items.map((item) => priceItem(item, strategy, rule));
}

type Totals = {
  orders: number;
  dimBilled: number;
  actualLb: number;
  billableLb: number;
  cost: number;
  costOnActual: number;
};

const emptyTotals = (): Totals => ({
  orders: 0,
  dimBilled: 0,
  actualLb: 0,
  billableLb: 0,
  cost: 0,
  costOnActual: 0,
});

function addTo(totals: Totals, priced: PricedItem): void {
  totals.orders += 1;
  totals.dimBilled += priced.billing.dimBinds ? 1 : 0;
  totals.actualLb += priced.billing.actualBilledLb;
  totals.billableLb += priced.billing.billableLb;
  totals.cost += priced.cost;
  totals.costOnActual += priced.costOnActual;
}

const per = (value: number, count: number) => (count === 0 ? 0 : value / count);

export function evaluateStrategy(
  strategy: StrategyId,
  ruleId: string,
  items: SyntheticItem[] = generateItems(),
): StrategyResult {
  const rule = getRule(ruleId);
  const overall = emptyTotals();
  const byCategory = new Map<CategoryId, Totals>(
    categories.map((category) => [category.id, emptyTotals()]),
  );

  for (const item of items) {
    const priced = priceItem(item, strategy, rule);
    addTo(overall, priced);
    addTo(byCategory.get(item.category)!, priced);
  }

  return {
    strategy,
    label: strategies.find((s) => s.id === strategy)!.label,
    rule,
    orderCount: overall.orders,
    dimBilledShare: per(overall.dimBilled, overall.orders),
    averageActualLb: per(overall.actualLb, overall.orders),
    averageBillableLb: per(overall.billableLb, overall.orders),
    costPerOrder: per(overall.cost, overall.orders),
    costOnActualPerOrder: per(overall.costOnActual, overall.orders),
    airPremiumPerOrder: per(overall.cost - overall.costOnActual, overall.orders),
    totalCost: overall.cost,
    byCategory: categories.map((category) => {
      const totals = byCategory.get(category.id)!;
      return {
        category: category.id,
        label: category.label,
        orders: totals.orders,
        dimBilledShare: per(totals.dimBilled, totals.orders),
        averageActualLb: per(totals.actualLb, totals.orders),
        averageBillableLb: per(totals.billableLb, totals.orders),
        airPremiumPerOrder: per(totals.cost - totals.costOnActual, totals.orders),
      };
    }),
  };
}

/** Every strategy under one rule set, compared against the first strategy. */
export function compareStrategies(
  ruleId: string,
  items: SyntheticItem[] = generateItems(),
): StrategyComparison[] {
  const results = strategies.map((strategy) =>
    evaluateStrategy(strategy.id, ruleId, items),
  );
  const baseline = results[0];

  return results.map((result) => ({
    ...result,
    costPerOrderDelta: result.costPerOrder - baseline.costPerOrder,
    costPerOrderPctDelta:
      baseline.costPerOrder === 0
        ? 0
        : (result.costPerOrder - baseline.costPerOrder) / baseline.costPerOrder,
    savingsAtOrderCount:
      (baseline.costPerOrder - result.costPerOrder) * result.orderCount,
  }));
}

export type RuleMatrixRow = {
  strategy: StrategyId;
  label: string;
  /** Cost per order under each rule, in dimRules order. */
  costPerOrder: number[];
  dimBilledShare: number[];
};

/** Every strategy under every rule set. The rule change, priced. */
export function ruleMatrix(
  items: SyntheticItem[] = generateItems(),
): RuleMatrixRow[] {
  return strategies.map((strategy) => {
    const results = dimRules.map((rule) =>
      evaluateStrategy(strategy.id, rule.id, items),
    );
    return {
      strategy: strategy.id,
      label: strategy.label,
      costPerOrder: results.map((result) => result.costPerOrder),
      dimBilledShare: results.map((result) => result.dimBilledShare),
    };
  });
}
