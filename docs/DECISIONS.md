# Decisions

Architectural choices and the reasoning behind them. Newest first.

## 2026-09-12, road circuity factor on the zone matrix

**Decision.** Zone assignment uses great circle distance between ZIP3 centroids multiplied by 1.17, then the published ground distance bands.

**Why.** Straight line distance understates driving distance, and without the factor the long lanes landed a zone low. Chicago to Los Angeles came out zone 7 against a published chart that says zone 8. With the factor applied, spot checked lanes agree with published charts: Kansas City to Chicago zone 4, Dallas to Atlanta zone 5, Chicago to Los Angeles zone 8.

**Limit stated on the page.** Real zone charts are built on rate areas and driving distance, so individual lanes will still differ in places. The distribution is representative; a single lane is not authoritative.

## 2026-09-12, zone bands match on the upper bound

**Decision.** `zoneForMiles` returns the first band whose upper bound is at or above the distance, rather than testing both bounds.

**Why.** A defect found by a test. Published bands read as whole mile ranges, 0 to 150 then 151 to 300, which leaves a gap that a computed distance lands in. A lane at 150.4 miles matched no band and fell through to the zone 8 default. Matching on the upper bound closes the gap without changing the published ranges.

## 2026-09-12, demand weights come from public geography, not population

**Decision.** Synthetic order destinations are drawn from a demand proxy built on ZCTA counts and land area per ZIP3, with a sublinear density boost.

**Why.** Real population per ZCTA would have been better, and the Census API now requires a key. Rather than put a key requirement in the build or ask for one, the proxy uses the gazetteer data already in hand. ZCTA count tracks postal delivery areas, density skews the draw urban the way ecommerce demand does, and the whole thing is labeled as a proxy rather than presented as population.

## 2026-09-12, spend and savings are shown per package and per order book

**Decision.** The lab reports cost per package and total spend at the modeled order count, and says the percentage holds at any volume. It does not extrapolate to an annual figure.

**Why.** An annual number would require an assumed annual volume, which the lab does not have and which would be the largest term in the result. Cost per package is the honest unit.

## 2026-09-12, MDX content read from disk, compiled by @next/mdx

**Decision.** Content lives as `.mdx` files under `content/`. Frontmatter is parsed with `gray-matter`, validated with Zod, and the body is compiled by the first party `@next/mdx` plugin through a dynamic import keyed on slug.

**Alternatives rejected.** File based MDX routing puts content inside the route tree, enforces no schema, and still needs filesystem reads to build an index. `next-mdx-remote` adds a runtime dependency for a job the official compiler already does on local files. Velite and Content Collections are good tools that add a build step and a config surface neither of which is earned at this content volume.

**Cost accepted.** Body rendering uses a dynamic import path, so content filenames must stay URL safe. The loader enforces that.

## 2026-09-12, Frontmatter validated at build, not at render

**Decision.** Every content route is statically generated, and the loader runs a Zod parse on each file it reads. A missing required field throws during `next build`.

**Why.** A broken content file should fail loudly at build rather than render an empty section in production. `pnpm content:check` runs the same validation plus a required-heading check before the build starts, so the error message arrives before the Next.js build noise.

## 2026-09-12, Turbopack compatible remark plugin configuration

**Decision.** Remark plugins are declared as strings in `next.config.ts`, not as imported functions.

**Why.** Next 16 builds with Turbopack by default, and Turbopack resolves plugins in Rust, which cannot accept JavaScript function references.

## 2026-09-12, External writing entries are indexed without local bodies

**Decision.** The writing schema carries `externalOnly`. An entry with that flag appears in the index, links out to where it was published, and generates no local page.

**Why.** Four LinkedIn posts already exist and belong in the index today. Rewriting them as site pages was not required, and a placeholder body would have been worse than an honest outbound link. Flipping the flag and pasting the body later moves a post onto the site with no other change.
