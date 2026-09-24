import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MDX files are content, not routes. They are imported by the route handlers
  // in app/, so .mdx does not need to be a page extension. It is listed anyway
  // so that a future file-based MDX route does not require a config change.
  pageExtensions: ["ts", "tsx", "md", "mdx"],

  // Vercel sets HSTS on its own. The rest a static site can afford: no MIME
  // sniffing, no framing by other sites, a referrer that stops at the origin
  // when leaving, and no device permissions the site never asks for. No
  // Content-Security-Policy, because Next's inline scripts would need a
  // nonce on every request and the site is static.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // Labs was renamed to Portfolio after the section had already deployed.
  // These keep the old URLs working for anything that linked them.
  async redirects() {
    return [
      { source: "/labs", destination: "/portfolio", permanent: true },
      { source: "/labs/:slug", destination: "/portfolio/:slug", permanent: true },
    ];
  },
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
