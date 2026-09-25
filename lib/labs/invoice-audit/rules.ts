/**
 * FedEx 2026 U.S. package rules the audit checks against.
 *
 * Every figure here was read from two public FedEx documents on 2026-09-25:
 * the FedEx Service Guide (effective January 5, 2026, updated September 11,
 * 2026) and the "2026 changes to FedEx surcharges & fees" table. Page and
 * section references are in `source` on each rule. Nothing comes from a
 * contract, an employer, or an invoice.
 *
 * Fuel is the one exception. FedEx publishes the fuel percentage weekly and
 * the base it applies to is not in the surcharge table, so the fuel rule below
 * is a stated assumption, marked as such.
 */

export type Zone = 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Surcharge amounts published by zone tier. */
export type ZoneTiered = { z2: number; z3_4: number; z5_6: number; z7plus: number };

export function zoneTier(zone: Zone): keyof ZoneTiered {
  if (zone === 2) return "z2";
  if (zone <= 4) return "z3_4";
  if (zone <= 6) return "z5_6";
  return "z7plus";
}

export function tierLabel(tier: keyof ZoneTiered): string {
  return { z2: "Zone 2", z3_4: "Zones 3-4", z5_6: "Zones 5-6", z7plus: "Zones 7+" }[tier];
}

export type RuleId =
  | "DIM_WEIGHT"
  | "WEIGHT_ROUNDING"
  | "RESIDENTIAL"
  | "DAS"
  | "AHS_DIMENSION"
  | "AHS_WEIGHT"
  | "AHS_PACKAGING"
  | "OVERSIZE"
  | "GROUND_UNAUTHORIZED"
  | "SIGNATURE"
  | "ADDRESS_CORRECTION"
  | "FUEL";

export type Rule = {
  id: RuleId;
  title: string;
  /** The rule as the document states it, condensed. Quoted where the wording matters. */
  text: string;
  /** Where the figure was read. */
  source: string;
  /** Verification tier, in the same scheme the rest of the site uses. */
  tier: "document read" | "assumption";
};

export const DIM_DIVISOR = 139;
export const AHS_DIMENSION_MIN_BILLABLE_LB = 40;
export const OVERSIZE_MIN_BILLABLE_LB = 90;

export const thresholds = {
  ahsDimension: {
    longestSideIn: 48,
    secondLongestSideIn: 30,
    lengthPlusGirthIn: 105,
    cubicIn: 10_368,
  },
  ahsWeightLb: 50,
  oversize: {
    longestSideIn: 96,
    lengthPlusGirthIn: 130,
    cubicIn: 17_280,
    actualLb: 110,
  },
  unauthorized: {
    longestSideIn: 108,
    lengthPlusGirthIn: 165,
    actualLb: 150,
  },
} as const;

/** 2026 published amounts, U.S. package services unless noted. */
export const amounts = {
  residential: {
    express: 6.95,
    ground: 6.45,
  },
  das: {
    residential: 6.6,
    extendedResidential: 8.8,
    commercial: 4.45,
    extendedCommercial: 5.55,
    remote: 16.75,
  },
  ahsDimension: { z2: 29.5, z3_4: 32.75, z5_6: 38.5, z7plus: 40.75 } satisfies ZoneTiered,
  ahsWeight: { z2: 46, z3_4: 50.25, z5_6: 56.25, z7plus: 58.75 } satisfies ZoneTiered,
  ahsPackaging: { z2: 26.5, z3_4: 30.75, z5_6: 33, z7plus: 33.75 } satisfies ZoneTiered,
  oversize: { z2: 255, z3_4: 275, z5_6: 320, z7plus: 330 } satisfies ZoneTiered,
  groundUnauthorized: 1875,
  signature: {
    adult: 10,
    direct: 7.6,
    indirect: 7.6,
  },
  addressCorrection: 25.5,
} as const;

/**
 * Which charges the fuel percentage is applied to. Stated assumption: fuel on
 * transportation plus the delivery and handling surcharges, not on signature
 * or address correction fees.
 */
export const FUEL_APPLIES_TO = [
  "TRANSPORTATION",
  "RESIDENTIAL",
  "DAS",
  "DAS_EXTENDED",
  "DAS_REMOTE",
  "AHS_DIMENSION",
  "AHS_WEIGHT",
  "AHS_PACKAGING",
  "OVERSIZE",
] as const;

const guide = "FedEx Service Guide, effective January 5, 2026, updated September 11, 2026";
const changes = "2026 changes to FedEx surcharges & fees, fedex.com";

export const rules: Record<RuleId, Rule> = {
  DIM_WEIGHT: {
    id: "DIM_WEIGHT",
    title: "Dimensional weight",
    text:
      "Dimensional weight is calculated by multiplying the length by width by height of each package in inches and dividing the total by 139. If the dimensional weight exceeds the actual weight, charges may be assessed based on the dimensional weight. Any fraction of an inch is rounded up to the next-higher inch. FedEx Ground and FedEx Home Delivery shipments apply dimensional weight on a per-package basis.",
    source: `${guide}, Dimensional Weight, p. 135`,
    tier: "document read",
  },
  WEIGHT_ROUNDING: {
    id: "WEIGHT_ROUNDING",
    title: "Weight rounding",
    text: "Any fraction of a pound is rounded up to the next-higher pound. The billable weight is the greater of the rounded actual weight and the dimensional weight.",
    source: `${guide}, rate table notes`,
    tier: "document read",
  },
  RESIDENTIAL: {
    id: "RESIDENTIAL",
    title: "Residential Delivery Charge",
    text:
      "Applies to shipments delivered to a home or private residence. 2026: $6.95 per package for U.S. Package Services (Express). $6.45 per package for FedEx Ground, FedEx Home Delivery, and FedEx International Ground shipments. A commercial address does not carry the charge.",
    source: `${changes}, Residential Delivery Charge`,
    tier: "document read",
  },
  DAS: {
    id: "DAS",
    title: "Delivery Area Surcharge",
    text:
      "Applies per package to ZIP codes FedEx designates as delivery area, extended delivery area, or remote. 2026, U.S. Package Services: Residential $6.60, Extended Residential $8.80, Commercial $4.45, Extended Commercial $5.55, Remote Commercial or Remote Residential $16.75. One surcharge per package. Whether a ZIP is on the list is set by FedEx's published DAS ZIP tables, which this audit does not hold, so eligibility cannot be verified here and only the amount and the count can.",
    source: `${changes}, Delivery Area Surcharge`,
    tier: "document read",
  },
  AHS_DIMENSION: {
    id: "AHS_DIMENSION",
    title: "Additional Handling Surcharge, Dimension",
    text:
      "Applies to any package that measures greater than 48 inches along its longest side, or greater than 30 inches along its second-longest side, or greater than 105 inches in length and girth (length plus two times the height plus two times the width), or greater than 10,368 cubic inches. Rating is based on the greater of actual rounded weight or dimensional weight, subject to a 40-lb. minimum billable weight. 2026 U.S. amounts by zone: Zone 2 $29.50, Zones 3-4 $32.75, Zones 5-6 $38.50, Zones 7+ $40.75.",
    source: `${guide}, Non-standard shipment fees, Additional Handling Surcharge`,
    tier: "document read",
  },
  AHS_WEIGHT: {
    id: "AHS_WEIGHT",
    title: "Additional Handling Surcharge, Weight",
    text:
      "Applies to any package with an actual weight greater than 50 lbs. (U.S. Package Services). 2026 U.S. amounts by zone: Zone 2 $46, Zones 3-4 $50.25, Zones 5-6 $56.25, Zones 7+ $58.75.",
    source: `${guide}, Non-standard shipment fees, Additional Handling Surcharge`,
    tier: "document read",
  },
  AHS_PACKAGING: {
    id: "AHS_PACKAGING",
    title: "Additional Handling Surcharge, Packaging",
    text:
      "Applies to a package not fully encased in an outer shipping container, or encased in a container not made of corrugated fiberboard (metal, wood, canvas, leather, hard plastic, soft plastic, expanded polystyrene foam). 2026 U.S. amounts by zone: Zone 2 $26.50, Zones 3-4 $30.75, Zones 5-6 $33, Zones 7+ $33.75. Packaging material is not on the invoice, so this audit can check the amount but not the trigger.",
    source: `${guide}, Non-standard shipment fees, Additional Handling Surcharge`,
    tier: "document read",
  },
  OVERSIZE: {
    id: "OVERSIZE",
    title: "Oversize Charge",
    text:
      "Applies to any package that measures greater than 96 inches along its longest side, or greater than 130 inches in length and girth, or greater than 17,280 cubic inches, or has an actual weight greater than 110 lbs. Rating is based on the greater of actual rounded weight or dimensional weight, subject to a 90-lb. minimum billable weight. When the Oversize Charge applies, the Additional Handling Surcharge does not also apply. 2026 U.S. amounts by zone: Zone 2 $255, Zones 3-4 $275, Zones 5-6 $320, Zones 7+ $330.",
    source: `${guide}, Non-standard shipment fees, Oversize Charge`,
    tier: "document read",
  },
  GROUND_UNAUTHORIZED: {
    id: "GROUND_UNAUTHORIZED",
    title: "Ground Unauthorized Package Charge",
    text:
      "A charge of $1,875 per package for any FedEx Ground or Home Delivery package measuring more than 108 inches in length, or more than 165 inches in length and girth combined, or weighing more than 150 lbs.",
    source: `${guide}, Non-standard shipment fees, Ground Unauthorized Package Charge`,
    tier: "document read",
  },
  SIGNATURE: {
    id: "SIGNATURE",
    title: "Delivery Signature Options",
    text:
      "Charged only when the shipper selects the option. 2026 U.S. Package Services: Adult Signature Required $10 per package; Direct Signature Required and Indirect Signature Required $7.60 per package.",
    source: `${changes}, FedEx Delivery Signature Options`,
    tier: "document read",
  },
  ADDRESS_CORRECTION: {
    id: "ADDRESS_CORRECTION",
    title: "Address Correction",
    text: "2026: $25.50 per correction, U.S. and International Package Services.",
    source: `${changes}, Address Correction`,
    tier: "document read",
  },
  FUEL: {
    id: "FUEL",
    title: "Fuel surcharge",
    text:
      "The fuel percentage for the invoice period is stated in the invoice header. Assumption for this audit: the percentage applies to the transportation charge plus the residential, delivery area, additional handling, and oversize surcharges, and not to signature or address correction fees. FedEx publishes the percentage weekly and the applicable base on fedex.com; neither is in the documents this audit holds.",
    source: "Stated assumption, not read from a FedEx document",
    tier: "assumption",
  },
};

export const ruleList: Rule[] = Object.values(rules);

export const ruleProvenance = {
  kind: "FedEx 2026 U.S. package rules, read from the public FedEx Service Guide (effective January 5, 2026, updated September 11, 2026) and the 2026 surcharge and fee change table on fedex.com, both read on 2026-09-25.",
  limits:
    "Fuel is a stated assumption, and DAS ZIP eligibility and packaging material cannot be checked from an invoice, so the audit says so rather than guessing.",
  notRepresenting: "No contract terms, no negotiated discounts, and nothing from an employer or a merchant.",
} as const;
