# Decisions

Architectural choices and the reasoning behind them. Newest first.

## 2026-09-12 — MDX content read from disk, compiled by @next/mdx

**Decision.** Content lives as `.mdx` files under `content/`. Frontmatter is parsed with `gray-matter`, validated with Zod, and the body is compiled by the first party `@next/mdx` plugin through a dynamic import keyed on slug.

**Alternatives rejected.** File based MDX routing puts content inside the route tree, enforces no schema, and still needs filesystem reads to build an index. `next-mdx-remote` adds a runtime dependency for a job the official compiler already does on local files. Velite and Content Collections are good tools that add a build step and a config surface neither of which is earned at this content volume.

**Cost accepted.** Body rendering uses a dynamic import path, so content filenames must stay URL safe. The loader enforces that.

## 2026-09-12 — Frontmatter validated at build, not at render

**Decision.** Every content route is statically generated, and the loader runs a Zod parse on each file it reads. A missing required field throws during `next build`.

**Why.** A broken content file should fail loudly at build rather than render an empty section in production. `pnpm content:check` runs the same validation plus a required-heading check before the build starts, so the error message arrives before the Next.js build noise.

## 2026-09-12 — Turbopack compatible remark plugin configuration

**Decision.** Remark plugins are declared as strings in `next.config.ts`, not as imported functions.

**Why.** Next 16 builds with Turbopack by default, and Turbopack resolves plugins in Rust, which cannot accept JavaScript function references.

## 2026-09-12 — External writing entries are indexed without local bodies

**Decision.** The writing schema carries `externalOnly`. An entry with that flag appears in the index, links out to where it was published, and generates no local page.

**Why.** Four LinkedIn posts already exist and belong in the index today. Rewriting them as site pages was not required, and a placeholder body would have been worse than an honest outbound link. Flipping the flag and pasting the body later moves a post onto the site with no other change.
