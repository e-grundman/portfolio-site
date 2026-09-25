/**
 * Career highlights on the home page. Money leads, then on-time delivery, the
 * software proof, hazmat scale, and speed. Hazmat and on-time delivery swapped
 * on 2026-09-24 by Erich's call. Five, so the last field spans the bottom row,
 * which suits the longest detail text on the page.
 *
 * Sourced from the resume and the LinkedIn profile rework. Dollar figures are
 * shown here by Erich's call on 2026-09-17, a deliberate difference from
 * LinkedIn, which keeps none. No customer or carrier is named.
 *
 * The $2M+ merchant highlight was cut 2026-09-22 during the resume rebuild. It
 * described no mechanism and is flagged unverified in verified-claims.md, which
 * put it below the standard the other four set by publishing their own error
 * bars. The scope it used to occupy moved into the section intro on the home
 * page. Restore it only with a mechanism sentence and a savings method.
 */
export type Highlight = {
  figure: string;
  label: string;
  detail: string;
  /** Set when a published case study tells the whole story. */
  href?: string;
};

export const highlights: Highlight[] = [
  {
    figure: "$10M+",
    label: "Annual carrier savings, delivered through 10 launches",
    detail:
      "6 new carriers, 3 expansions, and 1 relaunch, all API integrations. Product lead on each, and on several the full launch, from negotiation data to rollout.",
  },
  {
    figure: "50% → 90%+",
    label: "On-time delivery, fixed by changing the math",
    href: "/case-studies/routing-on-percentiles",
    detail:
      "Retail-compliance shipments missed their window half the time. Planning to 90th percentile transit, and getting the retailer to move the window off the weekend, fixed it.",
  },
  {
    figure: "4,000+",
    label: "Hours of manual work eliminated a year",
    href: "/case-studies/internal-apps",
    detail:
      "Three production internal apps, built and shipped as a non-engineer, that centralized the Transportation team's operations, carrier management, and financial reporting.",
  },
  {
    // A growth multiple rather than monthly volume, by Erich's call on
    // 2026-09-18: the multiple tells the story without publishing how many
    // orders the service line ships.
    figure: "~9×",
    label: "Hazmat order volume, 3 carriers to 6, same margin",
    href: "/case-studies/hazmat-from-a-flag-to-a-rulebook",
    detail:
      "I identified the flaws in the existing setup, designed the solution, and worked with engineering and operations to implement it. Volume grew almost ninefold, with margin held and carrier violations sharply down.",
  },
  {
    figure: "50%",
    label: "Faster order to doorstep, at no added cost to the brand",
    href: "/case-studies/dr-squatch-click-to-delivery",
    detail:
      "Cut click to delivery for ShipMonk merchant Dr. Squatch from 7-8 days to under 4 on economy orders, through order cutoffs, carrier selection, and method mix.",
  },
];
