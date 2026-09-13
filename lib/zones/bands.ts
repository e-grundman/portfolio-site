/**
 * Ground zone distance bands and the distance function behind them.
 *
 * The bands are the published structure used across US ground parcel: zone 2
 * is local, zone 8 is coast to coast. They describe distance, not price, and
 * they are not specific to any carrier agreement.
 */
export type Zone = 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const ZONE_BANDS: { zone: Zone; minMiles: number; maxMiles: number }[] = [
  { zone: 2, minMiles: 0, maxMiles: 150 },
  { zone: 3, minMiles: 151, maxMiles: 300 },
  { zone: 4, minMiles: 301, maxMiles: 600 },
  { zone: 5, minMiles: 601, maxMiles: 1000 },
  { zone: 6, minMiles: 1001, maxMiles: 1400 },
  { zone: 7, minMiles: 1401, maxMiles: 1800 },
  { zone: 8, minMiles: 1801, maxMiles: Infinity },
];

export const ZONES: Zone[] = [2, 3, 4, 5, 6, 7, 8];

/**
 * Zone for a distance in miles.
 *
 * Bands are published as whole mile ranges, for example 151 to 300, which
 * leaves a gap between 150 and 151 that a computed distance lands in often.
 * Matching on the upper bound of the first band that contains the distance
 * closes the gap without changing the published ranges.
 */
export function zoneForMiles(miles: number): Zone {
  const band = ZONE_BANDS.find((candidate) => miles <= candidate.maxMiles);
  return band ? band.zone : 8;
}

/**
 * Road distance exceeds straight line distance, because roads bend around
 * terrain and follow the interstate grid. A circuity factor near 1.17 is the
 * commonly cited ratio for long US highway routing, and applying it moves the
 * long lanes onto the zone a carrier chart actually assigns them. Without it,
 * Chicago to Los Angeles lands a zone low.
 */
export const ROAD_CIRCUITY_FACTOR = 1.17;

const EARTH_RADIUS_MILES = 3958.8;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Estimated road miles: great circle distance times the circuity factor. */
export function roadMiles(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  return greatCircleMiles(a, b) * ROAD_CIRCUITY_FACTOR;
}

export function greatCircleMiles(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}
