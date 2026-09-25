/**
 * The recorded run, read at build. Server side only (uses fs). Missing until
 * `pnpm audit:precompute` has been run once, and the page handles that.
 */
import fs from "node:fs";
import path from "node:path";
import type { RecordedRun } from "./events";

export function loadRecordedRun(): RecordedRun | null {
  const file = path.join(process.cwd(), "lib/labs/invoice-audit/recorded-run.json");
  if (!fs.existsSync(file)) return null;
  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as RecordedRun;
  if (!Array.isArray(parsed.events) || !parsed.events.some((e) => e.type === "done")) {
    return null;
  }
  return parsed;
}
