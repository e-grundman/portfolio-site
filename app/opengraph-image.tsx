import { highlights } from "@/lib/highlights";
import { ogContentType, ogSize, renderHomeCard } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name}, ${site.role}. I turn operations into software, and better decisions.`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderHomeCard(highlights[0]);
}
