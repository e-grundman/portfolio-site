/**
 * Build lib/zones/zip3-centroids.json from the public Census ZCTA gazetteer.
 *
 * Source: US Census Bureau, 2020 Gazetteer Files, ZIP Code Tabulation Areas.
 * https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip
 * Public domain. Nothing here originates from a carrier or an employer.
 *
 * Each ZCTA carries an interior point (INTPTLAT, INTPTLONG) and a land area.
 * ZIP3 centroid is the unweighted mean of the interior points of its ZCTAs,
 * which tracks postal delivery geography more closely than an area weighted
 * mean would, because area weighting pulls every centroid toward empty land.
 *
 * Usage:
 *   pnpm zones:centroids /path/to/2020_Gaz_zcta_national.txt
 */
import fs from "node:fs";
import path from "node:path";

const sourcePath = process.argv[2];
if (!sourcePath || !fs.existsSync(sourcePath)) {
  console.error(
    "Pass the path to 2020_Gaz_zcta_national.txt.\n" +
      "Download it from https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip",
  );
  process.exit(1);
}

/**
 * Ground zone modeling covers the contiguous 48 states and DC. Non contiguous
 * states, territories, and military post offices move by air on a different
 * rate structure, so including them would misrepresent the model rather than
 * extend it.
 */
function excluded(zip3: string): boolean {
  const n = Number(zip3);
  return (
    (n >= 6 && n <= 9) || // Puerto Rico and US Virgin Islands
    (n >= 90 && n <= 98) || // military, Europe
    (n >= 340 && n <= 340) || // military, Americas
    (n >= 962 && n <= 966) || // military, Pacific
    (n >= 967 && n <= 968) || // Hawaii
    n === 969 || // Guam and Northern Mariana Islands
    (n >= 995 && n <= 999) // Alaska
  );
}

type Accumulator = {
  latSum: number;
  lonSum: number;
  zctaCount: number;
  landSqMi: number;
};

const byZip3 = new Map<string, Accumulator>();

const lines = fs.readFileSync(sourcePath, "utf8").split("\n");
const header = lines[0].split("\t").map((h) => h.trim());
const col = (name: string) => header.indexOf(name);
const iGeoid = col("GEOID");
const iLand = col("ALAND_SQMI");
const iLat = col("INTPTLAT");
const iLon = col("INTPTLONG");

for (const line of lines.slice(1)) {
  if (!line.trim()) continue;
  const cells = line.split("\t").map((c) => c.trim());
  const zcta = cells[iGeoid];
  if (!zcta || zcta.length !== 5) continue;
  const zip3 = zcta.slice(0, 3);
  if (excluded(zip3)) continue;

  const lat = Number(cells[iLat]);
  const lon = Number(cells[iLon]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

  const entry = byZip3.get(zip3) ?? {
    latSum: 0,
    lonSum: 0,
    zctaCount: 0,
    landSqMi: 0,
  };
  entry.latSum += lat;
  entry.lonSum += lon;
  entry.zctaCount += 1;
  entry.landSqMi += Number(cells[iLand]) || 0;
  byZip3.set(zip3, entry);
}

const centroids = [...byZip3.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([zip3, entry]) => ({
    zip3,
    lat: Number((entry.latSum / entry.zctaCount).toFixed(4)),
    lon: Number((entry.lonSum / entry.zctaCount).toFixed(4)),
    zctaCount: entry.zctaCount,
    landSqMi: Number(entry.landSqMi.toFixed(1)),
  }));

const output = {
  _provenance: {
    source: "US Census Bureau, 2020 Gazetteer Files, ZIP Code Tabulation Areas",
    url: "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip",
    license: "Public domain, US federal government work",
    derivation:
      "ZIP3 centroid is the unweighted mean of the interior points of every ZCTA sharing that three digit prefix. landSqMi is the sum of ZCTA land area. zctaCount is the number of ZCTAs in the prefix.",
    coverage:
      "Contiguous 48 states and DC. Non contiguous states, territories, and military post offices are excluded because ground zone structure does not apply to them.",
    generatedBy: "scripts/generate-zip3-centroids.ts",
    generatedOn: new Date().toISOString().slice(0, 10),
    note: "Public geography only. No carrier data, no employer data, no order data.",
  },
  centroids,
};

const target = path.join(process.cwd(), "lib", "zones", "zip3-centroids.json");
fs.writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${centroids.length} ZIP3 centroids to ${path.relative(process.cwd(), target)}.`);
