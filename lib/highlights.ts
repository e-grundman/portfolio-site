/**
 * Career highlights on the home page.
 *
 * Sourced from the LinkedIn profile rework (About, 2026-09-13), so the site
 * and the profile make the same claims in the same numbers. No exact dollar
 * figures, by the same decision that governs the profile. "Millions in
 * savings" on the ship to delivery row is Erich's call, made 2026-09-17.
 */
export type Highlight = {
  figure: string;
  label: string;
  detail: string;
};

export const highlights: Highlight[] = [
  {
    figure: "50%",
    label: "Faster click to delivery, at no added cost",
    detail:
      "Cut in six months for a top ecommerce brand, through method mix, carrier selection, and warehouse routing. The speed came without any increase in shipping cost.",
  },
  {
    figure: "25%",
    label: "Faster ship to delivery, millions saved",
    detail:
      "A customized shipping solution for a key merchant that also reduced transportation cost, producing millions in savings for the merchant.",
  },
  {
    figure: "10",
    label: "Carrier launches, millions saved a year",
    detail:
      "6 new carriers, 3 expansions into new countries and warehouses, and 1 relaunch, all API integrations. Together they put millions in annualized carrier savings into production. Product lead on every one, and on several I owned the full launch: the data and strategy behind the rate negotiation, the implementation strategy, the integration requirements for engineering, and the rollout.",
  },
  {
    figure: "4,000+",
    label: "Hours of manual work eliminated a year",
    detail:
      "Three production internal apps, built and shipped as a non-engineer on Next.js, Vercel, and Neon from my own no-code automation prototypes. They centralized the Transportation team's operations, carrier management, and financial reporting.",
  },
];
