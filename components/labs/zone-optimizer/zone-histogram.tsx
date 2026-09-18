"use client";

import { ZONES } from "@/lib/zones";
import type { ConfigurationComparison } from "@/lib/labs/zone-optimizer/model";

const seriesBar = ["bg-series-1", "bg-series-2", "bg-series-3"];

/**
 * Grouped horizontal bars, one group per zone, one bar per configuration, on a
 * shared axis. Shares rather than counts, so the comparison holds whatever the
 * order count is, and the leftward shift is visible before a number is read.
 */
export function ZoneHistogram({
  results,
}: {
  results: ConfigurationComparison[];
}) {
  const max = Math.max(
    ...results.flatMap((result) =>
      ZONES.map((zone) => result.histogramShare[zone]),
    ),
    0.01,
  );

  return (
    <div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {results.map((result, index) => (
          <div key={result.label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`inline-block h-2.5 w-2.5 shrink-0 outline outline-1 outline-line ${seriesBar[index]}`}
            />
            <span className="field-label text-sm">
              {result.label}
            </span>
          </div>
        ))}
      </div>

      <table className="mt-6 w-full border-collapse">
        <caption className="sr-only">
          Share of orders by zone for each network configuration
        </caption>
        <tbody>
          {ZONES.map((zone) => (
            <tr key={zone} className="align-middle">
              <th
                scope="row"
                className="w-16 pr-3 pb-3 text-left field-label text-xs text-muted"
              >
                Zone {zone}
              </th>
              <td className="pb-3">
                <div className="space-y-1">
                  {results.map((result, index) => {
                    const share = result.histogramShare[zone];
                    return (
                      <div key={result.label} className="flex items-center gap-2">
                        <div className="h-2.5 flex-1 bg-rule/40">
                          <div
                            className={`h-2.5 ${seriesBar[index]}`}
                            style={{ width: `${(share / max) * 100}%` }}
                          />
                        </div>
                        <span className="w-12 shrink-0 text-right font-mono text-xs text-muted">
                          {(share * 100).toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
