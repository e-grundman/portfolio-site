/**
 * Career highlights on the home page, ordered by weight: money, then scale,
 * then the software proof, then service results. Six, so the two column grid
 * closes evenly.
 *
 * Sourced from the resume and the LinkedIn profile rework. Dollar figures are
 * shown here by Erich's call on 2026-09-17, a deliberate difference from
 * LinkedIn, which keeps none. No customer or carrier is named.
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
    // A growth multiple rather than monthly volume, by Erich's call on
    // 2026-09-18: the multiple tells the story without publishing how many
    // orders the service line ships.
    figure: "~9×",
    label: "Hazmat order volume, 3 carriers to 6, same margin",
    detail:
      "I identified the flaws in the existing setup, designed the solution, and worked with engineering and operations to implement it. Volume grew almost ninefold, with margin held and carrier violations sharply down.",
  },
  {
    figure: "4,000+",
    label: "Hours of manual work eliminated a year",
    detail:
      "Three production internal apps, built and shipped as a non-engineer, that centralized the Transportation team's operations, carrier management, and financial reporting.",
  },
  {
    figure: "50% → 90%+",
    label: "On-time delivery, fixed by changing the math",
    href: "/case-studies/routing-on-percentiles",
    detail:
      "Retail-compliance shipments missed their window half the time. Planning to 90th percentile transit, and getting the retailer to move the window off the weekend, fixed it.",
  },
  {
    figure: "50%",
    label: "Faster order to doorstep, at no added cost to the brand",
    href: "/case-studies/dr-squatch-click-to-delivery",
    detail:
      "Click to delivery for a top ecommerce brand went from 7.3 days at its worst to 3.6 at its best, through order cutoffs, carrier selection, and method mix. ShipMonk absorbed the cost.",
  },
  {
    figure: "25%",
    label: "Faster warehouse to doorstep, $2M+ saved",
    detail:
      "A customized shipping solution for a key merchant that cut ship to delivery time 25% and delivered $2M+ in transportation savings.",
  },
];
