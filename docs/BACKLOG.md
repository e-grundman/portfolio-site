# Backlog

Deferred on purpose. Each line says why, so a future session does not relitigate it.

## Out of Phase 1 by instruction

| Item | Why deferred |
|---|---|
| CMS | Content is MDX in the repo. A CMS earns its keep when someone who cannot use git needs to publish. Nobody does. |
| Auth | No private surface exists on the site. |
| Payments | Consulting engagements close by conversation, not checkout. |
| Analytics dashboard | Vercel Analytics can be switched on later without code. A custom dashboard is a project, not a setting. |
| Newsletter | LinkedIn is the distribution channel today. A list is a commitment to a cadence. |
| Dark mode toggle | The palette already responds to `prefers-color-scheme`. A toggle adds state, storage, and a hydration risk for one preference the OS already knows. |
| Animation libraries | The design direction is a documentation site, not a showreel. |

## Deferred by build judgment

| Item | Why deferred |
|---|---|
| Dim weight modeling in the zone lab | A real lever that deserves its own lab. Adding it to the zone tool would blur the one variable that lab exists to isolate. |
| Multi item orders in the dim weight lab | Every synthetic order is one item. Cartonizing several items is its own algorithm and would bury the break even behind a bin packing problem. |
| Additional handling and oversize surcharges in the dim weight lab | Both would widen the gap the lab already shows, not change its direction. Worth adding once the rate module takes accessorials. |
| Editable carton catalog in the dim weight lab | The catalogs are data in `lib/labs/dim-weight/packaging.ts`. Exposing them in the UI is a decision to make after watching someone use the tool. |
| Real carrier rate data | Compliance line. The rate module is pluggable so published list rates can be added later with provenance. |
| Multi-carrier comparison in the lab | Needs a second rate table and a routing rule set. Phase 2. |
| Contact form with a backend | Mailto and LinkedIn cover both audiences with zero infrastructure and zero spam surface. |
| RSS feed for Writing | Worth adding once local posts outnumber external ones. |
| Site search | Not useful under roughly thirty content items. |
| Case study PDF export for consulting prospects | Wait until a prospect asks. |
| OG image generation per content item | `next/og` makes this cheap later. Not a Phase 1 blocker. |
| Delivery area surcharge in the rate model | It is a real cost driver, but it does not vary with node placement, so adding it would raise every configuration by the same amount and dilute the comparison the lab exists to make. |
| Order count and seed controls in the lab UI | The model already takes both as arguments. Exposing them is a UI decision worth making after watching someone use the tool. |
| Real population weighting for demand | Census population by ZCTA now needs an API key. Revisit with a keyless public source. |
| Transit time alongside zone | Zone drives both cost and transit, and showing days would make the service argument as well as the cost one. Needs a transit matrix with its own provenance. |

## Invoice audit agent, deferred 2026-09-25

| Item | Why deferred |
|---|---|
| Durable rate limit for the live run | The counters are in memory and reset per serverless instance. Fine for a demo behind a daily cap; a KV store is the fix if the button gets real traffic. |
| Cheaper model for the audit | Opus 5 is the default. Sonnet 5 would cut cost per run several times over, but the number that matters is the false positive rate across models, and it has not been measured. Measure on twenty seeds first. |
| Real invoice upload | A parser for FedEx invoice CSV in front of the same tools. Deferred because an uploaded invoice is someone's data, and the site's data policy has no place to hold it. |
| UPS and USPS rule sets | The rules module is one carrier. A second carrier is a second rules file and a service field on the invoice, with the same provenance bar: read from the published guide, cited by page. |
| Contract terms in the audit | Negotiated surcharge discounts and earned discount tiers are where most real recoveries sit. Needs a contract model, which is its own tool (see the career workspace for the contract extractor idea). |

## Candidates from the 2026-09-24 resume sync

| Item | Why deferred |
|---|---|
| Case study on the carrier rollout limited to zips where delivery performance matched the incumbent network | Blocked until the method is recorded in `verified-claims.md`; see the claim section there. It is the only trade-off story in the portfolio with no number in it, which is why it belongs here once it is backed. |
| The Operations Analytics era (12 sites, cost models, labor planning) | No presence on the site. Blocked for the same reason: cleared for the resume only, method not documented. |
| Resume Selected Work line (case study count) | `resume.md` says four as of 2026-09-24, when the hazmat study published. The shipped resume PDF (v5) still says three; it changes at the next PDF export. Whoever publishes another study updates `resume.md` the same day. |
| README Sections paragraph says "Work and Writing are off today" | Stale. Case studies are on in `lib/site.ts`; only Writing is off. Found during the sync, outside its scope. |

## Waiting on Erich

| Item | Why deferred |
|---|---|
| Second line under the home page hero sentence, saying he builds the software himself | The hero sentence covers domain and decisions; the build proof arrives at the Portfolio section. Erich writes this line. He deferred it 2026-09-24 rather than force it: the claim is on the resume and in the highlights. Revisit only when he brings a line. |

## Waiting on the employer

| Item | Why deferred |
|---|---|
| Citation for the $10M+ carrier savings highlight | Waiting on an employer publication. When it is live, add `href` on the highlight and cite the employer page, as the Dr. Squatch study does. The method stays off the site by Erich's call, 2026-09-24. |
