/**
 * Network configuration model.
 *
 * Given a set of fulfillment nodes and a synthetic order book, assign every
 * order to a node, then report the zone distribution and the blended cost per
 * package. The zone lookup and the rate table are injected through their own
 * modules, so either can be replaced without touching this file.
 */
import { getRate } from "@/lib/rates";
import { ZONES, getZone, type Zone } from "@/lib/zones";
import { nodesById, type FulfillmentNode } from "./nodes";
import { generateOrders, type SyntheticOrder } from "./orders";

export type ZoneHistogram = Record<Zone, number>;

export type NodeAssignment = {
  node: FulfillmentNode;
  orders: number;
  share: number;
  averageZone: number;
};

export type ConfigurationResult = {
  nodeIds: string[];
  nodes: FulfillmentNode[];
  label: string;
  orderCount: number;
  histogram: ZoneHistogram;
  /** Share of orders in each zone, 0 to 1. Keeps the chart comparable. */
  histogramShare: ZoneHistogram;
  averageZone: number;
  totalCost: number;
  costPerPackage: number;
  assignments: NodeAssignment[];
  /** Orders with no servable destination. Expected to be zero. */
  unservedOrders: number;
};

export type ConfigurationComparison = ConfigurationResult & {
  /** Cost per package against the first configuration in the list. */
  costPerPackageDelta: number;
  costPerPackagePctDelta: number;
  averageZoneDelta: number;
  annualSavingsAtOrderCount: number;
};

function emptyHistogram(): ZoneHistogram {
  return ZONES.reduce((acc, zone) => {
    acc[zone] = 0;
    return acc;
  }, {} as ZoneHistogram);
}

/**
 * Cheapest zone wins, and cost breaks a tie.
 *
 * Zone first rather than cost first is deliberate. Zone is the structural
 * variable a network designer controls through node placement, and it also
 * drives transit time, so a tie on zone is a genuine tie. Cost only separates
 * nodes when the zone is identical, which happens where two nodes sit in the
 * same distance band from the destination.
 */
function selectNode(
  order: SyntheticOrder,
  nodes: FulfillmentNode[],
): { node: FulfillmentNode; zone: Zone; cost: number } | undefined {
  let best: { node: FulfillmentNode; zone: Zone; cost: number } | undefined;

  for (const node of nodes) {
    const zone = getZone(node.zip3, order.destZip3);
    if (zone === undefined) continue;

    const cost = getRate({
      zone,
      billableWeightLb: order.weightLb,
      residential: order.residential,
    }).total;

    if (
      !best ||
      zone < best.zone ||
      (zone === best.zone && cost < best.cost - 1e-9)
    ) {
      best = { node, zone, cost };
    }
  }

  return best;
}

export function describeConfiguration(nodeIds: string[]): string {
  const nodes = nodeIds
    .map((id) => nodesById.get(id))
    .filter((node): node is FulfillmentNode => Boolean(node));
  if (nodes.length === 0) return "No nodes";
  return nodes.map((node) => `${node.city}, ${node.state}`).join(" + ");
}

export function evaluateConfiguration(
  nodeIds: string[],
  orders: SyntheticOrder[] = generateOrders(),
): ConfigurationResult {
  const nodes = nodeIds
    .map((id) => nodesById.get(id))
    .filter((node): node is FulfillmentNode => Boolean(node));

  const histogram = emptyHistogram();
  const histogramShare = emptyHistogram();
  const perNodeOrders = new Map<string, { orders: number; zoneSum: number }>();

  let zoneSum = 0;
  let totalCost = 0;
  let served = 0;
  let unservedOrders = 0;

  for (const order of orders) {
    const selection = selectNode(order, nodes);
    if (!selection) {
      unservedOrders += 1;
      continue;
    }

    histogram[selection.zone] += 1;
    zoneSum += selection.zone;
    totalCost += selection.cost;
    served += 1;

    const bucket = perNodeOrders.get(selection.node.id) ?? {
      orders: 0,
      zoneSum: 0,
    };
    bucket.orders += 1;
    bucket.zoneSum += selection.zone;
    perNodeOrders.set(selection.node.id, bucket);
  }

  for (const zone of ZONES) {
    histogramShare[zone] = served === 0 ? 0 : histogram[zone] / served;
  }

  const assignments: NodeAssignment[] = nodes.map((node) => {
    const bucket = perNodeOrders.get(node.id) ?? { orders: 0, zoneSum: 0 };
    return {
      node,
      orders: bucket.orders,
      share: served === 0 ? 0 : bucket.orders / served,
      averageZone: bucket.orders === 0 ? 0 : bucket.zoneSum / bucket.orders,
    };
  });

  return {
    nodeIds,
    nodes,
    label: describeConfiguration(nodeIds),
    orderCount: served,
    histogram,
    histogramShare,
    averageZone: served === 0 ? 0 : zoneSum / served,
    totalCost,
    costPerPackage: served === 0 ? 0 : totalCost / served,
    assignments,
    unservedOrders,
  };
}

/**
 * Compare configurations against the first one in the list, which is the
 * baseline. Deltas are negative when the configuration is cheaper.
 */
export function compareConfigurations(
  configurations: string[][],
  orders: SyntheticOrder[] = generateOrders(),
): ConfigurationComparison[] {
  const results = configurations.map((nodeIds) =>
    evaluateConfiguration(nodeIds, orders),
  );
  const baseline = results[0];

  return results.map((result) => ({
    ...result,
    costPerPackageDelta: result.costPerPackage - baseline.costPerPackage,
    costPerPackagePctDelta:
      baseline.costPerPackage === 0
        ? 0
        : (result.costPerPackage - baseline.costPerPackage) /
          baseline.costPerPackage,
    averageZoneDelta: result.averageZone - baseline.averageZone,
    annualSavingsAtOrderCount:
      (baseline.costPerPackage - result.costPerPackage) * result.orderCount,
  }));
}
