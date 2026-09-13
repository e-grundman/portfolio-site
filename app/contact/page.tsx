import type { Metadata } from "next";
import { Kicker } from "@/components/kicker";
import { ProfileLinks } from "@/components/profile-links";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Hiring conversations for senior product roles, and consulting engagements covering carrier contract audits, 3PL RFP packages, and logistics billing disputes.",
};

const paths = [
  {
    kicker: "Hiring",
    title: "Product roles",
    body: "Senior product and AI product builder roles at logistics, fulfillment, and ecommerce infrastructure companies. The fastest way to evaluate me is the work section and the labs, both of which show the reasoning rather than the summary. Tell me what the problem is and I will tell you honestly whether I am the right person for it.",
    subject: "Role conversation",
  },
  {
    kicker: "Consulting",
    title: "Carrier contract audits",
    body: "A structured read of an existing carrier agreement against actual shipment profile: zone distribution, weight distribution, dim weight exposure, accessorial incidence, and the earned discount tiers that are or are not being hit. The deliverable is a ranked list of the terms worth reopening and what each one is worth.",
    subject: "Carrier contract audit",
  },
  {
    kicker: "Consulting",
    title: "3PL RFP packages",
    body: "An RFP package built from your actual order profile rather than from a template: volume and seasonality, SKU and packaging profile, service level requirements, and a scoring model that makes bids comparable on landed cost instead of on rate card optics.",
    subject: "3PL RFP package",
  },
  {
    kicker: "Consulting",
    title: "Billing dispute briefs",
    body: "Invoice variance analysis at shipment level, isolating where the rated charge diverges from the contracted terms, with the evidence assembled into a brief a carrier representative has to answer. Most of the recoverable money is in dim weight remeasures, address correction, and residential classification.",
    subject: "Billing dispute brief",
  },
];

export default function Contact() {
  return (
    <section className="border-t border-rule py-16">
      <Kicker>Contact</Kicker>
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        Working on something where operations meet software?
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        Two kinds of conversation, one inbox. Say which one you are starting and
        include the shape of the problem, because a specific first message gets a
        specific answer.
      </p>

      <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
        {paths.map((path) => (
          <div key={path.title} className="border-t border-rule pt-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {path.kicker}
            </p>
            <h2 className="mt-3 font-serif text-2xl tracking-tight">
              {path.title}
            </h2>
            <p className="mt-3 leading-relaxed text-muted">{path.body}</p>
            <p className="mt-4">
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent(path.subject)}`}
                aria-label={`Email ${site.name} about ${path.title}`}
                className="font-mono text-xs uppercase tracking-[0.15em] text-accent transition-opacity hover:opacity-70"
              >
                Email about this →
              </a>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-14 border-t border-rule pt-8">
        <p className="max-w-xl leading-relaxed text-ink/85">
          Direct email reaches me fastest. LinkedIn works too, and the code for
          this site and its labs is public if you would rather read that first.
        </p>
        <ProfileLinks className="mt-6" withEmail />
      </div>
    </section>
  );
}
