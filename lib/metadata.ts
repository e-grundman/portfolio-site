import type { Metadata } from "next";
import { site } from "./site";

/**
 * Per-page metadata: title, description, canonical, and the Open Graph set.
 *
 * Next merges metadata shallowly, so a page that sets any openGraph field
 * replaces the whole openGraph object from the root layout. Before this helper
 * existed, pages set only a title, which left the home page's og:title,
 * og:description, og:url, and canonical on every case study and on /about. A
 * shared case study link then rendered the home card, and search engines read
 * every case study as a duplicate of the home page. Every public page below the
 * root goes through here so the full set is written each time.
 *
 * `path` is site-relative. metadataBase in the root layout resolves it.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: site.name,
      title: `${title} · ${site.name}`,
      description,
      url: path,
    },
  };
}
