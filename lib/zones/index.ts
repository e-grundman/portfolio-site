/**
 * Zone lookup module.
 *
 * Pluggable on purpose: everything downstream calls getZone and nothing else
 * reads the matrix. Replacing zone-matrix.generated.json with a real zone table
 * changes nothing above this file, provided the replacement keeps the shape
 * origin ZIP3 to destination ZIP3 to zone.
 */
import centroidData from "./zip3-centroids.json";
import matrixData from "./zone-matrix.generated.json";
import { ZONES, roadMiles, zoneForMiles, type Zone } from "./bands";

export type { Zone };
export {
  ZONES,
  ZONE_BANDS,
  ROAD_CIRCUITY_FACTOR,
  greatCircleMiles,
  roadMiles,
  zoneForMiles,
} from "./bands";

export type Zip3Centroid = {
  zip3: string;
  lat: number;
  lon: number;
  zctaCount: number;
  landSqMi: number;
};

const centroids = new Map<string, Zip3Centroid>(
  centroidData.centroids.map((c) => [c.zip3, c] as const),
);

const matrix = matrixData.matrix as Record<string, Record<string, number>>;

export const zoneDataProvenance = {
  centroids: centroidData._provenance,
  matrix: matrixData._provenance,
};

export function listZip3(): string[] {
  return [...centroids.keys()];
}

export function getCentroid(zip3: string): Zip3Centroid | undefined {
  return centroids.get(zip3);
}

export function hasOrigin(zip3: string): boolean {
  return zip3 in matrix;
}

/**
 * Zone for an origin and destination ZIP3.
 *
 * The generated matrix covers the candidate node origins. An origin outside it
 * falls back to computing the band from centroid distance, which is the same
 * derivation the matrix was built with, so the two agree.
 */
export function getZone(originZip3: string, destZip3: string): Zone | undefined {
  const row = matrix[originZip3];
  if (row) {
    const zone = row[destZip3];
    return zone === undefined ? undefined : (zone as Zone);
  }

  const origin = centroids.get(originZip3);
  const destination = centroids.get(destZip3);
  if (!origin || !destination) return undefined;
  return zoneForMiles(roadMiles(origin, destination));
}
