import type { Metadata } from "next";
import { Kicker } from "@/components/kicker";
import { ProfileLinks } from "@/components/profile-links";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About",
  description:
    "Eight years across ecommerce fulfillment, parcel transportation, carrier performance, and logistics data products, starting in customer support.",
};

export default function About() {
  return (
    <section className="py-6">
      <Kicker>About</Kicker>
      <h1 className="headline text-5xl sm:text-6xl">
        I learned the network from the floor up.
      </h1>

      <div className="mt-10 text-pretty space-y-5 text-lg leading-relaxed">
        <p>
          Eight years at ShipMonk across six roles and five teams, and I started
          in customer support. The job never changed: find the problem nobody
          had untangled yet, and turn it into a decision the business could bet
          on.
        </p>
        <p className="text-muted">
          Two things from the phones never left me. Information nobody can act
          on is only slightly better than no information at all, and it usually
          costs more to produce. Additionally, the greatest reassurance you can
          give a customer is not an apology, it is an explanation. If you can
          tell someone exactly why something is happening, that will carry you
          through almost anything short of a purely emotional reaction.
        </p>
        <p className="text-muted">
          Cost models across twelve fulfillment sites. KPI frameworks for cost,
          margin, and on-time performance. Three production apps I shipped myself.
          When the operation and the spreadsheet disagree, I trust the
          operation.
        </p>
        <p className="text-muted">
          Every operational decision is an economic decision. Software should
          remove decisions before it removes clicks. Most dashboards are vanity
          displays. I build the ones that aren&apos;t.
        </p>
      </div>

      <div className="mt-14 border-t-2 border-line pt-10">
        <h2 className="field-label text-sm">
          What I work on
        </h2>
        <div className="mt-6 text-pretty space-y-5 leading-relaxed text-ink/85">
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
            Applied AI where it earns its place. AI-assisted development let
            me build and ship three production internal apps as a
            non-engineer, on Next.js, Vercel, and Neon, starting from my own
            no-code automation prototypes. Together they eliminated more than
            4,000 hours of manual work a year. The judgment stays with the
            person who knows the network. The speed comes from the tooling.
          </p>
        </div>
      </div>

      <div className="mt-14 border-t-2 border-line pt-10">
        <h2 className="field-label text-sm">
          Off the clock
        </h2>
        <div className="mt-6 text-pretty space-y-5 leading-relaxed text-ink/85">
          <p>
            Chicago native, so Chicago&apos;s teams still hold my heart,
            however as a Tampa transplant the Bucs have become a close second,
            and Sundays in the fall are spent at Raymond James. My wife and I
            are expecting a son.
          </p>
          <p>
            My nerd hobby is points and miles, which, it turns out, is the same
            game as parcel pricing with better destinations: a published rate, a
            set of rules almost nobody reads, and real value hiding in the gap
            between them. I fell for it planning our two-week honeymoon to
            Singapore and Thailand almost entirely on points, including round
            trip on Singapore Airlines in business class.
          </p>
        </div>
      </div>

      <div className="mt-14 border-t-2 border-line pt-10">
        <h2 className="field-label text-sm">
          Elsewhere
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-ink/85">
          I write regularly on{" "}
          <a
            href={site.profiles.linkedin.href}
            aria-label={site.profiles.linkedin.accessibleLabel}
            target="_blank"
            rel="noopener noreferrer me"
            className="underline decoration-highlight decoration-[3px] underline-offset-2"
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
            className="underline decoration-highlight decoration-[3px] underline-offset-2"
          >
            GitHub
          </a>
          .
        </p>
        <ProfileLinks className="mt-6" withEmail />
      </div>

      <div className="mt-14 border-t-2 border-line pt-10">
        <h2 className="field-label text-sm">
          Get in touch
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-ink/85">
          If you are hiring for senior product or AI product builder roles at a
          logistics, fulfillment, or ecommerce infrastructure company, this is
          the right inbox. Include the role and the problem it exists to solve,
          because a specific first message gets a specific answer.
        </p>
        <p className="mt-6">
          <a
            href={`mailto:${site.email}`}
            aria-label={`Email ${site.name}`}
            className="font-mono text-sm"
          >
            {site.email}
          </a>
        </p>
      </div>
    </section>
  );
}
