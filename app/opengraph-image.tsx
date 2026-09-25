// Card version 8. Next hashes this file, not lib/og.tsx, into the image URL,
// and LinkedIn caches by URL, including a failed fetch. Bump the number when
// the card design changes so every platform fetches the new image.
import { ogContentType, ogSize, renderHomeCard } from "@/lib/og";
import { site } from "@/lib/site";

// Erich's own hero sentence, the same one the home page Contents field shows.
const contents =
  "I work on parcel transportation and ecommerce fulfillment: what shipping costs, why it costs that, and which decisions change it.";

export const alt = `${site.name}, ${site.role}. ${contents}`;
export const size = ogSize;
export const contentType = ogContentType;

// The $10M+ figure came off the card 2026-09-24 by Erich's call. The card
// carries the contents field instead, so the share image matches the label.
export default function Image() {
  return renderHomeCard(contents);
}
