import { highlights } from "@/lib/highlights";
import { ogContentType, ogSize, renderHomeCard } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name}, ${site.role}. I turn operations into software, and better decisions.`;
export const size = ogSize;
export const contentType = ogContentType;

// The full highlight label wraps at thumbnail size, so the card carries a
// short form of it.
export default function Image() {
  return renderHomeCard({
    figure: highlights[0].figure,
    label: "Annual carrier savings",
  });
}
