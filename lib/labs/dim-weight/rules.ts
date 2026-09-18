/**
 * Dimensional weight rule sets.
 *
 * These are published billing mechanics, not rates: a divisor, a rounding rule
 * for each measured side, and the package size below which dimensional weight
 * does not apply. Each one is stated in the carrier's public service guide.
 * No negotiated divisor and no contract term appears here.
 */

export type Rounding = "nearest" | "up";

export type DimRule = {
  id: string;
  label: string;
  /** Short name for table headers and chart labels. */
  short: string;
  /** Cubic inches per billable pound. */
  divisor: number;
  /** How each side is rounded to a whole inch before the volume is taken. */
  rounding: Rounding;
  /**
   * Dimensional weight applies only above this cube, in cubic inches. Zero
   * means it applies to every package.
   */
  appliesAboveCubicInches: number;
  effective: string;
};

export const CUBIC_INCHES_PER_CUBIC_FOOT = 1728;

export const dimRules: DimRule[] = [
  {
    id: "ups-fedex-before",
    label: "UPS and FedEx, before August 2025",
    short: "UPS/FedEx before",
    divisor: 139,
    rounding: "nearest",
    appliesAboveCubicInches: 0,
    effective: "Through August 2025",
  },
  {
    id: "ups-fedex-now",
    label: "UPS and FedEx, from August 2025",
    short: "UPS/FedEx now",
    divisor: 139,
    rounding: "up",
    appliesAboveCubicInches: 0,
    effective: "August 2025",
  },
  {
    id: "usps-before",
    label: "USPS, before July 2026",
    short: "USPS before",
    divisor: 166,
    rounding: "nearest",
    appliesAboveCubicInches: CUBIC_INCHES_PER_CUBIC_FOOT,
    effective: "Through July 2026",
  },
  {
    id: "usps-now",
    label: "USPS, from July 2026",
    short: "USPS now",
    divisor: 139,
    rounding: "up",
    appliesAboveCubicInches: CUBIC_INCHES_PER_CUBIC_FOOT,
    effective: "July 2026",
  },
];

export const dimRulesById = new Map(dimRules.map((rule) => [rule.id, rule]));

export const DEFAULT_RULE_ID = "ups-fedex-now";

export const ruleProvenance =
  "Divisors, side rounding, and the one cubic foot threshold as published in UPS, FedEx, and USPS service guides. These are public billing mechanics, and no negotiated term is modeled.";
