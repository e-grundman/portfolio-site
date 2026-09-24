// Card version 1. Next hashes this file, not lib/og.tsx, into the image URL,
// and LinkedIn caches by URL, including a failed fetch. Bump the number when
// the card design changes so every platform fetches the new image.
import { getCaseStudies, getCaseStudyEntry } from "@/lib/content/loader";
import { ogContentType, ogSize, renderCaseStudyCard } from "@/lib/og";
import { sections, site } from "@/lib/site";

// One image per published study, rendered at build. Without its own
// generateStaticParams this file is a request-time route handler, and the
// fonts and sharp it needs are not guaranteed to be in that function's bundle.
export function generateStaticParams(): { slug: string }[] {
  if (!sections.caseStudies) return [];
  return getCaseStudies().map((entry) => ({ slug: entry.slug }));
}
export const dynamicParams = false;

export const alt = `Case study by ${site.name}`;
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getCaseStudyEntry(slug);
  return renderCaseStudyCard({ title: entry.title, metric: entry.metrics[0] });
}
