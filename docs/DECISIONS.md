# Decisions

Architectural choices and the reasoning behind them. Newest first.

## 2026-09-18, dim weight lab uses published billing rules on the synthetic rate table

**Decision.** The dim weight lab models four published rule sets (UPS and FedEx before and after the August 2025 round up, USPS before and after the July 2026 change) as data: divisor, side rounding, and the size threshold. All four price on the one synthetic rate table the zone optimizer uses.

**Why.** Divisors and rounding rules are public tariff mechanics, so naming the carriers stays inside the data policy. Pricing every rule on one rate table isolates billing mechanics from rate levels, so a column difference is a rule change and never a claim about which carrier is cheaper. The page says so.

**Cost accepted.** Dollar figures are synthetic and higher than a real negotiated book would show. The ratios between programs and rule sets are the point.

## 2026-09-18, series colors re-stepped for color vision deficiency

**Decision.** `--series-2` and `--series-3` moved from teal and violet to blue and olive in both modes.

**Why.** The old pair failed a colorblind check: adjacent separation under deuteranopia was ΔE 3.0, and 10.3 with full color vision, so two configurations in the zone optimizer were near indistinguishable for a large share of readers. The new set passes lightness, chroma, CVD separation, and contrast against both surfaces. It affects the zone optimizer too, which is intended.

## 2026-09-12, sections are a flag rather than a deletion

**Decision.** `sections` in `lib/site.ts` controls which parts of the site publish. Work and Writing are off. Their routes, loaders, and schemas stay in the repo; a disabled section is absent from navigation, returns 404, generates no static params, and publishes no sitemap URLs.

**Why.** Two different instructions arrived together: cut the Work tab, and erase the Writing tab. Cutting a tab is a navigation decision, not a reason to delete three written case studies, so `content/work` is intact and one flag brings it back. Writing was erased as asked: the four external LinkedIn entries are gone. What stays there is a single draft template, because the detail route resolves post bodies through a dynamic import and the bundler needs at least one file in the directory to resolve against. The template doubles as the schema example.

**Cost accepted.** Routes exist for sections nobody can reach. That is the price of making the change reversible with one edit rather than a restore from git history.

## 2026-09-12, Labs became Portfolio, URLs included

**Decision.** The section renamed from Labs to Portfolio everywhere a reader sees it: navigation label, `/portfolio` routes, and the `content/portfolio` directory. Permanent redirects carry `/labs` and `/labs/:slug` to the new paths. Internal implementation directories still use the word lab, for example `lib/labs/zone-optimizer`.

**Why.** A label that says Portfolio over URLs that say labs is the kind of drift that compounds. The rename went all the way through the content directory so that adding an entry matches what the section is called. The implementation directories were left alone because they name what the code is, an interactive model, and renaming them would have touched the model and its tests for no reader benefit.

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
