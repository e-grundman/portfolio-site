/** "2026-07-17" to "Jul 2026". Parsed as UTC so the month never shifts. */
export function formatMonthYear(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "2026-07-17" to "July 17, 2026". */
export function formatLongDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatUsd(value: number, fractionDigits = 2): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/**
 * Whole percentages that sum to 100.
 *
 * Rounding each share on its own lets a set of three land on 101, which on a
 * page arguing that the math can be public is the first thing a reader
 * catches. Largest remainder gives the spare point to the share that lost the
 * most to rounding.
 */
export function wholePercents(shares: number[]): number[] {
  const raw = shares.map((share) => share * 100);
  const floors = raw.map(Math.floor);
  let remaining = Math.round(raw.reduce((sum, value) => sum + value, 0)) -
    floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);
  const out = [...floors];
  for (const { index } of order) {
    if (remaining <= 0) break;
    out[index] += 1;
    remaining -= 1;
  }
  return out;
}
