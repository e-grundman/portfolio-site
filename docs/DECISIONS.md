# Decisions

Architectural choices and the reasoning behind them. Newest first.

## 2026-09-25, invoice audit agent: recorded run by default, live run fenced

**Decision.** The third lab is an agent, not a calculator. `lib/labs/invoice-audit/` holds the published FedEx 2026 rules, a seeded synthetic invoice with eight planted errors, deterministic checks that prove the errors are findable, and the agent itself: Claude Opus 5 through the SDK tool runner, with tools that answer factual questions (rule text, published amount by zone, billable weight, trigger checks, contract rate) and one tool that submits findings. The page ships with a recorded run stored in `recorded-run.json`, produced by `pnpm audit:precompute`, and a "Run it live" button that streams a fresh run from `app/api/invoice-audit/route.ts` as NDJSON.

**Why an agent.** The site's brand claim is translating operations into software and improving economics through decisions. An invoice audit is the cleanest case: the arithmetic is a formula, and the decision (dispute, question, or leave alone) is judgment that has to cite a rule. Splitting the two across tools and model shows the split, and the planted answer key makes the run scorable, so the page reports catches, misses, and false positives rather than a vendor's recovery number.

**Why recorded by default.** The site had no server surface, and every live run costs money and one to three minutes. A stored run means the page works at zero cost, indexes as static HTML, and survives the key being revoked. The live path exists to prove the recorded run is not staged.

**Fencing.** Same-origin only, three runs an hour per address, forty a day per instance, `INVOICE_AUDIT_LIVE=off` as a kill switch, `max_iterations` on the loop, and a 300 second route limit. The limits are in memory, so they reset per serverless instance. That is accepted for a demo; a durable store is a backlog item.

**Data policy kept.** The invoice is synthetic. The rules are public documents, cited by page. The rate table is the same synthetic one the other labs use, standing in for a contract.

**Model.** `claude-opus-5` at default effort. A cheaper model would cut cost per run several times over; not tried yet, because the false positive rate is the number that matters and it has not been measured across models.

## 2026-09-18, shipping label design system

**Decision.** The editorial look (cream paper, rust accent, Newsreader serif, tracked mono micro labels, an italic accent word, a thin rule between every section) is replaced by a shipping label system: paper and ink, one heavy line weight, Archivo condensed bold caps for headlines and field names, IBM Plex Mono for figures, and safety yellow used only as a fill behind ink. The home page is a label: ship to, an SR PM priority box, a barcode, and a contents field. Highlights are label fields, portfolio pieces are package cards, and share cards and the icon follow the same system.

**Why.** Erich's read was that the site looked Claude built, and he was right: the palette sat close to Claude's own brand, and the serif plus tracked mono pairing is the house style of AI built portfolios. A label is specific to the field he works in, which a template is not.

**Kept.** Series colors keep the blue and olive pair that passed the color vision deficiency check; series one moves from rust to ink, which separates from both on lightness. The barcode is decorative, derived from a string, and hidden from assistive technology.

## 2026-09-18, synthetic rate table halved, labs lead with percentages

**Decision.** Every coefficient in the synthetic ground table and the residential add was halved, which puts the table at roughly half of list. Both labs now lead with the percentage change and show the dollar figure second, labeled as illustration.

**Why.** The zone optimizer showed about $21 per package, a retail level. A reader who knows parcel sees that number, doubts the model, and stops reading before the mechanics land. Halving every term keeps the ratios between cells, so every percentage the labs report is unchanged, and the dollars now sit in the range a mid-volume ecommerce shipper tends to pay after discounts. The percentage is the finding, because it holds at any rate level; the dollars depend on a table the reader cannot see.

**Still true.** The table is synthetic and comes from no agreement. The data policy in the README is unchanged.

## 2026-09-18, labs lead with the tool, and the tool gets more width

**Decision.** On each lab page the interactive model sits directly under the title and summary, and the explainer moves below it under How it works, with an anchor link at the top for readers who want context first. The tool breaks out of the 768 pixel reading column on large screens.

**Why.** Three paragraphs of prose put the controls below the fold, and a hiring manager scanning the page never reached the thing that proves the point. Prose stays in the reading column; tables and charts get the width they need.

## 2026-09-18, share images generated at build

**Decision.** `app/opengraph-image.tsx` renders a home card with the headshot, the claim, and the lead highlight. Each lab has its own card with its title and summary. Fonts are read from `@fontsource` woff files, because Satori does not read woff2 and next/font does not expose files.

**Why.** LinkedIn is the main distribution channel, and a shared link previously unfurled with no image.

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

## 2026-09-24, case studies before the portfolio in the nav

**Decision.** Primary navigation reads About, Case studies, Portfolio. The order lives in `lib/site.ts` as `navLinks` and the 404 page reads the same list.

**Why.** Erich's call after the site review. The audience is recruiters and hiring managers, and the case studies are the proof they came for. The tools are the second thing.

## 2026-09-24, the hero barcode is a real Code 128

**Decision.** `lib/barcode.ts` gains a Code 128 subset B encoder, and the home page barcode encodes the site host (`erichgrundman.com`) with a 10 module quiet zone. The `Barcode` component takes `symbology="code128"` for this; the footer and the share cards keep the decorative hashed bars.

**Why.** A label barcode that does not scan is a prop, and the site's argument is that Erich knows the mechanics of shipping. A reader who points a phone at it gets the domain. Verified by rendering the symbol to a PNG and decoding it with the zxing library at 420, 624, and 1200 pixel widths; it fails at 340 CSS pixels at 1x, which no phone renders at, since device pixel ratios of 2x and 3x give the SVG the resolution it needs.

**Not changed.** The share cards encode case study titles, which run long enough that a real symbol would be too fine to scan at card size, so they stay decorative. The bars stay hidden from assistive technology because the caption repeats the host in text.

## 2026-09-24, case studies carry their own share cards

**Decision.** `app/case-studies/[slug]/opengraph-image.tsx` renders one card per published study, leading with the study's first metric. Rendered at build through its own `generateStaticParams`.

**Why.** Case study links are the ones that get shared. Before this they carried the home card and its $10M+ figure, which is the least supported number on the site, on every share. The arrow between before and after is drawn from boxes because the latin font subsets Satori loads do not carry the arrow glyph.

## 2026-09-24, outbound clicks are tracked as events

**Decision.** `components/tracked-link.tsx` wraps the email, LinkedIn, GitHub, and "Read the case study" links and sends two Vercel Analytics events: `outbound` with the destination, and `case_study_open` with the slug and where it was opened from.

**Why.** Pageviews say which pages open. These say what a reader does next, which is the question a portfolio for recruiters has to answer. Custom events may need the Pro plan to appear in the dashboard; `track()` is a no-op otherwise, so the code costs nothing if they do not.
