# erichgrundman.com

Personal site and demo platform for Erich Grundman, senior product manager in parcel transportation, ecommerce fulfillment, and logistics data products.

The site is two things at once. It is a portfolio for hiring managers and consulting clients, and it is a permanent home for interactive labs that model how parcel economics actually work.

## Data policy

Everything published here is original or synthetic. No employer data, no customer names, no negotiated rates, no internal screenshots, no reproduction of any internal system. Every dataset in `lib/` carries a provenance header stating where it came from, and every lab declares its provenance in frontmatter, enforced by the content schema.

Where a lab needs carrier behavior, it uses published carrier structures such as zone distance bands, or clearly labeled synthetic approximations. It never uses a negotiated agreement.

## Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind 4, MDX content, deployed on Vercel. No CMS, no database, no auth.

## Content model

Content is MDX on disk. Adding a case study, a post, or a lab is one file, with no layout code touched.

| Directory | What it holds |
|---|---|
| `content/portfolio/` | Portfolio entries. Metadata, provenance, and the explainer body shown above each tool. |
| `content/work/` | Case studies. Fixed frontmatter plus five required body sections. Section currently switched off. |
| `content/writing/` | Long form posts. Section currently switched off, holding one draft template. |

### Sections

`sections` in `lib/site.ts` controls what the site publishes. A disabled section keeps its routes and its content in the repo, but is absent from navigation, generates no pages, and publishes no sitemap URLs. Work and Writing are off today. Switch one to `true` and it returns with no other change.

Frontmatter schemas live in `lib/content/schema.ts`. `pnpm content:check` runs before every build and fails on an invalid file.

## Portfolio

| Entry | What it does |
|---|---|
| Parcel zone optimizer | Takes a synthetic distribution of order destinations by ZIP3 and a set of candidate fulfillment nodes, then computes the zone distribution, average zone, and blended cost per package for each network configuration. |

The zone lookup and the rate table are separate pluggable modules, so either can be replaced without touching the model or the interface.

## Commands

```bash
pnpm install
pnpm dev             # local development
pnpm build           # content check, then production build
pnpm typecheck       # tsc --noEmit
pnpm test            # model unit tests
pnpm content:check   # validate every content file
pnpm zones:generate  # regenerate the ZIP3 zone matrix from centroids and bands
```

## Docs

`docs/PLAN.md` holds the Phase 1 plan, `docs/DECISIONS.md` the architectural choices and why, `docs/BACKLOG.md` what was deferred and the reason.

## Deploy

Live at https://erichgrundman.com

Vercel is connected to this repository. A push to `main` deploys to production, and a push to any other branch creates a preview. Both paths are verified.

When a custom domain is added, set `NEXT_PUBLIC_SITE_URL` to it in the Vercel project so canonical URLs, Open Graph metadata, sitemap, and robots all follow. That variable is the only place the origin is configured, and changing it needs no code change.
