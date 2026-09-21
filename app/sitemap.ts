import type { MetadataRoute } from "next";
import {
  getLocalWriting,
  getPortfolio,
  getCaseStudies,
} from "@/lib/content/loader";
import { sections, site } from "@/lib/site";

/** Enabled sections only. A disabled section publishes no URLs. */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: new Date() },
  ];

  if (sections.about) {
    entries.push({ url: `${site.url}/about`, lastModified: new Date() });
  }

  if (sections.portfolio) {
    entries.push({ url: `${site.url}/portfolio`, lastModified: new Date() });
    for (const entry of getPortfolio()) {
      entries.push({
        url: `${site.url}${entry.route}`,
        lastModified: new Date(entry.publishedAt),
      });
    }
  }

  if (sections.caseStudies) {
    entries.push({ url: `${site.url}/case-studies`, lastModified: new Date() });
    for (const entry of getCaseStudies()) {
      entries.push({
        url: `${site.url}/case-studies/${entry.slug}`,
        lastModified: new Date(entry.publishedAt),
      });
    }
  }

  if (sections.writing) {
    entries.push({ url: `${site.url}/writing`, lastModified: new Date() });
    for (const post of getLocalWriting()) {
      entries.push({
        url: `${site.url}/writing/${post.slug}`,
        lastModified: new Date(post.publishedAt),
      });
    }
  }

  return entries;
}
