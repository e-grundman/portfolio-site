"use client";

import { useMemo, useState } from "react";
import { ConfigPicker } from "./config-picker";
import { ZoneHistogram } from "./zone-histogram";
import { compareConfigurations } from "@/lib/labs/zone-optimizer/model";
import {
  DEFAULT_ORDER_COUNT,
  RESIDENTIAL_SHARE,
  generateOrders,
} from "@/lib/labs/zone-optimizer/orders";
import { formatUsd, wholePercents } from "@/lib/format";

const seriesDot = ["bg-series-1", "bg-series-2", "bg-series-3"];
const seriesText = ["text-series-1", "text-series-2", "text-series-3"];

const signedPct = (value: number) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value * 100).toFixed(1)}%`;
const pctMagnitude = (value: number) => `${Math.abs(value * 100).toFixed(1)}%`;
const signedUsd = (value: number) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${formatUsd(Math.abs(value))}`;

type Preset = {
  id: string;
  label: string;
  note: string;
  configs: [string[], string[], string[]];
};

const presets: Preset[] = [
  {
    id: "center-out",
    label: "Center out",
    note: "One central node, then add coasts.",
    configs: [
      ["kansas-city-ks"],
      ["edison-nj", "city-of-industry-ca"],
      ["edison-nj", "dallas-tx", "city-of-industry-ca"],
    ],
  },
  {
    id: "east-first",
    label: "East first",
    note: "A Northeast node, then west, then south.",
    configs: [
      ["edison-nj"],
      ["edison-nj", "las-vegas-nv"],
      ["edison-nj", "las-vegas-nv", "atlanta-ga"],
    ],
  },
  {
    id: "cost-sites",
    label: "Lower cost sites",
    note: "Avoid the expensive metros and see what the zone map costs you.",
    configs: [
      ["indianapolis-in"],
      ["allentown-pa", "salt-lake-city-ut"],
      ["allentown-pa", "salt-lake-city-ut", "dallas-tx"],
    ],
  },
];

export function ZoneOptimizer() {
  const [configs, setConfigs] = useState<[string[], string[], string[]]>(
    presets[0].configs,
  );

  const orders = useMemo(() => generateOrders(DEFAULT_ORDER_COUNT), []);
  const results = useMemo(
    () => compareConfigurations(configs.filter((config) => config.length > 0), orders),
    [configs, orders],
  );

  const setConfig = (index: number) => (nodeIds: string[]) => {
    setConfigs((current) => {
      const next = [...current] as [string[], string[], string[]];
      next[index] = nodeIds;
      return next;
    });
  };

  const baseline = results[0];

  return (
    <div className="mt-10">
      <div className="border-t-2 border-line pt-6">
        <p className="field-label text-sm">
          Presets
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setConfigs(preset.configs)}
              title={preset.note}
              className="border-2 border-line px-3 py-1.5 field-label text-xs hover:bg-highlight hover:text-on-highlight"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-3">
        {configs.map((nodeIds, index) => (
          <ConfigPicker
            key={index}
            label={`Configuration ${String.fromCharCode(65 + index)}`}
            seriesClass={seriesDot[index]}
            nodeIds={nodeIds}
            onChange={setConfig(index)}
          />
        ))}
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Zone and cost results for each network configuration
          </caption>
          <thead>
            <tr>
              <th className="border-b border-rule py-2 pr-4 text-left field-label text-xs text-muted">
                Configuration
              </th>
              <th className="border-b border-rule py-2 pr-4 text-right field-label text-xs text-muted">
                Avg zone
              </th>
              <th className="border-b border-rule py-2 pr-4 text-right field-label text-xs text-muted">
                Cost per package
              </th>
              <th className="border-b border-rule py-2 pr-4 text-right field-label text-xs text-muted">
                Delta
              </th>
              <th className="border-b border-rule py-2 text-right field-label text-xs text-muted">
                Spend at {DEFAULT_ORDER_COUNT.toLocaleString("en-US")} orders
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.label}>
                <td className="border-b border-rule py-3 pr-4">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`inline-block h-2.5 w-2.5 shrink-0 outline outline-1 outline-line ${seriesDot[index]}`}
                    />
                    {result.label}
                  </span>
                </td>
                <td className="border-b border-rule py-3 pr-4 text-right font-mono">
                  {result.averageZone.toFixed(2)}
                </td>
                <td className="border-b border-rule py-3 pr-4 text-right font-mono">
                  {formatUsd(result.costPerPackage)}
                </td>
                <td
                  className={`border-b border-rule py-3 pr-4 text-right font-mono ${
                    index === 0 ? "text-muted" : seriesText[index]
                  }`}
                >
                  {index === 0
                    ? "baseline"
                    : `${signedPct(result.costPerPackagePctDelta)} (${signedUsd(
                        result.costPerPackageDelta,
                      )})`}
                </td>
                <td className="border-b border-rule py-3 text-right font-mono">
                  {formatUsd(result.totalCost, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {baseline && results.length > 1 && (
        <p className="mt-6 max-w-xl leading-relaxed text-ink/85">
          Against the baseline, the best configuration shown moves the average
          zone from {baseline.averageZone.toFixed(2)} to{" "}
          {Math.min(...results.map((r) => r.averageZone)).toFixed(2)} and cuts
          the cost of the average package by{" "}
          {pctMagnitude(Math.min(...results.map((r) => r.costPerPackagePctDelta)))}
          , which holds at any volume. On this synthetic table that is{" "}
          {formatUsd(
            Math.abs(Math.min(...results.map((r) => r.costPerPackageDelta))),
          )}{" "}
          a package, or{" "}
          {formatUsd(
            Math.max(...results.map((r) => r.annualSavingsAtOrderCount)),
            0,
          )}{" "}
          across {DEFAULT_ORDER_COUNT.toLocaleString("en-US")} orders.
        </p>
      )}

      <div className="mt-12 border-t-2 border-line pt-8">
        <h2 className="field-label text-sm">
          Zone distribution
        </h2>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          Zone 2 is a local delivery and zone 8 is coast to coast. Moving weight
          left on this chart is the whole game, because the rate table rises
          with distance faster than it rises with anything else you control.
        </p>
        <div className="mt-8">
          <ZoneHistogram results={results} />
        </div>
      </div>

      <div className="mt-12 border-t-2 border-line pt-8">
        <h2 className="field-label text-sm">
          Where the volume lands
        </h2>
        <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-3">
          {results.map((result, index) => (
            <div key={result.label}>
              <p className="flex items-center gap-2 field-label text-xs text-muted">
                <span
                  aria-hidden="true"
                  className={`inline-block h-2.5 w-2.5 shrink-0 outline outline-1 outline-line ${seriesDot[index]}`}
                />
                Configuration {String.fromCharCode(65 + index)}
              </p>
              <ul className="mt-3 space-y-2">
                {result.assignments.map((assignment, row) => (
                  <li key={assignment.node.id} className="text-sm">
                    <span className="flex items-baseline justify-between gap-3">
                      <span>
                        {assignment.node.city}, {assignment.node.state}
                      </span>
                      <span className="font-mono text-xs text-muted">
                        {wholePercents(result.assignments.map((a) => a.share))[row]}% ·
                        zone{" "}
                        {assignment.averageZone.toFixed(2)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 border-t-2 border-line pt-8">
        <h2 className="field-label text-sm">
          What the model assumes
        </h2>
        <ul className="mt-4 max-w-xl list-disc space-y-2 pl-5 leading-relaxed text-ink/85">
          <li>
            {DEFAULT_ORDER_COUNT.toLocaleString("en-US")} synthetic orders,
            destinations drawn from public ZIP3 geography, weights lognormal with
            a median near three pounds, {Math.round(RESIDENTIAL_SHARE * 100)}{" "}
            percent residential.
          </li>
          <li>
            Every order ships from the node that reaches it in the lowest zone.
            Cost breaks a tie. Inventory placement, capacity, labor cost, and
            inbound freight are all held constant, which is the assumption most
            worth arguing with.
          </li>
          <li>
            Rates are a synthetic ground table set at roughly half of list, the
            range a mid-volume shipper tends to pay after discounts, with a
            synthetic fuel percentage and a flat residential add. Read the
            percentages as the result and the dollars as illustration. Dim weight is not modeled, so a bulky, light
            product would see a different answer.
          </li>
        </ul>
      </div>
    </div>
  );
}
