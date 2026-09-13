import type { MetadataRoute } from "next";
import {
  getLocalWriting,
  getPortfolio,
  getWork,
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

  if (sections.work) {
    entries.push({ url: `${site.url}/work`, lastModified: new Date() });
    for (const entry of getWork()) {
      entries.push({
        url: `${site.url}/work/${entry.slug}`,
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
