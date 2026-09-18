/**
 * Bar widths for a decorative barcode, derived from a string.
 *
 * Not a real symbology and not scannable. It is deterministic, so the same
 * text always prints the same bars, and the widths follow a Code 128 look:
 * alternating bars and spaces one to four modules wide.
 */
export function barcodeModules(text: string, count = 60): number[] {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const widths: number[] = [2, 1, 1]; // start guard
  for (let i = 0; i < count; i += 1) {
    hash ^= hash << 13;
    hash ^= hash >>> 17;
    hash ^= hash << 5;
    widths.push(1 + ((hash >>> 0) % 4));
  }
  widths.push(1, 1, 2); // stop guard
  return widths;
}
