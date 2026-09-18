// Card version 3. Next hashes this file, not lib/og.tsx, into the image URL,
// and LinkedIn caches by URL, including a failed fetch. Bump the number when
// the card design changes so every platform fetches the new image.
import { getPortfolioEntry } from "@/lib/content/loader";
import { ogContentType, ogSize, renderEntryCard } from "@/lib/og";

const entry = getPortfolioEntry("zone-optimizer");

export const alt = `${entry.title}: ${entry.summary}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderEntryCard(entry);
}
