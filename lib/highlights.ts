/**
 * Career highlights on the home page.
 *
 * Sourced from the LinkedIn profile rework (About, 2026-09-13), so the site
 * and the profile make the same claims in the same numbers. No exact dollar
 * figures, by the same decision that governs the profile. "Millions in
 * savings" on the click to delivery row is Erich's call, made 2026-09-17.
 */
export type Highlight = {
  figure: string;
  label: string;
  detail: string;
};

export const highlights: Highlight[] = [
  {
    figure: "50%",
    label: "Faster click to delivery, millions saved",
    detail:
      "Cut in six months for a top ecommerce brand, through method mix, carrier selection, and warehouse routing. The faster service cost nothing extra, and the program produced millions in savings for the brand.",
  },
  {
    figure: "25%",
    label: "Faster ship to delivery",
    detail:
      "A customized shipping solution for a key merchant that also reduced transportation cost.",
  },
  {
    figure: "20,000+",
    label: "Exceptions handled unattended",
    detail:
      "An exception automation pipeline, shipped with AI-assisted development alongside a warehouse scheduling system of record.",
  },
  {
    figure: "12",
    label: "Fulfillment sites measured",
    detail:
      "KPI frameworks for cost per order, shipping margin, on-time delivery, scan latency, carrier exceptions, and warehouse to carrier handoff.",
  },
  {
    figure: "8 yrs",
    label: "From the phones to product",
    detail:
      "Started in 2018 explaining late packages to merchants. Then customer success operations, business operations, product marketing, and operations analytics before product.",
  },
];
