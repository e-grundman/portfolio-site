import { CODE128_QUIET_ZONE, barcodeModules, code128Modules } from "@/lib/barcode";

/**
 * Label barcode with its human readable line underneath.
 *
 * `symbology="code128"` renders a real Code 128 B symbol of `value` with a
 * quiet zone, so a phone scanner reads it. The default is decorative bars
 * hashed from `value`, for spots where a real symbol would be too dense.
 *
 * Hidden from assistive technology either way: the caption repeats text that
 * is already on the page, and the bars add nothing a screen reader can use.
 */
export function Barcode({
  value,
  caption,
  symbology = "decorative",
  className = "",
  height = 56,
}: {
  value: string;
  caption?: string;
  symbology?: "code128" | "decorative";
  className?: string;
  height?: number;
}) {
  const real = symbology === "code128";
  const widths = real ? code128Modules(value) : barcodeModules(value);
  const quiet = real ? CODE128_QUIET_ZONE : 0;
  const total = widths.reduce((sum, w) => sum + w, 0) + quiet * 2;
  let x = quiet;
  const bars = widths.map((w, i) => {
    const bar = i % 2 === 0 ? { x, w } : null;
    x += w;
    return bar;
  });

  return (
    <div aria-hidden="true" className={className}>
      <svg
        viewBox={`0 0 ${total} 10`}
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        className="block w-full fill-ink"
        style={{ height }}
      >
        {bars.map((bar, i) =>
          bar ? <rect key={i} x={bar.x} y={0} width={bar.w} height={10} /> : null,
        )}
      </svg>
      {caption && (
        <p className="mt-1.5 font-mono text-xs tracking-[0.3em] text-ink">{caption}</p>
      )}
    </div>
  );
}
