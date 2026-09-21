import type { Metadata } from "next";
import Image from "next/image";
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
        I built my career up from the call-center floor.
      </h1>

      <div className="mt-10 grid gap-8 sm:grid-cols-[1fr_280px] sm:items-start">
        {/* Erich's copy, 2026-09-19. */}
        <div className="text-pretty space-y-5 text-lg leading-relaxed">
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
        <p>
          The job has always been the same: find the problems nobody has
          untangled, and turn them into decisions the business can bet on.
        </p>
        </div>
        <Image
          src="/about-portrait.jpg"
          alt={site.name}
          width={900}
          height={1200}
          priority
          sizes="(min-width: 640px) 280px, 100vw"
          className="w-full border-2 border-line object-cover"
        />
      </div>

      <div className="mt-14 border-t-2 border-line pt-10">
        <h2 className="field-label text-sm">
          Philosophy
        </h2>
        {/* Erich's tenets, trimmed 2026-09-20. Two carry the case behind
            them, with no employer, customer, carrier, or dollar figure. */}
        <div className="mt-6 text-pretty space-y-8">
          <div>
            <h3 className="text-lg font-semibold">Understand the machinery, not the abstraction sitting on top of it.</h3>
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
            <h3 className="text-lg font-semibold">A bet gets the evidence its size and reversibility deserve.</h3>
            <p className="mt-2 leading-relaxed text-ink/85">
              I once piloted a feature on an aggregate that did not hold at the account level, and I could have simulated that failure in an afternoon. Running it was still right, because it taught me the shape of the problem faster than any simulation would have. Cheap reversible bets can run on directional assumptions, recurring commitments cannot, and calling a pilot a pilot, out loud, is what preserves the relationship on the day you roll it back.
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
          sitting under it. Bring me better evidence and I will move. Bring me a
          healthier dashboard and I will ask what we are buying.
        </p>
      </div>

      <div className="mt-14 border-t-2 border-line pt-10">
        <h2 className="field-label text-sm">
          Off the clock
        </h2>
        {/* Erich's copy, 2026-09-20. */}
        <div className="mt-6 text-pretty space-y-5 leading-relaxed text-ink/85">
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
            weather cooperates. Our son is due in the fall of 2026. It goes without
            saying that I have been told this will reorganize all of the above.
          </p>
        </div>
      </div>

      <div className="mt-14 border-t-2 border-line pt-10">
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
