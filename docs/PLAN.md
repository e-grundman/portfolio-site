# Phase 1 Plan

Status: awaiting approval. Written 2026-09-12.

## Decisions taken from the intake

| Question | Answer |
|---|---|
| Repo and deploy | Own public repo, `github.com/e-grundman/portfolio-site`, connected to Vercel |
| Domain | Vercel subdomain for now, custom domain later behind one config constant |
| Zone data | Hardcoded ZIP3 to ZIP3 zone matrix, generated and labeled, behind a pluggable interface |
| Case studies | Fixed frontmatter schema, validated at build, conventional body sections |
| Existing v1 copy | Kept verbatim, migrated into the content system, structure rebuilt around it |
| GitHub and LinkedIn | `github.com/e-grundman`, `linkedin.com/in/erich-grundman` |

## What exists today

The spoke is a working Next 16.2 / React 19.2 / Tailwind 4 app on pnpm with one route. Home page content is three work entries and four writing links hardcoded as arrays in `app/page.tsx`. Fonts are Geist, Geist Mono, and Newsreader. There is no content system, no second route, no Vercel link, and no docs. The typography and palette work is worth keeping. The data model is not.

## Architecture

### Content pipeline

Content is MDX files on disk under `content/`. Frontmatter is parsed with `gray-matter`, validated with Zod, and rendered through the official `@next/mdx` compiler. No third party MDX runtime.

How a page gets built:

1. A loader in `lib/content/` lists files in a content directory with `fs`, parses frontmatter, and runs the Zod schema for that content type. An invalid file throws.
2. Indexes and `generateStaticParams` call the loader. Every content route is statically generated, so a bad file fails `next build` instead of shipping broken.
3. A detail page renders the body with `await import()` on the slug path, which the bundler resolves at build time.

Why this shape and not the alternatives:

- **File based MDX routing** (`app/work/my-case/page.mdx`) was rejected. It puts content inside the route tree, gives no schema enforcement, and still needs `fs` reads to build an index.
- **`next-mdx-remote`** was rejected. It adds a runtime dependency for a job the first party compiler already does for local files.
- **Velite or Content Collections** were rejected for Phase 1. Both are good, both add a build step and a config surface, and neither earns it at ten to thirty content files.

Cost of the chosen approach: the body renderer uses a dynamic import path, which means content filenames must stay URL safe. The loader enforces that.

### Content types and schemas

Defined in `lib/content/schema.ts`. Fields marked required fail the build when missing.

**`content/work/*.mdx`** case studies:

```
title        required  string
summary      required  string, one or two sentences, feeds index and meta description
role         required  string
org          required  string, may be generic where a client cannot be named
timeframe    required  string, for example "2024 to 2026"
domains      required  array of: parcel | fulfillment | billing | data | ai | ops
constraint   required  string, the one thing that could not move
metrics      required  array of { label, before?, after?, value?, unit? }, at least one
publishedAt  required  ISO date
featured     optional  boolean, controls home page selection
draft        optional  boolean, excluded from indexes and from sitemap
```

Body sections by convention, checked by `pnpm content:check`: `## Situation`, `## Constraint`, `## What I did`, `## Result`, `## What I would do differently`. The last section is the one most portfolios skip and the one a hiring manager actually reads.

**`content/writing/*.mdx`** posts:

```
title        required  string
summary      required  string
publishedAt  required  ISO date
tags         required  array of string
canonical    optional  URL, set when the piece was published elsewhere first
externalOnly optional  boolean, index links out and no local page is generated
draft        optional  boolean
```

`externalOnly` is what carries the four existing LinkedIn posts without rewriting them as site pages. The Writing index shows them with an outbound marker. When you later want one to live on the site, you paste the body in and flip the flag.

**`content/labs/*.mdx`** lab registry:

```
title           required  string
summary         required  string
status          required  live | prototype | planned
route           required  string, for example "/labs/zone-optimizer"
tags            required  array of string
dataProvenance  required  string, plain language statement of where the data came from
publishedAt     required  ISO date
```

A lab is metadata plus a hand built route. The MDX body is the explainer text shown above the tool. `dataProvenance` is required on every lab by design, because the compliance line in this project is a build constraint and not a preference.

### Routes

```
/                     Home. Positioning, featured work, recent writing, labs teaser.
/about                Narrative, career shape, profile links repeated in body text.
/work                 Case study index with metric rows.
/work/[slug]          Case study detail.
/writing              Post index, local and external in one chronological list.
/writing/[slug]       Post detail, generated only for non externalOnly entries.
/labs                 Lab index, grouped by status.
/labs/zone-optimizer  The real lab.
/labs/[slug]          Registry driven shell for planned labs, renders MDX body and status.
/contact              Two named paths: hiring conversations, consulting engagements.
```

Plus `app/sitemap.ts`, `app/robots.ts`, `not-found.tsx`, and per route `generateMetadata`.

### File layout

```
portfolio-site/
  app/
    layout.tsx                 root layout, fonts, header, footer
    page.tsx                   home
    about/page.tsx
    work/page.tsx
    work/[slug]/page.tsx
    writing/page.tsx
    writing/[slug]/page.tsx
    labs/page.tsx
    labs/zone-optimizer/page.tsx
    labs/[slug]/page.tsx
    contact/page.tsx
    sitemap.ts  robots.ts  not-found.tsx  globals.css
  components/
    site-header.tsx  site-footer.tsx  profile-links.tsx
    prose.tsx  metric-row.tsx  kicker.tsx  section.tsx
    labs/zone-optimizer/*        client UI for the lab
  content/
    work/*.mdx  writing/*.mdx  labs/*.mdx
  lib/
    content/schema.ts  loader.ts  types.ts
    site.ts                      one config object: name, url, profiles, email
    zones/
      zip3-centroids.json        generated, provenance header in adjacent README
      zone-matrix.generated.json generated
      index.ts                   getZone(originZip3, destZip3) interface
    rates/
      synthetic-ground-rates.json  labeled synthetic list rate grid
      index.ts                     getRate({ zone, billableWeightLb, surcharges })
    labs/zone-optimizer/
      orders.ts        seeded synthetic order distribution by ZIP3
      nodes.ts         candidate fulfillment node locations
      model.ts         assignment, zone histogram, average zone, blended cost
      model.test.ts    unit checks on the math
  scripts/
    generate-zone-matrix.ts
    check-content.ts
  docs/
    PLAN.md  BACKLOG.md  DECISIONS.md
  mdx-components.tsx
```

`lib/site.ts` holds the LinkedIn URL, the GitHub URL, the email, and the site URL. Nothing else hardcodes them, so the custom domain swap is one line.

## The parcel zone optimization lab

### Data modules, and how the compliance line is held

Three independent modules, each swappable without touching the others.

**1. Zone lookup.** A hardcoded ZIP3 to ZIP3 matrix, per your call. Two mitigations, because a full carrier keyed matrix is the exact artifact that could later get swapped for an employer copy:

- The matrix is *generated*, not sourced. `scripts/generate-zone-matrix.ts` computes great circle distance between ZIP3 centroids, then assigns zone 2 through 8 using published carrier ground distance bands. The output file carries a provenance header naming the generator, the band table, and the date.
- It is keyed only to the candidate node ZIP3s, roughly twelve origins by about nine hundred destinations. That is near ten thousand rows instead of eight hundred and ten thousand, so the file stays readable and reviewable by a human.

Centroids come from public Census ZCTA centroid data aggregated to three digit prefix. If that fetch is not available at build prep time, the fallback is a documented synthetic centroid set, labeled as such in the same provenance header, and the plan flags it to you rather than quietly shipping. Either way the interface is `getZone(originZip3, destZip3): Zone`, so a real carrier table can replace the file later with no other change.

**2. Rate table.** `lib/rates/synthetic-ground-rates.json` is a synthetic list rate grid shaped like published ground rates: zone 2 through 8 across weight breaks from one to seventy pounds, plus a fuel surcharge percentage and a residential surcharge. Every number is synthetic and the file says so in its header. No negotiated rate, no discount schedule, no accessorial pricing from any agreement. Interface is `getRate({ zone, billableWeightLb, residential })`.

**3. Synthetic orders.** A seeded pseudorandom generator produces a destination distribution across ZIP3s weighted roughly to US population density, with a lognormal weight distribution. Seeded means the lab is deterministic and your results are reproducible when you show it to someone.

### What the lab computes

Input is a network configuration, meaning one, two, or three node ZIP3s chosen from the candidate list. For each order the model assigns the node that yields the lowest zone, breaking ties on lower landed cost. Output per configuration:

- Zone histogram, orders by zone 2 through 8.
- Average zone, volume weighted.
- Blended cost per package, and total network spend.
- Delta against the baseline single node configuration, in dollars per package and in percent.

The UI puts up to three configurations side by side with a shared axis histogram, so the shift left in the distribution is visible before any number is read. One plain language line explains the mechanism for a reader who does not know what a zone is, phrased as distance bands and not as jargon.

Correctness is checked in `model.test.ts`: a node at a known ZIP3 shipping to its own ZIP3 must return zone 2, adding a second node must never raise average zone, and blended cost must equal total spend divided by order count.

Dim weight is deliberately out of the Phase 1 model and goes in the backlog. It is a real lever and it deserves its own lab rather than a checkbox in this one.

## Repo and deploy plan

The site moves to its own public repo and stops being tracked by the private hub.

1. Fresh `git init` in the spoke directory, so the new public repo starts with no hub history. This matters: hub history contains `01-life`, and rewriting or filtering that history into a public repo is a risk with no upside.
2. Create `github.com/e-grundman/portfolio-site`, public, and push. I will run this with the `gh` CLI if it is authenticated. If not, you get the exact commands to paste.
3. Connect Vercel to the new repo, root directory at repo root, and confirm the preview flow on a branch push.
4. In the hub, remove the spoke from tracking, add it to hub `.gitignore`, and leave `03-projects/portfolio-site/POINTER.md` naming the new repo and the live URL.

Tradeoff to accept: the site directory stays where it is on disk, so your workspace map does not change, but hub `git status` will no longer show site changes and hub commits will no longer contain site code. That separation is the point, and it is also the thing that will surprise you in three weeks if nobody writes it down, so it goes in `99-system/decisions.md` too.

## Implementation order, one commit each

1. Dependencies and MDX config: `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, `gray-matter`, `zod`, `remark-frontmatter`, `remark-gfm`. Add `mdx-components.tsx`, `typecheck` and `content:check` scripts.
2. `lib/site.ts`, header, footer, profile links, root layout wiring. Profile links are real anchors with visible text and accessible labels, present on every page.
3. Content schemas and loaders, plus `scripts/check-content.ts`.
4. Migrate v1 content: three case studies and four external writing entries, copy unchanged. Home page rebuilt as an index over the content system.
5. About page and Contact page.
6. Work and Writing indexes and detail routes.
7. Zone data modules: centroid generation, matrix generator, rate table, provenance docs.
8. Zone optimizer model and tests.
9. Zone optimizer UI and the lab route.
10. Labs index, placeholder lab shell, sitemap, robots, not found.
11. Repo split, first Vercel deploy, `docs/BACKLOG.md` and `docs/DECISIONS.md` filled in.

`docs/BACKLOG.md` and `docs/DECISIONS.md` get created at step 1 and maintained as the work proceeds, not written at the end.

## Explicitly not in Phase 1

CMS, auth, payments, analytics, newsletter, dark mode toggle, animation libraries, contact form with a backend, dim weight modeling, real carrier rate data, search, RSS. Each lands in `docs/BACKLOG.md` with a one line reason.

## Open risks

1. **Public ZIP3 centroid availability.** Mitigated by a labeled synthetic fallback and a flag to you.
2. **Turbopack and `@next/mdx`.** Next 16 defaults to Turbopack. The MDX plugin path is supported, but if `pnpm build` surfaces a loader problem I will report it rather than silently switching bundlers.
3. **Public repo and the compliance line.** A public repo means the synthetic datasets are readable by anyone. That is intended, and it is also why every data file carries a provenance header. Nothing in the repo may originate from an employer system, including in comments and commit messages.
