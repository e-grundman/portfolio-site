"use client";

import { useMemo, useState } from "react";
import type { PricedItem } from "@/lib/labs/dim-weight/model";
import { categoriesById } from "@/lib/labs/dim-weight/products";
import {
  CUBIC_INCHES_PER_CUBIC_FOOT,
  dimRules,
  type DimRule,
} from "@/lib/labs/dim-weight/rules";

const WIDTH = 640;
const HEIGHT = 380;
const MARGIN = { top: 16, right: 20, bottom: 44, left: 52 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;

const X_DOMAIN: [number, number] = [40, 8000];
const Y_DOMAIN: [number, number] = [0.25, 60];
const X_TICKS = [50, 100, 300, 1000, 3000];
const Y_TICKS = [0.5, 1, 2, 5, 10, 20, 50];

function logScale([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  const l0 = Math.log(d0);
  const span = Math.log(d1) - l0;
  return (value: number) => {
    const clamped = Math.min(d1, Math.max(d0, value));
    return r0 + ((Math.log(clamped) - l0) / span) * (r1 - r0);
  };
}

const x = logScale(X_DOMAIN, [0, PLOT_W]);
const y = logScale(Y_DOMAIN, [PLOT_H, 0]);

/**
 * Rounded cubes are discrete, so hundreds of packages share one x value.
 * A small deterministic spread keeps them visible without moving any of them
 * far enough to change what the chart says.
 */
function jitter(index: number): number {
  const hash = Math.sin(index * 12.9898) * 43758.5453;
  return (hash - Math.floor(hash) - 0.5) * 14;
}

/** Log-log axes turn every density into a straight 45 degree line. */
function divisorLine(divisor: number) {
  const x0 = X_DOMAIN[0];
  const x1 = X_DOMAIN[1];
  return {
    x1: x(x0),
    y1: y(x0 / divisor),
    x2: x(x1),
    y2: y(x1 / divisor),
  };
}

export function BreakEvenChart({
  priced,
  rule,
}: {
  priced: PricedItem[];
  rule: DimRule;
}) {
  const [hovered, setHovered] = useState<number | undefined>();
  const divisors = useMemo(
    () => [...new Set(dimRules.map((r) => r.divisor))].sort((a, b) => a - b),
    [],
  );
  const hover = hovered === undefined ? undefined : priced[hovered];
  const dimBilled = priced.filter((p) => p.billing.dimBinds).length;

  return (
    <figure>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-series-1" />
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Billed on space ({dimBilled.toLocaleString("en-US")})
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full border border-muted" />
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Billed on weight ({(priced.length - dimBilled).toLocaleString("en-US")})
          </span>
        </span>
      </div>

      <div className="relative mt-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label={`Actual weight against measured cube for ${priced.length} sample packages, with the density break even line for divisor ${rule.divisor}. Packages below the line bill on space.`}
          onMouseLeave={() => setHovered(undefined)}
        >
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {Y_TICKS.map((tick) => (
              <g key={`y${tick}`}>
                <line x1={0} x2={PLOT_W} y1={y(tick)} y2={y(tick)} className="stroke-rule" strokeWidth={1} />
                <text x={-8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[10px]">
                  {tick}
                </text>
              </g>
            ))}
            {X_TICKS.map((tick) => (
              <text key={`x${tick}`} x={x(tick)} y={PLOT_H + 18} textAnchor="middle" className="fill-muted font-mono text-[10px]">
                {tick.toLocaleString("en-US")}
              </text>
            ))}
            <text x={PLOT_W} y={PLOT_H + 36} textAnchor="end" className="fill-muted font-mono text-[10px] uppercase tracking-[0.12em]">
              Measured cube, cubic inches
            </text>
            <text x={0} y={-4} className="fill-muted font-mono text-[10px] uppercase tracking-[0.12em]">
              Actual weight, lb
            </text>

            {rule.appliesAboveCubicInches > 0 && (
              <g>
                <line
                  x1={x(CUBIC_INCHES_PER_CUBIC_FOOT)}
                  x2={x(CUBIC_INCHES_PER_CUBIC_FOOT)}
                  y1={0}
                  y2={PLOT_H}
                  className="stroke-muted"
                  strokeWidth={1}
                  strokeDasharray="2 4"
                />
                <text x={x(CUBIC_INCHES_PER_CUBIC_FOOT) - 6} y={PLOT_H - 8} textAnchor="end" className="fill-muted font-mono text-[10px]">
                  1 cu ft, exempt below
                </text>
              </g>
            )}

            {divisors.map((divisor, index) => {
              const line = divisorLine(divisor);
              const active = divisor === rule.divisor;
              // Staggered along each line so the two labels never collide.
              const labelLb = index === 0 ? 40 : 16;
              return (
                <g key={divisor}>
                  <line
                    {...line}
                    className={active ? "stroke-ink" : "stroke-muted"}
                    strokeWidth={active ? 2 : 1}
                    strokeDasharray={active ? undefined : "4 4"}
                  />
                  <text
                    x={x(labelLb * divisor) + 6}
                    y={y(labelLb) + 4}
                    className={`font-mono text-[10px] ${active ? "fill-ink" : "fill-muted"}`}
                  >
                    ÷{divisor}
                  </text>
                </g>
              );
            })}

            {priced.map((p, index) => {
              const cx = x(p.billing.cubicInches) + jitter(index);
              const cy = y(p.pkg.weightLb);
              const dim = p.billing.dimBinds;
              return (
                <g key={index} onMouseEnter={() => setHovered(index)}>
                  <circle cx={cx} cy={cy} r={8} fill="transparent" />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={hovered === index ? 5 : 3}
                    className={dim ? "fill-series-1 stroke-bg" : "fill-bg stroke-muted"}
                    strokeWidth={dim ? 1 : 1.25}
                    fillOpacity={dim ? 0.75 : 1}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute z-10 w-56 border border-rule bg-bg p-3 text-xs shadow-sm"
            style={{
              left: `${Math.min(
                70,
                ((MARGIN.left + x(hover.billing.cubicInches)) / WIDTH) * 100,
              )}%`,
              top: `${((MARGIN.top + y(hover.pkg.weightLb)) / HEIGHT) * 100}%`,
              transform: "translate(12px, -50%)",
            }}
          >
            <p className="font-mono uppercase tracking-[0.12em] text-muted">
              {categoriesById.get(hover.item.category)!.label}
            </p>
            <p className="mt-1 text-ink">{hover.pkg.container}</p>
            <dl className="mt-2 grid grid-cols-2 gap-y-1 font-mono text-ink">
              <dt className="text-muted">Measured</dt>
              <dd className="text-right">
                {hover.billing.roundedDims.length}×{hover.billing.roundedDims.width}×
                {hover.billing.roundedDims.height}
              </dd>
              <dt className="text-muted">Actual</dt>
              <dd className="text-right">{hover.pkg.weightLb.toFixed(1)} lb</dd>
              <dt className="text-muted">Billed</dt>
              <dd className="text-right">
                {hover.billing.billableLb} lb {hover.billing.dimBinds ? "dim" : ""}
              </dd>
            </dl>
          </div>
        )}
      </div>
      <figcaption className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Both axes are logarithmic, so every density is a straight diagonal. Anything
        below the solid line is lighter than the break even for this rule set and
        bills on space. Rounding to whole pounds moves individual packages a little
        either side of the line.
      </figcaption>
    </figure>
  );
}
