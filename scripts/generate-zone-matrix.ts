/**
 * Build lib/zones/zone-matrix.generated.json.
 *
 * The matrix is generated, not sourced. For every candidate node origin and
 * every contiguous US ZIP3 destination it computes great circle distance
 * between ZIP3 centroids, then assigns a zone using published ground zone
 * distance bands. No carrier file is read, copied, or reproduced.
 *
 * Keyed to the candidate node origins only, which is about thirteen origins by
 * eight hundred and eighty four destinations. A full origin by destination
 * matrix would be roughly eight hundred thousand rows, which nobody reviews.
 *
 * Usage: pnpm zones:generate
 */
import fs from "node:fs";
import path from "node:path";
import centroidData from "../lib/zones/zip3-centroids.json";
import { candidateNodes } from "../lib/labs/zone-optimizer/nodes";
import {
  ROAD_CIRCUITY_FACTOR,
  ZONE_BANDS,
  roadMiles,
  zoneForMiles,
} from "../lib/zones/bands";

const centroids = new Map(
  centroidData.centroids.map((c) => [c.zip3, c] as const),
);

const matrix: Record<string, Record<string, number>> = {};

for (const node of candidateNodes) {
  const origin = centroids.get(node.zip3);
  if (!origin) {
    throw new Error(`No centroid for node ${node.id} at ZIP3 ${node.zip3}`);
  }
  const row: Record<string, number> = {};
  for (const [zip3, dest] of centroids) {
    const miles = roadMiles(origin, dest);
    row[zip3] = zoneForMiles(miles);
  }
  matrix[node.zip3] = row;
}

const output = {
  _provenance: {
    kind: "Generated, not sourced",
    method:
      `Great circle distance between ZIP3 centroids, multiplied by a road circuity factor of ${ROAD_CIRCUITY_FACTOR}, then assigned to a zone using published ground zone distance bands.`,
    bands: ZONE_BANDS.map((band) =>
      band.maxMiles === Infinity
        ? `zone ${band.zone}: over ${band.minMiles} miles`
        : `zone ${band.zone}: ${band.minMiles} to ${band.maxMiles} miles`,
    ),
    centroidSource:
      "lib/zones/zip3-centroids.json, derived from the public US Census 2020 ZCTA gazetteer",
    origins: candidateNodes.map((n) => `${n.zip3} ${n.city}, ${n.state}`),
    approximation:
      "Real carrier zone charts are built on rate areas and driving distance, not straight line distance, so individual lanes will differ by a zone in places. The distribution is representative; a single lane is not authoritative.",
    generatedBy: "scripts/generate-zone-matrix.ts",
    generatedOn: new Date().toISOString().slice(0, 10),
    note: "No carrier data, no employer data, no negotiated agreement. Swap this file to plug in a real zone table.",
  },
  matrix,
};

const target = path.join(
  process.cwd(),
  "lib",
  "zones",
  "zone-matrix.generated.json",
);
fs.writeFileSync(target, `${JSON.stringify(output)}\n`);

const cells = Object.values(matrix).reduce(
  (sum, row) => sum + Object.keys(row).length,
  0,
);
console.log(
  `Wrote ${Object.keys(matrix).length} origins by ${centroids.size} destinations, ${cells} cells.`,
);
