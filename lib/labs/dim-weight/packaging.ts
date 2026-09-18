/**
 * Packaging programs.
 *
 * Three ways to put the same item in the mail. The item never changes, only
 * the container around it, which isolates the one decision this lab is about.
 * Carton sizes are common stock sizes, not any vendor's catalog.
 */
import type { Dims } from "./billing";
import { categoriesById, type SyntheticItem } from "./products";

export type StrategyId = "stock" | "right-sized" | "mailers";

export type Strategy = {
  id: StrategyId;
  label: string;
  note: string;
};

export const strategies: Strategy[] = [
  {
    id: "stock",
    label: "Three stock cartons",
    note: "Small, medium, large. Every item goes in the smallest one it fits.",
  },
  {
    id: "right-sized",
    label: "Twelve carton set",
    note: "Same fit rule, more sizes, so less air per box.",
  },
  {
    id: "mailers",
    label: "Twelve cartons plus mailers",
    note: "Soft goods leave the box for a poly mailer. Everything else stays boxed.",
  },
];

/** Inside dimensions, longest side first. */
type Carton = { id: string; inside: Dims };

function carton(length: number, width: number, height: number): Carton {
  return { id: `${length}x${width}x${height}`, inside: { length, width, height } };
}

export const stockCartons: Carton[] = [
  carton(10, 8, 4),
  carton(14, 12, 8),
  carton(22, 18, 12),
];

/** A superset of the stock set, so no item ever gets a bigger box. */
export const rightSizedCartons: Carton[] = [
  carton(6, 4, 4),
  carton(8, 6, 4),
  carton(9, 7, 5),
  carton(10, 8, 4),
  carton(10, 8, 6),
  carton(12, 9, 4),
  carton(12, 10, 6),
  carton(14, 10, 8),
  carton(14, 12, 8),
  carton(16, 12, 10),
  carton(18, 14, 10),
  carton(22, 18, 12),
];

/** Clearance added to each item dimension for dunnage, in inches. */
export const PACKING_CLEARANCE_IN = 1;
/** Corrugated wall adds to every outside dimension. */
export const CARTON_WALL_IN = 0.25;
/** Single wall corrugated, pounds per square inch of board. */
const BOARD_LB_PER_SQ_IN = 0.0007;
const DUNNAGE_LB = 0.1;
const MAILER_LB = 0.06;
/** A mailer adds a little on the flat sides and almost nothing to height. */
const MAILER_FLAT_ALLOWANCE_IN = 1;
const MAILER_HEIGHT_ALLOWANCE_IN = 0.25;

export type Package = {
  container: string;
  kind: "carton" | "mailer";
  /** Outside dimensions as a carrier would measure them. */
  dims: Dims;
  weightLb: number;
};

function sortedSides(dims: Dims): number[] {
  return [dims.length, dims.width, dims.height].sort((a, b) => b - a);
}

function fits(item: Dims, box: Dims): boolean {
  const need = sortedSides(item).map((side) => side + PACKING_CLEARANCE_IN);
  const have = sortedSides(box);
  return need.every((side, index) => side <= have[index] + 1e-9);
}

function volume(dims: Dims): number {
  return dims.length * dims.width * dims.height;
}

function surfaceArea({ length, width, height }: Dims): number {
  return 2 * (length * width + length * height + width * height);
}

function boxItem(item: SyntheticItem, catalog: Carton[]): Package {
  const chosen =
    [...catalog]
      .sort((a, b) => volume(a.inside) - volume(b.inside))
      .find((candidate) => fits(item.dims, candidate.inside)) ??
    catalog[catalog.length - 1];

  const outside: Dims = {
    length: chosen.inside.length + CARTON_WALL_IN,
    width: chosen.inside.width + CARTON_WALL_IN,
    height: chosen.inside.height + CARTON_WALL_IN,
  };

  return {
    container: `${chosen.id} carton`,
    kind: "carton",
    dims: outside,
    weightLb: item.weightLb + surfaceArea(outside) * BOARD_LB_PER_SQ_IN + DUNNAGE_LB,
  };
}

function bagItem(item: SyntheticItem): Package {
  const { bagCompression } = categoriesById.get(item.category)!;
  return {
    container: "poly mailer",
    kind: "mailer",
    dims: {
      length: item.dims.length + MAILER_FLAT_ALLOWANCE_IN,
      width: item.dims.width + MAILER_FLAT_ALLOWANCE_IN,
      height: item.dims.height * bagCompression + MAILER_HEIGHT_ALLOWANCE_IN,
    },
    weightLb: item.weightLb + MAILER_LB,
  };
}

export function packItem(item: SyntheticItem, strategy: StrategyId): Package {
  switch (strategy) {
    case "stock":
      return boxItem(item, stockCartons);
    case "right-sized":
      return boxItem(item, rightSizedCartons);
    case "mailers":
      return categoriesById.get(item.category)!.mailerEligible
        ? bagItem(item)
        : boxItem(item, rightSizedCartons);
  }
}

/** True when an item fits some carton in the catalog without the fallback. */
export function fitsCatalog(item: SyntheticItem, catalog: Carton[]): boolean {
  return catalog.some((candidate) => fits(item.dims, candidate.inside));
}
