/**
 * Single source of truth for identity and destination URLs.
 *
 * Nothing else in the app hardcodes a profile URL, an email address, or the
 * site origin, so moving to a custom domain is a one line change here.
 */
export const site = {
  name: "Erich Grundman",
  role: "Senior Product Manager",
  tagline: "Operations into software",
  description:
    "Senior product manager working where operations meet software: parcel transportation, ecommerce fulfillment, decision science, and applied AI.",
  // The live Vercel alias. Swap for the custom domain when it is registered,
  // or override with NEXT_PUBLIC_SITE_URL in the Vercel project, which is the
  // no deploy path. Used for canonical URLs, Open Graph metadata, sitemap,
  // and robots.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-site-three-eta-12.vercel.app",
  email: "e.grundman@gmail.com",
  profiles: {
    linkedin: {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/erich-grundman",
      accessibleLabel: "Erich Grundman on LinkedIn",
    },
    github: {
      label: "GitHub",
      href: "https://github.com/e-grundman",
      accessibleLabel: "Erich Grundman on GitHub",
    },
  },
} as const;

export type ProfileKey = keyof typeof site.profiles;

/**
 * Which sections the site publishes.
 *
 * A disabled section keeps its routes and its loader in the repo but is absent
 * from navigation, generates no pages, and is excluded from the sitemap. Turn
 * one back on here and it returns with no other change.
 *
 * work: cut from navigation. The case studies stay in content/work so nothing
 * written is lost.
 * writing: held back until there are long form pieces worth a page of their
 * own. The four LinkedIn posts that used to be indexed here were removed.
 */
export const sections = {
  about: true,
  portfolio: true,
  work: false,
  writing: false,
} as const;

export type SectionKey = keyof typeof sections;
