import { barcodeModules } from "@/lib/barcode";

/**
 * Decorative barcode with its human readable line underneath. Hidden from
 * assistive technology, because the bars carry no information and the
 * caption repeats text that is already on the page.
 */
export function Barcode({
  value,
  caption,
  className = "",
  height = 56,
}: {
  value: string;
  caption?: string;
  className?: string;
  height?: number;
}) {
  const widths = barcodeModules(value);
  const total = widths.reduce((sum, w) => sum + w, 0);
  let x = 0;
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
