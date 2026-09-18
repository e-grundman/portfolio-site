/**
 * Billable weight for one package under one rule set.
 *
 * Carriers bill the greater of actual weight and dimensional weight, both
 * rounded up to the next whole pound. Dimensional weight is the rounded volume
 * divided by the divisor. The rounding of each side happens before the volume
 * is taken, which is why a rounding rule change moves the bill without the box
 * changing at all.
 */
import {
  CUBIC_INCHES_PER_CUBIC_FOOT,
  type DimRule,
  type Rounding,
} from "./rules";

export type Dims = { length: number; width: number; height: number };

export type BillableResult = {
  roundedDims: Dims;
  cubicInches: number;
  /** Undefined when the package sits below the rule's size threshold. */
  dimWeightLb: number | undefined;
  actualBilledLb: number;
  billableLb: number;
  /** True when the carrier is charging for space rather than weight. */
  dimBinds: boolean;
};

/** Float noise guard, so 12.0000001 does not round up to 13. */
const EPSILON = 1e-9;

export function roundSide(inches: number, rounding: Rounding): number {
  const rounded =
    rounding === "up" ? Math.ceil(inches - EPSILON) : Math.round(inches);
  return Math.max(1, rounded);
}

export function roundUpPounds(pounds: number): number {
  return Math.max(1, Math.ceil(pounds - EPSILON));
}

export function roundDims(dims: Dims, rounding: Rounding): Dims {
  return {
    length: roundSide(dims.length, rounding),
    width: roundSide(dims.width, rounding),
    height: roundSide(dims.height, rounding),
  };
}

export function billableWeight(
  dims: Dims,
  actualLb: number,
  rule: DimRule,
): BillableResult {
  const roundedDims = roundDims(dims, rule.rounding);
  const cubicInches =
    roundedDims.length * roundedDims.width * roundedDims.height;
  const actualBilledLb = roundUpPounds(actualLb);

  const applies = cubicInches > rule.appliesAboveCubicInches;
  const dimWeightLb = applies
    ? roundUpPounds(cubicInches / rule.divisor)
    : undefined;

  const billableLb = Math.max(actualBilledLb, dimWeightLb ?? 0);

  return {
    roundedDims,
    cubicInches,
    dimWeightLb,
    actualBilledLb,
    billableLb,
    dimBinds: dimWeightLb !== undefined && dimWeightLb > actualBilledLb,
  };
}

/**
 * The actual weight a package must exceed before the carrier bills what is in
 * it rather than the space it takes. Zero means actual weight always governs.
 */
export function breakEvenWeightLb(dims: Dims, rule: DimRule): number {
  const { dimWeightLb } = billableWeight(dims, 0, rule);
  return dimWeightLb === undefined ? 0 : dimWeightLb - 1;
}

/**
 * The largest rounded volume that still bills on actual weight at a given
 * weight. Anything bigger starts paying for air.
 */
export function maxCubicInchesAtWeight(actualLb: number, rule: DimRule): number {
  return Math.max(
    roundUpPounds(actualLb) * rule.divisor,
    rule.appliesAboveCubicInches,
  );
}

/**
 * The density line, in pounds per cubic foot. Ship anything lighter than this
 * and the carrier bills the box, not the product.
 */
export function breakEvenDensity(rule: DimRule): number {
  return CUBIC_INCHES_PER_CUBIC_FOOT / rule.divisor;
}
