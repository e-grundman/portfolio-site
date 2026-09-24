# Plan: sync erichgrundman.com to the 2026-09-24 resume

Status: executed 2026-09-24, merged as PR #1. Steps 1 to 4 and 6 are done.
Step 5 (host the resume PDF) is on hold by Erich's call; run it only when he
puts the PDF in `public/`. The headline was also changed to match the resume,
by his call, overriding the "Do not do" line below.

Written 2026-09-24 by Claude Fable for an Opus session to carry out.

## Why this exists

The resume was revised on 2026-09-24. Its source of record is
`~/CC_Personal/02-career/resume.md`, and every claim on it is backed by
`~/CC_Personal/02-career/verified-claims.md`. The site, the resume, and LinkedIn
are supposed to read from the same facts. A mapping pass on 2026-09-24 found the
site agrees with the resume on every number and differs on seven small things.
This plan closes those and adds one thing the site is missing.

## Read these first, in this order

1. `~/CC_Personal/02-career/verified-claims.md`. It governs what may be published.
   If a change below conflicts with it, the claims file wins and you stop and
   report.
2. `~/CC_Personal/02-career/resume.md`, the printed-page block only (between the
   two `---` rules), plus the section "Changes, 2026-09-24" in its maintenance
   notes.
3. `README.md` in this repo, for the data policy and the commands.
4. `AGENTS.md` in this repo. It warns that this Next.js version differs from
   training data. Read `node_modules/next/dist/docs/` before touching any route
   file, as it says.
5. `docs/DECISIONS.md`, so you do not undo a decision already taken.

## Rules for this job

- **No new claims.** Every sentence you add must trace to a line in
  `verified-claims.md`. If you need a fact that is not there, leave a `TODO`
  comment naming the fact, and report it. Do not fill it in.
- **The site keeps its error bars.** The resume states bare numbers by design;
  the site states ranges and methods by design. Do not "align" the site to the
  resume's bravado. `lib/highlights.ts` stays as it is.
- **Voice.** Site copy is written as Erich. Follow
  `~/CC_Personal/02-career/voice/voice-profile.md`. No em dashes anywhere in
  copy. Short sentences, active voice.
- **Scope.** Only the files named below. If you find something else wrong, add
  it to `docs/BACKLOG.md` with one line on why, and leave it.
- **Branch.** Work on `resume-sync-2026-09-24`. Push it. Vercel builds a preview
  from any non-main branch. Open a pull request against `main` with `gh pr create`
  and do not merge it.
- **Checks before every commit.** From the repo root:

  ```
  pnpm typecheck && pnpm content:check && pnpm test && pnpm build
  ```

  All four must pass. If one fails, fix it or revert the step; never commit red.
- **One commit per step below,** message in the form
  `Resume sync: <step title>`. End every commit message with the attribution
  line Claude Code gives you.

## Steps, in priority order

### Step 1. Years of experience on /about

**File:** `app/about/page.tsx`, the `description` string in the page metadata
(around line 11).

**Current:**
`"Eleven years across ecommerce fulfillment, parcel transportation, carrier performance, and logistics data products, starting in customer support."`

**Why:** Erich's decision 2026-09-24, recorded in `verified-claims.md` under
"Years of experience": never pair "eleven" with "fulfillment." Eleven counts two
years of food-delivery customer care at Grubhub. Eight counts ShipMonk only, and
that is what the resume now says.

**Change to:**
`"Eight years in ecommerce fulfillment and parcel transportation at ShipMonk, after two in customer care at Grubhub. Senior product manager for shipping and transportation, in Tampa."`

**Also check** the body prose on the same page (around lines 34 to 51). It says
"first two years at Grubhub" and "first three years at ShipMonk in Customer
Success." Both are true and stay. Confirm no other "eleven" or "11" survives in
`app/`, `content/`, or `lib/`:

```
grep -rn -i "eleven\|11 years" app content lib
```

Success is zero hits after your change.

### Step 2. Split the Grubhub timeline row on /about

**File:** `app/about/page.tsx`, the `<dl>` timeline (around lines 79 to 128).
The last row reads `2015 – 2017` / `Customer Care, specialist then team lead` ·
`Grubhub`.

**Change to two rows,** in the same markup as the rows above them, newest first:

- `2016 – 2017` / `Customer Care Team Lead` · `Grubhub`
- `2015 – 2016` / `Customer Care Specialist` · `Grubhub`

**Why:** the resume and LinkedIn now list Grubhub as two roles. The three
surfaces carry the same timeline or they drift. The split is recorded in the
`verified-claims.md` timeline table. Keep the en dash with spaces, `2015 – 2016`,
because that is the site's existing format; the resume's `2015–2016` is that
document's own format and does not transfer.

Do not add a `2017 – 2018` row. The gap between Grubhub and ShipMonk is
deliberate at year granularity; `resume.md` explains it under "Dates, and the
three omitted roles."

### Step 3. Fix the role in two draft case studies

Both files are `draft: true` and do not ship to production, but their
frontmatter is wrong and will be wrong the day they publish.

- `content/case-studies/dashboard-that-changed-nothing.mdx`, line 4:
  `role: "Senior Product Manager, Shipping and Transportation"` with
  `timeframe: "2025"`. The Senior title took effect August 2026. Change role to
  `"Product Manager, Shipping and Transportation"`.
- `content/case-studies/exceptions-automated.mdx`, line 4: same role string with
  `timeframe: "2025 to 2026"`. Change role to
  `"Product Manager, then Senior Product Manager, Shipping and Transportation"`,
  which is the form `internal-apps.mdx` already uses for a span that crosses the
  promotion.

Leave `routing-on-percentiles.mdx` alone. It says "Product Manager" for "Early
2026," and that is correct: the promotion came in August.

Run `pnpm content:check` after; the schema validates these fields.

### Step 4. Add a tools sentence to /about

**File:** `app/about/page.tsx`. Find the paragraph that ends with "in Tampa"
(around line 51), or the "walk the machinery yourself" tenet (around line 147),
whichever reads better with one more sentence. Choose one place, not both.

**Add:**
"Day to day that means SQL in Snowflake and Metabase, Tableau for the parts
other teams read, and Claude Code for the software I ship myself."

**Why:** the resume now carries a Skills section and the site has no tool names
at all. Recruiters search on tool names. Every tool in the sentence is on the
resume's Skills lines. Do not add Next.js, Vercel, or Neon here; on the site
those belong only inside the internal-apps case study, where they already are.
`resume.md` explains the distinction under rule 3 of "The resume's job is to
get a screen."

### Step 5. Host the resume PDF, gated on the file existing

**Check first:** does `public/Erich-Grundman-Resume.pdf` exist? Erich drops it
there himself after regenerating it. If the file is absent, skip this step,
say so in the report, and do not create a placeholder.

If it exists:

1. Run `pdffonts public/Erich-Grundman-Resume.pdf`. Every row must say
   `CID TrueType`. If any row says `Type 3`, stop this step and report it; the
   PDF was printed with the wrong fonts and must not be published.
2. Run `pdftotext public/Erich-Grundman-Resume.pdf - | head -3`. The first line
   must be `ERICH R. GRUNDMAN` with spaces.
3. Add a link to it in two places, matching the existing link styling:
   - `app/about/page.tsx`, in the "Get in touch" block after the hiring
     paragraph: one short line, "The resume is one page: Erich-Grundman-Resume.pdf."
     with the filename as the link text and `download` on the anchor.
   - `components/profile-links.tsx`, as a fourth entry after GitHub, label
     "Resume". Read the component first; if it renders from a fixed list in
     `lib/site.ts`, add it there instead.
4. Add the PDF path to `app/sitemap.ts` only if that file already lists static
   assets. If it lists routes only, leave it.

**Why the gate:** the file carries a phone number. Publishing it is Erich's call
and he makes it by putting the file in `public/`. Note in the report that the
hosted copy exposes the phone number to anyone, so he can decide whether to
print a second copy without it.

### Step 6. Housekeeping found during the mapping

- `README.md`, the content directory table (around line 24) names
  `content/work/`. The real path is `content/case-studies/`. Fix the table.
- `docs/BACKLOG.md`: append these three lines under a new heading
  "Candidates from the 2026-09-24 resume sync," each with its reason:
  - A case study on the carrier rollout that was limited to zips where delivery
    performance matched the incumbent network. Blocked until the method is
    recorded in `verified-claims.md`; see the claim section there. It is the
    only trade-off story in the portfolio with no number in it, which is why it
    belongs here once it is backed.
  - The Operations Analytics era (12 sites, cost models, labor planning) has no
    presence on the site. Blocked for the same reason: cleared for the resume
    only, method not documented.
  - The resume's Selected Work line says "three case studies and two decision
    tools." When either draft case study publishes, the resume line and this
    site both change. Whoever publishes a draft updates `resume.md` the same day.

## Do not do

- Do not touch `lib/highlights.ts`. The figures, ranges, and detail strings
  there were settled 2026-09-18 to 2026-09-22 and the resume does not change
  them.
- Do not add an Education section, a Skills page, or a Resume page beyond the
  PDF link. The site shows work; the resume claims it.
- Do not add the carrier rollout claim, the 12 fulfillment sites, the two-month
  cutover, the European launch, the shipping insurance process, or the SQL
  pipelines anywhere on the site. All are resume-only until
  `verified-claims.md` records a method.
- Do not restate "4,000+" without the range beside it anywhere new. The
  existing highlight already carries the range.
- Do not change the `lib/site.ts` headline. It reads "Ecommerce Fulfillment &
  Parcel Economics" and the resume reads "Parcel Transportation & Ecommerce
  Fulfillment." That is a wording difference, not a fact conflict, and LinkedIn
  matches the site. Flag it in the report as a choice for Erich; do not make it.
- Do not merge the pull request.

## Report format, when done

Give Erich, in this order:

1. The pull request URL and the Vercel preview URL.
2. A table of steps 1 to 6 with Done, Skipped, or Blocked and one line each.
3. The output of the four checks from the last commit, pasted verbatim.
4. Any `TODO` you left and the fact it needs.
5. The two decisions reserved for him: the phone number on the hosted PDF, and
   the headline wording.

Peanut-butter-and-jelly for the merge, so he can do it without you: open the PR
URL in a browser, read the Vercel preview link in the checks section, click
through the About page and one case study, then press "Merge pull request" and
"Confirm merge." Production deploys on its own within about two minutes.
