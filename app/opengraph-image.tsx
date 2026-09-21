// Card version 6. Next hashes this file, not lib/og.tsx, into the image URL,
// and LinkedIn caches by URL, including a failed fetch. Bump the number when
// the card design changes so every platform fetches the new image.
import { highlights } from "@/lib/highlights";
import { ogContentType, ogSize, renderHomeCard } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name}, ${site.role}. I work on parcel transportation and ecommerce fulfillment: what shipping costs, why it costs that, and which decisions change it.`;
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
