/**
 * Rate module.
 *
 * Pluggable on purpose: the model calls getRate and never reads the table.
 * Every figure here is synthetic, including the surcharges. Replacing the
 * table with published list rates is a file swap plus a provenance update.
 */
import rateData from "./synthetic-ground-rates.json";
import type { Zone } from "../zones/bands";

const rates = rateData.rates as Record<string, Record<string, number>>;

/** Synthetic surcharges, stated here rather than buried in the model. */
export const SURCHARGES = {
  /** Percentage of the base rate. Real fuel surcharges move weekly. */
  fuelPct: 0.165,
  /** Flat add for a residential delivery. */
  residential: 5.95,
} as const;

export const MIN_WEIGHT_LB = 1;
export const MAX_WEIGHT_LB = 70;

export const rateDataProvenance = rateData._provenance;

/** Base rate before surcharges, for a zone and a billable weight in pounds. */
export function getBaseRate(zone: Zone, billableWeightLb: number): number {
  const weight = Math.min(
    MAX_WEIGHT_LB,
    Math.max(MIN_WEIGHT_LB, Math.ceil(billableWeightLb)),
  );
  const column = rates[String(zone)];
  if (!column) throw new Error(`No rate column for zone ${zone}`);
  const rate = column[String(weight)];
  if (rate === undefined) {
    throw new Error(`No rate for zone ${zone} at ${weight} lb`);
  }
  return rate;
}

export type RateRequest = {
  zone: Zone;
  billableWeightLb: number;
  residential?: boolean;
};

export type RateResult = {
  base: number;
  fuel: number;
  residential: number;
  total: number;
};

/** Landed cost for one package. Rounded at the end, not at each step. */
export function getRate({
  zone,
  billableWeightLb,
  residential = false,
}: RateRequest): RateResult {
  const base = getBaseRate(zone, billableWeightLb);
  const fuel = base * SURCHARGES.fuelPct;
  const residentialFee = residential ? SURCHARGES.residential : 0;
  return {
    base,
    fuel,
    residential: residentialFee,
    total: base + fuel + residentialFee,
  };
}
