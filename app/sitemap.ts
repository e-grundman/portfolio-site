import type { MetadataRoute } from "next";
import { getLabs, getLocalWriting, getWork } from "@/lib/content/loader";
import { site } from "@/lib/site";

/** Static routes plus every content entry that has a page of its own. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/work", "/writing", "/labs", "/contact"];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: new Date(),
  }));

  for (const entry of getWork()) {
    entries.push({
      url: `${site.url}/work/${entry.slug}`,
      lastModified: new Date(entry.publishedAt),
    });
  }

  for (const post of getLocalWriting()) {
    entries.push({
      url: `${site.url}/writing/${post.slug}`,
      lastModified: new Date(post.publishedAt),
    });
  }

  for (const lab of getLabs()) {
    entries.push({
      url: `${site.url}${lab.route}`,
      lastModified: new Date(lab.publishedAt),
    });
  }

  return entries;
}
