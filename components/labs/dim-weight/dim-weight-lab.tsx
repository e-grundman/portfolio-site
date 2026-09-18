"use client";

import { useMemo, useState } from "react";
import { BreakEvenChart } from "./break-even-chart";
import { CartonCalculator } from "./carton-calculator";
import { breakEvenDensity } from "@/lib/labs/dim-weight/billing";
import {
  compareStrategies,
  priceItems,
  ruleMatrix,
} from "@/lib/labs/dim-weight/model";
import { strategies, type StrategyId } from "@/lib/labs/dim-weight/packaging";
import {
  DEFAULT_ITEM_COUNT,
  ORIGIN_LABEL,
  categories,
  generateItems,
} from "@/lib/labs/dim-weight/products";
import {
  DEFAULT_RULE_ID,
  dimRules,
  dimRulesById,
} from "@/lib/labs/dim-weight/rules";
import { formatUsd } from "@/lib/format";

const seriesDot = ["bg-series-1", "bg-series-2", "bg-series-3"];
/** Every nth item goes on the chart. The tables use the whole book. */
const CHART_SAMPLE_STEP = 25;

const th =
  "border-b border-rule py-2 pr-4 font-mono text-xs uppercase tracking-[0.12em] text-muted";
const td = "whitespace-nowrap border-b border-rule py-3 pr-4 text-right font-mono";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
      {children}
    </h2>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
        active
          ? "border-accent text-accent"
          : "border-rule text-muted hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}

const pct = (value: number) => `${(value * 100).toFixed(0)}%`;
const signedUsd = (value: number) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${formatUsd(Math.abs(value))}`;

export function DimWeightLab() {
  const [ruleId, setRuleId] = useState(DEFAULT_RULE_ID);
  const [chartStrategy, setChartStrategy] = useState<StrategyId>("stock");
  const rule = dimRulesById.get(ruleId)!;

  const items = useMemo(() => generateItems(DEFAULT_ITEM_COUNT), []);
  const results = useMemo(() => compareStrategies(ruleId, items), [ruleId, items]);
  const matrix = useMemo(() => ruleMatrix(items), [items]);
  const chartItems = useMemo(
    () => items.filter((_, index) => index % CHART_SAMPLE_STEP === 0),
    [items],
  );
  const priced = useMemo(
    () => priceItems(chartStrategy, ruleId, chartItems),
    [chartStrategy, ruleId, chartItems],
  );

  const [stock, , best] = results;
  const stockRow = matrix[0];
  const upsBefore = dimRules.findIndex((r) => r.id === "ups-fedex-before");
  const upsNow = dimRules.findIndex((r) => r.id === "ups-fedex-now");
  const uspsBefore = dimRules.findIndex((r) => r.id === "usps-before");
  const uspsNow = dimRules.findIndex((r) => r.id === "usps-now");

  return (
    <div className="mt-10">
      <div className="border-t border-rule pt-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Rule set
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {dimRules.map((candidate) => (
            <Toggle
              key={candidate.id}
              active={candidate.id === ruleId}
              onClick={() => setRuleId(candidate.id)}
            >
              {candidate.label}
            </Toggle>
          ))}
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Divisor {rule.divisor}, each side rounded{" "}
          {rule.rounding === "up" ? "up to the next inch" : "to the nearest inch"}
          ,{" "}
          {rule.appliesAboveCubicInches > 0
            ? "and nothing under one cubic foot is billed on space."
            : "applied to every package regardless of size."}{" "}
          The break even density is {breakEvenDensity(rule).toFixed(1)} lb per
          cubic foot.
        </p>
      </div>

      <div className="mt-12 border-t border-rule pt-8">
        <SectionHeading>One package</SectionHeading>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          Enter the outside dimensions as the carrier would measure them. The
          default is a 14×12×8 carton with a quarter inch of wall on every side,
          which is exactly the kind of box the round up rule catches.
        </p>
        <div className="mt-8">
          <CartonCalculator rule={rule} />
        </div>
      </div>

      <div className="mt-12 border-t border-rule pt-8">
        <SectionHeading>Packaging program</SectionHeading>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          The same {DEFAULT_ITEM_COUNT.toLocaleString("en-US")} synthetic orders,
          packed three ways. The product never changes, only the container around
          it. Air premium is what each order paid above the same package billed
          on actual weight.
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Billing and cost for each packaging program under {rule.label}
            </caption>
            <thead>
              <tr>
                <th className={`${th} text-left`}>Program</th>
                <th className={`${th} text-right`}>Billed on space</th>
                <th className={`${th} text-right`}>Actual lb</th>
                <th className={`${th} text-right`}>Billed lb</th>
                <th className={`${th} text-right`}>Air premium</th>
                <th className={`${th} text-right`}>Cost per order</th>
                <th className={`${th} pr-0 text-right`}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={result.strategy}>
                  <td className="border-b border-rule py-3 pr-4">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`inline-block h-2 w-2 shrink-0 rounded-full ${seriesDot[index]}`}
                      />
                      {result.label}
                    </span>
                  </td>
                  <td className={td}>{pct(result.dimBilledShare)}</td>
                  <td className={td}>{result.averageActualLb.toFixed(1)}</td>
                  <td className={td}>{result.averageBillableLb.toFixed(1)}</td>
                  <td className={td}>{formatUsd(result.airPremiumPerOrder)}</td>
                  <td className={td}>{formatUsd(result.costPerOrder)}</td>
                  <td className={`${td} pr-0 ${index === 0 ? "text-muted" : ""}`}>
                    {index === 0
                      ? "baseline"
                      : `${signedUsd(result.costPerOrderDelta)} (${(
                          result.costPerOrderPctDelta * 100
                        ).toFixed(1)}%)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-xl leading-relaxed text-ink/85">
          Under {rule.label}, the average order weighs{" "}
          {stock.averageActualLb.toFixed(1)} lb in stock cartons and bills{" "}
          {stock.averageBillableLb.toFixed(1)}. Moving to the twelve carton set
          and bagging the soft goods takes {formatUsd(-best.costPerOrderDelta)}{" "}
          out of every order, which is{" "}
          {formatUsd(best.savingsAtOrderCount, 0)} across{" "}
          {best.orderCount.toLocaleString("en-US")} orders, and no one touched a
          rate.
        </p>
      </div>

      <div className="mt-12 border-t border-rule pt-8">
        <SectionHeading>Where the break even sits</SectionHeading>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          One package in every {CHART_SAMPLE_STEP}, plotted by measured cube and
          actual weight. Switch the program and watch the cloud slide left
          toward the line.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {strategies.map((strategy, index) => (
            <Toggle
              key={strategy.id}
              active={strategy.id === chartStrategy}
              onClick={() => setChartStrategy(strategy.id)}
            >
              <span
                aria-hidden="true"
                className={`inline-block h-2 w-2 shrink-0 rounded-full ${seriesDot[index]}`}
              />
              {strategy.label}
            </Toggle>
          ))}
        </div>
        <div className="mt-8">
          <BreakEvenChart priced={priced} rule={rule} />
        </div>
      </div>

      <div className="mt-12 border-t border-rule pt-8">
        <SectionHeading>Where the air is</SectionHeading>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          Air premium per order by category under {rule.label}. Dense goods
          barely notice dimensional weight. Light, bulky goods pay for it on
          almost every order, and they are the ones a mailer can fix.
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Air premium per order by category and packaging program
            </caption>
            <thead>
              <tr>
                <th className={`${th} text-left`}>Category</th>
                <th className={`${th} text-right`}>Share</th>
                {results.map((result, index) => (
                  <th
                    key={result.strategy}
                    className={`${th} text-right ${index === results.length - 1 ? "pr-0" : ""}`}
                  >
                    {result.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category, row) => (
                <tr key={category.id}>
                  <td className="border-b border-rule py-3 pr-4">
                    {category.label}
                  </td>
                  <td className={td}>
                    {pct(results[0].byCategory[row].orders / results[0].orderCount)}
                  </td>
                  {results.map((result, index) => {
                    const cell = result.byCategory[row];
                    return (
                      <td
                        key={result.strategy}
                        className={`${td} ${index === results.length - 1 ? "pr-0" : ""}`}
                      >
                        {formatUsd(cell.airPremiumPerOrder)}
                        <span className="ml-1.5 text-xs text-muted">
                          {pct(cell.dimBilledShare)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          The small figure is the share of that category billed on space.
        </p>
      </div>

      <div className="mt-12 border-t border-rule pt-8">
        <SectionHeading>What the rule changes cost</SectionHeading>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          Cost per order for each program under each rule set. Nothing about
          the boxes changes between columns.
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Cost per order for each packaging program under each rule set
            </caption>
            <thead>
              <tr>
                <th className={`${th} text-left`}>Program</th>
                {dimRules.map((candidate, index) => (
                  <th
                    key={candidate.id}
                    className={`${th} text-right ${index === dimRules.length - 1 ? "pr-0" : ""} ${
                      candidate.id === ruleId ? "text-accent" : ""
                    }`}
                  >
                    {candidate.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, index) => (
                <tr key={row.strategy}>
                  <td className="border-b border-rule py-3 pr-4">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`inline-block h-2 w-2 shrink-0 rounded-full ${seriesDot[index]}`}
                      />
                      {row.label}
                    </span>
                  </td>
                  {row.costPerOrder.map((cost, column) => (
                    <td
                      key={dimRules[column].id}
                      className={`${td} ${column === dimRules.length - 1 ? "pr-0" : ""}`}
                    >
                      {formatUsd(cost)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-xl leading-relaxed text-ink/85">
          The UPS and FedEx round up added{" "}
          {formatUsd(stockRow.costPerOrder[upsNow] - stockRow.costPerOrder[upsBefore])}{" "}
          to the average order in stock cartons. The USPS change, a lower divisor
          and the same round up, added{" "}
          {formatUsd(stockRow.costPerOrder[uspsNow] - stockRow.costPerOrder[uspsBefore])}
          . Under both, the right sized program with mailers costs less than
          stock cartons did before either rule moved, which is the argument for
          treating packaging as a transportation decision.
        </p>
      </div>

      <div className="mt-12 border-t border-rule pt-8">
        <SectionHeading>What the model assumes</SectionHeading>
        <ul className="mt-4 max-w-xl list-disc space-y-2 pl-5 leading-relaxed text-ink/85">
          <li>
            {DEFAULT_ITEM_COUNT.toLocaleString("en-US")} single item orders across
            five synthetic categories, shipped from {ORIGIN_LABEL}, with the
            same destinations and residential mix as the zone optimizer.
          </li>
          <li>
            Every item goes in the smallest carton it fits with an inch of
            clearance on each dimension. Cartons add a quarter inch of wall to
            every outside dimension and weight by board area plus dunnage.
          </li>
          <li>
            Only apparel and bedding are allowed in a poly mailer, and bagging
            compresses their height. Fragile and dense goods stay boxed.
          </li>
          <li>
            Rates are the site&apos;s synthetic list table with synthetic fuel and
            residential surcharges. One rate table is used for every rule set, so
            the columns isolate billing mechanics and say nothing about which
            carrier is cheaper.
          </li>
          <li>
            Additional handling and oversize surcharges are not modeled. They
            would widen the gap between the stock cartons and everything else.
          </li>
        </ul>
      </div>
    </div>
  );
}
