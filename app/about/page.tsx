import type { Metadata } from "next";
import Image from "next/image";
import { Kicker } from "@/components/kicker";
import { ProfileLinks } from "@/components/profile-links";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About",
  description:
    "Eight years in ecommerce fulfillment and parcel transportation at ShipMonk, after two in customer care at Grubhub. Senior product manager for shipping and transportation, in Tampa.",
};

export default function About() {
  return (
    <section className="py-6">
      <Kicker>About</Kicker>
      <h1 className="headline text-5xl sm:text-6xl">
        I built my career up from the call-center floor.
      </h1>

      <div className="mt-10 text-pretty space-y-5 text-lg leading-relaxed">
        <Image
          src="/about-portrait.jpg"
          alt={site.name}
          width={900}
          height={1200}
          priority
          sizes="(min-width: 640px) 280px, 100vw"
          className="mb-2 w-full border-2 border-line object-cover sm:float-right sm:mt-1 sm:mb-4 sm:ml-8 sm:w-[280px]"
        />
        {/* Erich's copy, 2026-09-19. */}
        <p>
          I spent the first two years of my career in Grubhub&apos;s Customer
          Care department, and my first three years at ShipMonk in Customer
          Success.
        </p>
        <p className="text-muted">
          Two things from the phones have never left me. First, information
          nobody can act on is only slightly better than no information at all.
          Second, the best reassurance you can give a customer isn&apos;t an
          apology, it&apos;s an explanation grounded in knowing the subject. If
          you can tell someone exactly why something is happening and how they
          can act on it, now or next time, that will carry you through almost
          anything short of a purely emotional reaction.
        </p>
        <p className="text-muted">
          Since support, I&apos;ve worked in Business Operations, Marketing, and
          Operations Analytics, and I have been in product since 2024. Today
          I am the senior product manager for shipping and transportation at
          ShipMonk, in Tampa.
        </p>
        <p className="text-muted">
          The surface is carrier integrations and launches, rating and routing,
          hazmat compliance, and the internal tools the transportation team runs
          on. More than 90 percent of ShipMonk&apos;s parcel volume moves through
          the rating and routing I own, across 13 carriers and three resellers of
          those same carriers.
        </p>
        <p className="text-muted">
          The team is four engineers, an engineering lead, and a QA, plus a
          product manager who reports to me. Outside product and engineering my
          standing partner is the Transportation team, which carries the merchant
          experience, the operations, and the commercial sides of the same
          problem. A change I ship can land on one merchant or on all of them,
          and most of the work starts as an argument about what the data says
          before it is ever a roadmap item.
        </p>
        <p>
          The job has always been the same: find the problems nobody has
          untangled, and turn them into decisions the business can bet on.
        </p>
      </div>

      <div className="mt-14 clear-both border-t-2 border-line pt-10">
        <h2 className="field-label text-sm">
          Timeline
        </h2>
        <dl className="mt-6">
          <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-rule py-2.5 last:border-b-0">
            <dt className="font-mono text-sm text-muted">2026 – now</dt>
            <dd className="text-pretty">
              Senior Product Manager, Shipping and Transportation <span className="text-muted">· ShipMonk</span>
            </dd>
          </div>
          <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-rule py-2.5 last:border-b-0">
            <dt className="font-mono text-sm text-muted">2024 – 2026</dt>
            <dd className="text-pretty">
              Product Manager, Shipping and Transportation <span className="text-muted">· ShipMonk</span>
            </dd>
          </div>
          <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-rule py-2.5 last:border-b-0">
            <dt className="font-mono text-sm text-muted">2023 – 2024</dt>
            <dd className="text-pretty">
              Senior Manager, Operations Analytics <span className="text-muted">· ShipMonk</span>
            </dd>
          </div>
          <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-rule py-2.5 last:border-b-0">
            <dt className="font-mono text-sm text-muted">2022 – 2023</dt>
            <dd className="text-pretty">
              Product Marketing Manager <span className="text-muted">· ShipMonk</span>
            </dd>
          </div>
          <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-rule py-2.5 last:border-b-0">
            <dt className="font-mono text-sm text-muted">2021 – 2022</dt>
            <dd className="text-pretty">
              Business Operations Manager <span className="text-muted">· ShipMonk</span>
            </dd>
          </div>
          <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-rule py-2.5 last:border-b-0">
            <dt className="font-mono text-sm text-muted">2019 – 2021</dt>
            <dd className="text-pretty">
              Customer Success Operations Manager <span className="text-muted">· ShipMonk</span>
            </dd>
          </div>
          <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-rule py-2.5 last:border-b-0">
            <dt className="font-mono text-sm text-muted">2018 – 2019</dt>
            <dd className="text-pretty">
              Customer Success Manager <span className="text-muted">· ShipMonk</span>
            </dd>
          </div>
          <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-rule py-2.5 last:border-b-0">
            <dt className="font-mono text-sm text-muted">2016 – 2017</dt>
            <dd className="text-pretty">
              Customer Care Team Lead <span className="text-muted">· Grubhub</span>
            </dd>
          </div>
          <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-rule py-2.5 last:border-b-0">
            <dt className="font-mono text-sm text-muted">2015 – 2016</dt>
            <dd className="text-pretty">
              Customer Care Specialist <span className="text-muted">· Grubhub</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-14 border-t-2 border-line pt-10">
        <h2 className="field-label text-sm">
          Philosophy
        </h2>
        {/* Erich's tenets, trimmed 2026-09-20. Two carry the case behind
            them, with no employer, customer, carrier, or dollar figure. */}
        <div className="mt-6 text-pretty space-y-8">
          <div>
            <h3 className="text-lg font-semibold">The business is the North Star, not the user.</h3>
            <p className="mt-2 leading-relaxed text-ink/85">
              I can do the very best thing in the world for a customer and still be a bad product manager, because if what I shipped is bad for the company paying me to make the call, I have done someone else&apos;s job. That is not permission to optimize the quarter either. Some calls cost money now and are still the only defensible ones.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Walk the machinery yourself.</h3>
            <p className="mt-2 leading-relaxed text-ink/85">
              The usual case for a product manager writing their own queries is efficiency, and efficiency is the weaker case. The schema is a map of how the business works, and the only reliable way to find where that map is wrong is to walk into the wrong part of it yourself.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Ask what the money is buying.</h3>
            <p className="mt-2 leading-relaxed text-ink/85">
              I once spent six weeks refusing a recurring weekly premium meant to move volume off an underperforming carrier, because the transit data put the alternative within a quarter of a day of the incumbent. It would have bought a healthier metric and nothing else. The same spend was right months later, at a third of the size, once it bought leverage instead.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI buys implementation speed, not judgment.</h3>
            <p className="mt-2 leading-relaxed text-ink/85">
              It puts building within reach of a product manager who knows the domain. The domain model, the thresholds, and the rules still have to come from knowing the network.
            </p>
          </div>
        </div>
        <p className="mt-8 text-pretty leading-relaxed text-muted">
          When I am arguing from experience rather than evidence, I say so out
          loud. Every belief here is held at the strength of the evidence
          behind it. Bring me better evidence and I will move. Bring me a
          healthier dashboard and I will ask what we are buying.
        </p>
      </div>

      <div className="mt-14 border-t-2 border-line pt-10">
        <h2 className="field-label text-sm">
          Off the clock
        </h2>
        {/* Erich's copy, 2026-09-20. */}
        <div className="mt-6 text-pretty space-y-5 leading-relaxed text-ink/85">
          {/* Floats the other way from the portrait above, so the two photos
              do not stack down one edge of the page. */}
          <Image
            src="/off-the-clock.jpg"
            alt="Erich Grundman and his wife at a Buccaneers game"
            width={900}
            height={1200}
            sizes="(min-width: 640px) 260px, 100vw"
            className="mb-2 w-full border-2 border-line object-cover sm:float-left sm:mt-1 sm:mr-8 sm:mb-4 sm:w-[260px]"
          />
          <p>
            Chicago, London, Singapore, Chicago again, Bainbridge Island, all
            before I turned fifteen. Chicago is still home. The rest of it
            turned into 34 countries and 33 states, and a working theory that
            you can learn more about a place from an hour in one of its bars
            than from a week of its museums.
          </p>
          <p>
            Most of that travel is funded by an unreasonable points and miles
            habit. I read half a dozen blogs, I track transfer bonuses, and I
            route essentially every dollar I spend toward a future redemption.
            The best one so far was our honeymoon, Singapore Airlines business
            class to Bangkok with a stop in Singapore, then hotels in Singapore,
            Bangkok, Chiang Mai, and Phuket. Roughly $30,000 of travel, about 90
            percent of it on points. My wife has no interest in how any of it
            works, which I believe is the correct division of labor.
          </p>
          <p>
            These days it is Tampa, my wife, two golden retrievers named Leo and
            Mac, Bucs season tickets in the fall, and a boat whenever the
            weather cooperates.
          </p>
        </div>
      </div>

      <div className="mt-14 clear-both border-t-2 border-line pt-10">
        <h2 className="field-label text-sm">
          Get in touch
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-ink/85">
          If you are hiring for senior product manager roles at a logistics,
          fulfillment, or ecommerce infrastructure company, this is the right
          inbox. Include the role and the problem it exists to solve,
          because a specific first message gets a specific answer.
        </p>
        <p className="mt-4 text-pretty leading-relaxed text-muted">
          I write about parcel economics and decision science on LinkedIn, and
          the code behind this site and its tools is public on GitHub.
        </p>
        <ProfileLinks className="mt-6" withEmail />
      </div>
    </section>
  );
}
