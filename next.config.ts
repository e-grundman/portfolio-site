import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MDX files are content, not routes. They are imported by the route handlers
  // in app/, so .mdx does not need to be a page extension. It is listed anyway
  // so that a future file-based MDX route does not require a config change.
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

const withMDX = createMDX({
  options: {
    // Plugin names are passed as strings because Turbopack resolves them in
    // Rust and cannot accept JavaScript functions.
    // remark-frontmatter stops the YAML block from rendering as body text.
    // gray-matter reads that same block separately, at build time.
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
  },
});

export default withMDX(nextConfig);
