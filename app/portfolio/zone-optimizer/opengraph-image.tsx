import { getPortfolioEntry } from "@/lib/content/loader";
import { ogContentType, ogSize, renderEntryCard } from "@/lib/og";

const entry = getPortfolioEntry("zone-optimizer");

export const alt = `${entry.title}: ${entry.summary}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderEntryCard(entry);
}
