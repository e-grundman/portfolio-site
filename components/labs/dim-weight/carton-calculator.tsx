"use client";

import { useState } from "react";
import {
  billableWeight,
  breakEvenDensity,
  breakEvenWeightLb,
  maxCubicInchesAtWeight,
  type Dims,
} from "@/lib/labs/dim-weight/billing";
import {
  CUBIC_INCHES_PER_CUBIC_FOOT,
  dimRules,
  type DimRule,
} from "@/lib/labs/dim-weight/rules";
import { getRate } from "@/lib/rates";
import { ZONES, type Zone } from "@/lib/zones";
import { formatUsd } from "@/lib/format";

const th =
  "border-b border-rule py-2 pr-4 field-label text-xs text-muted";
const td = "whitespace-nowrap border-b border-rule py-3 pr-4 font-mono";

function NumberField({
  label,
  unit,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="field-label text-sm">
        {label}
      </span>
      <span className="mt-1 flex items-baseline gap-2 border-b border-rule">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
          }}
          className="w-full bg-transparent py-1.5 font-mono text-lg text-ink outline-none"
        />
        <span className="font-mono text-xs text-muted">{unit}</span>
      </span>
    </label>
  );
}

export function CartonCalculator({ rule }: { rule: DimRule }) {
  const [dims, setDims] = useState<Dims>({
    length: 14.25,
    width: 12.25,
    height: 8.25,
  });
  const [weightLb, setWeightLb] = useState(3.2);
  const [zone, setZone] = useState<Zone>(5);

  const setSide = (side: keyof Dims) => (value: number) =>
    setDims((current) => ({ ...current, [side]: value }));

  const rows = dimRules.map((candidate) => {
    const billing = billableWeight(dims, weightLb, candidate);
    const cost = getRate({
      zone,
      billableWeightLb: billing.billableLb,
      residential: true,
    }).total;
    return { rule: candidate, billing, cost };
  });

  const selected = billableWeight(dims, weightLb, rule);
  const breakEven = breakEvenWeightLb(dims, rule);
  const maxCube = maxCubicInchesAtWeight(weightLb, rule);
  const density =
    (weightLb / (dims.length * dims.width * dims.height)) *
    CUBIC_INCHES_PER_CUBIC_FOOT;
  const overRateTable = rows.some((row) => row.billing.billableLb > 70);

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-5">
        <NumberField label="Length" unit="in" value={dims.length} step={0.25} min={1} max={48} onChange={setSide("length")} />
        <NumberField label="Width" unit="in" value={dims.width} step={0.25} min={1} max={48} onChange={setSide("width")} />
        <NumberField label="Height" unit="in" value={dims.height} step={0.25} min={1} max={48} onChange={setSide("height")} />
        <NumberField label="Weight" unit="lb" value={weightLb} step={0.1} min={0.1} max={70} onChange={setWeightLb} />
        <label className="block">
          <span className="field-label text-sm">
            Zone
          </span>
          <select
            value={zone}
            onChange={(event) => setZone(Number(event.target.value) as Zone)}
            className="mt-1 w-full border-b border-rule bg-transparent py-2 font-mono text-lg text-ink"
          >
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Billable weight and cost for this package under each rule set
          </caption>
          <thead>
            <tr>
              <th className={`${th} text-left`}>Rule set</th>
              <th className={`${th} text-right`}>Measured as</th>
              <th className={`${th} text-right`}>Cubic in</th>
              <th className={`${th} text-right`}>Dim wt</th>
              <th className={`${th} text-right`}>Billed</th>
              <th className={`${th} pr-0 text-right`}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ rule: candidate, billing, cost }) => {
              const active = candidate.id === rule.id;
              const { length, width, height } = billing.roundedDims;
              return (
                <tr key={candidate.id} className={active ? "" : "text-muted"}>
                  <td className="border-b border-rule py-3 pr-4">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`inline-block h-2.5 w-2.5 shrink-0 outline outline-1 outline-line ${
                          active ? "bg-line" : "bg-rule"
                        }`}
                      />
                      {candidate.label}
                    </span>
                  </td>
                  <td className={`${td} text-right`}>
                    {length}×{width}×{height}
                  </td>
                  <td className={`${td} text-right`}>
                    {billing.cubicInches.toLocaleString("en-US")}
                  </td>
                  <td className={`${td} text-right`}>
                    {billing.dimWeightLb === undefined
                      ? "exempt"
                      : `${billing.dimWeightLb} lb`}
                  </td>
                  <td className={`${td} text-right`}>
                    {billing.billableLb} lb
                    <span className="ml-1.5 text-xs text-muted">
                      {billing.dimBinds ? "dim" : "actual"}
                    </span>
                  </td>
                  <td className={`${td} pr-0 text-right`}>{formatUsd(cost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 max-w-xl leading-relaxed text-ink/85">
        {selected.dimWeightLb === undefined ? (
          <>
            Under {rule.label}, this package sits under one cubic foot, so
            dimensional weight does not apply and it bills on its actual{" "}
            {selected.actualBilledLb} lb.
          </>
        ) : selected.dimBinds ? (
          <>
            Under {rule.label}, this package bills {selected.billableLb} lb for{" "}
            {weightLb} lb of product and box. It keeps paying for space until the
            contents push it past {breakEven} lb. At {weightLb} lb, the largest
            box that bills on actual weight is{" "}
            {maxCube.toLocaleString("en-US")} cubic inches, against{" "}
            {selected.cubicInches.toLocaleString("en-US")} as this rule
            measures the box.
          </>
        ) : (
          <>
            Under {rule.label}, this package bills on actual weight. It has room
            to grow to {maxCube.toLocaleString("en-US")} cubic inches before the
            carrier starts charging for space.
          </>
        )}{" "}
        On its true outside dimensions the package is {density.toFixed(1)} lb
        per cubic foot, against a break even of{" "}
        {breakEvenDensity(rule).toFixed(1)}.
      </p>
      {overRateTable && (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Some rows bill above 70 lb, where the synthetic rate table stops, so
          their cost is shown at the 70 lb rate.
        </p>
      )}
    </div>
  );
}
