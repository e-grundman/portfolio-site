import type { Metric } from "@/lib/content/schema";

/**
 * A case study metric. Renders "50% → 90%" for a before and after pair, or a
 * single figure when that is all the metric has.
 */
export function MetricFigure({ metric }: { metric: Metric }) {
  return (
    <div>
      <div className="font-mono text-lg tracking-tight">
        {metric.before ? (
          <>
            {metric.before}
            <span className="mx-1.5" aria-hidden="true">
              →
            </span>
            {metric.after}
          </>
        ) : (
          <>
            {metric.value}
            {metric.unit && (
              <span className="ml-1 text-sm text-muted">{metric.unit}</span>
            )}
          </>
        )}
      </div>
      <div className="mt-1 field-label text-xs text-muted">
        {metric.label}
      </div>
    </div>
  );
}

export function MetricList({ metrics }: { metrics: Metric[] }) {
  return (
    <dl className="flex flex-wrap gap-x-12 gap-y-6">
      {metrics.map((metric) => (
        <div key={metric.label}>
          <MetricFigure metric={metric} />
        </div>
      ))}
    </dl>
  );
}
