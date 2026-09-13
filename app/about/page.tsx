import type { Metadata } from "next";
import { Kicker } from "@/components/kicker";
import { ProfileLinks } from "@/components/profile-links";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Eight years across ecommerce fulfillment, parcel transportation, carrier performance, and logistics data products, starting in customer support.",
};

export default function About() {
  return (
    <section className="border-t border-rule py-16">
      <Kicker>About</Kicker>
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        I learned the network from the floor up.
      </h1>

      <div className="mt-10 max-w-xl space-y-5 text-lg leading-relaxed">
        <p>
          Eight years at ShipMonk across six roles and five teams, and I started
          in customer support. The job never changed: find the problem nobody
          had untangled yet, and turn it into a decision the business could bet
          on.
        </p>
        <p className="text-muted">
          Cost models across twelve fulfillment sites. KPI frameworks for cost,
          margin, and on-time performance. Production software I shipped myself.
          I learned the network from the floor up, which is why I trust the
          operation over the spreadsheet when they disagree.
        </p>
        <p className="text-muted">
          Every operational decision is an economic decision. Software should
          remove decisions before it removes clicks. Most dashboards are vanity
          displays. I build the ones that aren&apos;t.
        </p>
      </div>

      <div className="mt-14 border-t border-rule pt-10">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          What I work on
        </h2>
        <div className="mt-6 max-w-xl space-y-5 leading-relaxed text-ink/85">
          <p>
            Parcel transportation and the cost mechanics underneath it: zone
            structure, dim weight, accessorials, the annual general rate
            increase, and the gap between a published rate table and what an
            invoice actually says. Carrier performance measured in scan latency
            and exception rates rather than in marketing claims.
          </p>
          <p>
            Ecommerce fulfillment as an operating system: node placement,
            method mix, warehouse to carrier handoff, and the routing rules that
            quietly decide margin. Logistics billing, invoice variance, and
            claims, where most of the recoverable money hides in the difference
            between what was quoted and what was rated.
          </p>
          <p>
            Applied AI where it earns its place, which for me has meant using
            AI-assisted development to ship production systems without a
            platform team behind me. The judgment stays with the person who
            knows the network. The speed comes from the tooling.
          </p>
        </div>
      </div>

      <div className="mt-14 border-t border-rule pt-10">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Elsewhere
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-ink/85">
          I write regularly on{" "}
          <a
            href={site.profiles.linkedin.href}
            aria-label={site.profiles.linkedin.accessibleLabel}
            target="_blank"
            rel="noopener noreferrer me"
            className="text-accent underline decoration-rule underline-offset-4 transition-colors hover:decoration-accent"
          >
            LinkedIn
          </a>{" "}
          about parcel economics and decision science, and the code behind this
          site and its labs is public on{" "}
          <a
            href={site.profiles.github.href}
            aria-label={site.profiles.github.accessibleLabel}
            target="_blank"
            rel="noopener noreferrer me"
            className="text-accent underline decoration-rule underline-offset-4 transition-colors hover:decoration-accent"
          >
            GitHub
          </a>
          .
        </p>
        <ProfileLinks className="mt-6" withEmail />
      </div>

      <div className="mt-14 border-t border-rule pt-10">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Get in touch
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-ink/85">
          Two kinds of conversation reach me here. Senior product and AI product
          builder roles at logistics, fulfillment, and ecommerce infrastructure
          companies. Consulting engagements covering carrier contract audits, 3PL
          RFP packages, and logistics billing dispute briefs. Say which one you
          are starting and include the shape of the problem, because a specific
          first message gets a specific answer.
        </p>
        <p className="mt-6">
          <a
            href={`mailto:${site.email}`}
            aria-label={`Email ${site.name}`}
            className="font-mono text-sm text-accent transition-opacity hover:opacity-70"
          >
            {site.email}
          </a>
        </p>
      </div>
    </section>
  );
}
