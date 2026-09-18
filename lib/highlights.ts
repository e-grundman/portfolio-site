/**
 * Career highlights on the home page, ordered by weight: money, then the
 * software proof, then service results.
 *
 * Sourced from the resume and the LinkedIn profile rework. Dollar figures are
 * shown here by Erich's call on 2026-09-17, a deliberate difference from
 * LinkedIn, which keeps none. No customer or carrier is named.
 */
export type Highlight = {
  figure: string;
  label: string;
  detail: string;
};

export const highlights: Highlight[] = [
  {
    figure: "$10M+",
    label: "Annual carrier savings, delivered through 10 launches",
    detail:
      "6 new carriers, 3 expansions into new countries and warehouses, and 1 relaunch, all API integrations. Product lead on each, and on several the full launch: negotiation data and strategy, implementation, engineering requirements, and rollout.",
  },
  {
    figure: "4,000+",
    label: "Hours of manual work eliminated a year",
    detail:
      "Three production internal apps, built and shipped as a non-engineer on Next.js, Vercel, and Neon from my own no-code automation prototypes. They centralized the Transportation team's operations, carrier management, and financial reporting.",
  },
  {
    figure: "50% → 90%+",
    label: "On-time delivery, fixed by changing the math",
    detail:
      "A brand's retail-compliance shipments missed their delivery window half the time. Planning to 90th percentile transit instead of the average, and getting the retailer to move the window off the weekend, fixed it.",
  },
  {
    figure: "50%",
    label: "Faster order to doorstep, at no added cost",
    detail:
      "Click to delivery time cut in six months for a top ecommerce brand, through method mix, carrier selection, and warehouse routing, with no increase in shipping cost.",
  },
  {
    figure: "25%",
    label: "Faster warehouse to doorstep, $2M+ saved",
    detail:
      "A customized shipping solution for a key merchant that cut ship to delivery time 25% and delivered $2M+ in transportation savings.",
  },
];
