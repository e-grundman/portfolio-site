import { z } from "zod";

/** ISO calendar date, for example 2026-07-17. */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date, for example 2026-07-17");

/**
 * A before and after pair, or a single value. Case studies lead with numbers,
 * so at least one metric is required on every one of them.
 */
export const metricSchema = z
  .object({
    label: z.string().min(1),
    before: z.string().optional(),
    after: z.string().optional(),
    value: z.string().optional(),
    unit: z.string().optional(),
  })
  .refine((m) => Boolean(m.value) || Boolean(m.before ?? m.after), {
    message: "a metric needs either value, or before and after",
  });

export const domainSchema = z.enum([
  "parcel",
  "fulfillment",
  "billing",
  "data",
  "ai",
  "ops",
]);

export const caseStudySchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  role: z.string().min(1),
  org: z.string().min(1),
  timeframe: z.string().min(1),
  domains: z.array(domainSchema).min(1),
  constraint: z.string().min(1),
  metrics: z.array(metricSchema).min(1),
  publishedAt: isoDate,
  featured: z.boolean().optional().default(false),
  draft: z.boolean().optional().default(false),
  /** Set when the piece was first published somewhere else. */
  sourceUrl: z.url().optional(),
  /** How to introduce that source, for example "Outcome figures published by". */
  sourceLabel: z.string().optional(),
});

export const writingSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  publishedAt: isoDate,
  tags: z.array(z.string().min(1)).min(1),
  /** Where the piece was published first, if not here. */
  canonical: z.url().optional(),
  /** Index it and link out. No local page is generated. */
  externalOnly: z.boolean().optional().default(false),
  draft: z.boolean().optional().default(false),
});

export const portfolioSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  status: z.enum(["live", "prototype", "planned"]),
  /** Route the piece renders at. A planned one points at its registry shell. */
  route: z.string().startsWith("/portfolio/"),
  tags: z.array(z.string().min(1)).min(1),
  /**
   * Required on every entry. Nothing published here may originate from an
   * employer system, and saying where the data came from is how that stays
   * true under review.
   */
  dataProvenance: z.string().min(1),
  publishedAt: isoDate,
  draft: z.boolean().optional().default(false),
});

export type Metric = z.infer<typeof metricSchema>;
export type CaseStudyFrontmatter = z.infer<typeof caseStudySchema>;
export type WritingFrontmatter = z.infer<typeof writingSchema>;
export type PortfolioFrontmatter = z.infer<typeof portfolioSchema>;

/** Body headings a case study must carry, checked by pnpm content:check. */
export const requiredCaseStudyHeadings = [
  "## Situation",
  "## Constraint",
  "## What I did",
  "## Result",
  "## What I would do differently",
] as const;
